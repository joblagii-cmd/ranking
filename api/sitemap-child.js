// api/sitemap[id].xml.js - Child sitemaps (sitemap1.xml to sitemap5.xml)
// Each sitemap covers 1000 companies x 5 posts = 5000 URLs per sitemap

const GITHUB_API = "https://api.github.com";

async function getJobPaths(owner, repo, token, date, sitemapIndex) {
  try {
    const res = await fetch(`${GITHUB_API}/repos/${owner}/${repo}/git/trees/main?recursive=1`, {
      headers: {
        Authorization: `token ${token}`,
        Accept: "application/vnd.github.v3+json",
        "User-Agent": "JobPoster-Bot/1.0"
      }
    });

    if (!res.ok) return [];

    const data = await res.json();

    // Get all job JSON files for today
    const allFiles = (data.tree || []).filter(f =>
      f.path.startsWith(`jobs/${date}/`) &&
      f.path.endsWith(".json") &&
      !f.path.includes("index") &&
      !f.path.includes("summary") &&
      f.type === "blob"
    );

    // Split into 5 groups of 1000 companies (5000 posts each)
    const chunkSize = Math.ceil(allFiles.length / 5);
    const start = (sitemapIndex - 1) * chunkSize;
    const end = start + chunkSize;

    return allFiles.slice(start, end).map(f => f.path);
  } catch (e) {
    console.error("Error fetching paths:", e.message);
    return [];
  }
}

export default async function handler(req, res) {
  const { GITHUB_TOKEN, GITHUB_OWNER, GITHUB_REPO } = process.env;
  const baseUrl = process.env.SITE_URL || `https://${req.headers.host}`;

  if (!GITHUB_TOKEN || !GITHUB_OWNER || !GITHUB_REPO) {
    return res.status(500).send("Missing environment variables");
  }

  // Extract sitemap number from URL
  // /api/sitemap1.xml → 1, /api/sitemap2.xml → 2, etc.
  const urlPath = req.url || "";
  const match = urlPath.match(/sitemap(\d+)\.xml/);
  const sitemapIndex = match ? parseInt(match[1]) : 1;

  if (sitemapIndex < 1 || sitemapIndex > 5) {
    return res.status(404).send("Sitemap not found");
  }

  const now = new Date();
  const istOffset = 5.5 * 60 * 60 * 1000;
  const ist = new Date(now.getTime() + istOffset);
  const dateStr = ist.toISOString().split("T")[0];

  const paths = await getJobPaths(GITHUB_OWNER, GITHUB_REPO, GITHUB_TOKEN, dateStr, sitemapIndex);

  const urlEntries = paths.map(path => {
    const encodedPath = encodeURIComponent(path);
    return `  <url>
    <loc>${baseUrl}/api/job?path=${encodedPath}</loc>
    <lastmod>${dateStr}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>`;
  }).join("\n");

  // Also add static pages
  const staticPages = [
    { loc: `${baseUrl}/`, priority: "1.0", changefreq: "daily" },
    { loc: `${baseUrl}/jobs`, priority: "0.9", changefreq: "daily" },
    { loc: `${baseUrl}/api/status`, priority: "0.3", changefreq: "hourly" }
  ];

  const staticEntries = sitemapIndex === 1 ? staticPages.map(p => `  <url>
    <loc>${p.loc}</loc>
    <lastmod>${dateStr}</lastmod>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`).join("\n") : "";

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
${staticEntries}
${urlEntries}
</urlset>`;

  res.setHeader("Content-Type", "application/xml");
  res.setHeader("Cache-Control", "s-maxage=3600");
  return res.status(200).send(xml);
}
