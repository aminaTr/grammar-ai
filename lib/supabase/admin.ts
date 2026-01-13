import { createClient } from "@supabase/supabase-js";

export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!, // safe to expose URL
  process.env.SUPABASE_SECRET_KEY! // NEVER expose to client
);
