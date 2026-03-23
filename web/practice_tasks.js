// practice_tasks.js – Espresso Sarok Kávézó, 25 feladat (18 HTML + 7 CSS)
'use strict';

// ─── CSS helper ──────────────────────────────────────────────────────────────
const _cssHas = (sel, prop) => (h, c) => {
  const selEsc = sel.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const propEsc = prop.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const selRe = new RegExp(selEsc + '\\s*\\{([^}]*)\\}', 'gs');
  const propRe = new RegExp('(^|;|\\n)\\s*' + propEsc + '\\s*:', 'im');
  let m;
  while ((m = selRe.exec(c)) !== null) {
    if (propRe.test(m[1])) return true;
  }
  return false;
};

// ─── HTML fejléc (minden stage-ben ugyanaz) ───────────────────────────────────
const _H = `<!DOCTYPE html>
<html lang="hu">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Espresso Sarok Kávézó</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css">
  <link rel="stylesheet" href="style.css">
</head>
<body>
`;
const _F = `</body>
</html>`;

// ─── HTML stage-ek ────────────────────────────────────────────────────────────

const S1 = _H + `<div id="leiras"></div>
` + _F;

const S2 = _H + `<div id="leiras">

<nav>
  <ul>
    <li><a href="#kaveink">Kávék</a></li>
    <li><a href="#galeria">Galéria</a></li>
    <li><a href="#arlista">Árlista</a></li>
    <li><a href="https://maps.google.com/maps?q=Budapest" target="_blank">Térkép</a></li>
  </ul>
</nav>

</div>
` + _F;

const S3 = _H + `<div id="leiras">

<nav>
  <ul>
    <li><a href="#kaveink">Kávék</a></li>
    <li><a href="#galeria">Galéria</a></li>
    <li><a href="#arlista">Árlista</a></li>
    <li><a href="https://maps.google.com/maps?q=Budapest" target="_blank">Térkép</a></li>
  </ul>
</nav>

<img id="fejlec" src="img/kavezobanner.jpg" alt="Espresso Sarok Kávézó" title="Espresso Sarok Kávézó">

</div>
` + _F;

const S4 = _H + `<div id="leiras">

<nav>
  <ul>
    <li><a href="#kaveink">Kávék</a></li>
    <li><a href="#galeria">Galéria</a></li>
    <li><a href="#arlista">Árlista</a></li>
    <li><a href="https://maps.google.com/maps?q=Budapest" target="_blank">Térkép</a></li>
  </ul>
</nav>

<img id="fejlec" src="img/kavezobanner.jpg" alt="Espresso Sarok Kávézó" title="Espresso Sarok Kávézó">

<div class="container">
  <h1 id="felirat"><span class="text-uppercase">Espresso</span> Sarok Kávézó</h1>
</div>

</div>
` + _F;

const S5 = _H + `<div id="leiras">

<nav>
  <ul>
    <li><a href="#kaveink">Kávék</a></li>
    <li><a href="#galeria">Galéria</a></li>
    <li><a href="#arlista">Árlista</a></li>
    <li><a href="https://maps.google.com/maps?q=Budapest" target="_blank">Térkép</a></li>
  </ul>
</nav>

<img id="fejlec" src="img/kavezobanner.jpg" alt="Espresso Sarok Kávézó" title="Espresso Sarok Kávézó">

<div class="container">
  <h1 id="felirat"><span class="text-uppercase">Espresso</span> Sarok Kávézó</h1>
  <p class="my-3">Üdvözlünk az Espresso Sarok Kávézóban! Nálunk minden csésze egyedi élmény.</p>
  <p class="my-3">Kávézónk 2010 óta várja vendégeit a belváros szívében. Gondosan válogatott arabica szemekből készítjük italainkat.</p>
</div>

</div>
` + _F;

const S6 = _H + `<div id="leiras">

<nav>
  <ul>
    <li><a href="#kaveink">Kávék</a></li>
    <li><a href="#galeria">Galéria</a></li>
    <li><a href="#arlista">Árlista</a></li>
    <li><a href="https://maps.google.com/maps?q=Budapest" target="_blank">Térkép</a></li>
  </ul>
</nav>

<img id="fejlec" src="img/kavezobanner.jpg" alt="Espresso Sarok Kávézó" title="Espresso Sarok Kávézó">

<div class="container">
  <h1 id="felirat"><span class="text-uppercase">Espresso</span> Sarok Kávézó</h1>
  <p class="my-3">Üdvözlünk az Espresso Sarok Kávézóban! Nálunk minden csésze <u>egyedi élmény</u>.</p>
  <p class="my-3">Kávézónk 2010 óta várja vendégeit a belváros szívében. Gondosan válogatott arabica szemekből készítjük italainkat.</p>
</div>

</div>
` + _F;

const S7 = _H + `<div id="leiras">

<nav>
  <ul>
    <li><a href="#kaveink">Kávék</a></li>
    <li><a href="#galeria">Galéria</a></li>
    <li><a href="#arlista">Árlista</a></li>
    <li><a href="https://maps.google.com/maps?q=Budapest" target="_blank">Térkép</a></li>
  </ul>
</nav>

<img id="fejlec" src="img/kavezobanner.jpg" alt="Espresso Sarok Kávézó" title="Espresso Sarok Kávézó">

<div class="container">
  <h1 id="felirat"><span class="text-uppercase">Espresso</span> Sarok Kávézó</h1>
  <p class="my-3">Üdvözlünk az <strong>Espresso Sarok Kávézóban</strong>! Nálunk minden csésze <u>egyedi élmény</u>.</p>
  <p class="my-3">Kávézónk <strong>2010</strong> óta várja vendégeit a belváros szívében. Gondosan válogatott <em>arabica</em> szemekből készítjük <strong>kézműves</strong> italainkat.</p>
</div>

</div>
` + _F;

const S8 = _H + `<div id="leiras">

<nav>
  <ul>
    <li><a href="#kaveink">Kávék</a></li>
    <li><a href="#galeria">Galéria</a></li>
    <li><a href="#arlista">Árlista</a></li>
    <li><a href="https://maps.google.com/maps?q=Budapest" target="_blank">Térkép</a></li>
  </ul>
</nav>

<img id="fejlec" src="img/kavezobanner.jpg" alt="Espresso Sarok Kávézó" title="Espresso Sarok Kávézó">

<div class="container">
  <h1 id="felirat"><span class="text-uppercase">Espresso</span> Sarok Kávézó</h1>
  <p class="my-3">Üdvözlünk az <strong>Espresso Sarok Kávézóban</strong>! Nálunk minden csésze <u>egyedi élmény</u>.</p>
  <p class="my-3">Kávézónk <strong>2010</strong> óta várja vendégeit a belváros szívében. Gondosan válogatott <em>arabica</em> szemekből készítjük <strong>kézműves</strong> italainkat.</p>

  <h2 id="kaveink">Kávéitalok</h2>
  <ul id="italok">
    <li><em>Coffea arabica</em> – Espresso</li>
    <li><em>Coffea arabica</em> – Cappuccino</li>
    <li><em>Coffea canephora</em> – Americano</li>
    <li><em>Coffea arabica</em> – Flat white</li>
    <li><em>Coffea liberica</em> – Latte macchiato</li>
  </ul>
</div>

</div>
` + _F;

const S9 = _H + `<div id="leiras">

<nav>
  <ul>
    <li><a href="#kaveink">Kávék</a></li>
    <li><a href="#galeria">Galéria</a></li>
    <li><a href="#arlista">Árlista</a></li>
    <li><a href="https://maps.google.com/maps?q=Budapest" target="_blank">Térkép</a></li>
  </ul>
</nav>

<img id="fejlec" src="img/kavezobanner.jpg" alt="Espresso Sarok Kávézó" title="Espresso Sarok Kávézó">

<div class="container">
  <h1 id="felirat"><span class="text-uppercase">Espresso</span> Sarok Kávézó</h1>
  <p class="my-3">Üdvözlünk az <strong>Espresso Sarok Kávézóban</strong>! Nálunk minden csésze <u>egyedi élmény</u>.</p>
  <p class="my-3">Kávézónk <strong>2010</strong> óta várja vendégeit a belváros szívében. Gondosan válogatott <em>arabica</em> szemekből készítjük <strong>kézműves</strong> italainkat.</p>

  <h2 id="kaveink">Kávéitalok</h2>
  <ul id="italok">
    <li><em>Coffea arabica</em> – Espresso</li>
    <li><em>Coffea arabica</em> – Cappuccino</li>
    <li><em>Coffea canephora</em> – Americano</li>
    <li><em>Coffea arabica</em> – Flat white</li>
    <li><em>Coffea liberica</em> – Latte macchiato</li>
  </ul>

  <h3>Elkészítés lépései</h3>
  <ol>
    <li>A kávészemet frissen őröljük</li>
    <li>A portafiltert megtöltjük és tamperezzük</li>
    <li>Extrahálás: 25–30 másodperc</li>
    <li>Tej megpárlása (ha szükséges)</li>
  </ol>
</div>

</div>
` + _F;

const S10 = _H + `<div id="leiras">

<nav>
  <ul>
    <li><a href="#kaveink">Kávék</a></li>
    <li><a href="#galeria">Galéria</a></li>
    <li><a href="#arlista">Árlista</a></li>
    <li><a href="https://maps.google.com/maps?q=Budapest" target="_blank">Térkép</a></li>
  </ul>
</nav>

<img id="fejlec" src="img/kavezobanner.jpg" alt="Espresso Sarok Kávézó" title="Espresso Sarok Kávézó">

<div class="container">
  <h1 id="felirat"><span class="text-uppercase">Espresso</span> Sarok Kávézó</h1>
  <p class="my-3">Üdvözlünk az <strong>Espresso Sarok Kávézóban</strong>! Nálunk minden csésze <u>egyedi élmény</u>.</p>
  <p class="my-3">Kávézónk <strong>2010</strong> óta várja vendégeit a belváros szívében. Gondosan válogatott <em>arabica</em> szemekből készítjük <strong>kézműves</strong> italainkat.</p>

  <h2 id="kaveink">Kávéitalok</h2>
  <ul id="italok">
    <li><em>Coffea arabica</em> – Espresso</li>
    <li><em>Coffea arabica</em> – Cappuccino</li>
    <li><em>Coffea canephora</em> – Americano</li>
    <li><em>Coffea arabica</em> – Flat white</li>
    <li><em>Coffea liberica</em> – Latte macchiato</li>
  </ul>

  <h3>Elkészítés lépései</h3>
  <ol>
    <li>A kávészemet frissen őröljük</li>
    <li>A portafiltert megtöltjük és tamperezzük</li>
    <li>Extrahálás: 25–30 másodperc</li>
    <li>Tej megpárlása (ha szükséges)</li>
  </ol>

  <h2 class="alcim">Kávézónkról</h2>
</div>

</div>
` + _F;

const S11 = _H + `<div id="leiras">

<nav>
  <ul>
    <li><a href="#kaveink">Kávék</a></li>
    <li><a href="#galeria">Galéria</a></li>
    <li><a href="#arlista">Árlista</a></li>
    <li><a href="https://maps.google.com/maps?q=Budapest" target="_blank">Térkép</a></li>
  </ul>
</nav>

<img id="fejlec" src="img/kavezobanner.jpg" alt="Espresso Sarok Kávézó" title="Espresso Sarok Kávézó">

<div class="container">
  <h1 id="felirat"><span class="text-uppercase">Espresso</span> Sarok Kávézó</h1>
  <p class="my-3">Üdvözlünk az <strong>Espresso Sarok Kávézóban</strong>! Nálunk minden csésze <u>egyedi élmény</u>.</p>
  <p class="my-3">Kávézónk <strong>2010</strong> óta várja vendégeit a belváros szívében. Gondosan válogatott <em>arabica</em> szemekből készítjük <strong>kézműves</strong> italainkat.</p>

  <h2 id="kaveink">Kávéitalok</h2>
  <ul id="italok">
    <li><em>Coffea arabica</em> – Espresso</li>
    <li><em>Coffea arabica</em> – Cappuccino</li>
    <li><em>Coffea canephora</em> – Americano</li>
    <li><em>Coffea arabica</em> – Flat white</li>
    <li><em>Coffea liberica</em> – Latte macchiato</li>
  </ul>

  <h3>Elkészítés lépései</h3>
  <ol>
    <li>A kávészemet frissen őröljük</li>
    <li>A portafiltert megtöltjük és tamperezzük</li>
    <li>Extrahálás: 25–30 másodperc</li>
    <li>Tej megpárlása (ha szükséges)</li>
  </ol>

  <h2 class="alcim">Kávézónkról</h2>
  <p>Belső terünket <strong>barna</strong> és <strong>bézs</strong> tónusok jellemzik, amelyek <em>otthonos</em> légkört teremtenek.</p>
  <p>Gépeinket az olasz <strong>La Marzocco</strong> gyártótól szereztük be, hogy az <u>espresso</u> mindig tökéletes legyen.</p>
</div>

</div>
` + _F;

const S12 = _H + `<div id="leiras">

<nav>
  <ul>
    <li><a href="#kaveink">Kávék</a></li>
    <li><a href="#galeria">Galéria</a></li>
    <li><a href="#arlista">Árlista</a></li>
    <li><a href="https://maps.google.com/maps?q=Budapest" target="_blank">Térkép</a></li>
  </ul>
</nav>

<img id="fejlec" src="img/kavezobanner.jpg" alt="Espresso Sarok Kávézó" title="Espresso Sarok Kávézó">

<div class="container">
  <h1 id="felirat"><span class="text-uppercase">Espresso</span> Sarok Kávézó</h1>
  <p class="my-3">Üdvözlünk az <strong>Espresso Sarok Kávézóban</strong>! Nálunk minden csésze <u>egyedi élmény</u>.</p>
  <p class="my-3">Kávézónk <strong>2010</strong> óta várja vendégeit a belváros szívében. Gondosan válogatott <em>arabica</em> szemekből készítjük <strong>kézműves</strong> italainkat.</p>

  <h2 id="kaveink">Kávéitalok</h2>
  <ul id="italok">
    <li><em>Coffea arabica</em> – Espresso</li>
    <li><em>Coffea arabica</em> – Cappuccino</li>
    <li><em>Coffea canephora</em> – Americano</li>
    <li><em>Coffea arabica</em> – Flat white</li>
    <li><em>Coffea liberica</em> – Latte macchiato</li>
  </ul>

  <h3>Elkészítés lépései</h3>
  <ol>
    <li>A kávészemet frissen őröljük</li>
    <li>A portafiltert megtöltjük és tamperezzük</li>
    <li>Extrahálás: 25–30 másodperc</li>
    <li>Tej megpárlása (ha szükséges)</li>
  </ol>

  <h2 class="alcim">Kávézónkról</h2>
  <p>Belső terünket <strong>barna</strong> és <strong>bézs</strong> tónusok jellemzik, amelyek <em>otthonos</em> légkört teremtenek.</p>
  <p>Gépeinket az olasz <strong>La Marzocco</strong> gyártótól szereztük be, hogy az <u>espresso</u> mindig tökéletes legyen.</p>

  <img src="img/barista.jpg" alt="Baristánk munka közben" title="Baristánk munka közben" class="mx-auto d-block img-fluid">
</div>

</div>
` + _F;

const S13 = _H + `<div id="leiras">

<nav>
  <ul>
    <li><a href="#kaveink">Kávék</a></li>
    <li><a href="#galeria">Galéria</a></li>
    <li><a href="#arlista">Árlista</a></li>
    <li><a href="https://maps.google.com/maps?q=Budapest" target="_blank">Térkép</a></li>
  </ul>
</nav>

<img id="fejlec" src="img/kavezobanner.jpg" alt="Espresso Sarok Kávézó" title="Espresso Sarok Kávézó">

<div class="container">
  <h1 id="felirat"><span class="text-uppercase">Espresso</span> Sarok Kávézó</h1>
  <p class="my-3">Üdvözlünk az <strong>Espresso Sarok Kávézóban</strong>! Nálunk minden csésze <u>egyedi élmény</u>.</p>
  <p class="my-3">Kávézónk <strong>2010</strong> óta várja vendégeit a belváros szívében. Gondosan válogatott <em>arabica</em> szemekből készítjük <strong>kézműves</strong> italainkat.</p>

  <h2 id="kaveink">Kávéitalok</h2>
  <ul id="italok">
    <li><em>Coffea arabica</em> – Espresso</li>
    <li><em>Coffea arabica</em> – Cappuccino</li>
    <li><em>Coffea canephora</em> – Americano</li>
    <li><em>Coffea arabica</em> – Flat white</li>
    <li><em>Coffea liberica</em> – Latte macchiato</li>
  </ul>

  <h3>Elkészítés lépései</h3>
  <ol>
    <li>A kávészemet frissen őröljük</li>
    <li>A portafiltert megtöltjük és tamperezzük</li>
    <li>Extrahálás: 25–30 másodperc</li>
    <li>Tej megpárlása (ha szükséges)</li>
  </ol>

  <h2 class="alcim">Kávézónkról</h2>
  <p>Belső terünket <strong>barna</strong> és <strong>bézs</strong> tónusok jellemzik, amelyek <em>otthonos</em> légkört teremtenek.</p>
  <p>Gépeinket az olasz <strong>La Marzocco</strong> gyártótól szereztük be, hogy az <u>espresso</u> mindig tökéletes legyen.</p>

  <img src="img/barista.jpg" alt="Baristánk munka közben" title="Baristánk munka közben" class="mx-auto d-block img-fluid">
  <p class="text-center fw-bold">Baristánk munka közben</p>
</div>

</div>
` + _F;

const S14 = _H + `<div id="leiras">

<nav>
  <ul>
    <li><a href="#kaveink">Kávék</a></li>
    <li><a href="#galeria">Galéria</a></li>
    <li><a href="#arlista">Árlista</a></li>
    <li><a href="https://maps.google.com/maps?q=Budapest" target="_blank">Térkép</a></li>
  </ul>
</nav>

<img id="fejlec" src="img/kavezobanner.jpg" alt="Espresso Sarok Kávézó" title="Espresso Sarok Kávézó">

<div class="container">
  <h1 id="felirat"><span class="text-uppercase">Espresso</span> Sarok Kávézó</h1>
  <p class="my-3">Üdvözlünk az <strong>Espresso Sarok Kávézóban</strong>! Nálunk minden csésze <u>egyedi élmény</u>.</p>
  <p class="my-3">Kávézónk <strong>2010</strong> óta várja vendégeit a belváros szívében. Gondosan válogatott <em>arabica</em> szemekből készítjük <strong>kézműves</strong> italainkat.</p>

  <h2 id="kaveink">Kávéitalok</h2>
  <ul id="italok">
    <li><em>Coffea arabica</em> – Espresso</li>
    <li><em>Coffea arabica</em> – Cappuccino</li>
    <li><em>Coffea canephora</em> – Americano</li>
    <li><em>Coffea arabica</em> – Flat white</li>
    <li><em>Coffea liberica</em> – Latte macchiato</li>
  </ul>

  <h3>Elkészítés lépései</h3>
  <ol>
    <li>A kávészemet frissen őröljük</li>
    <li>A portafiltert megtöltjük és tamperezzük</li>
    <li>Extrahálás: 25–30 másodperc</li>
    <li>Tej megpárlása (ha szükséges)</li>
  </ol>

  <h2 class="alcim">Kávézónkról</h2>
  <p>Belső terünket <strong>barna</strong> és <strong>bézs</strong> tónusok jellemzik, amelyek <em>otthonos</em> légkört teremtenek.</p>
  <p>Gépeinket az olasz <strong>La Marzocco</strong> gyártótól szereztük be, hogy az <u>espresso</u> mindig tökéletes legyen.</p>

  <img src="img/barista.jpg" alt="Baristánk munka közben" title="Baristánk munka közben" class="mx-auto d-block img-fluid">
  <p class="text-center fw-bold">Baristánk munka közben</p>

  <div class="row my-3">
    <div class="col-md-6">
      <img src="img/kavezo.jpg" alt="Kávézó belső tere" class="img-fluid">
    </div>
    <div class="col-md-6">
      <p>Hangulatos belső terünkben <strong>30 fő</strong> fér el kényelmesen.</p>
      <p>Nyitva tartás: hétfőtől szombatig <u>7:00–20:00</u>.</p>
    </div>
  </div>
</div>

</div>
` + _F;

const S15 = _H + `<div id="leiras">

<nav>
  <ul>
    <li><a href="#kaveink">Kávék</a></li>
    <li><a href="#galeria">Galéria</a></li>
    <li><a href="#arlista">Árlista</a></li>
    <li><a href="https://maps.google.com/maps?q=Budapest" target="_blank">Térkép</a></li>
  </ul>
</nav>

<img id="fejlec" src="img/kavezobanner.jpg" alt="Espresso Sarok Kávézó" title="Espresso Sarok Kávézó">

<div class="container">
  <h1 id="felirat"><span class="text-uppercase">Espresso</span> Sarok Kávézó</h1>
  <p class="my-3">Üdvözlünk az <strong>Espresso Sarok Kávézóban</strong>! Nálunk minden csésze <u>egyedi élmény</u>.</p>
  <p class="my-3">Kávézónk <strong>2010</strong> óta várja vendégeit a belváros szívében. Gondosan válogatott <em>arabica</em> szemekből készítjük <strong>kézműves</strong> italainkat.</p>

  <h2 id="kaveink">Kávéitalok</h2>
  <ul id="italok">
    <li><em>Coffea arabica</em> – Espresso</li>
    <li><em>Coffea arabica</em> – Cappuccino</li>
    <li><em>Coffea canephora</em> – Americano</li>
    <li><em>Coffea arabica</em> – Flat white</li>
    <li><em>Coffea liberica</em> – Latte macchiato</li>
  </ul>

  <h3>Elkészítés lépései</h3>
  <ol>
    <li>A kávészemet frissen őröljük</li>
    <li>A portafiltert megtöltjük és tamperezzük</li>
    <li>Extrahálás: 25–30 másodperc</li>
    <li>Tej megpárlása (ha szükséges)</li>
  </ol>

  <h2 class="alcim">Kávézónkról</h2>
  <p>Belső terünket <strong>barna</strong> és <strong>bézs</strong> tónusok jellemzik, amelyek <em>otthonos</em> légkört teremtenek.</p>
  <p>Gépeinket az olasz <strong>La Marzocco</strong> gyártótól szereztük be, hogy az <u>espresso</u> mindig tökéletes legyen.</p>

  <img src="img/barista.jpg" alt="Baristánk munka közben" title="Baristánk munka közben" class="mx-auto d-block img-fluid">
  <p class="text-center fw-bold">Baristánk munka közben</p>

  <div class="row my-3">
    <div class="col-md-6">
      <img src="img/kavezo.jpg" alt="Kávézó belső tere" class="img-fluid">
    </div>
    <div class="col-md-6">
      <p>Hangulatos belső terünkben <strong>30 fő</strong> fér el kényelmesen.</p>
      <p>Nyitva tartás: hétfőtől szombatig <u>7:00–20:00</u>.</p>
    </div>
  </div>

  <div class="row my-3">
    <div class="col-md-4">
      <img src="img/espressocup.jpg" alt="Espresso" class="img-fluid mx-auto d-block">
      <p class="text-center fw-bold">Espresso</p>
    </div>
    <div class="col-md-8">
      <p>Az <strong>espresso</strong> minden kávéital alapja.</p>
      <p>Tömörített kávéőrleményen átengedett <em>forró vízből</em> készül, <strong>30 ml</strong> mennyiségben.</p>
    </div>
  </div>
</div>

</div>
` + _F;

const S16 = _H + `<div id="leiras">

<nav>
  <ul>
    <li><a href="#kaveink">Kávék</a></li>
    <li><a href="#galeria">Galéria</a></li>
    <li><a href="#arlista">Árlista</a></li>
    <li><a href="https://maps.google.com/maps?q=Budapest" target="_blank">Térkép</a></li>
  </ul>
</nav>

<img id="fejlec" src="img/kavezobanner.jpg" alt="Espresso Sarok Kávézó" title="Espresso Sarok Kávézó">

<div class="container">
  <h1 id="felirat"><span class="text-uppercase">Espresso</span> Sarok Kávézó</h1>
  <p class="my-3">Üdvözlünk az <strong>Espresso Sarok Kávézóban</strong>! Nálunk minden csésze <u>egyedi élmény</u>.</p>
  <p class="my-3">Kávézónk <strong>2010</strong> óta várja vendégeit a belváros szívében. Gondosan válogatott <em>arabica</em> szemekből készítjük <strong>kézműves</strong> italainkat.</p>

  <h2 id="kaveink">Kávéitalok</h2>
  <ul id="italok">
    <li><em>Coffea arabica</em> – Espresso</li>
    <li><em>Coffea arabica</em> – Cappuccino</li>
    <li><em>Coffea canephora</em> – Americano</li>
    <li><em>Coffea arabica</em> – Flat white</li>
    <li><em>Coffea liberica</em> – Latte macchiato</li>
  </ul>

  <h3>Elkészítés lépései</h3>
  <ol>
    <li>A kávészemet frissen őröljük</li>
    <li>A portafiltert megtöltjük és tamperezzük</li>
    <li>Extrahálás: 25–30 másodperc</li>
    <li>Tej megpárlása (ha szükséges)</li>
  </ol>

  <h2 class="alcim">Kávézónkról</h2>
  <p>Belső terünket <strong>barna</strong> és <strong>bézs</strong> tónusok jellemzik, amelyek <em>otthonos</em> légkört teremtenek.</p>
  <p>Gépeinket az olasz <strong>La Marzocco</strong> gyártótól szereztük be, hogy az <u>espresso</u> mindig tökéletes legyen.</p>

  <img src="img/barista.jpg" alt="Baristánk munka közben" title="Baristánk munka közben" class="mx-auto d-block img-fluid">
  <p class="text-center fw-bold">Baristánk munka közben</p>

  <div class="row my-3">
    <div class="col-md-6">
      <img src="img/kavezo.jpg" alt="Kávézó belső tere" class="img-fluid">
    </div>
    <div class="col-md-6">
      <p>Hangulatos belső terünkben <strong>30 fő</strong> fér el kényelmesen.</p>
      <p>Nyitva tartás: hétfőtől szombatig <u>7:00–20:00</u>.</p>
    </div>
  </div>

  <div class="row my-3">
    <div class="col-md-4">
      <img src="img/espressocup.jpg" alt="Espresso" class="img-fluid mx-auto d-block">
      <p class="text-center fw-bold">Espresso</p>
    </div>
    <div class="col-md-8">
      <p>Az <strong>espresso</strong> minden kávéital alapja.</p>
      <p>Tömörített kávéőrleményen átengedett <em>forró vízből</em> készül, <strong>30 ml</strong> mennyiségben.</p>
    </div>
  </div>

  <h2 id="arlista">Árlista</h2>
  <table class="table table-bordered">
    <thead>
      <tr>
        <th>Ital neve</th>
        <th>Méret</th>
        <th>Ár (Ft)</th>
      </tr>
    </thead>
    <tbody>
      <tr><td>Espresso</td><td>30 ml</td><td>490</td></tr>
      <tr><td>Cappuccino</td><td>180 ml</td><td>790</td></tr>
      <tr><td>Americano</td><td>200 ml</td><td>650</td></tr>
      <tr><td>Flat white</td><td>180 ml</td><td>850</td></tr>
    </tbody>
  </table>
</div>

</div>
` + _F;

const S17 = _H + `<div id="leiras">

<nav>
  <ul>
    <li><a href="#kaveink">Kávék</a></li>
    <li><a href="#galeria">Galéria</a></li>
    <li><a href="#arlista">Árlista</a></li>
    <li><a href="https://maps.google.com/maps?q=Budapest" target="_blank">Térkép</a></li>
  </ul>
</nav>

<img id="fejlec" src="img/kavezobanner.jpg" alt="Espresso Sarok Kávézó" title="Espresso Sarok Kávézó">

<div class="container">
  <h1 id="felirat"><span class="text-uppercase">Espresso</span> Sarok Kávézó</h1>
  <p class="my-3">Üdvözlünk az <strong>Espresso Sarok Kávézóban</strong>! Nálunk minden csésze <u>egyedi élmény</u>.</p>
  <p class="my-3">Kávézónk <strong>2010</strong> óta várja vendégeit a belváros szívében. Gondosan válogatott <em>arabica</em> szemekből készítjük <strong>kézműves</strong> italainkat.</p>

  <h2 id="kaveink">Kávéitalok</h2>
  <ul id="italok">
    <li><em>Coffea arabica</em> – Espresso</li>
    <li><em>Coffea arabica</em> – Cappuccino</li>
    <li><em>Coffea canephora</em> – Americano</li>
    <li><em>Coffea arabica</em> – Flat white</li>
    <li><em>Coffea liberica</em> – Latte macchiato</li>
  </ul>

  <h3>Elkészítés lépései</h3>
  <ol>
    <li>A kávészemet frissen őröljük</li>
    <li>A portafiltert megtöltjük és tamperezzük</li>
    <li>Extrahálás: 25–30 másodperc</li>
    <li>Tej megpárlása (ha szükséges)</li>
  </ol>

  <h2 class="alcim">Kávézónkról</h2>
  <p>Belső terünket <strong>barna</strong> és <strong>bézs</strong> tónusok jellemzik, amelyek <em>otthonos</em> légkört teremtenek.</p>
  <p>Gépeinket az olasz <strong>La Marzocco</strong> gyártótól szereztük be, hogy az <u>espresso</u> mindig tökéletes legyen.</p>

  <img src="img/barista.jpg" alt="Baristánk munka közben" title="Baristánk munka közben" class="mx-auto d-block img-fluid">
  <p class="text-center fw-bold">Baristánk munka közben</p>

  <div class="row my-3">
    <div class="col-md-6">
      <img src="img/kavezo.jpg" alt="Kávézó belső tere" class="img-fluid">
    </div>
    <div class="col-md-6">
      <p>Hangulatos belső terünkben <strong>30 fő</strong> fér el kényelmesen.</p>
      <p>Nyitva tartás: hétfőtől szombatig <u>7:00–20:00</u>.</p>
    </div>
  </div>

  <div class="row my-3">
    <div class="col-md-4">
      <img src="img/espressocup.jpg" alt="Espresso" class="img-fluid mx-auto d-block">
      <p class="text-center fw-bold">Espresso</p>
    </div>
    <div class="col-md-8">
      <p>Az <strong>espresso</strong> minden kávéital alapja.</p>
      <p>Tömörített kávéőrleményen átengedett <em>forró vízből</em> készül, <strong>30 ml</strong> mennyiségben.</p>
    </div>
  </div>

  <h2 id="arlista">Árlista</h2>
  <table class="table table-bordered table-striped">
    <thead>
      <tr>
        <th class="text-uppercase text-center align-middle">Ital neve</th>
        <th class="text-uppercase text-center align-middle">Méret</th>
        <th class="text-uppercase text-center align-middle">Ár (Ft)</th>
      </tr>
    </thead>
    <tbody>
      <tr><td>Espresso</td><td>30 ml</td><td>490</td></tr>
      <tr><td>Cappuccino</td><td>180 ml</td><td>790</td></tr>
      <tr><td>Americano</td><td>200 ml</td><td>650</td></tr>
      <tr><td>Flat white</td><td>180 ml</td><td>850</td></tr>
    </tbody>
  </table>
</div>

</div>
` + _F;

const S_FINAL = _H + `<div id="leiras">

<nav>
  <ul>
    <li><a href="#kaveink">Kávék</a></li>
    <li><a href="#galeria">Galéria</a></li>
    <li><a href="#arlista">Árlista</a></li>
    <li><a href="https://maps.google.com/maps?q=Budapest" target="_blank">Térkép</a></li>
  </ul>
</nav>

<img id="fejlec" src="img/kavezobanner.jpg" alt="Espresso Sarok Kávézó" title="Espresso Sarok Kávézó">

<div class="container">
  <h1 id="felirat"><span class="text-uppercase">Espresso</span> Sarok Kávézó</h1>
  <p class="my-3">Üdvözlünk az <strong>Espresso Sarok Kávézóban</strong>! Nálunk minden csésze <u>egyedi élmény</u>.</p>
  <p class="my-3">Kávézónk <strong>2010</strong> óta várja vendégeit a belváros szívében. Gondosan válogatott <em>arabica</em> szemekből készítjük <strong>kézműves</strong> italainkat.</p>

  <h2 id="kaveink">Kávéitalok</h2>
  <ul id="italok">
    <li><em>Coffea arabica</em> – Espresso</li>
    <li><em>Coffea arabica</em> – Cappuccino</li>
    <li><em>Coffea canephora</em> – Americano</li>
    <li><em>Coffea arabica</em> – Flat white</li>
    <li><em>Coffea liberica</em> – Latte macchiato</li>
  </ul>

  <h3>Elkészítés lépései</h3>
  <ol>
    <li>A kávészemet frissen őröljük</li>
    <li>A portafiltert megtöltjük és tamperezzük</li>
    <li>Extrahálás: 25–30 másodperc</li>
    <li>Tej megpárlása (ha szükséges)</li>
  </ol>

  <h2 class="alcim">Kávézónkról</h2>
  <p>Belső terünket <strong>barna</strong> és <strong>bézs</strong> tónusok jellemzik, amelyek <em>otthonos</em> légkört teremtenek.</p>
  <p>Gépeinket az olasz <strong>La Marzocco</strong> gyártótól szereztük be, hogy az <u>espresso</u> mindig tökéletes legyen.</p>

  <img src="img/barista.jpg" alt="Baristánk munka közben" title="Baristánk munka közben" class="mx-auto d-block img-fluid">
  <p class="text-center fw-bold">Baristánk munka közben</p>

  <div class="row my-3">
    <div class="col-md-6">
      <img src="img/kavezo.jpg" alt="Kávézó belső tere" class="img-fluid">
    </div>
    <div class="col-md-6">
      <p>Hangulatos belső terünkben <strong>30 fő</strong> fér el kényelmesen.</p>
      <p>Nyitva tartás: hétfőtől szombatig <u>7:00–20:00</u>.</p>
    </div>
  </div>

  <div class="row my-3">
    <div class="col-md-4">
      <img src="img/espressocup.jpg" alt="Espresso" class="img-fluid mx-auto d-block">
      <p class="text-center fw-bold">Espresso</p>
    </div>
    <div class="col-md-8">
      <p>Az <strong>espresso</strong> minden kávéital alapja.</p>
      <p>Tömörített kávéőrleményen átengedett <em>forró vízből</em> készül, <strong>30 ml</strong> mennyiségben.</p>
    </div>
  </div>

  <h2 id="arlista">Árlista</h2>
  <table class="table table-bordered table-striped">
    <thead>
      <tr>
        <th class="text-uppercase text-center align-middle">Ital neve</th>
        <th class="text-uppercase text-center align-middle">Méret</th>
        <th class="text-uppercase text-center align-middle">Ár (Ft)</th>
      </tr>
    </thead>
    <tbody>
      <tr><td>Espresso</td><td>30 ml</td><td>490</td></tr>
      <tr><td>Cappuccino</td><td>180 ml</td><td>790</td></tr>
      <tr><td>Americano</td><td>200 ml</td><td>650</td></tr>
      <tr><td>Flat white</td><td>180 ml</td><td>850</td></tr>
    </tbody>
  </table>
</div>

</div>

<footer class="lablec">
  <a href="#leiras">Ugrás az elejére</a>
  <p>© 2025 Espresso Sarok Kávézó</p>
</footer>

<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"><\/script>
` + _F;

// ─── CSS stage-ek ─────────────────────────────────────────────────────────────
const Css1 = `@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&display=swap');

body {
  font-family: 'Playfair Display', serif;
}`;

const Css2 = Css1 + `

#fejlec {
  width: 100%;
}`;

const Css3 = Css2 + `

#felirat {
  font-variant: small-caps;
  font-weight: bold;
  color: #4a2c0a;
}`;

const Css4 = Css3 + `

nav li {
  border-right: 3px dotted #7a4a1e;
  padding: 0 15px;
}`;

const Css5 = Css4 + `

.alcim {
  font-size: 2.5em;
  background-color: #fdf6ee;
}`;

const Css6 = Css5 + `

.lablec a {
  color: white;
  text-decoration: none;
}
.lablec a:hover {
  text-transform: uppercase;
}`;

const Css7 = Css6 + `

#italok {
  list-style-image: url('img/kaveszem.svg');
  margin-left: 25px;
}
p {
  text-align: justify;
}`;

// ─── Tasks ────────────────────────────────────────────────────────────────────
const tasks = [
  {
    id: 1, emoji: '🏗️', title: 'HTML váz',
    description: 'Hozd létre az oldal alapszerkezetét!<br><br>💡 Nyomd meg a <strong>! + Tab</strong> billentyűt – az Emmet azonnal legenerálja a HTML vázat.<br><br><ul><li>Állítsd be a nyelvet magyarra: <code>lang="hu"</code></li><li>A <code>head</code>-be írd be: <code>&lt;meta charset="UTF-8"&gt;</code> – a magyar karakterek helyes megjelenítéséhez</li><li>A weboldal címe legyen: <strong>Espresso Sarok Kávézó</strong></li><li>Bootstrap CSS CDN link:<br><code>&lt;link rel="stylesheet"<br>&nbsp;&nbsp;href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css"&gt;</code></li><li>Bootstrap <strong>után</strong> csatold a saját stíluslapot: <code>&lt;link rel="stylesheet" href="style.css"&gt;</code></li></ul>⚠️ A Bootstrap és a <code>style.css</code> csatolásáért nem jár pont, de a feladat része!',
    starterHtml: '', starterCss: '',
    checks: [
      { label: '<!DOCTYPE html>', explanation: 'Az első sor: <!DOCTYPE html>', fn: (h) => /<!DOCTYPE\s+html>/i.test(h) },
      { label: '<html lang="hu">', explanation: 'Az html elemnek legyen lang="hu" attribútuma', fn: (h,c,d) => !!d.querySelector('html[lang="hu"]') },
      { label: 'meta charset="UTF-8"', explanation: '<meta charset="UTF-8"> a head-ben', fn: (h,c,d) => !!d.querySelector('meta[charset="UTF-8"]') },
      { label: 'meta viewport', explanation: '<meta name="viewport" content="width=device-width, initial-scale=1.0">', fn: (h,c,d) => !!d.querySelector('meta[name="viewport"]') },
      { label: 'title: Espresso Sarok Kávézó', explanation: 'A title tartalma pontosan: Espresso Sarok Kávézó', fn: (h,c,d) => (d.querySelector('title')||{}).textContent === 'Espresso Sarok Kávézó' },
    ],
    solution: S1,
  },
  {
    id: 2, emoji: '🧭', title: 'Navigáció',
    description: 'Készítsd el a navigációs sávot!<br><br><ul><li><code>&lt;nav&gt;</code> elem</li><li>Benne <code>&lt;ul&gt;</code> lista legalább 4 <code>&lt;li&gt;</code>-vel</li><li>Hivatkozások: <code>#kaveink</code>, <code>#galeria</code>, <code>#arlista</code></li><li>Egy <strong>külső link</strong>: <code>&lt;a href="https://maps.google.com/maps?q=Budapest" target="_blank"&gt;</code> – ez új fülön nyílik meg</li></ul>',
    starterHtml: S1, starterCss: '',
    checks: [
      { label: '<nav> elem', explanation: 'Kell egy <nav> elem', fn: (h,c,d) => !!d.querySelector('nav') },
      { label: '<ul> a nav-ban', explanation: 'A nav-on belül kell <ul>', fn: (h,c,d) => !!d.querySelector('nav ul') },
      { label: 'Legalább 4 <li>', explanation: 'Legalább 4 <li> a navigációban', fn: (h,c,d) => d.querySelectorAll('nav li').length >= 4 },
      { label: 'Külső link: target="_blank"', explanation: 'Kell egy <a target="_blank"> a nav-ban – külső oldal (pl. térkép)', fn: (h,c,d) => !!d.querySelector('nav a[target="_blank"]') },
    ],
    solution: S2,
  },
  {
    id: 3, emoji: '🖼️', title: 'Fejléc kép',
    description: 'Add hozzá a fejléc képet!<br><br>A <code>&lt;nav&gt;</code> után:<br><code>&lt;img id="fejlec" src="img/kavezobanner.jpg" alt="Espresso Sarok Kávézó" title="Espresso Sarok Kávézó"&gt;</code><br><br>💡 <strong>Emmet tipp:</strong> írd be: <code>img</code> majd nyomj <kbd>Tab</kbd> gombot – automatikusan kitölti az attribútumokat!<br><br>⚠️ <strong>Vizsga-csapda:</strong> az <code>alt</code> és <code>title</code> attribútum értéke <em>azonos</em> szöveg, és <strong>mindkettő kötelező</strong>!',
    starterHtml: S2, starterCss: '',
    checks: [
      { label: '<img id="fejlec">', explanation: 'Kell: <img id="fejlec" ...>', fn: (h,c,d) => !!d.querySelector('img#fejlec') },
      { label: 'alt attribútum', explanation: 'Az img#fejlec-nek kell alt="..." attribútum', fn: (h,c,d) => { const i=d.querySelector('img#fejlec'); return !!(i&&i.hasAttribute('alt')); } },
      { label: 'title attribútum', explanation: 'Az img#fejlec-nek kell title="..." is – a vizsgán MINDKETTŐ kötelező!', fn: (h,c,d) => { const i=d.querySelector('img#fejlec'); return !!(i&&i.hasAttribute('title')); } },
      { label: 'alt és title azonos szöveg', explanation: 'A vizsgán az alt és title értéke azonos szöveg kell legyen', fn: (h,c,d) => { const i=d.querySelector('img#fejlec'); return !!(i&&i.getAttribute('alt')&&i.getAttribute('alt')===i.getAttribute('title')); } },
    ],
    solution: S3,
  },
  {
    id: 4, emoji: '📌', title: 'Főcím',
    description: 'Add hozzá a főcímet!<br><br>Az <code>img#fejlec</code> után nyiss egy <code>&lt;div class="container"&gt;</code>-t és bele:<br><code>&lt;h1 id="felirat"&gt;&lt;span class="text-uppercase"&gt;Espresso&lt;/span&gt; Sarok Kávézó&lt;/h1&gt;</code><br><br>📌 A Bootstrap <code>text-uppercase</code> osztálya CSS-sel írja nagybetűssé a szöveget – nem kell külön CSS.',
    starterHtml: S3, starterCss: '',
    checks: [
      { label: '<div class="container">', explanation: 'A tartalom .container div-be kerül', fn: (h,c,d) => !!d.querySelector('div.container') },
      { label: '<h1 id="felirat">', explanation: 'Kell: <h1 id="felirat">', fn: (h,c,d) => !!d.querySelector('h1#felirat') },
      { label: '<span class="text-uppercase"> a h1-ben', explanation: 'A h1-ben kell: <span class="text-uppercase">...</span>', fn: (h,c,d) => !!d.querySelector('h1#felirat span.text-uppercase') },
    ],
    solution: S4,
  },
  {
    id: 5, emoji: '📝', title: 'Bekezdések',
    description: 'Adj hozzá legalább 2 bekezdést!<br><br>A <code>&lt;h1&gt;</code> után a <code>.container</code>-ben:<br><code>&lt;p class="my-3"&gt;szöveg&lt;/p&gt;</code><br><br>📌 A Bootstrap <code>my-3</code> osztálya automatikusan ad felső és alsó margót – nem kell CSS.',
    starterHtml: S4, starterCss: '',
    checks: [
      { label: 'Legalább 2 <p class="my-3">', explanation: 'Kell legalább 2 db <p class="my-3">', fn: (h,c,d) => d.querySelectorAll('p.my-3').length >= 2 },
      { label: '<p class="my-3"> a .container-ben', explanation: 'A bekezdések a .container-en belül legyenek', fn: (h,c,d) => !!d.querySelector('.container p.my-3') },
    ],
    solution: S5,
  },
  {
    id: 6, emoji: '📐', title: 'Aláhúzás',
    description: 'Jelölj meg szövegrészt aláhúzással!<br><br>Az egyik <code>&lt;p&gt;</code>-ben:<br><code>&lt;u&gt;egyedi élmény&lt;/u&gt;</code><br><br>📌 A <code>&lt;u&gt;</code> az aláhúzott szöveg HTML jelölője. A <code>&lt;ins&gt;</code> tag is ugyanezt csinálja és elfogadott, de a vizsgákon a <code>&lt;u&gt;</code>-t kérjük.',
    starterHtml: S5, starterCss: '',
    checks: [
      { label: '<u> elem', explanation: 'Kell egy <u> elem a HTML-ben', fn: (h,c,d) => !!d.querySelector('u') },
      { label: '<u> bekezdésen belül', explanation: 'A <u> egy <p> elemen belül legyen', fn: (h,c,d) => !!d.querySelector('p u') },
    ],
    solution: S6,
  },
  {
    id: 7, emoji: '✍️', title: 'Félkövér és dőlt',
    description: 'Formázd meg a szöveget szemantikus elemekkel!<br><br><ul><li><code>&lt;strong&gt;</code> – <strong>félkövér</strong>, fontos tartalomra</li><li><code>&lt;em&gt;</code> – <em>dőlt</em>, hangsúlyos tartalomra (pl. idegen szavak)</li></ul>Adj legalább 2 helyen <code>&lt;strong&gt;</code>-ot és 1 helyen <code>&lt;em&gt;</code>-et a bekezdésekbe.',
    starterHtml: S6, starterCss: '',
    checks: [
      { label: '<strong> elem', explanation: 'Kell legalább egy <strong>', fn: (h,c,d) => !!d.querySelector('strong') },
      { label: 'Legalább 2 <strong>', explanation: 'Legalább 2 helyen kell <strong>', fn: (h,c,d) => d.querySelectorAll('strong').length >= 2 },
      { label: '<em> elem', explanation: 'Kell legalább egy <em>', fn: (h,c,d) => !!d.querySelector('em') },
    ],
    solution: S7,
  },
  {
    id: 8, emoji: '☕', title: 'Felsorolás – ul',
    description: 'Adj hozzá felsorolást!<br><br>A bekezdések után:<ul><li><code>&lt;h2 id="kaveink"&gt;Kávéitalok&lt;/h2&gt;</code></li><li><code>&lt;ul id="italok"&gt;</code> legalább 5 <code>&lt;li&gt;</code>-vel</li><li>Minden <code>&lt;li&gt;</code>-ben a latin növénynév <code>&lt;em&gt;</code>-mel jelölve</li></ul>Példa: <code>&lt;li&gt;&lt;em&gt;Coffea arabica&lt;/em&gt; – Espresso&lt;/li&gt;</code>',
    starterHtml: S7, starterCss: '',
    checks: [
      { label: '<ul id="italok">', explanation: 'Kell: <ul id="italok"> (ez az id kell a CSS list-style-image-hez)', fn: (h,c,d) => !!d.querySelector('ul#italok') },
      { label: 'Legalább 5 <li>', explanation: 'Legalább 5 <li> kell az ul#italok-ban', fn: (h,c,d) => d.querySelectorAll('ul#italok li').length >= 5 },
      { label: '<em> a listaelemekben', explanation: 'A latin neveket <em>-mel jelöld', fn: (h,c,d) => !!d.querySelector('ul#italok li em') },
    ],
    solution: S8,
  },
  {
    id: 9, emoji: '🔢', title: 'Számozott lista – ol',
    description: 'Adj hozzá számozott listát!<br><br>Az <code>&lt;ul&gt;</code> után:<ul><li><code>&lt;h3&gt;Elkészítés lépései&lt;/h3&gt;</code></li><li><code>&lt;ol&gt;</code> legalább 4 <code>&lt;li&gt;</code>-vel</li></ul>📌 <code>&lt;ul&gt;</code> = bullet lista (sorrend nem fontos), <code>&lt;ol&gt;</code> = számozott lista (sorrend fontos).',
    starterHtml: S8, starterCss: '',
    checks: [
      { label: '<h3> alcím', explanation: 'Kell egy <h3> az <ol> előtt', fn: (h,c,d) => !!d.querySelector('h3') },
      { label: '<ol> elem', explanation: 'Kell egy <ol> (számozott lista)', fn: (h,c,d) => !!d.querySelector('ol') },
      { label: 'Legalább 4 <li> az ol-ban', explanation: 'Az <ol>-ban legalább 4 lépés kell', fn: (h,c,d) => d.querySelectorAll('ol li').length >= 4 },
    ],
    solution: S9,
  },
  {
    id: 10, emoji: '🏷️', title: 'Alcím osztállyal',
    description: 'Adj hozzá alcímet CSS-osztállyal!<br><br>Az <code>&lt;ol&gt;</code> után:<br><code>&lt;h2 class="alcim"&gt;Kávézónkról&lt;/h2&gt;</code><br><br>📌 Az <code>alcim</code> osztály azért kell, mert a CSS-ben <code>.alcim { ... }</code> szelektorral csak ezt a konkrét alcímet stílusozhatjuk – nem az összes h2-t.',
    starterHtml: S9, starterCss: '',
    checks: [
      { label: '<h2 class="alcim"> vagy <h3 class="alcim">', explanation: 'Kell egy h2 vagy h3 elem alcim osztállyal', fn: (h,c,d) => !!(d.querySelector('h2.alcim')||d.querySelector('h3.alcim')) },
      { label: '.alcim a .container-ben', explanation: 'Az alcím a .container-en belül legyen', fn: (h,c,d) => !!d.querySelector('.container .alcim') },
    ],
    solution: S10,
  },
  {
    id: 11, emoji: '📖', title: 'Alcím bekezdések',
    description: 'Az alcím alá adj legalább 2 bekezdést!<br><br>A <code>&lt;h2 class="alcim"&gt;</code> után:<ul><li>Egyik <code>&lt;p&gt;</code>-ben <code>&lt;strong&gt;</code> kiemelés</li><li>Másikban <code>&lt;u&gt;</code> aláhúzás</li></ul>',
    starterHtml: S10, starterCss: '',
    checks: [
      { label: 'Legalább 4 <p> összesen a .container-ben', explanation: 'Az eddigi 2 + az új 2 bekezdéssel összesen legalább 4 <p> kell', fn: (h,c,d) => d.querySelectorAll('.container p').length >= 4 },
      { label: 'Legalább 3 <strong> összesen', explanation: 'Az alcím bekezdéseiben is legyen <strong>', fn: (h,c,d) => d.querySelectorAll('.container p strong').length >= 3 },
    ],
    solution: S11,
  },
  {
    id: 12, emoji: '📷', title: 'Második kép',
    description: 'Adj hozzá egy második képet!<br><br>Az alcím bekezdései után:<br><code>&lt;img src="img/barista.jpg" alt="Baristánk munka közben" title="Baristánk munka közben" class="mx-auto d-block img-fluid"&gt;</code><br><br>⚠️ <strong>Vizsga-követelmény:</strong> az img-nek kell <code>src</code>, <code>alt</code> ÉS <code>title</code> – mindhárom egyszerre!',
    starterHtml: S11, starterCss: '',
    checks: [
      { label: 'Második img (nem #fejlec)', explanation: 'Kell egy második img, ami nem az #fejlec', fn: (h,c,d) => d.querySelectorAll('img').length >= 2 },
      { label: 'alt attribútum', explanation: 'A második képnek legyen alt attribútuma', fn: (h,c,d) => !!d.querySelector('img:not(#fejlec)[alt]') },
      { label: 'title attribútum', explanation: 'A második képnek legyen title attribútuma is', fn: (h,c,d) => !!d.querySelector('img:not(#fejlec)[title]') },
    ],
    solution: S12,
  },
  {
    id: 13, emoji: '🎯', title: 'Kép középre + felirat',
    description: 'Helyezd középre a képet és adj képfeliratot!<br><br>A képhez add: <code>class="mx-auto d-block img-fluid"</code><br>A kép után: <code>&lt;p class="text-center fw-bold"&gt;Baristánk munka közben&lt;/p&gt;</code><br><br>📌 <code>mx-auto d-block</code> = Bootstrap képközpontosítás. A vizsgán <strong>nem</strong> figure/figcaption, hanem <code>&lt;p class="text-center fw-bold"&gt;</code> kell!',
    starterHtml: S12, starterCss: '',
    checks: [
      { label: 'img.mx-auto.d-block', explanation: 'A képnek legyen class="... mx-auto d-block ..."', fn: (h,c,d) => !!d.querySelector('img.mx-auto.d-block') },
      { label: 'img.img-fluid', explanation: 'A képnek legyen img-fluid osztálya', fn: (h,c,d) => !!d.querySelector('img:not(#fejlec).img-fluid') },
      { label: '<p class="text-center fw-bold">', explanation: 'Kell: <p class="text-center fw-bold">képfelirat szöveg</p>', fn: (h,c,d) => !!d.querySelector('p.text-center.fw-bold') },
    ],
    solution: S13,
  },
  {
    id: 14, emoji: '⬜⬜', title: 'Grid – feles osztás',
    description: 'Készítsd el a feles Bootstrap rácsot!<br><br><pre><code>&lt;div class="row my-3"&gt;\n  &lt;div class="col-md-6"&gt;\n    &lt;img src="img/kavezo.jpg" alt="..." class="img-fluid"&gt;\n  &lt;/div&gt;\n  &lt;div class="col-md-6"&gt;\n    &lt;p&gt;szöveg&lt;/p&gt;\n  &lt;/div&gt;\n&lt;/div&gt;</code></pre>📌 <code>col-md-6 + col-md-6</code> = 6+6=12 → két egyforma oszlop.',
    starterHtml: S13, starterCss: '',
    checks: [
      { label: '<div class="row">', explanation: 'Kell egy <div class="row">', fn: (h,c,d) => !!d.querySelector('div.row') },
      { label: 'Legalább 2 col-md-6', explanation: 'Kell 2 db <div class="col-md-6">', fn: (h,c,d) => d.querySelectorAll('.col-md-6').length >= 2 },
      { label: 'img.img-fluid a col-md-6-ban', explanation: 'Az egyik col-md-6-ban legyen img.img-fluid', fn: (h,c,d) => !!d.querySelector('.col-md-6 img.img-fluid') },
      { label: '<p> a másik col-md-6-ban', explanation: 'A másik col-md-6-ban legyen <p> szöveg', fn: (h,c,d) => !!d.querySelector('.col-md-6 p') },
    ],
    solution: S14,
  },
  {
    id: 15, emoji: '◻️▬', title: 'Grid – aszimmetrikus',
    description: 'Készítsd el az aszimmetrikus Bootstrap rácsot!<br><br><pre><code>&lt;div class="row my-3"&gt;\n  &lt;div class="col-md-4"&gt;\n    &lt;img ...&gt;\n    &lt;p class="text-center fw-bold"&gt;Espresso&lt;/p&gt;\n  &lt;/div&gt;\n  &lt;div class="col-md-8"&gt;\n    &lt;p&gt;leírás&lt;/p&gt;\n  &lt;/div&gt;\n&lt;/div&gt;</code></pre>📌 <code>col-md-4 + col-md-8</code> = 4+8=12 → kis kép + nagy szövegblokk.',
    starterHtml: S14, starterCss: '',
    checks: [
      { label: '<div class="col-md-4">', explanation: 'Kell egy col-md-4 oszlop', fn: (h,c,d) => !!d.querySelector('.col-md-4') },
      { label: '<div class="col-md-8">', explanation: 'Kell egy col-md-8 oszlop', fn: (h,c,d) => !!d.querySelector('.col-md-8') },
      { label: 'col-md-4 és col-md-8 ugyanabban a row-ban', explanation: 'Mindkettőnek ugyanabban a .row-ban kell lennie', fn: (h,c,d) => !!d.querySelector('.row .col-md-4') && !!d.querySelector('.row .col-md-8') },
    ],
    solution: S15,
  },
  {
    id: 16, emoji: '📋', title: 'Bootstrap táblázat',
    description: 'Készítsd el az árlistát táblázatban!<br><br><ul><li><code>&lt;h2 id="arlista"&gt;Árlista&lt;/h2&gt;</code></li><li><code>&lt;table class="table table-bordered"&gt;</code></li><li><code>&lt;thead&gt;</code> 3 db <code>&lt;th&gt;</code>-val: Ital neve, Méret, Ár (Ft)</li><li><code>&lt;tbody&gt;</code> legalább 4 adatsorral</li></ul>',
    starterHtml: S15, starterCss: '',
    checks: [
      { label: 'table.table.table-bordered', explanation: '<table class="table table-bordered">', fn: (h,c,d) => !!d.querySelector('table.table.table-bordered') },
      { label: '<thead> és <tbody>', explanation: 'Kell <thead> és <tbody> is', fn: (h,c,d) => !!d.querySelector('thead') && !!d.querySelector('tbody') },
      { label: 'Legalább 3 <th>', explanation: 'A thead-ben legalább 3 <th>', fn: (h,c,d) => d.querySelectorAll('th').length >= 3 },
      { label: 'Legalább 4 adatsor', explanation: 'A tbody-ban legalább 4 <tr>', fn: (h,c,d) => d.querySelectorAll('tbody tr').length >= 4 },
    ],
    solution: S16,
  },
  {
    id: 17, emoji: '🎨', title: 'Táblázat stílusok',
    description: 'Bővítsd a táblázat Bootstrap stílusait!<br><br><ul><li>A <code>&lt;table&gt;</code>-hoz add: <code>table-striped</code></li><li>Minden <code>&lt;th&gt;</code>-hoz add: <code>class="text-uppercase text-center align-middle"</code></li></ul>📌 <code>table-striped</code> = zebra-csíkos sorok. <code>align-middle</code> = függőlegesen középre.',
    starterHtml: S16, starterCss: '',
    checks: [
      { label: 'table-striped osztály', explanation: 'A table-hoz add a table-striped osztályt', fn: (h,c,d) => !!d.querySelector('table.table-striped') },
      { label: 'th.text-uppercase', explanation: 'Minden th-nak legyen text-uppercase osztálya', fn: (h,c,d) => !!d.querySelector('th.text-uppercase') },
      { label: 'th.text-center.align-middle', explanation: 'Minden th-nak legyen text-center és align-middle osztálya', fn: (h,c,d) => !!d.querySelector('th.text-center.align-middle') },
    ],
    solution: S17,
  },
  {
    id: 18, emoji: '🦶', title: 'Lábléc',
    description: 'Zárd le az oldalt lábléc elemmel!<br><br>A <code>&lt;/div&gt;</code> (#leiras vége) után:<pre><code>&lt;footer class="lablec"&gt;\n  &lt;a href="#leiras"&gt;Ugrás az elejére&lt;/a&gt;\n  &lt;p&gt;© 2025 Espresso Sarok Kávézó&lt;/p&gt;\n&lt;/footer&gt;</code></pre>A <code>&lt;/body&gt;</code> elé kösd be a Bootstrap JS CDN-t is!<br><br>⚠️ <code>class="lablec"</code> (nem id!), link: <code>href="#leiras"</code>',
    starterHtml: S17, starterCss: '',
    checks: [
      { label: '<footer class="lablec">', explanation: 'Kell: <footer class="lablec"> (class, nem id!)', fn: (h,c,d) => !!d.querySelector('footer.lablec') },
      { label: 'Link: href="#leiras"', explanation: '<a href="#leiras">Ugrás az elejére</a>', fn: (h,c,d) => !!d.querySelector('footer.lablec a[href="#leiras"]') },
      { label: '<p> a footer-ben', explanation: 'A footer-ben kell <p> szöveg (pl. copyright)', fn: (h,c,d) => !!d.querySelector('footer.lablec p') },
    ],
    solution: S_FINAL,
  },
  {
    id: 19, emoji: '🔤', title: 'CSS – Google Fonts',
    description: 'Kapcsolj a <strong>CSS fülre</strong>!<br><br>A CSS fájl <strong>legelején</strong>:<br><code>@import url(\'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&display=swap\');</code><br><br>Majd:<pre><code>body {\n  font-family: \'Playfair Display\', serif;\n}</code></pre>📌 Az <code>@import</code> a CSS fájl abszolút elejére kell – semmi sem lehet előtte!',
    starterHtml: S_FINAL, starterCss: '',
    checks: [
      { label: '@import Google Fonts', explanation: "@import url('https://fonts.googleapis.com/...') a CSS elején", fn: (h,c) => /\@import\s+url\(['"']?https:\/\/fonts\.googleapis/i.test(c) },
      { label: 'body: font-family', explanation: "body { font-family: 'Playfair Display', serif; }", fn: _cssHas('body', 'font-family') },
    ],
    solution: S_FINAL, solutionCss: Css1,
  },
  {
    id: 20, emoji: '🖼️', title: 'CSS – Fejléc kép szélesség',
    description: '<pre><code>#fejlec {\n  width: 100%;\n}</code></pre>📌 A <code>width: 100%</code> azt jelenti, hogy a szülő elem teljes szélességét foglalja el – így lesz teljes szélességű fejléc banner.',
    starterHtml: S_FINAL, starterCss: Css1,
    checks: [
      { label: '#fejlec: width', explanation: '#fejlec { width: 100%; }', fn: _cssHas('#fejlec', 'width') },
    ],
    solution: S_FINAL, solutionCss: Css2,
  },
  {
    id: 21, emoji: '🅰️', title: 'CSS – Felirat stílus',
    description: '<pre><code>#felirat {\n  font-variant: small-caps;\n  font-weight: bold;\n  color: #4a2c0a;\n}</code></pre>📌 <code>font-variant: small-caps</code> = kiskapitális betűk. Vizsga-kedvenc!',
    starterHtml: S_FINAL, starterCss: Css2,
    checks: [
      { label: '#felirat: font-variant', explanation: '#felirat { font-variant: small-caps; }', fn: _cssHas('#felirat', 'font-variant') },
      { label: '#felirat: font-weight', explanation: '#felirat { font-weight: bold; }', fn: _cssHas('#felirat', 'font-weight') },
      { label: '#felirat: color', explanation: '#felirat { color: #4a2c0a; }', fn: _cssHas('#felirat', 'color') },
    ],
    solution: S_FINAL, solutionCss: Css3,
  },
  {
    id: 22, emoji: '🧭', title: 'CSS – Navigáció li',
    description: '<pre><code>nav li {\n  border-right: 3px dotted #7a4a1e;\n  padding: 0 15px;\n}</code></pre>📌 <code>border-right: 3px dotted</code> = pontozott jobb oldali szegély – elválasztó a menüpontok között.',
    starterHtml: S_FINAL, starterCss: Css3,
    checks: [
      { label: 'nav li: border-right', explanation: 'nav li { border-right: 3px dotted ...; }', fn: _cssHas('nav li', 'border-right') },
      { label: 'nav li: padding', explanation: 'nav li { padding: 0 15px; }', fn: _cssHas('nav li', 'padding') },
    ],
    solution: S_FINAL, solutionCss: Css4,
  },
  {
    id: 23, emoji: '🏷️', title: 'CSS – Alcím stílus',
    description: '<pre><code>.alcim {\n  font-size: 2.5em;\n  background-color: #fdf6ee;\n}</code></pre>📌 <code>font-size: 2.5em</code> = az aktuális betűméret 2.5-szerese. Az <code>em</code> relatív egység.',
    starterHtml: S_FINAL, starterCss: Css4,
    checks: [
      { label: '.alcim: font-size', explanation: '.alcim { font-size: 2.5em; }', fn: _cssHas('.alcim', 'font-size') },
      { label: '.alcim: background-color', explanation: '.alcim { background-color: ...; }', fn: _cssHas('.alcim', 'background-color') },
    ],
    solution: S_FINAL, solutionCss: Css5,
  },
  {
    id: 24, emoji: '🔗', title: 'CSS – Lábléc link',
    description: '<pre><code>.lablec a {\n  color: white;\n  text-decoration: none;\n}\n.lablec a:hover {\n  text-transform: uppercase;\n}</code></pre>📌 A <code>:hover</code> pszeudoelem egér fölé húzáskor lép életbe.',
    starterHtml: S_FINAL, starterCss: Css5,
    checks: [
      { label: '.lablec a: color', explanation: '.lablec a { color: white; }', fn: _cssHas('.lablec a', 'color') },
      { label: '.lablec a: text-decoration', explanation: '.lablec a { text-decoration: none; }', fn: _cssHas('.lablec a', 'text-decoration') },
      { label: '.lablec a:hover: text-transform', explanation: '.lablec a:hover { text-transform: uppercase; }', fn: _cssHas('.lablec a:hover', 'text-transform') },
    ],
    solution: S_FINAL, solutionCss: Css6,
  },
  {
    id: 25, emoji: '🏁', title: 'CSS – Lista ikon és szöveg',
    description: '🎉 Az utolsó feladat!<br><br><pre><code>#italok {\n  list-style-image: url(\'img/kaveszem.svg\');\n  margin-left: 25px;\n}\np {\n  text-align: justify;\n}</code></pre>📌 <code>list-style-image</code> = a bullet pont helyett egyedi kép. <code>text-align: justify</code> = sorkizárt szöveg.<br><br>🎉 <strong>Gratulálunk! Az Espresso Sarok Kávézó weboldal elkészült!</strong>',
    starterHtml: S_FINAL, starterCss: Css6,
    checks: [
      { label: '#italok: list-style-image', explanation: "#italok { list-style-image: url('img/...'); }", fn: _cssHas('#italok', 'list-style-image') },
      { label: '#italok: margin-left', explanation: '#italok { margin-left: 25px; }', fn: _cssHas('#italok', 'margin-left') },
      { label: 'p: text-align', explanation: 'p { text-align: justify; }', fn: _cssHas('p', 'text-align') },
    ],
    solution: S_FINAL, solutionCss: Css7,
  },
];

// ─── Feladatonkénti tananyag (segéd panel) ────────────────────────────────────
const taskTutors = {
  1: `<p>A <strong>HTML</strong> egy jelölőnyelv – megmondja a böngészőnek, hogyan épüljön fel az oldal. A <code>&lt;head&gt;</code>-ben lévő meta adatok <em>nem láthatók az oldalon</em>, de nagyon fontosak:</p><ul><li><code>charset="UTF-8"</code> – nélküle az ékezetes betűk (á, é, ő…) hibásan jelennek meg</li><li><code>viewport</code> – nélküle mobilon kicsinyített verziót lát a látogató</li><li><code>&lt;title&gt;</code> – a böngésző fülén megjelenő szöveg</li></ul><p>A <strong>Bootstrap</strong> egy CSS keretrendszer: rengeteg előre megírt stílust tartalmaz. CDN-ről töltjük be (nincs letöltés), a saját <code>style.css</code> mindig <em>Bootstrap után</em> linkelendő, hogy felülírhassa azt.</p>`,
  2: `<p>A <code>&lt;nav&gt;</code> <strong>szemantikus HTML elem</strong> – jelzi a böngészőnek és a keresőmotoroknak, hogy ez az oldal navigációs sávja. Kétféle link létezik a navigációban:</p><ul><li><strong>Belső hivatkozás:</strong> <code>href="#kaveink"</code> – az oldalon belüli <code>id="kaveink"</code> elemhez ugrik</li><li><strong>Külső hivatkozás:</strong> <code>href="https://..."</code> – másik weboldalra mutat. A <code>target="_blank"</code> gondoskodik arról, hogy új fülön nyíljon meg, így a látogató nem hagyja el az oldalunkat.</li></ul>`,
  3: `<p>Az <code>&lt;img&gt;</code> tag <strong>önzáró</strong> – nincs záró tagje. Két fontos attribútuma van:</p><ul><li><code>alt</code> – szöveges leírás: ha a kép nem tölt be, ezt jeleníti meg a böngésző; a képernyőolvasók (vakok segédeszközei) ezt olvassák fel</li><li><code>title</code> – tooltip: az egeret a kép fölé húzva jelenik meg</li></ul><p>⚠️ <strong>Vizsgán mindkettő kötelező</strong>, és értékük <em>azonos szöveg</em> legyen! Ez tipikus vizsga-csapda.</p>`,
  4: `<p>A <code>&lt;h1&gt;</code> az oldal legfontosabb főcíme – egy oldalon <strong>csak egy</strong> legyen. A Bootstrap <code>.container</code> osztályú div automatikusan középre rendezi és megfelelő szélességre korlátozza a tartalmat.</p><p>A <code>&lt;span&gt;</code> egy <em>inline elem</em> – a szöveg egy részét jelöli ki anélkül, hogy sortörést okozna. A <code>text-uppercase</code> Bootstrap osztály CSS-sel írja nagybetűssé a szöveget – nem kell hozzá külön CSS szabály.</p>`,
  5: `<p>A <code>&lt;p&gt;</code> elem egy bekezdést jelöl. A Bootstrap <code>my-3</code> osztály egységes felső és alsó margót ad:</p><ul><li><code>m</code> = margin (margó)</li><li><code>y</code> = Y-tengely (fent és lent egyszerre)</li><li><code>3</code> = 3 egységnyi méret (≈ 1rem ≈ 16px)</li></ul><p>Más Bootstrap margó osztályok: <code>mt-3</code> (csak fent), <code>mb-3</code> (csak lent), <code>mx-3</code> (bal és jobb).</p>`,
  6: `<p>Szövegformázó elemek aláhúzáshoz:</p><ul><li><code>&lt;u&gt;</code> – aláhúzott szöveg. A vizsgákon ezt kérik.</li><li><code>&lt;ins&gt;</code> – technikailag ugyanúgy aláhúz és HTML5-ben elfogadott, de vizsgákon nem szerepel.</li></ul><p>⚠️ Fontos: az aláhúzott szöveget a felhasználók összekeverhetik a linkekkel – valódi weboldalakon óvatosan használd!</p>`,
  7: `<p>A szemantikus szövegformázó elemek <em>tartalmi jelentést</em> is hordoznak (a keresők figyelnek rájuk):</p><ul><li><code>&lt;strong&gt;</code> – <strong>félkövér</strong>, fontos tartalomra. (A <code>&lt;b&gt;</code> csak vizuálisan félkövér, nincs szemantikus szerepe.)</li><li><code>&lt;em&gt;</code> – <em>dőlt</em>, hangsúlyos tartalom, idegen szavak jelölésére. (A <code>&lt;i&gt;</code> csak vizuálisan dőlt.)</li></ul><p>Vizsgákon mindig <code>&lt;strong&gt;</code> és <code>&lt;em&gt;</code> kell!</p>`,
  8: `<p>Kétféle lista létezik HTML-ben:</p><ul><li><code>&lt;ul&gt;</code> – <strong>rendezetlen lista</strong> (bullet pontok), ha a sorrend nem számít</li><li><code>&lt;ol&gt;</code> – <strong>rendezett lista</strong> (számok), ha a sorrend fontos</li></ul><p>Mindkét listában <code>&lt;li&gt;</code> elemek vannak. Az <code>id="italok"</code> azért kell, mert a CSS-ben majd <code>#italok</code> szelektor segítségével erre hivatkozunk (pl. list-style-image).</p>`,
  9: `<p>Az <code>&lt;ol&gt;</code> (ordered list) automatikusan megszámozza a listaelemeket. Lépések, receptek, utasítások esetén érdemes használni, ahol a <strong>sorrend fontos</strong>.</p><p>A fejlécelemek hierarchiája: <code>&lt;h1&gt;</code> → <code>&lt;h2&gt;</code> → <code>&lt;h3&gt;</code>. Az <code>&lt;h3&gt;</code> az egy szinttel mélyebb alcím. Ne ugorj szinteket (pl. h1-ről h3-ra)!</p>`,
  10: `<p>A HTML elemeknek adhatunk <code>class</code> attribútumot, amit a CSS-ben <strong>osztályszelektor</strong>ral célozhatunk meg:</p><ul><li><code>h2 { ... }</code> – <em>minden</em> h2-t stílusozná az oldalon</li><li><code>.alcim { ... }</code> – csak az <code>class="alcim"</code> osztályú elemeket</li></ul><p>Így pontosan azt a h2-t stílusozzuk, amelyiket szeretnénk – a többi h2-t nem érinti.</p>`,
  11: `<p>Ebben a feladatban szöveget bővítesz: 2 új bekezdést adsz az <code>.alcim</code> osztályú alcím alá. Használd az eddig megtanult formázó elemeket: <code>&lt;strong&gt;</code> (félkövér kiemelés) és <code>&lt;u&gt;</code> (aláhúzás) a bekezdések szövegében.</p>`,
  12: `<p>Az <code>&lt;img&gt;</code> minden attribútuma kötelező a vizsgán:</p><ul><li><code>src</code> – a kép elérési útja (pl. <code>img/barista.jpg</code>)</li><li><code>alt</code> – szöveges leírás (akadálymentesség)</li><li><code>title</code> – tooltip, ugyanaz a szöveg mint az alt</li></ul><p>A kép vizuálisan jobban mutat, ha Bootstrap osztályokat is kap. A következő feladatban ezt tanulod meg.</p>`,
  13: `<p>Bootstrap képközpontosítás módja (vizsgán kötelező ismerni):</p><ul><li><code>mx-auto</code> – automatikus bal és jobb margó (egyforma)</li><li><code>d-block</code> – a kép blokk elemmé válik (az mx-auto csak block elemnél működik!)</li><li><code>img-fluid</code> – reszponzív kép, nem lóg ki a szülő elemből</li></ul><p>⚠️ A vizsgákon <strong>nem</strong> <code>&lt;figure&gt;</code>/<code>&lt;figcaption&gt;</code> kell, hanem <code>&lt;p class="text-center fw-bold"&gt;</code> a képfelirathoz!</p>`,
  14: `<p>A Bootstrap <strong>rácsrendszere</strong> (grid) 12 oszlopra osztja az oldalt. Az oszlopszámok összege mindig 12 kell legyen:</p><ul><li><code>col-md-6 + col-md-6</code> = 6+6=12 → két egyforma, fele-fele oszlop</li></ul><p>Az <code>md</code> azt jelenti, hogy közepes (<em>medium</em>, ≥768px) és nagyobb képernyőn aktív az oszlopos elrendezés. Kisebb képernyőn a blokkok egymás alá kerülnek.</p>`,
  15: `<p>Az aszimmetrikus Bootstrap rács egy kis és egy nagy oszlopot kombinál:</p><ul><li><code>col-md-4 + col-md-8</code> = 4+8=12 → 1/3 kép + 2/3 szöveg</li></ul><p>A 12-es rendszer rugalmas: 3+9, 4+8, 5+7, 6+6 stb. A vizsgákon leggyakrabban <code>col-md-6+col-md-6</code> és <code>col-md-4+col-md-8</code> kombinációk szerepelnek.</p>`,
  16: `<p>A HTML táblázat elemei:</p><ul><li><code>&lt;table&gt;</code> – maga a táblázat</li><li><code>&lt;thead&gt;</code> – fejsor (vizuálisan kiemelve)</li><li><code>&lt;tbody&gt;</code> – adatsorok</li><li><code>&lt;tr&gt;</code> – egy sor (table row)</li><li><code>&lt;th&gt;</code> – fejléccella, félkövér (table header)</li><li><code>&lt;td&gt;</code> – adatcella (table data)</li></ul><p>A Bootstrap <code>table table-bordered</code> osztályok keretes, egységes stílusú táblázatot adnak.</p>`,
  17: `<p>Bootstrap táblázat kiegészítő osztályok:</p><ul><li><code>table-striped</code> – zebra-csíkos sorok (minden páros sor más háttérszínű)</li><li><code>text-uppercase</code> – nagybetűs szöveg</li><li><code>text-center</code> – vízszintesen középre igazított</li><li><code>align-middle</code> – függőlegesen középre igazított (hasznos többsoros celláknál)</li></ul>`,
  18: `<p>A <code>&lt;footer&gt;</code> <strong>szemantikus elem</strong> – jelzi, hogy ez az oldal lábléce. Általában copyright szöveget és visszaugró linket tartalmaz.</p><p>A <code>href="#leiras"</code> az oldal tetejére ugrik vissza, ahol az <code>id="leiras"</code> elem van – így a látogatónak nem kell görgetni felfelé.</p><p>A Bootstrap JS-t (<code>&lt;script src="...bootstrap...bundle..."&gt;</code>) a <code>&lt;/body&gt;</code> elé linkeljük be, hogy az interaktív Bootstrap komponensek is működjenek.</p>`,
  19: `<p>Váltunk a <strong>CSS fülre</strong> – mostantól az oldal megjelenését alakítjuk! A <code>@import</code> utasítással külső CSS fájlt tölthetünk be. A Google Fonts ingyenes betűkészlet-szolgáltatásáról töltjük be a Playfair Display fontot.</p><p>⚠️ Az <code>@import</code>-nak a CSS fájl <strong>legelső sorában</strong> kell lennie – semmi sem kerülhet előtte!</p><p>A <code>font-family</code> megadja a betűtípust. A <code>serif</code> a <em>fallback</em>: ha a Google Fonts nem tölt be, ezt használja a böngésző.</p>`,
  20: `<p>A CSS <strong>szelektorok</strong> célozzák meg a HTML elemeket:</p><ul><li><code>#fejlec</code> – ID szelektor (a <code>id="fejlec"</code> elemre vonatkozik)</li><li><code>.alcim</code> – osztályszelektor</li><li><code>body</code> – elem szelektor (minden body-ra)</li><li><code>nav li</code> – leszármazott szelektor (csak nav-on belüli li-kre)</li></ul><p><code>width: 100%</code> = a szülő elem teljes szélességét foglalja el → így lesz teljes szélességű banner a fejlécképből.</p>`,
  21: `<p>Hasznos CSS betűtípus tulajdonságok:</p><ul><li><code>font-variant: small-caps</code> – kiskapitális betűk: a kisbetűk kis méretű nagybetű alakot vesznek fel. Vizsga-kedvenc!</li><li><code>font-weight: bold</code> – félkövér betűvastagság</li><li><code>color: #4a2c0a</code> – hexadecimális színkód: # + 6 jegy (RR GG BB). A #4a2c0a sötétbarna szín.</li></ul>`,
  22: `<p>A <strong>leszármazott szelektor</strong> segítségével pontosan célozhatunk meg elemeket:</p><p><code>nav li</code> = csak a <code>&lt;nav&gt;</code>-on belüli <code>&lt;li&gt;</code> elemek (nem az összes li az oldalon).</p><ul><li><code>border-right: 3px dotted #7a4a1e</code> – 3px vastag, pontozott, barnás jobb szegély (elválasztó a menüpontok között)</li><li><code>padding: 0 15px</code> – belső margó: 0 fent/lent, 15px bal/jobb</li></ul>`,
  23: `<p>Relatív és abszolút mértékegységek CSS-ben:</p><ul><li><code>2.5em</code> – az aktuális betűméret 2.5-szerese (ha alapméret 16px → 40px). Relatív, alkalmazkodik a felhasználó beállításaihoz.</li><li><code>px</code> – rögzített pixel méret (nem alkalmazkodik)</li><li><code>rem</code> – a gyökér (html) elemhez relatív</li></ul><p><code>background-color: #fdf6ee</code> – meleg krémszínű háttér. Hexadecimális kódban az első pár RR (piros), második GG (zöld), harmadik BB (kék) komponens.</p>`,
  24: `<p>A CSS <strong>pszeudoosztályok</strong> felhasználói interakciókra reagálnak:</p><ul><li><code>:hover</code> – egér fölé húzáskor</li><li><code>:focus</code> – billentyűzettel fókuszba kerüléskor</li><li><code>:visited</code> – már meglátogatott link</li><li><code>:active</code> – kattintás pillanatában</li></ul><p><code>.lablec a:hover { text-transform: uppercase; }</code> – a lábléc linkjére húzva az egeret a szöveg nagybetűssé változik. Egyszerű de látványos effekt!</p>`,
  25: `<p><code>list-style-image</code> – a bullet pont helyett egyedi képet használ. A fájl elérési útja relatív a CSS fájlhoz képest.</p><p><code>text-align: justify</code> – sorkizárt szöveg: a sorok bal és jobb oldalon is egyenletesen igazodnak, mint egy könyvben. Az utolsó sor igazítás nélkül marad.</p><p>🎉 Ezzel az összes HTML és CSS feladat elkészült – a teljes Espresso Sarok Kávézó weboldal kész!</p>`,
};

// ─── Referencia szekciók ──────────────────────────────────────────────────────
const refSections = [
  { title: 'HTML váz', code: '<!DOCTYPE html>\n<html lang="hu">\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <title>Cím</title>\n  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css">\n  <link rel="stylesheet" href="style.css">\n</head>\n<body>\n\n</body>\n</html>' },
  { title: 'Navigáció (target="_blank")', code: '<nav>\n  <ul>\n    <li><a href="#kaveink">Kávék</a></li>\n    <li><a href="https://maps.google.com" target="_blank">Térkép</a></li>\n  </ul>\n</nav>' },
  { title: 'img#fejlec (alt + title)', code: '<img id="fejlec" src="img/banner.jpg" alt="Oldal neve" title="Oldal neve">' },
  { title: 'h1#felirat + span.text-uppercase', code: '<h1 id="felirat"><span class="text-uppercase">Első szó</span> többi szó</h1>' },
  { title: 'Bekezdés (p.my-3)', code: '<p class="my-3">Szöveg itt.</p>' },
  { title: 'Aláhúzás, félkövér, dőlt', code: '<p><u>aláhúzott</u> és <strong>félkövér</strong> és <em>dőlt</em></p>' },
  { title: 'Felsorolás ul#italok', code: '<ul id="italok">\n  <li><em>Coffea arabica</em> – Espresso</li>\n  <li><em>Coffea canephora</em> – Americano</li>\n</ul>' },
  { title: 'Számozott lista (ol)', code: '<h3>Lépések</h3>\n<ol>\n  <li>Első lépés</li>\n  <li>Második lépés</li>\n</ol>' },
  { title: 'Alcím osztállyal', code: '<h2 class="alcim">Alcím szöveg</h2>' },
  { title: 'Kép középre + felirat', code: '<img src="img/kep.jpg" alt="Leírás" title="Leírás" class="mx-auto d-block img-fluid">\n<p class="text-center fw-bold">Képfelirat</p>' },
  { title: 'Grid feles (col-md-6)', code: '<div class="row my-3">\n  <div class="col-md-6">\n    <img src="img/kep.jpg" alt="..." class="img-fluid">\n  </div>\n  <div class="col-md-6">\n    <p>Szöveg...</p>\n  </div>\n</div>' },
  { title: 'Grid aszimmetrikus (col-md-4 + col-md-8)', code: '<div class="row my-3">\n  <div class="col-md-4">\n    <img src="img/kep.jpg" alt="..." class="img-fluid mx-auto d-block">\n    <p class="text-center fw-bold">Felirat</p>\n  </div>\n  <div class="col-md-8">\n    <p>Hosszabb szöveg...</p>\n  </div>\n</div>' },
  { title: 'Bootstrap táblázat', code: '<table class="table table-bordered table-striped">\n  <thead>\n    <tr>\n      <th class="text-uppercase text-center align-middle">Fejléc 1</th>\n      <th class="text-uppercase text-center align-middle">Fejléc 2</th>\n    </tr>\n  </thead>\n  <tbody>\n    <tr><td>Adat 1</td><td>Adat 2</td></tr>\n  </tbody>\n</table>' },
  { title: 'Lábléc (footer.lablec)', code: '<footer class="lablec">\n  <a href="#leiras">Ugrás az elejére</a>\n  <p>© 2025 Oldal neve</p>\n</footer>' },
  { title: 'CSS – Google Fonts + body', code: "@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&display=swap');\n\nbody {\n  font-family: 'Playfair Display', serif;\n}" },
  { title: 'CSS – #fejlec', code: '#fejlec {\n  width: 100%;\n}' },
  { title: 'CSS – #felirat', code: '#felirat {\n  font-variant: small-caps;\n  font-weight: bold;\n  color: #4a2c0a;\n}' },
  { title: 'CSS – nav li', code: 'nav li {\n  border-right: 3px dotted #7a4a1e;\n  padding: 0 15px;\n}' },
  { title: 'CSS – .alcim', code: '.alcim {\n  font-size: 2.5em;\n  background-color: #fdf6ee;\n}' },
  { title: 'CSS – .lablec a hover', code: '.lablec a {\n  color: white;\n  text-decoration: none;\n}\n.lablec a:hover {\n  text-transform: uppercase;\n}' },
  { title: 'CSS – list-style-image + justify', code: "#italok {\n  list-style-image: url('img/kaveszem.svg');\n  margin-left: 25px;\n}\np {\n  text-align: justify;\n}" },
];
