import { UserRole } from "@futsal/shared";
import { withAuth } from "@/middleware/auth";
import { handleOptions } from "@/middleware/cors";
import { supabaseAdmin } from "@/lib/supabase";
import { camelize, dbError, ok } from "@/lib/http";
import { mitraRepository } from "@/modules/mitra/mitra.repository";

export const OPTIONS = handleOptions;

/**
 * Laporan pendapatan Mitra (PRD M7):
 * Memisahkan transaksi online vs manual (walk-in), komisi platform, dan pendapatan bersih.
 */
export const GET = withAuth(
  async (req, user) => {
    const mitraId = user.mitraProfile?.id ?? user.id;
    const venueIds = await mitraRepository.venueIds(mitraId);
    if (venueIds.length === 0) {
      return ok(req, {
        onlineGross: 0,
        onlineCommission: 0,
        onlineNet: 0,
        manualRevenue: 0,
        totalBookings: 0,
        items: []
      });
    }

    const { data, error } = await supabaseAdmin
      .from("bookings")
      .select("id, booking_code, source, status, subtotal, discount, total_price, platform_commission, mitra_amount, play_start, created_at, venues(name), fields(name)")
      .in("venue_id", venueIds)
      .in("status", ["dikonfirmasi", "digunakan", "selesai"])
      .order("play_start", { ascending: false });
    dbError(error);

    const rows = data ?? [];
    const onlineRows = rows.filter((r: any) => r.source === "online");
    const manualRows = rows.filter((r: any) => r.source === "manual");

    const onlineGross = onlineRows.reduce((s: number, r: any) => s + Number(r.subtotal || 0), 0);
    const onlineCommission = onlineRows.reduce(
      (s: number, r: any) => s + Number(r.platform_commission || 0),
      0
    );
    const onlineNet = onlineRows.reduce((s: number, r: any) => s + Number(r.mitra_amount || 0), 0);
    const manualRevenue = manualRows.reduce((s: number, r: any) => s + Number(r.subtotal || 0), 0);

    return ok(req, {
      onlineGross,
      onlineCommission,
      onlineNet,
      manualRevenue,
      totalBookings: rows.length,
      items: camelize(rows)
    });
  },
  { allowedRoles: [UserRole.MITRA, UserRole.ADMIN] }
);
