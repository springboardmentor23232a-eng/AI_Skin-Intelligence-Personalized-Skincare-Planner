# AI Skin Intelligence & Personalized Skincare Planner — User Guide

Welcome to the **AI Skin Intelligence & Personalized Skincare Planner** platform. This user guide provides comprehensive instructions for navigating and utilizing the clinical assessment, routine personalization, ingredient intelligence, progress analytics, and reporting capabilities across all four supported system roles: **USER**, **CONSULTANT**, **DOCTOR / DERMATOLOGIST**, and **ADMIN**.

> [!IMPORTANT]
> **Medical Disclaimer**:
> The AI skin assessments, health scoring, product recommendations, and generated routines provided by this application are designed strictly for informational, educational, and personalized skincare planning purposes. They **do not constitute medical diagnoses, clinical prescriptions, or formal medical advice**. Always consult a licensed board-certified dermatologist or healthcare professional for acute or persistent skin conditions.

---

## Table of Contents
1. [Getting Started & Authentication](#1-getting-started--authentication)
2. [Patient / User Workflow](#2-patient--user-workflow)
   - [2.1 Skin Profile Questionnaire](#21-skin-profile-questionnaire)
   - [2.2 AI Visual Skin Assessment](#22-ai-visual-skin-assessment)
   - [2.3 Personalized Skincare Routine](#23-personalized-skincare-routine)
   - [2.4 Ingredient Intelligence & Safety Checker](#24-ingredient-intelligence--safety-checker)
   - [2.5 Clinically Matched Product Recommendations](#25-clinically-matched-product-recommendations)
   - [2.6 Mathematical Skin Health Score](#26-mathematical-skin-health-score)
   - [2.7 Daily Skincare Checklist & Habit Tracking](#27-daily-skincare-checklist--habit-tracking)
   - [2.8 Progress Analytics & Before/After Comparison](#28-progress-analytics--beforeafter-comparison)
   - [2.9 Reports & Export Center (PDF & Excel)](#29-reports--export-center-pdf--excel)
   - [2.10 Notification & Reminder Preferences](#210-notification--reminder-preferences)
3. [Skincare Consultant Workflow](#3-skincare-consultant-workflow)
4. [Clinical Dermatologist Workflow](#4-clinical-dermatologist-workflow)
5. [System Administrator Workflow](#5-system-administrator-workflow)
6. [Account Settings & Privacy](#6-account-settings--privacy)

---

## 1. Getting Started & Authentication

### 1.1 Account Registration
1. Navigate to the application portal at `http://localhost:5173` (or your deployment URL).
2. Click **Get Started** or **Register**.
3. Provide your full name, a valid email address, and a secure password (minimum 8 characters).
4. Select your role (**USER**, **CONSULTANT**, or **DOCTOR**; Administrator roles are provisioned by existing admins).
5. Click **Create Account**.

### 1.2 Sign In & Session Management
1. Enter your registered email and password on the **Login** screen.
2. Upon successful authentication, a cryptographically signed JSON Web Token (JWT) is issued.
3. The platform automatically redirects you to your role-specific dashboard.
4. Sessions persist securely in browser storage. To sign out, click **Sign Out** in the sidebar.

---

## 2. Patient / User Workflow

### 2.1 Skin Profile Questionnaire
Before assessment and routine generation, complete the **28-Question Clinical Profile**:
1. Navigate to **Personalized Routine** or **Profile Questionnaire**.
2. Answer questions across 6 diagnostic dimensions:
   - **Skin Basics**: Fitzpatrick skin type, sensitivity classification.
   - **Active Concerns**: Acne, fine lines, dark circles, hyperpigmentation, oiliness, redness.
   - **Current Habits**: Existing cleanser, serum, moisturizer, sunscreen usage.
   - **Lifestyle Factors**: Sleep duration, daily water intake, stress, physical activity.
   - **Environmental Exposure**: Climate, UV sun exposure, urban pollution.
   - **Allergies & Preferences**: Avoided chemical ingredients, fragrance sensitivity, budget tier.
3. Click **Save Diagnostic Profile**.

### 2.2 AI Visual Skin Assessment
1. Navigate to **Skin Assessment** in the sidebar.
2. Click **Upload Face Image** or capture a clear photo in natural daylight without makeup.
3. Click **Analyze Skin**.
4. The PyTorch deep-learning vision model evaluates 18 clinical attributes and displays:
   - **Overall Skin Condition verdict**.
   - **Detected Concerns** with priority badges and quantitative severity bars (0.0–5.0).
   - **Identified Risk Factors** (e.g., UV photodamage risk, barrier compromise).
   - **Clinical Recommendations** tailored to the scan.

### 2.3 Personalized Skincare Routine
1. Navigate to **Personalized Routine**.
2. View your customized regimen divided into:
   - **Morning Routine (AM)**: Cleansing, antioxidant treatment, barrier moisturizer, broad-spectrum SPF.
   - **Evening Routine (PM)**: Double-cleansing, targeted actives (e.g., Retinoids/AHA/BHA), nocturnal repair cream.
   - **Weekly Treatments**: Exfoliating masks, clay treatments, hydrating sheet masks.
3. Click on any step to inspect application instructions, precautions, and active ingredients.
4. Toggle routine steps on/off to adapt the routine to your daily needs.

### 2.4 Ingredient Intelligence & Safety Checker
1. Navigate to **Ingredient Intelligence**.
2. **Search Ingredients**: Search over 50+ dermatology-grade active ingredients (e.g., Niacinamide, Salicylic Acid, Hyaluronic Acid, Retinol).
3. **Compatibility Analysis**: Check if an active ingredient is suitable, neutral, or should be avoided for your specific skin type and sensitivity.
4. **Interaction Matrix**: Select two ingredients to check for potential conflicts (e.g., layering Retinol with strong AHA/BHA exfoliants).

### 2.5 Clinically Matched Product Recommendations
1. Navigate to **Recommendations**.
2. Explore curated product formulations evaluated against your profile:
   - **Match Compatibility Score** (0–100%).
   - **Safety Exclusions**: Products containing allergens or ingredients on your avoidance list are automatically excluded.
   - **Category Filters**: Cleansers, Toners, Serums, Moisturizers, Sunscreens, Treatments, and Masks.
   - **Budget Tier Filtering**: Budget (<₹500), Moderate (₹500–₹1000), and Premium (>₹1000).

### 2.6 Mathematical Skin Health Score
1. Navigate to **Skin Health Score**.
2. View your composite score (0–100) computed using the 5-factor weighted clinical index:
   - **Skin Condition Index (35%)**: Derived from AI computer vision face scans & diagnostic condition checks.
   - **Routine Consistency (20%)**: Tracked adherence rate to daily personalized AM/PM skincare steps.
   - **Lifestyle Habits (20%)**: Evaluation of exercise frequency, stress management, sun & pollution defenses.
   - **Sleep Quality (15%)**: Assessment of cellular repair duration and nocturnal rest patterns.
   - **Hydration Level (10%)**: Evaluation of daily water intake volume supporting skin barrier turgor.
3. Click **Recalculate Score** anytime you log new lifestyle entries or face scans.

### 2.7 Daily Skincare Checklist & Habit Tracking
1. Navigate to **Skincare Checklist**.
2. Check off your completed morning and evening skincare steps as you perform them.
3. Click **Submit Today's Checklist Log** to log your daily adherence rate and maintain your streak.

### 2.8 Progress Analytics & Before/After Comparison
1. Navigate to **Progress Tracking**.
2. **Longitudinal Trends**: Switch between timeframes (**7 Days, 30 Days, 3 Months, 6 Months, All**) to view overall health score trajectory and concern progression curves.
3. **Before & After Visual Comparison**: Select two historical scan dates from the dropdown to compare concern severity deltas side-by-side.

### 2.9 Reports & Export Center (PDF & Excel)
1. Navigate to **Reports & Exports**.
2. Choose from 5 clinical-grade report types:
   - **Skin Assessment Report**: AI visual analysis, concerns, risk factors, and medical disclaimer (**PDF**).
   - **Personalized Routine Report**: AM/PM sequence, step ordering, active formulations, and 30-day adherence (**PDF & Excel**).
   - **Product Recommendations Report**: Compatibility scoring, active ingredients, and dermatological match reasons (**PDF & Excel**).
   - **Progress & Trends Report**: Longitudinal health score history, 5-component breakdown, and concern trajectories (**PDF & Excel**).
   - **Skin Health Score Report**: Mathematical component breakdown, factor weightings, and historical logs (**PDF & Excel**).
3. Click **Preview Real Data** to inspect live database records before exporting.
4. Click **Export PDF** or **Export Excel** to trigger instant on-demand downloads.

### 2.10 Notification & Reminder Preferences
1. Access the **Bell Icon** in the top navigation bar to view live in-app reminders.
2. In **Settings -> Notification Preferences**:
   - Toggle individual reminder channels: Routine Reminders, Product Replenishment alerts, Hydration check-ins, Sleep/wind-down prompts, and Progress updates.
   - Toggle **Email Notifications** on/off. When enabled, non-intrusive notification summaries are dispatched to your registered email address.

---

## 3. Skincare Consultant Workflow

As a **Consultant**, you have access to specialized client management tools:
1. **Client Roster (`/consultant/profiles`)**: View all clients assigned to your care with their skin types and primary goals.
2. **Assessment Audits (`/consultant/reports`)**: Review client AI face scan results, detected concerns, and risk factors.
3. **Recommendation Guidance (`/consultant/recommendations`)**: Validate product suitability scores and suggest formulation adjustments.
4. **Client Progress Monitoring (`/consultant/progress`)**: Monitor 30-day routine adherence rates and health score trajectories.
5. **Client Export Generator (`/dashboard/reports`)**: Select a client from the practitioner dropdown to export their clinical PDF or Excel reports.

---

## 4. Clinical Dermatologist Workflow

As a **Doctor / Dermatologist**, you have clinical oversight clearances:
1. **Patient Insights (`/dermatologist/insights`)**: Search and filter patients by sensitivity, allergy flags, and acute concern severity.
2. **Condition Diagnostic Queue (`/dermatologist/conditions`)**: Review flagged high-risk conditions, severe acne classifications, and photoprotection requirements.
3. **Treatment Recommendations (`/dermatologist/recommendations`)**: Review active chemical ingredients (e.g., Retinoids, Azelaic Acid, Salicylic Acid) against patient allergy profiles.
4. **Clinical Progress Analytics (`/dermatologist/analytics`)**: Analyze longitudinal cohort recovery rates, treatment success percentages, and disease distributions.

---

## 5. System Administrator Workflow

As an **Administrator**, you oversee system health, user permissions, and platform security:
1. **System Health & Telemetry (`/admin`)**: Real-time database connection status, database latency (ms), and table record metrics.
2. **User & RBAC Directory (`/admin/users`)**: Search all platform accounts and modify user roles (**USER**, **CONSULTANT**, **DOCTOR**, **ADMIN**).
3. **Platform Analytics (`/admin/analytics`)**: Daily active user counts, module utilization rates, and registration charts.
4. **Platform Broadcasts**: Dispatch global system announcements and maintenance alerts to specific target roles.

---

## 6. Account Settings & Privacy

- **Profile Details**: Update your name, preferred contact email, and role details.
- **Security & Password**: Change your authentication password with encrypted bcrypt hashing.
- **Data Isolation**: All patient records and reports are strictly isolated by cryptographic authorization checks. No unauthorized practitioner or third party can access unassigned personal data.
