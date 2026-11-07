-- =============================================================================
-- IntelliDesk – Migration V002: Seed Roles & Default Admin
-- Creates a default admin account (password must be changed on first login).
-- =============================================================================
BEGIN;

DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM schema_migrations WHERE version = 'V002') THEN
        RAISE NOTICE 'Migration V002 already applied. Skipping.';
        RETURN;
    END IF;
END $$;

-- Default admin — password is 'Ch@ngeMe2026!' hashed with bcrypt cost=12
-- IMPORTANT: Change this password immediately after first login.
INSERT INTO users (username, email, password_hash, full_name, role, department, is_active, is_email_verified)
VALUES (
    'admin',
    'admin@intellidesk.local',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMRJVsMCjMg3tgqmHC.PanvjO2',  -- bcrypt placeholder
    'System Administrator',
    'admin',
    'IT Operations',
    TRUE,
    TRUE
)
ON CONFLICT (username) DO NOTHING;

INSERT INTO schema_migrations (version, description)
VALUES ('V002', 'Seed default admin user')
ON CONFLICT (version) DO NOTHING;

COMMIT;
