import { apiClient } from "@/lib/api-client";
export const branchService = {
  async updateBranch(id, input) {
    return apiClient(`/api/branches/${encodeURIComponent(id)}`, {
      method: "PATCH",
      body: JSON.stringify(input)
    });
  },
  async createBranch(input) {
    return apiClient("/api/branches", {
      method: "POST",
      body: JSON.stringify(input)
    });
  }
};
