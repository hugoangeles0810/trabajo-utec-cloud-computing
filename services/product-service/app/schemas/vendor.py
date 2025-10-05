from pydantic import BaseModel, Field, EmailStr
from typing import Optional
from datetime import datetime

class VendorBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    email: EmailStr
    phone: Optional[str] = Field(None, max_length=50)
    address: Optional[str] = None
    description: Optional[str] = None
    is_active: bool = True
    is_verified: bool = False

class VendorCreate(VendorBase):
    pass

class VendorUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    email: Optional[EmailStr] = None
    phone: Optional[str] = Field(None, max_length=50)
    address: Optional[str] = None
    description: Optional[str] = None
    is_active: Optional[bool] = None
    is_verified: Optional[bool] = None

class VendorResponse(VendorBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True