def prioritize_concerns(concerns: list) -> str:
    """
    Determine overall priority level based on identified concerns.
    """
    high_priority_concerns = ['Skin Cancer Risk', 'Severe Acne']
    medium_priority_concerns = ['Pigmentation', 'Premature Aging', 'Dark Circles', 'Acne']

    # Check for high priority concerns
    for concern in concerns:
        if concern in high_priority_concerns:
            return 'High'

    # Check for medium priority concerns
    for concern in concerns:
        if concern in medium_priority_concerns:
            return 'Medium'

    # If no specific concerns found, determine based on count
    if len(concerns) >= 4:
        return 'Medium'
    elif len(concerns) >= 2:
        return 'Low'
    else:
        return 'Low'

def get_concern_priority(concern: str) -> str:
    """
    Get priority level for individual concern.
    """
    high_priority = ['Skin Cancer Risk', 'Severe Acne']
    medium_priority = ['Pigmentation', 'Premature Aging', 'Dark Circles', 'Acne', 'Sun Damage']

    if concern in high_priority:
        return 'High'
    elif concern in medium_priority:
        return 'Medium'
    else:
        return 'Low'
