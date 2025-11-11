# Import all models to ensure they are registered with SQLAlchemy
from app.models.base import BaseModel
from app.models.user import User, ArtisanProfile, ArtisanPhoto, UserSession, SocialAccount

# Temporarily disable imports to avoid circular dependency issues
# These will be enabled when all relationships are properly configured
# try:
#     from app.models.order import Cart, CartItem, Order, OrderItem, Payment, OrderStatusHistory
# except ImportError:
#     pass

# Import other models (optional, for Alembic autogenerate)
try:
    from app.models.product import Product, ProductVariant, ProductImage, Category
except ImportError:
    pass

try:
    from app.models.workshop import Workshop, WorkshopSession, WorkshopBooking
except ImportError:
    pass

try:
    from app.models.review import Review
except ImportError:
    pass

try:
    from app.models.notification import Notification
except ImportError:
    pass

try:
    from app.models.analytics import AnalyticsEvent, PageView, UserActivity
except ImportError:
    pass

__all__ = [
    "BaseModel",
    "User",
    "ArtisanProfile",
    "ArtisanPhoto",
    "UserSession",
    "SocialAccount",
]
