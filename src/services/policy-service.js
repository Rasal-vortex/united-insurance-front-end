import { apiClient } from "@/lib/api-client";
export const policyService = {
  async getPolicies(params) {
    return apiClient("/api/policies", {
      method: "GET",
      params
    });
  },
  async getPolicyById(id) {
    return apiClient(`/api/policies/${id}`, {
      method: "GET"
    });
  },
  async createPolicy(input) {
    return apiClient("/api/policies", {
      method: "POST",
      body: JSON.stringify(input)
    });
  },
  async updatePolicy(id, input) {
    return apiClient(`/api/policies/${id}`, {
      method: "PATCH",
      body: JSON.stringify(input)
    });
  }
};
