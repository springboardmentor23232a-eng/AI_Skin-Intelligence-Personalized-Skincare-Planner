CREATE TABLE IF NOT EXISTS care_team_shares (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    professional_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    access_level VARCHAR(20) NOT NULL DEFAULT 'read',
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    granted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    revoked_at TIMESTAMPTZ,
    UNIQUE (user_id, professional_id)
);

CREATE INDEX IF NOT EXISTS idx_care_team_shares_professional
    ON care_team_shares(professional_id, status);
