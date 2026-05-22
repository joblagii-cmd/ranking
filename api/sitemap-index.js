import { generateCompanies } from "../lib/companies.js";

export const config = { maxDuration: 10 };

export default async function handler(req, res) {
  const baseUrl = process.env.SITE_URL || `https://${req.headers.host}`;

  const now = new Date();
  const ist = new Date(now.getTime() + 5.5 * 60 * 60 * 1000);
  const dateStr = ist.toISOString().split("T")[0];

  // Get all available date folders from GitHub
  const { GITHUB_TOKEN, GITHUB_OWNER, GITHUB_REPO } = process.env;

  let dates = [dateStr]; // fallback to today only

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
          .sort((a, b) => b.localeCompare(a)); // newest first
      }
    }
  } catch { }

  // 5000 companies × 5 posts = 25,000 URLs per day
  // 5000 URLs per sitemap = 5 sitemaps per day
  const SITEMAPS_PER_DAY = 5;
  const totalSitemaps = dates.length * SITEMAPS_PER_DAY;

  const sitemapEntries = [];
  let sitemapNum = 1;

  for (const date of dates) {
    for (let i = 1; i <= SITEMAPS_PER_DAY; i++) {
      sitemapEntries.push(`  <sitemap>
    <loc>${baseUrl}/sitemap${sitemapNum}.xml</loc>
    <lastmod>${date}</lastmod>
  </sitemap>`);
      sitemapNum++;
    }
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapEntries.join("\n")}
</sitemapindex>`;

  res.setHeader("Content-Type", "application/xml");
  res.setHeader("Cache-Control", "s-maxage=3600");
  return res.status(200).send(xml);
}
