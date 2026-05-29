"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { Button } from "@/components/ui/button";

interface QrCodeProps {
  url: string;
  slug: string;
}

/** Renders a downloadable QR code for a clinic's feedback URL. */
export function QrCode({ url, slug }: QrCodeProps) {
  const [dataUrl, setDataUrl] = useState<string>("");

  useEffect(() => {
    QRCode.toDataURL(url, { width: 512, margin: 2 })
      .then(setDataUrl)
      .catch(() => setDataUrl(""));
  }, [url]);

  if (!dataUrl) {
    return <div className="size-32 animate-pulse rounded bg-muted" />;
  }

  return (
    <div className="flex flex-col items-center gap-2">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={dataUrl} alt={`QR code for ${slug}`} className="size-32" />
      <a href={dataUrl} download={`qr-${slug}.png`}>
        <Button type="button" variant="outline" size="sm">
          Download QR
        </Button>
      </a>
    </div>
  );
}
