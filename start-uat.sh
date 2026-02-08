#!/bin/bash
# Script de démarrage pour les Tests d'Acceptation Utilisateur (UAT)
# ARTY - Dashboard Artisan

set -e

echo "🧪 =========================================="
echo "   ARTY - Tests d'Acceptation Utilisateur"
echo "   Dashboard Artisan"
echo "=========================================="
echo ""

# Couleurs
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Vérifier que nous sommes dans le bon dossier
if [ ! -d "Front" ] || [ ! -d "Back" ]; then
    echo -e "${RED}❌ Erreur: Ce script doit être exécuté depuis le dossier racine ARTY${NC}"
    exit 1
fi

echo -e "${BLUE}📋 Checklist Prérequis${NC}"
echo ""

# 1. Vérifier le backend
echo -n "1️⃣  Vérification du backend (http://localhost:8000)... "
if curl -s http://localhost:8000/docs > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend accessible${NC}"
else
    echo -e "${RED}❌ Backend non accessible${NC}"
    echo "   Démarrez le backend avec: make restart"
    exit 1
fi

# 2. Vérifier la base de données
echo -n "2️⃣  Vérification de la base de données... "
# Vérifier via un appel API plutôt que directement la DB
if curl -s http://localhost:8000/api/v1/products/ > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Base de données accessible${NC}"
else
    echo -e "${YELLOW}⚠️  Impossible de vérifier la DB${NC}"
fi

# 3. Vérifier les dépendances frontend
echo -n "3️⃣  Vérification des dépendances frontend... "
cd Front
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}⚠️  Installation des dépendances...${NC}"
    npm install || bun install
fi
echo -e "${GREEN}✅ Dépendances OK${NC}"

# 4. Vérifier le fichier .env
echo -n "4️⃣  Vérification de la configuration... "
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}⚠️  Création du fichier .env${NC}"
    echo "VITE_API_URL=http://localhost:8000/api/v1" > .env
fi
echo -e "${GREEN}✅ Configuration OK${NC}"
cd ..

echo ""
echo -e "${GREEN}✅ Tous les prérequis sont satisfaits !${NC}"
echo ""

# Afficher les informations importantes
echo -e "${BLUE}📊 Services en cours d'exécution:${NC}"
echo "   • Backend API:  http://localhost:8000"
echo "   • Swagger UI:   http://localhost:8000/docs"
echo "   • ReDoc:        http://localhost:8000/redoc"
echo ""

# Demander si on doit démarrer le frontend
echo -e "${YELLOW}🚀 Démarrer le frontend pour les tests ?${NC}"
echo "   Le frontend sera accessible sur: http://localhost:5173"
echo ""
read -p "Appuyez sur Entrée pour démarrer, ou Ctrl+C pour annuler... " -r
echo ""

# Démarrer le frontend
echo -e "${BLUE}🌐 Démarrage du frontend...${NC}"
cd Front

# Déterminer quel gestionnaire de paquets utiliser
if command -v bun &> /dev/null; then
    echo "   Utilisation de bun..."
    bun dev
elif command -v npm &> /dev/null; then
    echo "   Utilisation de npm..."
    npm run dev
else
    echo -e "${RED}❌ Ni npm ni bun n'est installé${NC}"
    exit 1
fi

# Note: Le script se terminera quand le serveur dev s'arrête (Ctrl+C)
