"use client";

import { useRef, useState } from "react";
import { ImageIcon, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";

interface UploadResponse {
  success: boolean;
  data?: { path?: string } | null;
  error?: { message?: string } | null;
}

export function BrandImageUpload({
  name,
  label,
  defaultValue,
  kind,
}: {
  name: string;
  label: string;
  defaultValue?: string;
  kind: "logo" | "favicon";
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState(defaultValue ?? "");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function upload(file: File | undefined) {
    if (!file) return;
    setBusy(true);
    setMessage("");
    try {
      if (kind === "favicon") {
        const bitmap = await createImageBitmap(file);
        const ratio = bitmap.width / bitmap.height;
        bitmap.close();
        if (ratio < 0.9 || ratio > 1.1) {
          throw new Error("Favicon image should be square (1:1), ideally 192×192px or larger.");
        }
      }

      const form = new FormData();
      form.append("file", file);
      const response = await fetch("/api/admin/media", { method: "POST", body: form });
      const json = (await response.json()) as UploadResponse;
      if (!response.ok || !json.success || !json.data?.path) {
        throw new Error(json.error?.message || "Image upload failed.");
      }
      setValue(json.data.path);
      setMessage("Uploaded. Save general settings to apply this image.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Image upload failed.");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="rounded-xl border border-[var(--border)] bg-white p-4">
      <input type="hidden" name={name} value={value} />
      <div className="flex flex-wrap items-start gap-4">
        <div className={`grid shrink-0 place-items-center overflow-hidden border bg-[var(--surface-subtle)] ${kind === "favicon" ? "size-24 rounded-2xl" : "h-24 w-52 rounded-xl"}`}>
          {value ? (
            <img src={value} alt={`${label} preview`} className="h-full w-full object-contain" />
          ) : (
            <ImageIcon size={28} className="text-[var(--text-muted)]" aria-hidden="true" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">{label}</p>
          <p className="mt-1 text-xs text-[var(--text-muted)]">
            {kind === "favicon"
              ? "Upload a square PNG, JPG, WebP or AVIF. 192×192px or larger is recommended."
              : "Upload a transparent PNG/WebP or another supported raster image. Wide logos work best."}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <input
              ref={inputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif"
              className="hidden"
              onChange={(event) => upload(event.target.files?.[0])}
            />
            <Button type="button" variant="secondary" disabled={busy} onClick={() => inputRef.current?.click()}>
              <Upload size={16} /> {busy ? "Uploading..." : value ? "Replace image" : "Upload image"}
            </Button>
            {value ? (
              <Button type="button" variant="secondary" disabled={busy} onClick={() => { setValue(""); setMessage("Image removed. Save general settings to apply."); }}>
                <Trash2 size={16} /> Remove
              </Button>
            ) : null}
          </div>
          {message ? <p className={`mt-2 text-xs ${message.includes("failed") || message.includes("should be") ? "text-red-600" : "text-emerald-700"}`}>{message}</p> : null}
        </div>
      </div>
    </div>
  );
}
