function readEnv(key: string) {
  const value = process.env[key];
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : undefined;
}

export const serverEnv = {
  appBaseUrl: readEnv("APP_BASE_URL") ?? "https://wellkept.marketdirect.co.za",
  openAiApiKey: readEnv("OPENAI_API_KEY"),
  openAiModel: readEnv("OPENAI_TENDER_MODEL") ?? "gpt-5-mini",
  resendApiKey: readEnv("RESEND_API_KEY"),
  resendFromEmail: readEnv("RESEND_FROM_EMAIL") ?? "alerts@tenders.marketdirect.co.za",
  payfastMerchantId: readEnv("PAYFAST_MERCHANT_ID"),
  payfastMerchantKey: readEnv("PAYFAST_MERCHANT_KEY"),
  payfastPassphrase: readEnv("PAYFAST_PASSPHRASE"),
  supabaseUrl:
    readEnv("SUPABASE_URL") ??
    readEnv("VITE_SUPABASE_URL") ??
    readEnv("NEXT_PUBLIC_WELLKEPTSUPABASE_URL") ??
    readEnv("WELLKEPT_SUPABASE_URL"),
  supabaseAnonKey: readEnv("VITE_SUPABASE_ANON_KEY"),
  supabaseServiceRoleKey:
    readEnv("SUPABASE_SERVICE_ROLE_KEY") ??
    readEnv("WELLKEPT_SUPABASE_SERVICE_ROLE_KEY") ??
    readEnv("WELLKEPT_SUPABASE_SECRET_KEY"),
};

export function hasServerEnv<K extends keyof typeof serverEnv>(key: K) {
  return Boolean(serverEnv[key]);
}
