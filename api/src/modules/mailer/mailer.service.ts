import { Injectable, Logger } from '@nestjs/common';
import nodemailer, { Transporter } from 'nodemailer';
import { AppConfigService } from '../../config/config.service';

type SendMailParams = {
  to: string;
  subject: string;
  text?: string;
  html?: string;
  from?: string;
};

@Injectable()
export class MailerService {

  private readonly logger = new Logger(MailerService.name);
  private readonly mode: 'local' | 'smtp';
  private readonly defaultFrom: string;
  private readonly transporter: Transporter;

  constructor(private readonly config: AppConfigService) {
    this.mode = this.config.mailer.mode;
    this.defaultFrom = this.config.mailer.from;
    this.transporter =
      this.mode === 'smtp'
        ? this._createSmtpTransporter()
        : this._createLocalTransporter();

    this.logger.log(`Mailer initialized in ${this.mode} mode`);
  }

  async sendMail(params: SendMailParams) {
    const info = await this.transporter.sendMail({
      from: params.from ?? this.defaultFrom,
      to: params.to,
      subject: params.subject,
      text: params.text,
      html: params.html,
    });

    if (this.mode === 'local') {
      this.logger.log(`Local email captured: ${JSON.stringify(info.message)}`);
    }

    return info;
  }

  private _createLocalTransporter() {
    return nodemailer.createTransport({
      jsonTransport: true,
    });
  }

  private _createSmtpTransporter() {
    const smtpConfig = this.config.mailer;

    console.log(smtpConfig)
    return nodemailer.createTransport({
      host: smtpConfig.host!,
      port: smtpConfig.port!,
      secure: smtpConfig.secure,
      auth: {
        user: smtpConfig.user!,
        pass: smtpConfig.pass!,
      },
    });
  }
  
}
