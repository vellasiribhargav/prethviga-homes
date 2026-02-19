/**
 * Custom Error Classes for better error handling
 */

class AppError extends Error {
    constructor(message, statusCode, isOperational = true) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        Error.captureStackTrace(this, this.constructor);
    }
}

class ValidationError extends AppError {
    constructor(message = 'Validation failed') {
        super(message, 400);
    }
}

class NotFoundError extends AppError {
    constructor(message = 'Resource not found') {
        super(message, 404);
    }
}

class UnauthorizedError extends AppError {
    constructor(message = 'Unauthorized access') {
        super(message, 401);
    }
}

class ForbiddenError extends AppError {
    constructor(message = 'Access forbidden') {
        super(message, 403);
    }
}

class DatabaseError extends AppError {
    constructor(message = 'Database operation failed') {
        super(message, 500);
    }
}

const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};

const formatErrorResponse = (err, req, res) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';

    const isJsonRequest =
        req.xhr ||
        (req.get('Accept') && req.get('Accept').includes('json')) ||
        req.path.startsWith('/api/') ||
        req.path.startsWith('/admin/');

    if (isJsonRequest || statusCode === 401) {
        return res.status(statusCode).json({
            success: false,
            message,
            ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
        });
    }

    if (statusCode === 404) {
        return res.status(404).render('404', {
            message,
            error: process.env.NODE_ENV === 'development' ? err : {}
        });
    }

    // For all other errors, send JSON response to avoid missing view errors
    res.status(statusCode).json({
        success: false,
        message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
};

const logError = (err) => {
    if (process.env.NODE_ENV === 'development') {
        console.error('Error Details:', {
            message: err.message,
            statusCode: err.statusCode,
            stack: err.stack,
            isOperational: err.isOperational
        });
    } else {
        console.error(`[${new Date().toISOString()}] ${err.statusCode || 500}: ${err.message}`);
    }
};

module.exports = {
    AppError,
    ValidationError,
    NotFoundError,
    UnauthorizedError,
    ForbiddenError,
    DatabaseError,
    asyncHandler,
    formatErrorResponse,
    logError
};
