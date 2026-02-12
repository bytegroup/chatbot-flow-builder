import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class AppLogger extends Logger {
    logRequest(method: string, url: string) {
        this.log(`➡️  ${method} ${url}`, 'Request');
    }

    logResponse(method: string, url: string, statusCode: number, time: number) {
        this.log(`⬅️  ${method} ${url} ${statusCode} +${time}ms`, 'Response');
    }

    logError(message: string, trace?: string) {
        this.error(message, trace, 'Error');
    }
}