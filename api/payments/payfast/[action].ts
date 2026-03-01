import type { VercelRequest, VercelResponse } from "@vercel/node";
import { z } from "zod";
import { allowMethods, json } from "../../_lib/http.js";
import { buildPayfastInitiation, verifyPayfastWebhook } from "../../_lib/payfast.js";
import { safeInsert } from "../../_lib/supabaseAdmin.js";

const initiateSchema = z.object({
  reservationId: z.string().min(1),
  amount: z.number().positive(),
  itemName: z.string().min(2).default("Well-Kept reservation"),
  emailAddress: z.string().email().optional(),
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!allowMethods(req, res, ["POST"])) return;

  const action = Array.isArray(req.query.action) ? req.query.action[0] : req.query.action;

  if (action === "initiate") {
    const parsed = initiateSchema.safeParse(req.body);
    if (!parsed.success) {
      return json(res, 400, { error: "Invalid body", issues: parsed.error.issues });
    }

    const payfast = buildPayfastInitiation(parsed.data);
    if (!payfast) {
      return json(res, 500, {
        error: "Payfast environment is incomplete",
      });
    }

    await safeInsert("payment_transactions", {
      reservation_id: parsed.data.reservationId,
      provider: "payfast",
      provider_reference: parsed.data.reservationId,
      transaction_type: "deposit_initiated",
      amount: parsed.data.amount,
      currency_code: "ZAR",
      status: "pending",
      raw_payload: {
        actionUrl: payfast.actionUrl,
        fields: payfast.fields,
      },
    });

    return json(res, 200, {
      ...payfast,
      bounded: true,
    });
  }

  if (action === "webhook") {
    const reservationId =
      typeof req.body?.custom_str1 === "string" ? req.body.custom_str1 : "unknown";
    const verified = verifyPayfastWebhook(req.body ?? {});

    await safeInsert("payment_transactions", {
      reservation_id: reservationId,
      provider: "payfast",
      provider_reference:
        typeof req.body?.pf_payment_id === "string" ? req.body.pf_payment_id : reservationId,
      transaction_type: "webhook",
      amount: typeof req.body?.amount_gross === "string" ? Number(req.body.amount_gross) : null,
      currency_code: "ZAR",
      status:
        typeof req.body?.payment_status === "string"
          ? req.body.payment_status.toLowerCase()
          : verified
            ? "complete"
            : "unverified",
      raw_payload: req.body ?? {},
    });

    return json(res, 200, {
      received: true,
      provider: "payfast",
      reservationId,
      verified,
      nextAction: "enqueue_notification_batch",
    });
  }

  return json(res, 404, { error: "Unknown Payfast action" });
}
