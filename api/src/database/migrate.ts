async function runMigrate() {
  // TODO

  // const appConfig = new AppConfigService(getEnv());
  // const dataSource = new DataSource(TypeOrmConfig.fromConfig(appConfig));

  // await dataSource.initialize();

  // try {
  //   await dataSource.runMigrations();
  // } finally {
  //   await dataSource.destroy();
  // }
}

runMigrate().catch((error) => {
  console.error(error);
  process.exit(1);
});
