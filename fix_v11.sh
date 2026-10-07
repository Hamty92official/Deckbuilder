#!/usr/bin/env bash
set -e
cd "C:/Users/ivanp/Documents/Deckbuilder"

echo "=========================================="
echo "  Fix v11: 1080p + ritocco 2K"
echo "=========================================="

# Rimuovi il blocco v10 (max-height: 1200px) ormai superato
sed -i '/^\/\* ==+ MENU_SHORT_HEIGHT_START/,/^\/\* ==+ MENU_SHORT_HEIGHT_END/d' css/style.css

# NUOVO blocco: schermi <= 2400px (1080p e inferiori)
sed -i '/^\/\* ==+ SCREEN_LOWRES_START/,/^\/\* ==+ SCREEN_LOWRES_END/d' css/style.css
cat >> css/style.css << 'EOF'

/* ==+ SCREEN_LOWRES_START +== */
/* Regolazioni per schermi <= 2400px (1080p e inferiori).
   Il 2K (2560px) non e' toccato. Obiettivo: proporzioni visive
   simili a quelle del 2K, cosi' il 1080p e' godibile. */
@media (max-width: 2400px) {
    /* --- MENU --- */
    .menu-panel {
        width: min(480px, 32vw);
        max-width: 500px;
        top: 2vh;
    }
    .menu-targhetta {
        max-height: none;
        width: 100%;
        object-fit: initial;
    }
    .menu-btn {
        font-size: clamp(12px, 1.5vw, 17px);
        padding: clamp(12px, 1.6vh, 16px) clamp(16px, 2vw, 24px);
        letter-spacing: 2.5px;
    }

    /* --- CARTE IN MANO: proporzionalmente piu' piccole --- */
    .card {
        width: clamp(96px, 15vw, 172px);
        height: clamp(138px, 21.6vw, 249px);
        padding: clamp(6px, 1.6vw, 11px);
    }
    .card-title { font-size: clamp(11px, 2.4vw, 14px); }
    .card-art { height: clamp(42px, 10vw, 78px); font-size: clamp(9px, 1.9vw, 13px); }
    .card-description { font-size: clamp(8px, 1.9vw, 11px); }
    .card-cost { font-size: clamp(13px, 3vw, 19px); }
    .hand-container { height: clamp(150px, 28vh, 240px); }
}
/* ==+ SCREEN_LOWRES_END +== */
EOF

# RITOCCO 2K: ingrandisci un po' player-ui/monster-ui
sed -i '/^\/\* ==+ SCREEN_2K_BOOST_START/,/^\/\* ==+ SCREEN_2K_BOOST_END/d' css/style.css
cat >> css/style.css << 'EOF'

/* ==+ SCREEN_2K_BOOST_START +== */
/* Ritocco mirato per il 2K (2560-3400px): pannelli HP un po' piu' grandi */
@media (min-width: 2400px) and (max-width: 3400px) {
    .player-ui, .monster-ui {
        width: 275px;
        padding: 19px;
    }
    .entity-name { font-size: 19px; }
    .health-bar-container { height: 30px; }
    .health-text { font-size: 13.5px; }
    .stat-item { font-size: 14px; padding: 5px 12px; }
    .stats-row { gap: 8px; }
}
/* ==+ SCREEN_2K_BOOST_END +== */
EOF

echo ""
echo ">>> Verifica:"
echo -n "SCREEN_LOWRES:     "; grep -c "SCREEN_LOWRES_START" css/style.css || true
echo -n "SCREEN_2K_BOOST:   "; grep -c "SCREEN_2K_BOOST_START" css/style.css || true
echo -n "MENU_SHORT_HEIGHT (deve essere 0): "; grep -c "MENU_SHORT_HEIGHT_START" css/style.css || true

echo ""
echo "=========================================="
echo "  ✅ Fatto! Ricarica con Ctrl+F5."
echo "=========================================="
echo ""
echo "Da testare:"
echo "  - 1080p: menu proporzionato, targhetta grande, carte con respiro"
echo "  - 2K:    pannelli HP un pelino piu' grandi, resto identico"
echo ""
echo "Se su 1080p le carte sono ancora troppo grandi:"
echo "  dimmelo e le porto a 150px massimo."
