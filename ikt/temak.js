// A Témaoldal 35 témája: [név, a táblázat oszlopai, rangsor-feladat]. A sorszám = index + 1.
// A tanulói (temaoldal.html) és a tanári oldal (beadasok.html) is ezt használja.
window.IKT_TEMAK = [
  ['Kutyafajták', 'fajta | méret | származási ország', 'a 3 legnagyobb kutyafajtát'],
  ['Macskafélék (vadon élő)', 'állat | hol él | mit eszik', 'a 3 legnagyobb macskafélét'],
  ['A Naprendszer bolygói', 'bolygó | hányadik a Naptól | van-e holdja', 'a 3 legnagyobb bolygót'],
  ['Hangszerek', 'hangszer | csoport (húros, fúvós, ütős) | milyen zenében hallható', 'a 3 legnagyobb vonós hangszert'],
  ['Gyors állatok', 'állat | legnagyobb sebessége | hol él', 'a 3 leggyorsabb szárazföldi állatot'],
  ['A világ folyói', 'folyó | kontinens | hossz', 'a világ 3 leghosszabb folyóját'],
  ['A világ tavai', 'tó | ország | édes vagy sós', 'a világ 3 legnagyobb tavát'],
  ['Szigetek', 'sziget | ország | melyik óceánban van', 'a világ 3 legnagyobb szigetét'],
  ['Pingvinek', 'pingvinfaj | hol él | magasság', 'a 3 legnagyobb pingvinfajt'],
  ['Óceánok', 'óceán | terület | egy állat, ami ott él', 'a 3 legnagyobb óceánt'],
  ['Kontinensek', 'kontinens | egy ország | egy jellemző állat', 'a 3 legnagyobb kontinenst'],
  ['Magyar városok', 'város | vármegye | egy nevezetesség', 'a 3 legnépesebb magyar várost'],
  ['Magas épületek', 'épület | város | magasság', 'a világ 3 legmagasabb épületét'],
  ['A világ hegyei', 'hegy | ország | magasság', 'a világ 3 legmagasabb hegyét'],
  ['Madarak', 'madár | színe | tud-e repülni', 'a 3 legnagyobb madarat'],
  ['Sivatagok', 'sivatag | kontinens | forró vagy hideg', 'a világ 3 legnagyobb sivatagát'],
  ['Vízesések', 'vízesés | ország | magasság', 'a világ 3 legmagasabb vízesését'],
  ['Magyar hegységek', 'hegység | legmagasabb csúcsa | magasság', 'a 3 legmagasabb magyar hegycsúcsot'],
  ['Európai országok', 'ország | főváros | pénznem', 'a 3 legnagyobb területű európai országot'],
  ['A világ országai', 'ország | kontinens | főváros', 'a világ 3 legnépesebb országát'],
  ['Holdak a Naprendszerben', 'hold | melyik bolygó holdja | átmérő', 'a Naprendszer 3 legnagyobb holdját'],
  ['Magyar tavak', 'tó | vármegye | jellemző', 'a 3 legnagyobb magyar tavat'],
  ['Európai fővárosok', 'főváros | ország | folyója', 'a 3 legnépesebb európai fővárost'],
  ['Nagyvárosok a világon', 'város | ország | kontinens', 'a világ 3 legnépesebb városát'],
  ['Magyar nemzeti parkok', 'nemzeti park | tájegység | egy védett állat vagy növény', 'a 3 legnagyobb területű magyar nemzeti parkot'],
  ['Magyar vármegyék', 'vármegye | székhely | egy nevezetesség', 'a 3 legnagyobb területű vármegyét'],
  ['Fák', 'fa | hol nő | lombhullató vagy örökzöld', 'a világ 3 legmagasabb fafaját'],
  ['Csillagok', 'csillag | csillagkép | szín', 'a 3 legfényesebb csillagot az éjszakai égen'],
  ['Az emberi csontváz', 'csont | hol van a testben | mi a feladata', 'az emberi test 3 leghosszabb csontját'],
  ['Kémiai elemek', 'elem | vegyjel | halmazállapot szobahőmérsékleten', 'a földkéreg 3 leggyakoribb elemét'],
  ['Nyári olimpiák', 'rendező város | ország | év', 'a 3 legutóbbi nyári olimpia városát'],
  ['Hidak a világon', 'híd | ország | hossz', 'a világ 3 leghosszabb hídját'],
  ['Ásványok és drágakövek', 'ásvány | szín | keménység', 'a 3 legkeményebb ásványt'],
  ['Szárazföldi emlősök', 'emlős | kontinens | mit eszik', 'a 3 legnagyobb szárazföldi emlőst'],
  ['Programozási nyelvek', 'nyelv | megalkotás éve | mire használják', 'a 3 legnépszerűbb programozási nyelvet'],
];

// Egy szövegből (a tanuló témaoldalának h1-éből vagy title-jéből) melyik téma: a sorszám, vagy null.
// Kis-nagybetű, ékezet, írásjel, zárójeles rész nem számít; ha több téma is illik, a leghosszabb nevű nyer.
window.iktTemaAzonosit = function (szoveg) {
  const n = s => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\(.*?\)/g, ' ').replace(/[^a-z0-9]+/g, ' ').trim();
  const h = n(szoveg);
  if (!h || h.length < 3) return null;
  let legjobb = null, hossz = 0;
  window.IKT_TEMAK.forEach((t, i) => {
    const nev = n(t[0]);
    const illik = h === nev || (nev.length > 4 && (` ${h} `.includes(` ${nev} `) || (h.length > 4 && ` ${nev} `.includes(` ${h} `))));
    if (illik && nev.length > hossz) { legjobb = i + 1; hossz = nev.length; }
  });
  return legjobb;
};

// A tanuló github.io-s weboldalán a témaoldal: tema.html, vagy a menüben a 4 alapoldalon kívüli oldal.
// Eredmény: { sorszam, oldal } (sorszam null, ha nem azonosítható) vagy null, ha nincs témaoldal.
window.iktGithubTema = async function (alap) {
  if (!alap) return null;
  const ALAP4 = ['index.html', 'keplink.html', 'listak.html', 'orarend.html'];
  const letolt = async u => { try { const r = await fetch(u); return r.ok ? await r.text() : null; } catch (e) { return null; } };
  const doc = t => new DOMParser().parseFromString(t, 'text/html');
  const jeloltek = ['tema.html'];
  const index = await letolt(alap + 'index.html');
  if (index) doc(index).querySelectorAll('nav a[href], a[href]').forEach(a => {
    const h = (a.getAttribute('href') || '').trim().replace(/^\.\//, '').split(/[?#]/)[0];
    if (/^[^/:]+\.html?$/i.test(h) && !ALAP4.includes(h.toLowerCase()) && !jeloltek.includes(h)) jeloltek.push(h);
  });
  for (const oldal of jeloltek) {
    const t = await letolt(alap + oldal);
    if (!t) continue;
    const d = doc(t);
    const h1 = d.querySelector('h1') ? d.querySelector('h1').textContent : '';
    const sorszam = window.iktTemaAzonosit(h1) || window.iktTemaAzonosit(d.title);
    return { sorszam, oldal };
  }
  return null;
};
