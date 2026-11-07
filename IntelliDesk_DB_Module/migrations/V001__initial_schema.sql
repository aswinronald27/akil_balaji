-- =============================================================================
-- IntelliDesk – Migration V001: Initial Schema
-- Run once on a fresh database.
-- =============================================================================
BEGIN;

-- Idempotency guard
CREATE TABLE IF NOT EXISTS schema_migrations (
    version     VARCHAR(20) PRIMARY KEY,
    description TEXT        NOT NULL,
    applied_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM schema_migrations WHERE version = 'V001') THEN
        RAISE NOTICE 'Migration V001 already applied. Skipping.';
        RETURN;
    END IF;
END $$;

-- ---- Extensions ----
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "btree_gin";

-- ---- Enum Types ----
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('admin','analyst','engineer','viewer');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE incident_status AS ENUM ('open','in_progress','pending_review','resolved','closed','reopened');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE incident_severity AS ENUM ('critical','high','medium','low');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE incident_category AS ENUM ('network','server','application','database','security','storage','performance','hardware','other');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE log_status AS ENUM ('uploaded','processing','processed','failed');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE relationship_type AS ENUM ('duplicate','related','caused_by','blocked_by','merged_into');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE confidence_level AS ENUM ('very_high','high','medium','low');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ---- Tables ----
CREATE TABLE IF NOT EXISTS users (
    id                UUID         DEFAULT uuid_generate_v4() PRIMARY KEY,
    username          VARCHAR(80)  NOT NULL UNIQUE,
    email             VARCHAR(255) NOT NULL UNIQUE,
    password_hash     TEXT         NOT NULL,
    full_name         VARCHAR(200) NOT NULL,
    role              user_role    NOT NULL DEFAULT 'viewer',
    department        VARCHAR(100),
    phone             VARCHAR(30),
    avatar_url        TEXT,
    is_active         BOOLEAN      NOT NULL DEFAULT TRUE,
    is_email_verified BOOLEAN      NOT NULL DEFAULT FALSE,
    last_login_at     TIMESTAMPTZ,
    created_at        TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS incidents (
    id                 UUID               DEFAULT uuid_generate_v4() PRIMARY KEY,
    incident_number    VARCHAR(20)        NOT NULL UNIQUE,
    title              VARCHAR(500)       NOT NULL,
    description        TEXT               NOT NULL,
    status             incident_status    NOT NULL DEFAULT 'open',
    severity           incident_severity  NOT NULL DEFAULT 'medium',
    category           incident_category  NOT NULL DEFAULT 'other',
    affected_system    VARCHAR(300),
    affected_component VARCHAR(300),
    environment        VARCHAR(50)        DEFAULT 'production',
    tags               TEXT[]             DEFAULT '{}',
    reported_by        UUID               NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    assigned_to        UUID               REFERENCES users(id) ON DELETE SET NULL,
    resolved_by        UUID               REFERENCES users(id) ON DELETE SET NULL,
    reported_at        TIMESTAMPTZ        NOT NULL DEFAULT NOW(),
    acknowledged_at    TIMESTAMPTZ,
    resolved_at        TIMESTAMPTZ,
    closed_at          TIMESTAMPTZ,
    sla_due_at         TIMESTAMPTZ,
    downtime_minutes   INTEGER            DEFAULT 0 CHECK (downtime_minutes >= 0),
    affected_users     INTEGER            DEFAULT 0 CHECK (affected_users >= 0),
    created_at         TIMESTAMPTZ        NOT NULL DEFAULT NOW(),
    updated_at         TIMESTAMPTZ        NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS uploaded_logs (
    id                UUID        DEFAULT uuid_generate_v4() PRIMARY KEY,
    incident_id       UUID        NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
    uploaded_by       UUID        NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    original_filename VARCHAR(500) NOT NULL,
    stored_filename   VARCHAR(500) NOT NULL UNIQUE,
    file_path         TEXT         NOT NULL,
    file_size_bytes   BIGINT       NOT NULL CHECK (file_size_bytes > 0),
    mime_type         VARCHAR(100) NOT NULL DEFAULT 'text/plain',
    checksum_sha256   CHAR(64),
    status            log_status   NOT NULL DEFAULT 'uploaded',
    parsed_summary    TEXT,
    error_patterns    JSONB        DEFAULT '[]',
    keyword_hits      TEXT[]       DEFAULT '{}',
    processing_error  TEXT,
    processed_at      TIMESTAMPTZ,
    created_at        TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS historical_incidents (
    id                      UUID               DEFAULT uuid_generate_v4() PRIMARY KEY,
    source_incident_id      UUID               REFERENCES incidents(id) ON DELETE SET NULL,
    incident_number         VARCHAR(20)        NOT NULL,
    title                   VARCHAR(500)       NOT NULL,
    description             TEXT               NOT NULL,
    root_cause              TEXT,
    resolution_summary      TEXT,
    severity                incident_severity  NOT NULL,
    category                incident_category  NOT NULL,
    affected_system         VARCHAR(300),
    affected_component      VARCHAR(300),
    environment             VARCHAR(50),
    tags                    TEXT[]             DEFAULT '{}',
    reported_at             TIMESTAMPTZ        NOT NULL,
    resolved_at             TIMESTAMPTZ,
    resolution_time_minutes INTEGER,
    downtime_minutes        INTEGER            DEFAULT 0,
    affected_users          INTEGER            DEFAULT 0,
    embedding_vector        TEXT,
    similarity_hash         CHAR(64),
    archived_by             UUID               REFERENCES users(id) ON DELETE SET NULL,
    archived_at             TIMESTAMPTZ        NOT NULL DEFAULT NOW(),
    source_version          INTEGER            NOT NULL DEFAULT 1,
    created_at              TIMESTAMPTZ        NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS verified_solutions (
    id                  UUID               DEFAULT uuid_generate_v4() PRIMARY KEY,
    historical_id       UUID               REFERENCES historical_incidents(id) ON DELETE SET NULL,
    incident_id         UUID               REFERENCES incidents(id) ON DELETE SET NULL,
    title               VARCHAR(500)       NOT NULL,
    problem_statement   TEXT               NOT NULL,
    root_cause          TEXT,
    solution_steps      JSONB              NOT NULL DEFAULT '[]',
    prerequisites       TEXT,
    post_actions        TEXT,
    category            incident_category  NOT NULL,
    severity            incident_severity  NOT NULL,
    affected_systems    TEXT[]             DEFAULT '{}',
    tags                TEXT[]             DEFAULT '{}',
    verified_by         UUID               NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    verified_at         TIMESTAMPTZ        NOT NULL DEFAULT NOW(),
    is_active           BOOLEAN            NOT NULL DEFAULT TRUE,
    success_rate        NUMERIC(5,2)       CHECK (success_rate BETWEEN 0 AND 100),
    times_applied       INTEGER            NOT NULL DEFAULT 0,
    times_succeeded     INTEGER            NOT NULL DEFAULT 0,
    kb_article_url      TEXT,
    related_runbook_url TEXT,
    created_by          UUID               NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    created_at          TIMESTAMPTZ        NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ        NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS incident_relationships (
    id                  UUID               DEFAULT uuid_generate_v4() PRIMARY KEY,
    source_incident_id  UUID               NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
    target_incident_id  UUID               NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
    relationship_type   relationship_type  NOT NULL,
    confidence_score    NUMERIC(5,2)       CHECK (confidence_score BETWEEN 0 AND 100),
    is_ai_generated     BOOLEAN            NOT NULL DEFAULT FALSE,
    notes               TEXT,
    created_by          UUID               REFERENCES users(id) ON DELETE SET NULL,
    created_at          TIMESTAMPTZ        NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ        NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_no_self_relationship CHECK (source_incident_id <> target_incident_id),
    CONSTRAINT uq_incident_relationship UNIQUE (source_incident_id, target_incident_id, relationship_type)
);

CREATE TABLE IF NOT EXISTS ai_recommendations (
    id                     UUID               DEFAULT uuid_generate_v4() PRIMARY KEY,
    incident_id            UUID               NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
    verified_solution_id   UUID               REFERENCES verified_solutions(id) ON DELETE SET NULL,
    historical_incident_id UUID               REFERENCES historical_incidents(id) ON DELETE SET NULL,
    recommendation_title   VARCHAR(500)       NOT NULL,
    recommendation_text    TEXT               NOT NULL,
    suggested_actions      JSONB              NOT NULL DEFAULT '[]',
    model_name             VARCHAR(100)       NOT NULL,
    model_version          VARCHAR(50),
    confidence_score       NUMERIC(5,2)       NOT NULL CHECK (confidence_score BETWEEN 0 AND 100),
    confidence_level       confidence_level   NOT NULL,
    similarity_score       NUMERIC(5,2)       CHECK (similarity_score BETWEEN 0 AND 100),
    reasoning              TEXT,
    prompt_tokens          INTEGER,
    completion_tokens      INTEGER,
    was_applied            BOOLEAN            DEFAULT FALSE,
    was_helpful            BOOLEAN,
    feedback_notes         TEXT,
    feedback_given_by      UUID               REFERENCES users(id) ON DELETE SET NULL,
    feedback_at            TIMESTAMPTZ,
    generated_at           TIMESTAMPTZ        NOT NULL DEFAULT NOW(),
    expires_at             TIMESTAMPTZ,
    created_at             TIMESTAMPTZ        NOT NULL DEFAULT NOW(),
    updated_at             TIMESTAMPTZ        NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS incident_comments (
    id          UUID        DEFAULT uuid_generate_v4() PRIMARY KEY,
    incident_id UUID        NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
    author_id   UUID        NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    body        TEXT        NOT NULL,
    is_internal BOOLEAN     NOT NULL DEFAULT FALSE,
    parent_id   UUID        REFERENCES incident_comments(id) ON DELETE SET NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---- Indexes ----
CREATE INDEX IF NOT EXISTS idx_users_email              ON users (email);
CREATE INDEX IF NOT EXISTS idx_users_role               ON users (role);
CREATE INDEX IF NOT EXISTS idx_users_is_active          ON users (is_active);
CREATE INDEX IF NOT EXISTS idx_incidents_status         ON incidents (status);
CREATE INDEX IF NOT EXISTS idx_incidents_severity       ON incidents (severity);
CREATE INDEX IF NOT EXISTS idx_incidents_category       ON incidents (category);
CREATE INDEX IF NOT EXISTS idx_incidents_reported_by    ON incidents (reported_by);
CREATE INDEX IF NOT EXISTS idx_incidents_assigned_to    ON incidents (assigned_to);
CREATE INDEX IF NOT EXISTS idx_incidents_reported_at    ON incidents (reported_at DESC);
CREATE INDEX IF NOT EXISTS idx_incidents_sla_due_at     ON incidents (sla_due_at) WHERE sla_due_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_incidents_tags           ON incidents USING GIN (tags);
CREATE INDEX IF NOT EXISTS idx_incidents_number         ON incidents (incident_number);
CREATE INDEX IF NOT EXISTS idx_incidents_fts            ON incidents USING GIN (to_tsvector('english', title || ' ' || description));
CREATE INDEX IF NOT EXISTS idx_logs_incident_id         ON uploaded_logs (incident_id);
CREATE INDEX IF NOT EXISTS idx_logs_uploaded_by         ON uploaded_logs (uploaded_by);
CREATE INDEX IF NOT EXISTS idx_logs_status              ON uploaded_logs (status);
CREATE INDEX IF NOT EXISTS idx_logs_keyword_hits        ON uploaded_logs USING GIN (keyword_hits);
CREATE INDEX IF NOT EXISTS idx_logs_error_patterns      ON uploaded_logs USING GIN (error_patterns jsonb_path_ops);
CREATE INDEX IF NOT EXISTS idx_hist_source_incident     ON historical_incidents (source_incident_id);
CREATE INDEX IF NOT EXISTS idx_hist_severity            ON historical_incidents (severity);
CREATE INDEX IF NOT EXISTS idx_hist_category            ON historical_incidents (category);
CREATE INDEX IF NOT EXISTS idx_hist_resolved_at         ON historical_incidents (resolved_at DESC);
CREATE INDEX IF NOT EXISTS idx_hist_tags                ON historical_incidents USING GIN (tags);
CREATE INDEX IF NOT EXISTS idx_hist_fts                 ON historical_incidents USING GIN (to_tsvector('english', title || ' ' || COALESCE(root_cause,'') || ' ' || COALESCE(resolution_summary,'')));
CREATE INDEX IF NOT EXISTS idx_sol_category             ON verified_solutions (category);
CREATE INDEX IF NOT EXISTS idx_sol_severity             ON verified_solutions (severity);
CREATE INDEX IF NOT EXISTS idx_sol_verified_by          ON verified_solutions (verified_by);
CREATE INDEX IF NOT EXISTS idx_sol_is_active            ON verified_solutions (is_active);
CREATE INDEX IF NOT EXISTS idx_sol_tags                 ON verified_solutions USING GIN (tags);
CREATE INDEX IF NOT EXISTS idx_sol_affected_sys         ON verified_solutions USING GIN (affected_systems);
CREATE INDEX IF NOT EXISTS idx_sol_fts                  ON verified_solutions USING GIN (to_tsvector('english', title || ' ' || problem_statement || ' ' || COALESCE(root_cause,'')));
CREATE INDEX IF NOT EXISTS idx_rel_source               ON incident_relationships (source_incident_id);
CREATE INDEX IF NOT EXISTS idx_rel_target               ON incident_relationships (target_incident_id);
CREATE INDEX IF NOT EXISTS idx_rel_type                 ON incident_relationships (relationship_type);
CREATE INDEX IF NOT EXISTS idx_ai_incident_id           ON ai_recommendations (incident_id);
CREATE INDEX IF NOT EXISTS idx_ai_confidence            ON ai_recommendations (confidence_score DESC);
CREATE INDEX IF NOT EXISTS idx_ai_was_applied           ON ai_recommendations (was_applied);
CREATE INDEX IF NOT EXISTS idx_ai_generated_at          ON ai_recommendations (generated_at DESC);
CREATE INDEX IF NOT EXISTS idx_comments_incident        ON incident_comments (incident_id);
CREATE INDEX IF NOT EXISTS idx_comments_author          ON incident_comments (author_id);

-- ---- Updated-at trigger function ----
CREATE OR REPLACE FUNCTION fn_set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END; $$;

DO $$ DECLARE t TEXT; BEGIN
    FOREACH t IN ARRAY ARRAY[
        'users','incidents','uploaded_logs','verified_solutions',
        'incident_relationships','ai_recommendations','incident_comments'
    ] LOOP
        IF NOT EXISTS (
            SELECT 1 FROM pg_trigger
            WHERE tgname = 'trg_' || t || '_updated_at'
        ) THEN
            EXECUTE format(
                'CREATE TRIGGER trg_%s_updated_at
                 BEFORE UPDATE ON %I
                 FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();', t, t
            );
        END IF;
    END LOOP;
END $$;

-- ---- Views ----
CREATE OR REPLACE VIEW vw_open_incidents AS
SELECT i.id, i.incident_number, i.title, i.status, i.severity, i.category,
       i.affected_system, i.environment, i.tags, i.reported_at, i.sla_due_at,
       i.downtime_minutes, i.affected_users,
       reporter.full_name AS reporter_name, reporter.email AS reporter_email,
       assignee.full_name AS assignee_name, assignee.email AS assignee_email
FROM incidents i
JOIN  users reporter ON reporter.id = i.reported_by
LEFT JOIN users assignee ON assignee.id = i.assigned_to
WHERE i.status NOT IN ('closed','resolved');

CREATE OR REPLACE VIEW vw_top_ai_recommendations AS
SELECT DISTINCT ON (r.incident_id)
    r.id, r.incident_id, r.recommendation_title, r.confidence_score, r.confidence_level,
    r.was_applied, r.was_helpful, r.generated_at,
    vs.title AS solution_title, vs.kb_article_url
FROM ai_recommendations r
LEFT JOIN verified_solutions vs ON vs.id = r.verified_solution_id
ORDER BY r.incident_id, r.confidence_score DESC;

CREATE OR REPLACE VIEW vw_solution_effectiveness AS
SELECT vs.id, vs.title, vs.category, vs.severity,
       vs.times_applied, vs.times_succeeded, vs.success_rate,
       u.full_name AS verified_by_name, vs.verified_at, vs.is_active
FROM verified_solutions vs
JOIN users u ON u.id = vs.verified_by
ORDER BY vs.success_rate DESC NULLS LAST, vs.times_applied DESC;

-- Record migration
INSERT INTO schema_migrations (version, description)
VALUES ('V001', 'Initial schema: users, incidents, uploaded_logs, historical_incidents, verified_solutions, incident_relationships, ai_recommendations, incident_comments')
ON CONFLICT (version) DO NOTHING;

COMMIT;
