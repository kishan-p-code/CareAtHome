from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from typing import List
import os
from ..database import get_db
from ..models.user import User
from ..models.report import Report
from ..models.booking import Booking
from ..schemas.report import ReportResponse
from ..utils.deps import get_current_user
from ..config import settings

router = APIRouter(prefix="/reports", tags=["Reports"])

@router.get("/booking/{booking_id}", response_model=List[ReportResponse])
def get_reports_for_booking(
    booking_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    if current_user.role != "admin" and current_user.role != "staff" and booking.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Unauthorized access to reports")

    reports = db.query(Report).filter(Report.booking_id == booking_id).all()
    return reports

@router.get("/{report_id}/download")
def download_report(
    report_id: int,
    token: str = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    report = db.query(Report).filter(Report.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report record not found")

    # Access control
    if current_user.role != "admin" and current_user.role != "staff" and report.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Unauthorized access to this diagnostic report")

    if not os.path.exists(report.file_path):
        raise HTTPException(status_code=404, detail="Physical PDF report file not found on server")

    # Increment download counter
    report.download_count += 1
    db.commit()

    return FileResponse(
        path=report.file_path,
        media_type="application/pdf",
        filename=report.file_name,
        headers={
            "Content-Disposition": f'inline; filename="{report.file_name}"'
        }
    )

