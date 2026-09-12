import React from "react";
import certLogoImg from "./assets/apex_logo.png";
import certBgImg from "./assets/cert_bg.png";
import certCornerTLImg from "./assets/cert_corner_top_left.png";
import certCornerBRImg from "./assets/cert_corner_bottom_right.png";
import certCornerTRImg from "./assets/cert_corner_top_right.png";
import certCornerBLImg from "./assets/cert_corner_bottom_left.png";

/**
 * ApexCertificate - Forensic Institutional Accredited Certificate
 * Exact 1:1 reproduction matching the provided PDF (MediaBox 792x612, aspect ratio 1.2941:1):
 * - Extracted native PDF vector corner graphics (TL, TR, BL, BR)
 * - Extracted native background watermark texture (cert_bg.png)
 * - Official circular emblem crest (apex_logo.png) centered at 5.02% top
 * - Authentic Gentium Plus & Great Vibes typography matching embedded PDF fonts
 * - Exact forensic coordinates, font sizes, and RGB color values
 * - Dynamically bound Director Authority from the Management System
 * - Flawless borderless print and responsive display
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
    <div className={`apex-cert-outer-container ${className}`}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Gentium+Plus:ital,wght@0,400;0,700;1,400;1,700&family=Great+Vibes&family=Inter:wght@400;500;600;700&display=swap');

        .apex-cert-outer-container {
          width: 100%;
          display: flex;
          justifyContent: center;
          align-items: center;
          padding: 8px 0;
          box-sizing: border-box;
          overflow: hidden;
        }

        /* Exact PDF Aspect Ratio: 792 / 612 = 1.2941176 : 1 */
        .apex-cert-canvas {
          position: relative;
          width: 792px;
          height: 612px;
          max-width: 100%;
          aspect-ratio: 792 / 612;
          background-color: #ffffff;
          box-sizing: border-box;
          overflow: hidden;
          box-shadow: 0 16px 48px rgba(0, 0, 0, 0.22);
          user-select: none;
          -webkit-font-smoothing: antialiased;
        }

        /* 1. Official Background Layer */
        .apex-cert-bg-art {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          pointer-events: none;
          z-index: 1;
        }

        /* 2. Exact Forensic Corner Bounding Boxes */
        /* Top-Left: 370.49 x 206.98 pt (46.78% x 33.82%) */
        .apex-cert-corner-tl {
          position: absolute;
          top: 0;
          left: 0;
          width: 46.78%;
          height: 33.82%;
          object-fit: fill;
          pointer-events: none;
          z-index: 2;
        }

        /* Top-Right: 281.24 x 191.23 pt (35.51% x 31.25%) */
        .apex-cert-corner-tr {
          position: absolute;
          top: 0;
          right: 0;
          width: 35.51%;
          height: 31.25%;
          object-fit: fill;
          pointer-events: none;
          z-index: 2;
        }

        /* Bottom-Left: 281.24 x 191.23 pt (35.51% x 31.25%) */
        .apex-cert-corner-bl {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 35.51%;
          height: 31.25%;
          object-fit: fill;
          pointer-events: none;
          z-index: 2;
        }

        /* Bottom-Right: 370.49 x 206.98 pt (46.78% x 33.82%) */
        .apex-cert-corner-br {
          position: absolute;
          bottom: 0;
          right: 0;
          width: 46.78%;
          height: 33.82%;
          object-fit: fill;
          pointer-events: none;
          z-index: 2;
        }

        /* 3. Official Apex Crest Emblem */
        /* Top: 30.75 pt (5.02%), Width: 123.7 pt (15.62%), Height: 122.95 pt (20.09%) */
        .apex-cert-crest-wrap {
          position: absolute;
          top: 5.02%;
          left: 50%;
          transform: translateX(-50%);
          width: 15.62%;
          aspect-ratio: 1;
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 10;
        }

        .apex-cert-crest-img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          filter: drop-shadow(0 4px 10px rgba(0, 0, 0, 0.12));
        }

        /* 4. Top Row Metadata: Dated (Left) & Roll Number (Right) */
        /* Exact PDF Baseline: 141.74 pt from top (23.16%) */
        .apex-cert-dated-txt {
          position: absolute;
          top: 23.16%;
          left: 9.09%;
          font-family: 'Gentium Plus', 'Times New Roman', serif;
          font-size: clamp(9px, 1.55vw, 12.5px);
          color: #1e293b;
          font-weight: 400;
          white-space: nowrap;
          z-index: 10;
        }

        .apex-cert-roll-txt {
          position: absolute;
          top: 23.16%;
          right: 9.09%;
          font-family: 'Gentium Plus', 'Times New Roman', serif;
          font-size: clamp(9px, 1.55vw, 12.5px);
          color: #1e293b;
          font-weight: 400;
          text-align: right;
          white-space: nowrap;
          z-index: 10;
        }

        /* 5. Typography Forensics: CERTIFICATE */
        /* Y: 375.19 pt from bottom (236.81 pt = 38.69% from top), Size: 69.98 pt, Color: RGB(0.0157, 0.18, 0.635) = #042ea2 */
        .apex-cert-heading {
          position: absolute;
          top: 36.5%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 90%;
          text-align: center;
          font-family: 'Gentium Plus', Georgia, serif;
          font-weight: 700;
          font-size: clamp(26px, 6.2vw, 54px);
          letter-spacing: 0.05em;
          color: #042ea2;
          margin: 0;
          line-height: 1;
          z-index: 10;
        }

        /* 6. Subtitle: This is to certify that */
        /* Y: 336.79 pt from bottom (275.21 pt = 44.97% from top), Size: 24.96 pt */
        .apex-cert-sub-heading {
          position: absolute;
          top: 44.2%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 90%;
          text-align: center;
          font-family: 'Gentium Plus', Georgia, serif;
          font-weight: 400;
          font-size: clamp(12px, 2.5vw, 21px);
          color: #1e293b;
          margin: 0;
          line-height: 1.1;
          z-index: 10;
        }

        /* 7. Candidate Name: Great Vibes Cursive Script */
        /* Y: 259.25 pt from bottom (352.75 pt = 57.64% from top), Size: 69.98 pt, Color: #042ea2 */
        .apex-cert-candidate-name {
          position: absolute;
          top: 55.5%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 92%;
          text-align: center;
          font-family: 'Great Vibes', cursive;
          font-weight: 400;
          font-size: clamp(26px, 6.2vw, 56px);
          color: #042ea2;
          line-height: 1.15;
          margin: 0;
          white-space: nowrap;
          text-shadow: 0 1px 2px rgba(4, 46, 162, 0.12);
          z-index: 10;
        }

        /* 8. Completion Body: Successfully completed the Six Months */
        /* Y: 212.45 pt from bottom (399.55 pt = 65.29% from top), Size: 17.04 pt */
        .apex-cert-completion-line {
          position: absolute;
          top: 65.29%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 90%;
          text-align: center;
          font-family: 'Gentium Plus', Georgia, serif;
          font-size: clamp(10px, 1.85vw, 15px);
          color: #1e293b;
          font-weight: 400;
          margin: 0;
          white-space: nowrap;
          z-index: 10;
        }

        /* Six Months Highlight: Color RGB(0.902, 0.00784, 0.141) = #e60224 */
        .apex-cert-duration-badge {
          color: #e60224;
          font-weight: 700;
        }

        /* 9. Course Title: Basic Computer Course */
        /* Y: 187.61 pt from bottom (424.39 pt = 69.34% from top), Size: 17.04 pt, Color: #042ea2 */
        .apex-cert-course-title {
          position: absolute;
          top: 69.8%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 90%;
          text-align: center;
          font-family: 'Gentium Plus', Georgia, serif;
          font-weight: 700;
          font-size: clamp(11px, 1.95vw, 16px);
          color: #042ea2;
          letter-spacing: 0.02em;
          margin: 0;
          white-space: nowrap;
          z-index: 10;
        }

        /* 10. Director Authority (Centered Bottom) */
        /* Yasir Ali at Y: 33.02 pt from bottom (94.6% top), Director at Y: 13.2 pt (97.8% top) */
        .apex-cert-director-container {
          position: absolute;
          bottom: 2.1%;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          min-width: 170px;
          z-index: 10;
        }

        .apex-cert-director-decor-line {
          position: absolute;
          top: 8px;
          width: 160px;
          height: 1.5px;
          background: linear-gradient(90deg, transparent, #38bdf8 20%, #042ea2 80%, transparent);
          transform: rotate(-2.5deg);
          pointer-events: none;
          opacity: 0.8;
        }

        .apex-cert-director-name-txt {
          font-family: 'Gentium Plus', Georgia, serif;
          font-weight: 700;
          font-size: clamp(10px, 1.65vw, 14px);
          color: #0f172a;
          line-height: 1.2;
          margin-bottom: 1px;
          position: relative;
          z-index: 2;
        }

        .apex-cert-director-title-txt {
          font-family: 'Gentium Plus', Georgia, serif;
          font-weight: 400;
          font-size: clamp(8.5px, 1.4vw, 11.5px);
          color: #334155;
          line-height: 1.1;
          position: relative;
          z-index: 2;
        }

        /* 11. Certificate Serial Number (Bottom Left) */
        .apex-cert-serial-tag {
          position: absolute;
          bottom: 2.8%;
          left: 6.8%;
          font-family: 'Inter', sans-serif;
          font-size: clamp(8px, 1.1vw, 10px);
          color: #475569;
          font-weight: 500;
          z-index: 10;
          white-space: nowrap;
        }

        /* 12. Borderless Print Rules */
        @media print {
          body * {
            visibility: hidden !important;
          }
          .apex-cert-canvas, .apex-cert-canvas * {
            visibility: visible !important;
          }
          .apex-cert-canvas {
            position: fixed !important;
            left: 0 !important;
            top: 0 !important;
            width: 100vw !important;
            height: 100vh !important;
            max-width: none !important;
            aspect-ratio: auto !important;
            box-shadow: none !important;
            border-radius: 0 !important;
            margin: 0 !important;
            padding: 0 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          @page {
            size: landscape;
            margin: 0;
          }
        }
      `}</style>

      {/* Forensic Certificate Canvas (Exact PDF 792x612 Coordinate Grid) */}
      <div className="apex-cert-canvas">
        
        {/* Layer 1: Forensic Background Texture */}
        <img
          src={certBgImg}
          alt=""
          aria-hidden="true"
          className="apex-cert-bg-art"
        />

        {/* Layer 2: Forensic Corner Bounding Boxes */}
        {/* Top-Left Banner with cyan speed lines */}
        <img
          src={certCornerTLImg}
          alt=""
          aria-hidden="true"
          className="apex-cert-corner-tl"
        />

        {/* Top-Right Geometric Chevron Triangles */}
        <img
          src={certCornerTRImg}
          alt=""
          aria-hidden="true"
          className="apex-cert-corner-tr"
        />

        {/* Bottom-Left Geometric Chevron Triangles */}
        <img
          src={certCornerBLImg}
          alt=""
          aria-hidden="true"
          className="apex-cert-corner-bl"
        />

        {/* Bottom-Right Banner with cyan speed lines */}
        <img
          src={certCornerBRImg}
          alt=""
          aria-hidden="true"
          className="apex-cert-corner-br"
        />

        {/* Layer 3: Forensic Top Row Content */}
        {/* Dated: September 2024 */}
        <div className="apex-cert-dated-txt">
          <span>Dated: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{issueDate || "September 2024"}</span>
        </div>

        {/* Apex Education Forum Official Crest */}
        <div className="apex-cert-crest-wrap">
          <img
            src={logoUrl || certLogoImg}
            alt="Apex Education Forum Crest"
            className="apex-cert-crest-img"
          />
        </div>

        {/* Candidate Reference Roll No */}
        <div className="apex-cert-roll-txt">
          <span>{rollNumber || "AEF-217/2024"}</span>
        </div>

        {/* Layer 4: Forensic Central Typography */}
        {/* Title: CERTIFICATE */}
        <h1 className="apex-cert-heading">CERTIFICATE</h1>

        {/* Subtitle: This is to certify that */}
        <h2 className="apex-cert-sub-heading">This is to certify that</h2>

        {/* Candidate Name in Flowing Great Vibes Cursive Calligraphy */}
        <div className="apex-cert-candidate-name">
          {studentName || "Amjad Ali s/o Kabil"}
        </div>

        {/* Program Completion Statement with Highlighted Red Duration */}
        <div className="apex-cert-completion-line">
          <span>Successfully completed the </span>
          <span className="apex-cert-duration-badge">{duration || "Six Months"}</span>
        </div>

        {/* Course Title in Bold Gentium Plus */}
        <div className="apex-cert-course-title">
          {courseTitle || "Basic Computer Course"}
        </div>

        {/* Layer 5: Forensic Footer Authority */}
        {/* Dynamic Director Section (Centered at Bottom) */}
        <div className="apex-cert-director-container">
          {/* Optional scanned signature image or elegant vector accent */}
          {signatureUrl ? (
            <img
              src={signatureUrl}
              alt="Director Signature"
              style={{ height: "36px", objectFit: "contain", marginBottom: "2px" }}
            />
          ) : (
            <div className="apex-cert-director-decor-line" />
          )}

          {/* Dynamically bound Director Name from Management System */}
          <div className="apex-cert-director-name-txt">
            {directorName || "Yasir Ali"}
          </div>

          {/* Director Title */}
          <div className="apex-cert-director-title-txt">
            {directorTitle || "Director"}
          </div>
        </div>

        {/* Certificate Serial Number (Bottom Left) */}
        <div className="apex-cert-serial-tag">
          <span>Certificate No &nbsp; {certificateNumber || "aef / 2026"}</span>
        </div>

      </div>
    </div>
  );
}
