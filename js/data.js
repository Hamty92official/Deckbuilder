// ============================================================
//  DATI, STATO E FUNZIONI PURE — nessuna dipendenza esterna
// ============================================================

const KEYWORD_TIPS = {
    "Bruciatura": "Danno nel tempo: ogni turno il nemico subisce il 100% del danno della carta, per 3 turni. Ignora lo scudo.",
    "Veleno": "Danno nel tempo: ogni turno il nemico subisce il 50% del danno della carta, per 3 turni. Ignora lo scudo. Il nemico ha il 20% di sbagliare il colpo.",
    "Debolezza": "Riduce i danni inflitti del 25%.",
    "Stordisci": "Il nemico salta il prossimo turno.",
    "Ignora lo scudo": "Il danno non viene bloccato dallo scudo del nemico.",
    "Forza": "Aumenta i danni delle tue carte d'attacco per il resto dello scontro. Vale anche per i tick di Bruciatura e Veleno.",
    "Rigenerazione": "Cura te all'inizio di ogni turno per la durata indicata."
};

function kw(text, tipKey, keywordId) {
    const tip = KEYWORD_TIPS[tipKey] || "";
    const kwAttr = keywordId ? ` data-keyword="${keywordId}"` : "";
    return `<span class="kw"${kwAttr} data-tip="${tip}">${text}</span>`;
}

const cardDatabase = [
    // ---------- ATTACCO ----------
    { cost: "💎",     title: "Taglio Rapido",      art: "Spada",           desc: "Infligge {DMG} danni ⚔️",                                fx: "slash",     type: "damage", value: 6 },
    { cost: "💎",     title: "Affondo Lineare",    art: "Lancia",          desc: "Infligge {DMG} danni ⚔️",                                fx: "slash",     type: "damage", value: 5 },
    { cost: "💎",     title: "Colpo Furtivo",      art: "Pugnale",         desc: "Infligge {DMG} danni ⚔️. " + kw("Ignora lo scudo", "Ignora lo scudo"),         fx: "slash",     type: "damage", value: 4, ignoreShield: true },
    { cost: "💎",     title: "Affondo Rapido",     art: "Pugnale",         desc: "Infligge {DMG} danni ⚔️. Pesca 1 carta 🎴",              fx: "slash2",    type: "damage", value: 4, draw: 1 },
    { cost: "💎",     title: "Tiro Preciso",       art: "Arco",            desc: "Infligge {DMG} danni ⚔️. " + kw("Ignora lo scudo", "Ignora lo scudo"),         fx: "arrow",     type: "damage", value: 8, ignoreShield: true },
    { cost: "💎💎",   title: "Doppio Taglio",      art: "Spade",           desc: "Infligge {DMG} danni ⚔️ due volte",                       fx: "slash2",    type: "damage", value: 8 },
    { cost: "💎💎",   title: "Scarica Elettrica",  art: "Saetta",          desc: "Infligge {DMG} danni ⚔️",                               fx: "slash",     type: "damage", value: 10 },
    { cost: "💎💎",   title: "Frecce Multiple",    art: "Frecce",          desc: "Infligge {DMG} danni ⚔️ tre volte",                       fx: "slash3",    type: "damage", value: 9 },
    { cost: "💎💎",   title: "Perforazione Letale",art: "Lancia",          desc: "Infligge {DMG} danni ⚔️. " + kw("Ignora lo scudo", "Ignora lo scudo"),         fx: "arrow",     type: "damage", value: 7, ignoreShield: true },
    { cost: "💎💎",   title: "Fiamma Divorante",   art: "Fiamma",          desc: "Infligge {DMG} danni ⚔️. Applica " + kw("Bruciatura 🔥", "Bruciatura", "burn"),        fx: "fire",      type: "damage", value: 3, burnTurns: 3 },
    { cost: "💎💎",   title: "Morso Velenoso",     art: "Fiala",           desc: "Infligge {DMG} danni ⚔️. Applica " + kw("Veleno 🧪", "Veleno", "poison"),                fx: "poison",    type: "damage", value: 6, poisonTurns: 3 },
    { cost: "💎💎",   title: "Falce Mietitrice",   art: "Falce",           desc: "Infligge {DMG} danni ⚔️. Cura te di altrettanti ❤️",     fx: "lifesteal", type: "damage", value: 5, lifesteal: true },
    { cost: "💎💎💎", title: "Tempesta Arcana",    art: "Tempesta",        desc: "Infligge {DMG} danni ⚔️ cinque volte",                    fx: "arcane",    type: "damage", value: 20 },
    { cost: "💎💎💎", title: "Colpo Devastante",   art: "Martello",        desc: "Infligge {DMG} danni ⚔️",                               fx: "slash",     type: "damage", value: 15 },
    { cost: "💎💎💎", title: "Assalto Brutale",    art: "Armi",            desc: "Infligge {DMG} danni ⚔️ tre volte",                       fx: "slash3",    type: "damage", value: 18 },

    // ---------- SCUDO ----------
    { cost: "💎",     title: "Scudo Saldo",        art: "Scudo",           desc: "Ottieni 5 scudo 🛡️",                                 fx: "shield",     type: "shield", value: 5 },
    { cost: "💎",     title: "Barriera Fluida",    art: "Scudo",           desc: "Ottieni 4 scudo 🛡️. Pesca 1 carta 🎴",               fx: "shield",     type: "shield", value: 4, draw: 1 },
    { cost: "💎💎",   title: "Muraglia Eterna",    art: "Muro",            desc: "Ottieni 11 scudo 🛡️",                                fx: "shield",     type: "shield", value: 11 },
    { cost: "💎💎",   title: "Riparo Curativo",    art: "Riparo",          desc: "Ottieni 7 scudo 🛡️. Cura 4 ❤️",                      fx: "shieldheal", type: "shield", value: 7, healValue: 4 },
    { cost: "💎💎💎", title: "Fortezza Eterna",    art: "Fortezza",        desc: "Ottieni 18 scudo 🛡️",                                fx: "shield",     type: "shield", value: 18 },

    // ---------- CURA ----------
    { cost: "💎",     title: "Soffio Vitale",      art: "Elisir",          desc: "Cura 4 ❤️",                                          fx: "heal",       type: "heal", value: 4 },
    { cost: "💎💎",   title: "Elisir Curativo",    art: "Elisir",          desc: "Cura 6 ❤️",                                          fx: "heal",       type: "heal", value: 6 },
    { cost: "💎💎",   title: "Benedizione Divina", art: "Foglia",          desc: "Cura 5 ❤️. Pesca 1 carta 🎴",                        fx: "heal",       type: "heal", value: 5, draw: 1 },
    { cost: "💎💎",   title: "Fonte Vitale",       art: "Foglia",          desc: kw("Rigenerazione 💚", "Rigenerazione") + " 4 per 3 turni",       fx: "regen",      type: "regen", value: 4, regenTurns: 3 },
    { cost: "💎💎💎", title: "Guarigione Suprema", art: "Fonte",           desc: "Cura 15 ❤️",                                         fx: "heal",       type: "heal", value: 15 },

    // ---------- UTILITÀ ----------
    { cost: "💎",     title: "Pozione Arcana",     art: "Pozione",         desc: "Pesca 2 carte 🎴. Ottieni 1 💎",                     fx: "potion",     type: "utility", draw: 2, manaGain: 1 },
    { cost: "💎",     title: "Focus Mentale",      art: "Tomo",            desc: "Pesca 3 carte 🎴. Ottieni 1 💎",                     fx: "potion",     type: "utility", draw: 3, manaGain: 1 },
    { cost: "💎",     title: "Luce Purificatrice", art: "Stella",          desc: "Rimuove i tuoi effetti negativi",                    fx: "cleanse",    type: "cleanse" },
    { cost: "💎💎",   title: "Faro Ispirante",     art: "Faro",            desc: "Pesca 2 carte 🎴. Cura 3 ❤️. Ottieni 1 💎",           fx: "heal",       type: "utility", value: 3, draw: 2, manaGain: 1 },
    { cost: "💎💎",   title: "Panacea Suprema",    art: "Calice",          desc: "Rimuove i tuoi effetti negativi. Cura 5 ❤️",         fx: "cleanseheal",type: "cleanse", value: 5 },

    // ---------- BUFF / DEBUFF ----------
    { cost: "💎",     title: "Potere Marziale",    art: "Pugno",           desc: kw("Forza 💪", "Forza") + " +2",                              fx: "strength", type: "strength", value: 2 },
    { cost: "💎",     title: "Sortilegio Fioco",   art: "Catene",          desc: "Applica " + kw("Debolezza ⛓️‍💥", "Debolezza") + " per 2 turni",       fx: "weaken",   type: "weaken", value: 2 },
    { cost: "💎💎",   title: "Maledizione Oscura", art: "Teschio",         desc: "Applica " + kw("Debolezza ⛓️‍💥", "Debolezza") + " per 3 turni",       fx: "weaken",   type: "weaken", value: 3 },
    { cost: "💎💎",   title: "Colpo Stordente",    art: "Martello",        desc: kw("Stordisci 💫", "Stordisci") + " il nemico",                 fx: "stun",     type: "stun", value: 1 },
    { cost: "💎💎💎", title: "Furia Primordiale",  art: "Fiamma",          desc: kw("Forza 💪", "Forza") + " +5",                              fx: "strength", type: "strength", value: 5 },
    { cost: "💎💎💎", title: "Terrore Abissale",   art: "Spettro",         desc: kw("Stordisci 💫", "Stordisci") + " il nemico per 2 turni",      fx: "stun",     type: "stun", value: 2 },

    // ---------- STATUS (solo DoT) ----------
    { cost: "💎💎",   title: "Tossina Pura",       art: "Fiala",           desc: "Applica " + kw("Veleno 🧪", "Veleno", "poison"),                                fx: "poisononly", type: "poison", value: 4, poisonTurns: 3 },
    { cost: "💎💎💎", title: "Combustione Ardente",art: "Braciere",        desc: "Applica " + kw("Bruciatura 🔥", "Bruciatura", "burn"),                        fx: "burnonly",   type: "burn",   value: 6, burnTurns: 3 },

    // ---------- MISTI ----------
    { cost: "💎💎",   title: "Assalto Debilitante",art: "Mazza",           desc: "Infligge {DMG} danni ⚔️. Applica " + kw("Debolezza ⛓️‍💥", "Debolezza") + " per 2 turni", fx: "dmweak", type: "damage", value: 4, weakenValue: 2 },
    { cost: "💎💎",   title: "Colpo Fiammeggiante",art: "Spada Infuocata", desc: "Infligge {DMG} danni ⚔️. Pesca 1 carta 🎴",                       fx: "slash",  type: "damage", value: 8, draw: 1 }
];

const CARD_COPIES = {
    "Taglio Rapido": 2, "Affondo Lineare": 2, "Scudo Saldo": 2, "Barriera Fluida": 2,
    "Affondo Rapido": 2, "Pozione Arcana": 2, "Soffio Vitale": 2, "Potere Marziale": 2,
    "Sortilegio Fioco": 2, "Fiamma Divorante": 2, "Morso Velenoso": 2, "Luce Purificatrice": 2,
};

// ---------- STATO GLOBALE ----------
let deck = [];
let discardPile = [];
let hand = [];
let handEls = [];

let playerShield = 0;
let playerHp = 75;
let monsterHp = 50;
let playerMana = 3;
const maxMana = 3;

const handSize = 5;
const monsterPattern = [
    { type: 'attack', value: 6 },
    { type: 'attack', value: 6 },
    { type: 'shield', value: 8 },
    { type: 'weaken', value: 2 }
];
let monsterTurnIndex = 0;
let monsterShield = 0;

let burnDamage = 0;
let burnTicksLeft = 0;

let poisonDamage = 0;
let poisonTicksLeft = 0;

const WEAK_REDUCTION = 0.25;
let monsterWeakTurns = 0;
let playerWeakTurns = 0;

let monsterStunTurns = 0;
let playerStrength = 0;

let playerRegenAmount = 0;
let playerRegenTurns = 0;

let isPlayerTurn = true;
let battleOver = false;

// ---------- FUNZIONI PURE ----------

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function initializeDeck() {
    deck = [];
    cardDatabase.forEach(card => {
        const n = CARD_COPIES[card.title] || 1;
        for (let i = 0; i < n; i++) deck.push({ ...card });
    });
    shuffle(deck);
}

function drawCard() {
    if (deck.length === 0) {
        if (discardPile.length === 0) return null;
        deck = [...discardPile];
        discardPile = [];
        shuffle(deck);
    }
    return deck.pop();
}

function getCardCost(cardData) {
    return [...cardData.cost].length;
}

function getCardHits(card) {
    switch (card.fx) {
        case 'slash2': return 2;
        case 'slash3': return 3;
        case 'arcane': return 5;
        default: return 1;
    }
}

function applyPlayerDamageMods(baseDamage) {
    let dmg = baseDamage + playerStrength;
    if (playerWeakTurns > 0) dmg = Math.round(dmg * (1 - WEAK_REDUCTION));
    return Math.max(0, dmg);
}

function applyMonsterDamageMods(baseDamage) {
    return monsterWeakTurns > 0 ? Math.round(baseDamage * (1 - WEAK_REDUCTION)) : baseDamage;
}
