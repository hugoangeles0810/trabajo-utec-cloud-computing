"""
AWS Lambda handler for Gamarriando Product Service
"""
from mangum import Mangum
from app.main import app

# Create the Lambda handler
handler = Mangum(app, lifespan="off")