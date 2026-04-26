import 'dotenv/config';
import { AppEnv, parseEnv } from './env.schema';

let cachedEnv: AppEnv | null = null;

export const getEnv = (): AppEnv => {
  if (!cachedEnv) {
    cachedEnv = parseEnv(process.env);
  }

  return cachedEnv;
};
