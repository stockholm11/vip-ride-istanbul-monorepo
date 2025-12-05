import { env } from "../../config/env";
import { IEmailSender } from "@vip-ride/application/ports/IEmailSender";

/**
 * BREVO API Adapter - Uses BREVO HTTP API instead of SMTP
 * More reliable for Render deployments as it uses HTTPS (port 443)
 * which is not blocked by hosting providers
 */
export class BrevoApiAdapter implements IEmailSender {
  private readonly apiKey: string;
  private readonly apiUrl: string = "https://api.brevo.com/v3/smtp/email";

  constructor() {
    // BREVO API uses API key instead of SMTP credentials
    if (!env.emailPassword) {
      throw new Error(
        "BREVO API key is missing. Please set EMAIL_PASSWORD (BREVO API key) environment variable."
      );
    }

    this.apiKey = env.emailPassword; // BREVO API key is stored in EMAIL_PASSWORD
  }

  async send(to: string, subject: string, html: string) {
    if (!to || !to.trim()) {
      throw new Error("Email recipient (to) is required");
    }

    const fromAddress = env.emailFromAddress || env.emailUser;
    if (!fromAddress || !fromAddress.trim()) {
      throw new Error("Email sender (from) is not configured");
    }

    // Format: "From Name" <email@domain.com>
    const from = env.emailFromName 
      ? { name: env.emailFromName, email: fromAddress }
      : { email: fromAddress };

    try {
      console.log("[BrevoApiAdapter] Sending email to:", to, "from:", fromAddress);
      
      const startTime = Date.now();
      
      const response = await fetch(this.apiUrl, {
        method: "POST",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
          "api-key": this.apiKey,
        },
        body: JSON.stringify({
          sender: from,
          to: [{ email: to }],
          subject: subject,
          htmlContent: html,
        }),
      });

      const duration = Date.now() - startTime;

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "Unknown error" }));
        throw new Error(
          `BREVO API error (${response.status}): ${errorData.message || response.statusText}`
        );
      }

      const result = await response.json();
      console.log("[BrevoApiAdapter] ✅ Email sent successfully. MessageId:", result.messageId, "Duration:", duration + "ms");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      console.error("[BrevoApiAdapter] ❌ Failed to send email:", errorMessage);
      throw new Error(`Failed to send email via BREVO API: ${errorMessage}`);
    }
  }
}

