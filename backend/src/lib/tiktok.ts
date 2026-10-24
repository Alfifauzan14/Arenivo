import { env } from "../config/env";

export interface TikTokTokenResponse {
  open_id: string;
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

export class TikTokAuthService {
  private clientKey = env.TIKTOK_CLIENT_KEY;
  private clientSecret = env.TIKTOK_CLIENT_SECRET;

  async exchangeCodeForToken(code: string, redirectUri: string): Promise<TikTokTokenResponse> {
    if (!this.clientKey || !this.clientSecret) {
      throw new Error("TikTok Client Key or Secret not configured");
    }

    const res = await fetch("https://open.tiktokapis.com/v2/oauth/token/", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Cache-Control": "no-cache",
      },
      body: new URLSearchParams({
        client_key: this.clientKey,
        client_secret: this.clientSecret,
        code,
        grant_type: "authorization_code",
        redirect_uri: redirectUri,
      }),
    });

    if (!res.ok) {
      throw new Error(`TikTok token exchange failed: ${res.statusText}`);
    }

    const data = await res.json();
    return data;
  }
}

export const tiktokAuth = new TikTokAuthService();
