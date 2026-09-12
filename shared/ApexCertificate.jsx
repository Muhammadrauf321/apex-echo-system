import React from "react";
import certLogoImg from "./assets/apex_logo.png";
import certBgImg from "./assets/cert_bg.png";
import certCornerTLImg from "./assets/cert_corner_top_left.png";
import certCornerBRImg from "./assets/cert_corner_bottom_right.png";
import certCornerTrianglesImg from "./assets/cert_corner_triangles.png";

/**
 * ApexCertificate - Official Institutional Accredited Certificate
 * Pixel-accurate production implementation using official Apex high-resolution vector assets:
 * - Official white/grey geometric textured background (certBgImg)
 * - Official top-left angular blue/cyan banner with speed lines (certCornerTLImg)
 * - Official bottom-right angular blue/cyan banner with speed lines (certCornerBRImg)
 * - Official top-right & bottom-left geometric triangular chevrons (certCornerTrianglesImg)
 * - Official Apex Education Forum circular crest logo (certLogoImg)
 * - Classical Cinzel & Playfair Display serif typography
 * - Dynamic cursive candidate calligraphy (Great Vibes)
 * - Dynamically bound Director Name from the Management System
 * - Flawless borderless A4 landscape print styling
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
    <div className={`apex-cert-wrapper ${className}`}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700;800;900&family=Great+Vibes&family=Playfair+Display:ital,wght@0,500;0,600;0,700;0,800;1,400;1,600&family=Inter:wght@400;500;600;700&display=swap');

        .apex-cert-wrapper {
          width: 100%;
          display: flex;
          justifyContent: center;
          align-items: center;
          padding: 10px 0;
          box-sizing: border-box;
          overflow: hidden;
        }

        .apex-cert-frame {
          position: relative;
          width: 1000px;
          height: 707px;
          max-width: 1000px;
          aspect-ratio: 1.4142 / 1;
          background-color: #ffffff;
          color: #0f172a;
          box-sizing: border-box;
          overflow: hidden;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.28);
          font-family: 'Inter', sans-serif;
          user-select: none;
          -webkit-font-smoothing: antialiased;
        }

        /* 1. Official Textured Geometric Watermark Background */
        .apex-cert-bg-layer {
          position: absolute;
          inset: 0;
          background-image: url(${certBgImg});
          background-position: center center;
          background-size: cover;
          background-repeat: no-repeat;
          opacity: 0.92;
          pointer-events: none;
          z-index: 1;
        }

        /* 2. Official Corner Vector Elements */
        .apex-corner-top-left {
          position: absolute;
          top: 0;
          left: 0;
          width: 470px;
          height: auto;
          pointer-events: none;
          user-select: none;
          z-index: 3;
        }

        .apex-corner-bottom-right {
          position: absolute;
          bottom: 0;
          right: 0;
          width: 485px;
          height: auto;
          pointer-events: none;
          user-select: none;
          z-index: 3;
        }

        .apex-corner-bottom-left {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 250px;
          height: auto;
          pointer-events: none;
          user-select: none;
          z-index: 2;
        }

        .apex-corner-top-right {
          position: absolute;
          top: 0;
          right: 0;
          width: 250px;
          height: auto;
          pointer-events: none;
          user-select: none;
          z-index: 2;
          transform: rotate(180deg);
        }

        /* 3. Certificate Core Content Container */
        .apex-cert-content {
          position: relative;
          z-index: 10;
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 28px 75px 32px 75px;
          box-sizing: border-box;
        }

        /* Header Row: Dated, Crest, Roll No */
        .apex-cert-header-row {
          display: flex;
          justifyContent: space-between;
          align-items: flex-start;
          width: 100%;
        }

        .apex-cert-meta-dated {
          font-family: 'Inter', sans-serif;
          font-size: 0.92rem;
          color: #1e293b;
          font-weight: 500;
          padding-top: 52px;
          min-width: 190px;
        }

        .apex-cert-logo-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-top: -6px;
        }

        .apex-cert-crest-img {
          width: 120px;
          height: 120px;
          object-fit: contain;
          filter: drop-shadow(0 5px 14px rgba(0, 0, 0, 0.12));
        }

        .apex-cert-meta-roll {
          font-family: 'Inter', sans-serif;
          font-size: 0.92rem;
          color: #1e293b;
          font-weight: 600;
          text-align: right;
          padding-top: 52px;
          min-width: 190px;
          letter-spacing: 0.02em;
        }

        /* Typography Main Body */
        .apex-cert-body {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          margin-top: -10px;
        }

        .apex-cert-title {
          font-family: 'Cinzel', 'Playfair Display', Georgia, serif;
          font-weight: 700;
          letter-spacing: 0.14em;
          color: #0b347b;
          text-transform: uppercase;
          font-size: 3.3rem;
          margin: 0 0 6px 0;
          line-height: 1.05;
        }

        .apex-cert-sub {
          font-family: 'Playfair Display', Georgia, serif;
          font-weight: 600;
          letter-spacing: 0.02em;
          color: #1e293b;
          font-size: 1.45rem;
          margin: 0 0 6px 0;
          line-height: 1.2;
        }

        .apex-cert-candidate {
          font-family: 'Great Vibes', cursive;
          font-size: 3.9rem;
          color: #0047ab;
          line-height: 1.18;
          margin: 2px 0 10px 0;
          max-width: 820px;
          word-break: break-word;
          text-shadow: 0 1px 2px rgba(0, 71, 171, 0.12);
        }

        .apex-cert-completion {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 1.15rem;
          color: #1e293b;
          margin: 0 0 5px 0;
          font-weight: 500;
        }

        .apex-cert-duration {
          color: #d90429;
          font-weight: 700;
          font-family: 'Playfair Display', Georgia, serif;
        }

        .apex-cert-course {
          font-family: 'Cinzel', 'Playfair Display', Georgia, serif;
          font-weight: 800;
          font-size: 1.45rem;
          color: #0a2558;
          letter-spacing: 0.05em;
          margin: 0;
        }

        /* Footer Row: Certificate Serial & Dynamic Director */
        .apex-cert-footer-row {
          display: flex;
          justifyContent: space-between;
          align-items: flex-end;
          width: 100%;
          padding-bottom: 8px;
        }

        .apex-cert-serial {
          font-family: 'Inter', sans-serif;
          font-size: 0.84rem;
          color: #334155;
          min-width: 220px;
        }

        .apex-cert-director-block {
          display: flex;
          flex-direction: column;
          align-items: center;
          position: relative;
          min-width: 240px;
          margin-right: 90px;
        }

        /* Decorative diagonal flourish line behind Director authority */
        .apex-cert-director-line {
          position: absolute;
          top: 14px;
          width: 180px;
          height: 1.5px;
          background: linear-gradient(90deg, transparent, #38bdf8, #0047ab, transparent);
          transform: rotate(-3deg);
          pointer-events: none;
        }

        .apex-cert-director-name {
          font-family: 'Playfair Display', Georgia, serif;
          font-weight: 700;
          font-size: 1.18rem;
          color: #0f172a;
          margin-bottom: 1px;
          position: relative;
          z-index: 2;
          letter-spacing: 0.02em;
        }

        .apex-cert-director-title {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 0.95rem;
          color: #334155;
          position: relative;
          z-index: 2;
        }

        /* High-Precision Borderless Print Rules */
        @media print {
          body * {
            visibility: hidden !important;
          }
          .apex-cert-frame, .apex-cert-frame * {
            visibility: visible !important;
          }
          .apex-cert-frame {
            position: fixed !important;
            left: 0 !important;
            top: 0 !important;
            width: 100vw !important;
            height: 100vh !important;
            max-width: none !important;
            box-shadow: none !important;
            border-radius: 0 !important;
            margin: 0 !important;
            padding: 0 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          @page {
            size: A4 landscape;
            margin: 0;
          }
        }
      `}</style>

      {/* Main Certificate Frame (Standard A4 Landscape Aspect Ratio 1.4142 : 1) */}
      <div className="apex-cert-frame">
        {/* Layer 1: Textured Geometric Background Pattern */}
        <div className="apex-cert-bg-layer" />

        {/* Layer 2: Official Vector Corner Elements */}
        {/* Top-Left Banner Graphic */}
        <img
          src={certCornerTLImg}
          alt=""
          aria-hidden="true"
          className="apex-corner-top-left"
        />

        {/* Bottom-Right Banner Graphic */}
        <img
          src={certCornerBRImg}
          alt=""
          aria-hidden="true"
          className="apex-corner-bottom-right"
        />

        {/* Bottom-Left Geometric Triangles */}
        <img
          src={certCornerTrianglesImg}
          alt=""
          aria-hidden="true"
          className="apex-corner-bottom-left"
        />

        {/* Top-Right Geometric Triangles (180deg symmetric) */}
        <img
          src={certCornerTrianglesImg}
          alt=""
          aria-hidden="true"
          className="apex-corner-top-right"
        />

        {/* Layer 3: Official Certificate Core Content */}
        <div className="apex-cert-content">
          
          {/* Header Row: Dated, Crest Emblem, Candidate Roll No */}
          <div className="apex-cert-header-row">
            {/* Left: Issue Date */}
            <div className="apex-cert-meta-dated">
              <span>Dated:</span> &nbsp;
              <strong>{issueDate || "September 2024"}</strong>
            </div>

            {/* Center: Official High-Res Apex Education Forum Crest */}
            <div className="apex-cert-logo-container">
              <img
                src={logoUrl || certLogoImg}
                alt="Apex Education Forum Crest"
                className="apex-cert-crest-img"
              />
            </div>

            {/* Right: Roll Number */}
            <div className="apex-cert-meta-roll">
              <span>{rollNumber || "AEF-217/2024"}</span>
            </div>
          </div>

          {/* Central Body Typography */}
          <div className="apex-cert-body">
            <h1 className="apex-cert-title">CERTIFICATE</h1>
            <h2 className="apex-cert-sub">This is to certify that</h2>
            
            {/* Candidate Name in Official Calligraphic Script */}
            <div className="apex-cert-candidate">
              {studentName || "Amjad Ali s/o Kabil"}
            </div>

            {/* Program Completion Statement with Highlighted Red Duration */}
            <p className="apex-cert-completion">
              Successfully completed the <span className="apex-cert-duration">{duration || "Six Months"}</span>
            </p>

            {/* Course Title in Classical Bold Serif */}
            <div className="apex-cert-course">
              {courseTitle || "Basic Computer Course"}
            </div>
          </div>

          {/* Footer Row: Certificate No (Left) & Dynamic Director (Center-Right) */}
          <div className="apex-cert-footer-row">
            {/* Left: Certificate Serial */}
            <div className="apex-cert-serial">
              <span>Certificate No </span>
              <strong>{certificateNumber || "aef /2026"}</strong>
            </div>

            {/* Center: Dynamic Director Authority from Management System */}
            <div className="apex-cert-director-block">
              {/* Optional physical signature scan/stamp image */}
              {signatureUrl ? (
                <img
                  src={signatureUrl}
                  alt="Director Signature"
                  style={{ height: "42px", objectFit: "contain", marginBottom: "4px" }}
                />
              ) : (
                <div className="apex-cert-director-line" />
              )}

              {/* Dynamically bound Director Name from Management System */}
              <div className="apex-cert-director-name">
                {directorName || "Yasir Ali"}
              </div>

              {/* Designation / Title */}
              <div className="apex-cert-director-title">
                {directorTitle || "Director"}
              </div>
            </div>

            {/* Balance Spacer */}
            <div style={{ width: "90px" }} />
          </div>

        </div>
      </div>
    </div>
  );
}
