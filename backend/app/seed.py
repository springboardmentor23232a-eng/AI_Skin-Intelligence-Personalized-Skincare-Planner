"""
Run once after the database is created to seed demo accounts and products:

    python -m app.seed

Creates:
  - one admin, one consultant, one dermatologist demo account
  - a handful of sample products for the catalog

All demo accounts use the password: Passw0rd!
"""
from app.database import SessionLocal, Base, engine
from app.models import User, RoleName, Product
from app.security import hash_password

Base.metadata.create_all(bind=engine)


def seed():
    db = SessionLocal()
    try:
        demo_accounts = [
            ("Admin User", "admin@skinai.demo", RoleName.admin),
            ("Consultant Demo", "consultant@skinai.demo", RoleName.consultant),
            ("Dermatologist Demo", "dermatologist@skinai.demo", RoleName.dermatologist),
        ]
        for name, email, role in demo_accounts:
            if not db.query(User).filter(User.email == email).first():
                db.add(User(
                    full_name=name,
                    email=email,
                    hashed_password=hash_password("Passw0rd!"),
                    role=role,
                ))

        sample_products = [
            ("Gentle Foaming Cleanser", "DermaPure", "cleanser", 12.99, "all"),
            ("Ceramide Repair Moisturizer", "DermaPure", "moisturizer", 18.50, "dry,sensitive"),
            ("Niacinamide 10% Serum", "GlowLab", "serum", 15.00, "oily,combination"),
            ("Broad-Spectrum SPF 50 Sunscreen", "SunShield", "sunscreen", 14.00, "all"),
            ("Salicylic Acid BHA Cleanser", "ClearSkin", "cleanser", 13.75, "oily,acne-prone"),
        ]
        for name, brand, category, price, suitable in sample_products:
            if not db.query(Product).filter(Product.name == name).first():
                db.add(Product(
                    name=name, brand=brand, category=category,
                    price=price, suitable_for=suitable,
                    description=f"{name} by {brand} — suitable for {suitable} skin.",
                ))

        db.commit()
        print("Seed complete. Demo accounts (password: Passw0rd!):")
        for name, email, role in demo_accounts:
            print(f"  {role.value:<14} {email}")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
