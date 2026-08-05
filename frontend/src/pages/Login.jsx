import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { LogIn, Sparkles, AlertCircle } from 'lucide-react';

const credentialsMap = {
  user: { email: 'user@demo.com', password: 'user123' },
  consultant: { email: 'consultant@demo.com', password: 'consultant123' },
  dermatologist: { email: 'dermatologist@demo.com', password: 'dermatologist123' },
  admin: { email: 'admin@demo.com', password: 'admin123' }
};

export default function Login() {
  const navigate = useNavigate();
  const { login, googleLogin } = useAuth();
  
  const [role, setRole] = useState('user'); // user, consultant, dermatologist, admin
  const [email, setEmail] = useState('user@demo.com');
  const [password, setPassword] = useState('user123');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter both email and password.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const res = await login(email, password);
      if (res.success) {
        toast.success(`Welcome back!`);
        
        // Redirect based on normalized role
        const redirects = {
          user: '/dashboard',
          consultant: '/consultant',
          dermatologist: '/dermatologist',
          admin: '/admin'
        };
        navigate(redirects[res.role] || '/');
      } else {
        setErrorMsg(res.message);
        toast.error(res.message);
      }
    } catch (err) {
      toast.error('An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleCredentialResponse = async (response) => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await googleLogin(response.credential);
      if (res.success) {
        toast.success('Signed in with Google successfully!');
        
        const redirects = {
          user: '/dashboard',
          consultant: '/consultant',
          dermatologist: '/dermatologist',
          admin: '/admin'
        };
        navigate(redirects[res.role] || '/');
      } else {
        setErrorMsg(res.message);
        toast.error(res.message);
      }
    } catch (err) {
      setErrorMsg('Google Sign-In failed.');
      toast.error('Google Sign-In failed.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initGoogle = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || '998773860488-4p0ipummo8iuftinkh99q1mouh8pb2j7.apps.googleusercontent.com',
          callback: handleGoogleCredentialResponse
        });
        window.google.accounts.id.renderButton(
          document.getElementById("google-signin-btn"),
          { theme: "outline", size: "large", width: "382", logo_alignment: "left" }
        );
      }
    };

    initGoogle();

    // Check periodically in case script loads with delay
    const interval = setInterval(() => {
      if (window.google) {
        initGoogle();
        clearInterval(interval);
      }
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full max-w-md bg-white border border-brand-100 p-8 rounded-2xl shadow-xl animate-fade-in relative z-10">
      <div className="flex items-center gap-3 mb-4">
        <div className="inline-flex items-center justify-center p-2.5 bg-brand-100 rounded-xl text-brand-600 shadow-sm">
          <Sparkles className="w-6 h-6" />
        </div>
        <span className="font-display font-bold text-lg text-brand-950">AI Skincare Planner</span>
      </div>

      <h1 className="font-display text-2xl font-bold text-slate-900 mb-1">
        Access Portal
      </h1>
      <p className="font-sans text-sm text-brand-800 mb-6">
        Select your role and enter credentials to sign in.
      </p>

      {errorMsg && (
        <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-800 text-xs mb-4">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Segmented Role Selector */}
        <div>
          <label className="block text-[10px] font-display font-bold uppercase tracking-widest text-brand-800 mb-1.5 text-center">
            Login As
          </label>
          <div className="grid grid-cols-4 gap-1 p-1 bg-brand-50 border border-brand-100 rounded-xl mb-4 font-display font-medium text-[9px]">
            {['user', 'consultant', 'dermatologist', 'admin'].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => {
                  setRole(r);
                  const creds = credentialsMap[r];
                  setEmail(creds.email);
                  setPassword(creds.password);
                  setErrorMsg('');
                }}
                className={`py-2 rounded-lg text-center transition-all capitalize ${
                  role === r 
                    ? 'bg-brand-600 text-white font-bold shadow-sm' 
                    : 'text-brand-850 hover:bg-brand-100/50'
                }`}
              >
                {r === 'user' ? 'User' : r === 'consultant' ? 'Consultant' : r === 'dermatologist' ? 'Derm' : 'Admin'}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-display font-semibold uppercase tracking-wider text-brand-800 mb-1.5">
            Email Address
          </label>
          <input 
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="e.g. user@demo.com"
            className="w-full px-4 py-2.5 rounded-xl border border-brand-200 text-sm font-sans text-brand-950 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent bg-brand-50/20"
          />
        </div>

        <div>
          <label className="block text-xs font-display font-semibold uppercase tracking-wider text-brand-800 mb-1.5">
            Password
          </label>
          <input 
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full px-4 py-2.5 rounded-xl border border-brand-200 text-sm font-sans text-brand-950 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent bg-brand-50/20"
          />
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full btn-primary py-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <LogIn className="w-4 h-4" />
              Sign In
            </>
          )}
        </button>
      </form>

      <div className="relative my-5 flex items-center justify-center">
        <div className="border-t border-brand-100 w-full absolute" />
        <span className="bg-white px-3 text-[10px] text-brand-400 uppercase font-bold tracking-wider relative z-10">Or connect with</span>
      </div>

      <div className="w-full flex justify-center min-h-[44px]">
        <div id="google-signin-btn" className="w-full flex justify-center" />
      </div>

      <div className="mt-6 text-center text-xs text-brand-800">
        Don't have an account?{' '}
        <Link to="/register" className="text-brand-600 hover:underline font-bold">
          Create an Account
        </Link>
      </div>
    </div>
  );
}
