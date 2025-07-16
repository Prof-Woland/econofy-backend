import { Injectable, Logger, NestMiddleware } from "@nestjs/common";
import { NextFunction } from "express";

@Injectable()
export class LoggingMiddleware implements NestMiddleware{
    private readonly logger = new Logger()
    use(req: Request, res: Response, next: NextFunction) {
        this.logger.log(req.method + ' request', '')
        next()
    }
}