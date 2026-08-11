import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getDashboardForRole } from "../utils/roleUtils";
import Navbar from "../components/Navbar";
import GoogleOAuthButton from "../components/GoogleOAuthButton";
import { User, Mail, Lock, UserPlus, Shield, Award, Sparkles, CheckCircle2, XCircle, Phone, Stethoscope } from "lucide-react";

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("USER");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Password Strength Validators
  const hasMinLen = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[\W_]/.test(password);
  const isPasswordValid = hasMinLen && hasUpper && hasLower && hasNumber && hasSpecial;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!isPasswordValid) {
      setError("Please ensure your password satisfies all password strength requirements below.");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await register(name, email, password, role);
      if (res && res.success) {
        const userRole = (role || res.user?.role || "USER").toUpperCase();
        navigate(getDashboardForRole(userRole));
      } else {
        setError(res.message || "Registration failed. Please check inputs.");
      }
    } catch (err) {
      setError(err.message || "Registration failed. Please check inputs.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSuccess = (user) => {
    const userRole = (user?.role || role || "USER").toUpperCase();
    navigate(getDashboardForRole(userRole));
  };

  return (
    <div className="page-wrapper">
      <Navbar />

      <div className="auth-container">
        <div className="auth-card" style={{ maxWidth: '560px', margin: '0 auto' }}>
          <div className="auth-header">
            <div className="auth-logo-badge">
              <Sparkles size={28} />
            </div>
            <h2>Create Your Account</h2>
            <p>AI Skin Intelligence &amp; Personalized Skincare Planner</p>
          </div>

          {error && <div className="alert alert-danger">{error}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="name">Full Name *</label>
              <div className="input-with-icon">
                <User className="input-icon" size={18} />
                <input
                  type="text"
                  id="name"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="email">Email Address *</label>
              <div className="input-with-icon">
                <Mail className="input-icon" size={18} />
                <input
                  type="email"
                  id="email"
                  placeholder="john@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="phone">Phone Number</label>
              <div className="input-with-icon">
                <Phone className="input-icon" size={18} />
                <input
                  type="tel"
                  id="phone"
                  placeholder="+1 (555) 019-2831"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password">Password (BCrypt Hashed) *</label>
              <div className="input-with-icon">
                <Lock className="input-icon" size={18} />
                <input
                  type="password"
                  id="password"
                  placeholder="Password@123"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              {/* Password Strength Validator Indicator */}
              <div style={{
                background: 'var(--input-bg)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                padding: '0.75rem',
                marginTop: '0.5rem',
                fontSize: '0.8rem'
              }}>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>Password Strength Requirements:</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.25rem' }}>
                  <span style={{ color: hasMinLen ? 'var(--success)' : 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {hasMinLen ? <CheckCircle2 size={13} /> : <XCircle size={13} />} Min 8 Characters
                  </span>
                  <span style={{ color: hasUpper ? 'var(--success)' : 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {hasUpper ? <CheckCircle2 size={13} /> : <XCircle size={13} />} Uppercase Letter (A-Z)
                  </span>
                  <span style={{ color: hasLower ? 'var(--success)' : 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {hasLower ? <CheckCircle2 size={13} /> : <XCircle size={13} />} Lowercase Letter (a-z)
                  </span>
                  <span style={{ color: hasNumber ? 'var(--success)' : 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {hasNumber ? <CheckCircle2 size={13} /> : <XCircle size={13} />} Number (0-9)
                  </span>
                  <span style={{ color: hasSpecial ? 'var(--success)' : 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {hasSpecial ? <CheckCircle2 size={13} /> : <XCircle size={13} />} Special Char (!@#$)
                  </span>
                </div>
              </div>
            </div>

            <div className="form-group">
              <label>Select Role (Role-Based Access Control)</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '0.5rem', marginTop: '0.5rem' }}>
                <label style={{
                  padding: '0.6rem 0.4rem',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  textAlign: 'center',
                  background: role === 'USER' ? 'var(--primary-light)' : 'var(--input-bg)',
                  borderColor: role === 'USER' ? 'var(--primary)' : 'var(--border-color)',
                  cursor: 'pointer',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.2rem'
                }}>
                  <input type="radio" name="role" value="USER" checked={role === "USER"} onChange={(e) => setRole(e.target.value)} style={{ display: 'none' }} />
                  <User size={18} />
                  <span>User</span>
                </label>

                <label style={{
                  padding: '0.6rem 0.4rem',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  textAlign: 'center',
                  background: role === 'SKINCARE_CONSULTANT' ? 'var(--primary-light)' : 'var(--input-bg)',
                  borderColor: role === 'SKINCARE_CONSULTANT' ? 'var(--primary)' : 'var(--border-color)',
                  cursor: 'pointer',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.2rem'
                }}>
                  <input type="radio" name="role" value="SKINCARE_CONSULTANT" checked={role === "SKINCARE_CONSULTANT"} onChange={(e) => setRole(e.target.value)} style={{ display: 'none' }} />
                  <Sparkles size={18} />
                  <span>Consultant</span>
                </label>

                <label style={{
                  padding: '0.6rem 0.4rem',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  textAlign: 'center',
                  background: role === 'DERMATOLOGIST' ? 'var(--primary-light)' : 'var(--input-bg)',
                  borderColor: role === 'DERMATOLOGIST' ? 'var(--primary)' : 'var(--border-color)',
                  cursor: 'pointer',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.2rem'
                }}>
                  <input type="radio" name="role" value="DERMATOLOGIST" checked={role === "DERMATOLOGIST"} onChange={(e) => setRole(e.target.value)} style={{ display: 'none' }} />
                  <Stethoscope size={18} />
                  <span>Dermatologist</span>
                </label>

                <label style={{
                  padding: '0.6rem 0.4rem',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  textAlign: 'center',
                  background: role === 'WELLNESS_COACH' ? 'var(--primary-light)' : 'var(--input-bg)',
                  borderColor: role === 'WELLNESS_COACH' ? 'var(--primary)' : 'var(--border-color)',
                  cursor: 'pointer',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.2rem'
                }}>
                  <input type="radio" name="role" value="WELLNESS_COACH" checked={role === "WELLNESS_COACH"} onChange={(e) => setRole(e.target.value)} style={{ display: 'none' }} />
                  <Award size={18} />
                  <span>Coach</span>
                </label>

                <label style={{
                  padding: '0.6rem 0.4rem',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  textAlign: 'center',
                  background: role === 'ADMIN' ? 'var(--primary-light)' : 'var(--input-bg)',
                  borderColor: role === 'ADMIN' ? 'var(--primary)' : 'var(--border-color)',
                  cursor: 'pointer',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.2rem'
                }}>
                  <input type="radio" name="role" value="ADMIN" checked={role === "ADMIN"} onChange={(e) => setRole(e.target.value)} style={{ display: 'none' }} />
                  <Shield size={18} />
                  <span>Admin</span>
                </label>
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-block" disabled={isSubmitting}>
              <UserPlus size={18} />
              <span>{isSubmitting ? "Creating PostgreSQL User..." : "Register Account"}</span>
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

          <div className="auth-footer">
            <p>
              Already have an account? <Link to="/login">Sign In</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
