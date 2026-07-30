import React from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import { Sparkles, LayoutDashboard, Stethoscope, Shield, ArrowRight } from "lucide-react";

export default function Home() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleQuickLogin = async (role) => {
    if (role === "user") {
      await login("john@gmail.com", "Password@123");
      navigate("/user");
    } else if (role === "consultant") {
      await login("coach@wellness.com", "Password@123");
      navigate("/consultant");
    } else {
      await login("admin@wellness.com", "Password@123");
      navigate("/admin");
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
            Next-generation AI Optical Skin Analysis, Image &amp; Camera Scan, Disease Detection, Hydration Tracking, and Certified Dermatologist Product Recommendations.
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

        <div className="grid-layout grid-3-col" style={{ marginBottom: '2rem' }}>
          <div className="glass-card text-center">
            <LayoutDashboard size={32} style={{ color: 'var(--primary)', marginBottom: '0.75rem' }} />
            <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>User Skincare Hub</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
              Track daily skincare routines, skin type summary, hydration targets, and AI product recommendations.
            </p>
            <button
              className="btn btn-outline btn-block"
              onClick={() => handleQuickLogin("user")}
            >
              Explore User View
            </button>
          </div>

          <div className="glass-card text-center">
            <Stethoscope size={32} style={{ color: 'var(--secondary)', marginBottom: '0.75rem' }} />
            <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>Clinical Specialist Portal</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
              Dermatologist &amp; Coach portal to review patient consultation requests, review skin concerns, and issue advice.
            </p>
            <button
              className="btn btn-outline btn-block"
              onClick={() => handleQuickLogin("consultant")}
            >
              Explore Specialist View
            </button>
          </div>

          <div className="glass-card text-center">
            <Shield size={32} style={{ color: 'var(--accent)', marginBottom: '0.75rem' }} />
            <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>Admin Command Center</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
              System administration panel to manage registered users, update roles, and monitor system metrics.
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