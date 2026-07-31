import jwt
import secrets 
import datetime
from pathlib import Path
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel
from passlib.context import CryptContext
import psycopg2
from psycopg2.extras import RealDictCursor
from google.oauth2 import id_token
from google.auth.transport import requests

app = FastAPI(title="DermaAI API")

# Base Directory Resolution
BASE_DIR = Path(__file__).resolve().parent

GOOGLE_CLIENT_ID = "680095467315-59h797sp8tinmglr3qnctq8qoi3s9clh.apps.googleusercontent.com"

pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")

def hash_password(password: str):
    return pwd_context.hash(password)

def verify_password(password: str, hashed: str):
    return pwd_context.verify(password, hashed)

# Enable CORS for Frontend Communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Secret key used to sign JWT tokens
JWT_SECRET = secrets.token_urlsafe(32)

# In-memory tracking for approval status
USER_STATUS_STORE = {}

def get_db():
    return psycopg2.connect(
        dbname="derma_ai",
        user="postgres",
        password="mango", 
        host="127.0.0.1",
        port="5432",
        cursor_factory=RealDictCursor
    )

# JWT Generator Helper
def create_jwt_token(email: str, role: str, name: str):
    payload = {
        "sub": email,
        "name": name,
        "role": role,
        "exp": datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(hours=1)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm="HS256")

# --- PYDANTIC REQUEST SCHEMAS ---
class RegisterSchema(BaseModel):
    fullname: str
    email: str
    password: str
    role: str

class LoginSchema(BaseModel):
    email: str
    password: str
    role: str

class GoogleAuthSchema(BaseModel):
    id_token: str
    role: str
    action: str = "login"

class UpdateStatusSchema(BaseModel):
    email: str
    action: str

# --- REGISTER ENDPOINT ---
@app.post("/api/register")
def register(data: RegisterSchema):
    role = data.role.upper()
    try:
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("SELECT ID FROM USERS WHERE EMAIL = %s", (data.email,))
        if cursor.fetchone():
            cursor.close()
            conn.close()
            raise HTTPException(status_code=400, detail="An account with this email address already exists!")
        hashed_pwd = hash_password(data.password)
        query = "INSERT INTO USERS (NAME, EMAIL, PASSWORD, ROLE, PROVIDER) VALUES (%s, %s, %s, %s::USER_ROLE, 'LOCAL')"
        cursor.execute(query, (data.fullname, data.email, hashed_pwd, role))
        conn.commit()
        cursor.close()
        conn.close()

        user_status = "APPROVED" if role in ["USER", "ADMIN"] else "PENDING"
        USER_STATUS_STORE[data.email] = user_status
        return {"message": "Registration successful!", "status": user_status.lower()}
    except psycopg2.Error as e:
        raise HTTPException(status_code=500, detail=str(e))

# --- LOGIN ENDPOINT ---
@app.post("/api/login")
def login(data: LoginSchema):
    role = data.role.upper()
    try:
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM USERS WHERE EMAIL = %s AND ROLE = %s::USER_ROLE", (data.email, role))
        user = cursor.fetchone()
        cursor.close()
        conn.close()

        if not user or not verify_password(data.password, user['password']):
            raise HTTPException(status_code=401, detail="Invalid credentials or role mismatch!")

        status_check = USER_STATUS_STORE.get(data.email, "APPROVED" if user['role'] in ['USER', 'ADMIN'] else "PENDING")

        if status_check == "PENDING":
            raise HTTPException(status_code=403, detail="Your account is awaiting Admin approval.")
        if status_check == "REJECTED":
            raise HTTPException(status_code=403, detail="Your account registration was rejected by an Administrator.")

        clean_role = user['role'].lower()
        token = create_jwt_token(user['email'], clean_role, user['name'])
        return {"message": "Login successful!", "token": token, "name": user['name'], "role": clean_role}
    except psycopg2.Error as e:
        raise HTTPException(status_code=500, detail=str(e))

# --- GOOGLE OAUTH ENDPOINT ---
@app.post("/api/auth/google")
def google_auth(data: GoogleAuthSchema):
    try:
        id_info = id_token.verify_oauth2_token(data.id_token, requests.Request(), GOOGLE_CLIENT_ID)
        email = id_info.get("email")
        name = id_info.get("name")

        if not email:
            raise HTTPException(status_code=400, detail="Invalid Google token (email missing)")

        target_role = data.role.upper()
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("SELECT ID, NAME, EMAIL, ROLE, PROVIDER FROM USERS WHERE EMAIL = %s", (email,))
        user = cursor.fetchone()

        if data.action == "register":
            if user:
                cursor.close()
                conn.close()
                raise HTTPException(status_code=400, detail=f"An account registered with {email} already exists!")

            cursor.execute(
                "INSERT INTO USERS (NAME, EMAIL, PASSWORD, ROLE, PROVIDER) VALUES (%s, %s, 'OAUTH_NO_PASSWORD', %s::USER_ROLE, 'GOOGLE') RETURNING ID, NAME, EMAIL, ROLE;",
                (name, email, target_role)
            )
            user = cursor.fetchone()
            conn.commit()

            initial_status = "APPROVED" if target_role in ["USER", "ADMIN"] else "PENDING"
            USER_STATUS_STORE[email] = initial_status
            cursor.close()
            conn.close()

            if initial_status == "PENDING":
                return {"status": "pending", "message": "Registration successful! Account pending Admin approval."}

            clean_role = user['role'].lower()
            token = create_jwt_token(user['email'], clean_role, user['name'])
            return {"status": "approved", "token": token, "name": user['name'], "role": clean_role}
        else:
            if not user:
                cursor.close()
                conn.close()
                raise HTTPException(status_code=404, detail=f"No account found with {email}. Please register first.")

            cursor.close()
            conn.close()
            clean_role = user['role'].lower()
            current_status = USER_STATUS_STORE.get(email, "APPROVED" if clean_role in ["user", "admin"] else "PENDING")

            if current_status == "PENDING":
                raise HTTPException(status_code=403, detail="Your account is awaiting Admin approval.")
            if current_status == "REJECTED":
                raise HTTPException(status_code=403, detail="Your account registration was rejected.")

            token = create_jwt_token(user['email'], clean_role, user['name'])
            return {"status": "approved", "token": token, "name": user['name'], "role": clean_role}

    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid Google ID Token")

# --- ADMIN: GET ALL REGISTERED USERS FROM POSTGRESQL ---
@app.get("/api/admin/users")
def get_admin_users():
    try:
        conn = get_db()
        cursor = conn.cursor()
        
        cursor.execute("SELECT ID, NAME, EMAIL, ROLE, PROVIDER FROM USERS ORDER BY ID DESC")
        users = cursor.fetchall()
        cursor.close()
        conn.close()

        formatted_users = []
        for u in users:
            role = u['role'].lower()
            default_status = "approved" if role in ['user', 'admin'] else "pending"
            status_val = USER_STATUS_STORE.get(u['email'], default_status)

            formatted_users.append({
                "id": u['id'],
                "fullname": u['name'],
                "email": u['email'],
                "role": role,
                "status": status_val.lower()
            })

        return formatted_users

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# --- ADMIN: APPROVE / REJECT USER STATUS ---
@app.post("/api/admin/update-status")
def update_status(data: UpdateStatusSchema):
    USER_STATUS_STORE[data.email] = data.action.upper()
    return {"message": f"User status updated to {data.action.upper()}"}


# 2. FILE SERVING ROUTES 

@app.get("/")
async def serve_index():
    return FileResponse(BASE_DIR / "index.html")

@app.get("/user_dashboard.html")
async def serve_user_dashboard():
    return FileResponse(BASE_DIR / "user_dashboard.html")

# Serves subfolder files directly 
@app.get("/user_dashboard/{page_name}")
async def serve_user_subpages(page_name: str):
    file_path = BASE_DIR / "user_dashboard" / page_name
    if file_path.exists():
        return FileResponse(file_path)
    raise HTTPException(status_code=404, detail="File not found")

# Generic handler for root HTML files 
@app.get("/{filename:path}")
async def serve_root_files(filename: str):
    file_path = BASE_DIR / filename
    if file_path.exists() and filename.endswith(".html"):
        return FileResponse(file_path)
    raise HTTPException(status_code=404, detail="Page not found")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="127.0.0.1", port=8000, reload=True)