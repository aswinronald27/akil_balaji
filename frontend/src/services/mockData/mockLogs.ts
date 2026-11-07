import { LogAnalysis } from '../../types';

export const mockLogAnalysisResult: LogAnalysis = {
  id: 'LOG-ANALYSIS-2024-889',
  fileName: 'billing-service-production-2026-11-04.log',
  fileSize: '4.8 MB',
  uploadedAt: '2026-11-04T16:44:20Z',
  totalLines: 14820,
  errorCount: 642,
  warningCount: 1184,
  anomalyScore: 88,
  redactedItemsCount: 47,
  service: 'Billing Service',
  incidentId: 'INC-2024-1042',
  topErrors: [
    {
      error: 'FATAL: remaining connection slots are reserved for non-replication superuser connections',
      count: 382,
      firstSeen: '16:39:48',
      lastSeen: '16:44:12',
      stackTrace: `org.postgresql.util.PSQLException: FATAL: 53300: remaining connection slots are reserved for non-replication superuser connections
	at org.postgresql.core.v3.ConnectionFactoryImpl.openConnectionImpl(ConnectionFactoryImpl.java:317)
	at com.zaxxer.hikari.pool.HikariPool.createPoolEntry(HikariPool.java:470)
	at com.zaxxer.hikari.pool.HikariPool.checkFailFast(HikariPool.java:561)
	at com.zaxxer.hikari.pool.HikariPool.<init>(HikariPool.java:115)`,
    },
    {
      error: 'HikariPool-1 - Connection is not available, request timed out after 30005ms',
      count: 214,
      firstSeen: '16:40:02',
      lastSeen: '16:44:19',
      stackTrace: `java.sql.SQLTransientConnectionException: HikariPool-1 - Connection is not available, request timed out after 30005ms.
	at com.zaxxer.hikari.pool.HikariPool.getConnection(HikariPool.java:217)
	at com.zaxxer.hikari.HikariDataSource.getConnection(HikariDataSource.java:128)
	at com.enterprise.billing.service.TransactionSessionManager.acquireConnection(TransactionSessionManager.java:84)`,
    },
    {
      error: 'HTTP 500 InternalServerError on POST /v2/invoices/process',
      count: 46,
      firstSeen: '16:40:15',
      lastSeen: '16:44:05',
    },
  ],
  timeSeriesData: [
    { timestamp: '16:30', errors: 2, warnings: 12, info: 1400 },
    { timestamp: '16:33', errors: 4, warnings: 15, info: 1520 },
    { timestamp: '16:36', errors: 3, warnings: 18, info: 1480 },
    { timestamp: '16:38', errors: 12, warnings: 45, info: 1610 },
    { timestamp: '16:39', errors: 84, warnings: 190, info: 1240 },
    { timestamp: '16:40', errors: 240, warnings: 320, info: 980 },
    { timestamp: '16:41', errors: 185, warnings: 280, info: 760 },
    { timestamp: '16:42', errors: 65, warnings: 194, info: 890 },
    { timestamp: '16:43', errors: 38, warnings: 98, info: 1100 },
    { timestamp: '16:44', errors: 12, warnings: 24, info: 1350 },
  ],
  parsedEvents: [
    {
      id: 'EVT-101',
      timestamp: '2026-11-04 16:38:12.014',
      level: 'INFO',
      service: 'Billing Service',
      message: 'Container initialized billing-service:v2.4.1 [Spring Boot 3.2.4]',
      rawLine: '2026-11-04 16:38:12.014 INFO  [main] c.e.b.BillingApplication: Started BillingApplication in 3.41 seconds',
    },
    {
      id: 'EVT-102',
      timestamp: '2026-11-04 16:38:45.320',
      level: 'INFO',
      service: 'Billing Service',
      message: 'Received batch invoice settlement trigger for 12,500 pending records',
      rawLine: '2026-11-04 16:38:45.320 INFO  [batch-scheduler-1] c.e.b.s.BatchInvoiceRunner: Starting execution with concurrency=24',
    },
    {
      id: 'EVT-103',
      timestamp: '2026-11-04 16:39:18.990',
      level: 'WARN',
      service: 'Billing Service',
      message: 'HikariPool-1 pool usage reached 85% (425/500 active leases)',
      rawLine: '2026-11-04 16:39:18.990 WARN  [HikariPool-1 housekeeper] c.z.h.p.HikariPool: Pool usage warning: active=425, idle=75, waiting=14',
    },
    {
      id: 'EVT-104',
      timestamp: '2026-11-04 16:39:48.102',
      level: 'FATAL',
      service: 'Billing Service',
      message: 'FATAL: remaining connection slots are reserved for non-replication superuser connections (auth: [REDACTED_API_TOKEN])',
      rawLine: '2026-11-04 16:39:48.102 FATAL [billing-worker-7] org.postgresql.Driver: FATAL: remaining connection slots are reserved for non-replication superuser connections; client_token=[REDACTED_API_TOKEN]',
      isRedacted: true,
    },
    {
      id: 'EVT-105',
      timestamp: '2026-11-04 16:40:02.481',
      level: 'ERROR',
      service: 'Billing Service',
      message: 'HikariPool-1 - Connection is not available, request timed out after 30005ms',
      rawLine: '2026-11-04 16:40:02.481 ERROR [HikariPool-1 housekeeper] c.z.h.p.HikariPool: HikariPool-1 - Connection is not available, request timed out after 30005ms',
    },
    {
      id: 'EVT-106',
      timestamp: '2026-11-04 16:40:15.890',
      level: 'ERROR',
      service: 'Billing Service',
      message: 'HTTP 500 on POST /v2/invoices/process for customer_id=cus_98412 [card: [REDACTED_PAN]]',
      rawLine: '2026-11-04 16:40:15.890 ERROR [http-nio-8080-exec-14] c.e.b.c.PaymentController: Internal Server Error on /v2/invoices/process for customer_id=cus_98412 [card: [REDACTED_PAN]]',
      isRedacted: true,
    },
    {
      id: 'EVT-107',
      timestamp: '2026-11-04 16:41:22.441',
      level: 'WARN',
      service: 'Billing Service',
      message: 'Deadlock detection check triggered on relation billing_invoices',
      rawLine: '2026-11-04 16:41:22.441 WARN  [billing-worker-12] c.e.b.s.TransactionSessionManager: Transaction wait time exceeded 12000ms on table billing_invoices',
    },
  ],
};
