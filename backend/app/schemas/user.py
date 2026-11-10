from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class CustomerProfileSchema(BaseModel):
    date_of_birth: Optional[str] = None
    gender: Optional[str] = None
    blood_group: Optional[str] = None
    emergency_contact: Optional[str] = None
    medical_history: Optional[str] = None

    class Config:
        from_attributes = True

class StaffProfileSchema(BaseModel):
    qualification: Optional[str] = None
    license_number: Optional[str] = None
    service_area: Optional[str] = None
    is_available: bool = True
    total_collections: int = 0
    rating: float = 4.9
    police_verification_status: str = "VERIFIED"

    class Config:
        from_attributes = True

class UserRegister(BaseModel):
    email: str
    password: str
    full_name: str
    phone: Optional[str] = None
    role: Optional[str] = "customer"

class UserLogin(BaseModel):
    email: str
    password: str

class UserResponse(BaseModel):
    id: int
    email: str
    full_name: str
    phone: Optional[str] = None
    role: str
    is_active: bool
    created_at: datetime
    customer_profile: Optional[CustomerProfileSchema] = None
    staff_profile: Optional[StaffProfileSchema] = None

    class Config:
        from_attributes = True

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: UserResponse

class UpdateProfileRequest(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    date_of_birth: Optional[str] = None
    gender: Optional[str] = None
    blood_group: Optional[str] = None
    emergency_contact: Optional[str] = None
