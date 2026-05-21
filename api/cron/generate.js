// api/cron/generate.js
// Vercel Cron Job - runs every hour
// Each run processes ~1 batch (1042 posts) → 24 runs × 1042 = ~25,000 posts/day

import { generateCompanies } from "../../lib/companies.js";
import { generateJobPosting } from "../../lib/templateEngine.js";
import { commitBatch } from "../../lib/github.js";

// Vercel config - this enables the cron schedule
export const config = {
  maxDuration: 60 // 60 second max (Vercel Pro allows this)
};

const POSTS_PER_COMPANY = 5;       // 5 posts × 5000 companies = 25,000
const TOTAL_POSTS = 25000;
const CRON_RUNS_PER_DAY = 24;      // every hour
const BATCH_SIZE = Math.ceil(TOTAL_POSTS / CRON_RUNS_PER_DAY); // ~1042 per run
const COMPANIES_PER_BATCH = Math.ceil(BATCH_SIZE / POSTS_PER_COMPANY); // ~209 companies per batch

export default async function handler(req, res) {
  // Security: Only allow Vercel cron or authorized requests
  const authHeader = req.headers["authorization"];
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    // Also allow Vercel's internal cron header
    if (!req.headers["x-vercel-cron"]) {
      return res.status(401).json({ error: "Unauthorized" });
    }
  }

  const {
    GITHUB_TOKEN,
    GITHUB_OWNER,
    GITHUB_REPO
  } = process.env;

  if (!GITHUB_TOKEN || !GITHUB_OWNER || !GITHUB_REPO) {
    return res.status(500).json({ error: "Missing environment variables: GITHUB_TOKEN, GITHUB_OWNER, GITHUB_REPO" });
  }

  try {
    // Determine which batch to process based on current hour
    const now = new Date();
    const istOffset = 5.5 * 60 * 60 * 1000;
    const ist = new Date(now.getTime() + istOffset);

    const dateStr = ist.toISOString().split("T")[0]; // YYYY-MM-DD
    const batchIndex = ist.getUTCHours(); // 0-23, one batch per hour

    console.log(`[JobPoster] Starting batch ${batchIndex} for ${dateStr}`);

    // Generate all 5000 companies (deterministic, same every day)
    const allCompanies = generateCompanies();

    // Calculate which companies this batch covers
    const startCompanyIdx = batchIndex * COMPANIES_PER_BATCH;
    const endCompanyIdx = Math.min(startCompanyIdx + COMPANIES_PER_BATCH, allCompanies.length);
    const batchCompanies = allCompanies.slice(startCompanyIdx, endCompanyIdx);

    if (batchCompanies.length === 0) {
      return res.status(200).json({
        message: `No companies for batch ${batchIndex}`,
        dateStr,
        batchIndex
      });
    }

    // Generate job postings for this batch
    const files = [];
    let postsGenerated = 0;

    for (const company of batchCompanies) {
      for (let postIdx = 0; postIdx < POSTS_PER_COMPANY; postIdx++) {
        const posting = generateJobPosting(company, postIdx, dateStr);

        // File path in GitHub: jobs/2025-01-15/company-slug/posting-slug.json
        const companySlug = company.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").substring(0, 50);
        const filePath = `jobs/${dateStr}/${companySlug}/${posting.slug}.json`;

        files.push({
          path: filePath,
          content: {
            ...posting,
            generatedAt: new Date().toISOString(),
            batchIndex,
            postIndex: postIdx
          }
        });
        postsGenerated++;
      }
    }

    // Also update the daily index file for this batch
    const indexEntry = {
      date: dateStr,
      batchIndex,
      postsInBatch: postsGenerated,
      companiesInBatch: batchCompanies.length,
      companies: batchCompanies.map(c => ({ id: c.id, name: c.name, industry: c.industry }))
    };

    files.push({
      path: `jobs/${dateStr}/batch-${String(batchIndex).padStart(2, "0")}-index.json`,
      content: indexEntry
    });

    // Commit to GitHub using Tree API (single commit for all files)
    const result = await commitBatch(
      GITHUB_OWNER,
      GITHUB_REPO,
      files,
      dateStr,
      batchIndex,
      GITHUB_TOKEN
    );

    // Update the master daily summary
    await updateDailySummary(GITHUB_OWNER, GITHUB_REPO, GITHUB_TOKEN, dateStr, batchIndex, postsGenerated);

    console.log(`[JobPoster] Batch ${batchIndex} complete: ${postsGenerated} posts committed`);

    return res.status(200).json({
      success: true,
      date: dateStr,
      batchIndex,
      postsGenerated,
      companiesProcessed: batchCompanies.length,
      githubCommit: result.commitSha,
      message: `Batch ${batchIndex}/24 complete. ${postsGenerated} job postings committed to GitHub.`
    });

  } catch (error) {
    console.error("[JobPoster] Error:", error);
    return res.status(500).json({
      error: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined
    });
  }
}

async function updateDailySummary(owner, repo, token, dateStr, batchIndex, postsInBatch) {
  try {
    const { commitFile } = await import("../../lib/github.js");
    const summaryPath = `jobs/${dateStr}/daily-summary.json`;

    // Fetch existing summary
    let existing = { date: dateStr, totalPosts: 0, batches: [], lastUpdated: "" };
    try {
      const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${summaryPath}`, {
        headers: {
          Authorization: `token ${token}`,
          Accept: "application/vnd.github.v3+json",
          "User-Agent": "JobPoster-Bot/1.0"
        }
      });
      if (res.ok) {
        const data = await res.json();
        existing = JSON.parse(Buffer.from(data.content, "base64").toString());
      }
    } catch {}

    existing.batches = existing.batches || [];
    if (!existing.batches.find(b => b.index === batchIndex)) {
      existing.batches.push({ index: batchIndex, posts: postsInBatch });
    }
    existing.totalPosts = existing.batches.reduce((sum, b) => sum + b.posts, 0);
    existing.lastUpdated = new Date().toISOString();
    existing.progress = `${existing.batches.length}/24 batches complete`;

    await commitFile(owner, repo, summaryPath, existing, `[Auto] Update daily summary for ${dateStr}`, token);
  } catch (e) {
    console.warn("Summary update failed (non-critical):", e.message);
  }
}
