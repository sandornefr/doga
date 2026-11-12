# Ciklusgyakorló feladatbank – forrás. A gen.py ebből készíti a ciklus.js-t és ellenőrzi a megoldásokat.
# Mezők: cim, kell ('for'/'while'), csop, leiras (HTML), pelda (mintafutás), tipp, megoldas, tesztek [(bemenetek, elvárt kimenet-részletek sorrendben)]

F = []
def f(cim, kell, csop, leiras, pelda, tipp, megoldas, tesztek):
    F.append(dict(cim=cim, kell=kell, csop=csop, leiras=leiras.strip(), pelda=pelda.strip('\n'),
                  tipp=tipp.strip(), megoldas=megoldas.strip('\n'), tesztek=tesztek))

A = 'Ismétlés range()-dzsel'
B = 'Összegzés, számlálás, legnagyobb'
C = 'Szöveg betűnként'
D = 'Amíg igaz a feltétel'
E = 'Vegyes, haladó'

# ═════════════════ A: for – ismétlés ═════════════════

f('Rakétakilövés', 'for', A, """
<p>A rakéta indítása előtt visszaszámolnak.</p>
<p>Írd ki a számokat <b>10-től 1-ig</b>, mindegyiket külön sorba.</p>
<p>A végén írd ki: <code>Start!</code></p>
""", """
10
9
8
...
1
Start!
""", "A range() visszafelé is tud számolni: range(10, 0, -1). A Start! a cikluson kívül van.",
"""
for i in range(10, 0, -1):
    print(i)
print("Start!")
""", [([], ['10', '9', '5', '1', 'Start!'])])

f('Edzésterv', 'for', A, """
<p>Edzésen sorozatokban csinálod a fekvőtámaszt.</p>
<p>Kérd be: <code>Hány sorozat? </code></p>
<p>Minden sorozathoz írj ki egy sort: <code>1. sorozat: 10 fekvőtámasz</code></p>
""", """
Hány sorozat? 3
1. sorozat: 10 fekvőtámasz
2. sorozat: 10 fekvőtámasz
3. sorozat: 10 fekvőtámasz
""", "Ha 1-től n-ig kell számolni: range(1, n + 1).",
"""
n = int(input("Hány sorozat? "))
for i in range(1, n + 1):
    print(f"{i}. sorozat: 10 fekvőtámasz")
""", [(['3'], ['1. sorozat: 10 fekvőtámasz', '2. sorozat', '3. sorozat: 10 fekvőtámasz']),
      (['5'], ['1. sorozat', '5. sorozat: 10 fekvőtámasz'])])

f('Árlista a boltban', 'for', A, """
<p>A pénztárnál jól jön egy árlista.</p>
<p>Kérd be: <code>Mennyibe kerül egy csoki? </code></p>
<p>Írd ki 1-től 10 darabig, mennyit kell fizetni.</p>
<p>Egy sor így nézzen ki: <code>3 db: 750 Ft</code></p>
""", """
Mennyibe kerül egy csoki? 250
1 db: 250 Ft
2 db: 500 Ft
...
10 db: 2500 Ft
""", "A ciklusváltozó a darabszám. Az ár: darab * egységár.",
"""
ar = int(input("Mennyibe kerül egy csoki? "))
for db in range(1, 11):
    print(f"{db} db: {db * ar} Ft")
""", [(['250'], ['1 db: 250 Ft', '2 db: 500 Ft', '10 db: 2500 Ft']),
      (['390'], ['1 db: 390 Ft', '7 db: 2730 Ft', '10 db: 3900 Ft'])])

f('Páros házszámok', 'for', A, """
<p>Az utca egyik oldalán csak páros házszámok vannak.</p>
<p>Kérd be: <code>Mennyi a legnagyobb házszám? </code></p>
<p>Írd ki a páros házszámokat 2-től eddig a számig, mindegyiket külön sorba.</p>
""", """
Mennyi a legnagyobb házszám? 10
2
4
6
8
10
""", "A range() harmadik száma a lépésköz: range(2, n + 1, 2).",
"""
n = int(input("Mennyi a legnagyobb házszám? "))
for szam in range(2, n + 1, 2):
    print(szam)
""", [(['10'], ['2', '4', '6', '8', '10']), (['7'], ['2', '4', '6'])])

f('Kilométerkövek', 'for', A, """
<p>A futóverseny útvonalán 5 km-enként tábla áll.</p>
<p>Kérd be: <code>Milyen hosszú a táv (km)? </code></p>
<p>Írd ki az összes táblát: <code>5 km</code>, <code>10 km</code> és így tovább, amíg a táv tart.</p>
""", """
Milyen hosszú a táv (km)? 21
5 km
10 km
15 km
20 km
""", "Indulj 5-ről, és 5-ösével lépj: range(5, tav + 1, 5).",
"""
tav = int(input("Milyen hosszú a táv (km)? "))
for km in range(5, tav + 1, 5):
    print(f"{km} km")
""", [(['21'], ['5 km', '10 km', '15 km', '20 km']), (['42'], ['5 km', '40 km'])])

f('Körök a futópályán', 'for', A, """
<p>Tesiórán köröket futsz.</p>
<p>Kérd be: <code>Hány kört kell futni? </code></p>
<p>Minden kör után írd ki: <code>1. kör kész, még 3 van hátra.</code></p>
<p>A végén: <code>Megvan, pihenhetsz!</code></p>
""", """
Hány kört kell futni? 4
1. kör kész, még 3 van hátra.
2. kör kész, még 2 van hátra.
3. kör kész, még 1 van hátra.
4. kör kész, még 0 van hátra.
Megvan, pihenhetsz!
""", "Hátralévő körök: n - i, ha i az éppen kész kör sorszáma.",
"""
n = int(input("Hány kört kell futni? "))
for i in range(1, n + 1):
    print(f"{i}. kör kész, még {n - i} van hátra.")
print("Megvan, pihenhetsz!")
""", [(['4'], ['1. kör kész, még 3 van hátra.', '4. kör kész, még 0 van hátra.', 'Megvan, pihenhetsz!']),
      (['2'], ['1. kör kész, még 1 van hátra.', '2. kör kész, még 0 van hátra.'])])

f('Lépcsőrajz', 'for', A, """
<p>Rajzolj lépcsőt <code>#</code> jelekből.</p>
<p>Kérd be: <code>Hány lépcsőfok? </code></p>
<p>Az első sorban 1, a másodikban 2, az utolsóban annyi <code>#</code> legyen, ahány lépcsőfok van.</p>
""", """
Hány lépcsőfok? 4
#
##
###
####
""", "Egy szöveget szorozhatsz is: \"#\" * 3 eredménye ###.",
"""
n = int(input("Hány lépcsőfok? "))
for i in range(1, n + 1):
    print("#" * i)
""", [(['4'], ['#', '##', '###', '####']), (['6'], ['#####', '######'])])

f('Perselypénz', 'for', A, """
<p>Minden héten ugyanannyi pénzt teszel a perselybe.</p>
<p>Kérd be: <code>Mennyit teszel be hetente? </code></p>
<p>Írd ki 10 héten át, mennyi pénz van a perselyben a hét végén.</p>
<p>Egy sor: <code>1. hét: 2000 Ft</code></p>
""", """
Mennyit teszel be hetente? 2000
1. hét: 2000 Ft
2. hét: 4000 Ft
...
10. hét: 20000 Ft
""", "Legyen egy osszeg változód 0 kezdőértékkel. A ciklusban mindig add hozzá a heti pénzt.",
"""
heti = int(input("Mennyit teszel be hetente? "))
osszeg = 0
for het in range(1, 11):
    osszeg = osszeg + heti
    print(f"{het}. hét: {osszeg} Ft")
""", [(['2000'], ['1. hét: 2000 Ft', '2. hét: 4000 Ft', '10. hét: 20000 Ft']),
      (['750'], ['1. hét: 750 Ft', '4. hét: 3000 Ft', '10. hét: 7500 Ft'])])

# ═════════════════ B: for – összegzés, számlálás ═════════════════

f('Bevásárlás', 'for', B, """
<p>A kosárban több termék van.</p>
<p>Kérd be: <code>Hány termék van a kosárban? </code></p>
<p>Utána minden terméknél kérd be: <code>Ár: </code></p>
<p>A végén írd ki: <code>Összesen: 1340 Ft</code></p>
""", """
Hány termék van a kosárban? 3
Ár: 450
Ár: 290
Ár: 600
Összesen: 1340 Ft
""", "Összegzés: osszeg = 0 a ciklus előtt, a ciklusban osszeg = osszeg + ar.",
"""
n = int(input("Hány termék van a kosárban? "))
osszeg = 0
for i in range(n):
    ar = int(input("Ár: "))
    osszeg = osszeg + ar
print(f"Összesen: {osszeg} Ft")
""", [(['3', '450', '290', '600'], ['Összesen: 1340 Ft']),
      (['5', '100', '200', '300', '400', '500'], ['Összesen: 1500 Ft'])])

f('Heti lépésszám', 'for', B, """
<p>A telefonod számolja, hány lépést teszel naponta.</p>
<p>Kérd be 7 napra: <code>1. nap lépései: </code>, <code>2. nap lépései: </code> …</p>
<p>Írd ki: <code>Összesen: 52000 lépés</code></p>
<p>És írd ki: <code>Napi átlag: 7429 lépés</code> (egészre kerekítve, round()).</p>
""", """
1. nap lépései: 8000
2. nap lépései: 6500
...
7. nap lépései: 9000
Összesen: 52000 lépés
Napi átlag: 7429 lépés
""", "Az átlag az összeg osztva 7-tel. Kerekítés: round(osszeg / 7).",
"""
osszeg = 0
for nap in range(1, 8):
    lepes = int(input(f"{nap}. nap lépései: "))
    osszeg = osszeg + lepes
print(f"Összesen: {osszeg} lépés")
print(f"Napi átlag: {round(osszeg / 7)} lépés")
""", [(['8000', '6500', '7000', '9500', '5000', '7000', '9000'], ['Összesen: 52000 lépés', 'Napi átlag: 7429 lépés']),
      (['1000'] * 7, ['Összesen: 7000 lépés', 'Napi átlag: 1000 lépés'])])

f('Jegyek átlaga', 'for', B, """
<p>Számold ki a félévi jegyeid átlagát.</p>
<p>Kérd be: <code>Hány jegyed van? </code>, majd egyesével: <code>Jegy: </code></p>
<p>Írd ki két tizedesre kerekítve: <code>Átlag: 3.67</code></p>
""", """
Hány jegyed van? 3
Jegy: 4
Jegy: 5
Jegy: 2
Átlag: 3.67
""", "Kerekítés két tizedesre: round(atlag, 2).",
"""
n = int(input("Hány jegyed van? "))
osszeg = 0
for i in range(n):
    jegy = int(input("Jegy: "))
    osszeg = osszeg + jegy
print(f"Átlag: {round(osszeg / n, 2)}")
""", [(['3', '4', '5', '2'], ['Átlag: 3.67']), (['4', '5', '5', '4', '5'], ['Átlag: 4.75'])])

f('Fagyos napok', 'for', B, """
<p>Egy héten át reggel megmérted a hőmérsékletet.</p>
<p>Kérd be 7-szer: <code>Hőmérséklet: </code></p>
<p>Számold meg, hány napon volt fagy (0 foknál kevesebb).</p>
<p>Írd ki: <code>Fagyos napok: 2</code></p>
""", """
Hőmérséklet: 3
Hőmérséklet: -2
Hőmérséklet: 0
Hőmérséklet: -5
Hőmérséklet: 1
Hőmérséklet: 4
Hőmérséklet: 2
Fagyos napok: 2
""", "Számlálás: db = 0 a ciklus előtt. Ha a feltétel igaz, db = db + 1.",
"""
db = 0
for nap in range(7):
    homerseklet = int(input("Hőmérséklet: "))
    if homerseklet < 0:
        db = db + 1
print(f"Fagyos napok: {db}")
""", [(['3', '-2', '0', '-5', '1', '4', '2'], ['Fagyos napok: 2']),
      (['5', '6', '7', '8', '9', '10', '11'], ['Fagyos napok: 0'])])

f('Legjobb kör', 'for', B, """
<p>Egy játékban több kört játszottál.</p>
<p>Kérd be: <code>Hány kört játszottál? </code>, majd egyesével: <code>Pont: </code></p>
<p>Írd ki a legjobb kört és a pontját: <code>Legjobb kör: 3. (950 pont)</code></p>
<p>Ha több kör is ugyanannyi, az első számít.</p>
""", """
Hány kört játszottál? 4
Pont: 700
Pont: 820
Pont: 950
Pont: 600
Legjobb kör: 3. (950 pont)
""", "Jegyezd meg a legnagyobb pontot és a kör sorszámát. Ha az új pont nagyobb, cseréld le mindkettőt.",
"""
n = int(input("Hány kört játszottál? "))
legjobb = -1
hanyadik = 0
for kor in range(1, n + 1):
    pont = int(input("Pont: "))
    if pont > legjobb:
        legjobb = pont
        hanyadik = kor
print(f"Legjobb kör: {hanyadik}. ({legjobb} pont)")
""", [(['4', '700', '820', '950', '600'], ['Legjobb kör: 3. (950 pont)']),
      (['3', '500', '400', '500'], ['Legjobb kör: 1. (500 pont)'])])

f('Mobilnet-figyelő', 'for', B, """
<p>Figyeled, mennyi mobilnetet használsz.</p>
<p>Kérd be: <code>Hány napot nézünk? </code>, majd naponta: <code>MB: </code></p>
<p>Írd ki az összeset: <code>Összesen: 1450 MB</code></p>
<p>Írd ki, hány napon volt 500 MB-nál több: <code>Sok napok: 1</code></p>
""", """
Hány napot nézünk? 3
MB: 300
MB: 650
MB: 500
Összesen: 1450 MB
Sok napok: 1
""", "Egy ciklusban két dolgot is számolhatsz: összeget és darabszámot.",
"""
n = int(input("Hány napot nézünk? "))
osszeg = 0
sok = 0
for i in range(n):
    mb = int(input("MB: "))
    osszeg = osszeg + mb
    if mb > 500:
        sok = sok + 1
print(f"Összesen: {osszeg} MB")
print(f"Sok napok: {sok}")
""", [(['3', '300', '650', '500'], ['Összesen: 1450 MB', 'Sok napok: 1']),
      (['4', '900', '800', '100', '501'], ['Összesen: 2301 MB', 'Sok napok: 3'])])

f('Leggyorsabb futó', 'for', B, """
<p>Tesiórán 60 méteres futás volt.</p>
<p>Kérd be: <code>Hány futó volt? </code>, majd egyesével az időt tizedmásodpercben: <code>Idő: </code></p>
<p>Írd ki a legjobb időt: <code>Leggyorsabb idő: 82</code></p>
""", """
Hány futó volt? 4
Idő: 95
Idő: 82
Idő: 101
Idő: 88
Leggyorsabb idő: 82
""", "A legkisebb keresésénél az első értékkel indulj, vagy egy nagyon nagy számmal.",
"""
n = int(input("Hány futó volt? "))
legjobb = 10000
for i in range(n):
    ido = int(input("Idő: "))
    if ido < legjobb:
        legjobb = ido
print(f"Leggyorsabb idő: {legjobb}")
""", [(['4', '95', '82', '101', '88'], ['Leggyorsabb idő: 82']), (['2', '120', '119'], ['Leggyorsabb idő: 119'])])

f('Zsebpénz', 'for', B, """
<p>Kérd be: <code>Mennyi pénzed van? </code></p>
<p>Kérd be: <code>Hányszor vásároltál? </code>, majd egyesével: <code>Költés: </code></p>
<p>Írd ki: <code>Maradt: 1200 Ft</code></p>
<p>Ha a maradék kisebb, mint 0, írd ki még ezt is: <code>Mínuszban vagy!</code></p>
""", """
Mennyi pénzed van? 5000
Hányszor vásároltál? 2
Költés: 3000
Költés: 800
Maradt: 1200 Ft
""", "Most nem összeadsz, hanem kivonsz: penz = penz - koltes.",
"""
penz = int(input("Mennyi pénzed van? "))
n = int(input("Hányszor vásároltál? "))
for i in range(n):
    koltes = int(input("Költés: "))
    penz = penz - koltes
print(f"Maradt: {penz} Ft")
if penz < 0:
    print("Mínuszban vagy!")
""", [(['5000', '2', '3000', '800'], ['Maradt: 1200 Ft']),
      (['1000', '3', '500', '400', '300'], ['Maradt: -200 Ft', 'Mínuszban vagy!'])])

f('Ötösök és egyesek', 'for', B, """
<p>Egy dolgozat jegyeit nézzük.</p>
<p>Kérd be: <code>Hány tanuló írta meg? </code>, majd egyesével: <code>Jegy: </code></p>
<p>Írd ki két sorban: <code>Ötös: 3</code> és <code>Elégtelen: 1</code></p>
""", """
Hány tanuló írta meg? 5
Jegy: 5
Jegy: 1
Jegy: 5
Jegy: 3
Jegy: 5
Ötös: 3
Elégtelen: 1
""", "Két számlálóra van szükséged.",
"""
n = int(input("Hány tanuló írta meg? "))
otos = 0
egyes = 0
for i in range(n):
    jegy = int(input("Jegy: "))
    if jegy == 5:
        otos = otos + 1
    if jegy == 1:
        egyes = egyes + 1
print(f"Ötös: {otos}")
print(f"Elégtelen: {egyes}")
""", [(['5', '5', '1', '5', '3', '5'], ['Ötös: 3', 'Elégtelen: 1']), (['3', '2', '3', '4'], ['Ötös: 0', 'Elégtelen: 0'])])

f('Minden harmadik vendég', 'for', B, """
<p>A kávézóban minden harmadik vendég ajándék sütit kap.</p>
<p>Kérd be: <code>Hány vendég jött? </code></p>
<p>Írd ki az ajándékot kapók sorszámát: <code>3. vendég: ajándék süti</code></p>
<p>A végén: <code>Kiosztott sütik: 2</code></p>
""", """
Hány vendég jött? 7
3. vendég: ajándék süti
6. vendég: ajándék süti
Kiosztott sütik: 2
""", "Hárommal osztható: i % 3 == 0.",
"""
n = int(input("Hány vendég jött? "))
db = 0
for i in range(1, n + 1):
    if i % 3 == 0:
        print(f"{i}. vendég: ajándék süti")
        db = db + 1
print(f"Kiosztott sütik: {db}")
""", [(['7'], ['3. vendég: ajándék süti', '6. vendég: ajándék süti', 'Kiosztott sütik: 2']),
      (['12'], ['12. vendég: ajándék süti', 'Kiosztott sütik: 4'])])

f('Képernyőidő', 'for', B, """
<p>A telefon méri, hány percet töltesz rajta naponta.</p>
<p>Kérd be 7-szer: <code>Perc: </code></p>
<p>Írd ki a heti összeget órában és percben: <code>Heti képernyőidő: 15 óra 20 perc</code></p>
""", """
Perc: 120
Perc: 150
Perc: 90
Perc: 140
Perc: 100
Perc: 160
Perc: 160
Heti képernyőidő: 15 óra 20 perc
""", "Óra: osszeg // 60, maradék perc: osszeg % 60.",
"""
osszeg = 0
for nap in range(7):
    perc = int(input("Perc: "))
    osszeg = osszeg + perc
print(f"Heti képernyőidő: {osszeg // 60} óra {osszeg % 60} perc")
""", [(['120', '150', '90', '140', '100', '160', '160'], ['Heti képernyőidő: 15 óra 20 perc']),
      (['60'] * 7, ['Heti képernyőidő: 7 óra 0 perc'])])

f('Kosárra dobás', 'for', B, """
<p>Kosárra dobsz. Minden dobás után beírod: <code>b</code> (bement) vagy <code>k</code> (kimaradt).</p>
<p>Kérd be: <code>Hány dobás volt? </code>, majd egyesével: <code>Dobás: </code></p>
<p>Írd ki két sorban: <code>Talált: 3</code> és <code>Kimaradt: 2</code></p>
""", """
Hány dobás volt? 5
Dobás: b
Dobás: k
Dobás: b
Dobás: b
Dobás: k
Talált: 3
Kimaradt: 2
""", "Itt szöveget hasonlítasz: if dobas == \"b\":",
"""
n = int(input("Hány dobás volt? "))
talalt = 0
kimaradt = 0
for i in range(n):
    dobas = input("Dobás: ")
    if dobas == "b":
        talalt = talalt + 1
    else:
        kimaradt = kimaradt + 1
print(f"Talált: {talalt}")
print(f"Kimaradt: {kimaradt}")
""", [(['5', 'b', 'k', 'b', 'b', 'k'], ['Talált: 3', 'Kimaradt: 2']),
      (['3', 'b', 'k', 'k'], ['Talált: 1', 'Kimaradt: 2'])])

f('Hőingás', 'for', B, """
<p>Egy nap több hőmérsékletet mértél.</p>
<p>Kérd be: <code>Hány mérés volt? </code>, majd egyesével: <code>Fok: </code></p>
<p>Írd ki három sorban: <code>Legmelegebb: 18</code>, <code>Leghidegebb: 4</code>, <code>Különbség: 14</code></p>
""", """
Hány mérés volt? 4
Fok: 4
Fok: 12
Fok: 18
Fok: 9
Legmelegebb: 18
Leghidegebb: 4
Különbség: 14
""", "Az első mérés legyen a legnagyobb és a legkisebb is. A többit hasonlítsd hozzá.",
"""
n = int(input("Hány mérés volt? "))
fok = int(input("Fok: "))
legnagyobb = fok
legkisebb = fok
for i in range(n - 1):
    fok = int(input("Fok: "))
    if fok > legnagyobb:
        legnagyobb = fok
    if fok < legkisebb:
        legkisebb = fok
print(f"Legmelegebb: {legnagyobb}")
print(f"Leghidegebb: {legkisebb}")
print(f"Különbség: {legnagyobb - legkisebb}")
""", [(['4', '4', '12', '18', '9'], ['Legmelegebb: 18', 'Leghidegebb: 4', 'Különbség: 14']),
      (['3', '-3', '-8', '2'], ['Legmelegebb: 2', 'Leghidegebb: -8', 'Különbség: 10'])])

f('Osztályszavazás', 'for', B, """
<p>Az osztály szavaz az osztálykirándulásról.</p>
<p>Kérd be: <code>Hányan szavaznak? </code>, majd egyesével: <code>Szavazat (i/n): </code></p>
<p>Írd ki: <code>Igen: 4, Nem: 2</code></p>
<p>Ha több az igen, írd ki: <code>Megyünk kirándulni!</code>, különben: <code>Maradunk.</code></p>
""", """
Hányan szavaznak? 6
Szavazat (i/n): i
Szavazat (i/n): n
Szavazat (i/n): i
Szavazat (i/n): i
Szavazat (i/n): n
Szavazat (i/n): i
Igen: 4, Nem: 2
Megyünk kirándulni!
""", "Számold külön az igeneket és a nemeket. A döntés a ciklus után jön.",
"""
n = int(input("Hányan szavaznak? "))
igen = 0
nem = 0
for i in range(n):
    sz = input("Szavazat (i/n): ")
    if sz == "i":
        igen = igen + 1
    else:
        nem = nem + 1
print(f"Igen: {igen}, Nem: {nem}")
if igen > nem:
    print("Megyünk kirándulni!")
else:
    print("Maradunk.")
""", [(['6', 'i', 'n', 'i', 'i', 'n', 'i'], ['Igen: 4, Nem: 2', 'Megyünk kirándulni!']),
      (['4', 'i', 'n', 'n', 'i'], ['Igen: 2, Nem: 2', 'Maradunk.'])])

# ═════════════════ C: for – szöveg ═════════════════

f('Számjegyek a jelszóban', 'for', C, """
<p>Egy jó jelszóban számjegy is van.</p>
<p>Kérd be: <code>Jelszó: </code></p>
<p>Számold meg, hány számjegy van benne.</p>
<p>Írd ki: <code>Számjegyek: 4</code></p>
""", """
Jelszó: macska2024x
Számjegyek: 4
""", "A for végigmegy a szöveg betűin: for betu in jelszo:. Számjegy-e: betu in \"0123456789\".",
"""
jelszo = input("Jelszó: ")
db = 0
for betu in jelszo:
    if betu in "0123456789":
        db = db + 1
print(f"Számjegyek: {db}")
""", [(['macska2024x'], ['Számjegyek: 4']), (['alma'], ['Számjegyek: 0']), (['1a2b3'], ['Számjegyek: 3'])])

f('Magánhangzók', 'for', C, """
<p>Kérd be: <code>Írj be egy szót: </code></p>
<p>Számold meg, hány magánhangzó van benne (a, á, e, é, i, í, o, ó, ö, ő, u, ú, ü, ű).</p>
<p>Írd ki: <code>Magánhangzók: 5</code></p>
<p>A kis- és nagybetű ne számítson.</p>
""", """
Írj be egy szót: Okostelefon
Magánhangzók: 5
""", "A szo.lower() mindent kisbetűssé alakít.",
"""
szo = input("Írj be egy szót: ").lower()
db = 0
for betu in szo:
    if betu in "aáeéiíoóöőuúüű":
        db = db + 1
print(f"Magánhangzók: {db}")
""", [(['Okostelefon'], ['Magánhangzók: 5']), (['Számítógép'], ['Magánhangzók: 4']), (['xyz'], ['Magánhangzók: 0'])])

f('Rendszám betűzése', 'for', C, """
<p>Telefonon betűzöd egy autó rendszámát.</p>
<p>Kérd be: <code>Rendszám: </code></p>
<p>Írd ki minden karakterét külön sorba, sorszámmal: <code>1. karakter: A</code></p>
""", """
Rendszám: AB123
1. karakter: A
2. karakter: B
3. karakter: 1
4. karakter: 2
5. karakter: 3
""", "Kell egy sorszám változó is, amit minden betűnél eggyel növelsz.",
"""
rendszam = input("Rendszám: ")
sorszam = 1
for k in rendszam:
    print(f"{sorszam}. karakter: {k}")
    sorszam = sorszam + 1
""", [(['AB123'], ['1. karakter: A', '2. karakter: B', '5. karakter: 3']), (['XY9'], ['1. karakter: X', '3. karakter: 9'])])

f('Szavak az üzenetben', 'for', C, """
<p>Kérd be: <code>Üzenet: </code></p>
<p>Számold meg a szóközöket. A szavak száma eggyel több, mint a szóközöké.</p>
<p>Írd ki: <code>Szavak száma: 5</code></p>
<p>(Feltételezzük, hogy két szó között pontosan egy szóköz van.)</p>
""", """
Üzenet: Holnap hétkor találkozunk a mozinál
Szavak száma: 5
""", "Szóköz-e: betu == \" \".",
"""
uzenet = input("Üzenet: ")
szokoz = 0
for betu in uzenet:
    if betu == " ":
        szokoz = szokoz + 1
print(f"Szavak száma: {szokoz + 1}")
""", [(['Holnap hétkor találkozunk a mozinál'], ['Szavak száma: 5']), (['Szia'], ['Szavak száma: 1'])])

f('Visszafelé', 'for', C, """
<p>Kérd be: <code>Írj be egy szót: </code></p>
<p>Állítsd elő a szót visszafelé egy ciklussal, és írd ki: <code>Visszafelé: pal</code></p>
<p>Ha a szó visszafelé is ugyanaz, írd ki még: <code>Ez egy tükörszó!</code></p>
""", """
Írj be egy szót: kerek
Visszafelé: kerek
Ez egy tükörszó!
""", "Kezdd üres szöveggel: forditott = \"\". Minden betűt az elejére tegyél: forditott = betu + forditott.",
"""
szo = input("Írj be egy szót: ")
forditott = ""
for betu in szo:
    forditott = betu + forditott
print(f"Visszafelé: {forditott}")
if forditott == szo:
    print("Ez egy tükörszó!")
""", [(['kerek'], ['Visszafelé: kerek', 'Ez egy tükörszó!']), (['lap'], ['Visszafelé: pal'])])

f('Erős jelszó', 'for', C, """
<p>Kérd be: <code>Új jelszó: </code></p>
<p>A jelszó akkor erős, ha legalább 8 karakter, van benne nagybetű és számjegy is.</p>
<p>Írd ki: <code>Nagybetűk: 2</code> és <code>Számjegyek: 1</code></p>
<p>Utána: <code>Erős jelszó.</code> vagy <code>Gyenge jelszó.</code></p>
""", """
Új jelszó: NyariSzunet7
Nagybetűk: 2
Számjegyek: 1
Erős jelszó.
""", "Nagybetű-e: betu.isupper(). Számjegy-e: betu.isdigit(). A hossz: len(jelszo).",
"""
jelszo = input("Új jelszó: ")
nagy = 0
szam = 0
for betu in jelszo:
    if betu.isupper():
        nagy = nagy + 1
    if betu.isdigit():
        szam = szam + 1
print(f"Nagybetűk: {nagy}")
print(f"Számjegyek: {szam}")
if len(jelszo) >= 8 and nagy > 0 and szam > 0:
    print("Erős jelszó.")
else:
    print("Gyenge jelszó.")
""", [(['NyariSzunet7'], ['Nagybetűk: 2', 'Számjegyek: 1', 'Erős jelszó.']),
      (['Ab1'], ['Nagybetűk: 1', 'Számjegyek: 1', 'Gyenge jelszó.']),
      (['hosszujelszo99'], ['Nagybetűk: 0', 'Számjegyek: 2', 'Gyenge jelszó.'])])

# ═════════════════ D: while – amíg ═════════════════

f('Gyűjtés egy fülhallgatóra', 'while', D, """
<p>Hetente 3000 Ft-ot teszel félre.</p>
<p>Kérd be: <code>Mennyibe kerül a fülhallgató? </code></p>
<p>Amíg nincs meg rá a pénz, gyűjts tovább.</p>
<p>Írd ki: <code>5 hét kell.</code></p>
""", """
Mennyibe kerül a fülhallgató? 14000
5 hét kell.
""", "while osszeg < ar: … Itt nem tudod előre, hányszor ismétel, ezért while kell.",
"""
ar = int(input("Mennyibe kerül a fülhallgató? "))
osszeg = 0
het = 0
while osszeg < ar:
    osszeg = osszeg + 3000
    het = het + 1
print(f"{het} hét kell.")
""", [(['14000'], ['5 hét kell.']), (['3000'], ['1 hét kell.']), (['30001'], ['11 hét kell.'])])

f('Merül a telefon', 'while', D, """
<p>A telefon 100%-on áll, és óránként 15%-ot merül.</p>
<p>Amíg 20%-nál több a töltöttség, vonj le 15-öt, és írd ki: <code>1. óra után: 85%</code></p>
<p>A végén: <code>Töltsd fel a telefont!</code></p>
""", """
1. óra után: 85%
2. óra után: 70%
3. óra után: 55%
4. óra után: 40%
5. óra után: 25%
6. óra után: 10%
Töltsd fel a telefont!
""", "A feltétel: while toltes > 20:",
"""
toltes = 100
ora = 0
while toltes > 20:
    toltes = toltes - 15
    ora = ora + 1
    print(f"{ora}. óra után: {toltes}%")
print("Töltsd fel a telefont!")
""", [([], ['1. óra után: 85%', '5. óra után: 25%', '6. óra után: 10%', 'Töltsd fel a telefont!'])])

f('Lift', 'while', D, """
<p>A lift a földszintről (0. emelet) indul.</p>
<p>Kérd be: <code>Hányadik emeletre mész? </code></p>
<p>Amíg nem ért fel, írd ki minden emeletet: <code>1. emelet</code>, <code>2. emelet</code> …</p>
<p>A végén: <code>Megérkeztél!</code></p>
""", """
Hányadik emeletre mész? 3
1. emelet
2. emelet
3. emelet
Megérkeztél!
""", "Legyen emelet = 0. Amíg emelet < cel: emelet + 1, és kiírod.",
"""
cel = int(input("Hányadik emeletre mész? "))
emelet = 0
while emelet < cel:
    emelet = emelet + 1
    print(f"{emelet}. emelet")
print("Megérkeztél!")
""", [(['3'], ['1. emelet', '2. emelet', '3. emelet', 'Megérkeztél!']), (['0'], ['Megérkeztél!']), (['6'], ['6. emelet', 'Megérkeztél!'])])

f('Számkitaláló', 'while', D, """
<p>A gép gondolt egy számra: <b>37</b>.</p>
<p>Kérd be újra és újra: <code>Tipp: </code></p>
<p>Ha a tipp kisebb, írd ki: <code>Nagyobb!</code>. Ha nagyobb: <code>Kisebb!</code></p>
<p>Ha eltalálta: <code>Eltaláltad 4 tippből!</code></p>
""", """
Tipp: 50
Kisebb!
Tipp: 25
Nagyobb!
Tipp: 40
Kisebb!
Tipp: 37
Eltaláltad 4 tippből!
""", "A tipp kezdőértéke legyen olyan, ami biztosan nem 37 (pl.: 0), hogy elinduljon a ciklus.",
"""
titok = 37
tipp = 0
db = 0
while tipp != titok:
    tipp = int(input("Tipp: "))
    db = db + 1
    if tipp < titok:
        print("Nagyobb!")
    elif tipp > titok:
        print("Kisebb!")
print(f"Eltaláltad {db} tippből!")
""", [(['50', '25', '40', '37'], ['Kisebb!', 'Nagyobb!', 'Kisebb!', 'Eltaláltad 4 tippből!']),
      (['37'], ['Eltaláltad 1 tippből!'])])

f('PIN-kód', 'while', D, """
<p>A telefon PIN-kódja: <b>1234</b>. Legfeljebb 3-szor próbálkozhatsz.</p>
<p>Kérd be: <code>PIN: </code></p>
<p>Ha rossz, és van még próba: <code>Hibás PIN!</code></p>
<p>Ha jó: <code>Belépés sikeres.</code> Ha háromszor rossz volt: <code>A telefon zárolva.</code></p>
""", """
PIN: 1111
Hibás PIN!
PIN: 1234
Belépés sikeres.
""", "Két feltétel kell: while pin != \"1234\" and proba < 3:",
"""
pin = ""
proba = 0
while pin != "1234" and proba < 3:
    pin = input("PIN: ")
    proba = proba + 1
    if pin != "1234" and proba < 3:
        print("Hibás PIN!")
if pin == "1234":
    print("Belépés sikeres.")
else:
    print("A telefon zárolva.")
""", [(['1111', '1234'], ['Hibás PIN!', 'Belépés sikeres.']),
      (['1', '2', '3'], ['Hibás PIN!', 'Hibás PIN!', 'A telefon zárolva.']),
      (['1234'], ['Belépés sikeres.'])])

f('Kassza', 'while', D, """
<p>A pénztáros egymás után üti be az árakat. A <b>0</b> jelenti a végét.</p>
<p>Kérd be: <code>Ár (0 = vége): </code></p>
<p>A végén írd ki: <code>Fizetendő: 1650 Ft</code> és <code>Termékek: 3 db</code></p>
""", """
Ár (0 = vége): 500
Ár (0 = vége): 650
Ár (0 = vége): 500
Ár (0 = vége): 0
Fizetendő: 1650 Ft
Termékek: 3 db
""", "Az első árat a ciklus előtt kérd be. A ciklus végén kérd be a következőt.",
"""
osszeg = 0
db = 0
ar = int(input("Ár (0 = vége): "))
while ar != 0:
    osszeg = osszeg + ar
    db = db + 1
    ar = int(input("Ár (0 = vége): "))
print(f"Fizetendő: {osszeg} Ft")
print(f"Termékek: {db} db")
""", [(['500', '650', '500', '0'], ['Fizetendő: 1650 Ft', 'Termékek: 3 db']), (['0'], ['Fizetendő: 0 Ft', 'Termékek: 0 db'])])

f('Életkor ellenőrzése', 'while', D, """
<p>Egy regisztrációnál az életkornak 1 és 120 között kell lennie.</p>
<p>Kérd be: <code>Életkor: </code></p>
<p>Amíg hibás, írd ki: <code>Hibás adat, próbáld újra!</code>, és kérd be újra.</p>
<p>Ha jó: <code>Köszönjük, 15 évesként regisztráltál.</code></p>
""", """
Életkor: 0
Hibás adat, próbáld újra!
Életkor: 150
Hibás adat, próbáld újra!
Életkor: 15
Köszönjük, 15 évesként regisztráltál.
""", "while kor < 1 or kor > 120:",
"""
kor = int(input("Életkor: "))
while kor < 1 or kor > 120:
    print("Hibás adat, próbáld újra!")
    kor = int(input("Életkor: "))
print(f"Köszönjük, {kor} évesként regisztráltál.")
""", [(['0', '150', '15'], ['Hibás adat, próbáld újra!', 'Hibás adat, próbáld újra!', 'Köszönjük, 15 évesként regisztráltál.']),
      (['42'], ['Köszönjük, 42 évesként regisztráltál.'])])

f('Vízforralás', 'while', D, """
<p>A víz 20 fokos. A forraló percenként 12 fokkal melegíti.</p>
<p>Amíg 100 foknál hidegebb, írd ki percenként: <code>1. perc: 32 fok</code></p>
<p>100 foknál többet ne írj ki: ha átlépné, legyen pont 100.</p>
<p>A végén: <code>Forr a víz!</code></p>
""", """
1. perc: 32 fok
2. perc: 44 fok
...
6. perc: 92 fok
7. perc: 100 fok
Forr a víz!
""", "Ha a hőfok 100 fölé menne, állítsd 100-ra: if fok > 100: fok = 100",
"""
fok = 20
perc = 0
while fok < 100:
    fok = fok + 12
    if fok > 100:
        fok = 100
    perc = perc + 1
    print(f"{perc}. perc: {fok} fok")
print("Forr a víz!")
""", [([], ['1. perc: 32 fok', '6. perc: 92 fok', '7. perc: 100 fok', 'Forr a víz!'])])

f('Pletyka terjedése', 'while', D, """
<p>Az első nap egy diák tud egy hírt. Minden nap kétszer annyian tudják, mint előző nap.</p>
<p>Kérd be: <code>Hány diák jár az iskolába? </code></p>
<p>Írd ki: <code>11 nap múlva mindenki tudja.</code></p>
<p>(Az 1. napon 1 diák, a 2. napon 2, a 3. napon 4 diák tudja.)</p>
""", """
Hány diák jár az iskolába? 600
11 nap múlva mindenki tudja.
""", "Indulj ebből: tudja = 1, nap = 1. Amíg tudja < diakok: duplázz, és nap + 1.",
"""
diakok = int(input("Hány diák jár az iskolába? "))
tudja = 1
nap = 1
while tudja < diakok:
    tudja = tudja * 2
    nap = nap + 1
print(f"{nap} nap múlva mindenki tudja.")
""", [(['600'], ['11 nap múlva mindenki tudja.']), (['1'], ['1 nap múlva mindenki tudja.']), (['8'], ['4 nap múlva mindenki tudja.'])])

f('Elég hosszú jelszó', 'while', D, """
<p>Egy új fiókhoz legalább 8 karakteres jelszó kell.</p>
<p>Kérd be: <code>Új jelszó: </code></p>
<p>Amíg rövidebb 8 karakternél, írd ki: <code>Túl rövid, legalább 8 karakter kell!</code>, és kérd be újra.</p>
<p>Ha jó: <code>Jelszó elmentve.</code></p>
""", """
Új jelszó: alma
Túl rövid, legalább 8 karakter kell!
Új jelszó: almafa2026
Jelszó elmentve.
""", "A szöveg hossza: len(jelszo). while len(jelszo) < 8:",
"""
jelszo = input("Új jelszó: ")
while len(jelszo) < 8:
    print("Túl rövid, legalább 8 karakter kell!")
    jelszo = input("Új jelszó: ")
print("Jelszó elmentve.")
""", [(['alma', 'almafa2026'], ['Túl rövid, legalább 8 karakter kell!', 'Jelszó elmentve.']), (['kandokando'], ['Jelszó elmentve.']),
      (['a', 'ab', '12345678'], ['Túl rövid', 'Túl rövid', 'Jelszó elmentve.'])])

# ═════════════════ E: while – vegyes ═════════════════

f('Hangerő', 'while', E, """
<p>A telefon hangereje most 5. A legkisebb 0, a legnagyobb 10.</p>
<p>Kérd be újra és újra: <code>Gomb (+ / - / ok): </code></p>
<p><code>+</code>: eggyel hangosabb, <code>-</code>: eggyel halkabb. Utána írd ki: <code>Hangerő: 6</code></p>
<p>10 fölé és 0 alá nem mehet. Az <code>ok</code>-ra álljon le, és írja ki: <code>Beállítva: 6</code></p>
""", """
Gomb (+ / - / ok): +
Hangerő: 6
Gomb (+ / - / ok): +
Hangerő: 7
Gomb (+ / - / ok): ok
Beállítva: 7
""", "Amíg a gomb nem ok: if gomb == \"+\" and hangero < 10: …",
"""
hangero = 5
gomb = input("Gomb (+ / - / ok): ")
while gomb != "ok":
    if gomb == "+" and hangero < 10:
        hangero = hangero + 1
    elif gomb == "-" and hangero > 0:
        hangero = hangero - 1
    print(f"Hangerő: {hangero}")
    gomb = input("Gomb (+ / - / ok): ")
print(f"Beállítva: {hangero}")
""", [(['+', '+', 'ok'], ['Hangerő: 6', 'Hangerő: 7', 'Beállítva: 7']),
      (['-', '-', '-', '-', '-', '-', 'ok'], ['Hangerő: 4', 'Hangerő: 0', 'Hangerő: 0', 'Beállítva: 0']),
      (['+'] * 7 + ['ok'], ['Hangerő: 10', 'Hangerő: 10', 'Beállítva: 10'])])

f('Szintlépés', 'while', E, """
<p>Egy játékban az 1. szintről a 2.-ra 100 XP kell, a 2.-ról a 3.-ra 200 XP, és így tovább (szint * 100).</p>
<p>Kérd be: <code>Összegyűjtött XP: </code></p>
<p>Írd ki: <code>Szint: 3</code> és <code>Maradék XP: 50</code></p>
""", """
Összegyűjtött XP: 350
Szint: 3
Maradék XP: 50
""", "Kezdj az 1. szinten. Amíg van elég XP a következőhöz: vond le, és lépj szintet.",
"""
xp = int(input("Összegyűjtött XP: "))
szint = 1
while xp >= szint * 100:
    xp = xp - szint * 100
    szint = szint + 1
print(f"Szint: {szint}")
print(f"Maradék XP: {xp}")
""", [(['350'], ['Szint: 3', 'Maradék XP: 50']), (['99'], ['Szint: 1', 'Maradék XP: 99']), (['1000'], ['Szint: 5', 'Maradék XP: 0']), (['650'], ['Szint: 4', 'Maradék XP: 50'])])

f('Mozijegyek', 'while', E, """
<p>A moziteremben 20 hely van.</p>
<p>Kérd be újra és újra: <code>Hány jegyet kérsz? </code> A 0 jelenti a pénztár zárását.</p>
<p>Ha van elég hely: <code>Jegyek kiadva. Szabad helyek: 15</code></p>
<p>Ha nincs elég: <code>Nincs ennyi szabad hely!</code></p>
<p>Ha elfogyott minden hely, írd ki: <code>Telt ház!</code>, és álljon le.</p>
""", """
Hány jegyet kérsz? 5
Jegyek kiadva. Szabad helyek: 15
Hány jegyet kérsz? 16
Nincs ennyi szabad hely!
Hány jegyet kérsz? 15
Jegyek kiadva. Szabad helyek: 0
Telt ház!
""", "Két dolog állíthatja le: a 0 kérés vagy a 0 szabad hely. Figyeld mindkettőt.",
"""
szabad = 20
keres = -1
while szabad > 0 and keres != 0:
    keres = int(input("Hány jegyet kérsz? "))
    if keres > szabad:
        print("Nincs ennyi szabad hely!")
    elif keres > 0:
        szabad = szabad - keres
        print(f"Jegyek kiadva. Szabad helyek: {szabad}")
if szabad == 0:
    print("Telt ház!")
""", [(['5', '16', '15'], ['Szabad helyek: 15', 'Nincs ennyi szabad hely!', 'Szabad helyek: 0', 'Telt ház!']),
      (['3', '0'], ['Szabad helyek: 17'])])

f('Részletfizetés', 'while', E, """
<p>Telefont veszel részletre.</p>
<p>Kérd be: <code>A telefon ára: </code> és <code>Havi részlet: </code></p>
<p>Minden hónapban írd ki: <code>1. hónap után hátralék: 90000 Ft</code></p>
<p>Az utolsó hónapban csak a maradékot fizeted, a hátralék nem lehet kevesebb 0-nál.</p>
""", """
A telefon ára: 100000
Havi részlet: 30000
1. hónap után hátralék: 70000 Ft
2. hónap után hátralék: 40000 Ft
3. hónap után hátralék: 10000 Ft
4. hónap után hátralék: 0 Ft
""", "Ha a hátralék kisebb, mint a részlet, csak a hátralékot vond le.",
"""
hatralek = int(input("A telefon ára: "))
reszlet = int(input("Havi részlet: "))
honap = 0
while hatralek > 0:
    if hatralek < reszlet:
        hatralek = 0
    else:
        hatralek = hatralek - reszlet
    honap = honap + 1
    print(f"{honap}. hónap után hátralék: {hatralek} Ft")
""", [(['100000', '30000'], ['1. hónap után hátralék: 70000 Ft', '3. hónap után hátralék: 10000 Ft', '4. hónap után hátralék: 0 Ft']),
      (['60000', '20000'], ['3. hónap után hátralék: 0 Ft'])])

f('Heti futócél', 'while', E, """
<p>Ezen a héten 20 km-t szeretnél futni.</p>
<p>Kérd be naponta: <code>Mai futás (km): </code>, amíg össze nem jön a 20 km.</p>
<p>Írd ki: <code>4 nap alatt megvan a cél: 21 km</code></p>
""", """
Mai futás (km): 5
Mai futás (km): 6
Mai futás (km): 3
Mai futás (km): 7
4 nap alatt megvan a cél: 21 km
""", "Amíg az összeg kisebb, mint 20, kérj be újabb napot.",
"""
osszeg = 0
nap = 0
while osszeg < 20:
    km = int(input("Mai futás (km): "))
    osszeg = osszeg + km
    nap = nap + 1
print(f"{nap} nap alatt megvan a cél: {osszeg} km")
""", [(['5', '6', '3', '7'], ['4 nap alatt megvan a cél: 21 km']), (['25'], ['1 nap alatt megvan a cél: 25 km'])])

f('Visszajáró pénz', 'while', E, """
<p>A pénztárgép a visszajárót a lehető legkevesebb pénzzel adja ki.</p>
<p>Címletek: 20000, 10000, 5000, 2000, 1000, 500, 200, 100, 50, 20, 10, 5.</p>
<p>Kérd be: <code>Visszajáró: </code> (5-tel osztható szám)</p>
<p>Írd ki címletenként, ami kell: <code>2000 Ft: 1 db</code></p>
""", """
Visszajáró: 3270
2000 Ft: 1 db
1000 Ft: 1 db
200 Ft: 1 db
50 Ft: 1 db
20 Ft: 1 db
""", "A címleteken for-ral menj végig. Mindegyiknél while: amíg a maradék >= címlet, vond le és számold.",
"""
maradek = int(input("Visszajáró: "))
for cimlet in [20000, 10000, 5000, 2000, 1000, 500, 200, 100, 50, 20, 10, 5]:
    db = 0
    while maradek >= cimlet:
        maradek = maradek - cimlet
        db = db + 1
    if db > 0:
        print(f"{cimlet} Ft: {db} db")
""", [(['3270'], ['2000 Ft: 1 db', '1000 Ft: 1 db', '200 Ft: 1 db', '50 Ft: 1 db', '20 Ft: 1 db']),
      (['45615'], ['20000 Ft: 2 db', '5000 Ft: 1 db', '500 Ft: 1 db', '100 Ft: 1 db', '10 Ft: 1 db', '5 Ft: 1 db'])])

f('Hőmérő napló', 'while', E, """
<p>Egymás után írod be a mért hőmérsékleteket. Ha végeztél, írd be: <code>vége</code></p>
<p>Kérd be: <code>Mérés: </code></p>
<p>Írd ki: <code>Mérések: 4</code>, <code>Átlag: 12.5</code> (egy tizedesre), <code>Legmelegebb: 18</code></p>
""", """
Mérés: 8
Mérés: 12
Mérés: 18
Mérés: 12
Mérés: vége
Mérések: 4
Átlag: 12.5
Legmelegebb: 18
""", "A bemenetet szövegként kérd be. Csak akkor alakítsd számmá, ha nem „vége”.",
"""
db = 0
osszeg = 0
legmelegebb = -1000
meres = input("Mérés: ")
while meres != "vége":
    fok = int(meres)
    db = db + 1
    osszeg = osszeg + fok
    if fok > legmelegebb:
        legmelegebb = fok
    meres = input("Mérés: ")
print(f"Mérések: {db}")
print(f"Átlag: {round(osszeg / db, 1)}")
print(f"Legmelegebb: {legmelegebb}")
""", [(['8', '12', '18', '12', 'vége'], ['Mérések: 4', 'Átlag: 12.5', 'Legmelegebb: 18']),
      (['-2', '-5', 'vége'], ['Mérések: 2', 'Átlag: -3.5', 'Legmelegebb: -2'])])

f('Darts 501', 'while', E, """
<p>A darts játékban 501 pontról indulsz, és 0-ra kell lejutnod.</p>
<p>Kérd be újra és újra: <code>Dobás: </code></p>
<p>Ha a dobás több, mint a maradék, írd ki: <code>Túldobás!</code>, és ne vond le.</p>
<p>Különben vond le, és írd ki: <code>Maradt: 321</code></p>
<p>Ha 0 lett: <code>Nyertél 4 dobásból!</code> (a túldobás is számít dobásnak)</p>
""", """
Dobás: 180
Maradt: 321
Dobás: 300
Maradt: 21
Dobás: 40
Túldobás!
Dobás: 21
Maradt: 0
Nyertél 4 dobásból!
""", "while pont > 0: … A túldobást if-fel kezeld.",
"""
pont = 501
db = 0
while pont > 0:
    dobas = int(input("Dobás: "))
    db = db + 1
    if dobas > pont:
        print("Túldobás!")
    else:
        pont = pont - dobas
        print(f"Maradt: {pont}")
print(f"Nyertél {db} dobásból!")
""", [(['180', '300', '40', '21'], ['Maradt: 321', 'Maradt: 21', 'Túldobás!', 'Maradt: 0', 'Nyertél 4 dobásból!']),
      (['501'], ['Maradt: 0', 'Nyertél 1 dobásból!'])])

f('Napsütéses sorozat', 'for', E, """
<p>Egy hónap időjárását jegyezted: <code>n</code> = napos, <code>f</code> = felhős.</p>
<p>Kérd be egyben, szövegként: <code>Időjárás: </code> (pl.: <code>nnfnnnfn</code>)</p>
<p>Keresd meg, hány napos nap volt egymás után a leghosszabb sorozatban.</p>
<p>Írd ki: <code>Leghosszabb napos sorozat: 3 nap</code></p>
""", """
Időjárás: nnfnnnfn
Leghosszabb napos sorozat: 3 nap
""", "Számold a mostani sorozatot. Felhős napnál nullázd. Mindig nézd meg, nagyobb-e az eddigi legjobbnál.",
"""
idojaras = input("Időjárás: ")
most = 0
leg = 0
for nap in idojaras:
    if nap == "n":
        most = most + 1
        if most > leg:
            leg = most
    else:
        most = 0
print(f"Leghosszabb napos sorozat: {leg} nap")
""", [(['nnfnnnfn'], ['Leghosszabb napos sorozat: 3 nap']), (['ffff'], ['Leghosszabb napos sorozat: 0 nap']),
      (['nnnnnfnn'], ['Leghosszabb napos sorozat: 5 nap'])])

f('Kettes számrendszer', 'while', E, """
<p>A számítógép kettes számrendszerben tárol mindent.</p>
<p>Kérd be: <code>Szám: </code> (pozitív egész)</p>
<p>Váltsd át kettes számrendszerbe maradékos osztással, while ciklussal.</p>
<p>Írd ki: <code>Kettesben: 1101</code></p>
""", """
Szám: 13
Kettesben: 1101
""", "Amíg szam > 0: a maradék (szam % 2) a szöveg ELEJÉRE kerül, utána szam = szam // 2.",
"""
szam = int(input("Szám: "))
eredmeny = ""
while szam > 0:
    eredmeny = str(szam % 2) + eredmeny
    szam = szam // 2
print(f"Kettesben: {eredmeny}")
""", [(['13'], ['Kettesben: 1101']), (['255'], ['Kettesben: 11111111']), (['8'], ['Kettesben: 1000'])])


TEMAK = [
    dict(id='for', cim='for ciklus', leiras='Ismétlés range()-dzsel, összegzés, számlálás, szöveg betűnként – def nélkül.',
         F=[x for x in F if x['kell'] == 'for']),
    dict(id='while', cim='while ciklus', leiras='Ismétlés, amíg igaz a feltétel: bekérés, ellenőrzés, gyűjtés – def nélkül.',
         F=[x for x in F if x['kell'] == 'while']),
]
