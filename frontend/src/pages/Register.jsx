import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { UserPlus, Sparkles, Eye, EyeOff } from 'lucide-react';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import { register } from '../services/authService';

export default function Register() {
  const navigate = useNavigate();
  
  // Field values
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Field errors
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Show/Hide password toggle states
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validate = () => {
    const newErrors = {};
    
    if (!name.trim()) {
      newErrors.name = 'Full Name is required';
    }

    if (!email.trim()) {
      newErrors.email = 'Email Address is required';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        newErrors.email = 'Please enter a valid email address';
      }
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters long';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Confirm Password is required';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      toast.error('Please correct the errors in the form.');
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      await register(name.trim(), email.trim(), password, 'USER');
      toast.success('Registration Successful! Please login.');
      
      // Delay redirection
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed. Please check fields.';
      
      // Parse FastAPI Pydantic validation messages into UI error warnings
      if (err.response?.data?.detail && Array.isArray(err.response.data.detail)) {
        const detailErrors = {};
        err.response.data.detail.forEach(item => {
          const field = item.loc[item.loc.length - 1];
          detailErrors[field] = item.msg;
        });
        setErrors(detailErrors);
      }
      
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-white border border-brand-100 p-8 rounded-2xl shadow-xl animate-fade-in relative z-10">
      <div className="flex items-center gap-3 mb-4">
        <div className="inline-flex items-center justify-center p-2.5 bg-brand-100 rounded-xl text-brand-600 shadow-sm">
          <Sparkles className="w-6 h-6" />
        </div>
        <span className="font-display font-bold text-lg text-brand-950">AI Skincare Planner</span>
      </div>

      <h1 className="font-display text-2xl font-bold text-slate-900 mb-1">
        Create Account
      </h1>
      <p className="font-sans text-sm text-brand-800 mb-6">
        Begin your personalized AI skincare diagnostic journey today.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name input */}
        <Input 
          label="Full Name"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (errors.name) setErrors({ ...errors, name: '' });
          }}
          placeholder="e.g. Sarah Connor"
          error={errors.name}
          required
        />

        {/* Email input */}
        <Input 
          label="Email Address"
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (errors.email) setErrors({ ...errors, email: '' });
          }}
          placeholder="e.g. sarah@example.com"
          error={errors.email}
          required
        />

        {/* Password input */}
        <Input 
          label="Password"
          type={showPassword ? 'text' : 'password'}
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            if (errors.password) setErrors({ ...errors, password: '' });
          }}
          placeholder="••••••••"
          error={errors.password}
          required
          rightElement={
            <button 
              type="button" 
              onClick={() => setShowPassword(!showPassword)}
              className="focus:outline-none flex items-center justify-center"
            >
              {showPassword ? <EyeOff className="w-4 h-4 text-brand-500 hover:text-brand-850" /> : <Eye className="w-4 h-4 text-brand-500 hover:text-brand-850" />}
            </button>
          }
        />

        {/* Confirm Password input */}
        <Input 
          label="Confirm Password"
          type={showConfirmPassword ? 'text' : 'password'}
          value={confirmPassword}
          onChange={(e) => {
            setConfirmPassword(e.target.value);
            if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: '' });
          }}
          placeholder="••••••••"
          error={errors.confirmPassword}
          required
          rightElement={
            <button 
              type="button" 
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="focus:outline-none flex items-center justify-center"
            >
              {showConfirmPassword ? <EyeOff className="w-4 h-4 text-brand-500 hover:text-brand-850" /> : <Eye className="w-4 h-4 text-brand-500 hover:text-brand-850" />}
            </button>
          }
        />

        <div className="pt-2 space-y-3">
          <Button 
            type="submit" 
            loading={loading}
          >
            <UserPlus className="w-4 h-4" />
            Create Account
          </Button>

          <Link 
            to="/login"
            className="w-full flex items-center justify-center py-2.5 rounded-xl text-xs font-semibold border border-brand-200 hover:bg-brand-50 text-brand-850 transition-all bg-white"
          >
            Back to Login
          </Link>
        </div>
      </form>

      <div className="mt-6 text-center text-xs text-brand-805">
        Already have an account?{' '}
        <Link to="/login" className="text-brand-600 hover:underline font-bold">
          Login
        </Link>
      </div>
    </div>
  );
}
