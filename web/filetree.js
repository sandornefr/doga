// VS Code-szerű fájlkezelő oldalsáv a WEB szerkesztő mellett (csak megjelenítés):
// a .html és a css/style.css a meglévő két szerkesztő-fület váltja, a képre kattintva előnézet nyílik.
(function () {
  const sidebar = document.getElementById('file-tree');
  const imgPane = document.getElementById('img-preview-wrapper');
  const tabHtml = document.getElementById('tab-html');
  const tabCss = document.getElementById('tab-css');
  if (!sidebar || !imgPane) return;

  const htmlWrap = document.getElementById('html-editor-wrapper');
  const cssWrap = document.getElementById('css-editor-wrapper');
  const imgEl = document.getElementById('img-preview-img');
  const imgPath = document.getElementById('img-preview-path');
  const imgInfo = document.getElementById('img-preview-info');
  const btnToggle = document.getElementById('btn-toggle-tree');

  let task = null;
  let manifest = null;
  let manifestPromise = null;
  let collapsed = false;
  try { collapsed = localStorage.getItem('webFileTreeCollapsed') === '1'; } catch (e) {}

  function loadManifest() {
    if (!manifestPromise) {
      manifestPromise = fetch('forrasok/manifest.json')
        .then(r => r.ok ? r.json() : {})
        .catch(() => ({}))
        .then(m => { manifest = m; return m; });
    }
    return manifestPromise;
  }

  function esc(s) {
    return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  function render() {
    if (!task) { sidebar.innerHTML = ''; return; }
    const dir = task.basePath.replace(/\/$/, '').split('/').pop();
    const imgs = (manifest && manifest[dir]) || [];
    const cssParts = task.cssFile.split('/');
    let h = '<div class="ft-row ft-root"><i class="fas fa-folder-open"></i><span>' + esc(dir) + '</span></div>';
    h += '<div class="ft-row ft-file" data-kind="html" style="padding-left:22px"><i class="fab fa-html5"></i><span>' + esc(task.htmlFile) + '</span></div>';
    if (cssParts.length > 1) {
      h += '<div class="ft-row ft-dir" data-dir="css" style="padding-left:22px"><i class="fas fa-chevron-down ft-chev"></i><i class="fas fa-folder"></i><span>' + esc(cssParts[0]) + '</span></div>';
      h += '<div class="ft-children" data-children="css"><div class="ft-row ft-file" data-kind="css" style="padding-left:50px"><i class="fab fa-css3-alt"></i><span>' + esc(cssParts[cssParts.length - 1]) + '</span></div></div>';
    } else {
      h += '<div class="ft-row ft-file" data-kind="css" style="padding-left:22px"><i class="fab fa-css3-alt"></i><span>' + esc(task.cssFile) + '</span></div>';
    }
    if (imgs.length) {
      h += '<div class="ft-row ft-dir" data-dir="img" style="padding-left:22px"><i class="fas fa-chevron-down ft-chev"></i><i class="fas fa-folder"></i><span>img</span></div>';
      h += '<div class="ft-children" data-children="img">' + imgs.map(f =>
        '<div class="ft-row ft-file" data-kind="img" data-file="' + esc(f) + '" style="padding-left:50px"><i class="far fa-image"></i><span>' + esc(f) + '</span></div>'
      ).join('') + '</div>';
    }
    sidebar.innerHTML = h;
    // fülek felirata = a fájl útvonala, ahogy a VS Code-ban
    if (tabHtml) tabHtml.textContent = task.htmlFile;
    if (tabCss) tabCss.textContent = task.cssFile;
    markActive();
  }

  function markActive() {
    const kind = imgPane.classList.contains('active') ? 'img'
      : (cssWrap && cssWrap.classList.contains('active') ? 'css' : 'html');
    sidebar.querySelectorAll('.ft-file').forEach(el => {
      let on = el.dataset.kind === kind;
      if (kind === 'img') on = el.dataset.kind === 'img' && el.dataset.file === imgPane.dataset.file;
      el.classList.toggle('active', on);
    });
  }

  function showImage(file) {
    if (!task) return;
    if (htmlWrap) htmlWrap.classList.remove('active');
    if (cssWrap) cssWrap.classList.remove('active');
    if (tabHtml) tabHtml.classList.remove('active');
    if (tabCss) tabCss.classList.remove('active');
    imgPane.classList.add('active');
    imgPane.dataset.file = file;
    imgPath.textContent = 'img/' + file;
    imgInfo.textContent = '';
    imgEl.onload = function () { imgInfo.textContent = imgEl.naturalWidth + ' × ' + imgEl.naturalHeight + ' px'; };
    imgEl.src = task.basePath + 'img/' + encodeURIComponent(file);
    markActive();
  }

  sidebar.addEventListener('click', function (e) {
    const row = e.target.closest('.ft-row');
    if (!row) return;
    if (row.classList.contains('ft-dir')) {
      const box = sidebar.querySelector('[data-children="' + row.dataset.dir + '"]');
      const open = box.style.display !== 'none';
      box.style.display = open ? 'none' : '';
      row.querySelector('.ft-chev').className = 'fas ' + (open ? 'fa-chevron-right' : 'fa-chevron-down') + ' ft-chev';
      return;
    }
    const kind = row.dataset.kind;
    if (kind === 'html' || kind === 'css') {
      if (typeof switchToTab === 'function') switchToTab(kind);
    } else if (kind === 'img') {
      showImage(row.dataset.file);
    }
  });

  // A meglévő fülváltás elrejti a képet és frissíti a kijelölést
  if (typeof window.switchToTab === 'function') {
    const orig = window.switchToTab;
    window.switchToTab = function (t) {
      imgPane.classList.remove('active');
      orig(t);
      markActive();
    };
  }

  function applyCollapsed() {
    document.body.classList.toggle('tree-collapsed', collapsed);
    if (btnToggle) btnToggle.setAttribute('aria-pressed', String(!collapsed));
  }
  if (btnToggle) btnToggle.addEventListener('click', function () {
    collapsed = !collapsed;
    try { localStorage.setItem('webFileTreeCollapsed', collapsed ? '1' : '0'); } catch (e) {}
    applyCollapsed();
  });
  applyCollapsed();

  window.FileTree = {
    setTask: function (t) {
      task = t || null;
      imgPane.classList.remove('active');
      if (!task) {
        render();
        if (tabHtml) tabHtml.textContent = 'HTML';
        if (tabCss) tabCss.textContent = 'CSS';
        return;
      }
      loadManifest().then(function () { if (task === t) render(); });
      render();
    }
  };
})();
