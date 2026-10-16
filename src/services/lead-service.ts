import { apiClient } from '@/lib/api-client';
import { Lead, LeadStatus, Customer } from '@/types/crm';
import { PaginatedResponse, ListQueryParams } from '@/types/api';

export interface CreateLeadInput {
  name: string;
  phone: string;
  email?: string;
  source?: string;
  interest?: string;
  status?: LeadStatus;
  nextFollowUpAt?: string;
  notes?: string;
  staffId?: string;
}

export const leadService = {
  async getLeads(params?: ListQueryParams): Promise<PaginatedResponse<Lead>> {
    return apiClient<PaginatedResponse<Lead>>('/api/leads', {
      method: 'GET',
      params: params as Record<string, string | number | boolean | undefined>,
    });
  },

  async getLeadById(id: string): Promise<Lead> {
    return apiClient<Lead>(`/api/leads/${id}`, {
      method: 'GET',
    });
  },

  async createLead(input: CreateLeadInput): Promise<Lead> {
    return apiClient<Lead>('/api/leads', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },

  async updateLead(id: string, input: Partial<CreateLeadInput>): Promise<Lead> {
    return apiClient<Lead>(`/api/leads/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(input),
    });
  },

  async deleteLead(id: string): Promise<{ success: boolean; id: string }> {
    return apiClient<{ success: boolean; id: string }>(`/api/leads/${id}`, {
      method: 'DELETE',
    });
  },

  async convertLead(id: string): Promise<{ success: boolean; customer: Customer; lead: Lead }> {
    return apiClient<{ success: boolean; customer: Customer; lead: Lead }>(`/api/leads/${id}/convert`, {
      method: 'POST',
    });
  },
};
