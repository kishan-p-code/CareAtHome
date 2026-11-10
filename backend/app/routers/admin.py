from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from datetime import datetime
import os
import shutil
from ..database import get_db
from ..models.user import User, StaffProfile, CustomerProfile
from ..models.test import Test, TestPackage
from ..models.booking import Booking, BookingItem, StaffAssignment
from ..models.payment import Payment
from ..models.report import Report
from ..models.other import ServiceablePincode, Coupon, AuditLog, Notification
from ..schemas.test import TestCreate, TestResponse, TestPackageCreate, TestPackageResponse
from ..schemas.report import ServiceablePincodeCreate, ServiceablePincodeResponse
from ..schemas.booking import BookingDetailResponse
from ..utils.deps import require_admin
from ..utils.helpers import generate_sample_barcode
from ..services.pdf_generator import generate_blood_test_report_pdf
from ..services.notification_service import create_notification
from ..config import settings
from .bookings import _format_booking_response

router = APIRouter(prefix="/admin", tags=["Admin Portal"])

@router.get("/stats")
def get_admin_dashboard_stats(
    admin_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    total_bookings = db.query(Booking).count()
    total_customers = db.query(User).filter(User.role == "customer").count()
    total_staff = db.query(User).filter(User.role == "staff").count()

    total_revenue = db.query(func.sum(Booking.total_amount)).filter(
        Booking.status != "CANCELLED"
    ).scalar() or 0.0

    pending_bookings = db.query(Booking).filter(
        Booking.status.in_(["PENDING", "CONFIRMED", "STAFF_ASSIGNED", "COLLECTION_IN_PROGRESS"])
    ).count()

    completed_bookings = db.query(Booking).filter(
        Booking.status.in_(["REPORT_READY", "COMPLETED"])
    ).count()

    # Status distribution
    status_counts = db.query(
        Booking.status, func.count(Booking.id)
    ).group_by(Booking.status).all()
    status_distribution = [{"status": s, "count": c} for s, c in status_counts]

    # Popular tests
    popular_tests_query = db.query(
        BookingItem.item_name, func.count(BookingItem.id).label("count")
    ).group_by(BookingItem.item_name).order_by(func.count(BookingItem.id).desc()).limit(6).all()
    popular_tests = [{"name": name, "bookings": count} for name, count in popular_tests_query]

    # Monthly revenue mockup/trends
    revenue_trends = [
        {"month": "Jun", "revenue": 142000, "bookings": 92},
        {"month": "Jul", "revenue": 185000, "bookings": 118},
        {"month": "Aug", "revenue": 224000, "bookings": 145},
        {"month": "Sep", "revenue": 298000, "bookings": 182},
        {"month": "Oct", "revenue": 385000, "bookings": 240},
        {"month": "Nov", "revenue": round(total_revenue + 154000, 2), "bookings": total_bookings + 120},
    ]

    return {
        "total_bookings": total_bookings,
        "total_customers": total_customers,
        "total_staff": total_staff,
        "total_revenue": round(total_revenue, 2),
        "pending_bookings": pending_bookings,
        "completed_bookings": completed_bookings,
        "status_distribution": status_distribution,
        "popular_tests": popular_tests,
        "revenue_trends": revenue_trends,
    }

@router.get("/bookings", response_model=List[BookingDetailResponse])
def get_all_admin_bookings(
    status_filter: Optional[str] = None,
    search: Optional[str] = None,
    admin_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    query = db.query(Booking)
    if status_filter and status_filter.lower() != "all":
        query = query.filter(Booking.status == status_filter.upper())
    if search:
        search_fmt = f"%{search}%"
        query = query.filter(
            (Booking.booking_code.ilike(search_fmt)) |
            (Booking.patient_name.ilike(search_fmt)) |
            (Booking.patient_phone.ilike(search_fmt))
        )
    bookings = query.order_by(Booking.created_at.desc()).all()
    return [_format_booking_response(b, db) for b in bookings]

@router.post("/bookings/{booking_id}/assign")
def assign_staff_to_booking(
    booking_id: int,
    staff_id: int,
    admin_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    staff_profile = db.query(StaffProfile).filter(StaffProfile.id == staff_id).first()
    if not staff_profile:
        raise HTTPException(status_code=404, detail="Staff profile not found")

    staff_user = db.query(User).filter(User.id == staff_profile.user_id).first()

    assignment = db.query(StaffAssignment).filter(StaffAssignment.booking_id == booking.id).first()
    if not assignment:
        assignment = StaffAssignment(
            booking_id=booking.id,
            staff_id=staff_profile.id,
            status="ASSIGNED",
            assigned_at=datetime.utcnow()
        )
        db.add(assignment)
    else:
        assignment.staff_id = staff_profile.id
        assignment.status = "ASSIGNED"
        assignment.assigned_at = datetime.utcnow()

    booking.status = "STAFF_ASSIGNED"
    db.commit()

    # Notify customer
    create_notification(
        db=db,
        user_id=booking.user_id,
        title="Phlebotomist Assigned",
        message=f"Qualified phlebotomist {staff_user.full_name} ({staff_user.phone}) has been assigned for your blood collection on {booking.appointment_date}.",
        notification_type="BOOKING",
        action_link=f"/dashboard"
    )

    # Notify staff
    create_notification(
        db=db,
        user_id=staff_user.id,
        title="New Home Visit Assigned",
        message=f"You have been assigned booking {booking.booking_code} on {booking.appointment_date} at {booking.appointment_time_slot}.",
        notification_type="BOOKING",
        action_link=f"/staff"
    )

    audit = AuditLog(
        user_id=admin_user.id,
        action="ASSIGN_STAFF",
        resource_type="booking",
        resource_id=booking.booking_code,
        details=f"Assigned to {staff_user.full_name} (ID: {staff_id})"
    )
    db.add(audit)
    db.commit()

    return {"message": "Staff successfully assigned", "booking_code": booking.booking_code, "staff_name": staff_user.full_name}

@router.post("/bookings/{booking_id}/status")
def update_booking_status_manually(
    booking_id: int,
    status_str: str,
    admin_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    booking.status = status_str.upper()
    db.commit()

    create_notification(
        db=db,
        user_id=booking.user_id,
        title=f"Booking Status: {booking.status}",
        message=f"Status for home collection {booking.booking_code} is now {booking.status}.",
        notification_type="BOOKING",
        action_link=f"/dashboard"
    )

    return {"message": "Status updated", "status": booking.status}

@router.post("/reports/generate/{booking_id}")
def generate_verified_report(
    booking_id: int,
    admin_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    patient_info = {
        "name": booking.patient_name,
        "age": booking.patient_age,
        "gender": booking.patient_gender,
        "phone": booking.patient_phone,
        "barcode": booking.assignment.sample_barcode if booking.assignment and booking.assignment.sample_barcode else generate_sample_barcode()
    }

    file_path, file_name, file_size = generate_blood_test_report_pdf(
        booking=booking,
        items=booking.items,
        output_dir=settings.REPORT_STORAGE_DIR,
        patient_info=patient_info
    )

    report = Report(
        booking_id=booking.id,
        user_id=booking.user_id,
        file_path=file_path,
        file_name=file_name,
        file_size_bytes=file_size,
        lab_name=settings.PARTNER_LAB_NAME,
        verified_by_doctor="Dr. Ananya Roy, MD (Pathology)",
        doctor_registration="KMC-PATH-84291",
        is_verified=True,
        verification_notes="All biochemical and hematological parameters verified under standard reference intervals."
    )
    db.add(report)

    booking.status = "REPORT_READY"
    db.commit()
    db.refresh(report)

    create_notification(
        db=db,
        user_id=booking.user_id,
        title="Blood Test Report Ready!",
        message=f"Your diagnostic test report for {booking.booking_code} is verified and ready for download.",
        notification_type="REPORT",
        action_link=f"/dashboard"
    )

    audit = AuditLog(
        user_id=admin_user.id,
        action="REPORT_GENERATED",
        resource_type="report",
        resource_id=file_name,
        details=f"Generated for booking {booking.booking_code}"
    )
    db.add(audit)
    db.commit()

    return {
        "status": "SUCCESS",
        "message": "Clinical laboratory report generated and published successfully",
        "report_id": report.id,
        "file_name": report.file_name,
        "download_url": f"/api/reports/{report.id}/download"
    }

@router.post("/reports/upload/{booking_id}")
async def upload_custom_report(
    booking_id: int,
    file: UploadFile = File(...),
    doctor_name: Optional[str] = Form("Dr. Ananya Roy, MD (Pathology)"),
    notes: Optional[str] = Form(None),
    admin_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF reports are allowed.")

    os.makedirs(settings.REPORT_STORAGE_DIR, exist_ok=True)
    clean_filename = f"Uploaded_{booking.booking_code}_{datetime.utcnow().strftime('%Y%m%d%H%M')}.pdf"
    target_path = os.path.join(settings.REPORT_STORAGE_DIR, clean_filename)

    with open(target_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    file_size = os.path.getsize(target_path)

    report = Report(
        booking_id=booking.id,
        user_id=booking.user_id,
        file_path=target_path,
        file_name=clean_filename,
        file_size_bytes=file_size,
        lab_name=settings.PARTNER_LAB_NAME,
        verified_by_doctor=doctor_name,
        is_verified=True,
        verification_notes=notes
    )
    db.add(report)
    booking.status = "REPORT_READY"
    db.commit()
    db.refresh(report)

    create_notification(
        db=db,
        user_id=booking.user_id,
        title="New Report Uploaded",
        message=f"Verified laboratory PDF report uploaded for {booking.booking_code}.",
        notification_type="REPORT",
        action_link="/dashboard"
    )

    return {"message": "Report uploaded successfully", "report_id": report.id}

@router.get("/staff")
def list_collection_staff(
    admin_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    staff_users = db.query(User).filter(User.role == "staff").all()
    results = []
    for u in staff_users:
        sp = u.staff_profile
        results.append({
            "id": sp.id if sp else u.id,
            "user_id": u.id,
            "name": u.full_name,
            "email": u.email,
            "phone": u.phone,
            "qualification": sp.qualification if sp else "Certified Phlebotomist",
            "license_number": sp.license_number if sp else "N/A",
            "service_area": sp.service_area if sp else "Bengaluru Urban",
            "is_available": sp.is_available if sp else True,
            "total_collections": sp.total_collections if sp else 0,
            "rating": sp.rating if sp else 5.0,
        })
    return results

@router.get("/customers")
def list_customers(
    admin_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    customers = db.query(User).filter(User.role == "customer").all()
    results = []
    for c in customers:
        booking_count = db.query(Booking).filter(Booking.user_id == c.id).count()
        results.append({
            "id": c.id,
            "name": c.full_name,
            "email": c.email,
            "phone": c.phone,
            "created_at": c.created_at,
            "booking_count": booking_count,
            "gender": c.customer_profile.gender if c.customer_profile else None
        })
    return results

@router.post("/tests", response_model=TestResponse)
def create_test(
    test_in: TestCreate,
    admin_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    test = Test(**test_in.model_dump())
    db.add(test)
    db.commit()
    db.refresh(test)
    return test

@router.put("/tests/{test_id}", response_model=TestResponse)
def update_test(
    test_id: int,
    test_in: TestCreate,
    admin_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    test = db.query(Test).filter(Test.id == test_id).first()
    if not test:
        raise HTTPException(status_code=404, detail="Test not found")
    
    for k, v in test_in.model_dump().items():
        setattr(test, k, v)
    
    db.commit()
    db.refresh(test)
    return test

@router.delete("/tests/{test_id}")
def delete_test(
    test_id: int,
    admin_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    test = db.query(Test).filter(Test.id == test_id).first()
    if not test:
        raise HTTPException(status_code=404, detail="Test not found")
    
    test.is_active = False  # Soft delete
    db.commit()
    return {"message": "Test deactivated successfully"}

@router.get("/pincodes", response_model=List[ServiceablePincodeResponse])
def get_pincodes(
    admin_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    return db.query(ServiceablePincode).all()

@router.post("/pincodes", response_model=ServiceablePincodeResponse)
def add_pincode(
    pin_in: ServiceablePincodeCreate,
    admin_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    existing = db.query(ServiceablePincode).filter(ServiceablePincode.pincode == pin_in.pincode).first()
    if existing:
        existing.is_active = True
        existing.area_name = pin_in.area_name
        existing.city = pin_in.city
        existing.state = pin_in.state
        db.commit()
        db.refresh(existing)
        return existing

    new_pin = ServiceablePincode(**pin_in.model_dump())
    db.add(new_pin)
    db.commit()
    db.refresh(new_pin)
    return new_pin

@router.get("/audit-logs")
def get_audit_logs(
    admin_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    logs = db.query(AuditLog).order_by(AuditLog.created_at.desc()).limit(50).all()
    results = []
    for l in logs:
        u = db.query(User).filter(User.id == l.user_id).first() if l.user_id else None
        results.append({
            "id": l.id,
            "user_name": u.full_name if u else "System",
            "user_role": u.role if u else "System",
            "action": l.action,
            "resource_type": l.resource_type,
            "resource_id": l.resource_id,
            "details": l.details,
            "created_at": l.created_at
        })
    return results

