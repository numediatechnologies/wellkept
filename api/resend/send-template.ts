import type { VercelRequest, VercelResponse } from "@vercel/node";
import { z } from "zod";
import { allowMethods, json } from "../_lib/http";
import { sendTransactionalEmail } from "../_lib/email";

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

  const result = await sendTransactionalEmail(parsed.data);
  return json(res, result.queued ? 200 : 502, {
    to: parsed.data.to,
    ...result,
  });
}
