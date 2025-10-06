import os
from typing import Optional


class Settings:
    """Simple settings class using environment variables directly"""
    
    def __init__(self):
        # Database Configuration
        self.database_url = os.getenv("DATABASE_URL", "sqlite:///./gamarriando.db")
        self.db_master_username = os.getenv("DB_MASTER_USERNAME", "gamarriando")
        self.db_master_password = os.getenv("DB_MASTER_PASSWORD", "gamarriando123")
        self.db_name = os.getenv("DB_NAME", "gamarriando")
        self.db_instance_class = os.getenv("DB_INSTANCE_CLASS", "db.r6g.large")
        
        # JWT Configuration
        self.jwt_secret_key = os.getenv("JWT_SECRET_KEY", "your-secret-key-here-change-in-production")
        self.jwt_algorithm = os.getenv("JWT_ALGORITHM", "HS256")
        self.jwt_access_token_expire_minutes = int(os.getenv("JWT_ACCESS_TOKEN_EXPIRE_MINUTES", "30"))
        
        # AWS Configuration
        self.aws_region = os.getenv("AWS_REGION", "us-east-1")
        self.vpc_id = os.getenv("VPC_ID")
        self.subnet_id_1 = os.getenv("SUBNET_ID_1")
        self.subnet_id_2 = os.getenv("SUBNET_ID_2")
        
        # Application Configuration
        self.stage = os.getenv("STAGE", "dev")
        self.debug = os.getenv("DEBUG", "true").lower() == "true"
        self.log_level = os.getenv("LOG_LEVEL", "INFO")
        
        # S3 Configuration
        self.s3_bucket = os.getenv("S3_BUCKET", "gamarriando-dev-product-images")
        self.s3_region = os.getenv("S3_REGION", "us-east-1")


# Global settings instance
settings = Settings()