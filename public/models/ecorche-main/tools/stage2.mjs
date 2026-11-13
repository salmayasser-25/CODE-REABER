// Stage 2: simplify, compute skin weights, zones and AO, encode.
import fs from 'fs';
import { MeshoptSimplifier as MS, MeshoptEncoder as ME } from 'meshoptimizer';
import { computeNormals, compact, pca, smooth, segDist, bounds, centroidWhere, weld } from './lib.mjs';
import { resolveLayers } from './layering.mjs';
import { wrapSurface } from './remesh.mjs';
await MS.ready; await ME.ready;

const t0 = Date.now();
const meta = JSON.parse(fs.readFileSync('cache.json', 'utf8'));
const bin = fs.readFileSync('cache.bin');
const BONES = meta.bones, BI = Object.fromEntries(BONES.map((b, i) => [b[0], i]));
const J = meta.joints;
const getPart = (p) => weld(new Float32Array(bin.buffer.slice(bin.byteOffset + p.po, bin.byteOffset + p.po + p.nv * 12)), new Uint32Array(bin.buffer.slice(bin.byteOffset + p.io, bin.byteOffset + p.io + p.ni * 4)));
const findPart = (name) => meta.parts.find((p) => p.name.toLowerCase() === name.toLowerCase());
const partPos = (name) => getPart(findPart(name)).pos;
const ZONES = ['head', 'neck', 'shoulder', 'chest', 'midback', 'lowback', 'hipflex', 'hips', 'hamstrings', 'knee', 'calves', 'forearm'];
const ZI = Object.fromEntries(ZONES.map((z, i) => [z, i]));

// ---------- landmarks (scene space, meters) ----------
const hipBoneL = partPos('Left hip bone'), hbL = bounds(hipBoneL);
const crestL = (() => { let best = null; for (let i = 0; i < hipBoneL.length; i += 3) if (!best || hipBoneL[i + 1] > best[1]) best = [hipBoneL[i], hipBoneL[i + 1], hipBoneL[i + 2]]; return best; })();
const pubisTop = centroidWhere(hipBoneL, (x, y, z) => x < hbL[0] + 0.012 && z > hbL[5] - 0.03);
const scapL = partPos('Left scapula'); const infAngle = (() => { let b = null; for (let i = 0; i < scapL.length; i += 3) if (!b || scapL[i + 1] < b[1]) b = [scapL[i], scapL[i + 1], scapL[i + 2]]; return b; })();
const manu = partPos('Manubrium'), xiph = partPos('Xiphoid process');
const sternTop = [0, bounds(manu)[4], bounds(manu)[5] - 0.01], xiphBot = [0, bounds(xiph)[1], bounds(xiph)[5] - 0.005];
const calcL = partPos('Left calcaneus'); const heelL = (() => { let b = null; for (let i = 0; i < calcL.length; i += 3) if (!b || calcL[i + 2] < b[2]) b = [calcL[i], calcL[i + 1], calcL[i + 2]]; return b; })();
const V = J.vb;
console.log('landmarks', { crestL, pubisTop, infAngle, sternTop, xiphBot, heelL });

// bone proxies for skin weighting (segments per rig bone)
const mx = (p) => [-p[0], p[1], p[2]];
const seg = (n) => [BONES[BI[n]][2], BONES[BI[n]][3]];
const PROX = {};
BONES.forEach((b) => (PROX[b[0]] = [[b[2], b[3]]]));
const L5S1 = BONES[BI.spineL][2];
PROX.pelvis = [[J.hip, mx(J.hip)], [L5S1, J.hip], [L5S1, mx(J.hip)], [crestL, J.hip], [mx(crestL), mx(J.hip)], [crestL, L5S1], [mx(crestL), L5S1], [pubisTop, J.hip], [mx(pubisTop), mx(J.hip)]];
const ribL = [0.125, 1.3, -0.005], ribLowL = [0.13, 1.17, 0.0];
PROX.chest = [seg('chest'), [sternTop, xiphBot], [ribL, ribLowL], [mx(ribL), mx(ribLowL)], [sternTop, ribL], [sternTop, mx(ribL)]];
PROX.spineT = [seg('spineT'), [ribLowL, [0.12, 1.1, 0.0]], [mx(ribLowL), [-0.12, 1.1, 0.0]], [xiphBot, ribLowL], [xiphBot, mx(ribLowL)]];
PROX.spineL = [seg('spineL'), [[0.06, 1.15, 0.04], [0.07, 1.04, 0.03]], [[-0.06, 1.15, 0.04], [-0.07, 1.04, 0.03]]];
PROX.clavicle_L = [seg('clavicle_L'), [J.shoulder, infAngle], [[0.07, 1.36, -0.08], infAngle]];
PROX.clavicle_R = PROX.clavicle_L.map(([a, b]) => [mx(a), mx(b)]);
PROX.foot_L = [seg('foot_L'), [J.ankle, heelL], [heelL, J.toe]];
PROX.foot_R = PROX.foot_L.map(([a, b]) => [mx(a), mx(b)]);
PROX.head = [seg('head'), [[0, 1.6, 0.06], [0, 1.56, 0.08]], [[0, 1.63, -0.06], [0, 1.64, 0.05]]];

// ---------- tables ----------
const sideB = (n, s) => (['clavicle', 'upperarm', 'forearm', 'hand', 'thigh', 'shin', 'foot'].includes(n) ? n + '_' + (s === 'R' ? 'R' : 'L') : n);
const MB = [
  [/sternocleidomastoid/, ['head', 'neck', 'chest']],
  [/descending part of trapezius/, ['head', 'neck', 'chest', 'clavicle']],
  [/transverse part of trapezius/, ['neck', 'chest', 'clavicle']],
  [/ascending part of trapezius/, ['spineT', 'chest', 'clavicle']],
  [/levator scapulae/, ['neck', 'clavicle']],
  [/splenius capitis|longissimus capitis|semispinalis capitis/, ['head', 'neck', 'chest']],
  [/splenius cervicis|longissimus cervicis|iliocostalis cervicis|semispinalis cervicis/, ['neck', 'chest']],
  [/sternohyoid|omohyoid|sternothyroid|thyrohyoid/, ['head', 'neck', 'chest']],
  [/deltoid/, ['clavicle', 'upperarm']],
  [/infraspinatus|supraspinatus|teres major|teres minor/, ['clavicle', 'upperarm']],
  [/pectoralis major/, ['chest', 'clavicle', 'upperarm']],
  [/pectoralis minor|subclavius/, ['chest', 'clavicle']],
  [/serratus anterior/, ['chest', 'spineT', 'clavicle']],
  [/external oblique|internal oblique|transversus abdominis|linea alba|rectus abdominis/, ['chest', 'spineT', 'spineL', 'pelvis']],
  [/quadratus lumborum|thoracolumbar fascia|multifidus lumborum/, ['pelvis', 'spineL', 'spineT']],
  [/multifidus cervicis/, ['head', 'neck', 'chest']],
  [/multifidus thoracis/, ['neck', 'chest', 'spineT', 'spineL']],
  [/rotatores/, ['neck', 'chest', 'spineT', 'spineL', 'pelvis']],
  [/subscapularis/, ['clavicle', 'upperarm']],
  [/latissimus/, ['pelvis', 'spineL', 'spineT', 'chest', 'clavicle', 'upperarm']],
  [/biceps brachii|long head of triceps/, ['clavicle', 'upperarm', 'forearm']],
  [/triceps|brachialis|anconeus/, ['upperarm', 'forearm']],
  [/coracobrachialis/, ['clavicle', 'upperarm']],
  [/brachioradialis|pronator teres|flexor carpi|palmaris|flexor digitorum superficialis|extensor carpi|^extensor digitorum$|extensor digiti minimi|supinator/, ['upperarm', 'forearm', 'hand']],
  [/abductor pollicis longus|extensor pollicis|flexor digitorum profundus|flexor pollicis longus|pronator quadratus|extensor indicis/, ['forearm', 'hand']],
  [/gluteus|piriformis|gemellus|obturator|quadratus femoris|pectineus|adductor brevis|adductor longus|adductor minimus/, ['pelvis', 'thigh']],
  [/adductor magnus/, ['pelvis', 'thigh', 'shin']],
  [/tensor fasciae latae|iliotibial tract|sartorius|rectus femoris|gracilis|long head of biceps femoris|semitendinosus|semimembranosus/, ['pelvis', 'thigh', 'shin']],
  [/vastus|short head of biceps femoris|popliteus/, ['thigh', 'shin']],
  [/gastrocnemius|plantaris/, ['thigh', 'shin', 'foot']],
  [/soleus|calcaneal tendon|tibialis|extensor digitorum longus|extensor hallucis longus|fibularis|flexor digitorum longus|flexor hallucis longus/, ['shin', 'foot']],
  [/rhomboid/, ['chest', 'clavicle']],
  [/serratus posterior superior/, ['neck', 'chest']],
  [/serratus posterior inferior/, ['spineT', 'spineL']],
  [/iliocostalis lumborum|longissimus thoracis/, ['pelvis', 'spineL', 'spineT', 'chest']],
  [/iliocostalis thoracis|spinalis thoracis|semispinalis thoracis/, ['spineL', 'spineT', 'chest']],
  [/scalenus/, ['neck', 'chest']],
  [/rectus capitis|obliquus capitis/, ['head', 'neck']],
  [/external intercostal/, ['chest', 'spineT', 'spineL']],
  [/psoas major/, ['spineT', 'spineL', 'pelvis', 'thigh']],
  [/iliacus/, ['pelvis', 'thigh']],
  [/temporalis|masseter|pterygoid|frontalis|orbicularis|zygomaticus|levator labii|depressor|risorius|mentalis|procerus|nasalis|corrugator/, ['head']],
  [/flexor retinaculum/, ['forearm', 'hand']],
  [/of hand$|pollicis brevis|opponens pollicis|adductor pollicis/, ['hand']],
  [/of foot$|hallucis brevis|abductor hallucis|adductor hallucis|digitorum brevis/, ['foot']]
];
// zones: [zone, weight, optional y-window [y0, y1, soft]]
const MZ = [
  [/rectus abdominis|external oblique|internal oblique|transversus abdominis|linea alba/, [['chest', 0.26, [1.1, 1.18]], ['hipflex', 0.26, [1.16, 1.08]]]],
  [/quadratus lumborum|multifidus lumborum|thoracolumbar fascia/, [['lowback', 1]]],
  [/multifidus thoracis/, [['midback', 1]]],
  [/multifidus cervicis/, [['neck', 1]]],
  [/rotatores/, [['neck', 0.8, [1.35, 1.39]], ['midback', 0.8, [1.08, 1.14, 1.39, 1.35]], ['lowback', 0.8, [1.14, 1.08]]]],
  [/subscapularis/, [['shoulder', 1]]],
  [/rectus capitis|obliquus capitis/, [['head', 1]]],
  [/semispinalis capitis/, [['head', 0.7], ['neck', 0.8]]],
  [/descending part of trapezius|levator scapulae|sternocleidomastoid|splenius|scalenus|semispinalis cervicis|longissimus capitis|longissimus cervicis|iliocostalis cervicis/, [['neck', 1]]],
  [/sternohyoid|omohyoid|sternothyroid|thyrohyoid/, [['neck', 0.5]]],
  [/deltoid|infraspinatus|supraspinatus|teres minor/, [['shoulder', 1]]],
  [/teres major/, [['shoulder', 0.8], ['midback', 0.3]]],
  [/coracobrachialis/, [['shoulder', 0.6]]],
  [/pectoralis|subclavius|serratus anterior/, [['chest', 1]]],
  [/external intercostal/, [['chest', 1, null, 'front'], ['midback', 0.7, null, 'back']]],
  [/transverse part of trapezius|rhomboid|iliocostalis thoracis|spinalis thoracis|semispinalis thoracis|serratus posterior superior/, [['midback', 1]]],
  [/ascending part of trapezius/, [['midback', 0.8]]],
  [/longissimus thoracis/, [['midback', 1, [1.16, 1.24]], ['lowback', 1, [1.24, 1.16]]]],
  [/latissimus/, [['midback', 0.26, [1.14, 1.22]], ['lowback', 0.28, [1.22, 1.14]]]],
  [/iliocostalis lumborum/, [['lowback', 1]]],
  [/serratus posterior inferior/, [['lowback', 0.7]]],
  [/psoas major|iliacus/, [['hipflex', 1]]],
  [/rectus femoris/, [['hipflex', 1, [0.66, 0.74]], ['knee', 0.8, [0.62, 0.54]]]],
  [/sartorius/, [['hipflex', 0.6, [0.7, 0.78]], ['knee', 0.5, [0.55, 0.47]]]],
  [/pectineus/, [['hipflex', 0.8]]],
  [/tensor fasciae latae/, [['hips', 0.8], ['hipflex', 0.5]]],
  [/gluteus|piriformis|gemellus|obturator|quadratus femoris/, [['hips', 1]]],
  [/biceps femoris|semitendinosus|semimembranosus/, [['hamstrings', 1]]],
  [/adductor magnus/, [['hamstrings', 0.5]]],
  [/vastus medialis|vastus lateralis/, [['knee', 1, [0.7, 0.6]]]],
  [/vastus intermedius/, [['knee', 0.7, [0.66, 0.56]]]],
  [/iliotibial tract/, [['knee', 1, [0.64, 0.54]], ['hips', 0.5, [0.8, 0.9]]]],
  [/popliteus/, [['knee', 1]]],
  [/gracilis/, [['knee', 0.4, [0.56, 0.48]]]],
  [/gastrocnemius|soleus|calcaneal tendon|tibialis|fibularis|extensor digitorum longus|extensor hallucis longus|plantaris|flexor digitorum longus|flexor hallucis longus/, [['calves', 1]]],
  [/brachioradialis|pronator|flexor carpi|palmaris|flexor digitorum superficialis|flexor digitorum profundus|extensor carpi|^extensor digitorum$|extensor digiti minimi|supinator|abductor pollicis longus|extensor pollicis|flexor pollicis longus|extensor indicis/, [['forearm', 1]]],
  [/anconeus/, [['forearm', 0.6]]],
  [/temporalis|masseter/, [['head', 1]]],
  [/pterygoid/, [['head', 0.8]]],
  [/frontalis/, [['head', 0.35]]],
  [/flexor retinaculum/, [['forearm', 0.8]]],
  [/abductor hallucis|flexor digitorum brevis|abductor digiti minimi of foot/, [['calves', 0.35]]]
];
const TENDON_PART = /calcaneal tendon|iliotibial tract|linea alba|thoracolumbar fascia|flexor retinaculum/;
// small neighbouring muscles share one label (the meshes stay separate)
const GROUP = [[/rectus capitis posterior|obliquus capitis/, 'suboccipital muscles'], [/sternohyoid|omohyoid|sternothyroid|thyrohyoid/, 'infrahyoid muscles'], [/gemellus/, 'gemelli'], [/multifidus/, 'multifidus'], [/thoracolumbar fascia/, 'thoracolumbar fascia'],
  [/masseter/, 'masseter'], [/orbicularis oculi/, 'orbicularis oculi'], [/lateral pterygoid/, 'lateral pterygoid'],
  [/adductor pollicis/, 'adductor pollicis'], [/dorsal interossei of hand/, 'dorsal interossei of hand'], [/palmar interossei of hand/, 'palmar interossei of hand'], [/lumbricals of hand/, 'lumbricals of hand'],
  [/adductor hallucis/, 'adductor hallucis'], [/flexor hallucis brevis/, 'flexor hallucis brevis'], [/lumbrical of foot/, 'lumbricals of foot'], [/plantar interosseous of foot/, 'plantar interossei of foot']];

// ---------- part assembly ----------
const parts = []; // {name, base, side, layer, kind, pos, idx, extra}
const simplify = (pos, idx, ratio, err, minTris, flags = []) => {
  const tri = idx.length / 3;
  const target = Math.max(minTris, Math.floor(tri * ratio));
  if (target >= tri) return idx;
  const [out] = MS.simplify(idx, pos, 3, target * 3, err, ['ErrorAbsolute', ...flags]);
  return out;
};
const RATIO = { sup: [0.45, 0.0004, 160], deep: [0.32, 0.0005, 120], bone: [0.4, 0.0003, 120], cart: [0.35, 0.0004, 64], eye: [0.05, 0.0002, 700] };
// the Z-Anatomy face muscles arrive as thin, low-poly shells with zigzag rims: split every triangle in four,
// Taubin-smooth (shape and thickness kept, zigzags gone), then simplify back to about twice the original count
const FACE_ZA = /temporalis|masseter|pterygoid|frontalis|orbicularis|zygomaticus|levator labii|depressor|risorius|mentalis|procerus|nasalis|corrugator/;
function smoothSubdivide(pos, idx, iters) {
  const P = Array.from(pos), mid = new Map(), I = [];
  const m = (a, b) => { const k = a < b ? a * 1e7 + b : b * 1e7 + a; let v = mid.get(k); if (v === undefined) { v = P.length / 3; P.push((P[a * 3] + P[b * 3]) / 2, (P[a * 3 + 1] + P[b * 3 + 1]) / 2, (P[a * 3 + 2] + P[b * 3 + 2]) / 2); mid.set(k, v); } return v; };
  for (let t = 0; t < idx.length; t += 3) { const a = idx[t], b = idx[t + 1], c = idx[t + 2], ab = m(a, b), bc = m(b, c), ca = m(c, a); I.push(a, ab, ca, ab, b, bc, ca, bc, c, ab, bc, ca); }
  const n = P.length / 3, nb = Array.from({ length: n }, () => new Set());
  for (let t = 0; t < I.length; t += 3) for (let k = 0; k < 3; k++) { const a = I[t + k], b = I[t + (k + 1) % 3]; nb[a].add(b); nb[b].add(a); }
  const N = nb.map((s) => [...s]);
  let cur = new Float64Array(P);
  for (let it = 0; it < iters; it++) for (const f of [0.5, -0.53]) {
    const nxt = new Float64Array(cur.length);
    for (let v = 0; v < n; v++) { let x = 0, y = 0, z = 0; for (const u of N[v]) { x += cur[u * 3]; y += cur[u * 3 + 1]; z += cur[u * 3 + 2]; } const k = N[v].length || 1; nxt[v * 3] = cur[v * 3] + f * (x / k - cur[v * 3]); nxt[v * 3 + 1] = cur[v * 3 + 1] + f * (y / k - cur[v * 3 + 1]); nxt[v * 3 + 2] = cur[v * 3 + 2] + f * (z / k - cur[v * 3 + 2]); }
    cur = nxt;
  }
  const out = new Float32Array(cur), oi = new Uint32Array(I);
  const [si] = MS.simplify(oi, out, 3, Math.floor(oi.length / 2 / 3) * 3, 0.00025, ['ErrorAbsolute']);
  return compact(out, si);
}
// midpoint subdivision, shape unchanged
function splitFour(pos, idx) {
  const P = Array.from(pos), mid = new Map(), I = [];
  const m = (a, b) => { const k = a < b ? a * 1e7 + b : b * 1e7 + a; let v = mid.get(k); if (v === undefined) { v = P.length / 3; P.push((P[a * 3] + P[b * 3]) / 2, (P[a * 3 + 1] + P[b * 3 + 1]) / 2, (P[a * 3 + 2] + P[b * 3 + 2]) / 2); mid.set(k, v); } return v; };
  for (let t = 0; t < idx.length; t += 3) { const a = idx[t], b = idx[t + 1], c = idx[t + 2], ab = m(a, b), bc = m(b, c), ca = m(c, a); I.push(a, ab, ca, ab, b, bc, ca, bc, c, ab, bc, ca); }
  return { pos: new Float32Array(P), idx: new Uint32Array(I) };
}
// Taubin smoothing (shrink-free): removes surface relief while keeping the overall shape
function taubin(pos, idx, iters) {
  const n = pos.length / 3, nb = Array.from({ length: n }, () => new Set());
  for (let t = 0; t < idx.length; t += 3) for (let k = 0; k < 3; k++) { const a = idx[t + k], b = idx[t + (k + 1) % 3]; nb[a].add(b); nb[b].add(a); }
  const N = nb.map((s) => [...s]); let cur = Float64Array.from(pos);
  for (let it = 0; it < iters; it++) for (const f of [0.5, -0.53]) {
    const nxt = new Float64Array(cur.length);
    for (let v = 0; v < n; v++) { let x = 0, y = 0, z = 0; for (const u of N[v]) { x += cur[u * 3]; y += cur[u * 3 + 1]; z += cur[u * 3 + 2]; } const k = N[v].length || 1; for (let c = 0; c < 3; c++) nxt[v * 3 + c] = cur[v * 3 + c] + f * ([x, y, z][c] / k - cur[v * 3 + c]); }
    cur = nxt;
  }
  return { pos: new Float32Array(cur), idx };
}
// BodyParts3D sculpts the external oblique and serratus anterior as hundreds of fibre bundles; seen through the
// translucent shell they read as fur. Smooth them like the flat sheets they are, and drop the loose bundle crumbs.
const FIBRE_RELIEF = /^(external oblique|serratus anterior)$/;
const tri3 = (idx) => idx.length / 3;
// loose crumbs of a few vertices next to the eyeball would float in front of the face
function dropSpecks(c, minV) {
  const n = c.pos.length / 3, par = new Int32Array(n).map((_, i) => i);
  const f = (a) => { while (par[a] !== a) a = par[a] = par[par[a]]; return a; };
  for (let t = 0; t < c.idx.length; t += 3) { const a = f(c.idx[t]); par[f(c.idx[t + 1])] = a; par[f(c.idx[t + 2])] = a; }
  const size = new Map(); for (let v = 0; v < n; v++) { const r = f(v); size.set(r, (size.get(r) || 0) + 1); }
  const keep = []; for (let t = 0; t < c.idx.length; t += 3) if (size.get(f(c.idx[t])) >= minV) keep.push(c.idx[t], c.idx[t + 1], c.idx[t + 2]);
  return compact(c.pos, new Uint32Array(keep));
}
for (const p of meta.parts) {
  if (p.cat === 'skin') continue;
  const { pos, idx } = getPart(p);
  const [r, e, m] = RATIO[p.cat];
  let ratio = r;
  if (/scapula|ethmoid|sphenoid|temporal bone|vomer|palatine|lacrimal|inferior nasal concha/i.test(p.name)) ratio = r * 0.7;
  if (/external intercostal/i.test(p.name)) ratio = 0.4;
  if (/tooth/i.test(p.name)) ratio = 0.3;
  if (/external ear/i.test(p.name)) ratio = 0.6;
  if (p.za) ratio = 1; // already decimated to ~4000 faces upstream
  const si = simplify(pos, idx, ratio, e, m);
  let c = compact(pos, si);
  if (p.cat === 'eye') c = dropSpecks(c, 40);
  if (FIBRE_RELIEF.test(p.base)) {
    // rebuilt from the full-resolution mesh as one clean surface, then smoothed and brought back to a sensible count
    const tw = Date.now(); let w = wrapSurface(pos, idx, 0.0011, 0.0011); w = taubin(w.pos, w.idx, 25);
    const [ws] = MS.simplify(w.idx, w.pos, 3, Math.floor(Math.min(w.idx.length, tri3(idx) * ratio * 3) / 3) * 3, 0.0004, ['ErrorAbsolute']);
    c = dropSpecks(compact(w.pos, ws), 200);
    console.log('wrapped', p.name, w.idx.length / 3, '->', c.idx.length / 3, 'tris in', Date.now() - tw, 'ms');
  }
  const faceZA = p.za && FACE_ZA.test(p.base);
  if (faceZA) c = smoothSubdivide(c.pos, c.idx, 6);
  // the Z-Anatomy trunk sheets are coarse (8 mm triangles): split each triangle in four so they can drape over the
  // BodyParts3D muscles beneath them without folding
  else if (p.za && p.cat === 'sup') c = splitFour(c.pos, c.idx);
  const layer = p.cat === 'sup' ? 'sup' : p.cat === 'deep' ? 'deep' : 'bone';
  const grp = GROUP.find(([rx]) => rx.test(p.base));
  const key = (grp ? grp[1] : p.base) + '|' + p.side;
  // superficial muscles: a hair of inflation closes the hairline gaps between neighbours
  if (layer === 'sup' && !TENDON_PART.test(p.base) && !faceZA) { const n = computeNormals(c.pos, c.idx); for (let i = 0; i < c.pos.length; i++) c.pos[i] += n[i] * 0.0012; }
  parts.push({ name: p.name, base: p.base, side: p.side, layer, kind: p.cat, pos: c.pos, idx: c.idx, key, group: grp ? grp[1] : null, za: p.za || 0, file: p.file });
}
console.log('simplified', parts.length, 'parts in', Date.now() - t0, 'ms');

// ---------- layers: every part tucked behind the parts that cover it (no crossings, same on both sides) ----------
if (!process.env.NOLAYER) resolveLayers(parts, getPart(findPart('Skin')), MS, {
  // where the two datasets disagree, follow the anatomy: the lower trapezius covers the upper latissimus
  overrides: [[/trapezius/, /latissimus/]],
  debug: process.env.DBG ? new RegExp(process.env.DBG) : null,
  probe: process.env.PROBE ? new RegExp(process.env.PROBE) : null,
  // the face is all Z-Anatomy, thin muscles lying on bone, already clean: left as it is
  skip: FACE_ZA,
  log: (...a) => console.log(...a)
});
console.log('layers in', Date.now() - t0, 'ms');

// abdominal landmarks (pregnancy belly)
const yPub = pubisTop[1], yXi = xiphBot[1], yUmb = yPub + (yXi - yPub) * 0.42;

// ---------- muscle table ----------
const muscleParts = parts.filter((p) => p.layer !== 'bone');
const keys = []; muscleParts.forEach((p) => { if (!keys.includes(p.key)) keys.push(p.key); });
if (keys.length > 511) throw new Error('too many muscles: ' + keys.length);
const SIDE = { L: 'Left ', R: 'Right ', C: '' };
const MUS = keys.map((k, i) => { const p = muscleParts.find((q) => q.key === k); const name = p.group ? SIDE[p.side] + p.group : p.name.replace(/ (L|R)$/, ''); return { idx: i + 1, key: k, name: name[0].toUpperCase() + name.slice(1), base: p.base, side: p.side, layer: p.layer, kind: p.kind }; });
const MI = Object.fromEntries(MUS.map((m) => [m.key, m]));
// zone and bone rules per part (a grouped label can span several parts), summarised per label
muscleParts.forEach((p) => {
  const rule = MZ.find(([rx]) => rx.test(p.base)); p.mz = rule ? rule[1] : [];
  const br = MB.find(([rx]) => rx.test(p.base)); if (!br) throw new Error('no bones for ' + p.base); p.mb = br[1];
  p.tendon = TENDON_PART.test(p.base);
});
MUS.forEach((m) => {
  const z = {}; let tendon = true;
  muscleParts.filter((p) => p.key === m.key).forEach((p) => { p.mz.forEach(([zn, w]) => (z[zn] = Math.max(z[zn] || 0, w))); tendon = tendon && p.tendon; });
  m.zw = z; m.primary = Object.entries(z).sort((a, b) => b[1] - a[1])[0]?.[0] || null; m.tendon = tendon;
});

// ---------- per-part attributes ----------
const vertebraIndex = (name) => { const n = name.toLowerCase(); if (n === 'atlas') return 1; if (n === 'axis') return 2; const ord = ['first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth', 'ninth', 'tenth', 'eleventh', 'twelfth']; const m = n.match(/^(\w+) (cervical|thoracic|lumbar) vertebra$/); if (!m) return 0; const k = ord.indexOf(m[1]) + 1; return m[2] === 'cervical' ? k : m[2] === 'thoracic' ? 7 + k : 19 + k; };
const discIndex = (name) => { const m = name.toLowerCase().match(/intervertebral disk of (.*)$/); if (!m) return 0; return vertebraIndex(m[1]); };
// spine weights per vertebra level (1..24)
// levels: 1-7 cervical (C1..C7), 8-19 thoracic (T1..T12), 20-24 lumbar (L1..L5), 25 = sacrum
const SPW = (lvl) => {
  if (lvl <= 6) return { neck: 1 };
  if (lvl === 7) return { neck: 0.6, chest: 0.4 };
  if (lvl <= 13) return { chest: 1 };
  if (lvl === 14) return { chest: 0.7, spineT: 0.3 };
  if (lvl === 15) return { spineT: 0.7, chest: 0.3 };
  if (lvl <= 18) return { spineT: 1 };
  if (lvl === 19) return { spineT: 0.6, spineL: 0.4 };
  if (lvl === 20) return { spineL: 0.7, spineT: 0.3 };
  if (lvl <= 23) return { spineL: 1 };
  if (lvl === 24) return { spineL: 0.6, pelvis: 0.4 };
  return { pelvis: 1 };
};
function boneRule(p) {
  const n = p.base, s = p.side;
  if (/tooth/.test(n)) return { w: { head: 1 }, cls: 3 };
  if (/^(sclera|cornea)$/.test(n)) return { w: { head: 1 }, cls: 2 };
  if (/nasal cartilage|alar cartilage|external ear/.test(n)) return { w: { head: 1 }, cls: 1 };
  if (/frontal bone|parietal|occipital|temporal bone|sphenoid|ethmoid|maxilla|zygomatic|nasal bone|mandible|lacrimal|palatine|vomer|nasal concha/.test(n)) return { w: { head: 1 }, cls: 0 };
  const lv = vertebraIndex(p.name); if (lv) return { w: SPW(lv), cls: 0, vert: lv };
  const dl = discIndex(p.name); if (dl) { const a = SPW(dl), b = SPW(dl + 1); const w = {}; for (const [k, v] of Object.entries(a)) w[k] = (w[k] || 0) + v / 2; for (const [k, v] of Object.entries(b)) w[k] = (w[k] || 0) + v / 2; return { w, cls: 1, vert: dl }; }
  const rib = n.match(/^(\w+) rib$/); if (rib) { const k = ['first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth', 'ninth', 'tenth', 'eleventh', 'twelfth'].indexOf(rib[1]) + 1; return { w: k <= 10 ? { chest: 1 } : { spineT: 1 }, cls: 0 }; }
  if (/costal cartilage/.test(n)) return { w: { chest: 1 }, cls: 1 };
  if (/manubrium|body of sternum|xiphoid/.test(n)) return { w: { chest: 1 }, cls: 0 };
  if (/clavicle|scapula/.test(n)) return { w: { [sideB('clavicle', s)]: 1 }, cls: 0 };
  if (/humerus/.test(n)) return { w: { [sideB('upperarm', s)]: 1 }, cls: 0 };
  if (/radius|ulna/.test(n)) return { w: { [sideB('forearm', s)]: 1 }, cls: 0 };
  if (/scaphoid|lunate|triquetrum|pisiform|trapezium|trapezoid|capitate|hamate|metacarpal|thumb|finger/.test(n)) return { w: { [sideB('hand', s)]: 1 }, cls: 0 };
  if (/hip bone|sacrum|coccyx/.test(n)) return { w: { pelvis: 1 }, cls: 0 };
  if (/femur/.test(n)) return { w: { [sideB('thigh', s)]: 1 }, cls: 0 };
  if (/patella|tibia|fibula/.test(n)) return { w: { [sideB('shin', s)]: 1 }, cls: 0 };
  if (/talus|calcaneus|navicular|cuboid|cuneiform|metatarsal|toe/.test(n)) return { w: { [sideB('foot', s)]: 1 }, cls: 0 };
  throw new Error('no bone rule ' + p.name);
}
function weightsFor(pt, boneNames, sigma) {
  const ds = boneNames.map((b) => Math.min(...PROX[b].map(([a, c]) => segDist(pt, a, c))));
  const d0 = Math.min(...ds);
  let w = ds.map((d) => Math.exp(-(d - d0) / sigma));
  const order = w.map((v, i) => [v, i]).sort((a, b) => b[0] - a[0]).slice(0, 4);
  const tot = order.reduce((a, o) => a + o[0], 0);
  return order.map(([v, i]) => [BI[boneNames[i]], v / tot]);
}
const q8 = (w) => { const out = [0, 0, 0, 0], idx = [0, 0, 0, 0]; let acc = 0; w = w.filter(([, v]) => v >= 1 / 48); const tot = w.reduce((a, [, v]) => a + v, 0); w.forEach(([b], i) => { idx[i] = b; }); for (let i = 0; i < w.length; i++) { const q = i === w.length - 1 ? Math.max(0, 255 - acc) : Math.min(255 - acc, Math.round(w[i][1] / tot * 64) * 4); out[i] = q; acc += q; } return { idx, w: out }; };

// orientation: the Z-Anatomy meshes come wound inside out (faces pointing into the muscle), so a renderer that culls
// back faces shows their inner wall and they look hollow from outside. Wind every part outward before normals and AO.
{
  const flipped = [], sheets = [];
  for (const p of parts) {
    const P = p.pos, I = p.idx, nv = P.length / 3; let cx = 0, cy = 0, cz = 0;
    for (let v = 0; v < nv; v++) { cx += P[v * 3]; cy += P[v * 3 + 1]; cz += P[v * 3 + 2]; }
    cx /= nv; cy /= nv; cz /= nv;
    // closed surfaces: the enclosed volume must be positive. Open sheets (a fascia drawn as a single surface) have no
    // inside, so they face away from the long axis of the body instead.
    const edges = new Map();
    for (let t = 0; t < I.length; t += 3) for (let k = 0; k < 3; k++) { const u = I[t + k], w = I[t + (k + 1) % 3], key = u < w ? u * 4294967296 + w : w * 4294967296 + u; edges.set(key, (edges.get(key) || 0) + 1); }
    let open = 0; for (const n of edges.values()) if (n === 1) open++;
    const sheet = open > edges.size * 0.01;
    let s = 0;
    for (let t = 0; t < I.length; t += 3) {
      const a = I[t] * 3, b = I[t + 1] * 3, c = I[t + 2] * 3;
      const ux = P[b] - P[a], uy = P[b + 1] - P[a + 1], uz = P[b + 2] - P[a + 2], wx = P[c] - P[a], wy = P[c + 1] - P[a + 1], wz = P[c + 2] - P[a + 2];
      const fx = uy * wz - uz * wy, fy = uz * wx - ux * wz, fz = ux * wy - uy * wx;
      const mx = (P[a] + P[b] + P[c]) / 3, my = (P[a + 1] + P[b + 1] + P[c + 1]) / 3, mz = (P[a + 2] + P[b + 2] + P[c + 2]) / 3;
      s += sheet ? mx * fx + (mz - 0.02) * fz : (mx - cx) * fx + (my - cy) * fy + (mz - cz) * fz;
    }
    if (sheet) sheets.push(p.name);
    if (s < 0) { for (let t = 0; t < I.length; t += 3) { const k = I[t + 1]; I[t + 1] = I[t + 2]; I[t + 2] = k; } flipped.push(p.name); }
  }
  console.log('wound outward', flipped.length, 'parts; open sheets:', sheets.join(', ') || 'none');
}

for (const p of parts) {
  const nv = p.pos.length / 3;
  p.nrm = computeNormals(p.pos, p.idx);
  p.si = new Uint8Array(nv * 4); p.sw = new Uint8Array(nv * 4); p.info = new Uint8Array(nv * 4);
  if (p.layer === 'bone') {
    const r = boneRule(p);
    const entries = Object.entries(r.w).map(([b, v]) => [BI[b], v]).sort((a, b) => b[1] - a[1]);
    const qw = q8(entries);
    for (let v = 0; v < nv; v++) { p.si.set(qw.idx, v * 4); p.sw.set(qw.w, v * 4); p.info[v * 4] = r.cls; p.info[v * 4 + 1] = r.vert || 0; }
    continue;
  }
  const m = MI[p.key];
  const bones = p.mb.map((b) => sideB(b, p.side === 'C' ? 'L' : p.side));
  const both = p.side === 'C' && p.mb.some((b) => ['clavicle', 'upperarm', 'forearm', 'hand', 'thigh', 'shin', 'foot'].includes(b));
  const sigma = 0.03;
  // fiber frame
  const P = pca(p.pos); const e1 = P.e[0], e2 = P.e[1];
  let amin = Infinity, amax = -Infinity; const along = new Float32Array(nv), across = new Float32Array(nv);
  for (let v = 0; v < nv; v++) { const dx = p.pos[v * 3] - P.c[0], dy = p.pos[v * 3 + 1] - P.c[1], dz = p.pos[v * 3 + 2] - P.c[2]; along[v] = dx * e1[0] + dy * e1[1] + dz * e1[2]; across[v] = dx * e2[0] + dy * e2[1] + dz * e2[2]; amin = Math.min(amin, along[v]); amax = Math.max(amax, along[v]); }
  p.fiber = new Int16Array(nv * 2); p.zones = new Uint8Array(nv * 12);
  for (let v = 0; v < nv; v++) {
    const pt = [p.pos[v * 3], p.pos[v * 3 + 1], p.pos[v * 3 + 2]];
    const bl = both ? bones.map((b) => (pt[0] < 0 ? b.replace('_L', '_R') : b)) : bones;
    const qw = q8(weightsFor(pt, bl, sigma));
    p.si.set(qw.idx, v * 4); p.sw.set(qw.w, v * 4);
    const t = (along[v] - amin) / Math.max(1e-6, amax - amin);
    const bulge = Math.min(1, 4 * t * (1 - t) * 1.15);
    p.info[v * 4] = m.idx & 255; p.info[v * 4 + 1] = m.idx >> 8;
    p.fiber[v * 2] = Math.round(along[v] / 0.00005); p.fiber[v * 2 + 1] = Math.round(across[v] / 0.00005);
    // zones
    for (const [zn, w, win, face] of p.mz) {
      let f = w;
      if (win) { f *= smooth(win[0], win[1], pt[1]); if (win.length === 4) f *= smooth(win[2], win[3], pt[1]); }
      if (face === 'front') f *= smooth(-0.03, 0.02, pt[2]); if (face === 'back') f *= smooth(-0.02, -0.06, pt[2]);
      f *= 0.45 + 0.55 * bulge;
      const zi = ZI[zn]; p.zones[v * 12 + zi] = Math.max(p.zones[v * 12 + zi], Math.round(Math.min(1, f) * 255));
    }
  }
}
// aponeuroses: flat tendon sheets drawn as tendon (smooth, pale, no striation); carried in info.z, the page keeps the max
{
  const sm = (e0, e1, x) => { const t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t); };
  // the external oblique becomes the anterior rectus sheath over the rectus abdominis (and a finger's width beyond it)
  const raMax = new Map(); parts.filter((p) => /rectus abdominis/.test(p.base)).forEach((p) => { for (let v = 0; v < p.pos.length / 3; v++) { const x = Math.abs(p.pos[v * 3]), k = Math.round(p.pos[v * 3 + 1] / 0.005); raMax.set(k, Math.max(raMax.get(k) || 0, x)); } });
  const raAt = (y) => { let m = 0; for (let d = -2; d <= 2; d++) m = Math.max(m, raMax.get(Math.round(y / 0.005) + d) || 0); return m; };
  // the latissimus arises from the thoracolumbar aponeurosis: tendinous medially, fleshy lateral to a line from
  // about 2.5 cm off the midline at T7 to about 8.5 cm at the iliac crest
  const latLine = (y) => (y > 1.28 ? 0.025 - (y - 1.28) * 0.25 : y > 1.02 ? 0.025 + (1.28 - y) * (0.06 / 0.26) : 0.085 + (1.02 - y) * 0.6);
  let nE = 0, nL = 0;
  for (const p of parts) {
    const eo = /^external oblique$/.test(p.base), lat = /^latissimus dorsi$/.test(p.base); if (!eo && !lat) continue;
    for (let v = 0; v < p.pos.length / 3; v++) {
      const x = Math.abs(p.pos[v * 3]), y = p.pos[v * 3 + 1], z = p.pos[v * 3 + 2]; let w = 0;
      if (eo && z > 0.02) { const xr = raAt(y); if (xr > 0) w = sm(xr + 0.024, xr + 0.006, x); }
      if (lat && z < 0) w = sm(latLine(y) + 0.014, latLine(y) - 0.006, x);
      if (w > 0) { p.info[v * 4 + 2] = Math.max(p.info[v * 4 + 2], Math.round(w * 255)); eo ? nE++ : nL++; }
    }
  }
  console.log('aponeuroses: external oblique', nE, 'verts, latissimus', nL, 'verts');
}
console.log('attributes in', Date.now() - t0, 'ms');

// ---------- ambient occlusion from voxel grids ----------
const G = { x0: -0.42, y0: -0.03, z0: -0.27, s: 0.006 };
G.nx = Math.ceil(0.84 / G.s); G.ny = Math.ceil(1.8 / G.s); G.nz = Math.ceil(0.54 / G.s);
const mkGrid = () => new Uint8Array(G.nx * G.ny * G.nz);
const gBone = mkGrid(), gDeep = mkGrid(), gAll = mkGrid();
const mark = (g, x, y, z) => { const i = Math.floor((x - G.x0) / G.s), j = Math.floor((y - G.y0) / G.s), k = Math.floor((z - G.z0) / G.s); if (i < 0 || j < 0 || k < 0 || i >= G.nx || j >= G.ny || k >= G.nz) return; g[(j * G.nz + k) * G.nx + i] = 1; };
function raster(p, grids) {
  for (let t = 0; t < p.idx.length; t += 3) {
    const a = p.idx[t] * 3, b = p.idx[t + 1] * 3, c = p.idx[t + 2] * 3;
    const L = Math.max(Math.hypot(p.pos[b] - p.pos[a], p.pos[b + 1] - p.pos[a + 1], p.pos[b + 2] - p.pos[a + 2]), Math.hypot(p.pos[c] - p.pos[a], p.pos[c + 1] - p.pos[a + 1], p.pos[c + 2] - p.pos[a + 2]));
    const n = Math.max(1, Math.ceil(L / (G.s * 0.5)));
    for (let i = 0; i <= n; i++) for (let j = 0; j <= n - i; j++) {
      const u = i / n, w = j / n, v0 = 1 - u - w;
      const x = p.pos[a] * v0 + p.pos[b] * u + p.pos[c] * w, y = p.pos[a + 1] * v0 + p.pos[b + 1] * u + p.pos[c + 1] * w, z = p.pos[a + 2] * v0 + p.pos[b + 2] * u + p.pos[c + 2] * w;
      for (const g of grids) mark(g, x, y, z);
    }
  }
}
for (const p of parts) raster(p, p.layer === 'bone' ? [gBone, gDeep, gAll] : p.layer === 'deep' ? [gDeep, gAll] : [gAll]);
const DIRS = []; { const n = 18; for (let i = 0; i < n; i++) { const u = (i + 0.5) / n, phi = i * 2.399963; const r = Math.sqrt(u); DIRS.push([r * Math.cos(phi), r * Math.sin(phi), Math.sqrt(1 - u)]); } }
const at = (g, x, y, z) => { const i = Math.floor((x - G.x0) / G.s), j = Math.floor((y - G.y0) / G.s), k = Math.floor((z - G.z0) / G.s); if (i < 0 || j < 0 || k < 0 || i >= G.nx || j >= G.ny || k >= G.nz) return 0; return g[(j * G.nz + k) * G.nx + i]; };
for (const p of parts) {
  const g = p.layer === 'bone' ? gBone : p.layer === 'deep' ? gDeep : gAll;
  const nv = p.pos.length / 3;
  for (let v = 0; v < nv; v++) {
    const nx = p.nrm[v * 3], ny = p.nrm[v * 3 + 1], nz = p.nrm[v * 3 + 2];
    const up = Math.abs(ny) < 0.9 ? [0, 1, 0] : [1, 0, 0];
    let tx = up[1] * nz - up[2] * ny, ty = up[2] * nx - up[0] * nz, tz = up[0] * ny - up[1] * nx; const tl = Math.hypot(tx, ty, tz); tx /= tl; ty /= tl; tz /= tl;
    const bx = ny * tz - nz * ty, by = nz * tx - nx * tz, bz = nx * ty - ny * tx;
    let occ = 0;
    for (const [dx, dy, dz] of DIRS) {
      const rx = tx * dx + bx * dy + nx * dz, ry = ty * dx + by * dy + ny * dz, rz = tz * dx + bz * dy + nz * dz;
      for (let s = 1; s <= 11; s++) { const d = 0.004 + s * G.s; if (at(g, p.pos[v * 3] + rx * d, p.pos[v * 3 + 1] + ry * d, p.pos[v * 3 + 2] + rz * d)) { occ += 1 - (s - 1) / 11 * 0.55; break; } }
    }
    const ao = 1 - Math.min(1, occ / DIRS.length * 1.15);
    p.info[v * 4 + 3] = Math.round(Math.max(0, ao) * 255);
  }
}
// the voxel AO is noisy per vertex, and long thin triangles stretch that noise into streaks: average it over the surface
for (const p of parts) {
  const nv = p.pos.length / 3, nb = Array.from({ length: nv }, () => new Set());
  for (let t = 0; t < p.idx.length; t += 3) for (let k = 0; k < 3; k++) { const a = p.idx[t + k], c = p.idx[t + (k + 1) % 3]; nb[a].add(c); nb[c].add(a); }
  let ao = Float32Array.from({ length: nv }, (_, v) => p.info[v * 4 + 3]);
  for (let it = 0; it < 6; it++) { const nx = new Float32Array(nv); for (let v = 0; v < nv; v++) { let s = ao[v], c = 1; for (const u of nb[v]) { s += ao[u]; c++; } nx[v] = s / c; } ao = nx; }
  for (let v = 0; v < nv; v++) p.info[v * 4 + 3] = Math.round(ao[v]);
}
console.log('ao in', Date.now() - t0, 'ms');

// ---------- label anchors ----------
const dirOf = (az, el) => [Math.sin(az * Math.PI / 180) * Math.cos(el * Math.PI / 180), Math.sin(el * Math.PI / 180), Math.cos(az * Math.PI / 180) * Math.cos(el * Math.PI / 180)];
function anchorOn(names, az, el, near) {
  const d = dirOf(az, el); let best = null, bs = -Infinity;
  const ps = parts.filter((p) => names.includes(p.name));
  let c = [0, 0, 0], n = 0; ps.forEach((p) => { for (let v = 0; v < p.pos.length; v += 3) { c[0] += p.pos[v]; c[1] += p.pos[v + 1]; c[2] += p.pos[v + 2]; n++; } }); c = c.map((x) => x / n);
  if (near) c = near;
  ps.forEach((p) => { for (let v = 0; v < p.pos.length / 3; v++) { const q = [p.pos[v * 3], p.pos[v * 3 + 1], p.pos[v * 3 + 2]]; const rel = [q[0] - c[0], q[1] - c[1], q[2] - c[2]]; const along = rel[0] * d[0] + rel[1] * d[1] + rel[2] * d[2]; const perp = Math.hypot(rel[0] - along * d[0], rel[1] - along * d[1], rel[2] - along * d[2]); const facing = p.nrm[v * 3] * d[0] + p.nrm[v * 3 + 1] * d[1] + p.nrm[v * 3 + 2] * d[2]; const sc = along - perp * 1.6 + facing * 0.01; if (sc > bs) { bs = sc; best = { p, v, q }; } } });
  const b = best.p.si[best.v * 4];
  return { bone: BONES[b][0], p: best.q.map((x) => +x.toFixed(4)) };
}
const LABELS = {
  hero: anchorOn(['Descending part of left trapezius', 'Descending part of right trapezius'], 180, 10, [0, V[6][1] + 0.01, -0.06]),
  'z-neck': anchorOn(['Descending part of left trapezius'], 38, 6),
  'z-mid': anchorOn(['Left rhomboid major'], 150, 8),
  'z-low': anchorOn(['Left psoas major'], 118, 4, [0.04, 1.03, 0.005]),
  'z-hips': anchorOn(['Left gluteus medius'], 158, 3),
  'z-knees': anchorOn(['Left vastus medialis'], 8, 0),
  's-mobilize': anchorOn(['Sixth thoracic vertebra'], 205, 6)
};
console.log('labels', LABELS);

// soles for floor contact: the lowest points of the left foot (bones and sole muscles), local points in scene space
const footPts = [];
for (const p of parts) { if (p.side !== 'L') continue; for (let v = 0; v < p.pos.length / 3; v++) { const q = [p.pos[v * 3], p.pos[v * 3 + 1], p.pos[v * 3 + 2]]; if (q[1] < 0.05) footPts.push(q); } }
const soleY = Math.min(...footPts.map((q) => q[1]));
let heel = null, ball = null;
for (const q of footPts) { if (q[1] > soleY + 0.006) continue; if (!heel || q[2] < heel[2]) heel = q; if (!ball || q[2] > ball[2]) ball = q; }
const SOLE = [[heel[0], soleY, heel[2] + 0.02], [ball[0], soleY, ball[2] - 0.035]].map((q) => q.map((x) => +x.toFixed(4)));
console.log('sole', SOLE);

// ---------- open model: standard glTF, one named mesh per structure ----------
const GLB = process.env.GLB ?? '../model/ecorche';
if (GLB !== '0') {
  const { writeGlb } = await import('./export-glb.mjs');
  const fma = Object.fromEntries(JSON.parse(fs.readFileSync('sources/bp3d/index.json', 'utf8')).map((e) => [e.file, e.cid]));
  console.log('glb structures', writeGlb(parts, MI, fma, GLB, ME));
}

// ---------- merge layers, reorder, quantize, encode ----------
const enc = []; let encOff = 0;
const push = (u8) => { const o = encOff; enc.push(Buffer.from(u8.buffer, u8.byteOffset, u8.byteLength)); encOff += u8.byteLength; const pad = (4 - (u8.byteLength % 4)) % 4; if (pad) { enc.push(Buffer.alloc(pad)); encOff += pad; } return [o, u8.byteLength]; };
const layersOut = {};
for (const L of ['bone', 'deep', 'sup']) {
  const ps = parts.filter((p) => p.layer === L);
  let nv = 0, ni = 0; ps.forEach((p) => { nv += p.pos.length / 3; ni += p.idx.length; });
  const pos = new Float32Array(nv * 3), nrm = new Float32Array(nv * 3), si = new Uint8Array(nv * 4), sw = new Uint8Array(nv * 4), info = new Uint8Array(nv * 4);
  const fiber = L === 'bone' ? null : new Int16Array(nv * 2), zones = L === 'bone' ? null : new Uint8Array(nv * 12);
  const idx = new Uint32Array(ni);
  let vo = 0, io = 0;
  for (const p of ps) { const n = p.pos.length / 3; pos.set(p.pos, vo * 3); nrm.set(p.nrm, vo * 3); si.set(p.si, vo * 4); sw.set(p.sw, vo * 4); info.set(p.info, vo * 4); if (fiber) { fiber.set(p.fiber, vo * 2); zones.set(p.zones, vo * 12); } for (let i = 0; i < p.idx.length; i++) idx[io + i] = p.idx[i] + vo; vo += n; io += p.idx.length; }
  const [remap, unique] = ME.reorderMesh(idx, true, false);
  const re = (src, size) => { const out = new src.constructor(unique * size); for (let v = 0; v < nv; v++) { const r = remap[v]; if (r === 0xffffffff) continue; for (let k = 0; k < size; k++) out[r * size + k] = src[v * size + k]; } return out; };
  const P = re(pos, 3), N = re(nrm, 3), SI = re(si, 4), SW = re(sw, 4), INF = re(info, 4), F = fiber && re(fiber, 2), Z = zones && re(zones, 12);
  const b = bounds(P); const qmin = [b[0], b[1], b[2]], qs = 0.0001;
  const qp = new Uint16Array(unique * 4); for (let v = 0; v < unique; v++) for (let k = 0; k < 3; k++) qp[v * 4 + k] = Math.round((P[v * 3 + k] - qmin[k]) / qs);
  const qn = new Int8Array(unique * 4); for (let v = 0; v < unique; v++) for (let k = 0; k < 3; k++) qn[v * 4 + k] = Math.round(N[v * 3 + k] * 127);
  const sizes = {};
  const ev = (u8, size, name) => { const e = ME.encodeVertexBufferLevel(new Uint8Array(u8.buffer, u8.byteOffset, u8.byteLength), unique, size, 2, 0); sizes[name] = e.byteLength; return push(e); };
  const out = { nv: unique, ni, qmin: qmin.map((x) => +x.toFixed(6)), qs, streams: {} };
  out.streams.pos = ev(qp, 8, 'pos'); out.streams.si = ev(SI, 4, 'si'); out.streams.sw = ev(SW, 4, 'sw'); out.streams.info = ev(INF, 4, 'info');
  if (F) { const zA = new Uint8Array(unique * 4), zB = new Uint8Array(unique * 4), zC = new Uint8Array(unique * 4); for (let v = 0; v < unique; v++) for (let k = 0; k < 4; k++) { zA[v * 4 + k] = Z[v * 12 + k]; zB[v * 4 + k] = Z[v * 12 + 4 + k]; zC[v * 4 + k] = Z[v * 12 + 8 + k]; } out.streams.zA = ev(zA, 4, 'zA'); out.streams.zB = ev(zB, 4, 'zB'); out.streams.zC = ev(zC, 4, 'zC'); }
  // reorderMesh already rewrote idx in place with the new vertex order
  const ie = ME.encodeIndexBuffer(new Uint8Array(idx.buffer), ni, 4); sizes.idx = ie.byteLength;
  out.streams.idx = push(ie);
  // phones draw a lighter index buffer over the same vertices
  const [lod] = MS.simplify(idx, P, 3, Math.floor(ni * 0.3 / 3) * 3, 0.0025, ['ErrorAbsolute']);
  const le = ME.encodeIndexBuffer(new Uint8Array(lod.buffer, lod.byteOffset, lod.byteLength), lod.length, 4); sizes.lod = le.byteLength;
  out.lodNi = lod.length; out.streams.lod = push(le);
  layersOut[L] = out;
  console.log('layer', L, 'verts', unique, 'tris', ni / 3, 'lod', out.lodNi / 3, JSON.stringify(Object.fromEntries(Object.entries(sizes).map(([k, v]) => [k, Math.round(v / 1024) + 'K']))));
}
const header = {
  v: 3, credit: 'BodyParts3D, (c) The Database Center for Life Science, CC BY 4.0; Z-Anatomy by Gauthier Kervyn, CC BY-SA 4.0 (via BodyExplorer)',
  bones: BONES, sole: SOLE, labels: LABELS, layers: layersOut,
  muscles: MUS.map((m) => ({ i: m.idx, n: m.name, s: m.side, l: m.layer, k: m.kind, z: m.zw, p: m.primary, t: m.tendon ? 1 : 0 })),
  belly: { c: [0, yUmb - 0.01, 0], yPub, yXi }
};
const hb = Buffer.from(JSON.stringify(header), 'utf8');
const lenB = Buffer.alloc(4); lenB.writeUInt32LE(hb.length, 0);
const pad = (4 - ((4 + hb.length) % 4)) % 4;
const blob = Buffer.concat([lenB, hb, Buffer.alloc(pad), ...enc]);
const OUTN = process.env.OUT || 'anatomy';
fs.writeFileSync(OUTN + '.bin', blob);
fs.writeFileSync(OUTN + '.b64.txt', blob.toString('base64'));
console.log('blob', (blob.length / 1e6).toFixed(2), 'MB, base64', (blob.toString('base64').length / 1e6).toFixed(2), 'MB, muscles', MUS.length, 'total', Date.now() - t0, 'ms');
