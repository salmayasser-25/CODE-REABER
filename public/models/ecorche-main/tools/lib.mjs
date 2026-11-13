// Geometry helpers for the anatomy build (Node, no dependencies besides meshoptimizer)
import fs from 'fs';

export function parseObj(path) {
  const txt = fs.readFileSync(path, 'latin1');
  const pos = [], idx = [];
  let start = 0;
  const n = txt.length;
  while (start < n) {
    let end = txt.indexOf('\n', start); if (end < 0) end = n;
    const c0 = txt.charCodeAt(start), c1 = txt.charCodeAt(start + 1);
    if (c0 === 118 && c1 === 32) { // 'v '
      const parts = txt.slice(start + 2, end).trim().split(/\s+/);
      pos.push(+parts[0], +parts[1], +parts[2]);
    } else if (c0 === 102 && c1 === 32) { // 'f '
      const parts = txt.slice(start + 2, end).trim().split(/\s+/);
      const v = parts.map((p) => parseInt(p, 10) - 1);
      for (let k = 1; k < v.length - 1; k++) idx.push(v[0], v[k], v[k + 1]);
    }
    start = end + 1;
  }
  return { pos: new Float64Array(pos), idx: new Uint32Array(idx) };
}

export function bounds(pos) {
  const b = [Infinity, Infinity, Infinity, -Infinity, -Infinity, -Infinity];
  for (let i = 0; i < pos.length; i += 3) for (let k = 0; k < 3; k++) { if (pos[i + k] < b[k]) b[k] = pos[i + k]; if (pos[i + k] > b[k + 3]) b[k + 3] = pos[i + k]; }
  return b;
}
export function centroidWhere(pos, pred) {
  let x = 0, y = 0, z = 0, c = 0;
  for (let i = 0; i < pos.length; i += 3) { if (pred(pos[i], pos[i + 1], pos[i + 2])) { x += pos[i]; y += pos[i + 1]; z += pos[i + 2]; c++; } }
  return c ? [x / c, y / c, z / c, c] : null;
}
// Least-squares sphere fit: x^2+y^2+z^2 = 2ax + 2by + 2cz + d
export function sphereFit(pts) {
  const A = [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]], B = [0, 0, 0, 0];
  for (const [x, y, z] of pts) {
    const row = [2 * x, 2 * y, 2 * z, 1], rhs = x * x + y * y + z * z;
    for (let i = 0; i < 4; i++) { B[i] += row[i] * rhs; for (let j = 0; j < 4; j++) A[i][j] += row[i] * row[j]; }
  }
  const s = solve4(A, B);
  return { c: [s[0], s[1], s[2]], r: Math.sqrt(s[3] + s[0] * s[0] + s[1] * s[1] + s[2] * s[2]) };
}
function solve4(A, B) {
  const M = A.map((r, i) => [...r, B[i]]);
  for (let i = 0; i < 4; i++) {
    let p = i; for (let k = i + 1; k < 4; k++) if (Math.abs(M[k][i]) > Math.abs(M[p][i])) p = k;
    [M[i], M[p]] = [M[p], M[i]];
    for (let k = i + 1; k < 4; k++) { const f = M[k][i] / M[i][i]; for (let j = i; j < 5; j++) M[k][j] -= f * M[i][j]; }
  }
  const x = [0, 0, 0, 0];
  for (let i = 3; i >= 0; i--) { let s = M[i][4]; for (let j = i + 1; j < 4; j++) s -= M[i][j] * x[j]; x[i] = s / M[i][i]; }
  return x;
}
export function pointsWhere(pos, pred) { const out = []; for (let i = 0; i < pos.length; i += 3) if (pred(pos[i], pos[i + 1], pos[i + 2])) out.push([pos[i], pos[i + 1], pos[i + 2]]); return out; }

export function computeNormals(pos, idx) {
  const n = new Float32Array(pos.length);
  for (let t = 0; t < idx.length; t += 3) {
    const a = idx[t] * 3, b = idx[t + 1] * 3, c = idx[t + 2] * 3;
    const ux = pos[b] - pos[a], uy = pos[b + 1] - pos[a + 1], uz = pos[b + 2] - pos[a + 2];
    const vx = pos[c] - pos[a], vy = pos[c + 1] - pos[a + 1], vz = pos[c + 2] - pos[a + 2];
    const nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
    for (const o of [a, b, c]) { n[o] += nx; n[o + 1] += ny; n[o + 2] += nz; }
  }
  for (let i = 0; i < n.length; i += 3) { const l = Math.hypot(n[i], n[i + 1], n[i + 2]) || 1; n[i] /= l; n[i + 1] /= l; n[i + 2] /= l; }
  return n;
}

// Keep only referenced vertices
export function compact(pos, idx, extra) {
  const map = new Int32Array(pos.length / 3).fill(-1); let nv = 0;
  const out = new Uint32Array(idx.length);
  for (let i = 0; i < idx.length; i++) { const v = idx[i]; if (map[v] < 0) map[v] = nv++; out[i] = map[v]; }
  const p = new Float32Array(nv * 3);
  const ex = extra ? extra.map((e) => new e.arr.constructor(nv * e.size)) : [];
  for (let v = 0; v < map.length; v++) { const m = map[v]; if (m < 0) continue; p[m * 3] = pos[v * 3]; p[m * 3 + 1] = pos[v * 3 + 1]; p[m * 3 + 2] = pos[v * 3 + 2];
    if (extra) extra.forEach((e, k) => { for (let j = 0; j < e.size; j++) ex[k][m * e.size + j] = e.arr[v * e.size + j]; }); }
  return { pos: p, idx: out, extra: ex, map };
}

export function triangleArea(pos, idx) {
  let a = 0;
  for (let t = 0; t < idx.length; t += 3) {
    const i = idx[t] * 3, j = idx[t + 1] * 3, k = idx[t + 2] * 3;
    const ux = pos[j] - pos[i], uy = pos[j + 1] - pos[i + 1], uz = pos[j + 2] - pos[i + 2];
    const vx = pos[k] - pos[i], vy = pos[k + 1] - pos[i + 1], vz = pos[k + 2] - pos[i + 2];
    a += 0.5 * Math.hypot(uy * vz - uz * vy, uz * vx - ux * vz, ux * vy - uy * vx);
  }
  return a;
}

// PCA: returns centroid and eigenvectors (sorted by eigenvalue desc)
export function pca(pos) {
  const n = pos.length / 3; let cx = 0, cy = 0, cz = 0;
  for (let i = 0; i < pos.length; i += 3) { cx += pos[i]; cy += pos[i + 1]; cz += pos[i + 2]; }
  cx /= n; cy /= n; cz /= n;
  const C = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
  for (let i = 0; i < pos.length; i += 3) {
    const d = [pos[i] - cx, pos[i + 1] - cy, pos[i + 2] - cz];
    for (let a = 0; a < 3; a++) for (let b = 0; b < 3; b++) C[a][b] += d[a] * d[b];
  }
  const { vecs, vals } = jacobi3(C);
  return { c: [cx, cy, cz], e: vecs, vals };
}
function jacobi3(A0) {
  const A = A0.map((r) => r.slice()); const V = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
  for (let sweep = 0; sweep < 50; sweep++) {
    let off = Math.abs(A[0][1]) + Math.abs(A[0][2]) + Math.abs(A[1][2]); if (off < 1e-15) break;
    for (let p = 0; p < 2; p++) for (let q = p + 1; q < 3; q++) {
      if (Math.abs(A[p][q]) < 1e-18) continue;
      const th = (A[q][q] - A[p][p]) / (2 * A[p][q]);
      const t = Math.sign(th || 1) / (Math.abs(th) + Math.sqrt(th * th + 1));
      const c = 1 / Math.sqrt(t * t + 1), s = t * c;
      for (let k = 0; k < 3; k++) { const akp = A[k][p], akq = A[k][q]; A[k][p] = c * akp - s * akq; A[k][q] = s * akp + c * akq; }
      for (let k = 0; k < 3; k++) { const apk = A[p][k], aqk = A[q][k]; A[p][k] = c * apk - s * aqk; A[q][k] = s * apk + c * aqk; }
      for (let k = 0; k < 3; k++) { const vkp = V[k][p], vkq = V[k][q]; V[k][p] = c * vkp - s * vkq; V[k][q] = s * vkp + c * vkq; }
    }
  }
  const vals = [A[0][0], A[1][1], A[2][2]];
  const order = [0, 1, 2].sort((a, b) => vals[b] - vals[a]);
  return { vals: order.map((i) => vals[i]), vecs: order.map((i) => [V[0][i], V[1][i], V[2][i]]) };
}

export const smooth = (e0, e1, x) => { const t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t); };
export const segDist = (p, a, b) => {
  const ex = b[0] - a[0], ey = b[1] - a[1], ez = b[2] - a[2];
  const l2 = ex * ex + ey * ey + ez * ez || 1e-12;
  let t = ((p[0] - a[0]) * ex + (p[1] - a[1]) * ey + (p[2] - a[2]) * ez) / l2; t = Math.max(0, Math.min(1, t));
  return Math.hypot(a[0] + ex * t - p[0], a[1] + ey * t - p[1], a[2] + ez * t - p[2]);
};
export const segT = (p, a, b) => {
  const ex = b[0] - a[0], ey = b[1] - a[1], ez = b[2] - a[2];
  const l2 = ex * ex + ey * ey + ez * ez || 1e-12;
  return ((p[0] - a[0]) * ex + (p[1] - a[1]) * ey + (p[2] - a[2]) * ez) / l2;
};

// Merge vertices that share a position (BodyParts3D files often repeat corners per face)
export function weld(pos, idx, eps = 1e-5) {
  const map = new Map(), remap = new Uint32Array(pos.length / 3), out = [];
  const inv = 1 / eps;
  for (let v = 0; v < remap.length; v++) {
    const k = Math.round(pos[v * 3] * inv) + ',' + Math.round(pos[v * 3 + 1] * inv) + ',' + Math.round(pos[v * 3 + 2] * inv);
    let m = map.get(k); if (m === undefined) { m = out.length / 3; map.set(k, m); out.push(pos[v * 3], pos[v * 3 + 1], pos[v * 3 + 2]); }
    remap[v] = m;
  }
  const I = [];
  for (let t = 0; t < idx.length; t += 3) { const a = remap[idx[t]], b = remap[idx[t + 1]], c = remap[idx[t + 2]]; if (a !== b && b !== c && a !== c) I.push(a, b, c); }
  return { pos: new Float32Array(out), idx: new Uint32Array(I) };
}
