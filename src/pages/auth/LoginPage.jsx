import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { USER_ROLES } from '@/lib/constants';
import { Sparkles, Mail, Lock, UserCheck, Shield, Stethoscope, User, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState(USER_ROLES.CONSUMER);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
  e.preventDefault();
  setIsLoading(true);

  const success = await login(email, password, selectedRole);

  setIsLoading(false);

  if (!success) {
    alert("Invalid email or password");
    return;
  }

  switch (selectedRole) {
    case USER_ROLES.CONSULTANT:
      navigate("/dashboard/consultant");
      break;

    case USER_ROLES.DERMATOLOGIST:
      navigate("/dashboard/dermatologist");
      break;

    case USER_ROLES.ADMIN:
      navigate("/dashboard/admin");
      break;

    default:
      navigate("/dashboard/user");
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

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-8 px-4">
      <GlassCard glow className="max-w-xl w-full p-8 sm:p-10 space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-cyan-500 mx-auto flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-emerald-500/20">
            <Sparkles className="w-6 h-6 fill-slate-950" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Sign In to Platform</h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-md mx-auto">
            This is a demonstration login page using dummy authentication. OAuth Login and JWT Authentication will be integrated in future project milestones.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email Input */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-emerald-400" /> Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@skintelligence.ai"
              className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
            />
          </div>

          {/* Password Input */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-emerald-400" /> Password
              </label>
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
            />
          </div>

          {/* Role Selection Grid */}
          <div className="space-y-3">
            <label className="text-xs font-semibold text-slate-300 block">
              Select Workspace Role:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {roleOptions.map((opt) => {
                const IconComponent = opt.icon;
                const isSelected = selectedRole === opt.role;
                return (
                  <button
                    key={opt.role}
                    type="button"
                    onClick={() => setSelectedRole(opt.role)}
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

          {/* Submit Sign In Button */}
          <Button
            type="submit"
            disabled={isLoading}
            size="lg"
            className="w-full shadow-emerald-500/25 mt-2"
          >
            {isLoading ? (
              'Signing in...'
            ) : (
              <>
                Sign In to Workspace <ArrowRight className="w-4 h-4 ml-1" />
              </>
            )}
          </Button>
        </form>
      </GlassCard>
    </div>
  );
}
