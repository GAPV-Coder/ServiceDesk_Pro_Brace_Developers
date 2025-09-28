import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    BadRequestException,
} from '@nestjs/common';
import { Response, Request } from 'express';

@Catch(BadRequestException)
export class ValidationExceptionFilter implements ExceptionFilter {
    catch(exception: BadRequestException, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        const exceptionResponse = exception.getResponse() as any;

        // Manejar los errores de validación de Zod específicamente
        if (exceptionResponse.errors && Array.isArray(exceptionResponse.errors)) {
            return response.status(400).json({
                statusCode: 400,
                timestamp: new Date().toISOString(),
                path: request.url,
                method: request.method,
                message: 'Validation failed',
                errors: exceptionResponse.errors,
            });
        }

        // Manejar los errores de validación habituales
        const message = exceptionResponse.message || 'Validation failed';
        const errors = exceptionResponse.message || [];

        response.status(400).json({
            statusCode: 400,
            timestamp: new Date().toISOString(),
            path: request.url,
            method: request.method,
            message,
            errors: Array.isArray(errors) ? errors : [errors],
        });
    }
}