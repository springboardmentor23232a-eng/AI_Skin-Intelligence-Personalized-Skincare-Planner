from app.database import engine
from sqlalchemy import text

def update_consumer_roles():
    with engine.connect() as conn:
        result = conn.execute(text("UPDATE users SET role = 'USER' WHERE UPPER(role) = 'CONSUMER';"))
        conn.commit()
        print(f"Successfully updated {result.rowcount} row(s) in PostgreSQL from 'CONSUMER' to 'USER'.")

if __name__ == "__main__":
    update_consumer_roles()
