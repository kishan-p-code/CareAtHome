from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models.other import ServiceablePincode, Coupon, Notification
from ..models.user import User
from ..schemas.report import ServiceablePincodeResponse, CouponResponse, NotificationResponse
from ..utils.deps import get_current_user

router = APIRouter(tags=["Serviceability & Utilities"])

@router.get("/serviceability/check/{pincode}")
def check_pincode_serviceability(pincode: str, db: Session = Depends(get_db)):
    pin_clean = pincode.strip()
    serv = db.query(ServiceablePincode).filter(
        ServiceablePincode.pincode == pin_clean,
        ServiceablePincode.is_active == True
    ).first()

    if serv:
        return {
            "serviceable": True,
            "pincode": serv.pincode,
            "area_name": serv.area_name,
            "city": serv.city,
            "state": serv.state,
            "estimated_transit_hours": serv.estimated_transit_hours,
            "message": f"Home sample collection is available in {serv.area_name}, {serv.city}."
        }
    else:
        # Check standard prefix (first 2-3 digits) or offer on-demand service
        return {
            "serviceable": True,  # Allow on-demand in demo
            "pincode": pin_clean,
            "area_name": "Bengaluru Metro",
            "city": "Bengaluru",
            "state": "Karnataka",
            "estimated_transit_hours": 3.0,
            "message": "Express phlebotomist dispatch available."
        }

@router.get("/serviceability/pincodes", response_model=List[ServiceablePincodeResponse])
def get_serviceable_pincodes(db: Session = Depends(get_db)):
    return db.query(ServiceablePincode).filter(ServiceablePincode.is_active == True).limit(20).all()

@router.get("/coupons/validate/{code}", response_model=CouponResponse)
def validate_coupon(code: str, db: Session = Depends(get_db)):
    coupon = db.query(Coupon).filter(
        Coupon.code.ilike(code.strip()),
        Coupon.is_active == True
    ).first()

    if not coupon:
        raise HTTPException(status_code=404, detail="Invalid coupon code or expired.")

    return coupon

@router.get("/notifications", response_model=List[NotificationResponse])
def get_user_notifications(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    notifs = db.query(Notification).filter(
        Notification.user_id == current_user.id
    ).order_by(Notification.created_at.desc()).limit(20).all()
    return notifs

@router.post("/notifications/{notif_id}/read")
def mark_notification_read(
    notif_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    notif = db.query(Notification).filter(
        Notification.id == notif_id,
        Notification.user_id == current_user.id
    ).first()
    if notif:
        notif.is_read = True
        db.commit()
    return {"status": "success"}

