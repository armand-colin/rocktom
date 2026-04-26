import 'dotenv/config';
import { parseEnv } from './env.schema';
import type { AppEnv } from './env.schema';

let cachedEnv: AppEnv | null = null;

export const getEnv = (): AppEnv => {
  if (!cachedEnv) {
    cachedEnv = parseEnv(process.env);
  }

  return cachedEnv;
};
