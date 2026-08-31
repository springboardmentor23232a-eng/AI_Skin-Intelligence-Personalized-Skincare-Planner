"""
Analytics and Dashboard API Routes
Handles skincare analytics, insights generation, and dashboard management
"""
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from app.analytics import AnalyticsEngine, DashboardManager
from app.database import get_db
from app.models import SkinAnalytics, UserDashboard, USE_SQLITE
from app.schemas import (
    SkinAnalyticsSchema, AnalyticsRequest, AnalyticsResponse,
    UserDashboardSchema, DashboardUpdateRequest, DashboardResponse
)
import uuid
from datetime import datetime

router = APIRouter()
analytics_engine = AnalyticsEngine()
dashboard_manager = DashboardManager()

# Helper function to handle UUID conversion for SQLite
def get_uuid(uuid_str):
    return uuid_str if USE_SQLITE else uuid.UUID(uuid_str)

@router.post("/analytics", response_model=AnalyticsResponse)
def generate_analytics(request: AnalyticsRequest, db: Session = Depends(get_db)):
    """
    Generate comprehensive analytics for a user
    """
    try:
        # Get user's assessment history (simplified - would query database in real implementation)
        assessment_history = []  # Placeholder
        routine_history = []  # Placeholder
        product_history = []  # Placeholder
        
        # Generate analytics
        analytics_data = analytics_engine.generate_analytics(
            request.dict(),
            assessment_history,
            routine_history,
            product_history
        )
        
        # Create database entry
        db_analytics = SkinAnalytics(
            user_id=get_uuid(request.user_id),
            assessment_id=get_uuid(analytics_data['assessment_id']) if analytics_data.get('assessment_id') else None,
            time_period=analytics_data['time_period'],
            start_date=datetime.fromisoformat(analytics_data['start_date']),
            end_date=datetime.fromisoformat(analytics_data['end_date']),
            average_score=analytics_data['average_score'],
            score_trend=analytics_data['score_trend'],
            highest_score=analytics_data['highest_score'],
            lowest_score=analytics_data['lowest_score'],
            concern_frequency=analytics_data['concern_frequency'],
            resolved_concerns_count=analytics_data['resolved_concerns_count'],
            new_concerns_count=analytics_data['new_concerns_count'],
            routine_changes_count=analytics_data['routine_changes_count'],
            routine_adherence_avg=analytics_data['routine_adherence_avg'],
            products_used=analytics_data['products_used'],
            product_effectiveness=analytics_data['product_effectiveness'],
            lifestyle_factors_impact=analytics_data['lifestyle_factors_impact'],
            insights=analytics_data['insights'],
            recommendations=analytics_data['recommendations']
        )
        
        db.add(db_analytics)
        db.commit()
        db.refresh(db_analytics)
        
        # Generate charts data
        charts_data = analytics_engine.get_charts_data(analytics_data)
        
        # Generate key insights and actionable recommendations
        key_insights = analytics_data['insights'][:5]  # Top 5 insights
        actionable_recommendations = analytics_data['recommendations'][:5]  # Top 5 recommendations
        
        return AnalyticsResponse(
            analytics=SkinAnalyticsSchema(
                id=str(db_analytics.id),
                user_id=str(db_analytics.user_id),
                assessment_id=str(db_analytics.assessment_id) if db_analytics.assessment_id else None,
                time_period=db_analytics.time_period,
                start_date=db_analytics.start_date,
                end_date=db_analytics.end_date,
                average_score=db_analytics.average_score,
                score_trend=db_analytics.score_trend,
                highest_score=db_analytics.highest_score,
                lowest_score=db_analytics.lowest_score,
                concern_frequency=db_analytics.concern_frequency,
                resolved_concerns_count=db_analytics.resolved_concerns_count,
                new_concerns_count=db_analytics.new_concerns_count,
                routine_changes_count=db_analytics.routine_changes_count,
                routine_adherence_avg=db_analytics.routine_adherence_avg,
                products_used=db_analytics.products_used,
                product_effectiveness=db_analytics.product_effectiveness,
                lifestyle_factors_impact=db_analytics.lifestyle_factors_impact,
                insights=db_analytics.insights,
                recommendations=db_analytics.recommendations,
                created_at=db_analytics.created_at,
                updated_at=db_analytics.updated_at
            ),
            charts_data=charts_data,
            key_insights=key_insights,
            actionable_recommendations=actionable_recommendations
        )
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to generate analytics: {str(e)}")

@router.get("/analytics/user/{user_id}")
def get_user_analytics(user_id: str, db: Session = Depends(get_db)):
    """
    Get all analytics entries for a user
    """
    try:
        db_analytics = db.query(SkinAnalytics).filter(
            SkinAnalytics.user_id == get_uuid(user_id)
        ).order_by(SkinAnalytics.created_at.desc()).all()
        
        analytics_entries = []
        for analytics in db_analytics:
            analytics_entries.append(SkinAnalyticsSchema(
                id=str(analytics.id),
                user_id=str(analytics.user_id),
                assessment_id=str(analytics.assessment_id) if analytics.assessment_id else None,
                time_period=analytics.time_period,
                start_date=analytics.start_date,
                end_date=analytics.end_date,
                average_score=analytics.average_score,
                score_trend=analytics.score_trend,
                highest_score=analytics.highest_score,
                lowest_score=analytics.lowest_score,
                concern_frequency=analytics.concern_frequency,
                resolved_concerns_count=analytics.resolved_concerns_count,
                new_concerns_count=analytics.new_concerns_count,
                routine_changes_count=analytics.routine_changes_count,
                routine_adherence_avg=analytics.routine_adherence_avg,
                products_used=analytics.products_used,
                product_effectiveness=analytics.product_effectiveness,
                lifestyle_factors_impact=analytics.lifestyle_factors_impact,
                insights=analytics.insights,
                recommendations=analytics.recommendations,
                created_at=analytics.created_at,
                updated_at=analytics.updated_at
            ))
        
        return {
            'user_id': user_id,
            'analytics_entries': analytics_entries,
            'total_entries': len(analytics_entries)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get user analytics: {str(e)}")

@router.get("/analytics/{analytics_id}", response_model=SkinAnalyticsSchema)
def get_analytics_entry(analytics_id: str, db: Session = Depends(get_db)):
    """
    Get a specific analytics entry
    """
    try:
        db_analytics = db.query(SkinAnalytics).filter(
            SkinAnalytics.id == get_uuid(analytics_id)
        ).first()
        
        if not db_analytics:
            raise HTTPException(status_code=404, detail="Analytics entry not found")
        
        return SkinAnalyticsSchema(
            id=str(db_analytics.id),
            user_id=str(db_analytics.user_id),
            assessment_id=str(db_analytics.assessment_id) if db_analytics.assessment_id else None,
            time_period=db_analytics.time_period,
            start_date=db_analytics.start_date,
            end_date=db_analytics.end_date,
            average_score=db_analytics.average_score,
            score_trend=db_analytics.score_trend,
            highest_score=db_analytics.highest_score,
            lowest_score=db_analytics.lowest_score,
            concern_frequency=db_analytics.concern_frequency,
            resolved_concerns_count=db_analytics.resolved_concerns_count,
            new_concerns_count=db_analytics.new_concerns_count,
            routine_changes_count=db_analytics.routine_changes_count,
            routine_adherence_avg=db_analytics.routine_adherence_avg,
            products_used=db_analytics.products_used,
            product_effectiveness=db_analytics.product_effectiveness,
            lifestyle_factors_impact=db_analytics.lifestyle_factors_impact,
            insights=db_analytics.insights,
            recommendations=db_analytics.recommendations,
            created_at=db_analytics.created_at,
            updated_at=db_analytics.updated_at
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get analytics entry: {str(e)}")

@router.post("/dashboard", response_model=DashboardResponse)
def create_or_get_dashboard(user_id: str, db: Session = Depends(get_db)):
    """
    Create or get user dashboard
    """
    try:
        # Check if dashboard exists
        db_dashboard = db.query(UserDashboard).filter(
            UserDashboard.user_id == get_uuid(user_id)
        ).first()
        
        # Get sample analytics and progress (would come from database in real implementation)
        analytics = {
            'average_score': 75,
            'score_history': [70, 72, 75, 73, 75],
            'concern_frequency': {'acne': 3, 'dryness': 2},
            'resolved_concerns_count': 1,
            'new_concerns_count': 0,
            'routine_adherence_avg': 85,
            'products_used': ['Cleanser', 'Moisturizer'],
            'score_trend': 'improving'
        }
        
        progress_summary = {
            'total_improvement': 5,
            'achievements': {'total_milestones': 3},
            'routine_performance': {'latest_adherence': 85}
        }
        
        if db_dashboard:
            # Update existing dashboard
            dashboard_data = dashboard_manager.create_dashboard(
                user_id, analytics, progress_summary
            )
            
            db_dashboard.current_skin_score = dashboard_data['dashboard']['current_skin_score']
            db_dashboard.score_change = dashboard_data['dashboard']['score_change']
            db_dashboard.active_concerns_count = dashboard_data['dashboard']['active_concerns_count']
            db_dashboard.routine_adherence = dashboard_data['dashboard']['routine_adherence']
            db_dashboard.updated_at = datetime.utcnow()
            
            db.commit()
            db.refresh(db_dashboard)
        else:
            # Create new dashboard
            dashboard_data = dashboard_manager.create_dashboard(
                user_id, analytics, progress_summary
            )
            
            db_dashboard = UserDashboard(
                user_id=get_uuid(user_id),
                layout_config=dashboard_data['dashboard']['layout_config'],
                widget_settings=dashboard_data['dashboard']['widget_settings'],
                current_skin_score=dashboard_data['dashboard']['current_skin_score'],
                score_change=dashboard_data['dashboard']['score_change'],
                active_concerns_count=dashboard_data['dashboard']['active_concerns_count'],
                routine_adherence=dashboard_data['dashboard']['routine_adherence'],
                recent_assessments=dashboard_data['dashboard']['recent_assessments'],
                recent_routines=dashboard_data['dashboard']['recent_routines'],
                active_goals=dashboard_data['dashboard']['active_goals'],
                goal_progress=dashboard_data['dashboard']['goal_progress'],
                unread_notifications=dashboard_data['dashboard']['unread_notifications'],
                notification_preferences=dashboard_data['dashboard']['notification_preferences']
            )
            
            db.add(db_dashboard)
            db.commit()
            db.refresh(db_dashboard)
        
        return DashboardResponse(
            dashboard=UserDashboardSchema(
                id=str(db_dashboard.id),
                user_id=str(db_dashboard.user_id),
                layout_config=db_dashboard.layout_config,
                widget_settings=db_dashboard.widget_settings,
                current_skin_score=db_dashboard.current_skin_score,
                score_change=db_dashboard.score_change,
                active_concerns_count=db_dashboard.active_concerns_count,
                routine_adherence=db_dashboard.routine_adherence,
                recent_assessments=db_dashboard.recent_assessments,
                recent_routines=db_dashboard.recent_routines,
                active_goals=db_dashboard.active_goals,
                goal_progress=db_dashboard.goal_progress,
                unread_notifications=db_dashboard.unread_notifications,
                notification_preferences=db_dashboard.notification_preferences,
                created_at=db_dashboard.created_at,
                updated_at=db_dashboard.updated_at
            ),
            quick_stats=dashboard_data['quick_stats'],
            personalized_insights=dashboard_data['personalized_insights'],
            recommended_actions=dashboard_data['recommended_actions']
        )
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to create/get dashboard: {str(e)}")

@router.put("/dashboard/{user_id}", response_model=DashboardResponse)
def update_dashboard(user_id: str, update_data: DashboardUpdateRequest, db: Session = Depends(get_db)):
    """
    Update user dashboard configuration
    """
    try:
        db_dashboard = db.query(UserDashboard).filter(
            UserDashboard.user_id == get_uuid(user_id)
        ).first()
        
        if not db_dashboard:
            raise HTTPException(status_code=404, detail="Dashboard not found")
        
        # Update dashboard
        updated_dashboard = dashboard_manager.update_dashboard(
            user_id, update_data.dict(), db_dashboard.__dict__
        )
        
        # Apply updates to database
        if update_data.layout_config:
            db_dashboard.layout_config = update_data.layout_config
        if update_data.widget_settings:
            db_dashboard.widget_settings = update_data.widget_settings
        if update_data.notification_preferences:
            db_dashboard.notification_preferences = update_data.notification_preferences
        
        db_dashboard.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(db_dashboard)
        
        # Get updated dashboard data
        analytics = {
            'average_score': db_dashboard.current_skin_score,
            'score_history': [db_dashboard.current_skin_score - 5, db_dashboard.current_skin_score],
            'concern_frequency': {},
            'resolved_concerns_count': 0,
            'new_concerns_count': 0,
            'routine_adherence_avg': db_dashboard.routine_adherence,
            'products_used': [],
            'score_trend': 'stable'
        }
        
        progress_summary = {
            'total_improvement': db_dashboard.score_change if db_dashboard.score_change else 0,
            'achievements': {'total_milestones': 0},
            'routine_performance': {'latest_adherence': db_dashboard.routine_adherence}
        }
        
        dashboard_data = dashboard_manager.create_dashboard(
            user_id, analytics, progress_summary
        )
        
        return DashboardResponse(
            dashboard=UserDashboardSchema(
                id=str(db_dashboard.id),
                user_id=str(db_dashboard.user_id),
                layout_config=db_dashboard.layout_config,
                widget_settings=db_dashboard.widget_settings,
                current_skin_score=db_dashboard.current_skin_score,
                score_change=db_dashboard.score_change,
                active_concerns_count=db_dashboard.active_concerns_count,
                routine_adherence=db_dashboard.routine_adherence,
                recent_assessments=db_dashboard.recent_assessments,
                recent_routines=db_dashboard.recent_routines,
                active_goals=db_dashboard.active_goals,
                goal_progress=db_dashboard.goal_progress,
                unread_notifications=db_dashboard.unread_notifications,
                notification_preferences=db_dashboard.notification_preferences,
                created_at=db_dashboard.created_at,
                updated_at=db_dashboard.updated_at
            ),
            quick_stats=dashboard_data['quick_stats'],
            personalized_insights=dashboard_data['personalized_insights'],
            recommended_actions=dashboard_data['recommended_actions']
        )
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to update dashboard: {str(e)}")

@router.get("/dashboard/{user_id}", response_model=UserDashboardSchema)
def get_dashboard(user_id: str, db: Session = Depends(get_db)):
    """
    Get user dashboard
    """
    try:
        db_dashboard = db.query(UserDashboard).filter(
            UserDashboard.user_id == get_uuid(user_id)
        ).first()
        
        if not db_dashboard:
            raise HTTPException(status_code=404, detail="Dashboard not found")
        
        return UserDashboardSchema(
            id=str(db_dashboard.id),
            user_id=str(db_dashboard.user_id),
            layout_config=db_dashboard.layout_config,
            widget_settings=db_dashboard.widget_settings,
            current_skin_score=db_dashboard.current_skin_score,
            score_change=db_dashboard.score_change,
            active_concerns_count=db_dashboard.active_concerns_count,
            routine_adherence=db_dashboard.routine_adherence,
            recent_assessments=db_dashboard.recent_assessments,
            recent_routines=db_dashboard.recent_routines,
            active_goals=db_dashboard.active_goals,
            goal_progress=db_dashboard.goal_progress,
            unread_notifications=db_dashboard.unread_notifications,
            notification_preferences=db_dashboard.notification_preferences,
            created_at=db_dashboard.created_at,
            updated_at=db_dashboard.updated_at
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get dashboard: {str(e)}")