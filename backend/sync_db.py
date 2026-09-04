from app.database import engine, Base
from app.models import User, RoutineLog
from sqlalchemy import inspect, text

def sync_database():
    Base.metadata.create_all(bind=engine)
    inspector = inspect(engine)
    columns = [c['name'] for c in inspector.get_columns('users')]
    print("Existing columns in 'users' table:", columns)

    with engine.connect() as conn:
        if 'role' not in columns:
            print("Adding 'role' column...")
            conn.execute(text("ALTER TABLE users ADD COLUMN role VARCHAR DEFAULT 'USER';"))
            conn.commit()

        if 'provider' not in columns:
            print("Adding 'provider' column...")
            conn.execute(text("ALTER TABLE users ADD COLUMN provider VARCHAR DEFAULT 'local';"))
            conn.commit()

        if 'created_at' not in columns:
            print("Adding 'created_at' column...")
            conn.execute(text("ALTER TABLE users ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;"))
            conn.commit()

        if 'updated_at' not in columns:
            print("Adding 'updated_at' column...")
            conn.execute(text("ALTER TABLE users ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;"))
            conn.commit()

    print("Database sync completed successfully!")

if __name__ == "__main__":
    sync_database()
