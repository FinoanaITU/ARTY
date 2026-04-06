#!/bin/bash

echo "🚀 Starting Artizaho Backend..."

# Fonction pour attendre que PostgreSQL soit prêt
wait_for_postgres() {
    echo "⏳ Waiting for PostgreSQL to be ready..."
    local max_attempts=30
    local attempt=0
    
    while [ $attempt -lt $max_attempts ]; do
        # Utiliser le script Python pour vérifier la connexion
        # Essayer d'abord le script dans docker-entrypoint.d (qui n'est pas écrasé par le volume)
        # Sinon, utiliser le script dans /app/scripts (qui vient du volume monté)
        if [ -f /docker-entrypoint.d/check_db_connection.py ]; then
            CHECK_SCRIPT="/docker-entrypoint.d/check_db_connection.py"
        elif [ -f /app/scripts/check_db_connection.py ]; then
            CHECK_SCRIPT="/app/scripts/check_db_connection.py"
        else
            echo "⚠️  check_db_connection.py not found"
            return 1
        fi
        
        if python3 "$CHECK_SCRIPT" >/dev/null 2>&1; then
            echo "✅ PostgreSQL is ready!"
            return 0
        fi
        attempt=$((attempt + 1))
        if [ $attempt -lt $max_attempts ]; then
            echo "⏳ Waiting for PostgreSQL... (attempt $attempt/$max_attempts)"
            sleep 2
        fi
    done
    
    echo "⚠️  Warning: Could not verify PostgreSQL connection after $max_attempts attempts"
    echo "💡 Continuing anyway (depends_on healthcheck should ensure PostgreSQL is ready)..."
    return 1
}

# Le depends_on dans docker-compose avec condition: service_healthy garantit que PostgreSQL est prêt
# Mais on fait une vérification supplémentaire pour être sûr
wait_for_postgres || echo "⚠️  Continuing with migrations anyway..."

# Exécuter les migrations Alembic
echo "📦 Running database migrations..."
cd /app

# Essayer d'abord les migrations Alembic
echo "Running Alembic migrations..."
alembic upgrade head 2>&1 || echo "⚠️  Alembic migrations failed or completed with issues"

# Vérifier si les tables ont été créées, sinon les créer avec SQLAlchemy
echo "Ensuring database tables exist..."
python3 scripts/ensure_db_tables.py

# Exécuter le seed data (catégories, admin user)
echo "🌱 Seeding initial data (categories, admin user)..."
cd /app
python3 scripts/seed_initial_data.py
SEED_EXIT_CODE=$?

if [ $SEED_EXIT_CODE -eq 0 ]; then
    echo "✅ Initial data seeded successfully!"
else
    echo "⚠️  Seed data exited with code: $SEED_EXIT_CODE"
    echo "💡 Check the logs above for details."
    echo "💡 Continuing to start the application..."
fi

# Démarrer l'application
echo "🎉 Starting FastAPI application..."
exec "$@"

