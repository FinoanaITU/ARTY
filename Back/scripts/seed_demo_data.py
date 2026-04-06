"""
Script pour créer les données de démonstration de l'application ARTY
- Comptes utilisateurs (artisan, acheteurs)
- Produits artisanaux variés
- Ateliers avec sessions
- Avis et photos
"""
import sys
import os
from datetime import datetime, timedelta
from decimal import Decimal

# Ajouter le répertoire parent au path pour les imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.models.user import User, UserRole, ArtisanProfile, ArtisanPhoto, BuyerType, Nationality, ProfileStatus
from app.models.product import Product, ProductImage, Category
from app.models.workshop import Workshop, WorkshopSession
from app.models.review import Review
from app.core.security import get_password_hash
import uuid
import re


def generate_slug(name: str) -> str:
    """Génère un slug à partir du nom"""
    slug = name.lower()
    slug = re.sub(r'[^a-z0-9]+', '-', slug)
    slug = re.sub(r'^-+|-+$', '', slug)
    return slug


def create_artisan_user(db: Session) -> User:
    """Crée un utilisateur artisan avec profil complet"""
    email = "artisan@artizaho.com"
    
    # Vérifier si l'artisan existe déjà
    existing = db.query(User).filter(User.email == email).first()
    if existing:
        print(f"✓ Artisan '{email}' existe déjà")
        return existing
    
    # Créer l'utilisateur artisan
    artisan = User(
        id=uuid.uuid4(),
        email=email,
        password_hash=get_password_hash("artisan123"),
        name="Hery Rakoto",
        phone="+261 34 12 345 67",
        address="Lot II M 45 Bis Ambohimanarina",
        city="Antananarivo",
        country="madagascar",
        role=UserRole.ARTISAN,
        is_active=True,
        is_email_verified=True
    )
    db.add(artisan)
    db.flush()
    
    # Créer le profil artisan
    profile = ArtisanProfile(
        id=uuid.uuid4(),
        user_id=artisan.id,
        company_name="Atelier Hery - Art Malgache",
        main_specialty="Sculpture sur bois",
        activity_description="Artisan passionné depuis plus de 20 ans, spécialisé dans la sculpture sur bois et la création d'objets traditionnels malgaches. Mon atelier perpétue les techniques ancestrales tout en apportant une touche contemporaine.",
        about="Artisan passionné depuis plus de 20 ans.",
        specialties=["Sculpture sur bois", "Vannerie", "Objets décoratifs"],
        years_experience="20 ans",
        location_address="Lot II M 45 Bis Ambohimanarina, Antananarivo",
        status=ProfileStatus.PUBLISHED
    )
    db.add(profile)
    db.flush()
    
    # Ajouter des photos au profil
    photos_data = [
        {
            "url": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face",
            "caption": "Hery Rakoto dans son atelier",
            "position": 0
        },
        {
            "url": "https://images.unsplash.com/photo-1565043589221-1a6fd9ae45c7?w=800&h=600&fit=crop",
            "caption": "Atelier de sculpture",
            "position": 1
        },
        {
            "url": "https://images.unsplash.com/photo-1452860606245-08befc0ff44b?w=800&h=600&fit=crop",
            "caption": "Outils traditionnels",
            "position": 2
        }
    ]
    
    for photo_data in photos_data:
        photo = ArtisanPhoto(
            id=uuid.uuid4(),
            artisan_profile_id=profile.id,
            photo_url=photo_data["url"],
            position=photo_data["position"]
        )
        db.add(photo)
    
    db.commit()
    db.refresh(artisan)
    print(f"✓ Artisan créé: {email} / artisan123")
    return artisan


def create_buyer_users(db: Session) -> tuple:
    """Crée des utilisateurs acheteurs (particulier et entreprise)"""
    buyers = []
    
    # Acheteur particulier
    email_particulier = "acheteur@artizaho.com"
    existing = db.query(User).filter(User.email == email_particulier).first()
    if not existing:
        buyer_particulier = User(
            id=uuid.uuid4(),
            email=email_particulier,
            password_hash=get_password_hash("acheteur123"),
            name="Jean Dupont",
            phone="+33 6 12 34 56 78",
            address="15 Rue de la Paix",
            city="Paris",
            country="france",
            role=UserRole.BUYER,
            buyer_type=BuyerType.PARTICULIER,
            nationality=Nationality.FOREIGN,
            is_active=True,
            is_email_verified=True
        )
        db.add(buyer_particulier)
        buyers.append(buyer_particulier)
        print(f"✓ Acheteur particulier créé: {email_particulier} / acheteur123")
    else:
        buyers.append(existing)
        print(f"✓ Acheteur particulier '{email_particulier}' existe déjà")
    
    # Acheteur entreprise
    email_entreprise = "entreprise@artizaho.com"
    existing = db.query(User).filter(User.email == email_entreprise).first()
    if not existing:
        buyer_entreprise = User(
            id=uuid.uuid4(),
            email=email_entreprise,
            password_hash=get_password_hash("entreprise123"),
            name="Marie Martin",
            phone="+33 6 98 76 54 32",
            address="42 Avenue des Champs-Élysées",
            city="Paris",
            country="france",
            role=UserRole.BUYER,
            buyer_type=BuyerType.ENTREPRISE,
            nationality=Nationality.FOREIGN,
            company_name="Artisan Import SARL",
            siret="12345678901234",
            is_active=True,
            is_email_verified=True
        )
        db.add(buyer_entreprise)
        buyers.append(buyer_entreprise)
        print(f"✓ Acheteur entreprise créé: {email_entreprise} / entreprise123")
    else:
        buyers.append(existing)
        print(f"✓ Acheteur entreprise '{email_entreprise}' existe déjà")
    
    db.commit()
    return tuple(buyers)


def get_products_data():
    """Retourne les données des produits à créer"""
    return [
        # Sculpture et Bois (3 produits)
        {
            "title": "Masque traditionnel Zafimaniry",
            "category": "Sculpture et Bois",
            "price": 85.00,
            "description": "Masque traditionnel sculpté à la main par les artisans Zafimaniry, reconnus au patrimoine mondial de l'UNESCO. Bois de palissandre, finition naturelle. Pièce unique représentant les esprits ancestraux.",
            "short_description": "Masque traditionnel en bois de palissandre, sculpture artisanale",
            "image": "https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?w=800&h=800&fit=crop",
            "stock": 5,
            "materials": ["Bois de palissandre", "Finition naturelle"],
            "colors": ["Brun", "Naturel"],
            "techniques": ["Sculpture", "Gravure"],
            "origin_region": "Ambositra"
        },
        {
            "title": "Statuette Baobab sculptée",
            "category": "Sculpture et Bois",
            "price": 45.00,
            "description": "Statuette représentant un baobab majestueux, symbole de Madagascar. Sculptée dans du bois de rose, cette pièce décorative apporte une touche d'authenticité à votre intérieur.",
            "short_description": "Statuette baobab en bois de rose",
            "image": "https://images.unsplash.com/photo-1565043589221-1a6fd9ae45c7?w=800&h=800&fit=crop",
            "stock": 12,
            "materials": ["Bois de rose"],
            "colors": ["Brun rouge"],
            "techniques": ["Sculpture"],
            "origin_region": "Antananarivo"
        },
        {
            "title": "Bol en bois tourné",
            "category": "Sculpture et Bois",
            "price": 35.00,
            "description": "Bol artisanal tourné dans du bois d'ébène. Idéal pour la décoration ou comme contenant pour fruits secs. Chaque pièce est unique avec ses propres veinures.",
            "short_description": "Bol décoratif en bois d'ébène tourné",
            "image": "https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=800&h=800&fit=crop",
            "stock": 8,
            "materials": ["Bois d'ébène"],
            "colors": ["Noir", "Brun foncé"],
            "techniques": ["Tournage"],
            "origin_region": "Fianarantsoa"
        },
        # Textile et Tissage (3 produits)
        {
            "title": "Lamba traditionnel en soie sauvage",
            "category": "Textile et Tissage",
            "price": 120.00,
            "description": "Lamba tissé à la main en soie sauvage naturelle. Motifs géométriques traditionnels. Peut être porté comme châle ou utilisé comme élément de décoration murale. Dimensions: 180x120cm.",
            "short_description": "Lamba en soie sauvage tissé main, motifs traditionnels",
            "image": "https://images.unsplash.com/photo-1610992015732-2449b76344bc?w=800&h=800&fit=crop",
            "stock": 6,
            "materials": ["Soie sauvage"],
            "colors": ["Écru", "Brun", "Rouge terre"],
            "techniques": ["Tissage manuel"],
            "origin_region": "Arivonimamo"
        },
        {
            "title": "Set de table en raphia tressé",
            "category": "Textile et Tissage",
            "price": 25.00,
            "description": "Ensemble de 4 sets de table en raphia naturel tressé. Résistant et élégant, parfait pour une table au style ethnique chic. Dimensions: 35x45cm chacun.",
            "short_description": "4 sets de table en raphia naturel",
            "image": "https://images.unsplash.com/photo-1615529182904-14819c35db37?w=800&h=800&fit=crop",
            "stock": 15,
            "materials": ["Raphia naturel"],
            "colors": ["Naturel", "Beige"],
            "techniques": ["Tressage"],
            "origin_region": "Manakara"
        },
        {
            "title": "Coussin brodé motifs malgaches",
            "category": "Textile et Tissage",
            "price": 32.00,
            "description": "Coussin décoratif avec broderie traditionnelle malgache. Motifs inspirés de la nature et des symboles ancestraux. Housse amovible en coton. 40x40cm.",
            "short_description": "Coussin brodé main, motifs traditionnels",
            "image": "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=800&h=800&fit=crop",
            "stock": 20,
            "materials": ["Coton", "Fil de broderie"],
            "colors": ["Blanc", "Rouge", "Noir"],
            "techniques": ["Broderie", "Couture"],
            "origin_region": "Antananarivo"
        }
    ]



def create_products(db: Session, artisan: User) -> list:
    """Crée des produits artisanaux variés"""
    
    # Récupérer les catégories
    categories = {
        cat.name: cat 
        for cat in db.query(Category).filter(
            Category.parent_id.is_(None)
        ).all()
    }
    
    products_data = get_products_data()
    created_products = []
    
    for idx, product_data in enumerate(products_data):
        # Récupérer la catégorie
        category = categories.get(product_data["category"])
        if not category:
            print(f"⚠️  Catégorie '{product_data['category']}' non trouvée")
            continue
        
        # Vérifier si le produit existe déjà
        slug = generate_slug(product_data["title"])
        existing = db.query(Product).filter(Product.slug == slug).first()
        if existing:
            print(f"  ✓ Produit '{product_data['title']}' existe déjà")
            created_products.append(existing)
            continue
        
        # Créer le produit
        product = Product(
            id=uuid.uuid4(),
            title=product_data["title"],
            slug=slug,
            description=product_data["description"],
            short_description=product_data["short_description"],
            price=Decimal(str(product_data["price"])),
            category_id=category.id,
            artisan_id=artisan.id,
            stock_quantity=product_data["stock"],
            track_inventory=True,
            materials=product_data.get("materials", []),
            colors=product_data.get("colors", []),
            techniques=product_data.get("techniques", []),
            origin_region=product_data.get("origin_region"),
            status="published",
            visibility="public",
            featured=(idx < 3),
            handmade=True,
            published_at=datetime.utcnow()
        )
        db.add(product)
        db.flush()
        
        # Ajouter l'image principale
        image = ProductImage(
            id=uuid.uuid4(),
            product_id=product.id,
            image_url=product_data["image"],
            alt_text=product_data["title"],
            sort_order=0,
            is_primary=True
        )
        db.add(image)
        
        created_products.append(product)
        price_str = f"{product_data['price']}€"
        print(f"  ✓ Produit créé: {product_data['title']} ({price_str})")
    
    db.commit()
    return created_products


def get_workshops_data():
    """Retourne les données des ateliers à créer"""
    return [
        {
            "title": "Initiation à la sculpture sur bois",
            "category": "Sculpture et Bois",
            "type": "group",
            "skill_level": "beginner",
            "price": 45.00,
            "duration": 180,
            "max_participants": 8,
            "description": "Découvrez les techniques de base de la "
                          "sculpture sur bois malgache.",
            "short_description": "Apprenez les bases de la sculpture",
            "image": "https://images.unsplash.com/photo-1452860606245"
                    "-08befc0ff44b?w=800&h=600&fit=crop",
            "materials_included": ["Bloc de bois", "Outils", "Protection"],
            "what_you_will_learn": [
                "Choisir et préparer le bois",
                "Utiliser les outils de sculpture",
                "Techniques de base",
                "Finitions et polissage"
            ],
            "sessions": 3
        },
        {
            "title": "Tissage traditionnel du Lamba",
            "category": "Textile et Tissage",
            "type": "group",
            "skill_level": "intermediate",
            "price": 65.00,
            "duration": 240,
            "max_participants": 6,
            "description": "Atelier de tissage traditionnel malgache.",
            "short_description": "Tissage sur métier traditionnel",
            "image": "https://images.unsplash.com/photo-1610992015732"
                    "-2449b76344bc?w=800&h=600&fit=crop",
            "materials_included": ["Fils de soie", "Métier", "Outils"],
            "what_you_will_learn": [
                "Préparer le métier à tisser",
                "Techniques de tissage",
                "Créer des motifs",
                "Finitions"
            ],
            "sessions": 2
        }
    ]


def create_workshops(db: Session, artisan: User) -> list:
    """Crée des ateliers avec sessions programmées"""
    
    # Récupérer les catégories
    categories = {
        cat.name: cat 
        for cat in db.query(Category).filter(
            Category.parent_id.is_(None)
        ).all()
    }
    
    workshops_data = get_workshops_data()
    created_workshops = []
    base_date = datetime.utcnow() + timedelta(days=7)
    
    for idx, workshop_data in enumerate(workshops_data):
        # Récupérer la catégorie
        category = categories.get(workshop_data["category"])
        
        # Vérifier si l'atelier existe déjà
        slug = generate_slug(workshop_data["title"])
        existing = db.query(Workshop).filter(Workshop.slug == slug).first()
        if existing:
            print(f"  ✓ Atelier '{workshop_data['title']}' existe déjà")
            created_workshops.append(existing)
            continue
        
        # Créer l'atelier
        workshop = Workshop(
            id=uuid.uuid4(),
            title=workshop_data["title"],
            slug=slug,
            description=workshop_data["description"],
            short_description=workshop_data["short_description"],
            artisan_id=artisan.id,
            category_id=category.id if category else None,
            category=workshop_data["category"],
            workshop_type=workshop_data["type"],
            skill_level=workshop_data["skill_level"],
            base_price=Decimal(str(workshop_data["price"])),
            currency="EUR",
            min_participants=1,
            max_participants=workshop_data["max_participants"],
            duration_minutes=workshop_data["duration"],
            location="Atelier Hery - Antananarivo",
            location_type="physical",
            address="Lot II M 45 Bis Ambohimanarina, Antananarivo",
            materials_included=workshop_data.get("materials_included", []),
            what_you_will_learn=workshop_data.get("what_you_will_learn", []),
            featured_image_url=workshop_data["image"],
            status="published",
            is_featured=(idx < 2),
            instructor_name="Hery Rakoto",
            instructor_bio="Artisan passionné depuis plus de 20 ans"
        )
        db.add(workshop)
        db.flush()
        
        # Créer les sessions
        for session_idx in range(workshop_data["sessions"]):
            session_date = base_date + timedelta(
                days=session_idx * 7 + idx * 2
            )
            session_start = session_date.replace(
                hour=14, minute=0, second=0, microsecond=0
            )
            session_end = session_start + timedelta(
                minutes=workshop_data["duration"]
            )
            
            session = WorkshopSession(
                id=uuid.uuid4(),
                workshop_id=workshop.id,
                start_datetime=session_start,
                end_datetime=session_end,
                timezone="Indian/Antananarivo",
                max_participants=workshop_data["max_participants"],
                current_bookings=0,
                status="available"
            )
            db.add(session)
        
        created_workshops.append(workshop)
        sessions_str = f"{workshop_data['sessions']} sessions"
        print(f"  ✓ Atelier créé: {workshop_data['title']} ({sessions_str})")
    
    db.commit()
    return created_workshops


def create_reviews(db: Session, products: list, buyers: tuple) -> list:
    """Crée des avis sur les produits"""
    
    if not products or not buyers:
        print("  ⚠️  Pas de produits ou acheteurs pour créer des avis")
        return []
    
    reviews_data = [
        {
            "rating": 5,
            "comment": "Produit magnifique, exactement comme sur les "
                      "photos. La qualité artisanale est exceptionnelle.",
            "product_idx": 0
        },
        {
            "rating": 5,
            "comment": "Très belle pièce, le travail du bois est "
                      "remarquable. Merci à l'artisan !",
            "product_idx": 1
        },
        {
            "rating": 4,
            "comment": "Joli produit, conforme à la description. "
                      "La qualité est au rendez-vous.",
            "product_idx": 2
        }
    ]
    
    created_reviews = []
    buyer = buyers[0] if buyers else None
    
    if not buyer:
        return []
    
    for review_data in reviews_data:
        if review_data["product_idx"] >= len(products):
            continue
        
        product = products[review_data["product_idx"]]
        
        # Vérifier si l'avis existe déjà
        existing = db.query(Review).filter(
            Review.reviewable_type == 'product',
            Review.reviewable_id == product.id,
            Review.reviewer_id == buyer.id
        ).first()
        
        if existing:
            continue
        
        review = Review(
            id=uuid.uuid4(),
            reviewable_type='product',
            reviewable_id=product.id,
            reviewer_id=buyer.id,
            rating=review_data["rating"],
            comment=review_data["comment"],
            is_verified_purchase=True
        )
        db.add(review)
        created_reviews.append(review)
    
    db.commit()
    if created_reviews:
        print(f"  ✓ {len(created_reviews)} avis créés")
    
    return created_reviews
def seed_demo_data():
    """Fonction principale pour créer les données de démonstration"""
    print("=" * 60)
    print("Création des données de démonstration...")
    print("=" * 60)
    
    db = SessionLocal()
    try:
        # Créer les utilisateurs
        print("\n👤 Création des utilisateurs...")
        artisan = create_artisan_user(db)
        buyers = create_buyer_users(db)
        
        # Créer les produits
        print("\n🎨 Création des produits...")
        products = create_products(db, artisan)
        print(f"✓ {len(products)} produits créés/vérifiés")
        
        # Créer les ateliers
        print("\n🎓 Création des ateliers...")
        workshops = create_workshops(db, artisan)
        print(f"✓ {len(workshops)} ateliers créés/vérifiés")
        
        # Créer les avis
        print("\n⭐ Création des avis...")
        reviews = create_reviews(db, products, buyers)
        if reviews:
            print(f"✓ {len(reviews)} avis créés")
        
        print("\n" + "=" * 60)
        print("✅ Données de démonstration créées avec succès!")
        print("=" * 60)
        print(f"\n📊 Résumé:")
        print(f"   - Utilisateurs: 1 artisan + {len(buyers)} acheteurs")
        print(f"   - Produits: {len(products)}")
        print(f"   - Ateliers: {len(workshops)}")
        print(f"   - Avis: {len(reviews)}")
        
    except Exception as e:
        db.rollback()
        print(f"\n❌ Erreur lors de la création des données: {e}")
        import traceback
        traceback.print_exc()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_demo_data()

# Made with Bob
