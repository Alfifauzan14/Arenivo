import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(__dirname, "../.env");

function loadEnv() {
  const env = {};
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, "utf-8").split("\n");
    for (const line of lines) {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        let val = (match[2] || "").trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        env[match[1]] = val;
      }
    }
  }
  return env;
}

const fileEnv = loadEnv();

export const SUPABASE_URL = process.env.SUPABASE_URL || fileEnv.SUPABASE_URL || "";
export const SUPABASE_SERVICE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_SECRET_KEY ||
  fileEnv.SUPABASE_SERVICE_ROLE_KEY ||
  fileEnv.SUPABASE_SECRET_KEY ||
  "";
export const MIDTRANS_SERVER_KEY =
  process.env.MIDTRANS_SERVER_KEY || fileEnv.MIDTRANS_SERVER_KEY || "";
export const BASE_URL = process.env.BASE_URL || fileEnv.BASE_URL || "http://localhost:3000/api/v1";

// Admin client khusus untuk query backend/test tanpa terpengaruh sesi auth pengguna
export const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

/**
 * Mendapatkan access token Supabase yang sah untuk email pengguna
 * Menggunakan temporary client agar admin client tidak termutasi sesinya
 */
export async function getAuthToken(email) {
  const { data: linkData, error: linkErr } = await supabase.auth.admin.generateLink({
    type: "magiclink",
    email,
  });
  if (linkErr || !linkData?.properties?.email_otp) {
    throw new Error(`Failed to generate magic link for ${email}: ${linkErr?.message}`);
  }

  const tempAuthClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: otpData, error: otpErr } = await tempAuthClient.auth.verifyOtp({
    email,
    token: linkData.properties.email_otp,
    type: "magiclink",
  });
  if (otpErr || !otpData?.session?.access_token) {
    throw new Error(`Failed to verify OTP for ${email}: ${otpErr?.message}`);
  }

  return otpData.session.access_token;
}

/**
 * Menghitung signature SHA512 Midtrans
 */
export function calculateMidtransSignature(orderId, statusCode, grossAmount) {
  const payload = `${orderId}${statusCode}${grossAmount}${MIDTRANS_SERVER_KEY}`;
  return crypto.createHash("sha512").update(payload).digest("hex");
}
