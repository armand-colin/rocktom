import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppConfigModule } from './config/config.module';
import { AppConfigService } from './config/config.service';
import { MailerModule } from './modules/mailer/mailer.module';
import { SessionModule } from './modules/session/session.module';
import { UserModule } from './modules/user/user.module';
import { TypeOrmConfig } from './database/typeorm.config';

@Module({
  imports: [
    AppConfigModule,
    TypeOrmModule.forRootAsync({
      inject: [AppConfigService],
      useFactory: (config: AppConfigService) => TypeOrmConfig.fromConfig(config),
    }),
    MailerModule,
    UserModule,
    SessionModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
