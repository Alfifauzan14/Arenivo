import { supabase, getAuthToken, BASE_URL } from "./test-helpers.mjs";

export async function runConcurrencyTest() {
  console.log("\n==================================================");
  console.log("🧪 [TEST 1] High Concurrency Slot Reservation");
  console.log("   (Pencegahan Double-Booking: 2 Request Serentak)");
  console.log("==================================================");

  // 1. Ambil ID lapangan & siapkan slot uji di masa depan (25 hari ke depan pukul 16:00:00 WIB = 09:00:00 UTC)
  const fieldId = "370b8fb7-e526-4b38-989f-7e7012592d86"; // Lapangan Vinyl Taraflex A
  const testDate = new Date();
  testDate.setDate(testDate.getDate() + 25);
  testDate.setUTCHours(9, 0, 0, 0);
  const slotStart = testDate.toISOString();

  console.log(`📍 Target Lapangan ID: ${fieldId}`);
  console.log(`⏰ Target Slot Waktu : ${slotStart}`);

  // 2. Bersihkan slot reservasi uji sebelumnya jika ada
  const { data: oldSlots } = await supabase
    .from("slot_reservations")
    .select("id, slot_start")
    .eq("field_id", fieldId);
  const toDelete = (oldSlots || [])
    .filter((s) => new Date(s.slot_start).getTime() === new Date(slotStart).getTime())
    .map((s) => s.id);
  if (toDelete.length > 0) {
    await supabase.from("slot_reservations").delete().in("id", toDelete);
  }

  // 3. Dapatkan token autentikasi Penyewa
  console.log("🔑 Mengambil sesi autentikasi penyewa...");
  const token = await getAuthToken("alfifauzan897@gmail.com");

  // 4. Siapkan 2 payload identik untuk slot yang sama
  const payload1 = {
    fieldId,
    customerName: "Penyewa Concurrency A",
    customerPhone: "081299990001",
    slotStarts: [slotStart],
    notes: "Uji konkurensi request A",
  };

  const payload2 = {
    fieldId,
    customerName: "Penyewa Concurrency B",
    customerPhone: "081299990002",
    slotStarts: [slotStart],
    notes: "Uji konkurensi request B",
  };

  const timestamp = Date.now();
  console.log("⚡ Mengirim 2 request booking serentak ke slot yang persis sama...");

  const [res1, res2] = await Promise.all([
    fetch(`${BASE_URL}/bookings`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        "Idempotency-Key": `concurrency-a-${timestamp}`,
      },
      body: JSON.stringify(payload1),
    }),
    fetch(`${BASE_URL}/bookings`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        "Idempotency-Key": `concurrency-b-${timestamp}`,
      },
      body: JSON.stringify(payload2),
    }),
  ]);

  const json1 = await res1.json().catch(() => ({}));
  const json2 = await res2.json().catch(() => ({}));

  console.log(`   Response 1 Status: ${res1.status} (${json1.data ? "Berhasil Booking: " + json1.data.bookingCode : json1.error?.code})`);
  console.log(`   Response 2 Status: ${res2.status} (${json2.data ? "Berhasil Booking: " + json2.data.bookingCode : json2.error?.code})`);

  // 5. Validasi Aturan High Concurrency:
  // Tepat satu request HARUS HTTP 201 Created dan satu request HARUS HTTP 409 Conflict (SLOT_TAKEN)
  const statuses = [res1.status, res2.status];
  const has201 = statuses.includes(201);
  const has409 = statuses.includes(409);

  if (!has201 || !has409) {
    throw new Error(
      `❌ GAGAL: Concurrency test gagal. Diharapkan [201, 409], tetapi didapat [${statuses.join(", ")}]`
    );
  }

  const rejectedJson = res1.status === 409 ? json1 : json2;
  if (rejectedJson.error?.code !== "SLOT_TAKEN") {
    throw new Error(
      `❌ GAGAL: Error code bukan SLOT_TAKEN, didapat: ${rejectedJson.error?.code}`
    );
  }

  // 6. Validasi Integritas Database:
  // Verifikasi ke Supabase Cloud dengan retry loop hingga 3 detik (sinkronisasi pooler/replika)
  const successBooking = res1.status === 201 ? json1.data : json2.data;
  let dbSlots = [];

  for (let attempt = 1; attempt <= 6; attempt++) {
    await new Promise((r) => setTimeout(r, 400));
    const { data, error } = await supabase
      .from("slot_reservations")
      .select("id, field_id, slot_start, is_active, booking_id")
      .eq("booking_id", successBooking.id)
      .eq("is_active", true);

    if (!error && data && data.length > 0) {
      dbSlots = data;
      break;
    }
  }

  if (dbSlots.length !== 1) {
    throw new Error(
      `❌ GAGAL: Ditemukan ${dbSlots.length} slot aktif di database untuk booking ${successBooking.id}.`
    );
  }

  // Pastikan tidak ada slot aktif lain pada jam yang sama
  const { data: allActiveSlots } = await supabase
    .from("slot_reservations")
    .select("id, field_id, slot_start, is_active")
    .eq("field_id", fieldId)
    .eq("is_active", true);

  const matchingSlots = (allActiveSlots || []).filter(
    (s) => new Date(s.slot_start).getTime() === new Date(slotStart).getTime()
  );

  if (matchingSlots.length !== 1) {
    throw new Error(
      `❌ GAGAL: Ditemukan ${matchingSlots.length} slot aktif di waktu yang sama. Terjadi double booking!`
    );
  }

  console.log(`🛡️ Integritas Database Terverifikasi: Tepat 1 slot reservasi aktif (${dbSlots[0].id})`);
  console.log("✅ [PASS] High Concurrency Slot Reservation: DOUBLE BOOKING TERCEGAH DENGAN SEMPURNA!\n");

  return { success: true, booking: successBooking };
}

// Jalankan langsung jika dipanggil via node
if (process.argv[1] && process.argv[1].endsWith("concurrency.test.mjs")) {
  runConcurrencyTest()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
