from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from ..database import get_db
from ..models.user import User, StaffProfile
from ..models.booking import Booking, StaffAssignment
from ..models.other import Notification, AuditLog
from ..schemas.booking import BookingDetailResponse, StaffCollectionUpdateRequest
from ..utils.deps import require_staff
from ..utils.helpers import generate_sample_barcode
from ..services.notification_service import create_notification
from .bookings import _format_booking_response

router = APIRouter(prefix="/staff", tags=["Collection Staff"])

@router.get("/appointments", response_model=List[BookingDetailResponse])
def get_staff_appointments(
    current_staff: User = Depends(require_staff),
    db: Session = Depends(get_db)
):
    profile = db.query(StaffProfile).filter(StaffProfile.user_id == current_staff.id).first()
    if not profile and current_staff.role != "admin":
        raise HTTPException(status_code=403, detail="Staff profile not initialized")

    if current_staff.role == "admin":
        # Admin can view all assigned visits
        assignments = db.query(StaffAssignment).all()
    else:
        assignments = db.query(StaffAssignment).filter(
            StaffAssignment.staff_id == profile.id
        ).all()

    booking_ids = [a.booking_id for a in assignments]
    bookings = db.query(Booking).filter(
        Booking.id.in_(booking_ids)
    ).order_by(Booking.appointment_date.asc(), Booking.appointment_time_slot.asc()).all()

    return [_format_booking_response(b, db) for b in bookings]

@router.post("/appointments/{booking_id}/status")
def update_collection_status(
    booking_id: int,
    req: StaffCollectionUpdateRequest,
    current_staff: User = Depends(require_staff),
    db: Session = Depends(get_db)
):
    profile = db.query(StaffProfile).filter(StaffProfile.user_id == current_staff.id).first()
    
    assignment_query = db.query(StaffAssignment).filter(StaffAssignment.booking_id == booking_id)
    if current_staff.role != "admin" and profile:
        assignment_query = assignment_query.filter(StaffAssignment.staff_id == profile.id)

    assignment = assignment_query.first()
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found or not assigned to you")

    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    new_stage = req.status.upper()

    if new_stage == "EN_ROUTE":
        assignment.status = "EN_ROUTE"
        booking.status = "COLLECTION_IN_PROGRESS"
        create_notification(
            db=db,
            user_id=booking.user_id,
            title="Phlebotomist is En Route",
            message=f"{current_staff.full_name} is on the way to your address for blood sample collection.",
            notification_type="BOOKING",
            action_link=f"/dashboard"
        )

    elif new_stage == "SAMPLE_COLLECTED":
        barcode = req.sample_barcode or generate_sample_barcode()
        assignment.status = "SAMPLE_COLLECTED"
        assignment.sample_barcode = barcode
        assignment.vials_collected = req.vials_collected or 2
        assignment.tube_types = req.tube_types or "EDTA (Purple) + SST (Yellow Gel)"
        assignment.phlebotomist_notes = req.phlebotomist_notes
        booking.status = "SAMPLE_COLLECTED"

        if profile:
            profile.total_collections += 1

        create_notification(
            db=db,
            user_id=booking.user_id,
            title="Sample Collected Successfully",
            message=f"Blood sample collected under barcode {barcode}. It is sealed in temperature-controlled cold storage box.",
            notification_type="BOOKING",
            action_link=f"/dashboard"
        )

    elif new_stage == "DELIVERED_TO_LAB":
        assignment.status = "DELIVERED_TO_LAB"
        assignment.completed_at = datetime.utcnow()
        booking.status = "PROCESSING_AT_LAB"

        create_notification(
            db=db,
            user_id=booking.user_id,
            title="Sample Received at NABL Laboratory",
            message="Your sample has reached our partner diagnostic lab for automated biochemical analysis.",
            notification_type="BOOKING",
            action_link=f"/dashboard"
        )

    elif new_stage == "FAILED":
        assignment.status = "FAILED"
        assignment.failure_reason = req.failure_reason or "Collection attempt unsuccessful"
        booking.status = "CONFIRMED"  # Return to confirmed for reassignment
        create_notification(
            db=db,
            user_id=booking.user_id,
            title="Collection Visit Rescheduled",
            message=f"Visit note: {assignment.failure_reason}. Our operations team will coordinate with you.",
            notification_type="BOOKING",
            action_link=f"/dashboard"
        )

    db.commit()

    audit = AuditLog(
        user_id=current_staff.id,
        action="UPDATE_COLLECTION_STATUS",
        resource_type="booking",
        resource_id=booking.booking_code,
        details=f"Status: {new_stage}, Barcode: {assignment.sample_barcode}"
    )
    db.add(audit)
    db.commit()

    return {
        "status": new_stage,
        "booking_status": booking.status,
        "sample_barcode": assignment.sample_barcode,
        "message": f"Collection status updated to {new_stage}"
    }

@router.get("/profile")
def get_staff_info(
    current_staff: User = Depends(require_staff),
    db: Session = Depends(get_db)
):
    profile = db.query(StaffProfile).filter(StaffProfile.user_id == current_staff.id).first()
    return {
        "user_id": current_staff.id,
        "name": current_staff.full_name,
        "email": current_staff.email,
        "phone": current_staff.phone,
        "qualification": profile.qualification if profile else "DMLT / Certified Phlebotomist",
        "license_number": profile.license_number if profile else "PHL-IND-2024-91",
        "total_collections": profile.total_collections if profile else 142,
        "rating": profile.rating if profile else 4.9,
        "is_available": profile.is_available if profile else True
    }

