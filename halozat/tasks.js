// Hálózat szimulátor – feladat adatok
// Subnet segédlet: /26=.192, /27=.224, /28=.240, /29=.248

const HALOZAT_FELADATOK = [

  // ═══════════════════════════════════════════════════════
  // FELADAT 1 – TORONY (TANULÓS)
  // ═══════════════════════════════════════════════════════
  {
    id: 1,
    cim: 'Torony – Alapkonfiguráció',
    mod: 'tanulo',
    pontok: 40,
    szin: '#3b82f6',
    ikon: 'fa-network-wired',

    topologia: {
      eszkozok: [
        { id: 'torony',        tipus: 'router',     nev: 'Torony',        x: 390, y: 230 },
        { id: 'torony-sw1',    tipus: 'switch',     nev: 'Torony-SW1',    x: 600, y: 310 },
        { id: 'torony-server', tipus: 'server',     nev: 'Torony-Server', x: 740, y: 200, elokonfig: true },
        { id: 'user',          tipus: 'laptop',     nev: 'USER',          x: 740, y: 380 },
        { id: 'guest',         tipus: 'homerouter', nev: 'GUEST',         x: 180, y: 230 },
        { id: 'phone',         tipus: 'phone',      nev: 'phone',         x:  70, y: 150 },
        { id: 'tablet',        tipus: 'tablet',     nev: 'tablet',        x:  70, y: 340 },
      ],
      kapcsolatok: [
        { tol: 'torony',     ig: 'torony-sw1',    port1: 'G0/1', port2: 'Fa0/1' },
        { tol: 'torony-sw1', ig: 'torony-server', port1: 'Fa0/2', port2: 'NIC'  },
        { tol: 'torony-sw1', ig: 'user',          port1: 'Fa0/3', port2: 'NIC'  },
        { tol: 'torony',     ig: 'guest',         port1: 'G0/0', port2: 'WAN'  },
        { tol: 'guest',      ig: 'phone',         wifi: true },
        { tol: 'guest',      ig: 'tablet',        wifi: true },
      ],
    },

    ipTabla: [
      { eszkoz: 'Torony',        int: 'G0/0',  ip: '192.168.30.1',   maszk: '255.255.255.192', megjegyzes: '/26' },
      { eszkoz: 'Torony',        int: 'G0/1',  ip: '192.168.30.65',  maszk: '255.255.255.240', megjegyzes: '/28' },
      { eszkoz: 'GUEST',         int: 'LAN',   ip: '192.168.100.100',maszk: '255.255.255.0',   megjegyzes: '/24' },
      { eszkoz: 'Torony-SW1',    int: 'VLAN1', ip: '192.168.30.66',  maszk: '255.255.255.240', megjegyzes: '2. kiosztható' },
      { eszkoz: 'USER',          int: 'NIC',   ip: '192.168.30.78',  maszk: '255.255.255.240', megjegyzes: 'utolsó kiosztható' },
      { eszkoz: 'phone, tablet', int: 'NIC',   ip: 'DHCP',           maszk: '',                megjegyzes: '' },
    ],

    elvart: {
      torony: {
        hostname: 'Torony',
        enableSecret: 'Torony',
        servicePasswordEncryption: true,
        domainName: 'alapvizsga2023.hu',
        rsaKeyBits: 2048,
        users: { 'tanuló': 'Torony' },
        interfaces: {
          'GigabitEthernet0/0': { ip: '192.168.30.1',  mask: '255.255.255.192', active: true },
          'GigabitEthernet0/1': { ip: '192.168.30.65', mask: '255.255.255.240', active: true },
        },
        vtyTransport: 'ssh',
        vtyLogin: 'local',
        nameServer: '192.168.30.67',
        saved: true,
      },
      'torony-sw1': {
        vlan1Ip:   '192.168.30.66',
        vlan1Mask: '255.255.255.240',
        defaultGateway: '192.168.30.65',
        vlan1Active: true,
      },
      user: {
        ip: '192.168.30.78', mask: '255.255.255.240', gateway: '192.168.30.65',
      },
      guest: {
        password: 'GUEST-WIFI',
        dhcpStart: '192.168.100.10',
        dhcpEnd: '192.168.100.20',
        dhcpDns: '192.168.30.67',
        ssid: 'GUEST-WIFI',
        ssidBroadcast: false,
        security: 'wpa2-psk',
        wifiKey: '12345678',
      },
      phone:  { wifiJoined: 'GUEST-WIFI' },
      tablet: { wifiJoined: 'GUEST-WIFI' },
    },

    lepesek: [
      {
        id: 'torony-ip-g01',
        eszkozId: 'torony',
        cim: '1. lépés – Router IP (G0/1)',
        magyarazat: 'Először lépj be a router G0/1 interfészére (az interfész az, amelyik a belső hálózathoz kapcsolódik – Torony-SW1 felé). Az <strong>ip address</strong> paranccsal add meg az IP-t és az alhálózati maszkot, majd a <strong>no shutdown</strong> aktiválja az interfészt.',
        tipp: 'interface GigabitEthernet0/1 → ip address 192.168.30.65 255.255.255.240 → no shutdown',
        ellenorzes: s => s.interfaces?.['GigabitEthernet0/1']?.ip === '192.168.30.65' && s.interfaces?.['GigabitEthernet0/1']?.active,
      },
      {
        id: 'torony-ip-g00',
        eszkozId: 'torony',
        cim: '2. lépés – Router IP (G0/0)',
        magyarazat: 'A G0/0 interfész a GUEST router WAN portjához kapcsolódik. Ez az otthoni hálózat felőli kapu. Ugyanúgy kell beállítani, mint az előző interfészt.',
        tipp: 'interface GigabitEthernet0/0 → ip address 192.168.30.1 255.255.255.192 → no shutdown',
        ellenorzes: s => s.interfaces?.['GigabitEthernet0/0']?.ip === '192.168.30.1' && s.interfaces?.['GigabitEthernet0/0']?.active,
      },
      {
        id: 'torony-alap',
        eszkozId: 'torony',
        cim: '3. lépés – Alap biztonsági konfiguráció',
        magyarazat: 'A <strong>hostname</strong> adja az eszköz nevét (megjelenik a promptban). Az <strong>enable secret</strong> titkosítva tárolja a privilegizált módhoz szükséges jelszót (biztonságosabb, mint az <em>enable password</em>). A <strong>service password-encryption</strong> az összes többi jelszót is titkosítja a konfigurációban.',
        tipp: 'hostname Torony → enable secret Torony → service password-encryption',
        ellenorzes: s => s.hostname === 'Torony' && s.enableSecret === 'Torony' && s.servicePasswordEncryption,
      },
      {
        id: 'torony-ssh-prep',
        eszkozId: 'torony',
        cim: '4. lépés – SSH előkészítés',
        magyarazat: 'Az SSH működéséhez szükséges egy tartomány (domain) név. Ebből és az eszköz hostname-jéből áll össze az RSA kulcspár neve. Az <strong>ip domain-name</strong> paranccsal adjuk meg. Ezután a <strong>crypto key generate rsa</strong> generálja a kulcsot – kéri a bitméretet (2048 = erős, ajánlott).',
        tipp: 'ip domain-name alapvizsga2023.hu → crypto key generate rsa → [2048]',
        ellenorzes: s => s.domainName === 'alapvizsga2023.hu' && s.rsaKeyBits === 2048,
      },
      {
        id: 'torony-ssh-user',
        eszkozId: 'torony',
        cim: '5. lépés – SSH felhasználó és VTY vonalak',
        magyarazat: 'A <strong>username</strong> paranccsal hozunk létre helyi felhasználót az SSH bejelentkezéshez. A VTY (Virtual Terminal) vonalak a távolról való belépési pontok. A <strong>transport input ssh</strong> csak SSH-t enged be (Telnetet nem, az titkosítatlan!), a <strong>login local</strong> pedig a helyi adatbázist használja azonosításhoz.',
        tipp: 'username tanuló secret Torony → line vty 0 15 → transport input ssh → login local',
        ellenorzes: s => s.users?.['tanuló'] && s.vtyTransport === 'ssh' && s.vtyLogin === 'local',
      },
      {
        id: 'torony-dns',
        eszkozId: 'torony',
        cim: '6. lépés – DNS szerver beállítás',
        magyarazat: 'Az <strong>ip name-server</strong> paranccsal adjuk meg a DNS szerver IP-címét. Ez lehetővé teszi, hogy a router (és a rajta keresztüli eszközök) névfeloldást végezhessenek – pl. URL → IP-cím. A DNS szerver a Torony-Server (192.168.30.67).',
        tipp: 'ip name-server 192.168.30.67',
        ellenorzes: s => s.nameServer === '192.168.30.67',
      },
      {
        id: 'torony-save',
        eszkozId: 'torony',
        cim: '7. lépés – Konfiguráció mentése',
        magyarazat: 'A <strong>write memory</strong> (vagy <em>copy running-config startup-config</em>) paranccsal mentjük el a konfigurációt a nem-felejtő memóriába (NVRAM). Újraindítás után is megmarad!',
        tipp: 'end → write memory',
        ellenorzes: s => s.saved,
      },
      {
        id: 'sw1-ip',
        eszkozId: 'torony-sw1',
        cim: '8. lépés – Switch VLAN IP',
        magyarazat: 'A Cisco switchnek is adhatunk IP-t a menedzsmenthez. Ez mindig a VLAN 1 interfészre megy. Az <strong>ip default-gateway</strong> megmondja a switchnek, merre menjen, ha a saját alhálózatán kívülre akar kommunikálni (pl. SSH távolról).',
        tipp: 'interface Vlan1 → ip address 192.168.30.66 255.255.255.240 → no shutdown → exit → ip default-gateway 192.168.30.65',
        ellenorzes: s => s.vlan1Ip === '192.168.30.66' && s.defaultGateway === '192.168.30.65' && s.vlan1Active,
      },
      {
        id: 'user-ip',
        eszkozId: 'user',
        cim: '9. lépés – USER laptop IP beállítása',
        magyarazat: 'A végponti eszközöknél (PC, laptop) az IP-cím, alhálózati maszk és alapértelmezett átjáró (gateway) egy grafikus felületen állítható be Packet Tracer-ben. Az alapértelmezett átjáró az a router IP, amelyik a gép saját alhálózatán van.',
        tipp: 'IP: 192.168.30.78 | Maszk: 255.255.255.240 | Gateway: 192.168.30.65',
        ellenorzes: s => s.ip === '192.168.30.78' && s.gateway === '192.168.30.65',
      },
      {
        id: 'guest-config',
        eszkozId: 'guest',
        cim: '10. lépés – GUEST WiFi router beállítása',
        magyarazat: 'Az otthoni router (pl. Linksys WRT) egy webes felületen konfigurálható Packet Tracer-ben. Be kell állítani a belépési jelszót, a DHCP tartományt (ebből kap IP-t a telefon és tablet), a DNS szervert, az SSID nevet (hálózatnév), és a WPA2-PSK titkosítást a kulccsal.',
        tipp: 'Jelszó: GUEST-WIFI | DHCP: .10–.20 | SSID: GUEST-WIFI | WPA2-PSK | Kulcs: 12345678',
        ellenorzes: s => s.ssid === 'GUEST-WIFI' && s.security === 'wpa2-psk' && s.wifiKey === '12345678' && s.password === 'GUEST-WIFI',
      },
      {
        id: 'wifi-connect',
        eszkozId: 'phone',
        cim: '11. lépés – Eszközök csatlakoztatása',
        magyarazat: 'Csatlakoztasd a telefont és tabletet a GUEST-WIFI hálózathoz! Packet Tracer-ben az eszköz Config → Wireless0 fülön lehet megadni az SSID-t és a jelszót.',
        tipp: 'SSID: GUEST-WIFI | Kulcs: 12345678',
        ellenorzes: s => s.wifiJoined === 'GUEST-WIFI',
      },
    ],
  },

  // ═══════════════════════════════════════════════════════
  // FELADAT 2 – GONDOR (GYAKORLÓ)
  // ═══════════════════════════════════════════════════════
  {
    id: 2,
    cim: 'GONDOR – Hibakeresés + SSH',
    mod: 'gyakorlo',
    pontok: 40,
    szin: '#8b5cf6',
    ikon: 'fa-network-wired',

    topologia: {
      eszkozok: [
        { id: 'gondor',        tipus: 'router',     nev: 'GONDOR',        x: 390, y: 230 },
        { id: 'gondor-sw1',    tipus: 'switch',     nev: 'GONDOR-SW1',    x: 600, y: 310 },
        { id: 'gondor-server', tipus: 'server',     nev: 'GONDOR-Server', x: 740, y: 200, elokonfig: true },
        { id: 'gondor-pc',     tipus: 'laptop',     nev: 'GONDOR-PC',     x: 740, y: 380, hibas: true },
        { id: 'user-laptop',   tipus: 'laptop',     nev: 'USER-laptop',   x: 600, y: 450 },
        { id: 'guest-wifi',    tipus: 'homerouter', nev: 'GUEST-WiFi',    x: 180, y: 230 },
        { id: 'guest-phone',   tipus: 'phone',      nev: 'GUEST-phone',   x:  70, y: 150 },
        { id: 'guest-tablet',  tipus: 'tablet',     nev: 'GUEST-tablet',  x:  70, y: 340 },
      ],
      kapcsolatok: [
        { tol: 'gondor',     ig: 'gondor-sw1',    port1: 'G0/1', port2: 'Fa0/1' },
        { tol: 'gondor-sw1', ig: 'gondor-server', port1: 'Fa0/2', port2: 'NIC' },
        { tol: 'gondor-sw1', ig: 'gondor-pc',     port1: 'Fa0/3', port2: 'NIC' },
        { tol: 'gondor-sw1', ig: 'user-laptop',   port1: 'Fa0/4', port2: 'NIC' },
        { tol: 'gondor',     ig: 'guest-wifi',    port1: 'G0/0', port2: 'WAN' },
        { tol: 'guest-wifi', ig: 'guest-phone',   wifi: true },
        { tol: 'guest-wifi', ig: 'guest-tablet',  wifi: true },
      ],
    },

    ipTabla: [
      { eszkoz: 'GONDOR',               int: 'G0/0',  ip: '192.168.60.1',  maszk: '255.255.255.224', megjegyzes: '/27' },
      { eszkoz: 'GONDOR',               int: 'G0/1',  ip: '192.168.60.33', maszk: '255.255.255.248', megjegyzes: '/29' },
      { eszkoz: 'GUEST-WiFi',           int: 'LAN',   ip: '192.168.5.1',   maszk: '255.255.255.0',   megjegyzes: '/24' },
      { eszkoz: 'GONDOR-SW1',           int: 'VLAN1', ip: '192.168.60.38', maszk: '255.255.255.248', megjegyzes: 'utolsó kiosztható' },
      { eszkoz: 'USER-laptop',          int: 'NIC',   ip: '192.168.60.34', maszk: '255.255.255.248', megjegyzes: 'első kiosztható' },
      { eszkoz: 'GUEST-phone, -tablet', int: 'NIC',   ip: 'DHCP',          maszk: '',                megjegyzes: '' },
    ],

    feladatSzoveg: [
      'Helyezd el a meglévő eszközök mellé a topológiának megfelelően GONDOR-SW2 és USER-laptop eszközöket. Kösd össze a megfelelő kábeleléssel!',
      'Állítsd be az IP-címeket a táblázat alapján!',
      'A GONDOR-PC nem éri el a GONDOR-Servert – hárítsd el a kapcsolódási problémát! (Hibás IP-t kell helyesre javítani.)',
      'A GONDOR routeren végezd el az alap- és biztonsági beállításokat: hostname GONDOR, jelszó vizsga2023, jelszó titkosítás.',
      'Konfigurálj SSH hozzáférést: domain gondor2023.hu, RSA 2048 bit, felhasználó: begulas/class, VTY 0 15 csak SSH, helyi adatbázis.',
      'A GUEST-WiFi routerben: jelszó GONDOR, DHCP 192.168.5.10–192.168.5.20, DNS a GONDOR-Server, SSID GONDOR-WIFI, WPA2-PSK, kulcs Gondor123.',
      'Csatlakoztasd a GUEST-phone és GUEST-tablet eszközöket a GONDOR-WIFI hálózathoz!',
      'A GUEST-phone-ról teszteld a GONDOR-Server weboldalának elérhetőségét!',
    ],

    elvart: {
      gondor: {
        hostname: 'GONDOR',
        enableSecret: 'vizsga2023',
        servicePasswordEncryption: true,
        domainName: 'gondor2023.hu',
        rsaKeyBits: 2048,
        users: { 'begulas': 'class' },
        interfaces: {
          'GigabitEthernet0/0': { ip: '192.168.60.1',  mask: '255.255.255.224', active: true },
          'GigabitEthernet0/1': { ip: '192.168.60.33', mask: '255.255.255.248', active: true },
        },
        vtyTransport: 'ssh',
        vtyLogin: 'local',
        nameServer: '192.168.60.35',
        saved: true,
      },
      'gondor-sw1': {
        vlan1Ip: '192.168.60.38', vlan1Mask: '255.255.255.248',
        defaultGateway: '192.168.60.33', vlan1Active: true,
      },
      'gondor-pc': { ip: '192.168.60.36', mask: '255.255.255.248', gateway: '192.168.60.33' },
      'user-laptop': { ip: '192.168.60.34', mask: '255.255.255.248', gateway: '192.168.60.33' },
      'guest-wifi': {
        password: 'GONDOR', dhcpStart: '192.168.5.10', dhcpEnd: '192.168.5.20',
        dhcpDns: '192.168.60.35', ssid: 'GONDOR-WIFI', security: 'wpa2-psk', wifiKey: 'Gondor123',
      },
      'guest-phone':  { wifiJoined: 'GONDOR-WIFI' },
      'guest-tablet': { wifiJoined: 'GONDOR-WIFI' },
    },
  },

  // ═══════════════════════════════════════════════════════
  // FELADAT 3 – TOWER (GYAKORLÓ)
  // ═══════════════════════════════════════════════════════
  {
    id: 3,
    cim: 'TOWER – Hibakeresés + SSH',
    mod: 'gyakorlo',
    pontok: 40,
    szin: '#10b981',
    ikon: 'fa-network-wired',

    topologia: {
      eszkozok: [
        { id: 'tower',        tipus: 'router',     nev: 'TOWER',         x: 390, y: 230 },
        { id: 'tower-sw1',    tipus: 'switch',     nev: 'TOWER-SW1',     x: 600, y: 310 },
        { id: 'tower-server', tipus: 'server',     nev: 'TOWER-Server',  x: 740, y: 200, elokonfig: true },
        { id: 'tower-pc',     tipus: 'laptop',     nev: 'TOWER-PC',      x: 740, y: 380, hibas: true },
        { id: 'user-laptop',  tipus: 'laptop',     nev: 'USER-laptop',   x: 600, y: 450 },
        { id: 'guest-wifi',   tipus: 'homerouter', nev: 'GUEST-WIFI',    x: 180, y: 230 },
        { id: 'guest-phone',  tipus: 'phone',      nev: 'GUEST-phone',   x:  70, y: 150 },
        { id: 'guest-tablet', tipus: 'tablet',     nev: 'GUEST-tablet',  x:  70, y: 340 },
      ],
      kapcsolatok: [
        { tol: 'tower',     ig: 'tower-sw1',    port1: 'G0/1', port2: 'Fa0/1' },
        { tol: 'tower-sw1', ig: 'tower-server', port1: 'Fa0/2', port2: 'NIC' },
        { tol: 'tower-sw1', ig: 'tower-pc',     port1: 'Fa0/3', port2: 'NIC' },
        { tol: 'tower-sw1', ig: 'user-laptop',  port1: 'Fa0/4', port2: 'NIC' },
        { tol: 'tower',     ig: 'guest-wifi',   port1: 'G0/0', port2: 'WAN' },
        { tol: 'guest-wifi', ig: 'guest-phone',  wifi: true },
        { tol: 'guest-wifi', ig: 'guest-tablet', wifi: true },
      ],
    },

    ipTabla: [
      { eszkoz: 'TOWER',              int: 'G0/0',  ip: '192.168.3.1',   maszk: '255.255.255.192', megjegyzes: '/26' },
      { eszkoz: 'TOWER',              int: 'G0/1',  ip: '192.168.3.65',  maszk: '255.255.255.240', megjegyzes: '/28' },
      { eszkoz: 'GUEST-WIFI',         int: 'LAN',   ip: '192.168.150.1', maszk: '255.255.255.0',   megjegyzes: '/24' },
      { eszkoz: 'TOWER-SW1',          int: 'VLAN1', ip: '192.168.3.66',  maszk: '255.255.255.240', megjegyzes: '2. kiosztható' },
      { eszkoz: 'USER-laptop',        int: 'NIC',   ip: '192.168.3.78',  maszk: '255.255.255.240', megjegyzes: 'utolsó kiosztható' },
      { eszkoz: 'GUEST-phone, tablet',int: 'NIC',   ip: 'DHCP',          maszk: '',                megjegyzes: '' },
    ],

    feladatSzoveg: [
      'Helyezd el TOWER-SW2 és USER-laptop eszközöket, kösd össze a megfelelő kábeleléssel!',
      'Állítsd be az IP-címeket a táblázat alapján!',
      'TOWER-PC nem éri el TOWER-Servert – javítsd a hibás IP-t!',
      'TOWER routeren: hostname TOWER, secret vizsga2023, service password-encryption, mentés.',
      'SSH: domain vizsga2023.hu, RSA 1024 bit, user tanulok/Tower123, VTY 0 15 ssh, login local.',
      'GUEST-WIFI router: jelszó TOWER-WIFI, DHCP 192.168.150.10–.20, SSID GUEST-WIFI, WPA2-PSK, kulcs Tower123.',
      'Csatlakoztasd GUEST-phone és GUEST-tablet az GUEST-WIFI hálózathoz!',
      'GUEST-phone-ról teszteld TOWER-Server weboldalát!',
    ],

    elvart: {
      tower: {
        hostname: 'TOWER',
        enableSecret: 'vizsga2023',
        servicePasswordEncryption: true,
        domainName: 'vizsga2023.hu',
        rsaKeyBits: 1024,
        users: { 'tanulok': 'Tower123' },
        interfaces: {
          'GigabitEthernet0/0': { ip: '192.168.3.1',  mask: '255.255.255.192', active: true },
          'GigabitEthernet0/1': { ip: '192.168.3.65', mask: '255.255.255.240', active: true },
        },
        vtyTransport: 'ssh', vtyLogin: 'local',
        nameServer: '192.168.3.67', saved: true,
      },
      'tower-sw1': {
        vlan1Ip: '192.168.3.66', vlan1Mask: '255.255.255.240',
        defaultGateway: '192.168.3.65', vlan1Active: true,
      },
      'tower-pc':    { ip: '192.168.3.68', mask: '255.255.255.240', gateway: '192.168.3.65' },
      'user-laptop': { ip: '192.168.3.78', mask: '255.255.255.240', gateway: '192.168.3.65' },
      'guest-wifi': {
        password: 'TOWER-WIFI', dhcpStart: '192.168.150.10', dhcpEnd: '192.168.150.20',
        dhcpDns: '192.168.3.67', ssid: 'GUEST-WIFI', security: 'wpa2-psk', wifiKey: 'Tower123',
      },
      'guest-phone':  { wifiJoined: 'GUEST-WIFI' },
      'guest-tablet': { wifiJoined: 'GUEST-WIFI' },
    },
  },

  // ═══════════════════════════════════════════════════════
  // FELADAT 4 – KAER MORHEN (GYAKORLÓ, TKIP)
  // ═══════════════════════════════════════════════════════
  {
    id: 4,
    cim: 'KAER MORHEN – WPA-TKIP + SSH',
    mod: 'gyakorlo',
    pontok: 40,
    szin: '#f59e0b',
    ikon: 'fa-network-wired',

    topologia: {
      eszkozok: [
        { id: 'kaer',          tipus: 'router',     nev: 'KAER MORHEN',   x: 390, y: 230 },
        { id: 'velen-sw1',     tipus: 'switch',     nev: 'VELEN-SW1',     x: 600, y: 310 },
        { id: 'km-server',     tipus: 'server',     nev: 'KM-Server',     x: 740, y: 200, elokonfig: true },
        { id: 'yennefer-pc',   tipus: 'laptop',     nev: 'YENNEFER-PC',   x: 740, y: 380 },
        { id: 'geralt-wifi',   tipus: 'homerouter', nev: 'GERALT-WIFI',   x: 180, y: 230 },
        { id: 'dandelion',     tipus: 'tablet',     nev: 'DANDELION-tablet', x: 70, y: 150 },
        { id: 'ciri',          tipus: 'laptop',     nev: 'CIRI-LAPTOP',   x:  70, y: 340 },
      ],
      kapcsolatok: [
        { tol: 'kaer',       ig: 'velen-sw1',   port1: 'G0/1', port2: 'Fa0/1' },
        { tol: 'velen-sw1',  ig: 'km-server',   port1: 'Fa0/2', port2: 'NIC' },
        { tol: 'velen-sw1',  ig: 'yennefer-pc', port1: 'Fa0/3', port2: 'NIC' },
        { tol: 'kaer',       ig: 'geralt-wifi', port1: 'G0/0', port2: 'WAN' },
        { tol: 'geralt-wifi', ig: 'dandelion',  wifi: true },
        { tol: 'geralt-wifi', ig: 'ciri',       wifi: true },
      ],
    },

    ipTabla: [
      { eszkoz: 'KAER MORHEN',         int: 'G0/0',  ip: '192.168.68.1',  maszk: '255.255.255.224', megjegyzes: '/27' },
      { eszkoz: 'KAER MORHEN',         int: 'G0/1',  ip: '192.168.68.33', maszk: '255.255.255.248', megjegyzes: '/29' },
      { eszkoz: 'GERALT-WIFI',         int: 'LAN',   ip: '192.168.5.1',   maszk: '255.255.255.0',   megjegyzes: '/24' },
      { eszkoz: 'VELEN-SW1',           int: 'VLAN1', ip: '192.168.68.34', maszk: '255.255.255.248', megjegyzes: 'első kiosztható' },
      { eszkoz: 'YENNEFER-PC',         int: 'NIC',   ip: '192.168.68.38', maszk: '255.255.255.248', megjegyzes: 'utolsó kiosztható' },
      { eszkoz: 'DANDELION, CIRI',     int: 'NIC',   ip: 'DHCP',          maszk: '',                megjegyzes: '' },
    ],

    feladatSzoveg: [
      'Állítsd be az IP-címeket a táblázat alapján!',
      'KAER MORHEN routeren: hostname "KAER MORHEN", secret hun1234, service password-encryption, mentés.',
      'SSH: domain wildhunt2024.hu, RSA 2048 bit, user Geralt/Toussaint, VTY 0 15 ssh, login local.',
      'GERALT-WIFI router: jelszó Toussaint123, DHCP 192.168.5.15–192.168.5.100, SSID Wildhunt, WPA-PSK (TKIP titkosítás), kulcs Vendeg123.',
      'Csatlakoztasd DANDELION-tablet és CIRI-LAPTOP az Wildhunt hálózathoz!',
      'DANDELION-tabletről teszteld a KM-Server weboldalát!',
    ],

    elvart: {
      kaer: {
        hostname: 'KAER MORHEN',
        enableSecret: 'hun1234',
        servicePasswordEncryption: true,
        domainName: 'wildhunt2024.hu',
        rsaKeyBits: 2048,
        users: { 'Geralt': 'Toussaint' },
        interfaces: {
          'GigabitEthernet0/0': { ip: '192.168.68.1',  mask: '255.255.255.224', active: true },
          'GigabitEthernet0/1': { ip: '192.168.68.33', mask: '255.255.255.248', active: true },
        },
        vtyTransport: 'ssh', vtyLogin: 'local',
        nameServer: '192.168.68.35', saved: true,
      },
      'velen-sw1': {
        vlan1Ip: '192.168.68.34', vlan1Mask: '255.255.255.248',
        defaultGateway: '192.168.68.33', vlan1Active: true,
      },
      'yennefer-pc': { ip: '192.168.68.38', mask: '255.255.255.248', gateway: '192.168.68.33' },
      'geralt-wifi': {
        password: 'Toussaint123', dhcpStart: '192.168.5.15', dhcpEnd: '192.168.5.100',
        dhcpDns: '192.168.68.35', ssid: 'Wildhunt', security: 'wpa-psk', wpaEncryption: 'tkip', wifiKey: 'Vendeg123',
      },
      dandelion: { wifiJoined: 'Wildhunt' },
      ciri:      { wifiJoined: 'Wildhunt' },
    },
  },

  // ═══════════════════════════════════════════════════════
  // FELADAT 5 – TOWER + NTP (GYAKORLÓ)
  // ═══════════════════════════════════════════════════════
  {
    id: 5,
    cim: 'TOWER – NTP + SSH',
    mod: 'gyakorlo',
    pontok: 40,
    szin: '#06b6d4',
    ikon: 'fa-network-wired',

    topologia: {
      eszkozok: [
        { id: 'tower',        tipus: 'router',     nev: 'TOWER',         x: 390, y: 230 },
        { id: 'tower-sw1',    tipus: 'switch',     nev: 'TOWER-SW1',     x: 600, y: 310 },
        { id: 'tower-server', tipus: 'server',     nev: 'TOWER-Server',  x: 740, y: 200, elokonfig: true },
        { id: 'user-laptop',  tipus: 'laptop',     nev: 'USER-laptop',   x: 740, y: 380 },
        { id: 'guest-wifi',   tipus: 'homerouter', nev: 'GUEST-WIFI',    x: 180, y: 230 },
        { id: 'guest-phone',  tipus: 'phone',      nev: 'GUEST-phone',   x:  70, y: 150 },
        { id: 'guest-tablet', tipus: 'tablet',     nev: 'GUEST-tablet',  x:  70, y: 340 },
      ],
      kapcsolatok: [
        { tol: 'tower',     ig: 'tower-sw1',    port1: 'G0/1', port2: 'Fa0/1' },
        { tol: 'tower-sw1', ig: 'tower-server', port1: 'Fa0/2', port2: 'NIC' },
        { tol: 'tower-sw1', ig: 'user-laptop',  port1: 'Fa0/3', port2: 'NIC' },
        { tol: 'tower',     ig: 'guest-wifi',   port1: 'G0/0', port2: 'WAN' },
        { tol: 'guest-wifi', ig: 'guest-phone',  wifi: true },
        { tol: 'guest-wifi', ig: 'guest-tablet', wifi: true },
      ],
    },

    ipTabla: [
      { eszkoz: 'TOWER',               int: 'G0/0',  ip: '192.168.3.1',   maszk: '255.255.255.192', megjegyzes: '/26' },
      { eszkoz: 'TOWER',               int: 'G0/1',  ip: '192.168.3.65',  maszk: '255.255.255.240', megjegyzes: '/28' },
      { eszkoz: 'GUEST-WIFI',          int: 'LAN',   ip: '192.168.150.1', maszk: '255.255.255.0',   megjegyzes: '/24' },
      { eszkoz: 'TOWER-SW1',           int: 'VLAN1', ip: '192.168.3.66',  maszk: '255.255.255.240', megjegyzes: '2. kiosztható' },
      { eszkoz: 'USER-laptop',         int: 'NIC',   ip: '192.168.3.78',  maszk: '255.255.255.240', megjegyzes: 'utolsó kiosztható' },
      { eszkoz: 'GUEST-phone, tablet', int: 'NIC',   ip: 'DHCP',          maszk: '',                megjegyzes: '' },
    ],

    feladatSzoveg: [
      'Állítsd be az IP-címeket a táblázat alapján!',
      'TOWER routeren: hostname TOWER, secret vizsga2024, service password-encryption, mentés.',
      'SSH: domain vizsga2024.hu, RSA 1024 bit, user eyra/diplomacy, VTY 0 15 ssh, login local.',
      'NTP: ntp server 192.168.3.67 (TOWER-Server legyen az NTP szerver a routeren).',
      'GUEST-WIFI: jelszó TOWER-WIFI, DHCP .150.10–.20, SSID GUEST-WIFI, WPA2-PSK, kulcs Tower2024.',
      'Csatlakoztasd GUEST-phone és GUEST-tablet az GUEST-WIFI hálózathoz!',
      'USER-laptopról teszteld TOWER-Server weboldalát és SSH-t a routerre!',
    ],

    elvart: {
      tower: {
        hostname: 'TOWER',
        enableSecret: 'vizsga2024',
        servicePasswordEncryption: true,
        domainName: 'vizsga2024.hu',
        rsaKeyBits: 1024,
        users: { 'eyra': 'diplomacy' },
        interfaces: {
          'GigabitEthernet0/0': { ip: '192.168.3.1',  mask: '255.255.255.192', active: true },
          'GigabitEthernet0/1': { ip: '192.168.3.65', mask: '255.255.255.240', active: true },
        },
        vtyTransport: 'ssh', vtyLogin: 'local',
        ntpServer: '192.168.3.67',
        nameServer: '192.168.3.67', saved: true,
      },
      'tower-sw1': {
        vlan1Ip: '192.168.3.66', vlan1Mask: '255.255.255.240',
        defaultGateway: '192.168.3.65', vlan1Active: true,
      },
      'user-laptop': { ip: '192.168.3.78', mask: '255.255.255.240', gateway: '192.168.3.65' },
      'guest-wifi': {
        password: 'TOWER-WIFI', dhcpStart: '192.168.150.10', dhcpEnd: '192.168.150.20',
        dhcpDns: '192.168.3.67', ssid: 'GUEST-WIFI', security: 'wpa2-psk', wifiKey: 'Tower2024',
      },
      'guest-phone':  { wifiJoined: 'GUEST-WIFI' },
      'guest-tablet': { wifiJoined: 'GUEST-WIFI' },
    },
  },

  // ═══════════════════════════════════════════════════════
  // FELADAT 6 – KR (TANULÓS)
  // ═══════════════════════════════════════════════════════
  {
    id: 6,
    cim: 'KR – Hibakeresés + SSH (Tanulós)',
    mod: 'tanulo',
    pontok: 40,
    szin: '#ef4444',
    ikon: 'fa-network-wired',

    topologia: {
      eszkozok: [
        { id: 'kr',         tipus: 'router',     nev: 'KR',           x: 390, y: 230 },
        { id: 'k1-sw1',     tipus: 'switch',     nev: 'K1-SW1',       x: 600, y: 310 },
        { id: 'kr-server',  tipus: 'server',     nev: 'KR-Server',    x: 740, y: 200, elokonfig: true },
        { id: 'k1-pc',      tipus: 'laptop',     nev: 'K1-PC',        x: 600, y: 450, elokonfig: true },
        { id: 'k2-pc',      tipus: 'laptop',     nev: 'K2-PC',        x: 740, y: 380, hibas: true },
        { id: 'suli-wifi',  tipus: 'homerouter', nev: 'SULI-WIFI',    x: 180, y: 230 },
        { id: 'suli-tablet',tipus: 'tablet',     nev: 'SULI-Tablet',  x:  70, y: 150 },
        { id: 'suli-laptop',tipus: 'laptop',     nev: 'SULI-Laptop',  x:  70, y: 340 },
      ],
      kapcsolatok: [
        { tol: 'kr',      ig: 'k1-sw1',     port1: 'G0/1', port2: 'Fa0/1' },
        { tol: 'k1-sw1',  ig: 'kr-server',  port1: 'Fa0/2', port2: 'NIC' },
        { tol: 'k1-sw1',  ig: 'k1-pc',      port1: 'Fa0/3', port2: 'NIC' },
        { tol: 'k1-sw1',  ig: 'k2-pc',      port1: 'Fa0/4', port2: 'NIC' },
        { tol: 'kr',      ig: 'suli-wifi',  port1: 'G0/0', port2: 'WAN' },
        { tol: 'suli-wifi', ig: 'suli-tablet', wifi: true },
        { tol: 'suli-wifi', ig: 'suli-laptop', wifi: true },
      ],
    },

    ipTabla: [
      { eszkoz: 'KR',                   int: 'G0/0',  ip: '192.168.40.1',  maszk: '255.255.255.224', megjegyzes: '/27' },
      { eszkoz: 'KR',                   int: 'G0/1',  ip: '192.168.40.33', maszk: '255.255.255.248', megjegyzes: '/29' },
      { eszkoz: 'SULI-WIFI',            int: 'LAN',   ip: '192.168.100.50',maszk: '255.255.255.0',   megjegyzes: '/24' },
      { eszkoz: 'K1-SW1',               int: 'VLAN1', ip: '192.168.40.34', maszk: '255.255.255.248', megjegyzes: '1. kiosztható' },
      { eszkoz: 'K2-PC',                int: 'NIC',   ip: '192.168.40.38', maszk: '255.255.255.248', megjegyzes: 'utolsó kiosztható' },
      { eszkoz: 'SULI-Tablet, -Laptop', int: 'NIC',   ip: 'DHCP',          maszk: '',                megjegyzes: '' },
    ],

    lepesek: [
      {
        id: 'kr-ip-g01',
        eszkozId: 'kr',
        cim: '1. lépés – KR Router IP (G0/1)',
        magyarazat: 'A KR router G0/1 interfészét a belső switch felé kell irányítani. Az ip address paranccsal állítjuk be a /29-es alhálózati maszkot (255.255.255.248). Ez egy kisebb hálózat, mindössze 6 host fér el benne.',
        tipp: 'interface GigabitEthernet0/1 → ip address 192.168.40.33 255.255.255.248 → no shutdown',
        ellenorzes: s => s.interfaces?.['GigabitEthernet0/1']?.ip === '192.168.40.33' && s.interfaces?.['GigabitEthernet0/1']?.active,
      },
      {
        id: 'kr-ip-g00',
        eszkozId: 'kr',
        cim: '2. lépés – KR Router IP (G0/0)',
        magyarazat: 'A G0/0 a SULI-WIFI router WAN portjához kapcsolódik. Ez egy /27-es alhálózaton van (192.168.40.0/27), 30 host fér el benne.',
        tipp: 'interface GigabitEthernet0/0 → ip address 192.168.40.1 255.255.255.224 → no shutdown',
        ellenorzes: s => s.interfaces?.['GigabitEthernet0/0']?.ip === '192.168.40.1' && s.interfaces?.['GigabitEthernet0/0']?.active,
      },
      {
        id: 'k2pc-javitas',
        eszkozId: 'k2-pc',
        cim: '3. lépés – K1-PC → K2-PC hibakeresés',
        magyarazat: 'A K2-PC hibás IP-vel van beállítva – ezért nem tud kommunikálni K1-PC-vel. A /29-es hálózatban (192.168.40.32/29) az utolsó kiosztható cím 192.168.40.38. Javítsd a K2-PC IP-beállítását erre az értékre! Az átjáró a KR router G0/1 = 192.168.40.33.',
        tipp: 'IP: 192.168.40.38 | Maszk: 255.255.255.248 | Gateway: 192.168.40.33',
        ellenorzes: s => s.ip === '192.168.40.38' && s.gateway === '192.168.40.33',
      },
      {
        id: 'k1sw1-ip',
        eszkozId: 'k1-sw1',
        cim: '4. lépés – K1-SW1 VLAN IP',
        magyarazat: 'A switch menedzsment IP-jét a VLAN 1 interfészre állítjuk. Az ip default-gateway parancs megmondja a switchnek, hová irányítsa a saját alhálózatán kívülre menő forgalmat.',
        tipp: 'interface Vlan1 → ip address 192.168.40.34 255.255.255.248 → no shutdown → exit → ip default-gateway 192.168.40.33',
        ellenorzes: s => s.vlan1Ip === '192.168.40.34' && s.defaultGateway === '192.168.40.33' && s.vlan1Active,
      },
      {
        id: 'kr-alap',
        eszkozId: 'kr',
        cim: '5. lépés – KR alap biztonsági konfig',
        magyarazat: 'Ugyanolyan lépések, mint az 1. feladatban, de más értékekkel. Hostname KR, secret kando2022.',
        tipp: 'hostname KR → enable secret kando2022 → service password-encryption → end → write memory',
        ellenorzes: s => s.hostname === 'KR' && s.enableSecret === 'kando2022' && s.servicePasswordEncryption && s.saved,
      },
      {
        id: 'kr-ssh',
        eszkozId: 'kr',
        cim: '6. lépés – SSH beállítás (KR)',
        magyarazat: 'A domain név itt SSH1223.local (helyi, nem valódi domain). Az RSA kulcs 2048 bit. A felhasználónév és jelszó egyaránt SSHladmin.',
        tipp: 'ip domain-name SSH1223.local → crypto key generate rsa → [2048] → username SSHladmin secret SSHladmin → line vty 0 15 → transport input ssh → login local',
        ellenorzes: s => s.domainName === 'SSH1223.local' && s.rsaKeyBits === 2048 && s.users?.['SSHladmin'] && s.vtyTransport === 'ssh',
      },
      {
        id: 'suli-wifi-config',
        eszkozId: 'suli-wifi',
        cim: '7. lépés – SULI-WIFI router',
        magyarazat: 'Az iskolai WiFi router (SULI-WIFI) DHCP tartománya 192.168.100.100–130, az SSID neve ISKOLA, WPA2-PSK biztonsággal, ISKOLA123 kulccsal.',
        tipp: 'Jelszó: ISKOLA | DHCP: .100–.130 | SSID: ISKOLA | WPA2-PSK | Kulcs: ISKOLA123',
        ellenorzes: s => s.ssid === 'ISKOLA' && s.security === 'wpa2-psk' && s.wifiKey === 'ISKOLA123',
      },
      {
        id: 'wifi-connect-6',
        eszkozId: 'suli-tablet',
        cim: '8. lépés – Eszközök csatlakoztatása',
        magyarazat: 'Csatlakoztasd SULI-Tablet és SULI-Laptop eszközöket az ISKOLA WiFi hálózathoz!',
        tipp: 'SSID: ISKOLA | Kulcs: ISKOLA123',
        ellenorzes: s => s.wifiJoined === 'ISKOLA',
      },
      {
        id: 'ssh-teszt-6',
        eszkozId: 'suli-laptop',
        cim: '9. lépés – SSH teszt + weboldal teszt',
        magyarazat: 'Az SULI-Laptopról teszteld a KR-Server weboldalának elérhetőségét (ping vagy böngésző), és teszteld az SSH bejelentkezést a KR routerre: ssh -l SSHladmin 192.168.40.33.',
        tipp: 'ping 192.168.40.35 | ssh -l SSHladmin 192.168.40.33',
        ellenorzes: s => s.sshTested || s.webTested,
      },
    ],
  },

  // ═══════════════════════════════════════════════════════
  // FELADAT 7 – KR v2 (GYAKORLÓ)
  // ═══════════════════════════════════════════════════════
  {
    id: 7,
    cim: 'KR – Kiegészítés + SSH',
    mod: 'gyakorlo',
    pontok: 40,
    szin: '#6366f1',
    ikon: 'fa-network-wired',

    topologia: {
      eszkozok: [
        { id: 'kr',         tipus: 'router',     nev: 'KR',           x: 390, y: 230 },
        { id: 'k1-sw1',     tipus: 'switch',     nev: 'K1-SW1',       x: 600, y: 310 },
        { id: 'kr-server',  tipus: 'server',     nev: 'KR-Server',    x: 740, y: 200, elokonfig: true },
        { id: 'k1-pc',      tipus: 'laptop',     nev: 'K1-PC',        x: 600, y: 450, elokonfig: true },
        { id: 'k2-sw2',     tipus: 'switch',     nev: 'K2-SW2',       x: 740, y: 310, ghost: true },
        { id: 'k2-pc',      tipus: 'laptop',     nev: 'K2-PC',        x: 740, y: 430, hibas: true },
        { id: 'suli-wifi',  tipus: 'homerouter', nev: 'SULI-WIFI',    x: 180, y: 230 },
        { id: 'suli-tablet',tipus: 'tablet',     nev: 'SULI-Tablet',  x:  70, y: 150 },
        { id: 'suli-laptop',tipus: 'laptop',     nev: 'SULI-Laptop',  x:  70, y: 340 },
      ],
      kapcsolatok: [
        { tol: 'kr',      ig: 'k1-sw1',     port1: 'G0/1', port2: 'Fa0/1' },
        { tol: 'k1-sw1',  ig: 'kr-server',  port1: 'Fa0/2', port2: 'NIC' },
        { tol: 'k1-sw1',  ig: 'k1-pc',      port1: 'Fa0/3', port2: 'NIC' },
        { tol: 'k1-sw1',  ig: 'k2-sw2',     port1: 'Fa0/4', port2: 'Fa0/1' },
        { tol: 'k2-sw2',  ig: 'k2-pc',      port1: 'Fa0/2', port2: 'NIC' },
        { tol: 'kr',      ig: 'suli-wifi',  port1: 'G0/0', port2: 'WAN' },
        { tol: 'suli-wifi', ig: 'suli-tablet', wifi: true },
        { tol: 'suli-wifi', ig: 'suli-laptop', wifi: true },
      ],
    },

    ipTabla: [
      { eszkoz: 'KR',                   int: 'G0/0',  ip: '192.168.30.1',  maszk: '255.255.255.224', megjegyzes: '/27' },
      { eszkoz: 'KR',                   int: 'G0/1',  ip: '192.168.30.33', maszk: '255.255.255.248', megjegyzes: '/29' },
      { eszkoz: 'SULI-WIFI',            int: 'LAN',   ip: '192.168.100.1', maszk: '255.255.255.0',   megjegyzes: '/24' },
      { eszkoz: 'K1-SW1',               int: 'VLAN1', ip: '192.168.30.34', maszk: '255.255.255.248', megjegyzes: '1. kiosztható' },
      { eszkoz: 'K2-PC',                int: 'NIC',   ip: '192.168.30.38', maszk: '255.255.255.248', megjegyzes: 'utolsó + adj. gateway' },
      { eszkoz: 'SULI-Tablet, -Laptop', int: 'NIC',   ip: 'DHCP',          maszk: '',                megjegyzes: '' },
    ],

    feladatSzoveg: [
      'Helyezd el K2-SW2 és K2-PC eszközöket, kösd össze a megfelelő kábeleléssel!',
      'Állítsd be az IP-címeket a táblázat alapján!',
      'K1-PC nem éri el K2-PC-t – javítsd K2-PC hibás IP-jét!',
      'K1-SW1-en: hostname KR, secret kando2022, service password-encryption, mentés.',
      'SSH: domain 2022vizsga.local, RSA 1024 bit, user SSHadmin/kando, VTY 0 15 ssh, login local.',
      'SULI-WIFI: jelszó ISKOLA, DHCP .100.10–.30, SSID ISKOLA, WPA2-PSK, kulcs ISKOLA2022.',
      'Csatlakoztasd SULI-Tablet és SULI-Laptop eszközöket az ISKOLA hálózathoz!',
      'SULI-Laptopról teszteld KR-Server weboldalát és SSH-t a KR routerre!',
    ],

    elvart: {
      kr: {
        hostname: 'KR',
        enableSecret: 'kando2022',
        servicePasswordEncryption: true,
        domainName: '2022vizsga.local',
        rsaKeyBits: 1024,
        users: { 'SSHadmin': 'kando' },
        interfaces: {
          'GigabitEthernet0/0': { ip: '192.168.30.1',  mask: '255.255.255.224', active: true },
          'GigabitEthernet0/1': { ip: '192.168.30.33', mask: '255.255.255.248', active: true },
        },
        vtyTransport: 'ssh', vtyLogin: 'local',
        nameServer: '192.168.30.35', saved: true,
      },
      'k1-sw1': {
        vlan1Ip: '192.168.30.34', vlan1Mask: '255.255.255.248',
        defaultGateway: '192.168.30.33', vlan1Active: true,
      },
      'k2-pc': { ip: '192.168.30.38', mask: '255.255.255.248', gateway: '192.168.30.33' },
      'suli-wifi': {
        password: 'ISKOLA', dhcpStart: '192.168.100.10', dhcpEnd: '192.168.100.30',
        dhcpDns: '192.168.30.35', ssid: 'ISKOLA', security: 'wpa2-psk', wifiKey: 'ISKOLA2022',
      },
      'suli-tablet': { wifiJoined: 'ISKOLA' },
      'suli-laptop': { wifiJoined: 'ISKOLA' },
    },
  },

  // ═══════════════════════════════════════════════════════
  // FELADAT 8 – KANDO (GYAKORLÓ)
  // ═══════════════════════════════════════════════════════
  {
    id: 8,
    cim: 'KANDO – Hibakeresés + SSH',
    mod: 'gyakorlo',
    pontok: 40,
    szin: '#ec4899',
    ikon: 'fa-network-wired',

    topologia: {
      eszkozok: [
        { id: 'kando',         tipus: 'router',     nev: 'KANDO',         x: 390, y: 230 },
        { id: 'emeleti-sw1',   tipus: 'switch',     nev: 'EMELETI-SW1',   x: 600, y: 310 },
        { id: 'kando-server',  tipus: 'server',     nev: 'KANDO-Server',  x: 740, y: 200, elokonfig: true },
        { id: 'emeleti-pc',    tipus: 'laptop',     nev: 'EMELETI-PC',    x: 600, y: 450, elokonfig: true },
        { id: 'emeleti2-pc',   tipus: 'laptop',     nev: 'EMELETI2-PC',   x: 740, y: 380, hibas: true },
        { id: 'guest-wifi',    tipus: 'homerouter', nev: 'GUEST-WIFI',    x: 180, y: 230 },
        { id: 'guest-tablet',  tipus: 'tablet',     nev: 'GUEST-Tablet',  x:  70, y: 150 },
        { id: 'guest-laptop',  tipus: 'laptop',     nev: 'GUEST-Laptop',  x:  70, y: 340 },
      ],
      kapcsolatok: [
        { tol: 'kando',      ig: 'emeleti-sw1',  port1: 'G0/1', port2: 'Fa0/1' },
        { tol: 'emeleti-sw1',ig: 'kando-server', port1: 'Fa0/2', port2: 'NIC' },
        { tol: 'emeleti-sw1',ig: 'emeleti-pc',   port1: 'Fa0/3', port2: 'NIC' },
        { tol: 'emeleti-sw1',ig: 'emeleti2-pc',  port1: 'Fa0/4', port2: 'NIC' },
        { tol: 'kando',      ig: 'guest-wifi',   port1: 'G0/0', port2: 'WAN' },
        { tol: 'guest-wifi', ig: 'guest-tablet', wifi: true },
        { tol: 'guest-wifi', ig: 'guest-laptop', wifi: true },
      ],
    },

    ipTabla: [
      { eszkoz: 'KANDO',                int: 'G0/0',  ip: '192.168.20.1',  maszk: '255.255.255.224', megjegyzes: '/27' },
      { eszkoz: 'KANDO',                int: 'G0/1',  ip: '192.168.20.33', maszk: '255.255.255.248', megjegyzes: '/29' },
      { eszkoz: 'GUEST-WIFI',           int: 'LAN',   ip: '192.168.150.100',maszk: '255.255.255.0',  megjegyzes: '/24' },
      { eszkoz: 'EMELETI-SW1',          int: 'VLAN1', ip: '192.168.20.34', maszk: '255.255.255.248', megjegyzes: '2. kiosztható' },
      { eszkoz: 'EMELETI2-PC',          int: 'NIC',   ip: '192.168.20.38', maszk: '255.255.255.248', megjegyzes: 'utolsó + adj. gateway' },
      { eszkoz: 'GUEST-Tablet, -Laptop',int: 'NIC',   ip: 'DHCP',          maszk: '',                megjegyzes: '' },
    ],

    feladatSzoveg: [
      'Helyezd el EMELETI2-SW2 és EMELETI2-PC eszközöket, kösd össze a megfelelő kábeleléssel!',
      'Állítsd be az IP-címeket a táblázat alapján!',
      'EMELETI-PC nem éri el EMELETI2-PC-t – javítsd EMELETI2-PC hibás IP-jét!',
      'EMELETI-SW1-en: hostname EMELETI-SW1, secret 2022vizsga, konzol class, service password-encryption, mentés.',
      'SSH a KANDO routerre: domain 2022vizsga.local, RSA 1024 bit, user SSHadmin/kando2022, VTY 0 15 ssh, login local.',
      'GUEST-WIFI: jelszó KANDO123, DHCP .150.10–.50, SSID GUEST, WPA2-PSK, kulcs KANDO123.',
      'Csatlakoztasd GUEST-Tablet és GUEST-Laptop az GUEST hálózathoz!',
      'GUEST-Laptopról teszteld KANDO-Server weboldalát és SSH-t a KANDO routerre!',
    ],

    elvart: {
      kando: {
        hostname: 'KANDO',
        domainName: '2022vizsga.local',
        rsaKeyBits: 1024,
        users: { 'SSHadmin': 'kando2022' },
        interfaces: {
          'GigabitEthernet0/0': { ip: '192.168.20.1',  mask: '255.255.255.224', active: true },
          'GigabitEthernet0/1': { ip: '192.168.20.33', mask: '255.255.255.248', active: true },
        },
        vtyTransport: 'ssh', vtyLogin: 'local',
        nameServer: '192.168.20.35', saved: true,
      },
      'emeleti-sw1': {
        hostname: 'EMELETI-SW1',
        enableSecret: '2022vizsga',
        vlan1Ip: '192.168.20.34', vlan1Mask: '255.255.255.248',
        defaultGateway: '192.168.20.33', vlan1Active: true,
      },
      'emeleti2-pc': { ip: '192.168.20.38', mask: '255.255.255.248', gateway: '192.168.20.33' },
      'guest-wifi': {
        password: 'KANDO123', dhcpStart: '192.168.150.10', dhcpEnd: '192.168.150.50',
        dhcpDns: '192.168.20.35', ssid: 'GUEST', security: 'wpa2-psk', wifiKey: 'KANDO123',
      },
      'guest-tablet': { wifiJoined: 'GUEST' },
      'guest-laptop': { wifiJoined: 'GUEST' },
    },
  },

]; // HALOZAT_FELADATOK vége
