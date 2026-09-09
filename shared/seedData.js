import { COURSE_CATEGORIES, ROLES, FEE_STATUS, EXAM_STATUS } from "./constants.js";

// Official Course Catalog for Apex Education Forum
export const SEED_COURSES = [
  {
    id: "it_web_fullstack",
    title: "Full-Stack Web Development (MERN)",
    category: COURSE_CATEGORIES.IT,
    tagline: "Master Frontend to Backend, APIs, Database & Cloud Deployment",
    duration: "4 Months (16 Weeks)",
    sessionsPerWeek: "4 Days / Week (2 hrs/day)",
    fee: 28000,
    installments: 3,
    level: "Beginner to Advanced",
    instructorName: "Lead Web Faculty",
    instructorRole: "Senior Full-Stack Architect",
    rating: 4.9,
    reviewsCount: 142,
    badge: "Most Popular",
    icon: "Code",
    modules: [
      "Modern HTML5, Semantic Web & Advanced CSS (Flexbox, Grid, Animations)",
      "Modern JavaScript ES6+, Async/Await, DOM APIs & Local Storage",
      "React.js 18: Hooks, Component Architecture, State Management & Vite",
      "Node.js, Express.js & RESTful API Architecture",
      "MongoDB & Cloud Firestore: Schemas, Queries & Data Modeling",
      "Authentication (JWT, Firebase Auth), Security & Deployment on Vercel/Firebase"
    ],
    prerequisites: "Basic computer familiarity. No prior coding required."
  },
  {
    id: "it_python_ai",
    title: "Python Programming, Data Science & AI",
    category: COURSE_CATEGORIES.IT,
    tagline: "From Core Syntax to Data Analytics, Pandas, Machine Learning & Automation",
    duration: "3 Months (12 Weeks)",
    sessionsPerWeek: "3 Days / Week",
    fee: 24000,
    installments: 2,
    level: "Intermediate",
    instructorName: "AI Research Faculty",
    instructorRole: "Data Scientist & AI Consultant",
    rating: 4.8,
    reviewsCount: 98,
    badge: "High Demand",
    icon: "Terminal",
    modules: [
      "Python Core: Data Types, Functions, OOP, Modular Programming",
      "File Handling, Web Scraping (BeautifulSoup, Requests)",
      "Data Analysis: NumPy, Pandas DataFrames & Data Cleaning",
      "Data Visualization: Matplotlib & Seaborn",
      "Intro to Machine Learning: Scikit-learn (Regression, Classification)",
      "Building AI Applications with Gemini & OpenAI APIs"
    ],
    prerequisites: "Logical thinking, basic algebra."
  },
  {
    id: "it_graphic_media",
    title: "Graphic Design, UI/UX & Video Editing",
    category: COURSE_CATEGORIES.IT,
    tagline: "Adobe Photoshop, Illustrator, Premiere Pro & Modern Figma Prototyping",
    duration: "3 Months",
    sessionsPerWeek: "3 Days / Week",
    fee: 20000,
    installments: 2,
    level: "All Levels",
    instructorName: "Creative Media Faculty",
    instructorRole: "Creative Director & UI/UX Specialist",
    rating: 4.9,
    reviewsCount: 110,
    badge: "Freelance Ready",
    icon: "PenTool",
    modules: [
      "Vector Branding: Adobe Illustrator Masterclass (Logos, Mascots, Typography)",
      "Photo Manipulation & Digital Retouching in Adobe Photoshop",
      "UI/UX Foundations in Figma: Wireframing, Design Systems & High-Fidelity Prototypes",
      "Video Editing in Premiere Pro: Timeline, Transitions, Motion Titles & Audio Sync",
      "Social Media Ad Creatives & Reel Packaging for International Clients",
      "Upwork & Behance Portfolio Packaging"
    ],
    prerequisites: "Creative mindset, interest in visual design."
  },
  {
    id: "lang_spoken_english",
    title: "Spoken English & Fluency Mastery",
    category: COURSE_CATEGORIES.LANGUAGE,
    tagline: "Conquer Stage Fear, Master British/American Pronunciation & Impromptu Speech",
    duration: "2 Months (8 Weeks)",
    sessionsPerWeek: "5 Days / Week (1.5 hrs/day)",
    fee: 15000,
    installments: 2,
    level: "Beginner to Fluent",
    instructorName: "Senior Linguist Faculty",
    instructorRole: "Head of Language Department",
    rating: 5.0,
    reviewsCount: 220,
    badge: "Bestseller",
    icon: "Languages",
    modules: [
      "Phonetics & IPA Sound Charts: Correcting Regional Tongue Influence (RTI)",
      "Active Daily Vocabulary: 1,000 High-Frequency Modern Idioms & Phrasal Verbs",
      "Live Debate Clubs, Extempore Sessions & Speech Roleplays",
      "Business English: Professional Emailing, Meeting Negotiations & Client Calls",
      "Accent Neutralization & Voice Modulation Techniques",
      "Presentation Delivery & Body Language Coaching"
    ],
    prerequisites: "Basic understanding of simple sentences."
  },
  {
    id: "lang_ielts_mastery",
    title: "IELTS Academic & General Training (Band 7.5+)",
    category: COURSE_CATEGORIES.LANGUAGE,
    tagline: "Comprehensive 4-Module Strategy, Real Cambridge Tests & Band 8 Mock Analysis",
    duration: "6 Weeks Intensive",
    sessionsPerWeek: "4 Days / Week (2 hrs/day)",
    fee: 22000,
    installments: 2,
    level: "Intermediate to Advanced",
    instructorName: "Certified IELTS Master Trainer",
    instructorRole: "British Council Certified IELTS Specialist",
    rating: 4.9,
    reviewsCount: 185,
    badge: "Immigration / Study Abroad",
    icon: "BookOpen",
    modules: [
      "Listening: Overcoming Distractors, Rapid Note-Taking & Section 4 Monologues",
      "Reading: Skimming, Scanning & 'True/False/Not Given' Elimination Strategies",
      "Writing Task 1: Academic Report Writing & General Letter Structures",
      "Writing Task 2: Band 8+ Essay Formulation, Lexical Resource & Grammatical Range",
      "Speaking Part 1, 2 (Cue Card) & 3: Fluency, Coherence & Lexical Versatility",
      "6 Full Computer-Delivered & Paper Mock Tests with Diagnostic Scoring"
    ],
    prerequisites: "Intermediate English proficiency."
  }
];

// Single Verified Administrator Account
export const ADMIN_USER = {
  uid: "lPIJ3zyZoRVVfdLkOck6tYCNICO2",
  name: "Muhammad Rauf",
  email: "muhammadraufbaloch6@gmail.com",
  role: ROLES.DIRECTOR,
  avatar: "https://lh3.googleusercontent.com/a/ACg8ocIuFIKbRXt0gvqQsSJB1wp8JMljzM9pM2Pww9XJQTdHEYjiosSygw=s96-c",
  title: "Executive Director & Founder"
};

// Only the real Admin account exists — all fake demo users removed
export const DEMO_USERS = [
  ADMIN_USER
];

// Empty real stores — zero fake seed data
export const SEED_BATCHES = [];
export const SEED_CERTIFICATES = [];
export const SEED_EXAMS = [];
