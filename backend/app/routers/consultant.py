from typing import List
from uuid import UUID
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.deps import get_current_user

from app.models.user import User, UserRole
from app.models.appointment import Appointment
from app.models.notification import Notification

from app.schemas.appointment import (
    AppointmentCreate,
    AppointmentOut,
    AppointmentStatusUpdate,
    AppointmentWithUsersOut,
)


router = APIRouter(
    prefix="/api/consultant",
    tags=["Consultation"],
)


# =========================================================
# NOTIFICATION HELPER
# =========================================================

def create_notification(
    db: Session,
    user_id,
    notification_type: str,
    message: str,
):
    notification = Notification(
        user_id=user_id,
        type=notification_type,
        message=message,
        is_read=False,
    )

    db.add(notification)


# =========================================================
# DERMATOLOGISTS
# =========================================================

@router.get("/dermatologists")
def get_dermatologists(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    dermatologists = (
        db.query(User)
        .filter(
            User.role == UserRole.dermatologist,
            User.is_active == True,
        )
        .order_by(User.full_name.asc())
        .all()
    )

    return [
        {
            "id": str(doctor.id),
            "name": doctor.full_name,
            "email": doctor.email,
            "role": "dermatologist",
        }
        for doctor in dermatologists
    ]


# =========================================================
# CONSULTANTS
# =========================================================

@router.get("/consultants")
def get_consultants(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    consultants = (
        db.query(User)
        .filter(
            User.role == UserRole.consultant,
            User.is_active == True,
        )
        .order_by(User.full_name.asc())
        .all()
    )

    return [
        {
            "id": str(consultant.id),
            "name": consultant.full_name,
            "email": consultant.email,
            "role": "consultant",
        }
        for consultant in consultants
    ]


# =========================================================
# CREATE APPOINTMENT
# =========================================================

@router.post(
    "/appointments",
    response_model=AppointmentOut,
)
def create_appointment(
    payload: AppointmentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    # -----------------------------------------------------
    # ONLY PATIENTS CAN BOOK
    # -----------------------------------------------------

    if current_user.role != UserRole.user:
        raise HTTPException(
            status_code=403,
            detail="Only patients can book appointments.",
        )


    # -----------------------------------------------------
    # EXACTLY ONE PROVIDER
    # -----------------------------------------------------

    if (
        payload.dermatologist_id
        and payload.consultant_id
    ):
        raise HTTPException(
            status_code=400,
            detail=(
                "Select either a dermatologist "
                "or a consultant, not both."
            ),
        )

    if (
        not payload.dermatologist_id
        and not payload.consultant_id
    ):
        raise HTTPException(
            status_code=400,
            detail=(
                "Please select a dermatologist "
                "or consultant."
            ),
        )


    # -----------------------------------------------------
    # VERIFY PROVIDER
    # -----------------------------------------------------

    dermatologist = None
    consultant = None


    # -----------------------------------------------------
    # DERMATOLOGIST
    # -----------------------------------------------------

    if payload.dermatologist_id:

        dermatologist = (
            db.query(User)
            .filter(
                User.id == payload.dermatologist_id,
                User.role == UserRole.dermatologist,
                User.is_active == True,
            )
            .first()
        )

        if not dermatologist:
            raise HTTPException(
                status_code=404,
                detail="Dermatologist not found.",
            )


    # -----------------------------------------------------
    # CONSULTANT
    # -----------------------------------------------------

    elif payload.consultant_id:

        consultant = (
            db.query(User)
            .filter(
                User.id == payload.consultant_id,
                User.role == UserRole.consultant,
                User.is_active == True,
            )
            .first()
        )

        if not consultant:
            raise HTTPException(
                status_code=404,
                detail="Skincare consultant not found.",
            )


    # -----------------------------------------------------
    # FUTURE DATE CHECK
    # -----------------------------------------------------

    if payload.appointment_date <= datetime.utcnow():

        raise HTTPException(
            status_code=400,
            detail=(
                "Appointment date and time "
                "must be in the future."
            ),
        )


    # -----------------------------------------------------
    # CHECK PROVIDER SLOT
    # -----------------------------------------------------

    slot_query = (
        db.query(Appointment)
        .filter(
            Appointment.appointment_date
            == payload.appointment_date,

            Appointment.status.in_(
                ["pending", "accepted"]
            ),
        )
    )


    # Dermatologist appointment checks
    # only dermatologist slots

    if payload.dermatologist_id:

        slot_query = slot_query.filter(
            Appointment.dermatologist_id
            == payload.dermatologist_id
        )

    # Consultant appointment checks
    # only consultant slots

    else:

        slot_query = slot_query.filter(
            Appointment.consultant_id
            == payload.consultant_id
        )


    existing = slot_query.first()


    if existing:

        raise HTTPException(
            status_code=409,
            detail=(
                "This appointment slot "
                "is already booked."
            ),
        )


    # -----------------------------------------------------
    # CREATE APPOINTMENT
    # -----------------------------------------------------

    appointment = Appointment(
        patient_id=current_user.id,

        dermatologist_id=
            payload.dermatologist_id,

        consultant_id=
            payload.consultant_id,

        appointment_date=
            payload.appointment_date,

        consultation_type=
            payload.consultation_type,

        reason=
            payload.reason,

        status="pending",
    )


    db.add(appointment)


    # -----------------------------------------------------
    # REAL NOTIFICATION
    # -----------------------------------------------------
    # Notify the selected dermatologist
    # or consultant immediately after booking.

    provider = (
        dermatologist
        if dermatologist
        else consultant
    )


    if provider:

        provider_type = (
            "Dermatologist"
            if dermatologist
            else "Skincare Consultant"
        )


        appointment_time = (
            payload.appointment_date.strftime(
                "%d %b %Y at %I:%M %p"
            )
        )


        message = (
            f"New appointment request from "
            f"{current_user.full_name}. "
            f"Appointment scheduled for "
            f"{appointment_time} "
            f"with you as {provider_type}."
        )


        create_notification(
            db=db,
            user_id=provider.id,
            notification_type=
                "appointment_request",
            message=message,
        )


    # -----------------------------------------------------
    # SAVE APPOINTMENT + NOTIFICATION
    # -----------------------------------------------------

    db.commit()

    db.refresh(appointment)

    return appointment


# =========================================================
# PATIENT APPOINTMENTS
# =========================================================

@router.get(
    "/appointments/my",
    response_model=List[AppointmentWithUsersOut],
)
def get_my_appointments(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    appointments = (
        db.query(Appointment)
        .filter(
            Appointment.patient_id
            == current_user.id
        )
        .order_by(
            Appointment.appointment_date.desc()
        )
        .all()
    )


    result = []


    for appointment in appointments:

        patient = current_user

        dermatologist = None
        consultant = None


        # -------------------------------------------------
        # GET DERMATOLOGIST
        # -------------------------------------------------

        if appointment.dermatologist_id:

            dermatologist = (
                db.query(User)
                .filter(
                    User.id
                    == appointment.dermatologist_id
                )
                .first()
            )


        # -------------------------------------------------
        # GET CONSULTANT
        # -------------------------------------------------

        if appointment.consultant_id:

            consultant = (
                db.query(User)
                .filter(
                    User.id
                    == appointment.consultant_id
                )
                .first()
            )


        result.append(
            {
                "id": appointment.id,

                "patient_id":
                    appointment.patient_id,

                "dermatologist_id":
                    appointment.dermatologist_id,

                "consultant_id":
                    appointment.consultant_id,

                "appointment_date":
                    appointment.appointment_date,

                "consultation_type":
                    appointment.consultation_type,

                "reason":
                    appointment.reason,

                "status":
                    appointment.status,

                "created_at":
                    appointment.created_at,

                "updated_at":
                    appointment.updated_at,

                "patient_name":
                    patient.full_name,

                "patient_email":
                    patient.email,

                "dermatologist_name": (
                    dermatologist.full_name
                    if dermatologist
                    else None
                ),

                "dermatologist_email": (
                    dermatologist.email
                    if dermatologist
                    else None
                ),

                "consultant_name": (
                    consultant.full_name
                    if consultant
                    else None
                ),

                "consultant_email": (
                    consultant.email
                    if consultant
                    else None
                ),
            }
        )


    return result


# =========================================================
# PROVIDER APPOINTMENTS
# =========================================================

@router.get(
    "/appointments/provider",
    response_model=List[AppointmentWithUsersOut],
)
def get_provider_appointments(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    # -----------------------------------------------------
    # PROVIDER ACCESS
    # -----------------------------------------------------

    if current_user.role not in [
        UserRole.dermatologist,
        UserRole.consultant,
        UserRole.admin,
    ]:

        raise HTTPException(
            status_code=403,
            detail="Provider access required.",
        )


    query = db.query(Appointment)


    # -----------------------------------------------------
    # DERMATOLOGIST
    # -----------------------------------------------------

    if (
        current_user.role
        == UserRole.dermatologist
    ):

        query = query.filter(
            Appointment.dermatologist_id
            == current_user.id
        )


    # -----------------------------------------------------
    # CONSULTANT
    # -----------------------------------------------------

    elif (
        current_user.role
        == UserRole.consultant
    ):

        query = query.filter(
            Appointment.consultant_id
            == current_user.id
        )


    # -----------------------------------------------------
    # ADMIN
    # -----------------------------------------------------

    elif current_user.role == UserRole.admin:

        # Admin can see all appointments.
        pass


    # -----------------------------------------------------
    # GET APPOINTMENTS
    # -----------------------------------------------------

    appointments = (
        query
        .order_by(
            Appointment.appointment_date.asc()
        )
        .all()
    )


    result = []


    for appointment in appointments:

        patient = (
            db.query(User)
            .filter(
                User.id
                == appointment.patient_id
            )
            .first()
        )


        dermatologist = None
        consultant = None


        # -------------------------------------------------
        # GET DERMATOLOGIST
        # -------------------------------------------------

        if appointment.dermatologist_id:

            dermatologist = (
                db.query(User)
                .filter(
                    User.id
                    == appointment.dermatologist_id
                )
                .first()
            )


        # -------------------------------------------------
        # GET CONSULTANT
        # -------------------------------------------------

        if appointment.consultant_id:

            consultant = (
                db.query(User)
                .filter(
                    User.id
                    == appointment.consultant_id
                )
                .first()
            )


        result.append(
            {
                "id": appointment.id,

                "patient_id":
                    appointment.patient_id,

                "dermatologist_id":
                    appointment.dermatologist_id,

                "consultant_id":
                    appointment.consultant_id,

                "appointment_date":
                    appointment.appointment_date,

                "consultation_type":
                    appointment.consultation_type,

                "reason":
                    appointment.reason,

                "status":
                    appointment.status,

                "created_at":
                    appointment.created_at,

                "updated_at":
                    appointment.updated_at,

                "patient_name": (
                    patient.full_name
                    if patient
                    else None
                ),

                "patient_email": (
                    patient.email
                    if patient
                    else None
                ),

                "dermatologist_name": (
                    dermatologist.full_name
                    if dermatologist
                    else None
                ),

                "dermatologist_email": (
                    dermatologist.email
                    if dermatologist
                    else None
                ),

                "consultant_name": (
                    consultant.full_name
                    if consultant
                    else None
                ),

                "consultant_email": (
                    consultant.email
                    if consultant
                    else None
                ),
            }
        )


    return result


# =========================================================
# UPDATE APPOINTMENT STATUS
# =========================================================

@router.put(
    "/appointments/{appointment_id}/status",
    response_model=AppointmentOut,
)
def update_appointment_status(
    appointment_id: UUID,
    payload: AppointmentStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    # -----------------------------------------------------
    # FIND APPOINTMENT
    # -----------------------------------------------------

    appointment = (
        db.query(Appointment)
        .filter(
            Appointment.id
            == appointment_id
        )
        .first()
    )


    if not appointment:

        raise HTTPException(
            status_code=404,
            detail="Appointment not found.",
        )


    # -----------------------------------------------------
    # ALLOWED STATUSES
    # -----------------------------------------------------

    allowed_statuses = [
        "pending",
        "accepted",
        "completed",
        "cancelled",
    ]


    if payload.status not in allowed_statuses:

        raise HTTPException(
            status_code=400,
            detail=(
                "Invalid appointment status."
            ),
        )


    # Store old status so we can determine
    # whether a real change happened.

    old_status = appointment.status


    # -----------------------------------------------------
    # DERMATOLOGIST
    # -----------------------------------------------------

    if (
        current_user.role
        == UserRole.dermatologist
    ):

        if (
            appointment.dermatologist_id
            != current_user.id
        ):

            raise HTTPException(
                status_code=403,
                detail=(
                    "You cannot modify "
                    "this appointment."
                ),
            )


        appointment.status = payload.status


    # -----------------------------------------------------
    # CONSULTANT
    # -----------------------------------------------------

    elif (
        current_user.role
        == UserRole.consultant
    ):

        if (
            appointment.consultant_id
            != current_user.id
        ):

            raise HTTPException(
                status_code=403,
                detail=(
                    "You cannot modify "
                    "this appointment."
                ),
            )


        appointment.status = payload.status


    # -----------------------------------------------------
    # ADMIN
    # -----------------------------------------------------

    elif current_user.role == UserRole.admin:

        appointment.status = payload.status


    # -----------------------------------------------------
    # PATIENT
    # -----------------------------------------------------

    elif current_user.role == UserRole.user:

        if (
            appointment.patient_id
            != current_user.id
        ):

            raise HTTPException(
                status_code=403,
                detail=(
                    "You cannot modify "
                    "this appointment."
                ),
            )


        if payload.status != "cancelled":

            raise HTTPException(
                status_code=403,
                detail=(
                    "Patients can only "
                    "cancel appointments."
                ),
            )


        appointment.status = "cancelled"


    # -----------------------------------------------------
    # OTHER ROLES
    # -----------------------------------------------------

    else:

        raise HTTPException(
            status_code=403,
            detail="You do not have permission.",
        )


    # =====================================================
    # REAL NOTIFICATIONS
    # =====================================================

    # Only create a notification if the status
    # actually changed.

    if old_status != payload.status:


        # =================================================
        # PROVIDER -> PATIENT
        # =================================================

        if current_user.role in [
            UserRole.dermatologist,
            UserRole.consultant,
            UserRole.admin,
        ]:

            patient = (
                db.query(User)
                .filter(
                    User.id
                    == appointment.patient_id
                )
                .first()
            )


            if patient:

                provider_name = (
                    current_user.full_name
                )


                # -----------------------------------------
                # ACCEPTED
                # -----------------------------------------

                if payload.status == "accepted":

                    message = (
                        f"Your appointment with "
                        f"{provider_name} has been "
                        f"accepted for "
                        f"{appointment.appointment_date.strftime('%d %b %Y at %I:%M %p')}."
                    )


                # -----------------------------------------
                # COMPLETED
                # -----------------------------------------

                elif payload.status == "completed":

                    message = (
                        f"Your appointment with "
                        f"{provider_name} has been "
                        f"completed."
                    )


                # -----------------------------------------
                # CANCELLED
                # -----------------------------------------

                elif payload.status == "cancelled":

                    message = (
                        f"Your appointment with "
                        f"{provider_name} has been "
                        f"cancelled."
                    )


                # -----------------------------------------
                # PENDING
                # -----------------------------------------

                elif payload.status == "pending":

                    message = (
                        f"Your appointment with "
                        f"{provider_name} is now "
                        f"pending."
                    )


                # -----------------------------------------
                # OTHER
                # -----------------------------------------

                else:

                    message = (
                        f"Your appointment with "
                        f"{provider_name} is now "
                        f"{payload.status}."
                    )


                create_notification(
                    db=db,
                    user_id=patient.id,
                    notification_type=
                        "appointment_update",
                    message=message,
                )


        # =================================================
        # PATIENT -> PROVIDER
        # =================================================

        elif current_user.role == UserRole.user:

            provider_id = None


            if appointment.dermatologist_id:

                provider_id = (
                    appointment.dermatologist_id
                )

            elif appointment.consultant_id:

                provider_id = (
                    appointment.consultant_id
                )


            if provider_id:

                message = (
                    f"{current_user.full_name} "
                    f"cancelled the appointment "
                    f"scheduled for "
                    f"{appointment.appointment_date.strftime('%d %b %Y at %I:%M %p')}."
                )


                create_notification(
                    db=db,
                    user_id=provider_id,
                    notification_type=
                        "appointment_cancelled",
                    message=message,
                )


    # =====================================================
    # SAVE EVERYTHING
    # =====================================================

    db.commit()

    db.refresh(appointment)

    return appointment