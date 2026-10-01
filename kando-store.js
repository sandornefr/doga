/**
 * kando-store.js – gyakorlók mentése a tanuló fiókjához kötve (localStorage helyett)
 *
 *   const store = KandoStore.create('py_basics');
 *   store.getItem(k) / store.setItem(k, v) / store.removeItem(k)   – mint a localStorage
 *
 * - Bejelentkezett tanulónál MINDEN a szerveren van (egy JSON a gyakorlónként:
 *   /api/user-state/{email}/gyak_<névtér>), a böngészőben semmi. Bármelyik gépen ott folytatja,
 *   ahol abbahagyta, és senki nem kapja meg más (ugyanazon a gépen dolgozó) tanuló munkáját.
 *   A régi böngészős adatokat (<névtér>_*) nem vesszük át, törlődnek.
 * - A betöltés az oldal indulásakor szinkron (az oldalak indulókódja azonnal olvas);
 *   a mentés késleltetve, a háttérben megy, oldal elhagyásakor azonnal.
 * - Ha a betöltés nem sikerül, nem mentünk (különben felülírnánk a meglévő munkát) – figyelmeztetünk.
 * - Vendég / oktató / Teszt Elek: sima localStorage, mint eddig.
 */
(function () {
    const API = 'https://agazati.up.railway.app';

    function tanulo() {
        try {
            const u = JSON.parse(sessionStorage.getItem('kandoUser') || '{}');
            return (u.token && u.email && u.szerep === 'tanulo' && !u._tesztMod) ? u : null;
        } catch { return null; }
    }

    function helyi(nevter) {
        return {
            getItem(k)    { try { return localStorage.getItem(k); } catch { return null; } },
            setItem(k, v) { try { localStorage.setItem(k, v); } catch {} },
            removeItem(k) { try { localStorage.removeItem(k); } catch {} },
            // A gyakorló összes adata (<névtér>_*) – újrakezdéshez
            clear() {
                try { Object.keys(localStorage).filter(k => k.startsWith(nevter + '_')).forEach(k => localStorage.removeItem(k)); } catch {}
            },
            szerveres: false
        };
    }

    function figyelmeztet() {
        const show = () => {
            if (document.getElementById('kando-store-hiba')) return;
            const d = document.createElement('div');
            d.id = 'kando-store-hiba';
            d.style.cssText = 'position:fixed;left:50%;bottom:16px;transform:translateX(-50%);z-index:99999;' +
                'background:#7f1d1d;color:#fff;border:1px solid #ef4444;border-radius:10px;padding:10px 16px;' +
                'font:600 0.85rem system-ui,sans-serif;max-width:92vw;box-shadow:0 6px 24px rgba(0,0,0,.4)';
            d.textContent = 'A mentett munkád betöltése nem sikerült. Frissítsd az oldalt – amíg ez látszik, a munkád nem mentődik!';
            document.body.appendChild(d);
        };
        if (document.body) show(); else document.addEventListener('DOMContentLoaded', show);
    }

    function create(nevter) {
        const u = tanulo();
        if (!u) return helyi(nevter);

        // Régi böngészős adatok törlése – nem vesszük át (bárkié lehetett ezen a gépen)
        try {
            Object.keys(localStorage).filter(k => k.startsWith(nevter + '_')).forEach(k => localStorage.removeItem(k));
        } catch {}

        const url = `${API}/api/user-state/${encodeURIComponent(u.email)}/gyak_${nevter}`;
        let adat = {}, betoltve = false;
        try {
            const xhr = new XMLHttpRequest();
            xhr.open('GET', url, false);   // szinkron: az oldal indulókódja azonnal olvas
            xhr.setRequestHeader('Authorization', 'Bearer ' + u.token);
            xhr.send();
            if (xhr.status === 200) {
                const v = JSON.parse(xhr.responseText).value;
                const o = v ? JSON.parse(v) : {};
                if (o && typeof o === 'object' && !Array.isArray(o)) adat = o;
                betoltve = true;
            }
        } catch {}
        if (!betoltve) figyelmeztet();

        let timer = null, piszkos = false;
        function kuld(kilepes) {
            clearTimeout(timer);
            if (!piszkos || !betoltve) return;
            piszkos = false;
            const body = JSON.stringify({ value: JSON.stringify(adat) });
            fetch(url, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + u.token },
                body,
                keepalive: !!kilepes && body.length < 60000
            }).then(r => { if (!r.ok) throw new Error(); })
              .catch(() => { piszkos = true; if (!kilepes) timer = setTimeout(() => kuld(false), 5000); });
        }
        function utemez() { piszkos = true; clearTimeout(timer); timer = setTimeout(() => kuld(false), 1500); }
        window.addEventListener('pagehide', () => kuld(true));
        document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') kuld(true); });

        return {
            getItem(k)    { return Object.prototype.hasOwnProperty.call(adat, k) ? adat[k] : null; },
            setItem(k, v) { v = String(v); if (adat[k] === v) return; adat[k] = v; utemez(); },
            removeItem(k) { if (!(k in adat)) return; delete adat[k]; utemez(); },
            clear()       { adat = {}; piszkos = true; kuld(true); },   // újrakezdés: azonnal (utána jöhet reload)
            szerveres: true
        };
    }

    window.KandoStore = { create };
})();
