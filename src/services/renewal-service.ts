import { apiClient } from '@/lib/api-client';
import { Renewal } from '@/types/crm';
import { PaginatedResponse, ListQueryParams } from '@/types/api';

export const renewalService = {
  async getRenewals(params?: ListQueryParams): Promise<PaginatedResponse<Renewal>> {
    return apiClient<PaginatedResponse<Renewal>>('/api/renewals', {
      method: 'GET',
      params: params as Record<string, string | number | boolean | undefined>,
    });
  },

  async getRenewalById(id: string): Promise<Renewal> {
    return apiClient<Renewal>(`/api/renewals/${id}`, {
      method: 'GET',
    });
  },

  async updateRenewal(id: string, input: Partial<Renewal>): Promise<Renewal> {
    return apiClient<Renewal>(`/api/renewals/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(input),
    });
  },
};
