import os
import json
import psycopg2
import urllib.request
import urllib.parse
import re  
from psycopg2.extras import RealDictCursor
from fastapi import APIRouter, HTTPException, status, Query, Request, Body
from fastapi.responses import RedirectResponse
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
from jose import jwt
from dotenv import load_dotenv
from ddgs import DDGS

# Ensure keys.env is explicitly loaded
load_dotenv("keys.env")

from product_engine import generate_product_recommendations, compare_multiple_products, find_product_dupe

JWT_SECRET = os.getenv("JWT_SECRET", "derma_ai_secret_key_change_in_production_123")

def get_db():
    return psycopg2.connect(
        dbname=os.getenv("DB_NAME", "derma_ai"),
        user=os.getenv("DB_USER", "postgres"),
        password=os.getenv("DB_PASSWORD", "mango"),
        host=os.getenv("DB_HOST", "127.0.0.1"),
        port=os.getenv("DB_PORT", "5432"),
        cursor_factory=RealDictCursor
    )

router = APIRouter(prefix="/api/products", tags=["Product Recommendations"])

# --- IN-MEMORY CACHES FOR EXTREME PERFORMANCE ---
IMAGE_CACHE: Dict[str, str] = {}
# Saves Gemini AI processing time! (Drops 15s load time to 0.01s on refresh)
AI_RECOMMENDATION_CACHE: Dict[str, Dict[str, Any]] = {}

class CompareRequest(BaseModel):
    products: List[str]
    user_email: str

class DupeRequest(BaseModel):
    luxury_product: str
    user_email: str

class AddRoutineRequest(BaseModel):
    product_name: str
    user_email: str
    # NEW: Added these so we can pass the real data instead of generic placeholders!
    active_ingredient: Optional[str] = "Custom Selection"
    instructions: Optional[str] = "Use as directed by product label."
    category: Optional[str] = "Custom Step"

@router.get("/recommendations", status_code=status.HTTP_200_OK)
async def get_product_recommendations(
    request: Request,
    budget: Optional[str] = Query("Mid-Range (₹500 - ₹1500)"),
    preferences: Optional[str] = Query(""),
    avoid: Optional[str] = Query(""),
    email: Optional[str] = Query(None),
    _t: Optional[str] = Query(None) 
) -> Dict[str, Any]:
    
    target_email = email
    if not target_email:
        auth_header = request.headers.get("authorization", "")
        if auth_header.startswith("Bearer "):
            try:
                token = auth_header.split(" ")[1]
                payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
                target_email = payload.get("sub")
            except Exception:
                raise HTTPException(status_code=401, detail="Invalid token")

    if not target_email:
        raise HTTPException(status_code=400, detail="User email required")

    # 1. AI CACHE CHECK: If we already generated this exact search, return it instantly!
    cache_key = f"{target_email}_{budget}_{preferences}_{avoid}"
    if cache_key in AI_RECOMMENDATION_CACHE:
        print("⚡ Serving Full AI Routine from CACHE (Instant Load!)")
        return AI_RECOMMENDATION_CACHE[cache_key]

    pref_list = [p.strip() for p in preferences.split(",") if p.strip()] if preferences else []

    conn = None
    cursor = None
    try:
        conn = get_db()
        cursor = conn.cursor()

        cursor.execute("""
            SELECT u.name, sp.skin_type, sp.allergies, sp.sensitivities 
            FROM users u
            LEFT JOIN skin_profiles sp ON u.id = sp.user_id
            WHERE LOWER(u.email) = LOWER(%s)
        """, (target_email.strip(),))
        profile = cursor.fetchone()

        if not profile:
            raise HTTPException(status_code=404, detail="Profile not found")

        cursor.execute("SELECT id FROM users WHERE LOWER(email) = LOWER(%s)", (target_email.strip(),))
        uid = cursor.fetchone()["id"]
        
        cursor.execute("SELECT id FROM skinassessment WHERE user_id = %s ORDER BY created_at DESC LIMIT 1", (uid,))
        assessment = cursor.fetchone()
        
        concerns = []
        if assessment:
            cursor.execute("SELECT concern_name FROM skinconcern WHERE assessment_id = %s", (assessment["id"],))
            concerns = [c["concern_name"] for c in cursor.fetchall()]

        allergies_list = [a.strip() for a in str(profile.get("allergies") or "").split(",") if a.strip() and a.lower() != 'none']
        sensitivities_list = [s.strip() for s in str(profile.get("sensitivities") or "").split(",") if s.strip() and s.lower() != 'none']

        ai_data = generate_product_recommendations(
            skin_type=profile.get("skin_type", "Combination"),
            concerns=concerns,
            allergies=allergies_list,
            sensitivities=sensitivities_list,
            budget_preference=budget,
            preferences=pref_list,
            avoid_ingredients=avoid
        )

        final_response = {
            "status": "success",
            "context": {
                "skin_type": profile.get("skin_type", "Combination"),
                "allergies": allergies_list if allergies_list else ["None"],
                "avoid": avoid,
                "budget": budget,
                "preferences": pref_list
            },
            "data": ai_data
        }

        # 2. SAVE TO CACHE: Save it so the next time they refresh, it takes 0.01 seconds.
        AI_RECOMMENDATION_CACHE[cache_key] = final_response

        return final_response

    except Exception as e:
        if conn: conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if cursor: cursor.close()
        if conn: conn.close()

@router.post("/compare", status_code=status.HTTP_200_OK)
async def compare_products(payload: CompareRequest) -> Dict[str, Any]:
    if len(payload.products) < 2:
        raise HTTPException(status_code=400, detail="Provide at least two products to compare.")

    conn = None
    cursor = None
    try:
        conn = get_db()
        cursor = conn.cursor()

        cursor.execute("""
            SELECT sp.skin_type, sp.allergies 
            FROM users u
            LEFT JOIN skin_profiles sp ON u.id = sp.user_id
            WHERE LOWER(u.email) = LOWER(%s)
        """, (payload.user_email.strip(),))
        profile = cursor.fetchone()

        if not profile:
            raise HTTPException(status_code=404, detail="Profile not found")

        cursor.execute("SELECT id FROM users WHERE LOWER(email) = LOWER(%s)", (payload.user_email.strip(),))
        uid = cursor.fetchone()["id"]
        
        cursor.execute("SELECT id FROM skinassessment WHERE user_id = %s ORDER BY created_at DESC LIMIT 1", (uid,))
        assessment = cursor.fetchone()
        
        concerns = []
        if assessment:
            cursor.execute("SELECT concern_name FROM skinconcern WHERE assessment_id = %s", (assessment["id"],))
            concerns = [c["concern_name"] for c in cursor.fetchall()]

        allergies_list = [a.strip() for a in str(profile.get("allergies") or "").split(",") if a.strip() and a.lower() != 'none']

        ai_data = compare_multiple_products(
            product_names=payload.products,
            skin_type=profile.get("skin_type", "Combination"),
            concerns=concerns,
            allergies=allergies_list
        )

        return {"status": "success", "data": ai_data}

    except Exception as e:
        if conn: conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if cursor: cursor.close()
        if conn: conn.close()

@router.post("/dupe", status_code=status.HTTP_200_OK)
async def get_product_dupe(payload: DupeRequest) -> Dict[str, Any]:
    conn = None
    cursor = None
    try:
        conn = get_db()
        cursor = conn.cursor()

        cursor.execute("""
            SELECT sp.skin_type, sp.allergies 
            FROM users u
            LEFT JOIN skin_profiles sp ON u.id = sp.user_id
            WHERE LOWER(u.email) = LOWER(%s)
        """, (payload.user_email.strip(),))
        profile = cursor.fetchone()

        if not profile:
            raise HTTPException(status_code=404, detail="Profile not found")

        cursor.execute("SELECT id FROM users WHERE LOWER(email) = LOWER(%s)", (payload.user_email.strip(),))
        uid = cursor.fetchone()["id"]
        
        cursor.execute("SELECT id FROM skinassessment WHERE user_id = %s ORDER BY created_at DESC LIMIT 1", (uid,))
        assessment = cursor.fetchone()
        
        concerns = []
        if assessment:
            cursor.execute("SELECT concern_name FROM skinconcern WHERE assessment_id = %s", (assessment["id"],))
            concerns = [c["concern_name"] for c in cursor.fetchall()]

        allergies_list = [a.strip() for a in str(profile.get("allergies") or "").split(",") if a.strip() and a.lower() != 'none']

        ai_data = find_product_dupe(
            luxury_product=payload.luxury_product,
            skin_type=profile.get("skin_type", "Combination"),
            concerns=concerns,
            allergies=allergies_list
        )

        return {"status": "success", "data": ai_data}

    except Exception as e:
        if conn: conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if cursor: cursor.close()
        if conn: conn.close()

@router.post("/routine/add", status_code=status.HTTP_200_OK)
async def sync_product_to_routine(payload: AddRoutineRequest) -> Dict[str, Any]:
    """
    Live database integration: Writes the selected product into the active Routine_Steps Database.
    """
    conn = None
    cursor = None
    try:
        conn = get_db()
        cursor = conn.cursor()

        # 1. Get the exact User ID based on their email
        cursor.execute("SELECT id, name FROM users WHERE LOWER(email) = LOWER(%s)", (payload.user_email.strip(),))
        user_row = cursor.fetchone()
        
        if not user_row:
            raise HTTPException(status_code=404, detail="User not found")
            
        user_id = user_row["id"]
        user_name = user_row["name"]

        # 2. Check if the user already has an active routine
        cursor.execute("SELECT id FROM routines WHERE user_id = %s AND is_active = TRUE ORDER BY created_at DESC LIMIT 1", (user_id,))
        routine_row = cursor.fetchone()

        if routine_row:
            routine_id = routine_row["id"]
        else:
            # 3. If no active routine exists, create one
            cursor.execute("""
                INSERT INTO routines (user_id, patient_name, adaptation_summary, is_active) 
                VALUES (%s, %s, 'User manually added products.', TRUE)
                RETURNING id
            """, (user_id, user_name))
            routine_id = cursor.fetchone()["id"]

        # 4. Get the next available step order for this routine to avoid sequence conflicts
        cursor.execute("SELECT COALESCE(MAX(step_order), 0) + 1 AS next_step FROM routine_steps WHERE routine_id = %s", (routine_id,))
        next_step = cursor.fetchone()["next_step"]

        # 5. Insert the actual product step into routine_steps (Now using the real payload data!)
        cursor.execute("""
            INSERT INTO routine_steps (
                routine_id, timing, step_order, category, 
                product_recommendation, active_ingredient, instructions, adaptation_badge
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        """, (
            routine_id, 
            'Morning', 
            next_step, 
            payload.category, 
            payload.product_name, 
            payload.active_ingredient, 
            payload.instructions, 
            'User Added'
        ))
        
        # 6. Commit the save to the database
        conn.commit()

        return {
            "status": "success", 
            "message": f"{payload.product_name} successfully saved to your routine!"
        }
    except Exception as e:
        if conn: conn.rollback()
        print(f"Database Error: {e}")
        raise HTTPException(status_code=500, detail="Failed to save to database.")
    finally:
        if cursor: cursor.close()
        if conn: conn.close()

# NOTE: `async` removed here so images load concurrently instead of one-by-one!
@router.get("/image", status_code=status.HTTP_200_OK)
def get_product_image(q: str):
    """
    Dynamically fetches real product images from the web.
    First checks the in-memory cache, then attempts Serper.dev API if configured,
    falls back to DDGS, and gracefully defaults to the dynamic avatar banner.
    """
    if q in IMAGE_CACHE:
        return RedirectResponse(url=IMAGE_CACHE[q])

    fallback_url = f"https://ui-avatars.com/api/?name={urllib.parse.quote(q)}&background=0D9488&color=fff&size=400&font-size=0.33&bold=true"
    
    clean_name = q.replace("%", " percent ").replace("+", " and ").replace("&", " and ")
    clean_name = re.sub(r'[^a-zA-Z0-9\s]', ' ', clean_name)
    clean_name = " ".join(clean_name.split())
    clean_q = f"{clean_name} skincare product bottle white background"

    serper_api_key = os.getenv("SERPER_API_KEY")
    if serper_api_key:
        try:
            url = "https://google.serper.dev/images"
            payload = json.dumps({"q": clean_q, "gl": "in"}).encode('utf-8')
            headers = {'X-API-KEY': serper_api_key, 'Content-Type': 'application/json'}
            
            req = urllib.request.Request(url, data=payload, headers=headers, method='POST')
            with urllib.request.urlopen(req, timeout=5) as response:
                data = json.loads(response.read().decode())
                if 'images' in data and len(data['images']) > 0:
                    img_url = data['images'][0]['imageUrl']
                    IMAGE_CACHE[q] = img_url
                    return RedirectResponse(url=img_url)
        except Exception as e:
            print(f"⚠️ Serper Search failed for '{q}': {e}. Trying fallback.")

    try:
        with DDGS(timeout=5) as ddgs:
            results = list(ddgs.images(clean_q, max_results=1))
            if results and len(results) > 0 and "image" in results[0]:
                img_url = results[0]["image"]
                IMAGE_CACHE[q] = img_url
                return RedirectResponse(url=img_url)
            else:
                return RedirectResponse(url=fallback_url)
    except Exception as e:
        return RedirectResponse(url=fallback_url)