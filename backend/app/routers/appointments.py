from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import User, Appointment, RoleName, Notification
from ..schemas import AppointmentIn, AppointmentOut, AppointmentStatusUpdate
from ..auth import get_current_user

router = APIRouter(prefix="/api/appointments", tags=["appointments"])


@router.post("", response_model=AppointmentOut, status_code=201)
def book_appointment(
    payload: AppointmentIn,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    provider = db.query(User).filter(User.id == payload.provider_id).first()
    if not provider or provider.role != payload.provider_role:
        raise HTTPException(status_code=400, detail="Provider not found for the given role")

    appt = Appointment(
        user_id=current_user.id,
        provider_id=payload.provider_id,
        provider_role=payload.provider_role,
        scheduled_at=payload.scheduled_at,
        notes=payload.notes,
        status="requested",
    )
    db.add(appt)
    db.add(Notification(
        user_id=provider.id,
        message=f"New appointment request from {current_user.full_name}",
    ))
    db.commit()
    db.refresh(appt)
    return appt


@router.get("", response_model=list[AppointmentOut])
def list_appointments(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.role == RoleName.user:
        query = db.query(Appointment).filter(Appointment.user_id == current_user.id)
    elif current_user.role in (RoleName.consultant, RoleName.dermatologist):
        query = db.query(Appointment).filter(Appointment.provider_id == current_user.id)
    else:  # admin
        query = db.query(Appointment)
    return query.order_by(Appointment.scheduled_at.desc()).all()


@router.put("/{appointment_id}", response_model=AppointmentOut)
def update_appointment_status(
    appointment_id: str,
    payload: AppointmentStatusUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    appt = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    if not appt:
        raise HTTPException(status_code=404, detail="Appointment not found")
    if current_user.id not in (appt.user_id, appt.provider_id) and current_user.role != RoleName.admin:
        raise HTTPException(status_code=403, detail="Not authorized")

    appt.status = payload.status
    db.commit()
    db.refresh(appt)
    return appt


@router.delete("/{appointment_id}", status_code=204)
def cancel_appointment(
    appointment_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    appt = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    if appt and (appt.user_id == current_user.id or current_user.role == RoleName.admin):
        db.delete(appt)
        db.commit()
    return None
