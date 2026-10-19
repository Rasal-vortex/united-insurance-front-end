import { apiClient } from "@/lib/api-client";
export const claimService = {
  async getClaims(params) {
    return apiClient("/api/claims", {
      method: "GET",
      params
    });
  },
  async getClaimById(id) {
    return apiClient(`/api/claims/${id}`, {
      method: "GET"
    });
  },
  async createClaim(input) {
    return apiClient("/api/claims", {
      method: "POST",
      body: JSON.stringify(input)
    });
  },
  async updateClaim(id, input) {
    return apiClient(`/api/claims/${id}`, {
      method: "PATCH",
      body: JSON.stringify(input)
    });
  }
};
