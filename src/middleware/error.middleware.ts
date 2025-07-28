import { Request, Response, NextFunction } from 'express';

interface ErrorWithStatus extends Error {
    statusCode?: number;
    status?: string;
    code?: number;
    keyValue?: any;
    value?: string;
}

// Not Found Handler
export const notFound = (req: Request, res: Response, next: NextFunction) => {
    const error = new Error(`Not Found - ${req.originalUrl}`) as ErrorWithStatus;
    res.status(404);
    next(error);
};

// Error Handler
export const errorHandler = (
    err: ErrorWithStatus,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    let message = err.message;

    // Handle specific MongoDB errors
    if (err.name === 'CastError') {
        statusCode = 404;
        message = 'Resource not found';
    }

    // Handle duplicate key errors
    if (err.code === 11000) {
        statusCode = 400;
        const field = Object.keys(err.keyValue || {})[0];
        message = `Duplicate field value: ${field}. Please use another value.`;
    }

    // Handle validation errors
    if (err.name === 'ValidationError') {
        statusCode = 400;
        const messages = Object.values((err as any).errors).map((val: any) => val.message);
        message = messages.join('. ');
    }

    res.status(statusCode).json({
        success: false,
        message,
        stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack,
    });
};
