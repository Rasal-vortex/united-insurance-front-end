import { apiClient } from '@/lib/api-client';
import { Staff, EntityStatus } from '@/types/crm';
import { PaginatedResponse, ListQueryParams } from '@/types/api';

export interface CreateStaffInput {
  name: string;
  phone: string;
  email?: string;
  designation?: string;
  status?: EntityStatus;
  joiningDate?: string;
}

export const staffService = {
  async getStaff(params?: ListQueryParams): Promise<PaginatedResponse<Staff>> {
    return apiClient<PaginatedResponse<Staff>>('/api/staff', {
      method: 'GET',
      params: params as Record<string, string | number | boolean | undefined>,
    });
  },

  async getStaffById(id: string): Promise<Staff> {
    return apiClient<Staff>(`/api/staff/${id}`, {
      method: 'GET',
    });
  },

  async createStaff(input: CreateStaffInput): Promise<Staff> {
    return apiClient<Staff>('/api/staff', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },

  async updateStaff(id: string, input: Partial<CreateStaffInput>): Promise<Staff> {
    return apiClient<Staff>(`/api/staff/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(input),
    });
  },

  async deleteStaff(id: string): Promise<{ success: boolean; id: string }> {
    return apiClient<{ success: boolean; id: string }>(`/api/staff/${id}`, {
      method: 'DELETE',
    });
  },
};
