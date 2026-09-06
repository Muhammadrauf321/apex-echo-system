import React, { useState, useEffect } from "react";
import { getCurrentUser, switchDemoUser, subscribeToAuth, logout } from "./auth.js";
import { DEMO_USERS } from "./seedData.js";
import { 
  Globe, 
  MessageSquare, 
  LayoutDashboard, 
  UserCheck, 
  ChevronDown, 
  Sparkles,
  ExternalLink,
  ShieldAlert
} from "lucide-react";

export default function EcosystemNav({ currentApp = "website" }) {
  const [user, setUser] = useState(getCurrentUser());
  const [dropdownOpen, setDropdownOpen] = useState(false);

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

        {/* User Profile & Demo Role Switcher */}
        <div style={{ position: "relative" }}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              background: "rgba(255, 255, 255, 0.05)",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              borderRadius: "12px",
              padding: "6px 14px",
              color: "#ffffff",
              cursor: "pointer",
              transition: "all 0.2s ease"
            }}
          >
            <img
              src={user?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"}
              alt={user?.name}
              style={{ width: "30px", height: "30px", borderRadius: "50%", objectFit: "cover" }}
            />
            <div style={{ textAlign: "left" }}>
              <div style={{ fontSize: "0.85rem", fontWeight: 700 }}>{user?.name || "Select Role"}</div>
              <div style={{ fontSize: "0.7rem", color: "#38bdf8", textTransform: "capitalize" }}>
                {user?.role ? `${user.role.replace("_", " ")}` : "Guest"}
              </div>
            </div>
            <ChevronDown size={14} color="#94a3b8" />
          </button>

          {dropdownOpen && (
            <div
              style={{
                position: "absolute",
                top: "calc(100% + 10px)",
                right: 0,
                width: "280px",
                background: "#0f172a",
                border: "1px solid rgba(255, 255, 255, 0.12)",
                borderRadius: "14px",
                boxShadow: "0 20px 40px rgba(0,0,0,0.6)",
                padding: "12px",
                zIndex: 9999
              }}
            >
              <div style={{ padding: "6px 8px 10px", borderBottom: "1px solid rgba(255, 255, 255, 0.08)" }}>
                <div style={{ fontSize: "0.72rem", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 700 }}>
                  Switch Demo Persona / Role
                </div>
                <div style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "2px" }}>
                  Test all features without relogging
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "4px", marginTop: "8px" }}>
                {DEMO_USERS.map((demo) => {
                  const isCurrent = user?.uid === demo.uid;
                  return (
                    <button
                      key={demo.uid}
                      onClick={() => {
                        switchDemoUser(demo.uid);
                        setDropdownOpen(false);
                      }}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        padding: "8px 10px",
                        borderRadius: "8px",
                        border: "none",
                        background: isCurrent ? "rgba(99, 102, 241, 0.2)" : "transparent",
                        color: isCurrent ? "#a5b4fc" : "#cbd5e1",
                        cursor: "pointer",
                        textAlign: "left",
                        width: "100%",
                        transition: "background 0.15s"
                      }}
                    >
                      <img
                        src={demo.avatar}
                        alt={demo.name}
                        style={{ width: "26px", height: "26px", borderRadius: "50%" }}
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: "0.82rem", fontWeight: 600 }}>{demo.name}</div>
                        <div style={{ fontSize: "0.7rem", color: "#64748b" }}>{demo.title}</div>
                      </div>
                      {isCurrent && <UserCheck size={14} color="#38bdf8" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
