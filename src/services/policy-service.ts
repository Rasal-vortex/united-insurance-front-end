import { apiClient } from '@/lib/api-client';
import { Policy } from '@/types/crm';
import { PaginatedResponse, ListQueryParams } from '@/types/api';

export interface CreatePolicyInput {
  customerId: string;
  policyNumber: string;
  insurer: string;
  product: string;
  policyType: 'Individual' | 'Commercial' | 'Group';
  premium: number;
  startDate: string;
  expiryDate: string;
  status?: 'ACTIVE' | 'EXPIRED' | 'CANCELLED';
  notes?: string;
  staffId?: string;
}

export const policyService = {
  async getPolicies(params?: ListQueryParams): Promise<PaginatedResponse<Policy>> {
    return apiClient<PaginatedResponse<Policy>>('/api/policies', {
      method: 'GET',
      params: params as Record<string, string | number | boolean | undefined>,
    });
  },

  async getPolicyById(id: string): Promise<Policy> {
    return apiClient<Policy>(`/api/policies/${id}`, {
      method: 'GET',
    });
  },

  async createPolicy(input: CreatePolicyInput): Promise<Policy> {
    return apiClient<Policy>('/api/policies', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },

  async updatePolicy(id: string, input: Partial<CreatePolicyInput>): Promise<Policy> {
    return apiClient<Policy>(`/api/policies/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(input),
    });
  },
};
