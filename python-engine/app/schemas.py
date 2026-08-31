from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class AssessmentRequest(BaseModel):
    age: int = Field(..., ge=0, le=120, description="User's age")
    skin_type: str = Field(..., description="Skin type: oily, dry, combination, normal")
    water_intake: float = Field(..., ge=0, le=10, description="Daily water intake in liters")
    sleep_hours: float = Field(..., ge=0, le=24, description="Daily sleep hours")
    sun_exposure: str = Field(..., description="Sun exposure level: low, medium, high")
    smoking: bool = Field(..., description="Smoking status")
    stress_level: Optional[str] = Field("low", description="Stress level: low, medium, high")

class AssessmentResponse(BaseModel):
    id: str
    user_id: str
    skin_health_score: int
    overall_condition: str
    concerns: List[str]
    priority: str
    risk_factors: List[str]
    assessment_date: datetime
    created_at: datetime
    notes: Optional[str] = None

class AssessmentUpdate(BaseModel):
    age: Optional[int] = Field(None, ge=0, le=120)
    skin_type: Optional[str] = None
    water_intake: Optional[float] = Field(None, ge=0, le=10)
    sleep_hours: Optional[float] = Field(None, ge=0, le=24)
    sun_exposure: Optional[str] = None
    smoking: Optional[bool] = None
    stress_level: Optional[str] = None
    notes: Optional[str] = None

class ConcernResponse(BaseModel):
    id: str
    assessment_id: str
    concern_name: str
    severity: str
    priority: str

class RiskFactorResponse(BaseModel):
    id: str
    assessment_id: str
    risk_name: str
    description: Optional[str]
    risk_level: str

class HistoryResponse(BaseModel):
    assessments: List[AssessmentResponse]
    total_count: int

class SkinTypePredictionResponse(BaseModel):
    success: bool
    skin_type: str
    confidence: float
    message: str

class ClassifierInfoResponse(BaseModel):
    success: bool
    model_loaded: bool
    model_path: str
    supported_classes: List[str]
    input_size: List[int]

# Routine Generation Schemas
class RoutineStepSchema(BaseModel):
    step_order: int
    category: str
    step_name: str
    description: Optional[str] = None
    duration_minutes: Optional[int] = None
    product_recommendations: Optional[List[str]] = None

class RoutineRequest(BaseModel):
    user_id: str
    assessment_id: Optional[str] = None
    routine_type: str  # morning, evening, weekly, seasonal
    skin_type: Optional[str] = None
    skin_concerns: Optional[List[str]] = None
    skin_health_score: Optional[int] = None
    allergies: Optional[List[str]] = None
    lifestyle_factors: Optional[dict] = None
    season: Optional[str] = None  # for seasonal routines

class RoutineResponse(BaseModel):
    id: str
    user_id: str
    assessment_id: Optional[str] = None
    routine_name: str
    routine_type: str
    routine_steps: List[RoutineStepSchema]
    personalized_factors: dict
    products: List[str]
    created_at: datetime
    updated_at: datetime

class RoutineUpdateRequest(BaseModel):
    routine_name: Optional[str] = None
    routine_steps: Optional[List[RoutineStepSchema]] = None
    personalized_factors: Optional[dict] = None
    products: Optional[List[str]] = None

class AIPersonalizationRequest(BaseModel):
    skin_type: str
    skin_concerns: List[str]
    skin_health_score: int
    allergies: List[str]
    lifestyle_factors: dict
    routine_type: str
    season: Optional[str] = None
    previous_assessment_results: Optional[dict] = None

class AIPersonalizationResponse(BaseModel):
    routine_steps: List[RoutineStepSchema]
    personalized_recommendations: str
    product_suggestions: List[str]
    lifestyle_tips: List[str]

# Ingredient Intelligence Schemas
class IngredientSchema(BaseModel):
    name: str
    category: str
    description: Optional[str] = None
    benefits: Optional[List[str]] = None
    concerns: Optional[List[str]] = None
    suitable_skin_types: Optional[List[str]] = None
    concentration_range: Optional[str] = None
    interactions: Optional[List[dict]] = None
    common_allergens: Optional[List[str]] = None
    educational_info: Optional[dict] = None

class IngredientAnalysisRequest(BaseModel):
    ingredient_name: str
    skin_type: Optional[str] = None
    skin_concerns: Optional[List[str]] = None
    allergies: Optional[List[str]] = None
    current_ingredients: Optional[List[str]] = None  # For interaction analysis

class IngredientAnalysisResponse(BaseModel):
    ingredient: IngredientSchema
    suitability_score: int  # 0-100
    is_suitable: bool
    suitability_reason: str
    interaction_warnings: List[str]
    allergy_alerts: List[str]
    educational_summary: str
    recommendations: List[str]

class IngredientInteractionRequest(BaseModel):
    ingredients: List[str]  # List of ingredient names to analyze for interactions

class IngredientInteractionResponse(BaseModel):
    ingredients: List[str]
    interactions: List[dict]
    has_conflicts: bool
    severity: str  # safe, caution, avoid
    recommendations: List[str]

# Product Recommendation Schemas
class ProductSchema(BaseModel):
    id: str
    name: str
    brand: Optional[str] = None
    category: str
    product_type: Optional[str] = None
    price: Optional[float] = None
    currency: str = "USD"
    ingredients: Optional[List[str]] = None
    key_ingredients: Optional[List[str]] = None
    suitable_skin_types: Optional[List[str]] = None
    target_concerns: Optional[List[str]] = None
    benefits: Optional[List[str]] = None
    warnings: Optional[List[str]] = None
    usage_instructions: Optional[str] = None
    rating: Optional[float] = None
    reviews_count: int = 0
    availability: str = "available"
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class ProductRecommendationRequest(BaseModel):
    user_id: str
    assessment_id: Optional[str] = None
    skin_type: str
    skin_concerns: List[str]
    skin_health_score: int
    allergies: List[str]
    budget_category: Optional[str] = None  # budget, mid_range, luxury
    preferred_brands: Optional[List[str]] = None
    excluded_brands: Optional[List[str]] = None
    product_categories: Optional[List[str]] = None  # Specific categories wanted

class ProductRecommendationResponse(BaseModel):
    id: str
    user_id: str
    assessment_id: Optional[str] = None
    product: ProductSchema
    suitability_score: int
    recommendation_reason: str
    priority: str
    category: str
    budget_category: Optional[str] = None
    is_alternative: bool
    alternative_for: Optional[str] = None
    created_at: datetime

class ProductComparisonRequest(BaseModel):
    product_ids: List[str]
    user_skin_type: str
    user_concerns: List[str]

class ProductComparisonResponse(BaseModel):
    products: List[ProductSchema]
    comparison_matrix: dict
    best_overall: str
    recommendations: dict

class AlternativeProductsRequest(BaseModel):
    product_id: str
    user_id: str
    reason: Optional[str] = None  # budget, availability, preference, etc.
    budget_category: Optional[str] = None

class AlternativeProductsResponse(BaseModel):
    original_product: ProductSchema
    alternatives: List[ProductRecommendationResponse]
    recommendation_summary: str

# Progress Tracking Schemas
class UserProgressSchema(BaseModel):
    id: str
    user_id: str
    assessment_id: str
    baseline_score: int
    current_score: int
    score_change: int
    improvement_percentage: Optional[float] = None
    goals_achieved: Optional[List[str]] = None
    ongoing_concerns: Optional[List[str]] = None
    resolved_concerns: Optional[List[str]] = None
    routine_adherence: Optional[float] = None
    milestones: Optional[List[dict]] = None
    notes: Optional[str] = None
    progress_date: datetime
    created_at: datetime

class ProgressMilestoneSchema(BaseModel):
    id: str
    user_id: str
    progress_id: str
    milestone_type: str
    milestone_name: str
    description: Optional[str] = None
    achieved_date: datetime
    metadata: Optional[dict] = None
    created_at: datetime

class ProgressUpdateRequest(BaseModel):
    user_id: str
    assessment_id: str
    current_score: int
    goals_achieved: Optional[List[str]] = None
    resolved_concerns: Optional[List[str]] = None
    routine_adherence: Optional[float] = None
    notes: Optional[str] = None

class ProgressComparisonRequest(BaseModel):
    user_id: str
    start_date: datetime
    end_date: datetime

class ProgressComparisonResponse(BaseModel):
    user_id: str
    time_period: dict
    score_progression: List[dict]
    concern_resolution: dict
    overall_improvement: dict
    insights: List[str]
    recommendations: List[str]

# Analytics Schemas
class SkinAnalyticsSchema(BaseModel):
    id: str
    user_id: str
    assessment_id: Optional[str] = None
    time_period: str
    start_date: datetime
    end_date: datetime
    average_score: Optional[float] = None
    score_trend: Optional[str] = None
    highest_score: Optional[int] = None
    lowest_score: Optional[int] = None
    concern_frequency: Optional[dict] = None
    resolved_concerns_count: int = 0
    new_concerns_count: int = 0
    routine_changes_count: int = 0
    routine_adherence_avg: Optional[float] = None
    products_used: Optional[List[str]] = None
    product_effectiveness: Optional[dict] = None
    lifestyle_factors_impact: Optional[dict] = None
    insights: Optional[List[str]] = None
    recommendations: Optional[List[str]] = None
    created_at: datetime
    updated_at: datetime

class AnalyticsRequest(BaseModel):
    user_id: str
    time_period: str  # daily, weekly, monthly, yearly
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None

class AnalyticsResponse(BaseModel):
    analytics: SkinAnalyticsSchema
    charts_data: dict  # Data for visualization
    key_insights: List[str]
    actionable_recommendations: List[str]

# Dashboard Schemas
class UserDashboardSchema(BaseModel):
    id: str
    user_id: str
    layout_config: Optional[dict] = None
    widget_settings: Optional[dict] = None
    current_skin_score: Optional[int] = None
    score_change: Optional[int] = None
    active_concerns_count: int = 0
    routine_adherence: Optional[float] = None
    recent_assessments: Optional[List[dict]] = None
    recent_routines: Optional[List[dict]] = None
    active_goals: Optional[List[dict]] = None
    goal_progress: Optional[dict] = None
    unread_notifications: int = 0
    notification_preferences: Optional[dict] = None
    created_at: datetime
    updated_at: datetime

class DashboardUpdateRequest(BaseModel):
    layout_config: Optional[dict] = None
    widget_settings: Optional[dict] = None
    notification_preferences: Optional[dict] = None

class DashboardResponse(BaseModel):
    dashboard: UserDashboardSchema
    quick_stats: dict
    personalized_insights: List[str]
    recommended_actions: List[str]
