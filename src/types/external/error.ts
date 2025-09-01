export interface ApiError {
  message: string;
  timestamp: string;
  requestid: string;
  details?: string | { details: string } | { details: { details: string[] } };
}
