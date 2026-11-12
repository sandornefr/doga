# Alapok és Feltételek gyakorló feladatai – a kezdő tananyag sorrendjében (print, változók, input, átalakítás és műveletek,
# if/else, elif, and/or/not). Egy téma = a tananyag egy állomása, így a tanár témánként is feloldhatja.
# A gen.py ebből készíti a ../feladatok/alapok.js-t, és minden megoldást lefuttat a próbákkal.
# Az azonosítók (<téma>_N) a feloldás és a haladás kulcsai: NE számozd át, új feladat a téma végére kerüljön!

TEMAK = []
def tema(id, cim, leiras, kell):
    TEMAK.append(dict(id=id, cim=cim, leiras=leiras, kell=kell, F=[]))
def f(cim, leiras, pelda, tipp, megoldas, tesztek, csop=None):
    t = TEMAK[-1]
    t['F'].append(dict(cim=cim, kell=t['kell'], csop=csop or t['cim'], leiras=leiras.strip(), pelda=pelda.strip('\n'),
                       tipp=tipp.strip(), megoldas=megoldas.strip('\n'), tesztek=tesztek))

# ═════════════ print() ═════════════
tema('print', 'print() – kiírás', 'Kiírás egy vagy több sorba, szöveg és szám együtt.', 'print')

f('Üdvözlő tábla', """
<p>Az iskola bejáratánál egy kijelző köszönti a diákokat.</p>
<p>Írd ki: <code>Üdvözlünk a Kandóban!</code></p>
""", "Üdvözlünk a Kandóban!", "A szöveg idézőjelek közé kerül: print(\"…\")",
'print("Üdvözlünk a Kandóban!")', [([], ['Üdvözlünk a Kandóban!'])])

f('Névjegy', """
<p>Készíts névjegyet két sorba.</p>
<p>Az első sor: <code>Név: Peti</code></p>
<p>A második sor: <code>Osztály: 9.A</code></p>
""", "Név: Peti\nOsztály: 9.A", "Minden sorhoz egy print() kell.",
'print("Név: Peti")\nprint("Osztály: 9.A")', [([], ['Név: Peti', 'Osztály: 9.A'])])

f('Mozijegy', """
<p>Egy mozijegy 2500 Ft. Hárman mentek moziba.</p>
<p>Írd ki: <code>3 jegy ára: 7500 Ft</code></p>
<p>A szorzást a gép végezze el: a 7500-at ne te írd be!</p>
""", "3 jegy ára: 7500 Ft", "A darabokat vessző választja el: print(\"3 jegy ára:\", 3 * 2500, \"Ft\")",
'print("3 jegy ára:", 3 * 2500, "Ft")', [([], ['3 jegy ára: 7500 Ft'])])

f('Bevásárlólista', """
<p>Írd ki a bevásárlólistát.</p>
<p>Az első sor: <code>Bevásárlólista</code>. Utána egy üres sor jön.</p>
<p>Utána három sor: <code>- kenyér</code>, <code>- tej</code>, <code>- alma</code></p>
""", "Bevásárlólista\n\n- kenyér\n- tej\n- alma", "Üres sort így kapsz: print()",
'print("Bevásárlólista")\nprint()\nprint("- kenyér")\nprint("- tej")\nprint("- alma")',
[([], ['Bevásárlólista', '- kenyér', '- tej', '- alma'])])

f('Dátum kötőjellel', """
<p>Írd ki a mai dátumot így: <code>2026-11-12</code></p>
<p>A három számot vesszővel add meg a print()-nek: <code>2026, 11, 12</code></p>
<p>A kötőjeleket a <code>sep</code> tegye közéjük.</p>
""", "2026-11-12", "A sep adja meg, mi kerüljön a darabok közé: sep=\"-\"",
'print(2026, 11, 12, sep="-")', [([], ['2026-11-12'])])

f('Órarend egy print()-tel', """
<p>Írd ki a hét első három napjának első óráját, három sorba:</p>
<p><code>Hétfő: matek</code>, <code>Kedd: angol</code>, <code>Szerda: informatika</code></p>
<p>Csak <b>egy</b> print()-et használj! Az új sor jele: <code>\\n</code></p>
""", "Hétfő: matek\nKedd: angol\nSzerda: informatika", "Egy szövegen belül a \\n új sort kezd.",
'print("Hétfő: matek\\nKedd: angol\\nSzerda: informatika")', [([], ['Hétfő: matek', 'Kedd: angol', 'Szerda: informatika'])])

# ═════════════ Változók ═════════════
tema('valtozo', 'Változók', 'Érték eltárolása névvel, és a változó használata.', None)

f('Kedvenc étel', """
<p>Hozz létre egy <code>etel</code> nevű változót. Az értéke legyen: <code>pizza</code></p>
<p>Írd ki a változó segítségével: <code>Kedvenc ételem: pizza</code></p>
""", "Kedvenc ételem: pizza", "print(\"Kedvenc ételem:\", etel) – a változó neve nem kerül idézőjelbe.",
'etel = "pizza"\nprint("Kedvenc ételem:", etel)', [([], ['Kedvenc ételem: pizza'])])

f('Mozira költöttem', """
<p>Legyen egy <code>zsebpenz</code> változód 5000 értékkel, és egy <code>jegy</code> változód 2500 értékkel.</p>
<p>Számold ki a maradékot egy <code>maradt</code> nevű változóba.</p>
<p>Írd ki: <code>Maradt: 2500 Ft</code></p>
""", "Maradt: 2500 Ft", "maradt = zsebpenz - jegy",
'zsebpenz = 5000\njegy = 2500\nmaradt = zsebpenz - jegy\nprint("Maradt:", maradt, "Ft")', [([], ['Maradt: 2500 Ft'])])

f('Pontgyűjtés', """
<p>Egy játékban 10 ponttal indulsz: <code>pont = 10</code></p>
<p>Találtál egy csillagot: növeld a pontot 5-tel, ugyanabban a változóban.</p>
<p>Írd ki: <code>Pontszám: 15</code></p>
""", "Pontszám: 15", "A változó új értéke a régiből számolható: pont = pont + 5",
'pont = 10\npont = pont + 5\nprint("Pontszám:", pont)', [([], ['Pontszám: 15'])])

f('Bevásárlás', """
<p>A boltban három dolgot veszel. Tedd az árakat változókba:</p>
<p><code>kenyer</code> = 650, <code>tej</code> = 420, <code>alma</code> = 890</p>
<p>Írd ki: <code>Összesen: 1960 Ft</code> – az összeadást a gép végezze, a változókkal.</p>
""", "Összesen: 1960 Ft", "print(\"Összesen:\", kenyer + tej + alma, \"Ft\")",
'kenyer = 650\ntej = 420\nalma = 890\nprint("Összesen:", kenyer + tej + alma, "Ft")', [([], ['Összesen: 1960 Ft'])])

f('Kézcsere', """
<p>A <code>bal</code> változóban <code>alma</code>, a <code>jobb</code> változóban <code>körte</code> van.</p>
<p>Írd ki: <code>Bal: alma, jobb: körte</code></p>
<p>Cseréld meg a két változó tartalmát, és írd ki újra: <code>Bal: körte, jobb: alma</code></p>
""", "Bal: alma, jobb: körte\nBal: körte, jobb: alma", "Kell egy harmadik változó: seged = bal, bal = jobb, jobb = seged.",
'bal = "alma"\njobb = "körte"\nprint(f"Bal: {bal}, jobb: {jobb}")\nseged = bal\nbal = jobb\njobb = seged\nprint(f"Bal: {bal}, jobb: {jobb}")',
[([], ['Bal: alma, jobb: körte', 'Bal: körte, jobb: alma'])])

# ═════════════ input() ═════════════
tema('input', 'input() – bekérés', 'Adat bekérése a felhasználótól, és visszaírása.', 'input')

f('Köszönés', """
<p>Kérd be: <code>Hogy hívnak? </code></p>
<p>Köszönj neki: <code>Szia, Peti!</code></p>
""", "Hogy hívnak? Peti\nSzia, Peti!", "nev = input(\"Hogy hívnak? \"), utána f-string vagy vessző.",
'nev = input("Hogy hívnak? ")\nprint(f"Szia, {nev}!")', [(['Peti'], ['Szia, Peti!']), (['Péter'], ['Szia, Péter!'])])

f('Kedvenc szín', """
<p>Kérd be: <code>Mi a kedvenc színed? </code></p>
<p>Írd ki: <code>A kedvenc színed: kék</code></p>
""", "Mi a kedvenc színed? kék\nA kedvenc színed: kék", "A bekért szöveget tedd egy változóba.",
'szin = input("Mi a kedvenc színed? ")\nprint("A kedvenc színed:", szin)', [(['kék'], ['A kedvenc színed: kék']), (['zöld'], ['A kedvenc színed: zöld'])])

f('Rendelés', """
<p>Egy büfében rendelsz.</p>
<p>Kérd be: <code>Mit eszel? </code>, majd: <code>Mit iszol? </code></p>
<p>Írd ki: <code>Rendelésed: hamburger és limonádé</code></p>
""", "Mit eszel? hamburger\nMit iszol? limonádé\nRendelésed: hamburger és limonádé", "Két input() kell, két változóba.",
'etel = input("Mit eszel? ")\nital = input("Mit iszol? ")\nprint(f"Rendelésed: {etel} és {ital}")',
[(['hamburger', 'limonádé'], ['Rendelésed: hamburger és limonádé']), (['pizza', 'víz'], ['Rendelésed: pizza és víz'])])

f('Lakcímkártya', """
<p>Kérd be: <code>Település: </code>, <code>Utca: </code>, <code>Házszám: </code></p>
<p>Írd ki egy sorban: <code>Cím: Miskolc, Kossuth utca 12.</code></p>
<p>A házszám után pont legyen.</p>
""", "Település: Miskolc\nUtca: Kossuth utca\nHázszám: 12\nCím: Miskolc, Kossuth utca 12.", "Az f-stringben bármilyen írásjel lehet a változók között.",
'telepules = input("Település: ")\nutca = input("Utca: ")\nhazszam = input("Házszám: ")\nprint(f"Cím: {telepules}, {utca} {hazszam}.")',
[(['Miskolc', 'Kossuth utca', '12'], ['Cím: Miskolc, Kossuth utca 12.']), (['Budapest', 'Tavasz utca', '3'], ['Cím: Budapest, Tavasz utca 3.'])])

f('Visszhang', """
<p>Kérd be: <code>Kiáltás: </code></p>
<p>A hegyek visszhangozzák: írd ki a szót háromszor, három külön sorba.</p>
""", "Kiáltás: hahó\nhahó\nhahó\nhahó", "Három print() kell ugyanazzal a változóval.",
'szo = input("Kiáltás: ")\nprint(szo)\nprint(szo)\nprint(szo)', [(['hahó'], ['hahó', 'hahó', 'hahó', 'hahó'])])

# ═════════════ Átalakítás és műveletek ═════════════
tema('muvelet', 'Átalakítás és műveletek', 'int(), float(), számolás, egész osztás és maradék.', 'int/float')

f('Jövőre', """
<p>Kérd be: <code>Hány éves vagy? </code></p>
<p>Írd ki: <code>Jövőre 16 éves leszel.</code></p>
""", "Hány éves vagy? 15\nJövőre 16 éves leszel.", "Az input() szöveget ad. Számolni csak int()-tel átalakítva lehet.",
'kor = int(input("Hány éves vagy? "))\nprint(f"Jövőre {kor + 1} éves leszel.")', [(['15'], ['Jövőre 16 éves leszel.']), (['9'], ['Jövőre 10 éves leszel.'])])

f('Pizza osztozkodás', """
<p>Kérd be: <code>Hány szelet pizza van? </code> és <code>Hányan vagytok? </code></p>
<p>Mindenki ugyanannyit kap, egész szeleteket.</p>
<p>Írd ki: <code>Fejenként 2 szelet, maradék 2 szelet.</code></p>
""", "Hány szelet pizza van? 12\nHányan vagytok? 5\nFejenként 2 szelet, maradék 2 szelet.", "Egész osztás: //, maradék: %.",
'szelet = int(input("Hány szelet pizza van? "))\nfo = int(input("Hányan vagytok? "))\nprint(f"Fejenként {szelet // fo} szelet, maradék {szelet % fo} szelet.")',
[(['12', '5'], ['Fejenként 2 szelet, maradék 2 szelet.']), (['16', '4'], ['Fejenként 4 szelet, maradék 0 szelet.'])])

f('Film hossza', """
<p>Kérd be: <code>Hány perces a film? </code></p>
<p>Írd ki órában és percben: <code>2 óra 15 perc</code></p>
""", "Hány perces a film? 135\n2 óra 15 perc", "Óra: perc // 60. Maradék perc: perc % 60.",
'perc = int(input("Hány perces a film? "))\nprint(f"{perc // 60} óra {perc % 60} perc")', [(['135'], ['2 óra 15 perc']), (['90'], ['1 óra 30 perc'])])

f('Kerekítés egészre: round()', """
<p><b>Új eszköz: round()</b> – kerekít a legközelebbi egész számra.</p>
<p><code>round(4.6)</code> → <code>5</code> &nbsp; <code>round(4.3)</code> → <code>4</code> &nbsp; <code>round(87.8)</code> → <code>88</code></p>
<p><b>Feladat:</b> A telefon tört számmal méri a töltöttséget, de egészet mutat.</p>
<p>Kérd be: <code>Pontos töltöttség: </code> (pl.: <code>87.6</code>)</p>
<p>Írd ki kerekítve: <code>Akkumulátor: 88%</code></p>
""", "Pontos töltöttség: 87.6\nAkkumulátor: 88%", "Tört számot float()-tal kérsz be, utána round(toltes).",
'toltes = float(input("Pontos töltöttség: "))\nprint(f"Akkumulátor: {round(toltes)}%")',
[(['87.6'], ['Akkumulátor: 88%']), (['12.3'], ['Akkumulátor: 12%']), (['99.9'], ['Akkumulátor: 100%'])])

f('Kerekítés tizedesre: round(szám, 2)', """
<p>A round() második száma megmondja, hány tizedesjegy maradjon.</p>
<p><code>round(12.3456, 2)</code> → <code>12.35</code> &nbsp; <code>round(12.3456, 1)</code> → <code>12.3</code></p>
<p><b>Feladat:</b> A stopper sok tizedest mér, de két tizedes elég.</p>
<p>Kérd be: <code>Mért idő (mp): </code> (pl.: <code>12.3456</code>)</p>
<p>Írd ki két tizedesre kerekítve: <code>Idő: 12.35 mp</code></p>
""", "Mért idő (mp): 12.3456\nIdő: 12.35 mp", "round(ido, 2)",
'ido = float(input("Mért idő (mp): "))\nprint(f"Idő: {round(ido, 2)} mp")',
[(['12.3456'], ['Idő: 12.35 mp']), (['9.871'], ['Idő: 9.87 mp']), (['15.004'], ['Idő: 15.0 mp'])])

f('Tankolás', """
<p>Kérd be: <code>Literenkénti ár: </code> (lehet tört szám, pl.: <code>612.5</code>) és <code>Hány liter? </code></p>
<p>Írd ki egész forintra kerekítve: <code>Fizetendő: 24500 Ft</code></p>
""", "Literenkénti ár: 612.5\nHány liter? 40\nFizetendő: 24500 Ft", "Tört számhoz float() kell. Kerekítés: round().",
'ar = float(input("Literenkénti ár: "))\nliter = int(input("Hány liter? "))\nprint(f"Fizetendő: {round(ar * liter)} Ft")',
[(['612.5', '40'], ['Fizetendő: 24500 Ft']), (['599.9', '10'], ['Fizetendő: 5999 Ft'])])

f('Osztálypénz', """
<p>Osztálykirándulásra gyűjtötök.</p>
<p>Kérd be: <code>Hányan vagytok? </code> és <code>Mennyit ad egy diák? </code></p>
<p>Írd ki: <code>Összegyűlt: 15000 Ft</code></p>
""", "Hányan vagytok? 30\nMennyit ad egy diák? 500\nÖsszegyűlt: 15000 Ft", "Mindkettőt alakítsd számmá int()-tel, utána szorozd össze.",
'db = int(input("Hányan vagytok? "))\npenz = int(input("Mennyit ad egy diák? "))\nprint(f"Összegyűlt: {db * penz} Ft")',
[(['30', '500'], ['Összegyűlt: 15000 Ft']), (['25', '1000'], ['Összegyűlt: 25000 Ft'])])

f('Heti játékidő', """
<p>Kérd be: <code>Hétköznap hány percet játszol? </code> és <code>Hétvégén hány percet játszol egy nap? </code></p>
<p>Egy héten 5 hétköznap és 2 hétvégi nap van.</p>
<p>Írd ki: <code>Ezen a héten 650 percet játszol.</code></p>
""", "Hétköznap hány percet játszol? 70\nHétvégén hány percet játszol egy nap? 150\nEzen a héten 650 percet játszol.",
"5 * hetkoznap + 2 * hetvege",
'hk = int(input("Hétköznap hány percet játszol? "))\nhv = int(input("Hétvégén hány percet játszol egy nap? "))\nprint(f"Ezen a héten {5 * hk + 2 * hv} percet játszol.")',
[(['70', '150'], ['Ezen a héten 650 percet játszol.']), (['30', '60'], ['Ezen a héten 270 percet játszol.'])])

# ═════════════ if / else ═════════════
tema('if', 'if / else – döntés', 'Két ág: ha igaz, ezt csinálja, különben azt.', 'if')

f('Nagykorú?', """
<p>Kérd be: <code>Hány éves vagy? </code></p>
<p>Ha legalább 18: <code>Nagykorú vagy.</code> Különben: <code>Még nem vagy nagykorú.</code></p>
""", "Hány éves vagy? 15\nMég nem vagy nagykorú.", "Legalább 18: kor >= 18",
'kor = int(input("Hány éves vagy? "))\nif kor >= 18:\n    print("Nagykorú vagy.")\nelse:\n    print("Még nem vagy nagykorú.")',
[(['15'], ['Még nem vagy nagykorú.']), (['18'], ['Nagykorú vagy.']), (['40'], ['Nagykorú vagy.'])])

f('Melyik oldalon?', """
<p>Az utca egyik oldalán a páros, a másikon a páratlan házszámok vannak.</p>
<p>Kérd be: <code>Házszám: </code></p>
<p>Írd ki: <code>Páros oldal</code> vagy <code>Páratlan oldal</code></p>
""", "Házszám: 17\nPáratlan oldal", "Páros, ha a 2-vel osztás maradéka 0: hazszam % 2 == 0",
'h = int(input("Házszám: "))\nif h % 2 == 0:\n    print("Páros oldal")\nelse:\n    print("Páratlan oldal")',
[(['17'], ['Páratlan oldal']), (['24'], ['Páros oldal'])])

f('Akkumulátor', """
<p>Kérd be: <code>Töltöttség (%): </code></p>
<p>Ha 20-nál kevesebb: <code>Töltsd fel a telefont!</code> Különben: <code>Rendben van.</code></p>
""", "Töltöttség (%): 12\nTöltsd fel a telefont!", "Kevesebb, mint 20: toltes < 20",
't = int(input("Töltöttség (%): "))\nif t < 20:\n    print("Töltsd fel a telefont!")\nelse:\n    print("Rendben van.")',
[(['12'], ['Töltsd fel a telefont!']), (['20'], ['Rendben van.']), (['85'], ['Rendben van.'])])

f('Jelszó még egyszer', """
<p>Regisztrációnál kétszer kell beírni a jelszót.</p>
<p>Kérd be: <code>Jelszó: </code> és <code>Jelszó újra: </code></p>
<p>Írd ki: <code>A jelszavak egyeznek.</code> vagy <code>A jelszavak nem egyeznek!</code></p>
""", "Jelszó: tavasz26\nJelszó újra: tavasz62\nA jelszavak nem egyeznek!", "Egyenlőség vizsgálata: ==",
'a = input("Jelszó: ")\nb = input("Jelszó újra: ")\nif a == b:\n    print("A jelszavak egyeznek.")\nelse:\n    print("A jelszavak nem egyeznek!")',
[(['tavasz26', 'tavasz62'], ['A jelszavak nem egyeznek!']), (['kando', 'kando'], ['A jelszavak egyeznek.'])])

f('Ingyenes szállítás', """
<p>Egy webáruházban 10000 Ft-tól ingyenes a szállítás. Különben 1490 Ft.</p>
<p>Kérd be: <code>Kosár értéke: </code></p>
<p>Írd ki: <code>Ingyenes szállítás!</code> vagy <code>Szállítási díj: 1490 Ft</code></p>
<p>A végén: <code>Fizetendő: 11490 Ft</code></p>
""", "Kosár értéke: 10000\nSzállítási díj: 1490 Ft\n…", "Az ágakban csak a szállítási díjat állítsd be. A fizetendőt a végén írd ki.",
'kosar = int(input("Kosár értéke: "))\nif kosar >= 10000:\n    dij = 0\n    print("Ingyenes szállítás!")\nelse:\n    dij = 1490\n    print("Szállítási díj: 1490 Ft")\nprint(f"Fizetendő: {kosar + dij} Ft")',
[(['10000'], ['Ingyenes szállítás!', 'Fizetendő: 10000 Ft']), (['8000'], ['Szállítási díj: 1490 Ft', 'Fizetendő: 9490 Ft'])])

f('Megfelelt?', """
<p>Egy teszten legalább 50 pont kell.</p>
<p>Kérd be: <code>Pontszám: </code></p>
<p>Írd ki: <code>Megfelelt</code> vagy <code>Nem felelt meg</code></p>
""", "Pontszám: 63\nMegfelelt", "Legalább 50: pont >= 50",
'p = int(input("Pontszám: "))\nif p >= 50:\n    print("Megfelelt")\nelse:\n    print("Nem felelt meg")',
[(['63'], ['Megfelelt']), (['49'], ['Nem felelt meg']), (['50'], ['Megfelelt'])])

# ═════════════ elif ═════════════
tema('elif', 'elif – több ág', 'Több lehetőség közül egy: if, elif, else.', 'elif')

f('Mit vegyek fel?', """
<p>Kérd be: <code>Hány fok van? </code></p>
<p>10 foknál hidegebb: <code>Kabát kell.</code> 20 foknál hidegebb: <code>Pulóver elég.</code> Különben: <code>Póló is jó.</code></p>
""", "Hány fok van? 14\nPulóver elég.", "Az ágak sorrendje számít: a legszigorúbb feltétel kerüljön előre.",
'fok = int(input("Hány fok van? "))\nif fok < 10:\n    print("Kabát kell.")\nelif fok < 20:\n    print("Pulóver elég.")\nelse:\n    print("Póló is jó.")',
[(['14'], ['Pulóver elég.']), (['3'], ['Kabát kell.']), (['25'], ['Póló is jó.']), (['10'], ['Pulóver elég.'])])

f('Jegy a pontszámból', """
<p>Kérd be: <code>Pontszám (0-100): </code></p>
<p>Határok: 0–49: 1, 50–59: 2, 60–69: 3, 70–84: 4, 85–100: 5.</p>
<p>Írd ki: <code>Jegyed: 4</code></p>
""", "Pontszám (0-100): 72\nJegyed: 4", "Fentről lefelé haladj: if p >= 85 … elif p >= 70 …",
'p = int(input("Pontszám (0-100): "))\nif p >= 85:\n    j = 5\nelif p >= 70:\n    j = 4\nelif p >= 60:\n    j = 3\nelif p >= 50:\n    j = 2\nelse:\n    j = 1\nprint(f"Jegyed: {j}")',
[(['72'], ['Jegyed: 4']), (['85'], ['Jegyed: 5']), (['50'], ['Jegyed: 2']), (['10'], ['Jegyed: 1']), (['69'], ['Jegyed: 3'])])

f('Mozijegy életkor szerint', """
<p>Kérd be: <code>Életkor: </code></p>
<p>6 év alatt: <code>Jegyár: 0 Ft</code>. 6–17 év: <code>Jegyár: 1800 Ft</code>. 18–61 év: <code>Jegyár: 2500 Ft</code>. 62 évtől: <code>Jegyár: 1800 Ft</code></p>
""", "Életkor: 15\nJegyár: 1800 Ft", "Négy ág kell. Figyelj a határokra: 6, 18, 62.",
'kor = int(input("Életkor: "))\nif kor < 6:\n    ar = 0\nelif kor < 18:\n    ar = 1800\nelif kor < 62:\n    ar = 2500\nelse:\n    ar = 1800\nprint(f"Jegyár: {ar} Ft")',
[(['15'], ['Jegyár: 1800 Ft']), (['5'], ['Jegyár: 0 Ft']), (['18'], ['Jegyár: 2500 Ft']), (['62'], ['Jegyár: 1800 Ft'])])

f('Szélerősség', """
<p>Kérd be: <code>Szélsebesség (km/h): </code></p>
<p>20 alatt: <code>Szélcsend</code>, 50 alatt: <code>Szeles idő</code>, 90 alatt: <code>Viharos szél</code>, különben: <code>Orkán!</code></p>
""", "Szélsebesség (km/h): 65\nViharos szél", "if, két elif és egy else.",
'v = int(input("Szélsebesség (km/h): "))\nif v < 20:\n    print("Szélcsend")\nelif v < 50:\n    print("Szeles idő")\nelif v < 90:\n    print("Viharos szél")\nelse:\n    print("Orkán!")',
[(['65'], ['Viharos szél']), (['5'], ['Szélcsend']), (['49'], ['Szeles idő']), (['120'], ['Orkán!'])])

f('Közlekedési lámpa', """
<p>Kérd be: <code>Milyen színű a lámpa? </code></p>
<p><code>piros</code>: <code>Állj!</code>, <code>sárga</code>: <code>Figyelj!</code>, <code>zöld</code>: <code>Mehetsz!</code></p>
<p>Minden más esetben: <code>Ismeretlen jelzés.</code></p>
""", "Milyen színű a lámpa? zöld\nMehetsz!", "Szövegeket hasonlítasz: if szin == \"piros\":",
'szin = input("Milyen színű a lámpa? ")\nif szin == "piros":\n    print("Állj!")\nelif szin == "sárga":\n    print("Figyelj!")\nelif szin == "zöld":\n    print("Mehetsz!")\nelse:\n    print("Ismeretlen jelzés.")',
[(['zöld'], ['Mehetsz!']), (['piros'], ['Állj!']), (['sárga'], ['Figyelj!']), (['kék'], ['Ismeretlen jelzés.'])])

# ═════════════ and / or / not ═════════════
tema('logika', 'and / or / not – összetett feltétel', 'Több feltétel egyszerre: és, vagy, nem.', 'and/or/not')

f('Strandidő', """
<p>Kérd be: <code>Hány fok van? </code> és <code>Esik az eső? (i/n) </code></p>
<p>Ha legalább 25 fok van <b>és</b> nem esik: <code>Irány a strand!</code> Különben: <code>Maradjunk itthon.</code></p>
""", "Hány fok van? 28\nEsik az eső? (i/n) n\nIrány a strand!", "if fok >= 25 and eso == \"n\":",
'fok = int(input("Hány fok van? "))\neso = input("Esik az eső? (i/n) ")\nif fok >= 25 and eso == "n":\n    print("Irány a strand!")\nelse:\n    print("Maradjunk itthon.")',
[(['28', 'n'], ['Irány a strand!']), (['28', 'i'], ['Maradjunk itthon.']), (['20', 'n'], ['Maradjunk itthon.'])])

f('Kedvezményes jegy', """
<p>Kérd be: <code>Diák vagy? (i/n) </code> és <code>Életkor: </code></p>
<p>Kedvezmény jár, ha diák, <b>vagy</b> ha legalább 62 éves.</p>
<p>Írd ki: <code>Kedvezményes jegy</code> vagy <code>Teljes árú jegy</code></p>
""", "Diák vagy? (i/n) i\nÉletkor: 16\nKedvezményes jegy", "if diak == \"i\" or kor >= 62:",
'diak = input("Diák vagy? (i/n) ")\nkor = int(input("Életkor: "))\nif diak == "i" or kor >= 62:\n    print("Kedvezményes jegy")\nelse:\n    print("Teljes árú jegy")',
[(['i', '16'], ['Kedvezményes jegy']), (['n', '70'], ['Kedvezményes jegy']), (['n', '40'], ['Teljes árú jegy'])])

f('Bejelentkezés', """
<p>A helyes felhasználónév: <code>admin</code>, a helyes jelszó: <code>kando123</code></p>
<p>Kérd be: <code>Felhasználónév: </code> és <code>Jelszó: </code></p>
<p>Ha mindkettő jó: <code>Sikeres belépés.</code> Különben: <code>Hibás adatok!</code></p>
""", "Felhasználónév: admin\nJelszó: kando\nHibás adatok!", "Mindkettőnek igaznak kell lennie: and.",
'nev = input("Felhasználónév: ")\njelszo = input("Jelszó: ")\nif nev == "admin" and jelszo == "kando123":\n    print("Sikeres belépés.")\nelse:\n    print("Hibás adatok!")',
[(['admin', 'kando'], ['Hibás adatok!']), (['admin', 'kando123'], ['Sikeres belépés.']), (['tanulo', 'kando123'], ['Hibás adatok!'])])

f('Hétvége?', """
<p>Kérd be: <code>Milyen nap van ma? </code> (kisbetűvel, pl.: <code>szombat</code>)</p>
<p>Ha szombat <b>vagy</b> vasárnap: <code>Hétvége van!</code> Különben: <code>Hétköznap van.</code></p>
""", "Milyen nap van ma? vasárnap\nHétvége van!", "if nap == \"szombat\" or nap == \"vasárnap\":",
'nap = input("Milyen nap van ma? ")\nif nap == "szombat" or nap == "vasárnap":\n    print("Hétvége van!")\nelse:\n    print("Hétköznap van.")',
[(['vasárnap'], ['Hétvége van!']), (['szombat'], ['Hétvége van!']), (['kedd'], ['Hétköznap van.'])])

f('Érvényes pontszám?', """
<p>Egy dolgozat pontszáma 0 és 100 között lehet.</p>
<p>Kérd be: <code>Pontszám: </code></p>
<p>Ha 0 és 100 közötti (a határokat is beleértve): <code>Érvényes pontszám.</code> Különben: <code>Hibás pontszám!</code></p>
""", "Pontszám: 120\nHibás pontszám!", "if p >= 0 and p <= 100: – vagy fordítva: if p < 0 or p > 100:",
'p = int(input("Pontszám: "))\nif p >= 0 and p <= 100:\n    print("Érvényes pontszám.")\nelse:\n    print("Hibás pontszám!")',
[(['120'], ['Hibás pontszám!']), (['0'], ['Érvényes pontszám.']), (['100'], ['Érvényes pontszám.']), (['-1'], ['Hibás pontszám!'])])
