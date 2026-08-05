import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { USER_ROLES, API_BASE_URL } from '@/lib/constants';
import { Sparkles, Mail, Lock, User, UserCheck, Stethoscope, Shield, ArrowRight, AlertCircle, CheckCircle2, Eye, EyeOff, ShieldAlert, X } from 'lucide-react';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { loginWithToken, accessDeniedMessage, setAccessDeniedMessage } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [role, setRole] = useState(USER_ROLES.CONSUMER);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Google Account Picker Modal state
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [customGoogleEmail, setCustomGoogleEmail] = useState('');

  const sampleGoogleAccounts = [
    { email: 'aish@gmail.com', name: 'Aishwarya Gudla' },
    { email: 'user.google@gmail.com', name: 'Google Workspace User' },
  ];

  const handleGoogleSignUpClick = () => {
    setErrorMessage(null);
    setSuccessMessage(null);
    setAccessDeniedMessage(null);
    setShowGoogleModal(true);
  };

  const handleSelectGoogleAccount = async (acctEmail, acctName) => {
    setShowGoogleModal(false);
    await sendGoogleAuthToBackend(null, acctEmail, acctName);
  };

  const sendGoogleAuthToBackend = async (idToken, fallbackEmail, fallbackName) => {
    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    setAccessDeniedMessage(null);

    const googleEmail = fallbackEmail || email.trim() || 'user.google@gmail.com';
    const googleName = fallbackName || name.trim() || (email ? email.split('@')[0] : 'Google Workspace User');

    const googlePayload = {
      id_token: idToken || null,
      email: googleEmail,
      name: googleName,
      full_name: googleName,
      role: role.toUpperCase(),
      provider: 'GOOGLE',
    };

    const targetEndpoints = ['/api/auth/google', `${API_BASE_URL}/auth/google`];
    let registrationSuccess = false;
    let lastError = null;

    for (const endpoint of targetEndpoints) {
      try {
        const resp = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(googlePayload),
        });

        if (!resp.ok) {
          const errorData = await resp.json().catch(() => null);
          throw new Error(errorData?.detail || 'Google OAuth registration failed');
        }

        const data = await resp.json();
        const accessToken = data.access_token;
        const assignedRole = (data.role || role).toLowerCase().replace('wellness_coach', 'consultant');

        setSuccessMessage('Successfully registered');

        // Store JWT token & set user session with isFirstTime=true
        loginWithToken(accessToken, googleEmail, assignedRole, true, googleName);
        registrationSuccess = true;

        setTimeout(() => {
          setIsLoading(false);
          switch (assignedRole) {
            case 'consultant':
              navigate('/dashboard/consultant');
              break;
            case 'dermatologist':
              navigate('/dashboard/dermatologist');
              break;
            case 'admin':
              navigate('/dashboard/admin');
              break;
            default:
              navigate('/dashboard/user');
              break;
          }
        }, 1000);

        break;
      } catch (err) {
        lastError = err;
      }
    }

    if (!registrationSuccess) {
      setIsLoading(false);
      setErrorMessage(
        lastError?.message?.includes('Failed to fetch') || lastError?.message?.includes('NetworkError')
          ? 'Unable to connect to backend server at http://127.0.0.1:8000. Ensure FastAPI backend is running.'
          : lastError?.message || 'Google OAuth Sign-Up failed.'
      );
    }
  };

  const roleOptions = [
    {
      role: USER_ROLES.CONSUMER,
      label: 'Consumer / User',
      desc: 'Personalized user dashboard',
      icon: User,
    },
    {
      role: USER_ROLES.CONSULTANT,
      label: 'Skincare Consultant',
      desc: 'Client roster workspace',
      icon: UserCheck,
    },
    {
      role: USER_ROLES.DERMATOLOGIST,
      label: 'Dermatologist',
      desc: 'Patient diagnosis portal',
      icon: Stethoscope,
    },
    {
      role: USER_ROLES.ADMIN,
      label: 'Administrator',
      desc: 'Platform management console',
      icon: Shield,
    },
  ];

  const validateForm = () => {
    if (!name.trim() || !email.trim() || !password || !confirmPassword) {
      return 'All fields are required.';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return 'Please enter a valid email address.';
    }

    if (password !== confirmPassword) {
      return 'Password and Confirm Password do not match.';
    }

    if (password.length < 8) {
      return 'Password must be at least 8 characters long.';
    }

    const hasUpper = /[A-Z]/.test(password);
    const hasNumOrSpecial = /[0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
    if (!hasUpper || !hasNumOrSpecial) {
      return 'Password must contain at least one uppercase letter and one number or special character (e.g. Password@123).';
    }

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setAccessDeniedMessage(null);

    const validationError = validateForm();
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    setIsLoading(true);

    const payload = {
      name: name.trim(),
      full_name: name.trim(),
      email: email.trim(),
      password: password,
      role: role.toUpperCase(),
    };

    const registerEndpoints = ['/api/register', `${API_BASE_URL}/register`];
    let registrationSuccess = false;
    let lastError = null;

    for (const endpoint of registerEndpoints) {
      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          const detail = errorData?.detail || `Registration failed with status ${response.status}`;
          throw new Error(detail);
        }

        registrationSuccess = true;
        break;
      } catch (err) {
        lastError = err;
      }
    }

    if (registrationSuccess) {
      setSuccessMessage('Successfully registered');

      const tokenEndpoints = ['/api/token', `${API_BASE_URL}/token`];
      let token = null;

      const formData = new URLSearchParams();
      formData.append('username', email.trim());
      formData.append('password', password);

      for (const tokenEndpoint of tokenEndpoints) {
        try {
          const tokenRes = await fetch(tokenEndpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: formData.toString(),
          });
          if (tokenRes.ok) {
            const tokenData = await tokenRes.json();
            token = tokenData.access_token;
            break;
          }
        } catch (_) {}
      }

      loginWithToken(token || 'registered_user_jwt', email.trim(), role, true, name.trim());

      setTimeout(() => {
        setIsLoading(false);
        switch (role) {
          case USER_ROLES.CONSULTANT:
            navigate('/dashboard/consultant');
            break;
          case USER_ROLES.DERMATOLOGIST:
            navigate('/dashboard/dermatologist');
            break;
          case USER_ROLES.ADMIN:
            navigate('/dashboard/admin');
            break;
          default:
            navigate('/dashboard/user');
            break;
        }
      }, 1000);
    } else {
      setIsLoading(false);
      setErrorMessage(
        lastError?.message?.includes('Failed to fetch') || lastError?.message?.includes('NetworkError')
          ? 'Unable to connect to backend server at http://127.0.0.1:8000. Ensure FastAPI backend is running.'
          : lastError?.message || 'Registration failed. Please try again.'
      );
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-8 px-4 relative">
      <GlassCard glow className="max-w-xl w-full p-8 sm:p-10 space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-cyan-500 mx-auto flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-emerald-500/20">
            <Sparkles className="w-6 h-6 fill-slate-950" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Create Your Account</h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-md mx-auto">
            Register to access personalized skincare planning and role-based intelligence dashboards.
          </p>
        </div>

        {/* RBAC Access Denied Notification Banner (HTTP 403 Forbidden) */}
        {accessDeniedMessage && (
          <div className="p-4 rounded-xl bg-amber-500/20 border border-amber-500/50 text-amber-200 text-xs flex flex-col gap-1.5 shadow-lg animate-bounce">
            <div className="flex items-center gap-2 font-bold text-amber-300">
              <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
              <span>HTTP 403 Forbidden — Access Denied</span>
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed">{accessDeniedMessage}</p>
          </div>
        )}

        {/* Success Alert Banner: Successfully registered */}
        {successMessage && (
          <div className="p-4 rounded-xl bg-emerald-500/20 border border-emerald-500/50 text-emerald-200 text-sm flex items-center gap-3 shadow-lg animate-pulse">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span className="font-bold text-emerald-300">{successMessage}</span>
          </div>
        )}

        {/* Error Alert Banner */}
        {errorMessage && (
          <div className="p-4 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-200 text-xs flex flex-col gap-1.5 shadow-lg">
            <div className="flex items-center gap-2 font-bold text-rose-300">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>Registration Error</span>
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed">{errorMessage}</p>
          </div>
        )}

        {/* Google OAuth Register Button */}
        <div className="space-y-4">
          <button
            type="button"
            onClick={handleGoogleSignUpClick}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 bg-slate-900/90 border border-slate-700/80 hover:border-emerald-500/60 rounded-xl px-4 py-3 text-sm font-bold text-slate-100 hover:text-white transition-all shadow-md hover:shadow-emerald-500/10 hover:bg-slate-800/90 group cursor-pointer"
          >
            <svg className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" viewBox="0 0 24 24">
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
            <span>Sign up with Google</span>
          </button>

          <div className="relative flex items-center justify-center my-4">
            <div className="border-t border-slate-800 w-full"></div>
            <span className="bg-slate-950 px-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider relative shrink-0">
              or register with email
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Full Name Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-emerald-400" /> Full Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Aishwarya Gudla"
              className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
            />
          </div>

          {/* Email Address Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-emerald-400" /> Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="aish@gmail.com"
              className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
            />
          </div>

          {/* Password & Confirm Password Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-emerald-400" /> Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password@123"
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-2.5 pr-10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-emerald-400" /> Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Password@123"
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-2.5 pr-10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors p-1"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* Role Selection Grid - Matching Login Page exactly */}
          <div className="space-y-3 pt-1">
            <label className="text-xs font-semibold text-slate-300 block">
              Select Workspace Role:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {roleOptions.map((opt) => {
                const IconComponent = opt.icon;
                const isSelected = role === opt.role;
                return (
                  <button
                    key={opt.role}
                    type="button"
                    onClick={() => setRole(opt.role)}
                    className={`p-3.5 rounded-xl border text-left transition-all flex items-start gap-3 ${
                      isSelected
                        ? 'bg-emerald-500/15 border-emerald-500 text-white shadow-lg shadow-emerald-500/5 ring-1 ring-emerald-500/30'
                        : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        isSelected ? 'bg-emerald-500 text-slate-950 font-bold' : 'bg-slate-900 text-slate-400'
                      }`}
                    >
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <div className="space-y-0.5 overflow-hidden">
                      <span className="font-bold text-xs block truncate text-slate-100">{opt.label}</span>
                      <span className="text-[10px] text-slate-400 block truncate">{opt.desc}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Submit Register Button */}
          <Button
            type="submit"
            disabled={isLoading}
            size="lg"
            className="w-full shadow-emerald-500/25 mt-4"
          >
            {isLoading ? (
              'Creating Account...'
            ) : (
              <>
                Register Account <ArrowRight className="w-4 h-4 ml-1" />
              </>
            )}
          </Button>
        </form>

        {/* Footer Link: Already have an account? Sign In */}
        <div className="text-center pt-2 border-t border-slate-800/80">
          <p className="text-xs text-slate-400">
            Already have an account?{' '}
            <Link to="/login" className="text-emerald-400 font-bold hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </GlassCard>

      {/* Google Account Picker Modal */}
      {showGoogleModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 space-y-6 shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <h3 className="text-base font-bold text-white">Choose a Google Account</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowGoogleModal(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Select an account to continue to <span className="text-emerald-400 font-semibold">AI Skin Intelligence</span>:
            </p>

            <div className="space-y-3">
              {sampleGoogleAccounts.map((acct) => (
                <button
                  key={acct.email}
                  type="button"
                  onClick={() => handleSelectGoogleAccount(acct.email, acct.name)}
                  className="w-full flex items-center justify-between p-3.5 rounded-xl border border-slate-800 bg-slate-950/60 hover:bg-slate-800/80 hover:border-emerald-500/50 transition-all text-left group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-cyan-500 to-emerald-500 flex items-center justify-center font-bold text-slate-950 text-xs shadow-md">
                      {acct.email[0].toUpperCase()}
                    </div>
                    <div>
                      <span className="font-bold text-xs text-white block group-hover:text-emerald-300 transition-colors">
                        {acct.name}
                      </span>
                      <span className="text-[11px] text-slate-400 block">{acct.email}</span>
                    </div>
                  </div>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </div>

            {/* Custom Google Email Input */}
            <div className="pt-2 border-t border-slate-800 space-y-2">
              <label className="text-xs text-slate-300 font-semibold block">
                Use another Google Account:
              </label>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="yourname@gmail.com"
                  value={customGoogleEmail}
                  onChange={(e) => setCustomGoogleEmail(e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
                <Button
                  size="sm"
                  type="button"
                  onClick={() => {
                    if (customGoogleEmail.trim()) {
                      handleSelectGoogleAccount(
                        customGoogleEmail.trim(),
                        customGoogleEmail.split('@')[0]
                      );
                    }
                  }}
                >
                  Continue
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
