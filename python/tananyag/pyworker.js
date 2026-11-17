'use strict';
// Az egész Worker egy függvényben: webkiszolgálón a böngésző ezt a fájlt indítja Workerként,
// fájlként (file://) megnyitva viszont a böngésző nem enged külön fájlból Workert indítani – ilyenkor az oldal
// <script>-tel tölti be, és a pyrunner.js a függvény szövegéből Blob-Workert készít (TPyWorkerFo).
function TPyWorkerFo() {
// Python-futtató Worker a tananyag kódfeladataihoz (a DKT 1.1 futtatójára építve): egy Pyodide-példány,
// futásonként friss névtér, 64 KiB kimeneti korlát. A bekérés a régi gyakorlók szerint működik:
// a megadott bemenetekből olvas, a kérdés és a beírt érték is a kimenetbe kerül (a régi ellenőrzők erre épülnek);
// ha elfogynak a bemenetek, üres szöveget ad (mint a régi gyakorló).
let py, execute, busy = false;
const PYTHON_RUNNER = `
def _tk_make_runner():
    import builtins, contextlib, gc, io, json
    original_builtins = dict(vars(builtins))
    execute_code = exec
    catch_error = BaseException
    capture = io.StringIO
    class OutputLimit(BaseException):
        pass
    class BoundedOutput:
        encoding = 'utf-8'
        def __init__(self):
            self.buffer = capture()
            self.remaining = 65536
            self.exceeded = False
        def write(self, text):
            if self.exceeded:
                raise OutputLimit()
            chunk = text[:self.remaining + 1].encode('utf-8', errors='replace')
            if len(chunk) > self.remaining:
                self.buffer.write(chunk[:self.remaining].decode('utf-8', errors='ignore'))
                self.remaining = 0
                self.exceeded = True
                raise OutputLimit()
            self.buffer.write(text)
            self.remaining -= len(chunk)
            return len(text)
        def flush(self):
            pass
        def getvalue(self):
            return self.buffer.getvalue()
    def run(code, input_json):
        output = BoundedOutput()
        values = iter(json.loads(input_json))
        error = None
        recycle = False
        def ask(prompt=''):
            val = str(next(values, ''))
            output.write(str(prompt))
            output.write(val + '\\n')
            return val
        names = {'__name__': '__main__', '__builtins__': dict(original_builtins)}
        names['__builtins__']['input'] = ask
        builtins.input = ask
        try:
            with contextlib.redirect_stdout(output), contextlib.redirect_stderr(output):
                execute_code(compile(code, '<kod>', 'exec'), names, names)
        except OutputLimit:
            error = 'A kimenet elérte a 64 KiB-os határt. Ellenőrizd a kiírásokat és a ciklusokat!'
            recycle = True
        except MemoryError:
            error = 'A programnak túl sok memóriára volt szüksége. Csökkentsd az adatmennyiséget!'
            recycle = True
        except catch_error as exc:
            details = exc.args[0][:800] if exc.args and type(exc.args[0]) is str else ''
            error = type(exc).__name__[:100] + (': ' + details if details else '')
            if isinstance(exc, SyntaxError) and exc.lineno:
                error += ' (' + str(exc.lineno) + '. sor)'
            elif exc.__traceback__:
                tb = exc.__traceback__
                while tb.tb_next:
                    tb = tb.tb_next
                if tb.tb_frame.f_code.co_filename == '<kod>':
                    error += ' (' + str(tb.tb_lineno) + '. sor)'
        finally:
            builtins.__dict__.clear()
            builtins.__dict__.update(original_builtins)
            names.clear()
            gc.collect()
        if output.exceeded:
            error = 'A kimenet elérte a 64 KiB-os határt. Ellenőrizd a kiírásokat és a ciklusokat!'
            recycle = True
        return json.dumps({'output': output.getvalue(), 'error': error, 'recycle': recycle}, ensure_ascii=False)
    return run
_tk_make_runner()
`;
(async () => {
  try {
    importScripts('https://cdn.jsdelivr.net/pyodide/v0.27.3/full/pyodide.js');
    py = await loadPyodide({ indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.27.3/full/' });
    execute = py.runPython(PYTHON_RUNNER);
    postMessage({ type: 'ready' });
  } catch (e) { postMessage({ type: 'error', message: String(e) }); }
})();
onmessage = ({ data }) => {
  if (data.type === 'files') { // segédfájlok a munkakönyvtárba (pl. adatfájl egy fájlkezelős feladathoz)
    try { for (const [name, text] of Object.entries(data.files || {})) py.FS.writeFile(name, text, { encoding: 'utf8' }); } catch (e) { /* nem kritikus */ }
    return;
  }
  if (data.type !== 'run') return;
  if (!execute || busy) { postMessage({ type: 'error', message: 'A futtató még nem áll készen.' }); return; }
  busy = true;
  if (data.files) { try { for (const [name, text] of Object.entries(data.files)) py.FS.writeFile(name, text, { encoding: 'utf8' }); } catch (e) { /* nem kritikus */ } }
  try { const result = JSON.parse(execute(data.code, JSON.stringify(data.inputs || []))); postMessage({ type: 'done', id: data.id, ...result }); }
  catch (e) { postMessage({ type: 'error', message: String(e) }); }
  finally { busy = false; }
};
}
if (typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope) TPyWorkerFo();
