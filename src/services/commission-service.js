import { apiClient } from "@/lib/api-client";
export const commissionService = {
  async getCommissions(params) {
    return apiClient("/api/commissions", {
      method: "GET",
      params
    });
  },
  async getCommissionById(id) {
    return apiClient(`/api/commissions/${id}`, {
      method: "GET"
    });
  },
  async getCommissionsReport() {
    return apiClient("/api/reports/commissions", {
      method: "GET"
    });
  },
  async createCommission(input) {
    return apiClient("/api/commissions", {
      method: "POST",
      body: JSON.stringify(input)
    });
  },
  async updateCommission(id, input) {
    return apiClient(`/api/commissions/${id}`, {
      method: "PATCH",
      body: JSON.stringify(input)
    });
  }
};
