import { PartyPopper } from "lucide-react";

export const dynamic = "force-static";

export default function ThankYouPage() {
  return (
    <div className="flex flex-col items-center gap-4 rounded-3xl border border-border/60 bg-card p-8 text-center shadow-lg shadow-black/5 sm:p-10">
      <PartyPopper className="size-12 text-amber-400" strokeWidth={1.75} />
      <h1 className="text-2xl font-semibold tracking-tight">Thank you!</h1>
      <p className="text-pretty text-muted-foreground">
        We appreciate your feedback. Have a great day.
      </p>
    </div>
  );
}
