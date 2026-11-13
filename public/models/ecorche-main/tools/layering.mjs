// Layer resolution. The page draws only the outermost superficial surface (depth prepass) over the opaque deep muscles
// and bones, so wherever a part pokes through the part that should cover it, or two surfaces cross within a millimetre,
// the figure shows a hard line or a patch that differs left to right.
//
// BodyParts3D was modelled as one body, and so was Z-Anatomy, but not together. So:
//   - between the two datasets, the order comes from anatomy (RULES below), never from the meshes, because exactly
//     there the meshes contradict each other; the Z-Anatomy part is the one that moves (draped over, or tucked under);
//   - inside one dataset, the meshes are trusted: pairs with a clear order keep it, with hairline corrections only;
//   - left and right halves meet edge to edge at the midline; the right half is rebuilt as the mirror of the left.
// Depth is measured along the inward skin normal of the nearest skin vertex; moves are a smooth field on the skin.
import { computeNormals, compact } from './lib.mjs';

// [top, under]: who lies on whom where a Z-Anatomy part meets a BodyParts3D part (or two Z-Anatomy deep parts)
export const RULES = [
  [/trapezius/, /latissimus/],
  [/latissimus/, /iliocostalis|longissimus|spinalis|serratus posterior inferior|external intercostal|serratus anterior|external oblique|internal oblique|transversus abdominis|rhomboid|thoracolumbar fascia|multifidus|rotatores|quadratus lumborum/],
  [/posterior layer of thoracolumbar fascia/, /iliocostalis|longissimus|spinalis|multifidus|rotatores|quadratus lumborum|serratus posterior inferior|internal oblique|transversus abdominis/],
  [/gluteus maximus/, /thoracolumbar fascia|multifidus|rotatores/],
  [/pectoralis major|external oblique|linea alba/, /rectus abdominis/],
  [/rectus abdominis/, /internal oblique|transversus abdominis/],
  [/external oblique/, /internal oblique|transversus abdominis|quadratus lumborum/],
  [/internal oblique/, /transversus abdominis/],
  [/iliocostalis|longissimus|spinalis|semispinalis|serratus posterior inferior/, /multifidus|rotatores|quadratus lumborum/]
];

export function resolveLayers(parts, skin, MS, opts = {}) {
  const LAT = 0.006, M_SUP = 0.002, M_DEEP = 0.003, BIG = 0.025, SMALL = 0.004;
  const log = opts.log || (() => {});
  const smooth = (e0, e1, x) => { const t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t); };

  // ---------- skin: simplified shell, inward normals, neighbourhoods ----------
  const [si] = MS.simplify(skin.idx, skin.pos, 3, Math.floor(Math.min(skin.idx.length, 360000) / 3) * 3, 0.0006, ['ErrorAbsolute']);
  const S = compact(skin.pos, si); const sn = computeNormals(S.pos, S.idx); const ns = S.pos.length / 3;
  const r1 = Array.from({ length: ns }, () => new Set());
  for (let t = 0; t < S.idx.length; t += 3) for (let k = 0; k < 3; k++) { const a = S.idx[t + k], b = S.idx[t + (k + 1) % 3]; r1[a].add(b); r1[b].add(a); }
  const R2 = new Map();
  const ring2 = (b) => { let r = R2.get(b); if (r) return r; const s = new Set([b]); for (const x of r1[b]) { s.add(x); for (const y of r1[x]) s.add(y); } r = Int32Array.from(s); R2.set(b, r); return r; };
  const CELL = 0.02, grid = new Map();
  const key = (i, j, k) => (i + 512) * 1048576 + (j + 512) * 1024 + (k + 512);
  // BodyParts3D skin is a thin closed shell: an outer and an inner layer a millimetre or two apart, with opposite
  // normals. Keep only the inner layer (normal pointing at the tissue below), so "inward" means the same everywhere.
  const TG = new Map(), TC = 0.01, tk = (x, y, z) => Math.floor(x / TC) + ',' + Math.floor(y / TC) + ',' + Math.floor(z / TC);
  for (const p of parts) for (let v = 0; v < p.pos.length / 3; v += 3) { const k = tk(p.pos[v * 3], p.pos[v * 3 + 1], p.pos[v * 3 + 2]); let a = TG.get(k); if (!a) TG.set(k, (a = [])); a.push(p.pos[v * 3], p.pos[v * 3 + 1], p.pos[v * 3 + 2]); }
  const keepSkin = new Uint8Array(ns); let kept = 0;
  for (let v = 0; v < ns; v++) {
    const x = S.pos[v * 3], y = S.pos[v * 3 + 1], z = S.pos[v * 3 + 2], cx = Math.floor(x / TC), cy = Math.floor(y / TC), cz = Math.floor(z / TC); let bd = Infinity, q = null;
    for (let r = 0; r < 6 && !q; r++) for (let i = -r; i <= r; i++) for (let j = -r; j <= r; j++) for (let k = -r; k <= r; k++) { if (Math.max(Math.abs(i), Math.abs(j), Math.abs(k)) !== r) continue; const a = TG.get((cx + i) + ',' + (cy + j) + ',' + (cz + k)); if (!a) continue; for (let t = 0; t < a.length; t += 3) { const d = (a[t] - x) ** 2 + (a[t + 1] - y) ** 2 + (a[t + 2] - z) ** 2; if (d < bd) { bd = d; q = [a[t], a[t + 1], a[t + 2]]; } } }
    if (q && (q[0] - x) * sn[v * 3] + (q[1] - y) * sn[v * 3 + 1] + (q[2] - z) * sn[v * 3 + 2] > 0) { keepSkin[v] = 1; kept++; }
  }
  for (let v = 0; v < ns; v++) { if (!keepSkin[v]) continue; const kk = key(Math.floor(S.pos[v * 3] / CELL), Math.floor(S.pos[v * 3 + 1] / CELL), Math.floor(S.pos[v * 3 + 2] / CELL)); let a = grid.get(kk); if (!a) grid.set(kk, (a = [])); a.push(v); }
  log('layering: skin inner layer', kept, 'of', ns, 'verts');
  function nearestSkin(x, y, z) {
    const ci = Math.floor(x / CELL), cj = Math.floor(y / CELL), ck = Math.floor(z / CELL); let best = -1, bd = Infinity;
    for (let r = 0; r < 8; r++) {
      for (let i = -r; i <= r; i++) for (let j = -r; j <= r; j++) for (let k = -r; k <= r; k++) {
        if (Math.max(Math.abs(i), Math.abs(j), Math.abs(k)) !== r) continue;
        const a = grid.get(key(ci + i, cj + j, ck + k)); if (!a) continue;
        for (const v of a) { const d = (S.pos[v * 3] - x) ** 2 + (S.pos[v * 3 + 1] - y) ** 2 + (S.pos[v * 3 + 2] - z) ** 2; if (d < bd) { bd = d; best = v; } }
      }
      if (best >= 0 && Math.sqrt(bd) < r * CELL) break;
    }
    return best;
  }

  // ---------- midline: a left part that crosses x = 0 is flattened onto the midline plane (its mirror does the same),
  // so the two halves meet edge to edge instead of overlapping at equal depth ----------
  const pairedBase = new Set(); { const seen = new Map(); parts.forEach((p) => { if (p.layer === 'bone' || p.side === 'C') return; const k = p.layer + '|' + p.base; seen.set(k, (seen.get(k) || 0) | (p.side === 'L' ? 1 : 2)); }); for (const [k, v] of seen) if (v === 3) pairedBase.add(k); }
  let clipped = 0;
  parts.forEach((p) => { if (p.side !== 'L' || !pairedBase.has(p.layer + '|' + p.base) || (opts.skip && opts.skip.test(p.base))) return; for (let i = 0; i < p.pos.length; i += 3) if (p.pos[i] < 0) { p.pos[i] = 0; clipped++; } });
  // ---------- parts: buckets, sample points (vertices + triangle centroids) ----------
  const M = parts.filter((p) => p.layer !== 'bone' && !(opts.skip && opts.skip.test(p.base))).map((p) => ({ p }));
  const isSup = M.map((m) => m.p.layer === 'sup'), za = M.map((m) => !!m.p.za), solve = M.map((m) => m.p.side !== 'R');
  for (const m of M) {
    const n = m.p.pos.length / 3;
    m.b = new Int32Array(n); for (let v = 0; v < n; v++) m.b[v] = nearestSkin(m.p.pos[v * 3], m.p.pos[v * 3 + 1], m.p.pos[v * 3 + 2]);
    m.ns = n + m.p.idx.length / 3;
  }
  // orient every skin normal toward the tissue actually assigned to it, so a move "inward" can never point out of the body
  { const acc = new Float64Array(ns * 3); let flipped = 0;
    M.forEach((m) => { const P = m.p.pos; for (let v = 0; v < P.length / 3; v++) { const b = m.b[v]; for (let k = 0; k < 3; k++) acc[b * 3 + k] += P[v * 3 + k] - S.pos[b * 3 + k]; } });
    for (let b = 0; b < ns; b++) { const d = acc[b * 3] * sn[b * 3] + acc[b * 3 + 1] * sn[b * 3 + 1] + acc[b * 3 + 2] * sn[b * 3 + 2]; if (d < 0) { sn[b * 3] = -sn[b * 3]; sn[b * 3 + 1] = -sn[b * 3 + 1]; sn[b * 3 + 2] = -sn[b * 3 + 2]; flipped++; } }
    log('layering: skin normals turned toward their tissue:', flipped); }
  const sampleAt = (m, s, out) => { const P = m.p.pos, nv = P.length / 3; if (s < nv) { out[0] = P[s * 3]; out[1] = P[s * 3 + 1]; out[2] = P[s * 3 + 2]; return; } const t = (s - nv) * 3, I = m.p.idx, a = I[t] * 3, b = I[t + 1] * 3, c = I[t + 2] * 3; out[0] = (P[a] + P[b] + P[c]) / 3; out[1] = (P[a + 1] + P[b + 1] + P[c + 1]) / 3; out[2] = (P[a + 2] + P[b + 2] + P[c + 2]) / 3; };
  const sampleBucket = (m, s) => (s < m.p.pos.length / 3 ? m.b[s] : m.b[m.p.idx[(s - m.p.pos.length / 3) * 3]]);
  const counts = new Int32Array(ns + 1);
  M.forEach((m) => { for (let s = 0; s < m.ns; s++) counts[sampleBucket(m, s) + 1]++; });
  for (let i = 0; i < ns; i++) counts[i + 1] += counts[i];
  const fill = counts.slice(), EP = new Int32Array(counts[ns]), ES = new Int32Array(counts[ns]);
  M.forEach((m, mi) => { for (let s = 0; s < m.ns; s++) { const o = fill[sampleBucket(m, s)]++; EP[o] = mi; ES[o] = s; } });

  const tmp = new Float64Array(3);
  function around(mi, v, accept, cb) {
    const m = M[mi], P = m.p.pos, b = m.b[v], ux = P[v * 3], uy = P[v * 3 + 1], uz = P[v * 3 + 2];
    const nx = sn[b * 3], ny = sn[b * 3 + 1], nz = sn[b * 3 + 2];
    for (const bb of ring2(b)) for (let o = counts[bb]; o < counts[bb + 1]; o++) {
      const oj = EP[o]; if (oj === mi || !accept(oj)) continue;
      sampleAt(M[oj], ES[o], tmp); const dx = tmp[0] - ux, dy = tmp[1] - uy, dz = tmp[2] - uz;
      const ax = dx * nx + dy * ny + dz * nz; if (ax < -0.04 || ax > 0.04) continue;
      const lx = dx - ax * nx, ly = dy - ax * ny, lz = dz - ax * nz; if (lx * lx + ly * ly + lz * lz > LAT * LAT) continue;
      cb(oj, ax);
    }
  }
  const skinDepth = (m, v) => { const b = m.b[v], P = m.p.pos; return (P[v * 3] - S.pos[b * 3]) * sn[b * 3] + (P[v * 3 + 1] - S.pos[b * 3 + 1]) * sn[b * 3 + 1] + (P[v * 3 + 2] - S.pos[b * 3 + 2]) * sn[b * 3 + 2]; };
  const facing = (m, nr, v) => { const b = m.b[v]; return nr[v * 3] * sn[b * 3] + nr[v * 3 + 1] * sn[b * 3 + 1] + nr[v * 3 + 2] * sn[b * 3 + 2]; };

  // move slot mi along the skin normal (+ = deeper) through a smooth field on the skin graph (about 15 mm wide), so a
  // coarse mesh moves as a whole and never folds; clear(v) is how far vertex v may move outward before the skin
  const stats = new Map();
  function apply(mi, need, tag, clear) {
    const m = M[mi], n = need.length, F = new Map(), C = new Map();
    for (let v = 0; v < n; v++) {
      const b = m.b[v];
      if (clear) C.set(b, Math.min(C.get(b) ?? Infinity, clear(v)));
      if (Math.abs(need[v]) < 2e-5) continue;
      const f = F.get(b) ?? 0; if (Math.abs(need[v]) > Math.abs(f)) F.set(b, need[v]);
    }
    if (!F.size) return;
    if (clear) for (const [b, f] of F) if (f < 0) F.set(b, Math.max(f, -(C.get(b) ?? 0))); // cap before spreading: no jumps
    const base = new Map(F); let cur = new Map(F);
    for (let it = 0; it < 7; it++) {
      const nxt = new Map(), keys = new Set(cur.keys()); for (const k of cur.keys()) for (const x of r1[k]) keys.add(x);
      for (const k of keys) {
        let a = 0, c = 0; for (const x of r1[k]) { a += cur.get(x) ?? 0; c++; }
        const sp = c ? 0.5 * (cur.get(k) ?? 0) + 0.45 * (a / c) : 0, own = base.get(k) ?? 0;
        let val = Math.abs(own) >= Math.abs(sp) ? own : sp; if (clear && val < 0 && C.has(k)) val = Math.max(val, -C.get(k));
        if (Math.abs(val) > 2e-5) nxt.set(k, val);
      }
      cur = nxt;
    }
    // per-vertex move from the field; then the inner face of a thin sheet copies the move of the outer face point next to
    // it (nearest skin-facing vertex within 6 mm), so the two faces travel together and the sheet never turns inside out
    const P = m.p.pos, nr = computeNormals(P, m.p.idx), d = new Float32Array(n);
    for (let v = 0; v < n; v++) d[v] = cur.get(m.b[v]) || 0;
    const H = 0.006, g = new Map(), kk = (x, y, z) => Math.floor(x / H) + ',' + Math.floor(y / H) + ',' + Math.floor(z / H);
    const outer = new Uint8Array(n); for (let v = 0; v < n; v++) { const b = m.b[v]; outer[v] = nr[v * 3] * sn[b * 3] + nr[v * 3 + 1] * sn[b * 3 + 1] + nr[v * 3 + 2] * sn[b * 3 + 2] < -0.2 ? 1 : 0; }
    for (let v = 0; v < n; v++) if (outer[v]) { const k = kk(P[v * 3], P[v * 3 + 1], P[v * 3 + 2]); let a = g.get(k); if (!a) g.set(k, (a = [])); a.push(v); }
    const d2 = d.slice();
    for (let v = 0; v < n; v++) {
      if (outer[v]) continue;
      const cx = Math.floor(P[v * 3] / H), cy = Math.floor(P[v * 3 + 1] / H), cz = Math.floor(P[v * 3 + 2] / H); let best = -1, bd = H * H;
      for (let i = -1; i <= 1; i++) for (let j = -1; j <= 1; j++) for (let k = -1; k <= 1; k++) { const a = g.get((cx + i) + ',' + (cy + j) + ',' + (cz + k)); if (!a) continue; for (const w of a) { const q = (P[w * 3] - P[v * 3]) ** 2 + (P[w * 3 + 1] - P[v * 3 + 1]) ** 2 + (P[w * 3 + 2] - P[v * 3 + 2]) ** 2; if (q < bd) { bd = q; best = w; } } }
      if (best >= 0) d2[v] = d[best];
    }
    // displacement vectors, smoothed over the part's own surface: neighbours whose skin normals differ (the side of the
    // back, where the skin turns fast) would otherwise travel apart or together and fold the sheet into an accordion
    let D = new Float32Array(n * 3);
    for (let v = 0; v < n; v++) { const b = m.b[v], dv = d2[v]; D[v * 3] = sn[b * 3] * dv; D[v * 3 + 1] = sn[b * 3 + 1] * dv; D[v * 3 + 2] = sn[b * 3 + 2] * dv; }
    if (!m.nb) { const nb = Array.from({ length: n }, () => new Set()); for (let t = 0; t < m.p.idx.length; t += 3) for (let k = 0; k < 3; k++) { const a = m.p.idx[t + k], c = m.p.idx[t + (k + 1) % 3]; nb[a].add(c); nb[c].add(a); } m.nb = nb.map((q) => Int32Array.from(q)); }
    for (let it = 0; it < 8; it++) { const E = new Float32Array(n * 3); for (let v = 0; v < n; v++) { const N = m.nb[v]; let x = 0, y = 0, z = 0; for (const w of N) { x += D[w * 3]; y += D[w * 3 + 1]; z += D[w * 3 + 2]; } const c = N.length || 1; E[v * 3] = 0.5 * D[v * 3] + 0.5 * x / c; E[v * 3 + 1] = 0.5 * D[v * 3 + 1] + 0.5 * y / c; E[v * 3 + 2] = 0.5 * D[v * 3 + 2] + 0.5 * z / c; } D = E; }
    let moved = 0, mx = 0;
    for (let v = 0; v < n; v++) {
      const l = Math.hypot(D[v * 3], D[v * 3 + 1], D[v * 3 + 2]); if (l < 2e-5) continue;
      P[v * 3] += D[v * 3]; P[v * 3 + 1] += D[v * 3 + 1]; P[v * 3 + 2] += D[v * 3 + 2]; moved++; mx = Math.max(mx, l);
    }
    const k = tag + ' ' + m.p.name, st = stats.get(k) || { moved: 0, max: 0 }; st.moved += moved; st.max = Math.max(st.max, mx); stats.set(k, st);
  }

  // ---------- relations ----------
  const mirror = (a, b) => M[a].p.base === M[b].p.base && M[a].p.side !== M[b].p.side && M[a].p.side !== 'C' && M[b].p.side !== 'C';
  const votes = new Map(); // "lo,hi" -> [lo above, hi above]
  M.forEach((m, mi) => {
    const n = m.p.pos.length / 3;
    for (let v = 0; v < n; v += 2) {
      const mins = new Map();
      around(mi, v, (oj) => oj > mi && !mirror(mi, oj), (oj, ax) => { if (Math.abs(ax) < 0.02) mins.set(oj, Math.min(mins.get(oj) ?? Infinity, ax)); });
      for (const [oj, ax] of mins) { const k = mi + ',' + oj; let vv = votes.get(k); if (!vv) votes.set(k, (vv = [0, 0])); if (ax < 0) vv[1]++; else vv[0]++; }
    }
  });
  const ruleTop = (a, b) => { for (const [t, u] of RULES) { if (t.test(M[a].p.base) && u.test(M[b].p.base)) return a; if (t.test(M[b].p.base) && u.test(M[a].p.base)) return b; } return null; };
  const rel = []; // { top, under, cap }
  for (const [k, [aUp, bUp]] of votes) {
    const [a, b] = k.split(',').map(Number), n = aUp + bUp; if (n < 8) continue;
    const cross = za[a] !== za[b] || (za[a] && za[b] && !isSup[a] && !isSup[b]);
    let top = ruleTop(a, b), cap = BIG;
    if (top === null) {
      if (cross) continue; // two datasets, no rule: leave it alone
      cap = SMALL;
      if (isSup[a] !== isSup[b]) { const s = isSup[a] ? a : b, f = (s === a ? aUp : bUp) / n; if (f >= 0.6) top = s; } // a superficial part covering a deep one
      else if (isSup[a]) { const f = aUp / n; if (f >= 0.72) top = a; else if (f <= 0.28) top = b; }
      if (top === null) continue;
    }
    rel.push({ top, under: top === a ? b : a, cap });
  }
  log('layering:', rel.filter((r) => r.cap === BIG).length, 'anatomy rules in play,', rel.filter((r) => r.cap === SMALL).length, 'hairline pairs');
  if (opts.verbose) rel.filter((r) => r.cap === BIG).forEach((r) => log('   rule', M[r.top].p.name, 'over', M[r.under].p.name));

  // 1. a Z-Anatomy sheet on top of BodyParts3D parts is draped over them where they bulge through it
  const drapeOver = M.map(() => new Set());
  rel.forEach((r) => { if (r.cap === BIG && za[r.top] && isSup[r.top] && !za[r.under]) drapeOver[r.top].add(r.under); });
  M.forEach((m, ci) => {
    if (!solve[ci] || !drapeOver[ci].size) return;
    const under = drapeOver[ci], n = m.p.pos.length / 3, need = new Float32Array(n), nr = computeNormals(m.p.pos, m.p.idx); let any = false;
    for (let v = 0; v < n; v++) {
      if (facing(m, nr, v) > -0.15) continue; // only the outer face of the sheet is ever seen
      let mn = Infinity; around(ci, v, (oj) => under.has(oj), (oj, ax) => { if (ax > -BIG && ax < mn) mn = ax; });
      if (mn < M_DEEP) { need[v] = -(M_DEEP - mn); any = true; }
    }
    if (any) apply(ci, need, 'drape', (v) => Math.max(0, skinDepth(m, v) - 0.0012));
  });
  // 3. tuck every lower part behind the outer face of what covers it: superficial parts outside in, then deep parts
  function tuck(mi, tops, cap, margin, tag) {
    const m = M[mi], n = m.p.pos.length / 3, need = new Float32Array(n), nr = computeNormals(m.p.pos, m.p.idx); let any = false;
    const reach = cap === BIG ? BIG : 0.005;
    for (let v = 0; v < n; v++) {
      if (facing(m, nr, v) > 0.15) continue;
      let hmin = Infinity; around(mi, v, (oj) => tops.has(oj), (oj, ax) => { if (ax < reach && ax < hmin) hmin = ax; });
      if (hmin === Infinity || hmin <= -margin) continue;
      need[v] = Math.min(cap, hmin + margin); any = true;
    }
    if (any) apply(mi, need, tag);
  }
  const groups = (mi) => { const big = new Set(), small = new Set(); rel.forEach((r) => { if (r.under !== mi) return; // a deep part goes fully under whatever covers it (it is hidden there anyway); superficial parts of one dataset only by a hair
    if ((r.cap === BIG && za[mi]) || !isSup[mi]) big.add(r.top); else small.add(r.top); }); return { big, small }; };
  const meanDepth = (mi) => { let a = 0, c = 0; for (let v = 0; v < M[mi].p.pos.length / 3; v += 5) { a += skinDepth(M[mi], v); c++; } return a / Math.max(1, c); };
  const order = M.map((_, i) => i).filter((i) => solve[i]).sort((a, b) => (isSup[b] - isSup[a]) || meanDepth(a) - meanDepth(b));
  for (let pass = 0; pass < 2; pass++) for (const mi of order) {
    const { big, small } = groups(mi), margin = isSup[mi] ? M_SUP : M_DEEP;
    if (big.size) tuck(mi, big, BIG, margin, 'tuck');
    if (small.size) tuck(mi, small, SMALL, margin, 'hair');
  }

  // 4. envelope: no deep point may sit in front of (or within a margin of) the outermost superficial surface right above
  // it, unless that surface lies much deeper (more than 8 mm: then the deep part is simply uncovered there)
  const F = new Float32Array(ns).fill(Infinity);
  M.forEach((m, mi) => { if (!isSup[mi]) return; for (let s = 0; s < m.ns; s++) { sampleAt(m, s, tmp); const b = sampleBucket(m, s); const d = (tmp[0] - S.pos[b * 3]) * sn[b * 3] + (tmp[1] - S.pos[b * 3 + 1]) * sn[b * 3 + 1] + (tmp[2] - S.pos[b * 3 + 2]) * sn[b * 3 + 2]; if (d < F[b]) F[b] = d; } });
  const F1 = F.slice(); for (let b = 0; b < ns; b++) for (const x of r1[b]) if (F[x] < F1[b]) F1[b] = F[x];
  M.forEach((m, mi) => {
    if (isSup[mi] || !solve[mi]) return;
    const n = m.p.pos.length / 3, need = new Float32Array(n); let any = false;
    for (let v = 0; v < n; v++) { const f = F1[m.b[v]]; if (f === Infinity) continue; const d = skinDepth(m, v); if (d < f + M_DEEP && f - d < 0.008) { need[v] = f + M_DEEP - d; any = true; } }
    if (any) apply(mi, need, 'envelope');
  });

  // 4b. the spinal furrow: where the two latissimus halves meet over the spinous processes, deep parts sit a few
  // millimetres further in (they attach to the spine below the sheet, never through it)
  M.forEach((m, mi) => {
    if (isSup[mi] || m.p.side !== 'L') return;
    const P = m.p.pos; for (let v = 0; v < P.length / 3; v++) { const x = P[v * 3], z = P[v * 3 + 2]; if (x > 0.012 || z > -0.03 || P[v * 3 + 1] < 0.85 || P[v * 3 + 1] > 1.42) continue; P[v * 3 + 2] += 0.005 * smooth(0.012, 0.0, x); }
  });
  if (opts.probe) M.forEach((m, mi) => {
    if (!opts.probe.test(m.p.name) || m.p.side !== 'L') return;
    const nr = computeNormals(m.p.pos, m.p.idx); let bad = 0, none = 0, tot = 0; const ex = [];
    for (let v = 0; v < m.p.pos.length / 3; v++) {
      if (facing(m, nr, v) > 0.15) continue; tot++;
      let hmin = Infinity, who = -1; around(mi, v, (oj) => isSup[oj], (oj, ax) => { if (ax < hmin) { hmin = ax; who = oj; } });
      if (hmin === Infinity) { none++; continue; }
      if (hmin > -0.0005) { bad++; if (ex.length < 6) ex.push([(hmin * 1000).toFixed(1), M[who].p.name, (skinDepth(m, v) * 1000).toFixed(1), (F1[m.b[v]] * 1000).toFixed(1), [...m.p.pos.slice(v * 3, v * 3 + 3)].map((x) => x.toFixed(3)).join(',')]); }
    }
    log('probe', m.p.name, 'outer verts', tot, 'no sup above', none, 'not covered', bad); ex.forEach((e) => log('    hmin', e[0], 'by', e[1], 'depth', e[2], 'F', e[3], 'at', e[4]));
  });
  // 5. right half = mirror of the left half (the source pairs are mirror images to begin with)
  const swap = (n) => n.replace(/\b(left|right|Left|Right)\b/g, (w) => ({ left: 'right', right: 'left', Left: 'Right', Right: 'Left' })[w]);
  const pool = new Map(); parts.forEach((p) => { if (p.side === 'L' && p.layer !== 'bone') { const k = p.layer + '|' + p.name; if (!pool.has(k)) pool.set(k, []); pool.get(k).push(p); } });
  let mirrored = 0; const unpaired = [];
  parts.forEach((p) => {
    if (p.side !== 'R' || p.layer === 'bone') return;
    const list = pool.get(p.layer + '|' + swap(p.name)); const L = list && list.shift(); if (!L) { unpaired.push(p.name); return; }
    const pos = new Float32Array(L.pos.length); for (let i = 0; i < pos.length; i += 3) { pos[i] = -L.pos[i]; pos[i + 1] = L.pos[i + 1]; pos[i + 2] = L.pos[i + 2]; }
    const idx = new Uint32Array(L.idx.length); for (let t = 0; t < idx.length; t += 3) { idx[t] = L.idx[t]; idx[t + 1] = L.idx[t + 2]; idx[t + 2] = L.idx[t + 1]; }
    p.pos = pos; p.idx = idx; mirrored++;
  });
  log('layering: midline clipped', clipped, 'verts; right half mirrored from the left,', mirrored, 'parts', unpaired.length ? 'unpaired: ' + unpaired.join(', ') : '');
  const top = [...stats.entries()].filter(([, s]) => s.max > 0.002).sort((a, b) => b[1].max - a[1].max);
  log('layering: largest moves'); top.slice(0, opts.show ?? 30).forEach(([n, s]) => log('   ', n.padEnd(58), (s.max * 1000).toFixed(1), 'mm'));
  return { rel, stats };
}
