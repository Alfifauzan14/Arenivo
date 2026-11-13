import * as React from "react";
import { Upload, Loader2, ImageIcon, X } from "lucide-react";
import { compressImage } from "@/lib/image-compression";
import { apiClient } from "@/lib/api-client";

interface ImageUploadInputProps {
  value: string;
  onChange: (url: string) => void;
  bucket?: "venue-photos" | "mitra-documents";
  label?: string;
  aspectRatio?: string;
  maxSizeKB?: number;
}

/**
 * Input gambar dengan auto-compression (max 350KB, quality 0.7).
 * User bisa: upload file (auto-compress) atau paste URL manual.
 * Setelah upload, URL publik Supabase Storage di-set ke onChange.
 */
export function ImageUploadInput({
  value,
  onChange,
  bucket = "venue-photos",
  label = "Gambar",
  aspectRatio = "aspect-16/9",
}: ImageUploadInputProps) {
  const [uploading, setUploading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [useUrlMode, setUseUrlMode] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setUploading(true);

    try {
      // 1. Compress image client-side
      const compressed = await compressImage(file);

      // 2. Get signed upload URL from backend
      const res = await apiClient.post<{
        signedUrl: string;
        path: string;
        publicUrl: string;
      }>("/uploads/sign", {
        bucket,
        fileName: compressed.name,
        contentType: compressed.type,
      });

      const { signedUrl, publicUrl } = res.data;

      // 3. Upload directly to Supabase Storage via signed URL
      const uploadRes = await fetch(signedUrl, {
        method: "PUT",
        headers: { "Content-Type": compressed.type || "image/webp" },
        body: compressed,
      });

      if (!uploadRes.ok) {
        throw new Error("Gagal upload gambar ke Storage");
      }

      // 4. Set the public URL
      onChange(publicUrl);
    } catch (err: any) {
      const msg =
        err?.data?.error?.message ||
        err?.message ||
        "Gagal mengunggah gambar. Coba lagi atau gunakan URL manual.";
      setError(msg);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="font-semibold text-slate-800 text-xs">{label}</label>
        <button
          type="button"
          onClick={() => setUseUrlMode(!useUrlMode)}
          className="text-[11px] text-red-600 hover:text-red-700 font-medium"
        >
          {useUrlMode ? "↑ Upload file" : "↓ Atau paste URL"}
        </button>
      </div>

      {/* Preview */}
      {value && !useUrlMode && (
        <div className={`relative ${aspectRatio} bg-slate-100 rounded-lg overflow-hidden border border-slate-200`}>
          <img
            src={value}
            alt="Preview"
            className="w-full h-full object-cover"
            onError={() => setError("URL gambar tidak bisa dimuat.")}
          />
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1 hover:bg-black/80"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Upload mode */}
      {!useUrlMode ? (
        <div
          onClick={() => !uploading && inputRef.current?.click()}
          className={`flex flex-col items-center justify-center gap-2 cursor-pointer border-2 border-dashed rounded-lg p-4 transition-colors ${
            uploading
              ? "border-slate-300 bg-slate-50"
              : "border-slate-300 hover:border-red-400 hover:bg-red-50/50"
          }`}
        >
          {uploading ? (
            <>
              <Loader2 className="w-5 h-5 text-red-600 animate-spin" />
              <span className="text-[11px] text-slate-500">Mengompres & mengunggah...</span>
            </>
          ) : (
            <>
              <Upload className="w-5 h-5 text-slate-400" />
              <span className="text-[11px] text-slate-500 text-center">
                Klik untuk pilih gambar (auto-kompres &lt; 350KB)
              </span>
            </>
          )}
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
      ) : (
        <div className="flex gap-2">
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="https://images.unsplash.com/..."
            className="flex-1 h-9 px-3 text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-red-600"
          />
        </div>
      )}

      {error && <p className="text-[11px] text-red-600">{error}</p>}
    </div>
  );
}
