import React, { useState } from "react";
import EcosystemNav from "@shared/EcosystemNav.jsx";
import { getCourses, submitInquiry, verifyCertificate } from "@shared/dataStore.js";
import { COURSE_CATEGORIES, BATCH_SLOTS } from "@shared/constants.js";
import { 
  Code2, 
  Languages, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  Calendar, 
  Clock, 
  Award, 
  Search, 
  Users, 
  Monitor, 
  ShieldCheck, 
  GraduationCap, 
  ChevronRight,
  X,
  Phone,
  Mail,
  MapPin,
  HelpCircle
} from "lucide-react";

export default function App() {
  const [courses] = useState(getCourses());
  const [activeTab, setActiveTab] = useState("all");
  const [selectedCourseModal, setSelectedCourseModal] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    courseId: courses[0]?.id || "",
    preferredSlot: BATCH_SLOTS[3].label,
    notes: ""
  });
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Certificate Verification State
  const [certQuery, setCertQuery] = useState("");
  const [certResult, setCertResult] = useState(null);
  const [certSearched, setCertSearched] = useState(false);

  const filteredCourses = activeTab === "all" 
    ? courses 
    : courses.filter(c => c.category === activeTab);

  const handleSubmitInquiry = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) return;
    setSubmitting(true);
    const selectedCourse = courses.find(c => c.id === formData.courseId);
    await submitInquiry({
      name: formData.name,
      phone: formData.phone,
      email: formData.email,
      courseId: formData.courseId,
      courseTitle: selectedCourse ? selectedCourse.title : "General",
      preferredSlot: formData.preferredSlot,
      notes: formData.notes
    });
    setSubmitting(false);
    setFormSubmitted(true);
  };

  const handleVerify = (e) => {
    e.preventDefault();
    if (!certQuery.trim()) return;
    const res = verifyCertificate(certQuery);
    setCertResult(res);
    setCertSearched(true);
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--bg-dark)" }}>
      {/* Ecosystem Top Navigation */}
      <EcosystemNav currentApp="website" />

      {/* Hero Section */}
      <section style={{
        position: "relative",
        padding: "80px 24px 100px",
        overflow: "hidden",
        borderBottom: "1px solid var(--border-subtle)",
        background: "radial-gradient(circle at 50% -20%, rgba(99, 102, 241, 0.22) 0%, rgba(7, 9, 14, 0) 70%)"
      }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", textAlign: "center", position: "relative", zIndex: 2 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "rgba(99, 102, 241, 0.12)", border: "1px solid rgba(99, 102, 241, 0.3)", padding: "6px 16px", borderRadius: "9999px", marginBottom: "24px" }}>
            <Sparkles size={16} color="#818cf8" />
            <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "#c7d2fe", letterSpacing: "0.03em" }}>
              ADMISSIONS OPEN FOR FALL 2026 BATCHES
            </span>
          </div>

          <h1 style={{
            fontSize: "clamp(2.5rem, 5vw, 4.2rem)",
            fontWeight: 800,
            lineHeight: 1.15,
            letterSpacing: "-0.03em",
            maxWidth: "900px",
            margin: "0 auto 20px"
          }}>
            Master In-Demand <span style={{
              background: "linear-gradient(135deg, #38bdf8 0%, #6366f1 50%, #a855f7 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent"
            }}>IT Skills</span> & <span style={{
              background: "linear-gradient(135deg, #34d399 0%, #06b6d4 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent"
            }}>Global Languages</span>
          </h1>

          <p style={{
            fontSize: "1.2rem",
            color: "var(--text-muted)",
            maxWidth: "700px",
            margin: "0 auto 36px",
            lineHeight: 1.6
          }}>
            Apex Education Forum provides industry-aligned technical bootcamps and intensive English language fluency programs with practical labs, expert mentorship, and accredited certifications.
          </p>

          <div style={{ display: "flex", justifyContent: "center", gap: "16px", flexWrap: "wrap", marginBottom: "50px" }}>
            <a href="#courses" className="btn-primary" style={{ padding: "14px 30px", fontSize: "1.05rem" }}>
              <span>Explore Programs</span>
              <ArrowRight size={18} />
            </a>
            <a href="#admission-form" className="btn-secondary" style={{ padding: "14px 28px", fontSize: "1.05rem" }}>
              <span>Book Free Demo Class</span>
            </a>
          </div>

          {/* Stats Bar */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "20px",
            maxWidth: "1000px",
            margin: "0 auto",
            padding: "24px",
            background: "rgba(16, 22, 36, 0.6)",
            border: "1px solid var(--border-subtle)",
            borderRadius: "var(--radius-lg)",
            backdropFilter: "blur(12px)"
          }}>
            <div>
              <div style={{ fontSize: "2rem", fontWeight: 800, color: "#38bdf8" }}>1,400+</div>
              <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>Certified Graduates</div>
            </div>
            <div>
              <div style={{ fontSize: "2rem", fontWeight: 800, color: "#818cf8" }}>98.4%</div>
              <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>Job & IELTS Target Rate</div>
            </div>
            <div>
              <div style={{ fontSize: "2rem", fontWeight: 800, color: "#34d399" }}>2 Labs</div>
              <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>High-End IT & Audio Lab</div>
            </div>
            <div>
              <div style={{ fontSize: "2rem", fontWeight: 800, color: "#fbbf24" }}>4.9 / 5</div>
              <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>Student Review Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* Courses Section */}
      <section id="courses" style={{ padding: "80px 24px", maxWidth: "1280px", margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <span className="badge badge-indigo" style={{ marginBottom: "12px" }}>Academic Offerings</span>
          <h2 style={{ fontSize: "2.5rem", fontWeight: 800, letterSpacing: "-0.02em" }}>
            Comprehensive Training Tracks
          </h2>
          <p style={{ color: "var(--text-muted)", marginTop: "8px" }}>
            Choose your path: Launch a high-paying tech career or achieve international language fluency.
          </p>

          {/* Filter Tabs */}
          <div style={{
            display: "inline-flex",
            background: "rgba(255, 255, 255, 0.04)",
            border: "1px solid var(--border-subtle)",
            borderRadius: "12px",
            padding: "6px",
            gap: "8px",
            marginTop: "28px"
          }}>
            <button
              onClick={() => setActiveTab("all")}
              style={{
                padding: "8px 20px",
                borderRadius: "8px",
                border: "none",
                background: activeTab === "all" ? "var(--primary)" : "transparent",
                color: activeTab === "all" ? "#ffffff" : "var(--text-muted)",
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.2s"
              }}
            >
              All Courses ({courses.length})
            </button>
            <button
              onClick={() => setActiveTab(COURSE_CATEGORIES.IT)}
              style={{
                padding: "8px 20px",
                borderRadius: "8px",
                border: "none",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                background: activeTab === COURSE_CATEGORIES.IT ? "var(--primary)" : "transparent",
                color: activeTab === COURSE_CATEGORIES.IT ? "#ffffff" : "var(--text-muted)",
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.2s"
              }}
            >
              <Code2 size={16} />
              <span>💻 IT & Computer Sector</span>
            </button>
            <button
              onClick={() => setActiveTab(COURSE_CATEGORIES.LANGUAGE)}
              style={{
                padding: "8px 20px",
                borderRadius: "8px",
                border: "none",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                background: activeTab === COURSE_CATEGORIES.LANGUAGE ? "var(--primary)" : "transparent",
                color: activeTab === COURSE_CATEGORIES.LANGUAGE ? "#ffffff" : "var(--text-muted)",
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.2s"
              }}
            >
              <Languages size={16} />
              <span>🗣️ Language Programs</span>
            </button>
          </div>
        </div>

        {/* Course Cards Grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
          gap: "28px"
        }}>
          {filteredCourses.map((course) => {
            const isIT = course.category === COURSE_CATEGORIES.IT;
            return (
              <div 
                key={course.id} 
                className="glass-panel"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  padding: "26px",
                  borderRadius: "var(--radius-lg)",
                  position: "relative",
                  overflow: "hidden"
                }}
              >
                {/* Accent Top Border Bar */}
                <div style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: "4px",
                  background: isIT 
                    ? "linear-gradient(90deg, #06b6d4, #6366f1)" 
                    : "linear-gradient(90deg, #10b981, #06b6d4)"
                }} />

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
                  <span className={`badge ${isIT ? "badge-cyan" : "badge-emerald"}`}>
                    {isIT ? "💻 IT Track" : "🗣️ Language Track"}
                  </span>
                  <span style={{ fontSize: "0.8rem", color: "#fbbf24", fontWeight: 700 }}>
                    ★ {course.rating} ({course.reviewsCount})
                  </span>
                </div>

                <h3 style={{ fontSize: "1.3rem", fontWeight: 800, marginBottom: "8px", color: "#ffffff" }}>
                  {course.title}
                </h3>
                
                <p style={{ fontSize: "0.92rem", color: "var(--text-muted)", marginBottom: "20px", flex: 1 }}>
                  {course.tagline}
                </p>

                <div style={{ 
                  display: "grid", 
                  gridTemplateColumns: "1fr 1fr", 
                  gap: "10px", 
                  padding: "14px", 
                  background: "rgba(0, 0, 0, 0.25)", 
                  borderRadius: "10px",
                  marginBottom: "20px",
                  fontSize: "0.84rem"
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--text-dim)" }}>
                    <Clock size={14} color="#94a3b8" />
                    <span>{course.duration}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--text-dim)" }}>
                    <Calendar size={14} color="#94a3b8" />
                    <span>{course.sessionsPerWeek}</span>
                  </div>
                  <div style={{ gridColumn: "1 / -1", fontWeight: 600, color: "#e2e8f0" }}>
                    Trainer: <span style={{ color: "#38bdf8" }}>{course.instructorName}</span>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
                  <div>
                    <div style={{ fontSize: "0.72rem", color: "var(--text-dim)", textTransform: "uppercase" }}>Tuition Fee</div>
                    <div style={{ fontSize: "1.35rem", fontWeight: 800, color: "#ffffff" }}>
                      PKR {course.fee.toLocaleString()}
                    </div>
                  </div>
                  <span className="badge badge-indigo">
                    {course.installments} Installments
                  </span>
                </div>

                <div style={{ display: "flex", gap: "10px" }}>
                  <button
                    onClick={() => setSelectedCourseModal(course)}
                    className="btn-secondary"
                    style={{ flex: 1, padding: "10px" }}
                  >
                    View Syllabus
                  </button>
                  <a
                    href="#admission-form"
                    onClick={() => setFormData({ ...formData, courseId: course.id })}
                    className="btn-primary"
                    style={{ flex: 1, padding: "10px" }}
                  >
                    Apply Now
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Online Admission & Demo Booking Section */}
      <section id="admission-form" style={{
        padding: "80px 24px",
        background: "rgba(16, 22, 36, 0.5)",
        borderTop: "1px solid var(--border-subtle)",
        borderBottom: "1px solid var(--border-subtle)"
      }}>
        <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
            gap: "40px",
            alignItems: "center"
          }}>
            <div>
              <span className="badge badge-cyan" style={{ marginBottom: "12px" }}>Instant Enrollment</span>
              <h2 style={{ fontSize: "2.4rem", fontWeight: 800, letterSpacing: "-0.02em", marginBottom: "16px" }}>
                Book Your Seat or Attend a Free Demo Session
              </h2>
              <p style={{ color: "var(--text-muted)", lineHeight: 1.6, marginBottom: "24px" }}>
                Meet the instructors, tour the audio-visual language and computer labs, and experience our hands-on teaching methodology before enrolling.
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "rgba(6, 182, 212, 0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <CheckCircle2 size={20} color="#06b6d4" />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700 }}>Zero Risk Trial Session</div>
                    <div style={{ fontSize: "0.85rem", color: "var(--text-dim)" }}>Attend the first batch orientation completely free.</div>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "rgba(99, 102, 241, 0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <CheckCircle2 size={20} color="#6366f1" />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700 }}>Flexible Timing Slots</div>
                    <div style={{ fontSize: "0.85rem", color: "var(--text-dim)" }}>Morning, evening, and weekend batches for working individuals.</div>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "rgba(16, 185, 129, 0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <CheckCircle2 size={20} color="#10b981" />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700 }}>Online & Campus Access</div>
                    <div style={{ fontSize: "0.85rem", color: "var(--text-dim)" }}>Full access to Apex Connect chat app and study materials.</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Form Card */}
            <div className="glass-panel" style={{ padding: "32px", borderRadius: "var(--radius-lg)" }}>
              {formSubmitted ? (
                <div style={{ textAlign: "center", padding: "40px 10px" }}>
                  <div style={{
                    width: "60px",
                    height: "60px",
                    borderRadius: "50%",
                    background: "rgba(16, 185, 129, 0.2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 16px"
                  }}>
                    <CheckCircle2 size={36} color="#10b981" />
                  </div>
                  <h3 style={{ fontSize: "1.4rem", fontWeight: 800, color: "#ffffff", marginBottom: "8px" }}>
                    Admission Request Received!
                  </h3>
                  <p style={{ color: "var(--text-muted)", fontSize: "0.95rem", marginBottom: "20px" }}>
                    Our center admissions manager will contact you via phone/WhatsApp within 24 hours with your batch timing and lab orientation details.
                  </p>
                  <button
                    onClick={() => setFormSubmitted(false)}
                    className="btn-secondary"
                  >
                    Submit Another Application
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmitInquiry}>
                  <h3 style={{ fontSize: "1.3rem", fontWeight: 800, marginBottom: "20px" }}>
                    Registration Application
                  </h3>

                  <div style={{ marginBottom: "16px" }}>
                    <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "#cbd5e1", marginBottom: "6px" }}>
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Muhammad Ali"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      style={{
                        width: "100%",
                        padding: "12px 14px",
                        background: "rgba(0,0,0,0.3)",
                        border: "1px solid var(--border-subtle)",
                        borderRadius: "8px",
                        color: "#ffffff",
                        fontSize: "0.95rem"
                      }}
                    />
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "16px" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "#cbd5e1", marginBottom: "6px" }}>
                        Phone / WhatsApp *
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="+92 300 1234567"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        style={{
                          width: "100%",
                          padding: "12px 14px",
                          background: "rgba(0,0,0,0.3)",
                          border: "1px solid var(--border-subtle)",
                          borderRadius: "8px",
                          color: "#ffffff",
                          fontSize: "0.95rem"
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "#cbd5e1", marginBottom: "6px" }}>
                        Email Address
                      </label>
                      <input
                        type="email"
                        placeholder="you@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        style={{
                          width: "100%",
                          padding: "12px 14px",
                          background: "rgba(0,0,0,0.3)",
                          border: "1px solid var(--border-subtle)",
                          borderRadius: "8px",
                          color: "#ffffff",
                          fontSize: "0.95rem"
                        }}
                      />
                    </div>
                  </div>

                  <div style={{ marginBottom: "16px" }}>
                    <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "#cbd5e1", marginBottom: "6px" }}>
                      Desired Course *
                    </label>
                    <select
                      value={formData.courseId}
                      onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
                      style={{
                        width: "100%",
                        padding: "12px 14px",
                        background: "#0d1322",
                        border: "1px solid var(--border-subtle)",
                        borderRadius: "8px",
                        color: "#ffffff",
                        fontSize: "0.95rem"
                      }}
                    >
                      {courses.map(c => (
                        <option key={c.id} value={c.id}>{c.title} ({c.duration})</option>
                      ))}
                    </select>
                  </div>

                  <div style={{ marginBottom: "22px" }}>
                    <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "#cbd5e1", marginBottom: "6px" }}>
                      Preferred Timing Slot
                    </label>
                    <select
                      value={formData.preferredSlot}
                      onChange={(e) => setFormData({ ...formData, preferredSlot: e.target.value })}
                      style={{
                        width: "100%",
                        padding: "12px 14px",
                        background: "#0d1322",
                        border: "1px solid var(--border-subtle)",
                        borderRadius: "8px",
                        color: "#ffffff",
                        fontSize: "0.95rem"
                      }}
                    >
                      {BATCH_SLOTS.map(slot => (
                        <option key={slot.id} value={slot.label}>{slot.label}</option>
                      ))}
                    </select>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn-primary"
                    style={{ width: "100%", padding: "14px", fontSize: "1rem" }}
                  >
                    {submitting ? "Submitting..." : "Submit Admission Inquiry"}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Public Certificate Verification Section */}
      <section style={{ padding: "80px 24px", maxWidth: "1000px", margin: "0 auto" }}>
        <div className="glass-panel" style={{ padding: "40px", borderRadius: "var(--radius-lg)", textAlign: "center" }}>
          <div style={{ width: "50px", height: "50px", borderRadius: "50%", background: "rgba(99, 102, 241, 0.2)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
            <Award size={28} color="#818cf8" />
          </div>
          <h2 style={{ fontSize: "2rem", fontWeight: 800, marginBottom: "8px" }}>
            Online Certificate Verification
          </h2>
          <p style={{ color: "var(--text-muted)", maxWidth: "600px", margin: "0 auto 24px" }}>
            Employers, institutions, and students can authenticate genuine Apex Education Forum diplomas & certificates instantly.
          </p>

          <form onSubmit={handleVerify} style={{ display: "flex", maxWidth: "550px", margin: "0 auto 24px", gap: "10px" }}>
            <input
              type="text"
              placeholder="Enter Certificate ID (e.g. APEX-CERT-2026-8821)"
              value={certQuery}
              onChange={(e) => setCertQuery(e.target.value)}
              style={{
                flex: 1,
                padding: "12px 16px",
                background: "rgba(0,0,0,0.3)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "8px",
                color: "#ffffff",
                fontSize: "0.95rem"
              }}
            />
            <button type="submit" className="btn-primary">
              <Search size={18} />
              <span>Verify</span>
            </button>
          </form>

          {/* Certificate Result Preview */}
          {certSearched && (
            <div style={{ maxWidth: "600px", margin: "0 auto", textAlign: "left" }}>
              {certResult ? (
                <div style={{
                  padding: "24px",
                  background: "rgba(16, 185, 129, 0.08)",
                  border: "1px solid rgba(16, 185, 129, 0.3)",
                  borderRadius: "14px"
                }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
                    <span className="badge badge-emerald">✓ Verified Authentic</span>
                    <span style={{ fontSize: "0.85rem", color: "var(--text-dim)" }}>Issued: {certResult.issueDate}</span>
                  </div>
                  <h3 style={{ fontSize: "1.4rem", fontWeight: 800, color: "#ffffff" }}>
                    {certResult.studentName}
                  </h3>
                  <div style={{ fontSize: "1rem", color: "#38bdf8", fontWeight: 600, marginTop: "4px" }}>
                    {certResult.courseTitle}
                  </div>
                  <div style={{ fontSize: "0.9rem", color: "var(--text-muted)", marginTop: "4px" }}>
                    Performance: <strong>{certResult.grade}</strong> | Instructor: {certResult.instructorName}
                  </div>
                  <div style={{ marginTop: "14px", display: "flex", flexWrap: "wrap", gap: "6px" }}>
                    {certResult.skills?.map((s, idx) => (
                      <span key={idx} style={{ fontSize: "0.78rem", background: "rgba(255, 255, 255, 0.06)", padding: "3px 8px", borderRadius: "6px" }}>
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                <div style={{
                  padding: "20px",
                  background: "rgba(244, 63, 94, 0.08)",
                  border: "1px solid rgba(244, 63, 94, 0.3)",
                  borderRadius: "14px",
                  textAlign: "center",
                  color: "#fda4af"
                }}>
                  No certificate found with ID: "{certQuery}". Please double-check the ID or contact administration.
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Syllabus Modal */}
      {selectedCourseModal && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0,0,0,0.8)",
          backdropFilter: "blur(8px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px",
          zIndex: 9999
        }}>
          <div className="glass-panel" style={{
            maxWidth: "650px",
            width: "100%",
            maxHeight: "90vh",
            overflowY: "auto",
            padding: "32px",
            borderRadius: "var(--radius-lg)",
            position: "relative"
          }}>
            <button
              onClick={() => setSelectedCourseModal(null)}
              style={{
                position: "absolute",
                top: "20px",
                right: "20px",
                background: "transparent",
                border: "none",
                color: "var(--text-muted)",
                cursor: "pointer"
              }}
            >
              <X size={22} />
            </button>

            <span className="badge badge-indigo" style={{ marginBottom: "8px" }}>Course Curriculum</span>
            <h3 style={{ fontSize: "1.6rem", fontWeight: 800, marginBottom: "8px" }}>
              {selectedCourseModal.title}
            </h3>
            <p style={{ color: "var(--text-muted)", marginBottom: "20px" }}>
              {selectedCourseModal.tagline}
            </p>

            <h4 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "12px", color: "#38bdf8" }}>
              Modules & Hands-on Topics:
            </h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "24px" }}>
              {selectedCourseModal.modules.map((mod, i) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "10px", fontSize: "0.92rem", color: "#cbd5e1" }}>
                  <span style={{
                    width: "22px",
                    height: "22px",
                    borderRadius: "50%",
                    background: "rgba(99, 102, 241, 0.2)",
                    color: "#818cf8",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    flexShrink: 0
                  }}>
                    {i + 1}
                  </span>
                  <span>{mod}</span>
                </div>
              ))}
            </div>

            <div style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: "20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: "0.8rem", color: "var(--text-dim)" }}>Total Fee</div>
                <div style={{ fontSize: "1.3rem", fontWeight: 800 }}>PKR {selectedCourseModal.fee.toLocaleString()}</div>
              </div>
              <a
                href="#admission-form"
                onClick={() => {
                  setFormData({ ...formData, courseId: selectedCourseModal.id });
                  setSelectedCourseModal(null);
                }}
                className="btn-primary"
              >
                Apply For This Course
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer style={{
        borderTop: "1px solid var(--border-subtle)",
        padding: "60px 24px 30px",
        background: "#05070a",
        marginTop: "60px"
      }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "40px", marginBottom: "40px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
              <div className="brand-logo" style={{ width: "32px", height: "32px", fontSize: "1rem" }}>A</div>
              <div style={{ fontWeight: 800 }}>APEX EDUCATION FORUM</div>
            </div>
            <p style={{ fontSize: "0.88rem", color: "var(--text-muted)", lineHeight: 1.6 }}>
              Premier IT training and language center dedicated to equipping learners with future-proof tech and communication mastery.
            </p>
          </div>

          <div>
            <div style={{ fontWeight: 700, marginBottom: "14px", color: "#ffffff" }}>Quick Ecosystem Navigation</div>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "8px", fontSize: "0.9rem" }}>
              <li><a href="http://localhost:5173" style={{ color: "var(--text-muted)", textDecoration: "none" }}>🌐 Public Website & Courses</a></li>
              <li><a href="http://localhost:5174" style={{ color: "var(--text-muted)", textDecoration: "none" }}>💬 Apex Connect (Messaging App)</a></li>
              <li><a href="http://localhost:5175" style={{ color: "var(--text-muted)", textDecoration: "none" }}>📊 Apex Management Portal (LMS)</a></li>
            </ul>
          </div>

          <div>
            <div style={{ fontWeight: 700, marginBottom: "14px", color: "#ffffff" }}>Contact & Campus</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "0.88rem", color: "var(--text-muted)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Phone size={16} color="#06b6d4" />
                <span>+92 300 0000000 / +92 51 1234567</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Mail size={16} color="#6366f1" />
                <span>info@apexeducationforum.edu</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <MapPin size={16} color="#10b981" />
                <span>Apex Education Campus, Commercial Center</span>
              </div>
            </div>
          </div>
        </div>

        <div style={{ maxWidth: "1200px", margin: "0 auto", borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "20px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px", fontSize: "0.8rem", color: "var(--text-dim)" }}>
          <div>© 2026 Apex Education Forum. All rights reserved. Powered by Firebase.</div>
          <div>Connected to GitHub: Muhammadrauf321/apex-echo-system</div>
        </div>
      </footer>
    </div>
  );
}
