# 🎤 Mentor Presentation & Viva Walkthrough Guide

This guide provides a structured presentation script, slide outline, and demonstration walkthrough for presenting the **AI Skin Intelligence & Personalized Skincare Planner** to mentors, faculty, and technical reviewers.

---

## 1. 5-Minute Presentation Script

### Introduction (1 Minute)
> "Good morning/afternoon respected mentors. Today I am presenting **AI Skin Intelligence & Personalized Skincare Planner**, an enterprise clinical skincare platform that replaces guesswork in personal skincare with computer vision AI diagnostics, chemical compatibility analysis, and multi-role clinical triage between patients, estheticians, and dermatologists."

### The Core Problem & Solution (1 Minute)
> "Most consumers struggle with trial-and-error product selection or combine active acids like Glycolic Acid with Retinol, causing severe skin barrier damage. On the other hand, access to professional dermatological triage is expensive and slow. Our platform solves this by offering an automated AI diagnostic engine, an active ingredient conflict checker, and a multi-tiered clinical workspace."

### Architecture & Technical Stack (1.5 Minutes)
> "The platform is built on a modern decoupled architecture:
> - **Frontend**: React 18 with Vite, custom design system using 15 curated gradients, TailwindCSS, and Lucide icons.
> - **Backend**: FastAPI (Python 3.13) delivering high-concurrency async endpoints with Pydantic validation schemas.
> - **AI Layer**: Computer vision processing via Pillow (fixing EXIF orientation, Lanczos noise filtering, color density analysis) returning metrics for Acne, Redness, Dryness, Oiliness, Sensitivity, and Hyperpigmentation.
> - **Database**: PostgreSQL with SQLAlchemy ORM and Alembic schema migrations."

### Live Demonstration & Highlights (1.5 Minutes)
> "During our live demo, we showcase:
> 1. Real-time webcam frame capture and gallery drag-and-drop uploads.
> 2. Clinical AI facial scan diagnostics with metrics radar charts.
> 3. Chemical interaction safety checker flagging harmful active pairs.
> 4. Multi-role workspaces for Consultants and Dermatologists to manage patient triage queues."

---

## 2. Live Demonstration Flow Strategy

1. **Start on Landing Page (`Home.jsx`)**: Point out the Hero Gradient background, Aurora text accents, and Cyber Neon CTAs.
2. **Show User Dashboard (`UserDashboard.jsx`)**: Demonstrate the Deep Tech Blue banner, KPI widgets, and daily routine tracker.
3. **Run AI Image Analysis (`ImageAnalysisPage.jsx`)**: Click webcam frame capture or upload a file, run the scan, and highlight the dermatological metric profile and confidence score.
4. **Demonstrate Chemical Conflict Checker (`IngredientIntelligencePage.jsx`)**: Select `AHA Complex` and `Retinol` to trigger the **HIGH CONFLICT** alert.
5. **Switch Roles to Admin & Consultant (`/admin` & `/consultant`)**: Show the clinical patient directory, risk triage ratings, and administrative user controls.
