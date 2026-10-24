import { z } from "zod";
import { UserRole } from "@futsal/shared";
import { withAuth } from "@/middleware/auth";
import { handleOptions } from "@/middleware/cors";
import { supabaseAdmin } from "@/lib/supabase";
import { camelize, dbError, ok, parseBody } from "@/lib/http";

export const OPTIONS = handleOptions;

const schema = z.object({
  businessName: z.string().min(2).max(150),
  businessAddress: z.string().max(500).optional(),
  documentUrl: z.string().optional(),
  bankName: z.string().min(2).max(60),
  bankAccountNumber: z.string().min(5).max(40),
  bankAccountHolder: z.string().min(2).max(120)
});

export const GET = withAuth(async (req, user) => {
  const { data, error } = await supabaseAdmin
    .from("mitra_profiles")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();
  dbError(error);
  return ok(req, camelize(data));
});

const upsertApplication = withAuth(
  async (req, user) => {
    const body = await parseBody(req, schema);
    const { data, error } = await supabaseAdmin
      .from("mitra_profiles")
      .upsert(
        {
          user_id: user.id,
          business_name: body.businessName,
          business_address: body.businessAddress ?? null,
          document_url: body.documentUrl ?? null,
          bank_name: body.bankName,
          bank_account_number: body.bankAccountNumber,
          bank_account_holder: body.bankAccountHolder,
          verification_status: "menunggu",
          rejection_reason: null
        },
        { onConflict: "user_id" }
      )
      .select("*")
      .single();
    dbError(error);
    return ok(req, camelize(data), undefined, 201);
  },
  { allowedRoles: [UserRole.MITRA, UserRole.PENYEWA, UserRole.ADMIN] }
);

export const POST = upsertApplication;
export const PUT = upsertApplication;
