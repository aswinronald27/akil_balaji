import { RootCauseAnalysis } from '../../types';

export const mockRootCauseAnalyses: Record<string, RootCauseAnalysis> = {
  'INC-2024-1042': {
    id: 'RCA-2024-1042',
    incidentId: 'INC-2024-1042',
    generatedAt: '2026-11-04T16:45:00Z',
    summary: 'Correlated analysis of 28 alerts, 14,820 log lines, and ArgoCD deployment v2.4.1 indicates PostgreSQL connection starvation caused by an unclosed connection leak in the newly deployed asynchronous batch invoicing routine.',
    rankedCauses: [
      {
        id: 'cause-1',
        rank: 1,
        cause: 'Unclosed Database Connection Leak in TransactionSessionManager introduced in Deployment v2.4.1',
        confidence: 94,
        evidence: [
          'Log line 16:39:48 showing HikariCP pool saturation (500/500 connections active).',
          'ArgoCD deployment record DEP-841 (v2.4.1) deployed at 16:38:00 UTC, exactly 1 minute 48 seconds prior to initial connection exhaustion alert.',
          'Git diff inspection reveals TransactionSessionManager.java lacks try-with-resources or finally block for connection.close() when batch invoice processing encounters validation errors.',
          'Historical incident INC-2024-0412 matches same HikariCP connection leak signature with 96% semantic similarity.',
        ],
        missingInfo: [
          'PostgreSQL pg_stat_activity query log confirming client IP address distribution of the idle in transaction sessions.',
          'Heap dump inspection of billing-service worker threads holding unreleased SqlSession instances.',
        ],
        recommendedChecks: [
          'Inspect pg_stat_activity WHERE state = \'idle in transaction\' to verify whether connection owner is billing-worker threads.',
          'Check ArgoCD rollback viability to v2.4.0.',
          'Verify if database pg_terminate_backend() can immediately reclaim orphaned connections without interrupting read traffic.',
        ],
      },
      {
        id: 'cause-2',
        rank: 2,
        cause: 'Sudden Traffic Surge from External Automated Webhook Retries Exhausting Connection Limit',
        confidence: 68,
        evidence: [
          'SQS queue depth spiked to 4,500 messages concurrently at 16:43:30 UTC.',
          'Ingress gateway reported 3x inbound webhook retry requests from Shopify and WooCommerce integrations.',
        ],
        missingInfo: [
          'Upstream API gateway rate limiter logs indicating whether rogue external client IP is sending unthrottled requests.',
        ],
        recommendedChecks: [
          'Check Cloudflare WAF rate limiting rules on /v2/invoices/process endpoint.',
          'Inspect billing worker concurrency ceiling in application.yml.',
        ],
      },
      {
        id: 'cause-3',
        rank: 3,
        cause: 'PostgreSQL Server-Side Lock Contention & Transaction Deadlock on billing_invoices Table',
        confidence: 42,
        evidence: [
          'Warning log entry at 16:41:22 UTC regarding transaction wait time exceeding 12,000ms on table billing_invoices.',
        ],
        missingInfo: [
          'pg_locks lock graph telemetry to distinguish whether deadlock is primary cause or secondary symptom of pool saturation.',
        ],
        recommendedChecks: [
          'Query pg_blocking_pids() on db-prod-01 primary node.',
        ],
      },
    ],
    recoveryActions: [
      {
        id: 'ACT-01',
        title: 'Terminate Idle-in-Transaction Client Sessions on PostgreSQL Primary',
        riskLevel: 'low',
        requiresApproval: false,
        automatedAvailable: true,
        description: 'Execute controlled SELECT pg_terminate_backend(pid) for all billing-service client sessions idle > 60 seconds. Immediately reclaims up to 300 pooled slots.',
        status: 'pending',
      },
      {
        id: 'ACT-02',
        title: 'Perform Rollback of Billing Service to v2.4.0 via ArgoCD',
        riskLevel: 'medium',
        requiresApproval: true,
        automatedAvailable: true,
        description: 'Revert deployment billing-service from container tag v2.4.1 back to verified stable release v2.4.0 to eliminate the connection leak.',
        status: 'pending',
      },
      {
        id: 'ACT-03',
        title: 'Emergency Dynamic Increase of max_connections to 800 and Restart DB Node',
        riskLevel: 'high',
        requiresApproval: true,
        automatedAvailable: false,
        description: 'Requires database cluster restart and memory recalculation (shared_buffers). May cause replica lag.',
        status: 'pending',
      },
    ],
  },
  'INC-2024-1039': {
    id: 'RCA-2024-1039',
    incidentId: 'INC-2024-1039',
    generatedAt: '2026-11-04T15:20:00Z',
    summary: 'Third-party Payment Gateway provider endpoint is experiencing upstream BGP routing degradation. High latency and 504 errors correlate with ISP carrier transit failure.',
    rankedCauses: [
      {
        id: 'cause-1039-1',
        rank: 1,
        cause: 'Upstream Third-Party Payment Gateway Regional Latency Degradation',
        confidence: 91,
        evidence: [
          'HTTP client timeout at 20000ms on downstream POST https://api.stripe-mock.internal/v1/charges.',
          'External status page of Payment Provider reports major outage in US-East-1 region.',
        ],
        missingInfo: [
          'Confirmation from provider NOC regarding ETA of carrier BGP route restoration.',
        ],
        recommendedChecks: [
          'Check status.payment-provider.com live feed.',
          'Verify circuit breaker tripped in Payment Gateway to divert traffic to secondary processor.',
        ],
      },
    ],
    recoveryActions: [
      {
        id: 'ACT-04',
        title: 'Engage Multi-Provider Fallback to Secondary Payment Processor (Adyen)',
        riskLevel: 'low',
        requiresApproval: false,
        automatedAvailable: true,
        description: 'Flip dynamic feature toggle payment.gateway.provider to fallback-adyen to bypass failing provider route.',
        status: 'pending',
      },
    ],
  },
};
