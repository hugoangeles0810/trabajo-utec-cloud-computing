from typing import TypeVar, Generic, Type, Optional, List, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, func
from pydantic import BaseModel
from ..database import Base
from ..schemas.common import PaginationParams, PaginatedResponse
import math

ModelType = TypeVar("ModelType", bound=Base)
CreateSchemaType = TypeVar("CreateSchemaType", bound=BaseModel)
UpdateSchemaType = TypeVar("UpdateSchemaType", bound=BaseModel)


class BaseService(Generic[ModelType, CreateSchemaType, UpdateSchemaType]):
    """Base service class with common CRUD operations"""
    
    def __init__(self, model: Type[ModelType]):
        self.model = model
    
    def get(self, db: Session, id: int) -> Optional[ModelType]:
        """Get a single record by ID"""
        return db.query(self.model).filter(self.model.id == id).first()
    
    def get_multi(
        self, 
        db: Session, 
        skip: int = 0, 
        limit: int = 100,
        filters: Optional[Dict[str, Any]] = None,
        search: Optional[str] = None,
        search_fields: Optional[List[str]] = None
    ) -> List[ModelType]:
        """Get multiple records with pagination and filtering"""
        query = db.query(self.model)
        
        # Apply filters
        if filters:
            for field, value in filters.items():
                if hasattr(self.model, field) and value is not None:
                    if isinstance(value, list):
                        query = query.filter(getattr(self.model, field).in_(value))
                    else:
                        query = query.filter(getattr(self.model, field) == value)
        
        # Apply search
        if search and search_fields:
            search_conditions = []
            for field in search_fields:
                if hasattr(self.model, field):
                    search_conditions.append(
                        getattr(self.model, field).ilike(f"%{search}%")
                    )
            if search_conditions:
                query = query.filter(or_(*search_conditions))
        
        return query.offset(skip).limit(limit).all()
    
    def get_paginated(
        self,
        db: Session,
        pagination: PaginationParams,
        filters: Optional[Dict[str, Any]] = None,
        search: Optional[str] = None,
        search_fields: Optional[List[str]] = None
    ) -> PaginatedResponse[ModelType]:
        """Get paginated results"""
        # Count total records
        count_query = db.query(self.model)
        
        if filters:
            for field, value in filters.items():
                if hasattr(self.model, field) and value is not None:
                    if isinstance(value, list):
                        count_query = count_query.filter(getattr(self.model, field).in_(value))
                    else:
                        count_query = count_query.filter(getattr(self.model, field) == value)
        
        if search and search_fields:
            search_conditions = []
            for field in search_fields:
                if hasattr(self.model, field):
                    search_conditions.append(
                        getattr(self.model, field).ilike(f"%{search}%")
                    )
            if search_conditions:
                count_query = count_query.filter(or_(*search_conditions))
        
        total = count_query.count()
        
        # Get paginated results
        skip = (pagination.page - 1) * pagination.size
        items = self.get_multi(
            db=db,
            skip=skip,
            limit=pagination.size,
            filters=filters,
            search=search,
            search_fields=search_fields
        )
        
        # Calculate pagination info
        pages = math.ceil(total / pagination.size) if total > 0 else 1
        has_next = pagination.page < pages
        has_prev = pagination.page > 1
        
        return PaginatedResponse(
            items=items,
            total=total,
            page=pagination.page,
            size=pagination.size,
            pages=pages,
            has_next=has_next,
            has_prev=has_prev
        )
    
    def create(self, db: Session, obj_in: CreateSchemaType) -> ModelType:
        """Create a new record"""
        obj_data = obj_in.dict() if hasattr(obj_in, 'dict') else obj_in
        db_obj = self.model(**obj_data)
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj
    
    def update(
        self, 
        db: Session, 
        db_obj: ModelType, 
        obj_in: UpdateSchemaType
    ) -> ModelType:
        """Update an existing record"""
        obj_data = obj_in.dict(exclude_unset=True) if hasattr(obj_in, 'dict') else obj_in
        
        for field, value in obj_data.items():
            if hasattr(db_obj, field):
                setattr(db_obj, field, value)
        
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj
    
    def delete(self, db: Session, id: int) -> Optional[ModelType]:
        """Delete a record by ID"""
        obj = db.query(self.model).filter(self.model.id == id).first()
        if obj:
            db.delete(obj)
            db.commit()
        return obj
    
    def exists(self, db: Session, id: int) -> bool:
        """Check if a record exists by ID"""
        return db.query(self.model).filter(self.model.id == id).first() is not None
