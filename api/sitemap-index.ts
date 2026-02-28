import type { VercelRequest, VercelResponse } from "@vercel/node";
import { allowMethods } from "./_lib/http";

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (!allowMethods(req, res, ["GET"])) return;

  const baseUrl = process.env.APP_BASE_URL ?? "https://tenders.marketdirect.co.za";
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap><loc>${baseUrl}/sitemaps/static.xml</loc></sitemap>
  <sitemap><loc>${baseUrl}/sitemaps/categories-1.xml</loc></sitemap>
  <sitemap><loc>${baseUrl}/sitemaps/geography-1.xml</loc></sitemap>
  <sitemap><loc>${baseUrl}/sitemaps/listings-1.xml</loc></sitemap>
</sitemapindex>`;

  res.setHeader("Content-Type", "application/xml; charset=utf-8");
  res.send(xml);
}
