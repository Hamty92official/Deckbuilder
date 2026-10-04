// ============================================================
//  MENU UI — start menu + pause menu + slot picker + exit
// ============================================================
(function(global) {
    'use strict';

    const S = global.SaveSystem;
    let onNewGameCb = null;
    let onLoadSlotCb = null;
    let onSaveCb = null;
    let inGame = false;

    function initMenu() {
        const overlay = document.getElementById('menu-overlay');
        if (!overlay) return;

        document.getElementById('menu-resume').addEventListener('click', onResume);
        document.getElementById('menu-new').addEventListener('click', onNew);
        document.getElementById('menu-save').addEventListener('click', onSave);
        document.getElementById('menu-load').addEventListener('click', onLoad);
        document.getElementById('menu-exit').addEventListener('click', onExit);

        const sub = document.getElementById('menu-submodal');
        sub.addEventListener('click', (e) => {
            if (e.target === sub) closeSubModal();
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const sub = document.getElementById('menu-submodal');
                if (sub.classList.contains('active')) { closeSubModal(); return; }
                if (inGame) showPauseMenu();
            }
        });

        const pauseBtn = document.getElementById('open-menu-btn');
        if (pauseBtn) pauseBtn.addEventListener('click', () => showPauseMenu());
    }

    function showStartMenu() {
        const overlay = document.getElementById('menu-overlay');
        if (!overlay) return;
        inGame = false;
        overlay.classList.add('active');

        const resumeBtn = document.getElementById('menu-resume');
        resumeBtn.textContent = 'Riprendi Partita';
        resumeBtn.style.display = S.findMostRecentSlot() > 0 ? 'block' : 'none';
        document.getElementById('menu-save').style.display = 'none';

        setMenuVideo();
    }

    function showPauseMenu() {
        const overlay = document.getElementById('menu-overlay');
        if (!overlay) return;
        inGame = true;
        overlay.classList.add('active');

        const resumeBtn = document.getElementById('menu-resume');
        resumeBtn.textContent = 'Continua';
        resumeBtn.style.display = 'block';
        document.getElementById('menu-save').style.display = 'block';

        setMenuVideo();
    }

    function hideMenu() {
        const overlay = document.getElementById('menu-overlay');
        if (!overlay) return;
        overlay.classList.remove('active');
        closeSubModal();
    }

    function setMenuVideo() {
        const src = document.getElementById('menu-bg-source');
        const vid = document.getElementById('menu-bg-video');
        if (src && vid && src.src.indexOf('bg-menu.webm') === -1) {
            src.src = 'bg-menu.webm';
            vid.load();
            vid.play().catch(() => {});
        }
    }

    function onResume() {
        if (!inGame) {
            const idx = S.findMostRecentSlot();
            if (idx > 0 && onLoadSlotCb) {
                S.setActiveSlot(idx);
                hideMenu();
                onLoadSlotCb(idx);
            }
        } else {
            hideMenu();
        }
    }

    function onNew() { showSlotPicker('new'); }
    function onSave() {
        if (!inGame) return;
        const active = S.getActiveSlot();
        if (active > 0) {
            if (onSaveCb) onSaveCb(active);
            showToast('Partita salvata nello Slot ' + active);
        } else {
            showSlotPicker('save');
        }
    }
    function onLoad() { showLoadModal(); }
    function onExit() { showExitModal(); }

    // ---- Sub modals ----
    function openSubModal(html) {
        const sub = document.getElementById('menu-submodal');
        document.getElementById('menu-submodal-content').innerHTML = html;
        sub.classList.add('active');
    }
    function closeSubModal() {
        const sub = document.getElementById('menu-submodal');
        sub.classList.remove('active');
        document.getElementById('menu-submodal-content').innerHTML = '';
    }

    function showSlotPicker(mode) {
        const slots = S.listSlots();
        const title = mode === 'new'
            ? 'Scegli uno slot per la nuova partita'
            : 'Scegli dove salvare';
        const activeSlot = S.getActiveSlot();
        let html = '<div class="submodal-title">' + title + '</div><div class="slot-grid">';
        slots.forEach(s => {
            const hasData = !!s.data;
            const isActive = s.index === activeSlot;
            let info = 'Vuoto';
            if (hasData) {
                info = S.formatDate(s.data.savedAt) +
                       '<br>Liv. ' + ((s.data.bossIndex || 0) + 1) +
                       (s.data.bossName ? ' · ' + s.data.bossName : '') +
                       '<br>❤️ ' + (s.data.playerHp || '?') + ' HP';
            }
            const cls = 'slot-card' + (hasData ? ' filled' : ' empty') + (isActive ? ' active' : '');
            html += '<div class="' + cls + '" data-slot="' + s.index + '">' +
                    '<div class="slot-num">Slot ' + s.index + '</div>' +
                    '<div class="slot-info">' + info + '</div>' +
                    '</div>';
        });
        html += '</div>';
        html += '<div class="submodal-actions"><button class="submodal-btn" id="submodal-cancel">Annulla</button></div>';
        openSubModal(html);

        document.getElementById('submodal-cancel').addEventListener('click', closeSubModal);
        document.querySelectorAll('.slot-card').forEach(el => {
            el.addEventListener('click', () => {
                const slot = parseInt(el.dataset.slot, 10);
                const existing = S.getSlot(slot);
                if (existing) {
                    confirmModal(
                        'Slot ' + slot + ' contiene un salvataggio. Sovrascrivere?',
                        () => pickSlot(mode, slot)
                    );
                } else {
                    pickSlot(mode, slot);
                }
            });
        });
    }

    function pickSlot(mode, slot) {
        closeSubModal();
        if (mode === 'new') {
            S.setActiveSlot(slot);
            hideMenu();
            if (onNewGameCb) onNewGameCb(slot);
        } else if (mode === 'save') {
            if (onSaveCb) {
                const ok = onSaveCb(slot);
                if (ok) showToast('Partita salvata nello Slot ' + slot);
            }
        }
    }

    function showLoadModal() {
        const slots = S.listSlots();
        let hasAny = slots.some(s => s.data);
        let html = '<div class="submodal-title">Carica Partita</div>';
        if (!hasAny) {
            html += '<div class="empty-msg">Nessun salvataggio disponibile.</div>';
        } else {
            html += '<div class="slot-grid">';
            slots.forEach(s => {
                const hasData = !!s.data;
                let info = 'Vuoto';
                if (hasData) {
                    info = S.formatDate(s.data.savedAt) +
                           '<br>Liv. ' + ((s.data.bossIndex || 0) + 1) +
                           (s.data.bossName ? ' · ' + s.data.bossName : '') +
                           '<br>❤️ ' + (s.data.playerHp || '?') + ' HP';
                }
                const cls = 'slot-card' + (hasData ? ' filled' : ' empty');
                html += '<div class="' + cls + '" data-slot="' + s.index + '">' +
                        (hasData ? '<button class="slot-trash" data-trash="' + s.index + '" title="Elimina">🗑️</button>' : '') +
                        '<div class="slot-num">Slot ' + s.index + '</div>' +
                        '<div class="slot-info">' + info + '</div>' +
                        '</div>';
            });
            html += '</div>';
        }
        html += '<div class="submodal-actions"><button class="submodal-btn" id="submodal-cancel">Annulla</button></div>';
        openSubModal(html);

        document.getElementById('submodal-cancel').addEventListener('click', closeSubModal);

        document.querySelectorAll('.slot-card.filled').forEach(el => {
            el.addEventListener('click', (e) => {
                if (e.target.closest('.slot-trash')) return;
                const slot = parseInt(el.dataset.slot, 10);
                S.setActiveSlot(slot);
                closeSubModal();
                hideMenu();
                if (onLoadSlotCb) onLoadSlotCb(slot);
            });
        });

        document.querySelectorAll('.slot-trash').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const slot = parseInt(btn.dataset.trash, 10);
                confirmModal('Eliminare il salvataggio nello Slot ' + slot + '?', () => {
                    S.deleteSlot(slot);
                    if (S.getActiveSlot() === slot) S.setActiveSlot(-1);
                    showLoadModal();
                });
            });
        });
    }

    function confirmModal(text, onYes) {
        let html = '<div class="submodal-title">' + text + '</div>' +
            '<div class="submodal-actions">' +
            '<button class="submodal-btn submodal-danger" id="confirm-yes">Sì</button>' +
            '<button class="submodal-btn" id="confirm-no">Annulla</button>' +
            '</div>';
        openSubModal(html);
        document.getElementById('confirm-yes').addEventListener('click', () => {
            closeSubModal();
            if (onYes) onYes();
        });
        document.getElementById('confirm-no').addEventListener('click', closeSubModal);
    }

    function showExitModal() {
        let html = '';
        if (inGame) {
            html = '<div class="submodal-title">Salvare i progressi prima di uscire?</div>' +
                '<div class="submodal-actions">' +
                '<button class="submodal-btn submodal-primary" id="exit-save">Salva ed Esci</button>' +
                '<button class="submodal-btn submodal-danger" id="exit-nosave">Esci senza salvare</button>' +
                '<button class="submodal-btn" id="exit-cancel">Annulla</button>' +
                '</div>';
        } else {
            html = '<div class="submodal-title">Uscire dal gioco?</div>' +
                '<div class="submodal-actions">' +
                '<button class="submodal-btn submodal-danger" id="exit-nosave">Esci</button>' +
                '<button class="submodal-btn" id="exit-cancel">Annulla</button>' +
                '</div>';
        }
        openSubModal(html);

        const saveBtn = document.getElementById('exit-save');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => {
                let slot = S.getActiveSlot();
                if (slot < 1) slot = S.findFirstEmptySlot();
                if (slot > 0 && onSaveCb) onSaveCb(slot);
                closeSubModal();
                tryClose();
            });
        }
        document.getElementById('exit-nosave').addEventListener('click', () => {
            closeSubModal();
            tryClose();
        });
        document.getElementById('exit-cancel').addEventListener('click', closeSubModal);
    }

    function tryClose() {
        window.close();
        setTimeout(() => {
            showToast('Progressi salvati. Puoi chiudere la scheda.');
        }, 300);
    }

    function showToast(msg) {
        let el = document.getElementById('menu-toast');
        if (!el) {
            el = document.createElement('div');
            el.id = 'menu-toast';
            el.className = 'menu-toast';
            document.body.appendChild(el);
        }
        el.textContent = msg;
        el.classList.add('visible');
        clearTimeout(el._t);
        el._t = setTimeout(() => el.classList.remove('visible'), 2600);
    }

    function setCallbacks(opts) {
        if (opts.onNewGame) onNewGameCb = opts.onNewGame;
        if (opts.onLoadSlot) onLoadSlotCb = opts.onLoadSlot;
        if (opts.onSave) onSaveCb = opts.onSave;
    }

    global.MenuSystem = {
        initMenu, showStartMenu, showPauseMenu, hideMenu,
        setCallbacks,
        isInGame: () => inGame
    };
})(typeof window !== 'undefined' ? window : this);
