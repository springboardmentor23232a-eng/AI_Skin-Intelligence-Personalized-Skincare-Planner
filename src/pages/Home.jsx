import React from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import { getDashboardForRole } from "../utils/roleUtils";
import { Sparkles, Stethoscope, Shield, User, ArrowRight } from "lucide-react";

export default function Home() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleQuickLogin = async (roleKey) => {
    let email = "john@gmail.com";
    let pass = "Password@123";
    if (roleKey === "consultant") {
      email = "consultant@skincare.com";
    } else if (roleKey === "doctor") {
      email = "dermatologist@skincare.com";
    } else if (roleKey === "admin") {
      email = "akp73733@gmail.com";
      pass = "#Prem@123";
    }

    const res = await login(email, pass);
    if (res && res.success) {
      navigate(getDashboardForRole(res.user?.role));
    }
  };

  return (
    <div className="dashboard-layout">
      <Navbar />

      <div className="main-viewport" style={{ maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
        <div className="glass-card text-center" style={{ padding: '3.5rem 2rem', marginBottom: '2rem' }}>
          <div className="auth-logo-badge" style={{ margin: '0 auto 1rem', padding: '1rem' }}>
            <Sparkles size={36} />
          </div>
          <h1 style={{ fontSize: '2.4rem', fontWeight: 800, marginBottom: '1rem', color: 'var(--text-primary)' }}>
            AI Skin Intelligence &amp; Personalized Skincare Planner
          </h1>
          <p style={{ maxWidth: '720px', margin: '0 auto 1.5rem', color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
            Next-generation AI Optical Skin Analysis, Image &amp; Camera Scan, Disease Detection, Hydration Tracking, and Role-Based Portals for Users, Consultants, Dermatologists &amp; Admins.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '1.5rem' }}>
            <button className="btn btn-primary" onClick={() => navigate("/login")}>
              <span>Get Started</span> <ArrowRight size={18} />
            </button>
            <button className="btn btn-outline" onClick={() => navigate("/register")}>
              <span>Register Account</span>
            </button>
          </div>
        </div>

        {/* Role Portal Exploration Grid */}
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '1rem', textAlign: 'center' }}>
          Explore Unique Role-Based Dashboards
        </h2>

        <div className="grid-layout grid-3-col" style={{ marginBottom: '2rem' }}>
          {/* 1. User Dashboard */}
          <div className="glass-card text-center">
            <User size={32} style={{ color: 'var(--primary)', marginBottom: '0.75rem', margin: '0 auto' }} />
            <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>User Dashboard</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
              Track daily skincare routines, skin health score (82/100), hydration targets, camera photo scans, and AI product recommendations.
            </p>
            <button
              className="btn btn-outline btn-block"
              onClick={() => handleQuickLogin("user")}
            >
              Explore User View
            </button>
          </div>

          {/* 2. Skincare Consultant Portal */}
          <div className="glass-card text-center">
            <Sparkles size={32} style={{ color: 'var(--secondary)', marginBottom: '0.75rem', margin: '0 auto' }} />
            <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>Skincare Consultant</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
              Evaluate assigned user skin profiles, review AI assessment results, track history, and add targeted routine recommendations.
            </p>
            <button
              className="btn btn-outline btn-block"
              onClick={() => handleQuickLogin("consultant")}
            >
              Explore Consultant View
            </button>
          </div>

          {/* 3. Dermatologist Clinical Center */}
          <div className="glass-card text-center">
            <Stethoscope size={32} style={{ color: 'var(--accent)', marginBottom: '0.75rem', margin: '0 auto' }} />
            <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>Dermatologist Clinical</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
              Review patient optical scans, formulate medical diagnoses, issue digital prescriptions, and schedule follow-ups.
            </p>
            <button
              className="btn btn-outline btn-block"
              onClick={() => handleQuickLogin("doctor")}
            >
              Explore Doctor View
            </button>
          </div>

          {/* 4. Admin Command Center */}
          <div className="glass-card text-center">
            <Shield size={32} style={{ color: 'var(--danger)', marginBottom: '0.75rem', margin: '0 auto' }} />
            <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>Admin Command Center</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
              Full system control: user &amp; role management, AI model weight calibration, database backups, audit logs &amp; security settings.
            </p>
            <button
              className="btn btn-outline btn-block"
              onClick={() => handleQuickLogin("admin")}
            >
              Explore Admin View
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}