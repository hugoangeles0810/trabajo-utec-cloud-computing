from pydantic_settings import BaseSettings
from typing import Optional
import os


class Settings(BaseSettings):
    # Database Configuration
    database_url: str = "sqlite:///./gamarriando.db"
    db_master_username: str = "gamarriando"
    db_master_password: str = "gamarriando123"
    db_name: str = "gamarriando"
    db_instance_class: str = "db.r6g.large"
    
    # JWT Configuration
    jwt_secret_key: str = "your-secret-key-here-change-in-production"
    jwt_algorithm: str = "HS256"
    jwt_access_token_expire_minutes: int = 30
    
    # AWS Configuration
    aws_region: str = "us-east-1"
    vpc_id: Optional[str] = None
    subnet_id_1: Optional[str] = None
    subnet_id_2: Optional[str] = None
    
    # Application Configuration
    stage: str = "dev"
    debug: bool = True
    log_level: str = "INFO"
    
    # S3 Configuration
    s3_bucket: str = "gamarriando-dev-product-images"
    s3_region: str = "us-east-1"
    
    class Config:
        env_file = ".env"
        case_sensitive = False


# Global settings instance
settings = Settings()