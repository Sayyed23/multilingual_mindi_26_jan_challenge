import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Eye,
  EyeOff,
  Lock,
  AlertCircle,
  User,
  Store,
  Users,
  Volume2,
  Mic,
  ShieldCheck,
  LifeBuoy,
  Globe,
  MessageCircle
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import type { UserRole } from '../types';

const RegisterPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<UserRole>('buyer');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const { signUp, error, clearError } = useAuth();
  const navigate = useNavigate();

  const validateForm = (): boolean => {
    const errors: string[] = [];

    if (!email) {
      errors.push('Email is required');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.push('Please enter a valid email address');
    }

    if (!password) {
      errors.push('Password is required');
    } else if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }

    if (!confirmPassword) {
      errors.push('Please confirm your password');
    } else if (password !== confirmPassword) {
      errors.push('Passwords do not match');
    }

    if (!role) {
      errors.push('Please select your role');
    }

    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!validateForm()) return;

    clearError();
    setIsSubmitting(true);

    try {
      const result = await signUp(email, password, role);
      if (result.success) {
        navigate('/onboarding');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const roleOptions = [
    {
      value: 'buyer' as UserRole,
      label: 'Buyer',
      description: 'I want to purchase commodities',
      icon: User
    },
    {
      value: 'vendor' as UserRole,
      label: 'Vendor',
      description: 'I want to sell commodities',
      icon: Store
    },
    {
      value: 'agent' as UserRole,
      label: 'Agent',
      description: 'I facilitate transactions',
      icon: Users
    }
  ];

  const displayErrors = validationErrors.length > 0 ? validationErrors : (error ? [error] : []);

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans antialiased text-[#1A1A1A]">
      {/* Top Navbar */}
      <nav className="w-full px-6 py-4 flex items-center justify-between bg-white/50 backdrop-blur-sm fixed top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-black rounded flex items-center justify-center">
            <div className="w-5 h-1 bg-white mb-0.5 rounded-full" />
            <div className="w-5 h-1 bg-white mt-0.5 rounded-full" />
          </div>
          <span className="text-xl font-bold tracking-tight">AgriMarket</span>
        </div>

        <div className="flex items-center gap-6 text-sm font-medium">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 bg-[#37ec13] rounded-full animate-pulse" />
            <span className="text-[#4A4A4A]">Network: <span className="text-black font-semibold">Online</span></span>
          </div>

          <button className="flex items-center gap-2 text-[#4A4A4A] hover:text-black transition-colors">
            <Globe size={18} />
            <span>English</span>
          </button>

          <Link
            to="/"
            className="bg-[#37ec13] text-black px-5 py-2.5 rounded-lg font-bold hover:opacity-90 transition-opacity"
          >
            Back to Home
          </Link>
        </div>
      </nav>

      <main className="flex-1 flex flex-col items-center justify-center pt-24 pb-12 px-4 text-[#1A1A1A]">
        <div className="w-full max-w-[580px] bg-white rounded-[32px] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
          <div className="p-10 sm:p-12">
            {/* Header with Listen Icon */}
            <div className="flex justify-between items-start mb-8">
              <div className="space-y-1">
                <h1 className="text-[40px] font-bold tracking-tight leading-tight">Create Account</h1>
                <p className="text-[#5BB133] text-lg font-medium">Join the marketplace and start trading.</p>
              </div>
              <button className="flex flex-col items-center gap-1 group">
                <div className="w-12 h-12 bg-[#E8F5E9] rounded-full flex items-center justify-center group-hover:bg-[#C8E6C9] transition-colors">
                  <Volume2 className="text-[#37ec13]" size={24} />
                </div>
                <span className="text-[10px] font-bold text-gray-400 group-hover:text-gray-600 tracking-widest uppercase">Listen</span>
              </button>
            </div>

            {/* Auth Tabs */}
            <div className="bg-[#F3F4F6] p-1.5 rounded-2xl flex mb-10">
              <Link
                to="/login"
                className="flex-1 py-3 text-center text-gray-500 rounded-xl text-sm font-bold tracking-wide hover:text-gray-700"
              >
                Login
              </Link>
              <div className="flex-1 py-3 text-center bg-white rounded-xl shadow-sm text-sm font-bold tracking-wide">
                Sign Up
              </div>
            </div>

            {/* Error Messages */}
            {displayErrors.length > 0 && (
              <div className="mb-8 p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                <AlertCircle className="text-red-500 mt-0.5 shrink-0" size={20} />
                <ul className="text-red-700 text-sm font-medium">
                  {displayErrors.map((err, index) => (
                    <li key={index}>
                      • {err}
                      {err.includes('Firebase Console') && (
                        <div className="mt-2 p-3 bg-white/50 rounded-lg border border-red-200">
                          <p className="font-bold text-red-800 mb-1">How to fix this:</p>
                          <ol className="list-decimal list-inside space-y-1 text-xs">
                            <li>Go to <a href="https://console.firebase.google.com/" target="_blank" rel="noopener noreferrer" className="underline font-bold">Firebase Console</a></li>
                            <li>Select your project (chicha123)</li>
                            <li>Go to <b>Authentication</b> &gt; <b>Sign-in method</b></li>
                            <li>Click <b>Add new provider</b></li>
                            <li>Select <b>Email/Password</b> and enable it</li>
                          </ol>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Registration Form */}
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Role Selection */}
              <div className="space-y-4">
                <label className="text-[15px] font-bold text-black px-1">
                  I am a...
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {roleOptions.map((option) => {
                    const IconComponent = option.icon;
                    const isActive = role === option.value;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setRole(option.value)}
                        className={`flex flex-col items-center p-4 rounded-2xl transition-all ${isActive
                          ? 'bg-[#37ec13]/10 border-2 border-[#37ec13]'
                          : 'bg-gray-50 border-2 border-transparent hover:border-gray-200'
                          }`}
                      >
                        <IconComponent
                          className={`mb-2 ${isActive ? 'text-[#37ec13]' : 'text-gray-400'}`}
                          size={24}
                        />
                        <span className={`text-sm font-bold ${isActive ? 'text-black' : 'text-gray-500'}`}>
                          {option.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Email */}
              <div className="space-y-3">
                <div className="flex justify-between items-center px-1">
                  <label htmlFor="email" className="text-[15px] font-bold text-black">
                    Email Address
                  </label>
                  <Mic size={18} className="text-[#37ec13] cursor-pointer" />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-6 py-5 bg-[#F9FAFB] border-none rounded-[20px] text-lg focus:ring-2 focus:ring-[#37ec13]/20 focus:bg-white transition-all outline-none placeholder-gray-300"
                  placeholder="Enter your email"
                  required
                  disabled={isSubmitting}
                />
              </div>

              {/* Password */}
              <div className="space-y-3">
                <div className="flex justify-between items-center px-1">
                  <label htmlFor="password" title="Enter your password" className="text-[15px] font-bold text-black">
                    Password
                  </label>
                  <div className="flex gap-4">
                    <Mic size={18} className="text-[#37ec13] cursor-pointer" />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-6 py-5 bg-[#F9FAFB] border-none rounded-[20px] text-lg focus:ring-2 focus:ring-[#37ec13]/20 focus:bg-white transition-all outline-none placeholder-gray-300"
                  placeholder="Create a password"
                  required
                  disabled={isSubmitting}
                />
              </div>

              {/* Confirm Password */}
              <div className="space-y-3">
                <div className="flex justify-between items-center px-1">
                  <label htmlFor="confirmPassword" title="Confirm your password" className="text-[15px] font-bold text-black">
                    Confirm Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-6 py-5 bg-[#F9FAFB] border-none rounded-[20px] text-lg focus:ring-2 focus:ring-[#37ec13]/20 focus:bg-white transition-all outline-none placeholder-gray-300"
                  placeholder="Confirm your password"
                  required
                  disabled={isSubmitting}
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#37ec13] text-black py-6 rounded-[24px] text-xl font-black shadow-[0_8px_16px_rgba(55,236,19,0.2)] hover:shadow-[0_12px_24px_rgba(55,236,19,0.3)] transition-all disabled:opacity-50 disabled:shadow-none active:scale-[0.98]"
              >
                {isSubmitting ? 'CREATING ACCOUNT...' : 'Create Account Now'}
              </button>
            </form>
          </div>

          {/* Trust Footer */}
          <div className="bg-[#FDFDFD] border-t border-gray-100 grid grid-cols-3 py-10">
            <div className="flex flex-col items-center gap-2 border-r border-gray-100 px-4 group">
              <ShieldCheck className="text-black group-hover:scale-110 transition-transform" size={24} />
              <span className="text-[10px] font-black tracking-tighter uppercase">Secure Login</span>
            </div>
            <div className="flex flex-col items-center gap-2 border-r border-gray-100 px-4 group">
              <Lock className="text-black group-hover:scale-110 transition-transform" size={24} />
              <span className="text-[10px] font-black tracking-tighter uppercase">Data Protected</span>
            </div>
            <div className="flex flex-col items-center gap-2 px-4 group">
              <LifeBuoy className="text-black group-hover:scale-110 transition-transform" size={24} />
              <span className="text-[10px] font-black tracking-tighter uppercase">24/7 Support</span>
            </div>
          </div>
        </div>

        {/* Voice Assistant Pill */}
        <button type="button" className="mt-12 bg-white px-8 py-4 rounded-full shadow-lg flex items-center gap-4 hover:shadow-xl transition-all hover:-translate-y-1 group">
          <div className="w-10 h-10 bg-[#37ec13] rounded-lg flex items-center justify-center text-white group-hover:rotate-12 transition-transform">
            <MessageCircle size={24} fill="currentColor" />
          </div>
          <span className="text-lg font-bold tracking-tight">
            Need help? <span className="text-black/60">Ask the Voice Assistant</span>
          </span>
        </button>

        {/* Bottom Links */}
        <div className="mt-10 flex items-center gap-8 text-sm font-bold text-[#5BB133]">
          <Link to="/privacy" className="hover:underline">Privacy Policy</Link>
          <span className="w-1.5 h-1.5 bg-gray-300 rounded-full" />
          <Link to="/terms" className="hover:underline">Terms of Service</Link>
          <span className="w-1.5 h-1.5 bg-gray-300 rounded-full" />
          <Link to="/support" className="hover:underline">Contact Support</Link>
        </div>
      </main>
    </div>
  );
};

export default RegisterPage;