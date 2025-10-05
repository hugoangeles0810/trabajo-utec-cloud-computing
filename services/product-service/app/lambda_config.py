"""
Lambda-specific configuration for Product Service
"""
import os
from .config import Settings

class LambdaSettings(Settings):
    """Settings optimized for AWS Lambda"""
    
    # Override database URL for Lambda
    @property
    def database_url(self) -> str:
        # In Lambda, use RDS Proxy or direct RDS connection
        if os.getenv("AWS_LAMBDA_FUNCTION_NAME"):
            # Lambda environment - use RDS Aurora
            db_host = os.getenv("DB_HOST", "localhost")
            db_port = os.getenv("DB_PORT", "5432")
            db_name = os.getenv("DB_NAME", "gamarriando")
            db_user = os.getenv("DB_USER", "gamarriando")
            db_password = os.getenv("DB_PASSWORD", "gamarriando123")
            
            return f"postgresql://{db_user}:{db_password}@{db_host}:{db_port}/{db_name}"
        else:
            # Local development
            return "sqlite:///./gamarriando.db"
    
    # Lambda-specific settings
    @property
    def is_lambda(self) -> bool:
        return bool(os.getenv("AWS_LAMBDA_FUNCTION_NAME"))
    
    @property
    def debug(self) -> bool:
        # Disable debug in Lambda
        return not self.is_lambda and os.getenv("DEBUG", "false").lower() == "true"

# Use Lambda settings when in Lambda environment
if os.getenv("AWS_LAMBDA_FUNCTION_NAME"):
    settings = LambdaSettings()
else:
    from .config import settings
