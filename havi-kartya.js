// Havi állás kártya az új tanévi (2026/27) rendszerhez – a profil és a portál is ezt használja.
// A /api/havijegy/aktualis válasz egy eleme: r.alap = a havi jegy sora (ujRendszer = true).
(function () {
  const HONAP = ['', 'január', 'február', 'március', 'április', 'május', 'június', 'július', 'augusztus', 'szeptember', 'október', 'november', 'december'];
  const JEGY_CL = { 1: '#fca5a5', 2: '#fca5a5', 3: '#fcd34d', 4: '#86efac', 5: '#93c5fd' };
  const JEGY_BG = { 1: '#7f1d1d', 2: '#7f1d1d', 3: '#78350f', 4: '#1a3a1a', 5: '#1e3a5f' };
  const JEGY_NEV = ['', 'Elégtelen', 'Elégséges', 'Közepes', 'Jó', 'Jeles'];

  function esc(s) { return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }

  function bar(kesz, kell) {
    const pct = kell > 0 ? Math.min(100, Math.round(kesz / kell * 100)) : 100;
    const c = pct >= 100 ? '#22c55e' : pct >= 50 ? '#f59e0b' : '#ef4444';
    return '<div style="flex:1;height:6px;background:#1f2937;border-radius:3px;overflow:hidden;"><div style="width:' + pct + '%;height:100%;background:' + c + ';"></div></div>';
  }

  function sor(ikon, cimke, kesz, kell, megj) {
    const kesz100 = kell > 0 && kesz >= kell;
    return '<div style="margin-top:9px;">' +
      '<div style="display:flex;align-items:center;gap:8px;">' +
        '<i class="' + ikon + '" style="width:14px;color:#94a3b8;"></i>' +
        '<span style="font-size:.78rem;color:#cbd5e1;flex:0 0 auto;">' + cimke + '</span>' +
        bar(kesz, kell) +
        '<span style="font-size:.78rem;font-weight:700;color:' + (kesz100 ? '#22c55e' : '#94a3b8') + ';">' + kesz + '/' + kell + '</span>' +
      '</div>' + (megj ? '<div style="font-size:.7rem;color:#64748b;margin:2px 0 0 22px;">' + megj + '</div>' : '') + '</div>';
  }

  function szintNev(sz) { return sz === 0 ? 'bármilyen feladat' : sz + ' pontos feladat'; }

  function html(a) {
    if (!a) return '';
    const ev = a.ev, h = a.honap;
    const cim = ev + '. ' + (HONAP[h] || h);
    if (a.kiadva === false) {
      return '<div style="background:#111827;border:1px solid #1f2937;border-radius:10px;padding:14px 16px;flex:1;min-width:220px;">' +
        '<div style="font-size:.74rem;color:#6b7280;">' + cim + '</div>' +
        '<div style="margin-top:8px;font-size:.82rem;color:#94a3b8;">Ennek a hónapnak a követelménye még nincs kiadva.</div></div>';
    }
    const jegy = a.jegy || 1, cl = JEGY_CL[jegy], bg = JEGY_BG[jegy];
    let h2 = '';
    h2 += sor('fab fa-python', 'Python', a.pythonKesz, a.pythonKell, esc(szintNev(a.pythonSzint)) + ' – bármelyik, amit valaha megoldottál');
    let webMegj = 'ágazati vagy gyakorló WEB feladat';
    if (a.bootstrapKell) webMegj = 'Bootstrap tananyag is számít egynek' + (a.bootstrapKesz ? ' (kész)' : ' (még nincs kész)');
    h2 += sor('fas fa-globe', 'WEB', a.webKesz, a.webKell, webMegj);

    // Mi hiányzik
    const hiany = [];
    if (a.pythonKesz < a.pythonKell) hiany.push('Python: még ' + (a.pythonKell - a.pythonKesz) + ' db ' + szintNev(a.pythonSzint));
    if (a.webKesz < a.webKell) hiany.push('WEB: még ' + (a.webKell - a.webKesz) + ' db feladat' + (a.bootstrapKell && !a.bootstrapKesz ? ' (vagy a Bootstrap tananyag)' : ''));
    const hint = hiany.length
      ? '<div style="margin-top:10px;padding:8px 10px;background:#0b1120;border:1px solid #374151;border-radius:7px;">' +
        '<div style="font-size:.7rem;color:#fbbf24;font-weight:700;margin-bottom:4px;"><i class="fas fa-lightbulb"></i> Az 5-öshöz még:</div>' +
        hiany.map(t => '<div style="font-size:.72rem;color:#94a3b8;margin-bottom:2px;">• ' + t + '</div>').join('') + '</div>'
      : '<div style="margin-top:10px;font-size:.74rem;color:#22c55e;text-align:center;"><i class="fas fa-circle-check"></i> A kötelező rész kész!</div>';

    // Szorgalmi
    let szorg = '<div style="margin-top:12px;border-top:1px solid #ffffff14;padding-top:9px;">' +
      '<div style="font-size:.7rem;font-weight:700;color:#fbbf24;text-transform:uppercase;letter-spacing:.05em;"><i class="fas fa-star"></i> Szorgalmi</div>';
    szorg += sor('fas fa-plus', 'Plusz pont', a.pluszPont, a.pluszKell, 'a kötelezőn felüli feladatokból (nehezebb = több pont)');
    szorg += '<div style="margin-top:6px;font-size:.74rem;color:' + (a.szorgalmiSzintKesz ? '#22c55e' : '#94a3b8') + ';">' +
      '<i class="fas ' + (a.szorgalmiSzintKesz ? 'fa-circle-check' : 'fa-circle') + '" style="width:14px;"></i> ' +
      'Szint: legalább egy ' + a.szorgalmiSzintPont + ' pontos Python feladat</div>';
    if (a.szorgalmiJelolt) szorg += '<div style="margin-top:6px;font-size:.74rem;color:#fbbf24;font-weight:700;"><i class="fas fa-star"></i> Szorgalmi ötösre jelölt vagy – az oktató hagyja jóvá.</div>';
    szorg += '</div>';

    return '<div style="background:' + bg + ';border:1px solid ' + cl + '44;border-radius:10px;padding:14px 16px;flex:1;min-width:240px;">' +
      '<div style="font-size:.74rem;color:#9ca3af;margin-bottom:5px;">' + cim + '</div>' +
      '<div style="display:flex;align-items:flex-end;gap:8px;">' +
        '<div style="font-size:2.4rem;font-weight:900;color:' + cl + ';line-height:1;">' + jegy + '</div>' +
        '<div style="font-size:.78rem;color:' + cl + ';opacity:.8;padding-bottom:4px;">' + (JEGY_NEV[jegy] || '') + ' · ' + Math.round(a.osszSzaz) + '%</div>' +
      '</div>' + h2 + hint + szorg + '</div>';
  }

  window.HaviKartya = { html: html, honapNev: function (ev, h) { return ev + '. ' + (HONAP[h] || h); } };
})();
