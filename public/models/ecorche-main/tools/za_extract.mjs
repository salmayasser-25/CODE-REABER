// Pull the Z-Anatomy meshes out of BodyExplorer's anatomy.glb (BP3D millimetre frame) into OBJ files
import fs from 'fs';
const buf = fs.readFileSync('sources/bodyexplorer/anatomy.glb');
const jl = buf.readUInt32LE(12); const G = JSON.parse(buf.slice(20, 20 + jl).toString('utf8'));
const binOff = 20 + jl + 8;
const map = JSON.parse(fs.readFileSync('sources/bodyexplorer/mesh_mapping.json', 'utf8'));
console.log('meshes', G.meshes.length, 'nodes', G.nodes.length, 'mapping', map.length, 'node0', JSON.stringify(G.nodes[0]).slice(0, 200));
const acc = (i) => { const a = G.accessors[i], bv = G.bufferViews[a.bufferView]; const o = binOff + (bv.byteOffset || 0) + (a.byteOffset || 0);
  const T = { 5126: Float32Array, 5125: Uint32Array, 5123: Uint16Array }[a.componentType]; const n = a.count * ({ SCALAR: 1, VEC3: 3 }[a.type]);
  return new T(buf.buffer.slice(buf.byteOffset + o, buf.byteOffset + o + n * T.BYTES_PER_ELEMENT)); };
fs.mkdirSync('za', { recursive: true });
const out = [];
G.nodes.forEach((nd) => {
  if (nd.mesh == null) return; const m = G.meshes[nd.mesh]; const name = nd.name || m.name;
  const mm = map.find((x) => x.name === name); if (!mm || mm.source === 'bp3d') return;
  if (nd.matrix || nd.translation || nd.scale || nd.rotation) console.log('node transform!', name);
  const pr = m.primitives[0]; const P = acc(pr.attributes.POSITION), I = acc(pr.indices);
  const file = 'ZA_' + name.replace(/\s+/g, '_');
  let s = ''; for (let i = 0; i < P.length; i += 3) s += `v ${P[i]} ${P[i + 1]} ${P[i + 2]}\n`;
  for (let i = 0; i < I.length; i += 3) s += `f ${I[i] + 1} ${I[i + 1] + 1} ${I[i + 2] + 1}\n`;
  fs.writeFileSync('za/' + file + '.obj', s);
  let b = [1e9, 1e9, 1e9, -1e9, -1e9, -1e9]; for (let i = 0; i < P.length; i += 3) for (let k = 0; k < 3; k++) { b[k] = Math.min(b[k], P[i + k]); b[k + 3] = Math.max(b[k + 3], P[i + k]); }
  out.push({ file, name, nv: P.length / 3, tris: I.length / 3, bounds: b.map((x) => +x.toFixed(1)) });
});
fs.writeFileSync('za/index.json', JSON.stringify(out, null, 0));
out.forEach((o) => console.log(o.name.padEnd(48), o.tris, o.bounds.join(' ')));
