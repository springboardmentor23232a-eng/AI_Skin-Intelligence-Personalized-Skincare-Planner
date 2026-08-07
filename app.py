
import jwt
import secrets
import datetime
from pathlib import Path
from typing import List, Optional
from fastapi import FastAPI, HTTPException, status, Header, Form, File, UploadFile, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel
from passlib.context import CryptContext
import psycopg2
from psycopg2.extras import RealDictCursor
from google.oauth2 import id_token
from google.auth.transport import requests

# Import the dedicated Skin Assessment Engine Router
from skin_assessment_engine import router as assessment_router

app = FastAPI(title="DermaAI API")
app.include_router(assessment_router)

BASE_DIR = Path(__file__).resolve().parent
GOOGLE_CLIENT_ID = "680095467315-59h797sp8tinmglr3qnctq8qoi3s9clh.apps.googleusercontent.com"

pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")

def hash_password(password: str):
    return pwd_context.hash(password)

def verify_password(password: str, hashed: str):
    return pwd_context.verify(password, hashed)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

JWT_SECRET = secrets.token_urlsafe(32)

def get_db():
    return psycopg2.connect(
        dbname="derma_ai",
        user="postgres",
        password="mango",
        host="127.0.0.1",
        port="5432",
        cursor_factory=RealDictCursor
    )

def create_jwt_token(email: str, role: str, name: str):
    payload = {
        "sub": email,
        "name": name,
        "role": role,
        "exp": datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(hours=1)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm="HS256")

# --- PYDANTIC SCHEMAS ---
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

class RecommendationSchema(BaseModel):
    client_email: str
    recommendation: str
    
# --- AUTH ENDPOINTS ---
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
        user_status = "APPROVED" if role in ["USER", "ADMIN"] else "PENDING"

        query = "INSERT INTO USERS (NAME, EMAIL, PASSWORD, ROLE, PROVIDER, STATUS) VALUES (%s, %s, %s, %s::USER_ROLE, 'LOCAL', %s)"
        cursor.execute(query, (data.fullname, data.email, hashed_pwd, role, user_status))
        conn.commit()
        cursor.close()
        conn.close()

        return {"message": "Registration successful!", "status": user_status.lower()}
    except psycopg2.Error as e:
        raise HTTPException(status_code=500, detail=str(e))

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
            raise HTTPException(status_code=401, detail=f"Invalid credentials or role mismatch for {role.lower()}!")

        user_status = user.get('status', 'APPROVED')
        if user_status == "PENDING":
            raise HTTPException(status_code=403, detail="Your account is awaiting Admin approval.")
        if user_status == "REJECTED":
            raise HTTPException(status_code=403, detail="Your account registration was rejected by an Administrator.")

        clean_role = user['role'].lower()
        token = create_jwt_token(user['email'], clean_role, user['name'])
        return {"message": "Login successful!", "token": token, "name": user['name'], "role": clean_role, "email": user['email']}
    except psycopg2.Error as e:
        raise HTTPException(status_code=500, detail=str(e))

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
        cursor.execute("SELECT * FROM USERS WHERE EMAIL = %s", (email,))
        user = cursor.fetchone()

        if data.action == "register":
            if user:
                cursor.close()
                conn.close()
                raise HTTPException(status_code=400, detail=f"An account registered with {email} already exists!")

            initial_status = "APPROVED" if target_role in ["USER", "ADMIN"] else "PENDING"
            cursor.execute(
                """
                INSERT INTO USERS (NAME, EMAIL, PASSWORD, ROLE, PROVIDER, STATUS) 
                VALUES (%s, %s, 'OAUTH_NO_PASSWORD', %s::USER_ROLE, 'GOOGLE', %s) 
                RETURNING *;
                """,
                (name, email, target_role, initial_status)
            )
            user = cursor.fetchone()
            conn.commit()
            cursor.close()
            conn.close()

            if initial_status == "PENDING":
                return {"status": "pending", "message": "Registration successful! Account pending Admin approval."}

            clean_role = user['role'].lower()
            token = create_jwt_token(user['email'], clean_role, user['name'])
            return {"status": "approved", "token": token, "name": user['name'], "role": clean_role, "email": user['email']}
        
        else:
            if not user:
                cursor.close()
                conn.close()
                raise HTTPException(status_code=404, detail=f"No account found with {email}. Please register first.")

            cursor.close()
            conn.close()
            clean_role = user['role'].lower()
            user_status = user.get("status", "APPROVED")

            if user_status == "PENDING":
                raise HTTPException(status_code=403, detail="Your account is awaiting Admin approval.")
            if user_status == "REJECTED":
                raise HTTPException(status_code=403, detail="Your account registration was rejected.")

            token = create_jwt_token(user['email'], clean_role, user['name'])
            return {"status": "approved", "token": token, "name": user['name'], "role": clean_role, "email": user['email']}

    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid Google ID Token")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# --- ADMIN ENDPOINTS ---
@app.get("/api/admin/users")
def get_admin_users():
    try:
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("SELECT ID, NAME, EMAIL, ROLE, PROVIDER, STATUS FROM USERS ORDER BY ID DESC")
        users = cursor.fetchall()
        cursor.close()
        conn.close()

        formatted_users = []
        for u in users:
            formatted_users.append({
                "id": u['id'],
                "fullname": u['name'],
                "email": u['email'],
                "role": u['role'].lower(),
                "status": (u.get('status') or 'APPROVED').lower()
            })
        return formatted_users
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/admin/update-status")
def update_status(data: UpdateStatusSchema):
    try:
        conn = get_db()
        cursor = conn.cursor()
        new_status = data.action.upper()
        cursor.execute("UPDATE USERS SET STATUS = %s WHERE EMAIL = %s", (new_status, data.email))
        conn.commit()
        cursor.close()
        conn.close()
        return {"message": f"User status permanently updated to {new_status}"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# --- CONSULTANT DASHBOARD ENDPOINTS ---

@app.get("/api/consultant/clients")
def get_consultant_clients():
    conn = None
    cursor = None
    try:
        conn = get_db()
        cursor = conn.cursor()

        query = """
            SELECT 
                u.ID, u.NAME, u.EMAIL, u.CREATED_AT,
                sp.SKIN_TYPE, sp.AGE_GROUP, sp.ALLERGIES, 
                sp.SENSITIVITIES, sp.SCORE, sp.CONCERNS, sp.UPDATED_AT
            FROM USERS u
            LEFT JOIN SKIN_PROFILES sp ON u.ID = sp.USER_ID
            WHERE u.ROLE = 'USER';
        """
        cursor.execute(query)
        clients = cursor.fetchall()
        return clients
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if cursor: cursor.close()
        if conn: conn.close()


@app.get("/api/consultant/reports")
def get_consultant_reports():
    conn = None
    cursor = None
    try:
        conn = get_db()
        cursor = conn.cursor()
        
        query = """
            SELECT 
                sp.ID as REPORT_ID, u.NAME as CLIENT_NAME, u.EMAIL,
                sp.SKIN_TYPE, sp.AGE_GROUP, sp.WATER_INTAKE, sp.SLEEP_QUALITY,
                sp.ENVIRONMENT, sp.ALLERGIES, sp.SENSITIVITIES, sp.CONCERNS, 
                sp.SCORE, sp.UPDATED_AT
            FROM SKIN_PROFILES sp
            JOIN USERS u ON sp.USER_ID = u.ID
            ORDER BY sp.UPDATED_AT DESC;
        """
        cursor.execute(query)
        reports = cursor.fetchall()
        return reports
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if cursor: cursor.close()
        if conn: conn.close()


@app.post("/api/consultant/recommendations")
def save_consultant_recommendation(data: RecommendationSchema):
    """Save or update routine recommendations for a specific client."""
    conn = None
    cursor = None
    try:
        conn = get_db()
        cursor = conn.cursor()

        # Check if client exists
        cursor.execute("SELECT ID FROM USERS WHERE EMAIL = %s", (data.client_email,))
        user = cursor.fetchone()
        
        if not user:
            raise HTTPException(status_code=404, detail="Client user not found.")

        # Update skin profile or store recommendation note
        cursor.execute("""
            UPDATE SKIN_PROFILES 
            SET CONCERNS = array_append(CONCERNS, %s), UPDATED_AT = CURRENT_TIMESTAMP
            WHERE USER_ID = %s;
        """, (f"Recommendation: {data.recommendation}", user['id']))

        conn.commit()
        return {"message": "Recommendation saved successfully!"}
    except Exception as e:
        if conn: conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if cursor: cursor.close()
        if conn: conn.close()


# --- DERMATOLOGIST DASHBOARD ENDPOINTS ---
@app.get("/api/dermatologist/patients")
def get_dermatologist_patients():
    """Fetch patient clinical insights from SKIN_PROFILES table."""
    conn = None
    cursor = None
    try:
        conn = get_db()
        cursor = conn.cursor()

        query = """
            SELECT 
                u.ID, u.NAME, u.EMAIL, 
                sp.SKIN_TYPE, sp.AGE_GROUP, sp.ALLERGIES, 
                sp.SENSITIVITIES, sp.SCORE, sp.CONCERNS, sp.UPDATED_AT
            FROM USERS u
            LEFT JOIN SKIN_PROFILES sp ON u.ID = sp.USER_ID
            WHERE u.ROLE = 'USER';
        """
        cursor.execute(query)
        patients = cursor.fetchall()

        results = []
        for p in patients:
            results.append({
                "id": p['id'],
                "name": p['name'],
                "email": p['email'],
                "skin_type": p.get('skin_type') or 'Evaluation Pending',
                "age_group": p.get('age_group') or 'N/A',
                "risk_level": "Moderate / Active Assessment" if p.get('score') and p.get('score') < 70 else "Low / Baseline",
                "allergies": p.get('allergies') or "None Reported",
                "sensitivities": p.get('sensitivities') or "None Reported",
                "concerns": p.get('concerns') or ["No explicit conditions flagged"],
                "score": p.get('score') or 75
            })
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if cursor: cursor.close()
        if conn: conn.close()

@app.get("/api/dermatologist/reports")
def get_dermatologist_reports():
    """Fetch clinical skin condition reports using SKIN_PROFILES data."""
    conn = None
    cursor = None
    try:
        conn = get_db()
        cursor = conn.cursor()
        
        query = """
            SELECT 
                sp.ID, u.NAME as PATIENT_NAME, u.EMAIL,
                sp.SKIN_TYPE, sp.ALLERGIES, sp.SENSITIVITIES, 
                sp.CONCERNS, sp.SCORE, sp.UPDATED_AT
            FROM SKIN_PROFILES sp
            JOIN USERS u ON sp.USER_ID = u.ID
            ORDER BY sp.UPDATED_AT DESC;
        """
        cursor.execute(query)
        reports = cursor.fetchall()

        results = []
        for r in reports:
            score = r.get('score') or 75
            results.append({
                "id": r['id'],
                "patient_name": r['patient_name'],
                "email": r['email'],
                "concern": r['concerns'][0] if r.get('concerns') and len(r['concerns']) > 0 else "Baseline Evaluation",
                "score": score,
                "inflammation_level": "High" if score < 60 else "Moderate",
                "inflammation_pct": 100 - score,
                "pigment_status": "Monitored",
                "pigment_pct": 30,
                "updated_at": r['updated_at'].isoformat() if r.get('updated_at') else None
            })
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if cursor: cursor.close()
        if conn: conn.close()

@app.get("/api/dermatologist/recommendations")
def get_dermatologist_recommendations():
    """Fetch recent authorized prescriptions from patient profile notes."""
    conn = None
    cursor = None
    try:
        conn = get_db()
        cursor = conn.cursor()

        query = """
            SELECT u.EMAIL as PATIENT_EMAIL, sp.CONCERNS, sp.UPDATED_AT
            FROM SKIN_PROFILES sp
            JOIN USERS u ON sp.USER_ID = u.ID
            WHERE sp.CONCERNS IS NOT NULL;
        """
        cursor.execute(query)
        records = cursor.fetchall()

        recommendations = []
        for r in records:
            if r.get('concerns'):
                for c in r['concerns']:
                    if isinstance(c, str) and "Recommendation:" in c:
                        recommendations.append({
                            "patient_email": r['patient_email'],
                            "recommendation": c.replace("Recommendation:", "").strip(),
                            "created_at": r['updated_at'].isoformat() if r.get('updated_at') else None
                        })
        return recommendations
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if cursor: cursor.close()
        if conn: conn.close()

@app.post("/api/dermatologist/recommendations")
def save_dermatologist_recommendation(data: RecommendationSchema):
    """Save medical prescription to the patient's skin profile."""
    return save_consultant_recommendation(data)

# --- FILE SERVING ROUTES ---
@app.get("/")
async def serve_index():
    return FileResponse(BASE_DIR / "index.html")

@app.get("/user_dashboard.html")
async def serve_user_dashboard():
    return FileResponse(BASE_DIR / "user_dashboard.html")

@app.get("/consultant_dashboard.html")
async def serve_consultant_dashboard():
    return FileResponse(BASE_DIR / "consultant_dashboard.html")

@app.get("/dermatologist_dashboard.html")
async def serve_dermatologist_dashboard():
    return FileResponse(BASE_DIR / "dermatologist_dashboard.html")

@app.get("/admin.html")
async def serve_admin_dashboard():
    return FileResponse(BASE_DIR / "admin.html")

@app.get("/user_dashboard/{page_name}")
async def serve_user_subpages(page_name: str):
    file_path = BASE_DIR / "user_dashboard" / page_name
    if file_path.exists():
        return FileResponse(file_path)
    raise HTTPException(status_code=404, detail="File not found")

@app.get("/{filename:path}")
async def serve_root_files(filename: str):
    file_path = BASE_DIR / filename
    if file_path.exists() and filename.endswith(".html"):
        return FileResponse(file_path)
    raise HTTPException(status_code=404, detail="Page not found")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="127.0.0.1", port=8000, reload=True)
