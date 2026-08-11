# 🎨 Frontend Engineering & Design System Guide (`skin-dashboard`)

This guide documents the React single-page application structure, state management, routing, component hierarchy, design system tokens, and UI patterns.

---

## 1. Directory & File Map

```
skin-dashboard/
├── src/
│   ├── components/            # Reusable UI Components
│   │   ├── Navbar.jsx         # Sticky top navigation bar & mobile menu drawer
│   │   ├── Sidebar.jsx        # Sidebar navigation drawer with role-based links
│   │   ├── Layout.jsx         # Wrapper layout component
│   │   ├── ProfileDropdown.jsx# User avatar menu & logout modal
│   │   ├── Toast.jsx          # Notification toast overlay
│   │   └── Skeleton.jsx       # Loading skeleton loader
│   ├── context/
│   │   ├── AuthContext.jsx    # Authentication state, login, registration, OAuth
│   │   └── ThemeContext.jsx   # Dark / Light theme provider
│   ├── pages/                 # Main Application Views
│   │   ├── Home.jsx           # Public landing page with Hero Gradient
│   │   ├── UserDashboard.jsx  # Primary user workspace with Deep Tech Blue header
│   │   ├── ImageAnalysisPage.jsx # AI Skin Image Analysis (Webcam & Gallery)
│   │   ├── SkinAssessment.jsx # Metric assessment wizard & radar chart
│   │   ├── SkinProfileWizard.jsx # Multi-step clinical skin questionnaire
│   │   ├── SkinRoutinePage.jsx # 5-tier adaptive routine regimen view
│   │   ├── SkinAnalyticsPage.jsx # Health trends chart & before/after diary
│   │   ├── IngredientIntelligencePage.jsx # Safety checker & chemical conflict detector
│   │   ├── ProductCatalogPage.jsx # Skincare products catalog & filters
│   │   ├── ProductRecommendationsPage.jsx # AI formulation match engine
│   │   ├── ReportsPage.jsx    # CSV / PDF / Excel data exporter
│   │   ├── ConsultantDashboard.jsx # Skincare consultant clinical workspace
│   │   ├── DermatologistDashboard.jsx # Dermatologist medical triage workspace
│   │   ├── AdminDashboard.jsx # System administration panel
│   │   ├── Login.jsx          # User login screen
│   │   └── Register.jsx       # Account registration screen
│   ├── services/
│   │   └── apiService.js      # Axios REST client API request wrappers
│   ├── styles/
│   │   └── design-system.css # Centralized 15-gradient design tokens & utilities
│   ├── App.jsx                # Main React router & protected routes
│   └── main.jsx               # React DOM root entry
```

---

## 2. Centralized Design System (`design-system.css`)

The application features a modern SaaS visual design language built using 15 curated CSS gradients and utility classes:

### 2.1 CSS Gradient Library Tokens
- `--gradient-hero`: `linear-gradient(135deg, #0B0F17 0%, #1A1F36 50%, #0B0F17 100%)` (Hero Section)
- `--gradient-aurora`: `linear-gradient(135deg, #6366F1 0%, #A855F7 50%, #06B6D4 100%)` (AI Highlights)
- `--gradient-glass`: `linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.01) 100%)` (Cards)
- `--gradient-tech-blue`: `linear-gradient(180deg, #1E293B 0%, #0F172A 100%)` (Dashboard Headers)
- `--gradient-cyber-neon`: `linear-gradient(90deg, #06B6D4 0%, #3B82F6 50%, #6366F1 100%)` (Primary CTAs)
- `--gradient-emerald`: `linear-gradient(135deg, #064E3B 0%, #10B981 50%, #34D399 100%)` (Success Alerts)
- `--gradient-sunset`: `linear-gradient(135deg, #881337 0%, #E11D48 50%, #F97316 100%)` (High-Risk Triage)
- `--gradient-champagne`: `linear-gradient(135deg, #78350F 0%, #D97706 50%, #FDE68A 100%)` (Upgrades & Roles)

### 2.2 Reusable Component CSS Tokens
- `.btn-primary-neon`: Cyber Neon gradient button with hover glow and spring animations.
- `.btn-secondary-tech`: Deep Tech Blue button with glass borders.
- `.saas-card-premium`: Elevated white/dark surface card with subtle hover translation (`translateY(-2px)`).
- `.glass-panel`: Backdrop-blur panel (`backdrop-filter: blur(16px)`) with subtle white/dark borders.

---

## 3. State Management & API Client (`apiService.js`)

All API interactions are consolidated into `apiService.js` using Axios with automatic credentials forwarding (`withCredentials: true`) and Bearer token headers:

```javascript
// Example API Client Method in apiService.js
uploadImageAnalysis: async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  const response = await api.post("/image-analysis/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" }
  });
  return response.data;
}
```

---

## 4. Protected Route Authorization (`ProtectedRoute.jsx`)

Routes are secured using `ProtectedRoute.jsx` which verifies authentication status and user roles:

```jsx
<Route
  path="/admin"
  element={
    <ProtectedRoute allowedRoles={["ADMIN"]}>
      <AdminDashboard />
    </ProtectedRoute>
  }
/>
```
