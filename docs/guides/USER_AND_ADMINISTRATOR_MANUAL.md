# User & Administrator Manual

## AI Skin Intelligence & Personalized Skincare Planner

This manual provides instructions and operational guidance for all three user personas of the **AI Skin Intelligence Platform**:
1. **Patient / Consumer Users**
2. **Skincare Consultants & Dermatologists**
3. **System Administrators**

---

## Part 1: Patient / Consumer User Guide

### 1.1 Account Registration & Authentication
1. Navigate to `http://localhost:80` (or `http://localhost:5173` in development).
2. Click **Register** in the top navigation bar.
3. Provide your Full Name, Email, and a strong password (minimum 8 characters).
4. Alternatively, sign in using **Continue with Google** for single-sign-on (SSO).
5. Once authenticated, your session token is securely stored and protected with HTTP-only cookies.

---

### 1.2 Setting Up Your Skin Profile
1. Navigate to the **Profile** tab.
2. Complete your clinical skin profile:
   - **Fitzpatrick Skin Phototype**: Select your skin tone and UV reaction type (Type I to Type VI).
   - **Skin Type**: Dry, Oily, Combination, Sensitive, or Normal.
   - **Primary Concerns**: Acne, Hyperpigmentation, Fine Lines, Redness, etc.
   - **Sensitivities & Allergies**: Specify any known allergic reactions to active ingredients (e.g., Lanolin, Fragrance, Sulfa).
   - **Lifestyle Metrics**: Water intake (L/day), sleep duration (hours/night), and perceived stress level.
3. Click **Save Profile**. This data is used across the AI routine generator and product compatibility engine.

---

### 1.3 Running AI Skin Assessment & Image Analysis
1. Navigate to **Assessment**.
2. **Option A (Computer Vision Scan)**:
   - Click **Upload Image** and select a clear, well-lit photo of the affected skin area.
   - The deep learning model (**EfficientNet-B0**) processes the image and identifies condition classes (e.g., *Acneiform & Follicular*, *Eczematous & Inflammatory*).
3. **Option B (Symptom Assessment)**:
   - Adjust severity sliders for concerns (Acne, Hyperpigmentation, Dryness, Redness, Oiliness, etc.).
4. Click **Submit Assessment**.
5. The platform calculates your **5-Factor Weighted Skin Health Score**:
   - Condition Severity (35%)
   - Lifestyle Rhythms (20%)
   - Rest Recovery (15%)
   - Routine Consistency (20%)
   - Hydration Balance (10%)
6. Review your clinical risk level (*Low Risk*, *Moderate Risk*, or *High Priority*) and personalized wellness recommendations.

---

### 1.4 Generating Personalized Skincare Routines
1. Navigate to **Routines**.
2. Click **Generate AI Routine Protocol**.
3. The engine designs a 5-part regimen:
   - **Morning Protocol**: Cleansing, antioxidant hydration, sun protection (SPF).
   - **Evening Protocol**: Double cleansing, targeted clinical actives, barrier restoration.
   - **Weekly Protocol**: Exfoliation and deep nourishing masks.
   - **Monthly Protocol**: Clinical treatment resets and progress evaluations.
   - **Seasonal Protocol**: Adaptations for summer humidity or winter barrier dryness.

---

### 1.5 Checking Ingredient Compatibility & Product Recommendations
1. Navigate to **Products & Ingredients**.
2. Under **Ingredient Safety Checker**:
   - Select multiple actives (e.g., *Retinol*, *AHA Glycolic Acid*, *Vitamin C*).
   - Click **Check Compatibility**.
   - The safety engine evaluates pH conflicts, chemical antagonism, and over-exfoliation warnings.
3. Under **AI Product Recommendations**:
   - Select your budget tier (*Budget*, *Mid-Range*, *Luxury*, or *All*).
   - Click **Generate Matches**.
   - Review personalized products with calculated match percentage scores and INR pricing.

---

### 1.6 Progress Diary & Clinical Report Exports
1. Navigate to **Diary & Progress**.
2. Log daily routine completions to build consistency scores.
3. Upload periodic progress photos to track diagnostic trends over weeks.
4. Click **Export Clinical Report** to download your full medical history in:
   - **PDF Report**: High-resolution clinical summary with charts, doctor review notes, and routine schedules.
   - **CSV / Excel (XLSX)**: Complete diagnostic logs and factor scores.

---

## Part 2: Dermatologist & Skincare Consultant Guide

### 2.1 Accessing the Clinical Workspace
1. Log in with an account granted the `DERMATOLOGIST` or `SKINCARE_CONSULTANT` role.
2. The navigation bar displays the **Clinical Workspace** option.
3. Dashboard Overview displays:
   - **Total Active Patients**
   - **High-Risk Patient Count**
   - **Consultations Scheduled for Today**
   - **Pending Clinical Reviews**

---

### 2.2 Patient Clinical Directory & Profile Inspection
1. Open **Patient Directory**.
2. Filter by risk tier (*Moderate Risk*, *High Priority*) or search by patient name/email.
3. Select a patient to view their comprehensive clinical dossier:
   - Fitzpatrick profile & allergies
   - Historical image analyses & condition confidence scores
   - 5-Factor barrier health trend charts
   - Current morning/evening routines and product recommendations

---

### 2.3 Scheduling Consultations & Submitting Clinical Reviews
1. Select **Schedule Consultation**.
2. Choose appointment date/time and input pre-consultation notes.
3. Following the clinical appointment:
   - Click **Submit Clinical Review**.
   - Provide formal clinical diagnosis, prescribed adjustments to active ingredients, and lifestyle guidelines.
   - The patient is notified instantly in their Notification Center.

---

## Part 3: System Administrator Guide

### 3.1 User Management & Role Provisioning
1. Log in with an `ADMIN` role account.
2. Navigate to the **Admin Dashboard** (`/admin`).
3. View all registered users across the platform.
4. **Role Management**:
   - Change user roles between `USER`, `SKINCARE_CONSULTANT`, and `DERMATOLOGIST`.
   - Protects the system against unauthorized self-assignment of medical staff roles.
5. **Account Governance**:
   - Suspend/block compromised accounts.
   - Reactivate verified users.

---

### 3.2 Audit Logs & Security Monitoring
1. In the Admin Dashboard, click **Audit Logs**.
2. The audit trail captures all sensitive operations:
   - Timestamp (UTC)
   - Admin actor user ID
   - Action performed (e.g., `ROLE_CHANGE`, `USER_SUSPENSION`, `CATALOG_UPDATE`)
   - Target entity ID and before/after metadata

---

### 3.3 System Telemetry & Infrastructure Monitoring
1. In the Admin Dashboard, view the **System Telemetry** panel or make a GET request to:
   ```bash
   curl http://localhost:8000/api/system/telemetry
   ```
2. Metrics monitored:
   - **System Uptime**: Seconds elapsed since server startup.
   - **Database Status**: PostgreSQL connectivity & pool performance.
   - **ML Inference Engine**: Model architecture (`EfficientNet-B0`), weights loaded status, and device allocation (CUDA / CPU).
   - **Security Flags**: GZip compression status, CORS headers, Request ID correlation tracking.
