// Auth ellenőrzés – ha nincs bejelentkezve, vissza a loginra
if (!sessionStorage.getItem('kandoUser')) {
    location.replace('../login.html');
}

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
const descFrame = document.getElementById("task-desc-frame");
const progressBar = document.getElementById("progress-bar");
const scoreCurrent = document.getElementById("score-current");
const scoreTotal = document.getElementById("score-total");

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
          const hasUtf8 = meta && meta.getAttribute('charset').trim().toLowerCase() === 'utf-8';
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
          const img = doc.querySelector('img[src*="img/fejlec"]');
          return img !== null;
        },
      },
      {
        id: "fejlec-alt",
        label: "5. Ha nem jeleníthető meg a kép vagy ha az egeret felé visszük a \"Bogyós gyümölcsök\" szöveg jelenik meg",
        check: (doc) => {
          const img = doc.querySelector('img[src*="img/fejlec"]');
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
          const img = doc.querySelector('img[src*="img/afonya"]');
          return img !== null;
        },
      },
      {
        id: "afonya-alt",
        label: "19. Ha nem jeleníthető meg a kép vagy ha az egeret felé visszük a \"Áfonya\" szöveg jelenik meg",
        check: (doc) => {
          const img = doc.querySelector('img[src*="img/afonya"]');
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
        label: "21. \"A málna jótékony hatásai:\" bekezdés alatti szövegből számozatlan felsorolást készített",
        check: (doc) => {
          const uls = doc.querySelectorAll('ul:not(.navbar-nav):not(.nav)');
          return Array.from(uls).some(ul => ul.querySelectorAll('li').length > 0);
        },
      },
      {
        id: "malna-list-id",
        label: "22. A számozatlan felsorolásra alkalmazta a \"malna\" egyedi azonosítót",
        check: (doc) => {
          return doc.querySelector('ul#malna') !== null && doc.querySelector('ul#malna li') !== null;
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

humanoid: {
  id: "humanoid",
  name: "Humanoid robotok",
  description: "Weboldal kódolása - Humanoid robotok",
  basePath: "forrasok/humanoid/",
  htmlFile: "humanoid.html",
  cssFile: "css/style.css",
  taskDescFile: "weboldal_kodolas_humanoid_robotok.html",
  previewBase: "forrasok/humanoid/",
  sampleImage: "humanoid_robotok.png",
  sourceFiles: [
    { name: "forras.txt", label: "Ameca szöveg (forras.txt)" },
    { name: "tablazat.txt", label: "Táblázat sorok (tablazat.txt)" }
  ],
  checks: [
    {
      id: "lang-charset",
      label: "1. Weboldal nyelve magyar, karakterkódolása UTF-8",
      check: (doc) => {
        const meta = doc.querySelector('meta[charset]');
        const hasUtf8 = meta && meta.getAttribute('charset').trim().toLowerCase() === 'utf-8';
        return doc.documentElement.lang === "hu" && hasUtf8;
      },
    },
    {
      id: "style-link",
      label: "2. Hivatkozást helyezett el a css mappában található style.css stíluslapra",
      check: (doc, html) => /href=["'][^"']*style\.css["']/i.test(html),
    },
    {
      id: "title",
      label: "3. Böngésző címsorában megjelenő cím \"Humanoid robotok\"",
      check: (doc) => doc.title === "Humanoid robotok",
    },
    {
      id: "h1-felirat",
      label: "4. A \"Humanoid robotok\" bekezdés 1-es szintű címsor",
      check: (doc) => {
        const h1 = doc.querySelector('h1');
        return h1 && h1.textContent.includes('Humanoid');
      },
    },
    {
      id: "fejlec-img",
      label: "5. Az img mappában található fejlec.jpg képet a megfelelő helyre helyezte",
      check: (doc) => doc.querySelector('img[src*="img/fejlec"]') !== null,
    },
    {
      id: "fejlec-alt",
      label: "6. Ha nem jeleníthető meg a kép vagy ha az egeret felé visszük a \"Humanoid robot\" szöveg jelenik meg",
      check: (doc) => {
        const img = doc.querySelector('img[src*="img/fejlec"]');
        return img && img.alt === "Humanoid robot" && img.title === "Humanoid robot";
      },
    },
    {
      id: "fejlec-id",
      label: "7. A képre alkalmazta a \"fejlec\" egyedi azonosítót",
      check: (doc) => doc.querySelector('img#fejlec') !== null,
    },
    {
      id: "nav-link",
      label: "8. Elkészítette a menüpontot és jó oldalra hivatkozik",
      check: (doc) => {
        const links = doc.querySelectorAll('nav a');
        return Array.from(links).some(a =>
          a.textContent.toLowerCase().includes('humanoid robot') &&
          a.href.includes('netliferobotics.hu')
        );
      },
    },
    {
      id: "nav-link-blank",
      label: "9. A linkre kattintva a tartalom új lapon jelenik meg",
      check: (doc) => {
        const links = doc.querySelectorAll('nav a');
        return Array.from(links).some(a =>
          a.href.includes('netliferobotics.hu') && a.target === '_blank'
        );
      },
    },
    {
      id: "asimo-italic",
      label: "10. A zárójelben lévő angol kifejezés dőlt",
      check: (doc) => {
        const italics = doc.querySelectorAll('i, em');
        return Array.from(italics).some(i => i.textContent.includes('Advanced Step'));
      },
    },
    {
      id: "pepper-underline",
      label: "11. A \"Fizikai felépítése:\" szöveg aláhúzott",
      check: (doc) => {
        const us = doc.querySelectorAll('u');
        return Array.from(us).some(u => u.textContent.includes('Fizikai'));
      },
    },
    {
      id: "pepper-list",
      label: "12. Számozatlan felsorolást készített",
      check: (doc) => {
        const ul = doc.querySelector('ul#robotikon');
        if (!ul) return false;
        return ul.querySelectorAll('li').length > 0;
      },
    },
    {
      id: "pepper-list-id",
      label: "13. A számozatlan felsorolásra alkalmazta a \"robotikon\" egyedi azonosítót",
      check: (doc) => doc.querySelector('ul#robotikon') !== null && doc.querySelector('ul#robotikon li') !== null,
    },
    {
      id: "ameca-h2",
      label: "14. Az Ameca címsort kettes szintűvé alakította (h2)",
      check: (doc) => {
        const h2s = doc.querySelectorAll('h2');
        return Array.from(h2s).some(h => h.textContent.includes('Ameca'));
      },
    },
    {
      id: "ameca-paragraphs",
      label: "15. Az Ameca részben bekezdéseket készített",
      check: (doc) => {
        const h2s = doc.querySelectorAll('h2');
        const ameca = Array.from(h2s).find(h => h.textContent.includes('Ameca'));
        if (!ameca) return false;
        const container = ameca.closest('div');
        if (!container) return false;
        return container.querySelectorAll('p:not(.card-text)').length >= 2;
      },
    },
    {
      id: "ameca-img",
      label: "16. A kép forrása az img mappában található ameca.jpg",
      check: (doc) => doc.querySelector('img[src*="img/ameca"]') !== null,
    },
    {
      id: "ameca-alt",
      label: "17. Ha nem jeleníthető meg a kép vagy ha az egeret felé visszük a \"Ameca\" szöveg jelenik meg",
      check: (doc) => {
        const img = doc.querySelector('img[src*="img/ameca"]');
        return img && img.alt === "Ameca" && img.title === "Ameca";
      },
    },
    {
      id: "bold-5places",
      label: "18. A robot neveket tag segítségével félkövérrá tette 6 helyen",
      check: (doc) => {
        const bolds = doc.querySelectorAll('b, strong');
        return bolds.length >= 6;
      },
    },
    {
      id: "caption-classes",
      label: "19. A képaláírásoknál bootstrap stílus segítségével középre helyezte és félkövérré tette a szöveget (6 helyen)",
      check: (doc) => {
        const captions = doc.querySelectorAll('.fw-bold.text-center, .card-text.fw-bold');
        return captions.length >= 6;
      },
    },
    {
      id: "table-rows",
      label: "20. A táblázat törzsébe elkészítette a hiányzó sorokat és cellákat",
      check: (doc) => {
        const rows = doc.querySelectorAll('tbody tr');
        return rows.length >= 3;
      },
    },
    {
      id: "table-bordered",
      label: "21. A táblázatra alkalmazta a table és table-bordered osztályokat",
      check: (doc) => doc.querySelector('table.table.table-bordered') !== null,
    },
    {
      id: "uncanny-col-lg-6",
      label: "22. Az Uncanny valley részben az oszlopelrendezést nagyméretű kijelzőknél fele-fele osztásra állította",
      check: (doc) => {
        const uncanny = doc.querySelector('#uncanny');
        if (!uncanny) return false;
        return uncanny.querySelectorAll('.col-lg-6').length >= 2;
      },
    },
    {
      id: "uncanny-img-classes",
      label: "23. A képet bootstrap stílus segítségével középre helyezte",
      check: (doc) => {
        const uncanny = doc.querySelector('#uncanny');
        if (!uncanny) return false;
        const img = uncanny.querySelector('img.d-block.mx-auto, img.mx-auto.d-block');
        return img !== null;
      },
    },
    {
      id: "footer-link",
      label: "24. A láblécben a hivatkozás a \"leiras\" azonosítóra ugrik, szövege \"Ugrás az elejére\"",
      check: (doc) => {
        const link = doc.querySelector('.lablec a[href="#leiras"]');
        return link && link.textContent.includes('Ugrás az elejére');
      },
    },
    // CSS feladatok
    {
      id: "css-body-font",
      label: "25. CSS: Az oldal betűtípusa Rubik",
      check: (doc, html, css) => css && /body\s*\{[^}]*font-family\s*:\s*[^;]*rubik/i.test(css),
      cssCheck: true,
    },
    {
      id: "css-fejlec-width",
      label: "26. CSS: A fejlec egyedi azonosítójú elemkijelölő szélessége 100%",
      check: (doc, html, css) => css && /#fejlec\s*\{[^}]*width\s*:\s*100%/i.test(css),
      cssCheck: true,
    },
    {
      id: "css-felirat-smallcaps",
      label: "27. CSS: A felirat egyedi azonosítójú elemkijelölőre kiskapitális betűt állított",
      check: (doc, html, css) => css && /#felirat\s*\{[^}]*font-variant\s*:\s*small-caps/i.test(css),
      cssCheck: true,
    },
    {
      id: "css-nav-border",
      label: "28. CSS: A navigáció listaelemére 3 képpont vastag, pontozott vonalú, cadetblue színű jobb oldali szegélyt állított",
      check: (doc, html, css) => css && /nav\s+li\s*\{[^}]*(border(-right)?\s*:[^;]*3px[^;]*dotted[^;]*cadetblue|border-right\s*:[^;]*3px[^;]*dotted[^;]*cadetblue)/i.test(css),
      cssCheck: true,
    },
    {
      id: "css-nav-padding",
      label: "29. CSS: A navigáció listaelemének belső margójára vízszintesen 0, függőlegesen 15 képpontot állított",
      check: (doc, html, css) => css && /nav\s+li\s*\{[^}]*padding\s*:\s*15px\s*0/i.test(css),
      cssCheck: true,
    },
    {
      id: "css-robot-bg",
      label: "30. CSS: A robot osztály elemkijelölőjére (#f0ffff) kódú háttérszínt állított",
      check: (doc, html, css) => css && /\.robot\s*\{[^}]*background(-color)?\s*:\s*(azure|#f0ffff)/i.test(css),
      cssCheck: true,
    },
    {
      id: "css-lablec-link-color",
      label: "31. CSS: A lablec osztály hivatkozásának betűszíne rgb(13,202,240)",
      check: (doc, html, css) => css && /\.lablec\s+a\s*\{[^}]*color\s*:\s*rgb\s*\(\s*13\s*,\s*202\s*,\s*240\s*\)/i.test(css),
      cssCheck: true,
    },
    {
      id: "css-lablec-link-bold",
      label: "32. CSS: A lablec osztály elemkijelölőjére félkövér stílust állított",
      check: (doc, html, css) => css && /\.lablec\s+a\s*\{[^}]*font-weight\s*:\s*bold/i.test(css),
      cssCheck: true,
    },
    {
      id: "css-lablec-link-nodecor",
      label: "33. CSS: A lablec osztály hivatkozásánál megszüntette az aláhúzást",
      check: (doc, html, css) => css && /\.lablec\s+a\s*\{[^}]*text-decoration\s*:\s*none/i.test(css),
      cssCheck: true,
    },
    {
      id: "css-lablec-hover",
      label: "34. CSS: Ha a lablec osztály hivatkozása felé visszük az egeret, akkor nagybetűs",
      check: (doc, html, css) => css && /\.lablec\s+a:hover\s*\{[^}]*text-transform\s*:\s*uppercase/i.test(css),
      cssCheck: true,
    },
    {
      id: "css-navbar-fontsize",
      label: "35. CSS: A navbar osztály betűméretét beállította, hogy 20%-kal nagyobb legyen mint az alapértelmezett",
      check: (doc, html, css) => css && /\.navbar\s*\{[^}]*font-size\s*:\s*1\.2em/i.test(css),
      cssCheck: true,
    },
    {
      id: "css-robotikon-image",
      label: "36. CSS: A robotikon egyedi azonosítójára beállította az img mappában található robot.jpg listaelem stílus képet",
      check: (doc, html, css) => css && /#robotikon\s*\{[^}]*list-style-image\s*:\s*url\([^)]*robot\.jpg/i.test(css),
      cssCheck: true,
    },
    {
      id: "css-robotikon-margin",
      label: "37. CSS: A robotikon egyedi azonosító bal oldali külső margójára 10 képpontot állított",
      check: (doc, html, css) => css && /#robotikon\s*\{[^}]*margin-left\s*:\s*10px/i.test(css),
      cssCheck: true,
    },
    {
      id: "css-p-justify",
      label: "38. CSS: Bekezdések sorkizártak",
      check: (doc, html, css) => css && /p\s*\{[^}]*text-align\s*:\s*justify/i.test(css),
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

baglyok: {
  id: "baglyok",
  name: "Baglyok",
  description: "Weboldal kódolása - Baglyok",
  basePath: "forrasok/baglyok/",
  htmlFile: "baglyok.html",
  cssFile: "css/style.css",
  taskDescFile: "weboldal_kodolas_baglyok.html",
  previewBase: "forrasok/baglyok/",
  sampleImage: "baglyok_weboldal.png",
  sourceFiles: [
    { name: "forras.txt", label: "Hóbagoly szöveg (forras.txt)" },
    { name: "tablazat.txt", label: "Táblázat fejléc (tablazat.txt)" }
  ],
  maxPoints: 40,
  checks: [
    {
      id: "lang-charset",
      label: "1. Weboldal nyelve magyar, karakterkódolása UTF-8",
      check: (doc) => {
        const meta = doc.querySelector('meta[charset]');
        const hasUtf8 = meta && meta.getAttribute('charset').trim().toLowerCase() === 'utf-8';
        return doc.documentElement.lang === "hu" && hasUtf8;
      },
    },
    {
      id: "title",
      label: "2. Böngésző címsorában megjelenő cím \"Baglyok\"",
      check: (doc) => doc.title === "Baglyok",
    },
    {
      id: "style-link",
      label: "3. Hivatkozást helyezett el a css mappában található style.css stíluslapra",
      check: (doc, html) => /href=["'][^"']*style\.css["']/i.test(html),
    },
    {
      id: "fejlec-img",
      label: "4. Az img mappában található fejlec.jpg képet elhelyezte",
      check: (doc) => doc.querySelector('img[src*="img/fejlec"]') !== null,
    },
    {
      id: "fejlec-alt-title",
      label: "5. A fejléc képnél alt és title szövege \"Baglyok\"",
      check: (doc) => {
        const img = doc.querySelector('img[src*="img/fejlec"]');
        return img && img.alt === "Baglyok" && img.title === "Baglyok";
      },
    },
    {
      id: "fejlec-id",
      label: "6. A fejléc képre egyedi azonosítót állított fejlec néven",
      check: (doc) => doc.querySelector('img#fejlec') !== null,
    },
    {
      id: "felirat-h1",
      label: "7. A \"Baglyok\" szöveg 1-es szintű címsor (h1)",
      check: (doc) => {
        const h1 = doc.querySelector('h1#felirat');
        return h1 !== null;
      },
    },
    {
      id: "nav-3rd-link",
      label: "8. Elkészítette a \"Rejtőzködő baglyok\" menüpontot és jó oldalra hivatkozik",
      check: (doc) => {
        const links = doc.querySelectorAll('nav a, .navbar a');
        return Array.from(links).some(a =>
          a.textContent.includes('Rejtőzk') &&
          a.href.includes('erdekesseg.hu')
        );
      },
    },
    {
      id: "nav-3rd-blank",
      label: "9. A \"Rejtőzködő baglyok\" link új lapon nyílik meg",
      check: (doc) => {
        const links = doc.querySelectorAll('nav a, .navbar a');
        return Array.from(links).some(a =>
          a.href.includes('erdekesseg.hu') && a.target === '_blank'
        );
      },
    },
    {
      id: "focim-uppercase",
      label: "10. A főcím \"Baglyok\" szövegre alkalmazza a text-uppercase osztályjelölőt",
      check: (doc) => {
        const focim = doc.querySelector('[id="főcím"]');
        if (focim) return focim.querySelector('span.text-uppercase') !== null;
        return doc.querySelectorAll('span.text-uppercase').length > 0;
      },
    },
    {
      id: "torpekuvik-paragraphs",
      label: "11. A Törpekuvik szövegrészei bekezdésbe kerültek (legalább 2 p)",
      check: (doc) => {
        const h2s = doc.querySelectorAll('h2');
        const torpekuvikH2 = Array.from(h2s).find(h => h.textContent.includes('Törpekuvik'));
        if (!torpekuvikH2) return false;
        const container = torpekuvikH2.closest('.col');
        if (!container) return false;
        const paragraphs = container.querySelectorAll('p:not(.card-text)');
        return paragraphs.length >= 2;
      },
    },
    {
      id: "torpekuvik-bold-italic",
      label: "12. A törpekuvik neve félkövér, latin neve dőlt",
      check: (doc) => {
        const bolds = doc.querySelectorAll('b, strong');
        const hasBold = Array.from(bolds).some(b => b.textContent.toLowerCase().includes('törpekuvik'));
        const italics = doc.querySelectorAll('i, em');
        const hasItalic = Array.from(italics).some(i => i.textContent.includes('Glaucidium'));
        return hasBold && hasItalic;
      },
    },
    {
      id: "fuleskuvik-bold-italic",
      label: "13. A füleskuvik neve félkövér, latin neve dőlt",
      check: (doc) => {
        const bolds = doc.querySelectorAll('b, strong');
        const hasBold = Array.from(bolds).some(b => b.textContent.toLowerCase().includes('füleskuvik'));
        const italics = doc.querySelectorAll('i, em');
        const hasItalic = Array.from(italics).some(i => i.textContent.includes('Otus scops'));
        return hasBold && hasItalic;
      },
    },
    {
      id: "fuleskuvik-kulonlegessege",
      label: "14. A Füleskuvik \"Különlegessége:\" szöveg aláhúzott",
      check: (doc) => {
        const underlines = doc.querySelectorAll('u');
        return Array.from(underlines).some(u => u.textContent.includes('Különlegessége'));
      },
    },
    {
      id: "fulesbagoly-ol",
      label: "15. Az Erdei fülesbagoly megjelenésének adatai számozott felsorolásban (ol)",
      check: (doc) => {
        const h2s = doc.querySelectorAll('h2');
        const fulesbH2 = Array.from(h2s).find(h => h.textContent.includes('Erdei fülesbagoly'));
        if (!fulesbH2) return false;
        const container = fulesbH2.closest('.col');
        if (!container) return false;
        const ol = container.querySelector('ol');
        return ol !== null && ol.querySelectorAll('li').length >= 3;
      },
    },
    {
      id: "uhu-ul-taplalek",
      label: "16. Az Uhu táplálékai számozatlan felsorolásban (ul#taplalek)",
      check: (doc) => {
        return doc.querySelector('ul#taplalek') !== null &&
          doc.querySelector('ul#taplalek li') !== null;
      },
    },
    {
      id: "hobagoly-h2",
      label: "17. A Hóbagoly részben van 2-es szintű címsor",
      check: (doc) => {
        const h2s = doc.querySelectorAll('h2');
        return Array.from(h2s).some(h => h.textContent.includes('Hóbagoly'));
      },
    },
    {
      id: "hobagoly-img",
      label: "18. A Hóbagoly kép forrása img/hobagoly.jpg",
      check: (doc) => {
        const img = doc.querySelector('img[src*="hobagoly"]');
        return img !== null && img.src.includes('hobagoly.jpg');
      },
    },
    {
      id: "hobagoly-bold-italic",
      label: "19. A hóbagoly neve félkövér, latin neve dőlt",
      check: (doc) => {
        const bolds = doc.querySelectorAll('b, strong');
        const hasBold = Array.from(bolds).some(b => b.textContent.toLowerCase().includes('hóbagoly'));
        const italics = doc.querySelectorAll('i, em');
        const hasItalic = Array.from(italics).some(i => i.textContent.includes('Bubo scandiacus'));
        return hasBold && hasItalic;
      },
    },
    {
      id: "table-th-headers",
      label: "20. A táblázat fejlécében elkészítette a 6 fejléc cellát",
      check: (doc) => {
        const ths = doc.querySelectorAll('thead th');
        return ths.length >= 6;
      },
    },
    {
      id: "table-bordered-center",
      label: "21. A táblázaton alkalmazza a table-bordered és text-center osztályjelölőket",
      check: (doc) => {
        const table = doc.querySelector('table');
        return table &&
          table.classList.contains('table-bordered') &&
          table.classList.contains('text-center');
      },
    },
    {
      id: "nokturn-col-md-6",
      label: "22. A Nokturnalitás részben mindkét oszlop col-md-6 méretű",
      check: (doc, html) => {
        const nokturn = doc.querySelector('#nokturn');
        if (!nokturn) return false;
        const cols = nokturn.querySelectorAll('[class*="col-md-6"]');
        return cols.length >= 2;
      },
    },
    {
      id: "footer-link",
      label: "23. A láblécben van hivatkozás a \"leiras\" azonosítóra \"Ugrás az elejére\" szöveggel",
      check: (doc) => {
        const link = doc.querySelector('.lablec a[href="#leiras"]');
        return link && link.textContent.includes('Ugrás az elejére');
      },
    },
    {
      id: "css-body-font",
      label: "24. CSS: Az oldal betűtípusa Rubik",
      check: (doc, html, css) => css && /body\s*\{[^}]*font-family\s*:\s*[^;]*rubik/i.test(css),
      cssCheck: true,
    },
    {
      id: "css-fejlec-width",
      label: "25. CSS: A fejlec azonosítóra 100%-os szélesség van beállítva",
      check: (doc, html, css) => css && /#fejlec\s*\{[^}]*width\s*:\s*100%/i.test(css),
      cssCheck: true,
    },
    {
      id: "css-felirat-smallcaps",
      label: "26. CSS: A felirat azonosítóra kiskapitális betű van beállítva",
      check: (doc, html, css) => css && /#felirat\s*\{[^}]*font-variant\s*:\s*small-caps/i.test(css),
      cssCheck: true,
    },
    {
      id: "css-felirat-bold",
      label: "27. CSS: A felirat azonosítóra félkövér betűstílus van beállítva",
      check: (doc, html, css) => css && /#felirat\s*\{[^}]*font-weight\s*:\s*bold/i.test(css),
      cssCheck: true,
    },
    {
      id: "css-nav-border",
      label: "28. CSS: A navigáció listaelemére 3px vastag, pontozott, narancssárga jobb szegélyt állított",
      check: (doc, html, css) => css && /nav\s+li\s*\{[^}]*border(-right)?\s*:[^;]*3px[^;]*dotted[^;]*orange/i.test(css),
      cssCheck: true,
    },
    {
      id: "css-h2-fontsize",
      label: "29. CSS: A h2 betűmérete 2.5em",
      check: (doc, html, css) => css && /h2\s*\{[^}]*font-size\s*:\s*2\.5em/i.test(css),
      cssCheck: true,
    },
    {
      id: "css-bagoly-bg",
      label: "30. CSS: A bagoly osztály háttérszíne #f0edd1",
      check: (doc, html, css) => css && /\.bagoly\s*\{[^}]*background(-color)?\s*:\s*#f0edd1/i.test(css),
      cssCheck: true,
    },
    {
      id: "css-lablec-color",
      label: "31. CSS: A lablec osztály hivatkozásának betűszíne fehér",
      check: (doc, html, css) => css && /\.lablec\s+a\s*\{[^}]*color\s*:\s*white/i.test(css),
      cssCheck: true,
    },
    {
      id: "css-lablec-nodecor",
      label: "32. CSS: A lablec osztály hivatkozásánál nincs aláhúzás",
      check: (doc, html, css) => css && /\.lablec\s+a\s*\{[^}]*text-decoration\s*:\s*none/i.test(css),
      cssCheck: true,
    },
    {
      id: "css-taplalek-image",
      label: "33. CSS: A taplalek azonosítóra bagoly.png listaelem kép van beállítva",
      check: (doc, html, css) => css && /#taplalek\s*\{[^}]*list-style-image\s*:\s*url\([^)]*bagoly\.png/i.test(css),
      cssCheck: true,
    },
    {
      id: "css-p-justify",
      label: "34. CSS: A bekezdések sorkizártak",
      check: (doc, html, css) => css && /p\s*\{[^}]*text-align\s*:\s*justify/i.test(css),
      cssCheck: true,
    },
    {
      id: "html-validated",
      label: "35. HTML validálás képernyőképe feltöltve",
      check: () => validationImages.html !== null,
    },
    {
      id: "css-validated",
      label: "36. CSS validálás képernyőképe feltöltve",
      check: () => validationImages.css !== null,
    },
  ],
},

egijelensegek: {
  id: "egijelensegek",
  name: "Égi jelenségek",
  description: "Weboldal kódolása - Égi jelenségek",
  basePath: "forrasok/egijelensegek/",
  htmlFile: "egijelensegek.html",
  cssFile: "css/style.css",
  taskDescFile: "weboldal_kodolas_egijelensegek.html",
  previewBase: "forrasok/egijelensegek/",
  sampleImage: "égi_jelenségek.png",
  sourceFiles: [
    { name: "forras.txt", label: "Sas-köd szöveg (forras.txt)" },
    { name: "tablazat.txt", label: "Új táblázatsorok (tablazat.txt)" }
  ],
  maxPoints: 40,
  checks: [
    {
      id: "lang-charset",
      label: "1. Weboldal nyelve magyar, karakterkódolása UTF-8",
      check: (doc) => {
        const meta = doc.querySelector('meta[charset]');
        const hasUtf8 = meta && meta.getAttribute('charset').trim().toLowerCase() === 'utf-8';
        return doc.documentElement.lang === "hu" && hasUtf8;
      },
    },
    {
      id: "title",
      label: "2. Böngésző címsorában megjelenő cím \"Égi jelenségek\"",
      check: (doc) => doc.title === "Égi jelenségek",
    },
    {
      id: "style-link",
      label: "3. Hivatkozást helyezett el a css mappában található style.css stíluslapra",
      check: (doc, html) => /href=["'][^"']*style\.css["']/i.test(html),
    },
    {
      id: "fejlec-img",
      label: "4. Az img mappában található fejlec.jpg képet elhelyezte",
      check: (doc) => doc.querySelector('img[src*="img/fejlec"]') !== null,
    },
    {
      id: "fejlec-alt-title",
      label: "5. A fejléc kép alt és title szövege \"Világegyetem\"",
      check: (doc) => {
        const img = doc.querySelector('img[src*="img/fejlec"]');
        return img && img.alt === "Világegyetem" && img.title === "Világegyetem";
      },
    },
    {
      id: "fejlec-id",
      label: "6. A fejléc képre egyedi azonosítót állított fejlec néven",
      check: (doc) => doc.querySelector('img#fejlec') !== null,
    },
    {
      id: "felirat-h1",
      label: "7. Az \"Égi jelenségek\" szöveg 1-es szintű címsor (h1)",
      check: (doc) => doc.querySelector('h1#felirat') !== null,
    },
    {
      id: "nav-3rd-link",
      label: "8. Elkészítette a \"Világegyetem\" menüpontot és jó oldalra hivatkozik",
      check: (doc) => {
        const links = doc.querySelectorAll('nav a, .navbar a');
        return Array.from(links).some(a =>
          a.textContent.includes('Világegyetem') && a.href.includes('wikipedia.org')
        );
      },
    },
    {
      id: "nav-3rd-blank",
      label: "9. A \"Világegyetem\" link új lapon nyílik meg",
      check: (doc) => {
        const links = doc.querySelectorAll('nav a, .navbar a');
        return Array.from(links).some(a =>
          a.href.includes('wikipedia.org') && a.textContent.includes('Világegyetem') && a.target === '_blank'
        );
      },
    },
    {
      id: "napfogyatkozas-ul",
      label: "10. A napfogyatkozás típusai számozatlan felsorolásban (ul#nap)",
      check: (doc) => {
        return doc.querySelector('ul#nap') !== null && doc.querySelector('ul#nap li') !== null;
      },
    },
    {
      id: "napfogyatkozas-underline",
      label: "11. A \"A napfogyatkozás típusai:\" szöveg aláhúzott",
      check: (doc) => {
        const underlines = doc.querySelectorAll('u');
        return Array.from(underlines).some(u => u.textContent.includes('napfogyatkozás típusai'));
      },
    },
    {
      id: "verhold-ol",
      label: "12. A telihold ősi nevei számozott felsorolásban (ol, 12 elem)",
      check: (doc) => {
        const ols = doc.querySelectorAll('ol');
        return Array.from(ols).some(ol => ol.querySelectorAll('li').length >= 10);
      },
    },
    {
      id: "saskod-h2",
      label: "13. A Sas-köd részben van 2-es szintű címsor",
      check: (doc) => {
        const h2s = doc.querySelectorAll('h2');
        return Array.from(h2s).some(h => h.textContent.includes('Sas-köd'));
      },
    },
    {
      id: "saskod-bold-italic",
      label: "14. A Sas-köd neve félkövér, az alternatív neve dőlt",
      check: (doc) => {
        const bolds = doc.querySelectorAll('b, strong');
        const hasBold = Array.from(bolds).some(b => b.textContent.includes('Sas-köd'));
        const italics = doc.querySelectorAll('i, em');
        const hasItalic = Array.from(italics).some(i => i.textContent.includes('Messier'));
        return hasBold && hasItalic;
      },
    },
    {
      id: "saskod-img",
      label: "15. A Sas-köd kép forrása img/saskod.jpg",
      check: (doc) => doc.querySelector('img[src*="saskod"]') !== null,
    },
    {
      id: "table-classes",
      label: "16. A táblázaton alkalmazza a table, table-bordered és table-responsive osztályokat",
      check: (doc) => {
        const table = doc.querySelector('table');
        return table &&
          table.classList.contains('table') &&
          table.classList.contains('table-bordered') &&
          table.classList.contains('table-responsive');
      },
    },
    {
      id: "table-th-w25",
      label: "17. A táblázat fejléc celláin alkalmazza a w-25 osztályjelölőt",
      check: (doc) => {
        const ths = doc.querySelectorAll('thead th.w-25');
        return ths.length >= 3;
      },
    },
    {
      id: "table-new-rows",
      label: "18. A táblázatba bekerültek az új sorok (Plútó, Xena)",
      check: (doc) => {
        const tds = doc.querySelectorAll('tbody td');
        const text = Array.from(tds).map(td => td.textContent).join(' ');
        return text.includes('Plútó') || text.includes('Xena');
      },
    },
    {
      id: "egyuttallas-col-md-6",
      label: "19. A Bolygó együttállás részben mindkét oszlop col-md-6 méretű",
      check: (doc) => {
        const egyuttallas = doc.querySelector('#egyuttallas');
        if (!egyuttallas) return false;
        const cols = egyuttallas.querySelectorAll('[class*="col-md-6"]');
        return cols.length >= 2;
      },
    },
    {
      id: "footer-link",
      label: "20. A láblécben van hivatkozás a \"leiras\" azonosítóra \"Ugrás az elejére\" szöveggel",
      check: (doc) => {
        const link = doc.querySelector('.lablec a[href="#leiras"]');
        return link && link.textContent.includes('Ugrás az elejére');
      },
    },
    {
      id: "css-body-font",
      label: "21. CSS: Az oldal betűtípusa IBM Plex Mono",
      check: (doc, html, css) => css && /body\s*\{[^}]*font-family\s*:\s*[^;]*IBM\s*Plex\s*Mono/i.test(css),
      cssCheck: true,
    },
    {
      id: "css-fejlec-height",
      label: "22. CSS: A fejlec azonosítóra 100%-os magasság van beállítva",
      check: (doc, html, css) => css && /#fejlec\s*\{[^}]*height\s*:\s*100%/i.test(css),
      cssCheck: true,
    },
    {
      id: "css-felirat-color",
      label: "23. CSS: A felirat azonosító betűszíne rgb(13,1,81)",
      check: (doc, html, css) => css && /#felirat\s*\{[^}]*color\s*:\s*rgb\s*\(\s*13\s*,\s*1\s*,\s*81\s*\)/i.test(css),
      cssCheck: true,
    },
    {
      id: "css-felirat-smallcaps",
      label: "24. CSS: A felirat azonosítóra kiskapitális betű van beállítva",
      check: (doc, html, css) => css && /#felirat\s*\{[^}]*font-variant\s*:\s*small-caps/i.test(css),
      cssCheck: true,
    },
    {
      id: "css-nav-border",
      label: "25. CSS: A navigáció listaelemére 3px vastag, pontozott, narancssárga jobb szegélyt állított",
      check: (doc, html, css) => css && /nav\s+li\s*\{[^}]*border(-right)?\s*:[^;]*3px[^;]*dotted[^;]*orange/i.test(css),
      cssCheck: true,
    },
    {
      id: "css-nav-padding",
      label: "26. CSS: A navigáció listaelemének vízszintes belső margója 15px",
      check: (doc, html, css) => css && /nav\s+li\s*\{[^}]*padding\s*:\s*0\s*15px/i.test(css),
      cssCheck: true,
    },
    {
      id: "css-hobbi-bg",
      label: "27. CSS: A hobbi osztály háttérszíne fehér (#ffffff)",
      check: (doc, html, css) => css && /\.hobbi\s*\{[^}]*background(-color)?\s*:\s*(#ffffff|white)/i.test(css),
      cssCheck: true,
    },
    {
      id: "css-lablec-color",
      label: "28. CSS: A lablec osztály hivatkozásának betűszíne fehér",
      check: (doc, html, css) => css && /\.lablec\s+a\s*\{[^}]*color\s*:\s*white/i.test(css),
      cssCheck: true,
    },
    {
      id: "css-lablec-bold",
      label: "29. CSS: A lablec osztály hivatkozása félkövér",
      check: (doc, html, css) => css && /\.lablec\s+a\s*\{[^}]*font-weight\s*:\s*bold/i.test(css),
      cssCheck: true,
    },
    {
      id: "css-lablec-nodecor",
      label: "30. CSS: A lablec osztály hivatkozásánál nincs aláhúzás",
      check: (doc, html, css) => css && /\.lablec\s+a\s*\{[^}]*text-decoration\s*:\s*none/i.test(css),
      cssCheck: true,
    },
    {
      id: "css-navbar-fontsize",
      label: "31. CSS: A navbar osztály betűmérete 1.2em",
      check: (doc, html, css) => css && /\.navbar\s*\{[^}]*font-size\s*:\s*1\.2em/i.test(css),
      cssCheck: true,
    },
    {
      id: "css-nap-image",
      label: "32. CSS: A nap azonosítóra nap.png listaelem kép van beállítva",
      check: (doc, html, css) => css && /#nap\s*\{[^}]*list-style-image\s*:\s*url\([^)]*nap\.png/i.test(css),
      cssCheck: true,
    },
    {
      id: "css-p-justify",
      label: "33. CSS: A bekezdések sorkizártak",
      check: (doc, html, css) => css && /p\s*\{[^}]*text-align\s*:\s*justify/i.test(css),
      cssCheck: true,
    },
    {
      id: "html-validated",
      label: "34. HTML validálás képernyőképe feltöltve",
      check: () => validationImages.html !== null,
    },
    {
      id: "css-validated",
      label: "35. CSS validálás képernyőképe feltöltve",
      check: () => validationImages.css !== null,
    },
  ],
},

evmadarai: {
  id: "evmadarai",
  name: "Év madarai",
  description: "Weboldal kódolása - Év madarai",
  basePath: "forrasok/evmadarai/",
  htmlFile: "evmadarai.html",
  cssFile: "css/style.css",
  taskDescFile: "weboldal_kodolas_evmadarai.html",
  previewBase: "forrasok/evmadarai/",
  sampleImage: "év_madarai.png",
  sourceFiles: [
    { name: "forras.txt", label: "Zöld küllő szöveg (forras.txt)" },
    { name: "tablazat.txt", label: "Új táblázatsorok (tablazat.txt)" }
  ],
  maxPoints: 40,
  checks: [
    {
      id: "lang-charset",
      label: "1. Weboldal nyelve magyar, karakterkódolása UTF-8",
      check: (doc) => {
        const meta = doc.querySelector('meta[charset]');
        const hasUtf8 = meta && meta.getAttribute('charset').trim().toLowerCase() === 'utf-8';
        return doc.documentElement.lang === "hu" && hasUtf8;
      },
    },
    {
      id: "title",
      label: "2. Böngésző címsorában megjelenő cím \"Év madarai\"",
      check: (doc) => doc.title === "Év madarai",
    },
    {
      id: "style-link",
      label: "3. Hivatkozást helyezett el a css mappában található style.css stíluslapra",
      check: (doc, html) => /href=["'][^"']*style\.css["']/i.test(html),
    },
    {
      id: "fejlec-img",
      label: "4. A fejlec.jpg képet elhelyezte, alt és title szövege \"Év madarai\"",
      check: (doc) => {
        const img = doc.querySelector('img#fejlec');
        return img && img.alt === "Év madarai" && img.title === "Év madarai";
      },
    },
    {
      id: "felirat-h1",
      label: "5. Az \"Év madarai\" szöveg 1-es szintű címsor (h1)",
      check: (doc) => doc.querySelector('h1#felirat') !== null,
    },
    {
      id: "nav-3rd-link",
      label: "6. Elkészítette a \"Magyarország madarai\" menüpontot és jó oldalra hivatkozik",
      check: (doc) => {
        const links = doc.querySelectorAll('nav a, .navbar a');
        return Array.from(links).some(a =>
          a.textContent.includes('Magyarország madarai') && a.href.includes('mme.hu')
        );
      },
    },
    {
      id: "nav-3rd-blank",
      label: "7. A \"Magyarország madarai\" link új lapon nyílik meg",
      check: (doc) => {
        const links = doc.querySelectorAll('nav a, .navbar a');
        return Array.from(links).some(a => a.href.includes('mme.hu') && a.target === '_blank');
      },
    },
    {
      id: "vandorsolyom-bold-italic",
      label: "8. A vándorsólyom neve félkövér, latin neve dőlt; szövege bekezdésekbe kerültek",
      check: (doc) => {
        const bolds = doc.querySelectorAll('b, strong');
        const hasBold = Array.from(bolds).some(b => b.textContent.toLowerCase().includes('vándorsólyom'));
        const italics = doc.querySelectorAll('i, em');
        const hasItalic = Array.from(italics).some(i => i.textContent.includes('Falco'));
        return hasBold && hasItalic;
      },
    },
    {
      id: "golyatocs-underline",
      label: "9. A Gólyatöcs \"Jellemvonásaik:\" szöveg aláhúzott",
      check: (doc) => {
        const underlines = doc.querySelectorAll('u');
        return Array.from(underlines).some(u => u.textContent.includes('Jellemvonásaik'));
      },
    },
    {
      id: "fulesbagoly-ol",
      label: "10. Az Erdei fülesbagoly megjelenésének adatai számozott felsorolásban",
      check: (doc) => {
        const h2s = doc.querySelectorAll('h2');
        const fbH2 = Array.from(h2s).find(h => h.textContent.includes('Erdei fülesbagoly'));
        if (!fbH2) return false;
        const container = fbH2.closest('.col');
        return container && container.querySelector('ol li') !== null;
      },
    },
    {
      id: "ciganycsuk-ul",
      label: "11. A Cigánycsuk táplálékai számozatlan felsorolásban (ul#taplalek)",
      check: (doc) => doc.querySelector('ul#taplalek') !== null && doc.querySelector('ul#taplalek li') !== null,
    },
    {
      id: "zoldkullo-h2",
      label: "12. A Zöld küllő részben van 2-es szintű címsor",
      check: (doc) => {
        const h2s = doc.querySelectorAll('h2');
        return Array.from(h2s).some(h => h.textContent.includes('Zöld küllő'));
      },
    },
    {
      id: "zoldkullo-img",
      label: "13. A Zöld küllő kép forrása img/zoldkullo.jpg",
      check: (doc) => doc.querySelector('img[src*="zoldkullo"]') !== null,
    },
    {
      id: "barkoscinege-bold-italic",
      label: "14. A barkóscinege neve félkövér, latin neve dőlt",
      check: (doc) => {
        const bolds = doc.querySelectorAll('b, strong');
        const hasBold = Array.from(bolds).some(b => b.textContent.toLowerCase().includes('barkóscinege'));
        const italics = doc.querySelectorAll('i, em');
        const hasItalic = Array.from(italics).some(i => i.textContent.includes('Panurus'));
        return hasBold && hasItalic;
      },
    },
    {
      id: "table-classes",
      label: "15. A táblázaton alkalmazza a table-striped és table-warning osztályokat",
      check: (doc) => {
        const table = doc.querySelector('table');
        return table &&
          table.classList.contains('table-striped') &&
          table.classList.contains('table-warning');
      },
    },
    {
      id: "table-new-rows",
      label: "16. A táblázatba bekerültek az új sorok (rétisas, kerecsensólyom)",
      check: (doc) => {
        const tds = doc.querySelectorAll('tbody td');
        const text = Array.from(tds).map(td => td.textContent).join(' ');
        return text.includes('rétisas') || text.includes('kerecsensólyom');
      },
    },
    {
      id: "evmadara-col-md-6",
      label: "17. Az Év madara program részben mindkét oszlop col-md-6 méretű",
      check: (doc) => {
        const evmadara = doc.querySelector('#evmadara');
        if (!evmadara) return false;
        return evmadara.querySelectorAll('[class*="col-md-6"]').length >= 2;
      },
    },
    {
      id: "footer-link",
      label: "18. A láblécben van hivatkozás a \"leiras\" azonosítóra \"Ugrás az elejére\" szöveggel",
      check: (doc) => {
        const link = doc.querySelector('.lablec a[href="#leiras"]');
        return link && link.textContent.includes('Ugrás az elejére');
      },
    },
    {
      id: "css-body-font",
      label: "19. CSS: Az oldal betűtípusa Rubik",
      check: (doc, html, css) => css && /body\s*\{[^}]*font-family\s*:\s*[^;]*rubik/i.test(css),
      cssCheck: true,
    },
    {
      id: "css-fejlec-height",
      label: "20. CSS: A fejlec azonosítóra 100%-os magasság van beállítva",
      check: (doc, html, css) => css && /#fejlec\s*\{[^}]*height\s*:\s*100%/i.test(css),
      cssCheck: true,
    },
    {
      id: "css-felirat-color",
      label: "21. CSS: A felirat azonosító betűszíne rgb(13,1,81)",
      check: (doc, html, css) => css && /#felirat\s*\{[^}]*color\s*:\s*rgb\s*\(\s*13\s*,\s*1\s*,\s*81\s*\)/i.test(css),
      cssCheck: true,
    },
    {
      id: "css-felirat-smallcaps",
      label: "22. CSS: A felirat azonosítóra kiskapitális betű van beállítva",
      check: (doc, html, css) => css && /#felirat\s*\{[^}]*font-variant\s*:\s*small-caps/i.test(css),
      cssCheck: true,
    },
    {
      id: "css-nav-border",
      label: "23. CSS: A navigáció listaelemére 3px vastag, pontozott, narancssárga jobb szegélyt állított",
      check: (doc, html, css) => css && /nav\s+li\s*\{[^}]*border(-right)?\s*:[^;]*3px[^;]*dotted[^;]*orange/i.test(css),
      cssCheck: true,
    },
    {
      id: "css-hobbi-bg",
      label: "24. CSS: A hobbi osztály háttérszíne #fff7ad",
      check: (doc, html, css) => css && /\.hobbi\s*\{[^}]*background(-color)?\s*:\s*#fff7ad/i.test(css),
      cssCheck: true,
    },
    {
      id: "css-lablec-color",
      label: "25. CSS: A lablec osztály hivatkozásának betűszíne fehér",
      check: (doc, html, css) => css && /\.lablec\s+a\s*\{[^}]*color\s*:\s*white/i.test(css),
      cssCheck: true,
    },
    {
      id: "css-lablec-bold",
      label: "26. CSS: A lablec osztály hivatkozása félkövér",
      check: (doc, html, css) => css && /\.lablec\s+a\s*\{[^}]*font-weight\s*:\s*bold/i.test(css),
      cssCheck: true,
    },
    {
      id: "css-navbar-fontsize",
      label: "27. CSS: A navbar osztály betűmérete 1.2em",
      check: (doc, html, css) => css && /\.navbar\s*\{[^}]*font-size\s*:\s*1\.2em/i.test(css),
      cssCheck: true,
    },
    {
      id: "css-taplalek-image",
      label: "28. CSS: A taplalek azonosítóra madar.png listaelem kép van beállítva",
      check: (doc, html, css) => css && /#taplalek\s*\{[^}]*list-style-image\s*:\s*url\([^)]*madar\.png/i.test(css),
      cssCheck: true,
    },
    {
      id: "css-p-justify",
      label: "29. CSS: A bekezdések sorkizártak",
      check: (doc, html, css) => css && /p\s*\{[^}]*text-align\s*:\s*justify/i.test(css),
      cssCheck: true,
    },
    {
      id: "html-validated",
      label: "30. HTML validálás képernyőképe feltöltve",
      check: () => validationImages.html !== null,
    },
    {
      id: "css-validated",
      label: "31. CSS validálás képernyőképe feltöltve",
      check: () => validationImages.css !== null,
    },
  ],
},

gombak: {
  id: "gombak",
  name: "Gombák",
  description: "Weboldal kódolása - Gombák",
  basePath: "forrasok/gombak/",
  htmlFile: "gombak.html",
  cssFile: "css/style.css",
  taskDescFile: "weboldal_kodolas_gombak.html",
  previewBase: "forrasok/gombak/",
  sampleImage: "gombák.png",
  sourceFiles: [
    { name: "forras.txt", label: "Gyilkos galóca szöveg (forras.txt)" },
    { name: "tablazat.txt", label: "Táblázat fejléc (tablazat.txt)" }
  ],
  maxPoints: 40,
  checks: [
    {
      id: "lang-charset",
      label: "1. Weboldal nyelve magyar, karakterkódolása UTF-8",
      check: (doc) => {
        const meta = doc.querySelector('meta[charset]');
        const hasUtf8 = meta && meta.getAttribute('charset').trim().toLowerCase() === 'utf-8';
        return doc.documentElement.lang === "hu" && hasUtf8;
      },
    },
    {
      id: "title",
      label: "2. Böngésző címsorában megjelenő cím \"Gombák\"",
      check: (doc) => doc.title === "Gombák",
    },
    {
      id: "style-link",
      label: "3. Hivatkozást helyezett el a css mappában található style.css stíluslapra",
      check: (doc, html) => /href=["'][^"']*style\.css["']/i.test(html),
    },
    {
      id: "fejlec-img",
      label: "4. A fejlec.jpg képet elhelyezte, alt és title szövege \"Gombák\"",
      check: (doc) => {
        const img = doc.querySelector('img#fejlec');
        return img && img.alt === "Gombák" && img.title === "Gombák";
      },
    },
    {
      id: "nav-4th-link",
      label: "5. Elkészítette a \"Gyógygombák\" menüpontot és jó oldalra hivatkozik",
      check: (doc) => {
        const links = doc.querySelectorAll('nav a, .navbar a');
        return Array.from(links).some(a =>
          a.textContent.includes('Gyógygombák') && a.href.includes('gyogygombak.net')
        );
      },
    },
    {
      id: "nav-4th-blank",
      label: "6. A \"Gyógygombák\" link új lapon nyílik meg",
      check: (doc) => {
        const links = doc.querySelectorAll('nav a, .navbar a');
        return Array.from(links).some(a => a.href.includes('gyogygombak.net') && a.target === '_blank');
      },
    },
    {
      id: "focim-h1",
      label: "7. A főcím szöveg 1-es szintű címsor (h1)",
      check: (doc) => {
        const h1s = doc.querySelectorAll('h1');
        return Array.from(h1s).some(h => h.textContent.includes('GOMBÁK'));
      },
    },
    {
      id: "muholdszoveg-p",
      label: "8. A \"Gombából műhold\" szöveg bekezdésekbe kerültek és alkalmazza a my-3 osztályjelölőt",
      check: (doc) => {
        const erdei = doc.querySelector('#erdei');
        if (!erdei) return false;
        const ps = erdei.querySelectorAll('p.my-3');
        return ps.length >= 2;
      },
    },
    {
      id: "csiperke-bold-italic",
      label: "9. A csiperke neve félkövér, latin neve dőlt",
      check: (doc) => {
        const bolds = doc.querySelectorAll('b, strong');
        const hasBold = Array.from(bolds).some(b => b.textContent.toLowerCase().includes('csiperke'));
        const italics = doc.querySelectorAll('i, em');
        const hasItalic = Array.from(italics).some(i => i.textContent.includes('Agaricus'));
        return hasBold && hasItalic;
      },
    },
    {
      id: "laskagomba-bold-italic",
      label: "10. A laskagomba neve félkövér, latin neve dőlt",
      check: (doc) => {
        const bolds = doc.querySelectorAll('b, strong');
        const hasBold = Array.from(bolds).some(b => b.textContent.toLowerCase().includes('laskagomba'));
        const italics = doc.querySelectorAll('i, em');
        const hasItalic = Array.from(italics).some(i => i.textContent.includes('Pleurotus'));
        return hasBold && hasItalic;
      },
    },
    {
      id: "varganya-bold-italic",
      label: "11. A vargánya neve félkövér, latin neve dőlt",
      check: (doc) => {
        const bolds = doc.querySelectorAll('b, strong');
        const hasBold = Array.from(bolds).some(b => b.textContent.toLowerCase().includes('vargánya'));
        const italics = doc.querySelectorAll('i, em');
        const hasItalic = Array.from(italics).some(i => i.textContent.includes('Boletus'));
        return hasBold && hasItalic;
      },
    },
    {
      id: "laskagomba-ul",
      label: "12. A laskagomba receptek számozatlan felsorolásban (ul#kaja)",
      check: (doc) => doc.querySelector('ul#kaja') !== null && doc.querySelector('ul#kaja li') !== null,
    },
    {
      id: "gyilkos-galoca-h3",
      label: "13. A Gyilkos galóca részben van 3-as szintű címsor",
      check: (doc) => {
        const h3s = doc.querySelectorAll('h3');
        return Array.from(h3s).some(h => h.textContent.includes('Gyilkos galóca'));
      },
    },
    {
      id: "gyilkos-galoca-img",
      label: "14. A Gyilkos galóca kép forrása img/gyilkos_galoca.jpg",
      check: (doc) => doc.querySelector('img[src*="gyilkos_galoca"]') !== null,
    },
    {
      id: "legyolo-bold-italic",
      label: "15. A légyölő galóca neve félkövér, latin neve dőlt",
      check: (doc) => {
        const bolds = doc.querySelectorAll('b, strong');
        const hasBold = Array.from(bolds).some(b => b.textContent.toLowerCase().includes('légyölő galóca'));
        const italics = doc.querySelectorAll('i, em');
        const hasItalic = Array.from(italics).some(i => i.textContent.includes('Amanita muscaria'));
        return hasBold && hasItalic;
      },
    },
    {
      id: "pokhalosgomba-bold-italic",
      label: "16. A mérges pókhálósgomba neve félkövér, latin neve dőlt",
      check: (doc) => {
        const bolds = doc.querySelectorAll('b, strong');
        const hasBold = Array.from(bolds).some(b => b.textContent.toLowerCase().includes('pókhálósgomba'));
        const italics = doc.querySelectorAll('i, em');
        const hasItalic = Array.from(italics).some(i => i.textContent.includes('Cortinarius'));
        return hasBold && hasItalic;
      },
    },
    {
      id: "megelozese-ol",
      label: "17. A gombamérgezés megelőzése szöveg számozott felsorolásban (ol)",
      check: (doc) => {
        const jotanacs = doc.querySelector('#jotanacs');
        if (!jotanacs) return false;
        return jotanacs.querySelector('ol li') !== null;
      },
    },
    {
      id: "table-th",
      label: "18. A táblázat fejlécében elkészítette az 5 fejléc cellát",
      check: (doc) => {
        const ths = doc.querySelectorAll('thead th');
        return ths.length >= 5;
      },
    },
    {
      id: "footer-link",
      label: "19. A láblécben van hivatkozás a \"fejlec\" azonosítóra \"Ugrás az elejére\" szöveggel",
      check: (doc) => {
        const link = doc.querySelector('.lablec a[href="#fejlec"]');
        return link && link.textContent.includes('Ugrás az elejére');
      },
    },
    {
      id: "css-body-font",
      label: "20. CSS: Az oldal betűtípusa cursive",
      check: (doc, html, css) => css && /body\s*\{[^}]*font-family\s*:\s*cursive/i.test(css),
      cssCheck: true,
    },
    {
      id: "css-fejlec-width",
      label: "21. CSS: A fejlec azonosítóra 100%-os szélesség van beállítva",
      check: (doc, html, css) => css && /#fejlec\s*\{[^}]*width\s*:\s*100%/i.test(css),
      cssCheck: true,
    },
    {
      id: "css-h3-color",
      label: "22. CSS: A h3 betűszíne fekete",
      check: (doc, html, css) => css && /h3\s*\{[^}]*color\s*:\s*black/i.test(css),
      cssCheck: true,
    },
    {
      id: "css-h3-fontsize",
      label: "23. CSS: A h3 betűmérete 2.2em",
      check: (doc, html, css) => css && /h3\s*\{[^}]*font-size\s*:\s*2\.2em/i.test(css),
      cssCheck: true,
    },
    {
      id: "css-nav-border",
      label: "24. CSS: A navigáció listaelemére 3px vastag, pontozott jobb szegélyt állított",
      check: (doc, html, css) => css && /nav\s+li\s*\{[^}]*border(-right)?\s*:[^;]*3px[^;]*dotted/i.test(css),
      cssCheck: true,
    },
    {
      id: "css-nav-padding",
      label: "25. CSS: A navigáció listaelemének vízszintes belső margója 15px",
      check: (doc, html, css) => css && /nav\s+li\s*\{[^}]*padding\s*:\s*0\s*15px/i.test(css),
      cssCheck: true,
    },
    {
      id: "css-lablec-bold",
      label: "26. CSS: A lablec osztály hivatkozása félkövér",
      check: (doc, html, css) => css && /\.lablec\s+a\s*\{[^}]*font-weight\s*:\s*bold/i.test(css),
      cssCheck: true,
    },
    {
      id: "css-lablec-nodecor",
      label: "27. CSS: A lablec osztály hivatkozásánál nincs aláhúzás",
      check: (doc, html, css) => css && /\.lablec\s+a\s*\{[^}]*text-decoration\s*:\s*none/i.test(css),
      cssCheck: true,
    },
    {
      id: "css-p-justify",
      label: "28. CSS: A bekezdések sorkizártak",
      check: (doc, html, css) => css && /p\s*\{[^}]*text-align\s*:\s*justify/i.test(css),
      cssCheck: true,
    },
    {
      id: "css-kaja-image",
      label: "29. CSS: A kaja azonosítóra gomba.png listaelem kép van beállítva",
      check: (doc, html, css) => css && /#kaja\s*\{[^}]*list-style-image\s*:\s*url\([^)]*gomba\.png/i.test(css),
      cssCheck: true,
    },
    {
      id: "css-kaja-margin",
      label: "30. CSS: A kaja azonosító bal külső margója 25px",
      check: (doc, html, css) => css && /#kaja\s*\{[^}]*margin-left\s*:\s*25px/i.test(css),
      cssCheck: true,
    },
    {
      id: "html-validated",
      label: "31. HTML validálás képernyőképe feltöltve",
      check: () => validationImages.html !== null,
    },
    {
      id: "css-validated",
      label: "32. CSS validálás képernyőképe feltöltve",
      check: () => validationImages.css !== null,
    },
  ],
},

hobbiallatok: {
  id: "hobbiallatok",
  name: "Hobbiállatok",
  description: "Weboldal kódolása - Hobbiállatok",
  basePath: "forrasok/hobbiallatok/",
  htmlFile: "hobbiallatok.html",
  cssFile: "css/style.css",
  taskDescFile: "weboldal_kodolas_hobbiallatok.html",
  previewBase: "forrasok/hobbiallatok/",
  sampleImage: "hobbiállatok.png",
  sourceFiles: [
    { name: "forras.txt", label: "Törpesün szöveg (forras.txt)" },
    { name: "tablazat.txt", label: "Tartási költségek táblázat (tablazat.txt)" }
  ],
  maxPoints: 40,
  checks: [
    {
      id: "lang-charset",
      label: "1. Weboldal nyelve magyar, karakterkódolása UTF-8",
      check: (doc) => {
        const meta = doc.querySelector('meta[charset]');
        const hasUtf8 = meta && meta.getAttribute('charset').trim().toLowerCase() === 'utf-8';
        return doc.documentElement.lang === "hu" && hasUtf8;
      },
    },
    {
      id: "title",
      label: "2. Böngésző címsorában megjelenő cím \"Hobbiállatok\"",
      check: (doc) => doc.title === "Hobbiállatok",
    },
    {
      id: "style-link",
      label: "3. Hivatkozást helyezett el a css mappában található style.css stíluslapra",
      check: (doc, html) => /href=["'][^"']*style\.css["']/i.test(html),
    },
    {
      id: "fejlec-img",
      label: "4. A fejlec.jpg képet elhelyezte, alt és title szövege \"Hobbiállatok\"",
      check: (doc) => {
        const img = doc.querySelector('img#fejlec');
        return img && img.alt === "Hobbiállatok" && img.title === "Hobbiállatok";
      },
    },
    {
      id: "felirat-h1",
      label: "5. A \"Hobbiállatok\" szöveg 1-es szintű címsor (h1)",
      check: (doc) => doc.querySelector('h1#felirat') !== null,
    },
    {
      id: "nav-3rd-link",
      label: "6. Elkészítette a \"Felelős állattartás\" menüpontot",
      check: (doc) => {
        const links = doc.querySelectorAll('nav a, .navbar a');
        return Array.from(links).some(a =>
          a.textContent.includes('Felelős') && a.href.includes('wikipedia.org')
        );
      },
    },
    {
      id: "nav-3rd-blank",
      label: "7. A \"Felelős állattartás\" link új lapon nyílik meg",
      check: (doc) => {
        const links = doc.querySelectorAll('nav a, .navbar a');
        return Array.from(links).some(a =>
          a.textContent.includes('Felelős') && a.target === '_blank'
        );
      },
    },
    {
      id: "kutya-ul",
      label: "8. A kutya tulajdonságai számozatlan felsorolásban (ul)",
      check: (doc) => {
        const h3s = doc.querySelectorAll('h3');
        const kutyaH3 = Array.from(h3s).find(h => h.textContent.trim() === 'Kutya');
        if (!kutyaH3) return false;
        const container = kutyaH3.closest('.col');
        return container && container.querySelector('ul:not(.navbar-nav) li') !== null;
      },
    },
    {
      id: "macska-ol",
      label: "9. A világ legnépszerűbb macskái számozott felsorolásban (ol)",
      check: (doc) => {
        const h3s = doc.querySelectorAll('h3');
        const macH3 = Array.from(h3s).find(h => h.textContent.trim() === 'Macska');
        if (!macH3) return false;
        const container = macH3.closest('.col');
        return container && container.querySelector('ol li') !== null;
      },
    },
    {
      id: "torpesun-h3",
      label: "10. A Törpesün részben van 3-as szintű címsor",
      check: (doc) => {
        const h3s = doc.querySelectorAll('h3');
        return Array.from(h3s).some(h => h.textContent.includes('Törpesün'));
      },
    },
    {
      id: "torpesun-bold-italic",
      label: "11. A törpesün neve félkövér, latin neve dőlt",
      check: (doc) => {
        const bolds = doc.querySelectorAll('b, strong');
        const hasBold = Array.from(bolds).some(b => b.textContent.toLowerCase().includes('törpesün'));
        const italics = doc.querySelectorAll('i, em');
        const hasItalic = Array.from(italics).some(i => i.textContent.includes('Atelerix'));
        return hasBold && hasItalic;
      },
    },
    {
      id: "torpesun-img",
      label: "12. A Törpesün kép forrása img/torpesun.jpg",
      check: (doc) => doc.querySelector('img[src*="torpesun"]') !== null,
    },
    {
      id: "caption-classes",
      label: "13. A képaláírásokon (Kutya, Macska, Papagáj, Törpenyúl) alkalmazza a fw-bold és h5 osztályjelölőket",
      check: (doc) => {
        const captions = doc.querySelectorAll('p.card-text.fw-bold.h5');
        return captions.length >= 4;
      },
    },
    {
      id: "kameleon-underline",
      label: "14. A kaméleon \"Kedvenc táplálékai:\" szöveg aláhúzott",
      check: (doc) => {
        const underlines = doc.querySelectorAll('u');
        return Array.from(underlines).some(u => u.textContent.includes('Kedvenc táplálékai'));
      },
    },
    {
      id: "tartasi-table",
      label: "15. A tartási költségek táblázata elkészült (colspan/rowspan fejléccel)",
      check: (doc) => {
        const koltsegek = doc.querySelector('#koltsegek');
        if (!koltsegek) return false;
        const table = koltsegek.querySelector('table');
        if (!table) return false;
        return table.querySelector('th[colspan]') !== null || table.querySelector('th[rowspan]') !== null;
      },
    },
    {
      id: "hatas-col-md",
      label: "16. Az egészségügyi hatások részben az oszlopok col-md-4 és col-md-8 méretűek",
      check: (doc) => {
        const hatas = doc.querySelector('#hatas');
        if (!hatas) return false;
        return hatas.querySelector('[class*="col-md-4"]') !== null &&
          hatas.querySelector('[class*="col-md-8"]') !== null;
      },
    },
    {
      id: "footer-link",
      label: "17. A láblécben van hivatkozás a \"leiras\" azonosítóra \"Ugrás az elejére\" szöveggel",
      check: (doc) => {
        const link = doc.querySelector('.lablec a[href="#leiras"]');
        return link && link.textContent.includes('Ugrás az elejére');
      },
    },
    {
      id: "css-body-font",
      label: "18. CSS: Az oldal betűtípusa Verdana",
      check: (doc, html, css) => css && /body\s*\{[^}]*font-family\s*:\s*[^;]*verdana/i.test(css),
      cssCheck: true,
    },
    {
      id: "css-fejlec-width",
      label: "19. CSS: A fejlec azonosítóra 100%-os szélesség van beállítva",
      check: (doc, html, css) => css && /#fejlec\s*\{[^}]*width\s*:\s*100%/i.test(css),
      cssCheck: true,
    },
    {
      id: "css-h3-fontsize",
      label: "20. CSS: A h3 betűmérete 2.5em",
      check: (doc, html, css) => css && /h3\s*\{[^}]*font-size\s*:\s*2\.5em/i.test(css),
      cssCheck: true,
    },
    {
      id: "css-hobbi-bg",
      label: "21. CSS: A hobbi osztály háttérszíne rgb(255,242,207)",
      check: (doc, html, css) => css && /\.hobbi\s*\{[^}]*background(-color)?\s*:\s*rgb\s*\(\s*255\s*,\s*242\s*,\s*207\s*\)/i.test(css),
      cssCheck: true,
    },
    {
      id: "css-hobbi-border",
      label: "22. CSS: A hobbi osztályra 2px vastag fekete szegélyt állított",
      check: (doc, html, css) => css && /\.hobbi\s*\{[^}]*border\s*:\s*2px\s+solid\s+black/i.test(css),
      cssCheck: true,
    },
    {
      id: "css-lablec-color",
      label: "23. CSS: A lablec osztály hivatkozásának betűszíne fekete",
      check: (doc, html, css) => css && /\.lablec\s+a\s*\{[^}]*color\s*:\s*black/i.test(css),
      cssCheck: true,
    },
    {
      id: "css-lablec-bold",
      label: "24. CSS: A lablec osztály hivatkozása félkövér",
      check: (doc, html, css) => css && /\.lablec\s+a\s*\{[^}]*font-weight\s*:\s*bold/i.test(css),
      cssCheck: true,
    },
    {
      id: "css-lablec-nodecor",
      label: "25. CSS: A lablec osztály hivatkozásánál nincs aláhúzás",
      check: (doc, html, css) => css && /\.lablec\s+a\s*\{[^}]*text-decoration\s*:\s*none/i.test(css),
      cssCheck: true,
    },
    {
      id: "css-lablec-hover",
      label: "26. CSS: Ha a lablec osztály hivatkozása fölé visszük az egeret, nagybetűs",
      check: (doc, html, css) => css && /\.lablec\s+a:hover\s*\{[^}]*text-transform\s*:\s*uppercase/i.test(css),
      cssCheck: true,
    },
    {
      id: "css-p-justify",
      label: "27. CSS: A bekezdések sorkizártak",
      check: (doc, html, css) => css && /p\s*\{[^}]*text-align\s*:\s*justify/i.test(css),
      cssCheck: true,
    },
    {
      id: "css-eleseg-image",
      label: "28. CSS: Az eleseg azonosítóra rovar.png listaelem kép van beállítva",
      check: (doc, html, css) => css && /#eleseg\s*\{[^}]*list-style-image\s*:\s*url\([^)]*rovar\.png/i.test(css),
      cssCheck: true,
    },
    {
      id: "css-eleseg-margin",
      label: "29. CSS: Az eleseg azonosító bal külső margója 25px",
      check: (doc, html, css) => css && /#eleseg\s*\{[^}]*margin-left\s*:\s*25px/i.test(css),
      cssCheck: true,
    },
    {
      id: "html-validated",
      label: "30. HTML validálás képernyőképe feltöltve",
      check: () => validationImages.html !== null,
    },
    {
      id: "css-validated",
      label: "31. CSS validálás képernyőképe feltöltve",
      check: () => validationImages.css !== null,
    },
  ],
},

hullok: {
  id: "hullok",
  name: "Hüllők",
  description: "Weboldal kódolása - Hüllők",
  basePath: "forrasok/hullok/",
  htmlFile: "hullok.html",
  cssFile: "css/style.css",
  taskDescFile: "weboldal_kodolas_hullok.html",
  previewBase: "forrasok/hullok/",
  sampleImage: "hüllők.png",
  sourceFiles: [
    { name: "forras.txt", label: "Pávaszemes gyík szöveg (forras.txt)" },
    { name: "tablazat.txt", label: "Új táblázatsor (tablazat.txt)" }
  ],
  maxPoints: 40,
  checks: [
    {
      id: "lang-charset",
      label: "1. Weboldal nyelve magyar, karakterkódolása UTF-8",
      check: (doc) => {
        const meta = doc.querySelector('meta[charset]');
        const hasUtf8 = meta && meta.getAttribute('charset').trim().toLowerCase() === 'utf-8';
        return doc.documentElement.lang === "hu" && hasUtf8;
      },
    },
    {
      id: "title",
      label: "2. Böngésző címsorában megjelenő cím \"Hüllők\"",
      check: (doc) => doc.title === "Hüllők",
    },
    {
      id: "style-link",
      label: "3. Hivatkozást helyezett el a css mappában található style.css stíluslapra",
      check: (doc, html) => /href=["'][^"']*style\.css["']/i.test(html),
    },
    {
      id: "fejlec-img",
      label: "4. A fejlec.jpg képet elhelyezte, alt és title szövege \"Hüllő\"",
      check: (doc) => {
        const img = doc.querySelector('img#fejlec');
        return img && img.alt === "Hüllő" && img.title === "Hüllő";
      },
    },
    {
      id: "felirat-h1",
      label: "5. A \"Hüllők\" szöveg 1-es szintű címsor (h1)",
      check: (doc) => doc.querySelector('h1#felirat') !== null,
    },
    {
      id: "nav-4th-link",
      label: "6. Elkészítette a \"További információ\" menüpontot",
      check: (doc) => {
        const links = doc.querySelectorAll('nav a, .navbar a');
        return Array.from(links).some(a =>
          a.textContent.includes('További') && a.href.includes('wikipedia.org')
        );
      },
    },
    {
      id: "nav-4th-blank",
      label: "7. A \"További információ\" link új lapon nyílik meg",
      check: (doc) => {
        const links = doc.querySelectorAll('nav a, .navbar a');
        return Array.from(links).some(a =>
          a.textContent.includes('További') && a.target === '_blank'
        );
      },
    },
    {
      id: "parduc-kameleon-bold-italic",
      label: "8. A párduc kaméleon neve félkövér, latin neve dőlt; szöveg bekezdésekbe kerültek",
      check: (doc) => {
        const bolds = doc.querySelectorAll('b, strong');
        const hasBold = Array.from(bolds).some(b => b.textContent.toLowerCase().includes('párduc kaméleon'));
        const italics = doc.querySelectorAll('i, em');
        const hasItalic = Array.from(italics).some(i => i.textContent.includes('Furcifer'));
        return hasBold && hasItalic;
      },
    },
    {
      id: "aranyporos-bold-italic",
      label: "9. Az aranyporos nappaligekkó neve félkövér, latin neve dőlt",
      check: (doc) => {
        const bolds = doc.querySelectorAll('b, strong');
        const hasBold = Array.from(bolds).some(b => b.textContent.toLowerCase().includes('aranyporos nappaligekkó'));
        const italics = doc.querySelectorAll('i, em');
        const hasItalic = Array.from(italics).some(i => i.textContent.includes('Phelsuma'));
        return hasBold && hasItalic;
      },
    },
    {
      id: "aranyporos-underline",
      label: "10. Az \"A gekkó színei:\" szöveg egyszerre félkövér és aláhúzott",
      check: (doc) => {
        const underlines = doc.querySelectorAll('u');
        const hasU = Array.from(underlines).some(u => u.textContent.includes('gekkó színei'));
        const bolds = doc.querySelectorAll('b, strong');
        const hasB = Array.from(bolds).some(b => b.textContent.includes('gekkó színei') || b.querySelector('u'));
        return hasU && hasB;
      },
    },
    {
      id: "aranyporos-ul",
      label: "11. A gekkó színei számozatlan felsorolásban (ul#gyik)",
      check: (doc) => doc.querySelector('ul#gyik') !== null && doc.querySelector('ul#gyik li') !== null,
    },
    {
      id: "leguan-bold-italic",
      label: "12. A zöld leguán neve félkövér, latin neve dőlt",
      check: (doc) => {
        const bolds = doc.querySelectorAll('b, strong');
        const hasBold = Array.from(bolds).some(b => b.textContent.toLowerCase().includes('zöld leguán'));
        const italics = doc.querySelectorAll('i, em');
        const hasItalic = Array.from(italics).some(i => i.textContent.includes('Iguana iguana'));
        return hasBold && hasItalic;
      },
    },
    {
      id: "leguan-ol",
      label: "13. A zöld leguán táplálékai számozott felsorolásban (ol)",
      check: (doc) => {
        const h2s = doc.querySelectorAll('h2');
        const leguanH2 = Array.from(h2s).find(h => h.textContent.includes('Zöld leguán'));
        if (!leguanH2) return false;
        const container = leguanH2.closest('.col');
        return container && container.querySelector('ol li') !== null;
      },
    },
    {
      id: "agama-bold-italic",
      label: "14. A szakállas agáma neve félkövér, latin neve dőlt",
      check: (doc) => {
        const bolds = doc.querySelectorAll('b, strong');
        const hasBold = Array.from(bolds).some(b => b.textContent.toLowerCase().includes('szakállas agáma'));
        const italics = doc.querySelectorAll('i, em');
        const hasItalic = Array.from(italics).some(i => i.textContent.includes('Saxicola'));
        return hasBold && hasItalic;
      },
    },
    {
      id: "pavaszem-h2",
      label: "15. A Pávaszemes gyík részben van 2-es szintű címsor",
      check: (doc) => {
        const h2s = doc.querySelectorAll('h2');
        return Array.from(h2s).some(h => h.textContent.includes('Pávaszemes gyík'));
      },
    },
    {
      id: "pavaszem-img",
      label: "16. A Pávaszemes gyík kép forrása img/pavaszem.jpg",
      check: (doc) => doc.querySelector('img[src*="pavaszem"]') !== null,
    },
    {
      id: "table-classes",
      label: "17. A táblázaton alkalmazza a table-bordered és text-center osztályokat",
      check: (doc) => {
        const table = doc.querySelector('.row.m-4.table-responsive-sm table, table.table-bordered');
        return table &&
          table.classList.contains('table-bordered') &&
          table.classList.contains('text-center');
      },
    },
    {
      id: "table-new-row",
      label: "18. A táblázatba bekerült a Komodói varánusz sor",
      check: (doc) => {
        const tds = doc.querySelectorAll('tbody td');
        const text = Array.from(tds).map(td => td.textContent).join(' ');
        return text.includes('Komodói varánusz');
      },
    },
    {
      id: "varanusz-bold-italic",
      label: "19. A komodói varánusz neve félkövér, latin neve dőlt",
      check: (doc) => {
        const bolds = doc.querySelectorAll('b, strong');
        const hasBold = Array.from(bolds).some(b => b.textContent.toLowerCase().includes('komodói varánusz'));
        const italics = doc.querySelectorAll('i, em');
        const hasItalic = Array.from(italics).some(i => i.textContent.includes('Varanus komodoensis'));
        return hasBold && hasItalic;
      },
    },
    {
      id: "erdekes-col-md-6",
      label: "20. A \"7+1 érdekes tény\" részben mindkét oszlop col-md-6 méretű",
      check: (doc) => {
        const erdekes = doc.querySelector('#erdekes');
        if (!erdekes) return false;
        return erdekes.querySelectorAll('[class*="col-md-6"]').length >= 2;
      },
    },
    {
      id: "footer-link",
      label: "21. A láblécben van hivatkozás a \"leiras\" azonosítóra \"Ugrás az elejére\" szöveggel",
      check: (doc) => {
        const link = doc.querySelector('.lablec a[href="#leiras"]');
        return link && link.textContent.includes('Ugrás az elejére');
      },
    },
    {
      id: "css-body-font",
      label: "22. CSS: Az oldal betűtípusa Rubik",
      check: (doc, html, css) => css && /body\s*\{[^}]*font-family\s*:\s*[^;]*rubik/i.test(css),
      cssCheck: true,
    },
    {
      id: "css-fejlec-width",
      label: "23. CSS: A fejlec azonosítóra 100%-os szélesség van beállítva",
      check: (doc, html, css) => css && /#fejlec\s*\{[^}]*width\s*:\s*100%/i.test(css),
      cssCheck: true,
    },
    {
      id: "css-felirat-bold",
      label: "24. CSS: A felirat azonosítóra félkövér betűstílus van beállítva",
      check: (doc, html, css) => css && /#felirat\s*\{[^}]*font-weight\s*:\s*bold/i.test(css),
      cssCheck: true,
    },
    {
      id: "css-nav-border",
      label: "25. CSS: A navigáció listaelemére 3px vastag, pontozott, #39FF14 színű jobb szegélyt állított",
      check: (doc, html, css) => css && /nav\s+li\s*\{[^}]*border(-right)?\s*:[^;]*3px[^;]*dotted[^;]*#39FF14/i.test(css),
      cssCheck: true,
    },
    {
      id: "css-nav-padding",
      label: "26. CSS: A navigáció listaelemének vízszintes belső margója 15px",
      check: (doc, html, css) => css && /nav\s+li\s*\{[^}]*padding\s*:\s*0\s*15px/i.test(css),
      cssCheck: true,
    },
    {
      id: "css-dd-italic",
      label: "27. CSS: A dd elemre dőlt betűstílus van beállítva",
      check: (doc, html, css) => css && /dd\s*\{[^}]*font-style\s*:\s*italic/i.test(css),
      cssCheck: true,
    },
    {
      id: "css-dd-fontsize",
      label: "28. CSS: A dd elem betűmérete 0.9em",
      check: (doc, html, css) => css && /dd\s*\{[^}]*font-size\s*:\s*0\.9em/i.test(css),
      cssCheck: true,
    },
    {
      id: "css-hullo-bg",
      label: "29. CSS: A hullo osztály háttérszíne #d2ffad",
      check: (doc, html, css) => css && /\.hullo\s*\{[^}]*background(-color)?\s*:\s*#d2ffad/i.test(css),
      cssCheck: true,
    },
    {
      id: "css-lablec-nodecor",
      label: "30. CSS: A lablec osztály hivatkozásánál nincs aláhúzás",
      check: (doc, html, css) => css && /\.lablec\s+a\s*\{[^}]*text-decoration\s*:\s*none/i.test(css),
      cssCheck: true,
    },
    {
      id: "css-lablec-hover",
      label: "31. CSS: Ha a lablec osztály hivatkozása fölé visszük az egeret, nagybetűs",
      check: (doc, html, css) => css && /\.lablec\s+a:hover\s*\{[^}]*text-transform\s*:\s*uppercase/i.test(css),
      cssCheck: true,
    },
    {
      id: "css-gyik-image",
      label: "32. CSS: A gyik azonosítóra gyik.png listaelem kép van beállítva",
      check: (doc, html, css) => css && /#gyik\s*\{[^}]*list-style-image\s*:\s*url\([^)]*gyik\.png/i.test(css),
      cssCheck: true,
    },
    {
      id: "css-p-justify",
      label: "33. CSS: A bekezdések sorkizártak",
      check: (doc, html, css) => css && /p\s*\{[^}]*text-align\s*:\s*justify/i.test(css),
      cssCheck: true,
    },
    {
      id: "html-validated",
      label: "34. HTML validálás képernyőképe feltöltve",
      check: () => validationImages.html !== null,
    },
    {
      id: "css-validated",
      label: "35. CSS validálás képernyőképe feltöltve",
      check: () => validationImages.css !== null,
    },
  ],
},

tropusi_gyumolcsok: {
  id: "tropusi_gyumolcsok",
  name: "Trópusi gyümölcsök",
  description: "Weboldal kódolása - Trópusi gyümölcsök",
  basePath: "forrasok/tropusi_gyumolcsok/",
  htmlFile: "tropusi_gyumolcsok.html",
  cssFile: "css/style.css",
  taskDescFile: "weboldal_kodolas_tropusi_gyumolcsok.html",
  previewBase: "forrasok/tropusi_gyumolcsok/",
  sampleImage: "trópusi_gyümölcsök.png",
  sourceFiles: [
    { name: "forras.txt", label: "Sárkánygyümölcs szöveg (forras.txt)" },
    { name: "tablazat.txt", label: "Táblázat fejléc és sorok (tablazat.txt)" }
  ],
  maxPoints: 40,
  checks: [
    {
      id: "lang-charset",
      label: "1. Weboldal nyelve magyar, karakterkódolása UTF-8",
      check: (doc) => {
        const meta = doc.querySelector('meta[charset]');
        const hasUtf8 = meta && meta.getAttribute('charset').trim().toLowerCase() === 'utf-8';
        return doc.documentElement.lang === "hu" && hasUtf8;
      },
    },
    {
      id: "title",
      label: "2. Böngésző címsorában megjelenő cím \"Trópusi gyümölcsök\"",
      check: (doc) => doc.title === "Trópusi gyümölcsök",
    },
    {
      id: "style-link",
      label: "3. Hivatkozást helyezett el a css mappában található style.css stíluslapra",
      check: (doc, html) => /href=["'][^"']*style\.css["']/i.test(html),
    },
    {
      id: "fejlec-img",
      label: "4. A fejlec képet elhelyezte, alt és title szövege \"Trópusi gyümölcsök\"",
      check: (doc) => {
        const img = doc.querySelector('img#fejlec');
        return img && img.alt === "Trópusi gyümölcsök" && img.title === "Trópusi gyümölcsök";
      },
    },
    {
      id: "nav-3rd-link",
      label: "5. Elkészítette a \"Noni\" menüpontot",
      check: (doc) => {
        const links = doc.querySelectorAll('nav a, .navbar a');
        return Array.from(links).some(a =>
          a.textContent.includes('Noni') && a.href.includes('wikipedia.org')
        );
      },
    },
    {
      id: "nav-3rd-blank",
      label: "6. A \"Noni\" link új lapon nyílik meg",
      check: (doc) => {
        const links = doc.querySelectorAll('nav a, .navbar a');
        return Array.from(links).some(a => a.textContent.includes('Noni') && a.target === '_blank');
      },
    },
    {
      id: "focim-h1",
      label: "7. A főcím szöveg 1-es szintű címsor (h1)",
      check: (doc) => {
        const h1s = doc.querySelectorAll('h1');
        return Array.from(h1s).some(h => h.textContent.includes('TRÓPUSI'));
      },
    },
    {
      id: "deli-gyumolcsok-p",
      label: "8. A \"Déli gyümölcsök\" szöveg bekezdésekbe kerültek és alkalmazza a my-3 osztályjelölőt",
      check: (doc) => {
        const erdei = doc.querySelector('#erdei');
        if (!erdei) return false;
        return erdei.querySelectorAll('p.my-3').length >= 2;
      },
    },
    {
      id: "ananasz-bold-italic",
      label: "9. Az ananász neve félkövér, latin neve dőlt",
      check: (doc) => {
        const bolds = doc.querySelectorAll('b, strong');
        const hasBold = Array.from(bolds).some(b => b.textContent.toLowerCase().includes('ananász'));
        const italics = doc.querySelectorAll('i, em');
        const hasItalic = Array.from(italics).some(i => i.textContent.includes('Ananas'));
        return hasBold && hasItalic;
      },
    },
    {
      id: "col-lg-4",
      label: "10. Az Ananász/Banán/Papaya/Licsi/Gránátalma oszlopok col-lg-4 méretűek (3 oszlopos elrendezés)",
      check: (doc) => {
        const cols = doc.querySelectorAll('.col-lg-4');
        return cols.length >= 5;
      },
    },
    {
      id: "banan-ul",
      label: "11. A banán receptek számozatlan felsorolásban (ul#banan)",
      check: (doc) => doc.querySelector('ul#banan') !== null && doc.querySelector('ul#banan li') !== null,
    },
    {
      id: "sarkanygyumolcs-h3",
      label: "12. A Sárkánygyümölcs részben van 3-as szintű címsor",
      check: (doc) => {
        const h3s = doc.querySelectorAll('h3');
        return Array.from(h3s).some(h => h.textContent.includes('Sárkánygyümölcs'));
      },
    },
    {
      id: "sarkanygyumolcs-img",
      label: "13. A Sárkánygyümölcs kép forrása img/pitaja.jpg",
      check: (doc) => doc.querySelector('img[src*="pitaja"]') !== null,
    },
    {
      id: "granatama-ol",
      label: "14. A gránátalma előnyei számozott felsorolásban (ol)",
      check: (doc) => {
        const h3s = doc.querySelectorAll('h3');
        const granatH3 = Array.from(h3s).find(h => h.textContent.includes('Gránátalma'));
        if (!granatH3) return false;
        const container = granatH3.closest('.col-sm-12');
        return container && container.querySelector('ol li') !== null;
      },
    },
    {
      id: "table-th",
      label: "15. A táblázat fejlécében elkészítette az 5 fejléc cellát",
      check: (doc) => {
        const ths = doc.querySelectorAll('#tablazat thead th');
        return ths.length >= 5;
      },
    },
    {
      id: "table-rows",
      label: "16. A táblázatba bekerültek az adatsorok (Ananász, Banán, stb.)",
      check: (doc) => {
        const tds = doc.querySelectorAll('#tablazat tbody td');
        return tds.length >= 4;
      },
    },
    {
      id: "footer-link",
      label: "17. A láblécben van hivatkozás a \"leiras\" azonosítóra \"Ugrás az elejére\" szöveggel",
      check: (doc) => {
        const link = doc.querySelector('.lablec a[href="#leiras"]');
        return link && link.textContent.includes('Ugrás az elejére');
      },
    },
    {
      id: "css-body-font",
      label: "18. CSS: Az oldal betűtípusa Gill Sans (vagy hasonló)",
      check: (doc, html, css) => css && /body\s*\{[^}]*font-family\s*:\s*['"]?Gill\s*Sans/i.test(css),
      cssCheck: true,
    },
    {
      id: "css-fejlec-width",
      label: "19. CSS: A fejlec azonosítóra 100%-os szélesség van beállítva",
      check: (doc, html, css) => css && /#fejlec\s*\{[^}]*width\s*:\s*100%/i.test(css),
      cssCheck: true,
    },
    {
      id: "css-h3-color",
      label: "20. CSS: A h3 betűszíne fekete",
      check: (doc, html, css) => css && /h3\s*\{[^}]*color\s*:\s*black/i.test(css),
      cssCheck: true,
    },
    {
      id: "css-h3-fontsize",
      label: "21. CSS: A h3 betűmérete 2.5em",
      check: (doc, html, css) => css && /h3\s*\{[^}]*font-size\s*:\s*2\.5em/i.test(css),
      cssCheck: true,
    },
    {
      id: "css-nav-border",
      label: "22. CSS: A navigáció listaelemére 3px vastag, pontozott jobb szegélyt állított",
      check: (doc, html, css) => css && /nav\s+li\s*\{[^}]*border(-right)?\s*:[^;]*3px[^;]*dotted/i.test(css),
      cssCheck: true,
    },
    {
      id: "css-nav-padding",
      label: "23. CSS: A navigáció listaelemének vízszintes belső margója 15px",
      check: (doc, html, css) => css && /nav\s+li\s*\{[^}]*padding\s*:\s*0\s*15px/i.test(css),
      cssCheck: true,
    },
    {
      id: "css-lablec-bold",
      label: "24. CSS: A lablec osztály hivatkozása félkövér",
      check: (doc, html, css) => css && /\.lablec\s+a\s*\{[^}]*font-weight\s*:\s*bold/i.test(css),
      cssCheck: true,
    },
    {
      id: "css-lablec-hover",
      label: "25. CSS: Ha a lablec osztály hivatkozása fölé visszük az egeret, nagybetűs",
      check: (doc, html, css) => css && /\.lablec\s+a:hover\s*\{[^}]*text-transform\s*:\s*uppercase/i.test(css),
      cssCheck: true,
    },
    {
      id: "css-p-justify",
      label: "26. CSS: A bekezdések sorkizártak",
      check: (doc, html, css) => css && /p\s*\{[^}]*text-align\s*:\s*justify/i.test(css),
      cssCheck: true,
    },
    {
      id: "css-banan-image",
      label: "27. CSS: A banan azonosítóra banan_ikon.png listaelem kép van beállítva",
      check: (doc, html, css) => css && /#banan\s*\{[^}]*list-style-image\s*:\s*url\([^)]*banan_ikon\.png/i.test(css),
      cssCheck: true,
    },
    {
      id: "css-banan-margin",
      label: "28. CSS: A banan azonosító bal külső margója 25px",
      check: (doc, html, css) => css && /#banan\s*\{[^}]*margin-left\s*:\s*25px/i.test(css),
      cssCheck: true,
    },
    {
      id: "html-validated",
      label: "29. HTML validálás képernyőképe feltöltve",
      check: () => validationImages.html !== null,
    },
    {
      id: "css-validated",
      label: "30. CSS validálás képernyőképe feltöltve",
      check: () => validationImages.css !== null,
    },
  ],
},
};

let currentTask = null;
let htmlEditor;
let cssEditor;
let debounceTimer;
let lastParsedHtml = null;
let cachedStudentDoc = null;
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

// ── Progress tracking ─────────────────────────────────────────────────────
const _progressPosted = new Set(); // "email:web:taskId" – session per post

function maybePostProgress() {
  const kandoRaw = sessionStorage.getItem('kandoUser');
  if (!kandoRaw || !currentTask) return;
  const score = parseInt(scoreCurrent?.textContent || '0');
  const total = parseInt(scoreTotal?.textContent || '0');
  if (score <= 0 || total <= 0) return;
  let u;
  try { u = JSON.parse(kandoRaw); } catch { return; }
  const email = u.email;
  if (!email) return;
  const key = `${email}:web:${currentTask.id}`;
  if (_progressPosted.has(key)) return;
  _progressPosted.add(key);
  fetch('https://agazati.up.railway.app/api/progress', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email,
      nev: u.nev || '',
      osztaly: u.osztaly ? `${u.evfolyam || ''}.${u.osztaly}` : '',
      targy: 'web',
      feladat: currentTask.id,
      pont: score,
      maxPont: total
    })
  }).catch(() => {});
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

  // Validálás képek mentése (try/catch: base64 képek nagyok lehetnek)
  try {
    const validHtmlKey = getStorageKey(currentTask.id, 'validHtml');
    const validCssKey  = getStorageKey(currentTask.id, 'validCss');
    if (validHtmlKey) localStorage.setItem(validHtmlKey, validationImages.html || '');
    if (validCssKey)  localStorage.setItem(validCssKey,  validationImages.css  || '');
  } catch (e) { /* localStorage quota: nem kritikus */ }

  // Éles módban backend szinkron
  if (typeof acLive !== 'undefined' && acLive) submitWebToBackend();
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
    // Validálás képek visszatöltése
    const validHtmlKey = getStorageKey(taskId, 'validHtml');
    const validCssKey  = getStorageKey(taskId, 'validCss');
    const validHtml = validHtmlKey ? localStorage.getItem(validHtmlKey) : null;
    const validCss  = validCssKey  ? localStorage.getItem(validCssKey)  : null;
    if (validHtml) { validationImages.html = validHtml; }
    if (validCss)  { validationImages.css  = validCss;  }
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
  const validHtmlKey = getStorageKey(taskId, 'validHtml');
  const validCssKey  = getStorageKey(taskId, 'validCss');
  if (validHtmlKey) localStorage.removeItem(validHtmlKey);
  if (validCssKey)  localStorage.removeItem(validCssKey);
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
    if (btnStarter) btnStarter.disabled = true;
    if (btnSampleImg) btnSampleImg.disabled = true;
    if (btnSources) btnSources.disabled = true;
    if (btnPreviewNewTab) btnPreviewNewTab.disabled = true;
    if (htmlEditor) htmlEditor.setValue('');
    if (cssEditor) cssEditor.setValue('');
    if (descFrame) descFrame.src = 'about:blank';
    statusEl.textContent = 'Válassz feladatot a kezdéshez…';
    updateProgressBar(0, 0);
    return;
  }

  const task = availableTasks[taskId];
  if (!task) return;

  currentTask = task;
  lastParsedHtml = null;
  cachedStudentDoc = null;
  if (btnStarter) btnStarter.disabled = false;
  if (btnSampleImg) btnSampleImg.disabled = !task.sampleImage;
  if (btnSources) {
    btnSources.disabled = !task.sourceFiles || task.sourceFiles.length === 0;
    btnSources.textContent = 'Forrás';
  }
  sourcesVisible = false;
  if (btnPreviewNewTab) btnPreviewNewTab.disabled = false;
  if (btnSaveFile) btnSaveFile.disabled = false;

  if (descFrame && task.taskDescFile) {
    descFrame.src = task.basePath + task.taskDescFile + '?v=3';
  }

  // Éles módban mindig friss kiindulást töltünk (korábbi gyakorló munka nem töltődik be)
  const saved = (acLive || liveModeDetected) ? null : loadFromLocalStorage(taskId);

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
  const lampDots = document.getElementById('lamp-dots');
  if (lampDots && currentTask) {
    lampDots.innerHTML = currentTask.checks.map(chk =>
      `<span class="lamp-dot lamp-red" title="\u2717 ${(chk.label || '').replace(/"/g, '&quot;')}"></span>`
    ).join('');
  }
  updateProgressBar(0, currentTask ? currentTask.checks.length : 0);
}

// Progress bar frissítése
function getWebGradeThresholds() {
  return new Date() >= new Date('2026-05-01')
    ? { t5: 85, t4: 70, t3: 55, t2: 40 }   // 2026. május 1-től
    : { t5: 80, t4: 60, t3: 40, t2: 20 };  // 2026. április 30-ig
}

function calcWebGrade(pct) {
  const t = getWebGradeThresholds();
  if (pct >= t.t5) return 5;
  if (pct >= t.t4) return 4;
  if (pct >= t.t3) return 3;
  if (pct >= t.t2) return 2;
  return 1;
}

function updateGradeBadge(score, max) {
  const badge = document.getElementById('grade-badge');
  if (!badge) return;
  if (!max || score === undefined) { badge.style.display = 'none'; return; }
  const pct = score / max * 100;
  const grade = calcWebGrade(pct);
  let color, bg, border;
  if      (grade === 5) { color = '#4ade80'; bg = '#052e16'; border = '#16a34a'; }
  else if (grade === 4) { color = '#a3e635'; bg = '#1a2e05'; border = '#65a30d'; }
  else if (grade === 3) { color = '#fbbf24'; bg = '#2d1b00'; border = '#d97706'; }
  else if (grade === 2) { color = '#fb923c'; bg = '#2d1200'; border = '#ea580c'; }
  else                  { color = '#f87171'; bg = '#2d0a0a'; border = '#dc2626'; }
  badge.textContent = 'Érdemjegy: ' + grade;
  badge.style.color = color;
  badge.style.background = bg;
  badge.style.borderColor = border;
  badge.style.display = 'inline-block';
}

function updateProgressBar(completed, total) {
  if (scoreCurrent) scoreCurrent.textContent = completed;
  if (scoreTotal) scoreTotal.textContent = (currentTask && currentTask.maxPoints) ? currentTask.maxPoints : total;
  updateGradeBadge(completed, 40);
  if (!progressBar) return;

  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
  progressBar.style.width = `${percent}%`;

  if (percent === 100) {
    progressBar.style.background = 'linear-gradient(90deg, #10b981, #34d399)';
    if (scoreCurrent) scoreCurrent.style.color = '#10b981';
  } else if (percent >= 60) {
    progressBar.style.background = 'linear-gradient(90deg, #f59e0b, #fbbf24)';
    if (scoreCurrent) scoreCurrent.style.color = '#f59e0b';
  } else {
    progressBar.style.background = 'linear-gradient(90deg, #3b82f6, #60a5fa)';
    if (scoreCurrent) scoreCurrent.style.color = '#60a5fa';
  }
}

function renderTasks(results) {
  const completed = results.filter(r => r.done).length;
  const total = results.length;
  updateProgressBar(completed, total);

  const lampDots = document.getElementById('lamp-dots');
  if (lampDots && currentTask) {
    lampDots.innerHTML = results.map((r, i) => {
      const chk = currentTask.checks[i];
      const label = chk ? chk.label : `${i + 1}.`;
      const cls   = r.done ? 'lamp-green' : 'lamp-red';
      const icon  = r.done ? '\u2713' : '\u2717';
      return `<span class="lamp-dot ${cls}" title="${icon} ${label.replace(/"/g, '&quot;')}"></span>`;
    }).join('');
  }

  if (completed > 0) maybePostProgress();
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

  const baseHref = currentTask ? currentTask.previewBase : "";

  const bootstrapCSS = currentTask
    ? `<link href="${baseHref}bootstrap/bootstrap.min.css" rel="stylesheet" />`
    : `<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet" />`;

  const bootstrapJS = currentTask
    ? `<script src="${baseHref}bootstrap/bootstrap.bundle.min.js"></script>`
    : `<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>`;

  // CSS csak akkor alkalmazódik, ha a tanuló beírta: <link rel="stylesheet" href="css/style.css">
  const cssLinkPattern = /<link[^>]+href=["'][^"']*css\/style\.css["'][^>]*\/?>/i;
  const htmlWithCss = cssLinkPattern.test(html)
    ? html.replace(cssLinkPattern, `<style>${css}</style>`)
    : html;

  const htmlForPreview = annotateHtmlWithSourceLines(htmlWithCss);

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
  </body>
</html>`;
}

function updatePreview() {
  if (!htmlEditor || !cssEditor) return;

  statusEl.textContent = "Frissítés...";
  const html = htmlEditor.getValue();
  const css = cssEditor.getValue();

  // Scoring frissítése (preview nélkül)
  if (currentTask && currentTask.checks) {
    if (html !== lastParsedHtml) {
      cachedStudentDoc = parseStudentHtml(html);
      lastParsedHtml = html;
    }
    const results = currentTask.checks.map((task) => ({
      done: task.check(cachedStudentDoc, html, css),
    }));
    renderTasks(results);
    statusEl.textContent = (acLive || liveModeDetected) ? '✓ Mentve' : `Frissítve: ${new Date().toLocaleTimeString("hu-HU")}`;
  }

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
  if (!htmlEditor || !preview || !preview.contentWindow) return;
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

let webFontSize = 18;
function changeWebFontSize(delta) {
  webFontSize = Math.min(36, Math.max(10, webFontSize + delta));
  try { if (htmlEditor) htmlEditor.updateOptions({ fontSize: webFontSize }); } catch(e) {}
  try { if (cssEditor) cssEditor.updateOptions({ fontSize: webFontSize }); } catch(e) {}
  const display = document.getElementById('web-font-size-display');
  if (display) display.textContent = webFontSize + 'px';
}

function createEditor(monaco, elementId, language, value) {
  const editor = monaco.editor.create(document.getElementById(elementId), {
    value,
    language,
    automaticLayout: true,
    bracketPairColorization: { enabled: true },
    guides: { bracketPairs: true },
    minimap: { enabled: false },
    fontSize: 18,
    lineHeight: 26,
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
    if (e.changes[0].text !== '>') return;

    const model = editor.getModel();
    const position = editor.getPosition();
    if (!model || !position) return;

    const lineContent = model.getLineContent(position.lineNumber);
    // beforeCursor tartalmazza a most beírt '>'-t is (position.column a '>' utáni pozíció)
    const beforeCursor = lineContent.substring(0, position.column - 1);

    // Self-closing tag kizárása (pl. <br/> vagy <img/>)
    if (beforeCursor.endsWith('/>')) return;

    // Nyitó tag felismerése: <tagname ...>
    const tagMatch = beforeCursor.match(/<([a-zA-Z][\w-]*)(?:\s[^>]*)?>$/);
    if (!tagMatch) return;

    const tagName = tagMatch[1].toLowerCase();
    const voidElements = ['area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr'];
    if (voidElements.includes(tagName)) return;

    // Már ott van-e a záró tag?
    const afterCursor = lineContent.substring(position.column - 1);
    if (afterCursor.startsWith(`</${tagName}>`)) return;

    editor.executeEdits('auto-close-tag', [{
      range: new monaco.Range(position.lineNumber, position.column, position.lineNumber, position.column),
      text: `</${tagName}>`,
      forceMoveMarkers: false
    }]);
    editor.setPosition(position);
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
  // Nyitóoldalról átadott adat (sessionStorage) – mindig elsőbbséget élvez,
  // mert ez az aktuális belépés adatát tartalmazza (diák VAGY oktató)
  const session = sessionStorage.getItem('kandStudentData');
  if (session) {
    try {
      studentData = JSON.parse(session);
      saveStudentData(); // frissíti a localStorage-t is
      updateStudentDisplay();
      return true;
    } catch (e) { /* folytatjuk */ }
  }
  // Portálos belépés: kandoUser sessionStorage-ból
  const kandoRaw = sessionStorage.getItem('kandoUser');
  if (kandoRaw) {
    try {
      const u = JSON.parse(kandoRaw);
      if (u.nev) {
        studentData.name  = u.nev;
        studentData.email = u.email || '';
        studentData.class = u.evfolyam && u.osztaly ? `${u.evfolyam}.${u.osztaly}` : (u.szerep === 'oktato' ? 'Oktató' : '');
        saveStudentData();
        updateStudentDisplay();
        return true;
      }
    } catch (e) { /* folytatjuk */ }
  }
  // Visszatérő tanuló: localStorage (csak ha nincs sessionStorage adat)
  const saved = localStorage.getItem('vizsga_student');
  if (saved) {
    try {
      studentData = JSON.parse(saved);
      updateStudentDisplay();
      return true;
    } catch (e) { /* folytatjuk */ }
  }
  return false;
}

function saveStudentData() {
  localStorage.setItem('vizsga_student', JSON.stringify(studentData));
}

function updateStudentDisplay() {
  if (studentData.name && studentData.class) {
    studentInfo.textContent = studentData.name;
  } else {
    studentInfo.textContent = '';
  }
  // Kijelentkezés gomb: portálon keresztül → "🏠 Főmenü", különben marad az ikon
  const isBemutato = new URLSearchParams(location.search).get('bemutato') === '1';
  const btnLogoutEl = document.getElementById('btn-logout');
  if (btnLogoutEl) {
    if (sessionStorage.getItem('kandoUser') || isBemutato) {
      btnLogoutEl.innerHTML = '<i class="fas fa-house"></i> Főmenü';
      btnLogoutEl.title = 'Vissza a főmenübe';
      btnLogoutEl.style.background = 'transparent';
      btnLogoutEl.style.color = '#9ca3af';
      btnLogoutEl.style.borderColor = '#6b7280';
      btnLogoutEl.style.borderRadius = '8px';
      btnLogoutEl.style.padding = '4px 12px';
      btnLogoutEl.style.fontWeight = '600';
      btnLogoutEl.onmouseover = () => { btnLogoutEl.style.background = '#6b7280'; btnLogoutEl.style.color = 'white'; };
      btnLogoutEl.onmouseout  = () => { btnLogoutEl.style.background = 'transparent'; btnLogoutEl.style.color = '#9ca3af'; };
    } else {
      btnLogoutEl.innerHTML = '<i class="fas fa-right-from-bracket"></i>';
      btnLogoutEl.title = 'Kijelentkezés';
    }
  }
  // Python váltó gomb + mód jelző badge
  const switchBtn = document.getElementById('btn-switch-python');
  const modeBadge = document.getElementById('mode-badge');
  const kandoUser = JSON.parse(sessionStorage.getItem('kandoUser') || '{}');

  function setModeBadge(isLive) {
    if (!modeBadge) return;
    if (isLive) {
      modeBadge.innerHTML = '<i class="fas fa-circle-dot" style="color:#e94560;"></i> SZÁMONKÉRÉS';
      modeBadge.style.cssText += ';display:inline-block;background:#3d0a12;border:1.5px solid #e94560;color:#ff6b81;';
    } else {
      modeBadge.innerHTML = '<i class="fas fa-graduation-cap" style="color:#2ed573;"></i> GYAKORLÓ MÓD';
      modeBadge.style.cssText += ';display:inline-block;background:#0a3d1a;border:1.5px solid #2ed573;color:#4fffaa;';
    }
  }

  if (sessionStorage.getItem('kandoUser') && studentData.name) {
    if (kandoUser.szerep === 'oktato') {
      if (switchBtn) switchBtn.style.display = 'inline-block';
      // Oktató is látja a valódi módot, de anti-cheat nem indul
      fetch('https://agazati.up.railway.app/api/config')
        .then(r => r.json())
        .then(data => {
          const isLive = data.test_mode === 'live' || data.test_mode === 'vizsga';
          setModeBadge(isLive);
          if (isLive) {
            liveModeDetected = true;
            Object.keys(availableTasks).forEach(id => clearLocalStorage(id));
            // Timer visszaállítása 60 percre (korábbi gyakorló értéket töröljük)
            stopTimer();
            timerSeconds = 60 * 60;
            updateTimerDisplay();
            const tk = getTimerStorageKey(); if (tk) localStorage.removeItem(tk);
            const btnSubmitExam = document.getElementById('btn-submit-exam');
            if (btnSubmitExam) btnSubmitExam.style.display = 'inline-block';
            if (btnTimerToggle) btnTimerToggle.style.display = 'none';
            if (btnTimerReset)  btnTimerReset.style.display  = 'none';
            if (btnLoadFile)    btnLoadFile.style.display    = 'none';
            if (btnSaveFile)    btnSaveFile.style.display    = 'none';
          }
        })
        .catch(() => { setModeBadge(false); });
    } else {
      fetch('https://agazati.up.railway.app/api/config')
        .then(r => r.json())
        .then(data => {
          const isVizsga = data.test_mode === 'vizsga';
          const isLive   = data.test_mode === 'live' || isVizsga;
          if (!isLive && switchBtn) switchBtn.style.display = 'inline-block';
          setModeBadge(isLive);
          if (isLive) {
            liveModeDetected = true;
            Object.keys(availableTasks).forEach(id => clearLocalStorage(id));
            // Timer visszaállítása 60 percre (korábbi gyakorló értéket töröljük)
            stopTimer();
            timerSeconds = 60 * 60;
            updateTimerDisplay();
            const tk2 = getTimerStorageKey(); if (tk2) localStorage.removeItem(tk2);
            btnTimerToggle.style.display = 'none';
            btnTimerReset.style.display  = 'none';
            if (btnLoadFile) btnLoadFile.style.display = 'none';
            if (btnSaveFile) btnSaveFile.style.display = 'none';
            const btnSubmitExam = document.getElementById('btn-submit-exam');
            if (btnSubmitExam) btnSubmitExam.style.display = 'inline-block';
          }
          if (isVizsga && data.vizsga_vege) {
            scheduleVizsgaDeadline(data.vizsga_vege);
          }
        })
        .catch(() => { setModeBadge(false); });
    }
  } else if (switchBtn) {
    switchBtn.style.display = 'none';
  }
}

function logoutStudent() {
  const isBemutato = new URLSearchParams(location.search).get('bemutato') === '1';
  if (sessionStorage.getItem('kandoUser') || isBemutato) {
    // Vizsga módban: web rész befejezettnek jelölve
    if (typeof acLive !== 'undefined' && acLive) {
      sessionStorage.setItem('vizsga_web_beadva', '1');
      submitWebToBackend();
    }
    location.replace('../portal.html');
    return;
  }

  if (!confirm('Biztosan kijelentkezel? A munkád mentve marad, de másik tanuló is bejelentkezhet.')) {
    return;
  }

  // Időzítő leállítása
  stopTimer();

  // Tanuló adatok törlése
  localStorage.removeItem('vizsga_student');
  sessionStorage.removeItem('kandStudentData');
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
  if (descFrame) descFrame.src = 'about:blank';
  currentTask = null;

  // Gombok letiltása
  if (btnStarter) btnStarter.disabled = true;
  if (btnSampleImg) btnSampleImg.disabled = true;
  if (btnSources) btnSources.disabled = true;
  if (btnPreviewNewTab) btnPreviewNewTab.disabled = true;
  if (btnSaveFile) btnSaveFile.disabled = true;

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
  btnTimerToggle.innerHTML = '<i class="fas fa-pause"></i>';
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
      if (typeof acLive !== 'undefined' && acLive) {
        triggerVizsgaDeadline();
      } else {
        alert('Az idő lejárt! Mentsd el a munkádat!');
      }
    }
  }, 1000);
}

function stopTimer() {
  timerRunning = false;
  btnTimerToggle.innerHTML = '<i class="fas fa-play"></i>';
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

// Validálás képek betöltése (fájlból)
function loadValidationImage(type, file) {
  return loadValidationImageBlob(type, file, file.name);
}

// Validálás kép betöltése blob-ból (vágólapról vagy fájlból)
function loadValidationImageBlob(type, blob, fileName) {
  const name = fileName || `${type}-validalas.png`;
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      validationImages[type] = e.target.result;
      validationImages[`${type}FileName`] = name;
      statusEl.textContent = `${type.toUpperCase()} validálás kép elmentve: ${name}`;
      saveToLocalStorage(); // pont ne vesszen el frissítéskor
      resolve();
      updatePreview();
    };
    reader.readAsDataURL(blob);
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
  const modal = document.getElementById('sample-img-modal');
  const img = document.getElementById('sample-img-modal-img');
  img.src = currentTask.basePath + currentTask.sampleImage;
  modal.style.display = 'flex';
}

function closeSampleImgModal() {
  const modal = document.getElementById('sample-img-modal');
  modal.style.display = 'none';
  document.getElementById('sample-img-modal-img').src = '';
}

let sourcesVisible = false;

async function toggleSources() {
  if (!currentTask || !currentTask.sourceFiles) return;

  if (sourcesVisible) {
    // Vissza a feladatleíráshoz
    sourcesVisible = false;
    btnSources.textContent = 'Forrás';
    if (descFrame && currentTask.taskDescFile) {
      descFrame.removeAttribute('srcdoc');
      descFrame.src = currentTask.basePath + currentTask.taskDescFile + '?v=3';
    }
    return;
  }

  // Forrás megjelenítése a leírás helyén
  sourcesVisible = true;
  btnSources.textContent = 'Feladatleírás';

  // Fájlok betöltése a főablak kontextusában
  const files = currentTask.sourceFiles;
  const basePath = currentTask.basePath;
  let blocksHtml = '';

  for (const file of files) {
    try {
      const response = await fetch(basePath + file.name);
      const text = response.ok ? await response.text() : '(Hiba a betöltéskor)';
      const div = document.createElement('div');
      div.textContent = text;
      const escaped = div.innerHTML;
      blocksHtml += `
        <div class="source-block">
          <h2>${file.label}</h2>
          <pre class="source-text" onclick="copyText(this)">${escaped}</pre>
          <small>Kattints a szövegre a másoláshoz!</small>
        </div>`;
    } catch (e) {
      blocksHtml += `<div class="source-block"><h2>${file.label}</h2><p>Hiba a betöltéskor</p></div>`;
    }
  }

  descFrame.srcdoc = `<!DOCTYPE html>
<html lang="hu">
<head>
  <meta charset="utf-8">
  <style>
    * { box-sizing: border-box; }
    body {
      font-family: "Segoe UI", Tahoma, sans-serif;
      background: #0f172a; color: #e2e8f0;
      margin: 0; padding: 16px; line-height: 1.6;
    }
    .source-block {
      background: #1e293b; border: 1px solid #334155;
      border-radius: 12px; padding: 16px; margin-bottom: 16px;
    }
    h2 { color: #60a5fa; margin: 0 0 10px 0; font-size: 1rem; }
    .source-text {
      background: #0f172a; padding: 14px; border-radius: 8px;
      white-space: pre-wrap; word-break: break-word;
      font-family: monospace; font-size: 0.92rem; line-height: 1.7;
      cursor: pointer; border: 2px solid #334155; margin: 0;
      transition: border-color 0.15s, background 0.15s;
    }
    .source-text:hover { border-color: #60a5fa; background: #1e293b; }
    .source-text.copied { border-color: #22c55e; background: rgba(34,197,94,0.08); }
    small { display: block; margin-top: 6px; color: #64748b; font-size: 0.8rem; }
  </style>
</head>
<body>
  ${blocksHtml}
  <script>
    function copyText(el) {
      navigator.clipboard.writeText(el.textContent).then(() => {
        el.classList.add('copied');
        setTimeout(() => el.classList.remove('copied'), 1200);
      }).catch(() => {
        const r = document.createRange();
        r.selectNodeContents(el);
        window.getSelection().removeAllRanges();
        window.getSelection().addRange(r);
        document.execCommand('copy');
        el.classList.add('copied');
        setTimeout(() => el.classList.remove('copied'), 1200);
      });
    }
  <\/script>
</body>
</html>`;
}

// Előnézet új lapon megnyitása
function openPreviewInNewTab() {
  if (!htmlEditor || !cssEditor) return;
  // Anti-cheat grace: az előnézet új lapon nyílik → blur + visibilitychange elnémítva
  acPopupGrace = true;
  setTimeout(() => { acPopupGrace = false; }, 8000);

  const html = htmlEditor.getValue();
  const css = cssEditor.getValue();
  const baseHref = currentTask ? currentTask.previewBase : "";

  const bootstrapCSS = currentTask
    ? `<link href="${baseHref}bootstrap/bootstrap.min.css" rel="stylesheet" />`
    : `<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet" />`;

  const bootstrapJS = currentTask
    ? `<script src="${baseHref}bootstrap/bootstrap.bundle.min.js"><\/script>`
    : `<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"><\/script>`;

  // CSS csak akkor alkalmazódik, ha a tanuló beírta: <link rel="stylesheet" href="css/style.css">
  const cssLinkPatternTab = /<link[^>]+href=["'][^"']*css\/style\.css["'][^>]*\/?>/i;
  const htmlWithCssTab = cssLinkPatternTab.test(html)
    ? html.replace(cssLinkPatternTab, `<style>${css}</style>`)
    : html;

  const fullHtml = `<!doctype html>
<html lang="hu">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <base href="${baseHref}" />
    ${bootstrapCSS}
  </head>
  <body>
    ${htmlWithCssTab}
    ${bootstrapJS}
  </body>
</html>`;

  const previewWindow = window.open('', 'preview', 'width=1200,height=800,resizable=yes,scrollbars=yes');
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
// preview.addEventListener("load", ...) - eltávolítva, a scoring az updatePreview()-ban fut

window.addEventListener("message", (event) => {
  if (!event || !preview || event.source !== preview.contentWindow || !event.data) return;
  if (event.data.type !== "preview-line") return;
  const line = Number(event.data.line || 1);
  jumpToSourceLine(line);
});

taskSelector.addEventListener("change", (e) => {
  selectTask(e.target.value);
});

// Új lapon megnyitás eseménykezelők
// btnTaskDesc.addEventListener("click", openTaskDesc);
if (btnSampleImg) btnSampleImg.addEventListener("click", openSampleImg);
if (btnSources) btnSources.addEventListener("click", toggleSources);
if (btnPreviewNewTab) btnPreviewNewTab.addEventListener("click", openPreviewInNewTab);

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

// ── Referencia / Validátor drawer ────────────────────────────────────────────

const refDrawer     = document.getElementById('ref-drawer');
const refBackdrop   = document.getElementById('ref-drawer-backdrop');
const refTitle      = document.getElementById('ref-drawer-title');
const refScreenshot = document.getElementById('ref-drawer-screenshot');
const refCopyCode   = document.getElementById('ref-drawer-copy-code');
const refOpenPopup  = document.getElementById('ref-drawer-open-popup');
const refStatus     = document.getElementById('ref-drawer-screenshot-status');
const refStepsBox   = document.getElementById('ref-drawer-steps');
const refStepsTitle = document.getElementById('ref-steps-title');
const refStepsList  = document.getElementById('ref-steps-list');
const refCodePreview= document.getElementById('ref-code-preview');

let activeRefType = null;

const REF_CONFIG = {
  'w3s': {
    title: '📚 W3Schools – HTML/CSS referencia',
    url: 'https://www.w3schools.com/html/default.asp',
    popupW: 1100, popupH: 800,
    screenshot: false,
    codeType: null,
    steps: null,
  },
  'html-validator': {
    title: '✅ HTML Validator (W3C)',
    url: 'https://validator.w3.org/#validate_by_input',
    popupW: 1000, popupH: 750,
    screenshot: 'html',
    codeType: 'html',
    steps: [
      'Kattints a <b><i class="fas fa-clipboard"></i> Kód másolása</b> gombra (fent)',
      'Kattints a <b><i class="fas fa-arrow-up-right-from-square"></i> Megnyitás</b> gombra — megnyílik a validátor',
      'A validátorban illeszd be a kódot (<b>Ctrl+V</b>) a szövegmezőbe',
      'Kattints a <b>Check</b> gombra',
      'Készíts képernyőképet az eredményről (<b>Win+Shift+S</b>)',
      'Térj vissza ide és kattints a <b><i class="fas fa-camera"></i> Kép mentése</b> gombra',
    ],
  },
  'css-validator': {
    title: '✅ CSS Validator (W3C Jigsaw)',
    url: 'https://jigsaw.w3.org/css-validator/#validate_by_input',
    popupW: 1000, popupH: 750,
    screenshot: 'css',
    codeType: 'css',
    steps: [
      'Kattints a <b><i class="fas fa-clipboard"></i> Kód másolása</b> gombra (fent)',
      'Kattints a <b><i class="fas fa-arrow-up-right-from-square"></i> Megnyitás</b> gombra — megnyílik a validátor',
      'A validátorban illeszd be a kódot (<b>Ctrl+V</b>) a szövegmezőbe',
      'Kattints a <b>Check</b> gombra',
      'Készíts képernyőképet az eredményről (<b>Win+Shift+S</b>)',
      'Térj vissza ide és kattints a <b><i class="fas fa-camera"></i> Kép mentése</b> gombra',
    ],
  },
};

function openRefPanel(type) {
  const cfg = REF_CONFIG[type];
  if (!cfg) return;
  activeRefType = type;
  refTitle.textContent = cfg.title;
  refStatus.style.display = 'none';
  refStatus.className = 'ref-screenshot-status';

  // Kód előnézet és lépések (validátoroknál)
  if (cfg.codeType) {
    const code = cfg.codeType === 'html' ? (htmlEditor ? htmlEditor.getValue() : '') : (cssEditor ? cssEditor.getValue() : '');
    refCodePreview.value = code;
    refCodePreview.style.display = 'block';
    refStepsTitle.textContent = 'Hogyan validálj?';
    refStepsList.innerHTML = cfg.steps.map(s => `<li>${s}</li>`).join('');
    refStepsBox.style.display = 'block';
    refCopyCode.style.display = 'inline-flex';
    refScreenshot.style.display = 'inline-flex';
    refScreenshot.dataset.imgType = cfg.screenshot;
  } else {
    refCodePreview.style.display = 'none';
    refStepsBox.style.display = 'none';
    refCopyCode.style.display = 'none';
    refScreenshot.style.display = 'none';
  }

  refDrawer.classList.add('open');
  refBackdrop.classList.add('open');
}

function closeRefPanel() {
  refDrawer.classList.remove('open');
  refBackdrop.classList.remove('open');
  activeRefType = null;
}

refOpenPopup.addEventListener('click', () => {
  const cfg = REF_CONFIG[activeRefType];
  if (!cfg) return;
  const left = Math.round((screen.width - cfg.popupW) / 2);
  const top  = Math.round((screen.height - cfg.popupH) / 2);
  window.open(cfg.url, 'ref_popup',
    `width=${cfg.popupW},height=${cfg.popupH},left=${left},top=${top},resizable=yes,scrollbars=yes`);
});

refCopyCode.addEventListener('click', async () => {
  const cfg = REF_CONFIG[activeRefType];
  if (!cfg || !cfg.codeType) return;
  const code = refCodePreview.value;
  try {
    await navigator.clipboard.writeText(code);
    refCopyCode.innerHTML = '<i class="fas fa-check"></i> Másolva!';
    setTimeout(() => { refCopyCode.innerHTML = '<i class="fas fa-clipboard"></i> Kód másolása'; }, 2000);
  } catch {
    refCodePreview.select();
    document.execCommand('copy');
    refCopyCode.innerHTML = '<i class="fas fa-check"></i> Másolva!';
    setTimeout(() => { refCopyCode.innerHTML = '<i class="fas fa-clipboard"></i> Kód másolása'; }, 2000);
  }
});

async function captureFromClipboard(imgType) {
  refStatus.style.display = 'none';
  try {
    const items = await navigator.clipboard.read();
    for (const item of items) {
      const imgMime = item.types.find(t => t.startsWith('image/'));
      if (imgMime) {
        const blob = await item.getType(imgMime);
        await loadValidationImageBlob(imgType, blob);
        showRefStatus('ok', `✔ ${imgType.toUpperCase()} validálás kép elmentve!`);
        return;
      }
    }
    showRefStatus('err', '✖ Nincs kép a vágólapon! Készíts előbb képernyőképet (Win+Shift+S).');
  } catch {
    showRefStatus('err', '✖ Vágólap hozzáférés megtagadva. Engedélyezd a böngésző felugró ablakban, majd próbáld újra.');
  }
}

function showRefStatus(type, msg) {
  refStatus.textContent = msg;
  refStatus.className = `ref-screenshot-status ${type}`;
  refStatus.style.display = 'block';
}

refScreenshot.addEventListener('click', () => {
  const imgType = refScreenshot.dataset.imgType;
  if (imgType) captureFromClipboard(imgType);
});
document.getElementById('ref-drawer-close').addEventListener('click', closeRefPanel);
refBackdrop.addEventListener('click', closeRefPanel);

btnStarter.addEventListener("click", async () => {
  if (!currentTask || !htmlEditor || !cssEditor) return;

  const confirmed = confirm("Biztosan betöltöd a kiindulási fájlokat? A jelenlegi munkád felülíródik!");
  if (!confirmed) return;

  statusEl.textContent = 'Kiindulási fájlok betöltése…';
  const files = await loadTaskFiles(currentTask);

  if (files) {
    lastParsedHtml = null;
    cachedStudentDoc = null;
    validationImages.html = null;
    validationImages.htmlFileName = null;
    validationImages.css = null;
    validationImages.cssFileName = null;
    clearLocalStorage(currentTask.id);
    renderTaskChecks();
    htmlEditor.setValue(files.html);
    cssEditor.setValue(files.css);
    statusEl.textContent = 'Kiindulási fájlok betöltve';
    updatePreview();
  }
});

if (btnBlocks) btnBlocks.addEventListener("click", () => {
  showBlockGuides = !showBlockGuides;
  btnBlocks.classList.toggle("is-active", showBlockGuides);
  updatePreview();
});

if (btnInteract) btnInteract.addEventListener("click", () => {
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
tabCssValidator.addEventListener('click', () => openRefPanel('css-validator'));
btnW3schools.addEventListener('click', () => {
  acPopupGrace = true;
  setTimeout(() => { acPopupGrace = false; }, 4000);
  const cfg = REF_CONFIG['w3s'];
  const left = Math.round((screen.width - cfg.popupW) / 2);
  const top  = Math.round((screen.height - cfg.popupH) / 2);
  window.open(cfg.url, 'ref_popup',
    `width=${cfg.popupW},height=${cfg.popupH},left=${left},top=${top},resizable=yes,scrollbars=yes`);
});
btnHtmlValidator.addEventListener('click', () => openRefPanel('html-validator'));

// Feladatok szekció összecsukása
if (btnToggleTasks) btnToggleTasks.addEventListener('click', () => {
  if (tasksSection) tasksSection.classList.toggle('collapsed');
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
        // HTML tokenek
        { token: "tag",                        foreground: "29D7FF", fontStyle: "bold" },
        { token: "tag.html",                   foreground: "29D7FF", fontStyle: "bold" },
        { token: "metatag",                    foreground: "29D7FF", fontStyle: "bold" },
        { token: "metatag.html",               foreground: "29D7FF", fontStyle: "bold" },
        { token: "delimiter",                  foreground: "C8D0DA" },
        { token: "delimiter.html",             foreground: "C8D0DA" },
        { token: "attribute.name",             foreground: "FFD740", fontStyle: "bold" },
        { token: "attribute.name.html",        foreground: "FFD740", fontStyle: "bold" },
        { token: "attribute.value",            foreground: "69F0AE", fontStyle: "bold" },
        { token: "attribute.value.html",       foreground: "69F0AE", fontStyle: "bold" },
        { token: "string",                     foreground: "69F0AE" },
        { token: "string.html",                foreground: "69F0AE", fontStyle: "bold" },
        { token: "comment",                    foreground: "7F8C98", fontStyle: "italic" },
        { token: "comment.html",               foreground: "7F8C98", fontStyle: "italic" },
        // CSS tokenek
        { token: "selector.css",               foreground: "29D7FF", fontStyle: "bold" },
        { token: "keyword.css",                foreground: "FFD740", fontStyle: "bold" },
        { token: "attribute.value.css",        foreground: "69F0AE", fontStyle: "bold" },
        { token: "attribute.value.number.css", foreground: "FF9E64", fontStyle: "bold" },
        { token: "attribute.value.unit.css",   foreground: "FF9E64" },
        { token: "string.css",                 foreground: "69F0AE" },
        { token: "comment.css",                foreground: "7F8C98", fontStyle: "italic" },
        { token: "number",                     foreground: "FF9E64" },
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

    monaco.editor.setTheme('vizsga-contrast');

    htmlEditor = createEditor(monaco, "html-editor", "html", "");
    cssEditor = createEditor(monaco, "css-editor", "css", "");

    activateEmmet(monaco);

    // Auto Close Tag beállítása
    setupAutoCloseTag(htmlEditor, monaco);

    // Wrap gomb eseménykezelő + F1 billentyűparancs
    btnWrap.addEventListener('click', handleWrapButton);
    htmlEditor.addCommand(monaco.KeyCode.F1, handleWrapButton);
    cssEditor.addCommand(monaco.KeyCode.F1, handleWrapButton);

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
    const isBemutato = new URLSearchParams(location.search).get('bemutato') === '1';
    const hasStudentData = loadStudentData();
    if (isBemutato && !hasStudentData) {
      // Bemutató mód: nincs bejelentkezés szükséges
      studentData = { name: 'Sándorné Feke Réka', email: 'sandornef@kkszki.hu', class: 'Oktató' };
      updateStudentDisplay();
      hideStudentModal();
      taskSelector.disabled = false;
    } else if (hasStudentData) {
      // Van mentett tanuló adat – nem kell újra bejelentkezni
      hideStudentModal();
      window._webStartTime = Date.now();
      taskSelector.disabled = false;
      restoreTimer();
      updateTimerDisplay();
    } else {
      // Nincs bejelentkezett felhasználó → visszairányítás a portálra
      location.replace('../portal.html');
    }

    statusEl.textContent = "Válassz feladatot a kezdéshez…";

    // Anti-cheat inicializálás (test mode lekérdezése után)
    const acKandoUser = (() => { try { return JSON.parse(sessionStorage.getItem('kandoUser') || '{}'); } catch { return {}; } })();
    if (acKandoUser.szerep !== 'oktato') {
      fetch('https://agazati.up.railway.app/api/config')
        .then(r => r.json())
        .then(data => { initAntiCheat(data.test_mode === 'live'); })
        .catch(() => { initAntiCheat(false); });
    } else {
      // Ctrl+T/N blokkolás oktatónál is
      initAntiCheat(false);
    }

  } catch (error) {
    console.error(error);
    statusEl.textContent = "Editor hiba (Monaco/nyelvi modul). Nézd meg a konzolt.";
  }
})();

// WEB beadás a backendbe (éles módban autosave hívja)
async function submitWebToBackend() {
  if (!studentData.name || !studentData.email) return;
  const htmlCode = htmlEditor ? htmlEditor.getValue() : '';
  const cssCode  = cssEditor  ? cssEditor.getValue()  : '';
  if (!htmlCode && !cssCode) return;
  // Aktuális pontszám és max olvasása az UI-ból
  const scoreVal = parseInt(scoreCurrent?.textContent || '0') || 0;
  const maxVal   = 40;
  const payload = {
    name:         studentData.name,
    email:        studentData.email,
    osztaly:      studentData.class || '',
    csoport:      null,
    taskIds:      currentTask ? (currentTask.id || '') : '',
    scores:       String(scoreVal),
    maxScores:    String(maxVal),
    totalScore:   scoreVal,
    maxTotal:     maxVal,
    duration:     Math.round((Date.now() - (window._webStartTime || Date.now())) / 1000),
    mode:         'live',
    codeSnapshot: JSON.stringify({ html: htmlCode, css: cssCode, savedAt: new Date().toISOString() }),
    subject:      'web'
  };
  try {
    await fetch('https://agazati.up.railway.app/api/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  } catch {}
}

// ═══════════════════════════════════════════════════════
// ANTI-CHEAT RENDSZER
// ═══════════════════════════════════════════════════════
let acLive = false;
let liveModeDetected = false;
let acWarnings = 0;
const AC_MAX = 3;
let acPopupGrace = false;  // W3S/validator popup nyitásakor igaz → blur ignorálva

// Engedélyezett popup ablakok megnyitásakor grace periódus
(function patchRefPopup() {
  const btn = document.getElementById('ref-drawer-open-popup');
  if (!btn) return;
  const orig = btn.onclick;
  btn.addEventListener('click', () => { acPopupGrace = true; setTimeout(() => { acPopupGrace = false; }, 4000); }, true);
})();

function acShow(reason) {
  if (!acLive) return;
  acWarnings++;
  const overlay = document.getElementById('ac-overlay');
  if (!overlay) return;
  document.getElementById('ac-text').textContent = reason;
  document.getElementById('ac-count').textContent = acWarnings + '. figyelmeztetés / ' + AC_MAX;
  if (acWarnings >= AC_MAX) {
    document.getElementById('ac-title').textContent = '⛔ Szabályszegés rögzítve';
    document.getElementById('ac-count').textContent = 'A dolgozatod zárolva. Értesítsd az oktatót!';
    document.getElementById('ac-close-btn').textContent = 'Vissza a főmenübe';
    document.getElementById('ac-close-btn').onclick = function() { acLive = false; location.replace('../portal.html'); };
    acLive = false;
  }
  overlay.style.display = 'flex';
}

function acClose() {
  const overlay = document.getElementById('ac-overlay');
  if (overlay) overlay.style.display = 'none';
}

document.getElementById('ac-close-btn') && document.getElementById('ac-close-btn').addEventListener('click', acClose);

function initAntiCheat(isLive) {
  // Ctrl+T / Ctrl+N blokkolás – mindkét módban
  document.addEventListener('keydown', function(e) {
    if ((e.ctrlKey || e.metaKey) && ['t', 'T', 'n', 'N'].includes(e.key)) {
      e.preventDefault();
    }
    if (e.key === 'Escape') {
      const modal = document.getElementById('sample-img-modal');
      if (modal && modal.style.display === 'flex') closeSampleImgModal();
    }
  }, true);

  if (!isLive) return;
  acLive = true;

  // Fullscreen kényszer
  let fsGrace = Date.now() + 5000;
  if (document.documentElement.requestFullscreen) {
    document.documentElement.requestFullscreen().catch(() => {});
  }
  document.addEventListener('fullscreenchange', function() {
    if (!document.fullscreenElement && acLive && Date.now() > fsGrace) {
      acShow('Kiléptél a teljes képernyős módból!');
      fsGrace = Date.now() + 3000;
    }
  });

  // Fül elhagyás (engedélyezett popupok – előnézet, W3S, validátor – ki vannak véve)
  document.addEventListener('visibilitychange', function() {
    if (document.hidden && acLive && !acPopupGrace) acShow('Elhagytad a böngésző fület!');
  });

  // Alt+Tab / ablakváltás szándékosan engedélyezett a WEB vizsgán
  // (előnézet, W3S, validátor – tipikus fejlesztői munkafolyamat)

  // Oldal elhagyás blokkolása
  window.addEventListener('beforeunload', function(e) {
    if (acLive) { e.preventDefault(); e.returnValue = ''; }
  });

  // Vissza gomb blokkolása
  history.pushState(null, '', location.href);
  window.addEventListener('popstate', function() {
    if (acLive) history.pushState(null, '', location.href);
  });

  // DevTools detektálás (ablakméret-különbség)
  let devOpen = false;
  setInterval(function() {
    const diff = window.outerHeight - window.innerHeight;
    if (diff > 200 && !devOpen && acLive) {
      devOpen = true;
      acShow('Fejlesztői eszközök megnyitva!');
    } else if (diff <= 200) {
      devOpen = false;
    }
  }, 2000);
}

// ═══════════════════════════════════════════════════════
// VIZSGA HATÁRIDŐ – AUTO-BEADÁS
// ═══════════════════════════════════════════════════════
function getScoreSummaryText() {
  const s = parseInt(scoreCurrent?.textContent || '0') || 0;
  const m = 40;
  const pct = Math.round(s / m * 100);
  const g = calcWebGrade(pct);
  return `Elért pontszám: ${s} / ${m} pont — Érdemjegy: ${g}`;
}

async function handleWebSubmit() {
  if (!confirm('Biztosan be szeretnéd adni a dolgozatot?\n\nBeadás után már nem tudod szerkeszteni!')) return;
  acLive = false;
  stopTimer();
  sessionStorage.setItem('vizsga_web_beadva', '1');
  await submitWebToBackend();
  if (htmlEditor) htmlEditor.updateOptions({ readOnly: true });
  if (cssEditor)  cssEditor.updateOptions({ readOnly: true });
  const overlay = document.getElementById('ac-overlay');
  const title   = document.getElementById('ac-title');
  const text    = document.getElementById('ac-text');
  const count   = document.getElementById('ac-count');
  const btn     = document.getElementById('ac-close-btn');
  if (overlay) {
    title.textContent = '✅ Dolgozat beadva!';
    title.style.color = '#4ade80';
    text.textContent  = 'A munkádat sikeresen elküldtük. A szerkesztő zárolva.';
    count.textContent = getScoreSummaryText();
    btn.textContent   = 'Vissza a főmenübe';
    btn.onclick       = function() { location.replace('../portal.html'); };
    overlay.style.display = 'flex';
  }
}

function scheduleVizsgaDeadline(vizsgaVegeISO) {
  const vege = new Date(vizsgaVegeISO);
  const now  = new Date();
  const msLeft = vege - now;
  if (msLeft <= 0) {
    triggerVizsgaDeadline();
    return;
  }
  setTimeout(triggerVizsgaDeadline, msLeft);
  const warn10 = msLeft - 10 * 60 * 1000;
  if (warn10 > 0) setTimeout(() => showDeadlineWarning(10), warn10);
  const warn5 = msLeft - 5 * 60 * 1000;
  if (warn5 > 0) setTimeout(() => showDeadlineWarning(5), warn5);
  const warn1 = msLeft - 60 * 1000;
  if (warn1 > 0) setTimeout(() => showDeadlineWarning(1), warn1);
}

function showDeadlineWarning(minutes) {
  const overlay = document.getElementById('ac-overlay');
  const title   = document.getElementById('ac-title');
  const text    = document.getElementById('ac-text');
  const count   = document.getElementById('ac-count');
  const btn     = document.getElementById('ac-close-btn');
  if (!overlay) return;
  title.textContent = `⏰ ${minutes} perc múlva lejár az idő!`;
  title.style.color = '#ffa502';
  text.textContent  = 'A dolgozatod a határidőnél automatikusan beadásra kerül.';
  count.textContent = 'Az autosave folyamatosan menti a munkádat.';
  btn.textContent   = 'Rendben, visszatérek';
  btn.onclick       = function() { overlay.style.display = 'none'; title.style.color = '#e94560'; };
  overlay.style.display = 'flex';
}

function triggerVizsgaDeadline() {
  acLive = false;
  sessionStorage.setItem('vizsga_web_beadva', '1');
  // Utolsó mentés a backendbe
  submitWebToBackend();
  // Szerkesztők tiltása
  if (typeof htmlEditor !== 'undefined' && htmlEditor) htmlEditor.updateOptions({ readOnly: true });
  if (typeof cssEditor  !== 'undefined' && cssEditor)  cssEditor.updateOptions({ readOnly: true });
  // Overlay megjelenítése
  const overlay = document.getElementById('ac-overlay');
  const title   = document.getElementById('ac-title');
  const text    = document.getElementById('ac-text');
  const count   = document.getElementById('ac-count');
  const btn     = document.getElementById('ac-close-btn');
  if (overlay) {
    title.textContent = '⏰ A vizsgaidő lejárt!';
    title.style.color = '#ffa502';
    text.textContent  = 'A megoldásod automatikusan beadásra került. A szerkesztő zárolva.';
    count.textContent = getScoreSummaryText();
    btn.textContent   = 'Vissza a főmenübe';
    btn.onclick       = function() { location.replace('../portal.html'); };
    overlay.style.display = 'flex';
  }
}
