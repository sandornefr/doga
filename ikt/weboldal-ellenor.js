// IKT Projektmunka I. – a tanuló github.io-s weboldalának ellenőrzése (9. évfolyam).
// A tanuló („Weboldalam”) és a tanár („Weboldal-gyűjtemény”) ugyanezt látja.
// A GitHub Pages bárhonnan letölthető (CORS), ezért a böngésző maga nézi meg az oldalakat.
// Csak a tagek meglétét nézi, a szöveget nem.
(function () {
  const OLDALAK = [
    { fajl: 'index.html', nev: 'Főoldal', db: 8 },
    { fajl: 'keplink.html', nev: 'Kép és link', db: 7 },
    { fajl: 'listak.html', nev: 'Listák', db: 7 },
    { fajl: 'orarend.html', nev: 'Órarend', db: 6 },
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

  // Eredmény: { el: bool, oldalak: [{fajl, nev, van, pontok:[{szoveg, ok}]}], ok, ossz }
  async function ellenoriz(url) {
    const a = alap(url);
    if (!a) return { hiba: 'A cím nem https://….github.io/… alakú.' };
    const szovegek = await Promise.all(OLDALAK.map(o => letolt(a + o.fajl)));
    const oldalak = OLDALAK.map((o, i) => {
      const t = szovegek[i];
      if (t == null) return { ...o, van: false, pontok: [] };
      const doc = new DOMParser().parseFromString(t, 'text/html');
      const html = doc.documentElement;
      const p = [
        ['lang="hu"', (html.getAttribute('lang') || '').toLowerCase() === 'hu'],
        ['title', !!(doc.querySelector('head title') && doc.querySelector('head title').textContent.trim())],
        ['css/style.css', [...doc.querySelectorAll('head link[rel~="stylesheet"]')].some(l => (l.getAttribute('href') || '').trim().replace(/^\.\//, '') === 'css/style.css')],
        ['menü mind a 4 oldalra', menuRendben(doc)],
      ];
      if (o.fajl === 'index.html') p.push(
        ['h1 címsor', !!doc.querySelector('h1')],
        ['2 bekezdés', doc.querySelectorAll('p').length >= 2],
        ['kép', !!doc.querySelector('img')]);
      if (o.fajl === 'keplink.html') p.push(
        ['kép', !!doc.querySelector('img')],
        ['link új lapon', !!doc.querySelector('a[target="_blank"]')]);
      if (o.fajl === 'listak.html') p.push(
        ['ul lista', !!doc.querySelector('ul li')],
        ['ol lista', !!doc.querySelector('ol li')]);
      if (o.fajl === 'orarend.html') p.push(
        ['táblázat', !!doc.querySelector('table tr')]);
      return { ...o, van: true, pontok: p.map(([szoveg, ok]) => ({ szoveg, ok })) };
    });
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

  window.WebEllenor = { OLDALAK, alap, jo, ellenoriz, rajz };
})();
