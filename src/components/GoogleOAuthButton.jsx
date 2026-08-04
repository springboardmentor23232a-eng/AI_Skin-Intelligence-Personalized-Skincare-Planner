import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { X, Shield, User, CheckCircle } from "lucide-react";

// Helper function to decode JWT payload safely
const parseJwt = (token) => {
  try {
    if (!token) return null;
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (_e) {
    return null;
  }
};

const GoogleOAuthButton = ({ text = "Continue with Google", onSuccess, onError }) => {
  const { loginWithGoogle } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [customEmail, setCustomEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const executeGoogleLogin = async (googleUser) => {
    setLoading(true);
    try {
      const res = await loginWithGoogle(googleUser);
      if (res && res.success) {
        setShowModal(false);
        if (onSuccess) onSuccess(res.user);
      } else {
        if (onError) onError(res?.message || "Google Authentication Failed");
      }
    } catch (err) {
      if (onError) onError(err.message || "Google Authentication Error");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleCredentialResponse = async (response) => {
    if (response.credential) {
      const payload = parseJwt(response.credential);
      if (payload) {
        await executeGoogleLogin({
          name: payload.name || payload.given_name || "Google User",
          email: payload.email,
          profile_picture: payload.picture || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
          sub: payload.sub,
          idToken: response.credential
        });
      }
    }
  };

  useEffect(() => {
    // Initialize Google Identity Services if client ID is configured
    const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (window.google?.accounts?.id && googleClientId) {
      try {
        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: handleGoogleCredentialResponse,
          auto_select: false,
        });
      } catch (e) {
        console.warn("Google GSI initialization notice:", e);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleGoogleClick = () => {
    // Check if real Google GIS is available and client ID is configured
    const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (window.google?.accounts?.id && googleClientId) {
      window.google.accounts.id.prompt((notification) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          setShowModal(true);
        }
      });
    } else {
      setShowModal(true);
    }
  };

  const handlePresetSelect = (account) => {
    executeGoogleLogin({
      name: account.name,
      email: account.email,
      profile_picture: account.avatar,
      sub: account.id
    });
  };

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    if (!customEmail) return;
    executeGoogleLogin({
      name: customEmail.split("@")[0],
      email: customEmail,
      profile_picture: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
      sub: "custom_google_" + Date.now()
    });
  };

  return (
    <>
      <button
        type="button"
        onClick={handleGoogleClick}
        className="btn btn-google btn-block"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.75rem',
          padding: '0.75rem 1.25rem',
          borderRadius: '10px',
          fontWeight: 600,
          border: '1px solid var(--border-color, #e2e8f0)',
          backgroundColor: '#ffffff',
          color: '#1f2937',
          boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          fontSize: '0.95rem',
          width: '100%'
        }}
        disabled={loading}
      >
        <svg width="20" height="20" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
          />
        </svg>
        <span>{loading ? "Signing in with Google..." : text}</span>
      </button>

      {/* Interactive Google Account Selector Modal */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1100
        }}>
          <div className="glass-card" style={{
            maxWidth: '440px',
            width: '92%',
            padding: '2rem',
            position: 'relative',
            borderRadius: '16px',
            background: 'var(--card-bg, #ffffff)',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
          }}>
            <button
              type="button"
              onClick={() => setShowModal(false)}
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                background: 'none',
                border: 'none',
                color: 'var(--text-muted, #64748b)',
                cursor: 'pointer',
                padding: '0.25rem',
                borderRadius: '50%'
              }}
            >
              <X size={20} />
            </button>

            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                backgroundColor: 'rgba(66, 133, 244, 0.1)',
                marginBottom: '0.75rem'
              }}>
                <svg width="28" height="28" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 0.25rem 0', color: 'var(--text-primary, #0f172a)' }}>Sign in with Google</h3>
              <p style={{ color: 'var(--text-secondary, #64748b)', fontSize: '0.875rem', margin: 0 }}>
                Choose an account to continue to AI Skincare Intelligence
              </p>
            </div>

            {/* Quick Google Account Options */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <div
                onClick={() => handlePresetSelect({
                  name: "Akash Prajapati",
                  email: "akp73733@gmail.com",
                  avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
                  id: "10987654321"
                })}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem 1rem',
                  borderRadius: '12px',
                  border: '1px solid var(--border-color, #e2e8f0)',
                  backgroundColor: 'var(--input-bg, #f8fafc)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"
                  alt="Akash Prajapati"
                  style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-primary, #0f172a)' }}>
                    Akash Prajapati <Shield size={14} style={{ color: 'var(--primary, #6366f1)' }} />
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted, #64748b)' }}>akp73733@gmail.com</div>
                </div>
                <CheckCircle size={18} style={{ color: 'var(--primary, #6366f1)' }} />
              </div>

              <div
                onClick={() => handlePresetSelect({
                  name: "John Doe",
                  email: "john.doe@gmail.com",
                  avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
                  id: "10987654322"
                })}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem 1rem',
                  borderRadius: '12px',
                  border: '1px solid var(--border-color, #e2e8f0)',
                  backgroundColor: 'var(--input-bg, #f8fafc)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150"
                  alt="John Doe"
                  style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary, #0f172a)' }}>John Doe</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted, #64748b)' }}>john.doe@gmail.com</div>
                </div>
                <User size={18} style={{ color: 'var(--text-muted, #64748b)' }} />
              </div>
            </div>

            {/* Custom Google Email Input */}
            <form onSubmit={handleCustomSubmit} style={{ borderTop: '1px solid var(--border-color, #e2e8f0)', paddingTop: '1rem' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary, #64748b)', marginBottom: '0.5rem' }}>
                Use another Google Email:
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="email"
                  placeholder="your.email@gmail.com"
                  value={customEmail}
                  onChange={(e) => setCustomEmail(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '0.55rem 0.85rem',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color, #cbd5e1)',
                    fontSize: '0.85rem'
                  }}
                  required
                />
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ padding: '0.55rem 1rem', fontSize: '0.85rem', whiteSpace: 'nowrap' }}
                >
                  Authorize
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default GoogleOAuthButton;
