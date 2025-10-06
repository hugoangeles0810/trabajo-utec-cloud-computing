"""
Database utilities for Gamarriando User Service using psycopg2
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

# User-specific database functions

def get_user_by_email(email: str) -> Optional[Dict[str, Any]]:
    """Get user by email address"""
    sql = "SELECT * FROM users WHERE email = %s"
    return execute_single_query(sql, (email,))

def get_user_by_id(user_id: int) -> Optional[Dict[str, Any]]:
    """Get user by ID"""
    sql = "SELECT * FROM users WHERE id = %s"
    return execute_single_query(sql, (user_id,))

def get_user_by_username(username: str) -> Optional[Dict[str, Any]]:
    """Get user by username"""
    sql = "SELECT * FROM users WHERE username = %s"
    return execute_single_query(sql, (username,))

def create_user(user_data: Dict[str, Any]) -> int:
    """Create a new user and return the user ID"""
    sql = """
        INSERT INTO users (email, username, password_hash, first_name, last_name, 
                          phone, date_of_birth, is_active, is_verified, is_admin, 
                          profile_picture_url, preferences, created_at, updated_at)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, NOW(), NOW())
        RETURNING id
    """
    parameters = (
        user_data.get('email'),
        user_data.get('username'),
        user_data.get('password_hash'),
        user_data.get('first_name'),
        user_data.get('last_name'),
        user_data.get('phone'),
        user_data.get('date_of_birth'),
        user_data.get('is_active', True),
        user_data.get('is_verified', False),
        user_data.get('is_admin', False),
        user_data.get('profile_picture_url'),
        user_data.get('preferences', '{}')
    )
    return execute_insert(sql, parameters)

def update_user(user_id: int, user_data: Dict[str, Any]) -> int:
    """Update user information"""
    # Build dynamic SQL based on provided fields
    fields = []
    parameters = []
    
    for field, value in user_data.items():
        if field in ['first_name', 'last_name', 'phone', 'date_of_birth', 
                    'profile_picture_url', 'preferences', 'is_active', 'is_verified']:
            fields.append(f"{field} = %s")
            parameters.append(value)
    
    if not fields:
        return 0
    
    fields.append("updated_at = NOW()")
    parameters.append(user_id)
    
    sql = f"UPDATE users SET {', '.join(fields)} WHERE id = %s"
    return execute_update(sql, tuple(parameters))

def delete_user(user_id: int) -> int:
    """Delete user (soft delete by setting is_active = false)"""
    sql = "UPDATE users SET is_active = false, updated_at = NOW() WHERE id = %s"
    return execute_update(sql, (user_id,))

def get_user_roles(user_id: int) -> List[Dict[str, Any]]:
    """Get all active roles for a user"""
    sql = """
        SELECT ur.id, ur.role_name, ur.granted_at, ur.expires_at, ur.is_active,
               u.email as granted_by_email
        FROM user_roles ur
        LEFT JOIN users u ON ur.granted_by = u.id
        WHERE ur.user_id = %s AND ur.is_active = true
        ORDER BY ur.granted_at DESC
    """
    return execute_query(sql, (user_id,))

def assign_role_to_user(user_id: int, role_name: str, granted_by: int) -> int:
    """Assign a role to a user"""
    sql = """
        INSERT INTO user_roles (user_id, role_name, granted_by, granted_at, is_active)
        VALUES (%s, %s, %s, NOW(), true)
        RETURNING id
    """
    return execute_insert(sql, (user_id, role_name, granted_by))

def remove_role_from_user(user_id: int, role_id: int) -> int:
    """Remove a role from a user"""
    sql = "UPDATE user_roles SET is_active = false WHERE id = %s AND user_id = %s"
    return execute_update(sql, (role_id, user_id))

def create_user_session(session_data: Dict[str, Any]) -> int:
    """Create a new user session"""
    sql = """
        INSERT INTO user_sessions (user_id, session_token, refresh_token, device_info,
                                  ip_address, user_agent, expires_at, created_at, last_accessed_at)
        VALUES (%s, %s, %s, %s, %s, %s, %s, NOW(), NOW())
        RETURNING id
    """
    parameters = (
        session_data.get('user_id'),
        session_data.get('session_token'),
        session_data.get('refresh_token'),
        session_data.get('device_info'),
        session_data.get('ip_address'),
        session_data.get('user_agent'),
        session_data.get('expires_at')
    )
    return execute_insert(sql, parameters)

def get_user_sessions(user_id: int) -> List[Dict[str, Any]]:
    """Get all active sessions for a user"""
    sql = """
        SELECT id, session_token, device_info, ip_address, user_agent,
               expires_at, created_at, last_accessed_at
        FROM user_sessions
        WHERE user_id = %s AND expires_at > NOW()
        ORDER BY last_accessed_at DESC
    """
    return execute_query(sql, (user_id,))

def revoke_session(session_id: int) -> int:
    """Revoke a specific session"""
    sql = "DELETE FROM user_sessions WHERE id = %s"
    return execute_delete(sql, (session_id,))

def revoke_all_user_sessions(user_id: int) -> int:
    """Revoke all sessions for a user"""
    sql = "DELETE FROM user_sessions WHERE user_id = %s"
    return execute_delete(sql, (user_id,))

def create_password_reset_token(user_id: int, token: str, expires_at: str) -> int:
    """Create a password reset token"""
    sql = """
        INSERT INTO password_reset_tokens (user_id, token, expires_at, created_at)
        VALUES (%s, %s, %s, NOW())
        RETURNING id
    """
    return execute_insert(sql, (user_id, token, expires_at))

def get_password_reset_token(token: str) -> Optional[Dict[str, Any]]:
    """Get password reset token if valid"""
    sql = """
        SELECT prt.*, u.email, u.username
        FROM password_reset_tokens prt
        JOIN users u ON prt.user_id = u.id
        WHERE prt.token = %s AND prt.expires_at > NOW() AND prt.used_at IS NULL
    """
    return execute_single_query(sql, (token,))

def mark_password_reset_token_used(token: str) -> int:
    """Mark password reset token as used"""
    sql = "UPDATE password_reset_tokens SET used_at = NOW() WHERE token = %s"
    return execute_update(sql, (token,))

def create_email_verification_token(user_id: int, token: str, expires_at: str) -> int:
    """Create an email verification token"""
    sql = """
        INSERT INTO email_verification_tokens (user_id, token, expires_at, created_at)
        VALUES (%s, %s, %s, NOW())
        RETURNING id
    """
    return execute_insert(sql, (user_id, token, expires_at))

def get_email_verification_token(token: str) -> Optional[Dict[str, Any]]:
    """Get email verification token if valid"""
    sql = """
        SELECT evt.*, u.email, u.username
        FROM email_verification_tokens evt
        JOIN users u ON evt.user_id = u.id
        WHERE evt.token = %s AND evt.expires_at > NOW() AND evt.verified_at IS NULL
    """
    return execute_single_query(sql, (token,))

def mark_email_verification_token_verified(token: str) -> int:
    """Mark email verification token as verified"""
    sql = "UPDATE email_verification_tokens SET verified_at = NOW() WHERE token = %s"
    return execute_update(sql, (token,))

def update_user_password(user_id: int, password_hash: str) -> int:
    """Update user password"""
    sql = "UPDATE users SET password_hash = %s, updated_at = NOW() WHERE id = %s"
    return execute_update(sql, (password_hash, user_id))

def update_user_last_login(user_id: int) -> int:
    """Update user's last login timestamp"""
    sql = "UPDATE users SET last_login_at = NOW(), updated_at = NOW() WHERE id = %s"
    return execute_update(sql, (user_id,))

def verify_user_email(user_id: int) -> int:
    """Mark user email as verified"""
    sql = "UPDATE users SET is_verified = true, updated_at = NOW() WHERE id = %s"
    return execute_update(sql, (user_id,))

def get_users_with_pagination(limit: int = 10, offset: int = 0, 
                            filters: Dict[str, Any] = None) -> List[Dict[str, Any]]:
    """Get users with pagination and optional filters"""
    where_conditions = ["is_active = true"]
    parameters = []
    
    if filters:
        if filters.get('is_verified') is not None:
            where_conditions.append("is_verified = %s")
            parameters.append(filters['is_verified'])
        
        if filters.get('is_admin') is not None:
            where_conditions.append("is_admin = %s")
            parameters.append(filters['is_admin'])
        
        if filters.get('search'):
            where_conditions.append("(email ILIKE %s OR username ILIKE %s OR first_name ILIKE %s OR last_name ILIKE %s)")
            search_term = f"%{filters['search']}%"
            parameters.extend([search_term, search_term, search_term, search_term])
    
    where_clause = " AND ".join(where_conditions)
    parameters.extend([limit, offset])
    
    sql = f"""
        SELECT id, email, username, first_name, last_name, phone, date_of_birth,
               is_active, is_verified, is_admin, profile_picture_url, preferences,
               last_login_at, created_at, updated_at
        FROM users
        WHERE {where_clause}
        ORDER BY created_at DESC
        LIMIT %s OFFSET %s
    """
    return execute_query(sql, tuple(parameters))

def count_users(filters: Dict[str, Any] = None) -> int:
    """Count total users with optional filters"""
    where_conditions = ["is_active = true"]
    parameters = []
    
    if filters:
        if filters.get('is_verified') is not None:
            where_conditions.append("is_verified = %s")
            parameters.append(filters['is_verified'])
        
        if filters.get('is_admin') is not None:
            where_conditions.append("is_admin = %s")
            parameters.append(filters['is_admin'])
        
        if filters.get('search'):
            where_conditions.append("(email ILIKE %s OR username ILIKE %s OR first_name ILIKE %s OR last_name ILIKE %s)")
            search_term = f"%{filters['search']}%"
            parameters.extend([search_term, search_term, search_term, search_term])
    
    where_clause = " AND ".join(where_conditions)
    
    sql = f"SELECT COUNT(*) as count FROM users WHERE {where_clause}"
    result = execute_single_query(sql, tuple(parameters))
    return result['count'] if result else 0

def cleanup_expired_sessions() -> int:
    """Clean up expired sessions"""
    sql = "DELETE FROM user_sessions WHERE expires_at < NOW()"
    return execute_delete(sql)

def cleanup_expired_tokens() -> int:
    """Clean up expired tokens"""
    sql = """
        DELETE FROM password_reset_tokens WHERE expires_at < NOW();
        DELETE FROM email_verification_tokens WHERE expires_at < NOW();
    """
    # Execute both statements
    with get_db_connection() as conn:
        with conn.cursor() as cursor:
            cursor.execute("DELETE FROM password_reset_tokens WHERE expires_at < NOW()")
            count1 = cursor.rowcount
            cursor.execute("DELETE FROM email_verification_tokens WHERE expires_at < NOW()")
            count2 = cursor.rowcount
            conn.commit()
            return count1 + count2
