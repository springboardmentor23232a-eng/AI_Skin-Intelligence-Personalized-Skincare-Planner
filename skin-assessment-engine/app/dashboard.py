from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from .auth import get_current_user
from .database import get_db
from . import models


router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"]
)


@router.get("/user")
def user_dashboard(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):

    user = db.query(models.User).filter(
        models.User.id == current_user["id"]
    ).first()


    return {
        "message": "User Dashboard Data",
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role
        }
    }