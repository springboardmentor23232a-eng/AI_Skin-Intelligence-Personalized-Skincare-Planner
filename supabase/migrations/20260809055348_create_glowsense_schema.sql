/*
# GlowSense AI - Complete Database Schema

## Overview
Creates the full database schema for the GlowSense AI skin intelligence platform.

## New Tables
1. `profiles` - Extends auth.users with name, role, provider, status fields
2. `user_profiles` - Detailed user profile (age, gender, skin type, lifestyle, skincare routine)
3. `skin_assessments` - Skin assessment records with score, type, risk level, method
4. `assessment_concerns` - Individual concerns detected per assessment (acne, dryness, etc.)
5. `assessment_risks` - Risk factors identified per assessment (sun exposure, stress, etc.)
6. `recommendations` - Personalized skincare recommendations per assessment
7. `consultation_requests` - User requests for consultation with consultants/dermatologists
8. `consultations` - Consultation records with notes and status

## Security (RLS)
- Users can only access their own profile, assessments, concerns, risks, recommendations
- Consultants, dermatologists, and admins can read all assessments and user data (for review)
- Only users can create assessments and consultation requests
- Only consultants/derms/admins can update consultation statuses
- All tables have RLS enabled with role-aware policies

## Notes
- Uses auth.users (Supabase built-in auth) for authentication
- profiles.id references auth.users.id
- All assessment-related tables cascade delete with their parent assessment
- Role hierarchy: user < consultant < dermatologist < admin
*/

-- ============ PROFILES TABLE ============
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  role text NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'consultant', 'dermatologist', 'admin')),
  provider text NOT NULL DEFAULT 'email',
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_or_staff_profile" ON profiles;
CREATE POLICY "select_own_or_staff_profile" ON profiles FOR SELECT
  TO authenticated USING (
    auth.uid() = id OR EXISTS (
      SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('consultant', 'dermatologist', 'admin')
    )
  );

DROP POLICY IF EXISTS "update_own_profile" ON profiles;
CREATE POLICY "update_own_profile" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "insert_own_profile" ON profiles;
CREATE POLICY "insert_own_profile" ON profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);

-- ============ USER_PROFILES TABLE ============
CREATE TABLE IF NOT EXISTS user_profiles (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  age integer,
  gender text,
  skin_type text,
  skin_sensitivity text,
  water_intake text,
  sleep_duration text,
  stress_level text,
  exercise_frequency text,
  smoking text,
  alcohol text,
  cleanser_usage text,
  moisturizer_usage text,
  sunscreen_usage text,
  skincare_routine text,
  sun_exposure text,
  pollution_exposure text,
  climate text,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_or_staff_userprofile" ON user_profiles;
CREATE POLICY "select_own_or_staff_userprofile" ON user_profiles FOR SELECT
  TO authenticated USING (
    auth.uid() = user_id OR EXISTS (
      SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('consultant', 'dermatologist', 'admin')
    )
  );

DROP POLICY IF EXISTS "update_own_userprofile" ON user_profiles;
CREATE POLICY "update_own_userprofile" ON user_profiles FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_userprofile" ON user_profiles;
CREATE POLICY "insert_own_userprofile" ON user_profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

-- ============ SKIN_ASSESSMENTS TABLE ============
CREATE TABLE IF NOT EXISTS skin_assessments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  assessment_date timestamptz DEFAULT now(),
  method text NOT NULL DEFAULT 'form' CHECK (method IN ('form', 'webcam')),
  skin_health_score integer,
  skin_type text,
  risk_level text CHECK (risk_level IN ('Low', 'Moderate', 'High', 'Very High')),
  form_data jsonb,
  status text NOT NULL DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'reviewed')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE skin_assessments ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_assessments_user_id ON skin_assessments(user_id);
CREATE INDEX IF NOT EXISTS idx_assessments_date ON skin_assessments(assessment_date);
CREATE INDEX IF NOT EXISTS idx_assessments_risk ON skin_assessments(risk_level);

DROP POLICY IF EXISTS "select_own_or_staff_assessment" ON skin_assessments;
CREATE POLICY "select_own_or_staff_assessment" ON skin_assessments FOR SELECT
  TO authenticated USING (
    auth.uid() = user_id OR EXISTS (
      SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('consultant', 'dermatologist', 'admin')
    )
  );

DROP POLICY IF EXISTS "insert_own_assessment" ON skin_assessments;
CREATE POLICY "insert_own_assessment" ON skin_assessments FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_assessment" ON skin_assessments;
CREATE POLICY "update_own_assessment" ON skin_assessments FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_assessment" ON skin_assessments;
CREATE POLICY "delete_own_assessment" ON skin_assessments FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ============ ASSESSMENT_CONCERNS TABLE ============
CREATE TABLE IF NOT EXISTS assessment_concerns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id uuid NOT NULL REFERENCES skin_assessments(id) ON DELETE CASCADE,
  concern_name text NOT NULL,
  severity text NOT NULL CHECK (severity IN ('Low', 'Moderate', 'High', 'Severe')),
  priority text NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  explanation text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE assessment_concerns ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_concerns_assessment ON assessment_concerns(assessment_id);

DROP POLICY IF EXISTS "select_own_or_staff_concerns" ON assessment_concerns;
CREATE POLICY "select_own_or_staff_concerns" ON assessment_concerns FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM skin_assessments sa WHERE sa.id = assessment_concerns.assessment_id AND sa.user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('consultant', 'dermatologist', 'admin'))
  );

DROP POLICY IF EXISTS "insert_own_concerns" ON assessment_concerns;
CREATE POLICY "insert_own_concerns" ON assessment_concerns FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM skin_assessments sa WHERE sa.id = assessment_concerns.assessment_id AND sa.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "delete_own_concerns" ON assessment_concerns;
CREATE POLICY "delete_own_concerns" ON assessment_concerns FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM skin_assessments sa WHERE sa.id = assessment_concerns.assessment_id AND sa.user_id = auth.uid())
  );

-- ============ ASSESSMENT_RISKS TABLE ============
CREATE TABLE IF NOT EXISTS assessment_risks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id uuid NOT NULL REFERENCES skin_assessments(id) ON DELETE CASCADE,
  risk_name text NOT NULL,
  severity text NOT NULL CHECK (severity IN ('Low', 'Moderate', 'High', 'Severe')),
  explanation text,
  preventive_action text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE assessment_risks ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_risks_assessment ON assessment_risks(assessment_id);

DROP POLICY IF EXISTS "select_own_or_staff_risks" ON assessment_risks;
CREATE POLICY "select_own_or_staff_risks" ON assessment_risks FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM skin_assessments sa WHERE sa.id = assessment_risks.assessment_id AND sa.user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('consultant', 'dermatologist', 'admin'))
  );

DROP POLICY IF EXISTS "insert_own_risks" ON assessment_risks;
CREATE POLICY "insert_own_risks" ON assessment_risks FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM skin_assessments sa WHERE sa.id = assessment_risks.assessment_id AND sa.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "delete_own_risks" ON assessment_risks;
CREATE POLICY "delete_own_risks" ON assessment_risks FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM skin_assessments sa WHERE sa.id = assessment_risks.assessment_id AND sa.user_id = auth.uid())
  );

-- ============ RECOMMENDATIONS TABLE ============
CREATE TABLE IF NOT EXISTS recommendations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id uuid NOT NULL REFERENCES skin_assessments(id) ON DELETE CASCADE,
  category text NOT NULL,
  recommendation_text text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE recommendations ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_recs_assessment ON recommendations(assessment_id);

DROP POLICY IF EXISTS "select_own_or_staff_recs" ON recommendations;
CREATE POLICY "select_own_or_staff_recs" ON recommendations FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM skin_assessments sa WHERE sa.id = recommendations.assessment_id AND sa.user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('consultant', 'dermatologist', 'admin'))
  );

DROP POLICY IF EXISTS "insert_own_recs" ON recommendations;
CREATE POLICY "insert_own_recs" ON recommendations FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM skin_assessments sa WHERE sa.id = recommendations.assessment_id AND sa.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "delete_own_recs" ON recommendations;
CREATE POLICY "delete_own_recs" ON recommendations FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM skin_assessments sa WHERE sa.id = recommendations.assessment_id AND sa.user_id = auth.uid())
  );

-- ============ CONSULTATION_REQUESTS TABLE ============
CREATE TABLE IF NOT EXISTS consultation_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  requested_role text NOT NULL DEFAULT 'consultant' CHECK (requested_role IN ('consultant', 'dermatologist')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'completed', 'cancelled')),
  priority text NOT NULL DEFAULT 'normal' CHECK (priority IN ('normal', 'urgent')),
  message text,
  handled_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE consultation_requests ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_consult_req_user ON consultation_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_consult_req_status ON consultation_requests(status);

DROP POLICY IF EXISTS "select_own_or_staff_consultreq" ON consultation_requests;
CREATE POLICY "select_own_or_staff_consultreq" ON consultation_requests FOR SELECT
  TO authenticated USING (
    auth.uid() = user_id OR EXISTS (
      SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('consultant', 'dermatologist', 'admin')
    )
  );

DROP POLICY IF EXISTS "insert_own_consultreq" ON consultation_requests;
CREATE POLICY "insert_own_consultreq" ON consultation_requests FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_staff_consultreq" ON consultation_requests;
CREATE POLICY "update_staff_consultreq" ON consultation_requests FOR UPDATE
  TO authenticated USING (
    auth.uid() = user_id OR EXISTS (
      SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('consultant', 'dermatologist', 'admin')
    )
  ) WITH CHECK (
    auth.uid() = user_id OR EXISTS (
      SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('consultant', 'dermatologist', 'admin')
    )
  );

-- ============ CONSULTATIONS TABLE ============
CREATE TABLE IF NOT EXISTS consultations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid NOT NULL REFERENCES consultation_requests(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  consultant_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE consultations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_or_staff_consult" ON consultations;
CREATE POLICY "select_own_or_staff_consult" ON consultations FOR SELECT
  TO authenticated USING (
    auth.uid() = user_id OR auth.uid() = consultant_id OR EXISTS (
      SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "insert_staff_consult" ON consultations;
CREATE POLICY "insert_staff_consult" ON consultations FOR INSERT
  TO authenticated WITH CHECK (
    auth.uid() = consultant_id OR EXISTS (
      SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('consultant', 'dermatologist', 'admin')
    )
  );

DROP POLICY IF EXISTS "update_staff_consult" ON consultations;
CREATE POLICY "update_staff_consult" ON consultations FOR UPDATE
  TO authenticated USING (
    auth.uid() = consultant_id OR EXISTS (
      SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('consultant', 'dermatologist', 'admin')
    )
  ) WITH CHECK (
    auth.uid() = consultant_id OR EXISTS (
      SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('consultant', 'dermatologist', 'admin')
    )
  );

-- ============ TRIGGER: auto-create profile on signup ============
CREATE OR REPLACE FUNCTION handle_new_user() RETURNS trigger AS $$
BEGIN
  INSERT INTO profiles (id, name, role, provider)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)), 'user', 'email')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============ TRIGGER: update updated_at ============
CREATE OR REPLACE FUNCTION update_updated_at() RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS profiles_updated_at ON profiles;
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS user_profiles_updated_at ON user_profiles;
CREATE TRIGGER user_profiles_updated_at BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS consult_req_updated_at ON consultation_requests;
CREATE TRIGGER consult_req_updated_at BEFORE UPDATE ON consultation_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS consult_updated_at ON consultations;
CREATE TRIGGER consult_updated_at BEFORE UPDATE ON consultations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();