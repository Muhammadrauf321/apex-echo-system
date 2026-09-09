import React, { useState, useEffect } from "react";
import { getCurrentUser, subscribeToAuth, logout, loginWithEmail } from "./auth.js";
import { ROLES, ROLE_LABELS } from "./constants.js";
import { 
  Globe, 
  MessageSquare, 
  LayoutDashboard, 
  LogOut,
  User,
  X,
  Lock
} from "lucide-react";

export default function EcosystemNav({ currentApp = "website" }) {
  const [user, setUser] = useState(getCurrentUser());
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleLogout = async () => {
    await logout();
    setUser(null);
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginError("");
    setIsSubmitting(true);
    const res = await loginWithEmail(loginEmail, loginPassword);
    setIsSubmitting(false);
    if (res.success) {
      setShowLoginModal(false);
      setLoginEmail("");
      setLoginPassword("");
    } else {
      setLoginError(res.error || "Authentication failed. Please check credentials.");
    }
  };

  const getRoleBadge = (role) => {
    if (role === ROLES.DIRECTOR || role === ROLES.MANAGER) {
      return { bg: "rgba(99, 102, 241, 0.2)", color: "#a5b4fc", border: "rgba(99, 102, 241, 0.4)", label: "ADMIN" };
    }
    if (role === ROLES.INSTRUCTOR) {
      return { bg: "rgba(16, 185, 129, 0.2)", color: "#34d399", border: "rgba(16, 185, 129, 0.4)", label: "TEACHER" };
    }
    return { bg: "rgba(245, 158, 11, 0.2)", color: "#fbbf24", border: "rgba(245, 158, 11, 0.4)", label: "STUDENT" };
  };

  const badge = user ? getRoleBadge(user.role) : null;

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

        {/* User Identity Display & Logout — NO ROLE TOGGLES OR SWITCHERS */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {user ? (
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  background: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid rgba(255, 255, 255, 0.12)",
                  borderRadius: "12px",
                  padding: "6px 14px"
                }}
              >
                <img
                  src={user.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"}
                  alt={user.name}
                  style={{ width: "30px", height: "30px", borderRadius: "50%", objectFit: "cover" }}
                />
                <div>
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
                      letterSpacing: "0.03em"
                    }}>
                      {badge.label}
                    </span>
                  </div>
                  <div style={{ fontSize: "0.72rem", color: "#94a3b8" }}>
                    {user.email}
                  </div>
                </div>
              </div>

              <button
                onClick={handleLogout}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "8px 12px",
                  borderRadius: "10px",
                  border: "1px solid rgba(239, 68, 68, 0.3)",
                  background: "rgba(239, 68, 68, 0.1)",
                  color: "#f87171",
                  fontSize: "0.82rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.2s ease"
                }}
                title="Sign Out of Account"
              >
                <LogOut size={15} />
                <span>Sign Out</span>
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowLoginModal(true)}
              className="btn-primary"
              style={{ fontSize: "0.88rem", padding: "8px 18px", display: "flex", alignItems: "center", gap: "6px" }}
            >
              <User size={16} />
              <span>Log In</span>
            </button>
          )}
        </div>
      </div>

      {/* Clean Sign In Modal (Only shown when logged out) */}
      {showLoginModal && (
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
            maxWidth: "420px",
            padding: "28px",
            boxShadow: "0 25px 60px rgba(0,0,0,0.8)"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h3 style={{ fontSize: "1.2rem", fontWeight: 800, color: "#ffffff" }}>
                Sign In to Apex Ecosystem
              </h3>
              <button
                onClick={() => setShowLoginModal(false)}
                style={{ background: "transparent", border: "none", color: "#94a3b8", cursor: "pointer" }}
              >
                <X size={20} />
              </button>
            </div>

            {loginError && (
              <div style={{ padding: "10px 12px", background: "rgba(239, 68, 68, 0.15)", border: "1px solid rgba(239, 68, 68, 0.3)", borderRadius: "8px", color: "#f87171", fontSize: "0.82rem", marginBottom: "16px" }}>
                {loginError}
              </div>
            )}

            <form onSubmit={handleLoginSubmit}>
              <div style={{ marginBottom: "14px" }}>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, marginBottom: "6px", color: "#cbd5e1" }}>
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="name@apex.edu or gmail"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  style={{ width: "100%", padding: "10px", background: "#060911", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "8px", color: "#ffffff" }}
                />
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, marginBottom: "6px", color: "#cbd5e1" }}>
                  Password
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  style={{ width: "100%", padding: "10px", background: "#060911", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "8px", color: "#ffffff" }}
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary"
                style={{ width: "100%", padding: "11px", fontWeight: 700 }}
              >
                {isSubmitting ? "Verifying..." : "Sign In"}
              </button>
            </form>
          </div>
        </div>
      )}
    </header>
  );
}
