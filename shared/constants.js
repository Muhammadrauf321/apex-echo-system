// System roles in Apex Education Forum
export const ROLES = {
  DIRECTOR: "director",       // Super Admin / Owner
  MANAGER: "manager",         // Center Manager / Registrar / Admissions
  INSTRUCTOR: "instructor",   // IT or Language Teacher
  STUDENT: "student"          // Enrolled Learner
};

export const ROLE_LABELS = {
  [ROLES.DIRECTOR]: "Director (Super Admin)",
  [ROLES.MANAGER]: "Center Manager",
  [ROLES.INSTRUCTOR]: "Trainer / Instructor",
  [ROLES.STUDENT]: "Student"
};

// Course Categories
export const COURSE_CATEGORIES = {
  IT: "it",
  LANGUAGE: "language"
};

export const CATEGORY_LABELS = {
  [COURSE_CATEGORIES.IT]: "💻 IT & Computer Sector",
  [COURSE_CATEGORIES.LANGUAGE]: "🗣️ Language Programs"
};

// Batch Timings
export const BATCH_SLOTS = [
  { id: "morning_1", label: "Morning (09:00 AM - 11:00 AM)" },
  { id: "morning_2", label: "Late Morning (11:30 AM - 01:30 PM)" },
  { id: "afternoon", label: "Afternoon (03:00 PM - 05:00 PM)" },
  { id: "evening_1", label: "Evening (05:30 PM - 07:30 PM)" },
  { id: "evening_2", label: "Night (08:00 PM - 10:00 PM)" },
  { id: "weekend", label: "Weekend Special (Sat - Sun 10:00 AM - 02:00 PM)" }
];

// Fee Status
export const FEE_STATUS = {
  PAID: "paid",
  PARTIAL: "partial",
  PENDING: "pending",
  OVERDUE: "overdue"
};

// Channels for Apex Connect
export const DEFAULT_CHANNELS = [
  { id: "announcements", name: "📢 Announcements", category: "all", desc: "Official updates from Director and Management" },
  { id: "general", name: "💬 General Community", category: "all", desc: "Open discussions across all batches" },
  { id: "spoken-english-b1", name: "🗣️ Spoken English (Batch 1)", category: "language", desc: "Daily speech topics, pronunciation drills & voice notes" },
  { id: "ielts-masterclass", name: "🎯 IELTS Masterclass", category: "language", desc: "Writing Task 2 reviews, mock speaking & band 8 tips" },
  { id: "web-dev-b2", name: "💻 Full-Stack Web Dev (Batch 2)", category: "it", desc: "Code reviews, debugging bugs, React & Node projects" },
  { id: "python-ai-lab", name: "🐍 Python & AI Lab", category: "it", desc: "Scripts, data analysis & machine learning experiments" },
  { id: "freelancing-careers", name: "💼 Freelancing & Jobs", category: "all", desc: "Upwork proposals, client handling, portfolio feedback" }
];

// Examination Rotation Lifecycle Statuses
export const EXAM_STATUS = {
  PENDING_TEACHER: "pending_teacher", // Admin scheduled exam, awaiting teacher question paper submission
  PENDING_ADMIN: "pending_admin",     // Teacher submitted paper, locked for teacher, awaiting admin approval
  REVISION: "revision",               // Admin requested revisions, unlocked for teacher with feedback notes
  APPROVED: "approved"                // Admin approved and published paper (Official locked)
};

export const EXAM_STATUS_LABELS = {
  [EXAM_STATUS.PENDING_TEACHER]: {
    label: "Awaiting Teacher Submission",
    color: "#eab308", // Yellow
    bg: "rgba(234, 179, 8, 0.15)",
    holder: "Teacher Authoring"
  },
  [EXAM_STATUS.PENDING_ADMIN]: {
    label: "Pending Admin Approval",
    color: "#38bdf8", // Sky blue
    bg: "rgba(56, 189, 248, 0.15)",
    holder: "Admin Review"
  },
  [EXAM_STATUS.REVISION]: {
    label: "Revision Requested",
    color: "#f97316", // Orange
    bg: "rgba(249, 115, 22, 0.15)",
    holder: "Teacher Revising"
  },
  [EXAM_STATUS.APPROVED]: {
    label: "Approved & Published",
    color: "#22c55e", // Green
    bg: "rgba(34, 197, 94, 0.15)",
    holder: "Finalized / Published"
  }
};

