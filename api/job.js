// api/job.js - Single job page with full JSON-LD JobPosting schema

const GITHUB_RAW = "https://raw.githubusercontent.com";

// Domain-specific ad configurations (same as index.js)
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

export default async function handler(req, res) {
  const { GITHUB_TOKEN, GITHUB_OWNER, GITHUB_REPO } = process.env;

  if (!GITHUB_TOKEN || !GITHUB_OWNER || !GITHUB_REPO) {
    return res.status(500).send("Missing environment variables");
  }

  // Get the domain/hostname from request
  const hostname = req.headers.host || req.headers['x-forwarded-host'] || '';
  const domain = hostname.split(':')[0]; // Remove port if present
  
  // Get ad script for this specific domain
  const adScript = getAdScriptForDomain(domain);

  const { path } = req.query;
  if (!path) return res.status(400).send("Missing path parameter");

  try {
    const jobRes = await fetch(`${GITHUB_RAW}/${GITHUB_OWNER}/${GITHUB_REPO}/main/${path}`, {
      headers: { Authorization: `token ${GITHUB_TOKEN}` }
    });

    if (!jobRes.ok) return res.status(404).send(render404(adScript, domain));

    const job = await jobRes.json();
    const html = renderJobPage(job, adScript, domain);

    res.setHeader("Content-Type", "text/html");
    res.setHeader("Cache-Control", "s-maxage=3600");
    return res.status(200).send(html);
  } catch (e) {
    return res.status(500).send(`Error: ${e.message}`);
  }
}

function render404(adScript, domain) {
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

  return `<!DOCTYPE html><html><head><title>Job Not Found</title>
  <style>
    body{font-family:sans-serif;text-align:center;padding:4rem}
    .ad-container{display:flex;justify-content:center;align-items:center;margin:1rem auto;padding:0.5rem}
    .ad-top{margin:1rem auto 0 auto;max-width:728px}
    .ad-footer{margin:2rem auto 1rem auto;max-width:728px}
  </style>
  </head>
  <body>
  ${adHtml}
  <h1>Job Not Found</h1>
  <p><a href="/api/index">← Back to Jobs</a></p>
  ${footerAdHtml}
  </body></html>`;
}

function renderJobPage(job, adScript, domain) {
  const jsonLd = JSON.stringify(job.jsonLd || {}, null, 2);
  const cityState = job.location ? `${job.location.city}, ${job.location.state}` : "India";
  const skills = (job.skills || []).map(s => `<span class="skill-tag">${s}</span>`).join("");

  const industryColors = {
    technology: "#3B82F6", finance: "#10B981", healthcare: "#EF4444",
    ecommerce: "#F59E0B", manufacturing: "#6366F1", education: "#EC4899",
    retail: "#14B8A6", realestate: "#F97316", logistics: "#8B5CF6", hospitality: "#06B6D4"
  };
  const color = industryColors[job.industry] || "#6B7280";

  const description = job.jsonLd?.description || "";
  const responsibilities = description.match(/Key Responsibilities:([\s\S]*?)Required Skills/)?.[1]
    ?.split("\n").filter(l => l.trim().startsWith("•")).map(l => `<li>${l.replace("•", "").trim()}</li>`).join("") || "";

  const benefits = description.match(/What We Offer:([\s\S]*?)(?:Salary Range|Location|$)/)?.[1]
    ?.split("\n").filter(l => l.trim().startsWith("•")).map(l => `<li>${l.replace("•", "").trim()}</li>`).join("") || "";

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
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${job.title} | JobLagii</title>
<meta name="description" content="${job.meta?.description || job.title + " - Apply now on JobLagii"}">
<meta name="keywords" content="${job.meta?.keywords || ""}">
<meta property="og:title" content="${job.title}">
<meta property="og:description" content="${job.meta?.description || ""}">
<meta property="og:type" content="website">
<script type="application/ld+json">${jsonLd}</script>
<style>
* { margin:0; padding:0; box-sizing:border-box; }
body { font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif; background:#F8FAFC; color:#1E293B; }
.header { background:#1E293B; color:white; padding:1rem 2rem; display:flex; align-items:center; justify-content:space-between; }
.logo { font-size:1.4rem; font-weight:700; color:#38BDF8; text-decoration:none; }
.back-btn { color:#94A3B8; text-decoration:none; font-size:0.9rem; }
.back-btn:hover { color:white; }
.main { max-width:900px; margin:2rem auto; padding:0 1.5rem; display:grid; grid-template-columns:1fr 300px; gap:1.5rem; }
.job-content { background:white; border-radius:16px; border:1px solid #E2E8F0; overflow:hidden; }
.job-hero { padding:2rem; border-bottom:1px solid #E2E8F0; }
.company-row { display:flex; align-items:center; gap:1rem; margin-bottom:1rem; }
.company-logo { width:56px; height:56px; border-radius:12px; display:flex; align-items:center; justify-content:center; font-weight:700; font-size:1.4rem; }
.company-info h2 { font-size:1rem; color:#64748B; font-weight:500; }
.company-info p { font-size:0.85rem; color:#94A3B8; }
.job-title { font-size:1.5rem; font-weight:700; color:#1E293B; margin-bottom:1rem; line-height:1.3; }
.badges { display:flex; gap:0.5rem; flex-wrap:wrap; margin-bottom:1.25rem; }
.badge { padding:5px 14px; border-radius:20px; font-size:0.8rem; font-weight:600; }
.badge-industry { color:${color}; background:${color}20; }
.badge-mode { color:#475569; background:#F1F5F9; }
.badge-type { color:#047857; background:#D1FAE5; }
.meta-grid { display:grid; grid-template-columns:1fr 1fr; gap:0.75rem; }
.meta-item { display:flex; align-items:center; gap:0.5rem; font-size:0.9rem; color:#475569; }
.meta-item strong { color:#1E293B; }
.job-body { padding:2rem; }
.section { margin-bottom:2rem; }
.section h3 { font-size:1.05rem; font-weight:700; color:#1E293B; margin-bottom:1rem; padding-bottom:0.5rem; border-bottom:2px solid #F1F5F9; }
.section ul { padding-left:1.25rem; }
.section ul li { margin-bottom:0.5rem; font-size:0.95rem; color:#475569; line-height:1.6; }
.skills-grid { display:flex; flex-wrap:wrap; gap:0.5rem; }
.skill-tag { font-size:0.82rem; background:#EFF6FF; color:#1D4ED8; padding:5px 12px; border-radius:8px; font-weight:500; }
.sidebar { display:flex; flex-direction:column; gap:1rem; }
.apply-card { background:white; border-radius:16px; border:1px solid #E2E8F0; padding:1.5rem; position:sticky; top:1rem; }
.apply-card h3 { font-size:1rem; font-weight:700; margin-bottom:1rem; }
.salary-big { font-size:1.4rem; font-weight:800; color:#059669; margin-bottom:0.25rem; }
.salary-sub { font-size:0.82rem; color:#64748B; margin-bottom:1.5rem; }
.apply-btn { display:block; width:100%; padding:0.9rem; background:#38BDF8; color:#0F172A; border:none; border-radius:10px; font-weight:700; font-size:1rem; cursor:pointer; text-align:center; text-decoration:none; margin-bottom:0.75rem; }
.apply-btn:hover { background:#0EA5E9; }
.save-btn { display:block; width:100%; padding:0.9rem; background:white; color:#1E293B; border:1px solid #E2E8F0; border-radius:10px; font-weight:600; font-size:0.95rem; cursor:pointer; text-align:center; text-decoration:none; }
.save-btn:hover { background:#F8FAFC; }
.info-list { margin-top:1rem; display:flex; flex-direction:column; gap:0.6rem; }
.info-row { display:flex; justify-content:space-between; font-size:0.85rem; }
.info-row span:first-child { color:#64748B; }
.info-row span:last-child { font-weight:600; color:#1E293B; }
.schema-card { background:white; border-radius:16px; border:1px solid #E2E8F0; padding:1.5rem; }
.schema-card h4 { font-size:0.85rem; font-weight:700; color:#64748B; margin-bottom:0.75rem; text-transform:uppercase; letter-spacing:0.05em; }
.schema-badge { display:inline-flex; align-items:center; gap:0.4rem; background:#D1FAE5; color:#065F46; padding:5px 12px; border-radius:8px; font-size:0.8rem; font-weight:600; }
.footer { background:#1E293B; color:#94A3B8; text-align:center; padding:2rem; margin-top:3rem; font-size:0.85rem; }
.ad-container { display:flex; justify-content:center; align-items:center; margin:1rem auto; padding:0.5rem; background:#f9f9f9; border-radius:8px; }
.ad-top { margin:0 auto; max-width:728px; padding-top:0.5rem; }
.ad-footer { margin:1rem auto; max-width:728px; padding-bottom:0.5rem; }
@media(max-width:768px) {
  .main { grid-template-columns:1fr; }
  .sidebar { order:-1; }
  .apply-card { position:static; }
  .meta-grid { grid-template-columns:1fr; }
  .ad-container { transform:scale(0.9); }
}
</style>
</head>
<body>

<header class="header">
  <a href="/api/index" class="logo">JobLagii 🇮🇳</a>
  <a href="/api/index" class="back-btn">← Back to Jobs</a>
</header>

${adHtml}

<div class="main">
  <div class="job-content">
    <div class="job-hero">
      <div class="company-row">
        <div class="company-logo" style="background:${color}20;color:${color}">
          ${job.company?.charAt(0) || "J"}
        </div>
        <div class="company-info">
          <h2>${job.company}</h2>
          <p>${job.industry?.charAt(0).toUpperCase() + job.industry?.slice(1)} Industry</p>
        </div>
      </div>
      <h1 class="job-title">${job.title}</h1>
      <div class="badges">
        <span class="badge badge-industry">${job.industry}</span>
        <span class="badge badge-mode">${job.workMode || "On-site"}</span>
        <span class="badge badge-type">${job.jobType || "Full-time"}</span>
      </div>
      <div class="meta-grid">
        <div class="meta-item">📍 <span><strong>${cityState}</strong></span></div>
        <div class="meta-item">💼 <span><strong>${job.experience}</strong> experience</span></div>
        <div class="meta-item">📅 <span>Posted <strong>${job.datePosted}</strong></span></div>
        <div class="meta-item">⏰ <span>Valid till <strong>${job.validThrough}</strong></span></div>
      </div>
    </div>

    <div class="job-body">
      ${responsibilities ? `
      <div class="section">
        <h3>Key Responsibilities</h3>
        <ul>${responsibilities}</ul>
      </div>` : ""}

      <div class="section">
        <h3>Required Skills</h3>
        <div class="skills-grid">${skills}</div>
      </div>

      ${benefits ? `
      <div class="section">
        <h3>What We Offer</h3>
        <ul>${benefits}</ul>
      </div>` : ""}

      <div class="section">
        <h3>About ${job.company}</h3>
        <p style="color:#475569;line-height:1.7;font-size:0.95rem">
          ${job.company} is a leading organization in the ${job.industry} sector in India, 
          committed to excellence, innovation, and employee growth. We offer a dynamic work 
          environment where talent is recognized and rewarded.
        </p>
      </div>
    </div>
  </div>

  <div class="sidebar">
    <div class="apply-card">
      <h3>Job Summary</h3>
      <div class="salary-big">${job.salary}</div>
      <div class="salary-sub">per annum (CTC)</div>
      <a href="https://remotejob09.job4intern.com/pages/job-application" class="apply-btn" target="_blank" rel="noopener">
        Apply Now →
      </a>
      <a href="/api/index" class="save-btn">← Browse More Jobs</a>
      <div class="info-list">
        <div class="info-row"><span>Location</span><span>${cityState}</span></div>
        <div class="info-row"><span>Work Mode</span><span>${job.workMode}</span></div>
        <div class="info-row"><span>Job Type</span><span>${job.jobType}</span></div>
        <div class="info-row"><span>Experience</span><span>${job.experience}</span></div>
        <div class="info-row"><span>Industry</span><span style="text-transform:capitalize">${job.industry}</span></div>
        <div class="info-row"><span>Posted</span><span>${job.datePosted}</span></div>
      </div>
    </div>

    <div class="schema-card">
      <h4>SEO Schema</h4>
      <span class="schema-badge">✓ JSON-LD JobPosting</span>
      <p style="font-size:0.8rem;color:#64748B;margin-top:0.75rem">
        This job posting includes full schema.org JobPosting markup for Google Jobs indexing.
      </p>
    </div>
  </div>
</div>

${footerAdHtml}

<footer class="footer">
  <p>JobLagii — 25,000 fresh job postings daily across India</p>
</footer>

</body>
</html>`;
}
