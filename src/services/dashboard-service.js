import { apiClient } from "@/lib/api-client";
export const dashboardService = {
  async getDashboard() {
    return apiClient("/api/dashboard", {
      method: "GET"
    });
  },
  async getActivities() {
    return apiClient("/api/activities", {
      method: "GET"
    });
  },
  async getReportsSummary() {
    return apiClient("/api/reports/summary", {
      method: "GET"
    });
  },
  async getReportsRenewals() {
    return apiClient("/api/reports/renewals", {
      method: "GET"
    });
  },
  async getReportsCommissions() {
    return apiClient("/api/reports/commissions", {
      method: "GET"
    });
  }
};
