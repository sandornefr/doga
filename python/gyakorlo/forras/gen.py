# Használat (ebben a mappában): python gen.py
# Minden forrásfájl (alapok.py, ciklus.py) minden megoldását lefuttatja a próbákkal, és újraírja a ../feladatok/<név>.js-t.
# Az azonosítók (<téma>_N) a feloldás és a haladás kulcsai: NE számozd át, új feladat a téma végére kerüljön!
import json, subprocess, sys, re, importlib
sys.path.insert(0, '.')
FORRASOK = ['alapok', 'ciklus']
norm = lambda t: re.sub(r'\s+', '', t).lower()

def futtat(kod, be):
    elo = "import builtins\n_b=iter(%r)\ndef _i(p=''):\n    v=next(_b)\n    print(p+v)\n    return v\nbuiltins.input=_i\n" % (be,)
    r = subprocess.run([sys.executable, '-I', '-c', elo + kod], capture_output=True, text=True, timeout=5)
    return r.stdout, r.stderr

hibas = 0
for nev in FORRASOK:
    m = importlib.import_module(nev)
    js = [f'// Gyakorló feladatok – GENERÁLT FÁJL, ne kézzel szerkeszd! Forrás: forras/{nev}.py, készítő: forras/gen.py',
          'window.GYAKORLO_TEMAK = window.GYAKORLO_TEMAK || [];']
    for t in m.TEMAK:
        for i, f in enumerate(t['F'], 1):
            assert 'def ' not in f['megoldas'], f['cim']
            if f['kell']:
                assert re.search(r'\b(' + f['kell'].replace('/', '|') + r')\b', f['megoldas']), f['cim']
            if f['tesztek'] is None:   # a várt kimenetet a megoldásból számoljuk
                f['tesztek'] = [(be, [futtat(f['megoldas'], be)[0].strip().splitlines()[-1].split('? ')[-1]]) for be in (['300'], ['1000'], ['151'])]
            for be, ki in f['tesztek']:
                o, e = futtat(f['megoldas'], be)
                n, poz, ok = norm(o), 0, not e
                for k in ki:
                    j = n.find(norm(k), poz)
                    if j < 0: ok = False; break
                    poz = j + len(norm(k))
                if not ok:
                    hibas += 1; print('HIBA', t['id'], i, f['cim'], be, ki, '\n', o, e)
        fl = [dict(id=f"{t['id']}_{i}", sorszam=i, **{k: f[k] for k in ['cim', 'kell', 'csop', 'leiras', 'pelda', 'tipp', 'megoldas']},
                   tesztek=[{'be': be, 'ki': ki} for be, ki in f['tesztek']]) for i, f in enumerate(t['F'], 1)]
        js.append('window.GYAKORLO_TEMAK.push({ id: %s, cim: %s, leiras: %s, feladatok: [' % tuple(json.dumps(t[k], ensure_ascii=False) for k in ('id', 'cim', 'leiras')))
        js += ['    ' + json.dumps(x, ensure_ascii=False) + ',' for x in fl]
        js.append(']});')
    open(f'../feladatok/{nev}.js', 'w', encoding='utf-8').write('\n'.join(js) + '\n')
    print(nev, ':', sum(len(t['F']) for t in m.TEMAK), 'feladat,', len(m.TEMAK), 'téma')
print('hibás próba:', hibas)
