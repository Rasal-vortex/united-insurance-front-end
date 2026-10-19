import { apiClient } from "@/lib/api-client";
export const documentService = {
  async getDocuments(params) {
    return apiClient("/api/documents", {
      method: "GET",
      params
    });
  },
  async getDocumentById(id) {
    return apiClient(`/api/documents/${id}`, {
      method: "GET"
    });
  },
  async uploadDocument(input) {
    const formData = new FormData();
    formData.append("file", input.file);
    formData.append("type", input.type);
    if (input.customerId) formData.append("customerId", input.customerId);
    if (input.policyId) formData.append("policyId", input.policyId);
    if (input.claimId) formData.append("claimId", input.claimId);
    return apiClient("/api/documents/upload", {
      method: "POST",
      body: formData
    });
  },
  async deleteDocument(id) {
    return apiClient(`/api/documents/${id}`, {
      method: "DELETE"
    });
  },
  async getDocumentContent(id) {
    return apiClient(`/api/documents/${id}/content`, {
      method: "GET",
      responseType: "blob"
    });
  },
  getDocumentContentUrl(id) {
    return `/api/documents/${id}/content`;
  }
};
