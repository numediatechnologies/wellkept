import type { VercelRequest, VercelResponse } from "@vercel/node";
import handler from "./admin/[resource]/[id]/[action].js";

export default function adminEntry(req: VercelRequest, res: VercelResponse) {
  const resource = Array.isArray(req.query.resource) ? req.query.resource[0] : req.query.resource;
  const id = Array.isArray(req.query.id) ? req.query.id[0] : req.query.id;
  const action = Array.isArray(req.query.action) ? req.query.action[0] : req.query.action;

  if (!resource || !id || !action) {
    res.status(400).json({ error: "Missing admin route parts" });
    return;
  }

  return handler(req, res);
}
