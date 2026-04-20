-- ============================================================
-- KINTIFY INTEGRATIONS SYSTEM
-- Database schema for Slack, Webhooks, GitHub, and more
-- ============================================================

-- Integrations table - stores connected integrations per team/user
CREATE TABLE IF NOT EXISTS integrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT NOT NULL CHECK (type IN ('slack', 'github', 'webhook', 'datadog', 'cloudflare', 'pagerduty')),
    name TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('connected', 'disconnected', 'error', 'pending')),
    
    -- Team/organization scoping (null = personal)
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
    
    -- Audit
    created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    -- Settings (masked sensitive values stored here)
    settings JSONB NOT NULL DEFAULT '{}'::jsonb,
    
    -- Team can only have one active integration per type
    UNIQUE (team_id, type)
);

-- Integration events - audit log for all integration activity
CREATE TABLE IF NOT EXISTS integration_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    integration_id UUID NOT NULL REFERENCES integrations(id) ON DELETE CASCADE,
    
    -- Event type
    type TEXT NOT NULL CHECK (type IN ('trigger', 'response', 'error', 'push')),
    
    -- Payload and results
    payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    result JSONB,
    error TEXT,
    
    -- Audit
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Webhook tokens - for secure webhook URL validation
CREATE TABLE IF NOT EXISTS webhook_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    integration_id UUID NOT NULL REFERENCES integrations(id) ON DELETE CASCADE,
    
    -- Token hash for validation (actual token shown once on creation)
    token_hash TEXT NOT NULL,
    
    -- Optional name/label for the token
    name TEXT,
    
    -- Expiration
    expires_at TIMESTAMPTZ,
    
    -- Audit
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    last_used_at TIMESTAMPTZ,
    
    -- Soft delete
    revoked_at TIMESTAMPTZ
);

-- API keys - for programmatic access to /api/fix
CREATE TABLE IF NOT EXISTS api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Owner scoping
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
    
    -- Key metadata
    name TEXT NOT NULL,
    key_hash TEXT NOT NULL UNIQUE,
    
    -- Rate limiting (requests per hour)
    rate_limit INTEGER NOT NULL DEFAULT 100,
    
    -- Scopes
    scopes TEXT[] NOT NULL DEFAULT ARRAY['fix:read'],
    
    -- Expiration
    expires_at TIMESTAMPTZ,
    
    -- Audit
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    last_used_at TIMESTAMPTZ,
    
    -- Soft delete
    revoked_at TIMESTAMPTZ
);

-- Auto-trigger rules - for incident auto-trigger from webhooks
CREATE TABLE IF NOT EXISTS auto_trigger_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    integration_id UUID NOT NULL REFERENCES integrations(id) ON DELETE CASCADE,
    
    -- Rule configuration
    name TEXT NOT NULL,
    
    -- Conditions
    source_filter TEXT, -- 'datadog', 'cloudflare', 'generic' or NULL for all
    severity_filter TEXT[], -- ['critical', 'error'] or NULL for all
    
    -- Threshold conditions
    min_error_count INTEGER,
    min_latency_ms INTEGER,
    
    -- Pattern matching on message
    message_pattern TEXT, -- regex pattern
    
    -- Actions
    auto_fix_enabled BOOLEAN NOT NULL DEFAULT false,
    notify_channels TEXT[], -- Slack channel IDs to notify
    
    -- Audit
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
);

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_integrations_team ON integrations(team_id);
CREATE INDEX IF NOT EXISTS idx_integrations_org ON integrations(organization_id);
CREATE INDEX IF NOT EXISTS idx_integrations_type_status ON integrations(type, status);
CREATE INDEX IF NOT EXISTS idx_integrations_created_by ON integrations(created_by);

CREATE INDEX IF NOT EXISTS idx_integration_events_integration ON integration_events(integration_id);
CREATE INDEX IF NOT EXISTS idx_integration_events_created ON integration_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_integration_events_type ON integration_events(type);

CREATE INDEX IF NOT EXISTS idx_webhook_tokens_integration ON webhook_tokens(integration_id);
CREATE INDEX IF NOT EXISTS idx_webhook_tokens_hash ON webhook_tokens(token_hash);

CREATE INDEX IF NOT EXISTS idx_api_keys_user ON api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_team ON api_keys(team_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_hash ON api_keys(key_hash);

CREATE INDEX IF NOT EXISTS idx_auto_trigger_rules_integration ON auto_trigger_rules(integration_id);

-- ============================================================
-- RLS POLICIES
-- ============================================================

ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE integration_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE auto_trigger_rules ENABLE ROW LEVEL SECURITY;

-- integrations: Users can see their personal integrations and team integrations they're members of
CREATE POLICY integrations_select ON integrations
    FOR SELECT
    USING (
        created_by = auth.uid()
        OR team_id IN (
            SELECT team_id FROM team_members WHERE user_id = auth.uid()
        )
    );

CREATE POLICY integrations_insert ON integrations
    FOR INSERT
    WITH CHECK (
        created_by = auth.uid()
        AND (
            team_id IS NULL
            OR team_id IN (
                SELECT team_id FROM team_members 
                WHERE user_id = auth.uid() AND role = 'owner'
            )
        )
    );

CREATE POLICY integrations_update ON integrations
    FOR UPDATE
    USING (
        created_by = auth.uid()
        OR team_id IN (
            SELECT team_id FROM team_members 
            WHERE user_id = auth.uid() AND role = 'owner'
        )
    );

CREATE POLICY integrations_delete ON integrations
    FOR DELETE
    USING (
        created_by = auth.uid()
        OR team_id IN (
            SELECT team_id FROM team_members 
            WHERE user_id = auth.uid() AND role = 'owner'
        )
    );

-- integration_events: Same access as parent integration
CREATE POLICY integration_events_select ON integration_events
    FOR SELECT
    USING (
        integration_id IN (
            SELECT id FROM integrations WHERE 
                created_by = auth.uid()
                OR team_id IN (
                    SELECT team_id FROM team_members WHERE user_id = auth.uid()
                )
        )
    );

-- webhook_tokens: Same access as parent integration
CREATE POLICY webhook_tokens_select ON webhook_tokens
    FOR SELECT
    USING (
        integration_id IN (
            SELECT id FROM integrations WHERE 
                created_by = auth.uid()
                OR team_id IN (
                    SELECT team_id FROM team_members WHERE user_id = auth.uid()
                )
        )
    );

-- api_keys: Users can manage their own API keys
CREATE POLICY api_keys_select ON api_keys
    FOR SELECT
    USING (
        user_id = auth.uid()
        OR team_id IN (
            SELECT team_id FROM team_members WHERE user_id = auth.uid()
        )
    );

CREATE POLICY api_keys_insert ON api_keys
    FOR INSERT
    WITH CHECK (user_id = auth.uid());

CREATE POLICY api_keys_update ON api_keys
    FOR UPDATE
    USING (user_id = auth.uid());

CREATE POLICY api_keys_delete ON api_keys
    FOR DELETE
    USING (user_id = auth.uid());

-- auto_trigger_rules: Same access as parent integration
CREATE POLICY auto_trigger_rules_select ON auto_trigger_rules
    FOR SELECT
    USING (
        integration_id IN (
            SELECT id FROM integrations WHERE 
                created_by = auth.uid()
                OR team_id IN (
                    SELECT team_id FROM team_members WHERE user_id = auth.uid()
                )
        )
    );

-- ============================================================
-- FUNCTIONS
-- ============================================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_integrations_updated_at ON integrations;
CREATE TRIGGER update_integrations_updated_at
    BEFORE UPDATE ON integrations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_auto_trigger_rules_updated_at ON auto_trigger_rules;
CREATE TRIGGER update_auto_trigger_rules_updated_at
    BEFORE UPDATE ON auto_trigger_rules
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function to clean up expired webhook tokens
CREATE OR REPLACE FUNCTION cleanup_expired_webhook_tokens()
RETURNS void AS $$
BEGIN
    UPDATE webhook_tokens 
    SET revoked_at = now()
    WHERE expires_at < now() 
      AND revoked_at IS NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
