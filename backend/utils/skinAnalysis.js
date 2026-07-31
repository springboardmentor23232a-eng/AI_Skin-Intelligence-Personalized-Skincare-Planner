/**
 * Skin Type Assessment Logic
 * Analyzes user responses to determine skin type and provide recommendations
 */

class SkinAnalyzer {
  /**
   * Analyze skin type based on user assessment responses
   * @param {Object} assessment - User's assessment responses
   * @returns {Object} Skin type analysis with recommendations
   */
  static analyzeSkinType(assessment) {
    const { 
      oiliness, 
      dryness, 
      sensitivity, 
      breakouts, 
      pore_size, 
      skin_feel,
      environment 
    } = assessment;

    let skinType = 'normal';
    let confidence = 0;
    let characteristics = [];
    let recommendations = [];

    // Analyze oiliness patterns
    if (oiliness === 'very_oily' || oiliness === 'oily') {
      skinType = 'oily';
      confidence += 30;
      characteristics.push('Excess sebum production', 'Visible pores', 'Shiny appearance');
      recommendations.push(
        'Use gentle, foaming cleansers',
        'Look for oil-free, non-comedogenic products',
        'Consider salicylic acid or benzoyl peroxide for acne control',
        'Use matte moisturizers and sunscreens',
        'Avoid heavy creams and occlusives'
      );
    }

    // Analyze dryness patterns
    if (dryness === 'very_dry' || dryness === 'dry') {
      if (skinType === 'oily') {
        skinType = 'combination';
        confidence += 20;
        characteristics.push('Oily T-zone, dry cheeks', 'Varied pore size');
        recommendations.push(
          'Use different products for different areas',
          'Balance hydration without over-moisturizing oily areas',
          'Consider gel moisturizers for oily zones'
        );
      } else {
        skinType = 'dry';
        confidence += 30;
        characteristics.push('Tight, rough texture', 'Flaky patches', 'Dull appearance');
        recommendations.push(
          'Use creamy, hydrating cleansers',
          'Look for hyaluronic acid and ceramides',
          'Apply moisturizer on damp skin',
          'Use gentle exfoliants (lactic acid)',
          'Consider overnight sleeping masks'
        );
      }
    }

    // Analyze sensitivity
    if (sensitivity === 'very_sensitive' || sensitivity === 'sensitive') {
      confidence += 25;
      characteristics.push('Easily irritated', 'Redness-prone', 'Reacts to products');
      recommendations.push(
        'Patch test new products',
        'Avoid fragrances and essential oils',
        'Use soothing ingredients like aloe vera and chamomile',
        'Choose products with minimal ingredients',
        'Avoid physical scrubs and harsh chemicals'
      );
      
      if (skinType === 'oily') {
        skinType = 'sensitive_oily';
      } else if (skinType === 'dry') {
        skinType = 'sensitive_dry';
      } else if (skinType === 'combination') {
        skinType = 'sensitive_combination';
      } else {
        skinType = 'sensitive';
      }
    }

    // Analyze breakout patterns
    if (breakouts === 'frequent' || breakouts === 'occasional') {
      characteristics.push('Acne-prone', 'Congestion-prone');
      recommendations.push(
        'Consider non-comedogenic products',
        'Look for niacinamide to regulate oil production',
        'Avoid touching your face',
        'Cleanse after sweating'
      );
      
      if (skinType === 'oily' || skinType === 'combination') {
        confidence += 15;
      }
    }

    // Analyze pore size
    if (pore_size === 'large' || pore_size === 'visible') {
      characteristics.push('Enlarged pores');
      recommendations.push(
        'Consider retinoids to improve cell turnover',
        'Use clay masks weekly',
        'Look for niacinamide to minimize pore appearance'
      );
    }

    // Analyze skin feel
    if (skin_feel === 'tight') {
      if (skinType !== 'dry' && skinType !== 'sensitive_dry') {
        skinType = 'dry';
        confidence += 15;
      }
    } else if (skin_feel === 'oily') {
      if (skinType !== 'oily' && skinType !== 'sensitive_oily') {
        skinType = 'oily';
        confidence += 15;
      }
    }

    // Normalize confidence
    confidence = Math.min(confidence, 95);

    // Default to normal if low confidence
    if (confidence < 40) {
      skinType = 'normal';
      characteristics = ['Balanced oil production', 'Few skin concerns', 'Even texture'];
      recommendations = [
        'Maintain current routine',
        'Use gentle cleansers and moisturizers',
        'Always wear sunscreen',
        'Stay hydrated'
      ];
    }

    return {
      skinType,
      confidence,
      characteristics,
      recommendations,
      assessment: {
        ...assessment,
        analyzedAt: new Date().toISOString()
      }
    };
  }

  /**
   * Generate skin concerns from user input
   * @param {Array} userConcerns - User's reported concerns
   * @returns {Array} Standardized skin concerns
   */
  static standardizeConcerns(userConcerns) {
    const concernMapping = {
      'acne': 'acne',
      'pimples': 'acne',
      'breakouts': 'acne',
      'wrinkles': 'aging',
      'fine lines': 'aging',
      'anti-aging': 'aging',
      'dark spots': 'hyperpigmentation',
      'dark marks': 'hyperpigmentation',
      'uneven tone': 'hyperpigmentation',
      'discoloration': 'hyperpigmentation',
      'redness': 'sensitivity',
      'irritation': 'sensitivity',
      'dry skin': 'dryness',
      'flaky': 'dryness',
      'oily skin': 'oiliness',
      'shiny': 'oiliness',
      'large pores': 'pores',
      'blackheads': 'congestion',
      'whiteheads': 'congestion',
      'dullness': 'dullness',
      'lack of glow': 'dullness'
    };

    const standardized = [];
    userConcerns.forEach(concern => {
      const lowerConcern = concern.toLowerCase();
      if (concernMapping[lowerConcern]) {
        const mapped = concernMapping[lowerConcern];
        if (!standardized.includes(mapped)) {
          standardized.push(mapped);
        }
      } else {
        if (!standardized.includes(lowerConcern)) {
          standardized.push(lowerConcern);
        }
      }
    });

    return standardized;
  }

  /**
   * Generate personalized routine based on skin type
   * @param {String} skinType - Determined skin type
   * @param {Array} concerns - User's concerns
   * @returns {Object} Morning and evening routines
   */
  static generateRoutine(skinType, concerns = []) {
    const routines = {
      morning: {
        steps: [],
        notes: []
      },
      evening: {
        steps: [],
        notes: []
      }
    };

    // Base routine for all skin types
    routines.morning.steps.push(
      { step: 1, action: 'Cleanse', product: 'Gentle cleanser', frequency: 'Daily' },
      { step: 2, action: 'Treat', product: 'Vitamin C serum', frequency: 'Daily' },
      { step: 3, action: 'Moisturize', product: 'Light moisturizer', frequency: 'Daily' },
      { step: 4, action: 'Protect', product: 'SPF 30+ sunscreen', frequency: 'Daily' }
    );

    routines.evening.steps.push(
      { step: 1, action: 'Cleanse', product: 'Gentle cleanser', frequency: 'Daily' },
      { step: 2, action: 'Treat', product: 'Treatment serum', frequency: 'Daily' },
      { step: 3, action: 'Moisturize', product: 'Night moisturizer', frequency: 'Daily' }
    );

    // Customize based on skin type
    switch (skinType) {
      case 'oily':
        routines.morning.steps[1].product = 'Niacinamide serum';
        routines.morning.steps[2].product = 'Oil-free moisturizer';
        routines.evening.steps[1].product = 'Salicylic acid treatment';
        routines.evening.steps[2].product = 'Gel moisturizer';
        routines.morning.notes.push('Focus on oil control without stripping skin');
        routines.evening.notes.push('Consider retinol 2-3x per week');
        break;

      case 'dry':
        routines.morning.steps[0].product = 'Creamy cleanser';
        routines.morning.steps[1].product = 'Hyaluronic acid serum';
        routines.morning.steps[2].product = 'Rich moisturizer';
        routines.evening.steps[0].product = 'Creamy cleanser';
        routines.evening.steps[1].product = 'Peptide serum';
        routines.evening.steps[2].product = 'Overnight mask or rich cream';
        routines.morning.notes.push('Apply moisturizer on damp skin');
        routines.evening.notes.push('Use gentle exfoliants 1-2x per week');
        break;

      case 'combination':
        routines.morning.steps[1].product = 'Balancing serum';
        routines.morning.steps[2].product = 'Light moisturizer';
        routines.evening.steps[1].product = 'Treatment serum (target specific concerns)';
        routines.evening.steps[2].product = 'Balancing moisturizer';
        routines.morning.notes.push('May need different products for T-zone vs cheeks');
        routines.evening.notes.push('Spot treat as needed');
        break;

      case 'sensitive':
        routines.morning.steps[0].product = 'Ultra-gentle cleanser';
        routines.morning.steps[1].product = 'Soothing serum';
        routines.morning.steps[2].product = 'Fragrance-free moisturizer';
        routines.evening.steps[0].product = 'Ultra-gentle cleanser';
        routines.evening.steps[1].product = 'Repair serum';
        routines.evening.steps[2].product = 'Soothing night cream';
        routines.morning.notes.push('Patch test all new products');
        routines.evening.notes.push('Avoid active ingredients on irritated skin');
        break;

      case 'sensitive_oily':
        routines.morning.steps[0].product = 'Gentle foaming cleanser';
        routines.morning.steps[1].product = 'Niacinamide serum';
        routines.morning.steps[2].product = 'Light oil-free moisturizer';
        routines.evening.steps[0].product = 'Gentle foaming cleanser';
        routines.evening.steps[1].product = 'Gentle treatment serum';
        routines.evening.steps[2].product = 'Light gel moisturizer';
        routines.morning.notes.push('Balance oil control with soothing ingredients');
        routines.evening.notes.push('Introduce actives slowly');
        break;

      case 'sensitive_dry':
        routines.morning.steps[0].product = 'Creamy soothing cleanser';
        routines.morning.steps[1].product = 'Hyaluronic acid serum';
        routines.morning.steps[2].product = 'Rich fragrance-free moisturizer';
        routines.evening.steps[0].product = 'Creamy soothing cleanser';
        routines.evening.steps[1].product = 'Repair peptide serum';
        routines.evening.steps[2].product = 'Rich night cream';
        routines.morning.notes.push('Focus on barrier repair');
        routines.evening.notes.push('Avoid harsh exfoliants');
        break;

      default: // normal
        routines.morning.notes.push('Maintain current balanced routine');
        routines.evening.notes.push('Add treatments as needed for specific concerns');
    }

    // Add concern-specific treatments
    if (concerns.includes('acne')) {
      routines.evening.steps.splice(2, 0, {
        step: 2.5,
        action: 'Spot Treat',
        product: 'Acne treatment',
        frequency: 'As needed'
      });
    }

    if (concerns.includes('aging')) {
      routines.evening.steps[1].product = 'Retinol/Retinoid';
      routines.evening.notes.push('Use retinol 2-3x per week, increase gradually');
    }

    if (concerns.includes('hyperpigmentation')) {
      routines.morning.steps[1].product = 'Vitamin C + Niacinamide serum';
      routines.evening.steps[1].product = 'Alpha arbutin or tranexamic acid';
    }

    return routines;
  }

  /**
   * Calculate skin health score based on various factors
   * @param {Object} profileData - User's profile and tracking data
   * @returns {Object} Health score with breakdown
   */
  static calculateHealthScore(profileData) {
    const { skinProfile, lifestyle, sleep, hydration, environmental } = profileData;
    
    let baseScore = 70; // Starting score
    let factors = [];

    // Skin profile factors
    if (skinProfile) {
      if (skinProfile.sensitivity_level === 'low') {
        baseScore += 5;
        factors.push({ factor: 'Low skin sensitivity', impact: '+5' });
      } else if (skinProfile.sensitivity_level === 'high') {
        baseScore -= 5;
        factors.push({ factor: 'High skin sensitivity', impact: '-5' });
      }

      if (!skinProfile.skin_concerns || skinProfile.skin_concerns.length === 0) {
        baseScore += 5;
        factors.push({ factor: 'No major skin concerns', impact: '+5' });
      } else {
        baseScore -= skinProfile.skin_concerns.length * 2;
        factors.push({ factor: `${skinProfile.skin_concerns.length} skin concerns`, impact: `-${skinProfile.skin_concerns.length * 2}` });
      }
    }

    // Lifestyle factors
    if (lifestyle && lifestyle.length > 0) {
      const latestLifestyle = lifestyle[0];
      if (latestLifestyle.stress_level === 'low') {
        baseScore += 5;
        factors.push({ factor: 'Low stress level', impact: '+5' });
      } else if (latestLifestyle.stress_level === 'high') {
        baseScore -= 5;
        factors.push({ factor: 'High stress level', impact: '-5' });
      }

      if (!latestLifestyle.smoking_status) {
        baseScore += 10;
        factors.push({ factor: 'Non-smoker', impact: '+10' });
      } else {
        baseScore -= 15;
        factors.push({ factor: 'Smoker', impact: '-15' });
      }

      if (latestLifestyle.exercise_frequency === 'active' || latestLifestyle.exercise_frequency === 'very_active') {
        baseScore += 5;
        factors.push({ factor: 'Regular exercise', impact: '+5' });
      }
    }

    // Sleep factors
    if (sleep && sleep.length > 0) {
      const recentSleep = sleep.slice(0, 7); // Last 7 days
      const avgDuration = recentSleep.reduce((sum, s) => sum + (s.sleep_duration || 0), 0) / recentSleep.length;
      
      if (avgDuration >= 7 && avgDuration <= 9) {
        baseScore += 8;
        factors.push({ factor: 'Optimal sleep duration', impact: '+8' });
      } else if (avgDuration < 6) {
        baseScore -= 5;
        factors.push({ factor: 'Poor sleep duration', impact: '-5' });
      }

      const goodQualityCount = recentSleep.filter(s => s.sleep_quality === 'good' || s.sleep_quality === 'excellent').length;
      if (goodQualityCount >= 5) {
        baseScore += 5;
        factors.push({ factor: 'Good sleep quality', impact: '+5' });
      }
    }

    // Hydration factors
    if (hydration && hydration.length > 0) {
      const recentHydration = hydration.slice(0, 7);
      const goalAchievedCount = recentHydration.filter(h => h.goal_achieved).length;
      
      if (goalAchievedCount >= 5) {
        baseScore += 8;
        factors.push({ factor: 'Consistent hydration goals met', impact: '+8' });
      } else if (goalAchievedCount <= 2) {
        baseScore -= 3;
        factors.push({ factor: 'Poor hydration consistency', impact: '-3' });
      }
    }

    // Environmental factors
    if (environmental && environmental.length > 0) {
      const recentEnv = environmental.slice(0, 7);
      const sunscreenCount = recentEnv.filter(e => e.sunscreen_applied).length;
      
      if (sunscreenCount >= 5) {
        baseScore += 10;
        factors.push({ factor: 'Consistent sunscreen use', impact: '+10' });
      } else if (sunscreenCount <= 2) {
        baseScore -= 5;
        factors.push({ factor: 'Inconsistent sunscreen use', impact: '-5' });
      }

      const highPollutionCount = recentEnv.filter(e => e.pollution_level === 'high').length;
      if (highPollutionCount >= 3) {
        baseScore -= 3;
        factors.push({ factor: 'High pollution exposure', impact: '-3' });
      }
    }

    // Ensure score is within bounds
    baseScore = Math.max(0, Math.min(100, baseScore));

    return {
      overallScore: baseScore,
      factors,
      calculatedAt: new Date().toISOString(),
      recommendations: this.getHealthRecommendations(baseScore, factors)
    };
  }

  /**
   * Get recommendations based on health score
   */
  static getHealthRecommendations(score, factors) {
    const recommendations = [];

    if (score < 50) {
      recommendations.push('Your skin health needs significant attention. Consider consulting a dermatologist.');
      recommendations.push('Focus on consistent skincare routine and lifestyle improvements.');
    } else if (score < 70) {
      recommendations.push('There\'s room for improvement in your skin health routine.');
      recommendations.push('Address the negative factors identified above for better results.');
    } else if (score < 85) {
      recommendations.push('Your skin health is good! Small improvements could make it excellent.');
      recommendations.push('Continue your current routine and consider adding targeted treatments.');
    } else {
      recommendations.push('Excellent skin health! Maintain your current routine.');
      recommendations.push('Continue monitoring and adjusting as needed.');
    }

    // Specific recommendations based on factors
    factors.forEach(factor => {
      if (factor.factor.includes('smoking')) {
        recommendations.push('Quitting smoking would significantly improve your skin health.');
      }
      if (factor.factor.includes('sunscreen')) {
        recommendations.push('Daily sunscreen use is crucial for preventing skin damage and aging.');
      }
      if (factor.factor.includes('hydration')) {
        recommendations.push('Proper hydration is essential for skin health and appearance.');
      }
      if (factor.factor.includes('sleep')) {
        recommendations.push('Quality sleep is vital for skin repair and regeneration.');
      }
    });

    return recommendations;
  }
}

module.exports = SkinAnalyzer;