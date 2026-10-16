import { apiClient } from '@/lib/api-client';
import { Claim, ClaimStatus } from '@/types/crm';
import { PaginatedResponse, ListQueryParams } from '@/types/api';

export interface CreateClaimInput {
  customerId: string;
  claimDate: string;
  policyId?: string;
  claimNumber?: string;
  status?: ClaimStatus;
  amount?: number;
  notes?: string;
}

export const claimService = {
  async getClaims(params?: ListQueryParams): Promise<PaginatedResponse<Claim>> {
    return apiClient<PaginatedResponse<Claim>>('/api/claims', {
      method: 'GET',
      params: params as Record<string, string | number | boolean | undefined>,
    });
  },

  async getClaimById(id: string): Promise<Claim> {
    return apiClient<Claim>(`/api/claims/${id}`, {
      method: 'GET',
    });
  },

  async createClaim(input: CreateClaimInput): Promise<Claim> {
    return apiClient<Claim>('/api/claims', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },

  async updateClaim(id: string, input: Partial<CreateClaimInput>): Promise<Claim> {
    return apiClient<Claim>(`/api/claims/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(input),
    });
  },
};
