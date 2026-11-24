/*
 * python-kiegeszites.js – közös Python kódkiegészítés (VS Code-szerű javaslatok)
 *
 * Használat:
 *   <script src="/python/python-kiegeszites.js"></script>
 *   Monaco:   PyKieg.monaco(monaco);   // a require(['vs/editor/editor.main']) visszahívásában
 *   Textarea: PyKieg.textarea(elem);   // minden kódíró textarea-ra
 *
 * Textarea: legalább 2 betű után jön a lista. Tab = elfogad. Enter csak akkor
 * fogad el, ha nyíllal választottál; különben új sort kezd (nem írja át a kódot).
 * Esc = bezár. Ha nincs lista, a Tab és az Enter az oldal saját működése marad.
 *
 * VS Code-mód (dolgozat, ágazati gyakorló):  <html data-pykieg="vscode">
 *   csak valódi Python-nevek, csak a név kerül be – mint a vizsgán a VS Code-ban.
 *
 * Párzárás (textarea): ( [ { " ' beírásakor a pár is bekerül, a kurzor középre.
 * Záró jelnél átlép, Backspace az üres párt törli, kijelölést körbezár.
 * (A Monaco szerkesztő ezt magától tudja.)
 *
 * Kikapcsolás egy oldalon:  <html data-pykieg="ki">
 *   vagy futás közben: PyKieg.ki = true;
 *
 * Ötletgazda, tervező, fejlesztő: Sándorné Feke Réka
 * Fejlesztő asszisztens: Claude
 */
(function () {
  'use strict';
  if (window.PyKieg) return;

  // ── Szótár ────────────────────────────────────────────────────────
  // t: típus (kulcsszo | fuggveny | metodus | minta), s: beszúrt szöveg
  // A mintában ${1:x} jelöli, hová kerül a kurzor (Monaco-formátum).
  var SZOTAR = [
    // Minták (a leggyakoribb szerkezetek)
    { c: 'print', t: 'minta', s: 'print(${1})', d: 'Kiírás a képernyőre' },
    { c: 'printf', t: 'minta', s: 'print(f"${1}")', d: 'Kiírás f-stringgel: print(f"{nev}")' },
    { c: 'input', t: 'minta', s: 'input("${1}")', d: 'Szöveg bekérése: input("")' },
    { c: 'inputint', t: 'minta', s: 'int(input("${1}"))', d: 'Egész szám bekérése' },
    { c: 'inputfloat', t: 'minta', s: 'float(input("${1}"))', d: 'Tört szám bekérése' },
    { c: 'for', t: 'minta', s: 'for ${1} in range(${2}):\n\t${3}', d: 'Számlálós ciklus: for i in range(10)' },
    { c: 'forin', t: 'minta', s: 'for ${1} in ${2}:\n\t${3}', d: 'Bejárás: lista minden eleme' },
    { c: 'while', t: 'minta', s: 'while ${1}:\n\t${2}', d: 'Feltételes ciklus' },
    { c: 'if', t: 'minta', s: 'if ${1}:\n\t${2}', d: 'Elágazás' },
    { c: 'ifelse', t: 'minta', s: 'if ${1}:\n\t${2}\nelse:\n\t${3}', d: 'Elágazás különben ággal' },
    { c: 'elif', t: 'minta', s: 'elif ${1}:\n\t${2}', d: 'Különben ha' },
    { c: 'else', t: 'minta', s: 'else:\n\t${1}', d: 'Különben' },
    { c: 'def', t: 'minta', s: 'def ${1}(${2}):\n\t${3}', d: 'Saját függvény' },
    { c: 'withopen', t: 'minta', s: 'with open("${1}", encoding="utf-8") as ${2}:\n\t${3}', d: 'Fájl olvasása' },
    { c: 'try', t: 'minta', s: 'try:\n\t${1}\nexcept ${2}:\n\t${3}', d: 'Hibakezelés' },

    // Beépített függvények
    { c: 'int', t: 'fuggveny', s: 'int(${1})', d: 'Egész számmá alakít' },
    { c: 'float', t: 'fuggveny', s: 'float(${1})', d: 'Tört számmá alakít' },
    { c: 'str', t: 'fuggveny', s: 'str(${1})', d: 'Szöveggé alakít' },
    { c: 'bool', t: 'fuggveny', s: 'bool(${1})', d: 'Logikai értékké alakít' },
    { c: 'len', t: 'fuggveny', s: 'len(${1})', d: 'Hossz (elemek száma)' },
    { c: 'range', t: 'fuggveny', s: 'range(${1})', d: 'Számsor: range(start, stop, lépés)' },
    { c: 'round', t: 'fuggveny', s: 'round(${1})', d: 'Kerekítés: round(x, 2)' },
    { c: 'abs', t: 'fuggveny', s: 'abs(${1})', d: 'Abszolút érték' },
    { c: 'min', t: 'fuggveny', s: 'min(${1})', d: 'Legkisebb' },
    { c: 'max', t: 'fuggveny', s: 'max(${1})', d: 'Legnagyobb' },
    { c: 'sum', t: 'fuggveny', s: 'sum(${1})', d: 'Összeg' },
    { c: 'sorted', t: 'fuggveny', s: 'sorted(${1})', d: 'Rendezett másolat' },
    { c: 'list', t: 'fuggveny', s: 'list(${1})', d: 'Listává alakít' },
    { c: 'type', t: 'fuggveny', s: 'type(${1})', d: 'Típus lekérdezése' },
    { c: 'enumerate', t: 'fuggveny', s: 'enumerate(${1})', d: 'Sorszám és elem együtt' },
    { c: 'open', t: 'fuggveny', s: 'open("${1}", encoding="utf-8")', d: 'Fájl megnyitása' },

    // Kulcsszavak
    { c: 'in', t: 'kulcsszo' }, { c: 'not', t: 'kulcsszo' }, { c: 'and', t: 'kulcsszo' },
    { c: 'or', t: 'kulcsszo' }, { c: 'True', t: 'kulcsszo' }, { c: 'False', t: 'kulcsszo' },
    { c: 'None', t: 'kulcsszo' }, { c: 'break', t: 'kulcsszo' }, { c: 'continue', t: 'kulcsszo' },
    { c: 'return', t: 'kulcsszo' }, { c: 'pass', t: 'kulcsszo' }, { c: 'import', t: 'kulcsszo' },
    { c: 'from', t: 'kulcsszo' }, { c: 'as', t: 'kulcsszo' }, { c: 'is', t: 'kulcsszo' },
    { c: 'end=""', t: 'kulcsszo', s: 'end="${1}"', d: 'print sorvége' },
    { c: 'sep=""', t: 'kulcsszo', s: 'sep="${1}"', d: 'print elválasztó' },
    { c: 'import random', t: 'kulcsszo', s: 'import random', d: 'Véletlen modul' },
    { c: 'import math', t: 'kulcsszo', s: 'import math', d: 'Matematika modul' }
  ];

  // Pont után ('.') felajánlott metódusok
  var METODUSOK = [
    { c: 'append', s: 'append(${1})', d: 'Lista: elem a végére' },
    { c: 'insert', s: 'insert(${1})', d: 'Lista: beszúrás' },
    { c: 'remove', s: 'remove(${1})', d: 'Lista: elem törlése' },
    { c: 'pop', s: 'pop(${1})', d: 'Lista: kivesz egy elemet' },
    { c: 'sort', s: 'sort()', d: 'Lista: rendezés helyben' },
    { c: 'reverse', s: 'reverse()', d: 'Lista: megfordítás' },
    { c: 'count', s: 'count(${1})', d: 'Hányszor fordul elő' },
    { c: 'index', s: 'index(${1})', d: 'Hányadik helyen van' },
    { c: 'upper', s: 'upper()', d: 'Szöveg: nagybetűs' },
    { c: 'lower', s: 'lower()', d: 'Szöveg: kisbetűs' },
    { c: 'strip', s: 'strip()', d: 'Szöveg: szóközök le a széléről' },
    { c: 'split', s: 'split(${1})', d: 'Szöveg: darabolás listává' },
    { c: 'join', s: 'join(${1})', d: 'Szöveg: lista összefűzése' },
    { c: 'replace', s: 'replace(${1})', d: 'Szöveg: csere' },
    { c: 'startswith', s: 'startswith(${1})', d: 'Szöveg: ezzel kezdődik?' },
    { c: 'endswith', s: 'endswith(${1})', d: 'Szöveg: ezzel végződik?' },
    { c: 'isdigit', s: 'isdigit()', d: 'Szöveg: csak számjegy?' },
    { c: 'readlines', s: 'readlines()', d: 'Fájl: sorok listája' },
    { c: 'randint', s: 'randint(${1})', d: 'random: egész szám a két határ között' },
    { c: 'choice', s: 'choice(${1})', d: 'random: véletlen elem' },
    { c: 'sqrt', s: 'sqrt(${1})', d: 'math: négyzetgyök' }
  ];

  function kikapcsolva() {
    return window.PyKieg.ki === true ||
      document.documentElement.getAttribute('data-pykieg') === 'ki';
  }

  // ── VS Code-mód (dolgozat, ágazati gyakorló): pontosan annyi segítség, amennyit a vizsgán a VS Code ad ──
  // Csak valódi Python-nevek (kulcsszó, beépített függvény, pont után metódus), csak a név kerül be
  // (zárójel és kitöltendő minta nélkül), magyar súgó nélkül; a printf/inputint-féle gyakorlós minták kimaradnak.
  // Bekapcsolás: <html data-pykieg="vscode">  vagy  PyKieg.mod = 'vscode';
  var PY_KULCSSZAVAK = ['False', 'None', 'True', 'and', 'as', 'assert', 'break', 'class', 'continue', 'def', 'del',
    'elif', 'else', 'except', 'finally', 'for', 'from', 'global', 'if', 'import', 'in', 'is', 'lambda',
    'nonlocal', 'not', 'or', 'pass', 'raise', 'return', 'try', 'while', 'with', 'yield'];
  var PY_BEEPITETT = ['abs', 'all', 'any', 'bool', 'chr', 'dict', 'divmod', 'enumerate', 'filter', 'float', 'format',
    'input', 'int', 'isinstance', 'len', 'list', 'map', 'max', 'min', 'open', 'ord', 'pow', 'print', 'range',
    'reversed', 'round', 'set', 'sorted', 'str', 'sum', 'tuple', 'type', 'zip'];
  function vscodeMod() {
    return window.PyKieg.mod === 'vscode' ||
      document.documentElement.getAttribute('data-pykieg') === 'vscode';
  }

  // ── Monaco ────────────────────────────────────────────────────────
  var monacoKesz = false;
  function monacoBekot(m) {
    m = m || window.monaco;
    if (!m || monacoKesz) return;
    monacoKesz = true;
    var K = m.languages.CompletionItemKind;
    var SNIP = m.languages.CompletionItemInsertTextRule.InsertAsSnippet;
    var tipus = { minta: K.Snippet, fuggveny: K.Function, kulcsszo: K.Keyword, metodus: K.Method };

    m.languages.registerCompletionItemProvider('python', {
      triggerCharacters: ['.'],
      provideCompletionItems: function (model, pos) {
        if (kikapcsolva()) return { suggestions: [] };
        var sor = model.getLineContent(pos.lineNumber).slice(0, pos.column - 1);
        // Megjegyzésben és szövegben ne javasoljon
        if (/#/.test(sor.replace(/(["'])(?:\\.|(?!\1).)*\1/g, ''))) return { suggestions: [] };
        var szo = model.getWordUntilPosition(pos);
        var range = { startLineNumber: pos.lineNumber, endLineNumber: pos.lineNumber,
                      startColumn: szo.startColumn, endColumn: szo.endColumn };
        var pontUtan = sor.slice(0, szo.startColumn - 1).slice(-1) === '.';
        if (vscodeMod()) {
          var nevek = pontUtan ? METODUSOK.map(function (x) { return [x.c, K.Method]; })
            : PY_KULCSSZAVAK.map(function (n) { return [n, K.Keyword]; })
                .concat(PY_BEEPITETT.map(function (n) { return [n, K.Function]; }));
          return { suggestions: nevek.map(function (x) {
            return { label: x[0], kind: x[1], insertText: x[0], range: range };
          }) };
        }
        var lista = pontUtan ? METODUSOK.map(function (x) { x.t = 'metodus'; return x; }) : SZOTAR;
        return {
          suggestions: lista.map(function (x, i) {
            return {
              // a minta nem Snippet fajtájú: a snippetSuggestions:'bottom' beállítás (ágazati gyakorló)
              // különben a lista aljára tenné, és pl.: „inp” + Tab az „import random”-ot hozná
              label: x.c, kind: x.t === 'minta'
                ? (PY_KULCSSZAVAK.indexOf(x.s.split(/[\s(:]/)[0]) >= 0 ? K.Keyword : K.Function)
                : (tipus[x.t] || K.Text),
              insertText: x.s || x.c, insertTextRules: x.s ? SNIP : undefined,
              detail: x.d || '', range: range,
              sortText: (x.t === 'minta' ? '0' : '1') + ('00' + i).slice(-3)
            };
          })
        };
      }
    });

    // A minta üres helyén (for | in range(): …) a beírt rövid (1–2 betűs) név után a Tab a
    // következő helyre ugorjon, ne a felugró javaslatot (pl.: i → if/input) fogadja el.
    function tabBekot(ed) {
      if (!ed || ed.__pykiegTab) return;
      ed.__pykiegTab = true;
      ed.onKeyDown(function (e) {
        if (e.keyCode !== m.KeyCode.Tab || e.shiftKey || e.ctrlKey || e.altKey || e.metaKey || kikapcsolva()) return;
        var kk = ed._contextKeyService, ertek = function (k) { try { return kk.getContextKeyValue(k); } catch (h) { return false; } };
        if (!kk || !ertek('suggestWidgetVisible') || !ertek('inSnippetMode') || !ertek('hasNextTabstop')) return;
        var model = ed.getModel(), pos = ed.getPosition();
        var szo = model.getWordUntilPosition(pos).word;
        if (szo.length >= 3 || model.getLineContent(pos.lineNumber).charAt(pos.column - 2 - szo.length) === '.') return;
        e.preventDefault(); e.stopPropagation();
        ed.trigger('pykieg', 'hideSuggestWidget', null);
        ed.trigger('pykieg', 'jumpToNextSnippetPlaceholder', null);
      });
    }
    m.editor.getEditors().forEach(tabBekot);
    m.editor.onDidCreateEditor(tabBekot);
  }

  // ── Textarea ──────────────────────────────────────────────────────
  var stilusKesz = false;
  function stilus() {
    if (stilusKesz) return; stilusKesz = true;
    var st = document.createElement('style');
    st.textContent =
      '.pykieg-lista{position:fixed;z-index:9999;margin:0;padding:4px;list-style:none;' +
      'background:#1e293b;border:1px solid #6366f1;border-radius:8px;min-width:220px;max-height:220px;' +
      'overflow:auto;font:14px/1.4 Consolas,monospace;color:#e2e8f0;box-shadow:0 6px 20px rgba(0,0,0,.35)}' +
      '.pykieg-lista li{padding:3px 8px;border-radius:5px;cursor:pointer;display:flex;gap:10px;justify-content:space-between}' +
      '.pykieg-lista li.akt{background:#4f46e5;color:#fff}' +
      '.pykieg-lista small{color:#94a3b8;font-family:system-ui,sans-serif}' +
      '.pykieg-lista li.akt small{color:#e0e7ff}';
    document.head.appendChild(st);
  }

  // A kurzor képernyő-pozíciója a textarea-ban (tükör-div módszer)
  function kurzorHely(ta) {
    var cs = getComputedStyle(ta), div = document.createElement('div');
    ['fontFamily', 'fontSize', 'fontWeight', 'lineHeight', 'letterSpacing', 'tabSize',
     'paddingTop', 'paddingLeft', 'paddingRight', 'borderTopWidth', 'borderLeftWidth',
     'boxSizing', 'whiteSpace', 'wordWrap'].forEach(function (p) { div.style[p] = cs[p]; });
    div.style.position = 'absolute'; div.style.visibility = 'hidden';
    div.style.whiteSpace = 'pre-wrap'; div.style.width = ta.clientWidth + 'px';
    div.textContent = ta.value.slice(0, ta.selectionStart);
    var span = document.createElement('span'); span.textContent = '​'; div.appendChild(span);
    document.body.appendChild(div);
    var r = ta.getBoundingClientRect();
    var x = r.left + span.offsetLeft - ta.scrollLeft;
    var y = r.top + span.offsetTop - ta.scrollTop + span.offsetHeight;
    document.body.removeChild(div);
    return { x: x, y: y };
  }

  // ${1:alap} → alap; visszaadja a szöveget és a helyőrzők helyét sorszám szerint
  function mintaKibont(s, behuzas, tab) {
    var csere = function (t) { return t.replace(/\t/g, tab).replace(/\n/g, '\n' + behuzas); };
    var ki = '', i = 0, helyek = [], re = /\$\{(\d+)(?::([^}]*))?\}/g, m;
    while ((m = re.exec(s))) {
      ki += csere(s.slice(i, m.index));
      var alap = m[2] || '';
      helyek.push({ n: +m[1], kezd: ki.length, hossz: alap.length });
      ki += alap; i = re.lastIndex;
    }
    ki += csere(s.slice(i));
    helyek.sort(function (a, b) { return a.n - b.n; });
    if (!helyek.length) helyek.push({ n: 0, kezd: ki.length, hossz: 0 });
    return { szoveg: ki, helyek: helyek };
  }

  function textareaBekot(ta, opciok) {
    if (!ta || ta.__pykieg) return;
    ta.__pykieg = true;
    stilus();
    var tab = (opciok && opciok.tab) || '    ';
    var ul = null, talalat = [], akt = 0, szoKezd = 0, valasztott = false, szuneteltet = false;
    // a minta további helyei (Tab-bal ugrik rájuk); a szöveg végétől mért távolsággal,
    // így az előttük való gépelés nem rontja el a helyüket
    var ugrasok = [];

    function bezar() { if (ul) { ul.remove(); ul = null; } talalat = []; }

    function rajzol() {
      if (!ul) { ul = document.createElement('ul'); ul.className = 'pykieg-lista'; document.body.appendChild(ul); }
      ul.innerHTML = '';
      talalat.forEach(function (x, i) {
        var li = document.createElement('li');
        if (i === akt) li.className = 'akt';
        var b = document.createElement('span'); b.textContent = x.c;
        var k = document.createElement('small'); k.textContent = x.d || '';
        li.appendChild(b); li.appendChild(k);
        li.addEventListener('mousedown', function (e) { e.preventDefault(); akt = i; elfogad(); });
        ul.appendChild(li);
      });
      var h = kurzorHely(ta);
      ul.style.left = Math.min(h.x, window.innerWidth - 240) + 'px';
      ul.style.top = h.y + 'px';
      var aktLi = ul.children[akt]; if (aktLi) aktLi.scrollIntoView({ block: 'nearest' });
    }

    function frissit() {
      if (kikapcsolva()) return bezar();
      var poz = ta.selectionStart, elotte = ta.value.slice(0, poz);
      var sor = elotte.slice(elotte.lastIndexOf('\n') + 1);
      if (/#/.test(sor.replace(/(["'])(?:\\.|(?!\1).)*\1/g, '')) || /(["'])(?:(?!\1).)*$/.test(sor.replace(/(["'])(?:\\.|(?!\1).)*\1/g, ''))) return bezar();
      var m = /[A-Za-z_áéíóöőúüűÁÉÍÓÖŐÚÜŰ][\wáéíóöőúüűÁÉÍÓÖŐÚÜŰ]*$/.exec(sor);
      var pont = sor.slice(0, m ? sor.length - m[0].length : sor.length).slice(-1) === '.';
      var szo = m ? m[0] : '';
      if (!pont && szo.length < 2) return bezar();
      szoKezd = poz - szo.length;
      var forras = pont ? METODUSOK : SZOTAR, kis = szo.toLowerCase();
      // a pontosan beírt szó csak akkor jön, ha mintát ad (pl.: for → for ciklus)
      talalat = forras.filter(function (x) {
        return x.c.toLowerCase().indexOf(kis) === 0 && (x.c !== szo || (x.s && x.s !== x.c));
      }).slice(0, 8);
      // A szövegben már szereplő saját nevek (változók) is jöjjenek
      if (!pont && szo.length >= 2) {
        var lattam = {};
        (ta.value.replace(/#.*$/gm, '').replace(/(["'])(?:\\.|(?!\1)[^\n])*\1/g, '').match(/[A-Za-z_áéíóöőúüűÁÉÍÓÖŐÚÜŰ][\wáéíóöőúüűÁÉÍÓÖŐÚÜŰ]{2,}/g) || []).forEach(function (w) {
          if (w !== szo && w.toLowerCase().indexOf(kis) === 0 && !lattam[w] &&
              !SZOTAR.some(function (x) { return x.c === w; })) { lattam[w] = 1; talalat.push({ c: w, d: 'saját név' }); }
        });
        talalat = talalat.slice(0, 8);
      }
      if (!talalat.length) return bezar();
      akt = 0; valasztott = false; rajzol();
    }

    function elfogad() {
      var x = talalat[akt]; if (!x) return bezar();
      var poz = ta.selectionStart, ertek = ta.value, kezd = szoKezd;
      bezar();
      szuneteltet = true;   // a beszúrás saját input eseménye ne nyisson új listát
      var sorKezd = ertek.lastIndexOf('\n', kezd - 1) + 1;
      var behuzas = /^[ \t]*/.exec(ertek.slice(sorKezd))[0];
      var b = mintaKibont(x.s || x.c, behuzas, tab);
      ta.focus();
      ta.setSelectionRange(kezd, poz);
      // execCommand: a Ctrl+Z (visszavonás) is működik utána
      if (!document.execCommand('insertText', false, b.szoveg)) {
        ta.value = ertek.slice(0, kezd) + b.szoveg + ertek.slice(poz);
        ta.dispatchEvent(new Event('input', { bubbles: true }));
      }
      szuneteltet = false;
      var h0 = b.helyek[0], hossz = ta.value.length;
      ta.setSelectionRange(kezd + h0.kezd, kezd + h0.kezd + h0.hossz);
      ugrasok = b.helyek.slice(1).map(function (h) { return { vegtol: hossz - (kezd + h.kezd), hossz: h.hossz }; });
      // a végén a minta utánra ugrik (mint a VS Code-ban)
      var utolso = b.helyek[b.helyek.length - 1];
      if (b.helyek.length > 1 && utolso.kezd + utolso.hossz < b.szoveg.length) ugrasok.push({ vegtol: hossz - (kezd + b.szoveg.length), hossz: 0 });
    }

    // Tab a mintában: a következő helyre ugrik (pl.: for i → range(10) → pass)
    function ugrik() {
      var h = ugrasok.shift(), k = ta.value.length - h.vegtol;
      if (k < ta.selectionEnd || k < 0) { ugrasok = []; return false; }
      ta.setSelectionRange(k, k + h.hossz);
      return true;
    }

    // ── Párzárás (mint a VS Code): ( [ { " ' ──────────────────────────
    // Nyitó jelre a pár is bekerül, a kurzor középre kerül. Záró jelnél, ha
    // már ott van, csak átlép rajta. Backspace az üres párt együtt törli.
    // Kijelölt szövegnél körbezárja a kijelölést.
    var PAROK = { '(': ')', '[': ']', '{': '}', '"': '"', "'": "'" };
    var ZARO = { ')': 1, ']': 1, '}': 1 };
    var ELE_ZAR = /^($|[\s;:.,=)\]}>])/;   // ez előtt zárunk párt (VS Code szabálya)
    function beir(szoveg, kezd, veg, uKezd, uVeg) {
      szuneteltet = true;
      ta.setSelectionRange(kezd, veg);
      if (!document.execCommand('insertText', false, szoveg)) {
        ta.setRangeText(szoveg, kezd, veg, 'end');
        ta.dispatchEvent(new Event('input', { bubbles: true }));
      }
      szuneteltet = false;
      ta.setSelectionRange(uKezd, uVeg);
    }
    function parZaras(e) {
      if (kikapcsolva() || e.isComposing || e.metaKey || (e.ctrlKey && !e.altKey)) return false;
      var k = e.key, s = ta.selectionStart, v2 = ta.selectionEnd, v = ta.value;
      var utana = v.charAt(v2), elotte = v.charAt(s - 1);
      var sor = v.slice(v.lastIndexOf('\n', s - 1) + 1, s);
      if (k === 'Backspace') {
        if (s !== v2 || !PAROK[elotte] || PAROK[elotte] !== utana) return false;
        beir('', s - 1, s + 1, s - 1, s - 1);
        return true;
      }
      if (ZARO[k] || k === '"' || k === "'") {
        // átlépés a már ott lévő záró jelen
        if (s === v2 && utana === k) { ta.setSelectionRange(s + 1, s + 1); return true; }
      }
      if (!PAROK[k]) return false;
      var zar = PAROK[k];
      if (s !== v2) {   // kijelölés körbezárása
        beir(k + v.slice(s, v2) + zar, s, v2, s + 1, v2 + 1);
        return true;
      }
      if (/#/.test(sor.replace(/(["'])(?:\\.|(?!\1).)*\1/g, ''))) return false;   // megjegyzésben nem
      if (!ELE_ZAR.test(v.slice(v2))) return false;
      if (k === '"' || k === "'") {
        if (/[\wáéíóöőúüűÁÉÍÓÖŐÚÜŰ]/.test(elotte)) return false;   // pl.: it's
        var nyitott = /(["'])(?:\\.|(?!\1).)*$/.exec(sor.replace(/(["'])(?:\\.|(?!\1).)*\1/g, ''));
        if (nyitott) return false;   // épp egy szöveget zárunk le
      }
      beir(k + zar, s, s, s + 1, s + 1);
      return true;
    }

    // capture: előbb fut, mint az oldal saját Tab/Enter kezelője
    ta.addEventListener('keydown', function (e) {
      if (/^[(\[{)\]}"']$/.test(e.key) || e.key === 'Backspace') {
        if (!(ul && e.key === 'Backspace') && parZaras(e)) { bezar(); e.preventDefault(); e.stopImmediatePropagation(); return; }
      }
      if (!ul) {
        if (e.key === 'Tab' && !e.shiftKey && ugrasok.length && ugrik()) { e.preventDefault(); e.stopImmediatePropagation(); }
        else if (e.key === 'Escape' || e.key === 'Enter') ugrasok = [];
        return;
      }
      if (e.key === 'ArrowDown') { akt = (akt + 1) % talalat.length; valasztott = true; rajzol(); }
      else if (e.key === 'ArrowUp') { akt = (akt - 1 + talalat.length) % talalat.length; valasztott = true; rajzol(); }
      else if (e.key === 'Tab' && !e.shiftKey) { elfogad(); }
      else if (e.key === 'Enter' && valasztott && !e.ctrlKey && !e.metaKey) { elfogad(); }
      else if (e.key === 'Escape') { bezar(); }
      else { if (!/^[\wáéíóöőúüűÁÉÍÓÖŐÚÜŰ]$/.test(e.key) && e.key !== 'Backspace' && e.key !== 'Shift') bezar(); return; }
      e.preventDefault(); e.stopImmediatePropagation();
    }, true);
    ta.addEventListener('input', function (e) {
      if (szuneteltet) return;
      if (e.inputType && e.inputType.indexOf('delete') === 0 && !ul) return;
      frissit();
    });
    ta.addEventListener('blur', function () { setTimeout(bezar, 100); });
    ta.addEventListener('scroll', bezar);
    ta.addEventListener('click', function () { bezar(); ugrasok = []; });
  }

  window.PyKieg = {
    ki: false,
    mod: '',
    monaco: monacoBekot,
    textarea: textareaBekot,
    szotar: SZOTAR,
    metodusok: METODUSOK
  };

  // Ha a Monaco már betöltődött, magától bekötjük
  if (window.monaco) monacoBekot(window.monaco);
})();
