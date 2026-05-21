// scripts/test-generate.js
// Run locally: node scripts/test-generate.js
// Shows a preview of 5 posts for the first company

import { generateCompanies } from "../lib/companies.js";
import { generateJobPosting } from "../lib/templateEngine.js";

const companies = generateCompanies();
console.log(`✅ Total companies loaded: ${companies.length}`);
console.log(`📊 Industry breakdown:`);

const byIndustry = {};
for (const c of companies) {
  byIndustry[c.industry] = (byIndustry[c.industry] || 0) + 1;
}
for (const [ind, count] of Object.entries(byIndustry)) {
  console.log(`   ${ind}: ${count} companies`);
}

const dateStr = new Date().toISOString().split("T")[0];
console.log(`\n📅 Generating sample posts for ${dateStr}...\n`);

// Show 5 posts for the first company
const company = companies[0];
console.log(`🏢 Company: ${company.name} (${company.industry})\n`);

for (let i = 0; i < 5; i++) {
  const post = generateJobPosting(company, i, dateStr);
  console.log(`--- Post ${i + 1} ---`);
  console.log(`📌 Title:    ${post.title}`);
  console.log(`💼 Role:     ${post.role}`);
  console.log(`📍 Location: ${post.location.city}, ${post.location.state}`);
  console.log(`💰 Salary:   ${post.salary}`);
  console.log(`🏠 Mode:     ${post.workMode}`);
  console.log(`🔑 Skills:   ${post.skills.slice(0, 4).join(", ")}`);
  console.log(`📁 File:     jobs/${dateStr}/${company.name.substring(0,20)}/${post.slug.substring(0,40)}...json`);
  console.log(`\nJSON-LD Schema Preview:`);
  console.log(JSON.stringify(post.jsonLd, null, 2).substring(0, 400) + "...\n");
}

// Stats
console.log(`\n📈 Daily Stats:`);
console.log(`   Companies:           ${companies.length.toLocaleString()}`);
console.log(`   Posts per company:   5`);
console.log(`   Total daily posts:   ${(companies.length * 5).toLocaleString()}`);
console.log(`   Cron runs per day:   24 (every hour)`);
console.log(`   Posts per batch:     ~${Math.ceil((companies.length * 5) / 24).toLocaleString()}`);
console.log(`   Companies per batch: ~${Math.ceil(companies.length / 24).toLocaleString()}`);
