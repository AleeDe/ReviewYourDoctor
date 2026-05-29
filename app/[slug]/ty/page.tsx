export const dynamic = "force-static";

export default function ThankYouPage() {
  return (
    <div className="flex w-full max-w-md flex-col items-center gap-4 text-center">
      <h1 className="text-2xl font-semibold tracking-tight">Thank you!</h1>
      <p className="text-muted-foreground">
        We appreciate your feedback. Have a great day.
      </p>
    </div>
  );
}
