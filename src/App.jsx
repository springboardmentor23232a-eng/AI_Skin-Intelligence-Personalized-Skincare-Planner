import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import ProtectedRoute from "./components/ProtectedRoute";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import UserDashboard from "./pages/UserDashboard";
import ConsultantDashboard from "./pages/ConsultantDashboard";
import DermatologistDashboard from "./pages/DermatologistDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import SkinProfileWizard from "./pages/SkinProfileWizard";
import SkinAssessment from "./pages/SkinAssessment";
import SkinRoutinePage from "./pages/SkinRoutinePage";
import SkinAnalyticsPage from "./pages/SkinAnalyticsPage";
import IngredientIntelligencePage from "./pages/IngredientIntelligencePage";
import ProductCatalogPage from "./pages/ProductCatalogPage";
import ProductRecommendationsPage from "./pages/ProductRecommendationsPage";
import ReportsPage from "./pages/ReportsPage";

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route
            path="/user"
            element={
              <ProtectedRoute allowedRoles={["USER"]}>
                <UserDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <ProtectedRoute allowedRoles={["USER"]}>
                <SkinProfileWizard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/assessment"
            element={
              <ProtectedRoute allowedRoles={["USER"]}>
                <SkinAssessment />
              </ProtectedRoute>
            }
          />

          <Route
            path="/routines"
            element={
              <ProtectedRoute allowedRoles={["USER"]}>
                <SkinRoutinePage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/analytics"
            element={
              <ProtectedRoute allowedRoles={["USER"]}>
                <SkinAnalyticsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/reports"
            element={
              <ProtectedRoute allowedRoles={["USER", "SKINCARE_CONSULTANT", "DERMATOLOGIST", "ADMIN"]}>
                <ReportsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/ingredients"
            element={
              <ProtectedRoute allowedRoles={["USER"]}>
                <IngredientIntelligencePage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/products"
            element={
              <ProtectedRoute allowedRoles={["USER", "SKINCARE_CONSULTANT", "DERMATOLOGIST", "ADMIN"]}>
                <ProductCatalogPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/recommendations"
            element={
              <ProtectedRoute allowedRoles={["USER", "SKINCARE_CONSULTANT", "DERMATOLOGIST", "ADMIN"]}>
                <ProductRecommendationsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/consultant"
            element={
              <ProtectedRoute allowedRoles={["SKINCARE_CONSULTANT", "DERMATOLOGIST", "ADMIN"]}>
                <ConsultantDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/dermatologist"
            element={
              <ProtectedRoute allowedRoles={["DERMATOLOGIST", "ADMIN"]}>
                <DermatologistDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;