import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function proxy(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  /*
   * Only run the auth session refresh on routes that actually need a server
   * session. Public pages (landing, the patient QR form, login/signup) skip the
   * Supabase round-trip entirely, so they load instantly.
   */
  matcher: ["/dashboard/:path*", "/admin/:path*"],
};
