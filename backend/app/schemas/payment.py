from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class CreateOrderRequest(BaseModel):
    booking_id: int

class CreateOrderResponse(BaseModel):
    order_id: str
    amount: float  # In INR
    amount_subunits: int  # In paise for Razorpay
    currency: str = "INR"
    key_id: str
    booking_code: str
    patient_name: str
    patient_phone: str
    patient_email: Optional[str] = None

class VerifyPaymentRequest(BaseModel):
    booking_id: int
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str
    payment_method: Optional[str] = "UPI"

class PaymentResponse(BaseModel):
    id: int
    booking_id: int
    razorpay_order_id: str
    razorpay_payment_id: Optional[str] = None
    amount: float
    currency: str
    status: str
    payment_method: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class RefundRequest(BaseModel):
    booking_id: int
    reason: str
    amount: Optional[float] = None

