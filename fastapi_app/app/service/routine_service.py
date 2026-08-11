from typing import List, Dict
from sqlalchemy.orm import Session
from sqlalchemy import func
from fastapi import HTTPException, status
from app.models.routine import PersonalizedRoutine
from app.models.assessment import User
from app.auth.security import AuthenticatedUser
from app.schemas.routine import (
    RoutineGenerateInput,
    RoutineStepSchema,
    RoutineGroupResponse,
    RoutineUpdateRequest,
    RoutineStatsResponse
)
from app.engine.routine_engine import RoutineEngine

class RoutineService:

    @staticmethod
    def generate_user_routine(db: Session, input_data: RoutineGenerateInput, current_user: AuthenticatedUser) -> RoutineGroupResponse:
        # Find user record in DB
        db_user = db.query(User).filter(User.id == current_user.id).first()
        if not db_user:
            # Create user on-the-fly if missing
            db_user = User(
                id=current_user.id,
                name=current_user.name,
                email=current_user.email,
                role=current_user.role
            )
            db.add(db_user)
            db.commit()
            db.refresh(db_user)

        # Remove previous routines for user to generate fresh ones
        db.query(PersonalizedRoutine).filter(PersonalizedRoutine.user_id == current_user.id).delete()
        db.commit()

        # Generate routine steps via Engine
        generated_steps = RoutineEngine.generate(input_data, current_user.id)

        # Save to DB
        db_routines: List[PersonalizedRoutine] = []
        for step in generated_steps:
            db_item = PersonalizedRoutine(
                user_id=step.user_id,
                time_of_day=step.time_of_day,
                step_number=step.step_number,
                category=step.category,
                step_name=step.step_name,
                instructions=step.instructions,
                recommended_ingredient=step.recommended_ingredient,
                season=step.season or input_data.season or "SUMMER",
                created_by_role=current_user.role if current_user.role in ["DOCTOR", "CONSULTANT"] else "SYSTEM_AI"
            )
            db.add(db_item)
            db_routines.append(db_item)

        db.commit()
        for r in db_routines:
            db.refresh(r)

        return RoutineService._group_routines(db_routines, current_user.id, input_data.skin_type or "Normal", input_data.season or "Summer")

    @staticmethod
    def get_user_routine(db: Session, target_user_id: int, current_user: AuthenticatedUser) -> RoutineGroupResponse:
        # RBAC Check: Users can only view own routine; Doctors, Consultants, Admins can view any user's routine
        if current_user.role not in ["ADMIN", "DERMATOLOGIST", "SKINCARE_CONSULTANT", "CONSULTANT", "WELLNESS_COACH"] and current_user.id != target_user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied: You do not have permission to view another user's skincare routine."
            )

        routines = db.query(PersonalizedRoutine).filter(
            PersonalizedRoutine.user_id == target_user_id,
            PersonalizedRoutine.is_active == True
        ).order_by(PersonalizedRoutine.time_of_day, PersonalizedRoutine.step_number).all()

        if not routines:
            # Generate default fallback routine if none exists yet
            default_input = RoutineGenerateInput(skin_type="Normal", season="Summer")
            generated_steps = RoutineEngine.generate(default_input, target_user_id)
            db_routines = []
            for step in generated_steps:
                db_item = PersonalizedRoutine(
                    user_id=step.user_id,
                    time_of_day=step.time_of_day,
                    step_number=step.step_number,
                    category=step.category,
                    step_name=step.step_name,
                    instructions=step.instructions,
                    recommended_ingredient=step.recommended_ingredient,
                    season=step.season,
                    created_by_role="SYSTEM_AI"
                )
                db.add(db_item)
                db_routines.append(db_item)
            db.commit()
            for r in db_routines:
                db.refresh(r)
            routines = db_routines

        return RoutineService._group_routines(routines, target_user_id, "Personalized", "Current Season")

    @staticmethod
    def update_routine_step(db: Session, routine_id: int, update_data: RoutineUpdateRequest, current_user: AuthenticatedUser) -> RoutineStepSchema:
        routine = db.query(PersonalizedRoutine).filter(PersonalizedRoutine.id == routine_id).first()
        if not routine:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Routine step #{routine_id} not found.")

        # RBAC Check: Only owner or Doctor/Consultant/Admin can update
        if current_user.role not in ["ADMIN", "DERMATOLOGIST", "SKINCARE_CONSULTANT", "CONSULTANT"] and current_user.id != routine.user_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied: Unauthorized to update this routine step.")

        if update_data.step_name is not None:
            routine.step_name = update_data.step_name
        if update_data.instructions is not None:
            routine.instructions = update_data.instructions
        if update_data.recommended_ingredient is not None:
            routine.recommended_ingredient = update_data.recommended_ingredient
        if update_data.doctor_notes is not None:
            routine.doctor_notes = update_data.doctor_notes
        if update_data.is_active is not None:
            routine.is_active = update_data.is_active

        if current_user.role in ["DERMATOLOGIST", "SKINCARE_CONSULTANT", "CONSULTANT"]:
            routine.created_by_role = current_user.role

        db.commit()
        db.refresh(routine)
        return RoutineStepSchema.model_validate(routine)

    @staticmethod
    def get_stats(db: Session, current_user: AuthenticatedUser) -> RoutineStatsResponse:
        # RBAC Check: Only Admin, Doctor, or Consultant can access system routine stats
        if current_user.role not in ["ADMIN", "DERMATOLOGIST", "SKINCARE_CONSULTANT", "CONSULTANT"]:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access restricted to System Administrators and Medical Specialists.")

        total_steps = db.query(func.count(PersonalizedRoutine.id)).scalar() or 0
        morning_cnt = db.query(func.count(PersonalizedRoutine.id)).filter(PersonalizedRoutine.time_of_day == "MORNING").scalar() or 0
        evening_cnt = db.query(func.count(PersonalizedRoutine.id)).filter(PersonalizedRoutine.time_of_day == "EVENING").scalar() or 0
        weekly_cnt = db.query(func.count(PersonalizedRoutine.id)).filter(PersonalizedRoutine.time_of_day == "WEEKLY").scalar() or 0
        seasonal_cnt = db.query(func.count(PersonalizedRoutine.id)).filter(PersonalizedRoutine.time_of_day == "SEASONAL").scalar() or 0
        active_users = db.query(func.count(func.distinct(PersonalizedRoutine.user_id))).scalar() or 0

        return RoutineStatsResponse(
            total_routines_generated=total_steps,
            morning_steps_count=morning_cnt,
            evening_steps_count=evening_cnt,
            weekly_steps_count=weekly_cnt,
            seasonal_steps_count=seasonal_cnt,
            active_users_count=active_users,
            traffic_status="HEALTHY - HIGH ENGAGEMENT"
        )

    @staticmethod
    def _group_routines(routines: List[PersonalizedRoutine], user_id: int, skin_type: str, season: str) -> RoutineGroupResponse:
        morning = [RoutineStepSchema.model_validate(r) for r in routines if r.time_of_day == "MORNING"]
        evening = [RoutineStepSchema.model_validate(r) for r in routines if r.time_of_day == "EVENING"]
        weekly = [RoutineStepSchema.model_validate(r) for r in routines if r.time_of_day == "WEEKLY"]
        seasonal = [RoutineStepSchema.model_validate(r) for r in routines if r.time_of_day == "SEASONAL"]

        return RoutineGroupResponse(
            user_id=user_id,
            skin_type=skin_type,
            season=season,
            morning_routine=morning,
            evening_routine=evening,
            weekly_treatment=weekly,
            seasonal_recommendations=seasonal
        )
