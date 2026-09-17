/*
# Module 8 — Progress Tracking & Analytics: Routine Completion Persistence

## Overview
Adds the single new table Module 8 requires: `routine_completions`, used to
persist the daily skincare checklist (morning/evening routine steps marked
done) so it survives a page refresh and can drive adherence-percentage and
adherence-trend calculations.

Progress monitoring, improvement analysis, before/after comparison, and
skin-health/concern trend charts are intentionally NOT backed by a new
table — they are computed on read from the existing `skin_assessments`,
`assessment_concerns`, and `skin_health_scores` tables, per product
decision, to avoid duplicating data that already exists.

## New Tables

1. `routine_completions` — One row per user per routine step per calendar
   day. Routine steps live as JSONB array items inside `routines.morning_routine`
   / `routines.evening_routine` and have no stable id of their own, so a
   completion is identified by (user_id, routine_id, period, step_index,
   completion_date). `step_label` is a denormalized snapshot of the step's
   display name at the time it was checked off, so history stays readable
   even if the routine is later regenerated and step_index shifts.

## Security (RLS)
- RLS enabled.
- Users can select/insert/update/delete only their own completion rows.
- Consultant, dermatologist, and admin roles can read (not write) any
  user's completions, matching the read-only staff access pattern already
  used for `routines` and `routine_feedback`.

## Notes
- `user_id` defaults to `auth.uid()` so inserts that omit it still satisfy RLS.
- Unique constraint prevents duplicate rows for the same step/day (upsert-safe).
- Indexes added for the query patterns Module 8 needs: by user+date range,
  and by routine.
*/

-- ============ ROUTINE_COMPLETIONS TABLE ============
CREATE TABLE IF NOT EXISTS routine_completions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  routine_id uuid NOT NULL REFERENCES routines(id) ON DELETE CASCADE,
  period text NOT NULL CHECK (period IN ('morning', 'evening')),
  step_index integer NOT NULL CHECK (step_index >= 0),
  step_label text,
  completion_date date NOT NULL DEFAULT CURRENT_DATE,
  completed boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (user_id, routine_id, period, step_index, completion_date)
);

ALTER TABLE routine_completions ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_routine_completions_user_date
  ON routine_completions(user_id, completion_date);
CREATE INDEX IF NOT EXISTS idx_routine_completions_routine_id
  ON routine_completions(routine_id);

DROP POLICY IF EXISTS "select_own_or_staff_routine_completions" ON routine_completions;
CREATE POLICY "select_own_or_staff_routine_completions" ON routine_completions FOR SELECT
  TO authenticated USING (
    auth.uid() = user_id OR EXISTS (
      SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('consultant', 'dermatologist', 'admin')
    )
  );

DROP POLICY IF EXISTS "insert_own_routine_completions" ON routine_completions;
CREATE POLICY "insert_own_routine_completions" ON routine_completions FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_routine_completions" ON routine_completions;
CREATE POLICY "update_own_routine_completions" ON routine_completions FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_routine_completions" ON routine_completions;
CREATE POLICY "delete_own_routine_completions" ON routine_completions FOR DELETE
  TO authenticated USING (auth.uid() = user_id);
