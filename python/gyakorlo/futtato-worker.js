/* futtato-worker.js – a Gyakorló feladatok Python-futtatója, külön szálon (Web Worker).
 * Azért külön szálon, hogy egy végtelen ciklus ne fagyassza le az oldalt: az oldal pár másodperc után
 * leállítja ezt a szálat, és újat indít.
 * Üzenet be:  { id, kod, bemenetek: [[...], [...]] }   – minden bemenet-sorozattal lefuttatja a kódot
 * Üzenet ki:  { tipus: 'kesz' } betöltés után; { id, eredmenyek: [{ kimenet, hiba }] }
 */
importScripts('https://cdn.jsdelivr.net/pyodide/v0.27.3/full/pyodide.js');

const SEGED = `
import builtins, sys

class _TulSok(Exception):
    pass

def _futtat(kod, bemenetek):
    it = iter(list(bemenetek))
    ki = []
    hossz = [0]
    def _ir(s):
        ki.append(s)
        hossz[0] += len(s)
        if hossz[0] > 20000:
            raise _TulSok()
    def _input(prompt=''):
        try:
            v = next(it)
        except StopIteration:
            raise EOFError('A program több adatot kért (input), mint amennyi a próbában van.')
        _ir(str(prompt) + str(v) + '\\n')
        return str(v)
    class _Ki:
        def write(self, s):
            _ir(s)
            return len(s)
        def flush(self):
            pass
    regi_ki, regi_hiba, regi_input = sys.stdout, sys.stderr, builtins.input
    sys.stdout = _Ki(); sys.stderr = _Ki(); builtins.input = _input
    hiba = None
    try:
        exec(compile(kod, '<kód>', 'exec'), {'__name__': '__main__'})
    except _TulSok:
        hiba = 'Túl sok kiírás – lehet, hogy végtelen a ciklus?'
    except SyntaxError as e:
        hiba = f'Formai hiba a(z) {e.lineno}. sorban: {e.msg}'
    except BaseException as e:
        tb = e.__traceback__
        sor = None
        while tb is not None:
            if tb.tb_frame.f_code.co_filename == '<kód>':
                sor = tb.tb_lineno
            tb = tb.tb_next
        hely = f'a(z) {sor}. sorban' if sor else ''
        hiba = f'Hiba {hely}: {type(e).__name__}: {e}'.replace('  ', ' ')
    finally:
        sys.stdout, sys.stderr, builtins.input = regi_ki, regi_hiba, regi_input
    return [''.join(ki), hiba]
`;

let py = null;
const betoltes = (async () => {
    py = await loadPyodide({ indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.27.3/full/' });
    py.runPython(SEGED);
    postMessage({ tipus: 'kesz' });
})().catch(e => postMessage({ tipus: 'betoltesi-hiba', uzenet: String(e && e.message || e) }));

onmessage = async (ev) => {
    const { id, kod, bemenetek } = ev.data;
    await betoltes;
    const futtat = py.globals.get('_futtat');
    const eredmenyek = [];
    for (const be of bemenetek) {
        const pyBe = py.toPy(be);
        const r = futtat(kod, pyBe);
        const [kimenet, hiba] = r.toJs();
        r.destroy(); pyBe.destroy();
        eredmenyek.push({ kimenet, hiba });
    }
    futtat.destroy();
    postMessage({ id, eredmenyek });
};
