import { z } from 'zod';

const mailerModeSchema = z.enum(['local', 'smtp']);

const baseEnvSchema = z.object({
  PORT: z.coerce.number().int().positive().default(3000),
  CORS_ORIGIN: z.string().min(1).default('http://localhost:5173'),
  DB_HOST: z.string().min(1).default('localhost'),
  DB_PORT: z.coerce.number().int().positive().default(5432),
  DB_USER: z.string().min(1).default('postgres'),
  DB_PASSWORD: z.string().min(1).default('postgres'),
  DB_NAME: z.string().min(1).default('app'),
  JWT_SECRET: z.string().min(1, 'JWT_SECRET is required'),
  MAILER_MODE: mailerModeSchema.default('local'),
  MAILER_FROM: z.string().min(1).default('Rocktom <noreply@localhost>'),
  MAILER_HOST: z.string().optional(),
  MAILER_PORT: z.coerce.number().int().positive().optional(),
  MAILER_USER: z.string().optional(),
  MAILER_PASS: z.string().optional(),
  MAILER_SECURE: z
    .enum(['true', 'false'])
    .transform((value) => value === 'true')
    .optional()
    .default(false),
  STORAGE_PATH: z.string().min(1),
});

export const envSchema = baseEnvSchema.superRefine((env, context) => {
  if (env.MAILER_MODE !== 'smtp') {
    return;
  }

  const requiredKeys: Array<keyof typeof env> = [
    'MAILER_HOST',
    'MAILER_PORT',
    'MAILER_USER',
    'MAILER_PASS',
  ];

  for (const key of requiredKeys) {
    if (!env[key]) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: [key],
        message: `${key} is required when MAILER_MODE=smtp`,
      });
    }
  }
});

export type AppEnv = z.infer<typeof envSchema>;

export const parseEnv = (rawEnv: Record<string, unknown>): AppEnv => {
  return envSchema.parse(rawEnv);
};
