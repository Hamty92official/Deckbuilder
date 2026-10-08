// ============================================================
//  LOGICA DI GIOCO — turni, drag, battaglia
// ============================================================

let activeCard = null;
let activeCardIndex = -1;
let activeCardData = null;
let startX = 0, startY = 0;
let dragDx = 0, dragDy = 0;

function executeCardEffect(cardData) {
    const cost = getCardCost(cardData);
    if (playerMana < cost) {
        console.log(`Mana insufficiente! Costo: ${cost}, Mana: ${playerMana}`);
        return false;
    }
    playerMana -= cost;
    updateUIStats();
    return true;
}

function cardPose(dx, dy, scale) {
    return `translateX(-50%) translate(calc(var(--tx) + ${dx}px), calc(var(--ty) - 50px + ${dy}px)) scale(${scale}) rotate(0deg)`;
}

function startDrag(e, card, data, index) {
    if (activeCard || !isPlayerTurn || battleOver) return;
    if (getCardCost(data) > playerMana) return;

    activeCard = card;
    activeCardIndex = index;
    activeCardData = data;

    activeCard.classList.add('is-dragging');
    startX = e.clientX;
    startY = e.clientY;
    dragDx = 0;
    dragDy = 0;
    activeCard.style.transform = cardPose(0, 0, 1.1);

    window.addEventListener('pointermove', onDragMove);
    window.addEventListener('pointerup', onDragEnd);
}

function onDragMove(e) {
    if (!activeCard) return;
    dragDx = e.clientX - startX;
    dragDy = e.clientY - startY;
    activeCard.style.transform = cardPose(dragDx, dragDy, 1.1);
}

function onDragEnd(e) {
    if (!activeCard) return;
    window.removeEventListener('pointermove', onDragMove);
    window.removeEventListener('pointerup', onDragEnd);

    const card = activeCard;
    const data = activeCardData;
    const index = activeCardIndex;

    const movedUp = e.clientY < window.innerHeight * 0.6;
    const played = movedUp && executeCardEffect(data);

    card.classList.remove('is-dragging');
    card.classList.add('no-hover');

    if (played) {
        const tableRect = document.getElementById('game-table').getBoundingClientRect();
        const cardRect = card.getBoundingClientRect();
        const dx = dragDx + (tableRect.left + tableRect.width / 2) - (cardRect.left + cardRect.width / 2);
        const dy = dragDy + (tableRect.top + tableRect.height / 2) - (cardRect.top + cardRect.height / 2);

        card.style.transition = 'transform 0.35s cubic-bezier(0.25, 1, 0.5, 1), opacity 0.35s ease';
        card.style.transform = cardPose(dx, dy, 1.15);
        card.style.opacity = '0';

        hand.splice(index, 1);
        handEls.splice(index, 1);
        discardPile.push(data);
        layoutHand();
        updateUIStats();

        setTimeout(() => card.remove(), 350);

        const fxDone = playCardFx(data);
        setTimeout(() => {
            resetDrag();
            checkEndOfTurn();
        }, Math.max(350, fxDone));
    } else {
        card.style.transform = '';
        setTimeout(() => card.classList.remove('no-hover'), 400);
        resetDrag();
    }
}

function resetDrag() {
    activeCard = null;
    activeCardIndex = -1;
    activeCardData = null;
}

function checkEndOfTurn() {
    if (battleOver || !isPlayerTurn) return;

    if (monsterHp <= 0) { endBattle(true); return; }

    const canPlayAnyCard = hand.some(card => getCardCost(card) <= playerMana);
    if (!canPlayAnyCard) startEnemyTurn();
}

function startEnemyTurn() {
    isPlayerTurn = false;
    showBanner('Fine del Turno');

    if (playerWeakTurns > 0) playerWeakTurns--;
    updateUIStats();

    const discarded = [...handEls];
    discarded.forEach((el, i) => {
        el.style.transitionDelay = `${i * 50}ms`;
        el.classList.add('no-hover', 'card-enter');
    });
    later(600 + discarded.length * 50, () => {
        discarded.forEach(el => { el.style.transitionDelay = ''; });
    });

    discardPile.push(...hand);
    hand = [];
    handEls = [];

    setTimeout(hideBanner, 900);
    setTimeout(() => showBanner('Turno del Nemico'), 1150);

    setTimeout(() => {
        burnTick();
        if (monsterHp <= 0) { endBattle(true); return; }
        poisonTick();
        if (monsterHp <= 0) { endBattle(true); return; }
    }, 1300);

    setTimeout(monsterTurn, 1950);
}

function monsterTurn() {
    if (battleOver) return;

    monsterShield = 0;
    updateUIStats();

    const consumeMonsterWeak = () => {
        if (monsterWeakTurns > 0) monsterWeakTurns--;
        updateUIStats();
    };

    if (monsterStunTurns > 0) {
        monsterStunTurns--;
        consumeMonsterWeak();
        fxMonsterStunned(() => {
            if (playerHp <= 0) { endBattle(false); return; }
            setTimeout(startPlayerTurn, 300);
        });
        return;
    }

    const action = monsterPattern[monsterTurnIndex % monsterPattern.length];
    const afterAction = () => {
        monsterTurnIndex++;
        consumeMonsterWeak();

        if (playerHp <= 0) { endBattle(false); return; }
        setTimeout(startPlayerTurn, 300);
    };

    if (action.type === 'attack') fxMonsterAttack(action.value, afterAction);
    else if (action.type === 'shield') fxMonsterShield(action.value, afterAction);
    else if (action.type === 'weaken') fxMonsterWeakenPlayer(action.value, afterAction);
}

function startPlayerTurn() {
    playerShield = equippedBonuses.shieldStart;
    maxMana = BASE_MANA + equippedBonuses.manaMax;
    playerMana = maxMana;

    playerRegenTick();

    hand = [];
    const cardsToDraw = handSize + equippedBonuses.extraDraw;
    for (let i = 0; i < cardsToDraw; i++) {
        const newCard = drawCard();
        if (newCard) hand.push(newCard);
    }
    isPlayerTurn = true;
    hideBanner();
    renderHand();
    if (typeof autoSave === "function") autoSave();
}



/* ============================================================
   MAP INTEGRATION — avvia battaglia dal nodo della mappa
   ============================================================ */
function startBattleFromMap(kind) {
    console.log("[DBG_BATTLE] START", {
        currentBoss: currentBoss ? currentBoss.name : null,
        monsterHp: monsterHp,
        playerMana: playerMana,
        handLength: (typeof hand !== "undefined" ? hand.length : "undef"),
        battleOver: battleOver
    });
    if (typeof hideBanner === "function") hideBanner();

    // Forza la visibilità del game-table (safety)
    document.body.classList.remove("map-open");
    var _gt = document.getElementById("game-table");
    if (_gt) { _gt.style.visibility = ""; _gt.style.opacity = ""; }


    // === RESET ANIMAZIONI MOSTRO/PLAYER ===
    var _monUi = document.querySelector(".monster-ui");
    var _plyUi = document.querySelector(".player-ui");
    [_monUi, _plyUi].forEach(function(el){
        if (!el) return;
        el.classList.remove('hit','glow','burning','poisoned');
        el.getAnimations().forEach(function(a){
            try { a.cancel(); } catch(e){}
        });
        // MAP_FIX_RESET_BRUTAL: rimozione totale stili + reflow forzato
        el.removeAttribute('style');
        void el.offsetWidth;
    });
    // === FINE RESET ANIMAZIONI ===
    // FIX_RESET_AGGRESSIVE: secondo reset ritardato (a prova di blur)
    setTimeout(function(){
        var _mn = document.querySelector(".monster-ui");
        var _pl = document.querySelector(".player-ui");
        [_mn, _pl].forEach(function(el){
            if (!el) return;
            el.getAnimations().forEach(function(a){ try{a.cancel();}catch(e){} });
            el.style.filter = "";
            el.style.transform = "";
            el.style.opacity = "";
        });
    }, 150);
    // FIX_BATTLE_RESET: svuota mano e container vecchi
    handEls = [];
    var _handEl = document.getElementById('hand');
    if (_handEl) _handEl.innerHTML = '';

    try { localStorage.removeItem("db_return_to_battle"); } catch(e){}

    // === RESET VISUALE COMPLETO ===
    // === RESET VISUALE COMPLETO ===
    document.body.classList.remove("map-open");
    var _gt = document.getElementById("game-table");
    if (_gt) { _gt.style.cssText = ""; }
    var _ui = document.querySelectorAll(".monster-ui, .player-ui, .top-center-ui");
    for (var _u = 0; _u < _ui.length; _u++) { _ui[_u].style.cssText = ""; }
    var _hand = document.getElementById("hand");
    if (_hand) { _hand.style.cssText = ""; }
    // Forza visibilità esplicita
    var _monUi = document.querySelector(".monster-ui");
    if (_monUi) {
        _monUi.style.visibility = "visible";
        _monUi.style.opacity = "1";
        _monUi.style.display = "flex";
    }
    // === FINE RESET VISUALE ===

    // Pool: BOSSES (goblin/kraken per ora). Random per ogni scontro.
    // Pool: BOSSES (goblin/kraken per ora). Random per ogni scontro.
    // Pool: BOSSES (goblin/kraken per ora). Random per ogni scontro.
    // Pool: BOSSES (goblin/kraken per ora). Random per ogni scontro.
    // Pool: BOSSES (goblin/kraken per ora). Random per ogni scontro.
    var _pool = (typeof BOSSES !== "undefined" && BOSSES.length) ? BOSSES : [];
    if (_pool.length === 0) { console.error("startBattleFromMap: BOSSES vuoto"); return; }

    var _pickIdx = Math.floor(Math.random() * _pool.length);
    // BOSS_REFERENCE_FIX: riferimento diretto (serve a BOSSES.indexOf)
    currentBoss = _pool[_pickIdx];
    monsterPattern = currentBoss.pattern;
    monsterHp = currentBoss.hp;
    monsterShield = 0;
    monsterTurnIndex = 0;

    burnDamage = 0; burnTicksLeft = 0;
    poisonDamage = 0; poisonTicksLeft = 0;
    monsterWeakTurns = 0; monsterStunTurns = 0;
    playerWeakTurns = 0; playerStrength = 0;
    playerRegenAmount = 0; playerRegenTurns = 0;
    playerShield = equippedBonuses.shieldStart;

    maxMana = BASE_MANA + equippedBonuses.manaMax;
    playerMana = maxMana;

    discardPile = [];
    hand = [];
    initializeDeck();
    var _n = handSize + equippedBonuses.extraDraw;
    for (var _i = 0; _i < _n; _i++) {
        var _c = drawCard();
        if (_c) hand.push(_c);
    }

    isPlayerTurn = true;
    battleOver = false;
    activeCard = null;
    activeCardIndex = -1;
    activeCardData = null;

    // UI
    var _nameEl = document.querySelector(".monster-ui .entity-name");
    if (_nameEl) _nameEl.textContent = currentBoss.name;
    if (typeof renderHand === "function") renderHand();
    if (typeof updateUIStats === "function") updateUIStats();
    if (typeof renderBonusPanel === "function") renderBonusPanel();

    console.log("[DBG_BATTLE] END", {
        currentBoss: currentBoss ? currentBoss.name : null,
        currentBossHp: currentBoss ? currentBoss.hp : null,
        monsterHp: monsterHp,
        playerMana: playerMana,
        maxMana: maxMana,
        handLength: (typeof hand !== "undefined" ? hand.length : "undef"),
        handElsLength: (typeof handEls !== "undefined" ? handEls.length : "undef"),
        handDomCount: document.getElementById("hand") ? document.getElementById("hand").children.length : -1
    });
    // Video di sfondo
    var _bgVideo = document.getElementById("bg-video");
    var _bgSource = document.getElementById("bg-video-source");
    if (_bgVideo && _bgSource && currentBoss.bgVideo) {
        _bgSource.src = currentBoss.bgVideo;
        _bgVideo.load();
        _bgVideo.play().catch(function(){});
    }
}

/* DBG_BATTLE: stato battaglia corrente (usa dalla console) */
window.dbgBattleState = function() {
    var out = {
        currentBoss_name: (typeof currentBoss !== 'undefined' && currentBoss) ? currentBoss.name : 'UNDEF',
        currentBoss_hp: (typeof currentBoss !== 'undefined' && currentBoss) ? currentBoss.hp : 'UNDEF',
        currentBoss_bgVideo: (typeof currentBoss !== 'undefined' && currentBoss) ? currentBoss.bgVideo : 'UNDEF',
        monsterHp: typeof monsterHp !== 'undefined' ? monsterHp : 'UNDEF',
        playerHp: typeof playerHp !== 'undefined' ? playerHp : 'UNDEF',
        playerMana: typeof playerMana !== 'undefined' ? playerMana : 'UNDEF',
        maxMana: typeof maxMana !== 'undefined' ? maxMana : 'UNDEF',
        hand_length: typeof hand !== 'undefined' ? hand.length : 'UNDEF',
        handEls_length: typeof handEls !== 'undefined' ? handEls.length : 'UNDEF',
        hand_dom_count: document.getElementById('hand') ? document.getElementById('hand').children.length : -1,
        battleOver: typeof battleOver !== 'undefined' ? battleOver : 'UNDEF',
        monster_ui_name: (document.querySelector('.monster-ui .entity-name') || {}).textContent,
        monster_ui_hp: (document.getElementById('monster-hp') || {}).textContent,
        monster_ui_maxhp: (document.getElementById('monster-max-hp') || {}).textContent,
        bg_source_src: (document.getElementById('bg-video-source') || {}).src
    };
    console.table(out);
    return out;
};
console.log("[DBG_BATTLE] dbgBattleState() pronto. Chiamala dalla console.");
