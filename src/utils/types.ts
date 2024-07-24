export interface ResponseData {
  status: string;
  message?: string | null;
  data?: unknown;
}

export interface ErrorResponse {
  name?: string;
  message: string;
  statusCode?: number;
}
