from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
import os
import time

from .config import settings
from .database import engine, Base
from .seed import seed_database
from .routers import auth, tests, bookings, payments, staff, admin, reports, serviceability

app = FastAPI(
    title=settings.APP_NAME,
    description="CareAtHome - Home Blood Collection & Diagnostic Booking Platform REST API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS configuration
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3001",
    "*"  # Allow all for seamless local development & staging
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Startup hook to initialize database and seed baseline medical data
@app.on_event("startup")
def on_startup():
    # Ensure storage directory exists
    os.makedirs(settings.REPORT_STORAGE_DIR, exist_ok=True)
    
    # Initialize DB tables
    Base.metadata.create_all(bind=engine)
    
    # Auto-seed database with realistic tests, packages, accounts, and demo bookings
    try:
        seed_database()
    except Exception as e:
        print(f"Startup seed notice: {e}")

# Include API Routers with prefix
app.include_router(auth.router, prefix="/api")
app.include_router(tests.router, prefix="/api")
app.include_router(bookings.router, prefix="/api")
app.include_router(payments.router, prefix="/api")
app.include_router(staff.router, prefix="/api")
app.include_router(admin.router, prefix="/api")
app.include_router(reports.router, prefix="/api")
app.include_router(serviceability.router, prefix="/api")

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": settings.APP_NAME,
        "version": "1.0.0",
        "target_market": "India (INR ₹)",
        "partner_lab": settings.PARTNER_LAB_NAME,
        "timestamp": int(time.time())
    }

@app.get("/")
def root():
    return {
        "message": "Welcome to CareAtHome API - Healthcare That Comes To You.",
        "documentation": "/docs",
        "health": "/api/health"
    }

