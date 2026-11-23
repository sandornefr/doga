// IKT Témaoldal – közös kód a tanári (beadasok.html) és a tanulói (temaoldal.html) oldalnak:
// az előellenőrzés a pontozó szerint (feltöltött fájlokra és github.io oldalra), a pontozó-táblázat
// és a „Megnézem” nézegető. Az oldal adja: API, AUTH, OLDALAK, H2_SORREND, esc, TEMAK, temak,
// beadasok, ellenorzes, sorFrissit, listaRajz, csoportNev, temaNev. A tanulói oldalon IKT_TANULO = true:
// ott a nézegető csak olvasható, a visszajelzést megjeleníti (nem szerkeszti).
(function () {
  if (document.getElementById('nz')) return;
  const d = document.createElement('div');
  d.innerHTML = `<div id="nz" class="nz" hidden>
  <div class="nz-fej">
    <span id="nz-nev" class="nz-cim"></span>
    <span id="nz-forras" class="nz-forras-valto"></span>
    <a id="nz-uj" href="#" target="_blank" rel="noopener" class="nz-uj"><i class="fas fa-up-right-from-square"></i> Megnyitás új lapon</a>
    <button class="nz-x" onclick="nzBezar()" title="Bezárás (Esc)"><i class="fas fa-xmark"></i></button>
  </div>
  <div class="nz-test">
    <nav id="nz-fajlok" class="nz-fajlok"></nav>
    <section class="nz-kozep">
      <div id="nz-fulek" class="nz-fulek">
        <button data-f="kod" class="aktiv" onclick="nzFul('kod')"><i class="fas fa-code"></i> Kód</button>
        <button data-f="kinezet" onclick="nzFul('kinezet')"><i class="fas fa-desktop"></i> Kinézet</button>
      </div>
      <div id="nz-kod" class="nz-kod"></div>
      <div id="nz-kinezet" class="nz-kinezet" hidden>
        <iframe id="nz-iframe" sandbox="allow-popups" referrerpolicy="no-referrer" title="A tanuló oldala"></iframe>
        <div id="nz-kep" class="nz-kep" hidden></div>
      </div>
    </section>
    <aside id="nz-pont" class="nz-pont"></aside>
  </div>
</div>`;
  document.body.appendChild(d.firstElementChild);
})();

const ghEll = {};   // beadás id → a GitHubos ellenőrzés eredménye
async function futtat(b, mod) {
  if (mod === 'github') {
    const alap = githubAlap(b.githubUrl);
    ghEll[b.id] = alap ? { fut: true } : { hiba: 'A cím nem https://….github.io/… alakú: ' + b.githubUrl };
    sorFrissit(b);
    if (!alap) return;
    try {
      const forras = forrasGithub(alap);
      ghEll[b.id] = await ellenoriz(b, forras);
      if (!(await forras.letezik('index.html')))
        ghEll[b.id].figyel = 'Ezen a címen nem található az index.html sem – lehet, hogy rossz a cím, vagy a GitHub Pages nincs bekapcsolva.';
    }
    catch (e) { ghEll[b.id] = { hiba: 'Nem sikerült letölteni a GitHubról: ' + e.message }; }
  } else {
    ellenorzes[b.id] = await ellenoriz(b, forrasFajlok(b));
  }
  sorFrissit(b);
}

function tablaRajz(e) {
  return `<table class="ell"><thead><tr><th>#</th><th>Szempont</th><th>Eredmény</th><th>Pont</th></tr></thead><tbody>
    ${e.sorok.map((s, i) => `<tr><td class="p">${i + 1}</td><td>${esc(s.cim)}</td>
      <td>${s.allapot === 'ok' ? '<span class="ok"><i class="fas fa-check"></i></span> ' : s.allapot === 'nem' ? '<span class="nem"><i class="fas fa-xmark"></i></span> ' : '<span class="kezi"><i class="fas fa-user-pen"></i> kézi</span> '}${esc(s.megj || '')}</td>
      <td class="p">${s.allapot === 'kezi' ? '? / ' + s.max : (s.allapot === 'ok' ? s.max : 0) + ' / ' + s.max}</td></tr>`).join('')}
    </tbody></table>`;
}
const pontSzoveg = e => `${e.auto} <small>/ ${e.autoMax} automatikus · ${e.keziMax} pont kézi</small>`;

// ── Előellenőrzés a pontozó szerint ──
// A beadás témájának sorszáma: szorgalminál a feladat nevéből („szorgalmi-12”), különben a kapott téma.
function beadasTemaSorszam(b) {
  const m = /^szorgalmi-(\d+)$/.exec(b.feladat || '');
  if (m) return +m[1];
  const t = temak[b.email];
  return t ? t.temaSorszam : null;
}
const szorgalmiE = b => /^szorgalmi-/.test(b.feladat || '');
function kapottTema(b) {
  const n = beadasTemaSorszam(b);
  return n && TEMAK[n - 1] ? TEMAK[n - 1][0] : null;
}
// Kis-nagybetű és szóközök nélkül; a zárójeles kiegészítés elhagyható (pl.: „Macskafélék (vadon élő)” = „Macskafélék”).
function temaEgyezik(h1, tema) {
  const n = x => String(x || '').toLowerCase().replace(/\s+/g, ' ').replace(/[.!]+$/, '').trim();
  return n(h1) === n(tema) || n(h1) === n(tema.replace(/\s*\(.*?\)\s*/g, ' '));
}
const fajlnev = href => decodeURIComponent(String(href || '').split(/[?#]/)[0]).split('/').pop().toLowerCase();

// ── Források: ugyanazt az ellenőrzést kapja a feltöltött fájl és a github.io oldal ──
// szoveg(út): a fájl szövege vagy null · letezik(út): van-e ilyen fájl · meret(út): bájt vagy null
// Az út a weboldal gyökeréhez képest értendő (pl.: tema.html, css/style.css, img/kep.jpg).
function forrasFajlok(b) {
  const keres = ut => b.fajlok.find(x => x.fajlnev.toLowerCase() === fajlnev(ut));
  const cache = {};
  return {
    tipus: 'fajl',
    hianyUzenet: ut => 'nincs beadva: ' + fajlnev(ut),
    szoveg(ut) {
      const f = keres(ut);
      if (!f) return Promise.resolve(null);
      return cache[f.fajlnev] ||= fetch(API + '/api/ikt/beadas/' + b.id + '/fajl/' + encodeURIComponent(f.fajlnev), { headers: AUTH })
        .then(r => r.ok ? r.text() : null).catch(() => null);
    },
    letezik: ut => Promise.resolve(!!keres(ut)),
    meret: ut => Promise.resolve(keres(ut) ? keres(ut).meret : null),
    vanKep: () => b.fajlok.some(f => /\.(jpe?g|png|gif|webp)$/i.test(f.fajlnev)),
  };
}

// A github.io cím alapja: https://<név>.github.io/<mappa>/ – ha fájlra mutat, annak a mappája.
function githubAlap(url) {
  try {
    const u = new URL(String(url || '').trim());
    if (u.protocol !== 'https:' || !/^[a-z0-9-]+\.github\.io$/i.test(u.hostname)) return null;
    let p = u.pathname;
    // Csak a .html/.htm végű utolsó tag fájl; a pontot tartalmazó mappanév (pl.: IKT_9.A-1.cs) mappa marad.
    if (/\/[^/]+\.html?$/i.test(p)) p = p.replace(/[^/]+$/, '');
    if (!p.endsWith('/')) p += '/';
    return u.origin + p;
  } catch (e) { return null; }
}

function forrasGithub(alap) {
  const cache = {};
  const letolt = ut => {
    const cel = new URL(String(ut).replace(/^\.\//, ''), alap).href;
    return cache[cel] ||= fetch(cel, { cache: 'no-store' })
      .then(async r => r.ok ? { ok: true, blob: await r.blob() } : { ok: false })
      .catch(() => ({ ok: false, hiba: true }));
  };
  return {
    tipus: 'github',
    alap,
    hianyUzenet: ut => ut + ' nem található a GitHubon – lehet, hogy nem töltötte fel',
    szoveg: async ut => { const r = await letolt(ut); return r.ok ? await r.blob.text() : null; },
    letezik: async ut => (await letolt(ut)).ok,
    meret: async ut => { const r = await letolt(ut); return r.ok ? r.blob.size : null; },
    vanKep: null,   // a GitHubon a tema.html képének megléte számít (lent)
  };
}
const szoveg = el => (el ? el.textContent : '').replace(/\s+/g, ' ').trim();
const mondatok = t => (t.match(/[^.!?]+[.!?]+/g) || []).length;

// A h2-k közötti elemek (dokumentum-sorrendben), a megadott alcím után a következő h2-ig.
function szakasz(doc, cim) {
  const minden = [...doc.body.querySelectorAll('*')];
  const kezd = minden.findIndex(el => el.tagName === 'H2' && szoveg(el).toLowerCase() === cim.toLowerCase());
  if (kezd < 0) return [];
  const ki = [];
  for (let i = kezd + 1; i < minden.length && minden[i].tagName !== 'H2'; i++) ki.push(minden[i]);
  return ki;
}

async function ellenoriz(b, f) {
  const sorok = [];
  const add = (cim, max, allapot, megj) => sorok.push({ cim, max, allapot, megj });
  const [temaSzoveg, cssNyers] = await Promise.all([f.szoveg('tema.html'), f.szoveg('css/style.css')]);
  const cssSzoveg = cssNyers || '';
  const doc = temaSzoveg ? new DOMParser().parseFromString(temaSzoveg, 'text/html') : null;
  const head = doc ? doc.head : null;
  let kepMegvan = false;

  add('A tema.html beadva', 1, temaSzoveg ? 'ok' : 'nem', temaSzoveg ? '' : f.hianyUzenet('tema.html'));
  if (!doc) {
    ['Alap szerkezet és lang="hu"', 'title: Weboldalam', 'A css/style.css csatolva'].forEach(c => add(c, 1, 'nem', ''));
  } else {
    const szerk = /<!doctype html>/i.test(temaSzoveg) && /<head[\s>]/i.test(temaSzoveg) && /<body[\s>]/i.test(temaSzoveg);
    const lang = (doc.documentElement.getAttribute('lang') || '').toLowerCase() === 'hu';
    add('Alap szerkezet és lang="hu"', 1, szerk && lang ? 'ok' : 'nem', [!szerk && 'hiányos váz (doctype/head/body)', !lang && 'nincs lang="hu"'].filter(Boolean).join(', '));
    const title = szoveg(head.querySelector('title'));
    add('title: Weboldalam', 1, title === 'Weboldalam' ? 'ok' : 'nem', title ? '„' + title + '”' : 'nincs title');
    const link = [...head.querySelectorAll('link[rel~="stylesheet"]')].some(l => (l.getAttribute('href') || '').replace(/^\.\//, '') === 'css/style.css');
    add('A css/style.css csatolva', 1, link ? 'ok' : 'nem', link ? '' : 'nincs <link href="css/style.css"> a head-ben');
  }

  // Menü: minden beadott oldalon legyen tema.html link, és a menü minden linkje létező fájlra mutasson.
  const hianyzik = [], nincsMeg = [], rosszLink = [];
  const oldalSzoveg = await Promise.all(OLDALAK.map(o => o === 'tema.html' ? temaSzoveg : f.szoveg(o)));
  for (let i = 0; i < OLDALAK.length; i++) {
    const o = OLDALAK[i], t = oldalSzoveg[i];
    if (t == null) { nincsMeg.push(o); continue; }
    const d = new DOMParser().parseFromString(t, 'text/html');
    const linkek = [...d.querySelectorAll('nav a, a')].map(a => a.getAttribute('href') || '');
    if (!linkek.some(h => fajlnev(h) === 'tema.html')) hianyzik.push(o);
    for (const h of linkek.filter(h => /\.html?$/i.test(h.split(/[?#]/)[0]) && !/^https?:/i.test(h)))
      if (!(await f.letezik(h.split(/[?#]/)[0]))) rosszLink.push(o + ' → ' + h);
  }
  add('A menüben ott a Témám, minden oldalon, és működik', 2, hianyzik.length || nincsMeg.length || rosszLink.length ? 'nem' : 'ok',
    [nincsMeg.length && (f.tipus === 'github' ? 'nem található a GitHubon: ' : 'nincs beadva: ') + nincsMeg.join(', '),
     hianyzik.length && 'nincs tema.html link: ' + hianyzik.join(', '),
     rosszLink.length && 'nem létező oldal: ' + rosszLink.slice(0, 3).join(', ')].filter(Boolean).join(' · '));

  if (!doc) {
    ['h1: a téma neve', 'Öt alcím (h2) jó sorrendben'].forEach(c => add(c, 1, 'nem', ''));
    add('Bemutatás 2 mondat · Érdekességek 2 érdekesség', 2, 'nem', '');
    add('Kép: img mappából, alt és title', 2, 'nem', '');
    add('„Tudj meg többet!” hivatkozás, új lapon', 2, 'nem', '');
    add('Rendezetlen lista 3 jellemzővel', 1, 'nem', '');
    add('Rendezett lista 3 „leg”-gel', 1, 'nem', '');
    add('Táblázat: fejléc + 3 sor, szegély a style.css-ből', 3, 'nem', '');
  } else {
    const h1 = szoveg(doc.querySelector('h1'));
    const kapott = b.weboldalbol ? null : kapottTema(b);
    if (!h1) add('h1: a téma neve', 1, 'nem', 'nincs h1');
    else if (!kapott) add('h1: a téma neve', 1, 'kezi', '„' + h1 + '” – ' + (b.weboldalbol ? 'a témát órán kapta, nézd meg kézzel' : 'a tanulónak nincs kiosztott témája'));
    else add('h1: a téma neve', 1, temaEgyezik(h1, kapott) ? 'ok' : 'nem', '„' + h1 + '” · kapott téma: „' + kapott + '”');
    const h2k = [...doc.querySelectorAll('h2')].map(szoveg);
    const jo = h2k.length >= 5 && H2_SORREND.every((c, i) => (h2k[i] || '').toLowerCase() === c.toLowerCase());
    add('Öt alcím (h2) jó sorrendben', 1, jo ? 'ok' : 'nem', jo ? '' : 'van: ' + (h2k.join(', ') || 'nincs h2'));

    const bemP = szakasz(doc, 'Bemutatás').filter(e => e.tagName === 'P').map(szoveg).join(' ');
    const erdP = szakasz(doc, 'Érdekességek').filter(e => e.tagName === 'P').map(szoveg).join(' ');
    const bemOk = mondatok(bemP) >= 2, erdOk = erdP.length > 0;
    add('Bemutatás 2 mondat · Érdekességek 2 érdekesség', 2, bemOk && erdOk ? 'kezi' : 'nem',
      [`Bemutatás: ${mondatok(bemP)} mondat`, erdOk ? 'Érdekességek: van bekezdés (saját szavak? 2 érdekesség?)' : 'nincs bekezdés az Érdekességek alatt'].join(' · '));

    const img = szakasz(doc, 'Bemutatás').find(e => e.tagName === 'IMG') || doc.querySelector('img');
    if (!img) add('Kép: img mappából, alt és title', 2, 'nem', 'nincs kép');
    else {
      const src = img.getAttribute('src') || '';
      const hibak = [];
      if (!/^(\.\/)?img\//i.test(src)) hibak.push('nem az img mappából: ' + src);
      else if (!(await f.letezik(src))) { hibak.push(f.tipus === 'github' ? f.hianyUzenet(src.replace(/^\.\//, '')) : 'a képfájl nincs beadva: ' + fajlnev(src)); }
      else kepMegvan = true;
      if (!(img.getAttribute('alt') || '').trim()) hibak.push('nincs alt');
      if (!(img.getAttribute('title') || '').trim()) hibak.push('nincs title');
      const meret = kepMegvan ? await f.meret(src) : null;
      add('Kép: img mappából, alt és title', 2, hibak.length ? 'nem' : 'kezi',
        hibak.length ? hibak.join(', ') : `${fajlnev(src)}${meret ? ' (' + Math.max(1, Math.round(meret / 1024)) + ' KB)' : ''} – témához illő? nem a legnagyobb felbontás?`);
    }

    const a = [...doc.querySelectorAll('a')].find(x => szoveg(x).replace(/[!.]+$/, '').toLowerCase() === 'tudj meg többet');
    if (!a) add('„Tudj meg többet!” hivatkozás, új lapon', 2, 'nem', 'nincs ilyen szövegű link');
    else {
      const href = a.getAttribute('href') || '';
      const ujlap = (a.getAttribute('target') || '').toLowerCase() === '_blank';
      const kulso = /^https?:\/\//i.test(href);
      add('„Tudj meg többet!” hivatkozás, új lapon', 2, ujlap && kulso ? 'kezi' : 'nem',
        [kulso ? href : 'nem weboldal: ' + (href || 'üres'), !ujlap && 'nincs target="_blank"'].filter(Boolean).join(' · ') + (ujlap && kulso ? ' – témához illő?' : ''));
    }

    const ul = szakasz(doc, 'Jellemzők').find(e => e.tagName === 'UL');
    const ulDb = ul ? ul.querySelectorAll(':scope > li').length : 0;
    add('Rendezetlen lista 3 jellemzővel', 1, ulDb >= 3 ? 'ok' : 'nem', ul ? ulDb + ' elem' : 'nincs ul a Jellemzők alatt');

    const ol = szakasz(doc, 'Rangsor').find(e => e.tagName === 'OL');
    const olDb = ol ? ol.querySelectorAll(':scope > li').length : 0;
    add('Rendezett lista 3 „leg”-gel', 1, olDb >= 3 ? 'kezi' : 'nem',
      ol ? olDb + ' elem: ' + [...ol.querySelectorAll(':scope > li')].map(szoveg).join(', ') + ' – helyes sorrend?' : 'nincs ol a Rangsor alatt');

    const tbl = szakasz(doc, 'Adatok').find(e => e.tagName === 'TABLE') || doc.querySelector('table');
    const thDb = tbl ? tbl.querySelectorAll('th').length : 0;
    const adatSor = tbl ? [...tbl.querySelectorAll('tr')].filter(tr => tr.querySelector('td')).length : 0;
    const css = cssSzoveg.replace(/\/\*[\s\S]*?\*\//g, '');
    // Szegély a style.css-ből (így ellenőrizhető, hogy a CSS-csatolás működik); a cellákba írt stílus nem elég.
    const cssSzegely = /(^|[},\s])(th\s*,\s*td|td\s*,\s*th)\s*\{[^}]*border\s*:/i.test(css)
      || (/(^|[},\s])td\s*\{[^}]*border\s*:/i.test(css) && /(^|[},\s])th\s*\{[^}]*border\s*:/i.test(css));
    const cellak = tbl ? [...tbl.querySelectorAll('th, td')] : [];
    const inlineSzegely = cellak.length > 0 && cellak.every(c => /border\s*:/i.test(c.getAttribute('style') || ''));
    const cellaSzegely = cssSzegely;
    const hibak = [];
    if (!tbl) hibak.push('nincs táblázat');
    else {
      if (thDb < 3) hibak.push('fejléc: ' + thDb + ' th');
      if (adatSor < 3) hibak.push('adatsor: ' + adatSor);
    }
    if (!cellaSzegely) hibak.push(inlineSzegely ? 'a szegély a cellákban van, nem a style.css-ben' : 'a style.css-ben nincs th, td szegély');
    add('Táblázat: fejléc + 3 sor, szegély a style.css-ből', 3, hibak.length ? 'nem' : 'kezi',
      hibak.length ? hibak.join(', ') : `${thDb} oszlop, ${adatSor} adatsor – a megadott oszlopok?`);
  }

  const hianyFajl = [];
  for (const n of [...OLDALAK, 'css/style.css']) if (!(await f.letezik(n))) hianyFajl.push(n);
  const kep = f.vanKep ? f.vanKep() : kepMegvan;
  const kapott = kapottTema(b);
  const h1Jo = b.weboldalbol || !!(doc && kapott && temaEgyezik(szoveg(doc.querySelector('h1')), kapott));
  add('Minden fájl beadva (HTML-ek, style.css, képek), a témája egyezik a kapott témával', 1,
    hianyFajl.length || !kep || !h1Jo ? 'nem' : 'ok',
    [hianyFajl.length || !kep ? (f.tipus === 'github' ? 'nem található a GitHubon: ' : 'hiányzik: ') + [...hianyFajl, !kep && 'kép'].filter(Boolean).join(', ') : '',
     b.weboldalbol ? '' : !kapott ? 'nincs kiosztott téma' : !h1Jo ? 'a h1 nem a kapott téma' : ''].filter(Boolean).join(' · '));

  const auto = sorok.filter(s => s.allapot === 'ok').reduce((a, s) => a + s.max, 0);
  const autoMax = sorok.filter(s => s.allapot !== 'kezi').reduce((a, s) => a + s.max, 0);
  const keziMax = sorok.filter(s => s.allapot === 'kezi').reduce((a, s) => a + s.max, 0);
  return { sorok, auto, autoMax, keziMax };
}


// ══════════════════════════════════════════════════════════════════════════
//  Nézegető: a tanuló fájljai kóddal és kinézettel, mellette az előellenőrzés
//  (ugyanazon a lapon, ablakban). A tanulói kód csak szövegként jelenik meg
//  (minden darab esc()-pel), a kinézet sandboxolt iframe-ben – szkript nem fut.
// ══════════════════════════════════════════════════════════════════════════
const KEP_RE = /\.(jpe?g|png|gif|webp)$/i;
let nz = null;   // { b, mod: 'fajl'|'github', forras, fajlok: [{ut, nev}], aktiv, ful: 'kod'|'kinezet' }

function nzMegnyit(id) {
  const b = [...beadasok, ...(typeof szorgalmiLista !== 'undefined' ? szorgalmiLista : [])].find(x => String(x.id) === String(id));
  if (!b) return;
  nz = { b, ful: 'kod' };
  document.getElementById('nz').hidden = false;
  document.body.style.overflow = 'hidden';
  const tn = beadasTemaSorszam(b);
  document.getElementById('nz-nev').textContent = (b.nev || b.email) + ' · ' + csoportNev(b) + ' · ' +
    (szorgalmiE(b) ? 'Szorgalmi: ' : '') + (tn && TEMAK[tn - 1] ? tn + '. ' + TEMAK[tn - 1][0] : 'nincs téma');
  const valto = document.getElementById('nz-forras');
  valto.innerHTML = (b.fajlok.length ? '<button data-m="fajl">Feltöltött fájlok</button>' : '') +
                    (b.githubUrl ? '<button data-m="github"><i class="fab fa-github"></i> GitHub</button>' : '');
  valto.querySelectorAll('button').forEach(g => g.onclick = () => nzForras(g.dataset.m));
  nzForras(b.fajlok.length ? 'fajl' : 'github');
}

function nzBezar() {
  document.getElementById('nz').hidden = true;
  document.getElementById('nz-iframe').src = 'about:blank';
  document.body.style.overflow = '';
  nz = null;
}

async function nzForras(mod) {
  const b = nz.b;
  nz.mod = mod;
  document.querySelectorAll('#nz-forras button').forEach(g => g.classList.toggle('aktiv', g.dataset.m === mod));
  const lista = document.getElementById('nz-fajlok');
  if (mod === 'fajl') {
    nz.forras = forrasFajlok(b);
    nz.alap = API + b.elonezet;
    const sorrend = n => { const i = [...OLDALAK, 'style.css'].indexOf(n.toLowerCase()); return i < 0 ? 99 : i; };
    nz.fajlok = b.fajlok.map(f => ({ ut: /\.css$/i.test(f.fajlnev) ? 'css/' + f.fajlnev : KEP_RE.test(f.fajlnev) ? 'img/' + f.fajlnev : f.fajlnev, nev: f.fajlnev }))
      .sort((x, y) => sorrend(x.nev) - sorrend(y.nev) || x.nev.localeCompare(y.nev));
  } else {
    const alap = githubAlap(b.githubUrl);
    if (!alap) { lista.innerHTML = '<p class="hiba">Hibás github.io cím.</p>'; return; }
    nz.forras = forrasGithub(alap);
    nz.alap = alap;
    nz.fajlok = [...OLDALAK, 'css/style.css'].map(ut => ({ ut, nev: ut.split('/').pop() }));
    lista.innerHTML = '<p class="megj">Letöltés a GitHubról…</p>';
    // A képek a letöltött oldalakból (img src), relatív útvonallal.
    const kepek = new Set();
    for (const o of OLDALAK) {
      const t = await nz.forras.szoveg(o);
      if (!t) continue;
      new DOMParser().parseFromString(t, 'text/html').querySelectorAll('img[src]').forEach(i => {
        const s = (i.getAttribute('src') || '').replace(/^\.\//, '');
        if (s && !/^(https?:|data:|\/\/)/i.test(s)) kepek.add(s.split(/[?#]/)[0]);
      });
    }
    kepek.forEach(ut => nz.fajlok.push({ ut, nev: ut.split('/').pop() }));
    if (nz.mod !== 'github') return;   // közben átváltott
  }
  lista.innerHTML = nz.fajlok.map((f, i) => `<button data-i="${i}"><i class="far ${KEP_RE.test(f.nev) ? 'fa-image' : /\.css$/i.test(f.nev) ? 'fa-file-lines' : 'fa-file-code'}"></i> ${esc(f.nev)}</button>`).join('');
  lista.querySelectorAll('button').forEach(g => g.onclick = () => nzFajl(+g.dataset.i));
  nzPontozas();
  const tema = nz.fajlok.findIndex(f => f.nev.toLowerCase() === 'tema.html');
  nzFajl(tema >= 0 ? tema : 0);
}

function nzPontozas() {
  const el = document.getElementById('nz-pont');
  const e = nz.mod === 'github' ? ghEll[nz.b.id] : ellenorzes[nz.b.id];
  if (!e) {
    el.innerHTML = '<p class="megj">Ellenőrzés…</p>';
    futtat(nz.b, nz.mod).then(() => { if (nz) nzPontozas(); });
    return;
  }
  if (e.fut) { el.innerHTML = '<p class="megj">Ellenőrzés…</p>'; setTimeout(() => nz && nzPontozas(), 800); return; }
  if (e.hiba) { el.innerHTML = `<p class="hiba">${esc(e.hiba)}</p>`; return; }
  const fejlec = `<div class="nz-osszeg">${pontSzoveg(e)}</div>` + (e.figyel ? `<p class="hiba">${esc(e.figyel)}</p>` : '') + tablaRajz(e);
  if (typeof IKT_TANULO !== 'undefined' && IKT_TANULO) {
    // Tanulói nézet: csak olvasható; a „kézi” pontokat a tanár bírálja el; alatta a tanár visszajelzése.
    const v = nz.b.visszajelzes;
    el.innerHTML = fejlec + '<p class="megj" style="margin-top:8px">A „kézi” pontokat a tanárod nézi meg és pontozza.</p>' +
      (v ? `<div class="vj-szerk"><b><i class="fas fa-comment-dots"></i> Visszajelzés a tanárodtól</b> <span class="megj">(${esc(v.updatedAt)})</span>` +
           `<div style="margin-top:6px">${esc(v.szoveg).replace(/\n/g, '<br>')}</div></div>` : '');
    return;
  }
  el.innerHTML = fejlec +
    `<div class="vj-szerk"><label for="vj-szoveg"><b>Visszajelzés a tanulónak</b></label>
      <textarea id="vj-szoveg" rows="7" maxlength="4000"></textarea>
      <div class="vj-sor"><button id="vj-kuld" class="vj-gomb"><i class="fas fa-paper-plane"></i> Elküldöm</button><span id="vj-allapot" class="megj"></span></div></div>`;
  const v = nz.b.visszajelzes;
  document.getElementById('vj-szoveg').value = v ? v.szoveg : vjJavaslat(e);
  document.getElementById('vj-allapot').textContent = v ? 'Elküldve: ' + v.updatedAt + (v.elolvasvaAt ? ' · elolvasta: ' + v.elolvasvaAt : '') : '';
  document.getElementById('vj-kuld').onclick = vjKuld;
}

// A hiányzó (piros) pontokból számozott, felszólító hibalista – a „kézi” pontok kimaradnak.
const VJ_MONDAT = {
  'A tema.html beadva': 'Hozd létre a tema.html fájlt a weboldal mappádban, és add be!',
  'Alap szerkezet és lang="hu"': 'Hozd létre az alap HTML szerkezetet, és állítsd a nyelvet magyarra!',
  'title: Weboldalam': 'A weboldal lapfülön megjelenő címe legyen: Weboldalam!',
  'A css/style.css csatolva': 'Csatold a css mappában lévő style.css-t!',
  'A menüben ott a Témám, minden oldalon, és működik': 'Készítsd el a navigációt! Ügyelj arra, hogy a többi oldaladról is elérhető legyen az új témaoldalad!',
  'h1: a téma neve': 'Főcímként írd ki a kapott témád nevét!',
  'Öt alcím (h2) jó sorrendben': 'Készíts öt alcímet ebben a sorrendben: Bemutatás, Érdekességek, Jellemzők, Adatok, Rangsor!',
  'Bemutatás 2 mondat · Érdekességek 2 érdekesség': 'A Bemutatás alá írj egy legalább 2 mondatos bekezdést, az Érdekességek alá egy bekezdést legalább 2 érdekességgel!',
  'Kép: img mappából, alt és title': 'Tedd be a képet az img mappából a Bemutatás bekezdése alá! Ha a kép nem jeleníthető meg, vagy ha fölé viszed az egeret, jelenjen meg a képre utaló szöveg!',
  '„Tudj meg többet!” hivatkozás, új lapon': 'Az Érdekességek bekezdése alá készíts egy hivatkozást „Tudj meg többet!” szöveggel! A hivatkozás új lapon nyíljon meg!',
  'Rendezetlen lista 3 jellemzővel': 'A Jellemzők alá készíts rendezetlen listát 3 jellemzővel!',
  'Rendezett lista 3 „leg”-gel': 'A Rangsor alá írd a 3 „leg”-et rendezett listába, az elsővel kezdve!',
  'Táblázat: fejléc + 3 sor, szegély a style.css-ből': 'Az Adatok alá készíts táblázatot egy fejléc sorral és 3 sor adattal, és másold be a szegély beállítását a css/style.css fájlba!',
  'Minden fájl beadva (HTML-ek, style.css, képek), a témája egyezik a kapott témával': 'Add be az összes fájlodat (HTML-ek, style.css, képek), és figyelj, hogy a kapott témádról szóljon az oldal!',
};
function vjJavaslat(e) {
  const hibak = e.sorok.filter(s => s.allapot === 'nem');
  if (!hibak.length) return 'Szép munka, a kódod minden ellenőrzött pontja rendben van!';
  return hibak.map((s, i) => `${i + 1}. ${VJ_MONDAT[s.cim] || s.cim}` + (s.megj ? ` (${s.megj})` : '')).join('\n');
}

async function vjKuld() {
  const b = nz.b, gomb = document.getElementById('vj-kuld'), all = document.getElementById('vj-allapot');
  const szoveg = document.getElementById('vj-szoveg').value.trim();
  if (!szoveg) { all.textContent = 'Írj be valamit.'; return; }
  gomb.disabled = true; all.textContent = 'Küldés…';
  try {
    const r = await fetch(API + '/api/ikt/beadas/' + (b.vjId || b.id) + '/visszajelzes', { method: 'PUT', headers: { ...AUTH, 'Content-Type': 'application/json' }, body: JSON.stringify({ szoveg }) });
    let d = null; try { d = await r.json(); } catch (e) {}
    if (!r.ok) throw new Error((d && d.error) || ('Hiba ' + r.status));
    b.visszajelzes = d.visszajelzes;
    all.textContent = 'Elküldve: ' + d.visszajelzes.updatedAt;
    listaRajz();
  } catch (e) { all.textContent = 'Nem sikerült: ' + e.message; }
  finally { gomb.disabled = false; }
}

function nzFul(ful) {
  nz.ful = ful;
  document.querySelectorAll('#nz-fulek button').forEach(g => g.classList.toggle('aktiv', g.dataset.f === ful));
  document.getElementById('nz-kod').hidden = ful !== 'kod';
  document.getElementById('nz-kinezet').hidden = ful !== 'kinezet';
}

async function nzFajl(i) {
  const f = nz.fajlok[i];
  if (!f) return;
  nz.aktiv = i;
  document.querySelectorAll('#nz-fajlok button').forEach(g => g.classList.toggle('aktiv', +g.dataset.i === i));
  const cel = new URL(nz.mod === 'fajl' ? f.nev : f.ut, nz.alap).href;
  document.getElementById('nz-uj').href = nz.mod === 'github' ? cel : cel;
  const kod = document.getElementById('nz-kod');
  const ifr = document.getElementById('nz-iframe');
  const kepDoboz = document.getElementById('nz-kep');

  if (KEP_RE.test(f.nev)) {
    // Kép: maga a kép, a valódi mérete pixelben és KB-ban
    nzFul('kinezet');
    document.getElementById('nz-fulek').hidden = true;
    ifr.hidden = true; kepDoboz.hidden = false;
    kepDoboz.innerHTML = '<p class="megj">Betöltés…</p>';
    const meret = await nz.forras.meret(nz.mod === 'fajl' ? f.nev : f.ut);
    if (!meret) { kepDoboz.innerHTML = `<p class="hiba">${esc(nz.forras.hianyUzenet(f.ut))}</p>`; return; }
    const img = new Image();
    img.onload = () => {
      kepDoboz.innerHTML = `<div class="nz-kepadat"><b>${esc(f.nev)}</b> · ${img.naturalWidth} × ${img.naturalHeight} pixel · ${Math.max(1, Math.round(meret / 1024))} KB` +
        (img.naturalWidth > 1920 ? ' · <span class="nem">nagy felbontás</span>' : '') + '</div>';
      kepDoboz.appendChild(img);
    };
    img.onerror = () => { kepDoboz.innerHTML = '<p class="hiba">A kép nem tölthető be.</p>'; };
    img.alt = f.nev;
    img.src = cel;
    return;
  }

  document.getElementById('nz-fulek').hidden = false;
  kepDoboz.hidden = true; ifr.hidden = false;
  // Kód: a forrás szövegként, sorszámozva, színezve
  kod.innerHTML = '<p class="megj">Betöltés…</p>';
  const szoveg = await nz.forras.szoveg(nz.mod === 'fajl' ? f.nev : f.ut);
  if (nz.aktiv !== i) return;
  if (szoveg == null) {
    kod.innerHTML = `<p class="hiba">${esc(nz.forras.hianyUzenet(f.ut))}</p>`;
    ifr.src = 'about:blank';
  } else {
    const sorok = szoveg.replace(/\r\n?/g, '\n').split('\n').length;
    kod.innerHTML = `<div class="nz-sorszam">${Array.from({ length: sorok }, (_, k) => k + 1).join('\n')}</div>` +
      `<pre class="nz-forras">${/\.css$/i.test(f.nev) ? szinezCss(szoveg) : szinezHtml(szoveg)}</pre>`;
    // Kinézet: CSS-nél nincs önálló kinézet – a tema.html-t mutatja
    const latvany = /\.css$/i.test(f.nev) ? new URL(nz.mod === 'fajl' ? 'tema.html' : 'tema.html', nz.alap).href : cel;
    if (ifr.dataset.cel !== latvany) { ifr.dataset.cel = latvany; ifr.src = latvany; }
  }
  nzFul(nz.ful);
}

// ── Egyszerű színezés: minden kiírt darab esc()-en megy át ──
function szinezHtml(t) {
  return t.split(/(<!--[\s\S]*?-->|<[^>]*>)/).map(d => {
    if (!d) return '';
    if (d.startsWith('<!--')) return `<span class="sz-komment">${esc(d)}</span>`;
    if (!d.startsWith('<')) return esc(d);
    const m = d.match(/^<(\/?[!\w-]*)([\s\S]*?)(\/?)>$/);
    if (!m) return esc(d);
    const attr = m[2].replace(/([^\s=]+)(\s*=\s*)("[^"]*"|'[^']*'|[^\s"']+)?|([^\s]+)/g, (x, nev, eq, ert, magany) =>
      magany ? esc(magany) : `<span class="sz-attr">${esc(nev)}</span>${eq ? esc(eq) : ''}${ert ? `<span class="sz-ertek">${esc(ert)}</span>` : ''}`);
    // a szóközöket az attribútumok között meg kell őrizni: a csere csak a szavakat érinti
    return `<span class="sz-tag">&lt;${esc(m[1])}</span>${attr}<span class="sz-tag">${esc(m[3])}&gt;</span>`;
  }).join('');
}
function szinezCss(t) {
  return t.split(/(\/\*[\s\S]*?\*\/|\{[^}]*\})/).map(d => {
    if (!d) return '';
    if (d.startsWith('/*')) return `<span class="sz-komment">${esc(d)}</span>`;
    if (!d.startsWith('{')) return `<span class="sz-tag">${esc(d)}</span>`;
    return esc('{') + d.slice(1, -1).split(/(\/\*[\s\S]*?\*\/)/).map(r => r.startsWith('/*')
      ? `<span class="sz-komment">${esc(r)}</span>`
      : r.replace(/([^:;{}\n]+)(:)([^;{}]*)/g, '\u0000$1\u0001$2\u0002$3\u0003')
          .split(/(\u0000[^\u0001]*\u0001:\u0002[^\u0003]*\u0003)/).map(x => {
            const k = x.match(/^\u0000([^\u0001]*)\u0001:\u0002([^\u0003]*)\u0003$/);
            return k ? `<span class="sz-attr">${esc(k[1])}</span>:<span class="sz-ertek">${esc(k[2])}</span>` : esc(x);
          }).join('')).join('') + esc('}');
  }).join('');
}
document.addEventListener('keydown', e => { if (e.key === 'Escape' && nz) nzBezar(); });

