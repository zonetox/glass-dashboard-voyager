import { useCallback } from 'react';
import { useLoadingState } from './useLoadingState';
import { useErrorHandler } from './useErrorHandler';
import { useNotifications } from './useNotifications';

interface ApiRequestOptions {
  loadingMessage?: string;
  successMessage?: string;
  errorMessage?: string;
  showSuccessToast?: boolean;
  showErrorToast?: boolean;
}

/**
 * Unified hook for API requests with consistent loading, error handling, and notifications
 */
export function useApiRequest() {
  const { isLoading, progress, startLoading, updateProgress, stopLoading } = useLoadingState();
  const { error, handleError, clearError } = useErrorHandler();
  const { showNotification } = useNotifications();

  const executeRequest = useCallback(
    async <T,>(
      requestFn: () => Promise<T>,
      options: ApiRequestOptions = {}
    ): Promise<T | null> => {
      const {
        loadingMessage = 'Processing...',
        successMessage,
        errorMessage = 'An error occurred',
        showSuccessToast = false,
        showErrorToast = true,
      } = options;

      clearError();
      startLoading(loadingMessage);

      try {
        const result = await requestFn();
        
        if (showSuccessToast && successMessage) {
          showNotification({
            title: 'Success',
            description: successMessage,
            variant: 'default',
          });
        }
        
        return result;
      } catch (err) {
        if (showErrorToast) {
          handleError(err);
        }
        console.error(errorMessage, err);
        return null;
      } finally {
        stopLoading();
      }
    },
    [startLoading, stopLoading, handleError, clearError, showNotification]
  );

  return {
    isLoading,
    progress,
    error,
    updateProgress,
    executeRequest,
    clearError,
  };
}
