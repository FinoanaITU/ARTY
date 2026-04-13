"""
Script pour créer les données initiales de l'application
- Catégories et sous-catégories de produits
- Utilisateur admin par défaut
- Artisans de démonstration
- Produits de démonstration (5 par catégorie, bien classés par sous-catégorie)
"""
import sys
import os
from datetime import datetime, timezone

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import sqlalchemy as sa
from sqlalchemy.orm import Session
from app.core.database import SessionLocal, engine
from app.models.product import Category, Product, ProductImage
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

        from sqlalchemy import and_
        existing_category = db.query(Category).filter(
            and_(
                Category.name == category_data["name"],
                Category.parent_id.is_(None)
            )
        ).first()
        
        if existing_category:
            print(f"✓ Catégorie '{category_data['name']}' existe déjà")
            created_categories[category_data["name"]] = existing_category
            category = existing_category
        else:

            category = Category(
                id=uuid.uuid4(),
                name=category_data["name"],
                slug=generate_slug(category_data["name"]),
                description=category_data.get("description"),
                icon=category_data.get("icon"),
                parent_id=None,
                is_active=True,
                level=0,
                path=generate_slug(category_data["name"]),
                sort_order=idx
            )
            db.add(category)
            db.flush()
            print(f"✓ Catégorie '{category_data['name']}' créée")
            created_categories[category_data["name"]] = category
        

        for sub_idx, subcategory_name in enumerate(category_data.get("subcategories", [])):

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

                base_slug = generate_slug(subcategory_name)

                slug_exists = db.query(Category).filter(Category.slug == base_slug).first()
                
                if slug_exists:

                    unique_slug = f"{category.slug}-{base_slug}"

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
                    parent_id=category.id,
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
    admin_password = "admin123"
    

    result = db.execute(sa.text("SELECT email FROM users WHERE email = :email"), {"email": admin_email})
    existing_admin = result.first()
    
    if existing_admin:
        print(f"✓ Utilisateur admin '{admin_email}' existe déjà")
        return db.query(User).filter(User.email == admin_email).first()
    

    password_hash = get_password_hash(admin_password)
    

    admin_id = str(uuid.uuid4())
    db.execute(sa.text("""
        INSERT INTO users (id, email, password_hash, name, country, role, is_active, is_email_verified)
        VALUES (:id, :email, :password_hash, :name, :country, CAST(:role AS userrole), :is_active, :is_email_verified)
    """), {
        "id": admin_id,
        "email": admin_email,
        "password_hash": password_hash,
        "name": "Administrateur Artizaho",
        "country": "madagascar",
        "role": "admin",
        "is_active": True,
        "is_email_verified": True
    })
    db.commit()
    
    print(f"✓ Utilisateur admin créé: {admin_email} / {admin_password}")
    print(f"  ⚠️  ATTENTION: Changez le mot de passe en production!")
    

    return db.query(User).filter(User.email == admin_email).first()

def create_artisan_users(db: Session) -> Dict[str, User]:
    """Crée des artisans de démonstration"""
    artisans_data = [
        {
            "email": "rakoto.michel@artizaho.com",
            "name": "Rakoto Michel",
            "region": "Antananarivo",
            "bio": "Sculpteur traditionnel depuis 20 ans, spécialiste des masques Zafimaniry.",
        },
        {
            "email": "hery.rasoamanana@artizaho.com",
            "name": "Hery Rasoamanana",
            "region": "Fianarantsoa",
            "bio": "Artisane spécialisée en textile et broderie traditionnelle malgache.",
        },
        {
            "email": "naina.andriamalala@artizaho.com",
            "name": "Naina Andriamalala",
            "region": "Mahajanga",
            "bio": "Bijoutier artisanal utilisant des pierres précieuses de Madagascar.",
        },
    ]

    created = {}
    for data in artisans_data:
        existing = db.query(User).filter(User.email == data["email"]).first()
        if existing:
            print(f"✓ Artisan '{data['name']}' existe déjà")
            created[data["name"]] = existing
            continue

        artisan_id = str(uuid.uuid4())
        db.execute(sa.text("""
            INSERT INTO users (id, email, password_hash, name, country, role, is_active, is_email_verified)
            VALUES (:id, :email, :password_hash, :name, :country, CAST(:role AS userrole), :is_active, :is_email_verified)
        """), {
            "id": artisan_id,
            "email": data["email"],
            "password_hash": get_password_hash("artisan123"),
            "name": data["name"],
            "country": "madagascar",
            "role": "artisan",
            "is_active": True,
            "is_email_verified": True,
        })
        db.commit()
        user = db.query(User).filter(User.email == data["email"]).first()
        created[data["name"]] = user
        print(f"✓ Artisan '{data['name']}' créé")

    return created


def _get_subcategory(db: Session, parent_name: str, sub_name: str) -> Optional[Category]:
    """Récupère une sous-catégorie par nom de parent et nom de sous-catégorie."""
    from sqlalchemy import and_
    parent = db.query(Category).filter(
        Category.name == parent_name,
        Category.parent_id.is_(None)
    ).first()
    if not parent:
        return None
    return db.query(Category).filter(
        and_(Category.name == sub_name, Category.parent_id == parent.id)
    ).first()


def create_products(db: Session, artisans: Dict[str, User]) -> None:
    """Crée 5 produits par catégorie, un par sous-catégorie."""
    from sqlalchemy import and_

    artisan_list = list(artisans.values())
    if not artisan_list:
        print("⚠️  Aucun artisan disponible pour créer les produits")
        return

    def artisan(i: int) -> User:
        return artisan_list[i % len(artisan_list)]

    # Structure : (category, subcategory, title, description, price, stock, materials, image_url)
    products_data = [
        # ── Sculpture et Bois ──────────────────────────────────────────────────
        ("Sculpture et Bois", "Masques traditionnels",
         "Masque traditionnel Zafimaniry",
         "Masque cérémoniel sculpté à la main dans du bois de palissandre, orné de motifs géométriques Zafimaniry UNESCO.",
         85.00, 8, ["Palissandre", "Cire naturelle"],
         "https://images.unsplash.com/photo-1604849329718-c4e16d3e064c?w=600&h=600&fit=crop", 0),
        ("Sculpture et Bois", "Figurines",
         "Figurine paysanne malgache",
         "Figurine artisanale représentant une femme portant un lamba, sculptée dans du bois de rose.",
         45.00, 15, ["Bois de rose", "Cire d'abeille"],
         "https://images.unsplash.com/photo-1519710164239-da123dc03ef4?w=600&h=600&fit=crop", 1),
        ("Sculpture et Bois", "Objets décoratifs",
         "Bol en bois tourné",
         "Bol décoratif tourné à la main en bois de tamarinier, finition huile de lin naturelle.",
         35.00, 20, ["Tamarinier", "Huile de lin"],
         "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=600&fit=crop", 0),
        ("Sculpture et Bois", "Sculptures animalières",
         "Zébu sculpté en bois précieux",
         "Sculpture animalière d'un zébu, symbole national de Madagascar, taillée dans du bois d'ébène.",
         120.00, 5, ["Ébène", "Cire carnauba"],
         "https://images.unsplash.com/photo-1531685250784-7569952593d2?w=600&h=600&fit=crop", 1),
        ("Sculpture et Bois", "Statuettes religieuses",
         "Statuette Baobab sculptée",
         "Statuette représentant le baobab sacré, arbre emblématique de Madagascar, en bois de manguier.",
         65.00, 10, ["Manguier", "Pigments naturels"],
         "https://images.unsplash.com/photo-1565043589221-1a6fd9ae45c7?w=600&h=600&fit=crop", 2),

        # ── Textile et Tissage ─────────────────────────────────────────────────
        ("Textile et Tissage", "Lambas",
         "Lamba traditionnel en soie sauvage",
         "Lamba tissé à la main en soie sauvage de Madagascar, motifs traditionnels Merina multicolores.",
         95.00, 12, ["Soie sauvage", "Teintures végétales"],
         "https://images.unsplash.com/photo-1610992015732-2449b76344bc?w=600&h=600&fit=crop", 1),
        ("Textile et Tissage", "Nappes et sets de table",
         "Set de table en raphia tressé",
         "Set de 6 sets de table tressés à la main en fibres de raphia naturel, résistant et écologique.",
         40.00, 25, ["Raphia naturel"],
         "https://images.unsplash.com/photo-1615529182904-14819c35db37?w=600&h=600&fit=crop", 2),
        ("Textile et Tissage", "Coussins et coussins",
         "Coussin brodé motifs malgaches",
         "Coussin 45×45 cm brodé à la main de motifs géométriques traditionnels malgaches, rembourrage coton.",
         55.00, 18, ["Coton", "Fils de soie", "Kapok"],
         "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=600&h=600&fit=crop", 0),
        ("Textile et Tissage", "Sacs et paniers en tissu",
         "Sac kabary en tissu traditionnel",
         "Sac à main confectionné dans un tissu kabary aux couleurs vives, doublure en coton naturel.",
         48.00, 14, ["Tissu kabary", "Coton"],
         "https://images.unsplash.com/photo-1614179818812-dbe4e2e34af8?w=600&h=600&fit=crop", 1),
        ("Textile et Tissage", "Tapis et tapisseries",
         "Tapis sisal tissé à la main",
         "Tapis 80×120 cm en fibres de sisal naturel tressées à la main, motifs géométriques traditionnels.",
         130.00, 6, ["Sisal naturel", "Laine"],
         "https://images.unsplash.com/photo-1600166898405-da9535204843?w=600&h=600&fit=crop", 2),

        # ── Poterie et Céramique ───────────────────────────────────────────────
        ("Poterie et Céramique", "Vases et pots",
         "Vase en argile rouge de Morondava",
         "Vase en argile rouge traditionnelle de Morondava, cuit au four bois, motifs gravés à la main.",
         55.00, 10, ["Argile rouge", "Engobe naturel"],
         "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=600&h=600&fit=crop", 0),
        ("Poterie et Céramique", "Assiettes et bols",
         "Bol en céramique émaillée malgache",
         "Bol artisanal en céramique émaillée à la main, motifs floraux inspirés de la flore malgache.",
         28.00, 30, ["Céramique", "Émail naturel"],
         "https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=600&h=600&fit=crop", 1),
        ("Poterie et Céramique", "Objets décoratifs",
         "Bougeoir poterie artisanale",
         "Bougeoir en terre cuite façonné à la main, percé de motifs étoilés projetant des ombres décoratives.",
         32.00, 22, ["Terre cuite", "Engobe"],
         "https://images.unsplash.com/photo-1602874801007-bd458bb1b8b6?w=600&h=600&fit=crop", 2),
        ("Poterie et Céramique", "Jardinage",
         "Pot de jardin en argile naturelle",
         "Grand pot de jardin façonné à la main en argile naturelle de Madagascar, idéal pour plantes.",
         42.00, 15, ["Argile naturelle"],
         "https://images.unsplash.com/photo-1530092285049-1c42085fd395?w=600&h=600&fit=crop", 0),
        ("Poterie et Céramique", "Cuisine traditionnelle",
         "Marmite en céramique traditionnelle",
         "Marmite en céramique traditionnelle utilisée pour la cuisine malgache, résistante à la chaleur.",
         68.00, 8, ["Céramique réfractaire", "Argile blanche"],
         "https://images.unsplash.com/photo-1606787366850-de6330128bfc?w=600&h=600&fit=crop", 1),

        # ── Bijouterie artisanale ──────────────────────────────────────────────
        ("Bijouterie artisanale", "Colliers",
         "Collier en pierres de Madagascar",
         "Collier en pierres semi-précieuses de Madagascar : labradorite, quartz rose et améthyste.",
         75.00, 12, ["Labradorite", "Quartz rose", "Fil argenté"],
         "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&h=600&fit=crop", 2),
        ("Bijouterie artisanale", "Bracelets",
         "Bracelet en cuir tressé orné",
         "Bracelet en cuir de zébu tressé à la main, fermoir en laiton gravé de motifs traditionnels.",
         25.00, 30, ["Cuir de zébu", "Laiton"],
         "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=600&h=600&fit=crop", 0),
        ("Bijouterie artisanale", "Boucles d'oreilles",
         "Boucles d'oreilles coquillages naturels",
         "Boucles d'oreilles fabriquées à la main avec des coquillages de l'océan Indien et du fil doré.",
         18.00, 40, ["Coquillages", "Fil doré", "Crochets hypoallergéniques"],
         "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600&h=600&fit=crop", 1),
        ("Bijouterie artisanale", "Bagues",
         "Bague en argent et pierre de lune",
         "Bague artisanale en argent sterling serti d'une pierre de lune naturelle de Madagascar.",
         55.00, 10, ["Argent sterling", "Pierre de lune"],
         "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600&h=600&fit=crop", 2),
        ("Bijouterie artisanale", "Accessoires de cheveux",
         "Barrette en écaille de zébu sculptée",
         "Barrette artisanale sculptée dans de l'écaille de zébu, motifs géométriques Zafimaniry.",
         22.00, 20, ["Écaille de zébu", "Métal doré"],
         "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&h=600&fit=crop", 0),

        # ── Vannerie ───────────────────────────────────────────────────────────
        ("Vannerie", "Paniers",
         "Panier en rotin tressé multicolore",
         "Panier en rotin naturel tressé à la main, teinté avec des colorants végétaux, anses solides.",
         38.00, 20, ["Rotin naturel", "Teintures végétales"],
         "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=600&h=600&fit=crop", 1),
        ("Vannerie", "Sacs",
         "Sac en jonc de mer artisanal",
         "Sac à main tressé en jonc de mer récolté localement, doublure en coton imprimé wax.",
         52.00, 15, ["Jonc de mer", "Coton wax"],
         "https://images.unsplash.com/photo-1590874103328-eac38a5b1c15?w=600&h=600&fit=crop", 2),
        ("Vannerie", "Objets de décoration",
         "Corbeille décorative en bambou",
         "Corbeille ornementale en lamelles de bambou tressées, motifs losanges naturels et teintés.",
         30.00, 25, ["Bambou", "Vernis naturel"],
         "https://images.unsplash.com/photo-1474625659774-2f98c3ff0c7e?w=600&h=600&fit=crop", 0),
        ("Vannerie", "Mobilier",
         "Tabouret en rotin et bambou",
         "Tabouret bas en rotin et bambou tressé à la main, assise confortable, structure solide.",
         85.00, 7, ["Rotin", "Bambou", "Corde naturelle"],
         "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&h=600&fit=crop", 1),
        ("Vannerie", "Accessoires",
         "Napperon en raphia naturel",
         "Napperon tressé en fibres de raphia naturel, motifs circulaires traditionnels de l'Ouest.",
         15.00, 50, ["Raphia naturel"],
         "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600&h=600&fit=crop", 2),

        # ── Maroquinerie ──────────────────────────────────────────────────────
        ("Maroquinerie", "Sacs à main",
         "Sac à main en cuir de zébu tanné",
         "Sac à main élégant en cuir pleine fleur de zébu tanné végétal, coutures main, fermoir bronze.",
         145.00, 8, ["Cuir de zébu", "Bronze", "Fil poissé"],
         "https://images.unsplash.com/photo-1584917428059-1a1b67e15aa1?w=600&h=600&fit=crop", 0),
        ("Maroquinerie", "Portefeuilles",
         "Portefeuille en cuir gravé motifs Zafimaniry",
         "Portefeuille 3 volets en cuir de zébu, motifs Zafimaniry gravés à chaud, 6 emplacements cartes.",
         48.00, 20, ["Cuir de zébu", "Fil lin"],
         "https://images.unsplash.com/photo-1627123424574-724758594e93?w=600&h=600&fit=crop", 1),
        ("Maroquinerie", "Ceintures",
         "Ceinture en cuir avec boucle artisanale",
         "Ceinture en cuir naturel tannage végétal, boucle en laiton forgée à la main, réglable.",
         55.00, 15, ["Cuir naturel", "Laiton forgé"],
         "https://images.unsplash.com/photo-1553143820-6bb68bc5f818?w=600&h=600&fit=crop", 2),
        ("Maroquinerie", "Chaussures",
         "Sandales en cuir traditionnelles",
         "Sandales artisanales semelle sisal et dessus cuir de zébu, broderies colorées fait main.",
         72.00, 10, ["Cuir de zébu", "Sisal", "Fils colorés"],
         "https://images.unsplash.com/photo-1529810313688-44ea1c2d81d3?w=600&h=600&fit=crop", 0),
        ("Maroquinerie", "Accessoires",
         "Porte-clés en cuir gravé",
         "Porte-clés en cuir épais de zébu, personnalisable avec initiales, gravure Zafimaniry originale.",
         12.00, 60, ["Cuir de zébu", "Anneau acier inox"],
         "https://images.unsplash.com/photo-1601370552761-411aaf3fb7f6?w=600&h=600&fit=crop", 1),

        # ── Broderie et Couture ────────────────────────────────────────────────
        ("Broderie et Couture", "Nappes brodées",
         "Nappe brodée au point de croix malgache",
         "Nappe rectangulaire 140×200 cm en lin brodée à la main de motifs floraux aux fils de soie.",
         110.00, 6, ["Lin naturel", "Fils de soie"],
         "https://images.unsplash.com/photo-1528938102158-3ad192f00a29?w=600&h=600&fit=crop", 2),
        ("Broderie et Couture", "Coussins",
         "Coussin en velours brodé fleurs tropicales",
         "Coussin 50×50 cm en velours de coton brodé à la main de fleurs tropicales malgaches.",
         62.00, 14, ["Velours coton", "Fils de soie", "Kapok bio"],
         "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&h=600&fit=crop", 0),
        ("Broderie et Couture", "Vêtements traditionnels",
         "Chemise en soie brodée Merina",
         "Chemise traditionnelle Merina en soie sauvage brodée à la main, motifs royaux dorés.",
         165.00, 5, ["Soie sauvage", "Fils d'or"],
         "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=600&h=600&fit=crop", 1),
        ("Broderie et Couture", "Accessoires",
         "Pochette brodée en soie naturelle",
         "Petite pochette en soie naturelle brodée de motifs géométriques, fermeture zip dorée.",
         35.00, 25, ["Soie naturelle", "Fils de coton", "Zip doré"],
         "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600&h=600&fit=crop", 2),
        ("Broderie et Couture", "Décoration murale",
         "Tenture murale brodée panoramique",
         "Tenture 60×90 cm brodée à la main représentant la baie de Diego-Suarez, cadre bambou inclus.",
         145.00, 4, ["Coton écru", "Fils colorés", "Bambou"],
         "https://images.unsplash.com/photo-1533090161767-e6ffed986c88?w=600&h=600&fit=crop", 0),

        # ── Instruments de musique ─────────────────────────────────────────────
        ("Instruments de musique", "Valiha",
         "Valiha en bambou géant de Madagascar",
         "Valiha traditionnelle fabriquée en bambou géant de Madagascar, 21 cordes métalliques accordées.",
         280.00, 3, ["Bambou géant", "Cordes métalliques"],
         "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=600&h=600&fit=crop", 1),
        ("Instruments de musique", "Kabosy",
         "Kabosy en bois précieux malgache",
         "Guitare traditionnelle kabosy en bois de palissandre, 6 cordes, caisse de résonance sculptée.",
         195.00, 4, ["Palissandre", "Épicéa", "Cordes nylon"],
         "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=600&h=600&fit=crop", 2),
        ("Instruments de musique", "Jejy voatavo",
         "Jejy voatavo – vièle monocorde",
         "Vièle traditionnelle à friction jejy voatavo, corps en calebasse naturelle, archet en crins.",
         150.00, 5, ["Calebasse", "Bois dur", "Crins de cheval"],
         "https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?w=600&h=600&fit=crop", 0),
        ("Instruments de musique", "Tambours",
         "Hazolahy – tambour traditionnel malgache",
         "Tambour hazolahy en tronc de bois creux, peau de zébu tendue à la main, baguettes incluses.",
         115.00, 6, ["Bois de manguier", "Peau de zébu", "Corde naturelle"],
         "https://images.unsplash.com/photo-1543443258-92b04ad5ec6b?w=600&h=600&fit=crop", 1),
        ("Instruments de musique", "Accessoires",
         "Étui en raphia pour valiha",
         "Étui de protection pour valiha tressé en raphia solide, sangles réglables, compartiment accessoires.",
         45.00, 10, ["Raphia tressé", "Mousse de protection"],
         "https://images.unsplash.com/photo-1526142684086-7ebd69df27a5?w=600&h=600&fit=crop", 2),

        # ── Peinture et Art ────────────────────────────────────────────────────
        ("Peinture et Art", "Peintures sur toile",
         "Baobabs au coucher de soleil – huile sur toile",
         "Peinture à l'huile 50×70 cm représentant les baobabs emblématiques de Morondava au crépuscule.",
         320.00, 2, ["Huile de lin", "Toile de lin", "Châssis bois"],
         "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=600&h=600&fit=crop", 0),
        ("Peinture et Art", "Peintures sur bois",
         "Portrait Merina – acrylique sur bois",
         "Portrait d'une femme Merina en tenue traditionnelle, acrylique sur planche de palissandre poli.",
         185.00, 3, ["Acrylique", "Palissandre", "Vernis mat"],
         "https://images.unsplash.com/photo-1561214115-f2f134cc4912?w=600&h=600&fit=crop", 1),
        ("Peinture et Art", "Aquarelles",
         "Faune de Madagascar – série aquarelle",
         "Série de 4 aquarelles signées représentant des animaux endémiques : lémuriens, fossas, caméléons.",
         95.00, 8, ["Aquarelle professionnelle", "Papier 300g coton"],
         "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=600&h=600&fit=crop", 2),
        ("Peinture et Art", "Croquis",
         "Carnet de croquis villages malgaches",
         "Carnet de 20 croquis au crayon et encre représentant des scènes de vie villageoise malgache.",
         55.00, 10, ["Encre de chine", "Crayon graphite", "Papier à grain"],
         "https://images.unsplash.com/photo-1516410529446-2c777cb7366d?w=600&h=600&fit=crop", 0),
        ("Peinture et Art", "Art contemporain",
         "Fusion Zafimaniry – art contemporain mixte",
         "Œuvre mixte techniques : motifs Zafimaniry gravés sur fond acrylique doré déstructuré, 40×60 cm.",
         245.00, 3, ["Acrylique", "Feuilles d'or", "Bois MDF"],
         "https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8?w=600&h=600&fit=crop", 1),

        # ── Cuisine et Gastronomie ─────────────────────────────────────────────
        ("Cuisine et Gastronomie", "Épices",
         "Coffret épices rares de Madagascar",
         "Coffret de 6 épices rares : vanille Bourbon, poivre sauvage, clou de girofle, curcuma, gingembre, cannelle.",
         42.00, 30, ["Vanille Bourbon", "Poivre sauvage", "Girofle"],
         "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=600&h=600&fit=crop", 2),
        ("Cuisine et Gastronomie", "Miels",
         "Miel de forêt primaire de Madagascar",
         "Miel brut récolté dans les forêts primaires du corridor Ranomafana, non filtré, certifié bio.",
         28.00, 40, ["Miel pur", "Propolis naturelle"],
         "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=600&h=600&fit=crop", 0),
        ("Cuisine et Gastronomie", "Fruits secs",
         "Assortiment fruits secs tropicaux bio",
         "Mélange de fruits séchés au soleil : mangue, litchi, jacquier, banane, ananas – sans sucre ajouté.",
         22.00, 50, ["Mangue", "Litchi", "Ananas", "Banane"],
         "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&h=600&fit=crop", 1),
        ("Cuisine et Gastronomie", "Conserves",
         "Achards de légumes maison traditionnel",
         "Pot 350g d'achards de légumes malgaches préparés à la recette traditionnelle des Hautes Terres.",
         14.00, 35, ["Légumes de saison", "Vinaigre de canne", "Épices locales"],
         "https://images.unsplash.com/photo-1563822249366-3efb23b8e0c9?w=600&h=600&fit=crop", 2),
        ("Cuisine et Gastronomie", "Boissons",
         "Rhum arrangé à la vanille de Madagascar",
         "Bouteille 50cl de rhum arrangé infusé 3 mois avec de la vanille Bourbon et des épices de Madagascar.",
         35.00, 20, ["Rhum local", "Vanille Bourbon", "Épices"],
         "https://images.unsplash.com/photo-1598977588693-2f95a2d98a38?w=600&h=600&fit=crop", 0),

        # ── Décoration intérieure ──────────────────────────────────────────────
        ("Décoration intérieure", "Luminaires",
         "Lampe en calebasse sculptée",
         "Lampe de table en calebasse naturelle sculptée de motifs perforés, câble lin, ampoule E27.",
         78.00, 10, ["Calebasse naturelle", "Câble lin", "Culot E27"],
         "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=600&h=600&fit=crop", 1),
        ("Décoration intérieure", "Miroirs",
         "Miroir encadré en bois tressé",
         "Miroir rond Ø50 cm encadré d'un tressage de rotin natural fait main, crochet bambou au dos.",
         92.00, 8, ["Rotin naturel", "Miroir en verre", "Bambou"],
         "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=600&h=600&fit=crop", 2),
        ("Décoration intérieure", "Cadres",
         "Cadre photo en bois brûlé pyrographié",
         "Cadre photo 20×25 cm en bois de manguier, décoration pyrographiée de motifs Zafimaniry.",
         38.00, 18, ["Manguier", "Cire protectrice"],
         "https://images.unsplash.com/photo-1452457807390-82d91a648789?w=600&h=600&fit=crop", 0),
        ("Décoration intérieure", "Vases",
         "Vase tressé en fibres de bananier",
         "Vase décoratif tressé à la main en fibres de bananier séchées, imperméabilisé naturellement.",
         45.00, 14, ["Fibres de bananier", "Colle naturelle"],
         "https://images.unsplash.com/photo-1544731612-de7f96afe55f?w=600&h=600&fit=crop", 1),
        ("Décoration intérieure", "Objets décoratifs",
         "Mobile en bois et coquillages marins",
         "Mobile suspendu composé de pièces de bois flotté et de coquillages de la côte est de Madagascar.",
         52.00, 12, ["Bois flotté", "Coquillages", "Fil métallique"],
         "https://images.unsplash.com/photo-1584305574647-0cc949a2bb9f?w=600&h=600&fit=crop", 2),
    ]

    created_count = 0
    skipped_count = 0

    for (cat_name, sub_name, title, description, price, stock, materials, image_url, artisan_idx) in products_data:
        # Vérifier si le produit existe déjà
        existing = db.query(Product).filter(Product.title == title).first()
        if existing:
            # Mettre à jour l'image si elle a changé
            existing_img = db.query(ProductImage).filter(
                ProductImage.product_id == existing.id
            ).first()
            if existing_img and existing_img.image_url != image_url:
                existing_img.image_url = image_url
                db.add(existing_img)
                db.flush()
            skipped_count += 1
            continue

        subcategory = _get_subcategory(db, cat_name, sub_name)
        if not subcategory:
            print(f"  ⚠️  Sous-catégorie '{sub_name}' introuvable dans '{cat_name}', produit ignoré")
            continue

        product_id = uuid.uuid4()
        base_slug = generate_slug(title)
        slug = base_slug
        counter = 1
        while db.query(Product).filter(Product.slug == slug).first():
            slug = f"{base_slug}-{counter}"
            counter += 1

        product = Product(
            id=product_id,
            title=title,
            slug=slug,
            description=description,
            short_description=description[:120] + "…" if len(description) > 120 else description,
            price=price,
            category_id=subcategory.id,
            artisan_id=artisan(artisan_idx).id,
            stock_quantity=stock,
            track_inventory=True,
            materials=materials,
            status="published",
            visibility="public",
            featured=False,
            handmade=True,
            customizable=False,
            made_to_order=False,
            production_time_days=7,
            rating_average=0,
            rating_count=0,
            view_count=0,
            published_at=datetime.now(timezone.utc),
        )
        db.add(product)
        db.flush()

        # Ajouter l'image principale
        img = ProductImage(
            id=uuid.uuid4(),
            product_id=product_id,
            image_url=image_url,
            alt_text=title,
            sort_order=0,
            is_primary=True,
        )
        db.add(img)
        created_count += 1

    db.commit()
    print(f"✓ {created_count} produits créés, {skipped_count} ignorés (existants)")


def seed_initial_data():
    """Fonction principale pour créer les données initiales"""
    print("=" * 60)
    print("Initialisation des données de base...")
    print("=" * 60)

    db = SessionLocal()
    try:
        print("\n📁 Création des catégories...")
        categories = create_categories(db)
        print(f"\n✓ {len(categories)} catégories principales créées/vérifiées")

        print("\n👤 Création de l'utilisateur admin...")
        admin_user = create_admin_user(db)

        print("\n🧑‍🎨 Création des artisans de démonstration...")
        artisans = create_artisan_users(db)
        print(f"✓ {len(artisans)} artisans créés/vérifiés")

        print("\n🛍️  Création des produits (5 par catégorie)...")
        create_products(db, artisans)

        print("\n" + "=" * 60)
        print("✅ Initialisation terminée avec succès!")
        print("=" * 60)

    except Exception as e:
        db.rollback()
        print(f"\n❌ Erreur lors de l'initialisation: {e}")
        import traceback
        traceback.print_exc()

        if "does not exist" in str(e) or "no such table" in str(e).lower():
            print("ℹ️  Tables not found yet. This is normal if migrations haven't run yet.")
            return
        raise
    finally:
        db.close()

if __name__ == "__main__":
    seed_initial_data()

