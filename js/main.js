// ============================================================
//  MAIN — boot, serializzazione stato, slot, menu
// ============================================================

function serializeGameState() {
    return {
        version: 1,
        savedAt: new Date().toISOString(),
        bossIndex: BOSSES.indexOf(currentBoss),
        bossName: currentBoss ? currentBoss.name : '',
        playerHp: playerHp,
        playerShield: playerShield,
        playerMana: playerMana,
        burnDamage: burnDamage, burnTicksLeft: burnTicksLeft,
        poisonDamage: poisonDamage, poisonTicksLeft: poisonTicksLeft,
        monsterWeakTurns: monsterWeakTurns, playerWeakTurns: playerWeakTurns,
        monsterStunTurns: monsterStunTurns, playerStrength: playerStrength,
        playerRegenAmount: playerRegenAmount, playerRegenTurns: playerRegenTurns,
        monsterHp: monsterHp, monsterShield: monsterShield,
        monsterTurnIndex: monsterTurnIndex,
        deck: deck, discardPile: discardPile, hand: hand,
        inventory: (typeof LootSystem !== 'undefined') ? LootSystem.getInventory() : [],
        equipped: (typeof LootSystem !== 'undefined') ? LootSystem.getEquipped() : {},
        unseenItems: parseInt(localStorage.getItem('db_unseen_items') || '0', 10) || 0,
        // MAP_STATE_PERSISTENCE
        mapState: (typeof MapSystem !== "undefined" && MapSystem.exportState) ? MapSystem.exportState() : null
    };
}

function applyGameState(data) {
    if (!data) return false;
    // MAP_STATE_PERSISTENCE
    if (data && data.mapState && typeof MapSystem !== "undefined" && MapSystem.importState) {
        MapSystem.importState(data.mapState);
    }

    const bossIdx = Math.min(Math.max(0, data.bossIndex || 0), BOSSES.length - 1);
    currentBoss = BOSSES[bossIdx];
    monsterPattern = currentBoss.pattern;

    if (typeof data.unseenItems === 'number') {
        try { localStorage.setItem('db_unseen_items', String(data.unseenItems)); } catch(e) {}
    }
    loadEquippedBonuses();

    playerHp = (typeof data.playerHp === 'number') ? data.playerHp : getPlayerMaxHp();
    playerShield = data.playerShield || 0;
    maxMana = BASE_MANA + equippedBonuses.manaMax;
    playerMana = (typeof data.playerMana === 'number') ? data.playerMana : maxMana;

    burnDamage = data.burnDamage || 0;
    burnTicksLeft = data.burnTicksLeft || 0;
    poisonDamage = data.poisonDamage || 0;
    poisonTicksLeft = data.poisonTicksLeft || 0;
    monsterWeakTurns = data.monsterWeakTurns || 0;
    playerWeakTurns = data.playerWeakTurns || 0;
    monsterStunTurns = data.monsterStunTurns || 0;
    playerStrength = data.playerStrength || 0;
    playerRegenAmount = data.playerRegenAmount || 0;
    playerRegenTurns = data.playerRegenTurns || 0;

    monsterHp = (typeof data.monsterHp === 'number') ? data.monsterHp : currentBoss.hp;
    monsterShield = data.monsterShield || 0;
    monsterTurnIndex = data.monsterTurnIndex || 0;

    deck = Array.isArray(data.deck) ? data.deck : [];
    discardPile = Array.isArray(data.discardPile) ? data.discardPile : [];
    hand = Array.isArray(data.hand) ? data.hand : [];

    if (deck.length === 0 && hand.length === 0) {
        initializeDeck();
        const n = handSize + equippedBonuses.extraDraw;
        for (let i = 0; i < n; i++) {
            const c = drawCard();
            if (c) hand.push(c);
        }
    }

    isPlayerTurn = true;
    battleOver = false;
    return true;
}

function refreshGameUI() {
    // NB: se la mappa è aperta, non aggiorno il nome mostro (evita flash)
    const _mapOpen = document.body.classList.contains("map-open");
    if (!_mapOpen) {
        const bossNameEl = document.querySelector(".monster-ui .entity-name");
        if (bossNameEl && typeof currentBoss !== "undefined") bossNameEl.textContent = currentBoss.name;
    }

    const bgVideo = document.getElementById('bg-video');
    const bgSource = document.getElementById('bg-video-source');
    if (bgVideo && bgSource && currentBoss.bgVideo) {
        bgSource.src = currentBoss.bgVideo;
        bgVideo.load();
        bgVideo.play().catch(() => {});
    }

    renderHand();
    if (typeof renderBonusPanel === 'function') renderBonusPanel();
    updateUIStats();
}

function newGameInSlot(slotIndex) {
    if (typeof MapSystem !== "undefined" && MapSystem.setBodyMapOpen) MapSystem.setBodyMapOpen(true);
    if (typeof LootSystem !== 'undefined') {
        LootSystem.saveInventory([]);
        LootSystem.saveEquipped({});
    }
    try { localStorage.removeItem('db_unseen_items'); } catch(e) {}

    loadEquippedBonuses();

    currentBoss = BOSSES[0];
    monsterPattern = currentBoss.pattern;
    monsterHp = currentBoss.hp;
    monsterShield = 0;
    monsterTurnIndex = 0;

    playerHp = getPlayerMaxHp();
    playerShield = 0;
    maxMana = BASE_MANA + equippedBonuses.manaMax;
    playerMana = maxMana;

    burnDamage = 0; burnTicksLeft = 0;
    poisonDamage = 0; poisonTicksLeft = 0;
    monsterWeakTurns = 0; playerWeakTurns = 0;
    monsterStunTurns = 0; playerStrength = 0;
    playerRegenAmount = 0; playerRegenTurns = 0;

    discardPile = [];
    hand = [];
    initializeDeck();
    const n = handSize + equippedBonuses.extraDraw;
    for (let i = 0; i < n; i++) {
        const c = drawCard();
        if (c) hand.push(c);
    }

    isPlayerTurn = true;
    battleOver = false;

    SaveSystem.setActiveSlot(slotIndex);
    SaveSystem.setLastPlayedSlot(slotIndex);

    refreshGameUI();
    autoSave();
    // Fallback: apri mappa con delay per garantire che tutto sia pronto
    setTimeout(function(){
        if (typeof MapSystem !== "undefined" && MapSystem.openInstant) {
            if (!document.body.classList.contains("map-open")) {
                console.log("[newGameInSlot] fallback openInstant");
                MapSystem.openInstant();
            }
        }
    }, 200);
    autoSave();
    if (typeof MapSystem !== "undefined" && MapSystem.openInstant) MapSystem.openInstant();
    autoSave();
    autoSave();
    autoSave();
}

function loadGameFromSlot(slotIndex, opts) {
    const skipMap = !!(opts && opts.skipMap);
    const data = SaveSystem.getSlot(slotIndex);
    if (!data) return false;

    SaveSystem.setActiveSlot(slotIndex);
    SaveSystem.setLastPlayedSlot(slotIndex);

    applyGameState(data);

    if (skipMap) {
        // Riprendi direttamente la battaglia: NON aprire la mappa
        if (typeof refreshGameUI === "function") refreshGameUI();
        if (typeof MapSystem !== "undefined" && MapSystem.setBodyMapOpen) {
            MapSystem.setBodyMapOpen(false);
        }
    } else {
        refreshGameUI();
        if (typeof MapSystem !== "undefined" && MapSystem.openInstant) {
            MapSystem.openInstant();
        }
    }
    return true;
}

function saveToSlot(slotIndex) {
    try {
        const data = serializeGameState();
        const ok = SaveSystem.saveSlot(slotIndex, data);
        if (ok) {
            SaveSystem.setActiveSlot(slotIndex);
            SaveSystem.setLastPlayedSlot(slotIndex);
        }
        return ok;
    } catch(e) {
        console.error('Save failed', e);
        return false;
    }
}

function autoSave() {
    const slot = SaveSystem.getActiveSlot();
    if (slot > 0) saveToSlot(slot);
}

// ---------- BOOT ----------
(function boot() {
    if (typeof MenuSystem === 'undefined') {
        console.warn('MenuSystem non caricato');
        return;
    }
    MenuSystem.initMenu();
    // FIX_ONBATTLE_BOOT: registra onBattle PRIMA del ramo autostart
    if (typeof MapSystem !== "undefined" && typeof startBattleFromMap === "function") {
        MapSystem.onBattle(function(kind) {
            console.log("[FIX_ONBATTLE_BOOT] onBattle chiamato:", kind);
            startBattleFromMap(kind);
        });
    }
    // La mappa apre al boot: nascondi il game-table fino ad allora
    if (typeof MapSystem !== "undefined" && MapSystem.setBodyMapOpen) MapSystem.setBodyMapOpen(true);
    MenuSystem.initMenu();
    MenuSystem.setCallbacks({
        onNewGame: (slot) => { MenuSystem.hideMenu(); newGameInSlot(slot); },
        onLoadSlot: (slot) => { MenuSystem.hideMenu(); loadGameFromSlot(slot); },
        onSave: (slot) => saveToSlot(slot)
    });

    const params = new URLSearchParams(location.search);
    const autostart = params.get('autostart') === '1';
    const activeSlot = SaveSystem.getActiveSlot();

    if (autostart && activeSlot > 0) {
        history.replaceState({}, "", location.pathname);
        // Controlla se stiamo tornando da una battaglia (equip o altro)
        var _returnToBattle = false;
        try {
            _returnToBattle = localStorage.getItem("db_return_to_battle") === "1";
            if (_returnToBattle) localStorage.removeItem("db_return_to_battle");
        } catch(e) {}
        var ok;
        if (_returnToBattle) {
            console.log("[BOOT] ripresa battaglia dopo equip");
            ok = loadGameFromSlot(activeSlot, { skipMap: true });
        } else {
            ok = loadGameFromSlot(activeSlot);
        }
        if (!ok) {
            if (typeof MapSystem !== "undefined" && MapSystem.setBodyMapOpen) {
                MapSystem.setBodyMapOpen(false);
            }
            MenuSystem.showStartMenu();
        }
        return;
    }

    MenuSystem.showStartMenu();
    if (typeof MapSystem !== "undefined") {
        MapSystem.onBattle((kind) => {
            if (typeof startBattleFromMap === "function") startBattleFromMap(kind);
        });
    }
})();

/* ============================================================
   SAFETY: apertura mappa al DOMContentLoaded se serve
   ============================================================ */
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(function() {
        var overlay = document.getElementById('map-overlay');
        if (!overlay) {
            console.warn('[SAFETY] #map-overlay non trovato dopo DOM ready');
            return;
        }
        var hasActiveSlot = false;
        try {
            var slot = parseInt(localStorage.getItem('db_active_slot') || '', 10);
            hasActiveSlot = Number.isFinite(slot) && slot > 0;
        } catch(e) {}

        // Se il body ha map-open ma la mappa non è active, apri
        if (document.body.classList.contains('map-open') && !overlay.classList.contains('active')) {
            console.log('[SAFETY] apro mappa ritardata');
            if (typeof MapSystem !== 'undefined' && MapSystem.openInstant) {
                MapSystem.openInstant();
            }
        }
    }, 300);
});
