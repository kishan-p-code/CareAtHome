from pydantic import BaseModel
from typing import Optional, List

class TestBase(BaseModel):
    code: str
    name: str
    category: str
    short_description: str
    description: str
    price: float
    market_price: Optional[float] = None
    sample_type: str = "Blood (EDTA / Serum)"
    tube_color: str = "Purple / Yellow"
    fasting_required: bool = False
    fasting_hours: int = 0
    preparation_instructions: str
    turnaround_time_hours: int = 12
    parameters_count: int = 1
    is_popular: bool = False
    is_active: bool = True

class TestCreate(TestBase):
    pass

class TestResponse(TestBase):
    id: int

    class Config:
        from_attributes = True

class TestPackageBase(BaseModel):
    code: str
    name: str
    category: str = "Health Package"
    tagline: Optional[str] = None
    description: str
    price: float
    market_price: float
    fasting_required: bool = True
    fasting_hours: int = 10
    preparation_instructions: str
    turnaround_time_hours: int = 24
    parameters_count: int = 60
    sample_types: str = "Blood (EDTA, Serum, Fluoride)"
    target_demographic: str = "All Adults (20-75 yrs)"
    is_popular: bool = True
    is_active: bool = True

class TestPackageCreate(TestPackageBase):
    test_ids: List[int] = []

class TestPackageResponse(TestPackageBase):
    id: int
    tests: List[TestResponse] = []

    class Config:
        from_attributes = True

