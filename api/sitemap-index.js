import { generateCompanies } from "../lib/companies.js";

export const config = { maxDuration: 10 };

export default async function handler(req, res) {
  const baseUrl = process.env.SITE_URL || `https://${req.headers.host}`;

  const now = new Date();
  const ist = new Date(now.getTime() + 5.5 * 60 * 60 * 1000);
  const dateStr = ist.toISOString().split("T")[0];

  // 5000 companies × 5 posts = 25000 URLs ÷ 5000 per sitemap = 5 sitemaps
  const allCompanies = generateCompanies();
  const URLS_PER_SITEMAP = 5000;
  const POSTS_PER_COMPANY = 5;
  const totalSitemaps = Math.ceil((allCompanies.length * POSTS_PER_COMPANY) / URLS_PER_SITEMAP);

  const entries = Array.from({ length: totalSitemaps }, (_, i) => `  <sitemap>
    <loc>${baseUrl}/sitemap${i + 1}.xml</loc>
    <lastmod>${dateStr}</lastmod>
  </sitemap>`).join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries}
</sitemapindex>`;

  res.setHeader("Content-Type", "application/xml");
  res.setHeader("Cache-Control", "s-maxage=3600");
  return res.status(200).send(xml);
}
