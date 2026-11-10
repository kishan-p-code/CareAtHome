from sqlalchemy import Column, Integer, String, Float, Boolean, Text, ForeignKey, Table
from sqlalchemy.orm import relationship
from ..database import Base

# Association table for Package and Test (Many to Many)
package_tests = Table(
    "package_tests",
    Base.metadata,
    Column("package_id", Integer, ForeignKey("test_packages.id", ondelete="CASCADE"), primary_key=True),
    Column("test_id", Integer, ForeignKey("tests.id", ondelete="CASCADE"), primary_key=True),
)

class Test(Base):
    __tablename__ = "tests"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(50), unique=True, index=True, nullable=False)
    name = Column(String(255), nullable=False, index=True)
    category = Column(String(100), nullable=False, default="General")  # Diabetes, Heart, Full Body, Vitamins, Thyroid, Liver & Kidney, Immunity
    short_description = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    price = Column(Float, nullable=False)
    market_price = Column(Float, nullable=True)  # For displaying discount strike-through
    sample_type = Column(String(100), default="Blood (EDTA / Serum)")
    tube_color = Column(String(50), default="Purple / Yellow")
    fasting_required = Column(Boolean, default=False)
    fasting_hours = Column(Integer, default=0)
    preparation_instructions = Column(Text, nullable=False)
    turnaround_time_hours = Column(Integer, default=12)
    parameters_count = Column(Integer, default=1)
    is_popular = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)

    packages = relationship("TestPackage", secondary=package_tests, back_populates="tests")


class TestPackage(Base):
    __tablename__ = "test_packages"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(50), unique=True, index=True, nullable=False)
    name = Column(String(255), nullable=False, index=True)
    category = Column(String(100), nullable=False, default="Health Package")
    tagline = Column(String(255), nullable=True)
    description = Column(Text, nullable=False)
    price = Column(Float, nullable=False)
    market_price = Column(Float, nullable=False)
    fasting_required = Column(Boolean, default=True)
    fasting_hours = Column(Integer, default=10)
    preparation_instructions = Column(Text, nullable=False)
    turnaround_time_hours = Column(Integer, default=24)
    parameters_count = Column(Integer, default=60)
    sample_types = Column(String(255), default="Blood (EDTA, Serum, Fluoride)")
    target_demographic = Column(String(100), default="All Adults (20-75 yrs)")
    is_popular = Column(Boolean, default=True)
    is_active = Column(Boolean, default=True)

    tests = relationship("Test", secondary=package_tests, back_populates="packages")

