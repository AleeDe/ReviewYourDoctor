"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/browser";
import { GooglePlacePicker } from "@/components/dashboard/google-place-picker";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Link2 } from "lucide-react";

interface GoogleConnectProps {
  connected: boolean;
  currentReviewUrl: string | null;
}

/**
 * Business self-serve: find the clinic's Google listing via autocomplete (or
 * paste a Place ID/link) and save the review link to their own clinic.
 */
export function GoogleConnect({ connected, currentReviewUrl }: GoogleConnectProps) {
  const router = useRouter();
  const [editing, setEditing] = useState(!connected);

  async function handleConnect(args: { placeId?: string; reviewUrl: string }) {
    const supabase = createClient();
    const { error } = await supabase.rpc("update_my_clinic", {
      p_google_place_id: args.placeId ?? null,
      p_google_review_url: args.reviewUrl,
    });
    if (error) return error.message;
    router.refresh();
    return null;
  }

  if (connected && !editing) {
    return (
      <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4">
        <div className="flex items-center gap-2 text-emerald-700">
          <CheckCircle2 className="size-5" />
          <span className="font-semibold">Google listing connected</span>
        </div>
        {currentReviewUrl && (
          <a
            href={currentReviewUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-2 flex items-center gap-1.5 truncate text-sm text-emerald-600 hover:underline"
          >
            <Link2 className="size-3.5 shrink-0" />
            <span className="truncate">{currentReviewUrl}</span>
          </a>
        )}
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-3 rounded-lg"
          onClick={() => setEditing(true)}
        >
          Change listing
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div>
        <p className="text-sm font-medium">Connect your Google listing</p>
        <p className="text-sm text-muted-foreground">
          Paste your Google review link (or Place ID) so patients land straight
          on the review box.
        </p>
      </div>
      <GooglePlacePicker onConnect={handleConnect} />
      {connected && (
        <button
          type="button"
          onClick={() => setEditing(false)}
          className="text-sm text-muted-foreground hover:underline"
        >
          Cancel
        </button>
      )}
    </div>
  );
}
