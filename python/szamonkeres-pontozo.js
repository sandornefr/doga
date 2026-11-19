// Számonkérés automatikus pontozása – ugyanazokkal a szabályokkal, mint az ágazati alapvizsga
// (python_teszt.js: parseCriteria, evaluateCriterion, kimenetTartalmazza, autoScoreUnscoredTasks).
// A feladatok.txt „Pontozas:” sorai a szempontok; minden teljesült szempont 1 pont.
// A kód Workerben fut (tananyag/pyrunner.js), 5 mp után leáll, így végtelen ciklus sem fagyasztja le az oldalt.
(function (root) {
'use strict';

// Feladatok.txt → { szám: { pont, criteria:[sor], modulNev, modulTartalom } }
function feladatSzempontok(txt) {
  const map = {};
  const blocks = String(txt || '').replace(/\r\n/g, '\n').split(/(?=^\d+\. feladat$)/m);
  for (const block of blocks) {
    const lines = block.split('\n');
    const m = lines[0].trim().match(/^(\d+)\. feladat$/);
    if (!m) continue;
    let pont = 8, modulNev = '', section = '';
    const crit = [], modul = [];
    for (let i = 1; i < lines.length; i++) {
      const l = lines[i], lt = l.trim();
      if (!section && lt.startsWith('Pont: ')) { pont = parseInt(lt.slice(6)) || 8; continue; }
      if (!section && lt.startsWith('ModulNev: ')) { modulNev = lt.slice(10).trim(); continue; }
      if (lt === 'Pontozas:') { section = 'p'; continue; }
      if (lt === 'Tippek:' || lt === 'Megoldas:') { section = 'x'; continue; }
      if (lt === 'ModulTartalom:') { section = 'm'; continue; }
      if (lt === 'ModulVege') { section = 'x'; continue; }
      if (section === 'p' && lt) crit.push(l.replace(/^\s+/, ''));
      else if (section === 'm') modul.push(l);
    }
    map[parseInt(m[1])] = {
      pont, criteria: parseCriteria(crit),
      modulNev, modulTartalom: modulNev ? modul.join('\n').trim() : ''
    };
  }
  return map;
}

// Mint python_teszt.js parseCriteria: "tipus:arg|címke|tipp|reakció"; az arg végén a szóköz számít.
function parseCriteria(lines) {
  return lines.map(line => {
    const parts = line.split('|');
    if (parts.length < 2) return null;
    const spec = parts[0];
    const label = parts[1].trim();
    const c = spec.indexOf(':');
    if (c === -1) return { type: spec.trim(), args: null, label };
    return { type: spec.substring(0, c).trim(), args: spec.substring(c + 1), label };
  }).filter(Boolean);
}

function kimenetTartalmazza(output, expected) {
  const out = String(output).toLowerCase();
  const exp = String(expected).toLowerCase();
  const rovid = exp.trim();
  if (/^[\p{L}\p{N}]{1,2}$/u.test(rovid)) {
    const esc = rovid.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return new RegExp(`(^|[^\\p{L}\\p{N}])${esc}($|[^\\p{L}\\p{N}])`, 'u').test(out);
  }
  return out.includes(exp);
}

function evaluateCriterion(code, criterion) {
  const { type, args } = criterion;
  if (['if', 'elif', 'else', 'for', 'while', 'def', 'return'].includes(type))
    return new RegExp(`\\b${type}\\b`).test(code);
  if (type === 'input') return (code.match(/\binput\s*\(/g) || []).length >= (parseInt(args) || 1);
  if (type === 'int_float') return (code.match(/\b(int|float)\s*\(/g) || []).length >= (parseInt(args) || 1);
  if (type === 'import')
    return new RegExp(`(^|\\n)\\s*import\\s+${args}\\b|(^|\\n)\\s*from\\s+${args}\\s+import`, 'i').test(code);
  if (type === 'tartalmaz') return code.includes(args);
  if (type === 'vagy') return args.split('~~').some(a => code.includes(a));
  if (type === 'input_format') {
    const calls = [...code.matchAll(/\binput\s*\(\s*f?["']([^"']*?)["']\s*\)/g)];
    return calls.length > 0 && calls.every(m => m[1].endsWith(' '));
  }
  if (type === 'bekeres') {
    const esc = args.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return new RegExp(`\\binput\\s*\\(\\s*f?["']${esc}["']\\s*\\)`).test(code);
  }
  return false;
}

// Mint az ágazati alapvizsgán: a bekérő szöveg és a beírt érték NEM kerül a kimenetbe,
// különben a bemenetként megadott szám a kimenetben „megtalálhatónak” számítana.
// A program által írt .txt fájlok tartalma a kimenet végére kerül (fájlba írós feladatok).
function tesztKod(code, inputs, feladat) {
  let elo = 'import sys as _kando_sys, os as _kando_os\n' +
    "for _kando_f in _kando_os.listdir('.'):\n    if _kando_f.endswith('.txt'): _kando_os.remove(_kando_f)\n";
  if (feladat && feladat.modulNev && feladat.modulTartalom)
    elo += `open(${JSON.stringify(feladat.modulNev)},'w',encoding='utf-8').write(${JSON.stringify(feladat.modulTartalom + '\n')})\n` +
      "if '' not in _kando_sys.path: _kando_sys.path.insert(0, '')\n" +
      "__import__('importlib').invalidate_caches()\n" +
      `_kando_sys.modules.pop(${JSON.stringify(feladat.modulNev.replace(/\.py$/, ''))}, None)\n`;
  elo += `_kando_mi = iter(${JSON.stringify(inputs)})\n` +
    "def input(prompt=''):\n    return str(next(_kando_mi, '')).strip()\n";
  const utana = "\nfor _kando_f in sorted(_kando_os.listdir('.')):\n    if _kando_f.endswith('.txt'):\n" +
    "        print('\\n[' + _kando_f + ']\\n' + open(_kando_f, encoding='utf-8').read())\n";
  return elo + code + '\n' + utana;
}

// Csak az időtúllépés a kód hibája; a többi (betöltési hiba, nincs internet) nem számít rossz válasznak.
function kodHibaja(msg) { return /5 másodperc után leállt|64 KiB/.test(String(msg || '')); }

// Egy beadás pontozása. Visszaad: { pont, reszletek:[{c, ok}] }, vagy hibát dob, ha a Python nem érhető el.
async function pontoz(runner, code, feladat, maxPont) {
  code = String(code || '').trim();
  const crit = (feladat && feladat.criteria) || [];
  const reszletek = [];
  for (const c of crit) {
    let ok = false;
    if (!code) ok = false;
    else if (c.type === 'teszt') {
      const sep = (c.args || '').indexOf(':');
      if (sep >= 0) {
        const be = c.args.substring(0, sep);
        const vart = c.args.substring(sep + 1);
        try {
          const res = await runner.run(tesztKod(code, be ? be.split(',') : [], feladat), []);
          ok = !res.error && kimenetTartalmazza(res.output, vart);
        } catch (e) {
          if (!kodHibaja(e && e.message)) throw e;
          ok = false;
        }
      }
    } else ok = evaluateCriterion(code, c);
    reszletek.push({ c: c.label, ok });
  }
  const jo = reszletek.filter(r => r.ok).length;
  const max = maxPont || crit.length;
  // Szempontonként 1 pont (mint az ágazatin); ha a max. pont eltér a szempontok számától, arányosan
  const pont = crit.length === max ? jo : Math.round(jo / Math.max(1, crit.length) * max);
  return { pont: Math.max(0, Math.min(pont, max)), reszletek };
}

root.SzamPontozo = { feladatSzempontok, parseCriteria, evaluateCriterion, kimenetTartalmazza, tesztKod, pontoz };
if (typeof module !== 'undefined' && module.exports) module.exports = root.SzamPontozo;
})(typeof window === 'undefined' ? globalThis : window);
