/**
 * csoportjaim.js – Csoportjaim fül az admin panelen (oktatói munkaeszköz)
 *
 * Az órarend alapján: aktuális / következő óra, csoportonként óranapló és a tanulók haladása.
 * Az admin.html globálisait használja: authFetch, RAILWAY_URL, escHtml, jsArg.
 * Minden időszámítás a böngésző (tanár) helyi idejével megy – a szerver időzónájától független.
 */
(function () {
    // ── Tanév rendje 2026/2027 (1/2026. (VII. 31.) OGYM rendelet, szakképzés) ──────────
    const TANEV = {
        kezdo: '2026',
        elsoNap: '2026-09-01',
        felevVege: '2027-01-22',      // 1. félév utolsó napja
        utolsoNap: '2027-06-15',
        szunetek: [['2026-10-23', '2026-11-01'], ['2026-12-19', '2027-01-03'], ['2027-03-25', '2027-04-04']],
        unnepek: ['2027-03-15', '2027-05-17'],   // hétköznapra eső ünnep a tanítási időszakban
        iskolaiNapok: []                          // tanítás nélküli munkanapok (később a beállításokban)
    };
    // Csengetési rend [kezdés, vége]
    const CSENGETES = [['7:15', '8:00'], ['8:00', '8:45'], ['8:55', '9:40'], ['9:50', '10:35'], ['10:45', '11:30'],
                       ['11:40', '12:25'], ['12:45', '13:30'], ['13:35', '14:20'], ['14:25', '15:10'],
                       ['15:15', '16:00'], ['16:05', '16:50']];
    const NAPNEV = ['vasárnap', 'hétfő', 'kedd', 'szerda', 'csütörtök', 'péntek', 'szombat'];
    const OLDAL = { portal: 'Portál', practice: 'WEB alapok gyakorló', web: 'WEB feladat', python: 'Python dolgozat',
                    'py-basics': 'Python kezdő', 'py-practice': 'Python haladó', 'py-pro': 'Python profi' };

    const st = { orarend: [], naploUtolsok: {}, naplo: [], haladas: null, online: [], kivalasztott: null,
                 szerkesztett: null, onlineTimer: null, betoltve: false };

    // ── Segédek ──────────────────────────────────────────────────────────────────
    const esc = s => escHtml(s == null ? '' : String(s));
    const iso = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const perc = hhmm => { const [h, m] = hhmm.split(':').map(Number); return h * 60 + m; };
    const huDatum = s => { const d = new Date(s + 'T12:00:00'); return `${d.getMonth() + 1}. ${d.getDate()}. (${NAPNEV[d.getDay()]})`; };
    function tanitasiNap(d) {
        const s = iso(d), wd = d.getDay();
        if (wd === 0 || wd === 6 || s < TANEV.elsoNap || s > TANEV.utolsoNap) return false;
        if (TANEV.unnepek.includes(s) || TANEV.iskolaiNapok.includes(s)) return false;
        return !TANEV.szunetek.some(([a, b]) => s >= a && s <= b);
    }
    const felevE = d => iso(d) <= TANEV.felevVege ? 1 : 2;
    const kulcs = o => `${o.evfolyam}.${o.osztaly}.${o.csoport || ''}`;
    function csoportNev(k) {
        const [e, o, c] = k.split('.');
        if (!c) return `${e}.${o}`;
        return c === 'info' ? `${e}.${o} informatika` : `${e}.${o} ${c}. cs.`;
    }

    // Egy félév órarendje csoportonként, egymást követő órák összevonva blokká (dupla, tripla)
    function blokkok(felev) {
        const orak = st.orarend.filter(o => o.felev === felev).sort((a, b) => a.nap - b.nap || a.ora - b.ora);
        const out = [];
        for (const o of orak) {
            const k = kulcs(o), utolso = out[out.length - 1];
            if (utolso && utolso.kulcs === k && utolso.nap === o.nap && utolso.vege === o.ora - 1) {
                utolso.vege = o.ora; utolso.db++;
            } else out.push({ kulcs: k, nap: o.nap, eleje: o.ora, vege: o.ora, db: 1, terem: o.terem });
        }
        return out;
    }
    const blokkSzoveg = b => `${NAPNEV[b.nap]} ${b.eleje === b.vege ? b.eleje + '.' : b.eleje + '–' + b.vege + '.'} óra` +
        (b.db === 2 ? ' (dupla)' : b.db === 3 ? ' (tripla)' : b.db > 3 ? ` (${b.db} óra)` : '');
    const blokkIdo = b => `${CSENGETES[b.eleje][0]}–${CSENGETES[b.vege][1]}`;

    // Az aktuális (épp zajló) vagy a következő óra a most időponttól (max. 3 hét előre)
    function aktualisVagyKovetkezo(most = new Date()) {
        const percMost = most.getHours() * 60 + most.getMinutes();
        for (let i = 0; i < 21; i++) {
            const d = new Date(most); d.setDate(d.getDate() + i);
            if (!tanitasiNap(d)) continue;
            const napi = blokkok(felevE(d)).filter(b => b.nap === d.getDay());
            for (const b of napi) {
                const kezd = perc(CSENGETES[b.eleje][0]), vege = perc(CSENGETES[b.vege][1]);
                if (i === 0 && percMost >= kezd && percMost < vege) return { blokk: b, datum: d, most: true };
                if (i > 0 || percMost < kezd) return { blokk: b, datum: d, most: false };
            }
        }
        return null;
    }

    // Hátralévő órák a csoporttal az aktuális félév végéig (a mai, még el nem kezdett órákkal)
    function hatralevoOrak(k, most = new Date()) {
        const felev = felevE(most), vege = felev === 1 ? TANEV.felevVege : TANEV.utolsoNap;
        const bl = blokkok(felev).filter(b => b.kulcs === k);
        let db = 0;
        const percMost = most.getHours() * 60 + most.getMinutes();
        for (let d = new Date(most); iso(d) <= vege; d.setDate(d.getDate() + 1)) {
            if (!tanitasiNap(d)) continue;
            for (const b of bl) if (b.nap === d.getDay()) {
                if (iso(d) === iso(most) && perc(CSENGETES[b.eleje][0]) <= percMost) continue;
                db += b.db;
            }
        }
        return db;
    }

    // ── Adatbetöltés ─────────────────────────────────────────────────────────────
    async function getJson(url) {
        const r = await authFetch(`${RAILWAY_URL}${url}`);
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.json();
    }
    async function betolt() {
        const el = document.getElementById('csj-tartalom');
        try {
            const [orarend, utolsok] = await Promise.all([
                getJson(`/api/csoportjaim/orarend?tanev=${TANEV.kezdo}`), getJson('/api/csoportjaim/naplo')]);
            st.orarend = orarend;
            st.naploUtolsok = Object.fromEntries(utolsok.map(n => [n.csoport, n]));
            st.betoltve = true;
            if (!st.kivalasztott) {
                const ak = aktualisVagyKovetkezo();
                st.kivalasztott = ak ? ak.blokk.kulcs : (csoportok()[0] || null);
            }
            rajzolFejlec();
            if (st.kivalasztott) valaszt(st.kivalasztott);
            else el.innerHTML = '<div class="csj-ures">Még nincs felvéve órarend. A <b>Beállítások</b> gombbal veheted fel.</div>';
        } catch (e) {
            if (e.message === 'Munkamenet lejárt') return;
            el.innerHTML = `<div class="error">Betöltési hiba: ${esc(e.message)}</div>`;
        }
        haladasBetolt();
        onlineFrissit();
    }
    async function haladasBetolt() {
        try { st.haladas = await getJson('/api/haladas'); } catch { st.haladas = []; }
        rajzolTanulok();
    }
    async function onlineFrissit() {
        try { st.online = await getJson('/api/csoportjaim/online'); } catch { st.online = []; }
        rajzolTanulok();
    }

    // Az összes csoport (mindkét félév órarendjéből), évfolyam/osztály/csoport szerint rendezve
    function csoportok() {
        const set = [...new Set(st.orarend.map(kulcs))];
        return set.sort((a, b) => a.localeCompare(b, 'hu', { numeric: true }));
    }

    // ── Rajzolás: fejléc + csoportválasztó ───────────────────────────────────────
    function rajzolFejlec() {
        const ak = aktualisVagyKovetkezo();
        const fej = document.getElementById('csj-most');
        if (!ak) {
            fej.innerHTML = '<i class="fas fa-mug-hot"></i> A következő három hétben nincs órád az órarend szerint.';
        } else {
            const b = ak.blokk, ma = iso(ak.datum) === iso(new Date());
            const mikor = ak.most ? '<span class="csj-most-cimke">MOST</span>'
                : `<span class="csj-kov-cimke">KÖVETKEZŐ</span> ${ma ? 'ma' : huDatum(iso(ak.datum))}`;
            fej.innerHTML = `${mikor} <b>${esc(csoportNev(b.kulcs))}</b> · ${esc(blokkSzoveg(b))} · ${blokkIdo(b)}` +
                (b.terem ? ` · <i class="fas fa-door-open"></i> ${esc(b.terem)}` : '') +
                (new Date().getDay() === 5 ? ' <span class="csj-halvany">(pénteken nincs órád)</span>' : '');
        }
        const felev = felevE(new Date());
        const lista = document.getElementById('csj-csoportok');
        lista.innerHTML = csoportok().map(k => {
            const heti = blokkok(felev).filter(b => b.kulcs === k).reduce((s, b) => s + b.db, 0);
            const aktiv = ak && ak.blokk.kulcs === k;
            return `<button class="csj-chip${k === st.kivalasztott ? ' kivalasztott' : ''}${aktiv ? ' aktualis' : ''}"
                        onclick="csjValaszt(${jsArg(k)})">
                <span class="csj-chip-nev">${esc(csoportNev(k))}</span>
                <span class="csj-chip-info">${heti ? `heti ${heti} · hátra ${hatralevoOrak(k)}` : 'ebben a félévben nincs óra'}</span>
            </button>`;
        }).join('');
    }

    // ── Kiválasztott csoport ─────────────────────────────────────────────────────
    async function valaszt(k) {
        st.kivalasztott = k;
        st.szerkesztett = null;
        rajzolFejlec();
        const felev = felevE(new Date());
        const bl = blokkok(felev).filter(b => b.kulcs === k);
        const kov = (() => {
            for (let i = 0; i < 21; i++) {
                const d = new Date(); d.setDate(d.getDate() + i);
                if (!tanitasiNap(d)) continue;
                const b = blokkok(felevE(d)).find(x => x.kulcs === k && x.nap === d.getDay());
                if (b && (i > 0 || new Date().getHours() * 60 + new Date().getMinutes() < perc(CSENGETES[b.vege][1]))) return { b, d };
            }
            return null;
        })();
        document.getElementById('csj-tartalom').innerHTML = `
            <div class="csj-csoport-fej">
                <h3>${esc(csoportNev(k))}</h3>
                <div class="csj-halvany">
                    ${bl.length ? bl.map(b => esc(blokkSzoveg(b)) + (b.terem ? ` (${esc(b.terem)})` : '')).join(' · ') : 'Ebben a félévben nincs órád velük.'}
                    ${bl.length ? ` · <b>hátra ${hatralevoOrak(k)} óra</b> a félév végéig (${huDatum(felev === 1 ? TANEV.felevVege : TANEV.utolsoNap)})` : ''}
                    ${kov ? ` · következő: ${huDatum(iso(kov.d))} ${CSENGETES[kov.b.eleje][0]}` : ''}
                </div>
            </div>
            <section class="csj-szekcio">
                <div class="csj-szekcio-fej"><h4><i class="fas fa-book-open"></i> Óranapló</h4>
                    <button class="btn-refresh" onclick="csjUjBejegyzes()"><i class="fas fa-plus"></i> Mai óra jegyzete</button></div>
                <div id="csj-naplo"><div class="loading">Betöltés...</div></div>
            </section>
            <section class="csj-szekcio">
                <div class="csj-szekcio-fej"><h4><i class="fas fa-user-graduate"></i> Tanulók</h4>
                    <span class="csj-halvany" id="csj-online-info"></span></div>
                <div id="csj-tanulok"><div class="loading">Betöltés...</div></div>
            </section>`;
        rajzolTanulok();
        try { st.naplo = await getJson(`/api/csoportjaim/naplo?csoport=${encodeURIComponent(k)}`); }
        catch { st.naplo = []; }
        if (st.kivalasztott === k) rajzolNaplo();
    }

    // ── Óranapló ─────────────────────────────────────────────────────────────────
    const MEZOK = [['mitVettunk', 'Mit vettünk', 'pl. HTML táblázatok, 3. gyakorló feladat'],
                   ['kovetkezo', 'Hol folytatjuk', 'pl. táblázat stílusok, a házi megbeszélése'],
                   ['hazi', 'Házi feladat', ''],
                   ['megjegyzes', 'Megjegyzés a tanulókról (csak te látod)', 'pl. ki hiányzott, ki maradt le, kinek kell segíteni']];

    function urlapHtml(b) {
        return `<div class="csj-urlap">
            <label>Dátum <input type="date" id="csj-f-datum" value="${esc(b.datum)}"></label>
            ${MEZOK.map(([m, cimke, ph]) => `<label>${cimke}
                <textarea id="csj-f-${m}" rows="${m === 'megjegyzes' || m === 'mitVettunk' ? 2 : 1}" placeholder="${esc(ph)}">${esc(b[m] || '')}</textarea></label>`).join('')}
            <div class="csj-urlap-gombok">
                <button class="btn-refresh" onclick="csjMent()"><i class="fas fa-check"></i> Mentés</button>
                <button class="csj-gomb-halvany" onclick="csjMegse()">Mégse</button>
                <span id="csj-f-hiba" class="csj-hiba"></span>
            </div></div>`;
    }

    function bejegyzesHtml(n, kiemelt) {
        const sor = (cimke, v, cls = '') => v ? `<div class="csj-sor ${cls}"><span>${cimke}</span><div>${esc(v).replace(/\n/g, '<br>')}</div></div>` : '';
        return `<div class="csj-bejegyzes${kiemelt ? ' kiemelt' : ''}">
            <div class="csj-bejegyzes-fej"><b>${huDatum(n.datum)}</b>
                <span class="csj-ikonok">
                    <button title="Szerkesztés" onclick="csjSzerkeszt(${n.id})"><i class="fas fa-pen"></i></button>
                    <button title="Törlés" onclick="csjTorol(${n.id})"><i class="fas fa-trash"></i></button>
                </span></div>
            ${kiemelt && n.kovetkezo ? `<div class="csj-folytatjuk"><i class="fas fa-forward"></i> Hol folytatjuk: <b>${esc(n.kovetkezo)}</b></div>` : ''}
            ${sor('Vettük', n.mitVettunk)}
            ${kiemelt ? '' : sor('Folytatjuk', n.kovetkezo)}
            ${sor('Házi', n.hazi)}
            ${sor('Megjegyzés', n.megjegyzes, 'csj-megjegyzes')}
        </div>`;
    }

    function rajzolNaplo() {
        const el = document.getElementById('csj-naplo');
        if (!el) return;
        const sz = st.szerkesztett;
        const uj = sz && sz.id === 0 ? urlapHtml(sz) : '';
        if (!st.naplo.length && !uj) {
            el.innerHTML = '<div class="csj-ures">Még nincs bejegyzés ennél a csoportnál. Óra végén a <b>Mai óra jegyzete</b> gombbal írhatod be, hol tartotok.</div>';
            return;
        }
        const [elso, ...regiek] = st.naplo;
        const megjelenit = n => sz && sz.id === n.id ? urlapHtml(sz) : null;
        el.innerHTML = uj +
            (elso ? (megjelenit(elso) || bejegyzesHtml(elso, true)) : '') +
            (regiek.length ? `<details class="csj-regiek"><summary>Korábbi órák (${regiek.length})</summary>
                ${regiek.map(n => megjelenit(n) || bejegyzesHtml(n, false)).join('')}</details>` : '');
        if (sz && regiek.some(n => n.id === sz.id)) el.querySelector('.csj-regiek').open = true;
    }

    window.csjUjBejegyzes = () => {
        st.szerkesztett = { id: 0, datum: iso(new Date()) };
        rajzolNaplo();
        document.getElementById('csj-f-mitVettunk')?.focus();
    };
    window.csjSzerkeszt = id => { st.szerkesztett = { ...st.naplo.find(n => n.id === id) }; rajzolNaplo(); };
    window.csjMegse = () => { st.szerkesztett = null; rajzolNaplo(); };

    window.csjMent = async () => {
        const sz = st.szerkesztett, hiba = document.getElementById('csj-f-hiba');
        const adat = { csoport: st.kivalasztott, datum: document.getElementById('csj-f-datum').value, temak: sz.temak || null };
        MEZOK.forEach(([m]) => { const v = document.getElementById('csj-f-' + m).value.trim(); adat[m] = v || null; });
        if (!adat.datum) { hiba.textContent = 'Add meg a dátumot!'; return; }
        if (!adat.mitVettunk && !adat.kovetkezo && !adat.hazi && !adat.megjegyzes) { hiba.textContent = 'Írj be legalább egy mezőt!'; return; }
        try {
            const r = await authFetch(`${RAILWAY_URL}/api/csoportjaim/naplo${sz.id ? '/' + sz.id : ''}`, {
                method: sz.id ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(adat) });
            if (!r.ok) throw new Error((await r.json().catch(() => ({}))).error || 'HTTP ' + r.status);
            st.szerkesztett = null;
            st.naplo = await getJson(`/api/csoportjaim/naplo?csoport=${encodeURIComponent(st.kivalasztott)}`);
            if (st.naplo[0]) st.naploUtolsok[st.kivalasztott] = st.naplo[0];
            rajzolNaplo();
        } catch (e) { hiba.textContent = 'Nem sikerült menteni: ' + e.message; }
    };

    window.csjTorol = async id => {
        const n = st.naplo.find(x => x.id === id);
        if (!n || !confirm(`Biztosan törlöd a ${huDatum(n.datum)} bejegyzést?`)) return;
        const r = await authFetch(`${RAILWAY_URL}/api/csoportjaim/naplo/${id}`, { method: 'DELETE' });
        if (r.ok) { st.naplo = st.naplo.filter(x => x.id !== id); rajzolNaplo(); }
    };

    // ── Tanulók ──────────────────────────────────────────────────────────────────
    function csoportTanuloi(k) {
        const [e, o, c] = k.split('.');
        return (st.haladas || []).filter(t => String(t.evfolyam || '') === e
            && String(t.osztaly || '').toUpperCase() === o.toUpperCase()
            && (!c || String(t.csoport || '') === c))
            .sort((a, b) => (a.nev || '').localeCompare(b.nev || '', 'hu'));
    }
    function relIdo(s) {
        if (!s) return '<span class="csj-halvany">–</span>';
        const d = new Date(s.replace(' ', 'T')), napok = Math.floor((new Date().setHours(0, 0, 0, 0) - new Date(d).setHours(0, 0, 0, 0)) / 864e5);
        const txt = napok <= 0 ? 'ma' : napok === 1 ? 'tegnap' : napok < 7 ? `${napok} napja` : `${s.slice(5, 10).replace('-', '.')}.`;
        return `<span class="${napok >= 14 ? 'csj-piros' : napok >= 7 ? 'csj-sarga' : ''}">${txt}</span>`;
    }
    const pct = v => v ? `${Math.round(v)}%` : '<span class="csj-halvany">–</span>';

    function rajzolTanulok() {
        const el = document.getElementById('csj-tanulok');
        if (!el || !st.kivalasztott) return;
        if (st.haladas === null) return;
        const lista = csoportTanuloi(st.kivalasztott);
        const online = new Map();
        st.online.forEach(o => { if (!online.has(o.email) || o.page !== 'portal') online.set(o.email, o.page); });
        const bentDb = lista.filter(t => online.has((t.email || '').toLowerCase())).length;
        const info = document.getElementById('csj-online-info');
        if (info) info.innerHTML = `${lista.length} tanuló · <span class="csj-zold"><i class="fas fa-circle"></i> ${bentDb} most bent</span> · frissül 30 mp-enként`;
        if (!lista.length) {
            el.innerHTML = '<div class="csj-ures">Ebbe a csoportba még nem regisztrált tanuló (évfolyam + osztály + csoport alapján).</div>';
            return;
        }
        const tananyag = t => [['HTML', t.tananyagHtml], ['CSS', t.tananyagCss], ['BS', t.tananyagBootstrap], ['Emmet', t.tananyagEmmet], ['JS', t.tananyagJavascript]]
            .map(([n, v]) => `<span class="csj-tag${v ? ' kesz' : ''}" title="${n}${v ? ' kész: ' + esc(v) : ' – még nincs kész'}">${n}</span>`).join('');
        el.innerHTML = `<div class="table-wrapper"><table class="submissions-table csj-tabla">
            <thead><tr><th>Tanuló</th><th>Most</th><th>WEB tananyag</th><th style="text-align:center">WEB gyakorló</th>
                <th style="text-align:center">Tudáspróba</th><th style="text-align:center">Interaktív</th><th style="text-align:center">Utoljára</th></tr></thead>
            <tbody>${lista.map(t => {
                const lap = online.get((t.email || '').toLowerCase());
                return `<tr>
                    <td><b>${esc(t.nev || t.email)}</b></td>
                    <td>${lap ? `<span class="csj-zold"><i class="fas fa-circle"></i> ${esc(OLDAL[lap] || lap)}</span>` : '<span class="csj-halvany">–</span>'}</td>
                    <td>${tananyag(t)}</td>
                    <td style="text-align:center">${t.webSessions ? `${t.webSessions} alk. · ${pct(t.webAvgPct)}` : '<span class="csj-halvany">–</span>'}</td>
                    <td style="text-align:center">${pct(t.tudasproBestPct)}</td>
                    <td style="text-align:center">${pct(t.interaktivBestPct)}</td>
                    <td style="text-align:center">${relIdo(t.lastActive)}</td></tr>`;
            }).join('')}</tbody></table></div>`;
    }

    // ── Órarend-beállítás (egyszerű szerkesztő) ──────────────────────────────────
    window.csjBeallitas = () => {
        const felev = felevE(new Date());
        const sorok = st.orarend.filter(o => o.felev === felev);
        const m = document.getElementById('csj-beallitas');
        m.style.display = 'flex';
        m.innerHTML = `<div class="csj-modal">
            <h3><i class="fas fa-calendar-week"></i> Órarend</h3>
            <div class="csj-halvany" style="margin-bottom:8px">Félév: <select id="csj-b-felev" onchange="csjBeallitasFelev(this.value)">
                <option value="1"${felev === 1 ? ' selected' : ''}>1. félév (–${TANEV.felevVege})</option>
                <option value="2"${felev === 2 ? ' selected' : ''}>2. félév</option></select>
                · Soronként: <code>nap óra évfolyam osztály csoport terem</code>, pl. <code>hétfő 1 9 B 2 104</code> vagy <code>szerda 2 9 K info 29</code></div>
            <textarea id="csj-b-szoveg" rows="16" style="width:100%;font-family:monospace">${esc(orarendSzoveg(sorok))}</textarea>
            <div class="csj-urlap-gombok"><button class="btn-refresh" onclick="csjBeallitasMent()"><i class="fas fa-check"></i> Mentés</button>
                <button class="csj-gomb-halvany" onclick="document.getElementById('csj-beallitas').style.display='none'">Bezárás</button>
                <span id="csj-b-hiba" class="csj-hiba"></span></div></div>`;
    };
    const NAPOK = { 'hétfő': 1, 'kedd': 2, 'szerda': 3, 'csütörtök': 4, 'péntek': 5 };
    const orarendSzoveg = sorok => sorok.map(o => `${NAPNEV[o.nap]} ${o.ora} ${o.evfolyam} ${o.osztaly} ${o.csoport || '-'} ${o.terem || ''}`.trim()).join('\n');
    window.csjBeallitasFelev = f => {
        document.getElementById('csj-b-szoveg').value = orarendSzoveg(st.orarend.filter(o => o.felev === Number(f)));
    };
    window.csjBeallitasMent = async () => {
        const felev = Number(document.getElementById('csj-b-felev').value), hiba = document.getElementById('csj-b-hiba');
        const orak = [];
        for (const [i, sor] of document.getElementById('csj-b-szoveg').value.split('\n').entries()) {
            const p = sor.trim().split(/\s+/);
            if (!sor.trim()) continue;
            const nap = NAPOK[p[0]?.toLowerCase()], ora = Number(p[1]);
            if (!nap || !(ora >= 0 && ora <= 10) || !p[2] || !p[3]) { hiba.textContent = `Hibás ${i + 1}. sor: „${sor}”`; return; }
            orak.push({ felev, nap, ora, evfolyam: p[2], osztaly: p[3].toUpperCase(), csoport: p[4] && p[4] !== '-' ? p[4] : null, terem: p.slice(5).join(' ') || null });
        }
        const r = await authFetch(`${RAILWAY_URL}/api/csoportjaim/orarend`, { method: 'PUT', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tanev: TANEV.kezdo, felev, orak }) });
        if (!r.ok) { hiba.textContent = (await r.json().catch(() => ({}))).error || 'Mentési hiba'; return; }
        document.getElementById('csj-beallitas').style.display = 'none';
        st.kivalasztott = null;
        betolt();
    };

    // ── Indítás / admin.html kapcsolat ───────────────────────────────────────────
    window.csjValaszt = k => valaszt(k);
    window.csjMegnyit = () => {
        if (!st.betoltve) betolt(); else { rajzolFejlec(); onlineFrissit(); }
        clearInterval(st.onlineTimer);
        st.onlineTimer = setInterval(() => {
            const panel = document.querySelector('[data-tab="csoportjaim"]');
            if (!panel || panel.style.display === 'none' || document.hidden) return;
            onlineFrissit(); rajzolFejlec();
        }, 30000);
    };
    // Tanítási időben (H–Cs 7:00–16:00) az admin ezzel a füllel nyíljon
    window.csjTanitasiIdo = () => {
        const most = new Date(), p = most.getHours() * 60 + most.getMinutes();
        return most.getDay() >= 1 && most.getDay() <= 4 && p >= 420 && p < 960 && tanitasiNap(most);
    };
    window._csjTeszt = { aktualisVagyKovetkezo, hatralevoOrak, blokkok, tanitasiNap, st };
})();
