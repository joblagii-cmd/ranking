// api/status.js - Dashboard to monitor job posting progress

export default async function handler(req, res) {
  const { GITHUB_TOKEN, GITHUB_OWNER, GITHUB_REPO } = process.env;

  if (!GITHUB_TOKEN || !GITHUB_OWNER || !GITHUB_REPO) {
    return res.status(500).json({ error: "Missing env vars" });
  }

  const now = new Date();
  const istOffset = 5.5 * 60 * 60 * 1000;
  const ist = new Date(now.getTime() + istOffset);
  const dateStr = ist.toISOString().split("T")[0];

  try {
    // Fetch daily summary from GitHub
    const summaryRes = await fetch(
      `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/jobs/${dateStr}/daily-summary.json`,
      {
        headers: {
          Authorization: `token ${GITHUB_TOKEN}`,
          Accept: "application/vnd.github.v3+json",
          "User-Agent": "JobPoster-Bot/1.0"
        }
      }
    );

    let summary = { date: dateStr, totalPosts: 0, batches: [], progress: "0/24 batches complete" };
    if (summaryRes.ok) {
      const data = await summaryRes.json();
      summary = JSON.parse(Buffer.from(data.content, "base64").toString());
    }

    return res.status(200).json({
      status: "running",
      today: dateStr,
      currentHour: ist.getUTCHours(),
      totalPostsToday: summary.totalPosts,
      targetPostsPerDay: 25000,
      progressPercent: Math.round((summary.totalPosts / 25000) * 100),
      batchesComplete: summary.batches?.length || 0,
      totalBatches: 24,
      progress: summary.progress,
      lastUpdated: summary.lastUpdated,
      repoUrl: `https://github.com/${GITHUB_OWNER}/${GITHUB_REPO}/tree/main/jobs/${dateStr}`,
      companies: 5000,
      postsPerCompany: 5,
      schedule: "Every hour (24 batches/day)",
      batchSize: "~1042 posts per batch (~209 companies)"
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
