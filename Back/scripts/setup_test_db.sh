#!/bin/bash

set -e

echo "🔧 Configuration de la base de données PostgreSQL pour les tests..."

DB_NAME="${TEST_DB_NAME:-artizaho_test_db}"
DB_USER="${TEST_DB_USER:-test_user}"
DB_PASSWORD="${TEST_DB_PASSWORD:-test_password}"
DB_HOST="${TEST_DB_HOST:-localhost}"
DB_PORT="${TEST_DB_PORT:-5432}"

if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL n'est pas installé sur ce système."
    echo "📦 Installation recommandée:"
    echo "   - macOS: brew install postgresql"
    echo "   - Ubuntu: sudo apt-get install postgresql"
    echo "   - Docker: docker run -d --name postgres-test -e POSTGRES_PASSWORD=test_password -p 5432:5432 postgres:15"
    exit 1
fi

if psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -lqt | cut -d \| -f 1 | grep -qw "$DB_NAME"; then
    echo "✅ La base de données '$DB_NAME' existe déjà."
    read -p "Voulez-vous la supprimer et la recréer? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "🗑️  Suppression de la base de données existante..."
        psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -c "DROP DATABASE IF EXISTS $DB_NAME;"
    else
        echo "✅ Utilisation de la base de données existante."
        exit 0
    fi
fi

echo "📦 Création de la base de données '$DB_NAME'..."
psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -c "CREATE DATABASE $DB_NAME;"

echo "✅ Base de données créée avec succès!"
echo ""
echo "📝 Configuration pour les tests:"
echo "   TEST_DATABASE_URL=postgresql://$DB_USER:$DB_PASSWORD@$DB_HOST:$DB_PORT/$DB_NAME"
echo ""
echo "💡 Pour utiliser cette base de données dans les tests:"
echo "   export TEST_DATABASE_URL=postgresql://$DB_USER:$DB_PASSWORD@$DB_HOST:$DB_PORT/$DB_NAME"
echo "   pytest"

