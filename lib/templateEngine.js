// Template-based job content generator
// Produces 25,000 unique posts/day with varied keywords and descriptions

const INDIA_LOCATIONS = [
  { city: "Mumbai", state: "Maharashtra", region: "Western India" },
  { city: "Delhi", state: "Delhi", region: "Northern India" },
  { city: "Bengaluru", state: "Karnataka", region: "Southern India" },
  { city: "Hyderabad", state: "Telangana", region: "Southern India" },
  { city: "Chennai", state: "Tamil Nadu", region: "Southern India" },
  { city: "Kolkata", state: "West Bengal", region: "Eastern India" },
  { city: "Pune", state: "Maharashtra", region: "Western India" },
  { city: "Ahmedabad", state: "Gujarat", region: "Western India" },
  { city: "Jaipur", state: "Rajasthan", region: "Northern India" },
  { city: "Surat", state: "Gujarat", region: "Western India" },
  { city: "Lucknow", state: "Uttar Pradesh", region: "Northern India" },
  { city: "Kanpur", state: "Uttar Pradesh", region: "Northern India" },
  { city: "Nagpur", state: "Maharashtra", region: "Western India" },
  { city: "Indore", state: "Madhya Pradesh", region: "Central India" },
  { city: "Thane", state: "Maharashtra", region: "Western India" },
  { city: "Bhopal", state: "Madhya Pradesh", region: "Central India" },
  { city: "Visakhapatnam", state: "Andhra Pradesh", region: "Southern India" },
  { city: "Pimpri-Chinchwad", state: "Maharashtra", region: "Western India" },
  { city: "Patna", state: "Bihar", region: "Eastern India" },
  { city: "Vadodara", state: "Gujarat", region: "Western India" },
  { city: "Ghaziabad", state: "Uttar Pradesh", region: "Northern India" },
  { city: "Ludhiana", state: "Punjab", region: "Northern India" },
  { city: "Agra", state: "Uttar Pradesh", region: "Northern India" },
  { city: "Nashik", state: "Maharashtra", region: "Western India" },
  { city: "Faridabad", state: "Haryana", region: "Northern India" },
  { city: "Meerut", state: "Uttar Pradesh", region: "Northern India" },
  { city: "Rajkot", state: "Gujarat", region: "Western India" },
  { city: "Varanasi", state: "Uttar Pradesh", region: "Northern India" },
  { city: "Srinagar", state: "Jammu & Kashmir", region: "Northern India" },
  { city: "Aurangabad", state: "Maharashtra", region: "Western India" },
  { city: "Dhanbad", state: "Jharkhand", region: "Eastern India" },
  { city: "Amritsar", state: "Punjab", region: "Northern India" },
  { city: "Navi Mumbai", state: "Maharashtra", region: "Western India" },
  { city: "Allahabad", state: "Uttar Pradesh", region: "Northern India" },
  { city: "Ranchi", state: "Jharkhand", region: "Eastern India" },
  { city: "Howrah", state: "West Bengal", region: "Eastern India" },
  { city: "Coimbatore", state: "Tamil Nadu", region: "Southern India" },
  { city: "Jabalpur", state: "Madhya Pradesh", region: "Central India" },
  { city: "Gwalior", state: "Madhya Pradesh", region: "Central India" },
  { city: "Vijayawada", state: "Andhra Pradesh", region: "Southern India" },
  { city: "Jodhpur", state: "Rajasthan", region: "Northern India" },
  { city: "Madurai", state: "Tamil Nadu", region: "Southern India" },
  { city: "Raipur", state: "Chhattisgarh", region: "Central India" },
  { city: "Kochi", state: "Kerala", region: "Southern India" },
  { city: "Chandigarh", state: "Punjab", region: "Northern India" },
  { city: "Gurgaon", state: "Haryana", region: "Northern India" },
  { city: "Noida", state: "Uttar Pradesh", region: "Northern India" },
  { city: "Mysuru", state: "Karnataka", region: "Southern India" },
  { city: "Tiruchirappalli", state: "Tamil Nadu", region: "Southern India" },
  { city: "Bhubaneswar", state: "Odisha", region: "Eastern India" }
];

const ALL_COUNTRIES = [
  "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda",
  "Argentina", "Armenia", "Australia", "Austria", "Azerbaijan", "Bahamas", "Bahrain",
  "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan",
  "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria",
  "Burkina Faso", "Burundi", "Cabo Verde", "Cambodia", "Cameroon", "Canada",
  "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros",
  "Congo", "Costa Rica", "Croatia", "Cuba", "Cyprus", "Czech Republic",
  "Denmark", "Djibouti", "Dominica", "Dominican Republic", "Ecuador", "Egypt",
  "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini", "Ethiopia",
  "Fiji", "Finland", "France", "Gabon", "Gambia", "Georgia", "Germany", "Ghana",
  "Greece", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau", "Guyana", "Haiti",
  "Honduras", "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland",
  "Israel", "Italy", "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya", "Kiribati",
  "Kuwait", "Kyrgyzstan", "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya",
  "Liechtenstein", "Lithuania", "Luxembourg", "Madagascar", "Malawi", "Malaysia",
  "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius", "Mexico",
  "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique",
  "Myanmar", "Namibia", "Nauru", "Nepal", "Netherlands", "New Zealand", "Nicaragua",
  "Niger", "Nigeria", "North Korea", "North Macedonia", "Norway", "Oman", "Pakistan",
  "Palau", "Palestine", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines",
  "Poland", "Portugal", "Qatar", "Romania", "Russia", "Rwanda", "Saint Kitts and Nevis",
  "Saint Lucia", "Saint Vincent and the Grenadines", "Samoa", "San Marino",
  "Sao Tome and Principe", "Saudi Arabia", "Senegal", "Serbia", "Seychelles",
  "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia",
  "South Africa", "South Korea", "South Sudan", "Spain", "Sri Lanka", "Sudan",
  "Suriname", "Sweden", "Switzerland", "Syria", "Taiwan", "Tajikistan", "Tanzania",
  "Thailand", "Timor-Leste", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia",
  "Turkey", "Turkmenistan", "Tuvalu", "Uganda", "Ukraine", "United Arab Emirates",
  "United Kingdom", "United States", "Uruguay", "Uzbekistan", "Vanuatu", "Vatican City",
  "Venezuela", "Vietnam", "Yemen", "Zambia", "Zimbabwe"
];

const APPLICANT_LOCATION_REQUIREMENTS = ALL_COUNTRIES.map(country => ({
  "@type": "Country",
  "name": country
}));

const EXPERIENCE_LEVELS = [
  { label: "Fresher", min: 0, max: 1, qualifier: "Entry-Level" },
  { label: "Junior", min: 1, max: 3, qualifier: "Junior" },
  { label: "Mid-Level", min: 3, max: 6, qualifier: "Mid-Level" },
  { label: "Senior", min: 6, max: 10, qualifier: "Senior" },
  { label: "Lead", min: 10, max: 15, qualifier: "Lead" },
  { label: "Principal", min: 12, max: 20, qualifier: "Principal" }
];

const SALARY_RANGES = {
  fresher: { min: 250000, max: 600000, label: "2.5 LPA - 6 LPA" },
  junior: { min: 400000, max: 900000, label: "4 LPA - 9 LPA" },
  midLevel: { min: 700000, max: 1500000, label: "7 LPA - 15 LPA" },
  senior: { min: 1200000, max: 2500000, label: "12 LPA - 25 LPA" },
  lead: { min: 2000000, max: 4000000, label: "20 LPA - 40 LPA" },
  principal: { min: 3500000, max: 7000000, label: "35 LPA - 70 LPA" }
};

const JOB_TYPES = ["Full-time", "Part-time", "Contract", "Temporary", "Internship"];

const WORK_MODES = [
  { mode: "On-site", remote: false, desc: "Work from our office" },
  { mode: "Remote", remote: true, desc: "Work from anywhere in India" },
  { mode: "Hybrid", remote: false, desc: "Flexible work-from-home and office" }
];

const TITLE_PREFIXES = [
  "Hiring", "Looking for", "Urgent Opening", "Walk-in Drive",
  "Immediate Requirement", "Opening for", "Vacancy for",
  "Job Opening", "Career Opportunity", "Now Hiring"
];

const TITLE_SUFFIXES = [
  "- Apply Now", "- Immediate Joiners Preferred", "- Multiple Openings",
  "- Freshers Welcome", "- Experienced Professionals", "- Top MNC",
  "- Growth Opportunity", "- Attractive Package", "- Work From Home Available",
  "- 2025 Hiring Drive"
];

const DESCRIPTION_INTROS = [
  (company, role, city) => `${company} is actively seeking a talented and motivated ${role} to join our dynamic team in ${city}. This is an excellent opportunity for professionals who are passionate about making a real impact in a fast-growing organization.`,
  (company, role, city) => `We at ${company} are looking for an experienced ${role} based out of ${city}. If you are a result-oriented professional with a passion for excellence, we want to hear from you.`,
  (company, role, city) => `${company} has an exciting opening for a ${role} at our ${city} office. Join a company that values innovation, collaboration, and continuous learning.`,
  (company, role, city) => `Are you a skilled ${role} looking for your next big career move? ${company} in ${city} offers you the perfect platform to grow professionally and personally.`,
  (company, role, city) => `${company}, one of India's leading organizations, is hiring a ${role} for our ${city} operations. We offer a competitive salary package along with world-class benefits.`,
  (company, role, city) => `An exciting career opportunity awaits you at ${company}. We are on the lookout for a dedicated ${role} to strengthen our ${city}-based team.`,
  (company, role, city) => `Join the ${company} family as a ${role} in ${city}. We believe in empowering our employees with the tools, training, and environment they need to succeed.`,
  (company, role, city) => `${company} invites applications from qualified candidates for the position of ${role} at our ${city} location. This role offers excellent career advancement prospects.`,
  (company, role, city) => `Grow your career with ${company}! We are hiring a ${role} for our ${city} team. Be part of a workplace that celebrates innovation, diversity, and performance.`,
  (company, role, city) => `If you're a passionate ${role} with drive and ambition, ${company} in ${city} is the place for you. We're growing fast and need talented people to grow with us.`
];

const RESPONSIBILITY_POOLS = {
  technology: [
    "Design, develop and maintain scalable software applications",
    "Write clean, maintainable, and well-documented code",
    "Participate in code reviews and contribute to technical discussions",
    "Collaborate with cross-functional teams including product, design, and QA",
    "Troubleshoot, debug, and resolve software defects and performance issues",
    "Implement new features based on product requirements",
    "Optimize application performance and ensure high availability",
    "Work with agile methodologies including daily stand-ups and sprint planning",
    "Integrate third-party APIs and services",
    "Contribute to system architecture and technical design decisions",
    "Mentor junior developers and conduct knowledge-sharing sessions",
    "Ensure code security and follow best practices for data protection",
    "Deploy and manage applications on cloud platforms like AWS, Azure, or GCP",
    "Write and execute unit tests and integration tests",
    "Participate in on-call rotation for production support"
  ],
  finance: [
    "Prepare and analyze financial statements, reports, and budgets",
    "Monitor financial performance against targets and provide variance analysis",
    "Manage accounts payable and accounts receivable functions",
    "Ensure compliance with tax regulations and statutory requirements",
    "Coordinate with external auditors during annual audits",
    "Manage credit risk assessment and loan appraisal processes",
    "Develop financial models and projections for business planning",
    "Implement and maintain internal controls and audit procedures",
    "Prepare MIS reports for senior management review",
    "Monitor market trends and provide investment recommendations",
    "Maintain general ledger and ensure accurate bookkeeping",
    "Process payroll and manage employee reimbursements",
    "Conduct due diligence for mergers, acquisitions, and investments",
    "Liaise with banks, regulators, and financial institutions",
    "Prepare annual reports and investor presentations"
  ],
  healthcare: [
    "Provide high-quality patient care and maintain patient records",
    "Diagnose and treat medical conditions following established protocols",
    "Coordinate with multidisciplinary teams for comprehensive patient management",
    "Administer medications and treatments as prescribed",
    "Monitor patient progress and adjust treatment plans accordingly",
    "Maintain sterile environments and follow infection control protocols",
    "Conduct routine health assessments and screenings",
    "Educate patients and families on health management and disease prevention",
    "Respond to medical emergencies and provide immediate care",
    "Participate in quality improvement initiatives and clinical audits",
    "Maintain accurate clinical documentation in electronic health records",
    "Collaborate with pharmaceutical representatives and medical suppliers",
    "Attend continuing medical education programs and training",
    "Adhere to NABH/JCI accreditation standards",
    "Ensure patient privacy and maintain confidentiality"
  ],
  ecommerce: [
    "Manage product listings, pricing, and promotions on the platform",
    "Analyze sales data and customer behavior to drive revenue growth",
    "Coordinate with vendors and suppliers for inventory management",
    "Execute digital marketing campaigns across Google, Meta, and other channels",
    "Optimize product pages for search visibility and conversion",
    "Manage customer reviews, ratings, and return/refund processes",
    "Track key performance indicators including GMV, conversion rate, and ROI",
    "Collaborate with logistics partners to ensure timely delivery",
    "Develop and implement category growth strategies",
    "Manage marketplace relationships with Amazon, Flipkart, and Meesho",
    "Conduct competitor analysis and market benchmarking",
    "Build and maintain affiliate and influencer marketing programs",
    "Create engaging content for product pages and social media",
    "Manage email marketing campaigns and push notifications",
    "Monitor and improve Net Promoter Score (NPS) and customer satisfaction"
  ],
  manufacturing: [
    "Oversee daily production operations to meet output targets",
    "Ensure product quality meets internal and customer specifications",
    "Implement lean manufacturing and continuous improvement initiatives",
    "Monitor equipment performance and coordinate preventive maintenance",
    "Maintain accurate production records and prepare daily reports",
    "Ensure compliance with safety regulations and factory acts",
    "Manage raw material procurement and inventory levels",
    "Coordinate with design and engineering teams on product improvements",
    "Train and supervise shop floor workers and supervisors",
    "Conduct root cause analysis for quality rejections and defects",
    "Implement 5S, Kaizen, and Six Sigma practices on the shop floor",
    "Manage supplier quality audits and vendor development",
    "Prepare production cost analysis and efficiency reports",
    "Coordinate with logistics for dispatching finished goods",
    "Ensure environmental compliance and waste management"
  ],
  education: [
    "Develop and deliver engaging lesson plans for students",
    "Create curriculum-aligned learning materials and assessments",
    "Monitor student progress and provide timely feedback",
    "Conduct parent-teacher meetings and update parents on student performance",
    "Maintain classroom discipline and create a positive learning environment",
    "Participate in school events, workshops, and training programs",
    "Utilize technology and digital tools to enhance learning outcomes",
    "Design formative and summative assessments aligned to learning objectives",
    "Support students with special educational needs",
    "Collaborate with faculty on curriculum development initiatives",
    "Maintain student records and prepare progress reports",
    "Conduct doubt-clearing sessions and remedial classes for weak students",
    "Coordinate with academic counselors for student career guidance",
    "Participate in teacher training and professional development programs",
    "Contribute to school newsletter, blogs, and other publications"
  ],
  retail: [
    "Manage store operations to ensure smooth daily functioning",
    "Achieve sales targets and improve store performance metrics",
    "Ensure visual merchandising standards are maintained at all times",
    "Handle customer queries, complaints, and escalations effectively",
    "Monitor inventory levels and coordinate replenishment activities",
    "Train and motivate the sales team to deliver excellent service",
    "Implement promotional activities and in-store campaigns",
    "Conduct regular stock audits and prevent pilferage",
    "Maintain high standards of store hygiene and cleanliness",
    "Build relationships with regular customers to drive loyalty",
    "Prepare daily sales reports and share insights with management",
    "Coordinate with the supply chain team for timely stock delivery",
    "Manage shrinkage and reduce stock discrepancies",
    "Ensure compliance with company policies and retail regulations",
    "Assist in recruiting, onboarding, and performance management of staff"
  ],
  realestate: [
    "Source and close property deals with prospective buyers and investors",
    "Conduct site visits and property presentations for clients",
    "Negotiate pricing, terms, and conditions on behalf of clients",
    "Maintain a pipeline of qualified leads using CRM software",
    "Provide advisory services on property investment and market trends",
    "Coordinate with legal teams for documentation and title verification",
    "Build relationships with channel partners and brokers",
    "Achieve monthly and quarterly sales targets",
    "Conduct market research and provide competitive analysis",
    "Manage relationships with existing customers post-purchase",
    "Liaise with banks and NBFCs for home loan assistance to customers",
    "Prepare presentations and proposals for institutional clients",
    "Conduct land acquisition due diligence and feasibility studies",
    "Manage RERA documentation and compliance requirements",
    "Coordinate with architects, contractors, and project teams"
  ],
  logistics: [
    "Oversee end-to-end logistics operations for timely delivery",
    "Manage a fleet of vehicles and coordinate with drivers",
    "Optimize delivery routes to reduce cost and improve efficiency",
    "Track shipments in real-time and resolve delivery exceptions",
    "Coordinate with warehousing teams for inbound and outbound operations",
    "Manage relationships with third-party logistics providers",
    "Ensure compliance with transportation regulations and safety standards",
    "Prepare MIS reports on delivery performance and SLA adherence",
    "Handle customs clearance for import and export shipments",
    "Implement warehouse management systems (WMS) and track KPIs",
    "Conduct periodic vendor audits and evaluate logistics partners",
    "Manage reverse logistics and return merchandise authorization",
    "Coordinate with customer service teams to resolve delivery issues",
    "Implement cost-saving initiatives in transportation and warehousing",
    "Ensure proper handling, packaging, and labeling of goods"
  ],
  hospitality: [
    "Deliver exceptional guest experiences in line with brand standards",
    "Manage front office operations including check-in/check-out",
    "Coordinate housekeeping and maintenance for room readiness",
    "Handle guest complaints and resolve issues promptly",
    "Plan and execute banquets, events, and MICE functions",
    "Monitor F&B service quality and maintain hygiene standards",
    "Manage reservations and optimize room revenue through yield management",
    "Train and supervise front-line staff on service standards",
    "Conduct regular guest satisfaction surveys and implement improvements",
    "Manage procurement of hotel supplies and control operating costs",
    "Coordinate with travel agents and OTAs for occupancy optimization",
    "Prepare daily operating reports and present to management",
    "Ensure compliance with FSSAI, health, and safety regulations",
    "Develop and maintain relationships with corporate clients",
    "Assist in menu planning, costing, and food festival coordination"
  ]
};

const QUALIFICATION_POOL = [
  "Bachelor's degree in a relevant field",
  "Master's degree preferred",
  "B.Tech / B.E. in Computer Science or related discipline",
  "MBA from a recognized university",
  "CA / CMA / CFA certification",
  "B.Sc / M.Sc in Life Sciences",
  "B.Com / M.Com / MBA Finance",
  "B.Ed / M.Ed from a recognized institution",
  "Diploma or Degree in Hospitality Management",
  "Any graduate with relevant experience",
  "Post Graduate Diploma in relevant field",
  "Chartered Accountant (ICAI)",
  "MBBS / MD / MS from recognized medical college",
  "BPharm / MPharm / PharmD",
  "B.Arch / M.Arch from recognized institution"
];

const SKILLS_BY_INDUSTRY = {
  technology: ["JavaScript", "Python", "Java", "React", "Node.js", "AWS", "Docker", "Kubernetes", "SQL", "MongoDB", "Git", "Agile/Scrum", "REST APIs", "Microservices", "CI/CD", "TypeScript", "Go", "Rust", "Machine Learning", "TensorFlow"],
  finance: ["Financial Modeling", "MS Excel", "Tally", "SAP FICO", "Bloomberg Terminal", "Risk Management", "Credit Analysis", "IFRS", "Ind AS", "GST", "Income Tax", "QuickBooks", "Power BI", "Python for Finance", "VBA", "SQL", "Financial Reporting", "Budgeting", "Forecasting", "Due Diligence"],
  healthcare: ["Patient Care", "Clinical Documentation", "EMR/EHR", "Medical Coding", "ICD-10", "CPT Codes", "NABH Standards", "BLS/ACLS", "Pharmacovigilance", "Clinical Research", "Medical Terminology", "Diagnostic Skills", "Surgical Procedures", "ICU Management", "Wound Care", "Infection Control", "Medical Ethics", "Telemedicine", "Health Informatics", "HIPAA Compliance"],
  ecommerce: ["Google Analytics", "Facebook Ads", "SEO/SEM", "CRM Software", "MS Excel", "Product Management", "A/B Testing", "Supply Chain", "Shopify", "WooCommerce", "Magento", "Digital Marketing", "Content Writing", "Email Marketing", "Affiliate Marketing", "Performance Marketing", "Data Analytics", "Customer Segmentation", "Retention Marketing", "Influencer Marketing"],
  manufacturing: ["AutoCAD", "SolidWorks", "SAP MM/PP", "Lean Manufacturing", "Six Sigma", "ISO 9001", "5S", "Kaizen", "TPM", "PLC/SCADA", "Quality Control", "GD&T", "FMEA", "PPAP", "APQP", "Project Management", "Root Cause Analysis", "Statistical Process Control", "ERP Systems", "Supply Chain Management"],
  education: ["Curriculum Development", "Lesson Planning", "Classroom Management", "Student Assessment", "Educational Technology", "LMS Platforms", "Content Creation", "Pedagogy", "Child Psychology", "Special Education", "E-learning", "Zoom/Teams", "MS Office", "CBSE/ICSE Standards", "IB Curriculum", "Communication Skills", "Mentoring", "Research Skills", "Data Analysis", "Bloom's Taxonomy"],
  retail: ["Retail Operations", "Visual Merchandising", "POS Systems", "Inventory Management", "Customer Service", "Sales Techniques", "CRM", "SAP Retail", "MS Excel", "Loss Prevention", "Supply Chain", "Category Management", "Planogram", "Shrinkage Control", "Team Leadership", "KPI Management", "Retail Analytics", "Omnichannel Retail", "E-commerce Integration", "Loyalty Programs"],
  realestate: ["Property Valuation", "Real Estate Law", "RERA Compliance", "CRM Software", "AutoCAD", "MS Office", "Financial Modeling", "Market Research", "Negotiation Skills", "Contract Management", "Project Management", "GIS Tools", "Property Management", "Lease Administration", "Due Diligence", "Title Search", "Investment Analysis", "Portfolio Management", "Client Relationship Management", "Sales Techniques"],
  logistics: ["Supply Chain Management", "SAP SCM", "WMS", "TMS", "Route Optimization", "Fleet Management", "Customs Clearance", "Freight Forwarding", "INCOTERMS", "Inventory Management", "Cold Chain Logistics", "Last Mile Delivery", "Reverse Logistics", "MS Excel", "Data Analytics", "ERP Systems", "Vendor Management", "3PL Management", "KPI Monitoring", "GPS Tracking Systems"],
  hospitality: ["Hotel Management", "Front Office", "PMS Systems", "Revenue Management", "F&B Service", "Event Management", "Customer Relations", "HACCP", "Food Safety", "Opera PMS", "OTA Management", "Yield Management", "Housekeeping Standards", "Sommelier Skills", "Barista Skills", "Tour Planning", "Travel Management", "MICE", "Crisis Management", "GDS Systems"]
};

const BENEFITS = [
  "Competitive salary with performance-linked incentives",
  "Comprehensive health insurance for self and family",
  "Provident Fund and Gratuity as per company policy",
  "Annual paid leaves and casual leaves",
  "Professional development and training programs",
  "Flexible working hours",
  "Employee stock options (ESOPs) for eligible roles",
  "Work-from-home flexibility",
  "Meal coupons and food allowance",
  "Transportation and conveyance allowance",
  "Mobile and internet reimbursement",
  "Annual performance appraisal",
  "Referral bonus program",
  "Life and accident insurance",
  "Maternity and paternity leave",
  "International travel opportunities for senior roles",
  "Learning & development budget",
  "Company-sponsored certifications",
  "Recognition and rewards programs",
  "Modern office with recreational facilities"
];

// Deterministic seeded random to ensure uniqueness per day+company+post combination
function seededRandom(seed) {
  let s = seed;
  return function () {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 4294967296;
  };
}

function pickN(arr, n, rand) {
  const shuffled = [...arr].sort(() => rand() - 0.5);
  return shuffled.slice(0, n);
}

function pick(arr, rand) {
  return arr[Math.floor(rand() * arr.length)];
}

function generateUniqueTitle(company, role, postIndex, dateSeed) {
  const rand = seededRandom(dateSeed + company.id * 7 + postIndex * 13);

  const templates = [
    () => `${pick(TITLE_PREFIXES, rand)} ${role} at ${company.name}`,
    () => `${role} - ${company.name} ${pick(TITLE_SUFFIXES, rand)}`,
    () => `${company.name} is Hiring: ${role} (${pick(EXPERIENCE_LEVELS, rand).qualifier})`,
    () => `${role} Vacancy at ${company.name} - ${new Date().getFullYear()} Batch`,
    () => `${pick(EXPERIENCE_LEVELS, rand).qualifier} ${role} at ${company.name}`,
    () => `${company.name} ${company.industry.charAt(0).toUpperCase() + company.industry.slice(1)} Jobs: ${role}`,
    () => `${role} (${pick(WORK_MODES, rand).mode}) - ${company.name}`,
    () => `Apply Now: ${role} Position at ${company.name}`,
    () => `${company.name} Career Opportunity: ${role} - India`,
    () => `${role} Job in India | ${company.name} Recruitment ${new Date().getFullYear()}`
  ];

  return templates[postIndex % templates.length]();
}

function generateDescription(company, role, location, expLevel, workMode, skills, dateSeed, postIndex) {
  const rand = seededRandom(dateSeed + company.id * 11 + postIndex * 17);

  const introFn = DESCRIPTION_INTROS[Math.floor(rand() * DESCRIPTION_INTROS.length)];
  const intro = introFn(company.name, role, location.city);

  const responsibilities = pickN(RESPONSIBILITY_POOLS[company.industry] || RESPONSIBILITY_POOLS.technology, 7, rand);
  const selectedSkills = pickN(skills, 8, rand);
  const selectedBenefits = pickN(BENEFITS, 6, rand);
  const qualification = pick(QUALIFICATION_POOL, rand);
  const salaryKey = Object.keys(SALARY_RANGES)[expLevel.label === "Fresher" ? 0 : expLevel.label === "Junior" ? 1 : expLevel.label === "Mid-Level" ? 2 : expLevel.label === "Senior" ? 3 : expLevel.label === "Lead" ? 4 : 5];
  const salary = SALARY_RANGES[salaryKey];

  return {
    intro,
    responsibilities,
    skills: selectedSkills,
    benefits: selectedBenefits,
    qualification,
    salary,
    expLevel,
    workMode,
    location
  };
}

function generateJobPosting(company, postIndex, dateStr) {
  const dateSeed = dateStr.split("-").join("") * 1 + postIndex;
  const rand = seededRandom(dateSeed + company.id * 31 + postIndex * 19);

  const roles = company.roles;
  const role = roles[postIndex % roles.length];
  const location = pick(INDIA_LOCATIONS, rand);
  const expLevel = pick(EXPERIENCE_LEVELS, rand);
  const workMode = pick(WORK_MODES, rand);
  const jobType = pick(JOB_TYPES, rand);
  const skills = SKILLS_BY_INDUSTRY[company.industry] || SKILLS_BY_INDUSTRY.technology;

  const title = generateUniqueTitle(company, role, postIndex, dateSeed);
  const content = generateDescription(company, role, location, expLevel, workMode, skills, dateSeed, postIndex);

  const salaryKey = ["fresher", "junior", "midLevel", "senior", "lead", "principal"][
    ["Fresher", "Junior", "Mid-Level", "Senior", "Lead", "Principal"].indexOf(expLevel.label)
  ];
  const salary = SALARY_RANGES[salaryKey];

  const postDate = new Date(dateStr);
  const validThrough = new Date(postDate);
  validThrough.setDate(validThrough.getDate() + 30);

  // Unique slug
  const slug = `${company.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${role.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${location.city.toLowerCase()}-${dateStr}-${postIndex}`;

  // JSON-LD JobPosting Schema
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    "title": title,
    "description": buildFullDescription(content, company, role),
    "identifier": {
      "@type": "PropertyValue",
      "name": company.name,
      "value": `${company.id}-${postIndex}-${dateStr.replace(/-/g, "")}`
    },
    "datePosted": dateStr,
    "validThrough": validThrough.toISOString().split("T")[0],
    "employmentType": jobType.toUpperCase().replace(/-/g, "_"),
    "hiringOrganization": {
      "@type": "Organization",
      "name": company.name,
      "sameAs": `https://www.google.com/search?q=${encodeURIComponent(company.name)}`,
      "logo": `https://logo.clearbit.com/${company.name.toLowerCase().replace(/[^a-z0-9]/g, "")}.com`
    },
    "jobLocation": {
      "@type": "Place",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": `${company.name} Office`,
        "addressLocality": location.city,
        "addressRegion": location.state,
        "addressCountry": "IN"
      }
    },
    "baseSalary": {
      "@type": "MonetaryAmount",
      "currency": "INR",
      "value": {
        "@type": "QuantitativeValue",
        "minValue": salary.min,
        "maxValue": salary.max,
        "unitText": "YEAR"
      }
    },
    "jobLocationType": workMode.remote ? "TELECOMMUTE" : undefined,
    "applicantLocationRequirements": APPLICANT_LOCATION_REQUIREMENTS,
    "experienceRequirements": {
      "@type": "OccupationalExperienceRequirements",
      "monthsOfExperience": expLevel.min * 12
    },
    "educationRequirements": {
      "@type": "EducationalOccupationalCredential",
      "credentialCategory": content.qualification
    },
    "skills": content.skills.join(", "),
    "responsibilities": content.responsibilities.join(". "),
    "benefits": content.benefits.join(". "),
    "industry": company.industry,
    "occupationalCategory": role,
    "workHours": "40 hours per week",
    "jobBenefits": content.benefits.join(", ")
  };

  // Remove undefined values
  Object.keys(jsonLd).forEach(k => jsonLd[k] === undefined && delete jsonLd[k]);

  return {
    slug,
    title,
    company: company.name,
    industry: company.industry,
    role,
    location,
    workMode: workMode.mode,
    jobType,
    experience: `${expLevel.min}-${expLevel.max} years`,
    salary: salary.label,
    skills: content.skills,
    datePosted: dateStr,
    validThrough: validThrough.toISOString().split("T")[0],
    jsonLd,
    meta: {
      description: content.intro.substring(0, 160),
      keywords: `${role}, ${company.name}, jobs in ${location.city}, ${location.state} jobs, ${company.industry} jobs India, ${content.skills.slice(0, 3).join(", ")}, hiring ${new Date().getFullYear()}`
    }
  };
}

function buildFullDescription(content, company, role) {
  return `
${content.intro}

About ${company.name}:
${company.name} is a leading organization in the ${content.workMode.desc ? content.workMode.mode : "industry"} sector, committed to excellence, innovation, and employee growth. We offer a dynamic work environment where talent is recognized and rewarded.

Key Responsibilities:
${content.responsibilities.map(r => `• ${r}`).join("\n")}

Required Skills & Qualifications:
• ${content.qualification}
• ${content.expLevel.min}-${content.expLevel.max} years of relevant experience
${content.skills.map(s => `• Proficiency in ${s}`).join("\n")}

Work Mode: ${content.workMode.mode} - ${content.workMode.desc}

What We Offer:
${content.benefits.map(b => `• ${b}`).join("\n")}
• Salary Range: ${content.salary.label} per annum

Location: ${content.location.city}, ${content.location.state}, India

If you are excited about this opportunity, apply now and take the next step in your career journey with ${company.name}!
  `.trim();
}

export { generateJobPosting, INDIA_LOCATIONS };
