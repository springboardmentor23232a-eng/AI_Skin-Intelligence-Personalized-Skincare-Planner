"""
Progress Tracking API Routes
Handles user progress tracking, milestone management, and progress comparison
"""
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from app.progress_tracking import ProgressTracker
from app.database import get_db
from app.models import UserProgress, ProgressMilestone, USE_SQLITE
from app.schemas import (
    UserProgressSchema, ProgressMilestoneSchema,
    ProgressUpdateRequest, ProgressComparisonRequest, ProgressComparisonResponse
)
import uuid
from datetime import datetime

router = APIRouter()
progress_tracker = ProgressTracker()

# Helper function to handle UUID conversion for SQLite
def get_uuid(uuid_str):
    return uuid_str if USE_SQLITE else uuid.UUID(uuid_str)

@router.post("/progress", response_model=UserProgressSchema)
def create_progress_entry(progress: ProgressUpdateRequest, db: Session = Depends(get_db)):
    """
    Create a new progress entry
    """
    try:
        # Get baseline score from user's first assessment (simplified)
        # In real implementation, this would query the database for user's baseline
        baseline_score = progress.current_score - 5  # Placeholder calculation
        
        # Create progress data
        progress_data = progress.dict()
        progress_data['baseline_score'] = baseline_score
        progress_data['user_id'] = get_uuid(progress.user_id)
        progress_data['assessment_id'] = get_uuid(progress.assessment_id)
        
        # Generate progress entry
        progress_entry = progress_tracker.create_progress_entry(progress_data)
        
        # Create database entry
        db_progress = UserProgress(
            user_id=progress_entry['user_id'],
            assessment_id=progress_entry['assessment_id'],
            baseline_score=progress_entry['baseline_score'],
            current_score=progress_entry['current_score'],
            score_change=progress_entry['score_change'],
            improvement_percentage=progress_entry['improvement_percentage'],
            goals_achieved=progress_entry['goals_achieved'],
            ongoing_concerns=progress_entry['ongoing_concerns'],
            resolved_concerns=progress_entry['resolved_concerns'],
            routine_adherence=progress_entry['routine_adherence'],
            milestones=progress_entry['milestones'],
            notes=progress_entry['notes'],
            progress_date=datetime.fromisoformat(progress_entry['progress_date'])
        )
        
        db.add(db_progress)
        db.commit()
        db.refresh(db_progress)
        
        # Create milestone entries
        for milestone_data in progress_entry['milestones']:
            db_milestone = ProgressMilestone(
                user_id=progress_entry['user_id'],
                progress_id=get_uuid(str(db_progress.id)),
                milestone_type=milestone_data['milestone_type'],
                milestone_name=milestone_data['milestone_name'],
                description=milestone_data['description'],
                achieved_date=datetime.utcnow(),
                metadata_=milestone_data['metadata']
            )
            db.add(db_milestone)
        
        db.commit()
        
        return UserProgressSchema(
            id=str(db_progress.id),
            user_id=str(db_progress.user_id),
            assessment_id=str(db_progress.assessment_id),
            baseline_score=db_progress.baseline_score,
            current_score=db_progress.current_score,
            score_change=db_progress.score_change,
            improvement_percentage=db_progress.improvement_percentage,
            goals_achieved=db_progress.goals_achieved,
            ongoing_concerns=db_progress.ongoing_concerns,
            resolved_concerns=db_progress.resolved_concerns,
            routine_adherence=db_progress.routine_adherence,
            milestones=db_progress.milestones,
            notes=db_progress.notes,
            progress_date=db_progress.progress_date,
            created_at=db_progress.created_at
        )
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to create progress entry: {str(e)}")

@router.get("/progress/user/{user_id}")
def get_user_progress(user_id: str, db: Session = Depends(get_db)):
    """
    Get all progress entries for a user
    """
    try:
        db_progress = db.query(UserProgress).filter(
            UserProgress.user_id == get_uuid(user_id)
        ).order_by(UserProgress.progress_date.desc()).all()
        
        progress_entries = []
        for progress in db_progress:
            progress_entries.append(UserProgressSchema(
                id=str(progress.id),
                user_id=str(progress.user_id),
                assessment_id=str(progress.assessment_id),
                baseline_score=progress.baseline_score,
                current_score=progress.current_score,
                score_change=progress.score_change,
                improvement_percentage=progress.improvement_percentage,
                goals_achieved=progress.goals_achieved,
                ongoing_concerns=progress.ongoing_concerns,
                resolved_concerns=progress.resolved_concerns,
                routine_adherence=progress.routine_adherence,
                milestones=progress.milestones,
                notes=progress.notes,
                progress_date=progress.progress_date,
                created_at=progress.created_at
            ))
        
        # Get progress summary
        progress_history = [p.dict() for p in progress_entries]
        summary = progress_tracker.get_progress_summary(user_id, progress_history)
        
        return {
            'user_id': user_id,
            'progress_entries': progress_entries,
            'summary': summary,
            'total_entries': len(progress_entries)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get user progress: {str(e)}")

@router.get("/progress/{progress_id}", response_model=UserProgressSchema)
def get_progress_entry(progress_id: str, db: Session = Depends(get_db)):
    """
    Get a specific progress entry
    """
    try:
        db_progress = db.query(UserProgress).filter(
            UserProgress.id == get_uuid(progress_id)
        ).first()
        
        if not db_progress:
            raise HTTPException(status_code=404, detail="Progress entry not found")
        
        return UserProgressSchema(
            id=str(db_progress.id),
            user_id=str(db_progress.user_id),
            assessment_id=str(db_progress.assessment_id),
            baseline_score=db_progress.baseline_score,
            current_score=db_progress.current_score,
            score_change=db_progress.score_change,
            improvement_percentage=db_progress.improvement_percentage,
            goals_achieved=db_progress.goals_achieved,
            ongoing_concerns=db_progress.ongoing_concerns,
            resolved_concerns=db_progress.resolved_concerns,
            routine_adherence=db_progress.routine_adherence,
            milestones=db_progress.milestones,
            notes=db_progress.notes,
            progress_date=db_progress.progress_date,
            created_at=db_progress.created_at
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get progress entry: {str(e)}")

@router.post("/progress/compare", response_model=ProgressComparisonResponse)
def compare_progress(request: ProgressComparisonRequest, db: Session = Depends(get_db)):
    """
    Compare progress over a time period
    """
    try:
        # Get progress entries for the user
        db_progress = db.query(UserProgress).filter(
            UserProgress.user_id == get_uuid(request.user_id)
        ).order_by(UserProgress.progress_date.asc()).all()
        
        if not db_progress:
            raise HTTPException(status_code=404, detail="No progress data found for user")
        
        # Convert to progress history format
        progress_history = []
        for progress in db_progress:
            progress_history.append({
                'id': str(progress.id),
                'user_id': str(progress.user_id),
                'assessment_id': str(progress.assessment_id),
                'baseline_score': progress.baseline_score,
                'current_score': progress.current_score,
                'score_change': progress.score_change,
                'improvement_percentage': progress.improvement_percentage,
                'goals_achieved': progress.goals_achieved,
                'ongoing_concerns': progress.ongoing_concerns,
                'resolved_concerns': progress.resolved_concerns,
                'routine_adherence': progress.routine_adherence,
                'milestones': progress.milestones,
                'notes': progress.notes,
                'progress_date': progress.progress_date.isoformat()
            })
        
        # Compare progress
        comparison = progress_tracker.compare_progress(
            request.user_id,
            request.start_date,
            request.end_date,
            progress_history
        )
        
        return ProgressComparisonResponse(**comparison)
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to compare progress: {str(e)}")

@router.get("/progress/{progress_id}/milestones")
def get_progress_milestones(progress_id: str, db: Session = Depends(get_db)):
    """
    Get all milestones for a specific progress entry
    """
    try:
        db_milestones = db.query(ProgressMilestone).filter(
            ProgressMilestone.progress_id == get_uuid(progress_id)
        ).order_by(ProgressMilestone.achieved_date.desc()).all()
        
        milestones = []
        for milestone in db_milestones:
            milestones.append(ProgressMilestoneSchema(
                id=str(milestone.id),
                user_id=str(milestone.user_id),
                progress_id=str(milestone.progress_id),
                milestone_type=milestone.milestone_type,
                milestone_name=milestone.milestone_name,
                description=milestone.description,
                achieved_date=milestone.achieved_date,
                metadata=milestone.metadata_,
                created_at=milestone.created_at
            ))
        
        return {
            'progress_id': progress_id,
            'milestones': milestones,
            'total_count': len(milestones)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get milestones: {str(e)}")

@router.get("/progress/user/{user_id}/milestones")
def get_user_milestones(user_id: str, db: Session = Depends(get_db)):
    """
    Get all milestones for a user
    """
    try:
        db_milestones = db.query(ProgressMilestone).filter(
            ProgressMilestone.user_id == get_uuid(user_id)
        ).order_by(ProgressMilestone.achieved_date.desc()).all()
        
        milestones = []
        for milestone in db_milestones:
            milestones.append(ProgressMilestoneSchema(
                id=str(milestone.id),
                user_id=str(milestone.user_id),
                progress_id=str(milestone.progress_id),
                milestone_type=milestone.milestone_type,
                milestone_name=milestone.milestone_name,
                description=milestone.description,
                achieved_date=milestone.achieved_date,
                metadata=milestone.metadata_,
                created_at=milestone.created_at
            ))
        
        return {
            'user_id': user_id,
            'milestones': milestones,
            'total_count': len(milestones)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get user milestones: {str(e)}")

@router.post("/progress/milestone")
def create_milestone(
    user_id: str,
    progress_id: str,
    milestone_type: str,
    milestone_name: str,
    description: str = None,
    metadata: dict = None,
    db: Session = Depends(get_db)
):
    """
    Create a custom milestone
    """
    try:
        milestone_data = progress_tracker.create_milestone(
            user_id, progress_id, milestone_type, milestone_name, description, metadata
        )
        
        db_milestone = ProgressMilestone(
            user_id=get_uuid(milestone_data['user_id']),
            progress_id=get_uuid(milestone_data['progress_id']),
            milestone_type=milestone_data['milestone_type'],
            milestone_name=milestone_data['milestone_name'],
            description=milestone_data['description'],
            achieved_date=datetime.fromisoformat(milestone_data['achieved_date']),
            metadata_=milestone_data['metadata']
        )
        
        db.add(db_milestone)
        db.commit()
        db.refresh(db_milestone)
        
        return ProgressMilestoneSchema(
            id=str(db_milestone.id),
            user_id=str(db_milestone.user_id),
            progress_id=str(db_milestone.progress_id),
            milestone_type=db_milestone.milestone_type,
            milestone_name=db_milestone.milestone_name,
            description=db_milestone.description,
            achieved_date=db_milestone.achieved_date,
            metadata=db_milestone.metadata_,
            created_at=db_milestone.created_at
        )
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to create milestone: {str(e)}")

@router.get("/progress/milestone-types")
def get_milestone_types():
    """
    Get available milestone types
    """
    return progress_tracker.milestone_types
