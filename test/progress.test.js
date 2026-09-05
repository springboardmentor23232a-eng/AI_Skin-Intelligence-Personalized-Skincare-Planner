/**
 * Test Suite for Module 8: Progress Tracking & Analytics
 * Uses Node.js native test runner (node:test)
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  MOCK_PROGRESS_TRACKING_DATA,
  generateCalendar30Days,
  generateTrendTrajectoryData
} from '../js/mockData.js';

test('1. Progress Tracking Baseline & Longitudinal Checkpoints', () => {
  const data = MOCK_PROGRESS_TRACKING_DATA;
  assert.ok(data, 'Progress tracking data must be defined');
  assert.ok(Array.isArray(data.checkpoints), 'Checkpoints must be an array');
  assert.equal(data.checkpoints.length, 4, 'Should contain 4 structured clinical checkpoints');

  const baseline = data.checkpoints[0];
  const current = data.checkpoints[data.checkpoints.length - 1];

  // Baseline Verification
  assert.equal(baseline.checkpoint_title, 'Baseline Intake Scan');
  assert.equal(baseline.overall_skin_health_score, 68.5);
  assert.equal(baseline.hydration_level, 48.0);
  assert.equal(baseline.barrier_strength, 52.0);

  // Current Milestone Verification
  assert.equal(current.checkpoint_title, 'Current 30-Day Milestone Scan');
  assert.equal(current.overall_skin_health_score, 79.4);
  assert.equal(current.hydration_level, 74.0);
  assert.equal(current.barrier_strength, 86.0);
  assert.equal(current.acne_severity, 12.0);

  // Metric Improvements
  assert.ok(current.overall_skin_health_score > baseline.overall_skin_health_score, 'Skin health must improve from baseline');
  assert.ok(current.hydration_level > baseline.hydration_level, 'Hydration level must increase');
  assert.ok(current.barrier_strength > baseline.barrier_strength, 'Barrier strength must increase');
  assert.ok(current.acne_severity < baseline.acne_severity, 'Acne severity must decrease');
});

test('2. Routine Adherence Metrics & 30-Day Compliance Heatmap', () => {
  const adherence = MOCK_PROGRESS_TRACKING_DATA.adherence;
  assert.ok(adherence, 'Adherence data must be defined');
  assert.equal(adherence.current_streak_days, 18, 'Current active streak should be 18 days');
  assert.equal(adherence.longest_streak_days, 24, 'Longest streak should be 24 days');
  assert.equal(adherence.monthly_compliance_pct, 92.4, 'Monthly compliance should be 92.4%');
  assert.equal(adherence.morning_adherence_avg, 98.0, 'Morning adherence avg should be 98.0%');
  assert.equal(adherence.evening_adherence_avg, 89.5, 'Evening adherence avg should be 89.5%');
  assert.ok(adherence.adherence_to_score_correlation.includes('Positive'), 'Must document positive correlation');
  assert.ok(adherence.adherence_insights.length >= 3, 'Must have at least 3 clinical adherence insights');

  // Test 30-day heatmap calendar helper
  const calendarDays = generateCalendar30Days();
  assert.ok(Array.isArray(calendarDays), '30-day calendar must return array');
  assert.equal(calendarDays.length, 30, 'Must generate exactly 30 days of compliance data');

  calendarDays.forEach((day) => {
    assert.ok(day.date, 'Day must have date string');
    assert.ok(typeof day.day_number === 'number', 'day_number must be a number');
    assert.ok(typeof day.compliance_pct === 'number', 'compliance_pct must be a number');
    assert.ok(['Complete', 'Partial', 'Missed'].includes(day.status), 'Status must be Complete, Partial, or Missed');
    assert.ok(typeof day.streak_active === 'boolean', 'streak_active must be a boolean');
  });
});

test('3. Before & After Optical & Biomarker Comparison Matrix', () => {
  const ba = MOCK_PROGRESS_TRACKING_DATA.beforeAfterComparison;
  assert.ok(ba, 'Before/After comparison structure must exist');
  assert.equal(ba.days_elapsed, 30, 'Intervention duration should be 30 days');
  assert.equal(ba.baseline_score, 68.5);
  assert.equal(ba.current_score, 79.4);
  assert.equal(ba.score_delta, 10.9);
  assert.ok(ba.verdict.includes('+10.9 pts'), 'Verdict must include score improvement');

  // Biomarker deltas verification
  assert.ok(Array.isArray(ba.biomarker_deltas), 'Biomarker deltas must be an array');
  assert.equal(ba.biomarker_deltas.length, 6, 'Must contain 6 key biomarker deltas');

  const hydrationDelta = ba.biomarker_deltas.find(d => d.parameter.includes('Hydration'));
  assert.ok(hydrationDelta, 'Hydration delta parameter must exist');
  assert.equal(hydrationDelta.delta_val, 26.0);
  assert.equal(hydrationDelta.delta_percentage, 54.2);

  const acneDelta = ba.biomarker_deltas.find(d => d.parameter.includes('Acne'));
  assert.ok(acneDelta, 'Acne delta parameter must exist');
  assert.equal(acneDelta.delta_val, -30.0);
  assert.equal(acneDelta.delta_percentage, -71.4);

  // Positive drivers and remaining targets
  assert.ok(ba.top_positive_drivers.length >= 3, 'Must have at least 3 positive drivers');
  assert.ok(ba.remaining_targets.length >= 2, 'Must have remaining targets');
});

test('4. Trend Trajectory & 30-Day AI Predictive Forecast Generator', () => {
  const trends = generateTrendTrajectoryData('30d');
  assert.ok(trends, 'Trend data structure must exist');
  assert.equal(trends.timeframe, '30d');
  assert.equal(trends.improvement_velocity_pts_per_week, 2.54);
  assert.equal(trends.projected_score_30d, 84.5);
  assert.equal(trends.projected_score_60d, 87.8);
  assert.equal(trends.target_score, 85.0);

  // Trajectory curve data points
  assert.ok(Array.isArray(trends.trajectory_curve), 'Trajectory curve must be an array');
  assert.equal(trends.trajectory_curve.length, 61, 'Should contain 31 historical + 30 forecast points');

  const firstHistorical = trends.trajectory_curve[0];
  const milestone = trends.trajectory_curve[30];
  const finalForecast = trends.trajectory_curve[trends.trajectory_curve.length - 1];

  assert.equal(firstHistorical.is_projected, false, 'Initial point is historical');
  assert.equal(firstHistorical.score, 68.5, 'Initial score matches baseline 68.5');

  assert.equal(milestone.is_projected, false, 'Day 30 point is historical');
  assert.equal(milestone.score, 78.2, 'Day 30 historical score approaches current milestone');

  assert.equal(finalForecast.is_projected, true, 'Final point is projected forecast');
  assert.ok(finalForecast.score > milestone.score, 'Projected score demonstrates continued positive momentum');
  assert.ok(finalForecast.score <= 100, 'Score cannot exceed 100');

  // Key trend indicators
  assert.ok(Array.isArray(trends.key_trend_indicators), 'Key indicators must be an array');
  assert.equal(trends.key_trend_indicators.length, 4, 'Must have 4 trend indicators');
});

test('5. Improvement Analysis & AI Dermatologist Clinical Verdict', () => {
  const report = MOCK_PROGRESS_TRACKING_DATA.improvementReport;
  assert.ok(report, 'Improvement report must exist');
  assert.ok(report.overall_health_change.includes('+10.9 pts'), 'Overall health change must document +10.9 pts');
  assert.ok(report.velocity_summary.includes('+2.54 pts'), 'Velocity summary must document points gained per week');

  // Improving factors
  assert.ok(Array.isArray(report.top_improving_factors), 'Top improving factors must be an array');
  assert.equal(report.top_improving_factors.length, 4, 'Must have 4 clinical improving factors');

  // Optimization areas & AI doctor verdict
  assert.ok(Array.isArray(report.areas_for_optimization), 'Areas for optimization must be an array');
  assert.ok(report.ai_dermatologist_verdict.length > 50, 'AI dermatologist verdict must be detailed');
  assert.ok(Array.isArray(report.next_stage_routine_adjustments), 'Next stage routine adjustments must be an array');
  assert.equal(report.next_stage_routine_adjustments.length, 3, 'Must have 3 routine adjustments');
});
