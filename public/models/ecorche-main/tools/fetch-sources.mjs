// Download the two source datasets into tools/sources (about 165 MB). Files already present are kept.
import fs from 'fs';
import crypto from 'crypto';
import path from 'path';

const SOURCES = [
  // BodyParts3D 4.0, "is-a" tree, OBJ, full resolution (The Database Center for Life Science)
  { url: 'https://dbarchive.biosciencedbc.jp/data/bodyparts3d/LATEST/isa_BP3D_4.0_obj_99.zip', to: 'sources/bp3d/isa_BP3D_4.0_obj_99.zip',
    sha256: '40665852c49f218326590e204db91064a1ecfc3c6f8cbd7bbbcaac62c7cd409e' },
  // Z-Anatomy meshes as exported by the BodyExplorer project, pinned to the commit the figure was built from
  { url: 'https://raw.githubusercontent.com/JohanBellander/BodyExplorer/7d04bf3c4de2bd9cb234dd51d7e6857c099afafd/public/anatomy.glb', to: 'sources/bodyexplorer/anatomy.glb',
    sha256: '6e84529b60b64cc8f8d5cef665fda932e359e828b66d0c2dd44ec1bd9d0bd01f' },
  { url: 'https://raw.githubusercontent.com/JohanBellander/BodyExplorer/7d04bf3c4de2bd9cb234dd51d7e6857c099afafd/public/mesh_mapping.json', to: 'sources/bodyexplorer/mesh_mapping.json',
    sha256: '231a4e8c52cfeab8144e62d6a8ccbfb27ae04361b3a8d0b4f03e50668ce94596' }
];

const sha = (buf) => crypto.createHash('sha256').update(buf).digest('hex');
for (const s of SOURCES) {
  fs.mkdirSync(path.dirname(s.to), { recursive: true });
  if (fs.existsSync(s.to)) {
    const ok = sha(fs.readFileSync(s.to)) === s.sha256;
    console.log(ok ? 'ok      ' : 'CHANGED ', s.to);
    continue;
  }
  process.stdout.write('get      ' + s.url + ' ... ');
  const res = await fetch(s.url);
  if (!res.ok) throw new Error(res.status + ' ' + s.url);
  const buf = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(s.to, buf);
  console.log((buf.length / 1e6).toFixed(1) + ' MB' + (sha(buf) === s.sha256 ? '' : '  (checksum differs from the one the figure was built from)'));
}
