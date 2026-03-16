// Python Teszt JavaScript - Google Sheets API kommunikációval
// Visszafejtett és helyreállított verzió

// Globális változók
const RAILWAY_URL = 'https://agazati.up.railway.app';
let testMode = 'practice';
let tasks = [];
let selectedTasks = [];
let currentTaskIndex = 0;
let globalTimeRemaining = 45 * 60; // 45 perc másodpercben
let globalTimer = null;
let codeEditor = null;
let monacoReadyPromise = null;
let testStartTime = null;
let testEndTime = null;
let studentData = {};
let taskStartTimes = [];
let taskAnswers = [];
let eventLog = [];
let term = null;
let fitAddon = null;
let terminalReady = false;
let terminalInputResolver = null;
let terminalInputBuffer = '';
let focusLossTimeout = null;
let focusCheckInterval = null;
let fullscreenCheckInterval = null;
let fsCountdownTimer = null;
let fsCheatDelayTimer = null;
let autosaveInterval = null;
let cheatDetected = false;
let cheatReason = '';
let cheatWarningCount = 0;
let cheatPenalty = false;
let lastCheatWarningTime = 0;
let fullscreenEnforced = false;
let fullscreenGraceUntil = 0;
let suspiciousJumps = 0;
let lastCodeLengths = [];
let testSubmitted = false;
let megoldasok = {}; // { "1": { solution, hints: [] }, ... }
let tippIndex = []; // per task: how many hints shown
let selectedTaskType = 'random'; // 'random' | 'csak8' | 'csak14'
let solutionViewedTasks = []; // taskIndex-ek ahol megoldást nézett ebben a körben

// Pyodide singleton – csak egyszer töltjük be, utána újrahasználjuk
let pyodideInstance = null;
let pyodideLoadingPromise = null;

// Futás-lock – megakadályozza a párhuzamos kódfuttatást
let pythonCodeRunning = false;
let currentInputDisposable = null;

async function getPyodide() {
    if (pyodideInstance) return pyodideInstance;
    if (!pyodideLoadingPromise) {
        pyodideLoadingPromise = loadPyodide({
            indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/'
        }).catch(err => {
            pyodideLoadingPromise = null; // Sikertelen betöltés után újrapróbálható
            throw err;
        });
    }
    pyodideInstance = await pyodideLoadingPromise;
    return pyodideInstance;
}

// DOM elemek
const startSection = document.getElementById('start-section');
const quizSection = document.getElementById('quiz-section');
const endSection = document.getElementById('end-section');
const submitModal = document.getElementById('submit-modal');
const fullscreenPrompt = document.getElementById('fullscreen-prompt');

// Alkalmazás inicializálása
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

async function initializeApp() {
    logEvent('Application initialized');
    // Monaco előtöltése a háttérben, hogy startTest()-re kész legyen
    monacoReadyPromise = new Promise((resolve) => {
        require.config({ paths: { 'vs': 'https://cdn.jsdelivr.net/npm/monaco-editor@0.52.2/min/vs' } });
        require(['vs/editor/editor.main'], resolve);
    });
    setupEventListeners();
    await loadTasksFromFile();
    await loadTestMode();
    startFullscreenCheck();

    // Megoldások és tippek betöltése (csak practice módban)
    if (testMode === 'practice') {
        fetch('https://script.google.com/macros/s/AKfycbw6c00BA-N3Lf3lWFg3Jm-uVJKrOKKmoRTI9vBUxk2xRdFBrNR_ztB9EoA_Uq2Kg-Ms/exec?action=getMegoldasok')
            .then(r => r.json())
            .then(d => { if (d.ok) megoldasok = d.data || {}; })
            .catch(() => {}); // Csöndben fail - nem kritikus
        // Practice gombok megjelenítése
        const practiceButtons = document.getElementById('practice-buttons');
        if (practiceButtons) practiceButtons.style.display = 'flex';
        // Practice módban a beadás gomb "Kör befejezése" felirattal jelenik meg
        const submitBtn = document.getElementById('submit-btn');
        if (submitBtn) {
            submitBtn.style.background = 'linear-gradient(135deg, #059669, #10b981)';
            submitBtn.style.borderColor = '#10b981';
            const lbl = document.getElementById('submit-btn-label');
            if (lbl) lbl.textContent = 'Kör befejezése';
            submitBtn.querySelector('i').className = 'fas fa-flag-checkered';
        }
    }

    const isTeacher = sessionStorage.getItem('kandTeacherMode') === 'true';

    if (isTeacher) {
        // Bemutató / oktatói mód: rögtön indul
        startTest();
    } else {
        // Gyakorló és éles/vizsga mód: megjelenítjük a start képernyőt
        const startEl = document.getElementById('start-section');
        if (startEl) startEl.classList.remove('hidden');
        updateStartSection();
    }

    // Pyodide előbetöltése a háttérben
    getPyodide()
        .then(() => debugLog('✅ Python értelmező kész'))
        .catch(err => debugLog('⚠️ Python előbetöltési hiba: ' + err.message));
}

// Teszt mód betöltése az API-ból (retry ha Railway alszik)
async function loadTestMode() {
    const fetchWithTimeout = (url, ms) => {
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), ms);
        return fetch(url, { signal: controller.signal }).finally(() => clearTimeout(id));
    };

    for (let attempt = 1; attempt <= 3; attempt++) {
        try {
            debugLog('🔄 Teszt mód betöltése... (' + attempt + '/3)');
            const response = await fetchWithTimeout(RAILWAY_URL + '/api/config', 8000);
            const data = await response.json();

            if (data.test_mode) {
                testMode = data.test_mode;
                logEvent('Test mode loaded', { mode: testMode });
                debugLog('✅ Teszt mód betöltve: ' + (testMode === 'practice' ? '🎓 GYAKORLÓ' : '🔴 ÉLES'));
            } else {
                debugLog('⚠️ Teszt mód nem érkezett, alapértelmezett: GYAKORLÓ');
            }
            break; // sikeres → kilépés a ciklusból
        } catch (error) {
            debugLog('⚠️ Betöltési kísérlet ' + attempt + '/3 sikertelen: ' + error.message);
            if (attempt < 3) await new Promise(r => setTimeout(r, 2000));
            else {
                logEvent('Test mode load error', { error: error.message });
                debugLog('❌ Teszt mód betöltése SIKERTELEN, alapértelmezett: GYAKORLÓ');
            }
        }
    }
    updateTestModeBadge();
}

// Backend-re való beküldés
async function submitToBackend() {
    try {
        const testDuration = Math.round((testEndTime - testStartTime) / 1000);

        const taskIds = selectedTasks.map(t => t.number).join(',');
        const maxScores = selectedTasks.map(t => t.points || 0);
        const scores = taskAnswers.map(a => a.earnedPoints || 0);
        const totalScore = scores.reduce((s, v) => s + v, 0);
        const maxTotal = maxScores.reduce((s, v) => s + v, 0);
        const codeSnapshot = JSON.stringify({
            tasks: taskAnswers.map((a, i) => ({
                task: selectedTasks[i] ? selectedTasks[i].number : i + 1,
                code: a.answer || ''
            })),
            suspiciousJumps: suspiciousJumps,
            eventLog: eventLog
        });

        const payload = {
            name: studentData.name,
            email: studentData.email,
            osztaly: studentData.class || '',
            csoport: studentData.group || null,
            taskIds: taskIds,
            scores: scores.join(','),
            maxScores: maxScores.join(','),
            totalScore: totalScore,
            maxTotal: maxTotal,
            duration: testDuration,
            mode: testMode === 'live' ? 'live' : 'practice',
            codeSnapshot: codeSnapshot,
            cheatPenalty: cheatPenalty,
            cheatWarnings: cheatWarningCount
        };

        debugLog('📦 Adat előkészítve');

        const response = await fetch(RAILWAY_URL + '/api/submit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        debugLog('📡 Backend válasz státusz: ' + response.status);

        const result = await response.json();

        if (result.success) {
            logEvent('Submission successful', { submission_id: result.id });
            debugLog('✅ Sikeres beküldés! ID: ' + result.id);
            return { success: true, submission_id: result.id };
        } else {
            throw new Error('Beküldés sikertelen');
        }
    } catch (error) {
        logEvent('Submission error', { error: error.message });
        debugLog('❌ Backend hiba');
        return null;
    }
}

// Automatikus mentés (lokálisan, sessionStorage-ba) + kódugrás detektálás
async function autoSaveProgress() {
    try {
        if (currentTaskIndex >= 0 && currentTaskIndex < taskAnswers.length) {
            const newCode = codeEditor.getValue();
            const prevLen = lastCodeLengths[currentTaskIndex] || 0;
            const jump = newCode.length - prevLen;
            // 80+ karakter hirtelen megjelenése 10 másodpercen belül = gyanús
            if (testMode === 'live' && jump >= 80) {
                suspiciousJumps++;
                logEvent('Suspicious code jump', { chars: jump, task: currentTaskIndex + 1, total: suspiciousJumps });
                debugLog('⚠️ Gyanús kódugrás: +' + jump + ' karakter (összesen: ' + suspiciousJumps + ')');
            }
            lastCodeLengths[currentTaskIndex] = newCode.length;
            taskAnswers[currentTaskIndex].answer = newCode;
        }
        const saveData = {
            studentData,
            taskAnswers: taskAnswers.map(a => ({ taskNumber: a.taskNumber, answer: a.answer || '' })),
            timestamp: new Date().toISOString()
        };
        sessionStorage.setItem('kandoAutosave', JSON.stringify(saveData));
        debugLog('💾 Automatikus mentés (lokális)');
    } catch (error) {
        console.log('Autosave failed:', error);
    }
}

// Event listener-ek beállítása
function setupEventListeners() {
    document.getElementById('start-btn').addEventListener('click', startTest);
    document.getElementById('submit-btn').addEventListener('click', showSubmitModal);
    document.getElementById('confirm-submit').addEventListener('click', submitTest);
    document.getElementById('cancel-submit').addEventListener('click', hideSubmitModal);
    document.getElementById('run-code-btn').addEventListener('click', runPythonCode);

    // Jobb klikk letiltása
    document.addEventListener('contextmenu', e => {
        e.preventDefault();
        return false;
    });

    // DevTools billentyűk letiltása + ablakváltó kombinációk tiltása
    document.addEventListener('keydown', e => {
        // DevTools
        if (e.key === 'F12' ||
            (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) ||
            (e.ctrlKey && e.key === 'U')) {
            e.preventDefault();
            return false;
        }
        // Ablakváltó kombinációk tiltása teszt közben
        if (!quizSection.classList.contains('hidden') && (testMode === 'live' || testMode === 'vizsga')) {
            if ((e.altKey && e.key === 'Tab') ||
                (e.altKey && e.key === 'F4') ||
                (e.ctrlKey && e.key === 'Tab') ||
                (e.ctrlKey && e.shiftKey && e.key === 'Tab') ||
                e.key === 'Meta' || e.key === 'OS' ||
                e.key === 'Escape' ||
                (e.ctrlKey && e.key === 'Escape') ||
                (e.altKey && e.key === 'Escape')) {
                e.preventDefault();
                e.stopPropagation();
                return false;
            }
        }
    });

    // Touchpad vízszintes húzás tiltása (böngésző vissza/előre navigáció)
    document.addEventListener('wheel', e => {
        if (!quizSection.classList.contains('hidden')) {
            if (Math.abs(e.deltaX) > Math.abs(e.deltaY) && Math.abs(e.deltaX) > 20) {
                e.preventDefault();
            }
        }
    }, { passive: false });

    // Pointer-alapú swipe gesztus tiltása
    let pointerStartX = 0;
    document.addEventListener('pointerdown', e => { pointerStartX = e.clientX; });
    document.addEventListener('pointermove', e => {
        if (!quizSection.classList.contains('hidden') && e.buttons > 0) {
            const dx = e.clientX - pointerStartX;
            if (Math.abs(dx) > 80) {
                e.preventDefault();
            }
        }
    }, { passive: false });

    // Paste blokkolás: 40+ karakteres beillesztés tiltott (két monitor / AI bypass)
    document.addEventListener('paste', e => {
        if (quizSection.classList.contains('hidden') || testMode !== 'live') return;
        const text = (e.clipboardData || window.clipboardData)?.getData('text/plain') || '';
        if (text.length >= 45) {
            e.preventDefault();
            e.stopPropagation();
            suspiciousJumps++;
            logEvent('Paste blocked', { chars: text.length, total: suspiciousJumps });
            debugLog('🚫 Beillesztés blokkolva: ' + text.length + ' karakter');
            // Rövid vizuális visszajelzés
            const msg = document.createElement('div');
            msg.textContent = '🚫 Nagy beillesztés nem engedélyezett!';
            msg.style.cssText = 'position:fixed;top:18px;left:50%;transform:translateX(-50%);background:#e94560;color:white;padding:10px 22px;border-radius:8px;font-weight:700;z-index:99999;font-size:0.95rem;box-shadow:0 4px 16px rgba(0,0,0,0.4);';
            document.body.appendChild(msg);
            setTimeout(() => msg.remove(), 2500);
        }
    }, true);

    // DevTools észlelés
    detectDevTools();

    // Fullscreen változás figyelése
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    // Láthatóság változás figyelése
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Ablak fókusz figyelése
    window.addEventListener('blur', handleWindowBlur);
    window.addEventListener('focus', handleWindowFocus);

    startFocusCheck();
}

// Feladatok betöltése fájlból
async function loadTasksFromFile() {
    try {
        const response = await fetch('feladatok.txt');
        const text = await response.text();
        parseTasks(text);
        logEvent('Tasks loaded', { count: tasks.length });
    } catch (error) {
        alert('Hiba történt a feladatok betöltésekor!');
        logEvent('Task load error', { error: error.message });
    }
}

// Feladatok feldolgozása
function parseTasks(text) {
    const lines = text.split('\n');
    let currentTask = null;
    let inExample = false;
    let inCriteria = false;
    let inTippek = false;
    let inMegoldas = false;
    let exampleLines = [];
    let criteriaLines = [];
    let tippLines = [];
    let megoldasLines = [];

    const resetSections = () => {
        inExample = false; inCriteria = false; inTippek = false; inMegoldas = false;
    };

    for (let line of lines) {
        const taskMatch = line.match(/^(\d+)\.\s*feladat/i);

        if (taskMatch) {
            if (currentTask) {
                currentTask.example = exampleLines.join('\n');
                currentTask.criteria = parseCriteria(criteriaLines);
                currentTask.hints = tippLines.filter(h => h.trim() !== '');
                currentTask.solution = megoldasLines.join('\n').trim();
                tasks.push(currentTask);
            }
            currentTask = { number: parseInt(taskMatch[1]), description: '', example: '', points: 8, criteria: [], hints: [], solution: '' };
            resetSections();
            exampleLines = []; criteriaLines = []; tippLines = []; megoldasLines = [];
            continue;
        }

        const pointMatch = line.match(/^Pont:\s*(\d+)/i);
        if (pointMatch && currentTask) { currentTask.points = parseInt(pointMatch[1]); continue; }

        if (line.trim() === 'Pontozas:')  { resetSections(); inCriteria = true; continue; }
        if (line.trim() === 'Tippek:')    { resetSections(); inTippek   = true; continue; }
        if (line.trim() === 'Megoldas:')  { resetSections(); inMegoldas = true; continue; }

        if (line.trim() === '```python' || line.trim() === '```') {
            if (!inCriteria && !inTippek) inExample = inMegoldas ? false : !inExample;
            continue;
        }
        if (line.match(/^Minta kód:/i)) continue;

        if (currentTask) {
            if (inCriteria)  { if (line.trim() !== '') criteriaLines.push(line.trim()); }
            else if (inTippek)   { if (line.trim() !== '') tippLines.push(line.trim()); }
            else if (inMegoldas) { megoldasLines.push(line); }
            else if (inExample)  { exampleLines.push(line); }
            else if (line.trim() !== '') {
                if (currentTask.description !== '') currentTask.description += '\n';
                currentTask.description += line;
            }
        }
    }

    if (currentTask) {
        currentTask.example = exampleLines.join('\n');
        currentTask.criteria = parseCriteria(criteriaLines);
        currentTask.hints = tippLines.filter(h => h.trim() !== '');
        currentTask.solution = megoldasLines.join('\n').trim();
        tasks.push(currentTask);
    }

    const count8 = tasks.filter(t => t.points === 8).length;
    const count14 = tasks.filter(t => t.points === 14).length;
    debugLog(`✅ ${tasks.length} feladat betöltve (${count8} db 8 pontos, ${count14} db 14 pontos)`);
}

// Teszt indítása
async function startTest() {
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const studentClass = document.getElementById('class').value.trim();

    // Ha sessionStorage-ból jött az adat, csak a nevet és emailt ellenőrizzük
    const fromSession = !!sessionStorage.getItem('kandoUser');
    if (!name || !email || (!studentClass && !fromSession)) {
        alert('Kérlek, töltsd ki az összes mezőt!');
        return;
    }

    const tasks8 = tasks.filter(t => t.points === 8);
    const tasks14 = tasks.filter(t => t.points === 14);
    if (tasks8.length < 2 || tasks14.length < 1) {
        alert(`Nincs elég feladat! Szükséges: legalább 2 db 8 pontos és 1 db 14 pontos feladat.\nJelenleg: ${tasks8.length} db 8 pontos, ${tasks14.length} db 14 pontos.`);
        return;
    }

    studentData = {
        name: name,
        email: email,
        class: studentClass
    };

    const userInfoEl = document.getElementById('quiz-user-info');
    if (userInfoEl) userInfoEl.textContent = name;

    testStartTime = new Date();
    testSubmitted = false;
    logEvent('Test started', studentData);

    // Vissza gomb blokkolása teszt közben
    history.pushState(null, '', location.href);
    window.addEventListener('popstate', function() {
        if (testStartTime && !testSubmitted) {
            history.pushState(null, '', location.href);
        }
    });
    window.addEventListener('beforeunload', function(e) {
        if (testStartTime && !testSubmitted) {
            e.preventDefault();
            e.returnValue = '';
        }
    });

    selectRandomTasks();

    taskAnswers = selectedTasks.map(task => ({
        taskNumber: task.number,
        taskDescription: task.description,
        taskExample: task.example,
        answer: '',
        timeSpent: 0,
        startTime: null,
        endTime: null,
        skipped: false,
        earnedPoints: 0,
        scoringResults: null
    }));

    if (testMode === 'practice') {
        const customMin = parseInt(document.getElementById('custom-time-input')?.value) || 45;
        globalTimeRemaining = Math.max(5, Math.min(120, customMin)) * 60;
    } else {
        globalTimeRemaining = 45 * 60;
    }

    fullscreenEnforced = false;
    fullscreenGraceUntil = 0;

    // Start overlay elrejtése
    startSection.classList.add('hidden');
    quizSection.classList.remove('hidden');

    await initializeCodeEditor();
    try {
        initTerminal();
    } catch (err) {
        debugLog('⚠️ xterm.js hiba: ' + err.message + ' – egyszerű terminál');
        initFallbackTerminal();
        if (term) term.writeln('⚠️ Terminál: egyszerű mód (' + err.message + ')');
    }

    // Módjelzés a quiz top bar-ban (elem már HTML-ben van, csak frissítjük)
    const isTeacherMode = sessionStorage.getItem('kandTeacherMode') === 'true';
    const pill = document.getElementById('quiz-mode-pill');
    if (pill) {
        if ((testMode === 'live' || testMode === 'vizsga') && !isTeacherMode) {
            pill.style.cssText = 'display:block;background:#2d0a0a;border:1px solid #e94560;color:#e94560;padding:3px 12px;border-radius:20px;font-size:0.8rem;font-weight:700;white-space:nowrap;flex-shrink:0;margin-left:auto;margin-right:2rem;';
            pill.textContent = '🔴 SZÁMONKÉRÉS MÓD';
        } else if (isTeacherMode) {
            pill.style.cssText = 'display:block;background:#1a0d2e;border:1px solid #7c3aed;color:#c4b5fd;padding:3px 12px;border-radius:20px;font-size:0.8rem;font-weight:700;white-space:nowrap;flex-shrink:0;margin-left:auto;margin-right:2rem;';
            pill.textContent = '🎬 BEMUTATÓ MÓD';
        } else {
            pill.style.cssText = 'display:block;background:#0d2b0d;border:1px solid #2ed573;color:#2ed573;padding:3px 12px;border-radius:20px;font-size:0.8rem;font-weight:700;white-space:nowrap;flex-shrink:0;margin-left:auto;margin-right:2rem;';
            pill.textContent = '🎓 GYAKORLÓ MÓD';
        }
    }

    // Submit gomb felirat mód szerint
    const submitLabel = document.getElementById('submit-btn-label');
    if (submitLabel) {
        if (testMode === 'live' || testMode === 'vizsga') {
            submitLabel.textContent = 'Számonkérés beadása';
        } else {
            submitLabel.textContent = 'Feladat beadása';
        }
    }

    // Vízjel – tanuló neve + emailje (screenshothoz)

    // Oktatói/bemutató módban nincs fullscreen kényszer; vizsga módban igen
    if (!isTeacherMode && (testMode === 'live' || testMode === 'vizsga')) {
        enterFullscreen();
    }

    setTimeout(() => {
        currentTaskIndex = 0;
        startGlobalTimer();
        startAutoSaveInterval();
        showTask(currentTaskIndex);
        updateLiveScore();
        if (fitAddon) fitAddon.fit();
        logEvent('Entered fullscreen and started timers');

        // Pyodide betöltési állapot jelzése a terminálban
        if (!pyodideInstance) {
            if (term) term.writeln('🐍 Python értelmező betöltése folyamatban...\r\n   (Kód futtatása amint kész – kb. 30-60 mp)');
            getPyodide()
                .then(() => { if (term) { term.clear(); term.writeln('✅ Python értelmező kész! Futtathatod a kódot.\r\n'); } })
                .catch(() => { if (term) term.writeln('\r\n❌ Python értelmező betöltése sikertelen.\r\n   Frissítsd az oldalt (F5) és zárd be a többi fület.'); });
        }
    }, 100);
}

// Véletlenszerű feladatok kiválasztása
function selectRandomTasks() {
    const tasks8 = tasks.filter(t => t.points === 8);
    const tasks14 = tasks.filter(t => t.points === 14);

    const shuffled8 = [...tasks8].sort(() => 0.5 - Math.random());
    const shuffled14 = [...tasks14].sort(() => 0.5 - Math.random());

    if (selectedTaskType === 'csak8') {
        selectedTasks = shuffled8.slice(0, 3);
    } else if (selectedTaskType === 'csak14') {
        selectedTasks = shuffled14.slice(0, 3);
    } else {
        // random: 2×8 + 1×14
        selectedTasks = [...shuffled8.slice(0, 2), ...shuffled14.slice(0, 1)].sort(() => 0.5 - Math.random());
    }

    tippIndex = selectedTasks.map(() => 0);

    logEvent('Tasks selected', {
        tasks: selectedTasks.map(t => ({ number: t.number, points: t.points }))
    });
}

// ─── PONTOZÓ MOTOR ────────────────────────────────────────────────────────────

// Kritériumok beolvasása szöveges sorokból
function parseCriteria(lines) {
    return lines.map(line => {
        const pipeIdx = line.indexOf('|');
        if (pipeIdx === -1) return null;
        const spec = line.substring(0, pipeIdx); // NE trim-elj – megőrzi a záró szóközt (pl. bekeres args)
        const label = line.substring(pipeIdx + 1).trim();
        const colonIdx = spec.indexOf(':');
        if (colonIdx === -1) {
            return { type: spec.trim(), args: null, label };
        }
        const type = spec.substring(0, colonIdx).trim();
        const args = spec.substring(colonIdx + 1); // args-ot NEM trim-eljük
        return { type, args, label };
    }).filter(c => c !== null);
}

// Szinkron kritérium-ellenőrzés (nem teszt típusú)
function evaluateCriterion(code, criterion) {
    const { type, args } = criterion;

    if (['if', 'elif', 'else', 'for', 'while', 'def', 'return'].includes(type)) {
        return new RegExp(`\\b${type}\\b`).test(code);
    }

    if (type === 'input') {
        const n = parseInt(args) || 1;
        return (code.match(/\binput\s*\(/g) || []).length >= n;
    }

    if (type === 'int_float') {
        const n = parseInt(args) || 1;
        return (code.match(/\b(int|float)\s*\(/g) || []).length >= n;
    }

    if (type === 'import') {
        return new RegExp(`(^|\\n)\\s*import\\s+${args}\\b|(^|\\n)\\s*from\\s+${args}\\s+import`, 'i').test(code);
    }

    if (type === 'tartalmaz') {
        return code.includes(args);
    }

    if (type === 'input_format') {
        // Ellenőrzi, hogy az összes input() bekérő szöveg szóközzel végződik-e
        const calls = [...code.matchAll(/\binput\s*\(\s*f?["']([^"']*?)["']\s*\)/g)];
        if (calls.length === 0) return false;
        return calls.every(m => m[1].endsWith(' '));
    }

    if (type === 'bekeres') {
        // Ellenőrzi, hogy az input() PONTOSAN a megadott szöveggel hívódik-e meg
        // A szövegnek betűre, szóközre, írásjelre pontosan egyeznie kell a mintával
        // Sima string ("...") és f-string (f"...") esetét is kezeli
        const escapedArgs = args.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        return new RegExp(`\\binput\\s*\\(\\s*f?["']${escapedArgs}["']\\s*\\)`).test(code);
    }

    return false;
}

// Teszteset futtatása mock inputokkal
async function runCodeWithMockInputs(code, inputs) {
    let inputIndex = 0;
    const mockInputFn = async (_prompt) => {
        if (inputIndex < inputs.length) return String(inputs[inputIndex++]).trim();
        return '';
    };

    const savedInput = globalThis.js_input;
    globalThis.js_input = mockInputFn;

    let pyodideLoaded = false;
    try {
        const pyodide = await getPyodide();
        pyodideLoaded = true;

        pyodide.runPython(`
import sys
from io import StringIO
import builtins

sys.stdout = StringIO()
sys.stderr = StringIO()

async def input(prompt=''):
    from js import js_input
    result = await js_input(prompt)
    return result

builtins.input = input
`);

        const wrappedCode = wrapPythonCodeForAsyncInput(code);
        await pyodide.runPythonAsync(wrappedCode);

        const stdout = pyodide.runPython('sys.stdout.getvalue()');
        return { success: true, output: stdout || '' };
    } catch (error) {
        // pyodideFailed: true → Python értelmező nem töltődött be (nem a kód hibája)
        return { success: false, output: '', error: error.message, pyodideFailed: !pyodideLoaded };
    } finally {
        globalThis.js_input = savedInput;
    }
}

function autoCheckStructural() {
    const task = selectedTasks[currentTaskIndex];
    if (!task || !task.criteria || task.criteria.length === 0) return;
    const code = codeEditor ? codeEditor.getValue().trim() : '';
    const panel = document.getElementById('scoring-panel');
    if (panel) panel.classList.remove('hidden');
    const results = task.criteria.map(criterion => {
        if (criterion.type === 'teszt') {
            return { criterion, passed: false, needsRun: code.length > 0 };
        }
        return { criterion, passed: evaluateCriterion(code, criterion) };
    });
    updateScoringUI(results);
}

// Pontozás ellenőrzése az aktuális feladatnál
let scoringRunning = false;

async function checkScoring() {
    if (scoringRunning) return;

    const task = selectedTasks[currentTaskIndex];
    if (!task || !task.criteria || task.criteria.length === 0) return;

    const code = codeEditor.getValue().trim();

    scoringRunning = true;

    const panel = document.getElementById('scoring-panel');
    panel.classList.remove('hidden');

    if (!code) {
        scoringRunning = false;
        return;
    }

    // Szinkron kritériumok azonnali kiértékelése
    const results = task.criteria.map(criterion => {
        if (criterion.type === 'teszt') {
            return { criterion, passed: null, pending: true };
        }
        return { criterion, passed: evaluateCriterion(code, criterion), pending: false };
    });

    updateScoringUI(results);

    // Tesztesetek aszinkron futtatása egyenként
    for (let i = 0; i < results.length; i++) {
        if (!results[i].pending) continue;

        const criterion = results[i].criterion;
        const firstColon = criterion.args.indexOf(':');
        if (firstColon === -1) {
            results[i] = { criterion, passed: false, pending: false };
            continue;
        }

        const inputsStr = criterion.args.substring(0, firstColon);
        const expected = criterion.args.substring(firstColon + 1);
        const inputs = inputsStr.split(',');

        const result = await runCodeWithMockInputs(code, inputs);
        if (result.pyodideFailed) {
            // Pyodide nem töltődött be – ne számítson hibának!
            results[i] = { criterion, passed: null, pyodideFailed: true, pending: false };
        } else {
            const passed = result.success
                ? result.output.toLowerCase().includes(expected.toLowerCase())
                : false;
            results[i] = { criterion, passed, pending: false };
        }
        updateScoringUI(results);
    }

    scoringRunning = false;

    // Progress mentése a backendre (csak ha van pont és portálos bejelentkezés)
    const earned = results.filter(r => r.passed === true).length;
    const total  = results.length;
    if (earned > 0) maybePostPythonProgress(task, earned, total);
}

// ── Progress tracking (Python) ────────────────────────────────────────────
const _pythonProgressPosted = new Set();

function maybePostPythonProgress(task, earned, total) {
    const kandoRaw = sessionStorage.getItem('kandoUser');
    if (!kandoRaw) return;
    let u;
    try { u = JSON.parse(kandoRaw); } catch { return; }
    const email = u.email;
    if (!email) return;
    const taskId = String(task.number);
    const key = `${email}:python:${taskId}`;
    if (_pythonProgressPosted.has(key)) return;
    _pythonProgressPosted.add(key);
    fetch('https://agazati.up.railway.app/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            email,
            nev: u.nev || '',
            osztaly: u.osztaly ? `${u.evfolyam || ''}.${u.osztaly}` : '',
            targy: 'python',
            feladat: taskId,
            pont: earned,
            maxPont: total
        })
    }).catch(() => {});
}

// Pontozási eredmények megjelenítése – lámpa stílus
function updateScoringUI(results) {
    const content = document.getElementById('scoring-content');
    const earned = results.filter(r => r.passed === true).length;
    const total = results.length;
    const task = selectedTasks[currentTaskIndex];
    const maxPts = task ? task.points : total;

    const scoreColor = earned === total ? '#27ae60' : earned > 0 ? '#e67e22' : '#e74c3c';

    let dots = '';
    for (const r of results) {
        let color, title;
        if (r.pending) {
            color = '#f59e0b';
            title = '⏳ ' + r.criterion.label + ' → futtatás folyamatban...';
        } else if (r.pyodideFailed) {
            color = '#f59e0b';
            title = '⚠️ ' + r.criterion.label + ' → Python értelmező hiba';
        } else if (r.needsRun) {
            color = '#f59e0b';
            title = '▶ ' + r.criterion.label + ' → futtasd le a kódot az ellenőrzéséhez';
        } else if (r.passed) {
            color = '#27ae60';
            title = '✓ ' + r.criterion.label;
        } else {
            color = '#e74c3c';
            title = '✗ ' + r.criterion.label;
        }
        dots += `<span title="${title.replace(/"/g, '&quot;')}" style="display:inline-block;width:13px;height:13px;border-radius:50%;background:${color};flex-shrink:0;cursor:default;box-shadow:0 0 3px ${color}88;"></span>`;
    }

    content.innerHTML = `
        <div style="display:flex;align-items:center;gap:0.75rem;flex-wrap:wrap;">
            <span style="font-size:1.5rem;font-weight:800;color:${scoreColor};white-space:nowrap;">${earned} / ${maxPts} <span style="font-size:0.85rem;font-weight:600;color:#888;">pont</span></span>
            <div style="display:flex;gap:0.35rem;flex-wrap:wrap;align-items:center;">${dots}</div>
        </div>`;

    if (!results.some(r => r.pending || r.needsRun) && currentTaskIndex >= 0 && taskAnswers[currentTaskIndex]) {
        taskAnswers[currentTaskIndex].earnedPoints = earned;
        taskAnswers[currentTaskIndex].scoringResults = results.map(r => ({
            label: r.criterion.label,
            passed: r.passed
        }));
        updateLiveScore();
    }
}

// ──────────────────��──────────────────────────────────────────────────────────

// Code Editor inicializálása (Monaco, textarea fallback ha nem tölt be)
async function initializeCodeEditor() {
    try {
        const timeout = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Monaco betöltési időtúllépés (12s)')), 12000)
        );
        await Promise.race([monacoReadyPromise, timeout]);

        const container = document.getElementById('code-editor');
        const isNagyMod = document.body.classList.contains('nagy-mod');
        codeEditor = monaco.editor.create(container, {
            value: '',
            language: 'python',
            theme: 'vs-dark',
            fontSize: isNagyMod ? 28 : 20,
            lineNumbers: 'on',
            automaticLayout: true,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            wordWrap: 'on',
            tabSize: 4,
            insertSpaces: true,
            fontFamily: "Consolas, 'Courier New', monospace",
            renderLineHighlight: 'all',
            bracketPairColorization: { enabled: true },
            autoClosingBrackets: 'always',
            autoClosingQuotes: 'always',
            suggest: { snippetsPreventQuickSuggestions: false },
        });
        codeEditor.onDidChangeModelContent(() => {
            if (currentTaskIndex >= 0 && currentTaskIndex < taskAnswers.length) {
                taskAnswers[currentTaskIndex].answer = codeEditor.getValue();
            }
        });
        codeEditor.onDidChangeModelContent(debounce(() => {
            autoCheckStructural();
        }, 400));
        debugLog('✅ Monaco editor kész');
    } catch (err) {
        debugLog('⚠️ Monaco nem töltődött be: ' + err.message + ' – textarea visszaváltás');
        initFallbackEditor();
    }
}

function initFallbackEditor() {
    const container = document.getElementById('code-editor');
    container.innerHTML = '';
    const ta = document.createElement('textarea');
    ta.style.cssText = 'width:100%;height:100%;background:#1e1e1e;color:#d4d4d4;font-family:Consolas,"Courier New",monospace;font-size:14px;padding:10px;border:none;resize:none;outline:none;line-height:1.5;';
    ta.placeholder = 'Írd be a Python kódodat...';
    container.appendChild(ta);
    codeEditor = {
        getValue: () => ta.value,
        setValue: (v) => { ta.value = v; },
    };
    ta.addEventListener('input', () => {
        if (currentTaskIndex >= 0 && currentTaskIndex < taskAnswers.length)
            taskAnswers[currentTaskIndex].answer = ta.value;
    });
    debugLog('✅ Textarea fallback editor kész');
}

// Terminál inicializálása
function initTerminal() {
    const isNagyModTerm = document.body.classList.contains('nagy-mod');
    term = new Terminal({
        cursorBlink: true,
        convertEol: true,
        fontSize: isNagyModTerm ? 28 : 20,
        fontFamily: "Consolas, 'Lucida Console', 'Courier New', monospace",
        theme: {
            background: '#0c0c0c',
            foreground: '#c0c0c0',
            cursor: '#c0c0c0',
            selection: 'rgba(255, 255, 255, 0.2)'
        }
    });

    fitAddon = new FitAddon.FitAddon();
    term.loadAddon(fitAddon);

    const terminalElement = document.getElementById('terminal');
    term.open(terminalElement);
    fitAddon.fit();

    terminalReady = true;
}

// Egyszerű fallback terminál ha xterm.js nem töltődik be
function initFallbackTerminal() {
    const terminalElement = document.getElementById('terminal');
    terminalElement.style.cssText += 'background:#0c0c0c;padding:8px;overflow-y:auto;box-sizing:border-box;';
    const pre = document.createElement('pre');
    pre.id = 'fallback-output';
    pre.style.cssText = 'margin:0;color:#c0c0c0;font-family:Consolas,"Lucida Console","Courier New",monospace;font-size:13px;white-space:pre-wrap;word-break:break-all;';
    terminalElement.appendChild(pre);
    term = {
        clear: () => { if (pre) pre.textContent = ''; },
        write: (text) => { if (pre) pre.textContent += text.replace(/\r\n/g, '\n').replace(/\r(?!\n)/g, '\n'); terminalElement.scrollTop = terminalElement.scrollHeight; },
        writeln: (text) => { if (pre) pre.textContent += text.replace(/\r\n/g, '\n').replace(/\r(?!\n)/g, '\n') + '\n'; terminalElement.scrollTop = terminalElement.scrollHeight; },
        loadAddon: () => {},
        onData: () => {},
        _isFallback: true,
    };
    fitAddon = { fit: () => {} };
    terminalReady = true;
    debugLog('✅ Fallback terminál kész (xterm.js nem volt elérhető)');
}

// Feladat megjelenítése
function showTask(index) {
    if (index < 0 || index >= selectedTasks.length) {
        return;
    }

    const task = selectedTasks[index];
    const answer = taskAnswers[index];

    if (!answer.startTime) {
        answer.startTime = new Date();
    }

    document.getElementById('task-number').textContent = `${index + 1}. feladat (${task.points} pont)`;
    document.getElementById('task-description').textContent = task.description;
    document.getElementById('task-example').textContent = task.example;

    // Pontozás panel kezelése feladatváltáskor
    const scoringPanel = document.getElementById('scoring-panel');
    document.getElementById('scoring-content').innerHTML = '';
    if (task.criteria && task.criteria.length > 0) {
        scoringPanel.classList.remove('hidden');
        setTimeout(autoCheckStructural, 300);
    } else {
        scoringPanel.classList.add('hidden');
    }

    // Feladat szám mentése a tanári adatokhoz
    debugLog(`📝 Feladat betöltve: ${task.number}. feladat`);

    if (terminalReady && term) {
        term.clear();
    }

    codeEditor.setValue(answer.answer || '');

    updateTaskNavigation();

    logEvent('Task shown', { taskIndex: index, taskNumber: task.number });
}

// Feladat navigáció frissítése
function updateTaskNavigation() {
    const nav = document.getElementById('task-navigation');
    nav.innerHTML = '';

    selectedTasks.forEach((task, index) => {
        const btn = document.createElement('button');
        btn.className = 'task-nav-btn';
        btn.textContent = `${index + 1}. feladat`;

        if (index === currentTaskIndex) {
            btn.classList.add('active');
        }

        if (taskAnswers[index].answer && taskAnswers[index].answer.trim() !== '') {
            btn.classList.add('completed');
        }

        btn.addEventListener('click', () => {
            saveCurrentTaskTime();
            currentTaskIndex = index;
            showTask(index);
        });

        nav.appendChild(btn);
    });
}

// Feladat átugrása
function skipTask() {
    saveCurrentTaskTime();

    taskAnswers[currentTaskIndex].skipped = true;

    currentTaskIndex = (currentTaskIndex + 1) % selectedTasks.length;
    showTask(currentTaskIndex);

    logEvent('Task skipped', { newIndex: currentTaskIndex });
}

// Aktuális feladat idejének mentése
function saveCurrentTaskTime() {
    if (currentTaskIndex >= 0 && currentTaskIndex < taskAnswers.length) {
        const answer = taskAnswers[currentTaskIndex];
        if (answer.startTime) {
            const now = new Date();
            answer.timeSpent += Math.round((now - answer.startTime) / 1000);
            answer.startTime = null;
        }
    }
}

// Érdemjegy kiszámítása százalék alapján
function getGrade(percentage) {
    if (percentage >= 80) return { value: 5, label: 'Érdemjegy: 5' };
    if (percentage >= 60) return { value: 4, label: 'Érdemjegy: 4' };
    if (percentage >= 40) return { value: 3, label: 'Érdemjegy: 3' };
    if (percentage >= 20) return { value: 2, label: 'Érdemjegy: 2' };
    return { value: 1, label: 'Érdemjegy: 1' };
}

// Élő pontszám frissítése a felső sávban
function updateLiveScore() {
    const totalPossible = selectedTasks.reduce((sum, t) => sum + t.points, 0);
    const totalEarned = taskAnswers.reduce((sum, a) => sum + (a.earnedPoints || 0), 0);
    const percentage = totalPossible > 0 ? (totalEarned / totalPossible) * 100 : 0;
    const grade = getGrade(percentage);

    const scoreDisplay = document.getElementById('score-display');
    const gradeDisplay = document.getElementById('score-grade');

    if (scoreDisplay) {
        scoreDisplay.textContent = `${totalEarned} / ${totalPossible} pont`;
    }
    if (gradeDisplay) {
        gradeDisplay.textContent = grade.label;
        gradeDisplay.className = `score-grade grade-${grade.value}`;
    }
}

// Pontozási összefoglaló szöveges riport generálása (beadáshoz)
function buildScoringReport() {
    const totalPossible = selectedTasks.reduce((sum, t) => sum + t.points, 0);
    const totalEarned = taskAnswers.reduce((sum, a) => sum + (a.earnedPoints || 0), 0);
    const percentage = totalPossible > 0 ? (totalEarned / totalPossible) * 100 : 0;
    const grade = getGrade(percentage);

    const lines = [];
    lines.push('=== ÖSSZESÍTETT PONTOZÁS ===');
    lines.push('');
    lines.push(`Megszerzett pontok: ${totalEarned} / ${totalPossible}`);
    lines.push(`Százalék: ${percentage.toFixed(1)}%`);
    lines.push(`${grade.label}`);
    lines.push('');

    taskAnswers.forEach((answer, index) => {
        const taskPoints = selectedTasks[index] ? selectedTasks[index].points : 0;
        const earned = answer.earnedPoints || 0;
        lines.push(`  ${index + 1}. feladat: ${earned} / ${taskPoints} pont`);
        if (answer.scoringResults && answer.scoringResults.length > 0) {
            const failed = answer.scoringResults.filter(r => !r.passed);
            if (failed.length > 0) {
                lines.push(`    Nem teljesített feltételek (tanári mérlegelés szükséges):`);
                failed.forEach(r => lines.push(`      - ${r.label}`));
            } else {
                lines.push(`    Minden feltétel teljesítve.`);
            }
        } else {
            lines.push(`    (Pontozás nem futott le.)`);
        }
    });

    lines.push('');
    return lines.join('\n');
}

// Globális timer indítása
function startGlobalTimer() {
    if (globalTimer) {
        clearInterval(globalTimer);
    }

    globalTimer = setInterval(() => {
        globalTimeRemaining--;

        const minutes = Math.floor(globalTimeRemaining / 60);
        const seconds = globalTimeRemaining % 60;

        const timerElement = document.getElementById('global-timer');
        timerElement.textContent = `Hátralévő idő: ${minutes}:${seconds.toString().padStart(2, '0')}`;

        if (globalTimeRemaining <= 60) {
            timerElement.classList.add('warning');
        }

        if (globalTimeRemaining <= 0) {
            clearInterval(globalTimer);
            autoSubmitTest();
        }
    }, 1000);
}


// Python kód futtatása
async function runPythonCode() {
    if (pythonCodeRunning) {
        if (currentInputDisposable) {
            currentInputDisposable.dispose();
            currentInputDisposable = null;
        }
        pythonCodeRunning = false;
    }

    const code = codeEditor.getValue();

    if (!code || code.trim() === '') {
        term.writeln('⚠️ Nincs beírva semmilyen kód!');
        return;
    }

    pythonCodeRunning = true;
    const runBtn = document.getElementById('run-code-btn');
    if (runBtn) { runBtn.disabled = true; runBtn.textContent = '⏳ Fut...'; }

    term.clear();
    const indentationIssues = getIndentationIssues(code);
    if (indentationIssues.length > 0) {
        term.writeln('⚠️ Behúzás figyelmeztetés:');
        indentationIssues.slice(0, 5).forEach((issue) => {
            term.writeln(`- ${issue}`);
        });
        if (indentationIssues.length > 5) {
            term.writeln(`- ...további ${indentationIssues.length - 5} sor`);
        }
        term.writeln('');
    }

    logEvent('Code execution started', { code: code.substring(0, 100) });

    let pyodide;
    try {
        pyodide = await getPyodide();
    } catch (error) {
        pythonCodeRunning = false;
        if (runBtn) { runBtn.disabled = false; runBtn.textContent = '▶ Kód futtatása'; }
        await sleep(200);
        term.writeln('\r\n❌ Nem sikerült betölteni a Python értelmezőt!');
        term.writeln('💡 Kattints újra a "▶ Kód futtatása" gombra – automatikusan újrapróbálja.');
        term.writeln('   Ha többször sem sikerül, zárd be a többi böngészőfület.');
        return;
    }

    try {
        // Python input és közvetlen terminál-kimenet beállítása
        globalThis.js_input = customPythonInput;
        globalThis.js_print = (text) => { term.write(String(text)); };

        pyodide.runPython(`
import sys
from io import StringIO
import builtins

# Közvetlen terminál-kimenet: print() azonnal megjelenik
class _TermOut:
    def write(self, text):
        from js import js_print
        js_print(text)
        return len(text)
    def flush(self):
        pass

sys.stdout = _TermOut()
sys.stderr = StringIO()

async def input(prompt=''):
    from js import js_input
    result = await js_input(prompt)
    return result

builtins.input = input
`);

        // Kód futtatása aszinkron módon
        const wrappedCode = wrapPythonCodeForAsyncInput(code);
        await pyodide.runPythonAsync(wrappedCode);

        await sleep(400);
        term.writeln('\n✅  Kód sikeresen lefutott!');
        debugLog('✅ Kód futtatva');

        // Automatikus mentés a háttérben
        autoSaveProgress();

        // Teljes pontozás automatikusan (teszt: kritériumok is)
        setTimeout(() => checkScoring(), 200);

    } catch (error) {
        const errorMsg = error.message || String(error);
        // Csak az utolsó sor
        const lines = errorMsg.split('\n').filter(line => line.trim());
        const relevantError = lines[lines.length - 1] || errorMsg;

        await sleep(400);
        term.writeln('\n❌  Hiba: ' + relevantError);
        debugLog('❌ Kód futtatási hiba');

        // Hibás kód esetén is mentünk
        autoSaveProgress();
    } finally {
        pythonCodeRunning = false;
        currentInputDisposable = null;
        if (runBtn) { runBtn.disabled = false; runBtn.textContent = '▶ Kód futtatása'; }
    }
}

function getIndentationIssues(code) {
    const issues = [];
    const lines = code.split('\n');

    lines.forEach((line, index) => {
        if (!line.trim()) {
            return;
        }
        const match = line.match(/^[ \t]+/);
        if (!match) {
            return;
        }
        const indent = match[0];
        const hasTab = indent.includes('\t');
        const hasSpace = indent.includes(' ');
        const lineNumber = index + 1;

        if (hasTab && hasSpace) {
            issues.push(`${lineNumber}. sor: kevert TAB + szóköz`);
            return;
        }
        if (hasTab) {
            issues.push(`${lineNumber}. sor: TAB karakter a behúzásban`);
            return;
        }
        if (hasSpace && indent.length % 4 !== 0) {
            issues.push(`${lineNumber}. sor: behúzás nem 4-es többszöröse (${indent.length} szóköz)`);
        }
    });

    return issues;
}

function wrapPythonCodeForAsyncInput(code) {
    const transformed = transformInputCallsToAwait(code);
    const indented = transformed.split('\n').map((line) => '    ' + line).join('\n');
    return `async def __student_main__():\n${indented}\n\nawait __student_main__()\n`;
}

function transformInputCallsToAwait(code) {
    let out = '';
    let i = 0;
    let inSingle = false;
    let inDouble = false;
    let inTripleSingle = false;
    let inTripleDouble = false;
    let inComment = false;

    while (i < code.length) {
        const ch = code[i];
        const next3 = code.slice(i, i + 3);

        if (inComment) {
            out += ch;
            if (ch === '\n') {
                inComment = false;
            }
            i += 1;
            continue;
        }

        if (inSingle) {
            if (ch === '\\') {
                out += ch + (code[i + 1] || '');
                i += 2;
                continue;
            }
            out += ch;
            if (ch === '\'') {
                inSingle = false;
            }
            i += 1;
            continue;
        }

        if (inDouble) {
            if (ch === '\\') {
                out += ch + (code[i + 1] || '');
                i += 2;
                continue;
            }
            out += ch;
            if (ch === '"') {
                inDouble = false;
            }
            i += 1;
            continue;
        }

        if (inTripleSingle) {
            if (next3 === "'''") {
                out += next3;
                i += 3;
                inTripleSingle = false;
                continue;
            }
            out += ch;
            i += 1;
            continue;
        }

        if (inTripleDouble) {
            if (next3 === '"""') {
                out += next3;
                i += 3;
                inTripleDouble = false;
                continue;
            }
            out += ch;
            i += 1;
            continue;
        }

        if (next3 === "'''") {
            out += next3;
            i += 3;
            inTripleSingle = true;
            continue;
        }

        if (next3 === '"""') {
            out += next3;
            i += 3;
            inTripleDouble = true;
            continue;
        }

        if (ch === '\'') {
            out += ch;
            i += 1;
            inSingle = true;
            continue;
        }

        if (ch === '"') {
            out += ch;
            i += 1;
            inDouble = true;
            continue;
        }

        if (ch === '#') {
            out += ch;
            i += 1;
            inComment = true;
            continue;
        }

        if (code.startsWith('input', i) && isInputCallBoundary(code, i)) {
            let k = i + 5;
            while (k < code.length && (code[k] === ' ' || code[k] === '\t')) {
                k += 1;
            }
            if (code[k] === '(' && !hasAwaitBefore(code, i)) {
                out += 'await input';
                out += code.slice(i + 5, k + 1);
                i = k + 1;
                continue;
            }
        }

        out += ch;
        i += 1;
    }

    return out;
}

function isInputCallBoundary(code, index) {
    const prev = index > 0 ? code[index - 1] : '';
    if (prev && (isIdentChar(prev) || prev === '.')) {
        return false;
    }
    const next = index + 5 < code.length ? code[index + 5] : '';
    if (next && isIdentChar(next)) {
        return false;
    }
    return true;
}

function hasAwaitBefore(code, index) {
    let j = index - 1;
    while (j >= 0 && (code[j] === ' ' || code[j] === '\t')) {
        j -= 1;
    }
    const start = j - 4;
    if (start < 0) {
        return false;
    }
    const word = code.slice(start, j + 1);
    if (word !== 'await') {
        return false;
    }
    const before = start - 1 >= 0 ? code[start - 1] : '';
    if (before && isIdentChar(before)) {
        return false;
    }
    return true;
}

function isIdentChar(ch) {
    return (ch >= 'a' && ch <= 'z') ||
        (ch >= 'A' && ch <= 'Z') ||
        (ch >= '0' && ch <= '9') ||
        ch === '_';
}

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

function debounce(fn, delay) {
    let t;
    return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), delay); };
}

// Custom Python input - terminál alapú
function customPythonInput(prompt) {
    return new Promise((resolve) => {
        if (prompt) {
            term.write(String(prompt));
        }

        if (!term || typeof term.onData !== 'function') {
            resolve('');
            return;
        }

        // Fallback terminál: inline input mező a terminál aljára
        if (term._isFallback) {
            const termEl = document.getElementById('terminal');
            const row = document.createElement('div');
            row.style.cssText = 'display:flex;align-items:center;padding:0 8px 4px;';
            const inp = document.createElement('input');
            inp.type = 'text';
            inp.autocomplete = 'off';
            inp.spellcheck = false;
            inp.style.cssText = 'flex:1;background:transparent;border:none;border-bottom:1px solid #555;outline:none;color:#c0c0c0;font-family:Consolas,"Courier New",monospace;font-size:13px;padding:2px 0;';
            row.appendChild(inp);
            termEl.appendChild(row);
            termEl.scrollTop = termEl.scrollHeight;
            inp.focus();
            inp.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    const val = inp.value;
                    row.remove();
                    term.writeln(val);
                    resolve(val);
                }
            });
            return;
        }

        // Xterm.js: fókusz szükséges a billentyűleütések fogadásához
        if (typeof term.focus === 'function') term.focus();

        let inputBuffer = '';
        let disposable = null;

        const inputHandler = (data) => {
            if (data === '\r' || data === '\n') {
                // Enter lenyomva
                term.writeln('');
                if (disposable) {
                    disposable.dispose();
                }
                resolve(inputBuffer);
            } else if (data === '\u007F' || data === '\b') {
                // Backspace
                if (inputBuffer.length > 0) {
                    inputBuffer = inputBuffer.slice(0, -1);
                    term.write('\b \b');
                }
            } else if (data.length > 0 && data.charCodeAt(0) >= 32) {
                // Normál karakter (ASCII és ékezetes/unicode betűk is)
                inputBuffer += data;
                term.write(data);
            }
        };

        disposable = term.onData(inputHandler);
        currentInputDisposable = disposable;
    });
}

// Beküldés modal megjelenítése
function showSubmitModal() {
    submitModal.style.display = 'flex';
    logEvent('Submit modal shown');
}

// Beküldés modal elrejtése
function hideSubmitModal() {
    submitModal.style.display = 'none';
    logEvent('Submit modal hidden');
}

// Teszt beküldése
async function submitTest() {
    hideSubmitModal();

    saveCurrentTaskTime();

    if (globalTimer) {
        clearInterval(globalTimer);
    }
    if (autosaveInterval) {
        clearInterval(autosaveInterval);
        autosaveInterval = null;
    }

    testEndTime = new Date();
    testSubmitted = true;

    logEvent('Test submitted', { endTime: testEndTime });

    if (cheatDetected) {
        logEvent('Cheating detected', { reason: cheatReason });
    }

    const result = await submitToBackend();

    quizSection.classList.add('hidden');
    endSection.classList.remove('hidden');
    const totalMinutes = Math.floor((testEndTime - testStartTime) / 60000);
    const totalSeconds = Math.floor(((testEndTime - testStartTime) % 60000) / 1000);

    document.getElementById('final-time').textContent =
        `Teljes idő: ${totalMinutes} perc ${totalSeconds} másodperc`;

    const endTitle = document.getElementById('end-title');
    const endMessage = document.getElementById('end-message');
    const endIcon = document.getElementById('end-icon');
    const endStudentName = document.getElementById('end-student-name');

    if (endStudentName && studentData && studentData.name) {
        endStudentName.textContent = studentData.name;
    }

    // Eredmények összesítő az end-results divbe
    try {
        const resultsDiv = document.getElementById('end-results');
        if (resultsDiv && selectedTasks && taskAnswers) {
            let html = '';
            selectedTasks.forEach((task, i) => {
                const ans = taskAnswers[i] || {};
                const earned = ans.earnedPoints || 0;
                const max = task.points || 0;
                const pct = max > 0 ? Math.round(earned / max * 100) : 0;
                const color = pct >= 80 ? '#2ed573' : pct >= 50 ? '#f59e0b' : '#e94560';
                html += `<div style="margin-bottom:0.7rem;padding-bottom:0.7rem;border-bottom:1px solid #1e3a5f;">`;
                html += `<div style="font-weight:600;color:#e2e8f0;font-size:0.88rem;">${i+1}. feladat (${max} pont)</div>`;
                html += `<div style="color:${color};font-size:0.85rem;margin-top:2px;">Megszerzett pontok: <strong>${earned} / ${max}</strong></div>`;
                html += `</div>`;
            });
            const totalEarned = taskAnswers.reduce((s, a) => s + (a.earnedPoints || 0), 0);
            const totalMax = selectedTasks.reduce((s, t) => s + (t.points || 0), 0);
            html += `<div style="font-weight:700;color:#e2e8f0;font-size:0.95rem;">Összesen: ${totalEarned} / ${totalMax} pont</div>`;
            resultsDiv.innerHTML = html;
        }
    } catch(e) {}

    if (cheatDetected) {
        if (endIcon) endIcon.textContent = '⚠️';
        endTitle.textContent = 'Csalás észlelve!';
        endTitle.classList.add('cheat');
        endMessage.textContent = 'Csalást észleltünk, ezért az eddigi munkád kerül értékelésre. A teszt eredménye: elégtelen.';
    } else if (testMode === 'practice') {
        const elapsedSec = Math.floor((testEndTime - testStartTime) / 1000);
        const elapsedMin = Math.floor(elapsedSec / 60);
        const elapsedRemSec = elapsedSec % 60;
        const elapsedStr = `${elapsedMin}:${String(elapsedRemSec).padStart(2, '0')}`;

        // Pontok összeszámlálása
        const totalEarned = taskAnswers.reduce((s, a) => s + (a.earnedPoints || 0), 0);
        const totalMax = selectedTasks.reduce((s, t) => s + (t.points || 0), 0);

        endTitle.textContent = 'Kör vége! 🎉';
        endMessage.textContent = `Elért pontok: ${totalEarned} / ${totalMax}`;
        document.getElementById('final-time').textContent = `Eltelt idő: ${elapsedStr}`;

        // Körök mentése és megjelenítése
        if (solutionViewedTasks.length === 0) {
            savePracticeRound(elapsedSec, totalEarned, totalMax, selectedTaskType);
        }
        renderPracticeHistory(solutionViewedTasks.length > 0);

        const liveBtns = document.getElementById('end-live-buttons');
        if (liveBtns) liveBtns.style.display = 'none';
        const practiceRestart = document.getElementById('end-practice-restart');
        if (practiceRestart) practiceRestart.style.display = 'block';
    } else {
        endTitle.textContent = 'Feladat beadva';
        endMessage.textContent = 'A válaszaidat elküldtük a tanárnak.';
    }

    if (result && result.success) {
        debugLog('✅ Teszt sikeresen beküldve!');

        // ÉLES módban email küldés a tanárnak
        if (testMode === 'live') {
            sendEmailNotification(result.submission_id);
        }
    } else {
        debugLog('⚠️ Hiba történt a beküldés során, de a teszt véget ért.');
    }

    if (testMode === 'live' || testMode === 'vizsga') {
        downloadSubmissionTxt(result ? result.submission_id : '');
    }

    exitFullscreen();
}

// Automatikus beküldés idő lejárta esetén
function autoSubmitTest() {
    alert('Az idő lejárt! A teszt automatikusan beküldésre került.');
    submitTest();
}

// Fullscreen mód bekapcsolása
function enterFullscreen() {
    const elem = document.documentElement;
    fullscreenGraceUntil = Date.now() + 5000;

    if (elem.requestFullscreen) {
        elem.requestFullscreen();
    } else if (elem.webkitRequestFullscreen) {
        elem.webkitRequestFullscreen();
    } else if (elem.mozRequestFullScreen) {
        elem.mozRequestFullScreen();
    } else if (elem.msRequestFullscreen) {
        elem.msRequestFullscreen();
    }

    logEvent('Fullscreen entered');
}

// Fullscreen mód kikapcsolása
function exitFullscreen() {
    if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
    } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
    } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
    } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
    }
}

// Fullscreen változás kezelése
function handleFullscreenChange() {
    const isFullscreen = document.fullscreenElement ||
                        document.webkitFullscreenElement ||
                        document.mozFullScreenElement ||
                        document.msFullscreenElement;
    const testActive = !quizSection.classList.contains('hidden');

    if (!isFullscreen && !endSection.classList.contains('hidden')) {
        return;
    }

    if (testMode !== 'live' && testMode !== 'vizsga') {
        fullscreenPrompt.style.display = 'none';
        return;
    }

    if (sessionStorage.getItem('kandTeacherMode') === 'true') {
        fullscreenPrompt.style.display = 'none';
        return;
    }

    if (!isFullscreen && testActive) {
        // Azonnal feketére váltás – tartalom nem látható
        fullscreenPrompt.style.display = 'flex';
        logEvent('Fullscreen exited');
        // 3 másodperces grace periódus: visszatérhet büntetés nélkül
        const warnDiv = document.getElementById('fs-cheat-warn');
        if (warnDiv) warnDiv.style.display = 'block';
        clearTimeout(fsCheatDelayTimer);
        fsCheatDelayTimer = setTimeout(() => {
            fsCheatDelayTimer = null;
            startFsCountdown();
            showCheatWarning('Kiléptél a teljes képernyős módból');
        }, 3000);
    } else {
        fullscreenPrompt.style.display = 'none';
        clearTimeout(fsCheatDelayTimer);
        fsCheatDelayTimer = null;
        const warnDiv = document.getElementById('fs-cheat-warn');
        if (warnDiv) warnDiv.style.display = 'none';
        cancelFsCountdown();
        if (isFullscreen) {
            fullscreenEnforced = true;
        }
    }
}

function reenterFullscreen() {
    clearTimeout(fsCheatDelayTimer);
    fsCheatDelayTimer = null;
    const warnDiv = document.getElementById('fs-cheat-warn');
    if (warnDiv) warnDiv.style.display = 'none';
    cancelFsCountdown();
    const el = document.documentElement;
    const req = el.requestFullscreen || el.webkitRequestFullscreen || el.mozRequestFullScreen || el.msRequestFullscreen;
    if (req) req.call(el);
}

// Láthatóság változás kezelése
function handleVisibilityChange() {
    if (testMode !== 'live') {
        return;
    }
    if (sessionStorage.getItem('kandTeacherMode') === 'true') return;

    if (document.hidden && !quizSection.classList.contains('hidden')) {
        logEvent('Tab hidden - potential cheating');

        showCheatWarning('Másik fülre váltottál');
    }
}

// Ablak fókusz elvesztés kezelése
function handleWindowBlur() {
    if (testMode !== 'live') {
        return;
    }
    if (sessionStorage.getItem('kandTeacherMode') === 'true') return;

    if (!quizSection.classList.contains('hidden')) {
        logEvent('Window lost focus');
        fullscreenPrompt.style.display = 'flex';
        showCheatWarning('Elhagytad az ablakot');
    }
}

// Ablak fókusz visszanyerés kezelése
function handleWindowFocus() {
    if (focusLossTimeout) {
        clearTimeout(focusLossTimeout);
        focusLossTimeout = null;
    }
    logEvent('Window gained focus');
}

// Fókusz ellenőrzés indítása (csak logol, nem figyelmeztet – blur/visibility kezeli azt)
function startFocusCheck() {
    focusCheckInterval = setInterval(() => {
        if (!document.hasFocus() && !quizSection.classList.contains('hidden') && (testMode === 'live' || testMode === 'vizsga')) {
            logEvent('Focus check: window still unfocused');
        }
    }, 5000);
}

// DevTools észlelés
function detectDevTools() {
    const threshold = 160;

    setInterval(() => {
        if (window.outerWidth - window.innerWidth > threshold ||
            window.outerHeight - window.innerHeight > threshold) {

            logEvent('DevTools detected - potential cheating');

            if ((testMode === 'live' || testMode === 'vizsga') && !quizSection.classList.contains('hidden')) {
                showCheatWarning('Developer Tools észlelve');
            }
        }
    }, 1000);
}

function startFullscreenCheck() {
    if (fullscreenCheckInterval) {
        clearInterval(fullscreenCheckInterval);
    }

    fullscreenCheckInterval = setInterval(() => {
        if ((testMode !== 'live' && testMode !== 'vizsga') || quizSection.classList.contains('hidden')) {
            return;
        }
        const isFullscreen = document.fullscreenElement ||
                            document.webkitFullscreenElement ||
                            document.mozFullScreenElement ||
                            document.msFullscreenElement;
        if (!isFullscreen) {
            if (Date.now() < fullscreenGraceUntil) {
                return;
            }
            if (!fullscreenEnforced) {
                return;
            }
            showCheatWarning('Kiléptél a fullscreen módból');
        }
    }, 1000);
}

function showCheatWarning(reason) {
    if (quizSection.classList.contains('hidden')) return;
    if (testMode !== 'live') return;
    if (cheatDetected) return;
    if (cheatWarningCount >= 3) return;
    // Debounce: ugyanaz az esemény ne számlálódjon kétszer egymás után
    const now = Date.now();
    if (now - lastCheatWarningTime < 1500) return;
    lastCheatWarningTime = now;

    cheatWarningCount++;
    logEvent('Cheat warning #' + cheatWarningCount + ': ' + reason);

    const overlay = document.getElementById('cheat-warning-overlay');
    const textEl = document.getElementById('cheat-warning-text');
    const countEl = document.getElementById('cheat-warning-count');
    const finalMsg = document.getElementById('cheat-warning-final-msg');
    const closeBtn = document.getElementById('cheat-warning-close-btn');

    if (!overlay) return;

    if (textEl) textEl.textContent = reason;
    if (countEl) countEl.textContent = 'Csalási kísérlet 3/' + cheatWarningCount;
    overlay.style.display = 'flex';

    if (cheatWarningCount >= 3) {
        cheatPenalty = true;
        if (finalMsg) finalMsg.style.display = 'block';
        if (closeBtn) closeBtn.textContent = 'Megértettem, folytatom a tesztet';
        sendCheatNotification(reason);
    } else {
        if (finalMsg) finalMsg.style.display = 'none';
        if (closeBtn) {
            closeBtn.textContent = 'Megértettem, visszatérek';
        }
    }
}

function startFsCountdown() {
    const wrap = document.getElementById('fs-countdown');
    const numEl = document.getElementById('fs-countdown-num');
    if (!wrap || !numEl) return;
    cancelFsCountdown();
    let n = 5;
    numEl.textContent = n;
    wrap.style.display = 'block';
    fsCountdownTimer = setInterval(() => {
        n--;
        numEl.textContent = n;
        if (n <= 0) {
            cancelFsCountdown();
            location.replace('../portal.html');
        }
    }, 1000);
}

function cancelFsCountdown() {
    clearInterval(fsCountdownTimer);
    fsCountdownTimer = null;
    const wrap = document.getElementById('fs-countdown');
    if (wrap) wrap.style.display = 'none';
}

function closeCheatWarning() {
    const overlay = document.getElementById('cheat-warning-overlay');
    if (overlay) overlay.style.display = 'none';
    fullscreenPrompt.style.display = 'none';
    cancelFsCountdown();
    // Visszalép fullscreen-be ha éles/vizsga módban vagyunk és nem vagyunk fullscreen-ben
    if ((testMode === 'live' || testMode === 'vizsga') && !quizSection.classList.contains('hidden')) {
        const isFs = document.fullscreenElement || document.webkitFullscreenElement ||
                     document.mozFullScreenElement || document.msFullscreenElement;
        if (!isFs) enterFullscreen();
    }
}

function sendCheatNotification(reason) {
    if (!window.emailjs || testMode !== 'live') return;
    debugLog('📧 Oktató értesítése csalási kísérletről...');
    const emailParams = {
        to_email: 'sandornefr@gmail.com',
        subject: '⚠️ Csalási kísérlet: ' + (studentData.name || 'Ismeretlen tanuló'),
        reply_to: studentData.email || 'noreply@kkszki.hu',
        message: [
            '⚠️ CSALÁSI KÍSÉRLET ÉRTESÍTŐ',
            '',
            'Tanuló neve: ' + (studentData.name || '-'),
            'Email: ' + (studentData.email || '-'),
            'Osztály: ' + (studentData.class || '-'),
            'Időpont: ' + new Date().toLocaleString('hu-HU'),
            'Ok: ' + reason,
            '',
            '3/3 figyelmeztetés elérve. A tanuló a teszt folytatásához engedélyt kell kérjen.',
            'Egy érdemjegy levonás automatikusan rögzítve!'
        ].join('\n')
    };
    emailjs.send('service_zxskntr', 'template_vnqc2fd', emailParams, 'cesxNZpDSC16dOY2u')
        .then(() => debugLog('✅ Oktató értesítve'))
        .catch(err => debugLog('⚠️ Értesítési hiba: ' + err.message));
}

function handleCheating(reason) {
    if (cheatDetected || quizSection.classList.contains('hidden')) {
        return;
    }

    cheatDetected = true;
    cheatReason = reason;

    if (globalTimer) {
        clearInterval(globalTimer);
    }
    if (autosaveInterval) {
        clearInterval(autosaveInterval);
        autosaveInterval = null;
    }

    clearTimeout(fsCheatDelayTimer);
    fsCheatDelayTimer = null;
    const overlay = document.getElementById('cheat-warning-overlay');
    if (overlay) overlay.style.display = 'none';
    fullscreenPrompt.style.display = 'none';
    cancelFsCountdown();
    exitFullscreen();
    submitTest();
}

// Esemény naplózás (csak belső gyűjtés, nem jelenik meg a debug panelben)
function logEvent(eventName, data = {}) {
    const event = {
        timestamp: new Date().toISOString(),
        event: eventName,
        ...data
    };

    eventLog.push(event);
}

// Debug log
function debugLog(message) {
    const debugPanel = document.getElementById('debug-panel');
    const debugContent = document.getElementById('debug-content');

    if (!debugPanel || !debugContent) return;

    const timestamp = new Date().toLocaleTimeString();
    const logEntry = document.createElement('div');
    logEntry.style.marginBottom = '5px';
    logEntry.style.paddingBottom = '5px';
    logEntry.style.borderBottom = '1px solid #333';

    // Csak az üzenetet írjuk ki
    logEntry.textContent = `[${timestamp}] ${message}`;

    debugContent.appendChild(logEntry);

    // Automatikus görgetés az aljára
    setTimeout(() => {
        debugPanel.scrollTop = debugPanel.scrollHeight;
    }, 10);
}

// Teszt mód badge frissítése
function updateTestModeBadge() {
    const badge = document.getElementById('test-mode-badge');
    const text = document.getElementById('test-mode-text');

    if (!badge || !text) return;

    badge.style.display = 'block';

    const isTeacher = sessionStorage.getItem('kandTeacherMode') === 'true';

    if (testMode === 'live' || testMode === 'vizsga') {
        badge.style.display = 'block';
        badge.style.background = 'linear-gradient(135deg, #7a0000, #c0392b)';
        badge.style.color = 'white';
        badge.style.border = '2px solid #e94560';
        text.textContent = isTeacher
            ? '🔴 SZÁMONKÉRÉS MÓD aktív (oktatói nézet – anti-cheat kikapcsolva)'
            : '🔴 SZÁMONKÉRÉS MÓD – Az eredmények elküldésre kerülnek!';
    } else {
        badge.style.display = 'none';
    }

    // Szabályok szöveg a popupban: számonkérés/vizsga módban
    const isLive = (testMode === 'live' || testMode === 'vizsga') && !isTeacher;
    const rulesDiv = document.getElementById('start-live-rules');
    if (rulesDiv) rulesDiv.style.display = isLive ? 'block' : 'none';

    // Gomb szöveg éles módban
    const startBtn = document.getElementById('start-btn');
    if (startBtn) {
        startBtn.textContent = isLive
            ? 'Elfogadom a szabályokat – Teszt indítása'
            : 'Teszt indítása';
    }

    // Időbeállítás: csak gyakorló módban, nem oktatónak
    const picker = document.getElementById('practice-time-picker');
    if (picker) {
        picker.style.display = (!isTeacher && testMode === 'practice') ? 'block' : 'none';
    }

    // Feladattípus választó: csak gyakorló módban, nem oktatónak
    const taskTypePicker = document.getElementById('practice-task-type');
    if (taskTypePicker) {
        taskTypePicker.style.display = (!isTeacher && testMode === 'practice') ? 'block' : 'none';
    }
    updateTaskBreakdown();
}

let currentFontSize = document.body.classList.contains('nagy-mod') ? 28 : 20;

function changeFontSize(delta) {
    currentFontSize = Math.min(36, Math.max(10, currentFontSize + delta));
    try { if (codeEditor) codeEditor.updateOptions({ fontSize: currentFontSize }); } catch(e) {}
    try {
        if (term) {
            term.options.fontSize = currentFontSize;
            term.setOption('fontSize', currentFontSize);
            if (fitAddon) fitAddon.fit();
            term.refresh(0, term.rows - 1);
        }
    } catch(e) {}
    const display = document.getElementById('font-size-display');
    if (display) display.textContent = currentFontSize + 'px';
}

function setTaskType(type, btn) {
    selectedTaskType = type;
    document.querySelectorAll('.task-type-btn[data-type]').forEach(b => {
        b.classList.toggle('active', b.dataset.type === type);
    });
    updateTaskBreakdown();
}

function updateTaskBreakdown() {
    const rowsEl = document.getElementById('task-breakdown-rows');
    const totalEl = document.getElementById('task-breakdown-total');
    const titleEl = document.getElementById('task-breakdown-title');
    if (!rowsEl || !totalEl || !titleEl) return;

    if (selectedTaskType === 'csak8') {
        titleEl.textContent = '3 db 8 pontos feladat:';
        rowsEl.innerHTML = `
            <div class="task-row">
                <span class="task-badge pt8">8 pont × 3</span>
                <span class="task-row-desc">Egyszerűbb feladatok</span>
                <span class="task-row-time">8–15 perc/feladat</span>
            </div>`;
        totalEl.innerHTML = 'Összesen: <strong style="color:#e0e0e0;">24 pont</strong>';
    } else if (selectedTaskType === 'csak14') {
        titleEl.textContent = '3 db 14 pontos feladat:';
        rowsEl.innerHTML = `
            <div class="task-row">
                <span class="task-badge pt14">14 pont × 3</span>
                <span class="task-row-desc">Összetettebb feladatok</span>
                <span class="task-row-time">~25 perc/feladat</span>
            </div>`;
        totalEl.innerHTML = 'Összesen: <strong style="color:#e0e0e0;">42 pont</strong>';
    } else {
        titleEl.textContent = 'Véletlenszerűen kiosztott feladatok:';
        rowsEl.innerHTML = `
            <div class="task-row">
                <span class="task-badge pt8">8 pont × 2</span>
                <span class="task-row-desc">Egyszerűbb feladatok</span>
                <span class="task-row-time">8–15 perc/feladat</span>
            </div>
            <div class="task-row">
                <span class="task-badge pt14">14 pont × 1</span>
                <span class="task-row-desc">Összetettebb feladat</span>
                <span class="task-row-time">~25 perc</span>
            </div>`;
        totalEl.innerHTML = 'Összesen: <strong style="color:#e0e0e0;">30 pont</strong> &nbsp;|&nbsp; ~45 perc';
    }
}

function restartPractice() {
    // State reset
    testSubmitted = false;
    testStartTime = null;
    testEndTime = null;
    selectedTasks = [];
    taskAnswers = [];
    currentTaskIndex = 0;
    cheatDetected = false;
    cheatWarningCount = 0;
    solutionViewedTasks = [];

    // End section elrejtése, live buttons visszaállítása a következő körre
    endSection.classList.add('hidden');
    const liveBtns = document.getElementById('end-live-buttons');
    if (liveBtns) liveBtns.style.display = 'block';
    const practiceRestart = document.getElementById('end-practice-restart');
    if (practiceRestart) practiceRestart.style.display = 'none';

    // Start screen mutatása a típusválasztóval
    startSection.classList.remove('hidden');
    updateStartSection();
}

// Gyakorló kör mentése localStorage-ba
function savePracticeRound(elapsedSec, earned, max, taskType) {
    try {
        const user = JSON.parse(sessionStorage.getItem('kandoUser') || '{}');
        const key = 'kandoPracticeRounds_' + (user.email || 'unknown');
        const rounds = JSON.parse(localStorage.getItem(key) || '[]');
        rounds.push({
            date: new Date().toISOString(),
            elapsedSec,
            earned,
            max,
            taskType,
            pct: max > 0 ? Math.round(earned / max * 100) : 0
        });
        // Max 50 kör tárolása
        if (rounds.length > 50) rounds.splice(0, rounds.length - 50);
        localStorage.setItem(key, JSON.stringify(rounds));
    } catch(e) {}
}

function renderPracticeHistory(solutionPeeked) {
    const el = document.getElementById('end-practice-history');
    if (!el) return;
    try {
        const user = JSON.parse(sessionStorage.getItem('kandoUser') || '{}');
        const key = 'kandoPracticeRounds_' + (user.email || 'unknown');
        const rounds = JSON.parse(localStorage.getItem(key) || '[]');

        // Ha megoldókulcsot nézett, csak üzenetet mutatunk
        if (solutionPeeked) {
            el.style.display = 'block';
            const prevRoundsHtml = rounds.length >= 1 ? (() => {
                const typeLabel = { random: '🎲 Vegyes', csak8: '8 pt', csak14: '14 pt' };
                const last5 = rounds.slice(-5).reverse();
                const rows = last5.map((r, i) => {
                    const min = Math.floor(r.elapsedSec / 60);
                    const sec = String(r.elapsedSec % 60).padStart(2, '0');
                    const isLatest = i === 0;
                    return `<tr style="opacity:${isLatest ? 1 : 0.65};">
                        <td style="padding:4px 8px;color:#94a3b8;font-size:0.8rem;">${new Date(r.date).toLocaleDateString('hu-HU', {month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'})}</td>
                        <td style="padding:4px 8px;color:#e2e8f0;font-weight:${isLatest?700:400};">${min}:${sec}</td>
                        <td style="padding:4px 8px;color:${r.pct>=70?'#4ade80':r.pct>=50?'#fbbf24':'#f87171'};font-weight:${isLatest?700:400};">${r.earned}/${r.max} (${r.pct}%)</td>
                        <td style="padding:4px 8px;color:#64748b;font-size:0.8rem;">${typeLabel[r.taskType]||r.taskType}</td>
                    </tr>`;
                }).join('');
                return `<table style="width:100%;border-collapse:collapse;margin-top:0.5rem;">
                    <thead><tr style="font-size:0.75rem;color:#475569;">
                        <th style="padding:2px 8px;text-align:left;">Időpont</th>
                        <th style="padding:2px 8px;text-align:left;">Idő</th>
                        <th style="padding:2px 8px;text-align:left;">Pont</th>
                        <th style="padding:2px 8px;text-align:left;">Típus</th>
                    </tr></thead><tbody>${rows}</tbody></table>`;
            })() : '';
            el.innerHTML = `
                <div style="margin-top:0.5rem;background:#0f1b2d;border-radius:10px;padding:0.8rem 1rem;">
                    <div style="color:#fbbf24;font-size:0.85rem;margin-bottom:0.4rem;">👁️ Megoldókulcsot nézett – ez a kör nem kerül a statisztikába.</div>
                    <div style="color:#64748b;font-size:0.8rem;">Próbáld meg legközelebb a megoldás nézése nélkül! 💪</div>
                    ${rounds.length >= 1 ? `<div style="font-size:0.82rem;color:#64748b;margin-top:0.8rem;margin-bottom:0.3rem;">📊 Korábbi köreid (utolsó 5)</div>${prevRoundsHtml}` : ''}
                </div>`;
            return;
        }

        if (rounds.length < 2) { el.style.display = 'none'; return; }

        const typeLabel = { random: '🎲 Vegyes', csak8: '8 pt', csak14: '14 pt' };
        const last5 = rounds.slice(-5).reverse();
        const rows = last5.map((r, i) => {
            const min = Math.floor(r.elapsedSec / 60);
            const sec = String(r.elapsedSec % 60).padStart(2, '0');
            const isLatest = i === 0;
            return `<tr style="opacity:${isLatest ? 1 : 0.65};">
                <td style="padding:4px 8px;color:#94a3b8;font-size:0.8rem;">${new Date(r.date).toLocaleDateString('hu-HU', {month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'})}</td>
                <td style="padding:4px 8px;color:#e2e8f0;font-weight:${isLatest?700:400};">${min}:${sec}</td>
                <td style="padding:4px 8px;color:${r.pct>=70?'#4ade80':r.pct>=50?'#fbbf24':'#f87171'};font-weight:${isLatest?700:400};">${r.earned}/${r.max} (${r.pct}%)</td>
                <td style="padding:4px 8px;color:#64748b;font-size:0.8rem;">${typeLabel[r.taskType]||r.taskType}</td>
            </tr>`;
        }).join('');

        el.style.display = 'block';
        el.innerHTML = `
            <div style="margin-top:0.5rem;background:#0f1b2d;border-radius:10px;padding:0.8rem 1rem;">
                <div style="font-size:0.82rem;color:#64748b;margin-bottom:0.5rem;">📊 Eddigi köreid (utolsó 5)</div>
                <table style="width:100%;border-collapse:collapse;">
                    <thead><tr style="font-size:0.75rem;color:#475569;">
                        <th style="padding:2px 8px;text-align:left;">Időpont</th>
                        <th style="padding:2px 8px;text-align:left;">Idő</th>
                        <th style="padding:2px 8px;text-align:left;">Pont</th>
                        <th style="padding:2px 8px;text-align:left;">Típus</th>
                    </tr></thead>
                    <tbody>${rows}</tbody>
                </table>
            </div>`;
    } catch(e) { el.style.display = 'none'; }
}

// Email értesítés küldése (csak ÉLES módban)
function sendEmailNotification(submissionId) {
    if (!window.emailjs) {
        debugLog('⚠️ EmailJS nincs betöltve');
        return;
    }

    debugLog('📧 Email küldése...');

    const start = testStartTime ? testStartTime.toLocaleString('hu-HU') : '-';
    const end = testEndTime ? testEndTime.toLocaleString('hu-HU') : '-';
    const totalSeconds = testStartTime && testEndTime
        ? Math.round((testEndTime - testStartTime) / 1000)
        : 0;

    const tasksText = taskAnswers.map((answer, index) => {
        const timeSpent = formatDuration(answer.timeSpent || 0);
        return [
            `--- ${index + 1}. FELADAT (Eredeti ${answer.taskNumber || '-'} . feladat) ---`,
            `Időráfordítás: ${timeSpent}`,
            `Átugrva: ${answer.skipped ? 'Igen' : 'Nem'}`,
            '',
            'FELADAT LEÍRÁSA:',
            answer.taskDescription || '',
            '',
            'MINTA KIMENET:',
            answer.taskExample || '',
            '',
            'TANULÓ VÁLASZA:',
            answer.answer || '',
            ''
        ].join('\n');
    }).join('\n');

    const eventsText = eventLog.map((evt) => {
        const time = evt.timestamp || '';
        const type = evt.event || evt.type || '';
        return `${time} - ${type}`;
    }).join('\n');

    const message = [
        `Tanuló neve: ${studentData.name}`,
        `Tanuló email: ${studentData.email}`,
        `Osztály: ${studentData.class}`,
        `Teszt kezdete: ${start}`,
        `Teszt vége: ${end}`,
        `Teljes idő: ${formatDuration(totalSeconds)}`,
        `Státusz: ${cheatDetected ? 'Csalás (kizárva)' : cheatPenalty ? 'Figyelmeztetés (érdemjegy levonás!)' : 'Rendben'}`,
        `Figyelmeztetések száma: ${cheatWarningCount}`,
        '',
        buildScoringReport(),
        '=== FELADATOK ÉS VÁLASZOK ===',
        '',
        tasksText,
        '',
        '=== ESEMÉNYNAPLÓ ===',
        eventsText
    ].join('\n');

    const emailParams = {
        to_email: 'sandornefr@gmail.com',
        subject: studentData.name || 'Python teszt',
        reply_to: studentData.email,
        message: message
    };

    emailjs.send('service_zxskntr', 'template_vnqc2fd', emailParams, 'cesxNZpDSC16dOY2u')
        .then(() => {
            debugLog('✅ Email sikeresen elküldve!');
            logEvent('Email sent', { submission_id: submissionId });
        })
        .catch((error) => {
            debugLog('❌ Email küldési hiba: ' + error.text);
            logEvent('Email send error', { error: error.text });
        });
}

function downloadSubmissionTxt(submissionId) {
    const lines = [];
    const now = new Date();

    lines.push('Python teszt - beadás');
    lines.push(`Dátum: ${now.toLocaleString('hu-HU')}`);
    lines.push(`Azonosító: ${submissionId || '-'}`);
    lines.push(`Név: ${studentData.name || '-'}`);
    lines.push(`Email: ${studentData.email || '-'}`);
    lines.push(`Osztály: ${studentData.class || '-'}`);
    lines.push(`Mód: ${testMode}`);
    if (cheatDetected) {
        lines.push(`Csalás: Igen (${cheatReason})`);
    } else {
        lines.push('Csalás: Nem');
    }
    lines.push('');
    lines.push(buildScoringReport());
    lines.push('=== FELADATOK ÉS VÁLASZOK ===');
    lines.push('');

    taskAnswers.forEach((answer, index) => {
        lines.push(`--- ${index + 1}. FELADAT (Eredeti ${answer.taskNumber || '-'} . feladat) ---`);
        lines.push(`Időráfordítás: ${formatDuration(answer.timeSpent || 0)}`);
        lines.push(`Átugrva: ${answer.skipped ? 'Igen' : 'Nem'}`);
        lines.push('');
        lines.push('FELADAT LEÍRÁSA:');
        lines.push(answer.taskDescription || '');
        lines.push('');
        lines.push('MINTA KIMENET:');
        lines.push(answer.taskExample || '');
        lines.push('');
        lines.push('TANULÓ VÁLASZA:');
        lines.push(answer.answer || '');
        lines.push('');
    });

    lines.push('=== ESEMÉNYNAPLÓ ===');
    eventLog.forEach((evt) => {
        const time = evt.timestamp || '';
        const type = evt.event || evt.type || '';
        lines.push(`${time} - ${type}`);
    });

    const content = lines.join('\n');
    const nameParts = (studentData.name || 'diak ismeretlen').trim().split(/\s+/);
    const safeLast = (nameParts[0] || 'diak').toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]/g, '');
    const safeFirst = nameParts.slice(1).join('_').toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9_]/g, '') || 'ismeretlen';
    const [classYear, classLetter] = (studentData.class || '0.x').split('.');
    const safeEmail = (studentData.email || '')
        .replace('@kkszki.hu', '')
        .toLowerCase()
        .replace(/[^a-z0-9.]/g, '');
    const filename = `${safeLast || 'diak'}_${safeFirst}_${classYear || '0'}_${classLetter || 'x'}_${safeEmail || 'ismeretlen'}_python.txt`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function getEffectiveTimeSpent(answer, index) {
    const base = answer.timeSpent || 0;
    if (index !== currentTaskIndex) {
        return base;
    }
    if (!answer.startTime) {
        return base;
    }
    const elapsed = Math.round((Date.now() - answer.startTime.getTime()) / 1000);
    return base + Math.max(0, elapsed);
}

function startAutoSaveInterval() {
    if (autosaveInterval) {
        clearInterval(autosaveInterval);
    }
    autosaveInterval = setInterval(() => {
        if (!quizSection.classList.contains('hidden')) {
            autoSaveProgress();
        }
    }, 10000);
}

function formatDuration(totalSeconds) {
    const seconds = Math.max(0, Math.floor(totalSeconds));
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    if (minutes === 0) {
        return `${remainingSeconds} másodperc`;
    }
    return `${minutes} perc ${remainingSeconds} másodperc`;
}

// ==================== GYAKORLÓ MÓD FUNKCIÓK ====================

function showNextHint() {
    const task = selectedTasks[currentTaskIndex];
    if (!task) return;
    const hints = task.hints && task.hints.length > 0 ? task.hints : (megoldasok[String(task.number)]?.hints || []);

    if (hints.length === 0) {
        showHintToast('ℹ️ Ehhez a feladathoz nincs tipp.', 0);
        return;
    }

    if (!tippIndex[currentTaskIndex]) tippIndex[currentTaskIndex] = 0;
    const idx = tippIndex[currentTaskIndex];

    if (idx >= hints.length) {
        showHintToast('Már az összes tippet láttad! 😊', 0);
        return;
    }

    const titles = ['1. Tipp (általános)', '2. Tipp (konkrétabb)', '3. Tipp (majdnem megoldás)'];
    showHintToast(hints[idx], idx, titles[idx] || `${idx+1}. Tipp`);
    tippIndex[currentTaskIndex] = idx + 1;

    const btn = document.getElementById('btn-hint');
    if (btn) {
        const remaining = hints.length - tippIndex[currentTaskIndex];
        btn.textContent = remaining > 0 ? `💡 Tipp (${remaining} maradt)` : '💡 Nincs több tipp';
    }
}

function showHintToast(text, level, title) {
    // Remove existing toast
    const existing = document.getElementById('hint-toast');
    if (existing) existing.remove();

    const colors = ['#f59e0b', '#f97316', '#ef4444'];
    const toast = document.createElement('div');
    toast.id = 'hint-toast';
    toast.className = 'hint-toast';
    toast.style.borderLeftColor = colors[level] || '#f59e0b';
    toast.innerHTML = `
        <div class="hint-toast-title" style="color:${colors[level] || '#f59e0b'}">${title || 'Tipp'}</div>
        <div>${text}</div>
        <div style="margin-top:0.5rem;text-align:right;">
            <button onclick="document.getElementById('hint-toast').remove()" style="background:transparent;border:1px solid #475569;color:#94a3b8;border-radius:4px;padding:2px 10px;cursor:pointer;font-size:0.8rem;">Bezár</button>
        </div>`;
    document.body.appendChild(toast);
    setTimeout(() => { if (toast.parentNode) toast.remove(); }, 12000);
}

function showSolution() {
    const task = selectedTasks[currentTaskIndex];
    if (!task) return;
    const solution = (task.solution && task.solution.trim()) ? task.solution : (megoldasok[String(task.number)]?.solution || '');

    if (!solution) {
        showHintToast('Ehhez a feladathoz nincs feltöltött megoldás.', 0, 'ℹ️ Megoldás');
        return;
    }

    const modal = document.getElementById('solution-modal');
    const codeEl = document.getElementById('solution-modal-code');
    if (!modal || !codeEl) return;

    codeEl.textContent = solution;
    modal.style.display = 'flex';

    // Flag: ezt a feladatot megoldókulcssal nézte
    if (!solutionViewedTasks.includes(currentTaskIndex)) {
        solutionViewedTasks.push(currentTaskIndex);
    }
}

function retryTask() {
    if (!confirm('Biztosan újra akarod kezdeni ezt a feladatot? A kódod törlődik.')) return;
    if (codeEditor) codeEditor.setValue('');
    // Reset tipp index for this task
    if (tippIndex[currentTaskIndex] !== undefined) tippIndex[currentTaskIndex] = 0;
    const btn = document.getElementById('btn-hint');
    const task = selectedTasks[currentTaskIndex];
    if (btn && task) {
        const hints = task.hints && task.hints.length > 0 ? task.hints : (megoldasok[String(task.number)]?.hints || []);
        btn.textContent = hints.length > 0 ? `💡 Tipp (${hints.length} maradt)` : '💡 Tipp';
    }
}
