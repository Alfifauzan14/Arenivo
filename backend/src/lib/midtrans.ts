import crypto from "crypto";
import { env } from "../config/env";

export interface CreateSnapTransactionParams {
  orderId: string;
  grossAmount: number;
  customerDetails: {
    firstName: string;
    phone: string;
    email?: string;
  };
  itemDetails: Array<{
    id: string;
    price: number;
    quantity: number;
    name: string;
  }>;
}

export interface SnapTransactionResult {
  token: string;
  redirectUrl: string;
}

export class MidtransClient {
  private serverKey: string;
  private isProduction: boolean;

  constructor() {
    this.serverKey = env.MIDTRANS_SERVER_KEY || "";
    this.isProduction = env.MIDTRANS_IS_PRODUCTION;
  }

  getSnapBaseUrl(): string {
    return this.isProduction
      ? "https://app.midtrans.com/snap/v1"
      : "https://app.sandbox.midtrans.com/snap/v1";
  }

  getApiBaseUrl(): string {
    return this.isProduction
      ? "https://api.midtrans.com/v2"
      : "https://api.sandbox.midtrans.com/v2";
  }

  async createTransaction(params: CreateSnapTransactionParams): Promise<SnapTransactionResult> {
    const authHeader = `Basic ${Buffer.from(`${this.serverKey}:`).toString("base64")}`;

    // Midtrans: nama item maks. 50 karakter, nominal harus bilangan bulat,
    // dan gross_amount wajib sama dengan total item_details.
    const items = params.itemDetails.map((it) => ({
      id: String(it.id).slice(0, 50),
      name: it.name.length > 50 ? `${it.name.slice(0, 47)}...` : it.name,
      price: Math.round(it.price),
      quantity: Math.max(1, Math.round(it.quantity)),
    }));
    const grossAmount = items.reduce((sum, it) => sum + it.price * it.quantity, 0);

    const res = await fetch(`${this.getSnapBaseUrl()}/transactions`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: authHeader,
      },
      body: JSON.stringify({
        transaction_details: {
          order_id: params.orderId,
          gross_amount: grossAmount,
        },
        customer_details: {
          first_name: params.customerDetails.firstName,
          phone: params.customerDetails.phone,
          email: params.customerDetails.email,
        },
        item_details: items,
        credit_card: {
          secure: true,
        },
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(`Midtrans Snap Error: ${res.statusText} ${JSON.stringify(err)}`);
    }

    const data = await res.json();
    return {
      token: data.token,
      redirectUrl: data.redirect_url,
    };
  }

  /**
   * Verifikasi signature SHA512 dari Webhook Midtrans
   */
  verifySignature(orderId: string, statusCode: string, grossAmount: string, signatureKey: string): boolean {
    const payload = `${orderId}${statusCode}${grossAmount}${this.serverKey}`;
    const hash = crypto.createHash("sha512").update(payload).digest("hex");
    return hash === signatureKey;
  }
}

export const midtransClient = new MidtransClient();
