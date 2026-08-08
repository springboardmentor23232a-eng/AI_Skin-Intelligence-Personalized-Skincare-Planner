def identify_concerns(assessment_data: dict) -> list:
    """
    Identify skin concerns based on assessment data using rule-based logic.
    """
    concerns = []

    skin_type = assessment_data.get('skin_type', 'normal')
    water_intake = assessment_data.get('water_intake', 2)
    sleep_hours = assessment_data.get('sleep_hours', 8)
    sun_exposure = assessment_data.get('sun_exposure', 'low')
    smoking = assessment_data.get('smoking', False)
    age = assessment_data.get('age', 25)

    # Skin type based concerns
    if skin_type == 'oily':
        concerns.append('Acne')
        concerns.append('Enlarged Pores')
    elif skin_type == 'dry':
        concerns.append('Dryness')
        concerns.append('Flakiness')
    elif skin_type == 'combination':
        concerns.append('Oily T-Zone')
        concerns.append('Dry Cheeks')

    # Water intake concerns
    if water_intake < 2:
        concerns.append('Dehydration')
        concerns.append('Dull Skin')

    # Sleep concerns
    if sleep_hours < 6:
        concerns.append('Dark Circles')
        concerns.append('Puffiness')
        concerns.append('Premature Aging')

    # Sun exposure concerns
    if sun_exposure == 'high':
        concerns.append('Pigmentation')
        concerns.append('Sun Damage')
        concerns.append('Skin Cancer Risk')
    elif sun_exposure == 'medium':
        concerns.append('Pigmentation')

    # Smoking concerns
    if smoking:
        concerns.append('Premature Aging')
        concerns.append('Skin Cancer Risk')
        concerns.append('Dull Complexion')

    # Age-related concerns
    if age > 35:
        concerns.append('Fine Lines')
        concerns.append('Wrinkles')
    if age > 50:
        concerns.append('Age Spots')
        concerns.append('Loss of Elasticity')

    return list(set(concerns))  # Remove duplicates

def determine_severity(concern: str, assessment_data: dict) -> str:
    """
    Determine severity level for a specific concern.
    """
    high_severity_concerns = ['Skin Cancer Risk', 'Severe Acne']
    medium_severity_concerns = ['Pigmentation', 'Premature Aging', 'Dark Circles']

    if concern in high_severity_concerns:
        return 'High'
    elif concern in medium_severity_concerns:
        return 'Medium'
    else:
        return 'Low'
