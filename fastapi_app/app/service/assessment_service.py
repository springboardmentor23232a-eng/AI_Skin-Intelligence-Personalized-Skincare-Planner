from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.auth.security import AuthenticatedUser
from app.engine.assessment_engine import SkinAssessmentEngine
from app.repository.assessment_repository import AssessmentRepository
from app.schemas.assessment import (
    SkinAssessmentInput,
    AssessmentUpdate,
    SkinAssessmentResponse,
    HealthScoreResponse,
    RiskAnalysisResponse,
    AssessmentStatsResponse
)
from app.models.assessment import SkinAssessment

class AssessmentService:

    @staticmethod
    def create_assessment(
        db: Session,
        input_data: SkinAssessmentInput,
        current_user: AuthenticatedUser
    ) -> SkinAssessment:
        # Run Rule-based Assessment Engine
        health_score, overall_condition, concerns, risks = SkinAssessmentEngine.evaluate(input_data)

        # Store in database
        assessment = AssessmentRepository.create_assessment(
            db=db,
            user_id=current_user.id,
            health_score=health_score,
            overall_condition=overall_condition,
            notes=input_data.notes,
            concerns_data=concerns,
            risks_data=risks
        )
        return assessment

    @staticmethod
    def get_assessment_by_id(
        db: Session,
        assessment_id: int,
        current_user: AuthenticatedUser
    ) -> SkinAssessment:
        assessment = AssessmentRepository.get_by_id(db, assessment_id)
        if not assessment:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"404 Not Found: Skin assessment with ID {assessment_id} does not exist"
            )

        # Security check: User can only access own unless Consultant/Dermatologist/Admin
        if not current_user.is_admin() and not current_user.is_consultant() and not current_user.is_dermatologist():
            if assessment.user_id != current_user.id:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="403 Forbidden: You do not have permission to access this skin assessment"
                )

        return assessment

    @staticmethod
    def get_all_assessments(
        db: Session,
        current_user: AuthenticatedUser,
        skip: int = 0,
        limit: int = 100
    ) -> List[SkinAssessment]:
        # Admins, Consultants, and Dermatologists can view all / assigned assessments
        if current_user.is_admin() or current_user.is_consultant() or current_user.is_dermatologist():
            return AssessmentRepository.get_all(db, skip=skip, limit=limit)
        else:
            # Standard users view only their own
            return AssessmentRepository.get_by_user_id(db, current_user.id)

    @staticmethod
    def get_user_history(
        db: Session,
        current_user: AuthenticatedUser
    ) -> List[SkinAssessment]:
        return AssessmentRepository.get_by_user_id(db, current_user.id)

    @staticmethod
    def get_latest_score(
        db: Session,
        current_user: AuthenticatedUser
    ) -> HealthScoreResponse:
        latest = AssessmentRepository.get_latest_by_user_id(db, current_user.id)
        if not latest:
            return HealthScoreResponse(
                user_id=current_user.id,
                latest_score=0,
                overall_condition="Not Assessed",
                assessment_date=None
            )
        return HealthScoreResponse(
            user_id=latest.user_id,
            latest_score=latest.skin_health_score,
            overall_condition=latest.overall_condition,
            assessment_date=latest.assessment_date
        )

    @staticmethod
    def get_latest_risks(
        db: Session,
        current_user: AuthenticatedUser
    ) -> RiskAnalysisResponse:
        latest = AssessmentRepository.get_latest_by_user_id(db, current_user.id)
        if not latest:
            return RiskAnalysisResponse(
                user_id=current_user.id,
                assessment_id=None,
                latest_risks=[],
                assessment_date=None
            )
        
        risks_schema = [
            {
                "id": r.id,
                "risk_name": r.risk_name,
                "description": r.description,
                "risk_level": r.risk_level
            }
            for r in latest.risks
        ]
        
        return RiskAnalysisResponse(
            user_id=latest.user_id,
            assessment_id=latest.id,
            latest_risks=risks_schema,
            assessment_date=latest.assessment_date
        )

    @staticmethod
    def update_assessment(
        db: Session,
        assessment_id: int,
        update_data: AssessmentUpdate,
        current_user: AuthenticatedUser
    ) -> SkinAssessment:
        assessment = AssessmentRepository.get_by_id(db, assessment_id)
        if not assessment:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"404 Not Found: Skin assessment with ID {assessment_id} does not exist"
            )

        # User check or Consultant/Dermatologist notes addition
        if not current_user.is_admin() and not current_user.is_consultant() and not current_user.is_dermatologist():
            if assessment.user_id != current_user.id:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="403 Forbidden: You do not have permission to edit this assessment"
                )

        updated = AssessmentRepository.update(db, assessment_id, update_data)
        return updated

    @staticmethod
    def delete_assessment(
        db: Session,
        assessment_id: int,
        current_user: AuthenticatedUser
    ) -> dict:
        assessment = AssessmentRepository.get_by_id(db, assessment_id)
        if not assessment:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"404 Not Found: Skin assessment with ID {assessment_id} does not exist"
            )

        # Delete authorization: Admin or owner user
        if not current_user.is_admin() and assessment.user_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="403 Forbidden: Only administrators or assessment owners can delete skin assessments"
            )

        success = AssessmentRepository.delete(db, assessment_id)
        if success:
            return {"success": True, "message": f"Assessment {assessment_id} successfully deleted"}
        else:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to delete assessment"
            )

    @staticmethod
    def get_stats(db: Session, current_user: AuthenticatedUser) -> AssessmentStatsResponse:
        if not current_user.is_admin() and not current_user.is_consultant() and not current_user.is_dermatologist():
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="403 Forbidden: Administrative privileges required to access global assessment stats"
            )
        stats = AssessmentRepository.get_statistics(db)
        return AssessmentStatsResponse(**stats)
