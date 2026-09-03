# scoring_router.py
import os
import psycopg2
from psycopg2.extras import RealDictCursor
from fastapi import APIRouter, HTTPException, Query
from typing import Optional
from scoring_engine import RawPillarMetrics, calculate_skin_health_score

router = APIRouter(prefix="/api/scoring", tags=["Module 7: Skin Health Scoring Engine"])

def get_db():
    return psycopg2.connect(
        dbname=os.getenv("DB_NAME", "derma_ai"),
        user=os.getenv("DB_USER", "postgres"),
        password=os.getenv("DB_PASSWORD", "mango"),
        host=os.getenv("DB_HOST", "127.0.0.1"),
        cursor_factory=RealDictCursor
    )

@router.get("/current")
async def get_current_user_score(email: str = Query(...)):
    conn = get_db()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT id FROM users WHERE LOWER(email) = LOWER(%s);", (email.strip(),))
        user = cursor.fetchone()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        user_id = user["id"]

        # 1. Fetch Profile & Baseline Inputs (Used as fallback if no daily logs exist)
        cursor.execute("SELECT water_intake, sleep_quality, score FROM skin_profiles WHERE user_id = %s;", (user_id,))
        sp = cursor.fetchone() or {}

        # 2. Fetch Latest Clinical Assessment
        cursor.execute("SELECT skin_health_score FROM skinassessment WHERE user_id = %s ORDER BY created_at DESC LIMIT 1;", (user_id,))
        asm = cursor.fetchone()
        raw_condition = float(asm["skin_health_score"]) if asm and asm["skin_health_score"] is not None else float(sp.get("score") or 75.0)

        # 3. Fetch Progress Logs over 30 Days (Now prioritizing dynamic time-series metrics)
        cursor.execute("""
            SELECT 
                COALESCE(AVG(skin_feeling_rating), 4.0) as avg_comfort,
                COALESCE(AVG(water_intake), 0) as avg_water,
                COALESCE(AVG(sleep_hours), 0) as avg_sleep,
                COALESCE(SUM(CASE WHEN am_completed THEN 1 ELSE 0 END + CASE WHEN pm_completed THEN 1 ELSE 0 END), 0) as total_steps
            FROM progress_logs 
            WHERE user_id = %s AND log_date >= CURRENT_DATE - INTERVAL '30 days';
        """, (user_id,))
        stats = cursor.fetchone() or {}

        completed_steps = int(stats.get("total_steps") or 0)
        raw_consistency = min(100.0, (completed_steps / 60.0) * 100.0)

        # Use 30-day average hydration, fallback to static profile if 0
        avg_water = float(stats.get("avg_water") or 0)
        water_liters = avg_water if avg_water > 0 else float(sp.get("water_intake") or 2.5)
        raw_hydration = min(100.0, (water_liters / 3.0) * 100.0)

        # Use 30-day average sleep, fallback to static profile if 0
        avg_sleep = float(stats.get("avg_sleep") or 0)
        if avg_sleep > 0:
            sleep_hours = avg_sleep
        else:
            sleep_val_str = str(sp.get("sleep_quality") or "7.5").split()[0]
            try:
                sleep_hours = float(sleep_val_str)
            except ValueError:
                sleep_hours = 7.5
        raw_sleep = min(100.0, (sleep_hours / 8.0) * 100.0)

        avg_comfort = float(stats.get("avg_comfort") or 4.0)
        raw_lifestyle = min(100.0, (avg_comfort / 5.0) * 85.0 + 15.0)

        # 4. Fetch up to 30 days of historical scores
        cursor.execute("""
            SELECT overall_score, calculated_at 
            FROM skin_health_scores 
            WHERE user_id = %s 
            ORDER BY calculated_at DESC 
            LIMIT 30;
        """, (user_id,))
        history_rows = cursor.fetchall()
        recent_scores = [int(r["overall_score"]) for r in history_rows]

        metrics = RawPillarMetrics(
            skin_condition=round(raw_condition, 1),
            lifestyle=round(raw_lifestyle, 1),
            routine_consistency=round(raw_consistency, 1),
            sleep_quality=round(raw_sleep, 1),
            hydration=round(raw_hydration, 1)
        )
        result = calculate_skin_health_score(metrics, recent_scores)

        # 5. Record snapshot (Updated to utilize the new actionable_takeaway database column)
        cursor.execute("""
            INSERT INTO skin_health_scores (
                user_id, overall_score, improvement_delta, focus_area,
                condition_score, lifestyle_score, routine_consistency_score,
                sleep_score, hydration_score, predicted_next_week_score,
                ai_insight, actionable_takeaway, requires_intervention
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s);
        """, (
            user_id, result.overall_score, result.improvement_delta, result.focus_area,
            metrics.skin_condition, metrics.lifestyle, metrics.routine_consistency,
            metrics.sleep_quality, metrics.hydration, result.predicted_next_week_score,
            result.ai_insight, result.actionable_takeaway, result.requires_intervention
        ))
        conn.commit()

        # Build chronological 7-day and 30-day arrays
        history_rev = recent_scores[::-1] if recent_scores else []
        
        history_7d = history_rev[-7:] if len(history_rev) >= 7 else history_rev[:]
        while len(history_7d) < 7:
            history_7d.insert(0, result.overall_score)

        history_30d = history_rev[-30:] if len(history_rev) >= 30 else history_rev[:]
        while len(history_30d) < 30:
            history_30d.insert(0, history_30d[0] if history_30d else result.overall_score)

        # Dynamic explanations for cards
        cond_desc = "Barrier is stable and responding well to care." if raw_condition >= 70 else "Indicates active inflammation or barrier compromise."
        life_desc = "Environmental stress is well-managed." if raw_lifestyle >= 70 else "High environmental stress is impacting skin recovery."
        cons_desc = "Excellent adherence maintains active ingredient efficacy." if raw_consistency >= 75 else "Skipping steps breaks the active ingredient cycle."
        sleep_desc = "Optimal cellular repair window achieved." if sleep_hours >= 7.5 else "Lack of deep sleep increases cortisol and accelerates aging."
        hyd_desc = "Cellular hydration is optimal." if water_liters >= 2.5 else "Dehydration leads to dullness and transepidermal water loss."

        explanations = {
            "Condition": f"Baseline: {round(raw_condition, 1)}/100. {cond_desc}",
            "Lifestyle": f"Comfort: {round(avg_comfort, 1)}/5. {life_desc}",
            "Consistency": f"Logged {completed_steps}/60 steps. {cons_desc}",
            "Sleep": f"Averaging {sleep_hours} hrs. {sleep_desc}",
            "Hydration": f"Intake: {water_liters}L. {hyd_desc}"
        }

        return {
            "status": "success",
            "data": result.model_dump(),
            "raw": metrics.model_dump(),
            "history_7d": history_7d,
            "history_30d": history_30d,
            "explanations": explanations
        }
    finally:
        cursor.close()
        conn.close()