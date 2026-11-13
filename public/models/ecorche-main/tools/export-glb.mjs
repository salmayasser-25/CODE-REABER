// Write the figure as standard glTF 2.0 binaries: one named mesh per anatomical structure, grouped by layer.
//   ecorche.glb          quantized (KHR_mesh_quantization), opens in Blender, three.js, Babylon, model-viewer...
//   ecorche.meshopt.glb  same content, compressed with EXT_meshopt_compression for the web
// Positions are int16 in units of 0.1 mm under a root node scaled by 1e-4 (metres, Y up, feet on y = 0, facing +Z).
import fs from 'fs';

const SIDE = { L: 'left', R: 'right', C: 'midline' };
const LAYER = { bone: 'skeleton', deep: 'deep muscles', sup: 'superficial muscles' };
const BONE_RGB = [[232, 224, 206], [214, 222, 224], [244, 244, 240], [240, 236, 222]]; // bone, cartilage, eye, tooth
const MUSCLE_RGB = [168, 62, 52], TENDON_RGB = [226, 214, 196];

// tendon amount per vertex, the same rule the original web viewer applies at load time: the ends of each muscle along its main
// axis turn to tendon, whole-tendon structures stay pale, and the data marks the flat aponeuroses on top of that
function tendonMap(parts, MI) {
  const groups = new Map();
  for (const p of parts) { if (p.layer === 'bone') continue; if (!groups.has(p.key)) groups.set(p.key, []); groups.get(p.key).push(p); }
  const sm = (e0, e1, x) => { const u = Math.min(1, Math.max(0, (x - e0) / (e1 - e0))); return u * u * (3 - 2 * u); };
  for (const [key, ps] of groups) {
    const M = MI[key]; let n = 0; const c = [0, 0, 0], C = [0, 0, 0, 0, 0, 0];
    for (const p of ps) for (let v = 0; v < p.pos.length; v += 3) { const x = p.pos[v], y = p.pos[v + 1], z = p.pos[v + 2]; n++; c[0] += x; c[1] += y; c[2] += z; C[0] += x * x; C[1] += y * y; C[2] += z * z; C[3] += x * y; C[4] += x * z; C[5] += y * z; }
    c[0] /= n; c[1] /= n; c[2] /= n;
    const A = [[C[0] / n - c[0] * c[0], C[3] / n - c[0] * c[1], C[4] / n - c[0] * c[2]], [0, C[1] / n - c[1] * c[1], C[5] / n - c[1] * c[2]], [0, 0, C[2] / n - c[2] * c[2]]];
    A[1][0] = A[0][1]; A[2][0] = A[0][2]; A[2][1] = A[1][2];
    // main axis by power iteration
    let e = [0.3, 1, 0.2];
    for (let it = 0; it < 60; it++) { const r = [0, 1, 2].map((i) => A[i][0] * e[0] + A[i][1] * e[1] + A[i][2] * e[2]); const l = Math.hypot(...r) || 1; e = r.map((x) => x / l); }
    let lo = Infinity, hi = -Infinity;
    for (const p of ps) { p.al = new Float32Array(p.pos.length / 3); for (let v = 0; v < p.al.length; v++) { const a = (p.pos[v * 3] - c[0]) * e[0] + (p.pos[v * 3 + 1] - c[1]) * e[1] + (p.pos[v * 3 + 2] - c[2]) * e[2]; p.al[v] = a; lo = Math.min(lo, a); hi = Math.max(hi, a); } }
    const len = hi - lo;
    for (const p of ps) {
      p.tn = new Float32Array(p.al.length);
      for (let v = 0; v < p.al.length; v++) {
        const t = (p.al[v] - lo) / Math.max(1e-6, len);
        let tn = M.tendon ? (/calcaneal/i.test(M.name) ? 0.9 : 0.5) : Math.min(1, (sm(0.09, 0, t) + sm(0.91, 1, t)) * 0.75) * (len > 0.12 ? 1 : 0.4);
        if (/iliocostalis lumborum|longissimus thoracis|multifidus/i.test(M.name)) tn = Math.max(tn, sm(1.03, 0.95, p.pos[v * 3 + 1]) * 0.9);
        p.tn[v] = Math.max(tn, p.info[v * 4 + 2] / 255);
      }
      delete p.al;
    }
  }
}

export function writeGlb(parts, MI, fma, outBase, ME) {
  tendonMap(parts, MI);
  const views = []; // { data: Uint8Array, stride, count, mode, target }
  const accessors = [], meshes = [], nodes = [], used = new Map();
  const view = (data, stride, count, mode, target) => { views.push({ data, stride, count, mode, target }); return views.length - 1; };
  const roots = { bone: [], deep: [], sup: [] };
  const materials = [
    { name: 'Bone', pbrMetallicRoughness: { baseColorFactor: [1, 1, 1, 1], metallicFactor: 0, roughnessFactor: 0.62 } },
    { name: 'Muscle', pbrMetallicRoughness: { baseColorFactor: [1, 1, 1, 1], metallicFactor: 0, roughnessFactor: 0.48 } }
  ];
  const order = { bone: 0, deep: 1, sup: 2 };
  const sorted = parts.slice().sort((a, b) => order[a.layer] - order[b.layer] || a.name.localeCompare(b.name));
  for (const p0 of sorted) {
    // vertex and triangle order tuned for compression (same surface, same vertices)
    const idx = Uint32Array.from(p0.idx), [remap, nv] = ME.reorderMesh(idx, true, true), n0 = p0.pos.length / 3;
    const re = (src, size) => { const out = new src.constructor(nv * size); for (let v = 0; v < n0; v++) { const r = remap[v]; if (r === 0xffffffff) continue; for (let k = 0; k < size; k++) out[r * size + k] = src[v * size + k]; } return out; };
    const p = { ...p0, idx, pos: re(p0.pos, 3), nrm: re(p0.nrm, 3), info: re(p0.info, 4), tn: p0.tn && re(p0.tn, 1) };
    const ni = idx.length;
    // positions: int16, 0.1 mm
    const P = new Int16Array(nv * 4); const mn = [32767, 32767, 32767], mx = [-32768, -32768, -32768];
    for (let v = 0; v < nv; v++) for (let k = 0; k < 3; k++) { const q = Math.round(p.pos[v * 3 + k] * 10000); P[v * 4 + k] = q; mn[k] = Math.min(mn[k], q); mx[k] = Math.max(mx[k], q); }
    const N = new Int8Array(nv * 4);
    for (let v = 0; v < nv; v++) for (let k = 0; k < 3; k++) N[v * 4 + k] = Math.round(p.nrm[v * 3 + k] * 127);
    // colour: tissue tint times the baked ambient occlusion
    const hasAo = p.info.some((x, i) => i % 4 === 3 && x > 0);
    const Cc = new Uint8Array(nv * 4);
    for (let v = 0; v < nv; v++) {
      let rgb;
      if (p.layer === 'bone') rgb = BONE_RGB[p.info[v * 4]] || BONE_RGB[0];
      else { const t = p.tn[v]; rgb = MUSCLE_RGB.map((m, k) => m + (TENDON_RGB[k] - m) * t); }
      const ao = hasAo ? 0.55 + 0.45 * (p.info[v * 4 + 3] / 255) : 1;
      // glTF vertex colours are linear: convert from the sRGB tints above
      for (let k = 0; k < 3; k++) Cc[v * 4 + k] = Math.round(Math.pow(Math.min(1, rgb[k] * ao / 255), 2.2) * 255); Cc[v * 4 + 3] = 255;
    }
    const big = nv > 65535;
    const I = big ? Uint32Array.from(p.idx) : Uint16Array.from(p.idx);
    const aP = accessors.push({ bufferView: view(new Uint8Array(P.buffer), 8, nv, 'ATTRIBUTES', 34962), componentType: 5122, count: nv, type: 'VEC3', min: mn, max: mx }) - 1;
    const aN = accessors.push({ bufferView: view(new Uint8Array(N.buffer), 4, nv, 'ATTRIBUTES', 34962), componentType: 5120, normalized: true, count: nv, type: 'VEC3' }) - 1;
    const aC = accessors.push({ bufferView: view(Cc, 4, nv, 'ATTRIBUTES', 34962), componentType: 5121, normalized: true, count: nv, type: 'VEC4' }) - 1;
    const aI = accessors.push({ bufferView: view(new Uint8Array(I.buffer), big ? 4 : 2, ni, 'TRIANGLES', 34963), componentType: big ? 5125 : 5123, count: ni, type: 'SCALAR' }) - 1;
    let name = p.name; const k = used.get(name) || 0; used.set(name, k + 1); if (k) name += ` (${k + 1})`;
    const mesh = meshes.push({ name, primitives: [{ attributes: { POSITION: aP, NORMAL: aN, COLOR_0: aC }, indices: aI, material: p.layer === 'bone' ? 0 : 1 }] }) - 1;
    const extras = { name, layer: LAYER[p.layer], side: SIDE[p.side] || 'midline', source: p.za ? 'Z-Anatomy' : 'BodyParts3D' };
    if (!p.za && fma[p.file]) extras.fma = fma[p.file];
    if (p.layer !== 'bone' && MI[p.key] && MI[p.key].name !== p.name.replace(/ (L|R)$/, '')) extras.group = MI[p.key].name;
    if (p.layer === 'bone') extras.tissue = ['bone', 'cartilage', 'eye', 'tooth'][p.info[0]] || 'bone';
    roots[p.layer].push(nodes.push({ name, mesh, extras }) - 1);
  }
  const groupNodes = ['bone', 'deep', 'sup'].map((L) => nodes.push({ name: { bone: 'Skeleton', deep: 'Deep muscles', sup: 'Superficial muscles' }[L], children: roots[L], extras: { layer: LAYER[L] } }) - 1);
  const root = nodes.push({ name: 'Ecorche', scale: [1e-4, 1e-4, 1e-4], children: groupNodes }) - 1;
  const asset = { version: '2.0', generator: 'ecorche build (BodyParts3D + Z-Anatomy)', copyright: 'BodyParts3D (c) The Database Center for Life Science, CC BY 4.0; Z-Anatomy by Gauthier Kervyn, CC BY-SA 4.0; this derivative: CC BY-SA 4.0' };
  const base = { asset, scene: 0, scenes: [{ name: 'Ecorche', nodes: [root] }], nodes, meshes, materials, accessors };

  // plain: one buffer, views back to back
  {
    let off = 0; const bvs = [], chunks = [];
    for (const v of views) { const pad = (4 - (off % 4)) % 4; if (pad) { chunks.push(new Uint8Array(pad)); off += pad; } bvs.push({ buffer: 0, byteOffset: off, byteLength: v.data.byteLength, ...(v.target === 34962 ? { byteStride: v.stride } : {}), target: v.target }); chunks.push(v.data); off += v.data.byteLength; }
    const json = { ...base, extensionsUsed: ['KHR_mesh_quantization'], extensionsRequired: ['KHR_mesh_quantization'], bufferViews: bvs, buffers: [{ byteLength: off }] };
    fs.writeFileSync(outBase + '.glb', glb(json, chunks, off));
  }
  // meshopt: compressed views in buffer 0 (the BIN chunk), uncompressed layout described by a fallback buffer 1
  {
    let off = 0, coff = 0; const bvs = [], chunks = [];
    for (const v of views) {
      const enc = ME.encodeGltfBuffer(v.data, v.count, v.stride, v.mode);
      const pad = (4 - (off % 4)) % 4; off += pad;
      bvs.push({ buffer: 1, byteOffset: off, byteLength: v.data.byteLength, ...(v.target === 34962 ? { byteStride: v.stride } : {}), target: v.target,
        extensions: { EXT_meshopt_compression: { buffer: 0, byteOffset: coff, byteLength: enc.byteLength, byteStride: v.stride, count: v.count, mode: v.mode } } });
      off += v.data.byteLength;
      chunks.push(enc); coff += enc.byteLength; const cp = (4 - (coff % 4)) % 4; if (cp) { chunks.push(new Uint8Array(cp)); coff += cp; }
    }
    const json = { ...base, extensionsUsed: ['KHR_mesh_quantization', 'EXT_meshopt_compression'], extensionsRequired: ['KHR_mesh_quantization', 'EXT_meshopt_compression'], bufferViews: bvs,
      buffers: [{ byteLength: coff }, { byteLength: off, extensions: { EXT_meshopt_compression: { fallback: true } } }] };
    fs.writeFileSync(outBase + '.meshopt.glb', glb(json, chunks, coff));
  }
  // structure list
  const list = nodes.filter((n) => n.mesh != null).map((n) => ({ name: n.name, ...n.extras }));
  fs.writeFileSync(outBase + '.structures.json', JSON.stringify(list, null, 1));
  return list.length;
}

function glb(json, chunks, binLen) {
  let js = Buffer.from(JSON.stringify(json), 'utf8'); const jp = (4 - (js.length % 4)) % 4; if (jp) js = Buffer.concat([js, Buffer.alloc(jp, 0x20)]);
  const bp = (4 - (binLen % 4)) % 4;
  const bin = Buffer.concat([...chunks.map((c) => Buffer.from(c.buffer, c.byteOffset, c.byteLength)), Buffer.alloc(bp)]);
  const h = Buffer.alloc(12); h.writeUInt32LE(0x46546c67, 0); h.writeUInt32LE(2, 4); h.writeUInt32LE(12 + 8 + js.length + 8 + bin.length, 8);
  const jh = Buffer.alloc(8); jh.writeUInt32LE(js.length, 0); jh.writeUInt32LE(0x4e4f534a, 4);
  const bh = Buffer.alloc(8); bh.writeUInt32LE(bin.length, 0); bh.writeUInt32LE(0x004e4942, 4);
  return Buffer.concat([h, jh, js, bh, bin]);
}
