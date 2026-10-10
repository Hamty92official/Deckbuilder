# CLAUDE.md — Contesto AI per Deckbuilder

## Cos'è
Gioco deckbuilder dark fantasy HTML/CSS/JS vanilla, single-player, locale (file://).
Niente framework, niente build step, niente node/python.

## Autore & workflow
- Sviluppatore singolo, Windows + Git Bash
- Editor: Notepad++
- Test: apri `index.html` nel browser
- Commit dopo ogni step verificato

## Workflow CRITICO (per l'AI)
- Niente node, niente python — non installati
- Solo bash, sed, awk, grep per gli script
- Script .sh salvati in LF (Unix) con Notepad++
- Esecuzione: `cd /c/Users/ivanp/Documents/Deckbuilder && bash nome-script.sh`
- Niente file .bak — rollback via git
- Modifiche a HTML/CSS/JS grandi: verifica righe esatte con `sed -n` PRIMA
- Verifica SEMPRE bilanciamento graffe con awk prima di scrivere
- Backup temporaneo `file.work` con cp, rimosso a fine script (mai committare)
- Andare per step piccoli e verificabili

## Struttura
```
assets/     -> 8 media (6 webm + 2 png: bg-mappa, targhetta)
css/        -> style.css (gioco), map.css (mappa)
js/         -> 12 file (vedi sotto)
index.html, shop.html, equip.html
favicon.svg
CLAUDE.md, .gitignore
```

## File JS
- data.js       - carte base, boss, nemici, stato globale, persistenza
- shop-cards.js - 40 carte shop (10 per rarita)
- effects.js    - FX carte + fine battaglia
- engine.js     - turni, drag, startBattleFromMap, updateActionButtonsState
- fx-utils.js   - helper animazioni DOM
- loot.js       - drop equip + persistenza (LootSystem)
- main.js       - boot, serialize/apply, slot, autosave
- map.js        - MapSystem (mappa, nodi, tooltip)
- menu.js       - MenuSystem (start/pause/slot)
- save.js       - SaveSystem (5 slot localStorage)
- ui.js         - render hand, updateUIStats, drop modal
- page-transition.js - fade in/out tra pagine (window.navigateTo)

## Convenzioni codice
- IIFE: `(function(global){ 'use strict'; ... })(window)`
- Save state: localStorage prefisso `db_` (es. db_slot_1, db_deck_custom)
- CSS: variabili :root (vedi palette)
- Carte: campi fx (tipo animazione), type, desc con {DMG}, helper kw()
- Costo carte: stringa 💎 (contata con .length)
- Niente emoji custom nei grafici (solo SVG o emoji native)
- Rarita carte shop: noncomune (verde), raro (blu), epico (viola), leggendario (arancio)

## Palette (:root)
- --ink #0a0a1a
- --moon #c8e0f0
- --gold #d8a840
- --magenta #d84080
- --blood #c83048
- --mana #7ad8ff
- + --ink-deep, --night-1/2/3, --moon-bright, --moon-shadow, --gold-light, --magenta-light, --blood-light, --rarity-*

## Font
- IM Fell English (+ SC) - titoli carte, entity name
- Cinzel - bottoni, label, titoli pannelli
- Kalam - descrizioni carte, testi narrativi
- Montserrat - tooltip, numeri

## Z-index layer
- Video background: -2
- Gioco/UI: 10-100
- Map overlay: 800
- Menu overlay: 5000
- Battle drop modal: 9500
- Scene transition: 9999
- Page transition: 99999

## Stato attuale - FATTO
- Core game: turni, drag, effetti, status, equip 10 slot, 5 save slot, menu
- Sistema mappa: 6-8 piani, nodi (battle/campfire/statue/shop/unifier/bossFinal),
  generatore anti-crossing, bg-mappa.webm + pergamena PNG
- Tooltip nodi laterale v2 con bullet
- Fase 4: 40 carte shop (10 per rarita) in shop-cards.js
- Fase 5: shop come pagina separata (shop.html + bg-antiquario.webm)
  - 3 carte offerte pesate per rarita, trade con sacrificio (costo per rarita)
  - Min 15 carte nel mazzo (blocca con messaggio)
  - Reroll: solo se equip ha totReroll (5 item: 2 leggendari +2, 3 epici +1)
  - Deck persistente (db_deck_custom + getPersistentDeck/savePersistentDeck/isDeckCustom)
  - Trade modifica il deck in modo permanente
- Polish recente:
  - Velo rimosso su tutte le pagine
  - Shop ridisegnato (back-btn top-left, 2 colonne info/carte, reroll grande,
    sezione note, carte 200x290, allineamento 1:1)
  - Transizioni morbide tra pagine (page-transition.js)
  - Fix mappa: pergamena riempie stage, nodo current statico,
    click nodi robusti (post-shop), padding nodi aumentato
  - Pulsanti azione (mappa/zaino/mazzo) abilitati a inizio battaglia
  - Media spostati in assets/
  - Favicon SVG

## Cosa manca - DA FARE

### Fase 6 - Fontana con regen (PROSSIMO)
Pagina separata fontana.html + assets/bg-fontana.webm
- Cura 50% HP (come campfire)
- +1 HP all'inizio di ogni turno per i prossimi 3 scontri consecutivi
- Se trovi un'altra fontana con buff attivo -> RESETTA a 3 (refresh durata)
- Buff visibile nel pannello player (es. "Rigenera: +1 x 3")
- Nodo fontana redireziona a fontana.html (invece del popup attuale)
- Variabile pianificata: fountainRegenBattles (let globale in data.js)

### Fase 7 - Forgiacarte
Pagina separata forgia.html + assets/bg-forgia.webm
- Scegli 2 carte dal mazzo -> unifica in 1
- Danni/valori sommati, effetti accorpati (brucia + avvelena)
- Nome generato dinamicamente
- Stesso Min 15 carte nel mazzo
- Nodo forgia redireziona a forgia.html

### Fase 8 - Carta "Unica" boss finale
- Vittoria boss -> nuova mappa, livello +1
- Drop carta Unica bianca (gradiente animato tipo enchant)
- Effetti speciali forti, non ottenibili altrove
- Aggiunta al mazzo permanente

## Decisioni prese dall'utente
1. Campfire (riposo): resta popup su mappa, non pagina separata
2. bg-fontana.webm e bg-forgia.webm: gia pronti (da mettere in assets/)
3. Interazione fontana: bottoni "Bevi" + "Torna indietro" (proposta, da confermare)

## Note importanti
- Gioco gira da file:// -> niente ES modules, niente fetch
- Errore console "Unsafe attempt to load URL file://..." = normale, ignorabile
- MapSystem ha exportState/importState per serializzare la mappa nei salvataggi
- Deck persistente (db_deck_custom) override il deck di default
- Carte in mano usano CSS vars --tx/--ty/--rot per il layout
- La mano usa hitbox personalizzate (computeHandBoxes) per hover/drag