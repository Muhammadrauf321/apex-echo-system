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
  DEMO_USERS,
  SEED_EXAMS
} from "./seedData.js";
import { EXAM_STATUS } from "./constants.js";

// In-memory / LocalStorage cache for immediate responsive feedback
const STORAGE_KEYS = {
  COURSES: "apex_courses",
  BATCHES: "apex_batches",
  INQUIRIES: "apex_inquiries",
  MESSAGES: "apex_messages",
  CERTIFICATES: "apex_certificates",
  ATTENDANCE: "apex_attendance",
  EXAMS: "apex_exams"
};

// Seed initial storage if not populated
function initLocalData() {
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
    localStorage.setItem(STORAGE_KEYS.INQUIRIES, JSON.stringify([
      {
        id: "inq_01",
        name: "Danyal Sheikh",
        phone: "+92 300 1234567",
        email: "danyal@gmail.com",
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
        email: "mehwish.r@gmail.com",
        courseId: "lang_spoken_english",
        courseTitle: "Spoken English & Fluency Mastery",
        preferredSlot: "Morning (09:00 AM - 11:00 AM)",
        status: "approved",
        date: "2026-09-05"
      }
    ]));
  }
  if (!localStorage.getItem(STORAGE_KEYS.MESSAGES)) {
    localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify({
      "announcements": [
        {
          id: "msg_a1",
          senderId: "usr_dir_01",
          senderName: "Muhammad Rauf (Director)",
          senderRole: "director",
          avatar: DEMO_USERS[0].avatar,
          type: "text",
          content: "Welcome to Apex Education Forum! New batches for Full-Stack MERN and Spoken English start next Monday. Make sure all enrolled students have registered their lab seats.",
          timestamp: "Today at 09:30 AM"
        }
      ],
      "spoken-english-b1": [
        {
          id: "msg_se1",
          senderId: "usr_ins_02",
          senderName: "Sir Salman Tareen",
          senderRole: "instructor",
          avatar: DEMO_USERS[3].avatar,
          type: "text",
          content: "Good morning class! Today's speaking topic: 'How Artificial Intelligence is changing modern careers'. Please record a 45-second voice note sharing your thoughts.",
          timestamp: "Today at 10:15 AM"
        },
        {
          id: "msg_se2",
          senderId: "usr_std_02",
          senderName: "Zainab Fatima",
          senderRole: "student",
          avatar: DEMO_USERS[5].avatar,
          type: "audio",
          duration: "0:42",
          audioUrl: "#mock-audio-zainab",
          content: "Voice note submission: AI impact on creative arts and translation.",
          timestamp: "Today at 10:22 AM"
        }
      ],
      "web-dev-b2": [
        {
          id: "msg_wd1",
          senderId: "usr_ins_01",
          senderName: "Engr. Bilal Ahmed",
          senderRole: "instructor",
          avatar: DEMO_USERS[2].avatar,
          type: "text",
          content: "Here is the starter code for our custom React hook we discussed in lab yesterday. Test it with your API endpoints:",
          timestamp: "Yesterday at 04:00 PM"
        },
        {
          id: "msg_wd2",
          senderId: "usr_ins_01",
          senderName: "Engr. Bilal Ahmed",
          senderRole: "instructor",
          avatar: DEMO_USERS[2].avatar,
          type: "code",
          language: "javascript",
          content: "function useFetch(url) {\n  const [data, setData] = useState(null);\n  const [loading, setLoading] = useState(true);\n  useEffect(() => {\n    fetch(url).then(r => r.json()).then(d => {\n      setData(d);\n      setLoading(false);\n    });\n  }, [url]);\n  return { data, loading };\n}",
          timestamp: "Yesterday at 04:02 PM"
        },
        {
          id: "msg_wd3",
          senderId: "usr_std_01",
          senderName: "Hamza Tariq",
          senderRole: "student",
          avatar: DEMO_USERS[4].avatar,
          type: "text",
          content: "Thank you Sir! Just integrated it with Firestore snapshot listener and it's working flawlessly!",
          timestamp: "Yesterday at 04:15 PM"
        }
      ]
    }));
  }
}

initLocalData();

// Get Courses
export function getCourses() {
  const data = localStorage.getItem(STORAGE_KEYS.COURSES);
  return data ? JSON.parse(data) : SEED_COURSES;
}

// Get Batches
export function getBatches() {
  const data = localStorage.getItem(STORAGE_KEYS.BATCHES);
  return data ? JSON.parse(data) : SEED_BATCHES;
}

// Create new Batch
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

// Submit Admission / Demo Class Inquiry
export async function submitInquiry(inquiryData) {
  const newInq = {
    id: `inq_${Date.now()}`,
    status: "pending",
    date: new Date().toISOString().split("T")[0],
    ...inquiryData
  };

  // 1. Save to LocalStorage
  const list = getInquiries();
  list.unshift(newInq);
  localStorage.setItem(STORAGE_KEYS.INQUIRIES, JSON.stringify(list));
  window.dispatchEvent(new CustomEvent("apex_inquiries_changed", { detail: list }));

  // 2. Also try writing to live Firestore
  try {
    await addDoc(collection(db, "inquiries"), {
      ...newInq,
      createdAt: serverTimestamp()
    });
  } catch (e) {
    console.warn("Firestore inquiry sync (offline fallback active):", e);
  }

  return newInq;
}

// Get all Inquiries
export function getInquiries() {
  const data = localStorage.getItem(STORAGE_KEYS.INQUIRIES);
  return data ? JSON.parse(data) : [];
}

// Update Inquiry Status (e.g. approve admission)
export function updateInquiryStatus(id, status) {
  const list = getInquiries();
  const updated = list.map(item => item.id === id ? { ...item, status } : item);
  localStorage.setItem(STORAGE_KEYS.INQUIRIES, JSON.stringify(updated));
  window.dispatchEvent(new CustomEvent("apex_inquiries_changed", { detail: updated }));
  return updated;
}

// Get Messages for a channel
export function getChannelMessages(channelId) {
  const all = JSON.parse(localStorage.getItem(STORAGE_KEYS.MESSAGES) || "{}");
  return all[channelId] || [];
}

// Send Message (Text, Voice Note, or Code)
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

  // Also push to Firestore
  try {
    await addDoc(collection(db, "channels", channelId, "messages"), {
      ...newMsg,
      createdAt: serverTimestamp()
    });
  } catch (e) {
    // Fallback gracefully
  }

  return newMsg;
}

// Verify Certificate by ID
export function verifyCertificate(certificateId) {
  const certs = JSON.parse(localStorage.getItem(STORAGE_KEYS.CERTIFICATES) || "[]");
  return certs.find(c => c.certificateId.trim().toUpperCase() === certificateId.trim().toUpperCase()) || null;
}

// Issue new Certificate
export function issueCertificate(certData) {
  const certs = JSON.parse(localStorage.getItem(STORAGE_KEYS.CERTIFICATES) || "[]");
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

// --- Examination Rotation Lifecycle Store ---

export function getExams() {
  const data = localStorage.getItem(STORAGE_KEYS.EXAMS);
  if (!data) return SEED_EXAMS;
  try {
    return JSON.parse(data);
  } catch (e) {
    return SEED_EXAMS;
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

// 1. Admin creates scheduled exam (Assigned to Teacher, Admin question access is LOCKED)
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

// 2. Teacher updates / authors question draft (While in PENDING_TEACHER or REVISION)
export function updateExamQuestions(examId, questions) {
  const exams = getExams();
  const index = exams.findIndex(e => e.id === examId);
  if (index === -1) return null;

  // Only allowed if not pending admin review or already approved
  if (exams[index].status === EXAM_STATUS.PENDING_ADMIN || exams[index].status === EXAM_STATUS.APPROVED) {
    throw new Error("Action not permitted: Exam questions are locked during admin review or after approval.");
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

// 5. Admin Requests Revision / Returns to Teacher with Notes (UNLOCKS TEACHER)
export function requestExamRevision(examId, feedbackNote) {
  const exams = getExams();
  const index = exams.findIndex(e => e.id === examId);
  if (index === -1) return null;

  exams[index].status = EXAM_STATUS.REVISION;
  exams[index].adminFeedback = feedbackNote;
  saveExams(exams);
  return exams[index];
}

