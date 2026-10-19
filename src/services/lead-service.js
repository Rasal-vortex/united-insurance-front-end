import { apiClient } from "@/lib/api-client";
export const leadService = {
  async getLeads(params) {
    return apiClient("/api/leads", {
      method: "GET",
      params
    });
  },
  async getLeadById(id) {
    return apiClient(`/api/leads/${id}`, {
      method: "GET"
    });
  },
  async createLead(input) {
    return apiClient("/api/leads", {
      method: "POST",
      body: JSON.stringify(input)
    });
  },
  async updateLead(id, input) {
    return apiClient(`/api/leads/${id}`, {
      method: "PATCH",
      body: JSON.stringify(input)
    });
  },
  async deleteLead(id) {
    return apiClient(`/api/leads/${id}`, {
      method: "DELETE"
    });
  },
  async convertLead(id) {
    return apiClient(`/api/leads/${id}/convert`, {
      method: "POST"
    });
  }
};
