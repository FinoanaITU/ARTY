#!/bin/bash

# Script pour exécuter les tests unitaires d'authentification

set -e

echo "🧪 Exécution des tests unitaires d'authentification"
echo ""

# Aller dans le répertoire Back
cd "$(dirname "$0")"

# Déterminer le chemin de pytest
PYTEST_CMD=""

# Vérifier si pytest est disponible
if command -v pytest &> /dev/null 2>&1 && pytest --version &> /dev/null 2>&1; then
    PYTEST_CMD="pytest"
elif python3 -m pytest --version &> /dev/null 2>&1; then
    PYTEST_CMD="python3 -m pytest"
elif [ -d "env" ] && env/bin/python3 -m pytest --version &> /dev/null 2>&1; then
    PYTEST_CMD="env/bin/python3 -m pytest"
elif [ -d "../.venv" ] && ../.venv/bin/python3 -m pytest --version &> /dev/null 2>&1; then
    PYTEST_CMD="../.venv/bin/python3 -m pytest"
fi

# Si pytest n'est pas trouvé
if [ -z "$PYTEST_CMD" ]; then
    echo "❌ pytest n'est pas installé"
    echo ""
    echo "📖 Pour installer pytest, suivez ces étapes :"
    echo ""
    echo "1. Recréez l'environnement virtuel (recommandé) :"
    echo "   cd $(pwd)"
    echo "   rm -rf env"
    echo "   python3 -m venv env"
    echo "   source env/bin/activate"
    echo "   pip install -r requirements.txt"
    echo ""
    echo "2. Ou installez pytest globalement (non recommandé) :"
    echo "   python3 -m pip install --break-system-packages pytest pytest-asyncio pytest-cov"
    echo ""
    echo "3. Consultez SETUP_TESTS.md pour plus de détails"
    echo ""
    exit 1
fi

# Exécuter les tests
echo "📋 Exécution des tests..."
echo "🔧 Utilisation de: $PYTEST_CMD"
echo ""

# Tests avec couverture
$PYTEST_CMD tests/test_auth*.py \
    -v \
    --tb=short \
    --cov=app.services.auth \
    --cov=app.api.v1.endpoints.auth \
    --cov=app.core.security \
    --cov=app.schemas.user \
    --cov-report=term-missing \
    --cov-report=html \
    -p no:warnings

echo ""
echo "✅ Tests terminés !"
echo ""
echo "📊 Rapport de couverture généré dans htmlcov/index.html"

