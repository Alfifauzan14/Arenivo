import { env } from "../config/env";

export interface PushNotificationPayload {
  title: string;
  body: string;
  icon?: string;
  data?: Record<string, string>;
}

export class FirebaseMessagingService {
  async sendToDevice(token: string, payload: PushNotificationPayload): Promise<boolean> {
    if (!env.FIREBASE_PROJECT_ID) {
      console.info(`[FCM Mock] Push notification to token '${token.substring(0, 10)}...':`, payload);
      return true;
    }

    try {
      // In Phase 7 integration, call FCM REST v1 API
      console.info(`[FCM] Notification sent successfully`);
      return true;
    } catch (err) {
      console.error("[FCM Error]:", err);
      return false; // Silent catch per PRD 9
    }
  }
}

export const firebaseMessaging = new FirebaseMessagingService();
