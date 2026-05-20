# Vizsgafeladatok 2026 – Python dolgozat

> Összeállította: Sándorné Feke Réka  
> 4 db 8 pontos · 4 db 14 pontos · 4 db 18 pontos

---

## 8 PONTOS FELADATOK (if / elif)

---

### V1. Szállodai minősítés (8 pont)

**Feladatleírás:**

Írj programot, amely bekéri a szálloda értékelését 1-től 5 csillagig, majd kiírja a véleményt!

- 1 csillag: `Szörnyű! Soha többé.`
- 2 csillag: `Gyenge. Nem ajánlom.`
- 3 csillag: `Közepes. Volt jobb is, volt rosszabb is.`
- 4 csillag: `Jó! Visszajövök.`
- 5 csillag: `Kiváló! Mindenkinek ajánlom!`

**Minta kimenet:**
```
Értékeld a szállodát (1-5 csillag): 4
Jó! Visszajövök.

Értékeld a szállodát (1-5 csillag): 1
Szörnyű! Soha többé.

Értékeld a szállodát (1-5 csillag): 5
Kiváló! Mindenkinek ajánlom!
```

**Megoldás:**
```python
ertekeles = int(input("Értékeld a szállodát (1-5 csillag): "))
if ertekeles == 1:
    print("Szörnyű! Soha többé.")
elif ertekeles == 2:
    print("Gyenge. Nem ajánlom.")
elif ertekeles == 3:
    print("Közepes. Volt jobb is, volt rosszabb is.")
elif ertekeles == 4:
    print("Jó! Visszajövök.")
else:
    print("Kiváló! Mindenkinek ajánlom!")
```

**Pontozási útmutató (feladatok.txt formátum):**
```
bekeres:Értékeld a szállodát (1-5 csillag): |Bekérés szövege: "Értékeld a szállodát (1-5 csillag): "|Pontosan kell a szöveg zárójelekkel és kettősponttal! 🏨|✅ A bekérés szövege tökéletesen egyezik!
int_float:1|Az értékelést egész számmá alakítja|Az input() szöveget ad vissza – mivel alakítod számmá? 🔢|🔢 Az értékelés számként vizsgálható!
if|Elágazást használ|Öt kategória van – melyik kulcsszóval indítod az elágazást? 🌟|🌟 Az elágazás elindul – a program dönteni tud!
elif|elif ágat is tartalmaz|Az if után mi jön a következő értékelési kategóriához? 🔀|🔀 Az elif megvan – minden csillagszámnak megvan a saját ága!
teszt:1:Szörnyű|1 csillag esetén "Szörnyű" üzenetet ír|1 csillag – ez a legrosszabb értékelés. Mit ír ki a programod? 😞|😞 Szörnyű! Az 1 csillagos vendég soha nem jön vissza!
teszt:3:Közepes|3 csillag esetén "Közepes" üzenetet ír|3 csillag – sem rossz, sem jó. Melyik ágon fut át a program? 🤷|🤷 Közepes – bőven van fejlődési lehetőség!
teszt:5:Kiváló|5 csillag esetén "Kiváló" üzenetet ír|5 csillag – ez a legjobb! Mit ír ki? 🌟|🌟 Kiváló! A szálloda büszke lehet magára!
tartalmaz:Visszajövök|A 4 csillagos üzenetben szerepel "Visszajövök"|4 csillag esetén az üzenet tartalmazza a "Visszajövök" szót? 🔄|🔄 Visszajövök – a vendég elégedett volt!
```

---

### V2. Sportverseny dobogó (8 pont)

**Feladatleírás:**

Egy iskolai sportverseny eredményhirdetőjét kell megírni. A program bekéri a helyezést (egész szám), majd kiírja az eredményt:

- 1. hely: `Gratulálok! Aranyérem!`
- 2. hely: `Brávó! Ezüstérem!`
- 3. hely: `Szép! Bronzérem!`
- 4. hely vagy rosszabb: `Köszönjük a részvételt!`

**Minta kimenet:**
```
Hányadik lettél a versenyen? 1
Gratulálok! Aranyérem!

Hányadik lettél a versenyen? 3
Szép! Bronzérem!

Hányadik lettél a versenyen? 10
Köszönjük a részvételt!
```

**Megoldás:**
```python
helyezes = int(input("Hányadik lettél a versenyen? "))
if helyezes == 1:
    print("Gratulálok! Aranyérem!")
elif helyezes == 2:
    print("Brávó! Ezüstérem!")
elif helyezes == 3:
    print("Szép! Bronzérem!")
else:
    print("Köszönjük a részvételt!")
```

**Pontozási útmutató (feladatok.txt formátum):**
```
bekeres:Hányadik lettél a versenyen? |Bekérés szövege: "Hányadik lettél a versenyen? "|Pontosan kell a szöveg kérdőjellel és szóközzel! 🏅|✅ A bekérés szövege tökéletesen egyezik!
int_float:1|A helyezést egész számmá alakítja|Az input() szöveget ad vissza – mivel alakítod számmá? 🔢|🔢 A helyezés számként vizsgálható!
if|Elágazást használ|Négy eset van – melyik kulcsszóval indítod? 🥇|🥇 Az elágazás elindul – a program ítélni tud!
elif|elif ágat is tartalmaz|Az arany után mi jön az ezüsthöz és bronzhoz? 🔀|🔀 Az elif megvan – minden helyezésnek megvan a saját ága!
teszt:1:Aranyérem|1. helyen aranyérem üzenet jelenik meg|1. hely – a legjobb! Mit ír ki a programod? 🥇|🥇 Aranyérem! Az első helyezett megkapja a jutalmát!
teszt:2:Ezüstérem|2. helyen ezüstérem üzenet jelenik meg|2. hely – majdnem az első! Mit ír ki? 🥈|🥈 Ezüstérem – szép teljesítmény!
teszt:3:Bronzérem|3. helyen bronzérem üzenet jelenik meg|3. hely – dobogón állhatsz! Mit ír ki? 🥉|🥉 Bronzérem – a dobogó harmadik fokán!
tartalmaz:részvételt|4. helytől "részvételt" szót tartalmaz a kimenet|Ha valaki 4. vagy annál rosszabb, mi az üzenet? Benne van a "részvételt" szó? 🤝|🤝 Köszönjük a részvételt – mindenki versenyző számít!
```

---

### V3. Öltözet hőmérséklet alapján (8 pont)

**Feladatleírás:**

Írj programot, amely bekéri a kinti hőmérsékletet (egész szám, °C-ban), majd tanácsot ad, mit érdemes felvenni!

- 5 fok alatt: `Kabát kötelező!`
- 5–15 fok: `Pulóver elég lesz.`
- 15–25 fok: `Elég egy póló.`
- 25 fok felett: `Rövidnadrág és szandál!`

**Minta kimenet:**
```
Mennyi a hőmérséklet? (°C): -3
Kabát kötelező!

Mennyi a hőmérséklet? (°C): 10
Pulóver elég lesz.

Mennyi a hőmérséklet? (°C): 20
Elég egy póló.

Mennyi a hőmérséklet? (°C): 30
Rövidnadrág és szandál!
```

**Megoldás:**
```python
fok = int(input("Mennyi a hőmérséklet? (°C): "))
if fok < 5:
    print("Kabát kötelező!")
elif fok <= 15:
    print("Pulóver elég lesz.")
elif fok <= 25:
    print("Elég egy póló.")
else:
    print("Rövidnadrág és szandál!")
```

**Pontozási útmutató (feladatok.txt formátum):**
```
bekeres:Mennyi a hőmérséklet? (°C): |Bekérés szövege: "Mennyi a hőmérséklet? (°C): "|Pontosan kell a szöveg zárójelekkel és kettősponttal! 🌡️|✅ A bekérés szövege tökéletesen egyezik!
int_float:1|A hőmérsékletet egész számmá alakítja|Az input() szöveget ad vissza – mivel alakítod számmá? 🔢|🔢 A hőmérséklet számként vizsgálható!
if|Elágazást használ|Négy öltözeti kategória van – melyik kulcsszóval indítod? 🧥|🧥 Az elágazás elindul – a program tud tanácsot adni!
elif|elif ágat is tartalmaz|Az első kategória után mi jön a következőhöz? 🔀|🔀 Az elif megvan – minden hőmérséklet-sávnak megvan a saját ága!
teszt:-3:Kabát kötelező|0 fok alatt kabát üzenet jelenik meg|-3 fok – ez 5 alatt van. Mit ír ki a programod? 🧥|🧥 Kabát kötelező! Hideg van!
teszt:10:Pulóver|5–15 fok között pulóver üzenet jelenik meg|10 fok – melyik sávba esik? Mit javasol? 🧶|🧶 Pulóver elég lesz – kellemes őszi idő!
teszt:20:póló|15–25 fok között póló üzenet jelenik meg|20 fok – meleg van, de nem nyári hőség. Mit ír ki? 👕|👕 Elég egy póló – szép tavasz!
teszt:30:Rövidnadrág|25 fok felett rövidnadrág üzenet jelenik meg|30 fok – igazi nyár! Mit javasol a program? ☀️|☀️ Rövidnadrág és szandál – strandra fel!
```

---

### V4. Csomagküldési díj (8 pont)

**Feladatleírás:**

Írj programot, amely bekéri a csomag súlyát kilogrammban (egész szám), majd kiírja a szállítási díjat!

- 2 kg-ig: `Kis csomag: 500 Ft`
- 3–5 kg: `Közepes csomag: 900 Ft`
- 6–20 kg: `Nagy csomag: 1800 Ft`
- 20 kg felett: `Túlméretezett csomag: 3500 Ft`

**Minta kimenet:**
```
Add meg a csomag súlyát (kg): 1
Kis csomag: 500 Ft

Add meg a csomag súlyát (kg): 4
Közepes csomag: 900 Ft

Add meg a csomag súlyát (kg): 10
Nagy csomag: 1800 Ft

Add meg a csomag súlyát (kg): 25
Túlméretezett csomag: 3500 Ft
```

**Megoldás:**
```python
suly = int(input("Add meg a csomag súlyát (kg): "))
if suly <= 2:
    print("Kis csomag: 500 Ft")
elif suly <= 5:
    print("Közepes csomag: 900 Ft")
elif suly <= 20:
    print("Nagy csomag: 1800 Ft")
else:
    print("Túlméretezett csomag: 3500 Ft")
```

**Pontozási útmutató (feladatok.txt formátum):**
```
bekeres:Add meg a csomag súlyát (kg): |Bekérés szövege: "Add meg a csomag súlyát (kg): "|Pontosan kell a szöveg zárójelekkel és kettősponttal! 📦|✅ A bekérés szövege tökéletesen egyezik!
int_float:1|A súlyt egész számmá alakítja|Az input() szöveget ad vissza – mivel alakítod számmá? 🔢|🔢 A súly számként vizsgálható!
if|Elágazást használ|Négy kategória van – melyik kulcsszóval indítod az elágazást? 📦|📦 Az elágazás elindul – a futár tudja a díjat!
elif|elif ágat is tartalmaz|Az első kategória után mi jön a következőhöz? 🔀|🔀 Az elif megvan – minden súlysávnak megvan a saját ága!
teszt:1:Kis csomag|2 kg-ig Kis csomag kategória|1 kg – ez 2 kg alatt van. Mit ír ki? 📦|📦 Kis csomag – könnyű, olcsó szállítás!
teszt:4:Közepes csomag|3–5 kg között Közepes csomag kategória|4 kg – melyik sávba esik? Mit ír ki? 📦|📦 Közepes csomag – közepes díj!
teszt:10:Nagy csomag|6–20 kg között Nagy csomag kategória|10 kg – ez 5 és 20 kg közé esik. Mit ír ki? 📦|📦 Nagy csomag – komolyabb szállítás!
tartalmaz:Ft|Az árakat Ft-ban írja ki|Minden kategóriánál "Ft"-nak kell szerepelnie a kimenetben! 💰|💰 Az ár Ft-ban megjelenik – a futár tud számlát adni!
```

---

## 14 PONTOS FELADATOK (for ciklus, függvény)

---

### V4. Önkiszolgáló kassza (14 pont)

**Feladatleírás:**

Az önkiszolgáló kasszán gyümölcsöket lehet vásárolni. A program 4 terméket dolgoz fel egymás után.

Írj egy `Ar` nevű függvényt! A függvény kapja meg a termék kódját (egész szám). Az árak:
- `1` → alma: 400 Ft
- `2` → banán: 600 Ft
- `3` → körte: 350 Ft
- bármi más → 0 Ft (hibás kód)

A főprogramban:
- Hozz létre egy összegző változót (kezdőértéke 0)!
- Készíts egy ciklust, amely pontosan **4-szer** fut le!
- A cikluson belül kérd be a termék kódját az `"{i}. termék kódja: "` szövegekkel!
- Hívd meg az `Ar` függvényt, és ha az ár nagyobb mint 0, írd ki: `"Tétel ára: X Ft"`, és add hozzá az összeghez!
- Ha az ár 0, írd ki: `"Hibás kód!"`
- A ciklus után írd ki: `"Fizetendő összeg: X Ft"`

**Minta kimenet:**
```
1. termék kódja: 1
Tétel ára: 400 Ft
2. termék kódja: 2
Tétel ára: 600 Ft
3. termék kódja: 3
Tétel ára: 350 Ft
4. termék kódja: 0
Hibás kód!
Fizetendő összeg: 1350 Ft
```

**Megoldás:**
```python
def Ar(kod):
    if kod == 1:
        return 400
    elif kod == 2:
        return 600
    elif kod == 3:
        return 350
    else:
        return 0

osszeg = 0

for i in range(1, 5):
    kod = int(input(f"{i}. termék kódja: "))
    ar = Ar(kod)
    if ar > 0:
        print(f"Tétel ára: {ar} Ft")
        osszeg += ar
    else:
        print("Hibás kód!")

print(f"Fizetendő összeg: {osszeg} Ft")
```

**Pontozási útmutató (feladatok.txt formátum):**
```
def|Függvényt definiál (def)|Az árszámítót függvényként kell megírni. Melyik kulcsszóval hozod létre? 🛠️|🛠️ Az Ar függvény megalkotva – a kassza tudja az árakat!
return|Függvény visszatérési értéket ad (return)|A függvény visszaadja az árat – melyik kulcsszóval? 📤|📤 A return megvan – az ár visszaér a főprogramba!
tartalmaz:Ar|Ar névvel írja a függvényt|A függvénynek pontosan "Ar" a neve – az A nagybetű! 🔤|🔤 A függvény neve tökéletesen egyezik!
int_float:1|A kódot egész számmá alakítja|Az input() szöveget ad vissza – mivel alakítod számmá? 🔢|🔢 A kód számként vizsgálható!
for|For ciklust használ (pontosan 4 alkalommal)|A ciklus pontosan 4-szer fusson le. Hogyan adod meg? 🔄|🔄 A for ciklus pontosan 4-szer forog – minden termék sorra kerül!
tartalmaz:termék kódja: |A bekérés szövege tartalmazza: "termék kódja: "|A bekérésnél szerepel a "termék kódja: " szövegrész? 🛒|✅ A bekérés szövege megvan!
if|Elágazást használ az ár vizsgálatához|Ha az ár nagyobb mint 0, elfogadja – melyik kulcsszóval döntesz? 🌿|🌿 Az elágazás megvan – a kassza tud dönteni!
tartalmaz:Tétel ára|"Tétel ára:" szöveget tartalmazza a kód|Helyes kódnál mit ír ki a program? A "Tétel ára" szó benne van? 🧾|🧾 Tétel ára kiírva – a vásárló látja az árat!
tartalmaz:Hibás kód|"Hibás kód!" szöveget tartalmazza a kód|Ha érvénytelen kódot adnak meg, mit ír ki? ❌|❌ Hibás kód! A kassza visszautasítja!
tartalmaz:400|Az alma 400 Ft-os árát tartalmazza|Mennyi az alma ára? Szerepel ez a szám a kódban? 🍎|🍎 400 Ft – az alma ára megvan!
teszt:1,2,3,0:Tétel ára|Helyes kódra kiírja a tétel árát|1=alma, 2=banán, 3=körte → megjelenik "Tétel ára" az outputban? 🛒|🛒 Tétel ára megjelenik – a kassza elfogadja!
teszt:1,2,3,0:Hibás kód|Érvénytelen kódra hibaüzenetet ír|0-s kód nem létezik – felismeri a programod? ❌|❌ Hibás kód – a kassza visszautasítja!
teszt:1,2,3,0:1350 Ft|Az összeget helyesen számolja (400+600+350+0=1350)|alma+banán+körte+hibás → mennyi a végösszeg? 🧮|🧮 1350 Ft – a végösszeg helyes!
teszt:1,1,1,1:1600 Ft|Négy azonos terméknél helyesen számol (4×400=1600)|Ha mindenki almát vesz, 4×400=1600 Ft. Kijön ez? 🍎|🍎 1600 Ft – négy alma ára helyes!
```

---

### V5. Uszoda látogatottsága (14 pont)

**Feladatleírás:**

Egy uszoda heti látogatottságát elemezzük. A cél: napi 100 látogató. Írj programot, amely elvégzi az elemzést!

Írj egy `Forgalmas` nevű függvényt! A függvény kapja meg a napi látogatók számát. Ha a szám **nagyobb, mint 100**, adjon vissza `"Forgalmas nap!"` szöveget, egyébként `"Csendes nap."` szöveget!

A főprogramban:
- Hozz létre egy számlálót a forgalmas napoknak (kezdőértéke 0)!
- Készíts egy ciklust, amely pontosan **7-szer** fut le (a hét minden napjára)!
- A cikluson belül kérd be a látogatók számát az `"{i}. nap látogatói: "` szövegekkel!
- Hívd meg a `Forgalmas` függvényt, és írd ki az eredményét!
- Ha a nap forgalmas volt, növeld a számlálót!
- A ciklus után írd ki: `"A héten X forgalmas nap volt."`

**Minta kimenet:**
```
1. nap látogatói: 50
Csendes nap.
2. nap látogatói: 150
Forgalmas nap!
3. nap látogatói: 80
Csendes nap.
4. nap látogatói: 200
Forgalmas nap!
5. nap látogatói: 90
Csendes nap.
6. nap látogatói: 120
Forgalmas nap!
7. nap látogatói: 60
Csendes nap.
A héten 3 forgalmas nap volt.
```

**Megoldás:**
```python
def Forgalmas(latogatok):
    if latogatok > 100:
        return "Forgalmas nap!"
    else:
        return "Csendes nap."

forgalmas_napok = 0

for i in range(1, 8):
    szam = int(input(f"{i}. nap látogatói: "))
    eredmeny = Forgalmas(szam)
    print(eredmeny)
    if eredmeny == "Forgalmas nap!":
        forgalmas_napok += 1

print(f"A héten {forgalmas_napok} forgalmas nap volt.")
```

**Pontozási útmutató (feladatok.txt formátum):**
```
def|Függvényt definiál (def)|A nap elemzését függvényként kell megírni. Melyik kulcsszóval hozod létre? 🛠️|🛠️ A Forgalmas függvény megalkotva – az uszoda elemzője kész!
return|Függvény visszatérési értéket ad (return)|A függvény "Forgalmas nap!" vagy "Csendes nap." szöveget ad vissza – melyik kulcsszóval? 📤|📤 A return megvan – az értékelés visszaér!
tartalmaz:Forgalmas|Forgalmas névvel írja a függvényt|A függvénynek pontosan "Forgalmas" a neve – az F nagy! 🔤|🔤 A függvény neve tökéletesen egyezik!
int_float:1|A látogatószámot egész számmá alakítja|Az input() szöveget ad vissza – mivel alakítod számmá? 🔢|🔢 A látogatószám számként vizsgálható!
for|For ciklust használ (pontosan 7 alkalommal)|A ciklus pontosan 7-szer fusson le. Hogyan adod meg? 🔄|🔄 A for ciklus pontosan 7-szer forog – minden napra sor kerül!
tartalmaz:nap látogatói: |A bekérés szövege tartalmazza: "nap látogatói: "|A bekérésnél szerepel a "nap látogatói: " szövegrész? 🏊|✅ A bekérés szövege megvan!
if|Elágazást használ|100 felett forgalmas, alatta csendes – melyik kulcsszóval döntesz? 🌊|🌊 Az elágazás megvan – az uszoda tudja az eredményt!
tartalmaz:Forgalmas nap|"Forgalmas nap!" szöveget tartalmazza a kód|Ha a látogatószám > 100, mit ad vissza a függvény? Pontosan kell: "Forgalmas nap!" 🎉|🎉 Forgalmas nap! Az uszoda tele van!
tartalmaz:Csendes|"Csendes nap." szöveget tartalmazza a kód|Ha a látogatószám <= 100, mit ad vissza? A "Csendes" szó benne van? 😴|😴 Csendes nap – kevés a vendég!
tartalmaz:100|A 100-as határt tartalmazza a kód|A határ 100 látogató – szerepel ez a szám a kódban? 🔍|📊 A 100-as határ megvan a kódban!
teszt:50,150,80,200,90,120,60:Forgalmas nap|Forgalmas napot helyesen ismer fel|150 látogató – ez 100 felett van. Mit ír ki? 🎉|🎉 Forgalmas nap felismerve – az uszoda zsúfolt!
teszt:50,150,80,200,90,120,60:Csendes nap|Csendes napot helyesen ismer fel|50 látogató – ez 100 alatt van. Mit ír ki? 😌|😌 Csendes nap felismerve – kevés a látogató!
teszt:50,150,80,200,90,120,60:3 forgalmas|Három forgalmas napot számol meg|A héten 150, 200, 120 volt 100 felett – összesen 3 forgalmas nap. Kijön ez? 🧮|🧮 3 forgalmas nap helyesen megszámolva!
teszt:10,10,10,10,10,10,10:0 forgalmas|Ha minden nap csendes, 0 forgalmas napot ír|Ha minden nap csak 10 látogató jön, hány forgalmas nap van? 📉|📉 0 forgalmas nap – az uszoda üres volt egész héten!
```

---

### V6. Havi megtakarítás (14 pont)

**Feladatleírás:**

Egy fiatal 6 hónapon át próbál megtakarítani. A cél: havi 20 000 Ft. Írj programot, amely elemzi a megtakarításokat!

Írj egy `Siker` nevű függvényt! A függvény kapja meg a havi megtakarítás összegét. Ha az összeg **legalább 20 000 Ft**, adjon vissza `"Sikerült!"` szöveget, egyébként `"Nem sikerült."` szöveget!

A főprogramban:
- Hozz létre egy számlálót a sikeres hónapoknak (kezdőértéke 0)!
- Készíts egy ciklust, amely pontosan **6-szor** fut le!
- A cikluson belül kérd be az összeget az `"{i}. hónap megtakarítása (Ft): "` szövegekkel!
- Hívd meg a `Siker` függvényt, és írd ki az eredményét!
- Ha sikerült, növeld a számlálót!
- A ciklus után írd ki: `"X hónapban sikerült a cél!"`

**Minta kimenet:**
```
1. hónap megtakarítása (Ft): 25000
Sikerült!
2. hónap megtakarítása (Ft): 15000
Nem sikerült.
3. hónap megtakarítása (Ft): 20000
Sikerült!
4. hónap megtakarítása (Ft): 18000
Nem sikerült.
5. hónap megtakarítása (Ft): 22000
Sikerült!
6. hónap megtakarítása (Ft): 30000
Sikerült!
4 hónapban sikerült a cél!
```

**Megoldás:**
```python
def Siker(osszeg):
    if osszeg >= 20000:
        return "Sikerült!"
    else:
        return "Nem sikerült."

sikeres_honapok = 0

for i in range(1, 7):
    osszeg = int(input(f"{i}. hónap megtakarítása (Ft): "))
    eredmeny = Siker(osszeg)
    print(eredmeny)
    if eredmeny == "Sikerült!":
        sikeres_honapok += 1

print(f"{sikeres_honapok} hónapban sikerült a cél!")
```

**Pontozási útmutató (feladatok.txt formátum):**
```
def|Függvényt definiál (def)|A minősítést függvényként kell megírni. Melyik kulcsszóval hozod létre? 🛠️|🛠️ A Siker függvény megalkotva – az elemzés kész!
return|Függvény visszatérési értéket ad (return)|A függvény "Sikerült!" vagy "Nem sikerült." szöveget ad vissza – melyik kulcsszóval? 📤|📤 A return megvan – az eredmény visszaér!
tartalmaz:Siker|Siker névvel írja a függvényt|A függvénynek pontosan "Siker" a neve – az S nagy! 🔤|🔤 A függvény neve tökéletesen egyezik!
int_float:1|Az összeget egész számmá alakítja|Az input() szöveget ad vissza – mivel alakítod számmá? 🔢|🔢 Az összeg számként vizsgálható!
for|For ciklust használ (pontosan 6 alkalommal)|A ciklus pontosan 6-szor fusson le. Hogyan adod meg? 🔄|🔄 A for ciklus pontosan 6-szor forog – minden hónapra sor kerül!
tartalmaz:hónap megtakarítása|A bekérés szövege tartalmazza: "hónap megtakarítása"|A bekérésnél szerepel a "hónap megtakarítása" szövegrész? 💰|✅ A bekérés szövege megvan!
if|Elágazást használ|20000 Ft felett sikerült, alatta nem – melyik kulcsszóval döntesz? 🌿|🌿 Az elágazás megvan – a program tud dönteni!
tartalmaz:Sikerült|"Sikerült!" szöveget tartalmazza a kód|Ha elég volt a megtakarítás, mit ad vissza a függvény? Pontosan kell: "Sikerült!" ✅|✅ Sikerült! A cél elérve!
tartalmaz:Nem sikerült|"Nem sikerült." szöveget tartalmazza a kód|Ha kevés volt, mit ad vissza? A "Nem sikerült" szó benne van? ❌|❌ Nem sikerült – jövő hónapban jobban megy!
tartalmaz:20000|A 20 000-es határt tartalmazza a kód|A határ 20000 Ft – szerepel ez a szám a kódban? 🔍|💵 A 20000-es határ megvan a kódban!
teszt:25000,15000,20000,18000,22000,30000:Sikerült|Sikeres hónapot helyesen ismer fel|25000 Ft – ez eléri a 20000-t. Mit ír ki? ✅|✅ Sikerült! 25000 Ft elegendő volt!
teszt:25000,15000,20000,18000,22000,30000:Nem sikerült|Sikertelen hónapot helyesen ismer fel|15000 Ft – ez 20000 alatt van. Mit ír ki? ❌|❌ Nem sikerült – 15000 Ft nem volt elég!
teszt:25000,15000,20000,18000,22000,30000:4 hónapban|Négy sikeres hónapot számol meg|25000, 20000, 22000, 30000 volt 20000 felett – összesen 4 hónap. Kijön ez? 🧮|🧮 4 hónapban sikerült – helyes összeszámlálás!
teszt:5000,5000,5000,5000,5000,5000:0 hónapban|Ha minden hónap sikertelen, 0-t ír|Ha mindig csak 5000 Ft-ot teszünk félre, hány sikeres hónap van? 📉|📉 0 hónapban sikerült – sajnos sosem volt elég!
```

---

### V7. RePont – Visszaváltás (14 pont)

**Feladatleírás:**

A RePont automatánál háromféle csomagolást lehet visszaváltani: PET palackot (`pet`), fém dobozt (`fem`) és üveget (`uveg`). Írj programot, amely 5 csomag visszaváltását kezeli!

Írj egy `Vissza` nevű függvényt! A függvény kapja meg a csomag típusát (szövegként). A visszaváltási értékek:
- `"pet"` → 50 Ft
- `"fem"` → 30 Ft
- `"uveg"` → 100 Ft
- bármi más → 0 Ft (ismeretlen csomag)

A főprogramban:
- Hozz létre egy összegző változót (kezdőértéke 0)!
- Készíts egy ciklust, amely pontosan **5-ször** fut le!
- A cikluson belül kérd be a csomag típusát az `"{i}. csomag típusa (pet/fem/uveg): "` szövegekkel!
- Hívd meg a `Vissza` függvényt, és ha az érték nagyobb mint 0, írd ki: `"Visszaváltva: X Ft"`, és add hozzá az összeghez!
- Ha az érték 0, írd ki: `"Ismeretlen csomag!"`
- A ciklus után írd ki: `"Összesen visszakaptad: X Ft"`

**Minta kimenet:**
```
1. csomag típusa (pet/fem/uveg): pet
Visszaváltva: 50 Ft
2. csomag típusa (pet/fem/uveg): fem
Visszaváltva: 30 Ft
3. csomag típusa (pet/fem/uveg): uveg
Visszaváltva: 100 Ft
4. csomag típusa (pet/fem/uveg): alma
Ismeretlen csomag!
5. csomag típusa (pet/fem/uveg): pet
Visszaváltva: 50 Ft
Összesen visszakaptad: 230 Ft
```

**Megoldás:**
```python
def Vissza(csomag):
    if csomag == "pet":
        return 50
    elif csomag == "fem":
        return 30
    elif csomag == "uveg":
        return 100
    else:
        return 0

osszeg = 0

for i in range(1, 6):
    csomag = input(f"{i}. csomag típusa (pet/fem/uveg): ")
    ertek = Vissza(csomag)
    if ertek > 0:
        print(f"Visszaváltva: {ertek} Ft")
        osszeg += ertek
    else:
        print("Ismeretlen csomag!")

print(f"Összesen visszakaptad: {osszeg} Ft")
```

**Pontozási útmutató (feladatok.txt formátum):**
```
def|Függvényt definiál (def)|A visszaváltást függvényként kell megírni. Melyik kulcsszóval hozod létre? 🛠️|🛠️ A Vissza függvény megalkotva – az automata kész!
return|Függvény visszatérési értéket ad (return)|A függvény a visszaváltási értéket adja vissza – melyik kulcsszóval? 📤|📤 A return megvan – az érték visszaér a főprogramba!
tartalmaz:Vissza|Vissza névvel írja a függvényt|A függvénynek pontosan "Vissza" a neve – a V nagy! 🔤|🔤 A függvény neve tökéletesen egyezik!
for|For ciklust használ (pontosan 5 alkalommal)|A ciklus pontosan 5-ször fusson le. Hogyan adod meg? 🔄|🔄 A for ciklus pontosan 5-szer forog – minden csomag sorra kerül!
tartalmaz:csomag típusa (pet/fem/uveg): |A bekérés szövege tartalmazza a típusokat|A bekérésnél szerepel a "csomag típusa (pet/fem/uveg): " szövegrész? ♻️|✅ A bekérés szövege megvan!
if|Elágazást használ|pet/fem/uveg esetén más értéket ad vissza – melyik kulcsszóval döntesz? 🌿|🌿 Az elágazás megvan – az automata felismeri a csomagot!
tartalmaz:Visszaváltva|"Visszaváltva:" szöveget tartalmazza a kód|Ha ismert csomag, mit ír ki? A "Visszaváltva" szó benne van? ✅|✅ Visszaváltva! Az automata elfogadta a csomagot!
tartalmaz:Ismeretlen csomag|"Ismeretlen csomag!" szöveget tartalmazza a kód|Ha ismeretlen típust adnak meg, mit ír ki? ❌|❌ Ismeretlen csomag! Az automata visszautasítja!
tartalmaz:50|A PET palack 50 Ft-os értékét tartalmazza|Mennyi a PET palack visszaváltási értéke? Szerepel ez a szám a kódban? 🔍|♻️ 50 Ft – a PET palack értéke megvan!
tartalmaz:100|Az üveg 100 Ft-os értékét tartalmazza|Mennyi az üveg visszaváltási értéke? Szerepel ez a szám a kódban? 🔍|🍶 100 Ft – az üveg értéke megvan!
teszt:pet,fem,uveg,alma,pet:Visszaváltva|Ismert csomagra helyes üzenet jelenik meg|pet → 50 Ft, fem → 30 Ft, uveg → 100 Ft. Kiírja az automata az értéket? ♻️|♻️ Visszaváltva – az automata elfogadta!
teszt:pet,fem,uveg,alma,pet:Ismeretlen csomag|Ismeretlen típusra hibaüzenet jelenik meg|"alma" – ez nem visszaváltható. Felismeri a programod? ❌|❌ Ismeretlen csomag – az automata visszautasítja!
teszt:pet,fem,uveg,alma,pet:230 Ft|Az összeget helyesen számolja (50+30+100+0+50=230)|pet+fem+uveg+alma+pet → mennyi a végösszeg? 🧮|🧮 230 Ft – a visszaváltás összege helyes!
teszt:uveg,uveg,uveg,uveg,uveg:500 Ft|Öt üveggel 500 Ft-ot számol (5×100)|Ha csak üveget hoznak, 5×100=500 Ft. Kijön ez? 🍶|🍶 500 Ft – öt üveg visszaváltva, minden rendben!
```

---

## 18 PONTOS FELADATOK (osztály külön fájlban)

---

### V9. Tanulók jegyei (18 pont)

**Előre adott fájl (tanulo.py) – ezt a tanuló megkapja:**
```python
class Tanulo:
    def __init__(self, nev, jegy):
        self.nev = nev
        self.jegy = jegy
```

**Feladatleírás:**

A program három tanuló nevét és osztályzatát tárolja objektumokban.

a) A `Tanulo` osztály rendelkezésre áll a `tanulo.py` fájlban. Töltsd be ezt a modult és használd a benne lévő osztályt!  
b) Kérd be három tanuló nevét és osztályzatát! Az adatok alapján hozz létre `Tanulo` osztályú objektumokat, és tárold őket egy listában!  
c) Jelenítsd meg az összes tanuló adatait ebben a formában: `Tanuló neve jegye: X`  
d) Határozd meg a legjobb jegyű tanulót, és a nevét írd be a `"legjobb.txt"` fájlba, ebben a formában: `Tanuló neve a legjobb tanuló.`

**Minta kimenet:**
```
Add meg a tanuló nevét! Kovács Péter
Mi az osztályzata? 4
Add meg a tanuló nevét! Nagy Anna
Mi az osztályzata? 5
Add meg a tanuló nevét! Tóth Béla
Mi az osztályzata? 3
Kovács Péter jegye: 4
Nagy Anna jegye: 5
Tóth Béla jegye: 3
```
*(A legjobb.txt tartalma: `Nagy Anna a legjobb tanuló.`)*

**Megoldás:**
```python
import tanulo

tanulok = []

for _ in range(3):
    nev = input("Add meg a tanuló nevét! ")
    jegy = int(input("Mi az osztályzata? "))
    t = tanulo.Tanulo(nev, jegy)
    tanulok.append(t)

legjobb = tanulok[0]

for t in tanulok:
    print(f"{t.nev} jegye: {t.jegy}")
    if t.jegy > legjobb.jegy:
        legjobb = t

f = open("legjobb.txt", "w")
f.write(f"{legjobb.nev} a legjobb tanuló.")
f.close()
```

**Pontozási útmutató (feladatok.txt formátum):**
```
ModulNev: tanulo.py
ModulTartalom:
class Tanulo:
    def __init__(self, nev, jegy):
        self.nev = nev
        self.jegy = jegy
ModulVege

teszt:Kovács Péter,4,Nagy Anna,5,Tóth Béla,3:Kovács Péter jegye: 4|Program hibaüzenet nélkül lefut|Fut le a kód hibátlanul? Próbáld meg futtatni! 🚀|🚀 A program hibátlanul lefutott!
vagy:import tanulo~~class Tanulo|Betölti a tanulo modult vagy bemásolja az osztályt|Vagy: import tanulo — vagy másold be a Tanulo osztályt! 📦|📦 A Tanulo osztály elérhető!
bekeres:Add meg a tanuló nevét! |Bekérés szövege: "Add meg a tanuló nevét! "|Pontosan kell a szöveg, szóköz van a felkiáltójel után! 🔍|✅ A tanuló nevének bekérése tökéletes!
bekeres:Mi az osztályzata? |Bekérés szövege: "Mi az osztályzata? "|Pontosan kell a szöveg, kérdőjel és szóköz! 🔍|✅ Az osztályzat bekérése tökéletes!
int_float:1|Az osztályzatot egész számmá alakítja|Az input() szöveget ad vissza – mivel alakítod számmá? 🔢|🔢 Az osztályzat számként vizsgálható!
tartalmaz:Tanulo(|Létrehoz egy Tanulo objektumot|Az objektum létrehozásához: tanulo.Tanulo(nev, jegy) vagy Tanulo(nev, jegy) – megvan? 🎓|🎓 Tanulo objektum sikeresen létrehozva!
tartalmaz:= []|Listát hoz létre az objektumoknak|Az objektumokat egy listában kell tárolni. Üres lista: tanulok = [] 📝|📝 A lista létrehozva!
tartalmaz:.append(|Az objektumokat hozzáadja a listához|Minden létrehozott objektumot a lista.append(objektum) paranccsal add hozzá! ➕|➕ append() – az objektum bekerült a listába!
for|For ciklust alkalmaz az adatbekéréshez|Három tanuló bekéréséhez ciklust kell használni! 🔄|🔄 A for ciklus forog – mindenki bekerül a listába!
teszt:Kovács Péter,4,Nagy Anna,5,Tóth Béla,3:Kovács Péter jegye: 4|Első tanuló adatait helyesen jeleníti meg|Az első tanuló neve és jegye megjelenik "Tanuló neve jegye: X" formában? 📋|📋 Az első tanuló adatai tökéletesek!
teszt:Kovács Péter,4,Nagy Anna,5,Tóth Béla,3:Nagy Anna jegye: 5|Második tanuló adatait is megjeleníti|A második tanuló (Nagy Anna, jegy 5) adatai is helyesen jelennek meg? ⭐|⭐ A második tanuló is tökéletesen megjelenik!
teszt:Kovács Péter,4,Nagy Anna,5,Tóth Béla,3:Tóth Béla jegye: 3|Mindhárom tanuló adatait megjeleníti|A harmadik tanuló (Tóth Béla, jegy 3) is megjelenik? ✅|✅ Mindhárom tanuló adatai megjelennek!
tartalmaz:.jegy|Az objektumok jegy attribútumát eléri a maximum kereséshez|A maximum kereséshez az egyes objektumok .jegy értékét kell összehasonlítani! 🔍|🔍 A jegy attribútum elérése megvan!
teszt:Kovács Péter,4,Nagy Anna,5,Tóth Béla,3:Nagy Anna a legjobb|Meghatározza és fájlba írja a legjobb tanulót|A "legjobb.txt" fájlban szerepel "Nagy Anna a legjobb"? 🏆|🏆 A legjobb tanuló helyesen meghatározva!
tartalmaz:legjobb.txt|Megnyitja a legjobb.txt fájlt|A fájl neve pontosan "legjobb.txt" – kis- és nagybetűk számítanak! 💾|💾 A legjobb.txt fájl megnyitva!
tartalmaz:a legjobb|A mondatot felépíti ("... a legjobb tanuló.")|A fájlba írt mondat "a legjobb" szövegrészt tartalmaz? ✍️|✍️ A mondat felépítve!
tartalmaz:write(|A mondatot fájlba írja (.write() hívás)|A megnyitott fájlba a .write() metódussal kell írni! 📝|📝 A .write() megvan – az adat fájlba kerül!
teszt:Kis Éva,3,Pap Gábor,5,Mező Lili,4:Pap Gábor a legjobb|Más adatokkal is helyesen találja meg a maximumot|Más adatokkal is működik? (Kis Éva-3, Pap Gábor-5, Mező Lili-4 → Pap Gábor a legjobb) 🧮|🏆 Más adatokkal is tökéletesen működik!
```

---

### V10. Könyvek oldalszáma (18 pont)

**Előre adott fájl (konyv.py) – ezt a tanuló megkapja:**
```python
class Konyv:
    def __init__(self, cim, oldalak):
        self.cim = cim
        self.oldalak = oldalak
```

**Feladatleírás:**

A program négy könyv adatait tárolja objektumokban.

a) A `Konyv` osztály rendelkezésre áll a `konyv.py` fájlban. Töltsd be ezt a modult!  
b) Kérd be négy könyv címét és oldalszámát! Hozz létre `Konyv` osztályú objektumokat, és tárold őket egy listában!  
c) Jelenítsd meg az összes könyv adatait: `A(z) Cím X oldalas.`  
d) Határozd meg a leghosszabb könyvet, és a címét írd be a `"leghosszabb.txt"` fájlba, ebben a formában: `A(z) Cím a leghosszabb könyv.`

**Minta kimenet:**
```
Add meg a könyv címét! Harry Potter
Hány oldalas? 300
Add meg a könyv címét! A kis herceg
Hány oldalas? 100
Add meg a könyv címét! Egri csillagok
Hány oldalas? 450
Add meg a könyv címét! Pál utcai fiúk
Hány oldalas? 220
A(z) Harry Potter 300 oldalas.
A(z) A kis herceg 100 oldalas.
A(z) Egri csillagok 450 oldalas.
A(z) Pál utcai fiúk 220 oldalas.
```
*(A leghosszabb.txt tartalma: `A(z) Egri csillagok a leghosszabb könyv.`)*

**Megoldás:**
```python
import konyv

konyvek = []

for _ in range(4):
    cim = input("Add meg a könyv címét! ")
    oldalak = int(input("Hány oldalas? "))
    k = konyv.Konyv(cim, oldalak)
    konyvek.append(k)

leghosszabb = konyvek[0]

for k in konyvek:
    print(f"A(z) {k.cim} {k.oldalak} oldalas.")
    if k.oldalak > leghosszabb.oldalak:
        leghosszabb = k

f = open("leghosszabb.txt", "w")
f.write(f"A(z) {leghosszabb.cim} a leghosszabb könyv.")
f.close()
```

**Pontozási útmutató (feladatok.txt formátum):**
```
ModulNev: konyv.py
ModulTartalom:
class Konyv:
    def __init__(self, cim, oldalak):
        self.cim = cim
        self.oldalak = oldalak
ModulVege

teszt:Harry Potter,300,A kis herceg,100,Egri csillagok,450,Pál utcai fiúk,220:A(z) Harry Potter 300 oldalas|Program hibaüzenet nélkül lefut|Fut le a kód hibátlanul? 🚀|🚀 A program hibátlanul lefutott!
vagy:import konyv~~class Konyv|Betölti a konyv modult vagy bemásolja az osztályt|Vagy: import konyv — vagy másold be a Konyv osztályt! 📦|📦 A Konyv osztály elérhető!
bekeres:Add meg a könyv címét! |Bekérés szövege: "Add meg a könyv címét! "|Pontosan kell a szöveg, szóköz van a felkiáltójel után! 📚|✅ A könyvcím bekérése tökéletes!
bekeres:Hány oldalas? |Bekérés szövege: "Hány oldalas? "|Pontosan kell a szöveg kérdőjellel és szóközzel! 📖|✅ Az oldalszám bekérése tökéletes!
int_float:1|Az oldalszámot egész számmá alakítja|Az input() szöveget ad vissza – mivel alakítod számmá? 🔢|🔢 Az oldalszám számként vizsgálható!
tartalmaz:Konyv(|Létrehoz egy Konyv objektumot|Az objektum létrehozásához: konyv.Konyv(cim, oldalak) – megvan? 📚|📚 Konyv objektum sikeresen létrehozva!
tartalmaz:= []|Listát hoz létre az objektumoknak|Az objektumokat egy listában kell tárolni. Üres lista: konyvek = [] 📝|📝 A lista létrehozva!
tartalmaz:.append(|Az objektumokat hozzáadja a listához|Minden létrehozott objektumot a lista.append() paranccsal add hozzá! ➕|➕ append() – a könyv bekerült a listába!
for|For ciklust alkalmaz az adatbekéréshez|Négy könyv bekéréséhez ciklust kell használni! 🔄|🔄 A for ciklus forog – minden könyv feldolgozásra kerül!
teszt:Harry Potter,300,A kis herceg,100,Egri csillagok,450,Pál utcai fiúk,220:A(z) Harry Potter 300 oldalas|Első könyv adatait helyesen jeleníti meg|Az első könyv adatai megjelennek "A(z) Cím X oldalas." formában? 📋|📋 Az első könyv adatai tökéletesek!
teszt:Harry Potter,300,A kis herceg,100,Egri csillagok,450,Pál utcai fiúk,220:A(z) A kis herceg 100 oldalas|Második könyv adatait is megjeleníti|A második könyv adatai helyesen megjelennek? 📖|📖 A második könyv is tökéletesen megjelenik!
teszt:Harry Potter,300,A kis herceg,100,Egri csillagok,450,Pál utcai fiúk,220:A(z) Egri csillagok 450 oldalas|Harmadik könyv adatait is megjeleníti|Az Egri csillagok adatai (450 oldal) helyesen megjelennek? ✅|✅ A harmadik könyv is megjelenik!
tartalmaz:.oldalak|Az objektumok oldalak attribútumát eléri a maximum kereséshez|A leghosszabb kereséshez a .oldalak értéket kell összehasonlítani! 🔍|🔍 Az oldalak attribútum elérése megvan!
teszt:Harry Potter,300,A kis herceg,100,Egri csillagok,450,Pál utcai fiúk,220:Egri csillagok a leghosszabb|Meghatározza és fájlba írja a leghosszabb könyvet|A "leghosszabb.txt" fájlban szerepel "Egri csillagok a leghosszabb"? 🏆|🏆 A leghosszabb könyv helyesen meghatározva!
tartalmaz:leghosszabb.txt|Megnyitja a leghosszabb.txt fájlt|A fájl neve pontosan "leghosszabb.txt"! 💾|💾 A leghosszabb.txt fájl megnyitva!
tartalmaz:a leghosszabb|A mondatot felépíti ("... a leghosszabb könyv.")|A fájlba írt mondat "a leghosszabb" szövegrészt tartalmaz? ✍️|✍️ A mondat felépítve!
tartalmaz:write(|A mondatot fájlba írja (.write() hívás)|A megnyitott fájlba a .write() metódussal kell írni! 📝|📝 A .write() megvan!
teszt:Anna Karenina,600,Maugli,150,Robinson,400,Drakula,200:Anna Karenina a leghosszabb|Más adatokkal is helyesen találja meg a maximumot|Más adatokkal is működik? (Anna Karenina 600 oldal → leghosszabb) 🧮|🏆 Más adatokkal is tökéletesen működik!
```

---

### V11. Filmek értékelése (18 pont)

**Előre adott fájl (film.py) – ezt a tanuló megkapja:**
```python
class Film:
    def __init__(self, cim, ertekeles):
        self.cim = cim
        self.ertekeles = ertekeles
```

**Feladatleírás:**

A program három film adatait tárolja objektumokban.

a) A `Film` osztály rendelkezésre áll a `film.py` fájlban. Töltsd be ezt a modult!  
b) Kérd be három film címét és értékelését (1-10)! Hozz létre `Film` osztályú objektumokat, és tárold őket egy listában!  
c) Jelenítsd meg az összes film adatait: `A(z) Cím értékelése: X/10`  
d) Határozd meg a legjobban értékelt filmet, és a címét írd be a `"legjobb_film.txt"` fájlba, ebben a formában: `A(z) Cím a legjobb film.`

**Minta kimenet:**
```
Add meg a film címét! Avatar
Mi az értékelése (1-10)? 8
Add meg a film címét! Titanic
Mi az értékelése (1-10)? 9
Add meg a film címét! Jaws
Mi az értékelése (1-10)? 7
A(z) Avatar értékelése: 8/10
A(z) Titanic értékelése: 9/10
A(z) Jaws értékelése: 7/10
```
*(A legjobb_film.txt tartalma: `A(z) Titanic a legjobb film.`)*

**Megoldás:**
```python
import film

filmek = []

for _ in range(3):
    cim = input("Add meg a film címét! ")
    ertekeles = int(input("Mi az értékelése (1-10)? "))
    f = film.Film(cim, ertekeles)
    filmek.append(f)

legjobb = filmek[0]

for f in filmek:
    print(f"A(z) {f.cim} értékelése: {f.ertekeles}/10")
    if f.ertekeles > legjobb.ertekeles:
        legjobb = f

cel = open("legjobb_film.txt", "w")
cel.write(f"A(z) {legjobb.cim} a legjobb film.")
cel.close()
```

**Pontozási útmutató (feladatok.txt formátum):**
```
ModulNev: film.py
ModulTartalom:
class Film:
    def __init__(self, cim, ertekeles):
        self.cim = cim
        self.ertekeles = ertekeles
ModulVege

teszt:Avatar,8,Titanic,9,Jaws,7:A(z) Avatar értékelése: 8/10|Program hibaüzenet nélkül lefut|Fut le a kód hibátlanul? 🚀|🚀 A program hibátlanul lefutott!
vagy:import film~~class Film|Betölti a film modult vagy bemásolja az osztályt|Vagy: import film — vagy másold be a Film osztályt! 📦|📦 A Film osztály elérhető!
bekeres:Add meg a film címét! |Bekérés szövege: "Add meg a film címét! "|Pontosan kell a szöveg, szóköz a felkiáltójel után! 🎬|✅ A filmcím bekérése tökéletes!
bekeres:Mi az értékelése (1-10)? |Bekérés szövege: "Mi az értékelése (1-10)? "|Pontosan kell a szöveg zárójelekkel és kérdőjellel! ⭐|✅ Az értékelés bekérése tökéletes!
int_float:1|Az értékelést egész számmá alakítja|Az input() szöveget ad vissza – mivel alakítod számmá? 🔢|🔢 Az értékelés számként vizsgálható!
tartalmaz:Film(|Létrehoz egy Film objektumot|Az objektum létrehozásához: film.Film(cim, ertekeles) – megvan? 🎥|🎥 Film objektum sikeresen létrehozva!
tartalmaz:= []|Listát hoz létre az objektumoknak|Az objektumokat egy listában kell tárolni! 📝|📝 A lista létrehozva!
tartalmaz:.append(|Az objektumokat hozzáadja a listához|Minden létrehozott objektumot a lista.append() paranccsal add hozzá! ➕|➕ append() – a film bekerült a listába!
for|For ciklust alkalmaz az adatbekéréshez|Három film bekéréséhez ciklust kell használni! 🔄|🔄 A for ciklus forog – minden film feldolgozásra kerül!
teszt:Avatar,8,Titanic,9,Jaws,7:A(z) Avatar értékelése: 8/10|Első film adatait helyesen jeleníti meg|Az Avatar adatai megjelennek "A(z) ... értékelése: X/10" formában? 📋|📋 Az első film adatai tökéletesek!
teszt:Avatar,8,Titanic,9,Jaws,7:A(z) Titanic értékelése: 9/10|Második film adatait is megjeleníti|A Titanic adatai (9/10) helyesen megjelennek? 🚢|🚢 A második film is tökéletesen megjelenik!
teszt:Avatar,8,Titanic,9,Jaws,7:A(z) Jaws értékelése: 7/10|Mindhárom film adatait megjeleníti|A Jaws adatai (7/10) is megjelennek? ✅|✅ Mindhárom film adatai megjelennek!
tartalmaz:.ertekeles|Az objektumok ertekeles attribútumát eléri|A legjobb kereséshez az .ertekeles értéket kell összehasonlítani! 🔍|🔍 Az ertekeles attribútum elérése megvan!
teszt:Avatar,8,Titanic,9,Jaws,7:Titanic a legjobb film|Meghatározza és fájlba írja a legjobb filmet|A "legjobb_film.txt" fájlban szerepel "Titanic a legjobb film"? 🏆|🏆 A legjobb film helyesen meghatározva!
tartalmaz:legjobb_film.txt|Megnyitja a legjobb_film.txt fájlt|A fájl neve pontosan "legjobb_film.txt"! 💾|💾 A legjobb_film.txt fájl megnyitva!
tartalmaz:a legjobb film|A mondatot felépíti ("... a legjobb film.")|A fájlba írt mondat "a legjobb film" szövegrészt tartalmaz? ✍️|✍️ A mondat felépítve!
tartalmaz:write(|A mondatot fájlba írja (.write() hívás)|A megnyitott fájlba a .write() metódussal kell írni! 📝|📝 A .write() megvan!
teszt:Mátrix,10,Inception,8,Interstellar,9:Mátrix a legjobb film|Más adatokkal is helyesen találja meg a maximumot|Más adatokkal is működik? (Mátrix 10/10 → legjobb) 🧮|🏆 Más adatokkal is tökéletesen működik!
```

---

### V12. Futóverseny eredmények (18 pont)

**Előre adott fájl (futo.py) – ezt a tanuló megkapja:**
```python
class Futo:
    def __init__(self, nev, ido):
        self.nev = nev
        self.ido = ido
```

**Feladatleírás:**

A program egy futóverseny adatait tárolja objektumokban. Négy futó teljesítményét rögzíti.

a) A `Futo` osztály rendelkezésre áll a `futo.py` fájlban. Töltsd be ezt a modult!  
b) Kérd be négy futó nevét és idejét másodpercben! Hozz létre `Futo` osztályú objektumokat, és tárold őket egy listában!  
c) Jelenítsd meg az összes futó adatait: `A(z) Név ideje: X mp`  
d) Határozd meg a leggyorsabb futót (legkisebb idő!), és a nevét írd be a `"gyoztes.txt"` fájlba, ebben a formában: `Név a leggyorsabb futó.`

**Minta kimenet:**
```
Add meg a futó nevét! Kis Tamás
Mennyi az ideje (másodperc)? 245
Add meg a futó nevét! Nagy Péter
Mennyi az ideje (másodperc)? 230
Add meg a futó nevét! Kovács Zsolt
Mennyi az ideje (másodperc)? 260
Add meg a futó nevét! Tóth Bence
Mennyi az ideje (másodperc)? 225
A(z) Kis Tamás ideje: 245 mp
A(z) Nagy Péter ideje: 230 mp
A(z) Kovács Zsolt ideje: 260 mp
A(z) Tóth Bence ideje: 225 mp
```
*(A gyoztes.txt tartalma: `Tóth Bence a leggyorsabb futó.`)*

**Megoldás:**
```python
import futo

futok = []

for _ in range(4):
    nev = input("Add meg a futó nevét! ")
    ido = int(input("Mennyi az ideje (másodperc)? "))
    f = futo.Futo(nev, ido)
    futok.append(f)

leggyorsabb = futok[0]

for f in futok:
    print(f"A(z) {f.nev} ideje: {f.ido} mp")
    if f.ido < leggyorsabb.ido:
        leggyorsabb = f

cel = open("gyoztes.txt", "w")
cel.write(f"{leggyorsabb.nev} a leggyorsabb futó.")
cel.close()
```

**Pontozási útmutató (feladatok.txt formátum):**
```
ModulNev: futo.py
ModulTartalom:
class Futo:
    def __init__(self, nev, ido):
        self.nev = nev
        self.ido = ido
ModulVege

teszt:Kis Tamás,245,Nagy Péter,230,Kovács Zsolt,260,Tóth Bence,225:A(z) Kis Tamás ideje: 245 mp|Program hibaüzenet nélkül lefut|Fut le a kód hibátlanul? 🚀|🚀 A program hibátlanul lefutott!
vagy:import futo~~class Futo|Betölti a futo modult vagy bemásolja az osztályt|Vagy: import futo — vagy másold be a Futo osztályt! 📦|📦 A Futo osztály elérhető!
bekeres:Add meg a futó nevét! |Bekérés szövege: "Add meg a futó nevét! "|Pontosan kell a szöveg, szóköz a felkiáltójel után! 🏃|✅ A futó nevének bekérése tökéletes!
bekeres:Mennyi az ideje (másodperc)? |Bekérés szövege: "Mennyi az ideje (másodperc)? "|Pontosan kell a szöveg zárójelekkel és kérdőjellel! ⏱️|✅ Az idő bekérése tökéletes!
int_float:1|Az időt egész számmá alakítja|Az input() szöveget ad vissza – mivel alakítod számmá? 🔢|🔢 Az idő számként vizsgálható!
tartalmaz:Futo(|Létrehoz egy Futo objektumot|Az objektum létrehozásához: futo.Futo(nev, ido) – megvan? 🏅|🏅 Futo objektum sikeresen létrehozva!
tartalmaz:= []|Listát hoz létre az objektumoknak|Az objektumokat egy listában kell tárolni! 📝|📝 A lista létrehozva!
tartalmaz:.append(|Az objektumokat hozzáadja a listához|Minden létrehozott objektumot a lista.append() paranccsal add hozzá! ➕|➕ append() – a futó bekerült a listába!
for|For ciklust alkalmaz az adatbekéréshez|Négy futó bekéréséhez ciklust kell használni! 🔄|🔄 A for ciklus forog – minden futó feldolgozásra kerül!
teszt:Kis Tamás,245,Nagy Péter,230,Kovács Zsolt,260,Tóth Bence,225:A(z) Kis Tamás ideje: 245 mp|Első futó adatait helyesen jeleníti meg|Az első futó adatai megjelennek "A(z) ... ideje: X mp" formában? 📋|📋 Az első futó adatai tökéletesek!
teszt:Kis Tamás,245,Nagy Péter,230,Kovács Zsolt,260,Tóth Bence,225:A(z) Nagy Péter ideje: 230 mp|Második futó adatait is megjeleníti|Nagy Péter adatai (230 mp) helyesen megjelennek? 🏃|🏃 A második futó is megjelenik!
teszt:Kis Tamás,245,Nagy Péter,230,Kovács Zsolt,260,Tóth Bence,225:A(z) Tóth Bence ideje: 225 mp|Negyedik futó adatait is megjeleníti|Tóth Bence adatai (225 mp) is megjelennek? ✅|✅ A negyedik futó is megjelenik!
tartalmaz:.ido|Az objektumok ido attribútumát eléri|A leggyorsabb kereséshez az .ido értéket kell összehasonlítani! 🔍|🔍 Az ido attribútum elérése megvan!
teszt:Kis Tamás,245,Nagy Péter,230,Kovács Zsolt,260,Tóth Bence,225:Tóth Bence a leggyorsabb|Meghatározza és fájlba írja a leggyorsabb futót|A "gyoztes.txt" fájlban szerepel "Tóth Bence a leggyorsabb"? 🥇|🥇 A leggyorsabb futó helyesen meghatározva!
tartalmaz:gyoztes.txt|Megnyitja a gyoztes.txt fájlt|A fájl neve pontosan "gyoztes.txt"! 💾|💾 A gyoztes.txt fájl megnyitva!
tartalmaz:leggyorsabb|A mondatot felépíti ("... a leggyorsabb futó.")|A fájlba írt mondat "leggyorsabb" szövegrészt tartalmaz? ✍️|✍️ A mondat felépítve!
tartalmaz:write(|A mondatot fájlba írja (.write() hívás)|A megnyitott fájlba a .write() metódussal kell írni! 📝|📝 A .write() megvan!
teszt:Ábel,300,Bátor,280,Csillag,310,Deli,290:Bátor a leggyorsabb|Más adatokkal is helyesen találja meg a minimumot|Más adatokkal is működik? (Bátor 280 mp → leggyorsabb) 🧮|🥇 Más adatokkal is tökéletesen működik!
```

---

## ÖSSZEFOGLALÁS

| # | Cím | Pont | Típus | Fő kritérium |
|---|-----|------|-------|--------------|
| V1 | Szállodai minősítés | 8 | if/elif | 1–5 skála → szöveg |
| V2 | Sportverseny dobogó | 8 | if/elif | 1–3 érem, 4+ részvétel |
| V3 | Öltözet hőmérséklet alapján | 8 | if/elif | hőfok → mit vegyen fel |
| V4 | Csomagküldési díj | 8 | if/elif | súly (kg) → kategória + ár |
| V5 | Önkiszolgáló kassza | 14 | def + for | 4 termék, kód → ár, összesítés |
| V5 | Uszoda látogatottsága | 14 | def + for | 7 nap, 100 fő határ |
| V6 | Havi megtakarítás | 14 | def + for | 6 hónap, 20 000 Ft cél |
| V7 | RePont – Visszaváltás | 14 | def + for | 5 csomag, pet/fem/uveg típusok |
| V9 | Tanulók jegyei | 18 | class + for | 3 tanuló, max jegy, fájl |
| V10 | Könyvek oldalszáma | 18 | class + for | 4 könyv, max oldal, fájl |
| V11 | Filmek értékelése | 18 | class + for | 3 film, max értékelés, fájl |
| V12 | Futóverseny | 18 | class + for | 4 futó, min idő, fájl |

**Maximális pontszám:** 4×8 + 4×14 + 4×18 = 32 + 56 + 72 = **160 pont**

---

*Futtatási kódnézet: hamarosan*
