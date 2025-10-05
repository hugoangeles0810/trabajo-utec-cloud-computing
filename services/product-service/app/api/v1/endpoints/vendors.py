from fastapi import APIRouter, Depends, HTTPException
from typing import List
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.vendor import VendorCreate, VendorUpdate, VendorResponse
from app.services.vendor_service import VendorService

router = APIRouter()

@router.get("/", response_model=List[VendorResponse])
async def get_vendors(db: Session = Depends(get_db)):
    """Get all vendors"""
    service = VendorService(db)
    return service.get_vendors()

@router.get("/{vendor_id}", response_model=VendorResponse)
async def get_vendor(vendor_id: int, db: Session = Depends(get_db)):
    """Get a specific vendor by ID"""
    service = VendorService(db)
    vendor = service.get_vendor(vendor_id)
    if not vendor:
        raise HTTPException(status_code=404, detail="Vendor not found")
    return vendor

@router.post("/", response_model=VendorResponse)
async def create_vendor(vendor: VendorCreate, db: Session = Depends(get_db)):
    """Create a new vendor"""
    service = VendorService(db)
    return service.create_vendor(vendor)

@router.put("/{vendor_id}", response_model=VendorResponse)
async def update_vendor(
    vendor_id: int,
    vendor: VendorUpdate,
    db: Session = Depends(get_db)
):
    """Update an existing vendor"""
    service = VendorService(db)
    updated_vendor = service.update_vendor(vendor_id, vendor)
    if not updated_vendor:
        raise HTTPException(status_code=404, detail="Vendor not found")
    return updated_vendor

@router.delete("/{vendor_id}")
async def delete_vendor(vendor_id: int, db: Session = Depends(get_db)):
    """Delete a vendor"""
    service = VendorService(db)
    success = service.delete_vendor(vendor_id)
    if not success:
        raise HTTPException(status_code=404, detail="Vendor not found")
    return {"message": "Vendor deleted successfully"}