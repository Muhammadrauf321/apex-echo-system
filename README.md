# Apex Echo System

Unified digital ecosystem for the **Apex Education Forum**, featuring a public-facing community website, a real-time messaging platform (Apex Connect), and an educational management system (Admin & LMS).

---

## 🏛️ Ecosystem Overview

```
Apex Echo System
├── apps/
│   ├── website/              # Apex Education Forum Public Website & Community Portal
│   ├── messaging-app/        # Apex Connect: Real-Time Messaging & Discussions
│   └── management-system/    # Apex Educational Management System (Admin, LMS, Staff & Students)
└── shared/                   # Shared Firebase configuration, utilities, and assets
```

### 1. 🌐 Public Website (`apps/website`)
- Comprehensive educational portal for students, parents, and educators.
- Programs, admissions, events calendar, faculty showcase, and forum announcements.
- Responsive, accessible, and high-performance design.

### 2. 💬 Messaging App (`apps/messaging-app`)
- Real-time collaborative communication platform ("Apex Connect").
- Channel-based discussion rooms (by class, subject, department, and extracurricular clubs).
- Direct messaging, media sharing, reactions, and live presence backed by Cloud Firestore.

### 3. 📊 Educational Management System (`apps/management-system`)
- Administrative dashboard & Student Information System (SIS/LMS).
- Student registration, enrollment, attendance tracking, and grading/report cards.
- Teacher assignments, timetable management, and fine-grained role-based permissions.

---

## ☁️ Cloud & Backend Infrastructure

- **Firebase Project ID:** `apex-echo-system`
- **Firebase Services:**
  - **Firebase Authentication:** Multi-role user authentication (Admins, Teachers, Students, Parents).
  - **Cloud Firestore:** Real-time database for messages, profiles, classes, and records.
  - **Firebase Hosting:** Global CDN deployment for all web applications.
  - **Firebase Storage:** Secure document and media attachment storage.
- **GitHub Repository:** [Muhammadrauf321/apex-echo-system](https://github.com/Muhammadrauf321/apex-echo-system)

---

## 🚀 Getting Started

### Prerequisites
- Node.js (>= v18, current: v24+)
- npm / npx
- Firebase CLI (`firebase --version`)
- GitHub CLI (`gh --version`)

### Project Setup
```bash
# Clone the repository
git clone https://github.com/Muhammadrauf321/apex-echo-system.git
cd apex-echo-system

# Install dependencies across all apps
npm install
```
