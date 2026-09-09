// Central Seed Data & Canonical Taxonomy for Apex Education Forum
import { COURSE_CATEGORIES, ROLES, FEE_STATUS, EXAM_STATUS } from "./constants.js";

export const SEED_COURSES = [
  // IT Sector
  {
    id: "it_web_fullstack",
    title: "Full-Stack Web Development (MERN)",
    category: COURSE_CATEGORIES.IT,
    tagline: "MongoDB, Express.js, React.js, Node.js & Modern Cloud Deployment",
    duration: "4 Months (16 Weeks)",
    sessionsPerWeek: "4 Days / Week (Daily 2 hrs)",
    fee: 28000,
    installments: 3,
    level: "Intermediate to Advanced",
    instructorName: "To be assigned",
    instructorRole: "Faculty Instructor",
    rating: 4.9,
    reviewsCount: 142,
    badge: "Most Popular",
    icon: "Code",
    modules: [
      "Modern ECMAScript (ES6+), Asynchronous JS, Closures & DOM Manipulation",
      "React 19 Core: Hooks, Virtual DOM, Component Architecture & TailwindCSS",
      "Global State Management: Redux Toolkit & Zustand with Context API",
      "Node.js & Express RESTful API Engineering with JWT Authentication",
      "MongoDB & Mongoose Schema Design, Aggregations & Query Indexing",
      "Full-Stack Capstone Project: Production Cloud Deployment on Vercel & Railway"
    ],
    prerequisites: "Basic programming logic and computer literacy."
  },
  {
    id: "it_python_ai",
    title: "Python Programming, Data Science & AI",
    category: COURSE_CATEGORIES.IT,
    tagline: "NumPy, Pandas, Matplotlib, Scikit-Learn & Machine Learning Fundamentals",
    duration: "3 Months (12 Weeks)",
    sessionsPerWeek: "3 Days / Week (Daily 2 hrs)",
    fee: 24000,
    installments: 2,
    level: "Beginner to Intermediate",
    instructorName: "To be assigned",
    instructorRole: "Faculty Instructor",
    rating: 4.8,
    reviewsCount: 98,
    badge: "Trending Tech",
    icon: "Brain",
    modules: [
      "Python 3 Fundamentals: OOP, Data Structures, Lambda & File I/O",
      "Data Manipulation & Cleaning: NumPy Arrays & Pandas DataFrames",
      "Exploratory Data Analysis (EDA) & Data Visualization with Seaborn",
      "Supervised & Unsupervised Machine Learning with Scikit-Learn",
      "Introduction to Deep Learning, Neural Networks & Computer Vision Basics",
      "End-to-End Predictive Analytics Model Deployment using Streamlit"
    ],
    prerequisites: "High school mathematics and logical reasoning."
  },
  {
    id: "it_graphic_design",
    title: "Graphic Design & UI/UX Design",
    category: COURSE_CATEGORIES.IT,
    tagline: "Adobe Photoshop, Illustrator, Figma & Brand Identity Systems",
    duration: "3 Months (12 Weeks)",
    sessionsPerWeek: "3 Days / Week",
    fee: 20000,
    installments: 2,
    level: "Beginner to Advanced",
    instructorName: "To be assigned",
    instructorRole: "Faculty Instructor",
    rating: 4.9,
    reviewsCount: 110,
    badge: "Creative Career",
    icon: "Palette",
    modules: [
      "Design Fundamentals: Typography, Color Theory, Grid Systems & Hierarchy",
      "Adobe Photoshop: Image Retouching, Masking, Compositing & Social Media Assets",
      "Adobe Illustrator: Vector Art, Logo Design & Corporate Brand Identity",
      "Figma UI/UX: Wireframing, Auto-Layout, Component Design Systems & Interactive Prototyping",
      "UX Research: User Personas, Journey Maps, Usability Testing & Pitch Decks",
      "Behance & Dribbble Portfolio Preparation for Freelancing"
    ],
    prerequisites: "Creative mindset and basic computer operation."
  },
  {
    id: "it_cit_office",
    title: "Certificate in Information Technology (CIT)",
    category: COURSE_CATEGORIES.IT,
    tagline: "MS Office 365, Windows OS, Speed Typing & Essential Digital Productivity",
    duration: "2 Months (8 Weeks)",
    sessionsPerWeek: "5 Days / Week (Daily 1 hr)",
    fee: 12000,
    installments: 1,
    level: "Foundational",
    instructorName: "To be assigned",
    instructorRole: "Faculty Instructor",
    rating: 4.7,
    reviewsCount: 84,
    badge: "Foundation",
    icon: "FileSpreadsheet",
    modules: [
      "Windows Operating System, File Management & Keyboard Speed Typing",
      "Microsoft Word: Business Letters, Resumes, Formatting, Documentation",
      "Microsoft Excel: Formulas (IF, VLOOKUP, INDEX/MATCH), Pivot Tables & Charts",
      "Microsoft PowerPoint: Professional Corporate Slide Decks & Animations",
      "Google Workspace (Docs, Sheets, Drive) & Email Etiquette"
    ],
    prerequisites: "None."
  },

  // Language Sector
  {
    id: "lang_spoken_english",
    title: "Spoken English & Fluency Mastery",
    category: COURSE_CATEGORIES.LANGUAGE,
    tagline: "Overcome Hesitation, Speak Confidently, Accent Neutralization & Group Discussions",
    duration: "2.5 Months (10 Weeks)",
    sessionsPerWeek: "5 Days / Week (Daily 1.5 hrs)",
    fee: 15000,
    installments: 2,
    level: "Beginner to Conversational",
    instructorName: "To be assigned",
    instructorRole: "Language Coach",
    rating: 4.9,
    reviewsCount: 230,
    badge: "Flagship Course",
    icon: "Mic",
    modules: [
      "Overcoming Hesitation & Stage Fright: Daily Speaking Drills",
      "Functional Grammar in Context (No Rote Learning): Tenses, Prepositions",
      "Pronunciation, Word Stress & Accent Neutralization",
      "Extempore Speech, Debate & Impromptu Presentations",
      "Vocabulary Expansion: Idioms, Phrasal Verbs & Everyday Collocations",
      "Real-World Roleplays: Job Interviews, Meetings, Customer Service"
    ],
    prerequisites: "Basic understanding of letters and words."
  },
  {
    id: "lang_ielts_mastery",
    title: "IELTS Academic & General (Target Band 7.5+)",
    category: COURSE_CATEGORIES.LANGUAGE,
    tagline: "Intensive Strategy, Timed Mocks, Writing Task 1/2 Evaluation & Speaking Interviews",
    duration: "2 Months (8 Weeks)",
    sessionsPerWeek: "4 Days / Week",
    fee: 22000,
    installments: 2,
    level: "Intermediate to Advanced",
    instructorName: "To be assigned",
    instructorRole: "Language Coach",
    rating: 5.0,
    reviewsCount: 165,
    badge: "High Success Rate",
    icon: "Award",
    modules: [
      "Listening Module: Accent Familiarization (British, Aussie, American) & Map/Table Techniques",
      "Reading Module: Skimming, Scanning, True/False/Not Given & Time Management",
      "Writing Task 1: Academic Graphs, Trends, Process Diagrams & General Letters",
      "Writing Task 2: High-Scoring Essay Structures (Opinion, Discussion, Solutions)",
      "Speaking Module: 1-on-1 Mock Interviews with Detailed Band Criteria Rubrics",
      "Full-Length Weekly Mock Tests with Individual Diagnostic Scoring"
    ],
    prerequisites: "Intermediate English proficiency."
  },
  {
    id: "lang_business_english",
    title: "Business English & Executive Communication",
    category: COURSE_CATEGORIES.LANGUAGE,
    tagline: "Professional Emails, Executive Presentations, Meeting Negotiations & Corporate Confidence",
    duration: "1.5 Months",
    sessionsPerWeek: "3 Days / Week (Evening)",
    fee: 18000,
    installments: 1,
    level: "Professional",
    instructorName: "To be assigned",
    instructorRole: "Language Coach",
    rating: 4.8,
    reviewsCount: 76,
    badge: "Corporate",
    icon: "Briefcase",
    modules: [
      "Professional Email Writing: Tone, Clarity, Direct vs Indirect Approaches",
      "High-Impact PowerPoint Presentations & Storytelling for Executives",
      "Cross-Cultural Meeting Negotiations & Handling Difficult Conversations",
      "Job Interview Simulations & Executive LinkedIn Networking"
    ],
    prerequisites: "Working professionals or graduating students."
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

// Only the verified Admin account exists — 100% clean of fake demo users
export const DEMO_USERS = [
  ADMIN_USER
];

// 100% Fresh & Clean Real Stores — zero dummy data
export const SEED_BATCHES = [];
export const SEED_CERTIFICATES = [];
export const SEED_EXAMS = [];
