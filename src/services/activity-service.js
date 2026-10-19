import { apiClient } from "@/lib/api-client";

export const activityService = {
  async getActivities() {
    return apiClient("/api/activities", { method: "GET" });
  },

  async getActivityById(id) {
    return apiClient(`/api/activities/${id}`, { method: "GET" });
  },
};
