import crypto from "crypto";
import { env } from "../config/env";

export interface PushNotificationPayload {
  title: string;
  body: string;
  icon?: string;
  data?: Record<string, string>;
}

function base64Url(input: string | Buffer): string {
  const buf = typeof input === "string" ? Buffer.from(input) : input;
  return buf
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

export class FirebaseMessagingService {
  private cachedToken: string | null = null;
  private tokenExpiresAt = 0;

  private async getAccessToken(): Promise<string | null> {
    const projectId = env.FIREBASE_PROJECT_ID;
    const clientEmail = env.FIREBASE_CLIENT_EMAIL;
    const privateKey = env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

    if (!projectId || !clientEmail || !privateKey) {
      return null;
    }

    const now = Math.floor(Date.now() / 1000);
    if (this.cachedToken && this.tokenExpiresAt > now + 60) {
      return this.cachedToken;
    }

    try {
      const header = base64Url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
      const payload = base64Url(
        JSON.stringify({
          iss: clientEmail,
          scope: "https://www.googleapis.com/auth/firebase.messaging",
          aud: "https://oauth2.googleapis.com/token",
          exp: now + 3600,
          iat: now,
        })
      );

      const sign = crypto.createSign("RSA-SHA256");
      sign.update(`${header}.${payload}`);
      sign.end();
      const signature = base64Url(sign.sign(privateKey));
      const jwt = `${header}.${payload}.${signature}`;

      const res = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
      });

      if (!res.ok) {
        console.error("[FCM Auth Error]: Failed to exchange JWT for access token:", res.statusText);
        return null;
      }

      const json = await res.json();
      this.cachedToken = json.access_token;
      this.tokenExpiresAt = now + (json.expires_in || 3600);
      return this.cachedToken;
    } catch (err) {
      console.error("[FCM Auth Catch]:", err);
      return null;
    }
  }

  async sendToDevice(token: string, payload: PushNotificationPayload): Promise<boolean> {
    const projectId = env.FIREBASE_PROJECT_ID;
    if (!projectId) {
      console.info(`[FCM Mock] Push notification to token '${token.substring(0, 10)}...':`, payload);
      return true;
    }

    const accessToken = await this.getAccessToken();
    if (!accessToken) {
      console.warn("[FCM] Access token unavailable, skipping push notification.");
      return false;
    }

    try {
      const res = await fetch(`https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: {
            token,
            notification: {
              title: payload.title,
              body: payload.body,
            },
            data: payload.data,
          },
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        console.error(`[FCM Error ${res.status}]:`, err);
        return false;
      }

      console.info(`[FCM Live] Push notification sent successfully to ${token.substring(0, 10)}...`);
      return true;
    } catch (err) {
      console.error("[FCM Catch Error]:", err);
      return false;
    }
  }
}

export const firebaseMessaging = new FirebaseMessagingService();
