import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { updateProfile } from '../services/authService';
import toast from 'react-hot-toast';
import { User, Mail, Shield, Globe, Save, ArrowLeft } from 'lucide-react';
import Input from '../components/common/Input';
import Button from '../components/common/Button';

export default function Profile() {
  const navigate = useNavigate();
  const { user, updateSessionName } = useAuth();
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.name) {
      setName(user.name);
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Full Name is required');
      return;
    }

    setLoading(true);
    try {
      // Execute backend API profile PUT update
      await updateProfile(name.trim());
      
      // Update local storage session values
      updateSessionName(name.trim());
      toast.success('Profile updated successfully!');
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update profile name';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="glass-effect p-8 rounded-2xl shadow-lg border border-brand-100 animate-slide-up max-w-2xl mx-auto bg-white relative z-10">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button 
            onClick={() => navigate(-1)}
            type="button"
            className="p-2 hover:bg-brand-50 rounded-xl transition-colors border border-brand-150 text-brand-850 cursor-pointer"
            title="Go Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="p-3 bg-brand-100 rounded-xl text-brand-600">
            <User className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-brand-950">User Profile</h1>
            <p className="font-sans text-xs text-brand-800">Manage your general account settings and preferences</p>
          </div>
        </div>

        {/* Profile Card Metadata (Read-Only) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="p-4 bg-brand-50/50 rounded-xl border border-brand-100 flex items-start gap-3">
            <Mail className="w-5 h-5 text-brand-650 shrink-0 mt-0.5" />
            <div className="truncate">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-brand-450">Email Address</span>
              <span className="text-xs font-medium text-brand-950 truncate block" title={user?.email}>{user?.email}</span>
            </div>
          </div>

          <div className="p-4 bg-brand-50/50 rounded-xl border border-brand-100 flex items-start gap-3">
            <Shield className="w-5 h-5 text-brand-650 shrink-0 mt-0.5" />
            <div>
              <span className="block text-[10px] font-bold uppercase tracking-wider text-brand-450">Account Role</span>
              <span className="text-xs font-semibold text-brand-950 capitalize">{user?.role}</span>
            </div>
          </div>

          <div className="p-4 bg-brand-50/50 rounded-xl border border-brand-100 flex items-start gap-3">
            <Globe className="w-5 h-5 text-brand-650 shrink-0 mt-0.5" />
            <div>
              <span className="block text-[10px] font-bold uppercase tracking-wider text-brand-450">Sign In Via</span>
              <span className="text-xs font-semibold text-brand-950 uppercase">{user?.provider}</span>
            </div>
          </div>
        </div>

        {/* Editable Name Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input 
            label="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Sarah Connor"
            required
            disabled={loading}
          />

          <div className="flex gap-3 justify-end pt-4 border-t border-brand-100">
            <Button 
              type="button" 
              variant="secondary"
              onClick={() => navigate(-1)}
              className="w-auto px-6 cursor-pointer"
              disabled={loading}
            >
              Cancel
            </Button>
            
            <Button 
              type="submit" 
              loading={loading}
              className="w-auto px-6 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
