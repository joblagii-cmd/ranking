export const config = { maxDuration: 10 };

async function getDates(owner, repo, token) {
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
          .sort((a, b) => b.localeCompare(a));
      }
    }
  } catch { }

  try {
    const r = await fetch(`https://raw.githubusercontent.com/${owner}/${repo}/main/dates-index.json`);
    if (r.ok) {
      const data = await r.json();
      if (Array.isArray(data)) return data.sort((a, b) => b.localeCompare(a));
    }
  } catch { }

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

  const dates = await getDates(GITHUB_OWNER, GITHUB_REPO, GITHUB_TOKEN);

  const SITEMAPS_PER_DAY = 5;
  const entries = [];
  let sitemapNum = 1;

  for (const date of dates) {
    for (let i = 0; i < SITEMAPS_PER_DAY; i++) {
      entries.push(`  <sitemap>
    <loc>${baseUrl}/sitemap${sitemapNum}.xml</loc>
    <lastmod>${date}</lastmod>
  </sitemap>`);
      sitemapNum++;
    }
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.join("\n")}
</sitemapindex>`;

  res.setHeader("Content-Type", "application/xml");
  res.setHeader("Cache-Control", "no-store");
  return res.status(200).send(xml);
}
