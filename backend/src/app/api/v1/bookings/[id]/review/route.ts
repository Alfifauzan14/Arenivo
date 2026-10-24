import { z } from "zod";
import { AppError, ErrorCode } from "@futsal/shared";
import { withAuth } from "@/middleware/auth";
import { handleOptions } from "@/middleware/cors";
import { supabaseAdmin } from "@/lib/supabase";
import { camelize, dbError, idParam, ok, parseBody } from "@/lib/http";
import { bookingsRepository } from "@/modules/bookings/bookings.repository";

export const OPTIONS = handleOptions;

const schema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(1000).optional()
});

export const POST = withAuth(async (req, user, ctx) => {
  const id = await idParam(ctx);
  const body = await parseBody(req, schema);
  const booking = await bookingsRepository.getOwned(id, user.id);

  if (booking.status !== "selesai") {
    throw new AppError(
      ErrorCode.REVIEW_NOT_ALLOWED,
      "Ulasan hanya dapat dikirim setelah booking berstatus selesai."
    );
  }

  const { data: existing } = await supabaseAdmin
    .from("reviews")
    .select("id")
    .eq("booking_id", id)
    .maybeSingle();

  if (existing) {
    throw new AppError(
      ErrorCode.REVIEW_NOT_ALLOWED,
      "Ulasan untuk booking ini sudah pernah dikirim."
    );
  }

  const { data: review, error } = await supabaseAdmin
    .from("reviews")
    .insert({
      booking_id: id,
      user_id: user.id,
      venue_id: booking.venueId,
      rating: body.rating,
      comment: body.comment ?? null,
      is_visible: true
    })
    .select("*")
    .single();
  dbError(error);

  const { data: stats } = await supabaseAdmin
    .from("reviews")
    .select("rating")
    .eq("venue_id", booking.venueId)
    .eq("is_visible", true);

  if (stats && stats.length > 0) {
    const avg =
      stats.reduce((sum: number, r: any) => sum + Number(r.rating), 0) / stats.length;
    await supabaseAdmin
      .from("venues")
      .update({
        rating_avg: Number(avg.toFixed(2)),
        review_count: stats.length
      })
      .eq("id", booking.venueId);
  }

  return ok(req, camelize(review), undefined, 201);
});
