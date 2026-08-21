from datetime import date, timedelta
from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.progress import SkinProgressLog
from app.schemas.progress import SkinProgressLogCreate, SkinProgressLogResponse, ProgressStatsResponse

class ProgressEngine:
    """
    Module 7: Progress Tracking & Analytics Engine
    Logs daily skin health stats, handles photo entries, calculates completion streaks,
    and generates historical progress compliance metrics.
    """

    @staticmethod
    def create_log(db: Session, user_id: int, input_data: SkinProgressLogCreate) -> SkinProgressLog:
        # Check if log already exists for today, if so update it
        today = date.today()
        existing_log = db.query(SkinProgressLog).filter(
            SkinProgressLog.user_id == user_id,
            SkinProgressLog.log_date == today
        ).first()

        if existing_log:
            existing_log.skin_score = input_data.skin_score
            existing_log.moisture_level = input_data.moisture_level
            existing_log.acne_severity = input_data.acne_severity
            existing_log.redness_level = input_data.redness_level
            existing_log.routine_completed = input_data.routine_completed
            if input_data.photo_url:
                existing_log.photo_url = input_data.photo_url
            if input_data.notes:
                existing_log.notes = input_data.notes
            db.commit()
            db.refresh(existing_log)
            return existing_log

        new_log = SkinProgressLog(
            user_id=user_id,
            log_date=today,
            skin_score=input_data.skin_score,
            moisture_level=input_data.moisture_level,
            acne_severity=input_data.acne_severity,
            redness_level=input_data.redness_level,
            routine_completed=input_data.routine_completed,
            photo_url=input_data.photo_url,
            notes=input_data.notes
        )
        db.add(new_log)
        db.commit()
        db.refresh(new_log)
        return new_log

    @staticmethod
    def get_user_logs(db: Session, user_id: int, limit: int = 30) -> List[SkinProgressLog]:
        return db.query(SkinProgressLog).filter(
            SkinProgressLog.user_id == user_id
        ).order_by(SkinProgressLog.log_date.desc()).limit(limit).all()

    @staticmethod
    def get_user_progress_stats(db: Session, user_id: int) -> ProgressStatsResponse:
        logs = db.query(SkinProgressLog).filter(
            SkinProgressLog.user_id == user_id
        ).order_by(SkinProgressLog.log_date.desc()).all()

        if not logs:
            return ProgressStatsResponse(
                total_logs=0,
                streak_days=1,
                avg_skin_score=75.0,
                avg_moisture_level=70.0,
                compliance_rate_pct=85.0,
                latest_score=75,
                score_change_last_30d=0,
                recent_logs=[]
            )

        total_logs = len(logs)
        avg_score = sum(l.skin_score for l in logs) / total_logs
        avg_moisture = sum(l.moisture_level for l in logs) / total_logs
        completed_count = sum(1 for l in logs if l.routine_completed)
        compliance_rate = (completed_count / total_logs) * 100

        latest_score = logs[0].skin_score
        oldest_score = logs[-1].skin_score
        score_change = latest_score - oldest_score

        # Calculate consecutive streak days
        streak_days = 0
        current_check = date.today()
        log_dates = {l.log_date for l in logs}

        while current_check in log_dates or (current_check - timedelta(days=1)) in log_dates:
            if current_check in log_dates:
                streak_days += 1
                current_check -= timedelta(days=1)
            elif (current_check - timedelta(days=1)) in log_dates:
                current_check -= timedelta(days=1)
            else:
                break

        if streak_days == 0:
            streak_days = 1

        recent_response = [SkinProgressLogResponse.model_validate(l) for l in logs[:10]]

        return ProgressStatsResponse(
            total_logs=total_logs,
            streak_days=streak_days,
            avg_skin_score=round(avg_score, 1),
            avg_moisture_level=round(avg_moisture, 1),
            compliance_rate_pct=round(compliance_rate, 1),
            latest_score=latest_score,
            score_change_last_30d=score_change,
            recent_logs=recent_response
        )
