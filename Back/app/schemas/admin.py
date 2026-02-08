from pydantic import BaseModel, Field, field_validator
from datetime import datetime
from typing import Optional, List, Dict, Any
from uuid import UUID
from enum import Enum


class ValidationType(str, Enum):
    """Type de validation"""
    PROFILE = "profile"
    PRODUCT = "product"
    WORKSHOP = "workshop"
    ALL = "all"


class ValidationStatus(str, Enum):
    """Statut de validation"""
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"


class ValidationAction(str, Enum):
    """Actions de validation"""
    APPROVE = "approve"
    REJECT = "reject"


# ===== Validation Request/Response Schemas =====

class ValidationRequest(BaseModel):
    """Requête de validation (approve/reject)"""
    action: ValidationAction
    notes: Optional[str] = Field(None, description="Notes de l'administrateur")


class ValidationHistoryOut(BaseModel):
    """Historique de validation"""
    id: UUID
    artisan_id: UUID
    validation_type: str
    entity_id: Optional[UUID]
    status: str
    validated_by: Optional[UUID]
    validation_notes: Optional[str]
    validated_at: Optional[datetime]
    created_at: datetime
    
    class Config:
        from_attributes = True


class PendingValidationItem(BaseModel):
    """Item en attente de validation"""
    id: UUID
    type: ValidationType
    entity_id: Optional[UUID]
    artisan_id: UUID
    artisan_name: str
    artisan_email: str
    title: str
    description: Optional[str]
    status: str
    created_at: datetime
    
    # Détails spécifiques selon le type
    details: Optional[Dict[str, Any]] = None
    
    class Config:
        from_attributes = True


class PendingValidationsResponse(BaseModel):
    """Response liste des validations en attente"""
    total: int
    items: List[PendingValidationItem]
    count_by_type: Dict[str, int]


class ValidationStatsOut(BaseModel):
    """Statistiques de validation"""
    period: str
    total_validations: int
    approved_count: int
    rejected_count: int
    pending_count: int
    approval_rate: float
    average_response_time_hours: Optional[float]
    by_type: Dict[str, Dict[str, int]]
    
    class Config:
        from_attributes = True


# ===== Artisan Profile Validation Schemas =====

class ArtisanProfileValidationOut(BaseModel):
    """Détails profil artisan pour validation"""
    user_id: UUID
    email: str
    name: str
    phone: Optional[str]
    company_name: str
    main_specialty: str
    other_skills: Optional[List[str]]
    years_experience: Optional[str]
    activity_description: str
    region: Optional[str]
    languages: Optional[List[str]]
    status: str
    admin_notes: Optional[str]
    created_at: datetime
    
    # Approval fields
    approved_by: Optional[UUID]
    approved_at: Optional[datetime]
    approval_notes: Optional[str]
    
    class Config:
        from_attributes = True


# ===== Product Validation Schemas =====

class ProductValidationOut(BaseModel):
    """Détails produit pour validation"""
    id: UUID
    title: str
    slug: str
    description: str
    price: float
    artisan_id: UUID
    artisan_name: Optional[str]
    category_id: UUID
    status: str
    images: Optional[List[str]] = []
    created_at: datetime
    
    # Approval fields
    approved_by: Optional[UUID]
    approved_at: Optional[datetime]
    approval_notes: Optional[str]
    
    class Config:
        from_attributes = True


# ===== Workshop Validation Schemas =====

class WorkshopValidationOut(BaseModel):
    """Détails atelier pour validation"""
    id: UUID
    title: str
    slug: str
    description: str
    artisan_id: UUID
    artisan_name: Optional[str]
    base_price: float
    duration_minutes: int
    max_participants: int
    location_type: str
    status: str
    featured_image_url: Optional[str]
    created_at: datetime
    
    # Approval fields
    approved_by: Optional[UUID]
    approved_at: Optional[datetime]
    approval_notes: Optional[str]
    
    class Config:
        from_attributes = True


# ===== Analytics Schemas =====

class UsersByRole(BaseModel):
    """Users grouped by role"""
    buyers: int
    artisans: int
    admins: int


class EntityStats(BaseModel):
    """Generic entity statistics"""
    active: int
    pending: int
    total: int


class PublishedPendingStats(BaseModel):
    """Statistics for published vs pending entities"""
    published: int
    pending: int
    total: int


class PlatformOverviewOut(BaseModel):
    """Vue d'ensemble de la plateforme"""
    total_users: int
    users_by_role: UsersByRole
    total_artisans: EntityStats
    total_products: PublishedPendingStats
    total_workshops: PublishedPendingStats
    total_orders: int
    total_bookings: int
    pending_validations: int
    
    class Config:
        from_attributes = True


class DailyRevenueBreakdown(BaseModel):
    """Daily revenue breakdown"""
    date: str
    revenue: float
    orders_revenue: float
    workshops_revenue: float


class RevenueStatsOut(BaseModel):
    """Statistiques de revenus"""
    total_revenue: float
    product_sales: float
    workshop_sales: float
    commission_artizaho: float
    commission_rate: float
    period: str
    start_date: Optional[str]
    end_date: Optional[str]
    revenue_by_category: List[Dict[str, Any]]
    daily_breakdown: List[DailyRevenueBreakdown]
    
    class Config:
        from_attributes = True


class SpecialtyStats(BaseModel):
    """Artisan specialty statistics"""
    specialty: str
    count: int


class RegionStats(BaseModel):
    """Region statistics"""
    region: str
    count: int


class TopPerformer(BaseModel):
    """Top performing artisan"""
    artisan_id: str
    artisan_name: str
    total_revenue: float
    email: str


class ArtisanStatsOut(BaseModel):
    """Statistiques artisans"""
    total_artisans: int
    active_artisans: int
    pending_approval: int
    by_specialty: List[SpecialtyStats]
    by_region: List[RegionStats]
    new_this_month: int
    top_performers: List[TopPerformer]
    
    class Config:
        from_attributes = True


class ConversionStatsOut(BaseModel):
    """Taux de conversion"""
    product_view_to_sale_rate: float
    workshop_to_booking_rate: float
    visitor_to_buyer_conversion: float
    products_with_sales: int
    products_with_views: int
    workshops_with_bookings: int
    users_with_orders: int
    
    class Config:
        from_attributes = True


class UserBehaviorStatsOut(BaseModel):
    """Statistiques comportement utilisateurs"""
    avg_order_value: float
    avg_cart_size: float
    repeat_customers_rate: float
    total_customers: int
    repeat_customers: int
    payment_method_stats: Dict[str, int]
    
    class Config:
        from_attributes = True


# ===== Payment Tracking Schemas =====

class PaymentStatus(str, Enum):
    """Statut de paiement"""
    UNPAID = "unpaid"
    PARTIAL = "partial"
    PAID = "paid"
    PENDING_COLLECTION = "pending_collection"


class PaymentMethod(str, Enum):
    """Méthode de paiement"""
    CASH = "cash"
    MVOLA = "mvola"
    ORANGE_MONEY = "orange_money"
    BANK_TRANSFER = "bank_transfer"


class PaymentType(str, Enum):
    """Type de paiement"""
    PRODUCT = "product"
    WORKSHOP = "workshop"


class ArtisanType(str, Enum):
    """Type d'artisan"""
    ARTIZAHO = "artizaho"
    UBER = "uber"


class PaymentOut(BaseModel):
    """Détails d'un paiement"""
    id: UUID
    order_id: Optional[UUID]
    booking_id: Optional[UUID]
    user_id: UUID
    artisan_id: UUID
    type: str
    amount_total: float
    amount_paid: float
    payment_status: str
    payment_method: Optional[str]
    artisan_type: str
    created_at: datetime
    updated_at: datetime
    
    # Informations relationnelles (optionnelles)
    user_name: Optional[str] = None
    artisan_name: Optional[str] = None
    order_number: Optional[str] = None
    booking_number: Optional[str] = None
    
    class Config:
        from_attributes = True


class PaymentHistoryOut(BaseModel):
    """Historique d'un paiement"""
    id: UUID
    payment_id: UUID
    amount: float
    payment_method: str
    transaction_ref: Optional[str]
    notes: Optional[str]
    paid_at: datetime
    recorded_by: Optional[UUID]
    created_at: datetime
    
    # Informations relationnelles (optionnelles)
    recorder_name: Optional[str] = None
    
    class Config:
        from_attributes = True


class RecordPaymentRequest(BaseModel):
    """Requête d'enregistrement de paiement"""
    amount: float = Field(..., gt=0, description="Montant du paiement")
    payment_method: PaymentMethod
    transaction_ref: Optional[str] = Field(None, max_length=100, description="Référence de transaction")
    notes: Optional[str] = Field(None, description="Notes sur le paiement")


class PaymentListResponse(BaseModel):
    """Liste de paiements"""
    total: int
    items: List[PaymentOut]
    total_amount: float
    total_paid: float
    total_outstanding: float


class ArtisanPayoutStatus(str, Enum):
    """Statut de paiement artisan"""
    PENDING = "pending"
    PROCESSING = "processing"
    PAID = "paid"


class ArtisanPayoutOut(BaseModel):
    """Détails d'un payout artisan"""
    id: UUID
    artisan_id: UUID
    period_start: datetime
    period_end: datetime
    total_sales: float
    commission_rate: float
    commission_amount: float
    net_payout: float
    status: str
    payment_method: Optional[str]
    payment_ref: Optional[str]
    paid_at: Optional[datetime]
    notes: Optional[str]
    created_at: datetime
    updated_at: datetime
    
    # Informations relationnelles
    artisan_name: Optional[str] = None
    artisan_email: Optional[str] = None
    
    class Config:
        from_attributes = True


class GeneratePayoutRequest(BaseModel):
    """Requête de génération de payout"""
    artisan_id: UUID
    period_start: datetime
    period_end: datetime


class MarkPayoutPaidRequest(BaseModel):
    """Requête de marquage payout comme payé"""
    payment_method: PaymentMethod
    payment_ref: Optional[str] = Field(None, max_length=100)
    notes: Optional[str] = None


class PayoutListResponse(BaseModel):
    """Liste de payouts"""
    total: int
    items: List[ArtisanPayoutOut]
    total_net_payout: float
    total_commission: float


class CommissionCalculation(BaseModel):
    """Calcul de commission"""
    sale_amount: float
    commission_rate: float
    commission_amount: float
    net_to_artisan: float
    artisan_type: str


# ===== Quote Manager Schemas =====

class QuoteStatus(str, Enum):
    """Statut d'une demande de devis"""
    PENDING = "pending"
    QUOTED = "quoted"
    APPROVED = "approved"
    REJECTED = "rejected"
    COMPLETED = "completed"


class QuoteType(str, Enum):
    """Type de devis"""
    WORKSHOP = "workshop"
    PRODUCT = "product"
    CUSTOM = "custom"


class ClientType(str, Enum):
    """Type de client"""
    PARTICULIER = "particulier"
    ENTREPRISE = "entreprise"


class QuoteRequestIn(BaseModel):
    """Requête de création de devis"""
    quote_type: QuoteType
    title: str = Field(..., min_length=3, max_length=255)
    description: str = Field(..., min_length=10)
    quantity: int = Field(1, ge=1, le=1000)
    client_type: ClientType
    client_name: str = Field(..., min_length=2, max_length=255)
    client_email: str = Field(..., description="Email du client")
    client_phone: str = Field(..., min_length=7, max_length=20)
    company_name: Optional[str] = Field(None, max_length=255)
    
    @field_validator("client_email")
    @classmethod
    def validate_email(cls, v):
        if "@" not in v:
            raise ValueError("Email invalide")
        return v.lower()


class QuoteOut(BaseModel):
    """Réponse devis"""
    id: UUID
    user_id: UUID
    artisan_id: Optional[UUID]
    quote_type: QuoteType
    title: str
    description: str
    quantity: int
    client_type: ClientType
    client_name: str
    client_email: str
    client_phone: str
    company_name: Optional[str]
    status: QuoteStatus
    estimated_price: Optional[float]
    final_price: Optional[float]
    admin_notes: Optional[str]
    requested_at: datetime
    quoted_at: Optional[datetime]
    responded_at: Optional[datetime]
    completed_at: Optional[datetime]
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class QuoteUpdateIn(BaseModel):
    """Requête de mise à jour de devis (admin)"""
    final_price: Optional[float] = Field(None, ge=0)
    admin_notes: Optional[str] = None
    artisan_id: Optional[UUID] = None


class QuoteApprovalIn(BaseModel):
    """Requête d'approbation de devis (client)"""
    approved: bool


class QuoteListResponse(BaseModel):
    """Liste de devis"""
    total: int
    items: List[QuoteOut]
    pending_count: int
    quoted_count: int


class QuoteStatusUpdate(BaseModel):
    """Mise à jour de statut de devis"""
    status: QuoteStatus
    notes: Optional[str] = None

