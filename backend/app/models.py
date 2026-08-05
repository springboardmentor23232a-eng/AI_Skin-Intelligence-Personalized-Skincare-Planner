from sqlalchemy import Column, Integer, String, DateTime, func
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=True)
    email = Column(String, unique=True, index=True, nullable=False)
    
    # Python attribute is hashed_password, but it maps directly to column 'password' in PostgreSQL
    hashed_password = Column("password", String, nullable=True)
    
    # Roles: USER, CONSULTANT, DOCTOR, ADMIN
    role = Column(String, default="USER", nullable=False)
    
    # Providers: LOCAL, GOOGLE
    provider = Column(String, default="LOCAL", nullable=False)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
