import { z } from "zod";
import { UserRole } from "@futsal/shared";
import { withAuth } from "@/middleware/auth";
import { handleOptions } from "@/middleware/cors";
import { supabaseAdmin } from "@/lib/supabase";
import { camelize, dbError, ok, parseBody } from "@/lib/http";

export const OPTIONS = handleOptions;

const patchSchema = z.object({
  fullName: z.string().min(2).max(120).optional(),
  phone: z.string().max(30).optional().nullable(),
  businessName: z.string().min(2).max(150).optional(),
  bankName: z.string().min(2).max(60).optional(),
  bankAccountNumber: z.string().min(5).max(40).optional(),
  bankAccountHolder: z.string().min(2).max(120).optional()
});

export const GET = withAuth(
  async (req, user) => {
    const [{ data: profile }, { data: mitraProfile }] = await Promise.all([
      supabaseAdmin.from("profiles").select("*").eq("id", user.id).single(),
      supabaseAdmin.from("mitra_profiles").select("*").eq("user_id", user.id).maybeSingle()
    ]);
    return ok(req, camelize({ profile, mitraProfile }));
  },
  { allowedRoles: [UserRole.MITRA, UserRole.ADMIN] }
);

export const PATCH = withAuth(
  async (req, user) => {
    const body = await parseBody(req, patchSchema);
    if (body.fullName !== undefined || body.phone !== undefined) {
      const { error } = await supabaseAdmin
        .from("profiles")
        .update({
          ...(body.fullName !== undefined ? { full_name: body.fullName } : {}),
          ...(body.phone !== undefined ? { phone: body.phone } : {})
        })
        .eq("id", user.id);
      dbError(error);
    }

    if (
      body.businessName !== undefined ||
      body.bankName !== undefined ||
      body.bankAccountNumber !== undefined ||
      body.bankAccountHolder !== undefined
    ) {
      const { error } = await supabaseAdmin
        .from("mitra_profiles")
        .update({
          ...(body.businessName !== undefined ? { business_name: body.businessName } : {}),
          ...(body.bankName !== undefined ? { bank_name: body.bankName } : {}),
          ...(body.bankAccountNumber !== undefined
            ? { bank_account_number: body.bankAccountNumber }
            : {}),
          ...(body.bankAccountHolder !== undefined
            ? { bank_account_holder: body.bankAccountHolder }
            : {})
        })
        .eq("user_id", user.id);
      dbError(error);
    }

    const [{ data: profile }, { data: mitraProfile }] = await Promise.all([
      supabaseAdmin.from("profiles").select("*").eq("id", user.id).single(),
      supabaseAdmin.from("mitra_profiles").select("*").eq("user_id", user.id).maybeSingle()
    ]);

    return ok(req, camelize({ profile, mitraProfile }));
  },
  { allowedRoles: [UserRole.MITRA, UserRole.ADMIN] }
);
