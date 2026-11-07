import { Incident, IncidentCategory, IncidentStatus, Priority, PreventionTask } from '../types';
import { initialMockIncidents } from './mockData/mockIncidents';
import { apiClient } from './apiClient';

const STORAGE_KEY_INCIDENTS = 'intellidesk_incidents_store';

const getStoredIncidents = (): Incident[] => {
  const raw = localStorage.getItem(STORAGE_KEY_INCIDENTS);
  if (raw) {
    try {
      return JSON.parse(raw);
    } catch {
      // fallback
    }
  }
  localStorage.setItem(STORAGE_KEY_INCIDENTS, JSON.stringify(initialMockIncidents));
  return [...initialMockIncidents];
};

const saveStoredIncidents = (incidents: Incident[]): void => {
  localStorage.setItem(STORAGE_KEY_INCIDENTS, JSON.stringify(incidents));
};

export interface IncidentFilters {
  status?: IncidentStatus | 'All';
  priority?: Priority | 'All';
  service?: string | 'All';
  search?: string;
  category?: IncidentCategory | 'All';
}

export interface CreateIncidentDTO {
  title: string;
  description: string;
  errorMessage?: string;
  category: IncidentCategory;
  priority: Priority;
  affectedService: string;
  assignedEngineerName?: string;
  logSnippet?: string;
  importedAlertJson?: string;
}

export interface AIClassificationResult {
  suggestedCategory: IncidentCategory;
  suggestedPriority: Priority;
  suggestedTeam: string;
  confidenceScore: number;
  reasoning: string;
}

export const incidentService = {
  async getIncidents(filters?: IncidentFilters): Promise<Incident[]> {
    return apiClient.get<Incident[]>(
      '/incidents',
      () => {
        let list = getStoredIncidents();

        if (filters) {
          if (filters.status && filters.status !== 'All') {
            list = list.filter(i => i.status === filters.status);
          }
          if (filters.priority && filters.priority !== 'All') {
            list = list.filter(i => i.priority === filters.priority);
          }
          if (filters.category && filters.category !== 'All') {
            list = list.filter(i => i.category === filters.category);
          }
          if (filters.service && filters.service !== 'All') {
            list = list.filter(i => i.affectedService.toLowerCase().includes(filters.service!.toLowerCase()));
          }
          if (filters.search) {
            const q = filters.search.toLowerCase();
            list = list.filter(
              i =>
                i.id.toLowerCase().includes(q) ||
                i.title.toLowerCase().includes(q) ||
                i.description.toLowerCase().includes(q) ||
                i.affectedService.toLowerCase().includes(q) ||
                (i.errorMessage && i.errorMessage.toLowerCase().includes(q))
            );
          }
        }

        return list;
      }
    );
  },

  async getIncidentById(id: string): Promise<Incident> {
    return apiClient.get<Incident>(
      `/incidents/${id}`,
      () => {
        const list = getStoredIncidents();
        const found = list.find(i => i.id === id);
        if (!found) {
          throw new Error(`Incident with ID ${id} not found`);
        }
        return found;
      }
    );
  },

  async createIncident(dto: CreateIncidentDTO): Promise<Incident> {
    return apiClient.post<Incident>(
      '/incidents',
      dto,
      (payload: CreateIncidentDTO) => {
        const list = getStoredIncidents();
        const year = new Date().getFullYear();
        const nextNum = 1043 + Math.floor(Math.random() * 50);
        const newId = `INC-${year}-${nextNum}`;

        const newIncident: Incident = {
          id: newId,
          title: payload.title,
          description: payload.description,
          errorMessage: payload.errorMessage,
          category: payload.category,
          priority: payload.priority,
          status: 'New',
          affectedService: payload.affectedService || 'Unassigned Service',
          assignedEngineer: {
            name: payload.assignedEngineerName || 'Alex Rivera',
            email: 'a.rivera@enterprise.corp',
            avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          alertCount: payload.importedAlertJson ? 5 : 1,
          relatedAlerts: payload.importedAlertJson
            ? [
                {
                  id: `ALT-${Math.floor(Math.random() * 9000 + 1000)}`,
                  name: 'ImportedMonitoringAlert',
                  source: 'Datadog',
                  severity: payload.priority === 'P1' ? 'critical' : 'warning',
                  timestamp: new Date().toISOString(),
                  message: payload.description,
                  service: payload.affectedService,
                  rawPayload: payload.importedAlertJson,
                },
              ]
            : [],
          timeline: [
            {
              id: `TL-${Date.now()}`,
              timestamp: new Date().toISOString(),
              type: 'status_change',
              title: `Incident ${newId} Created`,
              description: `Reported via Unified Incident Intake. Initial triage priority ${payload.priority}.`,
              author: payload.assignedEngineerName || 'IntelliDesk Intake Engine',
            },
          ],
          serviceDependencies: [
            {
              id: 'srv-primary',
              name: payload.affectedService,
              type: 'service',
              status: payload.priority === 'P1' ? 'failing' : 'degraded',
              latencyMs: 1200,
              errorRate: '15.4%',
              dependencies: ['srv-backend-dep'],
            },
            {
              id: 'srv-backend-dep',
              name: 'Core Cluster Dependencies',
              type: 'database',
              status: 'healthy',
              latencyMs: 8.5,
              errorRate: '0.01%',
              dependencies: [],
            },
          ],
          recentDeployments: [],
          logSnippet: payload.logSnippet,
          preventionTasks: [],
          suggestedByAI: true,
          aiClassificationConfidence: 92,
        };

        const updated = [newIncident, ...list];
        saveStoredIncidents(updated);
        return newIncident;
      }
    );
  },

  async updateIncidentStatus(id: string, status: IncidentStatus): Promise<Incident> {
    return apiClient.patch<Incident>(
      `/incidents/${id}/status`,
      { status },
      () => {
        const list = getStoredIncidents();
        const index = list.findIndex(i => i.id === id);
        if (index === -1) throw new Error(`Incident ${id} not found`);

        const current = list[index];
        const updated: Incident = {
          ...current,
          status,
          updatedAt: new Date().toISOString(),
          resolvedAt: status === 'Resolved' ? new Date().toISOString() : current.resolvedAt,
          timeline: [
            {
              id: `TL-${Date.now()}`,
              timestamp: new Date().toISOString(),
              type: 'status_change',
              title: `Status changed to ${status}`,
              description: `Incident moved from ${current.status} to ${status}.`,
              author: 'Current User',
            },
            ...current.timeline,
          ],
        };

        list[index] = updated;
        saveStoredIncidents(list);
        return updated;
      }
    );
  },

  async addPreventionTask(incidentId: string, task: Omit<PreventionTask, 'id'>): Promise<PreventionTask> {
    return apiClient.post<PreventionTask>(
      `/incidents/${incidentId}/prevention-tasks`,
      task,
      () => {
        const list = getStoredIncidents();
        const index = list.findIndex(i => i.id === incidentId);
        if (index === -1) throw new Error(`Incident ${incidentId} not found`);

        const newTask: PreventionTask = {
          ...task,
          id: `PREV-${Math.floor(Math.random() * 900 + 100)}`,
        };

        list[index].preventionTasks.push(newTask);
        saveStoredIncidents(list);
        return newTask;
      }
    );
  },

  /**
   * AI Incident Classification engine (Feature 2).
   * Analyzes input description, error messages, or logs to predict category, priority, and team.
   */
  async classifyIncidentText(text: string): Promise<AIClassificationResult> {
    await new Promise(r => setTimeout(r, 350));
    const lower = text.toLowerCase();

    if (lower.includes('connection') || lower.includes('database') || lower.includes('postgres') || lower.includes('sql') || lower.includes('hikaricp')) {
      return {
        suggestedCategory: 'Database error',
        suggestedPriority: lower.includes('fatal') || lower.includes('exhausted') ? 'P1' : 'P2',
        suggestedTeam: 'Database Administration & Backend Core',
        confidenceScore: 95,
        reasoning: 'Detected database connection pool starvation and JDBC driver exception patterns.',
      };
    }

    if (lower.includes('timeout') || lower.includes('504') || lower.includes('stripe') || lower.includes('gateway') || lower.includes('payment')) {
      return {
        suggestedCategory: 'Cloud service problem',
        suggestedPriority: 'P1',
        suggestedTeam: 'FinTech Integrations / Payment SRE',
        confidenceScore: 92,
        reasoning: 'Identified external gateway communication timeout and payment provider latency disruption.',
      };
    }

    if (lower.includes('redis') || lower.includes('oom') || lower.includes('eviction') || lower.includes('memory') || lower.includes('cpu')) {
      return {
        suggestedCategory: 'Server performance issue',
        suggestedPriority: 'P2',
        suggestedTeam: 'Cloud Infrastructure / SRE',
        confidenceScore: 89,
        reasoning: 'Identified memory saturation, LRU eviction alerts, or compute resource exhaustion.',
      };
    }

    if (lower.includes('deploy') || lower.includes('argocd') || lower.includes('kubernetes') || lower.includes('pod') || lower.includes('evicted')) {
      return {
        suggestedCategory: 'Deployment failure',
        suggestedPriority: 'P2',
        suggestedTeam: 'DevOps / Release Engineering',
        confidenceScore: 91,
        reasoning: 'Correlated with recent deployment artifact rollouts and container orchestration status changes.',
      };
    }

    if (lower.includes('token') || lower.includes('oauth') || lower.includes('auth') || lower.includes('401') || lower.includes('forbidden')) {
      return {
        suggestedCategory: 'Authentication or access problem',
        suggestedPriority: 'P3',
        suggestedTeam: 'IAM & Security Operations',
        confidenceScore: 94,
        reasoning: 'Detected cryptographic credential or identity provider session validation failure.',
      };
    }

    // Default general classification
    return {
      suggestedCategory: 'Application failure',
      suggestedPriority: 'P2',
      suggestedTeam: 'Application Core Engineering',
      confidenceScore: 82,
      reasoning: 'Generic unhandled runtime exception identified in application telemetry.',
    };
  },
};
