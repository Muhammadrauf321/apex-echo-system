// Central Seed Data & Canonical Taxonomy for Apex Education Forum
import { COURSE_CATEGORIES, ROLES, FEE_STATUS, EXAM_STATUS } from "./constants.js";

export const SEED_COURSES = [];

// Single Verified Administrator Account
export const ADMIN_USER = {
  uid: "lPIJ3zyZoRVVfdLkOck6tYCNICO2",
  name: "Muhammad Rauf",
  email: "muhammadraufbaloch6@gmail.com",
  role: ROLES.DIRECTOR,
  avatar: "https://lh3.googleusercontent.com/a/ACg8ocIuFIKbRXt0gvqQsSJB1wp8JMljzM9pM2Pww9XJQTdHEYjiosSygw=s96-c",
  title: "Executive Director & Founder"
};

// Only the verified Admin account exists — 100% clean of fake demo users
export const DEMO_USERS = [
  ADMIN_USER
];

// 100% Fresh & Clean Real Stores — zero dummy data
export const SEED_BATCHES = [];
export const SEED_CERTIFICATES = [];
export const SEED_EXAMS = [];
