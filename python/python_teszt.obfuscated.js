// Python Teszt JavaScript - Google Sheets API kommunikációval
// Visszafejtett és helyreállított verzió

// Globális változók
let API_URL = 'https://script.google.com/macros/s/AKfycbw6c00BA-N3Lf3lWFg3Jm-uVJKrOKKmoRTI9vBUxk2xRdFBrNR_ztB9EoA_Uq2Kg-Ms/exec';
let testMode = 'practice';
let tasks = [];
let selectedTasks = [];
let currentTaskIndex = 0;
let globalTimeRemaining = 24 * 60; // 24 perc másodpercben
let taskTimeRemaining = 8 * 60;    // 8 perc másodpercben
let globalTimer = null;
let taskTimer = null;
let codeEditor = null;
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
let autosaveInterval = null;
let cheatDetected = false;
let cheatReason = '';
let fullscreenEnforced = false;
let fullscreenGraceUntil = 0;

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
    setupEventListeners();
    loadTasksFromFile();
    await loadTestMode();
    startFullscreenCheck();
}

// Teszt mód betöltése az API-ból
async function loadTestMode() {
    if (!API_URL) {
        debugLog('❌ API URL nincs beállítva');
        return;
    }

    try {
        debugLog('🔄 Teszt mód betöltése...');
        const response = await fetch(API_URL + '?action=getTestMode');
        const data = await response.json();

        if (data.success && data.testMode) {
            testMode = data.testMode;
            logEvent('Test mode loaded', { mode: testMode });
            debugLog('✅ Teszt mód betöltve: ' + (testMode === 'practice' ? '🎓 GYAKORLÓ' : '🔴 ÉLES'), { testMode: testMode });
            updateTestModeBadge();
        } else {
            debugLog('⚠️ Teszt mód nem érkezett, alapértelmezett: GYAKORLÓ');
            updateTestModeBadge();
        }
    } catch (error) {
        logEvent('Test mode load error', { error: error.message });
        debugLog('❌ Teszt mód betöltése SIKERTELEN, alapértelmezett: GYAKORLÓ');
    }
}

// Backend-re való beküldés
async function submitToBackend() {
    try {
        const testDuration = Math.round((testEndTime - testStartTime) / 1000);

        const payload = {
            student_name: studentData.name,
            student_email: studentData.email,
            student_class: studentData.class,
            test_duration: testDuration,
            selected_tasks: selectedTasks.map(task => task.number),
            answers: taskAnswers.map((answer, index) => ({
                task: answer.taskDescription.substring(0, 100),
                task_number: answer.taskNumber,
                answer: answer.answer || '',
                time_spent: getEffectiveTimeSpent(answer, index),
                skipped: answer.skipped
            }))
        };

        debugLog('📦 Adat előkészítve');

        const jsonData = JSON.stringify(payload);
        const encodedData = btoa(unescape(encodeURIComponent(jsonData)));

        debugLog('📦 Adat kódolva');

        const response = await fetch(API_URL + '?data=' + encodeURIComponent(encodedData));

        debugLog('📡 Backend válasz státusz: ' + response.status);

        const result = await response.json();

        if (result.success) {
            logEvent('Submission successful', { submission_id: result.submission_id });
            debugLog('✅ Sikeres beküldés! ID: ' + result.submission_id);
            return result;
        } else {
            throw new Error(result.message || 'Ismeretlen hiba');
        }
    } catch (error) {
        logEvent('Submission error', { error: error.message });
        debugLog('❌ Backend hiba');
        return null;
    }
}

// Automatikus mentés (kódfuttatás után)
async function autoSaveProgress() {
    try {
        // Aktuális válaszok frissítése
        if (currentTaskIndex >= 0 && currentTaskIndex < taskAnswers.length) {
            taskAnswers[currentTaskIndex].answer = codeEditor.getValue();
        }

        const payload = {
            student_name: studentData.name,
            student_email: studentData.email,
            student_class: studentData.class,
            test_duration: Math.round((Date.now() - testStartTime) / 1000),
            selected_tasks: selectedTasks.map(task => task.number),
            answers: taskAnswers.map((answer, index) => ({
                task: answer.taskDescription.substring(0, 100),
                task_number: answer.taskNumber,
                answer: answer.answer || '',
                time_spent: getEffectiveTimeSpent(answer, index),
                skipped: answer.skipped
            })),
            is_autosave: true, // Jelezzük hogy ez autosave
            autosave_time: new Date().toISOString()
        };

        const jsonData = JSON.stringify(payload);
        const encodedData = btoa(unescape(encodeURIComponent(jsonData)));

        const response = await fetch(API_URL + '?data=' + encodeURIComponent(encodedData));

        const result = await response.json();

        if (result.success) {
            debugLog('💾 Automatikus mentés sikeres');
        }
    } catch (error) {
        // Csendben elbukik, nem zavarjuk a diákot
        console.log('Autosave failed:', error);
    }
}

// Event listener-ek beállítása
function setupEventListeners() {
    document.getElementById('start-btn').addEventListener('click', startTest);
    document.getElementById('skip-btn').addEventListener('click', skipTask);
    document.getElementById('submit-btn').addEventListener('click', showSubmitModal);
    document.getElementById('confirm-submit').addEventListener('click', submitTest);
    document.getElementById('cancel-submit').addEventListener('click', hideSubmitModal);
    document.getElementById('run-code-btn').addEventListener('click', runPythonCode);

    // Jobb klikk letiltása
    document.addEventListener('contextmenu', e => {
        e.preventDefault();
        return false;
    });

    // DevTools billentyűk letiltása
    document.addEventListener('keydown', e => {
        if (e.key === 'F12' ||
            e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C') ||
            e.ctrlKey && e.key === 'U') {
            e.preventDefault();
            return false;
        }
    });

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
    let exampleLines = [];

    for (let line of lines) {
        const taskMatch = line.match(/^(\d+)\.\s*feladat/i);

        if (taskMatch) {
            if (currentTask) {
                currentTask.example = exampleLines.join('\n');
                tasks.push(currentTask);
            }

            currentTask = {
                number: parseInt(taskMatch[1]),
                description: '',
                example: '',
                points: 8  // alapértelmezett pontszám
            };
            inExample = false;
            exampleLines = [];
            continue;
        }

        // Pontszám jelölés: "Pont: 14" vagy "Pont: 8"
        const pointMatch = line.match(/^Pont:\s*(\d+)/i);
        if (pointMatch && currentTask) {
            currentTask.points = parseInt(pointMatch[1]);
            continue;
        }

        // Mind a ```python, mind a ``` jelölést támogatja
        if (line.trim() === '```python' || line.trim() === '```') {
            inExample = !inExample;
            continue;
        }

        if (line.match(/^Minta kód:/i)) {
            // Ez csak egy fejléc, ne tegyük hozzá sehova
            continue;
        }

        if (currentTask) {
            if (inExample) {
                exampleLines.push(line);
            } else if (line.trim() !== '') {
                if (currentTask.description !== '') {
                    currentTask.description += '\n';
                }
                currentTask.description += line;
            }
        }
    }

    if (currentTask) {
        currentTask.example = exampleLines.join('\n');
        tasks.push(currentTask);
    }

    const count8 = tasks.filter(t => t.points === 8).length;
    const count14 = tasks.filter(t => t.points === 14).length;
    debugLog(`✅ ${tasks.length} feladat betöltve (${count8} db 8 pontos, ${count14} db 14 pontos)`);
}

// Teszt indítása
function startTest() {
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const studentClass = document.getElementById('class').value.trim();

    if (!name || !email || !studentClass) {
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

    testStartTime = new Date();
    logEvent('Test started', studentData);

    selectRandomTasks();

    taskAnswers = selectedTasks.map(task => ({
        taskNumber: task.number,
        taskDescription: task.description,
        taskExample: task.example,
        allocatedTime: task.allocatedTime,
        answer: '',
        timeSpent: 0,
        startTime: null,
        endTime: null,
        skipped: false
    }));

    const totalTime = selectedTasks.reduce((sum, task) => sum + task.allocatedTime, 0);
    globalTimeRemaining = totalTime;

    fullscreenEnforced = false;
    fullscreenGraceUntil = 0;

    startSection.classList.add('hidden');
    quizSection.classList.remove('hidden');

    initializeCodeEditor();
    initTerminal();
    enterFullscreen();

    setTimeout(() => {
        currentTaskIndex = 0;
        startGlobalTimer();
        startAutoSaveInterval();
        showTask(currentTaskIndex);
        logEvent('Entered fullscreen and started timers');
    }, 100);
}

// Véletlenszerű feladatok kiválasztása (2 db 8 pontos + 1 db 14 pontos)
function selectRandomTasks() {
    const tasks8 = tasks.filter(t => t.points === 8);
    const tasks14 = tasks.filter(t => t.points === 14);

    const shuffled8 = [...tasks8].sort(() => 0.5 - Math.random());
    const shuffled14 = [...tasks14].sort(() => 0.5 - Math.random());

    const selected8 = shuffled8.slice(0, 2);
    const selected14 = shuffled14.slice(0, 1);

    // Véletlenszerű sorrendbe keverjük a kiválasztott feladatokat
    selectedTasks = [...selected8, ...selected14].sort(() => 0.5 - Math.random());

    selectedTasks.forEach(task => {
        task.allocatedTime = calculateTaskTime(task);
    });

    logEvent('Tasks selected', {
        tasks: selectedTasks.map(t => ({
            number: t.number,
            points: t.points,
            time: t.allocatedTime
        }))
    });
}

// Feladat idejének kiszámítása
function calculateTaskTime(task) {
    // 14 pontos feladatoknak fix 25 perc jár
    if (task.points === 14) {
        return 25 * 60;
    }

    // 8 pontos feladatoknál a leírás hossza alapján számítjuk
    const descLength = task.description.length;
    const exampleLength = task.example.length;
    const totalLength = descLength + exampleLength;

    let baseTime = 8 * 60; // 8 perc

    if (totalLength > 500) {
        baseTime = 15 * 60; // 15 perc
    } else if (totalLength > 300) {
        baseTime = 12 * 60; // 12 perc
    } else if (totalLength > 200) {
        baseTime = 10 * 60; // 10 perc
    }

    return baseTime;
}

// Code Editor inicializálása
function initializeCodeEditor() {
    const textarea = document.getElementById('code-editor');
    codeEditor = CodeMirror.fromTextArea(textarea, {
        mode: 'python',
        theme: 'monokai',
        lineNumbers: true,
        indentUnit: 4,
        indentWithTabs: false,
        lineWrapping: true,
        matchBrackets: true,
        autoCloseBrackets: true,
        specialChars: /[\t]/,
        specialCharPlaceholder: (ch) => {
            const span = document.createElement('span');
            span.textContent = ch === '\t' ? '→' : '?';
            span.className = 'cm-specialchar';
            return span;
        }
    });

    codeEditor.on('change', () => {
        if (currentTaskIndex >= 0 && currentTaskIndex < taskAnswers.length) {
            taskAnswers[currentTaskIndex].answer = codeEditor.getValue();
        }
    });
}

// Terminál inicializálása
function initTerminal() {
    term = new Terminal({
        cursorBlink: true,
        convertEol: true,
        fontSize: 14,
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

// Feladat megjelenítése
function showTask(index) {
    if (index < 0 || index >= selectedTasks.length) {
        return;
    }

    const task = selectedTasks[index];
    const answer = taskAnswers[index];

    const remaining = Math.max(0, task.allocatedTime - (answer.timeSpent || 0));
    if (!answer.startTime && remaining > 0) {
        answer.startTime = new Date();
    }
    taskTimeRemaining = remaining;
    updateTaskTimerDisplay(remaining, remaining <= 0);
    if (remaining > 0) {
        startTaskTimer();
    }

    document.getElementById('task-number').textContent = `${index + 1}. feladat (${task.points} pont)`;
    document.getElementById('task-description').textContent = task.description;
    document.getElementById('task-example').textContent = task.example;

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
        timerElement.textContent = `Össz-idő: ${minutes}:${seconds.toString().padStart(2, '0')}`;

        if (globalTimeRemaining <= 60) {
            timerElement.classList.add('warning');
        }

        if (globalTimeRemaining <= 0) {
            clearInterval(globalTimer);
            autoSubmitTest();
        }
    }, 1000);
}

// Feladat timer indítása
function startTaskTimer() {
    if (taskTimer) {
        clearInterval(taskTimer);
    }

    taskTimer = setInterval(() => {
        if (currentTaskIndex < 0 || currentTaskIndex >= taskAnswers.length) {
            return;
        }

        const answer = taskAnswers[currentTaskIndex];
        const task = selectedTasks[currentTaskIndex];
        if (!answer || !task) {
            return;
        }

        const elapsed = answer.startTime ? Math.round((Date.now() - answer.startTime.getTime()) / 1000) : 0;
        const remaining = Math.max(0, task.allocatedTime - (answer.timeSpent || 0) - elapsed);
        taskTimeRemaining = remaining;

        updateTaskTimerDisplay(remaining, remaining <= 0);

        if (remaining <= 0) {
            answer.timeSpent = task.allocatedTime;
            answer.startTime = null;
            clearInterval(taskTimer);
        }
    }, 1000);
}

function updateTaskTimerDisplay(remainingSeconds, expired) {
    const minutes = Math.floor(remainingSeconds / 60);
    const seconds = remainingSeconds % 60;
    const timerElement = document.getElementById('task-timer');
    const floatElement = document.getElementById('task-timer-float');

    if (expired) {
        timerElement.textContent = 'Feladat idő: 0:00 - Nincs több idő!';
        timerElement.classList.add('warning');
        if (floatElement) {
            floatElement.textContent = 'Feladat idő: 0:00 - Nincs több idő!';
            floatElement.classList.add('warning');
        }
        return;
    }

    timerElement.textContent = `Feladat idő: ${minutes}:${seconds.toString().padStart(2, '0')}`;
    if (remainingSeconds <= 30) {
        timerElement.classList.add('warning');
    } else {
        timerElement.classList.remove('warning');
    }

    if (floatElement) {
        floatElement.textContent = `Feladat idő: ${minutes}:${seconds.toString().padStart(2, '0')}`;
        if (remainingSeconds <= 30) {
            floatElement.classList.add('warning');
        } else {
            floatElement.classList.remove('warning');
        }
        floatElement.style.display = quizSection.classList.contains('hidden') ? 'none' : 'block';
    }
}

// Python kód futtatása
async function runPythonCode() {
    const code = codeEditor.getValue();

    if (!code || code.trim() === '') {
        term.writeln('⚠️ Nincs beírva semmilyen kód!');
        return;
    }

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

    try {
        const pyodide = await loadPyodide();

        // Python input függvény felülírása aszinkron JS függvénnyel
        globalThis.js_input = customPythonInput;
        pyodide.globals.set('js_input', customPythonInput);

        // Python kód futtatása
        pyodide.runPython(`
import sys
from io import StringIO
import builtins

sys.stdout = StringIO()
sys.stderr = StringIO()

# Input függvény ami a JavaScript-ből kéri az inputot
async def input(prompt=''):
    from js import js_input
    result = await js_input(prompt)
    return result

# Felülírjuk a beépített input függvényt
builtins.input = input
`);

        // Kód futtatása aszinkron módon
        const wrappedCode = wrapPythonCodeForAsyncInput(code);
        await pyodide.runPythonAsync(wrappedCode);

        // Kimenet kiolvasása
        const stdout = pyodide.runPython('sys.stdout.getvalue()');
        const stderr = pyodide.runPython('sys.stderr.getvalue()');
        const output = stdout || stderr;

        if (output) {
            term.writeln(output);
        } else {
            term.writeln('(Nincs kimenet)');
        }

        await sleep(400);
        term.writeln('\n✅  Kód sikeresen lefutott!');
        debugLog('✅ Kód futtatva');

        // Automatikus mentés a háttérben
        autoSaveProgress();

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
            } else if (data >= ' ' && data <= '~') {
                // Normál karakter
                inputBuffer += data;
                term.write(data);
            }
        };

        disposable = term.onData(inputHandler);
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
    if (taskTimer) {
        clearInterval(taskTimer);
    }
    if (autosaveInterval) {
        clearInterval(autosaveInterval);
        autosaveInterval = null;
    }

    testEndTime = new Date();

    logEvent('Test submitted', { endTime: testEndTime });

    if (cheatDetected) {
        logEvent('Cheating detected', { reason: cheatReason });
    }

    const result = await submitToBackend();

    quizSection.classList.add('hidden');
    endSection.classList.remove('hidden');
    const floatElement = document.getElementById('task-timer-float');
    if (floatElement) {
        floatElement.style.display = 'none';
    }

    const totalMinutes = Math.floor((testEndTime - testStartTime) / 60000);
    const totalSeconds = Math.floor(((testEndTime - testStartTime) % 60000) / 1000);

    document.getElementById('final-time').textContent =
        `Teljes idő: ${totalMinutes} perc ${totalSeconds} másodperc`;

    const endTitle = document.getElementById('end-title');
    const endMessage = document.getElementById('end-message');

    if (cheatDetected) {
        endTitle.textContent = '⚠️ Csalás észlelve!';
        endMessage.textContent = 'Csalást észleltünk, ezért az eddigi munkád kerül értékelésre. A csalás miatt a teszt eredménye: elégtelen.';
    } else if (testMode === 'practice') {
        endTitle.textContent = '✅ Teszt befejezve!';
        endMessage.textContent = 'Köszönjük a részvételt!';
    } else {
        endTitle.textContent = '✅ Teszt befejezve!';
        endMessage.textContent = 'Köszönjük, hogy kitöltötted a tesztet! A válaszaidat elküldtük a tanárnak.';
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

    downloadSubmissionTxt(result ? result.submission_id : '');

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

    if (testMode !== 'live') {
        fullscreenPrompt.style.display = 'none';
        return;
    }

    if (!isFullscreen && testActive) {
        fullscreenPrompt.style.display = 'flex';

        if (globalTimer) {
            clearInterval(globalTimer);
        }
        if (taskTimer) {
            clearInterval(taskTimer);
        }

        logEvent('Fullscreen exited - test paused');

        setTimeout(() => {
            if (!document.fullscreenElement && testActive) {
                handleCheating('Kiléptél a fullscreen módból');
            }
        }, 3000);
    } else {
        fullscreenPrompt.style.display = 'none';
        if (isFullscreen) {
            fullscreenEnforced = true;
        }
    }
}

// Láthatóság változás kezelése
function handleVisibilityChange() {
    if (testMode !== 'live') {
        return;
    }

    if (document.hidden && !quizSection.classList.contains('hidden')) {
        logEvent('Tab hidden - potential cheating');

        handleCheating('Másik fülre váltottál');
    }
}

// Ablak fókusz elvesztés kezelése
function handleWindowBlur() {
    if (testMode !== 'live') {
        return;
    }

    if (!quizSection.classList.contains('hidden')) {
        logEvent('Window lost focus');

        focusLossTimeout = setTimeout(() => {
            handleCheating('Elhagytad az ablakot');
        }, 2000);
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

// Fókusz ellenőrzés indítása
function startFocusCheck() {
    focusCheckInterval = setInterval(() => {
        if (!document.hasFocus() && !quizSection.classList.contains('hidden') && testMode === 'live') {
            logEvent('Focus check failed');
            handleCheating('Ablak fókusz elveszett');
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

            if (testMode === 'live' && !quizSection.classList.contains('hidden')) {
                handleCheating('Developer Tools észlelve');
            }
        }
    }, 1000);
}

function startFullscreenCheck() {
    if (fullscreenCheckInterval) {
        clearInterval(fullscreenCheckInterval);
    }

    fullscreenCheckInterval = setInterval(() => {
        if (testMode !== 'live' || quizSection.classList.contains('hidden')) {
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
            handleCheating('Kiléptél a fullscreen módból');
        }
    }, 1000);
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
    if (taskTimer) {
        clearInterval(taskTimer);
    }
    if (autosaveInterval) {
        clearInterval(autosaveInterval);
        autosaveInterval = null;
    }

    fullscreenPrompt.style.display = 'none';
    exitFullscreen();
    submitTest();
}

// Esemény naplózás
function logEvent(eventName, data = {}) {
    const event = {
        timestamp: new Date().toISOString(),
        event: eventName,
        ...data
    };

    eventLog.push(event);

    debugLog('📝 Event: ' + eventName);
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

    if (testMode === 'live') {
        badge.style.background = 'linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%)';
        badge.style.color = 'white';
        badge.style.border = '3px solid #c92a2a';
        text.textContent = '🔴 ÉLES TESZT MÓD - Az eredmények elküldésre kerülnek emailben!';
    } else {
        badge.style.background = 'linear-gradient(135deg, #51cf66 0%, #37b24d 100%)';
        badge.style.color = 'white';
        badge.style.border = '3px solid #2b8a3e';
        text.textContent = '🎓 GYAKORLÓ MÓD - Nincs email értesítés';
    }
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
        `Státusz: ${cheatDetected ? 'Csalás' : 'Rendben'}`,
        '',
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
    const safeName = (studentData.name || 'diak')
        .toLowerCase()
        .replace(/[^a-z0-9_-]+/g, '_')
        .replace(/^_+|_+$/g, '');
    const filename = `python_teszt_${safeName || 'diak'}_${now.toISOString().replace(/[:.]/g, '-')}.txt`;

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
    }, 30000);
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
