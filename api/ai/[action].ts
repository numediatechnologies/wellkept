import type { VercelRequest, VercelResponse } from "@vercel/node";
import { z } from "zod";
import { detectItem, suggestBuyerPost, suggestListing } from "../_lib/domain";
import { allowMethods, json } from "../_lib/http";

const detectSchema = z.object({
  text: z.string().min(2),
});

const suggestSchema = z.object({
  text: z.string().min(2),
  cityOrTown: z.string().optional(),
});

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (!allowMethods(req, res, ["POST"])) return;

  const action = Array.isArray(req.query.action) ? req.query.action[0] : req.query.action;

  if (action === "detect-item") {
    const parsed = detectSchema.safeParse(req.body);
    if (!parsed.success) {
      return json(res, 400, { error: "Invalid body", issues: parsed.error.issues });
    }

    return json(res, 200, detectItem(parsed.data.text));
  }

  if (action === "suggest-listing") {
    const parsed = suggestSchema.safeParse(req.body);
    if (!parsed.success) {
      return json(res, 400, { error: "Invalid body", issues: parsed.error.issues });
    }

    return json(res, 200, suggestListing(parsed.data));
  }

  if (action === "suggest-buyer-post") {
    const parsed = suggestSchema.safeParse(req.body);
    if (!parsed.success) {
      return json(res, 400, { error: "Invalid body", issues: parsed.error.issues });
    }

    return json(res, 200, suggestBuyerPost(parsed.data));
  }

  return json(res, 404, { error: "Unknown AI action" });
}
