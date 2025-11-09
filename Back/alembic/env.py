from logging.config import fileConfig
from sqlalchemy import engine_from_config
from sqlalchemy import pool
from alembic import context
import os
import sys

# Ajouter le chemin du projet au PYTHONPATH
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

# Import des modèles et de la config
from app.core.config import settings
from app.models.base import BaseModel

# Import uniquement des modèles User pour l'authentification
# Les autres modèles seront importés progressivement quand leurs relations seront configurées
from app.models.user import User, ArtisanProfile, ArtisanPhoto, UserSession, SocialAccount

# Temporarily disable imports of other models to avoid circular dependency issues
# These will be enabled when all relationships are properly configured
# from app.models import user, product, order, workshop, review, notification, analytics

# this is the Alembic Config object
config = context.config

# Interpréter le fichier de configuration pour le logging
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Override sqlalchemy.url avec la variable d'environnement
config.set_main_option("sqlalchemy.url", settings.DATABASE_URL)

# add your model's MetaData object here
target_metadata = BaseModel.metadata

def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode."""
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """Run migrations in 'online' mode."""
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection, target_metadata=target_metadata
        )

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
