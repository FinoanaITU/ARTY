"""
Script pour créer les données initiales de l'application
- Catégories et sous-catégories de produits
- Utilisateur admin par défaut
"""
import sys
import os

# Ajouter le répertoire parent au path pour les imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.orm import Session
from app.core.database import SessionLocal, engine
from app.models.product import Category
from app.models.user import User, UserRole
from app.models.base import BaseModel
from app.core.security import get_password_hash
import uuid
import re
from typing import List, Dict, Optional


def generate_slug(name: str) -> str:
    """Génère un slug à partir du nom"""
    slug = name.lower()
    slug = re.sub(r'[^a-z0-9]+', '-', slug)
    slug = re.sub(r'^-+|-+$', '', slug)
    return slug


def create_categories(db: Session) -> Dict[str, Category]:
    """
    Crée les catégories principales et leurs sous-catégories
    Retourne un dictionnaire avec les catégories créées
    """
    categories_data = [
        {
            "name": "Sculpture et Bois",
            "description": "Sculptures en bois traditionnelles malgaches",
            "icon": "sculpture",
            "subcategories": [
                "Masques traditionnels",
                "Figurines",
                "Objets décoratifs",
                "Sculptures animalières",
                "Statuettes religieuses"
            ]
        },
        {
            "name": "Textile et Tissage",
            "description": "Textiles et tissages traditionnels malgaches",
            "icon": "textile",
            "subcategories": [
                "Lambas",
                "Nappes et sets de table",
                "Coussins et coussins",
                "Sacs et paniers en tissu",
                "Tapis et tapisseries"
            ]
        },
        {
            "name": "Poterie et Céramique",
            "description": "Poterie et céramique artisanale malgache",
            "icon": "pottery",
            "subcategories": [
                "Vases et pots",
                "Assiettes et bols",
                "Objets décoratifs",
                "Jardinage",
                "Cuisine traditionnelle"
            ]
        },
        {
            "name": "Bijouterie artisanale",
            "description": "Bijoux artisanaux en matériaux naturels",
            "icon": "jewelry",
            "subcategories": [
                "Colliers",
                "Bracelets",
                "Boucles d'oreilles",
                "Bagues",
                "Accessoires de cheveux"
            ]
        },
        {
            "name": "Vannerie",
            "description": "Objets tressés en fibres naturelles",
            "icon": "basket",
            "subcategories": [
                "Paniers",
                "Sacs",
                "Objets de décoration",
                "Mobilier",
                "Accessoires"
            ]
        },
        {
            "name": "Maroquinerie",
            "description": "Articles en cuir et matériaux naturels",
            "icon": "leather",
            "subcategories": [
                "Sacs à main",
                "Portefeuilles",
                "Ceintures",
                "Chaussures",
                "Accessoires"
            ]
        },
        {
            "name": "Broderie et Couture",
            "description": "Broderie et couture traditionnelle",
            "icon": "embroidery",
            "subcategories": [
                "Nappes brodées",
                "Coussins",
                "Vêtements traditionnels",
                "Accessoires",
                "Décoration murale"
            ]
        },
        {
            "name": "Instruments de musique",
            "description": "Instruments de musique traditionnels malgaches",
            "icon": "music",
            "subcategories": [
                "Valiha",
                "Kabosy",
                "Jejy voatavo",
                "Tambours",
                "Accessoires"
            ]
        },
        {
            "name": "Peinture et Art",
            "description": "Peintures et œuvres d'art traditionnelles",
            "icon": "painting",
            "subcategories": [
                "Peintures sur toile",
                "Peintures sur bois",
                "Aquarelles",
                "Croquis",
                "Art contemporain"
            ]
        },
        {
            "name": "Cuisine et Gastronomie",
            "description": "Produits culinaires et gastronomiques",
            "icon": "food",
            "subcategories": [
                "Épices",
                "Miels",
                "Fruits secs",
                "Conserves",
                "Boissons"
            ]
        },
        {
            "name": "Décoration intérieure",
            "description": "Objets de décoration pour la maison",
            "icon": "decoration",
            "subcategories": [
                "Luminaires",
                "Miroirs",
                "Cadres",
                "Vases",
                "Objets décoratifs"
            ]
        },
        {
            "name": "Autres",
            "description": "Autres produits artisanaux",
            "icon": "other",
            "subcategories": []
        }
    ]
    
    created_categories = {}
    
    for idx, category_data in enumerate(categories_data):
        # Vérifier si la catégorie existe déjà (catégorie principale = pas de parent)
        from sqlalchemy import and_
        existing_category = db.query(Category).filter(
            and_(
                Category.name == category_data["name"],
                Category.parent_id.is_(None)  # Catégorie principale
            )
        ).first()
        
        if existing_category:
            print(f"✓ Catégorie '{category_data['name']}' existe déjà")
            created_categories[category_data["name"]] = existing_category
            category = existing_category
        else:
            # Créer la catégorie principale (parent_id = None)
            category = Category(
                id=uuid.uuid4(),
                name=category_data["name"],
                slug=generate_slug(category_data["name"]),
                description=category_data.get("description"),
                icon=category_data.get("icon"),
                parent_id=None,  # Catégorie principale
                is_active=True,
                level=0,
                path=generate_slug(category_data["name"]),
                sort_order=idx
            )
            db.add(category)
            db.flush()
            print(f"✓ Catégorie '{category_data['name']}' créée")
            created_categories[category_data["name"]] = category
        
        # Créer les sous-catégories
        for sub_idx, subcategory_name in enumerate(category_data.get("subcategories", [])):
            # Vérifier si la sous-catégorie existe déjà
            # Pour SQLite, on doit comparer avec str() si nécessaire
            from app.utils.id_utils import get_db_type, id_to_string
            db_type = get_db_type(db)
            
            if db_type == 'sqlite':
                category_id_str = id_to_string(category.id)
                existing_subcategory = db.query(Category).filter(
                    and_(
                        Category.name == subcategory_name,
                        Category.parent_id == category_id_str
                    )
                ).first()
            else:
                existing_subcategory = db.query(Category).filter(
                    and_(
                        Category.name == subcategory_name,
                        Category.parent_id == category.id
                    )
                ).first()
            
            if existing_subcategory:
                print(f"  ✓ Sous-catégorie '{subcategory_name}' existe déjà")
            else:
                # Générer un slug unique en incluant le parent si nécessaire
                base_slug = generate_slug(subcategory_name)
                # Vérifier si le slug existe déjà (même avec un parent différent)
                slug_exists = db.query(Category).filter(Category.slug == base_slug).first()
                
                if slug_exists:
                    # Si le slug existe déjà, créer un slug unique avec le parent
                    unique_slug = f"{category.slug}-{base_slug}"
                    # Vérifier à nouveau l'unicité
                    counter = 1
                    while db.query(Category).filter(Category.slug == unique_slug).first():
                        unique_slug = f"{category.slug}-{base_slug}-{counter}"
                        counter += 1
                    final_slug = unique_slug
                    final_path = f"{category.path}/{unique_slug}"
                else:
                    final_slug = base_slug
                    final_path = f"{category.path}/{base_slug}"
                
                subcategory = Category(
                    id=uuid.uuid4(),
                    name=subcategory_name,
                    slug=final_slug,
                    parent_id=category.id,  # GUID gère la conversion
                    is_active=True,
                    level=1,
                    path=final_path,
                    sort_order=sub_idx
                )
                db.add(subcategory)
                print(f"  ✓ Sous-catégorie '{subcategory_name}' créée (slug: {final_slug})")
    
    db.commit()
    return created_categories


def create_admin_user(db: Session) -> Optional[User]:
    """Crée un utilisateur admin par défaut si il n'existe pas"""
    admin_email = "admin@artizaho.com"
    admin_password = "admin123"  # À changer en production
    
    # Vérifier si l'admin existe déjà
    existing_admin = db.query(User).filter(User.email == admin_email).first()
    if existing_admin:
        print(f"✓ Utilisateur admin '{admin_email}' existe déjà")
        return existing_admin
    
    # Créer le hash du mot de passe
    password_hash = get_password_hash(admin_password)
    
    # Créer l'utilisateur admin
    admin_user = User(
        id=uuid.uuid4(),
        email=admin_email,
        password_hash=password_hash,
        name="Administrateur Artizaho",
        role=UserRole.ADMIN,
        is_active=True,
        is_email_verified=True,
        country="madagascar"
    )
    
    db.add(admin_user)
    db.commit()
    db.refresh(admin_user)
    
    print(f"✓ Utilisateur admin créé: {admin_email} / {admin_password}")
    print(f"  ⚠️  ATTENTION: Changez le mot de passe en production!")
    
    return admin_user


def seed_initial_data():
    """Fonction principale pour créer les données initiales"""
    print("=" * 60)
    print("Initialisation des données de base...")
    print("=" * 60)
    
    db = SessionLocal()
    try:
        # Créer les catégories
        print("\n📁 Création des catégories...")
        categories = create_categories(db)
        print(f"\n✓ {len(categories)} catégories principales créées/vérifiées")
        
        # Créer l'utilisateur admin
        print("\n👤 Création de l'utilisateur admin...")
        admin_user = create_admin_user(db)
        
        print("\n" + "=" * 60)
        print("✅ Initialisation terminée avec succès!")
        print("=" * 60)
        
    except Exception as e:
        db.rollback()
        print(f"\n❌ Erreur lors de l'initialisation: {e}")
        import traceback
        traceback.print_exc()
        # Ne pas lever l'exception si les tables n'existent pas encore
        # (peut arriver si appelé avant les migrations)
        if "does not exist" in str(e) or "no such table" in str(e).lower():
            print("ℹ️  Tables not found yet. This is normal if migrations haven't run yet.")
            return
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_initial_data()

