from fastapi import APIRouter
from app.api.v1.endpoints import auth

# Temporarily disable other endpoints to avoid loading models with circular dependencies
# These will be enabled when all relationships are properly configured
# from app.api.v1.endpoints import (
#     users,
#     products,
#     categories,
#     orders,
#     carts,
#     workshops,
#     reviews,
#     payments,
#     notifications,
#     messages,
#     analytics,
#     admin
# )

api_router = APIRouter()

# Include only auth router for now
api_router.include_router(auth.router, prefix="/auth", tags=["authentication"])

# Temporarily disabled - will be enabled when models are properly configured
# api_router.include_router(users.router, prefix="/users", tags=["users"])
# api_router.include_router(products.router, prefix="/products", tags=["products"])
# api_router.include_router(categories.router, prefix="/categories", tags=["categories"])
# api_router.include_router(orders.router, prefix="/orders", tags=["orders"])
# api_router.include_router(carts.router, prefix="/carts", tags=["carts"])
# api_router.include_router(workshops.router, prefix="/workshops", tags=["workshops"])
# api_router.include_router(reviews.router, prefix="/reviews", tags=["reviews"])
# api_router.include_router(payments.router, prefix="/payments", tags=["payments"])
# api_router.include_router(notifications.router, prefix="/notifications", tags=["notifications"])
# api_router.include_router(messages.router, prefix="/messages", tags=["messages"])
# api_router.include_router(analytics.router, prefix="/analytics", tags=["analytics"])
# api_router.include_router(admin.router, prefix="/admin", tags=["admin"]) 