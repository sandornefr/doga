/**
 * oktato-jog.js – oktatói oldal jogosultság-őre (2026-11-14).
 * Használat: <script src="oktato-jog.js" data-jog="feladatkeszito"></script>
 * Az admin (Réka) mindent lát; más oktató csak a Réka által neki beállított jogokkal
 * (admin → Felhasználók → Oktatói jogosultságok). Jog nélkül takaró üzenet jelenik meg.
 * Ahol API van az oldal mögött, a szerver is ellenőriz – ez csak a felületet rejti.
 */
(function () {
    const script = document.currentScript;
    const kell = script && script.dataset.jog;
    if (!kell) return;
    // data-kiveve-param="beadas": ha az URL-ben ott ez a paraméter (pl. Korábbi óráim → egy beadás), nem kell a jog
    const kiveve = script.dataset.kiveveParam;
    if (kiveve && new URLSearchParams(location.search).has(kiveve)) return;
    let user = null;
    try { user = JSON.parse(sessionStorage.getItem('kandoUser') || 'null'); } catch (e) { user = null; }
    const portal = (script.getAttribute('src') || '').replace(/oktato-jog\.js.*$/, '') + 'portal.html#oktato';

    function takar() {
        const el = document.createElement('div');
        el.style.cssText = 'position:fixed;inset:0;z-index:99999;background:#0d1117;color:#c9d1d9;display:flex;' +
            'flex-direction:column;align-items:center;justify-content:center;gap:14px;font-family:system-ui,sans-serif;text-align:center;padding:16px';
        el.innerHTML = '<div style="font-size:1.2rem;font-weight:700">Ehhez az oldalhoz nincs jogosultságod.</div>' +
            '<div style="color:#8b949e;font-size:.9rem">Ha szükséged van rá, kérd az adminisztrátortól.</div>' +
            '<a href="' + portal + '" style="color:#a371f7">Vissza az oktatói felületre</a>';
        (document.body || document.documentElement).appendChild(el);
    }

    if (!user || user.szerep !== 'oktato') return; // nem oktatói belépés: az oldal saját ellenőrzése dönt
    fetch('https://agazati.up.railway.app/api/oktato/jogaim', { headers: { Authorization: 'Bearer ' + (user.token || '') } })
        .then(r => r.ok ? r.json() : null)
        .then(j => {
            const ok = j ? (j.admin || (j.jogok || []).includes(kell)) : user.email === 'sandornef@kkszki.hu';
            if (!ok) {
                if (document.body) takar(); else document.addEventListener('DOMContentLoaded', takar);
            }
        })
        .catch(() => { if (user.email !== 'sandornef@kkszki.hu') { if (document.body) takar(); else document.addEventListener('DOMContentLoaded', takar); } });
})();
