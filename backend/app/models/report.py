from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from ..database import Base

class Report(Base):
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True, index=True)
    booking_id = Column(Integer, ForeignKey("bookings.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)

    file_path = Column(String(500), nullable=False)
    file_name = Column(String(255), nullable=False)
    file_size_bytes = Column(Integer, default=0)

    lab_name = Column(String(255), default="Apex NABL Diagnostic Reference Laboratory")
    verified_by_doctor = Column(String(255), default="Dr. Ananya Roy, MD (Pathology)")
    doctor_registration = Column(String(100), default="KMC-PATH-84291")
    is_verified = Column(Boolean, default=True)
    verification_notes = Column(Text, nullable=True)

    download_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

    booking = relationship("Booking", back_populates="reports")
    user = relationship("User")

