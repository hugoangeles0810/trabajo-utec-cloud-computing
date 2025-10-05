from sqlalchemy import Column, Integer, String, Text, Float, Boolean, ForeignKey, JSON, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .base import Base

class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, index=True)
    slug = Column(String(255), unique=True, nullable=False, index=True)
    description = Column(Text)
    price = Column(Float, nullable=False)
    stock = Column(Integer, default=0)
    status = Column(String(50), default="draft")  # draft, active, inactive, out_of_stock
    vendor_id = Column(Integer, ForeignKey("vendors.id"), nullable=False)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=False)
    images = Column(JSON)  # Array of image URLs
    tags = Column(JSON)  # Array of tags
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    vendor = relationship("Vendor", back_populates="products")
    category = relationship("Category", back_populates="products")