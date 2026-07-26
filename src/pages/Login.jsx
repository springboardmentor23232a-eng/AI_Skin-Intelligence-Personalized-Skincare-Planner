import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import JwtInspector from "../components/JwtInspector";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");

  const handleSubmit = (e) => {
    e.preventDefault();
    login(role, email || "user@example.com", email ? email.split("@")[0] : "Akash Prajapati");

    if (role === "user") navigate("/user");
    else if (role === "consultant") navigate("/consultant");
    else if (role === "admin") navigate("/admin");
  };

  const handleQuickSelect = (selectedRole) => {
    setRole(selectedRole);
    if (selectedRole === "user") {
      login("user", "akash@example.com", "Akash Prajapati");
      navigate("/user");
    } else if (selectedRole === "consultant") {
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
        <div className="row justify-content-center">
          <div className="col-md-6">
            <div className="card shadow-sm border-0 rounded-3 mb-4">
              <div className="card-body p-4">
                <div className="text-center mb-3">
                  <span className="badge bg-warning text-dark mb-2">Demo Only • No Backend Required</span>
                  <h3 className="fw-bold mb-1">Dummy Authentication Portal</h3>
                  <p className="text-muted small mb-0">
                    Demonstrates role selection and client-side JWT token generation.
                  </p>
                </div>

                <div className="mb-4">
                  <label className="form-label small text-muted font-semibold">1-Click Quick Demo Login:</label>
                  <div className="d-flex gap-2">
                    <button className="btn btn-outline-primary btn-sm flex-grow-1" onClick={() => handleQuickSelect("user")}>
                      User Demo
                    </button>
                    <button className="btn btn-outline-success btn-sm flex-grow-1" onClick={() => handleQuickSelect("consultant")}>
                      Consultant Demo
                    </button>
                    <button className="btn btn-outline-dark btn-sm flex-grow-1" onClick={() => handleQuickSelect("admin")}>
                      Admin Demo
                    </button>
                  </div>
                </div>

                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label className="form-label small font-semibold">Email Address</label>
                    <input
                      type="email"
                      className="form-control"
                      placeholder="e.g. akash@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label small font-semibold">Password</label>
                    <input
                      type="password"
                      className="form-control"
                      placeholder="Enter password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>

                  <div className="mb-4">
                    <label className="form-label small font-semibold">Select Dashboard Role</label>
                    <select
                      className="form-select"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                    >
                      <option value="user">User (Patient)</option>
                      <option value="consultant">Consultant (Dermatologist)</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>

                  <button type="submit" className="btn btn-primary w-100 fw-bold mb-3">
                    Login & Generate Token
                  </button>
                </form>

                <div className="alert alert-light border text-muted small mb-0 p-3">
                  <strong>Demo Authentication:</strong> This project uses a dummy authentication flow for demonstration purposes. OAuth 2.0 and JWT concepts were studied as part of the internship research task but are not implemented because backend integration is outside the scope of this assignment.
                </div>
              </div>
            </div>

            {/* Embedded Live Token Inspector */}
            <JwtInspector />
          </div>
        </div>
      </div>
    </div>
  );
}