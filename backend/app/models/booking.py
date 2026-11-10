from sqlalchemy import Column, Integer, String, Float, Boolean, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from ..database import Base

class Address(Base):
    __tablename__ = "addresses"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    address_type = Column(String(50), default="Home")  # Home, Office, Other
    house_flat = Column(String(255), nullable=False)
    street = Column(String(255), nullable=False)
    area = Column(String(255), nullable=False)
    city = Column(String(100), nullable=False, default="Bengaluru")
    pincode = Column(String(10), nullable=False, index=True)
    landmark = Column(String(255), nullable=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="addresses")
    bookings = relationship("Booking", back_populates="address")


class Booking(Base):
    __tablename__ = "bookings"

    id = Column(Integer, primary_key=True, index=True)
    booking_code = Column(String(50), unique=True, index=True, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    address_id = Column(Integer, ForeignKey("addresses.id"), nullable=False)

    # Patient info
    patient_name = Column(String(255), nullable=False)
    patient_age = Column(Integer, nullable=False)
    patient_gender = Column(String(20), nullable=False)
    patient_phone = Column(String(20), nullable=False)
    patient_email = Column(String(255), nullable=True)
    patient_notes = Column(Text, nullable=True)

    # Schedule
    appointment_date = Column(String(20), nullable=False)  # YYYY-MM-DD
    appointment_time_slot = Column(String(50), nullable=False)  # e.g. "06:30 AM - 07:30 AM"

    # Status:
    # PENDING -> CONFIRMED -> STAFF_ASSIGNED -> COLLECTION_IN_PROGRESS -> 
    # SAMPLE_COLLECTED -> PROCESSING_AT_LAB -> REPORT_READY -> COMPLETED
    # Or CANCELLED
    status = Column(String(50), default="CONFIRMED", index=True, nullable=False)
    cancellation_reason = Column(Text, nullable=True)
    reschedule_count = Column(Integer, default=0)

    # Pricing breakdown (INR)
    subtotal = Column(Float, nullable=False)
    collection_fee = Column(Float, default=150.0)
    discount_amount = Column(Float, default=0.0)
    total_amount = Column(Float, nullable=False)
    coupon_code = Column(String(50), nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="bookings")
    address = relationship("Address", back_populates="bookings")
    items = relationship("BookingItem", back_populates="booking", cascade="all, delete-orphan")
    payment = relationship("Payment", back_populates="booking", uselist=False)
    assignment = relationship("StaffAssignment", back_populates="booking", uselist=False)
    reports = relationship("Report", back_populates="booking", cascade="all, delete-orphan")


class BookingItem(Base):
    __tablename__ = "booking_items"

    id = Column(Integer, primary_key=True, index=True)
    booking_id = Column(Integer, ForeignKey("bookings.id", ondelete="CASCADE"), nullable=False)
    item_type = Column(String(20), nullable=False)  # 'test' or 'package'
    test_id = Column(Integer, ForeignKey("tests.id", ondelete="SET NULL"), nullable=True)
    package_id = Column(Integer, ForeignKey("test_packages.id", ondelete="SET NULL"), nullable=True)
    item_name = Column(String(255), nullable=False)
    price = Column(Float, nullable=False)

    booking = relationship("Booking", back_populates="items")


class StaffAssignment(Base):
    __tablename__ = "staff_assignments"

    id = Column(Integer, primary_key=True, index=True)
    booking_id = Column(Integer, ForeignKey("bookings.id", ondelete="CASCADE"), unique=True, nullable=False)
    staff_id = Column(Integer, ForeignKey("staff_profiles.id"), nullable=False)
    assigned_at = Column(DateTime, default=datetime.utcnow)
    accepted_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    status = Column(String(50), default="ASSIGNED")  # ASSIGNED, EN_ROUTE, SAMPLE_COLLECTED, DELIVERED_TO_LAB, FAILED
    
    # Collection tracking details
    sample_barcode = Column(String(100), nullable=True)
    vials_collected = Column(Integer, default=0)
    tube_types = Column(String(255), nullable=True)
    temperature_maintained = Column(Boolean, default=True)
    phlebotomist_notes = Column(Text, nullable=True)
    failure_reason = Column(Text, nullable=True)

    booking = relationship("Booking", back_populates="assignment")
    staff = relationship("StaffProfile", back_populates="assignments")

