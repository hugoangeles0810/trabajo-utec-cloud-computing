from sqlalchemy.orm import Session
from typing import List, Optional
from app.models.product import Product
from app.schemas.product import ProductCreate, ProductUpdate

class ProductService:
    def __init__(self, db: Session):
        self.db = db

    def get_products(
        self,
        skip: int = 0,
        limit: int = 100,
        category_id: Optional[int] = None,
        vendor_id: Optional[int] = None,
        status: Optional[str] = None
    ) -> List[Product]:
        query = self.db.query(Product)
        
        if category_id:
            query = query.filter(Product.category_id == category_id)
        if vendor_id:
            query = query.filter(Product.vendor_id == vendor_id)
        if status:
            query = query.filter(Product.status == status)
            
        return query.offset(skip).limit(limit).all()

    def get_product(self, product_id: int) -> Optional[Product]:
        return self.db.query(Product).filter(Product.id == product_id).first()

    def create_product(self, product: ProductCreate) -> Product:
        db_product = Product(**product.dict())
        self.db.add(db_product)
        self.db.commit()
        self.db.refresh(db_product)
        return db_product

    def update_product(self, product_id: int, product: ProductUpdate) -> Optional[Product]:
        db_product = self.get_product(product_id)
        if not db_product:
            return None
            
        update_data = product.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_product, field, value)
            
        self.db.commit()
        self.db.refresh(db_product)
        return db_product

    def delete_product(self, product_id: int) -> bool:
        db_product = self.get_product(product_id)
        if not db_product:
            return False
            
        self.db.delete(db_product)
        self.db.commit()
        return True