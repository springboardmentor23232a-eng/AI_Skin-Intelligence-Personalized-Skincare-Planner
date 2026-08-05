from sqlalchemy import create_engine, inspect
import sys
from app.config import settings

def test_db():
    print(f"Connecting to database: {settings.DATABASE_URL}...")
    try:
        engine = create_engine(settings.DATABASE_URL)
        inspector = inspect(engine)
        tables = inspector.get_table_names()
        print("Existing tables:", tables)
        if "users" in tables:
            columns = inspector.get_columns("users")
            print("\nColumns in 'users' table:")
            for col in columns:
                print(f" - {col['name']}: {col['type']} (nullable: {col['nullable']})")
        else:
            print("FAIL: 'users' table not found in the database!")
    except Exception as e:
        print("FAIL: Connection error:", str(e))
        sys.exit(1)

if __name__ == "__main__":
    test_db()
