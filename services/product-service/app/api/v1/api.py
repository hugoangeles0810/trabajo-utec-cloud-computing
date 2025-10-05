from fastapi import APIRouter
from .endpoints import products, categories, vendors

api_router = APIRouter()

# Include endpoint routers
api_router.include_router(products.router, prefix="/products", tags=["products"])
api_router.include_router(categories.router, prefix="/categories", tags=["categories"])
api_router.include_router(vendors.router, prefix="/vendors", tags=["vendors"])