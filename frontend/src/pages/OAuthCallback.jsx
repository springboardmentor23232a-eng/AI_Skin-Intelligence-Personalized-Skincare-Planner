import { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function OAuthCallback() {
  const [params] = useSearchParams();
  const { loginWithGoogleToken, homePathFor } = useAuth();
  const navigate = useNavigate();
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    const token = params.get('token');
    if (!token) {
      navigate('/login?error=google');
      return;
    }
    loginWithGoogleToken(token)
      .then((user) => navigate(homePathFor(user.role)))
      .catch(() => navigate('/login?error=google'));
  }, [params, loginWithGoogleToken, homePathFor, navigate]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', gap: 14 }}>
      <div className="spinner" style={{ borderTopColor: '#2a8c82', borderColor: '#e2ebe9', width: 28, height: 28 }} />
      <p className="text-muted">Signing you in with Google…</p>
    </div>
  );
}
