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

    // Create transporter for Hostinger SMTP on port 587 with STARTTLS
    this.transporter = nodemailer.createTransport({
      host: env.emailHost,
      port: Number(env.emailPort), // 587
      secure: false,               // TLS STARTTLS mode
      auth: {
        user: env.emailUser,
        pass: env.emailPassword,
      },
      tls: {
        rejectUnauthorized: false, // Hostinger sometimes returns legacy cert chains
      },
      connectionTimeout: 30000,
      socketTimeout: 30000,
      greetingTimeout: 30000,
    } as nodemailer.TransportOptions);
  }

  async send(to: string, subject: string, html: string) {
    if (!to || !to.trim()) {
      throw new Error("Email recipient (to) is required");
    }

    // Use EMAIL_FROM_ADDRESS if provided, otherwise fall back to EMAIL_USER
    const fromAddress = env.emailFromAddress || env.emailUser;
    if (!fromAddress || !fromAddress.trim()) {
      throw new Error("Email sender (from) is not configured");
    }

    // Format: "From Name" <email@domain.com>
    const from = env.emailFromName 
      ? `"${env.emailFromName}" <${fromAddress}>`
      : fromAddress;

    try {
      console.log("[NodemailerAdapter] Sending email to:", to, "from:", fromAddress);
      console.log("[NodemailerAdapter] SMTP server:", env.emailHost, "port:", env.emailPort);
      
      const startTime = Date.now();
      const result = await this.transporter.sendMail({
        from,
        to,
        subject,
        html,
      });
      const duration = Date.now() - startTime;

      console.log("[NodemailerAdapter] ✅ Email sent successfully. MessageId:", result.messageId, "Duration:", duration + "ms");
      return result;
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

      if (errorCode === "ETIMEDOUT" || errorMessage.includes("timeout")) {
        throw new Error(
          `SMTP connection timeout. Server at ${env.emailHost}:${env.emailPort} is not responding.`
        );
      }

      throw new Error(`Failed to send email: ${errorMessage}`);
    }
  }
}

