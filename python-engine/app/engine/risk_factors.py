def analyze_risk_factors(assessment_data: dict) -> list:
    """
    Analyze risk factors based on assessment data using rule-based logic.
    """
    risk_factors = []

    smoking = assessment_data.get('smoking', False)
    sun_exposure = assessment_data.get('sun_exposure', 'low')
    water_intake = assessment_data.get('water_intake', 2)
    sleep_hours = assessment_data.get('sleep_hours', 8)
    stress_level = assessment_data.get('stress_level', 'low')
    skin_type = assessment_data.get('skin_type', 'normal')

    # Smoking risks
    if smoking:
        risk_factors.append({
            'name': 'Smoking',
            'description': 'Smoking reduces blood flow to skin, causing premature aging',
            'level': 'High'
        })

    # Sun exposure risks
    if sun_exposure == 'high':
        risk_factors.append({
            'name': 'High UV Exposure',
            'description': 'Excessive sun exposure damages skin cells and increases cancer risk',
            'level': 'High'
        })
    elif sun_exposure == 'medium':
        risk_factors.append({
            'name': 'Moderate UV Exposure',
            'description': 'Moderate sun exposure can cause gradual skin damage',
            'level': 'Medium'
        })

    # Water intake risks
    if water_intake < 2:
        risk_factors.append({
            'name': 'Low Water Intake',
            'description': 'Insufficient hydration leads to dry, dull skin',
            'level': 'Medium'
        })

    # Sleep risks
    if sleep_hours < 6:
        risk_factors.append({
            'name': 'Poor Sleep',
            'description': 'Lack of sleep affects skin repair and regeneration',
            'level': 'High'
        })
    elif sleep_hours < 7:
        risk_factors.append({
            'name': 'Insufficient Sleep',
            'description': 'Suboptimal sleep impacts skin health',
            'level': 'Medium'
        })

    # Stress risks
    if stress_level == 'high':
        risk_factors.append({
            'name': 'High Stress',
            'description': 'Chronic stress triggers inflammation and skin issues',
            'level': 'High'
        })
    elif stress_level == 'medium':
        risk_factors.append({
            'name': 'Moderate Stress',
            'description': 'Stress can exacerbate existing skin conditions',
            'level': 'Medium'
        })

    # Skin type specific risks
    if skin_type == 'oily':
        risk_factors.append({
            'name': 'Oily Skin Type',
            'description': 'Prone to acne and breakouts',
            'level': 'Medium'
        })
    elif skin_type == 'dry':
        risk_factors.append({
            'name': 'Dry Skin Type',
            'description': 'Susceptible to irritation and premature aging',
            'level': 'Medium'
        })

    return risk_factors

def get_risk_factor_names(risk_factors: list) -> list:
    """
    Extract just the names from risk factors for simple response.
    """
    return [rf['name'] for rf in risk_factors]
