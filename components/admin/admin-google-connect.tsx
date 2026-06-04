"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { GooglePlacePicker } from "@/components/dashboard/google-place-picker";
import { adminConnectGoogle } from "@/app/admin/actions";
import { CheckCircle2, MapPinned } from "lucide-react";

interface AdminGoogleConnectProps {
  clinicId: string;
  connected: boolean;
}

/** Lets the founder connect a clinic's Google listing while approving it. */
export function AdminGoogleConnect({ clinicId, connected }: AdminGoogleConnectProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  async function onConnect(args: { placeId?: string; reviewUrl: string }) {
    const res = await adminConnectGoogle(
      clinicId,
      args.placeId ?? null,
      args.reviewUrl,
    );
    if (!res.ok) return res.message ?? "Failed to connect.";
    setOpen(false);
    router.refresh();
    return null;
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`inline-flex items-center gap-1.5 text-sm font-medium ${
          connected ? "text-emerald-600" : "text-amber-700"
        } hover:underline`}
      >
        {connected ? (
          <>
            <CheckCircle2 className="size-4" /> Google connected (change)
          </>
        ) : (
          <>
            <MapPinned className="size-4" /> Connect Google listing
          </>
        )}
      </button>
    );
  }

  return (
    <div className="rounded-xl border bg-muted/30 p-3">
      <GooglePlacePicker onConnect={onConnect} />
      <button
        type="button"
        onClick={() => setOpen(false)}
        className="mt-2 text-xs text-muted-foreground hover:underline"
      >
        Cancel
      </button>
    </div>
  );
}
