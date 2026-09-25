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

// Applica/rimuove la classe "unplayable" alle carte in mano in base al mana
function updatePlayableState() {
    handEls.forEach((el, i) => {
        const card = hand[i];
        if (!card) return;
        const cost = getCardCost(card);
        el.classList.toggle('unplayable', cost > playerMana);
    });
}

function updateUIStats() {
    const deckCountEl = document.getElementById('deck-count');
    if (deckCountEl) deckCountEl.innerText = deck.length;

    const playerHpEl = document.getElementById('player-hp');
    if (playerHpEl) playerHpEl.innerText = playerHp;
    const monsterHpEl = document.getElementById('monster-hp');
    if (monsterHpEl) monsterHpEl.innerText = monsterHp;

    const playerHpBar = document.getElementById('player-hp-bar');
    if (playerHpBar) playerHpBar.style.width = `${(playerHp / 75) * 100}%`;
    const monsterHpBar = document.getElementById('monster-hp-bar');
    if (monsterHpBar) monsterHpBar.style.width = `${(monsterHp / 50) * 100}%`;

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
        monsterWeakEl.innerText = `🔻 Debole: ${monsterWeakTurns} turni`;
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
        playerWeakEl.innerText = `🔻 Debole: ${playerWeakTurns} turni`;
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
            intentEl.innerText = `⚔️ Intento: ${applyMonsterDamageMods(next.value)} Danni`;
        } else if (next.type === 'shield') {
            intentEl.innerText = `🛡️ Intento: +${next.value} Scudo`;
        } else if (next.type === 'weaken') {
            intentEl.innerText = `🔻 Intento: Indebolimento`;
        }
    }

    const playerManaEl = document.getElementById('mana-current');
    if (playerManaEl) playerManaEl.innerText = playerMana;

    updatePlayerShieldUI();
    updatePlayableState();
}

// --- Adatta il font del titolo alla larghezza reale della carta ---
// Usa un canvas per misurare la larghezza reale del testo (con il font corrente)
// e riduce il font-size finché il titolo entra nello spazio disponibile.
function measureTextWidth(text, font) {
    if (!measureTextWidth._canvas) {
        measureTextWidth._canvas = document.createElement('canvas');
        measureTextWidth._ctx = measureTextWidth._canvas.getContext('2d');
    }
    const ctx = measureTextWidth._ctx;
    ctx.font = font;
    return ctx.measureText(text).width;
}

function fitCardTitles() {
    const cards = document.querySelectorAll('.hand-container .card, .deck-grid .card');
    cards.forEach(cardEl => {
        const span = cardEl.querySelector('.card-title');
        const header = span && span.parentElement;
        if (!span || !header) return;

        // Spazio disponibile nell'header (larghezza meno padding)
        const hStyle = getComputedStyle(header);
        const padL = parseFloat(hStyle.paddingLeft) || 0;
        const padR = parseFloat(hStyle.paddingRight) || 0;
        const availW = header.clientWidth - padL - padR;
        if (availW <= 0) return;

        // Reset dello stile precedente
        span.style.fontSize = '';
        span.style.letterSpacing = '';

        // Font-size base da CSS (clamp), letto dal computed style
        const sStyle = getComputedStyle(span);
        let fontSize = parseFloat(sStyle.fontSize) || 12;
        const fontFamily = sStyle.fontFamily;
        const fontWeight = sStyle.fontWeight;
        const text = span.textContent;

        // Riduce il font-size a passi di 0.5px finché il testo entra, con minimo 7px
        let attempts = 0;
        while (attempts < 30) {
            const font = `${fontWeight} ${fontSize}px ${fontFamily}`;
            const w = measureTextWidth(text, font);
            if (w <= availW || fontSize <= 7) break;
            fontSize -= 0.5;
            attempts++;
        }

        // Se dopo aver ridotto il font serve ancora restringere, applica scaleX
        const finalFont = `${fontWeight} ${fontSize}px ${fontFamily}`;
        const finalW = measureTextWidth(text, finalFont);
        span.style.fontSize = fontSize + 'px';
        span.style.letterSpacing = '-0.2px';

        if (finalW > availW && availW > 0) {
            const scale = availW / finalW;
            span.style.transform = `scaleX(${scale})`;
            span.style.transformOrigin = 'left center';
        } else {
            span.style.transform = '';
        }
    });
}

function buildCardElement(cardData, extraClass) {
    const cardElement = document.createElement('div');
    cardElement.className = extraClass ? `card ${extraClass}` : 'card';
    cardElement.innerHTML = `
        <div class="card-cost">${cardData.cost}</div>
        <div class="card-header">
            <span class="card-title">${cardData.title}</span>
        </div>
        <div class="card-art">${cardData.art}</div>
        <div class="card-description">${cardData.desc}</div>
    `;
    return cardElement;
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

let resizeTimer = null;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
        layoutHand();
        fitCardTitles();
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

    // Adatta i titoli dopo che il layout è stato calcolato
    requestAnimationFrame(() => fitCardTitles());

    handContainer.addEventListener('pointerdown', onHandPointerDown);
    updateUIStats();
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

    requestAnimationFrame(() => fitCardTitles());
    updateUIStats();
}

function onHandPointerDown(e) {
    const cardElement = e.target.closest('.card');
    if (!cardElement) return;
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

    requestAnimationFrame(() => fitCardTitles());
}

function showBanner(text) {
    const banner = document.getElementById('turn-banner');
    banner.innerText = text;
    banner.classList.add('visible');
}
function hideBanner() {
    document.getElementById('turn-banner').classList.remove('visible');
}

// --- Listener modale e pulsanti accessori ---
const openDeckBtn = document.getElementById('open-deck-btn');
const closeDeckBtn = document.getElementById('close-deck-btn');
const deckModal = document.getElementById('deck-modal');

if (openDeckBtn && deckModal) {
    openDeckBtn.addEventListener('click', () => {
        renderDeckModal();
        deckModal.classList.add('active');
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
const openMapBtn = document.getElementById('open-map-btn');
if (openEquipBtn) openEquipBtn.addEventListener('click', () => console.log("Equipaggiamento: da implementare"));
if (openMapBtn) openMapBtn.addEventListener('click', () => console.log("Mappa: da implementare"));

// Ri-adatta i titoli dopo il caricamento del font Google
if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => {
        setTimeout(fitCardTitles, 100);
    });
}
