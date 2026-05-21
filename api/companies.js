// api/companies.js - Shows all 5000 companies with links

import { generateCompanies } from "../lib/companies.js";

export const config = { maxDuration: 10 };

export default async function handler(req, res) {
  const baseUrl = process.env.SITE_URL || `https://${req.headers.host}`;

  const search = req.query.search || "";
  const industry = req.query.industry || "";

  const allCompanies = generateCompanies();

  // Filter
  let filtered = allCompanies.filter(c => {
    const matchSearch = !search || c.name.toLowerCase().includes(search.toLowerCase());
    const matchIndustry = !industry || c.industry === industry;
    return matchSearch && matchIndustry;
  });

  const industries = ["technology", "finance", "healthcare", "ecommerce", "manufacturing", "education", "retail", "realestate", "logistics", "hospitality"];

  const industryColors = {
    technology: "#3B82F6", finance: "#10B981", healthcare: "#EF4444",
    ecommerce: "#F59E0B", manufacturing: "#6366F1", education: "#EC4899",
    retail: "#14B8A6", realestate: "#F97316", logistics: "#8B5CF6", hospitality: "#06B6D4"
  };

  // Industry counts
  const industryCounts = {};
  for (const c of allCompanies) {
    industryCounts[c.industry] = (industryCounts[c.industry] || 0) + 1;
  }

  const now = new Date();
  const istOffset = 5.5 * 60 * 60 * 1000;
  const ist = new Date(now.getTime() + istOffset);
  const dateStr = ist.toISOString().split("T")[0];

  const industryFilters = industries.map(i => `
    <button onclick="filterIndustry('${i}')" class="industry-btn ${industry === i ? 'active' : ''}" style="--color:${industryColors[i]}">
      <span class="dot" style="background:${industryColors[i]}"></span>
      ${i.charAt(0).toUpperCase() + i.slice(1)}
      <span class="count">${industryCounts[i] || 0}</span>
    </button>`).join("");

  const companyCards = filtered.map(c => {
    const color = industryColors[c.industry] || "#6B7280";
    return `
    <a href="/api/index?industry=${c.industry}&search=${encodeURIComponent(c.name)}" class="company-card">
      <div class="company-avatar" style="background:${color}20;color:${color}">
        ${c.name.charAt(0)}
      </div>
      <div class="company-info">
        <h3>${c.name}</h3>
        <span class="industry-tag" style="background:${color}20;color:${color}">${c.industry}</span>
      </div>
      <div class="jobs-count">5 jobs →</div>
    </a>`;
  }).join("");

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="google-site-verification" content="6TO8Wo25PZGTYgT5AiRwIYIZBR-SNls-PvS03rjww8w" />
<meta name="google-site-verification" content="mhwuIuZvhxIUI-g2YK2o1tfhIy8tt1J2VaZ3Yr9PwOo" />
<title>All Companies | JobLagii India</title>
<meta name="description" content="Browse all 5,000 top Indian companies hiring today. Find jobs by company across technology, finance, healthcare and more.">
<style>
* { margin:0; padding:0; box-sizing:border-box; }
body { font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif; background:#F8FAFC; color:#1E293B; }
.header { background:#1E293B; color:white; padding:1rem 2rem; display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:1rem; }
.logo { font-size:1.4rem; font-weight:700; color:#38BDF8; text-decoration:none; }
.nav { display:flex; gap:1rem; }
.nav a { color:#94A3B8; text-decoration:none; font-size:0.9rem; padding:0.4rem 1rem; border-radius:8px; }
.nav a:hover, .nav a.active { background:#38BDF8; color:#0F172A; font-weight:600; }

.hero { background:linear-gradient(135deg,#1E293B,#0F172A); color:white; padding:2.5rem 2rem; text-align:center; }
.hero h1 { font-size:2rem; font-weight:800; margin-bottom:0.5rem; }
.hero h1 span { color:#38BDF8; }
.hero p { color:#94A3B8; margin-bottom:1.5rem; }

.search-box { max-width:500px; margin:0 auto; display:flex; gap:0.5rem; }
.search-box input { flex:1; padding:0.8rem 1.25rem; border-radius:10px; border:none; font-size:1rem; outline:none; }
.search-box button { padding:0.8rem 1.5rem; background:#38BDF8; color:#0F172A; border:none; border-radius:10px; font-weight:700; cursor:pointer; }

.main { max-width:1300px; margin:2rem auto; padding:0 1.5rem; }

.industry-filters { display:flex; gap:0.5rem; flex-wrap:wrap; margin-bottom:1.5rem; align-items:center; }
.industry-filters label { font-size:0.9rem; font-weight:600; color:#64748B; margin-right:0.5rem; }
.industry-btn { display:flex; align-items:center; gap:0.4rem; padding:0.45rem 1rem; border-radius:20px; border:1px solid #E2E8F0; background:white; cursor:pointer; font-size:0.82rem; font-weight:500; color:#475569; transition:all 0.2s; }
.industry-btn:hover { border-color:var(--color); color:var(--color); }
.industry-btn.active { background:var(--color); color:white; border-color:var(--color); }
.industry-btn.active .count { background:rgba(255,255,255,0.3); }
.dot { width:8px; height:8px; border-radius:50%; flex-shrink:0; }
.count { background:#F1F5F9; padding:1px 7px; border-radius:10px; font-size:0.75rem; }
.clear-btn { padding:0.45rem 1rem; border-radius:20px; border:1px solid #E2E8F0; background:white; cursor:pointer; font-size:0.82rem; color:#EF4444; }

.results-info { font-size:0.9rem; color:#64748B; margin-bottom:1rem; }
.results-info strong { color:#1E293B; }

.companies-grid { display:grid; grid-template-columns:repeat(auto-fill, minmax(280px, 1fr)); gap:1rem; }
.company-card { background:white; border-radius:12px; border:1px solid #E2E8F0; padding:1.1rem 1.25rem; text-decoration:none; color:inherit; display:flex; align-items:center; gap:1rem; transition:all 0.2s; }
.company-card:hover { border-color:#38BDF8; box-shadow:0 4px 15px rgba(56,189,248,0.12); transform:translateY(-1px); }
.company-avatar { width:42px; height:42px; border-radius:10px; display:flex; align-items:center; justify-content:center; font-weight:700; font-size:1.1rem; flex-shrink:0; }
.company-info { flex:1; min-width:0; }
.company-info h3 { font-size:0.92rem; font-weight:600; color:#1E293B; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.industry-tag { font-size:0.72rem; padding:2px 8px; border-radius:10px; font-weight:500; text-transform:capitalize; display:inline-block; margin-top:3px; }
.jobs-count { font-size:0.8rem; color:#38BDF8; font-weight:600; white-space:nowrap; }

.footer { background:#1E293B; color:#94A3B8; text-align:center; padding:2rem; margin-top:3rem; font-size:0.85rem; }

@media(max-width:600px) {
  .hero h1 { font-size:1.5rem; }
  .companies-grid { grid-template-columns:1fr; }
}
</style>
</head>
<body>

<header class="header">
  <a href="/" class="logo">JobLagii 🇮🇳</a>
  <nav class="nav">
    <a href="/">🏠 Home</a>
    <a href="/companies" class="active">🏢 Companies</a>
    <a href="/jobs">💼 Jobs</a>
  </nav>
</header>

<div class="hero">
  <h1>All <span>5,000</span> Companies</h1>
  <p>Browse top Indian companies hiring today — click any company to see their jobs</p>
  <form class="search-box" action="/companies" method="get">
    <input type="hidden" name="industry" value="${industry}" />
    <input type="text" name="search" placeholder="Search company name..." value="${search}" />
    <button type="submit">Search</button>
  </form>
</div>

<div class="main">
  <div class="industry-filters">
    <label>Filter by:</label>
    ${industryFilters}
    ${industry ? `<button class="clear-btn" onclick="window.location='/companies'">✕ Clear</button>` : ""}
  </div>

  <p class="results-info">
    Showing <strong>${filtered.length.toLocaleString()}</strong> of <strong>${allCompanies.length.toLocaleString()}</strong> companies
    ${industry ? `in <strong>${industry}</strong>` : ""}
    ${search ? `matching <strong>"${search}"</strong>` : ""}
  </p>

  <div class="companies-grid">
    ${companyCards}
  </div>
</div>

<footer class="footer">
  <p>JobLagii — 5,000 companies • 25,000 fresh jobs daily • All across India</p>
</footer>

<script>
function filterIndustry(ind) {
  const search = new URLSearchParams(window.location.search).get('search') || '';
  window.location = '/companies?industry=' + ind + (search ? '&search=' + encodeURIComponent(search) : '');
}
</script>
</body>
</html>`;

  res.setHeader("Content-Type", "text/html");
  res.setHeader("Cache-Control", "s-maxage=3600");
  return res.status(200).send(html);
}
