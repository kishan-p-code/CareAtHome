from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from ..database import get_db
from ..models.test import Test, TestPackage
from ..schemas.test import TestResponse, TestPackageResponse

router = APIRouter(tags=["Tests & Packages"])

@router.get("/tests", response_model=List[TestResponse])
def get_all_tests(
    category: Optional[str] = Query(None, description="Filter by category"),
    search: Optional[str] = Query(None, description="Search by name or code"),
    popular_only: Optional[bool] = Query(False, description="Filter popular tests"),
    db: Session = Depends(get_db)
):
    query = db.query(Test).filter(Test.is_active == True)
    
    if category and category.lower() != "all":
        query = query.filter(Test.category.ilike(f"%{category}%"))
    
    if search:
        search_fmt = f"%{search}%"
        query = query.filter(
            (Test.name.ilike(search_fmt)) | 
            (Test.code.ilike(search_fmt)) |
            (Test.short_description.ilike(search_fmt))
        )
        
    if popular_only:
        query = query.filter(Test.is_popular == True)

    return query.order_by(Test.is_popular.desc(), Test.name.asc()).all()

@router.get("/tests/{test_id}", response_model=TestResponse)
def get_test_by_id(test_id: int, db: Session = Depends(get_db)):
    test = db.query(Test).filter(Test.id == test_id, Test.is_active == True).first()
    if not test:
        raise HTTPException(status_code=404, detail="Test not found")
    return test

@router.get("/packages", response_model=List[TestPackageResponse])
def get_all_packages(
    search: Optional[str] = Query(None, description="Search by package name"),
    db: Session = Depends(get_db)
):
    query = db.query(TestPackage).filter(TestPackage.is_active == True)
    if search:
        query = query.filter(TestPackage.name.ilike(f"%{search}%"))
    return query.order_by(TestPackage.price.asc()).all()

@router.get("/packages/{package_id}", response_model=TestPackageResponse)
def get_package_by_id(package_id: int, db: Session = Depends(get_db)):
    package = db.query(TestPackage).filter(TestPackage.id == package_id, TestPackage.is_active == True).first()
    if not package:
        raise HTTPException(status_code=404, detail="Health package not found")
    return package

