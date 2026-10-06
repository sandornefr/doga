# Feladatonként kilistázza az img/ mappa képeit a manifest.json-ba (a statikus oldal nem tud mappát listázni).
# Új feladat / új kép után futtasd újra:  python gen_manifest.py
import json, os
EXT = ('.jpg', '.jpeg', '.png', '.gif', '.svg', '.webp')
root = os.path.dirname(os.path.abspath(__file__))
out = {}
for d in sorted(os.listdir(root)):
    img = os.path.join(root, d, 'img')
    if os.path.isdir(img):
        out[d] = sorted(f for f in os.listdir(img) if f.lower().endswith(EXT))
with open(os.path.join(root, 'manifest.json'), 'w', encoding='utf-8', newline='\n') as f:
    json.dump(out, f, ensure_ascii=False, indent=1)
print({k: len(v) for k, v in out.items()})
