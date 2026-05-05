import { DataSource } from 'typeorm';
import { TypeOrmConfig } from './typeorm.config';
import { AppConfigService } from '../config/config.service';
import { getEnv } from '../config/env';

async function run() {
  const appConfig = new AppConfigService(getEnv());
  const dataSource = new DataSource(TypeOrmConfig.fromConfig(appConfig));

  await dataSource.initialize();

  try {
    await dataSource.runMigrations();
  } finally {
    await dataSource.destroy();
  }
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
