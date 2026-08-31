"""
Progress Tracking System
Handles user progress tracking, milestone management, and progress comparison
"""
from typing import List, Dict, Optional
from datetime import datetime, timedelta
import json

class ProgressTracker:
    def __init__(self):
        self.milestone_types = {
            'score_improvement': 'Skin Health Score Improvement',
            'concern_resolved': 'Skin Concern Resolved',
            'goal_achieved': 'Skincare Goal Achieved',
            'routine_consistency': 'Routine Consistency Milestone',
            'product_success': 'Product Success Milestone'
        }
    
    def create_progress_entry(self, request_data: dict) -> dict:
        """
        Create a new progress entry based on assessment data
        """
        user_id = request_data.get('user_id')
        assessment_id = request_data.get('assessment_id')
        current_score = request_data.get('current_score')
        goals_achieved = request_data.get('goals_achieved', [])
        resolved_concerns = request_data.get('resolved_concerns', [])
        routine_adherence = request_data.get('routine_adherence')
        notes = request_data.get('notes')
        
        # Get baseline score (would typically come from database)
        baseline_score = request_data.get('baseline_score', current_score)
        
        # Calculate changes
        score_change = current_score - baseline_score
        improvement_percentage = ((current_score - baseline_score) / baseline_score * 100) if baseline_score > 0 else 0
        
        # Determine ongoing concerns (would typically come from assessment data)
        ongoing_concerns = request_data.get('ongoing_concerns', [])
        
        # Generate milestones based on progress
        milestones = self._generate_milestones(
            score_change, goals_achieved, resolved_concerns, routine_adherence
        )
        
        progress_entry = {
            'user_id': user_id,
            'assessment_id': assessment_id,
            'baseline_score': baseline_score,
            'current_score': current_score,
            'score_change': score_change,
            'improvement_percentage': round(improvement_percentage, 2),
            'goals_achieved': goals_achieved,
            'ongoing_concerns': ongoing_concerns,
            'resolved_concerns': resolved_concerns,
            'routine_adherence': routine_adherence,
            'milestones': milestones,
            'notes': notes,
            'progress_date': datetime.utcnow().isoformat()
        }
        
        return progress_entry
    
    def _generate_milestones(self, score_change: int, goals_achieved: list, 
                           resolved_concerns: list, routine_adherence: float) -> list:
        """Generate milestones based on progress data"""
        milestones = []
        
        # Score improvement milestones
        if score_change >= 10:
            milestones.append({
                'milestone_type': 'score_improvement',
                'milestone_name': 'Significant Score Improvement',
                'description': f'Skin health score improved by {score_change} points',
                'metadata': {'score_change': score_change}
            })
        elif score_change >= 5:
            milestones.append({
                'milestone_type': 'score_improvement',
                'milestone_name': 'Moderate Score Improvement',
                'description': f'Skin health score improved by {score_change} points',
                'metadata': {'score_change': score_change}
            })
        
        # Concern resolution milestones
        for concern in resolved_concerns:
            milestones.append({
                'milestone_type': 'concern_resolved',
                'milestone_name': f'{concern.replace("_", " ").title()} Resolved',
                'description': f'Successfully resolved {concern} concern',
                'metadata': {'concern': concern}
            })
        
        # Goal achievement milestones
        for goal in goals_achieved:
            milestones.append({
                'milestone_type': 'goal_achieved',
                'milestone_name': f'{goal.replace("_", " ").title()} Goal Achieved',
                'description': f'Achieved skincare goal: {goal}',
                'metadata': {'goal': goal}
            })
        
        # Routine consistency milestones
        if routine_adherence and routine_adherence >= 90:
            milestones.append({
                'milestone_type': 'routine_consistency',
                'milestone_name': 'Excellent Routine Consistency',
                'description': f'Maintained {routine_adherence}% routine adherence',
                'metadata': {'adherence': routine_adherence}
            })
        elif routine_adherence and routine_adherence >= 75:
            milestones.append({
                'milestone_type': 'routine_consistency',
                'milestone_name': 'Good Routine Consistency',
                'description': f'Maintained {routine_adherence}% routine adherence',
                'metadata': {'adherence': routine_adherence}
            })
        
        return milestones
    
    def compare_progress(self, user_id: str, start_date: datetime, 
                       end_date: datetime, progress_history: list) -> dict:
        """
        Compare progress over a time period
        """
        # Filter progress entries within date range
        period_progress = [
            p for p in progress_history
            if start_date <= datetime.fromisoformat(p['progress_date']) <= end_date
        ]
        
        if not period_progress:
            return {
                'error': 'No progress data found for the specified time period',
                'user_id': user_id,
                'time_period': {
                    'start_date': start_date.isoformat(),
                    'end_date': end_date.isoformat()
                }
            }
        
        # Sort by date
        period_progress.sort(key=lambda x: x['progress_date'])
        
        # Calculate progression
        first_entry = period_progress[0]
        last_entry = period_progress[-1]
        
        score_progression = [
            {
                'date': p['progress_date'],
                'score': p['current_score'],
                'change': p['score_change']
            }
            for p in period_progress
        ]
        
        # Concern resolution analysis
        all_concerns = set()
        resolved_over_period = set()
        
        for p in period_progress:
            all_concerns.update(p.get('ongoing_concerns', []))
            resolved_over_period.update(p.get('resolved_concerns', []))
        
        concern_resolution = {
            'total_concerns': len(all_concerns),
            'resolved_count': len(resolved_over_period),
            'resolved_concerns': list(resolved_over_period),
            'ongoing_concerns': list(all_concerns - resolved_over_period)
        }
        
        # Overall improvement
        overall_improvement = {
            'score_improvement': last_entry['current_score'] - first_entry['baseline_score'],
            'improvement_percentage': last_entry['improvement_percentage'],
            'milestones_achieved': sum(len(p.get('milestones', [])) for p in period_progress),
            'average_routine_adherence': self._calculate_average_adherence(period_progress)
        }
        
        # Generate insights
        insights = self._generate_progress_insights(period_progress, overall_improvement)
        
        # Generate recommendations
        recommendations = self._generate_progress_recommendations(overall_improvement, concern_resolution)
        
        return {
            'user_id': user_id,
            'time_period': {
                'start_date': start_date.isoformat(),
                'end_date': end_date.isoformat(),
                'days': (end_date - start_date).days
            },
            'score_progression': score_progression,
            'concern_resolution': concern_resolution,
            'overall_improvement': overall_improvement,
            'insights': insights,
            'recommendations': recommendations
        }
    
    def _calculate_average_adherence(self, progress_entries: list) -> float:
        """Calculate average routine adherence"""
        adherence_values = [p.get('routine_adherence') for p in progress_entries if p.get('routine_adherence')]
        if not adherence_values:
            return 0.0
        return round(sum(adherence_values) / len(adherence_values), 2)
    
    def _generate_progress_insights(self, progress_entries: list, improvement: dict) -> list:
        """Generate insights based on progress data"""
        insights = []
        
        if improvement['score_improvement'] > 0:
            insights.append(f"Positive progress: Skin health score improved by {improvement['score_improvement']} points")
        elif improvement['score_improvement'] < 0:
            insights.append(f"Skin health score decreased by {abs(improvement['score_improvement'])} points - review routine")
        else:
            insights.append("Skin health score remained stable - maintain current routine")
        
        if improvement['improvement_percentage'] > 20:
            insights.append("Excellent improvement percentage - current routine is working well")
        elif improvement['improvement_percentage'] > 10:
            insights.append("Good improvement percentage - continue with current approach")
        
        if improvement['milestones_achieved'] > 3:
            insights.append(f"Great milestone achievement: {improvement['milestones_achieved']} milestones reached")
        
        if improvement['average_routine_adherence'] > 80:
            insights.append("Excellent routine consistency - adherence above 80%")
        elif improvement['average_routine_adherence'] < 50:
            insights.append("Low routine adherence - consider simplifying routine or setting reminders")
        
        return insights
    
    def _generate_progress_recommendations(self, improvement: dict, concern_resolution: dict) -> list:
        """Generate recommendations based on progress analysis"""
        recommendations = []
        
        if improvement['score_improvement'] < 0:
            recommendations.append("Consider reviewing current routine and products")
            recommendations.append("Schedule a new skin assessment to identify issues")
        
        if improvement['average_routine_adherence'] < 70:
            recommendations.append("Focus on improving routine consistency")
            recommendations.append("Consider simplifying routine to improve adherence")
        
        if concern_resolution['resolved_count'] > 0:
            recommendations.append("Continue maintenance routine for resolved concerns")
            recommendations.append("Monitor for recurrence of resolved concerns")
        
        if concern_resolution['ongoing_concerns']:
            recommendations.append(f"Focus on addressing ongoing concerns: {', '.join(concern_resolution['ongoing_concerns'])}")
        
        if improvement['improvement_percentage'] > 15:
            recommendations.append("Current routine is effective - maintain consistency")
            recommendations.append("Consider adding preventive treatments for long-term skin health")
        
        return recommendations
    
    def get_progress_summary(self, user_id: str, progress_history: list) -> dict:
        """
        Get a summary of user's overall progress
        """
        if not progress_history:
            return {
                'user_id': user_id,
                'message': 'No progress data available',
                'total_entries': 0
            }
        
        # Sort by date
        progress_history.sort(key=lambda x: x['progress_date'])
        
        latest = progress_history[-1]
        earliest = progress_history[0]
        
        # Calculate overall statistics
        total_improvement = latest['current_score'] - earliest['baseline_score']
        total_milestones = sum(len(p.get('milestones', [])) for p in progress_history)
        
        # Concern statistics
        all_resolved = set()
        for p in progress_history:
            all_resolved.update(p.get('resolved_concerns', []))
        
        # Trend analysis
        recent_entries = progress_history[-5:] if len(progress_history) >= 5 else progress_history
        trend = self._calculate_trend(recent_entries)
        
        return {
            'user_id': user_id,
            'total_entries': len(progress_history),
            'date_range': {
                'start': earliest['progress_date'],
                'end': latest['progress_date']
            },
            'current_status': {
                'current_score': latest['current_score'],
                'total_improvement': total_improvement,
                'improvement_percentage': latest['improvement_percentage'],
                'trend': trend
            },
            'achievements': {
                'total_milestones': total_milestones,
                'resolved_concerns_count': len(all_resolved),
                'resolved_concerns': list(all_resolved)
            },
            'routine_performance': {
                'average_adherence': self._calculate_average_adherence(progress_history),
                'latest_adherence': latest.get('routine_adherence')
            }
        }
    
    def _calculate_trend(self, recent_entries: list) -> str:
        """Calculate trend based on recent progress entries"""
        if len(recent_entries) < 2:
            return "insufficient_data"
        
        scores = [entry['current_score'] for entry in recent_entries]
        
        # Simple linear trend
        if scores[-1] > scores[0] + 5:
            return "improving"
        elif scores[-1] < scores[0] - 5:
            return "declining"
        else:
            return "stable"
    
    def create_milestone(self, user_id: str, progress_id: str, 
                        milestone_type: str, milestone_name: str, 
                        description: str = None, metadata: dict = None) -> dict:
        """
        Create a specific milestone entry
        """
        milestone = {
            'user_id': user_id,
            'progress_id': progress_id,
            'milestone_type': milestone_type,
            'milestone_name': milestone_name,
            'description': description or f"Achieved {milestone_name}",
            'achieved_date': datetime.utcnow().isoformat(),
            'metadata': metadata or {}
        }
        
        return milestone
    
    def get_milestone_suggestions(self, current_progress: dict) -> list:
        """
        Get suggestions for potential milestones based on current progress
        """
        suggestions = []
        
        # Score-based suggestions
        if current_progress.get('score_change', 0) >= 15:
            suggestions.append({
                'milestone_type': 'score_improvement',
                'milestone_name': 'Major Score Improvement',
                'description': 'Achieved 15+ point improvement in skin health score'
            })
        
        # Concern-based suggestions
        if current_progress.get('resolved_concerns'):
            for concern in current_progress['resolved_concerns']:
                suggestions.append({
                    'milestone_type': 'concern_resolved',
                    'milestone_name': f'{concern.replace("_", " ").title()} Master',
                    'description': f'Successfully resolved {concern} concern'
                })
        
        # Consistency-based suggestions
        adherence = current_progress.get('routine_adherence', 0)
        if adherence >= 90:
            suggestions.append({
                'milestone_type': 'routine_consistency',
                'milestone_name': 'Perfect Routine Consistency',
                'description': 'Achieved 90%+ routine adherence'
            })
        
        return suggestions