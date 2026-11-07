import { HistoricalIncident } from '../types';
import { mockHistoricalIncidents } from './mockData/mockHistorical';
import { apiClient } from './apiClient';

export interface HistoricalSearchParams {
  query: string;
  service?: string;
  minSimilarity?: number;
}

export const historicalSearchService = {
  async searchHistorical(params: HistoricalSearchParams): Promise<HistoricalIncident[]> {
    return apiClient.get<HistoricalIncident[]>(
      `/historical/search?q=${encodeURIComponent(params.query)}`,
      () => {
        const query = params.query.toLowerCase().trim();
        if (!query) {
          return mockHistoricalIncidents;
        }

        return mockHistoricalIncidents
          .map(item => {
            let score = item.similarityScore;

            // Adjust simulated semantic match score based on query tokens
            const queryWords = query.split(/\s+/);
            const content = `${item.title} ${item.historicalCause} ${item.verifiedSolution} ${item.symptoms.join(' ')} ${item.affectedService}`.toLowerCase();

            const matches = queryWords.filter(w => content.includes(w)).length;
            if (matches > 0) {
              score = Math.min(99, Math.max(65, Math.round((matches / queryWords.length) * 40 + 55)));
            } else {
              score = Math.max(20, score - 30);
            }

            return {
              ...item,
              similarityScore: score,
            };
          })
          .filter(item => {
            if (params.service && params.service !== 'All') {
              if (!item.affectedService.toLowerCase().includes(params.service.toLowerCase())) {
                return false;
              }
            }
            if (params.minSimilarity) {
              return item.similarityScore >= params.minSimilarity;
            }
            return item.similarityScore >= 35;
          })
          .sort((a, b) => b.similarityScore - a.similarityScore);
      }
    );
  },

  async getHistoricalById(id: string): Promise<HistoricalIncident | undefined> {
    return apiClient.get<HistoricalIncident | undefined>(
      `/historical/${id}`,
      () => mockHistoricalIncidents.find(h => h.id === id || h.incidentId === id)
    );
  },
};
