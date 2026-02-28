import type { VercelRequest, VercelResponse } from "@vercel/node";
import { z } from "zod";
import { allowMethods, json } from "../../_lib/http";

const schema = z.object({
  reservationId: z.string().min(1),
  amount: z.number().positive(),
});

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (!allowMethods(req, res, ["POST"])) return;
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return json(res, 400, { error: "Invalid body", issues: parsed.error.issues });
  }

  return json(res, 200, {
    reservationId: parsed.data.reservationId,
    amount: parsed.data.amount,
    provider: "payfast",
    status: "pending",
    redirectUrl: `https://www.payfast.co.za/eng/process?custom_str1=${parsed.data.reservationId}`,
    bounded: true,
  });
}
