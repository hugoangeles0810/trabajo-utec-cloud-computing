from sqlalchemy.orm import Session
from typing import List, Optional
from app.models.category import Category
from app.schemas.category import CategoryCreate, CategoryUpdate

class CategoryService:
    def __init__(self, db: Session):
        self.db = db

    def get_categories(self) -> List[Category]:
        return self.db.query(Category).all()

    def get_category(self, category_id: int) -> Optional[Category]:
        return self.db.query(Category).filter(Category.id == category_id).first()

    def create_category(self, category: CategoryCreate) -> Category:
        db_category = Category(**category.dict())
        self.db.add(db_category)
        self.db.commit()
        self.db.refresh(db_category)
        return db_category

    def update_category(self, category_id: int, category: CategoryUpdate) -> Optional[Category]:
        db_category = self.get_category(category_id)
        if not db_category:
            return None
            
        update_data = category.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_category, field, value)
            
        self.db.commit()
        self.db.refresh(db_category)
        return db_category

    def delete_category(self, category_id: int) -> bool:
        db_category = self.get_category(category_id)
        if not db_category:
            return False
            
        self.db.delete(db_category)
        self.db.commit()
        return True