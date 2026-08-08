from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import User, RoleName, SkinAssessment, ConsultantNote, Appointment
from ..schemas import AssessmentOut, ConsultantNoteIn, UserOut
from ..auth import require_roles

router = APIRouter(prefix="/api/consultant", tags=["consultant"])
consultant_only = require_roles(RoleName.consultant, RoleName.admin)


@router.get("/assigned-users", response_model=list[UserOut])
def assigned_users(
    current_user: User = Depends(consultant_only),
    db: Session = Depends(get_db),
):
    """Users who have booked (or been booked for) an appointment with this consultant."""
    appts = db.query(Appointment).filter(
        Appointment.provider_id == current_user.id,
        Appointment.provider_role == RoleName.consultant,
    ).all()
    user_ids = {a.user_id for a in appts}
    if not user_ids:
        return []
    return db.query(User).filter(User.id.in_(user_ids)).all()


@router.get("/reports/{user_id}", response_model=list[AssessmentOut])
def view_ai_reports(
    user_id: str,
    current_user: User = Depends(consultant_only),
    db: Session = Depends(get_db),
):
    return (
        db.query(SkinAssessment)
        .filter(SkinAssessment.user_id == user_id)
        .order_by(SkinAssessment.created_at.desc())
        .all()
    )


@router.post("/notes", status_code=201)
def add_note(
    payload: ConsultantNoteIn,
    current_user: User = Depends(consultant_only),
    db: Session = Depends(get_db),
):
    note = ConsultantNote(consultant_id=current_user.id, **payload.dict())
    db.add(note)

    if payload.assessment_id:
        assessment = db.query(SkinAssessment).filter(SkinAssessment.id == payload.assessment_id).first()
        if assessment:
            assessment.status = "consultant_reviewed"

    db.commit()
    db.refresh(note)
    return {
        "id": note.id,
        "consultant_id": note.consultant_id,
        "user_id": note.user_id,
        "assessment_id": note.assessment_id,
        "note": note.note,
        "created_at": note.created_at,
    }


@router.get("/notes/{user_id}")
def list_notes(
    user_id: str,
    current_user: User = Depends(consultant_only),
    db: Session = Depends(get_db),
):
    notes = db.query(ConsultantNote).filter(ConsultantNote.user_id == user_id).order_by(
        ConsultantNote.created_at.desc()
    ).all()
    return [
        {
            "id": n.id, "consultant_id": n.consultant_id, "user_id": n.user_id,
            "assessment_id": n.assessment_id, "note": n.note, "created_at": n.created_at,
        }
        for n in notes
    ]
