-- Dashboard persistence for daily routine completion and analytics snapshots.
CREATE TABLE IF NOT EXISTS skincare_checklist (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    task_id VARCHAR(80) NOT NULL,
    completed_on DATE NOT NULL DEFAULT CURRENT_DATE,
    completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, task_id, completed_on)
);

CREATE INDEX IF NOT EXISTS idx_skincare_checklist_user_date
    ON skincare_checklist(user_id, completed_on);

CREATE TABLE IF NOT EXISTS skincare_recommendations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    recommendation_type VARCHAR(30) NOT NULL DEFAULT 'product',
    title VARCHAR(255) NOT NULL,
    rationale TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_skincare_recommendations_user
    ON skincare_recommendations(user_id, status);

ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'dermatologist';
