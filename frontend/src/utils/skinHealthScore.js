/**
 * Skin Health Scoring Engine
 * ==========================
 * Pure, side-effect-free calculators for the 5-component weighted Skin
 * Health Score. The Overall Score always uses the full weighted formula
 * — Skin Condition 35% / Lifestyle 20% / Sleep 15% / Routine 20% /
 * Hydration 10% (100% total) — with NO renormalization and NO factor
 * ever silently excluded.
 *
 * Every factor is guaranteed to resolve to a real number once its
 * underlying data exists:
 *  - Skin Condition  -> skin_reports.skin_health_score (AI) when a
 *    report exists, otherwise the user's own manual concern/severity
 *    questionnaire (user_skincare_preferences.concern_severity +
 *    manual_skin_assessed)
 *  - Lifestyle       -> user_skincare_preferences.activity_level +
 *    stress_level (outdoor_exposure adds nuance when also set)
 *  - Sleep Quality   -> user_skincare_preferences.sleep_hours, blended
 *    with sleep_quality when also set
 *  - Routine Consistency -> skincare_plans.checklist — ALWAYS
 *    computable (0/100 when there's no routine yet or nothing's been
 *    completed; that 0 is a real, true measurement, not a placeholder)
 *  - Hydration       -> user_skincare_preferences.water_intake_liters
 *
 * The only case where a component genuinely has no number yet is when
 * the user hasn't answered its questionnaire. That state is exposed as
 * `available: false` / `needsInput: true` so the UI can render an input
 * form asking for it — never a "Not Available" label, and never a
 * fabricated value in its place.
 */

export const SCORE_WEIGHTS = {
  skinCondition: 0.35,
  lifestyle: 0.20,
  sleep: 0.15,
  routine: 0.20,
  hydration: 0.10,
};

/** Never lets a score reach the UI as NaN/undefined/null/Infinity. */
export const clampScore = (score) => {
  if (!Number.isFinite(score)) return 0;
  return Math.min(100, Math.max(0, Math.round(score)));
};

export const getHealthStatus = (score) => {
  if (score >= 80) return 'Excellent';
  if (score >= 60) return 'Good';
  if (score >= 40) return 'Fair';
  return 'Needs Attention';
};

// ---------------------------------------------------------------------
// 1. Skin Condition Assessment (35%)
// ---------------------------------------------------------------------

const SEVERITY_POINTS = {
  mild: 85,
  moderate: 60,
  severe: 35,
};

// Manual fallback used only when there's no AI skin_reports row yet.
// No concerns selected (and the questionnaire was submitted) reads as
// "skin currently feels clear" -> a high baseline, not a guess.
function calculateManualSkinConditionScore(
  knownConcerns,
  concernSeverity
) {
  const concerns = Array.isArray(knownConcerns)
    ? knownConcerns
    : [];

  if (concerns.length === 0) return 90;

  const points = concerns
    .map(
      (c) =>
        SEVERITY_POINTS[concernSeverity?.[c]]
    )
    .filter((p) => p != null);

  if (points.length === 0) return null;

  return (
    points.reduce((a, b) => a + b, 0) /
    points.length
  );
}

export function calculateSkinConditionScore(
  latestReport,
  prefs
) {
  const aiScore = Number(
    latestReport?.skin_health_score
  );

  if (
    latestReport &&
    Number.isFinite(aiScore)
  ) {
    return {
      available: true,
      score: clampScore(aiScore),
      source: 'ai',
      dataUsed: `Latest AI skin assessment (${new Date(
        latestReport.created_at
      ).toLocaleDateString()}) — score ${clampScore(
        aiScore
      )}/100.`,
      explanation:
        'Taken directly from your most recent AI skin analysis.',
    };
  }

  if (prefs?.manual_skin_assessed) {
    const manual =
      calculateManualSkinConditionScore(
        prefs.known_concerns,
        prefs.concern_severity
      );

    if (manual != null) {
      const concerns =
        prefs.known_concerns || [];

      return {
        available: true,
        score: clampScore(manual),
        source: 'manual',
        dataUsed: concerns.length
          ? `Self-reported concerns: ${concerns
              .map(
                (c) =>
                  `${c} (${
                    prefs.concern_severity?.[c] ||
                    'unrated'
                  })`
              )
              .join(', ')}.`
          : 'You reported no notable skin concerns right now.',
        explanation: concerns.length
          ? 'Calculated from the severity you selected for each concern (mild = 85, moderate = 60, severe = 35, averaged).'
          : 'No concerns reported, so a high baseline score is used.',
      };
    }
  }

  return {
    available: false,
    score: null,
    needsInput: true,
    reason: 'skin condition',
  };
}

// ---------------------------------------------------------------------
// 2. Lifestyle Habits (20%)
// ---------------------------------------------------------------------

const ACTIVITY_POINTS = {
  low: 40,
  moderate: 75,
  high: 100,
};

const STRESS_POINTS = {
  low: 100,
  moderate: 65,
  high: 30,
};

const EXPOSURE_POINTS = {
  low: 100,
  moderate: 70,
  high: 40,
};

export function calculateLifestyleScore(
  prefs
) {
  const hasActivity =
    prefs?.activity_level &&
    ACTIVITY_POINTS[
      prefs.activity_level
    ] != null;

  const hasStress =
    prefs?.stress_level &&
    STRESS_POINTS[
      prefs.stress_level
    ] != null;

  if (!hasActivity || !hasStress) {
    return {
      available: false,
      score: null,
      needsInput: true,
      reason: 'lifestyle',
    };
  }

  const parts = [
    ACTIVITY_POINTS[
      prefs.activity_level
    ],
    STRESS_POINTS[
      prefs.stress_level
    ],
  ];

  const dataUsed = [
    `Activity level: ${prefs.activity_level}`,
    `Stress level: ${prefs.stress_level}`,
  ];

  if (
    prefs.outdoor_exposure &&
    EXPOSURE_POINTS[
      prefs.outdoor_exposure
    ] != null
  ) {
    parts.push(
      EXPOSURE_POINTS[
        prefs.outdoor_exposure
      ]
    );

    dataUsed.push(
      `Outdoor exposure: ${prefs.outdoor_exposure}`
    );
  }

  const avg =
    parts.reduce((a, b) => a + b, 0) /
    parts.length;

  return {
    available: true,
    score: clampScore(avg),
    dataUsed: dataUsed.join(' · '),
    explanation:
      'Average of your activity level, stress level, and outdoor exposure (when set), each mapped to points out of 100.',
  };
}

// ---------------------------------------------------------------------
// 3. Sleep Quality (15%)
// ---------------------------------------------------------------------

const SLEEP_QUALITY_POINTS = {
  poor: 30,
  average: 65,
  good: 95,
};

// Documented, monotonic hours -> points curve. 7-9h is treated as the
// generally-cited ideal range; scores taper off on both sides rather
// than dropping off a cliff.
function sleepHoursToScore(hours) {
  if (hours < 4) return 20;
  if (hours < 5) return 40;
  if (hours < 6) return 60;
  if (hours < 7) return 75;
  if (hours <= 9) return 100;
  if (hours <= 10) return 85;
  return 65;
}

export function calculateSleepScore(
  prefs
) {
  const hours = Number(
    prefs?.sleep_hours
  );

  if (!Number.isFinite(hours)) {
    return {
      available: false,
      score: null,
      needsInput: true,
      reason: 'sleep',
    };
  }

  const hoursScore =
    sleepHoursToScore(hours);

  let score = hoursScore;

  const dataUsed = [
    `Average sleep: ${hours} hour(s)/night`,
  ];

  let explanation =
    'Based on your average nightly sleep duration (7–9 hours scores highest).';

  if (
    prefs.sleep_quality &&
    SLEEP_QUALITY_POINTS[
      prefs.sleep_quality
    ] != null
  ) {
    score =
      (hoursScore +
        SLEEP_QUALITY_POINTS[
          prefs.sleep_quality
        ]) /
      2;

    dataUsed.push(
      `Sleep quality: ${prefs.sleep_quality}`
    );

    explanation =
      'Average of a duration-based score (7–9 hours scores highest) and your self-rated sleep quality.';
  }

  return {
    available: true,
    score: clampScore(score),
    dataUsed: dataUsed.join(' · '),
    explanation,
  };
}

// ---------------------------------------------------------------------
// 4. Routine Consistency (20%)
// ---------------------------------------------------------------------

/*
 * Routine adherence is based on ACTUAL checklist completion.
 *
 * Instead of requiring an entire day to be 100% complete,
 * we calculate:
 *
 *     completed routine steps
 *     ----------------------  × 100
 *     tracked routine steps
 *
 * Example:
 *   2/8 steps completed = 25
 *   4/8 steps completed = 50
 *   6/8 steps completed = 75
 *   8/8 steps completed = 100
 *
 * If there is no routine or no checklist activity yet,
 * the score is genuinely 0.
 */

export function calculateRoutineConsistency(
  plan
) {
  if (!plan?.created_at) {
    return {
      available: true,
      score: 0,
      hasRoutine: false,
      completedDays: 0,
      plannedDays: 0,
      dataUsed:
        'No skincare routine has been created yet.',
      explanation:
        'Routine Adherence starts at 0 until a routine exists and days are tracked.',
    };
  }

  const morningRoutine =
    Array.isArray(plan.morning_routine)
      ? plan.morning_routine
      : [];

  const eveningRoutine =
    Array.isArray(plan.evening_routine)
      ? plan.evening_routine
      : [];

  const totalItemsPerDay =
    morningRoutine.length +
    eveningRoutine.length;

  if (totalItemsPerDay === 0) {
    return {
      available: true,
      score: 0,
      hasRoutine: true,
      completedDays: 0,
      plannedDays: 0,
      dataUsed:
        'Your current routine has no steps yet.',
      explanation:
        'Routine Adherence starts at 0 until your routine has steps to track.',
    };
  }

  const start = new Date(
    plan.created_at
  );

  start.setHours(0, 0, 0, 0);

  const today = new Date();

  today.setHours(0, 0, 0, 0);

  const plannedDays = Math.max(
    1,
    Math.floor(
      (today - start) / 86400000
    ) + 1
  );

  const checklist =
    plan.checklist || {};

  let totalCompletedSteps = 0;
  let totalTrackedSteps = 0;
  let completedDays = 0;

  Object.values(checklist).forEach(
    (entry) => {
      if (
        !entry ||
        typeof entry !== 'object'
      ) {
        return;
      }

      const completedSteps =
        Object.values(entry).filter(
          (value) => value === true
        ).length;

      totalCompletedSteps += Math.min(
        completedSteps,
        totalItemsPerDay
      );

      totalTrackedSteps +=
        totalItemsPerDay;

      if (
        completedSteps >=
        totalItemsPerDay
      ) {
        completedDays++;
      }
    }
  );

  // No checklist activity yet = genuine 0 score.
  if (totalTrackedSteps === 0) {
    return {
      available: true,
      score: 0,
      hasRoutine: true,
      completedDays: 0,
      plannedDays,
      dataUsed: `0 routine steps completed across ${plannedDays} planned day(s).`,
      explanation:
        'No routine checklist steps have been completed yet.',
    };
  }

  // Actual percentage of completed routine steps.
  const raw =
    (totalCompletedSteps /
      totalTrackedSteps) *
    100;

  return {
    available: true,
    score: clampScore(raw),
    hasRoutine: true,
    completedDays,
    plannedDays,
    completedSteps:
      totalCompletedSteps,
    trackedSteps:
      totalTrackedSteps,
    dataUsed:
      `${totalCompletedSteps} of ${totalTrackedSteps} tracked routine steps completed.`,
    explanation:
      'Routine Adherence is calculated from the percentage of routine checklist steps actually completed.',
  };
}

// ---------------------------------------------------------------------
// 5. Hydration Level (10%)
// ---------------------------------------------------------------------

// Documented, monotonic formula against a commonly-referenced general
// guideline of 3 liters/day (a general wellness reference point, not
// personalized medical advice): a linear ramp up to the target, and
// a gentle taper for well above it.

export function hydrationLitersToScore(
  liters
) {
  const target = 3;

  if (liters <= target) {
    return (
      (liters / target) *
      100
    );
  }

  return Math.max(
    50,
    100 -
      (liters - target) * 10
  );
}

export function calculateHydrationScore(
  prefs
) {
  const liters = Number(
    prefs?.water_intake_liters
  );

  if (!Number.isFinite(liters)) {
    return {
      available: false,
      score: null,
      needsInput: true,
      reason: 'hydration',
    };
  }

  const score = clampScore(
    hydrationLitersToScore(liters)
  );

  return {
    available: true,
    score,
    dataUsed: `Daily water intake: ${liters} liter(s)/day`,
    explanation: `Scored against a general ~3L/day guideline — ${liters}L/day maps to ${score}/100.`,
  };
}

// ---------------------------------------------------------------------
// 6. Skin Improvement Score
//    Informational — NOT one of the 5 weighted factors
// ---------------------------------------------------------------------

export function calculateImprovementScore(
  reports
) {
  if (
    !Array.isArray(reports) ||
    reports.length < 2
  ) {
    return {
      available: false,
      message:
        'Complete another skin assessment later to track changes over time.',
    };
  }

  const sorted = [...reports].sort(
    (a, b) =>
      new Date(b.created_at) -
      new Date(a.created_at)
  );

  const latest = Number(
    sorted[0]?.skin_health_score
  );

  const previous = Number(
    sorted[1]?.skin_health_score
  );

  if (
    !Number.isFinite(latest) ||
    !Number.isFinite(previous)
  ) {
    return {
      available: false,
      message:
        'Complete another skin assessment later to track changes over time.',
    };
  }

  const delta = Math.round(
    latest - previous
  );

  let status = 'Stable';

  if (delta > 2) {
    status = 'Improved';
  } else if (delta < -2) {
    status = 'Needs Attention';
  }

  return {
    available: true,
    delta,
    status,
    latest: clampScore(latest),
    previous: clampScore(previous),
  };
}

// ---------------------------------------------------------------------
// 7. Overall Skin Health Score
// ---------------------------------------------------------------------

/*
 * overallScore =
 *
 * (skinCondition * 0.35)
 * + (lifestyle * 0.20)
 * + (sleep * 0.15)
 * + (routine * 0.20)
 * + (hydration * 0.10)
 *
 * Total = 100%
 *
 * No partial scoring.
 * No renormalization.
 * All five factors are required.
 */

export function calculateOverallSkinHealthScore({
  skinCondition,
  lifestyle,
  sleep,
  routine,
  hydration,
}) {
  const components = [
    {
      key: 'skinCondition',
      label: 'Skin Condition',
      ...skinCondition,
      weight:
        SCORE_WEIGHTS.skinCondition,
    },
    {
      key: 'lifestyle',
      label: 'Lifestyle',
      ...lifestyle,
      weight:
        SCORE_WEIGHTS.lifestyle,
    },
    {
      key: 'sleep',
      label: 'Sleep Quality',
      ...sleep,
      weight:
        SCORE_WEIGHTS.sleep,
    },
    {
      key: 'routine',
      label: 'Routine Consistency',
      ...routine,
      weight:
        SCORE_WEIGHTS.routine,
    },
    {
      key: 'hydration',
      label: 'Hydration',
      ...hydration,
      weight:
        SCORE_WEIGHTS.hydration,
    },
  ];

  const missing =
    components.filter(
      (c) =>
        !c.available ||
        !Number.isFinite(c.score)
    );

  if (missing.length > 0) {
    return {
      available: false,
      score: null,
      missingKeys:
        missing.map((c) => c.key),
    };
  }

  const breakdown =
    components.map((c) => ({
      key: c.key,
      label: c.label,
      score: c.score,
      weight: c.weight,
      contribution:
        Math.round(
          c.score *
            c.weight *
            10
        ) / 10,
    }));

  const total =
    breakdown.reduce(
      (sum, c) =>
        sum +
        c.score *
          c.weight,
      0
    );

  return {
    available: true,
    score: clampScore(total),
    breakdown,
  };
}

/**
 * Which of the four questionnaire-backed
 * factors still need the user's input.
 *
 * Routine Consistency is deliberately excluded
 * because it is always computable from tracked
 * behavior.
 */

export function getMissingHealthInputs({
  skinCondition,
  lifestyle,
  sleep,
  hydration,
}) {
  const missing = [];

  if (!skinCondition?.available) {
    missing.push(
      'skinCondition'
    );
  }

  if (!lifestyle?.available) {
    missing.push(
      'lifestyle'
    );
  }

  if (!sleep?.available) {
    missing.push('sleep');
  }

  if (!hydration?.available) {
    missing.push(
      'hydration'
    );
  }

  return missing;
}