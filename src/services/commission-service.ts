import { apiClient } from '@/lib/api-client';
import { Commission, CommissionStatus } from '@/types/crm';
import { PaginatedResponse, ListQueryParams } from '@/types/api';

export interface CreateCommissionInput {
  amount: number;
  policyId?: string;
  customerId?: string;
  status?: CommissionStatus;
  earnedAt?: string;
  paidAt?: string;
}

export const commissionService = {
  async getCommissions(params?: ListQueryParams): Promise<PaginatedResponse<Commission>> {
    return apiClient<PaginatedResponse<Commission>>('/api/commissions', {
      method: 'GET',
      params: params as Record<string, string | number | boolean | undefined>,
    });
  },

  async getCommissionById(id: string): Promise<Commission> {
    return apiClient<Commission>(`/api/commissions/${id}`, {
      method: 'GET',
    });
  },

  async createCommission(input: CreateCommissionInput): Promise<Commission> {
    return apiClient<Commission>('/api/commissions', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },

  async updateCommission(id: string, input: Partial<CreateCommissionInput>): Promise<Commission> {
    return apiClient<Commission>(`/api/commissions/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(input),
    });
  },
};
