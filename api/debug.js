// api/debug.js - Debug endpoint to test GitHub API connectivity

export default async function handler(req, res) {
  const { GITHUB_TOKEN, GITHUB_OWNER, GITHUB_REPO } = process.env;

  const results = {};

  // Step 1: Check env vars
  results.env = {
    hasToken: !!GITHUB_TOKEN,
    owner: GITHUB_OWNER || "MISSING",
    repo: GITHUB_REPO || "MISSING"
  };

  // Step 2: Check jobs folder exists
  try {
    const r = await fetch(`https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/jobs`, {
      headers: { Authorization: `token ${GITHUB_TOKEN}`, Accept: "application/vnd.github.v3+json", "User-Agent": "JobPoster-Bot/1.0" }
    });
    const data = await r.json();
    results.jobsFolder = {
      status: r.status,
      ok: r.ok,
      dates: Array.isArray(data) ? data.map(f => f.name) : data
    };
  } catch (e) {
    results.jobsFolder = { error: e.message };
  }

  // Step 3: Check today's date folder
  const now = new Date();
  const ist = new Date(now.getTime() + 5.5 * 60 * 60 * 1000);
  const todayStr = ist.toISOString().split("T")[0];
  results.today = todayStr;

  try {
    const r = await fetch(`https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/jobs/${todayStr}`, {
      headers: { Authorization: `token ${GITHUB_TOKEN}`, Accept: "application/vnd.github.v3+json", "User-Agent": "JobPoster-Bot/1.0" }
    });
    const data = await r.json();
    results.todayFolder = {
      status: r.status,
      ok: r.ok,
      count: Array.isArray(data) ? data.length : 0,
      sample: Array.isArray(data) ? data.slice(0, 3).map(f => f.name) : data
    };
  } catch (e) {
    results.todayFolder = { error: e.message };
  }

  // Step 4: Try fetching one company's files
  if (results.todayFolder?.count > 0) {
    try {
      const r = await fetch(`https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/jobs/${todayStr}`, {
        headers: { Authorization: `token ${GITHUB_TOKEN}`, Accept: "application/vnd.github.v3+json", "User-Agent": "JobPoster-Bot/1.0" }
      });
      const folders = await r.json();
      const firstFolder = Array.isArray(folders) ? folders.find(f => f.type === "dir") : null;

      if (firstFolder) {
        const r2 = await fetch(`https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${firstFolder.path}`, {
          headers: { Authorization: `token ${GITHUB_TOKEN}`, Accept: "application/vnd.github.v3+json", "User-Agent": "JobPoster-Bot/1.0" }
        });
        const files = await r2.json();
        results.firstCompany = {
          name: firstFolder.name,
          status: r2.status,
          files: Array.isArray(files) ? files.map(f => f.name) : files
        };

        // Step 5: Try downloading one job file
        if (Array.isArray(files) && files.length > 0) {
          const firstFile = files[0];
          const r3 = await fetch(firstFile.download_url);
          const job = await r3.json();
          results.sampleJob = {
            status: r3.status,
            title: job.title,
            company: job.company,
            industry: job.industry
          };
        }
      }
    } catch (e) {
      results.firstCompany = { error: e.message };
    }
  }

  res.setHeader("Content-Type", "application/json");
  return res.status(200).json(results);
}
