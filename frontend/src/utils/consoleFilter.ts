/**
 * Console filter to reduce noise from expected network errors in development
 */

export const setupConsoleFilter = () => {
  // Filter in both dev and production to suppress expected 404s when backend is unavailable

  const originalError = console.error;
  const originalWarn = console.warn;

  console.error = (...args: any[]) => {
    const message = args.join(' ');
    
    // Filter out common development network errors
    if (
      message.includes('ERR_CONNECTION_REFUSED') ||
      message.includes('ERR_ABORTED') ||
      message.includes('500 (Internal Server Error)') ||
      message.includes('api/regimens') ||
      message.includes('api/drugs/suggestions') ||
      message.includes('api/pain/opiates') ||
      message.includes('api/patients') ||
      message.includes('api/admin') ||
      message.includes('api/supabase-auth') ||
      message.includes('404 (Not Found)') ||
      message.includes('Failed to load resource') ||
      message.includes('localhost:3000') ||
      (message.includes('localhost:5177') && message.includes('500'))
    ) {
      return; // Suppress these errors
    }
    
    originalError.apply(console, args);
  };

  console.warn = (...args: any[]) => {
    const message = args.join(' ');
    
    // Filter out network warnings
    if (
      message.includes('Failed to load') ||
      message.includes('health check failed') ||
      message.includes('API health check')
    ) {
      return; // Suppress these warnings
    }
    
    originalWarn.apply(console, args);
  };

  // Console filter enabled for development mode
};