from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field, ConfigDict, model_validator
from enum import Enum

class SkinTypeEnum(str, Enum):
    DRY = "Dry"
    OILY = "Oily"
    COMBINATION = "Combination"
    NORMAL = "Normal"
    SENSITIVE = "Sensitive"

class SPFFrequencyEnum(str, Enum):
    NEVER = "Never"
    OCCASIONAL = "Occasional"
    DAILY = "Daily"
    REAPPLIED = "Reapplied"

class ClimateEnum(str, Enum):
    TEMPERATE = "Temperate & Balanced"
    HUMID = "Hot & Humid (Tropical)"
    ARID = "Arid & Dry (Desert)"
    COLD = "Cold & Harsh Winds"
    POLLUTION = "High Urban Pollution"

class ExfoliationEnum(str, Enum):
    NEVER = "Never"
    OPTIMAL = "1-2 Times/Week"
    MODERATE = "3-4 Times/Week"
    OVER_EXFOLIATED = "Daily / Over-Exfoliated"

class FitzpatrickEnum(str, Enum):
    TYPE_1 = "Type I (Very Fair)"
    TYPE_2 = "Type II (Fair)"
    TYPE_3 = "Type III (Medium)"
    TYPE_4 = "Type IV (Olive / Brown)"
    TYPE_5 = "Type V (Dark Brown)"
    TYPE_6 = "Type VI (Deeply Pigmented)"

class MakeupEnum(str, Enum):
    NONE = "None / Skincare Only"
    LIGHT = "Light Minimal Makeup"
    HEAVY = "Full Coverage / Daily Heavy"

class HormonalPhaseEnum(str, Enum):
    FOLLICULAR = "Follicular (Glowing)"
    LUTEAL = "Luteal (Pre-Breakout)"
    MENSTRUAL = "Menstrual (Sensitive)"
    BALANCED = "Not Applicable / Balanced"

class SkinGoalEnum(str, Enum):
    BARRIER_REPAIR = "Barrier Repair & Hydration"
    ACNE_CLEARING = "Acne & Pore Clearing"
    DARK_SPOTS = "Fading Dark Spots & Hyperpigmentation"
    ANTI_AGING = "Anti-Aging & Collagen Protection"
    REDNESS_SOOTHING = "Soothing Redness & Sensitivity"


# --- Input Schemas ---

class AssessmentCreate(BaseModel):
    # Core Skin Parameters
    skin_type: SkinTypeEnum = Field(default=SkinTypeEnum.COMBINATION, description="Dry, Oily, Combination, Normal, Sensitive")
    hydration_level: float = Field(default=50.0, ge=0.0, le=100.0, description="Moisture content 0-100")
    oiliness_level: float = Field(default=50.0, ge=0.0, le=100.0, description="Sebum level 0-100")
    sensitivity_level: float = Field(default=20.0, ge=0.0, le=100.0, description="Reactivity/sensitivity 0-100")
    acne_severity: float = Field(default=10.0, ge=0.0, le=100.0, description="Blemish/acne score 0-100")
    pigmentation_score: float = Field(default=15.0, ge=0.0, le=100.0, description="Dark spots/uneven tone score 0-100")
    wrinkles_score: float = Field(default=10.0, ge=0.0, le=100.0, description="Fine lines/aging score 0-100")
    
    # Environmental & Lifestyle Exposure Criteria
    sun_exposure_hours: float = Field(default=2.0, ge=0.0, le=24.0, description="Daily sun exposure hours")
    spf_frequency: SPFFrequencyEnum = Field(default=SPFFrequencyEnum.DAILY, description="Never, Occasional, Daily, Reapplied")
    sleep_hours: float = Field(default=7.5, ge=0.0, le=24.0, description="Average sleep per night")
    stress_level: int = Field(default=4, ge=1, le=10, description="Self-reported stress index 1-10")
    
    # Advanced Clinical Assessment Criteria (NEW)
    climate_environment: ClimateEnum = Field(default=ClimateEnum.TEMPERATE, description="Environmental climate zone")
    water_intake_liters: float = Field(default=2.0, ge=0.5, le=8.0, description="Daily water intake in Liters")
    exfoliation_frequency: ExfoliationEnum = Field(default=ExfoliationEnum.OPTIMAL, description="Chemical/physical exfoliation rate")
    fitzpatrick_phototype: FitzpatrickEnum = Field(default=FitzpatrickEnum.TYPE_3, description="Fitzpatrick skin phototype I-VI")
    makeup_usage: MakeupEnum = Field(default=MakeupEnum.LIGHT, description="Daily cosmetics coverage")
    hormonal_phase: HormonalPhaseEnum = Field(default=HormonalPhaseEnum.BALANCED, description="Hormonal cycle phase")
    primary_skin_goal: SkinGoalEnum = Field(default=SkinGoalEnum.BARRIER_REPAIR, description="Primary clinical objective")
    
    notes: Optional[str] = Field(default=None, description="Optional clinical notes or user comments")

    @model_validator(mode='after')
    def check_input_consistency(self):
        if self.skin_type == SkinTypeEnum.DRY and self.oiliness_level > 85.0:
            self.skin_type = SkinTypeEnum.COMBINATION
        return self


class AssessmentUpdate(BaseModel):
    skin_type: Optional[SkinTypeEnum] = None
    hydration_level: Optional[float] = Field(default=None, ge=0.0, le=100.0)
    oiliness_level: Optional[float] = Field(default=None, ge=0.0, le=100.0)
    sensitivity_level: Optional[float] = Field(default=None, ge=0.0, le=100.0)
    acne_severity: Optional[float] = Field(default=None, ge=0.0, le=100.0)
    pigmentation_score: Optional[float] = Field(default=None, ge=0.0, le=100.0)
    wrinkles_score: Optional[float] = Field(default=None, ge=0.0, le=100.0)
    sun_exposure_hours: Optional[float] = Field(default=None, ge=0.0, le=24.0)
    spf_frequency: Optional[SPFFrequencyEnum] = None
    sleep_hours: Optional[float] = Field(default=None, ge=0.0, le=24.0)
    stress_level: Optional[int] = Field(default=None, ge=1, le=10)
    
    climate_environment: Optional[ClimateEnum] = None
    water_intake_liters: Optional[float] = Field(default=None, ge=0.5, le=8.0)
    exfoliation_frequency: Optional[ExfoliationEnum] = None
    fitzpatrick_phototype: Optional[FitzpatrickEnum] = None
    makeup_usage: Optional[MakeupEnum] = None
    hormonal_phase: Optional[HormonalPhaseEnum] = None
    primary_skin_goal: Optional[SkinGoalEnum] = None
    
    notes: Optional[str] = None


# --- Output / Response Schemas ---

class SkinConcernResponse(BaseModel):
    id: int
    assessment_id: int
    concern_name: str
    severity: str
    priority: int
    category: str
    description: Optional[str] = None
    recommended_ingredients: Optional[List[str]] = []
    routine_advice: Optional[str] = None
    avoid_ingredients: Optional[List[str]] = []
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class RiskFactorResponse(BaseModel):
    id: int
    assessment_id: int
    risk_name: str
    description: str
    risk_level: str
    risk_score: Optional[float] = 50.0
    affected_areas: Optional[str] = "Full Face"
    mitigation_tip: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class AssessmentResponse(BaseModel):
    id: int
    user_id: int
    assessment_date: datetime
    skin_type: str
    skin_health_score: float
    overall_condition: str
    
    hydration_level: float
    oiliness_level: float
    sensitivity_level: float
    acne_severity: float
    pigmentation_score: float
    wrinkles_score: float
    
    sun_exposure_hours: float
    spf_frequency: str
    sleep_hours: float
    stress_level: int
    
    climate_environment: str = "Temperate & Balanced"
    water_intake_liters: float = 2.0
    exfoliation_frequency: str = "1-2 Times/Week"
    fitzpatrick_phototype: str = "Type III (Medium)"
    makeup_usage: str = "Light Minimal Makeup"
    hormonal_phase: str = "Not Applicable / Balanced"
    primary_skin_goal: str = "Barrier Repair & Hydration"
    
    notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    
    concerns: List[SkinConcernResponse] = []
    risk_factors: List[RiskFactorResponse] = []

    model_config = ConfigDict(from_attributes=True)


class AssessmentHistoryItem(BaseModel):
    id: int
    assessment_date: datetime
    skin_type: str
    skin_health_score: float
    overall_condition: str
    primary_concern: Optional[str] = None
    high_risk_count: int = 0

    model_config = ConfigDict(from_attributes=True)


class AssessmentHistoryResponse(BaseModel):
    success: bool = True
    user_id: int
    total_assessments: int
    average_score: float
    best_score: Optional[float] = 0.0
    worst_score: Optional[float] = 0.0
    score_velocity: Optional[float] = 0.0
    consistency_rating: Optional[str] = "Stable"
    score_trend: str
    history: List[AssessmentHistoryItem]


class ScoreSummaryResponse(BaseModel):
    success: bool = True
    user_id: int
    latest_assessment_id: Optional[int] = None
    overall_score: float
    overall_condition: str
    last_scan_date: Optional[datetime] = None
    breakdown: List[dict]
    insights: List[str]


class RiskSummaryResponse(BaseModel):
    success: bool = True
    user_id: int
    total_risks_identified: int
    critical_risks: List[RiskFactorResponse] = []
    high_risks: List[RiskFactorResponse] = []
    medium_risks: List[RiskFactorResponse] = []
    low_risks: List[RiskFactorResponse] = []
    general_recommendation: str


# --- Routine Generator Schemas (Module 4) ---

class RoutineCategoryEnum(str, Enum):
    CLEANSING = "🧼 Cleansing"
    EXFOLIATION = "✨ Exfoliation"
    TREATMENT = "💧 Treatment"
    MOISTURIZING = "🧴 Moisturizing"
    SUN_PROTECTION = "☀️ Sun Protection"
    NIGHT_CARE = "🌙 Night Care"

class SeasonEnum(str, Enum):
    SPRING = "Spring"
    SUMMER = "Summer"
    AUTUMN = "Autumn"
    WINTER = "Winter"

class RoutineStepSchema(BaseModel):
    id: str
    step_number: int
    category: str # "🧼 Cleansing", "✨ Exfoliation", etc.
    title: str
    product_recommendation: str
    key_ingredients: List[str] = []
    instructions: str
    time: str
    completed: bool = False
    icon: str # Emojis: 🧼, ✨, 💧, 🧴, ☀️, 🌙

class WeeklyTreatmentItemSchema(BaseModel):
    day: str # e.g. "Wednesday & Sunday"
    focus: str # e.g. "BHA Chemical Exfoliation"
    category: str # "✨ Exfoliation" or "💧 Treatment"
    treatment_name: str
    instructions: str
    icon: str = "✨"

class SeasonalRecommendationSchema(BaseModel):
    season: str
    climate_impact: str
    key_focus: str
    routine_adjustments: List[str] = []
    recommended_ingredients: List[str] = []
    avoid_ingredients: List[str] = []

class AdaptiveUpdateSchema(BaseModel):
    mode: str # e.g. "Optimal Maintenance", "Barrier Repair Safeguard", "Active Boost"
    health_score_delta: float = 0.0
    message: str
    adjustments_made: List[str] = []

class RoutineGenerateRequest(BaseModel):
    assessment_id: Optional[int] = None
    user_id: Optional[int] = 1
    season: Optional[SeasonEnum] = SeasonEnum.SUMMER
    allergies: Optional[List[str]] = []
    sensitivities: Optional[List[str]] = []

class RoutineResponse(BaseModel):
    success: bool = True
    id: int
    user_id: int
    assessment_id: Optional[int] = None
    season: str
    morning_routine: List[RoutineStepSchema]
    evening_routine: List[RoutineStepSchema]
    weekly_plan: List[WeeklyTreatmentItemSchema]
    seasonal_tips: SeasonalRecommendationSchema
    adaptive_notes: Optional[AdaptiveUpdateSchema] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


# --- Image Scan ML Analyzer Schemas ---

class ImageScanRequest(BaseModel):
    user_id: Optional[int] = 1
    image_data: str # Base64 encoded string or data URL
    notes: Optional[str] = "Uploaded photo / webcam snapshot scan"

class ImageScanResponse(BaseModel):
    success: bool = True
    assessment_id: int
    user_id: int
    detected_skin_type: str
    type_confidence: float
    skin_health_score: float
    biomarkers: dict
    lesion_screening: dict
    conditions_detected: List[dict]
    assessment: AssessmentResponse
    generated_routine: Optional[dict] = None


# --- Module 5: Ingredient Intelligence Schemas ---

class IngredientCategoryEnum(str, Enum):
    RETINOIDS = "Retinoids"
    NIACINAMIDE = "Niacinamide"
    VITAMIN_C = "Vitamin C"
    HYALURONIC_ACID = "Hyaluronic Acid"
    SALICYLIC_ACID = "Salicylic Acid"
    CERAMIDES = "Ceramides"
    PEPTIDES = "Peptides"
    AHAS_BHAS = "AHAs/BHAs"

class IngredientSchema(BaseModel):
    id: int
    name: str
    chemical_name: Optional[str] = None
    category: str
    description: str
    primary_benefit: str
    recommended_conc_range: str
    comedogenicity_rating: int
    irritant_rating: int
    target_skin_types: List[str] = []
    suitable_concerns: List[str] = []
    avoid_concerns: List[str] = []
    usage_tips: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class IngredientAnalysisRequest(BaseModel):
    ingredient_names: List[str]
    skin_type: Optional[str] = "Combination"
    sensitivities: Optional[List[str]] = []
    allergies: Optional[List[str]] = []
    active_concerns: Optional[List[str]] = []

class IngredientSuitabilityItem(BaseModel):
    ingredient: str
    category: str
    status: str # "Highly Beneficial", "Suitable", "Use with Caution", "Avoid / Unsuitable"
    safety_score: float # 0 - 100
    reason: str
    primary_benefit: str
    usage_tips: str

class IngredientInteractionItem(BaseModel):
    ingredient_a: str
    ingredient_b: str
    interaction_type: str # Conflict, Synergy, Caution
    severity: str # Low, Moderate, High, Severe, Synergistic
    description: str
    recommendation: str

class IngredientAnalysisResponse(BaseModel):
    success: bool = True
    overall_safety_rating: str # Safe, Caution Required, High Risk
    safety_score: float # 0 - 100
    analyzed_count: int
    flagged_allergens: List[str] = []
    suitability_breakdown: List[IngredientSuitabilityItem]
    interactions: List[IngredientInteractionItem]
    synergies: List[IngredientInteractionItem]
    recommendations: List[str]

class IngredientEducationResponse(BaseModel):
    success: bool = True
    total_categories: int
    categories: List[dict]


# --- Module 6: Product Recommendation Engine Schemas ---

class ProductCategoryEnum(str, Enum):
    FACE_WASH = "Face Wash"
    MOISTURIZER = "Moisturizer"
    SUNSCREEN = "Sunscreen"
    SERUM = "Serum"
    TONER = "Toner"
    TREATMENT = "Treatment Products"
    FACE_MASKS = "Face Masks"

class BudgetTierEnum(str, Enum):
    BUDGET = "Budget" # Under ₹1,000
    MID_RANGE = "Mid-Range" # ₹1,000 - ₹2,500
    PREMIUM = "Premium" # ₹2,500+

class ProductSchema(BaseModel):
    id: int
    name: str
    brand: str
    category: str
    price: float
    budget_tier: str
    rating: float
    key_active_ingredients: List[str]
    full_ingredient_list: List[str]
    target_concerns: List[str]
    suitable_skin_types: List[str]
    comedogenic_level: int = 0
    image_url: Optional[str] = None
    buy_url: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class ProductRecommendationItem(BaseModel):
    product: ProductSchema
    suitability_score: float # 0 - 100%
    match_tier: str # "Top Match", "Great Choice", "Compatible"
    reason: str
    badge: str
    pros: List[str]
    cons: List[str]

class ProductRecommendationRequest(BaseModel):
    user_id: Optional[int] = 1
    assessment_id: Optional[int] = None
    category: Optional[str] = None # Filter by product category
    budget_tier: Optional[str] = None # Budget, Mid-Range, Premium
    max_price: Optional[float] = None
    skin_type: Optional[str] = "Combination"
    active_concerns: Optional[List[str]] = []
    allergies: Optional[List[str]] = []
    limit: int = 10

class ProductRecommendationResponse(BaseModel):
    success: bool = True
    user_id: int
    total_found: int
    category_filter: Optional[str] = None
    budget_filter: Optional[str] = None
    recommendations: List[ProductRecommendationItem]

class ProductComparisonRequest(BaseModel):
    product_ids: List[int]
    user_id: Optional[int] = 1

class ProductComparisonItem(BaseModel):
    product: ProductSchema
    suitability_score: float
    key_actives: List[str]
    target_concerns: List[str]
    allergen_safe: bool
    price_formatted: str
    pros: List[str]

class ProductComparisonResponse(BaseModel):
    success: bool = True
    products_compared: int
    comparison_matrix: List[ProductComparisonItem]
    winner_recommendation: Optional[str] = None

class AlternativeProductResponse(BaseModel):
    success: bool = True
    original_product_id: int
    original_product_name: str
    issue_flagged: str
    safer_alternatives: List[ProductRecommendationItem]


# --- Module 7: Skin Health Scoring Engine Schemas ---

class WeightedScoreBreakdownItem(BaseModel):
    category: str
    score: float # 0 - 100
    weight: float # e.g. 0.35, 0.20, 0.15, 0.20, 0.10
    weight_label: str # "35%", "20%", "15%", "20%", "10%"
    weighted_contribution: float
    status: str # "Optimal", "Good", "Moderate", "Needs Attention"
    color: str # CSS Hex color

class WeightedSkinHealthScoreRequest(BaseModel):
    user_id: Optional[int] = 1
    skin_condition_score: float = 75.0 # 35% weight
    lifestyle_habits_score: float = 80.0 # 20% weight
    sleep_quality_score: float = 70.0 # 15% weight
    routine_consistency_score: float = 85.0 # 20% weight
    hydration_level_score: float = 80.0 # 10% weight

class WeightedSkinHealthScoreResponse(BaseModel):
    success: bool = True
    user_id: int
    overall_skin_health_score: float # Formula: 0.35*Cond + 0.20*Life + 0.15*Sleep + 0.20*Cons + 0.10*Hydr
    grade: str # e.g. "Optimal Barrier (A+)", "Good (Improving)"
    formula_used: str
    breakdown: List[WeightedScoreBreakdownItem]
    insights: List[str]
    improvement_recommendations: List[str]

class RoutineAdherenceLogRequest(BaseModel):
    user_id: Optional[int] = 1
    routine_type: str # Morning, Evening, Weekly
    steps_completed: int
    total_steps: int
    notes: Optional[str] = None

class RoutineAdherenceLogResponse(BaseModel):
    success: bool = True
    user_id: int
    log_date: str
    routine_type: str
    steps_completed: int
    total_steps: int
    adherence_percentage: float
    consistency_score_boost: float
    message: str

class ScoreTrendItem(BaseModel):
    date: str
    overall_score: float
    condition_score: float
    lifestyle_score: float
    sleep_score: float
    routine_consistency: float
    hydration_score: float

class ScoreTrendResponse(BaseModel):
    success: bool = True
    user_id: int
    current_score: float
    previous_score: float
    score_delta: float # e.g. +4.5
    trend_status: str # "Improving", "Stable", "Declining"
    improvement_velocity: str
    timeline: List[ScoreTrendItem]


# ════════════════════════════════════════════════════════════════
# MODULE 8: PROGRESS TRACKING & ANALYTICS SCHEMAS
# ════════════════════════════════════════════════════════════════

class ProgressCheckpointCreateRequest(BaseModel):
    user_id: Optional[int] = 1
    assessment_id: Optional[int] = None
    checkpoint_title: str = "Weekly Routine Checkpoint"
    tag: str = "Milestone" # Baseline, Week 2, Week 4, Milestone, Current
    overall_skin_health_score: float = 78.5
    hydration_level: float = 72.0
    oiliness_level: float = 55.0
    sensitivity_level: float = 22.0
    acne_severity: float = 14.0
    pigmentation_score: float = 20.0
    wrinkles_score: float = 12.0
    barrier_strength: float = 82.0
    redness_reactivity: float = 18.0
    photo_url: Optional[str] = "assets/hero_skin_scan.png"
    routine_adherence_rate: float = 95.0
    clinical_notes: Optional[str] = "Skin barrier showing significant lipid reinforcement."
    key_improvements: List[str] = []
    active_concerns_snapshot: List[str] = []


class ProgressLogItem(BaseModel):
    id: int
    user_id: int
    log_date: str
    checkpoint_title: str
    tag: str
    overall_skin_health_score: float
    hydration_level: float
    oiliness_level: float
    sensitivity_level: float
    acne_severity: float
    pigmentation_score: float
    wrinkles_score: float
    barrier_strength: float
    redness_reactivity: float
    photo_url: Optional[str]
    routine_adherence_rate: float
    clinical_notes: Optional[str]
    key_improvements: List[str]
    active_concerns_snapshot: List[str]


class ProgressHistoryResponse(BaseModel):
    success: bool = True
    user_id: int
    total_checkpoints: int
    baseline_score: float
    current_score: float
    overall_improvement_pts: float
    milestones_achieved: int
    history: List[ProgressLogItem]


class DailyAdherenceCheckInRequest(BaseModel):
    user_id: Optional[int] = 1
    morning_completed: int = 4
    morning_total: int = 4
    evening_completed: int = 5
    evening_total: int = 5
    weekly_treatment_done: int = 0
    water_intake_ml: int = 2250
    sunscreen_reapplied: int = 1
    missed_step_reason: Optional[str] = None
    notes: Optional[str] = None


class DailyAdherenceItem(BaseModel):
    date: str
    day_name: str
    status: str # "Complete", "Partial", "Missed"
    compliance_pct: float
    morning_pct: float
    evening_pct: float
    water_target_met: bool
    streak_active: bool


class RoutineAdherenceAnalyticsResponse(BaseModel):
    success: bool = True
    user_id: int
    current_streak_days: int
    longest_streak_days: int
    weekly_compliance_pct: float # 7-day
    biweekly_compliance_pct: float # 14-day
    monthly_compliance_pct: float # 30-day
    morning_adherence_avg: float
    evening_adherence_avg: float
    total_sessions_logged: int
    adherence_to_score_correlation: str # e.g. "Strong Positive (r = +0.88)"
    adherence_insights: List[str]
    calendar_30_days: List[DailyAdherenceItem]


class BiomarkerDeltaItem(BaseModel):
    parameter: str
    baseline_val: float
    current_val: float
    delta_val: float
    delta_percentage: float
    status: str # "Improved", "Significantly Improved", "Stable", "Attention Required"
    color: str
    clinical_insight: str


class BeforeAfterCompareRequest(BaseModel):
    user_id: Optional[int] = 1
    baseline_checkpoint_id: Optional[int] = None
    current_checkpoint_id: Optional[int] = None


class BeforeAfterCompareResponse(BaseModel):
    success: bool = True
    user_id: int
    days_elapsed: int
    baseline_date: str
    current_date: str
    baseline_image: str
    current_image: str
    baseline_score: float
    current_score: float
    score_delta: float
    verdict: str
    clinical_summary: str
    biomarker_deltas: List[BiomarkerDeltaItem]
    top_positive_drivers: List[str]
    remaining_targets: List[str]


class ScoreTrajectoryPoint(BaseModel):
    day: str
    date_formatted: str
    score: float
    is_projected: bool = False
    hydration: float
    sebum: float
    barrier: float
    sensitivity: float
    adherence_pct: float


class TrendAnalysisResponse(BaseModel):
    success: bool = True
    user_id: int
    timeframe: str # "7d", "30d", "90d", "all"
    improvement_velocity_pts_per_week: float
    projected_score_30d: float
    projected_score_60d: float
    target_score: float
    estimated_days_to_target: int
    trajectory_curve: List[ScoreTrajectoryPoint]
    key_trend_indicators: List[dict]


class ImprovementFactorItem(BaseModel):
    category: str
    metric: str
    improvement_pct: float
    direction: str # "up", "down" (positive reduction in acne)
    impact_level: str # "High", "Moderate", "Critical"
    clinical_explanation: str


class ImprovementAnalysisResponse(BaseModel):
    success: bool = True
    user_id: int
    overall_health_change: str
    velocity_summary: str
    top_improving_factors: List[ImprovementFactorItem]
    areas_for_optimization: List[ImprovementFactorItem]
    ai_dermatologist_verdict: str
    next_stage_routine_adjustments: List[str]


class ProgressSummaryAnalyticsResponse(BaseModel):
    success: bool = True
    user_id: int
    current_health_score: float
    baseline_health_score: float
    score_delta: float
    current_streak: int
    adherence_30d: float
    improvement_velocity: str
    active_milestones: List[dict]
    latest_comparison: BeforeAfterCompareResponse
    quick_trends: List[ScoreTrajectoryPoint]


# =========================================================================
# MODULE 9: DASHBOARD & ANALYTICS SCHEMAS
# =========================================================================

class ChecklistStepItem(BaseModel):
    id: str
    routine_type: str # morning, evening, weekly
    step_number: int
    name: str
    product_name: Optional[str] = None
    time_estimate: str
    instructions: str
    completed: bool = False
    completed_at: Optional[str] = None


class DailyChecklistResponse(BaseModel):
    success: bool = True
    user_id: int
    date: str
    total_steps: int
    completed_steps: int
    completion_pct: float
    morning_routine: List[ChecklistStepItem]
    evening_routine: List[ChecklistStepItem]
    weekly_routine: List[ChecklistStepItem]
    streak_days: int


class ChecklistToggleRequest(BaseModel):
    user_id: int = 1
    routine_type: str # morning, evening, weekly
    step_id: str
    completed: bool
    check_date: Optional[str] = None


class ChecklistToggleResponse(BaseModel):
    success: bool = True
    user_id: int
    step_id: str
    completed: bool
    completion_pct: float
    streak_days: int
    updated_at: str


class SkinHealthScoreBreakdown(BaseModel):
    name: str
    score: float
    weight: str
    status: str
    insight: str


class UserDashboardAnalyticsResponse(BaseModel):
    success: bool = True
    user_id: int
    user_name: str
    overall_health_score: float
    score_breakdown: List[SkinHealthScoreBreakdown]
    skin_type: str
    primary_concerns: List[str]
    current_streak: int
    adherence_rate: float
    daily_checklist: DailyChecklistResponse
    hydration_intake_ml: int
    hydration_target_ml: int
    hydration_progress_pct: float
    sleep_hours: float
    sleep_quality: str
    recommended_products_count: int
    unread_notifications_count: int


class ConsultantClientOverview(BaseModel):
    id: int
    name: str
    email: str
    skin_type: str
    health_score: float
    adherence_pct: float
    priority: str
    last_assessment_date: str
    primary_concern: str
    status: str


class ConsultantDashboardAnalyticsResponse(BaseModel):
    success: bool = True
    consultant_id: int
    consultant_name: str
    total_clients: int
    active_cases: int
    average_client_adherence: float
    average_client_score: float
    clients: List[ConsultantClientOverview]
    skin_type_distribution: dict
    top_concerns: List[dict]


class DermatologistPatientOverview(BaseModel):
    id: int
    name: str
    age: int
    gender: str
    condition: str
    severity: str
    priority: str
    lesion_risk: str
    fitzpatrick: str
    last_visit: str
    next_review: str
    active_rx: Optional[str] = None


class DermatologistDashboardAnalyticsResponse(BaseModel):
    success: bool = True
    doctor_id: int
    doctor_name: str
    total_patients: int
    high_risk_patients_count: int
    pending_prescriptions_count: int
    average_recovery_velocity: str
    patients: List[DermatologistPatientOverview]
    condition_severity_distribution: dict
    optical_lesion_metrics: dict


class AdminDashboardAnalyticsResponse(BaseModel):
    success: bool = True
    total_users: int
    role_distribution: dict
    active_assessments_today: int
    average_platform_adherence: float
    microservices_status: List[dict]
    system_latency_ms: float
    top_recommended_products: List[dict]
    contraindication_alerts_24h: int
    recent_audit_logs: List[dict]


# =========================================================================
# MODULE 10: NOTIFICATION & REMINDER SYSTEM SCHEMAS
# =========================================================================

class NotificationItem(BaseModel):
    id: int
    user_id: int
    title: str
    message: str
    category: str # routine, product, hydration_sleep, clinical, system
    type: str # info, success, warning, alert
    is_read: bool
    action_url: Optional[str] = None
    metadata_json: Optional[dict] = None
    created_at: str


class NotificationListResponse(BaseModel):
    success: bool = True
    user_id: int
    unread_count: int
    total_count: int
    notifications: List[NotificationItem]


class NotificationMarkReadResponse(BaseModel):
    success: bool = True
    marked_count: int
    unread_remaining: int


class ReminderPreferencesSchema(BaseModel):
    user_id: int
    morning_routine_time: str = "08:00"
    evening_routine_time: str = "21:30"
    hydration_target_ml: int = 2500
    hydration_interval_hours: int = 2
    sleep_wind_down_time: str = "22:30"
    sleep_target_hours: float = 8.0
    weekly_scan_day: str = "Sunday"
    enable_routine_reminders: bool = True
    enable_replenishment_alerts: bool = True
    enable_hydration_reminders: bool = True
    enable_sleep_reminders: bool = True
    enable_progress_alerts: bool = True
    enable_platform_notifications: bool = True


class ProductReplenishmentItem(BaseModel):
    id: int
    user_id: int
    product_id: Optional[int] = None
    product_name: str
    category: str
    total_volume_ml: float
    daily_usage_ml: float
    remaining_pct: float
    days_left: int
    status: str # Adequate, Low, Critical, Replenished
    reorder_url: Optional[str] = None
    estimated_depletion_date: str


class ProductReplenishmentResponse(BaseModel):
    success: bool = True
    user_id: int
    active_items: List[ProductReplenishmentItem]
    low_stock_alerts_count: int


class HydrationLogRequest(BaseModel):
    user_id: int = 1
    amount_ml: int = Field(default=250, ge=50, le=2000)
    log_date: Optional[str] = None


class HydrationLogResponse(BaseModel):
    success: bool = True
    user_id: int
    log_date: str
    total_intake_ml: int
    target_ml: int
    progress_percentage: float
    status: str
    logged_at: str


class SleepLogRequest(BaseModel):
    user_id: int = 1
    sleep_hours: float = Field(default=7.5, ge=1.0, le=16.0)
    sleep_quality: str = "Good" # Optimal, Good, Restless, Insufficient
    wind_down_time: Optional[str] = "22:30"
    notes: Optional[str] = None
    log_date: Optional[str] = None


class SleepLogResponse(BaseModel):
    success: bool = True
    user_id: int
    log_date: str
    sleep_hours: float
    sleep_quality: str
    circadian_repair_score: float
    skin_cellular_regeneration_status: str
    recorded_at: str


# =========================================================================
# MODULE 11: REPORTS & EXPORT SYSTEM SCHEMAS
# =========================================================================

class ReportGenerateRequest(BaseModel):
    user_id: int = 1
    report_type: str # assessment, routine, product_recs, progress, skin_health
    format: str = "pdf" # pdf, excel, json
    title_override: Optional[str] = None


class ReportItem(BaseModel):
    id: int
    user_id: int
    report_type: str
    title: str
    summary: str
    format: str
    created_at: str
    report_data: dict


class ReportListResponse(BaseModel):
    success: bool = True
    user_id: int
    total_reports: int
    reports: List[ReportItem]


class ReportDetailResponse(BaseModel):
    success: bool = True
    report: ReportItem


class ReportPDFExportResponse(BaseModel):
    success: bool = True
    report_id: int
    title: str
    html_content: str
    download_filename: str


class CSVExportResponse(BaseModel):
    success: bool = True
    export_type: str
    filename: str
    csv_content: str
    row_count: int




