import { 
  collection, 
  addDoc, 
  getDocs, 
  onSnapshot, 
  query, 
  orderBy, 
  serverTimestamp 
} from "firebase/firestore";
import { db } from "./firebaseConfig.js";
import { 
  SEED_COURSES, 
  SEED_BATCHES, 
  SEED_CERTIFICATES, 
  ADMIN_USER,
  DEMO_USERS,
  SEED_EXAMS
} from "./seedData.js";
import { EXAM_STATUS } from "./constants.js";

// Storage keys
const STORAGE_KEYS = {
  COURSES: "apex_courses",
  BATCHES: "apex_batches",
  INQUIRIES: "apex_inquiries",
  MESSAGES: "apex_messages",
  CERTIFICATES: "apex_certificates",
  ATTENDANCE: "apex_attendance",
  EXAMS: "apex_exams",
  TEACHERS: "apex_teachers",
  STUDENTS: "apex_students"
};

const DEFAULT_INQUIRIES = [
  {
    id: "inq_01",
    name: "Danyal Sheikh",
    phone: "+92 300 1234567",
    email: "danyal.sheikh@gmail.com",
    courseId: "it_web_fullstack",
    courseTitle: "Full-Stack Web Development (MERN)",
    preferredSlot: "Evening (05:30 PM - 07:30 PM)",
    status: "pending",
    date: "2026-09-06"
  },
  {
    id: "inq_02",
    name: "Mehwish Raza",
    phone: "+92 321 9876543",
    email: "mehwish.raza@gmail.com",
    courseId: "lang_spoken_english",
    courseTitle: "Spoken English & Fluency Mastery",
    preferredSlot: "Morning (09:00 AM - 11:00 AM)",
    status: "approved",
    date: "2026-09-05"
  }
];

const DEFAULT_TEACHERS = [
  {
    id: "usr_ins_01",
    name: "Engr. Bilal Ahmed",
    email: "bilal.ahmed@apex.edu",
    department: "Computer Science & IT",
    phone: "+92 300 4567890",
    status: "active",
    joinedDate: "2026-01-15"
  },
  {
    id: "usr_ins_02",
    name: "Sir Salman Tareen",
    email: "salman.tareen@apex.edu",
    department: "English & Foreign Languages",
    phone: "+92 321 6549870",
    status: "active",
    joinedDate: "2026-02-01"
  }
];

const DEFAULT_STUDENTS = [
  {
    id: "usr_std_01",
    name: "Hamza Tariq",
    email: "hamza.student@apex.edu",
    phone: "+92 333 1122334",
    rollNumber: "APEX-2026-0042",
    batchCode: "FSWD-B14",
    course: "Full-Stack Web Development (MERN)",
    feePaid: 18000,
    feeTotal: 28000,
    feeStatus: "partial",
    status: "active",
    enrolledAt: "2026-08-20"
  },
  {
    id: "usr_std_02",
    name: "Zainab Fatima",
    email: "zainab.student@apex.edu",
    phone: "+92 312 4455667",
    rollNumber: "APEX-2026-0089",
    batchCode: "ENG-B22",
    course: "Spoken English & Fluency Mastery",
    feePaid: 15000,
    feeTotal: 15000,
    feeStatus: "paid",
    status: "active",
    enrolledAt: "2026-08-25"
  }
];

// Seed initial storage with rich datasets
function initLocalData() {
  if (typeof window === "undefined" || typeof localStorage === "undefined") return;

  // Restore rich initial data if not present or if previously emptied
  if (localStorage.getItem("apex_restored_rich_data_v5") !== "true") {
    localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(SEED_COURSES));
    localStorage.setItem(STORAGE_KEYS.BATCHES, JSON.stringify(SEED_BATCHES));
    localStorage.setItem(STORAGE_KEYS.CERTIFICATES, JSON.stringify(SEED_CERTIFICATES));
    localStorage.setItem(STORAGE_KEYS.EXAMS, JSON.stringify(SEED_EXAMS));
    localStorage.setItem(STORAGE_KEYS.INQUIRIES, JSON.stringify(DEFAULT_INQUIRIES));
    localStorage.setItem(STORAGE_KEYS.TEACHERS, JSON.stringify(DEFAULT_TEACHERS));
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(DEFAULT_STUDENTS));
    localStorage.setItem("apex_restored_rich_data_v5", "true");
    return;
  }

  if (!localStorage.getItem(STORAGE_KEYS.COURSES)) {
    localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(SEED_COURSES));
  }
  if (!localStorage.getItem(STORAGE_KEYS.BATCHES)) {
    localStorage.setItem(STORAGE_KEYS.BATCHES, JSON.stringify(SEED_BATCHES));
  }
  if (!localStorage.getItem(STORAGE_KEYS.CERTIFICATES)) {
    localStorage.setItem(STORAGE_KEYS.CERTIFICATES, JSON.stringify(SEED_CERTIFICATES));
  }
  if (!localStorage.getItem(STORAGE_KEYS.EXAMS)) {
    localStorage.setItem(STORAGE_KEYS.EXAMS, JSON.stringify(SEED_EXAMS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.INQUIRIES)) {
    localStorage.setItem(STORAGE_KEYS.INQUIRIES, JSON.stringify(DEFAULT_INQUIRIES));
  }
  if (!localStorage.getItem(STORAGE_KEYS.STUDENTS)) {
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(DEFAULT_STUDENTS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.TEACHERS)) {
    localStorage.setItem(STORAGE_KEYS.TEACHERS, JSON.stringify(DEFAULT_TEACHERS));
  }
}

initLocalData();

// --- Courses ---
export function getCourses() {
  const data = localStorage.getItem(STORAGE_KEYS.COURSES);
  return data ? JSON.parse(data) : SEED_COURSES;
}

// --- Teachers / Faculty Management (Registered by Admin) ---
export function getTeachers() {
  const data = localStorage.getItem(STORAGE_KEYS.TEACHERS);
  return data ? JSON.parse(data) : [];
}

export function addTeacher(teacherData) {
  const teachers = getTeachers();
  const existing = teachers.find(t => t.email.toLowerCase() === teacherData.email.toLowerCase());
  if (existing) {
    return existing;
  }
  const newTeacher = {
    id: `tch_${Date.now()}`,
    name: teacherData.name,
    email: teacherData.email,
    department: teacherData.department || "IT",
    phone: teacherData.phone || "",
    role: "instructor",
    status: teacherData.status || "pending_activation",
    createdAt: new Date().toISOString()
  };
  teachers.push(newTeacher);
  localStorage.setItem(STORAGE_KEYS.TEACHERS, JSON.stringify(teachers));
  window.dispatchEvent(new CustomEvent("apex_teachers_changed", { detail: teachers }));
  return newTeacher;
}

// --- Batches ---
export function getBatches() {
  const data = localStorage.getItem(STORAGE_KEYS.BATCHES);
  return data ? JSON.parse(data) : [];
}

export function createBatch(batchData) {
  const batches = getBatches();
  const newBatch = {
    id: `batch_${Date.now()}`,
    enrolledCount: 0,
    status: "active",
    ...batchData
  };
  batches.push(newBatch);
  localStorage.setItem(STORAGE_KEYS.BATCHES, JSON.stringify(batches));
  window.dispatchEvent(new CustomEvent("apex_batches_changed", { detail: batches }));
  return newBatch;
}

// --- Students ---
export function getStudents() {
  const data = localStorage.getItem(STORAGE_KEYS.STUDENTS);
  return data ? JSON.parse(data) : [];
}

export function saveStudents(students) {
  localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
  window.dispatchEvent(new CustomEvent("apex_students_changed", { detail: students }));
}

export function enrollStudent(studentData) {
  const students = getStudents();
  const newStudent = {
    id: `std_${Date.now().toString().slice(-4)}`,
    name: studentData.name,
    email: studentData.email || "",
    phone: studentData.phone || "",
    course: studentData.course,
    batchCode: studentData.batchCode || "Assigned Soon",
    totalFee: studentData.totalFee || 20000,
    paidFee: studentData.paidFee || 0,
    status: studentData.paidFee >= (studentData.totalFee || 20000) ? FEE_STATUS.PAID : FEE_STATUS.PENDING,
    activationStatus: studentData.activationStatus || "pending_activation",
    attendance: studentData.attendance || 100,
    createdAt: new Date().toISOString()
  };
  const updated = [newStudent, ...students];
  saveStudents(updated);
  return newStudent;
}

// --- Inquiries ---
export function getInquiries() {
  const data = localStorage.getItem(STORAGE_KEYS.INQUIRIES);
  return data ? JSON.parse(data) : [];
}

export async function submitInquiry(inquiryData) {
  const newInq = {
    id: `inq_${Date.now()}`,
    status: "pending",
    date: new Date().toISOString().split("T")[0],
    ...inquiryData
  };

  const list = getInquiries();
  list.unshift(newInq);
  localStorage.setItem(STORAGE_KEYS.INQUIRIES, JSON.stringify(list));
  window.dispatchEvent(new CustomEvent("apex_inquiries_changed", { detail: list }));

  try {
    await addDoc(collection(db, "inquiries"), {
      ...newInq,
      createdAt: serverTimestamp()
    });
  } catch (e) {
    // Graceful offline fallback
  }

  return newInq;
}

export function updateInquiryStatus(id, status) {
  const list = getInquiries();
  const updated = list.map(item => item.id === id ? { ...item, status } : item);
  localStorage.setItem(STORAGE_KEYS.INQUIRIES, JSON.stringify(updated));
  window.dispatchEvent(new CustomEvent("apex_inquiries_changed", { detail: updated }));
  return updated;
}

// --- Messages ---
export function getChannelMessages(channelId) {
  const all = JSON.parse(localStorage.getItem(STORAGE_KEYS.MESSAGES) || "{}");
  return all[channelId] || [];
}

export async function sendMessage(channelId, messageData) {
  const all = JSON.parse(localStorage.getItem(STORAGE_KEYS.MESSAGES) || "{}");
  if (!all[channelId]) all[channelId] = [];

  const newMsg = {
    id: `msg_${Date.now()}`,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    ...messageData
  };

  all[channelId].push(newMsg);
  localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(all));
  window.dispatchEvent(new CustomEvent("apex_messages_changed", { detail: { channelId, message: newMsg } }));

  try {
    await addDoc(collection(db, "channels", channelId, "messages"), {
      ...newMsg,
      createdAt: serverTimestamp()
    });
  } catch (e) {
    // Fallback
  }

  return newMsg;
}

// --- Certificates ---
export function getCertificates() {
  const data = localStorage.getItem(STORAGE_KEYS.CERTIFICATES);
  return data ? JSON.parse(data) : [];
}

export function verifyCertificate(certificateId) {
  const certs = getCertificates();
  return certs.find(c => c.certificateId.trim().toUpperCase() === certificateId.trim().toUpperCase()) || null;
}

export function issueCertificate(certData) {
  const certs = getCertificates();
  const newCert = {
    certificateId: `APEX-CERT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
    issueDate: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
    status: "Verified Authentic",
    ...certData
  };
  certs.unshift(newCert);
  localStorage.setItem(STORAGE_KEYS.CERTIFICATES, JSON.stringify(certs));
  window.dispatchEvent(new CustomEvent("apex_certificates_changed", { detail: certs }));
  return newCert;
}

// --- Examinations (Strict Rotational Lifecycle) ---

export function getExams() {
  const data = localStorage.getItem(STORAGE_KEYS.EXAMS);
  if (!data) return [];
  try {
    return JSON.parse(data);
  } catch (e) {
    return [];
  }
}

export function saveExams(exams) {
  localStorage.setItem(STORAGE_KEYS.EXAMS, JSON.stringify(exams));
  window.dispatchEvent(new CustomEvent("apex_exams_changed", { detail: exams }));
}

export function getExamById(id) {
  const exams = getExams();
  return exams.find(e => e.id === id) || null;
}

// 1. Admin creates scheduled exam (Admin question access is strictly LOCKED until teacher submits)
export function createExam(examData) {
  const exams = getExams();
  const newExam = {
    id: `exam_${Date.now()}`,
    createdAt: new Date().toISOString(),
    status: EXAM_STATUS.PENDING_TEACHER,
    adminFeedback: "",
    submittedAt: null,
    approvedAt: null,
    questions: [],
    ...examData
  };
  exams.unshift(newExam);
  saveExams(exams);
  return newExam;
}

// 2. Teacher authors questions
export function updateExamQuestions(examId, questions) {
  const exams = getExams();
  const index = exams.findIndex(e => e.id === examId);
  if (index === -1) return null;

  if (exams[index].status === EXAM_STATUS.PENDING_ADMIN || exams[index].status === EXAM_STATUS.APPROVED) {
    throw new Error("Questions are locked during admin review or after approval.");
  }

  exams[index].questions = questions;
  saveExams(exams);
  return exams[index];
}

// 3. Teacher Submits Paper to Admin (LOCKS TEACHER, UNLOCKS ADMIN REVIEW)
export function submitExamPaper(examId) {
  const exams = getExams();
  const index = exams.findIndex(e => e.id === examId);
  if (index === -1) return null;

  exams[index].status = EXAM_STATUS.PENDING_ADMIN;
  exams[index].submittedAt = new Date().toLocaleString();
  saveExams(exams);
  return exams[index];
}

// 4. Admin Approves & Publishes Exam (FINAL LOCK)
export function approveExam(examId, approvalNote = "") {
  const exams = getExams();
  const index = exams.findIndex(e => e.id === examId);
  if (index === -1) return null;

  exams[index].status = EXAM_STATUS.APPROVED;
  exams[index].approvedAt = new Date().toLocaleString();
  if (approvalNote) {
    exams[index].adminFeedback = approvalNote;
  }
  saveExams(exams);
  return exams[index];
}

// 5. Admin Requests Revision (UNLOCKS TEACHER WITH FEEDBACK)
export function requestExamRevision(examId, feedbackNote) {
  const exams = getExams();
  const index = exams.findIndex(e => e.id === examId);
  if (index === -1) return null;

  exams[index].status = EXAM_STATUS.REVISION;
  exams[index].adminFeedback = feedbackNote;
  saveExams(exams);
  return exams[index];
}
