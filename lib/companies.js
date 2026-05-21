// 5000 companies generated from real Indian & global companies operating in India
// Structured by industry sector for diverse job postings

const INDUSTRIES = {
  technology: {
    companies: [
      "Tata Consultancy Services", "Infosys", "Wipro", "HCL Technologies", "Tech Mahindra",
      "Cognizant", "Accenture India", "IBM India", "Oracle India", "Microsoft India",
      "Google India", "Amazon India", "Flipkart", "Paytm", "Zomato",
      "Swiggy", "Ola Cabs", "Byju's", "Razorpay", "PhonePe",
      "MakeMyTrip", "IndiaMart", "Naukri.com", "Freshworks", "Zoho Corporation",
      "Mphasis", "Hexaware Technologies", "L&T Infotech", "Mindtree", "NIIT Technologies",
      "Persistent Systems", "Mastech Holdings", "Cyient", "Sonata Software", "Sasken Technologies",
      "KPIT Technologies", "Tata Elxsi", "Birlasoft", "Zensar Technologies", "ECIL",
      "Rackspace India", "VMware India", "SAP India", "Salesforce India", "Adobe India",
      "Intel India", "Qualcomm India", "Texas Instruments India", "Broadcom India", "Cisco India",
      "Dell India", "HP India", "Lenovo India", "Samsung R&D India", "LG Soft India",
      "Bosch India Software", "Siemens India", "ABB India", "Honeywell India", "Schneider Electric India",
      "Capgemini India", "Atos India", "CGI India", "DXC Technology India", "Unisys India",
      "Syntel India", "iGate India", "Patni Computer Systems", "NIIT", "Aptech",
      "CDAC", "ISRO", "DRDO", "BEL", "ECIL",
      "Netsol Technologies", "Saksoft", "Nucleus Software", "Newgen Software", "Kale Consultants",
      "Tata Communications", "BSNL", "Airtel India", "Jio Platforms", "Vodafone Idea",
      "Naukri", "Shaadi.com", "Quikr", "OLX India", "Cars24",
      "PolicyBazaar", "BankBazaar", "Lendingkart", "Capital Float", "Indifi Technologies",
      "Urban Company", "NoBroker", "Housing.com", "99acres", "MagicBricks",
      "BigBasket", "Grofers", "Dunzo", "Milkbasket", "Nature's Basket",
      "Ninjacart", "AgroStar", "DeHaat", "Cropin", "FarmERP",
      "HealthifyMe", "Practo", "1mg", "PharmEasy", "Netmeds",
      "Docplexus", "mfine", "Lybrate", "iCliniq", "SigTuple",
      "Curefit", "Medlife", "Apollo Telehealth", "Narayana Health Digital", "Manipal Digital Health"
    ],
    roles: [
      "Software Engineer", "Senior Software Engineer", "Full Stack Developer", "Backend Developer",
      "Frontend Developer", "DevOps Engineer", "Cloud Architect", "Data Scientist",
      "Machine Learning Engineer", "AI Engineer", "Python Developer", "Java Developer",
      "Node.js Developer", "React Developer", "Angular Developer", "iOS Developer",
      "Android Developer", "QA Engineer", "Test Automation Engineer", "Security Engineer",
      "Network Engineer", "Database Administrator", "Solutions Architect", "Product Manager",
      "Scrum Master", "Business Analyst", "UI/UX Designer", "System Administrator",
      "Site Reliability Engineer", "Blockchain Developer"
    ]
  },
  finance: {
    companies: [
      "State Bank of India", "HDFC Bank", "ICICI Bank", "Axis Bank", "Kotak Mahindra Bank",
      "Punjab National Bank", "Bank of Baroda", "Canara Bank", "Union Bank of India", "Bank of India",
      "IndusInd Bank", "Yes Bank", "Federal Bank", "RBL Bank", "South Indian Bank",
      "IDFC First Bank", "Bandhan Bank", "AU Small Finance Bank", "Equitas Small Finance Bank", "Ujjivan Small Finance Bank",
      "HDFC Life Insurance", "ICICI Prudential Life", "SBI Life Insurance", "Max Life Insurance", "Bajaj Allianz Life",
      "LIC", "New India Assurance", "United India Insurance", "Oriental Insurance", "National Insurance",
      "HDFC Ergo", "Bajaj Allianz General", "ICICI Lombard", "Star Health Insurance", "Niva Bupa",
      "Motilal Oswal", "Zerodha", "Groww", "Angel One", "ICICI Direct",
      "HDFC Securities", "Sharekhan", "5paisa", "Upstox", "Fyers",
      "Bajaj Finance", "Mahindra Finance", "L&T Finance", "Cholamandalam Finance", "Shriram Finance",
      "Muthoot Finance", "Manappuram Finance", "IIFL Finance", "Aditya Birla Finance", "Piramal Finance",
      "CRISIL", "ICRA", "Care Ratings", "India Ratings", "Acuite Ratings",
      "Deloitte India", "PwC India", "KPMG India", "EY India", "Grant Thornton India",
      "BSR & Co", "S.R. Batliboi", "Walker Chandiok", "Lodha & Co", "Haribhakti & Co",
      "NSE", "BSE", "MCX", "NSDL", "CDSL",
      "SEBI", "RBI", "NABARD", "SIDBI", "NHB",
      "PayU", "CCAvenue", "Instamojo", "Cashfree", "Juspay",
      "MobiKwik", "FreeCharge", "Paytm Money", "ET Money", "Scripbox"
    ],
    roles: [
      "Financial Analyst", "Senior Financial Analyst", "Credit Analyst", "Risk Analyst",
      "Investment Banker", "Portfolio Manager", "Relationship Manager", "Branch Manager",
      "Loan Officer", "Compliance Officer", "Audit Manager", "Tax Consultant",
      "Treasury Manager", "Equity Research Analyst", "Fixed Income Analyst", "Derivatives Trader",
      "Wealth Manager", "Insurance Advisor", "Actuary", "Chartered Accountant",
      "Chief Financial Officer", "Finance Manager", "Accounts Manager", "Payroll Manager",
      "Internal Auditor", "Forensic Accountant", "Mergers & Acquisitions Analyst", "Private Equity Analyst",
      "Venture Capital Analyst", "Financial Controller"
    ]
  },
  healthcare: {
    companies: [
      "Apollo Hospitals", "Fortis Healthcare", "Max Healthcare", "Manipal Hospitals", "Narayana Health",
      "Medanta", "Columbia Asia", "Aster DM Healthcare", "Care Hospitals", "Wockhardt Hospitals",
      "Sun Pharmaceutical", "Cipla", "Dr. Reddy's Laboratories", "Lupin", "Aurobindo Pharma",
      "Torrent Pharmaceuticals", "Zydus Lifesciences", "Alkem Laboratories", "Ipca Laboratories", "Abbott India",
      "Pfizer India", "GlaxoSmithKline India", "Novartis India", "Sanofi India", "AstraZeneca India",
      "Johnson & Johnson India", "Roche India", "Bayer India", "Merck India", "Boehringer Ingelheim India",
      "Biocon", "Piramal Pharma", "Divi's Laboratories", "Glenmark Pharmaceuticals", "Natco Pharma",
      "Suven Pharmaceuticals", "Granules India", "Laurus Labs", "Solara Active Pharma", "Neuland Laboratories",
      "Thyrocare", "SRL Diagnostics", "Dr Lal PathLabs", "Metropolis Healthcare", "Vijaya Diagnostics",
      "GE Healthcare India", "Siemens Healthineers India", "Philips India Healthcare", "Medtronic India", "BD India",
      "3M India Healthcare", "Becton Dickinson India", "Baxter India", "B.Braun India", "Stryker India",
      "AIIMS", "PGIMER", "CMC Vellore", "Tata Memorial Centre", "Rajiv Gandhi Cancer Institute",
      "Hinduja Healthcare", "Kokilaben Dhirubhai Ambani Hospital", "Lilavati Hospital", "Breach Candy Hospital", "Bombay Hospital",
      "Sankara Nethralaya", "Aravind Eye Hospital", "LV Prasad Eye Institute", "Shroff Eye Centre", "Drishti Eye Care",
      "Ruby Hall Clinic", "Sahyadri Hospitals", "Jupiter Hospital", "Symbiosis Hospital", "Deenanath Mangeshkar Hospital",
      "Jaypee Hospital", "BLK-Max Hospital", "Indraprastha Apollo", "AIIMS Delhi", "RML Hospital"
    ],
    roles: [
      "Medical Officer", "Senior Doctor", "Consultant Physician", "Surgeon", "Radiologist",
      "Pathologist", "Anesthesiologist", "Cardiologist", "Neurologist", "Oncologist",
      "Pediatrician", "Gynecologist", "Orthopedic Surgeon", "ENT Specialist", "Dermatologist",
      "Psychiatrist", "Physiotherapist", "Occupational Therapist", "Speech Therapist", "Dietitian",
      "Registered Nurse", "Staff Nurse", "ICU Nurse", "OT Nurse", "Nursing Supervisor",
      "Medical Lab Technician", "Radiology Technician", "Pharmacy Manager", "Clinical Pharmacist", "Medical Coder"
    ]
  },
  ecommerce: {
    companies: [
      "Amazon India", "Flipkart", "Myntra", "Snapdeal", "Meesho",
      "Nykaa", "Ajio", "Tata CLiQ", "Reliance Digital", "Croma",
      "Firstcry", "Babyoye", "Hopscotch", "Mothercare India", "Miniklub",
      "Pepperfry", "Urban Ladder", "Livspace", "HomeLane", "FurnitureMart",
      "Lenskart", "Titan Eyeplus", "GKB Opticals", "Vision Express India", "Specsmakers",
      "BigBasket", "Grofers", "JioMart", "Spencer's Retail", "More Retail",
      "Zomato", "Swiggy", "Dunzo", "BlinkIt", "Zepto",
      "ixigo", "Goibibo", "Yatra", "Cleartrip", "EaseMyTrip",
      "OYO Rooms", "Treebo Hotels", "FabHotels", "Zostel", "StayVista",
      "Rapido", "Porter", "Shiprocket", "Delhivery", "Ecom Express",
      "Blue Dart", "DTDC", "Xpressbees", "Shadowfax", "Rivigo",
      "CarDekho", "BikeDekho", "CarTrade", "Droom", "Cars24",
      "Shyaway", "Craftsvilla", "Jaypore", "Fabindia Online", "FabAlley",
      "Bewakoof", "Wrogn", "Puma India", "Adidas India", "Nike India",
      "Boat", "Noise", "Fire-Boltt", "Ambrane", "Zebronics",
      "Ustraa", "Bombay Shaving Company", "Mamaearth", "WOW Skin Science", "Plum",
      "Sugar Cosmetics", "MyGlamm", "Pilgrim", "Juicy Chemistry", "Just Herbs",
      "Licious", "Zappfresh", "FreshToHome", "Country Delight", "ID Fresh Food",
      "The Man Company", "Park Avenue", "Axe India", "Nivea India", "Dove India",
      "BlueStone", "CaratLane", "Melorra", "Voylla", "Dishis Designer Jewellery"
    ],
    roles: [
      "Category Manager", "Marketplace Manager", "E-commerce Executive", "Digital Marketing Manager",
      "SEO Specialist", "SEM Manager", "Content Writer", "Social Media Manager", "Influencer Marketing Manager",
      "Supply Chain Manager", "Logistics Coordinator", "Warehouse Manager", "Inventory Analyst", "Demand Planner",
      "Customer Success Manager", "CRM Manager", "Growth Hacker", "Performance Marketing Analyst",
      "Affiliate Marketing Manager", "Email Marketing Specialist", "Conversion Rate Optimizer",
      "Product Listing Specialist", "Amazon Seller Manager", "Vendor Manager", "Key Account Manager",
      "Operations Manager", "Last Mile Delivery Manager", "Returns Manager", "Escalation Manager", "Quality Analyst"
    ]
  },
  manufacturing: {
    companies: [
      "Tata Steel", "JSW Steel", "SAIL", "Jindal Steel & Power", "RINL",
      "Tata Motors", "Mahindra & Mahindra", "Maruti Suzuki India", "Hyundai India", "Kia India",
      "Hero MotoCorp", "Bajaj Auto", "TVS Motor", "Royal Enfield", "Honda Motorcycle India",
      "Larsen & Toubro", "Bharat Heavy Electricals", "NTPC", "Power Grid Corporation", "NHPC",
      "Indian Oil Corporation", "Bharat Petroleum", "Hindustan Petroleum", "GAIL India", "Oil India",
      "Reliance Industries", "Adani Enterprises", "Vedanta", "Hindalco Industries", "Nalco",
      "Asian Paints", "Berger Paints", "Kansai Nerolac", "Akzo Nobel India", "Indigo Paints",
      "UltraTech Cement", "ACC Limited", "Ambuja Cements", "Shree Cement", "Dalmia Bharat",
      "Pidilite Industries", "Adhesives & Allied Products", "H.B. Fuller India", "Sika India", "Mapei India",
      "Havells India", "Crompton Greaves", "Bajaj Electricals", "Orient Electric", "Finolex Cables",
      "Voltas", "Blue Star India", "Daikin India", "Carrier India", "Hitachi India",
      "Godrej Appliances", "Whirlpool India", "Samsung India Electronics", "LG Electronics India", "Haier India",
      "ITC Limited", "Hindustan Unilever", "Nestle India", "Britannia Industries", "Parle Products",
      "Dabur India", "Marico", "Colgate-Palmolive India", "Procter & Gamble India", "Reckitt India",
      "Emami", "Himalaya Drug Company", "Patanjali Ayurved", "Baidyanath", "Charak Pharma",
      "Supreme Industries", "Finolex Industries", "Prince Pipes", "Astral Pipes", "Wavin India",
      "Jain Irrigation", "Netafim India", "EPC Industrie", "Rahu Catalysts", "Nocil",
      "MRF", "Apollo Tyres", "CEAT Tyres", "JK Tyre", "Birla Tyres",
      "Exide Industries", "Amara Raja Batteries", "Luminous Power Technologies", "Su-Kam Power Systems", "Microtek International",
      "Greaves Cotton", "Kirloskar Electric", "ABB India", "Siemens India", "Alstom India"
    ],
    roles: [
      "Production Engineer", "Manufacturing Engineer", "Quality Control Engineer", "Process Engineer",
      "Plant Manager", "Factory Manager", "Operations Manager", "Maintenance Engineer", "Electrical Engineer",
      "Mechanical Engineer", "Chemical Engineer", "Industrial Engineer", "Safety Officer", "Environment Officer",
      "Supply Chain Manager", "Procurement Manager", "Materials Manager", "Stores Manager", "Logistics Manager",
      "Design Engineer", "R&D Engineer", "Product Development Engineer", "Automation Engineer", "Robotics Engineer",
      "CNC Operator Supervisor", "Welding Engineer", "Forging Engineer", "Casting Engineer", "Tool & Die Manager",
      "ISO Auditor", "Six Sigma Black Belt", "Lean Manufacturing Expert", "Total Quality Manager", "TPM Coordinator"
    ]
  },
  education: {
    companies: [
      "Byju's", "Unacademy", "Vedantu", "upGrad", "Simplilearn",
      "WhiteHat Jr", "Cuemath", "Toppr", "Meritnation", "Extramarks",
      "Great Learning", "Emeritus", "Coursera India", "Udemy India", "LinkedIn Learning India",
      "NIIT", "Aptech", "Arena Animation", "Jetking", "ICAT",
      "IIT Bombay", "IIT Delhi", "IIT Madras", "IIT Kanpur", "IIT Kharagpur",
      "IIM Ahmedabad", "IIM Bangalore", "IIM Calcutta", "IIM Lucknow", "IIM Kozhikode",
      "BITS Pilani", "NIT Trichy", "NIT Warangal", "IIIT Hyderabad", "VIT University",
      "Manipal University", "Amity University", "Lovely Professional University", "Chandigarh University", "SRM University",
      "Delhi University", "Mumbai University", "Pune University", "Osmania University", "Anna University",
      "Pearson India", "Oxford University Press India", "S.Chand Group", "Navneet Education", "Ratna Sagar",
      "EduComp Solutions", "MT Educare", "Resonance", "Allen Career Institute", "Aakash Educational Services",
      "FIITJEE", "Narayana Group", "Sri Chaitanya", "T.I.M.E.", "Career Launcher",
      "British Council India", "American Institute", "IDP Education India", "Jamboree Education", "Manya Group",
      "Don Bosco Tech", "NIIT Foundation", "Quest Alliance", "IL&FS Skills", "TeamLease Skills University",
      "Skill India Mission Partners", "NSDC", "ASCI", "NASSCOM Foundation", "TechSaksham",
      "iDiscoveri Education", "Schoolnet India", "Pratham Education", "Teach For India", "AIF",
      "CL Educate", "MBD Group", "Lido Learning", "Disha Publication", "Arihant Publications",
      "Khan Academy India", "Doubtnut", "Testbook", "Gradeup", "Oliveboard",
      "StudyIQ Education", "Adda247", "Mahendra's Institute", "BSC Academy", "SSC Tube"
    ],
    roles: [
      "Teacher", "Senior Teacher", "Subject Matter Expert", "Curriculum Developer", "Instructional Designer",
      "Academic Counselor", "Admission Counselor", "Career Counselor", "Student Success Manager", "Mentor",
      "Content Writer", "Content Developer", "Video Editor", "Graphic Designer", "E-learning Developer",
      "School Principal", "Vice Principal", "Academic Director", "Dean", "Department Head",
      "Training Manager", "Learning & Development Manager", "Corporate Trainer", "Soft Skills Trainer", "Technical Trainer",
      "Online Tutor", "Live Instructor", "Recorded Lecture Faculty", "Research Associate", "Academic Writer",
      "Student Engagement Manager", "Placement Officer", "Alumni Relations Manager", "Student Affairs Manager", "Hostel Warden"
    ]
  },
  retail: {
    companies: [
      "Reliance Retail", "DMart", "Future Retail", "Big Bazaar", "Spencer's Retail",
      "More Retail", "Star Bazaar", "Easyday", "Vishal Mega Mart", "V-Mart Retail",
      "Shoppers Stop", "Lifestyle", "Westside", "Pantaloons", "Max Fashion",
      "Zara India", "H&M India", "Marks & Spencer India", "GAP India", "Forever 21 India",
      "Bata India", "Metro Shoes", "Khadim's", "Liberty Shoes", "Reliance Footprint",
      "Titan Company", "Tanishq", "Kalyan Jewellers", "Malabar Gold & Diamonds", "PC Jeweller",
      "Woodland", "Decathlon India", "Sports Authority India", "ProSport", "FitOn",
      "Croma", "Reliance Digital", "Vijay Sales", "Poojara Telecom", "Poorvika Mobiles",
      "Landmark Group India", "Lulu Hypermarket India", "Metro Cash & Carry", "Costco India", "Walmart India",
      "Nykaa Retail", "Health & Glow", "Guardian Pharmacy", "Apollo Pharmacy", "MedPlus",
      "Crossword Bookstores", "Landmark Books", "Om Book Shop", "Flipkart Books", "Amazon Books India",
      "McDonald's India", "KFC India", "Domino's India", "Pizza Hut India", "Burger King India",
      "Haldiram's", "Bikanervala", "MTR Foods", "ITC Hotels", "Taj Hotels Retail",
      "Cafe Coffee Day", "Barista", "Starbucks India", "Costa Coffee India", "The Coffee Bean India",
      "FoodWorld", "Hypercity", "Spar India", "Heritage Foods Retail", "Godrej Nature's Basket",
      "La Opala", "Borosil", "Milton", "Cello", "Tupperware India",
      "Asian Paints Signature Store", "Berger Silk Store", "Nerolac Select", "Dulux Decorator Centre", "Nippon Paint Store",
      "IKEA India", "HomeTown", "Evok", "Godrej Interio", "Durian Furniture"
    ],
    roles: [
      "Store Manager", "Assistant Store Manager", "Floor Manager", "Department Manager", "Visual Merchandiser",
      "Retail Sales Executive", "Senior Sales Executive", "Sales Team Leader", "Customer Service Executive", "Cashier",
      "Inventory Manager", "Stock Manager", "Merchandising Manager", "Buying Manager", "Replenishment Executive",
      "Loss Prevention Manager", "Security Manager", "Housekeeping Supervisor", "Facility Manager", "Maintenance Technician",
      "Brand Manager", "Marketing Executive", "PR Manager", "Events Manager", "Loyalty Program Manager",
      "E-commerce Coordinator", "Online Order Manager", "Delivery Coordinator", "Click & Collect Manager", "Omnichannel Manager",
      "HR Manager", "Training Manager", "Recruitment Executive", "Payroll Executive", "Employee Relations Manager"
    ]
  },
  realestate: {
    companies: [
      "DLF", "Godrej Properties", "Prestige Estates", "Brigade Group", "Sobha Developers",
      "Lodha Group", "Oberoi Realty", "Puravankara", "Kolte-Patil Developers", "Mahindra Lifespace",
      "Tata Housing", "L&T Realty", "Shapoorji Pallonji Real Estate", "Hiranandani Group", "Rustomjee Group",
      "Embassy Group", "Salarpuria Sattva", "RMZ Corp", "Panchshil Realty", "K Raheja Corp",
      "ATS Infrastructure", "Gaurs Group", "Mahagun Group", "Supertech", "Amrapali Group",
      "NCC Urban", "Aparna Constructions", "Ramky Group", "My Home Group", "Atul Projects",
      "PropTiger", "Housing.com", "NoBroker", "99acres", "MagicBricks",
      "Anarock Property Consultants", "JLL India", "CBRE India", "Knight Frank India", "Cushman & Wakefield India",
      "Savills India", "Colliers India", "Vestian", "Square Yards", "REA India",
      "Indiabulls Real Estate", "Wadhwa Group", "Hubtown", "Marathon Realty", "Runwal Group",
      "Embassy Office Parks REIT", "Mindspace Business Parks REIT", "Brookfield India REIT", "Nexus Select Trust", "IndiGrid",
      "Phoenix Mills", "Nexus Malls", "Inorbit Malls", "Oberoi Mall", "Select CityWalk",
      "CREDAI", "NAREDCO", "RERA Authorities", "NHB", "HUDCO",
      "Jones Lang LaSalle", "Synergy Property Development", "InfraMantra", "PropEquity", "Liases Foras",
      "Smartworks", "WeWork India", "Awfis", "91Springboard", "BHIVE Workspace",
      "Gera Developments", "Vascon Engineers", "Man Infraconstruction", "Sunteck Realty", "Omkar Realtors",
      "Aliens Group", "Jayabheri Group", "Navin's", "Casa Grande", "Akshaya Private Limited"
    ],
    roles: [
      "Real Estate Agent", "Property Consultant", "Senior Property Advisor", "Sales Manager", "Business Development Manager",
      "Project Manager", "Site Engineer", "Civil Engineer", "Architect", "Interior Designer",
      "Property Manager", "Facility Manager", "Lease Manager", "Asset Manager", "Portfolio Manager",
      "Legal Manager", "Compliance Officer", "Documentation Executive", "Registration Executive", "Due Diligence Analyst",
      "Customer Relationship Manager", "After-Sales Service Manager", "Property Management Executive", "Resident Welfare Manager", "Concierge Manager",
      "Valuation Expert", "Research Analyst", "Market Intelligence Manager", "Investment Analyst", "Transaction Manager",
      "Leasing Manager", "Mall Manager", "Retail Leasing Executive", "Commercial Leasing Manager", "Industrial Property Manager"
    ]
  },
  logistics: {
    companies: [
      "Delhivery", "Blue Dart", "DTDC", "Ecom Express", "Xpressbees",
      "Shadowfax", "Rivigo", "Porter", "Shiprocket", "Nimbus Post",
      "DHL India", "FedEx India", "UPS India", "TNT India", "Aramex India",
      "Gati", "VRL Logistics", "TCI Express", "Safexpress", "AFL Logistics",
      "Container Corporation of India", "Gateway Distriparks", "Allcargo Logistics", "Navkar Corporation", "TransIndia Logistics",
      "Maersk India", "MSC India", "CMA CGM India", "Evergreen India", "COSCO India",
      "Air India Cargo", "IndiGo Cargo", "SpiceJet Cargo", "Go First Cargo", "AirAsia Cargo India",
      "CONCOR", "Rail Vikas Nigam", "RITES", "IRCTC Logistics", "Dedicated Freight Corridor",
      "Mahindra Logistics", "Volkswagen India Logistics", "TVS Supply Chain Solutions", "Panalpina India", "Kuehne+Nagel India",
      "DSV India", "Expeditors India", "Ceva Logistics India", "Geodis India", "Bolloré Logistics India",
      "Agility India", "FM Logistic India", "DB Schenker India", "Rhenus Logistics India", "Imperial Logistics India",
      "SFC Group", "Omni Logistics India", "Jet Freight Logistics", "Om Logistics", "KTC Logistics",
      "Red Express", "Wabash National India", "Mahindra Navistar", "Ashok Leyland", "Tata Motors Commercial",
      "Amazon Logistics India", "Flipkart Logistics", "Myntra Logistics", "Meesho Logistics", "Snapdeal Logistics",
      "BigBasket Logistics", "Grofers Logistics", "Swiggy Logistics", "Zomato Logistics", "Dunzo Logistics",
      "IndiaPost", "Speed Post India", "Business Post India", "Smartr Logistics", "Pickrr"
    ],
    roles: [
      "Logistics Manager", "Supply Chain Manager", "Warehouse Manager", "Distribution Manager", "Fleet Manager",
      "Operations Executive", "Dispatch Executive", "Delivery Manager", "Last Mile Manager", "Hub Manager",
      "Freight Manager", "Customs Clearance Agent", "Shipping Coordinator", "Import Manager", "Export Manager",
      "Inventory Manager", "Procurement Manager", "Vendor Manager", "Supplier Relations Manager", "Sourcing Analyst",
      "Transport Manager", "Route Planner", "Driver Supervisor", "Vehicle Tracking Executive", "GPS Coordinator",
      "Warehouse Executive", "Forklift Operator Supervisor", "Loading Supervisor", "Packing Supervisor", "Pick & Pack Manager",
      "Cold Chain Manager", "Pharmaceutical Logistics Manager", "Dangerous Goods Manager", "Hazmat Coordinator", "Compliance Manager"
    ]
  },
  hospitality: {
    companies: [
      "Taj Hotels", "Oberoi Hotels", "ITC Hotels", "Marriott India", "Hilton India",
      "Hyatt India", "Accor India", "Radisson India", "Wyndham India", "Best Western India",
      "OYO Rooms", "Treebo Hotels", "FabHotels", "Zostel", "Mango Hotels",
      "Lemon Tree Hotels", "The Lalit Hotels", "Sarovar Hotels", "Fortune Hotels", "WelcomHeritage",
      "Club Mahindra", "Thomas Cook India", "Cox & Kings India", "SOTC Travel", "Kesari Tours",
      "EaseMyTrip", "MakeMyTrip Hotels", "Goibibo Hotels", "Cleartrip Hotels", "Yatra Hotels",
      "Air India", "IndiGo", "SpiceJet", "Vistara", "AirAsia India",
      "IRCTC Tourism", "India Tourism Development Corporation", "Kerala Tourism", "Rajasthan Tourism", "Goa Tourism",
      "Compass Group India", "Sodexo India", "Elior India", "Delaware North India", "ISS Facility Services India",
      "McDonald's India", "Yum! Brands India", "Jubilant FoodWorks", "Sapphire Foods India", "Devyani International",
      "Barbeque Nation", "Speciality Restaurants", "Lite Bite Foods", "Impresario Entertainment", "Massive Restaurants",
      "Zomato Restaurant Partners", "Swiggy Restaurant Partners", "Dineout", "EazyDiner", "Scootsy",
      "Taj SATS", "Air India SATS", "Celebi India", "Menzies Aviation India", "dnata India",
      "Leela Palaces", "Aman Resorts India", "Six Senses India", "Ananda in the Himalayas", "Kumarakom Lake Resort",
      "Wilderness Lodges India", "Jungle Lodges Karnataka", "Pugmarks India", "Beyond Wildlife India", "Postcard Hotels"
    ],
    roles: [
      "Hotel Manager", "Front Office Manager", "Guest Relations Manager", "Reservation Manager", "Revenue Manager",
      "Food & Beverage Manager", "Executive Chef", "Sous Chef", "Pastry Chef", "Banquet Manager",
      "Housekeeping Manager", "Room Attendant Supervisor", "Laundry Manager", "Public Area Supervisor", "Turn Down Supervisor",
      "Sales Manager", "Marketing Manager", "Events Manager", "Wedding Planner", "MICE Manager",
      "Travel Consultant", "Tour Operator", "Destination Manager", "Itinerary Planner", "Ground Handler",
      "Airline Operations Manager", "Cabin Crew Supervisor", "Airport Manager", "Ground Staff Supervisor", "Check-in Manager",
      "Spa Manager", "Fitness Center Manager", "Recreation Manager", "Activities Coordinator", "Guest Experience Manager"
    ]
  }
};

// Generate 5000 companies with unique IDs
function generateCompanies() {
  const companies = [];
  let id = 1;

  for (const [industry, data] of Object.entries(INDUSTRIES)) {
    for (const company of data.companies) {
      companies.push({
        id: id++,
        name: company,
        industry,
        roles: data.roles
      });
    }
  }

  // If we have less than 5000, pad with variations
  const baseCount = companies.length;
  const suffixes = ["Pvt Ltd", "Limited", "India", "Solutions", "Services", "Technologies", "Group", "Enterprises", "Associates", "Partners"];
  const extraIndustries = ["Consulting", "Advisory", "Capital", "Ventures", "Holdings", "Digital", "Global", "International", "Asia Pacific", "South Asia"];

  while (companies.length < 5000) {
    const base = companies[companies.length % baseCount];
    const suffix = suffixes[companies.length % suffixes.length];
    const extra = extraIndustries[companies.length % extraIndustries.length];
    companies.push({
      id: id++,
      name: `${base.name} ${extra} ${suffix}`,
      industry: base.industry,
      roles: base.roles
    });
  }

  return companies.slice(0, 5000);
}

export { generateCompanies, INDUSTRIES };
