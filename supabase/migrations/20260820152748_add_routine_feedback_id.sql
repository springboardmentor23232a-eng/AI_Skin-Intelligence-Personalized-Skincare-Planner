ALTER TABLE routines ADD COLUMN IF NOT EXISTS feedback_id uuid REFERENCES routine_feedback(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_routines_feedback_id ON routines(feedback_id);