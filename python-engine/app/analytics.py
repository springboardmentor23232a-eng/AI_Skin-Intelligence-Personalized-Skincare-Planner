"""
Analytics and Dashboard System
Handles skincare analytics, insights generation, and dashboard management
"""
from typing import List, Dict, Optional
from datetime import datetime, timedelta
import json
from collections import defaultdict

class AnalyticsEngine:
    def __init__(self):
        self.insight_categories = {
            'score_trends': 'Skin Health Score Trends',
            'concern_patterns': 'Skin Concern Patterns',
            'routine_effectiveness': 'Routine Effectiveness Analysis',
            'lifestyle_impact': 'Lifestyle Factors Impact',
            'product_performance': 'Product Performance Analysis'
        }
    
    def generate_analytics(self, request_data: dict, assessment_history: list, 
                         routine_history: list, product_history: list) -> dict:
        """
        Generate comprehensive analytics for a user
        """
        user_id = request_data.get('user_id')
        time_period = request_data.get('time_period', 'monthly')
        start_date = request_data.get('start_date')
        end_date = request_data.get('end_date')
        
        # Determine date range if not provided
        if not start_date or not end_date:
            start_date, end_date = self._calculate_date_range(time_period)
        
        # Filter data within date range
        period_assessments = self._filter_by_date(assessment_history, start_date, end_date)
        period_routines = self._filter_by_date(routine_history, start_date, end_date)
        period_products = self._filter_by_date(product_history, start_date, end_date)
        
        # Calculate score analytics
        score_analytics = self._calculate_score_analytics(period_assessments)
        
        # Calculate concern analytics
        concern_analytics = self._calculate_concern_analytics(period_assessments)
        
        # Calculate routine analytics
        routine_analytics = self._calculate_routine_analytics(period_routines)
        
        # Calculate product analytics
        product_analytics = self._calculate_product_analytics(period_products)
        
        # Calculate lifestyle impact
        lifestyle_analytics = self._calculate_lifestyle_analytics(period_assessments)
        
        # Generate insights
        insights = self._generate_insights(
            score_analytics, concern_analytics, routine_analytics, 
            product_analytics, lifestyle_analytics
        )
        
        # Generate recommendations
        recommendations = self._generate_recommendations(
            score_analytics, concern_analytics, routine_analytics, insights
        )
        
        # Create analytics entry
        analytics_entry = {
            'user_id': user_id,
            'assessment_id': period_assessments[-1].get('id') if period_assessments else None,
            'time_period': time_period,
            'start_date': start_date.isoformat(),
            'end_date': end_date.isoformat(),
            'average_score': score_analytics.get('average'),
            'score_trend': score_analytics.get('trend'),
            'highest_score': score_analytics.get('highest'),
            'lowest_score': score_analytics.get('lowest'),
            'concern_frequency': concern_analytics.get('frequency'),
            'resolved_concerns_count': concern_analytics.get('resolved_count'),
            'new_concerns_count': concern_analytics.get('new_count'),
            'routine_changes_count': routine_analytics.get('changes_count'),
            'routine_adherence_avg': routine_analytics.get('average_adherence'),
            'products_used': product_analytics.get('products_used'),
            'product_effectiveness': product_analytics.get('effectiveness'),
            'lifestyle_factors_impact': lifestyle_analytics.get('impact'),
            'insights': insights,
            'recommendations': recommendations
        }
        
        return analytics_entry
    
    def _calculate_date_range(self, time_period: str) -> tuple:
        """Calculate date range based on time period"""
        end_date = datetime.utcnow()
        
        if time_period == 'daily':
            start_date = end_date - timedelta(days=1)
        elif time_period == 'weekly':
            start_date = end_date - timedelta(weeks=1)
        elif time_period == 'monthly':
            start_date = end_date - timedelta(days=30)
        elif time_period == 'yearly':
            start_date = end_date - timedelta(days=365)
        else:
            start_date = end_date - timedelta(days=30)
        
        return start_date, end_date
    
    def _filter_by_date(self, data: list, start_date: datetime, end_date: datetime) -> list:
        """Filter data entries by date range"""
        filtered = []
        for entry in data:
            entry_date = datetime.fromisoformat(entry.get('created_at', entry.get('date', '')))
            if start_date <= entry_date <= end_date:
                filtered.append(entry)
        return filtered
    
    def _calculate_score_analytics(self, assessments: list) -> dict:
        """Calculate skin health score analytics"""
        if not assessments:
            return {'average': None, 'trend': 'no_data', 'highest': None, 'lowest': None}
        
        scores = [a.get('skin_health_score', 0) for a in assessments]
        
        average = sum(scores) / len(scores)
        highest = max(scores)
        lowest = min(scores)
        
        # Calculate trend
        if len(scores) >= 2:
            if scores[-1] > scores[0] + 5:
                trend = 'improving'
            elif scores[-1] < scores[0] - 5:
                trend = 'declining'
            else:
                trend = 'stable'
        else:
            trend = 'insufficient_data'
        
        return {
            'average': round(average, 2),
            'trend': trend,
            'highest': highest,
            'lowest': lowest,
            'score_history': scores
        }
    
    def _calculate_concern_analytics(self, assessments: list) -> dict:
        """Calculate skin concern analytics"""
        if not assessments:
            return {'frequency': {}, 'resolved_count': 0, 'new_count': 0}
        
        concern_frequency = defaultdict(int)
        all_concerns = []
        
        for assessment in assessments:
            concerns = assessment.get('concerns', [])
            if isinstance(concerns, list):
                for concern in concerns:
                    concern_frequency[concern] += 1
                    all_concerns.append(concern)
        
        # Calculate resolved vs new concerns
        if len(assessments) >= 2:
            early_concerns = set(assessments[0].get('concerns', []))
            late_concerns = set(assessments[-1].get('concerns', []))
            
            resolved_concerns = early_concerns - late_concerns
            new_concerns = late_concerns - early_concerns
        else:
            resolved_concerns = set()
            new_concerns = set()
        
        return {
            'frequency': dict(concern_frequency),
            'resolved_count': len(resolved_concerns),
            'new_count': len(new_concerns),
            'resolved_concerns': list(resolved_concerns),
            'new_concerns': list(new_concerns),
            'most_common': sorted(concern_frequency.items(), key=lambda x: x[1], reverse=True)[:5]
        }
    
    def _calculate_routine_analytics(self, routines: list) -> dict:
        """Calculate routine analytics"""
        if not routines:
            return {'changes_count': 0, 'average_adherence': None}
        
        changes_count = len(routines) - 1  # Number of changes = number of routines - 1
        
        adherence_values = [r.get('routine_adherence') for r in routines if r.get('routine_adherence')]
        average_adherence = sum(adherence_values) / len(adherence_values) if adherence_values else None
        
        routine_types = defaultdict(int)
        for routine in routines:
            routine_type = routine.get('routine_type', 'unknown')
            routine_types[routine_type] += 1
        
        return {
            'changes_count': changes_count,
            'average_adherence': round(average_adherence, 2) if average_adherence else None,
            'routine_types': dict(routine_types),
            'total_routines': len(routines)
        }
    
    def _calculate_product_analytics(self, products: list) -> dict:
        """Calculate product analytics"""
        if not products:
            return {'products_used': [], 'effectiveness': {}}
        
        products_used = [p.get('name', p.get('product_name', 'Unknown')) for p in products]
        
        # Calculate effectiveness (simplified - would be based on user feedback in real system)
        effectiveness = {}
        for product in products:
            product_name = product.get('name', product.get('product_name', 'Unknown'))
            effectiveness[product_name] = {
                'usage_count': products_used.count(product_name),
                'average_rating': product.get('rating', 4.0),
                'category': product.get('category', 'unknown')
            }
        
        return {
            'products_used': list(set(products_used)),
            'effectiveness': effectiveness,
            'total_products': len(set(products_used))
        }
    
    def _calculate_lifestyle_analytics(self, assessments: list) -> dict:
        """Calculate lifestyle factors impact"""
        if not assessments:
            return {'impact': {}}
        
        lifestyle_factors = ['sleep_hours', 'water_intake', 'stress_level', 'smoking', 'sun_exposure']
        impact = {}
        
        for factor in lifestyle_factors:
            factor_values = []
            for assessment in assessments:
                value = assessment.get(factor)
                if value is not None:
                    factor_values.append(value)
            
            if factor_values:
                # Calculate correlation with skin health score (simplified)
                scores = [a.get('skin_health_score', 0) for a in assessments]
                if len(factor_values) == len(scores):
                    correlation = self._calculate_correlation(factor_values, scores)
                    impact[factor] = {
                        'average': sum(factor_values) / len(factor_values),
                        'correlation_with_score': correlation,
                        'impact_level': self._assess_impact_level(correlation)
                    }
        
        return impact
    
    def _calculate_correlation(self, x: list, y: list) -> float:
        """Calculate correlation coefficient between two lists"""
        n = len(x)
        if n < 2:
            return 0.0
        
        mean_x = sum(x) / n
        mean_y = sum(y) / n
        
        numerator = sum((xi - mean_x) * (yi - mean_y) for xi, yi in zip(x, y))
        denominator = (sum((xi - mean_x) ** 2 for xi in x) * sum((yi - mean_y) ** 2 for yi in y)) ** 0.5
        
        if denominator == 0:
            return 0.0
        
        return numerator / denominator
    
    def _assess_impact_level(self, correlation: float) -> str:
        """Assess the impact level based on correlation"""
        abs_corr = abs(correlation)
        if abs_corr >= 0.7:
            return 'high'
        elif abs_corr >= 0.4:
            return 'moderate'
        elif abs_corr >= 0.2:
            return 'low'
        else:
            return 'negligible'
    
    def _generate_insights(self, score_analytics: dict, concern_analytics: dict,
                         routine_analytics: dict, product_analytics: dict,
                         lifestyle_analytics: dict) -> list:
        """Generate insights from analytics data"""
        insights = []
        
        # Score insights
        if score_analytics.get('trend') == 'improving':
            insights.append(f"Skin health score is improving with an average of {score_analytics.get('average')}")
        elif score_analytics.get('trend') == 'declining':
            insights.append(f"Skin health score is declining - average: {score_analytics.get('average')}")
        
        if score_analytics.get('highest') and score_analytics.get('lowest'):
            score_range = score_analytics['highest'] - score_analytics['lowest']
            if score_range > 20:
                insights.append(f"High score variability ({score_range} points) - consider lifestyle consistency")
        
        # Concern insights
        most_common = concern_analytics.get('most_common', [])
        if most_common:
            top_concern = most_common[0]
            insights.append(f"Most common concern: {top_concern[0]} (appears {top_concern[1]} times)")
        
        if concern_analytics.get('resolved_count', 0) > 0:
            insights.append(f"Great progress: {concern_analytics['resolved_count']} concern(s) resolved")
        
        if concern_analytics.get('new_count', 0) > 0:
            insights.append(f"New concerns appeared: {concern_analytics['new_count']} - monitor these closely")
        
        # Routine insights
        if routine_analytics.get('changes_count', 0) > 3:
            insights.append("Frequent routine changes - may benefit from more consistency")
        
        if routine_analytics.get('average_adherence'):
            adherence = routine_analytics['average_adherence']
            if adherence >= 80:
                insights.append(f"Excellent routine adherence: {adherence}%")
            elif adherence < 50:
                insights.append(f"Low routine adherence: {adherence}% - consider simplifying routine")
        
        # Lifestyle insights
        for factor, data in lifestyle_analytics.get('impact', {}).items():
            if data.get('impact_level') == 'high':
                correlation = data.get('correlation_with_score', 0)
                direction = 'positive' if correlation > 0 else 'negative'
                insights.append(f"{factor.replace('_', ' ').title()} has high {direction} impact on skin health")
        
        return insights
    
    def _generate_recommendations(self, score_analytics: dict, concern_analytics: dict,
                                routine_analytics: dict, insights: list) -> list:
        """Generate actionable recommendations based on analytics"""
        recommendations = []
        
        # Score-based recommendations
        if score_analytics.get('trend') == 'declining':
            recommendations.append("Review current routine and products with a skin assessment")
            recommendations.append("Focus on lifestyle factors that may be affecting skin health")
        
        # Concern-based recommendations
        new_concerns = concern_analytics.get('new_concerns', [])
        if new_concerns:
            recommendations.append(f"Address new concerns: {', '.join(new_concerns)}")
            recommendations.append("Consider targeted treatments for new concerns")
        
        # Routine-based recommendations
        if routine_analytics.get('changes_count', 0) > 3:
            recommendations.append("Stick to current routine for at least 4-6 weeks to see results")
            recommendations.append("Document routine changes to identify what works best")
        
        if routine_analytics.get('average_adherence', 0) < 70:
            recommendations.append("Set daily reminders for skincare routine")
            recommendations.append("Consider simplifying routine to improve adherence")
        
        # General recommendations based on insights
        insight_lower = ' '.join(insights).lower()
        if 'variability' in insight_lower:
            recommendations.append("Focus on consistency in lifestyle factors for stable results")
        
        if 'excellent' in insight_lower:
            recommendations.append("Maintain current routine and lifestyle habits")
        
        return recommendations
    
    def get_charts_data(self, analytics: dict) -> dict:
        """
        Generate data for dashboard charts
        """
        charts_data = {
            'score_trend': {
                'type': 'line',
                'title': 'Skin Health Score Over Time',
                'data': analytics.get('score_history', []),
                'labels': [f"Day {i+1}" for i in range(len(analytics.get('score_history', [])))]
            },
            'concern_distribution': {
                'type': 'bar',
                'title': 'Concern Frequency',
                'data': list(analytics.get('concern_frequency', {}).values()),
                'labels': list(analytics.get('concern_frequency', {}).keys())
            },
            'routine_adherence': {
                'type': 'gauge',
                'title': 'Routine Adherence',
                'value': analytics.get('routine_adherence_avg', 0),
                'max': 100
            },
            'product_effectiveness': {
                'type': 'radar',
                'title': 'Product Category Performance',
                'categories': list(analytics.get('product_effectiveness', {}).keys()),
                'values': [data.get('average_rating', 4.0) for data in analytics.get('product_effectiveness', {}).values()]
            }
        }
        
        return charts_data


class DashboardManager:
    def __init__(self):
        self.default_layout = {
            'widgets': [
                {'id': 'score_overview', 'position': {'x': 0, 'y': 0, 'w': 6, 'h': 4}},
                {'id': 'concern_summary', 'position': {'x': 6, 'y': 0, 'w': 6, 'h': 4}},
                {'id': 'routine_adherence', 'position': {'x': 0, 'y': 4, 'w': 4, 'h': 4}},
                {'id': 'progress_chart', 'position': {'x': 4, 'y': 4, 'w': 8, 'h': 4}},
                {'id': 'recommendations', 'position': {'x': 0, 'y': 8, 'w': 12, 'h': 4}}
            ]
        }
    
    def create_dashboard(self, user_id: str, analytics: dict, 
                        progress_summary: dict) -> dict:
        """
        Create user dashboard with personalized data
        """
        # Get current skin score from analytics
        current_score = analytics.get('average_score')
        
        # Calculate score change (would need historical data in real implementation)
        score_change = 0  # Placeholder
        
        # Count active concerns
        active_concerns_count = len(analytics.get('concern_frequency', {}))
        
        # Get routine adherence
        routine_adherence = analytics.get('routine_adherence_avg')
        
        # Generate quick stats
        quick_stats = {
            'current_skin_score': current_score,
            'score_change': score_change,
            'active_concerns_count': active_concerns_count,
            'routine_adherence': routine_adherence,
            'assessment_count': len(analytics.get('score_history', [])),
            'products_in_use': len(analytics.get('products_used', []))
        }
        
        # Generate personalized insights
        personalized_insights = self._generate_personalized_insights(analytics, progress_summary)
        
        # Generate recommended actions
        recommended_actions = self._generate_recommended_actions(analytics, progress_summary)
        
        dashboard = {
            'user_id': user_id,
            'layout_config': self.default_layout,
            'widget_settings': self._get_default_widget_settings(),
            'current_skin_score': current_score,
            'score_change': score_change,
            'active_concerns_count': active_concerns_count,
            'routine_adherence': routine_adherence,
            'recent_assessments': self._get_recent_assessments(analytics),
            'recent_routines': self._get_recent_routines(analytics),
            'active_goals': self._generate_active_goals(progress_summary),
            'goal_progress': self._calculate_goal_progress(progress_summary),
            'unread_notifications': self._calculate_notifications(analytics),
            'notification_preferences': self._get_default_notification_preferences()
        }
        
        return {
            'dashboard': dashboard,
            'quick_stats': quick_stats,
            'personalized_insights': personalized_insights,
            'recommended_actions': recommended_actions
        }
    
    def _get_default_widget_settings(self) -> dict:
        """Get default widget display settings"""
        return {
            'score_overview': {'visible': True, 'refresh_interval': 3600},
            'concern_summary': {'visible': True, 'refresh_interval': 3600},
            'routine_adherence': {'visible': True, 'refresh_interval': 1800},
            'progress_chart': {'visible': True, 'refresh_interval': 3600},
            'recommendations': {'visible': True, 'refresh_interval': 7200}
        }
    
    def _generate_personalized_insights(self, analytics: dict, progress_summary: dict) -> list:
        """Generate personalized insights for dashboard"""
        insights = []
        
        # Score-based insights
        current_score = analytics.get('average_score')
        if current_score:
            if current_score >= 80:
                insights.append("Your skin health is excellent! Maintain your current routine.")
            elif current_score >= 60:
                insights.append("Your skin health is good with room for improvement.")
            elif current_score >= 40:
                insights.append("Your skin health needs attention - consider consulting a dermatologist.")
            else:
                insights.append("Your skin health requires immediate attention - seek professional advice.")
        
        # Progress-based insights
        if progress_summary.get('total_improvement', 0) > 0:
            insights.append(f"You've improved your skin health by {progress_summary['total_improvement']} points!")
        
        # Concern-based insights
        resolved_count = analytics.get('resolved_concerns_count', 0)
        if resolved_count > 0:
            insights.append(f"Great job! You've resolved {resolved_count} skin concern(s).")
        
        return insights
    
    def _generate_recommended_actions(self, analytics: dict, progress_summary: dict) -> list:
        """Generate recommended actions for dashboard"""
        actions = []
        
        # Routine-based actions
        adherence = analytics.get('routine_adherence_avg')
        if adherence and adherence < 70:
            actions.append("Improve routine consistency by setting daily reminders")
        
        # Assessment-based actions
        if len(analytics.get('score_history', [])) < 2:
            actions.append("Complete another skin assessment in 2 weeks to track progress")
        
        # Concern-based actions
        new_concerns = analytics.get('new_concerns_count', 0)
        if new_concerns > 0:
            actions.append("Review your routine to address new skin concerns")
        
        # General maintenance actions
        actions.append("Continue current routine for at least 2 more weeks before making changes")
        actions.append("Stay hydrated and maintain consistent sleep schedule")
        
        return actions
    
    def _get_recent_assessments(self, analytics: dict) -> list:
        """Get recent assessment summaries"""
        # Placeholder - would come from actual assessment data
        return []
    
    def _get_recent_routines(self, analytics: dict) -> list:
        """Get recent routine summaries"""
        # Placeholder - would come from actual routine data
        return []
    
    def _generate_active_goals(self, progress_summary: dict) -> list:
        """Generate active skincare goals"""
        goals = []
        
        if progress_summary.get('total_improvement', 0) < 10:
            goals.append({
                'name': 'Improve Skin Health Score',
                'target': 'Increase score by 10 points',
                'deadline': '30 days',
                'progress': min(100, (progress_summary.get('total_improvement', 0) / 10) * 100)
            })
        
        goals.append({
            'name': 'Maintain Routine Consistency',
            'target': '80%+ adherence',
            'deadline': 'Ongoing',
            'progress': progress_summary.get('routine_performance', {}).get('latest_adherence', 0)
        })
        
        return goals
    
    def _calculate_goal_progress(self, progress_summary: dict) -> dict:
        """Calculate progress towards goals"""
        return {
            'overall_progress': 65,  # Placeholder
            'goals_completed': progress_summary.get('achievements', {}).get('total_milestones', 0),
            'goals_pending': 2  # Placeholder
        }
    
    def _calculate_notifications(self, analytics: dict) -> int:
        """Calculate unread notifications count"""
        # Placeholder - would be based on actual notification system
        notifications = 0
        
        if analytics.get('new_concerns_count', 0) > 0:
            notifications += 1
        
        if analytics.get('score_trend') == 'declining':
            notifications += 1
        
        return notifications
    
    def _get_default_notification_preferences(self) -> dict:
        """Get default notification preferences"""
        return {
            'assessment_reminders': True,
            'routine_reminders': True,
            'progress_updates': True,
            'product_recommendations': True,
            'educational_content': True
        }
    
    def update_dashboard(self, user_id: str, update_data: dict, 
                        current_dashboard: dict) -> dict:
        """
        Update dashboard configuration
        """
        updated_dashboard = current_dashboard.copy()
        
        if update_data.get('layout_config'):
            updated_dashboard['layout_config'] = update_data['layout_config']
        
        if update_data.get('widget_settings'):
            updated_dashboard['widget_settings'].update(update_data['widget_settings'])
        
        if update_data.get('notification_preferences'):
            updated_dashboard['notification_preferences'] = update_data['notification_preferences']
        
        updated_dashboard['updated_at'] = datetime.utcnow().isoformat()
        
        return updated_dashboard