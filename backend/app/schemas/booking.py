from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from .test import TestResponse, TestPackageResponse

class AddressBase(BaseModel):
    address_type: str = "Home"
    house_flat: str
    street: str
    area: str
    city: str = "Bengaluru"
    pincode: str
    landmark: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None

class AddressCreate(AddressBase):
    pass

class AddressResponse(AddressBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

class BookingItemInput(BaseModel):
    item_type: str  # 'test' or 'package'
    item_id: int    # test_id or package_id
    item_name: str
    price: float

class BookingItemResponse(BaseModel):
    id: int
    item_type: str
    test_id: Optional[int] = None
    package_id: Optional[int] = None
    item_name: str
    price: float

    class Config:
        from_attributes = True

class BookingCreateRequest(BaseModel):
    # Patient details
    patient_name: str
    patient_age: int
    patient_gender: str
    patient_phone: str
    patient_email: Optional[str] = None
    patient_notes: Optional[str] = None
    
    # Address details (either existing id or new address object)
    address_id: Optional[int] = None
    address: Optional[AddressCreate] = None

    # Schedule
    appointment_date: str  # YYYY-MM-DD
    appointment_time_slot: str  # "06:30 AM - 07:30 AM"

    # Selected Items
    items: List[BookingItemInput]

    # Discounts / Coupons
    coupon_code: Optional[str] = None

class StaffAssignmentResponse(BaseModel):
    id: int
    staff_id: int
    staff_name: Optional[str] = None
    staff_phone: Optional[str] = None
    status: str
    sample_barcode: Optional[str] = None
    vials_collected: int = 0
    tube_types: Optional[str] = None
    phlebotomist_notes: Optional[str] = None
    assigned_at: datetime
    completed_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class BookingDetailResponse(BaseModel):
    id: int
    booking_code: str
    user_id: int
    patient_name: str
    patient_age: int
    patient_gender: str
    patient_phone: str
    patient_email: Optional[str] = None
    patient_notes: Optional[str] = None

    address: AddressResponse
    appointment_date: str
    appointment_time_slot: str
    status: str
    cancellation_reason: Optional[str] = None

    subtotal: float
    collection_fee: float
    discount_amount: float
    total_amount: float
    coupon_code: Optional[str] = None

    items: List[BookingItemResponse] = []
    assignment: Optional[StaffAssignmentResponse] = None
    payment_status: Optional[str] = None
    payment_id: Optional[str] = None

    reports_count: int = 0
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class BookingStatusUpdateRequest(BaseModel):
    status: str
    notes: Optional[str] = None
    cancellation_reason: Optional[str] = None

class StaffCollectionUpdateRequest(BaseModel):
    status: str  # "EN_ROUTE", "SAMPLE_COLLECTED", "DELIVERED_TO_LAB", "FAILED"
    sample_barcode: Optional[str] = None
    vials_collected: Optional[int] = None
    tube_types: Optional[str] = None
    phlebotomist_notes: Optional[str] = None
    failure_reason: Optional[str] = None
