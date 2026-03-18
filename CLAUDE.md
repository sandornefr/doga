# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Online exam system for vocational IT students. Three separate exams:
- **Python dolgozat** (`python/`) — Python coding exam with browser-based execution
- **WEB dolgozat** (`web/`) — HTML/CSS webpage-coding exam with automated scoring
- **C# dolgozat** (`cs/`) — C# exam (placeholder)

Live at: https://sandornefr.github.io/doga/

## Architecture

### Python Exam (`python/`)
- `index.html` — Student interface. Requires fullscreen; cheating (DevTools, tab switch, focus loss) auto-submits.
- `admin.html` — Teacher panel: view submissions, AI grading (Gemini), statistics, mode switching (practice/live).
- `feladatok.txt` — **Single source of truth** for all 16 tasks with scoring criteria. Edit here only.
- `python_teszt.obfuscated.js` — Obfuscated production JS (original at `C:\Users\feker\Desktop\Rékának\python_teszt.js`).

**Task selection:** 2 random 8-point tasks + 1 random 14-point task (45 min total). Cross-device deduplication via Railway backend `/api/user-state/{email}/lastTasks`.

**Scoring criteria syntax in feladatok.txt:**
```
input:N|description       # N input() calls required
int_float:N|description   # type conversion check
if|description            # keyword presence
elif|description
tartalmaz:szöveg|desc     # code contains text
teszt:in1,in2:expected|desc  # run with mock inputs (Pyodide)
def|description
return|description
while|description
for|description
```

**Backend (Railway):** ASP.NET Core Minimal API + SQLite at `backend/`. Endpoints: `/api/auth/login`, `/api/submit`, `/api/submissions`, `/api/config`, `/api/stats`, `/api/user-state/{email}/{key}`.

### Web Exam (`web/`)
- `index.html` — Student interface
- `app.js` — All scoring logic + task definitions
- `forrasok/{taskname}/` — Each task's HTML starter file, CSS, images, source texts

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
