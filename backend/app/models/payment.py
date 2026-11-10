from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from ..database import Base

class Payment(Base):
    __tablename__ = "payments"

    id = Column(Integer, primary_key=True, index=True)
    booking_id = Column(Integer, ForeignKey("bookings.id", ondelete="CASCADE"), unique=True, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    razorpay_order_id = Column(String(100), index=True, nullable=False)
    razorpay_payment_id = Column(String(100), index=True, nullable=True)
    razorpay_signature = Column(String(255), nullable=True)

    amount = Column(Float, nullable=False)  # in INR
    currency = Column(String(10), default="INR")
    status = Column(String(50), default="CREATED")  # CREATED, SUCCESS, FAILED, REFUNDED
    payment_method = Column(String(50), nullable=True)  # UPI, CARD, NETBANKING, CASH_ON_COLLECTION
    error_description = Column(Text, nullable=True)

    # Refund management
    refund_id = Column(String(100), nullable=True)
    refund_amount = Column(Float, default=0.0)
    refund_reason = Column(Text, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    booking = relationship("Booking", back_populates="payment")
    user = relationship("User")

