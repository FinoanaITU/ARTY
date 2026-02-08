from fastapi import APIRouter, Depends, Query, Body, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional, List
from uuid import UUID
from datetime import date
from decimal import Decimal

from app.core.database import get_db
from app.core.dependencies import get_current_admin
from app.models.user import User
from app.schemas.admin import (
    ValidationRequest,
    PendingValidationsResponse,
    ValidationStatsOut,
    ArtisanProfileValidationOut,
    ProductValidationOut,
    WorkshopValidationOut,
    PlatformOverviewOut,
    RevenueStatsOut,
    ArtisanStatsOut,
    ConversionStatsOut,
    UserBehaviorStatsOut,
    # Payment tracking schemas
    PaymentOut,
    PaymentListResponse,
    RecordPaymentRequest,
    PaymentHistoryOut,
    ArtisanPayoutOut,
    PayoutListResponse,
    GeneratePayoutRequest,
    MarkPayoutPaidRequest,
    # Quote schemas
    QuoteRequestIn,
    QuoteOut,
    # Subscription schemas
    SubscriptionOut,
    SubscriptionListResponse,
    SubscriptionOverviewResponse,
    SubscriptionCancelRequest,
    SubscriptionExtendRequest,
    SubscriptionAddCreditsRequest,
    SubscriptionHistoryResponse,
    SubscriptionStatsResponse
)
from app.services.admin_validation_service import AdminValidationService
from app.services.admin_analytics_service import AdminAnalyticsService
from app.services.payment_tracking_service import PaymentTrackingService

router = APIRouter()


# ===== VALIDATION ENDPOINTS =====

@router.get(
    "/validations/pending",
    response_model=PendingValidationsResponse,
    summary="Liste des validations en attente",
    description="Récupère tous les contenus en attente de validation (profils, produits, ateliers)"
)
async def get_pending_validations(
    validation_type: Optional[str] = Query(None, description="Type de validation: profile/product/workshop/all"),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    Liste tous les contenus en attente de validation.
    Nécessite les permissions admin.
    """
    return await AdminValidationService.get_pending_validations(
        db=db,
        validation_type=validation_type,
        skip=skip,
        limit=limit
    )


@router.post(
    "/validations/artisan/{artisan_id}",
    response_model=dict,
    summary="Valider profil artisan",
    description="Approuver ou rejeter un profil artisan"
)
async def validate_artisan_profile(
    artisan_id: UUID,
    validation_request: ValidationRequest,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    Approuver ou rejeter un profil artisan.
    
    - **action**: approve ou reject
    - **notes**: Notes optionnelles de l'administrateur
    """
    user = await AdminValidationService.validate_artisan_profile(
        db=db,
        artisan_id=artisan_id,
        action=validation_request.action,
        admin_id=current_admin.id,
        notes=validation_request.notes
    )
    
    return {
        "message": f"Profil artisan {'approuvé' if validation_request.action.value == 'approve' else 'rejeté'} avec succès",
        "artisan_id": str(user.id),
        "status": user.artisan_profile.status.value if user.artisan_profile else None
    }


@router.post(
    "/validations/product/{product_id}",
    response_model=dict,
    summary="Valider produit",
    description="Approuver ou rejeter un produit"
)
async def validate_product(
    product_id: UUID,
    validation_request: ValidationRequest,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    Approuver ou rejeter un produit.
    
    - **action**: approve ou reject
    - **notes**: Notes optionnelles de l'administrateur
    """
    product = await AdminValidationService.validate_product(
        db=db,
        product_id=product_id,
        action=validation_request.action,
        admin_id=current_admin.id,
        notes=validation_request.notes
    )
    
    return {
        "message": f"Produit {'approuvé' if validation_request.action.value == 'approve' else 'rejeté'} avec succès",
        "product_id": str(product.id),
        "status": product.status
    }


@router.post(
    "/validations/workshop/{workshop_id}",
    response_model=dict,
    summary="Valider atelier",
    description="Approuver ou rejeter un atelier"
)
async def validate_workshop(
    workshop_id: UUID,
    validation_request: ValidationRequest,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    Approuver ou rejeter un atelier.
    
    - **action**: approve ou reject
    - **notes**: Notes optionnelles de l'administrateur
    """
    workshop = await AdminValidationService.validate_workshop(
        db=db,
        workshop_id=workshop_id,
        action=validation_request.action,
        admin_id=current_admin.id,
        notes=validation_request.notes
    )
    
    return {
        "message": f"Atelier {'approuvé' if validation_request.action.value == 'approve' else 'rejeté'} avec succès",
        "workshop_id": str(workshop.id),
        "status": workshop.status
    }


@router.get(
    "/validations/stats",
    response_model=ValidationStatsOut,
    summary="Statistiques de validation",
    description="Récupère les statistiques des validations"
)
async def get_validation_stats(
    period: str = Query("month", description="Période: day/week/month/all"),
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    Récupère les statistiques de validation sur une période donnée.
    
    Inclut:
    - Nombre total de validations
    - Taux d'approbation
    - Temps moyen de réponse
    - Statistiques par type (profil/produit/atelier)
    """
    return await AdminValidationService.get_validation_stats(
        db=db,
        period=period
    )


# ===== ANALYTICS ENDPOINTS =====

@router.get(
    "/analytics/overview",
    response_model=PlatformOverviewOut,
    summary="Vue d'ensemble de la plateforme",
    description="Récupère les statistiques générales de la plateforme"
)
async def get_platform_overview(
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    Récupère une vue d'ensemble complète de la plateforme.
    
    Inclut:
    - Nombre total d'utilisateurs (par rôle)
    - Statistiques artisans (actifs, en attente)
    - Statistiques produits et ateliers
    - Nombre de commandes et réservations
    - Validations en attente
    """
    analytics_service = AdminAnalyticsService(db)
    return await analytics_service.get_platform_overview()


@router.get(
    "/analytics/revenue",
    response_model=RevenueStatsOut,
    summary="Statistiques de revenus",
    description="Récupère les statistiques de revenus pour une période donnée"
)
async def get_revenue_stats(
    period: str = Query("month", description="Période: day/week/month/year/all"),
    start_date: Optional[date] = Query(None, description="Date de début personnalisée"),
    end_date: Optional[date] = Query(None, description="Date de fin personnalisée"),
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    Récupère les statistiques de revenus.
    
    Inclut:
    - Revenus totaux (produits + ateliers)
    - Commissions Artizaho
    - Répartition par catégorie
    - Évolution journalière (pour période week/month)
    """
    analytics_service = AdminAnalyticsService(db)
    return await analytics_service.get_revenue_stats(
        period=period,
        start_date=start_date,
        end_date=end_date
    )


@router.get(
    "/analytics/artisans",
    response_model=ArtisanStatsOut,
    summary="Statistiques artisans",
    description="Récupère les statistiques complètes sur les artisans"
)
async def get_artisan_stats(
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    Récupère les statistiques sur les artisans.
    
    Inclut:
    - Nombre total et actifs
    - Répartition par spécialité et région
    - Top performers (par ventes)
    - Nouveaux artisans ce mois
    """
    analytics_service = AdminAnalyticsService(db)
    return await analytics_service.get_artisan_stats()


@router.get(
    "/analytics/conversion",
    response_model=ConversionStatsOut,
    summary="Taux de conversion",
    description="Récupère les taux de conversion de la plateforme"
)
async def get_conversion_stats(
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    Récupère les taux de conversion.
    
    Inclut:
    - Taux vue → vente (produits)
    - Taux vue → réservation (ateliers)
    - Taux visiteur → acheteur
    """
    analytics_service = AdminAnalyticsService(db)
    return await analytics_service.get_conversion_stats()


@router.get(
    "/analytics/users",
    response_model=UserBehaviorStatsOut,
    summary="Comportement utilisateurs",
    description="Récupère les statistiques de comportement utilisateurs"
)
async def get_user_behavior_stats(
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    Récupère les statistiques de comportement utilisateurs.
    
    Inclut:
    - Panier moyen (AOV)
    - Nombre moyen d'articles par commande
    - Taux de clients récurrents
    - Méthodes de paiement préférées
    """
    analytics_service = AdminAnalyticsService(db)
    return await analytics_service.get_user_behavior_stats()


# ===== PAYMENT TRACKING ENDPOINTS =====

@router.get(
    "/payments",
    response_model=PaymentListResponse,
    summary="Liste des paiements",
    description="Récupère tous les paiements avec filtres optionnels"
)
async def get_all_payments(
    payment_status: Optional[str] = Query(None, description="Filtre par statut: unpaid/partial/paid/pending_collection"),
    artisan_type: Optional[str] = Query(None, description="Filtre par type artisan: artizaho/uber"),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    Liste tous les paiements avec filtres.
    
    Retourne:
    - Liste paginée des paiements
    - Totaux: montant total, montant payé, montant restant
    """
    return await PaymentTrackingService.get_all_payments(
        db=db,
        payment_status=payment_status,
        artisan_type=artisan_type,
        skip=skip,
        limit=limit
    )


@router.get(
    "/payments/{payment_id}",
    response_model=PaymentOut,
    summary="Détails d'un paiement",
    description="Récupère les détails d'un paiement spécifique"
)
async def get_payment_by_id(
    payment_id: UUID,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    Récupère un paiement par son ID avec toutes les informations enrichies.
    """
    payment = await PaymentTrackingService.get_payment_by_id(db, payment_id)
    
    if not payment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payment not found"
        )
    
    return payment


@router.get(
    "/payments/{payment_id}/history",
    response_model=List[PaymentHistoryOut],
    summary="Historique d'un paiement",
    description="Récupère l'historique des transactions pour un paiement"
)
async def get_payment_history(
    payment_id: UUID,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    Récupère l'historique complet des transactions pour un paiement.
    
    Retourne:
    - Liste de toutes les transactions enregistrées pour ce paiement
    - Avec montants, méthodes, références et notes
    """
    return await PaymentTrackingService.get_payment_history(
        db=db,
        payment_id=str(payment_id)
    )


@router.post(
    "/payments/{payment_id}/record",
    response_model=PaymentOut,
    summary="Enregistrer un paiement",
    description="Enregistre un paiement (total ou partiel) pour une commande/réservation"
)
async def record_payment(
    payment_id: UUID,
    payment_request: RecordPaymentRequest,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    Enregistre un paiement (total ou partiel).
    
    Paramètres:
    - **amount**: Montant du paiement
    - **payment_method**: Méthode (cash/mvola/orange_money/bank_transfer)
    - **transaction_ref**: Référence de transaction (optionnel)
    - **notes**: Notes supplémentaires (optionnel)
    
    Met à jour automatiquement le statut du paiement.
    """
    return await PaymentTrackingService.record_payment(
        db=db,
        payment_id=payment_id,
        request=payment_request,
        admin_id=current_admin.id
    )


@router.get(
    "/payouts/pending",
    response_model=PayoutListResponse,
    summary="Payouts en attente",
    description="Récupère tous les payouts artisans en attente ou en cours de traitement"
)
async def get_pending_payouts(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    Liste tous les payouts artisans en attente.
    
    Retourne:
    - Liste paginée des payouts pending/processing
    - Totaux: montant net total, commission totale
    """
    return await PaymentTrackingService.get_pending_payouts(
        db=db,
        skip=skip,
        limit=limit
    )


@router.post(
    "/payouts/generate",
    response_model=ArtisanPayoutOut,
    summary="Générer un payout artisan",
    description="Génère un payout pour un artisan pour une période donnée"
)
async def generate_artisan_payout(
    payout_request: GeneratePayoutRequest,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    Génère un payout pour un artisan.
    
    Paramètres:
    - **artisan_id**: ID de l'artisan
    - **period_start**: Date de début de période
    - **period_end**: Date de fin de période
    
    Calcule automatiquement:
    - Total des ventes (commandes payées)
    - Commission (15% artizaho, 20% uber)
    - Montant net à verser à l'artisan
    """
    return await PaymentTrackingService.generate_artisan_payout(
        db=db,
        request=payout_request
    )


@router.post(
    "/payouts/{payout_id}/mark-paid",
    response_model=ArtisanPayoutOut,
    summary="Marquer payout comme payé",
    description="Marque un payout artisan comme payé"
)
async def mark_payout_as_paid(
    payout_id: UUID,
    paid_request: MarkPayoutPaidRequest,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    Marque un payout comme payé.
    
    Paramètres:
    - **payment_method**: Méthode de paiement utilisée
    - **payment_ref**: Référence de transaction (optionnel)
    - **notes**: Notes supplémentaires (optionnel)
    
    Met à jour le statut à 'paid' et enregistre la date de paiement.
    """
    return await PaymentTrackingService.mark_payout_as_paid(
        db=db,
        payout_id=payout_id,
        request=paid_request
    )


@router.get(
    "/payouts/{artisan_id}/history",
    response_model=PayoutListResponse,
    summary="Historique payouts artisan",
    description="Récupère l'historique des payouts d'un artisan"
)
async def get_artisan_payout_history(
    artisan_id: UUID,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    Récupère l'historique complet des payouts d'un artisan.
    
    Retourne:
    - Liste paginée de tous les payouts (tous statuts)
    - Totaux: montant net total, commission totale
    """
    return await PaymentTrackingService.get_artisan_payout_history(
        db=db,
        artisan_id=artisan_id,
        skip=skip,
        limit=limit
    )



# ===== QUOTE MANAGER ENDPOINTS =====

@router.post(
    "/quotes",
    response_model=dict,
    summary="Créer une demande de devis",
    description="Permet aux utilisateurs de créer une demande de devis personnalisée"
)
async def create_quote_request(
    quote_data: QuoteRequestIn,
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    Crée une nouvelle demande de devis.
    
    - **quote_type**: workshop/product/custom
    - **title**: Titre du devis
    - **description**: Description détaillée
    - **quantity**: Quantité (par défaut 1)
    - **client_type**: particulier/entreprise
    - **client_name**: Nom du client
    - **client_email**: Email du client
    - **client_phone**: Téléphone du client
    - **company_name**: Nom entreprise (optionnel)
    """
    from app.services.quote_service import QuoteService
    
    quote = await QuoteService.create_quote_request(
        db=db,
        user_id=current_user.id,
        quote_data=quote_data
    )
    
    return {
        "id": str(quote.id),
        "status": "pending",
        "message": "Quote request created successfully"
    }


@router.get(
    "/quotes",
    summary="Lister tous les devis",
    description="Liste tous les devis avec filtres optionnels"
)
async def get_all_quotes(
    status: Optional[str] = Query(None, description="Filter by status"),
    quote_type: Optional[str] = Query(None, description="Filter by type"),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    Récupère tous les devis avec filtres optionnels.
    
    Paramètres:
    - **status**: pending/quoted/approved/rejected/completed
    - **quote_type**: workshop/product/custom
    - **skip**: Offset pour pagination
    - **limit**: Nombre de résultats
    
    Retourne:
    - Liste paginée de devis
    - Compte total et compteurs par statut
    """
    from app.services.quote_service import QuoteService
    
    result = await QuoteService.get_all_quotes(
        db=db,
        status=status,
        quote_type=quote_type,
        skip=skip,
        limit=limit
    )
    
    return result


@router.get(
    "/quotes/my",
    summary="Mes demandes de devis",
    description="Liste les devis de l'utilisateur actuel"
)
async def get_my_quotes(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    Récupère tous les devis de l'utilisateur actuel.
    """
    from app.services.quote_service import QuoteService
    
    result = await QuoteService.get_user_quotes(
        db=db,
        user_id=current_user.id,
        skip=skip,
        limit=limit
    )
    
    return result


@router.get(
    "/quotes/{quote_id}",
    summary="Détails d'un devis",
    description="Récupère les détails complets d'une demande de devis"
)
async def get_quote_details(
    quote_id: UUID,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    Récupère les détails complets d'une demande de devis.
    """
    from app.services.quote_service import QuoteService
    
    quote = await QuoteService.get_quote_by_id(db=db, quote_id=quote_id)
    
    return {
        "id": str(quote.id),
        "user_id": str(quote.user_id),
        "artisan_id": str(quote.artisan_id) if quote.artisan_id else None,
        "quote_type": quote.quote_type,
        "title": quote.title,
        "description": quote.description,
        "quantity": quote.quantity,
        "client_type": quote.client_type,
        "client_name": quote.client_name,
        "client_email": quote.client_email,
        "client_phone": quote.client_phone,
        "company_name": quote.company_name,
        "status": quote.status,
        "estimated_price": float(quote.estimated_price) if quote.estimated_price else None,
        "final_price": float(quote.final_price) if quote.final_price else None,
        "admin_notes": quote.admin_notes,
        "requested_at": quote.requested_at.isoformat(),
        "quoted_at": quote.quoted_at.isoformat() if quote.quoted_at else None,
        "responded_at": quote.responded_at.isoformat() if quote.responded_at else None,
        "completed_at": quote.completed_at.isoformat() if quote.completed_at else None,
    }


@router.patch(
    "/quotes/{quote_id}",
    summary="Mettre à jour un devis",
    description="Admin: Ajouter prix et notes au devis"
)
async def update_quote(
    quote_id: UUID,
    update_data: dict = Body(...),
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    Met à jour un devis avec prix et notes (action admin uniquement).
    
    - **final_price**: Prix final proposé (optionnel)
    - **admin_notes**: Notes administrateur (optionnel)
    - **artisan_id**: ID de l'artisan assigné (optionnel)
    """
    from app.schemas.admin import QuoteUpdateIn
    from app.services.quote_service import QuoteService
    
    update_obj = QuoteUpdateIn(**update_data)
    quote = await QuoteService.update_quote(
        db=db,
        quote_id=quote_id,
        update_data=update_obj
    )
    
    return {
        "id": str(quote.id),
        "status": quote.status,
        "final_price": float(quote.final_price) if quote.final_price else None,
        "message": "Quote updated successfully"
    }


@router.post(
    "/quotes/{quote_id}/approve",
    summary="Approuver un devis",
    description="Client: Approuver un devis avant conversion en commande"
)
async def approve_quote(
    quote_id: UUID,
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    Approuve un devis (action client uniquement).
    Permet ensuite la conversion en commande.
    """
    from app.services.quote_service import QuoteService
    
    quote = await QuoteService.approve_quote(db=db, quote_id=quote_id)
    
    return {
        "id": str(quote.id),
        "status": quote.status,
        "message": "Quote approved successfully"
    }


@router.post(
    "/quotes/{quote_id}/reject",
    summary="Rejeter un devis",
    description="Client: Rejeter un devis"
)
async def reject_quote(
    quote_id: UUID,
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    Rejette un devis (action client uniquement).
    """
    from app.services.quote_service import QuoteService
    
    quote = await QuoteService.reject_quote(db=db, quote_id=quote_id)
    
    return {
        "id": str(quote.id),
        "status": quote.status,
        "message": "Quote rejected"
    }


@router.post(
    "/quotes/{quote_id}/convert-to-order",
    summary="Convertir devis en commande",
    description="Convertir un devis approuvé en commande"
)
async def convert_quote_to_order(
    quote_id: UUID,
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    Convertit un devis approuvé en commande.
    Retourne les données nécessaires pour créer la commande.
    """
    from app.services.quote_service import QuoteService
    
    order_data = await QuoteService.convert_quote_to_order(db=db, quote_id=quote_id)
    
    return {
        **order_data,
        "message": "Quote converted to order successfully"
    }


@router.get(
    "/quotes/stats/overview",
    summary="Statistiques des devis",
    description="Vue d'ensemble des statistiques des demandes de devis"
)
async def get_quote_stats(
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    Récupère les statistiques complètes des devis.
    
    Retourne:
    - Nombre total de devis par statut
    - Taux d'approbation et de conversion
    - Temps moyen de réponse
    - Valeur totale des devis
    """
    from app.services.quote_service import QuoteService
    
    stats = await QuoteService.get_quote_stats(db=db)
    
    return stats


# ===== SUBSCRIPTION ENDPOINTS =====

@router.get(
    "/subscriptions/overview",
    response_model=SubscriptionOverviewResponse,
    summary="Vue d'ensemble des abonnements",
    description="Statistiques globales des abonnements: total, par plan, revenue, churn"
)
async def get_subscriptions_overview(
    perspective: Optional[str] = Query("current", description="current (actifs) ou all"),
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    Récupère une vue d'ensemble des abonnements avec statistiques clés.
    
    Retourne:
    - Total d'abonnements actifs par plan
    - Revenue mensuelle récurrente (MRR)
    - Taux de churn (churned ce mois)
    - Taux de renouvellement
    """
    from app.services.admin_subscription_service import AdminSubscriptionService
    
    overview = await AdminSubscriptionService.get_subscriptions_overview(
        db=db,
        period=perspective
    )
    return overview


@router.get(
    "/subscriptions/list",
    response_model=SubscriptionListResponse,
    summary="Liste des abonnements",
    description="Liste tous les abonnements avec filtres optionnels"
)
async def get_subscriptions_list(
    status: Optional[str] = Query(None, description="Filtre par statut"),
    plan: Optional[str] = Query(None, description="Filtre par plan"),
    user_id: Optional[str] = Query(None, description="Filtre par user_id"),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    Liste tous les abonnements avec pagination et filtres.
    
    Filtres disponibles:
    - status: active/paused/cancelled/expired
    - plan: basic/plus/pro/enterprise
    - user_id: UUID de l'utilisateur
    """
    from app.services.admin_subscription_service import AdminSubscriptionService
    
    result = await AdminSubscriptionService.get_subscriptions_list(
        db=db,
        status=status,
        plan=plan,
        user_id=user_id,
        skip=skip,
        limit=limit
    )
    return result


@router.get(
    "/subscriptions/{subscription_id}",
    response_model=SubscriptionOut,
    summary="Détails d'un abonnement",
    description="Récupère les détails complets d'un abonnement"
)
async def get_subscription_detail(
    subscription_id: str,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    Récupère les détails complets d'un abonnement.
    """
    from app.services.admin_subscription_service import AdminSubscriptionService
    
    subscription = await AdminSubscriptionService.get_subscription_detail(
        db=db,
        subscription_id=subscription_id
    )
    return subscription


@router.post(
    "/subscriptions/{subscription_id}/cancel",
    response_model=SubscriptionOut,
    summary="Annuler un abonnement",
    description="Admin: Annuler un abonnement (geste commercial ou autre raison)"
)
async def cancel_subscription(
    subscription_id: str,
    cancel_request: SubscriptionCancelRequest,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    Annule un abonnement (action admin).
    
    Paramètres:
    - subscription_id: ID de l'abonnement
    - reason: Raison de l'annulation
    """
    from app.services.admin_subscription_service import AdminSubscriptionService
    
    subscription = await AdminSubscriptionService.cancel_subscription(
        db=db,
        subscription_id=subscription_id,
        admin_id=str(current_admin.id),
        reason=cancel_request.reason
    )
    return subscription


@router.post(
    "/subscriptions/{subscription_id}/extend",
    response_model=SubscriptionOut,
    summary="Prolonger un abonnement",
    description="Admin: Prolonger la durée d'un abonnement (geste commercial)"
)
async def extend_subscription(
    subscription_id: str,
    extend_request: SubscriptionExtendRequest,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    Prolonge un abonnement actif ou en pause.
    
    Paramètres:
    - subscription_id: ID de l'abonnement
    - days: Nombre de jours à ajouter (1-365, défaut: 30)
    - notes: Notes admin (optionnel)
    """
    from app.services.admin_subscription_service import AdminSubscriptionService
    
    subscription = await AdminSubscriptionService.extend_subscription(
        db=db,
        subscription_id=subscription_id,
        admin_id=str(current_admin.id),
        days=extend_request.days,
        notes=extend_request.notes
    )
    return subscription


@router.post(
    "/subscriptions/{subscription_id}/add-credits",
    response_model=SubscriptionOut,
    summary="Ajouter des crédits bonus",
    description="Admin: Ajouter des crédits bonus à un abonnement"
)
async def add_bonus_credits(
    subscription_id: str,
    credits_request: SubscriptionAddCreditsRequest,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    Ajoute des crédits bonus à un abonnement.
    
    Paramètres:
    - subscription_id: ID de l'abonnement
    - amount: Montant de crédits à ajouter
    - reason: Raison de l'ajout (support client, promotion, etc.)
    """
    from app.services.admin_subscription_service import AdminSubscriptionService
    
    # Convert amount to Decimal
    amount = Decimal(str(credits_request.amount))
    
    subscription = await AdminSubscriptionService.add_bonus_credits(
        db=db,
        subscription_id=subscription_id,
        admin_id=str(current_admin.id),
        amount=amount,
        reason=credits_request.reason
    )
    return subscription


@router.get(
    "/subscriptions/{subscription_id}/history",
    response_model=SubscriptionHistoryResponse,
    summary="Historique d'un abonnement",
    description="Audit trail complet des modifications d'un abonnement"
)
async def get_subscription_history(
    subscription_id: str,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    Récupère l'historique complet (audit trail) d'un abonnement.
    Affiche toutes les modifications avec qui, quand et pourquoi.
    """
    from app.services.admin_subscription_service import AdminSubscriptionService
    
    history = await AdminSubscriptionService.get_subscription_history(
        db=db,
        subscription_id=subscription_id,
        skip=skip,
        limit=limit
    )
    return history


@router.get(
    "/subscriptions/stats/detailed",
    response_model=SubscriptionStatsResponse,
    summary="Statistiques détaillées", 
    description="Statistiques complètes sur les abonnements"
)
async def get_subscription_stats(
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    Récupère des statistiques détaillées sur les abonnements.
    
    Retourne:
    - Total des abonnements
    - Revenue totale
    - Valeur moyenne d'abonnement
    - Durée de vie moyenne
    - Vue d'ensemble complète
    """
    from app.services.admin_subscription_service import AdminSubscriptionService
    
    stats = await AdminSubscriptionService.get_subscription_stats(db=db)
    return stats


@router.get("/")
async def get_admin_dashboard():
    return {"message": "Admin dashboard"}
 
