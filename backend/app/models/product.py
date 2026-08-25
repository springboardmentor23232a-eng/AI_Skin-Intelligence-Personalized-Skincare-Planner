import uuid

from sqlalchemy import Column, String, Float, ARRAY, Text, Boolean, Integer
from sqlalchemy.dialects.postgresql import UUID

from app.database import Base


class Product(Base):
    __tablename__ = "products"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    name = Column(String, nullable=False)
    brand = Column(String)

    category = Column(String)
    # face_wash, moisturizer, sunscreen, serum, toner,
    # treatment, mask

    key_ingredients = Column(
        ARRAY(String),
        default=list
    )

    suitable_skin_types = Column(
        ARRAY(String),
        default=list
    )
    age_groups = Column(
        ARRAY(String),
        default=list
)

    targets_concerns = Column(
        ARRAY(String),
        default=list
    )

    price = Column(Float, default=0.0)

    description = Column(Text)

    # Shopping information
    purchase_url = Column(String)
    retailer = Column(String)

    # Popularity / rating
    rating = Column(Float, default=0.0)
    review_count = Column(Integer, default=0)
    is_bestseller = Column(Boolean, default=False)

    # Product image
    image_url = Column(String)