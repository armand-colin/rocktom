import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { AppConfigService } from '../config/config.service';
import { Document } from '../modules/document/document.entity';
import { Level } from '../modules/level/level.entity';
import { LevelShare } from '../modules/level/level-share.entity';
import { LevelAccess } from '../modules/level/level-access.entity';
import { Session } from '../modules/session/session.entity';
import { User } from '../modules/user/user.entity';
import { InitialSchema as InitialSchema } from './migrations/20260101-initial-schema';
import { AddDuration } from './migrations/20260603-add-duration';
import { AddInstrumentTypes } from './migrations/20260902-add-instrument-types';
import { AddLevelShare } from './migrations/20260904-add-level-share';

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
        LevelShare,
        LevelAccess,
      ],
      migrations: [InitialSchema, AddDuration, AddInstrumentTypes, AddLevelShare],
      synchronize: false,
      migrationsRun: true,
    };
  }

}
