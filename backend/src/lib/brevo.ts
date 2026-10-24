import { env } from "../config/env";

export interface SendEmailParams {
  toEmail: string;
  toName?: string;
  subject: string;
  htmlContent: string;
}

export class BrevoEmailService {
  private apiKey = env.BREVO_API_KEY;
  private senderEmail = env.BREVO_SENDER_EMAIL;
  private senderName = env.BREVO_SENDER_NAME;

  async sendEmail(params: SendEmailParams): Promise<boolean> {
    // Lewati jika email berakhiran .invalid (contoh login TikTok tanpa email per PRD 8)
    if (params.toEmail.endsWith(".invalid")) {
      console.info(`[Brevo] Skipped email to .invalid address: ${params.toEmail}`);
      return true;
    }

    if (!this.apiKey) {
      console.info(`[Brevo Mock] Email sent to '${params.toEmail}': ${params.subject}`);
      return true;
    }

    try {
      const res = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "api-key": this.apiKey,
        },
        body: JSON.stringify({
          sender: { name: this.senderName, email: this.senderEmail },
          to: [{ email: params.toEmail, name: params.toName }],
          subject: params.subject,
          htmlContent: params.htmlContent,
        }),
      });

      if (!res.ok) {
        console.error(`[Brevo Error] ${res.statusText}`);
        return false;
      }

      return true;
    } catch (err) {
      console.error("[Brevo Catch Error]:", err);
      return false; // Silent catch per PRD 9
    }
  }
}

export const brevoEmail = new BrevoEmailService();
