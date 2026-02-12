import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import {AppLogger} from "./app-logger.service";

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
    constructor(private readonly logger: AppLogger) {}

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const req = context.switchToHttp().getRequest();
        const res = context.switchToHttp().getResponse();

        const { method, originalUrl } = req;
        const start = Date.now();

        return next.handle().pipe(
            tap(() => {
                const time = Date.now() - start;
                this.logger.logResponse(method, originalUrl, res.statusCode, time);
            }),
        );
    }
}