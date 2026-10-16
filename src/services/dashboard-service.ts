import { apiClient } from '@/lib/api-client';
import { DashboardData, Activity, ReportSummary } from '@/types/crm';
import { PaginatedResponse } from '@/types/api';

export const dashboardService = {
  async getDashboard(): Promise<DashboardData> {
    return apiClient<DashboardData>('/api/dashboard', {
      method: 'GET',
    });
  },

  async getActivities(): Promise<PaginatedResponse<Activity>> {
    return apiClient<PaginatedResponse<Activity>>('/api/activities', {
      method: 'GET',
    });
  },

  async getReportsSummary(): Promise<ReportSummary> {
    return apiClient<ReportSummary>('/api/reports/summary', {
      method: 'GET',
    });
  },

  async getReportsRenewals(): Promise<{ period: string; upcomingCount: number; renewalRate: number; projectedVolume: number }> {
    return apiClient<{ period: string; upcomingCount: number; renewalRate: number; projectedVolume: number }>('/api/reports/renewals', {
      method: 'GET',
    });
  },

  async getReportsCommissions(): Promise<{ period: string; paidTotal: number; pendingTotal: number; averageRate: number }> {
    return apiClient<{ period: string; paidTotal: number; pendingTotal: number; averageRate: number }>('/api/reports/commissions', {
      method: 'GET',
    });
  },
};
