"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/browser";
import { Button } from "@/components/ui/button";
import { Upload, Loader2, ImageIcon } from "lucide-react";

interface LogoUploadProps {
  clinicId: string;
  currentLogoUrl: string | null;
}

/** Uploads a clinic logo to Storage and persists the public URL. */
export function LogoUpload({ clinicId, currentLogoUrl }: LogoUploadProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(currentLogoUrl);

  async function handleFile(file: File) {
    setError(null);
    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setError("Image must be under 2MB.");
      return;
    }

    setBusy(true);
    const supabase = createClient();
    const ext = file.name.split(".").pop()?.toLowerCase() || "png";
    const path = `${clinicId}/logo.${ext}`;

    const { error: upErr } = await supabase.storage
      .from("clinic-logos")
      .upload(path, file, { upsert: true, cacheControl: "3600" });

    if (upErr) {
      setError(upErr.message);
      setBusy(false);
      return;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("clinic-logos").getPublicUrl(path);
    const busted = `${publicUrl}?v=${Date.now()}`;

    const { error: rpcErr } = await supabase.rpc("update_my_clinic", {
      p_logo_url: busted,
    });

    if (rpcErr) {
      setError(rpcErr.message);
      setBusy(false);
      return;
    }

    setPreview(busted);
    setBusy(false);
    router.refresh();
  }

  return (
    <div className="flex items-center gap-4">
      <div className="grid size-16 shrink-0 place-items-center overflow-hidden rounded-xl border bg-muted/40">
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="Clinic logo" className="size-full object-contain p-1" />
        ) : (
          <ImageIcon className="size-6 text-muted-foreground" />
        )}
      </div>
      <div className="space-y-1.5">
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
          }}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={busy}
          onClick={() => inputRef.current?.click()}
          className="rounded-lg"
        >
          {busy ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
          {preview ? "Replace logo" : "Upload logo"}
        </Button>
        {error ? (
          <p className="text-xs text-destructive">{error}</p>
        ) : (
          <p className="text-xs text-muted-foreground">PNG or SVG, under 2MB.</p>
        )}
      </div>
    </div>
  );
}
