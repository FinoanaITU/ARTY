"""
Endpoints d'authentification et gestion des utilisateurs
"""
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.services.auth import auth_service
from app.schemas.user import (
    BuyerRegisterIn,
    ArtisanRegisterIn,
    LoginIn,
    TokenOut,
    UserOut,
    RefreshTokenIn
)
from app.api.deps import get_current_active_user, RequireAdmin
from app.models.user import User

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/v1/auth/login")


@router.post("/register/buyer", response_model=TokenOut, status_code=status.HTTP_201_CREATED)
async def register_buyer(
    buyer_data: BuyerRegisterIn,
    db: Session = Depends(get_db)
):
    """
    Inscription d'un nouvel acheteur (particulier ou entreprise)
    """
    try:
        user = auth_service.create_buyer(db, buyer_data)
        tokens = auth_service.generate_tokens(user)
        
        # Préparer la réponse avec les données utilisateur
        user_out = UserOut.model_validate(user)
        
        return TokenOut(
            access_token=tokens["access_token"],
            refresh_token=tokens.get("refresh_token"),
            token_type=tokens.get("token_type", "bearer"),
            user=user_out
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erreur lors de la création du compte"
        )


@router.post("/register/artisan", response_model=TokenOut, status_code=status.HTTP_201_CREATED)
async def register_artisan(
    email: str = Form(...),
    password: str = Form(...),
    name: str = Form(...),
    phone: Optional[str] = Form(None),
    region: str = Form(...),
    city: str = Form(...),
    address: Optional[str] = Form(None),
    languages: Optional[str] = Form(None),  # JSON string ou liste séparée par virgule
    company_name: str = Form(...),
    main_specialty: str = Form(...),
    other_skills: Optional[str] = Form(None),
    years_experience: Optional[str] = Form(None),
    activity_description: str = Form(...),
    brand_story: Optional[str] = Form(None),
    offerings: str = Form(...),  # JSON string ou liste séparée par virgule
    nif: Optional[str] = Form(None),
    stat: Optional[str] = Form(None),
    documents_not_available: bool = Form(False),
    photos: Optional[List[UploadFile]] = File(None),
    db: Session = Depends(get_db)
):
    """
    Inscription d'un nouvel artisan avec upload de photos (jusqu'à 5)
    """
    try:
        # Parser les champs JSON/list
        import json
        languages_list = []
        if languages:
            try:
                languages_list = json.loads(languages)
            except:
                languages_list = [l.strip() for l in languages.split(",") if l.strip()]
        
        other_skills_list = []
        if other_skills:
            try:
                other_skills_list = json.loads(other_skills)
            except:
                other_skills_list = [s.strip() for s in other_skills.split(",") if s.strip()]
        
        offerings_list = []
        if offerings:
            try:
                offerings_list = json.loads(offerings)
            except:
                offerings_list = [o.strip() for o in offerings.split(",") if o.strip()]
        
        # Créer l'objet ArtisanRegisterIn
        artisan_data = ArtisanRegisterIn(
            email=email,
            password=password,
            name=name,
            phone=phone,
            region=region,
            city=city,
            address=address,
            languages=languages_list,
            company_name=company_name,
            main_specialty=main_specialty,
            other_skills=other_skills_list,
            years_experience=years_experience,
            activity_description=activity_description,
            brand_story=brand_story,
            offerings=offerings_list,
            nif=nif,
            stat=stat,
            documents_not_available=documents_not_available
        )
        
        # Créer l'utilisateur et le profil
        photos_list = photos[:5] if photos else None  # Max 5 photos
        user, artisan_profile = auth_service.create_artisan(db, artisan_data, photos_list)
        
        tokens = auth_service.generate_tokens(user)
        
        # Préparer la réponse avec les données utilisateur
        user_out = UserOut.model_validate(user)
        user_out.specialty = artisan_profile.main_specialty
        user_out.description = artisan_profile.activity_description
        user_out.experience = artisan_profile.years_experience
        
        return TokenOut(
            access_token=tokens["access_token"],
            refresh_token=tokens.get("refresh_token"),
            token_type=tokens.get("token_type", "bearer"),
            user=user_out
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur lors de la création du compte artisan: {str(e)}"
        )


@router.post("/login", response_model=TokenOut)
async def login(
    credentials: LoginIn,
    db: Session = Depends(get_db)
):
    """
    Connexion d'un utilisateur et génération des tokens
    """
    user = auth_service.authenticate(db, credentials.email, credentials.password)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email ou mot de passe incorrect",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    tokens = auth_service.generate_tokens(user)
    user_out = UserOut.model_validate(user)
    
    # Ajouter les infos artisan si nécessaire
    if user.role.value == "artisan" and user.artisan_profile:
        user_out.specialty = user.artisan_profile.main_specialty
        user_out.description = user.artisan_profile.activity_description
        user_out.experience = user.artisan_profile.years_experience
    
    return TokenOut(
        access_token=tokens["access_token"],
        refresh_token=tokens["refresh_token"],
        token_type=tokens["token_type"],
        user=user_out
    )


@router.get("/me", response_model=UserOut)
async def get_current_user_info(
    current_user: User = Depends(get_current_active_user)
):
    """
    Récupère les informations de l'utilisateur connecté
    """
    user_out = UserOut.model_validate(current_user)
    
    # Ajouter les infos artisan si nécessaire
    if current_user.role.value == "artisan" and current_user.artisan_profile:
        user_out.specialty = current_user.artisan_profile.main_specialty
        user_out.description = current_user.artisan_profile.activity_description
        user_out.experience = current_user.artisan_profile.years_experience
    
    return user_out


@router.post("/refresh", response_model=TokenOut)
async def refresh_token(
    refresh_data: RefreshTokenIn,
    db: Session = Depends(get_db)
):
    """
    Rafraîchit le token d'accès avec un refresh token
    """
    payload = auth_service.verify_token(refresh_data.refresh_token)
    
    if not payload or payload.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token de refresh invalide"
        )
    
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token invalide"
        )
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Utilisateur introuvable ou inactif"
        )
    
    tokens = auth_service.generate_tokens(user)
    user_out = UserOut.model_validate(user)
    
    return TokenOut(
        access_token=tokens["access_token"],
        refresh_token=tokens["refresh_token"],
        token_type=tokens["token_type"],
        user=user_out
    )


@router.post("/logout")
async def logout(
    current_user: User = Depends(get_current_active_user)
):
    """
    Déconnexion de l'utilisateur (invalide le token côté client)
    """
    # Note: En JWT stateless, on ne peut pas invalider le token côté serveur
    # Dans une implémentation complète, on pourrait stocker les tokens blacklistés
    return {"message": "Déconnexion réussie"}


@router.post("/forgot-password")
async def forgot_password():
    """
    Envoie un email de réinitialisation de mot de passe
    TODO: Implémenter avec service email
    """
    return {"message": "Email de réinitialisation envoyé (non implémenté)"}


@router.post("/reset-password")
async def reset_password():
    """
    Réinitialise le mot de passe avec un token
    TODO: Implémenter
    """
    return {"message": "Mot de passe réinitialisé (non implémenté)"}
