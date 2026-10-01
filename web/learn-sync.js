/**
 * learn-sync.js – WEB tananyag előrehaladás mentése a fiókhoz kötve
 *
 * - Bejelentkezett tanulónál a haladás KIZÁRÓLAG a szerveren tárolódik
 *   (/api/user-state/{email}/haladas_<tananyag>), a böngészőben semmi. Így mindenki csak a
 *   saját munkájával halad, sütitörléskor sem vész el, és bármelyik gépen ott folytatja,
 *   ahol abbahagyta. A korábbi böngészős (bárki által elért) haladást nem vesszük át, törlődik.
 * - Ha a szerveren még nincs feladatonkénti haladás, de a tanuló korábban saját fiókkal
 *   befejezte a tananyagot (tananyag_<név> dátum), az egész kész.
 * - Vendég / Teszt Elek (nincs saját tanulói token): böngészős mentés, mint eddig.
 */
(function () {
    const API = 'https://agazati.up.railway.app';

    // A tananyag befejezésének régi, fiókhoz kötött jelzője (saveCompletion a learn-*.html-ben)
    const BEFEJEZES_KULCS = { lhtml: 'tananyag_html', lcss: 'tananyag_css', lbs: 'tananyag_bootstrap',
                              lemmet: 'tananyag_emmet', ljs: 'tananyag_javascript' };

    function tanulo() {
        try {
            const u = JSON.parse(sessionStorage.getItem('kandoUser') || '{}');
            return (u.token && u.email && !u._tesztMod) ? u : null;
        } catch { return null; }
    }
    const alap = skey => skey.replace(/_v\d+$/, '');          // lhtml_v7 -> lhtml
    const serverKey = skey => 'haladas_' + alap(skey);        // verzióváltáskor is megmarad

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
    function lsKeys() { try { return Object.keys(localStorage); } catch { return []; } }

    async function getState(u, key) {
        const res = await fetch(`${API}/api/user-state/${encodeURIComponent(u.email)}/${key}`,
            { headers: { 'Authorization': 'Bearer ' + u.token } });
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return (await res.json()).value;
    }
    // A szerveren tárolt haladás (null, ha nincs); befejezett tananyagnál csupa true
    async function szerverHaladas(u, skey, n) {
        const v = parse(await getState(u, serverKey(skey)));
        if (v) return v;
        const bk = BEFEJEZES_KULCS[alap(skey)];
        if (bk && await getState(u, bk)) return Array(n).fill(true);
        return null;
    }
    async function put(u, skey, done, probalkozas = 0) {
        try {
            const res = await fetch(`${API}/api/user-state/${encodeURIComponent(u.email)}/${serverKey(skey)}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + u.token },
                body: JSON.stringify({ value: JSON.stringify(done.map(Boolean)) })
            });
            if (!res.ok) throw new Error();
        } catch {
            if (probalkozas < 2) setTimeout(() => put(u, skey, done, probalkozas + 1), 3000);
        }
    }

    // Amíg a szerverről nem töltöttük be a haladást, nem írunk rá (különben felülírnánk a régit)
    const betoltve = {};

    window.LearnSync = {
        // Indulási állapot (szinkron): tanulónál üres – a szerverről jön (sync); vendégnél a böngészőből
        load(skey, n) {
            if (tanulo()) {
                // Régi böngészős haladás (közös és tanulónkénti kulcs) törlése – nem vesszük át
                lsDel(skey + '_done');
                lsKeys().filter(k => k.startsWith(skey + '_done_')).forEach(lsDel);
                return Array(n).fill(false);
            }
            return fit(parse(lsGet(skey + '_done')), n);
        },

        // Mentés: tanulónál csak a szerverre, vendégnél a böngészőbe
        save(skey, done) {
            const u = tanulo();
            if (!u) { lsSet(skey + '_done', JSON.stringify(done)); return; }
            if (betoltve[skey]) put(u, skey, done);
            else this.sync(skey, done);   // még nincs betöltve: előbb összefésül, utána ment
        },

        // Szerverről betöltés + összefésülés; ha bővült a tömb (a szerveren több kész), onChange fut
        async sync(skey, done, onChange) {
            const u = tanulo();
            if (!u) return;
            let server;
            try { server = await szerverHaladas(u, skey, done.length); } catch { return; }
            betoltve[skey] = true;
            const srv = fit(server, done.length);
            let bovult = false, szerverreKell = false;
            done.forEach((d, i) => {
                if (srv[i] && !d) { done[i] = true; bovult = true; }
                if (d && !srv[i]) szerverreKell = true;
            });
            if (szerverreKell) put(u, skey, done);
            if (bovult && onChange) onChange();
        },

        // Kész-e az egész tananyag (a tananyag-kvíz előfeltétele)
        async allDone(skey) {
            const kesz = a => !!a && a.length > 0 && a.every(Boolean);
            const u = tanulo();
            if (!u) return kesz(parse(lsGet(skey + '_done')));
            try { return kesz(await szerverHaladas(u, skey, 1)); } catch { return false; }
        }
    };
})();
