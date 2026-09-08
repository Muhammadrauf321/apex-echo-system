import React, { useState, useEffect } from "react";
import EcosystemNav from "@shared/EcosystemNav.jsx";
import { getCurrentUser, subscribeToAuth } from "@shared/auth.js";
import { 
  getCourses, 
  getBatches, 
  createBatch, 
  getInquiries, 
  updateInquiryStatus, 
  issueCertificate,
  getExams,
  createExam,
  updateExamQuestions,
  submitExamPaper,
  approveExam,
  requestExamRevision
} from "@shared/dataStore.js";
import { DEMO_USERS, SEED_CERTIFICATES } from "@shared/seedData.js";
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
  Unlock,
  Send,
  RotateCcw,
  BookOpen,
  Edit3,
  Trash2,
  HelpCircle,
  Code2,
  ShieldCheck,
  Eye,
  AlertTriangle,
  GraduationCap
} from "lucide-react";

export default function App() {
  const [currentUser, setCurrentUser] = useState(getCurrentUser());

  // Role Checks
  const isAdmin = currentUser?.role === ROLES.DIRECTOR || currentUser?.role === ROLES.MANAGER;
  const isTeacher = currentUser?.role === ROLES.INSTRUCTOR;
  const isStudent = currentUser?.role === ROLES.STUDENT;

  // Initial active tab based on role
  const [activeTab, setActiveTab] = useState(isAdmin ? "overview" : isTeacher ? "exams" : "exams");

  // Core Data State
  const [courses] = useState(getCourses());
  const [batches, setBatches] = useState(getBatches());
  const [inquiries, setInquiries] = useState(getInquiries());
  const [exams, setExams] = useState(getExams());
  const [examFilter, setExamFilter] = useState("all");

  const [students, setStudents] = useState([
    {
      id: "std_01",
      name: "Hamza Tariq",
      phone: "+92 301 5554321",
      course: "Full-Stack Web Development (MERN)",
      batchCode: "FSWD-B14",
      totalFee: 28000,
      paidFee: 18000,
      status: FEE_STATUS.PARTIAL,
      attendance: 94
    },
    {
      id: "std_02",
      name: "Zainab Fatima",
      phone: "+92 345 1112233",
      course: "Spoken English & Fluency Mastery",
      batchCode: "ENG-B22",
      totalFee: 15000,
      paidFee: 15000,
      status: FEE_STATUS.PAID,
      attendance: 98
    },
    {
      id: "std_03",
      name: "Usman Ghani",
      phone: "+92 333 4445566",
      course: "Python Programming, Data Science & AI",
      batchCode: "PY-B08",
      totalFee: 24000,
      paidFee: 12000,
      status: FEE_STATUS.PARTIAL,
      attendance: 88
    },
    {
      id: "std_04",
      name: "Ayesha Imran",
      phone: "+92 322 7778899",
      course: "IELTS Academic Masterclass",
      batchCode: "IELTS-B11",
      totalFee: 22000,
      paidFee: 22000,
      status: FEE_STATUS.PAID,
      attendance: 96
    }
  ]);

  // Modals State
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [showFeeModal, setShowFeeModal] = useState(false);
  const [selectedStudentForFee, setSelectedStudentForFee] = useState(null);
  const [feePaymentAmount, setFeePaymentAmount] = useState("");
  const [receiptToPrint, setReceiptToPrint] = useState(null);

  // New Batch Form State
  const [newBatch, setNewBatch] = useState({
    courseId: courses[0]?.id || "",
    batchCode: "",
    instructor: "Engr. Bilal Ahmed",
    timeSlot: BATCH_SLOTS[3].label,
    lab: "Computer Lab 1",
    startDate: "2026-10-01",
    capacity: 25
  });

  // Certificate Issuance State
  const [certForm, setCertForm] = useState({
    studentName: "",
    courseTitle: courses[0]?.title || "",
    grade: "A+ with Distinction",
    instructorName: "Engr. Bilal Ahmed",
    skills: "React.js, Node.js, Cloud Firestore"
  });
  const [issuedCert, setIssuedCert] = useState(null);

  // Attendance Register State
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split("T")[0]);
  const [attendanceRecords, setAttendanceRecords] = useState({
    std_01: "present",
    std_02: "present",
    std_03: "absent",
    std_04: "present"
  });

  // --- Examination Modals & Workflow State ---
  const [showScheduleExamModal, setShowScheduleExamModal] = useState(false);
  const [newExamForm, setNewExamForm] = useState({
    title: "",
    courseId: courses[0]?.id || "",
    batchCode: batches[0]?.batchCode || "",
    assignedTeacherId: "usr_ins_01",
    examDate: "2026-10-20",
    durationMinutes: 90,
    totalMarks: 50,
    passingMarks: 25,
    instructions: "All questions are compulsory. Use of calculators or unauthorized media is strictly forbidden."
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

  // Admin Request Revision Modal
  const [revisionModalExam, setRevisionModalExam] = useState(null);
  const [revisionFeedbackText, setRevisionFeedbackText] = useState("");

  // Printable Exam Modal
  const [printableExam, setPrintableExam] = useState(null);

  // Status message banner
  const [statusBanner, setStatusBanner] = useState(null);

  // Subscribe to Auth changes
  useEffect(() => {
    const unsub = subscribeToAuth(u => {
      setCurrentUser(u);
    });
    return unsub;
  }, []);

  // Update active tab when role changes
  useEffect(() => {
    if (isTeacher) {
      if (activeTab === "overview" || activeTab === "fees" || activeTab === "certificates") {
        setActiveTab("exams");
      }
    } else if (isStudent) {
      if (activeTab === "overview" || activeTab === "fees" || activeTab === "certificates") {
        setActiveTab("exams");
      }
    }
  }, [currentUser, isTeacher, isStudent]);

  // Listen to inquiries changes
  useEffect(() => {
    const handleInqChange = () => setInquiries(getInquiries());
    window.addEventListener("apex_inquiries_changed", handleInqChange);
    return () => window.removeEventListener("apex_inquiries_changed", handleInqChange);
  }, []);

  // Listen to exams changes
  useEffect(() => {
    const handleExamsChange = () => setExams(getExams());
    window.addEventListener("apex_exams_changed", handleExamsChange);
    return () => window.removeEventListener("apex_exams_changed", handleExamsChange);
  }, []);

  // Auto clear status banner
  useEffect(() => {
    if (statusBanner) {
      const t = setTimeout(() => setStatusBanner(null), 5000);
      return () => clearTimeout(t);
    }
  }, [statusBanner]);

  const handleApproveInquiry = (inq) => {
    updateInquiryStatus(inq.id, "approved");
    const newStudent = {
      id: `std_${Date.now()}`,
      name: inq.name,
      phone: inq.phone,
      course: inq.courseTitle,
      batchCode: "Pending Allocation",
      totalFee: 20000,
      paidFee: 0,
      status: FEE_STATUS.PENDING,
      attendance: 100
    };
    setStudents([newStudent, ...students]);
  };

  const handleCreateBatch = (e) => {
    e.preventDefault();
    const course = courses.find(c => c.id === newBatch.courseId);
    createBatch({
      courseId: newBatch.courseId,
      courseTitle: course ? course.title : "Course",
      batchCode: newBatch.batchCode || `BAT-${Math.floor(100 + Math.random() * 900)}`,
      instructor: newBatch.instructor,
      timeSlot: newBatch.timeSlot,
      lab: newBatch.lab,
      startDate: newBatch.startDate,
      capacity: Number(newBatch.capacity)
    });
    setBatches(getBatches());
    setShowBatchModal(false);
  };

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

  const handleIssueCertificate = (e) => {
    e.preventDefault();
    if (!certForm.studentName) return;

    const cert = issueCertificate({
      studentName: certForm.studentName,
      courseTitle: certForm.courseTitle,
      grade: certForm.grade,
      instructorName: certForm.instructorName,
      skills: certForm.skills.split(",").map(s => s.trim())
    });

    setIssuedCert(cert);
    confetti({
      particleCount: 120,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  // --- Examination Handlers ---

  // Admin schedules exam
  const handleScheduleExamSubmit = (e) => {
    e.preventDefault();
    const course = courses.find(c => c.id === newExamForm.courseId);
    const teacher = DEMO_USERS.find(u => u.uid === newExamForm.assignedTeacherId);

    createExam({
      title: newExamForm.title,
      courseId: newExamForm.courseId,
      courseTitle: course ? course.title : "Program Exam",
      batchCode: newExamForm.batchCode,
      assignedTeacherId: newExamForm.assignedTeacherId,
      assignedTeacherName: teacher ? teacher.name : "Assigned Instructor",
      createdById: currentUser?.uid || "admin",
      createdByName: currentUser?.name || "Executive Admin",
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
      message: `Exam scheduled successfully. Rotation handed over to ${teacher?.name || "Teacher"}. Admin question approval access is locked until submission.`
    });
  };

  // Teacher opens Question Authoring Studio
  const handleOpenAuthoringStudio = (exam) => {
    setAuthoringExam(exam);
    setAuthoringQuestions([...(exam.questions || [])]);
    setNewQuestionText("");
    setNewMcqOptions(["", "", "", ""]);
    setNewQuestionMarks(5);
  };

  // Teacher adds question
  const handleAddQuestion = () => {
    if (!newQuestionText.trim()) return;

    const questionObj = {
      id: `q_${Date.now()}`,
      questionText: newQuestionText.trim(),
      type: newQuestionType,
      marks: Number(newQuestionMarks) || 5,
      options: newQuestionType === "mcq" ? [...newMcqOptions] : [],
      correctOption: newQuestionType === "mcq" ? newCorrectOption : null
    };

    const updated = [...authoringQuestions, questionObj];
    setAuthoringQuestions(updated);
    updateExamQuestions(authoringExam.id, updated);
    setNewQuestionText("");
    setNewMcqOptions(["", "", "", ""]);
  };

  // Teacher deletes question
  const handleDeleteQuestion = (qId) => {
    const updated = authoringQuestions.filter(q => q.id !== qId);
    setAuthoringQuestions(updated);
    updateExamQuestions(authoringExam.id, updated);
  };

  // Teacher Submits Paper to Director (ROTATION: LOCKS TEACHER, UNLOCKS ADMIN)
  const handleSubmitPaperToAdmin = () => {
    if (!authoringExam) return;
    if (authoringQuestions.length === 0) {
      alert("Please add at least one question before submitting.");
      return;
    }

    // Save final questions first
    updateExamQuestions(authoringExam.id, authoringQuestions);
    submitExamPaper(authoringExam.id);
    setAuthoringExam(null);
    setExams(getExams());

    setStatusBanner({
      type: "success",
      message: "Question Paper submitted to Director! Your editing and submission access is now LOCKED until Admin review."
    });
  };

  // Admin Approves Exam (FINAL ROTATION: APPROVED & PUBLISHED)
  const handleAdminApproveExam = () => {
    if (!reviewExam) return;
    approveExam(reviewExam.id, adminApprovalNote || "Approved and verified by Executive Director.");
    setReviewExam(null);
    setAdminApprovalNote("");
    setExams(getExams());

    confetti({
      particleCount: 140,
      spread: 80,
      origin: { y: 0.5 }
    });

    setStatusBanner({
      type: "success",
      message: "Exam paper approved and officially published! Paper is now finalized and printable."
    });
  };

  // Admin Requests Revision (ROTATION: UNLOCKS TEACHER WITH FEEDBACK)
  const handleAdminSubmitRevision = () => {
    if (!revisionModalExam || !revisionFeedbackText.trim()) return;
    requestExamRevision(revisionModalExam.id, revisionFeedbackText.trim());
    setRevisionModalExam(null);
    setRevisionFeedbackText("");
    setExams(getExams());

    setStatusBanner({
      type: "warning",
      message: "Paper returned to instructor with revision notes. Editing has been re-enabled for the teacher."
    });
  };

  // Filter exams based on Role & Status Filter
  const filteredExams = exams.filter(e => {
    // If teacher: only view exams assigned to this teacher
    if (isTeacher && e.assignedTeacherId !== currentUser?.uid && e.assignedTeacherName !== currentUser?.name) {
      return false;
    }
    // Filter by tab selector
    if (examFilter === "all") return true;
    return e.status === examFilter;
  });

  const totalFeeCollected = students.reduce((acc, s) => acc + s.paidFee, 0);
  const totalFeeExpected = students.reduce((acc, s) => acc + s.totalFee, 0);

  // Dynamic Navigation Tabs per Role
  const roleTabs = [];
  if (isAdmin) {
    roleTabs.push(
      { id: "overview", label: "Executive Overview", icon: LayoutDashboard },
      { id: "batches", label: "Batches & Timetables", icon: Calendar },
      { id: "fees", label: "Admissions & Fee Tracking", icon: DollarSign },
      { id: "exams", label: "Examination Master Control", icon: FileText, badge: exams.filter(e => e.status === EXAM_STATUS.PENDING_ADMIN).length },
      { id: "certificates", label: "Digital Certificates", icon: Award }
    );
  } else if (isTeacher) {
    const pendingMyAction = exams.filter(e => 
      (e.assignedTeacherId === currentUser?.uid || e.assignedTeacherName === currentUser?.name) && 
      (e.status === EXAM_STATUS.PENDING_TEACHER || e.status === EXAM_STATUS.REVISION)
    ).length;

    roleTabs.push(
      { id: "batches", label: "My Assigned Batches", icon: Calendar },
      { id: "attendance", label: "Attendance Register", icon: CheckSquare },
      { id: "exams", label: "My Exam Papers (Authoring)", icon: FileText, badge: pendingMyAction }
    );
  } else {
    // Student
    roleTabs.push(
      { id: "batches", label: "My Schedule & Batch", icon: Calendar },
      { id: "attendance", label: "My Attendance Status", icon: CheckSquare },
      { id: "exams", label: "Scheduled Examinations", icon: FileText }
    );
  }

  // Teacher assigned batches
  const teacherBatches = isTeacher 
    ? batches.filter(b => b.instructor.toLowerCase().includes(currentUser?.name?.split(" ")[0]?.toLowerCase() || ""))
    : batches;

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--bg-dark)", color: "var(--text-main)" }}>
      {/* Ecosystem Global Navigation */}
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
                Active Identity: <strong style={{ color: "#ffffff" }}>{currentUser?.name}</strong>
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
                {ROLE_LABELS[currentUser?.role] || currentUser?.role}
              </span>
              <span style={{ fontSize: "0.75rem", color: "#64748b" }}>
                ({currentUser?.uid})
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
                  <span>Schedule New Exam</span>
                </button>
                <button
                  onClick={() => setShowBatchModal(true)}
                  className="btn-primary"
                  style={{ fontSize: "0.88rem" }}
                >
                  <Plus size={16} />
                  <span>Schedule New Batch</span>
                </button>
              </>
            )}
            {isTeacher && (
              <button
                onClick={() => setActiveTab("exams")}
                className="btn-primary"
                style={{ fontSize: "0.88rem", background: "linear-gradient(135deg, #10b981, #059669)" }}
              >
                <Edit3 size={16} />
                <span>My Assigned Question Papers</span>
              </button>
            )}
          </div>
        </div>

        {/* Dynamic Navigation Tabs based on Role */}
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

        {/* 1. EXECUTIVE OVERVIEW TAB (ADMIN ONLY) */}
        {activeTab === "overview" && isAdmin && (
          <div>
            {/* KPI Stat Cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "20px", marginBottom: "32px" }}>
              <div className="glass-panel" style={{ padding: "22px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                  <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600 }}>Active Students</span>
                  <Users size={20} color="#06b6d4" />
                </div>
                <div style={{ fontSize: "2.2rem", fontWeight: 800, color: "#ffffff" }}>{students.length}</div>
                <div style={{ fontSize: "0.78rem", color: "#34d399", marginTop: "4px" }}>+4 enrolled this week</div>
              </div>

              <div className="glass-panel" style={{ padding: "22px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                  <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600 }}>Active Batches</span>
                  <Calendar size={20} color="#6366f1" />
                </div>
                <div style={{ fontSize: "2.2rem", fontWeight: 800, color: "#ffffff" }}>{batches.length}</div>
                <div style={{ fontSize: "0.78rem", color: "#818cf8", marginTop: "4px" }}>IT & Language labs running</div>
              </div>

              <div className="glass-panel" style={{ padding: "22px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                  <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600 }}>Exams in Rotation</span>
                  <FileText size={20} color="#38bdf8" />
                </div>
                <div style={{ fontSize: "2.2rem", fontWeight: 800, color: "#ffffff" }}>{exams.length}</div>
                <div style={{ fontSize: "0.78rem", color: "#38bdf8", marginTop: "4px" }}>
                  {exams.filter(e => e.status === EXAM_STATUS.PENDING_ADMIN).length} ready for review
                </div>
              </div>

              <div className="glass-panel" style={{ padding: "22px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                  <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600 }}>Fee Recovery Rate</span>
                  <TrendingUp size={20} color="#10b981" />
                </div>
                <div style={{ fontSize: "2.2rem", fontWeight: 800, color: "#ffffff" }}>
                  {Math.round((totalFeeCollected / (totalFeeExpected || 1)) * 100)}%
                </div>
                <div style={{ fontSize: "0.78rem", color: "#34d399", marginTop: "4px" }}>
                  PKR {totalFeeCollected.toLocaleString()} collected
                </div>
              </div>
            </div>

            {/* Inquiries & Batches Dual Column */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(450px, 1fr))", gap: "28px" }}>
              {/* Online Admission Applications */}
              <div className="glass-panel" style={{ padding: "24px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
                  <h3 style={{ fontSize: "1.15rem", fontWeight: 700 }}>Incoming Website Admissions</h3>
                  <span className="badge badge-amber">{inquiries.filter(i => i.status === "pending").length} Pending</span>
                </div>

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
              </div>

              {/* Active Batches Capacity */}
              <div className="glass-panel" style={{ padding: "24px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
                  <h3 style={{ fontSize: "1.15rem", fontWeight: 700 }}>Batches & Lab Utilization</h3>
                  <span className="badge badge-cyan">{batches.length} Running</span>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  {batches.map((batch) => {
                    const percent = Math.round((batch.enrolledCount / batch.capacity) * 100);
                    return (
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
                            {batch.enrolledCount} / {batch.capacity} Seats ({percent}%)
                          </span>
                        </div>

                        {/* Progress Bar */}
                        <div style={{ width: "100%", height: "6px", background: "rgba(255,255,255,0.1)", borderRadius: "3px", overflow: "hidden", marginBottom: "8px" }}>
                          <div style={{ width: `${percent}%`, height: "100%", background: percent > 80 ? "#10b981" : "#6366f1" }} />
                        </div>

                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: "var(--text-dim)" }}>
                          <span>Trainer: {batch.instructor}</span>
                          <span>Lab: {batch.lab} ({batch.timeSlot})</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. BATCHES & TIMETABLES TAB */}
        {activeTab === "batches" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <div>
                <h2 style={{ fontSize: "1.3rem", fontWeight: 800 }}>
                  {isTeacher ? "My Assigned Classes & Schedule" : "All Scheduled Batches & Lab Timetables"}
                </h2>
                <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
                  {isTeacher ? "Showing classes assigned to your instructor profile" : "Comprehensive master timetable across Computer Labs and Language Audio-Visual studios"}
                </p>
              </div>

              {isAdmin && (
                <button onClick={() => setShowBatchModal(true)} className="btn-primary" style={{ fontSize: "0.85rem" }}>
                  <Plus size={16} />
                  <span>New Batch</span>
                </button>
              )}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "20px" }}>
              {(isTeacher ? teacherBatches : batches).map((b) => (
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
                    <button
                      onClick={() => setActiveTab("attendance")}
                      className="btn-secondary"
                      style={{ padding: "6px 12px", fontSize: "0.8rem" }}
                    >
                      <span>Attendance</span>
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 3. ADMISSIONS & FEE TRACKING (ADMIN ONLY) */}
        {activeTab === "fees" && isAdmin && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <div>
                <h2 style={{ fontSize: "1.3rem", fontWeight: 800 }}>Student Admission & Fee Management</h2>
                <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
                  Track outstanding student dues, record fee installments, and print verified digital vouchers
                </p>
              </div>
            </div>

            <div className="glass-panel" style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.9rem" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--border-subtle)", color: "var(--text-muted)", fontSize: "0.78rem", textTransform: "uppercase" }}>
                    <th style={{ padding: "16px" }}>Student Name</th>
                    <th style={{ padding: "16px" }}>Course & Batch</th>
                    <th style={{ padding: "16px" }}>Total Fee</th>
                    <th style={{ padding: "16px" }}>Paid Amount</th>
                    <th style={{ padding: "16px" }}>Balance</th>
                    <th style={{ padding: "16px" }}>Status</th>
                    <th style={{ padding: "16px", textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((std) => {
                    const balance = std.totalFee - std.paidFee;
                    return (
                      <tr key={std.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                        <td style={{ padding: "16px", fontWeight: 600 }}>
                          <div>{std.name}</div>
                          <div style={{ fontSize: "0.75rem", color: "var(--text-dim)" }}>{std.phone}</div>
                        </td>
                        <td style={{ padding: "16px" }}>
                          <div>{std.course}</div>
                          <div style={{ fontSize: "0.75rem", color: "#38bdf8" }}>{std.batchCode}</div>
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
                          {balance > 0 ? (
                            <button
                              onClick={() => {
                                setSelectedStudentForFee(std);
                                setShowFeeModal(true);
                              }}
                              className="btn-primary"
                              style={{ padding: "6px 14px", fontSize: "0.8rem" }}
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
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 4. EXAMINATION SYSTEM TAB (ROTATIONAL RBAC LIFECYCLE) */}
        {activeTab === "exams" && (
          <div>
            {/* Header & Filter Controls */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px", flexWrap: "wrap", gap: "16px" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <h2 style={{ fontSize: "1.4rem", fontWeight: 800 }}>
                    {isAdmin ? "Institutional Examination Control (Lifecycle)" : isTeacher ? "My Question Papers & Authoring Studio" : "Upcoming Scheduled Examinations"}
                  </h2>
                  <span style={{
                    fontSize: "0.75rem",
                    padding: "3px 8px",
                    borderRadius: "6px",
                    background: "rgba(99, 102, 241, 0.18)",
                    color: "#818cf8",
                    border: "1px solid rgba(99,102,241,0.3)",
                    fontWeight: 700
                  }}>
                    Rotational Workflow Active
                  </span>
                </div>
                <p style={{ color: "var(--text-muted)", fontSize: "0.88rem", marginTop: "4px" }}>
                  {isAdmin 
                    ? "Admin schedules exams and delegates question paper formulation to assigned teachers. Question approval is locked until teacher submits."
                    : isTeacher 
                    ? "Formulate questions for your assigned batches. Once you submit the paper, editing access is disabled while under Admin review."
                    : "Official timetable and instructions for your semester assessments"}
                </p>
              </div>

              {isAdmin && (
                <button
                  onClick={() => setShowScheduleExamModal(true)}
                  className="btn-primary"
                  style={{ fontSize: "0.88rem", background: "linear-gradient(135deg, #0ea5e9, #0284c7)" }}
                >
                  <Plus size={16} />
                  <span>Schedule New Examination</span>
                </button>
              )}
            </div>

            {/* Lifecycle Informational Banner explaining the exact rotation */}
            <div style={{
              background: "rgba(15, 23, 42, 0.6)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              borderRadius: "14px",
              padding: "16px 20px",
              marginBottom: "24px",
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: "16px"
            }}>
              <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "rgba(234, 179, 8, 0.2)", color: "#eab308", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: "0.85rem" }}>
                  1
                </div>
                <div>
                  <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#eab308" }}>Admin Schedules Exam</div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "2px" }}>
                    Assigned to Teacher. Admin question access is <strong>LOCKED</strong> until teacher submission.
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "rgba(56, 189, 248, 0.2)", color: "#38bdf8", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: "0.85rem" }}>
                  2
                </div>
                <div>
                  <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#38bdf8" }}>Teacher Authors & Submits</div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "2px" }}>
                    Teacher authors paper. Upon clicking Submit, Teacher editing is <strong>DISABLED</strong>.
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "rgba(34, 197, 94, 0.2)", color: "#22c55e", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: "0.85rem" }}>
                  3
                </div>
                <div>
                  <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#22c55e" }}>Admin Review & Publishing</div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "2px" }}>
                    Admin reviews questions. Can either <strong>Approve & Publish</strong> or <strong>Return for Revision</strong>.
                  </div>
                </div>
              </div>
            </div>

            {/* Filter Pills */}
            <div style={{ display: "flex", gap: "8px", marginBottom: "20px", flexWrap: "wrap" }}>
              {[
                { id: "all", label: "All Examinations", count: (isTeacher ? exams.filter(e => e.assignedTeacherId === currentUser?.uid || e.assignedTeacherName === currentUser?.name) : exams).length },
                { id: EXAM_STATUS.PENDING_TEACHER, label: "Awaiting Teacher Authoring", count: (isTeacher ? exams.filter(e => (e.assignedTeacherId === currentUser?.uid || e.assignedTeacherName === currentUser?.name) && e.status === EXAM_STATUS.PENDING_TEACHER) : exams.filter(e => e.status === EXAM_STATUS.PENDING_TEACHER)).length },
                { id: EXAM_STATUS.PENDING_ADMIN, label: "Pending Admin Approval", count: (isTeacher ? exams.filter(e => (e.assignedTeacherId === currentUser?.uid || e.assignedTeacherName === currentUser?.name) && e.status === EXAM_STATUS.PENDING_ADMIN) : exams.filter(e => e.status === EXAM_STATUS.PENDING_ADMIN)).length },
                { id: EXAM_STATUS.REVISION, label: "Revision Requested", count: (isTeacher ? exams.filter(e => (e.assignedTeacherId === currentUser?.uid || e.assignedTeacherName === currentUser?.name) && e.status === EXAM_STATUS.REVISION) : exams.filter(e => e.status === EXAM_STATUS.REVISION)).length },
                { id: EXAM_STATUS.APPROVED, label: "Approved & Published", count: (isTeacher ? exams.filter(e => (e.assignedTeacherId === currentUser?.uid || e.assignedTeacherName === currentUser?.name) && e.status === EXAM_STATUS.APPROVED) : exams.filter(e => e.status === EXAM_STATUS.APPROVED)).length }
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setExamFilter(f.id)}
                  style={{
                    padding: "6px 14px",
                    borderRadius: "8px",
                    border: "1px solid",
                    borderColor: examFilter === f.id ? "#6366f1" : "rgba(255,255,255,0.08)",
                    background: examFilter === f.id ? "rgba(99, 102, 241, 0.2)" : "rgba(255,255,255,0.03)",
                    color: examFilter === f.id ? "#ffffff" : "var(--text-muted)",
                    fontSize: "0.82rem",
                    fontWeight: 600,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px"
                  }}
                >
                  <span>{f.label}</span>
                  <span style={{ fontSize: "0.72rem", opacity: 0.7 }}>({f.count})</span>
                </button>
              ))}
            </div>

            {/* Examination Cards Grid */}
            <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
              {filteredExams.length === 0 ? (
                <div className="glass-panel" style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>
                  <FileText size={40} style={{ margin: "0 auto 12px", opacity: 0.4 }} />
                  <div style={{ fontSize: "1.1rem", fontWeight: 700 }}>No examinations found</div>
                  <div style={{ fontSize: "0.85rem", marginTop: "4px" }}>
                    {isTeacher ? "You have no examinations assigned matching this filter." : "Schedule a new examination to initiate the rotation workflow."}
                  </div>
                </div>
              ) : (
                filteredExams.map((exam) => {
                  const statusMeta = EXAM_STATUS_LABELS[exam.status] || { label: exam.status, color: "#94a3b8", bg: "rgba(255,255,255,0.1)" };
                  const currentAllocatedMarks = (exam.questions || []).reduce((acc, q) => acc + (Number(q.marks) || 0), 0);
                  const isTeacherAssigned = isTeacher && (exam.assignedTeacherId === currentUser?.uid || exam.assignedTeacherName === currentUser?.name);

                  return (
                    <div
                      key={exam.id}
                      className="glass-panel"
                      style={{
                        padding: "24px",
                        borderLeft: `4px solid ${statusMeta.color}`,
                        transition: "all 0.2s ease"
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", marginBottom: "14px" }}>
                        <div>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                            <span style={{
                              fontSize: "0.75rem",
                              fontWeight: 800,
                              padding: "3px 10px",
                              borderRadius: "6px",
                              background: statusMeta.bg,
                              color: statusMeta.color,
                              border: `1px solid ${statusMeta.color}40`,
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "6px"
                            }}>
                              {exam.status === EXAM_STATUS.PENDING_TEACHER && <Clock size={12} />}
                              {exam.status === EXAM_STATUS.PENDING_ADMIN && <AlertCircle size={12} />}
                              {exam.status === EXAM_STATUS.REVISION && <RotateCcw size={12} />}
                              {exam.status === EXAM_STATUS.APPROVED && <CheckCircle2 size={12} />}
                              <span>{statusMeta.label}</span>
                            </span>

                            <span className="badge badge-indigo">{exam.batchCode}</span>
                            <span style={{ fontSize: "0.78rem", color: "var(--text-dim)" }}>
                              Target: <strong>{exam.totalMarks} Marks</strong> ({exam.durationMinutes} mins)
                            </span>
                          </div>

                          <h3 style={{ fontSize: "1.2rem", fontWeight: 800, color: "#ffffff" }}>
                            {exam.title}
                          </h3>
                          <div style={{ fontSize: "0.85rem", color: "#38bdf8", marginTop: "2px" }}>
                            {exam.courseTitle}
                          </div>
                        </div>

                        {/* Top Right Meta */}
                        <div style={{ textAlign: "right", fontSize: "0.82rem", color: "var(--text-muted)" }}>
                          <div>Assigned Faculty: <strong style={{ color: "#ffffff" }}>{exam.assignedTeacherName}</strong></div>
                          <div>Exam Date: <strong>{exam.examDate}</strong></div>
                          <div>Questions Drafted: <strong style={{ color: currentAllocatedMarks >= exam.totalMarks ? "#34d399" : "#fbbf24" }}>{exam.questions?.length || 0} ({currentAllocatedMarks}/{exam.totalMarks} pts)</strong></div>
                        </div>
                      </div>

                      {/* ROTATION STATE BANNER: Displays exact permissions & locks */}
                      <div style={{
                        borderRadius: "10px",
                        padding: "12px 16px",
                        marginBottom: "16px",
                        fontSize: "0.85rem",
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        background: 
                          exam.status === EXAM_STATUS.PENDING_TEACHER 
                            ? "rgba(234, 179, 8, 0.08)"
                            : exam.status === EXAM_STATUS.PENDING_ADMIN
                            ? "rgba(56, 189, 248, 0.08)"
                            : exam.status === EXAM_STATUS.REVISION
                            ? "rgba(249, 115, 22, 0.08)"
                            : "rgba(34, 197, 94, 0.08)",
                        border: `1px solid ${statusMeta.color}30`
                      }}>
                        {exam.status === EXAM_STATUS.PENDING_TEACHER && (
                          <>
                            <Lock size={18} color="#eab308" />
                            <div style={{ color: "#fef08a", flex: 1 }}>
                              {isAdmin ? (
                                <span>
                                  <strong>Admin Approval Locked:</strong> Question paper formulation is currently assigned to <strong>{exam.assignedTeacherName}</strong>. Admin access to approve or edit questions remains locked until the instructor submits the paper.
                                </span>
                              ) : isTeacherAssigned ? (
                                <span>
                                  <strong>Teacher Action Required:</strong> You have been assigned to prepare this question paper. Please formulate questions and submit to the Director for approval.
                                </span>
                              ) : (
                                <span>Question paper formulation in progress by teaching faculty.</span>
                              )}
                            </div>
                          </>
                        )}

                        {exam.status === EXAM_STATUS.PENDING_ADMIN && (
                          <>
                            <AlertCircle size={18} color="#38bdf8" />
                            <div style={{ color: "#bae6fd", flex: 1 }}>
                              {isAdmin ? (
                                <span>
                                  <strong>Admin Review Unlocked:</strong> Question paper submitted by <strong>{exam.assignedTeacherName}</strong> on {exam.submittedAt}. Please review the questions, verify syllabus coverage, and approve or request revision.
                                </span>
                              ) : isTeacherAssigned ? (
                                <span>
                                  <strong>Paper Submitted (Locked):</strong> You submitted this paper on {exam.submittedAt}. Question editing is <strong>DISABLED</strong> while awaiting Director approval.
                                </span>
                              ) : (
                                <span>Paper submitted to Executive Director for official approval.</span>
                              )}
                            </div>
                          </>
                        )}

                        {exam.status === EXAM_STATUS.REVISION && (
                          <>
                            <RotateCcw size={18} color="#f97316" />
                            <div style={{ color: "#fdba74", flex: 1 }}>
                              <div>
                                <strong>Revision Requested by Admin:</strong> "{exam.adminFeedback}"
                              </div>
                              <div style={{ fontSize: "0.78rem", marginTop: "2px", opacity: 0.9 }}>
                                {isTeacherAssigned ? "Editing has been re-enabled for you. Please adjust the questions according to Director feedback and re-submit." : "Waiting for teacher to submit revised question paper."}
                              </div>
                            </div>
                          </>
                        )}

                        {exam.status === EXAM_STATUS.APPROVED && (
                          <>
                            <ShieldCheck size={18} color="#22c55e" />
                            <div style={{ color: "#bbf7d0", flex: 1 }}>
                              <strong>Approved & Published:</strong> Officially verified by Director on {exam.approvedAt}. Paper is locked and ready for conduction/printing.
                            </div>
                          </>
                        )}
                      </div>

                      {/* Bottom Action Buttons enforcing strict rotation */}
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "14px", flexWrap: "wrap", gap: "10px" }}>
                        <div style={{ fontSize: "0.8rem", color: "var(--text-dim)" }}>
                          Passing: <strong>{exam.passingMarks} Marks</strong> | Instructions: <em>{exam.instructions?.slice(0, 60)}...</em>
                        </div>

                        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                          {/* ADMIN ACTIONS */}
                          {isAdmin && (
                            <>
                              {exam.status === EXAM_STATUS.PENDING_TEACHER && (
                                <button
                                  disabled
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "6px",
                                    padding: "8px 14px",
                                    borderRadius: "8px",
                                    background: "rgba(255, 255, 255, 0.04)",
                                    border: "1px solid rgba(255, 255, 255, 0.1)",
                                    color: "#64748b",
                                    fontSize: "0.82rem",
                                    cursor: "not-allowed"
                                  }}
                                  title="Admin approval is locked until teacher submits the question paper"
                                >
                                  <Lock size={14} />
                                  <span>Approval Locked (Awaiting Teacher)</span>
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
                                    style={{ padding: "8px 14px", fontSize: "0.82rem", color: "#f97316", borderColor: "rgba(249,115,22,0.4)" }}
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
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "6px",
                                    padding: "8px 14px",
                                    borderRadius: "8px",
                                    background: "rgba(255, 255, 255, 0.04)",
                                    border: "1px solid rgba(255, 255, 255, 0.1)",
                                    color: "#64748b",
                                    fontSize: "0.82rem",
                                    cursor: "not-allowed"
                                  }}
                                >
                                  <RotateCcw size={14} />
                                  <span>Waiting for Revised Submission</span>
                                </button>
                              )}

                              {exam.status === EXAM_STATUS.APPROVED && (
                                <button
                                  onClick={() => setPrintableExam(exam)}
                                  className="btn-secondary"
                                  style={{ padding: "8px 14px", fontSize: "0.82rem", color: "#38bdf8", borderColor: "rgba(56,189,248,0.4)" }}
                                >
                                  <Printer size={14} />
                                  <span>View & Print Official Paper</span>
                                </button>
                              )}
                            </>
                          )}

                          {/* TEACHER ACTIONS */}
                          {isTeacher && isTeacherAssigned && (
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
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "6px",
                                    padding: "8px 14px",
                                    borderRadius: "8px",
                                    background: "rgba(255, 255, 255, 0.04)",
                                    border: "1px solid rgba(255, 255, 255, 0.1)",
                                    color: "#64748b",
                                    fontSize: "0.82rem",
                                    cursor: "not-allowed"
                                  }}
                                  title="Paper submitted to Director. Editing is locked."
                                >
                                  <Lock size={14} />
                                  <span>Editing Disabled (Under Review)</span>
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

                          {/* STUDENT ACTIONS */}
                          {isStudent && (
                            <button
                              onClick={() => setPrintableExam(exam)}
                              className="btn-secondary"
                              style={{ padding: "8px 14px", fontSize: "0.82rem" }}
                            >
                              <Eye size={14} />
                              <span>View Paper Format / Syllabus</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* 5. ATTENDANCE REGISTER TAB (TEACHER & ADMIN) */}
        {activeTab === "attendance" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <div>
                <h2 style={{ fontSize: "1.3rem", fontWeight: 800 }}>
                  {isTeacher ? "Daily Class Attendance Register" : "Campus Attendance Overview"}
                </h2>
                <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
                  Mark present, absent, or late students with one-click timestamp synchronization
                </p>
              </div>

              <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>Date:</span>
                <input
                  type="date"
                  value={attendanceDate}
                  onChange={(e) => setAttendanceDate(e.target.value)}
                  style={{
                    padding: "8px 12px",
                    background: "rgba(0,0,0,0.3)",
                    border: "1px solid var(--border-subtle)",
                    borderRadius: "8px",
                    color: "#ffffff"
                  }}
                />
              </div>
            </div>

            <div className="glass-panel" style={{ padding: "24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <h3 style={{ fontSize: "1.05rem", fontWeight: 700 }}>
                  Batch: Full-Stack Web Development (FSWD-B14)
                </h3>
                <span className="badge badge-indigo">Lab 1 - Evening Slot</span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {students.map((std) => {
                  const currentStatus = attendanceRecords[std.id] || "present";
                  return (
                    <div
                      key={std.id}
                      style={{
                        padding: "14px 18px",
                        background: "rgba(0,0,0,0.25)",
                        border: "1px solid var(--border-subtle)",
                        borderRadius: "10px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center"
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 700, fontSize: "0.95rem" }}>{std.name}</div>
                        <div style={{ fontSize: "0.78rem", color: "var(--text-dim)" }}>
                          Roll ID: {std.id.toUpperCase()} | Overall Attendance: {std.attendance}%
                        </div>
                      </div>

                      {/* Status Toggle Buttons */}
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button
                          onClick={() => setAttendanceRecords({ ...attendanceRecords, [std.id]: "present" })}
                          style={{
                            padding: "6px 14px",
                            borderRadius: "8px",
                            border: "none",
                            background: currentStatus === "present" ? "#10b981" : "rgba(255,255,255,0.05)",
                            color: currentStatus === "present" ? "#ffffff" : "var(--text-muted)",
                            fontWeight: 700,
                            fontSize: "0.8rem",
                            cursor: "pointer"
                          }}
                        >
                          Present
                        </button>

                        <button
                          onClick={() => setAttendanceRecords({ ...attendanceRecords, [std.id]: "absent" })}
                          style={{
                            padding: "6px 14px",
                            borderRadius: "8px",
                            border: "none",
                            background: currentStatus === "absent" ? "#ef4444" : "rgba(255,255,255,0.05)",
                            color: currentStatus === "absent" ? "#ffffff" : "var(--text-muted)",
                            fontWeight: 700,
                            fontSize: "0.8rem",
                            cursor: "pointer"
                          }}
                        >
                          Absent
                        </button>

                        <button
                          onClick={() => setAttendanceRecords({ ...attendanceRecords, [std.id]: "late" })}
                          style={{
                            padding: "6px 14px",
                            borderRadius: "8px",
                            border: "none",
                            background: currentStatus === "late" ? "#f59e0b" : "rgba(255,255,255,0.05)",
                            color: currentStatus === "late" ? "#ffffff" : "var(--text-muted)",
                            fontWeight: 700,
                            fontSize: "0.8rem",
                            cursor: "pointer"
                          }}
                        >
                          Late
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div style={{ marginTop: "20px", display: "flex", justifyContent: "flex-end" }}>
                <button
                  onClick={() => alert("Attendance register saved and locked for this date.")}
                  className="btn-primary"
                  style={{ padding: "10px 20px" }}
                >
                  <CheckSquare size={16} />
                  <span>Save & Sync Attendance</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 6. DIGITAL CERTIFICATE GENERATOR TAB (ADMIN ONLY) */}
        {activeTab === "certificates" && isAdmin && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <div>
                <h2 style={{ fontSize: "1.3rem", fontWeight: 800 }}>Digital Certificate Issuance & Verification</h2>
                <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
                  Issue cryptographically signed completion certificates with verifiable serial IDs
                </p>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "28px" }}>
              {/* Form */}
              <div className="glass-panel" style={{ padding: "24px" }}>
                <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "16px" }}>Issue Certificate</h3>
                <form onSubmit={handleIssueCertificate}>
                  <div style={{ marginBottom: "14px" }}>
                    <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "6px" }}>Student Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ali Hassan"
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
                      <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "6px" }}>Grade / Division</label>
                      <input
                        type="text"
                        value={certForm.grade}
                        onChange={(e) => setCertForm({ ...certForm, grade: e.target.value })}
                        style={{ width: "100%", padding: "10px", background: "rgba(0,0,0,0.3)", border: "1px solid var(--border-subtle)", borderRadius: "8px", color: "#ffffff" }}
                      />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "6px" }}>Trainer / Instructor</label>
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

              {/* Preview */}
              <div>
                <div className="glass-panel" style={{ padding: "28px", border: "2px solid #eab308", background: "#0a0e1a", position: "relative", minHeight: "360px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: "0.8rem", color: "#eab308", textTransform: "uppercase", letterSpacing: "0.15em", fontWeight: 800 }}>
                      Certificate of Achievement
                    </div>
                    <div style={{ fontSize: "1.4rem", fontWeight: 900, marginTop: "6px" }}>
                      APEX EDUCATION FORUM
                    </div>
                    <div style={{ fontSize: "0.78rem", color: "var(--text-dim)" }}>
                      Registered Higher Vocational & Technical Institute
                    </div>
                  </div>

                  <div style={{ textAlign: "center", margin: "24px 0" }}>
                    <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>This is proudly presented to</div>
                    <div style={{ fontSize: "1.6rem", fontWeight: 800, color: "#ffffff", margin: "6px 0", borderBottom: "1px solid rgba(255,255,255,0.1)", display: "inline-block", paddingBottom: "4px" }}>
                      {certForm.studentName || "Candidate Name"}
                    </div>
                    <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "8px" }}>
                      for successfully completing the advanced diploma in
                    </div>
                    <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "#38bdf8", marginTop: "4px" }}>
                      {certForm.courseTitle}
                    </div>
                    <div style={{ fontSize: "0.82rem", color: "#34d399", marginTop: "4px", fontWeight: 600 }}>
                      Awarded: {certForm.grade}
                    </div>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "14px", fontSize: "0.75rem", color: "var(--text-dim)" }}>
                    <div>
                      <div>Instructor: {certForm.instructorName}</div>
                      <div>Apex Faculty Board</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ color: "#eab308", fontWeight: 700 }}>
                        {issuedCert ? issuedCert.certificateId : "APEX-CERT-PREVIEW"}
                      </div>
                      <div>Verified Authentic</div>
                    </div>
                  </div>
                </div>

                {issuedCert && (
                  <div style={{ marginTop: "16px", display: "flex", justifyContent: "flex-end", gap: "10px" }}>
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

      </div>

      {/* --- MODALS --- */}

      {/* 1. Modal: Admin Schedules Exam */}
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
              <strong>Lifecycle Notice:</strong> Scheduling this exam assigns it to the selected faculty member. Admin approval access is locked until the teacher prepares and submits the question paper.
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
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "6px" }}>Course Program</label>
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
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "6px" }}>Target Batch Code</label>
                  <select
                    value={newExamForm.batchCode}
                    onChange={(e) => setNewExamForm({ ...newExamForm, batchCode: e.target.value })}
                    style={{ width: "100%", padding: "10px", background: "#090d16", border: "1px solid var(--border-subtle)", borderRadius: "8px", color: "#ffffff" }}
                  >
                    {batches.map(b => (
                      <option key={b.id} value={b.batchCode}>{b.batchCode} - {b.courseTitle}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: "14px" }}>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "6px" }}>Assign Question Authoring to Faculty *</label>
                <select
                  value={newExamForm.assignedTeacherId}
                  onChange={(e) => setNewExamForm({ ...newExamForm, assignedTeacherId: e.target.value })}
                  style={{ width: "100%", padding: "10px", background: "#090d16", border: "1px solid var(--border-subtle)", borderRadius: "8px", color: "#ffffff" }}
                >
                  {DEMO_USERS.filter(u => u.role === ROLES.INSTRUCTOR).map(inst => (
                    <option key={inst.uid} value={inst.uid}>{inst.name} ({inst.title})</option>
                  ))}
                </select>
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
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "6px" }}>Candidate Instructions</label>
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

      {/* 2. Modal: Teacher Question Authoring Studio */}
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
          <div className="glass-panel" style={{ maxWidth: "880px", width: "100%", maxHeight: "90vh", overflowY: "auto", padding: "28px", borderRadius: "var(--radius-lg)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "18px", borderBottom: "1px solid rgba(255,255,255,0.08)", paddingBottom: "14px" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span className="badge badge-emerald">Teacher Question Studio</span>
                  <span className="badge badge-indigo">{authoringExam.batchCode}</span>
                </div>
                <h3 style={{ fontSize: "1.3rem", fontWeight: 800, color: "#ffffff", marginTop: "4px" }}>
                  {authoringExam.title}
                </h3>
              </div>

              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>Target Marks: <strong>{authoringExam.totalMarks} pts</strong></div>
                <div style={{ fontSize: "0.95rem", fontWeight: 800, color: authoringQuestions.reduce((a,q) => a + Number(q.marks), 0) >= authoringExam.totalMarks ? "#34d399" : "#fbbf24" }}>
                  Allocated: {authoringQuestions.reduce((a,q) => a + Number(q.marks), 0)} / {authoringExam.totalMarks} pts
                </div>
              </div>
            </div>

            {/* Authoring Form */}
            <div style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", padding: "18px", marginBottom: "20px" }}>
              <h4 style={{ fontSize: "0.95rem", fontWeight: 700, marginBottom: "12px", display: "flex", alignItems: "center", gap: "6px" }}>
                <Plus size={16} color="#38bdf8" />
                <span>Add New Question to Paper</span>
              </h4>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 120px", gap: "12px", marginBottom: "12px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, marginBottom: "4px" }}>Question Type</label>
                  <div style={{ display: "flex", gap: "8px" }}>
                    {[
                      { id: "mcq", label: "Multiple Choice (MCQ)" },
                      { id: "short", label: "Short / Descriptive" },
                      { id: "code", label: "Coding / Practical" }
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
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, marginBottom: "4px" }}>Marks</label>
                  <input
                    type="number"
                    value={newQuestionMarks}
                    onChange={(e) => setNewQuestionMarks(e.target.value)}
                    style={{ width: "100%", padding: "8px", background: "#090d16", border: "1px solid var(--border-subtle)", borderRadius: "6px", color: "#ffffff" }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: "12px" }}>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, marginBottom: "4px" }}>Question Text / Problem Statement</label>
                <textarea
                  rows={2}
                  placeholder="Enter the question statement clearly..."
                  value={newQuestionText}
                  onChange={(e) => setNewQuestionText(e.target.value)}
                  style={{ width: "100%", padding: "10px", background: "#090d16", border: "1px solid var(--border-subtle)", borderRadius: "6px", color: "#ffffff" }}
                />
              </div>

              {/* MCQ Options input */}
              {newQuestionType === "mcq" && (
                <div style={{ marginBottom: "14px" }}>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, marginBottom: "6px" }}>
                    Options (Select the correct answer choice):
                  </label>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                    {newMcqOptions.map((opt, idx) => (
                      <div key={idx} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <input
                          type="radio"
                          name="correctOptionRadio"
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
                </div>
              )}

              <button
                type="button"
                onClick={handleAddQuestion}
                className="btn-secondary"
                style={{ padding: "8px 16px", fontSize: "0.82rem", background: "rgba(56, 189, 248, 0.15)", color: "#38bdf8", borderColor: "#38bdf8" }}
              >
                <Plus size={14} />
                <span>Add Question to List</span>
              </button>
            </div>

            {/* Questions List */}
            <div style={{ marginBottom: "20px" }}>
              <h4 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "12px" }}>
                Current Questions in Paper ({authoringQuestions.length})
              </h4>

              {authoringQuestions.length === 0 ? (
                <div style={{ padding: "20px", textAlign: "center", color: "var(--text-muted)", background: "rgba(0,0,0,0.2)", borderRadius: "8px" }}>
                  No questions added yet. Formulate questions using the form above.
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {authoringQuestions.map((q, idx) => (
                    <div
                      key={q.id}
                      style={{
                        padding: "14px",
                        background: "rgba(0,0,0,0.25)",
                        border: "1px solid rgba(255,255,255,0.06)",
                        borderRadius: "8px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        gap: "12px"
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                          <span style={{ fontWeight: 800, color: "#38bdf8" }}>Q{idx + 1}.</span>
                          <span className="badge badge-indigo" style={{ fontSize: "0.7rem" }}>{q.type.toUpperCase()}</span>
                          <span style={{ fontSize: "0.75rem", color: "#34d399", fontWeight: 700 }}>[{q.marks} Marks]</span>
                        </div>
                        <div style={{ fontSize: "0.9rem", color: "#ffffff" }}>{q.questionText}</div>

                        {q.type === "mcq" && q.options && (
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px", marginTop: "8px", fontSize: "0.8rem" }}>
                            {q.options.map((opt, oIdx) => (
                              <div
                                key={oIdx}
                                style={{
                                  padding: "4px 8px",
                                  borderRadius: "4px",
                                  background: q.correctOption === oIdx ? "rgba(16,185,129,0.15)" : "rgba(255,255,255,0.03)",
                                  color: q.correctOption === oIdx ? "#34d399" : "var(--text-muted)",
                                  fontWeight: q.correctOption === oIdx ? 700 : 400
                                }}
                              >
                                {String.fromCharCode(65 + oIdx)}. {opt} {q.correctOption === oIdx ? "✓ (Correct)" : ""}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() => handleDeleteQuestion(q.id)}
                        style={{ background: "transparent", border: "none", color: "#f87171", cursor: "pointer", padding: "4px" }}
                        title="Delete Question"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer Submission Action */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: "16px" }}>
              <button
                type="button"
                onClick={() => setAuthoringExam(null)}
                className="btn-secondary"
              >
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

      {/* 3. Modal: Admin Question Paper Review & Approval */}
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
                <span className="badge badge-cyan">Executive Director Review</span>
                <h3 style={{ fontSize: "1.3rem", fontWeight: 800, color: "#ffffff", marginTop: "4px" }}>
                  {reviewExam.title}
                </h3>
                <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "2px" }}>
                  Submitted by: <strong>{reviewExam.assignedTeacherName}</strong> on {reviewExam.submittedAt}
                </div>
              </div>

              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: "0.8rem", color: "var(--text-dim)" }}>Total Target: {reviewExam.totalMarks} Marks</div>
                <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "#34d399" }}>
                  Allocated: {(reviewExam.questions || []).reduce((a,q) => a + Number(q.marks), 0)} Marks
                </div>
              </div>
            </div>

            {/* Questions to review */}
            <div style={{ marginBottom: "20px" }}>
              <h4 style={{ fontSize: "0.95rem", fontWeight: 700, marginBottom: "12px" }}>
                Submitted Questions ({reviewExam.questions?.length || 0})
              </h4>

              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {(reviewExam.questions || []).map((q, idx) => (
                  <div key={q.id} style={{ padding: "14px", background: "rgba(0,0,0,0.3)", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.06)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                      <span style={{ fontWeight: 800, color: "#38bdf8" }}>Q{idx + 1}.</span>
                      <span className="badge badge-indigo" style={{ fontSize: "0.7rem" }}>{q.type.toUpperCase()}</span>
                      <span style={{ fontSize: "0.75rem", color: "#34d399", fontWeight: 700 }}>[{q.marks} Marks]</span>
                    </div>
                    <div style={{ fontSize: "0.92rem", color: "#ffffff" }}>{q.questionText}</div>

                    {q.type === "mcq" && q.options && (
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px", marginTop: "8px", fontSize: "0.8rem" }}>
                        {q.options.map((opt, oIdx) => (
                          <div
                            key={oIdx}
                            style={{
                              padding: "4px 8px",
                              borderRadius: "4px",
                              background: q.correctOption === oIdx ? "rgba(16,185,129,0.15)" : "rgba(255,255,255,0.03)",
                              color: q.correctOption === oIdx ? "#34d399" : "var(--text-muted)",
                              fontWeight: q.correctOption === oIdx ? 700 : 400
                            }}
                          >
                            {String.fromCharCode(65 + oIdx)}. {opt} {q.correctOption === oIdx ? "✓ (Marked Answer)" : ""}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Verification Sign-Off Note */}
            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "6px" }}>
                Director Approval Remarks / Watermark Endorsement (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Verified by Executive Director. High quality questions matching curriculum standards."
                value={adminApprovalNote}
                onChange={(e) => setAdminApprovalNote(e.target.value)}
                style={{ width: "100%", padding: "10px", background: "rgba(0,0,0,0.3)", border: "1px solid var(--border-subtle)", borderRadius: "8px", color: "#ffffff" }}
              />
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: "16px" }}>
              <button
                type="button"
                onClick={() => setReviewExam(null)}
                className="btn-secondary"
              >
                Close
              </button>

              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  type="button"
                  onClick={() => {
                    const examToRevise = reviewExam;
                    setReviewExam(null);
                    setRevisionModalExam(examToRevise);
                  }}
                  className="btn-secondary"
                  style={{ color: "#f97316", borderColor: "rgba(249,115,22,0.4)" }}
                >
                  <RotateCcw size={15} />
                  <span>Request Revisions</span>
                </button>

                <button
                  type="button"
                  onClick={handleAdminApproveExam}
                  className="btn-primary"
                  style={{ background: "linear-gradient(135deg, #10b981, #059669)", display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <CheckCircle2 size={16} />
                  <span>Approve & Officially Publish Exam</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. Modal: Admin Request Revision Notes */}
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
          <div className="glass-panel" style={{ maxWidth: "520px", width: "100%", padding: "28px", borderRadius: "var(--radius-lg)" }}>
            <h3 style={{ fontSize: "1.2rem", fontWeight: 800, color: "#f97316", marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
              <RotateCcw size={18} />
              <span>Return Paper for Teacher Revision</span>
            </h3>

            <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "16px" }}>
              Returning this paper will unlock question editing for <strong>{revisionModalExam.assignedTeacherName}</strong> with your feedback notes.
            </p>

            <div style={{ marginBottom: "18px" }}>
              <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "6px" }}>
                Director Revision Feedback *
              </label>
              <textarea
                rows={4}
                required
                placeholder="e.g. Please add 1 more practical coding question for async/await and ensure total marks equal 50."
                value={revisionFeedbackText}
                onChange={(e) => setRevisionFeedbackText(e.target.value)}
                style={{ width: "100%", padding: "10px", background: "rgba(0,0,0,0.3)", border: "1px solid var(--border-subtle)", borderRadius: "8px", color: "#ffffff" }}
              />
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
              <button type="button" onClick={() => setRevisionModalExam(null)} className="btn-secondary">Cancel</button>
              <button
                type="button"
                onClick={handleAdminSubmitRevision}
                className="btn-primary"
                style={{ background: "#f97316", border: "none" }}
              >
                Send Revision to Teacher
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. Modal: Official Formatted Question Paper (Printable) */}
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
            {/* Action Bar */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", borderBottom: "2px solid #e2e8f0", paddingBottom: "14px" }}>
              <span style={{ fontSize: "0.82rem", color: "#64748b", fontWeight: 700 }}>
                APEX EXAMINATION BOARD - CONFIDENTIAL QUESTION PAPER
              </span>

              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  onClick={() => window.print()}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "8px 16px",
                    borderRadius: "8px",
                    background: "#4f46e5",
                    color: "#fff",
                    border: "none",
                    fontWeight: 700,
                    cursor: "pointer"
                  }}
                >
                  <Printer size={16} />
                  <span>Print Paper</span>
                </button>

                <button
                  onClick={() => setPrintableExam(null)}
                  style={{
                    padding: "8px 14px",
                    borderRadius: "8px",
                    background: "#f1f5f9",
                    color: "#475569",
                    border: "1px solid #cbd5e1",
                    fontWeight: 600,
                    cursor: "pointer"
                  }}
                >
                  Close
                </button>
              </div>
            </div>

            {/* Official Header */}
            <div style={{ textAlign: "center", borderBottom: "2px double #0f172a", paddingBottom: "16px", marginBottom: "20px" }}>
              <div style={{ fontSize: "1.4rem", fontWeight: 900, letterSpacing: "-0.01em", textTransform: "uppercase" }}>
                Apex Education Forum
              </div>
              <div style={{ fontSize: "0.85rem", color: "#475569", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Center for Advanced Vocational IT & Language Studies
              </div>
              <div style={{ fontSize: "1.15rem", fontWeight: 800, marginTop: "8px", color: "#1e293b" }}>
                {printableExam.title}
              </div>
            </div>

            {/* Exam Metadata Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", fontSize: "0.88rem", marginBottom: "18px", borderBottom: "1px solid #e2e8f0", paddingBottom: "14px" }}>
              <div><strong>Course:</strong> {printableExam.courseTitle}</div>
              <div style={{ textAlign: "right" }}><strong>Batch:</strong> {printableExam.batchCode}</div>
              <div><strong>Date of Exam:</strong> {printableExam.examDate}</div>
              <div style={{ textAlign: "right" }}><strong>Duration:</strong> {printableExam.durationMinutes} Minutes</div>
              <div><strong>Faculty Examiner:</strong> {printableExam.assignedTeacherName}</div>
              <div style={{ textAlign: "right" }}><strong>Max Marks:</strong> {printableExam.totalMarks} (Passing: {printableExam.passingMarks})</div>
            </div>

            {/* Candidate Instructions */}
            <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "8px", padding: "12px", marginBottom: "24px", fontSize: "0.82rem", color: "#334155" }}>
              <strong>GENERAL INSTRUCTIONS TO CANDIDATES:</strong>
              <div style={{ marginTop: "4px" }}>
                1. {printableExam.instructions || "All questions are compulsory."}
              </div>
              <div>
                2. Write your Roll Number and Batch Code clearly on the title page of your answer booklet.
              </div>
              <div>
                3. Programmable electronic devices and unauthorized communication items are strictly forbidden.
              </div>
            </div>

            {/* Questions Formatted */}
            <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
              {(printableExam.questions || []).map((q, idx) => (
                <div key={q.id} style={{ borderBottom: "1px dotted #cbd5e1", paddingBottom: "14px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "6px" }}>
                    <span style={{ fontWeight: 800, fontSize: "0.95rem" }}>
                      Q{idx + 1}. {q.questionText}
                    </span>
                    <span style={{ fontWeight: 800, fontSize: "0.85rem", color: "#475569" }}>
                      [{q.marks} Marks]
                    </span>
                  </div>

                  {q.type === "mcq" && q.options && (
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginTop: "8px", paddingLeft: "16px", fontSize: "0.88rem" }}>
                      {q.options.map((opt, oIdx) => (
                        <div key={oIdx}>
                          ({String.fromCharCode(97 + oIdx)}) {opt}
                        </div>
                      ))}
                    </div>
                  )}

                  {q.type === "code" && (
                    <div style={{ marginTop: "8px", padding: "10px", background: "#f1f5f9", borderRadius: "6px", fontFamily: "monospace", fontSize: "0.82rem", color: "#334155" }}>
                      // Provide code implementation or pseudocode below
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* End of paper */}
            <div style={{ textAlign: "center", marginTop: "32px", fontSize: "0.8rem", color: "#94a3b8", fontWeight: 700, letterSpacing: "0.1em" }}>
              --- END OF EXAMINATION QUESTION PAPER ---
            </div>
          </div>
        </div>
      )}

      {/* Modal: Schedule New Batch */}
      {showBatchModal && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0,0,0,0.8)",
          backdropFilter: "blur(6px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px",
          zIndex: 9999
        }}>
          <div className="glass-panel" style={{ maxWidth: "540px", width: "100%", padding: "28px", borderRadius: "var(--radius-lg)" }}>
            <h3 style={{ fontSize: "1.25rem", fontWeight: 800, marginBottom: "16px" }}>Schedule New Batch</h3>
            <form onSubmit={handleCreateBatch}>
              <div style={{ marginBottom: "14px" }}>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "6px" }}>Course Program</label>
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

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "14px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "6px" }}>Batch Code</label>
                  <input
                    type="text"
                    placeholder="e.g. FSWD-B15"
                    value={newBatch.batchCode}
                    onChange={(e) => setNewBatch({ ...newBatch, batchCode: e.target.value })}
                    style={{ width: "100%", padding: "10px", background: "rgba(0,0,0,0.3)", border: "1px solid var(--border-subtle)", borderRadius: "8px", color: "#ffffff" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "6px" }}>Capacity (Seats)</label>
                  <input
                    type="number"
                    value={newBatch.capacity}
                    onChange={(e) => setNewBatch({ ...newBatch, capacity: e.target.value })}
                    style={{ width: "100%", padding: "10px", background: "rgba(0,0,0,0.3)", border: "1px solid var(--border-subtle)", borderRadius: "8px", color: "#ffffff" }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "14px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "6px" }}>Timetable Slot</label>
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
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "6px" }}>Start Date</label>
                  <input
                    type="date"
                    value={newBatch.startDate}
                    onChange={(e) => setNewBatch({ ...newBatch, startDate: e.target.value })}
                    style={{ width: "100%", padding: "10px", background: "rgba(0,0,0,0.3)", border: "1px solid var(--border-subtle)", borderRadius: "8px", color: "#ffffff" }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "20px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "6px" }}>Assigned Lab / Hall</label>
                  <select
                    value={newBatch.lab}
                    onChange={(e) => setNewBatch({ ...newBatch, lab: e.target.value })}
                    style={{ width: "100%", padding: "10px", background: "#090d16", border: "1px solid var(--border-subtle)", borderRadius: "8px", color: "#ffffff" }}
                  >
                    <option value="Computer Lab 1">Computer Lab 1</option>
                    <option value="Computer Lab 2">Computer Lab 2</option>
                    <option value="Audio-Visual Language Lab">Audio-Visual Language Lab</option>
                    <option value="Seminar Hall B">Seminar Hall B</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "6px" }}>Trainer</label>
                  <input
                    type="text"
                    value={newBatch.instructor}
                    onChange={(e) => setNewBatch({ ...newBatch, instructor: e.target.value })}
                    style={{ width: "100%", padding: "10px", background: "rgba(0,0,0,0.3)", border: "1px solid var(--border-subtle)", borderRadius: "8px", color: "#ffffff" }}
                  />
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

      {/* Modal: Record Fee Payment */}
      {showFeeModal && selectedStudentForFee && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0,0,0,0.8)",
          backdropFilter: "blur(6px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px",
          zIndex: 9999
        }}>
          <div className="glass-panel" style={{ maxWidth: "480px", width: "100%", padding: "28px", borderRadius: "var(--radius-lg)" }}>
            <h3 style={{ fontSize: "1.2rem", fontWeight: 800, marginBottom: "12px" }}>
              Record Fee Payment
            </h3>

            <div style={{ padding: "12px", background: "rgba(0,0,0,0.25)", borderRadius: "8px", marginBottom: "16px", fontSize: "0.9rem" }}>
              <div>Student: <strong>{selectedStudentForFee.name}</strong></div>
              <div style={{ color: "var(--text-muted)", fontSize: "0.82rem" }}>{selectedStudentForFee.course} ({selectedStudentForFee.batchCode})</div>
              <div style={{ marginTop: "6px", display: "flex", justifyContent: "space-between" }}>
                <span>Remaining Balance:</span>
                <strong style={{ color: "#f87171" }}>
                  PKR {(selectedStudentForFee.totalFee - selectedStudentForFee.paidFee).toLocaleString()}
                </strong>
              </div>
            </div>

            <form onSubmit={handleRecordPayment}>
              <div style={{ marginBottom: "18px" }}>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "6px" }}>
                  Payment Amount (PKR) *
                </label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 10000"
                  value={feePaymentAmount}
                  onChange={(e) => setFeePaymentAmount(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px",
                    background: "rgba(0,0,0,0.3)",
                    border: "1px solid var(--border-subtle)",
                    borderRadius: "8px",
                    color: "#ffffff",
                    fontSize: "1.1rem",
                    fontWeight: 700
                  }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                <button type="button" onClick={() => setShowFeeModal(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary">Generate Receipt & Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: View & Print Official Fee Receipt */}
      {receiptToPrint && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0,0,0,0.85)",
          backdropFilter: "blur(6px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px",
          zIndex: 9999
        }}>
          <div className="glass-panel" style={{ maxWidth: "520px", width: "100%", padding: "32px", borderRadius: "var(--radius-lg)", background: "#0a0f1d", border: "1px solid rgba(255,255,255,0.15)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "16px", marginBottom: "16px" }}>
              <div>
                <div style={{ fontSize: "1.1rem", fontWeight: 900, color: "#ffffff" }}>APEX EDUCATION FORUM</div>
                <div style={{ fontSize: "0.72rem", color: "#38bdf8", textTransform: "uppercase" }}>Official Fee Receipt</div>
              </div>
              <div style={{ textAlign: "right", fontSize: "0.78rem", color: "var(--text-dim)" }}>
                <div>Receipt: {receiptToPrint.receiptNo}</div>
                <div>Date: {receiptToPrint.date}</div>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "0.9rem", marginBottom: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--text-dim)" }}>Received From:</span>
                <strong>{receiptToPrint.studentName}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--text-dim)" }}>Course Program:</span>
                <span>{receiptToPrint.course}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--text-dim)" }}>Batch Code:</span>
                <span>{receiptToPrint.batchCode}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: "10px", fontSize: "1.1rem" }}>
                <span style={{ fontWeight: 700 }}>Amount Received:</span>
                <strong style={{ color: "#34d399" }}>PKR {receiptToPrint.amountPaid.toLocaleString()}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-dim)", fontSize: "0.85rem" }}>
                <span>Remaining Balance:</span>
                <span>PKR {receiptToPrint.remainingBalance.toLocaleString()}</span>
              </div>
            </div>

            <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: "14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontSize: "0.75rem", color: "#10b981", display: "flex", alignItems: "center", gap: "6px" }}>
                <CheckCircle2 size={16} />
                <span>Verified by Apex Accounts</span>
              </div>
              <div style={{ display: "flex", gap: "8px" }}>
                <button onClick={() => window.print()} className="btn-secondary" style={{ padding: "8px 14px", fontSize: "0.85rem" }}>
                  <Printer size={15} />
                  <span>Print Receipt</span>
                </button>
                <button onClick={() => setReceiptToPrint(null)} className="btn-primary" style={{ padding: "8px 16px", fontSize: "0.85rem" }}>
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
