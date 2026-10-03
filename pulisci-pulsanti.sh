#!/bin/bash
# Rimuove i pulsanti di test dalla pagina equip.html
# Uso: bash pulisci-pulsanti.sh

set -e

echo ""
echo "==============================================="
echo "  Rimuovo i pulsanti di test..."
echo "==============================================="
echo ""

if [ ! -f equip.html ]; then
    echo "ERRORE: equip.html non trovato!"
    exit 1
fi

# Rimuovi i 3 pulsanti di test dal DOM
sed -i '/<button class="test-btn" id="btn-drop">/d' equip.html
sed -i '/<button class="test-btn legendary" id="btn-legendary">/d' equip.html
sed -i '/<button class="test-btn" id="btn-reset">/d' equip.html

# Rimuovi i listener JS dei 3 pulsanti
sed -i "/getElementById('btn-drop').addEventListener('click', simulateVictory);/d" equip.html
sed -i "/getElementById('btn-legendary').addEventListener('click', testLegendary);/d" equip.html
sed -i "/getElementById('btn-reset').addEventListener('click', resetAll);/d" equip.html

echo "Pulsanti rimossi."

git add .
git commit -m "Rimuovi pulsanti di test dalla pagina equipaggiamento"
git push

echo ""
echo "==============================================="
echo "  FATTO! Aspetta 1-2 minuti e ricarica con Ctrl+F5."
echo "==============================================="