import {
    Search,
    Settings,
    HelpCircle,
    CheckCircle,
    TrendingUp,
    AlertCircle,
    ArrowRight,
    Info
} from 'lucide-react';

export const AlertsPage = () => {
    return (
        <div className="flex flex-col gap-6 w-full h-[calc(100vh-8rem)]">

            {/* Header */}
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Alerts & Notifications</h1>
                <button className="text-sm font-bold text-gray-500 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg transition-colors">
                    Mark All as Read
                </button>
            </div>

            {/* Search & Content Wrapper */}
            <div className="flex gap-8 h-full overflow-hidden">

                {/* Left Column: Alerts List */}
                <div className="flex-1 flex flex-col gap-6 overflow-hidden">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search notifications..."
                            className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                        />
                    </div>

                    {/* Tabs */}
                    <div className="flex bg-gray-100 p-1 rounded-xl shrink-0">
                        <button className="flex-1 bg-white shadow-sm text-gray-900 font-bold py-2.5 rounded-lg text-sm">Price Alerts (3)</button>
                        <button className="flex-1 text-gray-500 font-bold py-2.5 rounded-lg text-sm hover:bg-gray-200/50">Deal Updates (2)</button>
                        <button className="flex-1 text-gray-500 font-bold py-2.5 rounded-lg text-sm hover:bg-gray-200/50">System (1)</button>
                    </div>

                    {/* Scrollable List */}
                    <div className="flex-1 overflow-y-auto space-y-4 pr-2">

                        {/* Alert 1: Price Reach (Active) */}
                        <div className="bg-white p-5 rounded-2xl border-2 border-blue-500 shadow-md relative overflow-hidden group cursor-pointer">
                            <div className="flex justify-between items-start gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <TrendingUp size={18} className="text-green-600" />
                                        <h3 className="font-bold text-gray-900">Wheat price reached your target of ₹2,500 at Nagpur Mandi</h3>
                                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                    </div>
                                    <p className="text-xs text-gray-500 font-medium mb-4">5 minutes ago • Market Alert</p>
                                    <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg text-xs flex items-center gap-1 transition-colors z-10 relative">
                                        View Price <ArrowRight size={14} />
                                    </button>
                                </div>
                                <div className="w-24 h-16 bg-blue-900/10 rounded-lg overflow-hidden shrink-0 border border-blue-100">
                                    {/* Simulated chart thumbnail */}
                                    <svg viewBox="0 0 100 60" className="w-full h-full">
                                        <polyline points="0,50 20,45 40,30 60,40 80,15 100,5" fill="none" stroke="#2563eb" strokeWidth="2" />
                                        <polygon points="0,50 20,45 40,30 60,40 80,15 100,5 100,60 0,60" fill="#2563eb" fillOpacity="0.1" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {/* Alert 2: Deal Update (Crucial) */}
                        <div className="bg-red-50 p-5 rounded-2xl border border-red-100 shadow-sm relative group cursor-pointer">
                            <div className="absolute top-5 right-5 w-2 h-2 bg-red-400 rounded-full"></div>
                            <div className="flex items-start gap-3">
                                <div className="mt-0.5">
                                    <AlertCircle size={20} className="text-red-500" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900">New offer from Raj Traders for Soybeans</h3>
                                    <p className="text-xs text-gray-500 font-medium mt-1 mb-3">42 minutes ago • Trade Update</p>
                                    <button className="bg-white border border-red-200 text-red-600 hover:bg-red-50 font-bold py-2 px-4 rounded-lg text-xs transition-colors">
                                        Respond Now
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Alert 3: System (Read) */}
                        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm cursor-pointer hover:border-gray-200">
                            <div className="flex items-start gap-3">
                                <div className="mt-0.5">
                                    <CheckCircle size={20} className="text-blue-500" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900">Profile Verification Successful</h3>
                                    <p className="text-xs text-gray-500 font-medium mt-1">2 hours ago • System</p>
                                    <p className="text-sm text-gray-600 mt-2">Your KYC documents have been verified. You can now start bidding on high-value trades.</p>
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* Footer Links */}
                    <div className="flex justify-between items-center text-xs text-gray-500 pt-4 border-t border-gray-100 mt-auto shrink-0">
                        <div className="flex gap-4">
                            <button className="flex items-center gap-1 hover:text-blue-600 font-bold"><Settings size={14} /> Notification Settings</button>
                            <button className="flex items-center gap-1 hover:text-blue-600 font-bold"><HelpCircle size={14} /> Help Center</button>
                        </div>
                        <span>Need help with price triggers? <a href="#" className="text-blue-600 hover:underline">Read the guide</a></span>
                    </div>
                </div>

                {/* Right Column: Details Panel */}
                <div className="w-[400px] bg-white rounded-3xl border border-gray-100 p-6 shadow-lg flex flex-col hidden lg:flex shrink-0">
                    <h2 className="text-xl font-extrabold text-gray-900 mb-2">Price Analysis</h2>
                    <p className="text-sm text-gray-500 font-medium mb-6">Wheat (Grade A) • Nagpur Mandi</p>

                    {/* Main Graph Card */}
                    <div className="bg-blue-50/50 rounded-2xl p-6 mb-6">
                        <div className="h-32 w-full relative mb-4">
                            {/* Chart line */}
                            <svg viewBox="0 0 200 100" className="w-full h-full overflow-visible">
                                <path d="M0,80 Q50,80 80,50 T150,30 T200,10" fill="none" stroke="#2563eb" strokeWidth="4" strokeLinecap="round" />
                                <circle cx="150" cy="30" r="4" fill="white" stroke="#2563eb" strokeWidth="2" />
                                <circle cx="200" cy="10" r="4" fill="#2563eb" />
                                {/* Area */}
                                <path d="M0,80 Q50,80 80,50 T150,30 T200,10 V100 H0 Z" fill="#2563eb" fillOpacity="0.1" stroke="none" />
                            </svg>
                            {/* Dotted lines */}
                            <div className="absolute inset-0 border-b border-dashed border-gray-300 top-1/2"></div>
                            <div className="absolute inset-0 border-b border-dashed border-gray-300 top-1/4"></div>
                        </div>
                        <div className="flex justify-between text-[10px] uppercase font-bold text-gray-400">
                            <span>Mon</span>
                            <span>Wed</span>
                            <span>Fri</span>
                            <span>Today</span>
                        </div>
                    </div>

                    <div className="flex gap-4 mb-6">
                        <div className="flex-1 bg-gray-50 rounded-xl p-4">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Target Price</p>
                            <p className="text-xl font-bold text-gray-900">₹2,500</p>
                        </div>
                        <div className="flex-1 bg-green-50 rounded-xl p-4">
                            <p className="text-[10px] font-bold text-green-700 uppercase tracking-widest">Current Price</p>
                            <p className="text-xl font-bold text-green-600">₹2,512</p>
                        </div>
                    </div>

                    <h3 className="font-bold text-gray-900 text-sm mb-4">Trend Summary</h3>
                    <div className="space-y-4 mb-8">
                        <div className="flex gap-3">
                            <div className="mt-0.5"><CheckCircle size={16} className="text-green-500" /></div>
                            <p className="text-sm text-gray-600 font-medium">Price increased by 4.2% in the last 48 hours.</p>
                        </div>
                        <div className="flex gap-3">
                            <div className="mt-0.5"><Info size={16} className="text-blue-500" /></div>
                            <p className="text-sm text-gray-600 font-medium">Arrivals at Nagpur Mandi are 15% lower than yesterday.</p>
                        </div>
                    </div>

                    <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-200 transition-transform active:scale-[0.98] mt-auto">
                        Create Buy Order
                    </button>
                </div>
            </div>
        </div>
    );
};
