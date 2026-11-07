import { DashboardStats, SystemServiceHealth } from '../../types';
import { initialMockIncidents } from './mockIncidents';

export const mockSystemServicesHealth: SystemServiceHealth[] = [
  {
    id: 'sys-api-gw',
    name: 'API Gateway (Envoy / Kong)',
    type: 'Edge Ingress',
    status: 'degraded',
    uptimePercent: 99.82,
    latencyMs: 124,
    errorRate: '3.4%',
    activeAlertsCount: 4,
  },
  {
    id: 'sys-postgres',
    name: 'PostgreSQL Primary Cluster',
    type: 'Relational Database',
    status: 'critical',
    uptimePercent: 98.41,
    latencyMs: 840,
    errorRate: '18.2%',
    activeAlertsCount: 6,
  },
  {
    id: 'sys-redis',
    name: 'Redis Cache & Session Cluster',
    type: 'In-Memory Cache',
    status: 'degraded',
    uptimePercent: 99.91,
    latencyMs: 4.8,
    errorRate: '1.1%',
    activeAlertsCount: 2,
  },
  {
    id: 'sys-kafka',
    name: 'Kafka Ingestion Pipeline',
    type: 'Event Streaming',
    status: 'degraded',
    uptimePercent: 99.94,
    latencyMs: 88,
    errorRate: '0.8%',
    activeAlertsCount: 3,
  },
  {
    id: 'sys-k8s',
    name: 'Kubernetes Workload Fleet',
    type: 'Container Platform',
    status: 'healthy',
    uptimePercent: 99.99,
    latencyMs: 18,
    errorRate: '0.02%',
    activeAlertsCount: 0,
  },
  {
    id: 'sys-auth',
    name: 'Identity & Access Provider',
    type: 'Security / IAM',
    status: 'healthy',
    uptimePercent: 99.98,
    latencyMs: 45,
    errorRate: '0.05%',
    activeAlertsCount: 0,
  },
];

export const getCalculatedDashboardStats = (incidents = initialMockIncidents): DashboardStats => {
  const total = incidents.length;
  const open = incidents.filter(i => i.status !== 'Resolved').length;
  const investigating = incidents.filter(i => i.status === 'Investigating').length;
  const critical = incidents.filter(i => i.priority === 'P1').length;
  const resolved = incidents.filter(i => i.status === 'Resolved').length;

  const statusCounts = {
    new: incidents.filter(i => i.status === 'New').length,
    investigating: incidents.filter(i => i.status === 'Investigating').length,
    waiting: incidents.filter(i => i.status === 'Waiting').length,
    resolved: incidents.filter(i => i.status === 'Resolved').length,
    reopened: incidents.filter(i => i.status === 'Reopened').length,
  };

  const priorityCounts = {
    P1: incidents.filter(i => i.priority === 'P1').length,
    P2: incidents.filter(i => i.priority === 'P2').length,
    P3: incidents.filter(i => i.priority === 'P3').length,
    P4: incidents.filter(i => i.priority === 'P4').length,
  };

  const categoryMap = new Map<string, number>();
  incidents.forEach(inc => {
    categoryMap.set(inc.category, (categoryMap.get(inc.category) || 0) + 1);
  });

  const categoryDistribution = Array.from(categoryMap.entries()).map(([category, count]) => ({
    category: category as any,
    count,
    percentage: Math.round((count / (total || 1)) * 100),
  }));

  return {
    totalIncidents: total,
    openIncidents: open,
    investigatingCount: investigating,
    criticalCount: critical,
    resolvedCount: resolved,
    mttaMinutes: 4.2, // Mean Time to Acknowledge
    mttrMinutes: 38.5, // Mean Time to Resolve
    alertReductionPercent: 78, // Alert grouping reduction metric
    repeatIncidentRate: 12, // 12% repeat rate
    knowledgeReusePercent: 86, // 86% of solutions reused
    statusCounts,
    priorityCounts,
    categoryDistribution,
    recurringProblems: [
      {
        id: 'REC-01',
        service: 'Billing Service',
        pattern: 'HikariCP database connection leak on batch invoice triggers',
        occurrences30d: 4,
        avgResolutionMinutes: 44,
        lastIncidentId: 'INC-2024-1042',
        status: 'Active Risk',
      },
      {
        id: 'REC-02',
        service: 'Payment Gateway',
        pattern: 'Third-party webhook callback timeout during traffic spikes',
        occurrences30d: 3,
        avgResolutionMinutes: 26,
        lastIncidentId: 'INC-2024-1039',
        status: 'Under Investigation',
      },
      {
        id: 'REC-03',
        service: 'Auth Service',
        pattern: 'Redis maxmemory OOM eviction on unconstrained cart keys',
        occurrences30d: 2,
        avgResolutionMinutes: 38,
        lastIncidentId: 'INC-2024-1033',
        status: 'Fix Pending',
      },
    ],
  };
};
