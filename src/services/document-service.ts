import { apiClient } from '@/lib/api-client';
import { CrmDocument } from '@/types/crm';
import { PaginatedResponse, ListQueryParams } from '@/types/api';

export interface UploadDocumentInput {
  file: File;
  type: string;
  customerId?: string;
  policyId?: string;
  claimId?: string;
}

export const documentService = {
  async getDocuments(params?: ListQueryParams): Promise<PaginatedResponse<CrmDocument>> {
    return apiClient<PaginatedResponse<CrmDocument>>('/api/documents', {
      method: 'GET',
      params: params as Record<string, string | number | boolean | undefined>,
    });
  },

  async getDocumentById(id: string): Promise<CrmDocument> {
    return apiClient<CrmDocument>(`/api/documents/${id}`, {
      method: 'GET',
    });
  },

  async uploadDocument(input: UploadDocumentInput): Promise<CrmDocument> {
    const formData = new FormData();
    formData.append('file', input.file);
    formData.append('type', input.type);
    if (input.customerId) formData.append('customerId', input.customerId);
    if (input.policyId) formData.append('policyId', input.policyId);
    if (input.claimId) formData.append('claimId', input.claimId);

    return apiClient<CrmDocument>('/api/documents/upload', {
      method: 'POST',
      body: formData,
    });
  },

  async deleteDocument(id: string): Promise<{ success: boolean; id: string }> {
    return apiClient<{ success: boolean; id: string }>(`/api/documents/${id}`, {
      method: 'DELETE',
    });
  },

  getDocumentContentUrl(id: string): string {
    return `/api/documents/${id}/content`;
  },
};
