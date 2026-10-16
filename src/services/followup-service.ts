import { apiClient } from '@/lib/api-client';
import { FollowUp, FollowUpStatus } from '@/types/crm';
import { PaginatedResponse, ListQueryParams } from '@/types/api';

export interface CreateFollowUpInput {
  title: string;
  dueAt: string;
  customerId?: string;
  leadId?: string;
  staffId?: string;
  status?: FollowUpStatus;
  notes?: string;
  completedAt?: string;
}

export const followUpService = {
  async getFollowUps(params?: ListQueryParams): Promise<PaginatedResponse<FollowUp>> {
    return apiClient<PaginatedResponse<FollowUp>>('/api/follow-ups', {
      method: 'GET',
      params: params as Record<string, string | number | boolean | undefined>,
    });
  },

  async getFollowUpById(id: string): Promise<FollowUp> {
    return apiClient<FollowUp>(`/api/follow-ups/${id}`, {
      method: 'GET',
    });
  },

  async createFollowUp(input: CreateFollowUpInput): Promise<FollowUp> {
    return apiClient<FollowUp>('/api/follow-ups', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },

  async updateFollowUp(id: string, input: Partial<CreateFollowUpInput>): Promise<FollowUp> {
    return apiClient<FollowUp>(`/api/follow-ups/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(input),
    });
  },

  async deleteFollowUp(id: string): Promise<{ success: boolean; id: string }> {
    return apiClient<{ success: boolean; id: string }>(`/api/follow-ups/${id}`, {
      method: 'DELETE',
    });
  },
};
