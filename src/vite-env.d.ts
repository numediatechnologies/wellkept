/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_ANON_KEY?: string;
  readonly NEXT_PUBLIC_WELLKEPTSUPABASE_URL?: string;
  readonly NEXT_PUBLIC_WELLKEPTSUPABASE_ANON_KEY?: string;
  readonly NEXT_PUBLIC_WELLKEPTSUPABASE_PUBLISHABLE_KEY?: string;
  readonly WELLKEPT_SUPABASE_URL?: string;
  readonly WELLKEPT_SUPABASE_ANON_KEY?: string;
  readonly WELLKEPT_SUPABASE_PUBLISHABLE_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
