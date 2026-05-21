# 🇮🇳 Job Poster India — 25,000 Posts/Day Automation

Automated job posting engine that generates **25,000 unique job posts daily** for **5,000 Indian companies**, stored as JSON files in GitHub with full **JSON-LD JobPosting schema** (Google-indexable).

---

## 📊 Stats at a Glance

| Metric | Value |
|--------|-------|
| Companies | 5,000 |
| Posts per company | 5/day |
| Total daily posts | 25,000 |
| Cron runs | Every hour (24×/day) |
| Posts per batch | ~1,042 |
| Storage | GitHub repository |
| Cost | $0 (template-based, no AI API) |
| Schema | JSON-LD JobPosting (schema.org) |
| Location | India (50 cities, all states) |

---

## 🏗️ Architecture

```
Vercel Cron (every hour)
        ↓
/api/cron/generate
        ↓
Generate ~1,042 job posts (template engine)
        ↓
Commit to GitHub via Tree API (single commit)
        ↓
jobs/YYYY-MM-DD/company-name/post-slug.json
```

Each JSON file contains:
- Unique title (10 title patterns × 10 prefixes)
- Unique description (10 intro templates + varied responsibilities)
- Full JSON-LD `JobPosting` schema (Google Jobs compatible)
- Location: one of 50 Indian cities
- Salary in INR
- Skills, benefits, experience level
- SEO meta tags

---

## 🚀 Setup Guide

### Step 1: Fork / Clone this repo

```bash
git clone https://github.com/YOUR_USERNAME/job-postings-india.git
cd job-postings-india
```

### Step 2: Create a GitHub repo for job posts storage

1. Go to [github.com/new](https://github.com/new)
2. Create a new **public or private** repo, e.g. `job-postings-india`
3. Initialize with a README

### Step 3: Create a GitHub Personal Access Token

1. Go to [github.com/settings/tokens](https://github.com/settings/tokens)
2. Click **Generate new token (classic)**
3. Give it a name: `JobPoster Bot`
4. Select scope: ✅ `repo` (full control)
5. Click **Generate token**
6. Copy the token — you'll need it next

### Step 4: Deploy to Vercel

#### Option A: One-click deploy
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/job-poster-india)

#### Option B: Manual deploy
```bash
npm install -g vercel
vercel login
vercel --prod
```

### Step 5: Set Environment Variables in Vercel

Go to your Vercel project → **Settings** → **Environment Variables**, and add:

| Variable | Value | Example |
|----------|-------|---------|
| `GITHUB_TOKEN` | Your GitHub PAT | `ghp_xxxx...` |
| `GITHUB_OWNER` | Your GitHub username | `rahulsingh` |
| `GITHUB_REPO` | Storage repo name | `job-postings-india` |
| `CRON_SECRET` | Random secret string | `abc123xyz...` |

> Generate a secret: run `openssl rand -hex 32` in terminal

### Step 6: Verify

After deploying, visit:
```
https://your-project.vercel.app/api/status
```

You should see:
```json
{
  "status": "running",
  "today": "2025-01-15",
  "totalPostsToday": 0,
  "targetPostsPerDay": 25000,
  "batchesComplete": 0,
  "totalBatches": 24,
  ...
}
```

---

## 📁 GitHub Output Structure

```
job-postings-india/
└── jobs/
    └── 2025-01-15/
        ├── daily-summary.json          ← Progress tracker
        ├── batch-00-index.json         ← Batch 0 index (midnight)
        ├── batch-01-index.json         ← Batch 1 index (1 AM)
        ├── ...
        ├── tata-consultancy-services/
        │   ├── tata-consultancy-services-software-engineer-mumbai-2025-01-15-0.json
        │   ├── tata-consultancy-services-senior-software-engineer-delhi-2025-01-15-1.json
        │   ├── tata-consultancy-services-full-stack-developer-bengaluru-2025-01-15-2.json
        │   ├── tata-consultancy-services-devops-engineer-hyderabad-2025-01-15-3.json
        │   └── tata-consultancy-services-data-scientist-pune-2025-01-15-4.json
        ├── infosys/
        │   └── ... (5 posts)
        └── ... (4,998 more companies)
```

---

## 📋 Sample JSON-LD Output

```json
{
  "@context": "https://schema.org",
  "@type": "JobPosting",
  "title": "Hiring Software Engineer at Tata Consultancy Services",
  "description": "TCS is actively seeking a talented Software Engineer...",
  "datePosted": "2025-01-15",
  "validThrough": "2025-02-14",
  "employmentType": "FULL_TIME",
  "hiringOrganization": {
    "@type": "Organization",
    "name": "Tata Consultancy Services"
  },
  "jobLocation": {
    "@type": "Place",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Mumbai",
      "addressRegion": "Maharashtra",
      "addressCountry": "IN"
    }
  },
  "baseSalary": {
    "@type": "MonetaryAmount",
    "currency": "INR",
    "value": {
      "@type": "QuantitativeValue",
      "minValue": 700000,
      "maxValue": 1500000,
      "unitText": "YEAR"
    }
  },
  "applicantLocationRequirements": {
    "@type": "Country",
    "name": "India"
  },
  "skills": "JavaScript, Python, React, Node.js, AWS, Docker",
  "industry": "technology"
}
```

---

## 🔧 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/status` | GET | View today's progress |
| `/api/cron/generate` | GET | Auto-triggered every hour by Vercel |
| `/api/trigger` | POST | Manually trigger a batch |

### Manual Trigger (POST `/api/trigger`)
```bash
curl -X POST https://your-project.vercel.app/api/trigger \
  -H "Content-Type: application/json" \
  -d '{"secret": "your-cron-secret", "batchIndex": 0}'
```

---

## 🏭 Industries Covered

| Industry | Companies |
|----------|-----------|
| Technology | TCS, Infosys, Wipro, Google, Amazon... |
| Finance | HDFC, ICICI, SBI, Zerodha, Razorpay... |
| Healthcare | Apollo, Cipla, Sun Pharma, Practo... |
| E-commerce | Flipkart, Myntra, Nykaa, Meesho... |
| Manufacturing | Tata Steel, Mahindra, Maruti Suzuki... |
| Education | Byju's, Unacademy, IITs, IIMs... |
| Retail | Reliance, DMart, Shoppers Stop... |
| Real Estate | DLF, Godrej, Lodha, NoBroker... |
| Logistics | Delhivery, Blue Dart, DHL, DTDC... |
| Hospitality | Taj Hotels, OYO, Air India, Zomato... |

---

## ⚠️ Vercel Plan Notes

| Feature | Hobby (Free) | Pro ($20/mo) |
|---------|-------------|--------------|
| Cron jobs | 1/day only | ✅ Every hour |
| Function timeout | 10 seconds | ✅ 60 seconds |
| **Recommendation** | ❌ Not enough | ✅ Required |

> **You need Vercel Pro** for hourly cron jobs. At $20/month, it's worth it for 25,000 posts/day.

---

## 🧪 Test Locally

```bash
# Preview generated posts without committing to GitHub
node scripts/test-generate.js
```

---

## 📅 Cron Schedule

The cron runs **every hour at minute 0** (IST):
- Batch 0: 12:00 AM IST (~1,042 posts)
- Batch 1: 1:00 AM IST (~1,042 posts)
- ...
- Batch 23: 11:00 PM IST (~1,042 posts)
- **Total: 25,000 posts by midnight each day**

---

## 🛠️ Customization

### Add more companies
Edit `lib/companies.js` → add to any industry's `companies` array.

### Add more job titles
Edit `lib/templateEngine.js` → add to the `TITLE_PREFIXES`, `TITLE_SUFFIXES`, or role lists.

### Change posting frequency
Edit `vercel.json` → change the cron schedule.

### Add more cities
Edit `lib/templateEngine.js` → add to `INDIA_LOCATIONS` array.
