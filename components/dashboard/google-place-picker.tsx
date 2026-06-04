"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Check, ExternalLink, TriangleAlert } from "lucide-react";

export interface ParsedReview {
  placeId?: string;
  reviewUrl: string;
  /** true = opens the write-a-review box; false = opens the place page only. */
  direct: boolean;
}

function writeReview(placeId: string) {
  return `https://search.google.com/local/writereview?placeid=${placeId}`;
}

/**
 * Parse a pasted Google link (review link, Place ID, place/directions link or
 * short link) into a review/place URL. No API needed.
 *
 * Only a Place ID / review link can deep-link to the write-a-review box. A
 * plain Maps/directions link only carries a CID, which opens the place page.
 */
export function parseMapsLink(raw: string): ParsedReview | null {
  const v = raw.trim();
  if (!v) return null;

  // Already a write-review link.
  if (/writereview\?placeid=/i.test(v)) {
    const id = v.match(/placeid=([^&\s]+)/i)?.[1];
    return { placeId: id, reviewUrl: v, direct: true };
  }
  // Any link carrying placeid=
  const pid = v.match(/placeid=([^&\s]+)/i);
  if (pid) return { placeId: pid[1], reviewUrl: writeReview(pid[1]), direct: true };

  // g.page review short link, or any /review link.
  if (/g\.page\/r\//i.test(v) || /\/review\/?(\?|#|$)/i.test(v)) {
    return { reviewUrl: v, direct: true };
  }

  // Bare Place ID (ChIJ… or similar).
  if (!/^https?:\/\//i.test(v) && /^[A-Za-z0-9_-]{20,}$/.test(v)) {
    return { placeId: v, reviewUrl: writeReview(v), direct: true };
  }

  // CID in the data param (opens place page only).
  const cidHex = v.match(/!1s0x[0-9a-f]+:0x([0-9a-f]+)/i);
  if (cidHex) {
    try {
      const cid = BigInt("0x" + cidHex[1]).toString();
      return { reviewUrl: `https://www.google.com/maps?cid=${cid}`, direct: false };
    } catch {
      /* fall through */
    }
  }
  const cidParam = v.match(/[?&]cid=(\d+)/);
  if (cidParam) {
    return {
      reviewUrl: `https://www.google.com/maps?cid=${cidParam[1]}`,
      direct: false,
    };
  }

  // Any Google Maps / short link — place page only.
  if (
    /^https?:\/\/(maps\.app\.goo\.gl|goo\.gl\/maps|g\.page|(www\.)?google\.[a-z.]+\/maps|maps\.google\.[a-z.]+)/i.test(
      v,
    )
  ) {
    return { reviewUrl: v, direct: false };
  }

  if (/^https?:\/\//i.test(v)) return { reviewUrl: v, direct: false };
  return null;
}

interface GooglePlacePickerProps {
  onConnect: (args: ParsedReview) => Promise<string | null>;
}

export function GooglePlacePicker({ onConnect }: GooglePlacePickerProps) {
  const [link, setLink] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const parsed = parseMapsLink(link);

  async function connect() {
    if (!parsed || saving) {
      setError("Paste a valid Google review link, Place ID or Maps link.");
      return;
    }
    setSaving(true);
    setError(null);
    const err = await onConnect(parsed);
    setSaving(false);
    if (err) setError(err);
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input
          value={link}
          onChange={(e) => setLink(e.target.value)}
          placeholder="Paste your Place ID (ChIJ…) or review link"
          className="h-11 rounded-xl"
          disabled={saving}
        />
        <Button
          type="button"
          onClick={connect}
          disabled={saving || !link.trim()}
          className="h-11 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-500 hover:to-green-700"
        >
          {saving ? <Loader2 className="size-4 animate-spin" /> : "Connect"}
        </Button>
      </div>

      {parsed && parsed.direct && !error && (
        <a
          href={parsed.reviewUrl}
          target="_blank"
          rel="noreferrer noopener"
          className="inline-flex items-center gap-1.5 text-xs text-emerald-600 hover:underline"
        >
          <Check className="size-3.5" />
          Opens the review box. Preview
          <ExternalLink className="size-3" />
        </a>
      )}

      {parsed && !parsed.direct && !error && (
        <p className="flex items-start gap-1.5 rounded-lg bg-amber-50 p-2 text-xs text-amber-800">
          <TriangleAlert className="mt-0.5 size-3.5 shrink-0" />
          This link opens a Google page, not the review box. For patients to land
          straight on the review form, use your review link or Place ID (below).
        </p>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}

      <details className="text-xs text-muted-foreground">
        <summary className="cursor-pointer font-medium text-foreground">
          How do I get the right link?
        </summary>
        <ul className="mt-2 list-disc space-y-1 pl-4">
          <li>
            <strong>Recommended — paste your Place ID:</strong> get it free from
            the{" "}
            <a
              href="https://developers.google.com/maps/documentation/places/web-service/place-id"
              target="_blank"
              rel="noreferrer noopener"
              className="text-emerald-600 hover:underline"
            >
              Place ID Finder
            </a>{" "}
            (search your clinic, copy the <code>ChIJ…</code> value). Opens the
            review box directly.
          </li>
          <li>
            <strong>Or your review link:</strong> on Google Search, find your
            clinic, click <strong>Ask for reviews</strong>, and copy the link
            (<code>g.page/r/…/review</code>).
          </li>
          <li>
            A plain Maps/directions link also works, but only opens your place
            page.
          </li>
        </ul>
      </details>
    </div>
  );
}
