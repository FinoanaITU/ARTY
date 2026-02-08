#!/bin/bash
# Script de test rapide de l'intégration PHASE 1 - Validation & Approbation

echo "🧪 Test de l'intégration PHASE 1 - VALIDATION & APPROBATION"
echo "============================================================"
echo ""

# Couleurs
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. Vérifier backend
echo "1️⃣  Vérification du backend..."
if curl -s http://localhost:8000/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend opérationnel (http://localhost:8000)${NC}"
else
    echo -e "${RED}❌ Backend non accessible${NC}"
    echo "   → Démarrer avec: cd Back && docker-compose up"
    exit 1
fi

# 2. Vérifier frontend
echo ""
echo "2️⃣  Vérification du frontend..."
if curl -s http://localhost:5173 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Frontend opérationnel (http://localhost:5173)${NC}"
else
    echo -e "${RED}❌ Frontend non accessible${NC}"
    echo "   → Démarrer avec: cd Front && bun run dev"
    exit 1
fi

# 3. Obtenir token admin
echo ""
echo "3️⃣  Connexion administrateur..."
ACCESS_TOKEN=$(curl -s -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@artizaho.com","password":"admin123"}' | \
  grep -o '"access_token":"[^"]*"' | cut -d'"' -f4)

if [ -n "$ACCESS_TOKEN" ]; then
    echo -e "${GREEN}✅ Connexion admin réussie${NC}"
else
    echo -e "${RED}❌ Échec de connexion admin${NC}"
    exit 1
fi

# 4. Tester GET pending validations
echo ""
echo "4️⃣  Test GET /api/v1/admin/validations/pending..."
PENDING_COUNT=$(curl -s -X GET "http://localhost:8000/api/v1/admin/validations/pending?validation_type=all&skip=0&limit=10" \
  -H "Authorization: Bearer $ACCESS_TOKEN" | \
  python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('total', 0))" 2>/dev/null)

if [ -n "$PENDING_COUNT" ]; then
    echo -e "${GREEN}✅ API fonctionnelle - ${PENDING_COUNT} validation(s) en attente${NC}"
else
    echo -e "${RED}❌ Erreur lors de la récupération des validations${NC}"
    exit 1
fi

# 5. Tester GET stats
echo ""
echo "5️⃣  Test GET /api/v1/admin/validations/stats..."
TOTAL_VALIDATIONS=$(curl -s -X GET "http://localhost:8000/api/v1/admin/validations/stats?period=all" \
  -H "Authorization: Bearer $ACCESS_TOKEN" | \
  python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('total_validations', 0))" 2>/dev/null)

if [ -n "$TOTAL_VALIDATIONS" ]; then
    echo -e "${GREEN}✅ Statistiques disponibles - ${TOTAL_VALIDATIONS} validation(s) traitée(s)${NC}"
else
    echo -e "${RED}❌ Erreur lors de la récupération des statistiques${NC}"
    exit 1
fi

# Résumé
echo ""
echo "============================================================"
echo -e "${GREEN}✅ TOUS LES TESTS RÉUSSIS${NC}"
echo ""
echo "📊 État du système:"
echo "   • Backend: ✅ Opérationnel"
echo "   • Frontend: ✅ Opérationnel"
echo "   • API Admin: ✅ Fonctionnelle"
echo "   • Validations en attente: ${PENDING_COUNT}"
echo "   • Validations traitées: ${TOTAL_VALIDATIONS}"
echo ""
echo "🌐 Accéder à l'interface web:"
echo "   URL: ${YELLOW}http://localhost:5173/admin${NC}"
echo "   Email: admin@artizaho.com"
echo "   Password: admin123"
echo ""
echo "📋 Étapes suivantes:"
echo "   1. Ouvrir http://localhost:5173/admin dans votre navigateur"
echo "   2. Se connecter avec les identifiants admin"
echo "   3. Cliquer sur l'onglet 'Validation'"
echo "   4. Tester l'approbation/rejet des profils artisans"
echo ""
echo "📖 Documentation complète:"
echo "   → PHASE_1_FRONTEND_INTEGRATION_COMPLETE.md"
echo ""
