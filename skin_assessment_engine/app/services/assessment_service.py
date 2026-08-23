from typing import List, Optional, Tuple, Dict, Any
from datetime import datetime, timezone
import statistics
from sqlalchemy.orm import Session
from app.models import SkinAssessment, SkinConcern, RiskFactor
from app.schemas import AssessmentCreate, AssessmentUpdate
from app.services.scoring_engine import calculate_skin_health_score
from app.services.concern_engine import identify_and_prioritize_concerns
from app.services.risk_engine import evaluate_risk_factors

def utc_now():
    return datetime.now(timezone.utc)

def extract_str(val):
    if val is None:
        return ""
    return str(val.value) if hasattr(val, "value") else str(val)

def create_skin_assessment(db: Session, user_id: int, payload: AssessmentCreate) -> SkinAssessment:
    """Creates a new skin assessment, executes engines for scoring, concerns, & risks, and saves to DB."""
    data = payload.model_dump()
    data["skin_type"] = extract_str(payload.skin_type)
    data["spf_frequency"] = extract_str(payload.spf_frequency)
    data["climate_environment"] = extract_str(payload.climate_environment)
    data["exfoliation_frequency"] = extract_str(payload.exfoliation_frequency)
    data["fitzpatrick_phototype"] = extract_str(payload.fitzpatrick_phototype)
    data["makeup_usage"] = extract_str(payload.makeup_usage)
    data["hormonal_phase"] = extract_str(payload.hormonal_phase)
    data["primary_skin_goal"] = extract_str(payload.primary_skin_goal)

    # 1. Execute Scoring Engine
    score, condition, breakdown_data = calculate_skin_health_score(data)
    
    # 2. Instantiate SkinAssessment ORM
    assessment = SkinAssessment(
        user_id=user_id,
        assessment_date=utc_now(),
        skin_type=data["skin_type"],
        skin_health_score=score,
        overall_condition=condition,
        hydration_level=payload.hydration_level,
        oiliness_level=payload.oiliness_level,
        sensitivity_level=payload.sensitivity_level,
        acne_severity=payload.acne_severity,
        pigmentation_score=payload.pigmentation_score,
        wrinkles_score=payload.wrinkles_score,
        sun_exposure_hours=payload.sun_exposure_hours,
        spf_frequency=data["spf_frequency"],
        sleep_hours=payload.sleep_hours,
        stress_level=payload.stress_level,
        
        # Extended criteria
        climate_environment=data["climate_environment"],
        water_intake_liters=payload.water_intake_liters,
        exfoliation_frequency=data["exfoliation_frequency"],
        fitzpatrick_phototype=data["fitzpatrick_phototype"],
        makeup_usage=data["makeup_usage"],
        hormonal_phase=data["hormonal_phase"],
        primary_skin_goal=data["primary_skin_goal"],
        
        notes=payload.notes
    )
    
    db.add(assessment)
    db.flush() # Populate assessment.id for foreign keys

    # 3. Execute Concern Identification & Prioritization Engine
    concerns_data = identify_and_prioritize_concerns(data)
    for c_item in concerns_data:
        concern_obj = SkinConcern(
            assessment_id=assessment.id,
            concern_name=c_item["concern_name"],
            severity=c_item["severity"],
            priority=c_item["priority"],
            category=c_item["category"],
            description=c_item["description"],
            recommended_ingredients=c_item.get("recommended_ingredients", []),
            routine_advice=c_item.get("routine_advice", ""),
            avoid_ingredients=c_item.get("avoid_ingredients", [])
        )
        db.add(concern_obj)

    # 4. Execute Risk Analysis Engine
    risks_data = evaluate_risk_factors(data)
    for r_item in risks_data:
        risk_obj = RiskFactor(
            assessment_id=assessment.id,
            risk_name=r_item["risk_name"],
            description=r_item["description"],
            risk_level=r_item["risk_level"],
            risk_score=r_item.get("risk_score", 50.0),
            affected_areas=r_item.get("affected_areas", "Full Face"),
            mitigation_tip=r_item["mitigation_tip"]
        )
        db.add(risk_obj)

    db.commit()
    db.refresh(assessment)
    return assessment


def get_assessment_by_id(db: Session, user_id: int, assessment_id: int, role: str = "user") -> Optional[SkinAssessment]:
    """Retrieves a single assessment by ID for a user."""
    query = db.query(SkinAssessment).filter(SkinAssessment.id == assessment_id)
    if role != "admin":
        query = query.filter(SkinAssessment.user_id == user_id)
    return query.first()


def list_user_assessments(db: Session, user_id: int, skip: int = 0, limit: int = 20, role: str = "user") -> List[SkinAssessment]:
    """Retrieves paginated assessments for a user ordered by date descending."""
    query = db.query(SkinAssessment)
    if role != "admin":
        query = query.filter(SkinAssessment.user_id == user_id)
    return query.order_by(SkinAssessment.assessment_date.desc()).offset(skip).limit(limit).all()


def update_skin_assessment(db: Session, user_id: int, assessment_id: int, payload: AssessmentUpdate, role: str = "user") -> Optional[SkinAssessment]:
    """Updates assessment details and re-computes scores, concerns, and risk factors."""
    assessment = get_assessment_by_id(db, user_id, assessment_id, role)
    if not assessment:
        return None

    update_data = payload.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        if value is not None:
            val_str = str(value.value) if hasattr(value, "value") else value
            setattr(assessment, key, val_str)

    # Re-evaluate logic with updated fields
    full_data = {
        "hydration_level": assessment.hydration_level,
        "oiliness_level": assessment.oiliness_level,
        "sensitivity_level": assessment.sensitivity_level,
        "acne_severity": assessment.acne_severity,
        "pigmentation_score": assessment.pigmentation_score,
        "wrinkles_score": assessment.wrinkles_score,
        "sun_exposure_hours": assessment.sun_exposure_hours,
        "spf_frequency": assessment.spf_frequency,
        "sleep_hours": assessment.sleep_hours,
        "stress_level": assessment.stress_level,
        "climate_environment": assessment.climate_environment,
        "water_intake_liters": assessment.water_intake_liters,
        "exfoliation_frequency": assessment.exfoliation_frequency,
        "fitzpatrick_phototype": assessment.fitzpatrick_phototype,
        "makeup_usage": assessment.makeup_usage,
        "hormonal_phase": assessment.hormonal_phase,
        "primary_skin_goal": assessment.primary_skin_goal
    }

    score, condition, _ = calculate_skin_health_score(full_data)
    assessment.skin_health_score = score
    assessment.overall_condition = condition
    assessment.updated_at = utc_now()

    # Clear and regenerate concerns
    db.query(SkinConcern).filter(SkinConcern.assessment_id == assessment_id).delete()
    concerns_data = identify_and_prioritize_concerns(full_data)
    for c_item in concerns_data:
        db.add(SkinConcern(
            assessment_id=assessment.id,
            concern_name=c_item["concern_name"],
            severity=c_item["severity"],
            priority=c_item["priority"],
            category=c_item["category"],
            description=c_item["description"],
            recommended_ingredients=c_item.get("recommended_ingredients", []),
            routine_advice=c_item.get("routine_advice", ""),
            avoid_ingredients=c_item.get("avoid_ingredients", [])
        ))

    # Clear and regenerate risk factors
    db.query(RiskFactor).filter(RiskFactor.assessment_id == assessment_id).delete()
    risks_data = evaluate_risk_factors(full_data)
    for r_item in risks_data:
        db.add(RiskFactor(
            assessment_id=assessment.id,
            risk_name=r_item["risk_name"],
            description=r_item["description"],
            risk_level=r_item["risk_level"],
            risk_score=r_item.get("risk_score", 50.0),
            affected_areas=r_item.get("affected_areas", "Full Face"),
            mitigation_tip=r_item["mitigation_tip"]
        ))

    db.commit()
    db.refresh(assessment)
    return assessment


def delete_skin_assessment(db: Session, user_id: int, assessment_id: int, role: str = "user") -> bool:
    """Deletes an assessment and associated concerns/risks."""
    assessment = get_assessment_by_id(db, user_id, assessment_id, role)
    if not assessment:
        return False

    db.delete(assessment)
    db.commit()
    return True


def get_assessment_history_summary(db: Session, user_id: int) -> Dict[str, Any]:
    """Builds user's assessment history timeline, statistical linear regression trend, and velocity analysis."""
    assessments = db.query(SkinAssessment).filter(SkinAssessment.user_id == user_id).order_by(SkinAssessment.assessment_date.asc()).all()
    
    if not assessments:
        return {
            "success": True,
            "user_id": user_id,
            "total_assessments": 0,
            "average_score": 0.0,
            "best_score": 0.0,
            "worst_score": 0.0,
            "score_velocity": 0.0,
            "consistency_rating": "No Data",
            "score_trend": "No Data",
            "history": []
        }

    scores = [a.skin_health_score for a in assessments]
    avg_score = round(sum(scores) / len(scores), 2)
    best_score = round(max(scores), 2)
    worst_score = round(min(scores), 2)

    n = len(scores)
    if n >= 2:
        x_vals = list(range(n))
        x_bar = sum(x_vals) / n
        y_bar = sum(scores) / n
        
        numerator = sum((x_vals[i] - x_bar) * (scores[i] - y_bar) for i in range(n))
        denominator = sum((x_vals[i] - x_bar)**2 for i in range(n))
        
        slope = (numerator / denominator) if denominator != 0 else 0.0
        score_velocity = round(slope, 2)
        
        if slope > 0.8:
            trend = "Improving"
        elif slope < -0.8:
            trend = "Declining"
        else:
            trend = "Stable"
            
        std_dev = statistics.stdev(scores) if n > 1 else 0.0
        if std_dev < 4.0:
            consistency = "Highly Consistent"
        elif std_dev < 10.0:
            consistency = "Moderate Volatility"
        else:
            consistency = "High Volatility"
    else:
        trend = "Baseline Established"
        score_velocity = 0.0
        consistency = "Single Scan Baseline"

    desc_assessments = list(reversed(assessments))
    history_items = []
    for a in desc_assessments:
        top_concern = a.concerns[0].concern_name if a.concerns else "No major concern"
        high_risks = sum(1 for r in a.risk_factors if r.risk_level in ["HIGH", "CRITICAL"])
        
        history_items.append({
            "id": a.id,
            "assessment_date": a.assessment_date,
            "skin_type": a.skin_type,
            "skin_health_score": a.skin_health_score,
            "overall_condition": a.overall_condition,
            "primary_concern": top_concern,
            "high_risk_count": high_risks
        })

    return {
        "success": True,
        "user_id": user_id,
        "total_assessments": n,
        "average_score": avg_score,
        "best_score": best_score,
        "worst_score": worst_score,
        "score_velocity": score_velocity,
        "consistency_rating": consistency,
        "score_trend": trend,
        "history": history_items
    }


def get_skin_score_summary(db: Session, user_id: int) -> Dict[str, Any]:
    """Retrieves score summary and breakdown for latest assessment."""
    latest = db.query(SkinAssessment).filter(SkinAssessment.user_id == user_id).order_by(SkinAssessment.assessment_date.desc()).first()

    if not latest:
        return {
            "success": True,
            "user_id": user_id,
            "latest_assessment_id": None,
            "overall_score": 75.0,
            "overall_condition": "Good Condition",
            "last_scan_date": utc_now(),
            "breakdown": [
                {"name": "Moisture & Barrier Health", "score": 70.0, "weight": "25%", "status": "Good", "clinical_recommendation": "Maintain lipid barrier with ceramide formulations."},
                {"name": "Sebum & Pore Balance", "score": 75.0, "weight": "20%", "status": "Good", "clinical_recommendation": "Sebum levels well regulated."},
                {"name": "Inflammatory & Acne Index", "score": 80.0, "weight": "25%", "status": "Good", "clinical_recommendation": "Inflammatory acne index low."},
                {"name": "Skin Tone & Structural Quality", "score": 75.0, "weight": "15%", "status": "Good", "clinical_recommendation": "Skin tone and structural elasticity optimal."},
                {"name": "Lifestyle & Environmental Resilience", "score": 70.0, "weight": "15%", "status": "Good", "clinical_recommendation": "Lifestyle factors support skin resilience."}
            ],
            "insights": ["No scan logged yet. Log your first assessment to unlock personalized skin scores."]
        }

    full_data = {
        "hydration_level": latest.hydration_level,
        "oiliness_level": latest.oiliness_level,
        "sensitivity_level": latest.sensitivity_level,
        "acne_severity": latest.acne_severity,
        "pigmentation_score": latest.pigmentation_score,
        "wrinkles_score": latest.wrinkles_score,
        "sun_exposure_hours": latest.sun_exposure_hours,
        "spf_frequency": latest.spf_frequency,
        "sleep_hours": latest.sleep_hours,
        "stress_level": latest.stress_level,
        "climate_environment": latest.climate_environment,
        "water_intake_liters": latest.water_intake_liters,
        "exfoliation_frequency": latest.exfoliation_frequency,
        "fitzpatrick_phototype": latest.fitzpatrick_phototype,
        "makeup_usage": latest.makeup_usage,
        "hormonal_phase": latest.hormonal_phase,
        "primary_skin_goal": latest.primary_skin_goal
    }

    score, condition, breakdown_dict = calculate_skin_health_score(full_data)

    insights = []
    if latest.acne_severity > 30:
        insights.append("Inflammatory acne index elevated — apply targeted 2% Salicylic Acid BHA or Azelaic Acid gel.")
    if latest.hydration_level < 50 or (latest.water_intake_liters and latest.water_intake_liters < 1.5):
        insights.append(f"Low hydration & water intake ({latest.water_intake_liters or 1.5}L/day) — drink 2.5L water daily and apply ceramides.")
    if latest.sun_exposure_hours > 3 and latest.spf_frequency != "Reapplied":
        insights.append("High sun exposure detected — daily broad-spectrum SPF 50+ reapplication mandatory.")
    if latest.stress_level >= 7:
        insights.append("Cortisol stress index high — incorporate soothing 5% Niacinamide and Panthenol B5.")
    if latest.exfoliation_frequency and "Over-Exfoliated" in latest.exfoliation_frequency:
        insights.append("Over-exfoliation detected — halt chemical acids for 14 days to allow lipid barrier recovery.")
    if not insights:
        insights.append("Skin health parameters are well balanced. Maintain daily routine.")

    return {
        "success": True,
        "user_id": user_id,
        "latest_assessment_id": latest.id,
        "overall_score": score,
        "overall_condition": condition,
        "last_scan_date": latest.assessment_date,
        "breakdown": breakdown_dict["breakdown"],
        "insights": insights
    }


def get_risks_summary(db: Session, user_id: int) -> Dict[str, Any]:
    """Retrieves active risk factors categorized by risk level."""
    latest = db.query(SkinAssessment).filter(SkinAssessment.user_id == user_id).order_by(SkinAssessment.assessment_date.desc()).first()

    if not latest or not latest.risk_factors:
        return {
            "success": True,
            "user_id": user_id,
            "total_risks_identified": 0,
            "critical_risks": [],
            "high_risks": [],
            "medium_risks": [],
            "low_risks": [],
            "general_recommendation": "No elevated risk factors detected."
        }

    critical = [r for r in latest.risk_factors if r.risk_level == "CRITICAL"]
    high = [r for r in latest.risk_factors if r.risk_level == "HIGH"]
    medium = [r for r in latest.risk_factors if r.risk_level == "MEDIUM"]
    low = [r for r in latest.risk_factors if r.risk_level == "LOW"]

    rec = "Maintain routine skincare protection."
    if critical:
        rec = "URGENT: Address critical compound risks and barrier failure immediately."
    elif high:
        rec = "ATTENTION: Take preventative measures to mitigate high risk factors."

    return {
        "success": True,
        "user_id": user_id,
        "total_risks_identified": len(latest.risk_factors),
        "critical_risks": critical,
        "high_risks": high,
        "medium_risks": medium,
        "low_risks": low,
        "general_recommendation": rec
    }
