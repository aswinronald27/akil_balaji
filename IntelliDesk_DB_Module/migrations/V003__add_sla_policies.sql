-- =============================================================================
-- IntelliDesk – Migration V003: Add SLA Policies Table
-- Adds configurable SLA thresholds per severity.
-- =============================================================================
BEGIN;

DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM schema_migrations WHERE version = 'V003') THEN
        RAISE NOTICE 'Migration V003 already applied. Skipping.';
        RETURN;
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS sla_policies (
    id                      UUID               DEFAULT uuid_generate_v4() PRIMARY KEY,
    severity                incident_severity  NOT NULL UNIQUE,
    response_time_minutes   INTEGER            NOT NULL,  -- Time to acknowledge
    resolution_time_minutes INTEGER            NOT NULL,  -- Time to resolve
    escalation_minutes      INTEGER            NOT NULL,  -- Time before escalation alert
    is_active               BOOLEAN            NOT NULL DEFAULT TRUE,
    created_at              TIMESTAMPTZ        NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ        NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE sla_policies IS 'SLA thresholds per incident severity for deadline calculation.';

CREATE TRIGGER trg_sla_policies_updated_at
BEFORE UPDATE ON sla_policies
FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

-- Seed default SLA values (industry standard ITIL-aligned)
INSERT INTO sla_policies (severity, response_time_minutes, resolution_time_minutes, escalation_minutes)
VALUES
    ('critical', 15,   240,  60),   -- 15 min response, 4 hr resolution
    ('high',     30,   480,  120),  -- 30 min response, 8 hr resolution
    ('medium',   120,  1440, 480),  -- 2 hr response, 24 hr resolution
    ('low',      480,  5760, 1440)  -- 8 hr response, 4 day resolution
ON CONFLICT (severity) DO NOTHING;

INSERT INTO schema_migrations (version, description)
VALUES ('V003', 'Add sla_policies table with default ITIL-aligned thresholds')
ON CONFLICT (version) DO NOTHING;

COMMIT;
