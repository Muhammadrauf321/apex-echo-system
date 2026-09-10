import { 
  collection, 
  doc,
  setDoc,
  deleteDoc,
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

// Seed initial storage with 100% clean, fresh real store
function initLocalData() {
  if (typeof window === "undefined" || typeof localStorage === "undefined") return;

  // Enforce 100% fresh startup purge: removes all old fake batches, exams, teachers, students, AND messages
  if (localStorage.getItem("apex_fresh_clean_v8") !== "true") {
    localStorage.removeItem(STORAGE_KEYS.BATCHES);
    localStorage.removeItem(STORAGE_KEYS.CERTIFICATES);
    localStorage.removeItem(STORAGE_KEYS.EXAMS);
    localStorage.removeItem(STORAGE_KEYS.INQUIRIES);
    localStorage.removeItem(STORAGE_KEYS.TEACHERS);
    localStorage.removeItem(STORAGE_KEYS.STUDENTS);
    localStorage.removeItem(STORAGE_KEYS.MESSAGES);
    localStorage.setItem(STORAGE_KEYS.BATCHES, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.CERTIFICATES, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.EXAMS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.INQUIRIES, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.TEACHERS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify({}));
    localStorage.setItem("apex_fresh_clean_v8", "true");
  }

  if (!localStorage.getItem(STORAGE_KEYS.MESSAGES)) {
    localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify({}));
  }

  // Pure zero-mock course store: never inject seed courses if initialized
  if (!localStorage.getItem("apex_courses_initialized")) {
    if (!localStorage.getItem(STORAGE_KEYS.COURSES)) {
      localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify([]));
    }
    localStorage.setItem("apex_courses_initialized", "true");
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
  if (typeof window === "undefined" || typeof localStorage === "undefined") {
    return [];
  }
  const data = localStorage.getItem(STORAGE_KEYS.COURSES);
  if (data !== null) {
    try {
      return JSON.parse(data);
    } catch (e) {
      return [];
    }
  }
  return [];
}

// Real-time Firestore courses subscription (Syncs Management LMS & Public Website across devices)
export function subscribeToCourses(callback) {
  if (typeof window === "undefined") return () => {};

  // 1. Immediately emit current local cache
  callback(getCourses());

  // 2. Real-time Firestore snapshot listener
  let unsubscribeFirestore = () => {};
  try {
    const colRef = collection(db, "courses");
    unsubscribeFirestore = onSnapshot(colRef, (snapshot) => {
      const liveCourses = [];
      snapshot.forEach(docSnap => {
        liveCourses.push({ id: docSnap.id, ...docSnap.data() });
      });

      // Sort by createdAt descending
      liveCourses.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

      // Save to local cache & mark initialized
      localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(liveCourses));
      localStorage.setItem("apex_courses_initialized", "true");

      // Notify callback & dispatch window event
      callback(liveCourses);
      window.dispatchEvent(new CustomEvent("apex_courses_changed", { detail: liveCourses }));
    }, (err) => {
      console.warn("Firestore courses subscription notice:", err);
    });
  } catch (e) {
    console.warn("Firestore connection error:", e);
  }

  // 3. Local custom event listener fallback
  const handleLocalChange = (e) => {
    if (e.detail) {
      callback(e.detail);
    }
  };
  window.addEventListener("apex_courses_changed", handleLocalChange);

  return () => {
    unsubscribeFirestore();
    window.removeEventListener("apex_courses_changed", handleLocalChange);
  };
}

export async function addCourse(courseData) {
  const courses = getCourses();
  const slugId = courseData.title
    ? courseData.title.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "")
    : `crs_${Date.now()}`;
  const courseId = `crs_${slugId}_${Date.now().toString(36)}`;
  
  const newCourse = {
    id: courseId,
    title: (courseData.title || "Untitled Course").trim(),
    category: (courseData.category || "General Studies").trim(),
    tagline: (courseData.tagline || "").trim(),
    duration: (courseData.duration || "3 Months (12 Weeks)").trim(),
    sessionsPerWeek: (courseData.sessionsPerWeek || "4 Days / Week").trim(),
    fee: Number(courseData.fee) || 20000,
    installments: Number(courseData.installments) || 2,
    level: courseData.level || "Beginner to Advanced",
    instructorName: courseData.instructorName || "To be assigned",
    instructorRole: courseData.instructorRole || "Faculty Instructor",
    rating: 5.0,
    reviewsCount: 0,
    badge: courseData.badge || "New Course",
    icon: courseData.icon || "BookOpen",
    modules: courseData.modules && courseData.modules.length > 0 ? courseData.modules : [
      "Core Foundations & Program Overview",
      "Applied Practical Projects & Practical Labs",
      "Industry Capstone & Final Evaluation"
    ],
    prerequisites: courseData.prerequisites || "Basic literacy and logical thinking.",
    createdAt: new Date().toISOString()
  };

  const updated = [newCourse, ...courses.filter(c => c.id !== courseId)];
  localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(updated));
  localStorage.setItem("apex_courses_initialized", "true");
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("apex_courses_changed", { detail: updated }));
  }

  // Sync to Cloud Firestore
  try {
    await setDoc(doc(db, "courses", courseId), newCourse);
  } catch (fsErr) {
    console.warn("Firestore addCourse sync notice:", fsErr);
  }

  return newCourse;
}

export async function updateCourse(id, updatedFields) {
  const courses = getCourses();
  const updated = courses.map(c => c.id === id ? { ...c, ...updatedFields } : c);
  localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(updated));
  localStorage.setItem("apex_courses_initialized", "true");
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("apex_courses_changed", { detail: updated }));
  }

  // Sync to Cloud Firestore
  try {
    await setDoc(doc(db, "courses", id), updatedFields, { merge: true });
  } catch (fsErr) {
    console.warn("Firestore updateCourse sync notice:", fsErr);
  }

  return updated;
}

export async function deleteCourse(id) {
  const courses = getCourses();
  const updated = courses.filter(c => c.id !== id);
  localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(updated));
  localStorage.setItem("apex_courses_initialized", "true");
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("apex_courses_changed", { detail: updated }));
  }

  // Delete from Cloud Firestore
  try {
    await deleteDoc(doc(db, "courses", id));
  } catch (fsErr) {
    console.warn("Firestore deleteCourse sync notice:", fsErr);
  }

  return updated;
}

export async function deleteAllCourses() {
  localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify([]));
  localStorage.setItem("apex_courses_initialized", "true");
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("apex_courses_changed", { detail: [] }));
  }

  // Delete all from Cloud Firestore
  try {
    const colRef = collection(db, "courses");
    const snapshot = await getDocs(colRef);
    const deletePromises = [];
    snapshot.forEach((docSnap) => {
      deletePromises.push(deleteDoc(doc(db, "courses", docSnap.id)));
    });
    await Promise.all(deletePromises);
  } catch (fsErr) {
    console.warn("Firestore deleteAllCourses sync notice:", fsErr);
  }

  return [];
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

export function deleteMessage(channelId, messageId) {
  const all = JSON.parse(localStorage.getItem(STORAGE_KEYS.MESSAGES) || "{}");
  if (!all[channelId]) return;
  all[channelId] = all[channelId].filter(m => m.id !== messageId);
  localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(all));
  window.dispatchEvent(new CustomEvent("apex_messages_changed", { detail: { channelId } }));
}

export function clearChannelMessages(channelId) {
  const all = JSON.parse(localStorage.getItem(STORAGE_KEYS.MESSAGES) || "{}");
  all[channelId] = [];
  localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(all));
  window.dispatchEvent(new CustomEvent("apex_messages_changed", { detail: { channelId } }));
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
