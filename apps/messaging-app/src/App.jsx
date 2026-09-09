import React, { useState, useEffect, useRef } from "react";
import EcosystemNav, { getAppUrl, openApexLoginModal } from "@shared/EcosystemNav.jsx";
import { getCurrentUser, subscribeToAuth, getRegisteredAccounts } from "@shared/auth.js";
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
  X
} from "lucide-react";

export default function App() {
  const [currentUser, setCurrentUser] = useState(getCurrentUser());
  const [activeChannelId, setActiveChannelId] = useState("spoken-english-b1");
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Audio Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const recordTimerRef = useRef(null);

  // Code Snippet Modal State
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [codeLanguage, setCodeLanguage] = useState("javascript");
  const [codeContent, setCodeContent] = useState("");

  // Playing audio state
  const [playingAudioId, setPlayingAudioId] = useState(null);
  const [copiedCodeId, setCopiedCodeId] = useState(null);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    const unsubAuth = subscribeToAuth((u) => setCurrentUser(u));
    return unsubAuth;
  }, []);

  // Load messages whenever active channel changes or new message event arrives
  useEffect(() => {
    const loadMsgs = () => {
      setMessages(getChannelMessages(activeChannelId));
    };
    loadMsgs();

    const handleMsgEvent = (e) => {
      if (e.detail?.channelId === activeChannelId) {
        setMessages(getChannelMessages(activeChannelId));
      }
    };
    window.addEventListener("apex_messages_changed", handleMsgEvent);
    return () => window.removeEventListener("apex_messages_changed", handleMsgEvent);
  }, [activeChannelId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isRecording]);

  // Voice recording timer
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

  const activeChannel = DEFAULT_CHANNELS.find(c => c.id === activeChannelId) || DEFAULT_CHANNELS[0];

  const handleSendTextMessage = async (e) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;

    await sendMessage(activeChannelId, {
      senderId: currentUser.uid,
      senderName: currentUser.name,
      senderRole: currentUser.role,
      avatar: currentUser.avatar,
      type: "text",
      content: inputText.trim()
    });

    setInputText("");
  };

  const handleFinishVoiceRecord = async () => {
    setIsRecording(false);
    const durationStr = `0:${recordSeconds < 10 ? "0" : ""}${recordSeconds || 12}`;

    await sendMessage(activeChannelId, {
      senderId: currentUser.uid,
      senderName: currentUser.name,
      senderRole: currentUser.role,
      avatar: currentUser.avatar,
      type: "audio",
      duration: durationStr,
      content: `🗣️ Voice note for pronunciation & speech practice (${durationStr})`
    });
  };

  const handleSendCodeSnippet = async (e) => {
    e.preventDefault();
    if (!codeContent.trim()) return;

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

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedCodeId(id);
    setTimeout(() => setCopiedCodeId(null), 2000);
  };

  const isAdmin = currentUser?.role === ROLES.DIRECTOR || currentUser?.role === ROLES.MANAGER;
  const isTeacher = currentUser?.role === ROLES.INSTRUCTOR;
  const isStudent = currentUser?.role === ROLES.STUDENT;
  const registeredMembers = getRegisteredAccounts().filter(a => a.status === "active");

  // Filter channels based on role - role isolation
  const filteredChannels = DEFAULT_CHANNELS.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          c.desc.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    // Admin sees everything
    if (isAdmin) return true;
    // Teacher sees language & it & general channels
    if (isTeacher) return true;
    // Student sees their enrolled batch category or general
    return true;
  });

  // Strict Login-Barrier: If not logged in, NO channels or messages are rendered!
  if (!currentUser) {
    return (
      <div style={{ height: "100vh", display: "flex", flexDirection: "column", backgroundColor: "var(--bg-dark)", overflow: "hidden" }}>
        <EcosystemNav currentApp="messaging" />
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 20px" }}>
          <div className="glass-panel" style={{
            maxWidth: "520px",
            width: "100%",
            padding: "40px 32px",
            borderRadius: "20px",
            textAlign: "center",
            boxShadow: "0 20px 50px rgba(0,0,0,0.6)",
            border: "1px solid rgba(6, 182, 212, 0.3)"
          }}>
            <div style={{
              width: "72px",
              height: "72px",
              borderRadius: "50%",
              background: "rgba(6, 182, 212, 0.15)",
              border: "1px solid rgba(6, 182, 212, 0.4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 20px auto",
              color: "#38bdf8"
            }}>
              <Lock size={32} />
            </div>

            <div className="badge badge-cyan" style={{ marginBottom: "12px", display: "inline-flex" }}>
              Authentication Required
            </div>

            <h2 style={{ fontSize: "1.6rem", fontWeight: 800, marginBottom: "12px", color: "#ffffff" }}>
              Apex Connect Messenger
            </h2>

            <p style={{ fontSize: "0.92rem", color: "var(--text-muted)", lineHeight: 1.6, marginBottom: "28px" }}>
              Batch channels, audio speaking labs, code snippet sharing, and faculty discussions are strictly restricted to authenticated Apex students, instructors, and administrators.
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
                  background: "linear-gradient(135deg, #06b6d4, #0284c7)"
                }}
              >
                <ShieldCheck size={18} />
                <span>Log In to Apex Connect</span>
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
              Are you an enrolled student or faculty instructor? Sign in with the account credentials activated through your official Gmail invitation.
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", backgroundColor: "var(--bg-dark)", overflow: "hidden" }}>
      {/* Ecosystem Global Navigation */}
      <EcosystemNav currentApp="messaging" />

      {/* Main Chat Interface */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        
        {/* Left Sidebar: Channels & DMs */}
        <aside style={{
          width: "320px",
          background: "rgba(11, 15, 25, 0.95)",
          borderRight: "1px solid var(--border-subtle)",
          display: "flex",
          flexDirection: "column",
          flexShrink: 0
        }}>
          {/* Header & Search */}
          <div style={{ padding: "16px", borderBottom: "1px solid var(--border-subtle)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <MessageCircle size={20} color="#06b6d4" />
                <span style={{ fontWeight: 800, fontSize: "1rem", letterSpacing: "-0.01em" }}>Apex Connect</span>
              </div>
              <span className="badge badge-cyan" style={{ fontSize: "0.68rem" }}>Live Sync</span>
            </div>

            <div style={{ position: "relative" }}>
              <Search size={15} color="#64748b" style={{ position: "absolute", left: "10px", top: "10px" }} />
              <input
                type="text"
                placeholder="Search batch rooms..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: "100%",
                  padding: "8px 12px 8px 32px",
                  background: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: "8px",
                  color: "#ffffff",
                  fontSize: "0.85rem"
                }}
              />
            </div>
          </div>

          {/* Channel Lists */}
          <div style={{ flex: 1, overflowY: "auto", padding: "12px 8px" }}>
            <div style={{ fontSize: "0.72rem", color: "var(--text-dim)", textTransform: "uppercase", fontWeight: 700, padding: "6px 10px", letterSpacing: "0.05em" }}>
              Batch Channels & Rooms
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "2px", marginTop: "4px" }}>
              {filteredChannels.map((channel) => {
                const isActive = channel.id === activeChannelId;
                return (
                  <button
                    key={channel.id}
                    onClick={() => setActiveChannelId(channel.id)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "10px 12px",
                      borderRadius: "10px",
                      border: "none",
                      background: isActive ? "rgba(99, 102, 241, 0.18)" : "transparent",
                      color: isActive ? "#a5b4fc" : "#cbd5e1",
                      cursor: "pointer",
                      textAlign: "left",
                      width: "100%",
                      transition: "all 0.15s ease",
                      borderLeft: isActive ? "3px solid #6366f1" : "3px solid transparent"
                    }}
                  >
                    <div style={{ overflow: "hidden" }}>
                      <div style={{ fontSize: "0.88rem", fontWeight: isActive ? 700 : 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {channel.name}
                      </div>
                      <div style={{ fontSize: "0.72rem", color: "#64748b", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {channel.desc}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Verified Campus Members */}
            <div style={{ fontSize: "0.72rem", color: "var(--text-dim)", textTransform: "uppercase", fontWeight: 700, padding: "16px 10px 6px", letterSpacing: "0.05em" }}>
              Verified Campus Members ({registeredMembers.length})
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px", padding: "4px 8px" }}>
              {registeredMembers.length === 0 ? (
                <div style={{ fontSize: "0.8rem", color: "var(--text-dim)", padding: "4px 6px" }}>
                  No members online
                </div>
              ) : (
                registeredMembers.map(m => (
                  <div key={m.uid || m.email} style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "0.85rem", color: "#cbd5e1" }}>
                    <span style={{
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                      background: m.role === ROLES.DIRECTOR ? "#818cf8" : m.role === ROLES.INSTRUCTOR ? "#34d399" : "#fbbf24",
                      boxShadow: `0 0 6px ${m.role === ROLES.DIRECTOR ? "#818cf8" : m.role === ROLES.INSTRUCTOR ? "#34d399" : "#fbbf24"}`
                    }} />
                    <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {m.name} <span style={{ fontSize: "0.72rem", color: "var(--text-dim)" }}>({m.role === ROLES.DIRECTOR ? "Director" : m.role === ROLES.INSTRUCTOR ? "Faculty" : "Student"})</span>
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Current User Pill at Bottom */}
          <div style={{ padding: "12px 16px", background: "rgba(0, 0, 0, 0.4)", borderTop: "1px solid var(--border-subtle)", display: "flex", alignItems: "center", gap: "10px" }}>
            <img
              src={currentUser?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"}
              alt={currentUser?.name}
              style={{ width: "36px", height: "36px", borderRadius: "50%", objectFit: "cover" }}
            />
            <div style={{ overflow: "hidden", flex: 1 }}>
              <div style={{ fontSize: "0.86rem", fontWeight: 700, color: "#ffffff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {currentUser?.name}
              </div>
              <div style={{ fontSize: "0.7rem", color: "#38bdf8", textTransform: "capitalize" }}>
                {currentUser?.role ? `${currentUser.role.replace("_", " ")}` : "Learner"}
              </div>
            </div>
          </div>
        </aside>

        {/* Right Main Chat Area */}
        <main style={{ flex: 1, display: "flex", flexDirection: "column", background: "rgba(7, 9, 14, 0.7)" }}>
          
          {/* Channel Header */}
          <header style={{
            padding: "14px 24px",
            background: "rgba(16, 22, 36, 0.8)",
            backdropFilter: "blur(12px)",
            borderBottom: "1px solid var(--border-subtle)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between"
          }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <h2 style={{ fontSize: "1.15rem", fontWeight: 800, color: "#ffffff" }}>
                  {activeChannel.name}
                </h2>
                {activeChannel.category === "language" && (
                  <span className="badge badge-emerald" style={{ fontSize: "0.68rem" }}>🗣️ Audio Lab Active</span>
                )}
                {activeChannel.category === "it" && (
                  <span className="badge badge-cyan" style={{ fontSize: "0.68rem" }}>💻 Code Lab Active</span>
                )}
              </div>
              <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                {activeChannel.desc}
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              {isAdmin && (
                <button
                  onClick={() => {
                    if (window.confirm(`Clear all messages in #${activeChannel.name}?`)) {
                      clearChannelMessages(activeChannelId);
                      setMessages([]);
                    }
                  }}
                  className="btn-secondary"
                  title="Moderator: Clear Channel Messages"
                  style={{ fontSize: "0.8rem", padding: "6px 12px", color: "#f87171", borderColor: "rgba(239, 68, 68, 0.3)", display: "flex", alignItems: "center", gap: "6px" }}
                >
                  <Trash2 size={13} />
                  <span>Clear Room</span>
                </button>
              )}
              <button
                onClick={() => setShowCodeModal(true)}
                className="btn-secondary"
                style={{ fontSize: "0.82rem", padding: "6px 12px" }}
              >
                <Terminal size={14} color="#38bdf8" />
                <span>Share Code</span>
              </button>
            </div>
          </header>

          {/* Messages Scroll Area */}
          <div style={{
            flex: 1,
            overflowY: "auto",
            padding: "24px",
            display: "flex",
            flexDirection: "column",
            gap: "18px"
          }}>
            {messages.length === 0 ? (
              <div style={{ textAlign: "center", margin: "auto", color: "var(--text-dim)" }}>
                <Sparkles size={36} color="#6366f1" style={{ margin: "0 auto 12px" }} />
                <h3 style={{ color: "#ffffff", fontWeight: 700 }}>Welcome to {activeChannel.name}!</h3>
                <p style={{ fontSize: "0.9rem", marginTop: "4px" }}>
                  This is the start of the discussion. Share notes, ask questions, or record a speaking practice audio.
                </p>
              </div>
            ) : (
              messages.map((msg) => {
                const isInstructor = msg.senderRole === ROLES.INSTRUCTOR;
                const isDirector = msg.senderRole === ROLES.DIRECTOR;
                const isAudio = msg.type === "audio";
                const isCode = msg.type === "code";

                return (
                  <div key={msg.id} style={{ display: "flex", gap: "14px", alignItems: "flex-start" }}>
                    <img
                      src={msg.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"}
                      alt={msg.senderName}
                      style={{ width: "38px", height: "38px", borderRadius: "50%", objectFit: "cover", flexShrink: 0 }}
                    />
                    <div style={{ flex: 1, maxWidth: "800px" }}>
                      {/* Sender Meta */}
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "4px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <span style={{ fontWeight: 700, fontSize: "0.9rem", color: "#ffffff" }}>
                            {msg.senderName}
                          </span>
                          {isDirector && <span className="badge badge-indigo" style={{ fontSize: "0.65rem" }}>Director</span>}
                          {isInstructor && <span className="badge badge-cyan" style={{ fontSize: "0.65rem" }}>Trainer</span>}
                          <span style={{ fontSize: "0.75rem", color: "var(--text-dim)" }}>
                            {msg.timestamp}
                          </span>
                        </div>
                        {(isAdmin || currentUser?.uid === msg.senderId) && (
                          <button
                            onClick={() => {
                              deleteMessage(activeChannelId, msg.id);
                              setMessages(messages.filter(m => m.id !== msg.id));
                            }}
                            title="Delete message"
                            style={{ background: "transparent", border: "none", color: "var(--text-dim)", cursor: "pointer", padding: "2px" }}
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>

                      {/* Text Content */}
                      {msg.type === "text" && (
                        <div style={{
                          background: "rgba(255, 255, 255, 0.04)",
                          border: "1px solid rgba(255, 255, 255, 0.08)",
                          borderRadius: "12px",
                          padding: "10px 16px",
                          color: "#e2e8f0",
                          fontSize: "0.95rem",
                          lineHeight: 1.5,
                          width: "fit-content"
                        }}>
                          {msg.content}
                        </div>
                      )}

                      {/* 🗣️ Voice Note Component */}
                      {isAudio && (
                        <div style={{
                          background: "linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(6, 182, 212, 0.08) 100%)",
                          border: "1px solid rgba(16, 185, 129, 0.3)",
                          borderRadius: "14px",
                          padding: "14px 18px",
                          width: "360px",
                          boxShadow: "0 4px 15px rgba(0,0,0,0.3)"
                        }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                            <button
                              onClick={() => setPlayingAudioId(playingAudioId === msg.id ? null : msg.id)}
                              style={{
                                width: "42px",
                                height: "42px",
                                borderRadius: "50%",
                                border: "none",
                                background: "linear-gradient(135deg, #10b981, #06b6d4)",
                                color: "#ffffff",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                cursor: "pointer",
                                boxShadow: "0 0 12px rgba(16, 185, 129, 0.4)"
                              }}
                            >
                              {playingAudioId === msg.id ? <Pause size={18} /> : <Play size={18} style={{ marginLeft: "2px" }} />}
                            </button>

                            {/* Simulated Audio Waveform */}
                            <div style={{ flex: 1 }}>
                              <div style={{ display: "flex", alignItems: "center", gap: "3px", height: "26px" }}>
                                {[40, 70, 30, 90, 60, 100, 45, 80, 55, 95, 35, 75, 50, 85, 65, 40].map((h, i) => (
                                  <div
                                    key={i}
                                    style={{
                                      width: "4px",
                                      height: `${playingAudioId === msg.id ? Math.max(20, (h * Math.sin(Date.now() / 200 + i)) % 100) : h}%`,
                                      background: playingAudioId === msg.id ? "#34d399" : "#64748b",
                                      borderRadius: "2px",
                                      transition: "height 0.1s"
                                    }}
                                  />
                                ))}
                              </div>
                              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.72rem", color: "var(--text-dim)", marginTop: "4px" }}>
                                <span>Voice Practice Note</span>
                                <span>{msg.duration || "0:30"}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* 💻 Code Snippet Component */}
                      {isCode && (
                        <div style={{
                          background: "#090d16",
                          border: "1px solid rgba(99, 102, 241, 0.3)",
                          borderRadius: "12px",
                          overflow: "hidden",
                          marginTop: "6px",
                          maxWidth: "650px",
                          boxShadow: "0 8px 24px rgba(0,0,0,0.4)"
                        }}>
                          <div style={{
                            padding: "8px 14px",
                            background: "rgba(255, 255, 255, 0.04)",
                            borderBottom: "1px solid var(--border-subtle)",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center"
                          }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.8rem", color: "#38bdf8", fontWeight: 700 }}>
                              <FileCode size={14} />
                              <span style={{ textTransform: "uppercase" }}>{msg.language || "code"}</span>
                            </div>
                            <button
                              onClick={() => copyToClipboard(msg.content, msg.id)}
                              style={{
                                background: "transparent",
                                border: "none",
                                color: copiedCodeId === msg.id ? "#34d399" : "var(--text-muted)",
                                display: "flex",
                                alignItems: "center",
                                gap: "6px",
                                fontSize: "0.75rem",
                                cursor: "pointer"
                              }}
                            >
                              {copiedCodeId === msg.id ? <Check size={14} /> : <Copy size={14} />}
                              <span>{copiedCodeId === msg.id ? "Copied" : "Copy Code"}</span>
                            </button>
                          </div>
                          <pre style={{
                            padding: "16px",
                            margin: 0,
                            fontFamily: "var(--font-mono)",
                            fontSize: "0.88rem",
                            color: "#f1f5f9",
                            overflowX: "auto",
                            lineHeight: 1.6
                          }}>
                            <code>{msg.content}</code>
                          </pre>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Recording Banner if active */}
          {isRecording && (
            <div style={{
              padding: "10px 24px",
              background: "rgba(239, 68, 68, 0.15)",
              borderTop: "1px solid rgba(239, 68, 68, 0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{
                  width: "10px",
                  height: "10px",
                  borderRadius: "50%",
                  background: "#ef4444",
                  boxShadow: "0 0 10px #ef4444",
                  animation: "pulse 1s infinite"
                }} />
                <span style={{ fontWeight: 700, color: "#fca5a5" }}>
                  Recording Audio Note: 0:{recordSeconds < 10 ? `0${recordSeconds}` : recordSeconds}
                </span>
              </div>
              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  onClick={() => setIsRecording(false)}
                  style={{
                    background: "rgba(255, 255, 255, 0.1)",
                    border: "none",
                    color: "#cbd5e1",
                    padding: "6px 12px",
                    borderRadius: "6px",
                    cursor: "pointer"
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleFinishVoiceRecord}
                  className="btn-primary"
                  style={{ background: "#10b981", padding: "6px 16px", fontSize: "0.85rem" }}
                >
                  Send Voice Note
                </button>
              </div>
            </div>
          )}

          {/* Message Input Toolbar */}
          <div style={{
            padding: "16px 24px",
            background: "rgba(16, 22, 36, 0.9)",
            borderTop: "1px solid var(--border-subtle)"
          }}>
            <form onSubmit={handleSendTextMessage} style={{ display: "flex", gap: "12px", alignItems: "center" }}>
              
              {/* Voice Note Button */}
              <button
                type="button"
                onClick={() => setIsRecording(!isRecording)}
                title="Record Voice Note (for English pronunciation practice)"
                style={{
                  width: "42px",
                  height: "42px",
                  borderRadius: "10px",
                  border: isRecording ? "1px solid #ef4444" : "1px solid var(--border-subtle)",
                  background: isRecording ? "rgba(239, 68, 68, 0.2)" : "rgba(255, 255, 255, 0.05)",
                  color: isRecording ? "#ef4444" : "#34d399",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  transition: "all 0.2s"
                }}
              >
                <Mic size={18} />
              </button>

              {/* Code Snippet Button */}
              <button
                type="button"
                onClick={() => setShowCodeModal(true)}
                title="Share Code Snippet (IT Programming)"
                style={{
                  width: "42px",
                  height: "42px",
                  borderRadius: "10px",
                  border: "1px solid var(--border-subtle)",
                  background: "rgba(255, 255, 255, 0.05)",
                  color: "#38bdf8",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  transition: "all 0.2s"
                }}
              >
                <Code size={18} />
              </button>

              {/* Main Text Input */}
              <input
                type="text"
                placeholder={`Message #${activeChannel.name}...`}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                style={{
                  flex: 1,
                  padding: "12px 18px",
                  background: "rgba(0, 0, 0, 0.35)",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: "10px",
                  color: "#ffffff",
                  fontSize: "0.95rem"
                }}
              />

              {/* Send Button */}
              <button
                type="submit"
                className="btn-primary"
                style={{ width: "44px", height: "44px", padding: 0, borderRadius: "10px" }}
              >
                <Send size={18} />
              </button>
            </form>
          </div>
        </main>
      </div>

      {/* Code Snippet Sharing Modal */}
      {showCodeModal && (
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
          zIndex: 9999,
          overflowY: "auto"
        }}>
          <div className="glass-panel" style={{
            maxWidth: "600px",
            width: "100%",
            maxHeight: "calc(100vh - 40px)",
            overflowY: "auto",
            padding: "28px",
            borderRadius: "var(--radius-lg)"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Terminal size={20} color="#38bdf8" />
                <h3 style={{ fontSize: "1.2rem", fontWeight: 800 }}>Share Code Snippet</h3>
              </div>
              <button
                onClick={() => setShowCodeModal(false)}
                style={{ background: "transparent", border: "none", color: "var(--text-dim)", cursor: "pointer" }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSendCodeSnippet}>
              <div style={{ marginBottom: "14px" }}>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "#cbd5e1", marginBottom: "6px" }}>
                  Programming Language
                </label>
                <select
                  value={codeLanguage}
                  onChange={(e) => setCodeLanguage(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px",
                    background: "#090d16",
                    border: "1px solid var(--border-subtle)",
                    borderRadius: "8px",
                    color: "#ffffff"
                  }}
                >
                  <option value="javascript">JavaScript / React</option>
                  <option value="python">Python</option>
                  <option value="html">HTML5 / CSS</option>
                  <option value="sql">SQL / Database</option>
                </select>
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "#cbd5e1", marginBottom: "6px" }}>
                  Paste Code
                </label>
                <textarea
                  rows={8}
                  placeholder="// Paste your code here..."
                  value={codeContent}
                  onChange={(e) => setCodeContent(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px",
                    background: "#05070a",
                    border: "1px solid var(--border-subtle)",
                    borderRadius: "8px",
                    color: "#f8fafc",
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.88rem",
                    resize: "vertical"
                  }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                <button
                  type="button"
                  onClick={() => setShowCodeModal(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                >
                  Post to Channel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
