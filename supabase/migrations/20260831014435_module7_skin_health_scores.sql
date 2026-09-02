/*
# Module 7 — Skin Health Scoring Engine

## Overview
Adds a single new table to store the transparent, weighted Skin Health Score
(and its five components) each time it is recalculated for a user. This is a
NEW, distinct concept from `skin_assessments.skin_health_score` (which is the
raw per-assessment score already produced by the ML/rule-based assessment
engine in Module 1/2). The existing column is reused as one of the inputs to
the new "Skin Condition" component below — it is not duplicated or replaced.

## New Table

`skin_health_scores` — one row per calculation. Stores the five normalized
0-100 component scores, the final weighted overall score, and which
assessment/date it was calculated for, so a trend/history view can be built
from real, stored values (never fabricated at read time).

Columns:
- id                       uuid PK
- user_id                  uuid, references auth.users, owner of the score
- assessment_id            uuid, references skin_assessments (nullable — a
                            score can be recalculated after routine feedback
                            without a new assessment)
- skin_condition_score     integer 0-100 (35% weight)
- lifestyle_score          integer 0-100, nullable (20% weight; null when no
                            lifestyle profile fields were available)
- sleep_score              integer 0-100, nullable (15% weight)
- routine_consistency_score integer 0-100, nullable (20% weight)
- hydration_score          integer 0-100, nullable (10% weight)
- overall_score            integer 0-100 NOT NULL, final weighted result
- score_date               timestamptz — the reference date for this score
- created_at               timestamptz

Nullable component columns preserve, in the database, exactly which
components had real underlying data at calculation time (vs. a neutral
default used only for the weighted formula) — see `frontend/js/skinHealthScore.js`
for the calculation and missing-data handling logic.

## Security (RLS)
Follows the exact same pattern already used by `routines`, `routine_feedback`,
and `adaptive_updates` in this project:
- Owner (auth.uid() = user_id) can select/insert/delete their own rows.
- Staff (consultant, dermatologist, admin) can SELECT any user's rows, for
  dashboard review, via the same `profiles.role IN (...)` check already used
  everywhere else in this schema. No new/duplicate permission mechanism.
- No UPDATE policy — score history rows are immutable, append-only records
  (same convention as `adaptive_updates`).
*/

-- ============ SKIN_HEALTH_SCORES TABLE ============
CREATE TABLE IF NOT EXISTS skin_health_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  assessment_id uuid REFERENCES skin_assessments(id) ON DELETE SET NULL,
  skin_condition_score integer CHECK (skin_condition_score BETWEEN 0 AND 100),
  lifestyle_score integer CHECK (lifestyle_score BETWEEN 0 AND 100),
  sleep_score integer CHECK (sleep_score BETWEEN 0 AND 100),
  routine_consistency_score integer CHECK (routine_consistency_score BETWEEN 0 AND 100),
  hydration_score integer CHECK (hydration_score BETWEEN 0 AND 100),
  overall_score integer NOT NULL CHECK (overall_score BETWEEN 0 AND 100),
  score_date timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE skin_health_scores ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_skin_health_scores_user_id ON skin_health_scores(user_id);
CREATE INDEX IF NOT EXISTS idx_skin_health_scores_user_date ON skin_health_scores(user_id, score_date DESC);
CREATE INDEX IF NOT EXISTS idx_skin_health_scores_assessment ON skin_health_scores(assessment_id);

DROP POLICY IF EXISTS "select_own_or_staff_skin_health_scores" ON skin_health_scores;
CREATE POLICY "select_own_or_staff_skin_health_scores" ON skin_health_scores FOR SELECT
  TO authenticated USING (
    auth.uid() = user_id OR EXISTS (
      SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('consultant', 'dermatologist', 'admin')
    )
  );

DROP POLICY IF EXISTS "insert_own_skin_health_scores" ON skin_health_scores;
CREATE POLICY "insert_own_skin_health_scores" ON skin_health_scores FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_skin_health_scores" ON skin_health_scores;
CREATE POLICY "delete_own_skin_health_scores" ON skin_health_scores FOR DELETE
  TO authenticated USING (auth.uid() = user_id);
