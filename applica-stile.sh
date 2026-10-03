#!/bin/bash
# Applica lo stile dark fantasy a Deckbuilder
# Uso: bash applica-stile.sh

set -e

echo ""
echo "==============================================="
echo "  Applicazione stile dark fantasy..."
echo "==============================================="
echo ""

cat > css/style.css << 'CSSEOF'
/* ============================================================
   STILE DARK FANTASY — coerente con bg-goblin.webm
   ============================================================ */

:root {
    --ink: #0a0a1a;
    --ink-deep: #05050f;
    --night-1: #2a2a5a;
    --night-2: #1a1a3a;
    --night-3: #0f0f28;
    --moon: #c8e0f0;
    --moon-bright: #e8f4ff;
    --moon-shadow: #5a7a9a;
    --moss: #6a9a5a;
    --magenta: #d84080;
    --magenta-light: #f070a0;
    --blood: #c83048;
    --blood-light: #e85868;
    --mana: #7ad8ff;
}

html, body { height: 100%; overscroll-behavior: none; }

body {
    margin: 0;
    padding: env(safe-area-inset-top, 0px) env(safe-area-inset-right, 0px) env(safe-area-inset-bottom, 0px) env(safe-area-inset-left, 0px);
    background: radial-gradient(circle at 50% 35%, #2a2a5a 0%, #1a1a3a 65%, #0a0a1a 100%);
    overflow: hidden;
    font-family: 'IM Fell English', 'Montserrat', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    color: var(--moon-bright);
    display: flex;
    justify-content: center;
    align-items: flex-end;
    user-select: none;
    touch-action: none;
    box-sizing: border-box;
}

.game-table {
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: flex-end;
    perspective: 1200px;
}

/* ============================================================
   PANNELLI GIOCATORE / MOSTRO
   ============================================================ */
.player-ui, .monster-ui {
    position: absolute;
    top: clamp(8px, 2.5vh, 20px);
    display: flex;
    flex-direction: column;
    gap: clamp(5px, 1.4vw, 10px);
    color: var(--moon-bright);
    background:
        radial-gradient(ellipse 40% 25% at 78% 18%, rgba(0, 0, 0, 0.5), transparent 70%),
        radial-gradient(ellipse 35% 30% at 20% 78%, rgba(0, 0, 0, 0.4), transparent 70%),
        url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)' opacity='0.15'/%3E%3C/svg%3E"),
        linear-gradient(135deg, rgba(42, 42, 74, 0.92) 0%, rgba(26, 26, 58, 0.95) 50%, rgba(15, 15, 40, 0.96) 100%);
    backdrop-filter: blur(6px);
    padding: clamp(8px, 2.4vw, 16px);
    border-radius: clamp(10px, 2.6vw, 14px);
    border: 3px solid var(--ink);
    box-shadow:
        5px 5px 0 var(--ink),
        0 15px 35px rgba(0,0,0,0.7),
        inset 0 0 0 2px rgba(168, 213, 240, 0.12),
        inset 0 0 0 4px rgba(5, 5, 15, 0.6),
        inset 0 0 60px rgba(0, 0, 0, 0.7);
    width: clamp(100px, 29vw, 240px);
    box-sizing: border-box;
    z-index: 10;
}

.player-ui { left: clamp(6px, 2vw, 20px); align-items: flex-start; }
.monster-ui { right: clamp(6px, 2vw, 20px); align-items: flex-end; }

.entity-name {
    font-family: 'IM Fell English SC', 'IM Fell English', serif;
    font-size: clamp(11px, 3vw, 17px);
    font-weight: 400;
    letter-spacing: 0.5px;
    color: var(--moon-bright);
    text-shadow:
        2px 2px 0 var(--ink),
        1px 1px 0 var(--ink),
        0 0 12px rgba(168, 213, 240, 0.5);
    border-bottom: 2px solid rgba(168, 213, 240, 0.25);
    padding-bottom: clamp(3px, 1vw, 6px);
    width: 100%;
    text-align: inherit;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.health-bar-container {
    width: 100%;
    height: clamp(15px, 4.4vw, 26px);
    background: var(--ink-deep);
    border-radius: 8px;
    overflow: hidden;
    border: 3px solid var(--ink);
    box-shadow:
        3px 3px 0 var(--ink),
        inset 0 2px 5px rgba(0,0,0,0.9),
        inset 0 -1px 0 rgba(255,255,255,0.05);
    position: relative;
    padding: 2px;
}

.health-bar-fill {
    height: 100%;
    width: 100%;
    background: linear-gradient(90deg, #4a0510, var(--blood), var(--blood-light));
    border-radius: 5px;
    box-shadow:
        inset 0 1px 2px rgba(255, 255, 255, 0.3),
        inset 0 -1px 3px rgba(0,0,0,0.6),
        0 0 14px rgba(200, 48, 72, 0.6);
    transition: width 0.5s ease, background 0.4s ease, box-shadow 0.4s ease;
    position: relative;
}

.health-bar-fill.shielded {
    background: linear-gradient(90deg, #1a5580, var(--mana), #9ae8ff) !important;
    box-shadow:
        inset 0 1px 2px rgba(255, 255, 255, 0.5),
        0 0 14px rgba(122, 216, 255, 0.7) !important;
}

.monster-ui .health-bar-fill {
    background: linear-gradient(90deg, #4a0510, var(--blood), var(--blood-light));
}

.health-text {
    position: absolute;
    width: 100%; height: 100%;
    top: 0; left: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    font-family: 'Cinzel', 'Montserrat', serif;
    font-size: clamp(8.5px, 2.4vw, 12px);
    font-weight: 900;
    color: #ffffff;
    letter-spacing: 1px;
    text-shadow:
        2px 2px 0 var(--ink),
        0 0 8px rgba(0,0,0,0.95);
    white-space: nowrap;
    z-index: 3;
}

.stats-row {
    display: flex;
    flex-wrap: wrap;
    gap: clamp(5px, 1.4vw, 8px);
    font-size: clamp(9px, 2.3vw, 12px);
    width: 100%;
}

.stat-item {
    display: flex;
    align-items: center;
    gap: 4px;
    background: linear-gradient(180deg, rgba(15, 15, 40, 0.9) 0%, rgba(26, 26, 58, 0.7) 100%);
    padding: clamp(2px, 0.8vw, 5px) clamp(5px, 1.6vw, 10px);
    border-radius: 6px;
    white-space: normal;
    max-width: 100%;
    box-sizing: border-box;
    border: 2px solid var(--ink);
    box-shadow:
        2px 2px 0 var(--ink),
        inset 0 1px 0 rgba(200, 224, 240, 0.1),
        inset 0 -1px 0 rgba(0,0,0,0.4);
    color: var(--moon-bright);
    font-family: 'Kalam', 'Montserrat', cursive;
    font-weight: 700;
    font-size: clamp(10px, 2.5vw, 13px);
    text-shadow: 1px 1px 0 var(--ink);
    transform: rotate(-0.3deg);
}
.stat-item:nth-child(even) {
    transform: rotate(0.4deg);
}

/* ============================================================
   BOTTONI IN ALTO CENTRO
   ============================================================ */
.top-center-ui {
    position: absolute;
    top: clamp(8px, 2.5vh, 20px);
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    gap: clamp(5px, 1.6vw, 14px);
    z-index: 100;
}

.icon-btn {
    position: relative;
    width: clamp(30px, 8vw, 54px);
    height: clamp(30px, 8vw, 54px);
    border-radius: clamp(9px, 2.6vw, 12px);
    font-size: clamp(14px, 3.6vw, 22px);
    color: var(--moon-bright);
    background:
        radial-gradient(ellipse 40% 25% at 78% 18%, rgba(0, 0, 0, 0.5), transparent 70%),
        url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100' height='100' filter='url(%23n)' opacity='0.15'/%3E%3C/svg%3E"),
        linear-gradient(135deg, rgba(42, 42, 74, 0.92) 0%, rgba(26, 26, 58, 0.95) 50%, rgba(15, 15, 40, 0.96) 100%);
    backdrop-filter: blur(6px);
    border: 3px solid var(--ink);
    cursor: pointer;
    box-shadow:
        4px 4px 0 var(--ink),
        0 10px 20px rgba(0,0,0,0.5),
        inset 0 0 0 2px rgba(168, 213, 240, 0.12),
        inset 0 0 0 4px rgba(5, 5, 15, 0.6);
    transition: all 0.25s cubic-bezier(0.25, 1, 0.5, 1);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    text-shadow:
        2px 2px 0 var(--ink),
        0 0 8px rgba(168, 213, 240, 0.4);
}
.icon-btn:hover {
    transform: translateY(-3px) scale(1.08);
    background:
        radial-gradient(ellipse 40% 25% at 78% 18%, rgba(0, 0, 0, 0.5), transparent 70%),
        url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100' height='100' filter='url(%23n)' opacity='0.15'/%3E%3C/svg%3E"),
        linear-gradient(135deg, rgba(58, 58, 90, 0.95) 0%, rgba(42, 42, 74, 0.95) 50%, rgba(26, 26, 58, 0.96) 100%);
    box-shadow:
        5px 5px 0 var(--ink),
        0 15px 28px rgba(0,0,0,0.6),
        0 0 22px rgba(168, 213, 240, 0.4),
        inset 0 0 0 2px rgba(168, 213, 240, 0.2),
        inset 0 0 0 4px rgba(5, 5, 15, 0.6);
}
.icon-btn:active {
    transform: translateY(1px) scale(0.98);
    box-shadow:
        2px 2px 0 var(--ink),
        inset 0 2px 4px rgba(0,0,0,0.4);
}

.icon-badge {
    position: absolute;
    top: -8px;
    right: -8px;
    background: linear-gradient(135deg, var(--magenta), #6a1040);
    color: #ffffff;
    font-family: 'Cinzel', 'Montserrat', serif;
    font-size: clamp(8.5px, 2.2vw, 11px);
    font-weight: 900;
    padding: 2px clamp(3px, 1vw, 7px);
    border-radius: 10px;
    border: 2px solid var(--ink);
    box-shadow: 2px 2px 0 var(--ink);
    min-width: 18px;
    text-align: center;
    line-height: 1.2;
    text-shadow: 1px 1px 0 var(--ink);
}

.turn-banner {
    position: absolute;
    top: 42%;
    left: 50%;
    transform: translate(-50%, -50%) scale(0.9);
    padding: clamp(10px, 3vw, 16px) clamp(20px, 6vw, 42px);
    border-radius: 14px;
    font-family: 'Cinzel', 'Montserrat', serif;
    font-size: clamp(15px, 4.6vw, 22px);
    font-weight: 900;
    letter-spacing: 3px;
    text-transform: uppercase;
    color: var(--moon-bright);
    max-width: 88vw;
    text-align: center;
    box-sizing: border-box;
    white-space: nowrap;
    background:
        radial-gradient(ellipse 40% 25% at 78% 18%, rgba(0, 0, 0, 0.4), transparent 70%),
        url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='150' height='150'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='150' height='150' filter='url(%23n)' opacity='0.15'/%3E%3C/svg%3E"),
        linear-gradient(145deg, rgba(26, 26, 58, 0.96), rgba(10, 10, 26, 0.97));
    border: 3px solid var(--ink);
    box-shadow:
        6px 6px 0 var(--ink),
        0 15px 35px rgba(0,0,0,0.7),
        0 0 30px rgba(216, 64, 128, 0.4),
        inset 0 0 0 2px rgba(168, 213, 240, 0.12),
        inset 0 0 0 4px rgba(5, 5, 15, 0.6);
    text-shadow:
        3px 3px 0 var(--ink),
        1px 1px 0 var(--ink),
        0 0 18px rgba(216, 64, 128, 0.7);
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.3s ease, transform 0.3s cubic-bezier(0.25, 1, 0.5, 1);
    z-index: 50;
}
.turn-banner.visible {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
}

.player-ui.hit, .monster-ui.hit { animation: hit-shake 0.4s ease; }
@keyframes hit-shake {
    0%, 100% { transform: translateX(0); }
    20% { transform: translateX(-8px); }
    40% { transform: translateX(8px); }
    60% { transform: translateX(-5px); }
    80% { transform: translateX(5px); }
}

/* ============================================================
   FX LAYER — invariato
   ============================================================ */
.fx-layer { position: absolute; inset: 0; pointer-events: none; overflow: hidden; z-index: 200; }
.fx { position: absolute; pointer-events: none; translate: -50% -50%; }

.fx-float {
    font-family: 'Montserrat', sans-serif;
    font-size: clamp(17px, 4.6vw, 28px);
    font-weight: 800;
    white-space: nowrap;
    text-shadow: 0 2px 4px rgba(0,0,0,0.8), 0 0 12px currentColor;
}
.fx-dmg { color: #ff5a4d; }
.fx-block { color: #6fe3ff; }
.fx-burn { color: #ffa940; }
.fx-poison { color: #a96bdc; }
.fx-weak { color: #9aa5b1; }
.fx-strength { color: #ff8f3c; }
.fx-small { font-size: 18px; }
.fx-heal { color: #5df08a; }
.fx-miss { color: #c8d0d5; font-style: italic; }
.fx-mana { color: #5db9ff; }

.fx-orb {
    width: clamp(24px, 6.6vw, 40px);
    height: clamp(24px, 6.6vw, 40px);
    border-radius: 50%;
    background: radial-gradient(circle, #fff7c2 0%, #ffb02e 35%, rgba(255,90,20,0.85) 60%, rgba(255,90,20,0) 74%);
    box-shadow: 0 0 30px 10px rgba(255,140,30,0.6);
}
.fx-orb.heal {
    background: radial-gradient(circle, #eafff0 0%, #7dffa8 35%, rgba(40,200,100,0.85) 60%, rgba(40,200,100,0) 74%);
    box-shadow: 0 0 30px 10px rgba(80,240,140,0.6);
}
.fx-dot { width: 8px; height: 8px; border-radius: 50%; background: currentColor; box-shadow: 0 0 8px 2px currentColor; }
.fx-ring { border-radius: 50%; border: 4px solid currentColor; box-shadow: 0 0 18px currentColor, inset 0 0 14px currentColor; }
.fx-slash {
    width: clamp(110px, 31vw, 190px);
    height: clamp(6px, 1.5vw, 9px);
    border-radius: 6px;
    background: linear-gradient(90deg, rgba(255,255,255,0), #ffffff 40%, #bfe9ff 60%, rgba(255,255,255,0));
    box-shadow: 0 0 14px 3px rgba(190,230,255,0.85);
}
.fx-claw {
    width: clamp(90px, 25vw, 150px);
    height: clamp(5px, 1.3vw, 8px);
    border-radius: 6px;
    background: linear-gradient(90deg, rgba(255,60,60,0), #ff8a80 30%, #ffffff 50%, #ff3b3b 70%, rgba(255,60,60,0));
    box-shadow: 0 0 12px 3px rgba(255,60,60,0.8);
}
.fx-bolt {
    width: clamp(5px, 1.3vw, 8px);
    height: clamp(180px, 46vh, 320px);
    translate: -50% -100%;
    border-radius: 4px;
    background: linear-gradient(180deg, rgba(168,85,247,0), #d8b4fe 45%, #ffffff 100%);
    box-shadow: 0 0 18px 5px rgba(168,85,247,0.85);
}
.fx-bubble {
    width: clamp(110px, 32vw, 200px);
    height: clamp(110px, 32vw, 200px);
    border-radius: 50%;
    border: 3px solid rgba(140,240,255,0.95);
    background: radial-gradient(circle, rgba(93,237,236,0) 55%, rgba(93,237,236,0.35) 100%);
    box-shadow: 0 0 30px rgba(52,152,219,0.8), inset 0 0 30px rgba(93,237,236,0.6);
}
.fx-emoji { font-size: clamp(32px, 9vw, 56px); line-height: 1; filter: drop-shadow(0 0 12px rgba(93,237,236,0.9)); }
.fx-sparkle { font-size: clamp(13px, 3.5vw, 20px); font-weight: 800; text-shadow: 0 0 8px currentColor; }

.fx-spear {
    width: clamp(140px, 38vw, 220px);
    height: clamp(6px, 1.5vw, 9px);
    border-radius: 3px;
    background: linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,0.3) 15%, #ffffff 45%, #cfefff 70%, rgba(255,255,255,0.2) 100%);
    box-shadow: 0 0 16px 4px rgba(207,239,255,0.85), inset 0 0 4px #ffffff;
    clip-path: polygon(0 40%, 85% 0, 100% 50%, 85% 100%, 0 60%);
}
.fx-dagger-fx {
    width: clamp(70px, 18vw, 110px);
    height: clamp(4px, 1vw, 6px);
    border-radius: 4px;
    background: linear-gradient(90deg, rgba(200,240,255,0), #e6f7ff 35%, #ffffff 55%, rgba(200,240,255,0));
    box-shadow: 0 0 12px 3px rgba(200,240,255,0.9);
}
.fx-lightning {
    width: clamp(7px, 1.6vw, 11px);
    height: clamp(180px, 46vh, 320px);
    translate: -50% -100%;
    border-radius: 4px;
    background: linear-gradient(180deg, rgba(255,235,59,0), #fff59d 25%, #ffeb3b 55%, #ffffff 100%);
    box-shadow: 0 0 22px 6px rgba(255,235,59,0.9), 0 0 60px 16px rgba(255,193,7,0.4);
}
.fx-vignette {
    position: absolute; inset: 0; pointer-events: none;
    opacity: 0; z-index: 190;
    background: radial-gradient(ellipse at center, rgba(var(--c, 255, 0, 0), 0) 45%, rgba(var(--c, 255, 0, 0), 0.6) 100%);
}
.monster-ui.burning::before, .monster-ui.poisoned::before {
    content: '';
    position: absolute; inset: -2px; border-radius: 17px; pointer-events: none;
    box-shadow: 0 0 20px 4px rgba(255,120,30,0.6), inset 0 0 14px rgba(255,140,40,0.35);
    animation: burn-pulse 1.3s ease-in-out infinite;
}
.monster-ui.poisoned:not(.burning)::before {
    box-shadow: 0 0 20px 4px rgba(150,80,220,0.6), inset 0 0 14px rgba(160,90,230,0.35);
}
@keyframes burn-pulse { 0%, 100% { opacity: 0.45; } 50% { opacity: 1; } }
.player-ui::after, .monster-ui::after {
    content: '';
    position: absolute; inset: 0; border-radius: 15px; pointer-events: none; opacity: 0;
    box-shadow: 0 0 30px 8px rgba(var(--glow, 255, 255, 255), 0.85), inset 0 0 28px rgba(var(--glow, 255, 255, 255), 0.55);
}
.player-ui.glow::after, .monster-ui.glow::after { animation: ui-glow 0.65s ease-out; }
@keyframes ui-glow { 0% { opacity: 0; } 20% { opacity: 1; } 100% { opacity: 0; } }

/* ============================================================
   HAND CONTAINER
   ============================================================ */
.hand-container {
    position: absolute;
    bottom: clamp(8px, 2.4vh, 20px);
    left: 0; right: 0;
    display: flex;
    justify-content: center;
    align-items: flex-end;
    width: 100%;
    height: clamp(175px, 34vh, 280px);
    pointer-events: auto !important;
    z-index: 100;
}
.hand-container::before {
    content: '';
    position: absolute;
    bottom: -5px;
    width: min(650px, 92vw);
    height: clamp(22px, 5vh, 40px);
    background: radial-gradient(ellipse at center, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 75%);
    z-index: 0;
    pointer-events: none;
}

/* ============================================================
   CARTA
   ============================================================ */
.card {
    position: relative;
    width: clamp(108px, 30vw, 200px);
    height: clamp(156px, 43vw, 290px);
    flex-shrink: 0;
    background:
        radial-gradient(ellipse 40% 25% at 78% 18%, rgba(0, 0, 0, 0.5), transparent 70%),
        radial-gradient(ellipse 35% 30% at 20% 78%, rgba(0, 0, 0, 0.4), transparent 70%),
        url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)' opacity='0.15'/%3E%3C/svg%3E"),
        linear-gradient(135deg, #2a2a4a 0%, #1a1a3a 50%, #0f0f28 100%);
    border-radius: clamp(10px, 2.8vw, 15px);
    border: 3px solid var(--ink);
    box-shadow:
        5px 5px 0 var(--ink),
        0 15px 30px rgba(0,0,0,0.7),
        inset 0 0 0 2px rgba(168, 213, 240, 0.12),
        inset 0 0 0 4px rgba(5, 5, 15, 0.6),
        inset 0 0 60px rgba(0, 0, 0, 0.9);
    cursor: grab;
    pointer-events: auto !important;
    transition: transform 0.4s cubic-bezier(0.25, 1, 0.5, 1), box-shadow 0.4s ease, opacity 0.4s ease;
    transform-origin: bottom center;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: clamp(8px, 2.8vw, 14px);
    box-sizing: border-box;
    user-select: none;
    overflow: hidden;
    z-index: 1;
    touch-action: none;
    color: var(--moon-bright);
}
.card:active { cursor: grabbing; }
.card.is-dragging {
    transition: none !important;
    z-index: 99999 !important;
    box-shadow:
        5px 5px 0 var(--ink),
        0 30px 60px rgba(0,0,0,0.8),
        0 0 40px rgba(216, 64, 128, 0.7);
}
.card::after {
    content: '';
    position: absolute; top: 0; left: 0; width: 100%; height: 100%;
    background: linear-gradient(135deg, rgba(200, 224, 240, 0) 0%, rgba(200, 224, 240, 0.15) 50%, rgba(200, 224, 240, 0) 100%);
    opacity: 0;
    transition: opacity 0.3s ease;
    pointer-events: none;
}

/* Borchie agli angoli (solo sulle carte) */
.card .corner {
    position: absolute;
    width: 11px;
    height: 11px;
    border-radius: 50%;
    background: radial-gradient(circle at 35% 30%, #6a6a7a 0%, #2a2a3a 60%, #0a0a15 100%);
    box-shadow:
        inset -1px -1px 2px rgba(0,0,0,0.8),
        inset 1px 1px 2px rgba(255,255,255,0.18),
        0 1px 3px rgba(0,0,0,0.9);
    z-index: 5;
    pointer-events: none;
}
.card .corner.tl { top: 7px; left: 7px; }
.card .corner.tr { top: 7px; right: 7px; }
.card .corner.bl { bottom: 7px; left: 7px; }
.card .corner.br { bottom: 7px; right: 7px; }

.hand-container .card {
    position: absolute;
    left: 50%;
    bottom: 0;
    transform: translateX(-50%) translate(var(--tx, 0px), var(--ty, 0px)) scale(1) rotate(var(--rot, 0deg));
}
.hand-container .card.card-enter {
    transform: translateX(-50%) translate(var(--tx, 0px), 320px) scale(1) rotate(var(--rot, 0deg));
    opacity: 0;
}
.hand-container .card.no-hover { pointer-events: none !important; }

.hand-container .card.hovered:not(.is-dragging):not(.no-hover) {
    transform: translateX(-50%) translate(var(--tx, 0px), calc(var(--ty, 0px) - 50px)) scale(1.1) rotate(0deg);
    box-shadow:
        5px 5px 0 var(--ink),
        0 25px 45px rgba(0,0,0,0.85),
        0 0 35px rgba(168, 213, 240, 0.5),
        inset 0 0 0 2px rgba(168, 213, 240, 0.25),
        inset 0 0 0 4px rgba(5, 5, 15, 0.6),
        inset 0 0 60px rgba(0, 0, 0, 0.9);
    z-index: 100;
}
.hand-container .card.hovered::after { opacity: 1; }

/* Header carta */
.card-header {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    flex-shrink: 0;
    border-bottom: 2px solid rgba(168, 213, 240, 0.2);
    padding: clamp(6px, 1.8vw, 10px) clamp(4px, 1.4vw, 6px);
    margin-top: clamp(6px, 1.8vw, 22px);
    position: relative;
    overflow: hidden;
    z-index: 2;
}

.card-title {
    font-family: 'IM Fell English SC', 'IM Fell English', serif;
    font-weight: 400;
    letter-spacing: 0.5px;
    color: var(--moon-bright);
    text-shadow:
        2px 2px 0 var(--ink),
        1px 1px 0 var(--ink),
        0 0 12px rgba(168, 213, 240, 0.5);
    white-space: nowrap;
    flex: 0 0 auto;
    line-height: 1.1;
}

/* Costo */
.card-cost {
    position: absolute;
    top: clamp(4px, 1.4vw, 8px);
    right: clamp(6px, 1.8vw, 10px);
    font-size: clamp(14px, 3.8vw, 22px);
    z-index: 5;
    display: flex;
    justify-content: flex-end;
    gap: 1px;
    letter-spacing: -1px;
    filter: drop-shadow(0 2px 3px rgba(0,0,0,0.9)) drop-shadow(0 0 6px rgba(122, 216, 255, 0.5));
}

/* Illustrazione */
.card-art {
    position: relative;
    width: 100%;
    box-sizing: border-box;
    height: clamp(50px, 14vw, 100px);
    flex-shrink: 0;
    background:
        radial-gradient(circle at 50% 55%, rgba(122, 216, 255, 0.08), transparent 60%),
        linear-gradient(180deg, #0a0a1f 0%, #0f0f28 50%, #05050f 100%);
    border-radius: clamp(5px, 1.4vw, 8px);
    border: 2px solid var(--ink);
    display: flex;
    justify-content: center;
    align-items: center;
    color: var(--moon);
    font-style: italic;
    font-family: 'IM Fell English', serif;
    font-size: clamp(9.5px, 2.5vw, 17px);
    box-shadow:
        inset 0 2px 4px rgba(0,0,0,0.8),
        inset 0 0 30px rgba(0, 0, 0, 0.9);
    margin-top: clamp(6px, 1.8vw, 10px);
    text-align: center;
    padding: 0 4px;
    text-shadow: 1px 1px 0 var(--ink), 0 0 8px rgba(168, 213, 240, 0.3);
    overflow: hidden;
    z-index: 2;
}

/* Descrizione */
.card-description {
    font-family: 'Kalam', cursive;
    font-weight: 400;
    font-size: clamp(8.5px, 2.3vw, 12.5px);
    color: var(--moon-bright);
    line-height: 1.35;
    flex: 1 1 auto;
    min-height: 0;
    overflow: hidden;
    box-sizing: border-box;
    background:
        url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1' numOctaves='3'/%3E%3CfeColorMatrix values='0 0 0 0 0.5 0 0 0 0 0.4 0 0 0 0 0.25 0 0 0 0.1 0'/%3E%3C/filter%3E%3Crect width='100' height='100' filter='url(%23n)'/%3E%3C/svg%3E"),
        linear-gradient(180deg, rgba(20, 20, 45, 0.7), rgba(10, 10, 26, 0.85));
    padding: clamp(4px, 1.4vw, 8px);
    border-radius: 6px;
    border: 2px solid var(--ink);
    box-shadow:
        inset 0 1px 2px rgba(0,0,0,0.6),
        inset 0 0 20px rgba(0, 0, 0, 0.7);
    margin-top: clamp(4px, 1.4vw, 8px);
    word-break: break-word;
    text-shadow: 1px 1px 0 var(--ink);
    transform: rotate(-0.5deg);
    position: relative;
    z-index: 2;
}

/* Keyword */
.kw {
    cursor: pointer;
    font-family: 'Kalam', cursive;
    font-weight: 700;
    color: var(--moon-bright);
    border-bottom: 1px dotted rgba(168, 213, 240, 0.6);
    transition: color 0.15s ease, border-color 0.15s ease;
    white-space: nowrap;
    text-shadow: 1px 1px 0 var(--ink), 0 0 6px rgba(168, 213, 240, 0.4);
}
.kw:hover, .kw.active {
    color: var(--magenta-light);
    border-bottom-color: var(--magenta-light);
    text-shadow: 1px 1px 0 var(--ink), 0 0 10px rgba(240, 112, 160, 0.7);
}

/* Valori danno */
.dmg-value {
    font-family: 'Cinzel', serif;
    font-weight: 900;
    cursor: pointer;
    color: var(--moon-bright);
    border-bottom: none;
    transition: color 0.3s ease, text-shadow 0.3s ease;
    white-space: nowrap;
    text-shadow:
        1px 1px 0 var(--ink),
        0 0 8px rgba(168, 213, 240, 0.6);
}
.dmg-value.modified-buff {
    color: #6fe08a;
    border-bottom: 1px dotted #6fe08a;
    text-shadow: 1px 1px 0 var(--ink), 0 0 10px rgba(111, 224, 138, 0.9), 0 0 20px rgba(111, 224, 138, 0.5);
}
.dmg-value.modified-buff:hover, .dmg-value.modified-buff.active {
    color: #9aff9a;
    border-bottom-color: #9aff9a;
}
.dmg-value.modified-debuff {
    color: #f5a1b4;
    border-bottom: 1px dotted #f5a1b4;
    text-shadow: 1px 1px 0 var(--ink), 0 0 10px rgba(245, 161, 180, 0.9), 0 0 20px rgba(245, 161, 180, 0.5);
}
.dmg-value.modified-debuff:hover, .dmg-value.modified-debuff.active {
    color: #ffb8c8;
    border-bottom-color: #ffb8c8;
}

/* Tooltip */
.tooltip-popup {
    position: fixed;
    left: -9999px;
    top: 0;
    max-width: min(280px, 82vw);
    padding: 8px 12px;
    background: linear-gradient(145deg, #1a1a3a, #0a0a1a);
    color: var(--moon-bright);
    font-family: 'Montserrat', 'Segoe UI', Tahoma, sans-serif;
    font-size: 12px;
    font-weight: 500;
    line-height: 1.5;
    letter-spacing: 0.1px;
    border-radius: 8px;
    border: 2px solid var(--ink);
    box-shadow:
        3px 3px 0 var(--ink),
        0 12px 28px rgba(0,0,0,0.7),
        0 0 20px rgba(168, 213, 240, 0.15);
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.15s ease;
    z-index: 9999;
    text-align: left;
}
.tooltip-popup.visible { opacity: 1; }
.tooltip-popup .tip-buff { color: #6ff09a; font-weight: 700; }
.tooltip-popup .tip-debuff { color: #f5a1b4; font-weight: 700; }
.tooltip-popup .tip-neutral { color: #c8d0d5; }
.tooltip-popup .tip-total { color: #ffffff; font-weight: 700; }

/* Modal mazzo */
.modal-overlay {
    position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
    background: rgba(5, 5, 15, 0.85);
    backdrop-filter: blur(8px);
    display: flex; justify-content: center; align-items: center;
    z-index: 1000;
    opacity: 0; pointer-events: none;
    transition: opacity 0.3s ease;
}
.modal-overlay.active { opacity: 1; pointer-events: auto; }
.modal-content {
    background:
        radial-gradient(ellipse 60% 40% at 20% 15%, rgba(122, 216, 255, 0.06), transparent 70%),
        linear-gradient(145deg, #2a2a4a 0%, #1a1a3a 45%, #0f0f28 100%);
    border-radius: 20px;
    border: 3px solid var(--ink);
    box-shadow:
        6px 6px 0 var(--ink),
        0 25px 50px rgba(0,0,0,0.8),
        0 0 40px rgba(168, 213, 240, 0.15);
    width: min(80%, 92vw);
    max-width: 950px;
    max-height: 85vh;
    display: flex; flex-direction: column;
    padding: clamp(12px, 3vw, 24px);
    box-sizing: border-box;
    position: relative;
}
.modal-header {
    display: flex; justify-content: space-between; align-items: center;
    border-bottom: 2px solid rgba(168, 213, 240, 0.2);
    padding-bottom: 12px;
    margin-bottom: 20px;
}
.modal-title {
    font-family: 'IM Fell English SC', serif;
    font-size: 18px;
    font-weight: 400;
    color: var(--moon-bright);
    text-shadow: 2px 2px 0 var(--ink), 0 0 12px rgba(168, 213, 240, 0.4);
    letter-spacing: 0.5px;
}
.modal-close-btn {
    background: none; border: none; font-size: 24px; font-weight: bold;
    color: var(--moon-bright);
    cursor: pointer;
    padding: 0 8px;
    border-radius: 6px;
    transition: background 0.2s ease;
    text-shadow: 1px 1px 0 var(--ink);
}
.modal-close-btn:hover { background: rgba(200, 224, 240, 0.1); color: var(--magenta-light); }
.deck-grid {
    display: flex; flex-wrap: wrap; gap: 20px; justify-content: center;
    overflow-y: auto;
    padding: 10px;
}
.deck-grid .card {
    margin: 0;
    width: clamp(96px, 26vw, 200px);
    height: clamp(139px, 37.5vw, 290px);
    transform: none !important;
    cursor: default;
}
.deck-grid .card:hover {
    transform: translateY(-8px) scale(1.03) !important;
    box-shadow:
        5px 5px 0 var(--ink),
        0 15px 30px rgba(0,0,0,0.5),
        0 0 30px rgba(168, 213, 240, 0.3);
}

/* Carte non giocabili */
.hand-container .card.unplayable {
    filter: grayscale(0.75) brightness(0.6);
}
.hand-container .card.unplayable:hover:not(.is-dragging):not(.no-hover),
.hand-container .card.unplayable.hovered:not(.is-dragging):not(.no-hover) {
    transform: translateX(-50%) translate(var(--tx, 0px), var(--ty, 0px)) scale(1) rotate(var(--rot, 0deg));
    box-shadow:
        5px 5px 0 var(--ink),
        0 12px 28px rgba(0,0,0,0.6);
    z-index: 1;
    cursor: not-allowed;
}
.hand-container .card.unplayable:hover::after,
.hand-container .card.unplayable.hovered::after {
    opacity: 0;
}

.card-description b,
.card-description strong {
    font-weight: 700;
    color: var(--moon-bright);
    letter-spacing: -0.1px;
    text-shadow: 1px 1px 0 var(--ink), 0 0 6px rgba(168, 213, 240, 0.3);
}

/* ============================================================
   SFONDO VIDEO (invariato)
   ============================================================ */
.bg-loop {
    position: fixed;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    z-index: -2;
    pointer-events: none;
    user-select: none;
}

body::after {
    content: '';
    position: fixed;
    inset: 0;
    background: radial-gradient(circle at 50% 45%,
                rgba(10, 10, 26, 0) 0%,
                rgba(10, 10, 26, 0.15) 60%,
                rgba(10, 10, 26, 0.55) 100%);
    z-index: -1;
    pointer-events: none;
}
CSSEOF

echo ""
echo "CSS aggiornato. Ora aggiungo le borchie alle carte nell'HTML..."

# Aggiunge le borchie agli angoli delle carte nell'HTML/JS
# Il JS genera le carte, quindi aggiungiamo le borchie via JS
if [ -f js/ui.js ]; then
    if ! grep -q "corner tl" js/ui.js; then
        # Inserisce le 4 borchie subito dopo <div class="card-cost">
        sed -i 's|<div class="card-cost">${cardData.cost}</div>|<div class="corner tl"></div><div class="corner tr"></div><div class="corner bl"></div><div class="corner br"></div><div class="card-cost">${cardData.cost}</div>|' js/ui.js
        echo "Borchie aggiunte al template delle carte."
    else
        echo "Borchie già presenti, skip."
    fi
fi

echo ""
echo "Staging modifiche..."
git add .

echo ""
echo "Commit..."
git commit -m "Applica stile dark fantasy a carte e UI"

echo ""
echo "Push su GitHub..."
git push

echo ""
echo "==============================================="
echo "  FATTO! Lo stile è stato applicato e caricato."
echo "  Ricarica la pagina del gioco nel browser."
echo "==============================================="
echo ""