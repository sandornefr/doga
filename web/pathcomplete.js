// Útvonal-kiegészítés a Monaco szerkesztőben, mint a VS Code-ban:
// href="…", src="…" és url(…) után felkínálja a feladat mappájának fájljait és almappáit.
// A mappaszerkezet imitált: az HTML a gyökérben, a CSS a css/ mappában van, ezért a CSS-ben
// az útvonalak a css/ mappához képest értendők (pl. ../img/ikon.png).
(function () {
  let files = [];        // a feladat fájljai a gyökérhez képest, pl. "css/style.css", "img/fejlec.jpg"
  let cssDir = 'css/';   // a CSS fájl mappája
  let task = null;
  let manifest = null;
  let manifestPromise = null;

  function loadManifest() {
    if (!manifestPromise) {
      manifestPromise = fetch('forrasok/manifest.json')
        .then(r => r.ok ? r.json() : {})
        .catch(() => ({}))
        .then(m => { manifest = m; return m; });
    }
    return manifestPromise;
  }

  function taskDirName(t) { return t.basePath.replace(/\/$/, '').split('/').pop(); }

  function applyTask() {
    if (!task) { files = []; return; }
    const list = (manifest && manifest[taskDirName(task)]) || [];
    const set = new Set(list);
    set.add(task.htmlFile);
    set.add(task.cssFile);
    files = Array.from(set);
    cssDir = task.cssFile.replace(/[^\/]*$/, '');
  }

  // "css/" + "../img/" → "img/" ; a gyökér fölé nem lehet kilépni (null)
  function resolveDir(baseDir, rel) {
    const out = [];
    for (const seg of (baseDir + rel).split('/')) {
      if (seg === '' || seg === '.') continue;
      if (seg === '..') { if (!out.length) return null; out.pop(); continue; }
      out.push(seg);
    }
    return out.length ? out.join('/') + '/' : '';
  }

  function listDir(dir) {
    const entries = new Map();   // név -> mappa-e
    for (const f of files) {
      if (!f.startsWith(dir)) continue;
      const rest = f.slice(dir.length);
      const i = rest.indexOf('/');
      if (i < 0) entries.set(rest, false);
      else entries.set(rest.slice(0, i), true);
    }
    return entries;
  }

  const ATTR = /(?:href|src)\s*=\s*(["'])([^"']*)$/i;
  const URLFN = /url\(\s*(["']?)([^"')]*)$/i;

  function provide(monaco, model, position) {
    if (!task) return { suggestions: [] };
    const before = model.getValueInRange({
      startLineNumber: position.lineNumber, startColumn: 1,
      endLineNumber: position.lineNumber, endColumn: position.column,
    });
    const m = before.match(ATTR) || before.match(URLFN);
    if (!m) return { suggestions: [] };
    const prefix = m[2];
    if (/^([a-z][a-z0-9+.-]*:|\/\/|#)/i.test(prefix)) return { suggestions: [] };   // http:, data:, #kotva…

    const baseDir = model.getLanguageId() === 'css' ? cssDir : '';
    const dirPart = prefix.slice(0, prefix.lastIndexOf('/') + 1);
    const namePart = prefix.slice(dirPart.length);
    const target = resolveDir(baseDir, dirPart);
    if (target === null) return { suggestions: [] };

    const range = {
      startLineNumber: position.lineNumber, endLineNumber: position.lineNumber,
      startColumn: position.column - namePart.length, endColumn: position.column,
    };
    const K = monaco.languages.CompletionItemKind;
    const suggestions = [];
    if (target !== '') {
      suggestions.push({ label: '../', kind: K.Folder, insertText: '../', range, sortText: '0..',
        command: { id: 'editor.action.triggerSuggest', title: '' } });
    }
    for (const [name, isDir] of listDir(target)) {
      suggestions.push({
        label: isDir ? name + '/' : name,
        kind: isDir ? K.Folder : K.File,
        insertText: isDir ? name + '/' : name,
        range,
        sortText: (isDir ? '1' : '2') + name,
        detail: target + name + (isDir ? '/' : ''),
        command: isDir ? { id: 'editor.action.triggerSuggest', title: '' } : undefined,
      });
    }
    return { suggestions };
  }

  window.PathComplete = {
    register: function (monaco) {
      const prov = {
        triggerCharacters: ['"', "'", '/', '('],
        provideCompletionItems: (model, position) => provide(monaco, model, position),
      };
      monaco.languages.registerCompletionItemProvider('html', prov);
      monaco.languages.registerCompletionItemProvider('css', prov);
    },
    setTask: function (t) {
      task = t || null;
      if (!task) { files = []; return; }
      applyTask();
      loadManifest().then(function () { if (task === t) applyTask(); });
    },
  };
})();
