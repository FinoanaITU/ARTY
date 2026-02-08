#!/bin/bash
# Script de test rapide pour vérifier l'intégration AdminPanel

echo "=========================================="
echo "🧪 TEST ADMIN PANEL - INTÉGRATION FRONTEND"
echo "=========================================="
echo ""

# Variables
BACKEND_URL="http://localhost:8000"
FRONTEND_URL="http://localhost:5173"
API_URL="$BACKEND_URL/api/v1"

echo "📋 Prérequis:"
echo "   - Backend running sur $BACKEND_URL"
echo "   - Frontend running sur $FRONTEND_URL"
echo "   - Compte admin configuré"
echo ""

# Test 1: Vérifier que le backend est up
echo "✅ Test 1: Backend health check"
curl -s "$BACKEND_URL/health" > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "   ✓ Backend is running"
else
    echo "   ✗ Backend is NOT running"
    echo "   → Start with: cd Back && docker-compose up -d"
    exit 1
fi
echo ""

# Test 2: Vérifier les endpoints analytics
echo "✅ Test 2: Analytics endpoints availability"

endpoints=(
    "/admin/analytics/overview"
    "/admin/analytics/revenue"
    "/admin/analytics/artisans"
    "/admin/quotes/stats/overview"
    "/admin/subscriptions/overview"
)

for endpoint in "${endpoints[@]}"; do
    # Note: Ce test ne vérifie que la disponibilité, pas l'auth
    # Un 401 est acceptable (pas de token), un 404 ne l'est pas
    status=$(curl -s -o /dev/null -w "%{http_code}" "$API_URL$endpoint")
    if [ "$status" = "401" ] || [ "$status" = "200" ]; then
        echo "   ✓ $endpoint (HTTP $status - OK)"
    else
        echo "   ✗ $endpoint (HTTP $status - FAILED)"
    fi
done
echo ""

# Test 3: Vérifier les endpoints de listing
echo "✅ Test 3: Listing endpoints availability"

list_endpoints=(
    "/users"
    "/orders"
    "/workshops"
)

for endpoint in "${list_endpoints[@]}"; do
    status=$(curl -s -o /dev/null -w "%{http_code}" "$API_URL$endpoint")
    if [ "$status" = "401" ] || [ "$status" = "200" ]; then
        echo "   ✓ $endpoint (HTTP $status - OK)"
    else
        echo "   ✗ $endpoint (HTTP $status - FAILED)"
    fi
done
echo ""

# Test 4: Vérifier que le frontend démarre
echo "✅ Test 4: Frontend accessibility"
curl -s "$FRONTEND_URL" > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "   ✓ Frontend is running"
else
    echo "   ✗ Frontend is NOT running"
    echo "   → Start with: cd Front && npm run dev"
fi
echo ""

# Test 5: Vérifier les fichiers modifiés
echo "✅ Test 5: Modified files validation"

if [ -f "/Users/finoanaandriatsilavo/Documents/ARTY/Front/src/services/api.ts" ]; then
    # Vérifier que getUsers existe
    if grep -q "async getUsers" "/Users/finoanaandriatsilavo/Documents/ARTY/Front/src/services/api.ts"; then
        echo "   ✓ api.ts: getUsers() method added"
    else
        echo "   ✗ api.ts: getUsers() method NOT found"
    fi
else
    echo "   ✗ api.ts: File not found"
fi

if [ -f "/Users/finoanaandriatsilavo/Documents/ARTY/Front/src/pages/AdminPanel.tsx" ]; then
    # Vérifier que loadAdminStats existe
    if grep -q "loadAdminStats" "/Users/finoanaandriatsilavo/Documents/ARTY/Front/src/pages/AdminPanel.tsx"; then
        echo "   ✓ AdminPanel.tsx: loadAdminStats() function added"
    else
        echo "   ✗ AdminPanel.tsx: loadAdminStats() function NOT found"
    fi
    
    # Vérifier qu'il n'y a plus de mock data
    if grep -q "Mock data for admin overview" "/Users/finoanaandriatsilavo/Documents/ARTY/Front/src/pages/AdminPanel.tsx"; then
        echo "   ✗ AdminPanel.tsx: Mock data still present (should be removed)"
    else
        echo "   ✓ AdminPanel.tsx: Mock data removed"
    fi
else
    echo "   ✗ AdminPanel.tsx: File not found"
fi
echo ""

# Résumé
echo "=========================================="
echo "📊 RÉSUMÉ DES TESTS"
echo "=========================================="
echo ""
echo "Pour tester manuellement:"
echo "1. Ouvrir http://localhost:5173/admin"
echo "2. Se connecter avec un compte admin"
echo "3. Vérifier que:"
echo "   - Les 6 stats cards affichent des vraies valeurs"
echo "   - L'onglet 'Artisans' affiche les vrais artisans"
echo "   - L'onglet 'Commandes' affiche les vraies commandes"
echo "   - Les boutons d'action fonctionnent"
echo ""
echo "✅ Tests automatiques terminés!"
echo ""
