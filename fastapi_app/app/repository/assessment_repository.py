from datetime import datetime
from typing import List, Optional, Tuple, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.assessment import SkinAssessment, SkinConcern, RiskFactor, User
from app.schemas.assessment import SkinConcernSchema, RiskFactorSchema, AssessmentUpdate

class AssessmentRepository:

    @staticmethod
    def create_assessment(
        db: Session,
        user_id: int,
        health_score: int,
        overall_condition: str,
        notes: Optional[str],
        concerns_data: List[SkinConcernSchema],
        risks_data: List[RiskFactorSchema]
    ) -> SkinAssessment:
        # Ensure user exists in local table for FK consistency
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            user = User(id=user_id, name="Platform User", email=f"user_{user_id}@skincare.com", role="USER")
            db.add(user)
            db.flush()

        # Create SkinAssessment record
        assessment = SkinAssessment(
            user_id=user_id,
            assessment_date=datetime.utcnow(),
            skin_health_score=health_score,
            overall_condition=overall_condition,
            notes=notes,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        db.add(assessment)
        db.flush()

        # Create SkinConcern records
        for c in concerns_data:
            concern_obj = SkinConcern(
                assessment_id=assessment.id,
                concern_name=c.concern_name,
                severity=c.severity,
                priority=c.priority
            )
            db.add(concern_obj)

        # Create RiskFactor records
        for r in risks_data:
            risk_obj = RiskFactor(
                assessment_id=assessment.id,
                risk_name=r.risk_name,
                description=r.description,
                risk_level=r.risk_level
            )
            db.add(risk_obj)

        db.commit()
        db.refresh(assessment)
        return assessment

    @staticmethod
    def get_by_id(db: Session, assessment_id: int) -> Optional[SkinAssessment]:
        return db.query(SkinAssessment).filter(SkinAssessment.id == assessment_id).first()

    @staticmethod
    def get_all(db: Session, skip: int = 0, limit: int = 100) -> List[SkinAssessment]:
        return db.query(SkinAssessment).order_by(SkinAssessment.created_at.desc()).offset(skip).limit(limit).all()

    @staticmethod
    def get_by_user_id(db: Session, user_id: int) -> List[SkinAssessment]:
        return db.query(SkinAssessment).filter(SkinAssessment.user_id == user_id).order_by(SkinAssessment.created_at.desc()).all()

    @staticmethod
    def get_latest_by_user_id(db: Session, user_id: int) -> Optional[SkinAssessment]:
        return db.query(SkinAssessment).filter(SkinAssessment.user_id == user_id).order_by(SkinAssessment.created_at.desc()).first()

    @staticmethod
    def update(db: Session, assessment_id: int, update_data: AssessmentUpdate) -> Optional[SkinAssessment]:
        assessment = db.query(SkinAssessment).filter(SkinAssessment.id == assessment_id).first()
        if not assessment:
            return None

        if update_data.notes is not None:
            assessment.notes = update_data.notes
        if update_data.overall_condition is not None:
            assessment.overall_condition = update_data.overall_condition
        if update_data.skin_health_score is not None:
            assessment.skin_health_score = update_data.skin_health_score

        assessment.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(assessment)
        return assessment

    @staticmethod
    def delete(db: Session, assessment_id: int) -> bool:
        assessment = db.query(SkinAssessment).filter(SkinAssessment.id == assessment_id).first()
        if not assessment:
            return False

        db.delete(assessment)
        db.commit()
        return True

    @staticmethod
    def get_statistics(db: Session) -> Dict[str, Any]:
        total = db.query(func.count(SkinAssessment.id)).scalar() or 0
        avg_score = db.query(func.avg(SkinAssessment.skin_health_score)).scalar() or 0.0

        conditions = db.query(
            SkinAssessment.overall_condition,
            func.count(SkinAssessment.id)
        ).group_by(SkinAssessment.overall_condition).all()

        condition_counts = {c: count for c, count in conditions}
        return {
            "total_assessments": total,
            "average_score": round(float(avg_score), 1),
            "condition_counts": condition_counts
        }
