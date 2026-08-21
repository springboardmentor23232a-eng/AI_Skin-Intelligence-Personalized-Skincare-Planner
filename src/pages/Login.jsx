import React, { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getDashboardForRole } from "../utils/roleUtils";
import Navbar from "../components/Navbar";
import GoogleOAuthButton from "../components/GoogleOAuthButton";
import { Sparkles, Mail, Lock, LogIn, Shield, User, Key, X, Stethoscope } from "lucide-react";

const Login = () => {
  const { login, loginWithToken } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState(() => {
    const params = new URLSearchParams(location.search);
    return params.get("expired") === "true" ? "Your session has expired (24h JWT limit). Please sign in again." : "";
  });
  const [successMsg, setSuccessMsg] = useState(() => {
    const params = new URLSearchParams(location.search);
    return params.get("oauth_token") ? "Google OAuth authentication successful!" : "";
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Forgot Password Modal state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotMsg, setForgotMsg] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(location.search);

    // Handle Google OAuth URL Callback token if redirected from backend Passport flow
    const oauthToken = params.get("oauth_token");
    if (oauthToken) {
      try {
        const base64Url = oauthToken.split('.')[1];
        if (base64Url) {
          const jsonPayload = decodeURIComponent(
            atob(base64Url.replace(/-/g, '+').replace(/_/g, '/'))
              .split('')
              .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
              .join('')
          );
          const userData = JSON.parse(jsonPayload);
          loginWithToken(oauthToken, userData);
          setTimeout(() => {
            const role = (userData.role || "USER").toUpperCase();
            navigate(getDashboardForRole(role));
          }, 800);
        }
      } catch (_err) {
        // error handled via initializer or state
      }
    }
  }, [location, loginWithToken, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    setIsSubmitting(true);

    // Save credentials to localStorage if Remember Me is checked
    if (rememberMe) {
      localStorage.setItem("remembered_email", email);
      localStorage.setItem("remembered_password", password);
    } else {
      localStorage.removeItem("remembered_email");
      localStorage.removeItem("remembered_password");
    }

    try {
      const res = await login(email, password);
      if (res && res.success) {
        const userRole = res.user?.role || "USER";
        navigate(getDashboardForRole(userRole));
      } else {
        setError(res.message || "Failed to authenticate. Please check your credentials.");
      }
    } catch (err) {
      setError(err.message || "Failed to authenticate. Please check your credentials.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFillRoleCredentials = (_roleTitle, demoEmail, demoPass = "Password@123") => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError("");
    setSuccessMsg("");
  };

  const handleGoogleSuccess = (user) => {
    const role = user?.role || "USER";
    navigate(getDashboardForRole(role));
  };

  const handleForgotPasswordSubmit = (e) => {
    e.preventDefault();
    setForgotMsg(`Password reset instructions sent to ${forgotEmail}`);
    setTimeout(() => {
      setShowForgotModal(false);
      setForgotMsg("");
      setForgotEmail("");
    }, 2500);
  };

  return (
    <div className="page-wrapper">
      <Navbar />

      <div className="auth-container">
        <div className="auth-card" style={{ maxWidth: '500px', margin: '0 auto' }}>
          <div className="auth-header">
            <div className="auth-logo-badge">
              <Sparkles size={28} />
            </div>
            <h2>Welcome Back</h2>
            <p>Sign in to AI Skin Intelligence &amp; Skincare Planner</p>
          </div>

          {error && <div className="alert alert-danger">{error}</div>}
          {successMsg && <div className="alert alert-success">{successMsg}</div>}

          {/* Preset Role Credentials Filler */}
          <div style={{
            marginBottom: '1.25rem',
            padding: '0.85rem 1rem',
            background: 'var(--input-bg)',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-color)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center'
          }}>
            <small style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontWeight: 600 }}>
              Select Role:
            </small>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', justifyContent: 'center', width: '100%' }}>
              <button
                type="button"
                onClick={() => handleFillRoleCredentials("User", "john@gmail.com", "Password@123")}
                className="btn btn-outline"
                style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
              >
                <User size={13} /> User
              </button>
              <button
                type="button"
                onClick={() => handleFillRoleCredentials("Consultant", "consultant@skincare.com", "Password@123")}
                className="btn btn-outline"
                style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
              >
                <Sparkles size={13} /> Consultant
              </button>
              <button
                type="button"
                onClick={() => handleFillRoleCredentials("Dermatologist", "dermatologist@skincare.com", "Password@123")}
                className="btn btn-outline"
                style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
              >
                <Stethoscope size={13} /> Dermatologist
              </button>
              <button
                type="button"
                onClick={() => handleFillRoleCredentials("Admin", "akp73733@gmail.com", "#Prem@123")}
                className="btn btn-outline"
                style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
              >
                <Shield size={13} /> Admin
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <div className="input-with-icon">
                <Mail className="input-icon" size={18} />
                <input
                  type="email"
                  id="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="username"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                <label htmlFor="password" style={{ margin: 0 }}>Password</label>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '0.85rem', cursor: 'pointer', textDecoration: 'underline' }}
                >
                  Forgot Password?
                </button>
              </div>
              <div className="input-with-icon">
                <Lock className="input-icon" size={18} />
                <input
                  type="password"
                  id="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />
              </div>
            </div>

            {/* Remember Me & Save Credentials Checkbox */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem', fontSize: '0.85rem' }}>
              <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                />
                <span>Remember &amp; auto-save credentials on this device</span>
              </label>
            </div>

            <button type="submit" className="btn btn-primary btn-block" disabled={isSubmitting}>
              <LogIn size={18} />
              <span>{isSubmitting ? "Authenticating JWT..." : "Sign In with JWT"}</span>
            </button>
          </form>

          <div className="auth-divider">
            <span>OR</span>
          </div>

          <GoogleOAuthButton
            text="Continue with Google OAuth2"
            onSuccess={handleGoogleSuccess}
            onError={(msg) => setError(msg)}
          />

          <div className="auth-footer" style={{ marginTop: '1.25rem', textAlign: 'center', fontSize: '0.85rem' }}>
            <p>
              Don't have an account? <Link to="/register">Register here</Link>
            </p>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.7)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div className="glass-card" style={{ maxWidth: '420px', width: '90%', padding: '2rem', position: 'relative' }}>
            <button
              onClick={() => setShowForgotModal(false)}
              style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
            >
              <X size={20} />
            </button>
            <div className="text-center mb-3" style={{ textAlign: 'center', marginBottom: '1rem' }}>
              <Key size={36} style={{ color: 'var(--primary)', marginBottom: '0.5rem' }} />
              <h3>Reset Password</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Enter your email to receive a secure recovery link.</p>
            </div>

            {forgotMsg && <div className="alert alert-success">{forgotMsg}</div>}

            <form onSubmit={handleForgotPasswordSubmit}>
              <div className="form-group">
                <label>Registered Email</label>
                <div className="input-with-icon">
                  <Mail className="input-icon" size={18} />
                  <input
                    type="email"
                    placeholder="akp73733@gmail.com"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
              <button type="submit" className="btn btn-primary btn-block">
                Send Reset Instructions
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;