import { UserRole } from "@futsal/shared";
import { withAuth } from "@/middleware/auth";
import { handleOptions } from "@/middleware/cors";
import { supabaseAdmin } from "@/lib/supabase";
import { camelize, ok } from "@/lib/http";
import { mitraRepository } from "@/modules/mitra/mitra.repository";

export const OPTIONS = handleOptions;

export const GET = withAuth(
  async (req, user) => {
    const mitraId = user.mitraProfile?.id ?? user.id;
    const venueIds = await mitraRepository.venueIds(mitraId);
    const balance = await mitraRepository.balance(mitraId);

    if (venueIds.length === 0) {
      return ok(req, {
        balance,
        totalVenues: 0,
        totalBookings: 0,
        activeBookings: 0,
        completedBookings: 0,
        recentBookings: []
      });
    }

    const [
      { count: totalBookings },
      { count: activeBookings },
      { count: completedBookings },
      { data: recentBookings }
    ] = await Promise.all([
      supabaseAdmin
        .from("bookings")
        .select("id", { count: "exact", head: true })
        .in("venue_id", venueIds),
      supabaseAdmin
        .from("bookings")
        .select("id", { count: "exact", head: true })
        .in("venue_id", venueIds)
        .in("status", ["menunggu_bayar", "dikonfirmasi", "digunakan"]),
      supabaseAdmin
        .from("bookings")
        .select("id", { count: "exact", head: true })
        .in("venue_id", venueIds)
        .eq("status", "selesai"),
      supabaseAdmin
        .from("bookings")
        .select("*, venues(id, name), fields(id, name), profiles(id, full_name, phone)")
        .in("venue_id", venueIds)
        .order("created_at", { ascending: false })
        .limit(8)
    ]);

    return ok(req, {
      balance,
      totalVenues: venueIds.length,
      totalBookings: totalBookings ?? 0,
      activeBookings: activeBookings ?? 0,
      completedBookings: completedBookings ?? 0,
      recentBookings: camelize(recentBookings ?? [])
    });
  },
  { allowedRoles: [UserRole.MITRA, UserRole.ADMIN] }
);
