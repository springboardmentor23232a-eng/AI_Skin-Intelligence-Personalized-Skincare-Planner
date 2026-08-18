import React, { useEffect, useState } from 'react';
import { User, Mail, Shield, Save } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { Badge } from '@/components/ui/Badge';
import { useAuth } from '@/context/AuthContext';

const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

export default function ProfilePage() {
  const { fetchWithAuth } = useAuth();

  const [profile, setProfile] = useState(null);
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        setError('');

        const response = await fetchWithAuth(
          `${API_BASE_URL}/api/me`
        );

        if (!response.ok) {
          const data = await response.json().catch(() => null);
          throw new Error(
            data?.detail || 'Unable to load profile.'
          );
        }

        const data = await response.json();

        setProfile(data);
        setFullName(data.full_name || '');
      } catch (err) {
        console.error('Profile loading failed:', err);
        setError(err.message || 'Unable to load profile.');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [fetchWithAuth]);

  const handleSave = async (event) => {
    event.preventDefault();

    if (!fullName.trim()) {
      setError('Full name cannot be empty.');
      return;
    }

    try {
      setSaving(true);
      setMessage('');
      setError('');

      const response = await fetchWithAuth(
        `${API_BASE_URL}/api/me`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            full_name: fullName.trim(),
          }),
        }
      );

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.detail || 'Unable to update profile.'
        );
      }

      setProfile(data.profile);
      setFullName(data.profile.full_name);
      setMessage('Profile updated successfully.');
    } catch (err) {
      console.error('Profile update failed:', err);
      setError(err.message || 'Unable to update profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            My Profile
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Manage your account information.
          </p>
        </div>

        <GlassCard className="p-6">
          <p className="text-sm text-slate-400">
            Loading profile...
          </p>
        </GlassCard>
      </div>
    );
  }

  if (error && !profile) {
    return (
      <GlassCard className="p-6 border-red-500/20">
        <p className="text-sm text-red-400">{error}</p>
      </GlassCard>
    );
  }

  return (
    <div className="space-y-8 max-w-3xl mx-auto">

      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
          My Profile
        </h1>

        <p className="text-sm text-slate-400 mt-1">
          View and manage your account information.
        </p>
      </div>

      <GlassCard className="space-y-6">

        {/* Profile heading */}
        <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
          <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
            <User className="w-5 h-5 text-emerald-400" />
          </div>

          <div>
            <h2 className="text-lg font-bold text-white">
              Personal Information
            </h2>

            <p className="text-xs text-slate-500">
              Update your profile details.
            </p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-5">

          {/* Full Name */}
          <div>
            <label className="text-sm font-semibold text-slate-300">
              Full Name
            </label>

            <div className="relative mt-2">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />

              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white outline-none focus:border-emerald-500/50"
                placeholder="Enter your full name"
              />
            </div>
          </div>

          {/* Email - Read Only */}
          <div>
            <label className="text-sm font-semibold text-slate-300">
              Email
            </label>

            <div className="relative mt-2">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />

              <input
                type="email"
                value={profile?.email || ''}
                readOnly
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-500 cursor-not-allowed"
              />
            </div>

            <p className="text-xs text-slate-600 mt-1">
              Email is associated with your account and cannot be changed here.
            </p>
          </div>

          {/* Role */}
          <div>
            <label className="text-sm font-semibold text-slate-300">
              Role
            </label>

            <div className="mt-2 flex items-center gap-2">
              <Shield className="w-4 h-4 text-cyan-400" />

              <Badge variant="cyan">
                {profile?.role || 'USER'}
              </Badge>
            </div>
          </div>

          {/* Messages */}
          {message && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <p className="text-sm text-emerald-300">
                {message}
              </p>
            </div>
          )}

          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20">
              <p className="text-sm text-red-300">
                {error}
              </p>
            </div>
          )}

          {/* Save */}
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-500 text-slate-950 font-bold text-sm hover:bg-emerald-400 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>

        </form>
      </GlassCard>
    </div>
  );
}