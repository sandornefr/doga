// Chat widget – tesztelők és oktatók számára
// Használat: <script src="chat-widget.js"></script> (az API és authHeaders globálisak kell legyenek)

(function () {
    const POLL_OPEN   = 5000;
    const POLL_CLOSED = 30000;

    let sinceId    = 0;
    let isOpen     = false;
    let pollTimer  = null;
    let myEmail    = '';
    let mySzerep   = '';

    // ── Stílus ────────────────────────────────────────────────────────────────
    const style = document.createElement('style');
    style.textContent = `
    #chat-fab {
        position:fixed; bottom:24px; right:24px; z-index:9000;
        width:52px; height:52px; border-radius:50%;
        background:linear-gradient(135deg,#4f46e5,#7c3aed);
        border:none; cursor:pointer; display:flex; align-items:center; justify-content:center;
        box-shadow:0 4px 18px rgba(79,70,229,.5); transition:transform .15s;
        color:#fff; font-size:1.2rem;
    }
    #chat-fab:hover { transform:scale(1.08); }
    #chat-badge {
        position:absolute; top:-4px; right:-4px;
        background:#ef4444; color:#fff; border-radius:50%;
        width:18px; height:18px; font-size:0.65rem; font-weight:700;
        display:none; align-items:center; justify-content:center;
    }
    #chat-panel {
        position:fixed; bottom:86px; right:24px; z-index:9000;
        width:340px; max-height:480px;
        background:#161b22; border:1px solid #30363d; border-radius:12px;
        display:none; flex-direction:column;
        box-shadow:0 8px 32px rgba(0,0,0,.5);
        font-family:'Segoe UI',system-ui,sans-serif; font-size:0.85rem;
    }
    #chat-panel.open { display:flex; }
    #chat-header {
        padding:12px 16px; border-bottom:1px solid #21262d;
        font-weight:700; color:#e0e0e0; font-size:0.9rem;
        display:flex; align-items:center; gap:8px;
    }
    #chat-header i { color:#7c3aed; }
    #chat-header span { flex:1; }
    #chat-close {
        background:none; border:none; color:#8b949e; cursor:pointer; font-size:1rem; padding:0;
    }
    #chat-close:hover { color:#e0e0e0; }
    #chat-messages {
        flex:1; overflow-y:auto; padding:12px; display:flex; flex-direction:column; gap:8px;
        scrollbar-width:thin; scrollbar-color:#30363d transparent;
    }
    #chat-messages::-webkit-scrollbar { width:4px; }
    #chat-messages::-webkit-scrollbar-thumb { background:#30363d; border-radius:2px; }
    .chat-msg { display:flex; flex-direction:column; gap:2px; }
    .chat-msg.mine { align-items:flex-end; }
    .chat-msg.theirs { align-items:flex-start; }
    .chat-bubble {
        max-width:240px; padding:7px 12px; border-radius:12px; line-height:1.4;
        word-break:break-word; white-space:pre-wrap;
    }
    .chat-msg.mine .chat-bubble {
        background:linear-gradient(135deg,#4f46e5,#7c3aed); color:#fff;
        border-bottom-right-radius:3px;
    }
    .chat-msg.theirs .chat-bubble {
        background:#21262d; color:#e0e0e0; border-bottom-left-radius:3px;
    }
    .chat-meta { font-size:0.68rem; color:#8b949e; padding:0 4px; }
    .chat-msg.mine .chat-meta { text-align:right; }
    .chat-empty { color:#8b949e; font-size:0.8rem; text-align:center; margin:auto; }
    #chat-input-row {
        padding:10px 12px; border-top:1px solid #21262d; display:flex; gap:8px;
    }
    #chat-input {
        flex:1; background:#0d1117; border:1px solid #30363d; border-radius:8px;
        color:#e0e0e0; padding:7px 10px; font-size:0.83rem; resize:none; height:36px;
        font-family:inherit; outline:none; transition:border-color .15s;
        scrollbar-width:thin; scrollbar-color:#30363d transparent;
    }
    #chat-input:focus { border-color:#4f46e5; }
    #chat-send {
        background:#4f46e5; border:none; color:#fff; border-radius:8px;
        padding:0 14px; cursor:pointer; font-size:0.85rem; transition:background .15s;
        display:flex; align-items:center;
    }
    #chat-send:hover { background:#4338ca; }
    #chat-send:disabled { background:#374151; cursor:default; }
    `;
    document.head.appendChild(style);

    // ── HTML ──────────────────────────────────────────────────────────────────
    const fab = document.createElement('button');
    fab.id = 'chat-fab';
    fab.title = 'Chat – tesztelők & oktató';
    fab.innerHTML = '<i class="fas fa-comments"></i><span id="chat-badge"></span>';

    const panel = document.createElement('div');
    panel.id = 'chat-panel';
    panel.innerHTML = `
        <div id="chat-header">
            <i class="fas fa-comments"></i>
            <span>Tesztelői chat</span>
            <button id="chat-close" title="Bezár"><i class="fas fa-times"></i></button>
        </div>
        <div id="chat-messages"><div class="chat-empty">Üzenetek betöltése...</div></div>
        <div id="chat-input-row">
            <textarea id="chat-input" placeholder="Írj üzenetet..." rows="1"></textarea>
            <button id="chat-send"><i class="fas fa-paper-plane"></i></button>
        </div>`;

    document.body.appendChild(fab);
    document.body.appendChild(panel);

    // ── Segédfüggvények ───────────────────────────────────────────────────────
    function fmtTime(dt) {
        const d = new Date(dt.replace(' ', 'T'));
        return d.toLocaleTimeString('hu-HU', { hour:'2-digit', minute:'2-digit' });
    }

    function fmtLabel(msg) {
        return msg.senderSzerep === 'oktato'
            ? `<i class="fas fa-chalkboard-teacher" style="font-size:.65rem;margin-right:3px;color:#a371f7"></i>${msg.senderNev || msg.senderEmail}`
            : `<i class="fas fa-flask" style="font-size:.65rem;margin-right:3px;color:#eab308"></i>${msg.senderNev || msg.senderEmail}`;
    }

    function renderMessages(msgs) {
        const el = document.getElementById('chat-messages');
        const wasAtBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 40;
        const existing = new Set([...el.querySelectorAll('[data-id]')].map(e => e.dataset.id));
        msgs.forEach(m => {
            if (existing.has(String(m.id))) return;
            const mine = m.senderEmail.toLowerCase() === myEmail.toLowerCase();
            const div = document.createElement('div');
            div.className = `chat-msg ${mine ? 'mine' : 'theirs'}`;
            div.dataset.id = m.id;
            div.innerHTML = `
                ${!mine ? `<div class="chat-meta">${fmtLabel(m)}</div>` : ''}
                <div class="chat-bubble">${escHtml(m.message)}</div>
                <div class="chat-meta">${fmtTime(m.createdAt)}</div>`;
            el.appendChild(div);
            if (m.id > sinceId) sinceId = m.id;
        });
        const empty = el.querySelector('.chat-empty');
        if (msgs.length > 0 && empty) empty.remove();
        if (msgs.length === 0 && el.children.length === 0) {
            el.innerHTML = '<div class="chat-empty">Még nincs üzenet – írj elsőként!</div>';
        }
        if (wasAtBottom || msgs.some(m => m.senderEmail.toLowerCase() === myEmail.toLowerCase()))
            el.scrollTop = el.scrollHeight;
    }

    function escHtml(t) {
        return t.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
    }

    function updateBadge(count) {
        const b = document.getElementById('chat-badge');
        if (!b) return;
        if (count > 0) { b.textContent = count > 9 ? '9+' : count; b.style.display = 'flex'; }
        else b.style.display = 'none';
    }

    // ── Polling ───────────────────────────────────────────────────────────────
    function getHeaders() {
        const u = JSON.parse(sessionStorage.getItem('kandoUser') || 'null');
        return u?.token ? { 'Authorization': `Bearer ${u.token}` } : {};
    }

    async function poll() {
        try {
            const res = await fetch(`${CHAT_API}/api/chat?since_id=${sinceId}`, { headers: getHeaders() });
            if (!res.ok) return;
            const msgs = await res.json();
            if (isOpen) {
                renderMessages(msgs);
                updateBadge(0);
            } else {
                const newFromOthers = msgs.filter(m => m.senderEmail.toLowerCase() !== myEmail.toLowerCase());
                if (newFromOthers.length) updateBadge(newFromOthers.length);
                newFromOthers.forEach(m => { if (m.id > sinceId) sinceId = m.id; });
            }
        } catch {}
        pollTimer = setTimeout(poll, isOpen ? POLL_OPEN : POLL_CLOSED);
    }

    // ── Üzenet küldés ─────────────────────────────────────────────────────────
    async function sendMessage() {
        const input = document.getElementById('chat-input');
        const btn   = document.getElementById('chat-send');
        const text  = input.value.trim();
        if (!text) return;
        btn.disabled = true;
        try {
            const headers = { 'Content-Type':'application/json', ...getHeaders() };
            const res = await fetch(`${CHAT_API}/api/chat`, {
                method:'POST', headers,
                body: JSON.stringify({ message: text })
            });
            if (res.ok) {
                input.value = '';
                input.style.height = '36px';
                clearTimeout(pollTimer);
                poll();
            }
        } catch {}
        btn.disabled = false;
        input.focus();
    }

    // ── Megnyitás / zárás ─────────────────────────────────────────────────────
    function openChat() {
        isOpen = true;
        panel.classList.add('open');
        updateBadge(0);
        clearTimeout(pollTimer);
        // Első betöltésnél az összes üzenet (sinceId=0)
        poll();
    }

    function closeChat() {
        isOpen = false;
        panel.classList.remove('open');
        clearTimeout(pollTimer);
        pollTimer = setTimeout(poll, POLL_CLOSED);
    }

    fab.addEventListener('click', () => isOpen ? closeChat() : openChat());
    document.getElementById('chat-close').addEventListener('click', closeChat);

    document.getElementById('chat-send').addEventListener('click', sendMessage);
    document.getElementById('chat-input').addEventListener('keydown', e => {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
    });

    // Auto-resize textarea
    document.getElementById('chat-input').addEventListener('input', function() {
        this.style.height = '36px';
        this.style.height = Math.min(this.scrollHeight, 100) + 'px';
    });

    const CHAT_API = 'https://agazati.up.railway.app';

    // ── Inicializálás (polling amíg a sessionStorage be nem áll) ──────────────
    function tryInit(attempt) {
        const u = JSON.parse(sessionStorage.getItem('kandoUser') || 'null');
        if (!u || !u.email) {
            if (attempt < 20) setTimeout(() => tryInit(attempt + 1), 500);
            return;
        }
        myEmail = u.email;
        const isOktato   = u.szerep === 'oktato';
        const isTesztelő = sessionStorage.getItem('kandoIsTesztelő') === '1';

        if (!isOktato && !isTesztelő) {
            // special-roles.js még nem futott le — várunk még pár kísérletet
            if (attempt < 20) setTimeout(() => tryInit(attempt + 1), 500);
            return;
        }
        mySzerep = isOktato ? 'oktato' : 'tesztelő';
        fab.style.display = 'flex';
        pollTimer = setTimeout(poll, 2000);
    }

    setTimeout(() => tryInit(0), 300);
})();
