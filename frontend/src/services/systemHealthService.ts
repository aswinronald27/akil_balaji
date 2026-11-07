import { DashboardStats, SystemServiceHealth } from '../types';
import { getCalculatedDashboardStats, mockSystemServicesHealth } from './mockData/mockSystemHealth';
import { incidentService } from './incidentService';
import { apiClient } from './apiClient';

export const systemHealthService = {
  async getDashboardStats(): Promise<DashboardStats> {
    return apiClient.get<DashboardStats>(
      '/dashboard/stats',
      async () => {
        const incidents = await incidentService.getIncidents();
        return getCalculatedDashboardStats(incidents);
      }
    );
  },

  async getSystemServicesHealth(): Promise<SystemServiceHealth[]> {
    return apiClient.get<SystemServiceHealth[]>(
      '/dashboard/system-health',
      () => mockSystemServicesHealth
    );
  },
};
