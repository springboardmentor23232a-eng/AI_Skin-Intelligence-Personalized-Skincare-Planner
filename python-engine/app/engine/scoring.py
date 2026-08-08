def calculate_skin_health_score(assessment_data: dict) -> int:
    """
    Calculate skin health score based on assessment data.
    Score starts at 100 and points are deducted based on negative factors.
    """
    score = 100

    # Sleep penalty
    if assessment_data.get('sleep_hours', 8) < 6:
        score -= 15

    # Water intake penalty
    if assessment_data.get('water_intake', 2) < 2:
        score -= 10

    # Smoking penalty
    if assessment_data.get('smoking', False):
        score -= 20

    # Sun exposure penalty
    if assessment_data.get('sun_exposure', 'low') == 'high':
        score -= 15
    elif assessment_data.get('sun_exposure', 'low') == 'medium':
        score -= 5

    # Stress penalty
    if assessment_data.get('stress_level', 'low') == 'high':
        score -= 10
    elif assessment_data.get('stress_level', 'low') == 'medium':
        score -= 5

    # Age factor (older skin needs more care)
    if assessment_data.get('age', 25) > 50:
        score -= 5

    # Ensure score doesn't go below 0
    return max(0, score)

def get_overall_condition(score: int) -> str:
    """
    Determine overall skin condition based on health score.
    """
    if score >= 80:
        return "Excellent"
    elif score >= 60:
        return "Good"
    elif score >= 40:
        return "Fair"
    elif score >= 20:
        return "Poor"
    else:
        return "Critical"
