from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import or_, and_
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import User, Message, Appointment, RoleName
from ..schemas import MessageIn, MessageOut
from ..auth import get_current_user

router = APIRouter(prefix="/api/messages", tags=["messages"])


def _can_message(current_user: User, other_id: str, db: Session) -> bool:
    """Users may message anyone they share (or shared) an appointment with; staff/admin can message anyone."""
    if current_user.role in (RoleName.admin,):
        return True
    linked = (
        db.query(Appointment)
        .filter(
            or_(
                and_(Appointment.user_id == current_user.id, Appointment.provider_id == other_id),
                and_(Appointment.provider_id == current_user.id, Appointment.user_id == other_id),
            )
        )
        .first()
    )
    return linked is not None


@router.get("/threads")
def list_threads(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Returns the most recent message with each conversation partner."""
    msgs = (
        db.query(Message)
        .filter(or_(Message.sender_id == current_user.id, Message.receiver_id == current_user.id))
        .order_by(Message.created_at.desc())
        .all()
    )
    threads = {}
    for m in msgs:
        other_id = m.receiver_id if m.sender_id == current_user.id else m.sender_id
        if other_id not in threads:
            threads[other_id] = m
    result = []
    for other_id, m in threads.items():
        other = db.query(User).filter(User.id == other_id).first()
        result.append({
            "user_id": other_id,
            "full_name": other.full_name if other else "Unknown",
            "last_message": m.text,
            "created_at": m.created_at,
            "unread": (m.receiver_id == current_user.id and not m.is_read),
        })
    return result


@router.get("/{other_user_id}", response_model=list[MessageOut])
def get_conversation(
    other_user_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    msgs = (
        db.query(Message)
        .filter(
            or_(
                and_(Message.sender_id == current_user.id, Message.receiver_id == other_user_id),
                and_(Message.sender_id == other_user_id, Message.receiver_id == current_user.id),
            )
        )
        .order_by(Message.created_at.asc())
        .all()
    )
    # mark incoming messages as read
    for m in msgs:
        if m.receiver_id == current_user.id and not m.is_read:
            m.is_read = True
    db.commit()
    return msgs


@router.post("", response_model=MessageOut, status_code=201)
def send_message(
    payload: MessageIn,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    receiver = db.query(User).filter(User.id == payload.receiver_id).first()
    if not receiver:
        raise HTTPException(status_code=404, detail="Recipient not found")
    if not _can_message(current_user, payload.receiver_id, db):
        raise HTTPException(status_code=403, detail="You can only message a consultant/dermatologist/user you have an appointment with")

    message = Message(sender_id=current_user.id, receiver_id=payload.receiver_id, text=payload.text)
    db.add(message)
    db.commit()
    db.refresh(message)
    return message
