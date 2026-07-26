import React from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";

export default function Home() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleQuickLogin = (role) => {
    if (role === "user") {
      login("user", "akash@example.com", "Akash Prajapati");
      navigate("/user");
    } else if (role === "consultant") {
      login("consultant", "dr.smith@example.com", "Dr. Smith");
      navigate("/consultant");
    } else {
      login("admin", "admin@example.com", "System Admin");
      navigate("/admin");
    }
  };

  return (
    <div className="bg-light min-vh-100 d-flex flex-column">
      <Navbar />

      <div className="container py-5">
        <div className="text-center py-4 mb-4">
          <h1 className="fw-bold text-dark mb-3">
            AI_Skin-Intelligence-Personalized-Skincare-Planner
          </h1>
          <p className="lead text-secondary max-w-700 mx-auto">
            An intuitive web application for managing skincare routines, requesting consultations, and controlling user access with role-based dashboards.
          </p>
          <div className="d-flex justify-content-center gap-3 mt-4">
            <button className="btn btn-primary btn-lg" onClick={() => navigate("/login")}>
              Go to Login Page
            </button>
          </div>
        </div>

        <div className="row g-4 mb-5">
          <div className="col-md-4">
            <div className="card h-100 border-0 shadow-sm p-4 text-center">
              <h5 className="fw-bold text-primary mb-2">User Dashboard</h5>
              <p className="text-muted small">
                Track daily morning and evening skincare routines, view skin profile summary, and check product recommendations.
              </p>
              <button
                className="btn btn-outline-primary btn-sm mt-auto"
                onClick={() => handleQuickLogin("user")}
              >
                Explore User View
              </button>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card h-100 border-0 shadow-sm p-4 text-center">
              <h5 className="fw-bold text-success mb-2">Consultant Dashboard</h5>
              <p className="text-muted small">
                Dermatologist portal to view patient consultation requests, review skin concerns, and update status.
              </p>
              <button
                className="btn btn-outline-success btn-sm mt-auto"
                onClick={() => handleQuickLogin("consultant")}
              >
                Explore Consultant View
              </button>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card h-100 border-0 shadow-sm p-4 text-center">
              <h5 className="fw-bold text-dark mb-2">Admin Dashboard</h5>
              <p className="text-muted small">
                System administration panel to manage registered users, update roles, and monitor system metrics.
              </p>
              <button
                className="btn btn-outline-dark btn-sm mt-auto"
                onClick={() => handleQuickLogin("admin")}
              >
                Explore Admin View
              </button>
            </div>
          </div>
        </div>

        <div className="card border-0 shadow-sm p-4 bg-white">
          <h5 className="fw-bold text-dark mb-2">Key Application Features:</h5>
          <ul className="text-secondary small mb-0">
            <li>Landing page with quick platform overview and role navigation.</li>
            <li>Authentication portal supporting user, consultant, and admin login.</li>
            <li>Role-Based Access Control (RBAC) protecting user dashboards.</li>
            <li>Interactive JWT token inspector on authentication page.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}