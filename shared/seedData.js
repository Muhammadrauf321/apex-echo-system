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
    instructorName: "Engr. Bilal Ahmed",
    instructorRole: "Lead Full-Stack Architect",
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
    instructorName: "Dr. Farhan Siddiqui",
    instructorRole: "AI Specialist & University Lecturer",
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
    instructorName: "Ms. Anum Khalid",
    instructorRole: "Senior UI/UX & Brand Designer",
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
    instructorName: "Kamran Akram",
    instructorRole: "Corporate IT Trainer",
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
    instructorName: "Sir Salman Tareen",
    instructorRole: "Senior English Language Coach",
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
    instructorName: "Ms. Hira Qureshi",
    instructorRole: "Certified British Council IELTS Trainer",
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
    instructorName: "Tariq Jameel",
    instructorRole: "Corporate Communications Specialist",
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

export const SEED_BATCHES = [
  {
    id: "batch_web_14",
    courseId: "it_web_fullstack",
    courseTitle: "Full-Stack Web Development (MERN)",
    batchCode: "FSWD-B14",
    instructor: "Engr. Bilal Ahmed",
    timeSlot: "05:30 PM - 07:30 PM (Mon - Thu)",
    lab: "Computer Lab 1",
    startDate: "2026-09-15",
    endDate: "2027-01-15",
    capacity: 25,
    enrolledCount: 19,
    status: "active"
  },
  {
    id: "batch_spoken_22",
    courseId: "lang_spoken_english",
    courseTitle: "Spoken English & Fluency Mastery",
    batchCode: "ENG-B22",
    instructor: "Sir Salman Tareen",
    timeSlot: "04:00 PM - 05:30 PM (Mon - Fri)",
    lab: "Language Audio-Visual Lab",
    startDate: "2026-09-10",
    endDate: "2026-11-20",
    capacity: 30,
    enrolledCount: 26,
    status: "active"
  },
  {
    id: "batch_python_08",
    courseId: "it_python_ai",
    courseTitle: "Python Programming, Data Science & AI",
    batchCode: "PY-B08",
    instructor: "Dr. Farhan Siddiqui",
    timeSlot: "07:30 PM - 09:30 PM (Tue, Thu, Sat)",
    lab: "Computer Lab 2",
    startDate: "2026-09-20",
    endDate: "2026-12-20",
    capacity: 20,
    enrolledCount: 15,
    status: "upcoming"
  },
  {
    id: "batch_ielts_11",
    courseId: "lang_ielts_mastery",
    courseTitle: "IELTS Academic & General",
    batchCode: "IELTS-B11",
    instructor: "Ms. Hira Qureshi",
    timeSlot: "11:00 AM - 01:00 PM (Mon - Thu)",
    lab: "Seminar Hall B",
    startDate: "2026-09-01",
    endDate: "2026-10-31",
    capacity: 20,
    enrolledCount: 18,
    status: "active"
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

export const DEMO_USERS = [
  ADMIN_USER,
  {
    uid: "usr_mgr_01",
    name: "Kamran Akram",
    email: "manager@apex.edu",
    role: ROLES.MANAGER,
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    title: "Center Admissions Manager"
  },
  {
    uid: "usr_ins_01",
    name: "Engr. Bilal Ahmed",
    email: "bilal.ahmed@apex.edu",
    role: ROLES.INSTRUCTOR,
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    title: "Lead Full-Stack Instructor"
  },
  {
    uid: "usr_ins_02",
    name: "Sir Salman Tareen",
    email: "salman.tareen@apex.edu",
    role: ROLES.INSTRUCTOR,
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80",
    title: "Head of Language Department"
  },
  {
    uid: "usr_std_01",
    name: "Hamza Tariq",
    email: "hamza.student@apex.edu",
    role: ROLES.STUDENT,
    studentId: "APEX-2026-0042",
    avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80",
    enrolledBatchId: "batch_web_14",
    courseTitle: "Full-Stack Web Development (MERN)",
    feePaid: 18000,
    feeTotal: 28000,
    feeStatus: FEE_STATUS.PARTIAL,
    attendanceRate: "94%"
  },
  {
    uid: "usr_std_02",
    name: "Zainab Fatima",
    email: "zainab.student@apex.edu",
    role: ROLES.STUDENT,
    studentId: "APEX-2026-0089",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
    enrolledBatchId: "batch_spoken_22",
    courseTitle: "Spoken English & Fluency Mastery",
    feePaid: 15000,
    feeTotal: 15000,
    feeStatus: FEE_STATUS.PAID,
    attendanceRate: "98%"
  }
];

export const SEED_CERTIFICATES = [
  {
    certificateId: "APEX-CERT-2026-8821",
    studentName: "Ali Hassan Khan",
    courseTitle: "Full-Stack Web Development (MERN)",
    grade: "A+ with Distinction",
    issueDate: "August 28, 2026",
    instructorName: "Engr. Bilal Ahmed",
    status: "Verified Authentic",
    skills: ["React.js", "Node.js", "Express", "MongoDB", "Cloud Deployment"]
  },
  {
    certificateId: "APEX-CERT-2026-5419",
    studentName: "Amina Noor",
    courseTitle: "IELTS Academic & Masterclass",
    grade: "Band 8.0 Overall",
    issueDate: "August 15, 2026",
    instructorName: "Ms. Hira Qureshi",
    status: "Verified Authentic",
    skills: ["Speaking Band 8.5", "Listening Band 8.0", "Reading Band 8.0", "Writing Band 7.5"]
  }
];

export const SEED_EXAMS = [
  {
    id: "exam_mern_mid",
    title: "Mid-Term Examination: Full-Stack Web Development",
    courseId: "it_web_fullstack",
    courseTitle: "Full-Stack Web Development (MERN)",
    batchCode: "FSWD-B14",
    assignedTeacherId: "usr_ins_01",
    assignedTeacherName: "Engr. Bilal Ahmed",
    createdById: "lPIJ3zyZoRVVfdLkOck6tYCNICO2",
    createdByName: "Muhammad Rauf (Director)",
    examDate: "2026-10-15",
    durationMinutes: 90,
    totalMarks: 50,
    passingMarks: 25,
    instructions: "Attempt all questions. Mobile phones and unauthorized material are strictly prohibited.",
    status: EXAM_STATUS.PENDING_TEACHER,
    adminFeedback: "",
    submittedAt: null,
    approvedAt: null,
    questions: [
      {
        id: "q1",
        questionText: "Which hook is used in React to perform side effects like data fetching or DOM subscriptions?",
        type: "mcq",
        marks: 5,
        options: ["useState", "useEffect", "useMemo", "useCallback"],
        correctOption: 1
      },
      {
        id: "q2",
        questionText: "Explain the difference between SQL and NoSQL database schemas with an example.",
        type: "short",
        marks: 10,
        options: [],
        correctOption: null
      }
    ]
  },
  {
    id: "exam_spoken_mid",
    title: "Fluency & Phonetics Oral & Written Assessment",
    courseId: "lang_spoken_english",
    courseTitle: "Spoken English & Fluency Mastery",
    batchCode: "ENG-B22",
    assignedTeacherId: "usr_ins_02",
    assignedTeacherName: "Sir Salman Tareen",
    createdById: "lPIJ3zyZoRVVfdLkOck6tYCNICO2",
    createdByName: "Muhammad Rauf (Director)",
    examDate: "2026-09-30",
    durationMinutes: 60,
    totalMarks: 40,
    passingMarks: 20,
    instructions: "Section A is listening & grammar MCQs. Section B requires 150-word impromptu speech delivery.",
    status: EXAM_STATUS.PENDING_ADMIN,
    adminFeedback: "",
    submittedAt: "2026-09-08 11:30 AM",
    approvedAt: null,
    questions: [
      {
        id: "sq1",
        questionText: "Identify the sentence that uses the Present Perfect Continuous tense correctly:",
        type: "mcq",
        marks: 5,
        options: [
          "I am living here since five years.",
          "I have been living here for five years.",
          "I had lived here from five years.",
          "I was living here since five years."
        ],
        correctOption: 1
      },
      {
        id: "sq2",
        questionText: "What are diphthongs in English phonetics? Provide 3 common examples.",
        type: "short",
        marks: 10,
        options: [],
        correctOption: null
      },
      {
        id: "sq3",
        questionText: "Deliver a structured presentation on: 'The Role of Technology in Modern Education'. (Rubric: Pronunciation 10, Coherence 10, Vocabulary 5)",
        type: "short",
        marks: 25,
        options: [],
        correctOption: null
      }
    ]
  },
  {
    id: "exam_py_final",
    title: "Python Data Science & Machine Learning Capstone Exam",
    courseId: "it_python_ai",
    courseTitle: "Python Programming, Data Science & AI",
    batchCode: "PY-B08",
    assignedTeacherId: "usr_ins_01",
    assignedTeacherName: "Engr. Bilal Ahmed",
    createdById: "lPIJ3zyZoRVVfdLkOck6tYCNICO2",
    createdByName: "Muhammad Rauf (Director)",
    examDate: "2026-11-10",
    durationMinutes: 120,
    totalMarks: 60,
    passingMarks: 30,
    instructions: "Practical coding and theory. Submit script files through the terminal.",
    status: EXAM_STATUS.APPROVED,
    adminFeedback: "Approved by Executive Director. Good question coverage.",
    submittedAt: "2026-09-05 02:15 PM",
    approvedAt: "2026-09-06 10:00 AM",
    questions: [
      {
        id: "pq1",
        questionText: "Which Pandas function is used to handle missing null values by replacing them?",
        type: "mcq",
        marks: 10,
        options: ["df.dropna()", "df.fillna()", "df.isnull()", "df.replace_empty()"],
        correctOption: 1
      },
      {
        id: "pq2",
        questionText: "Write a Python script that loads a CSV, filters rows where revenue > 50000, and calculates the average profit.",
        type: "code",
        marks: 25,
        options: [],
        correctOption: null
      },
      {
        id: "pq3",
        questionText: "Explain how Logistic Regression differs from Linear Regression in classification problems.",
        type: "short",
        marks: 25,
        options: [],
        correctOption: null
      }
    ]
  }
];
