/**
 * IntelliDesk Initial Seed Data
 * Perfectly matches frontend models and schemas.
 */

const DEMO_USERS = {
  "Incident Commander": {
    id: "usr-001",
    name: "Elena Rostova",
    email: "elena.rostova@intellidesk.io",
    role: "Incident Commander",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80",
    department: "Site Reliability Engineering / NOC"
  },
  "Senior SRE": {
    id: "usr-002",
    name: "Alex Rivera",
    email: "alex.rivera@intellidesk.io",
    role: "Senior SRE",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
    department: "Core Infrastructure"
  },
  "DevOps Lead": {
    id: "usr-003",
    name: "Marcus Vance",
    email: "marcus.vance@intellidesk.io",
    role: "DevOps Lead",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80",
    department: "Cloud Platform Engineering"
  },
  "Support Engineer": {
    id: "usr-004",
    name: "Priya Sharma",
    email: "priya.sharma@intellidesk.io",
    role: "Support Engineer",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=120&auto=format&fit=crop&q=80",
    department: "Tier-2 Technical Operations"
  }
};

const SYSTEM_SERVICES = [
  {
    id: "sys-api-gw",
    name: "API Gateway (Envoy / Kong)",
    type: "Edge Ingress",
    status: "degraded",
    uptimePercent: 99.82,
    latencyMs: 124,
    errorRate: "3.4%",
    activeAlertsCount: 4
  },
  {
    id: "sys-postgres",
    name: "PostgreSQL Primary Cluster",
    type: "Relational Database",
    status: "critical",
    uptimePercent: 98.41,
    latencyMs: 840,
    errorRate: "18.2%",
    activeAlertsCount: 6
  },
  {
    id: "sys-redis",
    name: "Redis Cache & Session Cluster",
    type: "In-Memory Cache",
    status: "degraded",
    uptimePercent: 99.91,
    latencyMs: 4.8,
    errorRate: "1.1%",
    activeAlertsCount: 2
  },
  {
    id: "sys-kafka",
    name: "Kafka Ingestion Pipeline",
    type: "Event Streaming",
    status: "degraded",
    uptimePercent: 99.94,
    latencyMs: 88,
    errorRate: "0.8%",
    activeAlertsCount: 3
  },
  {
    id: "sys-k8s",
    name: "Kubernetes Workload Fleet",
    type: "Container Platform",
    status: "healthy",
    uptimePercent: 99.99,
    latencyMs: 18,
    errorRate: "0.02%",
    activeAlertsCount: 0
  },
  {
    id: "sys-auth",
    name: "Identity & Access Provider",
    type: "Security / IAM",
    status: "healthy",
    uptimePercent: 99.98,
    latencyMs: 45,
    errorRate: "0.05%",
    activeAlertsCount: 0
  }
];

const INCIDENTS = [
  {
    id: "INC-2024-1042",
    title: "PostgreSQL Connection Pool Exhaustion in Billing & Invoicing Service",
    description: "Multiple customer checkout failures observed. Applications failing to checkout with \"FATAL: remaining connection slots are reserved for non-replication superuser connections\". Database active connections spiked from 180 to maximum 500 within 8 minutes.",
    errorMessage: "org.postgresql.util.PSQLException: FATAL: 53300: remaining connection slots are reserved for non-replication superuser connections",
    category: "Database error",
    priority: "P1",
    status: "Investigating",
    affectedService: "Billing Service",
    assignedEngineer: {
      name: "Alex Rivera",
      email: "a.rivera@enterprise.corp",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
    },
    createdAt: "2026-11-04T16:42:00Z",
    updatedAt: "2026-11-04T17:15:00Z",
    alertCount: 28,
    relatedAlerts: [
      {
        id: "ALT-9821",
        name: "DatabaseConnectionPoolExhausted",
        source: "Prometheus",
        severity: "critical",
        timestamp: "2026-11-04T16:40:15Z",
        message: "Postgres primary db-prod-01 active connections reached 500/500 (100% threshold).",
        service: "Billing Service"
      },
      {
        id: "ALT-9822",
        name: "HTTP500SpikeBillingAPI",
        source: "Datadog",
        severity: "critical",
        timestamp: "2026-11-04T16:41:00Z",
        message: "Endpoint /v2/invoices/process returning HTTP 500 error rate > 34%.",
        service: "Billing Service"
      },
      {
        id: "ALT-9825",
        name: "OrderProcessingQueueBacklog",
        source: "AWS CloudWatch",
        severity: "warning",
        timestamp: "2026-11-04T16:43:30Z",
        message: "SQS billing-dlq queue depth exceeded 4,500 messages.",
        service: "Order Service"
      },
      {
        id: "ALT-9830",
        name: "SyntheticsCheckoutLatencyAnomaly",
        source: "PagerDuty",
        severity: "critical",
        timestamp: "2026-11-04T16:44:00Z",
        message: "Synthetic checkout probe timed out at 15000ms threshold.",
        service: "Web Storefront"
      }
    ],
    timeline: [
      {
        id: "TL-1",
        timestamp: "2026-11-04T16:38:00Z",
        type: "deployment",
        title: "Deployment v2.4.1 completed",
        description: "billing-service container deployed image hash sha256:8b4c29 via ArgoCD.",
        author: "CI/CD Pipeline"
      },
      {
        id: "TL-2",
        timestamp: "2026-11-04T16:40:15Z",
        type: "alert",
        title: "Prometheus Alert Fired",
        description: "DatabaseConnectionPoolExhausted on db-prod-01 (connections = 500).",
        author: "Prometheus Alertmanager"
      },
      {
        id: "TL-3",
        timestamp: "2026-11-04T16:42:00Z",
        type: "status_change",
        title: "Incident INC-2024-1042 Created",
        description: "Automated intake grouped 28 alerts into single incident. Priority P1 assigned.",
        author: "IntelliDesk Engine"
      },
      {
        id: "TL-4",
        timestamp: "2026-11-04T16:45:00Z",
        type: "ai_analysis",
        title: "AI Root Cause Analysis Generated",
        description: "Confidence: 94%. Root cause identified as unclosed connection leak in billing worker batch processing method introduced in v2.4.1.",
        author: "IntelliDesk AI Engine"
      },
      {
        id: "TL-5",
        timestamp: "2026-11-04T16:50:00Z",
        type: "comment",
        title: "Alex Rivera acknowledged incident",
        description: "Investigating HikariCP pool configuration in deployment v2.4.1.",
        author: "Alex Rivera"
      }
    ],
    serviceDependencies: [
      {
        id: "srv-web",
        name: "Web Storefront",
        type: "frontend",
        status: "degraded",
        latencyMs: 1420,
        errorRate: "12.4%",
        dependencies: ["srv-api-gw"]
      },
      {
        id: "srv-api-gw",
        name: "API Gateway",
        type: "gateway",
        status: "degraded",
        latencyMs: 850,
        errorRate: "18.1%",
        dependencies: ["srv-billing", "srv-order"]
      },
      {
        id: "srv-billing",
        name: "Billing Service",
        type: "service",
        status: "failing",
        latencyMs: 4200,
        errorRate: "46.8%",
        dependencies: ["srv-postgres-primary", "srv-redis-cache"]
      },
      {
        id: "srv-order",
        name: "Order Service",
        type: "service",
        status: "degraded",
        latencyMs: 920,
        errorRate: "8.3%",
        dependencies: ["srv-billing"]
      },
      {
        id: "srv-postgres-primary",
        name: "PostgreSQL Primary Cluster (db-prod-01)",
        type: "database",
        status: "failing",
        latencyMs: 5100,
        errorRate: "100% conn pool",
        dependencies: []
      },
      {
        id: "srv-redis-cache",
        name: "Redis Cache Cluster",
        type: "cache",
        status: "healthy",
        latencyMs: 2.1,
        errorRate: "0.01%",
        dependencies: []
      }
    ],
    recentDeployments: [
      {
        id: "DEP-841",
        service: "Billing Service",
        version: "v2.4.1",
        deployedAt: "2026-11-04T16:38:00Z",
        author: "dev-team-fintech",
        commitSha: "8b4c291d",
        commitMessage: "feat(billing): async retry invoice generation and batch settlement worker",
        diffSummary: "+142 lines, -18 lines in TransactionSessionManager.java",
        correlationRisk: "high"
      },
      {
        id: "DEP-840",
        service: "API Gateway",
        version: "v1.18.0",
        deployedAt: "2026-11-04T14:10:00Z",
        author: "infra-team",
        commitSha: "3a91f42e",
        commitMessage: "chore(gateway): update rate limiter thresholds for mobile clients",
        diffSummary: "+12 lines, -4 lines in ratelimit.yaml",
        correlationRisk: "low"
      }
    ],
    logSnippet: `2026-11-04 16:39:48.102 ERROR [billing-worker-7] c.e.b.s.InvoiceProcessor: Failed to obtain DB connection
org.postgresql.util.PSQLException: FATAL: remaining connection slots are reserved for non-replication superuser connections
	at org.postgresql.core.v3.ConnectionFactoryImpl.openConnectionImpl(ConnectionFactoryImpl.java:317)
	at com.zaxxer.hikari.pool.HikariPool.createPoolEntry(HikariPool.java:470)
	at com.zaxxer.hikari.pool.HikariPool.checkFailFast(HikariPool.java:561)
	at com.zaxxer.hikari.pool.HikariPool.<init>(HikariPool.java:115)
2026-11-04 16:40:02.481 WARN  [HikariPool-1 housekeeper] com.zaxxer.hikari.pool.HikariPool: HikariPool-1 - Connection is not available, request timed out after 30005ms.
2026-11-04 16:40:15.890 ERROR [http-nio-8080-exec-14] c.e.b.c.PaymentController: Internal Server Error on /v2/invoices/process`,
    rootCauseAnalysisId: "RCA-2024-1042",
    preventionTasks: [
      {
        id: "PREV-101",
        title: "Add try-with-resources and automated leak detection in TransactionSessionManager",
        description: "Ensure all Hikari connections acquired during batch invoicing have leakDetectionThreshold set to 2000ms and are guaranteed closed in finally blocks.",
        assignee: "David Chen",
        priority: "P1",
        dueDate: "2026-11-06",
        status: "in_progress",
        evidenceRequired: "Unit test verifying pool release under simulated database exception + PR review."
      },
      {
        id: "PREV-102",
        title: "Configure PgBouncer connection pooling layer between app pods and PostgreSQL",
        description: "Deploy PgBouncer as a sidecar or dedicated proxy cluster to buffer up to 5,000 application client connections with max 100 backend server connections.",
        assignee: "Infra SRE Team",
        priority: "P2",
        dueDate: "2026-11-12",
        status: "pending",
        evidenceRequired: "Terraform PR merged & Grafana dashboard showing PgBouncer active pool headroom."
      }
    ],
    suggestedByAI: true,
    aiClassificationConfidence: 96
  },
  {
    id: "INC-2024-1039",
    title: "Payment Gateway 504 Gateway Timeout during Checkout",
    description: "Third-party payment provider webhook callbacks timing out. Downstream payment processing latency increased from 320ms to 24000ms, causing checkout queue pile-up.",
    errorMessage: "Gateway Timeout (504): Downstream HTTP POST https://api.stripe-mock.internal/v1/charges timed out after 20000ms",
    category: "Cloud service problem",
    priority: "P1",
    status: "Investigating",
    affectedService: "Payment Gateway",
    assignedEngineer: {
      name: "Sarah Connor",
      email: "s.connor@enterprise.corp",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80"
    },
    createdAt: "2026-11-04T15:10:00Z",
    updatedAt: "2026-11-04T15:55:00Z",
    alertCount: 19,
    relatedAlerts: [],
    timeline: [],
    serviceDependencies: [],
    recentDeployments: [],
    preventionTasks: [],
    aiClassificationConfidence: 91
  },
  {
    id: "INC-2024-1033",
    title: "Redis Cluster Memory Eviction & Session Drop in Auth Service",
    description: "Redis node redis-prod-02 reached maxmemory (16GB). Key eviction policy (allkeys-lru) caused unexpected revocation of active user session tokens.",
    errorMessage: "OOM command not allowed when used memory > maxmemory",
    category: "Server performance issue",
    priority: "P2",
    status: "Waiting",
    affectedService: "Auth Service",
    assignedEngineer: {
      name: "Marcus Vance",
      email: "m.vance@enterprise.corp",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80"
    },
    createdAt: "2026-11-04T12:05:00Z",
    updatedAt: "2026-11-04T13:40:00Z",
    alertCount: 14,
    relatedAlerts: [],
    timeline: [],
    serviceDependencies: [],
    recentDeployments: [],
    preventionTasks: [],
    aiClassificationConfidence: 89
  },
  {
    id: "INC-2024-1028",
    title: "Kafka Ingestion Consumer Lag Spikes on telemetry-pipeline",
    description: "Consumer group telemetry-analytics lag surged past 1.2M unconsumed offsets. Partitions 4 and 7 experiencing deadlock in consumer rebalance loop.",
    errorMessage: "org.apache.kafka.clients.consumer.CommitFailedException: Commit cannot be completed since the group has already rebalanced",
    category: "Application failure",
    priority: "P2",
    status: "New",
    affectedService: "Telemetry Pipeline",
    assignedEngineer: {
      name: "Priya Sharma",
      email: "p.sharma@enterprise.corp",
      avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&auto=format&fit=crop&q=80"
    },
    createdAt: "2026-11-04T10:15:00Z",
    updatedAt: "2026-11-04T10:15:00Z",
    alertCount: 8,
    relatedAlerts: [],
    timeline: [],
    serviceDependencies: [],
    recentDeployments: [],
    preventionTasks: [],
    aiClassificationConfidence: 93
  },
  {
    id: "INC-2024-1019",
    title: "OAuth Token Refresh Loop after Identity Provider Upgrade",
    description: "Users experienced intermittent logout loops when rotating refresh tokens. The IdP token payload schema changed nonce attribute casing.",
    errorMessage: "InvalidTokenException: Token validation failed: nonce mismatch",
    category: "Authentication or access problem",
    priority: "P3",
    status: "Resolved",
    affectedService: "Identity Provider",
    assignedEngineer: {
      name: "Alex Rivera",
      email: "a.rivera@enterprise.corp",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
    },
    createdAt: "2026-11-03T09:20:00Z",
    updatedAt: "2026-11-03T11:45:00Z",
    resolvedAt: "2026-11-03T11:45:00Z",
    alertCount: 6,
    relatedAlerts: [],
    timeline: [],
    serviceDependencies: [],
    recentDeployments: [],
    preventionTasks: [],
    aiClassificationConfidence: 95
  },
  {
    id: "INC-2024-1015",
    title: "Kubernetes Ingress Controller Pod Evictions due to Node OOM",
    description: "Worker node k8s-worker-08 kernel invoked cgroup OOM killer on ingress-nginx pod after sudden surge in uncompressed payload requests.",
    errorMessage: "PodStatus: Failed, Reason: Evicted, Message: The node was low on resource: memory",
    category: "Deployment failure",
    priority: "P2",
    status: "Resolved",
    affectedService: "Kubernetes Cluster",
    assignedEngineer: {
      name: "Marcus Vance",
      email: "m.vance@enterprise.corp",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80"
    },
    createdAt: "2026-11-02T18:14:00Z",
    updatedAt: "2026-11-02T19:30:00Z",
    resolvedAt: "2026-11-02T19:30:00Z",
    alertCount: 22,
    relatedAlerts: [],
    timeline: [],
    serviceDependencies: [],
    recentDeployments: [],
    preventionTasks: [],
    aiClassificationConfidence: 92
  },
  {
    id: "INC-2024-1008",
    title: "Elasticsearch Cluster Red Status on catalog-search-prod",
    description: "Primary shard unassigned for index products_v4. Disk watermark exceeded 85% on node es-data-03.",
    errorMessage: "ClusterHealth: RED, unassigned_shards: 3, disk_allocation_decider: low disk watermark exceeded",
    category: "Database error",
    priority: "P3",
    status: "Resolved",
    affectedService: "Catalog Search",
    assignedEngineer: {
      name: "Sarah Connor",
      email: "s.connor@enterprise.corp",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80"
    },
    createdAt: "2026-11-01T14:00:00Z",
    updatedAt: "2026-11-01T15:20:00Z",
    resolvedAt: "2026-11-01T15:20:00Z",
    alertCount: 11,
    relatedAlerts: [],
    timeline: [],
    serviceDependencies: [],
    recentDeployments: [],
    preventionTasks: [],
    aiClassificationConfidence: 97
  },
  {
    id: "INC-2024-1002",
    title: "Staging Wildcard TLS Certificate Near Expiration (3 Days Remaining)",
    description: "Automated cert-manager renewal failed due to DNS challenge token rate limit with Cloudflare API.",
    errorMessage: "cert-manager: ErrFailedAcmeChallenge: 429 Too Many Requests to Cloudflare DNS",
    category: "Cloud service problem",
    priority: "P4",
    status: "Resolved",
    affectedService: "Edge Ingress",
    assignedEngineer: {
      name: "Priya Sharma",
      email: "p.sharma@enterprise.corp",
      avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&auto=format&fit=crop&q=80"
    },
    createdAt: "2026-10-30T11:00:00Z",
    updatedAt: "2026-10-30T12:00:00Z",
    resolvedAt: "2026-10-30T12:00:00Z",
    alertCount: 3,
    relatedAlerts: [],
    timeline: [],
    serviceDependencies: [],
    recentDeployments: [],
    preventionTasks: [],
    aiClassificationConfidence: 88
  }
];

const ROOT_CAUSE_ANALYSES = {
  "INC-2024-1042": {
    id: "RCA-2024-1042",
    incidentId: "INC-2024-1042",
    generatedAt: "2026-11-04T16:45:00Z",
    summary: "Correlated analysis of 28 alerts, 14,820 log lines, and ArgoCD deployment v2.4.1 indicates PostgreSQL connection starvation caused by an unclosed connection leak in the newly deployed asynchronous batch invoicing routine.",
    rankedCauses: [
      {
        id: "cause-1",
        rank: 1,
        cause: "Unclosed Database Connection Leak in TransactionSessionManager introduced in Deployment v2.4.1",
        confidence: 94,
        evidence: [
          "Log line 16:39:48 showing HikariCP pool saturation (500/500 connections active).",
          "ArgoCD deployment record DEP-841 (v2.4.1) deployed at 16:38:00 UTC, exactly 1 minute 48 seconds prior to initial connection exhaustion alert.",
          "Git diff inspection reveals TransactionSessionManager.java lacks try-with-resources or finally block for connection.close() when batch invoice processing encounters validation errors.",
          "Historical incident INC-2024-0412 matches same HikariCP connection leak signature with 96% semantic similarity."
        ],
        missingInfo: [
          "PostgreSQL pg_stat_activity query log confirming client IP address distribution of the idle in transaction sessions.",
          "Heap dump inspection of billing-service worker threads holding unreleased SqlSession instances."
        ],
        recommendedChecks: [
          "Inspect pg_stat_activity WHERE state = 'idle in transaction' to verify whether connection owner is billing-worker threads.",
          "Check ArgoCD rollback viability to v2.4.0.",
          "Verify if database pg_terminate_backend() can immediately reclaim orphaned connections without interrupting read traffic."
        ]
      },
      {
        id: "cause-2",
        rank: 2,
        cause: "Sudden Traffic Surge from External Automated Webhook Retries Exhausting Connection Limit",
        confidence: 68,
        evidence: [
          "SQS queue depth spiked to 4,500 messages concurrently at 16:43:30 UTC.",
          "Ingress gateway reported 3x inbound webhook retry requests from Shopify and WooCommerce integrations."
        ],
        missingInfo: [
          "Upstream API gateway rate limiter logs indicating whether rogue external client IP is sending unthrottled requests."
        ],
        recommendedChecks: [
          "Check Cloudflare WAF rate limiting rules on /v2/invoices/process endpoint.",
          "Inspect billing worker concurrency ceiling in application.yml."
        ]
      },
      {
        id: "cause-3",
        rank: 3,
        cause: "PostgreSQL Server-Side Lock Contention & Transaction Deadlock on billing_invoices Table",
        confidence: 42,
        evidence: [
          "Warning log entry at 16:41:22 UTC regarding transaction wait time exceeding 12,000ms on table billing_invoices."
        ],
        missingInfo: [
          "pg_locks lock graph telemetry to distinguish whether deadlock is primary cause or secondary symptom of pool saturation."
        ],
        recommendedChecks: [
          "Query pg_blocking_pids() on db-prod-01 primary node."
        ]
      }
    ],
    recoveryActions: [
      {
        id: "ACT-01",
        title: "Terminate Idle-in-Transaction Client Sessions on PostgreSQL Primary",
        riskLevel: "low",
        requiresApproval: false,
        automatedAvailable: true,
        description: "Execute controlled SELECT pg_terminate_backend(pid) for all billing-service client sessions idle > 60 seconds. Immediately reclaims up to 300 pooled slots.",
        status: "pending"
      },
      {
        id: "ACT-02",
        title: "Perform Rollback of Billing Service to v2.4.0 via ArgoCD",
        riskLevel: "medium",
        requiresApproval: true,
        automatedAvailable: true,
        description: "Revert deployment billing-service from container tag v2.4.1 back to verified stable release v2.4.0 to eliminate the connection leak.",
        status: "pending"
      },
      {
        id: "ACT-03",
        title: "Emergency Dynamic Increase of max_connections to 800 and Restart DB Node",
        riskLevel: "high",
        requiresApproval: true,
        automatedAvailable: false,
        description: "Requires database cluster restart and memory recalculation (shared_buffers). May cause replica lag.",
        status: "pending"
      }
    ]
  },
  "INC-2024-1039": {
    id: "RCA-2024-1039",
    incidentId: "INC-2024-1039",
    generatedAt: "2026-11-04T15:20:00Z",
    summary: "Third-party Payment Gateway provider endpoint is experiencing upstream BGP routing degradation. High latency and 504 errors correlate with ISP carrier transit failure.",
    rankedCauses: [
      {
        id: "cause-1039-1",
        rank: 1,
        cause: "Upstream Third-Party Payment Gateway Regional Latency Degradation",
        confidence: 91,
        evidence: [
          "HTTP client timeout at 20000ms on downstream POST https://api.stripe-mock.internal/v1/charges.",
          "External status page of Payment Provider reports major outage in US-East-1 region."
        ],
        missingInfo: [
          "Confirmation from provider NOC regarding ETA of carrier BGP route restoration."
        ],
        recommendedChecks: [
          "Check status.payment-provider.com live feed.",
          "Verify circuit breaker tripped in Payment Gateway to divert traffic to secondary processor."
        ]
      }
    ],
    recoveryActions: [
      {
        id: "ACT-04",
        title: "Engage Multi-Provider Fallback to Secondary Payment Processor (Adyen)",
        riskLevel: "low",
        requiresApproval: false,
        automatedAvailable: true,
        description: "Flip dynamic feature toggle payment.gateway.provider to fallback-adyen to bypass failing provider route.",
        status: "pending"
      }
    ]
  }
};

const LOG_ANALYSES = {
  "LOG-ANALYSIS-2024-889": {
    id: "LOG-ANALYSIS-2024-889",
    fileName: "billing-service-production-2026-11-04.log",
    fileSize: "4.8 MB",
    uploadedAt: "2026-11-04T16:44:20Z",
    totalLines: 14820,
    errorCount: 642,
    warningCount: 1184,
    anomalyScore: 88,
    redactedItemsCount: 47,
    service: "Billing Service",
    incidentId: "INC-2024-1042",
    topErrors: [
      {
        error: "FATAL: remaining connection slots are reserved for non-replication superuser connections",
        count: 382,
        firstSeen: "16:39:48",
        lastSeen: "16:44:12",
        stackTrace: `org.postgresql.util.PSQLException: FATAL: 53300: remaining connection slots are reserved for non-replication superuser connections
	at org.postgresql.core.v3.ConnectionFactoryImpl.openConnectionImpl(ConnectionFactoryImpl.java:317)
	at com.zaxxer.hikari.pool.HikariPool.createPoolEntry(HikariPool.java:470)
	at com.zaxxer.hikari.pool.HikariPool.checkFailFast(HikariPool.java:561)
	at com.zaxxer.hikari.pool.HikariPool.<init>(HikariPool.java:115)`
      },
      {
        error: "HikariPool-1 - Connection is not available, request timed out after 30005ms",
        count: 214,
        firstSeen: "16:40:02",
        lastSeen: "16:44:19",
        stackTrace: `java.sql.SQLTransientConnectionException: HikariPool-1 - Connection is not available, request timed out after 30005ms.
	at com.zaxxer.hikari.pool.HikariPool.getConnection(HikariPool.java:217)
	at com.zaxxer.hikari.HikariDataSource.getConnection(HikariDataSource.java:128)
	at com.enterprise.billing.service.TransactionSessionManager.acquireConnection(TransactionSessionManager.java:84)`
      },
      {
        error: "HTTP 500 InternalServerError on POST /v2/invoices/process",
        count: 46,
        firstSeen: "16:40:15",
        lastSeen: "16:44:05"
      }
    ],
    timeSeriesData: [
      { timestamp: "16:30", errors: 2, warnings: 12, info: 1400 },
      { timestamp: "16:33", errors: 4, warnings: 15, info: 1520 },
      { timestamp: "16:36", errors: 3, warnings: 18, info: 1480 },
      { timestamp: "16:38", errors: 12, warnings: 45, info: 1610 },
      { timestamp: "16:39", errors: 84, warnings: 190, info: 1240 },
      { timestamp: "16:40", errors: 240, warnings: 320, info: 980 },
      { timestamp: "16:41", errors: 185, warnings: 280, info: 760 },
      { timestamp: "16:42", errors: 65, warnings: 194, info: 890 },
      { timestamp: "16:43", errors: 38, warnings: 98, info: 1100 },
      { timestamp: "16:44", errors: 12, warnings: 24, info: 1350 }
    ],
    parsedEvents: [
      {
        id: "EVT-101",
        timestamp: "2026-11-04 16:38:12.014",
        level: "INFO",
        service: "Billing Service",
        message: "Container initialized billing-service:v2.4.1 [Spring Boot 3.2.4]",
        rawLine: "2026-11-04 16:38:12.014 INFO  [main] c.e.b.BillingApplication: Started BillingApplication in 3.41 seconds"
      },
      {
        id: "EVT-102",
        timestamp: "2026-11-04 16:38:45.320",
        level: "INFO",
        service: "Billing Service",
        message: "Received batch invoice settlement trigger for 12,500 pending records",
        rawLine: "2026-11-04 16:38:45.320 INFO  [batch-scheduler-1] c.e.b.s.BatchInvoiceRunner: Starting execution with concurrency=24"
      },
      {
        id: "EVT-103",
        timestamp: "2026-11-04 16:39:18.990",
        level: "WARN",
        service: "Billing Service",
        message: "HikariPool-1 pool usage reached 85% (425/500 active leases)",
        rawLine: "2026-11-04 16:39:18.990 WARN  [HikariPool-1 housekeeper] c.z.h.p.HikariPool: Pool usage warning: active=425, idle=75, waiting=14"
      },
      {
        id: "EVT-104",
        timestamp: "2026-11-04 16:39:48.102",
        level: "FATAL",
        service: "Billing Service",
        message: "FATAL: remaining connection slots are reserved for non-replication superuser connections (auth: [REDACTED_API_TOKEN])",
        rawLine: "2026-11-04 16:39:48.102 FATAL [billing-worker-7] org.postgresql.Driver: FATAL: remaining connection slots are reserved for non-replication superuser connections; client_token=[REDACTED_API_TOKEN]",
        isRedacted: true
      },
      {
        id: "EVT-105",
        timestamp: "2026-11-04 16:40:02.481",
        level: "ERROR",
        service: "Billing Service",
        message: "HikariPool-1 - Connection is not available, request timed out after 30005ms",
        rawLine: "2026-11-04 16:40:02.481 ERROR [HikariPool-1 housekeeper] c.z.h.p.HikariPool: HikariPool-1 - Connection is not available, request timed out after 30005ms"
      },
      {
        id: "EVT-106",
        timestamp: "2026-11-04 16:40:15.890",
        level: "ERROR",
        service: "Billing Service",
        message: "HTTP 500 on POST /v2/invoices/process for customer_id=cus_98412 [card: [REDACTED_PAN]]",
        rawLine: "2026-11-04 16:40:15.890 ERROR [http-nio-8080-exec-14] c.e.b.c.PaymentController: Internal Server Error on /v2/invoices/process for customer_id=cus_98412 [card: [REDACTED_PAN]]",
        isRedacted: true
      },
      {
        id: "EVT-107",
        timestamp: "2026-11-04 16:41:22.441",
        level: "WARN",
        service: "Billing Service",
        message: "Deadlock detection check triggered on relation billing_invoices",
        rawLine: "2026-11-04 16:41:22.441 WARN  [billing-worker-12] c.e.b.s.TransactionSessionManager: Transaction wait time exceeded 12000ms on table billing_invoices"
      }
    ]
  }
};

const HISTORICAL_INCIDENTS = [
  {
    id: "HIST-2024-0412",
    incidentId: "INC-2024-0412",
    title: "PostgreSQL HikariCP Connection Pool Exhaustion in Subscription Service",
    category: "Database error",
    affectedService: "Subscription Service",
    symptoms: [
      "FATAL: remaining connection slots are reserved for non-replication superuser connections",
      "HTTP 500 error spike",
      "Database connection timeout after 30000ms",
      "Sudden increase in active connections following release"
    ],
    historicalCause: "A newly introduced export routine opened database connections inside a reactive stream flatMap without invoking subscription.dispose(), leaving connections indefinitely active.",
    verifiedSolution: "Added HikariCP leakDetectionThreshold = 2000ms in application.properties and wrapped connection acquisition inside try-with-resources. Rolled back deploy until patch was merged.",
    resolutionTimeMinutes: 28,
    similarityScore: 96,
    isVerified: true,
    resolvedDate: "2026-04-12"
  },
  {
    id: "HIST-2023-1189",
    incidentId: "INC-2023-1189",
    title: "PostgreSQL Idle In Transaction Deadlock during End-of-Month Invoicing",
    category: "Database error",
    affectedService: "Billing Service",
    symptoms: [
      "Database timeout on /v2/invoices/process",
      "Transaction wait time exceeded 15000ms",
      "Lock contention on billing_invoices table"
    ],
    historicalCause: "Long-running invoice reconciliation report took row-level EXCLUSIVE locks across 50,000 billing accounts, blocking real-time transaction updates.",
    verifiedSolution: "Terminated blocking process via pg_terminate_backend(pid). Re-architected batch invoice reconciliation query to use read-replica with pg_isolation_level READ UNCOMMITTED.",
    resolutionTimeMinutes: 42,
    similarityScore: 84,
    isVerified: true,
    resolvedDate: "2025-11-28"
  },
  {
    id: "HIST-2024-0803",
    incidentId: "INC-2024-0803",
    title: "Redis Out of Memory & Key Eviction in User Session Store",
    category: "Server performance issue",
    affectedService: "Auth Service",
    symptoms: [
      "OOM command not allowed when used memory > maxmemory",
      "Users logged out abruptly",
      "High CPU on Redis cluster nodes"
    ],
    historicalCause: "TTL was omitted when saving shopping cart sessions, allowing keys to accumulate indefinitely without expiring.",
    verifiedSolution: "Updated session storage repository to mandate 7-day TTL on all session keys. Executed script to scan and delete expired orphaned cart keys.",
    resolutionTimeMinutes: 35,
    similarityScore: 78,
    isVerified: true,
    resolvedDate: "2026-08-03"
  },
  {
    id: "HIST-2024-0615",
    incidentId: "INC-2024-0615",
    title: "Kubernetes Pod OOMKilled following Unbounded Heap Growth in Ingress Proxy",
    category: "Deployment failure",
    affectedService: "Kubernetes Cluster",
    symptoms: [
      "PodStatus: Failed Reason: Evicted",
      "Memory limit exceeded 2Gi",
      "HTTP 502 Bad Gateway during peak hour"
    ],
    historicalCause: "Ingress proxy buffer sizes were unconstrained, causing large file upload payloads to consume all container memory.",
    verifiedSolution: "Configured client_max_body_size to 25m and raised container memory request/limit to 4Gi with Horizontal Pod Autoscaler based on memory utilization.",
    resolutionTimeMinutes: 19,
    similarityScore: 72,
    isVerified: true,
    resolvedDate: "2026-06-15"
  },
  {
    id: "HIST-2024-0210",
    incidentId: "INC-2024-0210",
    title: "Payment Gateway Provider Webhook Timeout during Black Friday",
    category: "Cloud service problem",
    affectedService: "Payment Gateway",
    symptoms: [
      "504 Gateway Timeout on checkout payment processing",
      "Webhook callback delay > 30s",
      "Order backlog accumulation in SQS queue"
    ],
    historicalCause: "Primary payment provider experienced regional BGP routing degradation. Circuit breaker threshold was configured too high (50 failures) so traffic was not diverted quickly.",
    verifiedSolution: "Activated secondary payment processor fallback. Lowered circuit breaker failure threshold from 50 to 5 consecutive timeouts.",
    resolutionTimeMinutes: 22,
    similarityScore: 91,
    isVerified: true,
    resolvedDate: "2026-02-10"
  }
];

const KNOWLEDGE_BASE_SOLUTIONS = [
  {
    id: "SOL-101",
    title: "Mitigating PostgreSQL Connection Pool Starvation & HikariCP Leaks",
    category: "Database error",
    tags: ["postgresql", "hikaricp", "connection-leak", "performance"],
    targetSystems: ["PostgreSQL 14+", "Spring Boot 3.x", "HikariCP", "PgBouncer"],
    verifiedBy: "Elena Rostova (Principal SRE)",
    verifiedDate: "2026-08-15",
    helpfulVotes: 142,
    rootCause: "Connection starvation occurs when application threads lease JDBC connections without closing them properly in error blocks, or when slow transactions hold active locks, depleting the PostgreSQL max_connections ceiling.",
    solutionSteps: [
      "Identify offending client sessions by running pg_stat_activity filtered by state = \"idle in transaction\".",
      "Terminate non-responsive client backend processes using pg_terminate_backend(pid).",
      "Enable leak detection in application config by setting spring.datasource.hikari.leak-detection-threshold = 2000.",
      "Deploy or tune PgBouncer connection pooling layer to decouple application threads from physical database backends."
    ],
    warnings: [
      "Do not arbitrarily raise max_connections above 500 without recalculating RAM allocation for work_mem and shared_buffers.",
      "Never invoke pg_cancel_backend() on vacuum or autovacuum processes unless approved by Lead DBA."
    ],
    runbookSteps: [
      {
        step: 1,
        title: "Check PostgreSQL Active Connection Saturation",
        explanation: "Inspect current active connections versus configured ceiling on the primary cluster.",
        command: "SELECT count(*), max_conn, count(*)::float / max_conn AS pct_used FROM pg_stat_activity, (SELECT setting::int AS max_conn FROM pg_settings WHERE name = 'max_connections') mc GROUP BY max_conn;"
      },
      {
        step: 2,
        title: "Inspect Idle-In-Transaction and Blocking Sessions",
        explanation: "Identify queries holding transactions open longer than 60 seconds.",
        command: "SELECT pid, usename, client_addr, state, now() - state_change AS duration, query FROM pg_stat_activity WHERE state = 'idle in transaction' AND now() - state_change > interval '60 seconds' ORDER BY duration DESC;"
      },
      {
        step: 3,
        title: "Safely Terminate Starving Orphaned Sessions",
        explanation: "Terminate connections leased by non-critical application worker instances.",
        command: "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE state = 'idle in transaction' AND application_name LIKE 'billing-worker%' AND now() - state_change > interval '30 seconds';"
      },
      {
        step: 4,
        title: "Verify Connection Pool Headroom Recovery",
        explanation: "Confirm that active connections have dropped below 60% saturation threshold.",
        command: "SELECT count(*) FROM pg_stat_activity WHERE state = 'active';"
      }
    ]
  },
  {
    id: "SOL-102",
    title: "Handling Redis Memory Exhaustion (OOM) and Eviction Cascades",
    category: "Server performance issue",
    tags: ["redis", "cache", "memory-leak", "session-drop"],
    targetSystems: ["Redis 7.x", "AWS ElastiCache", "Auth Cluster"],
    verifiedBy: "Marcus Vance (Staff Infrastructure Engineer)",
    verifiedDate: "2026-09-02",
    helpfulVotes: 98,
    rootCause: "Redis memory exceeds maxmemory when keys are written without TTLs or when volatile-lru eviction cannot find keys eligible for expiration, leading to command rejections.",
    solutionSteps: [
      "Check Redis memory usage and eviction rate with INFO MEMORY and INFO STATS.",
      "Identify largest key prefixes using redis-cli --bigkeys.",
      "Configure maxmemory-policy to volatile-lru or allkeys-lru based on whether database is used for persistent data or cache.",
      "Enforce mandatory TTL in application caching layer."
    ],
    warnings: [
      "Do not run KEYS * on production Redis clusters as it blocks the single-threaded event loop. Always use SCAN."
    ],
    runbookSteps: [
      {
        step: 1,
        title: "Inspect Memory Breakdown",
        explanation: "Examine used memory, peak memory, and total evictions counter.",
        command: "redis-cli -h redis-prod-01 info memory | grep -E \"used_memory_human|maxmemory_human|mem_fragmentation_ratio\""
      },
      {
        step: 2,
        title: "Scan for Unbounded Memory Consumers",
        explanation: "Detect key prefixes consuming the largest heap space.",
        command: "redis-cli -h redis-prod-01 --bigkeys"
      },
      {
        step: 3,
        title: "Temporarily Elevate Maxmemory or Apply Aggressive Eviction",
        explanation: "Permit headroom while investigating rogue key producer.",
        command: "redis-cli -h redis-prod-01 config set maxmemory 18gb"
      }
    ]
  },
  {
    id: "SOL-103",
    title: "Payment Gateway Circuit Breaker Failover & Timeout Recovery",
    category: "Cloud service problem",
    tags: ["payment-gateway", "circuit-breaker", "resilience4j", "failover"],
    targetSystems: ["Payment Microservice", "Resilience4j", "Envoy Gateway"],
    verifiedBy: "Sarah Connor (FinTech SRE Lead)",
    verifiedDate: "2026-10-18",
    helpfulVotes: 115,
    rootCause: "Downstream payment processor experiences elevated latency or carrier route failure, causing calling thread pools to block and exhaust thread queues.",
    solutionSteps: [
      "Verify external provider status dashboard.",
      "Engage secondary payment acquirer routing via feature toggle.",
      "Trip circuit breaker manually if automated threshold was not reached.",
      "Flush delayed webhook retry buffer once secondary route is validated."
    ],
    warnings: [
      "Ensure idempotent transaction tokens are preserved when switching payment processors to avoid duplicate charges."
    ],
    runbookSteps: [
      {
        step: 1,
        title: "Verify Payment Processor Latency & Error Rate",
        explanation: "Inspect Envoy access logs for downstream 504 and 502 responses.",
        command: "kubectl logs -n prod -l app=payment-service --tail=200 | grep \"provider.stripe.timeout\""
      },
      {
        step: 2,
        title: "Switch Payment Processor via Unleash Feature Flag",
        explanation: "Reroute active transaction intake to secondary provider (Adyen).",
        command: "curl -X POST https://unleash.internal.corp/api/admin/features/payment.gateway.provider/toggle -H \"Authorization: Bearer $UNLEASH_KEY\" -d '{\"environment\": \"prod\", \"enabled\": true, \"variant\": \"adyen\"}'"
      },
      {
        step: 3,
        title: "Monitor Synthetic Checkout Canaries",
        explanation: "Confirm synthetic test transactions complete with HTTP 200 within 450ms.",
        command: "curl -s https://synthetics.internal.corp/api/v1/runs/checkout-canary | jq .status"
      }
    ]
  },
  {
    id: "SOL-104",
    title: "Kafka Consumer Group Rebalance Loop & Lag Alleviation",
    category: "Application failure",
    tags: ["kafka", "consumer-lag", "streaming", "rebalance"],
    targetSystems: ["Apache Kafka 3.6", "Strimzi K8s Operator", "Java Consumers"],
    verifiedBy: "Priya Sharma (Data Platforms Lead)",
    verifiedDate: "2026-07-22",
    helpfulVotes: 87,
    rootCause: "Consumer processing time exceeds max.poll.interval.ms, causing the Kafka coordinator to consider the worker dead and trigger a rebalance cascade across all partition consumers.",
    solutionSteps: [
      "Inspect partition consumer lag using kafka-consumer-groups tool.",
      "Increase max.poll.interval.ms or decrease max.poll.records to prevent timeout during heavy processing batches.",
      "Scale consumer pod replicas to match partition count."
    ],
    warnings: [
      "Do not increase consumer pods beyond the total number of topic partitions, as idle pods cannot consume."
    ],
    runbookSteps: [
      {
        step: 1,
        title: "Inspect Consumer Group Lag",
        explanation: "Check lag across all topic partitions for telemetry-analytics group.",
        command: "kafka-consumer-groups.sh --bootstrap-server kafka:9092 --describe --group telemetry-analytics"
      },
      {
        step: 2,
        title: "Temporarily Pause Ingestion on Heavy Partitions",
        explanation: "Allow current workers to drain backlog without rebalance disruption.",
        command: "kubectl scale deployment telemetry-consumer -n streaming --replicas=12"
      }
    ]
  }
];

module.exports = {
  DEMO_USERS,
  SYSTEM_SERVICES,
  INCIDENTS,
  ROOT_CAUSE_ANALYSES,
  LOG_ANALYSES,
  HISTORICAL_INCIDENTS,
  KNOWLEDGE_BASE_SOLUTIONS
};
