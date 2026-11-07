# IntelliDesk – Database Module Documentation
**Technology:** PostgreSQL 15+  
**Module:** DATABASE ONLY (no frontend / backend APIs)  
**Project directory:** `intellidesk-db/`

---

## 📁 File Structure

```
intellidesk-db/
├── schema.sql                          ← Master schema (full reference)
├── setup.sh                            ← Automated setup script
├── .env.example                        ← Environment variable template
├── migrations/
│   ├── V001__initial_schema.sql        ← Tables, indexes, views, triggers
│   ├── V002__seed_admin_user.sql       ← Default admin account
│   └── V003__add_sla_policies.sql      ← SLA thresholds table
├── seeds/
│   └── sample_data.sql                 ← Realistic demo / QA data
└── docs/
    └── (this file)
```

---

## 🗃️ Table Overview

| # | Table | Description | Rows in Seed |
|---|-------|-------------|--------------|
| 1 | `users` | Platform users with RBAC roles | 8 |
| 2 | `incidents` | Active IT incident records | 10 |
| 3 | `uploaded_logs` | Log files attached to incidents | 5 |
| 4 | `historical_incidents` | Archived resolved incidents (AI training) | 6 |
| 5 | `verified_solutions` | Knowledge base of proven fixes | 6 |
| 6 | `incident_relationships` | Directed graph of incident connections | 5 |
| 7 | `ai_recommendations` | AI-generated resolution suggestions | 6 |
| 8 | `incident_comments` | Discussion threads & audit trail | 5 |
| 9 | `sla_policies` | ITIL-aligned SLA thresholds per severity | 4 |
| 10 | `schema_migrations` | Applied migration version tracking | — |

---

## 🔗 Entity-Relationship Diagram

```mermaid
erDiagram
    users {
        UUID id PK
        VARCHAR username
        VARCHAR email
        TEXT password_hash
        user_role role
        VARCHAR department
        BOOLEAN is_active
        TIMESTAMPTZ created_at
    }

    incidents {
        UUID id PK
        VARCHAR incident_number
        VARCHAR title
        incident_status status
        incident_severity severity
        incident_category category
        UUID reported_by FK
        UUID assigned_to FK
        UUID resolved_by FK
        TIMESTAMPTZ sla_due_at
        INTEGER downtime_minutes
        TIMESTAMPTZ created_at
    }

    uploaded_logs {
        UUID id PK
        UUID incident_id FK
        UUID uploaded_by FK
        VARCHAR original_filename
        BIGINT file_size_bytes
        log_status status
        TEXT parsed_summary
        JSONB error_patterns
        TEXT[] keyword_hits
    }

    historical_incidents {
        UUID id PK
        UUID source_incident_id FK
        VARCHAR incident_number
        TEXT root_cause
        TEXT resolution_summary
        INTEGER resolution_time_minutes
        TEXT embedding_vector
        UUID archived_by FK
    }

    verified_solutions {
        UUID id PK
        UUID historical_id FK
        UUID incident_id FK
        VARCHAR title
        TEXT problem_statement
        JSONB solution_steps
        NUMERIC success_rate
        INTEGER times_applied
        UUID verified_by FK
        UUID created_by FK
    }

    incident_relationships {
        UUID id PK
        UUID source_incident_id FK
        UUID target_incident_id FK
        relationship_type type
        NUMERIC confidence_score
        BOOLEAN is_ai_generated
    }

    ai_recommendations {
        UUID id PK
        UUID incident_id FK
        UUID verified_solution_id FK
        UUID historical_incident_id FK
        VARCHAR recommendation_title
        NUMERIC confidence_score
        confidence_level level
        BOOLEAN was_applied
        BOOLEAN was_helpful
        UUID feedback_given_by FK
    }

    incident_comments {
        UUID id PK
        UUID incident_id FK
        UUID author_id FK
        TEXT body
        BOOLEAN is_internal
        UUID parent_id FK
    }

    sla_policies {
        UUID id PK
        incident_severity severity
        INTEGER response_time_minutes
        INTEGER resolution_time_minutes
    }

    users ||--o{ incidents : "reported_by"
    users ||--o{ incidents : "assigned_to"
    users ||--o{ incidents : "resolved_by"
    incidents ||--o{ uploaded_logs : "has"
    users ||--o{ uploaded_logs : "uploaded_by"
    incidents ||--o{ incident_comments : "has"
    users ||--o{ incident_comments : "authored_by"
    incidents ||--o| historical_incidents : "archived_as"
    users ||--o{ historical_incidents : "archived_by"
    historical_incidents ||--o{ verified_solutions : "derived_from"
    incidents ||--o{ verified_solutions : "linked_to"
    users ||--o{ verified_solutions : "verified_by"
    users ||--o{ verified_solutions : "created_by"
    incidents ||--o{ incident_relationships : "source"
    incidents ||--o{ incident_relationships : "target"
    users ||--o{ incident_relationships : "created_by"
    incidents ||--o{ ai_recommendations : "has"
    verified_solutions ||--o{ ai_recommendations : "linked_solution"
    historical_incidents ||--o{ ai_recommendations : "linked_history"
    users ||--o{ ai_recommendations : "feedback_by"
```

---

## 📐 Table Relationships (Narrative)

### `users` → `incidents` (1 : many, three FK paths)
| FK Column | Meaning |
|-----------|---------|
| `reported_by` | User who filed the incident |
| `assigned_to` | Engineer currently responsible |
| `resolved_by` | User who marked it resolved |

### `incidents` → `uploaded_logs` (1 : many)
Each incident can have zero or more log files. Deleting an incident cascades to its logs (logs have no independent value without context). The `uploaded_by` FK is `RESTRICT` – you cannot delete a user who has uploaded files.

### `incidents` → `historical_incidents` (1 : 0..1)
When an incident is resolved and archived, a snapshot is written to `historical_incidents`. The `source_incident_id` FK is `SET NULL` on delete, preserving the historical record even if the live incident row is purged.

### `historical_incidents` → `verified_solutions` (many : many, simplified to 1:many)
A solution is primarily derived from one historical incident (`historical_id`) but may also reference the originating live incident (`incident_id`). Both FKs are `SET NULL` so solutions survive even after their source records are deleted.

### `incidents` → `incident_relationships` (many : many, self-referencing)
The relationship table stores **directed edges** in a graph:  
`source_incident_id` → `target_incident_id` with a typed edge label (`duplicate`, `related`, `caused_by`, `blocked_by`, `merged_into`).  
A `UNIQUE` constraint on `(source, target, type)` prevents duplicate edges. The `CHECK` constraint prevents self-loops.

### `incidents` → `ai_recommendations` (1 : many)
Each AI recommendation belongs to exactly one incident. It optionally links to both a `verified_solution` (the playbook recommended) and a `historical_incident` (the past match that triggered the recommendation). The `was_helpful` feedback column drives model retraining.

### `incident_comments` → `incident_comments` (self-referencing)
`parent_id` enables threaded replies. Setting `parent_id = NULL` creates a top-level comment; referencing another comment's ID creates a reply.

---

## 🏷️ ENUM Types

| Type | Values |
|------|--------|
| `user_role` | `admin`, `analyst`, `engineer`, `viewer` |
| `incident_status` | `open`, `in_progress`, `pending_review`, `resolved`, `closed`, `reopened` |
| `incident_severity` | `critical`, `high`, `medium`, `low` |
| `incident_category` | `network`, `server`, `application`, `database`, `security`, `storage`, `performance`, `hardware`, `other` |
| `log_status` | `uploaded`, `processing`, `processed`, `failed` |
| `relationship_type` | `duplicate`, `related`, `caused_by`, `blocked_by`, `merged_into` |
| `confidence_level` | `very_high`, `high`, `medium`, `low` |

---

## 📊 Indexes

### Strategy
- **B-tree indexes** on all FK columns, status/severity enums, and timestamp columns used for ordering/filtering.
- **GIN indexes** on `TEXT[]` array columns (tags, keyword_hits, affected_systems) for `@>` containment queries.
- **GIN full-text search** indexes on `title + description` / `title + root_cause + resolution_summary` for `to_tsvector` queries.
- **GIN JSONB** indexes (`jsonb_path_ops`) on `error_patterns` for path-operator queries.
- **Partial index** on `incidents.sla_due_at WHERE sla_due_at IS NOT NULL` for SLA breach queries.

### Key Indexes Summary

| Table | Index | Type | Purpose |
|-------|-------|------|---------|
| `incidents` | `idx_incidents_status` | B-tree | Filter by lifecycle state |
| `incidents` | `idx_incidents_tags` | GIN | Tag containment search |
| `incidents` | `idx_incidents_fts` | GIN | Full-text search |
| `incidents` | `idx_incidents_sla_due_at` | B-tree (partial) | SLA breach detection |
| `uploaded_logs` | `idx_logs_error_patterns` | GIN (jsonb) | Error pattern queries |
| `historical_incidents` | `idx_hist_fts` | GIN | AI similarity search |
| `verified_solutions` | `idx_sol_fts` | GIN | Knowledge base search |
| `ai_recommendations` | `idx_ai_confidence` | B-tree DESC | Top-N confidence queries |

---

## 👁️ Views

| View | Purpose |
|------|---------|
| `vw_open_incidents` | Active incidents with reporter and assignee details joined |
| `vw_top_ai_recommendations` | Best AI recommendation per incident (highest confidence) |
| `vw_solution_effectiveness` | Solutions ranked by success rate |

---

## ⚙️ Triggers

A single `fn_set_updated_at()` trigger function is attached to every mutable table via `BEFORE UPDATE` triggers named `trg_<table>_updated_at`. This guarantees `updated_at` is always accurate without application-layer involvement.

---

## 🔒 Key Design Decisions

> [!NOTE]
> All primary keys use `UUID` (via `uuid_generate_v4()`) rather than serial integers for distributed-safe ID generation and to avoid leaking record counts via predictable IDs.

> [!IMPORTANT]
> `password_hash` stores **only** bcrypt/argon2 hashes. The application layer must never store or log plain-text passwords.

> [!TIP]
> `historical_incidents.embedding_vector` stores a serialized sentence embedding as TEXT. If `pgvector` extension is available, migrate this column to `vector(768)` (or appropriate dimension) to enable native cosine similarity queries for AI incident matching.

> [!WARNING]
> `incident_relationships` uses `ON DELETE CASCADE` on both FK columns. Deleting an incident will remove all its relationship edges in both directions.

---

## 🚀 Setup Instructions

### Prerequisites
- PostgreSQL 15 or later
- `psql` CLI on `PATH`
- Superuser credentials

### Quick Start (Linux / macOS)

```bash
# 1. Clone / navigate to the project
cd intellidesk-db

# 2. Configure environment
cp .env.example .env
# Edit .env and set your PGPASSWORD and other values

# 3. Run setup (creates DB, runs all migrations)
chmod +x setup.sh
./setup.sh

# 4. Load sample data (optional – dev/QA only)
./setup.sh --seed
```

### Manual Setup (Windows / Any OS)

```sql
-- Step 1: Connect as postgres superuser
-- Step 2: Create role and database
CREATE ROLE intellidesk_owner LOGIN PASSWORD 'ChangeMe_IntelliDesk2026!';
CREATE DATABASE intellidesk OWNER intellidesk_owner;

-- Step 3: Connect to intellidesk database, then run:
\c intellidesk
\i migrations/V001__initial_schema.sql
\i migrations/V002__seed_admin_user.sql
\i migrations/V003__add_sla_policies.sql

-- Step 4: (Optional) Load sample data
\i seeds/sample_data.sql
```

### Reset (DESTRUCTIVE – development only)

```bash
./setup.sh --reset --seed
```

### Run only migrations (existing database)

```bash
./setup.sh --migrate-only
```

---

## 🔄 Migration Conventions

| Convention | Rule |
|------------|------|
| Naming | `V<NNN>__<description>.sql` (Flyway-compatible) |
| Idempotency | Each migration checks `schema_migrations` table before executing |
| Transactions | Every migration is wrapped in `BEGIN` / `COMMIT` |
| Rollback | Write a matching `V<NNN>__rollback_<description>.sql` for every DDL migration |

---

## 🗑️ Cascading Delete Behaviour

| Delete on | Cascade to |
|-----------|-----------|
| `incidents` | `uploaded_logs` (CASCADE), `incident_comments` (CASCADE), `ai_recommendations` (CASCADE), `incident_relationships` (CASCADE) |
| `incidents` | `historical_incidents.source_incident_id` → SET NULL |
| `incidents` | `verified_solutions.incident_id` → SET NULL |
| `historical_incidents` | `verified_solutions.historical_id` → SET NULL |
| `users` | `incidents.assigned_to / resolved_by` → SET NULL |
| `users` | `incidents.reported_by` → RESTRICT (cannot delete a user with incidents) |
| `verified_solutions` | `ai_recommendations.verified_solution_id` → SET NULL |

---

## 📦 Backend Integration Notes

> [!NOTE]
> The following notes are for the **backend API team** connecting to this schema.

1. **Connection string:** `postgresql://intellidesk_owner:password@host:5432/intellidesk`
2. **ORM mapping:** All tables use `UUID` PKs – configure your ORM accordingly (`@GeneratedValue(strategy = UUID)` / `uuid_generate_v4()` default handles DB-side generation).
3. **Enum handling:** All enums are PostgreSQL native enums. ORMs like SQLAlchemy, Hibernate, or Prisma need enum type registration.
4. **Full-text search:** Use `to_tsvector('english', ...)` with `@@` operator and `ts_rank` for ranked results. GIN indexes on FTS columns are already in place.
5. **Tag queries:** Use `tags @> ARRAY['kubernetes']::text[]` for containment and `tags && ARRAY['kubernetes','oom']::text[]` for overlap.
6. **SLA computation:** Insert `sla_due_at = NOW() + INTERVAL '<response_time_minutes> minutes'` from the `sla_policies` table when creating incidents.
7. **AI feedback loop:** Update `ai_recommendations.was_helpful`, `was_applied`, and `feedback_at` after each engineer action to drive model retraining.
8. **Archiving:** When an incident transitions to `resolved`, copy it to `historical_incidents` and compute `resolution_time_minutes = EXTRACT(EPOCH FROM (resolved_at - reported_at)) / 60`.

---

## 📋 Sample Queries for Backend Reference

```sql
-- Get all open critical incidents with assignee info
SELECT * FROM vw_open_incidents WHERE severity = 'critical';

-- Full-text search across incidents
SELECT id, incident_number, title,
       ts_rank(to_tsvector('english', title || ' ' || description),
               plainto_tsquery('english', 'kubernetes memory leak')) AS rank
FROM incidents
WHERE to_tsvector('english', title || ' ' || description)
      @@ plainto_tsquery('english', 'kubernetes memory leak')
ORDER BY rank DESC LIMIT 10;

-- Top AI recommendation per incident (use the view)
SELECT * FROM vw_top_ai_recommendations WHERE confidence_score >= 80;

-- Incidents approaching SLA breach (next 2 hours)
SELECT incident_number, title, severity, sla_due_at,
       EXTRACT(EPOCH FROM (sla_due_at - NOW())) / 60 AS minutes_remaining
FROM incidents
WHERE status NOT IN ('resolved', 'closed')
  AND sla_due_at BETWEEN NOW() AND NOW() + INTERVAL '2 hours'
ORDER BY sla_due_at;

-- Solution effectiveness (use the view)
SELECT * FROM vw_solution_effectiveness WHERE times_applied >= 5;

-- Find incidents with tag 'kubernetes' AND 'oom'
SELECT incident_number, title, status FROM incidents
WHERE tags @> ARRAY['kubernetes', 'oom'];

-- Incident relationship graph for a specific incident
SELECT
    src.incident_number AS source,
    r.relationship_type,
    tgt.incident_number AS target,
    r.confidence_score,
    r.is_ai_generated
FROM incident_relationships r
JOIN incidents src ON src.id = r.source_incident_id
JOIN incidents tgt ON tgt.id = r.target_incident_id
WHERE r.source_incident_id = 'b1000000-0000-0000-0000-000000000001'
   OR r.target_incident_id = 'b1000000-0000-0000-0000-000000000001';
```
