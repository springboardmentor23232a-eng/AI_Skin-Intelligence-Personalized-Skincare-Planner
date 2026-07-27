"""
Daily Skincare Checklist.

Turns today's generated routine into individually-checkable items
(one per morning/evening step) and persists completion state per
calendar day, so users can tick off "did this step" rather than
only logging a single yes/no for the whole routine.
"""
from datetime import date

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database import get_db
from app.deps import get_current_user
from app.models.user import User
from app.models.routine import SkincareRoutine
from app.models.checklist import ChecklistEntry

router = APIRouter(prefix="/api/checklist", tags=["Daily Checklist"])


class ToggleRequest(BaseModel):
    step_key: str


def _build_items(routine: SkincareRoutine):
    items = []
    for step in routine.morning_routine or []:
        items.append({"step_key": f"morning-{step['step']}", "period": "Morning", "category": step["category"], "instruction": step["instruction"]})
    for step in routine.evening_routine or []:
        items.append({"step_key": f"evening-{step['step']}", "period": "Evening", "category": step["category"], "instruction": step["instruction"]})
    return items


@router.get("/today")
def get_today_checklist(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    routine = db.query(SkincareRoutine).filter(SkincareRoutine.user_id == current_user.id).first()
    if not routine:
        return {"has_routine": False, "items": []}

    items = _build_items(routine)
    today = date.today()
    existing = {
        e.step_key: e.completed
        for e in db.query(ChecklistEntry).filter(
            ChecklistEntry.user_id == current_user.id, ChecklistEntry.log_date == today
        ).all()
    }
    for item in items:
        item["completed"] = existing.get(item["step_key"], False)

    return {"has_routine": True, "date": str(today), "items": items}


@router.post("/toggle")
def toggle_checklist_item(
    payload: ToggleRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    today = date.today()
    entry = (
        db.query(ChecklistEntry)
        .filter(
            ChecklistEntry.user_id == current_user.id,
            ChecklistEntry.log_date == today,
            ChecklistEntry.step_key == payload.step_key,
        )
        .first()
    )
    if entry:
        entry.completed = not entry.completed
    else:
        entry = ChecklistEntry(user_id=current_user.id, log_date=today, step_key=payload.step_key, completed=True)
        db.add(entry)
    db.commit()
    return {"step_key": payload.step_key, "completed": entry.completed}