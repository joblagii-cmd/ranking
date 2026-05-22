// api/jobs-all.js - All jobs across all dates with pagination

const GITHUB_RAW = "https://raw.githubusercontent.com";
const GITHUB_API = "https://api.github.com";

async function getFolderContents(owner, repo, token, path) {
  const res = await fetch(`${GITHUB_API}/repos/${owner}/${repo}/contents/${path}`, {
    headers: {
      Authorization: `token ${token}`,
      Accept: "application/vnd.github.v3+json",
      "User-Agent": "JobPoster-Bot/1.0"
    }
  });
  if (!res.ok) return null;
  const data = await res.json();
  return Array.isArray(data) ? data : null;
}

async function getAllJobs(owner, repo, token, page = 1, limit = 24, search = "", industry = "", dateFilter = "") {
  try {
    // Get all date folders under jobs/
    const jobsRoot = await getFolderContents(owner, repo, token, "jobs");
    if (!jobsRoot) return { jobs: [], total: 0, dates: [] };

    // Sort dates newest first
    const dateFolders = jobsRoot
      .filter(f => f.type === "dir" && /^\d{4}-\d{2}-\d{2}$/.test(f.name))
      .sort((a, b) => b.name.localeCompare(a.name));

    const dates = dateFolders.map(f => f.name);

    // Filter by date if requested
    const foldersToSearch = dateFilter
      ? dateFolders.filter(f => f.name === dateFilter)
      : dateFolders;

    // Collect all file paths across all dates
    const allFiles = [];
    for (const dateFolder of foldersToSearch) {
      const companyFolders = await getFolderContents(owner, repo, token, `jobs/${dateFolder.name}`);
      if (!companyFolders) continue;

      await Promise.all(
        companyFolders.filter(f => f.type === "dir").map(async folder => {
          try {
            const files = await getFolderContents(owner, repo, token, folder.path);
            if (!files) return;
            files.forEach(f => {
              if (f.name.endsWith(".json") && f.type === "file") {
                allFiles.push({ path: f.path, download_url: f.download_url, date: dateFolder.name });
              }
            });
          } catch { }
        })
      );
    }

    const total = allFiles.length;
    const startIdx = (page - 1) * limit;
    const pageFiles = allFiles.slice(startIdx, startIdx + limit);

    const jobs = await Promise.all(pageFiles.map(async f => {
      try {
        const r = await fetch(f.download_url || `${GITHUB_RAW}/${owner}/${repo}/main/${f.path}`);
        if (!r.ok) return null;
        const job = await r.json();
        if (search && !job.title?.toLowerCase().includes(search.toLowerCase()) &&
          !job.company?.toLowerCase().includes(search.toLowerCase()) &&
          !job.role?.toLowerCase().includes(search.toLowerCase())) return null;
        if (industry && job.industry !== industry) return null;
        return {
          slug: job.slug, title: job.title, company: job.company,
          role: job.role, industry: job.industry, location: job.location,
          salary: job.salary, workMode: job.workMode, experience: job.experience,
          datePosted: job.datePosted, skills: job.skills?.slice(0, 4) || [],
          path: f.path, date: f.date
        };
      } catch { return null; }
    }));

    return { jobs: jobs.filter(Boolean), total, dates };
  } catch (e) {
    return { jobs: [], total: 0, dates: [], error: e.message };
  }
}

function renderHTML(jobs, total, dates, page, search, industry, dateFilter) {
  const limit = 24;
  const totalPages = Math.ceil(total / limit);
  const industries = ["technology", "finance", "healthcare", "ecommerce", "manufacturing", "education", "retail", "realestate", "logistics", "hospitality"];
  const industryColors = {
    technology: "#3B82F6", finance: "#10B981", healthcare: "#EF4444",
    ecommerce: "#F59E0B", manufacturing: "#6366F1", education: "#EC4899",
    retail: "#14B8A6", realestate: "#F97316", logistics: "#8B5CF6", hospitality: "#06B6D4"
  };

  const jobCards = jobs.map(job => {
    const color = industryColors[job.industry] || "#6B7280";
    const cityState = job.location ? `${job.location.city}, ${job.location.state}` : "India";
    return `
    <a href="/api/job?path=${encodeURIComponent(job.path)}" class="job-card">
      <div class="job-card-header">
        <div class="company-logo" style="background:${color}20;color:${color}">${job.company?.charAt(0) || "J"}</div>
        <div class="job-meta">
          <span class="industry-badge" style="background:${color}20;color:${color}">${job.industry}</span>
          <span class="work-mode">${job.workMode || "On-site"}</span>
        </div>
      </div>
      <h3 class="job-title">${job.title}</h3>
      <p class="company-name">${job.company}</p>
      <div class="job-details">
        <span>📍 ${cityState}</span>
        <span>💰 ${job.salary}</span>
        <span>⏱ ${job.experience}</span>
      </div>
      <div class="job-footer">
        <div class="skills-row">${(job.skills || []).map(s => `<span class="skill-tag">${s}</span>`).join("")}</div>
        <span class="date-badge">📅 ${job.datePosted || job.date}</span>
      </div>
    </a>`;
  }).join("");

  const industryOptions = industries.map(i =>
    `<option value="${i}" ${industry === i ? "selected" : ""}>${i.charAt(0).toUpperCase() + i.slice(1)}</option>`
  ).join("");

  const dateOptions = dates.map(d =>
    `<option value="${d}" ${dateFilter === d ? "selected" : ""}>${d}</option>`
  ).join("");

  const buildUrl = (p) => `/jobs?page=${p}&search=${encodeURIComponent(search)}&industry=${industry}&date=${dateFilter}`;

  const pagination = totalPages > 1 ? `
    <div class="pagination">
      ${page > 1 ? `<a href="${buildUrl(1)}" class="page-btn">« First</a><a href="${buildUrl(page - 1)}" class="page-btn">← Prev</a>` : ""}
      <span class="page-info">Page ${page} of ${totalPages} &nbsp;·&nbsp; ${total.toLocaleString()} jobs</span>
      ${page < totalPages ? `<a href="${buildUrl(page + 1)}" class="page-btn">Next →</a><a href="${buildUrl(totalPages)}" class="page-btn">Last »</a>` : ""}
    </div>` : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>All Jobs in India | JobLagii</title>
<meta name="description" content="Browse all job postings in India across all dates. Filter by industry, date, or search by role and company.">
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #F8FAFC; color: #1E293B; }
.header { background: #1E293B; color: white; padding: 1rem 2rem; display: flex; align-items: center; justify-content: space-between; flex-wrap:wrap; gap:1rem; }
.logo { font-size: 1.5rem; font-weight: 700; color: #38BDF8; text-decoration: none; }
.nav { display:flex; gap:0.5rem; }
.nav a { color:#94A3B8; text-decoration:none; font-size:0.88rem; padding:0.4rem 0.9rem; border-radius:8px; transition:all 0.2s; }
.nav a:hover, .nav a.nav-active { background:#38BDF8; color:#0F172A; font-weight:600; }
.page-hero { background: linear-gradient(135deg, #1E293B 0%, #0F172A 100%); color: white; padding: 2rem; text-align: center; }
.page-hero h1 { font-size: 2rem; font-weight: 800; margin-bottom: 0.4rem; }
.page-hero h1 span { color: #38BDF8; }
.page-hero p { color: #94A3B8; font-size: 1rem; }
.filters { background: white; border-bottom: 1px solid #E2E8F0; padding: 1rem 2rem; }
.filter-row { max-width: 1200px; margin: 0 auto; display: flex; gap: 0.75rem; flex-wrap: wrap; align-items: center; }
.filter-row input { flex: 1; min-width: 200px; padding: 0.7rem 1rem; border: 1px solid #E2E8F0; border-radius: 8px; font-size: 0.95rem; outline: none; }
.filter-row input:focus { border-color: #38BDF8; }
.filter-row select { padding: 0.7rem 1rem; border: 1px solid #E2E8F0; border-radius: 8px; font-size: 0.9rem; outline: none; background: white; }
.filter-row select:focus { border-color: #38BDF8; }
.filter-row button { padding: 0.7rem 1.5rem; background: #38BDF8; color: #0F172A; border: none; border-radius: 8px; font-weight: 700; cursor: pointer; }
.filter-row button:hover { background: #0EA5E9; }
.main { max-width: 1200px; margin: 0 auto; padding: 2rem; }
.results-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 0.5rem; }
.results-count { font-size: 1rem; font-weight: 600; color: #1E293B; }
.results-count span { color: #64748B; font-weight: 400; }
.jobs-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 1.25rem; }
.job-card { background: white; border-radius: 14px; padding: 1.5rem; border: 1px solid #E2E8F0; text-decoration: none; color: inherit; display: block; transition: all 0.2s; }
.job-card:hover { border-color: #38BDF8; box-shadow: 0 4px 20px rgba(56,189,248,0.15); transform: translateY(-2px); }
.job-card-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem; }
.company-logo { width: 44px; height: 44px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 1.1rem; }
.job-meta { display: flex; gap: 0.5rem; align-items: center; }
.industry-badge { font-size: 0.75rem; padding: 3px 10px; border-radius: 20px; font-weight: 600; text-transform: capitalize; }
.work-mode { font-size: 0.75rem; color: #64748B; background: #F1F5F9; padding: 3px 10px; border-radius: 20px; }
.job-title { font-size: 1rem; font-weight: 600; color: #1E293B; margin-bottom: 0.3rem; line-height: 1.4; }
.company-name { font-size: 0.9rem; color: #64748B; margin-bottom: 0.75rem; }
.job-details { display: flex; gap: 1rem; flex-wrap: wrap; margin-bottom: 0.75rem; }
.job-details span { font-size: 0.82rem; color: #64748B; }
.job-footer { display: flex; justify-content: space-between; align-items: flex-end; gap: 0.5rem; flex-wrap: wrap; }
.skills-row { display: flex; gap: 0.4rem; flex-wrap: wrap; }
.skill-tag { font-size: 0.75rem; background: #F1F5F9; color: #475569; padding: 3px 10px; border-radius: 6px; }
.date-badge { font-size: 0.75rem; color: #94A3B8; white-space: nowrap; }
.pagination { display: flex; align-items: center; justify-content: center; gap: 0.75rem; margin-top: 2.5rem; flex-wrap: wrap; }
.page-btn { padding: 0.5rem 1.2rem; background: white; border: 1px solid #E2E8F0; border-radius: 8px; text-decoration: none; color: #1E293B; font-weight: 600; font-size: 0.9rem; }
.page-btn:hover { background: #38BDF8; color: white; border-color: #38BDF8; }
.page-info { color: #64748B; font-size: 0.9rem; }
.no-jobs { text-align: center; padding: 4rem 2rem; color: #64748B; }
.no-jobs h3 { font-size: 1.25rem; margin-bottom: 0.5rem; color: #1E293B; }
.footer { background: #1E293B; color: #94A3B8; text-align: center; padding: 2rem; margin-top: 4rem; font-size: 0.9rem; }
@media (max-width: 600px) {
  .page-hero h1 { font-size: 1.5rem; }
  .jobs-grid { grid-template-columns: 1fr; }
  .filter-row { flex-direction: column; }
  .filter-row input, .filter-row select, .filter-row button { width: 100%; }
}
</style>
</head>
<body>
<header class="header">
  <a href="/" class="logo">JobLagii 🇮🇳</a>
  <nav class="nav">
    <a href="/">🏠 Home</a>
    <a href="/companies">🏢 Companies</a>
    <a href="/jobs" class="nav-active">💼 Jobs</a>
  </nav>
</header>

<div class="page-hero">
  <h1>All <span>Job Postings</span></h1>
  <p>${total.toLocaleString()} jobs across ${dates.length} day${dates.length !== 1 ? "s" : ""}</p>
</div>

<div class="filters">
  <form class="filter-row" action="/jobs" method="get">
    <input type="text" name="search" placeholder="Search title, company, skill..." value="${search}" />
    <select name="industry">
      <option value="">All Industries</option>
      ${industryOptions}
    </select>
    <select name="date">
      <option value="">All Dates</option>
      ${dateOptions}
    </select>
    <button type="submit">Filter</button>
  </form>
</div>

<div class="main">
  <div class="results-header">
    <div class="results-count">
      ${total.toLocaleString()} jobs found <span>${search ? `for "${search}"` : ""} ${industry ? `in ${industry}` : ""} ${dateFilter ? `on ${dateFilter}` : ""}</span>
    </div>
  </div>

  ${jobs.length > 0 ? `<div class="jobs-grid">${jobCards}</div>${pagination}` : `
    <div class="no-jobs"><h3>No jobs found</h3><p>Try adjusting your filters</p></div>
  `}
</div>

<footer class="footer">
  <p>JobLagii — 25,000 fresh job postings daily across India</p>
  <p style="margin-top:0.5rem">Technology • Finance • Healthcare • E-commerce • Manufacturing • Education • Retail • Real Estate • Logistics • Hospitality</p>
</footer>
</body>
</html>`;
}

export default async function handler(req, res) {
  const { GITHUB_TOKEN, GITHUB_OWNER, GITHUB_REPO } = process.env;
  if (!GITHUB_TOKEN || !GITHUB_OWNER || !GITHUB_REPO) return res.status(500).send("Missing environment variables");

  const page = parseInt(req.query.page || "1");
  const search = req.query.search || "";
  const industry = req.query.industry || "";
  const dateFilter = req.query.date || "";

  const { jobs, total, dates } = await getAllJobs(GITHUB_OWNER, GITHUB_REPO, GITHUB_TOKEN, page, 24, search, industry, dateFilter);

  res.setHeader("Content-Type", "text/html");
  res.setHeader("Cache-Control", "s-maxage=300");
  return res.status(200).send(renderHTML(jobs, total, dates, page, search, industry, dateFilter));
}
