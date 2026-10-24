import { z } from "zod";

const envSchema = z.object({
  PORT: z.string().default("3000"),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  CORS_ORIGIN: z.string().default("http://localhost:5173"),

  // Supabase
  SUPABASE_URL: z.string().url().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),
  SUPABASE_SECRET_KEY: z.string().min(1).optional(),
  SUPABASE_PUBLISHABLE_KEY: z.string().optional(),
  SUPABASE_JWKS_URL: z.string().optional(),

  // Midtrans
  MIDTRANS_MERCHANT_ID: z.string().optional(),
  MIDTRANS_SERVER_KEY: z.string().optional(),
  MIDTRANS_CLIENT_KEY: z.string().optional(),
  MIDTRANS_IS_PRODUCTION: z.string().transform((v) => v === "true").default("false"),

  // Pusher
  PUSHER_APP_ID: z.string().optional(),
  PUSHER_KEY: z.string().optional(),
  PUSHER_SECRET: z.string().optional(),
  PUSHER_CLUSTER: z.string().default("ap1"),

  // Brevo Email
  BREVO_API_KEY: z.string().optional(),
  BREVO_SENDER_EMAIL: z.string().email().default("noreply@arenivo.id"),
  BREVO_SENDER_NAME: z.string().default("Arenivo"),

  // Firebase Cloud Messaging
  FIREBASE_PROJECT_ID: z.string().optional(),
  FIREBASE_CLIENT_EMAIL: z.string().optional(),
  FIREBASE_PRIVATE_KEY: z.string().optional(),

  // Chatbot AI
  SYSTEM_AI_PROVIDER: z.string().default("gemini"),
  GEMINI_API_KEY: z.string().optional(),


  // TikTok Login
  TIKTOK_CLIENT_KEY: z.string().optional(),
  TIKTOK_CLIENT_SECRET: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;

function loadEnv(): Env {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    console.error("❌ Invalid environment variables:", result.error.format());
    // In production, we throw. In development, we fallback with warnings.
    if (process.env.NODE_ENV === "production") {
      throw new Error("Invalid backend environment variables configuration.");
    }
  }
  return result.success ? result.data : (process.env as unknown as Env);
}

export const env = loadEnv();
