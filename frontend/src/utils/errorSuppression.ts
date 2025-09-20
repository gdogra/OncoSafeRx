/**
 * Error suppression utility for handling known external errors
 * that we cannot control (browser extensions, etc.)
 */

// List of error messages to suppress (these are from browser extensions or other external sources)
const SUPPRESSED_ERROR_PATTERNS = [
  /runtime\.lastError/i,
  /message port closed/i,
  /chrome-extension/i,
  /moz-extension/i,
  /webkit-extension/i,
  /extension context invalidated/i,
  /non-error promise rejection captured/i
];

// List of URLs to ignore errors from
const SUPPRESSED_ERROR_SOURCES = [
  /chrome-extension:/,
  /moz-extension:/,
  /webkit-extension:/,
  /extension/i
];

/**
 * Checks if an error should be suppressed
 */
export function shouldSuppressError(error: Error | string, source?: string): boolean {
  const errorMessage = typeof error === 'string' ? error : error.message;
  
  // Check error message patterns
  const hasPatternMatch = SUPPRESSED_ERROR_PATTERNS.some(pattern => 
    pattern.test(errorMessage)
  );
  
  // Check error source
  const hasSourceMatch = source && SUPPRESSED_ERROR_SOURCES.some(pattern => 
    pattern.test(source)
  );
  
  return hasPatternMatch || hasSourceMatch;
}

/**
 * Enhanced error handler that filters out external/extension errors
 */
export function setupErrorSuppression() {
  // Suppress unhandled promise rejections from extensions
  window.addEventListener('unhandledrejection', (event) => {
    if (shouldSuppressError(event.reason)) {
      event.preventDefault();
      console.debug('Suppressed external error:', event.reason);
    }
  });

  // Suppress general errors from extensions
  window.addEventListener('error', (event) => {
    if (shouldSuppressError(event.error || event.message, event.filename)) {
      event.preventDefault();
      console.debug('Suppressed external error:', event.error || event.message);
    }
  });

  // Suppress console errors from extensions (for development)
  if (process.env.NODE_ENV === 'development') {
    const originalConsoleError = console.error;
    console.error = (...args) => {
      const message = args.join(' ');
      if (!shouldSuppressError(message)) {
        originalConsoleError.apply(console, args);
      }
    };
  }
}

export default setupErrorSuppression;