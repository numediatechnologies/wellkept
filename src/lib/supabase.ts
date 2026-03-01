import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const resolvedUrl =
  url ||
  import.meta.env.NEXT_PUBLIC_WELLKEPTSUPABASE_URL ||
  import.meta.env.WELLKEPT_SUPABASE_URL;
const resolvedAnonKey =
  anonKey ||
  import.meta.env.NEXT_PUBLIC_WELLKEPTSUPABASE_ANON_KEY ||
  import.meta.env.NEXT_PUBLIC_WELLKEPTSUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.WELLKEPT_SUPABASE_ANON_KEY ||
  import.meta.env.WELLKEPT_SUPABASE_PUBLISHABLE_KEY;

export const supabase =
  resolvedUrl && resolvedAnonKey ? createClient(resolvedUrl, resolvedAnonKey) : null;
