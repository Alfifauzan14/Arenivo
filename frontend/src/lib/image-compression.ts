import imageCompression from "browser-image-compression";

/**
 * Kompres gambar sebelum upload ke Supabase Storage.
 * - Max size: 350KB
 * - Quality: 0.7
 * - Auto convert ke WebP jika browser support
 *
 * @param file File gambar dari input
 * @returns File yang sudah dikompres
 */
export async function compressImage(file: File): Promise<File> {
  // Skip jika bukan gambar
  if (!file.type.startsWith("image/")) {
    return file;
  }

  // Skip jika sudah di bawah 350KB
  if (file.size <= 350 * 1024) {
    return file;
  }

  const options = {
    maxSizeMB: 0.35,
    maxWidthOrHeight: 1920,
    useWebWorker: true,
    initialQuality: 0.7,
  };

  try {
    const compressed = await imageCompression(file, options);
    // Pertahankan nama file asli, ganti type jika dikompres
    const fileName = file.name.replace(/\.(jpe?g|png|webp)$/i, "");
    return new File([compressed], `${fileName}.webp`, {
      type: compressed.type || "image/webp",
    });
  } catch (err) {
    console.error("[Image Compression Error]:", err);
    // Kalau gagal kompres, kembalikan file asli
    return file;
  }
}

/**
 * Upload gambar ke Supabase Storage dengan kompresi otomatis.
 * Flow: compress → dapatkan signed URL dari backend → PUT file → dapatkan public URL
 *
 * @param file File gambar dari input
 * @param bucket Bucket Supabase Storage (venue-photos, mitra-documents, banners)
 * @param apiBase Base URL backend API
 * @param token JWT token untuk autentikasi
 * @returns Public URL gambar yang sudah diupload
 */
export async function compressAndUpload(
  file: File,
  bucket: "venue-photos" | "mitra-documents",
  apiBase: string,
  token: string
): Promise<string> {
  const compressed = await compressImage(file);

  // Dapatkan signed upload URL dari backend
  const ext = compressed.name.split(".").pop() || "webp";
  const objectPath = `${bucket}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const signRes = await fetch(`${apiBase}/uploads/sign`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ bucket, objectPath }),
  });

  if (!signRes.ok) {
    throw new Error("Gagal mendapatkan signed upload URL");
  }

  const { data } = await signRes.json();

  // Upload file langsung ke Supabase Storage via signed URL
  const uploadRes = await fetch(data.signedUrl, {
    method: "PUT",
    headers: { "Content-Type": compressed.type || "image/webp" },
    body: compressed,
  });

  if (!uploadRes.ok) {
    throw new Error("Gagal upload gambar ke Storage");
  }

  return data.publicUrl;
}
