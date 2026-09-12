import logging
from sqlalchemy import text
from app.database import engine, SessionLocal
from app.models import User

logger = logging.getLogger("skincare_api")

def sync_database_schema():
    """
    Safely executes database schema alterations to ensure new profile &
    push notification preference columns exist in PostgreSQL, and backfills
    any existing records.
    """
    try:
        with engine.connect() as conn:
            conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS first_name VARCHAR(100) DEFAULT '';"))
            conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS last_name VARCHAR(100) DEFAULT '';"))
            conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS phone_number VARCHAR(50) DEFAULT '';"))
            conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS push_notifications_mobile BOOLEAN DEFAULT TRUE;"))
            conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS push_notifications_email BOOLEAN DEFAULT TRUE;"))
            conn.commit()
        logger.info("Database schema columns synchronized successfully.")
    except Exception as exc:
        logger.error(f"Error altering users table schema: {exc}")

    # Backfill first_name and last_name from name for existing user rows
    try:
        db = SessionLocal()
        users = db.query(User).all()
        updated_count = 0
        for u in users:
            changed = False
            if (not u.first_name or not u.first_name.strip()) and u.name and u.name.strip():
                parts = u.name.strip().split(maxsplit=1)
                u.first_name = parts[0]
                u.last_name = parts[1] if len(parts) > 1 else ""
                changed = True
            if u.push_notifications_mobile is None:
                u.push_notifications_mobile = True
                changed = True
            if u.push_notifications_email is None:
                u.push_notifications_email = True
                changed = True
            if changed:
                db.add(u)
                updated_count += 1
        if updated_count > 0:
            db.commit()
            logger.info(f"Backfilled {updated_count} user profiles with first/last names.")
        db.close()
    except Exception as exc:
        logger.error(f"Error backfilling existing user profiles: {exc}")

if __name__ == "__main__":
    sync_database_schema()
    print("Database sync completed.")