import { PostgrestError } from '@supabase/supabase-js';

export enum ErrorCode {
  NETWORK_ERROR = 'NETWORK_ERROR',
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR = 'AUTHORIZATION_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  CONFLICT = 'CONFLICT',
  RATE_LIMIT = 'RATE_LIMIT',
  SERVER_ERROR = 'SERVER_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

export interface AppError {
  code: ErrorCode;
  message: string;
  originalError?: Error;
  details?: any;
}

export class ApiError extends Error implements AppError {
  public readonly code: ErrorCode;
  public readonly originalError?: Error;
  public readonly details?: any;

  constructor(code: ErrorCode, message: string, originalError?: Error, details?: any) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.originalError = originalError;
    this.details = details;
  }
}

/**
 * Converts various error types to standardized AppError
 */
export const handleApiError = (error: unknown): ApiError => {
  // Handle PostgrestError from Supabase
  if (isPostgrestError(error)) {
    return handlePostgrestError(error);
  }

  // Handle network errors
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return new ApiError(
      ErrorCode.NETWORK_ERROR,
      'Unable to connect to the server. Please check your internet connection and try again.',
      error as Error
    );
  }

  // Handle generic errors
  if (error instanceof Error) {
    return new ApiError(
      ErrorCode.UNKNOWN_ERROR,
      error.message || 'An unexpected error occurred',
      error
    );
  }

  // Handle string errors
  if (typeof error === 'string') {
    return new ApiError(ErrorCode.UNKNOWN_ERROR, error);
  }

  // Handle unknown error types
  return new ApiError(
    ErrorCode.UNKNOWN_ERROR,
    'An unexpected error occurred'
  );
};

/**
 * Handle PostgrestError from Supabase
 */
const handlePostgrestError = (error: PostgrestError): ApiError => {
  const { code, message, details, hint } = error;

  switch (code) {
    case 'PGRST116':
      return new ApiError(
        ErrorCode.NOT_FOUND,
        'The requested resource was not found.',
        error,
        { code, details, hint }
      );

    case 'PGRST301':
      return new ApiError(
        ErrorCode.AUTHENTICATION_ERROR,
        'Authentication required. Please log in and try again.',
        error,
        { code, details, hint }
      );

    case 'PGRST302':
      return new ApiError(
        ErrorCode.AUTHORIZATION_ERROR,
        'You do not have permission to perform this action.',
        error,
        { code, details, hint }
      );

    case '23505': // PostgreSQL unique violation
      return new ApiError(
        ErrorCode.CONFLICT,
        'A record with these details already exists.',
        error,
        { code, details, hint }
      );

    case '23503': // PostgreSQL foreign key violation
      return new ApiError(
        ErrorCode.VALIDATION_ERROR,
        'Invalid reference to related data.',
        error,
        { code, details, hint }
      );

    case '23502': // PostgreSQL not null violation
      return new ApiError(
        ErrorCode.VALIDATION_ERROR,
        'Required information is missing.',
        error,
        { code, details, hint }
      );

    default:
      return new ApiError(
        ErrorCode.SERVER_ERROR,
        message || 'A server error occurred. Please try again later.',
        error,
        { code, details, hint }
      );
  }
};

/**
 * Type guard for PostgrestError
 */
const isPostgrestError = (error: unknown): error is PostgrestError => {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    'message' in error &&
    'details' in error
  );
};

/**
 * Get user-friendly error messages
 */
export const getErrorMessage = (error: AppError | Error | unknown): string => {
  if (error instanceof ApiError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === 'string') {
    return error;
  }

  return 'An unexpected error occurred';
};

/**
 * Retry function with exponential backoff
 */
export const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  baseDelay = 1000
): Promise<T> => {
  let lastError: unknown;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // Don't retry on authentication/authorization errors
      const appError = handleApiError(error);
      if (
        appError.code === ErrorCode.AUTHENTICATION_ERROR ||
        appError.code === ErrorCode.AUTHORIZATION_ERROR ||
        appError.code === ErrorCode.VALIDATION_ERROR
      ) {
        throw appError;
      }

      // Don't retry on the last attempt
      if (attempt === maxRetries) {
        break;
      }

      // Wait with exponential backoff
      const delay = baseDelay * Math.pow(2, attempt);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw handleApiError(lastError);
};

/**
 * Log errors for monitoring (placeholder for actual error tracking service)
 */
export const logError = (error: AppError | Error, context?: any): void => {
  const errorData = {
    timestamp: new Date().toISOString(),
    error: {
      name: error.name,
      message: error.message,
      stack: error.stack,
    },
    context,
  };

  // In production, send to error tracking service like Sentry
  if (process.env.NODE_ENV === 'production') {
    // Send to error tracking service
    console.error('[ERROR TRACKING]', errorData);
  } else {
    console.error('[ERROR]', errorData);
  }
};
