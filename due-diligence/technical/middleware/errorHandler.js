// Custom error classes
export class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ValidationError';
    this.statusCode = 400;
  }
}

export class NotFoundError extends Error {
  constructor(message = 'Resource not found') {
    super(message);
    this.name = 'NotFoundError';
    this.statusCode = 404;
  }
}

export class ExternalAPIError extends Error {
  constructor(message, service) {
    super(message);
    this.name = 'ExternalAPIError';
    this.service = service;
    this.statusCode = 503;
  }
}

export class RateLimitError extends Error {
  constructor(message = 'Rate limit exceeded') {
    super(message);
    this.name = 'RateLimitError';
    this.statusCode = 429;
  }
}

// Error response formatter
export const formatErrorResponse = (error, req) => {
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  const baseResponse = {
    error: error.message,
    timestamp: new Date().toISOString(),
    path: req.originalUrl,
    method: req.method
  };

  // Add stack trace in development
  if (isDevelopment && error.stack) {
    baseResponse.stack = error.stack;
  }

  // Add service info for external API errors
  if (error.service) {
    baseResponse.service = error.service;
  }

  return baseResponse;
};

// Global error handler middleware
export const errorHandler = (err, req, res, next) => {
  // Log error for monitoring
  console.error(`[${new Date().toISOString()}] ${err.name}: ${err.message}`);
  
  if (process.env.NODE_ENV === 'development') {
    console.error(err.stack);
  }

  // Determine status code
  let statusCode = 500;
  if (err.statusCode) {
    statusCode = err.statusCode;
  } else if (err.name === 'ValidationError') {
    statusCode = 400;
  } else if (err.name === 'CastError') {
    statusCode = 400;
  }

  // Format and send error response
  const errorResponse = formatErrorResponse(err, req);
  res.status(statusCode).json(errorResponse);
};

// Async error wrapper
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// 404 handler
export const notFoundHandler = (req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    path: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString(),
    availableEndpoints: [
      'GET /health',
      'GET /api/drugs/search',
      'GET /api/drugs/:rxcui',
      'GET /api/drugs/labels/search',
      'GET /api/interactions/known',
      'POST /api/interactions/check',
      'GET /api/genomics/cpic/guidelines'
    ]
  });
};
