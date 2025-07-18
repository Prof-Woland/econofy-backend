import { ArgumentsHost, Catch, ExceptionFilter, HttpException, Logger } from "@nestjs/common";
import { Response } from "express";
import { timestamp } from "rxjs";

@Catch()
export class AllExceptionFilter implements ExceptionFilter{
    private readonly logger = new Logger(AllExceptionFilter.name)
    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse() as Response;
        const status = exception instanceof HttpException ? exception.getStatus() : 500;
        const message = exception instanceof HttpException ? exception.message : 'Internal Server Error';
        if(status >= 400 && status < 500){
            this.logger.warn(message, exception)
        }
        else{
            this.logger.error(message, exception)
        }

        response.status(status).json({
            status,
            message,
            timestamp: new Date().toISOString(),
            path: ctx.getRequest().url,
        })
    }
}