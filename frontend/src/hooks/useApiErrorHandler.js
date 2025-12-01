import { useCallback } from 'react';

const useApiErrorHandler = () => {
  const handleError = useCallback((error, fallbackMessage = 'Ocurrió un error inesperado') => {
    const message = error?.response?.data?.detail || error?.message || fallbackMessage;
    console.error(message, error);
    window.alert(message);
  }, []);

  return handleError;
};

export default useApiErrorHandler;
