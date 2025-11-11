#!/bin/bash

# Script pour exécuter les migrations Alembic
# Usage: ./scripts/run_migrations.sh

set -e

echo "🚀 Exécution des migrations Alembic..."

# Vérifier si on est dans le bon répertoire
if [ ! -f "alembic.ini" ]; then
    echo "❌ Erreur: alembic.ini non trouvé. Assurez-vous d'être dans le répertoire Back/"
    exit 1
fi

# Vérifier la connexion à la base de données
echo "🔍 Vérification de la connexion à la base de données..."
if python3 -c "from app.core.database import engine; engine.connect(); print('✅ Connexion réussie')" 2>/dev/null; then
    echo "✅ Base de données accessible"
else
    echo "⚠️  Warning: Impossible de vérifier la connexion à la base de données"
    echo "💡 Continuer quand même..."
fi

# Afficher l'état actuel
echo ""
echo "📊 État actuel des migrations:"
alembic current

# Exécuter les migrations
echo ""
echo "📦 Exécution des migrations..."
alembic upgrade head

# Vérifier le résultat
if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Migrations exécutées avec succès!"
    echo ""
    echo "📊 Nouvel état:"
    alembic current
else
    echo ""
    echo "❌ Erreur lors de l'exécution des migrations"
    exit 1
fi

# Optionnel: Exécuter le seed data
echo ""
read -p "🌱 Voulez-vous exécuter le seed data (catégories, admin) ? (o/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Oo]$ ]]; then
    echo "🌱 Exécution du seed data..."
    python3 scripts/seed_initial_data.py
    if [ $? -eq 0 ]; then
        echo "✅ Seed data exécuté avec succès!"
    else
        echo "⚠️  Erreur lors de l'exécution du seed data"
    fi
fi

echo ""
echo "🎉 Terminé!"

