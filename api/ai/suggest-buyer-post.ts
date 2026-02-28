import type { VercelRequest, VercelResponse } from "@vercel/node";
import { z } from "zod";
import { suggestBuyerPost } from "../_lib/domain";
import { allowMethods, json } from "../_lib/http";

const schema = z.object({
  text: z.string().min(2),
  cityOrTown: z.string().optional(),
});

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (!allowMethods(req, res, ["POST"])) return;
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return json(res, 400, { error: "Invalid body", issues: parsed.error.issues });
  }

  return json(res, 200, suggestBuyerPost(parsed.data));
}
