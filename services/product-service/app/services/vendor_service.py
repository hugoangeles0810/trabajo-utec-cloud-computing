from sqlalchemy.orm import Session
from typing import List, Optional
from app.models.vendor import Vendor
from app.schemas.vendor import VendorCreate, VendorUpdate

class VendorService:
    def __init__(self, db: Session):
        self.db = db

    def get_vendors(self) -> List[Vendor]:
        return self.db.query(Vendor).all()

    def get_vendor(self, vendor_id: int) -> Optional[Vendor]:
        return self.db.query(Vendor).filter(Vendor.id == vendor_id).first()

    def create_vendor(self, vendor: VendorCreate) -> Vendor:
        db_vendor = Vendor(**vendor.dict())
        self.db.add(db_vendor)
        self.db.commit()
        self.db.refresh(db_vendor)
        return db_vendor

    def update_vendor(self, vendor_id: int, vendor: VendorUpdate) -> Optional[Vendor]:
        db_vendor = self.get_vendor(vendor_id)
        if not db_vendor:
            return None
            
        update_data = vendor.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_vendor, field, value)
            
        self.db.commit()
        self.db.refresh(db_vendor)
        return db_vendor

    def delete_vendor(self, vendor_id: int) -> bool:
        db_vendor = self.get_vendor(vendor_id)
        if not db_vendor:
            return False
            
        self.db.delete(db_vendor)
        self.db.commit()
        return True