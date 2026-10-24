import { supabase, getAuthToken, calculateMidtransSignature, BASE_URL } from "./test-helpers.mjs";

export async function runWebhookTest() {
  console.log("\n==================================================");
  console.log("🧪 [TEST 2] Midtrans Webhook Edge Cases");
  console.log("   (Settlement, Idempotency, Invalid Signature, Expire)");
  console.log("==================================================");

  const fieldId = "370b8fb7-e526-4b38-989f-7e7012592d86";
  const token = await getAuthToken("alfifauzan897@gmail.com");

  // Helper untuk membuat booking baru untuk kebutuhan test
  async function createTestBooking(hourOffset = 26) {
    const testDate = new Date();
    testDate.setDate(testDate.getDate() + hourOffset);
    testDate.setUTCHours(10, 0, 0, 0);
    const slotStart = testDate.toISOString();

    // Hapus slot lama jika ada
    const { data: oldSlots } = await supabase.from("slot_reservations").select("id, slot_start").eq("field_id", fieldId);
    const toDel = (oldSlots || []).filter((s) => new Date(s.slot_start).getTime() === new Date(slotStart).getTime()).map((s) => s.id);
    if (toDel.length) await supabase.from("slot_reservations").delete().in("id", toDel);

    const res = await fetch(`${BASE_URL}/bookings`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        "Idempotency-Key": `wb-test-book-${Date.now()}-${Math.random()}`,
      },
      body: JSON.stringify({
        fieldId,
        customerName: "Penyewa Webhook Test",
        customerPhone: "081299990003",
        slotStarts: [slotStart],
        notes: "Uji webhook",
      }),
    });

    const json = await res.json();
    if (!res.ok || !json.data) {
      throw new Error(`Gagal membuat booking uji: ${JSON.stringify(json)}`);
    }

    // Buat sesi pembayaran Snap
    const payRes = await fetch(`${BASE_URL}/bookings/${json.data.id}/payments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const payJson = await payRes.json();
    if (!payRes.ok || !payJson.data) {
      throw new Error(`Gagal membuat sesi pembayaran: ${JSON.stringify(payJson)}`);
    }

    // Ambil record payment dari database
    const { data: payment } = await supabase
      .from("payments")
      .select("*")
      .eq("booking_id", json.data.id)
      .single();

    return { booking: json.data, payment, slotStart };
  }

  // --- SUBTEST 2.1: Settlement Webhook (Pembayaran Berhasil) ---
  console.log("\n--- Subtest 2.1: Settlement Webhook (Pembayaran Berhasil) ---");
  const test1 = await createTestBooking(26);
  const orderId1 = test1.payment.midtrans_order_id;
  const grossAmount1 = String(test1.payment.gross_amount);
  const signature1 = calculateMidtransSignature(orderId1, "200", grossAmount1);

  console.log(`📦 Order ID: ${orderId1}, Gross Amount: Rp${grossAmount1}`);
  console.log(`🔐 Valid Signature: ${signature1.slice(0, 16)}...`);

  const payloadSettlement = {
    order_id: orderId1,
    status_code: "200",
    gross_amount: grossAmount1,
    signature_key: signature1,
    transaction_status: "settlement",
    transaction_id: `trx-${Date.now()}`,
    payment_type: "qris",
    fraud_status: "accept",
  };

  const resSettlement = await fetch(`${BASE_URL}/webhooks/midtrans`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payloadSettlement),
  });

  const jsonSettlement = await resSettlement.json();
  console.log(`   Webhook Response Status: ${resSettlement.status}`, jsonSettlement);

  if (resSettlement.status !== 200 || jsonSettlement.duplicate !== false) {
    throw new Error(`❌ GAGAL: Webhook settlement gagal. Response: ${JSON.stringify(jsonSettlement)}`);
  }

  // Verifikasi pembaruan di database: booking confirmed & e-tiket terbit
  await new Promise((r) => setTimeout(r, 400));
  const { data: updatedBooking1 } = await supabase
    .from("bookings")
    .select("id, status, booking_code")
    .eq("id", test1.booking.id)
    .single();

  if (updatedBooking1.status !== "dikonfirmasi") {
    throw new Error(`❌ GAGAL: Status booking bukan dikonfirmasi, melainkan: ${updatedBooking1.status}`);
  }

  const { data: tickets1 } = await supabase
    .from("tickets")
    .select("*")
    .eq("booking_id", test1.booking.id);

  if (!tickets1 || tickets1.length === 0) {
    throw new Error(`❌ GAGAL: E-Tiket tidak terbit setelah webhook settlement!`);
  }

  console.log(`   ✅ Status Booking: ${updatedBooking1.status}`);
  console.log(`   🎟️ E-Tiket Diterbitkan: ${tickets1[0].ticket_code} (Status: ${tickets1[0].status})`);

  // --- SUBTEST 2.2: Idempotency Duplicate Webhook ---
  console.log("\n--- Subtest 2.2: Idempotency Duplicate Webhook (Webhook Dikirim Ulang) ---");
  const resDuplicate = await fetch(`${BASE_URL}/webhooks/midtrans`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payloadSettlement), // Kirim payload yang persis sama
  });

  const jsonDuplicate = await resDuplicate.json();
  console.log(`   Duplicate Webhook Response: ${resDuplicate.status}`, jsonDuplicate);

  if (resDuplicate.status !== 200 || jsonDuplicate.duplicate !== true) {
    throw new Error(`❌ GAGAL: Webhook idempotency gagal. Diharapkan { duplicate: true }, didapat: ${JSON.stringify(jsonDuplicate)}`);
  }

  // Pastikan tidak ada tiket ganda di database
  const { data: ticketsCount } = await supabase
    .from("tickets")
    .select("id")
    .eq("booking_id", test1.booking.id);

  if (ticketsCount.length !== 1) {
    throw new Error(`❌ GAGAL: Terjadi duplikasi tiket! Total tiket: ${ticketsCount.length}`);
  }
  console.log("   ✅ Idempotency terbukti: Tidak ada duplikasi tiket atau error.");

  // --- SUBTEST 2.3: Tampered / Invalid Signature ---
  console.log("\n--- Subtest 2.3: Tampered Signature Protection ---");
  const payloadForged = {
    ...payloadSettlement,
    signature_key: "forged_invalid_signature_key_0000000000000000000000000000000000000",
  };

  const resForged = await fetch(`${BASE_URL}/webhooks/midtrans`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payloadForged),
  });

  const jsonForged = await resForged.json();
  console.log(`   Forged Webhook Status: ${resForged.status} (${jsonForged.error?.code})`);

  if (resForged.status !== 403 || jsonForged.error?.code !== "FORBIDDEN") {
    throw new Error(`❌ GAGAL: Signature palsu tidak ditolak dengan 403 FORBIDDEN!`);
  }
  console.log("   ✅ Keamanan Terverifikasi: Signature palsu langsung ditolak (403 FORBIDDEN).");

  // --- SUBTEST 2.4: Expire Webhook ---
  console.log("\n--- Subtest 2.4: Expire Webhook (Pembayaran Kedaluwarsa) ---");
  const test2 = await createTestBooking(27);
  const orderId2 = test2.payment.midtrans_order_id;
  const grossAmount2 = String(test2.payment.gross_amount);
  const signature2 = calculateMidtransSignature(orderId2, "202", grossAmount2);

  const payloadExpire = {
    order_id: orderId2,
    status_code: "202",
    gross_amount: grossAmount2,
    signature_key: signature2,
    transaction_status: "expire",
  };

  const resExpire = await fetch(`${BASE_URL}/webhooks/midtrans`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payloadExpire),
  });

  const jsonExpire = await resExpire.json();
  console.log(`   Expire Webhook Response: ${resExpire.status}`, jsonExpire);

  if (resExpire.status !== 200) {
    throw new Error(`❌ GAGAL: Expire webhook gagal. Status: ${resExpire.status}`);
  }

  // Verifikasi status pembayaran di database berubah ke kedaluwarsa
  await new Promise((r) => setTimeout(r, 400));
  const { data: updatedPayment2 } = await supabase
    .from("payments")
    .select("status")
    .eq("midtrans_order_id", orderId2)
    .single();

  if (updatedPayment2.status !== "kedaluwarsa") {
    throw new Error(`❌ GAGAL: Status pembayaran bukan kedaluwarsa, melainkan: ${updatedPayment2.status}`);
  }
  console.log(`   ✅ Status Pembayaran di Database: ${updatedPayment2.status}`);

  console.log("\n✅ [PASS] Midtrans Webhook Edge Cases: SELURUH SKENARIO WEBHOOK LULUS 100%!\n");

  return {
    success: true,
    confirmedTicket: tickets1[0],
    venueId: "17ab8073-3d37-4c3d-b635-be37aabd35b2",
  };
}

if (process.argv[1] && process.argv[1].endsWith("webhook.test.mjs")) {
  runWebhookTest()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
