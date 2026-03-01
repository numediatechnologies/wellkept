import { createHash } from "node:crypto";
import { serverEnv } from "./env";

type PayfastFields = Record<string, string>;

function encode(value: string) {
  return encodeURIComponent(value).replace(/%20/g, "+");
}

export function createPayfastSignature(fields: PayfastFields) {
  const filtered = Object.entries(fields)
    .filter(([, value]) => value !== "")
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${key}=${encode(value)}`);

  if (serverEnv.payfastPassphrase) {
    filtered.push(`passphrase=${encode(serverEnv.payfastPassphrase)}`);
  }

  return createHash("md5").update(filtered.join("&")).digest("hex");
}

export function buildPayfastInitiation(input: {
  reservationId: string;
  amount: number;
  itemName: string;
  emailAddress?: string;
}) {
  if (!serverEnv.payfastMerchantId || !serverEnv.payfastMerchantKey) {
    return null;
  }

  const fields: PayfastFields = {
    merchant_id: serverEnv.payfastMerchantId,
    merchant_key: serverEnv.payfastMerchantKey,
    return_url: `${serverEnv.appBaseUrl}/dashboard?payment=success`,
    cancel_url: `${serverEnv.appBaseUrl}/dashboard?payment=cancelled`,
    notify_url: `${serverEnv.appBaseUrl}/api/payments/payfast/webhook`,
    name_first: "Well-Kept",
    email_address: input.emailAddress ?? "",
    m_payment_id: input.reservationId,
    amount: input.amount.toFixed(2),
    item_name: input.itemName,
    custom_str1: input.reservationId,
  };

  return {
    provider: "payfast",
    actionUrl: "https://www.payfast.co.za/eng/process",
    fields,
    signature: createPayfastSignature(fields),
  };
}

export function verifyPayfastWebhook(payload: Record<string, unknown>) {
  const signature = typeof payload.signature === "string" ? payload.signature : "";
  if (!signature) return false;

  const fields = Object.fromEntries(
    Object.entries(payload)
      .filter(([key, value]) => key !== "signature" && typeof value === "string")
      .map(([key, value]) => [key, value as string]),
  );

  return createPayfastSignature(fields) === signature;
}
