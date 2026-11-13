# Index the BodyParts3D "is-a" OBJ archive: file id, FMA concept id, English name and bounds, read from each file's header.
import json, os, re, zipfile
HERE = os.path.dirname(os.path.abspath(__file__))
BP = os.path.join(HERE, 'sources', 'bp3d')
z = zipfile.ZipFile(os.path.join(BP, 'isa_BP3D_4.0_obj_99.zip'))
out = []
for info in z.infolist():
    if not info.filename.endswith('.obj'):
        continue
    head = {}
    with z.open(info) as f:
        for raw in f:
            line = raw.decode('utf-8', 'replace').strip()
            if line.startswith('v '):
                break
            m = re.match(r'#\s*([^:]+?)\s*:\s*(.*)$', line)
            if m:
                head[m.group(1)] = m.group(2)
    b = [float(x) for x in re.findall(r'-?\d+(?:\.\d+)?', head.get('Bounds(mm)', ''))]
    out.append({'file': head['File ID'], 'cid': head.get('Concept ID') or None, 'name': head.get('English name') or None,
                'bounds': [round(x, 4) for x in b], 'size': info.file_size})
json.dump(out, open(os.path.join(BP, 'index.json'), 'w'))
print('indexed', len(out), 'structures')
