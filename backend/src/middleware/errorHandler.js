// Error handling middleware

/**
 * Custom error class
 */
export class AppError extends Error {
  constructor(message, statusCode = 500, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Global error handler middleware
 */
export function errorHandler(err, req, res, next) {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Log error
  console.error('Error:', {
    message: err.message,
    statusCode: err.statusCode,
    stack: err.stack,
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString()
  });

  // Development error response
  if (process.env.NODE_ENV === 'development') {
    return res.status(err.statusCode).json({
      status: err.status,
      error: err.message,
      details: err.details,
      stack: err.stack,
      path: req.path,
      timestamp: new Date().toISOString()
    });
  }

  // Production error response (hide sensitive info)
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      status: err.status,
      error: err.message,
      details: err.details
    });
  }

  // Programming or unknown errors: don't leak details
  return res.status(500).json({
    status: 'error',
    error: 'Something went wrong. Please try again later.'
  });
}

/**
 * 404 Not Found handler
 */
export function notFoundHandler(req, res, next) {
  const error = new AppError(
    `Route not found: ${req.method} ${req.path}`,
    404
  );
  next(error);
}

/**
 * Async error wrapper
 */
export function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * Validation error handler
 */
export function validationError(errors) {
  return new AppError('Validation failed', 400, errors);
}

/**
 * Database error handler
 */
export function databaseError(message = 'Database operation failed') {
  return new AppError(message, 500);
}

/**
 * Authentication error handler
 */
export function authError(message = 'Authentication required') {
  return new AppError(message, 401);
}

/**
 * Authorization error handler
 */
export function forbiddenError(message = 'Access forbidden') {
  return new AppError(message, 403);
}

/**
 * Not found error handler
 */
export function notFoundError(resource = 'Resource') {
  return new AppError(`${resource} not found`, 404);
}