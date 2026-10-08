// ============================================================
//  SHOP CARDS — Pool di 40 carte rare (Fase 4)
//  NON ottenibili dal mazzo base. Solo da:
//   - Acquisto all'antiquario (shop)
//   - Drop dal boss di fine livello (carta "Unica", Fase 8)
//
//  Formato identico a cardDatabase, con campo extra:
//    rarity: 'noncomune' | 'raro' | 'epico' | 'leggendario'
//  Colori bordo (via CSS .card.rarity-*):
//    noncomune  = verde
//    raro       = blu
//    epico      = viola
//    leggendario= arancione
// ============================================================

const SHOP_CARDS = [

    /* ==========================================================
       10 NON COMUNI (verde)
       ========================================================== */
    { rarity:'noncomune',   cost:'💎',     title:'Lama del Cacciatore',       art:'Spada',           desc:'Infligge {DMG} danni ⚔️',                                                              fx:'slash',      type:'damage',   value:8 },
    { rarity:'noncomune',   cost:'💎',     title:'Affondo Perfetto',          art:'Pugnale',         desc:'Infligge {DMG} danni ⚔️. ' + kw('Ignora lo scudo','Ignora lo scudo'),                  fx:'dagger',     type:'damage',   value:7, ignoreShield:true },
    { rarity:'noncomune',   cost:'💎',     title:'Scudo Rinforzato',          art:'Scudo',           desc:'Ottieni 8 scudo 🛡️',                                                                   fx:'shield',     type:'shield',   value:8 },
    { rarity:'noncomune',   cost:'💎',     title:'Cura Rapida',               art:'Elisir',          desc:'Cura 6 ❤️. Pesca 1 carta 🎴',                                                          fx:'heal',       type:'heal',     value:6, draw:1 },
    { rarity:'noncomune',   cost:'💎',     title:'Frecce Gemelle',            art:'Frecce',          desc:'Infligge {DMG} danni ⚔️ due volte',                                                     fx:'slash2',     type:'damage',   value:10 },
    { rarity:'noncomune',   cost:'💎💎',   title:'Dardo Infuocato',           art:'Fiamma',          desc:'Infligge {DMG} danni ⚔️. Applica ' + kw('Bruciatura 🔥','Bruciatura','burn'),          fx:'fire',       type:'damage',   value:5, burnTurns:3 },
    { rarity:'noncomune',   cost:'💎💎',   title:'Pugnale Avvelenato',        art:'Fiala',           desc:'Infligge {DMG} danni ⚔️. Applica ' + kw('Veleno 🧪','Veleno','poison'),                fx:'poison',     type:'damage',   value:7, poisonTurns:3 },
    { rarity:'noncomune',   cost:'💎💎',   title:'Colpo Energetico',          art:'Spada',           desc:'Infligge {DMG} danni ⚔️. Pesca 1 carta 🎴',                                            fx:'slash',      type:'damage',   value:10, draw:1 },
    { rarity:'noncomune',   cost:'💎',     title:'Benedizione Minore',        art:'Riparo',          desc:'Ottieni 4 scudo 🛡️. Cura 4 ❤️',                                                        fx:'shieldheal', type:'shield',   value:4, healValue:4 },
    { rarity:'noncomune',   cost:'💎',     title:'Marchio della Debolezza',   art:'Mazza',           desc:'Infligge {DMG} danni ⚔️. Applica ' + kw('Debolezza ⛓️‍💥','Debolezza') + ' per 2 turni', fx:'dmweak',     type:'damage',   value:3, weakenValue:2 },

    /* ==========================================================
       10 RARE (blu)
       ========================================================== */
    { rarity:'raro',        cost:'💎💎',   title:'Lama Cremisi',              art:'Spada',           desc:'Infligge {DMG} danni ⚔️',                                                              fx:'slash',      type:'damage',   value:14 },
    { rarity:'raro',        cost:'💎💎',   title:'Fiamma Doppia',             art:'Fiamma',          desc:'Infligge {DMG} danni ⚔️. Applica ' + kw('Bruciatura 🔥','Bruciatura','burn'),          fx:'fire',       type:'damage',   value:6, burnTurns:3 },
    { rarity:'raro',        cost:'💎💎',   title:'Fiala Venefica',            art:'Fiala',           desc:'Infligge {DMG} danni ⚔️. Applica ' + kw('Veleno 🧪','Veleno','poison'),                fx:'poison',     type:'damage',   value:10, poisonTurns:4 },
    { rarity:'raro',        cost:'💎💎',   title:'Muro d\'Acciaio',           art:'Muro',            desc:'Ottieni 16 scudo 🛡️',                                                                  fx:'shield',     type:'shield',   value:16 },
    { rarity:'raro',        cost:'💎💎',   title:'Guarigione Potente',        art:'Elisir',          desc:'Cura 12 ❤️. Pesca 1 carta 🎴',                                                         fx:'heal',       type:'heal',     value:12, draw:1 },
    { rarity:'raro',        cost:'💎💎',   title:'Assalto Fulmineo',          art:'Armi',            desc:'Infligge {DMG} danni ⚔️ tre volte',                                                     fx:'slash3',     type:'damage',   value:21 },
    { rarity:'raro',        cost:'💎💎',   title:'Furia del Berserker',       art:'Pugno',           desc:kw('Forza 💪','Forza') + ' +4',                                                            fx:'strength',   type:'strength', value:4 },
    { rarity:'raro',        cost:'💎💎',   title:'Maledizione Profonda',      art:'Teschio',         desc:'Infligge {DMG} danni ⚔️. Applica ' + kw('Debolezza ⛓️‍💥','Debolezza') + ' per 4 turni', fx:'dmweak',     type:'damage',   value:6, weakenValue:4 },
    { rarity:'raro',        cost:'💎💎',   title:'Colpo Stordente Superiore', art:'Martello',        desc:kw('Stordisci 💫','Stordisci') + ' il nemico per 2 turni',                                 fx:'stun',       type:'stun',     value:2 },
    { rarity:'raro',        cost:'💎💎',   title:'Sigillo Rigenerante',       art:'Foglia',          desc:kw('Rigenerazione 💚','Rigenerazione') + ' 5 per 4 turni',                                 fx:'regen',      type:'regen',    value:5, regenTurns:4 },

    /* ==========================================================
       10 EPICHE (viola)
       ========================================================== */
    { rarity:'epico',       cost:'💎💎💎', title:'Lama del Drago',            art:'Spada Infuocata', desc:'Infligge {DMG} danni ⚔️',                                                              fx:'slash',      type:'damage',   value:25 },
    { rarity:'epico',       cost:'💎💎💎', title:'Esplosione Arcana',         art:'Tempesta',        desc:'Infligge {DMG} danni ⚔️ cinque volte',                                                  fx:'arcane',     type:'damage',   value:30 },
    { rarity:'epico',       cost:'💎💎',   title:'Piaga Tossica',             art:'Fiala',           desc:'Infligge {DMG} danni ⚔️. Applica ' + kw('Veleno 🧪','Veleno','poison'),                fx:'poison',     type:'damage',   value:8, poisonTurns:5 },
    { rarity:'epico',       cost:'💎💎💎', title:'Fuoco Infernale',           art:'Braciere',        desc:'Infligge {DMG} danni ⚔️. Applica ' + kw('Bruciatura 🔥','Bruciatura','burn'),          fx:'fire',       type:'damage',   value:10, burnTurns:5 },
    { rarity:'epico',       cost:'💎💎💎', title:'Fortezza del Titano',       art:'Fortezza',        desc:'Ottieni 25 scudo 🛡️',                                                                  fx:'shield',     type:'shield',   value:25 },
    { rarity:'epico',       cost:'💎💎💎', title:'Benedizione Suprema',       art:'Fonte',           desc:'Cura 20 ❤️. Pesca 2 carte 🎴',                                                         fx:'heal',       type:'heal',     value:20, draw:2 },
    { rarity:'epico',       cost:'💎💎',   title:'Furia Impetuosa',           art:'Fiamma',          desc:kw('Forza 💪','Forza') + ' +7',                                                            fx:'strength',   type:'strength', value:7 },
    { rarity:'epico',       cost:'💎💎💎', title:'Terrore Profondo',          art:'Spettro',         desc:kw('Stordisci 💫','Stordisci') + ' il nemico per 2 turni',                                 fx:'stun',       type:'stun',     value:2 },
    { rarity:'epico',       cost:'💎💎',   title:'Rigenerazione Naturale',    art:'Foglia',          desc:kw('Rigenerazione 💚','Rigenerazione') + ' 8 per 5 turni',                                 fx:'regen',      type:'regen',    value:8, regenTurns:5 },
    { rarity:'epico',       cost:'💎💎💎', title:'Lame Danzanti',             art:'Armi',            desc:'Infligge {DMG} danni ⚔️ tre volte',                                                     fx:'slash3',     type:'damage',   value:30 },

    /* ==========================================================
       10 LEGGENDARIE (arancione)
       ========================================================== */
    { rarity:'leggendario', cost:'💎💎💎', title:'Excalibur',                 art:'Spada',           desc:'Infligge {DMG} danni ⚔️. ' + kw('Ignora lo scudo','Ignora lo scudo'),                  fx:'thrust',     type:'damage',   value:40, ignoreShield:true },
    { rarity:'leggendario', cost:'💎💎💎', title:'Apocalisse',                art:'Tempesta',        desc:'Infligge {DMG} danni ⚔️ cinque volte',                                                  fx:'arcane',     type:'damage',   value:60 },
    { rarity:'leggendario', cost:'💎💎💎', title:'Cuore della Fenice',        art:'Fonte',           desc:'Cura 30 ❤️. Pesca 2 carte 🎴',                                                         fx:'heal',       type:'heal',     value:30, draw:2 },
    { rarity:'leggendario', cost:'💎💎💎', title:'Fiamma Eterna',             art:'Braciere',        desc:'Infligge {DMG} danni ⚔️. Applica ' + kw('Bruciatura 🔥','Bruciatura','burn'),          fx:'fire',       type:'damage',   value:15, burnTurns:6 },
    { rarity:'leggendario', cost:'💎💎💎', title:'Maledizione Eterna',        art:'Fiala',           desc:'Infligge {DMG} danni ⚔️. Applica ' + kw('Veleno 🧪','Veleno','poison'),                fx:'poison',     type:'damage',   value:15, poisonTurns:6 },
    { rarity:'leggendario', cost:'💎💎💎', title:'Scudo del Vuoto',           art:'Fortezza',        desc:'Ottieni 35 scudo 🛡️. Pesca 2 carte 🎴',                                                fx:'shield',     type:'shield',   value:35, draw:2 },
    { rarity:'leggendario', cost:'💎💎💎', title:'Ragnarok',                  art:'Martello',        desc:'Infligge {DMG} danni ⚔️ tre volte',                                                     fx:'slash3',     type:'damage',   value:60 },
    { rarity:'leggendario', cost:'💎💎💎', title:'Anima Dannata',             art:'Falce',           desc:'Infligge {DMG} danni ⚔️. Cura te di altrettanti ❤️',                                   fx:'lifesteal',  type:'damage',   value:30, lifesteal:true },
    { rarity:'leggendario', cost:'💎💎💎', title:'Corazza Divina',            art:'Riparo',          desc:'Ottieni 25 scudo 🛡️. Cura 15 ❤️',                                                      fx:'shieldheal', type:'shield',   value:25, healValue:15 },
    { rarity:'leggendario', cost:'💎💎💎', title:'Spada del Caos',            art:'Pugno',           desc:kw('Forza 💪','Forza') + ' +10',                                                           fx:'strength',   type:'strength', value:10 },

];

// Pesi rarità per il roll dello shop (Fase 5)
const SHOP_RARITY_WEIGHTS = {
    noncomune:   55,
    raro:        30,
    epico:       12,
    leggendario:  3
};

// Helper (usati anche da data.js in lazy mode)
function getShopCardsByRarityLocal(rarity) {
    return SHOP_CARDS.filter(function (c) { return c.rarity === rarity; });
}

// Roll pesato di una carta dal pool
function rollShopCard() {
    var keys = Object.keys(SHOP_RARITY_WEIGHTS);
    var total = keys.reduce(function (a, k) { return a + SHOP_RARITY_WEIGHTS[k]; }, 0);
    var r = Math.random() * total;
    var chosen = keys[0];
    for (var i = 0; i < keys.length; i++) {
        r -= SHOP_RARITY_WEIGHTS[keys[i]];
        if (r <= 0) { chosen = keys[i]; break; }
    }
    var pool = getShopCardsByRarityLocal(chosen);
    if (pool.length === 0) return Object.assign({}, SHOP_CARDS[0]);
    return Object.assign({}, pool[Math.floor(Math.random() * pool.length)]);
}
