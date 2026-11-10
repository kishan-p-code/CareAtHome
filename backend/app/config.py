import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    APP_NAME: str = "CareAtHome Diagnostic Services"
    API_PREFIX: str = "/api"
    SECRET_KEY: str = "careathome_super_secret_production_key_2026_blood_collection"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # Database
    DATABASE_URL: str = "sqlite:///./careathome.db"
    
    # Storage
    REPORT_STORAGE_DIR: str = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "uploads", "reports")
    
    # Razorpay Keys (Defaults to test placeholders, supports live or auto-test mode)
    RAZORPAY_KEY_ID: str = "rzp_test_CareAtHomeTestKey"
    RAZORPAY_KEY_SECRET: str = "careathome_test_secret_mock"
    
    # Partner Diagnostic Lab Config
    PARTNER_LAB_NAME: str = "Apex NABL Accredited Diagnostics"
    PARTNER_LAB_LICENSE: str = "NABL-MED-IND-2026-9812"
    
    class Config:
        env_file = ".env"
        extra = "allow"

settings = Settings()

