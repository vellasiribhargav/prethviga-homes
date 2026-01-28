const { formatErrorResponse, logError } = require('../utils/errorHandler');

/**
 * Global Error Handling Middleware
 * This should be the last middleware in your app.js
 */
const errorHandler = (err, req, res, next) => {
    // Log the error
    logError(err);

    // Handle specific error types
    if (err.name === 'ValidationError') {
        err.statusCode = 400;
        err.message = Object.values(err.errors).map(e => e.message).join(', ');
    }

    if (err.name === 'CastError') {
        err.statusCode = 400;
        err.message = 'Invalid ID format';
    }

    if (err.code === 11000) {
        err.statusCode = 400;
        const field = Object.keys(err.keyPattern)[0];
        err.message = `Duplicate value for field: ${field}`;
    }

    if (err.name === 'JsonWebTokenError') {
        err.statusCode = 401;
        err.message = 'Invalid token';
    }

    if (err.name === 'TokenExpiredError') {
        err.statusCode = 401;
        err.message = 'Token expired';
    }

    // Send formatted error response
    formatErrorResponse(err, req, res);
};

/**
 * 404 Not Found Handler
 * Use this before the error handler middleware
 */
const notFoundHandler = (req, res, next) => {
    const error = new Error(`Route not found: ${req.originalUrl}`);
    error.statusCode = 404;
    next(error);
};

module.exports = {
    errorHandler,
    notFoundHandler
};
