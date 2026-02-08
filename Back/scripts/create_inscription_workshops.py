#!/usr/bin/env python3
"""
Script pour créer des ateliers sur inscription avec des sessions programmées
"""

import sys
import os
from datetime import datetime, timedelta
from decimal import Decimal
import uuid

# Add the Back directory to the path
sys.path.append('/app')

from app.core.database import SessionLocal
from app.models.workshop import Workshop, WorkshopSession
from app.models.user import User


def create_inscription_workshops():
    """Créer des ateliers sur inscription avec sessions programmées"""
    
    db = SessionLocal()
    
    try:
        # Récupérer les artisans existants
        artisans = db.query(User).filter(User.role == 'artisan').all()
        if not artisans:
            print("Aucun artisan trouvé. Création d'un artisan test...")
            # Créer un artisan pour les tests
            artisan = User(
                id=uuid.uuid4(),
                username="nivo_andriamana",
                email="nivo.andriamana@arty.mg",
                name="Nivo Andriamana",
                role="artisan",
                is_active=True
            )
            db.add(artisan)
            artisans = [artisan]
        
        print(f"Artisans trouvés : {[a.name for a in artisans]}")
        
        # Ateliers sur inscription à créer
        inscription_workshops_data = [
            {
                "title": "Poterie Traditionnelle et Céramique Malgache",
                "slug": "poterie-ceramique-malgache",
                "description": """Découvrez l'art ancestral de la poterie malgache dans un atelier immersif de 5 heures. 
                
Vous apprendrez les techniques traditionnelles de façonnage de l'argile utilisées depuis des générations par les artisans malgaches. Cet atelier vous permettra de créer vos propres pièces : bols, vases, ou objets décoratifs en utilisant des méthodes authentiques.

**Programme détaillé :**
• Introduction aux terres et argiles locales (30 min)
• Techniques de préparation de l'argile (45 min) 
• Façonnage au tour de potier traditionnel (2h30)
• Décoration avec des motifs malgaches (1h)
• Cuisson et émaillage (45 min)

**Ce que vous repartirez avec :**
• 2-3 pièces en céramique créées par vos soins
• Un livret de techniques traditionnelles
• Des outils de base pour continuer chez vous

Niveau débutant, aucune expérience préalable requise. L'atelier se déroule dans un cadre authentique avec tous les outils traditionnels.""",
                "short_description": "Apprenez l'art de la poterie traditionnelle malgache et créez vos propres pièces en céramique avec des techniques ancestrales.",
                "artisan": artisans[0],
                "workshop_type": "inscription",
                "skill_level": "Débutant",
                "base_price": Decimal("35000"),
                "min_participants": 4,
                "max_participants": 8,
                "duration_minutes": 300,  # 5 heures
                "location_type": "physical",
                "address": "Atelier Céramique, Quartier Andohalo, Antananarivo",
                "room_details": "Atelier équipé de 8 tours de potier traditionnels, four de cuisson, espace de séchage",
                "materials_included": [
                    "Argile locale de qualité supérieure",
                    "Outils de façonnage traditionnels", 
                    "Émaux et pigments naturels",
                    "Tablier et protection",
                    "Matériel de cuisson"
                ],
                "what_you_will_learn": [
                    "Techniques de préparation et pétrissage de l'argile",
                    "Façonnage au tour de potier traditionnel",
                    "Décoration avec motifs malgaches authentiques", 
                    "Processus de séchage et cuisson",
                    "Finition et émaillage"
                ],
                "featured_image_url": "https://images.unsplash.com/photo-1582562124811-c09040d0a901?w=800&h=600&fit=crop",
                "gallery_images": [
                    "https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=400&h=300&fit=crop",
                    "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400&h=300&fit=crop",
                    "https://images.unsplash.com/photo-1612198188060-c7c2a3b66eae?w=400&h=300&fit=crop"
                ],
                "tags": ["poterie", "céramique", "tradition", "artisanat", "malgache"],
                "sessions": [
                    {
                        "start_datetime": datetime.now() + timedelta(days=7, hours=14),  # Samedi prochain 14h
                        "participants": 3,
                        "price": Decimal("35000")
                    },
                    {
                        "start_datetime": datetime.now() + timedelta(days=14, hours=9),  # Samedi suivant 9h
                        "participants": 6,
                        "price": Decimal("35000")
                    },
                    {
                        "start_datetime": datetime.now() + timedelta(days=21, hours=14),  # Samedi d'après 14h
                        "participants": 2,
                        "price": Decimal("35000")
                    }
                ]
            },
            {
                "title": "Bijouterie Artisanale avec Matériaux Locaux",
                "slug": "bijouterie-artisanale-locale", 
                "description": """Plongez dans l'univers fascinant de la bijouterie malgache et apprenez à créer des bijoux uniques avec des matériaux locaux exceptionnels.

Dans cet atelier de 3 heures, vous découvrirez les techniques traditionnelles de création de bijoux utilisées par les artisans malgaches, en travaillant avec des pierres semi-précieuses locales, des perles d'eau douce, et des métaux nobles.

**Programme de l'atelier :**
• Présentation des matériaux locaux et leurs propriétés (30 min)
• Techniques de base : sertissage, montage, polissage (45 min)
• Création de votre bijou personnalisé (1h30)
• Finitions et techniques de lustrage (15 min)

**Matériaux inclus :**
• Pierres semi-précieuses de Madagascar (améthyste, quartz rose, labradorite)
• Perles d'eau douce et graines locales
• Fil d'argent ou de cuivre
• Fermoirs et accessoires de qualité

**Créations possibles :**
• Collier avec pendentif en pierre locale
• Bracelet tressé avec perles malgaches  
• Boucles d'oreilles assorties
• Bague avec sertissage traditionnel

Repartez avec vos créations et les techniques pour continuer à la maison !""",
                "short_description": "Créez vos bijoux uniques avec des pierres et matériaux locaux malgaches, apprenez les techniques traditionnelles de bijouterie.",
                "artisan": artisans[0] if len(artisans) == 1 else artisans[1],
                "workshop_type": "inscription",  
                "skill_level": "Débutant",
                "base_price": Decimal("22000"),
                "min_participants": 5,
                "max_participants": 12,
                "duration_minutes": 180,  # 3 heures
                "location_type": "physical",
                "address": "Atelier Bijouterie, Marché Artisanal La Digue, Antananarivo",
                "room_details": "Espace de travail avec établis individuels, outils de précision, microscopes, système d'éclairage optimal",
                "materials_included": [
                    "Pierres semi-précieuses locales variées",
                    "Perles d'eau douce et graines locales", 
                    "Fils métalliques (argent, cuivre, laiton)",
                    "Outils de bijouterie (pinces, limes, polissoirs)",
                    "Fermoirs et accessoires de finition"
                ],
                "what_you_will_learn": [
                    "Identification et sélection des pierres locales",
                    "Techniques de sertissage traditionnel",
                    "Assemblage et montage de bijoux",
                    "Finitions et techniques de lustrage",
                    "Création de fermoirs et systèmes d'attache"
                ],
                "featured_image_url": "https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?w=800&h=600&fit=crop",
                "gallery_images": [
                    "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&h=300&fit=crop",
                    "https://images.unsplash.com/photo-1506629905312-d91dae17ea42?w=400&h=300&fit=crop", 
                    "https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=400&h=300&fit=crop"
                ],
                "tags": ["bijouterie", "pierres", "artisanat", "création", "malgache"],
                "sessions": [
                    {
                        "start_datetime": datetime.now() + timedelta(days=5, hours=10),  # Jeudi prochain 10h
                        "participants": 8,
                        "price": Decimal("22000")
                    },
                    {
                        "start_datetime": datetime.now() + timedelta(days=12, hours=14),  # Jeudi suivant 14h
                        "participants": 4,
                        "price": Decimal("22000")
                    },
                    {
                        "start_datetime": datetime.now() + timedelta(days=19, hours=10),  # Jeudi d'après 10h
                        "participants": 7,
                        "price": Decimal("22000")
                    }
                ]
            },
            {
                "title": "Tissage Traditionnel et Création de Lamba",
                "slug": "tissage-lamba-traditionnel",
                "description": """Découvrez l'art ancestral du tissage malgache et apprenez à créer un authentique lamba dans cet atelier exceptionnel de 6 heures.

Le lamba est bien plus qu'un simple tissu - c'est un symbole culturel profond de Madagascar. Dans cet atelier immersif, vous apprendrez les techniques traditionnelles transmises de génération en génération.

**Programme complet :**
• Histoire et symbolique du lamba malgache (45 min)
• Préparation des fils de soie sauvage (1h)
• Montage du métier à tisser traditionnel (30 min)
• Techniques de tissage de base (2h30)
• Création des motifs traditionnels (1h)
• Finitions et bordures décoratives (45 min)

**Matériaux premium inclus :**
• Soie sauvage malgache (landibe) de première qualité
• Fils de coton biologique teints naturellement
• Accès à un métier à tisser traditionnel authentique
• Outils de tissage artisanaux

**Techniques enseignées :**
• Préparation et tension des fils de chaîne
• Tissage en armure toile et sergé
• Création de motifs géométriques traditionnels
• Techniques de finition et franges

**Votre création :**
Vous repartirez avec votre propre lamba artisanal (60x180cm), véritable œuvre d'art textile que vous aurez tissée selon les méthodes ancestrales.

Cet atelier s'adresse aux passionnés de textile et de culture malgache. Aucune expérience préalable n'est requise.""",
                "short_description": "Apprenez l'art traditionnel du tissage malgache et créez votre propre lamba authentique avec de la soie sauvage locale.",
                "artisan": artisans[0],
                "workshop_type": "inscription",
                "skill_level": "Intermédiaire", 
                "base_price": Decimal("45000"),
                "min_participants": 3,
                "max_participants": 6,
                "duration_minutes": 360,  # 6 heures
                "location_type": "physical", 
                "address": "Atelier Textile Traditionnel, Ambositra",
                "room_details": "Atelier authentique avec 6 métiers à tisser traditionnels, espace de préparation des fils, zone de teinture naturelle",
                "materials_included": [
                    "Soie sauvage malgache (landibe) premium",
                    "Fils de coton biologique teints naturellement",
                    "Accès métier à tisser traditionnel", 
                    "Outils de tissage artisanaux complets",
                    "Matériel de finition et décoration"
                ],
                "materials_to_bring": [
                    "Vêtements confortables pouvant se salir",
                    "Chaussures fermées",
                    "Carnet pour notes (optionnel)"
                ],
                "what_you_will_learn": [
                    "Histoire et symbolique du lamba",
                    "Préparation et montage des fils",
                    "Techniques de tissage traditionnel", 
                    "Création de motifs géométriques",
                    "Finitions professionnelles"
                ],
                "featured_image_url": "https://images.unsplash.com/photo-1721322800607-8c38375eef04?w=800&h=600&fit=crop",
                "gallery_images": [
                    "https://images.unsplash.com/photo-1611366607516-e3b3c19fcfb1?w=400&h=300&fit=crop",
                    "https://images.unsplash.com/photo-1590736969955-71cc94901144?w=400&h=300&fit=crop",
                    "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop"
                ],
                "tags": ["tissage", "lamba", "soie", "tradition", "textile"],
                "sessions": [
                    {
                        "start_datetime": datetime.now() + timedelta(days=9, hours=8),  # Lundi suivant 8h
                        "participants": 2,
                        "price": Decimal("45000")
                    },
                    {
                        "start_datetime": datetime.now() + timedelta(days=16, hours=8),  # Lundi d'après 8h  
                        "participants": 4,
                        "price": Decimal("45000")
                    }
                ]
            },
            {
                "title": "Sculpture sur Bois : Masques et Totems Malgaches",
                "slug": "sculpture-masques-totems",
                "description": """Immergez-vous dans l'art sacré de la sculpture sur bois malgache et créez votre propre masque traditionnel ou totem décoratif.

Cet atelier de 4 heures vous initiera aux techniques de sculpture traditionnelles utilisées pour créer les masques cérémoniels et totems qui ornent les tombeaux et maisons malgaches.

**Programme de formation :**
• Introduction aux essences de bois malgaches (30 min)
• Sécurité et manipulation des outils traditionnels (30 min)  
• Esquisse et préparation du design (45 min)
• Techniques de sculpture : creusement et modelage (2h15)
• Finition et patine traditionnelle (30 min)

**Essences de bois disponibles :**
• Palissandre de Madagascar (premium)
• Bois de rose malgache
• Hazomalany (bois dur local)
• Tamarindier séché

**Créations possibles :**
• Masque traditionnel malgache (style Sakalava ou Betsileo)
• Petit totem décoratif avec motifs ancestraux
• Sculpture animalière (zébu, lémurien)
• Objet utilitaire sculpté (bol, cuillère décorative)

**Outils traditionnels fournis :**
• Herminettes malgaches de différentes tailles
• Gouges et ciseaux à bois artisanaux
• Râpes et limes traditionnelles
• Produits de finition naturels

Vous repartirez avec votre sculpture personnalisée et la connaissance des techniques ancestrales. Un certificat de participation vous sera remis.

Atelier adapté aux débutants motivés et aux intermédiaires souhaitant perfectionner leur technique.""",
                "short_description": "Initiez-vous à la sculpture sur bois traditionnelle malgache et créez masques, totems ou objets décoratifs avec des essences locales.",
                "artisan": artisans[0] if len(artisans) == 1 else artisans[-1], 
                "workshop_type": "inscription",
                "skill_level": "Débutant",
                "base_price": Decimal("28000"),
                "min_participants": 4,
                "max_participants": 10,
                "duration_minutes": 240,  # 4 heures
                "location_type": "physical",
                "address": "Atelier Sculpture, Village Artisanal Antanifotsy",
                "room_details": "Atelier spacieux avec établis individuels, système d'aspiration, rangement outils sécurisé, espace exposition",
                "materials_included": [
                    "Blocs de bois locaux (palissandre, bois de rose)",
                    "Outils de sculpture traditionnels complets",
                    "Matériel de sécurité (lunettes, gants)",
                    "Produits de finition et patine naturels",
                    "Papier de verre et matériel de polissage"
                ],
                "materials_to_bring": [
                    "Vêtements de travail (blouse recommandée)",
                    "Chaussures de sécurité fermées", 
                    "Masque anti-poussière (fourni si besoin)"
                ],
                "prerequisites": "Aucune expérience préalable requise. Aptitude physique de base pour manipulation des outils.",
                "what_you_will_learn": [
                    "Reconnaissance des essences de bois malgaches",
                    "Techniques de sculpture traditionnelles",
                    "Maniement sécurisé des outils artisanaux", 
                    "Création de motifs et symboles malgaches",
                    "Finitions et techniques de conservation"
                ],
                "featured_image_url": "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=800&h=600&fit=crop",
                "gallery_images": [
                    "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400&h=300&fit=crop",
                    "https://images.unsplash.com/photo-1607734834519-d8576ae60ea7?w=400&h=300&fit=crop",
                    "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop"
                ],
                "tags": ["sculpture", "bois", "masque", "totem", "artisanat"],
                "sessions": [
                    {
                        "start_datetime": datetime.now() + timedelta(days=6, hours=9),  # Vendredi prochain 9h
                        "participants": 7,
                        "price": Decimal("28000")
                    },
                    {
                        "start_datetime": datetime.now() + timedelta(days=13, hours=13),  # Vendredi suivant 13h
                        "participants": 5,
                        "price": Decimal("28000")
                    },
                    {
                        "start_datetime": datetime.now() + timedelta(days=20, hours=9),  # Vendredi d'après 9h
                        "participants": 3,
                        "price": Decimal("28000")
                    }
                ]
            }
        ]
        
        # Créer les ateliers et sessions
        created_workshops = []
        
        for workshop_data in inscription_workshops_data:
            # Extraire les sessions avant de créer l'atelier
            sessions_data = workshop_data.pop("sessions")
            artisan_obj = workshop_data.pop("artisan")
            
            # Créer l'atelier
            workshop = Workshop(
                id=uuid.uuid4(),
                artisan_id=artisan_obj.id,
                status="published",
                is_featured=True,
                **workshop_data
            )
            
            db.add(workshop)
            db.flush()  # Pour obtenir l'ID
            
            # Créer les sessions
            for session_data in sessions_data:
                participants = session_data.pop("participants", 0)
                
                session = WorkshopSession(
                    id=uuid.uuid4(),
                    workshop_id=workshop.id,
                    end_datetime=session_data["start_datetime"] + timedelta(minutes=workshop.duration_minutes),
                    max_participants=workshop.max_participants,
                    current_bookings=participants,
                    available_spots=workshop.max_participants - participants,
                    session_price=session_data["price"],
                    status="scheduled" if participants >= workshop.min_participants else "scheduled",
                    **{k: v for k, v in session_data.items() if k != "price"}
                )
                
                db.add(session)
            
            created_workshops.append(workshop)
        
        # Sauvegarder
        db.commit()
        
        print(f"✅ Créé {len(created_workshops)} ateliers sur inscription avec leurs sessions")
        for workshop in created_workshops:
            session_count = db.query(WorkshopSession).filter(WorkshopSession.workshop_id == workshop.id).count()
            print(f"   • {workshop.title} ({session_count} sessions)")
        
        return True
        
    except Exception as e:
        db.rollback()
        print(f"❌ Erreur lors de la création des ateliers : {e}")
        return False
        
    finally:
        db.close()


if __name__ == "__main__":
    success = create_inscription_workshops()
    if success:
        print("\n🎉 Ateliers sur inscription créés avec succès !")
    else:
        print("\n💥 Échec de la création des ateliers")
        sys.exit(1)