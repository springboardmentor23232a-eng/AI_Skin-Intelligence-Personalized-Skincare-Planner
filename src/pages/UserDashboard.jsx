import React, { useState } from "react";
import Navbar from "../components/Navbar";
import JwtInspector from "../components/JwtInspector";
import { useAuth } from "../context/AuthContext";

export default function UserDashboard() {
  const { user } = useAuth();

  // Simple routine state for testing interactive checklist
  const [routines, setRoutines] = useState([
    { id: 1, type: "AM", name: "Gentle Facial Cleanser", completed: true },
    { id: 2, type: "AM", name: "Hydrating Niacinamide Serum", completed: true },
    { id: 3, type: "AM", name: "Lightweight Daily Moisturizer", completed: false },
    { id: 4, type: "AM", name: "Broad Spectrum Sunscreen SPF 50", completed: false },
    { id: 5, type: "PM", name: "Foaming Cleanser", completed: false },
    { id: 6, type: "PM", name: "Night Repair Cream", completed: false }
  ]);

  const toggleRoutine = (id) => {
    setRoutines((prev) =>
      prev.map((item) => (item.id === id ? { ...item, completed: !item.completed } : item))
    );
  };

  const completedCount = routines.filter((r) => r.completed).length;

  return (
    <div className="bg-light min-vh-100 d-flex flex-column">
      <Navbar />

      <div className="container py-4">
        <div className="d-flex justify-content-between align-items-center bg-white p-4 rounded-3 shadow-sm mb-4">
          <div>
            <h3 className="fw-bold mb-1">User Dashboard</h3>
            <p className="text-muted mb-0">Welcome back, <strong>{user?.name}</strong>!</p>
          </div>
          <span className="badge bg-primary fs-6">Role: User</span>
        </div>

        {/* Overview Cards */}
        <div className="row g-3 mb-4">
          <div className="col-md-4">
            <div className="card border-0 shadow-sm p-3 bg-white">
              <small className="text-muted fw-bold">Skin Profile</small>
              <h5 className="fw-bold text-dark mt-1">Combination Skin</h5>
              <small className="text-muted">Target: Hydration & Oil Balance</small>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card border-0 shadow-sm p-3 bg-white">
              <small className="text-muted fw-bold">Today's Routine Progress</small>
              <h5 className="fw-bold text-primary mt-1">
                {completedCount} / {routines.length} Completed
              </h5>
              <div className="progress mt-2" style={{ height: "6px" }}>
                <div
                  className="progress-bar bg-primary"
                  style={{ width: `${(completedCount / routines.length) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card border-0 shadow-sm p-3 bg-white">
              <small className="text-muted fw-bold">Next Consultation</small>
              <h5 className="fw-bold text-success mt-1">Scheduled for Friday</h5>
              <small className="text-muted">Dr. Smith • Dermatologist</small>
            </div>
          </div>
        </div>

        {/* Daily Routine Section */}
        <div className="row g-4 mb-4">
          <div className="col-md-7">
            <div className="card border-0 shadow-sm p-4 bg-white">
              <h5 className="fw-bold mb-3">Daily Skincare Checklist</h5>
              <div className="list-group">
                {routines.map((item) => (
                  <label
                    key={item.id}
                    className={`list-group-item d-flex align-items-center justify-content-between p-3 ${
                      item.completed ? "bg-light text-muted" : ""
                    }`}
                    style={{ cursor: "pointer" }}
                  >
                    <div className="d-flex align-items-center gap-3">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        checked={item.completed}
                        onChange={() => toggleRoutine(item.id)}
                      />
                      <span className={item.completed ? "text-decoration-line-through" : "fw-semibold"}>
                        {item.name}
                      </span>
                    </div>
                    <span className={`badge ${item.type === "AM" ? "bg-warning text-dark" : "bg-dark"}`}>
                      {item.type}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Recommended Products */}
          <div className="col-md-5">
            <div className="card border-0 shadow-sm p-4 bg-white">
              <h5 className="fw-bold mb-3">Recommended Products</h5>
              <ul className="list-group list-group-flush small">
                <li className="list-group-item px-0 py-2">
                  <strong>Gentle Hydrating Cleanser</strong>
                  <div className="text-muted">Sulfate-free, preserves skin moisture barrier</div>
                </li>
                <li className="list-group-item px-0 py-2">
                  <strong>10% Niacinamide Serum</strong>
                  <div className="text-muted">Helps minimize pores and even skin tone</div>
                </li>
                <li className="list-group-item px-0 py-2">
                  <strong>SPF 50 Sunscreen Fluid</strong>
                  <div className="text-muted">Lightweight daily UV protection</div>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Live Token Inspector */}
        <JwtInspector />
      </div>
    </div>
  );
}