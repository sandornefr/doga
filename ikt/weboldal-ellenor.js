// IKT Projektmunka I. – a tanuló github.io-s weboldalának ellenőrzése (9. évfolyam).
// A tanuló („Weboldalam”) és a tanár („Weboldal-gyűjtemény”) ugyanezt látja.
// A GitHub Pages bárhonnan letölthető (CORS), ezért a böngésző maga nézi meg az oldalakat.
// A tartalmat is nézi (Réka mintája szerint: IKT_9.A-1.cs), nem csak a tageket: üres h1, üres
// bekezdés, üres lista, üres táblázat, meg nem jelenő kép nem ér pontot. A szöveget nem várja
// betűre – minden tanulónál más –, csak hogy ki legyen töltve, és a főoldal h1-e a tanuló neve.
(function () {
  const OLDALAK = [
    { fajl: 'index.html', nev: 'Főoldal', db: 10 },
    { fajl: 'keplink.html', nev: 'Kép és link', db: 10 },
    { fajl: 'listak.html', nev: 'Listák', db: 9 },
    { fajl: 'orarend.html', nev: 'Órarend', db: 9 },
  ];

  // A github.io cím alapja: https://<név>.github.io/<mappa>/ – ha fájlra mutat, annak a mappája.
  function alap(url) {
    try {
      const u = new URL(String(url || '').trim());
      if (u.protocol !== 'https:' || !/^[a-z0-9-]+\.github\.io$/i.test(u.hostname)) return null;
      let p = u.pathname;
      if (/\/[^/]+\.[a-z0-9]+$/i.test(p)) p = p.replace(/[^/]+$/, '');
      if (!p.endsWith('/')) p += '/';
      return u.origin + p;
    } catch (e) { return null; }
  }

  const jo = url => /^https:\/\/[a-z0-9-]+\.github\.io(\/\S*)?$/i.test(String(url || '').trim());

  async function letolt(cim) {
    try {
      const r = await fetch(cim, { cache: 'no-store' });
      return r.ok ? await r.text() : null;
    } catch (e) { return null; }
  }

  // A menü: van-e nav, és abban link mind a 4 oldalra.
  function menuRendben(doc) {
    const nav = doc.querySelector('nav');
    if (!nav) return false;
    const hrefek = [...nav.querySelectorAll('a[href]')].map(a => a.getAttribute('href').trim().replace(/^\.\//, '').toLowerCase());
    return OLDALAK.every(o => hrefek.includes(o.fajl));
  }

  // Szöveg összevetéshez: kisbetű, ékezet nélkül, egy szóközzel.
  const norm = s => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
  const szavak = s => norm(s).split(' ').filter(Boolean);
  const szoveg = el => el ? el.textContent.replace(/\s+/g, ' ').trim() : '';
  const kitoltott = (gyoker, sel) => [...gyoker.querySelectorAll(sel)].map(szoveg).filter(Boolean);
  // A h1 a tanuló neve-e: a név minden (legalább 2 betűs) szava benne van, sorrendtől, ékezettől függetlenül.
  function nevEgyezik(h1, nev) {
    const h = szavak(h1), n = szavak(nev).filter(x => x.length >= 2);
    return n.length > 0 && n.every(x => h.includes(x));
  }
  // A 2. bekezdés az iskoláról szól-e (ékezet nélkül nézve).
  const ISKOLA_RE = /iskol|suli|kando|technikum|valaszt|informatik/;

  // A kép tényleg megjelenik-e: a fájl letölthető, és kép.
  async function kepMegjelenik(img, alapCim) {
    if (!img || !(img.getAttribute('src') || '').trim()) return false;
    try {
      const r = await fetch(new URL(img.getAttribute('src').trim(), alapCim).href, { cache: 'no-store' });
      return r.ok && /^image\//i.test(r.headers.get('content-type') || '');
    } catch (e) { return false; }
  }
  const altTitle = img => !!img && !!(img.getAttribute('alt') || '').trim() && !!(img.getAttribute('title') || '').trim();

  // Oldalanként a tartalmi pontok. nev: a tanuló neve (a főoldal h1-éhez; ha nincs, csak a kitöltöttséget nézi).
  async function tartalmiPontok(fajl, doc, cim, nev) {
    const h1 = szoveg(doc.querySelector('h1'));
    if (fajl === 'index.html') {
      const bek = kitoltott(doc, 'body p');
      const img = doc.querySelector('body img');
      return [
        [nev ? 'h1: a neved' : 'h1 kitöltve', !!h1 && (!nev || nevEgyezik(h1, nev))],
        ['1. bekezdés: bemutatkozás', !!bek[0] && szavak(bek[0]).length >= 5],
        ['2. bekezdés: miért a sulinkat', !!bek[1] && szavak(bek[1]).length >= 5 && ISKOLA_RE.test(norm(bek[1]))],
        ['kollázs kép megjelenik', await kepMegjelenik(img, cim)],
        ['kép: alt és title', altTitle(img)],
      ];
    }
    if (fajl === 'keplink.html') {
      const a = [...doc.querySelectorAll('body a[href]')].find(x => x.querySelector('img') && !x.closest('nav'));
      const img = a ? a.querySelector('img') : doc.querySelector('body img');
      return [
        ['h1 kitöltve', !!h1],
        ['kép megjelenik', await kepMegjelenik(img, cim)],
        ['kép: alt és title', altTitle(img)],
        ['a kép link egy weboldalra', !!a && /^https?:\/\/[^\s/]+\.[^\s]+/i.test(a.getAttribute('href').trim())],
        ['link új lapon nyílik', !!a && (a.getAttribute('target') || '').trim().toLowerCase() === '_blank'],
      ];
    }
    if (fajl === 'listak.html') {
      const ul = [...doc.querySelectorAll('ul')].find(x => !x.closest('nav'));
      const ol = doc.querySelector('ol');
      return [
        ['h1 kitöltve', !!h1],
        ['felsorolás (ul): legalább 3 kitöltött elem', !!ul && kitoltott(ul, 'li').length >= 3],
        ['számozott lista (ol): legalább 3 kitöltött elem', !!ol && kitoltott(ol, 'li').length >= 3],
        ['listacímek (2 db h2) kitöltve', kitoltott(doc, 'h2').length >= 2],
      ];
    }
    if (fajl === 'orarend.html') {
      const tabla = doc.querySelector('table');
      const adatSorok = tabla ? [...tabla.querySelectorAll('tr')].filter(tr => tr.querySelector('td')) : [];
      // Az órák: a 3. oszloptól (a napok) a kitöltött cellák.
      const orak = adatSorok.reduce((s, tr) => s + [...tr.children].slice(2).filter(c => szoveg(c)).length, 0);
      return [
        ['h1 kitöltve', !!h1],
        ['fejléc: legalább 5 kitöltött th', !!tabla && kitoltott(tabla, 'th').length >= 5],
        ['legalább 5 órasor (óra, időpont kitöltve)', adatSorok.filter(tr => [...tr.children].slice(0, 2).some(c => szoveg(c))).length >= 5],
        ['az órák beírva (legalább 5 cella)', orak >= 5],
      ];
    }
    return [];
  }

  // Eredmény: { el: bool, oldalak: [{fajl, nev, van, pontok:[{szoveg, ok}]}], ok, ossz }
  // opciok.nev: a tanuló neve (a főoldal h1-éhez).
  async function ellenoriz(url, opciok) {
    const nev = opciok && opciok.nev;
    const a = alap(url);
    if (!a) return { hiba: 'A cím nem https://….github.io/… alakú.' };
    const szovegek = await Promise.all(OLDALAK.map(o => letolt(a + o.fajl)));
    const oldalak = await Promise.all(OLDALAK.map(async (o, i) => {
      const t = szovegek[i];
      if (t == null) return { ...o, van: false, pontok: [] };
      const doc = new DOMParser().parseFromString(t, 'text/html');
      const html = doc.documentElement;
      const p = [
        ['lang="hu"', (html.getAttribute('lang') || '').toLowerCase() === 'hu'],
        ['title: Weboldalam', norm(szoveg(doc.querySelector('head title'))) === 'weboldalam'],
        ['css/style.css', [...doc.querySelectorAll('head link[rel~="stylesheet"]')].some(l => (l.getAttribute('href') || '').trim().replace(/^\.\//, '') === 'css/style.css')],
        ['menü mind a 4 oldalra', menuRendben(doc)],
      ];
      p.push(...await tartalmiPontok(o.fajl, doc, a + o.fajl, nev));
      return { ...o, van: true, pontok: p.map(([sz, ok]) => ({ szoveg: sz, ok })) };
    }));
    // Pont = az oldal megléte + a rajta lévő ellenőrzések (db = 1 + ellenőrzések száma).
    const ossz = oldalak.reduce((s, o) => s + o.db, 0);
    const ok = oldalak.reduce((s, o) => s + (o.van ? 1 + o.pontok.filter(x => x.ok).length : 0), 0);
    return { el: oldalak[0].van, alap: a, oldalak, ok, ossz };
  }

  const esc = s => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

  // Kis táblázat: oldalanként egy sor, zöld pipák és piros x-ek.
  function rajz(e) {
    if (!e) return '';
    if (e.hiba) return `<p class="we-hiba">${esc(e.hiba)}</p>`;
    return `<table class="we-tabla"><tbody>${e.oldalak.map(o => `<tr>
      <th>${o.van ? `<a href="${esc(e.alap + o.fajl)}" target="_blank" rel="noopener">${esc(o.fajl)}</a>` : esc(o.fajl)}</th>
      <td>${o.van
        ? o.pontok.map(x => `<span class="we-p ${x.ok ? 'jo' : 'rossz'}"><i class="fas ${x.ok ? 'fa-check' : 'fa-xmark'}"></i> ${esc(x.szoveg)}</span>`).join('')
        : '<span class="we-p rossz"><i class="fas fa-xmark"></i> nincs fent a GitHubon</span>'}</td></tr>`).join('')}</tbody></table>`;
  }

  window.WebEllenor = { OLDALAK, alap, jo, ellenoriz, rajz, nevEgyezik };
})();
