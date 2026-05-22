import { generateCompanies } from "../lib/companies.js";
import { generateJobPosting } from "../lib/templateEngine.js";
import { commitBatch } from "../lib/github.js";

export const config = {
  maxDuration: 10
};

const POSTS_PER_COMPANY = 5;
const TOTAL_COMPANIES = 5000;
const TOTAL_MINUTES = 1440; // 24h × 60min

function getCompaniesForPage(page, allCompanies) {
  // Distribute 5000 companies across 1440 pages as evenly as possible
  // 5000 / 1440 = 3 base, 680 pages get 4 companies, 760 pages get 3
  const base = Math.floor(TOTAL_COMPANIES / TOTAL_MINUTES); // 3
  const remainder = TOTAL_COMPANIES % TOTAL_MINUTES;         // 680

  const companiesThisPage = page < remainder ? base + 1 : base;
  const startIdx = page < remainder
    ? page * (base + 1)
    : remainder * (base + 1) + (page - remainder) * base;

  return allCompanies.slice(startIdx, startIdx + companiesThisPage);
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed. Use POST." });
  }

  const { GITHUB_TOKEN, GITHUB_OWNER, GITHUB_REPO } = process.env;

  if (!GITHUB_TOKEN || !GITHUB_OWNER || !GITHUB_REPO) {
    return res.status(500).json({ error: "Missing environment variables" });
  }

  const { page } = req.body || {};

  const now = new Date();
  const istOffset = 5.5 * 60 * 60 * 1000;
  const ist = new Date(now.getTime() + istOffset);
  const dateStr = ist.toISOString().split("T")[0];

  const currentPage = typeof page === "number"
    ? Math.max(0, Math.min(page, TOTAL_MINUTES - 1))
    : ist.getUTCHours() * 60 + ist.getUTCMinutes();

  try {
    const allCompanies = generateCompanies();
    const batchCompanies = getCompaniesForPage(currentPage, allCompanies);

    if (batchCompanies.length === 0) {
      return res.status(200).json({ message: "No companies for this page", page: currentPage });
    }

    const files = [];
    for (const company of batchCompanies) {
      for (let postIdx = 0; postIdx < POSTS_PER_COMPANY; postIdx++) {
        const posting = generateJobPosting(company, postIdx, dateStr);
        const companySlug = company.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").substring(0, 50);
        files.push({
          path: `jobs/${dateStr}/${companySlug}/${posting.slug}.json`,
          content: { ...posting, generatedAt: new Date().toISOString(), page: currentPage }
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
      message: `Page ${currentPage}/1439: ${files.length} posts committed to GitHub.`
    });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
