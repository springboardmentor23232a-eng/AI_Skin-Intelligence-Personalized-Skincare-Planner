# COMPREHENSIVE API ROUTE AUDIT
**Project:** AI Skin Intelligence & Personalized Skincare Planner  
**FastAPI Framework Version:** 0.115.8  
**Authentication Type:** JWT Bearer & HttpOnly Cookies  

---

## Complete API Route Inventory

| Method | Path | Auth Required | Role | Request Schema | Response Schema | Database Effect | Frontend Consumption | Verification Status |
| :--- | :--- | :---: | :--- | :--- | :--- | :--- | :--- | :---: |
| `POST` | `/api/auth/register` | No | Any | `UserCreate` | `Token` | Inserts into `users` | `Register.jsx` | 🟢 PASS |
| `POST` | `/api/auth/login` | No | Any | `LoginRequest` | `Token` | Reads `users` | `Login.jsx` | 🟢 PASS |
| `POST` | `/api/auth/logout` | No | Any | None | `GenericMessage` | Clears Auth Cookies | `Navbar.jsx` | 🟢 PASS |
| `POST` | `/api/auth/refresh` | Optional | Any | `RefreshTokenRequest` | `Token` | Validates JWT & Refresh | `apiService.js` | 🟢 PASS |
| `POST` | `/api/auth/google` | No | Any | `GoogleAuthRequest` | `Token` | Inserts/Reads `users` | `Login.jsx` | 🟢 PASS |
| `GET` | `/api/auth/me` | Yes | Any | None | `UserResponse` | Reads `users` | `AuthContext.jsx` | 🟢 PASS |
| `POST` | `/api/profile` | Yes | USER | `SkinProfileCreate` | `SkinProfileResponse` | Upserts `skin_profiles` | `SkinProfileWizard.jsx` | 🟢 PASS |
| `GET` | `/api/profile` | Yes | USER | None | `SkinProfileResponse` | Reads `skin_profiles` | `UserDashboard.jsx` | 🟢 PASS |
| `PUT` | `/api/profile` | Yes | USER | `SkinProfileUpdate` | `SkinProfileResponse` | Updates `skin_profiles` | `SkinProfileWizard.jsx` | 🟢 PASS |
| `DELETE` | `/api/profile` | Yes | USER | None | Status 200 | Deletes `skin_profiles` | Profile Management | 🟢 PASS |
| `POST` | `/api/assessment` | Yes | USER | `SkinAssessmentCreate` | `SkinAssessmentResponse` | Inserts `skin_assessments` | `SkinAssessment.jsx` | 🟢 PASS |
| `GET` | `/api/assessment/history`| Yes | USER | None | `List[SkinAssessmentResponse]` | Reads `skin_assessments` | `SkinAnalyticsPage.jsx` | 🟢 PASS |
| `GET` | `/api/assessment/{id}` | Yes | USER | Path ID | `SkinAssessmentResponse` | Reads `skin_assessments` | Assessment Detail Modal | 🟢 PASS |
| `POST` | `/api/image-analysis/upload` | Yes | USER | Multipart Image | `ImageAnalysisResponse` | Saves Image + Inserts `image_analyses` | `SkinAssessment.jsx` | 🟢 PASS |
| `POST` | `/api/image-analysis/webcam` | Yes | USER | Base64 Image | `ImageAnalysisResponse` | Saves Image + Inserts `image_analyses` | `SkinAssessment.jsx` | 🟢 PASS |
| `GET` | `/api/image-analysis/history`| Yes | USER | None | `List[ImageAnalysisResponse]` | Reads `image_analyses` | History Tab | 🟢 PASS |
| `POST` | `/api/routines/generate` | Yes | USER | None | `List[SkincareRoutineResponse]` | Replaces `skincare_routines` | `SkinRoutinePage.jsx` | 🟢 PASS |
| `GET` | `/api/routines` | Yes | USER | None | `List[SkincareRoutineResponse]` | Reads `skincare_routines` | `SkinRoutinePage.jsx` | 🟢 PASS |
| `GET` | `/api/routines/{type}` | Yes | USER | Path Routine Type | `SkincareRoutineResponse` | Reads `skincare_routines` | Step Display | 🟢 PASS |
| `PUT` | `/api/routines/{id}` | Yes | USER | `RoutineUpdateRequest` | `SkincareRoutineResponse` | Updates `skincare_routines` | Routine Editor Modal | 🟢 PASS |
| `DELETE` | `/api/routines/{id}` | Yes | USER | Path Routine ID | Status 200 | Deletes `skincare_routines` | Routine Management | 🟢 PASS |
| `GET` | `/api/ingredients` | Yes | USER | None | `List[IngredientResponse]` | Reads `ingredients` | `IngredientIntelligencePage.jsx` | 🟢 PASS |
| `GET` | `/api/ingredients/{id}` | Yes | USER | Path ID | `IngredientResponse` | Reads `ingredients` | Ingredient Detail View | 🟢 PASS |
| `POST` | `/api/ingredients/check-compatibility` | Yes | USER | `CompatibilityCheckRequest` | `CompatibilityCheckResponse` | Inserts `ingredient_compatibility_checks` | `IngredientIntelligencePage.jsx` | 🟢 PASS |
| `GET` | `/api/products` | Yes | Any | Query Filters | `List[ProductResponse]` | Reads `products` | `ProductCatalogPage.jsx` | 🟢 PASS |
| `GET` | `/api/products/{id}` | Yes | Any | Path ID | `ProductResponse` | Reads `products` | Product Detail Modal | 🟢 PASS |
| `POST` | `/api/recommendations/generate` | Yes | USER | `RecommendationRequest` | `ProductRecommendationSessionResponse` | Inserts `product_recommendations` | `ProductRecommendationsPage.jsx` | 🟢 PASS |
| `GET` | `/api/recommendations/history` | Yes | USER | None | `List[ProductRecommendationSessionResponse]` | Reads `product_recommendations` | History Tab | 🟢 PASS |
| `POST` | `/api/recommendations/compare` | Yes | USER | `ProductComparisonRequest` | `ProductComparisonResponse` | Reads `products` + `skin_profiles` | Comparison Matrix Modal | 🟢 PASS |
| `GET` | `/api/recommendations/alternatives/{id}` | Yes | USER | Path ID | `AlternativeProductsResponse` | Reads `products` | Alternatives Modal | 🟢 PASS |
| `GET` | `/api/analytics/history` | Yes | USER | None | `SkinHealthTrendsResponse` | Computes Master Health Score | `SkinAnalyticsPage.jsx` | 🟢 PASS |
| `GET` | `/api/analytics/routines/logs` | Yes | USER | Date Filter | `List[SkincareLogResponse]` | Reads `skincare_logs` | Compliance Calendar | 🟢 PASS |
| `POST` | `/api/analytics/routines/logs` | Yes | USER | `SkincareLogCreate` | `SkincareLogResponse` | Inserts `skincare_logs` | Routine Completion Log | 🟢 PASS |
| `GET` | `/api/analytics/progress` | Yes | USER | None | `List[SkinProgressPhotoResponse]` | Reads `skin_progress_photos` | Progress Timeline | 🟢 PASS |
| `POST` | `/api/analytics/progress` | Yes | USER | `SkinProgressPhotoCreate` | `SkinProgressPhotoResponse` | Inserts `skin_progress_photos` | Diary Notes Form | 🟢 PASS |
| `POST` | `/api/analytics/progress/upload` | Yes | USER | Multipart Photo | `SkinProgressPhotoResponse` | Saves Image + Inserts Photo Log | Progress Photo Upload | 🟢 PASS |
| `GET` | `/api/clinical/stats` | Yes | CONSULTANT/DERM/ADMIN | None | Clinical Stats JSON | Aggregates DB Records | Clinical Dashboards | 🟢 PASS |
| `GET` | `/api/clinical/patients` | Yes | CONSULTANT/DERM/ADMIN | Query Params | `List[PatientSummary]` | Queries `users` + `skin_profiles` | Patient Directory Table | 🟢 PASS |
| `GET` | `/api/clinical/patients/{id}` | Yes | CONSULTANT/DERM/ADMIN | Path ID | Patient Clinical File | Reads Patient Diagnostics | Clinical Review Panel | 🟢 PASS |
| `GET` | `/api/clinical/consultations` | Yes | Any Auth | Filter Params | `List[ConsultationResponse]` | Reads `consultations` | Appointment Scheduler | 🟢 PASS |
| `POST` | `/api/clinical/consultations` | Yes | USER | `ConsultationCreate` | `ConsultationResponse` | Inserts `consultations` | Booking Form | 🟢 PASS |
| `PUT` | `/api/clinical/consultations/{id}` | Yes | CONSULTANT/DERM/ADMIN | `ConsultationUpdate` | `ConsultationResponse` | Updates `consultations` | Status Manager | 🟢 PASS |
| `POST` | `/api/clinical/reviews` | Yes | DERMATOLOGIST/ADMIN | `ClinicalReviewCreate` | `ClinicalReviewResponse` | Inserts `clinical_reviews` | Prescription Form | 🟢 PASS |
| `GET` | `/api/notifications` | Yes | Any Auth | None | `List[NotificationResponse]` | Reads `notifications` | Notification Center | 🟢 PASS |
| `PUT` | `/api/notifications/{id}/read` | Yes | Any Auth | Path ID | Status 200 | Updates `notifications` | Dismiss Item | 🟢 PASS |
| `POST` | `/api/notifications/read-all` | Yes | Any Auth | None | Status 200 | Updates `notifications` | Mark All As Read | 🟢 PASS |
| `DELETE` | `/api/notifications/{id}` | Yes | Any Auth | Path ID | Status 200 | Deletes `notifications` | Delete Item | 🟢 PASS |
| `GET` | `/api/reminders/settings` | Yes | USER | None | `List[ReminderSettingResponse]` | Reads `reminder_settings` | Settings Drawer | 🟢 PASS |
| `POST` | `/api/reminders/settings` | Yes | USER | `ReminderSettingsBatchUpdate` | `List[ReminderSettingResponse]` | Upserts `reminder_settings` | Reminder Preferences | 🟢 PASS |
| `POST` | `/api/reminders/trigger` | Yes | Any Auth | None | Trigger Summary | Generates `notifications` | Background Service | 🟢 PASS |
| `GET` | `/api/reports/summary` | Yes | USER | None | Report Summary JSON | Aggregates User Diagnostics | `ReportsPage.jsx` | 🟢 PASS |
| `GET` | `/api/reports/export` | Yes | USER | Format (`pdf`,`csv`,`xlsx`) | Binary Stream / File Blob | Generates On-The-Fly Report | Download Buttons | 🟢 PASS |
| `GET` | `/api/reports/admin/summary` | Yes | ADMIN | None | Admin Stats Summary | System-wide aggregates | `AdminDashboard.jsx` | 🟢 PASS |
