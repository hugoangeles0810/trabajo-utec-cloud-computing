from pydantic import BaseModel, Field
from typing import List, TypeVar, Generic, Optional
from enum import Enum


class SortOrder(str, Enum):
    """Sort order enumeration"""
    ASC = "asc"
    DESC = "desc"


class PaginationParams(BaseModel):
    """Pagination parameters"""
    page: int = Field(default=1, ge=1, description="Page number")
    size: int = Field(default=20, ge=1, le=100, description="Page size")
    sort_by: Optional[str] = Field(default=None, description="Field to sort by")
    sort_order: SortOrder = Field(default=SortOrder.ASC, description="Sort order")


T = TypeVar('T')


class PaginatedResponse(BaseModel, Generic[T]):
    """Paginated response wrapper"""
    items: List[T]
    total: int
    page: int
    size: int
    pages: int
    has_next: bool
    has_prev: bool


class ErrorResponse(BaseModel):
    """Error response schema"""
    error: str
    message: str
    details: Optional[dict] = None


class SuccessResponse(BaseModel):
    """Success response schema"""
    success: bool = True
    message: str
    data: Optional[dict] = None
