import type { VercelRequest, VercelResponse } from "@vercel/node";
import { z } from "zod";
import { enforceBrandVoice } from "../../../_lib/domain.js";
import { allowMethods, json } from "../../../_lib/http.js";

const moderateSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(3),
});

const verifyRetailPriceSchema = z.object({
  amount: z.number().positive(),
  notes: z.string().min(3),
});

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (!allowMethods(req, res, ["POST"])) return;

  const resource = Array.isArray(req.query.resource) ? req.query.resource[0] : req.query.resource;
  const action = Array.isArray(req.query.action) ? req.query.action[0] : req.query.action;
  const id = Array.isArray(req.query.id) ? req.query.id[0] : req.query.id;

  if (action === "moderate" && (resource === "buyer-posts" || resource === "listings")) {
    const parsed = moderateSchema.safeParse(req.body);
    if (!parsed.success) {
      return json(res, 400, { error: "Invalid body", issues: parsed.error.issues });
    }

    return json(res, 200, {
      id,
      resource,
      moderated: true,
      title: enforceBrandVoice(parsed.data.title, {
        audience: resource === "buyer-posts" ? "buyer" : "seller",
        format: "title",
      }),
      description: enforceBrandVoice(parsed.data.description, {
        audience: resource === "buyer-posts" ? "buyer" : "seller",
        format: "description",
      }),
    });
  }

  if (resource === "retail-prices" && action === "verify") {
    const parsed = verifyRetailPriceSchema.safeParse(req.body);
    if (!parsed.success) {
      return json(res, 400, { error: "Invalid body", issues: parsed.error.issues });
    }

    return json(res, 200, {
      id,
      resource,
      verified: true,
      amount: parsed.data.amount,
      source: "admin_verified",
      notes: parsed.data.notes,
      verifiedAt: new Date().toISOString(),
    });
  }

  return json(res, 404, { error: "Unknown admin action" });
}
