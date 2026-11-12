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
 * Kikapcsolás egy oldalon (pl.: dolgozat):  <html data-pykieg="ki">
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
    { c: 'input', t: 'minta', s: '${1:valtozo} = input("${2:Kérdés: }")', d: 'Szöveg bekérése' },
    { c: 'inputint', t: 'minta', s: '${1:szam} = int(input("${2:Adj meg egy számot: }"))', d: 'Egész szám bekérése' },
    { c: 'inputfloat', t: 'minta', s: '${1:szam} = float(input("${2:Adj meg egy számot: }"))', d: 'Tört szám bekérése' },
    { c: 'for', t: 'minta', s: 'for ${1:i} in range(${2:10}):\n\t${3:pass}', d: 'Számlálós ciklus' },
    { c: 'forin', t: 'minta', s: 'for ${1:elem} in ${2:lista}:\n\t${3:pass}', d: 'Bejárás: lista minden eleme' },
    { c: 'while', t: 'minta', s: 'while ${1:feltetel}:\n\t${2:pass}', d: 'Feltételes ciklus' },
    { c: 'if', t: 'minta', s: 'if ${1:feltetel}:\n\t${2:pass}', d: 'Elágazás' },
    { c: 'ifelse', t: 'minta', s: 'if ${1:feltetel}:\n\t${2:pass}\nelse:\n\t${3:pass}', d: 'Elágazás különben ággal' },
    { c: 'elif', t: 'minta', s: 'elif ${1:feltetel}:\n\t${2:pass}', d: 'Különben ha' },
    { c: 'else', t: 'minta', s: 'else:\n\t${1:pass}', d: 'Különben' },
    { c: 'def', t: 'minta', s: 'def ${1:nev}(${2}):\n\t${3:pass}', d: 'Saját függvény' },
    { c: 'withopen', t: 'minta', s: 'with open("${1:adat.txt}", encoding="utf-8") as ${2:f}:\n\t${3:pass}', d: 'Fájl olvasása' },
    { c: 'try', t: 'minta', s: 'try:\n\t${1:pass}\nexcept ${2:ValueError}:\n\t${3:pass}', d: 'Hibakezelés' },

    // Beépített függvények
    { c: 'int', t: 'fuggveny', s: 'int(${1})', d: 'Egész számmá alakít' },
    { c: 'float', t: 'fuggveny', s: 'float(${1})', d: 'Tört számmá alakít' },
    { c: 'str', t: 'fuggveny', s: 'str(${1})', d: 'Szöveggé alakít' },
    { c: 'bool', t: 'fuggveny', s: 'bool(${1})', d: 'Logikai értékké alakít' },
    { c: 'len', t: 'fuggveny', s: 'len(${1})', d: 'Hossz (elemek száma)' },
    { c: 'range', t: 'fuggveny', s: 'range(${1})', d: 'Számsor: range(start, stop, lépés)' },
    { c: 'round', t: 'fuggveny', s: 'round(${1}, ${2:2})', d: 'Kerekítés' },
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
    { c: 'insert', s: 'insert(${1:0}, ${2})', d: 'Lista: beszúrás' },
    { c: 'remove', s: 'remove(${1})', d: 'Lista: elem törlése' },
    { c: 'pop', s: 'pop(${1})', d: 'Lista: kivesz egy elemet' },
    { c: 'sort', s: 'sort()', d: 'Lista: rendezés helyben' },
    { c: 'reverse', s: 'reverse()', d: 'Lista: megfordítás' },
    { c: 'count', s: 'count(${1})', d: 'Hányszor fordul elő' },
    { c: 'index', s: 'index(${1})', d: 'Hányadik helyen van' },
    { c: 'upper', s: 'upper()', d: 'Szöveg: nagybetűs' },
    { c: 'lower', s: 'lower()', d: 'Szöveg: kisbetűs' },
    { c: 'strip', s: 'strip()', d: 'Szöveg: szóközök le a széléről' },
    { c: 'split', s: 'split(${1:";"})', d: 'Szöveg: darabolás listává' },
    { c: 'join', s: 'join(${1})', d: 'Szöveg: lista összefűzése' },
    { c: 'replace', s: 'replace("${1}", "${2}")', d: 'Szöveg: csere' },
    { c: 'startswith', s: 'startswith("${1}")', d: 'Szöveg: ezzel kezdődik?' },
    { c: 'endswith', s: 'endswith("${1}")', d: 'Szöveg: ezzel végződik?' },
    { c: 'isdigit', s: 'isdigit()', d: 'Szöveg: csak számjegy?' },
    { c: 'readlines', s: 'readlines()', d: 'Fájl: sorok listája' },
    { c: 'randint', s: 'randint(${1:1}, ${2:10})', d: 'random: egész szám a két határ között' },
    { c: 'choice', s: 'choice(${1})', d: 'random: véletlen elem' },
    { c: 'sqrt', s: 'sqrt(${1})', d: 'math: négyzetgyök' }
  ];

  function kikapcsolva() {
    return window.PyKieg.ki === true ||
      document.documentElement.getAttribute('data-pykieg') === 'ki';
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
        var lista = pontUtan ? METODUSOK.map(function (x) { x.t = 'metodus'; return x; }) : SZOTAR;
        return {
          suggestions: lista.map(function (x, i) {
            return {
              label: x.c, kind: tipus[x.t] || K.Text,
              insertText: x.s || x.c, insertTextRules: x.s ? SNIP : undefined,
              detail: x.d || '', range: range,
              sortText: (x.t === 'minta' ? '0' : '1') + ('00' + i).slice(-3)
            };
          })
        };
      }
    });
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

    // capture: előbb fut, mint az oldal saját Tab/Enter kezelője
    ta.addEventListener('keydown', function (e) {
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
    monaco: monacoBekot,
    textarea: textareaBekot,
    szotar: SZOTAR,
    metodusok: METODUSOK
  };

  // Ha a Monaco már betöltődött, magától bekötjük
  if (window.monaco) monacoBekot(window.monaco);
})();
