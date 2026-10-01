/**
 * learn-sync.js – WEB tananyag előrehaladás mentése a fiókhoz kötve
 *
 * - Bejelentkezett tanulónál a kész feladatok listája a szerveren is tárolódik
 *   (/api/user-state/{email}/haladas_<tananyag>), így nem vész el sütitörléskor,
 *   és másik gépen is megvan.
 * - A böngészőben tanulónként külön kulcs (<SKEY>_done_<email>), hogy közös iskolai
 *   gépen ne lássák egymás haladását. Vendég / Teszt Elek: a régi közös kulcs marad.
 * - A szerver és a helyi állapot összefésülése: ami bárhol kész, az kész.
 */
(function () {
    const API = 'https://agazati.up.railway.app';

    function user() {
        try { return JSON.parse(sessionStorage.getItem('kandoUser') || '{}'); } catch { return {}; }
    }
    function tanulo() {
        const u = user();
        return (u.token && u.email && !u._tesztMod) ? u : null;
    }
    function localKey(skey) {
        const u = tanulo();
        return skey + '_done' + (u ? '_' + u.email.toLowerCase() : '');
    }
    // A szerveren verziófüggetlen kulcs (lhtml_v7 -> haladas_lhtml): verzióváltáskor is megmarad
    function serverKey(skey) { return 'haladas_' + skey.replace(/_v\d+$/, ''); }

    function parse(s) {
        try { const v = JSON.parse(s || 'null'); return Array.isArray(v) ? v : null; } catch { return null; }
    }
    function fit(arr, n) {
        const out = Array(n).fill(false);
        (arr || []).slice(0, n).forEach((d, i) => { out[i] = !!d; });
        return out;
    }
    function lsGet(k) { try { return localStorage.getItem(k); } catch { return null; } }
    function lsSet(k, v) { try { localStorage.setItem(k, v); } catch {} }
    function lsDel(k) { try { localStorage.removeItem(k); } catch {} }

    function put(skey, done) {
        const u = tanulo();
        if (!u) return Promise.resolve();
        return fetch(`${API}/api/user-state/${encodeURIComponent(u.email)}/${serverKey(skey)}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + u.token },
            body: JSON.stringify({ value: JSON.stringify(done.map(Boolean)) })
        }).catch(() => {});
    }

    window.LearnSync = {
        // Helyi állapot betöltése (szinkron, az oldal indulásakor)
        load(skey, n) {
            const key = localKey(skey);
            let v = parse(lsGet(key));
            if (!v && key !== skey + '_done') {
                // Régi, közös kulcs átvétele az első bejelentkezett tanulónak, utána törlés,
                // hogy a gépet használó következő tanuló ne örökölje
                v = parse(lsGet(skey + '_done'));
                if (v) { lsSet(key, JSON.stringify(v)); lsDel(skey + '_done'); }
            }
            return fit(v, n);
        },

        // Mentés helyben és (bejelentkezve) a szerveren
        save(skey, done) {
            lsSet(localKey(skey), JSON.stringify(done));
            put(skey, done);
        },

        // Kész-e az egész tananyag (a tananyag-kvíz előfeltétele): helyben vagy a szerveren
        async allDone(skey) {
            const kesz = a => !!a && a.length > 0 && a.every(Boolean);
            if (kesz(parse(lsGet(localKey(skey)))) || kesz(parse(lsGet(skey + '_done')))) return true;
            const u = tanulo();
            if (!u) return false;
            try {
                const res = await fetch(`${API}/api/user-state/${encodeURIComponent(u.email)}/${serverKey(skey)}`,
                    { headers: { 'Authorization': 'Bearer ' + u.token } });
                return res.ok && kesz(parse((await res.json()).value));
            } catch { return false; }
        },

        // Szerverrel összefésülés; ha a helyi állapot bővült, a done tömb helyben frissül és onChange fut
        async sync(skey, done, onChange) {
            const u = tanulo();
            if (!u) return;
            let server = null;
            try {
                const res = await fetch(`${API}/api/user-state/${encodeURIComponent(u.email)}/${serverKey(skey)}`,
                    { headers: { 'Authorization': 'Bearer ' + u.token } });
                if (!res.ok) return;
                server = parse((await res.json()).value);
            } catch { return; }
            const srv = fit(server, done.length);
            let helyiValtozott = false, szerverreKell = false;
            done.forEach((d, i) => {
                if (srv[i] && !d) { done[i] = true; helyiValtozott = true; }
                if (d && !srv[i]) szerverreKell = true;
            });
            if (helyiValtozott) { lsSet(localKey(skey), JSON.stringify(done)); if (onChange) onChange(); }
            if (szerverreKell) put(skey, done);
        }
    };
})();
