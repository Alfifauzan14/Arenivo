const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.SUPABASE_URL || "https://vtfcigukjtmplgcihjgw.supabase.co";
const supabaseKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseKey) {
  console.error("❌ SUPABASE_SECRET_KEY or SUPABASE_SERVICE_ROLE_KEY environment variable is required.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function seed() {
  console.log("Seeding master data to Supabase...");

  // 1. Cities
  const cities = [
    { name: "Jakarta Selatan", province: "DKI Jakarta" },
    { name: "Jakarta Barat", province: "DKI Jakarta" },
    { name: "Jakarta Pusat", province: "DKI Jakarta" },
    { name: "Jakarta Timur", province: "DKI Jakarta" },
    { name: "Jakarta Utara", province: "DKI Jakarta" },
    { name: "Bandung", province: "Jawa Barat" },
    { name: "Surabaya", province: "Jawa Timur" },
    { name: "Yogyakarta", province: "DI Yogyakarta" },
    { name: "Medan", province: "Sumatera Utara" },
    { name: "Bekasi", province: "Jawa Barat" },
    { name: "Tangerang Selatan", province: "Banten" },
  ];

  for (const c of cities) {
    const { data: existing } = await supabase.from("cities").select("id").eq("name", c.name).maybeSingle();
    if (!existing) {
      await supabase.from("cities").insert(c);
      console.log(`Inserted city: ${c.name}`);
    }
  }

  // 2. Facilities
  const facilities = [
    { name: "Rumput Sintetis FIFA", icon: "sparkles" },
    { name: "Lampu Sorot LED HD", icon: "sun" },
    { name: "Ruang Ganti & Shower Panas", icon: "shower-head" },
    { name: "Parkir Luas & Gratis", icon: "car" },
    { name: "Musholla Ber-AC", icon: "moon" },
    { name: "Kantin & Sports Cafe", icon: "coffee" },
    { name: "Toilet Bersih", icon: "check" },
    { name: "Tribun Penonton", icon: "users" },
    { name: "Lantai Vinyl Standar Internasional", icon: "shield-check" },
    { name: "Papan Skor Digital", icon: "tv" },
    { name: "WiFi Kecepatan Tinggi", icon: "wifi" },
  ];

  for (const f of facilities) {
    const { data: existing } = await supabase.from("facilities").select("id").eq("name", f.name).maybeSingle();
    if (!existing) {
      await supabase.from("facilities").insert(f);
      console.log(`Inserted facility: ${f.name}`);
    }
  }

  // 3. Field Types
  const fieldTypes = [
    { code: "futsal_vinyl", name: "Futsal Vinyl Gerflor" },
    { code: "futsal_interlock", name: "Futsal Interlock Polypropylene" },
    { code: "futsal_sintetis", name: "Futsal Rumput Sintetis" },
    { code: "mini_soccer", name: "Mini Soccer 7 vs 7" },
    { code: "sepak_bola", name: "Sepak Bola 11 vs 11" },
  ];

  for (const ft of fieldTypes) {
    const { data: existing } = await supabase.from("field_types").select("id").eq("code", ft.code).maybeSingle();
    if (!existing) {
      await supabase.from("field_types").insert(ft);
      console.log(`Inserted field type: ${ft.name}`);
    }
  }

  // 4. Initial Banners
  const banners = [
    {
      title: "Diskon 25% Main Malam Mini Soccer & Futsal",
      image_url: "https://images.unsplash.com/photo-1529900748604-07564a03e7a6?auto=format&fit=crop&w=1600&q=80",
      link_url: "/venues",
      sort_order: 1,
      is_active: true,
    },
    {
      title: "Spesial Hari Olahraga: Cashback Rp50.000 QRIS",
      image_url: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1600&q=80",
      link_url: "/venues",
      sort_order: 2,
      is_active: true,
    },
  ];

  for (const b of banners) {
    const { data: existing } = await supabase.from("banners").select("id").eq("title", b.title).maybeSingle();
    if (!existing) {
      await supabase.from("banners").insert(b);
      console.log(`Inserted banner: ${b.title}`);
    }
  }

  console.log("Master data seeding completed successfully!");
}

seed().catch(console.error);
