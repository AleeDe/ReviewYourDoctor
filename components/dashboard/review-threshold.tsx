"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/browser";
import { Star, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const OPTIONS = [
  { value: 5, label: "5★ only" },
  { value: 4, label: "4★ or higher" },
  { value: 3, label: "3★ or higher" },
];

/**
 * Lets the business choose which ratings get sent to Google. At or above the
 * threshold → Google review; below → private follow-up.
 */
export function ReviewThreshold({ current }: { current: number }) {
  const router = useRouter();
  const [value, setValue] = useState(current);
  const [saving, setSaving] = useState<number | null>(null);

  async function choose(n: number) {
    if (n === value || saving) return;
    setSaving(n);
    const supabase = createClient();
    const { error } = await supabase.rpc("update_my_clinic", {
      p_positive_threshold: n,
    });
    setSaving(null);
    if (!error) {
      setValue(n);
      router.refresh();
    }
  }

  return (
    <div className="space-y-2">
      <div>
        <p className="text-sm font-medium">Send to Google when patients rate</p>
        <p className="text-sm text-muted-foreground">
          Lower ratings come to you privately instead.
        </p>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {OPTIONS.map((o) => {
          const activeOpt = o.value === value;
          return (
            <button
              key={o.value}
              type="button"
              onClick={() => choose(o.value)}
              disabled={saving !== null}
              className={cn(
                "flex h-12 flex-col items-center justify-center gap-0.5 rounded-xl border text-xs font-medium transition-colors",
                activeOpt
                  ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                  : "hover:bg-muted",
              )}
            >
              {saving === o.value ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <>
                  <span className="flex items-center gap-0.5">
                    {o.value}
                    <Star
                      className={cn(
                        "size-3",
                        activeOpt
                          ? "fill-amber-400 text-amber-400"
                          : "fill-muted-foreground/40 text-muted-foreground/40",
                      )}
                      strokeWidth={0}
                    />
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {o.value === 5 ? "only" : "& up"}
                  </span>
                </>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
