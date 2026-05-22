export const config = { maxDuration: 10 };

export default async function handler(req, res) {
  const baseUrl = process.env.SITE_URL || `https://${req.headers.host}`;
  const { GITHUB_TOKEN, GITHUB_OWNER, GITHUB_REPO } = process.env;

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
          .sort((a, b) => b.localeCompare(a)); // newest first
      }
    }
  } catch { }

  if (dates.length === 0) return res.status(404).send("No job data found");

  // 5 sitemaps per day × 5000 URLs each = 25000 per day
  const SITEMAPS_PER_DAY = 5;
  const COMPANIES_PER_SITEMAP = 1000;
  const POSTS_PER_COMPANY = 5;

  // Which date and which chunk (0-4) does this sitemapId map to?
  const dateIndex = Math.floor((sitemapId - 1) / SITEMAPS_PER_DAY);
  const chunkIndex = (sitemapId - 1) % SITEMAPS_PER_DAY;

  if (dateIndex >= dates.length) return res.status(404).send("Sitemap not found");

  const dateStr = dates[dateIndex];

  // Get company folders for this date
  let companyFolders = [];
  try {
    const r = await fetch(`https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/jobs/${dateStr}`, {
      headers: { Authorization: `token ${GITHUB_TOKEN}`, Accept: "application/vnd.github.v3+json", "User-Agent": "JobPoster-Bot/1.0" }
    });
    if (r.ok) {
      const data = await r.json();
      if (Array.isArray(data)) companyFolders = data.filter(f => f.type === "dir");
    }
  } catch { }

  // Get the 1000 companies for this chunk
  const chunkFolders = companyFolders.slice(
    chunkIndex * COMPANIES_PER_SITEMAP,
    (chunkIndex + 1) * COMPANIES_PER_SITEMAP
  );

  // Fetch actual file paths for this chunk in parallel batches
  const allFiles = [];
  const BATCH = 20;
  for (let i = 0; i < chunkFolders.length; i += BATCH) {
    const batch = chunkFolders.slice(i, i + BATCH);
    await Promise.all(batch.map(async folder => {
      try {
        const r = await fetch(`https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${folder.path}`, {
          headers: { Authorization: `token ${GITHUB_TOKEN}`, Accept: "application/vnd.github.v3+json", "User-Agent": "JobPoster-Bot/1.0" }
        });
        if (!r.ok) return;
        const files = await r.json();
        if (!Array.isArray(files)) return;
        files.forEach(f => {
          if (f.name.endsWith(".json") && f.type === "file") allFiles.push(f.path);
        });
      } catch { }
    }));
  }

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

  for (const filePath of allFiles) {
    urls.push(`  <url>
    <loc>${baseUrl}/api/job?path=${encodeURIComponent(filePath)}</loc>
    <lastmod>${dateStr}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>`);
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("\n")}
</urlset>`;

  res.setHeader("Content-Type", "application/xml");
  res.setHeader("Cache-Control", "s-maxage=3600");
  return res.status(200).send(xml);
}
