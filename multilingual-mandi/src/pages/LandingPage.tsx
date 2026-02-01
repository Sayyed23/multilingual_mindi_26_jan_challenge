import React from 'react';
import { Link } from 'react-router-dom';
import {
    Mic,
    Globe,
    TrendingUp,
    ShieldCheck,
    ArrowRight
} from 'lucide-react';

const LandingPage: React.FC = () => {
    return (
        <div className="min-h-screen bg-white font-sans text-gray-900">
            {/* Navigation */}
            <nav className="fixed w-full bg-white/80 backdrop-blur-md z-50 border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-20">
                        <div className="flex items-center gap-2">
                            <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-green-600/20">
                                M
                            </div>
                            <span className="text-xl font-bold tracking-tight">AgriMandi</span>
                        </div>

                        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
                            <a href="#features" className="hover:text-green-600 transition-colors">Features</a>
                            <a href="#how-it-works" className="hover:text-green-600 transition-colors">How it Works</a>
                            <a href="#testimonials" className="hover:text-green-600 transition-colors">Stories</a>
                        </div>

                        <div className="flex items-center gap-4">
                            <Link
                                to="/login"
                                className="text-sm font-bold text-gray-900 hover:text-green-600 transition-colors"
                            >
                                Log in
                            </Link>
                            <Link
                                to="/register"
                                className="bg-green-600 text-white px-5 py-2.5 rounded-full text-sm font-bold hover:bg-green-700 transition-all shadow-lg shadow-green-600/20 hover:shadow-green-600/30 hover:-translate-y-0.5"
                            >
                                Get Started
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <div className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
                <div className="absolute top-0 right-0 -z-10 w-1/2 h-full bg-gradient-to-l from-green-50 to-transparent" />
                <div className="absolute bottom-0 left-0 -z-10 w-1/2 h-1/2 bg-gradient-to-t from-blue-50 to-transparent rounded-tr-[100px]" />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-50 text-green-700 text-sm font-medium mb-8 animate-fade-in-up">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                        </span>
                        Live Market Prices Available
                    </div>

                    <h1 className="text-5xl md:text-7xl font-black tracking-tight text-gray-900 mb-8 leading-tight">
                        The Future of <br className="hidden md:block" />
                        <span className="text-green-600 relative inline-block">
                            Agri-Trading
                            <svg className="absolute w-full h-3 -bottom-1 left-0 text-green-200 -z-10" viewBox="0 0 100 10" preserveAspectRatio="none">
                                <path d="M0 5 Q 50 10 100 5 L 100 10 L 0 10 Z" fill="currentColor" />
                            </svg>
                        </span>
                    </h1>

                    <p className="max-w-2xl mx-auto text-xl text-gray-600 mb-10 leading-relaxed">
                        Connect directly with buyers and sellers across India.
                        Negotiate in your language using voice, and get fair prices instantly.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link
                            to="/register"
                            className="w-full sm:w-auto px-8 py-4 bg-green-600 text-white rounded-full font-bold text-lg hover:bg-green-700 transition-all shadow-xl shadow-green-600/30 hover:shadow-green-600/40 hover:-translate-y-1 flex items-center justify-center gap-2"
                        >
                            Start Trading Now
                            <ArrowRight size={20} />
                        </Link>
                        <a
                            href="#demo"
                            className="w-full sm:w-auto px-8 py-4 bg-white text-gray-900 border border-gray-200 rounded-full font-bold text-lg hover:border-gray-300 hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
                        >
                            <Mic size={20} className="text-green-600" />
                            Try Voice Demo
                        </a>
                    </div>

                    <div className="mt-16 flex items-center justify-center gap-8 text-sm font-medium text-gray-400 grayscale opacity-70">
                        <span>Trusted by 50,000+ Farmers</span>
                        <span className="w-1 h-1 bg-gray-300 rounded-full" />
                        <span>2,000+ Mandis</span>
                        <span className="w-1 h-1 bg-gray-300 rounded-full" />
                        <span>₹500Cr+ Trade Volume</span>
                    </div>
                </div>
            </div>

            {/* Features Grid */}
            <div id="features" className="py-24 bg-gray-50/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">Everything you need to grow</h2>
                        <p className="text-gray-600 text-lg">Powerful tools built for every participant in the agricultural supply chain.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        <FeatureCard
                            icon={<Mic className="w-8 h-8 text-blue-600" />}
                            title="Voice First"
                            description="Navigate the entire app and negotiate trades using just your voice in your local language."
                            color="bg-blue-50"
                        />
                        <FeatureCard
                            icon={<Globe className="w-8 h-8 text-green-600" />}
                            title="Multilingual"
                            description="Chat with anyone. We automatically translate your messages to the receiver's language."
                            color="bg-green-50"
                        />
                        <FeatureCard
                            icon={<TrendingUp className="w-8 h-8 text-purple-600" />}
                            title="Price Discovery"
                            description="Get real-time mandi prices and AI-powered market forecasts to make better decisions."
                            color="bg-purple-50"
                        />
                    </div>
                </div>
            </div>

            {/* How it Works */}
            <div id="how-it-works" className="py-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <div className="space-y-8">
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                                Simple, transparent, and fair trading for everyone.
                            </h2>

                            <div className="space-y-6">
                                <Step
                                    number="1"
                                    title="Create your profile"
                                    description="Sign up as a Farmer, Buyer, or Commission Agent and verify your identity."
                                />
                                <Step
                                    number="2"
                                    title="Discover or List"
                                    description="Farmers list crops, Buyers post requirements. AI matches the best deals."
                                />
                                <Step
                                    number="3"
                                    title="Negotiate & Close"
                                    description="Use voice chat to negotiate terms. Agree on price and delivery to generate a digital contract."
                                />
                            </div>
                        </div>

                        <div className="relative">
                            <div className="absolute inset-0 bg-green-600/5 blur-3xl rounded-full" />
                            <div className="relative bg-white p-8 rounded-3xl shadow-2xl border border-gray-100">
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold">VS</div>
                                    <div>
                                        <div className="font-bold text-gray-900">Vijay Singh</div>
                                        <div className="text-sm text-gray-500">Tomato Farmer, Nashik</div>
                                    </div>
                                </div>

                                <div className="space-y-4 mb-8">
                                    <div className="bg-gray-100 p-4 rounded-2xl rounded-tl-none max-w-[80%]">
                                        <p className="text-gray-700">मेरे पास 50 क्विंटल टमाटर है, भाव क्या है?</p>
                                        <p className="text-xs text-gray-500 mt-1">Translated: I have 50 quintals of tomatoes, what's the rate?</p>
                                    </div>
                                    <div className="bg-blue-600 text-white p-4 rounded-2xl rounded-tr-none max-w-[80%] ml-auto">
                                        <p>Current market rate is ₹1,800/quintal. I can offer ₹1,850 for premium quality.</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 text-green-600 font-bold bg-green-50 p-4 rounded-xl">
                                    <ShieldCheck size={20} />
                                    <span>Deal Secured: ₹92,500</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="bg-gray-900 text-white py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center font-bold">M</div>
                        <span className="text-xl font-bold">AgriMandi</span>
                    </div>

                    <div className="text-gray-400 text-sm">
                        © 2024 AgriMandi. All rights reserved.
                    </div>

                    <div className="flex gap-6">
                        <a href="#" className="text-gray-400 hover:text-white transition-colors">Privacy</a>
                        <a href="#" className="text-gray-400 hover:text-white transition-colors">Terms</a>
                        <a href="#" className="text-gray-400 hover:text-white transition-colors">Contact</a>
                    </div>
                </div>
            </footer>
        </div>
    );
};

const FeatureCard: React.FC<{ icon: React.ReactNode; title: string; description: string; color: string }> = ({
    icon, title, description, color
}) => (
    <div className="p-8 rounded-3xl bg-white border border-gray-100 shadow-xl shadow-gray-200/50 hover:shadow-2xl hover:shadow-gray-200/50 transition-all hover:-translate-y-1">
        <div className={`w-14 h-14 ${color} rounded-2xl flex items-center justify-center mb-6`}>
            {icon}
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
        <p className="text-gray-600 leading-relaxed">{description}</p>
    </div>
);

const Step: React.FC<{ number: string; title: string; description: string }> = ({
    number, title, description
}) => (
    <div className="flex gap-6">
        <div className="flex-shrink-0 w-12 h-12 bg-gray-900 text-white rounded-full flex items-center justify-center font-bold text-lg">
            {number}
        </div>
        <div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
            <p className="text-gray-600">{description}</p>
        </div>
    </div>
);

export default LandingPage;
