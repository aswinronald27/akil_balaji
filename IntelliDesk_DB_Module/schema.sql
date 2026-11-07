-- =============================================================================
-- IntelliDesk – Smart IT Incident Intelligence Platform
-- Master Schema File
-- Database: PostgreSQL 15+
-- Author:   IntelliDesk Database Team
-- Created:  2026-11-05
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 0. EXTENSIONS & SETTINGS
-- ---------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";       -- UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";         -- Password hashing
CREATE EXTENSION IF NOT EXISTS "pg_trgm";          -- Trigram indexes for full-text search
CREATE EXTENSION IF NOT EXISTS "btree_gin";        -- GIN indexes on scalar types

-- ---------------------------------------------------------------------------
-- 1. ENUM TYPES
-- ---------------------------------------------------------------------------

-- User roles within the platform
CREATE TYPE user_role AS ENUM (
    'admin',           -- Full platform access
    'analyst',         -- Can manage and resolve incidents
    'engineer',        -- Can update status and add notes
    'viewer'           -- Read-only access
);

-- Lifecycle states of an incident
CREATE TYPE incident_status AS ENUM (
    'open',
    'in_progress',
    'pending_review',
    'resolved',
    'closed',
    'reopened'
);

-- How severe the incident is
CREATE TYPE incident_severity AS ENUM (
    'critical',    -- P1 – Immediate action required
    'high',        -- P2 – Urgent
    'medium',      -- P3 – Normal priority
    'low'          -- P4 – Informational
);

-- Category of the IT incident
CREATE TYPE incident_category AS ENUM (
    'network',
    'server',
    'application',
    'database',
    'security',
    'storage',
    'performance',
    'hardware',
    'other'
);

-- Processing state of an uploaded log file
CREATE TYPE log_status AS ENUM (
    'uploaded',
    'processing',
    'processed',
    'failed'
);

-- Relationship type between two incidents
CREATE TYPE relationship_type AS ENUM (
    'duplicate',
    'related',
    'caused_by',
    'blocked_by',
    'merged_into'
);

-- Confidence level of an AI recommendation
CREATE TYPE confidence_level AS ENUM (
    'very_high',   -- >= 90 %
    'high',        -- >= 75 %
    'medium',      -- >= 50 %
    'low'          -- <  50 %
);

-- ---------------------------------------------------------------------------
-- 2. USERS
-- ---------------------------------------------------------------------------
CREATE TABLE users (
    id                  UUID            DEFAULT uuid_generate_v4() PRIMARY KEY,
    username            VARCHAR(80)     NOT NULL UNIQUE,
    email               VARCHAR(255)    NOT NULL UNIQUE,
    password_hash       TEXT            NOT NULL,                 -- bcrypt / argon2 hash
    full_name           VARCHAR(200)    NOT NULL,
    role                user_role       NOT NULL DEFAULT 'viewer',
    department          VARCHAR(100),
    phone               VARCHAR(30),
    avatar_url          TEXT,
    is_active           BOOLEAN         NOT NULL DEFAULT TRUE,
    is_email_verified   BOOLEAN         NOT NULL DEFAULT FALSE,
    last_login_at       TIMESTAMPTZ,
    created_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  users IS 'Platform users who can create, manage, and resolve IT incidents.';
COMMENT ON COLUMN users.password_hash IS 'Never store plain-text passwords. Use bcrypt (cost ≥ 12) or argon2id.';
COMMENT ON COLUMN users.role IS 'Controls feature access across the platform.';

-- ---------------------------------------------------------------------------
-- 3. INCIDENTS
-- ---------------------------------------------------------------------------
CREATE TABLE incidents (
    id                  UUID            DEFAULT uuid_generate_v4() PRIMARY KEY,
    incident_number     VARCHAR(20)     NOT NULL UNIQUE,          -- Human-readable: INC-20260001
    title               VARCHAR(500)    NOT NULL,
    description         TEXT            NOT NULL,
    status              incident_status NOT NULL DEFAULT 'open',
    severity            incident_severity NOT NULL DEFAULT 'medium',
    category            incident_category NOT NULL DEFAULT 'other',
    affected_system     VARCHAR(300),                              -- e.g. "Payment Gateway v3.2"
    affected_component  VARCHAR(300),                              -- e.g. "API server / Load Balancer"
    environment         VARCHAR(50)     DEFAULT 'production',      -- production / staging / dev
    tags                TEXT[]          DEFAULT '{}',              -- Free-form labels
    reported_by         UUID            NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    assigned_to         UUID            REFERENCES users(id) ON DELETE SET NULL,
    resolved_by         UUID            REFERENCES users(id) ON DELETE SET NULL,
    -- Time tracking
    reported_at         TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    acknowledged_at     TIMESTAMPTZ,
    resolved_at         TIMESTAMPTZ,
    closed_at           TIMESTAMPTZ,
    sla_due_at          TIMESTAMPTZ,                              -- SLA deadline
    -- Metrics
    downtime_minutes    INTEGER         DEFAULT 0 CHECK (downtime_minutes >= 0),
    affected_users      INTEGER         DEFAULT 0 CHECK (affected_users >= 0),
    -- Audit
    created_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  incidents IS 'Core incident records for all IT issues tracked in IntelliDesk.';
COMMENT ON COLUMN incidents.incident_number IS 'Human-readable identifier generated by application layer.';
COMMENT ON COLUMN incidents.tags IS 'Array of free-form labels for quick filtering (e.g. {kubernetes, timeout}).';
COMMENT ON COLUMN incidents.sla_due_at IS 'Deadline computed from severity SLA policy at creation time.';

-- ---------------------------------------------------------------------------
-- 4. UPLOADED LOGS
-- ---------------------------------------------------------------------------
CREATE TABLE uploaded_logs (
    id                  UUID            DEFAULT uuid_generate_v4() PRIMARY KEY,
    incident_id         UUID            NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
    uploaded_by         UUID            NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    -- File metadata
    original_filename   VARCHAR(500)    NOT NULL,
    stored_filename     VARCHAR(500)    NOT NULL UNIQUE,           -- UUID-renamed file on disk / object store
    file_path           TEXT            NOT NULL,                  -- S3 key or filesystem path
    file_size_bytes     BIGINT          NOT NULL CHECK (file_size_bytes > 0),
    mime_type           VARCHAR(100)    NOT NULL DEFAULT 'text/plain',
    checksum_sha256     CHAR(64),                                  -- Integrity verification
    -- Processing
    status              log_status      NOT NULL DEFAULT 'uploaded',
    parsed_summary      TEXT,                                      -- Short AI-extracted summary
    error_patterns      JSONB           DEFAULT '[]',              -- Extracted error codes / patterns
    keyword_hits        TEXT[]          DEFAULT '{}',              -- Matched keywords for search
    processing_error    TEXT,                                      -- Populated when status = 'failed'
    processed_at        TIMESTAMPTZ,
    -- Audit
    created_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  uploaded_logs IS 'Log files and attachments uploaded against incidents for AI analysis.';
COMMENT ON COLUMN uploaded_logs.error_patterns IS 'JSON array of {pattern, count, severity} objects extracted by parser.';
COMMENT ON COLUMN uploaded_logs.keyword_hits IS 'Keywords matched during log analysis for incident correlation.';

-- ---------------------------------------------------------------------------
-- 5. HISTORICAL INCIDENTS
-- ---------------------------------------------------------------------------
CREATE TABLE historical_incidents (
    id                      UUID            DEFAULT uuid_generate_v4() PRIMARY KEY,
    source_incident_id      UUID            REFERENCES incidents(id) ON DELETE SET NULL,
    incident_number         VARCHAR(20)     NOT NULL,              -- Preserved even if source deleted
    title                   VARCHAR(500)    NOT NULL,
    description             TEXT            NOT NULL,
    root_cause              TEXT,
    resolution_summary      TEXT,
    -- Classification (denormalized for archival fidelity)
    severity                incident_severity NOT NULL,
    category                incident_category NOT NULL,
    affected_system         VARCHAR(300),
    affected_component      VARCHAR(300),
    environment             VARCHAR(50),
    tags                    TEXT[]          DEFAULT '{}',
    -- Time metrics
    reported_at             TIMESTAMPTZ     NOT NULL,
    resolved_at             TIMESTAMPTZ,
    resolution_time_minutes INTEGER,                               -- TTR in minutes
    downtime_minutes        INTEGER         DEFAULT 0,
    affected_users          INTEGER         DEFAULT 0,
    -- AI training fields
    embedding_vector        TEXT,                                  -- Serialized sentence embedding for similarity
    similarity_hash         CHAR(64),                              -- MinHash / SimHash for fast dedup
    -- Archival
    archived_by             UUID            REFERENCES users(id) ON DELETE SET NULL,
    archived_at             TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    source_version          INTEGER         NOT NULL DEFAULT 1,    -- Schema version at archive time
    created_at              TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  historical_incidents IS 'Immutable archive of resolved incidents used for AI training and trend analysis.';
COMMENT ON COLUMN historical_incidents.embedding_vector IS 'Serialized float array for semantic similarity search (store in pgvector if available).';
COMMENT ON COLUMN historical_incidents.resolution_time_minutes IS 'Computed at archive time: resolved_at - reported_at.';

-- ---------------------------------------------------------------------------
-- 6. VERIFIED SOLUTIONS
-- ---------------------------------------------------------------------------
CREATE TABLE verified_solutions (
    id                  UUID            DEFAULT uuid_generate_v4() PRIMARY KEY,
    historical_id       UUID            REFERENCES historical_incidents(id) ON DELETE SET NULL,
    incident_id         UUID            REFERENCES incidents(id)   ON DELETE SET NULL,
    -- Content
    title               VARCHAR(500)    NOT NULL,
    problem_statement   TEXT            NOT NULL,
    root_cause          TEXT,
    solution_steps      JSONB           NOT NULL DEFAULT '[]',     -- Ordered array of step objects
    prerequisites       TEXT,
    post_actions        TEXT,
    -- Categorisation
    category            incident_category NOT NULL,
    severity            incident_severity NOT NULL,
    affected_systems    TEXT[]          DEFAULT '{}',
    tags                TEXT[]          DEFAULT '{}',
    -- Validation
    verified_by         UUID            NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    verified_at         TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    is_active           BOOLEAN         NOT NULL DEFAULT TRUE,     -- Soft-delete / deprecate
    success_rate        NUMERIC(5,2)    CHECK (success_rate BETWEEN 0 AND 100),
    times_applied       INTEGER         NOT NULL DEFAULT 0,
    times_succeeded     INTEGER         NOT NULL DEFAULT 0,
    -- Knowledge base
    kb_article_url      TEXT,
    related_runbook_url TEXT,
    -- Audit
    created_by          UUID            NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    created_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  verified_solutions IS 'Human-verified resolutions to incidents, forming the IntelliDesk knowledge base.';
COMMENT ON COLUMN verified_solutions.solution_steps IS 'JSON array of {step_number, action, expected_result, command?} objects.';
COMMENT ON COLUMN verified_solutions.success_rate IS 'Percentage: (times_succeeded / times_applied) * 100, updated by application layer.';

-- ---------------------------------------------------------------------------
-- 7. INCIDENT RELATIONSHIPS
-- ---------------------------------------------------------------------------
CREATE TABLE incident_relationships (
    id                  UUID            DEFAULT uuid_generate_v4() PRIMARY KEY,
    source_incident_id  UUID            NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
    target_incident_id  UUID            NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
    relationship_type   relationship_type NOT NULL,
    confidence_score    NUMERIC(5,2)    CHECK (confidence_score BETWEEN 0 AND 100),  -- AI confidence
    is_ai_generated     BOOLEAN         NOT NULL DEFAULT FALSE,    -- TRUE = AI suggested, FALSE = manual
    notes               TEXT,
    created_by          UUID            REFERENCES users(id) ON DELETE SET NULL,
    created_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    -- Prevent self-referencing and duplicate pairs
    CONSTRAINT chk_no_self_relationship CHECK (source_incident_id <> target_incident_id),
    CONSTRAINT uq_incident_relationship UNIQUE (source_incident_id, target_incident_id, relationship_type)
);

COMMENT ON TABLE  incident_relationships IS 'Directed graph edges connecting related incidents.';
COMMENT ON COLUMN incident_relationships.confidence_score IS 'AI-assigned confidence (0-100) when is_ai_generated = TRUE.';

-- ---------------------------------------------------------------------------
-- 8. AI RECOMMENDATIONS
-- ---------------------------------------------------------------------------
CREATE TABLE ai_recommendations (
    id                      UUID            DEFAULT uuid_generate_v4() PRIMARY KEY,
    incident_id             UUID            NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
    verified_solution_id    UUID            REFERENCES verified_solutions(id) ON DELETE SET NULL,
    historical_incident_id  UUID            REFERENCES historical_incidents(id) ON DELETE SET NULL,
    -- Recommendation content
    recommendation_title    VARCHAR(500)    NOT NULL,
    recommendation_text     TEXT            NOT NULL,
    suggested_actions       JSONB           NOT NULL DEFAULT '[]', -- Ordered action steps
    -- AI metadata
    model_name              VARCHAR(100)    NOT NULL,              -- e.g. "intellidesk-llm-v2"
    model_version           VARCHAR(50),
    confidence_score        NUMERIC(5,2)    NOT NULL CHECK (confidence_score BETWEEN 0 AND 100),
    confidence_level        confidence_level NOT NULL,
    similarity_score        NUMERIC(5,2)    CHECK (similarity_score BETWEEN 0 AND 100),  -- Match to historical
    reasoning               TEXT,                                  -- LLM chain-of-thought summary
    prompt_tokens           INTEGER,
    completion_tokens       INTEGER,
    -- Feedback loop
    was_applied             BOOLEAN         DEFAULT FALSE,
    was_helpful             BOOLEAN,                               -- NULL = not yet rated
    feedback_notes          TEXT,
    feedback_given_by       UUID            REFERENCES users(id)   ON DELETE SET NULL,
    feedback_at             TIMESTAMPTZ,
    -- Audit
    generated_at            TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    expires_at              TIMESTAMPTZ,                           -- Recommendation validity window
    created_at              TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  ai_recommendations IS 'AI-generated resolution suggestions for open incidents, linked to verified solutions and historical data.';
COMMENT ON COLUMN ai_recommendations.reasoning IS 'Human-readable explanation of why this recommendation was generated.';
COMMENT ON COLUMN ai_recommendations.was_helpful IS 'NULL = unrated, TRUE = helpful, FALSE = not helpful. Drives model retraining.';

-- ---------------------------------------------------------------------------
-- 9. INCIDENT COMMENTS (audit trail / discussion)
-- ---------------------------------------------------------------------------
CREATE TABLE incident_comments (
    id              UUID        DEFAULT uuid_generate_v4() PRIMARY KEY,
    incident_id     UUID        NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
    author_id       UUID        NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    body            TEXT        NOT NULL,
    is_internal     BOOLEAN     NOT NULL DEFAULT FALSE,   -- Internal notes vs. customer-facing
    parent_id       UUID        REFERENCES incident_comments(id) ON DELETE SET NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE incident_comments IS 'Threaded discussion and audit trail entries on incidents.';

-- =============================================================================
-- INDEXES
-- =============================================================================

-- ---- users ----
CREATE INDEX idx_users_email          ON users (email);
CREATE INDEX idx_users_role           ON users (role);
CREATE INDEX idx_users_is_active      ON users (is_active);

-- ---- incidents ----
CREATE INDEX idx_incidents_status           ON incidents (status);
CREATE INDEX idx_incidents_severity         ON incidents (severity);
CREATE INDEX idx_incidents_category         ON incidents (category);
CREATE INDEX idx_incidents_reported_by      ON incidents (reported_by);
CREATE INDEX idx_incidents_assigned_to      ON incidents (assigned_to);
CREATE INDEX idx_incidents_reported_at      ON incidents (reported_at DESC);
CREATE INDEX idx_incidents_sla_due_at       ON incidents (sla_due_at) WHERE sla_due_at IS NOT NULL;
CREATE INDEX idx_incidents_tags             ON incidents USING GIN (tags);
CREATE INDEX idx_incidents_number           ON incidents (incident_number);
-- Full-text search on title + description
CREATE INDEX idx_incidents_fts ON incidents USING GIN (
    to_tsvector('english', title || ' ' || description)
);

-- ---- uploaded_logs ----
CREATE INDEX idx_logs_incident_id    ON uploaded_logs (incident_id);
CREATE INDEX idx_logs_uploaded_by    ON uploaded_logs (uploaded_by);
CREATE INDEX idx_logs_status         ON uploaded_logs (status);
CREATE INDEX idx_logs_keyword_hits   ON uploaded_logs USING GIN (keyword_hits);
CREATE INDEX idx_logs_error_patterns ON uploaded_logs USING GIN (error_patterns jsonb_path_ops);

-- ---- historical_incidents ----
CREATE INDEX idx_hist_source_incident   ON historical_incidents (source_incident_id);
CREATE INDEX idx_hist_severity          ON historical_incidents (severity);
CREATE INDEX idx_hist_category          ON historical_incidents (category);
CREATE INDEX idx_hist_resolved_at       ON historical_incidents (resolved_at DESC);
CREATE INDEX idx_hist_tags              ON historical_incidents USING GIN (tags);
CREATE INDEX idx_hist_fts ON historical_incidents USING GIN (
    to_tsvector('english', title || ' ' || COALESCE(root_cause, '') || ' ' || COALESCE(resolution_summary, ''))
);

-- ---- verified_solutions ----
CREATE INDEX idx_sol_category       ON verified_solutions (category);
CREATE INDEX idx_sol_severity       ON verified_solutions (severity);
CREATE INDEX idx_sol_verified_by    ON verified_solutions (verified_by);
CREATE INDEX idx_sol_is_active      ON verified_solutions (is_active);
CREATE INDEX idx_sol_tags           ON verified_solutions USING GIN (tags);
CREATE INDEX idx_sol_affected_sys   ON verified_solutions USING GIN (affected_systems);
CREATE INDEX idx_sol_fts ON verified_solutions USING GIN (
    to_tsvector('english', title || ' ' || problem_statement || ' ' || COALESCE(root_cause, ''))
);

-- ---- incident_relationships ----
CREATE INDEX idx_rel_source  ON incident_relationships (source_incident_id);
CREATE INDEX idx_rel_target  ON incident_relationships (target_incident_id);
CREATE INDEX idx_rel_type    ON incident_relationships (relationship_type);

-- ---- ai_recommendations ----
CREATE INDEX idx_ai_incident_id     ON ai_recommendations (incident_id);
CREATE INDEX idx_ai_confidence      ON ai_recommendations (confidence_score DESC);
CREATE INDEX idx_ai_was_applied     ON ai_recommendations (was_applied);
CREATE INDEX idx_ai_generated_at    ON ai_recommendations (generated_at DESC);

-- ---- incident_comments ----
CREATE INDEX idx_comments_incident  ON incident_comments (incident_id);
CREATE INDEX idx_comments_author    ON incident_comments (author_id);

-- =============================================================================
-- TRIGGERS – auto-update updated_at
-- =============================================================================
CREATE OR REPLACE FUNCTION fn_set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

DO $$ DECLARE
    t TEXT;
BEGIN
    FOREACH t IN ARRAY ARRAY[
        'users', 'incidents', 'uploaded_logs',
        'verified_solutions', 'incident_relationships',
        'ai_recommendations', 'incident_comments'
    ] LOOP
        EXECUTE format(
            'CREATE TRIGGER trg_%s_updated_at
             BEFORE UPDATE ON %I
             FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();',
            t, t
        );
    END LOOP;
END $$;

-- =============================================================================
-- VIEWS – convenience layer for the backend
-- =============================================================================

-- Open incidents with assignee details
CREATE OR REPLACE VIEW vw_open_incidents AS
SELECT
    i.id,
    i.incident_number,
    i.title,
    i.status,
    i.severity,
    i.category,
    i.affected_system,
    i.environment,
    i.tags,
    i.reported_at,
    i.sla_due_at,
    i.downtime_minutes,
    i.affected_users,
    reporter.full_name  AS reporter_name,
    reporter.email      AS reporter_email,
    assignee.full_name  AS assignee_name,
    assignee.email      AS assignee_email
FROM incidents i
JOIN users reporter ON reporter.id = i.reported_by
LEFT JOIN users assignee ON assignee.id = i.assigned_to
WHERE i.status NOT IN ('closed', 'resolved');

COMMENT ON VIEW vw_open_incidents IS 'All non-closed/non-resolved incidents with user details.';

-- AI recommendation summary (best recommendation per incident)
CREATE OR REPLACE VIEW vw_top_ai_recommendations AS
SELECT DISTINCT ON (r.incident_id)
    r.id,
    r.incident_id,
    r.recommendation_title,
    r.confidence_score,
    r.confidence_level,
    r.was_applied,
    r.was_helpful,
    r.generated_at,
    vs.title AS solution_title,
    vs.kb_article_url
FROM ai_recommendations r
LEFT JOIN verified_solutions vs ON vs.id = r.verified_solution_id
ORDER BY r.incident_id, r.confidence_score DESC;

COMMENT ON VIEW vw_top_ai_recommendations IS 'Highest-confidence AI recommendation per incident.';

-- Solution effectiveness summary
CREATE OR REPLACE VIEW vw_solution_effectiveness AS
SELECT
    vs.id,
    vs.title,
    vs.category,
    vs.severity,
    vs.times_applied,
    vs.times_succeeded,
    vs.success_rate,
    u.full_name AS verified_by_name,
    vs.verified_at,
    vs.is_active
FROM verified_solutions vs
JOIN users u ON u.id = vs.verified_by
ORDER BY vs.success_rate DESC NULLS LAST, vs.times_applied DESC;

COMMENT ON VIEW vw_solution_effectiveness IS 'Ranked view of verified solutions by success rate.';
