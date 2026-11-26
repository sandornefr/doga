// WEB számonkérés a WEB dolgozat szerkesztőjében: web/index.html?szk=<számonkérés id>
// A kiírás a python/szamonkeres.html-ben (WEB feladat). Mindenki ugyanazt az ágazati WEB feladatot kapja.
// Munka közben a mentés a számonkérés „munka” végpontjára megy (mint a Python számonkérésnél),
// a Beadás a számonkérés beadásai közé. Az időt a számonkérés indítása + időkerete adja.
// Az app.js horgai: SzkWeb.aktiv esetén a /api/config módválasztás és a /api/submit kimarad.
(function (root) {
'use strict';

const API = 'https://agazati.up.railway.app';
const param = new URLSearchParams(location.search).get('szk');
const ID = /^\d+$/.test(param || '') ? parseInt(param, 10) : null;
// Újratöltés után a korábban betöltött validálás képet nem tároljuk (nagy) – csak hogy megvolt.
const HELYKITOLTO = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="420" height="90"><rect width="100%" height="100%" fill="#1e293b"/>' +
  '<text x="50%" y="55%" fill="#94a3b8" font-family="sans-serif" font-size="16" text-anchor="middle">A kép korábban be lett töltve.</text></svg>');

const S = { aktiv: ID != null, id: ID, sz: null, taskId: '', feladatId: '', mentett: null,
  tanulo: false, beadva: false, bekuldes: false, mentoTimer: null, utolsoMentes: '', vege: 0 };

function user() { try { return JSON.parse(sessionStorage.getItem('kandoUser') || '{}'); } catch { return {}; } }
function af(url, opts = {}) {
  return fetch(url, { ...opts, headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + (user().token || ''), ...(opts.headers || {}) } });
}
function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
function vissza() { location.replace('../portal.html'); }   // nem a szamonkeres-diak.html-re: az ide irányítana vissza

// Teljes képernyős üzenet (az anti-cheat ablakát használjuk, mint a WEB dolgozat beadásánál)
function uzenet(cim, szoveg, gomb, fn, szin) {
  const o = document.getElementById('ac-overlay');
  if (!o) { alert(cim + '\n' + szoveg); if (fn) fn(); return; }
  const t = document.getElementById('ac-title');
  t.textContent = cim; t.style.color = szin || '#e94560';
  document.getElementById('ac-text').textContent = szoveg;
  document.getElementById('ac-count').textContent = '';
  const b = document.getElementById('ac-close-btn');
  b.textContent = gomb || 'Rendben';
  b.onclick = fn || (() => { o.style.display = 'none'; });
  o.style.display = 'flex';
}

function kodMost(kepekkel) {
  const vi = (typeof validationImages !== 'undefined') ? validationImages : {};
  const o = {
    html: htmlEditor ? htmlEditor.getValue() : '',
    css: cssEditor ? cssEditor.getValue() : '',
    vh: !!vi.html, vc: !!vi.css
  };
  if (kepekkel) o.kepek = { html: vi.html && vi.html !== HELYKITOLTO ? vi.html : null, css: vi.css && vi.css !== HELYKITOLTO ? vi.css : null };
  return JSON.stringify(o);
}

async function szamonkeresBetolt(u) {
  const p = new URLSearchParams({ email: u.email || '' });
  if (u.osztaly) p.append('osztaly', u.osztaly);
  if (u.csoport) p.append('csoport', u.csoport);
  const res = await af(`${API}/api/szamonkeres/aktiv?${p}`);
  const lista = res.ok ? await res.json() : [];
  let sz = lista.find(x => x.id === ID) || null;
  if (!sz && u.szerep === 'oktato') {       // oktatói előnézet: a saját számonkérése
    const r2 = await af(`${API}/api/szamonkeres/${ID}`);
    if (r2.ok) sz = (await r2.json()).szamonkeres || null;
  }
  return sz;
}

function feluletBeallit() {
  const rejt = id => { const e = document.getElementById(id); if (e) e.style.display = 'none'; };
  ['btn-timer-toggle', 'btn-timer-reset', 'btn-load-file', 'btn-save-file', 'btn-kesz-web', 'btn-switch-python'].forEach(rejt);
  const be = document.getElementById('btn-submit-exam');
  if (be) be.style.display = S.tanulo ? 'inline-block' : 'none';
  const mb = document.getElementById('mode-badge');
  if (mb) {
    mb.innerHTML = '<i class="fas fa-circle-dot" style="color:#e94560;"></i> SZÁMONKÉRÉS' + (S.tanulo ? '' : ' – előnézet');
    mb.style.cssText += ';display:inline-block;background:#3d0a12;border:1.5px solid #e94560;color:#ff6b81;';
  }
  const ts = document.getElementById('task-selector');
  if (ts) { ts.value = S.taskId; ts.disabled = true; }
}

function idoFrissit() {
  if (!S.vege || S.beadva) return;
  const mp = Math.max(0, Math.round((S.vege - Date.now()) / 1000));
  timerSeconds = mp;
  updateTimerDisplay();
  if (mp <= 0) { stopTimer(); beadas(true); }
}

// app.js updateStudentDisplay hívja (a szerkesztők ekkor már készen vannak)
async function indit() {
  const u = user();
  S.tanulo = u.szerep === 'tanulo' && !u._tesztMod && !!u.token;
  liveModeDetected = true;                  // ne a gyakorló vázlatát töltse / mentse
  statusEl.textContent = 'Számonkérés betöltése…';
  let sz = null;
  try { sz = await szamonkeresBetolt(u); } catch {}
  if (!sz) { uzenet('Nem található a számonkérés', 'Ez a számonkérés most nem fut, vagy nem neked szól.', 'Vissza', vissza); return; }
  let f = null;
  try { f = JSON.parse(sz.feladatok || '[]')[0] || null; } catch {}
  if (!f || f.tipus !== 'web' || !availableTasks[f.feladat_id]) { uzenet('Hibás számonkérés', 'Ehhez a számonkéréshez nincs WEB feladat.', 'Vissza', vissza); return; }
  S.sz = sz; S.taskId = f.feladat_id; S.feladatId = 'w_' + f.feladat_id;

  if (S.tanulo) {
    if ((sz.statusz || sz.Statusz) !== 'aktiv') { uzenet('Még nem indult el', 'A tanár még nem indította el a számonkérést.', 'Vissza', vissza); return; }
    try {
      const r = await af(`${API}/api/szamonkeres/${ID}/sajat?email=${encodeURIComponent(u.email)}`);
      const sajat = r.ok ? await r.json() : [];
      if (sajat.some(b => b.feladatId === S.feladatId)) {
        S.beadva = true;
        uzenet('Már beadtad', 'Ezt a feladatot már beadtad. Az eredményt a tanár adja ki.', 'Vissza a főmenübe', () => location.replace('../portal.html'), '#4ade80');
        return;
      }
    } catch {}
    try {
      const r = await af(`${API}/api/szamonkeres/${ID}/munka`);
      if (r.ok) {
        const d = await r.json();
        const p = JSON.parse(d.piszkozat || '{}');
        if (typeof p[S.feladatId] === 'string') {
          const m = JSON.parse(p[S.feladatId]);
          S.mentett = { html: m.html || '', css: m.css || '', vh: !!m.vh, vc: !!m.vc, lastSaved: d.mentveAt || '' };
          S.utolsoMentes = p[S.feladatId];
        }
      }
    } catch {}
  }

  feluletBeallit();
  await selectTask(S.taskId);
  if (S.mentett) {
    if (S.mentett.vh) { validationImages.html = HELYKITOLTO; validationImages.htmlFileName = 'korábban betöltve'; }
    if (S.mentett.vc) { validationImages.css = HELYKITOLTO; validationImages.cssFileName = 'korábban betöltve'; }
    updatePreview();
  }
  const ts = document.getElementById('task-selector');
  if (ts) ts.disabled = true;

  const start = sz.startedAt || sz.StartedAt || sz.started_at;
  const perc = sz.percLimit || sz.PercLimit || sz.perc_limit || 60;
  stopTimer();
  if (start) {
    S.vege = new Date(start).getTime() + perc * 60000;
    idoFrissit();
    setInterval(idoFrissit, 1000);
  } else { timerSeconds = perc * 60; updateTimerDisplay(); }

  if (S.tanulo) {
    initAntiCheat(true);
    window.addEventListener('pagehide', () => mentes(true));
    statusEl.textContent = S.mentett ? 'A mentett munkád betöltve. Gépelés közben automatikusan mentődik.' : 'Kezdheted! A munkád gépelés közben automatikusan mentődik.';
  } else {
    initAntiCheat(false);
    statusEl.textContent = 'Előnézet: így látja a tanuló. Itt semmi nem mentődik és nem adható be.';
  }
}

// Automatikus mentés (app.js saveToLocalStorage hívja minden módosítás után)
function mentes(azonnal) {
  if (!S.tanulo || S.beadva || !S.feladatId) return;
  clearTimeout(S.mentoTimer);
  const kuld = () => {
    const kod = kodMost(false);
    if (kod === S.utolsoMentes) return;
    const body = JSON.stringify({ piszkozat: JSON.stringify({ [S.feladatId]: kod }) });
    af(`${API}/api/szamonkeres/${ID}/munka`, { method: 'PUT', body, keepalive: !!azonnal })
      .then(r => { if (r.ok) { S.utolsoMentes = kod; statusEl.textContent = '✓ Mentve ' + new Date().toLocaleTimeString('hu-HU'); }
                   else statusEl.textContent = 'A mentés nem sikerült – a következő módosításnál újrapróbálom.'; })
      .catch(() => { statusEl.textContent = 'Nincs kapcsolat a szerverrel – a következő módosításnál újrapróbálom.'; });
  };
  if (azonnal) kuld(); else S.mentoTimer = setTimeout(kuld, 1500);
}

// Beadás (Beadás gomb; idő lejártakor és a 3. szabályszegésnél magától)
async function beadas(magatol) {
  if (S.beadva || S.bekuldes) return;
  if (!S.tanulo) { uzenet('Előnézet', 'Előnézetben nem lehet beadni.', 'Rendben'); return; }
  if (!magatol && !confirm('Biztosan beadod? Beadás után már nem módosíthatod.')) return;
  S.bekuldes = true;
  clearTimeout(S.mentoTimer);
  const u = user();
  const body = JSON.stringify({
    tanuloEmail: u.email, tanuloNev: u.nev || '', osztaly: u.osztaly || null, csoport: u.csoport || null,
    feladatId: S.feladatId, kod: kodMost(true), autoPont: 0, maxPont: 40
  });
  let ok = false, uz = '';
  for (let p = 0; p < 3 && !ok; p++) {
    try {
      const r = await af(`${API}/api/szamonkeres/${ID}/beadas`, { method: 'POST', body });
      if (r.ok || r.status === 409) ok = true;
      else { uz = (await r.json().catch(() => ({}))).error || ('HTTP ' + r.status); if (r.status < 500) break; }
    } catch (e) { uz = 'Nincs kapcsolat a szerverrel.'; }
    if (!ok && p < 2) await new Promise(r => setTimeout(r, 1500));
  }
  S.bekuldes = false;
  if (!ok) {
    mentes(true);
    uzenet('A beadás nem sikerült', uz + ' A munkád mentve van, próbáld újra a Beadás gombbal, vagy szólj a tanárnak!', 'Rendben');
    return;
  }
  S.beadva = true;
  acLive = false;
  stopTimer();
  if (htmlEditor) htmlEditor.updateOptions({ readOnly: true });
  if (cssEditor) cssEditor.updateOptions({ readOnly: true });
  uzenet(magatol ? 'Beadtuk a munkádat' : 'Beadva!',
    (magatol ? 'A munkádat a rendszer beadta. ' : 'A munkádat elküldtük. ') + 'A szerkesztő zárolva. Az eredményt a tanár adja ki.',
    'Vissza a főmenübe', () => location.replace('../portal.html'), '#4ade80');
}

root.SzkWeb = { aktiv: S.aktiv, indit, mentes, beadas, mentett: () => S.mentett, get beadva() { return S.beadva; } };
})(window);
