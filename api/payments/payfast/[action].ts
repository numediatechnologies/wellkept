import type { VercelRequest, VercelResponse } from "@vercel/node";
import { z } from "zod";
import { allowMethods, json } from "../../_lib/http";

const initiateSchema = z.object({
  reservationId: z.string().min(1),
  amount: z.number().positive(),
});

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (!allowMethods(req, res, ["POST"])) return;

  const action = Array.isArray(req.query.action) ? req.query.action[0] : req.query.action;

  if (action === "initiate") {
    const parsed = initiateSchema.safeParse(req.body);
    if (!parsed.success) {
      return json(res, 400, { error: "Invalid body", issues: parsed.error.issues });
    }

    return json(res, 200, {
      reservationId: parsed.data.reservationId,
      amount: parsed.data.amount,
      provider: "payfast",
      status: "pending",
      redirectUrl: `https://www.payfast.co.za/eng/process?custom_str1=${parsed.data.reservationId}`,
      bounded: true,
    });
  }

  if (action === "webhook") {
    const reservationId =
      typeof req.body?.custom_str1 === "string" ? req.body.custom_str1 : "unknown";

    return json(res, 200, {
      received: true,
      provider: "payfast",
      reservationId,
      nextAction: "enqueue_notification_batch",
    });
  }

  return json(res, 404, { error: "Unknown Payfast action" });
}
