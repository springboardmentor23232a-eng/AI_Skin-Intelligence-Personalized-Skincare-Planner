from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

class ReportFilterParams(BaseModel):
    user_id: Optional[str] = "USR-1001"
    date_range: Optional[str] = "30_DAYS" # "7_DAYS", "30_DAYS", "90_DAYS", "ALL"
    include_notes: Optional[bool] = True
    include_affiliate_links: Optional[bool] = True

class SkinAssessmentReport(BaseModel):
    report_id: str
    generated_at: str
    user_name: str
    user_email: str
    skin_type: str
    skin_concerns: List[str]
    sensitivity_level: str
    moisture_barrier_status: str
    overall_skin_score: int
    primary_risks: List[str]
    dermatologist_recommendations: List[str]
    summary: str

class RoutineStepItem(BaseModel):
    step_number: int
    category: str
    product_name: str
    active_ingredients: str
    frequency: str
    instructions: str

class RoutineReport(BaseModel):
    report_id: str
    generated_at: str
    user_name: str
    skin_type: str
    morning_routine: List[RoutineStepItem]
    evening_routine: List[RoutineStepItem]
    conflicts_avoided: List[str]
    key_ingredients_focused: List[str]
    compliance_tips: List[str]

class ProductItemReport(BaseModel):
    product_name: str
    brand: str
    category: str
    match_score: int
    active_ingredients: str
    price: str
    rating: float
    buy_link: str

class ProductRecommendationReport(BaseModel):
    report_id: str
    generated_at: str
    user_name: str
    target_concerns: List[str]
    recommended_products: List[ProductItemReport]
    budget_friendly_alternatives: List[ProductItemReport]
    key_purchase_notes: str

class ProgressLogEntry(BaseModel):
    date: str
    acne_severity: int # 1-10
    redness_level: int # 1-10
    hydration_level: int # 1-10
    routine_completed: bool
    notes: str

class ProgressReport(BaseModel):
    report_id: str
    generated_at: str
    user_name: str
    total_days_logged: int
    streak_count: int
    compliance_rate: float
    acne_trend: str # "Improved 25%", "Stable", etc.
    hydration_trend: str
    redness_trend: str
    logs_summary: List[ProgressLogEntry]
    milestones_achieved: List[str]

class SkinHealthMetrics(BaseModel):
    barrier_health_score: int
    hydration_index: int
    acne_control_score: int
    pigmentation_clarity_score: int
    elasticity_score: int
    overall_health_score: int

class SkinHealthReport(BaseModel):
    report_id: str
    generated_at: str
    user_name: str
    skin_type: str
    health_metrics: SkinHealthMetrics
    grade: str # "A+ Excellent", "B Good", etc.
    top_strengths: List[str]
    areas_for_improvement: List[str]
    personalized_action_plan: List[str]

class ReportExportRequest(BaseModel):
    report_type: str # "assessment", "routine", "products", "progress", "health"
    format: str # "pdf", "excel"
    filter_params: Optional[ReportFilterParams] = None
