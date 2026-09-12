import React from "react";

/**
 * ApexCertificate - High-Fidelity Official Institutional Certificate
 * Replicates the exact Apex Education Forum official certificate design with:
 * - Dynamic layered angular blue & cyan vector geometric corner graphics
 * - Official Apex Education Forum circular emblem badge
 * - "CERTIFICATE" classical serif title
 * - "This is to certify that" subtitle
 * - Student name & parentage in calligraphic cursive typography ('Great Vibes')
 * - Program completion statement with highlighted duration in red & course in deep navy
 * - Dynamically bound Director Name from the Management System
 * - Official reference serial & date
 * - Edge-to-edge @media print support for A4 Landscape
 */
export default function ApexCertificate({
  studentName = "Amjad Ali s/o Kabil",
  courseTitle = "Basic Computer Course",
  duration = "Six Months",
  issueDate = "September 2024",
  rollNumber = "AEF-217/2024",
  certificateNumber = "aef / 2026",
  directorName = "Yasir Ali",
  directorTitle = "Director",
  logoUrl = null,
  signatureUrl = null,
  isPrintOnly = false,
  className = ""
}) {
  return (
    <div className={`apex-cert-wrapper ${className}`} style={{ width: "100%", display: "flex", justifyContent: "center" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700;800;900&family=Great+Vibes&family=Playfair+Display:ital,wght@0,600;0,700;1,400&family=Montserrat:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&display=swap');

        .apex-cert-frame {
          position: relative;
          width: 1000px;
          min-height: 700px;
          aspect-ratio: 1.414 / 1;
          background: #ffffff;
          color: #0f172a;
          box-sizing: border-box;
          overflow: hidden;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.25);
          font-family: 'Inter', sans-serif;
          user-select: none;
        }

        .apex-cert-watermark {
          position: absolute;
          inset: 0;
          background-image: 
            radial-gradient(circle at 50% 50%, rgba(14, 165, 233, 0.03) 0%, transparent 70%),
            linear-gradient(135deg, rgba(15, 23, 42, 0.01) 25%, transparent 25%),
            linear-gradient(225deg, rgba(15, 23, 42, 0.01) 25%, transparent 25%),
            linear-gradient(45deg, rgba(15, 23, 42, 0.01) 25%, transparent 25%),
            linear-gradient(315deg, rgba(15, 23, 42, 0.01) 25%, transparent 25%);
          background-size: 100% 100%, 30px 30px, 30px 30px, 30px 30px, 30px 30px;
          pointer-events: none;
          z-index: 1;
        }

        .apex-cert-content {
          position: relative;
          z-index: 10;
          height: 100%;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 36px 60px 40px 60px;
          box-sizing: border-box;
        }

        .apex-cert-title {
          font-family: 'Cinzel', 'Playfair Display', Georgia, serif;
          font-weight: 800;
          letter-spacing: 0.18em;
          color: #0b2545;
          text-transform: uppercase;
          text-align: center;
          font-size: 2.85rem;
          margin: 0;
          line-height: 1.1;
        }

        .apex-cert-sub {
          font-family: 'Cinzel', 'Playfair Display', Georgia, serif;
          font-weight: 600;
          letter-spacing: 0.08em;
          color: #1e293b;
          text-align: center;
          font-size: 1.25rem;
          margin-top: 10px;
          margin-bottom: 0;
        }

        .apex-cert-candidate {
          font-family: 'Great Vibes', 'Allura', cursive;
          font-size: 3.5rem;
          color: #004b99;
          text-align: center;
          margin: 14px 0 6px 0;
          line-height: 1.2;
          font-weight: 500;
          text-shadow: 0 1px 1px rgba(0,0,0,0.05);
        }

        .apex-cert-desc {
          text-align: center;
          font-size: 1.05rem;
          color: #1e293b;
          font-family: 'Playfair Display', Georgia, serif;
          margin: 0;
          line-height: 1.5;
        }

        .apex-cert-duration {
          color: #c52227;
          font-weight: 800;
          font-family: 'Playfair Display', Georgia, serif;
        }

        .apex-cert-course {
          text-align: center;
          font-family: 'Cinzel', 'Playfair Display', Georgia, serif;
          font-weight: 800;
          font-size: 1.55rem;
          color: #002b5c;
          margin-top: 4px;
          letter-spacing: 0.04em;
        }

        .apex-cert-director-name {
          font-family: 'Cinzel', 'Playfair Display', Georgia, serif;
          font-weight: 800;
          font-size: 1.05rem;
          color: #0f172a;
          margin-bottom: 2px;
          letter-spacing: 0.05em;
        }

        .apex-cert-director-title {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 0.88rem;
          color: #475569;
          font-style: italic;
        }

        /* High-Definition Print Styles */
        @media print {
          body * {
            visibility: hidden;
          }
          .apex-cert-frame, .apex-cert-frame * {
            visibility: visible;
          }
          .apex-cert-frame {
            position: fixed;
            left: 0;
            top: 0;
            width: 100vw !important;
            height: 100vh !important;
            box-shadow: none !important;
            border-radius: 0 !important;
            margin: 0 !important;
            padding: 0 !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          @page {
            size: A4 landscape;
            margin: 0;
          }
        }
      `}</style>

      <div className="apex-cert-frame">
        {/* Subtle Paper Texture Background */}
        <div className="apex-cert-watermark" />

        {/* =================================================================== */}
        {/* 1. TOP-LEFT GEOMETRIC CORNER OVERLAY                                */}
        {/* =================================================================== */}
        <svg
          style={{ position: "absolute", top: 0, left: 0, width: "360px", height: "260px", zIndex: 3, pointerEvents: "none" }}
          viewBox="0 0 360 260"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Faint accent wedge */}
          <polygon points="0,0 260,0 0,160" fill="rgba(2, 132, 199, 0.15)" />
          
          {/* Main Dark Navy Outer Block */}
          <polygon points="0,0 210,0 60,190 0,190" fill="#091b36" />
          
          {/* Layered Cobalt Blue Polygon */}
          <polygon points="0,0 160,0 35,175 0,140" fill="#0047AB" />
          
          {/* Electric Cyan Sharp Slash */}
          <polygon points="75,0 125,0 15,155 0,155" fill="#00d2ff" />
          
          {/* Trailing angled Speed Stripes */}
          <polygon points="175,0 195,0 115,115 105,115" fill="#0284c7" />
          <polygon points="215,0 230,0 145,115 137,115" fill="#38bdf8" />
          <line x1="120" y1="0" x2="20" y2="135" stroke="#ffffff" strokeWidth="2.5" opacity="0.6" />
          <line x1="140" y1="0" x2="45" y2="130" stroke="#00d2ff" strokeWidth="2" opacity="0.8" />
          <line x1="245" y1="0" x2="160" y2="110" stroke="#0284c7" strokeWidth="2" opacity="0.5" />
          <line x1="265" y1="0" x2="185" y2="105" stroke="#38bdf8" strokeWidth="1.5" opacity="0.4" />
        </svg>

        {/* =================================================================== */}
        {/* 2. TOP-RIGHT GEOMETRIC CORNER OVERLAY                               */}
        {/* =================================================================== */}
        <svg
          style={{ position: "absolute", top: 0, right: 0, width: "380px", height: "260px", zIndex: 3, pointerEvents: "none" }}
          viewBox="0 0 380 260"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Faint accent backdrop */}
          <polygon points="380,0 120,0 380,180" fill="rgba(2, 132, 199, 0.12)" />

          {/* Deep Navy Polygonal Cap */}
          <polygon points="380,0 170,0 320,195 380,195" fill="#091b36" />

          {/* Royal Cobalt Wedge */}
          <polygon points="380,0 215,0 345,175 380,140" fill="#0047AB" />

          {/* Bright Electric Cyan Slash */}
          <polygon points="305,0 255,0 365,150 380,150" fill="#00d2ff" />

          {/* Speed Stripes */}
          <polygon points="205,0 190,0 270,110 280,110" fill="#0284c7" />
          <polygon points="165,0 150,0 240,110 248,110" fill="#38bdf8" />
          <line x1="260" y1="0" x2="360" y2="135" stroke="#ffffff" strokeWidth="2.5" opacity="0.6" />
          <line x1="240" y1="0" x2="335" y2="130" stroke="#00d2ff" strokeWidth="2" opacity="0.8" />
          <line x1="135" y1="0" x2="220" y2="110" stroke="#0284c7" strokeWidth="2" opacity="0.5" />
          <line x1="115" y1="0" x2="195" y2="105" stroke="#38bdf8" strokeWidth="1.5" opacity="0.4" />
        </svg>

        {/* =================================================================== */}
        {/* 3. BOTTOM-LEFT GEOMETRIC CORNER OVERLAY                             */}
        {/* =================================================================== */}
        <svg
          style={{ position: "absolute", bottom: 0, left: 0, width: "360px", height: "240px", zIndex: 3, pointerEvents: "none" }}
          viewBox="0 0 360 240"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Bottom Left Accent Triangles */}
          <polygon points="0,240 220,240 0,90" fill="rgba(2, 132, 199, 0.12)" />
          <polygon points="0,240 180,240 40,80 0,80" fill="#091b36" />
          <polygon points="0,240 135,240 20,105 0,125" fill="#0047AB" />
          <polygon points="50,240 95,240 0,110 0,95" fill="#00d2ff" />
          <line x1="110" y1="240" x2="15" y2="120" stroke="#0284c7" strokeWidth="2" opacity="0.6" />
          <line x1="150" y1="240" x2="55" y2="120" stroke="#38bdf8" strokeWidth="1.5" opacity="0.4" />
          <line x1="200" y1="240" x2="110" y2="130" stroke="#00d2ff" strokeWidth="2" opacity="0.5" />
        </svg>

        {/* =================================================================== */}
        {/* 4. BOTTOM-RIGHT GEOMETRIC CORNER OVERLAY                            */}
        {/* =================================================================== */}
        <svg
          style={{ position: "absolute", bottom: 0, right: 0, width: "420px", height: "280px", zIndex: 3, pointerEvents: "none" }}
          viewBox="0 0 420 280"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Deep Navy Main Block */}
          <polygon points="420,280 140,280 340,50 420,50" fill="#091b36" />
          {/* Layered Royal Cobalt */}
          <polygon points="420,280 190,280 365,75 420,115" fill="#0047AB" />
          {/* Electric Cyan Stripe */}
          <polygon points="340,280 290,280 395,115 420,115" fill="#00d2ff" />
          {/* Speed accent lines */}
          <polygon points="260,280 245,280 340,150 350,150" fill="#0284c7" />
          <polygon points="215,280 200,280 295,150 305,150" fill="#38bdf8" />
          <line x1="280" y1="280" x2="385" y2="130" stroke="#ffffff" strokeWidth="2.5" opacity="0.6" />
          <line x1="250" y1="280" x2="355" y2="130" stroke="#00d2ff" strokeWidth="2" opacity="0.8" />
          <line x1="175" y1="280" x2="270" y2="150" stroke="#0284c7" strokeWidth="2" opacity="0.5" />
          <line x1="145" y1="280" x2="240" y2="150" stroke="#38bdf8" strokeWidth="1.5" opacity="0.4" />
        </svg>

        {/* =================================================================== */}
        {/* CERTIFICATE CORE CONTENT                                            */}
        {/* =================================================================== */}
        <div className="apex-cert-content">
          
          {/* Header Bar: Dated (Left), Logo Badge (Center), Serial (Right) */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", width: "100%" }}>
            
            {/* Left: Dated */}
            <div style={{ textAlign: "left", paddingTop: "12px" }}>
              <span style={{ fontSize: "0.86rem", color: "#1e293b", fontFamily: "'Inter', sans-serif" }}>
                <strong>Dated:</strong> &nbsp;&nbsp;{issueDate || "September 2024"}
              </span>
            </div>

            {/* Center: Apex Education Forum Emblem Badge */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt="Apex Education Forum Logo"
                  style={{ width: "96px", height: "96px", objectFit: "contain" }}
                />
              ) : (
                /* High-Definition Vector Reproduction of Apex Logo Emblem */
                <div style={{
                  width: "92px",
                  height: "92px",
                  borderRadius: "50%",
                  background: "#ffffff",
                  boxShadow: "0 4px 14px rgba(0, 0, 0, 0.1)",
                  border: "2px solid #0056b3",
                  position: "relative",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "6px"
                }}>
                  {/* Decorative circular inner border with red & blue arcs */}
                  <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="46" fill="none" stroke="#e2e8f0" strokeWidth="1" />
                    <path d="M 20,26 A 44,44 0 0,1 80,26" fill="none" stroke="#d90429" strokeWidth="2.2" strokeLinecap="round" />
                    <path d="M 80,74 A 44,44 0 0,1 20,74" fill="none" stroke="#0056b3" strokeWidth="2.2" strokeLinecap="round" />
                  </svg>

                  {/* Apex Stylized Title with Nib/Pen */}
                  <div style={{ display: "flex", alignItems: "baseline", gap: "1px", position: "relative", zIndex: 2, marginTop: "-4px" }}>
                    <span style={{ fontSize: "1.35rem", fontWeight: 900, color: "#d90429", fontFamily: "'Montserrat', sans-serif", letterSpacing: "-0.05em" }}>A</span>
                    <span style={{ fontSize: "1.1rem", fontWeight: 800, color: "#0056b3", fontFamily: "'Montserrat', sans-serif" }}>PEX</span>
                    {/* Feather / Pen tip icon */}
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#d90429" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: "2px", transform: "rotate(45deg)" }}>
                      <path d="m12 19 7-7 3 3-7 7-3-3z" />
                      <path d="m18 13-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
                      <path d="m2 2 7.586 7.586" />
                      <circle cx="11" cy="11" r="2" />
                    </svg>
                  </div>

                  {/* Subtitle EDUCATION FORUM */}
                  <div style={{
                    fontSize: "0.42rem",
                    fontWeight: 800,
                    color: "#0f172a",
                    letterSpacing: "0.14em",
                    fontFamily: "'Montserrat', sans-serif",
                    marginTop: "1px",
                    textTransform: "uppercase"
                  }}>
                    EDUCATION FORUM
                  </div>
                </div>
              )}
            </div>

            {/* Right: Reference Roll No */}
            <div style={{ textAlign: "right", paddingTop: "12px" }}>
              <span style={{ fontSize: "0.86rem", color: "#1e293b", fontFamily: "'Inter', sans-serif" }}>
                <strong>{rollNumber || "AEF-217/2024"}</strong>
              </span>
            </div>
          </div>

          {/* Main Typography Section */}
          <div style={{ margin: "20px 0 10px 0" }}>
            <h1 className="apex-cert-title">CERTIFICATE</h1>
            <p className="apex-cert-sub">This is to certify that</p>
            <div className="apex-cert-candidate">{studentName || "Candidate Name"}</div>
            
            <p className="apex-cert-desc">
              Successfully completed the <span className="apex-cert-duration">{duration || "Six Months"}</span>
            </p>
            <div className="apex-cert-course">{courseTitle || "Professional Program"}</div>
          </div>

          {/* Footer: Certificate Serial (Left) & Director Signature (Center) */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", width: "100%", paddingBottom: "10px" }}>
            
            {/* Left: Certificate No. */}
            <div style={{ textAlign: "left", fontSize: "0.78rem", color: "#64748b", fontFamily: "'Inter', sans-serif" }}>
              <div>Certificate No: <strong style={{ color: "#0f172a" }}>{certificateNumber || "aef / 2026"}</strong></div>
              <div style={{ fontSize: "0.68rem", color: "#94a3b8", marginTop: "2px" }}>Verified Institutional Credential</div>
            </div>

            {/* Center/Right-Center: Director Signature & Dynamic Name */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", minWidth: "220px", marginRight: "110px" }}>
              {signatureUrl ? (
                <img
                  src={signatureUrl}
                  alt="Director Signature"
                  style={{ height: "42px", objectFit: "contain", marginBottom: "4px" }}
                />
              ) : (
                /* Elegant Digital Signature flourish */
                <svg width="150" height="34" viewBox="0 0 150 34" fill="none" style={{ marginBottom: "2px" }}>
                  <path
                    d="M 10 24 Q 40 8, 70 20 T 110 12 Q 130 18, 145 10"
                    stroke="#0047AB"
                    strokeWidth="2"
                    strokeLinecap="round"
                    fill="none"
                  />
                  <path
                    d="M 35 15 Q 45 4, 60 14 Q 75 26, 95 18"
                    stroke="#0047AB"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    fill="none"
                  />
                </svg>
              )}

              {/* Dynamic Director Name from Management System */}
              <div className="apex-cert-director-name">
                {directorName || "Yasir Ali"}
              </div>

              {/* Title */}
              <div className="apex-cert-director-title">
                {directorTitle || "Director"}
              </div>

              {/* Signature underline */}
              <div style={{ width: "160px", height: "1.5px", background: "linear-gradient(90deg, transparent, #0056b3, transparent)", marginTop: "4px" }} />
            </div>

            {/* Right Spacer to balance Certificate No */}
            <div style={{ width: "80px" }} />
          </div>

        </div>
      </div>
    </div>
  );
}
