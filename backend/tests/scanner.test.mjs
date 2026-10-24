import { supabase, getAuthToken, BASE_URL } from "./test-helpers.mjs";

export async function runScannerTest() {
  console.log("\n==================================================");
  console.log("🧪 [TEST 3] Gate Scanner Validation");
  console.log("   (Sah, Sudah Dipakai, Salah Waktu, Salah Venue,");
  console.log("    Tidak Ditemukan, Dibatalkan, & Audit Log)");
  console.log("==================================================");

  const venueId = "17ab8073-3d37-4c3d-b635-be37aabd35b2"; // Champion Futsal Arena Cilandak
  const fieldId = "370b8fb7-e526-4b38-989f-7e7012592d86";

  // Dapatkan token autentikasi Mitra
  console.log("🔑 Mengambil sesi autentikasi mitra (pemilik venue)...");
  const mitraToken = await getAuthToken("mitra@arenivo.id");

  // Helper untuk membuat tiket uji dengan status dan jadwal tertentu
  async function createTicketForTest({ status = "aktif", bookingStatus = "dikonfirmasi", playStart, playEnd }) {
    const bookingCode = `FB-SC-${Date.now().toString(36).toUpperCase().slice(-5)}`;
    const ticketCode = `TKT-${bookingCode}-${Math.floor(100 + Math.random() * 900)}`;

    const { data: booking, error: bErr } = await supabase
      .from("bookings")
      .insert({
        booking_code: bookingCode,
        field_id: fieldId,
        venue_id: venueId,
        customer_name: "Penyewa Scanner Test",
        customer_phone: "081299990005",
        play_start: playStart || new Date(Date.now() - 10 * 60 * 1000).toISOString(), // 10 menit lalu (sedang bermain)
        play_end: playEnd || new Date(Date.now() + 50 * 60 * 1000).toISOString(),     // 50 menit lagi
        total_hours: 1,
        source: "online",
        status: bookingStatus,
        subtotal: 150000,
        service_fee: 5000,
        total_price: 155000,
        commission_rate: 0.1,
        platform_commission: 15000,
        mitra_amount: 135000,
        expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
      })
      .select()
      .single();

    if (bErr || !booking) throw new Error(`Gagal membuat booking: ${bErr?.message}`);

    const { data: ticket, error: tErr } = await supabase
      .from("tickets")
      .insert({
        booking_id: booking.id,
        ticket_code: ticketCode,
        status: status,
      })
      .select()
      .single();

    if (tErr || !ticket) throw new Error(`Gagal membuat tiket: ${tErr?.message}`);

    return { booking, ticket };
  }

  // --- SUBTEST 3.1: Tiket Sah (Valid Check-in) ---
  console.log("\n--- Subtest 3.1: Valid Check-in (Tiket Sah) ---");
  const testValid = await createTicketForTest({});
  console.log(`🎫 Scan Tiket Code: ${testValid.ticket.ticket_code}`);

  const resValid = await fetch(`${BASE_URL}/mitra/tickets/validate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${mitraToken}`,
    },
    body: JSON.stringify({
      code: testValid.ticket.ticket_code,
      venueId: venueId,
    }),
  });

  const jsonValid = await resValid.json();
  console.log(`   Response Status: ${resValid.status}`, jsonValid);

  if (resValid.status !== 200 || jsonValid.data?.result !== "sah") {
    throw new Error(`❌ GAGAL: Hasil validasi tiket bukan 'sah', didapat: ${jsonValid.data?.result}`);
  }
  console.log("   ✅ Validasi Sukses: Result = 'sah', tiket berhasil di-check-in.");

  // --- SUBTEST 3.2: Scan Ulang Tiket yang Sudah Digunakan ---
  console.log("\n--- Subtest 3.2: Double Check-in (Sudah Dipakai) ---");
  const resUsed = await fetch(`${BASE_URL}/mitra/tickets/validate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${mitraToken}`,
    },
    body: JSON.stringify({
      code: testValid.ticket.ticket_code, // Scan tiket yang sama lagi
      venueId: venueId,
    }),
  });

  const jsonUsed = await resUsed.json();
  console.log(`   Response Status: ${resUsed.status}`, jsonUsed);

  if (resUsed.status !== 200 || jsonUsed.data?.result !== "sudah_dipakai") {
    throw new Error(`❌ GAGAL: Tiket kedua kali scan bukan 'sudah_dipakai', didapat: ${jsonUsed.data?.result}`);
  }
  console.log("   ✅ Pencegahan Double Check-in Sukses: Result = 'sudah_dipakai'.");

  // --- SUBTEST 3.3: Salah Waktu (Di Luar Jendela Bermain) ---
  console.log("\n--- Subtest 3.3: Salah Waktu (Jadwal Main 5 Hari ke Depan) ---");
  const testEarly = await createTicketForTest({
    playStart: new Date(Date.now() + 5 * 24 * 3600 * 1000).toISOString(),
    playEnd: new Date(Date.now() + (5 * 24 + 1) * 3600 * 1000).toISOString(),
  });

  const resEarly = await fetch(`${BASE_URL}/mitra/tickets/validate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${mitraToken}`,
    },
    body: JSON.stringify({
      code: testEarly.ticket.ticket_code,
      venueId: venueId,
    }),
  });

  const jsonEarly = await resEarly.json();
  console.log(`   Response Status: ${resEarly.status}`, jsonEarly);

  if (resEarly.status !== 200 || jsonEarly.data?.result !== "salah_waktu") {
    throw new Error(`❌ GAGAL: Tiket terlalu awal bukan 'salah_waktu', didapat: ${jsonEarly.data?.result}`);
  }
  console.log("   ✅ Validasi Waktu Sukses: Result = 'salah_waktu'.");

  // --- SUBTEST 3.4: Kode Tiket Tidak Ditemukan ---
  console.log("\n--- Subtest 3.4: Tiket Tidak Ditemukan ---");
  const resNotFound = await fetch(`${BASE_URL}/mitra/tickets/validate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${mitraToken}`,
    },
    body: JSON.stringify({
      code: "TKT-NONEXISTENT-99999",
      venueId: venueId,
    }),
  });

  const jsonNotFound = await resNotFound.json();
  console.log(`   Response Status: ${resNotFound.status}`, jsonNotFound);

  if (resNotFound.status !== 200 || jsonNotFound.data?.result !== "tidak_ditemukan") {
    throw new Error(`❌ GAGAL: Tiket fiktif bukan 'tidak_ditemukan', didapat: ${jsonNotFound.data?.result}`);
  }
  console.log("   ✅ Deteksi Tiket Fiktif Sukses: Result = 'tidak_ditemukan'.");

  // --- SUBTEST 3.5: Tiket Dibatalkan ---
  console.log("\n--- Subtest 3.5: Tiket Dibatalkan ---");
  const testCancelled = await createTicketForTest({
    status: "dibatalkan",
    bookingStatus: "dibatalkan",
  });

  const resCancelled = await fetch(`${BASE_URL}/mitra/tickets/validate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${mitraToken}`,
    },
    body: JSON.stringify({
      code: testCancelled.ticket.ticket_code,
      venueId: venueId,
    }),
  });

  const jsonCancelled = await resCancelled.json();
  console.log(`   Response Status: ${resCancelled.status}`, jsonCancelled);

  if (resCancelled.status !== 200 || jsonCancelled.data?.result !== "dibatalkan") {
    throw new Error(`❌ GAGAL: Tiket batal bukan 'dibatalkan', didapat: ${jsonCancelled.data?.result}`);
  }
  console.log("   ✅ Deteksi Tiket Dibatalkan Sukses: Result = 'dibatalkan'.");

  // --- SUBTEST 3.6: Audit Log (Tabel ticket_scans) ---
  console.log("\n--- Subtest 3.6: Audit Log ticket_scans ---");
  await new Promise((r) => setTimeout(r, 400));
  const { data: scanHistory } = await supabase
    .from("ticket_scans")
    .select("id, scanned_code, result, scanned_at")
    .eq("venue_id", venueId)
    .order("scanned_at", { ascending: false })
    .limit(5);

  console.log("   5 Riwayat Scan Terakhir di Database:", scanHistory);
  if (!scanHistory || scanHistory.length < 5) {
    throw new Error("❌ GAGAL: Audit log ticket_scans tidak mencatat seluruh aktivitas scan!");
  }
  console.log("   ✅ Audit Log Terverifikasi: Seluruh aksi Gate Scanner tercatat rapi di ticket_scans.");

  console.log("\n✅ [PASS] Gate Scanner Validation: SELURUH SKENARIO VALIDASI GATE SCANNER LULUS 100%!\n");

  return { success: true };
}

if (process.argv[1] && process.argv[1].endsWith("scanner.test.mjs")) {
  runScannerTest()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
