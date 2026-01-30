import {
    Users,
    Calendar,
    MessageCircle,
    Search,
    Mic,
    TrendingUp,
    ChevronRight,
    Phone,
    MessageSquare,
    Play,
    Languages,
    ThumbsUp,
    CheckCircle,
    GraduationCap,
    ShieldAlert
} from 'lucide-react';

export const CommunityPage = () => {
    return (
        <div className="flex flex-col lg:flex-row gap-8 w-full">

            {/* Left Sidebar: Navigation */}
            <div className="w-full lg:w-72 shrink-0 flex flex-col gap-6">
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                    <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-4 px-2">Navigation</h3>
                    <div className="space-y-1">
                        <button className="w-full flex items-center gap-3 px-3 py-3 rounded-xl bg-green-50 text-green-700 font-bold text-sm">
                            <Users size={18} /> Community Feed
                        </button>
                        <button className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-gray-50 text-gray-600 font-bold text-sm transition-colors">
                            <Calendar size={18} /> Local Market News
                        </button>
                        <button className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-gray-50 text-gray-600 font-bold text-sm transition-colors">
                            <MessageCircle size={18} /> Expert Q&A
                        </button>
                        <button className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-gray-50 text-gray-600 font-bold text-sm transition-colors">
                            <Search size={18} /> Support Tickets
                        </button>
                    </div>
                </div>

                <div className="bg-[#fff9e6] rounded-2xl p-6 border border-yellow-100">
                    <div className="flex items-center gap-2 mb-4 text-yellow-700">
                        <TrendingUp size={20} />
                        <h3 className="text-sm font-bold uppercase tracking-wider">Local Trends</h3>
                    </div>
                    <div className="space-y-4">
                        <div className="border-l-2 border-yellow-400 pl-3">
                            <p className="text-xs text-yellow-800 font-bold mb-1">Soybean - Nagpur</p>
                            <p className="text-lg font-black text-gray-900">↑ ₹4,850/Quintal</p>
                        </div>
                        <div className="border-l-2 border-yellow-400 pl-3">
                            <p className="text-xs text-yellow-800 font-bold mb-1">Wheat - Vidarbha</p>
                            <p className="text-lg font-black text-gray-900">↓ ₹2,100/Quintal</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Center: Main Content */}
            <div className="flex-1 min-w-0">
                <div className="mb-8">
                    <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Community & Help Center</h1>
                    <p className="text-gray-500 font-medium text-sm">Find answers, share knowledge, and connect with agricultural experts.</p>
                </div>

                {/* Search Bar */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-1 flex items-center gap-2 mb-8">
                    <div className="pl-4 text-gray-400">
                        <Search size={20} />
                    </div>
                    <input
                        type="text"
                        placeholder="Ask a question or search for help..."
                        className="flex-1 py-3 text-sm font-medium focus:outline-none text-gray-900 placeholder:text-gray-400"
                    />
                    <button className="bg-green-600 hover:bg-green-700 text-white font-bold px-6 py-2.5 rounded-lg flex items-center gap-2 transition-colors">
                        <Mic size={18} /> Search
                    </button>
                </div>

                {/* Hero CTA */}
                <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-3xl p-8 mb-8 text-white flex items-center justify-between shadow-lg shadow-green-200">
                    <div>
                        <h2 className="text-xl font-extrabold mb-1">Have a complex farming issue?</h2>
                        <p className="font-medium text-green-50 text-sm">Our experts respond in under 24 hours.</p>
                    </div>
                    <button className="bg-white text-green-700 font-bold px-5 py-3 rounded-xl flex items-center gap-2 shadow-lg hover:bg-gray-50 transition-colors">
                        <MessageCircle size={18} /> Ask via Voice
                    </button>
                </div>

                {/* Feed Section */}
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-gray-900">Recent Community Activity</h2>
                    <div className="flex bg-gray-100 rounded-lg p-1">
                        <button className="px-3 py-1 text-xs font-bold text-gray-600 hover:text-gray-900">Popular</button>
                        <button className="px-3 py-1 text-xs font-bold bg-green-500 text-white rounded-md shadow-sm">Latest</button>
                    </div>
                </div>

                <div className="space-y-6">
                    {/* Post 1 */}
                    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                        <div className="flex items-start gap-4 mb-4">
                            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 overflow-hidden">
                                <img src="https://images.unsplash.com/photo-1542206395-9feb3edaa68d?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80" alt="User" className="w-full h-full object-cover" />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 text-sm">Rahul Deshmukh</h3>
                                <p className="text-xs text-gray-500">2 hours ago • Nagpur, MH</p>
                            </div>
                        </div>
                        <h4 className="font-bold text-gray-900 mb-2">Tips for Soybean harvesting this season</h4>
                        <p className="text-gray-600 text-sm leading-relaxed mb-4">
                            Early morning harvesting helps retain moisture and prevents shattering. Make sure your combine settings are calibrated for the dry spell we're having...
                        </p>

                        <div className="flex flex-wrap items-center justify-between gap-4">
                            <div className="flex gap-2">
                                <button className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-xs font-bold hover:bg-green-100 transition-colors">
                                    <Play size={14} fill="currentColor" /> Listen
                                </button>
                                <button className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-xs font-bold hover:bg-gray-200 transition-colors">
                                    <Languages size={14} /> Translate
                                </button>
                            </div>
                            <div className="flex items-center gap-4 text-gray-400 text-xs font-bold">
                                <span className="flex items-center gap-1"><ThumbsUp size={14} /> 42</span>
                                <span className="flex items-center gap-1"><MessageSquare size={14} /> 12</span>
                            </div>
                        </div>
                    </div>

                    {/* Post 2 */}
                    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                        <div className="flex items-start gap-4 mb-4">
                            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 overflow-hidden">
                                <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80" alt="User" className="w-full h-full object-cover" />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 text-sm">Priya Patil</h3>
                                <p className="text-xs text-gray-500">5 hours ago • Wardha</p>
                            </div>
                        </div>
                        <h4 className="font-bold text-gray-900 mb-2">New transport cooperative forming in Nagpur</h4>
                        <p className="text-gray-600 text-sm leading-relaxed mb-4">
                            We are looking for 10 more farmers to join our logistics collective to reduce shipping costs to the APMC market. DM me if interested!
                        </p>

                        <div className="flex flex-wrap items-center justify-between gap-4">
                            <div className="flex gap-2">
                                <button className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-xs font-bold hover:bg-green-100 transition-colors">
                                    <Play size={14} fill="currentColor" /> Listen
                                </button>
                                <button className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-xs font-bold hover:bg-gray-200 transition-colors">
                                    <Languages size={14} /> Translate
                                </button>
                            </div>
                            <div className="flex items-center gap-4 text-gray-400 text-xs font-bold">
                                <span className="flex items-center gap-1"><ThumbsUp size={14} /> 105</span>
                                <span className="flex items-center gap-1"><MessageSquare size={14} /> 28</span>
                            </div>
                        </div>
                    </div>

                    {/* Expert Answered Question */}
                    <div className="bg-[#f0fff4] rounded-2xl p-6 border border-green-100">
                        <div className="flex items-center gap-2 mb-4 text-green-700 font-bold">
                            <CheckCircle size={18} /> Expert Answered Recent Questions
                        </div>
                        <h4 className="font-bold text-gray-900 mb-3 block text-base">"Why are my tomato leaves turning yellow with brown spots?"</h4>

                        <div className="bg-white rounded-xl p-4 border border-green-100 flex items-start gap-4">
                            <div className="w-10 h-10 rounded-full bg-green-50 text-green-600 flex items-center justify-center shrink-0">
                                <GraduationCap size={20} />
                            </div>
                            <div>
                                <p className="text-green-600 text-xs font-bold mb-1">Dr. Amol Kulkarni (Agronomist)</p>
                                <p className="text-gray-600 text-sm leading-snug mb-2">
                                    This sounds like Early Blight. Treat with copper-based fungicide and ensure you're not overhead watering...
                                </p>
                                <button className="text-green-700 text-xs font-bold hover:underline">View full expert solution</button>
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            {/* Right Sidebar: Support */}
            <div className="w-full lg:w-80 shrink-0 flex flex-col gap-6">

                {/* Quick Help */}
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                    <h3 className="font-bold text-gray-900 mb-4">Quick Help</h3>
                    <div className="space-y-2">
                        {['Payment not received', 'How to check prices', 'Reset my password'].map((item, i) => (
                            <button key={i} className="w-full flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:border-gray-200 bg-gray-50/50 text-left transition-colors group">
                                <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">{item}</span>
                                <ChevronRight size={16} className="text-gray-300 group-hover:text-gray-500" />
                            </button>
                        ))}
                    </div>
                    <button className="w-full mt-4 text-center text-green-600 font-bold text-sm hover:underline">View All FAQs</button>
                </div>

                {/* Contact Us */}
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                    <h3 className="font-bold text-gray-900 mb-4">Contact Us</h3>
                    <div className="space-y-3">
                        <button className="w-full bg-[#4dff01] hover:bg-[#43db01] text-black font-bold py-3.5 rounded-3xl shadow-lg shadow-green-100 flex items-center justify-center gap-2 transition-transform active:scale-[0.98]">
                            <Phone size={18} fill="currentColor" /> Request a Callback
                        </button>
                        <button className="w-full bg-gray-100 hover:bg-gray-200 text-gray-900 font-bold py-3.5 rounded-3xl transition-colors flex items-center justify-center gap-2">
                            <MessageSquare size={18} fill="currentColor" /> Live Chat
                        </button>
                    </div>
                    <p className="text-center text-[10px] text-gray-400 mt-3 font-medium">Average wait time: 2 mins</p>
                </div>

                {/* Guidelines */}
                <div className="border border-blue-100 bg-blue-50/50 rounded-2xl p-6 border-dashed">
                    <div className="flex items-center gap-2 mb-2 text-green-600">
                        <ShieldAlert size={16} />
                        <h3 className="text-xs font-bold uppercase tracking-wider">Guidelines</h3>
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed">
                        Help us keep AgriMarket safe. Practice <span className="font-bold text-green-600">Fair Trade</span> and always use <span className="font-bold text-green-600">Respectful Communication</span>. Report any suspicious activity immediately.
                    </p>
                    <div className="mt-4 pt-4 border-t border-blue-100 border-dashed text-[10px] text-gray-400 text-center">
                        <a href="#" className="underline hover:text-gray-600">Privacy Policy</a> • <a href="#" className="underline hover:text-gray-600">Terms of Service</a>
                    </div>
                </div>

            </div>
        </div>
    );
};
