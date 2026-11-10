from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from ..database import Base

class ServiceablePincode(Base):
    __tablename__ = "serviceable_pincodes"

    id = Column(Integer, primary_key=True, index=True)
    pincode = Column(String(10), unique=True, index=True, nullable=False)
    area_name = Column(String(255), nullable=False)
    city = Column(String(100), nullable=False, default="Bengaluru")
    state = Column(String(100), nullable=False, default="Karnataka")
    is_active = Column(Boolean, default=True)
    estimated_transit_hours = Column(Float, default=2.5)  # Cold-chain transit to lab


class Coupon(Base):
    __tablename__ = "coupons"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(50), unique=True, index=True, nullable=False)
    description = Column(String(255), nullable=False)
    discount_percent = Column(Float, default=0.0)
    flat_discount = Column(Float, default=0.0)
    min_order_amount = Column(Float, default=0.0)
    max_discount_cap = Column(Float, default=1000.0)
    is_active = Column(Boolean, default=True)
    valid_until = Column(DateTime, nullable=True)


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    notification_type = Column(String(50), default="INFO")  # BOOKING, PAYMENT, REPORT, SYSTEM
    is_read = Column(Boolean, default=False)
    action_link = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="notifications")


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    action = Column(String(100), nullable=False)  # e.g., 'REPORT_UPLOAD', 'STATUS_UPDATE', 'REFUND_ISSUED'
    resource_type = Column(String(50), nullable=False)  # 'booking', 'report', 'payment', 'user'
    resource_id = Column(String(100), nullable=True)
    details = Column(Text, nullable=True)
    ip_address = Column(String(50), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="audit_logs")

