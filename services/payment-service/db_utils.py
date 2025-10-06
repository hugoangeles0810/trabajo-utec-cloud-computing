"""
Database utilities for Gamarriando Product Service using psycopg2
"""

import os
import psycopg2
import psycopg2.extras
import logging
from typing import Dict, Any, List, Optional
from contextlib import contextmanager

logger = logging.getLogger(__name__)

def get_db_config() -> Dict[str, str]:
    """Get database configuration from environment variables"""
    return {
        'host': os.getenv('DB_HOST', ''),
        'port': os.getenv('DB_PORT', '5432'),
        'database': os.getenv('DB_NAME', 'gamarriando'),
        'user': os.getenv('DB_USER', 'gamarriando'),
        'password': os.getenv('DB_PASSWORD', '')
    }

@contextmanager
def get_db_connection():
    """Get database connection with automatic cleanup"""
    config = get_db_config()
    conn = None
    try:
        conn = psycopg2.connect(**config)
        yield conn
    except Exception as e:
        if conn:
            conn.rollback()
        logger.error(f"Database connection error: {str(e)}")
        raise
    finally:
        if conn:
            conn.close()

def execute_query(sql: str, parameters: tuple = None) -> List[Dict[str, Any]]:
    """Execute SELECT query and return results as list of dictionaries"""
    try:
        with get_db_connection() as conn:
            with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cursor:
                cursor.execute(sql, parameters)
                results = cursor.fetchall()
                return [dict(row) for row in results]
    except Exception as e:
        logger.error(f"Query execution error: {str(e)}")
        raise

def execute_single_query(sql: str, parameters: tuple = None) -> Optional[Dict[str, Any]]:
    """Execute SELECT query and return single result as dictionary"""
    results = execute_query(sql, parameters)
    return results[0] if results else None

def execute_insert(sql: str, parameters: tuple = None) -> int:
    """Execute INSERT query and return the inserted ID"""
    try:
        with get_db_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute(sql, parameters)
                conn.commit()
                # For INSERT with RETURNING, get the generated ID
                if 'RETURNING' in sql.upper():
                    return cursor.fetchone()[0]
                return cursor.rowcount
    except Exception as e:
        logger.error(f"Insert execution error: {str(e)}")
        raise

def execute_update(sql: str, parameters: tuple = None) -> int:
    """Execute UPDATE query and return number of affected rows"""
    try:
        with get_db_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute(sql, parameters)
                conn.commit()
                return cursor.rowcount
    except Exception as e:
        logger.error(f"Update execution error: {str(e)}")
        raise

def execute_delete(sql: str, parameters: tuple = None) -> int:
    """Execute DELETE query and return number of affected rows"""
    try:
        with get_db_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute(sql, parameters)
                conn.commit()
                return cursor.rowcount
    except Exception as e:
        logger.error(f"Delete execution error: {str(e)}")
        raise

def create_parameter(name: str, value: Any, param_type: str = 'string') -> Any:
    """Create parameter for psycopg2 (just return the value)"""
    # For psycopg2, we just return the value directly
    # The parameter name is used for documentation purposes
    return value