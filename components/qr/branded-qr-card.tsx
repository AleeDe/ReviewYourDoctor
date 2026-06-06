"use client";

import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { toPng } from "html-to-image";
import { Button } from "@/components/ui/button";
import { usePublicBase } from "@/lib/use-public-base";
import { Download, Loader2, Star, Camera, Heart } from "lucide-react";

const SHIFTDEPLOY_LOGO =
  "https://res.cloudinary.com/dbazbq7u9/image/upload/v1765145802/coloredV_zxupgq.png";

interface BrandedQrCardProps {
  slug: string;
  clinicName: string;
  logoUrl: string | null;
  siteUrl: string;
  /** Dim + label the card as a preview (e.g. before approval). */
  preview?: boolean;
}

/**
 * A print-ready, conversion-optimised review poster:
 * clinic logo → 5-star hook → camera-framed QR → quick steps → gratitude,
 * with the ShiftDeploy logo at the bottom. Downloads as a high-res PNG.
 */
export function BrandedQrCard({
  slug,
  clinicName,
  logoUrl,
  siteUrl,
  preview = false,
}: BrandedQrCardProps) {
  const posterRef = useRef<HTMLDivElement>(null);
  const [qr, setQr] = useState("");
  const [downloading, setDownloading] = useState(false);
  const [sdLogoError, setSdLogoError] = useState(false);

  const base = usePublicBase(siteUrl);
  const formUrl = `${base}/${slug}`;

  useEffect(() => {
    QRCode.toDataURL(formUrl, {
      width: 720,
      margin: 1,
      color: { dark: "#0a2e1e", light: "#ffffff" },
    })
      .then(setQr)
      .catch(() => setQr(""));
  }, [formUrl]);

  async function handleDownload() {
    if (!posterRef.current) return;
    setDownloading(true);
    try {
      const dataUrl = await toPng(posterRef.current, {
        pixelRatio: 3,
        cacheBust: true,
      });
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `review-poster-${slug}.png`;
      a.click();
    } catch {
      /* on-screen card still works */
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div
        ref={posterRef}
        className="w-[300px] overflow-hidden rounded-[1.6rem] bg-gradient-to-br from-emerald-500 to-green-700 p-1.5 shadow-2xl shadow-emerald-900/20"
      >
        <div className="overflow-hidden rounded-[1.25rem] bg-white">
          {/* ===== Header band: logo + hook + 5 gold stars ===== */}
          <div className="relative overflow-hidden bg-gradient-to-br from-emerald-500 to-green-600 px-5 pb-8 pt-6 text-center text-white">
            <div className="pointer-events-none absolute -right-6 -top-6 size-24 rounded-full bg-white/10 blur-xl" />
            <div className="mx-auto flex h-12 items-center justify-center">
              {logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={logoUrl}
                  alt={clinicName}
                  crossOrigin="anonymous"
                  className="max-h-12 max-w-[180px] object-contain"
                />
              ) : (
                <span className="text-lg font-extrabold tracking-tight">
                  {clinicName}
                </span>
              )}
            </div>

            <h2 className="mt-4 text-2xl font-extrabold leading-tight">
              How was your visit?
            </h2>
            <div className="mt-2 flex justify-center gap-1">
              {[0, 1, 2, 3, 4].map((i) => (
                <Star
                  key={i}
                  className="size-7 fill-amber-300 text-amber-300 drop-shadow-sm"
                  strokeWidth={0}
                />
              ))}
            </div>
            <p className="mt-2 text-sm font-medium text-emerald-50">
              Tap a star, it takes 10 seconds
            </p>
          </div>

          {/* ===== QR with camera framing ===== */}
          <div className="px-5 pb-2 pt-6 text-center">
            <div className="relative mx-auto w-fit">
              {/* corner brackets */}
              <span className="absolute -left-1.5 -top-1.5 size-5 rounded-tl-lg border-l-4 border-t-4 border-emerald-500" />
              <span className="absolute -right-1.5 -top-1.5 size-5 rounded-tr-lg border-r-4 border-t-4 border-emerald-500" />
              <span className="absolute -bottom-1.5 -left-1.5 size-5 rounded-bl-lg border-b-4 border-l-4 border-emerald-500" />
              <span className="absolute -bottom-1.5 -right-1.5 size-5 rounded-br-lg border-b-4 border-r-4 border-emerald-500" />
              <div className="rounded-xl bg-white p-2">
                {qr ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={qr} alt="QR code" className="size-40" />
                ) : (
                  <div className="size-40 animate-pulse rounded bg-muted" />
                )}
              </div>
            </div>

            <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-1.5 text-sm font-bold text-emerald-700">
              <Camera className="size-4" />
              Scan with your camera
            </div>

            {/* 3-step guide */}
            <div className="mt-5 flex items-center justify-center gap-2 text-[11px] font-medium text-neutral-500">
              <Step n="1" label="Open camera" />
              <span className="text-emerald-400">›</span>
              <Step n="2" label="Point here" />
              <span className="text-emerald-400">›</span>
              <Step n="3" label="Tap a star" />
            </div>
          </div>

          {/* ===== Gratitude + footer ===== */}
          <p className="mt-2 flex items-center justify-center gap-1.5 px-5 text-center text-sm font-semibold text-neutral-700">
            <Heart className="size-4 fill-rose-400 text-rose-400" strokeWidth={0} />
            Your review means the world to us
          </p>

          <p className="mt-3 px-5 text-center text-[7px] leading-tight text-neutral-400">
            By submitting feedback you agree it may be shared with {clinicName}{" "}
            for service improvement. Privacy: {base}/privacy
          </p>

          <div className="mt-3 flex items-center justify-center gap-1.5 border-t border-neutral-100 py-3">
            <span className="text-[11px] text-neutral-400">Powered by</span>
            {sdLogoError ? (
              <span className="text-sm font-bold text-emerald-600">ShiftDeploy</span>
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={SHIFTDEPLOY_LOGO}
                alt="ShiftDeploy"
                crossOrigin="anonymous"
                onError={() => setSdLogoError(true)}
                className="h-5 object-contain"
              />
            )}
          </div>
        </div>

        {preview && (
          <p className="pt-2 pb-1 text-center text-xs font-medium text-white/90">
            Preview, goes live once approved
          </p>
        )}
      </div>

      <Button
        type="button"
        onClick={handleDownload}
        disabled={downloading || !qr}
        className="rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-500 hover:to-green-700"
      >
        {downloading ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <Download className="size-4" />
        )}
        Download poster (PNG)
      </Button>
    </div>
  );
}

function Step({ n, label }: { n: string; label: string }) {
  return (
    <span className="flex items-center gap-1">
      <span className="grid size-4 place-items-center rounded-full bg-emerald-500 text-[9px] font-bold text-white">
        {n}
      </span>
      {label}
    </span>
  );
}
