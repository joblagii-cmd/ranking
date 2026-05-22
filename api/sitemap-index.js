export const config = { maxDuration: 10 };

export default async function handler(req, res) {
  const baseUrl = process.env.SITE_URL || `https://${req.headers.host}`;
  const { GITHUB_TOKEN, GITHUB_OWNER, GITHUB_REPO } = process.env;

  const now = new Date();
  const ist = new Date(now.getTime() + 5.5 * 60 * 60 * 1000);
  const dateStr = ist.toISOString().split("T")[0];

  let dates = [dateStr];
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

  // 1 sitemap per day
  const entries = dates.map((date, i) => `  <sitemap>
    <loc>${baseUrl}/sitemap${i + 1}.xml</loc>
    <lastmod>${date}</lastmod>
  </sitemap>`).join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries}
</sitemapindex>`;

  res.setHeader("Content-Type", "application/xml");
  res.setHeader("Cache-Control", "s-maxage=3600");
  return res.status(200).send(xml);
}
