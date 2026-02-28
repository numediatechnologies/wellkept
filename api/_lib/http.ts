import type { VercelRequest, VercelResponse } from "@vercel/node";

export function allowMethods(
  req: VercelRequest,
  res: VercelResponse,
  methods: string[],
) {
  if (!methods.includes(req.method ?? "GET")) {
    res.setHeader("Allow", methods.join(", "));
    res.status(405).json({ error: "Method not allowed" });
    return false;
  }

  return true;
}

export function json(res: VercelResponse, status: number, body: unknown) {
  res.status(status).setHeader("Content-Type", "application/json");
  res.send(JSON.stringify(body));
}
