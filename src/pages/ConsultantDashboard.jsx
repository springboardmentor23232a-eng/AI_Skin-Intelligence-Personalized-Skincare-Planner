import React, { useState } from "react";
import Navbar from "../components/Navbar";
import JwtInspector from "../components/JwtInspector";
import { useAuth } from "../context/AuthContext";

export default function ConsultantDashboard() {
  const { user } = useAuth();

  const [appointments, setAppointments] = useState([
    { id: 1, patient: "Akash Prajapati", skinConcern: "Dryness & Mild Redness", date: "Today, 2:00 PM", status: "Pending" },
    { id: 2, patient: "Rahul Sharma", skinConcern: "Acne Breakouts", date: "Today, 3:30 PM", status: "Pending" },
    { id: 3, patient: "Priya Patel", skinConcern: "Hyperpigmentation", date: "Tomorrow, 11:00 AM", status: "Approved" }
  ]);

  const toggleStatus = (id) => {
    setAppointments((prev) =>
      prev.map((app) => (app.id === id ? { ...app, status: app.status === "Pending" ? "Approved" : "Pending" } : app))
    );
  };

  return (
    <div className="bg-light min-vh-100 d-flex flex-column">
      <Navbar />

      <div className="container py-4">
        <div className="d-flex justify-content-between align-items-center bg-white p-4 rounded-3 shadow-sm mb-4">
          <div>
            <h3 className="fw-bold mb-1">Consultant Dashboard</h3>
            <p className="text-muted mb-0">Logged in as: <strong>{user?.name}</strong> (Dermatologist)</p>
          </div>
          <span className="badge bg-success fs-6">Role: Consultant</span>
        </div>

        {/* Stats Row */}
        <div className="row g-3 mb-4">
          <div className="col-md-4">
            <div className="card border-0 shadow-sm p-3 bg-white">
              <small className="text-muted fw-bold">Total Consultations</small>
              <h4 className="fw-bold text-dark mt-1">12 Appointments</h4>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card border-0 shadow-sm p-3 bg-white">
              <small className="text-muted fw-bold">Pending Approval</small>
              <h4 className="fw-bold text-warning mt-1">
                {appointments.filter((a) => a.status === "Pending").length} Cases
              </h4>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card border-0 shadow-sm p-3 bg-white">
              <small className="text-muted fw-bold">Approved Today</small>
              <h4 className="fw-bold text-success mt-1">
                {appointments.filter((a) => a.status === "Approved").length} Cases
              </h4>
            </div>
          </div>
        </div>

        {/* Appointments Table */}
        <div className="card border-0 shadow-sm p-4 bg-white mb-4">
          <h5 className="fw-bold mb-3">Patient Appointment Requests</h5>
          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead className="table-light">
                <tr>
                  <th>Patient Name</th>
                  <th>Skin Concern</th>
                  <th>Appointment Time</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((item) => (
                  <tr key={item.id}>
                    <td className="fw-semibold">{item.patient}</td>
                    <td>{item.skinConcern}</td>
                    <td className="text-muted small">{item.date}</td>
                    <td>
                      <span className={`badge ${item.status === "Approved" ? "bg-success" : "bg-warning text-dark"}`}>
                        {item.status}
                      </span>
                    </td>
                    <td>
                      <button
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => toggleStatus(item.id)}
                      >
                        Toggle Approval
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Live Token Inspector */}
        <JwtInspector />
      </div>
    </div>
  );
}