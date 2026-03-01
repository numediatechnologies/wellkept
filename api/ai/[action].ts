import type { VercelRequest, VercelResponse } from "@vercel/node";
import { z } from "zod";
import { detectItem } from "../_lib/domain.js";
import { allowMethods, json } from "../_lib/http.js";
import { suggestWithOpenAi } from "../_lib/openai.js";

const detectSchema = z.object({
  text: z.string().min(2),
});

const suggestSchema = z.object({
  text: z.string().min(2),
  cityOrTown: z.string().optional(),
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
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

    const suggestion = await suggestWithOpenAi({
      mode: "listing",
      ...parsed.data,
    });

    return json(res, 200, suggestion);
  }

  if (action === "suggest-buyer-post") {
    const parsed = suggestSchema.safeParse(req.body);
    if (!parsed.success) {
      return json(res, 400, { error: "Invalid body", issues: parsed.error.issues });
    }

    const suggestion = await suggestWithOpenAi({
      mode: "buyer_post",
      ...parsed.data,
    });

    return json(res, 200, suggestion);
  }

  return json(res, 404, { error: "Unknown AI action" });
}
