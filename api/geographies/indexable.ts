import type { VercelRequest, VercelResponse } from "@vercel/node";
import { geographies } from "../_lib/domain";
import { allowMethods, json } from "../_lib/http";

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (!allowMethods(req, res, ["GET"])) return;
  json(res, 200, geographies.filter((entry) => entry.isIndexable));
}
