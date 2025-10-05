from sqlalchemy import create_engine, MetaData
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool, QueuePool
import os
from .config import settings

# Database URL configuration
DATABASE_URL = settings.database_url

# Create engine
if DATABASE_URL.startswith("sqlite"):
    # For local development with SQLite
    engine = create_engine(
        DATABASE_URL,
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
elif os.getenv("AWS_LAMBDA_FUNCTION_NAME"):
    # For AWS Lambda with PostgreSQL
    engine = create_engine(
        DATABASE_URL,
        pool_pre_ping=True,
        pool_recycle=300,
        pool_size=1,  # Minimal pool for Lambda
        max_overflow=0,  # No overflow in Lambda
        poolclass=QueuePool,
        connect_args={
            "connect_timeout": 10,
            "application_name": "gamarriando-product-service"
        }
    )
else:
    # For local development with PostgreSQL
    engine = create_engine(
        DATABASE_URL,
        pool_pre_ping=True,
        pool_recycle=300,
        pool_size=10,
        max_overflow=20,
    )

# Create SessionLocal class
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create Base class
Base = declarative_base()

# Metadata for migrations
metadata = MetaData()


def get_db():
    """
    Dependency to get database session
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def create_tables():
    """
    Create all tables in the database
    """
    Base.metadata.create_all(bind=engine)


def drop_tables():
    """
    Drop all tables in the database
    """
    Base.metadata.drop_all(bind=engine)