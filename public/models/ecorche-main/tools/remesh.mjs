// Rebuild a self-overlapping sheet (fibre bundles laid like shingles) as one clean closed surface: the iso-surface at a
// small distance from the original triangles (surface nets on a narrow-band distance field). The shape stays within
// about the iso distance of the original; the shingles, and the depth fighting between them, are gone.
export function wrapSurface(pos, idx, h = 0.00125, iso = 0.0009) {
  let b = [Infinity, Infinity, Infinity, -Infinity, -Infinity, -Infinity];
  for (let i = 0; i < pos.length; i += 3) for (let k = 0; k < 3; k++) { b[k] = Math.min(b[k], pos[i + k]); b[k + 3] = Math.max(b[k + 3], pos[i + k]); }
  const pad = iso + 3 * h, o = [b[0] - pad, b[1] - pad, b[2] - pad];
  const nx = Math.ceil((b[3] - b[0] + 2 * pad) / h) + 1, ny = Math.ceil((b[4] - b[1] + 2 * pad) / h) + 1, nz = Math.ceil((b[5] - b[2] + 2 * pad) / h) + 1;
  const D = new Float32Array(nx * ny * nz).fill(1);
  const at = (i, j, k) => (k * ny + j) * nx + i;
  const band = iso + 2 * h;
  // point-triangle distance (Ericson)
  function dist(px, py, pz, ax, ay, az, bx, by, bz, cx, cy, cz) {
    const abx = bx - ax, aby = by - ay, abz = bz - az, acx = cx - ax, acy = cy - ay, acz = cz - az, apx = px - ax, apy = py - ay, apz = pz - az;
    const d1 = abx * apx + aby * apy + abz * apz, d2 = acx * apx + acy * apy + acz * apz;
    if (d1 <= 0 && d2 <= 0) return Math.hypot(apx, apy, apz);
    const bpx = px - bx, bpy = py - by, bpz = pz - bz, d3 = abx * bpx + aby * bpy + abz * bpz, d4 = acx * bpx + acy * bpy + acz * bpz;
    if (d3 >= 0 && d4 <= d3) return Math.hypot(bpx, bpy, bpz);
    const vc = d1 * d4 - d3 * d2;
    if (vc <= 0 && d1 >= 0 && d3 <= 0) { const v = d1 / (d1 - d3); return Math.hypot(apx - v * abx, apy - v * aby, apz - v * abz); }
    const cpx = px - cx, cpy = py - cy, cpz = pz - cz, d5 = abx * cpx + aby * cpy + abz * cpz, d6 = acx * cpx + acy * cpy + acz * cpz;
    if (d6 >= 0 && d5 <= d6) return Math.hypot(cpx, cpy, cpz);
    const vb = d5 * d2 - d1 * d6;
    if (vb <= 0 && d2 >= 0 && d6 <= 0) { const w = d2 / (d2 - d6); return Math.hypot(apx - w * acx, apy - w * acy, apz - w * acz); }
    const va = d3 * d6 - d5 * d4;
    if (va <= 0 && d4 - d3 >= 0 && d5 - d6 >= 0) { const w = (d4 - d3) / ((d4 - d3) + (d5 - d6)); return Math.hypot(px - (bx + w * (cx - bx)), py - (by + w * (cy - by)), pz - (bz + w * (cz - bz))); }
    const den = 1 / (va + vb + vc), v = vb * den, w = vc * den;
    return Math.hypot(apx - abx * v - acx * w, apy - aby * v - acy * w, apz - abz * v - acz * w);
  }
  for (let t = 0; t < idx.length; t += 3) {
    const a = idx[t] * 3, c1 = idx[t + 1] * 3, c2 = idx[t + 2] * 3;
    const ax = pos[a], ay = pos[a + 1], az = pos[a + 2], bx = pos[c1], by = pos[c1 + 1], bz = pos[c1 + 2], cx = pos[c2], cy = pos[c2 + 1], cz = pos[c2 + 2];
    const i0 = Math.max(0, Math.floor((Math.min(ax, bx, cx) - band - o[0]) / h)), i1 = Math.min(nx - 1, Math.ceil((Math.max(ax, bx, cx) + band - o[0]) / h));
    const j0 = Math.max(0, Math.floor((Math.min(ay, by, cy) - band - o[1]) / h)), j1 = Math.min(ny - 1, Math.ceil((Math.max(ay, by, cy) + band - o[1]) / h));
    const k0 = Math.max(0, Math.floor((Math.min(az, bz, cz) - band - o[2]) / h)), k1 = Math.min(nz - 1, Math.ceil((Math.max(az, bz, cz) + band - o[2]) / h));
    for (let k = k0; k <= k1; k++) for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) {
      const g = at(i, j, k), d = dist(o[0] + i * h, o[1] + j * h, o[2] + k * h, ax, ay, az, bx, by, bz, cx, cy, cz) - iso; if (d < D[g]) D[g] = d;
    }
  }
  // surface nets: one vertex per cell that straddles the surface, one quad per grid edge that crosses it
  const vid = new Int32Array(nx * ny * nz).fill(-1), V = [];
  const E = [[0, 1], [2, 3], [4, 5], [6, 7], [0, 2], [1, 3], [4, 6], [5, 7], [0, 4], [1, 5], [2, 6], [3, 7]];
  const C = [[0, 0, 0], [1, 0, 0], [0, 1, 0], [1, 1, 0], [0, 0, 1], [1, 0, 1], [0, 1, 1], [1, 1, 1]];
  const val = new Float32Array(8);
  for (let k = 0; k < nz - 1; k++) for (let j = 0; j < ny - 1; j++) for (let i = 0; i < nx - 1; i++) {
    let neg = 0; for (let c = 0; c < 8; c++) { val[c] = D[at(i + C[c][0], j + C[c][1], k + C[c][2])]; if (val[c] < 0) neg++; }
    if (neg === 0 || neg === 8) continue;
    let sx = 0, sy = 0, sz = 0, n = 0;
    for (const [p, q] of E) { const a = val[p], bq = val[q]; if ((a < 0) === (bq < 0)) continue; const t = a / (a - bq); sx += C[p][0] + t * (C[q][0] - C[p][0]); sy += C[p][1] + t * (C[q][1] - C[p][1]); sz += C[p][2] + t * (C[q][2] - C[p][2]); n++; }
    vid[at(i, j, k)] = V.length / 3; V.push(o[0] + (i + sx / n) * h, o[1] + (j + sy / n) * h, o[2] + (k + sz / n) * h);
  }
  const I = [];
  const quad = (a, b2, c, d, flip) => { if (a < 0 || b2 < 0 || c < 0 || d < 0) return; if (flip) I.push(a, c, b2, a, d, c); else I.push(a, b2, c, a, c, d); };
  for (let k = 1; k < nz - 1; k++) for (let j = 1; j < ny - 1; j++) for (let i = 1; i < nx - 1; i++) {
    const s0 = D[at(i, j, k)] < 0;
    if (s0 !== (D[at(i + 1, j, k)] < 0)) quad(vid[at(i, j - 1, k - 1)], vid[at(i, j, k - 1)], vid[at(i, j, k)], vid[at(i, j - 1, k)], !s0);
    if (s0 !== (D[at(i, j + 1, k)] < 0)) quad(vid[at(i - 1, j, k - 1)], vid[at(i - 1, j, k)], vid[at(i, j, k)], vid[at(i, j, k - 1)], !s0);
    if (s0 !== (D[at(i, j, k + 1)] < 0)) quad(vid[at(i - 1, j - 1, k)], vid[at(i, j - 1, k)], vid[at(i, j, k)], vid[at(i - 1, j, k)], !s0);
  }
  // orient every triangle outward: the field must grow along its normal
  const samp = (x, y, z) => { const fx = (x - o[0]) / h, fy = (y - o[1]) / h, fz = (z - o[2]) / h; const i = Math.max(0, Math.min(nx - 2, Math.floor(fx))), j = Math.max(0, Math.min(ny - 2, Math.floor(fy))), k = Math.max(0, Math.min(nz - 2, Math.floor(fz))); const u = fx - i, v = fy - j, w = fz - k;
    let r = 0; for (let c = 0; c < 8; c++) { const [di, dj, dk] = C[c]; r += D[at(i + di, j + dj, k + dk)] * (di ? u : 1 - u) * (dj ? v : 1 - v) * (dk ? w : 1 - w); } return r; };
  for (let t = 0; t < I.length; t += 3) {
    const a = I[t] * 3, b2 = I[t + 1] * 3, c = I[t + 2] * 3;
    const ux = V[b2] - V[a], uy = V[b2 + 1] - V[a + 1], uz = V[b2 + 2] - V[a + 2], vx = V[c] - V[a], vy = V[c + 1] - V[a + 1], vz = V[c + 2] - V[a + 2];
    let nx2 = uy * vz - uz * vy, ny2 = uz * vx - ux * vz, nz2 = ux * vy - uy * vx; const l = Math.hypot(nx2, ny2, nz2) || 1; nx2 /= l; ny2 /= l; nz2 /= l;
    const cx = (V[a] + V[b2] + V[c]) / 3, cy = (V[a + 1] + V[b2 + 1] + V[c + 1]) / 3, cz = (V[a + 2] + V[b2 + 2] + V[c + 2]) / 3, e = h * 0.6;
    if (samp(cx + nx2 * e, cy + ny2 * e, cz + nz2 * e) < samp(cx - nx2 * e, cy - ny2 * e, cz - nz2 * e)) { const tt = I[t + 1]; I[t + 1] = I[t + 2]; I[t + 2] = tt; }
  }
  return { pos: new Float32Array(V), idx: new Uint32Array(I) };
}
