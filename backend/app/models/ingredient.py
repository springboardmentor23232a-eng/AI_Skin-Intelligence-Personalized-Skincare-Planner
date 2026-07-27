import uuid

from sqlalchemy import Column, String, ARRAY, Text
from sqlalchemy.dialects.postgresql import UUID

from app.database import Base


class Ingredient(Base):
    __tablename__ = "ingredients"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, unique=True, nullable=False)
    category = Column(String)  # retinoid, niacinamide, vitamin_c, hyaluronic_acid, salicylic_acid...
    good_for = Column(ARRAY(String), default=list)      # concerns it helps with
    avoid_if = Column(ARRAY(String), default=list)       # sensitivities/allergies/skin types to avoid
    interacts_badly_with = Column(ARRAY(String), default=list)  # other ingredient names
    description = Column(Text)
