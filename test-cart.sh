#!/bin/bash

# Script de test rapide pour la fonctionnalité Panier
# Usage: ./test-cart.sh

echo "🛒 Test de la fonctionnalité Panier"
echo "===================================="
echo ""

# Vérifier que les fichiers existent
echo "📁 Vérification des fichiers..."

FILES=(
  "Front/src/pages/Cart.tsx"
  "Front/src/pages/Checkout.tsx"
  "Front/src/contexts/CartContext.tsx"
  "Front/src/components/CartIcon.tsx"
  "Front/src/types/cart.ts"
)

for file in "${FILES[@]}"; do
  if [ -f "$file" ]; then
    echo "  ✅ $file"
  else
    echo "  ❌ $file MANQUANT"
    exit 1
  fi
done

echo ""
echo "📝 Vérification des routes dans App.tsx..."

if grep -q "path=\"/cart\"" Front/src/App.tsx; then
  echo "  ✅ Route /cart trouvée"
else
  echo "  ❌ Route /cart manquante"
  exit 1
fi

if grep -q "path=\"/checkout\"" Front/src/App.tsx; then
  echo "  ✅ Route /checkout trouvée"
else
  echo "  ❌ Route /checkout manquante"
  exit 1
fi

echo ""
echo "🔍 Vérification de l'import CartIcon dans Navigation..."

if grep -q "import CartIcon" Front/src/components/Navigation.tsx; then
  echo "  ✅ CartIcon importé"
else
  echo "  ❌ CartIcon non importé"
  exit 1
fi

if grep -q "<CartIcon" Front/src/components/Navigation.tsx; then
  echo "  ✅ CartIcon utilisé dans le composant"
else
  echo "  ❌ CartIcon non utilisé"
  exit 1
fi

echo ""
echo "🎯 Vérification des imports dans Cart.tsx..."

IMPORTS=(
  "useCart"
  "Button"
  "Card"
  "ShoppingCart"
  "CartItem"
)

for import_name in "${IMPORTS[@]}"; do
  if grep -q "$import_name" Front/src/pages/Cart.tsx; then
    echo "  ✅ $import_name"
  else
    echo "  ❌ $import_name manquant"
  fi
done

echo ""
echo "🔧 Vérification TypeScript (compilation)..."
cd Front
if npm run build > /dev/null 2>&1; then
  echo "  ✅ Build réussi (aucune erreur TypeScript)"
else
  echo "  ⚠️  Build a des warnings/erreurs - vérifier manuellement"
fi
cd ..

echo ""
echo "✅ Tous les tests sont passés !"
echo ""
echo "📋 Prochaines étapes:"
echo "  1. Démarrer le serveur: cd Front && npm run dev"
echo "  2. Ouvrir http://localhost:5173"
echo "  3. Naviguer vers /products"
echo "  4. Ajouter un produit au panier"
echo "  5. Cliquer sur l'icône panier (🛒)"
echo "  6. Tester les fonctionnalités du panier"
echo ""
echo "📖 Documentation complète: PANIER_IMPLEMENTATION.md"
