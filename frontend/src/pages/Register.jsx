import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000';

export default function Register() {
  const { register, homePathFor } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'USER' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await register(form);
      navigate(homePathFor(user.role));
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = () => {
    window.location.href = `${SERVER_URL}/api/auth/google`;
  };

  return (
    <div className="auth-shell">
      <div className="auth-visual">
        <div className="auth-visual-brand">
          <span className="auth-visual-mark">AI</span>
          <span>AI Skincare Planner</span>
        </div>
        <span className="auth-eyebrow">AI · Skin Intelligence</span>
        <h1>Create your skincare profile in minutes.</h1>
        <p className="auth-visual-sub">Join as a user for personalized analysis, or as a doctor / consultant to help others on their skincare journey.</p>

        <div className="auth-feature-grid">
          <div className="auth-feature-card">
            <span className="auth-feature-icon">📝</span>
            <div className="auth-feature-title">Create Your Skin Profile</div>
            <div className="auth-feature-desc">Tell us about your skin type, concerns and sensitivities.</div>
          </div>
          <div className="auth-feature-card">
            <span className="auth-feature-icon">📷</span>
            <div className="auth-feature-title">Assess Your Skin</div>
            <div className="auth-feature-desc">Upload an image or capture a webcam photo.</div>
          </div>
          <div className="auth-feature-card">
            <span className="auth-feature-icon">🧴</span>
            <div className="auth-feature-title">Personalized Care</div>
            <div className="auth-feature-desc">Receive routines based on your assessment and lifestyle.</div>
          </div>
          <div className="auth-feature-card">
            <span className="auth-feature-icon">📈</span>
            <div className="auth-feature-title">Track Your Journey</div>
            <div className="auth-feature-desc">Monitor your skin health and progress over time.</div>
          </div>
        </div>

        <div>
          <div className="auth-journey-label">Your Skincare Journey</div>
          <div className="auth-journey">
            <span className="auth-journey-step"><span className="auth-journey-num">1</span>Profile</span>
            <span className="auth-journey-arrow">→</span>
            <span className="auth-journey-step"><span className="auth-journey-num">2</span>Assess</span>
            <span className="auth-journey-arrow">→</span>
            <span className="auth-journey-step"><span className="auth-journey-num">3</span>Personalize</span>
          </div>
        </div>
      </div>
      <div className="auth-form-side">
        <div className="auth-box">
          <h2>Create your account</h2>
          <p className="sub">Start your personalized skincare journey.</p>

          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="field">
              <label>Full name</label>
              <input name="name" required value={form.name} onChange={handleChange} placeholder="Jane Doe" />
            </div>
            <div className="field">
              <label>Email</label>
              <input type="email" name="email" required value={form.email} onChange={handleChange} placeholder="you@example.com" />
            </div>
            <div className="field">
              <label>Password</label>
              <input type="password" name="password" required minLength={6} value={form.password} onChange={handleChange} placeholder="At least 6 characters" />
            </div>
            <div className="field">
              <label>I am registering as</label>
              <select name="role" value={form.role} onChange={handleChange}>
                <option value="USER">A User (skincare analysis)</option>
                <option value="DOCTOR">A Doctor</option>
                <option value="CONSULTANT">A Skincare Consultant</option>
              </select>
            </div>
            <button className="btn btn-primary btn-block" disabled={loading}>
              {loading ? <span className="spinner" /> : 'Create Account'}
            </button>
          </form>

          <div className="auth-divider">OR</div>

          <button className="btn-google" onClick={handleGoogle} type="button">
            Continue with Google
          </button>

          <p className="auth-switch">
            Already have an account? <Link to="/login">Log in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
