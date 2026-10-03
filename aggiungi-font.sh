#!/bin/bash
# Aggiunge i font dark fantasy all'index.html
# Uso: bash aggiungi-font.sh

set -e

if grep -q "IM+Fell+English" index.html; then
    echo "Font già presenti, skip."
    exit 0
fi

# Sostituisce il link Montserrat con il link completo (Montserrat + font dark fantasy)
sed -i 's|<link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@500;600;700;800&display=swap" rel="stylesheet">|<link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@500;600;700;800\&family=IM+Fell+English:ital@0;1\&family=IM+Fell+English+SC\&family=Kalam:wght@400;700\&family=Cinzel:wght@600;900\&display=swap" rel="stylesheet">|' index.html

echo "Font aggiunti all'index.html"

git add .
git commit -m "Aggiungi font dark fantasy (IM Fell English, Kalam, Cinzel)"
git push

echo ""
echo "==============================================="
echo "  FATTO! Ricarica il sito con Ctrl+F5."
echo "==============================================="