import { apiClient } from "@/lib/api-client";
export const customerService = {
  async getCustomers(params) {
    return apiClient("/api/customers", {
      method: "GET",
      params
    });
  },
  async getCustomerById(id) {
    return apiClient(`/api/customers/${id}`, {
      method: "GET"
    });
  },
  async createCustomer(input) {
    return apiClient("/api/customers", {
      method: "POST",
      body: JSON.stringify(input)
    });
  },
  async updateCustomer(id, input) {
    return apiClient(`/api/customers/${id}`, {
      method: "PATCH",
      body: JSON.stringify(input)
    });
  },
  async deleteCustomer(id) {
    return apiClient(`/api/customers/${id}`, {
      method: "DELETE"
    });
  }
};
