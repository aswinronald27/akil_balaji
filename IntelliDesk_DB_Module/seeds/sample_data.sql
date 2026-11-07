-- =============================================================================
-- IntelliDesk – Seed Data
-- Realistic sample records for development, QA, and demo environments.
-- =============================================================================
BEGIN;

-- ---------------------------------------------------------------------------
-- USERS (8 sample accounts)
-- All passwords are 'Demo@1234!' (bcrypt placeholder hashes shown)
-- ---------------------------------------------------------------------------
INSERT INTO users (id, username, email, password_hash, full_name, role, department, phone, is_active, is_email_verified)
VALUES
  ('a1000000-0000-0000-0000-000000000001', 'sarah.johnson',  'sarah.johnson@acmecorp.com',  '$2b$12$placeholder_hash_001', 'Sarah Johnson',   'admin',    'IT Operations',      '+1-555-0101', TRUE, TRUE),
  ('a1000000-0000-0000-0000-000000000002', 'ravi.kumar',     'ravi.kumar@acmecorp.com',     '$2b$12$placeholder_hash_002', 'Ravi Kumar',      'analyst',  'NOC',                '+1-555-0102', TRUE, TRUE),
  ('a1000000-0000-0000-0000-000000000003', 'mei.chen',       'mei.chen@acmecorp.com',       '$2b$12$placeholder_hash_003', 'Mei Chen',        'analyst',  'Security Operations','+1-555-0103', TRUE, TRUE),
  ('a1000000-0000-0000-0000-000000000004', 'alex.torres',    'alex.torres@acmecorp.com',    '$2b$12$placeholder_hash_004', 'Alex Torres',     'engineer', 'Platform Engineering','+1-555-0104', TRUE, TRUE),
  ('a1000000-0000-0000-0000-000000000005', 'priya.nair',     'priya.nair@acmecorp.com',     '$2b$12$placeholder_hash_005', 'Priya Nair',      'engineer', 'Database Team',      '+1-555-0105', TRUE, TRUE),
  ('a1000000-0000-0000-0000-000000000006', 'james.okonkwo',  'james.okonkwo@acmecorp.com',  '$2b$12$placeholder_hash_006', 'James Okonkwo',   'engineer', 'Network Operations', '+1-555-0106', TRUE, TRUE),
  ('a1000000-0000-0000-0000-000000000007', 'lisa.park',      'lisa.park@acmecorp.com',      '$2b$12$placeholder_hash_007', 'Lisa Park',       'analyst',  'Application Support','+1-555-0107', TRUE, TRUE),
  ('a1000000-0000-0000-0000-000000000008', 'tom.nguyen',     'tom.nguyen@acmecorp.com',     '$2b$12$placeholder_hash_008', 'Tom Nguyen',      'viewer',   'Business Intelligence','+1-555-0108', TRUE, TRUE)
ON CONFLICT (id) DO NOTHING;

-- ---------------------------------------------------------------------------
-- INCIDENTS (10 realistic records across categories)
-- ---------------------------------------------------------------------------
INSERT INTO incidents (
    id, incident_number, title, description, status, severity, category,
    affected_system, affected_component, environment, tags,
    reported_by, assigned_to, resolved_by,
    reported_at, acknowledged_at, resolved_at, closed_at, sla_due_at,
    downtime_minutes, affected_users
)
VALUES
  -- INC-001: Critical DB outage
  ('b1000000-0000-0000-0000-000000000001',
   'INC-20260001',
   'Primary PostgreSQL cluster unresponsive – payment service down',
   'At 09:14 UTC the payment-service health check started returning HTTP 503. Investigation reveals the primary PostgreSQL node (db-prod-01) is unresponsive. Replica failover did not trigger automatically. Approximately 4 200 customers are unable to complete transactions.',
   'resolved', 'critical', 'database',
   'Payment Gateway v3.2', 'PostgreSQL Primary Node db-prod-01', 'production',
   ARRAY['postgresql','failover','payment','p1'],
   'a1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000005', 'a1000000-0000-0000-0000-000000000005',
   '2026-10-15 09:14:00+00', '2026-10-15 09:21:00+00', '2026-10-15 11:03:00+00', '2026-10-15 12:00:00+00',
   '2026-10-15 13:14:00+00', 109, 4200),

  -- INC-002: High – SSL cert expiry
  ('b1000000-0000-0000-0000-000000000002',
   'INC-20260002',
   'SSL certificate expired on api.acmecorp.com – browser warnings for all users',
   'The wildcard TLS certificate for *.acmecorp.com expired at midnight. All HTTPS connections to api.acmecorp.com, dashboard.acmecorp.com, and auth.acmecorp.com now show browser security warnings. Mobile apps that enforce certificate pinning are rejecting connections outright.',
   'closed', 'high', 'security',
   'API Gateway', 'TLS/SSL Certificate – *.acmecorp.com', 'production',
   ARRAY['ssl','certificate','tls','expiry'],
   'a1000000-0000-0000-0000-000000000007', 'a1000000-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000004',
   '2026-10-18 00:05:00+00', '2026-10-18 00:28:00+00', '2026-10-18 02:14:00+00', '2026-10-18 09:00:00+00',
   '2026-10-18 08:05:00+00', 129, 12000),

  -- INC-003: Medium – Kubernetes pod crash loop
  ('b1000000-0000-0000-0000-000000000003',
   'INC-20260003',
   'Kubernetes: notification-service pods in CrashLoopBackOff after v2.4.1 deploy',
   'Following the 14:00 UTC deployment of notification-service v2.4.1, three of five pods entered CrashLoopBackOff. Pod logs show java.lang.OutOfMemoryError: Java heap space at startup. No prior version rollback has been performed yet.',
   'in_progress', 'medium', 'application',
   'Notification Service v2.4.1', 'Kubernetes Deployment / JVM', 'production',
   ARRAY['kubernetes','oom','java','crashloop','deploy'],
   'a1000000-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000004', NULL,
   '2026-11-01 14:35:00+00', '2026-11-01 14:42:00+00', NULL, NULL,
   '2026-11-02 14:35:00+00', 0, 0),

  -- INC-004: Critical – Network switch failure
  ('b1000000-0000-0000-0000-000000000004',
   'INC-20260004',
   'Core switch SW-DC1-CORE-01 offline – 60% of data centre traffic dropped',
   'Monitoring alerts at 03:47 UTC for massive packet loss across DC1. Physical inspection confirms power failure on SW-DC1-CORE-01. Redundant switch SW-DC1-CORE-02 is not picking up traffic – spanning tree is stuck in listening state. Emergency maintenance crew dispatched.',
   'resolved', 'critical', 'network',
   'Data Centre Network', 'Core Switch SW-DC1-CORE-01', 'production',
   ARRAY['switch','spanning-tree','network','dc1','p1'],
   'a1000000-0000-0000-0000-000000000006', 'a1000000-0000-0000-0000-000000000006', 'a1000000-0000-0000-0000-000000000006',
   '2026-10-22 03:47:00+00', '2026-10-22 03:52:00+00', '2026-10-22 05:31:00+00', '2026-10-22 06:00:00+00',
   '2026-10-22 07:47:00+00', 104, 1800),

  -- INC-005: High – Memory leak
  ('b1000000-0000-0000-0000-000000000005',
   'INC-20260005',
   'Memory leak in reporting-service causing gradual performance degradation',
   'The reporting-service process on rpt-prod-01 has grown from 2 GB to 14.7 GB RSS over 72 hours. Response times have increased from 120 ms (p95) to 4.2 s (p95). The service has not yet crashed but OOM kill is imminent. Root cause suspected in the new PDF export library added in v5.1.0.',
   'in_progress', 'high', 'performance',
   'Reporting Service v5.1.0', 'PDF Export Worker', 'production',
   ARRAY['memory-leak','performance','reporting','oom'],
   'a1000000-0000-0000-0000-000000000007', 'a1000000-0000-0000-0000-000000000004', NULL,
   '2026-11-03 08:00:00+00', '2026-11-03 08:15:00+00', NULL, NULL,
   '2026-11-03 16:00:00+00', 0, 350),

  -- INC-006: Medium – Disk almost full
  ('b1000000-0000-0000-0000-000000000006',
   'INC-20260006',
   'Disk usage at 94% on log aggregation server log-agg-02',
   'Datadog alert: disk partition /var/log on log-agg-02 is at 94% utilisation (380 GB / 400 GB). Log rotation is configured but not rotating fast enough due to increased log verbosity set during last week''s debug session. Risk of disk fill within 6 hours.',
   'open', 'medium', 'server',
   'Log Aggregation Cluster', '/var/log on log-agg-02', 'production',
   ARRAY['disk','storage','logs','log-agg-02'],
   'a1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000006', NULL,
   '2026-11-05 10:30:00+00', NULL, NULL, NULL,
   '2026-11-06 10:30:00+00', 0, 0),

  -- INC-007: Low – Stale API tokens
  ('b1000000-0000-0000-0000-000000000007',
   'INC-20260007',
   'Stale service-account API tokens not rotated per 90-day policy',
   'Security audit identified 14 service-account API tokens across 7 internal integrations that have not been rotated in over 90 days, violating the corporate security policy. No active exploitation detected, but tokens must be rotated within 48 hours.',
   'open', 'low', 'security',
   'Identity & Access Management', 'Service Account Token Store', 'production',
   ARRAY['security','tokens','rotation','audit'],
   'a1000000-0000-0000-0000-000000000003', NULL, NULL,
   '2026-11-04 15:00:00+00', NULL, NULL, NULL,
   '2026-11-09 15:00:00+00', 0, 0),

  -- INC-008: High – Redis cache outage
  ('b1000000-0000-0000-0000-000000000008',
   'INC-20260008',
   'Redis sentinel failover failed – session cache unavailable',
   'At 16:22 UTC Redis master cache-prod-01 went offline following a kernel OOM kill. Redis Sentinel (3 nodes) initiated a failover but all three sentinels voted for the same replica which itself had crashed. No failover was completed. User sessions are invalidated every 30 seconds causing continuous re-authentication.',
   'resolved', 'high', 'application',
   'Session Management', 'Redis Sentinel Cluster', 'production',
   ARRAY['redis','sentinel','failover','sessions','cache'],
   'a1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000005', 'a1000000-0000-0000-0000-000000000005',
   '2026-10-28 16:22:00+00', '2026-10-28 16:30:00+00', '2026-10-28 18:45:00+00', '2026-10-28 20:00:00+00',
   '2026-10-29 00:22:00+00', 143, 8600),

  -- INC-009: Critical – Ransomware detected
  ('b1000000-0000-0000-0000-000000000009',
   'INC-20260009',
   'Ransomware activity detected on finance-workstation-07 – network isolated',
   'EDR alert at 11:03 UTC: Suspicious file encryption activity on finance-workstation-07 (Windows 11, user: carol.white). Process explorer.exe spawning cmd.exe → vssadmin delete shadows. Workstation has been isolated from the network. Potential lateral movement to finance file share \\\\fileshare\\\\finance not yet confirmed.',
   'in_progress', 'critical', 'security',
   'Corporate Endpoint Fleet', 'finance-workstation-07', 'production',
   ARRAY['ransomware','edr','security','endpoint','p1'],
   'a1000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000003', NULL,
   '2026-11-05 11:03:00+00', '2026-11-05 11:05:00+00', NULL, NULL,
   '2026-11-05 15:03:00+00', 0, 1),

  -- INC-010: Medium – ETL pipeline failure
  ('b1000000-0000-0000-0000-000000000010',
   'INC-20260010',
   'Nightly ETL pipeline failed – analytics dashboards showing stale data (T-1)',
   'The nightly ETL pipeline (Airflow DAG: analytics_warehouse_load) failed at 02:17 UTC with a SQLAlchemy connection timeout to the analytics warehouse. Downstream BI dashboards are showing data as of yesterday. Business users are reporting discrepancies in the morning revenue report.',
   'pending_review', 'medium', 'database',
   'Analytics Warehouse', 'Airflow ETL Pipeline', 'production',
   ARRAY['airflow','etl','analytics','timeout','bi'],
   'a1000000-0000-0000-0000-000000000007', 'a1000000-0000-0000-0000-000000000005', 'a1000000-0000-0000-0000-000000000005',
   '2026-11-05 02:17:00+00', '2026-11-05 07:30:00+00', '2026-11-05 09:00:00+00', NULL,
   '2026-11-06 02:17:00+00', 0, 230)
ON CONFLICT (id) DO NOTHING;

-- ---------------------------------------------------------------------------
-- UPLOADED LOGS (5 sample files)
-- ---------------------------------------------------------------------------
INSERT INTO uploaded_logs (
    id, incident_id, uploaded_by, original_filename, stored_filename,
    file_path, file_size_bytes, mime_type, checksum_sha256,
    status, parsed_summary, error_patterns, keyword_hits, processed_at
)
VALUES
  ('c1000000-0000-0000-0000-000000000001',
   'b1000000-0000-0000-0000-000000000001',
   'a1000000-0000-0000-0000-000000000005',
   'db-prod-01-postgresql.log',
   'c1000000-0000-0000-0000-000000000001_db-prod-01-postgresql.log',
   's3://intellidesk-logs/incidents/INC-20260001/c1000000-0000-0000-0000-000000000001_db-prod-01-postgresql.log',
   2457600, 'text/plain',
   'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
   'processed',
   'PostgreSQL primary node failed due to OOM kill at 09:12 UTC. WAL receiver disconnected 2 minutes prior. Replica was 148 WAL segments behind at time of failure.',
   '[{"pattern":"FATAL:  terminating connection due to administrator command","count":1,"severity":"fatal"},{"pattern":"LOG:  out of memory","count":3,"severity":"critical"},{"pattern":"LOG:  checkpoint starting","count":47,"severity":"info"}]',
   ARRAY['FATAL','out of memory','OOM','WAL','checkpoint','terminating'],
   '2026-10-15 09:35:00+00'),

  ('c1000000-0000-0000-0000-000000000002',
   'b1000000-0000-0000-0000-000000000003',
   'a1000000-0000-0000-0000-000000000004',
   'notification-service-pod-crash.log',
   'c1000000-0000-0000-0000-000000000002_notification-service-pod-crash.log',
   's3://intellidesk-logs/incidents/INC-20260003/c1000000-0000-0000-0000-000000000002_notification-service-pod-crash.log',
   891200, 'text/plain',
   'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3',
   'processed',
   'JVM heap exhausted at startup. Heap dump shows 78% occupied by org.apache.pdfbox.PDDocument instances. PDF library v3.0.0 introduced a known memory leak (CVE-2026-9871).',
   '[{"pattern":"java.lang.OutOfMemoryError: Java heap space","count":12,"severity":"critical"},{"pattern":"Exception in thread","count":8,"severity":"error"},{"pattern":"GC overhead limit exceeded","count":4,"severity":"warning"}]',
   ARRAY['OutOfMemoryError','Java heap','GC overhead','Exception','pdfbox','CrashLoopBackOff'],
   '2026-11-01 15:00:00+00'),

  ('c1000000-0000-0000-0000-000000000003',
   'b1000000-0000-0000-0000-000000000004',
   'a1000000-0000-0000-0000-000000000006',
   'spanning-tree-debug.log',
   'c1000000-0000-0000-0000-000000000003_spanning-tree-debug.log',
   156400, 'text/plain',
   'b14a7b8059d9c055954c92674ce60032d1a8c7e3e2bcfd7c1a3a7c9f4e9a7d1',
   'processed',
   'STP topology change detected at 03:47 UTC. SW-DC1-CORE-02 elected as root bridge but port Gi0/1 remained stuck in LISTENING state for 50 seconds causing broadcast storm. Max-age timer mismatch between PVST+ instances.',
   '[{"pattern":"STP: port Gi0/1 state LISTENING","count":1,"severity":"warning"},{"pattern":"topology change notification","count":6,"severity":"info"},{"pattern":"BPDUs received on blocked port","count":142,"severity":"error"}]',
   ARRAY['STP','spanning-tree','LISTENING','topology change','BPDU','broadcast storm'],
   '2026-10-22 04:10:00+00'),

  ('c1000000-0000-0000-0000-000000000004',
   'b1000000-0000-0000-0000-000000000009',
   'a1000000-0000-0000-0000-000000000003',
   'edr-alert-finance-ws-07.json',
   'c1000000-0000-0000-0000-000000000004_edr-alert-finance-ws-07.json',
   's3://intellidesk-logs/incidents/INC-20260009/c1000000-0000-0000-0000-000000000004_edr-alert-finance-ws-07.json',
   48300, 'application/json',
   'd4e8a2b1f9c7e3a5b8d2f4c6e8a0b2d4f6e8a0b2d4f6e8a0b2d4f6e8a0b2d4',
   'processed',
   'EDR detected ransomware-like behaviour: vssadmin delete shadows executed, mass file encryption of .docx/.xlsx files in C:\\Users\\carol.white\\Documents. Encrypted files have .LOCKED extension.',
   '[{"pattern":"vssadmin delete shadows","count":1,"severity":"critical"},{"pattern":"mass file rename","count":847,"severity":"critical"},{"pattern":"suspicious child process","count":3,"severity":"high"}]',
   ARRAY['ransomware','vssadmin','shadow copies','encryption','LOCKED','lateral movement'],
   '2026-11-05 11:20:00+00'),

  ('c1000000-0000-0000-0000-000000000005',
   'b1000000-0000-0000-0000-000000000010',
   'a1000000-0000-0000-0000-000000000005',
   'airflow-dag-analytics_warehouse_load.log',
   'c1000000-0000-0000-0000-000000000005_airflow-dag.log',
   's3://intellidesk-logs/incidents/INC-20260010/c1000000-0000-0000-0000-000000000005_airflow-dag.log',
   324100, 'text/plain',
   'f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1',
   'processed',
   'Airflow task extract_sales_data failed after 1800 s connection timeout to analytics-dw-01:5439. Redshift cluster shows elevated CPU (97%) and no available connection slots (max_connections=500, used=500).',
   '[{"pattern":"sqlalchemy.exc.OperationalError: connection timed out","count":3,"severity":"error"},{"pattern":"DAG run failed","count":1,"severity":"error"},{"pattern":"Task exceeded timeout","count":1,"severity":"warning"}]',
   ARRAY['SQLAlchemy','timeout','connection','Airflow','DAG','Redshift','max_connections'],
   '2026-11-05 07:45:00+00')
ON CONFLICT (id) DO NOTHING;

-- ---------------------------------------------------------------------------
-- HISTORICAL INCIDENTS (6 archived resolved incidents)
-- ---------------------------------------------------------------------------
INSERT INTO historical_incidents (
    id, source_incident_id, incident_number, title, description,
    root_cause, resolution_summary,
    severity, category, affected_system, affected_component, environment, tags,
    reported_at, resolved_at, resolution_time_minutes, downtime_minutes, affected_users,
    archived_by, archived_at
)
VALUES
  -- HI-001: PostgreSQL OOM (resolved - now archived)
  ('d1000000-0000-0000-0000-000000000001',
   'b1000000-0000-0000-0000-000000000001',
   'INC-20260001',
   'Primary PostgreSQL cluster unresponsive – payment service down',
   'At 09:14 UTC the payment-service health check started returning HTTP 503. PostgreSQL primary node (db-prod-01) became unresponsive due to OOM kill.',
   'PostgreSQL shared_buffers was set to 24 GB on a host with 24 GB RAM. Under peak load the OS OOM killer terminated the postgres process. Automatic failover was disabled due to a misconfiguration in Patroni (pause_on_recovery=true left from maintenance window).',
   'Increased host RAM to 32 GB. Reconfigured shared_buffers to 8 GB (25% of RAM per PostgreSQL best practice). Re-enabled automatic failover in Patroni. Manual failover to replica completed. Recovery took 109 minutes.',
   'critical', 'database', 'Payment Gateway v3.2', 'PostgreSQL Primary Node db-prod-01', 'production',
   ARRAY['postgresql','failover','payment','oom','patroni'],
   '2026-10-15 09:14:00+00', '2026-10-15 11:03:00+00', 109, 109, 4200,
   'a1000000-0000-0000-0000-000000000001', '2026-10-15 13:00:00+00'),

  -- HI-002: SSL Cert (archived)
  ('d1000000-0000-0000-0000-000000000002',
   'b1000000-0000-0000-0000-000000000002',
   'INC-20260002',
   'SSL certificate expired on api.acmecorp.com',
   'The wildcard TLS certificate for *.acmecorp.com expired causing HTTPS failures across all subdomains.',
   'The certificate renewal reminder emails were being sent to a decommissioned distribution list (devops-old@acmecorp.com). The automated cert renewal via Let''s Encrypt/certbot was disabled during a previous migration and never re-enabled.',
   'Issued emergency 90-day cert from DigiCert within 2 hours. Configured certbot with auto-renewal on the new ACME endpoint. Added cert expiry to PagerDuty monitoring with 30-day and 7-day alerts. Updated distribution list.',
   'high', 'security', 'API Gateway', 'TLS/SSL Certificate – *.acmecorp.com', 'production',
   ARRAY['ssl','certificate','tls','expiry','certbot','lets-encrypt'],
   '2026-10-18 00:05:00+00', '2026-10-18 02:14:00+00', 129, 129, 12000,
   'a1000000-0000-0000-0000-000000000001', '2026-10-18 10:00:00+00'),

  -- HI-003: Network switch
  ('d1000000-0000-0000-0000-000000000003',
   'b1000000-0000-0000-0000-000000000004',
   'INC-20260004',
   'Core switch SW-DC1-CORE-01 offline – 60% of data centre traffic dropped',
   'Core switch SW-DC1-CORE-01 power failure caused massive packet loss. Redundant switch failed to take over due to STP stuck in LISTENING state.',
   'PSU-A on SW-DC1-CORE-01 failed. Redundant PSU-B was depleted (batteries not replaced per maintenance schedule). STP max-age timer mismatch between the two core switches (15s vs 20s) caused the backup switch to remain in LISTENING state for 50 seconds during which a broadcast storm formed.',
   'Replaced both PSUs on SW-DC1-CORE-01. Harmonised STP max-age timers across both core switches. Increased RSTP priority so SW-DC1-CORE-02 is always backup root. Scheduled quarterly PSU battery checks.',
   'critical', 'network', 'Data Centre Network', 'Core Switch SW-DC1-CORE-01', 'production',
   ARRAY['switch','spanning-tree','stp','network','dc1','psu'],
   '2026-10-22 03:47:00+00', '2026-10-22 05:31:00+00', 104, 104, 1800,
   'a1000000-0000-0000-0000-000000000001', '2026-10-22 08:00:00+00'),

  -- HI-004: Redis sentinel (archived)
  ('d1000000-0000-0000-0000-000000000004',
   'b1000000-0000-0000-0000-000000000008',
   'INC-20260008',
   'Redis sentinel failover failed – session cache unavailable',
   'Redis master died after OOM kill. Sentinel cluster could not complete failover because all sentinels voted for a crashed replica.',
   'The Redis maxmemory directive was not set, allowing Redis to consume all available system RAM triggering the OOM killer. Additionally, the sentinel quorum check did not verify replica health before promoting – bug in sentinel config (sentinel down-after-milliseconds too low, causing false positives).',
   'Set Redis maxmemory to 70% of host RAM with allkeys-lru eviction policy. Increased sentinel down-after-milliseconds from 1000 ms to 5000 ms. Added pre-promotion health check script. Restored sessions from Redis replica data. Total outage 143 minutes.',
   'high', 'application', 'Session Management', 'Redis Sentinel Cluster', 'production',
   ARRAY['redis','sentinel','failover','sessions','cache','oom','maxmemory'],
   '2026-10-28 16:22:00+00', '2026-10-28 18:45:00+00', 143, 143, 8600,
   'a1000000-0000-0000-0000-000000000001', '2026-10-28 21:00:00+00'),

  -- HI-005: Older DB outage (from before current system)
  ('d1000000-0000-0000-0000-000000000005',
   NULL,
   'INC-20250874',
   'MySQL replication lag exceeded 3 hours causing stale reads on e-commerce platform',
   'MySQL read replicas fell 3+ hours behind the primary due to a long-running schema migration (ALTER TABLE on 2.1 billion row orders table).',
   'A developer ran ALTER TABLE orders ADD COLUMN discount_type VARCHAR(50) during peak traffic hours without using pt-online-schema-change or gh-ost. The blocking ALTER TABLE caused replication lag to grow to 3h 42m over 4 hours.',
   'Killed the ALTER TABLE. Used gh-ost to perform the schema change online (2.5 hours). Replicas caught up within 45 minutes. Instituted mandatory use of gh-ost for all production schema changes via pre-commit CI check.',
   'high', 'database', 'E-Commerce Platform', 'MySQL Replication', 'production',
   ARRAY['mysql','replication','alter-table','gh-ost','schema-migration'],
   '2025-11-12 14:00:00+00', '2025-11-12 20:30:00+00', 390, 0, 50000,
   'a1000000-0000-0000-0000-000000000001', '2026-01-01 00:00:00+00'),

  -- HI-006: Kubernetes OOM (older incident)
  ('d1000000-0000-0000-0000-000000000006',
   NULL,
   'INC-20251103',
   'Kubernetes node memory pressure evicted 23 pods – staging environment degraded',
   'Kubernetes node k8s-node-04 entered MemoryPressure condition and evicted 23 pods including 6 critical staging services.',
   'No resource limits were defined on the pods in the staging namespace. A test run that generated 50 GB of in-memory data consumed all 64 GB of node RAM. Node memory pressure triggered pod eviction in priority order.',
   'Defined CPU and memory requests/limits for all pods in staging namespace. Added LimitRange object to staging namespace enforcing limits. Added node memory pressure alert in Prometheus (threshold: 85%). Rescheduled evicted pods.',
   'medium', 'server', 'Kubernetes Cluster', 'k8s-node-04 / Staging Namespace', 'staging',
   ARRAY['kubernetes','memory-pressure','eviction','resource-limits','oom'],
   '2025-12-05 09:00:00+00', '2025-12-05 12:30:00+00', 210, 0, 0,
   'a1000000-0000-0000-0000-000000000001', '2026-01-01 00:00:00+00')
ON CONFLICT (id) DO NOTHING;

-- ---------------------------------------------------------------------------
-- VERIFIED SOLUTIONS (6 actionable playbooks)
-- ---------------------------------------------------------------------------
INSERT INTO verified_solutions (
    id, historical_id, incident_id, title, problem_statement, root_cause, solution_steps,
    prerequisites, post_actions, category, severity, affected_systems, tags,
    verified_by, verified_at, is_active, success_rate, times_applied, times_succeeded,
    kb_article_url, related_runbook_url, created_by
)
VALUES
  -- SOL-001: PostgreSQL OOM / Patroni failover
  ('e1000000-0000-0000-0000-000000000001',
   'd1000000-0000-0000-0000-000000000001',
   'b1000000-0000-0000-0000-000000000001',
   'PostgreSQL OOM Recovery & Patroni Failover Playbook',
   'PostgreSQL primary node terminated by OS OOM killer; automatic Patroni failover did not trigger; payment processing unavailable.',
   'shared_buffers over-allocated relative to available RAM; Patroni pause_on_recovery=true left enabled after maintenance.',
   '[
     {"step_number":1,"action":"Verify OOM kill: sudo dmesg | grep -i oom | tail -20","expected_result":"Confirms postgres process killed by kernel OOM killer","command":"sudo dmesg | grep -i oom | tail -20"},
     {"step_number":2,"action":"Check Patroni cluster status","expected_result":"Shows primary/replica state and pause flag","command":"patronictl -c /etc/patroni/patroni.yml list"},
     {"step_number":3,"action":"If pause_on_recovery=true, resume Patroni","expected_result":"Patroni resumes monitoring","command":"patronictl -c /etc/patroni/patroni.yml resume"},
     {"step_number":4,"action":"Trigger manual failover to healthy replica","expected_result":"Replica promoted to primary","command":"patronictl -c /etc/patroni/patroni.yml failover --master db-prod-01 --candidate db-prod-02 --force"},
     {"step_number":5,"action":"Adjust shared_buffers to 25% of host RAM in postgresql.conf and restart","expected_result":"PostgreSQL restarts with safe memory allocation","command":"sed -i \"s/shared_buffers.*/shared_buffers = 8GB/\" /etc/postgresql/15/main/postgresql.conf && systemctl restart postgresql"},
     {"step_number":6,"action":"Verify replication lag on new replica","expected_result":"Lag < 10 MB within 5 minutes","command":"psql -c \"SELECT client_addr, state, sent_lsn - replay_lsn AS lag_bytes FROM pg_stat_replication;\""},
     {"step_number":7,"action":"Confirm payment service health","expected_result":"HTTP 200 from /health endpoint","command":"curl -s https://api.acmecorp.com/payments/health | jq .status"}
   ]',
   'SSH access to database hosts; Patroni credentials; PostgreSQL superuser access; on-call SRE availability.',
   'Create post-mortem ticket. Update Patroni config to remove pause_on_recovery. Verify monitoring alert for shared_buffers > 30% of RAM. Run load test within 72 hours.',
   'database', 'critical',
   ARRAY['Payment Gateway','Order Management System'],
   ARRAY['postgresql','patroni','oom','failover','shared_buffers'],
   'a1000000-0000-0000-0000-000000000001', '2026-10-16 10:00:00+00',
   TRUE, 94.00, 17, 16,
   'https://kb.intellidesk.local/articles/DB-001-postgresql-oom-patroni',
   'https://runbooks.intellidesk.local/db/patroni-failover',
   'a1000000-0000-0000-0000-000000000005'),

  -- SOL-002: SSL Certificate Renewal
  ('e1000000-0000-0000-0000-000000000002',
   'd1000000-0000-0000-0000-000000000002',
   'b1000000-0000-0000-0000-000000000002',
   'Emergency TLS/SSL Certificate Renewal Playbook',
   'Production TLS certificate expired causing HTTPS failures and browser security warnings across all subdomains.',
   'Certificate auto-renewal disabled; renewal alerts sent to decommissioned email list.',
   '[
     {"step_number":1,"action":"Confirm expiry: check certificate dates","expected_result":"Certificate shows expired date","command":"echo | openssl s_client -connect api.acmecorp.com:443 2>/dev/null | openssl x509 -noout -dates"},
     {"step_number":2,"action":"Request emergency certificate from CA (DigiCert/Let''s Encrypt)","expected_result":"New certificate PEM files received","command":"certbot certonly --dns-cloudflare -d *.acmecorp.com -d acmecorp.com"},
     {"step_number":3,"action":"Deploy new certificate to load balancer","expected_result":"New cert deployed without traffic interruption","command":"aws acm import-certificate --certificate file://cert.pem --private-key file://key.pem --certificate-chain file://chain.pem"},
     {"step_number":4,"action":"Verify new certificate from external IP","expected_result":"Certificate valid with correct expiry","command":"echo | openssl s_client -connect api.acmecorp.com:443 2>/dev/null | openssl x509 -noout -dates -subject"},
     {"step_number":5,"action":"Flush CDN edge caches to propagate new cert","expected_result":"All CDN PoPs serving new certificate","command":"aws cloudfront create-invalidation --distribution-id EDFDVBD6EXAMPLE --paths \"/*\""},
     {"step_number":6,"action":"Enable certbot auto-renewal and test","expected_result":"Renewal scheduled in cron; dry-run succeeds","command":"systemctl enable certbot.timer && certbot renew --dry-run"},
     {"step_number":7,"action":"Add monitoring alert for cert expiry < 30 days","expected_result":"PagerDuty alert configured","command":"# Configure via monitoring platform UI or Terraform"}
   ]',
   'DNS write access; CA account credentials; Load balancer / CDN admin access; Certbot installed.',
   'Update distribution list for cert alerts. Document renewal procedure. Enable auto-renewal. Schedule 6-monthly audit of all certificates.',
   'security', 'high',
   ARRAY['API Gateway','Authentication Service','All HTTPS services'],
   ARRAY['ssl','tls','certificate','certbot','renewal','lets-encrypt'],
   'a1000000-0000-0000-0000-000000000001', '2026-10-19 09:00:00+00',
   TRUE, 100.00, 8, 8,
   'https://kb.intellidesk.local/articles/SEC-002-ssl-certificate-renewal',
   'https://runbooks.intellidesk.local/security/cert-renewal',
   'a1000000-0000-0000-0000-000000000003'),

  -- SOL-003: Kubernetes CrashLoopBackOff / OOM
  ('e1000000-0000-0000-0000-000000000003',
   'd1000000-0000-0000-0000-000000000006',
   NULL,
   'Kubernetes Pod CrashLoopBackOff – JVM OutOfMemoryError Resolution',
   'Kubernetes pods in CrashLoopBackOff state due to JVM OutOfMemoryError; deployment cannot stabilise.',
   'JVM heap limits not aligned with Kubernetes memory limits; memory leak in third-party library.',
   '[
     {"step_number":1,"action":"Identify crashing pods","expected_result":"List of pods in CrashLoopBackOff","command":"kubectl get pods -n production | grep CrashLoopBackOff"},
     {"step_number":2,"action":"Get crash logs from last container instance","expected_result":"OOM stack trace visible","command":"kubectl logs -n production <pod-name> --previous | tail -100"},
     {"step_number":3,"action":"Immediate: rollback to previous stable version","expected_result":"Deployment rolls back; pods stabilise","command":"kubectl rollout undo deployment/notification-service -n production"},
     {"step_number":4,"action":"Verify rollback success","expected_result":"All pods Running 1/1","command":"kubectl rollout status deployment/notification-service -n production"},
     {"step_number":5,"action":"Analyse heap dump for memory leak (non-urgent)","expected_result":"Identify leaking class","command":"kubectl exec -n production <pod-name> -- jmap -dump:format=b,file=/tmp/heap.hprof 1 && kubectl cp <pod-name>:/tmp/heap.hprof ./heap.hprof"},
     {"step_number":6,"action":"If proceeding with current version: increase JVM heap and pod memory limit","expected_result":"Pods start successfully","command":"kubectl set env deployment/notification-service JAVA_OPTS=\"-Xms512m -Xmx2g\" -n production"},
     {"step_number":7,"action":"Set Kubernetes resource limits","expected_result":"Limits applied to prevent node pressure","command":"kubectl patch deployment notification-service -n production -p ''{\"spec\":{\"template\":{\"spec\":{\"containers\":[{\"name\":\"notification-service\",\"resources\":{\"requests\":{\"memory\":\"1Gi\"},\"limits\":{\"memory\":\"2Gi\"}}}]}}}}''"}
   ]',
   'kubectl access with deployment edit rights; docker registry access for rollback; JVM heap dump tools.',
   'File bug report against third-party library. Conduct root cause analysis of memory leak. Add JVM memory monitoring to Grafana dashboards.',
   'application', 'medium',
   ARRAY['All Java/JVM Kubernetes Services'],
   ARRAY['kubernetes','jvm','oom','crashloopbackoff','heap','rollback'],
   'a1000000-0000-0000-0000-000000000001', '2026-11-02 11:00:00+00',
   TRUE, 88.00, 25, 22,
   'https://kb.intellidesk.local/articles/APP-003-kubernetes-jvm-oom',
   'https://runbooks.intellidesk.local/k8s/crashloopbackoff',
   'a1000000-0000-0000-0000-000000000004'),

  -- SOL-004: Redis sentinel failover fix
  ('e1000000-0000-0000-0000-000000000004',
   'd1000000-0000-0000-0000-000000000004',
   'b1000000-0000-0000-0000-000000000008',
   'Redis Sentinel Failover Failure – Recovery & Hardening',
   'Redis master killed by OOM; Sentinel cluster failed to promote a healthy replica; session cache unavailable.',
   'maxmemory not configured; sentinel down-after-milliseconds too low causing false positives; no pre-promotion health check.',
   '[
     {"step_number":1,"action":"Identify healthy Redis replicas","expected_result":"At least one replica with rdb_last_bgsave_status=ok","command":"redis-cli -h cache-prod-02 INFO replication | grep -E ''role|master_link_status|slave_repl_offset''"},
     {"step_number":2,"action":"Manually promote healthy replica to master","expected_result":"Replica becomes master","command":"redis-cli -h cache-prod-02 REPLICAOF NO ONE"},
     {"step_number":3,"action":"Update sentinel config to point to new master","expected_result":"Sentinels acknowledge new master","command":"redis-cli -h sentinel-01 -p 26379 SENTINEL RESET mymaster"},
     {"step_number":4,"action":"Restart application session layer to reconnect","expected_result":"Application reconnects to new Redis master","command":"kubectl rollout restart deployment/session-service -n production"},
     {"step_number":5,"action":"Set maxmemory on all Redis nodes","expected_result":"Redis evicts keys before OOM","command":"redis-cli CONFIG SET maxmemory 70gb && redis-cli CONFIG SET maxmemory-policy allkeys-lru && redis-cli CONFIG REWRITE"},
     {"step_number":6,"action":"Update sentinel down-after-milliseconds to 5000","expected_result":"Sentinel tolerates brief network hiccups","command":"# Edit /etc/redis/sentinel.conf: sentinel down-after-milliseconds mymaster 5000"},
     {"step_number":7,"action":"Test failover in staging","expected_result":"Automatic failover completes < 30 seconds","command":"redis-cli -h cache-staging-01 DEBUG SLEEP 10"}
   ]',
   'SSH/CLI access to all Redis nodes and sentinels; application deployment access.',
   'Update Redis maxmemory across all environments. Document sentinel failover procedure. Add Redis memory usage alert at 70% threshold.',
   'application', 'high',
   ARRAY['Session Management','User Authentication','All Redis-dependent services'],
   ARRAY['redis','sentinel','failover','maxmemory','sessions','lru'],
   'a1000000-0000-0000-0000-000000000001', '2026-10-29 10:00:00+00',
   TRUE, 91.00, 11, 10,
   'https://kb.intellidesk.local/articles/APP-004-redis-sentinel-failover',
   'https://runbooks.intellidesk.local/cache/redis-failover',
   'a1000000-0000-0000-0000-000000000005'),

  -- SOL-005: Disk space / Log rotation
  ('e1000000-0000-0000-0000-000000000005',
   NULL,
   NULL,
   'Emergency Disk Space Recovery – Log Partition',
   'Log partition near capacity (>90%) risking service crash or write failures.',
   'Log verbosity increased for debugging and not reverted; log rotation frequency insufficient for increased log volume.',
   '[
     {"step_number":1,"action":"Check disk usage breakdown","expected_result":"Identify largest directories","command":"du -sh /var/log/* | sort -rh | head -20"},
     {"step_number":2,"action":"Identify log files older than 7 days and compress","expected_result":"Freed space visible in df -h","command":"find /var/log -name ''*.log'' -mtime +7 -exec gzip -9 {} \\;"},
     {"step_number":3,"action":"Delete compressed logs older than 30 days","expected_result":"Significant space freed","command":"find /var/log -name ''*.gz'' -mtime +30 -delete"},
     {"step_number":4,"action":"Revert log verbosity to INFO level","expected_result":"Log generation rate drops","command":"# Service-specific: e.g., sed -i ''s/LOG_LEVEL=DEBUG/LOG_LEVEL=INFO/'' /etc/app/config.env && systemctl reload app"},
     {"step_number":5,"action":"Force logrotate run","expected_result":"Current logs rotated immediately","command":"logrotate -f /etc/logrotate.conf"},
     {"step_number":6,"action":"Verify disk below 80%","expected_result":"df shows partition < 80%","command":"df -h /var/log"},
     {"step_number":7,"action":"Increase logrotate rotate count or decrease interval","expected_result":"Updated logrotate.d config applied","command":"# Edit /etc/logrotate.d/<service>: rotate 7 → rotate 3 OR daily → hourly"}
   ]',
   'SSH access to affected server; sudo/root access; knowledge of which services generate logs on the partition.',
   'Monitor disk usage trend for 48 hours. Set Prometheus alert at 80% disk usage. Review and document log rotation policy for all services.',
   'server', 'medium',
   ARRAY['All Linux servers'],
   ARRAY['disk','storage','logs','logrotate','cleanup'],
   'a1000000-0000-0000-0000-000000000001', '2026-09-01 10:00:00+00',
   TRUE, 97.00, 34, 33,
   'https://kb.intellidesk.local/articles/SRV-005-disk-space-recovery',
   'https://runbooks.intellidesk.local/server/disk-cleanup',
   'a1000000-0000-0000-0000-000000000006'),

  -- SOL-006: Airflow / DB connection exhaustion
  ('e1000000-0000-0000-0000-000000000006',
   NULL,
   'b1000000-0000-0000-0000-000000000010',
   'Airflow ETL Failure – Database Connection Exhaustion Recovery',
   'Airflow DAG fails with SQLAlchemy connection timeout; target database at max_connections limit.',
   'Airflow worker pool too large relative to database max_connections; connection pool not configured; long-running queries holding connections.',
   '[
     {"step_number":1,"action":"Check active connections on target database","expected_result":"max_connections reached or near limit","command":"psql -h analytics-dw-01 -U admin -c \"SELECT count(*), state FROM pg_stat_activity GROUP BY state;\""},
     {"step_number":2,"action":"Identify and kill idle/long-running blocking queries","expected_result":"Active connections drop","command":"psql -h analytics-dw-01 -U admin -c \"SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE state = ''idle'' AND query_start < NOW() - INTERVAL ''10 minutes'';\""},
     {"step_number":3,"action":"If connection limit exceeded, temporarily increase max_connections","expected_result":"New connections accepted (requires restart)","command":"# Edit postgresql.conf: max_connections = 600 then: sudo systemctl restart postgresql"},
     {"step_number":4,"action":"Configure PgBouncer connection pooling in front of database","expected_result":"Airflow connects via pooler, reducing direct connections","command":"# Install and configure PgBouncer; point Airflow connection string to pgbouncer:5432"},
     {"step_number":5,"action":"Reduce Airflow parallelism and pool size","expected_result":"Fewer concurrent DB connections","command":"# airflow.cfg: parallelism = 32 → 16; db_connection_pool_size = 50 → 20"},
     {"step_number":6,"action":"Manually trigger failed DAG run after connections freed","expected_result":"DAG completes successfully","command":"airflow dags trigger analytics_warehouse_load --run-id manual_recovery_$(date +%Y%m%d%H%M)"},
     {"step_number":7,"action":"Verify downstream BI dashboards refreshed","expected_result":"Dashboards show today''s data","command":"# Check BI tool or query: SELECT MAX(created_at) FROM analytics.sales_facts;"}
   ]',
   'Database admin credentials; Airflow admin access; PgBouncer installation (optional); infrastructure access.',
   'Set up PgBouncer in production. Add database connection monitoring alert at 80% of max_connections. Tune Airflow parallelism per DAG. Schedule daily connection audit.',
   'database', 'medium',
   ARRAY['Analytics Warehouse','All Airflow DAGs','BI Dashboards'],
   ARRAY['airflow','etl','postgresql','connections','pgbouncer','pooling','timeout'],
   'a1000000-0000-0000-0000-000000000001', '2026-11-05 10:00:00+00',
   TRUE, 86.00, 7, 6,
   'https://kb.intellidesk.local/articles/DB-006-airflow-connection-exhaustion',
   'https://runbooks.intellidesk.local/db/connection-pooling',
   'a1000000-0000-0000-0000-000000000005')
ON CONFLICT (id) DO NOTHING;

-- ---------------------------------------------------------------------------
-- INCIDENT RELATIONSHIPS (5 connections)
-- ---------------------------------------------------------------------------
INSERT INTO incident_relationships (
    id, source_incident_id, target_incident_id, relationship_type,
    confidence_score, is_ai_generated, notes, created_by
)
VALUES
  -- INC-005 (memory leak) caused INC-003 (JVM OOM) – both performance/memory issues
  ('f1000000-0000-0000-0000-000000000001',
   'b1000000-0000-0000-0000-000000000005',
   'b1000000-0000-0000-0000-000000000003',
   'related', 76.50, TRUE,
   'AI detected shared pattern: JVM heap exhaustion. Both incidents involve memory management failures in Java services on the same cluster.',
   NULL),

  -- INC-001 (DB outage) caused INC-010 (ETL failure) – payment DB unavailability cascaded
  ('f1000000-0000-0000-0000-000000000002',
   'b1000000-0000-0000-0000-000000000001',
   'b1000000-0000-0000-0000-000000000010',
   'caused_by', 61.00, TRUE,
   'AI suspects DB instability during INC-20260001 may have seeded connection pool exhaustion issues that surfaced later in the ETL pipeline.',
   NULL),

  -- INC-006 (disk) blocks INC-003 (pod crash) – log analysis blocked by disk space
  ('f1000000-0000-0000-0000-000000000003',
   'b1000000-0000-0000-0000-000000000006',
   'b1000000-0000-0000-0000-000000000003',
   'blocked_by', NULL, FALSE,
   'Manual link: Unable to collect heap dump for INC-20260003 analysis because log-agg-02 disk is full (INC-20260006). Resolve disk incident first.',
   'a1000000-0000-0000-0000-000000000004'),

  -- INC-004 (switch) related to INC-001 (DB) – network outage caused DB replication lag
  ('f1000000-0000-0000-0000-000000000004',
   'b1000000-0000-0000-0000-000000000004',
   'b1000000-0000-0000-0000-000000000001',
   'related', 55.00, TRUE,
   'AI: Both incidents occurred within the same 7-day window and affected overlapping services. Network instability (INC-20260004) may have contributed to Patroni sentinel timeouts.',
   NULL),

  -- INC-009 (ransomware) related to INC-007 (stale tokens) – security posture
  ('f1000000-0000-0000-0000-000000000005',
   'b1000000-0000-0000-0000-000000000009',
   'b1000000-0000-0000-0000-000000000007',
   'related', 42.00, TRUE,
   'AI: Stale service account tokens (INC-20260007) represent a security hygiene gap consistent with the broader security posture issues indicated by the ransomware event (INC-20260009).',
   NULL)
ON CONFLICT (id) DO NOTHING;

-- ---------------------------------------------------------------------------
-- AI RECOMMENDATIONS (6 recommendations across incidents)
-- ---------------------------------------------------------------------------
INSERT INTO ai_recommendations (
    id, incident_id, verified_solution_id, historical_incident_id,
    recommendation_title, recommendation_text, suggested_actions,
    model_name, model_version, confidence_score, confidence_level,
    similarity_score, reasoning, prompt_tokens, completion_tokens,
    was_applied, was_helpful, feedback_notes, feedback_given_by
)
VALUES
  -- REC-001: For INC-001 (DB outage) → SOL-001
  ('g1000000-0000-0000-0000-000000000001',
   'b1000000-0000-0000-0000-000000000001',
   'e1000000-0000-0000-0000-000000000001',
   'd1000000-0000-0000-0000-000000000001',
   'Execute Patroni Failover Playbook – PostgreSQL OOM Recovery',
   'This incident matches INC-20260001 (archived) with 94% similarity. The PostgreSQL primary node has been terminated by the OOM killer – the same failure mode as the October 15 outage. The verified solution (KB: DB-001) achieved successful recovery in 109 minutes. Immediate action: resume Patroni and trigger manual failover to db-prod-02.',
   '[
     {"step":1,"action":"Run: patronictl list to confirm cluster state","urgency":"immediate"},
     {"step":2,"action":"Execute: patronictl resume to disable pause_on_recovery","urgency":"immediate"},
     {"step":3,"action":"Trigger failover: patronictl failover --master db-prod-01 --candidate db-prod-02 --force","urgency":"immediate"},
     {"step":4,"action":"Adjust shared_buffers to 8GB after recovery","urgency":"post-recovery"}
   ]',
   'intellidesk-llm-v2', '2.1.0',
   94.00, 'very_high', 94.00,
   'Semantic similarity to historical incident HI-001 (INC-20260001): 94%. Matched patterns: OOM kill + PostgreSQL + Patroni + payment service. The solution was applied successfully 16/17 times (94% success rate).',
   1247, 389,
   TRUE, TRUE,
   'Followed playbook exactly. Failover completed in 112 minutes. Very accurate recommendation.',
   'a1000000-0000-0000-0000-000000000005'),

  -- REC-002: For INC-002 (SSL cert) → SOL-002
  ('g1000000-0000-0000-0000-000000000002',
   'b1000000-0000-0000-0000-000000000002',
   'e1000000-0000-0000-0000-000000000002',
   'd1000000-0000-0000-0000-000000000002',
   'Emergency TLS Certificate Renewal – All Subdomains Affected',
   'Certificate expiry detected on *.acmecorp.com. This is an exact match to the archived incident INC-20260002 (100% solution success rate). The verified playbook covers emergency certificate issuance via certbot and DigiCert, CDN cache invalidation, and auto-renewal setup. Expected resolution: 2–3 hours.',
   '[
     {"step":1,"action":"Verify expiry: openssl s_client -connect api.acmecorp.com:443","urgency":"immediate"},
     {"step":2,"action":"Request emergency cert: certbot certonly --dns-cloudflare -d *.acmecorp.com","urgency":"immediate"},
     {"step":3,"action":"Deploy to load balancer via AWS ACM","urgency":"immediate"},
     {"step":4,"action":"Invalidate CDN cache post-deployment","urgency":"immediate"},
     {"step":5,"action":"Enable certbot auto-renewal timer","urgency":"post-recovery"}
   ]',
   'intellidesk-llm-v2', '2.1.0',
   97.50, 'very_high', 100.00,
   'Exact match to HI-002 (INC-20260002): SSL wildcard certificate expiry. Verified solution has 100% success rate over 8 applications.',
   891, 312,
   TRUE, TRUE,
   'Exact match. Certificate renewed within 2.5 hours using the runbook.',
   'a1000000-0000-0000-0000-000000000004'),

  -- REC-003: For INC-003 (K8s crash loop) → SOL-003
  ('g1000000-0000-0000-0000-000000000003',
   'b1000000-0000-0000-0000-000000000003',
   'e1000000-0000-0000-0000-000000000003',
   'd1000000-0000-0000-0000-000000000006',
   'Kubernetes Rollback & JVM Heap Tuning for CrashLoopBackOff',
   'Three of five notification-service pods are in CrashLoopBackOff with java.lang.OutOfMemoryError. This matches the Kubernetes JVM OOM pattern seen in HI-006 (INC-20251103, staging) with 78% similarity. Recommended immediate action: rollback to v2.4.0, then investigate heap dump for the PDFBox memory leak reported in CVE-2026-9871.',
   '[
     {"step":1,"action":"Rollback: kubectl rollout undo deployment/notification-service -n production","urgency":"immediate"},
     {"step":2,"action":"Verify pods recover: kubectl rollout status deployment/notification-service","urgency":"immediate"},
     {"step":3,"action":"Collect heap dump from a surviving pod for analysis","urgency":"post-stabilise"},
     {"step":4,"action":"Upgrade or replace PDFBox with a patched version before re-deploying v2.4.1","urgency":"pre-redeploy"}
   ]',
   'intellidesk-llm-v2', '2.1.0',
   82.00, 'high', 78.00,
   'Pattern match: JVM OutOfMemoryError in Kubernetes pod at startup post-deploy. Log analysis identified PDFBox as probable cause (matches CVE-2026-9871). Rollback is the safest immediate mitigation.',
   1105, 441,
   FALSE, NULL, NULL, NULL),

  -- REC-004: For INC-005 (memory leak) → SOL-003 (related)
  ('g1000000-0000-0000-0000-000000000004',
   'b1000000-0000-0000-0000-000000000005',
   'e1000000-0000-0000-0000-000000000003',
   NULL,
   'Memory Leak Investigation – Restart Worker and Profile Heap',
   'The reporting-service has exhibited a steady memory growth pattern over 72 hours, typical of an object reference leak. No historical exact match, but the JVM OOM resolution playbook is relevant. Recommended: collect heap dumps at 2-hour intervals, restart the PDF export worker to buy time, and profile using Eclipse MAT or VisualVM.',
   '[
     {"step":1,"action":"Restart PDF export worker to prevent OOM kill: kubectl rollout restart deployment/reporting-service -n production","urgency":"immediate"},
     {"step":2,"action":"Increase pod memory limit to 16Gi as temporary headroom","urgency":"immediate"},
     {"step":3,"action":"Enable heap dump on OOM: add -XX:+HeapDumpOnOutOfMemoryError -XX:HeapDumpPath=/tmp/heap.hprof to JAVA_OPTS","urgency":"next-deploy"},
     {"step":4,"action":"Collect and analyse heap dump with Eclipse MAT","urgency":"investigation"},
     {"step":5,"action":"Identify PDFBox or other library causing object retention","urgency":"investigation"}
   ]',
   'intellidesk-llm-v2', '2.1.0',
   67.50, 'medium', 55.00,
   'No exact historical match. Memory growth pattern matches known JVM leak signatures. PDF export library added in v5.1.0 is the most likely candidate based on INC-20260003 log analysis (c1000000-0000-0000-0000-000000000002).',
   978, 367,
   FALSE, NULL, NULL, NULL),

  -- REC-005: For INC-006 (disk) → SOL-005
  ('g1000000-0000-0000-0000-000000000005',
   'b1000000-0000-0000-0000-000000000006',
   'e1000000-0000-0000-0000-000000000005',
   NULL,
   'Emergency Disk Space Recovery – Compress and Rotate Logs on log-agg-02',
   'Disk partition /var/log on log-agg-02 is at 94% (380 GB / 400 GB). The disk recovery playbook (SOL-005) has a 97% success rate across 34 applications. Immediate actions will free approximately 60–100 GB within 15 minutes. Verbosity revert will prevent recurrence.',
   '[
     {"step":1,"action":"SSH to log-agg-02 and run: du -sh /var/log/* | sort -rh | head -20","urgency":"immediate"},
     {"step":2,"action":"Compress logs older than 7 days: find /var/log -name ''*.log'' -mtime +7 -exec gzip -9 {} \\;","urgency":"immediate"},
     {"step":3,"action":"Delete .gz files older than 30 days","urgency":"immediate"},
     {"step":4,"action":"Revert log verbosity to INFO in all services writing to this partition","urgency":"immediate"},
     {"step":5,"action":"Run: logrotate -f /etc/logrotate.conf","urgency":"immediate"}
   ]',
   'intellidesk-llm-v2', '2.1.0',
   96.00, 'very_high', 97.00,
   'Near-exact match to disk space pattern. Solution SOL-005 has 97% success rate. Log verbosity flag in INC-20260006 description confirms the same root cause pattern.',
   756, 298,
   FALSE, NULL, NULL, NULL),

  -- REC-006: For INC-010 (ETL) → SOL-006
  ('g1000000-0000-0000-0000-000000000006',
   'b1000000-0000-0000-0000-000000000010',
   'e1000000-0000-0000-0000-000000000006',
   NULL,
   'Airflow ETL Recovery – Free Database Connections and Rerun DAG',
   'The Airflow DAG failure is caused by connection exhaustion on the analytics warehouse (max_connections=500 reached). The verified solution covers immediate connection recovery, PgBouncer setup, and Airflow parallelism tuning. Estimated ETL rerun time: 45–90 minutes after connections are freed.',
   '[
     {"step":1,"action":"Kill idle connections on analytics-dw-01 older than 10 minutes","urgency":"immediate"},
     {"step":2,"action":"Temporarily increase max_connections to 600 if needed","urgency":"conditional"},
     {"step":3,"action":"Reduce Airflow parallelism to 16 and pool size to 20","urgency":"immediate"},
     {"step":4,"action":"Trigger manual DAG run: airflow dags trigger analytics_warehouse_load","urgency":"post-fix"},
     {"step":5,"action":"Install PgBouncer as a medium-term fix","urgency":"this-week"}
   ]',
   'intellidesk-llm-v2', '2.1.0',
   88.50, 'high', 86.00,
   'Connection exhaustion pattern matches SOL-006. Log analysis (c1000000-0000-0000-0000-000000000005) confirms SQLAlchemy timeout to analytics-dw-01. Solution has 86% success rate.',
   1034, 421,
   TRUE, TRUE,
   'Followed steps 1-4. DAG completed successfully in 68 minutes after freeing connections.',
   'a1000000-0000-0000-0000-000000000005')
ON CONFLICT (id) DO NOTHING;

-- ---------------------------------------------------------------------------
-- INCIDENT COMMENTS (sample discussion threads)
-- ---------------------------------------------------------------------------
INSERT INTO incident_comments (id, incident_id, author_id, body, is_internal)
VALUES
  ('h1000000-0000-0000-0000-000000000001',
   'b1000000-0000-0000-0000-000000000001',
   'a1000000-0000-0000-0000-000000000005',
   'Confirmed: db-prod-01 OOM killed by kernel at 09:12 UTC. `dmesg` shows postgres process (PID 23847) killed. Beginning Patroni failover procedure per KB DB-001.',
   TRUE),

  ('h1000000-0000-0000-0000-000000000002',
   'b1000000-0000-0000-0000-000000000001',
   'a1000000-0000-0000-0000-000000000005',
   'Failover to db-prod-02 completed at 10:48 UTC. Payment service health check returning 200. Replication lag from new primary is 2 MB – within acceptable range. Monitoring for 15 minutes before marking resolved.',
   FALSE),

  ('h1000000-0000-0000-0000-000000000003',
   'b1000000-0000-0000-0000-000000000003',
   'a1000000-0000-0000-0000-000000000004',
   'INTERNAL: Suspect PDFBox 3.0.0 memory leak. Stack trace shows org.apache.pdfbox.pdmodel.PDDocument instances not being closed after PDF generation. This matches CVE-2026-9871. Will raise with the app team to either downgrade to 2.0.30 or patch.',
   TRUE),

  ('h1000000-0000-0000-0000-000000000004',
   'b1000000-0000-0000-0000-000000000009',
   'a1000000-0000-0000-0000-000000000003',
   'CRITICAL: Workstation isolated. Contacting incident response team and legal as per IRP-SEC-001. Forensic image of the drive is being taken. No confirmed lateral movement yet but scanning all finance network shares now.',
   TRUE),

  ('h1000000-0000-0000-0000-000000000005',
   'b1000000-0000-0000-0000-000000000006',
   'a1000000-0000-0000-0000-000000000006',
   'Acknowledged. Connecting to log-agg-02 now. Will begin emergency log compression as per AI recommendation (96% confidence). ETA 20 minutes to get disk below 80%.',
   FALSE)
ON CONFLICT (id) DO NOTHING;

COMMIT;
