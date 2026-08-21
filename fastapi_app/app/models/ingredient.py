from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime
from app.database import Base

class Ingredient(Base):
    __tablename__ = "ingredients"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(100), unique=True, nullable=False, index=True)
    category = Column(String(50), nullable=False)
    comedogenic_rating = Column(Integer, default=0)
    target_skin_types = Column(String(150), nullable=True)
    target_concerns = Column(String(255), nullable=True)
    description = Column(Text, nullable=True)
    benefits = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class IngredientConflict(Base):
    __tablename__ = "ingredient_conflicts"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    ingredient_a = Column(String(100), nullable=False)
    ingredient_b = Column(String(100), nullable=False)
    severity = Column(String(30), nullable=False)
    warning_message = Column(Text, nullable=False)
    recommendation = Column(Text, nullable=True)
