import nodemailer, { Transporter } from "nodemailer";
import { env } from "../../config/env";
import { IEmailSender } from "@vip-ride/application/ports/IEmailSender";

export class NodemailerAdapter implements IEmailSender {
  private readonly transporter: Transporter;

  constructor() {
    // Validate email configuration
    if (!env.emailHost || !env.emailUser || !env.emailPassword) {
      throw new Error(
        "Email configuration is missing. Please set EMAIL_HOST, EMAIL_USER, and EMAIL_PASSWORD environment variables."
      );
    }

    this.transporter = nodemailer.createTransport({
      host: env.emailHost,
      port: env.emailPort,
      secure: env.emailPort === 465, // true for 465, false for other ports
      auth: {
        user: env.emailUser,
        pass: env.emailPassword,
      },
      // IPv4 kullanımını zorla (IPv6 sorunlarını önlemek için)
      family: 4,
      // Increase timeout settings for Render/SMTP connections
      connectionTimeout: 10000, // 10 seconds
      greetingTimeout: 10000, // 10 seconds
      socketTimeout: 10000, // 10 seconds
    } as nodemailer.TransportOptions);
  }

  async send(to: string, subject: string, html: string) {
    if (!to || !to.trim()) {
      throw new Error("Email recipient (to) is required");
    }

    if (!env.emailUser || !env.emailUser.trim()) {
      throw new Error("Email sender (from) is not configured");
    }

    try {
      await this.transporter.sendMail({
        from: env.emailUser,
        to,
        subject,
        html,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      const errorCode = (error as any)?.code;
      
      // Daha açıklayıcı hata mesajları
      if (errorCode === "ECONNREFUSED") {
        throw new Error(
          `Cannot connect to SMTP server at ${env.emailHost}:${env.emailPort}. Please check EMAIL_HOST and EMAIL_PORT settings.`
        );
      }
      
      if (errorCode === "EAUTH") {
        throw new Error(
          "SMTP authentication failed. Please check EMAIL_USER and EMAIL_PASSWORD settings."
        );
      }

      throw new Error(`Failed to send email: ${errorMessage}`);
    }
  }
}

