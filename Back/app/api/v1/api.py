from fastapi import APIRouter
from app.api.v1.endpoints import (
    auth, products, users, workshops, carts, orders, analytics,
    unavailabilities, reviews, admin
)

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["authentication"])
api_router.include_router(products.router, prefix="/products", tags=["products"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(carts.router, prefix="/carts", tags=["carts"])
api_router.include_router(orders.router, prefix="/orders", tags=["orders"])
api_router.include_router(
    analytics.router, prefix="/analytics", tags=["analytics"]
)
api_router.include_router(
    unavailabilities.router,
    prefix="/unavailabilities",
    tags=["unavailabilities"],
)
api_router.include_router(
    reviews.router, prefix="/reviews", tags=["reviews"]
)
api_router.include_router(workshops.router)
api_router.include_router(admin.router, prefix="/admin", tags=["admin"])

