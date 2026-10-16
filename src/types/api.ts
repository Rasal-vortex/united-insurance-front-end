export interface PaginationMetadata {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMetadata;
  syncTimestamp?: string;
  latencyMs?: number;
}

export interface ApiErrorResponse {
  error: string;
  message: string;
  statusCode: number;
  fieldErrors?: Record<string, string>;
}

export interface ListQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  insurer?: string;
  branchId?: string;
  startDate?: string;
  endDate?: string;
}
