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
    const todayOccupancy = await mitraRepository.todayOccupancy(mitraId);

    if (venueIds.length === 0) {
      return ok(req, {
        balance,
        totalVenues: 0,
        totalBookings: 0,
        activeBookings: 0,
        completedBookings: 0,
        recentBookings: [],
        todayOccupancy: []
      });
    }

    const nowUtc = new Date();
    const wibNow = new Date(nowUtc.getTime() + 7 * 60 * 60000);
    const yyyy = wibNow.getUTCFullYear();
    const mm = String(wibNow.getUTCMonth() + 1).padStart(2, "0");
    const dd = String(wibNow.getUTCDate()).padStart(2, "0");
    const todayDateStr = `${yyyy}-${mm}-${dd}`;

    const [
      { count: totalBookings },
      { count: activeBookings },
      { count: completedBookings },
      { count: todayBookings },
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
        .select("id", { count: "exact", head: true })
        .in("venue_id", venueIds)
        .in("status", ["dikonfirmasi", "digunakan", "selesai"])
        .gte("play_start", `${todayDateStr}T00:00:00+07:00`)
        .lt("play_start", `${todayDateStr}T23:59:59+07:00`),
      supabaseAdmin
        .from("bookings")
        .select("*, venue:venues(id, name), field:fields(id, name), user:profiles!bookings_user_id_fkey(id, full_name, phone)")
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
      todayBookingsCount: todayBookings ?? 0,
      recentBookings: camelize(recentBookings ?? []),
      todayOccupancy
    });
  },
  { allowedRoles: [UserRole.MITRA, UserRole.ADMIN] }
);
