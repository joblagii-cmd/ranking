// api/index.js - Homepage, shows today's jobs (fallback to yesterday)

const GITHUB_RAW = "https://raw.githubusercontent.com";
const GITHUB_API = "https://api.github.com";

// Domain-specific ad configurations
const adConfigs = {
  "ranking-mu-eosin.vercel.app": {
    key: "b32e029816324c0f01ed6943e0f0c3ab",
    format: "iframe",
    height: 90,
    width: 728
  },
  "jobsnearme.dpsbahadurgarh.com": {
    key: "fd571fb60f76ce8e2828ad28e90abc5e",
    format: "iframe",
    height: 90,
    width: 728
  },
  "jobsnearme.carrilloadventures.com": {
    key: "7bc5d7ec66f9b5dc387551d438bb4d2e",
    format: "iframe",
    height: 90,
    width: 728
  }
};

function getAdScriptForDomain(hostname) {
  const config = adConfigs[hostname];
  if (!config) return null;
  
  return `
    <script>
      atOptions = {
        'key' : '${config.key}',
        'format' : '${config.format}',
        'height' : ${config.height},
        'width' : ${config.width},
        'params' : {}
      };
    </script>
    <script src="https://www.highperformanceformat.com/${config.key}/invoke.js"></script>
  `;
}

async function getJobsForDate(owner, repo, token, date, page = 1, limit = 20, search = "", industry = "") {
  try {
    // Get company folders for this date
    const foldersRes = await fetch(`${GITHUB_API}/repos/${owner}/${repo}/contents/jobs/${date}`, {
      headers: { Authorization: `token ${token}`, Accept: "application/vnd.github.v3+json", "User-Agent": "JobPoster-Bot/1.0" }
    });
    if (!foldersRes.ok) return null;
    const folders = await foldersRes.json();
    if (!Array.isArray(folders)) return null;

    const companyFolders = folders.filter(f => f.type === "dir");
    if (companyFolders.length === 0) return null;

    // Only fetch files from the companies needed for this page
    // Each company has 5 files, so page 1 needs companies 0-3 (20 jobs / 5 = 4 companies)
    const companiesPerPage = Math.ceil(limit / 5);
    const startCompany = (page - 1) * companiesPerPage;
    const pageCompanies = companyFolders.slice(startCompany, startCompany + companiesPerPage);

    if (pageCompanies.length === 0) return { jobs: [], total: companyFolders.length * 5, date };

    const files = [];
    await Promise.all(pageCompanies.map(async folder => {
      try {
        const r = await fetch(`${GITHUB_API}/repos/${owner}/${repo}/contents/${folder.path}`, {
          headers: { Authorization: `token ${token}`, Accept: "application/vnd.github.v3+json", "User-Agent": "JobPoster-Bot/1.0" }
        });
        if (!r.ok) return;
        const data = await r.json();
        if (!Array.isArray(data)) return;
        data.forEach(f => { if (f.name.endsWith(".json") && f.type === "file") files.push(f); });
      } catch { }
    }));

    if (files.length === 0) return null;

    const jobs = await Promise.all(files.map(async f => {
      try {
        const r = await fetch(f.download_url);
        if (!r.ok) return null;
        const job = await r.json();
        if (search && !job.title?.toLowerCase().includes(search.toLowerCase()) &&
          !job.company?.toLowerCase().includes(search.toLowerCase()) &&
          !job.role?.toLowerCase().includes(search.toLowerCase())) return null;
        if (industry && job.industry !== industry) return null;
        return {
          slug: job.slug, title: job.title, company: job.company, role: job.role,
          industry: job.industry, location: job.location, salary: job.salary,
          workMode: job.workMode, experience: job.experience, datePosted: job.datePosted,
          skills: job.skills?.slice(0, 4) || [], path: f.path
        };
      } catch { return null; }
    }));

    return { jobs: jobs.filter(Boolean), total: companyFolders.length * 5, date };
  } catch { return null; }
}

function getYesterday(dateStr) {
  const d = new Date(dateStr);
  d.setDate(d.getDate() - 1);
  return d.toISOString().split("T")[0];
}

function renderHTML(jobs, total, todayStr, actualDate, page, search, industry, isFallback, adScript) {
  const limit = 20;
  const totalPages = Math.ceil(total / limit);
  const industries = ["technology","finance","healthcare","ecommerce","manufacturing","education","retail","realestate","logistics","hospitality"];
  const industryColors = { technology:"#3B82F6",finance:"#10B981",healthcare:"#EF4444",ecommerce:"#F59E0B",manufacturing:"#6366F1",education:"#EC4899",retail:"#14B8A6",realestate:"#F97316",logistics:"#8B5CF6",hospitality:"#06B6D4" };

  const jobCards = jobs.map(job => {
    const color = industryColors[job.industry] || "#6B7280";
    const cityState = job.location ? `${job.location.city}, ${job.location.state}` : "India";
    return `<a href="/api/job?path=${encodeURIComponent(job.path)}" class="job-card">
      <div class="job-card-header">
        <div class="company-logo" style="background:${color}20;color:${color}">${job.company?.charAt(0)||"J"}</div>
        <div class="job-meta">
          <span class="industry-badge" style="background:${color}20;color:${color}">${job.industry}</span>
          <span class="work-mode">${job.workMode||"On-site"}</span>
        </div>
      </div>
      <h3 class="job-title">${job.title}</h3>
      <p class="company-name">${job.company}</p>
      <div class="job-details"><span>📍 ${cityState}</span><span>💰 ${job.salary}</span><span>⏱ ${job.experience}</span></div>
      <div class="skills-row">${(job.skills||[]).map(s=>`<span class="skill-tag">${s}</span>`).join("")}</div>
    </a>`;
  }).join("");

  const industryOptions = industries.map(i => `<option value="${i}" ${industry===i?"selected":""}>${i.charAt(0).toUpperCase()+i.slice(1)}</option>`).join("");
  const pagination = totalPages > 1 ? `<div class="pagination">
    ${page>1?`<a href="/?page=${page-1}&search=${search}&industry=${industry}" class="page-btn">← Prev</a>`:""}
    <span class="page-info">Page ${page} of ${totalPages}</span>
    ${page<totalPages?`<a href="/?page=${page+1}&search=${search}&industry=${industry}" class="page-btn">Next →</a>`:""}
  </div>` : "";

  const fallbackBanner = isFallback ? `<div class="fallback-banner">⏳ Today's jobs are being generated — showing latest posts from ${actualDate}. Fresh jobs will appear shortly!</div>` : "";

  // Create ad HTML if ad script exists
  const adHtml = adScript ? `
    <div class="ad-container ad-top">
      ${adScript}
    </div>
  ` : '';

  const footerAdHtml = adScript ? `
    <div class="ad-container ad-footer">
      ${adScript}
    </div>
  ` : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="google-site-verification" content="9jFgTVeWd6lIyuth91m1WDwx62v47MbqrZ03lndiwzc" />
<title>JobLagii - Find Jobs in India | 25,000+ Daily Job Postings</title>
<meta name="google-site-verification" content="6TO8Wo25PZGTYgT5AiRwIYIZBR-SNls-PvS03rjww8w" />
<meta name="google-site-verification" content="mhwuIuZvhxIUI-g2YK2o1tfhIy8tt1J2VaZ3Yr9PwOo" />
<meta name="description" content="Find the latest job openings in India. 25,000+ fresh job postings daily from 5,000 top companies across technology, finance, healthcare and more.">
<style>
*{margin:0;padding:0;box-sizing:border-box}body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#F8FAFC;color:#1E293B}
.header{background:#1E293B;color:white;padding:1rem 2rem;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:1rem}
.logo{font-size:1.5rem;font-weight:700;color:#38BDF8;text-decoration:none}
.nav{display:flex;gap:0.5rem}.nav a{color:#94A3B8;text-decoration:none;font-size:0.88rem;padding:0.4rem 0.9rem;border-radius:8px;transition:all 0.2s}
.nav a:hover,.nav a.nav-active{background:#38BDF8;color:#0F172A;font-weight:600}
.hero{background:linear-gradient(135deg,#1E293B 0%,#0F172A 100%);color:white;padding:3rem 2rem;text-align:center}
.hero h1{font-size:2.5rem;font-weight:800;margin-bottom:0.5rem}.hero h1 span{color:#38BDF8}
.hero p{color:#94A3B8;margin-bottom:2rem;font-size:1.1rem}
.search-box{max-width:700px;margin:0 auto;display:flex;gap:0.5rem;flex-wrap:wrap}
.search-box input{flex:1;min-width:200px;padding:0.85rem 1.25rem;border-radius:10px;border:none;font-size:1rem;outline:none}
.search-box select{padding:0.85rem 1rem;border-radius:10px;border:none;font-size:0.95rem;outline:none;background:white}
.search-box button{padding:0.85rem 2rem;background:#38BDF8;color:#0F172A;border:none;border-radius:10px;font-weight:700;cursor:pointer;font-size:1rem}
.fallback-banner{background:#FEF3C7;border-bottom:1px solid #F59E0B;color:#92400E;padding:0.75rem 2rem;text-align:center;font-size:0.9rem;font-weight:500}
.stats-bar{background:white;border-bottom:1px solid #E2E8F0;padding:1rem 2rem;display:flex;gap:2rem;flex-wrap:wrap}
.stat{font-size:0.9rem;color:#64748B}.stat strong{color:#1E293B}
.main{max-width:1200px;margin:0 auto;padding:2rem}
.section-title{font-size:1.25rem;font-weight:700;margin-bottom:1.5rem;color:#1E293B}
.jobs-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(340px,1fr));gap:1.25rem}
.job-card{background:white;border-radius:14px;padding:1.5rem;border:1px solid #E2E8F0;text-decoration:none;color:inherit;display:block;transition:all 0.2s}
.job-card:hover{border-color:#38BDF8;box-shadow:0 4px 20px rgba(56,189,248,0.15);transform:translateY(-2px)}
.job-card-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:1rem}
.company-logo{width:44px;height:44px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:1.1rem}
.job-meta{display:flex;gap:0.5rem;align-items:center}
.industry-badge{font-size:0.75rem;padding:3px 10px;border-radius:20px;font-weight:600;text-transform:capitalize}
.work-mode{font-size:0.75rem;color:#64748B;background:#F1F5F9;padding:3px 10px;border-radius:20px}
.job-title{font-size:1rem;font-weight:600;color:#1E293B;margin-bottom:0.3rem;line-height:1.4}
.company-name{font-size:0.9rem;color:#64748B;margin-bottom:0.75rem}
.job-details{display:flex;gap:1rem;flex-wrap:wrap;margin-bottom:0.75rem}
.job-details span{font-size:0.82rem;color:#64748B}
.skills-row{display:flex;gap:0.4rem;flex-wrap:wrap}
.skill-tag{font-size:0.75rem;background:#F1F5F9;color:#475569;padding:3px 10px;border-radius:6px}
.pagination{display:flex;align-items:center;justify-content:center;gap:1rem;margin-top:2rem}
.page-btn{padding:0.6rem 1.5rem;background:white;border:1px solid #E2E8F0;border-radius:8px;text-decoration:none;color:#1E293B;font-weight:600}
.page-btn:hover{background:#38BDF8;color:white;border-color:#38BDF8}
.page-info{color:#64748B;font-size:0.9rem}
.no-jobs{text-align:center;padding:4rem 2rem;color:#64748B}
.no-jobs h3{font-size:1.25rem;margin-bottom:0.5rem;color:#1E293B}
.footer{background:#1E293B;color:#94A3B8;text-align:center;padding:2rem;margin-top:4rem;font-size:0.9rem}
.ad-container{display:flex;justify-content:center;align-items:center;margin:1rem auto;padding:0.5rem;background:#f9f9f9;border-radius:8px}
.ad-top{margin:1rem auto 0 auto;max-width:728px}
.ad-footer{margin:2rem auto 1rem auto;max-width:728px}
@media(max-width:600px){.hero h1{font-size:1.75rem}.jobs-grid{grid-template-columns:1fr}.stats-bar{gap:1rem}.ad-container{transform:scale(0.9)}}
</style>
</head>
<body>
<header class="header">
  <a href="/" class="logo">JobLagii 🇮🇳</a>
  <nav class="nav">
    <a href="/" class="nav-active">🏠 Home</a>
    <a href="/companies">🏢 Companies</a>
    <a href="/jobs">💼 Jobs</a>
  </nav>
</header>
${adHtml}
<div class="hero">
  <h1>Find Jobs in <span>India</span></h1>
  <p>25,000+ fresh job postings daily from 5,000 top companies</p>
  <form class="search-box" action="/" method="get">
    <input type="text" name="search" placeholder="Search job title, company, skill..." value="${search}" />
    <select name="industry"><option value="">All Industries</option>${industryOptions}</select>
    <button type="submit">Search</button>
  </form>
</div>
${fallbackBanner}
<div class="stats-bar">
  <span class="stat"><strong>${total.toLocaleString()}</strong> jobs today</span>
  <span class="stat"><strong>5,000</strong> companies</span>
  <span class="stat"><strong>50</strong> cities across India</span>
  <span class="stat"><strong>10</strong> industries</span>
  <span class="stat">Updated: <strong>${actualDate}</strong></span>
</div>
<div class="main">
  <h2 class="section-title">${search||industry?`Search Results ${jobs.length>0?`(${total.toLocaleString()} found)`:""}`:"Latest Job Openings"}</h2>
  ${jobs.length>0?`<div class="jobs-grid">${jobCards}</div>${pagination}`:`<div class="no-jobs"><h3>No jobs found</h3><p>Try a different search term or industry filter</p></div>`}
</div>
${footerAdHtml}
<footer class="footer">
  <p>JobLagii — 25,000 fresh job postings daily across India</p>
  <p style="margin-top:0.5rem">Technology • Finance • Healthcare • E-commerce • Manufacturing • Education • Retail • Real Estate • Logistics • Hospitality</p>
</footer>
</body></html>`;
}

export default async function handler(req, res) {
  const { GITHUB_TOKEN, GITHUB_OWNER, GITHUB_REPO } = process.env;
  if (!GITHUB_TOKEN || !GITHUB_OWNER || !GITHUB_REPO) return res.status(500).send("Missing environment variables");

  // Get the domain/hostname from request
  const hostname = req.headers.host || req.headers['x-forwarded-host'] || '';
  const domain = hostname.split(':')[0]; // Remove port if present
  
  // Get ad script for this specific domain (only if it matches one of the three)
  const adScript = getAdScriptForDomain(domain);

  const now = new Date();
  const ist = new Date(now.getTime() + 5.5 * 60 * 60 * 1000);
  const todayStr = ist.toISOString().split("T")[0];
  const yesterdayStr = getYesterday(todayStr);

  const page = parseInt(req.query.page || "1");
  const search = req.query.search || "";
  const industry = req.query.industry || "";

  // Try today first, fall back to yesterday
  let result = await getJobsForDate(GITHUB_OWNER, GITHUB_REPO, GITHUB_TOKEN, todayStr, page, 20, search, industry);
  let isFallback = false;

  if (!result) {
    result = await getJobsForDate(GITHUB_OWNER, GITHUB_REPO, GITHUB_TOKEN, yesterdayStr, page, 20, search, industry);
    isFallback = true;
  }

  const { jobs = [], total = 0, date: actualDate = todayStr } = result || {};

  res.setHeader("Content-Type", "text/html");
  res.setHeader("Cache-Control", "s-maxage=120");
  return res.status(200).send(renderHTML(jobs, total, todayStr, actualDate, page, search, industry, isFallback, adScript));
}
