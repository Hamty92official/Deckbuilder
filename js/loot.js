// ============================================================
//  LOOT SYSTEM — drop oggetti + persistenza su localStorage
// ============================================================
(function(global) {
    'use strict';

    const ITEM_POOL = [
        { id:'h1', slot:'head', name:'Elmo di Cuoio',       icon:'⛑️', rarity:'comune',      effect:'+5 HP massimi',                    stats:{ hpMax:5 } },
        { id:'h2', slot:'head', name:'Teschio di Guerra',   icon:'💀', rarity:'comune',      effect:'+4 HP, +1 danno',                 stats:{ hpMax:4, dmgBonus:1 } },
        { id:'h3', slot:'head', name:'Maschera di Pietra',  icon:'🗿', rarity:'comune',      effect:'+4 scudo iniziale',                stats:{ shieldStart:4 } },
        { id:'h4', slot:'head', name:'Testa di Rana',       icon:'🐸', rarity:'comune',      effect:'+3 HP, +3 scudo iniziale',         stats:{ hpMax:3, shieldStart:3 } },
        { id:'h5', slot:'head', name:'Maschera della Volpe',icon:'🦊', rarity:'raro',        effect:'+5 HP, +1 carta a inizio turno',   stats:{ hpMax:5, extraDraw:1 } },
        { id:'h6', slot:'head', name:'Elmo del Lupo',       icon:'🐺', rarity:'raro',        effect:'+8 HP, +1 danno',                  stats:{ hpMax:8, dmgBonus:1 } },
        { id:'h7', slot:'head', name:'Maschera del Tengu',  icon:'👺', rarity:'epico',       effect:'+10 HP, +2 danno',                 stats:{ hpMax:10, dmgBonus:2 } },
        { id:'h8', slot:'head', name:'Testa di Zucca',      icon:'🎃', rarity:'epico',       effect:'+8 HP, +2 scudo, +1 rigenerazione',stats:{ hpMax:8, shieldStart:2, regen:1 } },
        { id:'h9', slot:'head', name:'Teschio del Re Lich', icon:'💀', rarity:'leggendario', effect:'+15 HP, +2 danno, +1 mana, +1 rigenerazione', stats:{ hpMax:15, dmgBonus:2, manaMax:1, regen:1 } },

        { id:'c1', slot:'chest', name:'Tunica Semplice',       icon:'👕', rarity:'comune',      effect:'+6 HP massimi',                  stats:{ hpMax:6 } },
        { id:'c2', slot:'chest', name:'Soprabito di Pelle',    icon:'🧥', rarity:'comune',      effect:'+5 HP, +1 scudo iniziale',       stats:{ hpMax:5, shieldStart:1 } },
        { id:'c3', slot:'chest', name:'Kimono Consumato',      icon:'👘', rarity:'comune',      effect:'+5 HP, +1 rigenerazione',        stats:{ hpMax:5, regen:1 } },
        { id:'c4', slot:'chest', name:'Gi del Lottatore',      icon:'🥋', rarity:'raro',        effect:'+8 HP, +1 danno',                stats:{ hpMax:8, dmgBonus:1 } },
        { id:'c5', slot:'chest', name:'Gilet Rinforzato',      icon:'🦺', rarity:'raro',        effect:'+10 HP, +2 scudo iniziale',       stats:{ hpMax:10, shieldStart:2 } },
        { id:'c6', slot:'chest', name:'Canotta del Gladiatore',icon:'🎽', rarity:'raro',        effect:'+10 HP, +2 danno',               stats:{ hpMax:10, dmgBonus:2 } },
        { id:'c7', slot:'chest', name:'Veste della Strega',    icon:'👚', rarity:'epico',       effect:'+12 HP, +1 mana massimo',        stats:{ hpMax:12, manaMax:1 } },
        { id:'c8', slot:'chest', name:'Kimono dello Spirito',  icon:'👘', rarity:'leggendario', effect:'+20 HP, +1 mana, +2 rigenerazione', stats:{ hpMax:20, manaMax:1, regen:2 } },

        { id:'a1', slot:'amulet', name:'Piuma dell\'Aquila', icon:'🪶', rarity:'comune',      effect:'+3 HP massimi',                  stats:{ hpMax:3 } },
        { id:'a2', slot:'amulet', name:'Peperoncino',        icon:'🌶️', rarity:'comune',      effect:'+1 danno',                       stats:{ dmgBonus:1 } },
        { id:'a3', slot:'amulet', name:'Pietra Antica',      icon:'🪨', rarity:'comune',      effect:'+3 scudo iniziale',              stats:{ shieldStart:3 } },
        { id:'a4', slot:'amulet', name:'Conchiglia',         icon:'🐚', rarity:'comune',      effect:'+2 HP, +1 scudo iniziale',       stats:{ hpMax:2, shieldStart:1 } },
        { id:'a5', slot:'amulet', name:'Trifoglio',          icon:'🍀', rarity:'raro',        effect:'+3 HP, +2 scudo iniziale',       stats:{ hpMax:3, shieldStart:2 } },
        { id:'a6', slot:'amulet', name:'Chiave Antica',      icon:'🗝️', rarity:'raro',        effect:'+1 carta a inizio turno',        stats:{ extraDraw:1 } },
        { id:'a7', slot:'amulet', name:'Amuleto Lunare',     icon:'🌕', rarity:'raro',        effect:'+1 mana massimo',                stats:{ manaMax:1 } },
        { id:'a8', slot:'amulet', name:'Fiore di Loto',      icon:'🪷', rarity:'epico',       effect:'+2 HP a turno',                  stats:{ regen:2 } },
        { id:'a9', slot:'amulet', name:'Cuore della Fenice', icon:'❤️‍🔥', rarity:'leggendario', effect:'+3 HP a turno, +5 HP massimi', stats:{ regen:3, hpMax:5 } },

        { id:'n1', slot:'necklace', name:'Collana di Legno',  icon:'📿', rarity:'comune',      effect:'+3 HP massimi',                  stats:{ hpMax:3 } },
        { id:'n2', slot:'necklace', name:'Collana di Rame',   icon:'📿', rarity:'comune',      effect:'+1 danno',                       stats:{ dmgBonus:1 } },
        { id:'n3', slot:'necklace', name:'Collana di Pietra', icon:'📿', rarity:'comune',      effect:'+2 scudo iniziale',              stats:{ shieldStart:2 } },
        { id:'n4', slot:'necklace', name:'Collana di Perle',  icon:'📿', rarity:'raro',        effect:'+5 HP, +1 mana massimo',         stats:{ hpMax:5, manaMax:1 } },
        { id:'n5', slot:'necklace', name:'Collana Runica',    icon:'📿', rarity:'raro',        effect:'+6 HP, +2 scudo iniziale',       stats:{ hpMax:6, shieldStart:2 } },
        { id:'n6', slot:'necklace', name:'Collana d\'Oro',    icon:'📿', rarity:'epico',       effect:'+10 HP, +1 mana massimo',        stats:{ hpMax:10, manaMax:1 } },
        { id:'n7', slot:'necklace', name:'Rosario del Vuoto', icon:'📿', rarity:'leggendario', effect:'+12 HP, +1 mana, +2 rigenerazione', stats:{ hpMax:12, manaMax:1, regen:2 } },

        { id:'r1', slot:'ring', name:'Anello di Rame',    icon:'💍', rarity:'comune',      effect:'+3 HP massimi',                  stats:{ hpMax:3 } },
        { id:'r2', slot:'ring', name:'Anello d\'Argento', icon:'💍', rarity:'comune',      effect:'+1 danno',                       stats:{ dmgBonus:1 } },
        { id:'r3', slot:'ring', name:'Anello di Ferro',   icon:'💍', rarity:'comune',      effect:'+2 scudo iniziale',              stats:{ shieldStart:2 } },
        { id:'r4', slot:'ring', name:'Anello d\'Oro',     icon:'💍', rarity:'raro',        effect:'+6 HP, +1 danno',                stats:{ hpMax:6, dmgBonus:1 } },
        { id:'r5', slot:'ring', name:'Anello Runico',     icon:'💍', rarity:'raro',        effect:'+1 mana massimo',                stats:{ manaMax:1 } },
        { id:'r6', slot:'ring', name:'Anello del Potere', icon:'💍', rarity:'epico',       effect:'+8 HP, +2 danno, +1 mana',       stats:{ hpMax:8, dmgBonus:2, manaMax:1 } },
        { id:'r7', slot:'ring', name:'Anello del Fato',   icon:'💍', rarity:'leggendario', effect:'+10 HP, +2 danno, +1 mana, +2 scudo', stats:{ hpMax:10, dmgBonus:2, manaMax:1, shieldStart:2 } },

        { id:'w1', slot:'weapon', name:'Spada Corta',          icon:'🗡️', rarity:'comune',      effect:'+1 danno',                          stats:{ dmgBonus:1 } },
        { id:'w2', slot:'weapon', name:'Padella',              icon:'🍳', rarity:'comune',      effect:'+1 danno, +1 scudo iniziale',       stats:{ dmgBonus:1, shieldStart:1 } },
        { id:'w3', slot:'weapon', name:'Yoyo Maledetto',       icon:'🪀', rarity:'comune',      effect:'+1 danno, +1 rigenerazione',        stats:{ dmgBonus:1, regen:1 } },
        { id:'w4', slot:'weapon', name:'Clava d\'Ossa',        icon:'🦴', rarity:'comune',      effect:'+2 danno',                          stats:{ dmgBonus:2 } },
        { id:'w5', slot:'weapon', name:'Coltello Sacrificale', icon:'🔪', rarity:'comune',      effect:'+1 danno, +1 carta a inizio turno', stats:{ dmgBonus:1, extraDraw:1 } },
        { id:'w6', slot:'weapon', name:'Arco del Cacciatore',  icon:'🏹', rarity:'raro',        effect:'+2 danno, +1 scudo iniziale',       stats:{ dmgBonus:2, shieldStart:1 } },
        { id:'w7', slot:'weapon', name:'Ascia da Guerra',      icon:'🪓', rarity:'raro',        effect:'+3 danno',                          stats:{ dmgBonus:3 } },
        { id:'w8', slot:'weapon', name:'Pala del Becchino',    icon:'🪏', rarity:'raro',        effect:'+2 danno, +1 rigenerazione',        stats:{ dmgBonus:2, regen:1 } },
        { id:'w9', slot:'weapon', name:'Martello Runico',      icon:'🔨', rarity:'epico',       effect:'+3 danno, +2 scudo iniziale',       stats:{ dmgBonus:3, shieldStart:2 } },
        { id:'w10', slot:'weapon', name:'Lama dell\'Alba',     icon:'⚔️', rarity:'leggendario', effect:'+5 danno, +1 mana, +1 rigenerazione', stats:{ dmgBonus:5, manaMax:1, regen:1 } },

        { id:'s1', slot:'shield', name:'Porta',                 icon:'🚪', rarity:'comune',      effect:'+3 scudo iniziale',                stats:{ shieldStart:3 } },
        { id:'s2', slot:'shield', name:'Talismano di Difesa',   icon:'🔰', rarity:'comune',      effect:'+2 scudo iniziale, +2 HP',         stats:{ shieldStart:2, hpMax:2 } },
        { id:'s3', slot:'shield', name:'Scudo di Legno',        icon:'🛡️', rarity:'comune',      effect:'+4 scudo iniziale',                stats:{ shieldStart:4 } },
        { id:'s4', slot:'shield', name:'Scudo di Ferro',        icon:'🛡️', rarity:'raro',        effect:'+6 scudo iniziale',                stats:{ shieldStart:6 } },
        { id:'s5', slot:'shield', name:'Scudo del Drago',       icon:'🛡️', rarity:'epico',       effect:'+10 scudo iniziale',               stats:{ shieldStart:10 } },
        { id:'s6', slot:'shield', name:'Baluardo Eterno',       icon:'🛡️', rarity:'leggendario', effect:'+14 scudo iniziale, +3 HP massimi', stats:{ shieldStart:14, hpMax:3 } },

        { id:'p1', slot:'pet', name:'Pulcino',          icon:'🐣', rarity:'comune',      effect:'+3 HP massimi',                  stats:{ hpMax:3 } },
        { id:'p2', slot:'pet', name:'Coniglio',         icon:'🐇', rarity:'comune',      effect:'+2 HP, +1 rigenerazione',        stats:{ hpMax:2, regen:1 } },
        { id:'p3', slot:'pet', name:'Pappagallo',       icon:'🦜', rarity:'comune',      effect:'+4 HP massimi',                  stats:{ hpMax:4 } },
        { id:'p4', slot:'pet', name:'Scoiattolo',       icon:'🐿️', rarity:'comune',      effect:'+1 carta a inizio turno',        stats:{ extraDraw:1 } },
        { id:'p5', slot:'pet', name:'Gufo',             icon:'🦉', rarity:'raro',        effect:'+1 rigenerazione, +2 HP',        stats:{ regen:1, hpMax:2 } },
        { id:'p6', slot:'pet', name:'Riccio',           icon:'🦔', rarity:'raro',        effect:'+4 scudo iniziale, +1 rigenerazione', stats:{ shieldStart:4, regen:1 } },
        { id:'p7', slot:'pet', name:'Gatto Nero',       icon:'🐈‍⬛', rarity:'raro',        effect:'+6 HP, +1 scudo iniziale',       stats:{ hpMax:6, shieldStart:1 } },
        { id:'p8', slot:'pet', name:'Fantasma',         icon:'👻', rarity:'epico',       effect:'+1 carta in mano, +5 HP',        stats:{ extraDraw:1, hpMax:5 } },
        { id:'p9', slot:'pet', name:'Fenice Primordiale', icon:'🐦‍🔥', rarity:'leggendario', effect:'+1 carta, +2 rigenerazione, +1 mana', stats:{ extraDraw:1, regen:2, manaMax:1 } },
    ];

    const DROP_WEIGHTS = { comune: 70, raro: 22, epico: 7.8, leggendario: 0.2 };

    const K_INVENTORY = 'db_inventory';
    const K_EQUIPPED  = 'db_equipped';
    const K_PENDING   = 'db_pending_drops';

    function pickRarity() {
        const total = Object.values(DROP_WEIGHTS).reduce((a, b) => a + b, 0);
        let r = Math.random() * total;
        for (const [rarity, weight] of Object.entries(DROP_WEIGHTS)) {
            r -= weight;
            if (r <= 0) return rarity;
        }
        return 'comune';
    }

    function rollDrop() {
        const rarity = pickRarity();
        const pool = ITEM_POOL.filter(i => i.rarity === rarity);
        if (pool.length === 0) return ITEM_POOL[0];
        return pool[Math.floor(Math.random() * pool.length)];
    }

    // Genera un drop e lo mette in coda (verrà ritirato dalla pagina equip)
    function rollAndQueueDrop() {
        const item = rollDrop();
        const queue = getPendingDrops();
        queue.push(item);
        try {
            localStorage.setItem(K_PENDING, JSON.stringify(queue));
        } catch(e) { /* ignore */ }
        return item;
    }

    function getPendingDrops() {
        try { return JSON.parse(localStorage.getItem(K_PENDING) || '[]'); }
        catch(e) { return []; }
    }
    function clearPendingDrops() {
        try { localStorage.removeItem(K_PENDING); } catch(e) {}
    }

    function getInventory() {
        try { return JSON.parse(localStorage.getItem(K_INVENTORY) || '[]'); }
        catch(e) { return []; }
    }
    function saveInventory(inv) {
        try { localStorage.setItem(K_INVENTORY, JSON.stringify(inv)); } catch(e) {}
    }
    function getEquipped() {
        try { return JSON.parse(localStorage.getItem(K_EQUIPPED) || '{}'); }
        catch(e) { return {}; }
    }
    function saveEquipped(eq) {
        try { localStorage.setItem(K_EQUIPPED, JSON.stringify(eq)); } catch(e) {}
    }
    function resetAll() {
        try {
            localStorage.removeItem(K_INVENTORY);
            localStorage.removeItem(K_EQUIPPED);
            localStorage.removeItem(K_PENDING);
        } catch(e) {}
    }

    global.LootSystem = {
        ITEM_POOL, DROP_WEIGHTS,
        rollDrop, rollAndQueueDrop,
        getPendingDrops, clearPendingDrops,
        getInventory, saveInventory,
        getEquipped, saveEquipped,
        resetAll
    };
})(typeof window !== 'undefined' ? window : this);
