import React, { useState } from "react";
import Navbar from "../components/Navbar";
import JwtInspector from "../components/JwtInspector";
import { useAuth } from "../context/AuthContext";

export default function AdminDashboard() {
  const { user } = useAuth();

  const [users, setUsers] = useState([
    { id: 1, name: "Akash Prajapati", email: "akash@example.com", role: "user" },
    { id: 2, name: "Dr. Smith", email: "dr.smith@example.com", role: "consultant" },
    { id: 3, name: "Admin User", email: "admin@example.com", role: "admin" },
    { id: 4, name: "Priya Sharma", email: "priya@example.com", role: "user" }
  ]);

  const cycleRole = (id) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === id) {
          const nextRole = u.role === "user" ? "consultant" : u.role === "consultant" ? "admin" : "user";
          return { ...u, role: nextRole };
        }
        return u;
      })
    );
  };

  return (
    <div className="bg-light min-vh-100 d-flex flex-column">
      <Navbar />

      <div className="container py-4">
        <div className="d-flex justify-content-between align-items-center bg-white p-4 rounded-3 shadow-sm mb-4">
          <div>
            <h3 className="fw-bold mb-1">Admin Dashboard</h3>
            <p className="text-muted mb-0">Logged in as: <strong>{user?.name}</strong> (Administrator)</p>
          </div>
          <span className="badge bg-dark fs-6">Role: Admin</span>
        </div>

        {/* System Stats */}
        <div className="row g-3 mb-4">
          <div className="col-md-4">
            <div className="card border-0 shadow-sm p-3 bg-white">
              <small className="text-muted fw-bold">Total Registered Users</small>
              <h4 className="fw-bold text-primary mt-1">{users.length} Users</h4>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card border-0 shadow-sm p-3 bg-white">
              <small className="text-muted fw-bold">Active Consultants</small>
              <h4 className="fw-bold text-success mt-1">
                {users.filter((u) => u.role === "consultant").length} Consultants
              </h4>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card border-0 shadow-sm p-3 bg-white">
              <small className="text-muted fw-bold">System Status</small>
              <h4 className="fw-bold text-info mt-1">Operational (Mock)</h4>
            </div>
          </div>
        </div>

        {/* User Management Table */}
        <div className="card border-0 shadow-sm p-4 bg-white mb-4">
          <h5 className="fw-bold mb-3">User & Role Access Control (RBAC)</h5>
          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead className="table-light">
                <tr>
                  <th>User ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Current Role</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td className="text-muted small">USR-{u.id}</td>
                    <td className="fw-semibold">{u.name}</td>
                    <td className="text-muted small">{u.email}</td>
                    <td>
                      <span
                        className={`badge ${
                          u.role === "admin" ? "bg-dark" : u.role === "consultant" ? "bg-success" : "bg-primary"
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td>
                      <button
                        className="btn btn-sm btn-outline-secondary"
                        onClick={() => cycleRole(u.id)}
                      >
                        Change Role
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