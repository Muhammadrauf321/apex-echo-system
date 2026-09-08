import React, { useState, useEffect } from "react";
import { getCurrentUser, setCurrentUser, subscribeToAuth, logout } from "./auth.js";
import { DEMO_USERS } from "./seedData.js";
import { ROLES, ROLE_LABELS } from "./constants.js";
import { 
  Globe, 
  MessageSquare, 
  LayoutDashboard, 
  UserCheck, 
  ChevronDown, 
  LogOut,
  User,
  Shield,
  GraduationCap,
  BookOpen,
  X,
  CheckCircle2
} from "lucide-react";

export default function EcosystemNav({ currentApp = "website" }) {
  const [user, setUser] = useState(getCurrentUser());
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    const unsub = subscribeToAuth((updatedUser) => {
      setUser(updatedUser);
    });
    return unsub;
  }, []);

  const apps = [
    {
      id: "website",
      name: "Public Portal",
      desc: "Courses & Admissions",
      icon: Globe,
      port: 5173,
      url: "http://localhost:5173"
    },
    {
      id: "messaging",
      name: "Apex Connect",
      desc: "Real-time Chat & Voice",
      icon: MessageSquare,
      port: 5174,
      url: "http://localhost:5174"
    },
    {
      id: "management",
      name: "Management LMS",
      desc: "Batches, Fees & Admin",
      icon: LayoutDashboard,
      port: 5175,
      url: "http://localhost:5175"
    }
  ];

  const handleSelectAccount = (targetUser) => {
    setCurrentUser(targetUser);
    setShowAuthModal(false);
    setDropdownOpen(false);
  };

  const handleLogout = async () => {
    await logout();
    setDropdownOpen(false);
    setShowAuthModal(true);
  };

  // Group accounts strictly by Role
  const adminAccounts = DEMO_USERS.filter(u => u.role === ROLES.DIRECTOR || u.role === ROLES.MANAGER);
  const teacherAccounts = DEMO_USERS.filter(u => u.role === ROLES.INSTRUCTOR);
  const studentAccounts = DEMO_USERS.filter(u => u.role === ROLES.STUDENT);

  const getRoleBadgeStyle = (role) => {
    if (role === ROLES.DIRECTOR || role === ROLES.MANAGER) {
      return { bg: "rgba(99, 102, 241, 0.2)", color: "#a5b4fc", border: "rgba(99, 102, 241, 0.4)", label: "Admin" };
    }
    if (role === ROLES.INSTRUCTOR) {
      return { bg: "rgba(16, 185, 129, 0.2)", color: "#34d399", border: "rgba(16, 185, 129, 0.4)", label: "Teacher" };
    }
    return { bg: "rgba(245, 158, 11, 0.2)", color: "#fbbf24", border: "rgba(245, 158, 11, 0.4)", label: "Student" };
  };

  const badge = user ? getRoleBadgeStyle(user.role) : { bg: "rgba(148, 163, 184, 0.2)", color: "#94a3b8", border: "transparent", label: "Guest" };

  return (
    <header className="ecosystem-nav">
      <div className="nav-container">
        {/* Brand */}
        <a href="http://localhost:5173" className="nav-brand">
          <div className="brand-logo">A</div>
          <div>
            <div className="brand-title">APEX EDUCATION FORUM</div>
            <div className="brand-sub">Unified Ecosystem</div>
          </div>
        </a>

        {/* Cross-App Links */}
        <nav style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {apps.map((app) => {
            const Icon = app.icon;
            const isActive = currentApp === app.id;
            return (
              <a
                key={app.id}
                href={app.url}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "8px 16px",
                  borderRadius: "10px",
                  textDecoration: "none",
                  fontSize: "0.88rem",
                  fontWeight: 600,
                  transition: "all 0.2s ease",
                  background: isActive ? "rgba(99, 102, 241, 0.18)" : "transparent",
                  color: isActive ? "#818cf8" : "#94a3b8",
                  border: isActive ? "1px solid rgba(99, 102, 241, 0.4)" : "1px solid transparent"
                }}
              >
                <Icon size={16} />
                <span>{app.name}</span>
                {isActive && (
                  <span style={{
                    width: "6px",
                    height: "6px",
                    borderRadius: "50%",
                    background: "#06b6d4",
                    boxShadow: "0 0 8px #06b6d4"
                  }} />
                )}
              </a>
            );
          })}
        </nav>

        {/* Current Authenticated User & Account Menu */}
        <div style={{ position: "relative" }}>
          {user ? (
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                background: "rgba(255, 255, 255, 0.05)",
                border: "1px solid rgba(255, 255, 255, 0.14)",
                borderRadius: "12px",
                padding: "6px 14px",
                color: "#ffffff",
                cursor: "pointer",
                transition: "all 0.2s ease"
              }}
            >
              <img
                src={user.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"}
                alt={user.name}
                style={{ width: "32px", height: "32px", borderRadius: "50%", objectFit: "cover" }}
              />
              <div style={{ textAlign: "left" }}>
                <div style={{ fontSize: "0.86rem", fontWeight: 700, display: "flex", alignItems: "center", gap: "6px" }}>
                  <span>{user.name}</span>
                  <span style={{
                    fontSize: "0.68rem",
                    padding: "2px 6px",
                    borderRadius: "6px",
                    background: badge.bg,
                    color: badge.color,
                    border: `1px solid ${badge.border}`,
                    fontWeight: 800,
                    textTransform: "uppercase",
                    letterSpacing: "0.03em"
                  }}>
                    {badge.label}
                  </span>
                </div>
                <div style={{ fontSize: "0.72rem", color: "#94a3b8" }}>
                  ID: {user.uid}
                </div>
              </div>
              <ChevronDown size={14} color="#94a3b8" />
            </button>
          ) : (
            <button
              onClick={() => setShowAuthModal(true)}
              className="btn-primary"
              style={{ fontSize: "0.88rem", padding: "8px 16px" }}
            >
              <User size={16} />
              <span>Log In</span>
            </button>
          )}

          {dropdownOpen && user && (
            <div
              style={{
                position: "absolute",
                top: "calc(100% + 10px)",
                right: 0,
                width: "300px",
                background: "#0f172a",
                border: "1px solid rgba(255, 255, 255, 0.12)",
                borderRadius: "14px",
                boxShadow: "0 20px 40px rgba(0,0,0,0.6)",
                padding: "16px",
                zIndex: 9999
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px", paddingBottom: "12px", borderBottom: "1px solid rgba(255, 255, 255, 0.08)" }}>
                <img
                  src={user.avatar}
                  alt={user.name}
                  style={{ width: "42px", height: "42px", borderRadius: "50%", objectFit: "cover" }}
                />
                <div>
                  <div style={{ fontSize: "0.92rem", fontWeight: 700, color: "#fff" }}>{user.name}</div>
                  <div style={{ fontSize: "0.75rem", color: "#94a3b8" }}>{user.email}</div>
                  <div style={{ fontSize: "0.72rem", color: badge.color, fontWeight: 600, marginTop: "2px" }}>
                    {user.title || ROLE_LABELS[user.role]}
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginTop: "12px" }}>
                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    setShowAuthModal(true);
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: "10px 12px",
                    borderRadius: "8px",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    background: "rgba(255, 255, 255, 0.04)",
                    color: "#cbd5e1",
                    fontSize: "0.85rem",
                    cursor: "pointer",
                    textAlign: "left",
                    fontWeight: 600
                  }}
                >
                  <User size={16} color="#38bdf8" />
                  <span>Switch Account / Sign In</span>
                </button>

                <button
                  onClick={handleLogout}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: "10px 12px",
                    borderRadius: "8px",
                    border: "none",
                    background: "rgba(239, 68, 68, 0.12)",
                    color: "#f87171",
                    fontSize: "0.85rem",
                    cursor: "pointer",
                    textAlign: "left",
                    fontWeight: 600
                  }}
                >
                  <LogOut size={16} />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Account Authentication & Selection Modal with Strict Role Segregation */}
      {showAuthModal && (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "rgba(3, 7, 18, 0.85)",
          backdropFilter: "blur(8px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 10000,
          padding: "20px"
        }}>
          <div style={{
            background: "#0b0f19",
            border: "1px solid rgba(255, 255, 255, 0.12)",
            borderRadius: "18px",
            width: "100%",
            maxWidth: "680px",
            maxHeight: "90vh",
            overflowY: "auto",
            boxShadow: "0 25px 60px rgba(0,0,0,0.8)",
            padding: "24px"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", borderBottom: "1px solid rgba(255,255,255,0.08)", paddingBottom: "14px" }}>
              <div>
                <h2 style={{ fontSize: "1.25rem", fontWeight: 800, color: "#ffffff", letterSpacing: "-0.01em" }}>
                  Apex Unified Identity Access
                </h2>
                <p style={{ fontSize: "0.82rem", color: "#94a3b8", marginTop: "3px" }}>
                  Select an account to log in. Each role has separate permissions and dedicated portals.
                </p>
              </div>
              <button
                onClick={() => setShowAuthModal(false)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#94a3b8",
                  cursor: "pointer",
                  padding: "6px"
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Section 1: Administrative Staff */}
            <div style={{ marginBottom: "20px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
                <Shield size={16} color="#818cf8" />
                <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "#818cf8", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Executive & Admissions Administration
                </span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                {adminAccounts.map((acc) => {
                  const isCurrent = user?.uid === acc.uid;
                  return (
                    <button
                      key={acc.uid}
                      onClick={() => handleSelectAccount(acc)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        padding: "12px",
                        borderRadius: "12px",
                        background: isCurrent ? "rgba(99, 102, 241, 0.18)" : "rgba(255, 255, 255, 0.03)",
                        border: isCurrent ? "1px solid #6366f1" : "1px solid rgba(255, 255, 255, 0.08)",
                        color: "#fff",
                        cursor: "pointer",
                        textAlign: "left",
                        transition: "all 0.2s ease"
                      }}
                    >
                      <img src={acc.avatar} alt={acc.name} style={{ width: "36px", height: "36px", borderRadius: "50%", objectFit: "cover" }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: "0.88rem", fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{acc.name}</div>
                        <div style={{ fontSize: "0.72rem", color: "#94a3b8" }}>{acc.title}</div>
                        <div style={{ fontSize: "0.68rem", color: "#818cf8", marginTop: "2px" }}>ID: {acc.uid}</div>
                      </div>
                      {isCurrent && <CheckCircle2 size={16} color="#818cf8" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Section 2: Faculty & Instructors */}
            <div style={{ marginBottom: "20px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
                <BookOpen size={16} color="#34d399" />
                <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "#34d399", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Teaching Faculty & Instructors
                </span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                {teacherAccounts.map((acc) => {
                  const isCurrent = user?.uid === acc.uid;
                  return (
                    <button
                      key={acc.uid}
                      onClick={() => handleSelectAccount(acc)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        padding: "12px",
                        borderRadius: "12px",
                        background: isCurrent ? "rgba(16, 185, 129, 0.18)" : "rgba(255, 255, 255, 0.03)",
                        border: isCurrent ? "1px solid #10b981" : "1px solid rgba(255, 255, 255, 0.08)",
                        color: "#fff",
                        cursor: "pointer",
                        textAlign: "left",
                        transition: "all 0.2s ease"
                      }}
                    >
                      <img src={acc.avatar} alt={acc.name} style={{ width: "36px", height: "36px", borderRadius: "50%", objectFit: "cover" }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: "0.88rem", fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{acc.name}</div>
                        <div style={{ fontSize: "0.72rem", color: "#94a3b8" }}>{acc.title}</div>
                        <div style={{ fontSize: "0.68rem", color: "#34d399", marginTop: "2px" }}>ID: {acc.uid}</div>
                      </div>
                      {isCurrent && <CheckCircle2 size={16} color="#34d399" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Section 3: Students */}
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
                <GraduationCap size={16} color="#fbbf24" />
                <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "#fbbf24", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Enrolled Students
                </span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                {studentAccounts.map((acc) => {
                  const isCurrent = user?.uid === acc.uid;
                  return (
                    <button
                      key={acc.uid}
                      onClick={() => handleSelectAccount(acc)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        padding: "12px",
                        borderRadius: "12px",
                        background: isCurrent ? "rgba(245, 158, 11, 0.18)" : "rgba(255, 255, 255, 0.03)",
                        border: isCurrent ? "1px solid #f59e0b" : "1px solid rgba(255, 255, 255, 0.08)",
                        color: "#fff",
                        cursor: "pointer",
                        textAlign: "left",
                        transition: "all 0.2s ease"
                      }}
                    >
                      <img src={acc.avatar} alt={acc.name} style={{ width: "36px", height: "36px", borderRadius: "50%", objectFit: "cover" }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: "0.88rem", fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{acc.name}</div>
                        <div style={{ fontSize: "0.72rem", color: "#94a3b8" }}>{acc.courseTitle}</div>
                        <div style={{ fontSize: "0.68rem", color: "#fbbf24", marginTop: "2px" }}>Roll: {acc.studentId}</div>
                      </div>
                      {isCurrent && <CheckCircle2 size={16} color="#fbbf24" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

