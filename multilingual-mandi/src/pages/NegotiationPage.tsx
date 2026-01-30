
import {
    MoreVertical,
    Phone,
    Mic,
    Play,
    CheckCircle,
    RotateCcw,
    XCircle,
    Plus,
    Send,
    Languages,
    ShieldCheck,
    MapPin,
    Package,
    Truck,
    IndianRupee,
    Bot
} from 'lucide-react';

export const NegotiationPage = () => {
    return (
        <div className="h-[calc(100vh-8rem)] flex gap-6">

            {/* Left Sidebar: Active Deals List */}
            <div className="w-80 bg-white rounded-2xl border border-gray-100 flex flex-col hidden md:flex shrink-0">
                <div className="p-4 border-b border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold text-gray-900">Active Deals</h2>
                        <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full">12 ACTIVE</span>
                    </div>
                    <div className="flex bg-gray-100 p-1 rounded-lg">
                        <button className="flex-1 bg-green-500 text-white font-bold text-xs py-2 rounded-md shadow-sm">Your Turn</button>
                        <button className="flex-1 text-gray-500 font-bold text-xs py-2 hover:bg-white/50 rounded-md">All</button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {/* Deal Item 1 (Active) */}
                    <div className="p-4 border-b border-gray-50 bg-green-50/50 border-l-4 border-l-green-500 cursor-pointer">
                        <div className="flex justify-between items-start mb-1">
                            <p className="text-[10px] font-bold text-green-600 uppercase">Action Needed</p>
                            <span className="text-[10px] text-gray-400">2m ago</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
                                <img src="https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80" alt="Raj" className="w-full h-full object-cover" />
                            </div>
                            <div>
                                <h4 className="font-bold text-sm text-gray-900">Raj Traders</h4>
                                <p className="text-xs text-gray-500">Soybean - 50 Quintals</p>
                            </div>
                        </div>
                        <p className="mt-2 text-xs font-bold text-gray-900 pl-[52px]">Last: ₹2,400</p>
                    </div>

                    {/* Deal Item 2 */}
                    <div className="p-4 border-b border-gray-50 hover:bg-gray-50 cursor-pointer">
                        <div className="flex justify-between items-start mb-1">
                            <p className="text-[10px] font-bold text-gray-400 uppercase">Waiting</p>
                            <span className="text-[10px] text-gray-400">1h ago</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
                                <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80" alt="Kisan" className="w-full h-full object-cover" />
                            </div>
                            <div>
                                <h4 className="font-bold text-sm text-gray-900">Kisan Corp</h4>
                                <p className="text-xs text-gray-500">Wheat - 100 Quintals</p>
                            </div>
                        </div>
                        <p className="mt-2 text-xs font-bold text-gray-900 pl-[52px]">Last: ₹2,100</p>
                    </div>

                    {/* Deal Item 3 */}
                    <div className="p-4 border-b border-gray-50 hover:bg-gray-50 cursor-pointer">
                        <div className="flex justify-between items-start mb-1">
                            <p className="text-[10px] font-bold text-gray-400 uppercase">Waiting</p>
                            <span className="text-[10px] text-gray-400">3h ago</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
                                <img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80" alt="GreenField" className="w-full h-full object-cover" />
                            </div>
                            <div>
                                <h4 className="font-bold text-sm text-gray-900">GreenField Ltd</h4>
                                <p className="text-xs text-gray-500">Maize - 150 Quintals</p>
                            </div>
                        </div>
                        <p className="mt-2 text-xs font-bold text-gray-900 pl-[52px]">Last: ₹1,850</p>
                    </div>
                </div>
            </div>

            {/* Center: Main Chat Area */}
            <div className="flex-1 bg-white rounded-2xl border border-gray-100 flex flex-col overflow-hidden shadow-sm">
                {/* Chat Header */}
                <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white z-10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-green-100">
                            <img src="https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80" alt="Raj" className="w-full h-full object-cover" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="font-bold text-gray-900">Raj Traders</h2>
                                <span className="text-xs text-yellow-500 font-bold">★ 4.5</span>
                            </div>
                            <p className="text-xs text-green-600 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span> Online
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 text-gray-400">
                        <Phone size={20} className="hover:text-green-600 cursor-pointer" />
                        <MoreVertical size={20} className="hover:text-gray-600 cursor-pointer" />
                    </div>
                </div>

                {/* Chat Messages */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/50">
                    <div className="flex justify-center">
                        <span className="bg-gray-200 text-gray-600 text-[10px] font-bold px-3 py-1 rounded-full">MONDAY, OCT 23</span>
                    </div>

                    {/* Message 1: Translation */}
                    <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full overflow-hidden mt-1 shrink-0">
                            <img src="https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80" alt="Raj" className="w-full h-full object-cover" />
                        </div>
                        <div className="max-w-[80%]">
                            <div className="bg-white p-4 rounded-2xl rounded-tl-none border border-gray-100 shadow-sm">
                                <p className="text-gray-900 font-medium mb-2">नमस्कार, क्या हम सोयाबीन की कीमत पर फिर से चर्चा कर सकते हैं?</p>
                                <p className="text-xs text-gray-500 italic flex items-center gap-1 border-t border-gray-100 pt-2">
                                    <Languages size={12} /> "Hello, can we discuss the price of soybean again?"
                                </p>
                            </div>
                            <span className="text-[10px] text-gray-400 ml-1 mt-1 block">10:42 AM</span>
                        </div>
                    </div>

                    {/* Message 2: Voice Note */}
                    <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full overflow-hidden mt-1 shrink-0">
                            <img src="https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80" alt="Raj" className="w-full h-full object-cover" />
                        </div>
                        <div className="max-w-[80%]">
                            <div className="bg-white p-3 rounded-2xl rounded-tl-none border border-gray-100 shadow-sm flex items-center gap-3 w-64">
                                <button className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white shrink-0 hover:bg-green-600 transition-colors">
                                    <Play size={14} fill="currentColor" />
                                </button>
                                <div className="flex-1">
                                    <div className="h-6 flex items-center gap-0.5">
                                        {[3, 5, 8, 4, 6, 9, 5, 3, 6, 8, 4, 3, 5].map((h, i) => (
                                            <div key={i} className={`w-1 bg-green-500 rounded-full`} style={{ height: `${h * 3}px` }}></div>
                                        ))}
                                        <div className="w-1 bg-gray-300 h-2 rounded-full"></div>
                                        <div className="w-1 bg-gray-300 h-2 rounded-full"></div>
                                    </div>
                                </div>
                                <span className="text-xs font-bold text-gray-500">0:12</span>
                            </div>
                            <span className="text-[10px] text-gray-400 ml-1 mt-1 block">10:43 AM</span>
                        </div>
                    </div>

                    {/* Message 3: Counter Offer (My Side) */}
                    <div className="flex justify-end items-start gap-3">
                        <div className="max-w-[80%]">
                            <div className="bg-[#4dff01] p-0 rounded-2xl rounded-tr-none shadow-sm overflow-hidden text-black">
                                <div className="p-4">
                                    <p className="text-xs font-black uppercase opacity-70 mb-1">Price Offer</p>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-3xl font-black">₹2,350</span>
                                        <span className="text-sm font-bold opacity-80">/ quintal</span>
                                    </div>
                                    <p className="text-xs font-medium mt-2 opacity-90">Based on current transport rates from Indore.</p>
                                </div>
                            </div>
                            <span className="text-[10px] text-gray-400 mr-1 mt-1 block text-right">11:15 AM • Read</span>
                        </div>
                        <div className="w-8 h-8 rounded-full overflow-hidden mt-1 shrink-0 bg-gray-300">
                            <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80" alt="Me" className="w-full h-full object-cover" />
                        </div>
                    </div>

                    {/* Message 4: New Counter Wrapper */}
                    <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full overflow-hidden mt-1 shrink-0">
                            <img src="https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80" alt="Raj" className="w-full h-full object-cover" />
                        </div>
                        <div className="max-w-[90%] w-full">
                            <div className="bg-white border-2 border-green-500 p-6 rounded-2xl rounded-tl-none shadow-md relative">
                                <p className="text-xs font-bold text-green-600 uppercase mb-2">New Counter-Offer</p>
                                <div className="flex items-baseline gap-2 mb-2">
                                    <span className="text-4xl font-black text-gray-900">₹2,400</span>
                                    <span className="text-sm text-gray-500 font-bold">/ quintal</span>
                                </div>
                                <p className="text-sm text-gray-600">I have high quality grade-A beans this season. 2,400 is fair.</p>
                            </div>
                            <span className="text-[10px] text-gray-400 ml-1 mt-1 block">Just now</span>
                        </div>
                    </div>

                </div>

                {/* Action Bar */}
                <div className="p-4 bg-white border-t border-gray-100">
                    <div className="flex gap-3 mb-4">
                        <button className="flex-1 bg-[#4dff01] hover:bg-[#43db01] text-black font-black py-4 rounded-xl shadow-lg shadow-green-100 flex items-center justify-center gap-2 transition-transform active:scale-[0.98]">
                            <CheckCircle size={20} />
                            <div className="text-left leading-none">
                                <span className="block text-sm">Accept Offer</span>
                                <span className="block text-[10px] opacity-80">(₹1,20,000 Total)</span>
                            </div>
                        </button>
                        <button className="flex-1 bg-white border-2 border-gray-200 hover:border-gray-300 text-gray-700 font-bold py-3 rounded-xl transition-colors">
                            Make Counter-Offer
                        </button>
                        <button className="px-4 border-2 border-red-100 text-red-500 rounded-xl hover:bg-red-50 transition-colors">
                            <XCircle size={24} />
                        </button>
                    </div>

                    {/* Input Area */}
                    <div className="relative bg-gray-100 rounded-xl flex items-center p-2">
                        <button className="p-2 text-gray-400 hover:text-green-600 transition-colors">
                            <Plus size={24} />
                        </button>
                        <input
                            type="text"
                            placeholder="Type a message or use Hindi/Marathi..."
                            className="flex-1 bg-transparent border-none focus:outline-none px-2 font-medium text-gray-700"
                        />
                        <div className="flex items-center gap-2 pr-2">
                            <button className="p-2 text-gray-500 hover:text-green-600 transition-colors">
                                <Mic size={20} />
                            </button>
                            <button className="p-2 text-green-600 hover:text-green-700 transition-colors">
                                <Send size={20} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Sidebar: AI Assistant & Deal Info */}
            <div className="w-80 flex flex-col gap-6 hidden xl:flex shrink-0">

                {/* AI Assistant Card */}
                <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-gray-900 flex items-center gap-2">
                            <Bot size={18} className="text-green-600" />
                            AI Negotiation Assistant
                        </h3>
                        <span className="bg-green-100 p-1 rounded-md text-green-700 cursor-pointer">
                            <Package size={14} />
                        </span>
                    </div>

                    <div className="space-y-3 mb-6">
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-500 font-bold">Current Offer</span>
                            <span className="font-bold text-gray-900">₹2,400</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-500 font-bold">Market Avg</span>
                            <span className="font-bold text-yellow-600">₹2,350</span>
                        </div>
                    </div>

                    {/* Demand Gauge Viz */}
                    <div className="flex gap-1 h-8 mb-4">
                        <div className="flex-1 bg-gray-200 rounded-sm"></div>
                        <div className="flex-1 bg-gray-200 rounded-sm"></div>
                        <div className="flex-1 bg-[#baff99] rounded-sm"></div>
                        <div className="flex-1 bg-[#4dff01] rounded-sm relative">
                            <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[6px] border-t-gray-800"></div>
                        </div>
                        <div className="flex-1 bg-gray-200 rounded-sm"></div>
                    </div>

                    <div className="bg-green-50 rounded-xl p-3 mb-4">
                        <p className="text-xs text-green-800 leading-relaxed font-medium">
                            Demand is <strong>rising</strong> in the Indore region (+8%). Raj Traders has a <strong>high</strong> reliability score.
                        </p>
                    </div>

                    <button className="w-full bg-[#e0ffce] hover:bg-[#d0ffb5] text-green-800 font-bold py-3 rounded-lg text-xs transition-colors shadow-sm">
                        Suggest Counter: ₹2,425
                    </button>
                </div>

                {/* Deal Summary */}
                <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm flex-1">
                    <h3 className="font-bold text-gray-900 mb-4">Deal Summary</h3>

                    <div className="space-y-6">
                        <div className="flex gap-3">
                            <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 shrink-0">
                                <Package size={16} />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">COMMODITY</p>
                                <p className="font-bold text-gray-900 text-sm">Soybean (Yellow)</p>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 shrink-0">
                                <RotateCcw size={16} />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">QUANTITY</p>
                                <p className="font-bold text-gray-900 text-sm">50 Quintals</p>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 shrink-0">
                                <Truck size={16} />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">DELIVERY TERMS</p>
                                <p className="font-bold text-gray-900 text-sm">Pickup (Seller site)</p>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 shrink-0">
                                <IndianRupee size={16} />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">TOTAL VALUE</p>
                                <p className="font-bold text-green-600 text-lg">₹1,20,000</p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 pt-4 border-t border-gray-100 flex items-center gap-2 text-blue-600">
                        <ShieldCheck size={16} />
                        <span className="text-[10px] font-bold uppercase tracking-wider">ESCROW PROTECTION ACTIVE</span>
                    </div>
                </div>

                {/* Map Placeholder */}
                <div className="h-32 bg-gray-200 rounded-2xl flex items-center justify-center relative overflow-hidden group cursor-pointer">
                    <div className="flex flex-col items-center text-gray-400 group-hover:scale-110 transition-transform">
                        <MapPin size={32} />
                    </div>
                    <div className="absolute bottom-2 left-2 bg-white px-2 py-1 rounded shadow-sm text-[10px] font-bold text-gray-900">
                        Pickup: Indore, MP
                    </div>
                </div>

            </div>

        </div>
    );
};
