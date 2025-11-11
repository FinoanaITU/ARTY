#!/usr/bin/env python3
"""
Script pour corriger la révision Alembic dans la base de données
Utilisé quand la révision enregistrée ne correspond plus aux migrations existantes

Usage:
    python scripts/fix_migration_revision.py
    # ou depuis Docker
    docker-compose exec backend python scripts/fix_migration_revision.py
"""
import sys
import os

# Ajouter le répertoire parent au path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import create_engine, text, inspect
from app.core.config import settings

def check_tables():
    """Vérifie quelles tables existent dans la base de données"""
    engine = create_engine(settings.DATABASE_URL)
    conn = engine.connect()
    inspector = inspect(engine)
    
    tables = inspector.get_table_names()
    has_products = 'products' in tables
    has_categories = 'categories' in tables
    has_bulk_orders = 'bulk_order_requests' in tables
    has_users = 'users' in tables
    
    # Vérifier la révision actuelle
    try:
        result = conn.execute(text('SELECT version_num FROM alembic_version'))
        current_rev = result.fetchone()
        current_rev_str = current_rev[0] if current_rev else None
    except Exception as e:
        print(f"⚠️  Erreur lors de la lecture de la révision: {e}")
        current_rev_str = None
    
    conn.close()
    
    return {
        'tables': tables,
        'has_products': has_products,
        'has_categories': has_categories,
        'has_bulk_orders': has_bulk_orders,
        'has_users': has_users,
        'current_rev': current_rev_str
    }

def fix_revision(new_revision):
    """Met à jour la révision Alembic dans la base de données"""
    engine = create_engine(settings.DATABASE_URL)
    conn = engine.connect()
    
    try:
        # Mettre à jour la révision
        conn.execute(text(f"UPDATE alembic_version SET version_num = '{new_revision}'"))
        conn.commit()
        print(f"✅ Révision mise à jour vers '{new_revision}'")
        return True
    except Exception as e:
        conn.rollback()
        print(f"❌ Erreur lors de la mise à jour: {e}")
        return False
    finally:
        conn.close()

def main():
    print("=" * 60)
    print("🔍 Vérification de l'état de la base de données...")
    print("=" * 60)
    
    state = check_tables()
    
    print(f"\n📊 État actuel:")
    print(f"  - Révision enregistrée: {state['current_rev']}")
    print(f"  - Table users: {'✅' if state['has_users'] else '❌'}")
    print(f"  - Table categories: {'✅' if state['has_categories'] else '❌'}")
    print(f"  - Table products: {'✅' if state['has_products'] else '❌'}")
    print(f"  - Table bulk_order_requests: {'✅' if state['has_bulk_orders'] else '❌'}")
    
    # Déterminer la bonne révision selon l'état des tables
    if state['current_rev'] == '004':
        print("\n⚠️  Problème détecté: La révision '004' n'existe plus dans les migrations")
        print("   Elle a été remplacée par '004_add_product_tables' et '004_add_bulk_order'")
        
        if state['has_products'] and state['has_categories'] and state['has_bulk_orders']:
            # Les tables existent, la migration a été exécutée
            # Mettre à jour vers la dernière révision
            new_rev = '004_add_bulk_order'
            print(f"\n💡 Les tables existent. Mise à jour vers '{new_rev}'...")
            if fix_revision(new_rev):
                print("\n✅ Correction réussie!")
                print("   Vous pouvez maintenant exécuter: alembic upgrade head")
            else:
                print("\n❌ Échec de la correction")
        elif state['has_products'] and state['has_categories']:
            # Les tables products existent mais pas bulk_order_requests
            new_rev = '004_add_product_tables'
            print(f"\n💡 Tables products créées. Mise à jour vers '{new_rev}'...")
            if fix_revision(new_rev):
                print("\n✅ Correction réussie!")
                print("   Vous pouvez maintenant exécuter: alembic upgrade head")
            else:
                print("\n❌ Échec de la correction")
        else:
            # Les tables n'existent pas, revenir à la révision précédente
            new_rev = '003'
            print(f"\n💡 Tables non créées. Retour vers '{new_rev}'...")
            if fix_revision(new_rev):
                print("\n✅ Correction réussie!")
                print("   Vous pouvez maintenant exécuter: alembic upgrade head")
            else:
                print("\n❌ Échec de la correction")
    else:
        print(f"\n✅ La révision '{state['current_rev']}' semble correcte")
        if state['current_rev'] not in ['001', '002', '003', '004_add_product_tables', '004_add_bulk_order', '005']:
            print("   ⚠️  Mais cette révision n'est pas reconnue dans les migrations actuelles")
            print("   Vous pourriez avoir besoin de corriger manuellement")
        else:
            print("   Aucune correction nécessaire")

if __name__ == "__main__":
    main()
