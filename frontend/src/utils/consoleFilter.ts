/**
 * Console filter to reduce noise from expected network errors in development
 */

export const setupConsoleFilter = () => {
  if (window.location.hostname !== 'localhost') {
    return; // Only filter in development
  }

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