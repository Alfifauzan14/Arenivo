import { env } from "../config/env";

export interface SendEmailParams {
  toEmail: string;
  toName?: string;
  subject: string;
  htmlContent: string;
}

export class BrevoEmailService {
  private getApiKey(): string | undefined {
    return env.BREVO_API_KEY || process.env.BREVO_API_KEY;
  }

  private getSenderEmail(): string {
    return env.BREVO_SENDER_EMAIL || process.env.BREVO_SENDER_EMAIL || "noreply@arenivo.id";
  }

  private getSenderName(): string {
    return env.BREVO_SENDER_NAME || process.env.BREVO_SENDER_NAME || "Arenivo";
  }

  async sendEmail(params: SendEmailParams): Promise<boolean> {
    // Lewati jika email berakhiran .invalid (contoh login TikTok tanpa email per PRD 8)
    if (params.toEmail.endsWith(".invalid")) {
      console.info(`[Brevo] Skipped email to .invalid address: ${params.toEmail}`);
      return true;
    }

    const apiKey = this.getApiKey();
    if (!apiKey) {
      console.info(`[Brevo Mock] Email sent to '${params.toEmail}': ${params.subject}`);
      return true;
    }

    try {
      const res = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "api-key": apiKey,
        },
        body: JSON.stringify({
          sender: { name: this.getSenderName(), email: this.getSenderEmail() },
          to: [{ email: params.toEmail, name: params.toName }],
          subject: params.subject,
          htmlContent: params.htmlContent,
        }),
      });

      if (!res.ok) {
        const errText = await res.text();
        console.error(`[Brevo Error ${res.status}]: ${res.statusText} - ${errText}`);
        return false;
      }

      console.info(`[Brevo Live] Email sent successfully to ${params.toEmail}`);
      return true;
    } catch (err) {
      console.error("[Brevo Catch Error]:", err);
      return false; // Silent catch per PRD 9
    }
  }
}

export const brevoEmail = new BrevoEmailService();
