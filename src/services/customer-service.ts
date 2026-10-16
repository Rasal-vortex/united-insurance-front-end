import { apiClient } from '@/lib/api-client';
import { Customer, EntityStatus } from '@/types/crm';
import { PaginatedResponse, ListQueryParams } from '@/types/api';

export interface CreateCustomerInput {
  name: string;
  phone: string;
  email?: string;
  dob?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  address?: string;
  notes?: string;
  status?: EntityStatus;
  staffId?: string;
}

export const customerService = {
  async getCustomers(params?: ListQueryParams): Promise<PaginatedResponse<Customer>> {
    return apiClient<PaginatedResponse<Customer>>('/api/customers', {
      method: 'GET',
      params: params as Record<string, string | number | boolean | undefined>,
    });
  },

  async getCustomerById(id: string): Promise<Customer> {
    return apiClient<Customer>(`/api/customers/${id}`, {
      method: 'GET',
    });
  },

  async createCustomer(input: CreateCustomerInput): Promise<Customer> {
    return apiClient<Customer>('/api/customers', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },

  async updateCustomer(id: string, input: Partial<CreateCustomerInput>): Promise<Customer> {
    return apiClient<Customer>(`/api/customers/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(input),
    });
  },

  async deleteCustomer(id: string): Promise<{ success: boolean; id: string }> {
    return apiClient<{ success: boolean; id: string }>(`/api/customers/${id}`, {
      method: 'DELETE',
    });
  },
};
