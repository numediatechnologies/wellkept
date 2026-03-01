import type { VercelRequest, VercelResponse } from "@vercel/node";
import { categories, geographies, listings } from "../_lib/domain.js";
import { allowMethods } from "../_lib/http.js";

function toSlug(value: string) {
  return value.toLowerCase().replace(/\s+/g, "-");
}

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (!allowMethods(req, res, ["GET"])) return;

  const baseUrl = process.env.APP_BASE_URL ?? "https://tenders.marketdirect.co.za";
  const name = Array.isArray(req.query.name) ? req.query.name[0] : req.query.name;

  let urls: string[] = [];

  if (name === "static.xml") {
    urls = ["/", "/browse", "/buyer-post/new", "/seller/listing/new", "/south-africa"];
  } else if (name === "categories-1.xml") {
    urls = categories.flatMap((category) => [
      `/browse/${category.slug}`,
      ...geographies
        .filter((entry) => entry.geoType === "city")
        .slice(0, 6)
        .map((entry) => `/browse/${category.slug}/${toSlug(entry.province)}/${entry.slug}`),
    ]);
  } else if (name === "geography-1.xml") {
    urls = geographies
      .filter((entry) => entry.isIndexable)
      .map((entry) =>
        entry.geoType === "province"
          ? `/south-africa/${entry.slug}`
          : entry.geoType === "city"
            ? `/south-africa/${entry.parentSlug}/${entry.slug}`
            : "/south-africa",
      );
  } else if (name === "listings-1.xml") {
    urls = listings.map((listing) => `/listing/${listing.slug}`);
  } else {
    res.status(404).send("Not found");
    return;
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (url) => `  <url><loc>${baseUrl}${url}</loc><changefreq>daily</changefreq></url>`,
  )
  .join("\n")}
</urlset>`;

  res.setHeader("Content-Type", "application/xml; charset=utf-8");
  res.setHeader("Cache-Control", "public, s-maxage=1800, stale-while-revalidate=86400");
  res.send(xml);
}
