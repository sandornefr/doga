// Web gyakorló feladatok – HTML (a régi web tananyag 10 HTML blokkja szerint: html_1 … html_10)
// Egy feladat: id, sorszam, cim, kell (rövid címke), leiras (sima szöveg, `kód` = kiemelés, üres sor = új bekezdés),
// tipp, kezdo (induló kód), megoldas, ell: [[ellenőrzés szövege, (doc, html) => igaz/hamis], …]
// A témákat az Óra mód (ora.html) is olvassa: innen adja ki az oktató a csoportnak.
(function () {
  'use strict';
  const T = (d, s) => [...d.querySelectorAll(s)];
  const sz = el => (el ? el.textContent : '').replace(/\s+/g, ' ').trim().toLowerCase();
  const van = (d, s, n = 1) => d.querySelectorAll(s).length >= n;
  const benne = (d, s, mit) => T(d, s).some(e => sz(e).includes(mit.toLowerCase()));
  const vaz = (cim, test) => `<!DOCTYPE html>\n<html lang="hu">\n<head>\n  <meta charset="UTF-8">\n  <title>${cim}</title>\n</head>\n<body>\n${test}\n</body>\n</html>\n`;
  const ures = cim => vaz(cim, '  ');
  const LOGO = '../../python/kandologo2.png';

  const temak = [
    // ── 1. Mi a HTML? ───────────────────────────────────────────────
    { id: 'html_1', cim: 'Mi a HTML?', feladatok: [
      { id: 'html_1_1', cim: 'Az első weboldalam', kell: 'váz',
        leiras: 'Írd meg egy weboldal vázát! Az oldal nyelve magyar legyen.\n\nA fül felirata (`<title>`): Az én oldalam\n\nAz oldalon egy bekezdés legyen: Szia! Ez az első weboldalam.',
        tipp: 'Írd be: ! és nyomd meg a Tab billentyűt. A váz magától elkészül. Utána írd át a címet és a nyelvet.',
        kezdo: '',
        megoldas: vaz('Az én oldalam', '  <p>Szia! Ez az első weboldalam.</p>'),
        ell: [
          ['Az első sor: `<!DOCTYPE html>`', (d, h) => /^\s*<!doctype html>/i.test(h)],
          ['Van `<html lang="hu">`', d => van(d, 'html[lang="hu"]')],
          ['Van `<meta charset="UTF-8">`', d => T(d, 'meta[charset]').some(m => /utf-?8/i.test(m.getAttribute('charset')))],
          ['A fül felirata: Az én oldalam', d => sz(d.querySelector('title')) === 'az én oldalam'],
          ['Van bekezdés: Szia! Ez az első weboldalam.', d => benne(d, 'body p', 'első weboldalam')]
        ] },
      { id: 'html_1_2', cim: 'Fül felirat és főcím', kell: 'title, h1',
        leiras: 'Az iskolai büfének készül egy oldal.\n\nÍrd át a fül feliratát erre: Iskolai büfé\n\nA `<body>`-ba írj egy főcímet (`<h1>`) ugyanezzel a szöveggel.',
        tipp: 'A `<title>` a `<head>`-ben van, ez a böngésző fülén látszik. A `<h1>` a `<body>`-ba kerül, ez az oldalon látszik.',
        kezdo: ures('Névtelen'),
        megoldas: vaz('Iskolai büfé', '  <h1>Iskolai büfé</h1>'),
        ell: [
          ['A fül felirata: Iskolai büfé', d => sz(d.querySelector('title')) === 'iskolai büfé'],
          ['Van `<h1>` főcím: Iskolai büfé', d => benne(d, 'body h1', 'iskolai büfé')]
        ] },
      { id: 'html_1_3', cim: 'Keresd a hibát!', kell: 'head, body',
        leiras: 'Ebben a kódban a `<title>` rossz helyre került: a `<body>`-ban van.\n\nTedd át a `<head>`-be! Az oldalon maradjon meg a főcím.',
        tipp: 'Jelöld ki a `<title>…</title>` sort, vágd ki (Ctrl+X), és illeszd be (Ctrl+V) a `<meta>` sor alá.',
        kezdo: '<!DOCTYPE html>\n<html lang="hu">\n<head>\n  <meta charset="UTF-8">\n</head>\n<body>\n  <title>Kedvenc zenéim</title>\n  <h1>Kedvenc zenéim</h1>\n</body>\n</html>\n',
        megoldas: vaz('Kedvenc zenéim', '  <h1>Kedvenc zenéim</h1>'),
        ell: [
          ['A `<title>` a `<head>`-ben van', (d, h) => { const t = h.search(/<title/i), b = h.search(/<body/i), hd = h.search(/<\/head>/i); return t >= 0 && t < b && (hd < 0 || t < hd); }],
          ['A fül felirata: Kedvenc zenéim', d => sz(d.querySelector('title')) === 'kedvenc zenéim'],
          ['A főcím megmaradt', d => benne(d, 'body h1', 'kedvenc zenéim')]
        ] },
      { id: 'html_1_4', cim: 'Ékezetek és nyelv', kell: 'lang, charset',
        leiras: 'Ebből a kódból hiányzik két fontos dolog.\n\n1. A `<html>` elemre írd rá a nyelvet: `lang="hu"`\n\n2. A `<head>`-be írd be a kódolást: `<meta charset="UTF-8">`\n\nEnélkül az ékezetes betűk furcsán jelenhetnek meg.',
        tipp: 'A lang a html nyitó tagjába kerül: <html lang="hu">. A meta sort a <title> fölé tedd.',
        kezdo: '<!DOCTYPE html>\n<html>\n<head>\n  <title>Ékezetpróba</title>\n</head>\n<body>\n  <p>Árvíztűrő tükörfúrógép</p>\n</body>\n</html>\n',
        megoldas: vaz('Ékezetpróba', '  <p>Árvíztűrő tükörfúrógép</p>'),
        ell: [
          ['Van `lang="hu"` a `<html>`-en', d => van(d, 'html[lang="hu"]')],
          ['Van `<meta charset="UTF-8">`', d => T(d, 'meta[charset]').some(m => /utf-?8/i.test(m.getAttribute('charset')))],
          ['A bekezdés megmaradt', d => benne(d, 'p', 'árvíztűrő')]
        ] }
    ] },

    // ── 2. Szöveg elemek ────────────────────────────────────────────
    { id: 'html_2', cim: 'Szöveg elemek', feladatok: [
      { id: 'html_2_1', cim: 'Recept címekkel', kell: 'h1, h2',
        leiras: 'Készíts egy recept oldalt címekkel!\n\nFőcím (`<h1>`): Palacsinta\n\nAlatta két alcím (`<h2>`): Hozzávalók, Elkészítés',
        tipp: 'A h1 a legnagyobb cím, egy oldalon általában csak egy van. A h2 egy szinttel kisebb.',
        kezdo: ures('Palacsinta'),
        megoldas: vaz('Palacsinta', '  <h1>Palacsinta</h1>\n  <h2>Hozzávalók</h2>\n  <h2>Elkészítés</h2>'),
        ell: [
          ['`<h1>`: Palacsinta', d => benne(d, 'h1', 'palacsinta')],
          ['`<h2>`: Hozzávalók', d => benne(d, 'h2', 'hozzávalók')],
          ['`<h2>`: Elkészítés', d => benne(d, 'h2', 'elkészítés')]
        ] },
      { id: 'html_2_2', cim: 'Hírek az iskolából', kell: 'h1, p',
        leiras: 'Írj egy rövid hírt!\n\nFőcím: Hírek az iskolából\n\nAlatta legalább két bekezdés (`<p>`). Írd bele, mi történt mostanában az iskolában. Pl.: sportnap, kirándulás, verseny.',
        tipp: 'Minden bekezdést külön <p>…</p> pár zár közre.',
        kezdo: ures('Hírek'),
        megoldas: vaz('Hírek', '  <h1>Hírek az iskolából</h1>\n  <p>Pénteken sportnap volt az udvaron.</p>\n  <p>Jövő héten kirándulni megyünk.</p>'),
        ell: [
          ['`<h1>`: Hírek az iskolából', d => benne(d, 'h1', 'hírek az iskolából')],
          ['Legalább 2 bekezdés (`<p>`)', d => T(d, 'body p').filter(p => sz(p).length > 3).length >= 2]
        ] },
      { id: 'html_2_3', cim: 'Fontos szavak kiemelése', kell: 'strong, em',
        leiras: 'A kirándulásról szóló bekezdésben két szót ki kell emelni.\n\nA „8-kor” legyen félkövér: `<strong>`\n\nAz „uzsonnát” legyen dőlt: `<em>`',
        tipp: 'Csak a szó köré írd a taget, pl.: <strong>8-kor</strong>. A mondat többi része maradjon a <p>-ben.',
        kezdo: vaz('Kirándulás', '  <h1>Kirándulás</h1>\n  <p>A busz reggel 8-kor indul. Ne felejts el uzsonnát hozni!</p>'),
        megoldas: vaz('Kirándulás', '  <h1>Kirándulás</h1>\n  <p>A busz reggel <strong>8-kor</strong> indul. Ne felejts el <em>uzsonnát</em> hozni!</p>'),
        ell: [
          ['A „8-kor” `<strong>`-ban van', d => T(d, 'strong, b').some(e => sz(e) === '8-kor')],
          ['Az „uzsonnát” `<em>`-ben van', d => T(d, 'em, i').some(e => sz(e) === 'uzsonnát')],
          ['A mondat többi része megmaradt', d => benne(d, 'p', 'ne felejts el')]
        ] },
      { id: 'html_2_4', cim: 'Bevásárló cetli', kell: 'br',
        leiras: 'Egy bekezdésbe írd a bevásárló cetlit, minden tétel külön sorba!\n\nkenyér, tej, alma, sajt\n\nÚj sort a `<br>` taggal kezdhetsz.',
        tipp: 'A <br>-nek nincs záró párja. Pl.: kenyér<br>tej<br>…',
        kezdo: ures('Bevásárlás'),
        megoldas: vaz('Bevásárlás', '  <p>kenyér<br>tej<br>alma<br>sajt</p>'),
        ell: [
          ['Egy `<p>`-ben legalább 3 `<br>`', d => T(d, 'p').some(p => p.querySelectorAll('br').length >= 3)],
          ['Benne van: kenyér, tej, alma, sajt', d => ['kenyér', 'tej', 'alma', 'sajt'].every(s => benne(d, 'p', s))]
        ] }
    ] },

    // ── 3. Linkek és képek ──────────────────────────────────────────
    { id: 'html_3', cim: 'Linkek és képek', feladatok: [
      { id: 'html_3_1', cim: 'Link a Wikipédiára', kell: 'a href',
        leiras: 'Készíts egy linket!\n\nA szövege: Wikipédia\n\nA címe (`href`): https://hu.wikipedia.org',
        tipp: 'Minta: <a href="ide jön a cím">ide jön a szöveg</a>',
        kezdo: ures('Hasznos oldalak'),
        megoldas: vaz('Hasznos oldalak', '  <a href="https://hu.wikipedia.org">Wikipédia</a>'),
        ell: [
          ['Van `<a>` link', d => van(d, 'a[href]')],
          ['A `href`: https://hu.wikipedia.org', d => T(d, 'a[href]').some(a => /^https:\/\/hu\.wikipedia\.org\/?$/i.test(a.getAttribute('href').trim()))],
          ['A link szövege: Wikipédia', d => T(d, 'a').some(a => sz(a) === 'wikipédia')]
        ] },
      { id: 'html_3_2', cim: 'Új lapon nyíljon', kell: 'target',
        leiras: 'A link új lapon nyíljon meg, hogy az oldalunk is nyitva maradjon!\n\nÍrd rá a linkre: `target="_blank"`',
        tipp: 'A target a nyitó <a> tagba kerül, a href mellé.',
        kezdo: vaz('Videók', '  <a href="https://www.youtube.com">YouTube</a>'),
        megoldas: vaz('Videók', '  <a href="https://www.youtube.com" target="_blank">YouTube</a>'),
        ell: [
          ['Van `target="_blank"`', d => van(d, 'a[target="_blank"]')],
          ['A link még a YouTube-ra mutat', d => T(d, 'a[href]').some(a => /youtube\.com/i.test(a.getAttribute('href')))]
        ] },
      { id: 'html_3_3', cim: 'Az iskola logója', kell: 'img',
        leiras: 'Tedd ki az iskola logóját!\n\n`src`: ' + LOGO + '\n\n`alt`: Kandó logó\n\n`title`: Iskolánk logója\n\nA szélessége legyen 200: `width="200"`',
        tipp: 'Az <img>-nek nincs záró párja. Az alt akkor látszik, ha a kép nem tölt be. A title akkor, ha fölé viszed az egeret.',
        kezdo: ures('Logó'),
        megoldas: vaz('Logó', `  <img src="${LOGO}" alt="Kandó logó" title="Iskolánk logója" width="200">`),
        ell: [
          ['Van `<img>` a logóval', d => T(d, 'img[src]').some(i => /kandologo2\.png/i.test(i.getAttribute('src')))],
          ['Van `alt` szöveg', d => T(d, 'img').some(i => (i.getAttribute('alt') || '').trim())],
          ['Van `title` szöveg', d => T(d, 'img').some(i => (i.getAttribute('title') || '').trim())],
          ['`width="200"`', d => T(d, 'img').some(i => i.getAttribute('width') === '200' || /width\s*:\s*200px/i.test(i.getAttribute('style') || ''))]
        ] },
      { id: 'html_3_4', cim: 'Kattintható kép', kell: 'a + img',
        leiras: 'A logó legyen link! Ha rákattintasz, nyíljon meg a Wikipédián Kandó Kálmán oldala.\n\n`href`: https://hu.wikipedia.org/wiki/Kandó_Kálmán\n\nTedd az `<img>`-t az `<a>` és az `</a>` közé.',
        tipp: 'Minta: <a href="…"><img src="…" alt="…"></a>',
        kezdo: vaz('Logó link', `  <img src="${LOGO}" alt="Kandó logó" width="200">`),
        megoldas: vaz('Logó link', `  <a href="https://hu.wikipedia.org/wiki/Kandó_Kálmán" target="_blank">\n    <img src="${LOGO}" alt="Kandó logó" width="200">\n  </a>`),
        ell: [
          ['Az `<img>` egy `<a>`-ban van', d => van(d, 'a img')],
          ['A link a Wikipédiára mutat', d => T(d, 'a[href]').some(a => /wikipedia\.org\/wiki\/kand/i.test(decodeURI(a.getAttribute('href'))))]
        ] }
    ] },

    // ── 4. Listák ───────────────────────────────────────────────────
    { id: 'html_4', cim: 'Listák', feladatok: [
      { id: 'html_4_1', cim: 'Bevásárlólista', kell: 'ul, li',
        leiras: 'Készíts felsorolást (pontokkal)!\n\nCím (`<h2>`): Bevásárlólista\n\nA lista elemei: kenyér, tej, alma, sajt',
        tipp: 'A pontos lista: <ul>. Minden tétel egy <li>.',
        kezdo: ures('Bevásárlás'),
        megoldas: vaz('Bevásárlás', '  <h2>Bevásárlólista</h2>\n  <ul>\n    <li>kenyér</li>\n    <li>tej</li>\n    <li>alma</li>\n    <li>sajt</li>\n  </ul>'),
        ell: [
          ['`<h2>`: Bevásárlólista', d => benne(d, 'h2', 'bevásárlólista')],
          ['Van `<ul>` legalább 4 `<li>`-vel', d => T(d, 'ul').some(u => u.querySelectorAll(':scope > li').length >= 4)],
          ['Benne van: kenyér, tej, alma, sajt', d => ['kenyér', 'tej', 'alma', 'sajt'].every(s => benne(d, 'li', s))]
        ] },
      { id: 'html_4_2', cim: 'Reggeli teendők sorban', kell: 'ol, li',
        leiras: 'Itt számít a sorrend, ezért számozott lista kell (`<ol>`).\n\nA lépések: Felkelek, Fogat mosok, Reggelizek, Elindulok az iskolába',
        tipp: 'Az <ol> magától számozza a sorokat. Ugyanúgy <li> elemek kellenek bele.',
        kezdo: ures('Reggel'),
        megoldas: vaz('Reggel', '  <ol>\n    <li>Felkelek</li>\n    <li>Fogat mosok</li>\n    <li>Reggelizek</li>\n    <li>Elindulok az iskolába</li>\n  </ol>'),
        ell: [
          ['Van `<ol>` legalább 4 `<li>`-vel', d => T(d, 'ol').some(u => u.querySelectorAll(':scope > li').length >= 4)],
          ['Az első lépés: Felkelek', d => sz(d.querySelector('ol > li')).startsWith('felkel')],
          ['Az utolsó lépés: Elindulok az iskolába', d => { const l = T(d, 'ol > li'); return l.length && sz(l[l.length - 1]).includes('iskol'); }]
        ] },
      { id: 'html_4_3', cim: 'Recept: hozzávalók és lépések', kell: 'ul + ol',
        leiras: 'Egy recepthez kétféle lista kell.\n\n`<h2>` Hozzávalók, alatta pontos lista (`<ul>`): liszt, tej, tojás\n\n`<h2>` Elkészítés, alatta számozott lista (`<ol>`): Összekeverem, Kisütöm, Megtöltöm lekvárral',
        tipp: 'A hozzávalóknál nem számít a sorrend: <ul>. A lépéseknél számít: <ol>.',
        kezdo: vaz('Palacsinta', '  <h1>Palacsinta</h1>\n  '),
        megoldas: vaz('Palacsinta', '  <h1>Palacsinta</h1>\n  <h2>Hozzávalók</h2>\n  <ul>\n    <li>liszt</li>\n    <li>tej</li>\n    <li>tojás</li>\n  </ul>\n  <h2>Elkészítés</h2>\n  <ol>\n    <li>Összekeverem</li>\n    <li>Kisütöm</li>\n    <li>Megtöltöm lekvárral</li>\n  </ol>'),
        ell: [
          ['`<h2>`: Hozzávalók és Elkészítés', d => benne(d, 'h2', 'hozzávalók') && benne(d, 'h2', 'elkészítés')],
          ['`<ul>`: liszt, tej, tojás', d => ['liszt', 'tej', 'tojás'].every(s => benne(d, 'ul li', s))],
          ['`<ol>` legalább 3 lépéssel', d => T(d, 'ol').some(u => u.querySelectorAll(':scope > li').length >= 3)]
        ] },
      { id: 'html_4_4', cim: 'Lista a listában', kell: 'beágyazás',
        leiras: 'A piaci listán csoportok vannak.\n\nKészíts `<ul>` listát két elemmel: Gyümölcs, Zöldség\n\nA Gyümölcs alatt egy belső lista: alma, körte\n\nA Zöldség alatt egy belső lista: répa, paprika',
        tipp: 'A belső <ul> a <li>-n belülre kerül, a szöveg után, a </li> elé. Pl.: <li>Gyümölcs <ul><li>alma</li>…</ul></li>',
        kezdo: ures('Piac'),
        megoldas: vaz('Piac', '  <ul>\n    <li>Gyümölcs\n      <ul>\n        <li>alma</li>\n        <li>körte</li>\n      </ul>\n    </li>\n    <li>Zöldség\n      <ul>\n        <li>répa</li>\n        <li>paprika</li>\n      </ul>\n    </li>\n  </ul>'),
        ell: [
          ['Van lista a listában (`li` → `ul`)', d => van(d, 'li ul, li ol')],
          ['Legalább 2 belső lista', d => d.querySelectorAll('li > ul, li > ol').length >= 2],
          ['Az alma és a körte belső listában van', d => benne(d, 'li li', 'alma') && benne(d, 'li li', 'körte')],
          ['A répa és a paprika belső listában van', d => benne(d, 'li li', 'répa') && benne(d, 'li li', 'paprika')]
        ] }
    ] },

    // ── 5. Span, id és class ────────────────────────────────────────
    { id: 'html_5', cim: 'Span, id és class', feladatok: [
      { id: 'html_5_1', cim: 'Egyedi név: id', kell: 'id',
        leiras: 'A főcímnek adj egyedi nevet!\n\nA `<h1>` kapja meg: `id="focim"`\n\nAz `id` egy oldalon csak egyszer szerepelhet.',
        tipp: 'Az id a nyitó tagba kerül: <h1 id="focim">',
        kezdo: vaz('Sportnap', '  <h1>Sportnap</h1>\n  <p>Pénteken lesz az udvaron.</p>'),
        megoldas: vaz('Sportnap', '  <h1 id="focim">Sportnap</h1>\n  <p>Pénteken lesz az udvaron.</p>'),
        ell: [
          ['A `<h1>`-nek `id="focim"`', d => van(d, 'h1#focim')],
          ['Csak egy elem kapta meg', d => d.querySelectorAll('#focim').length === 1]
        ] },
      { id: 'html_5_2', cim: 'Csoport név: class', kell: 'class',
        leiras: 'Három szabály van a bekezdésekben. Kettő nagyon fontos.\n\nA fontos bekezdések kapják meg: `class="fontos"`\n\nA `class` több elemen is lehet ugyanaz.',
        tipp: 'Írd be mindkét fontos <p> nyitó tagjába: <p class="fontos">',
        kezdo: vaz('Szabályok', '  <h1>Tornaterem szabályai</h1>\n  <p>Csak váltócipőben lehet bemenni.</p>\n  <p>Az ivóvizet hozd magaddal.</p>\n  <p>Ékszert nem viselhetsz edzésen.</p>'),
        megoldas: vaz('Szabályok', '  <h1>Tornaterem szabályai</h1>\n  <p class="fontos">Csak váltócipőben lehet bemenni.</p>\n  <p>Az ivóvizet hozd magaddal.</p>\n  <p class="fontos">Ékszert nem viselhetsz edzésen.</p>'),
        ell: [
          ['Legalább 2 `<p class="fontos">`', d => d.querySelectorAll('p.fontos').length >= 2],
          ['Mind a 3 bekezdés megmaradt', d => d.querySelectorAll('body p').length >= 3]
        ] },
      { id: 'html_5_3', cim: 'Az ár kiemelése: span', kell: 'span',
        leiras: 'A büfé árlistájában az árakat külön jelöljük.\n\nMindkét árat tedd `<span class="ar">` … `</span>` közé.\n\nA `<span>` nem tör új sort, a mondaton belül marad.',
        tipp: 'Pl.: <p>Sajtos szendvics: <span class="ar">500 Ft</span></p>',
        kezdo: vaz('Büfé', '  <h1>Büfé</h1>\n  <p>Sajtos szendvics: 500 Ft</p>\n  <p>Kakaós csiga: 350 Ft</p>'),
        megoldas: vaz('Büfé', '  <h1>Büfé</h1>\n  <p>Sajtos szendvics: <span class="ar">500 Ft</span></p>\n  <p>Kakaós csiga: <span class="ar">350 Ft</span></p>'),
        ell: [
          ['Legalább 2 `<span class="ar">`', d => d.querySelectorAll('span.ar').length >= 2],
          ['Az árak a spanben vannak', d => benne(d, 'span.ar', '500') && benne(d, 'span.ar', '350')],
          ['A span a bekezdésen belül van', d => van(d, 'p span.ar', 2)]
        ] },
      { id: 'html_5_4', cim: 'Ugrás az oldalon belül', kell: 'href="#"',
        leiras: 'Hosszú oldalon jól jön egy ugró link.\n\nA Szabályok alcím kapja meg: `id="szabalyok"`\n\nFent készíts egy linket Ugrás a szabályokhoz szöveggel: `href="#szabalyok"`',
        tipp: 'A # jel után az id neve jön. Rákattintva a böngésző odaugrik.',
        kezdo: vaz('Sportnap', '  <h1>Sportnap</h1>\n  \n  <p>Pénteken lesz az udvaron.</p>\n  <h2>Szabályok</h2>\n  <p>Mindenki hozzon váltócipőt.</p>'),
        megoldas: vaz('Sportnap', '  <h1>Sportnap</h1>\n  <a href="#szabalyok">Ugrás a szabályokhoz</a>\n  <p>Pénteken lesz az udvaron.</p>\n  <h2 id="szabalyok">Szabályok</h2>\n  <p>Mindenki hozzon váltócipőt.</p>'),
        ell: [
          ['A `<h2>`-nek `id="szabalyok"`', d => van(d, 'h2#szabalyok')],
          ['Van link: `href="#szabalyok"`', d => van(d, 'a[href="#szabalyok"]')],
          ['A link szövege: Ugrás a szabályokhoz', d => benne(d, 'a[href="#szabalyok"]', 'ugrás')]
        ] }
    ] },

    // ── 6. Táblázatok ───────────────────────────────────────────────
    { id: 'html_6', cim: 'Táblázatok', feladatok: [
      { id: 'html_6_1', cim: 'Büfé árlista táblázatban', kell: 'table, tr, td',
        leiras: 'Készíts táblázatot (`<table>`)!\n\nAz első sor fejléc (`<th>`): Termék, Ár\n\nAlatta 3 sor (`<td>`): pl.: Kifli – 80 Ft',
        tipp: 'Minden sor egy <tr>. A fejléc cellái <th>, a többi cella <td>.',
        kezdo: ures('Árlista'),
        megoldas: vaz('Árlista', '  <table border="1">\n    <tr><th>Termék</th><th>Ár</th></tr>\n    <tr><td>Kifli</td><td>80 Ft</td></tr>\n    <tr><td>Kakaó</td><td>250 Ft</td></tr>\n    <tr><td>Alma</td><td>100 Ft</td></tr>\n  </table>'),
        ell: [
          ['Van `<table>`', d => van(d, 'table')],
          ['Fejléc: Termék, Ár (`<th>`)', d => benne(d, 'th', 'termék') && benne(d, 'th', 'ár')],
          ['Legalább 3 adatsor `<td>`-kel', d => T(d, 'tr').filter(r => r.querySelectorAll('td').length >= 2).length >= 3]
        ] },
      { id: 'html_6_2', cim: 'Fej és törzs', kell: 'thead, tbody',
        leiras: 'Rendezd a táblázatot két részre!\n\nA fejléc sor kerüljön `<thead>`-be.\n\nAz adatsorok kerüljenek `<tbody>`-ba.',
        tipp: '<thead> a fejléc <tr> köré, <tbody> az összes többi <tr> köré.',
        kezdo: vaz('Ügyelet', '  <table border="1">\n    <tr><th>Nap</th><th>Ügyeletes</th></tr>\n    <tr><td>Hétfő</td><td>1. csoport</td></tr>\n    <tr><td>Kedd</td><td>2. csoport</td></tr>\n  </table>'),
        megoldas: vaz('Ügyelet', '  <table border="1">\n    <thead>\n      <tr><th>Nap</th><th>Ügyeletes</th></tr>\n    </thead>\n    <tbody>\n      <tr><td>Hétfő</td><td>1. csoport</td></tr>\n      <tr><td>Kedd</td><td>2. csoport</td></tr>\n    </tbody>\n  </table>'),
        ell: [
          ['Van `<thead>` a fejléc sorral', (d, h) => /<thead/i.test(h) && van(d, 'thead th', 2)],
          ['Van `<tbody>` az adatsorokkal', (d, h) => /<tbody/i.test(h) && d.querySelectorAll('tbody tr').length >= 2],
          ['A fejléc nincs a `<tbody>`-ban', d => !van(d, 'tbody th')]
        ] },
      { id: 'html_6_3', cim: 'Táblázat címe', kell: 'caption',
        leiras: 'Adj címet a táblázatnak!\n\nÍrd a `<table>` nyitó tag után: `<caption>Sportnap eredményei</caption>`',
        tipp: 'A <caption> mindig a <table> első eleme.',
        kezdo: vaz('Eredmények', '  <table border="1">\n    <tr><th>Osztály</th><th>Helyezés</th></tr>\n    <tr><td>9.A</td><td>1.</td></tr>\n    <tr><td>9.B</td><td>2.</td></tr>\n  </table>'),
        megoldas: vaz('Eredmények', '  <table border="1">\n    <caption>Sportnap eredményei</caption>\n    <tr><th>Osztály</th><th>Helyezés</th></tr>\n    <tr><td>9.A</td><td>1.</td></tr>\n    <tr><td>9.B</td><td>2.</td></tr>\n  </table>'),
        ell: [
          ['Van `<caption>`: Sportnap eredményei', d => benne(d, 'table caption', 'sportnap eredményei')],
          ['A táblázat megmaradt', d => d.querySelectorAll('td').length >= 4]
        ] },
      { id: 'html_6_4', cim: 'Két oszlopon át: colspan', kell: 'colspan',
        leiras: 'Az első sorban csak egy cella legyen: Hétfői órarend\n\nEz a cella két oszlop széles legyen: `colspan="2"`',
        tipp: 'Pl.: <tr><th colspan="2">Hétfői órarend</th></tr>',
        kezdo: vaz('Órarend', '  <table border="1">\n    <tr><th>Hétfői órarend</th><th></th></tr>\n    <tr><td>1. óra</td><td>Matek</td></tr>\n    <tr><td>2. óra</td><td>Informatika</td></tr>\n  </table>'),
        megoldas: vaz('Órarend', '  <table border="1">\n    <tr><th colspan="2">Hétfői órarend</th></tr>\n    <tr><td>1. óra</td><td>Matek</td></tr>\n    <tr><td>2. óra</td><td>Informatika</td></tr>\n  </table>'),
        ell: [
          ['Van `colspan="2"` cella', d => van(d, '[colspan="2"]')],
          ['A szövege: Hétfői órarend', d => benne(d, '[colspan="2"]', 'hétfői órarend')],
          ['Az első sorban csak egy cella van', d => { const r = d.querySelector('tr'); return r && r.children.length === 1; }]
        ] },
      { id: 'html_6_5', cim: 'Két soron át: rowspan', kell: 'rowspan',
        leiras: 'A szakkör két napon is ugyanabban a teremben van.\n\nA „Számítógépterem” cella legyen két sor magas: `rowspan="2"`\n\nA második sorból töröld a fölösleges terem cellát.',
        tipp: 'A rowspan cella helyet foglal a következő sorban is, ezért ott eggyel kevesebb <td> kell.',
        kezdo: vaz('Szakkör', '  <table border="1">\n    <tr><th>Nap</th><th>Terem</th></tr>\n    <tr><td>Kedd</td><td>Számítógépterem</td></tr>\n    <tr><td>Csütörtök</td><td>Számítógépterem</td></tr>\n  </table>'),
        megoldas: vaz('Szakkör', '  <table border="1">\n    <tr><th>Nap</th><th>Terem</th></tr>\n    <tr><td>Kedd</td><td rowspan="2">Számítógépterem</td></tr>\n    <tr><td>Csütörtök</td></tr>\n  </table>'),
        ell: [
          ['Van `rowspan="2"` cella', d => van(d, '[rowspan="2"]')],
          ['Csak egyszer szerepel: Számítógépterem', d => T(d, 'td').filter(t => sz(t).includes('számítógépterem')).length === 1],
          ['A Csütörtök sorában egy cella van', d => T(d, 'tr').some(r => sz(r).includes('csütörtök') && r.children.length === 1)]
        ] }
    ] },

    // ── 7. Szemantikus váz ──────────────────────────────────────────
    { id: 'html_7', cim: 'Szemantikus váz', feladatok: [
      { id: 'html_7_1', cim: 'Fejléc és lábléc', kell: 'header, footer',
        leiras: 'Az iskolaújság oldalának van eleje és vége.\n\n`<header>`-be: egy `<h1>` Iskolaújság\n\n`<footer>`-be: egy `<p>` © 2026 Iskolaújság',
        tipp: 'A © jelet így is írhatod: &copy;',
        kezdo: ures('Iskolaújság'),
        megoldas: vaz('Iskolaújság', '  <header>\n    <h1>Iskolaújság</h1>\n  </header>\n  <footer>\n    <p>&copy; 2026 Iskolaújság</p>\n  </footer>'),
        ell: [
          ['`<header>`-ben `<h1>`: Iskolaújság', d => benne(d, 'header h1', 'iskolaújság')],
          ['`<footer>`-ben `<p>`', d => van(d, 'footer p')],
          ['A láblécben szerepel: 2026', d => benne(d, 'footer', '2026')]
        ] },
      { id: 'html_7_2', cim: 'Menü: nav', kell: 'nav',
        leiras: 'Készíts menüt a `<header>` alá!\n\n`<nav>`-ban három link: Főoldal, Hírek, Kapcsolat\n\nA `href` most lehet `#`.',
        tipp: 'A menüpontokat gyakran listába tesszük: <nav><ul><li><a href="#">Főoldal</a></li>…</ul></nav>',
        kezdo: vaz('Iskolaújság', '  <header>\n    <h1>Iskolaújság</h1>\n  </header>\n  '),
        megoldas: vaz('Iskolaújság', '  <header>\n    <h1>Iskolaújság</h1>\n  </header>\n  <nav>\n    <ul>\n      <li><a href="#">Főoldal</a></li>\n      <li><a href="#">Hírek</a></li>\n      <li><a href="#">Kapcsolat</a></li>\n    </ul>\n  </nav>'),
        ell: [
          ['Van `<nav>`', d => van(d, 'nav')],
          ['A `<nav>`-ban legalább 3 link', d => van(d, 'nav a', 3)],
          ['Menüpontok: Főoldal, Hírek, Kapcsolat', d => ['főoldal', 'hírek', 'kapcsolat'].every(s => benne(d, 'nav a', s))]
        ] },
      { id: 'html_7_3', cim: 'Cikkek: main és article', kell: 'main, article',
        leiras: 'Az oldal fő része a `<main>`.\n\nBenne két hír, mindegyik egy `<article>`.\n\nMinden cikkben egy `<h2>` cím és egy `<p>` szöveg legyen. Pl.: Sportnap, Kirándulás',
        tipp: '<main><article><h2>…</h2><p>…</p></article><article>…</article></main>',
        kezdo: ures('Iskolaújság'),
        megoldas: vaz('Iskolaújság', '  <main>\n    <article>\n      <h2>Sportnap</h2>\n      <p>Pénteken lesz az udvaron.</p>\n    </article>\n    <article>\n      <h2>Kirándulás</h2>\n      <p>Jövő héten indulunk.</p>\n    </article>\n  </main>'),
        ell: [
          ['Van `<main>`', d => van(d, 'main')],
          ['A `<main>`-ben legalább 2 `<article>`', d => van(d, 'main article', 2)],
          ['Minden cikkben van `<h2>` és `<p>`', d => { const a = T(d, 'article'); return a.length >= 2 && a.every(x => x.querySelector('h2') && x.querySelector('p')); }]
        ] },
      { id: 'html_7_4', cim: 'Teljes oldal váz', kell: '5 elem',
        leiras: 'Rakd össze a teljes oldalt ebben a sorrendben:\n\n`<header>` cím, `<nav>` menü, `<main>` egy cikkel, `<aside>` egy „Tudtad?” dobozzal, `<footer>` lábléc.',
        tipp: 'Az <aside> a mellékes tartalom: jó tudni, de nem a fő téma.',
        kezdo: ures('Iskolaújság'),
        megoldas: vaz('Iskolaújság', '  <header><h1>Iskolaújság</h1></header>\n  <nav><a href="#">Főoldal</a> <a href="#">Hírek</a></nav>\n  <main>\n    <article>\n      <h2>Sportnap</h2>\n      <p>Pénteken lesz az udvaron.</p>\n    </article>\n  </main>\n  <aside>\n    <h3>Tudtad?</h3>\n    <p>Az iskolánk névadója mérnök volt.</p>\n  </aside>\n  <footer><p>&copy; 2026 Iskolaújság</p></footer>'),
        ell: [
          ['Van `<header>`, `<nav>`, `<main>`', d => van(d, 'header') && van(d, 'nav') && van(d, 'main')],
          ['Van `<aside>`: Tudtad?', d => benne(d, 'aside', 'tudtad')],
          ['Van `<footer>`', d => van(d, 'footer')],
          ['A `<main>`-ben van `<article>`', d => van(d, 'main article')],
          ['Jó a sorrend', d => { const e = ['header', 'nav', 'main', 'footer'].map(s => d.querySelector(s)); return e.every(Boolean) && e.every((x, i) => i === 0 || (e[i - 1].compareDocumentPosition(x) & 4)); }]
        ] }
    ] },

    // ── 8. Div és figure ────────────────────────────────────────────
    { id: 'html_8', cim: 'Div és figure', feladatok: [
      { id: 'html_8_1', cim: 'Szakkör kártya', kell: 'div',
        leiras: 'A `<div>` egy doboz, ami összefogja az elemeket.\n\nKészíts egy `<div class="kartya">` dobozt.\n\nBenne `<h2>`: Kosárlabda szakkör, és `<p>`: Kedden 15 órától',
        tipp: '<div class="kartya"> … </div> közé írd a címet és a bekezdést.',
        kezdo: ures('Szakkörök'),
        megoldas: vaz('Szakkörök', '  <div class="kartya">\n    <h2>Kosárlabda szakkör</h2>\n    <p>Kedden 15 órától</p>\n  </div>'),
        ell: [
          ['Van `<div class="kartya">`', d => van(d, 'div.kartya')],
          ['Benne `<h2>`: Kosárlabda szakkör', d => benne(d, 'div.kartya h2', 'kosárlabda')],
          ['Benne `<p>`', d => van(d, 'div.kartya p')]
        ] },
      { id: 'html_8_2', cim: 'Kép felirattal: figure', kell: 'figure',
        leiras: 'A `<figure>` egy kép és a felirata együtt.\n\nTedd a logót egy `<figure>`-be.\n\nAlá a felirat (`<figcaption>`): Az iskolánk logója',
        tipp: '<figure><img …><figcaption>…</figcaption></figure>',
        kezdo: vaz('Logó', `  <img src="${LOGO}" alt="Kandó logó" width="200">`),
        megoldas: vaz('Logó', `  <figure>\n    <img src="${LOGO}" alt="Kandó logó" width="200">\n    <figcaption>Az iskolánk logója</figcaption>\n  </figure>`),
        ell: [
          ['Az `<img>` egy `<figure>`-ben van', d => van(d, 'figure img')],
          ['Van `<figcaption>`: Az iskolánk logója', d => benne(d, 'figure figcaption', 'iskolánk logója')]
        ] },
      { id: 'html_8_3', cim: 'Három szakkör', kell: 'több div',
        leiras: 'Készíts három szakkör kártyát egymás alá!\n\nMindegyik egy `<div class="kartya">`, benne `<h2>` név és `<p>` időpont.\n\nPl.: Kosárlabda, Robotika, Énekkar',
        tipp: 'Elkészítesz egy kártyát, kijelölöd, Ctrl+C, Ctrl+V kétszer, és átírod a szövegeket.',
        kezdo: vaz('Szakkörök', '  <h1>Szakkörök</h1>\n  '),
        megoldas: vaz('Szakkörök', '  <h1>Szakkörök</h1>\n  <div class="kartya">\n    <h2>Kosárlabda</h2>\n    <p>Kedden 15 órától</p>\n  </div>\n  <div class="kartya">\n    <h2>Robotika</h2>\n    <p>Szerdán 14 órától</p>\n  </div>\n  <div class="kartya">\n    <h2>Énekkar</h2>\n    <p>Pénteken 13 órától</p>\n  </div>'),
        ell: [
          ['Legalább 3 `<div class="kartya">`', d => van(d, 'div.kartya', 3)],
          ['Minden kártyában `<h2>` és `<p>`', d => { const k = T(d, 'div.kartya'); return k.length >= 3 && k.every(x => x.querySelector('h2') && x.querySelector('p')); }],
          ['Mindegyiknek más a neve', d => new Set(T(d, 'div.kartya h2').map(sz)).size >= 3]
        ] },
      { id: 'html_8_4', cim: 'Képgaléria', kell: 'div + figure',
        leiras: 'Készíts kis galériát!\n\nEgy `<div class="galeria">` dobozban két `<figure>` legyen.\n\nMindkettőben a logó képe és egy felirat (`<figcaption>`). Pl.: Régi logó, Új logó',
        tipp: 'A galéria div fogja össze a két figure-t.',
        kezdo: ures('Galéria'),
        megoldas: vaz('Galéria', `  <div class="galeria">\n    <figure>\n      <img src="${LOGO}" alt="Kandó logó" width="150">\n      <figcaption>Régi logó</figcaption>\n    </figure>\n    <figure>\n      <img src="${LOGO}" alt="Kandó logó" width="150">\n      <figcaption>Új logó</figcaption>\n    </figure>\n  </div>`),
        ell: [
          ['Van `<div class="galeria">`', d => van(d, 'div.galeria')],
          ['Benne legalább 2 `<figure>`', d => van(d, 'div.galeria figure', 2)],
          ['Minden `<figure>`-ben kép és felirat', d => { const f = T(d, 'div.galeria figure'); return f.length >= 2 && f.every(x => x.querySelector('img') && sz(x.querySelector('figcaption'))); }]
        ] }
    ] },

    // ── 9. Kommentek ────────────────────────────────────────────────
    { id: 'html_9', cim: 'Kommentek', feladatok: [
      { id: 'html_9_1', cim: 'Megjegyzés a kódba', kell: '<!-- -->',
        leiras: 'A komment csak a kódban látszik, az oldalon nem.\n\nÍrj a `<h1>` fölé egy kommentet: `<!-- Ez az oldal címe -->`',
        tipp: 'A komment eleje <!-- , a vége --> . A VS Code-ban a Ctrl+/ is kommentel.',
        kezdo: vaz('Büfé', '  <h1>Büfé</h1>\n  <p>Nyitva: 7 órától.</p>'),
        megoldas: vaz('Büfé', '  <!-- Ez az oldal címe -->\n  <h1>Büfé</h1>\n  <p>Nyitva: 7 órától.</p>'),
        ell: [
          ['Van komment a kódban', (d, h) => /<!--[\s\S]*?\S[\s\S]*?-->/.test(h)],
          ['A komment a `<h1>` fölött van', (d, h) => { const k = h.search(/<!--/), c = h.search(/<h1/i); return k >= 0 && k < c; }],
          ['A főcím megmaradt', d => benne(d, 'h1', 'büfé')]
        ] },
      { id: 'html_9_2', cim: 'Most ne látszódjon', kell: 'kikommentelés',
        leiras: 'Az edzés mégsem marad el. A második bekezdést most ne töröld, csak tedd kommentbe!\n\nÍgy nem látszik az oldalon, de később visszakapcsolható.',
        tipp: 'Írd a <p> elé: <!-- , a </p> után: --> . Vagy jelöld ki a sort és nyomd meg: Ctrl+/',
        kezdo: vaz('Hírek', '  <h1>Hírek</h1>\n  <p>Pénteken sportnap lesz.</p>\n  <p>Holnap elmarad az edzés.</p>'),
        megoldas: vaz('Hírek', '  <h1>Hírek</h1>\n  <p>Pénteken sportnap lesz.</p>\n  <!-- <p>Holnap elmarad az edzés.</p> -->'),
        ell: [
          ['Az „elmarad” bekezdés nem látszik', d => !benne(d, 'body', 'elmarad')],
          ['De kommentben ott van', (d, h) => /<!--[\s\S]*elmarad[\s\S]*?-->/i.test(h)],
          ['A sportnapos bekezdés látszik', d => benne(d, 'p', 'sportnap')]
        ] },
      { id: 'html_9_3', cim: 'Részek jelölése', kell: 'több komment',
        leiras: 'Hosszú kódban a kommentek jelzik a részeket.\n\nÍrj egy-egy kommentet a fejléc, a fő rész és a lábléc elé. Pl.: `<!-- Fejléc -->`',
        tipp: 'Három komment kell, mindegyik a saját része fölé.',
        kezdo: vaz('Iskolaújság', '  <header><h1>Iskolaújság</h1></header>\n  <main><p>Hírek jönnek ide.</p></main>\n  <footer><p>&copy; 2026</p></footer>'),
        megoldas: vaz('Iskolaújság', '  <!-- Fejléc -->\n  <header><h1>Iskolaújság</h1></header>\n  <!-- Fő rész -->\n  <main><p>Hírek jönnek ide.</p></main>\n  <!-- Lábléc -->\n  <footer><p>&copy; 2026</p></footer>'),
        ell: [
          ['Legalább 3 komment', (d, h) => (h.match(/<!--[\s\S]*?-->/g) || []).length >= 3],
          ['Komment a `<header>` előtt', (d, h) => { const k = h.search(/<!--/), c = h.search(/<header/i); return k >= 0 && k < c; }],
          ['Komment a `<footer>` előtt', (d, h) => { const c = h.search(/<footer/i), m = h.slice(0, c).match(/<!--/g); return c > 0 && m && m.length >= 3; }]
        ] }
    ] },

    // ── 10. Űrlapok ─────────────────────────────────────────────────
    { id: 'html_10', cim: 'Űrlapok', feladatok: [
      { id: 'html_10_1', cim: 'Név mező', kell: 'form, input',
        leiras: 'Készíts egy kis űrlapot (`<form>`)!\n\nBenne egy felirat (`<label>`): Neved:\n\nMellette egy szövegmező: `<input type="text" name="nev">`',
        tipp: 'Az <input>-nak nincs záró párja.',
        kezdo: ures('Jelentkezés'),
        megoldas: vaz('Jelentkezés', '  <form>\n    <label>Neved:</label>\n    <input type="text" name="nev">\n  </form>'),
        ell: [
          ['Van `<form>`', d => van(d, 'form')],
          ['Van `<label>`: Neved', d => benne(d, 'form label', 'neved')],
          ['Van `<input type="text" name="nev">`', d => van(d, 'form input[type="text"][name="nev"]')]
        ] },
      { id: 'html_10_2', cim: 'Belépés', kell: 'email, password, button',
        leiras: 'Készíts belépő űrlapot!\n\nE-mail mező: `type="email"`\n\nJelszó mező: `type="password"`\n\nGomb: `<button>Belépés</button>`',
        tipp: 'A jelszó mezőben pöttyök látszanak a betűk helyett. Próbáld ki az előnézetben!',
        kezdo: ures('Belépés'),
        megoldas: vaz('Belépés', '  <form>\n    <label>E-mail:</label>\n    <input type="email" name="email">\n    <label>Jelszó:</label>\n    <input type="password" name="jelszo">\n    <button>Belépés</button>\n  </form>'),
        ell: [
          ['Van e-mail mező', d => van(d, 'form input[type="email"]')],
          ['Van jelszó mező', d => van(d, 'form input[type="password"]')],
          ['Van gomb: Belépés', d => T(d, 'form button, form input[type="submit"]').some(b => /belépés/i.test(b.textContent + ' ' + (b.getAttribute('value') || '')))]
        ] },
      { id: 'html_10_3', cim: 'Felirat a mezőhöz kötve', kell: 'label for',
        leiras: 'Ha a feliratra kattintasz, a mező legyen aktív!\n\nAdd a mezőnek: `id="nev"`\n\nA feliratnak: `for="nev"`\n\nA `for` és az `id` értéke ugyanaz legyen.',
        tipp: 'Próbáld ki: kattints a Neved: feliratra az előnézetben. Ha jó, villog a kurzor a mezőben.',
        kezdo: vaz('Jelentkezés', '  <form>\n    <label>Neved:</label>\n    <input type="text" name="nev">\n  </form>'),
        megoldas: vaz('Jelentkezés', '  <form>\n    <label for="nev">Neved:</label>\n    <input type="text" name="nev" id="nev">\n  </form>'),
        ell: [
          ['A mezőnek van `id`-je', d => van(d, 'input[id]')],
          ['A feliratnak van `for`-ja', d => van(d, 'label[for]')],
          ['A `for` és az `id` egyezik', d => T(d, 'label[for]').some(l => { const i = d.getElementById(l.getAttribute('for')); return i && /^(input|select|textarea)$/i.test(i.tagName); })]
        ] },
      { id: 'html_10_4', cim: 'Szakkör választás', kell: 'select',
        leiras: 'Legördülő listából lehessen szakkört választani!\n\n`<select name="szakkor">`, benne három `<option>`: Kosárlabda, Robotika, Énekkar\n\nAlatta egy gomb: Jelentkezem',
        tipp: 'Minden választható elem egy <option>…</option> a <select>-en belül.',
        kezdo: vaz('Szakkör', '  <form>\n    <label for="szakkor">Szakkör:</label>\n    \n  </form>'),
        megoldas: vaz('Szakkör', '  <form>\n    <label for="szakkor">Szakkör:</label>\n    <select name="szakkor" id="szakkor">\n      <option>Kosárlabda</option>\n      <option>Robotika</option>\n      <option>Énekkar</option>\n    </select>\n    <button>Jelentkezem</button>\n  </form>'),
        ell: [
          ['Van `<select>`', d => van(d, 'form select')],
          ['Legalább 3 `<option>`', d => van(d, 'select option', 3)],
          ['Választható: Kosárlabda, Robotika, Énekkar', d => ['kosárlabda', 'robotika', 'énekkar'].every(s => benne(d, 'option', s))],
          ['Van gomb: Jelentkezem', d => T(d, 'form button, form input[type="submit"]').some(b => /jelentkez/i.test(b.textContent + ' ' + (b.getAttribute('value') || '')))]
        ] },
      { id: 'html_10_5', cim: 'Mit hozol a kirándulásra?', kell: 'checkbox',
        leiras: 'Pipálható lista kell!\n\nHárom jelölőnégyzet (`type="checkbox"`), mindegyik mellett felirat: Uzsonna, Esőkabát, Kulacs\n\nAlatta egy gomb: Kész',
        tipp: 'Pl.: <input type="checkbox" id="uzsonna"> <label for="uzsonna">Uzsonna</label>',
        kezdo: vaz('Kirándulás', '  <form>\n    <p>Mit hozol a kirándulásra?</p>\n    \n  </form>'),
        megoldas: vaz('Kirándulás', '  <form>\n    <p>Mit hozol a kirándulásra?</p>\n    <input type="checkbox" id="uzsonna"> <label for="uzsonna">Uzsonna</label><br>\n    <input type="checkbox" id="esokabat"> <label for="esokabat">Esőkabát</label><br>\n    <input type="checkbox" id="kulacs"> <label for="kulacs">Kulacs</label><br>\n    <button>Kész</button>\n  </form>'),
        ell: [
          ['Legalább 3 jelölőnégyzet', d => van(d, 'form input[type="checkbox"]', 3)],
          ['Feliratok: Uzsonna, Esőkabát, Kulacs', d => ['uzsonna', 'esőkabát', 'kulacs'].every(s => benne(d, 'form', s))],
          ['Van gomb: Kész', d => T(d, 'form button, form input[type="submit"]').some(b => /kész/i.test(b.textContent + ' ' + (b.getAttribute('value') || '')))]
        ] }
    ] }
  ];
  temak.forEach(t => t.feladatok.forEach((f, i) => { f.sorszam = i + 1; f.csop = t.cim; }));
  window.WEB_GYAKORLO_TEMAK = (window.WEB_GYAKORLO_TEMAK || []).concat(temak);
})();
