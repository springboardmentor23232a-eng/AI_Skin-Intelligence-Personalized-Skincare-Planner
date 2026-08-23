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


