from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Generator
from ..database import get_db
from ..services import ProductService, VendorService, CategoryService


def get_product_service() -> ProductService:
    """Get product service instance"""
    return ProductService()


def get_vendor_service() -> VendorService:
    """Get vendor service instance"""
    return VendorService()


def get_category_service() -> CategoryService:
    """Get category service instance"""
    return CategoryService()


def get_current_user_id() -> int:
    """
    Get current user ID from JWT token
    This is a placeholder - implement JWT validation here
    """
    # TODO: Implement JWT token validation
    # For now, return a mock user ID
    return 1


def get_current_vendor_id() -> int:
    """
    Get current vendor ID from JWT token
    This is a placeholder - implement JWT validation here
    """
    # TODO: Implement JWT token validation
    # For now, return a mock vendor ID
    return 1


def verify_vendor_access(
    vendor_id: int,
    current_vendor_id: int = Depends(get_current_vendor_id)
) -> int:
    """
    Verify that the current user has access to the vendor
    """
    if vendor_id != current_vendor_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to access this vendor"
        )
    return vendor_id


def verify_product_access(
    product_id: int,
    db: Session = Depends(get_db),
    product_service: ProductService = Depends(get_product_service),
    current_vendor_id: int = Depends(get_current_vendor_id)
) -> int:
    """
    Verify that the current user has access to the product
    """
    product = product_service.get(db, product_id)
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    
    if product.vendor_id != current_vendor_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to access this product"
        )
    
    return product_id
