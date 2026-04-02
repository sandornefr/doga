/**
 * special-roles.js – Tesztelő és Feladatkészítő funkciók minden oldalon
 * Tesztelőknek: a Kandó logóra húzva egeret bug ikonra vált → kattintva hibajelentés nyílik.
 * Feladatkészítőknek: FAB gomb feladat beküldéshez (portálon).
 */
(function () {
    'use strict';

    const API = 'http://192.168.0.250';

    function getUser() {
        try { return JSON.parse(sessionStorage.getItem('kandoUser') || '{}'); }
        catch { return {}; }
    }

    function esc(s) {
        return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    // ── CSS ──────────────────────────────────────────────────────────────────
    function injectCSS() {
        if (document.getElementById('sr-css')) return;
        const s = document.createElement('style');
        s.id = 'sr-css';
        s.textContent = `
            /* Feladat küldése FAB */
            #sr-fab-wrap {
                position: fixed; bottom: 24px; left: 24px;
                display: flex; flex-direction: column; align-items: flex-start; gap: 10px;
                z-index: 25000;
            }
            .sr-fab {
                display: flex; align-items: center; gap: 8px;
                padding: 10px 18px; border: none; border-radius: 30px;
                font-family: 'Segoe UI', sans-serif; font-size: 0.85rem; font-weight: 700;
                cursor: pointer; color: #fff; transition: transform .15s, box-shadow .15s;
                white-space: nowrap;
            }
            .sr-fab:hover { transform: translateY(-2px); }
            #sr-feladat-fab { background: #0d9488; box-shadow: 0 4px 18px rgba(13,148,136,.45); }
            #sr-feladat-fab:hover { box-shadow: 0 6px 24px rgba(13,148,136,.6); }

            /* Kandó logó bug hover (tesztelőknek) */
            #kando-logo-wrap { position: relative; display: inline-block; }
            #kando-bug-badge {
                display: none; position: absolute; inset: 0;
                background: rgba(0,0,0,0.45); border-radius: 4px;
                font-size: 1.3rem; align-items: center; justify-content: center;
                pointer-events: none;
            }
            #kando-logo-wrap.bug-aktiv { cursor: pointer; }
            #kando-logo-wrap.bug-aktiv:hover #kando-bug-badge { display: flex; }

            .sr-overlay {
                display: none; position: fixed; inset: 0;
                background: rgba(0,0,0,.82); z-index: 30000;
                align-items: center; justify-content: center; padding: 16px;
            }
            .sr-overlay.open { display: flex; }
            .sr-box {
                background: #16213e; border-radius: 16px; padding: 24px;
                width: 90%; max-width: 500px; max-height: 90vh; overflow-y: auto;
                font-family: 'Segoe UI', sans-serif;
            }
            .sr-box h3 { font-size: 1.05rem; margin-bottom: 6px; }
            .sr-box p  { color: #888; font-size: 0.84rem; margin-bottom: 14px; line-height: 1.5; }
            .sr-fg { margin-bottom: 10px; }
            .sr-fg label { display: block; color: #94a3b8; font-size: 0.79rem; margin-bottom: 4px; }
            .sr-fg input, .sr-fg select, .sr-fg textarea {
                width: 100%; background: #0f1e3c; border: 1px solid #1f3460;
                border-radius: 8px; color: #e0e0e0; font-size: 0.88rem;
                padding: 7px 10px; font-family: inherit; box-sizing: border-box;
            }
            .sr-fg input:focus, .sr-fg select:focus, .sr-fg textarea:focus { outline: none; border-color: #0d9488; }
            .sr-fg textarea { min-height: 80px; resize: vertical; }
            .sr-row2 { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
            .sr-btns { display: flex; gap: 8px; justify-content: flex-end; margin-top: 14px; flex-wrap: wrap; }
            .sr-btn-ok  { padding: 8px 18px; border: none; border-radius: 8px; color: #fff; font-size: 0.88rem; font-weight: 600; cursor: pointer; font-family: inherit; }
            .sr-btn-sec { padding: 8px 16px; background: transparent; border: 1px solid #374151; border-radius: 8px; color: #9ca3af; font-size: 0.88rem; cursor: pointer; font-family: inherit; }
            .sr-msg { font-size: 0.81rem; margin-top: 8px; min-height: 18px; }
            .sr-ok  { color: #4ade80; }
            .sr-err { color: #e94560; }
        `;
        document.head.appendChild(s);
    }

    // ── HTML ─────────────────────────────────────────────────────────────────
    function injectHTML() {
        if (document.getElementById('sr-fab-wrap')) return;

        // FAB gomb feladatkészítőknek
        const fab = document.createElement('div');
        fab.id = 'sr-fab-wrap';
        fab.innerHTML = `
            <button class="sr-fab" id="sr-feladat-fab" onclick="window._srFeladatOpen()" style="display:none;">✏️ Feladat küldése</button>
        `;
        document.body.appendChild(fab);

        // Hibajelentés modal
        const hm = document.createElement('div');
        hm.id = 'sr-hiba-modal'; hm.className = 'sr-overlay';
        hm.innerHTML = `
            <div class="sr-box" style="border:1.5px solid #dc2626;">
                <h3 style="color:#f87171;"><i class="fa-solid fa-bug"></i> Hibajelentés</h3>
                <p>Írj le egy tesztelés közben talált hibát. Képernyőképet csatolhatsz fájlból <strong>vagy Ctrl+V</strong>-vel a vágólapról.</p>
                <div class="sr-fg">
                    <label>Leírás *</label>
                    <textarea id="sr-hiba-szoveg" placeholder="Mit csináltál, mi történt, mi lett volna a helyes viselkedés..."></textarea>
                </div>
                <div class="sr-fg">
                    <label>Screenshot (opcionális)</label>
                    <input type="file" id="sr-hiba-kep" accept="image/*" style="padding:4px;">
                </div>
                <img id="sr-hiba-preview" style="max-width:100%;border-radius:6px;margin-top:6px;display:none;border:1px solid #1f3460;" alt="">
                <div id="sr-hiba-msg" class="sr-msg"></div>
                <div class="sr-btns">
                    <button class="sr-btn-sec" onclick="window._srHibaClose()">Mégse</button>
                    <button class="sr-btn-ok"  style="background:#dc2626;" onclick="window._srHibaSend()">Beküldés</button>
                </div>
            </div>`;
        document.body.appendChild(hm);

        // Feladat beküldő modal
        const fm = document.createElement('div');
        fm.id = 'sr-feladat-modal'; fm.className = 'sr-overlay';
        fm.innerHTML = `
            <div class="sr-box" style="border:1.5px solid #0d9488;">
                <h3 style="color:#2dd4bf;">✏️ Feladat beküldése</h3>
                <p>Töltsd ki az alábbi mezőket. A beküldött feladatot a tanár ellenőrzi, és ha bekerül, a neved megjelenik a Megvalósult ötletek között!</p>
                <div class="sr-fg">
                    <label>Feladat címe *</label>
                    <input type="text" id="sr-fk-cim" placeholder="pl. Okosotthon hőmérséklet figyelő">
                </div>
                <div class="sr-row2">
                    <div class="sr-fg">
                        <label>Pontszám</label>
                        <select id="sr-fk-pont">
                            <option value="8">8 pont</option>
                            <option value="14">14 pont</option>
                            <option value="18">18 pont</option>
                        </select>
                    </div>
                    <div class="sr-fg">
                        <label>Típus</label>
                        <select id="sr-fk-tipus">
                            <option value="if">if / elágazás</option>
                            <option value="ciklus">ciklus (for / while)</option>
                            <option value="függvény">függvény</option>
                            <option value="vegyes">vegyes</option>
                        </select>
                    </div>
                </div>
                <div class="sr-fg">
                    <label>Feladat szövege *</label>
                    <textarea id="sr-fk-szoveg" placeholder="Írd le pontosan mit kell megcsinálnia a programnak, milyen bemeneteket kér be, milyen kimenetet ad..."></textarea>
                </div>
                <div class="sr-fg">
                    <label>Esetleges megoldás (opcionális)</label>
                    <textarea id="sr-fk-megoldas" style="min-height:60px;" placeholder="Python kód..."></textarea>
                </div>
                <div id="sr-fk-msg" class="sr-msg"></div>
                <div class="sr-btns">
                    <button class="sr-btn-sec" onclick="window._srFeladatClose()">Mégse</button>
                    <button class="sr-btn-ok"  style="background:#0f766e;" onclick="window._srFeladatSend(true)">+ Még küldök</button>
                    <button class="sr-btn-ok"  style="background:#0d9488;" onclick="window._srFeladatSend(false)">Beküldés</button>
                </div>
            </div>`;
        document.body.appendChild(fm);

        // Screenshot előnézet fájlból
        document.getElementById('sr-hiba-kep').addEventListener('change', function () {
            const f = this.files[0];
            if (!f) return;
            const r = new FileReader();
            r.onload = e => { _srHibaSetKep(e.target.result); };
            r.readAsDataURL(f);
        });
    }

    // ── Kép kezelés ──────────────────────────────────────────────────────────
    let _srHibaKep = null;

    function _srHibaSetKep(dataUrl) {
        _srHibaKep = dataUrl;
        const img = document.getElementById('sr-hiba-preview');
        if (img) { img.src = dataUrl; img.style.display = 'block'; }
    }

    // Document szintű paste: akkor kap képet, ha a hiba modal nyitva van
    document.addEventListener('paste', function(e) {
        const modal = document.getElementById('sr-hiba-modal');
        if (!modal || !modal.classList.contains('open')) return;
        const items = e.clipboardData && e.clipboardData.items;
        if (!items) return;
        for (let i = 0; i < items.length; i++) {
            if (items[i].type.startsWith('image/')) {
                const r = new FileReader();
                r.onload = ev => { _srHibaSetKep(ev.target.result); };
                r.readAsDataURL(items[i].getAsFile());
                e.preventDefault(); break;
            }
        }
    });

    // ── Kandó logó bug aktiválása ─────────────────────────────────────────────
    function activateBugLogo() {
        const wrap = document.getElementById('kando-logo-wrap');
        if (!wrap || wrap.dataset.bugActive) return;
        wrap.dataset.bugActive = '1';
        wrap.classList.add('bug-aktiv');
        wrap.title = '🐛 Hibajelentés';
        // Belső <a> link navigáció tiltása
        const link = wrap.querySelector('a');
        if (link) link.style.pointerEvents = 'none';
        wrap.addEventListener('click', function(e) {
            e.preventDefault();
            window._srHibaOpen();
        });
    }

    // ── Hibajelentés ─────────────────────────────────────────────────────────
    window._srHibaOpen = function () {
        _srHibaKep = null;
        document.getElementById('sr-hiba-szoveg').value = '';
        const prev = document.getElementById('sr-hiba-preview');
        if (prev) { prev.src = ''; prev.style.display = 'none'; }
        const kep = document.getElementById('sr-hiba-kep');
        if (kep) kep.value = '';
        document.getElementById('sr-hiba-msg').textContent = '';
        document.getElementById('sr-hiba-msg').className = 'sr-msg';
        document.getElementById('sr-hiba-modal').classList.add('open');
    };
    window._srHibaClose = function () {
        document.getElementById('sr-hiba-modal').classList.remove('open');
    };
    window._srHibaSend = async function () {
        const user   = getUser();
        const szoveg = document.getElementById('sr-hiba-szoveg').value.trim();
        const msgEl  = document.getElementById('sr-hiba-msg');
        if (!szoveg) { msgEl.textContent = 'A leírás kötelező!'; msgEl.className = 'sr-msg sr-err'; return; }

        const kepBase64 = _srHibaKep || null;

        const oldal = window.location.pathname.split('/').pop() || 'oldal';
        try {
            const res = await fetch(`${API}/api/otlet`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: user.email || '', nev: user.nev || '',
                    osztaly: user.osztaly || null,
                    szoveg: '[HIBAJELENTÉS – ' + oldal + '] ' + szoveg,
                    kepBase64, tipus: 'hiba'
                })
            });
            if (res.ok) {
                msgEl.textContent = '✅ Hibajelentés elküldve!';
                msgEl.className = 'sr-msg sr-ok';
                setTimeout(window._srHibaClose, 1600);
            } else {
                msgEl.textContent = 'Hiba a küldéskor (' + res.status + ')';
                msgEl.className = 'sr-msg sr-err';
            }
        } catch {
            msgEl.textContent = 'Hálózati hiba – ellenőrizd az internetkapcsolatot!';
            msgEl.className = 'sr-msg sr-err';
        }
    };

    // ── Feladat beküldés ──────────────────────────────────────────────────────
    window._srFeladatOpen = function () {
        document.getElementById('sr-feladat-modal').classList.add('open');
        document.getElementById('sr-fk-msg').textContent = '';
        document.getElementById('sr-fk-msg').className = 'sr-msg';
    };
    window._srFeladatClose = function () {
        document.getElementById('sr-feladat-modal').classList.remove('open');
        document.getElementById('sr-fk-cim').value     = '';
        document.getElementById('sr-fk-szoveg').value  = '';
        document.getElementById('sr-fk-megoldas').value= '';
    };
    window._srFeladatSend = async function (maradjon) {
        const user    = getUser();
        const cim     = document.getElementById('sr-fk-cim').value.trim();
        const szoveg  = document.getElementById('sr-fk-szoveg').value.trim();
        const pont    = parseInt(document.getElementById('sr-fk-pont').value);
        const tipus   = document.getElementById('sr-fk-tipus').value;
        const megoldas= document.getElementById('sr-fk-megoldas').value.trim();
        const msgEl   = document.getElementById('sr-fk-msg');
        if (!cim || !szoveg) { msgEl.textContent = 'A cím és a szöveg kötelező!'; msgEl.className = 'sr-msg sr-err'; return; }
        try {
            const res = await fetch(`${API}/api/feladat-javaslatok`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${user.token || ''}` },
                body: JSON.stringify({ email: user.email || '', nev: user.nev || '', osztaly: user.osztaly || null, cim, pont, tipus, szoveg, megoldas: megoldas || null })
            });
            if (res.ok) {
                if (maradjon) {
                    msgEl.textContent = '✅ Beküldve! Küldhetsz másikat.';
                    msgEl.className = 'sr-msg sr-ok';
                    document.getElementById('sr-fk-cim').value     = '';
                    document.getElementById('sr-fk-szoveg').value  = '';
                    document.getElementById('sr-fk-megoldas').value= '';
                } else { window._srFeladatClose(); }
            } else {
                msgEl.textContent = 'Hiba a küldéskor (' + res.status + ')';
                msgEl.className = 'sr-msg sr-err';
            }
        } catch {
            msgEl.textContent = 'Hálózati hiba!';
            msgEl.className = 'sr-msg sr-err';
        }
    };

    // ── Init ─────────────────────────────────────────────────────────────────
    function isPortal() {
        return /portal\.html$|\/doga\/?$|\/doga\/portal/.test(window.location.pathname)
            || window.location.pathname.endsWith('/');
    }

    async function init() {
        const user = getUser();

        // _tesztMod (Teszt Elek): tanár tesztel diák-ként → bug logó mindenhol
        if (user._tesztMod) {
            injectCSS(); injectHTML(); activateBugLogo();
            return;
        }

        if (!user.email) return;
        if (user.szerep === 'oktato') return;
        if (user.szerep !== 'tanulo') return;

        try {
            const [tRes, fRes] = await Promise.all([
                fetch(`${API}/api/tesztelok/check?email=${encodeURIComponent(user.email)}`),
                fetch(`${API}/api/feladatkeszito/check?email=${encodeURIComponent(user.email)}`)
            ]);
            const isTesztelő      = tRes.ok && (await tRes.json()).isTesztelő;
            const isFeladatkeszito= fRes.ok && (await fRes.json()).isFeladatkeszito;
            if (!isTesztelő && !isFeladatkeszito) return;

            injectCSS();
            injectHTML();

            if (isTesztelő) {
                sessionStorage.setItem('kandoIsTesztelő', '1');
                activateBugLogo();
            }
            if (isFeladatkeszito && isPortal()) {
                document.getElementById('sr-feladat-fab').style.display = 'flex';
            }
        } catch {}
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        setTimeout(init, 0);
    }
})();
