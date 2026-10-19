import { apiClient } from "@/lib/api-client";
import { setStoredSession, clearStoredSession } from "@/lib/auth";
export const authService = {
  async loginAdmin(credentials) {
    const response = await apiClient("/api/auth/admin/login", {
      method: "POST",
      body: JSON.stringify(credentials)
    });
    const { success, message, data } = response ?? {};
    const user = data?.user;
    if (!success || !data?.token || !user?.id || !user?.name || user?.userType !== "ADMIN") {
      throw new Error(message || "The admin login response is missing required fields.");
    }
    setStoredSession({
      token: data.token,
      user
    });
    return response;
  },
  async loginBranch(credentials) {
    const response = await apiClient("/api/auth/branch/login", {
      method: "POST",
      body: JSON.stringify(credentials)
    });
    const { success, message, data } = response ?? {};
    const user = data?.user;
    if (!success || !data?.token || !user?.id || !user?.name || user?.userType !== "BRANCH") {
      throw new Error(message || "The branch login response is missing required fields.");
    }
    setStoredSession({
      token: data.token,
      user
    });
    return response;
  },
  logout() {
    clearStoredSession();
  }
};
