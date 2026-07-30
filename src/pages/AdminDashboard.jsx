import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import JwtInspector from "../components/JwtInspector";
import { apiService } from "../services/api";
import { Shield, Users, Award, Sparkles, Heart, Trash2, Plus, Activity } from "lucide-react";

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [analytics, setAnalytics] = useState({
    totalUsers: 3,
    totalCoaches: 1,
    totalAssessments: 12,
    totalActiveGoals: 8,
    averagePlatformMoodScore: 8.8,
    totalActivitiesLogged: 45
  });

  const [tipTitle, setTipTitle] = useState("");
  const [tipContent, setTipContent] = useState("");
  const [tipCategory, setTipCategory] = useState("SKINCARE");
  const [tipTargetRole, setTipTargetRole] = useState("USER");
  const [tipSuccess, setTipSuccess] = useState("");

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      const [usersRes, analyticsRes] = await Promise.allSettled([
        apiService.getAllUsers(),
        apiService.getAnalytics()
      ]);

      if (usersRes.status === "fulfilled" && usersRes.value.data) {
        setUsers(usersRes.value.data);
      } else {
        setUsers([
          { id: 1, name: "System Admin", email: "admin@wellness.com", role: "ADMIN", provider: "LOCAL", createdAt: new Date().toISOString() },
          { id: 2, name: "Sarah Coach", email: "coach@wellness.com", role: "WELLNESS_COACH", provider: "LOCAL", createdAt: new Date().toISOString() },
          { id: 3, name: "John Doe", email: "john@gmail.com", role: "USER", provider: "LOCAL", createdAt: new Date().toISOString() }
        ]);
      }

      if (analyticsRes.status === "fulfilled" && analyticsRes.value.data) {
        setAnalytics(analyticsRes.value.data);
      }
    } catch (e) {
      console.warn("Fallback offline admin state");
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await apiService.updateUserRole(userId, newRole);
    } catch (e) {
      // offline fallback
    }
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u)));
  };

  const handleDeleteUser = async (userId) => {
    try {
      await apiService.deleteUser(userId);
    } catch (e) {
      // offline fallback
    }
    setUsers((prev) => prev.filter((u) => u.id !== userId));
  };

  const handleCreateTip = async (e) => {
    e.preventDefault();
    setTipSuccess("");
    const newTip = {
      title: tipTitle,
      content: tipContent,
      category: tipCategory,
      targetRole: tipTargetRole
    };

    try {
      await apiService.createHealthTip(newTip);
      setTipSuccess("Skincare tip published to platform!");
    } catch (err) {
      setTipSuccess("Skincare tip published (local demo)!");
    } finally {
      setTipTitle("");
      setTipContent("");
    }
  };

  return (
    <div className="dashboard-layout">
      <Navbar />

      <div className="dashboard-content">
        <Sidebar />

        <main className="main-viewport">
          <JwtInspector />

          <div className="section-header">
            <div>
              <h2><Shield className="icon-title text-primary" /> Admin Command Center</h2>
              <p>Platform user administration, role-based access control, analytics overview, &amp; skincare content management.</p>
            </div>
            <span className="role-badge role-admin"><Shield size={14} /> ADMIN Authorized</span>
          </div>

          {/* Platform Analytics Cards */}
          <div className="grid-layout grid-4-col">
            <div className="stat-card glass-card">
              <Users size={24} className="stat-icon text-primary" />
              <div>
                <h3>{analytics.totalUsers}</h3>
                <p>Registered Users</p>
              </div>
            </div>

            <div className="stat-card glass-card">
              <Award size={24} className="stat-icon text-warning" />
              <div>
                <h3>{analytics.totalCoaches}</h3>
                <p>Skin Coaches &amp; Doctors</p>
              </div>
            </div>

            <div className="stat-card glass-card">
              <Sparkles size={24} className="stat-icon text-success" />
              <div>
                <h3>{analytics.totalAssessments}</h3>
                <p>Skin Analyses</p>
              </div>
            </div>

            <div className="stat-card glass-card">
              <Heart size={24} className="stat-icon text-danger" />
              <div>
                <h3>{analytics.averagePlatformMoodScore} / 10</h3>
                <p>Skin Health Index</p>
              </div>
            </div>
          </div>

          <div className="grid-layout grid-3-col" style={{ marginTop: "1.5rem" }}>
            {/* User Management Table */}
            <div className="glass-card span-2">
              <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <h3>User Directory &amp; Role Access Control</h3>
                <Users size={18} />
              </div>

              <div className="table-responsive">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Provider</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.id}>
                        <td className="fw-bold">{u.name}</td>
                        <td>{u.email}</td>
                        <td>
                          <select
                            value={u.role}
                            onChange={(e) => handleRoleChange(u.id, e.target.value)}
                            className="select-role-sm"
                            style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem', borderRadius: '4px' }}
                          >
                            <option value="USER">USER</option>
                            <option value="SKINCARE_CONSULTANT">SKINCARE_CONSULTANT</option>
                            <option value="DERMATOLOGIST">DERMATOLOGIST</option>
                            <option value="WELLNESS_COACH">WELLNESS_COACH</option>
                            <option value="ADMIN">ADMIN</option>
                          </select>
                        </td>
                        <td><span className="jwt-status-chip">{u.provider || "LOCAL"}</span></td>
                        <td>
                          <button onClick={() => handleDeleteUser(u.id)} className="logout-btn" title="Delete User">
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Health Tip Publisher */}
            <div className="glass-card">
              <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <h3>Publish Skincare Tip</h3>
                <Sparkles size={18} style={{ color: 'var(--warning)' }} />
              </div>

              {tipSuccess && <div className="alert alert-success">{tipSuccess}</div>}

              <form onSubmit={handleCreateTip} className="form-container">
                <div className="form-group">
                  <label>Tip Title</label>
                  <input
                    type="text"
                    value={tipTitle}
                    onChange={(e) => setTipTitle(e.target.value)}
                    placeholder="e.g. Daily Mineral Sunscreen Protection"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Category</label>
                  <select value={tipCategory} onChange={(e) => setTipCategory(e.target.value)}>
                    <option value="SKINCARE">SKINCARE</option>
                    <option value="HYDRATION">HYDRATION</option>
                    <option value="PROTECTION">PROTECTION</option>
                    <option value="NUTRITION">NUTRITION</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Target Audience Role</label>
                  <select value={tipTargetRole} onChange={(e) => setTipTargetRole(e.target.value)}>
                    <option value="USER">USER</option>
                    <option value="SKINCARE_CONSULTANT">SKINCARE_CONSULTANT</option>
                    <option value="DERMATOLOGIST">DERMATOLOGIST</option>
                    <option value="WELLNESS_COACH">WELLNESS_COACH</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Content</label>
                  <textarea
                    rows="3"
                    value={tipContent}
                    onChange={(e) => setTipContent(e.target.value)}
                    placeholder="Describe actionable guidance..."
                    required
                  />
                </div>

                <button type="submit" className="btn btn-primary btn-block">
                  <Plus size={16} /> <span>Publish Tip</span>
                </button>
              </form>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;