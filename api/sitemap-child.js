// api/sitemap-child.js - Child sitemaps (sitemap1.xml to sitemap5.xml)
// Generates URLs directly from companies list - no GitHub API call needed

import { generateCompanies } from "../lib/companies.js";

export const config = { maxDuration: 10 };

export default async function handler(req, res) {
  const baseUrl = process.env.SITE_URL || `https://${req.headers.host}`;

  const now = new Date();
  const istOffset = 5.5 * 60 * 60 * 1000;
  const ist = new Date(now.getTime() + istOffset);
  const dateStr = ist.toISOString().split("T")[0];

  // Get sitemap number from URL
  const urlPath = req.url || "";
  const match = urlPath.match(/sitemap(\d+)\.xml/);
  const sitemapIndex = match ? parseInt(match[1]) : 1;

  if (sitemapIndex < 1 || sitemapIndex > 5) {
    return res.status(404).send("Sitemap not found");
  }

  // 5000 companies / 5 sitemaps = 1000 companies per sitemap
  const allCompanies = generateCompanies();
  const CHUNK = 1000;
  const start = (sitemapIndex - 1) * CHUNK;
  const end = start + CHUNK;
  const companies = allCompanies.slice(start, end);

  const POSTS_PER_COMPANY = 5;

  const urls = [];

  // Add static pages to sitemap1 only
  if (sitemapIndex === 1) {
    urls.push(`  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${dateStr}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>`);
  }

  // Add job URLs for each company x 5 posts
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
