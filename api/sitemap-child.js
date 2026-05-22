import { generateCompanies } from "../lib/companies.js";
import { generateJobPosting } from "../lib/templateEngine.js";

export const config = { maxDuration: 10 };

const SITEMAPS_PER_DAY = 5;
const POSTS_PER_COMPANY = 5;
const COMPANIES_PER_SITEMAP = 1000;

async function getDates(owner, repo, token) {
  // Try authenticated API first
  try {
    const r = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/jobs`, {
      headers: { Authorization: `token ${token}`, Accept: "application/vnd.github.v3+json", "User-Agent": "JobPoster-Bot/1.0" }
    });
    if (r.ok) {
      const data = await r.json();
      if (Array.isArray(data)) {
        return data
          .filter(f => f.type === "dir" && /^\d{4}-\d{2}-\d{2}$/.test(f.name))
          .map(f => f.name)
          .sort((a, b) => a.localeCompare(b));
      }
    }
  } catch { }

  // Fallback: read dates-index.json committed to repo (no auth needed)
  try {
    const r = await fetch(`https://raw.githubusercontent.com/${owner}/${repo}/main/dates-index.json`);
    if (r.ok) {
      const data = await r.json();
      if (Array.isArray(data)) return data.sort((a, b) => a.localeCompare(b));
    }
  } catch { }

  // Last resort: return today and yesterday
  const now = new Date();
  const ist = new Date(now.getTime() + 5.5 * 60 * 60 * 1000);
  const dates = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(ist);
    d.setDate(d.getDate() - i);
    dates.push(d.toISOString().split("T")[0]);
  }
  return dates;
}

export default async function handler(req, res) {
  const baseUrl = process.env.SITE_URL || `https://${req.headers.host}`;
  const { GITHUB_TOKEN, GITHUB_OWNER, GITHUB_REPO } = process.env;

  const sitemapId = parseInt(req.query.id || "1");
  if (isNaN(sitemapId) || sitemapId < 1) return res.status(404).send("Sitemap not found");

  const dates = await getDates(GITHUB_OWNER, GITHUB_REPO, GITHUB_TOKEN);

  const dateIndex = Math.floor((sitemapId - 1) / SITEMAPS_PER_DAY);
  const chunkIndex = (sitemapId - 1) % SITEMAPS_PER_DAY;

  if (dateIndex >= dates.length) return res.status(404).send("Sitemap not found");

  const dateStr = dates[dateIndex];
  const allCompanies = generateCompanies();
  const companies = allCompanies.slice(chunkIndex * COMPANIES_PER_SITEMAP, (chunkIndex + 1) * COMPANIES_PER_SITEMAP);

  const urls = [];

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
