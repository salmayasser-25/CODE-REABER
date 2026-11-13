# Build pipeline

These scripts rebuild `model/ecorche.glb`, `model/ecorche.meshopt.glb` and `model/ecorche.structures.json` from the original BodyParts3D and Z-Anatomy downloads. The output is byte-identical to the committed files.

```bash
npm install
npm run fetch   # about 165 MB into tools/sources (skipped for files already there, checksums verified)
npm run build   # about one minute
```

You need Node.js 20+ and Python 3 (standard library only).

## Stages

| Script | Reads | Writes | What it does |
|---|---|---|---|
| `fetch-sources.mjs` | the network | `sources/` | Downloads the BodyParts3D OBJ archive and BodyExplorer's Z-Anatomy export, pinned and checksummed. |
| `index-bp3d.py` | `sources/bp3d/*.zip` | `sources/bp3d/index.json` | Reads the file id, FMA concept id, name and bounds from every OBJ header. |
| `select.py` | `index.json` | `selection.json`, `obj/` | Picks the bones, cartilages, teeth, eyes and muscles, sorts muscles into deep and superficial, fixes a few left/right labels, extracts the OBJ files. |
| `za_extract.mjs` | `sources/bodyexplorer/` | `za/` | Pulls the Z-Anatomy meshes out of the glTF export as OBJ files. |
| `stage1.mjs` | `selection.json`, `obj/`, `za/` | `cache.json`, `cache.bin` | Parses everything, finds the joint centres, converts to metres. |
| `stage2.mjs` | the cache | `../model/*`, `anatomy.bin` | Simplifies, resolves layering, mirrors, remeshes, orients, bakes ambient occlusion, exports. |

`stage2.mjs` pulls in three modules:

- `layering.mjs`: the anatomical layering rules and the smooth displacement field;
- `remesh.mjs`: the distance-field rebuild for the fibre-bundle muscles;
- `export-glb.mjs`: the glTF writer, which uses `KHR_mesh_quantization` and `EXT_meshopt_compression`.

## Options for `stage2.mjs`

All options are environment variables.

| Variable | Effect |
|---|---|
| `GLB=path/name` | Where the glTF files go (default `../model/ecorche`). `GLB=0` skips them. |
| `OUT=name` | Base name of the runtime blob (default `anatomy`). |
| `NOLAYER=1` | Skips the layering pass, to compare with the raw overlap. |
| `DBG=regex`, `PROBE=regex` | Logs the layering decisions for the structures that match. |

## The runtime blob

`stage2.mjs` also writes `anatomy.bin` (and a base64 copy) in a compact format made for a single-page web viewer. It holds the three layers merged, with skin weights for a 20-bone rig, body-zone weights, fibre directions and a lighter index buffer for phones, all meshopt-encoded. The glTF files do not need it. It is kept because the original site that commissioned the figure loads it. The header (JSON, at the start of the file) describes the layout.

## Notes

- `sources/`, `obj/`, `za/`, the cache files and `anatomy.*` are build products and are ignored by git.
- The layering rules are written for these two datasets and this selection. If you add structures, run with `PROBE` on them and check the result from several angles before trusting it.
