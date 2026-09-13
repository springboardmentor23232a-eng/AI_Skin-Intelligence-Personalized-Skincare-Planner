-- ============================================================
-- Comprehensive Activity History Schema
-- ============================================================

-- Update user_role enum to include dermatologist
-- Note: PostgreSQL doesn't support adding values to enums in transactions,
-- so this may need to be run separately if the type doesn't already include it

-- ============================================================
-- TABLE: ai_recommendations
-- ============================================================
CREATE TABLE IF NOT EXISTS ai_recommendations (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id             UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    recommendation_type VARCHAR(50) NOT NULL,  -- 'ingredient_analysis', 'product_recommendation', 'routine_suggestion'
    input_data          JSONB,                  -- user inputs that generated the recommendation
    ai_response         JSONB,                  -- full AI response including recommendations
    confidence_score    DECIMAL(3,2),           -- AI confidence level (0.00-1.00)
    applied             BOOLEAN     NOT NULL DEFAULT FALSE,
    feedback            TEXT,                   -- user feedback on the recommendation
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE: routine_tracking
-- ============================================================
CREATE TABLE IF NOT EXISTS routine_tracking (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id             UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    routine_type        VARCHAR(20) NOT NULL,  -- 'morning', 'evening', 'weekly'
    routine_name        VARCHAR(100),
    steps               JSONB,                  -- array of {step_id, product, instruction, completed, completed_at}
    completion_status   VARCHAR(20) NOT NULL,  -- 'not_started', 'in_progress', 'completed', 'skipped'
    completion_percentage INTEGER,              -- 0-100
    duration_minutes    INTEGER,               -- how long the routine took
    notes               TEXT,
    performed_date      DATE        NOT NULL DEFAULT CURRENT_DATE,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE: comprehensive_activity_log
-- ============================================================
CREATE TABLE IF NOT EXISTS comprehensive_activity_log (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id             UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    activity_type       VARCHAR(50) NOT NULL,  -- 'skin_assessment', 'profile_update', 'ai_recommendation', 'routine_completion', 'product_search', 'report_view', 'care_team_share'
    activity_subtype    VARCHAR(50),             -- more specific activity (e.g., 'morning_routine', 'ingredient_analysis')
    activity_data       JSONB,                  -- relevant data for the activity
    source_page         VARCHAR(100),           -- which page the activity came from
    api_endpoint        VARCHAR(200),           -- which API endpoint was called
    method              VARCHAR(10),             -- HTTP method
    status_code         INTEGER,                -- HTTP response status
    success             BOOLEAN     NOT NULL DEFAULT TRUE,
    error_message       TEXT,
    session_id          VARCHAR(100),            -- browser session identifier
    ip_address          INET,
    user_agent          TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE: user_reports
-- ============================================================
CREATE TABLE IF NOT EXISTS user_reports (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id             UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    report_type         VARCHAR(50) NOT NULL,  -- 'comprehensive', 'progress', 'routine_adherence', 'skin_health'
    report_data         JSONB,                  -- full report data
    report_period_start DATE,
    report_period_end   DATE,
    generated_for       VARCHAR(50),            -- 'user', 'consultant', 'dermatologist'
    generated_by        UUID        REFERENCES users(id),  -- who generated the report
    is_shared           BOOLEAN     NOT NULL DEFAULT FALSE,
    shared_with         UUID[],    -- array of user IDs this report is shared with (no FK constraint on arrays)
    version             INTEGER     NOT NULL DEFAULT 1,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- INDEXES for performance
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_ai_recommendations_user_id ON ai_recommendations(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_recommendations_type ON ai_recommendations(recommendation_type);
CREATE INDEX IF NOT EXISTS idx_ai_recommendations_created_at ON ai_recommendations(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_routine_tracking_user_id ON routine_tracking(user_id);
CREATE INDEX IF NOT EXISTS idx_routine_tracking_type ON routine_tracking(routine_type);
CREATE INDEX IF NOT EXISTS idx_routine_tracking_date ON routine_tracking(performed_date DESC);

CREATE INDEX IF NOT EXISTS idx_comprehensive_activity_user_id ON comprehensive_activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_comprehensive_activity_type ON comprehensive_activity_log(activity_type);
CREATE INDEX IF NOT EXISTS idx_comprehensive_activity_created_at ON comprehensive_activity_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comprehensive_activity_source ON comprehensive_activity_log(source_page);

CREATE INDEX IF NOT EXISTS idx_user_reports_user_id ON user_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_user_reports_type ON user_reports(report_type);
CREATE INDEX IF NOT EXISTS idx_user_reports_created_at ON user_reports(created_at DESC);