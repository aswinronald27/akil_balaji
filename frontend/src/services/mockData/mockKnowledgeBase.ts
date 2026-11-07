import { VerifiedSolution } from '../../types';

export const mockVerifiedSolutions: VerifiedSolution[] = [
  {
    id: 'SOL-101',
    title: 'Mitigating PostgreSQL Connection Pool Starvation & HikariCP Leaks',
    category: 'Database error',
    tags: ['postgresql', 'hikaricp', 'connection-leak', 'performance'],
    targetSystems: ['PostgreSQL 14+', 'Spring Boot 3.x', 'HikariCP', 'PgBouncer'],
    verifiedBy: 'Elena Rostova (Principal SRE)',
    verifiedDate: '2026-08-15',
    helpfulVotes: 142,
    rootCause: 'Connection starvation occurs when application threads lease JDBC connections without closing them properly in error blocks, or when slow transactions hold active locks, depleting the PostgreSQL max_connections ceiling.',
    solutionSteps: [
      'Identify offending client sessions by running pg_stat_activity filtered by state = "idle in transaction".',
      'Terminate non-responsive client backend processes using pg_terminate_backend(pid).',
      'Enable leak detection in application config by setting spring.datasource.hikari.leak-detection-threshold = 2000.',
      'Deploy or tune PgBouncer connection pooling layer to decouple application threads from physical database backends.',
    ],
    warnings: [
      'Do not arbitrarily raise max_connections above 500 without recalculating RAM allocation for work_mem and shared_buffers.',
      'Never invoke pg_cancel_backend() on vacuum or autovacuum processes unless approved by Lead DBA.',
    ],
    runbookSteps: [
      {
        step: 1,
        title: 'Check PostgreSQL Active Connection Saturation',
        explanation: 'Inspect current active connections versus configured ceiling on the primary cluster.',
        command: 'SELECT count(*), max_conn, count(*)::float / max_conn AS pct_used FROM pg_stat_activity, (SELECT setting::int AS max_conn FROM pg_settings WHERE name = \'max_connections\') mc GROUP BY max_conn;',
      },
      {
        step: 2,
        title: 'Inspect Idle-In-Transaction and Blocking Sessions',
        explanation: 'Identify queries holding transactions open longer than 60 seconds.',
        command: 'SELECT pid, usename, client_addr, state, now() - state_change AS duration, query FROM pg_stat_activity WHERE state = \'idle in transaction\' AND now() - state_change > interval \'60 seconds\' ORDER BY duration DESC;',
      },
      {
        step: 3,
        title: 'Safely Terminate Starving Orphaned Sessions',
        explanation: 'Terminate connections leased by non-critical application worker instances.',
        command: 'SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE state = \'idle in transaction\' AND application_name LIKE \'billing-worker%\' AND now() - state_change > interval \'30 seconds\';',
      },
      {
        step: 4,
        title: 'Verify Connection Pool Headroom Recovery',
        explanation: 'Confirm that active connections have dropped below 60% saturation threshold.',
        command: 'SELECT count(*) FROM pg_stat_activity WHERE state = \'active\';',
      },
    ],
  },
  {
    id: 'SOL-102',
    title: 'Handling Redis Memory Exhaustion (OOM) and Eviction Cascades',
    category: 'Server performance issue',
    tags: ['redis', 'cache', 'memory-leak', 'session-drop'],
    targetSystems: ['Redis 7.x', 'AWS ElastiCache', 'Auth Cluster'],
    verifiedBy: 'Marcus Vance (Staff Infrastructure Engineer)',
    verifiedDate: '2026-09-02',
    helpfulVotes: 98,
    rootCause: 'Redis memory exceeds maxmemory when keys are written without TTLs or when volatile-lru eviction cannot find keys eligible for expiration, leading to command rejections.',
    solutionSteps: [
      'Check Redis memory usage and eviction rate with INFO MEMORY and INFO STATS.',
      'Identify largest key prefixes using redis-cli --bigkeys.',
      'Configure maxmemory-policy to volatile-lru or allkeys-lru based on whether database is used for persistent data or cache.',
      'Enforce mandatory TTL in application caching layer.',
    ],
    warnings: [
      'Do not run KEYS * on production Redis clusters as it blocks the single-threaded event loop. Always use SCAN.',
    ],
    runbookSteps: [
      {
        step: 1,
        title: 'Inspect Memory Breakdown',
        explanation: 'Examine used memory, peak memory, and total evictions counter.',
        command: 'redis-cli -h redis-prod-01 info memory | grep -E "used_memory_human|maxmemory_human|mem_fragmentation_ratio"',
      },
      {
        step: 2,
        title: 'Scan for Unbounded Memory Consumers',
        explanation: 'Detect key prefixes consuming the largest heap space.',
        command: 'redis-cli -h redis-prod-01 --bigkeys',
      },
      {
        step: 3,
        title: 'Temporarily Elevate Maxmemory or Apply Aggressive Eviction',
        explanation: 'Permit headroom while investigating rogue key producer.',
        command: 'redis-cli -h redis-prod-01 config set maxmemory 18gb',
      },
    ],
  },
  {
    id: 'SOL-103',
    title: 'Payment Gateway Circuit Breaker Failover & Timeout Recovery',
    category: 'Cloud service problem',
    tags: ['payment-gateway', 'circuit-breaker', 'resilience4j', 'failover'],
    targetSystems: ['Payment Microservice', 'Resilience4j', 'Envoy Gateway'],
    verifiedBy: 'Sarah Connor (FinTech SRE Lead)',
    verifiedDate: '2026-10-18',
    helpfulVotes: 115,
    rootCause: 'Downstream payment processor experiences elevated latency or carrier route failure, causing calling thread pools to block and exhaust thread queues.',
    solutionSteps: [
      'Verify external provider status dashboard.',
      'Engage secondary payment acquirer routing via feature toggle.',
      'Trip circuit breaker manually if automated threshold was not reached.',
      'Flush delayed webhook retry buffer once secondary route is validated.',
    ],
    warnings: [
      'Ensure idempotent transaction tokens are preserved when switching payment processors to avoid duplicate charges.',
    ],
    runbookSteps: [
      {
        step: 1,
        title: 'Verify Payment Processor Latency & Error Rate',
        explanation: 'Inspect Envoy access logs for downstream 504 and 502 responses.',
        command: 'kubectl logs -n prod -l app=payment-service --tail=200 | grep "provider.stripe.timeout"',
      },
      {
        step: 2,
        title: 'Switch Payment Processor via Unleash Feature Flag',
        explanation: 'Reroute active transaction intake to secondary provider (Adyen).',
        command: 'curl -X POST https://unleash.internal.corp/api/admin/features/payment.gateway.provider/toggle -H "Authorization: Bearer $UNLEASH_KEY" -d \'{"environment": "prod", "enabled": true, "variant": "adyen"}\'',
      },
      {
        step: 3,
        title: 'Monitor Synthetic Checkout Canaries',
        explanation: 'Confirm synthetic test transactions complete with HTTP 200 within 450ms.',
        command: 'curl -s https://synthetics.internal.corp/api/v1/runs/checkout-canary | jq .status',
      },
    ],
  },
  {
    id: 'SOL-104',
    title: 'Kafka Consumer Group Rebalance Loop & Lag Alleviation',
    category: 'Application failure',
    tags: ['kafka', 'consumer-lag', 'streaming', 'rebalance'],
    targetSystems: ['Apache Kafka 3.6', 'Strimzi K8s Operator', 'Java Consumers'],
    verifiedBy: 'Priya Sharma (Data Platforms Lead)',
    verifiedDate: '2026-07-22',
    helpfulVotes: 87,
    rootCause: 'Consumer processing time exceeds max.poll.interval.ms, causing the Kafka coordinator to consider the worker dead and trigger a rebalance cascade across all partition consumers.',
    solutionSteps: [
      'Inspect partition consumer lag using kafka-consumer-groups tool.',
      'Increase max.poll.interval.ms or decrease max.poll.records to prevent timeout during heavy processing batches.',
      'Scale consumer pod replicas to match partition count.',
    ],
    warnings: [
      'Do not increase consumer pods beyond the total number of topic partitions, as idle pods cannot consume.',
    ],
    runbookSteps: [
      {
        step: 1,
        title: 'Inspect Consumer Group Lag',
        explanation: 'Check lag across all topic partitions for telemetry-analytics group.',
        command: 'kafka-consumer-groups.sh --bootstrap-server kafka:9092 --describe --group telemetry-analytics',
      },
      {
        step: 2,
        title: 'Temporarily Pause Ingestion on Heavy Partitions',
        explanation: 'Allow current workers to drain backlog without rebalance disruption.',
        command: 'kubectl scale deployment telemetry-consumer -n streaming --replicas=12',
      },
    ],
  },
];
