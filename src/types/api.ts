export interface ApiResponse<T = null> {
  code: 0 | 1;
  codeText: string;
  data: T;
}

export interface ListData {
  total: number;
  hasMore: boolean;
}

export interface GetPaginationParams {
  limit?: number;
  offset?: number;
  sort?: "newest" | "oldest";
}
