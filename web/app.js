const preview = document.getElementById("preview");
const statusEl = document.getElementById("status");
const taskList = document.getElementById("task-list");
const btnStarter = document.getElementById("btn-starter");
const btnBlocks = document.getElementById("btn-blocks");
const btnInteract = document.getElementById("btn-interact");
const taskSelector = document.getElementById("task-selector");
const btnTaskDesc = document.getElementById("btn-task-desc");
const btnSampleImg = document.getElementById("btn-sample-img");
const btnSources = document.getElementById("btn-sources");
const btnPreviewNewTab = document.getElementById("btn-preview-new-tab");
const timerEl = document.getElementById("timer");
const btnTimerToggle = document.getElementById("btn-timer-toggle");
const btnTimerReset = document.getElementById("btn-timer-reset");
const btnSaveFile = document.getElementById("btn-save-file");
const btnLoadFile = document.getElementById("btn-load-file");
const fileInput = document.getElementById("file-input");
const studentModal = document.getElementById("student-modal");
const studentForm = document.getElementById("student-form");
const studentNameInput = document.getElementById("student-name");
const studentEmailInput = document.getElementById("student-email");
const studentClassYearSelect = document.getElementById("student-class-year");
const studentClassLetterSelect = document.getElementById("student-class-letter");
const studentInfo = document.getElementById("student-info");
const btnLogout = document.getElementById("btn-logout");
const tabHtml = document.getElementById("tab-html");
const tabCss = document.getElementById("tab-css");
const tabCssValidator = document.getElementById("tab-css-validator");
const btnW3schools = document.getElementById("btn-w3schools");
const btnHtmlValidator = document.getElementById("btn-html-validator");
const htmlEditorWrapper = document.getElementById("html-editor-wrapper");
const cssEditorWrapper = document.getElementById("css-editor-wrapper");
const tasksSection = document.getElementById("tasks-section");
const btnToggleTasks = document.getElementById("btn-toggle-tasks");
const btnWrap = document.getElementById("btn-wrap");

// Időzítő változók
let timerSeconds = 60 * 60; // 60 perc
let timerInterval = null;
let timerRunning = false;

// Tanuló adatai
let studentData = {
  name: '',
  email: '',
  class: ''
};

// Validálás képek
let validationImages = {
  html: null,
  css: null,
  htmlFileName: null,
  cssFileName: null,
};

// Feladatok konfigurációja
const availableTasks = {
  bogyos: {
    id: "bogyos",
    name: "Bogyós gyümölcsök",
    description: "Weboldal kódolása - Bogyós gyümölcsök",
    basePath: "forrasok/bogyos/",
    htmlFile: "bogyos_gyumolcsok.html",
    cssFile: "css/style.css",
    taskDescFile: "weboldal_kodolas_bogyos_gyumolcsok.html",
    // A preview-ban használt base URL a képekhez és egyéb asset-ekhez
    previewBase: "forrasok/bogyos/",
    // Mintakép
    sampleImage: "bogyos_gyumolcsok.png",
    // Forrás fájlok
    sourceFiles: [
      { name: "forras.txt", label: "Áfonya szöveg (forras.txt)" },
      { name: "tablazat.txt", label: "Táblázat fejléc (tablazat.txt)" }
    ],
    checks: [
      {
        id: "lang-charset",
        label: "1. Weboldal nyelve magyar, karakterkódolása UTF-8",
        check: (doc) => {
          const meta = doc.querySelector('meta[charset]');
          const hasUtf8 = meta && meta.getAttribute('charset').toLowerCase() === 'utf-8';
          return doc.documentElement.lang === "hu" && hasUtf8;
        },
      },
      {
        id: "title",
        label: "2. Böngésző címsorában megjelenő cím \"Bogyós gyümölcsök\"",
        check: (doc) => doc.title === "Bogyós gyümölcsök",
      },
      {
        id: "style-link",
        label: "3. Hivatkozást helyezett el a css mappában található style.css stíluslapra",
        check: (doc, html) => {
          return /href=["'][^"']*style\.css["']/i.test(html);
        },
      },
      {
        id: "fejlec-img",
        label: "4. Az img mappában található fejlec.jpg képet elhelyezte",
        check: (doc) => {
          const img = doc.querySelector('img[src*="fejlec"]');
          return img !== null;
        },
      },
      {
        id: "fejlec-alt",
        label: "5. Ha nem jeleníthető meg a kép vagy ha az egeret felé visszük a \"Bogyós gyümölcsök\" szöveg jelenik meg",
        check: (doc) => {
          const img = doc.querySelector('img[src*="fejlec"]');
          return img && img.alt && img.title === "Bogyós gyümölcsök";
        },
      },
      {
        id: "fejlec-id",
        label: "6. Fejléc képre egyedi azonosítót állított fejlec néven",
        check: (doc) => doc.querySelector('img#fejlec') !== null,
      },
      {
        id: "goji-menu",
        label: "7. Elkészítette a Goji bogyó menüpontot és jó oldalra hivatkozik",
        check: (doc) => {
          const links = doc.querySelectorAll('nav a, .navbar a');
          return Array.from(links).some(a =>
            a.textContent.includes('Goji') &&
            a.href.includes('wikipedia.org/wiki/Goji')
          );
        },
      },
      {
        id: "goji-blank",
        label: "8. A Goji bogyó linkre kattintva a tartalom új lapon jelenik meg",
        check: (doc) => {
          const links = doc.querySelectorAll('a');
          return Array.from(links).some(a =>
            a.href.includes('wikipedia.org/wiki/Goji') &&
            a.target === '_blank'
          );
        },
      },
      {
        id: "h1-focim",
        label: "9. A főcím 1-es szintű címsor",
        check: (doc) => {
          const h1 = doc.querySelector('h1');
          return h1 && h1.textContent.includes('BOGYÓS');
        },
      },
      {
        id: "erdei-paragraphs",
        label: "10. Az Erdei gyümölcsök részben 2 bekezdést készített",
        check: (doc) => {
          const erdei = doc.querySelector('#erdei');
          if (!erdei) return false;
          const paragraphs = erdei.querySelectorAll('p');
          return paragraphs.length >= 2;
        },
      },
      {
        id: "erdei-paragraphs-my4",
        label: "11. Az Erdei gyümölcsök bekezdésein alkalmazza a my-4 Bootstrap osztályjelölőt",
        check: (doc) => {
          const erdei = doc.querySelector('#erdei');
          if (!erdei) return false;
          const paragraphs = erdei.querySelectorAll('p.my-4');
          return paragraphs.length >= 2;
        },
      },
      {
        id: "szeder-underline",
        label: "12. Az \"5 legjobb szedres nyári finomság:\" aláhúzott",
        check: (doc) => {
          const u = doc.querySelector('u');
          return u && u.textContent.includes('5 legjobb');
        },
      },
      {
        id: "szeder-list",
        label: "13. Az \"5 legjobb szedres nyári finomság:\" alatti szövegből számozott felsorolást készített",
        check: (doc) => {
          const lists = doc.querySelectorAll('ol');
          return Array.from(lists).some(ol =>
            ol.textContent.includes('muffin') || ol.textContent.includes('Szedres')
          );
        },
      },
      {
        id: "afonya-h3",
        label: "14. Az Áfonya részben 3-as szintű címsort készített",
        check: (doc) => {
          const h3s = doc.querySelectorAll('h3');
          return Array.from(h3s).some(h => h.textContent.includes('Áfonya'));
        },
      },
      {
        id: "afonya-paragraphs",
        label: "15. Az Áfonya részben 3 bekezdést készített",
        check: (doc) => {
          const h3s = doc.querySelectorAll('h3');
          const afonya = Array.from(h3s).find(h => h.textContent.includes('Áfonya'));
          if (!afonya) return false;
          const container = afonya.closest('div');
          if (!container) return false;
          const paragraphs = container.querySelectorAll('p:not(.card-text)');
          return paragraphs.length >= 3;
        },
      },
      {
        id: "afonya-bold",
        label: "16. Az \"áfonya\" szó félkövér",
        check: (doc) => {
          const bolds = doc.querySelectorAll('b, strong');
          const hasAfonya = Array.from(bolds).some(b => b.textContent.includes('áfonya'));
          return hasAfonya;
        },
      },
       {
        id: "afonya-italic",
        label: "17. A Áfonya latin neve (Vaccinium) dőlt",
        check: (doc) => {
          const italics = doc.querySelectorAll('i, em');
          const hasLatin = Array.from(italics).some(i => i.textContent.includes('Vaccinium'));
          return hasLatin;
        },
      },
      {
        id: "afonya-img",
        label: "18. A kép forrása az img mappában található afonya.jpg",
        check: (doc) => {
          const img = doc.querySelector('img[src*="afonya"]');
          return img !== null;
        },
      },
      {
        id: "afonya-alt",
        label: "19. Ha nem jeleníthető meg a kép vagy ha az egeret felé visszük a \"Áfonya\" szöveg jelenik meg",
        check: (doc) => {
          const img = doc.querySelector('img[src*="afonya"]');
          return img && img.alt && img.title === "Áfonya";
        },
      },
      {
        id: "caption-classes",
        label: "20. A képaláírásokra alkalmazta az fw-bold és h5 osztályjelölőket (6 helyen)",
        check: (doc) => {
          const captions = doc.querySelectorAll('.fw-bold.h5');
          return captions.length >= 6;
        },
      },
            {
        id: "malna-list-ul",
        label: "21. „A málna jótékony hatásai:" bekezdés alatti szövegből számozatlan felsorolást készített",
        check: (doc) => {
          const uls = doc.querySelectorAll('ul:not(.navbar-nav):not(.nav)');
          return Array.from(uls).some(ul => ul.querySelectorAll('li').length > 0);
        },
      },
      {
        id: "malna-list-id",
        label: "22. A számozatlan felsorolásra alkalmazta a \"malna\" egyedi azonosítót",
        check: (doc) => {
          return doc.querySelector('ul#malna') !== null;
        },
      },
      {
        id: "col-lg-4",
        label: "23. Az Eper/Áfonya/Málna rész: 3 oszlopos elrendezésű nagy képernyőn",
        check: (doc) => {
          // Az Eper, Áfonya és Málna szekcióknak kell col-lg-4-nek lennie
          // Keressük meg azokat a col-lg-4 elemeket, amelyek tartalmazzák ezeket a címsorokat
          const allCols = doc.querySelectorAll('.col-lg-4');
          let foundEper = false;
          let foundAfonya = false;
          let foundMalna = false;

          allCols.forEach(col => {
            const text = col.textContent || '';
            const h3 = col.querySelector('h3');
            const h3Text = h3 ? h3.textContent : '';

            if (h3Text.includes('Eper') && !h3Text.includes('szamóca')) foundEper = true;
            if (h3Text.includes('Áfonya') || text.includes('Áfonya') && text.includes('Vaccinium')) foundAfonya = true;
            if (h3Text.includes('Málna')) foundMalna = true;
          });

          return foundEper && foundAfonya && foundMalna;
        },
      },
      {
        id: "table-header",
        label: "24. A táblázat fejléc celláit elkészítette",
        check: (doc) => {
          const ths = doc.querySelectorAll('thead th');
          return ths.length >= 3;
        },
      },
      {
        id: "table-w25",
        label: "25. A fejléc cellákra alkalmazta a w-25 osztályjelölőt",
        check: (doc) => {
          const ths = doc.querySelectorAll('thead th.w-25');
          return ths.length >= 3;
        },
      },
      {
        id: "footer-link-href",
        label: "26. A láblécben hivatkozást készített a \"leiras\" egyedi azonosítóra",
        check: (doc) => {
          return doc.querySelector('.lablec a[href="#leiras"]') !== null;
        },
      },
      {
        id: "footer-link-text",
        label: "27. A hivatkozás szövege \"Ugrás az elejére\"",
        check: (doc) => {
          const link = doc.querySelector('.lablec a[href="#leiras"]');
          return link && link.textContent.includes('Ugrás az elejére');
        },
      },
      // CSS feladatok
      {
        id: "css-body-font",
        label: "28. CSS: Az oldal betűtípusa Verdana",
        check: (doc, html, css) => {
          return css && /body\s*\{[^}]*font-family\s*:\s*[^;]*verdana/i.test(css);
        },
        cssCheck: true,
      },
      {
        id: "css-body-height",
        label: "29. CSS: Az oldal magassága 400px",
        check: (doc, html, css) => {
          return css && /body\s*\{[^}]*height\s*:\s*400px/i.test(css);
        },
        cssCheck: true,
      },
      {
        id: "css-p-justify",
        label: "30. CSS: A bekezdések sorkizártak",
        check: (doc, html, css) => {
          return css && /p\s*\{[^}]*text-align\s*:\s*justify/i.test(css);
        },
        cssCheck: true,
      },
      {
        id: "css-hobbi-bg",
        label: "31. CSS: A hobbi osztályjelölő háttérszíne rgb(255,207,207)",
        check: (doc, html, css) => {
          return css && /\.hobbi\s*\{[^}]*background(-color)?\s*:\s*(rgb\s*\(\s*255\s*,\s*207\s*,\s*207\s*\)|#ffcfcf)/i.test(css);
        },
        cssCheck: true,
      },
      {
        id: "css-nav-border",
        label: "32. CSS: A navigáció listaelemére 3 képpontos pontozott vonalú piros szegélyt állított",
        check: (doc, html, css) => {
          return css && /nav\s+li\s*\{[^}]*border\s*:[^;]*3px[^;]*dotted[^;]*red/i.test(css);
        },
        cssCheck: true,
      },
      {
        id: "css-footer-link-color",
        label: "33. CSS: A lablec osztályjelölő hivatkozása fehér színű",
        check: (doc, html, css) => {
          const hasWhite = css && /\.lablec\s+a\s*\{[^}]*(color\s*:\s*(white|#fff|#ffffff))/i.test(css);
          return hasWhite;
        },
        cssCheck: true,
      },
      {
        id: "css-footer-link-style",
        label: "34. CSS: A lablec osztályjelölő hivatkozása félkövér",
        check: (doc, html, css) => {
          const hasBold = css && /\.lablec\s+a\s*\{[^}]*font-weight\s*:\s*bold/i.test(css);
          return hasBold;
        },
        cssCheck: true,
      },
      {
        id: "css-footer-hover",
        label: "35. CSS: Ha a lablec osztályjelölőjű hivatkozás felé visszük az egeret, akkor nagybetűs",
        check: (doc, html, css) => {
          return css && /\.lablec\s+a:hover\s*\{[^}]*text-transform\s*:\s*uppercase/i.test(css);
        },
        cssCheck: true,
      },
      {
        id: "css-malna-list-image",
        label: "36. CSS: A #malna elemkijelölőre beállította az img mappában található bogyo.png-t",
        check: (doc, html, css) => {
          return css && /#malna\s*\{[^}]*list-style-image\s*:\s*url\([^)]*bogyo\.png/i.test(css);
        },
        cssCheck: true,
      },
      {
        id: "css-malna-margin",
        label: "37. CSS: A #malna elemkijelölőre beállította, hogy a bal külső margó 25 képpont legyen",
        check: (doc, html, css) => {
          return css && /#malna\s*\{[^}]*margin-left\s*:\s*25px/i.test(css);
        },
        cssCheck: true,
      },
      {
        id: "css-malna-font-size",
        label: "38. CSS: A #malna elemkijelölőre beállította, hogy a betűméret 10%-kal kisebb, mint az alapértelmezett",
        check: (doc, html, css) => {
          return css && /#malna\s*\{[^}]*font-size\s*:\s*(0\.9em|90%|0\.9rem)/i.test(css);
        },
        cssCheck: true,
      },
      {
        id: "html-validated",
        label: "39. HTML validálás képernyőképe feltöltve",
        check: () => validationImages.html !== null,
      },
      {
        id: "css-validated",
        label: "40. CSS validálás képernyőképe feltöltve",
        check: () => validationImages.css !== null,
      },
    ],
  },
};

let currentTask = null;
let htmlEditor;
let cssEditor;
let debounceTimer;
let showBlockGuides = true;
let htmlDepthDecorations = [];
let htmlTokenDecorations = [];
let showCodeDepthColoring = false;
let lockPreviewInteractions = false;
let activeSourceLine = 1;

const guideStyle = `
<style id="block-guide-style">
  .code-guide {
    position: relative;
    outline: none;
    background: transparent;
  }

  .code-guide[data-guide-depth="1"].active-source { outline-color: rgba(244, 63, 94, 0.95); }
  .code-guide[data-guide-depth="2"].active-source { outline-color: rgba(34, 197, 94, 0.95); }
  .code-guide[data-guide-depth="3"].active-source { outline-color: rgba(59, 130, 246, 0.95); }
  .code-guide[data-guide-depth="4"].active-source { outline-color: rgba(249, 115, 22, 0.95); }
  .code-guide[data-guide-depth="5"].active-source { outline-color: rgba(168, 85, 247, 0.95); }
  .code-guide[data-guide-depth="1"].active-source { background: rgba(244, 63, 94, 0.12); }
  .code-guide[data-guide-depth="2"].active-source { background: rgba(34, 197, 94, 0.12); }
  .code-guide[data-guide-depth="3"].active-source { background: rgba(59, 130, 246, 0.12); }
  .code-guide[data-guide-depth="4"].active-source { background: rgba(249, 115, 22, 0.12); }
  .code-guide[data-guide-depth="5"].active-source { background: rgba(168, 85, 247, 0.12); }

  .code-guide::before {
    content: attr(data-guide-label);
    position: absolute;
    top: -0.75rem;
    left: 0.35rem;
    font-size: 10px;
    line-height: 1;
    letter-spacing: 0.04em;
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace;
    background: #0f172a;
    color: #cbd5e1;
    padding: 2px 5px;
    border-radius: 5px;
    border: 1px solid #334155;
    pointer-events: none;
    z-index: 5;
    display: none;
  }

  .code-guide.active-source {
    outline-style: dashed;
    outline-width: 3px;
    outline-offset: -1px;
    box-shadow: 0 0 0 2px rgba(15, 23, 42, 0.35), inset 0 0 0 1px rgba(255, 255, 255, 0.18);
  }

  .code-guide.active-source::before {
    display: block;
  }
</style>`;

const structureTags = new Set([
  "div",
  "section",
  "article",
  "aside",
  "main",
  "header",
  "footer",
  "nav",
  "ul",
  "ol",
  "li",
  "form",
]);

const voidTags = new Set([
  "area",
  "base",
  "br",
  "col",
  "embed",
  "hr",
  "img",
  "input",
  "link",
  "meta",
  "param",
  "source",
  "track",
  "wbr",
]);

const guideScript = `
<script>
  (function () {
    function getGuideDepth(el) {
      let depth = 1;
      let parent = el.parentElement;
      while (parent) {
        if (parent.matches && parent.matches("div,section,article,aside,main,header,footer,nav,form,ul,ol")) {
          depth += 1;
        }
        parent = parent.parentElement;
      }
      return Math.min(5, depth);
    }

    const targets = Array.from(document.querySelectorAll(
      "div,section,article,aside,main,header,footer,nav,form,ul,ol"
    ));
    targets.forEach((el) => {
      const depth = getGuideDepth(el);
      const classHint = (el.className || "").toString().trim().split(/\\s+/).filter(Boolean).slice(0, 2).join(".");
      const label = classHint ? "<" + el.tagName.toLowerCase() + " ." + classHint + ">" : "<" + el.tagName.toLowerCase() + ">";
      el.classList.add("code-guide");
      el.setAttribute("data-guide-depth", String(depth));
      el.setAttribute("data-guide-label", label);
    });

    function score(el, line) {
      const srcLine = Number(el.getAttribute("data-src-line") || "0");
      if (srcLine > line) return -1;
      const depth = Number(el.getAttribute("data-guide-depth") || "1");
      return srcLine * 100 + depth;
    }

    function highlightByLine(line) {
      let best = null;
      let bestScore = -1;

      targets.forEach((el) => {
        const current = score(el, line);
        if (current > bestScore) {
          bestScore = current;
          best = el;
        }
        el.classList.remove("active-source");
      });

      if (best) {
        best.classList.add("active-source");
      }
    }

    window.addEventListener("message", function (event) {
      if (!event || !event.data || event.data.type !== "source-line") return;
      const line = Number(event.data.line || 1);
      highlightByLine(line);
    });

    document.addEventListener("click", function (event) {
      var target = event.target && event.target.closest ? event.target.closest("[data-src-line]") : null;
      if (!target) return;
      var line = Number(target.getAttribute("data-src-line") || "1");
      if (window.parent) {
        window.parent.postMessage({ type: "preview-line", line: line }, "*");
      }
    }, true);
  })();
</script>`;

const previewLockStyle = `
<style id="preview-lock-style">
  a, button, input, select, textarea, label, summary, [role="button"], [data-bs-toggle] {
    pointer-events: none !important;
    cursor: default !important;
  }
</style>`;

const previewLockScript = `
<script>
  (function () {
    document.addEventListener("click", function (event) {
      event.preventDefault();
      event.stopPropagation();
    }, true);

    document.addEventListener("submit", function (event) {
      event.preventDefault();
      event.stopPropagation();
    }, true);

    document.addEventListener("dragstart", function (event) {
      event.preventDefault();
      event.stopPropagation();
    }, true);
  })();
</script>`;

const previewNavigationGuardScript = `
<script>
  (function () {
    // Keep component interactions, but block page navigations inside preview.
    document.addEventListener("click", function (event) {
      var anchor = event.target && event.target.closest ? event.target.closest("a[href]") : null;
      if (!anchor) return;
      event.preventDefault();
      event.stopPropagation();
    }, true);

    document.addEventListener("submit", function (event) {
      event.preventDefault();
      event.stopPropagation();
    }, true);

    window.open = function () { return null; };
  })();
</script>`;

// LocalStorage kulcsok - tanuló-specifikus!
function getStudentKey() {
  // Egyedi kulcs a tanuló neve és osztálya alapján
  if (!studentData.name || !studentData.class) return null;
  const safeName = studentData.name.toLowerCase().replace(/\s+/g, '_');
  const safeClass = studentData.class.toLowerCase().replace(/\s+/g, '_');
  return `${safeClass}_${safeName}`;
}

function getStorageKey(taskId, type) {
  const studentKey = getStudentKey();
  if (!studentKey) return null;
  return `vizsga_${studentKey}_${taskId}_${type}`;
}

function saveToLocalStorage() {
  if (!currentTask || !htmlEditor || !cssEditor) return;

  const htmlKey = getStorageKey(currentTask.id, 'html');
  const cssKey = getStorageKey(currentTask.id, 'css');
  const lastSavedKey = getStorageKey(currentTask.id, 'lastSaved');

  // Ha nincs tanuló adat, nem mentünk
  if (!htmlKey || !cssKey || !lastSavedKey) return;

  const html = htmlEditor.getValue();
  const css = cssEditor.getValue();

  localStorage.setItem(htmlKey, html);
  localStorage.setItem(cssKey, css);
  localStorage.setItem(lastSavedKey, new Date().toISOString());
}

function loadFromLocalStorage(taskId) {
  const htmlKey = getStorageKey(taskId, 'html');
  const cssKey = getStorageKey(taskId, 'css');
  const lastSavedKey = getStorageKey(taskId, 'lastSaved');

  // Ha nincs tanuló adat, nem tudunk betölteni
  if (!htmlKey || !cssKey || !lastSavedKey) return null;

  const html = localStorage.getItem(htmlKey);
  const css = localStorage.getItem(cssKey);
  const lastSaved = localStorage.getItem(lastSavedKey);

  if (html !== null || css !== null) {
    return { html, css, lastSaved };
  }
  return null;
}

function clearLocalStorage(taskId) {
  const htmlKey = getStorageKey(taskId, 'html');
  const cssKey = getStorageKey(taskId, 'css');
  const lastSavedKey = getStorageKey(taskId, 'lastSaved');

  // Ha nincs tanuló adat, nincs mit törölni
  if (!htmlKey || !cssKey || !lastSavedKey) return;

  localStorage.removeItem(htmlKey);
  localStorage.removeItem(cssKey);
  localStorage.removeItem(lastSavedKey);
}

// Feladat betöltése
async function loadTaskFiles(task) {
  try {
    const htmlResponse = await fetch(task.basePath + task.htmlFile);
    const cssResponse = await fetch(task.basePath + task.cssFile);

    if (!htmlResponse.ok || !cssResponse.ok) {
      throw new Error('Nem sikerült betölteni a forrásfájlokat');
    }

    const html = await htmlResponse.text();
    const css = await cssResponse.text();

    return { html, css };
  } catch (error) {
    console.error('Hiba a fájlok betöltésekor:', error);
    statusEl.textContent = 'Hiba: ' + error.message;
    return null;
  }
}

async function selectTask(taskId) {
  if (!taskId) {
    currentTask = null;
    btnTaskDesc.disabled = true;
    btnStarter.disabled = true;
    btnSampleImg.disabled = true;
    btnSources.disabled = true;
    btnPreviewNewTab.disabled = true;
    taskList.innerHTML = '';
    if (htmlEditor) htmlEditor.setValue('');
    if (cssEditor) cssEditor.setValue('');
    preview.srcdoc = '';
    statusEl.textContent = 'Válassz feladatot a kezdéshez…';
    updateProgressBar(0, 0);
    return;
  }

  const task = availableTasks[taskId];
  if (!task) return;

  currentTask = task;
  btnTaskDesc.disabled = false;
  btnStarter.disabled = false;
  btnSampleImg.disabled = !task.sampleImage;
  btnSources.disabled = !task.sourceFiles || task.sourceFiles.length === 0;
  btnPreviewNewTab.disabled = false;
  btnSaveFile.disabled = false;
  document.getElementById('btn-html-val-img').disabled = false;
  document.getElementById('btn-css-val-img').disabled = false;

  // Ellenőrizzük, van-e mentett munka
  const saved = loadFromLocalStorage(taskId);

  if (saved && (saved.html || saved.css)) {
    // Van mentett munka - betöltjük azt
    const lastSaved = saved.lastSaved ? new Date(saved.lastSaved).toLocaleString('hu-HU') : 'ismeretlen';
    statusEl.textContent = `Mentett munka betöltve (${lastSaved})`;

    if (htmlEditor && saved.html) htmlEditor.setValue(saved.html);
    if (cssEditor && saved.css) cssEditor.setValue(saved.css);
  } else {
    // Nincs mentett munka - betöltjük a kiindulási fájlokat
    statusEl.textContent = 'Kiindulási fájlok betöltése…';
    const files = await loadTaskFiles(task);

    if (files) {
      if (htmlEditor) htmlEditor.setValue(files.html);
      if (cssEditor) cssEditor.setValue(files.css);
      statusEl.textContent = 'Kiindulási fájlok betöltve';
    }
  }

  renderTaskChecks();
  updatePreview();

  // Időzítő automatikus indítása feladat kiválasztásakor
  if (!timerRunning) {
    startTimer();
  }
}

function renderTaskChecks() {
  taskList.innerHTML = '';

  if (!currentTask || !currentTask.checks) {
    return;
  }

  currentTask.checks.forEach((task) => {
    const li = document.createElement("li");
    li.className = "task";
    li.innerHTML = `<span class="dot"></span><span>${task.label}</span>`;
    taskList.appendChild(li);
  });
}

// Progress bar frissítése
function updateProgressBar(completed, total) {
  const progressBar = document.getElementById('progress-bar');
  const progressText = document.getElementById('progress-text');

  if (!progressBar || !progressText) return;

  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
  progressBar.style.width = `${percent}%`;
  progressText.textContent = `${completed}/${total} feladat teljesítve (${percent}%)`;

  // Szín változtatás a haladás alapján
  if (percent === 100) {
    progressBar.style.background = 'linear-gradient(90deg, #10b981, #34d399)';
  } else if (percent >= 50) {
    progressBar.style.background = 'linear-gradient(90deg, #f59e0b, #fbbf24)';
  } else {
    progressBar.style.background = 'linear-gradient(90deg, #3b82f6, #60a5fa)';
  }
}

function renderTasks(results) {
  taskList.innerHTML = "";
  results.forEach((task) => {
    const li = document.createElement("li");
    li.className = `task ${task.done ? "done" : ""}`;
    li.innerHTML = `<span class="dot"></span><span>${task.label}</span>`;
    taskList.appendChild(li);
  });
}

function annotateHtmlWithSourceLines(html) {
  const lines = html.split("\n");
  const annotated = lines.map((line, idx) =>
    line.replace(/<([a-zA-Z][\w-]*)(\s[^<>]*?)?(\/?)>/g, (full, tag, attrs = "", selfClose = "") => {
      if (/data-src-line\s*=/.test(full)) return full;
      const lineNo = idx + 1;
      return `<${tag}${attrs} data-src-line="${lineNo}"${selfClose}>`;
    })
  );
  return annotated.join("\n");
}

function buildDoc(html, css, withGuides) {
  const extra = withGuides ? guideScript : "";
  const interactionLock = lockPreviewInteractions ? `${previewLockStyle}\n${previewLockScript}` : "";
  const htmlForPreview = annotateHtmlWithSourceLines(html);

  const baseHref = currentTask ? currentTask.previewBase : "";

  const bootstrapCSS = currentTask
    ? `<link href="${baseHref}bootstrap/bootstrap.min.css" rel="stylesheet" />`
    : `<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet" />`;

  const bootstrapJS = currentTask
    ? `<script src="${baseHref}bootstrap/bootstrap.bundle.min.js"></script>`
    : `<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>`;

  return `<!doctype html>
<html lang="hu">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=0.4" />
    <base href="${baseHref}" />
    ${bootstrapCSS}
    ${withGuides ? guideStyle : ""}
    ${interactionLock}
  </head>
  <body>
    ${htmlForPreview}
    ${previewNavigationGuardScript}
    ${extra}
    ${bootstrapJS}
    <style>${css}</style>
  </body>
</html>`;
}

function updatePreview() {
  if (!htmlEditor || !cssEditor) return;

  statusEl.textContent = "Frissítés...";
  const html = htmlEditor.getValue();
  const css = cssEditor.getValue();
  preview.srcdoc = buildDoc(html, css, showBlockGuides);

  // Automatikus mentés
  saveToLocalStorage();
}

function scheduleUpdate() {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    updatePreview();
    updateHtmlDepthDecorations();
    updateHtmlTokenDecorations();
  }, 300);
}

function syncActivePreviewBlock() {
  if (!htmlEditor || !preview.contentWindow) return;
  const line = htmlEditor.getPosition() ? htmlEditor.getPosition().lineNumber : 1;
  activeSourceLine = line;
  preview.contentWindow.postMessage({ type: "source-line", line: activeSourceLine }, "*");
}

function jumpToSourceLine(line) {
  if (!htmlEditor) return;
  const model = htmlEditor.getModel();
  if (!model) return;
  const target = Math.max(1, Math.min(line, model.getLineCount()));
  htmlEditor.setPosition({ lineNumber: target, column: 1 });
  htmlEditor.revealLineInCenter(target);
  htmlEditor.focus();
}

function getDepthClass(depth) {
  const level = (Math.max(0, depth) % 5) + 1;
  return `depth-line-${level}`;
}

function updateHtmlDepthDecorations() {
  if (!htmlEditor) return;
  const model = htmlEditor.getModel();
  if (!model) return;
  if (!showCodeDepthColoring) {
    htmlDepthDecorations = htmlEditor.deltaDecorations(htmlDepthDecorations, []);
    return;
  }

  const lines = model.getLinesContent();
  const nextDecorations = [];
  let depth = 0;

  lines.forEach((line, idx) => {
    const tokenRegex = /<\/?([a-zA-Z][\w-]*)\b[^>]*>/g;
    let match;
    let hasStructureTag = false;
    let lineDepth = depth;
    let firstStructureToken = true;

    while ((match = tokenRegex.exec(line)) !== null) {
      const fullToken = match[0];
      const tag = match[1].toLowerCase();
      if (!structureTags.has(tag)) continue;

      const isClosing = fullToken.startsWith("</");
      const selfClosing = fullToken.endsWith("/>") || voidTags.has(tag);

      if (firstStructureToken) {
        firstStructureToken = false;
        if (isClosing) {
          lineDepth = Math.max(0, depth - 1);
        }
      }

      hasStructureTag = true;

      if (isClosing) {
        depth = Math.max(0, depth - 1);
      } else if (!selfClosing) {
        depth += 1;
      }
    }

    if (!hasStructureTag) return;

    nextDecorations.push({
      range: new window.monaco.Range(idx + 1, 1, idx + 1, 1),
      options: {
        isWholeLine: true,
        className: getDepthClass(lineDepth),
      },
    });
  });

  htmlDepthDecorations = htmlEditor.deltaDecorations(htmlDepthDecorations, nextDecorations);
}

function updateHtmlTokenDecorations() {
  if (!htmlEditor) return;
  const model = htmlEditor.getModel();
  if (!model) return;

  const lines = model.getLinesContent();
  const nextDecorations = [];

  lines.forEach((line, idx) => {
    const lineNo = idx + 1;

    const tagRegex = /<\/?([a-zA-Z][\w-]*)/g;
    let match;
    while ((match = tagRegex.exec(line)) !== null) {
      const full = match[0];
      const tag = match[1];
      const startCol = match.index + (full.startsWith("</") ? 3 : 2);
      const endCol = startCol + tag.length;
      nextDecorations.push({
        range: new window.monaco.Range(lineNo, startCol, lineNo, endCol),
        options: { inlineClassName: "tok-tag" },
      });
    }

    const attrNameRegex = /\s([:@a-zA-Z_][:@\w-]*)\s*=/g;
    while ((match = attrNameRegex.exec(line)) !== null) {
      const name = match[1];
      const startCol = match.index + match[0].indexOf(name) + 1;
      const endCol = startCol + name.length;
      nextDecorations.push({
        range: new window.monaco.Range(lineNo, startCol, lineNo, endCol),
        options: { inlineClassName: "tok-attr-name" },
      });
    }

    const attrValueRegex = /"[^"]*"|'[^']*'/g;
    while ((match = attrValueRegex.exec(line)) !== null) {
      const value = match[0];
      const startCol = match.index + 1;
      const endCol = startCol + value.length;
      nextDecorations.push({
        range: new window.monaco.Range(lineNo, startCol, lineNo, endCol),
        options: { inlineClassName: "tok-attr-value" },
      });
    }
  });

  htmlTokenDecorations = htmlEditor.deltaDecorations(htmlTokenDecorations, nextDecorations);
}

function createEditor(monaco, elementId, language, value) {
  const editor = monaco.editor.create(document.getElementById(elementId), {
    value,
    language,
    automaticLayout: true,
    bracketPairColorization: { enabled: true },
    guides: { bracketPairs: true },
    minimap: { enabled: false },
    fontSize: 14,
    lineHeight: 20,
    tabSize: 2,
    insertSpaces: true,
    wordWrap: "on",
    fontFamily: "'Fira Code', 'Consolas', 'Courier New', monospace",
    fontLigatures: false,
    renderWhitespace: "none",
    cursorStyle: "line",
    cursorBlinking: "blink",
    cursorWidth: 2,
    suggest: {
      showWords: true,
      showSnippets: true,
      selectionMode: "whenQuickSuggestion",
    },
    quickSuggestions: {
      other: true,
      comments: false,
      strings: true,
    },
    autoClosingBrackets: "always",
    autoClosingQuotes: "always",
    "semanticHighlighting.enabled": false,
    theme: "vizsga-contrast",
  });

  const model = editor.getModel();
  if (model) {
    monaco.editor.setModelLanguage(model, language);
  }

  return editor;
}

function loadMonaco() {
  if (typeof require === "undefined") {
    throw new Error("Monaco loader nem erheto el.");
  }

  return new Promise((resolve, reject) => {
    require.config({
      paths: {
        vs: "https://cdn.jsdelivr.net/npm/monaco-editor@0.52.2/min/vs",
      },
    });

    require(
      ["vs/editor/editor.main"],
      () => {
        require(
          [
            "vs/language/html/htmlMode",
            "vs/language/css/cssMode",
            "vs/basic-languages/html/html",
            "vs/basic-languages/css/css",
          ],
          (htmlMode, cssMode, htmlBasic, cssBasic) => {
            const monaco = window.monaco;

            const htmlDef = htmlBasic && htmlBasic.language ? htmlBasic : (htmlBasic && htmlBasic.default ? htmlBasic.default : null);
            const cssDef = cssBasic && cssBasic.language ? cssBasic : (cssBasic && cssBasic.default ? cssBasic.default : null);

            if (htmlDef && htmlDef.conf && htmlDef.language) {
              monaco.languages.setLanguageConfiguration("html", htmlDef.conf);
              monaco.languages.setMonarchTokensProvider("html", htmlDef.language);
            }

            if (cssDef && cssDef.conf && cssDef.language) {
              monaco.languages.setLanguageConfiguration("css", cssDef.conf);
              monaco.languages.setMonarchTokensProvider("css", cssDef.language);
            }

            resolve(monaco);
          },
          (err) => reject(err)
        );
      },
      (err) => reject(err)
    );
  });
}

function activateEmmet(monaco) {
  if (!window.emmetMonaco) {
    statusEl.textContent = "Monaco kesz. Emmet plugin nem toltheto.";
    return;
  }

  window.emmetMonaco.emmetHTML(monaco);
}

// Auto Close Tag funkció HTML-hez
function setupAutoCloseTag(editor, monaco) {
  editor.onDidChangeModelContent((e) => {
    if (e.changes.length === 0) return;

    const change = e.changes[0];
    const text = change.text;

    // Ha > karaktert írunk és nem self-closing tag
    if (text === '>') {
      const model = editor.getModel();
      const position = editor.getPosition();
      const lineContent = model.getLineContent(position.lineNumber);
      const beforeCursor = lineContent.substring(0, position.column - 1);

      // Keressük meg a nyitó taget
      const tagMatch = beforeCursor.match(/<([a-zA-Z][\w-]*)[^>]*$/);
      if (tagMatch) {
        const tagName = tagMatch[1].toLowerCase();
        // Void elemek nem kapnak záró taget
        const voidElements = ['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr'];
        if (!voidElements.includes(tagName) && !beforeCursor.endsWith('/')) {
          // Ellenőrizzük, hogy a sor nem tartalmaz-e már záró taget
          const afterCursor = lineContent.substring(position.column - 1);
          if (!afterCursor.startsWith(`</${tagName}>`)) {
            const closeTag = `</${tagName}>`;
            editor.executeEdits('auto-close-tag', [{
              range: new monaco.Range(position.lineNumber, position.column, position.lineNumber, position.column),
              text: closeTag,
              forceMoveMarkers: false
            }]);
            // Kurzor visszahelyezése
            editor.setPosition(position);
          }
        }
      }
    }
  });
}

// Tag parse helper: div.class#id -> { tag, id, className }
function parseTagAbbr(abbr) {
  const tagMatch = abbr.match(/^([a-zA-Z][\w-]*)/);
  const classMatch = abbr.match(/\.([a-zA-Z0-9_-]+)/g);
  const idMatch = abbr.match(/#([a-zA-Z0-9_-]+)/);

  let tag = tagMatch ? tagMatch[1] : 'div';
  let id = idMatch ? idMatch[1] : '';
  let className = classMatch ? classMatch.map(c => c.substring(1)).join(' ') : '';

  return { tag, id, className };
}

// Tag nyitó/záró generálás
function buildTag(parsed, content, indent = '') {
  let openTag = `<${parsed.tag}`;
  if (parsed.id) openTag += ` id="${parsed.id}"`;
  if (parsed.className) openTag += ` class="${parsed.className}"`;
  openTag += '>';

  const closeTag = `</${parsed.tag}>`;

  if (content.includes('\n')) {
    return `${openTag}\n${indent}  ${content.split('\n').join('\n' + indent + '  ')}\n${indent}${closeTag}`;
  }
  return `${openTag}${content}${closeTag}`;
}

// Wrap with Abbreviation funkció
function wrapWithAbbreviation(editor, monaco) {
  // FONTOS: Először mentjük a kijelölést MIELŐTT a prompt megnyílna!
  const selection = editor.getSelection();
  const model = editor.getModel();

  // Kijelölt szöveg lekérése ELŐRE
  const selectedText = selection && !selection.isEmpty() ? model.getValueInRange(selection) : '';

  if (!selectedText) {
    alert('Jelölj ki szöveget a becsomagoláshoz!');
    return;
  }

  const abbreviation = prompt('Add meg az Emmet rövidítést (pl. div, ul>li*, ol>li*, .container):', 'div');
  if (!abbreviation) return;
  const lines = selectedText.split('\n').filter(line => line.trim() !== '');

  let wrappedText;

  // ul>li* vagy ol>li* minta: minden sor külön elembe (külső wrapper-rel)
  const wrapEachMatch = abbreviation.match(/^([a-zA-Z][\w.-]*(?:#[a-zA-Z0-9_-]+)?(?:\.[a-zA-Z0-9_-]+)*)>([a-zA-Z][\w.-]*(?:#[a-zA-Z0-9_-]+)?(?:\.[a-zA-Z0-9_-]+)*)\*$/);

  // p* vagy div* minta: minden sor külön elembe (wrapper NÉLKÜL)
  const wrapEachSimpleMatch = abbreviation.match(/^([a-zA-Z][\w.-]*(?:#[a-zA-Z0-9_-]+)?(?:\.[a-zA-Z0-9_-]+)*)\*$/);

  if (wrapEachMatch) {
    // pl. ul>li* vagy ol.list>li.item*
    const outerParsed = parseTagAbbr(wrapEachMatch[1]);
    const innerParsed = parseTagAbbr(wrapEachMatch[2]);

    const innerItems = lines.map(line => {
      return `  ${buildTag(innerParsed, line.trim())}`;
    }).join('\n');

    wrappedText = buildTag(outerParsed, '\n' + innerItems + '\n', '');

  } else if (wrapEachSimpleMatch) {
    // pl. p* vagy div.item* - minden sor külön elembe, wrapper NÉLKÜL
    const parsed = parseTagAbbr(wrapEachSimpleMatch[1]);

    wrappedText = lines.map(line => {
      return buildTag(parsed, line.trim());
    }).join('\n');

  } else if (abbreviation.includes('>')) {
    // Egyszerű beágyazás: div>p - a teljes szöveg a belső elembe kerül
    const parts = abbreviation.split('>');
    let content = selectedText;

    // Belülről kifelé építjük
    for (let i = parts.length - 1; i >= 0; i--) {
      const parsed = parseTagAbbr(parts[i]);
      content = buildTag(parsed, content, '');
    }
    wrappedText = content;

  } else {
    // Egyszerű wrap: div, .container, stb.
    const parsed = parseTagAbbr(abbreviation);
    wrappedText = buildTag(parsed, selectedText, '');
  }

  editor.executeEdits('wrap-with-abbreviation', [{
    range: selection,
    text: wrappedText,
    forceMoveMarkers: true
  }]);
}

// Wrap gomb kezelése
function handleWrapButton() {
  // Az aktív editort használjuk
  const activeEditor = htmlEditorWrapper.classList.contains('active') ? htmlEditor : cssEditor;
  if (activeEditor) {
    wrapWithAbbreviation(activeEditor, window.monaco);
  }
}



// Feladat választó feltöltése
function populateTaskSelector() {
  Object.values(availableTasks).forEach(task => {
    const option = document.createElement('option');
    option.value = task.id;
    option.textContent = task.name;
    taskSelector.appendChild(option);
  });
}

// Tanuló adatok kezelése
function loadStudentData() {
  const saved = localStorage.getItem('vizsga_student');
  if (saved) {
    try {
      studentData = JSON.parse(saved);
      updateStudentDisplay();
      return true;
    } catch (e) {
      return false;
    }
  }
  return false;
}

function saveStudentData() {
  localStorage.setItem('vizsga_student', JSON.stringify(studentData));
}

function updateStudentDisplay() {
  if (studentData.name && studentData.class) {
    const emailDisplay = studentData.email ? ` - ${studentData.email}` : '';
    studentInfo.textContent = `${studentData.name} (${studentData.class})${emailDisplay}`;
  } else {
    studentInfo.textContent = '';
  }
}

function logoutStudent() {
  if (!confirm('Biztosan kijelentkezel? A munkád mentve marad, de másik tanuló is bejelentkezhet.')) {
    return;
  }

  // Időzítő leállítása
  stopTimer();

  // Tanuló adatok törlése (csak a session-ből, nem a localStorage-ből!)
  localStorage.removeItem('vizsga_student');
  studentData = { name: '', email: '', class: '' };
  updateStudentDisplay();

  // Form mezők ürítése
  studentNameInput.value = '';
  studentEmailInput.value = '';
  studentClassYearSelect.value = '';
  studentClassLetterSelect.value = '';

  // Időzítő visszaállítása alapértelmezettre
  timerSeconds = 60 * 60;
  updateTimerDisplay();

  // Feladat és editorok ürítése
  taskSelector.value = '';
  taskSelector.disabled = true;
  if (htmlEditor) htmlEditor.setValue('');
  if (cssEditor) cssEditor.setValue('');
  preview.srcdoc = '';
  taskList.innerHTML = '';
  currentTask = null;

  // Gombok letiltása
  btnTaskDesc.disabled = true;
  btnStarter.disabled = true;
  btnSampleImg.disabled = true;
  btnSources.disabled = true;
  btnPreviewNewTab.disabled = true;
  btnSaveFile.disabled = true;
  document.getElementById('btn-html-val-img').disabled = true;
  document.getElementById('btn-css-val-img').disabled = true;

  // Progress bar nullázása
  updateProgressBar(0, 0);

  // Modal megjelenítése
  showStudentModal();
  statusEl.textContent = 'Válassz feladatot a kezdéshez…';
}

function showStudentModal() {
  studentModal.classList.remove('hidden');
  studentNameInput.focus();
}

function hideStudentModal() {
  studentModal.classList.add('hidden');
}

function handleStudentFormSubmit(e) {
  e.preventDefault();

  const name = studentNameInput.value.trim();
  const email = studentEmailInput.value.trim();
  const classYear = studentClassYearSelect.value;
  const classLetter = studentClassLetterSelect.value;

  if (!name) {
    alert('Kérlek add meg a neved!');
    studentNameInput.focus();
    return;
  }

  if (!email) {
    alert('Kérlek add meg a KANDÓS email címed!');
    studentEmailInput.focus();
    return;
  }

  if (!classYear || !classLetter) {
    alert('Kérlek válaszd ki az osztályodat!');
    return;
  }

  const studentClass = `${classYear}.${classLetter}`;
  const fullEmail = `${email}@kkszki.hu`;

  studentData.name = name;
  studentData.email = fullEmail;
  studentData.class = studentClass;
  saveStudentData();
  updateStudentDisplay();
  hideStudentModal();

  // Időzítő visszaállítása az adott tanuló számára
  restoreTimer();
  updateTimerDisplay();

  // Engedélyezzük a feladat választót
  taskSelector.disabled = false;
}

// Időzítő funkciók
function getTimerStorageKey() {
  const studentKey = getStudentKey();
  if (!studentKey) return null;
  return `vizsga_${studentKey}_timer`;
}

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function updateTimerDisplay() {
  timerEl.textContent = formatTime(timerSeconds);

  // Színezés az idő alapján
  timerEl.classList.remove('warning', 'danger');
  if (timerSeconds <= 300) { // 5 perc alatt
    timerEl.classList.add('danger');
  } else if (timerSeconds <= 600) { // 10 perc alatt
    timerEl.classList.add('warning');
  }
}

function startTimer() {
  if (timerRunning) return;
  timerRunning = true;
  btnTimerToggle.textContent = '⏸';
  btnTimerToggle.classList.add('running');

  timerInterval = setInterval(() => {
    if (timerSeconds > 0) {
      timerSeconds--;
      updateTimerDisplay();
      // Mentés localStorage-be - tanuló-specifikus kulccsal
      const timerKey = getTimerStorageKey();
      if (timerKey) {
        localStorage.setItem(timerKey, timerSeconds.toString());
      }
    } else {
      stopTimer();
      alert('Az idő lejárt! Mentsd el a munkádat!');
    }
  }, 1000);
}

function stopTimer() {
  timerRunning = false;
  btnTimerToggle.textContent = '▶';
  btnTimerToggle.classList.remove('running');
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
}

function toggleTimer() {
  if (timerRunning) {
    stopTimer();
  } else {
    startTimer();
  }
}

function resetTimer() {
  stopTimer();
  timerSeconds = 60 * 60;
  updateTimerDisplay();
  const timerKey = getTimerStorageKey();
  if (timerKey) {
    localStorage.removeItem(timerKey);
  }
}

// Időzítő visszaállítása localStorage-ből - tanuló-specifikus
function restoreTimer() {
  const timerKey = getTimerStorageKey();
  if (!timerKey) return;

  const saved = localStorage.getItem(timerKey);
  if (saved) {
    timerSeconds = parseInt(saved, 10);
    updateTimerDisplay();
  }
}

// Validálás képek betöltése
function loadValidationImage(type, file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      validationImages[type] = e.target.result;
      validationImages[`${type}FileName`] = file.name;
      statusEl.textContent = `${type.toUpperCase()} validálás kép betöltve: ${file.name}`;
      resolve();
      updatePreview(); // ← ez frissíti a feladatlistát
    };
    reader.readAsDataURL(file);
  });
}

// Fájl mentés/betöltés funkciók
function saveToFile() {
  if (!currentTask || !htmlEditor || !cssEditor) return;

  const nameParts = studentData.name.trim().split(/\s+/);
  const lastName = nameParts[0] || '';
  const firstName = nameParts.slice(1).join('_') || '';
  const safeLast = lastName.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '');
  const safeFirst = firstName.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9_]/g, '');
  const [classYear, classLetter] = studentData.class.split('.');
  const safeEmail = studentData.email
    .replace('@kkszki.hu', '')
    .toLowerCase()
    .replace(/[^a-z0-9.]/g, '');
  const filename = `${safeLast}_${safeFirst}_${classYear}_${classLetter}_${safeEmail}_web.json`;

  const data = {
    studentName: studentData.name,
    studentEmail: studentData.email,
    studentClass: studentData.class,
    taskId: currentTask.id,
    taskName: currentTask.name,
    html: htmlEditor.getValue(),
    css: cssEditor.getValue(),
    timerSeconds: timerSeconds,
    savedAt: new Date().toISOString(),
    validationImages: {
      html: validationImages.html,
      htmlFileName: validationImages.htmlFileName,
      css: validationImages.css,
      cssFileName: validationImages.cssFileName,
    }
  };
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  statusEl.textContent = 'Munka mentve fájlba!';
}

function loadFromFile(file) {
  const reader = new FileReader();

  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result);

      // Ellenőrizzük, hogy valid-e a fájl
      if (!data.taskId || !data.html) {
        alert('Érvénytelen mentés fájl!');
        return;
      }

      // Tanuló adatok visszaállítása ha vannak
      if (data.studentName && data.studentClass) {
        studentData.name = data.studentName;
        studentData.email = data.studentEmail || '';
        studentData.class = data.studentClass;
        saveStudentData();
        updateStudentDisplay();
        hideStudentModal();
        taskSelector.disabled = false;
      }

      // Ha más feladat van kiválasztva, váltsunk
      if (!currentTask || currentTask.id !== data.taskId) {
        taskSelector.value = data.taskId;
        selectTask(data.taskId);
      }

      // Betöltjük az adatokat
      setTimeout(() => {
        if (htmlEditor) htmlEditor.setValue(data.html || '');
        if (cssEditor) cssEditor.setValue(data.css || '');

        // Validálás képek visszaállítása
        if (data.validationImages) {
          if (data.validationImages.html) {
            validationImages.html = data.validationImages.html;
            validationImages.htmlFileName = data.validationImages.htmlFileName;
          }
          if (data.validationImages.css) {
            validationImages.css = data.validationImages.css;
            validationImages.cssFileName = data.validationImages.cssFileName;
          }
        }
        
         // Időzítő visszaállítása
          if (data.timerSeconds !== undefined) {
            timerSeconds = data.timerSeconds;
            updateTimerDisplay();
          }
        
          updatePreview();
          statusEl.textContent = `Munka betöltve (mentve: ${new Date(data.savedAt).toLocaleString('hu-HU')})`;
        }, 100);

    } catch (err) {
      alert('Hiba a fájl beolvasásakor: ' + err.message);
    }
  };

  reader.readAsText(file);
}

// Új lapon megnyitás funkciók
function openTaskDesc() {
  if (!currentTask) return;
  window.open(currentTask.basePath + currentTask.taskDescFile, '_blank');
}

function openSampleImg() {
  if (!currentTask || !currentTask.sampleImage) return;
  window.open(currentTask.basePath + currentTask.sampleImage, '_blank');
}

function openSources() {
  if (!currentTask || !currentTask.sourceFiles) return;
  // Források oldal megnyitása új lapon
  const sourcesWindow = window.open('', '_blank');
  sourcesWindow.document.write(`
<!DOCTYPE html>
<html lang="hu">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Források - ${currentTask.name}</title>
  <style>
    * { box-sizing: border-box; }
    body {
      font-family: "Segoe UI", Tahoma, sans-serif;
      background: #0f172a;
      color: #e2e8f0;
      margin: 0;
      padding: 20px;
      line-height: 1.6;
    }
    h1 { color: #a78bfa; margin-bottom: 24px; }
    .source-block {
      background: #1e293b;
      border: 1px solid #334155;
      border-radius: 12px;
      padding: 20px;
      margin-bottom: 20px;
    }
    .source-block h2 {
      color: #60a5fa;
      margin: 0 0 12px 0;
      font-size: 1.1rem;
    }
    .source-text {
      background: #0f172a;
      padding: 16px;
      border-radius: 8px;
      white-space: pre-wrap;
      word-break: break-word;
      font-family: monospace;
      font-size: 0.95rem;
      line-height: 1.8;
      cursor: pointer;
      border: 2px solid #334155;
      transition: all 0.2s;
      margin: 0;
    }
    .source-text:hover {
      border-color: #60a5fa;
      background: #1e293b;
    }
    .source-text.copied {
      border-color: #22c55e;
      background: rgba(34, 197, 94, 0.1);
    }
    small {
      display: block;
      margin-top: 8px;
      color: #94a3b8;
    }
    .back-link {
      display: inline-block;
      margin-bottom: 20px;
      color: #60a5fa;
      text-decoration: none;
    }
    .back-link:hover { text-decoration: underline; }
  </style>
</head>
<body>
  <h1>Források - ${currentTask.name}</h1>
  <div id="sources">Betöltés...</div>
  <script>
    async function loadSources() {
      const files = ${JSON.stringify(currentTask.sourceFiles)};
      const basePath = "${currentTask.basePath}";
      let html = '';

      for (const file of files) {
        try {
          const response = await fetch(basePath + file.name);
          if (response.ok) {
            const text = await response.text();
            html += \`
              <div class="source-block">
                <h2>\${file.label}</h2>
                <pre class="source-text" onclick="copyText(this)">\${escapeHtml(text)}</pre>
                <small>Kattints a szövegre a másoláshoz!</small>
              </div>
            \`;
          }
        } catch (e) {
          html += '<div class="source-block"><h2>' + file.label + '</h2><p>Hiba a betöltéskor</p></div>';
        }
      }
      document.getElementById('sources').innerHTML = html;
    }

    function escapeHtml(text) {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    }

    function copyText(el) {
      navigator.clipboard.writeText(el.textContent).then(() => {
        el.classList.add('copied');
        setTimeout(() => el.classList.remove('copied'), 1000);
      });
    }

    loadSources();
  </script>
</body>
</html>
  `);
  sourcesWindow.document.close();
}

// Előnézet új lapon megnyitása
function openPreviewInNewTab() {
  if (!htmlEditor || !cssEditor) return;

  const html = htmlEditor.getValue();
  const css = cssEditor.getValue();
  const baseHref = currentTask ? currentTask.previewBase : "";

  const bootstrapCSS = currentTask
    ? `<link href="${baseHref}bootstrap/bootstrap.min.css" rel="stylesheet" />`
    : `<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet" />`;

  const bootstrapJS = currentTask
    ? `<script src="${baseHref}bootstrap/bootstrap.bundle.min.js"><\/script>`
    : `<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"><\/script>`;

  const fullHtml = `<!doctype html>
<html lang="hu">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <base href="${baseHref}" />
    ${bootstrapCSS}
    <style>${css}</style>
  </head>
  <body>
    ${html}
    ${bootstrapJS}
  </body>
</html>`;

  const previewWindow = window.open('', '_blank');
  previewWindow.document.write(fullHtml);
  previewWindow.document.close();
}

// A tanuló HTML kódját parse-olja (nem a wrapper-t)
function parseStudentHtml(htmlString) {
  const parser = new DOMParser();
  // Teljes HTML dokumentumként parse-oljuk
  const doc = parser.parseFromString(htmlString, 'text/html');
  return doc;
}

// Event listeners
preview.addEventListener("load", () => {
  if (!currentTask || !currentTask.checks) {
    statusEl.textContent = `Frissítve: ${new Date().toLocaleTimeString("hu-HU")}`;
    return;
  }

  // A tanuló által beírt nyers HTML-t és CSS-t használjuk az ellenőrzéshez
  const studentHtml = htmlEditor ? htmlEditor.getValue() : '';
  const studentCss = cssEditor ? cssEditor.getValue() : '';
  const studentDoc = parseStudentHtml(studentHtml);

  const results = currentTask.checks.map((task) => ({
    id: task.id,
    label: task.label,
    done: task.check(studentDoc, studentHtml, studentCss),
  }));

  renderTasks(results);

  const completed = results.filter(r => r.done).length;
  const total = results.length;
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

  statusEl.textContent = `Frissítve: ${new Date().toLocaleTimeString("hu-HU")} | ${completed}/${total} feladat (${percent}%)`;

  // Progress bar frissítése
  updateProgressBar(completed, total);

  syncActivePreviewBlock();
});

window.addEventListener("message", (event) => {
  if (!event || event.source !== preview.contentWindow || !event.data) return;
  if (event.data.type !== "preview-line") return;
  const line = Number(event.data.line || 1);
  jumpToSourceLine(line);
});

taskSelector.addEventListener("change", (e) => {
  selectTask(e.target.value);
});

// Új lapon megnyitás eseménykezelők
btnTaskDesc.addEventListener("click", openTaskDesc);
btnSampleImg.addEventListener("click", openSampleImg);
btnSources.addEventListener("click", openSources);
btnPreviewNewTab.addEventListener("click", openPreviewInNewTab);

// Időzítő eseménykezelők
btnTimerToggle.addEventListener("click", toggleTimer);
btnTimerReset.addEventListener("click", () => {
  if (confirm('Biztosan visszaállítod az időzítőt 60 percre?')) {
    resetTimer();
  }
});

// Fájl mentés/betöltés eseménykezelők
btnSaveFile.addEventListener("click", saveToFile);
btnLoadFile.addEventListener("click", () => fileInput.click());
fileInput.addEventListener("change", (e) => {
  if (e.target.files.length > 0) {
    loadFromFile(e.target.files[0]);
    fileInput.value = ''; // Reset input
  }
});

// Tanuló form eseménykezelő
studentForm.addEventListener("submit", handleStudentFormSubmit);

// Kijelentkezés gomb
btnLogout.addEventListener("click", logoutStudent);

// Validálás képek eseménykezelők
document.getElementById('btn-html-val-img').addEventListener('click', () => {
  document.getElementById('html-validation-img').click();
});
document.getElementById('btn-css-val-img').addEventListener('click', () => {
  document.getElementById('css-validation-img').click();
});
document.getElementById('html-validation-img').addEventListener('change', async (e) => {
  if (e.target.files[0]) await loadValidationImage('html', e.target.files[0]);
});
document.getElementById('css-validation-img').addEventListener('change', async (e) => {
  if (e.target.files[0]) await loadValidationImage('css', e.target.files[0]);
});

btnStarter.addEventListener("click", async () => {
  if (!currentTask || !htmlEditor || !cssEditor) return;

  const confirmed = confirm("Biztosan betöltöd a kiindulási fájlokat? A jelenlegi munkád felülíródik!");
  if (!confirmed) return;

  statusEl.textContent = 'Kiindulási fájlok betöltése…';
  const files = await loadTaskFiles(currentTask);

  if (files) {
    htmlEditor.setValue(files.html);
    cssEditor.setValue(files.css);
    statusEl.textContent = 'Kiindulási fájlok betöltve';
    updatePreview();
  }
});

btnBlocks.addEventListener("click", () => {
  showBlockGuides = !showBlockGuides;
  btnBlocks.classList.toggle("is-active", showBlockGuides);
  updatePreview();
});

btnInteract.addEventListener("click", () => {
  lockPreviewInteractions = !lockPreviewInteractions;
  const isEnabled = !lockPreviewInteractions;
  btnInteract.classList.toggle("is-active", isEnabled);
  updatePreview();
});

// Tab váltás HTML/CSS/CSS Validator között
function switchToTab(tab) {
  // Editor fülek inaktív
  tabHtml.classList.remove('active');
  tabCss.classList.remove('active');
  tabCssValidator.classList.remove('active');

  // Minden wrapper elrejtése
  htmlEditorWrapper.classList.remove('active');
  cssEditorWrapper.classList.remove('active');

  // Kiválasztott tab aktiválása
  switch (tab) {
    case 'html':
      tabHtml.classList.add('active');
      htmlEditorWrapper.classList.add('active');
      setTimeout(() => {
        if (htmlEditor) htmlEditor.layout();
      }, 10);
      break;
    case 'css':
      tabCss.classList.add('active');
      cssEditorWrapper.classList.add('active');
      setTimeout(() => {
        if (cssEditor) cssEditor.layout();
      }, 10);
      break;
  }
}

tabHtml.addEventListener('click', () => switchToTab('html'));
tabCss.addEventListener('click', () => switchToTab('css'));
tabCssValidator.addEventListener('click', () => {
  window.open('https://jigsaw.w3.org/css-validator/#validate_by_input', '_blank');
});

// Külső linkek új lapon
btnW3schools.addEventListener('click', () => {
  window.open('https://www.w3schools.com/html/default.asp', '_blank');
});
btnHtmlValidator.addEventListener('click', () => {
  window.open('https://validator.w3.org/#validate_by_input', '_blank');
});

// Feladatok szekció összecsukása
btnToggleTasks.addEventListener('click', () => {
  tasksSection.classList.toggle('collapsed');
  // Monaco editor újraméretezése
  setTimeout(() => {
    if (htmlEditor) htmlEditor.layout();
    if (cssEditor) cssEditor.layout();
  }, 50);
});

(async function init() {
  try {
    statusEl.textContent = "Monaco inicializálása...";
    const monaco = await loadMonaco();

    monaco.editor.defineTheme("vizsga-contrast", {
      base: "vs-dark",
      inherit: true,
      semanticHighlighting: false,
      rules: [
        { token: "tag", foreground: "4FC1FF", fontStyle: "bold" },
        { token: "tag.html", foreground: "4FC1FF", fontStyle: "bold" },
        { token: "delimiter", foreground: "ABB2BF" },
        { token: "delimiter.html", foreground: "ABB2BF" },
        { token: "attribute.name", foreground: "FFD580" },
        { token: "attribute.name.html", foreground: "FFD580" },
        { token: "attribute.value", foreground: "A8E6A3" },
        { token: "attribute.value.html", foreground: "A8E6A3" },
        { token: "string", foreground: "A8E6A3" },
        { token: "string.html", foreground: "A8E6A3" },
        { token: "comment", foreground: "7F8C98", fontStyle: "italic" },
        { token: "comment.html", foreground: "7F8C98", fontStyle: "italic" },
      ],
      colors: {
        "editor.background": "#0B1220",
        "editor.foreground": "#D5DFEE",
        "editorLineNumber.foreground": "#6B7A90",
        "editorLineNumber.activeForeground": "#C7D2E1",
        "editorCursor.foreground": "#F59E0B",
        "editor.selectionBackground": "#26406599",
        "editor.lineHighlightBackground": "#1E293B55",
      },
    });
    monaco.editor.setTheme("vizsga-contrast");

    htmlEditor = createEditor(monaco, "html-editor", "html", "");
    cssEditor = createEditor(monaco, "css-editor", "css", "");

    activateEmmet(monaco);

    // Auto Close Tag beállítása
    setupAutoCloseTag(htmlEditor, monaco);

    // Wrap gomb eseménykezelő
    btnWrap.addEventListener('click', handleWrapButton);

    // Formáz gomb eseménykezelő
    document.getElementById('btn-format').addEventListener('click', () => {
      const activeEditor = htmlEditorWrapper.classList.contains('active') ? htmlEditor : cssEditor;
      if (activeEditor) {
        activeEditor.getAction('editor.action.formatDocument').run();
      }
    });

    htmlEditor.onDidChangeModelContent(scheduleUpdate);
    htmlEditor.onDidChangeCursorPosition(syncActivePreviewBlock);
    cssEditor.onDidChangeModelContent(scheduleUpdate);

    // Feladat választó feltöltése
    populateTaskSelector();

    // Időzítő kijelző inicializálása (alapértelmezett 60 perc)
    updateTimerDisplay();

    // Tanuló adatok ellenőrzése
    if (loadStudentData()) {
      // Van mentett tanuló adat
      hideStudentModal();
      taskSelector.disabled = false;
      // Időzítő visszaállítása az adott tanuló számára
      restoreTimer();
      updateTimerDisplay();
    } else {
      // Nincs mentett adat - modal megjelenítése
      showStudentModal();
      taskSelector.disabled = true;
    }

    statusEl.textContent = "Válassz feladatot a kezdéshez…";
  } catch (error) {
    console.error(error);
    statusEl.textContent = "Editor hiba (Monaco/nyelvi modul). Nézd meg a konzolt.";
  }
})();
