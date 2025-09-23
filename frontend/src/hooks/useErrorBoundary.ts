import { useCallback, useState } from 'react';

interface ErrorBoundaryHook {
  error: Error | null;
  resetError: () => void;
  captureError: (error: Error) => void;
}

export const useErrorBoundary = (): ErrorBoundaryHook => {
  const [error, setError] = useState<Error | null>(null);

  const resetError = useCallback(() => {
    setError(null);
  }, []);

  const captureError = useCallback((error: Error) => {
    setError(error);
  }, []);

  return {
    error,
    resetError,
    captureError,
  };
};

export const useAsyncError = () => {
  const { captureError } = useErrorBoundary();

  return useCallback((error: Error) => {
    // Throw the error in the next tick to trigger error boundary
    setTimeout(() => {
      throw error;
    }, 0);
  }, [captureError]);
};

export default useErrorBoundary;