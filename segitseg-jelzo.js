// Tanári segítség jelző: az oktatói oldalak jobb alsó sarkában piros jelvény, ha egy tanuló
// (a tanár órarendjében szereplő csoportból) ma segítséget kért, és még nem kapott választ.
// Rákattintva az Óra képernyő nyílik a kérő csoportjával. Új kérésnél rövid, halk hangjelzés.
(function () {
  'use strict';
  var API = 'https://agazati.up.railway.app';
  // Az Óra képernyő címe a szkript helyéhez képest (almappás oldalakon is jó legyen)
  var ORA = new URL('ora.html', (document.currentScript && document.currentScript.src) || location.href).href;
  var U = {};
  try { U = JSON.parse(sessionStorage.getItem('kandoUser') || localStorage.getItem('kandoUser') || '{}'); } catch (e) {}
  if (U.szerep !== 'oktato' || !U.token) return;   // csak oktatónak (Teszt Elek módban nem)

  var elozo = -1, idozito = null, hangEngedve = false;
  document.addEventListener('pointerdown', function () { hangEngedve = true; }, { once: true });

  var css = document.createElement('style');
  css.textContent = '#seg-jelzo{position:fixed;right:18px;bottom:18px;z-index:9999;display:none;align-items:center;gap:10px;' +
    'padding:12px 18px;border-radius:14px;background:#b62324;color:#fff;font:700 1rem "Segoe UI",system-ui,sans-serif;' +
    'text-decoration:none;box-shadow:0 6px 24px rgba(0,0,0,.45);border:2px solid #ff7b72}' +
    '#seg-jelzo:hover{filter:brightness(1.12)}#seg-jelzo small{display:block;font-weight:400;font-size:.8rem;opacity:.9}' +
    '#seg-jelzo.uj{animation:segjelzo 1s ease 3}@keyframes segjelzo{50%{transform:scale(1.08)}}';
  document.head.appendChild(css);
  var a = document.createElement('a');
  a.id = 'seg-jelzo';
  document.body.appendChild(a);

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }

  function csipog() {
    if (!hangEngedve) return;
    try {
      var ac = new (window.AudioContext || window.webkitAudioContext)(), o = ac.createOscillator(), g = ac.createGain();
      o.frequency.value = 880; g.gain.setValueAtTime(0.08, ac.currentTime); g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.4);
      o.connect(g); g.connect(ac.destination); o.start(); o.stop(ac.currentTime + 0.4);
    } catch (e) {}
  }

  function rajzol(lista) {
    var db = lista.length;
    if (!db) { a.style.display = 'none'; elozo = 0; return; }
    var elso = lista[0];
    a.href = ORA + '?csoport=' + encodeURIComponent(elso.csoport);
    a.innerHTML = '<i class="fas fa-hand"></i><span>' + db + ' segítséget kér' +
      '<small>' + esc(elso.nev || elso.email) + (db > 1 ? ' és még ' + (db - 1) : '') + ' · megnézem</small></span>';
    a.style.display = 'flex';
    if (elozo >= 0 && db > elozo) { a.classList.remove('uj'); void a.offsetWidth; a.classList.add('uj'); csipog(); }
    elozo = db;
  }

  function lekerdez() {
    if (document.hidden) return;
    fetch(API + '/api/oktato/segitseg/nyitott', { headers: { Authorization: 'Bearer ' + U.token } })
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(rajzol)
      .catch(function () { /* csendben: a jelző nem fontosabb az oldalnál */ });
  }

  lekerdez();
  idozito = setInterval(lekerdez, 30000);
  document.addEventListener('visibilitychange', function () { if (!document.hidden) lekerdez(); });
})();
