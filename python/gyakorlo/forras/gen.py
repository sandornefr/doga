# Használat (ebben a mappában): python gen.py  – lefuttatja az összes megoldást a próbákkal, és újraírja a ../feladatok/ciklus.js-t
import json, subprocess, sys, re
sys.path.insert(0,'.')
from feladatok import F
norm=lambda t: re.sub(r'\s+','',t).lower()
def run(code, be):
    pre="import builtins\n_b=iter(%r)\ndef _i(p=''):\n    v=next(_b)\n    print(p+v)\n    return v\nbuiltins.input=_i\n"%(be,)
    r=subprocess.run([sys.executable,'-I','-c',pre+code],capture_output=True,text=True,timeout=5)
    return r.stdout, r.stderr
bad=0
for i,t in enumerate(F,1):
    assert 'def ' not in t['megoldas']
    assert t['kell'] in t['megoldas']
    if t['tesztek'] is None:
        # követők: számoljuk ki
        outs=[]
        for be in (['300'],['1000'],['151']):
            o,_=run(t['megoldas'],be); outs.append((be,[o.strip().splitlines()[-1].split(': ',1)[-1].replace('Hány követő a cél? ','')]))
        t['tesztek']=outs
    for be,ki in t['tesztek']:
        o,e=run(t['megoldas'],be)
        n=norm(o); pos=0; ok=not e
        for k in ki:
            j=n.find(norm(k),pos)
            if j<0: ok=False; break
            pos=j+len(norm(k))
        if not ok: bad+=1; print('HIBA',i,t['cim'],be,ki,'\n',o,e)
print('feladatok:',len(F),'hibás:',bad)
for t in F:
    if t['cim']=='Követők': print(t['tesztek'])
js=['// Ciklusgyakorló feladatbank (for, while – def nélkül). GENERÁLT: gyakorlo/forras/feladatok.py → gen.py',
    '// Az azonosítók (ciklus_N) a feloldás és a haladás kulcsai: NE számozd át, új feladat a végére kerüljön!',
    'window.GYAKORLO_TEMAK = window.GYAKORLO_TEMAK || [];',
    'window.GYAKORLO_TEMAK.push({',
    "  id: 'ciklus', cim: 'Ciklusok: for és while', leiras: 'Ismétlés, összegzés, számlálás, szöveg betűnként – def nélkül.',",
    '  feladatok: [']
for i,t in enumerate(F,1):
    d=dict(id=f'ciklus_{i}',sorszam=i,**{k:t[k] for k in ['cim','kell','csop','leiras','pelda','tipp','megoldas']},
           tesztek=[{'be':be,'ki':ki} for be,ki in t['tesztek']])
    js.append('    '+json.dumps(d,ensure_ascii=False)+',')
js+=['  ]','});','']
open('../feladatok/ciklus.js','w',encoding='utf-8').write('\n'.join(js))
