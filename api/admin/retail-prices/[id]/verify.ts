import type { VercelRequest, VercelResponse } from "@vercel/node";
import { z } from "zod";
import { allowMethods, json } from "../../../_lib/http";

const schema = z.object({
  amount: z.number().positive(),
  notes: z.string().min(3),
});

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (!allowMethods(req, res, ["POST"])) return;
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return json(res, 400, { error: "Invalid body", issues: parsed.error.issues });
  }

  return json(res, 200, {
    id: req.query.id,
    verified: true,
    amount: parsed.data.amount,
    source: "admin_verified",
    notes: parsed.data.notes,
    verifiedAt: new Date().toISOString(),
  });
}
