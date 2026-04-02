# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Online exam system for vocational IT students. Three separate exams:
- **Python dolgozat** (`python/`) — Python coding exam with browser-based execution
- **WEB dolgozat** (`web/`) — HTML/CSS webpage-coding exam with automated scoring
- **C# dolgozat** (`cs/`) — C# exam (placeholder)

Live at: https://sandornefr.github.io/doga/

## Architecture

### Portal / Login / Review
- `login.html` — Bejelentkezés/regisztráció (tanuló @kkszki.hu email, tanár)
- `portal.html` — Főmenü belépés után: Python/Web/C# exam kártyák, tananyag linkek, fiók kezelés
- `review.html` — Eredmények/statisztikák
- `special-roles.js` — Hibabejelentő modal + Ctrl+V kép paste listener

**Szerepkörök:** `tanulo`, `oktato`, `vendeg`, `_tesztMod:true` (Teszt Elek, tanár diákként)

### Python Exam (`python/`)
- `index.html` — Student interface. Requires fullscreen; cheating (DevTools, tab switch, focus loss) auto-submits.
- `admin.html` — Teacher panel: view submissions, AI grading (Gemini), statistics, mode switching (practice/live).
- `feladatok.txt` — **Single source of truth** for all 31 tasks with scoring criteria. Edit here only.
- `python_teszt.obfuscated.js` — Obfuscated production JS (original at `C:\Users\feker\Desktop\Rékának\python_teszt.js`).
- `basics.html` — Kezdő szint gyakorló (20 feladat)
- `practice.html` — Haladó szint gyakorló (20 feladat)
- `pro.html` — Profi szint gyakorló (19 feladat)
- `agazati-gyakorlo.html` — Gyakorló feladatok vendégeknek is, 3 nehézségi szint (Pyodide futtatja)

**Task selection:** 2 random 8-point tasks + 1 random 14-point task (45 min total). Cross-device deduplication via Railway backend `/api/user-state/{email}/lastTasks`.

**Task selection:** 2 random 8-point tasks + 1 random 14-point task (45 min total). 31 tasks total (11 könnyű, 12 közepes, 8 nehéz — `Nehezseg:` mező alapján).

**Hint rendszer (mindhárom gyakorló fájlban):**
- Level 0: "Segítség" gomb → tananyag flash panel
- Level 1: "Vázlat" gomb → `task.hint` / `task.hintCode` betöltése (`___` blanks)
- Level 2: "Megoldás" gomb → teljes megoldás

**Scoring criteria syntax in feladatok.txt:**
```
bekeres:N|leírás|tipp     # N input() calls required
int_float:N|leírás|tipp   # type conversion check
import:modul|leírás|tipp  # module import presence
if|leírás                 # keyword presence
elif|leírás
tartalmaz:szöveg|leírás|tipp  # code contains text
teszt:in1,in2:expected|leírás|tipp  # run with mock inputs (Pyodide)
def|leírás
return|leírás
while|leírás
for|leírás
```

**Backend (Railway):** ASP.NET Core Minimal API + SQLite at `backend/`. URL: `http://192.168.0.250`. Endpoints: `/api/auth/login`, `/api/submit`, `/api/submissions`, `/api/config`, `/api/stats`, `/api/user-state/{email}/{key}`.

### Web Exam (`web/`)
- `index.html` — Student interface (Monaco Editor, HTML+CSS fülek, élő előnézet, 60 perc)
- `practice.html` — Gyakorló mód (vendégeknek is elérhető)
- `app.js` — All scoring logic + task definitions (5303 sor)
- `forrasok/{taskname}/` — Each task's HTML starter file, CSS, images, source texts

**WEB Tananyag (learn-*.html fájlok):**
- `learn-html.html` — 1. szint: HTML Alapok
- `learn-css.html` — 2. szint: CSS Stílusok
- `learn-bootstrap.html` — 3. szint: Bootstrap + JavaScript
- `learn-emmet.html` — 4. szint: Emmet gyorsírás (**FEJLESZTÉS ALATT**, ~95% kész, untracked!)

**Tananyag láncolat:** HTML → CSS → Bootstrap → Emmet → HTML gyakorló

**⚠️ Emmet oldal hiányos integrációi (2026-03-30 állapot):**
- `learn-emmet.html` nincs committolva (git untracked)
- `portal.html` nem tartalmaz linket a `learn-emmet.html`-re (csak HTML/CSS/Bootstrap gomb van)
- `learn-bootstrap.html` befejező modalja azt mondja "Elvégezted az összes szintet" — holott az Emmet még következik
- `learn-bootstrap.html` `goNext()` függvénye nem navigál a `learn-emmet.html`-re az utolsó feladat után

**Scoring structure in `app.js`:**
```js
const webTasks = {
  taskname: {
    id, name, description, basePath, htmlFile, cssFile,
    taskDescFile, previewBase, sampleImage, sourceFiles,
    maxPoints: 40,
    checks: [ { id, label, check: (doc, html, css) => bool, cssCheck?: true }, ... ]
  }
}
```
Each task has exactly **40 checks** (1 point each). CSS-only checks have `cssCheck: true`.

**Helper functions for checks:**
- `_ch.langHu(html)` — verifies `lang="hu"` on html element
- `_ch.inHead(html, regex)` — checks regex match within `<head>`

**Reference tasks** (correct, do not modify): `bogyo_gyumolcsok`, `humanoid_robotok`.

**Wrong tasks** (fixed 2025-03): `baglyok`, `egijelensegek`, `evmadarai`, `gombak`, `hobbiallatok`, `hullok`, `tropusi_gyumolcsok` — now all have 40 checks matching the official Excel scoring sheet.

## Key External Services
- **Google Apps Script** — backend for Python exam submissions (Sheets DB). URL in memory.
- **EmailJS** — sends submission email on student submit (live mode only).
- **Pyodide** — runs Python code in-browser. `input()` calls are async-wrapped to show modal.
- **Railway** — C# backend deployment (ASP.NET Core). Config in `backend/railway.toml`.

## Development Notes
- No build step — plain HTML/JS/CSS, served via GitHub Pages.
- To test locally: open `python/index.html` or `web/index.html` directly in browser, or serve with any static server.
- The obfuscated JS (`python_teszt.obfuscated.js`) is regenerated from the original (`Rékának/python_teszt.js`) separately — do not edit the obfuscated file directly.
- `feladatok.txt` is loaded at runtime via fetch; changes take effect immediately on next page load.
