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
let suppressNextBlur = false; // W3Schools popup megnyitásakor az első blur-t elnyomjuk
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
let lastRoundTaskNumbers = new Set(); // előző kör feladatszámai – elkerüljük az ismétlést
let customTaskHistory = []; // utolsó 5 kör feladatszámai [[n,n,n], ...]

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
        const backBtn = document.getElementById('back-to-menu-btn');
        if (backBtn) backBtn.classList.remove('hidden');
        updateStartSection();
    }

    // Pyodide előbetöltése a háttérben
    getPyodide()
        .then(() => debugLog('✅ Python értelmező kész'))
        .catch(err => debugLog('⚠️ Python előbetöltési hiba: ' + err.message));
}

function updateStartSection() {
    const isPractice = (testMode === 'practice');
    const practiceType = document.getElementById('practice-task-type');
    if (practiceType) practiceType.style.display = isPractice ? 'block' : 'none';
    const timePicker = document.getElementById('practice-time-picker');
    if (timePicker) timePicker.style.display = isPractice ? 'block' : 'none';
    const customBtn = document.getElementById('btn-open-custom-modal');
    if (customBtn) customBtn.style.display = isPractice ? 'block' : 'none';
    const liveRules = document.getElementById('start-live-rules');
    if (liveRules) liveRules.style.display = isPractice ? 'none' : 'block';
    const badge = document.getElementById('test-mode-badge');
    const badgeText = document.getElementById('test-mode-text');
    if (badge && badgeText) {
        badge.style.display = 'block';
        if (isPractice) {
            badge.style.cssText = 'padding:0.5rem 1rem;border-radius:8px;text-align:center;margin-bottom:0.6rem;font-weight:600;font-size:0.9rem;background:#0d2b0d;border:1px solid #2ed573;color:#2ed573;';
            badgeText.textContent = '🎓 GYAKORLÓ MÓD';
        } else {
            badge.style.cssText = 'padding:0.5rem 1rem;border-radius:8px;text-align:center;margin-bottom:0.6rem;font-weight:600;font-size:0.9rem;background:#2d0a0a;border:1px solid #e94560;color:#e94560;';
            badgeText.textContent = (testMode === 'vizsga' ? '🎓 VIZSGA MÓD' : '🔴 ÉLES MÓD');
        }
    }
    updateTaskBreakdown();
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
// Beadás előtti automatikus pontozás – csak ahol van kód de earnedPoints == 0
async function autoScoreUnscoredTasks() {
    for (let i = 0; i < selectedTasks.length; i++) {
        const answer = taskAnswers[i];
        if (!answer || answer.earnedPoints > 0) continue;
        const code = (answer.answer || '').trim();
        if (!code) continue;
        const task = selectedTasks[i];
        if (!task || !task.criteria || task.criteria.length === 0) continue;

        debugLog(`⏳ Automatikus pontozás: ${task.number}. feladat`);

        const results = task.criteria.map(criterion => {
            if (criterion.type === 'teszt') {
                return { criterion, passed: false, _needsRun: true };
            }
            return { criterion, passed: evaluateCriterion(code, criterion) };
        });

        for (let j = 0; j < results.length; j++) {
            if (!results[j]._needsRun) continue;
            const criterion = results[j].criterion;
            const firstColon = criterion.args.indexOf(':');
            if (firstColon === -1) {
                results[j] = { criterion, passed: false };
                continue;
            }
            const inputsStr = criterion.args.substring(0, firstColon);
            const expected = criterion.args.substring(firstColon + 1);
            const inputs = inputsStr.split(',');
            try {
                const res = await runCodeWithMockInputs(code, inputs);
                results[j] = {
                    criterion,
                    passed: !res.pyodideFailed && res.success &&
                            res.output.toLowerCase().includes(expected.toLowerCase())
                };
            } catch (e) {
                results[j] = { criterion, passed: false };
            }
        }

        const earned = Math.min(
            results.filter(r => r.passed === true).length,
            task.points || results.length
        );
        taskAnswers[i].earnedPoints = earned;
        taskAnswers[i].scoringResults = results.map(r => ({
            label: r.criterion.label,
            passed: r.passed
        }));
        debugLog(`✅ Automatikus pontozás kész: ${task.number}. feladat → ${earned} pont`);
    }
}

async function submitToBackend() {
    // Practice módban nincs szükség backend hívásra – lokálisan mentődik
    if (testMode === 'practice') {
        debugLog('🎓 Gyakorló mód – backend hívás kihagyva');
        return { success: true, submission_id: null };
    }

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
            mode: 'live',
            codeSnapshot: codeSnapshot,
            cheatPenalty: cheatPenalty,
            cheatWarnings: cheatWarningCount
        };

        debugLog('📦 Adat előkészítve');

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 12000);

        const response = await fetch(RAILWAY_URL + '/api/submit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
            signal: controller.signal
        });
        clearTimeout(timeoutId);

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
        debugLog('❌ Backend hiba: ' + error.message);
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
        const response = await fetch('feladatok.txt', { signal: AbortSignal.timeout(10000) });
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
    let inModulTartalom = false;
    let exampleLines = [];
    let criteriaLines = [];
    let tippLines = [];
    let megoldasLines = [];
    let modulLines = [];

    const resetSections = () => {
        inExample = false; inCriteria = false; inTippek = false; inMegoldas = false; inModulTartalom = false;
    };

    for (let line of lines) {
        const taskMatch = line.match(/^(\d+)\.\s*feladat/i);

        if (taskMatch) {
            if (currentTask) {
                currentTask.example = exampleLines.join('\n');
                currentTask.criteria = parseCriteria(criteriaLines);
                currentTask.hints = tippLines.filter(h => h.trim() !== '');
                currentTask.solution = megoldasLines.join('\n').trim();
                currentTask.modulTartalom = modulLines.join('\n').trim();
                tasks.push(currentTask);
            }
            currentTask = { number: parseInt(taskMatch[1]), cim: '', description: '', example: '', points: 8, criteria: [], hints: [], solution: '', modulNev: '', modulTartalom: '' };
            resetSections();
            exampleLines = []; criteriaLines = []; tippLines = []; megoldasLines = []; modulLines = [];
            continue;
        }

        const pointMatch = line.match(/^Pont:\s*(\d+)/i);
        if (pointMatch && currentTask) { currentTask.points = parseInt(pointMatch[1]); continue; }

        const cimMatch = line.match(/^Cim:\s*(.+)/i);
        if (cimMatch && currentTask) { currentTask.cim = cimMatch[1].trim(); continue; }

        const tipusMatch = line.match(/^Tipus:\s*(.+)/i);
        if (tipusMatch && currentTask) { currentTask.tipus = tipusMatch[1].trim(); continue; }

        const modulNevMatch = line.match(/^ModulNev:\s*(.+)/i);
        if (modulNevMatch && currentTask) { currentTask.modulNev = modulNevMatch[1].trim(); continue; }

        const nehezMatch = line.match(/^Nehezseg:\s*(.+)/i);
        if (nehezMatch && currentTask) { currentTask.nehezseg = nehezMatch[1].trim(); continue; }

        if (line.trim() === 'Pontozas:')     { resetSections(); inCriteria       = true; continue; }
        if (line.trim() === 'Tippek:')       { resetSections(); inTippek         = true; continue; }
        if (line.trim() === 'Megoldas:')     { resetSections(); inMegoldas       = true; continue; }
        if (line.trim() === 'ModulTartalom:'){ resetSections(); inModulTartalom  = true; continue; }
        if (line.trim() === 'ModulVege')     { inModulTartalom = false; continue; }

        if (line.trim() === '```python' || line.trim() === '```') {
            if (!inCriteria && !inTippek) inExample = inMegoldas ? false : !inExample;
            continue;
        }
        if (line.match(/^Minta kód:/i)) continue;

        if (currentTask) {
            if (inCriteria)        { if (line.trim() !== '') criteriaLines.push(line.trim()); }
            else if (inTippek)     { if (line.trim() !== '') tippLines.push(line.trim()); }
            else if (inMegoldas)   { megoldasLines.push(line); }
            else if (inModulTartalom) { modulLines.push(line); }
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
        currentTask.modulTartalom = modulLines.join('\n').trim();
        tasks.push(currentTask);
    }

    const count8 = tasks.filter(t => t.points === 8).length;
    const count14 = tasks.filter(t => t.points === 14).length;
    const count18 = tasks.filter(t => t.points === 18).length;
    debugLog(`✅ ${tasks.length} feladat betöltve (${count8} db 8 pontos, ${count14} db 14 pontos, ${count18} db 18 pontos)`);
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
    const tasks18check = tasks.filter(t => t.points === 18);
    if (selectedTaskType === 'csak18') {
        if (tasks18check.length < 1) {
            alert(`Nincs 18 pontos feladat betöltve! Ellenőrizd a feladatok.txt fájlt.`);
            return;
        }
    } else if (tasks8.length < 2 || tasks14.length < 1) {
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

    await selectRandomTasks();

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
    const backToMenuBtn = document.getElementById('back-to-menu-btn');
    if (backToMenuBtn) backToMenuBtn.classList.add('hidden');
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
    const submitHint = document.getElementById('submit-hint');
    if (submitLabel) {
        if (testMode === 'live' || testMode === 'vizsga') {
            submitLabel.textContent = 'Számonkérés beadása';
            if (submitHint) submitHint.style.display = 'none';
        } else {
            submitLabel.textContent = 'Kész';
            if (submitHint) submitHint.style.display = 'block';
        }
    }

    // Vízjel – tanuló neve + emailje (screenshothoz)

    // Oktatói/bemutató módban nincs fullscreen kényszer; vizsga módban igen
    if (!isTeacherMode && (testMode === 'live' || testMode === 'vizsga')) {
        enterFullscreen();
    }

    setTimeout(() => {
        currentTaskIndex = 0;

        // Timer kijelző azonnali frissítése (ne várjon az első tick-re)
        const timerEl = document.getElementById('global-timer');
        if (timerEl) {
            const m = Math.floor(globalTimeRemaining / 60);
            const s = globalTimeRemaining % 60;
            timerEl.textContent = `Hátralévő idő: ${m}:${s.toString().padStart(2, '0')}`;
            timerEl.classList.remove('warning');
        }

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

// Véletlenszerű feladatok kiválasztása – előző kör feladatait kizárja ha lehet
async function selectRandomTasks() {
    const tasks8  = tasks.filter(t => t.points === 8);
    const tasks14 = tasks.filter(t => t.points === 14);
    const tasks18 = tasks.filter(t => t.points === 18 && t.modulNev);

    // Előző kör betöltése: először backend (cross-device), fallback localStorage
    const email = studentData.email || 'anon';
    const lsKey = 'kandoLastTasks_' + email;
    try {
        const resp = await fetch(RAILWAY_URL + '/api/user-state/' + encodeURIComponent(email.replace('@kkszki.hu','')) + '/lastTasks', { signal: AbortSignal.timeout(5000) });
        if (resp.ok) {
            const data = await resp.json();
            if (data.value) {
                const nums = JSON.parse(data.value);
                if (Array.isArray(nums) && nums.length > 0) lastRoundTaskNumbers = new Set(nums);
            }
        }
    } catch(e) {
        // fallback: localStorage
        try {
            const saved = JSON.parse(localStorage.getItem(lsKey) || '[]');
            if (saved.length > 0) lastRoundTaskNumbers = new Set(saved);
        } catch(e2) {}
    }

    // Előző körben nem szereplő feladatok (ha van elég belőlük, azokat részesítjük előnyben)
    const fresh8  = tasks8.filter(t => !lastRoundTaskNumbers.has(t.number));
    const fresh14 = tasks14.filter(t => !lastRoundTaskNumbers.has(t.number));
    const fresh18 = tasks18.filter(t => !lastRoundTaskNumbers.has(t.number));

    const shuffle = arr => [...arr].sort(() => 0.5 - Math.random());

    if (selectedTaskType === 'csak8') {
        const pool = fresh8.length >= 3 ? fresh8 : tasks8;
        selectedTasks = shuffle(pool).slice(0, 3);
    } else if (selectedTaskType === 'csak14') {
        const pool = fresh14.length >= 3 ? fresh14 : tasks14;
        selectedTasks = shuffle(pool).slice(0, 3);
    } else if (selectedTaskType === 'csak18') {
        const pool = fresh18.length >= 1 ? fresh18 : tasks18;
        selectedTasks = shuffle(pool).slice(0, 1);
    } else {
        // random: 2×8 + 1×14
        const pool8 = fresh8.length >= 2 ? fresh8 : tasks8;
        const pool14 = fresh14.length >= 1 ? fresh14 : tasks14;
        selectedTasks = [...shuffle(pool8).slice(0, 2), ...shuffle(pool14).slice(0, 1)].sort(() => 0.5 - Math.random());
    }

    // Aktuális kör feladatait eltároljuk a következő kör kizárásához (backend + localStorage fallback)
    lastRoundTaskNumbers = new Set(selectedTasks.map(t => t.number));
    const taskNums = JSON.stringify([...lastRoundTaskNumbers]);
    try {
        localStorage.setItem(lsKey, taskNums);
    } catch(e) {}
    fetch(RAILWAY_URL + '/api/user-state/' + encodeURIComponent(email.replace('@kkszki.hu','')) + '/lastTasks', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value: taskNums })
    }).catch(() => {});

    tippIndex = selectedTasks.map(() => 0);

    logEvent('Tasks selected', {
        tasks: selectedTasks.map(t => ({ number: t.number, points: t.points }))
    });

    // Feladatok elérhetővé tétele a visszajelzés popup számára
    window._kandoSelectedTasks = selectedTasks;

    // History mentés
    saveTasksToHistory(selectedTasks.map(t => t.number));
}

// ─── EGYÉNI FELADATVÁLASZTÓ ───────────────────────────────────────────────────

async function loadCustomTaskHistory() {
    const email = (studentData.email || 'anon').replace('@kkszki.hu', '');
    const lsKey = 'kandoTaskHistory_' + email;
    try {
        const resp = await fetch(RAILWAY_URL + '/api/user-state/' + encodeURIComponent(email) + '/lastTasksHistory', { signal: AbortSignal.timeout(5000) });
        if (resp.ok) {
            const data = await resp.json();
            if (data.value) {
                const parsed = JSON.parse(data.value);
                if (Array.isArray(parsed)) customTaskHistory = parsed;
            }
        }
    } catch {
        try { customTaskHistory = JSON.parse(localStorage.getItem(lsKey) || '[]'); } catch {}
    }
}

function saveTasksToHistory(taskNumbers) {
    const email = (studentData.email || 'anon').replace('@kkszki.hu', '');
    const lsKey = 'kandoTaskHistory_' + email;
    customTaskHistory = [...customTaskHistory, taskNumbers].slice(-5);
    const value = JSON.stringify(customTaskHistory);
    try { localStorage.setItem(lsKey, value); } catch {}
    fetch(RAILWAY_URL + '/api/user-state/' + encodeURIComponent(email) + '/lastTasksHistory', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value })
    }).catch(() => {});
}

async function openCustomModal() {
    await loadCustomTaskHistory();
    renderCustomModal();
    document.getElementById('custom-modal').classList.remove('hidden');
}

function closeCustomModal() {
    document.getElementById('custom-modal').classList.add('hidden');
}

function renderCustomModal() {
    // Előzmények
    const allPastNums = new Set(customTaskHistory.flat());
    const histEl = document.getElementById('custom-history-badges');
    if (allPastNums.size === 0) {
        histEl.innerHTML = '<span style="color:#666;font-size:0.82rem;">Még nincs előzmény.</span>';
    } else {
        histEl.innerHTML = [...allPastNums].map(n => {
            const t = tasks.find(t => t.number === n);
            return t ? `<span class="custom-hist-badge">${t.cim}</span>` : '';
        }).join('');
    }
    renderCustomTaskList();
}

function renderCustomTaskList() {
    const filterType = document.querySelector('.custom-type-btn.active')?.dataset.type || 'all';
    const allPastNums = new Set(customTaskHistory.flat());
    const tasks8  = tasks.filter(t => t.points === 8);
    const tasks14 = tasks.filter(t => t.points === 14);
    const tasks18 = tasks.filter(t => t.points === 18 && t.modulNev);

    function matches(task) {
        if (filterType === 'all') return true;
        const types = (task.tipus || '').split(',').map(s => s.trim());
        if (filterType === 'if') return types.includes('if');
        if (filterType === 'ciklus') return types.some(t => t === 'for' || t === 'while');
        if (filterType === 'függvény') return types.includes('függvény');
        return true;
    }

    function renderGroup(list, title) {
        const filtered = list.filter(matches);
        if (!filtered.length) return '';
        return `<div class="custom-group-title">${title}</div>` +
            filtered.map(t => {
                const past = allPastNums.has(t.number);
                return `<label class="custom-task-item${past ? ' past' : ''}">
                    <input type="checkbox" class="custom-cb" value="${t.number}" data-points="${t.points}">
                    <span class="custom-task-name">${t.cim}</span>
                    <span class="custom-task-pts">${t.points}p</span>
                    ${past ? '<span class="custom-past-tag">✓ volt már</span>' : ''}
                </label>`;
            }).join('');
    }

    document.getElementById('custom-task-list').innerHTML =
        renderGroup(tasks8,  '8 pontos feladatok') +
        renderGroup(tasks14, '14 pontos feladatok') +
        renderGroup(tasks18, '18 pontos feladatok');

    document.querySelectorAll('.custom-cb').forEach(cb =>
        cb.addEventListener('change', updateCustomCount));
    updateCustomCount();
}

function updateCustomCount() {
    const comp = document.getElementById('custom-composition').value;
    const parts = comp.split('+').map(Number);
    const [need8, need14, need18 = 0] = parts;
    const checked = [...document.querySelectorAll('.custom-cb:checked')];
    const sel8  = checked.filter(c => c.dataset.points === '8').length;
    const sel14 = checked.filter(c => c.dataset.points === '14').length;
    const sel18 = checked.filter(c => c.dataset.points === '18').length;
    const ok = sel8 === need8 && sel14 === need14 && sel18 === need18;
    const el = document.getElementById('custom-count-label');
    if (need18 > 0) {
        el.textContent = `Kiválasztva: ${sel18} db 18p — kell: ${need18} db 18p`;
    } else {
        el.textContent = `Kiválasztva: ${sel8} db 8p, ${sel14} db 14p — kell: ${need8} db 8p, ${need14} db 14p`;
    }
    el.style.color = ok ? '#4ade80' : '#fbbf24';
    document.getElementById('btn-custom-start').disabled = !ok;
}

function customRandomFill() {
    const comp = document.getElementById('custom-composition').value;
    const [need8, need14] = comp.split('+').map(Number);
    const allPastNums = new Set(customTaskHistory.flat());
    document.querySelectorAll('.custom-cb').forEach(cb => cb.checked = false);

    function pickRandom(cbs, n) {
        if (n === 0) return;
        const arr = [...cbs];
        const fresh = arr.filter(c => !allPastNums.has(parseInt(c.value)));
        const pool = fresh.length >= n ? fresh : arr;
        pool.sort(() => 0.5 - Math.random()).slice(0, n).forEach(c => c.checked = true);
    }

    const parts2 = comp.split('+').map(Number);
    const [, , need18 = 0] = parts2;
    pickRandom([...document.querySelectorAll('.custom-cb[data-points="8"]')],  need8);
    pickRandom([...document.querySelectorAll('.custom-cb[data-points="14"]')], need14);
    pickRandom([...document.querySelectorAll('.custom-cb[data-points="18"]')], need18);
    updateCustomCount();
}

function startCustomTest() {
    const checked = [...document.querySelectorAll('.custom-cb:checked')];
    const nums = checked.map(c => parseInt(c.value));
    selectedTasks = nums.map(n => tasks.find(t => t.number === n)).filter(Boolean)
        .sort(() => 0.5 - Math.random());

    tippIndex = selectedTasks.map(() => 0);
    window._kandoSelectedTasks = selectedTasks;

    lastRoundTaskNumbers = new Set(nums);
    saveTasksToHistory(nums);
    const taskNums = JSON.stringify([...lastRoundTaskNumbers]);
    const email = (studentData.email || 'anon').replace('@kkszki.hu', '');
    try { localStorage.setItem('kandoLastTasks_' + email, taskNums); } catch {}
    fetch(RAILWAY_URL + '/api/user-state/' + encodeURIComponent(email) + '/lastTasks', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value: taskNums })
    }).catch(() => {});

    closeCustomModal();
    startTest();
}

// ─── PONTOZÓ MOTOR ────────────────────────────────────────────────────────────

// Kritériumok beolvasása szöveges sorokból
function parseCriteria(lines) {
    return lines.map(line => {
        const parts = line.split('|');
        if (parts.length < 2) return null;
        const spec  = parts[0]; // NE trim-elj – megőrzi a záró szóközt (pl. bekeres args)
        const label = parts[1].trim();
        const hint     = parts[2] ? parts[2].trim() : null;
        const reaction = parts[3] ? parts[3].trim() : null;
        const colonIdx = spec.indexOf(':');
        if (colonIdx === -1) {
            return { type: spec.trim(), args: null, label, hint, reaction };
        }
        const type = spec.substring(0, colonIdx).trim();
        const args = spec.substring(colonIdx + 1); // args-ot NEM trim-eljük
        return { type, args, label, hint, reaction };
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

        // Segédfájl (modul) befecskendezése a virtuális fájlrendszerbe
        const activeTask = selectedTasks[currentTaskIndex];
        if (activeTask && activeTask.modulNev && activeTask.modulTartalom) {
            pyodide.FS.writeFile('/home/pyodide/' + activeTask.modulNev, activeTask.modulTartalom, { encoding: 'utf8' });
        }

        // Előző futtatás globális névterének törlése
        pyodide.runPython(`
_kando_keep = {'__name__', '__doc__', '__package__', '__loader__', '__spec__', '__builtins__', 'sys', 'builtins', 'js', '_kando_keep'}
for _k in list(globals().keys()):
    if _k not in _kando_keep:
        try: del globals()[_k]
        except: pass
del _kando_keep
`);

        pyodide.runPython(`
import sys
from io import StringIO
import builtins

if '/home/pyodide' not in sys.path:
    sys.path.insert(0, '/home/pyodide')

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

        let stdout = pyodide.runPython('sys.stdout.getvalue()');

        // Fájlba írt .txt fájlok tartalmának befűzése az outputba (teszt kritériumok is ellenőrizni tudják)
        try {
            const entries = pyodide.FS.readdir('/home/pyodide/');
            for (const f of entries) {
                if (f.endsWith('.txt') && f !== 'meres.txt' && f !== '.' && f !== '..') {
                    const fc = pyodide.FS.readFile('/home/pyodide/' + f, { encoding: 'utf8' });
                    stdout += '\n[' + f + ']\n' + fc;
                }
            }
        } catch(e) {}

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
    if (!code) return; // Üres kódon ne fusson
    // Ha a teszt kritériumok már ki lettek értékelve (checkScoring lefutott), ne írjuk felül
    const savedResults = taskAnswers[currentTaskIndex] && taskAnswers[currentTaskIndex].scoringResults;
    if (savedResults) {
        const hasRunTest = savedResults.some(r => {
            const c = task.criteria.find(cr => cr.label === r.label);
            return c && c.type === 'teszt' && r.passed !== null;
        });
        if (hasRunTest) return;
    }
    const panel = document.getElementById('scoring-panel');
    if (panel) panel.classList.remove('hidden');
    const results = task.criteria.map(criterion => {
        if (criterion.type === 'teszt') {
            return { criterion, passed: false, needsRun: true };
        }
        return { criterion, passed: evaluateCriterion(code, criterion) };
    });
    updateScoringUI(results);
}

// Pontozás ellenőrzése az aktuális feladatnál
let scoringRunning = false;
let autoCheckTimeout = null;

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
    const earned = Math.min(results.filter(r => r.passed === true).length, task.points || results.length);
    const total  = results.length;
    if (earned > 0) maybePostPythonProgress(task, earned, total);
}

// ── Progress tracking (Python) ────────────────────────────────────────────
const _pythonProgressPosted = new Set();

function maybePostPythonProgress(task, earned, total) {
    // Portálos bejelentkezés preferált, de ha nincs, a tesztkezdő adatokat használjuk
    let email = '', nev = '', osztaly = '';
    const kandoRaw = sessionStorage.getItem('kandoUser');
    if (kandoRaw) {
        try {
            const u = JSON.parse(kandoRaw);
            email   = u.email   || '';
            nev     = u.nev     || '';
            osztaly = u.osztaly ? `${u.evfolyam || ''}.${u.osztaly}` : '';
        } catch { return; }
    } else {
        // Fallback: a teszt indulásakor megadott adatok
        email   = studentData.email || '';
        nev     = studentData.name  || '';
        osztaly = studentData.class || '';
    }
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
            nev,
            osztaly,
            targy: 'python',
            feladat: taskId,
            pont: earned,
            maxPont: total
        }),
        signal: AbortSignal.timeout(8000)
    }).catch(() => {});
}

// Pontozási eredmények megjelenítése – lámpa stílus
function updateScoringUI(results) {
    const content = document.getElementById('scoring-content');
    const task = selectedTasks[currentTaskIndex];
    const total = results.length;
    const maxPts = task ? task.points : total;
    const earned = Math.min(results.filter(r => r.passed === true).length, maxPts);

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

    if (!results.some(r => r.pending) && currentTaskIndex >= 0 && taskAnswers[currentTaskIndex]) {
        const hasNeedsRun = results.some(r => r.needsRun);
        // Újonnan megszerzett kritériumok reakciói
        const prevPassed = new Set(
            (taskAnswers[currentTaskIndex].scoringResults || [])
                .filter(r => r.passed === true).map(r => r.label)
        );
        if (testMode === 'practice') {
            const newlyPassed = results.filter(r => r.passed === true && !prevPassed.has(r.criterion.label) && r.criterion.reaction);
            newlyPassed.forEach((r, i) => {
                setTimeout(() => showReactionToast(r.criterion.reaction), i * 1600);
            });
        }
        // Mindig mentjük az eredményeket (prevPassed nyomon követéséhez gépelés közben is)
        // needsRun esetén null = még nem futtatott teszt kritérium
        taskAnswers[currentTaskIndex].scoringResults = results.map(r => ({
            label: r.criterion.label,
            passed: r.needsRun ? null : r.passed
        }));
        // Pontszámot és globális score-t csak teljesen kiértékelt esetben frissítjük
        if (!hasNeedsRun) {
            taskAnswers[currentTaskIndex].earnedPoints = earned;
            updateLiveScore();
        }
    }
}

function openW3Schools() {
    suppressNextBlur = true;
    window.open('https://www.w3schools.com/python/', 'w3schools', 'width=1100,height=750,resizable=yes,scrollbars=yes');
}

function showReactionToast(text) {
    const el = document.createElement('div');
    // Pontozó panel jobb széléhez igazítva, felette jelenik meg
    const scoring = document.getElementById('scoring-panel');
    let posStyle;
    if (scoring) {
        const rect = scoring.getBoundingClientRect();
        const toastW = 270;
        const left = Math.max(8, rect.right - toastW - 12);
        const bottom = window.innerHeight - rect.top + 10;
        posStyle = `position:fixed;left:${left}px;bottom:${bottom}px;`;
    } else {
        posStyle = `position:fixed;bottom:5rem;right:1.5rem;`;
    }
    el.style.cssText = `
        ${posStyle}z-index:9999;
        background:linear-gradient(135deg,#064e3b,#065f46);
        border:1px solid #10b981;border-radius:12px;
        padding:0.7rem 1.1rem;width:270px;
        color:#d1fae5;font-size:0.9rem;font-weight:600;
        box-shadow:0 4px 20px rgba(16,185,129,0.35);
        animation:reactionPop 0.3s cubic-bezier(.175,.885,.32,1.275);`;
    el.textContent = text;
    document.body.appendChild(el);

    if (!document.getElementById('reaction-keyframes')) {
        const s = document.createElement('style');
        s.id = 'reaction-keyframes';
        s.textContent = `@keyframes reactionPop{from{opacity:0;transform:scale(0.7) translateY(10px)}to{opacity:1;transform:scale(1) translateY(0)}}`;
        document.head.appendChild(s);
    }

    setTimeout(() => {
        el.style.transition = 'opacity 0.4s';
        el.style.opacity = '0';
        setTimeout(() => el.remove(), 400);
    }, 3000);
}

// ──────────────────��──────────────────────────────────────────────────────────

// Code Editor inicializálása (Monaco, textarea fallback ha nem tölt be)
async function initializeCodeEditor() {
    // Régi editor felszabadítása újraindításkor
    if (codeEditor && typeof codeEditor.dispose === 'function') {
        codeEditor.dispose();
        codeEditor = null;
    }
    const containerPre = document.getElementById('code-editor');
    if (containerPre) containerPre.innerHTML = '';

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
    // Régi terminál felszabadítása újraindításkor
    if (term) {
        if (typeof term.dispose === 'function') term.dispose();
        term = null;
        terminalReady = false;
    }
    const terminalElementPre = document.getElementById('terminal');
    if (terminalElementPre) terminalElementPre.innerHTML = '';

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
    if (autoCheckTimeout !== null) {
        clearTimeout(autoCheckTimeout);
        autoCheckTimeout = null;
    }
    const scoringPanel = document.getElementById('scoring-panel');
    document.getElementById('scoring-content').innerHTML = '';
    if (task.criteria && task.criteria.length > 0) {
        scoringPanel.classList.remove('hidden');
        const savedResults = answer.scoringResults;
        if (savedResults && savedResults.length > 0) {
            // Mentett eredmények visszaállítása: criterion objektumot a task.criteria-ból vesszük
            const restored = task.criteria.map((criterion, i) => {
                const saved = savedResults.find(r => r.label === criterion.label) || savedResults[i];
                if (!saved) return { criterion, passed: false, needsRun: true };
                if (saved.passed === null) return { criterion, passed: false, needsRun: true };
                return { criterion, passed: saved.passed };
            });
            updateScoringUI(restored);
        } else {
            autoCheckTimeout = setTimeout(() => { autoCheckTimeout = null; autoCheckStructural(); }, 300);
        }
    } else {
        scoringPanel.classList.add('hidden');
    }

    // Feladat szám mentése a tanári adatokhoz
    debugLog(`📝 Feladat betöltve: ${task.number}. feladat`);

    if (terminalReady && term) {
        term.clear();
    }

    codeEditor.setValue(answer.answer || '');

    // Tipp gomb frissítése az aktuális feladat tipp-készlete alapján
    const hintBtn = document.getElementById('btn-hint');
    if (hintBtn) {
        const passedNow = new Set(
            (taskAnswers[index]?.scoringResults || []).filter(r => r.passed === true).map(r => r.label)
        );
        const availableHints = (task.criteria || []).filter(c => c.hint && !passedNow.has(c.label));
        const seen = tippIndex[index] || 0;
        const remaining = Math.max(0, availableHints.length - seen);
        hintBtn.textContent = remaining > 0 ? `💡 Tipp (${remaining} maradt)` : '💡 Nincs több tipp';
    }

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

        // Segédfájl (modul) befecskendezése a virtuális fájlrendszerbe
        const activeTask18 = selectedTasks[currentTaskIndex];
        if (activeTask18 && activeTask18.modulNev && activeTask18.modulTartalom) {
            pyodide.FS.writeFile('/home/pyodide/' + activeTask18.modulNev, activeTask18.modulTartalom, { encoding: 'utf8' });
        }

        // Előző futtatás globális névterének törlése
        pyodide.runPython(`
_kando_keep = {'__name__', '__doc__', '__package__', '__loader__', '__spec__', '__builtins__', 'sys', 'builtins', 'js', '_kando_keep'}
for _k in list(globals().keys()):
    if _k not in _kando_keep:
        try: del globals()[_k]
        except: pass
del _kando_keep
`);

        pyodide.runPython(`
import sys
from io import StringIO
import builtins

if '/home/pyodide' not in sys.path:
    sys.path.insert(0, '/home/pyodide')

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

        // Fájlba írt .txt fájlok megjelenítése a terminálban
        try {
            const entries = pyodide.FS.readdir('/home/pyodide/');
            for (const f of entries) {
                if (f.endsWith('.txt') && f !== 'meres.txt' && f !== '.' && f !== '..') {
                    const fc = pyodide.FS.readFile('/home/pyodide/' + f, { encoding: 'utf8' });
                    term.writeln('\r\n\x1b[36m📄 ' + f + ' tartalma:\x1b[0m');
                    term.writeln('\x1b[90m' + '─'.repeat(30) + '\x1b[0m');
                    term.writeln(fc.trim());
                }
            }
        } catch(e) {}

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
                // Megkeressük a matching ')' -t
                let depth = 1;
                let j = k + 1;
                while (j < code.length && depth > 0) {
                    if (code[j] === '(') depth++;
                    else if (code[j] === ')') depth--;
                    j++;
                }
                // Megnézzük van-e metódus lánc utána (pl. .lower())
                const afterParen = code[j] === '.' || code[j] === '[';
                if (afterParen) {
                    out += '(await input' + code.slice(i + 5, j) + ')';
                } else {
                    out += 'await input' + code.slice(i + 5, j);
                }
                i = j;
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

    // Beadás előtt: automatikusan lepontozza azokat a feladatokat,
    // ahol van kód de még nem futott le a checkScoring (pl. tanuló nem kattintott "Kód futtatása"-ra)
    await autoScoreUnscoredTasks();

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
// (Az index.html felülírja ezt: plusz idő kérés modal jelenik meg)
function autoSubmitTest() {
    const modal = document.getElementById('plusido-modal');
    if (modal) {
        modal.style.display = 'flex';
        const input = document.getElementById('plusido-input');
        if (input) { input.value = 15; input.focus(); input.select(); }
    } else {
        alert('Az idő lejárt! A teszt automatikusan beküldésre került.');
        submitTest();
    }
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

    if (suppressNextBlur) {
        suppressNextBlur = false;
        return;
    }

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
    if (focusCheckInterval) { clearInterval(focusCheckInterval); focusCheckInterval = null; }
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
            if (Date.now() < fullscreenGraceUntil) return;
            if (!fullscreenEnforced) return;
            // Ha a handleFullscreenChange már elindított egy 3 mp-es grace timert,
            // ne indítsuk el újra a figyelmeztetést – az interval csak backup
            if (fsCheatDelayTimer !== null) return;
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
    const frissBox = document.getElementById('friss-feladatok-box');
    if (frissBox) frissBox.style.display = isLive ? 'none' : 'block';

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

    // Egyéni összeállítás gomb: csak gyakorló módban, nem oktatónak
    const customBtn = document.getElementById('btn-open-custom-modal');
    if (customBtn) {
        customBtn.style.display = (!isTeacher && testMode === 'practice') ? 'block' : 'none';
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
    } else if (selectedTaskType === 'csak18') {
        titleEl.textContent = '1 db 18 pontos feladat:';
        rowsEl.innerHTML = `
            <div class="task-row">
                <span class="task-badge pt18">18 pont × 1</span>
                <span class="task-row-desc">OOP + fájlkezelés</span>
                <span class="task-row-time">~35 perc</span>
            </div>`;
        totalEl.innerHTML = 'Összesen: <strong style="color:#e0e0e0;">18 pont</strong> &nbsp;|&nbsp; ~35 perc';
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
    cheatPenalty = false;
    cheatReason = '';
    cheatWarningCount = 0;
    lastCheatWarningTime = 0;
    suspiciousJumps = 0;
    lastCodeLengths = [];
    solutionViewedTasks = [];
    pythonCodeRunning = false;
    scoringRunning = false;
    terminalInputResolver = null;
    terminalInputBuffer = '';
    if (currentInputDisposable) { currentInputDisposable.dispose(); currentInputDisposable = null; }
    _pythonProgressPosted.clear();

    // Intervalok leállítása
    if (focusCheckInterval) { clearInterval(focusCheckInterval); focusCheckInterval = null; }
    if (fullscreenCheckInterval) { clearInterval(fullscreenCheckInterval); fullscreenCheckInterval = null; }
    if (focusLossTimeout) { clearTimeout(focusLossTimeout); focusLossTimeout = null; }
    if (fsCountdownTimer) { clearInterval(fsCountdownTimer); fsCountdownTimer = null; }
    if (fsCheatDelayTimer) { clearTimeout(fsCheatDelayTimer); fsCheatDelayTimer = null; }

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

    // Kritériumokból vett tippek (csak amelyiknek van tipp és még nincs megszerzett)
    const passedLabels = new Set(
        (taskAnswers[currentTaskIndex]?.scoringResults || [])
            .filter(r => r.passed).map(r => r.label)
    );
    const hintCriteria = (task.criteria || []).filter(c => c.hint && !passedLabels.has(c.label));

    // Fallback: régi task.hints tömb (pl. ha nincs kritérium-tipp)
    const legacyHints = task.hints && task.hints.length > 0 ? task.hints : (megoldasok[String(task.number)]?.hints || []);

    if (hintCriteria.length === 0 && legacyHints.length === 0) {
        showHintToast('ℹ️ Ehhez a feladathoz nincs tipp.', 0);
        return;
    }

    if (!tippIndex[currentTaskIndex]) tippIndex[currentTaskIndex] = 0;
    const idx = tippIndex[currentTaskIndex];

    if (hintCriteria.length > 0) {
        if (idx >= hintCriteria.length) {
            showHintToast('Már az összes tippet láttad! Próbáld meg magadtól! 💪', 0);
            return;
        }
        const crit = hintCriteria[idx];
        const num = idx + 1;
        showHintToast(crit.hint, Math.min(idx, 2), `💡 ${num}. tipp`);
        tippIndex[currentTaskIndex] = idx + 1;

        const btn = document.getElementById('btn-hint');
        if (btn) {
            const remaining = hintCriteria.length - tippIndex[currentTaskIndex];
            btn.textContent = remaining > 0 ? `💡 Tipp (${remaining} maradt)` : '💡 Nincs több tipp';
        }
    } else {
        // legacy fallback
        if (idx >= legacyHints.length) {
            showHintToast('Már az összes tippet láttad! 😊', 0);
            return;
        }
        showHintToast(legacyHints[idx], Math.min(idx, 2), `💡 ${idx + 1}. tipp`);
        tippIndex[currentTaskIndex] = idx + 1;
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
