export { JobService } from './jobService';

// Export common API error handling
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Common API response handler
export const handleApiResponse = <T>(response: any): T => {
  if (response.error) {
    throw new ApiError(
      response.error.message || 'An error occurred',
      response.status,
      response.error.code
    );
  }
  return response.data;
};
