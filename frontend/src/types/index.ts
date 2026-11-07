export type Priority = 'P1' | 'P2' | 'P3' | 'P4';

export type IncidentStatus = 'New' | 'Investigating' | 'Waiting' | 'Resolved' | 'Reopened';

export type IncidentCategory =
  | 'Application failure'
  | 'Database error'
  | 'Network issue'
  | 'Cloud service problem'
  | 'Deployment failure'
  | 'Authentication or access problem'
  | 'Server performance issue';

export type UserRole =
  | 'Incident Commander'
  | 'Senior SRE'
  | 'DevOps Lead'
  | 'Support Engineer';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  department: string;
}

export interface Alert {
  id: string;
  name: string;
  source: 'Prometheus' | 'Datadog' | 'AWS CloudWatch' | 'Sentry' | 'PagerDuty';
  severity: 'critical' | 'warning' | 'info';
  timestamp: string;
  message: string;
  service: string;
  rawPayload?: string;
}

export interface TimelineEvent {
  id: string;
  timestamp: string;
  type: 'alert' | 'status_change' | 'comment' | 'ai_analysis' | 'action_taken' | 'deployment';
  title: string;
  description: string;
  author?: string;
}

export interface ServiceNode {
  id: string;
  name: string;
  type: 'frontend' | 'gateway' | 'service' | 'database' | 'cache' | 'queue' | 'third_party';
  status: 'healthy' | 'degraded' | 'failing';
  latencyMs: number;
  errorRate: string;
  dependencies: string[];
}

export interface DeploymentRecord {
  id: string;
  service: string;
  version: string;
  deployedAt: string;
  author: string;
  commitSha: string;
  commitMessage: string;
  diffSummary: string;
  correlationRisk: 'high' | 'medium' | 'low';
}

export interface PreventionTask {
  id: string;
  title: string;
  description: string;
  assignee: string;
  priority: Priority;
  dueDate: string;
  status: 'pending' | 'in_progress' | 'completed';
  evidenceRequired: string;
  evidenceSubmitted?: string;
}

export interface Incident {
  id: string;
  title: string;
  description: string;
  errorMessage?: string;
  category: IncidentCategory;
  priority: Priority;
  status: IncidentStatus;
  affectedService: string;
  assignedEngineer: {
    name: string;
    email: string;
    avatar: string;
  };
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  alertCount: number;
  relatedAlerts: Alert[];
  timeline: TimelineEvent[];
  serviceDependencies: ServiceNode[];
  recentDeployments: DeploymentRecord[];
  logSnippet?: string;
  rootCauseAnalysisId?: string;
  preventionTasks: PreventionTask[];
  suggestedByAI?: boolean;
  aiClassificationConfidence?: number;
}

export interface LogEvent {
  id: string;
  timestamp: string;
  level: 'FATAL' | 'ERROR' | 'WARN' | 'INFO' | 'DEBUG';
  service: string;
  message: string;
  rawLine: string;
  isRedacted?: boolean;
}

export interface TopErrorPattern {
  error: string;
  count: number;
  firstSeen: string;
  lastSeen: string;
  stackTrace?: string;
}

export interface LogTimeSeriesPoint {
  timestamp: string;
  errors: number;
  warnings: number;
  info: number;
}

export interface LogAnalysis {
  id: string;
  fileName: string;
  fileSize: string;
  uploadedAt: string;
  totalLines: number;
  errorCount: number;
  warningCount: number;
  anomalyScore: number; // 0-100
  redactedItemsCount: number;
  service: string;
  incidentId?: string;
  topErrors: TopErrorPattern[];
  timeSeriesData: LogTimeSeriesPoint[];
  parsedEvents: LogEvent[];
}

export interface RankedCause {
  id: string;
  rank: number;
  cause: string;
  confidence: number; // 0-100
  evidence: string[];
  missingInfo: string[];
  recommendedChecks: string[];
  userFeedback?: 'useful' | 'unsuccessful' | 'outdated' | 'unsafe';
  feedbackNotes?: string;
}

export interface RecoveryAction {
  id: string;
  title: string;
  riskLevel: 'low' | 'medium' | 'high';
  requiresApproval: boolean;
  automatedAvailable: boolean;
  description: string;
  status: 'pending' | 'executing' | 'completed' | 'failed';
  executedBy?: string;
  executedAt?: string;
  resultMessage?: string;
}

export interface RootCauseAnalysis {
  id: string;
  incidentId: string;
  generatedAt: string;
  summary: string;
  rankedCauses: RankedCause[];
  recoveryActions: RecoveryAction[];
}

export interface HistoricalIncident {
  id: string;
  incidentId: string;
  title: string;
  category: IncidentCategory;
  affectedService: string;
  symptoms: string[];
  historicalCause: string;
  verifiedSolution: string;
  resolutionTimeMinutes: number;
  similarityScore: number; // percentage (e.g. 94)
  isVerified: boolean;
  resolvedDate: string;
}

export interface RunbookStep {
  step: number;
  title: string;
  explanation: string;
  command?: string;
  completed?: boolean;
}

export interface VerifiedSolution {
  id: string;
  title: string;
  category: IncidentCategory;
  tags: string[];
  targetSystems: string[];
  verifiedBy: string;
  verifiedDate: string;
  helpfulVotes: number;
  userVoted?: boolean;
  rootCause: string;
  solutionSteps: string[];
  warnings: string[];
  runbookSteps: RunbookStep[];
}

export interface RecurringProblem {
  id: string;
  service: string;
  pattern: string;
  occurrences30d: number;
  avgResolutionMinutes: number;
  lastIncidentId: string;
  status: 'Active Risk' | 'Under Investigation' | 'Fix Pending';
}

export interface SystemServiceHealth {
  id: string;
  name: string;
  type: string;
  status: 'healthy' | 'degraded' | 'critical';
  uptimePercent: number;
  latencyMs: number;
  errorRate: string;
  activeAlertsCount: number;
}

export interface DashboardStats {
  totalIncidents: number;
  openIncidents: number;
  investigatingCount: number;
  criticalCount: number;
  resolvedCount: number;
  mttaMinutes: number;
  mttrMinutes: number;
  alertReductionPercent: number;
  repeatIncidentRate: number;
  knowledgeReusePercent: number;
  statusCounts: {
    new: number;
    investigating: number;
    waiting: number;
    resolved: number;
    reopened: number;
  };
  priorityCounts: {
    P1: number;
    P2: number;
    P3: number;
    P4: number;
  };
  categoryDistribution: {
    category: IncidentCategory;
    count: number;
    percentage: number;
  }[];
  recurringProblems: RecurringProblem[];
}
