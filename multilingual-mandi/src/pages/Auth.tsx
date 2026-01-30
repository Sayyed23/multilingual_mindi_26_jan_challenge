import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Volume2,
    Globe,
    Mic,
    Eye,
    EyeOff,
    ShieldCheck,
    Lock,
    Headphones,
    Tractor,
    ShoppingCart,
    Handshake,
    HelpCircle,
    Leaf
} from 'lucide-react';

export const Auth = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [authMode, setAuthMode] = useState<'Login' | 'SignUp'>('Login');
    const [showPassword, setShowPassword] = useState(false);
    const [selectedRole, setSelectedRole] = useState<'Farmer' | 'Buyer' | 'Agent' | null>(null);

    const toggleAuthMode = (mode: 'Login' | 'SignUp') => {
        setAuthMode(mode);
        setSelectedRole(null);
    };

    const fillDemo = (role: 'Farmer' | 'Buyer' | 'Agent') => {
        if (import.meta.env.PROD) return; // Disable in production
        switch (role) {
            case 'Farmer':
                setEmail('farmer@mandi.com');
                setPassword('pass123');
                break;
            case 'Buyer':
                setEmail('buyer@mandi.com');
                setPassword('pass123');
                break;
            case 'Agent':
                setEmail('agent@mandi.com');
                setPassword('pass123');
                break;
        }
    };
    return (
        <div className="min-h-screen bg-background-light text-[#101b0d] font-sans flex flex-col">
            {/* TopNavBar Component */}
            <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-[#e9f3e7] bg-white px-4 sm:px-10 py-3 sticky top-0 z-50">
                <div className="flex items-center gap-4 text-[#101b0d]">
                    <div className="h-10 w-10 flex items-center justify-center bg-green-100 rounded-full">
                        <Leaf className="h-6 w-6 text-primary" />
                    </div>
                    <h2 className="text-[#101b0d] text-xl font-bold leading-tight tracking-[-0.015em]">AgriMarket</h2>
                </div>
                <div className="flex flex-1 justify-end gap-4 sm:gap-8">
                    <div className="hidden sm:flex items-center gap-6">
                        <div className="flex items-center gap-2">
                            <span className="relative flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
                            </span>
                            <span className="text-sm font-medium">Network: Online</span>
                        </div>
                        <div className="flex items-center gap-1 cursor-pointer hover:text-green-600 transition-colors">
                            <Globe className="h-5 w-5" />
                            <span className="text-sm font-medium">English</span>
                        </div>
                    </div>
                    <button
                        onClick={() => navigate('/')}
                        className="flex min-w-[100px] cursor-pointer items-center justify-center rounded-lg h-10 px-4 bg-primary hover:bg-green-500 text-[#101b0d] text-sm font-bold transition-colors"
                    >
                        <span>Back to Home</span>
                    </button>
                </div>
            </header>

            <main className="flex flex-1 flex-col items-center py-10 px-4">
                <div className="layout-content-container flex flex-col max-w-[520px] w-full bg-white rounded-xl shadow-sm border border-[#e9f3e7] overflow-hidden">
                    {/* Title Section & Audio Action */}
                    <div className="pt-8 px-8">
                        <div className="flex items-start justify-between">
                            <div>
                                <h1 className="text-[#101b0d] tracking-tight text-[32px] font-bold leading-tight">
                                    {authMode === 'Login' ? 'Sign in to your account' : 'Create new account'}
                                </h1>
                                <p className="text-[#599a4c] text-base font-normal mt-1">
                                    {authMode === 'Login' ? 'Access your marketplace dashboard securely.' : 'Join the fastest growing mandi network.'}
                                </p>
                            </div>
                            <div className="group flex flex-col items-center gap-1 cursor-pointer">
                                <div className="rounded-full bg-primary/20 p-3 text-green-700 hover:bg-primary hover:text-white transition-colors">
                                    <Volume2 className="h-6 w-6" />
                                </div>
                                <span className="text-[10px] font-bold uppercase tracking-wider text-[#599a4c]">Listen</span>
                            </div>
                        </div>
                    </div>

                    {/* Segmented Control */}
                    <div className="px-8 py-6">
                        <div className="flex h-12 items-center justify-center rounded-xl bg-background-light p-1.5 border border-gray-100">
                            <button
                                onClick={() => toggleAuthMode('Login')}
                                className={`flex cursor-pointer h-full grow items-center justify-center rounded-lg px-2 text-base font-semibold transition-all ${authMode === 'Login'
                                    ? 'bg-white shadow-sm text-[#101b0d]'
                                    : 'text-[#599a4c] hover:text-[#101b0d]'
                                    }`}
                            >
                                Login
                            </button>
                            <button
                                onClick={() => toggleAuthMode('SignUp')}
                                className={`flex cursor-pointer h-full grow items-center justify-center rounded-lg px-2 text-base font-semibold transition-all ${authMode === 'SignUp'
                                    ? 'bg-white shadow-sm text-[#101b0d]'
                                    : 'text-[#599a4c] hover:text-[#101b0d]'
                                    }`}
                            >
                                Sign Up
                            </button>
                        </div>
                    </div>

                    {/* Input Fields */}
                    <form className="px-8 pb-8 space-y-6" onSubmit={(e) => {
                        e.preventDefault();

                        if (!email.trim() || !password.trim()) {
                            // Consider showing an error message to the user
                            return;
                        }

                        if (authMode === 'SignUp') {
                            navigate('/onboarding'); // Redirect to Onboarding for new signups
                            return;
                        }

                        // Login Logic
                        if (email.toLowerCase() === 'buyer@mandi.com') {
                            navigate('/buyer/dashboard');
                        } else if (email.toLowerCase() === 'agent@mandi.com') {
                            navigate('/agent/dashboard'); // If agent dashboard exists
                        } else {
                            navigate('/dashboard');
                        }
                    }}>                        <div className="space-y-2">
                            <label className="text-sm font-bold text-[#101b0d] flex justify-between items-center">
                                Email or Phone Number
                                <Mic className="h-5 w-5 text-primary cursor-pointer hover:text-green-600" />
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full h-14 bg-background-light border-2 border-transparent focus:border-primary rounded-xl px-4 text-lg outline-none transition-all placeholder:text-gray-400 focus:bg-white"
                                    placeholder="e.g. farmer@village.com"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-[#101b0d] flex justify-between items-center">
                                Password
                                <div className="flex gap-3">
                                    <Mic className="h-5 w-5 text-primary cursor-pointer hover:text-green-600" />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)}>
                                        {showPassword ? (
                                            <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                        ) : (
                                            <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                        )}
                                    </button>
                                </div>
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full h-14 bg-background-light border-2 border-transparent focus:border-primary rounded-xl px-4 text-lg outline-none transition-all focus:bg-white"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        {authMode === 'Login' && (
                            <div className="flex items-center justify-end">
                                <a href="#" className="text-primary font-bold text-sm hover:underline hover:text-green-600">
                                    Forgot Password?
                                </a>
                            </div>
                        )}

                        <button
                            type="submit"
                            className="w-full bg-primary hover:bg-green-500 text-[#101b0d] font-bold text-xl py-4 rounded-xl shadow-lg shadow-green-200 transition-all active:scale-[0.98]"
                        >
                            {authMode === 'Login' ? 'Sign In Now' : 'Create Account'}
                        </button>

                        {/* Demo Credentials Buttons */}
                        {authMode === 'Login' && (
                            <div className="pt-2 flex flex-col items-center gap-2">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Quick Demo Login</p>
                                <div className="flex gap-2 w-full">
                                    <button
                                        type="button"
                                        onClick={() => fillDemo('Farmer')}
                                        className="flex-1 bg-green-50 hover:bg-green-100 text-green-700 text-xs font-bold py-2 rounded-lg transition-colors border border-green-200"
                                    >
                                        Farmer
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => fillDemo('Buyer')}
                                        className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold py-2 rounded-lg transition-colors border border-blue-200"
                                    >
                                        Buyer
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => fillDemo('Agent')}
                                        className="flex-1 bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold py-2 rounded-lg transition-colors border border-purple-200"
                                    >
                                        Agent
                                    </button>
                                </div>
                            </div>
                        )}
                    </form>

                    {/* Trust Section */}
                    <div className="bg-background-light px-8 py-6 border-t border-[#e9f3e7]">
                        <div className="flex justify-around items-center opacity-70">
                            <div className="flex flex-col items-center gap-1 text-green-800">
                                <ShieldCheck className="h-6 w-6" />
                                <span className="text-[10px] font-bold uppercase">Secure Login</span>
                            </div>
                            <div className="flex flex-col items-center gap-1 text-green-800">
                                <Lock className="h-6 w-6" />
                                <span className="text-[10px] font-bold uppercase">Data Protected</span>
                            </div>
                            <div className="flex flex-col items-center gap-1 text-green-800">
                                <Headphones className="h-6 w-6" />
                                <span className="text-[10px] font-bold uppercase">24/7 Support</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Role Selection (Visible only in SignUp Mode) */}
                {authMode === 'SignUp' && (
                    <div className="mt-8 max-w-[520px] w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <h3 className="text-center font-bold text-lg mb-4 text-[#101b0d]">Choose your role</h3>
                        <div className="grid grid-cols-3 gap-4">
                            {[
                                { id: 'Farmer', icon: <Tractor className="h-8 w-8" />, label: 'Farmer', sub: 'Selling fresh crops' },
                                { id: 'Buyer', icon: <ShoppingCart className="h-8 w-8" />, label: 'Buyer', sub: 'Buying bulk produce' },
                                { id: 'Agent', icon: <Handshake className="h-8 w-8" />, label: 'Agent', sub: 'Managing logistics' },
                            ].map((role) => (
                                <div
                                    key={role.id}
                                    onClick={() => setSelectedRole(role.id as any)}
                                    className={`bg-white p-4 sm:p-6 rounded-xl border-2 flex flex-col items-center text-center cursor-pointer transition-all ${selectedRole === role.id
                                        ? 'border-primary shadow-md bg-green-50'
                                        : 'border-transparent hover:border-primary/50'
                                        }`}
                                >
                                    <div className={`h-16 w-16 rounded-full flex items-center justify-center mb-3 ${selectedRole === role.id ? 'bg-primary text-white' : 'bg-green-100 text-green-700'
                                        }`}>
                                        {role.icon}
                                    </div>
                                    <span className="font-bold text-lg text-[#101b0d]">{role.label}</span>
                                    <p className="text-xs text-gray-500 mt-1">{role.sub}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Footer Help */}
                <footer className="mt-12 flex flex-col items-center gap-4">
                    <button className="flex items-center gap-3 px-6 py-3 bg-white rounded-full border border-primary/30 shadow-sm hover:shadow-md transition-all group hover:border-primary">
                        <HelpCircle className="h-6 w-6 text-primary group-hover:scale-110 transition-transform" />
                        <span className="font-bold text-[#101b0d]">Need help? Ask the Voice Assistant</span>
                    </button>
                    <div className="flex items-center gap-6 text-sm font-medium text-[#599a4c]">
                        <a href="#" className="hover:text-primary underline decoration-primary/30">Privacy Policy</a>
                        <span className="w-1 h-1 rounded-full bg-[#599a4c]"></span>
                        <a href="#" className="hover:text-primary underline decoration-primary/30">Terms of Service</a>
                        <span className="w-1 h-1 rounded-full bg-[#599a4c]"></span>
                        <a href="#" className="hover:text-primary underline decoration-primary/30">Contact Support</a>
                    </div>
                </footer>
            </main>
        </div>
    );
};
