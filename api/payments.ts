import type { VercelRequest, VercelResponse } from "@vercel/node";
import handler from "./payments/payfast/[action].js";

export default function paymentsEntry(req: VercelRequest, res: VercelResponse) {
  const action = Array.isArray(req.query.action) ? req.query.action[0] : req.query.action;
  if (!action) {
    res.status(400).json({ error: "Missing payment action" });
    return;
  }

  return handler(req, res);
}
