import type { VercelRequest, VercelResponse } from "@vercel/node";
import { z } from "zod";
import { enforceBrandVoice } from "../../../_lib/domain";
import { allowMethods, json } from "../../../_lib/http";

const schema = z.object({
  title: z.string().min(3),
  description: z.string().min(3),
});

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (!allowMethods(req, res, ["POST"])) return;
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return json(res, 400, { error: "Invalid body", issues: parsed.error.issues });
  }

  return json(res, 200, {
    id: req.query.id,
    moderated: true,
    title: enforceBrandVoice(parsed.data.title, {
      audience: "buyer",
      format: "title",
    }),
    description: enforceBrandVoice(parsed.data.description, {
      audience: "buyer",
      format: "description",
    }),
  });
}
