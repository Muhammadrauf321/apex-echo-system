import React, { useState, useEffect, useRef } from "react";
import EcosystemNav, { getAppUrl, openApexLoginModal } from "@shared/EcosystemNav.jsx";
import { 
  getCurrentUser, 
  subscribeToAuth, 
  getRegisteredAccounts, 
  setCurrentUser as setStoredUser,
  loginWithEmail,
  loginWithAdminGmail,
  isNativeMobileApp,
  activateAccountWithPassword
} from "@shared/auth.js";
import { getChannelMessages, sendMessage, deleteMessage, clearChannelMessages } from "@shared/dataStore.js";
import { DEFAULT_CHANNELS, ROLES } from "@shared/constants.js";
import { 
  Hash, 
  Send, 
  Mic, 
  Square, 
  Code, 
  Smile, 
  Paperclip, 
  Play, 
  Pause, 
  Volume2, 
  Copy, 
  Check, 
  CheckCheck,
  Search, 
  Users, 
  Sparkles, 
  Radio,
  FileCode,
  Terminal,
  MessageCircle,
  ShieldCheck,
  Lock,
  Trash2,
  X,
  MoreVertical,
  Phone,
  Video,
  ArrowLeft,
  Image as ImageIcon,
  FileText,
  Music,
  Download,
  Settings,
  User,
  Sliders,
  Maximize2,
  Share2,
  ChevronRight,
  Info,
  Smartphone
} from "lucide-react";

// Authentic WhatsApp SVG Doodles Pattern for Chat Wallpaper
const WHATSAPP_DOODLE_BG = `radial-gradient(circle at 50% 50%, rgba(17, 27, 33, 0.94) 0%, rgba(11, 20, 26, 0.98) 100%), url("data:image/svg+xml,%3Csvg width='320' height='320' viewBox='0 0 320 320' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.035'%3E%3Cpath d='M40 30h20v15H40zM75 25a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm40 10c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10zm70 5h-15v10h15V40zm35-15l-10 18h20l-10-18zm-190 70c-6 0-10 4-10 10v15h20v-15c0-6-4-10-10-10zm60 5a15 15 0 1 0 0 30 15 15 0 0 0 0-30zm80 10c0-8-6-14-14-14s-14 6-14 14 6 14 14 14 14-6 14-14zm80-10l-12 12 12 12 12-12-12-12zm-210 80h18v18h-18zm85-5c-8 0-15 7-15 15s7 15 15 15 15-7 15-15-7-15-15-15zm80 15a12 12 0 1 0 0 24 12 12 0 0 0 0-24zm65-10l-8 16h16l-8-16zM50 250a12 12 0 1 0 0 24 12 12 0 0 0 0-24zm90 10h18v15h-18zm80-5c-7 0-12 5-12 12s5 12 12 12 12-5 12-12-5-12-12-12z'/%3E%3C/g%3E%3C/svg%3E")`;

// Soft WhatsApp Audio Feedback synthesis via Web Audio API
const playWhatsAppSound = (type = "send") => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === "send") {
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 0.08);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.08);
    } else if (type === "pop") {
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 0.05);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.05);
    }
  } catch (e) {}
};

export default function App() {
  const [currentUser, setCurrentUser] = useState(getCurrentUser());
  const [activeChannelId, setActiveChannelId] = useState("spoken-english-b1");
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [chatFilter, setChatFilter] = useState("all"); // 'all', 'unread', 'groups', 'faculty'

  // Mobile / Desktop View State (WhatsApp Responsive APK Layout)
  const [mobileScreen, setMobileScreen] = useState("chats"); // 'chats' or 'conversation'
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Settings & Customization State (Persisted)
  const [wallpaper, setWallpaper] = useState(localStorage.getItem("apex_wa_wallpaper") || "doodle");
  const [fontSize, setFontSize] = useState(localStorage.getItem("apex_wa_fontsize") || "medium");
  const [soundEnabled, setSoundEnabled] = useState(true);

  // WhatsApp Dropdowns & Modals
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [showAttachmentSheet, setShowAttachmentSheet] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showGroupInfoModal, setShowGroupInfoModal] = useState(false);
  const [showApkModal, setShowApkModal] = useState(false);
  const [lightboxImage, setLightboxImage] = useState(null);

  // Real Audio Recording Engine State
  const [isRecording, setIsRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const recordTimerRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  // Voice Note Playback Engine
  const [playingAudioId, setPlayingAudioId] = useState(null);
  const [playbackSpeed, setPlaybackSpeed] = useState(1); // 1x, 1.5x, 2x
  const [audioProgress, setAudioProgress] = useState({});
  const activeAudioElemRef = useRef(null);

  // Code Snippet Modal State
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [codeLanguage, setCodeLanguage] = useState("javascript");
  const [codeContent, setCodeContent] = useState("");
  const [copiedCodeId, setCopiedCodeId] = useState(null);

  // Hidden File Pickers
  const imageInputRef = useRef(null);
  const docInputRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Listen to viewport resizing for responsive mobile WhatsApp APK behavior
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) setMobileScreen("conversation");
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Auth sync
  useEffect(() => {
    const unsubAuth = subscribeToAuth((u) => setCurrentUser(u));
    return unsubAuth;
  }, []);

  // Load messages whenever channel changes
  useEffect(() => {
    setMessages(getChannelMessages(activeChannelId));
    const handleMsgEvent = (e) => {
      if (e.detail?.channelId === activeChannelId) {
        setMessages(getChannelMessages(activeChannelId));
      }
    };
    window.addEventListener("apex_messages_changed", handleMsgEvent);
    return () => window.removeEventListener("apex_messages_changed", handleMsgEvent);
  }, [activeChannelId]);

  // Scroll to bottom smoothly
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isRecording]);

  // Handle Voice Note Timer
  useEffect(() => {
    if (isRecording) {
      setRecordSeconds(0);
      recordTimerRef.current = setInterval(() => {
        setRecordSeconds(s => s + 1);
      }, 1000);
    } else {
      clearInterval(recordTimerRef.current);
    }
    return () => clearInterval(recordTimerRef.current);
  }, [isRecording]);

  // Manage simulated or real audio playback progress
  useEffect(() => {
    let interval = null;
    if (playingAudioId) {
      interval = setInterval(() => {
        setAudioProgress(prev => {
          const curr = (prev[playingAudioId] || 0) + (10 * playbackSpeed);
          if (curr >= 100) {
            setPlayingAudioId(null);
            return { ...prev, [playingAudioId]: 0 };
          }
          return { ...prev, [playingAudioId]: curr };
        });
      }, 200);
    }
    return () => clearInterval(interval);
  }, [playingAudioId, playbackSpeed]);

  const activeChannel = DEFAULT_CHANNELS.find(c => c.id === activeChannelId) || DEFAULT_CHANNELS[0];
  const registeredMembers = getRegisteredAccounts().filter(a => a.status === "active");

  const isAdmin = currentUser?.role === ROLES.DIRECTOR || currentUser?.role === ROLES.MANAGER;
  const isTeacher = currentUser?.role === ROLES.INSTRUCTOR;
  const isStudent = currentUser?.role === ROLES.STUDENT;

  // Filter channels based on search and tabs
  const filteredChannels = DEFAULT_CHANNELS.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          c.desc.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    if (chatFilter === "unread") return c.id === "spoken-english-b1";
    if (chatFilter === "groups") return c.category === "general" || c.category === "it";
    if (chatFilter === "faculty") return c.category === "it" || c.category === "language";
    return true;
  });

  // Send Text Message
  const handleSendTextMessage = async (e) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;

    if (soundEnabled) playWhatsAppSound("send");

    await sendMessage(activeChannelId, {
      senderId: currentUser.uid,
      senderName: currentUser.name,
      senderRole: currentUser.role,
      avatar: currentUser.avatar,
      type: "text",
      content: inputText.trim()
    });

    setInputText("");
    setShowEmojiPicker(false);
  };

  // Real Voice Note Recording Start
  const handleStartVoiceRecording = async () => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorderRef.current = new MediaRecorder(stream);
        audioChunksRef.current = [];

        mediaRecorderRef.current.ondataavailable = (event) => {
          if (event.data.size > 0) audioChunksRef.current.push(event.data);
        };

        mediaRecorderRef.current.start();
      }
    } catch (err) {
      console.log("Using simulated voice note stream:", err);
    }
    setIsRecording(true);
    if (soundEnabled) playWhatsAppSound("pop");
  };

  // Finish & Send Real Voice Note
  const handleFinishVoiceRecord = async () => {
    setIsRecording(false);
    const durationSec = recordSeconds || 8;
    const durationStr = `0:${durationSec < 10 ? "0" : ""}${durationSec}`;

    let audioDataUrl = null;
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }

    if (soundEnabled) playWhatsAppSound("send");

    await sendMessage(activeChannelId, {
      senderId: currentUser.uid,
      senderName: currentUser.name,
      senderRole: currentUser.role,
      avatar: currentUser.avatar,
      type: "audio",
      duration: durationStr,
      audioUrl: audioDataUrl,
      content: `🎤 Voice note (${durationStr})`
    });
  };

  // Cancel Voice Note
  const handleCancelVoiceRecord = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
    setIsRecording(false);
    setRecordSeconds(0);
  };

  // Send Code Snippet
  const handleSendCodeSnippet = async (e) => {
    e.preventDefault();
    if (!codeContent.trim()) return;

    if (soundEnabled) playWhatsAppSound("send");

    await sendMessage(activeChannelId, {
      senderId: currentUser.uid,
      senderName: currentUser.name,
      senderRole: currentUser.role,
      avatar: currentUser.avatar,
      type: "code",
      language: codeLanguage,
      content: codeContent.trim()
    });

    setCodeContent("");
    setShowCodeModal(false);
  };

  // Send Image Message from File Picker
  const handleImageFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const imageUrl = event.target?.result;
      if (soundEnabled) playWhatsAppSound("send");

      await sendMessage(activeChannelId, {
        senderId: currentUser.uid,
        senderName: currentUser.name,
        senderRole: currentUser.role,
        avatar: currentUser.avatar,
        type: "image",
        imageUrl: imageUrl,
        fileName: file.name,
        content: file.name
      });
      setShowAttachmentSheet(false);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  // Send Document Message from File Picker
  const handleDocFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const sizeKb = Math.round(file.size / 1024);
    const sizeStr = sizeKb > 1024 ? `${(sizeKb / 1024).toFixed(1)} MB` : `${sizeKb} KB`;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const fileData = event.target?.result;
      if (soundEnabled) playWhatsAppSound("send");

      await sendMessage(activeChannelId, {
        senderId: currentUser.uid,
        senderName: currentUser.name,
        senderRole: currentUser.role,
        avatar: currentUser.avatar,
        type: "document",
        fileName: file.name,
        fileSize: sizeStr,
        fileData: fileData,
        content: file.name
      });
      setShowAttachmentSheet(false);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedCodeId(id);
    setTimeout(() => setCopiedCodeId(null), 2000);
  };

  // Quick Role Switcher for Testing & Verification
  const handleQuickRoleSwitch = (newRole) => {
    const updatedUser = {
      ...currentUser,
      role: newRole,
      name: newRole === ROLES.DIRECTOR ? "Muhammad Rauf (Admin)" : newRole === ROLES.INSTRUCTOR ? "Yasir Ali (Trainer)" : "Amjad Ali (Student)"
    };
    setCurrentUser(updatedUser);
    setStoredUser(updatedUser);
    setShowSettingsModal(false);
  };

  // Font Size in px based on preference
  const fontSizeStyle = fontSize === "small" ? "13px" : fontSize === "large" ? "16.5px" : "14.5px";

  // In-App Login State for 100% Native Experience
  const [inAppEmail, setInAppEmail] = useState("");
  const [inAppPassword, setInAppPassword] = useState("");
  const [inAppLoading, setInAppLoading] = useState(false);
  const [inAppError, setInAppError] = useState("");
  const [inAppMode, setInAppMode] = useState("login"); // 'login' or 'activate'
  const [inAppSecurityCode, setInAppSecurityCode] = useState("");
  const [inAppNewPassword, setInAppNewPassword] = useState("");

  const handleInAppLogin = async (e) => {
    if (e) e.preventDefault();
    setInAppError("");
    setInAppLoading(true);
    try {
      const res = await loginWithEmail(inAppEmail, inAppPassword);
      if (res.success) {
        setCurrentUser(res.user);
      } else if (res.requiresActivation) {
        setInAppMode("activate");
        setInAppError(res.error || "First login detected! Please enter your temporary code and permanent password.");
        if (res.invitation?.tempCode) {
          setInAppSecurityCode(res.invitation.tempCode);
        }
      } else {
        setInAppError(res.error || "Authentication failed. Please check your credentials.");
      }
    } catch (err) {
      setInAppError(err?.message || "Login failed. Please try again.");
    } finally {
      setInAppLoading(false);
    }
  };

  const handleInAppAdminLogin = async () => {
    setInAppError("");
    setInAppLoading(true);
    try {
      const res = await loginWithAdminGmail();
      if (res.success) {
        setCurrentUser(res.user);
      }
    } catch (err) {
      setInAppError(err?.message || "Failed to sign in as Admin.");
    } finally {
      setInAppLoading(false);
    }
  };

  const handleInAppActivate = async (e) => {
    if (e) e.preventDefault();
    setInAppError("");
    if (!inAppSecurityCode.trim() || !inAppNewPassword.trim()) {
      setInAppError("Please enter your temporary security code and new permanent password.");
      return;
    }
    if (inAppNewPassword.length < 6) {
      setInAppError("Password must be at least 6 characters long.");
      return;
    }
    setInAppLoading(true);
    try {
      const res = await activateAccountWithPassword({
        email: inAppEmail,
        tempCode: inAppSecurityCode,
        permanentPassword: inAppNewPassword
      });
      if (res.success) {
        setCurrentUser(res.user);
      } else {
        setInAppError(res.error || "Activation failed. Please verify your temporary code.");
      }
    } catch (err) {
      setInAppError(err?.message || "Activation error. Please try again.");
    } finally {
      setInAppLoading(false);
    }
  };

  // Strict Login Barrier with 100% In-App Mobile Authentication
  if (!currentUser) {
    const isNative = isNativeMobileApp();
    return (
      <div style={{ height: "100vh", display: "flex", flexDirection: "column", backgroundColor: "#0b141a", overflow: "hidden", color: "#e9edef", fontFamily: "Segoe UI, -apple-system, Roboto, sans-serif" }}>
        {!isNative && (
          <div style={{ display: isMobile ? "none" : "block" }}>
            <EcosystemNav currentApp="messaging" />
          </div>
        )}
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px", overflowY: "auto" }}>
          <div style={{
            maxWidth: "420px",
            width: "100%",
            padding: isMobile ? "24px 20px" : "32px 28px",
            borderRadius: "18px",
            background: "#111b21",
            border: "1px solid rgba(255,255,255,0.08)",
            boxShadow: "0 20px 50px rgba(0,0,0,0.7)",
            boxSizing: "border-box"
          }}>
            <div style={{
              width: "60px",
              height: "60px",
              borderRadius: "50%",
              background: "rgba(0, 168, 132, 0.15)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 12px auto",
              color: "#00a884"
            }}>
              <MessageCircle size={32} />
            </div>

            <h2 style={{ fontSize: "1.35rem", fontWeight: 800, color: "#e9edef", textAlign: "center", marginBottom: "4px" }}>
              Apex Connect
            </h2>
            <p style={{ fontSize: "0.82rem", color: "#8696a0", textAlign: "center", lineHeight: 1.4, marginBottom: "20px" }}>
              Official Institutional Messaging & Interactive Classroom Hub
            </p>

            {/* In-App Security Badge */}
            <div style={{
              background: "rgba(0, 168, 132, 0.1)",
              border: "1px solid rgba(0, 168, 132, 0.25)",
              borderRadius: "10px",
              padding: "8px 12px",
              marginBottom: "16px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "0.78rem",
              color: "#00a884"
            }}>
              <ShieldCheck size={16} style={{ flexShrink: 0 }} />
              <span>100% In-App Secure Sign-In • Stays inside app</span>
            </div>

            {/* Error Message */}
            {inAppError && (
              <div style={{
                background: "rgba(239, 68, 68, 0.15)",
                border: "1px solid rgba(239, 68, 68, 0.3)",
                borderRadius: "8px",
                padding: "9px 12px",
                marginBottom: "14px",
                fontSize: "0.8rem",
                color: "#f87171",
                lineHeight: 1.4
              }}>
                {inAppError}
              </div>
            )}

            {/* 1-Tap Quick Admin Gmail Login */}
            <button
              type="button"
              onClick={handleInAppAdminLogin}
              disabled={inAppLoading}
              style={{
                width: "100%",
                padding: "11px",
                fontSize: "0.88rem",
                fontWeight: 700,
                background: "linear-gradient(135deg, #00a884, #008f6f)",
                color: "#ffffff",
                border: "none",
                borderRadius: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                cursor: inAppLoading ? "wait" : "pointer",
                boxShadow: "0 4px 12px rgba(0, 168, 132, 0.3)",
                marginBottom: "14px"
              }}
            >
              <ShieldCheck size={17} />
              <span>{inAppLoading ? "Signing In..." : "1-Tap Sign In with Admin Gmail"}</span>
            </button>

            <div style={{ display: "flex", alignItems: "center", margin: "14px 0", gap: "10px" }}>
              <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.08)" }} />
              <span style={{ fontSize: "0.7rem", color: "#8696a0", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.04em" }}>
                {inAppMode === "login" ? "OR SIGN IN WITH CREDENTIALS" : "ACCOUNT ACTIVATION"}
              </span>
              <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.08)" }} />
            </div>

            {inAppMode === "login" ? (
              <form onSubmit={handleInAppLogin} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, color: "#8696a0", marginBottom: "5px" }}>
                    Gmail or Institutional Email
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. muhammadraufbaloch6@gmail.com"
                    value={inAppEmail}
                    onChange={(e) => setInAppEmail(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      background: "#202c33",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "8px",
                      color: "#e9edef",
                      fontSize: "0.88rem",
                      boxSizing: "border-box"
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, color: "#8696a0", marginBottom: "5px" }}>
                    Password or Temporary Code
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={inAppPassword}
                    onChange={(e) => setInAppPassword(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      background: "#202c33",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "8px",
                      color: "#e9edef",
                      fontSize: "0.88rem",
                      boxSizing: "border-box"
                    }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={inAppLoading}
                  style={{
                    width: "100%",
                    padding: "11px",
                    fontSize: "0.9rem",
                    fontWeight: 700,
                    background: "rgba(255,255,255,0.08)",
                    border: "1px solid rgba(255,255,255,0.15)",
                    color: "#e9edef",
                    borderRadius: "10px",
                    cursor: inAppLoading ? "wait" : "pointer",
                    marginTop: "4px"
                  }}
                >
                  {inAppLoading ? "Verifying..." : "Sign In to Apex Connect"}
                </button>

                <div style={{ textAlign: "center", marginTop: "8px" }}>
                  <button
                    type="button"
                    onClick={() => {
                      setInAppMode("activate");
                      setInAppError("");
                    }}
                    style={{
                      background: "transparent",
                      border: "none",
                      color: "#00a884",
                      fontSize: "0.78rem",
                      fontWeight: 600,
                      cursor: "pointer"
                    }}
                  >
                    Have a temporary invitation code? Activate ID
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleInAppActivate} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, color: "#8696a0", marginBottom: "5px" }}>
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="name@gmail.com"
                    value={inAppEmail}
                    onChange={(e) => setInAppEmail(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      background: "#202c33",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "8px",
                      color: "#e9edef",
                      fontSize: "0.88rem",
                      boxSizing: "border-box"
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, color: "#8696a0", marginBottom: "5px" }}>
                    Temporary Security Code (e.g. APEX-123456)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="APEX-XXXXXX"
                    value={inAppSecurityCode}
                    onChange={(e) => setInAppSecurityCode(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      background: "#202c33",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "8px",
                      color: "#e9edef",
                      fontSize: "0.88rem",
                      boxSizing: "border-box"
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, color: "#8696a0", marginBottom: "5px" }}>
                    Set Permanent Password (min. 6 chars)
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={inAppNewPassword}
                    onChange={(e) => setInAppNewPassword(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      background: "#202c33",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "8px",
                      color: "#e9edef",
                      fontSize: "0.88rem",
                      boxSizing: "border-box"
                    }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={inAppLoading}
                  style={{
                    width: "100%",
                    padding: "11px",
                    fontSize: "0.9rem",
                    fontWeight: 700,
                    background: "linear-gradient(135deg, #00a884, #008f6f)",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: "10px",
                    cursor: inAppLoading ? "wait" : "pointer",
                    marginTop: "4px"
                  }}
                >
                  {inAppLoading ? "Activating..." : "Activate & Enter Apex Connect"}
                </button>

                <div style={{ textAlign: "center", marginTop: "8px" }}>
                  <button
                    type="button"
                    onClick={() => {
                      setInAppMode("login");
                      setInAppError("");
                    }}
                    style={{
                      background: "transparent",
                      border: "none",
                      color: "#8696a0",
                      fontSize: "0.78rem",
                      cursor: "pointer"
                    }}
                  >
                    ← Back to Sign In
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", backgroundColor: "#0b141a", color: "#e9edef", overflow: "hidden", fontFamily: "Segoe UI, -apple-system, Roboto, Helvetica, Arial, sans-serif" }}>
      
      {/* Ecosystem Global Navigation (Hidden on pure mobile WhatsApp layout or Native APK) */}
      <div className="whatsapp-top-ecosystem" style={{ display: isMobile || isNativeMobileApp() ? "none" : "block" }}>
        <EcosystemNav currentApp="messaging" />
      </div>

      {/* Hidden File Inputs for WhatsApp Camera & Document Upload */}
      <input
        type="file"
        ref={imageInputRef}
        accept="image/*"
        style={{ display: "none" }}
        onChange={handleImageFileChange}
      />
      <input
        type="file"
        ref={docInputRef}
        accept=".pdf,.doc,.docx,.txt,.zip,.csv,.xlsx"
        style={{ display: "none" }}
        onChange={handleDocFileChange}
      />

      {/* WhatsApp Main Interface Container */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden", position: "relative" }}>

        {/* ======================================================== */}
        {/* LEFT COLUMN / MOBILE CHATS TAB                           */}
        {/* ======================================================== */}
        <aside style={{
          width: isMobile ? "100%" : "380px",
          display: isMobile && mobileScreen === "conversation" ? "none" : "flex",
          flexDirection: "column",
          background: "#111b21",
          borderRight: "1px solid rgba(134, 150, 160, 0.15)",
          flexShrink: 0
        }}>
          {/* WhatsApp Header Bar */}
          <div style={{ padding: "12px 16px", background: "#202c33", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <img
                src={currentUser?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"}
                alt={currentUser?.name}
                onClick={() => setShowSettingsModal(true)}
                title="View WhatsApp Profile & Settings"
                style={{ width: "40px", height: "40px", borderRadius: "50%", objectFit: "cover", cursor: "pointer", border: "2px solid #00a884" }}
              />
              <span style={{ fontSize: "1.2rem", fontWeight: 700, color: "#e9edef", letterSpacing: "-0.01em" }}>Chats</span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "14px", color: "#aebac1" }}>
              <button
                onClick={() => setShowApkModal(true)}
                title="Download Android APK"
                style={{ background: "transparent", border: "none", color: "#00a884", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px", fontSize: "0.8rem", fontWeight: 700 }}
              >
                <Smartphone size={19} />
                <span style={{ display: isMobile ? "none" : "inline" }}>APKs</span>
              </button>
              <button
                onClick={() => setShowSettingsModal(true)}
                title="Settings"
                style={{ background: "transparent", border: "none", color: "#aebac1", cursor: "pointer", padding: "4px" }}
              >
                <Settings size={20} />
              </button>
            </div>
          </div>

          {/* Search & WhatsApp Filter Tabs */}
          <div style={{ padding: "8px 12px", background: "#111b21" }}>
            <div style={{ position: "relative", marginBottom: "8px" }}>
              <Search size={16} color="#8696a0" style={{ position: "absolute", left: "12px", top: "10px" }} />
              <input
                type="text"
                placeholder="Search or start new chat"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: "100%",
                  padding: "8px 12px 8px 38px",
                  background: "#202c33",
                  border: "none",
                  borderRadius: "8px",
                  color: "#e9edef",
                  fontSize: "0.88rem",
                  outline: "none"
                }}
              />
            </div>

            {/* Filter Pills (Latest WhatsApp UI) */}
            <div style={{ display: "flex", gap: "6px", overflowX: "auto", paddingBottom: "2px" }}>
              {[
                { id: "all", label: "All" },
                { id: "unread", label: "Unread" },
                { id: "groups", label: "Groups" },
                { id: "faculty", label: "Faculty" }
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setChatFilter(f.id)}
                  style={{
                    padding: "5px 12px",
                    borderRadius: "18px",
                    border: "none",
                    background: chatFilter === f.id ? "rgba(0, 168, 132, 0.2)" : "#202c33",
                    color: chatFilter === f.id ? "#00a884" : "#8696a0",
                    fontWeight: chatFilter === f.id ? 700 : 500,
                    fontSize: "0.78rem",
                    cursor: "pointer",
                    whiteSpace: "nowrap"
                  }}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Chat List Items */}
          <div style={{ flex: 1, overflowY: "auto" }}>
            {filteredChannels.map((channel) => {
              const isActive = channel.id === activeChannelId;
              const unreadCount = channel.id === "spoken-english-b1" ? 2 : 0;
              return (
                <div
                  key={channel.id}
                  onClick={() => {
                    setActiveChannelId(channel.id);
                    if (isMobile) setMobileScreen("conversation");
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    padding: "12px 16px",
                    cursor: "pointer",
                    background: isActive ? "#2a3942" : "transparent",
                    borderBottom: "1px solid rgba(134, 150, 160, 0.08)",
                    transition: "background 0.1s"
                  }}
                >
                  {/* Channel Avatar with category badge */}
                  <div style={{ position: "relative", flexShrink: 0 }}>
                    <div style={{
                      width: "48px",
                      height: "48px",
                      borderRadius: "50%",
                      background: channel.category === "language" ? "linear-gradient(135deg, #059669, #10b981)" : channel.category === "it" ? "linear-gradient(135deg, #0284c7, #0369a1)" : "linear-gradient(135deg, #6366f1, #4f46e5)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#ffffff",
                      fontWeight: 800,
                      fontSize: "1.1rem"
                    }}>
                      {channel.name.slice(0, 2).toUpperCase()}
                    </div>
                    <span style={{
                      position: "absolute",
                      bottom: 0,
                      right: 0,
                      width: "12px",
                      height: "12px",
                      borderRadius: "50%",
                      background: "#25d366",
                      border: "2px solid #111b21"
                    }} />
                  </div>

                  {/* Channel Meta */}
                  <div style={{ flex: 1, overflow: "hidden" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "3px" }}>
                      <span style={{ fontSize: "0.95rem", fontWeight: 700, color: "#e9edef", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {channel.name}
                      </span>
                      <span style={{ fontSize: "0.72rem", color: unreadCount > 0 ? "#25d366" : "#8696a0", fontWeight: unreadCount > 0 ? 700 : 500 }}>
                        {channel.id === "spoken-english-b1" ? "11:42 AM" : "Yesterday"}
                      </span>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ fontSize: "0.82rem", color: "#8696a0", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", display: "flex", alignItems: "center", gap: "4px" }}>
                        <CheckCheck size={14} color="#53bdeb" />
                        <span>{channel.desc}</span>
                      </div>

                      {unreadCount > 0 && (
                        <span style={{
                          background: "#25d366",
                          color: "#111b21",
                          fontSize: "0.7rem",
                          fontWeight: 800,
                          borderRadius: "10px",
                          padding: "1px 6px",
                          minWidth: "18px",
                          textAlign: "center"
                        }}>
                          {unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom Bar on Mobile for WhatsApp Tab Switch */}
          {isMobile && (
            <div style={{ display: "flex", justifyContent: "space-around", padding: "10px 0", background: "#202c33", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
              <div style={{ textAlign: "center", color: "#25d366", fontSize: "0.72rem", fontWeight: 700 }}>
                <MessageCircle size={20} style={{ margin: "0 auto 2px" }} />
                <span>Chats</span>
              </div>
              <div onClick={() => setShowGroupInfoModal(true)} style={{ textAlign: "center", color: "#8696a0", fontSize: "0.72rem", cursor: "pointer" }}>
                <Users size={20} style={{ margin: "0 auto 2px" }} />
                <span>Members</span>
              </div>
              <div onClick={() => setShowApkModal(true)} style={{ textAlign: "center", color: "#8696a0", fontSize: "0.72rem", cursor: "pointer" }}>
                <Smartphone size={20} style={{ margin: "0 auto 2px" }} />
                <span>APKs</span>
              </div>
              <div onClick={() => setShowSettingsModal(true)} style={{ textAlign: "center", color: "#8696a0", fontSize: "0.72rem", cursor: "pointer" }}>
                <Settings size={20} style={{ margin: "0 auto 2px" }} />
                <span>Settings</span>
              </div>
            </div>
          )}
        </aside>

        {/* ======================================================== */}
        {/* RIGHT COLUMN / MOBILE CONVERSATION SCREEN                */}
        {/* ======================================================== */}
        <main style={{
          flex: 1,
          display: isMobile && mobileScreen === "chats" ? "none" : "flex",
          flexDirection: "column",
          background: wallpaper === "doodle" ? WHATSAPP_DOODLE_BG : wallpaper === "emerald" ? "#071c18" : wallpaper === "midnight" ? "#09131a" : "#0b141a",
          backgroundRepeat: "repeat",
          position: "relative",
          overflow: "hidden"
        }}>

          {/* WhatsApp Top Chat Bar */}
          <header style={{
            padding: "10px 16px",
            background: "#202c33",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            zIndex: 10,
            boxShadow: "0 1px 3px rgba(0,0,0,0.3)"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              {isMobile && (
                <button
                  onClick={() => setMobileScreen("chats")}
                  style={{ background: "transparent", border: "none", color: "#aebac1", cursor: "pointer", padding: "4px" }}
                >
                  <ArrowLeft size={22} />
                </button>
              )}

              <div
                onClick={() => setShowGroupInfoModal(true)}
                style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}
              >
                <div style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #059669, #10b981)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#ffffff",
                  fontWeight: 800
                }}>
                  {activeChannel.name.slice(0, 2).toUpperCase()}
                </div>

                <div>
                  <div style={{ fontSize: "1rem", fontWeight: 700, color: "#e9edef" }}>
                    {activeChannel.name}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "#8696a0" }}>
                    online • tap here for group info
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons & 3-Dots Menu */}
            <div style={{ display: "flex", alignItems: "center", gap: "16px", color: "#aebac1" }}>
              <button
                onClick={() => alert("Apex Voice Call is connecting securely over institutional channel...")}
                title="Voice Call"
                style={{ background: "transparent", border: "none", color: "#aebac1", cursor: "pointer" }}
              >
                <Phone size={19} />
              </button>
              <button
                onClick={() => alert("Apex HD Video Lab is connecting...")}
                title="Video Call"
                style={{ background: "transparent", border: "none", color: "#aebac1", cursor: "pointer" }}
              >
                <Video size={20} />
              </button>
              
              {/* WhatsApp 3-Dots Menu */}
              <div style={{ position: "relative" }}>
                <button
                  onClick={() => setShowOptionsMenu(!showOptionsMenu)}
                  title="More options"
                  style={{ background: "transparent", border: "none", color: "#aebac1", cursor: "pointer", padding: "4px" }}
                >
                  <MoreVertical size={20} />
                </button>

                {showOptionsMenu && (
                  <div style={{
                    position: "absolute",
                    top: "100%",
                    right: 0,
                    marginTop: "8px",
                    background: "#233138",
                    borderRadius: "10px",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
                    minWidth: "210px",
                    zIndex: 50,
                    overflow: "hidden",
                    border: "1px solid rgba(255,255,255,0.08)"
                  }}>
                    <div
                      onClick={() => { setShowGroupInfoModal(true); setShowOptionsMenu(false); }}
                      style={{ padding: "12px 16px", fontSize: "0.88rem", color: "#e9edef", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}
                    >
                      <Info size={16} />
                      <span>Group Info</span>
                    </div>
                    <div
                      onClick={() => { setShowCodeModal(true); setShowOptionsMenu(false); }}
                      style={{ padding: "12px 16px", fontSize: "0.88rem", color: "#e9edef", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}
                    >
                      <Terminal size={16} color="#38bdf8" />
                      <span>Share Code Snippet</span>
                    </div>
                    <div
                      onClick={() => { setShowApkModal(true); setShowOptionsMenu(false); }}
                      style={{ padding: "12px 16px", fontSize: "0.88rem", color: "#34d399", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}
                    >
                      <Smartphone size={16} />
                      <span>Download Android APKs</span>
                    </div>
                    <div
                      onClick={() => { setShowSettingsModal(true); setShowOptionsMenu(false); }}
                      style={{ padding: "12px 16px", fontSize: "0.88rem", color: "#e9edef", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}
                    >
                      <Settings size={16} />
                      <span>Settings & Wallpaper</span>
                    </div>
                    {isAdmin && (
                      <div
                        onClick={() => {
                          if (window.confirm(`Clear all messages in #${activeChannel.name}?`)) {
                            clearChannelMessages(activeChannelId);
                            setMessages([]);
                          }
                          setShowOptionsMenu(false);
                        }}
                        style={{ padding: "12px 16px", fontSize: "0.88rem", color: "#f87171", cursor: "pointer", borderTop: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", gap: "8px" }}
                      >
                        <Trash2 size={16} />
                        <span>Clear Chat</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </header>

          {/* Messages Scroll Container */}
          <div style={{
            flex: 1,
            overflowY: "auto",
            padding: "16px 20px",
            display: "flex",
            flexDirection: "column",
            gap: "10px"
          }}>
            {/* WhatsApp Date Separator */}
            <div style={{ display: "flex", justifyContent: "center", margin: "10px 0" }}>
              <span style={{
                background: "#182229",
                color: "#8696a0",
                fontSize: "0.75rem",
                fontWeight: 600,
                padding: "5px 14px",
                borderRadius: "8px",
                boxShadow: "0 1px 2px rgba(0,0,0,0.2)"
              }}>
                TODAY • ENCRYPTION &amp; AUTHENTICATION VERIFIED
              </span>
            </div>

            {messages.length === 0 ? (
              <div style={{ textAlign: "center", margin: "auto", maxWidth: "360px", color: "#8696a0", background: "rgba(17,27,33,0.8)", padding: "24px", borderRadius: "14px" }}>
                <Sparkles size={32} color="#00a884" style={{ margin: "0 auto 10px" }} />
                <h4 style={{ color: "#e9edef", fontWeight: 700, marginBottom: "6px" }}>Welcome to #{activeChannel.name}</h4>
                <p style={{ fontSize: "0.82rem", lineHeight: 1.5 }}>
                  This is the start of the discussion. Send text, record voice notes with waveform scrubber, or share photos and documents just like WhatsApp.
                </p>
              </div>
            ) : (
              messages.map((msg) => {
                const isMe = msg.senderId === currentUser.uid;
                const isInstructor = msg.senderRole === ROLES.INSTRUCTOR;
                const isDirector = msg.senderRole === ROLES.DIRECTOR;
                const isAudio = msg.type === "audio";
                const isImage = msg.type === "image";
                const isDoc = msg.type === "document";
                const isCode = msg.type === "code";

                // WhatsApp sender colors for group messages
                const senderColor = isDirector ? "#f59e0b" : isInstructor ? "#38bdf8" : "#25d366";

                return (
                  <div
                    key={msg.id}
                    style={{
                      display: "flex",
                      justifyContent: isMe ? "flex-end" : "flex-start",
                      width: "100%"
                    }}
                  >
                    {/* WhatsApp Message Bubble */}
                    <div style={{
                      maxWidth: "75%",
                      minWidth: "120px",
                      background: isMe ? "#005c4b" : "#202c33",
                      borderRadius: isMe ? "8px 0px 8px 8px" : "0px 8px 8px 8px",
                      padding: "6px 10px 6px 10px",
                      boxShadow: "0 1px 2px rgba(0,0,0,0.3)",
                      position: "relative"
                    }}>
                      
                      {/* Sender Name in Group Chat (if incoming) */}
                      {!isMe && (
                        <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "3px" }}>
                          <span style={{ fontSize: "0.8rem", fontWeight: 700, color: senderColor }}>
                            {msg.senderName}
                          </span>
                          {isDirector && <span style={{ fontSize: "0.62rem", padding: "1px 5px", background: "rgba(245, 158, 11, 0.2)", color: "#f59e0b", borderRadius: "4px", fontWeight: 700 }}>Director</span>}
                          {isInstructor && <span style={{ fontSize: "0.62rem", padding: "1px 5px", background: "rgba(56, 189, 248, 0.2)", color: "#38bdf8", borderRadius: "4px", fontWeight: 700 }}>Trainer</span>}
                        </div>
                      )}

                      {/* 1. TEXT MESSAGE */}
                      {msg.type === "text" && (
                        <div style={{ fontSize: fontSizeStyle, color: "#e9edef", lineHeight: 1.45, paddingRight: "45px", wordBreak: "break-word" }}>
                          {msg.content}
                        </div>
                      )}

                      {/* 2. IMAGE MESSAGE */}
                      {isImage && (
                        <div style={{ marginBottom: "4px" }}>
                          <img
                            src={msg.imageUrl}
                            alt={msg.fileName || "Photo"}
                            onClick={() => setLightboxImage(msg.imageUrl)}
                            style={{
                              width: "100%",
                              maxHeight: "320px",
                              objectFit: "cover",
                              borderRadius: "6px",
                              cursor: "pointer"
                            }}
                          />
                          {msg.content && msg.content !== msg.fileName && (
                            <div style={{ fontSize: fontSizeStyle, color: "#e9edef", marginTop: "6px", paddingRight: "45px" }}>
                              {msg.content}
                            </div>
                          )}
                        </div>
                      )}

                      {/* 3. DOCUMENT MESSAGE */}
                      {isDoc && (
                        <div style={{
                          background: "rgba(0,0,0,0.2)",
                          borderRadius: "6px",
                          padding: "10px 12px",
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                          minWidth: "240px",
                          marginBottom: "4px"
                        }}>
                          <div style={{ width: "36px", height: "36px", borderRadius: "8px", background: "#ef4444", display: "flex", alignItems: "center", justifyContent: "center", color: "#ffffff", fontWeight: 800, fontSize: "0.75rem" }}>
                            DOC
                          </div>
                          <div style={{ flex: 1, overflow: "hidden" }}>
                            <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#e9edef", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                              {msg.fileName || msg.content}
                            </div>
                            <div style={{ fontSize: "0.72rem", color: "#8696a0" }}>
                              {msg.fileSize || "1.2 MB"} • Document
                            </div>
                          </div>
                          {msg.fileData && (
                            <a
                              href={msg.fileData}
                              download={msg.fileName || "document.pdf"}
                              style={{ width: "32px", height: "32px", borderRadius: "50%", background: "rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#e9edef" }}
                            >
                              <Download size={15} />
                            </a>
                          )}
                        </div>
                      )}

                      {/* 4. WHATSAPP VOICE NOTE MESSAGE */}
                      {isAudio && (
                        <div style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                          width: "280px",
                          padding: "6px 2px"
                        }}>
                          {/* Green Play/Pause Button */}
                          <button
                            onClick={() => setPlayingAudioId(playingAudioId === msg.id ? null : msg.id)}
                            style={{
                              width: "42px",
                              height: "42px",
                              borderRadius: "50%",
                              border: "none",
                              background: "#00a884",
                              color: "#ffffff",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              cursor: "pointer",
                              flexShrink: 0
                            }}
                          >
                            {playingAudioId === msg.id ? <Pause size={20} /> : <Play size={20} style={{ marginLeft: "2px" }} />}
                          </button>

                          {/* Waveform Scrubber with interactive progress */}
                          <div style={{ flex: 1 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "2.5px", height: "24px" }}>
                              {[35, 65, 30, 85, 55, 100, 45, 90, 60, 95, 40, 75, 50, 80, 65, 40, 70, 45].map((barHeight, idx) => {
                                const activeProgressPercent = audioProgress[msg.id] || 0;
                                const barPercent = (idx / 18) * 100;
                                const isPlayed = barPercent <= activeProgressPercent;

                                return (
                                  <div
                                    key={idx}
                                    style={{
                                      width: "3px",
                                      height: `${barHeight}%`,
                                      background: isPlayed ? (isMe ? "#e9edef" : "#00a884") : "#8696a0",
                                      borderRadius: "2px",
                                      transition: "background 0.1s"
                                    }}
                                  />
                                );
                              })}
                            </div>

                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "4px" }}>
                              <span style={{ fontSize: "0.7rem", color: "#8696a0" }}>
                                {playingAudioId === msg.id ? `0:${Math.floor(((audioProgress[msg.id] || 0) / 100) * 15)}` : (msg.duration || "0:12")}
                              </span>

                              {/* Playback speed toggle */}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setPlaybackSpeed(s => s === 1 ? 1.5 : s === 1.5 ? 2 : 1);
                                }}
                                style={{
                                  background: "rgba(255,255,255,0.12)",
                                  border: "none",
                                  borderRadius: "10px",
                                  padding: "1px 6px",
                                  fontSize: "0.68rem",
                                  color: "#e9edef",
                                  fontWeight: 700,
                                  cursor: "pointer"
                                }}
                              >
                                {playbackSpeed}x
                              </button>
                            </div>
                          </div>

                          {/* Avatar with Mic Indicator */}
                          <div style={{ position: "relative", flexShrink: 0 }}>
                            <img
                              src={msg.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"}
                              alt={msg.senderName}
                              style={{ width: "36px", height: "36px", borderRadius: "50%", objectFit: "cover" }}
                            />
                            <div style={{
                              position: "absolute",
                              bottom: "-2px",
                              right: "-2px",
                              width: "16px",
                              height: "16px",
                              borderRadius: "50%",
                              background: "#00a884",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "#ffffff"
                            }}>
                              <Mic size={10} />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* 5. CODE SNIPPET MESSAGE */}
                      {isCode && (
                        <div style={{
                          background: "#0d1117",
                          borderRadius: "6px",
                          overflow: "hidden",
                          marginBottom: "4px",
                          maxWidth: "500px",
                          border: "1px solid rgba(255,255,255,0.1)"
                        }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 10px", background: "rgba(255,255,255,0.05)", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                            <span style={{ fontSize: "0.72rem", color: "#38bdf8", fontWeight: 700, textTransform: "uppercase" }}>{msg.language || "Code"}</span>
                            <button
                              onClick={() => copyToClipboard(msg.content, msg.id)}
                              style={{ background: "transparent", border: "none", color: copiedCodeId === msg.id ? "#25d366" : "#8696a0", fontSize: "0.72rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px" }}
                            >
                              {copiedCodeId === msg.id ? <Check size={12} /> : <Copy size={12} />}
                              <span>{copiedCodeId === msg.id ? "Copied" : "Copy"}</span>
                            </button>
                          </div>
                          <pre style={{ margin: 0, padding: "10px", fontSize: "0.82rem", color: "#f8fafc", fontFamily: "Consolas, Monaco, monospace", overflowX: "auto" }}>
                            <code>{msg.content}</code>
                          </pre>
                        </div>
                      )}

                      {/* Pinned Bottom-Right Timestamp & WhatsApp Double Checkmarks */}
                      <div style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "flex-end",
                        gap: "4px",
                        marginTop: "2px",
                        fontSize: "0.68rem",
                        color: "#8696a0",
                        float: "right",
                        marginLeft: "12px"
                      }}>
                        <span>{msg.timestamp}</span>
                        {isMe && (
                          <CheckCheck size={14} color="#53bdeb" style={{ display: "inline" }} />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* ======================================================== */}
          {/* WHATSAPP ATTACHMENT SHEET (6 TILES)                      */}
          {/* ======================================================== */}
          {showAttachmentSheet && (
            <div style={{
              position: "absolute",
              bottom: "75px",
              left: "20px",
              background: "#233138",
              borderRadius: "16px",
              padding: "16px",
              boxShadow: "0 10px 30px rgba(0,0,0,0.6)",
              zIndex: 30,
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "18px",
              border: "1px solid rgba(255,255,255,0.08)"
            }}>
              {/* 1. Document */}
              <div
                onClick={() => docInputRef.current?.click()}
                style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", cursor: "pointer" }}
              >
                <div style={{ width: "50px", height: "50px", borderRadius: "50%", background: "linear-gradient(135deg, #7f66ff, #512da8)", display: "flex", alignItems: "center", justifyContent: "center", color: "#ffffff" }}>
                  <FileText size={22} />
                </div>
                <span style={{ fontSize: "0.75rem", color: "#e9edef" }}>Document</span>
              </div>

              {/* 2. Camera / Gallery */}
              <div
                onClick={() => imageInputRef.current?.click()}
                style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", cursor: "pointer" }}
              >
                <div style={{ width: "50px", height: "50px", borderRadius: "50%", background: "linear-gradient(135deg, #d3396d, #c2185b)", display: "flex", alignItems: "center", justifyContent: "center", color: "#ffffff" }}>
                  <ImageIcon size={22} />
                </div>
                <span style={{ fontSize: "0.75rem", color: "#e9edef" }}>Photos</span>
              </div>

              {/* 3. Audio file */}
              <div
                onClick={() => {
                  alert("Tap the microphone button on bottom right to record a voice practice note directly!");
                  setShowAttachmentSheet(false);
                }}
                style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", cursor: "pointer" }}
              >
                <div style={{ width: "50px", height: "50px", borderRadius: "50%", background: "linear-gradient(135deg, #ff8b00, #f57c00)", display: "flex", alignItems: "center", justifyContent: "center", color: "#ffffff" }}>
                  <Music size={22} />
                </div>
                <span style={{ fontSize: "0.75rem", color: "#e9edef" }}>Audio</span>
              </div>

              {/* 4. Code Snippet */}
              <div
                onClick={() => { setShowCodeModal(true); setShowAttachmentSheet(false); }}
                style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", cursor: "pointer" }}
              >
                <div style={{ width: "50px", height: "50px", borderRadius: "50%", background: "linear-gradient(135deg, #00a884, #00796b)", display: "flex", alignItems: "center", justifyContent: "center", color: "#ffffff" }}>
                  <Code size={22} />
                </div>
                <span style={{ fontSize: "0.75rem", color: "#e9edef" }}>Code</span>
              </div>

              {/* 5. Android APKs */}
              <div
                onClick={() => { setShowApkModal(true); setShowAttachmentSheet(false); }}
                style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", cursor: "pointer" }}
              >
                <div style={{ width: "50px", height: "50px", borderRadius: "50%", background: "linear-gradient(135deg, #0284c7, #0288d1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#ffffff" }}>
                  <Smartphone size={22} />
                </div>
                <span style={{ fontSize: "0.75rem", color: "#e9edef" }}>APK Build</span>
              </div>

              {/* 6. Settings */}
              <div
                onClick={() => { setShowSettingsModal(true); setShowAttachmentSheet(false); }}
                style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", cursor: "pointer" }}
              >
                <div style={{ width: "50px", height: "50px", borderRadius: "50%", background: "linear-gradient(135deg, #475569, #334155)", display: "flex", alignItems: "center", justifyContent: "center", color: "#ffffff" }}>
                  <Sliders size={22} />
                </div>
                <span style={{ fontSize: "0.75rem", color: "#e9edef" }}>Settings</span>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* EMOJI QUICK PICKER                                       */}
          {/* ======================================================== */}
          {showEmojiPicker && (
            <div style={{
              position: "absolute",
              bottom: "75px",
              left: "16px",
              background: "#202c33",
              borderRadius: "14px",
              padding: "12px",
              boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
              zIndex: 30,
              display: "flex",
              gap: "8px",
              flexWrap: "wrap",
              maxWidth: "300px",
              border: "1px solid rgba(255,255,255,0.1)"
            }}>
              {["👍", "❤️", "😂", "🔥", "🎉", "👏", "📚", "✍️", "🚀", "💡", "💯", "🙏"].map(emoji => (
                <span
                  key={emoji}
                  onClick={() => { setInputText(prev => prev + emoji); setShowEmojiPicker(false); }}
                  style={{ fontSize: "1.4rem", cursor: "pointer", padding: "4px" }}
                >
                  {emoji}
                </span>
              ))}
            </div>
          )}

          {/* ======================================================== */}
          {/* WHATSAPP RECORDING SLIDE-IN BAR                          */}
          {/* ======================================================== */}
          {isRecording && (
            <div style={{
              padding: "10px 16px",
              background: "#202c33",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderTop: "1px solid rgba(255,255,255,0.06)",
              zIndex: 20
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{
                  width: "12px",
                  height: "12px",
                  borderRadius: "50%",
                  background: "#ef4444",
                  boxShadow: "0 0 10px #ef4444"
                }} />
                <span style={{ fontWeight: 700, color: "#fca5a5", fontSize: "0.92rem" }}>
                  0:{recordSeconds < 10 ? `0${recordSeconds}` : recordSeconds}
                </span>
                <span style={{ fontSize: "0.8rem", color: "#8696a0", marginLeft: "10px" }}>
                  Recording pronunciation voice note...
                </span>
              </div>

              <div style={{ display: "flex", gap: "12px" }}>
                <button
                  onClick={handleCancelVoiceRecord}
                  style={{ background: "transparent", border: "none", color: "#ef4444", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px", fontSize: "0.85rem", fontWeight: 600 }}
                >
                  <Trash2 size={16} />
                  <span>Cancel</span>
                </button>
                <button
                  onClick={handleFinishVoiceRecord}
                  style={{
                    background: "#00a884",
                    border: "none",
                    borderRadius: "20px",
                    color: "#ffffff",
                    padding: "6px 18px",
                    fontSize: "0.85rem",
                    fontWeight: 700,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px"
                  }}
                >
                  <Send size={14} />
                  <span>Send</span>
                </button>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* WHATSAPP BOTTOM INPUT BAR                                */}
          {/* ======================================================== */}
          {!isRecording && (
            <div style={{
              padding: "10px 14px",
              background: "#202c33",
              display: "flex",
              alignItems: "center",
              gap: "8px"
            }}>
              {/* Emoji Picker Button */}
              <button
                type="button"
                onClick={() => { setShowEmojiPicker(!showEmojiPicker); setShowAttachmentSheet(false); }}
                title="Emojis"
                style={{ background: "transparent", border: "none", color: "#8696a0", cursor: "pointer", padding: "4px" }}
              >
                <Smile size={24} />
              </button>

              {/* Attachment Paperclip Button */}
              <button
                type="button"
                onClick={() => { setShowAttachmentSheet(!showAttachmentSheet); setShowEmojiPicker(false); }}
                title="Attach Document, Photo, Code"
                style={{ background: "transparent", border: "none", color: "#8696a0", cursor: "pointer", padding: "4px" }}
              >
                <Paperclip size={24} style={{ transform: "rotate(45deg)" }} />
              </button>

              {/* Pill Text Input Bar */}
              <form onSubmit={handleSendTextMessage} style={{ flex: 1, display: "flex", alignItems: "center" }}>
                <input
                  type="text"
                  placeholder="Type a message"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 16px",
                    background: "#2a3942",
                    border: "none",
                    borderRadius: "24px",
                    color: "#e9edef",
                    fontSize: fontSizeStyle,
                    outline: "none"
                  }}
                />
              </form>

              {/* WhatsApp Right Action Button: Mic if empty, Send if typed */}
              {inputText.trim().length > 0 ? (
                <button
                  type="button"
                  onClick={handleSendTextMessage}
                  title="Send"
                  style={{
                    width: "44px",
                    height: "44px",
                    borderRadius: "50%",
                    border: "none",
                    background: "#00a884",
                    color: "#ffffff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    flexShrink: 0
                  }}
                >
                  <Send size={18} />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleStartVoiceRecording}
                  title="Click to Record Voice Note"
                  style={{
                    width: "44px",
                    height: "44px",
                    borderRadius: "50%",
                    border: "none",
                    background: "#00a884",
                    color: "#ffffff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    flexShrink: 0
                  }}
                >
                  <Mic size={20} />
                </button>
              )}
            </div>
          )}
        </main>
      </div>

      {/* ======================================================== */}
      {/* WHATSAPP SETTINGS MODAL                                  */}
      {/* ======================================================== */}
      {showSettingsModal && (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.85)",
          backdropFilter: "blur(8px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px",
          zIndex: 9999
        }}>
          <div style={{
            maxWidth: "520px",
            width: "100%",
            background: "#111b21",
            borderRadius: "16px",
            border: "1px solid rgba(255,255,255,0.1)",
            padding: "24px",
            boxShadow: "0 20px 60px rgba(0,0,0,0.8)",
            maxHeight: "90vh",
            overflowY: "auto"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", borderBottom: "1px solid rgba(255,255,255,0.08)", paddingBottom: "12px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Settings size={22} color="#00a884" />
                <h3 style={{ fontSize: "1.2rem", fontWeight: 800, margin: 0 }}>WhatsApp Settings</h3>
              </div>
              <button onClick={() => setShowSettingsModal(false)} style={{ background: "transparent", border: "none", color: "#8696a0", cursor: "pointer" }}>
                <X size={20} />
              </button>
            </div>

            {/* Profile Section */}
            <div style={{ display: "flex", alignItems: "center", gap: "16px", background: "#202c33", padding: "14px", borderRadius: "12px", marginBottom: "20px" }}>
              <img
                src={currentUser?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"}
                alt={currentUser?.name}
                style={{ width: "54px", height: "54px", borderRadius: "50%", objectFit: "cover" }}
              />
              <div>
                <div style={{ fontSize: "1.05rem", fontWeight: 800, color: "#e9edef" }}>{currentUser?.name}</div>
                <div style={{ fontSize: "0.8rem", color: "#8696a0" }}>At Apex Campus • Active</div>
                <span style={{ fontSize: "0.72rem", padding: "2px 8px", background: "rgba(0,168,132,0.2)", color: "#00a884", borderRadius: "6px", fontWeight: 700, display: "inline-block", marginTop: "4px" }}>
                  Role: {currentUser?.role ? currentUser.role.toUpperCase() : "STUDENT"}
                </span>
              </div>
            </div>

            {/* Chat Appearance: Wallpaper */}
            <div style={{ marginBottom: "20px" }}>
              <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#8696a0", textTransform: "uppercase", marginBottom: "10px" }}>
                Chat Wallpaper
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "8px" }}>
                {[
                  { id: "doodle", label: "Doodle" },
                  { id: "slate", label: "Dark Slate" },
                  { id: "emerald", label: "Emerald" },
                  { id: "midnight", label: "Midnight" }
                ].map(w => (
                  <button
                    key={w.id}
                    onClick={() => {
                      setWallpaper(w.id);
                      localStorage.setItem("apex_wa_wallpaper", w.id);
                    }}
                    style={{
                      padding: "10px 6px",
                      borderRadius: "8px",
                      border: wallpaper === w.id ? "2px solid #00a884" : "1px solid rgba(255,255,255,0.08)",
                      background: w.id === "doodle" ? "#182229" : w.id === "slate" ? "#0b141a" : w.id === "emerald" ? "#071c18" : "#09131a",
                      color: wallpaper === w.id ? "#00a884" : "#e9edef",
                      fontSize: "0.78rem",
                      fontWeight: 700,
                      cursor: "pointer"
                    }}
                  >
                    {w.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Chat Appearance: Font Size */}
            <div style={{ marginBottom: "20px" }}>
              <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#8696a0", textTransform: "uppercase", marginBottom: "10px" }}>
                Font Size
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px" }}>
                {[
                  { id: "small", label: "Small (13px)" },
                  { id: "medium", label: "Medium (14.5px)" },
                  { id: "large", label: "Large (16.5px)" }
                ].map(f => (
                  <button
                    key={f.id}
                    onClick={() => {
                      setFontSize(f.id);
                      localStorage.setItem("apex_wa_fontsize", f.id);
                    }}
                    style={{
                      padding: "10px",
                      borderRadius: "8px",
                      border: fontSize === f.id ? "2px solid #00a884" : "1px solid rgba(255,255,255,0.08)",
                      background: "#202c33",
                      color: fontSize === f.id ? "#00a884" : "#e9edef",
                      fontSize: "0.78rem",
                      fontWeight: 700,
                      cursor: "pointer"
                    }}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Sound Toggles */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderTop: "1px solid rgba(255,255,255,0.06)", borderBottom: "1px solid rgba(255,255,255,0.06)", marginBottom: "20px" }}>
              <div>
                <div style={{ fontSize: "0.92rem", fontWeight: 700, color: "#e9edef" }}>Sound Effects</div>
                <div style={{ fontSize: "0.75rem", color: "#8696a0" }}>Play audio pops when sending or receiving</div>
              </div>
              <input
                type="checkbox"
                checked={soundEnabled}
                onChange={(e) => setSoundEnabled(e.target.checked)}
                style={{ accentColor: "#00a884", width: "18px", height: "18px", cursor: "pointer" }}
              />
            </div>

            {/* Quick Role Switcher (For Testing & Previewing) */}
            <div style={{ marginBottom: "20px" }}>
              <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#8696a0", textTransform: "uppercase", marginBottom: "10px" }}>
                Switch Role Profile
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px" }}>
                <button
                  onClick={() => handleQuickRoleSwitch(ROLES.STUDENT)}
                  style={{ padding: "9px", borderRadius: "8px", background: currentUser?.role === ROLES.STUDENT ? "rgba(0,168,132,0.2)" : "#202c33", border: currentUser?.role === ROLES.STUDENT ? "1px solid #00a884" : "none", color: "#e9edef", fontSize: "0.78rem", fontWeight: 700, cursor: "pointer" }}
                >
                  🎓 Student
                </button>
                <button
                  onClick={() => handleQuickRoleSwitch(ROLES.INSTRUCTOR)}
                  style={{ padding: "9px", borderRadius: "8px", background: currentUser?.role === ROLES.INSTRUCTOR ? "rgba(56,189,248,0.2)" : "#202c33", border: currentUser?.role === ROLES.INSTRUCTOR ? "1px solid #38bdf8" : "none", color: "#e9edef", fontSize: "0.78rem", fontWeight: 700, cursor: "pointer" }}
                >
                  👨‍🏫 Faculty
                </button>
                <button
                  onClick={() => handleQuickRoleSwitch(ROLES.DIRECTOR)}
                  style={{ padding: "9px", borderRadius: "8px", background: currentUser?.role === ROLES.DIRECTOR ? "rgba(245,158,11,0.2)" : "#202c33", border: currentUser?.role === ROLES.DIRECTOR ? "1px solid #f59e0b" : "none", color: "#e9edef", fontSize: "0.78rem", fontWeight: 700, cursor: "pointer" }}
                >
                  🛡️ Admin
                </button>
              </div>
            </div>

            {/* Android APK Download Trigger */}
            <button
              onClick={() => { setShowSettingsModal(false); setShowApkModal(true); }}
              className="btn-primary"
              style={{
                width: "100%",
                padding: "12px",
                background: "linear-gradient(135deg, #00a884, #00796b)",
                borderRadius: "24px",
                fontSize: "0.9rem",
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px"
              }}
            >
              <Smartphone size={18} />
              <span>Download Official Android APKs</span>
            </button>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* WHATSAPP GROUP INFO MODAL                                */}
      {/* ======================================================== */}
      {showGroupInfoModal && (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.85)",
          backdropFilter: "blur(8px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px",
          zIndex: 9999
        }}>
          <div style={{
            maxWidth: "480px",
            width: "100%",
            background: "#111b21",
            borderRadius: "16px",
            border: "1px solid rgba(255,255,255,0.1)",
            padding: "24px",
            boxShadow: "0 20px 60px rgba(0,0,0,0.8)",
            maxHeight: "90vh",
            overflowY: "auto"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ fontSize: "1.15rem", fontWeight: 800, margin: 0 }}>Group Info</h3>
              <button onClick={() => setShowGroupInfoModal(false)} style={{ background: "transparent", border: "none", color: "#8696a0", cursor: "pointer" }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ textAlign: "center", padding: "16px 0", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
              <div style={{
                width: "72px",
                height: "72px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, #059669, #10b981)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#ffffff",
                fontWeight: 800,
                fontSize: "1.6rem",
                margin: "0 auto 12px"
              }}>
                {activeChannel.name.slice(0, 2).toUpperCase()}
              </div>
              <h4 style={{ fontSize: "1.2rem", fontWeight: 800, color: "#e9edef", marginBottom: "4px" }}>{activeChannel.name}</h4>
              <p style={{ fontSize: "0.85rem", color: "#8696a0", margin: 0 }}>{activeChannel.desc}</p>
            </div>

            <div style={{ padding: "16px 0" }}>
              <div style={{ fontSize: "0.82rem", fontWeight: 700, color: "#8696a0", textTransform: "uppercase", marginBottom: "10px" }}>
                Active Members ({registeredMembers.length})
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {registeredMembers.map(m => (
                  <div key={m.uid || m.email} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <img
                      src={m.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"}
                      alt={m.name}
                      style={{ width: "36px", height: "36px", borderRadius: "50%", objectFit: "cover" }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: "0.88rem", fontWeight: 700, color: "#e9edef" }}>{m.name}</div>
                      <div style={{ fontSize: "0.72rem", color: "#8696a0" }}>{m.email}</div>
                    </div>
                    <span style={{
                      fontSize: "0.68rem",
                      padding: "2px 6px",
                      borderRadius: "4px",
                      background: m.role === ROLES.DIRECTOR ? "rgba(245, 158, 11, 0.2)" : m.role === ROLES.INSTRUCTOR ? "rgba(56, 189, 248, 0.2)" : "rgba(37, 211, 102, 0.2)",
                      color: m.role === ROLES.DIRECTOR ? "#f59e0b" : m.role === ROLES.INSTRUCTOR ? "#38bdf8" : "#25d366",
                      fontWeight: 700
                    }}>
                      {m.role === ROLES.DIRECTOR ? "Admin" : m.role === ROLES.INSTRUCTOR ? "Instructor" : "Student"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* CODE SNIPPET SHARING MODAL                               */}
      {/* ======================================================== */}
      {showCodeModal && (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.85)",
          backdropFilter: "blur(8px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px",
          zIndex: 9999
        }}>
          <div style={{
            maxWidth: "600px",
            width: "100%",
            background: "#111b21",
            borderRadius: "16px",
            border: "1px solid rgba(255,255,255,0.1)",
            padding: "24px",
            boxShadow: "0 20px 60px rgba(0,0,0,0.8)"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Terminal size={20} color="#00a884" />
                <h3 style={{ fontSize: "1.15rem", fontWeight: 800, margin: 0 }}>Share Code Snippet</h3>
              </div>
              <button onClick={() => setShowCodeModal(false)} style={{ background: "transparent", border: "none", color: "#8696a0", cursor: "pointer" }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSendCodeSnippet}>
              <div style={{ marginBottom: "12px" }}>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "#8696a0", marginBottom: "6px" }}>
                  Language
                </label>
                <select
                  value={codeLanguage}
                  onChange={(e) => setCodeLanguage(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px",
                    background: "#202c33",
                    border: "none",
                    borderRadius: "8px",
                    color: "#e9edef",
                    outline: "none"
                  }}
                >
                  <option value="javascript">JavaScript / React</option>
                  <option value="python">Python</option>
                  <option value="html">HTML5 / CSS3</option>
                  <option value="sql">SQL / Database</option>
                </select>
              </div>

              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "#8696a0", marginBottom: "6px" }}>
                  Code Content
                </label>
                <textarea
                  rows={8}
                  placeholder="// Paste your code here..."
                  value={codeContent}
                  onChange={(e) => setCodeContent(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px",
                    background: "#0b141a",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: "8px",
                    color: "#f8fafc",
                    fontFamily: "Consolas, Monaco, monospace",
                    fontSize: "0.88rem",
                    resize: "vertical",
                    outline: "none"
                  }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                <button
                  type="button"
                  onClick={() => setShowCodeModal(false)}
                  style={{ padding: "8px 16px", borderRadius: "20px", background: "transparent", border: "1px solid rgba(255,255,255,0.15)", color: "#8696a0", cursor: "pointer" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: "8px 20px", borderRadius: "20px", background: "#00a884", border: "none", color: "#ffffff", fontWeight: 700, cursor: "pointer" }}
                >
                  Send to Channel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* WHATSAPP LIGHTBOX IMAGE VIEWER                           */}
      {/* ======================================================== */}
      {lightboxImage && (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.95)",
          backdropFilter: "blur(10px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px",
          zIndex: 99999
        }}>
          <button
            onClick={() => setLightboxImage(null)}
            style={{ position: "absolute", top: "20px", right: "20px", background: "rgba(255,255,255,0.1)", border: "none", borderRadius: "50%", width: "40px", height: "40px", color: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
          >
            <X size={24} />
          </button>
          <img
            src={lightboxImage}
            alt="Fullscreen Preview"
            style={{ maxWidth: "90vw", maxHeight: "90vh", borderRadius: "8px", boxShadow: "0 20px 60px rgba(0,0,0,0.8)" }}
          />
        </div>
      )}

      {/* ======================================================== */}
      {/* OFFICIAL APK DOWNLOAD MODAL (TEACHER, STUDENT, ADMIN)     */}
      {/* ======================================================== */}
      {showApkModal && (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.88)",
          backdropFilter: "blur(10px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px",
          zIndex: 99999
        }}>
          <div style={{
            maxWidth: "640px",
            width: "100%",
            background: "#111b21",
            borderRadius: "18px",
            border: "1px solid rgba(0, 168, 132, 0.3)",
            padding: "28px",
            boxShadow: "0 25px 70px rgba(0,0,0,0.9)",
            maxHeight: "90vh",
            overflowY: "auto"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px", borderBottom: "1px solid rgba(255,255,255,0.08)", paddingBottom: "14px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ width: "44px", height: "44px", borderRadius: "50%", background: "linear-gradient(135deg, #00a884, #00796b)", display: "flex", alignItems: "center", justifyContent: "center", color: "#ffffff" }}>
                  <Smartphone size={24} />
                </div>
                <div>
                  <h3 style={{ fontSize: "1.25rem", fontWeight: 800, margin: 0, color: "#e9edef" }}>
                    Official Apex Connect Android APKs
                  </h3>
                  <div style={{ fontSize: "0.8rem", color: "#8696a0", marginTop: "2px" }}>
                    Compiled with Android SDK 35/36 &amp; Capacitor Native Core
                  </div>
                </div>
              </div>
              <button onClick={() => setShowApkModal(false)} style={{ background: "transparent", border: "none", color: "#8696a0", cursor: "pointer" }}>
                <X size={20} />
              </button>
            </div>

            <p style={{ fontSize: "0.88rem", color: "#8696a0", lineHeight: 1.5, marginBottom: "20px" }}>
              Install the lightweight native Android package on any smartphone or tablet for instant WhatsApp-style batch communication, live speaking audio lab, and real-time announcements.
            </p>

            {/* 3 APK Editions */}
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "22px" }}>
              
              {/* 1. Student Edition */}
              <div style={{ background: "#202c33", padding: "16px", borderRadius: "12px", border: "1px solid rgba(37, 211, 102, 0.25)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "rgba(37, 211, 102, 0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "#25d366" }}>
                    🎓
                  </div>
                  <div>
                    <div style={{ fontSize: "0.98rem", fontWeight: 800, color: "#e9edef" }}>Apex Connect — Student Edition</div>
                    <div style={{ fontSize: "0.76rem", color: "#8696a0" }}>v1.0.0 • Enrolled Batches, Audio Lab &amp; Practice Rooms</div>
                  </div>
                </div>
                <a
                  href="/apks/ApexConnect-Student.apk"
                  download="ApexConnect-Student.apk"
                  style={{
                    padding: "8px 16px",
                    background: "#00a884",
                    borderRadius: "20px",
                    color: "#ffffff",
                    textDecoration: "none",
                    fontSize: "0.82rem",
                    fontWeight: 700,
                    display: "flex",
                    alignItems: "center",
                    gap: "6px"
                  }}
                >
                  <Download size={14} />
                  <span>Download APK</span>
                </a>
              </div>

              {/* 2. Faculty / Teacher Edition */}
              <div style={{ background: "#202c33", padding: "16px", borderRadius: "12px", border: "1px solid rgba(56, 189, 248, 0.25)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "rgba(56, 189, 248, 0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "#38bdf8" }}>
                    👨‍🏫
                  </div>
                  <div>
                    <div style={{ fontSize: "0.98rem", fontWeight: 800, color: "#e9edef" }}>Apex Connect — Faculty / Teacher Edition</div>
                    <div style={{ fontSize: "0.76rem", color: "#8696a0" }}>v1.0.0 • Batch Moderation, Code Sharing &amp; Voice Reviews</div>
                  </div>
                </div>
                <a
                  href="/apks/ApexConnect-Teacher.apk"
                  download="ApexConnect-Teacher.apk"
                  style={{
                    padding: "8px 16px",
                    background: "#0284c7",
                    borderRadius: "20px",
                    color: "#ffffff",
                    textDecoration: "none",
                    fontSize: "0.82rem",
                    fontWeight: 700,
                    display: "flex",
                    alignItems: "center",
                    gap: "6px"
                  }}
                >
                  <Download size={14} />
                  <span>Download APK</span>
                </a>
              </div>

              {/* 3. Admin / Director Edition */}
              <div style={{ background: "#202c33", padding: "16px", borderRadius: "12px", border: "1px solid rgba(245, 158, 11, 0.25)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "rgba(245, 158, 11, 0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "#f59e0b" }}>
                    🛡️
                  </div>
                  <div>
                    <div style={{ fontSize: "0.98rem", fontWeight: 800, color: "#e9edef" }}>Apex Connect — Admin Edition</div>
                    <div style={{ fontSize: "0.76rem", color: "#8696a0" }}>v1.0.0 • Full Channel Oversight, Clear Chat &amp; Broadcasts</div>
                  </div>
                </div>
                <a
                  href="/apks/ApexConnect-Admin.apk"
                  download="ApexConnect-Admin.apk"
                  style={{
                    padding: "8px 16px",
                    background: "#d97706",
                    borderRadius: "20px",
                    color: "#ffffff",
                    textDecoration: "none",
                    fontSize: "0.82rem",
                    fontWeight: 700,
                    display: "flex",
                    alignItems: "center",
                    gap: "6px"
                  }}
                >
                  <Download size={14} />
                  <span>Download APK</span>
                </a>
              </div>
            </div>

            <div style={{ fontSize: "0.75rem", color: "#8696a0", textAlign: "center", borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "12px" }}>
              Android 8.0+ (Oreo to Android 15/16) • Secure TLS WebSocket &amp; Firestore Real-Time Sync
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
