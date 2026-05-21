import { generateCompanies } from "../lib/companies.js";

export const config = { maxDuration: 10 };

export default async function handler(req, res) {
  const baseUrl = process.env.SITE_URL || `https://${req.headers.host}`;

  const now = new Date();
  const istOffset = 5.5 * 60 * 60 * 1000;
  const ist = new Date(now.getTime() + istOffset);
  const dateStr = ist.toISOString().split("T")[0];

  // Get sitemap number from query param ?id=1
  const sitemapIndex = parseInt(req.query.id || "1");

  if (sitemapIndex < 1 || sitemapIndex > 5) {
    return res.status(404).send("Sitemap not found");
  }

  const allCompanies = generateCompanies();
  const CHUNK = 1000;
  const start = (sitemapIndex - 1) * CHUNK;
  const companies = allCompanies.slice(start, start + CHUNK);
  const POSTS_PER_COMPANY = 5;

  const urls = [];

  // Static pages in sitemap1 only
  if (sitemapIndex === 1) {
    urls.push(`  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${dateStr}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>`);
  }

  // 1000 companies x 5 posts = 5000 URLs per sitemap
  for (const company of companies) {
    const companySlug = company.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").substring(0, 50);
    for (let postIdx = 0; postIdx < POSTS_PER_COMPANY; postIdx++) {
      const filePath = `jobs/${dateStr}/${companySlug}/${companySlug}-${postIdx}-${dateStr}.json`;
      urls.push(`  <url>
    <loc>${baseUrl}/api/job?path=${encodeURIComponent(filePath)}</loc>
    <lastmod>${dateStr}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>`);
    }
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("\n")}
</urlset>`;

  res.setHeader("Content-Type", "application/xml");
  res.setHeader("Cache-Control", "s-maxage=3600");
  return res.status(200).send(xml);
}
