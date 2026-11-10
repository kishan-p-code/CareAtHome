from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime
from ..database import get_db
from ..models.user import User
from ..models.booking import Booking
from ..models.payment import Payment
from ..models.other import AuditLog
from ..schemas.payment import CreateOrderRequest, CreateOrderResponse, VerifyPaymentRequest, PaymentResponse, RefundRequest
from ..utils.deps import get_current_user, require_admin
from ..services.razorpay_service import razorpay_service
from ..services.notification_service import create_notification
from ..config import settings

router = APIRouter(prefix="/payments", tags=["Payments"])

@router.post("/create-order", response_model=CreateOrderResponse)
def create_payment_order(
    req: CreateOrderRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    booking = db.query(Booking).filter(
        Booking.id == req.booking_id,
        Booking.user_id == current_user.id
    ).first()

    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    # Generate order
    order_data = razorpay_service.create_order(
        amount_inr=booking.total_amount,
        receipt=booking.booking_code,
        notes={
            "booking_id": booking.id,
            "patient_name": booking.patient_name,
            "patient_phone": booking.patient_phone
        }
    )

    # Save payment initiation
    payment = db.query(Payment).filter(Payment.booking_id == booking.id).first()
    if not payment:
        payment = Payment(
            booking_id=booking.id,
            user_id=current_user.id,
            razorpay_order_id=order_data["id"],
            amount=booking.total_amount,
            status="CREATED"
        )
        db.add(payment)
    else:
        payment.razorpay_order_id = order_data["id"]
        payment.amount = booking.total_amount
        payment.status = "CREATED"

    db.commit()

    return {
        "order_id": order_data["id"],
        "amount": booking.total_amount,
        "amount_subunits": order_data["amount"],
        "currency": "INR",
        "key_id": settings.RAZORPAY_KEY_ID,
        "booking_code": booking.booking_code,
        "patient_name": booking.patient_name,
        "patient_phone": booking.patient_phone,
        "patient_email": booking.patient_email or current_user.email
    }

@router.post("/verify")
def verify_payment(
    req: VerifyPaymentRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    booking = db.query(Booking).filter(Booking.id == req.booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    is_valid = razorpay_service.verify_payment_signature(
        razorpay_order_id=req.razorpay_order_id,
        razorpay_payment_id=req.razorpay_payment_id,
        razorpay_signature=req.razorpay_signature
    )

    if not is_valid:
        raise HTTPException(status_code=400, detail="Invalid payment verification signature.")

    payment = db.query(Payment).filter(Payment.booking_id == booking.id).first()
    if not payment:
        payment = Payment(
            booking_id=booking.id,
            user_id=current_user.id,
            razorpay_order_id=req.razorpay_order_id,
            razorpay_payment_id=req.razorpay_payment_id,
            razorpay_signature=req.razorpay_signature,
            amount=booking.total_amount,
            status="SUCCESS",
            payment_method=req.payment_method or "UPI"
        )
        db.add(payment)
    else:
        payment.razorpay_payment_id = req.razorpay_payment_id
        payment.razorpay_signature = req.razorpay_signature
        payment.status = "SUCCESS"
        payment.payment_method = req.payment_method or "UPI"

    # Set booking to confirmed if it was pending
    if booking.status in ["PENDING"]:
        booking.status = "CONFIRMED"

    db.commit()

    create_notification(
        db=db,
        user_id=booking.user_id,
        title="Payment Successful (₹" + str(int(booking.total_amount)) + ")",
        message=f"Payment received for booking {booking.booking_code}. Reference: {req.razorpay_payment_id}.",
        notification_type="PAYMENT",
        action_link=f"/dashboard"
    )

    audit = AuditLog(
        user_id=current_user.id,
        action="PAYMENT_VERIFIED",
        resource_type="payment",
        resource_id=req.razorpay_payment_id,
        details=f"Booking: {booking.booking_code}, Amount: ₹{booking.total_amount}"
    )
    db.add(audit)
    db.commit()

    return {
        "status": "SUCCESS",
        "message": "Payment verified successfully",
        "booking_code": booking.booking_code,
        "payment_id": req.razorpay_payment_id
    }

@router.post("/refund")
def process_refund(
    req: RefundRequest,
    admin_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    payment = db.query(Payment).filter(Payment.booking_id == req.booking_id).first()
    if not payment:
        raise HTTPException(status_code=404, detail="Payment record not found")

    refund_amt = req.amount or payment.amount
    payment.status = "REFUNDED"
    payment.refund_amount = refund_amt
    payment.refund_reason = req.reason
    payment.refund_id = f"rfnd_{int(datetime.utcnow().timestamp())}"

    # Update booking status
    booking = db.query(Booking).filter(Booking.id == req.booking_id).first()
    if booking:
        booking.status = "CANCELLED"
        booking.cancellation_reason = f"Refund issued: {req.reason}"

    db.commit()

    audit = AuditLog(
        user_id=admin_user.id,
        action="REFUND_ISSUED",
        resource_type="payment",
        resource_id=payment.refund_id,
        details=f"Booking {booking.booking_code if booking else req.booking_id}, Refund: ₹{refund_amt}, Reason: {req.reason}"
    )
    db.add(audit)
    db.commit()

    return {
        "status": "REFUNDED",
        "refund_id": payment.refund_id,
        "refund_amount": refund_amt,
        "message": "Refund processed successfully"
    }

