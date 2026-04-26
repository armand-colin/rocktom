import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { getEnv } from '../config/env';
import { Logger } from '@nestjs/common';
import { AppConfigService } from '../config/config.service';
import { Document } from '../modules/document/document.entity';
import { Level } from '../modules/level/level.entity';
import { Session } from '../modules/session/session.entity';
import { User } from '../modules/user/user.entity';

const env = getEnv();

const logger = new Logger('TypeOrmConfig');

logger.log(JSON.stringify(env, null, 2));

export namespace TypeOrmConfig {

  export function fromConfig(config: AppConfigService): TypeOrmModuleOptions {
    return {
      type: 'postgres',
      host: config.database.host,
      port: config.database.port,
      username: config.database.username,
      password: config.database.password,
      database: config.database.database,
      entities: [
        User,
        Session,
        Document,
        Level,
      ],
      synchronize: true,
    };
  }
}
