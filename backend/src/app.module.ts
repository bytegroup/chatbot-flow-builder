import {MiddlewareConsumer, Module, NestModule, RequestMethod} from '@nestjs/common';
import {AppController} from './app.controller';
import {AppService} from './app.service';
import {ConfigModule, ConfigService} from "@nestjs/config";
import {AuthModule} from './auth/auth.module';
import {UsersModule} from './users/users.module';
import {MongooseModule} from "@nestjs/mongoose";
import {APP_GUARD} from "@nestjs/core";
import {JwtAuthGuard} from "./auth/guards/jwt-auth.guard";
import {AppLogger} from "./common/app-logger.service";
import {LoggerMiddleware} from "./middleware/logger.middleware";
import {FlowsModule} from "./flows/flows.module";
import {ChatModule} from "./chat/chat.module";

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: '.env',
        }),
        MongooseModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService) => ({
                uri: configService.get<string>('MONGODB_URI'),
                // Additional Mongoose options
                retryWrites: true,
                w: 'majority',
            }),
            inject: [ConfigService],
        }),
        AuthModule,
        UsersModule,
        FlowsModule,
        ChatModule,
    ],
    controllers: [AppController],
    providers: [
        AppService,
        {
            provide: APP_GUARD,
            useClass: JwtAuthGuard,
        },
        AppLogger
    ],
    exports: [AppLogger],
})
export class AppModule implements NestModule {
    configure(consumer: MiddlewareConsumer): any {
        consumer
            .apply(LoggerMiddleware)
            .forRoutes({path: '*', method: RequestMethod.ALL});
    }
}
