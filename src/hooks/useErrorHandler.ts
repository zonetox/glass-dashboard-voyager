import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

export interface ApiError {
  message: string;
  code?: string;
  status?: number;
  details?: any;
}

export interface ErrorState {
  error: ApiError | null;
  isError: boolean;
  clearError: () => void;
}

export function useErrorHandler(): ErrorState & {
  handleError: (error: unknown) => void;
  withErrorHandling: <T extends any[], R>(
    fn: (...args: T) => Promise<R>
  ) => (...args: T) => Promise<R | undefined>;
} {
  const [error, setError] = useState<ApiError | null>(null);
  const { toast } = useToast();

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const handleError = useCallback((error: unknown) => {
    console.error('Error occurred:', error);
    
    let apiError: ApiError;

    if (error instanceof Error) {
      apiError = {
        message: error.message,
        details: error
      };
    } else if (typeof error === 'object' && error !== null) {
      const errorObj = error as any;
      apiError = {
        message: errorObj.message || 'An unexpected error occurred',
        code: errorObj.code,
        status: errorObj.status,
        details: errorObj
      };
    } else {
      apiError = {
        message: 'An unexpected error occurred',
        details: error
      };
    }

    setError(apiError);
    
    // Show toast notification for user feedback
    toast({
      title: "Lỗi",
      description: apiError.message,
      variant: "destructive",
    });
  }, [toast]);

  const withErrorHandling = useCallback(
    <T extends any[], R>(fn: (...args: T) => Promise<R>) => {
      return async (...args: T): Promise<R | undefined> => {
        try {
          clearError();
          return await fn(...args);
        } catch (error) {
          handleError(error);
          return undefined;
        }
      };
    },
    [handleError, clearError]
  );

  return {
    error,
    isError: error !== null,
    clearError,
    handleError,
    withErrorHandling
  };
}