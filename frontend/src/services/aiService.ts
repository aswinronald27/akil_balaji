import { RootCauseAnalysis } from '../types';
import { mockRootCauseAnalyses } from './mockData/mockAiAnalysis';
import { apiClient } from './apiClient';

const STORAGE_KEY_RCA = 'intellidesk_rca_store';

const getStoredRCA = (): Record<string, RootCauseAnalysis> => {
  const raw = localStorage.getItem(STORAGE_KEY_RCA);
  if (raw) {
    try {
      return JSON.parse(raw);
    } catch {
      // fallback
    }
  }
  localStorage.setItem(STORAGE_KEY_RCA, JSON.stringify(mockRootCauseAnalyses));
  return { ...mockRootCauseAnalyses };
};

const saveStoredRCA = (store: Record<string, RootCauseAnalysis>): void => {
  localStorage.setItem(STORAGE_KEY_RCA, JSON.stringify(store));
};

export const aiService = {
  async getRootCauseAnalysis(incidentId: string): Promise<RootCauseAnalysis> {
    return apiClient.get<RootCauseAnalysis>(
      `/ai/root-cause-analysis?incidentId=${incidentId}`,
      () => {
        const store = getStoredRCA();
        if (store[incidentId]) {
          return store[incidentId];
        }

        // Generate synthetic grounded root cause analysis for any incident
        const generated: RootCauseAnalysis = {
          id: `RCA-${incidentId}`,
          incidentId,
          generatedAt: new Date().toISOString(),
          summary: `AI retrieval-augmented diagnostic for incident ${incidentId}. Correlated metrics, alert timelines, and runtime logs indicate upstream service dependency failure.`,
          rankedCauses: [
            {
              id: `cause-${incidentId}-1`,
              rank: 1,
              cause: 'Upstream network packet loss and TCP handshake retry exhaustion',
              confidence: 88,
              evidence: [
                'Log entries indicate socket connection timeout after 30000ms threshold.',
                'Telemetry points to 40% packet drops between worker pods and gateway.',
              ],
              missingInfo: ['TCP dump capture from affected node interface eth0.'],
              recommendedChecks: [
                'Check Calico / Cilium CNI pod networking health.',
                'Inspect AWS VPC NAT Gateway metrics.',
              ],
            },
            {
              id: `cause-${incidentId}-2`,
              rank: 2,
              cause: 'Resource saturation in underlying JVM thread executor queue',
              confidence: 62,
              evidence: ['Thread count approached 90% of maxThreads capacity.'],
              missingInfo: ['Thread dump analysis during peak incident window.'],
              recommendedChecks: ['Inspect JMX thread pool metrics in Grafana.'],
            },
          ],
          recoveryActions: [
            {
              id: `ACT-${incidentId}-01`,
              title: 'Restart Degraded Worker Pods with Graceful Draining',
              riskLevel: 'low',
              requiresApproval: false,
              automatedAvailable: true,
              description: 'Drain active HTTP connections over 15s and trigger Kubernetes rolling pod replacement.',
              status: 'pending',
            },
          ],
        };

        store[incidentId] = generated;
        saveStoredRCA(store);
        return generated;
      }
    );
  },

  async submitFeedback(
    incidentId: string,
    causeId: string,
    feedback: 'useful' | 'unsuccessful' | 'outdated' | 'unsafe',
    feedbackNotes?: string
  ): Promise<void> {
    return apiClient.post<void>(
      '/ai/recommendation-feedback',
      { incidentId, causeId, feedback, feedbackNotes },
      () => {
        const store = getStoredRCA();
        const rca = store[incidentId];
        if (rca) {
          const cause = rca.rankedCauses.find(c => c.id === causeId);
          if (cause) {
            cause.userFeedback = feedback;
            cause.feedbackNotes = feedbackNotes;
            saveStoredRCA(store);
          }
        }
      }
    );
  },

  async executeRecoveryAction(
    incidentId: string,
    actionId: string,
    approverName: string
  ): Promise<{ status: string; message: string }> {
    return apiClient.post<{ status: string; message: string }>(
      `/ai/recovery-action/${actionId}/execute`,
      { incidentId, approverName },
      () => {
        const store = getStoredRCA();
        const rca = store[incidentId];
        if (rca) {
          const action = rca.recoveryActions.find(a => a.id === actionId);
          if (action) {
            action.status = 'completed';
            action.executedBy = approverName;
            action.executedAt = new Date().toISOString();
            action.resultMessage = `Successfully executed recovery action. Telemetry verified healthy response.`;
            saveStoredRCA(store);
            return {
              status: 'completed',
              message: action.resultMessage,
            };
          }
        }
        return {
          status: 'completed',
          message: 'Recovery action completed successfully.',
        };
      }
    );
  },
};
