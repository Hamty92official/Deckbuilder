// ============================================================
//  RENDERING DOM — dipende da data.js e fx-utils.js
// ============================================================

function updatePlayerShieldUI() {
    const hpBarFill = document.getElementById('player-hp-bar');
    const shieldDisplay = document.getElementById('shield-display');
    if (playerShield > 0) {
        hpBarFill.classList.add('shielded');
        shieldDisplay.innerText = ` + ${playerShield} 🛡️`;
    } else {
        hpBarFill.classList.remove('shielded');
        shieldDisplay.innerText = '';
    }
}

function updatePlayableState() {
    handEls.forEach((el, i) => {
        const card = hand[i];
        if (!card) return;
        const cost = getCardCost(card);
        el.classList.toggle('unplayable', cost > playerMana);
    });
}

// ============================================================
//  AGGIORNAMENTO DEI VALORI DINAMICI
// ============================================================
function updateDamageDisplays() {
    handEls.forEach((el, i) => {
        const card = hand[i];
        if (!card) return;

        const dmgSpan = el.querySelector('.dmg-value');
        if (dmgSpan) {
            const hits = getCardHits(card);
            const itemBonus = equippedBonuses.dmgBonus;
            const baseTotal = card.value;
            const baseWithItems = baseTotal + itemBonus;
            const totalModified = applyPlayerDamageMods(card.value);
            const perHit = Math.floor(totalModified / hits);
            dmgSpan.textContent = hits > 1 ? perHit : totalModified;

            dmgSpan.classList.remove('modified-buff', 'modified-debuff');
            if (totalModified > baseWithItems) dmgSpan.classList.add('modified-buff');
            else if (totalModified < baseWithItems) dmgSpan.classList.add('modified-debuff');

            if (playerStrength === 0 && playerWeakTurns === 0 && itemBonus === 0) {
                dmgSpan.dataset.tip = '';
            } else {
                const lines = [];
                if (hits > 1) {
                    lines.push(`<span class="tip-neutral">Base: ${Math.floor(baseTotal / hits)} per colpo (${baseTotal} totale)</span>`);
                } else {
                    lines.push(`<span class="tip-neutral">Base: ${baseTotal}</span>`);
                }
                if (itemBonus > 0) lines.push(`<span class="tip-buff">+${itemBonus} da equipaggiamento</span>`);
                if (playerStrength > 0) lines.push(`<span class="tip-buff">+${playerStrength} da Forza 💪</span>`);
                if (playerWeakTurns > 0) lines.push(`<span class="tip-debuff">−25% da Debolezza ⛓️‍💥</span>`);
                if (hits > 1) {
                    lines.push(`<span class="tip-total">= ${perHit} per colpo (${totalModified} totale)</span>`);
                } else {
                    lines.push(`<span class="tip-total">= ${totalModified}</span>`);
                }
                dmgSpan.dataset.tip = lines.join('<br>');
            }
        }

        const burnSpan = el.querySelector('[data-keyword="burn"]');
        if (burnSpan) {
            const baseTick = card.value;
            const itemBonus = equippedBonuses.dmgBonus;
            const tickDamage = applyPlayerDamageMods(card.value);
            const lines = [];
            lines.push(`<span class="tip-neutral">Ogni turno il nemico subisce il 100% del danno della carta, per 3 turni. Ignora lo scudo.</span>`);
            lines.push('');
            lines.push(`<span class="tip-neutral">Base: ${baseTick} danni per turno</span>`);
            if (itemBonus > 0) lines.push(`<span class="tip-buff">+${itemBonus} da equipaggiamento</span>`);
            if (playerStrength > 0) lines.push(`<span class="tip-buff">+${playerStrength} da Forza 💪</span>`);
            if (playerWeakTurns > 0) lines.push(`<span class="tip-debuff">−25% da Debolezza ⛓️‍💥</span>`);
            lines.push(`<span class="tip-total">= ${tickDamage} danni per turno</span>`);
            burnSpan.dataset.tip = lines.join('<br>');
        }

        const poisonSpan = el.querySelector('[data-keyword="poison"]');
        if (poisonSpan) {
            const baseTick = Math.round(card.value / 2);
            const itemBonus = equippedBonuses.dmgBonus;
            const tickDamage = Math.round(applyPlayerDamageMods(card.value) / 2);
            const lines = [];
            lines.push(`<span class="tip-neutral">Ogni turno il nemico subisce il 50% del danno della carta, per 3 turni. Ignora lo scudo. Il nemico ha il 20% di sbagliare il colpo.</span>`);
            lines.push('');
            lines.push(`<span class="tip-neutral">Base: ${baseTick} danni per turno</span>`);
            if (itemBonus > 0) lines.push(`<span class="tip-buff">+${itemBonus} da equipaggiamento</span>`);
            if (playerStrength > 0) lines.push(`<span class="tip-buff">+${playerStrength} da Forza 💪</span>`);
            if (playerWeakTurns > 0) lines.push(`<span class="tip-debuff">−25% da Debolezza ⛓️‍💥</span>`);
            lines.push(`<span class="tip-total">= ${tickDamage} danni per turno</span>`);
            poisonSpan.dataset.tip = lines.join('<br>');
        }
    });
}

function renderBonusPanel() {
    const panel = document.getElementById('player-bonuses');
    if (!panel) return;

    const rows = [];
    if (equippedBonuses.hpMax > 0) rows.push(`<div class="bonus-item">❤️ ${equippedBonuses.hpMax}</div>`);
    if (equippedBonuses.dmgBonus > 0) rows.push(`<div class="bonus-item">⚔️ ${equippedBonuses.dmgBonus}</div>`);
    if (equippedBonuses.shieldStart > 0) rows.push(`<div class="bonus-item">🛡️ ${equippedBonuses.shieldStart}</div>`);
    if (equippedBonuses.manaMax > 0) rows.push(`<div class="bonus-item">💎 ${equippedBonuses.manaMax}</div>`);
    if (equippedBonuses.regen > 0) rows.push(`<div class="bonus-item">💚 ${equippedBonuses.regen}</div>`);
    if (equippedBonuses.extraDraw > 0) rows.push(`<div class="bonus-item">🎴 ${equippedBonuses.extraDraw}</div>`);

    if (rows.length === 0) {
        panel.style.display = 'none';
        panel.innerHTML = '';
    } else {
        panel.style.display = 'flex';
        panel.innerHTML = rows.join('');
    }
}

function updateUIStats() {
    const deckCountEl = document.getElementById('deck-count');
    if (deckCountEl) deckCountEl.innerText = deck.length;

    const maxHp = getPlayerMaxHp();
    const monsterMaxHp = (typeof currentBoss !== 'undefined' && currentBoss) ? currentBoss.hp : 50;

    const playerHpEl = document.getElementById('player-hp');
    if (playerHpEl) playerHpEl.innerText = playerHp;
    const playerMaxHpEl = document.getElementById('player-max-hp');
    if (playerMaxHpEl) playerMaxHpEl.innerText = maxHp;
    const monsterHpEl = document.getElementById('monster-hp');
    if (monsterHpEl) monsterHpEl.innerText = monsterHp;
    const monsterMaxHpEl = document.getElementById('monster-max-hp');
    if (monsterMaxHpEl) monsterMaxHpEl.innerText = monsterMaxHp;

    const playerHpBar = document.getElementById('player-hp-bar');
    if (playerHpBar) playerHpBar.style.width = `${(playerHp / maxHp) * 100}%`;
    const monsterHpBar = document.getElementById('monster-hp-bar');
    if (monsterHpBar) monsterHpBar.style.width = `${(monsterHp / monsterMaxHp) * 100}%`;

    const monsterShieldEl = document.getElementById('monster-shield-display');
    if (monsterHpBar && monsterShieldEl) {
        monsterHpBar.classList.toggle('shielded', monsterShield > 0);
        monsterShieldEl.innerText = monsterShield > 0 ? ` + ${monsterShield} 🛡️` : '';
    }

    const burnEl = document.getElementById('monster-burn');
    if (burnEl) {
        burnEl.style.display = burnTicksLeft > 0 ? 'flex' : 'none';
        burnEl.innerText = `🔥 Bruciatura: ${burnDamage} × ${burnTicksLeft}`;
    }
    const poisonEl = document.getElementById('monster-poison');
    if (poisonEl) {
        poisonEl.style.display = poisonTicksLeft > 0 ? 'flex' : 'none';
        poisonEl.innerText = `🧪 Veleno: ${poisonDamage} × ${poisonTicksLeft}`;
    }
    monsterUi.classList.toggle('burning', burnTicksLeft > 0);
    monsterUi.classList.toggle('poisoned', poisonTicksLeft > 0);

    const monsterWeakEl = document.getElementById('monster-weak');
    if (monsterWeakEl) {
        monsterWeakEl.style.display = monsterWeakTurns > 0 ? 'flex' : 'none';
        monsterWeakEl.innerText = `⛓️‍💥 Debole: ${monsterWeakTurns} turni`;
    }
    const monsterStunEl = document.getElementById('monster-stun');
    if (monsterStunEl) {
        monsterStunEl.style.display = monsterStunTurns > 0 ? 'flex' : 'none';
        monsterStunEl.innerText = `💫 Stordito: ${monsterStunTurns} turni`;
    }

    const playerStrengthEl = document.getElementById('player-strength');
    if (playerStrengthEl) {
        playerStrengthEl.style.display = playerStrength > 0 ? 'flex' : 'none';
        playerStrengthEl.innerText = `💪 Forza: +${playerStrength}`;
    }
    const playerWeakEl = document.getElementById('player-weak');
    if (playerWeakEl) {
        playerWeakEl.style.display = playerWeakTurns > 0 ? 'flex' : 'none';
        playerWeakEl.innerText = `⛓️‍💥 Debole: ${playerWeakTurns} turni`;
    }
    const playerRegenEl = document.getElementById('player-regen');
    if (playerRegenEl) {
        playerRegenEl.style.display = playerRegenTurns > 0 ? 'flex' : 'none';
        playerRegenEl.innerText = `💚 Rigenera: ${playerRegenAmount} × ${playerRegenTurns}`;
    }

    const intentEl = document.getElementById('monster-intent');
    if (intentEl) {
        const next = monsterPattern[monsterTurnIndex % monsterPattern.length];
        if (monsterStunTurns > 0) {
            intentEl.innerText = `💫 Stordito`;
        } else if (next.type === 'attack') {
            intentEl.innerText = `⚔️ Intento: ${applyMonsterDamageMods(next.value)} ⚔️`;
        } else if (next.type === 'shield') {
            intentEl.innerText = `🛡️ Intento: ${next.value} 🛡️`;
        } else if (next.type === 'weaken') {
            intentEl.innerText = `⛓️‍💥 Intento: Debolezza`;
        }
    }

    const playerManaEl = document.getElementById('mana-current');
    if (playerManaEl) playerManaEl.innerText = playerMana;
    const manaMaxEl = document.getElementById('mana-max');
    if (manaMaxEl) manaMaxEl.innerText = maxMana;

    updatePlayerShieldUI();
    updatePlayableState();
    updateDamageDisplays();
}

function fitCardTitles() {
    document.querySelectorAll('.hand-container .card-title, .deck-grid .card-title').forEach(span => {
        span.style.removeProperty('font-size');
        span.style.removeProperty('letter-spacing');
    });
}

function buildCardElement(cardData, extraClass) {
    const hits = getCardHits(cardData);
    const basePerHit = Math.floor(cardData.value / hits);
    const descHtml = cardData.desc.replace(
        '{DMG}',
        `<span class="dmg-value" data-tip="">${basePerHit}</span>`
    );

    const cardElement = document.createElement('div');
    cardElement.className = extraClass ? `card ${extraClass}` : 'card';
    cardElement.innerHTML = `
        <div class="corner tl"></div><div class="corner tr"></div><div class="corner bl"></div><div class="corner br"></div><div class="card-cost">${cardData.cost}</div>
        <div class="card-header">
            <span class="card-title">${cardData.title}</span>
        </div>
        <div class="card-art">${cardData.art}</div>
        <div class="card-description">${descHtml}</div>
    `;
    return cardElement;
}

let handHitBoxes = [];

function computeHandHitBoxes() {
    const container = document.getElementById('hand');
    if (!container || handEls.length === 0) {
        handHitBoxes = [];
        return;
    }
    const cRect = container.getBoundingClientRect();

    handHitBoxes = handEls.map(el => {
        const tx = parseFloat(el.style.getPropertyValue('--tx')) || 0;
        const ty = parseFloat(el.style.getPropertyValue('--ty')) || 0;
        const rotDeg = parseFloat(el.style.getPropertyValue('--rot')) || 0;
        const w = el.offsetWidth;
        const h = el.offsetHeight;
        return {
            bx: cRect.left + cRect.width / 2 + tx,
            by: cRect.bottom + ty,
            w, h,
            rotRad: rotDeg * Math.PI / 180
        };
    });
}

function pointInCard(px, py, box) {
    const { bx, by, w, h, rotRad } = box;
    const cos = Math.cos(rotRad);
    const sin = Math.sin(rotRad);
    const cx = bx + (h / 2) * sin;
    const cy = by - (h / 2) * cos;
    const dx = px - cx;
    const dy = py - cy;
    const rx =  dx * cos + dy * sin;
    const ry = -dx * sin + dy * cos;
    return Math.abs(rx) <= w / 2 && Math.abs(ry) <= h / 2;
}

function updateHandHover(mx, my) {
    if (activeCard) return;
    if (handHitBoxes.length !== handEls.length) {
        clearHandHover();
        return;
    }
    let hoveredIdx = -1;
    for (let i = handEls.length - 1; i >= 0; i--) {
        if (pointInCard(mx, my, handHitBoxes[i])) {
            hoveredIdx = i;
            break;
        }
    }
    handEls.forEach((el, i) => {
        el.classList.toggle('hovered', i === hoveredIdx);
    });
}

function clearHandHover() {
    handEls.forEach(el => el.classList.remove('hovered'));
}

function layoutHand() {
    const n = handEls.length;
    if (n === 0) return;

    const cardWidth = handEls[0].getBoundingClientRect().width || 180;
    const cardHeight = cardWidth * (260 / 180);
    const overlapFactor = n > 5 ? 0.5 : 0.83;
    const angleStep = Math.max(3, Math.min(6, 30 / n));

    const maxAngleRad = ((n - 1) / 2) * angleStep * Math.PI / 180;
    const outerHalfSpan = (cardWidth * Math.abs(Math.cos(maxAngleRad)) + cardHeight * Math.abs(Math.sin(maxAngleRad))) / 2;
    const maxCenterSpread = Math.max(0, window.innerWidth * 0.9 - 2 * outerHalfSpan);
    const spacing = Math.min(cardWidth * overlapFactor, n > 1 ? maxCenterSpread / (n - 1) : maxCenterSpread);

    handEls.forEach((el, i) => {
        const o = i - (n - 1) / 2;
        el.style.setProperty('--rot', `${o * angleStep}deg`);
        el.style.setProperty('--tx', `${o * spacing}px`);
        el.style.setProperty('--ty', `${-cardWidth * 0.03 + cardWidth * 0.021 * o * o}px`);
    });
}

let _hitboxTimer = null;
function scheduleComputeHitBoxes(delay) {
    clearTimeout(_hitboxTimer);
    _hitboxTimer = setTimeout(computeHandHitBoxes, delay || 700);
}

let resizeTimer = null;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
        layoutHand();
        fitCardTitles();
        scheduleComputeHitBoxes(400);
    }, 120);
});

function renderHand() {
    const handContainer = document.getElementById('hand');
    if (!handContainer) return;
    handContainer.innerHTML = '';
    handEls = [];

    hand.forEach((cardData) => {
        const cardElement = buildCardElement(cardData, 'card-enter');
        handContainer.appendChild(cardElement);
        handEls.push(cardElement);
    });

    layoutHand();
    void handContainer.offsetWidth;

    const els = [...handEls];
    els.forEach((el, i) => {
        el.style.transitionDelay = `${i * 70}ms`;
        el.classList.remove('card-enter');
    });
    setTimeout(() => els.forEach(el => { el.style.transitionDelay = ''; }), 450 + els.length * 70);

    handContainer.addEventListener('pointerdown', onHandPointerDown);
    updateUIStats();
    scheduleComputeHitBoxes(800);
}

function drawCards(n) {
    const handContainer = document.getElementById('hand');
    if (!handContainer) return;

    const newCards = [];
    for (let i = 0; i < n; i++) {
        const c = drawCard();
        if (c) newCards.push(c);
    }
    if (newCards.length === 0) return;

    const newEls = [];
    newCards.forEach(cardData => {
        hand.push(cardData);
        const el = buildCardElement(cardData, 'card-enter');
        handContainer.appendChild(el);
        handEls.push(el);
        newEls.push(el);
    });

    layoutHand();
    void handContainer.offsetWidth;

    newEls.forEach((el, i) => {
        el.style.transitionDelay = `${i * 70}ms`;
        el.classList.remove('card-enter');
    });
    setTimeout(() => newEls.forEach(el => { el.style.transitionDelay = ''; }), 450 + newEls.length * 70);

    updateUIStats();
    scheduleComputeHitBoxes(800);
}

function onHandPointerDown(e) {
    const cardElement = e.target.closest('.card');
    if (!cardElement) return;
    if (e.target.closest('.kw')) return;
    if (e.target.closest('.dmg-value')) return;
    if (cardElement.classList.contains('unplayable')) return;
    const index = handEls.indexOf(cardElement);
    if (index === -1) return;
    startDrag(e, cardElement, hand[index], index);
}

function renderDeckModal() {
    const deckGrid = document.getElementById('deck-grid');
    if (!deckGrid) return;
    deckGrid.innerHTML = '';

    if (deck.length === 0) {
        deckGrid.innerHTML = '<div style="color: #7f8c8d; font-style: italic; padding: 20px;">Il mazzo è attualmente vuoto.</div>';
        return;
    }
    deck.forEach((cardData) => deckGrid.appendChild(buildCardElement(cardData)));
}

function showBanner(text) {
    const banner = document.getElementById('turn-banner');
    banner.innerText = text;
    banner.classList.add('visible');
}
function hideBanner() {
    document.getElementById('turn-banner').classList.remove('visible');
}

// ============================================================
//  DROP BOTTINO DOPO LA VITTORIA
// ============================================================

let battleDropItem = null;

function getBattleDropRarityColor(rarity) {
    return {
        comune: 'var(--rarity-common)',
        raro: 'var(--rarity-rare)',
        epico: 'var(--rarity-epic)',
        leggendario: 'var(--rarity-legendary)'
    }[rarity] || 'var(--moon)';
}

function getBattleDropRarityGlow(rarity) {
    return {
        comune: 'rgba(138,155,181,0.28)',
        raro: 'rgba(93,185,255,0.38)',
        epico: 'rgba(208,112,224,0.42)',
        leggendario: 'rgba(240,168,64,0.5)'
    }[rarity] || 'rgba(200,224,240,0.25)';
}

function getBattleDropSlotName(slot) {
    return {
        head: 'Testa',
        amulet: 'Amuleto',
        ring: 'Anello',
        shield: 'Scudo',
        chest: 'Pettorina',
        necklace: 'Collana',
        pet: 'Pet',
        weapon: 'Arma'
    }[slot] || slot;
}

function showBattleDrop(item) {
    const modal = document.getElementById('battle-drop-modal');
    const stage = document.getElementById('battle-drop-stage');
    if (!modal || !stage || !item) return;

    battleDropItem = item;
    const rarityColor = getBattleDropRarityColor(item.rarity);
    const rarityGlow = getBattleDropRarityGlow(item.rarity);
    let particlesHTML = '';
    for (let i = 0; i < 12; i++) {
        const angle = (i / 12) * Math.PI * 2;
        const dist = 180 + Math.random() * 80;
        const px = Math.cos(angle) * dist;
        const py = Math.sin(angle) * dist;
        particlesHTML += `<div class="drop-particle" style="--px:${px}px; --py:${py}px;"></div>`;
    }

    stage.innerHTML = `
        <div class="drop-title">Bottino</div>
        <div class="drop-subtitle">Il nemico ha lasciato cadere qualcosa...</div>
        <div class="drop-emoji-wrap" style="--rarity:${rarityColor}; --rarity-glow:${rarityGlow};">
            <div class="drop-impact" style="border-color:${rarityColor};"></div>
            <div class="drop-particles" style="--rarity:${rarityColor}; --rarity-glow:${rarityGlow};">${particlesHTML}</div>
            <div class="drop-emoji">${item.icon}</div>
        </div>
        <div class="drop-info">
            <div class="drop-rarity-badge" style="--rarity:${rarityColor}; --rarity-glow:${rarityGlow};">${item.rarity}</div>
            <div class="drop-name">${item.name}</div>
            <div class="drop-slot-type">${getBattleDropSlotName(item.slot)}</div>
            <div class="drop-effect" style="--rarity:${rarityColor}; --rarity-glow:${rarityGlow};"><b>${item.effect}</b></div>
        </div>
        <button class="drop-collect-btn" id="battle-drop-collect">Raccogli</button>
    `;

    modal.classList.add('active');
    document.getElementById('battle-drop-collect')?.addEventListener('click', collectBattleDrop, { once: true });
}

function getUnseenEquipCount() {
    if (typeof localStorage === 'undefined') return 0;
    const value = Number.parseInt(localStorage.getItem('db_unseen_items') || '0', 10);
    return Number.isFinite(value) && value > 0 ? value : 0;
}

function updateEquipNotification() {
    const badge = document.getElementById('equip-unseen-count');
    if (!badge) return;
    const count = getUnseenEquipCount();
    badge.textContent = count;
    badge.style.display = count > 0 ? 'block' : 'none';
}

function addUnseenEquipItem() {
    const next = getUnseenEquipCount() + 1;
    try { localStorage.setItem('db_unseen_items', String(next)); } catch (e) {}
    updateEquipNotification();
}

function markEquipItemsSeen() {
    try { localStorage.setItem('db_unseen_items', '0'); } catch (e) {}
    updateEquipNotification();
}


const openDeckBtn = document.getElementById('open-deck-btn');
const closeDeckBtn = document.getElementById('close-deck-btn');
const deckModal = document.getElementById('deck-modal');

if (openDeckBtn && deckModal) {
    openDeckBtn.addEventListener('click', () => {
        renderDeckModal();
        deckModal.classList.add('active');
        setTimeout(() => document.getElementById('deck-grid')?._updateScrollHint?.(), 80);
    });
}
if (closeDeckBtn && deckModal) {
    closeDeckBtn.addEventListener('click', () => deckModal.classList.remove('active'));
}
if (deckModal) {
    deckModal.addEventListener('click', (e) => {
        if (e.target === deckModal) deckModal.classList.remove('active');
    });
}

const openEquipBtn = document.getElementById('open-equip-btn');

/* ============================================================
   COLLECT DROP — versione sicura (post-victory → mappa)
   ============================================================ */

/* ============================================================
   COLLECT DROP — versione sicura
   ============================================================ */
function collectBattleDrop() {
    if (!battleDropItem || typeof LootSystem === 'undefined') return;

    const inventory = LootSystem.getInventory();
    let emptyIdx = -1;
    for (let i = 0; i < Math.max(inventory.length, 30); i++) {
        if (!inventory[i]) { emptyIdx = i; break; }
    }
    if (emptyIdx === -1) emptyIdx = inventory.length;
    inventory[emptyIdx] = battleDropItem;
    LootSystem.saveInventory(inventory);
    if (typeof addUnseenEquipItem === 'function') addUnseenEquipItem();

    const modal = document.getElementById('battle-drop-modal');
    if (modal) modal.classList.remove('active');
    battleDropItem = null;

    setTimeout(() => {
        if (typeof MapSystem !== 'undefined' && MapSystem.openInstant) {
            console.log('[collectBattleDrop] apro mappa');
            MapSystem.openInstant();
        } else {
            console.warn('[collectBattleDrop] MapSystem non disponibile');
        }
    }, 400);
}

/* ============================================================
   BOTTONE EQUIP — salva flag se stiamo combattendo
   ============================================================ */
(function(){
    var btn = document.getElementById('open-equip-btn');
    if (!btn) return;

    btn.addEventListener('click', function(){
        // Se la mappa NON è aperta, siamo in battaglia → salva flag
        var mapActive = false;
        try {
            var overlay = document.getElementById('map-overlay');
            mapActive = overlay && overlay.classList.contains('active');
        } catch(e) {}
        if (!mapActive) {
            try { localStorage.setItem('db_return_to_battle', '1'); } catch(e){}
            // Autosalva lo stato della battaglia corrente
            try { if (typeof autoSave === 'function') autoSave(); } catch(e){}
            console.log('[equip] flag db_return_to_battle impostato');
        } else {
            try { localStorage.removeItem('db_return_to_battle'); } catch(e){}
        }
        // Vai a equip.html
        window.location.href = 'equip.html';
    });
})();

/* ============================================================
   BOTTONE MAPPA — view-only durante la battaglia
   ============================================================ */
(function(){
    var btn = document.getElementById('open-map-btn');
    if (!btn) {
        console.warn('[map-btn] #open-map-btn non trovato');
        return;
    }

    btn.addEventListener('click', function(){
        console.log('[map-btn] click');
        if (typeof MapSystem === 'undefined') {
            console.warn('[map-btn] MapSystem non disponibile');
            return;
        }
        // Se la mappa è già aperta, chiudila
        if (MapSystem.isActive && MapSystem.isActive()) {
            console.log('[map-btn] chiudo mappa');
            if (MapSystem.hide) MapSystem.hide();
            return;
        }
        // Altrimenti apri in view-only
        if (MapSystem.openViewOnly) {
            console.log('[map-btn] apro mappa view-only');
            MapSystem.openViewOnly();
        } else if (MapSystem.openInstant) {
            console.log('[map-btn] apro mappa (fallback openInstant)');
            MapSystem.openInstant({ viewOnly: true });
        } else {
            console.warn('[map-btn] nessuna funzione open disponibile');
        }
    });
    console.log('[map-btn] handler registrato');
})();
