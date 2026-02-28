import type { VercelRequest, VercelResponse } from "@vercel/node";
import { allowMethods, json } from "./_lib/http";

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (!allowMethods(req, res, ["GET"])) return;

  json(res, 200, {
    ok: true,
    app: "well-kept",
    domain: "tenders.marketdirect.co.za",
    timestamp: new Date().toISOString(),
  });
}
