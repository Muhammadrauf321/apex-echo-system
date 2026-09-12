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

// Seed initial storage with 100% clean, fresh real store (Zero mock data)
function initLocalData() {
  if (typeof window === "undefined" || typeof localStorage === "undefined") return;

  // Enforce 100% fresh startup purge: removes all old fake courses, batches, exams, teachers, students, AND messages
  if (localStorage.getItem("apex_clean_slate_v10") !== "true") {
    localStorage.removeItem(STORAGE_KEYS.COURSES);
    localStorage.removeItem("apex_courses_initialized");
    localStorage.removeItem(STORAGE_KEYS.BATCHES);
    localStorage.removeItem(STORAGE_KEYS.CERTIFICATES);
    localStorage.removeItem(STORAGE_KEYS.EXAMS);
    localStorage.removeItem(STORAGE_KEYS.INQUIRIES);
    localStorage.removeItem(STORAGE_KEYS.TEACHERS);
    localStorage.removeItem(STORAGE_KEYS.STUDENTS);
    localStorage.removeItem(STORAGE_KEYS.MESSAGES);
    localStorage.removeItem("apex_attendance");
    localStorage.removeItem("apex_invitations");
    localStorage.removeItem("apex_account_invitations");
    localStorage.removeItem("apex_dispatched_emails");

    // Clear dynamic exam results
    try {
      Object.keys(localStorage).forEach(k => {
        if (k.startsWith("apex_exam_results_")) {
          localStorage.removeItem(k);
        }
      });
    } catch (e) {}

    localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.BATCHES, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.CERTIFICATES, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.EXAMS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.INQUIRIES, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.TEACHERS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify({}));
    localStorage.setItem("apex_clean_slate_v10", "true");
  }

  if (!localStorage.getItem(STORAGE_KEYS.MESSAGES)) {
    localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify({}));
  }

  // Pure zero-mock course store: never inject seed courses
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
  if (typeof window === "undefined" || typeof localStorage === "undefined") return [];
  const data = localStorage.getItem(STORAGE_KEYS.TEACHERS);
  let teachers = data ? JSON.parse(data) : [];

  // Cross-check with invitations & registered accounts:
  // If any teacher has an activated invitation or registered account, make sure their status reflects "active"
  try {
    const invData = localStorage.getItem("apex_account_invitations");
    const invitations = invData ? JSON.parse(invData) : [];
    const accountsData = localStorage.getItem("apex_accounts");
    const accounts = accountsData ? JSON.parse(accountsData) : [];

    let modified = false;
    teachers = teachers.map(t => {
      const cleanEmail = t.email?.trim().toLowerCase();
      const isInvActivated = invitations.some(i => i.email?.trim().toLowerCase() === cleanEmail && i.status === "activated");
      const isAccountActive = accounts.some(a => a.email?.trim().toLowerCase() === cleanEmail && a.status === "active");
      
      if (t.status === "pending_activation" && (isInvActivated || isAccountActive)) {
        modified = true;
        return { ...t, status: "active", activatedAt: t.activatedAt || new Date().toISOString() };
      }
      return t;
    });

    if (modified) {
      localStorage.setItem(STORAGE_KEYS.TEACHERS, JSON.stringify(teachers));
    }
  } catch (e) {
    // Graceful fallback
  }

  return teachers;
}

// Real-time Cloud Firestore subscription for Teachers
export function subscribeToTeachers(callback) {
  if (typeof window === "undefined") return () => {};

  // 1. Immediately emit current local state
  callback(getTeachers());

  // 2. Real-time Firestore snapshot listener
  let unsubscribeFirestore = () => {};
  try {
    const colRef = collection(db, "teachers");
    unsubscribeFirestore = onSnapshot(colRef, (snapshot) => {
      const liveTeachers = [];
      snapshot.forEach(docSnap => {
        liveTeachers.push({ id: docSnap.id, ...docSnap.data() });
      });

      if (liveTeachers.length > 0) {
        // Merge with local cache
        const local = getTeachers();
        const mergedMap = new Map();
        local.forEach(t => mergedMap.set(t.email?.toLowerCase(), t));
        liveTeachers.forEach(t => {
          const key = t.email?.toLowerCase();
          if (mergedMap.has(key)) {
            const current = mergedMap.get(key);
            mergedMap.set(key, {
              ...current,
              ...t,
              status: (t.status === "active" || current.status === "active") ? "active" : t.status
            });
          } else {
            mergedMap.set(key, t);
          }
        });

        const merged = Array.from(mergedMap.values());
        localStorage.setItem(STORAGE_KEYS.TEACHERS, JSON.stringify(merged));
        callback(merged);
        window.dispatchEvent(new CustomEvent("apex_teachers_changed", { detail: merged }));
      }
    }, (err) => {
      console.warn("Firestore teachers subscription notice:", err);
    });
  } catch (e) {
    console.warn("Firestore connection error:", e);
  }

  // 3. Local custom event listener
  const handleLocalChange = (e) => {
    if (e.detail) {
      callback(e.detail);
    } else {
      callback(getTeachers());
    }
  };
  window.addEventListener("apex_teachers_changed", handleLocalChange);

  return () => {
    unsubscribeFirestore();
    window.removeEventListener("apex_teachers_changed", handleLocalChange);
  };
}

export async function addTeacher(teacherData) {
  const teachers = getTeachers();
  const cleanEmail = (teacherData.email || "").trim().toLowerCase();
  const existing = teachers.find(t => t.email?.trim().toLowerCase() === cleanEmail);
  if (existing) {
    return existing;
  }
  const teacherId = `tch_${Date.now()}`;
  const newTeacher = {
    id: teacherId,
    name: (teacherData.name || "").trim(),
    email: cleanEmail,
    department: teacherData.department || "IT & Web Development",
    phone: teacherData.phone || "",
    role: "instructor",
    status: teacherData.status || "pending_activation",
    createdAt: new Date().toISOString()
  };
  teachers.push(newTeacher);
  localStorage.setItem(STORAGE_KEYS.TEACHERS, JSON.stringify(teachers));
  window.dispatchEvent(new CustomEvent("apex_teachers_changed", { detail: teachers }));

  // Save to Cloud Firestore
  try {
    await setDoc(doc(db, "teachers", teacherId), newTeacher);
  } catch (err) {
    console.warn("Firestore addTeacher sync notice:", err);
  }

  return newTeacher;
}

export async function updateTeacherStatus(emailOrId, newStatus = "active") {
  const teachers = getTeachers();
  const cleanKey = (emailOrId || "").trim().toLowerCase();

  let updatedTeacher = null;
  const updated = teachers.map(t => {
    if (t.id === emailOrId || t.email?.trim().toLowerCase() === cleanKey) {
      updatedTeacher = { ...t, status: newStatus, activatedAt: new Date().toISOString() };
      return updatedTeacher;
    }
    return t;
  });

  localStorage.setItem(STORAGE_KEYS.TEACHERS, JSON.stringify(updated));
  window.dispatchEvent(new CustomEvent("apex_teachers_changed", { detail: updated }));

  // Update in Cloud Firestore
  try {
    if (updatedTeacher?.id) {
      await setDoc(doc(db, "teachers", updatedTeacher.id), updatedTeacher, { merge: true });
    } else if (cleanKey) {
      // Find doc in Firestore by email query
      const colRef = collection(db, "teachers");
      const snapshot = await getDocs(colRef);
      snapshot.forEach(async (docSnap) => {
        const d = docSnap.data();
        if (d.email?.toLowerCase() === cleanKey) {
          await setDoc(doc(db, "teachers", docSnap.id), { status: newStatus, activatedAt: new Date().toISOString() }, { merge: true });
        }
      });
    }

    // Also update any invitations matching email in Firestore & localStorage
    if (cleanKey) {
      const invData = localStorage.getItem("apex_account_invitations");
      if (invData) {
        const invs = JSON.parse(invData);
        const updatedInvs = invs.map(i => i.email?.toLowerCase() === cleanKey ? { ...i, status: newStatus === "active" ? "activated" : i.status } : i);
        localStorage.setItem("apex_account_invitations", JSON.stringify(updatedInvs));
        window.dispatchEvent(new CustomEvent("apex_invitations_changed", { detail: updatedInvs }));
      }

      try {
        const invCol = collection(db, "invitations");
        const snapshot = await getDocs(invCol);
        snapshot.forEach(async (docSnap) => {
          const d = docSnap.data();
          if (d.email?.toLowerCase() === cleanKey) {
            await setDoc(doc(db, "invitations", docSnap.id), { status: newStatus === "active" ? "activated" : d.status, activatedAt: new Date().toISOString() }, { merge: true });
          }
        });
      } catch (invErr) {
        console.warn("Firestore invitations status sync notice:", invErr);
      }
    }
  } catch (fsErr) {
    console.warn("Firestore updateTeacherStatus notice:", fsErr);
  }

  return updated;
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

export async function updateBatchStatus(batchId, status) {
  const batches = getBatches();
  const idx = batches.findIndex(b => b.id === batchId || b.batchCode === batchId);
  if (idx !== -1) {
    batches[idx].status = status;
    if (status === "completed") {
      batches[idx].completedAt = new Date().toISOString();
    }
    localStorage.setItem(STORAGE_KEYS.BATCHES, JSON.stringify(batches));
    window.dispatchEvent(new CustomEvent("apex_batches_changed", { detail: batches }));
    try {
      await setDoc(doc(db, "batches", batches[idx].id), { 
        status,
        completedAt: batches[idx].completedAt || new Date().toISOString()
      }, { merge: true });
    } catch (e) {}
    return batches[idx];
  }
  return null;
}

export async function issueBatchGraduationCertificates(batchId, studentSelection = null, options = {}) {
  const batches = getBatches();
  const batch = batches.find(b => b.id === batchId || b.batchCode === batchId);
  if (!batch) return [];

  const allStudents = getStudents();
  let batchStudents = allStudents.filter(s => s.batchCode === batch.batchCode || s.batchId === batch.id);
  if (batchStudents.length === 0) {
    batchStudents = allStudents.filter(s => s.course === batch.courseTitle);
  }

  const targetStudents = studentSelection && Array.isArray(studentSelection)
    ? (studentSelection[0] && typeof studentSelection[0] === "object"
        ? studentSelection
        : allStudents.filter(s => studentSelection.includes(s.id) || studentSelection.includes(s.rollNo)))
    : batchStudents;

  const dirProfile = getDirectorProfile();
  const certs = getCertificates();
  const issuedList = [];

  for (let i = 0; i < targetStudents.length; i++) {
    const std = targetStudents[i];
    const stdName = std.studentName || (std.fatherName ? `${std.name} s/o ${std.fatherName}` : std.name);
    const rollNo = std.rollNo || std.rollNumber || `AEF-${Math.floor(100 + Math.random() * 900)}/${new Date().getFullYear()}`;
    const certNumber = `aef / ${new Date().getFullYear()}`;

    // Check if certificate already exists
    let existingIndex = certs.findIndex(c => 
      c.studentId === std.id || 
      (c.rollNumber && c.rollNumber === rollNo && (c.batchCode === batch.batchCode || c.courseTitle === (batch.courseTitle || std.course)))
    );

    if (existingIndex !== -1) {
      certs[existingIndex].courseTitle = options.courseTitle || certs[existingIndex].courseTitle || batch.courseTitle || "Basic Computer Course";
      certs[existingIndex].duration = options.duration || certs[existingIndex].duration || "Six Months";
      certs[existingIndex].issueDate = options.issueDate || certs[existingIndex].issueDate || new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      certs[existingIndex].directorName = dirProfile.name || certs[existingIndex].directorName || "Yasir Ali";
      certs[existingIndex].directorTitle = dirProfile.title || certs[existingIndex].directorTitle || "Director";
      certs[existingIndex].grade = std.grade || options.grade || certs[existingIndex].grade || "Passed (A+)";
      certs[existingIndex].batchCode = batch.batchCode || certs[existingIndex].batchCode;
      certs[existingIndex].batchId = batch.id || certs[existingIndex].batchId;
      issuedList.push(certs[existingIndex]);

      try {
        await setDoc(doc(db, "certificates", certs[existingIndex].id), certs[existingIndex], { merge: true });
      } catch (fsErr) {}
    } else {
      const newCert = {
        id: `cert_batch_${batch.batchCode || batch.id}_${std.id || i}_${Date.now()}`,
        studentId: std.id,
        studentName: stdName,
        courseTitle: options.courseTitle || batch.courseTitle || std.course || "Basic Computer Course",
        duration: options.duration || "Six Months",
        issueDate: options.issueDate || new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        rollNumber: rollNo,
        certificateNumber: certNumber,
        certificateId: rollNo,
        grade: std.grade || options.grade || "Passed (A+)",
        batchId: batch.id,
        batchCode: batch.batchCode,
        status: "Verified Authentic",
        directorName: dirProfile.name || "Yasir Ali",
        directorTitle: dirProfile.title || "Director",
        createdAt: new Date().toISOString()
      };

      certs.unshift(newCert);
      issuedList.push(newCert);

      try {
        await setDoc(doc(db, "certificates", newCert.id), newCert, { merge: true });
      } catch (fsErr) {
        console.warn("Firestore batch certificate sync error:", fsErr);
      }
    }
  }

  try {
    await updateBatchStatus(batch.id, "completed");
  } catch (e) {}

  localStorage.setItem(STORAGE_KEYS.CERTIFICATES, JSON.stringify(certs));
  window.dispatchEvent(new CustomEvent("apex_certificates_changed", { detail: certs }));

  return issuedList;
}

// --- Students ---
export function getStudents() {
  const data = localStorage.getItem(STORAGE_KEYS.STUDENTS);
  if (!data) return [];
  try {
    const list = JSON.parse(data);
    return list.map((s, idx) => ({
      ...s,
      rollNo: s.rollNo || `APX-2026-${String(idx + 1).padStart(4, "0")}`,
      fatherName: s.fatherName || "",
      guardianName: s.guardianName || s.fatherName || "",
      guardianPhone: s.guardianPhone || s.phone || "",
      cnicOrBForm: s.cnicOrBForm || "",
      arrears: Number(s.arrears) || 0,
      totalFee: Number(s.totalFee) || 20000,
      paidFee: Number(s.paidFee) || 0
    }));
  } catch (e) {
    return [];
  }
}

export function saveStudents(students) {
  localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
  window.dispatchEvent(new CustomEvent("apex_students_changed", { detail: students }));
}

export function enrollStudent(studentData) {
  const students = getStudents();
  const newStudent = {
    id: `std_${Date.now().toString().slice(-4)}`,
    rollNo: studentData.rollNo || `APX-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
    name: studentData.name,
    fatherName: studentData.fatherName || "",
    guardianName: studentData.guardianName || studentData.fatherName || "",
    guardianPhone: studentData.guardianPhone || studentData.phone || "",
    cnicOrBForm: studentData.cnicOrBForm || "",
    email: studentData.email || "",
    phone: studentData.phone || "",
    emergencyContact: studentData.emergencyContact || studentData.guardianPhone || "",
    course: studentData.course,
    batchCode: studentData.batchCode || "Assigned Soon",
    totalFee: Number(studentData.totalFee) || 20000,
    paidFee: Number(studentData.paidFee) || 0,
    arrears: Number(studentData.arrears) || 0,
    status: (Number(studentData.paidFee) || 0) >= (Number(studentData.totalFee) || 20000) ? FEE_STATUS.PAID : FEE_STATUS.PENDING,
    activationStatus: studentData.activationStatus || "pending_activation",
    attendance: studentData.attendance || 100,
    createdAt: new Date().toISOString()
  };
  const updated = [newStudent, ...students];
  saveStudents(updated);
  return newStudent;
}

// --- Exam Results / Marksheets ---
export function getExamResults(examId) {
  const allResults = JSON.parse(localStorage.getItem("apex_exam_results") || "{}");
  return examId ? (allResults[examId] || []) : allResults;
}

export function saveExamResults(examId, results) {
  const allResults = JSON.parse(localStorage.getItem("apex_exam_results") || "{}");
  allResults[examId] = results;
  localStorage.setItem("apex_exam_results", JSON.stringify(allResults));
  window.dispatchEvent(new CustomEvent("apex_exam_results_changed", { detail: { examId, results } }));
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

// --- Institutional Settings & Director Profile (Dynamic Across System) ---
export function getDirectorProfile() {
  if (typeof localStorage === "undefined") {
    return { name: "Yasir Ali", title: "Director" };
  }
  const data = localStorage.getItem("apex_director_profile");
  if (data) {
    try {
      return JSON.parse(data);
    } catch (e) {}
  }
  return {
    name: "Yasir Ali",
    title: "Director"
  };
}

export async function saveDirectorProfile(profile) {
  if (typeof localStorage !== "undefined") {
    localStorage.setItem("apex_director_profile", JSON.stringify(profile));
    window.dispatchEvent(new CustomEvent("apex_director_profile_changed", { detail: profile }));
  }
  try {
    await setDoc(doc(db, "settings", "director_profile"), profile, { merge: true });
  } catch (fsErr) {
    console.warn("Firestore director profile save notice:", fsErr);
  }
}

export function subscribeToDirectorProfile(callback) {
  if (typeof window === "undefined") return () => {};

  callback(getDirectorProfile());

  let unsubscribeFirestore = () => {};
  try {
    unsubscribeFirestore = onSnapshot(doc(db, "settings", "director_profile"), (snap) => {
      if (snap.exists()) {
        const live = snap.data();
        localStorage.setItem("apex_director_profile", JSON.stringify(live));
        callback(live);
        window.dispatchEvent(new CustomEvent("apex_director_profile_changed", { detail: live }));
      }
    });
  } catch (e) {}

  const handleLocal = (e) => {
    callback(e.detail || getDirectorProfile());
  };
  window.addEventListener("apex_director_profile_changed", handleLocal);

  return () => {
    unsubscribeFirestore();
    window.removeEventListener("apex_director_profile_changed", handleLocal);
  };
}

// --- Certificates ---
export function getCertificates() {
  if (typeof localStorage === "undefined") return [];
  const data = localStorage.getItem(STORAGE_KEYS.CERTIFICATES);
  let certs = data ? JSON.parse(data) : [];

  // Seed sample official certificate from institutional archives if registry is empty
  if (!certs || certs.length === 0) {
    certs = [
      {
        id: "cert_official_aef_217_2024",
        certificateId: "AEF-217/2024",
        certificateNumber: "aef / 2026",
        rollNumber: "AEF-217/2024",
        studentName: "Amjad Ali s/o Kabil",
        courseTitle: "Basic Computer Course",
        duration: "Six Months",
        issueDate: "September 2024",
        grade: "Distinction (A+)",
        status: "Verified Authentic",
        directorName: "Yasir Ali",
        directorTitle: "Director",
        createdAt: new Date().toISOString()
      }
    ];
    localStorage.setItem(STORAGE_KEYS.CERTIFICATES, JSON.stringify(certs));
  }
  return certs;
}

export function subscribeToCertificates(callback) {
  if (typeof window === "undefined") return () => {};

  callback(getCertificates());

  let unsubscribeFirestore = () => {};
  try {
    const colRef = collection(db, "certificates");
    unsubscribeFirestore = onSnapshot(colRef, (snapshot) => {
      if (!snapshot.empty) {
        const liveCerts = [];
        snapshot.forEach(docSnap => {
          liveCerts.push({ id: docSnap.id, ...docSnap.data() });
        });
        localStorage.setItem(STORAGE_KEYS.CERTIFICATES, JSON.stringify(liveCerts));
        callback(liveCerts);
        window.dispatchEvent(new CustomEvent("apex_certificates_changed", { detail: liveCerts }));
      }
    }, (err) => {
      console.warn("Firestore certificates subscription notice:", err);
    });
  } catch (e) {}

  const handleLocal = (e) => {
    callback(e.detail || getCertificates());
  };
  window.addEventListener("apex_certificates_changed", handleLocal);

  return () => {
    unsubscribeFirestore();
    window.removeEventListener("apex_certificates_changed", handleLocal);
  };
}

export function verifyCertificate(certificateId) {
  if (!certificateId) return null;
  const certs = getCertificates();
  const query = certificateId.trim().toUpperCase();
  const found = certs.find(c => 
    (c.certificateId && c.certificateId.trim().toUpperCase() === query) ||
    (c.certificateNumber && c.certificateNumber.trim().toUpperCase() === query) ||
    (c.rollNumber && c.rollNumber.trim().toUpperCase() === query) ||
    (c.studentName && c.studentName.trim().toUpperCase() === query)
  );
  if (!found) return null;

  // Dynamically attach live Director profile so certificate updates instantly when Director changes name
  const dirProfile = getDirectorProfile();
  return {
    ...found,
    valid: true,
    directorName: dirProfile.name || found.directorName || "Yasir Ali",
    directorTitle: dirProfile.title || found.directorTitle || "Director"
  };
}

export async function issueCertificate(certData) {
  const certs = getCertificates();
  const dirProfile = getDirectorProfile();

  const newCert = {
    id: `cert_${Date.now()}`,
    certificateId: certData.certificateNumber || `AEF-${Math.floor(100 + Math.random() * 900)}/${new Date().getFullYear()}`,
    certificateNumber: certData.certificateNumber || `aef / ${new Date().getFullYear()}`,
    rollNumber: certData.rollNumber || `AEF-${Math.floor(100 + Math.random() * 900)}/${new Date().getFullYear()}`,
    studentName: certData.studentName || "Scholar",
    courseTitle: certData.courseTitle || "Basic Computer Course",
    issueDate: certData.issueDate || new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
    status: "Verified Authentic",
    duration: certData.duration || "Six Months",
    directorName: dirProfile.name || "Yasir Ali",
    directorTitle: dirProfile.title || "Director",
    createdAt: new Date().toISOString(),
    ...certData
  };

  certs.unshift(newCert);
  localStorage.setItem(STORAGE_KEYS.CERTIFICATES, JSON.stringify(certs));
  window.dispatchEvent(new CustomEvent("apex_certificates_changed", { detail: certs }));

  // Sync to Cloud Firestore for permanent verification across devices
  try {
    await setDoc(doc(db, "certificates", newCert.id), newCert, { merge: true });
  } catch (fsErr) {
    console.warn("Firestore issueCertificate sync notice:", fsErr);
  }

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

// Real-time Cloud Firestore subscription for Examinations
export function subscribeToExams(callback) {
  if (typeof window === "undefined") return () => {};

  // 1. Immediately emit current local state
  callback(getExams());

  // 2. Real-time Firestore snapshot listener
  let unsubscribeFirestore = () => {};
  try {
    const colRef = collection(db, "exams");
    unsubscribeFirestore = onSnapshot(colRef, (snapshot) => {
      const liveExams = [];
      snapshot.forEach(docSnap => {
        liveExams.push({ id: docSnap.id, ...docSnap.data() });
      });

      const local = getExams();
      const mergedMap = new Map();

      // Seed with local exams
      local.forEach(e => mergedMap.set(e.id, e));

      // Overwrite/update with live exams from Firestore
      liveExams.forEach(e => {
        mergedMap.set(e.id, {
          ...(mergedMap.get(e.id) || {}),
          ...e
        });
      });

      // If there are local exams not yet in Firestore, auto-upload them with enriched teacher email
      local.forEach(async (locE) => {
        if (!liveExams.some(le => le.id === locE.id)) {
          try {
            let examToUpload = { ...locE };
            if (!examToUpload.assignedTeacherEmail && examToUpload.assignedTeacherName) {
              const allTeachers = getTeachers();
              const matchedTch = allTeachers.find(t => 
                (examToUpload.assignedTeacherId && t.id === examToUpload.assignedTeacherId) ||
                (t.name && t.name.trim().toLowerCase() === examToUpload.assignedTeacherName.trim().toLowerCase())
              );
              if (matchedTch && matchedTch.email) {
                examToUpload.assignedTeacherEmail = matchedTch.email;
              }
            }
            await setDoc(doc(db, "exams", examToUpload.id), examToUpload, { merge: true });
          } catch (syncErr) {
            console.warn("Auto-sync local exam to Firestore notice:", syncErr);
          }
        }
      });

      const merged = Array.from(mergedMap.values());
      // Sort newest created first
      merged.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

      localStorage.setItem(STORAGE_KEYS.EXAMS, JSON.stringify(merged));
      callback(merged);
      window.dispatchEvent(new CustomEvent("apex_exams_changed", { detail: merged }));
    }, (err) => {
      console.warn("Firestore exams subscription notice:", err);
    });
  } catch (e) {
    console.warn("Firestore connection error for exams:", e);
  }

  // 3. Local custom event listener
  const handleLocalChange = (e) => {
    if (e.detail) {
      callback(e.detail);
    } else {
      callback(getExams());
    }
  };
  window.addEventListener("apex_exams_changed", handleLocalChange);

  return () => {
    unsubscribeFirestore();
    window.removeEventListener("apex_exams_changed", handleLocalChange);
  };
}

// 1. Admin creates scheduled exam (Admin question access is strictly LOCKED until teacher submits)
export async function createExam(examData) {
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

  // Sync to Cloud Firestore
  try {
    await setDoc(doc(db, "exams", newExam.id), newExam);
  } catch (fsErr) {
    console.warn("Firestore createExam sync notice:", fsErr);
  }

  return newExam;
}

// 2. Teacher authors questions
export async function updateExamQuestions(examId, questions) {
  const exams = getExams();
  const index = exams.findIndex(e => e.id === examId);
  if (index === -1) return null;

  if (exams[index].status === EXAM_STATUS.PENDING_ADMIN || exams[index].status === EXAM_STATUS.APPROVED) {
    throw new Error("Questions are locked during admin review or after approval.");
  }

  exams[index].questions = questions;
  exams[index].updatedAt = new Date().toISOString();
  saveExams(exams);

  // Sync to Cloud Firestore
  try {
    await setDoc(doc(db, "exams", examId), { questions, updatedAt: exams[index].updatedAt }, { merge: true });
  } catch (fsErr) {
    console.warn("Firestore updateExamQuestions sync notice:", fsErr);
  }

  return exams[index];
}

// 3. Teacher Submits Paper to Admin (LOCKS TEACHER, UNLOCKS ADMIN REVIEW)
export async function submitExamPaper(examId) {
  const exams = getExams();
  const index = exams.findIndex(e => e.id === examId);
  if (index === -1) return null;

  const submittedAt = new Date().toLocaleString();
  exams[index].status = EXAM_STATUS.PENDING_ADMIN;
  exams[index].submittedAt = submittedAt;
  saveExams(exams);

  // Sync to Cloud Firestore
  try {
    await setDoc(doc(db, "exams", examId), { status: EXAM_STATUS.PENDING_ADMIN, submittedAt }, { merge: true });
  } catch (fsErr) {
    console.warn("Firestore submitExamPaper sync notice:", fsErr);
  }

  return exams[index];
}

// 4. Admin Approves & Publishes Exam (FINAL LOCK)
export async function approveExam(examId, approvalNote = "") {
  const exams = getExams();
  const index = exams.findIndex(e => e.id === examId);
  if (index === -1) return null;

  const approvedAt = new Date().toLocaleString();
  exams[index].status = EXAM_STATUS.APPROVED;
  exams[index].approvedAt = approvedAt;
  if (approvalNote) {
    exams[index].adminFeedback = approvalNote;
  }
  saveExams(exams);

  // Sync to Cloud Firestore
  try {
    await setDoc(doc(db, "exams", examId), { 
      status: EXAM_STATUS.APPROVED, 
      approvedAt,
      adminFeedback: approvalNote || ""
    }, { merge: true });
  } catch (fsErr) {
    console.warn("Firestore approveExam sync notice:", fsErr);
  }

  return exams[index];
}

// 5. Admin Requests Revision (UNLOCKS TEACHER WITH FEEDBACK)
export async function requestExamRevision(examId, feedbackNote) {
  const exams = getExams();
  const index = exams.findIndex(e => e.id === examId);
  if (index === -1) return null;

  exams[index].status = EXAM_STATUS.REVISION;
  exams[index].adminFeedback = feedbackNote;
  saveExams(exams);

  // Sync to Cloud Firestore
  try {
    await setDoc(doc(db, "exams", examId), { 
      status: EXAM_STATUS.REVISION, 
      adminFeedback: feedbackNote || ""
    }, { merge: true });
  } catch (fsErr) {
    console.warn("Firestore requestExamRevision sync notice:", fsErr);
  }

  return exams[index];
}
