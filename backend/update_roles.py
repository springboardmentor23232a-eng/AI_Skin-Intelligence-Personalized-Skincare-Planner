import dotenv
import os
import psycopg2

dotenv.load_dotenv()
conn = psycopg2.connect(os.getenv("DATABASE_URL"))
cursor = conn.cursor()
cursor.execute("UPDATE users SET role='Skincare Consultant' WHERE role='Consultant'")
cursor.execute("UPDATE users SET role='Administrator' WHERE role='Admin'")
conn.commit()
conn.close()
print("Roles updated successfully!")
