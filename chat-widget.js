// Chat widget – tesztelők és oktatók számára, csatornánként elkülönítve
(function () {
    const POLL_OPEN   = 5000;
    const POLL_CLOSED = 30000;
    const CHAT_API    = 'https://agazati.up.railway.app';

    let myEmail       = '';
    let mySzerep      = '';
    let isOktato      = false;
    let isOpen        = false;
    let pollTimer     = null;
    let currentChannel = 'tesztelok';

    // sinceId localStorage-ból visszaállítva → oldal-újratöltés után nem jön vissza a badge
    function loadSinceId(channel) {
        return parseInt(localStorage.getItem(`chat_since_${channel}`) || '0');
    }
    function saveSinceId(channel, id) {
        localStorage.setItem(`chat_since_${channel}`, id);
    }

    const ch = {
        tesztelok: { sinceId: loadSinceId('tesztelok'), messages: [], unread: 0 },
        oktatok:   { sinceId: loadSinceId('oktatok'),   messages: [], unread: 0 }
    };

    // ── Stílus ────────────────────────────────────────────────────────────────
    const style = document.createElement('style');
    style.textContent = `
    #chat-fab {
        position:fixed; bottom:24px; right:24px; z-index:9000;
        width:52px; height:52px; border-radius:50%;
        background:linear-gradient(135deg,#4f46e5,#7c3aed);
        border:none; cursor:pointer; display:none; align-items:center; justify-content:center;
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
        position:fixed; top:62px; right:16px; z-index:9000;
        width:340px; max-height:500px;
        background:#161b22; border:1px solid #30363d; border-radius:12px;
        display:none; flex-direction:column;
        box-shadow:0 8px 32px rgba(0,0,0,.5);
        font-family:'Segoe UI',system-ui,sans-serif; font-size:0.85rem;
    }
    #chat-panel.open { display:flex; }
    #chat-header {
        padding:10px 14px; border-bottom:1px solid #21262d;
        font-weight:700; color:#e0e0e0; font-size:0.9rem;
        display:flex; align-items:center; gap:8px; flex-shrink:0;
    }
    #chat-header i { color:#7c3aed; }
    #chat-header span { flex:1; }
    #chat-close {
        background:none; border:none; color:#8b949e; cursor:pointer; font-size:1rem; padding:0;
    }
    #chat-close:hover { color:#e0e0e0; }
    #chat-tabs {
        display:flex; border-bottom:1px solid #21262d; flex-shrink:0;
    }
    .chat-tab {
        flex:1; padding:7px 0; background:none; border:none; color:#8b949e;
        font-size:0.8rem; font-weight:600; cursor:pointer; transition:color .15s;
        position:relative;
    }
    .chat-tab.active { color:#e0e0e0; }
    .chat-tab.active::after {
        content:''; position:absolute; bottom:0; left:10%; width:80%; height:2px;
        background:#7c3aed; border-radius:2px;
    }
    .chat-tab:hover:not(.active) { color:#c9d1d9; }
    .chat-tab-badge {
        display:inline-flex; align-items:center; justify-content:center;
        background:#ef4444; color:#fff; border-radius:50%;
        width:14px; height:14px; font-size:0.6rem; font-weight:700;
        margin-left:4px; vertical-align:middle;
    }
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
        padding:10px 12px; border-top:1px solid #21262d; display:flex; gap:8px; flex-shrink:0;
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
    fab.title = 'Chat';
    fab.innerHTML = '<i class="fas fa-comments"></i><span id="chat-badge"></span>';

    const panel = document.createElement('div');
    panel.id = 'chat-panel';
    panel.innerHTML = `
        <div id="chat-header">
            <i class="fas fa-comments"></i>
            <span id="chat-title">Chat</span>
            <button id="chat-close" title="Bezár"><i class="fas fa-times"></i></button>
        </div>
        <div id="chat-tabs" style="display:none;">
            <button class="chat-tab active" id="tab-btn-tesztelok" onclick="chatSwitchChannel('tesztelok')">
                <i class="fas fa-flask" style="margin-right:3px;font-size:.7rem;"></i>Tesztelők<span id="tab-badge-tesztelok" class="chat-tab-badge" style="display:none;"></span>
            </button>
            <button class="chat-tab" id="tab-btn-oktatok" onclick="chatSwitchChannel('oktatok')">
                <i class="fas fa-chalkboard-teacher" style="margin-right:3px;font-size:.7rem;"></i>Oktatók<span id="tab-badge-oktatok" class="chat-tab-badge" style="display:none;"></span>
            </button>
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

    function escHtml(t) {
        return t.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
    }

    function renderMessages(msgs) {
        const el = document.getElementById('chat-messages');
        const wasAtBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 40;
        const existing = new Set([...el.querySelectorAll('[data-id]')].map(e => e.dataset.id));
        let added = 0;
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
            if (m.id > ch[currentChannel].sinceId) ch[currentChannel].sinceId = m.id;
            added++;
        });
        const empty = el.querySelector('.chat-empty');
        if (added > 0 && empty) empty.remove();
        if (el.querySelectorAll('[data-id]').length === 0) {
            el.innerHTML = '<div class="chat-empty">Még nincs üzenet – írj elsőként!</div>';
        }
        if (wasAtBottom || msgs.some(m => m.senderEmail.toLowerCase() === myEmail.toLowerCase()))
            el.scrollTop = el.scrollHeight;
    }

    function updateBadge() {
        const b = document.getElementById('chat-badge');
        const total = ch.tesztelok.unread + ch.oktatok.unread;
        if (b) {
            if (total > 0) { b.textContent = total > 9 ? '9+' : total; b.style.display = 'flex'; }
            else b.style.display = 'none';
        }
        const tb = document.getElementById('topbar-chat-badge');
        if (tb) {
            if (total > 0) { tb.textContent = total > 9 ? '9+' : total; tb.style.display = 'flex'; }
            else tb.style.display = 'none';
        }

        if (isOktato) {
            ['tesztelok','oktatok'].forEach(c => {
                const tb = document.getElementById(`tab-badge-${c}`);
                if (!tb) return;
                if (ch[c].unread > 0) { tb.textContent = ch[c].unread; tb.style.display = 'inline-flex'; }
                else tb.style.display = 'none';
            });
        }
    }

    // ── Tab váltás (oktatóknak) ───────────────────────────────────────────────
    window.chatSwitchChannel = function(channel) {
        if (channel === currentChannel) return;
        currentChannel = channel;
        ch[channel].unread = 0;
        ['tesztelok','oktatok'].forEach(c => {
            document.getElementById(`tab-btn-${c}`)?.classList.toggle('active', c === channel);
        });
        updateBadge();
        const el = document.getElementById('chat-messages');
        const cached = ch[channel].messages;
        el.innerHTML = cached.length > 0 ? '' : '<div class="chat-empty">Üzenetek betöltése...</div>';
        if (cached.length > 0) renderMessages(cached);
        clearTimeout(pollTimer);
        poll();
    };

    // ── Polling ───────────────────────────────────────────────────────────────
    function getHeaders() {
        const u = JSON.parse(sessionStorage.getItem('kandoUser') || 'null');
        let token = u?.token || '';
        if (!token && u?._tesztMod) {
            const backup = JSON.parse(localStorage.getItem('kandoTeacherBackup') || '{}');
            token = backup.token || '';
        }
        return token ? { 'Authorization': `Bearer ${token}` } : {};
    }

    async function pollChannel(channel) {
        try {
            const state = ch[channel];
            const res = await fetch(`${CHAT_API}/api/chat?since_id=${state.sinceId}&channel=${channel}`, { headers: getHeaders() });
            if (!res.ok) return;
            const msgs = await res.json();

            if (msgs.length === 0) {
                // Nincs új üzenet – ha a loading szöveg még látszik, cseréljük ki
                if (isOpen && channel === currentChannel) {
                    const el = document.getElementById('chat-messages');
                    if (el && el.querySelectorAll('[data-id]').length === 0) {
                        el.innerHTML = '<div class="chat-empty">Még nincs üzenet – írj elsőként!</div>';
                    }
                }
                return;
            }

            // sinceId frissítése + localStorage mentés (badge nem jön vissza újratöltés után)
            msgs.forEach(m => {
                if (m.id > state.sinceId) {
                    state.sinceId = m.id;
                    saveSinceId(channel, m.id);
                }
            });

            // Cache (megnyitáskor azonnal megjelenítjük)
            msgs.forEach(m => {
                if (!state.messages.find(sm => sm.id === m.id)) state.messages.push(m);
            });

            if (isOpen && channel === currentChannel) {
                renderMessages(msgs);
                ch[channel].unread = 0;
            } else {
                const fromOthers = msgs.filter(m => m.senderEmail.toLowerCase() !== myEmail.toLowerCase());
                ch[channel].unread += fromOthers.length;
            }
            updateBadge();
        } catch {}
    }

    async function poll() {
        if (isOpen) {
            await pollChannel(currentChannel);
        } else {
            // Csukva: mindkét csatorna olvasása oktatónak, csak a saját tesztelőnek
            await pollChannel('tesztelok');
            if (isOktato) await pollChannel('oktatok');
        }
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
                body: JSON.stringify({ message: text, channel: currentChannel })
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
        ch[currentChannel].unread = 0;
        updateBadge();
        panel.classList.add('open');
        clearTimeout(pollTimer);
        const el = document.getElementById('chat-messages');
        const cached = ch[currentChannel].messages;
        el.innerHTML = cached.length > 0 ? '' : '<div class="chat-empty">Üzenetek betöltése...</div>';
        if (cached.length > 0) renderMessages(cached);
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
    document.getElementById('chat-input').addEventListener('input', function() {
        this.style.height = '36px';
        this.style.height = Math.min(this.scrollHeight, 100) + 'px';
    });

    // ── Inicializálás ─────────────────────────────────────────────────────────
    function tryInit(attempt) {
        const u = JSON.parse(sessionStorage.getItem('kandoUser') || 'null');
        if (!u || !u.email) {
            if (attempt < 20) setTimeout(() => tryInit(attempt + 1), 500);
            return;
        }
        myEmail  = u.email;
        isOktato = u.szerep === 'oktato';
        const isTesztelő = sessionStorage.getItem('kandoIsTesztelő') === '1';

        if (!isOktato && !isTesztelő) {
            if (attempt < 20) setTimeout(() => tryInit(attempt + 1), 500);
            return;
        }
        mySzerep = isOktato ? 'oktato' : 'tesztelő';
        // Admin (sandornef) mindkét csatornát látja; többi oktató csak az oktatóit
        const isAdmin = u.email === 'sandornef@kkszki.hu';

        if (isOktato && isAdmin) {
            // Tab-váltó mindkét csatornához
            document.getElementById('chat-tabs').style.display = 'flex';
            document.getElementById('chat-title').textContent = 'Chat';
        } else if (isOktato) {
            // Csak oktatói csatorna, nincs tab
            currentChannel = 'oktatok';
            document.getElementById('chat-title').textContent = 'Oktatói chat';
        } else {
            // Tesztelő: csak tesztelők csatorna
            document.getElementById('chat-title').textContent = 'Tesztelői chat';
        }

        // Ha az Ötlet gomb is jelen van ugyanazon a pozíción, eltoljuk balra
        const otletWrap = document.querySelector('.otlet-fab-wrap');
        if (otletWrap) {
            const otletW = otletWrap.offsetWidth || 130;
            const offset = 24 + otletW + 12;
            fab.style.right = offset + 'px';
            panel.style.right = '24px';
        }

        // Topbar chat gomb megjelenítése (FAB helyett)
        const topbarBtn = document.getElementById('topbar-chat-btn');
        if (topbarBtn) topbarBtn.style.display = 'inline-flex';
        pollTimer = setTimeout(poll, 2000);
    }

    // Topbar gombból hívható toggle
    window.chatOpenFromTopbar = function() {
        isOpen ? closeChat() : openChat();
    };

    setTimeout(() => tryInit(0), 300);
})();
