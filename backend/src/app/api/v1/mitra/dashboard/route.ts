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
        todayOccupancy: [],
        monthlyStats: [],
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
      { data: recentBookings },
      { data: paidBookings }
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
        .limit(8),
      supabaseAdmin
        .from("bookings")
        .select("mitra_amount, created_at")
        .in("venue_id", venueIds)
        .in("status", ["dikonfirmasi", "digunakan", "selesai"]),
    ]);

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agt", "Sep", "Okt", "Nov", "Des"];
    const buckets: Array<{ key: string; month: string; revenue: number; bookings: number }> = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(wibNow.getUTCFullYear(), wibNow.getUTCMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      buckets.push({
        key,
        month: i === 0 ? `${monthNames[d.getMonth()]} (Bulan Ini)` : monthNames[d.getMonth()],
        revenue: 0,
        bookings: 0,
      });
    }
    const bucketMap = new Map(buckets.map((b) => [b.key, b]));
    for (const row of paidBookings || []) {
      if (!row.created_at) continue;
      const target = bucketMap.get(String(row.created_at).slice(0, 7));
      if (target) {
        target.revenue += Number(row.mitra_amount || 0);
        target.bookings += 1;
      }
    }

    return ok(req, {
      balance,
      totalVenues: venueIds.length,
      totalBookings: totalBookings ?? 0,
      activeBookings: activeBookings ?? 0,
      completedBookings: completedBookings ?? 0,
      todayBookingsCount: todayBookings ?? 0,
      recentBookings: camelize(recentBookings ?? []),
      todayOccupancy,
      monthlyStats: buckets.map(({ month, revenue, bookings }) => ({ month, revenue, bookings })),
    });
  },
  { allowedRoles: [UserRole.MITRA, UserRole.ADMIN] }
);
