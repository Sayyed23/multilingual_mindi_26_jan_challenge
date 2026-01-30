import { useState } from 'react';
import {
    Volume2,
    Globe,
    Tractor,
    Store,
    Users,
    Shield,
    ArrowRight,
    HelpCircle,
    Mic,
    MapPin,
    MessageSquare
} from 'lucide-react';

export const Onboarding = () => {
    const [mobile, setMobile] = useState('');

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            {/* Top Bar */}
            <div className="bg-white px-4 py-2 flex justify-between items-center shadow-sm">
                <div className="flex items-center gap-2">
                    <div className="bg-green-600 p-1.5 rounded-lg">
                        <Tractor className="h-5 w-5 text-white" />
                    </div>
                    <span className="font-bold text-gray-900">Mandi Market</span>
                </div>
                <div className="flex items-center gap-4 text-xs font-semibold">
                    <span className="text-green-600 flex items-center bg-green-50 px-2 py-1 rounded-full">
                        <span className="w-2 h-2 bg-green-500 rounded-full mr-1.5 animate-pulse"></span>
                        LIVE MARKET
                    </span>
                    <span className="hidden sm:inline text-gray-600">Help: 1800-123-4567</span>
                    <button className="bg-green-100 p-2 rounded-lg text-green-700">
                        <Globe className="h-4 w-4" />
                    </button>
                </div>
            </div>

            <div className="max-w-3xl mx-auto px-4 py-6 space-y-8">

                {/* Hero Section */}
                <div className="bg-white rounded-2xl p-4 shadow-sm flex flex-col md:flex-row gap-6">
                    <div className="w-full md:w-1/2 h-48 md:h-auto overflow-hidden rounded-xl">
                        <img
                            src="https://images.unsplash.com/photo-1595661608226-e41c2c31c944?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
                            alt="Farmer in field"
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <div className="flex-1 flex flex-col justify-center space-y-4">
                        <h1 className="text-3xl font-extrabold text-gray-900 leading-tight">
                            Get Fair Prices for Your Crop
                        </h1>
                        <div className="flex items-start gap-2 text-sm text-gray-600">
                            <Shield className="h-5 w-5 text-green-500 shrink-0" />
                            <p>Direct trade with local buyers. Secure and transparent.</p>
                        </div>
                        <button className="flex items-center justify-center gap-2 bg-green-500 text-white py-3 px-6 rounded-xl font-bold hover:bg-green-600 transition-colors w-full sm:w-auto mt-2">
                            <Volume2 className="h-5 w-5" />
                            Listen to Guide
                        </button>
                    </div>
                </div>

                {/* Language Selection */}
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            Select Your Language / भाषा चुनें
                        </h2>
                        <Volume2 className="h-5 w-5 text-green-500" />
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            { name: 'हिन्दी', sub: 'Hindi' },
                            { name: 'ਪੰਜਾਬੀ', sub: 'Punjabi' },
                            { name: 'मराठी', sub: 'Marathi' },
                            { name: 'English', sub: 'English' }
                        ].map((lang) => (
                            <button key={lang.sub} className="bg-white hover:border-green-500 border-2 border-transparent p-4 rounded-xl shadow-sm flex flex-col items-center gap-2 transition-all">
                                <span className="text-xl font-bold text-gray-900">{lang.name}</span>
                                <span className="text-xs text-gray-500 font-medium">{lang.sub}</span>
                                <div className="mt-1 bg-green-50 p-1.5 rounded-full">
                                    <Mic className="h-3 w-3 text-green-600" />
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Actions */}
                <div className="space-y-4">
                    <button className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-green-200 transition-transform active:scale-[0.98]">
                        <span className="text-lg">Check Mandi Prices</span>
                        <ArrowRight className="h-5 w-5" />
                    </button>
                    <button className="w-full bg-white border-2 border-gray-100 hover:border-gray-200 text-gray-900 font-bold py-4 rounded-xl transition-colors">
                        Login / Sign Up
                    </button>
                </div>

                {/* Features */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                        { icon: <MessageSquare className="h-6 w-6 text-green-600" />, title: 'Real Prices', desc: 'Live daily updates' },
                        { icon: <Users className="h-6 w-6 text-green-600" />, title: 'No Middlemen', desc: 'Sell directly to buyers' },
                        { icon: <HelpCircle className="h-6 w-6 text-green-600" />, title: 'Local Support', desc: 'Help available 24/7' }
                    ].map((feature, idx) => (
                        <div key={idx} className="bg-white p-4 rounded-xl flex items-center gap-4 shadow-sm border border-gray-50">
                            <div className="bg-green-50 p-3 rounded-full shrink-0">
                                {feature.icon}
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 text-sm">{feature.title}</h3>
                                <p className="text-xs text-gray-500">{feature.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Role Selection */}
                <div className="space-y-4">
                    <h2 className="text-lg font-bold text-gray-900">
                        Who are you? / आप कौन हैं?
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[
                            { icon: <Tractor className="h-8 w-8 text-green-600" />, title: 'Farmer / Vendor', desc: 'I want to sell my crops and check daily prices.' },
                            { icon: <Store className="h-8 w-8 text-green-600" />, title: 'Buyer', desc: 'I want to purchase crops in bulk from farmers.' },
                            { icon: <Users className="h-8 w-8 text-green-600" />, title: 'Agent', desc: 'I want to manage trades and facilitate connections.' }
                        ].map((role) => (
                            <div key={role.title} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col h-full hover:border-green-500 cursor-pointer transition-colors group">
                                <div className="mb-4">{role.icon}</div>
                                <h3 className="font-bold text-gray-900 mb-2">{role.title}</h3>
                                <p className="text-xs text-gray-500 mb-6 flex-grow">{role.desc}</p>
                                <span className="text-green-600 text-xs font-bold uppercase tracking-wider flex items-center gap-1 group-hover:gap-2 transition-all">
                                    Select <ArrowRight className="h-3 w-3" />
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Auth Input */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-green-100">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h3 className="font-bold text-lg text-gray-900">Enter Phone Number</h3>
                            <p className="text-xs text-gray-500">We will send a code to verify</p>
                        </div>
                        <div className="bg-green-50 p-2 rounded-full">
                            <Volume2 className="h-4 w-4 text-green-600" />
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <div className="flex-1 relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-500 text-sm border-r pr-3 border-gray-300">
                                +91
                            </span>
                            <input
                                type="tel"
                                value={mobile}
                                onChange={(e) => setMobile(e.target.value)}
                                placeholder="98765 43210"
                                className="w-full pl-16 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-900 placeholder-gray-400 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all shadow-inner"
                            />
                        </div>
                        <button className="bg-green-500 hover:bg-green-600 text-white font-bold px-6 py-3 rounded-xl whitespace-nowrap shadow-md shadow-green-200 transition-colors">
                            Send OTP
                        </button>
                    </div>
                </div>

                {/* Footer Info */}
                <div className="bg-green-50 rounded-2xl p-6 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="space-y-3">
                        <h3 className="font-bold text-gray-900 flex items-center gap-2">
                            <Shield className="h-4 w-4 text-green-600" />
                            Security & Permissions
                        </h3>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-xs text-gray-600">
                                <MapPin className="h-3 w-3 text-green-500" />
                                <span>Location: To find nearby mandis</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-600">
                                <MessageSquare className="h-3 w-3 text-green-500" />
                                <span>SMS: To auto-verify your login</span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2 text-right">
                        <p className="text-xs font-bold text-gray-900">Confused? / परेशानी हो रही है?</p>
                        <button className="bg-gray-900 text-white px-6 py-3 rounded-xl flex items-center gap-2 font-bold text-sm hover:bg-black transition-colors shadow-lg">
                            <HelpCircle className="h-4 w-4" />
                            Get Voice Help
                        </button>
                    </div>
                </div>

                <div className="text-center pt-8 pb-4">
                    <p className="text-[10px] text-gray-400">© 2024 Mandi Market Platform. All rights reserved.</p>
                    <div className="flex justify-center gap-4 mt-2 text-[10px] text-gray-400">
                        <a href="#" className="hover:text-gray-600">Privacy Policy</a>
                        <a href="#" className="hover:text-gray-600">Terms of Service</a>
                    </div>
                </div>

            </div>
        </div>
    );
};
