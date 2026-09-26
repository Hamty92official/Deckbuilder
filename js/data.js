// ============================================================
//  DATI, STATO E FUNZIONI PURE — nessuna dipendenza esterna
// ============================================================

// Testi dei tooltip (mostrati al passaggio del mouse / al tap sulle parole chiave)
const KEYWORD_TIPS = {
    "Bruciatura": "Danno nel tempo. Ogni turno il nemico subisce danni pari al 100% del valore della carta, per 3 turni. Ignora lo scudo.",
    "Veleno": "Danno nel tempo. Ogni turno il nemico subisce danni pari al 50% del valore della carta, per 3 turni. Ignora lo scudo. Il nemico ha il 20% di sbagliare il colpo.",
    "Debolezza": "Riduce i danni inflitti del 25%.",
    "Stordisci": "Il nemico salta il prossimo turno.",
    "Ignora lo scudo": "Il danno non viene bloccato dallo scudo del nemico.",
    "Forza": "Aumenta i danni delle tue carte d'attacco per il resto dello scontro.",
    "Rigenerazione": "Cura te all'inizio di ogni turno per la durata indicata."
};

// Helper: crea uno span di parola chiave con tooltip
function kw(text, tipKey) {
    const tip = KEYWORD_TIPS[tipKey] || "";
    return `<span class="kw" data-tip="${tip}">${text}</span>`;
}

const cardDatabase = [
    // ---------- ATTACCO ----------
    { cost: "💎",     title: "Fendente",           art: "Spada",           desc: "Infligge 6 danni ⚔️",                                fx: "slash",     type: "damage", value: 6 },
    { cost: "💎",     title: "Lancia",             art: "Lancia",          desc: "Infligge 5 danni ⚔️",                                fx: "slash",     type: "damage", value: 5 },
    { cost: "💎",     title: "Pugnalata",          art: "Pugnale",         desc: "Infligge 4 danni ⚔️. " + kw("Ignora lo scudo", "Ignora lo scudo"),         fx: "slash",     type: "damage", value: 4, ignoreShield: true },
    { cost: "💎",     title: "Stoccata",           art: "Pugnale",         desc: "Infligge 4 danni ⚔️. Pesca 1 carta 🎴",              fx: "slash2",    type: "damage", value: 4, draw: 1 },
    { cost: "💎",     title: "Cecchino",           art: "Arco",            desc: "Infligge 8 danni ⚔️. " + kw("Ignora lo scudo", "Ignora lo scudo"),         fx: "arrow",     type: "damage", value: 8, ignoreShield: true },
    { cost: "💎💎",   title: "Colpo Doppio",       art: "Spade",           desc: "Infligge 4 danni ⚔️ due volte",                       fx: "slash2",    type: "damage", value: 8 },
    { cost: "💎💎",   title: "Fulmine",            art: "Saetta",          desc: "Infligge 10 danni ⚔️",                               fx: "slash",     type: "damage", value: 10 },
    { cost: "💎💎",   title: "Freccia Multipla",   art: "Frecce",          desc: "Infligge 3 danni ⚔️ tre volte",                       fx: "slash3",    type: "damage", value: 9 },
    { cost: "💎💎",   title: "Lancia Perforante",  art: "Lancia",          desc: "Infligge 7 danni ⚔️. " + kw("Ignora lo scudo", "Ignora lo scudo"),         fx: "arrow",     type: "damage", value: 7, ignoreShield: true },
    { cost: "💎💎",   title: "Vampata",            art: "Fiamma",          desc: "Infligge 3 danni ⚔️. Applica " + kw("Bruciatura 🔥", "Bruciatura"),        fx: "fire",      type: "damage", value: 3, burnTurns: 3 },
    { cost: "💎💎",   title: "Morso Tossico",      art: "Fiala",           desc: "Infligge 6 danni ⚔️. Applica " + kw("Veleno 🧪", "Veleno"),                fx: "poison",    type: "damage", value: 6, poisonTurns: 3 },
    { cost: "💎💎",   title: "Rubavita",           art: "Falce",           desc: "Infligge 5 danni ⚔️. Cura te di altrettanti ❤️",     fx: "lifesteal", type: "damage", value: 5, lifesteal: true },
    { cost: "💎💎💎", title: "Magia",              art: "Tempesta",        desc: "Infligge 4 danni ⚔️ cinque volte",                    fx: "arcane",    type: "damage", value: 20 },
    { cost: "💎💎💎", title: "Colpo Possente",     art: "Martello",        desc: "Infligge 15 danni ⚔️",                               fx: "slash",     type: "damage", value: 15 },
    { cost: "💎💎💎", title: "Assalto",            art: "Armi",            desc: "Infligge 6 danni ⚔️ tre volte",                       fx: "slash3",    type: "damage", value: 18 },

    // ---------- SCUDO ----------
    { cost: "💎",     title: "Baluardo",           art: "Scudo",           desc: "Ottieni 5 scudo 🛡️",                                 fx: "shield",     type: "shield", value: 5 },
    { cost: "💎",     title: "Barriera",           art: "Scudo",           desc: "Ottieni 4 scudo 🛡️. Pesca 1 carta 🎴",               fx: "shield",     type: "shield", value: 4, draw: 1 },
    { cost: "💎💎",   title: "Muraglia",           art: "Muro",            desc: "Ottieni 11 scudo 🛡️",                                fx: "shield",     type: "shield", value: 11 },
    { cost: "💎💎",   title: "Riparo",             art: "Riparo",          desc: "Ottieni 7 scudo 🛡️. Cura 4 ❤️",                      fx: "shieldheal", type: "shield", value: 7, healValue: 4 },
    { cost: "💎💎💎", title: "Fortezza",           art: "Fortezza",        desc: "Ottieni 18 scudo 🛡️",                                fx: "shield",     type: "shield", value: 18 },

    // ---------- CURA ----------
    { cost: "💎",     title: "Secondo Fiato",      art: "Elisir",          desc: "Cura 4 ❤️",                                          fx: "heal",       type: "heal", value: 4 },
    { cost: "💎💎",   title: "Rigenera",           art: "Elisir",          desc: "Cura 6 ❤️",                                          fx: "heal",       type: "heal", value: 6 },
    { cost: "💎💎",   title: "Benedizione",        art: "Foglia",          desc: "Cura 5 ❤️. Pesca 1 carta 🎴",                        fx: "heal",       type: "heal", value: 5, draw: 1 },
    { cost: "💎💎",   title: "Rinascita",          art: "Foglia",          desc: kw("Rigenerazione 💚", "Rigenerazione") + " 4 per 3 turni",       fx: "regen",      type: "regen", value: 4, regenTurns: 3 },
    { cost: "💎💎💎", title: "Guarigione",         art: "Fonte",           desc: "Cura 15 ❤️",                                         fx: "heal",       type: "heal", value: 15 },

    // ---------- UTILITÀ ----------
    { cost: "💎",     title: "Pozione",            art: "Pozione",         desc: "Pesca 2 carte 🎴",                                   fx: "potion",     type: "utility", draw: 2 },
    { cost: "💎",     title: "Concentrazione",     art: "Tomo",            desc: "Pesca 3 carte 🎴",                                   fx: "potion",     type: "utility", draw: 3 },
    { cost: "💎",     title: "Purificazione",      art: "Stella",          desc: "Rimuove i tuoi effetti negativi",                    fx: "cleanse",    type: "cleanse" },
    { cost: "💎💎",   title: "Ispirazione",        art: "Faro",            desc: "Pesca 2 carte 🎴. Cura 3 ❤️",                        fx: "heal",       type: "utility", value: 3, draw: 2 },
    { cost: "💎💎",   title: "Panacea",            art: "Calice",          desc: "Rimuove i tuoi effetti negativi. Cura 5 ❤️",         fx: "cleanseheal",type: "cleanse", value: 5 },

    // ---------- BUFF / DEBUFF ----------
    { cost: "💎",     title: "Forza",              art: "Pugno",           desc: kw("Forza 💪", "Forza") + " +2",                              fx: "strength", type: "strength", value: 2 },
    { cost: "💎",     title: "Indebolimento",      art: "Catene",          desc: "Applica " + kw("Debolezza ⛓️‍💥", "Debolezza") + " per 2 turni",       fx: "weaken",   type: "weaken", value: 2 },
    { cost: "💎💎",   title: "Maledizione",        art: "Teschio",         desc: "Applica " + kw("Debolezza ⛓️‍💥", "Debolezza") + " per 3 turni",       fx: "weaken",   type: "weaken", value: 3 },
    { cost: "💎💎",   title: "Stordimento",        art: "Martello",        desc: kw("Stordisci 💫", "Stordisci") + " il nemico",                 fx: "stun",     type: "stun", value: 1 },
    { cost: "💎💎💎", title: "Furia",              art: "Fiamma",          desc: kw("Forza 💪", "Forza") + " +5",                              fx: "strength", type: "strength", value: 5 },
    { cost: "💎💎💎", title: "Terrore",            art: "Spettro",         desc: kw("Stordisci 💫", "Stordisci") + " il nemico per 2 turni",      fx: "stun",     type: "stun", value: 2 },

    // ---------- STATUS (solo DoT) ----------
    { cost: "💎💎",   title: "Veleno Puro",        art: "Fiala",           desc: "Applica " + kw("Veleno 🧪", "Veleno"),                                fx: "poisononly", type: "poison", value: 4, poisonTurns: 3 },
    { cost: "💎💎💎", title: "Combustione",        art: "Braciere",        desc: "Applica " + kw("Bruciatura 🔥", "Bruciatura"),                        fx: "burnonly",   type: "burn",   value: 6, burnTurns: 3 },

    // ---------- MISTI ----------
    { cost: "💎💎",   title: "Colpo Debilitante",  art: "Mazza",           desc: "Infligge 4 danni ⚔️. Applica " + kw("Debolezza ⛓️‍💥", "Debolezza") + " per 2 turni", fx: "dmweak", type: "damage", value: 4, weakenValue: 2 },
    { cost: "💎💎",   title: "Colpo Fiammeggiante",art: "Spada Infuocata", desc: "Infligge 8 danni ⚔️. Pesca 1 carta 🎴",                       fx: "slash",  type: "damage", value: 8, draw: 1 }
];

// Copie per tipo → totale mazzo: 52 carte
const CARD_COPIES = {
    "Fendente": 2, "Lancia": 2, "Baluardo": 2, "Barriera": 2,
    "Stoccata": 2, "Pozione": 2, "Secondo Fiato": 2, "Forza": 2,
    "Indebolimento": 2, "Vampata": 2, "Morso Tossico": 2, "Purificazione": 2,
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

function applyPlayerDamageMods(baseDamage) {
    let dmg = baseDamage + playerStrength;
    if (playerWeakTurns > 0) dmg = Math.round(dmg * (1 - WEAK_REDUCTION));
    return Math.max(0, dmg);
}

function applyMonsterDamageMods(baseDamage) {
    return monsterWeakTurns > 0 ? Math.round(baseDamage * (1 - WEAK_REDUCTION)) : baseDamage;
}
