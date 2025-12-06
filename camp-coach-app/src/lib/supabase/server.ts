// /lib/supabase/server.ts
import { createClient } from "@supabase/supabase-js";

// NEVER import this in client components
export function createServerSupabase() {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}
