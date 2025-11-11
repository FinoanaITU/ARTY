#!/usr/bin/env python3
"""
Script pour vérifier la connexion à la base de données
Utilisé par le script d'entrypoint Docker
"""
import sys
import os

# Ajouter le chemin du projet au PYTHONPATH
sys.path.insert(0, '/app')

try:
    from app.core.config import settings
    from sqlalchemy import create_engine, text
    
    engine = create_engine(settings.DATABASE_URL, pool_pre_ping=True, connect_args={"connect_timeout": 5})
    with engine.connect() as conn:
        result = conn.execute(text('SELECT 1'))
        result.fetchone()
    
    sys.exit(0)
except Exception as e:
    sys.exit(1)

