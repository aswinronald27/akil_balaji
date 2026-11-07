#!/usr/bin/env bash
# =============================================================================
# IntelliDesk – Database Setup Script
# Automates database creation, schema migration, and optional seeding.
#
# Usage:
#   chmod +x setup.sh
#   ./setup.sh                     # Fresh setup (create DB + run all migrations)
#   ./setup.sh --seed              # Setup + load sample data
#   ./setup.sh --migrate-only      # Run pending migrations on existing DB
#   ./setup.sh --reset             # DROP and recreate database (DESTRUCTIVE)
#   ./setup.sh --seed --env=local  # Override environment
#
# Environment variables (or .env file):
#   PGHOST      PostgreSQL host       (default: localhost)
#   PGPORT      PostgreSQL port       (default: 5432)
#   PGUSER      Superuser name        (default: postgres)
#   PGPASSWORD  Superuser password
#   DB_NAME     Target database name  (default: intellidesk)
#   DB_OWNER    DB owner role name    (default: intellidesk_owner)
# =============================================================================

set -euo pipefail

# ---------------------------------------------------------------------------
# Load .env if it exists
# ---------------------------------------------------------------------------
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
[[ -f "$SCRIPT_DIR/.env" ]] && source "$SCRIPT_DIR/.env"

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------
PGHOST="${PGHOST:-localhost}"
PGPORT="${PGPORT:-5432}"
PGUSER="${PGUSER:-postgres}"
DB_NAME="${DB_NAME:-intellidesk}"
DB_OWNER="${DB_OWNER:-intellidesk_owner}"
MIGRATIONS_DIR="$SCRIPT_DIR/migrations"
SEEDS_DIR="$SCRIPT_DIR/seeds"

# Flags
SEED=false
MIGRATE_ONLY=false
RESET=false

# Parse args
for arg in "$@"; do
  case $arg in
    --seed)          SEED=true ;;
    --migrate-only)  MIGRATE_ONLY=true ;;
    --reset)         RESET=true ;;
  esac
done

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
log()  { echo -e "\033[0;32m[$(date +%H:%M:%S)] $*\033[0m"; }
warn() { echo -e "\033[0;33m[$(date +%H:%M:%S)] WARN: $*\033[0m"; }
err()  { echo -e "\033[0;31m[$(date +%H:%M:%S)] ERROR: $*\033[0m" >&2; exit 1; }

psql_super() { PGPASSWORD="${PGPASSWORD:-}" psql -h "$PGHOST" -p "$PGPORT" -U "$PGUSER" "$@"; }
psql_db()    { PGPASSWORD="${PGPASSWORD:-}" psql -h "$PGHOST" -p "$PGPORT" -U "$PGUSER" -d "$DB_NAME" "$@"; }

# ---------------------------------------------------------------------------
# Step 1: Optionally reset
# ---------------------------------------------------------------------------
if $RESET; then
  warn "RESET flag detected – dropping database '$DB_NAME'. Press Ctrl+C within 5s to abort."
  sleep 5
  psql_super -c "DROP DATABASE IF EXISTS $DB_NAME;" postgres
  psql_super -c "DROP ROLE IF EXISTS $DB_OWNER;" postgres
  log "Database '$DB_NAME' dropped."
fi

# ---------------------------------------------------------------------------
# Step 2: Create role and database (idempotent)
# ---------------------------------------------------------------------------
if ! $MIGRATE_ONLY; then
  log "Creating role '$DB_OWNER' (if not exists)..."
  psql_super postgres <<SQL
DO \$\$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = '$DB_OWNER') THEN
    CREATE ROLE $DB_OWNER LOGIN PASSWORD 'ChangeMe_IntelliDesk2026!';
    RAISE NOTICE 'Role $DB_OWNER created.';
  ELSE
    RAISE NOTICE 'Role $DB_OWNER already exists.';
  END IF;
END \$\$;
SQL

  log "Creating database '$DB_NAME' (if not exists)..."
  psql_super postgres -tc "SELECT 1 FROM pg_database WHERE datname='$DB_NAME'" \
    | grep -q 1 || psql_super postgres -c "CREATE DATABASE $DB_NAME OWNER $DB_OWNER;"
  log "Database '$DB_NAME' ready."
fi

# ---------------------------------------------------------------------------
# Step 3: Run migrations in version order
# ---------------------------------------------------------------------------
log "Running migrations from: $MIGRATIONS_DIR"
psql_db -c "CREATE TABLE IF NOT EXISTS schema_migrations (
  version VARCHAR(20) PRIMARY KEY,
  description TEXT NOT NULL,
  applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);" 2>/dev/null || true

for migration in $(ls "$MIGRATIONS_DIR"/V*.sql 2>/dev/null | sort); do
  version=$(basename "$migration" | cut -d'_' -f1)
  applied=$(psql_db -tAc "SELECT COUNT(*) FROM schema_migrations WHERE version='$version';")
  if [[ "$applied" -eq 0 ]]; then
    log "Applying migration: $(basename $migration)..."
    psql_db -f "$migration"
    log "✓ Applied $version"
  else
    log "⊘ Skipping $version (already applied)"
  fi
done

# ---------------------------------------------------------------------------
# Step 4: Optionally load seed data
# ---------------------------------------------------------------------------
if $SEED; then
  log "Loading sample seed data..."
  psql_db -f "$SEEDS_DIR/sample_data.sql"
  log "✓ Seed data loaded."
fi

# ---------------------------------------------------------------------------
# Done
# ---------------------------------------------------------------------------
log "============================================="
log " IntelliDesk database setup complete!"
log " Host:     $PGHOST:$PGPORT"
log " Database: $DB_NAME"
log " Owner:    $DB_OWNER"
log "============================================="
