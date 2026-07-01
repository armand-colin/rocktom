import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { AppConfigService } from '../config/config.service';
import { Document } from '../modules/document/document.entity';
import { Level } from '../modules/level/level.entity';
import { Session } from '../modules/session/session.entity';
import { User } from '../modules/user/user.entity';
import { InitialSchema as InitialSchema } from './migrations/20260101-initial-schema';
import { AddDuration } from './migrations/20260603-add-duration';
import { AddPlaybackAndShare } from './migrations/20260618-add-playback-and-share';

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
      migrations: [InitialSchema, AddDuration, AddPlaybackAndShare],
      synchronize: false,
      migrationsRun: true,
    };
  }

}
