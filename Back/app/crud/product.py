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
from app.utils.id_utils import normalize_id, id_to_string, get_db_type
import uuid
import re

class ProductCRUD(CRUDBase):
    """CRUD pour les produits"""
    
    def __init__(self):
        super().__init__(Product)
    
    def _generate_slug(self, name: str) -> str:
        """Génère un slug à partir du nom"""

        slug = name.lower()
        slug = re.sub(r'[^a-z0-9]+', '-', slug)
        slug = re.sub(r'^-+|-+$', '', slug)
        return slug
    
    def _get_or_create_category(self, db: Session, category_name: str, subcategory: Optional[str] = None):
        """Récupère ou crée une catégorie"""

        category = db.query(Category).filter(
            func.lower(Category.name) == category_name.lower()
        ).first()
        
        if not category:

            category = Category(
                id=uuid.uuid4(),
                name=category_name,
                slug=self._generate_slug(category_name),
                is_active=True
            )
            db.add(category)
            db.flush()
        

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
        artisan_id,
        images: Optional[List[str]] = None
    ) -> Product:
        """Crée un nouveau produit"""

        category_id = self._get_or_create_category(db, obj_in.category, obj_in.subcategory)
        

        slug = self._generate_slug(obj_in.name)

        existing = db.query(Product).filter(Product.slug == slug).first()
        if existing:

            slug_suffix_uuid = uuid.uuid4()
            slug_suffix = str(slug_suffix_uuid).replace('-', '')[:8]
            slug = f"{slug}-{slug_suffix}"
        

        dimensions_json = None
        if obj_in.dimensions:
            dimensions_json = {
                "length": obj_in.dimensions.length,
                "width": obj_in.dimensions.width,
                "height": obj_in.dimensions.height,
                "weight": obj_in.dimensions.weight
            }
        

        product_id = uuid.uuid4()
        
        product = Product(
            id=product_id,
            title=obj_in.name,
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
            status='draft',
            handmade=True,
            made_to_order=obj_in.bulk_order_enabled,
            min_bulk_quantity=obj_in.min_bulk_quantity
        )
        
        db.add(product)
        db.flush()

        if not hasattr(product, 'id') or product.id is None:

            db.refresh(product)
        

        if images:

            product_id_for_image = product.id

            if isinstance(product_id_for_image, str):
                try:

                    product_id_for_image = uuid.UUID(product_id_for_image)
                except (ValueError, AttributeError, TypeError):

                    pass
            
            for index, image_url in enumerate(images[:10]):
                product_image = ProductImage(
                    id=uuid.uuid4(),
                    product_id=product_id_for_image,
                    image_url=image_url,
                    sort_order=index,
                    is_primary=(index == 0)
                )
                db.add(product_image)
        
        db.commit()
        db.refresh(product)
        return product
    
    def get_by_id(self, db: Session, product_id) -> Optional[Product]:
        """Récupère un produit par son ID"""

        db_type = get_db_type(db)
        
        if db_type == 'sqlite':

            product_id_str = id_to_string(product_id)
            try:
                return db.query(Product).filter(Product.id == product_id_str).first()
            except Exception:
                return None
        else:

            try:
                return db.query(Product).filter(Product.id == product_id).first()
            except Exception:

                try:
                    product_id_str = id_to_string(product_id)
                    return db.query(Product).filter(Product.id == product_id_str).first()
                except Exception:
                    return None
    
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
        db_type = get_db_type(db)
        query = db.query(Product)
        

        if category:
            category_obj = db.query(Category).filter(
                func.lower(Category.name) == category.lower()
            ).first()
            if category_obj:
                if subcategory:

                    category_obj_id = id_to_string(category_obj.id) if db_type == 'sqlite' else category_obj.id
                    subcategory_obj = db.query(Category).filter(
                        and_(
                            func.lower(Category.name) == subcategory.lower(),
                            Category.parent_id == category_obj_id
                        )
                    ).first()
                    if subcategory_obj:
                        subcategory_id = id_to_string(subcategory_obj.id) if db_type == 'sqlite' else subcategory_obj.id
                        query = query.filter(Product.category_id == subcategory_id)
                    else:

                        return [], 0
                else:

                    category_obj_id = id_to_string(category_obj.id) if db_type == 'sqlite' else category_obj.id
                    subcategory_ids = db.query(Category.id).filter(
                        Category.parent_id == category_obj_id
                    ).all()
                    if db_type == 'sqlite':
                        category_ids = [id_to_string(category_obj.id)] + [id_to_string(c[0]) for c in subcategory_ids]
                    else:
                        category_ids = [category_obj.id] + [c[0] for c in subcategory_ids]
                    query = query.filter(Product.category_id.in_(category_ids))
        

        if artisan_id:
            artisan_id_filter = id_to_string(artisan_id) if db_type == 'sqlite' else artisan_id
            query = query.filter(Product.artisan_id == artisan_id_filter)
        

        if search:
            search_pattern = f"%{search}%"
            query = query.filter(
                or_(
                    Product.title.ilike(search_pattern),
                    Product.description.ilike(search_pattern)
                )
            )
        

        if min_price is not None:
            query = query.filter(Product.price >= min_price)
        if max_price is not None:
            query = query.filter(Product.price <= max_price)
        

        if in_stock is not None:
            if in_stock:
                query = query.filter(Product.stock_quantity > 0)
            else:
                query = query.filter(Product.stock_quantity == 0)
        

        if status == '__all__':

            pass
        elif status:
            query = query.filter(Product.status == status)
        else:

            query = query.filter(Product.status == 'published')
        

        total = query.count()
        

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

        update_data = obj_in.model_dump(exclude_unset=True)
        

        if 'name' in update_data:
            db_obj.title = update_data.pop('name')
            db_obj.slug = self._generate_slug(db_obj.title)

            db_type = get_db_type(db)
            product_id_filter = id_to_string(db_obj.id) if db_type == 'sqlite' else db_obj.id
            existing = db.query(Product).filter(
                and_(Product.slug == db_obj.slug, Product.id != product_id_filter)
            ).first()
            if existing:

                slug_suffix_uuid = uuid.uuid4()
                slug_suffix = str(slug_suffix_uuid).replace('-', '')[:8]
                db_obj.slug = f"{db_obj.slug}-{slug_suffix}"
        

        if 'category' in update_data:
            category_name = update_data.pop('category')
            subcategory = update_data.pop('subcategory', None)
            db_obj.category_id = self._get_or_create_category(db, category_name, subcategory)
        

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
        

        field_mapping = {
            'stock': 'stock_quantity',
            'available_colors': 'colors',
            'bulk_order_enabled': 'made_to_order'
        }
        
        for key, value in update_data.items():
            model_key = field_mapping.get(key, key)
            if hasattr(db_obj, model_key):
                setattr(db_obj, model_key, value)
        
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj
    
    def delete(self, db: Session, *, product_id) -> bool:
        """Supprime un produit"""

        product = self.get_by_id(db, product_id)
        if product:

            db_type = get_db_type(db)
            product_id_filter = id_to_string(product.id) if db_type == 'sqlite' else product.id
            db.query(ProductImage).filter(ProductImage.product_id == product_id_filter).delete()
            db.delete(product)
            db.commit()
            return True
        return False
    
    def get_images(self, db: Session, product_id) -> List[ProductImage]:
        """Récupère les images d'un produit"""

        db_type = get_db_type(db)
        
        if db_type == 'sqlite':

            product_id_str = id_to_string(product_id)
            try:
                return db.query(ProductImage).filter(
                    ProductImage.product_id == product_id_str
                ).order_by(ProductImage.sort_order).all()
            except Exception:
                return []
        else:

            try:
                return db.query(ProductImage).filter(
                    ProductImage.product_id == product_id
                ).order_by(ProductImage.sort_order).all()
            except Exception:

                try:
                    product_id_str = id_to_string(product_id)
                    return db.query(ProductImage).filter(
                        ProductImage.product_id == product_id_str
                    ).order_by(ProductImage.sort_order).all()
                except Exception:
                    return []
    
    def add_images(self, db: Session, product_id: UUID, image_urls: List[str]) -> List[ProductImage]:
        """Ajoute des images à un produit"""

        existing_count = db.query(ProductImage).filter(
            ProductImage.product_id == product_id
        ).count()
        
        images = []
        for index, image_url in enumerate(image_urls[:10]):
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
        product_id,
        limit: int = 3
    ) -> List[Product]:
        """Récupère des produits similaires"""
        product = self.get_by_id(db, product_id)
        if not product:
            return []
        

        db_type = get_db_type(db)
        try:
            if db_type == 'sqlite':

                product_id_str = id_to_string(product.id)
                category_id_str = id_to_string(product.category_id)
                query = db.query(Product).filter(
                    and_(
                        Product.id != product_id_str,
                        Product.category_id == category_id_str,
                        Product.status == 'published'
                    )
                )
            else:

                query = db.query(Product).filter(
                    and_(
                        Product.id != product.id,
                        Product.category_id == product.category_id,
                        Product.status == 'published'
                    )
                )
            products = query.limit(limit).all()
            return products
        except Exception as e:

            print(f"Error in get_similar_products: {e}")
            return []

product_crud = ProductCRUD()
