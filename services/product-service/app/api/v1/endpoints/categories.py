from fastapi import APIRouter, Depends, HTTPException
from typing import List
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.category import CategoryCreate, CategoryUpdate, CategoryResponse
from app.services.category_service import CategoryService

router = APIRouter()

@router.get("/", response_model=List[CategoryResponse])
async def get_categories(db: Session = Depends(get_db)):
    """Get all categories"""
    service = CategoryService(db)
    return service.get_categories()

@router.get("/{category_id}", response_model=CategoryResponse)
async def get_category(category_id: int, db: Session = Depends(get_db)):
    """Get a specific category by ID"""
    service = CategoryService(db)
    category = service.get_category(category_id)
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    return category

@router.post("/", response_model=CategoryResponse)
async def create_category(category: CategoryCreate, db: Session = Depends(get_db)):
    """Create a new category"""
    service = CategoryService(db)
    return service.create_category(category)

@router.put("/{category_id}", response_model=CategoryResponse)
async def update_category(
    category_id: int,
    category: CategoryUpdate,
    db: Session = Depends(get_db)
):
    """Update an existing category"""
    service = CategoryService(db)
    updated_category = service.update_category(category_id, category)
    if not updated_category:
        raise HTTPException(status_code=404, detail="Category not found")
    return updated_category

@router.delete("/{category_id}")
async def delete_category(category_id: int, db: Session = Depends(get_db)):
    """Delete a category"""
    service = CategoryService(db)
    success = service.delete_category(category_id)
    if not success:
        raise HTTPException(status_code=404, detail="Category not found")
    return {"message": "Category deleted successfully"}