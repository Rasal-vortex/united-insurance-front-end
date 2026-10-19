import { apiClient } from "@/lib/api-client";
export const staffService = {
  async getStaff(params) {
    return apiClient("/api/staff", {
      method: "GET",
      params
    });
  },
  async getStaffById(id) {
    return apiClient(`/api/staff/${id}`, {
      method: "GET"
    });
  },
  async createStaff(input) {
    return apiClient("/api/staff", {
      method: "POST",
      body: JSON.stringify(input)
    });
  },
  async updateStaff(id, input) {
    return apiClient(`/api/staff/${id}`, {
      method: "PATCH",
      body: JSON.stringify(input)
    });
  },
  async deleteStaff(id) {
    return apiClient(`/api/staff/${id}`, {
      method: "DELETE"
    });
  }
};
