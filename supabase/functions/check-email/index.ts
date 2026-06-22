import { createClient } from "jsr:@supabase/supabase-js@2";

// Public existence check (boolean only, no credentials) -> allow any origin so
// it works on localhost, preview, and production without CORS issues.
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json",
};

function response(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: corsHeaders });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return response({ error: "Method not allowed" }, 405);

  try {
    const { email } = (await req.json()) as { email?: string };
    const normalized = email?.trim().toLowerCase() ?? "";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
      return response({ error: "Enter a valid email address" }, 400);
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    const { data, error } = await supabase.rpc("is_email_registered", {
      p_email: normalized,
    });
    if (error) throw error;

    return response({ registered: Boolean(data) });
  } catch (error) {
    console.error("email check failed", error);
    return response({ error: "Unable to check email right now" }, 500);
  }
});

