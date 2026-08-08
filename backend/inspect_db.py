import os
from sqlalchemy import create_engine, inspect
from sqlalchemy.orm import sessionmaker
from app.models import User, SkinAssessment, SkinConcern, RiskFactor

DATABASE_URL = "postgresql://postgres:SVECW%402024@localhost:5432/skin_intelligence"
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
db = SessionLocal()

# Inspect tables
inspector = inspect(engine)
tables = inspector.get_table_names()
print("Tables found in database:", tables)

for table in tables:
    columns = [c['name'] for c in inspector.get_columns(table)]
    print(f"Table '{table}' columns: {columns}")

# Query records
print("\n--- QUERY RECORD COUNTS ---")
users_count = db.query(User).count()
assessments_count = db.query(SkinAssessment).count()
concerns_count = db.query(SkinConcern).count()
risks_count = db.query(RiskFactor).count()

print(f"Users: {users_count}")
print(f"Skin Assessments: {assessments_count}")
print(f"Skin Concerns: {concerns_count}")
print(f"Risk Factors: {risks_count}")

# Check any existing risk factors
if risks_count > 0:
    print("\n--- RISK FACTORS RECORDS ---")
    for r in db.query(RiskFactor).all():
        print(f"ID: {r.id}, Assessment ID: {r.assessment_id}, Name: {r.risk_name}, Level: {r.risk_level}")
else:
    print("\nNo risk factors found in table.")

# Check any assessments
if assessments_count > 0:
    print("\n--- ASSESSMENTS RECORDS ---")
    for a in db.query(SkinAssessment).all():
        print(f"ID: {a.id}, User ID: {a.user_id}, Score: {a.skin_health_score}, Date: {a.assessment_date}")
