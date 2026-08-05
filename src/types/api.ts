export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  errors?: unknown;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
