export const config = { maxDuration: 10 };

export default async function handler(req, res) {
  const baseUrl = process.env.SITE_URL || `https://${req.headers.host}`;
  const { GITHUB_OWNER, GITHUB_REPO } = process.env;

  const URLS_PER_SITEMAP = 5000;

  // Read registry — single raw file fetch, no auth needed
  let totalUrls = 0;
  let updatedAt = new Date().toISOString().split("T")[0];
  try {
    const r = await fetch(`https://raw.githubusercontent.com/${GITHUB_OWNER}/${GITHUB_REPO}/main/sitemap-registry.json`);
    if (r.ok) {
      const data = await r.json();
      totalUrls = data.total || data.urls?.length || 0;
      updatedAt = data.updatedAt?.split("T")[0] || updatedAt;
    }
  } catch { }

  const totalSitemaps = Math.max(1, Math.ceil((totalUrls + 2) / URLS_PER_SITEMAP)); // +2 for static pages

  const entries = Array.from({ length: totalSitemaps }, (_, i) => `  <sitemap>
    <loc>${baseUrl}/sitemap${i + 1}.xml</loc>
    <lastmod>${updatedAt}</lastmod>
  </sitemap>`).join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries}
</sitemapindex>`;

  res.setHeader("Content-Type", "application/xml");
  res.setHeader("Cache-Control", "s-maxage=3600");
  return res.status(200).send(xml);
}
