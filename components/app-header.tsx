import Link from "next/link";
import { Button } from "@/components/ui/button";

interface AppHeaderProps {
  title: string;
  subtitle?: string;
  /** Clinic logo shown as an avatar before the title. */
  logoUrl?: string | null;
  /** Initials fallback when there's no logo (e.g. "FS"). */
  initials?: string;
  /** Icon avatar (e.g. for the admin panel), used when there's no logo. */
  icon?: React.ReactNode;
  /** Optional extra nav (e.g. admin link). */
  children?: React.ReactNode;
}

export function AppHeader({
  title,
  subtitle,
  logoUrl,
  initials,
  icon,
  children,
}: AppHeaderProps) {
  const showAvatar = logoUrl !== undefined || Boolean(initials) || Boolean(icon);
  return (
    <header className="sticky top-0 z-20 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6 sm:py-4">
        <Link href="/dashboard" className="flex min-w-0 items-center gap-3">
          {showAvatar && (
            <span className="grid size-10 shrink-0 place-items-center overflow-hidden rounded-xl border bg-card shadow-sm">
              {logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={logoUrl}
                  alt={title}
                  className="size-full object-contain p-1"
                />
              ) : icon ? (
                <span className="grid size-full place-items-center bg-gradient-to-br from-emerald-500 to-green-600 text-white">
                  {icon}
                </span>
              ) : (
                <span className="bg-gradient-to-br from-emerald-500 to-green-600 bg-clip-text text-sm font-bold text-transparent">
                  {initials}
                </span>
              )}
            </span>
          )}
          <span className="min-w-0">
            <span className="block truncate text-base font-semibold sm:text-lg">
              {title}
            </span>
            {subtitle && (
              <span className="block truncate text-xs text-muted-foreground sm:text-sm">
                {subtitle}
              </span>
            )}
          </span>
        </Link>
        <div className="flex shrink-0 items-center gap-2">
          {children}
          <form action="/auth/signout" method="post">
            <Button type="submit" variant="outline" size="sm">
              Sign out
            </Button>
          </form>
        </div>
      </div>
    </header>
  );
}
