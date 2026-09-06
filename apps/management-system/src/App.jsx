import React, { useState, useEffect } from "react";
import EcosystemNav from "@shared/EcosystemNav.jsx";
import { getCurrentUser, subscribeToAuth } from "@shared/auth.js";
import { 
  getCourses, 
  getBatches, 
  createBatch, 
  getInquiries, 
  updateInquiryStatus, 
  issueCertificate 
} from "@shared/dataStore.js";
import { DEMO_USERS, SEED_CERTIFICATES } from "@shared/seedData.js";
import { BATCH_SLOTS, FEE_STATUS, ROLES } from "@shared/constants.js";
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
  FileText
} from "lucide-react";

export default function App() {
  const [currentUser, setCurrentUser] = useState(getCurrentUser());
  const [activeTab, setActiveTab] = useState("overview");

  // State
  const [courses] = useState(getCourses());
  const [batches, setBatches] = useState(getBatches());
  const [inquiries, setInquiries] = useState(getInquiries());
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

  // Modals
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

  useEffect(() => {
    const unsub = subscribeToAuth(u => setCurrentUser(u));
    return unsub;
  }, []);

  // Listen to inquiries changes
  useEffect(() => {
    const handleInqChange = () => setInquiries(getInquiries());
    window.addEventListener("apex_inquiries_changed", handleInqChange);
    return () => window.removeEventListener("apex_inquiries_changed", handleInqChange);
  }, []);

  const handleApproveInquiry = (inq) => {
    updateInquiryStatus(inq.id, "approved");
    // Also add to student list
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
    const created = createBatch({
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
    
    // Setup Receipt
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

  const totalFeeCollected = students.reduce((acc, s) => acc + s.paidFee, 0);
  const totalFeeExpected = students.reduce((acc, s) => acc + s.totalFee, 0);

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--bg-dark)", color: "var(--text-main)" }}>
      {/* Ecosystem Global Navigation */}
      <EcosystemNav currentApp="management" />

      {/* Main Container */}
      <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "30px 24px" }}>
        
        {/* Top Management Bar */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "28px", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <h1 style={{ fontSize: "1.8rem", fontWeight: 800, letterSpacing: "-0.02em" }}>
              Apex Management & LMS Portal
            </h1>
            <p style={{ color: "var(--text-muted)", fontSize: "0.92rem", marginTop: "4px" }}>
              Logged in as <strong style={{ color: "#38bdf8" }}>{currentUser.name}</strong> ({currentUser.role.toUpperCase()})
            </p>
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            <button
              onClick={() => setShowBatchModal(true)}
              className="btn-primary"
              style={{ fontSize: "0.9rem" }}
            >
              <Plus size={16} />
              <span>Schedule New Batch</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
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
          {[
            { id: "overview", label: "Executive Overview", icon: LayoutDashboard },
            { id: "batches", label: "Batches & Timetables", icon: Calendar },
            { id: "fees", label: "Admissions & Fee Tracking", icon: DollarSign },
            { id: "attendance", label: "Batch Attendance Register", icon: CheckSquare },
            { id: "certificates", label: "Digital Certificate Generator", icon: Award }
          ].map((tab) => {
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
              </button>
            );
          })}
        </div>

        {/* 1. EXECUTIVE OVERVIEW TAB */}
        {activeTab === "overview" && (
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
                  <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600 }}>Website Inquiries</span>
                  <AlertCircle size={20} color="#f59e0b" />
                </div>
                <div style={{ fontSize: "2.2rem", fontWeight: 800, color: "#ffffff" }}>{inquiries.length}</div>
                <div style={{ fontSize: "0.78rem", color: "#fbbf24", marginTop: "4px" }}>Direct from admissions form</div>
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
              <h2 style={{ fontSize: "1.3rem", fontWeight: 800 }}>All Batch Schedules & Lab Assignments</h2>
              <button onClick={() => setShowBatchModal(true)} className="btn-primary">
                <Plus size={16} />
                <span>New Batch</span>
              </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "20px" }}>
              {batches.map((batch) => (
                <div key={batch.id} className="glass-panel" style={{ padding: "22px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                    <span className="badge badge-indigo">{batch.batchCode}</span>
                    <span className="badge badge-emerald">{batch.status}</span>
                  </div>

                  <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "8px", color: "#ffffff" }}>
                    {batch.courseTitle}
                  </h3>

                  <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "14px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <Clock size={15} color="#06b6d4" />
                      <span>{batch.timeSlot}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <Building size={15} color="#818cf8" />
                      <span>{batch.lab}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <UserCheck size={15} color="#10b981" />
                      <span>Trainer: {batch.instructor}</span>
                    </div>
                  </div>

                  <div style={{ marginTop: "18px", paddingTop: "14px", borderTop: "1px solid var(--border-subtle)", display: "flex", justifyContent: "space-between", fontSize: "0.85rem" }}>
                    <span style={{ color: "var(--text-dim)" }}>Enrollment:</span>
                    <span style={{ fontWeight: 700, color: "#ffffff" }}>{batch.enrolledCount} / {batch.capacity} Students</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 3. ADMISSIONS & FEE TRACKING TAB */}
        {activeTab === "fees" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <div>
                <h2 style={{ fontSize: "1.3rem", fontWeight: 800 }}>Student Fees & Installments</h2>
                <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>Track tuition payments, record installments, and issue printed official receipts.</p>
              </div>
            </div>

            <div className="glass-panel" style={{ overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.9rem" }}>
                <thead>
                  <tr style={{ background: "rgba(0,0,0,0.3)", borderBottom: "1px solid var(--border-subtle)", color: "var(--text-dim)", fontSize: "0.78rem", textTransform: "uppercase" }}>
                    <th style={{ padding: "14px 20px" }}>Student Name</th>
                    <th style={{ padding: "14px 20px" }}>Course & Batch</th>
                    <th style={{ padding: "14px 20px" }}>Total Fee</th>
                    <th style={{ padding: "14px 20px" }}>Paid</th>
                    <th style={{ padding: "14px 20px" }}>Remaining</th>
                    <th style={{ padding: "14px 20px" }}>Status</th>
                    <th style={{ padding: "14px 20px", textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((std) => {
                    const balance = std.totalFee - std.paidFee;
                    return (
                      <tr key={std.id} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                        <td style={{ padding: "14px 20px" }}>
                          <div style={{ fontWeight: 700, color: "#ffffff" }}>{std.name}</div>
                          <div style={{ fontSize: "0.75rem", color: "var(--text-dim)" }}>{std.phone}</div>
                        </td>
                        <td style={{ padding: "14px 20px" }}>
                          <div style={{ color: "#e2e8f0" }}>{std.course}</div>
                          <span className="badge badge-indigo" style={{ fontSize: "0.68rem", marginTop: "2px" }}>{std.batchCode}</span>
                        </td>
                        <td style={{ padding: "14px 20px", fontWeight: 600 }}>PKR {std.totalFee.toLocaleString()}</td>
                        <td style={{ padding: "14px 20px", fontWeight: 700, color: "#34d399" }}>PKR {std.paidFee.toLocaleString()}</td>
                        <td style={{ padding: "14px 20px", fontWeight: 700, color: balance > 0 ? "#f87171" : "var(--text-dim)" }}>
                          PKR {balance.toLocaleString()}
                        </td>
                        <td style={{ padding: "14px 20px" }}>
                          <span className={`badge ${std.status === FEE_STATUS.PAID ? "badge-emerald" : std.status === FEE_STATUS.PARTIAL ? "badge-amber" : "badge-cyan"}`}>
                            {std.status.toUpperCase()}
                          </span>
                        </td>
                        <td style={{ padding: "14px 20px", textAlign: "right" }}>
                          {balance > 0 ? (
                            <button
                              onClick={() => {
                                setSelectedStudentForFee(std);
                                setShowFeeModal(true);
                              }}
                              className="btn-primary"
                              style={{ padding: "6px 14px", fontSize: "0.8rem" }}
                            >
                              Record Payment
                            </button>
                          ) : (
                            <span style={{ fontSize: "0.8rem", color: "#34d399", fontWeight: 600 }}>Paid in Full</span>
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

        {/* 4. ATTENDANCE REGISTER TAB */}
        {activeTab === "attendance" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
              <div>
                <h2 style={{ fontSize: "1.3rem", fontWeight: 800 }}>Daily Batch Attendance Sheet</h2>
                <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>Mark and save lab & lecture attendance.</p>
              </div>

              <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                <span style={{ fontSize: "0.85rem", color: "var(--text-dim)" }}>Date:</span>
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

            <div className="glass-panel" style={{ padding: "20px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {students.map((std) => {
                  const currentStatus = attendanceRecords[std.id] || "present";
                  return (
                    <div
                      key={std.id}
                      style={{
                        padding: "14px 18px",
                        background: "rgba(0,0,0,0.2)",
                        borderRadius: "10px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center"
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 700 }}>{std.name}</div>
                        <div style={{ fontSize: "0.8rem", color: "var(--text-dim)" }}>
                          {std.course} ({std.batchCode})
                        </div>
                      </div>

                      {/* Toggle Buttons */}
                      <div style={{ display: "flex", gap: "6px" }}>
                        <button
                          onClick={() => setAttendanceRecords({ ...attendanceRecords, [std.id]: "present" })}
                          style={{
                            padding: "6px 14px",
                            borderRadius: "6px",
                            border: "none",
                            background: currentStatus === "present" ? "#10b981" : "rgba(255,255,255,0.05)",
                            color: "#ffffff",
                            fontWeight: 600,
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
                            borderRadius: "6px",
                            border: "none",
                            background: currentStatus === "absent" ? "#ef4444" : "rgba(255,255,255,0.05)",
                            color: "#ffffff",
                            fontWeight: 600,
                            fontSize: "0.8rem",
                            cursor: "pointer"
                          }}
                        >
                          Absent
                        </button>
                        <button
                          onClick={() => setAttendanceRecords({ ...attendanceRecords, [std.id]: "leave" })}
                          style={{
                            padding: "6px 14px",
                            borderRadius: "6px",
                            border: "none",
                            background: currentStatus === "leave" ? "#f59e0b" : "rgba(255,255,255,0.05)",
                            color: "#ffffff",
                            fontWeight: 600,
                            fontSize: "0.8rem",
                            cursor: "pointer"
                          }}
                        >
                          Leave
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div style={{ marginTop: "20px", display: "flex", justifyContent: "flex-end" }}>
                <button
                  onClick={() => alert(`Attendance for ${attendanceDate} saved successfully!`)}
                  className="btn-primary"
                >
                  Save Daily Register
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 5. CERTIFICATE GENERATOR TAB */}
        {activeTab === "certificates" && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(420px, 1fr))", gap: "28px" }}>
              
              {/* Form */}
              <div className="glass-panel" style={{ padding: "28px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "18px" }}>
                  <Award size={24} color="#818cf8" />
                  <h3 style={{ fontSize: "1.2rem", fontWeight: 800 }}>Issue Digital Certificate</h3>
                </div>

                <form onSubmit={handleIssueCertificate}>
                  <div style={{ marginBottom: "14px" }}>
                    <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "6px", color: "#cbd5e1" }}>
                      Student Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ali Hassan Khan"
                      value={certForm.studentName}
                      onChange={(e) => setCertForm({ ...certForm, studentName: e.target.value })}
                      style={{
                        width: "100%",
                        padding: "10px 14px",
                        background: "rgba(0,0,0,0.3)",
                        border: "1px solid var(--border-subtle)",
                        borderRadius: "8px",
                        color: "#ffffff"
                      }}
                    />
                  </div>

                  <div style={{ marginBottom: "14px" }}>
                    <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "6px", color: "#cbd5e1" }}>
                      Completed Program *
                    </label>
                    <select
                      value={certForm.courseTitle}
                      onChange={(e) => setCertForm({ ...certForm, courseTitle: e.target.value })}
                      style={{
                        width: "100%",
                        padding: "10px 14px",
                        background: "#090d16",
                        border: "1px solid var(--border-subtle)",
                        borderRadius: "8px",
                        color: "#ffffff"
                      }}
                    >
                      {courses.map(c => (
                        <option key={c.id} value={c.title}>{c.title}</option>
                      ))}
                    </select>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "14px" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "6px", color: "#cbd5e1" }}>
                        Grade / Band Achieved
                      </label>
                      <input
                        type="text"
                        value={certForm.grade}
                        onChange={(e) => setCertForm({ ...certForm, grade: e.target.value })}
                        style={{
                          width: "100%",
                          padding: "10px 14px",
                          background: "rgba(0,0,0,0.3)",
                          border: "1px solid var(--border-subtle)",
                          borderRadius: "8px",
                          color: "#ffffff"
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "6px", color: "#cbd5e1" }}>
                        Lead Instructor
                      </label>
                      <input
                        type="text"
                        value={certForm.instructorName}
                        onChange={(e) => setCertForm({ ...certForm, instructorName: e.target.value })}
                        style={{
                          width: "100%",
                          padding: "10px 14px",
                          background: "rgba(0,0,0,0.3)",
                          border: "1px solid var(--border-subtle)",
                          borderRadius: "8px",
                          color: "#ffffff"
                        }}
                      />
                    </div>
                  </div>

                  <div style={{ marginBottom: "20px" }}>
                    <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "6px", color: "#cbd5e1" }}>
                      Key Skills Mastered (comma-separated)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. React.js, Express, MongoDB, UI Prototyping"
                      value={certForm.skills}
                      onChange={(e) => setCertForm({ ...certForm, skills: e.target.value })}
                      style={{
                        width: "100%",
                        padding: "10px 14px",
                        background: "rgba(0,0,0,0.3)",
                        border: "1px solid var(--border-subtle)",
                        borderRadius: "8px",
                        color: "#ffffff"
                      }}
                    />
                  </div>

                  <button type="submit" className="btn-primary" style={{ width: "100%", padding: "12px" }}>
                    Issue & Verify Online
                  </button>
                </form>
              </div>

              {/* Certificate Live Preview */}
              <div>
                <div style={{ fontSize: "0.85rem", color: "var(--text-dim)", textTransform: "uppercase", fontWeight: 700, marginBottom: "12px" }}>
                  Live Certificate Preview
                </div>

                <div style={{
                  background: "radial-gradient(circle at 50% 50%, #1e1b4b 0%, #09090b 100%)",
                  border: "2px solid #fbbf24",
                  borderRadius: "16px",
                  padding: "36px 30px",
                  textAlign: "center",
                  position: "relative",
                  boxShadow: "0 20px 50px rgba(0,0,0,0.6)"
                }}>
                  <div style={{ fontSize: "0.8rem", letterSpacing: "0.15em", color: "#fbbf24", textTransform: "uppercase", fontWeight: 800 }}>
                    Apex Education Forum
                  </div>
                  <div style={{ fontSize: "1.6rem", fontWeight: 900, color: "#ffffff", margin: "8px 0" }}>
                    CERTIFICATE OF COMPLETION
                  </div>
                  <div style={{ fontSize: "0.82rem", color: "var(--text-dim)", marginBottom: "16px" }}>
                    This is proudly presented to
                  </div>

                  <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "#38bdf8", borderBottom: "1px solid rgba(255,255,255,0.2)", paddingBottom: "8px", maxWidth: "350px", margin: "0 auto 16px" }}>
                    {certForm.studentName || "Student Name"}
                  </div>

                  <p style={{ fontSize: "0.88rem", color: "#cbd5e1", maxWidth: "420px", margin: "0 auto 20px" }}>
                    for successfully demonstrating mastery in <strong>{certForm.courseTitle}</strong> with grade <strong>{certForm.grade}</strong>.
                  </p>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "16px", fontSize: "0.75rem", color: "var(--text-dim)" }}>
                    <div>
                      <div style={{ fontWeight: 700, color: "#ffffff" }}>{certForm.instructorName}</div>
                      <div>Instructor</div>
                    </div>

                    <div style={{
                      padding: "4px 10px",
                      borderRadius: "6px",
                      background: "rgba(16, 185, 129, 0.15)",
                      color: "#34d399",
                      border: "1px solid rgba(16, 185, 129, 0.3)",
                      fontWeight: 700
                    }}>
                      ID: {issuedCert ? issuedCert.certificateId : "APEX-CERT-2026-LIVE"}
                    </div>

                    <div>
                      <div style={{ fontWeight: 700, color: "#ffffff" }}>Muhammad Rauf</div>
                      <div>Director</div>
                    </div>
                  </div>
                </div>

                {issuedCert && (
                  <div style={{ marginTop: "16px", padding: "14px", background: "rgba(16, 185, 129, 0.1)", border: "1px solid rgba(16, 185, 129, 0.3)", borderRadius: "10px", textAlign: "center" }}>
                    <div style={{ color: "#34d399", fontWeight: 700 }}>✓ Certificate Issued & Synced!</div>
                    <div style={{ fontSize: "0.85rem", color: "#cbd5e1", marginTop: "4px" }}>
                      Now instantly verifiable on the website with ID: <strong>{issuedCert.certificateId}</strong>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

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
          <div className="glass-panel" style={{ maxWidth: "550px", width: "100%", padding: "28px", borderRadius: "var(--radius-lg)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
              <h3 style={{ fontSize: "1.2rem", fontWeight: 800 }}>Schedule New Batch</h3>
              <button onClick={() => setShowBatchModal(false)} style={{ background: "transparent", border: "none", color: "var(--text-dim)", cursor: "pointer" }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateBatch}>
              <div style={{ marginBottom: "14px" }}>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "6px" }}>Select Course</label>
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
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "6px" }}>Max Capacity</label>
                  <input
                    type="number"
                    value={newBatch.capacity}
                    onChange={(e) => setNewBatch({ ...newBatch, capacity: e.target.value })}
                    style={{ width: "100%", padding: "10px", background: "rgba(0,0,0,0.3)", border: "1px solid var(--border-subtle)", borderRadius: "8px", color: "#ffffff" }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: "14px" }}>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "6px" }}>Time Slot</label>
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
