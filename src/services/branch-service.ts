import { apiClient } from '@/lib/api-client';
import { Branch } from '@/types/crm';

export interface CreateBranchInput {
  name: string;
  code: string;
  region?: string;
  territory?: string;
  username: string;
  password?: string;
  phone: string;
  email: string;
  address: string;
  active?: boolean;
}

export const branchService = {
  async createBranch(input: CreateBranchInput): Promise<Branch> {
    return apiClient<Branch>('/api/branches', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },
};
