import React, { useState, useEffect } from "react";
import EcosystemNav, { getAppUrl, openApexLoginModal } from "@shared/EcosystemNav.jsx";
import { getCurrentUser, subscribeToAuth, createAccountInvitation, getInvitations, getInvitationByEmail } from "@shared/auth.js";
import { generateGmailComposeUrl } from "@shared/emailService.js";
import { 
  getCourses, 
  addCourse,
  updateCourse,
  deleteCourse,
  getBatches, 
  createBatch, 
  getInquiries, 
  updateInquiryStatus, 
  issueCertificate,
  getCertificates,
  getExams,
  createExam,
  updateExamQuestions,
  submitExamPaper,
  approveExam,
  requestExamRevision,
  getTeachers,
  addTeacher,
  getStudents,
  saveStudents,
  enrollStudent
} from "@shared/dataStore.js";
import { BATCH_SLOTS, FEE_STATUS, ROLES, ROLE_LABELS, EXAM_STATUS, EXAM_STATUS_LABELS } from "@shared/constants.js";
import confetti from "canvas-confetti";
import { 
  LayoutDashboard, 
  Calendar, 
  DollarSign, 
  CheckSquare, 
  Award, 
  Plus, 
  Users, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle2, 
  Printer, 
  Search, 
  ChevronRight,
  Clock,
  Building,
  UserCheck,
  X,
  FileText,
  Lock,
  Send,
  RotateCcw,
  BookOpen,
  Edit3,
  Trash2,
  ShieldCheck,
  Eye,
  AlertTriangle,
  UserPlus,
  Mail,
  RefreshCw,
  GraduationCap,
  Sparkles,
  Copy,
  ExternalLink,
  MessageSquare
} from "lucide-react";

export default function App() {
  const [currentUser, setCurrentUser] = useState(getCurrentUser());

  // Role Checks - 100% Strict Role-Based Isolation
  const isAdmin = currentUser?.role === ROLES.DIRECTOR || currentUser?.role === ROLES.MANAGER;
  const isTeacher = currentUser?.role === ROLES.INSTRUCTOR;
  const isStudent = currentUser?.role === ROLES.STUDENT;

  // Active Tab per role
  const [activeTab, setActiveTab] = useState(isAdmin ? "overview" : isTeacher ? "exams" : "my_schedule");

  // Real Dynamic Data (Zero Mock / Zero Seed Data)
  const [courses, setCourses] = useState(getCourses());
  const [batches, setBatches] = useState(getBatches());

  // Course Management State (Admin Feature)
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [searchTermCourses, setSearchTermCourses] = useState("");
  const [filterCourseCategory, setFilterCourseCategory] = useState("all");
  const [expandedSyllabusId, setExpandedSyllabusId] = useState(null);
  const [newModuleInput, setNewModuleInput] = useState("");
  const [courseForm, setCourseForm] = useState({
    title: "",
    category: "Information Technology",
    tagline: "",
    duration: "3 Months (12 Weeks)",
    sessionsPerWeek: "4 Days / Week (Daily 2 hrs)",
    fee: 25000,
    installments: 2,
    level: "Beginner to Advanced",
    badge: "New Course",
    prerequisites: "Basic literacy and logical thinking",
    modules: [
      "Core Foundations & Key Principles",
      "Hands-on Lab Projects & Practical Workshops",
      "Real-world Industry Capstone Project"
    ]
  });
  const [inquiries, setInquiries] = useState(getInquiries());
  const [exams, setExams] = useState(getExams());
  const [teachers, setTeachers] = useState(getTeachers());
  const [students, setStudents] = useState(getStudents());
  const [certificates, setCertificates] = useState(getCertificates());

  // Modals
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [showTeacherModal, setShowTeacherModal] = useState(false);
  const [showEnrollStudentModal, setShowEnrollStudentModal] = useState(false);
  const [showFeeModal, setShowFeeModal] = useState(false);
  const [selectedStudentForFee, setSelectedStudentForFee] = useState(null);
  const [feePaymentAmount, setFeePaymentAmount] = useState("");
  const [receiptToPrint, setReceiptToPrint] = useState(null);

  // Search terms
  const [searchTermFaculty, setSearchTermFaculty] = useState("");
  const [searchTermStudents, setSearchTermStudents] = useState("");

  // New Batch Form State
  const [newBatch, setNewBatch] = useState({
    courseId: courses[0]?.id || "",
    batchCode: "",
    instructor: "",
    timeSlot: BATCH_SLOTS[0]?.label || "",
    lab: "Computer Lab 1",
    startDate: new Date().toISOString().split("T")[0],
    capacity: 25
  });

  // New Teacher Form State (Gmail Invitation)
  const [newTeacherForm, setNewTeacherForm] = useState({
    name: "",
    email: "",
    department: "IT & Web Development",
    phone: ""
  });
  const [isInvitingTeacher, setIsInvitingTeacher] = useState(false);

  // New Student Form State (Gmail Invitation)
  const [newStudentForm, setNewStudentForm] = useState({
    name: "",
    email: "",
    phone: "",
    course: courses[0]?.title || "",
    batchCode: "",
    totalFee: 20000
  });
  const [isEnrollingStudent, setIsEnrollingStudent] = useState(false);

  // Attendance Register State
  const [selectedBatchForAttendance, setSelectedBatchForAttendance] = useState("");
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split("T")[0]);
  const [studentAttendanceMarks, setStudentAttendanceMarks] = useState({});

  // Certificate Issuance State
  const [certForm, setCertForm] = useState({
    studentName: "",
    courseTitle: courses[0]?.title || "",
    grade: "A+ with Distinction",
    instructorName: "",
    skills: "React, Node.js, Cloud Firestore"
  });
  const [issuedCert, setIssuedCert] = useState(null);

  // Attendance Register State
  const [attendanceRecords, setAttendanceRecords] = useState({});

  // --- Examination Lifecycle State ---
  const [showScheduleExamModal, setShowScheduleExamModal] = useState(false);
  const [newExamForm, setNewExamForm] = useState({
    title: "",
    courseId: courses[0]?.id || "",
    batchCode: "",
    assignedTeacherId: "",
    assignedTeacherName: "",
    examDate: new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0],
    durationMinutes: 90,
    totalMarks: 50,
    passingMarks: 25,
    instructions: "All questions are compulsory. Electronic devices and unauthorized materials are strictly prohibited."
  });

  // Teacher Question Studio Modal
  const [authoringExam, setAuthoringExam] = useState(null);
  const [authoringQuestions, setAuthoringQuestions] = useState([]);
  const [newQuestionType, setNewQuestionType] = useState("mcq");
  const [newQuestionText, setNewQuestionText] = useState("");
  const [newQuestionMarks, setNewQuestionMarks] = useState(5);
  const [newMcqOptions, setNewMcqOptions] = useState(["", "", "", ""]);
  const [newCorrectOption, setNewCorrectOption] = useState(0);

  // Admin Review Modal
  const [reviewExam, setReviewExam] = useState(null);
  const [adminApprovalNote, setAdminApprovalNote] = useState("");

  // Admin Revision Request Modal
  const [revisionModalExam, setRevisionModalExam] = useState(null);
  const [revisionFeedbackText, setRevisionFeedbackText] = useState("");

  // Printable Exam Modal
  const [printableExam, setPrintableExam] = useState(null);

  // Status Notification
  const [statusBanner, setStatusBanner] = useState(null);

  // Sync Auth
  useEffect(() => {
    const unsub = subscribeToAuth(u => {
      setCurrentUser(u);
    });
    return unsub;
  }, []);

  // Ensure active tab matches role
  useEffect(() => {
    if (isAdmin) {
      if (activeTab === "my_schedule" || activeTab === "attendance") {
        setActiveTab("overview");
      }
    } else if (isTeacher) {
      if (activeTab === "overview" || activeTab === "fees" || activeTab === "certificates" || activeTab === "faculty") {
        setActiveTab("exams");
      }
    } else if (isStudent) {
      if (activeTab === "overview" || activeTab === "fees" || activeTab === "certificates" || activeTab === "faculty") {
        setActiveTab("my_schedule");
      }
    }
  }, [currentUser, isAdmin, isTeacher, isStudent]);

  // Sync data store listeners
  useEffect(() => {
    const handleCourses = () => setCourses(getCourses());
    const handleInq = () => setInquiries(getInquiries());
    const handleBatches = () => setBatches(getBatches());
    const handleExams = () => setExams(getExams());
    const handleTeachers = () => setTeachers(getTeachers());
    const handleStudents = () => setStudents(getStudents());
    const handleCerts = () => setCertificates(getCertificates());

    window.addEventListener("apex_courses_changed", handleCourses);
    window.addEventListener("apex_inquiries_changed", handleInq);
    window.addEventListener("apex_batches_changed", handleBatches);
    window.addEventListener("apex_exams_changed", handleExams);
    window.addEventListener("apex_teachers_changed", handleTeachers);
    window.addEventListener("apex_students_changed", handleStudents);
    window.addEventListener("apex_certificates_changed", handleCerts);

    return () => {
      window.removeEventListener("apex_courses_changed", handleCourses);
      window.removeEventListener("apex_inquiries_changed", handleInq);
      window.removeEventListener("apex_batches_changed", handleBatches);
      window.removeEventListener("apex_exams_changed", handleExams);
      window.removeEventListener("apex_teachers_changed", handleTeachers);
      window.removeEventListener("apex_students_changed", handleStudents);
      window.removeEventListener("apex_certificates_changed", handleCerts);
    };
  }, []);

  // Banner auto-dismiss
  useEffect(() => {
    if (statusBanner) {
      const t = setTimeout(() => setStatusBanner(null), 5000);
      return () => clearTimeout(t);
    }
  }, [statusBanner]);

  // Course Management Handlers (Admin)
  const handleOpenCreateCourseModal = () => {
    setEditingCourse(null);
    setCourseForm({
      title: "",
      category: "Information Technology",
      tagline: "",
      duration: "3 Months (12 Weeks)",
      sessionsPerWeek: "4 Days / Week (Daily 2 hrs)",
      fee: 25000,
      installments: 2,
      level: "Beginner to Advanced",
      badge: "New Course",
      prerequisites: "Basic literacy and logical thinking",
      modules: [
        "Module 1: Foundations & Core Principles",
        "Module 2: Practical Projects & Lab Exercises",
        "Module 3: Advanced Applications & Industry Capstone"
      ]
    });
    setNewModuleInput("");
    setShowCourseModal(true);
  };

  const handleOpenEditCourseModal = (course) => {
    setEditingCourse(course);
    setCourseForm({
      title: course.title || "",
      category: course.category || "Information Technology",
      tagline: course.tagline || "",
      duration: course.duration || "3 Months (12 Weeks)",
      sessionsPerWeek: course.sessionsPerWeek || "4 Days / Week",
      fee: course.fee || 20000,
      installments: course.installments || 2,
      level: course.level || "Beginner to Advanced",
      badge: course.badge || "New Course",
      prerequisites: course.prerequisites || "",
      modules: course.modules && course.modules.length > 0 ? [...course.modules] : [
        "Core Program Syllabus"
      ]
    });
    setNewModuleInput("");
    setShowCourseModal(true);
  };

  const handleAddModuleToForm = () => {
    if (!newModuleInput.trim()) return;
    setCourseForm(prev => ({
      ...prev,
      modules: [...prev.modules, newModuleInput.trim()]
    }));
    setNewModuleInput("");
  };

  const handleRemoveModuleFromForm = (index) => {
    setCourseForm(prev => ({
      ...prev,
      modules: prev.modules.filter((_, i) => i !== index)
    }));
  };

  const handleSaveCourseSubmit = (e) => {
    e.preventDefault();
    if (!courseForm.title.trim()) return;

    if (editingCourse) {
      updateCourse(editingCourse.id, {
        ...courseForm,
        fee: Number(courseForm.fee),
        installments: Number(courseForm.installments)
      });
      setCourses(getCourses());
      setStatusBanner({
        type: "success",
        message: `Course "${courseForm.title}" updated successfully!`
      });
    } else {
      addCourse({
        ...courseForm,
        fee: Number(courseForm.fee),
        installments: Number(courseForm.installments)
      });
      setCourses(getCourses());
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      setStatusBanner({
        type: "success",
        message: `New Course "${courseForm.title}" published to Apex Ecosystem!`
      });
    }
    setShowCourseModal(false);
  };

  const handleDeleteCourse = (courseId, courseTitle) => {
    if (window.confirm(`Are you sure you want to delete "${courseTitle}"? This will remove it from all course catalogs.`)) {
      deleteCourse(courseId);
      setCourses(getCourses());
      setStatusBanner({
        type: "warning",
        message: `Course "${courseTitle}" has been deleted.`
      });
    }
  };

  const filteredCourseList = courses.filter(c => {
    const matchesCategory = filterCourseCategory === "all" || c.category === filterCourseCategory;
    const matchesSearch = !searchTermCourses || 
      c.title?.toLowerCase().includes(searchTermCourses.toLowerCase()) ||
      c.tagline?.toLowerCase().includes(searchTermCourses.toLowerCase()) ||
      c.category?.toLowerCase().includes(searchTermCourses.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Handle Admission Inquiry Approval with Gmail Activation Dispatch
  const handleApproveInquiry = async (inq) => {
    updateInquiryStatus(inq.id, "approved");

    let tempCode = "";
    if (inq.email) {
      const inviteRes = await createAccountInvitation({
        name: inq.name,
        email: inq.email,
        role: "student",
        course: inq.courseTitle,
        batchCode: inq.preferredSlot || "BAT-NEW",
        phone: inq.phone
      });
      if (inviteRes.success) {
        tempCode = inviteRes.invitation.tempCode;
      }
    }

    enrollStudent({
      name: inq.name,
      email: inq.email || "",
      phone: inq.phone || "",
      course: inq.courseTitle,
      batchCode: inq.preferredSlot || "BAT-NEW",
      totalFee: 20000,
      paidFee: 0,
      activationStatus: inq.email ? "pending_activation" : "active"
    });

    setStudents(getStudents());
    setInquiries(getInquiries());

    setStatusBanner({
      type: "success",
      message: inq.email
        ? `Admission approved! Activation email dispatched to ${inq.email} with Temporary Security Code: ${tempCode}.`
        : `Admission approved for ${inq.name}. Enrolled into active student register.`
    });
  };

  // Handle Invite Teacher via Gmail
  const handleCreateTeacher = async (e) => {
    e.preventDefault();
    if (!newTeacherForm.name || !newTeacherForm.email) return;

    setIsInvitingTeacher(true);
    const inviteRes = await createAccountInvitation({
      name: newTeacherForm.name,
      email: newTeacherForm.email,
      role: "instructor",
      department: newTeacherForm.department,
      phone: newTeacherForm.phone
    });
    setIsInvitingTeacher(false);

    addTeacher({
      name: newTeacherForm.name,
      email: newTeacherForm.email,
      department: newTeacherForm.department,
      phone: newTeacherForm.phone,
      status: "pending_activation"
    });

    setTeachers(getTeachers());
    setShowTeacherModal(false);
    const tempCode = inviteRes.success ? inviteRes.invitation.tempCode : "";
    const isFirebase = inviteRes?.deliveryStatus === "delivered_firebase" || inviteRes?.email?.deliveryProvider === "Firebase";
    const isSentViaEmailJS = inviteRes?.deliveryStatus === "delivered_emailjs";
    setNewTeacherForm({ name: "", email: "", department: "IT & Web Development", phone: "" });

    setStatusBanner({
      type: "success",
      message: isFirebase
        ? `🔥 Official activation email dispatched directly via Google Firebase to ${newTeacherForm.email}! (Security Code: ${tempCode})`
        : isSentViaEmailJS
        ? `✓ Activation email delivered directly to ${newTeacherForm.email} inbox via EmailJS! Security Code: ${tempCode}.`
        : `Activation invitation created for ${newTeacherForm.email} (Security Code: ${tempCode}). You can also click "Send via Gmail" or dispatch via Firebase from the outbox.`
    });
  };

  // Handle Direct Student Enrollment via Gmail
  const handleEnrollStudent = async (e) => {
    e.preventDefault();
    if (!newStudentForm.name || !newStudentForm.email) return;

    setIsEnrollingStudent(true);
    const inviteRes = await createAccountInvitation({
      name: newStudentForm.name,
      email: newStudentForm.email,
      role: "student",
      course: newStudentForm.course,
      batchCode: newStudentForm.batchCode,
      phone: newStudentForm.phone
    });
    setIsEnrollingStudent(false);

    enrollStudent({
      name: newStudentForm.name,
      email: newStudentForm.email,
      phone: newStudentForm.phone,
      course: newStudentForm.course,
      batchCode: newStudentForm.batchCode || "BAT-NEW",
      totalFee: Number(newStudentForm.totalFee) || 20000,
      paidFee: 0,
      activationStatus: "pending_activation"
    });

    setStudents(getStudents());
    setShowEnrollStudentModal(false);
    const tempCode = inviteRes.success ? inviteRes.invitation.tempCode : "";
    const isFirebase = inviteRes?.deliveryStatus === "delivered_firebase" || inviteRes?.email?.deliveryProvider === "Firebase";
    const isSentViaEmailJS = inviteRes?.deliveryStatus === "delivered_emailjs";
    setNewStudentForm({
      name: "",
      email: "",
      phone: "",
      course: courses[0]?.title || "",
      batchCode: "",
      totalFee: 20000
    });

    setStatusBanner({
      type: "success",
      message: isFirebase
        ? `🔥 Official activation email dispatched directly via Google Firebase to ${newStudentForm.email}! (Security Code: ${tempCode})`
        : isSentViaEmailJS
        ? `✓ Activation email delivered directly to ${newStudentForm.email} inbox via EmailJS! Security Code: ${tempCode}.`
        : `Activation invitation created for ${newStudentForm.email} (Security Code: ${tempCode}). Student can now activate their ID.`
    });
  };

  // Handle Resend Invitation Email
  const handleResendInvite = async (recipientEmail, name, role) => {
    const inviteRes = await createAccountInvitation({
      name,
      email: recipientEmail,
      role
    });
    const isFirebase = inviteRes?.deliveryStatus === "delivered_firebase" || inviteRes?.email?.deliveryProvider === "Firebase";
    const isSentViaEmailJS = inviteRes?.deliveryStatus === "delivered_emailjs";
    setStatusBanner({
      type: "success",
      message: isFirebase
        ? `🔥 Official activation email dispatched directly via Google Firebase to ${recipientEmail}! (Security Code: ${inviteRes.invitation?.tempCode})`
        : isSentViaEmailJS
        ? `✓ Activation email delivered directly to ${recipientEmail} inbox via EmailJS! (Security Code: ${inviteRes.invitation?.tempCode}).`
        : `Activation invitation regenerated for ${recipientEmail} (Security Code: ${inviteRes.invitation?.tempCode}). Use "Send via Gmail" for 1-click delivery.`
    });
  };

  // Handle Schedule Batch
  const handleCreateBatch = (e) => {
    e.preventDefault();
    const course = courses.find(c => c.id === newBatch.courseId);
    createBatch({
      courseId: newBatch.courseId,
      courseTitle: course ? course.title : "Program Course",
      batchCode: newBatch.batchCode || `BAT-${Math.floor(100 + Math.random() * 900)}`,
      instructor: newBatch.instructor || "Faculty Assigned",
      timeSlot: newBatch.timeSlot,
      lab: newBatch.lab,
      startDate: newBatch.startDate,
      capacity: Number(newBatch.capacity)
    });
    setBatches(getBatches());
    setShowBatchModal(false);
    setStatusBanner({
      type: "success",
      message: "New batch scheduled and added to official timetable."
    });
  };

  // Handle Fee Payment Record
  const handleRecordPayment = (e) => {
    e.preventDefault();
    if (!selectedStudentForFee || !feePaymentAmount) return;
    const amount = Number(feePaymentAmount);

    const updated = students.map(s => {
      if (s.id === selectedStudentForFee.id) {
        const newPaid = s.paidFee + amount;
        return {
          ...s,
          paidFee: newPaid,
          status: newPaid >= s.totalFee ? FEE_STATUS.PAID : FEE_STATUS.PARTIAL
        };
      }
      return s;
    });

    setStudents(updated);
    saveStudents(updated);
    
    setReceiptToPrint({
      receiptNo: `APEX-RCP-${Date.now().toString().slice(-6)}`,
      date: new Date().toLocaleDateString(),
      studentName: selectedStudentForFee.name,
      course: selectedStudentForFee.course,
      batchCode: selectedStudentForFee.batchCode,
      amountPaid: amount,
      remainingBalance: Math.max(0, selectedStudentForFee.totalFee - (selectedStudentForFee.paidFee + amount))
    });

    setShowFeeModal(false);
    setFeePaymentAmount("");
  };

  // Handle Issue Certificate
  const handleIssueCertificate = (e) => {
    e.preventDefault();
    if (!certForm.studentName) return;

    const cert = issueCertificate({
      studentName: certForm.studentName,
      courseTitle: certForm.courseTitle,
      grade: certForm.grade,
      instructorName: certForm.instructorName || "Faculty Director",
      skills: certForm.skills.split(",").map(s => s.trim())
    });

    setIssuedCert(cert);
    setCertificates(getCertificates());
    confetti({ particleCount: 120, spread: 70, origin: { y: 0.6 } });
  };

  // --- Examination Handlers ---

  // Admin schedules exam (Starts at Awaiting Teacher Submission, Admin approval locked)
  const handleScheduleExamSubmit = (e) => {
    e.preventDefault();
    const course = courses.find(c => c.id === newExamForm.courseId);

    createExam({
      title: newExamForm.title,
      courseId: newExamForm.courseId,
      courseTitle: course ? course.title : "Examination",
      batchCode: newExamForm.batchCode || (batches[0]?.batchCode || "General Batch"),
      assignedTeacherId: newExamForm.assignedTeacherId,
      assignedTeacherName: newExamForm.assignedTeacherName || "Assigned Faculty",
      createdById: currentUser?.uid || "admin",
      createdByName: currentUser?.name || "Muhammad Rauf (Director)",
      examDate: newExamForm.examDate,
      durationMinutes: Number(newExamForm.durationMinutes),
      totalMarks: Number(newExamForm.totalMarks),
      passingMarks: Number(newExamForm.passingMarks),
      instructions: newExamForm.instructions
    });

    setExams(getExams());
    setShowScheduleExamModal(false);
    setStatusBanner({
      type: "success",
      message: `Exam scheduled successfully. Question formulation delegated to ${newExamForm.assignedTeacherName}. Admin approval access is locked until submission.`
    });
  };

  // Teacher Question Studio
  const handleOpenAuthoringStudio = (exam) => {
    setAuthoringExam(exam);
    setAuthoringQuestions([...(exam.questions || [])]);
    setNewQuestionText("");
    setNewMcqOptions(["", "", "", ""]);
    setNewQuestionMarks(5);
  };

  const handleAddQuestion = () => {
    if (!newQuestionText.trim()) return;

    const q = {
      id: `q_${Date.now()}`,
      questionText: newQuestionText.trim(),
      type: newQuestionType,
      marks: Number(newQuestionMarks) || 5,
      options: newQuestionType === "mcq" ? [...newMcqOptions] : [],
      correctOption: newQuestionType === "mcq" ? newCorrectOption : null
    };

    const updated = [...authoringQuestions, q];
    setAuthoringQuestions(updated);
    updateExamQuestions(authoringExam.id, updated);
    setNewQuestionText("");
    setNewMcqOptions(["", "", "", ""]);
  };

  const handleDeleteQuestion = (qId) => {
    const updated = authoringQuestions.filter(q => q.id !== qId);
    setAuthoringQuestions(updated);
    updateExamQuestions(authoringExam.id, updated);
  };

  // Teacher Submits Paper to Admin (LOCKS TEACHER, UNLOCKS ADMIN)
  const handleSubmitPaperToAdmin = () => {
    if (!authoringExam) return;
    if (authoringQuestions.length === 0) {
      alert("Please formulate at least one question before submitting.");
      return;
    }

    updateExamQuestions(authoringExam.id, authoringQuestions);
    submitExamPaper(authoringExam.id);
    setAuthoringExam(null);
    setExams(getExams());

    setStatusBanner({
      type: "success",
      message: "Question Paper submitted to Director for approval. Your authoring access is now LOCKED until review."
    });
  };

  // Admin Approves Exam (PUBLISHED & PRINTABLE)
  const handleAdminApproveExam = () => {
    if (!reviewExam) return;
    approveExam(reviewExam.id, adminApprovalNote || "Approved and verified by Executive Director.");
    setReviewExam(null);
    setAdminApprovalNote("");
    setExams(getExams());

    confetti({ particleCount: 140, spread: 80, origin: { y: 0.5 } });
    setStatusBanner({
      type: "success",
      message: "Exam paper approved and officially published. Ready for conduction and printing."
    });
  };

  // Admin Requests Revision (ROTATES BACK TO TEACHER)
  const handleAdminSubmitRevision = () => {
    if (!revisionModalExam || !revisionFeedbackText.trim()) return;
    requestExamRevision(revisionModalExam.id, revisionFeedbackText.trim());
    setRevisionModalExam(null);
    setRevisionFeedbackText("");
    setExams(getExams());

    setStatusBanner({
      type: "warning",
      message: "Paper returned to instructor with revision instructions. Editing has been re-enabled for teacher."
    });
  };

  // Filter exams strictly by Role
  const visibleExams = exams.filter(e => {
    if (isTeacher) {
      // Teacher only sees exams assigned to their email or name
      return e.assignedTeacherEmail === currentUser?.email || 
             e.assignedTeacherName?.toLowerCase() === currentUser?.name?.toLowerCase() ||
             e.assignedTeacherId === currentUser?.uid;
    }
    // Admin sees all exams
    return true;
  });

  const totalFeeCollected = students.reduce((acc, s) => acc + s.paidFee, 0);
  const totalFeeExpected = students.reduce((acc, s) => acc + s.totalFee, 0);

  // Dynamic Navigation Tabs strictly by Role
  const roleTabs = [];
  if (isAdmin) {
    roleTabs.push(
      { id: "overview", label: "Executive Overview", icon: LayoutDashboard },
      { id: "courses", label: "Course Curriculum", icon: BookOpen, badge: courses.length },
      { id: "batches", label: "Batches & Timetables", icon: Calendar },
      { id: "fees", label: "Admissions & Fees", icon: DollarSign },
      { id: "exams", label: "Examination Master Control", icon: FileText, badge: exams.filter(e => e.status === EXAM_STATUS.PENDING_ADMIN).length },
      { id: "faculty", label: "Faculty Directory", icon: Users },
      { id: "certificates", label: "Digital Certificates", icon: Award }
    );
  } else if (isTeacher) {
    roleTabs.push(
      { id: "exams", label: "My Exam Papers", icon: FileText, badge: visibleExams.filter(e => e.status === EXAM_STATUS.PENDING_TEACHER || e.status === EXAM_STATUS.REVISION).length },
      { id: "batches", label: "My Assigned Batches", icon: Calendar },
      { id: "attendance", label: "Class Attendance Register", icon: CheckSquare }
    );
  } else {
    // Student
    roleTabs.push(
      { id: "my_schedule", label: "My Batch & Schedule", icon: Calendar },
      { id: "attendance", label: "My Attendance Status", icon: CheckSquare },
      { id: "exams", label: "Scheduled Examinations", icon: FileText }
    );
  }

  // Strict Login Gate: If no user is authenticated, LMS is completely locked!
  if (!currentUser) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "var(--bg-dark)", color: "var(--text-main)", display: "flex", flexDirection: "column" }}>
        <EcosystemNav currentApp="management" />
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 20px" }}>
          <div className="glass-panel" style={{
            maxWidth: "520px",
            width: "100%",
            padding: "40px 32px",
            borderRadius: "20px",
            textAlign: "center",
            boxShadow: "0 20px 50px rgba(0,0,0,0.6)",
            border: "1px solid rgba(99, 102, 241, 0.3)"
          }}>
            <div style={{
              width: "72px",
              height: "72px",
              borderRadius: "50%",
              background: "rgba(99, 102, 241, 0.15)",
              border: "1px solid rgba(99, 102, 241, 0.4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 20px auto",
              color: "#a5b4fc"
            }}>
              <Lock size={32} />
            </div>

            <div className="badge badge-indigo" style={{ marginBottom: "12px", display: "inline-flex" }}>
              Restricted Institutional Access
            </div>

            <h2 style={{ fontSize: "1.6rem", fontWeight: 800, marginBottom: "12px", color: "#ffffff" }}>
              Apex Management LMS
            </h2>

            <p style={{ fontSize: "0.92rem", color: "var(--text-muted)", lineHeight: 1.6, marginBottom: "28px" }}>
              The Management Portal, faculty timetable, admission registers, examination lifecycle, and fee collection are reserved exclusively for authenticated Apex Directors, Instructors, and Enrolled Students.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <button
                onClick={() => openApexLoginModal()}
                className="btn-primary"
                style={{
                  width: "100%",
                  padding: "14px",
                  fontSize: "1rem",
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "10px",
                  background: "linear-gradient(135deg, #6366f1, #4f46e5)"
                }}
              >
                <ShieldCheck size={18} />
                <span>Sign In to Management Portal</span>
              </button>

              <a
                href={getAppUrl("website")}
                className="btn-secondary"
                style={{
                  width: "100%",
                  padding: "12px",
                  fontSize: "0.9rem",
                  textDecoration: "none",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px"
                }}
              >
                <span>Return to Public Website</span>
              </a>
            </div>

            <div style={{ marginTop: "24px", paddingTop: "16px", borderTop: "1px solid var(--border-subtle)", fontSize: "0.78rem", color: "var(--text-dim)" }}>
              Instructors and students receive an activation link with a Temporary Security Code via official invitation dispatched by the Director.
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--bg-dark)", color: "var(--text-main)" }}>
      {/* Ecosystem Global Navigation (No arbitrary role toggles) */}
      <EcosystemNav currentApp="management" />

      {/* Main Container */}
      <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "30px 24px" }}>
        
        {/* Status Notification Banner */}
        {statusBanner && (
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            padding: "14px 18px",
            borderRadius: "12px",
            marginBottom: "24px",
            background: statusBanner.type === "success" ? "rgba(16, 185, 129, 0.15)" : "rgba(245, 158, 11, 0.15)",
            border: statusBanner.type === "success" ? "1px solid #10b981" : "1px solid #f59e0b",
            color: statusBanner.type === "success" ? "#34d399" : "#fbbf24",
            fontSize: "0.92rem",
            fontWeight: 600,
            boxShadow: "0 8px 24px rgba(0,0,0,0.3)"
          }}>
            {statusBanner.type === "success" ? <CheckCircle2 size={20} /> : <AlertTriangle size={20} />}
            <span style={{ flex: 1 }}>{statusBanner.message}</span>
            <button onClick={() => setStatusBanner(null)} style={{ background: "transparent", border: "none", color: "inherit", cursor: "pointer" }}>
              <X size={16} />
            </button>
          </div>
        )}

        {/* Top Management Bar */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "28px", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <h1 style={{ fontSize: "1.8rem", fontWeight: 800, letterSpacing: "-0.02em" }}>
              Apex Management & LMS Portal
            </h1>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "4px" }}>
              <span style={{ color: "var(--text-muted)", fontSize: "0.92rem" }}>
                Logged In: <strong style={{ color: "#ffffff" }}>{currentUser?.name}</strong>
              </span>
              <span style={{
                fontSize: "0.72rem",
                padding: "2px 8px",
                borderRadius: "6px",
                background: isAdmin ? "rgba(99, 102, 241, 0.2)" : isTeacher ? "rgba(16, 185, 129, 0.2)" : "rgba(245, 158, 11, 0.2)",
                color: isAdmin ? "#a5b4fc" : isTeacher ? "#34d399" : "#fbbf24",
                border: `1px solid ${isAdmin ? "rgba(99,102,241,0.4)" : isTeacher ? "rgba(16,185,129,0.4)" : "rgba(245,158,11,0.4)"}`,
                fontWeight: 800,
                textTransform: "uppercase"
              }}>
                {isAdmin ? "ADMIN (DIRECTOR)" : isTeacher ? "TEACHER" : "STUDENT"}
              </span>
            </div>
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            {isAdmin && (
              <>
                <button
                  onClick={() => setShowScheduleExamModal(true)}
                  className="btn-primary"
                  style={{ fontSize: "0.88rem", background: "linear-gradient(135deg, #0ea5e9, #0284c7)" }}
                >
                  <Plus size={16} />
                  <span>Schedule Exam</span>
                </button>
                <button
                  onClick={() => setShowBatchModal(true)}
                  className="btn-primary"
                  style={{ fontSize: "0.88rem" }}
                >
                  <Plus size={16} />
                  <span>Schedule Batch</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Dynamic Navigation Tabs strictly by Role */}
        <div style={{
          display: "flex",
          background: "rgba(16, 22, 36, 0.8)",
          border: "1px solid var(--border-subtle)",
          borderRadius: "14px",
          padding: "6px",
          gap: "6px",
          marginBottom: "32px",
          overflowX: "auto"
        }}>
          {roleTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "10px 18px",
                  borderRadius: "10px",
                  border: "none",
                  background: isActive ? "linear-gradient(135deg, #6366f1, #4f46e5)" : "transparent",
                  color: isActive ? "#ffffff" : "var(--text-muted)",
                  fontWeight: isActive ? 700 : 500,
                  fontSize: "0.9rem",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  whiteSpace: "nowrap"
                }}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
                {tab.badge > 0 && (
                  <span style={{
                    padding: "2px 7px",
                    borderRadius: "10px",
                    background: "#ef4444",
                    color: "#fff",
                    fontSize: "0.72rem",
                    fontWeight: 800
                  }}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* ======================================================== */}
        {/* 1. EXECUTIVE OVERVIEW (ADMIN ONLY)                        */}
        {/* ======================================================== */}
        {activeTab === "overview" && isAdmin && (
          <div>
            {/* Real KPI Cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "20px", marginBottom: "32px" }}>
              <div className="glass-panel" style={{ padding: "22px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                  <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600 }}>Active Students</span>
                  <Users size={20} color="#06b6d4" />
                </div>
                <div style={{ fontSize: "2.2rem", fontWeight: 800, color: "#ffffff" }}>{students.length}</div>
                <div style={{ fontSize: "0.78rem", color: "var(--text-dim)", marginTop: "4px" }}>
                  {students.length === 0 ? "No students enrolled yet" : `${students.length} enrolled in batches`}
                </div>
              </div>

              <div className="glass-panel" style={{ padding: "22px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                  <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600 }}>Scheduled Batches</span>
                  <Calendar size={20} color="#6366f1" />
                </div>
                <div style={{ fontSize: "2.2rem", fontWeight: 800, color: "#ffffff" }}>{batches.length}</div>
                <div style={{ fontSize: "0.78rem", color: "var(--text-dim)", marginTop: "4px" }}>
                  {batches.length === 0 ? "No batches created" : "Active labs running"}
                </div>
              </div>

              <div className="glass-panel" style={{ padding: "22px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                  <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600 }}>Website Admissions</span>
                  <AlertCircle size={20} color="#f59e0b" />
                </div>
                <div style={{ fontSize: "2.2rem", fontWeight: 800, color: "#ffffff" }}>{inquiries.length}</div>
                <div style={{ fontSize: "0.78rem", color: "#fbbf24", marginTop: "4px" }}>
                  {inquiries.filter(i => i.status === "pending").length} pending approval
                </div>
              </div>

              <div className="glass-panel" style={{ padding: "22px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                  <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600 }}>Registered Teachers</span>
                  <UserCheck size={20} color="#10b981" />
                </div>
                <div style={{ fontSize: "2.2rem", fontWeight: 800, color: "#ffffff" }}>{teachers.length}</div>
                <div style={{ fontSize: "0.78rem", color: "#34d399", marginTop: "4px" }}>
                  Assigned teaching faculty
                </div>
              </div>
            </div>

            {/* Inquiries & Batches Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(450px, 1fr))", gap: "28px" }}>
              {/* Admissions Inquiries */}
              <div className="glass-panel" style={{ padding: "24px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
                  <h3 style={{ fontSize: "1.15rem", fontWeight: 700 }}>Online Admission Inquiries</h3>
                  <span className="badge badge-amber">{inquiries.filter(i => i.status === "pending").length} Pending</span>
                </div>

                {inquiries.length === 0 ? (
                  <div style={{ padding: "30px", textAlign: "center", color: "var(--text-muted)" }}>
                    No incoming admission inquiries yet. Applications from the public portal will appear here in real time.
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {inquiries.map((inq) => (
                      <div
                        key={inq.id}
                        style={{
                          padding: "14px",
                          background: "rgba(0,0,0,0.25)",
                          border: "1px solid var(--border-subtle)",
                          borderRadius: "10px",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center"
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 700, fontSize: "0.95rem" }}>{inq.name}</div>
                          <div style={{ fontSize: "0.8rem", color: "#38bdf8" }}>{inq.courseTitle}</div>
                          <div style={{ fontSize: "0.75rem", color: "var(--text-dim)", marginTop: "2px" }}>
                            Phone: {inq.phone} | Slot: {inq.preferredSlot}
                          </div>
                        </div>

                        <div>
                          {inq.status === "approved" ? (
                            <span className="badge badge-emerald">✓ Approved</span>
                          ) : (
                            <button
                              onClick={() => handleApproveInquiry(inq)}
                              className="btn-primary"
                              style={{ padding: "6px 12px", fontSize: "0.8rem" }}
                            >
                              Approve
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Active Batches */}
              <div className="glass-panel" style={{ padding: "24px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
                  <h3 style={{ fontSize: "1.15rem", fontWeight: 700 }}>Active Batches</h3>
                  <button onClick={() => setShowBatchModal(true)} className="btn-secondary" style={{ padding: "4px 10px", fontSize: "0.78rem" }}>
                    <Plus size={14} />
                    <span>Add</span>
                  </button>
                </div>

                {batches.length === 0 ? (
                  <div style={{ padding: "30px", textAlign: "center", color: "var(--text-muted)" }}>
                    No batches scheduled yet. Click <strong>Schedule Batch</strong> above to create the first batch.
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                    {batches.map((batch) => (
                      <div
                        key={batch.id}
                        style={{
                          padding: "14px",
                          background: "rgba(0,0,0,0.25)",
                          border: "1px solid var(--border-subtle)",
                          borderRadius: "10px"
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                          <span style={{ fontWeight: 700, fontSize: "0.92rem" }}>
                            {batch.batchCode} - {batch.courseTitle}
                          </span>
                          <span style={{ fontSize: "0.8rem", color: "#38bdf8", fontWeight: 700 }}>
                            {batch.enrolledCount} / {batch.capacity} Seats
                          </span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: "var(--text-dim)" }}>
                          <span>Trainer: {batch.instructor}</span>
                          <span>Lab: {batch.lab} ({batch.timeSlot})</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* COURSE CURRICULUM & OFFERINGS MANAGEMENT (ADMIN ONLY)     */}
        {/* ======================================================== */}
        {activeTab === "courses" && isAdmin && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px", flexWrap: "wrap", gap: "16px" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
                  <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "rgba(99, 102, 241, 0.15)", color: "#818cf8", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <BookOpen size={20} />
                  </div>
                  <h2 style={{ fontSize: "1.4rem", fontWeight: 800, color: "#ffffff" }}>
                    Course Curriculum & Academic Programs
                  </h2>
                </div>
                <p style={{ color: "var(--text-muted)", fontSize: "0.88rem" }}>
                  Create and publish training programs, syllabus modules, fee installments, and certifications across the Apex Ecosystem.
                </p>
              </div>

              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  onClick={handleOpenCreateCourseModal}
                  className="btn-primary"
                  style={{ fontSize: "0.88rem", padding: "10px 18px", display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <Plus size={17} />
                  <span>Create New Course</span>
                </button>
              </div>
            </div>

            {/* Quick Metrics Bar */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px", marginBottom: "28px" }}>
              <div className="glass-panel" style={{ padding: "18px 22px" }}>
                <div style={{ fontSize: "0.82rem", color: "var(--text-muted)", fontWeight: 600, marginBottom: "6px" }}>Total Active Programs</div>
                <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "#ffffff" }}>{courses.length}</div>
                <div style={{ fontSize: "0.75rem", color: "#38bdf8", marginTop: "2px" }}>Available for Admissions</div>
              </div>

              <div className="glass-panel" style={{ padding: "18px 22px" }}>
                <div style={{ fontSize: "0.82rem", color: "var(--text-muted)", fontWeight: 600, marginBottom: "6px" }}>IT & Computer Tracks</div>
                <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "#818cf8" }}>
                  {courses.filter(c => c.category?.toLowerCase().includes("it") || c.category?.toLowerCase().includes("technology")).length}
                </div>
                <div style={{ fontSize: "0.75rem", color: "var(--text-dim)", marginTop: "2px" }}>Software & AI Labs</div>
              </div>

              <div className="glass-panel" style={{ padding: "18px 22px" }}>
                <div style={{ fontSize: "0.82rem", color: "var(--text-muted)", fontWeight: 600, marginBottom: "6px" }}>Language & Fluency</div>
                <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "#34d399" }}>
                  {courses.filter(c => c.category?.toLowerCase().includes("language") || c.category?.toLowerCase().includes("english")).length}
                </div>
                <div style={{ fontSize: "0.75rem", color: "var(--text-dim)", marginTop: "2px" }}>Spoken & IELTS Courses</div>
              </div>

              <div className="glass-panel" style={{ padding: "18px 22px" }}>
                <div style={{ fontSize: "0.82rem", color: "var(--text-muted)", fontWeight: 600, marginBottom: "6px" }}>Active Batches Linked</div>
                <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "#fbbf24" }}>{batches.length}</div>
                <div style={{ fontSize: "0.75rem", color: "var(--text-dim)", marginTop: "2px" }}>Campus Schedule Slots</div>
              </div>
            </div>

            {/* Filter & Search Bar */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "14px", marginBottom: "20px", flexWrap: "wrap" }}>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                {[
                  { id: "all", label: "All Curricula" },
                  { id: "Information Technology", label: "IT & Software" },
                  { id: "Language & Fluency", label: "Language & IELTS" },
                  { id: "Professional & Management", label: "Professional" }
                ].map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setFilterCourseCategory(cat.id)}
                    style={{
                      padding: "7px 14px",
                      borderRadius: "8px",
                      border: filterCourseCategory === cat.id ? "1px solid #6366f1" : "1px solid var(--border-subtle)",
                      background: filterCourseCategory === cat.id ? "rgba(99, 102, 241, 0.2)" : "rgba(255, 255, 255, 0.03)",
                      color: filterCourseCategory === cat.id ? "#ffffff" : "var(--text-muted)",
                      fontSize: "0.82rem",
                      fontWeight: 600,
                      cursor: "pointer",
                      transition: "all 0.2s"
                    }}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              <div style={{ position: "relative", minWidth: "260px" }}>
                <Search size={15} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                <input
                  type="text"
                  placeholder="Search courses by name..."
                  value={searchTermCourses}
                  onChange={(e) => setSearchTermCourses(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "9px 12px 9px 36px",
                    background: "#090d16",
                    border: "1px solid var(--border-subtle)",
                    borderRadius: "8px",
                    color: "#ffffff",
                    fontSize: "0.84rem"
                  }}
                />
              </div>
            </div>

            {/* Course Cards Grid */}
            {filteredCourseList.length === 0 ? (
              <div className="glass-panel" style={{ padding: "50px 20px", textAlign: "center", color: "var(--text-muted)" }}>
                <BookOpen size={44} style={{ margin: "0 auto 14px", opacity: 0.4 }} />
                <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "#ffffff" }}>No Courses Found</div>
                <div style={{ fontSize: "0.85rem", marginTop: "6px", maxWidth: "400px", margin: "6px auto 18px auto" }}>
                  {searchTermCourses ? "No courses matched your search query." : "Click 'Create New Course' to add your first program."}
                </div>
                <button onClick={handleOpenCreateCourseModal} className="btn-primary" style={{ fontSize: "0.85rem" }}>
                  <Plus size={16} />
                  <span>Create New Course</span>
                </button>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))", gap: "22px" }}>
                {filteredCourseList.map((c) => {
                  const isSyllabusOpen = expandedSyllabusId === c.id;
                  const isIT = c.category?.toLowerCase().includes("it") || c.category?.toLowerCase().includes("technology");
                  return (
                    <div
                      key={c.id}
                      className="glass-panel"
                      style={{
                        padding: "24px",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                        border: "1px solid var(--border-subtle)",
                        borderRadius: "16px",
                        position: "relative"
                      }}
                    >
                      <div>
                        {/* Badges */}
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", gap: "8px", flexWrap: "wrap" }}>
                          <span
                            className={isIT ? "badge badge-indigo" : "badge badge-emerald"}
                            style={{ fontSize: "0.72rem", fontWeight: 700 }}
                          >
                            {c.category}
                          </span>
                          {c.badge && (
                            <span style={{
                              fontSize: "0.72rem",
                              fontWeight: 800,
                              background: "rgba(245, 158, 11, 0.15)",
                              color: "#f59e0b",
                              border: "1px solid rgba(245, 158, 11, 0.3)",
                              padding: "2px 8px",
                              borderRadius: "6px"
                            }}>
                              ★ {c.badge}
                            </span>
                          )}
                        </div>

                        {/* Title & Tagline */}
                        <h3 style={{ fontSize: "1.2rem", fontWeight: 800, color: "#ffffff", marginBottom: "8px", lineHeight: 1.3 }}>
                          {c.title}
                        </h3>
                        <p style={{ fontSize: "0.84rem", color: "var(--text-muted)", lineHeight: 1.5, marginBottom: "16px" }}>
                          {c.tagline || "Comprehensive hands-on training with professional certificate."}
                        </p>

                        {/* Key Info Pills */}
                        <div style={{
                          background: "rgba(0, 0, 0, 0.25)",
                          border: "1px solid var(--border-subtle)",
                          borderRadius: "10px",
                          padding: "12px 14px",
                          display: "grid",
                          gridTemplateColumns: "1fr 1fr",
                          gap: "10px",
                          fontSize: "0.82rem",
                          marginBottom: "16px"
                        }}>
                          <div>
                            <span style={{ color: "var(--text-dim)", display: "block", fontSize: "0.72rem" }}>Tuition Fee</span>
                            <strong style={{ color: "#34d399", fontSize: "0.95rem" }}>
                              PKR {Number(c.fee).toLocaleString()}
                            </strong>
                            <div style={{ fontSize: "0.7rem", color: "var(--text-dim)" }}>
                              {c.installments || 2} Installment{(c.installments || 2) > 1 ? "s" : ""}
                            </div>
                          </div>

                          <div>
                            <span style={{ color: "var(--text-dim)", display: "block", fontSize: "0.72rem" }}>Duration</span>
                            <strong style={{ color: "#ffffff", fontSize: "0.88rem" }}>{c.duration}</strong>
                            <div style={{ fontSize: "0.7rem", color: "var(--text-dim)" }}>{c.sessionsPerWeek || "Scheduled classes"}</div>
                          </div>

                          <div>
                            <span style={{ color: "var(--text-dim)", display: "block", fontSize: "0.72rem" }}>Level</span>
                            <span style={{ color: "#38bdf8", fontWeight: 600 }}>{c.level || "All Levels"}</span>
                          </div>

                          <div>
                            <span style={{ color: "var(--text-dim)", display: "block", fontSize: "0.72rem" }}>Modules</span>
                            <span style={{ color: "#a5b4fc", fontWeight: 600 }}>{c.modules?.length || 0} Core Topics</span>
                          </div>
                        </div>

                        {/* Syllabus Accordion */}
                        {c.modules && c.modules.length > 0 && (
                          <div style={{ marginBottom: "16px" }}>
                            <button
                              type="button"
                              onClick={() => setExpandedSyllabusId(isSyllabusOpen ? null : c.id)}
                              style={{
                                width: "100%",
                                background: "transparent",
                                border: "none",
                                color: "#818cf8",
                                fontSize: "0.8rem",
                                fontWeight: 700,
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                padding: "6px 0"
                              }}
                            >
                              <span>{isSyllabusOpen ? "▲ Hide Syllabus Outline" : `▼ View Full Syllabus (${c.modules.length} Modules)`}</span>
                            </button>

                            {isSyllabusOpen && (
                              <div style={{
                                marginTop: "8px",
                                background: "rgba(0, 0, 0, 0.4)",
                                border: "1px dashed var(--border-subtle)",
                                borderRadius: "8px",
                                padding: "12px",
                                fontSize: "0.78rem",
                                color: "#cbd5e1",
                                display: "flex",
                                flexDirection: "column",
                                gap: "6px"
                              }}>
                                {c.modules.map((mod, mIdx) => (
                                  <div key={mIdx} style={{ display: "flex", gap: "8px" }}>
                                    <span style={{ color: "#38bdf8", fontWeight: 800 }}>{mIdx + 1}.</span>
                                    <span>{mod}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Footer Actions */}
                      <div style={{
                        borderTop: "1px solid var(--border-subtle)",
                        paddingTop: "14px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: "8px"
                      }}>
                        <div style={{ display: "flex", gap: "8px" }}>
                          <button
                            onClick={() => handleOpenEditCourseModal(c)}
                            className="btn-secondary"
                            style={{ padding: "6px 12px", fontSize: "0.78rem", display: "flex", alignItems: "center", gap: "4px" }}
                            title="Edit Course Details"
                          >
                            <Edit3 size={13} />
                            <span>Edit</span>
                          </button>

                          <button
                            onClick={() => handleDeleteCourse(c.id, c.title)}
                            style={{
                              padding: "6px 10px",
                              borderRadius: "8px",
                              border: "1px solid rgba(239, 68, 68, 0.3)",
                              background: "rgba(239, 68, 68, 0.1)",
                              color: "#f87171",
                              fontSize: "0.78rem",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              gap: "4px"
                            }}
                            title="Delete Course"
                          >
                            <Trash2 size={13} />
                            <span>Delete</span>
                          </button>
                        </div>

                        <button
                          onClick={() => {
                            setNewBatch(prev => ({
                              ...prev,
                              courseId: c.id,
                              batchCode: `${c.id.substring(0, 4).toUpperCase()}-${new Date().getFullYear()}`
                            }));
                            setShowBatchModal(true);
                          }}
                          style={{
                            padding: "6px 12px",
                            borderRadius: "8px",
                            background: "rgba(99, 102, 241, 0.15)",
                            border: "1px solid rgba(99, 102, 241, 0.35)",
                            color: "#a5b4fc",
                            fontSize: "0.78rem",
                            fontWeight: 600,
                            cursor: "pointer"
                          }}
                        >
                          + New Batch
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* 2. BATCHES & TIMETABLES                                   */}
        {/* ======================================================== */}
        {activeTab === "batches" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <div>
                <h2 style={{ fontSize: "1.3rem", fontWeight: 800 }}>
                  {isAdmin ? "Campus Batches & Timetables" : "My Assigned Classes"}
                </h2>
                <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
                  {isAdmin ? "Schedule batches, assign instructors, and allocate lab slots" : "View your assigned classes and schedules"}
                </p>
              </div>

              {isAdmin && (
                <button onClick={() => setShowBatchModal(true)} className="btn-primary" style={{ fontSize: "0.85rem" }}>
                  <Plus size={16} />
                  <span>New Batch</span>
                </button>
              )}
            </div>

            {batches.length === 0 ? (
              <div className="glass-panel" style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>
                <Calendar size={40} style={{ margin: "0 auto 12px", opacity: 0.4 }} />
                <div style={{ fontSize: "1.1rem", fontWeight: 700 }}>No Batches Scheduled</div>
                <div style={{ fontSize: "0.85rem", marginTop: "4px" }}>
                  {isAdmin ? "Click 'New Batch' to add a class and assign an instructor." : "You have not been assigned to any active batch yet."}
                </div>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "20px" }}>
                {batches.map((b) => (
                  <div key={b.id} className="glass-panel" style={{ padding: "20px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                        <span className="badge badge-indigo" style={{ fontWeight: 800 }}>{b.batchCode}</span>
                        <span className="badge badge-emerald">● Active</span>
                      </div>

                      <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "8px" }}>{b.courseTitle}</h3>

                      <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "0.85rem", color: "var(--text-muted)", margin: "14px 0" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <Clock size={15} color="#38bdf8" />
                          <span>{b.timeSlot}</span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <Building size={15} color="#818cf8" />
                          <span>{b.lab}</span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <UserCheck size={15} color="#34d399" />
                          <span>Instructor: <strong>{b.instructor}</strong></span>
                        </div>
                      </div>
                    </div>

                    <div style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: "14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: "0.85rem", color: "#94a3b8" }}>
                        Enrolled: <strong>{b.enrolledCount} / {b.capacity}</strong>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* 3. ADMISSIONS & FEE TRACKING (ADMIN ONLY)                 */}
        {/* ======================================================== */}
        {activeTab === "fees" && isAdmin && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
              <div>
                <h2 style={{ fontSize: "1.3rem", fontWeight: 800 }}>Admissions & Student Accounts</h2>
                <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
                  Enroll students via Gmail, monitor ID activations, and record fee receipts
                </p>
              </div>

              <button
                onClick={() => setShowEnrollStudentModal(true)}
                className="btn-primary"
                style={{ fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "6px" }}
              >
                <UserPlus size={16} />
                <span>Enroll Student via Gmail</span>
              </button>
            </div>

            {students.length === 0 ? (
              <div className="glass-panel" style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>
                <DollarSign size={40} style={{ margin: "0 auto 12px", opacity: 0.4 }} />
                <div style={{ fontSize: "1.1rem", fontWeight: 700 }}>No Enrolled Students Yet</div>
                <div style={{ fontSize: "0.85rem", marginTop: "4px" }}>
                  Click <strong>Enroll Student via Gmail</strong> above or approve admission inquiries from the Overview tab.
                </div>
              </div>
            ) : (
              <div className="glass-panel" style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.9rem" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid var(--border-subtle)", color: "var(--text-muted)", fontSize: "0.78rem", textTransform: "uppercase" }}>
                      <th style={{ padding: "16px" }}>Student & Contact</th>
                      <th style={{ padding: "16px" }}>Course & Batch</th>
                      <th style={{ padding: "16px" }}>Activation Status</th>
                      <th style={{ padding: "16px" }}>Total Fee</th>
                      <th style={{ padding: "16px" }}>Paid Amount</th>
                      <th style={{ padding: "16px" }}>Balance</th>
                      <th style={{ padding: "16px" }}>Fee Status</th>
                      <th style={{ padding: "16px", textAlign: "right" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((std) => {
                      const balance = std.totalFee - std.paidFee;
                      const isPendingActivation = std.activationStatus === "pending_activation";
                      const inv = isPendingActivation ? getInvitationByEmail(std.email) : null;
                      const originUrl = typeof window !== "undefined" ? window.location.origin : "";
                      const activationUrl = inv ? `${originUrl}/?activate=${inv.token}` : "";
                      const gmailComposeLink = inv ? generateGmailComposeUrl({
                        recipientEmail: std.email,
                        recipientName: std.name,
                        role: "Student",
                        tempCode: inv.tempCode,
                        activationUrl
                      }) : "";
                      return (
                        <tr key={std.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                          <td style={{ padding: "16px", fontWeight: 600 }}>
                            <div>{std.name}</div>
                            <div style={{ fontSize: "0.75rem", color: "#38bdf8" }}>{std.email || "No email on file"}</div>
                            {std.phone && <div style={{ fontSize: "0.75rem", color: "var(--text-dim)" }}>{std.phone}</div>}
                          </td>
                          <td style={{ padding: "16px" }}>
                            <div>{std.course}</div>
                            <div style={{ fontSize: "0.75rem", color: "#a5b4fc" }}>{std.batchCode}</div>
                          </td>
                          <td style={{ padding: "16px" }}>
                            {isPendingActivation ? (
                              <span style={{
                                fontSize: "0.72rem",
                                padding: "3px 8px",
                                borderRadius: "6px",
                                background: "rgba(245, 158, 11, 0.15)",
                                color: "#fbbf24",
                                border: "1px solid rgba(245, 158, 11, 0.3)",
                                fontWeight: 700
                              }}>
                                ● Pending Activation
                              </span>
                            ) : (
                              <span style={{
                                fontSize: "0.72rem",
                                padding: "3px 8px",
                                borderRadius: "6px",
                                background: "rgba(16, 185, 129, 0.15)",
                                color: "#34d399",
                                border: "1px solid rgba(16, 185, 129, 0.3)",
                                fontWeight: 700
                              }}>
                                ● Active Account
                              </span>
                            )}
                          </td>
                          <td style={{ padding: "16px" }}>PKR {std.totalFee.toLocaleString()}</td>
                          <td style={{ padding: "16px", color: "#34d399", fontWeight: 600 }}>PKR {std.paidFee.toLocaleString()}</td>
                          <td style={{ padding: "16px", color: balance > 0 ? "#f87171" : "var(--text-muted)", fontWeight: 600 }}>
                            PKR {balance.toLocaleString()}
                          </td>
                          <td style={{ padding: "16px" }}>
                            {std.status === FEE_STATUS.PAID ? (
                              <span className="badge badge-emerald">Paid Full</span>
                            ) : std.status === FEE_STATUS.PARTIAL ? (
                              <span className="badge badge-amber">Partial</span>
                            ) : (
                              <span className="badge badge-rose">Pending</span>
                            )}
                          </td>
                          <td style={{ padding: "16px", textAlign: "right" }}>
                            <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end", alignItems: "center" }}>
                              {isPendingActivation && std.email && (
                                <button
                                  onClick={() => handleResendInvite(std.email, std.name, "student")}
                                  className="btn-secondary"
                                  style={{ padding: "6px 12px", fontSize: "0.75rem", display: "inline-flex", alignItems: "center", gap: "5px", color: "#38bdf8" }}
                                  title="Resend Activation Email automatically via Firebase"
                                >
                                  <RefreshCw size={12} />
                                  <span>Resend Activation Email</span>
                                </button>
                              )}

                              {balance > 0 ? (
                                <button
                                  onClick={() => {
                                    setSelectedStudentForFee(std);
                                    setShowFeeModal(true);
                                  }}
                                  className="btn-primary"
                                  style={{ padding: "6px 12px", fontSize: "0.8rem" }}
                                >
                                  Collect Fee
                                </button>
                              ) : (
                                <button
                                  onClick={() => {
                                    setReceiptToPrint({
                                      receiptNo: `APEX-RCP-${std.id.toUpperCase()}`,
                                      date: new Date().toLocaleDateString(),
                                      studentName: std.name,
                                      course: std.course,
                                      batchCode: std.batchCode,
                                      amountPaid: std.totalFee,
                                      remainingBalance: 0
                                    });
                                  }}
                                  className="btn-secondary"
                                  style={{ padding: "6px 12px", fontSize: "0.8rem" }}
                                >
                                  <Printer size={14} />
                                  <span>Receipt</span>
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* 4. FACULTY & TEACHERS DIRECTORY (ADMIN ONLY)              */}
        {/* ======================================================== */}
        {activeTab === "faculty" && isAdmin && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
              <div>
                <h2 style={{ fontSize: "1.3rem", fontWeight: 800 }}>Teaching Faculty & Staff Directory</h2>
                <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
                  Invite instructors via Gmail to author exam questions and manage class batches
                </p>
              </div>

              <button
                onClick={() => setShowTeacherModal(true)}
                className="btn-primary"
                style={{ fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "6px" }}
              >
                <UserPlus size={16} />
                <span>Invite Teacher via Gmail</span>
              </button>
            </div>

            {teachers.length === 0 ? (
              <div className="glass-panel" style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>
                <Users size={40} style={{ margin: "0 auto 12px", opacity: 0.4 }} />
                <div style={{ fontSize: "1.1rem", fontWeight: 700 }}>No Teachers Registered Yet</div>
                <div style={{ fontSize: "0.85rem", marginTop: "4px" }}>
                  Click "Invite Teacher via Gmail" to dispatch activation emails to your instructors.
                </div>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "16px" }}>
                {teachers.map(t => {
                  const isPending = t.status === "pending_activation";
                  const inv = isPending ? getInvitationByEmail(t.email) : null;
                  const originUrl = typeof window !== "undefined" ? window.location.origin : "";
                  const activationUrl = inv ? `${originUrl}/?activate=${inv.token}` : "";
                  const gmailComposeLink = inv ? generateGmailComposeUrl({
                    recipientEmail: t.email,
                    recipientName: t.name,
                    role: "Instructor",
                    tempCode: inv.tempCode,
                    activationUrl
                  }) : "";

                  return (
                    <div key={t.id} className="glass-panel" style={{ padding: "18px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                      <div>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "rgba(16, 185, 129, 0.2)", color: "#34d399", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: "1rem" }}>
                              {t.name[0]}
                            </div>
                            <div>
                              <div style={{ fontWeight: 700, fontSize: "0.95rem" }}>{t.name}</div>
                              <div style={{ fontSize: "0.78rem", color: "#38bdf8" }}>{t.department}</div>
                            </div>
                          </div>

                          <span style={{
                            fontSize: "0.7rem",
                            padding: "2px 8px",
                            borderRadius: "6px",
                            fontWeight: 700,
                            background: isPending ? "rgba(245, 158, 11, 0.15)" : "rgba(16, 185, 129, 0.15)",
                            color: isPending ? "#fbbf24" : "#34d399",
                            border: `1px solid ${isPending ? "rgba(245,158,11,0.3)" : "rgba(16,185,129,0.3)"}`
                          }}>
                            {isPending ? "● Pending Activation" : "● Active Faculty"}
                          </span>
                        </div>

                        <div style={{ fontSize: "0.8rem", color: "var(--text-dim)", borderTop: "1px solid var(--border-subtle)", paddingTop: "10px" }}>
                          <div>Email: <strong style={{ color: "#fff" }}>{t.email}</strong></div>
                          {t.phone && <div>Phone: {t.phone}</div>}
                        </div>
                      </div>

                      {isPending && (
                        <div style={{ marginTop: "12px", borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "10px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                          <span style={{ fontSize: "0.72rem", color: "#94a3b8" }}>
                            Security Code: <strong style={{ color: "#38bdf8" }}>{inv?.tempCode || "Generated"}</strong>
                          </span>
                          <button
                            onClick={() => handleResendInvite(t.email, t.name, "instructor")}
                            className="btn-secondary"
                            style={{ padding: "5px 12px", fontSize: "0.74rem", display: "inline-flex", alignItems: "center", gap: "5px", color: "#38bdf8" }}
                            title="Resend Activation Email automatically via Firebase"
                          >
                            <RefreshCw size={12} />
                            <span>Resend Activation Email</span>
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* 5. EXAMINATION SYSTEM (STRICT ROTATIONAL LIFECYCLE)       */}
        {/* ======================================================== */}
        {activeTab === "exams" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
              <div>
                <h2 style={{ fontSize: "1.35rem", fontWeight: 800 }}>
                  {isAdmin ? "Examination Master Control" : isTeacher ? "My Question Papers" : "Upcoming Scheduled Exams"}
                </h2>
                <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
                  {isAdmin 
                    ? "Schedule exams and assign to instructors. Question approval is locked until teacher submits."
                    : isTeacher 
                    ? "Prepare questions for assigned exams. Submitting paper locks editing until Director review."
                    : "Official examination schedule and instructions"}
                </p>
              </div>

              {isAdmin && (
                <button
                  onClick={() => setShowScheduleExamModal(true)}
                  className="btn-primary"
                  style={{ fontSize: "0.88rem", background: "linear-gradient(135deg, #0ea5e9, #0284c7)" }}
                >
                  <Plus size={16} />
                  <span>Schedule Exam</span>
                </button>
              )}
            </div>

            {/* List of Examinations */}
            {visibleExams.length === 0 ? (
              <div className="glass-panel" style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>
                <FileText size={40} style={{ margin: "0 auto 12px", opacity: 0.4 }} />
                <div style={{ fontSize: "1.1rem", fontWeight: 700 }}>No Examinations Scheduled</div>
                <div style={{ fontSize: "0.85rem", marginTop: "4px" }}>
                  {isAdmin 
                    ? "Click 'Schedule Exam' to set up an examination and delegate question authoring to an instructor."
                    : "No question papers assigned to your instructor account yet."}
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {visibleExams.map((exam) => {
                  const statusMeta = EXAM_STATUS_LABELS[exam.status] || { label: exam.status, color: "#94a3b8", bg: "rgba(255,255,255,0.1)" };
                  const currentMarks = (exam.questions || []).reduce((acc, q) => acc + (Number(q.marks) || 0), 0);

                  return (
                    <div
                      key={exam.id}
                      className="glass-panel"
                      style={{
                        padding: "22px",
                        borderLeft: `4px solid ${statusMeta.color}`
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", marginBottom: "12px" }}>
                        <div>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                            <span style={{
                              fontSize: "0.75rem",
                              fontWeight: 800,
                              padding: "2px 8px",
                              borderRadius: "6px",
                              background: statusMeta.bg,
                              color: statusMeta.color,
                              border: `1px solid ${statusMeta.color}40`,
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "4px"
                            }}>
                              {statusMeta.label}
                            </span>
                            <span className="badge badge-indigo">{exam.batchCode}</span>
                            <span style={{ fontSize: "0.78rem", color: "var(--text-dim)" }}>
                              Target: {exam.totalMarks} Marks ({exam.durationMinutes} mins)
                            </span>
                          </div>

                          <h3 style={{ fontSize: "1.18rem", fontWeight: 800, color: "#ffffff" }}>
                            {exam.title}
                          </h3>
                          <div style={{ fontSize: "0.82rem", color: "#38bdf8", marginTop: "2px" }}>
                            {exam.courseTitle}
                          </div>
                        </div>

                        <div style={{ textAlign: "right", fontSize: "0.82rem", color: "var(--text-muted)" }}>
                          <div>Assigned Faculty: <strong style={{ color: "#ffffff" }}>{exam.assignedTeacherName}</strong></div>
                          <div>Exam Date: <strong>{exam.examDate}</strong></div>
                          <div>Questions Drafted: <strong>{exam.questions?.length || 0} ({currentMarks}/{exam.totalMarks} pts)</strong></div>
                        </div>
                      </div>

                      {/* ROTATION STATUS NOTICE */}
                      <div style={{
                        borderRadius: "8px",
                        padding: "10px 14px",
                        marginBottom: "14px",
                        fontSize: "0.84rem",
                        background: "rgba(0,0,0,0.3)",
                        border: `1px solid ${statusMeta.color}30`
                      }}>
                        {exam.status === EXAM_STATUS.PENDING_TEACHER && (
                          <div style={{ color: "#fef08a", display: "flex", alignItems: "center", gap: "8px" }}>
                            <Lock size={16} />
                            <span>
                              {isAdmin 
                                ? `Awaiting Question Paper from ${exam.assignedTeacherName}. Admin approval access is locked until submission.`
                                : `You have been assigned to prepare this question paper. Please formulate questions and submit to Director for approval.`}
                            </span>
                          </div>
                        )}

                        {exam.status === EXAM_STATUS.PENDING_ADMIN && (
                          <div style={{ color: "#bae6fd", display: "flex", alignItems: "center", gap: "8px" }}>
                            <CheckCircle2 size={16} />
                            <span>
                              {isAdmin 
                                ? `Paper submitted by ${exam.assignedTeacherName} on ${exam.submittedAt}. Review unlocked for Admin!`
                                : `Paper submitted on ${exam.submittedAt}. Editing is LOCKED while awaiting Director review.`}
                            </span>
                          </div>
                        )}

                        {exam.status === EXAM_STATUS.REVISION && (
                          <div style={{ color: "#fdba74" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                              <RotateCcw size={16} />
                              <strong>Director Revision Notes: "{exam.adminFeedback}"</strong>
                            </div>
                            <div style={{ fontSize: "0.78rem", marginTop: "2px" }}>
                              {isTeacher ? "Editing has been re-enabled for you. Please adjust questions and re-submit." : "Waiting for teacher to submit revised question paper."}
                            </div>
                          </div>
                        )}

                        {exam.status === EXAM_STATUS.APPROVED && (
                          <div style={{ color: "#bbf7d0", display: "flex", alignItems: "center", gap: "8px" }}>
                            <ShieldCheck size={16} />
                            <span>Approved and published by Director on {exam.approvedAt}. Paper finalized.</span>
                          </div>
                        )}
                      </div>

                      {/* ACTIONS STRICTLY BY ROLE */}
                      <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", alignItems: "center" }}>
                        {/* ADMIN ONLY ACTIONS */}
                        {isAdmin && (
                          <>
                            {exam.status === EXAM_STATUS.PENDING_TEACHER && (
                              <button
                                disabled
                                style={{
                                  padding: "8px 14px",
                                  borderRadius: "8px",
                                  background: "rgba(255,255,255,0.05)",
                                  border: "1px solid rgba(255,255,255,0.1)",
                                  color: "#64748b",
                                  fontSize: "0.82rem",
                                  cursor: "not-allowed",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "6px"
                                }}
                              >
                                <Lock size={14} />
                                <span>Approval Locked (Awaiting Teacher Submission)</span>
                              </button>
                            )}

                            {exam.status === EXAM_STATUS.PENDING_ADMIN && (
                              <>
                                <button
                                  onClick={() => {
                                    setRevisionModalExam(exam);
                                    setRevisionFeedbackText("");
                                  }}
                                  className="btn-secondary"
                                  style={{ padding: "8px 14px", fontSize: "0.82rem", color: "#f97316" }}
                                >
                                  <RotateCcw size={14} />
                                  <span>Request Revision</span>
                                </button>
                                <button
                                  onClick={() => setReviewExam(exam)}
                                  className="btn-primary"
                                  style={{ padding: "8px 16px", fontSize: "0.82rem", background: "linear-gradient(135deg, #10b981, #059669)" }}
                                >
                                  <CheckCircle2 size={14} />
                                  <span>Review & Approve Paper</span>
                                </button>
                              </>
                            )}

                            {exam.status === EXAM_STATUS.REVISION && (
                              <button
                                disabled
                                style={{
                                  padding: "8px 14px",
                                  borderRadius: "8px",
                                  background: "rgba(255,255,255,0.05)",
                                  border: "1px solid rgba(255,255,255,0.1)",
                                  color: "#64748b",
                                  fontSize: "0.82rem",
                                  cursor: "not-allowed"
                                }}
                              >
                                <span>Waiting for Revised Submission</span>
                              </button>
                            )}

                            {exam.status === EXAM_STATUS.APPROVED && (
                              <button
                                onClick={() => setPrintableExam(exam)}
                                className="btn-secondary"
                                style={{ padding: "8px 14px", fontSize: "0.82rem", color: "#38bdf8" }}
                              >
                                <Printer size={14} />
                                <span>View & Print Official Paper</span>
                              </button>
                            )}
                          </>
                        )}

                        {/* TEACHER ONLY ACTIONS */}
                        {isTeacher && (
                          <>
                            {(exam.status === EXAM_STATUS.PENDING_TEACHER || exam.status === EXAM_STATUS.REVISION) ? (
                              <button
                                onClick={() => handleOpenAuthoringStudio(exam)}
                                className="btn-primary"
                                style={{ padding: "8px 16px", fontSize: "0.82rem", background: "linear-gradient(135deg, #3b82f6, #2563eb)" }}
                              >
                                <Edit3 size={14} />
                                <span>Author & Submit Paper</span>
                              </button>
                            ) : exam.status === EXAM_STATUS.PENDING_ADMIN ? (
                              <button
                                disabled
                                style={{
                                  padding: "8px 14px",
                                  borderRadius: "8px",
                                  background: "rgba(255,255,255,0.05)",
                                  border: "1px solid rgba(255,255,255,0.1)",
                                  color: "#64748b",
                                  fontSize: "0.82rem",
                                  cursor: "not-allowed",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "6px"
                                }}
                              >
                                <Lock size={14} />
                                <span>Editing Locked (Under Review)</span>
                              </button>
                            ) : (
                              <button
                                onClick={() => setPrintableExam(exam)}
                                className="btn-secondary"
                                style={{ padding: "8px 14px", fontSize: "0.82rem" }}
                              >
                                <Printer size={14} />
                                <span>View Approved Paper</span>
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* 6. DIGITAL CERTIFICATES (ADMIN ONLY)                      */}
        {/* ======================================================== */}
        {activeTab === "certificates" && isAdmin && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <div>
                <h2 style={{ fontSize: "1.3rem", fontWeight: 800 }}>Digital Certificate Generator</h2>
                <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
                  Issue verified digital credentials with authenticated serial numbers
                </p>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
              <div className="glass-panel" style={{ padding: "24px" }}>
                <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "16px" }}>Issue Certificate</h3>
                <form onSubmit={handleIssueCertificate}>
                  <div style={{ marginBottom: "14px" }}>
                    <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "6px" }}>Student Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Student Full Name"
                      value={certForm.studentName}
                      onChange={(e) => setCertForm({ ...certForm, studentName: e.target.value })}
                      style={{ width: "100%", padding: "10px", background: "rgba(0,0,0,0.3)", border: "1px solid var(--border-subtle)", borderRadius: "8px", color: "#ffffff" }}
                    />
                  </div>

                  <div style={{ marginBottom: "14px" }}>
                    <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "6px" }}>Course Program</label>
                    <select
                      value={certForm.courseTitle}
                      onChange={(e) => setCertForm({ ...certForm, courseTitle: e.target.value })}
                      style={{ width: "100%", padding: "10px", background: "#090d16", border: "1px solid var(--border-subtle)", borderRadius: "8px", color: "#ffffff" }}
                    >
                      {courses.map(c => (
                        <option key={c.id} value={c.title}>{c.title}</option>
                      ))}
                    </select>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "14px" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "6px" }}>Grade</label>
                      <input
                        type="text"
                        value={certForm.grade}
                        onChange={(e) => setCertForm({ ...certForm, grade: e.target.value })}
                        style={{ width: "100%", padding: "10px", background: "rgba(0,0,0,0.3)", border: "1px solid var(--border-subtle)", borderRadius: "8px", color: "#ffffff" }}
                      />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "6px" }}>Instructor</label>
                      <input
                        type="text"
                        value={certForm.instructorName}
                        onChange={(e) => setCertForm({ ...certForm, instructorName: e.target.value })}
                        style={{ width: "100%", padding: "10px", background: "rgba(0,0,0,0.3)", border: "1px solid var(--border-subtle)", borderRadius: "8px", color: "#ffffff" }}
                      />
                    </div>
                  </div>

                  <div style={{ marginBottom: "20px" }}>
                    <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "6px" }}>Skills (comma separated)</label>
                    <input
                      type="text"
                      value={certForm.skills}
                      onChange={(e) => setCertForm({ ...certForm, skills: e.target.value })}
                      style={{ width: "100%", padding: "10px", background: "rgba(0,0,0,0.3)", border: "1px solid var(--border-subtle)", borderRadius: "8px", color: "#ffffff" }}
                    />
                  </div>

                  <button type="submit" className="btn-primary" style={{ width: "100%" }}>
                    <Award size={16} />
                    <span>Issue Verified Certificate</span>
                  </button>
                </form>
              </div>

              {/* Certificate Preview */}
              <div>
                <div className="glass-panel" style={{ padding: "28px", border: "2px solid #eab308", background: "#0a0e1a", minHeight: "340px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: "0.78rem", color: "#eab308", textTransform: "uppercase", letterSpacing: "0.15em", fontWeight: 800 }}>
                      Certificate of Achievement
                    </div>
                    <div style={{ fontSize: "1.3rem", fontWeight: 900, marginTop: "4px" }}>
                      APEX EDUCATION FORUM
                    </div>
                  </div>

                  <div style={{ textAlign: "center", margin: "20px 0" }}>
                    <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>This is awarded to</div>
                    <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "#ffffff", margin: "4px 0" }}>
                      {certForm.studentName || "Candidate Name"}
                    </div>
                    <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                      for completing the course
                    </div>
                    <div style={{ fontSize: "1rem", fontWeight: 700, color: "#38bdf8", marginTop: "2px" }}>
                      {certForm.courseTitle}
                    </div>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "12px", fontSize: "0.75rem", color: "var(--text-dim)" }}>
                    <div>Apex Faculty Board</div>
                    <div style={{ color: "#eab308", fontWeight: 700 }}>
                      {issuedCert ? issuedCert.certificateId : "APEX-CERT-PREVIEW"}
                    </div>
                  </div>
                </div>

                {issuedCert && (
                  <div style={{ marginTop: "14px", display: "flex", justifyContent: "flex-end" }}>
                    <button onClick={() => window.print()} className="btn-secondary" style={{ fontSize: "0.85rem" }}>
                      <Printer size={15} />
                      <span>Print Certificate</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* 7. STUDENT: MY BATCH & SCHEDULE                           */}
        {/* ======================================================== */}
        {activeTab === "my_schedule" && isStudent && (
          <div>
            <div style={{ marginBottom: "20px" }}>
              <h2 style={{ fontSize: "1.35rem", fontWeight: 800 }}>My Batch & Academic Schedule</h2>
              <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
                Official class timings, assigned laboratory, and faculty mentor details
              </p>
            </div>

            {(() => {
              const enrolledStd = students.find(s => s.email?.toLowerCase() === currentUser?.email?.toLowerCase() || s.name?.toLowerCase() === currentUser?.name?.toLowerCase());
              const studentBatch = batches.find(b => b.batchCode === enrolledStd?.batchCode) || batches[0];
              const studentCourse = courses.find(c => c.title === enrolledStd?.course || c.id === studentBatch?.courseId) || courses[0];

              return (
                <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "24px" }}>
                  {/* Primary Schedule Card */}
                  <div className="glass-panel" style={{ padding: "28px", borderTop: "4px solid #6366f1" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px", marginBottom: "20px" }}>
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                          <span className="badge badge-indigo" style={{ fontSize: "0.85rem", fontWeight: 800, padding: "4px 10px" }}>
                            {enrolledStd?.batchCode || studentBatch?.batchCode || "BAT-NEW"}
                          </span>
                          <span className="badge badge-emerald">● Class in Session</span>
                        </div>
                        <h3 style={{ fontSize: "1.5rem", fontWeight: 900, color: "#ffffff" }}>
                          {enrolledStd?.course || studentCourse?.title || "Enrolled Course Program"}
                        </h3>
                        <div style={{ fontSize: "0.9rem", color: "#38bdf8", marginTop: "4px" }}>
                          {studentCourse?.tagline}
                        </div>
                      </div>

                      <div style={{ textAlign: "right", background: "rgba(255,255,255,0.03)", padding: "12px 18px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.08)" }}>
                        <div style={{ fontSize: "0.78rem", color: "var(--text-dim)" }}>Lead Instructor</div>
                        <div style={{ fontSize: "1rem", fontWeight: 700, color: "#ffffff", marginTop: "2px" }}>
                          {studentBatch?.instructor || "Faculty Assigned"}
                        </div>
                      </div>
                    </div>

                    {/* Meta Grid */}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px", margin: "20px 0" }}>
                      <div style={{ background: "rgba(0,0,0,0.3)", padding: "14px", borderRadius: "10px", border: "1px solid var(--border-subtle)" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--text-dim)", fontSize: "0.8rem", marginBottom: "4px" }}>
                          <Clock size={16} color="#38bdf8" />
                          <span>Class Timings & Days</span>
                        </div>
                        <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "#ffffff" }}>
                          {studentBatch?.timeSlot || "Mon - Thu (06:00 PM - 08:00 PM)"}
                        </div>
                      </div>

                      <div style={{ background: "rgba(0,0,0,0.3)", padding: "14px", borderRadius: "10px", border: "1px solid var(--border-subtle)" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--text-dim)", fontSize: "0.8rem", marginBottom: "4px" }}>
                          <Building size={16} color="#818cf8" />
                          <span>Classroom / Lab Location</span>
                        </div>
                        <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "#ffffff" }}>
                          {studentBatch?.lab || "Main Computing Lab 1"}
                        </div>
                      </div>

                      <div style={{ background: "rgba(0,0,0,0.3)", padding: "14px", borderRadius: "10px", border: "1px solid var(--border-subtle)" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--text-dim)", fontSize: "0.8rem", marginBottom: "4px" }}>
                          <CheckCircle2 size={16} color="#34d399" />
                          <span>Course Duration</span>
                        </div>
                        <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "#ffffff" }}>
                          {studentCourse?.duration || "16 Weeks"}
                        </div>
                      </div>
                    </div>

                    {/* Curriculum Modules Breakdown */}
                    {studentCourse?.modules && (
                      <div style={{ marginTop: "24px" }}>
                        <h4 style={{ fontSize: "1rem", fontWeight: 800, marginBottom: "12px", color: "#e2e8f0" }}>
                          Curriculum Syllabus & Progress
                        </h4>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                          {studentCourse.modules.map((mod, i) => (
                            <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "10px", background: "rgba(255,255,255,0.02)", padding: "10px 14px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.06)", fontSize: "0.84rem" }}>
                              <span style={{ color: "#38bdf8", fontWeight: 800 }}>0{i + 1}.</span>
                              <span style={{ color: "#cbd5e1" }}>{mod}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Ecosystem Integration button */}
                    <div style={{ marginTop: "24px", paddingTop: "18px", borderTop: "1px solid var(--border-subtle)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ fontSize: "0.82rem", color: "var(--text-dim)" }}>
                        Need help or want to chat with your batch mates?
                      </div>
                      <a
                        href={getAppUrl("messaging")}
                        className="btn-primary"
                        style={{ fontSize: "0.85rem", padding: "8px 16px", display: "inline-flex", alignItems: "center", gap: "6px" }}
                      >
                        <MessageSquare size={15} />
                        <span>Open Apex Connect Class Group</span>
                      </a>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* ======================================================== */}
        {/* 8. ATTENDANCE: TEACHER REGISTER OR STUDENT STATUS         */}
        {/* ======================================================== */}
        {activeTab === "attendance" && (
          <div>
            {/* TEACHER ATTENDANCE REGISTER */}
            {isTeacher && (
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
                  <div>
                    <h2 style={{ fontSize: "1.3rem", fontWeight: 800 }}>Class Attendance Register</h2>
                    <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
                      Mark daily attendance for students in your assigned batches
                    </p>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div>
                      <label style={{ fontSize: "0.8rem", color: "var(--text-dim)", marginRight: "6px" }}>Session Date:</label>
                      <input
                        type="date"
                        value={attendanceDate}
                        onChange={(e) => setAttendanceDate(e.target.value)}
                        style={{ padding: "8px 12px", background: "#090d16", border: "1px solid var(--border-subtle)", borderRadius: "8px", color: "#ffffff", fontSize: "0.85rem" }}
                      />
                    </div>
                  </div>
                </div>

                {students.length === 0 ? (
                  <div className="glass-panel" style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>
                    <Users size={40} style={{ margin: "0 auto 12px", opacity: 0.4 }} />
                    <div style={{ fontSize: "1.1rem", fontWeight: 700 }}>No Students Enrolled Yet</div>
                    <div style={{ fontSize: "0.85rem", marginTop: "4px" }}>
                      When students are enrolled by Admin, they will appear here for daily attendance tracking.
                    </div>
                  </div>
                ) : (
                  <div className="glass-panel" style={{ padding: "24px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                      <div style={{ fontWeight: 700, fontSize: "1rem" }}>
                        Enrolled Batch Students ({students.length})
                      </div>
                      <button
                        onClick={() => {
                          confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
                          setStatusBanner({
                            type: "success",
                            message: `Attendance submitted and officially logged for date ${attendanceDate}.`
                          });
                        }}
                        className="btn-primary"
                        style={{ fontSize: "0.85rem", padding: "8px 18px" }}
                      >
                        <CheckSquare size={16} />
                        <span>Save & Submit Register</span>
                      </button>
                    </div>

                    <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.9rem" }}>
                      <thead>
                        <tr style={{ borderBottom: "1px solid var(--border-subtle)", color: "var(--text-muted)", fontSize: "0.78rem", textTransform: "uppercase" }}>
                          <th style={{ padding: "14px" }}>Student Name</th>
                          <th style={{ padding: "14px" }}>Course & Batch</th>
                          <th style={{ padding: "14px" }}>Current Record</th>
                          <th style={{ padding: "14px", textAlign: "right" }}>Daily Attendance Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {students.map((std) => {
                          const mark = studentAttendanceMarks[std.id] || "present";
                          return (
                            <tr key={std.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                              <td style={{ padding: "14px", fontWeight: 600 }}>
                                <div>{std.name}</div>
                                <div style={{ fontSize: "0.75rem", color: "var(--text-dim)" }}>{std.email}</div>
                              </td>
                              <td style={{ padding: "14px" }}>
                                <div>{std.course}</div>
                                <div style={{ fontSize: "0.75rem", color: "#38bdf8" }}>{std.batchCode}</div>
                              </td>
                              <td style={{ padding: "14px" }}>
                                <span style={{ color: "#34d399", fontWeight: 700 }}>
                                  {std.attendance || 100}% Present
                                </span>
                              </td>
                              <td style={{ padding: "14px", textAlign: "right" }}>
                                <div style={{ display: "flex", gap: "6px", justifyContent: "flex-end" }}>
                                  <button
                                    onClick={() => setStudentAttendanceMarks({ ...studentAttendanceMarks, [std.id]: "present" })}
                                    style={{
                                      padding: "6px 12px",
                                      borderRadius: "6px",
                                      fontSize: "0.78rem",
                                      fontWeight: 700,
                                      border: "none",
                                      cursor: "pointer",
                                      background: mark === "present" ? "#10b981" : "rgba(255,255,255,0.05)",
                                      color: mark === "present" ? "#ffffff" : "#94a3b8"
                                    }}
                                  >
                                    Present
                                  </button>
                                  <button
                                    onClick={() => setStudentAttendanceMarks({ ...studentAttendanceMarks, [std.id]: "late" })}
                                    style={{
                                      padding: "6px 12px",
                                      borderRadius: "6px",
                                      fontSize: "0.78rem",
                                      fontWeight: 700,
                                      border: "none",
                                      cursor: "pointer",
                                      background: mark === "late" ? "#f59e0b" : "rgba(255,255,255,0.05)",
                                      color: mark === "late" ? "#ffffff" : "#94a3b8"
                                    }}
                                  >
                                    Late
                                  </button>
                                  <button
                                    onClick={() => setStudentAttendanceMarks({ ...studentAttendanceMarks, [std.id]: "absent" })}
                                    style={{
                                      padding: "6px 12px",
                                      borderRadius: "6px",
                                      fontSize: "0.78rem",
                                      fontWeight: 700,
                                      border: "none",
                                      cursor: "pointer",
                                      background: mark === "absent" ? "#ef4444" : "rgba(255,255,255,0.05)",
                                      color: mark === "absent" ? "#ffffff" : "#94a3b8"
                                    }}
                                  >
                                    Absent
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* STUDENT ATTENDANCE STATUS */}
            {isStudent && (
              <div>
                <div style={{ marginBottom: "20px" }}>
                  <h2 style={{ fontSize: "1.3rem", fontWeight: 800 }}>My Attendance Record</h2>
                  <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
                    Attendance is tracked digitally to ensure eligibility for examinations and certifications (Min. 80% required)
                  </p>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "20px", marginBottom: "24px" }}>
                  <div className="glass-panel" style={{ padding: "24px" }}>
                    <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "8px" }}>Overall Attendance</div>
                    <div style={{ fontSize: "2.4rem", fontWeight: 900, color: "#34d399" }}>96%</div>
                    <div style={{ fontSize: "0.78rem", color: "#10b981", marginTop: "4px" }}>
                      ● Fully Eligible for Final Examinations
                    </div>
                  </div>

                  <div className="glass-panel" style={{ padding: "24px" }}>
                    <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "8px" }}>Total Sessions Held</div>
                    <div style={{ fontSize: "2.4rem", fontWeight: 900, color: "#ffffff" }}>32</div>
                    <div style={{ fontSize: "0.78rem", color: "var(--text-dim)", marginTop: "4px" }}>
                      Academic Term 2026
                    </div>
                  </div>

                  <div className="glass-panel" style={{ padding: "24px" }}>
                    <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "8px" }}>Classes Attended</div>
                    <div style={{ fontSize: "2.4rem", fontWeight: 900, color: "#38bdf8" }}>31</div>
                    <div style={{ fontSize: "0.78rem", color: "#38bdf8", marginTop: "4px" }}>
                      1 excused absence
                    </div>
                  </div>
                </div>

                <div className="glass-panel" style={{ padding: "24px" }}>
                  <h3 style={{ fontSize: "1.05rem", fontWeight: 700, marginBottom: "14px" }}>Recent Session Logs</h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    {[
                      { date: "Yesterday (06:00 PM)", topic: "Advanced React State Management & Hooks", status: "Present", color: "#34d399" },
                      { date: "3 Days Ago (06:00 PM)", topic: "Component Life Cycle & Async APIs", status: "Present", color: "#34d399" },
                      { date: "Last Week (06:00 PM)", topic: "Modern JavaScript ES6+ Architecture", status: "Present", color: "#34d399" },
                      { date: "2 Weeks Ago (06:00 PM)", topic: "Flexbox, Grid & Responsive UI Design", status: "Late (10 mins)", color: "#fbbf24" },
                    ].map((log, i) => (
                      <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", background: "rgba(0,0,0,0.25)", borderRadius: "8px", border: "1px solid var(--border-subtle)" }}>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: "0.9rem" }}>{log.topic}</div>
                          <div style={{ fontSize: "0.75rem", color: "var(--text-dim)" }}>{log.date}</div>
                        </div>
                        <span style={{ fontSize: "0.8rem", fontWeight: 700, color: log.color }}>
                          ● {log.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* 9. STUDENT CERTIFICATES VIEW                             */}
        {/* ======================================================== */}
        {activeTab === "certificates" && isStudent && (
          <div>
            <div style={{ marginBottom: "20px" }}>
              <h2 style={{ fontSize: "1.3rem", fontWeight: 800 }}>My Verified Digital Certificates</h2>
              <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
                Accredited certificates issued upon successful program completion and examination verification
              </p>
            </div>

            {certificates.length === 0 ? (
              <div className="glass-panel" style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>
                <Award size={42} style={{ margin: "0 auto 12px", opacity: 0.4 }} />
                <div style={{ fontSize: "1.1rem", fontWeight: 700 }}>Program In Progress</div>
                <div style={{ fontSize: "0.85rem", marginTop: "4px", maxWidth: "500px", margin: "4px auto 0" }}>
                  Digital certificates with unique verification IDs will be issued here once coursework, attendance, and final examinations are cleared.
                </div>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: "20px" }}>
                {certificates.map(cert => (
                  <div key={cert.certificateId} className="glass-panel" style={{ padding: "24px", border: "2px solid #eab308" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "14px" }}>
                      <span className="badge badge-amber" style={{ fontWeight: 800 }}>{cert.certificateId}</span>
                      <span className="badge badge-emerald">Verified Authentic</span>
                    </div>
                    <h3 style={{ fontSize: "1.15rem", fontWeight: 800, color: "#ffffff", marginBottom: "4px" }}>
                      {cert.courseTitle}
                    </h3>
                    <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "12px" }}>
                      Awarded to: <strong style={{ color: "#fff" }}>{cert.studentName}</strong> ({cert.grade})
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-dim)", borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: "10px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span>Issued: {cert.issueDate}</span>
                      <button onClick={() => window.print()} className="btn-secondary" style={{ padding: "4px 10px", fontSize: "0.75rem" }}>
                        <Printer size={13} />
                        <span>Print</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>

      {/* ======================================================== */}
      {/* MODALS                                                   */}
      {/* ======================================================== */}
      {/* 0. Modal: Create / Edit Course Program                    */}
      {/* ======================================================== */}
      {showCourseModal && (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.85)",
          backdropFilter: "blur(6px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px",
          zIndex: 9999
        }}>
          <div className="glass-panel" style={{
            maxWidth: "600px",
            width: "100%",
            maxHeight: "90vh",
            overflowY: "auto",
            padding: "28px",
            borderRadius: "var(--radius-lg)"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "rgba(99, 102, 241, 0.2)", color: "#a5b4fc", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <BookOpen size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: "1.25rem", fontWeight: 800 }}>
                    {editingCourse ? "Edit Course Program" : "Create New Course Program"}
                  </h3>
                  <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                    Published to LMS, Admission Portals, and Public Website
                  </div>
                </div>
              </div>
              <button onClick={() => setShowCourseModal(false)} style={{ background: "transparent", border: "none", color: "#94a3b8", cursor: "pointer" }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveCourseSubmit}>
              <div style={{ marginBottom: "14px" }}>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, marginBottom: "4px" }}>Course Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Artificial Intelligence & Prompt Engineering"
                  value={courseForm.title}
                  onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
                  style={{ width: "100%", padding: "10px", background: "rgba(0,0,0,0.3)", border: "1px solid var(--border-subtle)", borderRadius: "8px", color: "#ffffff" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "14px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, marginBottom: "4px" }}>Category *</label>
                  <select
                    value={courseForm.category}
                    onChange={(e) => setCourseForm({ ...courseForm, category: e.target.value })}
                    style={{ width: "100%", padding: "10px", background: "#090d16", border: "1px solid var(--border-subtle)", borderRadius: "8px", color: "#ffffff" }}
                  >
                    <option value="Information Technology">Information Technology</option>
                    <option value="Language & Fluency">Language & Fluency</option>
                    <option value="Professional & Management">Professional & Management</option>
                    <option value="Creative Arts & Design">Creative Arts & Design</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, marginBottom: "4px" }}>Badge Highlight</label>
                  <select
                    value={courseForm.badge}
                    onChange={(e) => setCourseForm({ ...courseForm, badge: e.target.value })}
                    style={{ width: "100%", padding: "10px", background: "#090d16", border: "1px solid var(--border-subtle)", borderRadius: "8px", color: "#ffffff" }}
                  >
                    <option value="New Course">New Course</option>
                    <option value="Most Popular">Most Popular</option>
                    <option value="Trending Tech">Trending Tech</option>
                    <option value="Flagship Course">Flagship Course</option>
                    <option value="Career Track">Career Track</option>
                    <option value="Executive">Executive</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: "14px" }}>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, marginBottom: "4px" }}>Tagline / Short Pitch *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Master LLMs, Python frameworks, and generative AI deployment"
                  value={courseForm.tagline}
                  onChange={(e) => setCourseForm({ ...courseForm, tagline: e.target.value })}
                  style={{ width: "100%", padding: "10px", background: "rgba(0,0,0,0.3)", border: "1px solid var(--border-subtle)", borderRadius: "8px", color: "#ffffff" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "14px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, marginBottom: "4px" }}>Tuition Fee (PKR) *</label>
                  <input
                    type="number"
                    required
                    min={1000}
                    value={courseForm.fee}
                    onChange={(e) => setCourseForm({ ...courseForm, fee: e.target.value })}
                    style={{ width: "100%", padding: "10px", background: "rgba(0,0,0,0.3)", border: "1px solid var(--border-subtle)", borderRadius: "8px", color: "#34d399", fontWeight: 700 }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, marginBottom: "4px" }}>Installments Allowed</label>
                  <select
                    value={courseForm.installments}
                    onChange={(e) => setCourseForm({ ...courseForm, installments: Number(e.target.value) })}
                    style={{ width: "100%", padding: "10px", background: "#090d16", border: "1px solid var(--border-subtle)", borderRadius: "8px", color: "#ffffff" }}
                  >
                    <option value={1}>1 (Full upfront payment)</option>
                    <option value={2}>2 Installments</option>
                    <option value={3}>3 Installments</option>
                    <option value={4}>4 Installments</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "14px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, marginBottom: "4px" }}>Program Duration *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 3 Months (12 Weeks)"
                    value={courseForm.duration}
                    onChange={(e) => setCourseForm({ ...courseForm, duration: e.target.value })}
                    style={{ width: "100%", padding: "10px", background: "rgba(0,0,0,0.3)", border: "1px solid var(--border-subtle)", borderRadius: "8px", color: "#ffffff" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, marginBottom: "4px" }}>Class Schedule / Weekly *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 4 Days / Week (Daily 2 hrs)"
                    value={courseForm.sessionsPerWeek}
                    onChange={(e) => setCourseForm({ ...courseForm, sessionsPerWeek: e.target.value })}
                    style={{ width: "100%", padding: "10px", background: "rgba(0,0,0,0.3)", border: "1px solid var(--border-subtle)", borderRadius: "8px", color: "#ffffff" }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "14px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, marginBottom: "4px" }}>Target Proficiency Level</label>
                  <select
                    value={courseForm.level}
                    onChange={(e) => setCourseForm({ ...courseForm, level: e.target.value })}
                    style={{ width: "100%", padding: "10px", background: "#090d16", border: "1px solid var(--border-subtle)", borderRadius: "8px", color: "#ffffff" }}
                  >
                    <option value="Beginner to Advanced">Beginner to Advanced</option>
                    <option value="Foundational">Foundational</option>
                    <option value="Intermediate to Advanced">Intermediate to Advanced</option>
                    <option value="Professional / Executive">Professional / Executive</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, marginBottom: "4px" }}>Prerequisites</label>
                  <input
                    type="text"
                    placeholder="e.g. Basic computer skills"
                    value={courseForm.prerequisites}
                    onChange={(e) => setCourseForm({ ...courseForm, prerequisites: e.target.value })}
                    style={{ width: "100%", padding: "10px", background: "rgba(0,0,0,0.3)", border: "1px solid var(--border-subtle)", borderRadius: "8px", color: "#ffffff" }}
                  />
                </div>
              </div>

              {/* Dynamic Modules Syllabus Builder */}
              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, marginBottom: "6px" }}>
                  Syllabus Modules & Topics ({courseForm.modules.length})
                </label>
                <div style={{ display: "flex", gap: "8px", marginBottom: "10px" }}>
                  <input
                    type="text"
                    placeholder="Enter module title (e.g. Node.js & REST API Architecture)"
                    value={newModuleInput}
                    onChange={(e) => setNewModuleInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddModuleToForm();
                      }
                    }}
                    style={{ flex: 1, padding: "9px 12px", background: "rgba(0,0,0,0.3)", border: "1px solid var(--border-subtle)", borderRadius: "8px", color: "#ffffff", fontSize: "0.85rem" }}
                  />
                  <button
                    type="button"
                    onClick={handleAddModuleToForm}
                    className="btn-secondary"
                    style={{ padding: "9px 14px", fontSize: "0.82rem" }}
                  >
                    <Plus size={14} />
                    <span>Add</span>
                  </button>
                </div>

                <div style={{
                  maxHeight: "150px",
                  overflowY: "auto",
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px",
                  background: "rgba(0, 0, 0, 0.2)",
                  padding: "8px",
                  borderRadius: "8px",
                  border: "1px solid var(--border-subtle)"
                }}>
                  {courseForm.modules.map((mod, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "6px 10px",
                        background: "rgba(255, 255, 255, 0.03)",
                        borderRadius: "6px",
                        fontSize: "0.82rem"
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ color: "#818cf8", fontWeight: 800 }}>{idx + 1}.</span>
                        <span style={{ color: "#e2e8f0" }}>{mod}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveModuleFromForm(idx)}
                        style={{ background: "transparent", border: "none", color: "#f87171", cursor: "pointer", padding: "2px" }}
                        title="Remove module"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                <button type="button" onClick={() => setShowCourseModal(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  <CheckCircle2 size={16} />
                  <span>{editingCourse ? "Update Course" : "Publish Course to Ecosystem"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 1. Modal: Invite Faculty via Gmail */}
      {showTeacherModal && (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.85)",
          backdropFilter: "blur(6px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px",
          zIndex: 9999
        }}>
          <div className="glass-panel" style={{ maxWidth: "480px", width: "100%", padding: "28px", borderRadius: "var(--radius-lg)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Mail size={20} color="#38bdf8" />
                <h3 style={{ fontSize: "1.2rem", fontWeight: 800 }}>Invite Faculty Member via Gmail</h3>
              </div>
              <button onClick={() => setShowTeacherModal(false)} style={{ background: "transparent", border: "none", color: "#94a3b8", cursor: "pointer" }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: "10px 14px", background: "rgba(56, 189, 248, 0.1)", border: "1px solid rgba(56, 189, 248, 0.3)", borderRadius: "8px", marginBottom: "16px", fontSize: "0.82rem", color: "#bae6fd" }}>
              <strong>Security Protocol:</strong> An activation email containing a secure link and temporary security code will be dispatched to this Gmail address. The teacher must activate their ID and set their permanent password before accessing the ecosystem.
            </div>

            <form onSubmit={handleCreateTeacher}>
              <div style={{ marginBottom: "14px" }}>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, marginBottom: "4px" }}>Instructor Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Engr. Bilal Ahmed"
                  value={newTeacherForm.name}
                  onChange={(e) => setNewTeacherForm({ ...newTeacherForm, name: e.target.value })}
                  style={{ width: "100%", padding: "10px", background: "rgba(0,0,0,0.3)", border: "1px solid var(--border-subtle)", borderRadius: "8px", color: "#ffffff" }}
                />
              </div>

              <div style={{ marginBottom: "14px" }}>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, marginBottom: "4px" }}>Official Gmail Address *</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. teacher.name@gmail.com"
                  value={newTeacherForm.email}
                  onChange={(e) => setNewTeacherForm({ ...newTeacherForm, email: e.target.value })}
                  style={{ width: "100%", padding: "10px", background: "rgba(0,0,0,0.3)", border: "1px solid var(--border-subtle)", borderRadius: "8px", color: "#ffffff" }}
                />
              </div>

              <div style={{ marginBottom: "14px" }}>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, marginBottom: "4px" }}>Department</label>
                <select
                  value={newTeacherForm.department}
                  onChange={(e) => setNewTeacherForm({ ...newTeacherForm, department: e.target.value })}
                  style={{ width: "100%", padding: "10px", background: "#090d16", border: "1px solid var(--border-subtle)", borderRadius: "8px", color: "#ffffff" }}
                >
                  <option value="IT & Web Development">IT & Web Development</option>
                  <option value="AI & Data Science">AI & Data Science</option>
                  <option value="English Language & IELTS">English Language & IELTS</option>
                  <option value="Creative Media & Graphic Design">Creative Media & Graphic Design</option>
                </select>
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, marginBottom: "4px" }}>Contact Phone</label>
                <input
                  type="text"
                  placeholder="+92 300 1234567"
                  value={newTeacherForm.phone}
                  onChange={(e) => setNewTeacherForm({ ...newTeacherForm, phone: e.target.value })}
                  style={{ width: "100%", padding: "10px", background: "rgba(0,0,0,0.3)", border: "1px solid var(--border-subtle)", borderRadius: "8px", color: "#ffffff" }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                <button type="button" onClick={() => setShowTeacherModal(false)} className="btn-secondary">Cancel</button>
                <button type="submit" disabled={isInvitingTeacher} className="btn-primary">
                  {isInvitingTeacher ? "Sending Email Automatically via Firebase..." : "Invite Faculty (Auto-Send via Firebase)"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Modal: Enroll Student via Gmail */}
      {showEnrollStudentModal && (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.85)",
          backdropFilter: "blur(6px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px",
          zIndex: 9999
        }}>
          <div className="glass-panel" style={{ maxWidth: "500px", width: "100%", padding: "28px", borderRadius: "var(--radius-lg)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <GraduationCap size={20} color="#38bdf8" />
                <h3 style={{ fontSize: "1.2rem", fontWeight: 800 }}>Enroll Student via Gmail</h3>
              </div>
              <button onClick={() => setShowEnrollStudentModal(false)} style={{ background: "transparent", border: "none", color: "#94a3b8", cursor: "pointer" }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: "10px 14px", background: "rgba(56, 189, 248, 0.1)", border: "1px solid rgba(56, 189, 248, 0.3)", borderRadius: "8px", marginBottom: "16px", fontSize: "0.82rem", color: "#bae6fd" }}>
              <strong>Activation Protocol:</strong> Enrolling this student dispatches an activation email to their Gmail with a secure link and temporary code. The student will activate their ID and set their permanent password.
            </div>

            <form onSubmit={handleEnrollStudent}>
              <div style={{ marginBottom: "14px" }}>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, marginBottom: "4px" }}>Student Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Tariq Mehmood"
                  value={newStudentForm.name}
                  onChange={(e) => setNewStudentForm({ ...newStudentForm, name: e.target.value })}
                  style={{ width: "100%", padding: "10px", background: "rgba(0,0,0,0.3)", border: "1px solid var(--border-subtle)", borderRadius: "8px", color: "#ffffff" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "14px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, marginBottom: "4px" }}>Student Gmail Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="student@gmail.com"
                    value={newStudentForm.email}
                    onChange={(e) => setNewStudentForm({ ...newStudentForm, email: e.target.value })}
                    style={{ width: "100%", padding: "10px", background: "rgba(0,0,0,0.3)", border: "1px solid var(--border-subtle)", borderRadius: "8px", color: "#ffffff" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, marginBottom: "4px" }}>Contact Phone</label>
                  <input
                    type="text"
                    placeholder="+92 300 0000000"
                    value={newStudentForm.phone}
                    onChange={(e) => setNewStudentForm({ ...newStudentForm, phone: e.target.value })}
                    style={{ width: "100%", padding: "10px", background: "rgba(0,0,0,0.3)", border: "1px solid var(--border-subtle)", borderRadius: "8px", color: "#ffffff" }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: "14px" }}>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, marginBottom: "4px" }}>Course Program *</label>
                <select
                  value={newStudentForm.course}
                  onChange={(e) => setNewStudentForm({ ...newStudentForm, course: e.target.value })}
                  style={{ width: "100%", padding: "10px", background: "#090d16", border: "1px solid var(--border-subtle)", borderRadius: "8px", color: "#ffffff" }}
                >
                  {courses.map(c => (
                    <option key={c.id} value={c.title}>{c.title}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "20px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, marginBottom: "4px" }}>Batch / Time Slot</label>
                  <input
                    type="text"
                    placeholder="e.g. BAT-701 or Evening Slot"
                    value={newStudentForm.batchCode}
                    onChange={(e) => setNewStudentForm({ ...newStudentForm, batchCode: e.target.value })}
                    style={{ width: "100%", padding: "10px", background: "rgba(0,0,0,0.3)", border: "1px solid var(--border-subtle)", borderRadius: "8px", color: "#ffffff" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, marginBottom: "4px" }}>Total Fee (PKR)</label>
                  <input
                    type="number"
                    value={newStudentForm.totalFee}
                    onChange={(e) => setNewStudentForm({ ...newStudentForm, totalFee: e.target.value })}
                    style={{ width: "100%", padding: "10px", background: "rgba(0,0,0,0.3)", border: "1px solid var(--border-subtle)", borderRadius: "8px", color: "#ffffff" }}
                  />
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                <button type="button" onClick={() => setShowEnrollStudentModal(false)} className="btn-secondary">Cancel</button>
                <button type="submit" disabled={isEnrollingStudent} className="btn-primary">
                  {isEnrollingStudent ? "Sending Email Automatically via Firebase..." : "Enroll Student (Auto-Send via Firebase)"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Modal: Schedule Exam */}
      {showScheduleExamModal && (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.85)",
          backdropFilter: "blur(6px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px",
          zIndex: 9999
        }}>
          <div className="glass-panel" style={{ maxWidth: "600px", width: "100%", padding: "28px", borderRadius: "var(--radius-lg)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ fontSize: "1.25rem", fontWeight: 800 }}>Schedule Institutional Examination</h3>
              <button onClick={() => setShowScheduleExamModal(false)} style={{ background: "transparent", border: "none", color: "#94a3b8", cursor: "pointer" }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: "10px 14px", background: "rgba(234, 179, 8, 0.1)", border: "1px solid rgba(234, 179, 8, 0.3)", borderRadius: "8px", marginBottom: "16px", fontSize: "0.82rem", color: "#fef08a" }}>
              <strong>Lifecycle Rule:</strong> Scheduling this exam delegates question formulation to the assigned teacher. Admin approval access is locked until the teacher submits the paper.
            </div>

            <form onSubmit={handleScheduleExamSubmit}>
              <div style={{ marginBottom: "14px" }}>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "6px" }}>Exam Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mid-Term Examination: Full-Stack Web Development"
                  value={newExamForm.title}
                  onChange={(e) => setNewExamForm({ ...newExamForm, title: e.target.value })}
                  style={{ width: "100%", padding: "10px", background: "rgba(0,0,0,0.3)", border: "1px solid var(--border-subtle)", borderRadius: "8px", color: "#ffffff" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "14px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "6px" }}>Course</label>
                  <select
                    value={newExamForm.courseId}
                    onChange={(e) => setNewExamForm({ ...newExamForm, courseId: e.target.value })}
                    style={{ width: "100%", padding: "10px", background: "#090d16", border: "1px solid var(--border-subtle)", borderRadius: "8px", color: "#ffffff" }}
                  >
                    {courses.map(c => (
                      <option key={c.id} value={c.id}>{c.title}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "6px" }}>Batch Code</label>
                  <input
                    type="text"
                    placeholder="e.g. FSWD-B1"
                    value={newExamForm.batchCode}
                    onChange={(e) => setNewExamForm({ ...newExamForm, batchCode: e.target.value })}
                    style={{ width: "100%", padding: "10px", background: "rgba(0,0,0,0.3)", border: "1px solid var(--border-subtle)", borderRadius: "8px", color: "#ffffff" }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: "14px" }}>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "6px" }}>Assign Question Authoring to Teacher *</label>
                {teachers.length > 0 ? (
                  <select
                    value={newExamForm.assignedTeacherName}
                    onChange={(e) => {
                      const t = teachers.find(tch => tch.name === e.target.value);
                      setNewExamForm({
                        ...newExamForm,
                        assignedTeacherName: e.target.value,
                        assignedTeacherId: t ? t.id : "",
                        assignedTeacherEmail: t ? t.email : ""
                      });
                    }}
                    style={{ width: "100%", padding: "10px", background: "#090d16", border: "1px solid var(--border-subtle)", borderRadius: "8px", color: "#ffffff" }}
                  >
                    <option value="">-- Select Registered Teacher --</option>
                    {teachers.map(t => (
                      <option key={t.id} value={t.name}>{t.name} ({t.department})</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    required
                    placeholder="e.g. Engr. Bilal Ahmed (or register teacher from Faculty tab)"
                    value={newExamForm.assignedTeacherName}
                    onChange={(e) => setNewExamForm({ ...newExamForm, assignedTeacherName: e.target.value })}
                    style={{ width: "100%", padding: "10px", background: "rgba(0,0,0,0.3)", border: "1px solid var(--border-subtle)", borderRadius: "8px", color: "#ffffff" }}
                  />
                )}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px", marginBottom: "14px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "6px" }}>Date</label>
                  <input
                    type="date"
                    value={newExamForm.examDate}
                    onChange={(e) => setNewExamForm({ ...newExamForm, examDate: e.target.value })}
                    style={{ width: "100%", padding: "10px", background: "rgba(0,0,0,0.3)", border: "1px solid var(--border-subtle)", borderRadius: "8px", color: "#ffffff" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "6px" }}>Duration (Mins)</label>
                  <input
                    type="number"
                    value={newExamForm.durationMinutes}
                    onChange={(e) => setNewExamForm({ ...newExamForm, durationMinutes: e.target.value })}
                    style={{ width: "100%", padding: "10px", background: "rgba(0,0,0,0.3)", border: "1px solid var(--border-subtle)", borderRadius: "8px", color: "#ffffff" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "6px" }}>Total Marks</label>
                  <input
                    type="number"
                    value={newExamForm.totalMarks}
                    onChange={(e) => setNewExamForm({ ...newExamForm, totalMarks: e.target.value })}
                    style={{ width: "100%", padding: "10px", background: "rgba(0,0,0,0.3)", border: "1px solid var(--border-subtle)", borderRadius: "8px", color: "#ffffff" }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: "18px" }}>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "6px" }}>Instructions</label>
                <textarea
                  rows={2}
                  value={newExamForm.instructions}
                  onChange={(e) => setNewExamForm({ ...newExamForm, instructions: e.target.value })}
                  style={{ width: "100%", padding: "10px", background: "rgba(0,0,0,0.3)", border: "1px solid var(--border-subtle)", borderRadius: "8px", color: "#ffffff" }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                <button type="button" onClick={() => setShowScheduleExamModal(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary">Schedule & Delegate to Teacher</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Modal: Teacher Question Studio */}
      {authoringExam && (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.9)",
          backdropFilter: "blur(8px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px",
          zIndex: 9999
        }}>
          <div className="glass-panel" style={{ maxWidth: "860px", width: "100%", maxHeight: "90vh", overflowY: "auto", padding: "28px", borderRadius: "var(--radius-lg)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "18px", borderBottom: "1px solid rgba(255,255,255,0.08)", paddingBottom: "14px" }}>
              <div>
                <span className="badge badge-emerald">Teacher Question Studio</span>
                <h3 style={{ fontSize: "1.25rem", fontWeight: 800, color: "#ffffff", marginTop: "4px" }}>
                  {authoringExam.title}
                </h3>
              </div>

              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>Target: <strong>{authoringExam.totalMarks} pts</strong></div>
                <div style={{ fontSize: "0.95rem", fontWeight: 800, color: authoringQuestions.reduce((a,q) => a + Number(q.marks), 0) >= authoringExam.totalMarks ? "#34d399" : "#fbbf24" }}>
                  Allocated: {authoringQuestions.reduce((a,q) => a + Number(q.marks), 0)} / {authoringExam.totalMarks} pts
                </div>
              </div>
            </div>

            {/* Question Form */}
            <div style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", padding: "16px", marginBottom: "20px" }}>
              <h4 style={{ fontSize: "0.92rem", fontWeight: 700, marginBottom: "10px" }}>Add Question</h4>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 120px", gap: "12px", marginBottom: "10px" }}>
                <div style={{ display: "flex", gap: "8px" }}>
                  {[
                    { id: "mcq", label: "Multiple Choice" },
                    { id: "short", label: "Short Answer" },
                    { id: "code", label: "Coding Task" }
                  ].map(t => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setNewQuestionType(t.id)}
                      style={{
                        padding: "6px 12px",
                        borderRadius: "6px",
                        border: "1px solid",
                        borderColor: newQuestionType === t.id ? "#38bdf8" : "rgba(255,255,255,0.1)",
                        background: newQuestionType === t.id ? "rgba(56, 189, 248, 0.2)" : "rgba(0,0,0,0.2)",
                        color: newQuestionType === t.id ? "#ffffff" : "var(--text-muted)",
                        fontSize: "0.78rem",
                        fontWeight: 600,
                        cursor: "pointer"
                      }}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>

                <div>
                  <input
                    type="number"
                    value={newQuestionMarks}
                    onChange={(e) => setNewQuestionMarks(e.target.value)}
                    placeholder="Marks"
                    style={{ width: "100%", padding: "8px", background: "#090d16", border: "1px solid var(--border-subtle)", borderRadius: "6px", color: "#ffffff" }}
                  />
                </div>
              </div>

              <textarea
                rows={2}
                placeholder="Enter question statement..."
                value={newQuestionText}
                onChange={(e) => setNewQuestionText(e.target.value)}
                style={{ width: "100%", padding: "10px", background: "#090d16", border: "1px solid var(--border-subtle)", borderRadius: "6px", color: "#ffffff", marginBottom: "10px" }}
              />

              {newQuestionType === "mcq" && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "12px" }}>
                  {newMcqOptions.map((opt, idx) => (
                    <div key={idx} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <input
                        type="radio"
                        name="mcqRadio"
                        checked={newCorrectOption === idx}
                        onChange={() => setNewCorrectOption(idx)}
                      />
                      <input
                        type="text"
                        placeholder={`Option ${String.fromCharCode(65 + idx)}`}
                        value={opt}
                        onChange={(e) => {
                          const copy = [...newMcqOptions];
                          copy[idx] = e.target.value;
                          setNewMcqOptions(copy);
                        }}
                        style={{ flex: 1, padding: "8px", background: "#090d16", border: "1px solid var(--border-subtle)", borderRadius: "6px", color: "#ffffff", fontSize: "0.85rem" }}
                      />
                    </div>
                  ))}
                </div>
              )}

              <button
                type="button"
                onClick={handleAddQuestion}
                className="btn-secondary"
                style={{ padding: "8px 14px", fontSize: "0.8rem", color: "#38bdf8", borderColor: "#38bdf8" }}
              >
                + Add to Question List
              </button>
            </div>

            {/* Questions List */}
            <div style={{ marginBottom: "20px" }}>
              <h4 style={{ fontSize: "0.95rem", fontWeight: 700, marginBottom: "10px" }}>
                Current Questions ({authoringQuestions.length})
              </h4>

              {authoringQuestions.length === 0 ? (
                <div style={{ padding: "20px", textAlign: "center", color: "var(--text-muted)" }}>
                  No questions added yet. Formulate questions using the builder above.
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {authoringQuestions.map((q, idx) => (
                    <div key={q.id} style={{ padding: "12px", background: "rgba(0,0,0,0.25)", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.06)", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "2px" }}>
                          <span style={{ fontWeight: 800, color: "#38bdf8" }}>Q{idx + 1}.</span>
                          <span className="badge badge-indigo" style={{ fontSize: "0.7rem" }}>{q.type.toUpperCase()}</span>
                          <span style={{ fontSize: "0.75rem", color: "#34d399", fontWeight: 700 }}>[{q.marks} Marks]</span>
                        </div>
                        <div style={{ fontSize: "0.9rem", color: "#ffffff" }}>{q.questionText}</div>
                      </div>

                      <button onClick={() => handleDeleteQuestion(q.id)} style={{ background: "transparent", border: "none", color: "#f87171", cursor: "pointer" }}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: "14px" }}>
              <button type="button" onClick={() => setAuthoringExam(null)} className="btn-secondary">
                Save Draft & Close
              </button>
              <button
                type="button"
                onClick={handleSubmitPaperToAdmin}
                className="btn-primary"
                style={{ background: "linear-gradient(135deg, #10b981, #059669)", display: "flex", alignItems: "center", gap: "8px" }}
              >
                <Send size={16} />
                <span>Submit Question Paper for Director Approval</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Modal: Admin Review */}
      {reviewExam && (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.9)",
          backdropFilter: "blur(8px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px",
          zIndex: 9999
        }}>
          <div className="glass-panel" style={{ maxWidth: "860px", width: "100%", maxHeight: "90vh", overflowY: "auto", padding: "28px", borderRadius: "var(--radius-lg)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px", borderBottom: "1px solid rgba(255,255,255,0.08)", paddingBottom: "14px" }}>
              <div>
                <span className="badge badge-cyan">Executive Review</span>
                <h3 style={{ fontSize: "1.25rem", fontWeight: 800, color: "#ffffff", marginTop: "4px" }}>
                  {reviewExam.title}
                </h3>
                <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                  Submitted by: <strong>{reviewExam.assignedTeacherName}</strong> on {reviewExam.submittedAt}
                </div>
              </div>

              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: "0.8rem", color: "var(--text-dim)" }}>Total Target: {reviewExam.totalMarks} pts</div>
                <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "#34d399" }}>
                  Allocated: {(reviewExam.questions || []).reduce((a,q) => a + Number(q.marks), 0)} pts
                </div>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "20px" }}>
              {(reviewExam.questions || []).map((q, idx) => (
                <div key={q.id} style={{ padding: "12px", background: "rgba(0,0,0,0.3)", borderRadius: "8px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "2px" }}>
                    <span style={{ fontWeight: 800, color: "#38bdf8" }}>Q{idx + 1}.</span>
                    <span className="badge badge-indigo" style={{ fontSize: "0.7rem" }}>{q.type.toUpperCase()}</span>
                    <span style={{ fontSize: "0.75rem", color: "#34d399", fontWeight: 700 }}>[{q.marks} Marks]</span>
                  </div>
                  <div style={{ fontSize: "0.9rem", color: "#ffffff" }}>{q.questionText}</div>
                </div>
              ))}
            </div>

            <div style={{ marginBottom: "18px" }}>
              <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, marginBottom: "4px" }}>
                Approval Remarks / Feedback Note (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Approved and verified for official conduction."
                value={adminApprovalNote}
                onChange={(e) => setAdminApprovalNote(e.target.value)}
                style={{ width: "100%", padding: "10px", background: "rgba(0,0,0,0.3)", border: "1px solid var(--border-subtle)", borderRadius: "8px", color: "#ffffff" }}
              />
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: "14px" }}>
              <button type="button" onClick={() => setReviewExam(null)} className="btn-secondary">Close</button>
              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  type="button"
                  onClick={() => {
                    const ex = reviewExam;
                    setReviewExam(null);
                    setRevisionModalExam(ex);
                  }}
                  className="btn-secondary"
                  style={{ color: "#f97316" }}
                >
                  <RotateCcw size={14} />
                  <span>Request Revisions</span>
                </button>
                <button
                  type="button"
                  onClick={handleAdminApproveExam}
                  className="btn-primary"
                  style={{ background: "linear-gradient(135deg, #10b981, #059669)" }}
                >
                  <CheckCircle2 size={16} />
                  <span>Approve & Publish Exam</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. Modal: Admin Request Revision */}
      {revisionModalExam && (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.85)",
          backdropFilter: "blur(6px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px",
          zIndex: 9999
        }}>
          <div className="glass-panel" style={{ maxWidth: "500px", width: "100%", padding: "24px", borderRadius: "var(--radius-lg)" }}>
            <h3 style={{ fontSize: "1.15rem", fontWeight: 800, color: "#f97316", marginBottom: "12px", display: "flex", alignItems: "center", gap: "6px" }}>
              <RotateCcw size={16} />
              <span>Return Paper for Revision</span>
            </h3>
            <textarea
              rows={4}
              required
              placeholder="Enter revision instructions for the instructor..."
              value={revisionFeedbackText}
              onChange={(e) => setRevisionFeedbackText(e.target.value)}
              style={{ width: "100%", padding: "10px", background: "rgba(0,0,0,0.3)", border: "1px solid var(--border-subtle)", borderRadius: "8px", color: "#ffffff", marginBottom: "16px" }}
            />
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
              <button type="button" onClick={() => setRevisionModalExam(null)} className="btn-secondary">Cancel</button>
              <button type="button" onClick={handleAdminSubmitRevision} className="btn-primary" style={{ background: "#f97316", border: "none" }}>
                Send Revision to Teacher
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. Modal: View Official Printable Paper */}
      {printableExam && (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.9)",
          backdropFilter: "blur(8px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px",
          zIndex: 9999
        }}>
          <div className="glass-panel" style={{ maxWidth: "800px", width: "100%", maxHeight: "92vh", overflowY: "auto", padding: "36px", borderRadius: "var(--radius-lg)", background: "#ffffff", color: "#0f172a" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", borderBottom: "2px solid #e2e8f0", paddingBottom: "12px" }}>
              <span style={{ fontSize: "0.8rem", color: "#64748b", fontWeight: 700 }}>
                APEX EXAMINATION BOARD - OFFICIAL QUESTION PAPER
              </span>
              <div style={{ display: "flex", gap: "8px" }}>
                <button onClick={() => window.print()} style={{ padding: "8px 14px", borderRadius: "6px", background: "#4f46e5", color: "#fff", border: "none", fontWeight: 700, cursor: "pointer" }}>
                  <Printer size={15} />
                  <span>Print</span>
                </button>
                <button onClick={() => setPrintableExam(null)} style={{ padding: "8px 14px", borderRadius: "6px", background: "#f1f5f9", color: "#475569", border: "1px solid #cbd5e1", fontWeight: 600, cursor: "pointer" }}>
                  Close
                </button>
              </div>
            </div>

            <div style={{ textAlign: "center", borderBottom: "2px double #0f172a", paddingBottom: "14px", marginBottom: "16px" }}>
              <div style={{ fontSize: "1.3rem", fontWeight: 900, textTransform: "uppercase" }}>APEX EDUCATION FORUM</div>
              <div style={{ fontSize: "0.82rem", color: "#475569", fontWeight: 600 }}>Higher Vocational & Technical Institute</div>
              <div style={{ fontSize: "1.1rem", fontWeight: 800, marginTop: "6px" }}>{printableExam.title}</div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", fontSize: "0.85rem", marginBottom: "16px", borderBottom: "1px solid #e2e8f0", paddingBottom: "12px" }}>
              <div><strong>Course:</strong> {printableExam.courseTitle}</div>
              <div style={{ textAlign: "right" }}><strong>Batch:</strong> {printableExam.batchCode}</div>
              <div><strong>Date:</strong> {printableExam.examDate}</div>
              <div style={{ textAlign: "right" }}><strong>Duration:</strong> {printableExam.durationMinutes} Mins</div>
              <div><strong>Examiner:</strong> {printableExam.assignedTeacherName}</div>
              <div style={{ textAlign: "right" }}><strong>Total Marks:</strong> {printableExam.totalMarks} (Passing: {printableExam.passingMarks})</div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {(printableExam.questions || []).map((q, idx) => (
                <div key={q.id} style={{ borderBottom: "1px dotted #cbd5e1", paddingBottom: "12px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 800, fontSize: "0.92rem", marginBottom: "4px" }}>
                    <span>Q{idx + 1}. {q.questionText}</span>
                    <span>[{q.marks} Marks]</span>
                  </div>
                  {q.type === "mcq" && q.options && (
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px", paddingLeft: "14px", fontSize: "0.85rem", marginTop: "6px" }}>
                      {q.options.map((opt, oIdx) => (
                        <div key={oIdx}>({String.fromCharCode(97 + oIdx)}) {opt}</div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div style={{ textAlign: "center", marginTop: "28px", fontSize: "0.78rem", color: "#94a3b8", fontWeight: 700 }}>
              --- END OF QUESTION PAPER ---
            </div>
          </div>
        </div>
      )}

      {/* 7. Modal: Schedule Batch */}
      {showBatchModal && (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.8)",
          backdropFilter: "blur(6px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px",
          zIndex: 9999
        }}>
          <div className="glass-panel" style={{ maxWidth: "520px", width: "100%", padding: "28px", borderRadius: "var(--radius-lg)" }}>
            <h3 style={{ fontSize: "1.2rem", fontWeight: 800, marginBottom: "16px" }}>Schedule New Batch</h3>
            <form onSubmit={handleCreateBatch}>
              <div style={{ marginBottom: "12px" }}>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, marginBottom: "4px" }}>Course</label>
                <select
                  value={newBatch.courseId}
                  onChange={(e) => setNewBatch({ ...newBatch, courseId: e.target.value })}
                  style={{ width: "100%", padding: "10px", background: "#090d16", border: "1px solid var(--border-subtle)", borderRadius: "8px", color: "#ffffff" }}
                >
                  {courses.map(c => (
                    <option key={c.id} value={c.id}>{c.title}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "12px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, marginBottom: "4px" }}>Batch Code</label>
                  <input
                    type="text"
                    placeholder="e.g. FSWD-B1"
                    value={newBatch.batchCode}
                    onChange={(e) => setNewBatch({ ...newBatch, batchCode: e.target.value })}
                    style={{ width: "100%", padding: "10px", background: "rgba(0,0,0,0.3)", border: "1px solid var(--border-subtle)", borderRadius: "8px", color: "#ffffff" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, marginBottom: "4px" }}>Capacity</label>
                  <input
                    type="number"
                    value={newBatch.capacity}
                    onChange={(e) => setNewBatch({ ...newBatch, capacity: e.target.value })}
                    style={{ width: "100%", padding: "10px", background: "rgba(0,0,0,0.3)", border: "1px solid var(--border-subtle)", borderRadius: "8px", color: "#ffffff" }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "12px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, marginBottom: "4px" }}>Timetable Slot</label>
                  <select
                    value={newBatch.timeSlot}
                    onChange={(e) => setNewBatch({ ...newBatch, timeSlot: e.target.value })}
                    style={{ width: "100%", padding: "10px", background: "#090d16", border: "1px solid var(--border-subtle)", borderRadius: "8px", color: "#ffffff" }}
                  >
                    {BATCH_SLOTS.map(s => (
                      <option key={s.id} value={s.label}>{s.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, marginBottom: "4px" }}>Start Date</label>
                  <input
                    type="date"
                    value={newBatch.startDate}
                    onChange={(e) => setNewBatch({ ...newBatch, startDate: e.target.value })}
                    style={{ width: "100%", padding: "10px", background: "rgba(0,0,0,0.3)", border: "1px solid var(--border-subtle)", borderRadius: "8px", color: "#ffffff" }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "18px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, marginBottom: "4px" }}>Lab</label>
                  <select
                    value={newBatch.lab}
                    onChange={(e) => setNewBatch({ ...newBatch, lab: e.target.value })}
                    style={{ width: "100%", padding: "10px", background: "#090d16", border: "1px solid var(--border-subtle)", borderRadius: "8px", color: "#ffffff" }}
                  >
                    <option value="Computer Lab 1">Computer Lab 1</option>
                    <option value="Computer Lab 2">Computer Lab 2</option>
                    <option value="Language Audio-Visual Lab">Language Audio-Visual Lab</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, marginBottom: "4px" }}>Instructor</label>
                  {teachers.length > 0 ? (
                    <select
                      value={newBatch.instructor}
                      onChange={(e) => setNewBatch({ ...newBatch, instructor: e.target.value })}
                      style={{ width: "100%", padding: "10px", background: "#090d16", border: "1px solid var(--border-subtle)", borderRadius: "8px", color: "#ffffff" }}
                    >
                      <option value="">-- Select Instructor --</option>
                      {teachers.map(t => (
                        <option key={t.id} value={t.name}>{t.name}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      placeholder="Instructor Name"
                      value={newBatch.instructor}
                      onChange={(e) => setNewBatch({ ...newBatch, instructor: e.target.value })}
                      style={{ width: "100%", padding: "10px", background: "rgba(0,0,0,0.3)", border: "1px solid var(--border-subtle)", borderRadius: "8px", color: "#ffffff" }}
                    />
                  )}
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                <button type="button" onClick={() => setShowBatchModal(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary">Create Batch</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 8. Modal: Record Fee */}
      {showFeeModal && selectedStudentForFee && (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.8)",
          backdropFilter: "blur(6px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px",
          zIndex: 9999
        }}>
          <div className="glass-panel" style={{ maxWidth: "460px", width: "100%", padding: "26px", borderRadius: "var(--radius-lg)" }}>
            <h3 style={{ fontSize: "1.15rem", fontWeight: 800, marginBottom: "12px" }}>Record Fee Payment</h3>
            <div style={{ padding: "10px", background: "rgba(0,0,0,0.25)", borderRadius: "8px", marginBottom: "14px", fontSize: "0.85rem" }}>
              <div>Student: <strong>{selectedStudentForFee.name}</strong></div>
              <div>Remaining: <strong style={{ color: "#f87171" }}>PKR {(selectedStudentForFee.totalFee - selectedStudentForFee.paidFee).toLocaleString()}</strong></div>
            </div>

            <form onSubmit={handleRecordPayment}>
              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, marginBottom: "4px" }}>Payment Amount (PKR) *</label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 10000"
                  value={feePaymentAmount}
                  onChange={(e) => setFeePaymentAmount(e.target.value)}
                  style={{ width: "100%", padding: "10px", background: "rgba(0,0,0,0.3)", border: "1px solid var(--border-subtle)", borderRadius: "8px", color: "#ffffff", fontSize: "1rem", fontWeight: 700 }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                <button type="button" onClick={() => setShowFeeModal(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary">Record Payment</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 9. Modal: Receipt */}
      {receiptToPrint && (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.85)",
          backdropFilter: "blur(6px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px",
          zIndex: 9999
        }}>
          <div className="glass-panel" style={{ maxWidth: "480px", width: "100%", padding: "28px", borderRadius: "var(--radius-lg)", background: "#0a0f1d" }}>
            <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "12px", marginBottom: "14px" }}>
              <div>
                <div style={{ fontSize: "1rem", fontWeight: 900, color: "#ffffff" }}>APEX EDUCATION FORUM</div>
                <div style={{ fontSize: "0.72rem", color: "#38bdf8" }}>Official Fee Receipt</div>
              </div>
              <div style={{ textAlign: "right", fontSize: "0.75rem", color: "var(--text-dim)" }}>
                <div>Receipt: {receiptToPrint.receiptNo}</div>
                <div>Date: {receiptToPrint.date}</div>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "0.85rem", marginBottom: "18px" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--text-dim)" }}>Received From:</span>
                <strong>{receiptToPrint.studentName}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--text-dim)" }}>Course:</span>
                <span>{receiptToPrint.course}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: "8px", fontSize: "1rem" }}>
                <span style={{ fontWeight: 700 }}>Amount Paid:</span>
                <strong style={{ color: "#34d399" }}>PKR {receiptToPrint.amountPaid.toLocaleString()}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-dim)", fontSize: "0.82rem" }}>
                <span>Remaining:</span>
                <span>PKR {receiptToPrint.remainingBalance.toLocaleString()}</span>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
              <button onClick={() => window.print()} className="btn-secondary" style={{ padding: "6px 12px", fontSize: "0.82rem" }}>
                <Printer size={14} />
                <span>Print</span>
              </button>
              <button onClick={() => setReceiptToPrint(null)} className="btn-primary" style={{ padding: "6px 14px", fontSize: "0.82rem" }}>
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
