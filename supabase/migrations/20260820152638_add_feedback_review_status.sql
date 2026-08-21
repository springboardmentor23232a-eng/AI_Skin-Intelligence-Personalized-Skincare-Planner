-- Add review_status column to routine_feedback for dermatologist review workflow
ALTER TABLE routine_feedback ADD COLUMN IF NOT EXISTS review_status text NOT NULL DEFAULT 'pending'
  CHECK (review_status IN ('pending', 'reviewed', 'needs_adjustment'));
ALTER TABLE routine_feedback ADD COLUMN IF NOT EXISTS dermatologist_notes text;
ALTER TABLE routine_feedback ADD COLUMN IF NOT EXISTS reviewed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE routine_feedback ADD COLUMN IF NOT EXISTS reviewed_at timestamptz;

-- Allow dermatologists to update review status
DROP POLICY IF EXISTS "update_review_status_derm" ON routine_feedback;
CREATE POLICY "update_review_status_derm" ON routine_feedback FOR UPDATE
  TO authenticated USING (
    auth.uid() = user_id OR EXISTS (
      SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('dermatologist', 'admin')
    )
  ) WITH CHECK (
    auth.uid() = user_id OR EXISTS (
      SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('dermatologist', 'admin')
    )
  );

CREATE INDEX IF NOT EXISTS idx_feedback_review_status ON routine_feedback(review_status);