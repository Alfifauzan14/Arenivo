import { runConcurrencyTest } from "./concurrency.test.mjs";
import { runWebhookTest } from "./webhook.test.mjs";
import { runScannerTest } from "./scanner.test.mjs";

async function main() {
  const startTime = Date.now();
  console.log("===============================================================");
  console.log("🚀 ARENIVO AUTOMATED INTEGRATION & STRESS TEST SUITE");
  console.log("   Target: Supabase PostgreSQL + Next.js API + Midtrans Webhook");
  console.log("===============================================================\n");

  const results = {
    concurrency: false,
    webhook: false,
    scanner: false,
  };

  try {
    await runConcurrencyTest();
    results.concurrency = true;
  } catch (err) {
    console.error("❌ Concurrency Test Failed:", err);
  }

  try {
    await runWebhookTest();
    results.webhook = true;
  } catch (err) {
    console.error("❌ Webhook Test Failed:", err);
  }

  try {
    await runScannerTest();
    results.scanner = true;
  } catch (err) {
    console.error("❌ Gate Scanner Test Failed:", err);
  }

  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  const totalPassed = Object.values(results).filter(Boolean).length;

  console.log("===============================================================");
  console.log("📊 RINGKASAN HASIL PENGUJIAN OTOMATIS (TEST SUITE SUMMARY)");
  console.log("===============================================================");
  console.log(`1. High Concurrency Slot Reservation : ${results.concurrency ? "✅ PASSED" : "❌ FAILED"}`);
  console.log(`2. Midtrans Webhook Edge Cases        : ${results.webhook ? "✅ PASSED" : "❌ FAILED"}`);
  console.log(`3. Gate Scanner Multi-status & Audit  : ${results.scanner ? "✅ PASSED" : "❌ FAILED"}`);
  console.log("---------------------------------------------------------------");
  console.log(`Total Berhasil : ${totalPassed} / 3 Pengujian`);
  console.log(`Waktu Eksekusi : ${duration} detik`);
  console.log("===============================================================\n");

  if (totalPassed !== 3) {
    process.exit(1);
  }
}

main().catch((e) => {
  console.error("Fatal Test Suite Error:", e);
  process.exit(1);
});
