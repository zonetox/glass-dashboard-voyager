import { useState, useCallback } from 'react';

export interface LoadingState {
  isLoading: boolean;
  loadingText: string;
  progress: number;
}

export function useLoadingState(initialText = 'Loading...') {
  const [state, setState] = useState<LoadingState>({
    isLoading: false,
    loadingText: initialText,
    progress: 0
  });

  const startLoading = useCallback((text?: string) => {
    setState({
      isLoading: true,
      loadingText: text || initialText,
      progress: 0
    });
  }, [initialText]);

  const updateProgress = useCallback((progress: number, text?: string) => {
    setState(prev => ({
      ...prev,
      progress: Math.max(0, Math.min(100, progress)),
      loadingText: text || prev.loadingText
    }));
  }, []);

  const stopLoading = useCallback(() => {
    setState({
      isLoading: false,
      loadingText: initialText,
      progress: 0
    });
  }, [initialText]);

  const withLoading = useCallback(
    <T extends any[], R>(
      fn: (...args: T) => Promise<R>,
      loadingText?: string
    ) => {
      return async (...args: T): Promise<R> => {
        startLoading(loadingText);
        try {
          const result = await fn(...args);
          stopLoading();
          return result;
        } catch (error) {
          stopLoading();
          throw error;
        }
      };
    },
    [startLoading, stopLoading]
  );

  return {
    ...state,
    startLoading,
    updateProgress,
    stopLoading,
    withLoading
  };
}