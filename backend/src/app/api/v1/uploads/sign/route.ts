import { z } from "zod";
import { AppError, ErrorCode, UserRole } from "@futsal/shared";
import { withAuth } from "@/middleware/auth";
import { handleOptions } from "@/middleware/cors";
import { supabaseAdmin } from "@/lib/supabase";
import { ok, parseBody } from "@/lib/http";

export const OPTIONS = handleOptions;

const schema = z.object({
  bucket: z.enum(["venue-photos", "mitra-documents"]),
  fileName: z.string().min(1).max(200),
  contentType: z.string().optional()
});

export const POST = withAuth(
  async (req, user) => {
    const body = await parseBody(req, schema);
    const cleanName = body.fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
    const objectPath = `${user.id}/${Date.now()}-${cleanName}`;

    const { data, error } = await supabaseAdmin.storage
      .from(body.bucket)
      .createSignedUploadUrl(objectPath);

    if (error || !data) {
      throw new AppError(
        ErrorCode.PROVIDER_ERROR,
        error?.message ?? "Gagal membuat signed upload URL Storage."
      );
    }

    const publicUrl =
      body.bucket === "venue-photos"
        ? supabaseAdmin.storage.from(body.bucket).getPublicUrl(objectPath).data.publicUrl
        : objectPath;

    return ok(req, {
      bucket: body.bucket,
      path: objectPath,
      signedUrl: data.signedUrl,
      token: data.token,
      publicUrl
    });
  },
  { allowedRoles: [UserRole.PENYEWA, UserRole.MITRA, UserRole.ADMIN] }
);
