"""
Endpoints pour les produits artisanaux
"""
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from uuid import UUID
from decimal import Decimal

from app.core.database import get_db
from app.api.deps import get_current_active_user, require_role
from app.models.user import User, UserRole
from app.models.product import Product, ProductImage, Category
from app.crud.product import product_crud
from app.schemas.product import (
    ProductCreate,
    ProductUpdate,
    ProductOut,
    ProductListResponse,
    ProductListItem,
    CategoriesResponse,
    CategoryOut,
    BulkOrderRequestIn
)
from app.services.storage import StorageService


router = APIRouter()


def _product_to_out(product: Product, db: Session) -> ProductOut:
    """Convertit un Product en ProductOut"""
    # Récupérer les images
    images = [img.image_url for img in product_crud.get_images(db, product.id)]
    
    # Récupérer l'artisan
    artisan = db.query(User).filter(User.id == product.artisan_id).first()
    artisan_basic = {
        "id": artisan.id,
        "name": artisan.name
    }
    
    # Extraire les dimensions
    dimensions = None
    if product.dimensions:
        dimensions = {
            "length": product.dimensions.get("length"),
            "width": product.dimensions.get("width"),
            "height": product.dimensions.get("height"),
            "weight": product.dimensions.get("weight")
        }
    
    # Récupérer la catégorie
    category_obj = db.query(Category).filter(Category.id == product.category_id).first()
    category_name = category_obj.name if category_obj else "Non catégorisé"
    
    return ProductOut(
        id=product.id,
        name=product.title,  # Le modèle utilise 'title' mais le schema utilise 'name'
        description=product.description,
        category=category_name,
        subcategory=None,  # TODO: gérer les sous-catégories
        price=product.price,
        images=images,
        artisan=artisan_basic,
        materials=product.materials or [],
        available_colors=product.colors or [],
        dimensions=dimensions,
        stock=product.stock_quantity,
        customizable=product.customizable,
        production_time_days=product.production_time_days or 0,
        bulk_order_enabled=product.made_to_order,
        min_bulk_quantity=None,  # TODO: ajouter ce champ au modèle
        status=product.status,
        rating=float(product.rating_average) if product.rating_average else None,
        review_count=product.rating_count or 0,
        created_at=product.created_at,
        updated_at=product.updated_at
    )


def _product_to_list_item(product: Product, db: Session) -> ProductListItem:
    """Convertit un Product en ProductListItem"""
    # Récupérer les images (seulement la première pour la liste)
    images = [img.image_url for img in product_crud.get_images(db, product.id)[:1]]
    
    # Récupérer l'artisan
    artisan = db.query(User).filter(User.id == product.artisan_id).first()
    artisan_basic = {
        "id": artisan.id,
        "name": artisan.name
    }
    
    return ProductListItem(
        id=product.id,
        name=product.title,
        price=product.price,
        images=images,
        artisan=artisan_basic,
        stock=product.stock_quantity,
        status=product.status,
        rating=float(product.rating_average) if product.rating_average else None,
        review_count=product.rating_count or 0,
        created_at=product.created_at
    )


@router.get("/", response_model=ProductListResponse)
async def get_products(
    category: Optional[str] = Query(None, description="Filtrer par catégorie"),
    subcategory: Optional[str] = Query(None, description="Filtrer par sous-catégorie"),
    search: Optional[str] = Query(None, description="Recherche textuelle"),
    artisan_id: Optional[UUID] = Query(None, description="Filtrer par artisan"),
    min_price: Optional[float] = Query(None, ge=0, description="Prix minimum"),
    max_price: Optional[float] = Query(None, ge=0, description="Prix maximum"),
    in_stock: Optional[bool] = Query(None, description="Filtrer par disponibilité"),
    page: int = Query(1, ge=1, description="Numéro de page"),
    limit: int = Query(20, ge=1, le=100, description="Nombre d'éléments par page"),
    db: Session = Depends(get_db)
):
    """
    Liste des produits avec filtres et pagination
    
    - **category**: Filtrer par catégorie
    - **subcategory**: Filtrer par sous-catégorie
    - **search**: Recherche textuelle dans le nom et la description
    - **artisan_id**: Filtrer par artisan
    - **min_price/max_price**: Filtrer par fourchette de prix
    - **in_stock**: Filtrer par disponibilité (true/false)
    - **page**: Numéro de page (défaut: 1)
    - **limit**: Nombre d'éléments par page (défaut: 20, max: 100)
    """
    skip = (page - 1) * limit
    
    products, total = product_crud.get_multi_with_filters(
        db,
        category=category,
        subcategory=subcategory,
        search=search,
        artisan_id=artisan_id,
        min_price=min_price,
        max_price=max_price,
        in_stock=in_stock,
        skip=skip,
        limit=limit
    )
    
    items = [_product_to_list_item(product, db) for product in products]
    pages = (total + limit - 1) // limit if total > 0 else 1
    
    return ProductListResponse(
        items=items,
        total=total,
        page=page,
        pages=pages,
        limit=limit
    )


@router.get("/{product_id}", response_model=ProductOut)
async def get_product(
    product_id: UUID,
    db: Session = Depends(get_db)
):
    """
    Détails complets d'un produit
    
    - **product_id**: UUID du produit
    """
    product = product_crud.get_by_id(db, product_id)
    
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Produit non trouvé"
        )
    
    # Vérifier que le produit est publié (sauf si l'utilisateur est l'artisan ou admin)
    # TODO: Ajouter cette vérification avec get_current_active_user optionnel
    
    return _product_to_out(product, db)


@router.post("/", response_model=ProductOut, status_code=status.HTTP_201_CREATED)
async def create_product(
    name: str = Form(...),
    description: str = Form(...),
    category: str = Form(...),
    subcategory: Optional[str] = Form(None),
    price: Decimal = Form(...),
    materials: Optional[str] = Form(None),  # JSON string ou liste séparée par virgules
    available_colors: Optional[str] = Form(None),  # JSON string ou liste séparée par virgules
    stock: int = Form(0),
    customizable: bool = Form(False),
    production_time_days: int = Form(...),
    bulk_order_enabled: bool = Form(False),
    min_bulk_quantity: Optional[int] = Form(None),
    dimensions_length: Optional[float] = Form(None),
    dimensions_width: Optional[float] = Form(None),
    dimensions_height: Optional[float] = Form(None),
    dimensions_weight: Optional[float] = Form(None),
    photos: Optional[List[UploadFile]] = File(None),
    current_user: User = Depends(require_role([UserRole.ARTISAN])),
    db: Session = Depends(get_db)
):
    """
    Crée un nouveau produit (Artisan seulement)
    
    - Upload de photos (max 10)
    - Statut par défaut: draft
    """
    # Vérifier que l'utilisateur a un profil artisan
    if not current_user.artisan_profile:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Vous devez avoir un profil artisan pour créer des produits"
        )
    
    # Parser les listes
    import json
    materials_list = []
    if materials:
        try:
            materials_list = json.loads(materials)
        except:
            materials_list = [m.strip() for m in materials.split(",") if m.strip()]
    
    colors_list = []
    if available_colors:
        try:
            colors_list = json.loads(available_colors)
        except:
            colors_list = [c.strip() for c in available_colors.split(",") if c.strip()]
    
    # Préparer les dimensions
    dimensions = None
    if dimensions_length or dimensions_width or dimensions_height or dimensions_weight:
        from app.schemas.product import ProductDimensions
        dimensions = ProductDimensions(
            length=dimensions_length,
            width=dimensions_width,
            height=dimensions_height,
            weight=dimensions_weight
        )
    
    # Créer le schema ProductCreate
    product_data = ProductCreate(
        name=name,
        description=description,
        category=category,
        subcategory=subcategory,
        price=price,
        materials=materials_list,
        available_colors=colors_list,
        dimensions=dimensions,
        stock=stock,
        customizable=customizable,
        production_time_days=production_time_days,
        bulk_order_enabled=bulk_order_enabled,
        min_bulk_quantity=min_bulk_quantity
    )
    
    # Upload des photos
    image_urls = []
    if photos:
        storage_service = StorageService()
        for photo_file in photos[:10]:  # Max 10 photos
            try:
                photo_url = storage_service.upload_file(
                    file=photo_file,
                    folder="products",
                    allowed_extensions=["jpg", "jpeg", "png", "webp"]
                )
                image_urls.append(photo_url)
            except Exception as e:
                # Log l'erreur mais continue
                print(f"Erreur lors de l'upload de la photo: {e}")
    
    # Créer le produit
    product = product_crud.create(
        db,
        obj_in=product_data,
        artisan_id=current_user.id,
        images=image_urls
    )
    
    return _product_to_out(product, db)


@router.patch("/{product_id}", response_model=ProductOut)
async def update_product(
    product_id: UUID,
    name: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    category: Optional[str] = Form(None),
    subcategory: Optional[str] = Form(None),
    price: Optional[Decimal] = Form(None),
    materials: Optional[str] = Form(None),
    available_colors: Optional[str] = Form(None),
    stock: Optional[int] = Form(None),
    customizable: Optional[bool] = Form(None),
    production_time_days: Optional[int] = Form(None),
    bulk_order_enabled: Optional[bool] = Form(None),
    min_bulk_quantity: Optional[int] = Form(None),
    status: Optional[str] = Form(None),
    current_user: User = Depends(require_role([UserRole.ARTISAN])),
    db: Session = Depends(get_db)
):
    """
    Met à jour un produit (Artisan - son produit seulement)
    """
    product = product_crud.get_by_id(db, product_id)
    
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Produit non trouvé"
        )
    
    # Vérifier que l'utilisateur est le propriétaire ou admin
    if product.artisan_id != current_user.id and current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Vous n'avez pas la permission de modifier ce produit"
        )
    
    # Parser les listes si fournies
    import json
    update_data = {}
    
    if name is not None:
        update_data["name"] = name
    if description is not None:
        update_data["description"] = description
    if category is not None:
        update_data["category"] = category
    if subcategory is not None:
        update_data["subcategory"] = subcategory
    if price is not None:
        update_data["price"] = price
    if materials is not None:
        try:
            update_data["materials"] = json.loads(materials)
        except:
            update_data["materials"] = [m.strip() for m in materials.split(",") if m.strip()]
    if available_colors is not None:
        try:
            update_data["available_colors"] = json.loads(available_colors)
        except:
            update_data["available_colors"] = [c.strip() for c in available_colors.split(",") if c.strip()]
    if stock is not None:
        update_data["stock"] = stock
    if customizable is not None:
        update_data["customizable"] = customizable
    if production_time_days is not None:
        update_data["production_time_days"] = production_time_days
    if bulk_order_enabled is not None:
        update_data["bulk_order_enabled"] = bulk_order_enabled
    if min_bulk_quantity is not None:
        update_data["min_bulk_quantity"] = min_bulk_quantity
    if status is not None:
        update_data["status"] = status
    
    # Créer le ProductUpdate avec les données parsées
    product_update = ProductUpdate(**update_data)
    
    # Mettre à jour le produit
    updated_product = product_crud.update(db, db_obj=product, obj_in=product_update)
    
    return _product_to_out(updated_product, db)


@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_product(
    product_id: UUID,
    current_user: User = Depends(require_role([UserRole.ARTISAN])),
    db: Session = Depends(get_db)
):
    """
    Supprime un produit (Artisan - son produit seulement)
    """
    product = product_crud.get_by_id(db, product_id)
    
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Produit non trouvé"
        )
    
    # Vérifier que l'utilisateur est le propriétaire ou admin
    if product.artisan_id != current_user.id and current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Vous n'avez pas la permission de supprimer ce produit"
        )
    
    product_crud.delete(db, product_id=product_id)
    
    return None


@router.get("/categories/list", response_model=CategoriesResponse)
async def get_categories(
    db: Session = Depends(get_db)
):
    """
    Liste des catégories avec leurs sous-catégories
    """
    # Récupérer toutes les catégories principales (sans parent)
    main_categories = db.query(Category).filter(
        Category.parent_id.is_(None),
        Category.is_active == True
    ).all()
    
    categories_out = []
    for cat in main_categories:
        # Récupérer les sous-catégories
        subcategories = db.query(Category).filter(
            Category.parent_id == cat.id,
            Category.is_active == True
        ).all()
        
        categories_out.append(CategoryOut(
            name=cat.name,
            subcategories=[sub.name for sub in subcategories]
        ))
    
    return CategoriesResponse(categories=categories_out)
