import React, { useState, useEffect } from 'react';
import { Sparkles, Lock, Mail, ArrowRight, ShieldCheck, Settings, CheckCircle2, User, X, Eye, EyeOff } from 'lucide-react';
import confetti from 'canvas-confetti';
import { GoogleLogin } from '@react-oauth/google';

const API_BASE = 'http://127.0.0.1:8000';

export default function LoginPage({ onLoginSuccess, onSwitchToRegister }) {
  const [role, setRole] = useState('User');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const handleGoogleSuccess = async (credentialResponse) => {
    setIsLoading(true);
    setErrorMsg(null);

    try {
      // Call FastAPI Backend Google Auth API with REAL token
      const res = await fetch(`${API_BASE}/api/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          credential: credentialResponse.credential,
          role: role
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Google Account Authentication failed');

      // Save signed JWT token and user info
      localStorage.setItem('derm_ai_jwt_token', data.access_token);
      localStorage.setItem('derm_ai_user', JSON.stringify(data.user));

      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      onLoginSuccess(data.user.role, data.access_token);

    } catch (err) {
      setIsLoading(false);
      setErrorMsg(err.message);
    }
  };

  const handleEmailPasswordLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Invalid email or password');

      localStorage.setItem('derm_ai_jwt_token', data.access_token);
      localStorage.setItem('derm_ai_user', JSON.stringify(data.user));

      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      onLoginSuccess(data.user.role, data.access_token);

    } catch (err) {
      setIsLoading(false);
      setErrorMsg(err.message);
    }
  };

  return (
    <div style={{ maxWidth: '480px', margin: '40px auto', padding: '0 20px' }}>
      <div className="glass-card" style={{ padding: '36px' }}>
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--gradient-brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', margin: '0 auto 12px' }}>
            <Lock size={22} />
          </div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 700 }}>Sign In to DermAI</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginTop: '4px' }}>
            Securely sign in to access your profile
          </p>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '10px', borderRadius: '6px', fontSize: '0.82rem', marginBottom: '16px' }}>
            ⚠️ {errorMsg}
          </div>
        )}

        {/* Role Selector */}
        <div style={{ marginBottom: '14px' }}>
          <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Account Role Context</label>
          <select 
            value={role} 
            onChange={(e) => setRole(e.target.value)}
            style={{ width: '100%', padding: '10px', background: '#f8fafc', border: '1px solid var(--border-glass)', borderRadius: '6px', color: '#0f172a', fontSize: '0.88rem' }}
          >
            <option value="User">User</option>
            <option value="Skincare Consultant">Skincare Consultant</option>
            <option value="Dermatologist">Dermatologist</option>
            <option value="Administrator">Administrator</option>
          </select>
        </div>

        {/* Email & Password Form */}
        <form onSubmit={handleEmailPasswordLogin} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Email Address</label>
            <input 
              type="email" required
              value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              style={{ width: '100%', padding: '10px', background: '#f8fafc', border: '1px solid var(--border-glass)', borderRadius: '6px', color: '#0f172a', fontSize: '0.88rem' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Password</label>
            <div style={{ position: 'relative' }}>
              <input 
                type={showPassword ? "text" : "password"} required
                value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                style={{ width: '100%', padding: '10px', paddingRight: '40px', background: '#f8fafc', border: '1px solid var(--border-glass)', borderRadius: '6px', color: '#0f172a', fontSize: '0.88rem' }}
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            className="btn-primary"
            disabled={isLoading}
            style={{ width: '100%', justifyContent: 'center', padding: '11px', marginTop: '4px' }}
          >
            {isLoading ? 'Verifying Credentials...' : 'Sign In with Email & Password'}
          </button>
        </form>

        {/* GOOGLE OAUTH SIGN-IN BUTTON */}
        <div style={{ marginTop: '24px', borderTop: '1px solid var(--border-glass)', paddingTop: '18px', display: 'flex', justifyContent: 'center' }}>
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => {
              setErrorMsg('Google Login Failed. Have you provided a valid Google Client ID?');
            }}
            useOneTap
          />
        </div>

        {/* Switch to Register Page */}
        <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Don't have an account?{' '}
          <button 
            onClick={onSwitchToRegister} 
            style={{ background: 'transparent', border: 'none', color: '#2563eb', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline' }}
          >
            Create New Account
          </button>
        </div>

      </div>
    </div>
  );
}
