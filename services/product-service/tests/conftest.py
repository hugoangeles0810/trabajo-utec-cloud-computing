import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.main import app
from app.database import get_db, Base
from app.config import settings

# Create test database
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()


@pytest.fixture(scope="session")
def db_engine():
    """Create test database engine"""
    Base.metadata.create_all(bind=engine)
    yield engine
    Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def db_session(db_engine):
    """Create test database session"""
    connection = db_engine.connect()
    transaction = connection.begin()
    session = TestingSessionLocal(bind=connection)
    
    yield session
    
    session.close()
    transaction.rollback()
    connection.close()


@pytest.fixture(scope="function")
def client(db_session):
    """Create test client"""
    app.dependency_overrides[get_db] = lambda: db_session
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture
def sample_vendor_data():
    """Sample vendor data for testing"""
    return {
        "name": "Test Vendor",
        "email": "test@vendor.com",
        "phone": "+1234567890",
        "description": "A test vendor",
        "business_name": "Test Business",
        "business_type": "retail",
        "address_line1": "123 Test St",
        "city": "Test City",
        "state": "Test State",
        "postal_code": "12345",
        "country": "Test Country"
    }


@pytest.fixture
def sample_category_data():
    """Sample category data for testing"""
    return {
        "name": "Test Category",
        "slug": "test-category",
        "description": "A test category",
        "sort_order": 1
    }


@pytest.fixture
def sample_product_data():
    """Sample product data for testing"""
    return {
        "name": "Test Product",
        "slug": "test-product",
        "description": "A test product",
        "short_description": "Test product short desc",
        "sku": "TEST-001",
        "product_type": "simple",
        "status": "draft",
        "price": 99.99,
        "compare_at_price": 129.99,
        "track_inventory": True,
        "inventory_quantity": 10,
        "low_stock_threshold": 5
    }
