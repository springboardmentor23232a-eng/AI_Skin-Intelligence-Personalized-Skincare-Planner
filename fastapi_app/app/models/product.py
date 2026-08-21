from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, Float, DateTime
from app.database import Base

class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    brand = Column(String(100), nullable=False)
    name = Column(String(150), nullable=False)
    category = Column(String(50), nullable=False)
    active_ingredients = Column(Text, nullable=False)
    target_skin_types = Column(String(150), nullable=False)
    target_concerns = Column(String(255), nullable=False)
    price = Column(Float, nullable=False)
    rating = Column(Float, default=4.5)
    reviews_count = Column(Integer, default=120)
    image_url = Column(Text, nullable=True)
    buy_url = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
