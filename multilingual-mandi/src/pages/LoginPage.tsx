import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Eye,
  EyeOff,
  Lock,
  AlertCircle,
  Volume2,
  Mic,
  ShieldCheck,
  LifeBuoy,
  Globe,
  MessageCircle
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { signIn, error, clearError } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    clearError();
    setIsSubmitting(true);

    try {
      const result = await signIn(email, password);
      if (result.success) {
        navigate('/app', { replace: true });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

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

      <main className="flex-1 flex flex-col items-center justify-center pt-24 pb-12 px-4">
        <div className="w-full max-w-[580px] bg-white rounded-[32px] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
          <div className="p-10 sm:p-12">
            {/* Header with Listen Icon */}
            <div className="flex justify-between items-start mb-8">
              <div className="space-y-1">
                <h1 className="text-[40px] font-bold tracking-tight leading-tight">Sign in to your account</h1>
                <p className="text-[#5BB133] text-lg font-medium">Access your marketplace dashboard securely.</p>
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
                className="flex-1 py-3 text-center bg-white rounded-xl shadow-sm text-sm font-bold tracking-wide"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="flex-1 py-3 text-center text-gray-500 rounded-xl text-sm font-bold tracking-wide hover:text-gray-700"
              >
                Sign Up
              </Link>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-8 p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                <AlertCircle className="text-red-500 mt-0.5 shrink-0" size={20} />
                <p className="text-red-600 text-sm font-medium">{error}</p>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-3">
                <div className="flex justify-between items-center px-1">
                  <label htmlFor="email" className="text-[15px] font-bold text-black">
                    Email or Phone Number
                  </label>
                  <Mic size={18} className="text-[#37ec13] cursor-pointer" />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-6 py-5 bg-[#F9FAFB] border-none rounded-[20px] text-lg focus:ring-2 focus:ring-[#37ec13]/20 focus:bg-white transition-all outline-none placeholder-gray-300"
                  placeholder="e.g. farmer@village.com"
                  required
                  disabled={isSubmitting}
                />
              </div>

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
                  placeholder="••••••••"
                  required
                  disabled={isSubmitting}
                />
                <div className="flex justify-end pt-1">
                  <Link
                    to="/forgot-password"
                    className="text-sm text-[#37ec13] font-bold hover:underline"
                  >
                    Forgot Password?
                  </Link>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !email || !password}
                className="w-full bg-[#37ec13] text-black py-6 rounded-[24px] text-xl font-black shadow-[0_8px_16px_rgba(55,236,19,0.2)] hover:shadow-[0_12px_24px_rgba(55,236,19,0.3)] transition-all disabled:opacity-50 disabled:shadow-none active:scale-[0.98]"
              >
                {isSubmitting ? 'SIGNING IN...' : 'Sign In Now'}
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
        <button className="mt-12 bg-white px-8 py-4 rounded-full shadow-lg flex items-center gap-4 hover:shadow-xl transition-all hover:-translate-y-1 group">
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

export default LoginPage;