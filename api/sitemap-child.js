import { generateCompanies } from "../lib/companies.js";
import { generateJobPosting } from "../lib/templateEngine.js";

export const config = { maxDuration: 10 };

const URLS_PER_SITEMAP = 5000;
const POSTS_PER_COMPANY = 5;

export default async function handler(req, res) {
  const baseUrl = process.env.SITE_URL || `https://${req.headers.host}`;

  const sitemapId = parseInt(req.query.id || "1");
  if (isNaN(sitemapId) || sitemapId < 1) return res.status(404).send("Sitemap not found");

  // Get today's date (IST)
  const now = new Date();
  const ist = new Date(now.getTime() + 5.5 * 60 * 60 * 1000);
  const dateStr = ist.toISOString().split("T")[0];

  // All companies + all posts = 5000 × 5 = 25000 URLs total per day
  // Each sitemap = 5000 URLs = 1000 companies × 5 posts
  const COMPANIES_PER_SITEMAP = URLS_PER_SITEMAP / POSTS_PER_COMPANY; // 1000

  const allCompanies = generateCompanies();
  const totalSitemaps = Math.ceil((allCompanies.length * POSTS_PER_COMPANY) / URLS_PER_SITEMAP);

  if (sitemapId > totalSitemaps) return res.status(404).send("Sitemap not found");

  const startCompany = (sitemapId - 1) * COMPANIES_PER_SITEMAP;
  const companies = allCompanies.slice(startCompany, startCompany + COMPANIES_PER_SITEMAP);

  const urls = [];

  // Static pages on sitemap1 only
  if (sitemapId === 1) {
    urls.push(`  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${dateStr}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/jobs</loc>
    <lastmod>${dateStr}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>`);
  }

  // Generate job URLs directly from companies — no API call needed
  for (const company of companies) {
    const companySlug = company.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").substring(0, 50);
    for (let postIdx = 0; postIdx < POSTS_PER_COMPANY; postIdx++) {
      const posting = generateJobPosting(company, postIdx, dateStr);
      const filePath = `jobs/${dateStr}/${companySlug}/${posting.slug}.json`;
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
