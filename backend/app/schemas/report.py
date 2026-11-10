from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ReportResponse(BaseModel):
    id: int
    booking_id: int
    user_id: int
    file_name: str
    file_size_bytes: int
    lab_name: str
    verified_by_doctor: str
    doctor_registration: str
    is_verified: bool
    verification_notes: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class ServiceablePincodeResponse(BaseModel):
    id: int
    pincode: str
    area_name: str
    city: str
    state: str
    is_active: bool
    estimated_transit_hours: float

    class Config:
        from_attributes = True

class ServiceablePincodeCreate(BaseModel):
    pincode: str
    area_name: str
    city: str = "Bengaluru"
    state: str = "Karnataka"
    is_active: bool = True
    estimated_transit_hours: float = 2.5

class CouponResponse(BaseModel):
    id: int
    code: str
    description: str
    discount_percent: float
    flat_discount: float
    min_order_amount: float
    is_active: bool

    class Config:
        from_attributes = True

class NotificationResponse(BaseModel):
    id: int
    title: str
    message: str
    notification_type: str
    is_read: bool
    action_link: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

