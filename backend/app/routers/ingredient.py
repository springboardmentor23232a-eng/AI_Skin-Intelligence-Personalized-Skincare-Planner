from typing import List

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.deps import get_current_user, require_roles
from app.models.user import User, UserRole
from app.models.ingredient import Ingredient
from app.schemas.product import IngredientOut

router = APIRouter(prefix="/api/ingredients", tags=["Ingredient Intelligence"])


@router.get("", response_model=List[IngredientOut])
def list_ingredients(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(Ingredient).all()


@router.post("", response_model=IngredientOut, dependencies=[Depends(require_roles(UserRole.admin))])
def create_ingredient(payload: IngredientOut, db: Session = Depends(get_db)):
    ingredient = Ingredient(**payload.dict(exclude={"id"}))
    db.add(ingredient)
    db.commit()
    db.refresh(ingredient)
    return ingredient
