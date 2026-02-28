import type { VercelRequest, VercelResponse } from "@vercel/node";
import { allowMethods, json } from "../../_lib/http";

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (!allowMethods(req, res, ["POST"])) return;
  const reservationId =
    typeof req.body?.custom_str1 === "string" ? req.body.custom_str1 : "unknown";

  return json(res, 200, {
    received: true,
    provider: "payfast",
    reservationId,
    nextAction: "enqueue_notification_batch",
  });
}
