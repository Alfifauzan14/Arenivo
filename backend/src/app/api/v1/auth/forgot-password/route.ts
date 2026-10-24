import { z } from "zod";
import { AppError, ErrorCode } from "@futsal/shared";
import { ok, parseBody, publicRoute } from "@/lib/http";
import { handleOptions } from "@/middleware/cors";
import { supabaseAdmin } from "@/lib/supabase";
import { brevoEmail } from "@/lib/brevo";
import { env } from "@/config/env";

export const OPTIONS = handleOptions;

const Schema = z.object({
  email: z.string().email("Format email tidak valid"),
});

export const POST = publicRoute(async (req) => {
  const body = await parseBody(req, Schema);
  const email = body.email.toLowerCase().trim();

  const origin = req.headers.get("origin") || env.CORS_ORIGIN || "http://localhost:5173";
  const { data, error } = await supabaseAdmin.auth.admin.generateLink({
    type: "recovery",
    email,
    options: {
      redirectTo: `${origin}/reset-password`,
    },
  });

  if (error) {
    console.warn("[Forgot Password] Supabase notice:", error.message);
    // Return standard success to avoid leaking registered emails
    return ok(req, {
      sent: true,
      message: "Jika email terdaftar, tautan pemulihan kata sandi telah dikirim.",
    });
  }

  const actionLink = data.properties?.action_link;
  if (!actionLink) {
    return ok(req, {
      sent: true,
      message: "Jika email terdaftar, tautan pemulihan kata sandi telah dikirim.",
    });
  }

  // Kirim email pemulihan langsung via Brevo LIVE
  const emailHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 580px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h1 style="color: #dc2626; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">ARENIVO</h1>
        <p style="color: #64748b; font-size: 13px; margin: 4px 0 0 0;">Satu Aplikasi, Banyak Arena</p>
      </div>
      
      <div style="padding: 20px 0; border-top: 1px solid #f1f5f9; border-bottom: 1px solid #f1f5f9;">
        <h2 style="color: #0f172a; font-size: 18px; margin: 0 0 12px 0;">Atur Ulang Kata Sandi Akun</h2>
        <p style="color: #334155; font-size: 14px; line-height: 1.6; margin: 0 0 16px 0;">
          Kami menerima permintaan untuk mengatur ulang kata sandi akun Arenivo Anda. Silakan klik tombol di bawah ini untuk membuat kata sandi baru:
        </p>
        
        <div style="text-align: center; margin: 28px 0;">
          <a href="${actionLink}" style="background: linear-gradient(to right, #ea580c, #dc2626); color: #ffffff; padding: 14px 32px; text-decoration: none; font-size: 14px; font-weight: bold; border-radius: 8px; display: inline-block; box-shadow: 0 2px 4px rgba(220, 38, 38, 0.2);">
            Atur Ulang Kata Sandi
          </a>
        </div>
        
        <p style="color: #64748b; font-size: 12px; line-height: 1.5; margin: 0;">
          Tautan ini aman dan hanya berlaku selama 1 jam. Jika Anda tidak pernah meminta perubahan kata sandi ini, abaikan email ini dengan aman.
        </p>
      </div>
      
      <div style="margin-top: 20px; text-align: center;">
        <p style="color: #94a3b8; font-size: 11px; margin: 0;">&copy; ${new Date().getFullYear()} Arenivo Indonesia. Seluruh hak cipta dilindungi.</p>
      </div>
    </div>
  `;

  await brevoEmail.sendEmail({
    toEmail: email,
    subject: "Atur Ulang Kata Sandi Akun Arenivo Anda",
    htmlContent: emailHtml,
  });

  return ok(req, {
    sent: true,
    message: "Tautan pemulihan kata sandi telah dikirim ke email Anda.",
  });
});
