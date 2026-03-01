import type { VercelRequest, VercelResponse } from "@vercel/node";
import handler from "./ai/[action].js";

export default function aiEntry(req: VercelRequest, res: VercelResponse) {
  const action = Array.isArray(req.query.action) ? req.query.action[0] : req.query.action;
  if (!action) {
    res.status(400).json({ error: "Missing AI action" });
    return;
  }

  return handler(req, res);
}
