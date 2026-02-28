import type { VercelRequest, VercelResponse } from "@vercel/node";
import { z } from "zod";
import { enforceBrandVoice } from "../_lib/domain";
import { allowMethods, json } from "../_lib/http";

const schema = z.object({
  to: z.string().email(),
  subject: z.string().min(3),
  body: z.string().min(3),
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!allowMethods(req, res, ["POST"])) return;
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return json(res, 400, { error: "Invalid body", issues: parsed.error.issues });
  }

  const subject = enforceBrandVoice(parsed.data.subject, {
    audience: "public",
    format: "email",
  });
  const body = enforceBrandVoice(parsed.data.body, {
    audience: "public",
    format: "email",
  });

  return json(res, 200, {
    queued: true,
    provider: "resend",
    to: parsed.data.to,
    subject,
    body,
  });
}
