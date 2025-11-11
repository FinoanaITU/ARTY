"""
CRUD operations pour les produits artisanaux
"""
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, func
from typing import Optional, List, Dict, Any
from uuid import UUID
from app.models.product import Product, ProductImage, Category
from app.models.user import User
from app.schemas.product import ProductCreate, ProductUpdate
from app.crud.base import CRUDBase
import uuid
import re


class ProductCRUD(CRUDBase):
    """CRUD pour les produits"""
    
    def __init__(self):
        super().__init__(Product)
    
    def _generate_slug(self, name: str) -> str:
        """Génère un slug à partir du nom"""
        # Convertir en minuscules et remplacer les espaces par des tirets
        slug = name.lower()
        slug = re.sub(r'[^a-z0-9]+', '-', slug)
        slug = re.sub(r'^-+|-+$', '', slug)
        return slug
    
    def _get_or_create_category(self, db: Session, category_name: str, subcategory: Optional[str] = None) -> UUID:
        """Récupère ou crée une catégorie"""
        # Chercher d'abord la catégorie principale
        category = db.query(Category).filter(
            func.lower(Category.name) == category_name.lower()
        ).first()
        
        if not category:
            # Créer la catégorie si elle n'existe pas
            slug = self._generate_slug(category_name)
            category = Category(
                id=uuid.uuid4(),
                name=category_name,
                slug=slug,
                is_active=True
            )
            db.add(category)
            db.flush()
        
        # Si une sous-catégorie est spécifiée, chercher ou créer
        if subcategory:
            subcategory_obj = db.query(Category).filter(
                and_(
                    func.lower(Category.name) == subcategory.lower(),
                    Category.parent_id == category.id
                )
            ).first()
            
            if not subcategory_obj:
                subcategory_obj = Category(
                    id=uuid.uuid4(),
                    name=subcategory,
                    slug=self._generate_slug(subcategory),
                    parent_id=category.id,
                    is_active=True
                )
                db.add(subcategory_obj)
                db.flush()
            
            return subcategory_obj.id
        
        return category.id
    
    def create(
        self,
        db: Session,
        *,
        obj_in: ProductCreate,
        artisan_id: UUID,
        images: Optional[List[str]] = None
    ) -> Product:
        """Crée un nouveau produit"""
        # Obtenir ou créer la catégorie
        category_id = self._get_or_create_category(db, obj_in.category, obj_in.subcategory)
        
        # Créer le produit
        slug = self._generate_slug(obj_in.name)
        # Vérifier l'unicité du slug
        existing = db.query(Product).filter(Product.slug == slug).first()
        if existing:
            slug = f"{slug}-{uuid.uuid4().hex[:8]}"
        
        # Préparer les dimensions en JSON
        dimensions_json = None
        if obj_in.dimensions:
            dimensions_json = {
                "length": obj_in.dimensions.length,
                "width": obj_in.dimensions.width,
                "height": obj_in.dimensions.height,
                "weight": obj_in.dimensions.weight
            }
        
        product = Product(
            id=uuid.uuid4(),
            title=obj_in.name,  # Le modèle utilise 'title' mais le schema utilise 'name'
            slug=slug,
            description=obj_in.description,
            price=obj_in.price,
            category_id=category_id,
            artisan_id=artisan_id,
            stock_quantity=obj_in.stock,
            materials=obj_in.materials or [],
            colors=obj_in.available_colors or [],
            dimensions=dimensions_json,
            customizable=obj_in.customizable,
            production_time_days=obj_in.production_time_days,
            status='draft',  # Par défaut en draft
            handmade=True,
            made_to_order=obj_in.bulk_order_enabled
        )
        
        db.add(product)
        db.flush()
        
        # Ajouter les images si fournies
        if images:
            for index, image_url in enumerate(images[:10]):  # Max 10 images
                product_image = ProductImage(
                    id=uuid.uuid4(),
                    product_id=product.id,
                    image_url=image_url,
                    sort_order=index,
                    is_primary=(index == 0)
                )
                db.add(product_image)
        
        db.commit()
        db.refresh(product)
        return product
    
    def get_by_id(self, db: Session, product_id: UUID) -> Optional[Product]:
        """Récupère un produit par son ID"""
        return db.query(Product).filter(Product.id == product_id).first()
    
    def get_multi_with_filters(
        self,
        db: Session,
        *,
        category: Optional[str] = None,
        subcategory: Optional[str] = None,
        search: Optional[str] = None,
        artisan_id: Optional[UUID] = None,
        min_price: Optional[float] = None,
        max_price: Optional[float] = None,
        in_stock: Optional[bool] = None,
        status: Optional[str] = None,
        skip: int = 0,
        limit: int = 20
    ) -> tuple[List[Product], int]:
        """Récupère une liste de produits avec filtres"""
        query = db.query(Product)
        
        # Filtrer par catégorie
        if category:
            category_obj = db.query(Category).filter(
                func.lower(Category.name) == category.lower()
            ).first()
            if category_obj:
                if subcategory:
                    subcategory_obj = db.query(Category).filter(
                        and_(
                            func.lower(Category.name) == subcategory.lower(),
                            Category.parent_id == category_obj.id
                        )
                    ).first()
                    if subcategory_obj:
                        query = query.filter(Product.category_id == subcategory_obj.id)
                    else:
                        # Si sous-catégorie non trouvée, retourner liste vide
                        return [], 0
                else:
                    # Filtrer par catégorie principale ou ses sous-catégories
                    subcategory_ids = db.query(Category.id).filter(
                        Category.parent_id == category_obj.id
                    ).all()
                    category_ids = [category_obj.id] + [c[0] for c in subcategory_ids]
                    query = query.filter(Product.category_id.in_(category_ids))
        
        # Filtrer par artisan
        if artisan_id:
            query = query.filter(Product.artisan_id == artisan_id)
        
        # Recherche textuelle
        if search:
            search_pattern = f"%{search}%"
            query = query.filter(
                or_(
                    Product.title.ilike(search_pattern),
                    Product.description.ilike(search_pattern)
                )
            )
        
        # Filtrer par prix
        if min_price is not None:
            query = query.filter(Product.price >= min_price)
        if max_price is not None:
            query = query.filter(Product.price <= max_price)
        
        # Filtrer par stock
        if in_stock is not None:
            if in_stock:
                query = query.filter(Product.stock_quantity > 0)
            else:
                query = query.filter(Product.stock_quantity == 0)
        
        # Filtrer par statut (par défaut, seulement les produits publiés pour les utilisateurs publics)
        if status:
            query = query.filter(Product.status == status)
        else:
            # Par défaut, seulement les produits publiés
            query = query.filter(Product.status == 'published')
        
        # Compter le total avant pagination
        total = query.count()
        
        # Appliquer pagination
        products = query.order_by(Product.created_at.desc()).offset(skip).limit(limit).all()
        
        return products, total
    
    def update(
        self,
        db: Session,
        *,
        db_obj: Product,
        obj_in: ProductUpdate
    ) -> Product:
        """Met à jour un produit"""
        # Utiliser model_dump pour Pydantic v2
        update_data = obj_in.model_dump(exclude_unset=True)
        
        # Gérer le changement de nom (et donc de slug)
        if 'name' in update_data:
            db_obj.title = update_data.pop('name')
            db_obj.slug = self._generate_slug(db_obj.title)
            # Vérifier l'unicité du nouveau slug
            existing = db.query(Product).filter(
                and_(Product.slug == db_obj.slug, Product.id != db_obj.id)
            ).first()
            if existing:
                db_obj.slug = f"{db_obj.slug}-{uuid.uuid4().hex[:8]}"
        
        # Gérer le changement de catégorie
        if 'category' in update_data:
            category_name = update_data.pop('category')
            subcategory = update_data.pop('subcategory', None)
            db_obj.category_id = self._get_or_create_category(db, category_name, subcategory)
        
        # Gérer les dimensions
        if 'dimensions' in update_data:
            dims = update_data.pop('dimensions')
            if dims:
                db_obj.dimensions = {
                    "length": dims.get('length'),
                    "width": dims.get('width'),
                    "height": dims.get('height'),
                    "weight": dims.get('weight')
                }
            else:
                db_obj.dimensions = None
        
        # Mapper les champs du schema vers le modèle
        field_mapping = {
            'stock': 'stock_quantity',
            'available_colors': 'colors'
        }
        
        for key, value in update_data.items():
            model_key = field_mapping.get(key, key)
            if hasattr(db_obj, model_key):
                setattr(db_obj, model_key, value)
        
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj
    
    def delete(self, db: Session, *, product_id: UUID) -> bool:
        """Supprime un produit"""
        product = db.query(Product).filter(Product.id == product_id).first()
        if product:
            # Supprimer les images associées
            db.query(ProductImage).filter(ProductImage.product_id == product_id).delete()
            db.delete(product)
            db.commit()
            return True
        return False
    
    def get_images(self, db: Session, product_id: UUID) -> List[ProductImage]:
        """Récupère les images d'un produit"""
        return db.query(ProductImage).filter(
            ProductImage.product_id == product_id
        ).order_by(ProductImage.sort_order).all()
    
    def add_images(self, db: Session, product_id: UUID, image_urls: List[str]) -> List[ProductImage]:
        """Ajoute des images à un produit"""
        # Récupérer le nombre d'images existantes
        existing_count = db.query(ProductImage).filter(
            ProductImage.product_id == product_id
        ).count()
        
        images = []
        for index, image_url in enumerate(image_urls[:10]):  # Max 10 images total
            product_image = ProductImage(
                id=uuid.uuid4(),
                product_id=product_id,
                image_url=image_url,
                sort_order=existing_count + index,
                is_primary=(existing_count == 0 and index == 0)
            )
            db.add(product_image)
            images.append(product_image)
        
        db.commit()
        return images
    
    def get_similar_products(
        self,
        db: Session,
        *,
        product_id: UUID,
        limit: int = 3
    ) -> List[Product]:
        """Récupère des produits similaires"""
        product = self.get_by_id(db, product_id)
        if not product:
            return []
        
        # Chercher des produits de la même catégorie
        query = db.query(Product).filter(
            and_(
                Product.id != product_id,
                Product.category_id == product.category_id,
                Product.status == 'published'
            )
        )
        
        return query.limit(limit).all()


# Instance pour import facile
product_crud = ProductCRUD()
