from app.database import engine
from sqlalchemy import text

def delete_user():
    with engine.connect() as conn:
        result = conn.execute(text("DELETE FROM users WHERE email = '24wh1a0561@bvrithyderabad.edu.in';"))
        conn.commit()
        print(f"Successfully deleted {result.rowcount} row(s) matching 24wh1a0561@bvrithyderabad.edu.in from PostgreSQL database.")

if __name__ == "__main__":
    delete_user()
