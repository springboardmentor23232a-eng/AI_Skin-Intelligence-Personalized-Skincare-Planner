from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import User, RoleName, SkinAssessment, DermatologistNote, Appointment
from ..schemas import AssessmentOut, DermatologistNoteIn, UserOut
from ..auth import require_roles

router = APIRouter(prefix="/api/dermatologist", tags=["dermatologist"])
dermatologist_only = require_roles(RoleName.dermatologist, RoleName.admin)


@router.get("/assigned-patients", response_model=list[UserOut])
def assigned_patients(
    current_user: User = Depends(dermatologist_only),
    db: Session = Depends(get_db),
):
    appts = db.query(Appointment).filter(
        Appointment.provider_id == current_user.id,
        Appointment.provider_role == RoleName.dermatologist,
    ).all()
    user_ids = {a.user_id for a in appts}
    if not user_ids:
        return []
    return db.query(User).filter(User.id.in_(user_ids)).all()


@router.get("/predictions/{user_id}", response_model=list[AssessmentOut])
def ai_prediction_review(
    user_id: str,
    current_user: User = Depends(dermatologist_only),
    db: Session = Depends(get_db),
):
    return (
        db.query(SkinAssessment)
        .filter(SkinAssessment.user_id == user_id)
        .order_by(SkinAssessment.created_at.desc())
        .all()
    )


@router.post("/diagnosis", status_code=201)
def add_diagnosis(
    payload: DermatologistNoteIn,
    current_user: User = Depends(dermatologist_only),
    db: Session = Depends(get_db),
):
    note = DermatologistNote(dermatologist_id=current_user.id, **payload.dict())
    db.add(note)

    if payload.assessment_id:
        assessment = db.query(SkinAssessment).filter(SkinAssessment.id == payload.assessment_id).first()
        if assessment:
            assessment.status = "dermatologist_reviewed"

    db.commit()
    db.refresh(note)
    return {
        "id": note.id,
        "dermatologist_id": note.dermatologist_id,
        "user_id": note.user_id,
        "assessment_id": note.assessment_id,
        "diagnosis": note.diagnosis,
        "prescription": note.prescription,
        "treatment_plan": note.treatment_plan,
        "follow_up_date": note.follow_up_date,
        "created_at": note.created_at,
    }


@router.get("/patient-history/{user_id}")
def patient_history(
    user_id: str,
    current_user: User = Depends(dermatologist_only),
    db: Session = Depends(get_db),
):
    notes = db.query(DermatologistNote).filter(DermatologistNote.user_id == user_id).order_by(
        DermatologistNote.created_at.desc()
    ).all()
    return [
        {
            "id": n.id, "dermatologist_id": n.dermatologist_id, "user_id": n.user_id,
            "assessment_id": n.assessment_id, "diagnosis": n.diagnosis,
            "prescription": n.prescription, "treatment_plan": n.treatment_plan,
            "follow_up_date": n.follow_up_date, "created_at": n.created_at,
        }
        for n in notes
    ]
