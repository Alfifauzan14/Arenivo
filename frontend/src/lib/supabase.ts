import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL || "https://vtfcigukjtmplgcihjgw.supabase.co";
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY || "sb_publishable_jLZdbwXyNXc-kJOHAtydDA_FjjT3Pea";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
  global: {
    fetch: async (input, init) => {
      const res = await fetch(input, init);
      const url = typeof input === "string" ? input : input instanceof Request ? input.url : "";
      // @supabase/auth-js leaves 204 logout response bodies unread (`noResolveJson: true`),
      // which Chromium can flag as net::ERR_ABORTED during logout/redirects.
      if (res.status === 204 && url.includes("/auth/v1/logout")) {
        await res.arrayBuffer().catch(() => {});
      }
      return res;
    },
  },
});
