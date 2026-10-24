import { z } from "zod";
import { MidtransClient } from "@/lib/midtrans";
import { handleOptions } from "@/middleware/cors";
import { ok, parseBody, publicRoute } from "@/lib/http";

export const OPTIONS = handleOptions;

const midtrans = new MidtransClient();

const schema = z.object({
  orderId: z.string().optional(),
  grossAmount: z.number().positive(),
  customerName: z.string().optional(),
  customerPhone: z.string().optional(),
  customerEmail: z.string().email().optional(),
  itemDetails: z
    .array(
      z.object({
        id: z.string(),
        name: z.string(),
        price: z.number(),
        quantity: z.number().optional(),
      })
    )
    .optional(),
});

/**
 * Endpoint publik pembuatan Snap Token Midtrans untuk Checkout
 */
export const POST = publicRoute(async (req) => {
  const body = await parseBody(req, schema);
  const orderId = body.orderId || `ARN-${Date.now().toString(36).toUpperCase()}`;

  const snap = await midtrans.createTransaction({
    orderId,
    grossAmount: body.grossAmount,
    customerDetails: {
      firstName: body.customerName || "Penyewa Arenivo",
      phone: body.customerPhone || "081234567890",
      email: body.customerEmail || "customer@arenivo.id",
    },
    itemDetails: (
      body.itemDetails || [
        {
          id: "field-rent",
          name: "Sewa Lapangan Arenivo",
          price: body.grossAmount,
          quantity: 1,
        },
      ]
    ).map((it) => ({
      id: it.id,
      name: it.name,
      price: it.price,
      quantity: it.quantity ?? 1,
    })),
  });

  return ok(req, {
    token: snap.token,
    redirectUrl: snap.redirectUrl,
    orderId,
  });
});
