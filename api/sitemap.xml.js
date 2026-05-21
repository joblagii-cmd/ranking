// api/sitemap.xml.js - Master sitemap index
// Lists all child sitemaps: sitemap1.xml, sitemap2.xml, ... sitemap5.xml

export default async function handler(req, res) {
  const baseUrl = process.env.SITE_URL || `https://${req.headers.host}`;

  const now = new Date();
  const istOffset = 5.5 * 60 * 60 * 1000;
  const ist = new Date(now.getTime() + istOffset);
  const dateStr = ist.toISOString().split("T")[0];

  // 5000 companies / 1000 per sitemap = 5 sitemaps
  const TOTAL_SITEMAPS = 5;

  const sitemapEntries = Array.from({ length: TOTAL_SITEMAPS }, (_, i) => {
    const index = i + 1;
    return `  <sitemap>
    <loc>${baseUrl}/api/sitemap${index}.xml</loc>
    <lastmod>${dateStr}</lastmod>
  </sitemap>`;
  }).join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapEntries}
</sitemapindex>`;

  res.setHeader("Content-Type", "application/xml");
  res.setHeader("Cache-Control", "s-maxage=3600");
  return res.status(200).send(xml);
}
