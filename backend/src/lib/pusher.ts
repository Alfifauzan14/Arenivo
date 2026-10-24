import crypto from "crypto";
import { env } from "../config/env";

export interface PusherTriggerPayload {
  channel: string;
  event: string;
  data: any;
}

export class PusherService {
  private appId = env.PUSHER_APP_ID;
  private key = env.PUSHER_KEY;
  private secret = env.PUSHER_SECRET;
  private cluster = env.PUSHER_CLUSTER || "ap1";

  async trigger(channel: string, event: string, data: any): Promise<boolean> {
    if (!this.appId || !this.key || !this.secret) {
      console.info(`[Pusher Mock] Event '${event}' sent to channel '${channel}':`, data);
      return true;
    }

    try {
      const bodyStr = JSON.stringify({
        name: event,
        channel,
        data: typeof data === "string" ? data : JSON.stringify(data)
      });
      const bodyMd5 = crypto.createHash("md5").update(bodyStr).digest("hex");
      const timestamp = Math.floor(Date.now() / 1000);
      const path = `/apps/${this.appId}/events`;
      const query = `auth_key=${this.key}&auth_timestamp=${timestamp}&auth_version=1.0&body_md5=${bodyMd5}`;
      const stringToSign = `POST\n${path}\n${query}`;
      const signature = crypto
        .createHmac("sha256", this.secret)
        .update(stringToSign)
        .digest("hex");

      const url = `https://api-${this.cluster}.pusher.com${path}?${query}&auth_signature=${signature}`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: bodyStr
      });

      return res.ok;
    } catch (err) {
      console.error("[Pusher Trigger Error]:", err);
      return false;
    }
  }

  authenticateChannel(socketId: string, channelName: string): { auth: string } {
    if (!this.key || !this.secret) {
      return { auth: `mock_key:mock_sig_${socketId}_${channelName}` };
    }
    const stringToSign = `${socketId}:${channelName}`;
    const signature = crypto
      .createHmac("sha256", this.secret)
      .update(stringToSign)
      .digest("hex");
    return { auth: `${this.key}:${signature}` };
  }

  async notifySlotUpdated(fieldId: string, slotData: any): Promise<void> {
    await this.trigger(`field-${fieldId}`, "slot.updated", slotData);
  }
}

export const pusherService = new PusherService();
