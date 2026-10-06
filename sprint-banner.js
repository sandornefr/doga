// Diákoknak: a portálon sáv jelzi, ha a tanár sprintet írt ki (ide kattintva csatlakoznak).
(function () {
  let u = null;
  try { u = JSON.parse(sessionStorage.getItem('kandoUser') || 'null'); } catch (e) {}
  if (!u || !u.token || u.szerep === 'oktato' || u.szerep === 'vendeg' || u._tesztMod) return;
  const API = 'https://agazati.up.railway.app';
  let bar = null;

  function mutat(s) {
    if (!bar) {
      bar = document.createElement('a');
      bar.href = 'sprint.html';
      bar.style.cssText = 'position:fixed;left:50%;bottom:18px;transform:translateX(-50%);z-index:9000;display:flex;align-items:center;gap:10px;' +
        'background:linear-gradient(135deg,#b45309,#ea580c);color:#fff;text-decoration:none;font-weight:700;font-size:.95rem;' +
        'padding:12px 22px;border-radius:30px;box-shadow:0 6px 24px rgba(0,0,0,.5);font-family:inherit;';
      document.body.appendChild(bar);
    }
    const futo = s.status === 'fut';
    bar.innerHTML = '<i class="fas fa-bolt"></i><span>' + (futo ? 'Fut a sprint!' : 'Sprint indul!') + ' ' +
      String(s.cim).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])) +
      (s.otos ? ' – 5-ösért megy' : '') + '</span><span style="background:#fff;color:#b45309;border-radius:14px;padding:3px 12px;font-size:.82rem;">Csatlakozom</span>';
  }

  async function poll() {
    try {
      const r = await fetch(API + '/api/sprint/aktiv', { headers: { Authorization: 'Bearer ' + u.token } });
      if (!r.ok) return;
      const d = await r.json();
      const s = d.sprint;
      if (s && s.status !== 'vege') mutat(s);
      else if (bar) { bar.remove(); bar = null; }
    } catch (e) { /* hálózati hiba: következő kör */ }
  }
  document.addEventListener('DOMContentLoaded', function () { poll(); setInterval(poll, 10000); });
})();
