export const config = { maxDuration: 10 };

const URLS_PER_SITEMAP = 5000;

export default async function handler(req, res) {
  const baseUrl = process.env.SITE_URL || `https://${req.headers.host}`;
  const { GITHUB_OWNER, GITHUB_REPO } = process.env;

  const sitemapId = parseInt(req.query.id || "1");
  if (isNaN(sitemapId) || sitemapId < 1) return res.status(404).send("Sitemap not found");

  // Read registry — single raw file fetch, no auth needed, super fast
  let allUrls = [];
  let updatedAt = new Date().toISOString().split("T")[0];
  try {
    const r = await fetch(`https://raw.githubusercontent.com/${GITHUB_OWNER}/${GITHUB_REPO}/main/sitemap-registry.json`);
    if (r.ok) {
      const data = await r.json();
      allUrls = data.urls || [];
      updatedAt = data.updatedAt?.split("T")[0] || updatedAt;
    }
  } catch { }

  // Static pages always go in sitemap1
  const staticUrls = sitemapId === 1 ? [
    { loc: `${baseUrl}/`, priority: "1.0" },
    { loc: `${baseUrl}/jobs`, priority: "0.9" }
  ] : [];

  // Paginate job URLs
  const startIdx = (sitemapId - 1) * URLS_PER_SITEMAP - (sitemapId === 1 ? 0 : 2);
  const endIdx = startIdx + URLS_PER_SITEMAP - staticUrls.length;
  const pageUrls = allUrls.slice(startIdx < 0 ? 0 : startIdx, endIdx);

  if (staticUrls.length === 0 && pageUrls.length === 0) {
    return res.status(404).send("Sitemap not found");
  }

  const staticEntries = staticUrls.map(u => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${updatedAt}</lastmod>
    <changefreq>daily</changefreq>
    <priority>${u.priority}</priority>
  </url>`);

  const jobEntries = pageUrls.map(filePath => `  <url>
    <loc>${baseUrl}/api/job?path=${encodeURIComponent(filePath)}</loc>
    <lastmod>${updatedAt}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>`);

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${[...staticEntries, ...jobEntries].join("\n")}
</urlset>`;

  res.setHeader("Content-Type", "application/xml");
  res.setHeader("Cache-Control", "s-maxage=3600");
  return res.status(200).send(xml);
}
