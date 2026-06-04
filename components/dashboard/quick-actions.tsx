"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { usePublicBase } from "@/lib/use-public-base";
import { Copy, Check, ExternalLink, QrCode } from "lucide-react";

/**
 * One-tap primary actions for a clinic (KLM: minimise steps; Fitts: large
 * targets). Copy the patient link, open the form, jump to the poster.
 */
export function QuickActions({
  slug,
  siteUrl,
}: {
  slug: string;
  siteUrl: string;
}) {
  const base = usePublicBase(siteUrl);
  const formUrl = `${base}/${slug}`;
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(formUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="rounded-2xl border bg-card p-4 shadow-sm">
      <p className="text-sm font-medium">Your patient feedback link</p>
      <p className="mt-1 truncate text-sm text-muted-foreground">{formUrl}</p>
      <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
        <Button
          type="button"
          onClick={copy}
          className="h-11 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 text-base hover:from-emerald-500 hover:to-green-700"
        >
          {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
          {copied ? "Copied!" : "Copy link"}
        </Button>
        <a href={formUrl} target="_blank" rel="noreferrer" className="contents">
          <Button type="button" variant="outline" className="h-11 w-full rounded-xl text-base">
            <ExternalLink className="size-4" />
            Open form
          </Button>
        </a>
        <a href="#poster" className="contents">
          <Button type="button" variant="outline" className="h-11 w-full rounded-xl text-base">
            <QrCode className="size-4" />
            Get poster
          </Button>
        </a>
      </div>
    </div>
  );
}
