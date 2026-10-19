import { apiClient } from "@/lib/api-client";
export const renewalService = {
  async getRenewals(params) {
    return apiClient("/api/renewals", {
      method: "GET",
      params
    });
  },
  async getRenewalById(id) {
    return apiClient(`/api/renewals/${id}`, {
      method: "GET"
    });
  },
  async updateRenewal(id, input) {
    return apiClient(`/api/renewals/${id}`, {
      method: "PATCH",
      body: JSON.stringify(input)
    });
  }
};
