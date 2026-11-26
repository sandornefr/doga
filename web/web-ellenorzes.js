// A WEB vizsgafeladatok ellenőrzései a web/app.js-ből (egyetlen forrás) – app.js betöltése nélkül.
// Használja: python/szamonkeres.html (WEB számonkérés kiírása, automatikus pontozás, előnézet).
// Ugyanazzal a módszerrel, mint a review.html újraellenőrzése: a _ch segédek + availableTasks rész.
(function (root) {
'use strict';

let gyar = null;

async function betolt(base) {
  if (gyar) return gyar;
  const src = await (await fetch(base + 'app.js?t=' + Date.now(), { cache: 'no-store' })).text();
  const a = src.indexOf('const _ch = {');
  const b = src.indexOf('\nlet currentTask = null;');
  if (a < 0 || b < 0 || b < a) throw new Error('Az ellenőrzések nem találhatók a web/app.js-ben.');
  gyar = new Function('validationImages', src.slice(a, b) + '\nreturn availableTasks;');
  return gyar;
}

// A beadott / mentett munka: JSON { html, css, vh, vc, kepek:{html,css} } (vh/vc = volt-e validálás kép)
function munka(kod) {
  try {
    const o = JSON.parse(kod || '{}');
    return { html: String(o.html || ''), css: String(o.css || ''), vh: !!o.vh, vc: !!o.vc, kepek: o.kepek || {} };
  } catch { return { html: '', css: '', vh: false, vc: false, kepek: {} }; }
}

async function feladatok(base) {
  const t = (await betolt(base))({ html: null, css: null });
  return Object.values(t).map(x => ({ id: x.id, nev: x.name, pont: (x.checks || []).length }))
    .sort((p, q) => p.nev.localeCompare(q.nev, 'hu'));
}

async function feladat(base, taskId) {
  return (await betolt(base))({ html: null, css: null })[taskId] || null;
}

// → { pont, max, reszletek:[{c: szempont, ok}] } – ugyanúgy, mint a WEB dolgozat beadásakor
async function pontoz(base, taskId, kod) {
  const m = munka(kod);
  const task = (await betolt(base))({ html: m.vh ? 'van' : null, css: m.vc ? 'van' : null })[taskId];
  if (!task || !task.checks) throw new Error('Ismeretlen WEB feladat: ' + taskId);
  const doc = new DOMParser().parseFromString(m.html, 'text/html');
  const reszletek = task.checks.map(ch => {
    let ok = false;
    try {
      if (ch.id === 'html-validated') ok = m.vh;
      else if (ch.id === 'css-validated') ok = m.vc;
      else ok = !!ch.check(doc, m.html, m.css);
    } catch {}
    return { c: ch.label, ok };
  });
  return { pont: reszletek.filter(r => r.ok).length, max: reszletek.length, reszletek };
}

// Előnézet (iframe srcdoc): mint a web/app.js buildDoc, szkriptek nélkül.
// A CSS csak a <link href="css/style.css"> helyén él, az url(...) a css/ mappához képest.
function elonezet(base, task, kod) {
  const m = munka(kod);
  const alap = base + (task ? task.previewBase : '');
  const cssDir = (task && task.cssFile ? task.cssFile : 'css/style.css').replace(/[^\/]*$/, '');
  const css = m.css.replace(/url\(\s*(['"]?)([^'")]+?)\1\s*\)/gi, (x, q, u) => {
    if (/^(data:|https?:|blob:|about:|\/|#)/i.test(u)) return x;
    try { const r = new URL(u, 'http://x/' + cssDir); return 'url(' + q + r.pathname.replace(/^\//, '') + r.search + r.hash + q + ')'; }
    catch { return x; }
  });
  const minta = /<link[^>]+href=["']css\/style\.css["'][^>]*\/?>/i;
  const html = minta.test(m.html) ? m.html.replace(minta, () => '<style>' + css.replace(/<\/style/gi, '<\\/style') + '</style>') : m.html;
  const abs = new URL(alap, location.href).href;
  return '<!doctype html><html lang="hu"><head><meta charset="utf-8"><base href="' + abs + '">' +
    '<link href="' + abs + 'bootstrap/bootstrap.min.css" rel="stylesheet"></head><body>' + html + '</body></html>';
}

root.WebEllenorzes = { feladatok, feladat, pontoz, elonezet, munka };
})(window);
