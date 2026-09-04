async function runRevertMigration() {
  // TODO

  // const appConfig = new AppConfigService(getEnv());
  // const dataSource = TypeOrmConfig.fromConfig(appConfig);

  // await dataSource.initialize();

  // try {
  //   await dataSource.undoLastMigration();
  // } finally {
  //   await dataSource.destroy();
  // }
}

runRevertMigration().catch((error) => {
  console.error(error);
  process.exit(1);
});
