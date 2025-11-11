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
    BulkOrderRequestIn,
    BulkOrderRequestOut,
    ArtisanBasic
)
from app.services.storage import StorageService
from app.crud.bulk_order import bulk_order_crud
from app.utils.id_utils import normalize_id, id_to_string, get_db_type


router = APIRouter()


def _product_to_out(product: Product, db: Session) -> ProductOut:
    """Convertit un Product en ProductOut"""
    from uuid import UUID as UUIDType
    
    # Récupérer les images (le CRUD gère la conversion d'ID)
    images = [img.image_url for img in product_crud.get_images(db, product.id)]
    
    # Récupérer l'artisan
    # Le GUID type devrait convertir automatiquement, mais on s'assure que c'est un UUID
    artisan = db.query(User).filter(User.id == product.artisan_id).first()
    if not artisan:
        raise ValueError(f"Artisan not found for product {product.id}")
    
    # S'assurer que les IDs sont des UUID objects pour Pydantic
    product_id = product.id
    if not isinstance(product_id, UUIDType):
        product_id = UUIDType(str(product_id))
    
    artisan_id = artisan.id
    if not isinstance(artisan_id, UUIDType):
        artisan_id = UUIDType(str(artisan_id))
    
    # Créer l'objet ArtisanBasic avec validation Pydantic
    artisan_basic = ArtisanBasic(
        id=artisan_id,
        name=artisan.name
    )
    
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
    if category_obj:
        # Si la catégorie a un parent, c'est une sous-catégorie
        if category_obj.parent_id:
            parent_category = db.query(Category).filter(Category.id == category_obj.parent_id).first()
            category_name = parent_category.name if parent_category else category_obj.name
            subcategory_name = category_obj.name
        else:
            category_name = category_obj.name
            subcategory_name = None
    else:
        category_name = "Non catégorisé"
        subcategory_name = None
    
    # S'assurer que production_time_days n'est pas None (requis par le schema)
    production_time_days = product.production_time_days if product.production_time_days is not None else 0
    
    # ArrayType gère automatiquement la conversion JSON <-> list pour SQLite/PostgreSQL
    # Mais on s'assure que c'est toujours une liste (fallback si None)
    materials_list = product.materials if product.materials is not None else []
    if not isinstance(materials_list, list):
        materials_list = []
    
    colors_list = product.colors if product.colors is not None else []
    if not isinstance(colors_list, list):
        colors_list = []
    
    # Convertir le prix en float pour la sérialisation JSON
    # Le prix peut être Decimal, string, int ou float selon la base de données
    price_value = product.price
    if price_value is None:
        price_value = 0.0
    else:
        try:
            # Convertir en float (Decimal, string, int, float)
            if isinstance(price_value, str):
                price_value = float(price_value)
            else:
                price_value = float(price_value)
        except (ValueError, TypeError, AttributeError):
            price_value = 0.0
    
    return ProductOut(
        id=product_id,
        name=product.title,  # Le modèle utilise 'title' mais le schema utilise 'name'
        description=product.description or "",
        category=category_name,
        subcategory=subcategory_name,
        price=price_value,
        images=images,
        artisan=artisan_basic,
        materials=materials_list,
        available_colors=colors_list,
        dimensions=dimensions,
        stock=product.stock_quantity or 0,
        customizable=product.customizable if product.customizable is not None else False,
        production_time_days=production_time_days,
        bulk_order_enabled=product.made_to_order if product.made_to_order is not None else False,
        min_bulk_quantity=product.min_bulk_quantity,
        status=product.status or "draft",
        rating=float(product.rating_average) if product.rating_average is not None else None,
        review_count=product.rating_count or 0,
        created_at=product.created_at,
        updated_at=product.updated_at
    )


def _product_to_list_item(product: Product, db: Session) -> ProductListItem:
    """Convertit un Product en ProductListItem"""
    from uuid import UUID as UUIDType
    
    # Récupérer les images (seulement la première pour la liste, le CRUD gère la conversion d'ID)
    images = [img.image_url for img in product_crud.get_images(db, product.id)[:1]]
    
    # Récupérer l'artisan
    artisan = db.query(User).filter(User.id == product.artisan_id).first()
    if not artisan:
        raise ValueError(f"Artisan not found for product {product.id}")
    
    # S'assurer que les IDs sont des UUID objects pour Pydantic
    product_id = product.id
    if not isinstance(product_id, UUIDType):
        product_id = UUIDType(str(product_id))
    
    artisan_id = artisan.id
    if not isinstance(artisan_id, UUIDType):
        artisan_id = UUIDType(str(artisan_id))
    
    # Créer l'objet ArtisanBasic avec validation Pydantic
    artisan_basic = ArtisanBasic(
        id=artisan_id,
        name=artisan.name
    )
    
    # Convertir le prix en float pour la sérialisation JSON
    price_value = product.price
    if price_value is None:
        price_value = 0.0
    else:
        try:
            price_value = float(price_value)
        except (ValueError, TypeError, AttributeError):
            price_value = 0.0
    
    return ProductListItem(
        id=product_id,
        name=product.title,
        price=price_value,
        images=images,
        artisan=artisan_basic,
        stock=product.stock_quantity or 0,
        status=product.status or "draft",
        rating=float(product.rating_average) if product.rating_average is not None else None,
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


@router.get("/categories", response_model=CategoriesResponse)
async def get_categories(
    db: Session = Depends(get_db)
):
    """
    Liste des catégories avec leurs sous-catégories
    """
    from sqlalchemy import or_
    # Récupérer toutes les catégories principales (sans parent)
    # Utiliser is_(None) qui fonctionne avec SQLAlchemy pour tous les types
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
    # Le GUID TypeDecorator gère automatiquement la conversion UUID <-> string
    from app.models.user import ArtisanProfile
    # Utiliser directement current_user.id - le GUID TypeDecorator gère la conversion
    artisan_profile = db.query(ArtisanProfile).filter(ArtisanProfile.user_id == current_user.id).first()
    if not artisan_profile:
        # Essayer aussi avec la relation si disponible (pour PostgreSQL)
        try:
            if hasattr(current_user, 'artisan_profile') and current_user.artisan_profile:
                artisan_profile = current_user.artisan_profile
        except:
            pass
    if not artisan_profile:
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
    
    # Créer le schema ProductCreate avec gestion des erreurs de validation
    try:
        product_data = ProductCreate(
            name=name,
            description=description,
            category=category,
            subcategory=subcategory,
            price=float(price),  # Convertir Decimal en float pour la validation
            materials=materials_list,
            available_colors=colors_list,
            dimensions=dimensions,
            stock=stock,
            customizable=customizable,
            production_time_days=production_time_days,
            bulk_order_enabled=bulk_order_enabled,
            min_bulk_quantity=min_bulk_quantity
        )
    except Exception as e:
        # Si c'est une ValidationError Pydantic, retourner un code 422
        from pydantic import ValidationError
        if isinstance(e, ValidationError):
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=str(e)
            )
        raise
    
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
    product_status: Optional[str] = Form(None, alias="status"),
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
    # Normaliser les IDs pour la comparaison (pour compatibilité SQLite)
    db_type = get_db_type(db)
    product_artisan_id = id_to_string(product.artisan_id) if db_type == 'sqlite' else product.artisan_id
    current_user_id = id_to_string(current_user.id) if db_type == 'sqlite' else current_user.id
    
    if product_artisan_id != current_user_id and current_user.role != UserRole.ADMIN:
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
    if product_status is not None:
        update_data["status"] = product_status
    
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
    # Normaliser les IDs pour la comparaison (pour compatibilité SQLite)
    db_type = get_db_type(db)
    product_artisan_id = id_to_string(product.artisan_id) if db_type == 'sqlite' else product.artisan_id
    current_user_id = id_to_string(current_user.id) if db_type == 'sqlite' else current_user.id
    
    if product_artisan_id != current_user_id and current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Vous n'avez pas la permission de supprimer ce produit"
        )
    
    product_crud.delete(db, product_id=product_id)
    
    return None


@router.get("/{product_id}/similar", response_model=ProductListResponse)
async def get_similar_products(
    product_id: UUID,
    limit: int = Query(3, ge=1, le=20, description="Nombre de produits similaires"),
    db: Session = Depends(get_db)
):
    """
    Récupère des produits similaires à un produit donné
    
    - **product_id**: UUID du produit
    - **limit**: Nombre de produits similaires à retourner (défaut: 3, max: 20)
    """
    # Vérifier que le produit existe
    product = product_crud.get_by_id(db, product_id)
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Produit non trouvé"
        )
    
    # Récupérer les produits similaires
    similar_products = product_crud.get_similar_products(
        db,
        product_id=product_id,
        limit=limit
    )
    
    items = [_product_to_list_item(product, db) for product in similar_products]
    
    return ProductListResponse(
        items=items,
        total=len(items),
        page=1,
        pages=1,
        limit=limit
    )


@router.post("/{product_id}/bulk-order-request", response_model=BulkOrderRequestOut, status_code=status.HTTP_201_CREATED)
async def create_bulk_order_request(
    product_id: UUID,
    bulk_order: BulkOrderRequestIn,
    db: Session = Depends(get_db)
):
    """
    Crée une demande de commande en gros pour un produit
    
    - **product_id**: UUID du produit
    - Calcule automatiquement les remises progressives selon la quantité
    """
    # Vérifier que le produit existe
    product = product_crud.get_by_id(db, product_id)
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Produit non trouvé"
        )
    
    # Vérifier que le produit autorise les commandes en gros
    if not product.made_to_order:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ce produit n'accepte pas les commandes en gros"
        )
    
    # Vérifier la quantité minimum
    min_quantity = product.min_bulk_quantity if product.min_bulk_quantity else 5
    if bulk_order.quantity < min_quantity:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"La quantité minimum pour une commande en gros est de {min_quantity} pièces"
        )
    
    # Créer la demande de commande en gros
    bulk_order_request = bulk_order_crud.create(
        db,
        product_id=product_id,
        obj_in=bulk_order,
        unit_price=product.price
    )
    
    return bulk_order_request
