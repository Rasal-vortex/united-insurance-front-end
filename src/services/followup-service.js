import { apiClient } from "@/lib/api-client";
export const followUpService = {
  async getFollowUps(params) {
    return apiClient("/api/follow-ups", {
      method: "GET",
      params
    });
  },
  async getFollowUpById(id) {
    return apiClient(`/api/follow-ups/${id}`, {
      method: "GET"
    });
  },
  async createFollowUp(input) {
    return apiClient("/api/follow-ups", {
      method: "POST",
      body: JSON.stringify(input)
    });
  },
  async updateFollowUp(id, input) {
    return apiClient(`/api/follow-ups/${id}`, {
      method: "PATCH",
      body: JSON.stringify(input)
    });
  },
  async deleteFollowUp(id) {
    return apiClient(`/api/follow-ups/${id}`, {
      method: "DELETE"
    });
  }
};
