import { generateCompanies } from "../lib/companies.js";

export const config = { maxDuration: 10 };

export default async function handler(req, res) {
  const baseUrl = process.env.SITE_URL || `https://${req.headers.host}`;

  const { GITHUB_TOKEN, GITHUB_OWNER, GITHUB_REPO } = process.env;

  // Get sitemap number from query param ?id=1
  const sitemapId = parseInt(req.query.id || "1");
  if (isNaN(sitemapId) || sitemapId < 1) return res.status(404).send("Sitemap not found");

  // Get all available dates from GitHub
  let dates = [];
  try {
    const r = await fetch(`https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/jobs`, {
      headers: { Authorization: `token ${GITHUB_TOKEN}`, Accept: "application/vnd.github.v3+json", "User-Agent": "JobPoster-Bot/1.0" }
    });
    if (r.ok) {
      const data = await r.json();
      if (Array.isArray(data)) {
        dates = data
          .filter(f => f.type === "dir" && /^\d{4}-\d{2}-\d{2}$/.test(f.name))
          .map(f => f.name)
          .sort((a, b) => b.localeCompare(a));
      }
    }
  } catch { }

  // Fallback to today
  if (dates.length === 0) {
    const now = new Date();
    const ist = new Date(now.getTime() + 5.5 * 60 * 60 * 1000);
    dates = [ist.toISOString().split("T")[0]];
  }

  // Each day has 5 sitemaps (1000 companies each × 5 posts = 5000 URLs)
  const SITEMAPS_PER_DAY = 5;
  const COMPANIES_PER_SITEMAP = 1000;
  const POSTS_PER_COMPANY = 5;

  // Figure out which date and chunk this sitemapId maps to
  const dateIndex = Math.floor((sitemapId - 1) / SITEMAPS_PER_DAY);
  const chunkIndex = (sitemapId - 1) % SITEMAPS_PER_DAY; // 0-4

  if (dateIndex >= dates.length) {
    return res.status(404).send("Sitemap not found");
  }

  const dateStr = dates[dateIndex];
  const allCompanies = generateCompanies();
  const start = chunkIndex * COMPANIES_PER_SITEMAP;
  const companies = allCompanies.slice(start, start + COMPANIES_PER_SITEMAP);

  const urls = [];

  // Add static pages to first sitemap only
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

  // Generate job URLs using correct slug format matching templateEngine.js
  for (const company of companies) {
    const companySlug = company.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").substring(0, 50);
    for (let postIdx = 0; postIdx < POSTS_PER_COMPANY; postIdx++) {
      // This matches the actual file path format in trigger.js
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
