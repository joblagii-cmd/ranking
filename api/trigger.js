// api/trigger.js - Manually trigger a small batch (50 posts, fits in 10s free plan)

import { generateCompanies } from "../lib/companies.js";
import { generateJobPosting } from "../lib/templateEngine.js";
import { commitBatch } from "../lib/github.js";

export const config = {
  maxDuration: 10
};

const POSTS_PER_COMPANY = 5;
const COMPANIES_PER_TRIGGER = 10; // 10 companies x 5 posts = 50 posts per run

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed. Use POST." });
  }

  const { secret, page } = req.body || {};

  if (secret !== process.env.CRON_SECRET) {
    return res.status(401).json({ error: "Invalid secret" });
  }

  const { GITHUB_TOKEN, GITHUB_OWNER, GITHUB_REPO } = process.env;

  if (!GITHUB_TOKEN || !GITHUB_OWNER || !GITHUB_REPO) {
    return res.status(500).json({ error: "Missing environment variables" });
  }

  try {
    const now = new Date();
    const istOffset = 5.5 * 60 * 60 * 1000;
    const ist = new Date(now.getTime() + istOffset);
    const dateStr = ist.toISOString().split("T")[0];

    // page = which group of 10 companies to process (0-499 for 5000 companies)
    const currentPage = page ?? Math.floor(Math.random() * 500);
    const allCompanies = generateCompanies();
    const startIdx = currentPage * COMPANIES_PER_TRIGGER;
    const batchCompanies = allCompanies.slice(startIdx, startIdx + COMPANIES_PER_TRIGGER);

    if (batchCompanies.length === 0) {
      return res.status(200).json({ message: "No companies for this page" });
    }

    const files = [];
    for (const company of batchCompanies) {
      for (let postIdx = 0; postIdx < POSTS_PER_COMPANY; postIdx++) {
        const posting = generateJobPosting(company, postIdx, dateStr);
        const companySlug = company.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").substring(0, 50);
        files.push({
          path: `jobs/${dateStr}/${companySlug}/${posting.slug}.json`,
          content: { ...posting, generatedAt: new Date().toISOString() }
        });
      }
    }

    const result = await commitBatch(GITHUB_OWNER, GITHUB_REPO, files, dateStr, currentPage, GITHUB_TOKEN);

    return res.status(200).json({
      success: true,
      date: dateStr,
      page: currentPage,
      postsGenerated: files.length,
      companiesProcessed: batchCompanies.length,
      githubCommit: result.commitSha,
      message: `Page ${currentPage}: ${files.length} posts committed to GitHub.`
    });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
