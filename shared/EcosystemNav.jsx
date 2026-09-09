import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { 
  getCurrentUser, 
  subscribeToAuth, 
  logout, 
  loginWithEmail,
  getInvitationByToken,
  getInvitationByCodeAndEmail,
  activateAccountWithPassword,
  getDispatchedEmails,
  saveDispatchedEmails
} from "./auth.js";
import { ROLES, ROLE_LABELS } from "./constants.js";
import confetti from "canvas-confetti";
import { 
  Globe, 
  MessageSquare, 
  LayoutDashboard, 
  LogOut,
  User,
  X,
  Lock,
  Mail,
  Key,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Copy,
  Check,
  ShieldCheck,
  Sparkles,
  Users,
  Settings,
  Send,
  RefreshCw
} from "lucide-react";
import {
  getEmailJSConfig,
  saveEmailJSConfig,
  sendActivationEmail,
  generateGmailComposeUrl
} from "./emailService.js";
import { sendFirebaseActivationEmail } from "./firebaseEmailService.js";

// Universal App URL Resolver: Works seamlessly on both local development and production web URLs
export function getAppUrl(appId) {
  if (typeof window === "undefined") {
    return appId === "website" ? "/" : `/${appId}/`;
  }
  const isLocal = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
  if (isLocal) {
    if (appId === "website") return "http://localhost:5173";
    if (appId === "messaging") return "http://localhost:5174";
    if (appId === "management") return "http://localhost:5175";
  }
  // Production Web URL (e.g. apex-education-forum.web.app or custom domain)
  if (appId === "website") return "/";
  if (appId === "messaging") return "/connect/";
  if (appId === "management") return "/lms/";
  return "/";
}

export function openApexLoginModal() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("apex_open_login"));
  }
}

export default function EcosystemNav({ currentApp = "website" }) {
  const [user, setUser] = useState(getCurrentUser());
  
  // Login Modal State
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Activation Modal State
  const [showActivateModal, setShowActivateModal] = useState(false);
  const [activateToken, setActivateToken] = useState("");
  const [activateEmail, setActivateEmail] = useState("");
  const [activateTempCode, setActivateTempCode] = useState("");
  const [activatePermanentPassword, setActivatePermanentPassword] = useState("");
  const [activateConfirmPassword, setActivateConfirmPassword] = useState("");
  const [activateError, setActivateError] = useState("");
  const [activateSuccess, setActivateSuccess] = useState(false);
  const [targetInvitation, setTargetInvitation] = useState(null);
  const [isActivating, setIsActivating] = useState(false);

  // Outbox / Dispatched Mail Drawer
  const [showOutboxDrawer, setShowOutboxDrawer] = useState(false);
  const [dispatchedEmails, setDispatchedEmails] = useState(getDispatchedEmails());
  const [activeToastEmail, setActiveToastEmail] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  // EmailJS Configuration State
  const [showEmailConfigModal, setShowEmailConfigModal] = useState(false);
  const [emailConfig, setEmailConfig] = useState(getEmailJSConfig());
  const [isSendingLiveEmail, setIsSendingLiveEmail] = useState(null);
  const [emailConfigSaveMessage, setEmailConfigSaveMessage] = useState("");

  // Sync Auth and check URL activation token on mount
  useEffect(() => {
    const unsubAuth = subscribeToAuth((updatedUser) => {
      setUser(updatedUser);
    });

    // Listen for custom login trigger from locked screens
    const handleOpenLogin = () => {
      setShowLoginModal(true);
    };
    window.addEventListener("apex_open_login", handleOpenLogin);

    // Check URL query parameters for ?activate=TOKEN
    const params = new URLSearchParams(window.location.search);
    const token = params.get("activate");
    if (token) {
      handleOpenActivationByToken(token);
    }

    // Listen for dispatched emails
    const handleEmailDispatched = (e) => {
      const email = e.detail;
      setDispatchedEmails(getDispatchedEmails());
      setActiveToastEmail(email);
    };
    window.addEventListener("apex_email_dispatched", handleEmailDispatched);

    const handleEmailsUpdated = (e) => {
      setDispatchedEmails(e.detail || getDispatchedEmails());
    };
    window.addEventListener("apex_emails_changed", handleEmailsUpdated);

    const handleConfigUpdated = (e) => {
      setEmailConfig(e.detail || getEmailJSConfig());
    };
    window.addEventListener("apex_emailjs_config_changed", handleConfigUpdated);

    return () => {
      unsubAuth();
      window.removeEventListener("apex_open_login", handleOpenLogin);
      window.removeEventListener("apex_email_dispatched", handleEmailDispatched);
      window.removeEventListener("apex_emails_changed", handleEmailsUpdated);
      window.removeEventListener("apex_emailjs_config_changed", handleConfigUpdated);
    };
  }, []);

  const handleSaveEmailConfig = (e) => {
    e.preventDefault();
    saveEmailJSConfig(emailConfig);
    setEmailConfigSaveMessage("EmailJS configuration saved successfully!");
    setTimeout(() => {
      setEmailConfigSaveMessage("");
      setShowEmailConfigModal(false);
    }, 1500);
  };

  const handleSendFirebaseEmail = async (mail) => {
    setIsSendingLiveEmail(`fb_${mail.id}`);
    const res = await sendFirebaseActivationEmail({
      recipientEmail: mail.recipientEmail,
      recipientName: mail.recipientName,
      role: mail.role,
      activationUrl: mail.activationUrl,
      tempCode: mail.tempCode
    });
    setIsSendingLiveEmail(null);

    const current = getDispatchedEmails();
    const updated = current.map(m => {
      if (m.id === mail.id) {
        return {
          ...m,
          deliveryStatus: res.success ? "delivered_firebase" : "failed_firebase",
          deliveryError: res.error || null,
          deliveryProvider: "Firebase"
        };
      }
      return m;
    });
    saveDispatchedEmails(updated);
    setDispatchedEmails(updated);

    if (res.success) {
      confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
      alert(`✓ Official Activation Email sent directly via Google Firebase to ${mail.recipientEmail}!`);
    } else {
      alert(`Firebase Notice: ${res.error || "Could not dispatch via Firebase. You can use 'Open in Gmail' as a 1-click fallback."}`);
    }
  };

  const handleSendLiveEmail = async (mail) => {
    setIsSendingLiveEmail(mail.id);
    const res = await sendActivationEmail({
      recipientEmail: mail.recipientEmail,
      recipientName: mail.recipientName,
      role: mail.role,
      activationUrl: mail.activationUrl,
      tempCode: mail.tempCode
    });
    setIsSendingLiveEmail(null);

    const current = getDispatchedEmails();
    const updated = current.map(m => {
      if (m.id === mail.id) {
        return {
          ...m,
          deliveryStatus: res.success ? "delivered_emailjs" : "failed_emailjs",
          deliveryError: res.error || null
        };
      }
      return m;
    });
    saveDispatchedEmails(updated);
    setDispatchedEmails(updated);

    if (res.success) {
      confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
    } else {
      alert(`EmailJS Notice: ${res.error || "Please configure your EmailJS credentials."}`);
    }
  };

  // Auto-dismiss email toast
  useEffect(() => {
    if (activeToastEmail) {
      const timer = setTimeout(() => {
        setActiveToastEmail(null);
      }, 12000);
      return () => clearTimeout(timer);
    }
  }, [activeToastEmail]);

  // Open activation by token
  const handleOpenActivationByToken = (token) => {
    const inv = getInvitationByToken(token);
    if (inv) {
      setTargetInvitation(inv);
      setActivateToken(token);
      setActivateEmail(inv.email);
      setActivateTempCode(inv.tempCode);
      setActivateError("");
      setShowActivateModal(true);
    } else {
      setActivateError("Activation link is invalid or has expired.");
      setShowActivateModal(true);
    }
  };

  const apps = [
    {
      id: "website",
      name: "Public Portal",
      desc: "Courses & Admissions",
      icon: Globe,
      url: getAppUrl("website")
    },
    {
      id: "messaging",
      name: "Apex Connect",
      desc: "Real-time Chat & Voice",
      icon: MessageSquare,
      url: getAppUrl("messaging")
    },
    {
      id: "management",
      name: "Management LMS",
      desc: "Batches, Fees & Admin",
      icon: LayoutDashboard,
      url: getAppUrl("management")
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
    } else if (res.requiresActivation) {
      // First-time login detected: redirect immediately to activation modal
      setShowLoginModal(false);
      if (res.invitation) {
        setTargetInvitation(res.invitation);
        setActivateToken(res.invitation.token);
        setActivateEmail(res.invitation.email);
        setActivateTempCode(res.invitation.tempCode);
      } else {
        setActivateEmail(loginEmail);
      }
      setActivateError(res.error || "Please set your permanent password to activate your ID.");
      setShowActivateModal(true);
    } else {
      setLoginError(res.error || "Authentication failed. Please check credentials.");
    }
  };

  // Submit Activation: User sets permanent password
  const handleActivateSubmit = async (e) => {
    e.preventDefault();
    setActivateError("");

    if (activatePermanentPassword !== activateConfirmPassword) {
      setActivateError("Passwords do not match. Please re-enter.");
      return;
    }
    if (activatePermanentPassword.length < 6) {
      setActivateError("Password must be at least 6 characters long.");
      return;
    }

    setIsActivating(true);
    const res = await activateAccountWithPassword({
      token: activateToken,
      email: activateEmail,
      tempCode: activateTempCode,
      permanentPassword: activatePermanentPassword
    });
    setIsActivating(false);

    if (res.success) {
      setActivateSuccess(true);
      confetti({ particleCount: 150, spread: 90, origin: { y: 0.5 } });

      // Clean up URL if ?activate was present
      if (window.history.replaceState && window.location.search.includes("activate")) {
        const cleanUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
        window.history.replaceState({ path: cleanUrl }, "", cleanUrl);
      }

      setTimeout(() => {
        setShowActivateModal(false);
        setActivateSuccess(false);
        setActivatePermanentPassword("");
        setActivateConfirmPassword("");
      }, 2000);
    } else {
      setActivateError(res.error || "Failed to activate account. Please check your token or temporary code.");
    }
  };

  const handleQuickLogin = async (email, password) => {
    setIsSubmitting(true);
    setLoginError("");
    const res = await loginWithEmail(email, password);
    setIsSubmitting(false);
    if (res.success) {
      setShowLoginModal(false);
    } else {
      setLoginError(res.error || "Failed to sign in.");
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

  const renderPortal = (children) => {
    if (typeof document === "undefined") return null;
    return createPortal(children, document.body);
  };

  return (
    <>
      <header className="ecosystem-nav">
      <div className="nav-container">
        {/* Brand */}
        <a href={getAppUrl("website")} className="nav-brand">
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

        {/* Right Section: Simulated Mail Dispatcher Drawer Toggle + User Identity */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          
          {/* Simulated Email Outbox Button */}
          <button
            onClick={() => setShowOutboxDrawer(true)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "7px 12px",
              borderRadius: "10px",
              background: "rgba(56, 189, 248, 0.1)",
              border: "1px solid rgba(56, 189, 248, 0.3)",
              color: "#38bdf8",
              fontSize: "0.82rem",
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.2s ease"
            }}
            title="View Dispatched Activation Emails (Gmail Simulation)"
          >
            <Mail size={15} />
            <span>Dispatched Emails</span>
            {dispatchedEmails.length > 0 && (
              <span style={{
                background: "#0284c7",
                color: "#ffffff",
                borderRadius: "10px",
                padding: "1px 6px",
                fontSize: "0.72rem",
                fontWeight: 800
              }}>
                {dispatchedEmails.length}
              </span>
            )}
          </button>

          {/* User Identity Display & Logout — Strictly single logged-in identity */}
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
    </header>

      {/* ======================================================== */}
      {/* 1. FLOATING TOAST: DISPATCHED ACTIVATION EMAIL           */}
      {/* ======================================================== */}
      {activeToastEmail && renderPortal(
        <div style={{
          position: "fixed",
          bottom: "24px",
          right: "24px",
          background: "#0c1322",
          border: "1px solid #38bdf8",
          boxShadow: "0 12px 36px rgba(0, 0, 0, 0.7)",
          borderRadius: "14px",
          padding: "16px 20px",
          maxWidth: "420px",
          zIndex: 10001,
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          animation: "slideIn 0.3s ease-out"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Mail size={18} color="#38bdf8" />
              <strong style={{ fontSize: "0.9rem", color: "#ffffff" }}>Activation Email Dispatched</strong>
            </div>
            <button
              onClick={() => setActiveToastEmail(null)}
              style={{ background: "transparent", border: "none", color: "#94a3b8", cursor: "pointer" }}
            >
              <X size={16} />
            </button>
          </div>

          <div style={{ fontSize: "0.82rem", color: "#cbd5e1", lineHeight: 1.4 }}>
            Sent to: <strong style={{ color: "#38bdf8" }}>{activeToastEmail.recipientEmail}</strong> ({activeToastEmail.role})
            <div style={{ marginTop: "4px", color: "#94a3b8", fontSize: "0.78rem" }}>
              Temp Security Code: <strong style={{ color: "#facc15" }}>{activeToastEmail.tempCode}</strong>
            </div>
          </div>

          <div style={{ display: "flex", gap: "8px", marginTop: "4px", flexWrap: "wrap" }}>
            <a
              href={activeToastEmail.gmailComposeUrl || generateGmailComposeUrl(activeToastEmail)}
              target="_blank"
              rel="noreferrer"
              style={{
                flex: 1,
                padding: "7px 12px",
                fontSize: "0.8rem",
                background: "linear-gradient(135deg, #ea4335, #c5221f)",
                color: "#ffffff",
                borderRadius: "8px",
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
                fontWeight: 700
              }}
            >
              <Send size={13} />
              <span>Send via Gmail</span>
            </a>
            <button
              onClick={() => {
                setShowOutboxDrawer(true);
                setActiveToastEmail(null);
              }}
              className="btn-secondary"
              style={{ padding: "7px 12px", fontSize: "0.8rem" }}
            >
              View Log
            </button>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 2. DRAWER: SIMULATED GMAIL OUTBOX                        */}
      {/* ======================================================== */}
      {showOutboxDrawer && renderPortal(
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: "100vw",
          height: "100vh",
          background: "rgba(3, 7, 18, 0.75)",
          backdropFilter: "blur(6px)",
          WebkitBackdropFilter: "blur(6px)",
          zIndex: 999999,
          display: "flex",
          justifyContent: "flex-end"
        }}>
          <div style={{
            width: "100%",
            maxWidth: "520px",
            background: "#0b0f19",
            borderLeft: "1px solid rgba(255, 255, 255, 0.12)",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            boxShadow: "-10px 0 30px rgba(0,0,0,0.8)"
          }}>
            {/* Header */}
            <div style={{ padding: "20px 24px", borderBottom: "1px solid rgba(255,255,255,0.08)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <Mail size={18} color="#38bdf8" />
                  <h3 style={{ fontSize: "1.15rem", fontWeight: 800, color: "#ffffff" }}>
                    Dispatched Invitations & Inbox Delivery
                  </h3>
                </div>
                <div style={{ fontSize: "0.78rem", color: "#94a3b8", marginTop: "2px" }}>
                  Automated EmailJS sending & Gmail dispatch log
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <button
                  onClick={() => setShowEmailConfigModal(true)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    padding: "6px 10px",
                    borderRadius: "8px",
                    background: "rgba(99, 102, 241, 0.15)",
                    border: "1px solid rgba(99, 102, 241, 0.3)",
                    color: "#a5b4fc",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    cursor: "pointer"
                  }}
                  title="Configure EmailJS Keys for Automatic Inbox Sending"
                >
                  <Settings size={14} />
                  <span>EmailJS Config</span>
                </button>
                <button
                  onClick={() => setShowOutboxDrawer(false)}
                  style={{ background: "transparent", border: "none", color: "#94a3b8", cursor: "pointer" }}
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Direct Delivery Engine Banner */}
            <div style={{ padding: "12px 24px 0 24px" }}>
              <div style={{
                background: "rgba(245, 158, 11, 0.1)",
                border: "1px solid rgba(245, 158, 11, 0.3)",
                borderRadius: "10px",
                padding: "10px 14px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "10px"
              }}>
                <div>
                  <div style={{ fontSize: "0.82rem", fontWeight: 700, color: "#fbbf24", display: "flex", alignItems: "center", gap: "6px" }}>
                    <span>🔥 Google Firebase Direct Delivery Active</span>
                  </div>
                  <div style={{ fontSize: "0.72rem", color: "#94a3b8" }}>
                    Official invitations are dispatched via Google Firebase Authentication servers directly to recipient Gmail inboxes.
                  </div>
                </div>
                <button
                  onClick={() => setShowEmailConfigModal(true)}
                  className="btn-secondary"
                  style={{ padding: "5px 10px", fontSize: "0.72rem", whiteSpace: "nowrap" }}
                >
                  EmailJS Settings
                </button>
              </div>
            </div>

            {/* Body */}
            <div style={{ flex: 1, overflowY: "auto", padding: "16px 24px", display: "flex", flexDirection: "column", gap: "16px" }}>
              {dispatchedEmails.length === 0 ? (
                <div style={{ textAlign: "center", color: "#64748b", padding: "60px 20px" }}>
                  <Mail size={42} style={{ margin: "0 auto 12px", opacity: 0.4 }} />
                  <div style={{ fontSize: "1rem", fontWeight: 700 }}>No Emails Dispatched Yet</div>
                  <div style={{ fontSize: "0.82rem", marginTop: "4px" }}>
                    When Admin registers a teacher or enrolls a student with their Gmail, the activation invitation will appear here.
                  </div>
                </div>
              ) : (
                dispatchedEmails.map((mail) => {
                  const isFirebase = mail.deliveryStatus === "delivered_firebase" || mail.deliveryProvider === "Firebase";
                  const isEmailJS = mail.deliveryStatus === "delivered_emailjs" || mail.deliveryProvider === "EmailJS";
                  const isDelivered = isFirebase || isEmailJS;
                  const isFailed = mail.deliveryStatus === "failed" || mail.deliveryStatus === "failed_emailjs" || mail.deliveryStatus === "failed_firebase";
                  const composeLink = mail.gmailComposeUrl || generateGmailComposeUrl(mail);

                  return (
                    <div
                      key={mail.id}
                      style={{
                        background: "rgba(255, 255, 255, 0.03)",
                        border: "1px solid rgba(255, 255, 255, 0.08)",
                        borderRadius: "12px",
                        padding: "16px"
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: "0.92rem", color: "#ffffff", display: "flex", alignItems: "center", gap: "8px" }}>
                            <span>To: {mail.recipientName} ({mail.recipientEmail})</span>
                          </div>
                          <div style={{ fontSize: "0.76rem", color: "#38bdf8", marginTop: "2px" }}>
                            Role: {mail.role} • Subject: {mail.subject}
                          </div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <span style={{ fontSize: "0.72rem", color: "#94a3b8", display: "block" }}>
                            {mail.timestamp}
                          </span>
                          <span style={{
                            fontSize: "0.68rem",
                            padding: "2px 6px",
                            borderRadius: "4px",
                            fontWeight: 700,
                            display: "inline-block",
                            marginTop: "3px",
                            background: isFirebase ? "rgba(245, 158, 11, 0.15)" : isEmailJS ? "rgba(16, 185, 129, 0.15)" : isFailed ? "rgba(239, 68, 68, 0.15)" : "rgba(148, 163, 184, 0.15)",
                            color: isFirebase ? "#fbbf24" : isEmailJS ? "#34d399" : isFailed ? "#f87171" : "#94a3b8",
                            border: `1px solid ${isFirebase ? "rgba(245, 158, 11, 0.3)" : isEmailJS ? "rgba(16, 185, 129, 0.3)" : isFailed ? "rgba(239, 68, 68, 0.3)" : "rgba(148, 163, 184, 0.3)"}`
                          }}>
                            {isFirebase ? "✓ Sent (Firebase)" : isEmailJS ? "✓ Sent (EmailJS)" : isFailed ? "✕ Delivery Failed" : "● Stored in Portal"}
                          </span>
                        </div>
                      </div>

                      <div style={{
                        background: "rgba(0, 0, 0, 0.4)",
                        borderRadius: "8px",
                        padding: "12px",
                        margin: "10px 0",
                        fontSize: "0.82rem",
                        color: "#cbd5e1",
                        border: "1px dashed rgba(255, 255, 255, 0.15)"
                      }}>
                        <div>{mail.bodyPreview}</div>
                        <div style={{ marginTop: "8px", display: "flex", alignItems: "center", gap: "8px" }}>
                          <span style={{ color: "#94a3b8" }}>Temporary Security Code:</span>
                          <code style={{ background: "rgba(234, 179, 8, 0.2)", color: "#facc15", padding: "2px 8px", borderRadius: "4px", fontWeight: 800 }}>
                            {mail.tempCode}
                          </code>
                        </div>
                      </div>

                      <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end", flexWrap: "wrap", alignItems: "center" }}>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(mail.activationUrl);
                            setCopiedId(mail.id);
                            setTimeout(() => setCopiedId(null), 2000);
                          }}
                          className="btn-secondary"
                          style={{ padding: "6px 10px", fontSize: "0.78rem", display: "flex", alignItems: "center", gap: "4px" }}
                        >
                          {copiedId === mail.id ? <Check size={13} color="#10b981" /> : <Copy size={13} />}
                          <span>{copiedId === mail.id ? "Copied" : "Copy Link"}</span>
                        </button>

                        <button
                          onClick={() => handleSendFirebaseEmail(mail)}
                          disabled={isSendingLiveEmail === `fb_${mail.id}`}
                          style={{
                            padding: "6px 12px",
                            fontSize: "0.78rem",
                            display: "flex",
                            alignItems: "center",
                            gap: "5px",
                            borderRadius: "8px",
                            background: "rgba(245, 158, 11, 0.15)",
                            border: "1px solid rgba(245, 158, 11, 0.35)",
                            color: "#fbbf24",
                            fontWeight: 600,
                            cursor: "pointer"
                          }}
                          title="Send directly from Google Firebase servers"
                        >
                          <RefreshCw size={13} className={isSendingLiveEmail === `fb_${mail.id}` ? "animate-spin" : ""} />
                          <span>{isSendingLiveEmail === `fb_${mail.id}` ? "Sending..." : "Send via Firebase"}</span>
                        </button>

                        <a
                          href={composeLink}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            padding: "6px 12px",
                            fontSize: "0.78rem",
                            background: "rgba(234, 67, 53, 0.15)",
                            border: "1px solid rgba(234, 67, 53, 0.4)",
                            color: "#f87171",
                            borderRadius: "8px",
                            textDecoration: "none",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "5px",
                            fontWeight: 600
                          }}
                          title="Open Gmail Web compose with pre-filled invitation"
                        >
                          <Send size={13} />
                          <span>Open in Gmail</span>
                        </a>

                        <button
                          onClick={() => handleSendLiveEmail(mail)}
                          disabled={isSendingLiveEmail === mail.id}
                          className="btn-primary"
                          style={{ padding: "6px 12px", fontSize: "0.78rem", display: "flex", alignItems: "center", gap: "5px" }}
                          title="Send directly to real inbox via EmailJS"
                        >
                          <RefreshCw size={13} className={isSendingLiveEmail === mail.id ? "animate-spin" : ""} />
                          <span>{isSendingLiveEmail === mail.id ? "Sending..." : "Send via EmailJS"}</span>
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 3. MODAL: FIRST-TIME ACCOUNT ACTIVATION & PASSWORD SETUP  */}
      {/* ======================================================== */}
      {showActivateModal && renderPortal(
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: "100vw",
          height: "100vh",
          background: "rgba(3, 7, 18, 0.9)",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 999999,
          padding: "20px",
          boxSizing: "border-box",
          overflowY: "auto"
        }}>
          <div style={{
            background: "#0b0f19",
            border: "1px solid rgba(56, 189, 248, 0.3)",
            borderRadius: "20px",
            width: "100%",
            maxWidth: "460px",
            padding: "32px",
            boxShadow: "0 25px 70px rgba(0,0,0,0.9)",
            maxHeight: "calc(100vh - 40px)",
            overflowY: "auto",
            margin: "auto",
            position: "relative"
          }}>
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "rgba(56, 189, 248, 0.15)", color: "#38bdf8", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: "1.25rem", fontWeight: 800, color: "#ffffff" }}>
                    Activate Apex Portal ID
                  </h3>
                  <div style={{ fontSize: "0.78rem", color: "#94a3b8" }}>
                    Mandatory First-Time Security Setup
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowActivateModal(false)}
                style={{ background: "transparent", border: "none", color: "#94a3b8", cursor: "pointer" }}
              >
                <X size={20} />
              </button>
            </div>

            {activateSuccess ? (
              <div style={{ textAlign: "center", padding: "30px 10px" }}>
                <CheckCircle2 size={54} color="#10b981" style={{ margin: "0 auto 16px" }} />
                <h4 style={{ fontSize: "1.3rem", fontWeight: 800, color: "#ffffff", marginBottom: "8px" }}>
                  Account Activated Successfully!
                </h4>
                <p style={{ color: "#94a3b8", fontSize: "0.88rem" }}>
                  Your permanent password has been set. You are now logged in and can access your portal across all Apex services.
                </p>
              </div>
            ) : (
              <form onSubmit={handleActivateSubmit}>
                {activateError && (
                  <div style={{
                    padding: "10px 14px",
                    background: "rgba(239, 68, 68, 0.15)",
                    border: "1px solid rgba(239, 68, 68, 0.3)",
                    borderRadius: "8px",
                    color: "#f87171",
                    fontSize: "0.82rem",
                    marginBottom: "16px",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px"
                  }}>
                    <AlertCircle size={16} />
                    <span>{activateError}</span>
                  </div>
                )}

                {/* Candidate Information banner */}
                {targetInvitation && (
                  <div style={{
                    background: "rgba(255, 255, 255, 0.03)",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    borderRadius: "10px",
                    padding: "12px 14px",
                    marginBottom: "18px"
                  }}>
                    <div style={{ fontSize: "0.88rem", fontWeight: 700, color: "#ffffff" }}>
                      {targetInvitation.name}
                    </div>
                    <div style={{ fontSize: "0.78rem", color: "#38bdf8", marginTop: "2px" }}>
                      {targetInvitation.email} • <span style={{ textTransform: "uppercase", fontWeight: 800 }}>{targetInvitation.role}</span>
                    </div>
                  </div>
                )}

                <div style={{ marginBottom: "14px" }}>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, marginBottom: "6px", color: "#cbd5e1" }}>
                    Registered Gmail Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={activateEmail}
                    onChange={(e) => setActivateEmail(e.target.value)}
                    placeholder="e.g. user@gmail.com"
                    style={{ width: "100%", padding: "10px 12px", background: "#060911", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "8px", color: "#ffffff" }}
                  />
                </div>

                <div style={{ marginBottom: "14px" }}>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, marginBottom: "6px", color: "#cbd5e1" }}>
                    Temporary Security Code (from Email) *
                  </label>
                  <input
                    type="text"
                    required
                    value={activateTempCode}
                    onChange={(e) => setActivateTempCode(e.target.value)}
                    placeholder="e.g. APEX-123456"
                    style={{ width: "100%", padding: "10px 12px", background: "#060911", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "8px", color: "#facc15", fontWeight: 700, letterSpacing: "0.05em" }}
                  />
                </div>

                <div style={{ marginBottom: "14px" }}>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, marginBottom: "6px", color: "#cbd5e1" }}>
                    Create Permanent Password * (Min 6 characters)
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={activatePermanentPassword}
                    onChange={(e) => setActivatePermanentPassword(e.target.value)}
                    placeholder="Create a strong password"
                    style={{ width: "100%", padding: "10px 12px", background: "#060911", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "8px", color: "#ffffff" }}
                  />
                </div>

                <div style={{ marginBottom: "22px" }}>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, marginBottom: "6px", color: "#cbd5e1" }}>
                    Confirm Permanent Password *
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={activateConfirmPassword}
                    onChange={(e) => setActivateConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                    style={{ width: "100%", padding: "10px 12px", background: "#060911", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "8px", color: "#ffffff" }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isActivating}
                  className="btn-primary"
                  style={{ width: "100%", padding: "12px", fontWeight: 700, fontSize: "0.95rem" }}
                >
                  {isActivating ? "Verifying & Activating..." : "Activate ID & Access Portal"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 4. MODAL: STANDARD SIGN IN                               */}
      {/* ======================================================== */}
      {showLoginModal && renderPortal(
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: "100vw",
          height: "100vh",
          background: "rgba(3, 7, 18, 0.85)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 999999,
          padding: "20px",
          boxSizing: "border-box",
          overflowY: "auto"
        }}>
          <div style={{
            background: "#0b0f19",
            border: "1px solid rgba(255, 255, 255, 0.12)",
            borderRadius: "18px",
            width: "100%",
            maxWidth: "430px",
            padding: "28px",
            boxShadow: "0 25px 60px rgba(0,0,0,0.9)",
            maxHeight: "calc(100vh - 40px)",
            overflowY: "auto",
            margin: "auto",
            position: "relative"
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

              <button
                type="button"
                onClick={() => {
                  setLoginEmail("muhammadraufbaloch6@gmail.com");
                  setLoginPassword("password123");
                }}
                style={{
                  marginTop: "12px",
                  width: "100%",
                  padding: "9px 12px",
                  borderRadius: "8px",
                  background: "rgba(99, 102, 241, 0.12)",
                  border: "1px dashed rgba(99, 102, 241, 0.4)",
                  color: "#a5b4fc",
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                  transition: "all 0.2s ease"
                }}
              >
                <ShieldCheck size={14} />
                <span>Fill Admin Credentials (Muhammad Rauf)</span>
              </button>
            </form>

            <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", marginTop: "20px", paddingTop: "14px", textAlign: "center", fontSize: "0.8rem", color: "#94a3b8" }}>
              Received an invitation email?{" "}
              <button
                type="button"
                onClick={() => {
                  setShowLoginModal(false);
                  setShowActivateModal(true);
                }}
                style={{ background: "transparent", border: "none", color: "#38bdf8", fontWeight: 700, cursor: "pointer" }}
              >
                Activate ID with Security Code
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 5. MODAL: EMAILJS CONFIGURATION (FOR REAL INBOX DELIVERY)*/}
      {/* ======================================================== */}
      {showEmailConfigModal && renderPortal(
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: "100vw",
          height: "100vh",
          background: "rgba(3, 7, 18, 0.85)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 999999,
          padding: "20px",
          boxSizing: "border-box",
          overflowY: "auto"
        }}>
          <div style={{
            background: "#0b0f19",
            border: "1px solid rgba(99, 102, 241, 0.3)",
            borderRadius: "18px",
            width: "100%",
            maxWidth: "480px",
            padding: "28px",
            boxShadow: "0 25px 60px rgba(0,0,0,0.9)",
            maxHeight: "calc(100vh - 40px)",
            overflowY: "auto",
            margin: "auto",
            position: "relative"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Settings size={20} color="#818cf8" />
                <h3 style={{ fontSize: "1.2rem", fontWeight: 800, color: "#ffffff" }}>
                  EmailJS Automated Delivery
                </h3>
              </div>
              <button
                onClick={() => setShowEmailConfigModal(false)}
                style={{ background: "transparent", border: "none", color: "#94a3b8", cursor: "pointer" }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{
              background: "rgba(99, 102, 241, 0.08)",
              border: "1px solid rgba(99, 102, 241, 0.25)",
              borderRadius: "10px",
              padding: "12px 14px",
              fontSize: "0.8rem",
              color: "#c7d2fe",
              lineHeight: 1.5,
              marginBottom: "18px"
            }}>
              Connect your free <a href="https://www.emailjs.com" target="_blank" rel="noreferrer" style={{ color: "#38bdf8", fontWeight: 700 }}>EmailJS</a> account to automatically dispatch activation links directly into faculty & student Gmail inboxes without opening mail clients.
            </div>

            {emailConfigSaveMessage && (
              <div style={{ padding: "10px 12px", background: "rgba(16, 185, 129, 0.15)", border: "1px solid rgba(16, 185, 129, 0.3)", borderRadius: "8px", color: "#34d399", fontSize: "0.82rem", marginBottom: "16px" }}>
                {emailConfigSaveMessage}
              </div>
            )}

            <form onSubmit={handleSaveEmailConfig}>
              <div style={{ marginBottom: "14px" }}>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, marginBottom: "6px", color: "#cbd5e1" }}>
                  EmailJS Service ID *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. service_xxxxxxx"
                  value={emailConfig.serviceId}
                  onChange={(e) => setEmailConfig({ ...emailConfig, serviceId: e.target.value })}
                  style={{ width: "100%", padding: "10px", background: "#060911", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "8px", color: "#ffffff", fontSize: "0.85rem" }}
                />
              </div>

              <div style={{ marginBottom: "14px" }}>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, marginBottom: "6px", color: "#cbd5e1" }}>
                  EmailJS Template ID *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. template_xxxxxxx"
                  value={emailConfig.templateId}
                  onChange={(e) => setEmailConfig({ ...emailConfig, templateId: e.target.value })}
                  style={{ width: "100%", padding: "10px", background: "#060911", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "8px", color: "#ffffff", fontSize: "0.85rem" }}
                />
                <div style={{ fontSize: "0.72rem", color: "#94a3b8", marginTop: "4px" }}>
                  Template variables provided: <code>{"{{to_name}}"}</code>, <code>{"{{to_email}}"}</code>, <code>{"{{temp_code}}"}</code>, <code>{"{{activation_url}}"}</code>, <code>{"{{role}}"}</code>
                </div>
              </div>

              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, marginBottom: "6px", color: "#cbd5e1" }}>
                  EmailJS Public Key *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. user_xxxxxxxxx or public key"
                  value={emailConfig.publicKey}
                  onChange={(e) => setEmailConfig({ ...emailConfig, publicKey: e.target.value })}
                  style={{ width: "100%", padding: "10px", background: "#060911", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "8px", color: "#ffffff", fontSize: "0.85rem" }}
                />
              </div>

              <div style={{ marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px" }}>
                <input
                  type="checkbox"
                  id="emailjs_enable"
                  checked={emailConfig.isEnabled}
                  onChange={(e) => setEmailConfig({ ...emailConfig, isEnabled: e.target.checked })}
                  style={{ width: "16px", height: "16px", accentColor: "#6366f1" }}
                />
                <label htmlFor="emailjs_enable" style={{ fontSize: "0.84rem", color: "#ffffff", cursor: "pointer", fontWeight: 600 }}>
                  Enable automatic background inbox delivery
                </label>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                <button
                  type="button"
                  onClick={() => setShowEmailConfigModal(false)}
                  className="btn-secondary"
                  style={{ padding: "9px 14px", fontSize: "0.84rem" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  style={{ padding: "9px 18px", fontSize: "0.84rem", fontWeight: 700 }}
                >
                  Save EmailJS Credentials
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
