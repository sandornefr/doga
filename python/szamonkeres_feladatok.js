// Számonkérési feladatbank – 48 Python feladat
// 16 × 8 pont (if/elif/else) | 16 × 14 pont (def + for/while) | 16 × 18 pont (class + max/min + fájl)
// NEM része a feladatok.txt rendszernek – kizárólag számonkéréshez!

const szamonkeresFeladatok = {

  // ============================================================
  // 8 PONTOS FELADATOK – elágazás, bekérés, kiíratás
  // ============================================================
  p8: [
    {
      id: "S8_01",
      cim: "Osztályzat szövegesen",
      leiras: `Írj programot, amely bekér egy osztályzatot (1–5), majd kiírja szövegesen!

- 1 → "Elégtelen"
- 2 → "Elégséges"
- 3 → "Közepes"
- 4 → "Jó"
- 5 → "Jeles"`,
      minta_kimenet: `Add meg az osztályzatot (1-5): 4\nJó`,
      pontozasi_szempontok: [
        "Bekér egy egész számot int() konverzióval",
        "A bekérés szövege: 'Add meg az osztályzatot (1-5): '",
        "if-elif-else szerkezetet használ",
        "1 esetén 'Elégtelen' szöveget ír ki",
        "2 esetén 'Elégséges' szöveget ír ki",
        "3 esetén 'Közepes' szöveget ír ki",
        "4 esetén 'Jó' szöveget ír ki",
        "5 esetén 'Jeles' szöveget ír ki"
      ]
    },
    {
      id: "S8_02",
      cim: "Évszak meghatározás",
      leiras: `Írj programot, amely bekéri a hónap sorszámát (1–12), majd kiírja az évszakot!

- 12, 1, 2 → "Tél"
- 3, 4, 5 → "Tavasz"
- 6, 7, 8 → "Nyár"
- 9, 10, 11 → "Ősz"`,
      minta_kimenet: `Add meg a hónap számát (1-12): 7\nNyár`,
      pontozasi_szempontok: [
        "Bekér egy egész számot int() konverzióval",
        "A bekérés szövege: 'Add meg a hónap számát (1-12): '",
        "if-elif-else szerkezetet használ",
        "A téli hónapokra (12, 1, 2) 'Tél' szöveget ír ki",
        "A tavaszi hónapokra (3, 4, 5) 'Tavasz' szöveget ír ki",
        "A nyári hónapokra (6, 7, 8) 'Nyár' szöveget ír ki",
        "Az őszi hónapokra (9, 10, 11) 'Ősz' szöveget ír ki",
        "Legalább 3 elif ágat tartalmaz a kód"
      ]
    },
    {
      id: "S8_03",
      cim: "Mozijegy ár",
      leiras: `Írj programot, amely bekéri a néző életkorát (egész szám), majd kiírja a jegyárat!

- 14 év alatt → "Gyermekjegy: 900 Ft"
- 14–65 év → "Felnőttjegy: 2000 Ft"
- 65 év felett → "Nyugdíjasjegy: 1000 Ft"`,
      minta_kimenet: `Add meg az életkort: 10\nGyermekjegy: 900 Ft`,
      pontozasi_szempontok: [
        "Bekér egy egész számot int() konverzióval",
        "A bekérés szövege: 'Add meg az életkort: '",
        "if-elif-else szerkezetet használ",
        "14 év alatt 'Gyermekjegy: 900 Ft' szöveget ír ki",
        "14–65 év között 'Felnőttjegy: 2000 Ft' szöveget ír ki",
        "65 év felett 'Nyugdíjasjegy: 1000 Ft' szöveget ír ki",
        "Tartalmazza a 900-as értéket a kódban",
        "Tartalmazza a 2000-es értéket a kódban"
      ]
    },
    {
      id: "S8_04",
      cim: "Testhőmérséklet értékelése",
      leiras: `Írj programot, amely bekéri a testhőmérsékletet (tizedes szám, °C), majd értékeli!

- 35 fok alatt → "Hipotermia veszélye! Kérd orvos segítségét!"
- 35.0–36.9 → "Normál hőmérséklet."
- 37.0–38.0 → "Enyhe láz."
- 38 fok felett → "Magas láz! Orvoshoz kell menni!"`,
      minta_kimenet: `Add meg a testhőmérsékletet (°C): 37.5\nEnyhe láz.`,
      pontozasi_szempontok: [
        "Bekér egy tizedes számot float() konverzióval",
        "A bekérés szövege tartalmazza: 'hőmérsékletet'",
        "if-elif-else szerkezetet használ",
        "35 alatt hipotermia üzenetet ír ki",
        "35–36.9 között normál üzenetet ír ki",
        "37–38 között enyhe láz üzenetet ír ki",
        "38 felett magas láz üzenetet ír ki",
        "Legalább 3 elif ágat tartalmaz a kód"
      ]
    },
    {
      id: "S8_05",
      cim: "Benzintank állapot",
      leiras: `Írj programot, amely bekéri a benzintank töltöttségét százalékban (egész szám), majd jelzi az állapotot!

- 10% alatt → "Kritikus! Azonnal tankolj!"
- 10–25% → "Alacsony, hamarosan tankolj!"
- 26–75% → "Rendben, elég van."
- 75% felett → "Tele tank, nem kell tankolni."`,
      minta_kimenet: `Add meg a tank töltöttségét (%): 8\nKritikus! Azonnal tankolj!`,
      pontozasi_szempontok: [
        "Bekér egy egész számot int() konverzióval",
        "A bekérés szövege tartalmazza: 'töltöttségét'",
        "if-elif-else szerkezetet használ",
        "10 alatt kritikus üzenetet ír ki",
        "10–25 között alacsony üzenetet ír ki",
        "26–75 között rendben üzenetet ír ki",
        "75 felett tele tank üzenetet ír ki",
        "Tartalmaz legalább 2 elif ágat"
      ]
    },
    {
      id: "S8_06",
      cim: "Szám jellemzése",
      leiras: `Írj programot, amely bekér egy egész számot, majd megmondja, hogy pozitív, negatív, vagy nulla!

- Ha nagyobb mint 0 → "Pozitív szám."
- Ha kisebb mint 0 → "Negatív szám."
- Ha 0 → "Nulla."`,
      minta_kimenet: `Írj be egy egész számot: -5\nNegatív szám.`,
      pontozasi_szempontok: [
        "Bekér egy egész számot int() konverzióval",
        "A bekérés szövege: 'Írj be egy egész számot: '",
        "if-elif-else szerkezetet használ",
        "0-nál nagyobb esetén 'Pozitív szám.' szöveget ír ki",
        "0-nál kisebb esetén 'Negatív szám.' szöveget ír ki",
        "0 esetén 'Nulla.' szöveget ír ki",
        "A feltételek logikailag helyesek (>0, <0, ==0 vagy else)",
        "Mindhárom ágban megjelenik a helyes kimenet"
      ]
    },
    {
      id: "S8_07",
      cim: "Pontszámból jegy",
      leiras: `Írj programot, amely bekér egy pontszámot (0–100), és kiírja a megfelelő jegyet!

- 0–39 pont → "1 – Elégtelen"
- 40–54 pont → "2 – Elégséges"
- 55–69 pont → "3 – Közepes"
- 70–84 pont → "4 – Jó"
- 85–100 pont → "5 – Jeles"`,
      minta_kimenet: `Add meg a pontszámot (0-100): 72\n4 – Jó`,
      pontozasi_szempontok: [
        "Bekér egy egész számot int() konverzióval",
        "A bekérés szövege tartalmazza: 'pontszámot'",
        "if-elif-else szerkezetet használ",
        "0–39 pont esetén 1-es jegyet ír ki",
        "40–54 pont esetén 2-es jegyet ír ki",
        "55–69 pont esetén 3-as jegyet ír ki",
        "70–84 pont esetén 4-es jegyet ír ki",
        "85–100 pont esetén 5-ös jegyet ír ki"
      ]
    },
    {
      id: "S8_08",
      cim: "Internet sebesség minősítése",
      leiras: `Írj programot, amely bekéri az internet sebességét (Mbps, egész szám), majd minősíti!

- 10 Mbps alatt → "Lassú internet."
- 10–50 Mbps → "Közepes sebesség."
- 51–200 Mbps → "Gyors internet."
- 200 Mbps felett → "Nagyon gyors internet!"`,
      minta_kimenet: `Add meg az internet sebességét (Mbps): 75\nGyors internet.`,
      pontozasi_szempontok: [
        "Bekér egy egész számot int() konverzióval",
        "A bekérés szövege tartalmazza: 'sebességét'",
        "if-elif-else szerkezetet használ",
        "10 Mbps alatt lassú üzenetet ír ki",
        "10–50 között közepes üzenetet ír ki",
        "51–200 között gyors üzenetet ír ki",
        "200 felett nagyon gyors üzenetet ír ki",
        "A határértékek helyesen vannak kezelve"
      ]
    },
    {
      id: "S8_09",
      cim: "Akkumulátor állapot",
      leiras: `Írj programot, amely bekéri a mobiltelefon akkumulátorának töltöttségét (%, egész szám), majd jelzi az állapotot!

- 10% alatt → "Kritikus! Töltsd fel azonnal!"
- 10–30% → "Alacsony töltöttség."
- 31–80% → "Közepes töltöttség."
- 80% felett → "Jó töltöttség."`,
      minta_kimenet: `Add meg az akkumulátor töltöttségét (%): 25\nAlacsony töltöttség.`,
      pontozasi_szempontok: [
        "Bekér egy egész számot int() konverzióval",
        "A bekérés szövege tartalmazza: 'töltöttségét'",
        "if-elif-else szerkezetet használ",
        "10 alatt kritikus üzenetet ír ki",
        "10–30 között alacsony üzenetet ír ki",
        "31–80 között közepes üzenetet ír ki",
        "80 felett jó töltöttség üzenetet ír ki",
        "Tartalmaz legalább 2 elif ágat"
      ]
    },
    {
      id: "S8_10",
      cim: "Múzeumi belépési díj",
      leiras: `Írj programot, amely bekéri a látogató életkorát (egész szám), majd kiírja a belépési díjat!

- 6 év alatt → "Ingyenes belépés."
- 6–18 év → "Gyermekjegy: 600 Ft"
- 19–62 év → "Felnőttjegy: 1500 Ft"
- 62 év felett → "Nyugdíjasjegy: 700 Ft"`,
      minta_kimenet: `Add meg az életkort: 45\nFelnőttjegy: 1500 Ft`,
      pontozasi_szempontok: [
        "Bekér egy egész számot int() konverzióval",
        "A bekérés szövege: 'Add meg az életkort: '",
        "if-elif-else szerkezetet használ",
        "6 alatt ingyenes belépést ír ki",
        "6–18 között 600 Ft gyermekjegyet ír ki",
        "19–62 között 1500 Ft felnőttjegyet ír ki",
        "62 felett 700 Ft nyugdíjasjegyet ír ki",
        "Tartalmaz legalább 2 elif ágat"
      ]
    },
    {
      id: "S8_11",
      cim: "Pizza rendelés",
      leiras: `Írj programot, amely bekéri a pizza méretét (1, 2 vagy 3), majd kiírja az árat!

- 1 → "Kis pizza: 1500 Ft"
- 2 → "Közepes pizza: 2200 Ft"
- 3 → "Nagy pizza: 2900 Ft"
- Más szám → "Érvénytelen méret!"`,
      minta_kimenet: `Válassz méretet (1/2/3): 2\nKözepes pizza: 2200 Ft`,
      pontozasi_szempontok: [
        "Bekér egy egész számot int() konverzióval",
        "A bekérés szövege tartalmazza: 'méretet'",
        "if-elif-else szerkezetet használ",
        "1 esetén 'Kis pizza: 1500 Ft' szöveget ír ki",
        "2 esetén 'Közepes pizza: 2200 Ft' szöveget ír ki",
        "3 esetén 'Nagy pizza: 2900 Ft' szöveget ír ki",
        "Más szám esetén hibaszöveget ír ki",
        "Tartalmaz else ágat az érvénytelen értékre"
      ]
    },
    {
      id: "S8_12",
      cim: "Könyvtári tagság díja",
      leiras: `Írj programot, amely bekéri a könyvtárba belépni szándékozó életkorát (egész szám), majd kiírja az éves tagdíjat!

- 14 év alatt → "Gyermek tagság: ingyenes"
- 14–25 év → "Ifjúsági tagság: 500 Ft/év"
- 26–65 év → "Felnőtt tagság: 1200 Ft/év"
- 65 év felett → "Nyugdíjas tagság: 600 Ft/év"`,
      minta_kimenet: `Add meg az életkort: 20\nIfjúsági tagság: 500 Ft/év`,
      pontozasi_szempontok: [
        "Bekér egy egész számot int() konverzióval",
        "A bekérés szövege: 'Add meg az életkort: '",
        "if-elif-else szerkezetet használ",
        "14 alatt ingyenes gyermek tagságot ír ki",
        "14–25 között 500 Ft/év ifjúsági tagságot ír ki",
        "26–65 között 1200 Ft/év felnőtt tagságot ír ki",
        "65 felett 600 Ft/év nyugdíjas tagságot ír ki",
        "Tartalmaz legalább 2 elif ágat"
      ]
    },
    {
      id: "S8_13",
      cim: "Szállítási határidő",
      leiras: `Írj programot, amely bekéri a csomag súlyát kilogrammban (egész szám), majd megmondja a szállítási határidőt!

- 1 kg alatt → "Expressz: 1 munkanap"
- 1–5 kg → "Standard: 2 munkanap"
- 6–20 kg → "Nagy csomag: 3 munkanap"
- 20 kg felett → "Nehéz csomag: 5 munkanap"`,
      minta_kimenet: `Add meg a csomag súlyát (kg): 3\nStandard: 2 munkanap`,
      pontozasi_szempontok: [
        "Bekér egy egész számot int() konverzióval",
        "A bekérés szövege tartalmazza: 'súlyát'",
        "if-elif-else szerkezetet használ",
        "1 kg alatt expressz szállítást ír ki",
        "1–5 kg között standard szállítást ír ki",
        "6–20 kg között nagy csomag szállítást ír ki",
        "20 kg felett nehéz csomag szállítást ír ki",
        "Tartalmaz legalább 2 elif ágat"
      ]
    },
    {
      id: "S8_14",
      cim: "Napi vízfogyasztás értékelése",
      leiras: `Írj programot, amely bekéri a napi vízfogyasztást literben (tizedes szám), majd értékeli!

- 1.5 liter alatt → "Keveset iszol! Figyelj a hidratációra!"
- 1.5–2.5 liter → "Megfelelő a vízfogyasztásod."
- 2.5 liter felett → "Sokat iszol, ez jó!"`,
      minta_kimenet: `Add meg a napi vízfogyasztást (liter): 1.2\nKeveset iszol! Figyelj a hidratációra!`,
      pontozasi_szempontok: [
        "Bekér egy tizedes számot float() konverzióval",
        "A bekérés szövege tartalmazza: 'vízfogyasztást'",
        "if-elif-else szerkezetet használ",
        "1.5 alatt figyelmeztető üzenetet ír ki",
        "1.5–2.5 között megfelelő üzenetet ír ki",
        "2.5 felett dicsérő üzenetet ír ki",
        "Tartalmaz legalább 1 elif ágat",
        "A 1.5-ös és 2.5-ös határértékek helyesen kezeltek"
      ]
    },
    {
      id: "S8_15",
      cim: "Focimeccs eredménye",
      leiras: `Írj programot, amely bekéri a hazai és a vendég csapat góljait (egész számok), majd megmondja az eredményt!

- Ha a hazai csapatnak több gólja van → "Hazai győzelem!"
- Ha a vendég csapatnak több gólja van → "Vendég győzelem!"
- Ha egyenlő → "Döntetlen!"`,
      minta_kimenet: `Hazai gólok száma: 3\nVendég gólok száma: 1\nHazai győzelem!`,
      pontozasi_szempontok: [
        "Bekér két egész számot int() konverzióval",
        "A bekérések szövege tartalmazza: 'gólok száma'",
        "if-elif-else szerkezetet használ",
        "Ha hazai > vendég, 'Hazai győzelem!' szöveget ír ki",
        "Ha vendég > hazai, 'Vendég győzelem!' szöveget ír ki",
        "Ha egyenlők, 'Döntetlen!' szöveget ír ki",
        "Tartalmaz elif ágat",
        "A feltételek logikailag helyesek"
      ]
    },
    {
      id: "S8_16",
      cim: "Órabér kategória",
      leiras: `Írj programot, amely bekéri egy munkavállaló órabérét forintban (egész szám), majd kategorizálja!

- 1400 Ft alatt → "Minimálbér alatti!"
- 1400–2000 Ft → "Minimálbér körüli."
- 2001–3500 Ft → "Átlagos órabér."
- 3500 Ft felett → "Átlag feletti órabér."`,
      minta_kimenet: `Add meg az órabért (Ft): 1800\nMinimálbér körüli.`,
      pontozasi_szempontok: [
        "Bekér egy egész számot int() konverzióval",
        "A bekérés szövege tartalmazza: 'órabért'",
        "if-elif-else szerkezetet használ",
        "1400 alatt minimálbér alatti üzenetet ír ki",
        "1400–2000 között minimálbér körüli üzenetet ír ki",
        "2001–3500 között átlagos üzenetet ír ki",
        "3500 felett átlag feletti üzenetet ír ki",
        "Tartalmaz legalább 2 elif ágat"
      ]
    }
  ],

  // ============================================================
  // 14 PONTOS FELADATOK – def + for ciklus (F01-F08) és while (W01-W08)
  // ============================================================
  p14: [
    // --- FOR ciklus feladatok ---
    {
      id: "F14_01",
      cim: "Osztályzatok értékelése",
      tipus: "for",
      leiras: `Írj programot, amely 5 tanuló osztályzatát értékeli!

Írj egy "Megfelelt" nevű függvényt, amely kap egy osztályzatot (1–5)!
- Ha az osztályzat legalább 3 → adjon vissza "Megfelelt."
- Egyébként → adjon vissza "Megbukott."

A főprogramban:
- Hozz létre egy számlálót (kezdőértéke 0)!
- Készíts egy for ciklust, amely 5-ször fut le!
- Minden körben kérd be a jegyet: "{i}. tanuló jegye: "
- Hívd meg a Megfelelt függvényt és írd ki az eredményt!
- Ha megfelelt, növeld a számlálót!
- A ciklus után írd ki: "X tanuló felelt meg."`,
      minta_kimenet: `1. tanuló jegye: 4\nMegfelelt.\n2. tanuló jegye: 2\nMegbukott.\n3. tanuló jegye: 3\nMegfelelt.\n4. tanuló jegye: 1\nMegbukott.\n5. tanuló jegye: 5\nMegfelelt.\n3 tanuló felelt meg.`,
      pontozasi_szempontok: [
        "def kulcsszóval függvényt definiál",
        "A függvény neve: Megfelelt",
        "return kulcsszót használ a függvényben",
        "A függvény >= 3 esetén 'Megfelelt.' szöveget ad vissza",
        "A függvény < 3 esetén 'Megbukott.' szöveget ad vissza",
        "for ciklust használ, amely 5-ször fut le",
        "Bekéri a jegyet int() konverzióval",
        "Meghívja a Megfelelt függvényt minden körben",
        "Kiírja a függvény visszatérési értékét",
        "Számlálót vezet a megfeleltek számának",
        "A ciklus után kiírja: 'X tanuló felelt meg.'",
        "A számláló helyesen növekszik",
        "A végeredmény helyes a megadott bemenetre",
        "A kód logikailag hibátlan"
      ]
    },
    {
      id: "F14_02",
      cim: "Termékek áfával",
      tipus: "for",
      leiras: `Írj programot, amely 4 termék nettó árát dolgozza fel!

Írj egy "Afa" nevű függvényt, amely kap egy nettó árat!
- Számítsa ki a 27%-os áfával növelt bruttó árat, és adja azt vissza!
  (Képlet: brutto = netto * 1.27, kerekítve egész számra)

A főprogramban:
- Hozz létre egy összegző változót (kezdőértéke 0)!
- Készíts egy for ciklust, amely 4-szer fut le!
- Minden körben kérd be a nettó árat: "{i}. termék nettó ára (Ft): "
- Hívd meg az Afa függvényt és írd ki: "Bruttó ár: X Ft"
- Add hozzá a bruttó árat az összeghez!
- A ciklus után írd ki: "Összesen fizetendő: X Ft"`,
      minta_kimenet: `1. termék nettó ára (Ft): 1000\nBruttó ár: 1270 Ft\n2. termék nettó ára (Ft): 2000\nBruttó ár: 2540 Ft\n3. termék nettó ára (Ft): 500\nBruttó ár: 635 Ft\n4. termék nettó ára (Ft): 800\nBruttó ár: 1016 Ft\nÖsszesen fizetendő: 5461 Ft`,
      pontozasi_szempontok: [
        "def kulcsszóval függvényt definiál",
        "A függvény neve: Afa",
        "return kulcsszót használ a függvényben",
        "A függvény helyesen számítja a 27%-os áfát (szorzás 1.27-tel)",
        "for ciklust használ, amely 4-szer fut le",
        "Bekéri a nettó árat int() vagy float() konverzióval",
        "Meghívja az Afa függvényt minden körben",
        "Kiírja a bruttó árat a 'Bruttó ár: X Ft' formátumban",
        "Összegző változót vezet",
        "Helyes végösszeget számít",
        "A ciklus után kiírja az összesen fizetendőt",
        "A kód logikailag hibátlan",
        "A számítások helyesek az adott bemenetre",
        "A bruttó árak kerekítetten jelennek meg"
      ]
    },
    {
      id: "F14_03",
      cim: "Tornaórai guggoló",
      tipus: "for",
      leiras: `Írj programot, amely 4 tanuló tornaórai guggolóteljesítményét értékeli!

Írj egy "Minosit" nevű függvényt, amely kap egy guggolási darabszámot!
- 15 db felett → "Kiváló!"
- 10–14 db → "Megfelelt."
- 10 db alatt → "Nem teljesített."

A főprogramban:
- Készíts egy for ciklust, amely 4-szer fut le!
- Minden körben kérd be a guggolók számát: "{i}. tanuló guggolók száma: "
- Hívd meg a Minosit függvényt és írd ki az eredményt!
- A ciklus után írd ki: "Kész az értékelés."`,
      minta_kimenet: `1. tanuló guggolók száma: 18\nKiváló!\n2. tanuló guggolók száma: 11\nMegfelelt.\n3. tanuló guggolók száma: 7\nNem teljesített.\n4. tanuló guggolók száma: 15\nMegfelelt.\nKész az értékelés.`,
      pontozasi_szempontok: [
        "def kulcsszóval függvényt definiál",
        "A függvény neve: Minosit",
        "return kulcsszót használ a függvényben",
        "A függvény 15 felett 'Kiváló!' szöveget ad vissza",
        "A függvény 10–14 esetén 'Megfelelt.' szöveget ad vissza",
        "A függvény 10 alatt 'Nem teljesített.' szöveget ad vissza",
        "for ciklust használ, amely 4-szer fut le",
        "Bekéri a guggolók számát int() konverzióval",
        "Meghívja a Minosit függvényt minden körben",
        "Kiírja az értékelést minden tanulóhoz",
        "A ciklus után kiírja: 'Kész az értékelés.'",
        "Az if-elif-else a függvényen belül van",
        "A kód logikailag hibátlan",
        "A határértékek helyesen vannak kezelve"
      ]
    },
    {
      id: "F14_04",
      cim: "Olimpiai érmek",
      tipus: "for",
      leiras: `Írj programot, amely 4 sportoló olimpiai helyezéséhez meghatározza az érem típusát!

Írj egy "Erme" nevű függvényt, amely kap egy helyezési számot!
- 1 → "Aranyérem!"
- 2 → "Ezüstérem!"
- 3 → "Bronzérem!"
- Más → "Nincs érem."

A főprogramban:
- Hozz létre egy aranyérmek számlálóját (kezdőértéke 0)!
- Készíts egy for ciklust, amely 4-szer fut le!
- Minden körben kérd be a helyezést: "{i}. sportoló helyezése: "
- Hívd meg az Erme függvényt és írd ki az eredményt!
- Ha aranyérmet kapott, növeld a számlálót!
- A ciklus után írd ki: "X aranyérem született."`,
      minta_kimenet: `1. sportoló helyezése: 1\nAranyérem!\n2. sportoló helyezése: 3\nBronzérem!\n3. sportoló helyezése: 1\nAranyérem!\n4. sportoló helyezése: 5\nNincs érem.\n2 aranyérem született.`,
      pontozasi_szempontok: [
        "def kulcsszóval függvényt definiál",
        "A függvény neve: Erme",
        "return kulcsszót használ a függvényben",
        "A függvény 1 esetén 'Aranyérem!' szöveget ad vissza",
        "A függvény 2 esetén 'Ezüstérem!' szöveget ad vissza",
        "A függvény 3 esetén 'Bronzérem!' szöveget ad vissza",
        "A függvény más esetén 'Nincs érem.' szöveget ad vissza",
        "for ciklust használ, amely 4-szer fut le",
        "Bekéri a helyezést int() konverzióval",
        "Meghívja az Erme függvényt minden körben",
        "Aranyérmek számlálóját vezeti",
        "A ciklus után kiírja az aranyérmek számát",
        "A kód logikailag hibátlan",
        "A számláló helyesen növekszik"
      ]
    },
    {
      id: "F14_05",
      cim: "Vásárlói kedvezmény",
      tipus: "for",
      leiras: `Írj programot, amely 3 vásárló rendelésénél kiszámítja a kedvezményt!

Írj egy "Kedvezmeny" nevű függvényt, amely kap egy rendelési összeget!
- Ha az összeg legalább 5000 Ft → a kedvezmény 10% (az összeg 10%-a)
- Egyébként → a kedvezmény 0 Ft

A főprogramban:
- Készíts egy for ciklust, amely 3-szor fut le!
- Minden körben kérd be a rendelési összeget: "{i}. vásárló rendelési összege (Ft): "
- Hívd meg a Kedvezmeny függvényt!
- Írd ki: "Kedvezmény: X Ft" és "Fizetendő: Y Ft"
- A ciklus után írd ki: "Kész a feldolgozás."`,
      minta_kimenet: `1. vásárló rendelési összege (Ft): 6000\nKedvezmény: 600 Ft\nFizetendő: 5400 Ft\n2. vásárló rendelési összege (Ft): 3000\nKedvezmény: 0 Ft\nFizetendő: 3000 Ft\n3. vásárló rendelési összege (Ft): 10000\nKedvezmény: 1000 Ft\nFizetendő: 9000 Ft\nKész a feldolgozás.`,
      pontozasi_szempontok: [
        "def kulcsszóval függvényt definiál",
        "A függvény neve: Kedvezmeny",
        "return kulcsszót használ a függvényben",
        "A függvény 5000 Ft felett a 10%-os kedvezményt adja vissza",
        "A függvény 5000 Ft alatt 0-t ad vissza",
        "for ciklust használ, amely 3-szor fut le",
        "Bekéri a rendelési összeget int() konverzióval",
        "Meghívja a Kedvezmeny függvényt minden körben",
        "Kiírja a kedvezmény összegét",
        "Helyesen számítja a fizetendőt (összeg - kedvezmény)",
        "Kiírja a fizetendő összeget",
        "A ciklus után kiírja: 'Kész a feldolgozás.'",
        "A kód logikailag hibátlan",
        "A számítások helyesek az adott bemenetre"
      ]
    },
    {
      id: "F14_06",
      cim: "Napi hőmérsékletek",
      tipus: "for",
      leiras: `Írj programot, amely 5 nap hőmérsékletét elemzi!

Írj egy "Meleg" nevű függvényt, amely kap egy hőmérsékletet (egész szám)!
- Ha a hőmérséklet meghaladja a 30 fokot → adjon vissza "Kánikula!"
- Ha 20–30 fok → adjon vissza "Kellemes idő."
- Ha 20 fok alatt → adjon vissza "Hűvös."

A főprogramban:
- Hozz létre egy melegNapok számlálót (kezdőértéke 0)!
- Készíts egy for ciklust, amely 5-ször fut le!
- Minden körben kérd be a hőmérsékletet: "{i}. nap hőmérséklete (°C): "
- Hívd meg a Meleg függvényt és írd ki az eredményt!
- Ha kánikula volt, növeld a melegNapok számlálót!
- A ciklus után írd ki: "X napon volt kánikula."`,
      minta_kimenet: `1. nap hőmérséklete (°C): 35\nKánikula!\n2. nap hőmérséklete (°C): 22\nKellemes idő.\n3. nap hőmérséklete (°C): 15\nHűvös.\n4. nap hőmérséklete (°C): 32\nKánikula!\n5. nap hőmérséklete (°C): 28\nKellemes idő.\n2 napon volt kánikula.`,
      pontozasi_szempontok: [
        "def kulcsszóval függvényt definiál",
        "A függvény neve: Meleg",
        "return kulcsszót használ a függvényben",
        "A függvény 30 felett 'Kánikula!' szöveget ad vissza",
        "A függvény 20–30 esetén 'Kellemes idő.' szöveget ad vissza",
        "A függvény 20 alatt 'Hűvös.' szöveget ad vissza",
        "for ciklust használ, amely 5-ször fut le",
        "Bekéri a hőmérsékletet int() konverzióval",
        "Meghívja a Meleg függvényt minden körben",
        "Számlálót vezet a kánikula napokra",
        "A ciklus után kiírja a kánikula napok számát",
        "A kód logikailag hibátlan",
        "A határértékek helyesen kezeltek",
        "A végeredmény helyes"
      ]
    },
    {
      id: "F14_07",
      cim: "Termékek készlete",
      tipus: "for",
      leiras: `Írj programot, amely 4 termék raktárkészletét vizsgálja!

Írj egy "Keszleten" nevű függvényt, amely kap egy darabszámot!
- Ha a darabszám nagyobb mint 0 → adjon vissza "Rendelhető."
- Egyébként → adjon vissza "Elfogyott!"

A főprogramban:
- Hozz létre egy elfogyott számlálót (kezdőértéke 0)!
- Készíts egy for ciklust, amely 4-szer fut le!
- Minden körben kérd be a termék nevét: "Termék neve: " és darabszámát: "Darabszám: "
- Hívd meg a Keszleten függvényt és írd ki: "[terméknév]: [eredmény]"
- Ha elfogyott, növeld a számlálót!
- A ciklus után írd ki: "X termék fogyott el."`,
      minta_kimenet: `Termék neve: Notebook\nDarabszám: 5\nNotebook: Rendelhető.\nTermék neve: Egér\nDarabszám: 0\nEgér: Elfogyott!\nTermék neve: Monitor\nDarabszám: 2\nMonitor: Rendelhető.\nTermék neve: Billentyűzet\nDarabszám: 0\nBillentyűzet: Elfogyott!\n2 termék fogyott el.`,
      pontozasi_szempontok: [
        "def kulcsszóval függvényt definiál",
        "A függvény neve: Keszleten",
        "return kulcsszót használ a függvényben",
        "A függvény > 0 esetén 'Rendelhető.' szöveget ad vissza",
        "A függvény 0 esetén 'Elfogyott!' szöveget ad vissza",
        "for ciklust használ, amely 4-szer fut le",
        "Bekéri a termék nevét és darabszámát",
        "Meghívja a Keszleten függvényt minden körben",
        "Kiírja a termék nevét és az állapotát",
        "Számlálót vezet az elfogyott termékekre",
        "A ciklus után kiírja az elfogyott termékek számát",
        "A kód logikailag hibátlan",
        "A számláló helyesen növekszik",
        "A végeredmény helyes"
      ]
    },
    {
      id: "F14_08",
      cim: "Futóköridők",
      tipus: "for",
      leiras: `Egy futóedző 5 körös edzést értékel. A cél: minden kör 60 másodperc alatt.

Írj egy "Gyors" nevű függvényt, amely kap egy köridőt másodpercben!
- Ha az idő kisebb mint 60 → adjon vissza "Gyors kör!"
- Egyébként → adjon vissza "Lassú kör."

A főprogramban:
- Hozz létre egy gyorsKorok számlálót (kezdőértéke 0)!
- Készíts egy for ciklust, amely 5-ször fut le!
- Minden körben kérd be a köridőt: "{i}. kör ideje (másodperc): "
- Hívd meg a Gyors függvényt és írd ki az eredményt!
- Ha gyors volt, növeld a számlálót!
- A ciklus után írd ki: "X gyors kör volt."`,
      minta_kimenet: `1. kör ideje (másodperc): 55\nGyors kör!\n2. kör ideje (másodperc): 63\nLassú kör.\n3. kör ideje (másodperc): 58\nGyors kör!\n4. kör ideje (másodperc): 70\nLassú kör.\n5. kör ideje (másodperc): 52\nGyors kör!\n3 gyors kör volt.`,
      pontozasi_szempontok: [
        "def kulcsszóval függvényt definiál",
        "A függvény neve: Gyors",
        "return kulcsszót használ a függvényben",
        "A függvény < 60 esetén 'Gyors kör!' szöveget ad vissza",
        "A függvény >= 60 esetén 'Lassú kör.' szöveget ad vissza",
        "for ciklust használ, amely 5-ször fut le",
        "Bekéri a köridőt int() konverzióval",
        "Meghívja a Gyors függvényt minden körben",
        "Számlálót vezet a gyors körökhöz",
        "A ciklus után kiírja a gyors körök számát",
        "A kód logikailag hibátlan",
        "A számláló helyesen növekszik",
        "A végeredmény helyes",
        "A bekérés szövege tartalmaz sorszámot"
      ]
    },

    // --- WHILE ciklus feladatok ---
    {
      id: "W14_01",
      cim: "Számok összege",
      tipus: "while",
      leiras: `Írj programot, amely addig kér be egész számokat, amíg 0-t nem írnak be!

Írj egy "Paros" nevű függvényt, amely kap egy egész számot!
- Ha a szám páros → adjon vissza "Páros szám."
- Ha a szám páratlan → adjon vissza "Páratlan szám."

A főprogramban:
- Hozz létre egy összeg változót (kezdőértéke 0)!
- Kérd be az első számot: "Írj be egy számot (0 = vége): "
- Készíts egy while ciklust, amely addig fut, amíg a szám nem 0!
- A cikluson belül hívd meg a Paros függvényt és írd ki az eredményt, add hozzá a számot az összeghez, majd kérd be a következő számot!
- A ciklus után írd ki: "A számok összege: X"`,
      minta_kimenet: `Írj be egy számot (0 = vége): 4\nPáros szám.\nÍrj be egy számot (0 = vége): 7\nPáratlan szám.\nÍrj be egy számot (0 = vége): 2\nPáros szám.\nÍrj be egy számot (0 = vége): 0\nA számok összege: 13`,
      pontozasi_szempontok: [
        "def kulcsszóval függvényt definiál",
        "A függvény neve: Paros",
        "return kulcsszót használ a függvényben",
        "A függvény páros számra 'Páros szám.' szöveget ad vissza",
        "A függvény páratlan számra 'Páratlan szám.' szöveget ad vissza",
        "while ciklust használ",
        "A ciklus 0 beírásakor megáll",
        "Összeg változót vezet",
        "Meghívja a Paros függvényt minden körben",
        "A ciklus után kiírja az összeget",
        "Bekérés szövege: 'Írj be egy számot (0 = vége): '",
        "A kód logikailag hibátlan",
        "Az összeg helyes a megadott bemenetre",
        "0-t nem adja hozzá az összeghez"
      ]
    },
    {
      id: "W14_02",
      cim: "Bevásárlólista",
      tipus: "while",
      leiras: `Írj programot, amely bevásárlólista elemeit és árait kéri be, amíg "vége" szót nem írnak be!

Írj egy "Draga" nevű függvényt, amely kap egy árat (egész szám)!
- Ha az ár nagyobb mint 2000 → adjon vissza "Drága termék!"
- Egyébként → adjon vissza "Megfizethető."

A főprogramban:
- Hozz létre egy összeg változót (kezdőértéke 0)!
- Kérd be az első termék nevét: "Termék neve (vége = kilép): "
- Készíts egy while ciklust, amely addig fut, amíg a név nem "vége"!
- A cikluson belül kérd be az árat: "Ár (Ft): ", hívd meg a Draga függvényt, írd ki az eredményt, add az árat az összeghez, majd kérd be a következő terméknevet!
- A ciklus után írd ki: "Bevásárlás összege: X Ft"`,
      minta_kimenet: `Termék neve (vége = kilép): Tej\nÁr (Ft): 450\nMegfizethető.\nTermék neve (vége = kilép): Laptop\nÁr (Ft): 250000\nDrága termék!\nTermék neve (vége = kilép): vége\nBevásárlás összege: 250450 Ft`,
      pontozasi_szempontok: [
        "def kulcsszóval függvényt definiál",
        "A függvény neve: Draga",
        "return kulcsszót használ a függvényben",
        "A függvény > 2000 esetén 'Drága termék!' szöveget ad vissza",
        "A függvény <= 2000 esetén 'Megfizethető.' szöveget ad vissza",
        "while ciklust használ",
        "A ciklus 'vége' szóra megáll",
        "Összeg változót vezet",
        "Bekéri az árat int() konverzióval",
        "Meghívja a Draga függvényt minden körben",
        "A ciklus után kiírja a bevásárlás összegét",
        "A kód logikailag hibátlan",
        "A végösszeg helyes",
        "A 'vége' szót nem adja az összeghez"
      ]
    },
    {
      id: "W14_03",
      cim: "Tippelős számjáték",
      tipus: "while",
      leiras: `Írj egy tippelős játékot! A titkos szám legyen 7.

Írj egy "Talalt" nevű függvényt, amely kap egy tippet (egész szám)!
- Ha a tipp egyenlő 7-tel → adjon vissza True
- Egyébként → adjon vissza False

A főprogramban:
- Hozz létre egy kiserlet számlálót (kezdőértéke 0)!
- Kérd be az első tippet: "Tippelj egy számot (1-10): "
- Növeld a kísérletek számát!
- Készíts egy while ciklust, amely addig fut, amíg nem találta el!
- A cikluson belül írd ki: "Nem jó! Próbáld újra!", kérd be az újabb tippet, növeld a számlálót!
- A ciklus után írd ki: "Gratulálok! X kísérlet után megtaláltad!"`,
      minta_kimenet: `Tippelj egy számot (1-10): 3\nNem jó! Próbáld újra!\nTippelj egy számot (1-10): 9\nNem jó! Próbáld újra!\nTippelj egy számot (1-10): 7\nGratulálok! 3 kísérlet után megtaláltad!`,
      pontozasi_szempontok: [
        "def kulcsszóval függvényt definiál",
        "A függvény neve: Talalt",
        "return kulcsszót használ a függvényben",
        "A függvény tipp==7 esetén True-t ad vissza",
        "A függvény más esetén False-t ad vissza",
        "while ciklust használ",
        "A ciklus a helyes tipp esetén megáll",
        "Kísérlet számlálót vezet",
        "Bekéri a tippet int() konverzióval",
        "'Nem jó! Próbáld újra!' üzenetet ír ki rossz tippre",
        "A ciklus után gratulál és kiírja a kísérletek számát",
        "A bekérés szövege: 'Tippelj egy számot (1-10): '",
        "A kód logikailag hibátlan",
        "A számláló helyesen növekszik"
      ]
    },
    {
      id: "W14_04",
      cim: "Pontok gyűjtése",
      tipus: "while",
      leiras: `Írj programot, amely pontokat gyűjt, amíg el nem éri a 100 pontot!

Írj egy "Szint" nevű függvényt, amely kap egy pontszámot!
- 0–29 pont → "Kezdő"
- 30–59 pont → "Haladó"
- 60 pont felett → "Profi"

A főprogramban:
- Hozz létre egy osszPont változót (kezdőértéke 0)!
- Készíts egy while ciklust, amely addig fut, amíg az összpontszám kisebb mint 100!
- A cikluson belül kérd be az új pontokat: "Megszerzett pontok: ", add hozzá az összeghez!
- Hívd meg a Szint függvényt és írd ki: "Jelenlegi szint: [szint]"
- A ciklus után írd ki: "Elérted a 100 pontot! Összesen: X pont"`,
      minta_kimenet: `Megszerzett pontok: 40\nJelenlegi szint: Haladó\nMegszerzett pontok: 35\nJelenlegi szint: Profi\nMegszerzett pontok: 30\nJelenlegi szint: Profi\nElérted a 100 pontot! Összesen: 105 pont`,
      pontozasi_szempontok: [
        "def kulcsszóval függvényt definiál",
        "A függvény neve: Szint",
        "return kulcsszót használ a függvényben",
        "A függvény 0-29 esetén 'Kezdő' szöveget ad vissza",
        "A függvény 30-59 esetén 'Haladó' szöveget ad vissza",
        "A függvény 60+ esetén 'Profi' szöveget ad vissza",
        "while ciklust használ",
        "A ciklus < 100 feltétellel fut",
        "Összeg változót vezet",
        "Bekéri a pontokat int() konverzióval",
        "Meghívja a Szint függvényt minden körben",
        "Kiírja a jelenlegi szintet",
        "A ciklus után kiírja a záró üzenetet",
        "A kód logikailag hibátlan"
      ]
    },
    {
      id: "W14_05",
      cim: "Jelszó ellenőrzés",
      tipus: "while",
      leiras: `Írj programot, amely belépési jelszót ellenőriz! A helyes jelszó: "titok123". Maximum 3 kísérlet engedélyezett.

Írj egy "Helyes" nevű függvényt, amely kap egy jelszó szöveget!
- Ha a jelszó egyezik "titok123"-mal → adjon vissza True
- Egyébként → adjon vissza False

A főprogramban:
- Hozz létre egy kiserlet számlálót (kezdőértéke 0)!
- Kérd be az első jelszót: "Add meg a jelszót: "
- Növeld a számlálót!
- Készíts egy while ciklust, amely addig fut, amíg nem helyes ÉS a kísérlet kisebb mint 3!
- A cikluson belül írd ki: "Hibás jelszó!", kérd be az újabb jelszót, növeld a számlálót!
- A ciklus után: ha helyes → "Belépve!", egyébként → "Fiók zárolva!"`,
      minta_kimenet: `Add meg a jelszót: alma\nHibás jelszó!\nAdd meg a jelszót: titok\nHibás jelszó!\nAdd meg a jelszót: titok123\nBelépve!`,
      pontozasi_szempontok: [
        "def kulcsszóval függvényt definiál",
        "A függvény neve: Helyes",
        "return kulcsszót használ a függvényben",
        "A függvény helyes jelszóra True-t ad vissza",
        "A függvény helytelen jelszóra False-t ad vissza",
        "while ciklust használ",
        "A ciklus helyes jelszóra vagy 3 kísérlet után megáll",
        "Kísérlet számlálót vezet",
        "Bekéri a jelszót (input() szöveg-bekérés, nem int!)",
        "'Hibás jelszó!' üzenetet ír ki rossz jelszóra",
        "Helyes jelszóra 'Belépve!' üzenetet ír ki",
        "3 sikertelen kísérlet után 'Fiók zárolva!' üzenetet ír ki",
        "A kód logikailag hibátlan",
        "A ciklus feltétele tartalmaz AND/and operátort"
      ]
    },
    {
      id: "W14_06",
      cim: "Pénztár visszajáró",
      tipus: "while",
      leiras: `Írj programot, amely pénztári tranzakciókat kezel, amíg 0-t nem írnak be az árhoz!

Írj egy "Visszajaro" nevű függvényt, amely kap egy árat és egy fizetett összeget!
- Adja vissza a visszajáró összeget (fizetett - ár)

A főprogramban:
- Hozz létre egy tranzakciok számlálót (kezdőértéke 0)!
- Kérd be az első vásárlás árát: "Termék ára (Ft, 0 = vége): "
- Készíts egy while ciklust, amely addig fut, amíg az ár nem 0!
- A cikluson belül kérd be a fizetett összeget: "Fizetett összeg (Ft): ", hívd meg a Visszajaro függvényt, írd ki: "Visszajáró: X Ft", növeld a tranzakciók számát, majd kérd be a következő árat!
- A ciklus után írd ki: "X tranzakció lett feldolgozva."`,
      minta_kimenet: `Termék ára (Ft, 0 = vége): 350\nFizetett összeg (Ft): 500\nVissza járó: 150 Ft\nTermék ára (Ft, 0 = vége): 1200\nFizetett összeg (Ft): 2000\nVissza járó: 800 Ft\nTermék ára (Ft, 0 = vége): 0\n2 tranzakció lett feldolgozva.`,
      pontozasi_szempontok: [
        "def kulcsszóval függvényt definiál",
        "A függvény neve: Visszajaro",
        "return kulcsszót használ a függvényben",
        "A függvény helyesen számolja a visszajárót (fizetett - ár)",
        "while ciklust használ",
        "A ciklus 0 beírásakor megáll",
        "Bekéri az árat int() konverzióval",
        "Bekéri a fizetett összeget int() konverzióval",
        "Meghívja a Visszajaro függvényt",
        "Kiírja a visszajárót",
        "Tranzakció számlálót vezet",
        "A ciklus után kiírja a tranzakciók számát",
        "A kód logikailag hibátlan",
        "A számítások helyesek"
      ]
    },
    {
      id: "W14_07",
      cim: "Focicsapat gólgyűjtő",
      tipus: "while",
      leiras: `Egy focicsapat meccseit rögzíti a program, amíg -1-et nem írnak be!

Írj egy "Eredmeny" nevű függvényt, amely kap egy meccsenkénti gólszámot!
- 0 gól → adjon vissza "Nem szerzett gólt."
- 1–2 gól → adjon vissza "Gyenge teljesítmény."
- 3 gól felett → adjon vissza "Remek mérkőzés!"

A főprogramban:
- Hozz létre egy osszesgol számlálót (kezdőértéke 0)!
- Kérd be az első meccs góljait: "Meccs góljai (-1 = vége): "
- Készíts egy while ciklust, amely addig fut, amíg a gól nem -1!
- A cikluson belül hívd meg az Eredmeny függvényt, írd ki az eredményt, add a gólokat az összeshez, majd kérd be a következő értéket!
- A ciklus után írd ki: "Összes gól: X"`,
      minta_kimenet: `Meccs góljai (-1 = vége): 0\nNem szerzett gólt.\nMeccs góljai (-1 = vége): 4\nRemek mérkőzés!\nMeccs góljai (-1 = vége): 2\nGyenge teljesítmény.\nMeccs góljai (-1 = vége): -1\nÖsszes gól: 6`,
      pontozasi_szempontok: [
        "def kulcsszóval függvényt definiál",
        "A függvény neve: Eredmeny",
        "return kulcsszót használ a függvényben",
        "A függvény 0 esetén 'Nem szerzett gólt.' szöveget ad vissza",
        "A függvény 1-2 esetén 'Gyenge teljesítmény.' szöveget ad vissza",
        "A függvény 3+ esetén 'Remek mérkőzés!' szöveget ad vissza",
        "while ciklust használ",
        "A ciklus -1 értékre megáll",
        "Összeg változót vezet a góloknak",
        "Bekéri a gólokat int() konverzióval",
        "Meghívja az Eredmeny függvényt",
        "A ciklus után kiírja az összes gólt",
        "A -1-et nem adja hozzá az összeghez",
        "A kód logikailag hibátlan"
      ]
    },
    {
      id: "W14_08",
      cim: "Vizsgapontok jegyei",
      tipus: "while",
      leiras: `Írj programot, amely vizsgapontszámokat kér be, amíg -1-et nem írnak be, majd minden pontszámhoz meghatározza a jegyet!

Írj egy "Jegy" nevű függvényt, amely kap egy pontszámot (0–100)!
- 0–39 → adjon vissza 1
- 40–54 → adjon vissza 2
- 55–69 → adjon vissza 3
- 70–84 → adjon vissza 4
- 85–100 → adjon vissza 5

A főprogramban:
- Hozz létre osszJegy és darab változókat (mindkettő 0)!
- Kérd be az első pontszámot: "Pontszám (-1 = vége): "
- Készíts egy while ciklust, amely addig fut, amíg a pontszám nem -1!
- A cikluson belül hívd meg a Jegy függvényt, írd ki: "Jegy: X", add a jegyet az összeghez, növeld a darabot, majd kérd be a következő pontszámot!
- A ciklus után írd ki: "Átlag jegy: X.XX"`,
      minta_kimenet: `Pontszám (-1 = vége): 80\nJegy: 4\nPontszám (-1 = vége): 45\nJegy: 2\nPontszám (-1 = vége): 92\nJegy: 5\nPontszám (-1 = vége): -1\nÁtlag jegy: 3.67`,
      pontozasi_szempontok: [
        "def kulcsszóval függvényt definiál",
        "A függvény neve: Jegy",
        "return kulcsszót használ a függvényben",
        "A függvény helyesen határozza meg a jegyet (5 kategória)",
        "while ciklust használ",
        "A ciklus -1 értékre megáll",
        "Összeg és darab változókat vezet",
        "Bekéri a pontszámot int() konverzióval",
        "Meghívja a Jegy függvényt minden körben",
        "Kiírja a jegyet",
        "A -1-et nem veszi számításba az átlagnál",
        "Kiszámítja az átlagjegyet",
        "A ciklus után kiírja az átlagjegyet",
        "A kód logikailag hibátlan"
      ]
    }
  ],

  // ============================================================
  // 18 PONTOS FELADATOK – class + lista + max/min + fájlírás
  // ============================================================
  p18: [
    // --- MAXIMUM keresés ---
    {
      id: "M18_01",
      cim: "Autók sebessége",
      tipus: "max",
      modul_nev: "auto.py",
      modul_kod: `class Auto:
    def __init__(self, marka, max_sebesseg):
        self.marka = marka
        self.max_sebesseg = max_sebesseg`,
      leiras: `A program három autó adatait tárolja objektumokban.

a) Az Auto osztály rendelkezésre áll az auto.py fájlban. Töltsd be ezt a modult, vagy másold be az osztálydefiníciót a saját kódodba!
b) Kérd be három autó márkáját és maximális sebességét (egész szám, km/h)! Hozz létre Auto osztályú objektumokat, és tárold őket egy listában!
c) Jelenítsd meg az összes autó adatait ebben a formában: "A(z) [márka] max. sebessége: X km/h"
d) Határozd meg a leggyorsabb autót, és a márkáját írd be a "leggyorsabb.txt" fájlba: "A leggyorsabb autó: [márka]"`,
      minta_kimenet: `Add meg az autó márkáját! Toyota\nMax. sebessége (km/h)? 180\nAdd meg az autó márkáját! BMW\nMax. sebessége (km/h)? 250\nAdd meg az autó márkáját! Fiat\nMax. sebessége (km/h)? 160\nA(z) Toyota max. sebessége: 180 km/h\nA(z) BMW max. sebessége: 250 km/h\nA(z) Fiat max. sebessége: 160 km/h`,
      pontozasi_szempontok: [
        "Betölti az auto modult (import auto) vagy bemásolja az osztályt",
        "Bekéri az autó márkáját a megfelelő szöveggel",
        "Bekéri a sebességet int() konverzióval",
        "Auto objektumot hoz létre (auto.Auto(marka, sebesseg))",
        "Listát hoz létre az objektumoknak",
        "append() hívással adja a listához az objektumokat",
        "for ciklust használ az adatbekéréshez",
        "Kiírja az összes autó adatait a megfelelő formátumban",
        "Meghatározza a leggyorsabb autót (max_sebesseg alapján)",
        "Megnyitja a leggyorsabb.txt fájlt írásra",
        ".write() metódussal ír a fájlba",
        "Bezárja a fájlt (.close()) vagy with blokkot használ",
        "A fájlban szerepel a leggyorsabb autó márkája",
        "A fájlban szerepel a 'leggyorsabb' szó",
        "Helyes autót határoz meg a maximum kereséskor",
        "A kiírt adatok formátuma helyes",
        "A kód hibátlanul fut le",
        "Más bemenetre is helyes eredményt ad"
      ]
    },
    {
      id: "M18_02",
      cim: "Épületek emeleteinek száma",
      tipus: "max",
      modul_nev: "epulet.py",
      modul_kod: `class Epulet:
    def __init__(self, nev, emelet):
        self.nev = nev
        self.emelet = emelet`,
      leiras: `A program három épület adatait tárolja objektumokban.

a) Az Epulet osztály rendelkezésre áll az epulet.py fájlban. Töltsd be ezt a modult, vagy másold be az osztálydefiníciót a saját kódodba!
b) Kérd be három épület nevét és emeletszámát (egész szám)! Hozz létre Epulet osztályú objektumokat, és tárold őket egy listában!
c) Jelenítsd meg az összes épület adatait ebben a formában: "A(z) [név] épület [X] emeletes."
d) Határozd meg a legmagasabb épületet, és a nevét írd be a "legmagasabb.txt" fájlba: "A legmagasabb épület: [név]"`,
      minta_kimenet: `Add meg az épület nevét! Toronyház\nHány emeletes? 25\nAdd meg az épület nevét! Iskola\nHány emeletes? 3\nAdd meg az épület nevét! Irodaház\nHány emeletes? 12\nA(z) Toronyház épület 25 emeletes.\nA(z) Iskola épület 3 emeletes.\nA(z) Irodaház épület 12 emeletes.`,
      pontozasi_szempontok: [
        "Betölti az epulet modult vagy bemásolja az osztályt",
        "Bekéri az épület nevét a megfelelő szöveggel",
        "Bekéri az emeletszámot int() konverzióval",
        "Epulet objektumot hoz létre",
        "Listát hoz létre az objektumoknak",
        "append() hívással adja a listához az objektumokat",
        "for ciklust használ az adatbekéréshez",
        "Kiírja az összes épület adatait a megfelelő formátumban",
        "Meghatározza a legmagasabb épületet (emelet alapján)",
        "Megnyitja a legmagasabb.txt fájlt írásra",
        ".write() metódussal ír a fájlba",
        "Bezárja a fájlt",
        "A fájlban szerepel a legmagasabb épület neve",
        "A fájlban szerepel a 'legmagasabb' szó",
        "Helyes épületet határoz meg a maximum kereséskor",
        "A kiírt adatok formátuma helyes",
        "A kód hibátlanul fut le",
        "Más bemenetre is helyes eredményt ad"
      ]
    },
    {
      id: "M18_03",
      cim: "Focicsapatok góljai",
      tipus: "max",
      modul_nev: "csapat.py",
      modul_kod: `class Csapat:
    def __init__(self, nev, golok):
        self.nev = nev
        self.golok = golok`,
      leiras: `A program három focicsapat szezonbeli góljait tárolja objektumokban.

a) A Csapat osztály rendelkezésre áll a csapat.py fájlban. Töltsd be ezt a modult, vagy másold be az osztálydefiníciót a saját kódodba!
b) Kérd be három csapat nevét és a szezonban szerzett góljainak számát (egész szám)! Hozz létre Csapat osztályú objektumokat, és tárold őket egy listában!
c) Jelenítsd meg az összes csapat adatait: "A(z) [csapatnév] [X] gólt szerzett."
d) Határozd meg a legtöbb gólt szerző csapatot, és a nevét írd be a "legjobb_csapat.txt" fájlba: "A legtöbb gólt szerzett csapat: [csapatnév]"`,
      minta_kimenet: `Add meg a csapat nevét! Ferencváros\nHány gólt szerzett? 55\nAdd meg a csapat nevét! Újpest\nHány gólt szerzett? 42\nAdd meg a csapat nevét! Honvéd\nHány gólt szerzett? 38\nA(z) Ferencváros 55 gólt szerzett.\nA(z) Újpest 42 gólt szerzett.\nA(z) Honvéd 38 gólt szerzett.`,
      pontozasi_szempontok: [
        "Betölti a csapat modult vagy bemásolja az osztályt",
        "Bekéri a csapat nevét a megfelelő szöveggel",
        "Bekéri a gólok számát int() konverzióval",
        "Csapat objektumot hoz létre",
        "Listát hoz létre az objektumoknak",
        "append() hívással adja a listához az objektumokat",
        "for ciklust használ az adatbekéréshez",
        "Kiírja az összes csapat adatait a megfelelő formátumban",
        "Meghatározza a legtöbb gólt szerző csapatot",
        "Megnyitja a legjobb_csapat.txt fájlt írásra",
        ".write() metódussal ír a fájlba",
        "Bezárja a fájlt",
        "A fájlban szerepel a csapat neve",
        "A fájlban szerepel a 'legtöbb' vagy 'legjobb' szó",
        "Helyes csapatot határoz meg",
        "A kiírt adatok formátuma helyes",
        "A kód hibátlanul fut le",
        "Más bemenetre is helyes eredményt ad"
      ]
    },
    {
      id: "M18_04",
      cim: "Tanulók pontszámai",
      tipus: "max",
      modul_nev: "diak.py",
      modul_kod: `class Diak:
    def __init__(self, nev, pontszam):
        self.nev = nev
        self.pontszam = pontszam`,
      leiras: `A program három tanuló dolgozatpontszámát tárolja objektumokban.

a) A Diak osztály rendelkezésre áll a diak.py fájlban. Töltsd be ezt a modult, vagy másold be az osztálydefiníciót a saját kódodba!
b) Kérd be három tanuló nevét és pontszámát (egész szám, 0–100)! Hozz létre Diak osztályú objektumokat, és tárold őket egy listában!
c) Jelenítsd meg az összes tanuló adatait: "[Név] pontszáma: X pont"
d) Határozd meg a legjobb pontszámú tanulót, és a nevét írd be a "legjobb_diak.txt" fájlba: "[Név] a legjobb tanuló."`,
      minta_kimenet: `Add meg a tanuló nevét! Kiss Péter\nPontszáma (0-100)? 87\nAdd meg a tanuló nevét! Nagy Anna\nPontszáma (0-100)? 92\nAdd meg a tanuló nevét! Tóth Béla\nPontszáma (0-100)? 75\nKiss Péter pontszáma: 87 pont\nNagy Anna pontszáma: 92 pont\nTóth Béla pontszáma: 75 pont`,
      pontozasi_szempontok: [
        "Betölti a diak modult vagy bemásolja az osztályt",
        "Bekéri a tanuló nevét a megfelelő szöveggel",
        "Bekéri a pontszámot int() konverzióval",
        "Diak objektumot hoz létre",
        "Listát hoz létre az objektumoknak",
        "append() hívással adja a listához az objektumokat",
        "for ciklust használ az adatbekéréshez",
        "Kiírja az összes tanuló adatait a megfelelő formátumban",
        "Meghatározza a legjobb pontszámú tanulót",
        "Megnyitja a legjobb_diak.txt fájlt írásra",
        ".write() metódussal ír a fájlba",
        "Bezárja a fájlt",
        "A fájlban szerepel a tanuló neve",
        "A fájlban szerepel a 'legjobb' szó",
        "Helyes tanulót határoz meg",
        "A kiírt adatok formátuma helyes",
        "A kód hibátlanul fut le",
        "Más bemenetre is helyes eredményt ad"
      ]
    },
    {
      id: "M18_05",
      cim: "Ételek kalóriatartalma",
      tipus: "max",
      modul_nev: "etel.py",
      modul_kod: `class Etel:
    def __init__(self, nev, kaloria):
        self.nev = nev
        self.kaloria = kaloria`,
      leiras: `A program három étel kalóriatartalmát tárolja objektumokban.

a) Az Etel osztály rendelkezésre áll az etel.py fájlban. Töltsd be ezt a modult, vagy másold be az osztálydefiníciót a saját kódodba!
b) Kérd be három étel nevét és kalóriatartalmát (egész szám, kcal)! Hozz létre Etel osztályú objektumokat, és tárold őket egy listában!
c) Jelenítsd meg az összes étel adatait: "A(z) [étel neve] [X] kcal."
d) Határozd meg a legkalóriásabb ételt, és a nevét írd be a "legkaloriasabb.txt" fájlba: "A legkalóriásabb étel: [étel neve]"`,
      minta_kimenet: `Add meg az étel nevét! Pizza\nKalóriatartalma (kcal)? 800\nAdd meg az étel nevét! Saláta\nKalóriatartalma (kcal)? 150\nAdd meg az étel nevét! Hamburger\nKalóriatartalma (kcal)? 650\nA(z) Pizza 800 kcal.\nA(z) Saláta 150 kcal.\nA(z) Hamburger 650 kcal.`,
      pontozasi_szempontok: [
        "Betölti az etel modult vagy bemásolja az osztályt",
        "Bekéri az étel nevét a megfelelő szöveggel",
        "Bekéri a kalóriát int() konverzióval",
        "Etel objektumot hoz létre",
        "Listát hoz létre az objektumoknak",
        "append() hívással adja a listához az objektumokat",
        "for ciklust használ az adatbekéréshez",
        "Kiírja az összes étel adatait a megfelelő formátumban",
        "Meghatározza a legkalóriásabb ételt",
        "Megnyitja a legkaloriasabb.txt fájlt írásra",
        ".write() metódussal ír a fájlba",
        "Bezárja a fájlt",
        "A fájlban szerepel az étel neve",
        "A fájlban szerepel a 'legkalóriásabb' vagy 'legkaloriasabb' szó",
        "Helyes ételt határoz meg",
        "A kiírt adatok formátuma helyes",
        "A kód hibátlanul fut le",
        "Más bemenetre is helyes eredményt ad"
      ]
    },
    {
      id: "M18_06",
      cim: "Termékek ára",
      tipus: "max",
      modul_nev: "termek.py",
      modul_kod: `class Termek:
    def __init__(self, nev, ar):
        self.nev = nev
        self.ar = ar`,
      leiras: `A program három termék adatait tárolja objektumokban.

a) A Termek osztály rendelkezésre áll a termek.py fájlban. Töltsd be ezt a modult, vagy másold be az osztálydefiníciót a saját kódodba!
b) Kérd be három termék nevét és árát (egész szám, Ft)! Hozz létre Termek osztályú objektumokat, és tárold őket egy listában!
c) Jelenítsd meg az összes termék adatait: "A(z) [terméknév] ára: X Ft"
d) Határozd meg a legdrágább terméket, és a nevét írd be a "legdragabb.txt" fájlba: "A legdrágább termék: [terméknév]"`,
      minta_kimenet: `Add meg a termék nevét! Laptop\nÁra (Ft)? 450000\nAdd meg a termék nevét! Egér\nÁra (Ft)? 8000\nAdd meg a termék nevét! Monitor\nÁra (Ft)? 120000\nA(z) Laptop ára: 450000 Ft\nA(z) Egér ára: 8000 Ft\nA(z) Monitor ára: 120000 Ft`,
      pontozasi_szempontok: [
        "Betölti a termek modult vagy bemásolja az osztályt",
        "Bekéri a termék nevét a megfelelő szöveggel",
        "Bekéri az árat int() konverzióval",
        "Termek objektumot hoz létre",
        "Listát hoz létre az objektumoknak",
        "append() hívással adja a listához az objektumokat",
        "for ciklust használ az adatbekéréshez",
        "Kiírja az összes termék adatait a megfelelő formátumban",
        "Meghatározza a legdrágább terméket",
        "Megnyitja a legdragabb.txt fájlt írásra",
        ".write() metódussal ír a fájlba",
        "Bezárja a fájlt",
        "A fájlban szerepel a termék neve",
        "A fájlban szerepel a 'legdrágább' vagy 'legdragabb' szó",
        "Helyes terméket határoz meg",
        "A kiírt adatok formátuma helyes",
        "A kód hibátlanul fut le",
        "Más bemenetre is helyes eredményt ad"
      ]
    },
    {
      id: "M18_07",
      cim: "Városok népessége",
      tipus: "max",
      modul_nev: "varos.py",
      modul_kod: `class Varos:
    def __init__(self, nev, nepesseg):
        self.nev = nev
        self.nepesseg = nepesseg`,
      leiras: `A program három város népességét tárolja objektumokban.

a) A Varos osztály rendelkezésre áll a varos.py fájlban. Töltsd be ezt a modult, vagy másold be az osztálydefiníciót a saját kódodba!
b) Kérd be három város nevét és népességét (egész szám, fő)! Hozz létre Varos osztályú objektumokat, és tárold őket egy listában!
c) Jelenítsd meg az összes város adatait: "[Városnév] népessége: X fő"
d) Határozd meg a legnépesebb várost, és a nevét írd be a "legnepesebb.txt" fájlba: "A legnépesebb város: [városnév]"`,
      minta_kimenet: `Add meg a város nevét! Budapest\nNépessége (fő)? 1700000\nAdd meg a város nevét! Debrecen\nNépessége (fő)? 200000\nAdd meg a város nevét! Pécs\nNépessége (fő)? 145000\nBudapest népessége: 1700000 fő\nDebrecen népessége: 200000 fő\nPécs népessége: 145000 fő`,
      pontozasi_szempontok: [
        "Betölti a varos modult vagy bemásolja az osztályt",
        "Bekéri a város nevét a megfelelő szöveggel",
        "Bekéri a népességet int() konverzióval",
        "Varos objektumot hoz létre",
        "Listát hoz létre az objektumoknak",
        "append() hívással adja a listához az objektumokat",
        "for ciklust használ az adatbekéréshez",
        "Kiírja az összes város adatait a megfelelő formátumban",
        "Meghatározza a legnépesebb várost",
        "Megnyitja a legnepesebb.txt fájlt írásra",
        ".write() metódussal ír a fájlba",
        "Bezárja a fájlt",
        "A fájlban szerepel a város neve",
        "A fájlban szerepel a 'legnépesebb' vagy 'legnepesebb' szó",
        "Helyes várost határoz meg",
        "A kiírt adatok formátuma helyes",
        "A kód hibátlanul fut le",
        "Más bemenetre is helyes eredményt ad"
      ]
    },
    {
      id: "M18_08",
      cim: "Hegyek magassága",
      tipus: "max",
      modul_nev: "hegy.py",
      modul_kod: `class Hegy:
    def __init__(self, nev, magassag):
        self.nev = nev
        self.magassag = magassag`,
      leiras: `A program három hegy adatait tárolja objektumokban.

a) A Hegy osztály rendelkezésre áll a hegy.py fájlban. Töltsd be ezt a modult, vagy másold be az osztálydefiníciót a saját kódodba!
b) Kérd be három hegy nevét és magasságát méterben (egész szám)! Hozz létre Hegy osztályú objektumokat, és tárold őket egy listában!
c) Jelenítsd meg az összes hegy adatait: "A(z) [hegyNév] [X] méter magas."
d) Határozd meg a legmagasabb hegyet, és a nevét írd be a "legmagasabb_hegy.txt" fájlba: "A legmagasabb hegy: [hegyNév]"`,
      minta_kimenet: `Add meg a hegy nevét! Mátra\nMagassága (m)? 1015\nAdd meg a hegy nevét! Kékes\nMagassága (m)? 1014\nAdd meg a hegy nevét! Dobogókő\nMagassága (m)? 700\nA(z) Mátra 1015 méter magas.\nA(z) Kékes 1014 méter magas.\nA(z) Dobogókő 700 méter magas.`,
      pontozasi_szempontok: [
        "Betölti a hegy modult vagy bemásolja az osztályt",
        "Bekéri a hegy nevét a megfelelő szöveggel",
        "Bekéri a magasságot int() konverzióval",
        "Hegy objektumot hoz létre",
        "Listát hoz létre az objektumoknak",
        "append() hívással adja a listához az objektumokat",
        "for ciklust használ az adatbekéréshez",
        "Kiírja az összes hegy adatait a megfelelő formátumban",
        "Meghatározza a legmagasabb hegyet",
        "Megnyitja a legmagasabb_hegy.txt fájlt írásra",
        ".write() metódussal ír a fájlba",
        "Bezárja a fájlt",
        "A fájlban szerepel a hegy neve",
        "A fájlban szerepel a 'legmagasabb' szó",
        "Helyes hegyet határoz meg",
        "A kiírt adatok formátuma helyes",
        "A kód hibátlanul fut le",
        "Más bemenetre is helyes eredményt ad"
      ]
    },

    // --- MINIMUM keresés ---
    {
      id: "N18_01",
      cim: "Autók üzemanyag-fogyasztása",
      tipus: "min",
      modul_nev: "auto.py",
      modul_kod: `class Auto:
    def __init__(self, marka, fogyasztas):
        self.marka = marka
        self.fogyasztas = fogyasztas`,
      leiras: `A program három autó üzemanyag-fogyasztását tárolja objektumokban.

a) Az Auto osztály rendelkezésre áll az auto.py fájlban. Töltsd be ezt a modult, vagy másold be az osztálydefiníciót a saját kódodba!
b) Kérd be három autó márkáját és fogyasztását (tizedes szám, l/100km)! Hozz létre Auto osztályú objektumokat, és tárold őket egy listában!
c) Jelenítsd meg az összes autó adatait: "A(z) [márka] fogyasztása: X l/100km"
d) Határozd meg a leggazdaságosabb autót (legkisebb fogyasztás!), és a márkáját írd be a "leggazdasagosabb.txt" fájlba: "A leggazdaságosabb autó: [márka]"`,
      minta_kimenet: `Add meg az autó márkáját! Toyota\nFogyasztása (l/100km)? 5.2\nAdd meg az autó márkáját! BMW\nFogyasztása (l/100km)? 8.5\nAdd meg az autó márkáját! Dacia\nFogyasztása (l/100km)? 6.1\nA(z) Toyota fogyasztása: 5.2 l/100km\nA(z) BMW fogyasztása: 8.5 l/100km\nA(z) Dacia fogyasztása: 6.1 l/100km`,
      pontozasi_szempontok: [
        "Betölti az auto modult vagy bemásolja az osztályt",
        "Bekéri az autó márkáját a megfelelő szöveggel",
        "Bekéri a fogyasztást float() konverzióval",
        "Auto objektumot hoz létre",
        "Listát hoz létre az objektumoknak",
        "append() hívással adja a listához az objektumokat",
        "for ciklust használ az adatbekéréshez",
        "Kiírja az összes autó adatait a megfelelő formátumban",
        "Meghatározza a legkisebb fogyasztású autót (minimum keresés!)",
        "Megnyitja a leggazdasagosabb.txt fájlt írásra",
        ".write() metódussal ír a fájlba",
        "Bezárja a fájlt",
        "A fájlban szerepel az autó márkája",
        "A fájlban szerepel a 'leggazdaságosabb' szó",
        "Helyes autót határoz meg (MINIMUM, nem maximum!)",
        "A kiírt adatok formátuma helyes",
        "A kód hibátlanul fut le",
        "Más bemenetre is helyes eredményt ad"
      ]
    },
    {
      id: "N18_02",
      cim: "Termékek legolcsóbbja",
      tipus: "min",
      modul_nev: "termek.py",
      modul_kod: `class Termek:
    def __init__(self, nev, ar):
        self.nev = nev
        self.ar = ar`,
      leiras: `A program három termék adatait tárolja objektumokban.

a) A Termek osztály rendelkezésre áll a termek.py fájlban. Töltsd be ezt a modult, vagy másold be az osztálydefiníciót a saját kódodba!
b) Kérd be három termék nevét és árát (egész szám, Ft)! Hozz létre Termek osztályú objektumokat, és tárold őket egy listában!
c) Jelenítsd meg az összes termék adatait: "A(z) [terméknév] ára: X Ft"
d) Határozd meg a legolcsóbb terméket, és a nevét írd be a "legolcsobb.txt" fájlba: "A legolcsóbb termék: [terméknév]"`,
      minta_kimenet: `Add meg a termék nevét! Toll\nÁra (Ft)? 200\nAdd meg a termék nevét! Füzet\nÁra (Ft)? 350\nAdd meg a termék nevét! Radír\nÁra (Ft)? 150\nA(z) Toll ára: 200 Ft\nA(z) Füzet ára: 350 Ft\nA(z) Radír ára: 150 Ft`,
      pontozasi_szempontok: [
        "Betölti a termek modult vagy bemásolja az osztályt",
        "Bekéri a termék nevét a megfelelő szöveggel",
        "Bekéri az árat int() konverzióval",
        "Termek objektumot hoz létre",
        "Listát hoz létre az objektumoknak",
        "append() hívással adja a listához az objektumokat",
        "for ciklust használ az adatbekéréshez",
        "Kiírja az összes termék adatait a megfelelő formátumban",
        "Meghatározza a legolcsóbb terméket (minimum keresés!)",
        "Megnyitja a legolcsobb.txt fájlt írásra",
        ".write() metódussal ír a fájlba",
        "Bezárja a fájlt",
        "A fájlban szerepel a termék neve",
        "A fájlban szerepel a 'legolcsóbb' vagy 'legolcsobb' szó",
        "Helyes terméket határoz meg (MINIMUM, nem maximum!)",
        "A kiírt adatok formátuma helyes",
        "A kód hibátlanul fut le",
        "Más bemenetre is helyes eredményt ad"
      ]
    },
    {
      id: "N18_03",
      cim: "Tanulók leggyengébb jegye",
      tipus: "min",
      modul_nev: "tanulo.py",
      modul_kod: `class Tanulo:
    def __init__(self, nev, jegy):
        self.nev = nev
        self.jegy = jegy`,
      leiras: `A program három tanuló osztályzatát tárolja objektumokban.

a) A Tanulo osztály rendelkezésre áll a tanulo.py fájlban. Töltsd be ezt a modult, vagy másold be az osztálydefiníciót a saját kódodba!
b) Kérd be három tanuló nevét és osztályzatát (egész szám, 1–5)! Hozz létre Tanulo osztályú objektumokat, és tárold őket egy listában!
c) Jelenítsd meg az összes tanuló adatait: "[Tanuló neve] jegye: X"
d) Határozd meg a leggyengébb jegyű tanulót (legkisebb szám!), és a nevét írd be a "leggyengebb.txt" fájlba: "[Tanuló neve] kapta a leggyengébb jegyet."`,
      minta_kimenet: `Add meg a tanuló nevét! Kiss Réka\nJegye (1-5)? 4\nAdd meg a tanuló nevét! Nagy Dávid\nJegye (1-5)? 2\nAdd meg a tanuló nevét! Pap Lili\nJegye (1-5)? 5\nKiss Réka jegye: 4\nNagy Dávid jegye: 2\nPap Lili jegye: 5`,
      pontozasi_szempontok: [
        "Betölti a tanulo modult vagy bemásolja az osztályt",
        "Bekéri a tanuló nevét a megfelelő szöveggel",
        "Bekéri az osztályzatot int() konverzióval",
        "Tanulo objektumot hoz létre",
        "Listát hoz létre az objektumoknak",
        "append() hívással adja a listához az objektumokat",
        "for ciklust használ az adatbekéréshez",
        "Kiírja az összes tanuló adatait a megfelelő formátumban",
        "Meghatározza a leggyengébb jegyű tanulót (minimum keresés!)",
        "Megnyitja a leggyengebb.txt fájlt írásra",
        ".write() metódussal ír a fájlba",
        "Bezárja a fájlt",
        "A fájlban szerepel a tanuló neve",
        "A fájlban szerepel a 'leggyengébb' szó",
        "Helyes tanulót határoz meg (MINIMUM, nem maximum!)",
        "A kiírt adatok formátuma helyes",
        "A kód hibátlanul fut le",
        "Más bemenetre is helyes eredményt ad"
      ]
    },
    {
      id: "N18_04",
      cim: "Boltok távolsága",
      tipus: "min",
      modul_nev: "bolt.py",
      modul_kod: `class Bolt:
    def __init__(self, nev, tavolsag):
        self.nev = nev
        self.tavolsag = tavolsag`,
      leiras: `A program három közeli bolt adatait tárolja objektumokban.

a) A Bolt osztály rendelkezésre áll a bolt.py fájlban. Töltsd be ezt a modult, vagy másold be az osztálydefiníciót a saját kódodba!
b) Kérd be három bolt nevét és távolságát méterben (egész szám)! Hozz létre Bolt osztályú objektumokat, és tárold őket egy listában!
c) Jelenítsd meg az összes bolt adatait: "A(z) [boltnév] [X] méterre van."
d) Határozd meg a legközelebb lévő boltot, és a nevét írd be a "legkozelebbi.txt" fájlba: "A legközelebbi bolt: [boltnév]"`,
      minta_kimenet: `Add meg a bolt nevét! Lidl\nTávolsága (m)? 350\nAdd meg a bolt nevét! Aldi\nTávolsága (m)? 800\nAdd meg a bolt nevét! Spar\nTávolsága (m)? 200\nA(z) Lidl 350 méterre van.\nA(z) Aldi 800 méterre van.\nA(z) Spar 200 méterre van.`,
      pontozasi_szempontok: [
        "Betölti a bolt modult vagy bemásolja az osztályt",
        "Bekéri a bolt nevét a megfelelő szöveggel",
        "Bekéri a távolságot int() konverzióval",
        "Bolt objektumot hoz létre",
        "Listát hoz létre az objektumoknak",
        "append() hívással adja a listához az objektumokat",
        "for ciklust használ az adatbekéréshez",
        "Kiírja az összes bolt adatait a megfelelő formátumban",
        "Meghatározza a legközelebbi boltot (minimum keresés!)",
        "Megnyitja a legkozelebbi.txt fájlt írásra",
        ".write() metódussal ír a fájlba",
        "Bezárja a fájlt",
        "A fájlban szerepel a bolt neve",
        "A fájlban szerepel a 'legközelebbi' szó",
        "Helyes boltot határoz meg (MINIMUM, nem maximum!)",
        "A kiírt adatok formátuma helyes",
        "A kód hibátlanul fut le",
        "Más bemenetre is helyes eredményt ad"
      ]
    },
    {
      id: "N18_05",
      cim: "Ételek legegészségesebbje",
      tipus: "min",
      modul_nev: "etel.py",
      modul_kod: `class Etel:
    def __init__(self, nev, kaloria):
        self.nev = nev
        self.kaloria = kaloria`,
      leiras: `A program három étel kalóriatartalmát tárolja objektumokban.

a) Az Etel osztály rendelkezésre áll az etel.py fájlban. Töltsd be ezt a modult, vagy másold be az osztálydefiníciót a saját kódodba!
b) Kérd be három étel nevét és kalóriatartalmát (egész szám, kcal)! Hozz létre Etel osztályú objektumokat, és tárold őket egy listában!
c) Jelenítsd meg az összes étel adatait: "A(z) [étel neve] [X] kcal."
d) Határozd meg a legkevesebb kalóriájú ételt, és a nevét írd be a "legegeszsegesebb.txt" fájlba: "A legegészségesebb étel: [étel neve]"`,
      minta_kimenet: `Add meg az étel nevét! Gyros\nKalóriatartalma (kcal)? 720\nAdd meg az étel nevét! Saláta\nKalóriatartalma (kcal)? 120\nAdd meg az étel nevét! Rántott hús\nKalóriatartalma (kcal)? 550\nA(z) Gyros 720 kcal.\nA(z) Saláta 120 kcal.\nA(z) Rántott hús 550 kcal.`,
      pontozasi_szempontok: [
        "Betölti az etel modult vagy bemásolja az osztályt",
        "Bekéri az étel nevét a megfelelő szöveggel",
        "Bekéri a kalóriát int() konverzióval",
        "Etel objektumot hoz létre",
        "Listát hoz létre az objektumoknak",
        "append() hívással adja a listához az objektumokat",
        "for ciklust használ az adatbekéréshez",
        "Kiírja az összes étel adatait a megfelelő formátumban",
        "Meghatározza a legkevesebb kalóriájú ételt (minimum keresés!)",
        "Megnyitja a legegeszsegesebb.txt fájlt írásra",
        ".write() metódussal ír a fájlba",
        "Bezárja a fájlt",
        "A fájlban szerepel az étel neve",
        "A fájlban szerepel a 'legegészségesebb' szó",
        "Helyes ételt határoz meg (MINIMUM, nem maximum!)",
        "A kiírt adatok formátuma helyes",
        "A kód hibátlanul fut le",
        "Más bemenetre is helyes eredményt ad"
      ]
    },
    {
      id: "N18_06",
      cim: "Filmek hossza",
      tipus: "min",
      modul_nev: "film.py",
      modul_kod: `class Film:
    def __init__(self, cim, perc):
        self.cim = cim
        self.perc = perc`,
      leiras: `A program három film hosszát tárolja objektumokban.

a) A Film osztály rendelkezésre áll a film.py fájlban. Töltsd be ezt a modult, vagy másold be az osztálydefiníciót a saját kódodba!
b) Kérd be három film címét és hosszát percben (egész szám)! Hozz létre Film osztályú objektumokat, és tárold őket egy listában!
c) Jelenítsd meg az összes film adatait: "A(z) [filmcím] [X] perces."
d) Határozd meg a legrövidebb filmet, és a címét írd be a "legroevidebb.txt" fájlba: "A legrövidebb film: [filmcím]"`,
      minta_kimenet: `Add meg a film címét! Avatar\nHosszúsága (perc)? 162\nAdd meg a film címét! Mátrix\nHosszúsága (perc)? 136\nAdd meg a film címét! Kung Fu Panda\nHosszúsága (perc)? 92\nA(z) Avatar 162 perces.\nA(z) Mátrix 136 perces.\nA(z) Kung Fu Panda 92 perces.`,
      pontozasi_szempontok: [
        "Betölti a film modult vagy bemásolja az osztályt",
        "Bekéri a film címét a megfelelő szöveggel",
        "Bekéri a hosszt int() konverzióval",
        "Film objektumot hoz létre",
        "Listát hoz létre az objektumoknak",
        "append() hívással adja a listához az objektumokat",
        "for ciklust használ az adatbekéréshez",
        "Kiírja az összes film adatait a megfelelő formátumban",
        "Meghatározza a legrövidebb filmet (minimum keresés!)",
        "Megnyitja a legroevidebb.txt fájlt írásra",
        ".write() metódussal ír a fájlba",
        "Bezárja a fájlt",
        "A fájlban szerepel a film címe",
        "A fájlban szerepel a 'legrövidebb' szó",
        "Helyes filmet határoz meg (MINIMUM, nem maximum!)",
        "A kiírt adatok formátuma helyes",
        "A kód hibátlanul fut le",
        "Más bemenetre is helyes eredményt ad"
      ]
    },
    {
      id: "N18_07",
      cim: "Futók versenyen",
      tipus: "min",
      modul_nev: "futo.py",
      modul_kod: `class Futo:
    def __init__(self, nev, ido):
        self.nev = nev
        self.ido = ido`,
      leiras: `A program három futóversenyző eredményét tárolja objektumokban.

a) A Futo osztály rendelkezésre áll a futo.py fájlban. Töltsd be ezt a modult, vagy másold be az osztálydefiníciót a saját kódodba!
b) Kérd be három futó nevét és befutási idejét másodpercben (egész szám)! Hozz létre Futo osztályú objektumokat, és tárold őket egy listában!
c) Jelenítsd meg az összes futó adatait: "A(z) [Név] ideje: X mp"
d) Határozd meg a leggyorsabb futót (legkisebb idő!), és a nevét írd be a "gyoztes_futo.txt" fájlba: "[Név] a verseny győztese."`,
      minta_kimenet: `Add meg a futó nevét! Kovács Bence\nIdeje (mp)? 312\nAdd meg a futó nevét! Szabó Péter\nIdeje (mp)? 287\nAdd meg a futó nevét! Horváth Ádám\nIdeje (mp)? 330\nA(z) Kovács Bence ideje: 312 mp\nA(z) Szabó Péter ideje: 287 mp\nA(z) Horváth Ádám ideje: 330 mp`,
      pontozasi_szempontok: [
        "Betölti a futo modult vagy bemásolja az osztályt",
        "Bekéri a futó nevét a megfelelő szöveggel",
        "Bekéri az időt int() konverzióval",
        "Futo objektumot hoz létre",
        "Listát hoz létre az objektumoknak",
        "append() hívással adja a listához az objektumokat",
        "for ciklust használ az adatbekéréshez",
        "Kiírja az összes futó adatait a megfelelő formátumban",
        "Meghatározza a leggyorsabb futót (minimum keresés!)",
        "Megnyitja a gyoztes_futo.txt fájlt írásra",
        ".write() metódussal ír a fájlba",
        "Bezárja a fájlt",
        "A fájlban szerepel a futó neve",
        "A fájlban szerepel a 'győztes' szó",
        "Helyes futót határoz meg (MINIMUM, nem maximum!)",
        "A kiírt adatok formátuma helyes",
        "A kód hibátlanul fut le",
        "Más bemenetre is helyes eredményt ad"
      ]
    },
    {
      id: "N18_08",
      cim: "Vizsgák legkevesebb pontja",
      tipus: "min",
      modul_nev: "vizsga.py",
      modul_kod: `class Vizsga:
    def __init__(self, nev, pont):
        self.nev = nev
        self.pont = pont`,
      leiras: `A program három diák vizsgapontszámát tárolja objektumokban.

a) A Vizsga osztály rendelkezésre áll a vizsga.py fájlban. Töltsd be ezt a modult, vagy másold be az osztálydefiníciót a saját kódodba!
b) Kérd be három diák nevét és vizsgapontszámát (egész szám, 0–100)! Hozz létre Vizsga osztályú objektumokat, és tárold őket egy listában!
c) Jelenítsd meg az összes diák adatait: "[Név] pontszáma: X pont"
d) Határozd meg a legkevesebb pontot szerzett diákot, és a nevét írd be a "legkevesebb_pont.txt" fájlba: "[Név] szerezte a legkevesebb pontot."`,
      minta_kimenet: `Add meg a diák nevét! Fekete Zsolt\nPontszáma (0-100)? 45\nAdd meg a diák nevét! Fehér Nóra\nPontszáma (0-100)? 78\nAdd meg a diák nevét! Szürke Ábel\nPontszáma (0-100)? 33\nFekete Zsolt pontszáma: 45 pont\nFehér Nóra pontszáma: 78 pont\nSzürke Ábel pontszáma: 33 pont`,
      pontozasi_szempontok: [
        "Betölti a vizsga modult vagy bemásolja az osztályt",
        "Bekéri a diák nevét a megfelelő szöveggel",
        "Bekéri a pontszámot int() konverzióval",
        "Vizsga objektumot hoz létre",
        "Listát hoz létre az objektumoknak",
        "append() hívással adja a listához az objektumokat",
        "for ciklust használ az adatbekéréshez",
        "Kiírja az összes diák adatait a megfelelő formátumban",
        "Meghatározza a legkevesebb pontot szerzett diákot (minimum!)",
        "Megnyitja a legkevesebb_pont.txt fájlt írásra",
        ".write() metódussal ír a fájlba",
        "Bezárja a fájlt",
        "A fájlban szerepel a diák neve",
        "A fájlban szerepel a 'legkevesebb' szó",
        "Helyes diákot határoz meg (MINIMUM, nem maximum!)",
        "A kiírt adatok formátuma helyes",
        "A kód hibátlanul fut le",
        "Más bemenetre is helyes eredményt ad"
      ]
    }
  ]
};

// Segédfüggvény: random kiosztás 16 tanulóra (1×8p + 1×14p + 1×18p)
function szamonkeresKioszt(tanulok) {
  const p8 = [...szamonkeresFeladatok.p8].sort(() => Math.random() - 0.5);
  const p14 = [...szamonkeresFeladatok.p14].sort(() => Math.random() - 0.5);
  const p18 = [...szamonkeresFeladatok.p18].sort(() => Math.random() - 0.5);

  return tanulok.map((tanulo, i) => ({
    tanulo,
    feladatok: {
      f8:  p8[i % p8.length],
      f14: p14[i % p14.length],
      f18: p18[i % p18.length]
    }
  }));
}

// Jegyszámítás (40% = 2-es)
function pontbolJegy(kapott, max) {
  const szazalek = (kapott / max) * 100;
  if (szazalek >= 85) return 5;
  if (szazalek >= 70) return 4;
  if (szazalek >= 55) return 3;
  if (szazalek >= 40) return 2;
  return 1;
}
