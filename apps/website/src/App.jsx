import React, { useState, useEffect, useRef } from "react";
import EcosystemNav, { getAppUrl } from "@shared/EcosystemNav.jsx";
import { getCourses, subscribeToCourses, submitInquiry, verifyCertificate, subscribeToCertificates } from "@shared/dataStore.js";
import ApexCertificate from "@shared/ApexCertificate.jsx";
import confetti from "canvas-confetti";
import { 
  Globe, 
  BookOpen, 
  Award, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Phone, 
  Mail, 
  Calendar, 
  Users, 
  ShieldCheck, 
  ExternalLink,
  ChevronDown,
  X,
  FileText,
  Search,
  Sparkles,
  ArrowRight,
  Printer
} from "lucide-react";

export default function App() {
  // Live Courses synchronized exclusively from Management LMS via Cloud Firestore
  const [courses, setCourses] = useState(getCourses());
  const [selectedCourseForForm, setSelectedCourseForForm] = useState("");
  const [syllabusModalCourse, setSyllabusModalCourse] = useState(null);
  const [showFacilitationModal, setShowFacilitationModal] = useState(false);
  const [showStudentPortalModal, setShowStudentPortalModal] = useState(false);
  const [successAdmission, setSuccessAdmission] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Active FAQ index
  const [activeFaq, setActiveFaq] = useState(0);

  // Certificate Verification state
  const [certQuery, setCertQuery] = useState("");
  const [certResult, setCertResult] = useState(null);
  const [certSearched, setCertSearched] = useState(false);
  const [showVerifiedCertModal, setShowVerifiedCertModal] = useState(false);

  // Fast-track Admission Form state
  const [formData, setFormData] = useState({
    candidateName: "",
    fatherName: "",
    email: "",
    password: "",
    whatsapp: "",
    courseId: "",
    slot: "Daily 04:00 PM - 05:30 PM (Regular Batch)",
    notes: ""
  });
  const [submittingForm, setSubmittingForm] = useState(false);

  // Facilitation Desk Form state
  const [facFormData, setFacFormData] = useState({
    name: "",
    whatsapp: "",
    service: "SJP Profile Audit & Document Upload"
  });
  const [facSuccess, setFacSuccess] = useState(false);

  // Anti-Gravity Physics Canvas Ref
  const canvasRef = useRef(null);

  // Real-time Firestore courses & certificates subscription (Management LMS is the Single Source of Truth)
  useEffect(() => {
    const unsubCourses = subscribeToCourses((liveCourses) => {
      setCourses(liveCourses);
      if (liveCourses.length > 0 && !selectedCourseForForm) {
        setSelectedCourseForForm(liveCourses[0].title);
        setFormData(prev => ({ ...prev, courseId: liveCourses[0].id }));
      }
    });

    const unsubCerts = subscribeToCertificates(() => {
      // Re-verify active query if user is currently viewing a result
      if (certQuery) {
        const updated = verifyCertificate(certQuery.trim());
        if (updated) setCertResult(updated);
      }
    });

    return () => {
      unsubCourses();
      unsubCerts();
    };
  }, [certQuery, selectedCourseForForm]);

  // Anti-Gravity Ambient Floating Particles Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId;
    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    };
    window.addEventListener("resize", handleResize);

    const particleColors = [
      "rgba(13, 71, 161, 0.25)",
      "rgba(21, 101, 192, 0.20)",
      "rgba(211, 47, 47, 0.18)",
      "rgba(245, 158, 11, 0.22)"
    ];

    class Particle {
      constructor() {
        this.reset();
        this.y = Math.random() * height;
      }
      reset() {
        this.x = Math.random() * width;
        this.y = height + 10;
        this.radius = 1.5 + Math.random() * 3.5;
        this.speedY = 0.3 + Math.random() * 0.7;
        this.speedX = (Math.random() - 0.5) * 0.4;
        this.color = particleColors[Math.floor(Math.random() * particleColors.length)];
        this.pulse = Math.random() * Math.PI;
        this.pulseSpeed = 0.02 + Math.random() * 0.02;
      }
      update() {
        this.y -= this.speedY;
        this.x += Math.sin(this.pulse) * 0.4 + this.speedX;
        this.pulse += this.pulseSpeed;
        if (this.y < -15 || this.x < -20 || this.x > width + 20) {
          this.reset();
        }
      }
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
      }
    }

    const particleCount = Math.min(Math.floor(window.innerWidth / 25), 40);
    const particles = [];
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      for (const p of particles) {
        p.update();
        p.draw();
      }
      animationFrameId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // 3D Tilt Card handler
  const [tiltStyle, setTiltStyle] = useState({});
  const handleTiltMouseMove = (e) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / rect.height) * -8;
    const rotateY = ((x - centerX) / rect.width) * 8;
    setTiltStyle({
      transform: `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-4px)`,
      transition: "transform 0.08s ease-out, box-shadow 0.2s ease"
    });
  };
  const handleTiltMouseLeave = () => {
    setTiltStyle({
      transform: "perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)",
      transition: "transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.4s ease"
    });
  };

  // Handle Admission Submission
  const handleSubmitAdmission = async (e) => {
    e.preventDefault();
    if (!formData.candidateName || !formData.email || !formData.whatsapp) return;

    setSubmittingForm(true);
    const selectedCourseObj = courses.find(c => c.id === formData.courseId || c.title === selectedCourseForForm);
    const courseTitle = selectedCourseObj ? selectedCourseObj.title : (selectedCourseForForm || "General Studies");

    const newRollNo = `APX-2025-${Math.floor(1000 + Math.random() * 9000)}`;

    try {
      await submitInquiry({
        name: formData.candidateName.trim(),
        fatherName: formData.fatherName.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password || "Apex1234",
        phone: formData.whatsapp.trim(),
        courseId: selectedCourseObj?.id || "",
        courseTitle: courseTitle,
        preferredSlot: formData.slot,
        notes: formData.notes.trim(),
        rollNo: newRollNo,
        status: "admitted"
      });

      const admissionSummary = {
        name: formData.candidateName.trim(),
        rollNo: newRollNo,
        courseTitle: courseTitle,
        slot: formData.slot,
        email: formData.email.trim(),
        whatsapp: formData.whatsapp.trim()
      };

      setSuccessAdmission(admissionSummary);
      confetti({ particleCount: 150, spread: 80, origin: { y: 0.5 } });

      // Reset form
      setFormData({
        candidateName: "",
        fatherName: "",
        email: "",
        password: "",
        whatsapp: "",
        courseId: courses[0]?.id || "",
        slot: "Daily 04:00 PM - 05:30 PM (Regular Batch)",
        notes: ""
      });
    } catch (err) {
      console.error("Admission submission error:", err);
      alert("Notice: Could not submit admission right now. Please verify your connection.");
    } finally {
      setSubmittingForm(false);
    }
  };

  // Certificate Verification
  const handleVerifyCertificate = (e) => {
    e.preventDefault();
    if (!certQuery.trim()) return;
    const res = verifyCertificate(certQuery.trim());
    setCertResult(res);
    setCertSearched(true);
  };

  // Quick Enrol click from course card
  const handleQuickEnrol = (courseTitle, courseId) => {
    setSelectedCourseForForm(courseTitle);
    setFormData(prev => ({ ...prev, courseId: courseId || prev.courseId }));
    const formSection = document.getElementById("fast-track-reserve");
    if (formSection) {
      formSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  // FAQs catalog
  const faqs = [
    {
      id: "faq-1",
      question: "Where is the campus located and what are the visiting hours?",
      answer: "Apex Education Forum is conveniently located in Aso Goth, Malir, Karachi, directly opposite Lal Building near the historic Malir Union Football Ground. The administrative admission desk is open Monday to Friday from 04:00 PM to 09:00 PM. Saturday is dedicated to orientation and testing consultations."
    },
    {
      id: "faq-2",
      question: "Are your computer and English certifications officially verified?",
      answer: "Yes. All Course Completion Certificates and Student Academy ID Cards issued by Apex Education Forum are serialized and feature real-time digital verification on this portal. Employers, schools, and government recruitment panels can instantly verify student credentials."
    },
    {
      id: "faq-3",
      question: "How does the Sindh Job Portal (SJP) and STS preparation service work?",
      answer: "We provide dedicated physical facilitation at our Malir campus for SJP candidate registration, CNIC/certificate document resizing, online application submissions, and fee challan generation. Concurrently, our specialized coaching batches prepare students for SIBA Testing Service (BPS-05 to 15) written tests."
    },
    {
      id: "faq-4",
      question: "Can I pay the tuition fee in monthly installments?",
      answer: "Yes, flexible installments are accommodated for all multi-month diploma programs and institutional tracks. Speak to the front desk coordinator upon admission to arrange your scheduled payment plan."
    },
    {
      id: "faq-5",
      question: "Can students access the Apex Connect Mobile & Web Ecosystem?",
      answer: "Absolutely. Enrolled students receive single sign-on credentials allowing them to access the Apex Connect messaging app, download course notes, view batch timetables, and access interactive exam test series across Android and Web."
    }
  ];

  return (
    <div className="min-h-screen bg-[#f9f9ff] text-slate-800 antialiased font-sans">
      {/* 0. Apex Unified Ecosystem Navigation */}
      <EcosystemNav currentApp="website" />

      {/* =========================================================================
           1. Top Utility Contact & Announcement Bar
           ========================================================================= */}
      <aside id="section-top-bar" className="dynamic-theme-banner-bg bg-[#071e42] text-slate-200 text-xs py-2 border-b border-white/10 relative z-30 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-y-2">
          <div className="flex items-center flex-wrap gap-x-6 gap-y-1">
            <a href="tel:+923222192266" className="flex items-center gap-1.5 hover:text-white transition-colors">
              <svg className="w-3.5 h-3.5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
              </svg>
              <span className="font-medium">+92 322 2192266</span>
            </a>
            <a href="mailto:admissions@apexeducationforum.org" className="hidden md:flex items-center gap-1.5 hover:text-white transition-colors">
              <svg className="w-3.5 h-3.5 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
              </svg>
              <span>admissions@apexeducationforum.org</span>
            </a>
            <span className="hidden lg:flex items-center gap-1.5 text-slate-300">
              <svg className="w-3.5 h-3.5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
              <span>Aso Goth, Malir, Karachi (Opp. Laal Building Near Football Ground)</span>
            </span>
          </div>

          <div className="flex items-center gap-4">
            <span className="hidden sm:inline-block text-slate-300">
              Mon – Fri: <strong className="text-white font-semibold">04:00 PM - 09:00 PM</strong>
            </span>
            <div className="flex items-center gap-2 pl-2 border-l border-white/10">
              <a href="https://wa.me/923222192266" target="_blank" rel="noopener noreferrer" className="text-slate-300 hover:text-emerald-400 transition-colors p-1" title="Chat on WhatsApp">
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.299.144.35.49 1.199.533 1.286.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.861.174.086.275.072.376-.044.102-.115.434-.506.549-.68.116-.173.232-.144.39-.087.159.058 1.011.477 1.184.564.173.087.289.13.332.203.043.072.043.419-.101.824z"/></svg>
              </a>
              <button 
                onClick={() => setShowStudentPortalModal(true)} 
                className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] px-2.5 py-0.5 rounded transition-all shadow-xs" 
                title="Open Student Single Sign-On Portal"
              >
                <Users className="w-3 h-3 text-white" />
                <span>Student Portal</span>
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* =========================================================================
           2. Main Institutional Header
           ========================================================================= */}
      <header className="bg-white/95 backdrop-blur-md sticky top-0 z-40 border-b border-slate-200 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <a href="#" className="flex items-center gap-3.5 group">
              <div className="w-12 h-12 rounded-full brand-gradient p-0.5 shadow-md flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                <div className="w-full h-full bg-white rounded-full flex items-center justify-center border border-white">
                  <span className="font-extrabold text-cobalt-800 text-base tracking-tighter">AEF</span>
                </div>
              </div>
              <div>
                <span className="text-base sm:text-lg font-black tracking-tight text-slate-900 leading-tight block">
                  APEX EDUCATION FORUM
                </span>
                <span className="text-[10px] font-bold text-slate-400 tracking-wider block">
                  COMMITTED TO SERVE &amp; EXCEL &bull; ESTD 2017
                </span>
              </div>
            </a>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center space-x-7 text-[13.5px] font-semibold text-slate-700">
              <a href="#" className="text-cobalt-700 font-bold hover:text-cobalt-800 transition-colors">HOME</a>
              <a href="#section-courses" className="hover:text-cobalt-700 transition-colors">Courses &amp; Programs</a>
              <a href="#section-courses" className="hover:text-cobalt-700 transition-colors">IBA &amp; Test Prep</a>
              <button onClick={() => setShowFacilitationModal(true)} className="hover:text-cobalt-700 transition-colors flex items-center gap-1 cursor-pointer">
                <span>Facilitation Desk</span>
                <span className="bg-red-100 text-crimson-600 text-[10px] font-bold px-1.5 py-0.5 rounded">SJP</span>
              </button>
              <a href="#section-verify-desk" className="text-emerald-700 hover:text-emerald-800 font-bold transition-colors flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Verify Credential</span>
              </a>
              <a href="#fast-track-reserve" className="hover:text-cobalt-700 transition-colors">Admissions</a>
              <a href="#campus-directions" className="hover:text-cobalt-700 transition-colors">Contact &amp; Location</a>
            </nav>

            {/* Header CTA */}
            <div className="hidden sm:flex items-center gap-2.5">
              <button 
                onClick={() => setShowStudentPortalModal(true)} 
                className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold px-3.5 py-2.5 rounded-lg border border-slate-300/80 transition-all shadow-xs"
              >
                <Users className="w-4 h-4 text-cobalt-700" />
                <span>Student Portal</span>
              </button>

              <a href="#fast-track-reserve" className="dynamic-theme-accent-bg inline-flex items-center gap-2 bg-crimson-600 hover:bg-crimson-700 text-white text-xs font-bold px-4 py-2.5 rounded-lg shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 active:translate-y-0">
                <FileText className="w-4 h-4" />
                <span>Register Fast-track</span>
              </a>

              {/* Faculty Pill */}
              <div className="hidden xl:flex items-center gap-2 pl-3 border-l border-slate-200">
                <div className="w-8 h-8 rounded-full bg-cobalt-100 border border-cobalt-200 flex items-center justify-center text-cobalt-800 font-bold text-xs">
                  AF
                </div>
                <div className="text-[11px] leading-tight">
                  <p className="font-bold text-slate-800">Faculty Coordinator</p>
                  <span className="inline-flex items-center text-emerald-600 font-semibold gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                    On Campus
                  </span>
                </div>
              </div>
            </div>

            {/* Mobile Hamburger */}
            <div className="lg:hidden flex items-center">
              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"/>
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-b border-slate-200 px-4 pt-3 pb-5 space-y-2 shadow-xl">
            <a href="#" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-md font-bold text-cobalt-700 bg-cobalt-50">HOME</a>
            <a href="#section-courses" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-md font-semibold text-slate-700 hover:bg-slate-50">Courses &amp; Academic Programs</a>
            <a href="#section-courses" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-md font-semibold text-slate-700 hover:bg-slate-50">IBA &amp; STS Test Prep</a>
            <button onClick={() => { setShowFacilitationModal(true); setMobileMenuOpen(false); }} className="w-full text-left block px-3 py-2 rounded-md font-semibold text-slate-700 hover:bg-slate-50">Sindh Job Portal Facilitation</button>
            <a href="#fast-track-reserve" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-md font-semibold text-slate-700 hover:bg-slate-50">Admissions &amp; Registration</a>
            <a href="#section-verify-desk" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-md font-bold text-emerald-700 hover:bg-emerald-50">Verify Credential &amp; Certificate</a>
            <a href="#campus-directions" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-md font-semibold text-slate-700 hover:bg-slate-50">Campus Directions &amp; Contact</a>
            <div className="pt-3">
              <a href="#fast-track-reserve" onClick={() => setMobileMenuOpen(false)} className="block w-full text-center bg-crimson-600 text-white font-bold py-2.5 rounded-lg shadow">
                Register Fast-track Seat
              </a>
            </div>
          </div>
        )}
      </header>

      {/* =========================================================================
           3. Admissions Announcement Ribbon Ticker
           ========================================================================= */}
      <div id="section-ticker" className="bg-gradient-to-r from-cobalt-50 via-white to-blue-50 border-b border-cobalt-100 py-2.5 px-4 text-xs font-medium text-slate-700">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="dynamic-theme-accent-bg inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-crimson-600 text-white uppercase tracking-wider animate-pulse">
              ADMISSIONS OPEN
            </span>
            <span>Daily evening batch commences 12th May. Limited seats available in intensive English &amp; STS prep.</span>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <button onClick={() => setShowFacilitationModal(true)} className="text-cobalt-700 hover:text-cobalt-900 font-semibold underline decoration-cobalt-300 cursor-pointer">
              Sindh Job Portal Registration Desk
            </button>
            <span className="text-slate-300">|</span>
            <a href="tel:+923222192266" className="dynamic-theme-accent-text text-crimson-600 font-bold hover:underline">
              Call: +92 322 2192266
            </a>
          </div>
        </div>
      </div>

      <main>
        {/* =========================================================================
             4. Hero Section with Anti-Gravity Physics Canvas & 3D Interactive Card
             ========================================================================= */}
        <section className="relative pt-12 pb-20 overflow-hidden subtle-grid">
          <canvas ref={canvasRef} id="antigravity-canvas"></canvas>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              
              {/* Left Column */}
              <div className="lg:col-span-7 space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-slate-200 shadow-sm text-xs font-bold text-cobalt-800">
                  <span className="w-2 h-2 rounded-full bg-cobalt-600"></span>
                  <span>EMPOWER YOUR CAREER WITH RECOGNIZED CERTIFICATION</span>
                </div>

                <h1 className="text-4xl sm:text-5xl xl:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.12]">
                  Empowering Your <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-cobalt-700 via-cobalt-800 to-crimson-600">
                    Academic &amp; Career
                  </span> Ambitions
                </h1>

                <p className="text-base sm:text-lg text-slate-600 max-w-2xl leading-relaxed">
                  Master fluent English, acquire marketplace digital competencies, and prepare with institutional rigor for Sukkur IBA, STS, and competitive tests right in the heart of Malir.
                </p>

                <div className="flex flex-wrap items-center gap-4 pt-2">
                  <a href="#fast-track-reserve" className="dynamic-theme-accent-bg inline-flex items-center gap-2.5 bg-crimson-600 hover:bg-crimson-700 text-white font-extrabold px-6 py-3.5 rounded-xl shadow-lg shadow-crimson-600/20 hover:shadow-crimson-600/30 transition-all text-sm">
                    <span>Fast-track Admission Intake</span>
                    <ArrowRight className="w-4 h-4" />
                  </a>

                  <a href="tel:+923222192266" className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-800 font-bold px-5 py-3.5 rounded-xl border border-slate-300/80 shadow-sm text-sm transition-all">
                    <Phone className="w-4 h-4 text-cobalt-700" />
                    <span>Call: +92 322 2192266</span>
                  </a>
                </div>

                {/* Metrics */}
                <div className="pt-6 grid grid-cols-3 gap-6 border-t border-slate-200/80">
                  <div>
                    <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight block">2,500+</span>
                    <span className="text-xs text-slate-500 font-medium">Enrolled Scholars</span>
                  </div>
                  <div>
                    <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight block">98%</span>
                    <span className="text-xs text-slate-500 font-medium">Completion Ratio</span>
                  </div>
                  <div>
                    <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight block">8+ Yrs</span>
                    <span className="text-xs text-slate-500 font-medium">Community Trust</span>
                  </div>
                </div>
              </div>

              {/* Right Column: 3D Interactive Card */}
              <div className="lg:col-span-5">
                <div className="tilt-container">
                  <div 
                    onMouseMove={handleTiltMouseMove}
                    onMouseLeave={handleTiltMouseLeave}
                    style={tiltStyle}
                    className="tilt-card bg-white rounded-3xl p-7 sm:p-8 shadow-2xl border border-slate-200/90 relative"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <span className="inline-block px-3 py-1 rounded-full text-xs font-extrabold bg-red-100 text-crimson-600 uppercase tracking-wide">
                        Fast-track Evening Batch
                      </span>
                      <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                        Seats Open
                      </span>
                    </div>

                    <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Intensive Admissions Open</h2>
                    <p className="text-xs text-slate-500 mt-1 mb-5">Monitored 1:1 Coaching and Structured Training</p>

                    {/* Cohort Details */}
                    <div className="space-y-3 bg-slate-50/80 rounded-xl p-4 border border-slate-100 text-xs mb-5">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600 flex items-center gap-2">
                          <Clock className="w-4 h-4 text-cobalt-600" />
                          Daily Class Timing:
                        </span>
                        <span className="dynamic-theme-primary-bg font-bold bg-cobalt-700 text-white px-2.5 py-1 rounded-md text-[11px]">
                          04:00 PM - 09:00 PM
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-slate-600 flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-emerald-600" />
                          Batch Starts:
                        </span>
                        <span className="font-bold text-slate-800">Monday, 12th May</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-slate-600 flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-amber-500" />
                          Location:
                        </span>
                        <span className="font-semibold text-slate-700">Opp. Laal Building, Aso Goth</span>
                      </div>
                    </div>

                    {/* Features */}
                    <ul className="space-y-2.5 text-xs text-slate-700 mb-6">
                      <li className="flex items-start gap-2.5">
                        <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <CheckCircle2 className="w-3 h-3" />
                        </div>
                        <span>Personalized Training &amp; Pronunciation Mentorship</span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <CheckCircle2 className="w-3 h-3" />
                        </div>
                        <span>Dedicated Core i5/i7 Desktop Lab for Hands-on Skills</span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <CheckCircle2 className="w-3 h-3" />
                        </div>
                        <span>Sindh Job Portal / STS Registration &amp; Fee Filing Assistance</span>
                      </li>
                    </ul>

                    {/* Capacity Bar */}
                    <div className="mb-5 bg-slate-100 rounded-xl p-3 border border-slate-200">
                      <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                        <span className="text-slate-700">Current Cohort Capacity</span>
                        <span className="text-crimson-600">84% Booked</span>
                      </div>
                      <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                        <div className="bg-gradient-to-r from-cobalt-600 to-crimson-600 h-full w-[84%] transition-all duration-500"></div>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1 font-medium text-right">
                        Only <span className="font-bold text-crimson-600">4 spots remaining</span> for this intake
                      </p>
                    </div>

                    <a href="#fast-track-reserve" className="dynamic-theme-primary-bg block w-full text-center bg-cobalt-700 hover:bg-cobalt-800 text-white font-bold py-3.5 rounded-xl shadow-md hover:shadow-lg transition-all">
                      Apply for Current Batch &rarr;
                    </a>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* =========================================================================
             5. Institutional Courses & Programs
             Single Source of Truth: Synchronized Exclusively with Management LMS
             ========================================================================= */}
        <section id="section-courses" className="py-20 bg-[#f9f9ff]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
              <div>
                <p className="text-xs font-bold text-crimson-600 uppercase tracking-widest mb-1.5">CURRICULUM &amp; TRAINING</p>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">Institutional Courses &amp; Programs</h2>
              </div>
              <div className="text-xs sm:text-sm text-slate-600 max-w-md">
                <p>Every program is structured around practical marketplace competence and institutional performance in Malir and across Sindh.</p>
                <span className="inline-flex items-center gap-1.5 text-cobalt-700 font-bold mt-1 text-[11px]">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  Live Management Portal Synced ({courses.length} Active {courses.length === 1 ? "Program" : "Programs"})
                </span>
              </div>
            </div>

            {/* Courses Grid */}
            {courses.length === 0 ? (
              <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-xl mx-auto shadow-sm">
                <div className="w-16 h-16 rounded-2xl bg-blue-50 text-cobalt-700 flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">No Courses Scheduled</h3>
                <p className="text-xs text-slate-500 mb-6">
                  Admissions are currently finalizing upcoming cohort schedules. Please contact the front desk or submit an inquiry.
                </p>
                <a href="#fast-track-reserve" className="inline-flex items-center gap-2 bg-cobalt-700 text-white font-bold text-xs px-5 py-3 rounded-xl shadow">
                  Submit Admission Inquiry
                </a>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {courses.map((course) => {
                  return (
                    <div key={course.id} className="tilt-container">
                      <div className="tilt-card bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition-all h-full">
                        <div>
                          <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 rounded-xl bg-blue-50 text-cobalt-700 flex items-center justify-center">
                              <BookOpen className="w-6 h-6" />
                            </div>
                            <span className="inline-block px-2.5 py-1 rounded text-[10px] font-bold bg-blue-50 text-cobalt-700 border border-blue-200">
                              {course.badge || course.category || "Certificate Program"}
                            </span>
                          </div>

                          <h3 className="text-lg font-bold text-slate-900 mb-1.5">{course.title}</h3>
                          {course.tagline && (
                            <p className="text-xs text-slate-500 mb-3 line-clamp-2 leading-relaxed">{course.tagline}</p>
                          )}

                          {/* Fee & Duration Pill */}
                          <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-100 flex items-center justify-between text-[11px] mb-3">
                            <span className="text-slate-600 font-medium">Fee: <strong>Rs. {Number(course.fee || 0).toLocaleString()}</strong></span>
                            <span className="text-cobalt-700 font-bold">{course.duration || "3 Months"}</span>
                          </div>

                          {/* Instructor & Class Timing */}
                          <div className="bg-blue-50/50 rounded-xl p-2.5 border border-blue-100/60 mb-4 text-[11px] space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="text-slate-500">Instructor:</span>
                              <span className="font-bold text-cobalt-900">{course.instructorName || "Assigned Faculty"}</span>
                            </div>
                            {course.sessionsPerWeek && (
                              <div className="flex items-center justify-between text-[10.5px]">
                                <span className="text-slate-500">Class Timings:</span>
                                <span className="font-semibold text-slate-700">{course.sessionsPerWeek}</span>
                              </div>
                            )}
                          </div>

                          {/* Modules List */}
                          <div className="mb-5">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Core Modules</p>
                            <ul className="text-xs text-slate-600 space-y-1.5">
                              {(course.modules && course.modules.length > 0 ? course.modules.slice(0, 3) : [
                                "Core Foundations & Program Overview",
                                "Applied Practical Projects & Practical Labs",
                                "Industry Capstone & Final Evaluation"
                              ]).map((mod, mIdx) => (
                                <li key={mIdx} className="flex items-start gap-2">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                                  <span className="line-clamp-1">{typeof mod === "string" ? mod : mod.title || "Module"}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        <div className="space-y-2 pt-4 border-t border-slate-100">
                          <button 
                            onClick={() => setSyllabusModalCourse(course)}
                            className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold py-2 rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>View Syllabus &amp; Modules</span>
                          </button>

                          <button 
                            onClick={() => handleQuickEnrol(course.title, course.id)}
                            className="dynamic-theme-primary-bg w-full bg-cobalt-700 hover:bg-cobalt-800 text-white text-xs font-bold py-2.5 rounded-lg shadow transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <span>Enrol Fast-track &rarr;</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* =========================================================================
             7. Strategic Malir Location & Rigor Banner
             ========================================================================= */}
        <section id="section-campus-rigor" className="dynamic-theme-primary-bg bg-cobalt-700 text-white py-16 relative overflow-hidden">
          <div className="absolute -right-20 -bottom-20 w-96 h-96 rounded-full bg-white/10 blur-3xl pointer-events-none"></div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-8 space-y-5">
                <span className="text-xs font-bold tracking-widest text-blue-200 uppercase">STRATEGIC MALIR LOCATION</span>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight leading-tight">
                  Structured Classroom Rigor, Right Next to Malir Union Football Ground
                </h2>
                <p className="text-sm sm:text-base text-blue-100 max-w-2xl leading-relaxed">
                  Proximity to the historic sports ground provides a focused, dynamic, yet peaceful student environment. Dedicated labs and multimedia classrooms facilitate intensive academic immersion.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/15">
                    <div className="font-bold text-sm text-white mb-1 flex items-center gap-2">
                      <Award className="w-4 h-4 text-amber-300" />
                      <span>Recognized Benchmark</span>
                    </div>
                    <p className="text-xs text-blue-200">
                      Opposite Lal Building Near Football Ground, Aso Goth, Malir, Karachi.
                    </p>
                  </div>

                  <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/15">
                    <div className="font-bold text-sm text-white mb-1 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-emerald-300" />
                      <span>Modern Tech Infra</span>
                    </div>
                    <p className="text-xs text-blue-200">
                      Dedicated computer lab and audio-visual studios for interactive practical learning.
                    </p>
                  </div>
                </div>
              </div>

              {/* Consultation Card */}
              <div className="lg:col-span-4">
                <div className="bg-white text-slate-800 rounded-2xl p-6 sm:p-7 shadow-2xl border border-white/20 text-center">
                  <div className="w-12 h-12 rounded-full bg-blue-100 text-cobalt-700 flex items-center justify-center mx-auto mb-3">
                    <Phone className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-1">Need Course Guidance?</h3>
                  <p className="text-xs text-slate-500 mb-5">
                    Speak directly with faculty coordinators between 04:00 PM and 09:00 PM.
                  </p>
                  <a href="tel:+923222192266" className="dynamic-theme-accent-bg w-full inline-flex items-center justify-center gap-2 bg-crimson-600 hover:bg-crimson-700 text-white font-bold py-3.5 rounded-xl shadow-md transition-all text-sm">
                    <Phone className="w-4 h-4" />
                    <span>+92 322 2192266</span>
                  </a>
                  <p className="text-[10px] text-slate-400 mt-2 font-medium">Direct Phone &amp; WhatsApp Support</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
             8. Frequently Asked Questions
             ========================================================================= */}
        <section id="section-faqs" className="py-20 bg-white border-b border-slate-200/80">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-14">
              <p className="text-xs font-bold text-crimson-600 uppercase tracking-widest mb-1.5">FREQUENTLY ASKED QUESTIONS</p>
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Student &amp; Parent Inquiries</h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-2">Clear guidance on registration schedules, accreditation, and facility access.</p>
            </div>

            <div className="space-y-4">
              {faqs.map((faq, idx) => {
                const isOpen = activeFaq === idx;
                return (
                  <div key={faq.id} className={`faq-item border border-slate-200 rounded-2xl p-5 bg-[#fcfdff] transition-all ${isOpen ? "active border-cobalt-300 shadow-sm" : ""}`}>
                    <button 
                      onClick={() => setActiveFaq(isOpen ? -1 : idx)}
                      className="faq-trigger w-full flex items-center justify-between text-left font-bold text-sm sm:text-base text-slate-900 cursor-pointer"
                    >
                      <span>{faq.question}</span>
                      <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-300 shrink-0 ${isOpen ? "rotate-180 text-cobalt-700" : ""}`} />
                    </button>
                    {isOpen && (
                      <div className="pt-3 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 mt-3">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* =========================================================================
             9. Fast-Track Reserve Admission Form
             ========================================================================= */}
        <section id="fast-track-reserve" className="py-20 bg-[#f9f9ff]">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-cobalt-800 mb-3">
                CAMPUS ADMISSIONS DESK
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                Reserve Fast-Track Intake Seat
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-2">
                Fill the form below to secure immediate admission. Your digital student identity card will be generated in real time.
              </p>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-7 sm:p-10 relative">
              <form onSubmit={handleSubmitAdmission} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Candidate Full Name *</label>
                    <input 
                      type="text" 
                      required 
                      value={formData.candidateName}
                      onChange={(e) => setFormData({ ...formData, candidateName: e.target.value })}
                      placeholder="e.g. Tariq Ahmed Baloch" 
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs sm:text-sm focus:ring-2 focus:ring-cobalt-600 focus:border-cobalt-600 outline-none bg-slate-50/50"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Father's Name</label>
                    <input 
                      type="text" 
                      value={formData.fatherName}
                      onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })}
                      placeholder="e.g. Ghulam Rasool Baloch" 
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs sm:text-sm focus:ring-2 focus:ring-cobalt-600 focus:border-cobalt-600 outline-none bg-slate-50/50"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Student Email (Unified Login ID) *</label>
                    <input 
                      type="email" 
                      required 
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="e.g. student@gmail.com" 
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs sm:text-sm focus:ring-2 focus:ring-cobalt-600 focus:border-cobalt-600 outline-none bg-slate-50/50"
                    />
                    <span className="text-[10px] text-slate-400 mt-1 block">Used for both Web Portal &amp; Apex Connect App</span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Account Password *</label>
                    <input 
                      type="password" 
                      required 
                      minLength={6}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="Choose a password (min 6 chars)" 
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs sm:text-sm focus:ring-2 focus:ring-cobalt-600 focus:border-cobalt-600 outline-none bg-slate-50/50"
                    />
                    <span className="text-[10px] text-slate-400 mt-1 block">Keep this safe to log in across portals</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">WhatsApp Contact Number *</label>
                    <input 
                      type="tel" 
                      required 
                      value={formData.whatsapp}
                      onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                      placeholder="e.g. +92 322 2192266" 
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs sm:text-sm focus:ring-2 focus:ring-cobalt-600 focus:border-cobalt-600 outline-none bg-slate-50/50"
                    />
                  </div>

                  {/* Dynamic Course Track mapped exclusively from Management LMS */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Course / Academic Track *</label>
                    <select 
                      value={selectedCourseForForm}
                      onChange={(e) => {
                        setSelectedCourseForForm(e.target.value);
                        const match = courses.find(c => c.title === e.target.value);
                        setFormData({ ...formData, courseId: match?.id || "" });
                      }}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs sm:text-sm focus:ring-2 focus:ring-cobalt-600 focus:border-cobalt-600 outline-none bg-slate-50/50"
                    >
                      {courses.length === 0 ? (
                        <option value="">No courses currently scheduled</option>
                      ) : (
                        courses.map(c => (
                          <option key={c.id} value={c.title}>
                            {c.title} (Fee: Rs. {Number(c.fee || 0).toLocaleString()})
                          </option>
                        ))
                      )}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Preferred Slot / Timing *</label>
                    <select 
                      value={formData.slot}
                      onChange={(e) => setFormData({ ...formData, slot: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs sm:text-sm focus:ring-2 focus:ring-cobalt-600 focus:border-cobalt-600 outline-none bg-slate-50/50"
                    >
                      <option value="Daily 04:00 PM - 05:30 PM (Regular Batch)">Daily 04:00 PM - 05:30 PM (Regular Batch)</option>
                      <option value="Daily 05:30 PM - 07:00 PM (Prime Batch)">Daily 05:30 PM - 07:00 PM (Prime Batch)</option>
                      <option value="Daily 07:00 PM - 08:30 PM (Night Batch)">Daily 07:00 PM - 08:30 PM (Night Batch)</option>
                      <option value="Weekend Special Lab Schedule">Weekend Special Lab Schedule</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Current Education / Goals</label>
                    <input 
                      type="text" 
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="e.g. Matric / Inter / Graduation / STS Job Prep" 
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs sm:text-sm focus:ring-2 focus:ring-cobalt-600 focus:border-cobalt-600 outline-none bg-slate-50/50"
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={submittingForm}
                  className="dynamic-theme-accent-bg w-full py-4 px-6 bg-crimson-600 hover:bg-crimson-700 text-white font-extrabold text-sm sm:text-base rounded-xl shadow-lg shadow-crimson-600/30 hover:shadow-xl hover:shadow-crimson-600/40 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  <span>{submittingForm ? "Processing Admission..." : "Submit Admission & Create Student ID"}</span>
                </button>

                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-[11px] text-emerald-800 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span><strong>Unified Database Sync:</strong> Submitting instantly creates your Student Profile for both the <strong>Website Student Portal</strong> and the <strong>Apex Connect Android App</strong>.</span>
                </div>
              </form>
            </div>
          </div>
        </section>

        {/* =========================================================================
             9b. Official Credential Verification Desk Section
             ========================================================================= */}
        <section id="section-verify-desk" className="py-16 bg-gradient-to-br from-slate-900 via-cobalt-950 to-slate-900 text-white relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 sm:p-12 border border-white/20 shadow-2xl flex flex-col lg:flex-row items-center justify-between gap-8">
              <div className="space-y-3 max-w-xl text-center lg:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>INSTITUTIONAL REGISTRY LOOKUP</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                  Official Credential &amp; Certificate Verification
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Employers, institutions, and trainees can verify Course Completion Certificates, Student Academy Cards, and Faculty credentials via Serial Number in real time.
                </p>
              </div>

              <div className="w-full lg:w-auto flex flex-col sm:flex-row items-center gap-3">
                <div className="relative w-full sm:w-80">
                  <input 
                    type="text" 
                    value={certQuery}
                    onChange={(e) => setCertQuery(e.target.value)}
                    placeholder="Enter Serial or Roll No..." 
                    className="w-full h-12 px-4 rounded-xl bg-white/90 focus:bg-white text-slate-900 placeholder:text-slate-500 font-mono text-xs sm:text-sm outline-none shadow-md"
                    onKeyPress={(e) => { if (e.key === "Enter") handleVerifyCertificate(e); }}
                  />
                </div>
                <button 
                  onClick={handleVerifyCertificate}
                  className="w-full sm:w-auto h-12 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
                >
                  <Search className="w-4 h-4" />
                  <span>Verify Now</span>
                </button>
              </div>
            </div>

            {/* Verification Result Display */}
            {certSearched && (
              <div className="mt-6 max-w-2xl mx-auto">
                {certResult && certResult.valid ? (
                  <div className="bg-emerald-950/80 border border-emerald-500/50 rounded-2xl p-6 text-white backdrop-blur-md">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                        <CheckCircle2 className="w-6 h-6" />
                      </div>
                      <div>
                        <span className="text-xs text-emerald-400 font-bold uppercase tracking-wider">Official Certificate Verified</span>
                        <h4 className="text-lg font-extrabold">{certResult.studentName || "Verified Scholar"}</h4>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-xs bg-black/30 p-3 rounded-xl border border-white/10 font-mono">
                      <div>Serial: <strong className="text-amber-300">{certResult.certificateNumber || certResult.id}</strong></div>
                      <div>Roll No: <strong className="text-emerald-300">{certResult.rollNumber || "APX-VERIFIED"}</strong></div>
                      <div>Course: <strong>{certResult.courseTitle || "Professional Program"}</strong></div>
                      <div>Issue Date: <strong>{certResult.issueDate || "Official"}</strong></div>
                    </div>

                    <div className="mt-4 flex justify-end">
                      <button
                        type="button"
                        onClick={() => setShowVerifiedCertModal(true)}
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl font-bold text-xs shadow-lg transition-all cursor-pointer"
                      >
                        <Award className="w-4 h-4" />
                        <span>View &amp; Print Official Certificate</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-red-950/80 border border-red-500/50 rounded-2xl p-6 text-white backdrop-blur-md text-center">
                    <p className="text-sm font-bold text-red-300">Certificate or Roll Number not found in active registry.</p>
                    <p className="text-xs text-slate-400 mt-1">Please check the serial format or contact the campus administration desk.</p>
                  </div>
                )}
              </div>
            )}

            {/* Modal for Verified Official Certificate */}
            {showVerifiedCertModal && certResult && (
              <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center p-4 z-[99999] overflow-y-auto">
                <div className="w-full max-w-5xl flex items-center justify-between mb-3 bg-slate-900/90 px-4 py-3 rounded-xl border border-white/10 shadow-2xl">
                  <div className="flex items-center gap-3 text-white">
                    <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                      <Award className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm sm:text-base">Verified Institutional Credential</h4>
                      <p className="text-xs text-slate-400">Authentic Apex Education Forum Accredited Certificate</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => window.print()}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shadow cursor-pointer"
                    >
                      <Printer className="w-4 h-4" />
                      <span>Print (A4)</span>
                    </button>
                    <button
                      onClick={() => setShowVerifiedCertModal(false)}
                      className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg cursor-pointer"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="max-w-full overflow-x-auto flex justify-center p-2">
                  <div className="shadow-2xl rounded-sm overflow-hidden">
                    <ApexCertificate
                      studentName={certResult.studentName}
                      courseTitle={certResult.courseTitle}
                      duration={certResult.duration || "Six Months"}
                      issueDate={certResult.issueDate}
                      rollNumber={certResult.rollNumber || certResult.certificateId}
                      certificateNumber={certResult.certificateNumber || certResult.certificateId}
                      directorName={certResult.directorName || "Yasir Ali"}
                      directorTitle={certResult.directorTitle || "Director"}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* =========================================================================
             10. Physical Campus & Directions
             ========================================================================= */}
        <section id="campus-directions" className="py-20 bg-white border-t border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-12">
              <p className="text-xs font-bold text-crimson-600 uppercase tracking-widest mb-1.5">PHYSICAL CAMPUS &amp; DIRECTIONS</p>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">Visit Apex in Malir</h2>
              <p className="text-xs sm:text-sm text-slate-600 max-w-2xl mt-1 leading-relaxed">
                Centrally located right opposite Lal Building on the road to Malir Union Football Ground in Aso Goth, readily accessible from Malir 15, Kala Board, and National Highway.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Column */}
              <div className="lg:col-span-5 space-y-4">
                <div className="bg-[#f8faff] rounded-2xl border border-slate-200 p-5">
                  <div className="flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-red-100 text-crimson-600 flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">EXACT STREET ADDRESS</h4>
                      <p className="text-xs font-semibold text-slate-700 mt-1 leading-relaxed">
                        Opposite Lal Building Near Malir Union Football Ground, Aso Goth, Malir, Karachi, Sindh, Pakistan.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-[#f8faff] rounded-2xl border border-slate-200 p-5">
                  <div className="flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 text-cobalt-700 flex items-center justify-center flex-shrink-0">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">ADMINISTRATION &amp; IN-PERSON DESK</h4>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                        Open Monday to Friday: <strong>04:00 PM - 09:00 PM</strong>.<br />
                        Saturday: Special batch consultation and test orientation.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-[#f8faff] rounded-2xl border border-slate-200 p-5">
                  <div className="flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">TRANSIT ACCESSIBILITY</h4>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                        Short 3-minute ride from Malir 15 or Kala Board. Qingqi and public bus services directly accessible to Lal Building stop.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <a href="tel:+923222192266" className="dynamic-theme-primary-bg flex-1 text-center bg-cobalt-700 hover:bg-cobalt-800 text-white font-bold text-xs py-3 px-4 rounded-xl shadow transition-colors flex items-center justify-center gap-1.5">
                    <Phone className="w-4 h-4" />
                    <span>Call Front Desk</span>
                  </a>

                  <a href="https://wa.me/923222192266?text=Assalam%20o%20Alaikum%2C%20I%20want%20to%20visit%20Apex%20Education%20Forum%20campus%20in%20Aso%20Goth%20Malir." target="_blank" rel="noopener noreferrer" className="flex-1 text-center bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-3 px-4 rounded-xl shadow transition-colors flex items-center justify-center gap-1.5">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.299.144.35.49 1.199.533 1.286.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.861.174.086.275.072.376-.044.102-.115.434-.506.549-.68.116-.173.232-.144.39-.087.159.058 1.011.477 1.184.564.173.087.289.13.332.203.043.072.043.419-.101.824z"/></svg>
                    <span>Direct WhatsApp</span>
                  </a>
                </div>
              </div>

              {/* Right Column: Custom SVG Map Graphic */}
              <div className="lg:col-span-7">
                <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden relative">
                  <div className="w-full h-80 sm:h-96 bg-[#e5ecf6] relative overflow-hidden flex items-center justify-center">
                    <svg className="w-full h-full object-cover" viewBox="0 0 700 450" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect width="700" height="450" fill="#e9f1f7"/>
                      <rect x="360" y="160" width="130" height="100" rx="12" fill="#d1e7dd"/>
                      <text x="425" y="215" fontFamily="'Plus Jakarta Sans', sans-serif" fontSize="11" fontWeight="700" fill="#0f5132" textAnchor="middle">Malir Union</text>
                      <text x="425" y="230" fontFamily="'Plus Jakarta Sans', sans-serif" fontSize="9" fill="#198754" textAnchor="middle">Football Ground</text>

                      <rect x="80" y="40" width="120" height="70" rx="8" fill="#d1e7dd"/>
                      <text x="140" y="80" fontFamily="'Plus Jakarta Sans', sans-serif" fontSize="9" fill="#198754" textAnchor="middle">Aso Goth Green Belt</text>

                      <path d="M0 380 Q350 370 700 390" stroke="#fcd34d" strokeWidth="16" strokeLinecap="round"/>
                      <path d="M0 380 Q350 370 700 390" stroke="#ffffff" strokeWidth="2" strokeDasharray="8 8"/>
                      <text x="520" y="415" fontFamily="'Plus Jakarta Sans', sans-serif" fontSize="10" fontWeight="700" fill="#92400e">NATIONAL HIGHWAY (N-5)</text>

                      <path d="M220 0 L250 450" stroke="#ffffff" strokeWidth="12"/>
                      <text x="245" y="60" fontFamily="'Plus Jakarta Sans', sans-serif" fontSize="9" fontWeight="600" fill="#64748b" transform="rotate(85 245 60)">KALA BOARD ROAD</text>

                      <path d="M240 180 L520 180" stroke="#ffffff" strokeWidth="10"/>
                      <path d="M340 180 L340 380" stroke="#ffffff" strokeWidth="8"/>
                      <path d="M490 180 L490 320" stroke="#ffffff" strokeWidth="8"/>

                      <rect x="290" y="130" width="55" height="40" rx="4" fill="#fee2e2" stroke="#ef4444" strokeWidth="1.5"/>
                      <text x="317" y="153" fontFamily="'Plus Jakarta Sans', sans-serif" fontSize="8.5" fontWeight="800" fill="#b91c1c" textAnchor="middle">LAL BLDG</text>

                      <text x="120" y="240" fontFamily="'Plus Jakarta Sans', sans-serif" fontSize="12" fontWeight="800" fill="#64748b">MALIR 15</text>
                      <text x="350" y="320" fontFamily="'Plus Jakarta Sans', sans-serif" fontSize="10" fontWeight="600" fill="#94a3b8">Aso Goth Residential</text>

                      <g transform="translate(325, 185)">
                        <circle cx="20" cy="20" r="28" fill="#0d47a1" fillOpacity="0.18">
                          <animate attributeName="r" values="18;34;18" dur="3s" repeatCount="indefinite"/>
                          <animate attributeName="opacity" values="0.7;0.1;0.7" dur="3s" repeatCount="indefinite"/>
                        </circle>
                        <circle cx="20" cy="20" r="14" fill="#d32f2f"/>
                        <circle cx="20" cy="20" r="6" fill="#ffffff"/>
                      </g>
                    </svg>

                    <div className="absolute bottom-4 left-4 right-4 sm:right-auto sm:left-6 bg-white/95 backdrop-blur-md px-4 py-3 rounded-2xl border border-slate-200 shadow-xl flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-crimson-600 text-white flex items-center justify-center flex-shrink-0 shadow-md">
                        <MapPin className="w-5 h-5" />
                      </div>
                      <div className="text-xs">
                        <p className="font-bold text-slate-900">Apex Education Forum</p>
                        <p className="text-slate-500">Opp. Lal Building, Malir Union Ground</p>
                      </div>
                      <a href="https://maps.google.com/?q=Aso+Goth+Malir+Karachi" target="_blank" rel="noopener noreferrer" className="ml-auto bg-cobalt-50 hover:bg-cobalt-100 text-cobalt-700 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1">
                        <span>Open Map</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>
      </main>

      {/* =========================================================================
           11. Institutional Comprehensive Footer
           ========================================================================= */}
      <footer className="bg-[#061833] text-slate-400 text-xs border-t border-white/10 pt-16 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-white/10">
            
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full brand-gradient p-0.5 flex-shrink-0 flex items-center justify-center">
                  <div className="w-full h-full bg-white rounded-full flex items-center justify-center">
                    <span className="font-extrabold text-cobalt-800 text-sm">AEF</span>
                  </div>
                </div>
                <div>
                  <span className="text-base font-extrabold text-white tracking-tight">Apex Education Forum</span>
                  <p className="text-[10px] text-red-400 font-bold tracking-wider uppercase">MALIR &bull; KARACHI</p>
                </div>
              </div>

              <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
                Since 2017, Apex Education Forum has empowered aspiring youth, competitive candidates, and undergraduates across Malir and Karachi with rigorous institutional curricula and merit-driven coaching.
              </p>

              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-[11px] text-slate-300 font-medium">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Registered &amp; Certified Education Center</span>
              </div>
            </div>

            <div>
              <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-4">Academic Programs</h4>
              <ul className="space-y-2.5 text-xs">
                {courses.length > 0 ? (
                  courses.slice(0, 5).map(c => (
                    <li key={c.id}>
                      <a href="#section-courses" className="hover:text-white transition-colors">{c.title}</a>
                    </li>
                  ))
                ) : (
                  <li><a href="#section-courses" className="hover:text-white transition-colors">Courses &amp; Programs</a></li>
                )}
                <li><a href="#section-courses" className="hover:text-white text-cobalt-400 font-semibold transition-colors">Explore All Programs &rarr;</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-4">Quick Links</h4>
              <ul className="space-y-2.5 text-xs">
                <li><a href="#fast-track-reserve" className="hover:text-white transition-colors">Admissions Fast-Track</a></li>
                <li><a href="#section-verify-desk" className="hover:text-white transition-colors">Verify Credential</a></li>
                <li><button onClick={() => setShowFacilitationModal(true)} className="hover:text-white text-left transition-colors cursor-pointer">Sindh Job Portal Desk</button></li>
                <li><a href="#campus-directions" className="hover:text-white transition-colors">Campus Directions</a></li>
                <li><button onClick={() => setShowStudentPortalModal(true)} className="text-emerald-400 hover:text-emerald-300 transition-colors font-bold text-left cursor-pointer">Student Portal &amp; ID Card &rarr;</button></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-4">Visiting &amp; Services</h4>
              <div className="space-y-2.5 text-xs">
                <p className="text-slate-300 font-semibold">Campus Visiting Hours:</p>
                <p className="text-slate-400">Mon &ndash; Fri: 04:00 PM &ndash; 09:00 PM</p>
                <div className="pt-2">
                  <p className="text-slate-300 font-semibold">Daily Student Batches:</p>
                  <p className="text-slate-400">4:00 PM &bull; 5:30 PM &bull; 7:00 PM Regular</p>
                </div>
                <p className="text-slate-500 pt-1">Malir Union Football Ground, Karachi</p>
              </div>
            </div>

          </div>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
            <p>&copy; 2017&ndash;2026 Apex Education Forum. All Rights Reserved. Reg. No. 2871790.</p>
            <div className="flex items-center gap-6">
              <a href="#" className="hover:text-slate-400 transition-colors">Academic Integrity Policy</a>
              <a href="#" className="hover:text-slate-400 transition-colors">Admission Regulations</a>
              <button onClick={() => setShowStudentPortalModal(true)} className="hover:text-slate-300 transition-colors font-semibold cursor-pointer">Student Portal Login</button>
            </div>
          </div>
        </div>
      </footer>

      {/* =========================================================================
           12. Interactive Modals
           ========================================================================= */}

      {/* Modal A: Admission Reservation Success Confirmation */}
      {successAdmission && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-200 text-center relative overflow-hidden animate-in fade-in zoom-in duration-200">
            <button onClick={() => setSuccessAdmission(null)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-2 rounded-lg cursor-pointer">
              <X className="w-5 h-5" />
            </button>

            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3 shadow-inner">
              <CheckCircle2 className="w-7 h-7" />
            </div>

            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold mb-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Unified Institutional Account Created
            </span>

            <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 mb-1">Seat Reserved &amp; ID Issued!</h3>
            <p className="text-xs text-slate-500 mb-4">
              Assalam o Alaikum <strong className="text-slate-800">{successAdmission.name}</strong>, your admission has been registered in the institutional database.
            </p>

            {/* Digital Student Card Preview */}
            <div className="bg-gradient-to-br from-slate-900 via-cobalt-950 to-slate-900 text-white rounded-2xl p-4 text-left shadow-lg border border-slate-700/80 mb-4 relative overflow-hidden">
              <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-white text-cobalt-900 font-extrabold text-[10px] flex items-center justify-center">AEF</div>
                  <span className="text-[11px] font-bold tracking-tight">Apex Student Identity</span>
                </div>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-mono px-2 py-0.5 rounded border border-emerald-400/30">ACTIVE</span>
              </div>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Roll No / Student ID:</span>
                  <strong className="font-mono text-amber-300">{successAdmission.rollNo}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Program:</span>
                  <span className="font-semibold text-slate-200 truncate max-w-[190px]">{successAdmission.courseTitle}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Timing Slot:</span>
                  <span className="text-slate-300 truncate max-w-[190px]">{successAdmission.slot}</span>
                </div>
              </div>
            </div>

            <div className="space-y-2.5">
              <a 
                href={`https://wa.me/923222192266?text=${encodeURIComponent(`Assalam o Alaikum, my name is ${successAdmission.name} and my Roll Number is ${successAdmission.rollNo}. I have reserved my seat for ${successAdmission.courseTitle}.`)}`} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 text-xs sm:text-sm"
              >
                <span>Confirm on WhatsApp Instantly</span>
              </a>

              <button 
                onClick={() => setSuccessAdmission(null)} 
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 px-4 rounded-xl text-xs transition-colors cursor-pointer"
              >
                Return to Portal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal B: Syllabus Download / Prospectus Preview */}
      {syllabusModalCourse && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-7 sm:p-8 shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in duration-200">
            <button onClick={() => setSyllabusModalCourse(null)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-2 rounded-lg cursor-pointer">
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-cobalt-100 text-cobalt-700 flex items-center justify-center">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-slate-900">{syllabusModalCourse.title}</h3>
                <p className="text-xs text-slate-500">Official Prospectus &bull; Verified Academic Modules</p>
              </div>
            </div>

            <div className="space-y-3 text-xs text-slate-600 mb-6 bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <p className="font-bold text-slate-800">Module Structure Highlights:</p>
              <ul className="space-y-2 list-disc list-inside">
                {(syllabusModalCourse.modules && syllabusModalCourse.modules.length > 0 ? syllabusModalCourse.modules : [
                  "Systematic phonetic training & sentence syntax mastery",
                  "Weekly speaking drills in multimedia audio-visual lab",
                  "Comprehensive STS IBA BPS-05 to 15 exam past papers",
                  "Microsoft Office 365, typing certification, and report formatting"
                ]).map((m, idx) => (
                  <li key={idx} className="leading-relaxed">{typeof m === "string" ? m : m.title || "Module"}</li>
                ))}
              </ul>
              {syllabusModalCourse.prerequisites && (
                <div className="pt-2 border-t border-slate-200 text-slate-500">
                  <strong>Prerequisites:</strong> {syllabusModalCourse.prerequisites}
                </div>
              )}
            </div>

            <div className="flex items-center gap-3">
              <a 
                href={`https://wa.me/923222192266?text=${encodeURIComponent(`Assalam o Alaikum, please send me the complete PDF prospectus and fee structure for ${syllabusModalCourse.title}.`)}`} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex-1 bg-crimson-600 hover:bg-crimson-700 text-white font-bold py-3 rounded-xl text-center text-xs shadow transition-colors"
              >
                Request PDF on WhatsApp
              </a>
              <button 
                onClick={() => setSyllabusModalCourse(null)} 
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-xl text-center text-xs transition-colors cursor-pointer"
              >
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal C: Facilitation Desk Ticket Request */}
      {showFacilitationModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-7 sm:p-8 shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in duration-200">
            <button onClick={() => { setShowFacilitationModal(false); setFacSuccess(false); }} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-2 rounded-lg cursor-pointer">
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-red-100 text-crimson-600 flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-slate-900">Sindh Job Portal &amp; STS Desk</h3>
                <p className="text-xs text-slate-500">Walk-in Support Ticket &bull; Opposite Lal Building, Malir</p>
              </div>
            </div>

            {facSuccess ? (
              <div className="text-center py-6">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-slate-900 text-base mb-1">Appointment Registered!</h4>
                <p className="text-xs text-slate-500 mb-4">Our front desk coordinator will assist you with document scanning, challan filing, and SJP registration.</p>
                <button onClick={() => { setShowFacilitationModal(false); setFacSuccess(false); }} className="bg-cobalt-700 text-white font-bold text-xs py-2 px-6 rounded-xl">
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={(e) => { e.preventDefault(); setFacSuccess(true); confetti({ particleCount: 80, spread: 60 }); }} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Applicant Name *</label>
                  <input 
                    type="text" 
                    required 
                    value={facFormData.name}
                    onChange={(e) => setFacFormData({ ...facFormData, name: e.target.value })}
                    placeholder="e.g. Sanaullah Brohi" 
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-cobalt-600"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">WhatsApp Number *</label>
                  <input 
                    type="tel" 
                    required 
                    value={facFormData.whatsapp}
                    onChange={(e) => setFacFormData({ ...facFormData, whatsapp: e.target.value })}
                    placeholder="e.g. +92 300 1234567" 
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-cobalt-600"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Facilitation Service Needed</label>
                  <select 
                    value={facFormData.service}
                    onChange={(e) => setFacFormData({ ...facFormData, service: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-cobalt-600 bg-white"
                  >
                    <option value="SJP Profile Audit & Document Upload">SJP Profile Audit &amp; Document Upload</option>
                    <option value="STS SIBA Challan Generation & Verification">STS SIBA Challan Generation &amp; Verification</option>
                    <option value="CNIC & Academic Certificate Resizing">CNIC &amp; Academic Certificate Resizing</option>
                    <option value="Post-Test Result Tracking & Verification">Post-Test Result Tracking &amp; Verification</option>
                  </select>
                </div>

                <button type="submit" className="w-full bg-cobalt-700 hover:bg-cobalt-800 text-white font-bold py-3 rounded-xl transition-colors shadow cursor-pointer">
                  Create Facilitation Desk Appointment
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Modal D: Student Single Sign-On Portal */}
      {showStudentPortalModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in duration-200">
            <button onClick={() => setShowStudentPortalModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-2 rounded-lg cursor-pointer">
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-cobalt-100 text-cobalt-700 flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900">Student Portal &amp; Unified Access</h3>
                  <p className="text-xs text-slate-500">Access your student ID card, timetable &amp; admission record</p>
                </div>
              </div>

              <div className="p-4 bg-blue-50/80 border border-blue-200 rounded-2xl text-xs text-blue-900 space-y-2">
                <p className="font-bold text-cobalt-800 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-cobalt-600" />
                  <span>Single Sign-On Across Web &amp; Apex Connect App</span>
                </p>
                <p className="text-slate-600 leading-relaxed">
                  Use your registered email and password to log in directly to the ecosystem navigation at the top of the page, or connect with your instructors on <strong>Apex Connect</strong>.
                </p>
              </div>

              <div className="pt-2 flex flex-col gap-2">
                <a 
                  href={getAppUrl("messaging")} 
                  className="w-full py-3 bg-cobalt-700 hover:bg-cobalt-800 text-white font-bold rounded-xl shadow transition-colors text-xs flex items-center justify-center gap-2"
                >
                  <span>Launch Apex Connect Messenger &rarr;</span>
                </a>

                <a 
                  href="#fast-track-reserve"
                  onClick={() => setShowStudentPortalModal(false)}
                  className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-center text-xs transition-colors"
                >
                  New Student? Apply for Fast-Track Intake
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
