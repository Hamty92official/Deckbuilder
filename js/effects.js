// ============================================================
//  EFFETTI CARTE + IMPATTI + FINE BATTAGLIA
// ============================================================

const ARCANE_HITS = 5, ARCANE_STEP = 90, ARCANE_FALL = 110;
const FIRE_FLIGHT = 420;
const BURN_TICK_DELAY = 400;
const POISON_FLIGHT = 380;
const POISON_TICK_DELAY = 220;

const FX_TIME = {
    slash: 90,
    slash2: 130 + 90,
    slash3: 2 * 130 + 90,
    thrust: 300,
    dagger: 260,
    arrow: 200,
    arrow3: 2 * 100 + 220,
    electric: 480,
    fire: FIRE_FLIGHT + BURN_TICK_DELAY,
    arcane: (ARCANE_HITS - 1) * ARCANE_STEP + ARCANE_FALL,
    shield: 320,
    heal: 320,
    poison: POISON_FLIGHT + POISON_TICK_DELAY,
    weaken: 380,
    stun: 380,
    strength: 320,
    regen: 320,
    cleanse: 320,
    lifesteal: 300,
    potion: 400,
    shieldheal: 420 + 320,
    cleanseheal: 420 + 320,
    dmweak: 90 + 200 + 380,
    poisononly: POISON_FLIGHT + POISON_TICK_DELAY,
    burnonly: FIRE_FLIGHT + BURN_TICK_DELAY
};
const FX_LAUNCH_DELAY = 220;
const FX_SETTLE = 200;
const defaultFx = { damage: 'slash', shield: 'shield', heal: 'heal', utility: 'potion' };

// ---------- Impatti base ----------

function hitMonster(amount, sparkColor, opts = {}) {
    const p = fxPoint(monsterUi);
    const absorbed = opts.ignoreShield ? 0 : Math.min(monsterShield, amount);
    const dealt = amount - absorbed;
    if (!opts.ignoreShield) monsterShield -= absorbed;
    monsterHp = Math.max(0, monsterHp - dealt);
    updateUIStats();

    restartClass(monsterUi, 'hit', 450);
    const jx = (Math.random() - 0.5) * 70 * FX_SCALE;
    if (absorbed > 0) {
        floatText(p.x + jx, p.y + (dealt > 0 ? 26 : -10), `🛡️ -${absorbed}`, 'fx-block');
        glow(monsterUi, '93, 237, 236');
        burst(p.x, p.y, FX_COLOR.shield, 6, 60);
    }
    if (dealt > 0) {
        floatText(p.x + jx, p.y - 10,
            opts.burn ? `🔥 -${dealt}` : opts.poison ? `🧪 -${dealt}` : `-${dealt}`,
            opts.burn ? 'fx-burn' : opts.poison ? 'fx-poison' : 'fx-dmg');
        glow(monsterUi, opts.burn ? '255, 140, 40' : opts.poison ? '169, 107, 220' : '255, 80, 70');
        burst(p.x, p.y, sparkColor, 9, 80);
    }
    return dealt;
}

function hitPlayer(amount) {
    const p = fxPoint(playerUi);
    const absorbed = Math.min(playerShield, amount);
    const dealt = amount - absorbed;
    playerShield -= absorbed;
    playerHp = Math.max(0, playerHp - dealt);
    updateUIStats();

    restartClass(playerUi, 'hit', 450);
    if (absorbed > 0) {
        floatText(p.x, p.y + (dealt > 0 ? 26 : -10), `🛡️ -${absorbed}`, 'fx-block');
        glow(playerUi, '93, 237, 236');
        ring(p.x, p.y, FX_COLOR.shield, 90, 2.4, 500);
        burst(p.x, p.y, FX_COLOR.shield, 8, 70);
    }
    if (dealt > 0) {
        floatText(p.x, p.y - 10, `-${dealt}`, 'fx-dmg');
        glow(playerUi, '255, 80, 70');
        burst(p.x, p.y, FX_COLOR.blood, 10, 90);
        screenFlash('255, 0, 0', 0.5);
    }
}

function shieldBurst(el, value) {
    const p = fxPoint(el);
    const bubble = fxEl('fx-bubble', p.x, p.y);
    fxAnim(bubble, [
        { transform: 'scale(0.35)', opacity: 0 },
        { transform: 'scale(0.9)', opacity: 1, offset: 0.35 },
        { transform: 'scale(1.15)', opacity: 0 }
    ], { duration: 750, easing: 'ease-out' });

    const icon = fxEl('fx-emoji', p.x, p.y, '🛡️');
    fxAnim(icon, [
        { transform: 'scale(0.4)', opacity: 0 },
        { transform: 'scale(1.4)', opacity: 1, offset: 0.3 },
        { transform: 'scale(1.1)', opacity: 1, offset: 0.7 },
        { transform: 'scale(1.3)', opacity: 0 }
    ], { duration: 850, easing: 'ease-out' });

    floatText(p.x, p.y - 40, `+${value} 🛡️`, 'fx-block');
    glow(el, '93, 237, 236');
    burst(p.x, p.y, FX_COLOR.shield, 12, 100);
}

function gainPlayerShield(value) {
    playerShield += value;
    updateUIStats();
    shieldBurst(playerUi, value);
}

function healPlayer(value) {
    const before = playerHp;
    playerHp = Math.min(75, playerHp + value);
    const healed = playerHp - before;
    updateUIStats();

    const p = fxPoint(playerUi);
    ring(p.x, p.y, FX_COLOR.heal, 80, 3, 600);
    floatText(p.x, p.y - 20, healed > 0 ? `+${healed}` : 'Vita al massimo', 'fx-heal');
    glow(playerUi, '93, 240, 138');
    for (let i = 0; i < 10; i++) {
        const sx = p.x + (Math.random() - 0.5) * 230;
        const sy = p.y + 10 + Math.random() * 26;
        const spark = fxEl('fx-sparkle', sx, sy, '✚', FX_COLOR.heal);
        fxAnim(spark, [
            { transform: 'translateY(0) scale(0.5)', opacity: 0 },
            { transform: 'translateY(-22px) scale(1.1)', opacity: 1, offset: 0.3 },
            { transform: `translateY(${-55 - Math.random() * 30}px) scale(0.8)`, opacity: 0 }
        ], { duration: 900, delay: i * 55, easing: 'ease-out' });
    }
}

// ---------- Status effects ----------

function applyBurn(damage, turns) {
    if (monsterHp <= 0) return;
    burnDamage = damage;
    burnTicksLeft = turns;
    updateUIStats();
    const p = fxPoint(monsterUi);
    floatText(p.x, p.y - 52, 'Bruciatura!', 'fx-burn fx-small');
    burnTick();
}

function burnTick() {
    if (burnTicksLeft <= 0 || monsterHp <= 0) return;
    const damage = burnDamage;
    burnTicksLeft--;
    if (burnTicksLeft === 0) burnDamage = 0;
    hitMonster(damage, FX_COLOR.fire, { burn: true, ignoreShield: true });

    const p = fxPoint(monsterUi);
    for (let i = 0; i < 6; i++) {
        const flame = fxEl('fx-sparkle', p.x + (Math.random() - 0.5) * 200, p.y + 20 + Math.random() * 20, '🔥');
        flame.style.fontSize = (14 + Math.random() * 10) + 'px';
        fxAnim(flame, [
            { transform: 'translateY(0) scale(0.6)', opacity: 0 },
            { transform: 'translateY(-18px) scale(1)', opacity: 1, offset: 0.3 },
            { transform: `translateY(${-50 - Math.random() * 30}px) scale(0.6)`, opacity: 0 }
        ], { duration: 800, delay: i * 50, easing: 'ease-out' });
    }
}

function applyPoison(damage, turns) {
    if (monsterHp <= 0) return;
    poisonDamage = damage;
    poisonTicksLeft = turns;
    updateUIStats();
    const p = fxPoint(monsterUi);
    floatText(p.x, p.y - 52, 'Veleno!', 'fx-poison fx-small');
    poisonTick();
}

function poisonTick() {
    if (poisonTicksLeft <= 0 || monsterHp <= 0) return;
    const damage = poisonDamage;
    poisonTicksLeft--;
    if (poisonTicksLeft === 0) poisonDamage = 0;
    hitMonster(damage, FX_COLOR.poison, { poison: true, ignoreShield: true });

    const p = fxPoint(monsterUi);
    for (let i = 0; i < 6; i++) {
        const bubble = fxEl('fx-sparkle', p.x + (Math.random() - 0.5) * 200, p.y + 20 + Math.random() * 20, '🧪');
        bubble.style.fontSize = (14 + Math.random() * 10) + 'px';
        fxAnim(bubble, [
            { transform: 'translateY(0) scale(0.6)', opacity: 0 },
            { transform: 'translateY(-18px) scale(1)', opacity: 1, offset: 0.3 },
            { transform: `translateY(${-50 - Math.random() * 30}px) scale(0.6)`, opacity: 0 }
        ], { duration: 800, delay: i * 50, easing: 'ease-out' });
    }
}

function applyMonsterWeak(turns) {
    monsterWeakTurns = turns;
    updateUIStats();
    const p = fxPoint(monsterUi);
    const icon = fxEl('fx-emoji', p.x, p.y, '⛓️‍💥');
    fxAnim(icon, [
        { transform: 'scale(0.4)', opacity: 0 },
        { transform: 'scale(1.3)', opacity: 1, offset: 0.35 },
        { transform: 'scale(1)', opacity: 1, offset: 0.75 },
        { transform: 'scale(1.1)', opacity: 0 }
    ], { duration: 800, easing: 'ease-out' });
    floatText(p.x, p.y - 40, `Debolezza (${turns} turni)`, 'fx-weak fx-small');
    glow(monsterUi, '154, 165, 177');
}

function applyPlayerStrength(amount) {
    playerStrength += amount;
    updateUIStats();
    const p = fxPoint(playerUi);
    const icon = fxEl('fx-emoji', p.x, p.y, '💪');
    fxAnim(icon, [
        { transform: 'scale(0.4)', opacity: 0 },
        { transform: 'scale(1.4)', opacity: 1, offset: 0.3 },
        { transform: 'scale(1.1)', opacity: 1, offset: 0.7 },
        { transform: 'scale(1.2)', opacity: 0 }
    ], { duration: 850, easing: 'ease-out' });
    floatText(p.x, p.y - 40, `+${amount} 💪`, 'fx-strength');
    glow(playerUi, '255, 143, 60');
    burst(p.x, p.y, FX_COLOR.strength, 10, 90);
}

function applyMonsterStun(turns) {
    monsterStunTurns += turns;
    updateUIStats();
    const p = fxPoint(monsterUi);
    const icon = fxEl('fx-emoji', p.x, p.y, '💫');
    fxAnim(icon, [
        { transform: 'scale(0.4) rotate(0deg)', opacity: 0 },
        { transform: 'scale(1.3) rotate(25deg)', opacity: 1, offset: 0.4 },
        { transform: 'scale(1.1) rotate(-15deg)', opacity: 1, offset: 0.75 },
        { transform: 'scale(1.2) rotate(0deg)', opacity: 0 }
    ], { duration: 850, easing: 'ease-out' });
    floatText(p.x, p.y - 40, 'Stordito!', 'fx-weak');
    glow(monsterUi, '255, 224, 102');
}

function applyPlayerRegen(amount, turns) {
    playerRegenAmount = amount;
    playerRegenTurns = turns;
    updateUIStats();
    const p = fxPoint(playerUi);
    const icon = fxEl('fx-emoji', p.x, p.y, '💚');
    fxAnim(icon, [
        { transform: 'scale(0.4)', opacity: 0 },
        { transform: 'scale(1.3)', opacity: 1, offset: 0.35 },
        { transform: 'scale(1)', opacity: 1, offset: 0.75 },
        { transform: 'scale(1.1)', opacity: 0 }
    ], { duration: 800, easing: 'ease-out' });
    floatText(p.x, p.y - 40, `Rigenerazione (${turns} turni)`, 'fx-heal fx-small');
    glow(playerUi, '93, 240, 138');
}

function playerRegenTick() {
    if (playerRegenTurns <= 0) return;
    const amount = playerRegenAmount;
    playerRegenTurns--;
    if (playerRegenTurns === 0) playerRegenAmount = 0;
    healPlayer(amount);
}

function cleansePlayer() {
    const hadNegative = playerWeakTurns > 0;
    playerWeakTurns = 0;
    updateUIStats();
    const p = fxPoint(playerUi);
    const icon = fxEl('fx-emoji', p.x, p.y, '✨');
    fxAnim(icon, [
        { transform: 'scale(0.4) rotate(0deg)', opacity: 0 },
        { transform: 'scale(1.3) rotate(180deg)', opacity: 1, offset: 0.5 },
        { transform: 'scale(1.1) rotate(320deg)', opacity: 0 }
    ], { duration: 750, easing: 'ease-out' });
    floatText(p.x, p.y - 40, hadNegative ? 'Effetti rimossi!' : 'Nessun effetto da rimuovere', 'fx-heal fx-small');
    glow(playerUi, '93, 240, 138');
    burst(p.x, p.y, FX_COLOR.heal, 10, 90);
}

// ---------- Voli generici ----------

function flyToPlayer(from, html, orbClass, onArrive) {
    const target = fxPoint(playerUi);
    const flight = FX_TIME.shield;
    const el = html ? fxEl('fx-emoji', from.x, from.y, html) : fxEl('fx-orb ' + orbClass, from.x, from.y);
    fxAnim(el, [
        { transform: 'translate(0, 0) scale(1.2)', opacity: 1 },
        { transform: `translate(${target.x - from.x}px, ${target.y - from.y}px) scale(0.8)`, opacity: 1 }
    ], { duration: flight, easing: 'cubic-bezier(0.3, 0, 0.2, 1)' });
    later(flight, onArrive);
}

function flyToMonster(from, html, duration, onArrive) {
    const target = fxPoint(monsterUi);
    const el = fxEl('fx-emoji', from.x, from.y, html);
    fxAnim(el, [
        { transform: 'translate(0, 0) scale(1.2)', opacity: 1 },
        { transform: `translate(${target.x - from.x}px, ${target.y - from.y}px) scale(0.85)`, opacity: 1 }
    ], { duration, easing: 'cubic-bezier(0.3, 0, 0.2, 1)' });
    later(duration, onArrive);
}

// ---------- FX delle singole carte ----------

// Lama diagonale (spade, martelli, mazze)
function fxSlash(card, from, count) {
    const target = fxPoint(monsterUi);
    const angles = [-32, 28, -18];
    const total = applyPlayerDamageMods(card.value);
    splitDamage(total, count).forEach((dmg, i) => {
        const t = i * 130;
        const slash = fxEl('fx-slash', target.x + (i ? 14 : -10) * FX_SCALE, target.y + (i ? -8 : 6) * FX_SCALE);
        slash.style.rotate = `${angles[i % angles.length]}deg`;
        fxAnim(slash, [
            { clipPath: 'inset(0 100% 0 0)', opacity: 1 },
            { clipPath: 'inset(0 0 0 0)', opacity: 1, offset: 0.4 },
            { clipPath: 'inset(0 0 0 0)', opacity: 0 }
        ], { duration: 300, delay: t });
        later(t + 90, () => hitMonster(dmg, FX_COLOR.slash, { ignoreShield: !!card.ignoreShield }));
    });
}

// Affondo con lancia: scia orizzontale che colpisce
function fxThrust(card, from) {
    const target = fxPoint(monsterUi);
    const dx = target.x - from.x, dy = target.y - from.y;
    const angle = Math.atan2(dy, dx);

    const spear = fxEl('fx-spear', from.x, from.y);
    spear.style.rotate = `${angle}rad`;
    fxAnim(spear, [
        { transform: 'translate(0, 0) scaleX(0.3)', opacity: 0 },
        { transform: `translate(${dx * 0.55}px, ${dy * 0.55}px) scaleX(0.9)`, opacity: 1, offset: 0.4 },
        { transform: `translate(${dx}px, ${dy}px) scaleX(1.2)`, opacity: 1, offset: 0.75 },
        { transform: `translate(${dx}px, ${dy}px) scaleX(1.2)`, opacity: 0 }
    ], { duration: 300, easing: 'cubic-bezier(0.3, 0, 0.6, 1)' });

    later(160, () => {
        const dmg = applyPlayerDamageMods(card.value);
        burst(target.x, target.y, FX_COLOR.slash, 8, 70);
        hitMonster(dmg, FX_COLOR.slash, { ignoreShield: !!card.ignoreShield });
    });
}

// Pugnale: colpo rapido e netto, corto
function fxDagger(card) {
    const target = fxPoint(monsterUi);
    const dagger = fxEl('fx-dagger-fx', target.x - 40 * FX_SCALE, target.y);
    dagger.style.rotate = '-15deg';
    fxAnim(dagger, [
        { clipPath: 'inset(0 100% 0 0)', transform: 'translate(-50%, -50%) translateX(-24px)', opacity: 0.6 },
        { clipPath: 'inset(0 0 0 0)', transform: 'translate(-50%, -50%) translateX(0)', opacity: 1, offset: 0.4 },
        { clipPath: 'inset(0 0 0 0)', transform: 'translate(-50%, -50%) translateX(14px)', opacity: 0 }
    ], { duration: 260, easing: 'cubic-bezier(0.4, 0, 0.4, 1)' });
    later(80, () => {
        burst(target.x, target.y, FX_COLOR.slash, 5, 50);
        hitMonster(applyPlayerDamageMods(card.value), FX_COLOR.slash, { ignoreShield: !!card.ignoreShield });
    });
}

// Freccia singola
function fxArrow(card, from) {
    const target = fxPoint(monsterUi);
    const dx = target.x - from.x, dy = target.y - from.y;
    const shot = fxEl('fx-slash', from.x, from.y);
    shot.style.width = '120px';
    shot.style.height = '5px';
    shot.style.rotate = `${Math.atan2(dy, dx)}rad`;
    fxAnim(shot, [
        { transform: 'translate(0, 0)', opacity: 1 },
        { transform: `translate(${dx}px, ${dy}px)`, opacity: 1 }
    ], { duration: FX_TIME.arrow, easing: 'cubic-bezier(0.4, 0, 1, 1)' });
    later(FX_TIME.arrow, () => hitMonster(applyPlayerDamageMods(card.value), FX_COLOR.arrow, { ignoreShield: !!card.ignoreShield }));
}

// 3 frecce in rapida sequenza
function fxArrow3(card, from) {
    const target = fxPoint(monsterUi);
    const dx = target.x - from.x, dy = target.y - from.y;
    const angle = Math.atan2(dy, dx);
    const total = applyPlayerDamageMods(card.value);
    const damages = splitDamage(total, 3);

    damages.forEach((dmg, i) => {
        const delay = i * 100;
        later(delay, () => {
            const shot = fxEl('fx-slash', from.x, from.y);
            shot.style.width = '100px';
            shot.style.height = '4px';
            shot.style.rotate = `${angle}rad`;
            fxAnim(shot, [
                { transform: 'translate(0, 0)', opacity: 1 },
                { transform: `translate(${dx}px, ${dy}px)`, opacity: 1 }
            ], { duration: 220, easing: 'cubic-bezier(0.4, 0, 1, 1)' });
            later(220, () => hitMonster(dmg, FX_COLOR.arrow));
        });
    });
}

// Fulmine elettrico: giallo, dritto dall'alto
function fxElectric(card) {
    const target = fxPoint(monsterUi);
    const x = target.x + (Math.random() - 0.5) * 60 * FX_SCALE;
    const y = target.y;
    const bolt = fxEl('fx-lightning', x, y);
    bolt.style.rotate = `${(Math.random() - 0.5) * 10}deg`;
    fxAnim(bolt, [
        { clipPath: 'inset(0 0 100% 0)', opacity: 1 },
        { clipPath: 'inset(0 0 0 0)', opacity: 1, offset: 0.3 },
        { clipPath: 'inset(0 0 0 0)', opacity: 0 }
    ], { duration: 400 });
    later(80, () => {
        ring(x, y, '#ffeb3b', 50, 2.6, 400);
        burst(x, y, '#ffeb3b', 14, 100);
        screenFlash('255, 235, 59', 0.35);
        hitMonster(applyPlayerDamageMods(card.value), '#ffeb3b');
    });
}

function fxFire(card, from) {
    const target = fxPoint(monsterUi);
    const dx = target.x - from.x, dy = target.y - from.y;
    const flight = FIRE_FLIGHT;

    const orb = fxEl('fx-orb', from.x, from.y);
    fxAnim(orb, [
        { transform: 'translate(0, 0) scale(0.6)' },
        { transform: `translate(${dx}px, ${dy}px) scale(1.25)` }
    ], { duration: flight, easing: 'cubic-bezier(0.45, 0, 0.9, 0.6)' });

    const trail = setInterval(() => {
        if (!orb.isConnected) return;
        const r = orb.getBoundingClientRect();
        const l = fxLayer.getBoundingClientRect();
        const ember = fxEl('fx-dot', r.left - l.left + r.width / 2, r.top - l.top + r.height / 2, '',
                           Math.random() < 0.5 ? FX_COLOR.fire : FX_COLOR.ember);
        const size = (8 + Math.random() * 10) * FX_SCALE;
        ember.style.width = ember.style.height = size + 'px';
        const j = 26 * FX_SCALE;
        fxAnim(ember, [
            { transform: 'translate(0, 0) scale(1)', opacity: 0.9 },
            { transform: `translate(${(Math.random() - 0.5) * j}px, ${(Math.random() - 0.5) * j}px) scale(0.1)`, opacity: 0 }
        ], { duration: 380 });
    }, 28);

    later(flight, () => {
        clearInterval(trail);
        orb.remove();
        ring(target.x, target.y, FX_COLOR.fire, 70, 3.4, 520);
        ring(target.x, target.y, FX_COLOR.ember, 50, 2.2, 420, 80);
        burst(target.x, target.y, FX_COLOR.ember, 14, 120);
        screenFlash('255, 150, 40', 0.35);
        const directDmg = applyPlayerDamageMods(card.value);
        hitMonster(directDmg, FX_COLOR.fire);
        if (card.burnTurns) later(BURN_TICK_DELAY, () => applyBurn(directDmg, card.burnTurns));
    });
}

function fxArcane(card) {
    const target = fxPoint(monsterUi);
    splitDamage(applyPlayerDamageMods(card.value), ARCANE_HITS).forEach((dmg, i) => {
        const x = target.x + (Math.random() - 0.5) * 170 * FX_SCALE;
        const y = target.y + (Math.random() - 0.5) * 50 * FX_SCALE;
        const bolt = fxEl('fx-bolt', x, y);
        bolt.style.rotate = `${(Math.random() - 0.5) * 14}deg`;
        fxAnim(bolt, [
            { clipPath: 'inset(0 0 100% 0)', opacity: 1 },
            { clipPath: 'inset(0 0 0 0)', opacity: 1, offset: 0.4 },
            { clipPath: 'inset(0 0 0 0)', opacity: 0 }
        ], { duration: 330, delay: i * ARCANE_STEP });
        later(i * ARCANE_STEP + ARCANE_FALL, () => {
            ring(x, y, FX_COLOR.arcane, 40, 2.4, 380);
            hitMonster(dmg, FX_COLOR.arcane);
        });
    });
}

function fxPoisonHit(card, from) {
    const target = fxPoint(monsterUi);
    const orb = fxEl('fx-orb', from.x, from.y);
    orb.style.background = 'radial-gradient(circle, #e8d6ff 0%, #a96bdc 45%, rgba(120,50,170,0.85) 65%, rgba(120,50,170,0) 78%)';
    fxAnim(orb, [
        { transform: 'translate(0, 0) scale(0.7)' },
        { transform: `translate(${target.x - from.x}px, ${target.y - from.y}px) scale(1.15)` }
    ], { duration: POISON_FLIGHT, easing: 'cubic-bezier(0.4, 0, 0.8, 0.6)' });
    later(POISON_FLIGHT, () => {
        orb.remove();
        const directDmg = applyPlayerDamageMods(card.value);
        hitMonster(directDmg, FX_COLOR.poison);
        if (card.poisonTurns) {
            const poisonDmg = Math.round(directDmg / 2);
            later(POISON_TICK_DELAY, () => applyPoison(poisonDmg, card.poisonTurns));
        }
    });
}

function fxLifesteal(card) {
    const target = fxPoint(monsterUi);
    const slash = fxEl('fx-slash', target.x, target.y);
    slash.style.rotate = '-18deg';
    fxAnim(slash, [
        { clipPath: 'inset(0 100% 0 0)', opacity: 1 },
        { clipPath: 'inset(0 0 0 0)', opacity: 1, offset: 0.4 },
        { clipPath: 'inset(0 0 0 0)', opacity: 0 }
    ], { duration: 300 });
    later(90, () => {
        const dealt = hitMonster(applyPlayerDamageMods(card.value), FX_COLOR.lifesteal);
        if (dealt > 0) later(120, () => healPlayer(dealt));
    });
}

function fxShieldHeal(card, from) {
    flyToPlayer(from, '🛡️', '', () => gainPlayerShield(card.value));
    later(420, () => flyToPlayer(from, '💚', '', () => healPlayer(card.healValue)));
}

function fxCleanseHeal(card, from) {
    flyToPlayer(from, '✨', '', () => cleansePlayer());
    later(420, () => flyToPlayer(from, '💚', '', () => healPlayer(card.value)));
}

function fxDmWeak(card) {
    const target = fxPoint(monsterUi);
    const slash = fxEl('fx-slash', target.x, target.y);
    fxAnim(slash, [
        { clipPath: 'inset(0 100% 0 0)', opacity: 1 },
        { clipPath: 'inset(0 0 0 0)', opacity: 1, offset: 0.4 },
        { clipPath: 'inset(0 0 0 0)', opacity: 0 }
    ], { duration: 300 });
    later(90, () => {
        hitMonster(applyPlayerDamageMods(card.value), FX_COLOR.slash);
        if (card.weakenValue) later(200, () => applyMonsterWeak(card.weakenValue));
    });
}

function fxPoisonOnly(card, from) {
    const target = fxPoint(monsterUi);
    const orb = fxEl('fx-orb', from.x, from.y);
    orb.style.background = 'radial-gradient(circle, #e8d6ff 0%, #a96bdc 45%, rgba(120,50,170,0.85) 65%, rgba(120,50,170,0) 78%)';
    fxAnim(orb, [
        { transform: 'translate(0, 0) scale(0.7)' },
        { transform: `translate(${target.x - from.x}px, ${target.y - from.y}px) scale(1.15)` }
    ], { duration: POISON_FLIGHT, easing: 'cubic-bezier(0.4, 0, 0.8, 0.6)' });
    later(POISON_FLIGHT, () => {
        orb.remove();
        const poisonDmg = Math.round(applyPlayerDamageMods(card.value) / 2);
        if (card.poisonTurns) applyPoison(poisonDmg, card.poisonTurns);
    });
}

function fxBurnOnly(card, from) {
    const target = fxPoint(monsterUi);
    const dx = target.x - from.x, dy = target.y - from.y;
    const orb = fxEl('fx-orb', from.x, from.y);
    fxAnim(orb, [
        { transform: 'translate(0, 0) scale(0.6)' },
        { transform: `translate(${dx}px, ${dy}px) scale(1.25)` }
    ], { duration: FIRE_FLIGHT, easing: 'cubic-bezier(0.45, 0, 0.9, 0.6)' });
    later(FIRE_FLIGHT, () => {
        orb.remove();
        ring(target.x, target.y, FX_COLOR.fire, 70, 3.4, 520);
        burst(target.x, target.y, FX_COLOR.ember, 12, 100);
        const burnDmg = applyPlayerDamageMods(card.value);
        if (card.burnTurns) later(BURN_TICK_DELAY, () => applyBurn(burnDmg, card.burnTurns));
    });
}

function fxPotion(card, from) {
    const el = fxEl('fx-emoji', from.x, from.y, '🧪');
    fxAnim(el, [
        { transform: 'scale(0.3) rotate(-15deg)', opacity: 0 },
        { transform: 'scale(1.4) rotate(10deg)', opacity: 1, offset: 0.3 },
        { transform: 'scale(1.15) rotate(-5deg)', opacity: 1, offset: 0.7 },
        { transform: 'scale(1.6) rotate(0deg)', opacity: 0 }
    ], { duration: 500, easing: 'ease-out' });
    ring(from.x, from.y, FX_COLOR.heal, 80, 2.6, 550);
    burst(from.x, from.y, FX_COLOR.heal, 14, 110);
}

const fxWeakenCard = (card, from) => flyToMonster(from, '⛓️‍💥', FX_TIME.weaken, () => applyMonsterWeak(card.value));
const fxStunCard = (card, from) => flyToMonster(from, '💫', FX_TIME.stun, () => applyMonsterStun(card.value));
const fxStrengthCard = (card, from) => flyToPlayer(from, '💪', '', () => applyPlayerStrength(card.value));
const fxRegenCard = (card, from) => flyToPlayer(from, '💚', '', () => applyPlayerRegen(card.value, card.regenTurns));
const fxCleanseCard = (card, from) => flyToPlayer(from, '✨', '', () => cleansePlayer());

const cardFx = {
    slash:      (card, from) => fxSlash(card, from, 1),
    slash2:     (card, from) => fxSlash(card, from, 2),
    slash3:     (card, from) => fxSlash(card, from, 3),
    thrust:     fxThrust,
    dagger:     fxDagger,
    arrow:      fxArrow,
    arrow3:     fxArrow3,
    electric:   fxElectric,
    fire:       fxFire,
    arcane:     fxArcane,
    shield:     (card, from) => flyToPlayer(from, '🛡️', '', () => gainPlayerShield(card.value)),
    heal:       (card, from) => flyToPlayer(from, '', 'heal', () => healPlayer(card.value)),
    poison:     fxPoisonHit,
    weaken:     fxWeakenCard,
    strength:   fxStrengthCard,
    stun:       fxStunCard,
    lifesteal:  fxLifesteal,
    regen:      fxRegenCard,
    cleanse:    fxCleanseCard,
    potion:     fxPotion,
    shieldheal: fxShieldHeal,
    cleanseheal:fxCleanseHeal,
    dmweak:     fxDmWeak,
    poisononly: fxPoisonOnly,
    burnonly:   fxBurnOnly
};

const castColor = {
    slash: 'slash', slash2: 'slash', slash3: 'slash',
    thrust: 'slash', dagger: 'slash',
    arrow: 'arrow', arrow3: 'arrow', electric: 'slash',
    fire: 'fire', arcane: 'arcane', shield: 'shield', heal: 'heal',
    poison: 'poison', weaken: 'weak', strength: 'strength', stun: 'stun',
    lifesteal: 'lifesteal', regen: 'heal', cleanse: 'heal', potion: 'heal',
    shieldheal: 'shield', cleanseheal: 'heal', dmweak: 'slash',
    poisononly: 'poison', burnonly: 'fire'
};

function playCardFx(card) {
    const kind = card.fx || defaultFx[card.type];
    let totalMs = 0;

    if (cardFx[kind]) {
        const from = tableCenter();
        later(FX_LAUNCH_DELAY, () => {
            ring(from.x, from.y, FX_COLOR[castColor[kind]], 80, 2.4, 450);
            cardFx[kind](card, from);
        });
        totalMs = FX_LAUNCH_DELAY + FX_TIME[kind] + FX_SETTLE;
    }

    if (card.manaGain) {
        later(FX_LAUNCH_DELAY, () => {
            playerMana += card.manaGain;
            updateUIStats();
            const p = fxPoint(playerUi);
            floatText(p.x, p.y - 30, `+${card.manaGain} 💎`, 'fx-mana');
            ring(p.x, p.y, '#5db9ff', 60, 2, 450);
        });
    }

    if (card.draw) {
        const drawDelay = Math.max(totalMs, FX_LAUNCH_DELAY + 150);
        later(drawDelay, () => drawCards(card.draw));
        totalMs = Math.max(totalMs, drawDelay + 350);
    }
    return totalMs;
}

// ---------- Azioni del boss ----------

function fxMonsterAttack(damage, done) {
    const p = fxPoint(playerUi);
    monsterUi.animate([
        { transform: 'translateX(0) scale(1)' },
        { transform: `translateX(${-70 * FX_SCALE}px) scale(1.07)`, offset: 0.4 },
        { transform: 'translateX(0) scale(1)' }
    ], { duration: 520, easing: 'ease-in-out' });

    later(200, () => {
        [-1, 0, 1].forEach((k, i) => {
            const claw = fxEl('fx-claw', p.x + k * 26 * FX_SCALE, p.y + k * 4 * FX_SCALE);
            claw.style.rotate = '58deg';
            fxAnim(claw, [
                { clipPath: 'inset(0 100% 0 0)', opacity: 1 },
                { clipPath: 'inset(0 0 0 0)', opacity: 1, offset: 0.4 },
                { clipPath: 'inset(0 0 0 0)', opacity: 0 }
            ], { duration: 300, delay: i * 45 });
        });
    });
    later(260, () => {
        if (poisonTicksLeft > 0 && Math.random() < 0.20) {
            floatText(p.x, p.y - 10, 'Mancato!', 'fx-miss');
            ring(p.x, p.y, '#c8d0d5', 60, 1.8, 380);
        } else {
            hitPlayer(applyMonsterDamageMods(damage));
        }
    });
    later(950, done);
}

function fxMonsterStunned(done) {
    const p = fxPoint(monsterUi);
    monsterUi.animate([
        { transform: 'rotate(0deg)' },
        { transform: 'rotate(-4deg)', offset: 0.25 },
        { transform: 'rotate(4deg)', offset: 0.75 },
        { transform: 'rotate(0deg)' }
    ], { duration: 500, easing: 'ease-in-out' });
    floatText(p.x, p.y - 40, 'Stordito: salta il turno!', 'fx-weak fx-small');
    later(900, done);
}

function fxMonsterWeakenPlayer(turns, done) {
    const p = fxPoint(playerUi);
    monsterUi.animate([
        { transform: 'scale(1)' },
        { transform: 'scale(1.05)', offset: 0.4 },
        { transform: 'scale(1)' }
    ], { duration: 450, easing: 'ease-out' });
    later(220, () => {
        playerWeakTurns = turns;
        updateUIStats();
        const icon = fxEl('fx-emoji', p.x, p.y, '⛓️‍💥');
        fxAnim(icon, [
            { transform: 'scale(0.4)', opacity: 0 },
            { transform: 'scale(1.3)', opacity: 1, offset: 0.35 },
            { transform: 'scale(1)', opacity: 1, offset: 0.75 },
            { transform: 'scale(1.1)', opacity: 0 }
        ], { duration: 800, easing: 'ease-out' });
        floatText(p.x, p.y - 40, `Debolezza (${turns} turni)`, 'fx-weak fx-small');
        glow(playerUi, '154, 165, 177');
    });
    later(1000, done);
}

function fxMonsterShield(value, done) {
    monsterUi.animate([
        { transform: 'scale(1)' },
        { transform: 'scale(1.06)', offset: 0.4 },
        { transform: 'scale(1)' }
    ], { duration: 450, easing: 'ease-out' });
    later(200, () => {
        monsterShield += value;
        updateUIStats();
        shieldBurst(monsterUi, value);
    });
    later(1000, done);
}

// ---------- Fine battaglia ----------

function endBattle(playerWon) {
    if (battleOver) return;
    battleOver = true;
    isPlayerTurn = false;
    showBanner(playerWon ? 'Vittoria! 🏆' : 'Sconfitta 💀');

    const loser = playerWon ? monsterUi : playerUi;
    const winner = playerWon ? playerUi : monsterUi;
    const p = fxPoint(loser);

    loser.animate([
        { opacity: 1, transform: 'scale(1) rotate(0deg)', filter: 'blur(0px) brightness(1)' },
        { opacity: 0.7, transform: 'scale(1.08) rotate(-3deg)', filter: 'blur(2px) brightness(1.3)', offset: 0.35 },
        { opacity: 0, transform: 'scale(0.72) rotate(9deg)', filter: 'blur(9px) brightness(1.6)' }
    ], { duration: 1400, easing: 'ease-out', fill: 'forwards' });

    winner.animate([
        { filter: 'brightness(1)' },
        { filter: 'brightness(1.35)', offset: 0.3 },
        { filter: 'brightness(1)', offset: 0.65 },
        { filter: 'brightness(1.25)' },
        { filter: 'brightness(1)' }
    ], { duration: 1600, iterations: 2, easing: 'ease-in-out' });

    if (playerWon) {
        burst(p.x, p.y, '#ffd166', 30, 220);
        burst(p.x, p.y, '#5df08a', 20, 170);
        burst(p.x, p.y, '#ffe066', 15, 260);
        screenFlash('93, 240, 138', 0.3);
    } else {
        burst(p.x, p.y, '#ff5a4d', 28, 200);
        burst(p.x, p.y, '#8b0000', 18, 260);
        screenFlash('255, 0, 0', 0.45);
    }
}
