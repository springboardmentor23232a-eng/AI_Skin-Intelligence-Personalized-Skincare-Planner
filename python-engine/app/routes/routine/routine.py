"""
Skincare Routine API Routes
Handles routine generation, storage, and retrieval
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import uuid
from datetime import datetime

from app.database import get_db
from app.models import SkincareRoutine, RoutineStep, USE_SQLITE
from app.schemas import (
    RoutineRequest, RoutineResponse, RoutineUpdateRequest,
    AIPersonalizationRequest, AIPersonalizationResponse
)

try:
    from app.routine_generator import RoutineGenerator
    ROUTINE_GENERATOR_AVAILABLE = True
except ModuleNotFoundError:
    RoutineGenerator = None
    ROUTINE_GENERATOR_AVAILABLE = False

router = APIRouter()
routine_generator = RoutineGenerator() if ROUTINE_GENERATOR_AVAILABLE else None

# Helper function to handle UUID conversion for SQLite
def get_uuid(uuid_str):
    return uuid_str if USE_SQLITE else uuid.UUID(uuid_str)

@router.post("/routine", response_model=RoutineResponse)
def create_routine(routine: RoutineRequest, db: Session = Depends(get_db)):
    """
    Create a new personalized skincare routine
    """
    try:
        if routine_generator is None:
            raise HTTPException(
                status_code=503,
                detail="Routine generator is unavailable because the Groq SDK is not installed."
            )

        # Generate personalized routine
        routine_data = routine_generator.generate_routine(routine.dict())
        
        # Create routine in database
        db_routine = SkincareRoutine(
            user_id=get_uuid(routine.user_id),
            assessment_id=get_uuid(routine.assessment_id) if routine.assessment_id else None,
            routine_name=f"{routine.routine_type.capitalize()} Skincare Routine",
            routine_type=routine.routine_type,
            routine_steps=routine_data['routine_steps'],
            personalized_factors=routine_data['personalized_factors'],
            products=routine_data['products']
        )
        
        db.add(db_routine)
        db.commit()
        db.refresh(db_routine)
        
        # Create routine steps
        for step_data in routine_data['routine_steps']:
            db_step = RoutineStep(
                routine_id=get_uuid(str(db_routine.id)),
                step_order=step_data['step_order'],
                category=step_data['category'],
                step_name=step_data['step_name'],
                description=step_data.get('description'),
                duration_minutes=step_data.get('duration_minutes'),
                product_recommendations=step_data.get('product_recommendations', [])
            )
            db.add(db_step)
        
        db.commit()
        
        return RoutineResponse(
            id=str(db_routine.id),
            user_id=str(db_routine.user_id),
            assessment_id=str(db_routine.assessment_id) if db_routine.assessment_id else None,
            routine_name=db_routine.routine_name,
            routine_type=db_routine.routine_type,
            routine_steps=routine_data['routine_steps'],
            personalized_factors=routine_data['personalized_factors'],
            products=routine_data['products'],
            created_at=db_routine.created_at,
            updated_at=db_routine.updated_at
        )
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to create routine: {str(e)}")

@router.get("/routine/{routine_id}", response_model=RoutineResponse)
def get_routine(routine_id: str, db: Session = Depends(get_db)):
    """
    Get a specific skincare routine by ID
    """
    try:
        db_routine = db.query(SkincareRoutine).filter(
            SkincareRoutine.id == get_uuid(routine_id)
        ).first()
        
        if not db_routine:
            raise HTTPException(status_code=404, detail="Routine not found")
        
        return RoutineResponse(
            id=str(db_routine.id),
            user_id=str(db_routine.user_id),
            assessment_id=str(db_routine.assessment_id) if db_routine.assessment_id else None,
            routine_name=db_routine.routine_name,
            routine_type=db_routine.routine_type,
            routine_steps=db_routine.routine_steps,
            personalized_factors=db_routine.personalized_factors,
            products=db_routine.products,
            created_at=db_routine.created_at,
            updated_at=db_routine.updated_at
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get routine: {str(e)}")

@router.get("/routine/user/{user_id}", response_model=List[RoutineResponse])
def get_user_routines(user_id: str, db: Session = Depends(get_db)):
    """
    Get all routines for a specific user
    """
    try:
        db_routines = db.query(SkincareRoutine).filter(
            SkincareRoutine.user_id == get_uuid(user_id)
        ).order_by(SkincareRoutine.created_at.desc()).all()
        
        routines = []
        for db_routine in db_routines:
            routines.append(RoutineResponse(
                id=str(db_routine.id),
                user_id=str(db_routine.user_id),
                assessment_id=str(db_routine.assessment_id) if db_routine.assessment_id else None,
                routine_name=db_routine.routine_name,
                routine_type=db_routine.routine_type,
                routine_steps=db_routine.routine_steps,
                personalized_factors=db_routine.personalized_factors,
                products=db_routine.products,
                created_at=db_routine.created_at,
                updated_at=db_routine.updated_at
            ))
        
        return routines
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get user routines: {str(e)}")

@router.put("/routine/{routine_id}", response_model=RoutineResponse)
def update_routine(routine_id: str, routine_update: RoutineUpdateRequest, db: Session = Depends(get_db)):
    """
    Update an existing skincare routine
    """
    try:
        db_routine = db.query(SkincareRoutine).filter(
            SkincareRoutine.id == get_uuid(routine_id)
        ).first()
        
        if not db_routine:
            raise HTTPException(status_code=404, detail="Routine not found")
        
        # Update fields if provided
        if routine_update.routine_name:
            db_routine.routine_name = routine_update.routine_name
        if routine_update.routine_steps:
            db_routine.routine_steps = [step.dict() for step in routine_update.routine_steps]
        if routine_update.personalized_factors:
            db_routine.personalized_factors = routine_update.personalized_factors
        if routine_update.products:
            db_routine.products = routine_update.products
        
        db_routine.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(db_routine)
        
        return RoutineResponse(
            id=str(db_routine.id),
            user_id=str(db_routine.user_id),
            assessment_id=str(db_routine.assessment_id) if db_routine.assessment_id else None,
            routine_name=db_routine.routine_name,
            routine_type=db_routine.routine_type,
            routine_steps=db_routine.routine_steps,
            personalized_factors=db_routine.personalized_factors,
            products=db_routine.products,
            created_at=db_routine.created_at,
            updated_at=db_routine.updated_at
        )
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to update routine: {str(e)}")

@router.delete("/routine/{routine_id}")
def delete_routine(routine_id: str, db: Session = Depends(get_db)):
    """
    Delete a skincare routine
    """
    try:
        db_routine = db.query(SkincareRoutine).filter(
            SkincareRoutine.id == get_uuid(routine_id)
        ).first()
        
        if not db_routine:
            raise HTTPException(status_code=404, detail="Routine not found")
        
        # Delete associated steps
        db.query(RoutineStep).filter(
            RoutineStep.routine_id == get_uuid(routine_id)
        ).delete()
        
        # Delete routine
        db.delete(db_routine)
        db.commit()
        
        return {"success": True, "message": "Routine deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to delete routine: {str(e)}")

@router.post("/routine/ai-personalize", response_model=AIPersonalizationResponse)
def ai_personalize(request: AIPersonalizationRequest):
    """
    Get AI-powered personalization for a skincare routine
    """
    try:
        # Create routine data for the generator
        routine_data = {
            'skin_type': request.skin_type,
            'skin_concerns': request.skin_concerns,
            'skin_health_score': request.skin_health_score,
            'allergies': request.allergies,
            'lifestyle_factors': request.lifestyle_factors,
            'routine_type': request.routine_type,
            'season': request.season,
            'previous_assessment_results': request.previous_assessment_results
        }
        
        # Get base routine steps first
        if request.routine_type == 'morning':
            base_steps = routine_generator._generate_morning_routine(
                request.skin_type, request.skin_concerns, request.allergies
            )
        elif request.routine_type == 'evening':
            base_steps = routine_generator._generate_evening_routine(
                request.skin_type, request.skin_concerns, request.allergies
            )
        elif request.routine_type == 'weekly':
            base_steps = routine_generator._generate_weekly_routine(
                request.skin_type, request.skin_concerns, request.skin_health_score
            )
        elif request.routine_type == 'seasonal':
            base_steps = routine_generator._generate_seasonal_routine(
                request.season or 'spring', request.skin_type, request.skin_concerns
            )
        else:
            base_steps = routine_generator._generate_morning_routine(
                request.skin_type, request.skin_concerns, request.allergies
            )
        
        routine_data['routine_steps'] = base_steps
        
        # Get AI personalization
        ai_result = routine_generator._get_ai_personalization(routine_data)
        
        if ai_result:
            return AIPersonalizationResponse(
                routine_steps=ai_result['routine_steps'],
                personalized_recommendations=ai_result['personalized_recommendations'],
                product_suggestions=ai_result['product_suggestions'],
                lifestyle_tips=ai_result['lifestyle_tips']
            )
        else:
            # Fallback to default recommendations
            return AIPersonalizationResponse(
                routine_steps=base_steps,
                personalized_recommendations=routine_generator._get_default_recommendations(
                    request.skin_type, request.skin_concerns
                ),
                product_suggestions=routine_generator._get_default_products(
                    request.skin_type, request.skin_concerns
                ),
                lifestyle_tips=routine_generator._get_default_lifestyle_tips(
                    request.lifestyle_factors
                )
            )
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get AI personalization: {str(e)}")

@router.get("/categories/info")
def get_routine_categories():
    """
    Get available routine categories and their descriptions
    """
    categories = {
        'cleansing': {
            'name': 'Cleansing',
            'emoji': '🧼',
            'description': 'Removes dirt, oil, and impurities from the skin',
            'frequency': 'Daily (morning and evening)'
        },
        'exfoliation': {
            'name': 'Exfoliation',
            'emoji': '✨',
            'description': 'Removes dead skin cells and promotes cell turnover',
            'frequency': '1-3 times per week'
        },
        'treatment': {
            'name': 'Treatment',
            'emoji': '💧',
            'description': 'Targets specific skin concerns with active ingredients',
            'frequency': 'Daily or as directed'
        },
        'moisturizing': {
            'name': 'Moisturizing',
            'emoji': '🧴',
            'description': 'Hydrates and protects the skin barrier',
            'frequency': 'Daily (morning and evening)'
        },
        'sun_protection': {
            'name': 'Sun Protection',
            'emoji': '☀️',
            'description': 'Protects from harmful UV rays and prevents damage',
            'frequency': 'Daily (morning)'
        },
        'night_care': {
            'name': 'Night Care',
            'emoji': '🌙',
            'description': 'Intensive treatments and repair while sleeping',
            'frequency': 'Daily (evening)'
        }
    }
    
    return categories

@router.post("/routine/{routine_id}/check-update")
def check_routine_update(routine_id: str, new_assessment: dict, db: Session = Depends(get_db)):
    """
    Check if a routine needs to be updated based on new assessment data.
    Returns whether an update is recommended and why.
    """
    try:
        db_routine = db.query(SkincareRoutine).filter(
            SkincareRoutine.id == get_uuid(routine_id)
        ).first()
        
        if not db_routine:
            raise HTTPException(status_code=404, detail="Routine not found")
        
        old_factors = db_routine.personalized_factors or {}
        
        # Use routine generator to check if update is needed
        from app.routine_generator import RoutineGenerator
        generator = RoutineGenerator()
        
        should_update, reason = generator.should_update_routine(old_factors, new_assessment)
        
        return {
            "should_update": should_update,
            "reason": reason,
            "old_factors": old_factors,
            "new_factors": new_assessment
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to check routine update: {str(e)}")

@router.post("/routine/{routine_id}/adapt")
def adapt_routine(routine_id: str, new_assessment: dict, db: Session = Depends(get_db)):
    """
    Adapt an existing routine based on new assessment data.
    Makes intelligent adjustments rather than complete regeneration.
    """
    try:
        db_routine = db.query(SkincareRoutine).filter(
            SkincareRoutine.id == get_uuid(routine_id)
        ).first()
        
        if not db_routine:
            raise HTTPException(status_code=404, detail="Routine not found")
        
        # Convert database routine to dict
        routine_dict = {
            'id': str(db_routine.id),
            'routine_name': db_routine.routine_name,
            'routine_type': db_routine.routine_type,
            'routine_steps': db_routine.routine_steps,
            'personalized_factors': db_routine.personalized_factors,
            'products': db_routine.products
        }
        
        # Use routine generator to adapt the routine
        from app.routine_generator import RoutineGenerator
        generator = RoutineGenerator()
        
        adaptation_result = generator.adapt_routine_for_changes(routine_dict, new_assessment)
        
        if adaptation_result['updated']:
            # Update the database with adapted routine
            adapted_routine = adaptation_result['routine']
            db_routine.routine_steps = adapted_routine['routine_steps']
            db_routine.personalized_factors = adapted_routine['personalized_factors']
            db_routine.products = adapted_routine.get('products', db_routine.products)
            db_routine.updated_at = datetime.utcnow()
            
            db.commit()
            db.refresh(db_routine)
            
            return {
                "success": True,
                "message": "Routine adapted successfully",
                "changes": adaptation_result.get('changes', []),
                "reason": adaptation_result['reason'],
                "routine": RoutineResponse(
                    id=str(db_routine.id),
                    user_id=str(db_routine.user_id),
                    assessment_id=str(db_routine.assessment_id) if db_routine.assessment_id else None,
                    routine_name=db_routine.routine_name,
                    routine_type=db_routine.routine_type,
                    routine_steps=db_routine.routine_steps,
                    personalized_factors=db_routine.personalized_factors,
                    products=db_routine.products,
                    created_at=db_routine.created_at,
                    updated_at=db_routine.updated_at
                )
            }
        else:
            return {
                "success": False,
                "message": "No adaptation needed",
                "reason": adaptation_result['reason']
            }
            
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to adapt routine: {str(e)}")

@router.post("/routine/{routine_id}/regenerate")
def regenerate_routine(routine_id: str, new_params: dict, db: Session = Depends(get_db)):
    """
    Completely regenerate a routine with new parameters.
    This is the manual regeneration option.
    """
    try:
        db_routine = db.query(SkincareRoutine).filter(
            SkincareRoutine.id == get_uuid(routine_id)
        ).first()
        
        if not db_routine:
            raise HTTPException(status_code=404, detail="Routine not found")
        
        # Keep the user_id and routine_type, but regenerate with new parameters
        routine_data = {
            'user_id': str(db_routine.user_id),
            'routine_type': db_routine.routine_type,
            'skin_type': new_params.get('skin_type'),
            'skin_concerns': new_params.get('skin_concerns', []),
            'skin_health_score': new_params.get('skin_health_score', 70),
            'allergies': new_params.get('allergies', []),
            'lifestyle_factors': new_params.get('lifestyle_factors', {}),
            'season': new_params.get('season')
        }
        
        # Generate new routine
        from app.routine_generator import RoutineGenerator
        generator = RoutineGenerator()
        
        new_routine_data = generator.generate_routine(routine_data)
        
        # Update the database
        db_routine.routine_steps = new_routine_data['routine_steps']
        db_routine.personalized_factors = new_routine_data['personalized_factors']
        db_routine.products = new_routine_data['products']
        db_routine.updated_at = datetime.utcnow()
        
        db.commit()
        db.refresh(db_routine)
        
        return RoutineResponse(
            id=str(db_routine.id),
            user_id=str(db_routine.user_id),
            assessment_id=str(db_routine.assessment_id) if db_routine.assessment_id else None,
            routine_name=db_routine.routine_name,
            routine_type=db_routine.routine_type,
            routine_steps=db_routine.routine_steps,
            personalized_factors=db_routine.personalized_factors,
            products=db_routine.products,
            created_at=db_routine.created_at,
            updated_at=db_routine.updated_at
        )
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to regenerate routine: {str(e)}")
