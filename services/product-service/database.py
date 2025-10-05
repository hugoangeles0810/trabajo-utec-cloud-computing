"""
Database configuration for Gamarriando Product Service
Optimized for AWS Lambda with RDS Aurora PostgreSQL
"""

import os
import logging
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.pool import QueuePool
from contextlib import contextmanager
from typing import Generator

logger = logging.getLogger(__name__)

# Database configuration
DATABASE_URL = os.getenv('DATABASE_URL')
DB_HOST = os.getenv('DB_HOST', 'localhost')
DB_PORT = os.getenv('DB_PORT', '5432')
DB_NAME = os.getenv('DB_NAME', 'gamarriando')
DB_USER = os.getenv('DB_USER', 'gamarriando')
DB_PASSWORD = os.getenv('DB_PASSWORD', 'gamarriando123')

# Connection pool configuration for Lambda
DB_POOL_SIZE = int(os.getenv('DB_POOL_SIZE', '5'))
DB_MAX_OVERFLOW = int(os.getenv('DB_MAX_OVERFLOW', '10'))
DB_POOL_RECYCLE = int(os.getenv('DB_POOL_RECYCLE', '3600'))  # 1 hour
DB_POOL_TIMEOUT = int(os.getenv('DB_POOL_TIMEOUT', '30'))

# Build database URL if not provided
if not DATABASE_URL:
    DATABASE_URL = f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

# Create engine with Lambda-optimized settings
def create_database_engine():
    """Create SQLAlchemy engine optimized for AWS Lambda"""
    
    # Connection arguments for Lambda
    connect_args = {
        "connect_timeout": 10,
        "application_name": "gamarriando-product-service",
        "options": "-c statement_timeout=30000"  # 30 seconds
    }
    
    # Engine configuration for Lambda
    engine = create_engine(
        DATABASE_URL,
        poolclass=QueuePool,
        pool_size=DB_POOL_SIZE,
        max_overflow=DB_MAX_OVERFLOW,
        pool_recycle=DB_POOL_RECYCLE,
        pool_pre_ping=True,
        pool_timeout=DB_POOL_TIMEOUT,
        connect_args=connect_args,
        echo=os.getenv('DEBUG', 'false').lower() == 'true'
    )
    
    return engine

# Global engine instance (reused across Lambda invocations)
engine = create_database_engine()

# Session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@contextmanager
def get_db() -> Generator[Session, None, None]:
    """
    Database session context manager for Lambda functions
    Ensures proper session cleanup
    """
    session = SessionLocal()
    try:
        yield session
        session.commit()
    except Exception as e:
        session.rollback()
        logger.error(f"Database session error: {str(e)}")
        raise
    finally:
        session.close()

def get_db_session() -> Session:
    """
    Get a database session (for use in Lambda functions)
    Remember to close the session when done
    """
    return SessionLocal()

def test_connection() -> bool:
    """
    Test database connection
    Returns True if connection is successful
    """
    try:
        with engine.connect() as connection:
            result = connection.execute(text("SELECT 1"))
            return result.fetchone()[0] == 1
    except Exception as e:
        logger.error(f"Database connection test failed: {str(e)}")
        return False

def get_connection_info() -> dict:
    """
    Get database connection information (without sensitive data)
    """
    return {
        "host": DB_HOST,
        "port": DB_PORT,
        "database": DB_NAME,
        "user": DB_USER,
        "pool_size": DB_POOL_SIZE,
        "max_overflow": DB_MAX_OVERFLOW,
        "pool_recycle": DB_POOL_RECYCLE,
        "connected": test_connection()
    }

# Lambda-specific database utilities
class LambdaDatabaseManager:
    """
    Database manager optimized for AWS Lambda
    Handles connection pooling and session management
    """
    
    def __init__(self):
        self.engine = engine
        self.session_factory = SessionLocal
    
    def get_session(self) -> Session:
        """Get a new database session"""
        return self.session_factory()
    
    def execute_query(self, query: str, params: dict = None) -> list:
        """Execute a raw SQL query"""
        with self.get_session() as session:
            result = session.execute(text(query), params or {})
            return result.fetchall()
    
    def health_check(self) -> dict:
        """Perform database health check"""
        try:
            with self.get_session() as session:
                # Test basic connectivity
                result = session.execute(text("SELECT 1 as test"))
                test_result = result.fetchone()[0]
                
                # Get connection pool status
                pool = self.engine.pool
                pool_status = {
                    "size": pool.size(),
                    "checked_in": pool.checkedin(),
                    "checked_out": pool.checkedout(),
                    "overflow": pool.overflow(),
                    "invalid": pool.invalid()
                }
                
                return {
                    "status": "healthy" if test_result == 1 else "unhealthy",
                    "test_query": test_result,
                    "pool_status": pool_status,
                    "connection_info": get_connection_info()
                }
        except Exception as e:
            logger.error(f"Database health check failed: {str(e)}")
            return {
                "status": "unhealthy",
                "error": str(e),
                "connection_info": get_connection_info()
            }

# Global database manager instance
db_manager = LambdaDatabaseManager()

# Export commonly used functions
__all__ = [
    'engine',
    'SessionLocal', 
    'get_db',
    'get_db_session',
    'test_connection',
    'get_connection_info',
    'LambdaDatabaseManager',
    'db_manager'
]
