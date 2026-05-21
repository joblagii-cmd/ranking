// api/trigger.js - Manually trigger a batch (runs logic directly)

import { generateCompanies } from "../lib/companies.js";
import { generateJobPosting } from "../lib/templateEngine.js";
import { commitBatch } from "../lib/github.js";

export const config = {
  maxDuration: 60
};

const POSTS_PER_COMPANY = 5;
const TOTAL_POSTS = 25000;
const CRON_RUNS_PER_DAY = 24;
const BATCH_SIZE = Math.ceil(TOTAL_POSTS / CRON_RUNS_PER_DAY);
const COMPANIES_PER_BATCH = Math.ceil(BATCH_SIZE / POSTS_PER_COMPANY);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed. Use POST." });
  }

  const { secret, batchIndex } = req.body || {};

  if (secret !== process.env.CRON_SECRET) {
    return res.status(401).json({ error: "Invalid secret" });
  }

  const { GITHUB_TOKEN, GITHUB_OWNER, GITHUB_REPO } = process.env;

  if (!GITHUB_TOKEN || !GITHUB_OWNER || !GITHUB_REPO) {
    return res.status(500).json({ error: "Missing environment variables: GITHUB_TOKEN, GITHUB_OWNER, GITHUB_REPO" });
  }

  try {
    const now = new Date();
    const istOffset = 5.5 * 60 * 60 * 1000;
    const ist = new Date(now.getTime() + istOffset);
    const dateStr = ist.toISOString().split("T")[0];
    const currentBatch = batchIndex ?? ist.getUTCHours();

    const allCompanies = generateCompanies();
    const startIdx = currentBatch * COMPANIES_PER_BATCH;
    const endIdx = Math.min(startIdx + COMPANIES_PER_BATCH, allCompanies.length);
    const batchCompanies = allCompanies.slice(startIdx, endIdx);

    if (batchCompanies.length === 0) {
      return res.status(200).json({ message: `No companies for batch ${currentBatch}` });
    }

    const files = [];
    for (const company of batchCompanies) {
      for (let postIdx = 0; postIdx < POSTS_PER_COMPANY; postIdx++) {
        const posting = generateJobPosting(company, postIdx, dateStr);
        const companySlug = company.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").substring(0, 50);
        files.push({
          path: `jobs/${dateStr}/${companySlug}/${posting.slug}.json`,
          content: { ...posting, generatedAt: new Date().toISOString(), batchIndex: currentBatch }
        });
      }
    }

    const result = await commitBatch(GITHUB_OWNER, GITHUB_REPO, files, dateStr, currentBatch, GITHUB_TOKEN);

    return res.status(200).json({
      success: true,
      date: dateStr,
      batchIndex: currentBatch,
      postsGenerated: files.length,
      companiesProcessed: batchCompanies.length,
      githubCommit: result.commitSha,
      message: `Batch ${currentBatch}/24 complete. ${files.length} posts committed to GitHub.`
    });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
