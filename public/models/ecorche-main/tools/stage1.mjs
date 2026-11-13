// Stage 1: parse the selected BodyParts3D OBJ files, find the joints, convert to scene space, cache.
import fs from 'fs';
import { parseObj, bounds, centroidWhere, sphereFit, pointsWhere } from './lib.mjs';

const sel = JSON.parse(fs.readFileSync('selection.json', 'utf8'));
// Z-Anatomy muscles that BodyParts3D lacks (from BodyExplorer's anatomy.glb, already in the BP3D millimetre frame)
const ZA_PICK = { 'latissimus dorsi': 'sup', 'rectus abdominis': 'sup', 'posterior layer of thoracolumbar fascia': 'sup',
  'internal oblique': 'deep', 'transversus abdominis': 'deep', 'quadratus lumborum': 'deep',
  'multifidus cervicis': 'deep', 'multifidus thoracis': 'deep', 'multifidus lumborum': 'deep', 'rotatores': 'deep',
  // face: chewing muscles and the muscles of expression
  'temporalis': 'sup', 'superficial part of masseter': 'sup', 'frontalis': 'sup', 'orbital part of orbicularis oculi': 'sup', 'palpebral part of orbicularis oculi': 'sup',
  'orbicularis oris': 'sup', 'zygomaticus major': 'sup', 'zygomaticus minor': 'sup', 'levator labii superioris': 'sup', 'depressor labii inferioris': 'sup',
  'depressor anguli oris': 'sup', 'risorius': 'sup', 'mentalis': 'sup', 'procerus': 'sup', 'nasalis': 'sup',
  'deep part of masseter': 'deep', 'medial pterygoid': 'deep', 'superior head of lateral pterygoid': 'deep', 'inferior head of lateral pterygoid': 'deep', 'corrugator supercilii': 'deep' };
for (const z of JSON.parse(fs.readFileSync('za/index.json', 'utf8'))) {
  const m = z.name.match(/^(left|right) (.*)$/); if (!m || !ZA_PICK[m[2]]) continue;
  sel.push({ file: z.file, name: m[1][0].toUpperCase() + m[1].slice(1) + ' ' + m[2], base: m[2], side: m[1] === 'left' ? 'L' : 'R', cat: ZA_PICK[m[2]], za: 1 });
}
const t0 = Date.now();
const raw = {};
for (const s of sel) raw[s.file] = parseObj((s.za ? 'za/' : 'obj/') + s.file + '.obj');
console.log('parsed', sel.length, 'in', Date.now() - t0, 'ms');
const byName = (n) => { const s = sel.find((x) => x.name.toLowerCase() === n.toLowerCase()); if (!s) throw new Error('missing ' + n); return raw[s.file].pos; };
const B = (p) => bounds(p);

// ---------- joints, raw space (mm; +x = left, -y = front, +z = up) ----------
const femur = byName('Left femur'), fb = B(femur);
const hipFit = sphereFit(pointsWhere(femur, (x, y, z) => z > fb[5] - 48 && x < fb[0] + 42));
const tibia = byName('Left tibia'), tb = B(tibia), fibula = byName('Left fibula'), fib = B(fibula);
const kneeA = centroidWhere(femur, (x, y, z) => z < fb[2] + 22), kneeB = centroidWhere(tibia, (x, y, z) => z > tb[5] - 16);
const knee = [0, 1, 2].map((k) => (kneeA[k] + kneeB[k]) / 2);
const talus = byName('Left talus'), tab = B(talus);
const malM = centroidWhere(tibia, (x, y, z) => z < tb[2] + 9), malL = centroidWhere(fibula, (x, y, z) => z < fib[2] + 9);
const talTop = centroidWhere(talus, (x, y, z) => z > tab[5] - 10);
const ankle = [0, 1, 2].map((k) => ((malM[k] + malL[k]) / 2 + talTop[k] - (k === 2 ? 6 : 0)) / 2);
const mt2 = byName('Left second metatarsal bone'), mt2b = B(mt2);
const toe = centroidWhere(mt2, (x, y, z) => y < mt2b[1] + 12);
const humerus = byName('Left humerus'), hb = B(humerus);
const shFit = sphereFit(pointsWhere(humerus, (x, y, z) => z > hb[5] - 44 && x < hb[0] + 44));
const elbow = centroidWhere(humerus, (x, y, z) => z < hb[2] + 18);
const radius = byName('Left radius'), rb = B(radius), ulna = byName('Left ulna'), ub = B(ulna);
const wrA = centroidWhere(radius, (x, y, z) => z < rb[2] + 10), wrB = centroidWhere(ulna, (x, y, z) => z < ub[2] + 10);
const wrist = [0, 1, 2].map((k) => (wrA[k] + wrB[k]) / 2);
const fingerTip = centroidWhere(byName('Distal phalanx of left middle finger'), () => true);
const midMC = byName('Left third metacarpal bone'), mcb = B(midMC);
const knuckle = centroidWhere(midMC, (x, y, z) => z < mcb[2] + 8);
const clav = byName('Left clavicle'), cb = B(clav);
const clavHead = centroidWhere(clav, (x, y, z) => x < cb[0] + 12);
const body = (n) => { const p = byName(n), b = B(p); return centroidWhere(p, (x, y, z) => y < b[1] + 0.42 * (b[4] - b[1])); };
const VNAMES = ['Atlas', 'Axis', 'Third cervical vertebra', 'Fourth cervical vertebra', 'Fifth cervical vertebra', 'Sixth cervical vertebra', 'Seventh cervical vertebra',
  'First thoracic vertebra', 'Second thoracic vertebra', 'Third thoracic vertebra', 'Fourth thoracic vertebra', 'Fifth thoracic vertebra', 'Sixth thoracic vertebra', 'Seventh thoracic vertebra', 'Eighth thoracic vertebra', 'Ninth thoracic vertebra', 'Tenth thoracic vertebra', 'Eleventh thoracic vertebra', 'Twelfth thoracic vertebra',
  'First lumbar vertebra', 'Second lumbar vertebra', 'Third lumbar vertebra', 'Fourth lumbar vertebra', 'Fifth lumbar vertebra'];
const vb = VNAMES.map((n) => (n === 'Atlas' ? centroidWhere(byName(n), () => true) : body(n)));
const sacrum = byName('Sacrum'), sb = B(sacrum);
const sacTop = centroidWhere(sacrum, (x, y, z) => z > sb[5] - 14 && y < (sb[1] + sb[4]) / 2);
const skinRaw = byName('Skin'), skb = B(skinRaw);
const skullTop = Math.max(B(byName('Frontal bone'))[5], B(byName('Left parietal bone'))[5]);
console.log('hip r', hipFit.r.toFixed(1), 'shoulder r', shFit.r.toFixed(1));

// ---------- transform to scene space: meters, +y up, figure faces +z, feet on y = 0, hip joints at z = 0 ----------
const FLOOR = skb[2], YREF = hipFit.c[1];
const T = (p) => [p[0] / 1000, (p[2] - FLOOR) / 1000, -(p[1] - YREF) / 1000];
const mid = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2];
const J = {
  hip: T(hipFit.c), knee: T(knee), ankle: T(ankle), toe: T(toe), shoulder: T(shFit.c), elbow: T(elbow), wrist: T(wrist), hand: T(knuckle), finger: T(fingerTip), clav: T(clavHead),
  sacTop: T(sacTop), vb: vb.map(T), skullTop: (skullTop - FLOOR) / 1000
};
const V = J.vb; // 0 atlas, 1 axis, 2..6 C3-C7, 7..18 T1-T12, 19..23 L1-L5
const cx = (p) => [0, p[1], p[2]];
const L5S1 = cx(mid(J.sacTop, V[23])), T12L1 = cx(mid(V[18], V[19])), T7T8 = cx(mid(V[13], V[14])), C7T1 = cx(mid(V[6], V[7]));
const atlasTop = cx([0, V[0][1] + 0.008, V[0][2]]);
const hipMid = [0, J.hip[1], J.hip[2]];
const BONES = [
  ['pelvis', -1, [0, hipMid[1] + 0.07, hipMid[2] - 0.01], L5S1],
  ['spineL', 0, L5S1, T12L1],
  ['spineT', 1, T12L1, T7T8],
  ['chest', 2, T7T8, C7T1],
  ['neck', 3, C7T1, atlasTop],
  ['head', 4, atlasTop, [0, J.skullTop, atlasTop[2] + 0.012]],
  ['clavicle_L', 3, J.clav, J.shoulder],
  ['upperarm_L', 6, J.shoulder, J.elbow],
  ['forearm_L', 7, J.elbow, J.wrist],
  ['hand_L', 8, J.wrist, J.finger],
  ['clavicle_R', 3], ['upperarm_R', 10], ['forearm_R', 11], ['hand_R', 12],
  ['thigh_L', 0, J.hip, J.knee],
  ['shin_L', 14, J.knee, J.ankle],
  ['foot_L', 15, J.ankle, J.toe],
  ['thigh_R', 0], ['shin_R', 17], ['foot_R', 18]
];
const mx = (p) => [-p[0], p[1], p[2]];
BONES.forEach((b) => { if (!b[2]) { const src = BONES.find((s) => s[0] === b[0].replace('_R', '_L')); b[2] = mx(src[2]); b[3] = mx(src[3]); } });
const r4 = (p) => p.map((v) => +v.toFixed(4));
BONES.forEach((b) => { b[2] = r4(b[2]); b[3] = r4(b[3]); });
console.table(BONES.map((b) => ({ n: b[0], head: b[2].join(', '), tail: b[3].join(', ') })));

// ---------- write cache ----------
const meta = { FLOOR, YREF, joints: J, bones: BONES, parts: [] };
const chunks = []; let off = 0;
for (const s of sel) {
  const r = raw[s.file];
  const p = new Float32Array(r.pos.length);
  for (let i = 0; i < r.pos.length; i += 3) { const q = T([r.pos[i], r.pos[i + 1], r.pos[i + 2]]); p[i] = q[0]; p[i + 1] = q[1]; p[i + 2] = q[2]; }
  const pb = Buffer.from(p.buffer), ib = Buffer.from(r.idx.buffer);
  meta.parts.push({ file: s.file, name: s.name, base: s.base, side: s.side, cat: s.cat, za: s.za || 0, nv: p.length / 3, ni: r.idx.length, po: off, io: off + pb.length });
  chunks.push(pb, ib); off += pb.length + ib.length;
}
fs.writeFileSync('cache.bin', Buffer.concat(chunks));
fs.writeFileSync('cache.json', JSON.stringify(meta));
console.log('cache written', (off / 1e6).toFixed(1), 'MB in', Date.now() - t0, 'ms');
