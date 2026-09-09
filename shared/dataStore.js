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

// Seed initial storage with CLEAN EMPTY states (purge old fake mock data)
function initLocalData() {
  // Purge old mock seed data once
  if (localStorage.getItem("apex_seed_purged_v3") !== "true") {
    localStorage.removeItem(STORAGE_KEYS.EXAMS);
    localStorage.removeItem(STORAGE_KEYS.BATCHES);
    localStorage.removeItem(STORAGE_KEYS.CERTIFICATES);
    localStorage.removeItem(STORAGE_KEYS.INQUIRIES);
    localStorage.removeItem(STORAGE_KEYS.STUDENTS);
    localStorage.setItem("apex_seed_purged_v3", "true");
  }

  if (!localStorage.getItem(STORAGE_KEYS.COURSES)) {
    localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(SEED_COURSES));
  }
  if (!localStorage.getItem(STORAGE_KEYS.BATCHES)) {
    localStorage.setItem(STORAGE_KEYS.BATCHES, JSON.stringify([]));
  }
  if (!localStorage.getItem(STORAGE_KEYS.CERTIFICATES)) {
    localStorage.setItem(STORAGE_KEYS.CERTIFICATES, JSON.stringify([]));
  }
  if (!localStorage.getItem(STORAGE_KEYS.EXAMS)) {
    localStorage.setItem(STORAGE_KEYS.EXAMS, JSON.stringify([]));
  }
  if (!localStorage.getItem(STORAGE_KEYS.INQUIRIES)) {
    localStorage.setItem(STORAGE_KEYS.INQUIRIES, JSON.stringify([]));
  }
  if (!localStorage.getItem(STORAGE_KEYS.STUDENTS)) {
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify([]));
  }
  if (!localStorage.getItem(STORAGE_KEYS.TEACHERS)) {
    localStorage.setItem(STORAGE_KEYS.TEACHERS, JSON.stringify([]));
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
