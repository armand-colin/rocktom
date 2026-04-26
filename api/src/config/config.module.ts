import { Global, Module } from '@nestjs/common';
import { getEnv } from './env';
import { AppEnv } from './env.schema';
import { AppConfigService } from './config.service';

@Global()
@Module({
  providers: [
    {
      provide: 'APP_ENV',
      useFactory: (): AppEnv => getEnv(),
    },
    {
      provide: AppConfigService,
      useFactory: (env: AppEnv) => new AppConfigService(env),
      inject: ['APP_ENV'],
    },
  ],
  exports: [AppConfigService],
})
export class AppConfigModule {}
