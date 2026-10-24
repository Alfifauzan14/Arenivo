import { createClient } from "@supabase/supabase-js";
import { env } from "../config/env";

const supabaseUrl = env.SUPABASE_URL || "https://dummy-project.supabase.co";
const supabaseServiceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY || "dummy-service-role-key";

/**
 * Klien Supabase Admin (Bypass RLS dengan Service Role Key)
 * Digunakan secara eksklusif di backend repository
 */
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});
