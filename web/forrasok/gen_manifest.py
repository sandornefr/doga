# Feladatonként kilistázza a feladat mappájának fájljait a manifest.json-ba (a statikus oldal nem tud mappát listázni).
# A szerkesztő útvonal-kiegészítése (web/pathcomplete.js) ebből dolgozik.
# Új feladat / új kép után futtasd újra:  python gen_manifest.py
import json, os

root = os.path.dirname(os.path.abspath(__file__))
out = {}
for d in sorted(os.listdir(root)):
    base = os.path.join(root, d)
    if not os.path.isdir(base):
        continue
    files = []
    for dirpath, _dirs, names in os.walk(base):
        for n in names:
            if n.startswith('weboldal_kodolas_') or n.startswith('.'):   # a feladatleírást a diák nem kapja a mappában
                continue
            rel = os.path.relpath(os.path.join(dirpath, n), base).replace(os.sep, '/')
            files.append(rel)
    out[d] = sorted(files)
with open(os.path.join(root, 'manifest.json'), 'w', encoding='utf-8', newline='\n') as f:
    json.dump(out, f, ensure_ascii=False, indent=1)
print({k: len(v) for k, v in out.items()})
