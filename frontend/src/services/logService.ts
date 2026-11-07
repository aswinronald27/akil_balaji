import { LogAnalysis, LogEvent } from '../types';
import { mockLogAnalysisResult } from './mockData/mockLogs';
import { apiClient } from './apiClient';

const STORAGE_KEY_LOGS = 'intellidesk_logs_store';

const getStoredLogs = (): Record<string, LogAnalysis> => {
  const raw = localStorage.getItem(STORAGE_KEY_LOGS);
  if (raw) {
    try {
      return JSON.parse(raw);
    } catch {
      // fallback
    }
  }
  const initial = { [mockLogAnalysisResult.id]: mockLogAnalysisResult };
  localStorage.setItem(STORAGE_KEY_LOGS, JSON.stringify(initial));
  return initial;
};

const saveStoredLogs = (logs: Record<string, LogAnalysis>): void => {
  localStorage.setItem(STORAGE_KEY_LOGS, JSON.stringify(logs));
};

export interface LogUploadPayload {
  fileName: string;
  fileContent: string;
  service: string;
  incidentId?: string;
  redactSensitiveData: boolean;
}

/**
 * Intelligent Log Masking Helper (Section 11.2: Protection of Sensitive Data).
 * Redacts tokens, passwords, API keys, PAN numbers, and secrets.
 */
export const maskSensitiveLogData = (text: string): { maskedText: string; redactionCount: number } => {
  let count = 0;

  // Mask bearer tokens
  let result = text.replace(/Bearer\s+[A-Za-z0-9\-_.]+/gi, () => {
    count++;
    return 'Bearer [REDACTED_BEARER_TOKEN]';
  });

  // Mask api keys
  result = result.replace(/([a-zA-Z0-9_\-]*api[_-]?key["':=\s]+)([a-zA-Z0-9\-_]{16,})/gi, (_m, prefix) => {
    count++;
    return `${prefix}[REDACTED_API_KEY]`;
  });

  // Mask passwords
  result = result.replace(/(password|passwd|secret)["':=\s]+([^\s,;"]+)/gi, (_m, key) => {
    count++;
    return `${key}="[REDACTED_PASSWORD]"`;
  });

  // Mask credit card numbers
  result = result.replace(/\b(?:\d{4}[ -]?){3}\d{4}\b/g, () => {
    count++;
    return '[REDACTED_PAN]';
  });

  return { maskedText: result, redactionCount: count };
};

export const logService = {
  async uploadLog(payload: LogUploadPayload): Promise<LogAnalysis> {
    return apiClient.post<LogAnalysis>(
      '/logs/upload',
      payload,
      (data: LogUploadPayload) => {
        const store = getStoredLogs();
        const analysisId = `LOG-ANALYSIS-${new Date().getFullYear()}-${Math.floor(Math.random() * 900 + 100)}`;

        let processedContent = data.fileContent;
        let redactions = 0;
        if (data.redactSensitiveData) {
          const masked = maskSensitiveLogData(data.fileContent);
          processedContent = masked.maskedText;
          redactions = masked.redactionCount;
        }

        const lines = processedContent.split('\n').filter(l => l.trim().length > 0);
        const parsedEvents: LogEvent[] = lines.slice(0, 50).map((line, idx) => {
          let level: LogEvent['level'] = 'INFO';
          if (line.includes('FATAL')) level = 'FATAL';
          else if (line.includes('ERROR') || line.includes('Exception')) level = 'ERROR';
          else if (line.includes('WARN')) level = 'WARN';
          else if (line.includes('DEBUG')) level = 'DEBUG';

          const timeMatch = line.match(/\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}:\d{2}/) || line.match(/\d{2}:\d{2}:\d{2}/);
          const timestamp = timeMatch ? timeMatch[0] : new Date().toLocaleTimeString();

          return {
            id: `EVT-${idx + 1}`,
            timestamp,
            level,
            service: data.service,
            message: line.substring(0, 160),
            rawLine: line,
            isRedacted: line.includes('[REDACTED'),
          };
        });

        const errorCount = parsedEvents.filter(e => e.level === 'ERROR' || e.level === 'FATAL').length;
        const warningCount = parsedEvents.filter(e => e.level === 'WARN').length;

        const newAnalysis: LogAnalysis = {
          id: analysisId,
          fileName: data.fileName,
          fileSize: `${(processedContent.length / 1024).toFixed(1)} KB`,
          uploadedAt: new Date().toISOString(),
          totalLines: lines.length,
          errorCount: Math.max(errorCount, 14),
          warningCount: Math.max(warningCount, 28),
          anomalyScore: Math.min(95, Math.floor(Math.random() * 25 + 75)),
          redactedItemsCount: redactions || 12,
          service: data.service,
          incidentId: data.incidentId,
          topErrors: [
            {
              error: 'Connection refused / pool exhausted',
              count: 42,
              firstSeen: '16:39:48',
              lastSeen: '16:44:12',
              stackTrace: lines.find(l => l.includes('Exception') || l.includes('ERROR')) || 'java.net.ConnectException: Connection refused',
            },
            {
              error: 'Client socket timeout during network I/O',
              count: 18,
              firstSeen: '16:40:02',
              lastSeen: '16:43:55',
            },
          ],
          timeSeriesData: [
            { timestamp: '10:00', errors: 1, warnings: 5, info: 850 },
            { timestamp: '10:05', errors: 2, warnings: 6, info: 920 },
            { timestamp: '10:10', errors: 18, warnings: 34, info: 1100 },
            { timestamp: '10:15', errors: 85, warnings: 120, info: 740 },
            { timestamp: '10:20', errors: 42, warnings: 89, info: 690 },
            { timestamp: '10:25', errors: 9, warnings: 18, info: 890 },
          ],
          parsedEvents,
        };

        store[analysisId] = newAnalysis;
        saveStoredLogs(store);
        return newAnalysis;
      }
    );
  },

  async getLogAnalysis(id: string): Promise<LogAnalysis> {
    return apiClient.get<LogAnalysis>(
      `/logs/${id}/analysis`,
      () => {
        const store = getStoredLogs();
        if (store[id]) return store[id];
        // return default mock
        return mockLogAnalysisResult;
      }
    );
  },

  async getRecentAnalyses(): Promise<LogAnalysis[]> {
    return apiClient.get<LogAnalysis[]>(
      '/logs/recent',
      () => {
        const store = getStoredLogs();
        return Object.values(store);
      }
    );
  },
};
