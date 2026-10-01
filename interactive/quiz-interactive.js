'use strict';

// ════════════════════════════════════════════════════════════════════════════
// KÉRDÉSBANK
// ════════════════════════════════════════════════════════════════════════════

const QB = {};

// ── 1. ELEKTRONIKAI ALAPFOGALMAK ─────────────────────────────────────────────
QB.t1 = [
  { id:'E1', q:'Mi a feszültség mértékegysége?',
    opts:['Amper (A)','Volt (V)','Watt (W)','Ohm (Ω)'], ans:'Volt (V)' },
  { id:'E2', q:'Mi az áramerősség mértékegysége?',
    opts:['Volt (V)','Amper (A)','Watt (W)','Ohm (Ω)'], ans:'Amper (A)' },
  { id:'E3', q:'Mi az ellenállás mértékegysége?',
    opts:['Volt (V)','Amper (A)','Watt (W)','Ohm (Ω)'], ans:'Ohm (Ω)' },
  { id:'E4', q:'Mit fejez ki Ohm törvénye?',
    opts:['A teljesítmény és az ellenállás kapcsolatát','A feszültség egyenlő az áramerősség és az ellenállás szorzatával (U = R · I)','A kondenzátor töltési idejét','Az elektromos teljesítmény kiszámítási módját'],
    ans:'A feszültség egyenlő az áramerősség és az ellenállás szorzatával (U = R · I)' },
  { id:'E5', q:'Melyik alkatrész korlátozza az áramerősséget az áramkörben?',
    opts:['Kondenzátor','Dióda','Ellenállás','Tekercs'], ans:'Ellenállás' },
  { id:'E6', q:'Melyik anyag vezeti az elektromos áramot?',
    opts:['Műanyag','Fa','Réz','Üveg'], ans:'Réz' },
  { id:'E7', q:'Mi látható a képen?',
    opts:['Kondenzátor','Tranzisztor','Ellenállás','Tekercs'], ans:'Ellenállás', image:'images/ellenallas.jpg' },
  { id:'E8', q:'Mit jelent a LED rövidítés?',
    opts:['Logical Electronic Device','Low Energy Display','Fényt kibocsátó dióda (Light Emitting Diode)','Linear Electrical Driver'],
    ans:'Fényt kibocsátó dióda (Light Emitting Diode)' },
  { id:'E9', q:'Mi látható a képen?',
    opts:['Voltmérő','Amperemérő','Multiméter','Oszcilloszkóp'], ans:'Multiméter', image:'images/multimeter.jpg' },
  { id:'E10', q:'Mi látható a képen?',
    opts:['Ellenállás','Tranzisztor','LED','Dióda'], ans:'LED', image:'images/led.jpg' },
];

// ── 2a. OPERÁCIÓS RENDSZEREK – TELEPÍTÉS ────────────────────────────────────
QB.os_t = [
  { id:'T-PC1', q:'Melyik fájlrendszert használja alapértelmezetten a Windows?',
    opts:['FAT32','ext4','NTFS','HFS+'], ans:'NTFS' },
  { id:'T-PC2', q:'Mit jelent a „clean install" (tiszta telepítés)?',
    opts:['Az OS frissítése meglévő adatok megtartásával','Csak a víruskereső újratelepítése','Az OS telepítése formázás után, nulláról','A gyári beállítások visszaállítása'],
    ans:'Az OS telepítése formázás után, nulláról' },
  { id:'T-PC3', q:'Mire való a BIOS/UEFI?',
    opts:['Fájlok tárolására','Az internetkapcsolat kezelésére','Indítás előtti hardver-ellenőrzés és az OS betöltése','Vírusok elleni védelemre'],
    ans:'Indítás előtti hardver-ellenőrzés és az OS betöltése' },
  { id:'T-PC4', q:'Mit jelent a „dual boot" beállítás?',
    opts:['Két monitor használata egyszerre','Két OS fut párhuzamosan','Két OS van telepítve, indításkor lehet választani','A számítógép kétszer olyan gyorsan indul'],
    ans:'Két OS van telepítve, indításkor lehet választani' },
  { id:'T-PC5', q:'Mire való a bootolható USB meghajtó?',
    opts:['Adatok tárolására','Fájlok titkosítására','Operációs rendszer telepítésének elindítására','Vírusok eltávolítására'],
    ans:'Operációs rendszer telepítésének elindítására' },
  { id:'T-M1', q:'Mi szükséges egy új Android telefon első beállításához?',
    opts:['Apple ID','Microsoft fiók','Google fiók','Rendszergazdai jelszó'], ans:'Google fiók' },
  { id:'T-M2', q:'Hogyan lehet visszaállítani egy elfelejtett PIN kódú Android telefont?',
    opts:['Csak szervizben lehetséges','Automatikusan visszaállítja magát','Gyári visszaállítással, de minden adat törlődik','Az OS frissítésével'],
    ans:'Gyári visszaállítással, de minden adat törlődik' },
  { id:'T-M3', q:'Hogyan lehet iOS-t visszaállítani számítógépen keresztül?',
    opts:['Google Play-en keresztül','Windows Update-tel','iTunes vagy Finder segítségével','Android Studio-val'],
    ans:'iTunes vagy Finder segítségével' },
  { id:'T-M4', q:'Mit jelent az okostelefon „flash"-elése?',
    opts:['A képernyő fényerejének beállítása','Az OS teljes cseréje vagy újratelepítése','A telefon hátterének megváltoztatása','Az akkumulátor kalibrálása'],
    ans:'Az OS teljes cseréje vagy újratelepítése' },
  { id:'T-M5', q:'Mit jelent a „gyári visszaállítás" (factory reset) mobileszközökön?',
    opts:['Csak a névjegyek törlése','Az OS frissítése','A telefon visszaáll a gyári beállításokra, minden adat törlődik','Az akkumulátor kalibrálása'],
    ans:'A telefon visszaáll a gyári beállításokra, minden adat törlődik' },
  { id:'T-Á1', q:'Mit érdemes elvégezni az operációs rendszer újratelepítése előtt?',
    opts:['Töröljük a víruskeresőt','Formázzuk meg az összes meghajtót','Készítsünk biztonsági mentést az adatokról','Frissítsük az összes alkalmazást'],
    ans:'Készítsünk biztonsági mentést az adatokról' },
  { id:'T-Á2', q:'Mit kell ellenőrizni, mielőtt operációs rendszert telepítünk egy gépre?',
    opts:['A monitor típusát','A billentyűzet nyelvét','Hogy a hardver megfelel-e a minimális rendszerkövetelményeknek','A hálózati kábel hosszát'],
    ans:'Hogy a hardver megfelel-e a minimális rendszerkövetelményeknek' },
  { id:'T-Á3', q:'Mi a különbség az „upgrade" és a „clean install" telepítés között?',
    opts:['Nincs különbség','A clean install gyorsabb','Az upgrade megtartja a meglévő adatokat, a clean install nulláról kezd','Az upgrade csak mobilon lehetséges'],
    ans:'Az upgrade megtartja a meglévő adatokat, a clean install nulláról kezd' },
  { id:'T-Á4', q:'Mi az illesztőprogram (driver) szerepe telepítéskor?',
    opts:['Az internetkapcsolat biztosítása','A fájlok titkosítása','A hardvereszközök és az OS közötti kommunikáció biztosítása','A programok automatikus frissítése'],
    ans:'A hardvereszközök és az OS közötti kommunikáció biztosítása' },
  { id:'T-Á5', q:'Mi a különbség a telepített és a hordozható (portable) program között?',
    opts:['Nincs különbség','A hordozható program gyorsabb','A hordozható program nem igényel telepítést, közvetlenül futtatható','A telepített program nem törölhető'],
    ans:'A hordozható program nem igényel telepítést, közvetlenül futtatható' },
];

// ── 2b. OPERÁCIÓS RENDSZEREK – FRISSÍTÉS ────────────────────────────────────
QB.os_f = [
  { id:'F-PC1', q:'Hogyan frissíthető a Windows operációs rendszer?',
    opts:['Csak USB meghajtóról','Windows Update funkción keresztül','Csak szakember végezheti','Csak teljes újratelepítéssel'],
    ans:'Windows Update funkción keresztül' },
  { id:'F-PC2', q:'Hogyan frissíthetők az illesztőprogramok (driverek) Windows-ban?',
    opts:['Csak gyártói CD-ről','Csak újratelepítéssel','Eszközkezelőn keresztül vagy a gyártó weboldaláról','Automatikusan frissülnek, külön nem kell foglalkozni velük'],
    ans:'Eszközkezelőn keresztül vagy a gyártó weboldaláról' },
  { id:'F-PC3', q:'Mit jelent a „szervizcsomag" (Service Pack) Windows esetén?',
    opts:['Egy új Windows verzió','Egy biztonsági szoftver','Összegyűjtött frissítések és hibajavítások csomagja','Egy telepítő lemez'],
    ans:'Összegyűjtött frissítések és hibajavítások csomagja' },
  { id:'F-PC4', q:'Miért nem szabad kikapcsolni a számítógépet operációs rendszer frissítése közben?',
    opts:['Semmi baj nem történik, automatikusan folytatódik','A számítógép gyorsabb lesz','A rendszer instabillá válhat','Az összes fájl törlődik'],
    ans:'A rendszer instabillá válhat' },
  { id:'F-PC5', q:'Hogyan frissíthetők egyszerre az összes telepített program Linux rendszeren?',
    opts:['Csak egyenként frissíthetők','Windows Update-en keresztül','Csomagkezelőn (pl. apt) keresztül','Csak újratelepítéssel'],
    ans:'Csomagkezelőn (pl. apt) keresztül' },
  { id:'F-M1', q:'Hogyan ellenőrizhető, hogy elérhető-e frissítés iPhone-ra?',
    opts:['Google Play-en keresztül','Csak iTunes-on keresztül','Beállítások → Általános → Szoftverfrissítés','Automatikusan jelzi, manuálisan nem lehet'],
    ans:'Beállítások → Általános → Szoftverfrissítés' },
  { id:'F-M2', q:'Hol lehet beállítani az Android frissítését?',
    opts:['Alkalmazásboltban','Böngészőben','Beállítások → A telefon névjegye → Szoftverfrissítés','Csak számítógépen keresztül'],
    ans:'Beállítások → A telefon névjegye → Szoftverfrissítés' },
  { id:'F-M3', q:'Hogyan frissíthető egy alkalmazás iPhone-on?',
    opts:['Csak gyári visszaállítással','Csak USB kábelen','Az App Store Frissítések menüpontján keresztül','Automatikusan frissül, manuálisan nem lehet'],
    ans:'Az App Store Frissítések menüpontján keresztül' },
  { id:'F-M4', q:'Mi az automatikus alkalmazásfrissítés előnye mobilon?',
    opts:['Több tárhelyet használ','Lassítja a telefont','Az alkalmazások mindig naprakészek maradnak, beleértve a biztonsági javításokat','Több mobiladatot fogyaszt'],
    ans:'Az alkalmazások mindig naprakészek maradnak, beleértve a biztonsági javításokat' },
  { id:'F-M5', q:'Mit jelent, ha egy mobilalkalmazás „frissítést igényel"?',
    opts:['A telefont újra kell indítani','Az alkalmazást törölni kell','Az alkalmazásnak új verziója érhető el, amelyet ajánlott telepíteni','A telefon memóriája megtelt'],
    ans:'Az alkalmazásnak új verziója érhető el, amelyet ajánlott telepíteni' },
  { id:'F-Á1', q:'Mi az operációs rendszer frissítésének legfontosabb célja?',
    opts:['A számítógép lassítása','Az összes program automatikus frissítése','A régi fájlok törlése','Biztonsági hibák javítása és új funkciók hozzáadása'],
    ans:'Biztonsági hibák javítása és új funkciók hozzáadása' },
  { id:'F-Á2', q:'Mi történik, ha hosszú ideig nem frissítjük az operációs rendszert?',
    opts:['Gyorsabb lesz a számítógép','Az összes program törlődik','Biztonsági rések maradnak javítatlanul, nő a fertőzés kockázata','A fájlrendszer megváltozik'],
    ans:'Biztonsági rések maradnak javítatlanul, nő a fertőzés kockázata' },
  { id:'F-Á3', q:'Mit jelent az automatikus frissítés bekapcsolt állapota?',
    opts:['A számítógép magától újraindul bármikor','Az összes fájl automatikusan törlődik','A frissítések automatikusan letöltődnek és telepítődnek','Csak a víruskereső frissül'],
    ans:'A frissítések automatikusan letöltődnek és telepítődnek' },
  { id:'F-Á4', q:'Miért kér újraindítást a számítógép/telefon frissítés után?',
    opts:['Mert hiba történt','Mert a frissítés törölt fájlokat','Mert egyes változtatások csak újraindítás után lépnek életbe','Mert az összes program frissítése szükséges'],
    ans:'Mert egyes változtatások csak újraindítás után lépnek életbe' },
  { id:'F-Á5', q:'Mi a „hibajavító frissítés" (patch) célja?',
    opts:['Új funkciók hozzáadása','A megjelenés megváltoztatása','Ismert hibák és biztonsági rések javítása','A rendszer teljes újratelepítése'],
    ans:'Ismert hibák és biztonsági rések javítása' },
];

// ── 2c. OPERÁCIÓS RENDSZEREK – BEÁLLÍTÁSOK ──────────────────────────────────
QB.os_b = [
  { id:'B-PC1', q:'Mire való a Feladatkezelő (Task Manager) Windows-ban?',
    opts:['Fájlok törlésére','Futó programok és rendszererőforrások ellenőrzésére','Az internetkapcsolat beállítására','Nyomtató telepítésére'],
    ans:'Futó programok és rendszererőforrások ellenőrzésére' },
  { id:'B-PC2', q:'Melyik beépített Windows program segítségével böngészhetjük a számítógép mappáit és fájljait?',
    opts:['Feladatkezelő','Windows Intéző','Vezérlőpult','Lemezkezelő'], ans:'Windows Intéző' },
  { id:'B-PC3', q:'Mire való az Eszközkezelő (Device Manager) Windows-ban?',
    opts:['Fájlok keresésére','Internetes böngészésre','Hardvereszközök és illesztőprogramok kezelésére','Programok futtatására'],
    ans:'Hardvereszközök és illesztőprogramok kezelésére' },
  { id:'B-PC4', q:'Mit jelent a „Futtatás rendszergazdaként" lehetőség Windows-ban?',
    opts:['A program gyorsabban fut','A program automatikusan frissül','A program emelt szintű, rendszergazdai jogosultságokkal fut','A program csak az adminisztrátor számára látható'],
    ans:'A program emelt szintű, rendszergazdai jogosultságokkal fut' },
  { id:'B-PC5', q:'Mire való a „Rendszer-visszaállítás" (System Restore)?',
    opts:['Az összes fájl törlése','Az OS frissítése','A rendszer visszaállítása egy korábbi, működő állapotba','A jelszó visszaállítása'],
    ans:'A rendszer visszaállítása egy korábbi, működő állapotba' },
  { id:'B-M1', q:'Hogyan nevezzük a mobiltelefononkra letölthető programokat?',
    opts:['Szoftverek','Fájlok','Dokumentumok','Alkalmazások (appok)'], ans:'Alkalmazások (appok)' },
  { id:'B-M2', q:'Honnan tölthetők le alkalmazások Android okostelefonra?',
    opts:['App Store','Microsoft Store','Google Play Áruház','iTunes'], ans:'Google Play Áruház' },
  { id:'B-M3', q:'Hol lehet beállítani a mobiltelefon képernyőzárját?',
    opts:['Alkalmazásboltban','Feladatkezelőben','Beállítások → Biztonság','Csak szervizben'],
    ans:'Beállítások → Biztonság' },
  { id:'B-M4', q:'Mire való a „repülő üzemmód" mobilon?',
    opts:['A GPS bekapcsolására','A telefon leállítására','Minden vezeték nélküli kapcsolat kikapcsolására','A képernyő fényerejének csökkentésére'],
    ans:'Minden vezeték nélküli kapcsolat kikapcsolására' },
  { id:'B-M5', q:'Hogyan vonható vissza egy alkalmazás engedélye (pl. kamera hozzáférés) mobilon?',
    opts:['Csak az alkalmazás törlésével','Gyári visszaállítással','Beállítások → Alkalmazások → Engedélyek','Telepítés után nem vonható vissza'],
    ans:'Beállítások → Alkalmazások → Engedélyek' },
  { id:'B-Á1', q:'Mire való a felhasználói fiókok kezelése az operációs rendszerben?',
    opts:['Az internetsebesség növelésére','A számítógép gyorsabb indítására','Különböző jogosultságok és beállítások biztosítása különböző felhasználóknak','A fájlok automatikus mentésére'],
    ans:'Különböző jogosultságok és beállítások biztosítása különböző felhasználóknak' },
  { id:'B-Á2', q:'Mire való a képernyőfeloldó jelszó/PIN/minta?',
    opts:['A képernyő fényerejének beállítására','A töltési sebesség növelésére','Az eszköz védelme illetéktelen hozzáféréstől','Az internetkapcsolat biztosítására'],
    ans:'Az eszköz védelme illetéktelen hozzáféréstől' },
  { id:'B-Á3', q:'Mit jelent a „kisegítő lehetőségek" (Accessibility) beállítás?',
    opts:['Titkosítási beállítások','Hálózati beállítások','Fogyatékossággal élő felhasználók számára segítő funkciók (nagyítás, felolvasás)','Biztonsági mentés beállítások'],
    ans:'Fogyatékossággal élő felhasználók számára segítő funkciók (nagyítás, felolvasás)' },
  { id:'B-Á4', q:'Mire való a „Ne zavarjanak" (Do Not Disturb) mód?',
    opts:['A WiFi kikapcsolására','Az akkumulátor kímélésére','Értesítések és hívások elnémítására','A képernyő kikapcsolására'],
    ans:'Értesítések és hívások elnémítására' },
  { id:'B-Á5', q:'Mit jelent az „energiatakarékos mód" bekapcsolása?',
    opts:['A gép/telefon azonnali kikapcsolását','Az összes alkalmazás bezárását','A WiFi automatikus kikapcsolását','A teljesítmény csökkentésével az áramfogyasztás mérséklését'],
    ans:'A teljesítmény csökkentésével az áramfogyasztás mérséklését' },
];

// ── 3a. PC ÉS MOBIL – KÖRNYEZET ─────────────────────────────────────────────
QB.t3k = [
  { id:'K1', q:'Mire való a router az otthoni hálózatban?',
    opts:['Képek nyomtatására','Fájlok tárolására','Az internetkapcsolat megosztására a hálózati eszközök között','Hangszórók vezérlésére'],
    ans:'Az internetkapcsolat megosztására a hálózati eszközök között' },
  { id:'K2', q:'Melyik nyomtatófajtában használunk tonert?',
    opts:['Tintasugaras nyomtató','Mátrixnyomtató','Lézernyomtató','Termális nyomtató'], ans:'Lézernyomtató' },
  { id:'K3', q:'Mire való a szkenner (lapolvasó)?',
    opts:['Képek nyomtatására','Hangok rögzítésére','Papíralapú dokumentumokat és fotókat beolvasás után digitális fájlokká alakítja','Fájlok tárolására'],
    ans:'Papíralapú dokumentumokat és fotókat beolvasás után digitális fájlokká alakítja' },
  { id:'K4', q:'Mi a monitor feladata?',
    opts:['Az adatok tárolása','A hangok lejátszása','A számítógép adatait látható képpé vagy szöveggé alakítja','Az internetkapcsolat biztosítása'],
    ans:'A számítógép adatait látható képpé vagy szöveggé alakítja' },
  { id:'K5', q:'Mire való a webkamera otthoni/irodai környezetben?',
    opts:['A monitor csatlakoztatására','Videóhívásokhoz és képrögzítéshez','Az internetkapcsolat erősítésére','Fájlok biztonsági mentésére'],
    ans:'Videóhívásokhoz és képrögzítéshez' },
  { id:'K6', q:'Mi a billentyűzet és egér szerepe?',
    opts:['Adatok tárolása','Képek megjelenítése','Adatbevitel és a számítógép vezérlése','Hangok lejátszása'],
    ans:'Adatbevitel és a számítógép vezérlése' },
  { id:'K7', q:'Mire való a külső merevlemez (HDD/SSD)?',
    opts:['Az internetkapcsolat bővítésére','Adatok hordozható tárolására és biztonsági mentésre','A monitor csatlakoztatására','A nyomtató vezérlésére'],
    ans:'Adatok hordozható tárolására és biztonsági mentésre' },
  { id:'K8', q:'Mi az UPS (szünetmentes tápegység) feladata?',
    opts:['Az internet sebességének növelése','Áramkimaradás esetén ideiglenesen tápellátást biztosít','A számítógép hűtése','A hangszórók erősítése'],
    ans:'Áramkimaradás esetén ideiglenesen tápellátást biztosít', image:'images/ups.jpg' },
  { id:'K9', q:'Mire való a projektor irodai környezetben?',
    opts:['Fájlok nyomtatására','Képek és prezentációk vetítésére nagy felületre','Az internetkapcsolat megosztására','Adatok biztonsági mentésére'],
    ans:'Képek és prezentációk vetítésére nagy felületre' },
  { id:'K10', q:'Mi a pendrive (USB flash meghajtó) fő feladata?',
    opts:['Az internetkapcsolat bővítése','A számítógép gyorsítása','Kis méretű adatok hordozható tárolása és átvitele','A nyomtató csatlakoztatása'],
    ans:'Kis méretű adatok hordozható tárolása és átvitele' },
];

// ── 3b. PC ÉS MOBIL – ALKATRÉSZEK ───────────────────────────────────────────
QB.t3a = [
  { id:'A-PC1', q:'Mi a CPU (processzor) feladata a számítógépben?',
    opts:['Adatok hosszú távú tárolása','A képernyő megjelenítésének vezérlése','Az utasítások végrehajtása, a számítógép „agya"','Az internetkapcsolat kezelése'],
    ans:'Az utasítások végrehajtása, a számítógép „agya"' },
  { id:'A-PC2', q:'Mit tapasztalunk, ha egy számítógépben kevés a RAM?',
    opts:['Nem tud csatlakozni az internethez','Nem jeleníti meg a képeket','Lelassul, ha egyszerre több programot futtatunk','Nem indul el az operációs rendszer'],
    ans:'Lelassul, ha egyszerre több programot futtatunk' },
  { id:'A-PC3', q:'Mire való a merevlemez (HDD/SSD) a számítógépben?',
    opts:['A futó programok ideiglenes tárolására','A képernyő megjelenítésének vezérlésére','Az operációs rendszer, programok és fájlok tartós tárolására','Az internetkapcsolat kezelésére'],
    ans:'Az operációs rendszer, programok és fájlok tartós tárolására' },
  { id:'A-PC4', q:'Mire való a GPU (grafikus kártya)?',
    opts:['A hang feldolgozására','Képek, videók és 3D tartalmak megjelenítésének feldolgozására','Az internetkapcsolat kezelésére','A fájlok tárolására'],
    ans:'Képek, videók és 3D tartalmak megjelenítésének feldolgozására', image:'images/gpu.jpg' },
  { id:'A-PC5', q:'Melyik központi áramköri egység nélkül nem tudnának a számítógép részei (CPU, RAM, merevlemez) egymással működni?',
    opts:['GPU','Tápegység','Monitor','Alaplap'], ans:'Alaplap' },
  { id:'A-M1', q:'Mi a mobiltelefon akkumulátorának feladata?',
    opts:['Az internetkapcsolat biztosítása','Adatok tárolása','A készülék tápellátásának biztosítása','A képernyő fényerejének szabályozása'],
    ans:'A készülék tápellátásának biztosítása' },
  { id:'A-M2', q:'Mire való a SIM-kártya a mobiltelefonban?',
    opts:['Képek tárolására','Az előfizető azonosítására és a mobilhálózathoz való csatlakozásra','Az akkumulátor védelmére','A WiFi kapcsolat kezelésére'],
    ans:'Az előfizető azonosítására és a mobilhálózathoz való csatlakozásra' },
  { id:'A-M3', q:'Mi a mobiltelefon kijelzőjének kettős szerepe?',
    opts:['Hang lejátszása és töltés','Megjelenítés és érintéses adatbevitel egyszerre','Fényképezés és videózás','GPS és navigáció'],
    ans:'Megjelenítés és érintéses adatbevitel egyszerre' },
  { id:'A-M4', q:'Mire való a mobiltelefon hátsó kamerája?',
    opts:['Videóhívásokhoz','Fényképek és videók rögzítésére','Az ujjlenyomat-olvasásra','A hangszóró vezérlésére'],
    ans:'Fényképek és videók rögzítésére' },
  { id:'A-M5', q:'Mi a különbség a mobiltelefon belső tárhelye és a RAM között?',
    opts:['Nincs különbség','A RAM nagyobb mint a belső tárhely','A belső tárhely tartósan tárolja az adatokat, a RAM csak futás közben használt ideiglenes tároló','A belső tárhely csak az operációs rendszert tárolja'],
    ans:'A belső tárhely tartósan tárolja az adatokat, a RAM csak futás közben használt ideiglenes tároló' },
];

// ── 4. KARBANTARTÁS ──────────────────────────────────────────────────────────
QB.t4 = [
  { id:'KA1', q:'Miért fontos rendszeresen eltávolítani a port a számítógép belsejéből?',
    opts:['Mert a por törli az adatokat','Mert a por lassítja az internetkapcsolatot','Mert a felgyülemlett por túlmelegedést okozhat, ami károsítja az alkatrészeket','Mert a por vírusokat tartalmaz'],
    ans:'Mert a felgyülemlett por túlmelegedést okozhat, ami károsítja az alkatrészeket' },
  { id:'KA2', q:'Mire való a töredezettség-mentesítés (defragmentálás) HDD esetén?',
    opts:['A vírusok törlésére','A merevlemez formázására','A szétszórt fájldarabok egymás mellé rendezésére a gyorsabb működés érdekében','A RAM megtisztítására'],
    ans:'A szétszórt fájldarabok egymás mellé rendezésére a gyorsabb működés érdekében' },
  { id:'KA3', q:'Mire való a „Lemezterület-felszabadítás" funkció Windows-ban?',
    opts:['A merevlemez formázására','Felesleges ideiglenes fájlok törlésére, szabad tárhely visszanyerésére','A vírusok eltávolítására','A RAM növelésére'],
    ans:'Felesleges ideiglenes fájlok törlésére, szabad tárhely visszanyerésére' },
  { id:'KA4', q:'Mi a rendszeres biztonsági mentés (backup) célja?',
    opts:['A számítógép gyorsítása','Az adatok megőrzése meghibásodás, vírusfertőzés vagy véletlen törlés esetén','Az operációs rendszer frissítése','A programok automatikus telepítése'],
    ans:'Az adatok megőrzése meghibásodás, vírusfertőzés vagy véletlen törlés esetén' },
  { id:'KA5', q:'Melyik tevékenység tartozik a számítógép rendszeres szoftveres karbantartásához?',
    opts:['A monitor törlése','A billentyűzet cseréje','Vírusellenőrzés futtatása és ideiglenes fájlok törlése','A tápkábel ellenőrzése'],
    ans:'Vírusellenőrzés futtatása és ideiglenes fájlok törlése' },
  { id:'KT1', q:'Mit érdemes először megpróbálni, ha a router nem működik megfelelően?',
    opts:['Azonnal szakembert hívni','Az összes kábelt kicserélni','Újraindítani az eszközt','A SIM-kártyát eltávolítani'],
    ans:'Újraindítani az eszközt' },
  { id:'KT2', q:'Miért fontos a router szoftverének (firmware) rendszeres frissítése?',
    opts:['Hogy gyorsabb legyen a WiFi jel','Hogy több eszközt lehessen csatlakoztatni','Biztonsági rések javítása és a stabilitás javítása érdekében','Hogy nagyobb legyen a hatótávolság'],
    ans:'Biztonsági rések javítása és a stabilitás javítása érdekében' },
  { id:'KT3', q:'Mit kell ellenőrizni, ha az internetkapcsolat megszakad?',
    opts:['A monitor fényerejét','A billentyűzet csatlakozását','A kábelek csatlakozását és a router működését','A nyomtató állapotát'],
    ans:'A kábelek csatlakozását és a router működését' },
  { id:'KT4', q:'Hogyan karbantartható egy mobiltelefon akkumulátora a hosszabb élettartam érdekében?',
    opts:['Mindig 100%-ra tölteni és teljesen lemeríteni','Kerülni a teljes lemerítést és a tartós 100%-os töltöttséget','Naponta kétszer tölteni','Csak eredeti töltővel tölteni, más nem számít'],
    ans:'Kerülni a teljes lemerítést és a tartós 100%-os töltöttséget' },
  { id:'KT5', q:'Mire utal, ha egy hálózati eszköz (router, switch) jelzőfénye pirosra vált vagy kialszik?',
    opts:['Hogy az eszköz teljesen feltöltött','Hogy az eszköz frissítést tölt le','Hogy hiba lépett fel, ellenőrizni kell a csatlakozásokat vagy újra kell indítani','Hogy az eszköz energiatakarékos módban van'],
    ans:'Hogy hiba lépett fel, ellenőrizni kell a csatlakozásokat vagy újra kell indítani' },
];

// ── 5. INFORMATIKAI HÁLÓZATOK ────────────────────────────────────────────────
QB.t5 = [
  { id:'H1', q:'Mi a LAN rövidítés feloldása?',
    opts:['Local Area Network','Long Area Network','Large Access Node','Linked Area Net'], ans:'Local Area Network' },
  { id:'H2', q:'Mi különbözteti meg a WAN-t a LAN-tól?',
    opts:['A WAN nagyobb területet fed le (pl. az internet)','A WAN csak vezeték nélküli hálózatot jelent','A WAN mindig gyorsabb, mint a LAN','A WAN csak vállalatoknál használható'],
    ans:'A WAN nagyobb területet fed le (pl. az internet)' },
  { id:'H3', q:'Mi az SSID?',
    opts:['A WiFi hálózat neve','A router IP-címe','A WiFi titkosítási kulcsa','A hálózati kártya azonosítója'],
    ans:'A WiFi hálózat neve' },
  { id:'H4', q:'Melyik eszköz osztja el az internetet otthon több eszköz között?',
    opts:['Router','Switch','Hub','Modem'], ans:'Router' },
  { id:'H5', q:'Mi az IP-cím szerepe a hálózatban?',
    opts:['Egyedileg azonosítja az eszközöket a hálózaton','A WiFi titkosítási jelszó','A hálózati kártya fizikai azonosítója','A szerver neve'],
    ans:'Egyedileg azonosítja az eszközöket a hálózaton' },
  { id:'H6', q:'Melyik WiFi biztonsági protokoll a legbiztonságosabb?',
    opts:['WPA2','WEP','WPA','Mindegyik egyformán biztonságos'], ans:'WPA2' },
  { id:'H7', q:'Mit jelöl az IEEE 802.11 szabvány?',
    opts:['A vezeték nélküli hálózat (WiFi) szabványa','Az Ethernet kábel szabványa','A Bluetooth kommunikáció szabványa','Az USB csatlakozó szabványa'],
    ans:'A vezeték nélküli hálózat (WiFi) szabványa' },
  { id:'H8', q:'Hány rétegből áll az OSI modell?',
    opts:['7','4','5','8'], ans:'7' },
  { id:'H9', q:'Mi a DNS feladata?',
    opts:['Domainneveket (pl. google.com) IP-címmé alakítja','A WiFi jelszavát tárolja','A hálózat sebességét méri','A router bejelentkezési adatait kezeli'],
    ans:'Domainneveket (pl. google.com) IP-címmé alakítja' },
  { id:'H10', q:'Melyik protokoll biztosít titkosított, biztonságos kapcsolatot hálózati eszközökhöz?',
    opts:['SSH','FTP','HTTP','DHCP'], ans:'SSH' },
];

// ── 6. VÁLLALATI HÁLÓZATOK ───────────────────────────────────────────────────
QB.t6 = [
  { id:'V1', q:'Mi az intranet?',
    opts:['Csak a vállalaton belül elérhető belső hálózat','Egy biztonságos internetes böngésző','A vállalat nyilvános weboldala','Titkosított internetkapcsolat'],
    ans:'Csak a vállalaton belül elérhető belső hálózat' },
  { id:'V2', q:'Mi a szerver feladata a vállalati hálózatban?',
    opts:['Szolgáltatásokat és erőforrásokat nyújt a többi gépnek','Csak a nyomtatókat kezeli','Az internetet osztja el a dolgozóknak','Vírusoktól védi a hálózatot'],
    ans:'Szolgáltatásokat és erőforrásokat nyújt a többi gépnek' },
  { id:'V3', q:'Mi a VPN?',
    opts:['Titkosított, biztonságos kapcsolat egy nyilvános hálózaton keresztül','Egy vállalati tűzfal típusa','Egy hálózati kábel szabvány','Egy szerver operációs rendszer'],
    ans:'Titkosított, biztonságos kapcsolat egy nyilvános hálózaton keresztül' },
  { id:'V4', q:'Mi a tűzfal (firewall) feladata?',
    opts:['Szűri a hálózati forgalmat, és blokkolja az engedély nélküli hozzáférést','Gyorsítja az internet sebességét','Biztonsági másolatot készít az adatokról','A WiFi jelet erősíti'],
    ans:'Szűri a hálózati forgalmat, és blokkolja az engedély nélküli hozzáférést' },
  { id:'V5', q:'Mit nevezzük domain-nek egy vállalati hálózatban?',
    opts:['Közösen kezelt számítógépek és felhasználók csoportja','A vállalat internetes webcíme','A szerver operációs rendszere','A hálózat fizikai kábelhálózata'],
    ans:'Közösen kezelt számítógépek és felhasználók csoportja' },
  { id:'V6', q:'Mi a fájlszerver szerepe?',
    opts:['Közös tárolóhelyet biztosít a hálózaton lévő felhasználóknak','Az e-maileket kezeli','A nyomtatási feladatokat irányítja','A felhasználók jelszavait tárolja'],
    ans:'Közös tárolóhelyet biztosít a hálózaton lévő felhasználóknak' },
  { id:'V7', q:'Melyik eszköz köti össze a különböző hálózatokat, és irányítja az adatforgalmat köztük?',
    opts:['Router','Switch','Hub','Access point'], ans:'Router' },
  { id:'V8', q:'Mi a switch feladata a vállalati hálózatban?',
    opts:['Az azonos hálózaton belül irányítja az adatcsomagokat a megfelelő eszközhöz','Az internetet osztja el a dolgozóknak','Titkosítja a hálózati forgalmat','A WiFi jelet sugározza'],
    ans:'Az azonos hálózaton belül irányítja az adatcsomagokat a megfelelő eszközhöz', image:'images/switch.jpg' },
  { id:'V9', q:'Mi a levelezőszerver (e-mail szerver) feladata?',
    opts:['Fogadja, tárolja és továbbítja a vállalaton belüli és kívüli e-maileket','A dolgozók fájljait tárolja közösen','A nyomtatási feladatokat kezeli','Az internetkapcsolatot osztja el'],
    ans:'Fogadja, tárolja és továbbítja a vállalaton belüli és kívüli e-maileket' },
  { id:'V10', q:'Mit jelent a jogosultságkezelés a vállalati hálózatban?',
    opts:['Meghatározza, ki milyen adatokhoz és funkciókhoz férhet hozzá','A dolgozók internethasználatát méri','A hálózati eszközök karbantartási ütemtervét kezeli','A szerverek teljesítményét figyeli'],
    ans:'Meghatározza, ki milyen adatokhoz és funkciókhoz férhet hozzá' },
];

// ── 7. HÁLÓZATBIZTONSÁG ──────────────────────────────────────────────────────
QB.t7 = [
  { id:'HB1', q:'Mi a számítógépes vírus?',
    opts:['Olyan kártékony program, amely más fájlokba másolja magát és kárt okoz','Egy hálózati támadás típusa','Egy titkosítási protokoll','Egy hálózati eszköz hibája'],
    ans:'Olyan kártékony program, amely más fájlokba másolja magát és kárt okoz' },
  { id:'HB2', q:'Mik az erős jelszó ismérvei?',
    opts:['Kis- és nagybetűk, számok és speciális karakterek kombinációja','Legalább 4 karakter, ami könnyen megjegyezhető','A felhasználó neve és születési éve','Egy szótárban szereplő szó, hogy ne felejtse el'],
    ans:'Kis- és nagybetűk, számok és speciális karakterek kombinációja' },
  { id:'HB3', q:'Mi a számítógépes trójai faló (trojan) lényege?',
    opts:['Hasznos programnak álcázza magát, de káros tevékenységet végez','Önállóan terjed a hálózaton','Titkosítja a fájlokat, majd váltságdíjat követel','Letiltja a tűzfalat'],
    ans:'Hasznos programnak álcázza magát, de káros tevékenységet végez' },
  { id:'HB4', q:'Mi a DDoS támadás célja?',
    opts:['Egy szolgáltatás megbénítása túlterheléssel','Jelszavak ellopása','Fájlok titkosítása','A hálózati forgalom lehallgatása'],
    ans:'Egy szolgáltatás megbénítása túlterheléssel' },
  { id:'HB5', q:'Melyik WiFi titkosítási protokoll a leggyengébb, és már nem biztonságos?',
    opts:['WEP','WPA','WPA2','Mindegyik egyformán gyenge'], ans:'WEP' },
  { id:'HB6', q:'Mi az adathalászat (phishing)?',
    opts:['Hamis üzenetekkel próbálják megszerezni a felhasználó adatait','Egy hálózati eszköz feltörési módszere','Kártékony program, amely fájlokat töröl','Túlterheléses hálózati támadás'],
    ans:'Hamis üzenetekkel próbálják megszerezni a felhasználó adatait' },
  { id:'HB7', q:'Mi a tűzfal (firewall) feladata a biztonságban?',
    opts:['Szűri a bejövő és kimenő hálózati forgalmat','Titkosítja a WiFi jelszavát','Vírusokat keres és töröl a gépről','Biztonsági másolatot készít az adatokról'],
    ans:'Szűri a bejövő és kimenő hálózati forgalmat' },
  { id:'HB8', q:'Miért veszélyes nyilvános WiFi hálózatot használni?',
    opts:['Illetéktelenek ellophatják a jelszavainkat, személyes adatainkat, vagy megfigyelhetik az online tevékenységünket','A nyilvános WiFi automatikusan vírusokat tölt le a gépre','Nyilvános WiFi-n nem lehet jelszót használni','A nyilvános WiFi mindig lassabb a mobilinternetnél'],
    ans:'Illetéktelenek ellophatják a jelszavainkat, személyes adatainkat, vagy megfigyelhetik az online tevékenységünket' },
  { id:'HB9', q:'Mi az antivírus program feladata?',
    opts:['Kártékony szoftvereket keres, jelöl meg és távolít el','Titkosítja a hálózati forgalmat','Szűri a nem kívánt e-maileket','Védi a WiFi jelszavát'],
    ans:'Kártékony szoftvereket keres, jelöl meg és távolít el' },
  { id:'HB10', q:'Mi a zsarolóvírus (ransomware)?',
    opts:['Titkosítja az áldozat fájljait, majd váltságdíjat követel a visszaállításért','Jelszavakat lop el a böngészőből','A hálózatot terheli túl','Hamis rendszerüzeneteket jelenít meg'],
    ans:'Titkosítja az áldozat fájljait, majd váltságdíjat követel a visszaállításért' },
  { id:'HB11', q:'Mi a kétlépéses azonosítás (2FA) lényege?',
    opts:['Jelszó mellett egy második megerősítés is szükséges a belépéshez (pl. SMS-kód)','Kétféle jelszót kell egymás után megadni','Két különböző eszközön is meg kell adni a jelszót','A rendszer kétpercenként új jelszót generál'],
    ans:'Jelszó mellett egy második megerősítés is szükséges a belépéshez (pl. SMS-kód)' },
  { id:'HB12', q:'Mit jelent a lakat ikon és a HTTPS a böngésző címsorában?',
    opts:['A kapcsolat titkosított, az adatok biztonságosan közlekednek','Az oldal vírusmentes','Az oldal megbízható cég tulajdona','A jelszavunk mentve van a böngészőben'],
    ans:'A kapcsolat titkosított, az adatok biztonságosan közlekednek' },
  { id:'HB13', q:'Mi a spam?',
    opts:['Kéretlen, tömeges üzenet, általában reklám vagy átverési kísérlet','Egy kártékony program, amely fájlokat töröl','Egy hálózati túlterheléses támadás','Titkosított e-mail típus'],
    ans:'Kéretlen, tömeges üzenet, általában reklám vagy átverési kísérlet' },
  { id:'HB14', q:'Mi a számítógépes kémprogram (spyware)?',
    opts:['Ártalmatlannak tűnő fájlba rejtve települ, majd csendben figyeli a tevékenységünket és ellopja személyes adatainkat','Egy program, amely reklámokat jelenít meg a képernyőn','Egy hálózati támadás, amely leterheli a szervert','Olyan program, amely titkosítja a fájlokat és váltságdíjat követel'],
    ans:'Ártalmatlannak tűnő fájlba rejtve települ, majd csendben figyeli a tevékenységünket és ellopja személyes adatainkat' },
];

// ── 8a. MODERN TECHNOLÓGIÁK – AI ÉS ADATOK ──────────────────────────────────
QB.t8ai = [
  { id:'AI1', q:'Mi a mesterséges intelligencia (AI) lényege?',
    opts:['Egy speciális számítógép típus','Olyan számítógépes rendszer, amely emberi gondolkodást utánzó feladatokat képes elvégezni','Vírusvédelmi szoftver','Internetes böngésző'],
    ans:'Olyan számítógépes rendszer, amely emberi gondolkodást utánzó feladatokat képes elvégezni' },
  { id:'AI2', q:'Mi a chatbot?',
    opts:['Egy vírusprogram','Mesterséges intelligenciát használó, automatikusan válaszoló program','Egy felhőszolgáltatás','Egy VR eszköz'],
    ans:'Mesterséges intelligenciát használó, automatikusan válaszoló program' },
  { id:'AI3', q:'Mi a szerepe az algoritmusoknak a közösségi médiában?',
    opts:['Vírusokat szűrnek ki','Elemzik a felhasználói szokásokat, és személyre szabott tartalmakat jelenítenek meg','Titkosítják az üzeneteket','Gyorsítják az internetkapcsolatot'],
    ans:'Elemzik a felhasználói szokásokat, és személyre szabott tartalmakat jelenítenek meg' },
  { id:'AI4', q:'Mi a Big Data?',
    opts:['Egy vírusvédelmi program','Hagyományos eszközökkel nehezen kezelhető, rendkívül nagy adathalmazok','Egy felhőszolgáltatás típusa','Nagy felbontású videófájlok gyűjteménye'],
    ans:'Hagyományos eszközökkel nehezen kezelhető, rendkívül nagy adathalmazok' },
  { id:'AI5', q:'Mire használják a Big Data elemzést a vállalatok?',
    opts:['Vírusok felderítésére','Vásárlói szokások elemzésére és döntéshozatal támogatására','Fájlok titkosítására','Hálózatok gyorsítására'],
    ans:'Vásárlói szokások elemzésére és döntéshozatal támogatására' },
  { id:'AI6', q:'Mi a gépi tanulás (machine learning)?',
    opts:['Számítógépek programozás nélkül tanulnak adatokból','Emberek által programozott szabályrendszer','Egy hálózati protokoll','Adatok titkosítási módszere'],
    ans:'Számítógépek programozás nélkül tanulnak adatokból' },
  { id:'AI7', q:'Mire képes ma már a mesterséges intelligencia a képfeldolgozás területén?',
    opts:['Csak színek felismerésére','Arcok, tárgyak és szövegek felismerésére képeken','Csak vonalkódok olvasására','Csak QR-kódok beolvasására'],
    ans:'Arcok, tárgyak és szövegek felismerésére képeken' },
  { id:'AI8', q:'Mi az automatizáció az iparban?',
    opts:['Gépek internetre csatlakoztatása','Emberi munkát gépekkel vagy szoftverekkel váltanak ki','Adatok felhőbe mentése','Gyári hálózatok védelme'],
    ans:'Emberi munkát gépekkel vagy szoftverekkel váltanak ki' },
  { id:'AI9', q:'Melyik területen alkalmazzák az AI-t az egészségügyben?',
    opts:['Csak adminisztrációs feladatokra','Betegségek diagnosztizálásának segítésére és orvosi képek elemzésére','Csak gyógyszerek tárolására','Csak kórházi hálózatok védelmére'],
    ans:'Betegségek diagnosztizálásának segítésére és orvosi képek elemzésére' },
  { id:'AI10', q:'Milyen veszélyeket hordoz a mesterséges intelligencia terjedése?',
    opts:['Lassítja az internetkapcsolatot','Félrevezető tartalmak (deepfake, álhírek) gyártása, munkahelyek megszűnése és adatvédelmi kockázatok','Csak az energiafogyasztást növeli','Kizárólag a hálózatbiztonságot veszélyezteti'],
    ans:'Félrevezető tartalmak (deepfake, álhírek) gyártása, munkahelyek megszűnése és adatvédelmi kockázatok' },
];

// ── 8b. MODERN TECHNOLÓGIÁK – FELHŐ ÉS TÁRHELY ──────────────────────────────
QB.t8fh = [
  { id:'FH1', q:'Mi a felhőszolgáltatás (cloud computing)?',
    opts:['Adatok és programok interneten keresztül való tárolása és elérése','Egy speciális WiFi erősítő','Titkosított e-mail rendszer','Egy vírusvédelmi megoldás'],
    ans:'Adatok és programok interneten keresztül való tárolása és elérése' },
  { id:'FH2', q:'Mire való a Google Drive, iCloud, OneDrive?',
    opts:['Vírusvédelemre','Felhőalapú fájltárolásra és megosztásra','Videokonferenciára','Programok telepítésére'],
    ans:'Felhőalapú fájltárolásra és megosztásra' },
  { id:'FH3', q:'Mi a streaming lényege?',
    opts:['Fájlok letöltése tárolásra','Tartalom (videó, zene) lejátszása letöltés nélkül, interneten keresztül','Adatok titkosítása','Fájlok tömörítése'],
    ans:'Tartalom (videó, zene) lejátszása letöltés nélkül, interneten keresztül' },
  { id:'FH4', q:'Mi a felhőalapú tárolás legnagyobb előnye?',
    opts:['Gyorsabb a számítógép','Bárhonnan, bármilyen eszközről elérhető az adat','Nem kell internet','Vírusmentes lesz a gép'],
    ans:'Bárhonnan, bármilyen eszközről elérhető az adat' },
  { id:'FH5', q:'Mi az egyik előnye a felhőalapú dokumentumszerkesztésnek (pl. Google Docs)?',
    opts:['Nem kell internet hozzá','Több felhasználó egyszerre, valós időben szerkesztheti ugyanazt a dokumentumot','Gyorsabb mint a telepített program','Automatikusan vírusmentesíti a fájlokat'],
    ans:'Több felhasználó egyszerre, valós időben szerkesztheti ugyanazt a dokumentumot' },
  { id:'FH6', q:'Melyik ismert streaming videószolgáltatás?',
    opts:['Google Drive','Netflix','OneDrive','Dropbox'], ans:'Netflix' },
  { id:'FH7', q:'Mi a podcast?',
    opts:['Egy videójáték típus','Interneten elérhető, letölthető vagy streamelhető hangfelvétel-sorozat','Egy felhőszolgáltatás','Egy közösségi platform típusa'],
    ans:'Interneten elérhető, letölthető vagy streamelhető hangfelvétel-sorozat' },
  { id:'FH8', q:'Mi a videokonferencia?',
    opts:['Előre felvett videó megtekintése','Interneten keresztüli élő videós csoportos kommunikáció','Felhőalapú fájlmegosztás','Streaming tartalom nézése'],
    ans:'Interneten keresztüli élő videós csoportos kommunikáció' },
  { id:'FH9', q:'Mi az e-learning?',
    opts:['Elektronikus levelezés','Interneten keresztüli online tanulás','Felhőalapú adattárolás','Videók streamelése'],
    ans:'Interneten keresztüli online tanulás' },
  { id:'FH10', q:'Melyik felhőszolgáltatás tartozik a Microsoft-hoz?',
    opts:['iCloud','Google Drive','OneDrive','Dropbox'], ans:'OneDrive' },
];

// ── 8c. MODERN TECHNOLÓGIÁK – ESZKÖZÖK ÉS TRENDEK ──────────────────────────
QB.t8et = [
  { id:'ET1', q:'Mire utal az IoT (Dolgok internete) fogalom?',
    opts:['Egy biztonsági protokoll','Hétköznapi tárgyak internethez való csatlakoztatása','Egy közösségi platform','Egy fájlformátum'],
    ans:'Hétköznapi tárgyak internethez való csatlakoztatása' },
  { id:'ET2', q:'Mi a VR (virtuális valóság)?',
    opts:['Egy vírusvédelmi program','Számítógéppel létrehozott mesterséges környezet, amibe teljesen „beléphetünk"','Egy felhőszolgáltatás','Egy hálózati protokoll'],
    ans:'Számítógéppel létrehozott mesterséges környezet, amibe teljesen „beléphetünk"' },
  { id:'ET3', q:'Mi a kiterjesztett valóság (AR)?',
    opts:['Teljesen mesterséges környezetet hoz létre','A valódi világ képére digitális információkat vagy tárgyakat vetítünk (pl.: Pokémon Go)','Egy online tárhely','Egy biztonsági rendszer'],
    ans:'A valódi világ képére digitális információkat vagy tárgyakat vetítünk (pl.: Pokémon Go)' },
  { id:'ET4', q:'Mi az 5G?',
    opts:['Egy WiFi szabvány','Az ötödik generációs mobil adatátviteli technológia','Egy streaming szolgáltatás','Egy operációs rendszer'],
    ans:'Az ötödik generációs mobil adatátviteli technológia' },
  { id:'ET5', q:'Mi az okosotthon (smart home)?',
    opts:['Egy internet-biztonsági rendszer','Interneten keresztül vezérelhető, automatizált otthoni eszközök rendszere','Egy felhőszolgáltatás','Egy VR alkalmazás'],
    ans:'Interneten keresztül vezérelhető, automatizált otthoni eszközök rendszere' },
  { id:'ET6', q:'Melyik az IoT eszköz példája?',
    opts:['Pendrive','Okos termosztát, amely telefonról vezérelhető','Külső merevlemez','Nyomtató'],
    ans:'Okos termosztát, amely telefonról vezérelhető' },
  { id:'ET7', q:'Mi az okosóra (smartwatch) egyik fő funkciója?',
    opts:['Csak az időt mutatja','Egészségügyi adatok mérése (pulzus, lépésszám) és értesítések fogadása','Csak telefonhívásra használható','Csak GPS-navigációra használható'],
    ans:'Egészségügyi adatok mérése (pulzus, lépésszám) és értesítések fogadása' },
  { id:'ET8', q:'Mi a különbség a 4G és az 5G között?',
    opts:['Az 5G csak WiFi-n működik','Az 5G gyorsabb adatátvitelt és kisebb késleltetést biztosít','A 4G gyorsabb mint az 5G','Nincs köztük különbség'],
    ans:'Az 5G gyorsabb adatátvitelt és kisebb késleltetést biztosít' },
  { id:'ET9', q:'Mire használják a kriptovalutákat (pl. Bitcoin)?',
    opts:['Videók streamelésére','Digitális fizetőeszközként szolgálnak, amelyek banki közvetítő nélkül cserélnek gazdát','Felhőalapú tárolásra','Okosotthon vezérlésére'],
    ans:'Digitális fizetőeszközként szolgálnak, amelyek banki közvetítő nélkül cserélnek gazdát' },
  { id:'ET10', q:'Mi a blokklánc (blockchain) lényege a digitális biztonságban?',
    opts:['Egyetlen szerveren tárolja titkosítva az adatokat','Egy olyan digitális adatbázis, ahol az adatok megváltoztathatatlan láncot alkotnak, és egyszerre több ezer gépen tárolják, ezért szinte lehetetlen feltörni','Jelszavakat tárol biztonságosan','Vírusok ellen védi a hálózatot'],
    ans:'Egy olyan digitális adatbázis, ahol az adatok megváltoztathatatlan láncot alkotnak, és egyszerre több ezer gépen tárolják, ezért szinte lehetetlen feltörni' },
  { id:'ET11', q:'Mi a 3D nyomtatás (additív gyártás)?',
    opts:['Képek nagy felbontású nyomtatása','Háromdimenziós tárgyak létrehozása rétegről rétegre, digitális tervek alapján','Egy felhőalapú tervezőprogram','Virtuális valóság eszköz'],
    ans:'Háromdimenziós tárgyak létrehozása rétegről rétegre, digitális tervek alapján' },
  { id:'ET12', q:'Mit jelent a biometrikus azonosítás?',
    opts:['Jelszó és PIN kód együttes használata','Egyedi biológiai jellemzők (pl. arcfelismerés, ujjlenyomat) használata azonosításra','Kétlépéses azonosítás SMS-kóddal','Titkosított jelszókezelő program'],
    ans:'Egyedi biológiai jellemzők (pl. arcfelismerés, ujjlenyomat) használata azonosításra' },
  { id:'ET13', q:'Mit tud egy okosotthon-központ (pl. Amazon Alexa, Google Home, Apple Siri)?',
    opts:['Csak a televíziót vezérli','Egyetlen felületről vagy hangvezérléssel irányítja a lakás világítását, fűtését és biztonsági eszközeit','Csak internetkapcsolatot biztosít','Csak riasztórendszerként működik'],
    ans:'Egyetlen felületről vagy hangvezérléssel irányítja a lakás világítását, fűtését és biztonsági eszközeit' },
];

// ── 9. GIT ÉS CSOPORTMUNKA ───────────────────────────────────────────────────
QB.t9 = [
  { id:'G1', q:'Mi a Git fő célja?',
    opts:['Fájlok felhőbe mentése','Programkód verzióinak követése és csapatmunka támogatása','Vírusvédelem programozóknak','Weboldal üzemeltetése'],
    ans:'Programkód verzióinak követése és csapatmunka támogatása' },
  { id:'G2', q:'Mit jelent a „commit" Git-ben?',
    opts:['Fájl törlése a tárolóból','A változtatások mentése a verziókövetési előzményekbe','Kód feltöltése az internetre','Új fejlesztői fiók létrehozása'],
    ans:'A változtatások mentése a verziókövetési előzményekbe' },
  { id:'G3', q:'Mi a repository (repo)?',
    opts:['Egy Git felhasználói fiók','A projekt fájljait és teljes verzióelőzményét tároló mappa','Egy online fejlesztői fórum','Egy programozási nyelv'],
    ans:'A projekt fájljait és teljes verzióelőzményét tároló mappa' },
  { id:'G4', q:'Mi a GitHub?',
    opts:['Egy vírusvédelmi platform fejlesztőknek','Egy online felület, ahol a fejlesztők tárolják, megosztják és közösen fejlesztik a kódjukat','Egy programozási nyelv','Egy verziókezelő szoftver'],
    ans:'Egy online felület, ahol a fejlesztők tárolják, megosztják és közösen fejlesztik a kódjukat' },
  { id:'G5', q:'Mit jelent az „Open Source" (nyílt forráskód) kifejezés?',
    opts:['Csak fizetős szoftverekre vonatkozik','Olyan szoftver, amelynek kódját bárki szabadon megnézheti, lemásolhatja vagy javíthatja','Titkosított programkód','Csak fejlesztők számára elérhető szoftver'],
    ans:'Olyan szoftver, amelynek kódját bárki szabadon megnézheti, lemásolhatja vagy javíthatja' },
  { id:'G6', q:'Melyik alkalmazásokat használják leggyakrabban a fejlesztőcsapatok az online kommunikációra (csevegés, hangos és videós megbeszélések)?',
    opts:['Trello és Jira','Discord és Slack','GitHub és Git','Google Drive és OneDrive'],
    ans:'Discord és Slack' },
  { id:'G7', q:'Miért nem szerencsés, ha egy csapatban mindenki ugyanazt a fájlt szerkeszti egyszerre verziókezelő nélkül?',
    opts:['Mert lassabb lesz az internetkapcsolat','Mert véletlenül felülírhatják egymás munkáját, és elveszhetnek fontos részek','Mert a fájl automatikusan törlődik','Mert a szoftver leáll'],
    ans:'Mert véletlenül felülírhatják egymás munkáját, és elveszhetnek fontos részek' },
  { id:'G8', q:'Hogy hívjuk azt, amikor több programozó egyszerre, egy közös cél érdekében, rövid idő alatt (pl. egy hétvége alatt) fejleszt valamit?',
    opts:['Webinárium','Hackathon','Kódolás','Commit'],
    ans:'Hackathon' },
  { id:'G9', q:'Mi a verziókezelés legfontosabb előnye csapatmunkában?',
    opts:['Gyorsabbá teszi az internetkapcsolatot','Több fejlesztő egyszerre dolgozhat ugyanazon a projekten anélkül, hogy felülírnák egymás munkáját','Automatikusan javítja a hibákat a kódban','Vírusvédelmet biztosít a kód számára'],
    ans:'Több fejlesztő egyszerre dolgozhat ugyanazon a projekten anélkül, hogy felülírnák egymás munkáját' },
  { id:'G10', q:'Mi a verziókezelés lényege?',
    opts:['Fájlok titkosítása','Vírusvédelem','A kód változásainak nyomon követése, és szükség esetén visszalépés korábbi verzióra','Automatikus hibajavítás'],
    ans:'A kód változásainak nyomon követése, és szükség esetén visszalépés korábbi verzióra' },
];

// ── 10. PROJEKTMENEDZSMENT ───────────────────────────────────────────────────
QB.t10 = [
  { id:'P1', q:'Mi a projektmenedzsment célja?',
    opts:['Programkód verziókövetése','Egy projekt tervezése, szervezése és irányítása a célok elérése érdekében','Fájlok felhőbe mentése','Csapat kommunikációs eszköz'],
    ans:'Egy projekt tervezése, szervezése és irányítása a célok elérése érdekében' },
  { id:'P2', q:'Mi a projektmenedzser (project manager) feladata?',
    opts:['Kódot ír a csapat helyett','A projekt feladatait, határidőit és erőforrásait koordinálja','Csak a pénzügyi elszámolást végzi','A szerverek karbantartása'],
    ans:'A projekt feladatait, határidőit és erőforrásait koordinálja' },
  { id:'P3', q:'Miért érdemes egy nagy projektet kis részfeladatokra bontani?',
    opts:['Mert így gyorsabb a számítógép','Mert a kis feladatok könnyebben kezelhetők, nyomon követhetők és megvalósíthatók','Mert a megrendelő így nem látja az egész projektet','Mert a programok csak kis feladatokat tudnak kezelni'],
    ans:'Mert a kis feladatok könnyebben kezelhetők, nyomon követhetők és megvalósíthatók' },
  { id:'P4', q:'Mit nevezünk mérföldkőnek egy projektben?',
    opts:['Egy nehéz programozási feladatot','A projekt egy fontos, jól meghatározott eredménnyel záruló szakaszát','A projekt teljes befejezését','Egy csapattag távozását a projektből'],
    ans:'A projekt egy fontos, jól meghatározott eredménnyel záruló szakaszát' },
  { id:'P5', q:'Mi az agilis (Agile) módszertan lényege?',
    opts:['A projekt elején mindent megterveznek és szigorúan követik','Rugalmas, szakaszos fejlesztés, ahol a visszajelzések alapján folyamatosan lehet változtatni','Csak nagy vállalatok használhatják','Kizárólag szoftverfejlesztésre alkalmazható'],
    ans:'Rugalmas, szakaszos fejlesztés, ahol a visszajelzések alapján folyamatosan lehet változtatni' },
  { id:'P6', q:'Mi a Scrum?',
    opts:['Egy programozási nyelv','Egy agilis keretrendszer, amely rövid fejlesztési ciklusokban (sprintekben) dolgozik','Egy projektmenedzsment szoftver','Egy verziókezelő rendszer'],
    ans:'Egy agilis keretrendszer, amely rövid fejlesztési ciklusokban (sprintekben) dolgozik' },
  { id:'P7', q:'Mit jelent a „sprint" a Scrum módszertanban?',
    opts:['A projekt teljes időtartama','Rövid, meghatározott idejű fejlesztési szakasz (általában 1-4 hét)','Egy csapattagok közötti megbeszélés','A projekt végső bemutatója'],
    ans:'Rövid, meghatározott idejű fejlesztési szakasz (általában 1-4 hét)' },
  { id:'P8', q:'Mire való a Trello?',
    opts:['Programkód verziókövetésére','Feladatok kártyákon való kezelésére és a csapatmunka szervezésére','Videokonferenciára','Fájlok felhőbe mentésére'],
    ans:'Feladatok kártyákon való kezelésére és a csapatmunka szervezésére' },
  { id:'P9', q:'Miért fontos a rendszeres visszajelzés és kapcsolattartás egy projekt során?',
    opts:['Mert a megrendelő így fizet többet','Mert időben kiderülhetnek a problémák és a változtatási igények, elkerülve a nagy hibákat','Mert a törvény előírja','Mert a csapat így gyorsabban programoz'],
    ans:'Mert időben kiderülhetnek a problémák és a változtatási igények, elkerülve a nagy hibákat' },
  { id:'P10', q:'Mi a különbség a hagyományos (vízesés) és az agilis projektmenedzsment között?',
    opts:['Nincs különbség','A vízesés modellben a fázisok egymás után következnek, az agilis módszer rugalmasabb és visszajelzések alapján alakul','Az agilis módszer lassabb','A vízesés modellt csak építőiparban használják'],
    ans:'A vízesés modellben a fázisok egymás után következnek, az agilis módszer rugalmasabb és visszajelzések alapján alakul' },
];

// ════════════════════════════════════════════════════════════════════════════
// HÚZÁSI KONFIGURÁCIÓ
// ════════════════════════════════════════════════════════════════════════════

const DRAW_CONFIG = [
  { key:'t1',    label:'1. Elektronika',                    qs: QB.t1 },
  { key:'os_t',  label:'2. Operációs rendszerek – Telepítés', qs: QB.os_t },
  { key:'os_f',  label:'2. Operációs rendszerek – Frissítés', qs: QB.os_f },
  { key:'os_b',  label:'2. Operációs rendszerek – Beállítások', qs: QB.os_b },
  { key:'t3k',   label:'3. Eszközök – Környezet',           qs: QB.t3k },
  { key:'t3a',   label:'3. Eszközök – Alkatrészek',         qs: QB.t3a },
  { key:'t4',    label:'4. Karbantartás',                   qs: QB.t4 },
  { key:'t5',    label:'5. Hálózatok',                      qs: QB.t5 },
  { key:'t6',    label:'6. Vállalati hálózatok',            qs: QB.t6 },
  { key:'t7',    label:'7. Hálózatbiztonság',               qs: QB.t7 },
  { key:'t8ai',  label:'8. Modern tech – AI',               qs: QB.t8ai },
  { key:'t8fh',  label:'8. Modern tech – Felhő',            qs: QB.t8fh },
  { key:'t8et',  label:'8. Modern tech – Trendek',          qs: QB.t8et },
  { key:'t9',    label:'9. Git és csoportmunka',            qs: QB.t9 },
  { key:'t10',   label:'10. Projektmenedzsment',            qs: QB.t10 },
];

const TOTAL_Q = 15;
const POINTS_PER_Q = 2;
const MAX_POINTS = TOTAL_Q * POINTS_PER_Q; // 30
const RECENT_KEY = 'interaktivQuizRecent';
const RESULTS_KEY = 'interaktivResults';

function calcGrade(pct) {
  if (pct >= 85) return { jegy: 5, szoveg: 'Jeles' };
  if (pct >= 70) return { jegy: 4, szoveg: 'Jó' };
  if (pct >= 55) return { jegy: 3, szoveg: 'Közepes' };
  if (pct >= 40) return { jegy: 2, szoveg: 'Elégséges' };
  return { jegy: 1, szoveg: 'Elégtelen' };
}

// ════════════════════════════════════════════════════════════════════════════
// SEGÉDFÜGGVÉNYEK
// ════════════════════════════════════════════════════════════════════════════

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pickOne(pool, recentIds) {
  const preferred = pool.filter(q => !recentIds.includes(q.id));
  const src = preferred.length > 0 ? preferred : pool;
  return src[Math.floor(Math.random() * src.length)];
}

function drawQuestions() {
  const recentIds = JSON.parse(localStorage.getItem(RECENT_KEY) || '[]');
  const drawn = [];
  for (const cfg of DRAW_CONFIG) {
    const q = pickOne(cfg.qs, recentIds);
    drawn.push({ ...q, topicLabel: cfg.label });
  }
  // Keverés hogy ne legyen mindig ugyanolyan sorrend
  return shuffle(drawn);
}

// ════════════════════════════════════════════════════════════════════════════
// KVÍZ ÁLLAPOT
// ════════════════════════════════════════════════════════════════════════════

const TIMER_SECONDS = 30 * 60; // 30 perc

let questions    = [];
let shuffledOpts = [];   // shuffled options per question index
let remaining    = [];   // question indices yet to be answered (front = current)
let skippedOnce  = new Set(); // indices already skipped once
let answers      = {};   // questionIdx → selectedOptIdx
let selectedOpt  = null; // currently selected option in UI
let startTime    = null; // Date.now() at quiz start
let timerSecondsLeft = TIMER_SECONDS;
let timerInterval    = null;

function initQuiz() {
  questions    = drawQuestions();
  shuffledOpts = questions.map(q => shuffle(q.opts));
  remaining    = questions.map((_, i) => i); // [0,1,...,14]
  skippedOnce  = new Set();
  answers      = {};
  selectedOpt  = null;
  startTime    = Date.now();
  startTimer();
  showCurrentQuestion();
}

// ════════════════════════════════════════════════════════════════════════════
// TIMER
// ════════════════════════════════════════════════════════════════════════════

function startTimer() {
  timerSecondsLeft = TIMER_SECONDS;
  updateTimerDisplay();
  timerInterval = setInterval(() => {
    timerSecondsLeft--;
    updateTimerDisplay();
    if (timerSecondsLeft <= 0) {
      clearInterval(timerInterval);
      // Kihagyott kérdésekre üres választ rögzítünk
      remaining.forEach(idx => { if (!(idx in answers)) answers[idx] = null; });
      showResults();
    }
  }, 1000);
}

function stopTimer() {
  clearInterval(timerInterval);
}

function updateTimerDisplay() {
  const el = document.getElementById('timer-display');
  if (!el) return;
  const m = Math.floor(timerSecondsLeft / 60);
  const s = timerSecondsLeft % 60;
  el.textContent = String(m).padStart(2,'0') + ':' + String(s).padStart(2,'0');
  el.classList.remove('warning','danger');
  if (timerSecondsLeft <= 60)       el.classList.add('danger');
  else if (timerSecondsLeft <= 300) el.classList.add('warning');
}

function elapsedSeconds() {
  return Math.round((Date.now() - startTime) / 1000);
}

// ════════════════════════════════════════════════════════════════════════════
// MEGJELENÍTÉS
// ════════════════════════════════════════════════════════════════════════════

function showCurrentQuestion() {
  const idx  = remaining[0];
  const q    = questions[idx];
  const opts = shuffledOpts[idx];
  selectedOpt = null;

  // Progress: hány kérdést válaszoltunk meg eddig
  const answeredCount = Object.keys(answers).length;
  const pct = Math.round((answeredCount / TOTAL_Q) * 100);
  document.getElementById('progress-fill').style.width = pct + '%';
  document.getElementById('progress-label').textContent = answeredCount + ' / ' + TOTAL_Q;
  document.getElementById('q-num').textContent = (answeredCount + 1) + ' / ' + TOTAL_Q;
  document.getElementById('q-topic').textContent = q.topicLabel;
  document.getElementById('q-text').textContent = q.q;

  // Visszatérő kérdés badge
  const badge = document.getElementById('q-skipped-badge');
  badge.classList.toggle('hidden', !skippedOnce.has(idx));

  // Kép
  const imgWrap = document.getElementById('q-image');
  const imgEl   = document.getElementById('q-img-el');
  if (q.image) { imgEl.src = q.image; imgWrap.classList.remove('hidden'); }
  else          { imgWrap.classList.add('hidden'); }

  // Opciók
  const container = document.getElementById('mc-options');
  container.innerHTML = '';
  opts.forEach((opt, i) => {
    const div = document.createElement('div');
    div.className = 'mc-option';
    div.innerHTML = `
      <input type="radio" name="mc" id="opt${i}">
      <label class="mc-option-text" for="opt${i}">${opt}</label>
    `;
    div.addEventListener('click', () => selectOption(i));
    container.appendChild(div);
  });

  updateButtons();
}

function selectOption(optIdx) {
  selectedOpt = optIdx;
  document.querySelectorAll('.mc-option').forEach((el, i) => {
    el.classList.toggle('selected', i === optIdx);
    el.querySelector('input').checked = i === optIdx;
  });
  updateButtons();
}

function updateButtons() {
  const idx     = remaining[0];
  const isLast  = remaining.length === 1;
  const alreadySkipped = skippedOnce.has(idx);
  const canSkip = !alreadySkipped && remaining.length > 1;

  const btnNext  = document.getElementById('btn-next');
  const btnSkip  = document.getElementById('btn-skip');
  const skipInfo = document.getElementById('skip-info');

  btnNext.disabled = selectedOpt === null;
  btnNext.innerHTML = isLast
    ? '<i class="fas fa-flag-checkered"></i> Befejezés'
    : 'Következő <i class="fas fa-arrow-right"></i>';

  btnSkip.disabled = !canSkip;
  btnSkip.style.opacity = canSkip ? '1' : '0.4';

  // Kihagyott kérdések számlálója
  const skippedLeft = remaining.slice(1).filter(i => skippedOnce.has(i)).length;
  skipInfo.textContent = skippedLeft > 0 ? skippedLeft + ' kihagyott kérdés vár' : '';
}

function skipQuestion() {
  const idx = remaining[0];
  skippedOnce.add(idx);
  remaining.shift();   // levesszük az elejéről
  remaining.push(idx); // a végére rakjuk
  showCurrentQuestion();
}

let feedbackPending = false;

function nextQuestion() {
  if (selectedOpt === null || feedbackPending) return;
  const idx = remaining.shift(); // megválaszolt kérdés
  answers[idx] = selectedOpt;

  // Rövid visszajelzés: a kiválasztott válasz zöld (jó) vagy piros (rossz), rossznál a helyes is zöld
  const opts = shuffledOpts[idx];
  document.querySelectorAll('.mc-option').forEach((el, i) => {
    el.classList.remove('selected');
    if (opts[i] === questions[idx].ans) el.classList.add('correct');
    else if (i === selectedOpt) el.classList.add('wrong');
    el.style.pointerEvents = 'none';
  });
  feedbackPending = true;
  document.getElementById('btn-next').disabled = true;
  document.getElementById('btn-skip').disabled = true;

  setTimeout(() => {
    feedbackPending = false;
    // Közben lejárhatott az idő – akkor már az eredmény látszik
    if (document.getElementById('result-screen').style.display === 'block') return;
    if (remaining.length === 0) {
      stopTimer();
      showResults();
    } else {
      showCurrentQuestion();
    }
  }, 1000);
}

// ════════════════════════════════════════════════════════════════════════════
// EREDMÉNYEK
// ════════════════════════════════════════════════════════════════════════════

function showResults() {
  document.getElementById('quiz-screen').style.display = 'none';
  document.getElementById('result-screen').style.display = 'block';
  document.getElementById('progress-fill').style.width = '100%';
  document.getElementById('progress-label').textContent = TOTAL_Q + ' / ' + TOTAL_Q;

  let correct = 0;
  const usedIds = [];

  questions.forEach((q, i) => {
    usedIds.push(q.id);
    const selectedIdx = answers[i]; // null = nem válaszolt (lejárt az idő)
    if (selectedIdx === null || selectedIdx === undefined) return;
    const selectedText = shuffledOpts[i][selectedIdx];
    if (selectedText === q.ans) correct++;
  });

  // Legutóbbi kérdések mentése
  localStorage.setItem(RECENT_KEY, JSON.stringify(usedIds));

  // Eltelt idő
  const elapsedSec = elapsedSeconds();
  const elapsedMin = Math.floor(elapsedSec / 60);
  const elapsedSecRem = elapsedSec % 60;
  const elapsedStr = elapsedMin + ' perc ' + elapsedSecRem + ' mp';

  const points = correct * POINTS_PER_Q;
  const pct = Math.round((points / MAX_POINTS) * 100);
  const grade = calcGrade(pct);
  const megfelelt = pct >= 40;

  document.getElementById('result-score').textContent = points + ' / ' + MAX_POINTS + ' pont';
  document.getElementById('stat-correct').textContent = correct;
  document.getElementById('stat-wrong').textContent = TOTAL_Q - correct;

  const gradeColors = { 5:'#22c55e', 4:'#84cc16', 3:'#fbbf24', 2:'#f97316', 1:'#ef4444' };
  document.getElementById('result-grade').textContent = grade.jegy + ' – ' + grade.szoveg;
  document.getElementById('result-grade').style.color = gradeColors[grade.jegy];
  document.getElementById('result-pass').textContent = megfelelt ? 'Megfelelt' : 'Nem felelt meg';
  document.getElementById('result-pass').style.color = megfelelt ? '#22c55e' : '#ef4444';
  document.getElementById('result-sub').textContent = pct + '% – ' + correct + ' helyes válasz ' + TOTAL_Q + '-ből';
  document.getElementById('result-time').textContent = 'Megoldási idő: ' + elapsedStr;

  setTimeout(() => {
    document.getElementById('result-bar').style.width = pct + '%';
  }, 100);

  // Eredmény mentése localStorage-ba (admin felület)
  const userRaw = sessionStorage.getItem('kandoUser');
  const user = userRaw ? JSON.parse(userRaw) : {};
  const entry = {
    nev: user.nev || 'Ismeretlen',
    email: user.email || '',
    datum: new Date().toISOString(),
    helyes: correct,
    osszes: TOTAL_Q,
    pont: points,
    maxPont: MAX_POINTS,
    szazalek: pct,
    jegy: grade.jegy,
    jegySzoveg: grade.szoveg,
    megfelelt: megfelelt,
    idoMp: elapsedSec
  };
  const prev = JSON.parse(localStorage.getItem(RESULTS_KEY) || '[]');
  prev.unshift(entry);
  if (prev.length > 200) prev.length = 200;
  localStorage.setItem(RESULTS_KEY, JSON.stringify(prev));

  // Backend mentés
  try {
    fetch('https://agazati.up.railway.app/api/quiz-result', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nev: entry.nev, email: entry.email,
        osztaly: user.osztaly || '', csoport: user.csoport || '',
        tipus: 'interaktiv',
        pont: points, maxPont: MAX_POINTS, szazalek: pct,
        jegy: grade.jegy, idoMp: elapsedSec
      })
    });
  } catch(e) { /* silent fail */ }

  // Kérdések listája
  const list = document.getElementById('result-list');
  list.innerHTML = '';
  questions.forEach((q, i) => {
    const selectedIdx = answers[i];
    const notAnswered  = selectedIdx === null || selectedIdx === undefined;
    const selectedText = notAnswered ? null : shuffledOpts[i][selectedIdx];
    const isCorrect    = !notAnswered && selectedText === q.ans;

    const div = document.createElement('div');
    div.className = 'result-item ' + (isCorrect ? 'ok' : 'fail');
    div.innerHTML = `
      <div class="result-item-top">
        <span class="result-item-icon">${isCorrect
          ? '<i class="fas fa-check" style="color:var(--green)"></i>'
          : '<i class="fas fa-times" style="color:var(--red)"></i>'}</span>
        <span class="result-item-q">${q.q}</span>
        <span class="result-item-topic">${q.topicLabel}</span>
      </div>
      <div class="result-item-ans">
        ${notAnswered
          ? `<span style="color:var(--muted)">Nem válaszolt (lejárt az idő)</span> &nbsp;|&nbsp; Helyes: <span class="correct-ans">${q.ans}</span>`
          : isCorrect
            ? `Helyes válasz: <span class="correct-ans">${q.ans}</span>`
            : `Te: <span class="wrong-ans">${selectedText}</span> &nbsp;|&nbsp; Helyes: <span class="correct-ans">${q.ans}</span>`
        }
      </div>
    `;
    list.appendChild(div);
  });
}

// ════════════════════════════════════════════════════════════════════════════
// INDÍTÁS
// ════════════════════════════════════════════════════════════════════════════

initQuiz();
