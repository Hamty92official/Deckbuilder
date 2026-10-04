// ============================================================
//  SAVE SYSTEM — 5 slot + autosave
// ============================================================
(function(global) {
    'use strict';

    const MAX_SLOTS = 5;
    const SLOT_PREFIX = 'db_slot_';
    const ACTIVE_KEY = 'db_active_slot';
    const LAST_PLAYED_KEY = 'db_last_played_slot';

    function slotKey(i) { return SLOT_PREFIX + i; }

    function getSlot(i) {
        try {
            const raw = localStorage.getItem(slotKey(i));
            if (!raw) return null;
            return JSON.parse(raw);
        } catch(e) { return null; }
    }

    function saveSlot(i, data) {
        try {
            localStorage.setItem(slotKey(i), JSON.stringify(data));
            return true;
        } catch(e) { return false; }
    }

    function deleteSlot(i) {
        try { localStorage.removeItem(slotKey(i)); } catch(e) {}
    }

    function listSlots() {
        const arr = [];
        for (let i = 1; i <= MAX_SLOTS; i++) {
            arr.push({ index: i, data: getSlot(i) });
        }
        return arr;
    }

    function findFirstEmptySlot() {
        for (let i = 1; i <= MAX_SLOTS; i++) {
            if (!getSlot(i)) return i;
        }
        return -1;
    }

    function findMostRecentSlot() {
        let best = -1, bestTime = -1;
        for (let i = 1; i <= MAX_SLOTS; i++) {
            const d = getSlot(i);
            if (d && d.savedAt) {
                const t = Date.parse(d.savedAt);
                if (Number.isFinite(t) && t > bestTime) {
                    bestTime = t;
                    best = i;
                }
            }
        }
        return best;
    }

    function getActiveSlot() {
        try {
            const raw = parseInt(localStorage.getItem(ACTIVE_KEY) || '', 10);
            if (Number.isFinite(raw) && raw >= 1 && raw <= MAX_SLOTS) return raw;
        } catch(e) {}
        return -1;
    }

    function setActiveSlot(i) {
        try {
            if (i >= 1 && i <= MAX_SLOTS) localStorage.setItem(ACTIVE_KEY, String(i));
            else localStorage.removeItem(ACTIVE_KEY);
        } catch(e) {}
    }

    function getLastPlayedSlot() {
        try {
            const raw = parseInt(localStorage.getItem(LAST_PLAYED_KEY) || '', 10);
            if (Number.isFinite(raw) && raw >= 1 && raw <= MAX_SLOTS) return raw;
        } catch(e) {}
        return -1;
    }

    function setLastPlayedSlot(i) {
        try {
            if (i >= 1 && i <= MAX_SLOTS) localStorage.setItem(LAST_PLAYED_KEY, String(i));
        } catch(e) {}
    }

    function formatDate(iso) {
        if (!iso) return '';
        try {
            const d = new Date(iso);
            const dd = String(d.getDate()).padStart(2, '0');
            const mm = String(d.getMonth() + 1).padStart(2, '0');
            const yy = d.getFullYear();
            const hh = String(d.getHours()).padStart(2, '0');
            const mn = String(d.getMinutes()).padStart(2, '0');
            return dd + '/' + mm + '/' + yy + ' ' + hh + ':' + mn;
        } catch(e) { return ''; }
    }

    global.SaveSystem = {
        MAX_SLOTS,
        getSlot, saveSlot, deleteSlot,
        listSlots, findFirstEmptySlot, findMostRecentSlot,
        getActiveSlot, setActiveSlot,
        getLastPlayedSlot, setLastPlayedSlot,
        formatDate
    };
})(typeof window !== 'undefined' ? window : this);
