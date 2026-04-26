import { Injectable } from '@nestjs/common';
import { AppEnv } from './env.schema';

@Injectable()
export class AppConfigService {

  constructor(private readonly env: AppEnv) { }

  get port(): number {
    return this.env.PORT;
  }

  get jwtSecret(): string {
    return this.env.JWT_SECRET;
  }

  get database() {
    return {
      host: this.env.DB_HOST,
      port: this.env.DB_PORT,
      username: this.env.DB_USER,
      password: this.env.DB_PASSWORD,
      database: this.env.DB_NAME,
    };
  }

  get mailer() {
    return {
      mode: this.env.MAILER_MODE,
      from: this.env.MAILER_FROM,
      host: this.env.MAILER_HOST,
      port: this.env.MAILER_PORT,
      user: this.env.MAILER_USER,
      pass: this.env.MAILER_PASS,
      secure: this.env.MAILER_SECURE,
    };
  }

}
