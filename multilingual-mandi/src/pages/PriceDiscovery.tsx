import {
    Search,
    Mic,
    MapPin,
    Filter,
    ArrowUpRight,
    ArrowDownRight,
    TrendingUp,
    Activity,
    Star,
    ChevronRight,
    Bell,
    MessageSquare
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const PriceDiscovery = () => {
    const navigate = useNavigate();
    return (
        <div className="flex flex-col gap-8 w-full">

            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-2">
                        Price Discovery
                    </h1>
                    <div className="flex items-center text-sm font-medium text-gray-500">
                        <MapPin size={16} className="text-green-600 mr-1" />
                        Current Location: <span className="text-gray-900 font-bold mx-1">Nagpur Mandi</span> • Last updated: 5 mins ago
                    </div>
                </div>

                <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold px-4 py-2 rounded-lg text-sm transition-colors">
                    Change Location
                </button>
            </div>

            {/* Search & Filters */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-green-600" size={20} />
                    <input
                        type="text"
                        placeholder="Search commodities (e.g. Wheat, Sovabean)"
                        className="w-full pl-12 pr-12 py-3.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 shadow-sm text-base font-medium"
                    />
                    <Mic className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer hover:text-green-600" size={20} />
                </div>

                <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
                    <button className="bg-green-500 text-white font-bold px-6 py-3 rounded-xl shadow-sm hover:bg-green-600 transition-colors whitespace-nowrap flex items-center gap-2">
                        Grains <ChevronRight size={16} className="rotate-90" />
                    </button>
                    <button className="bg-gray-100 text-gray-700 font-bold px-6 py-3 rounded-xl hover:bg-gray-200 transition-colors whitespace-nowrap flex items-center gap-2">
                        Vegetables <ChevronRight size={16} className="rotate-90" />
                    </button>
                    <button className="bg-gray-100 text-gray-700 font-bold px-6 py-3 rounded-xl hover:bg-gray-200 transition-colors whitespace-nowrap flex items-center gap-2">
                        Fruits <ChevronRight size={16} className="rotate-90" />
                    </button>
                    <button className="bg-white border border-gray-200 text-gray-700 font-bold px-6 py-3 rounded-xl hover:bg-gray-50 transition-colors whitespace-nowrap flex items-center gap-2">
                        More Filters <Filter size={16} />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Main Content (Left 2/3) */}
                <div className="lg:col-span-2 flex flex-col gap-8">

                    {/* Hero Commodity Card */}
                    <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col md:flex-row gap-6">
                        <div className="w-full md:w-1/3 h-48 md:h-auto rounded-2xl overflow-hidden relative group">
                            <img
                                src="https://images.unsplash.com/photo-1574943320219-553eb213f72d?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
                                alt="Wheat"
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                            <div className="absolute top-3 left-3 bg-green-100 text-green-800 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">
                                Fair Price
                            </div>
                        </div>

                        <div className="flex-1 flex flex-col justify-between py-2">
                            <div>
                                <div className="flex justify-between items-start mb-2">
                                    <h2 className="text-3xl font-extrabold text-gray-900">Wheat (Lokwan)</h2>
                                    <div className="text-right">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Average Price</p>
                                        <p className="text-3xl font-bold text-green-600">₹2,350</p>
                                        <p className="text-xs text-gray-500">per quintal</p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-4">
                                <p className="text-sm text-gray-500 font-bold mb-1">Market Price Range</p>
                                <p className="text-xl font-bold text-gray-900">₹2,200 - ₹2,500</p>
                            </div>

                            <div className="flex gap-2 mt-6">
                                <button
                                    onClick={() => navigate('/dashboard/deals')}
                                    className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-xl shadow-lg shadow-green-200 transition-transform active:scale-95 flex items-center justify-center gap-2"
                                >
                                    <MessageSquare size={20} />
                                    Start Negotiation
                                </button>
                                <button className="flex-1 bg-green-50 hover:bg-green-100 text-green-700 font-bold py-3 px-6 rounded-xl transition-colors flex items-center justify-center gap-2">
                                    <Activity size={20} />
                                    History
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Nearby Mandi Comparison */}
                        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
                            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <ArrowUpRight size={20} className="text-green-500" />
                                Nearby Mandi Comparison
                            </h3>

                            <div className="space-y-4">
                                {/* Mandi 1 */}
                                <div className="flex justify-between items-center pb-4 border-b border-gray-50">
                                    <div>
                                        <p className="font-bold text-gray-900">Nagpur Mandi</p>
                                        <p className="text-xs text-gray-400 font-bold">0 km away</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-gray-900">₹2,350</p>
                                        <p className="text-xs font-bold text-green-500 flex items-center justify-end gap-0.5">
                                            <TrendingUp size={10} /> ~2.4%
                                        </p>
                                    </div>
                                </div>

                                {/* Mandi 2 */}
                                <div className="flex justify-between items-center pb-4 border-b border-gray-50">
                                    <div>
                                        <p className="font-bold text-gray-900">Amravati Mandi</p>
                                        <p className="text-xs text-gray-400 font-bold">150 km away</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-gray-900">₹2,290</p>
                                        <p className="text-xs font-bold text-red-500 flex items-center justify-end gap-0.5">
                                            <ArrowDownRight size={10} /> ~1.2%
                                        </p>
                                    </div>
                                </div>

                                {/* Mandi 3 */}
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="font-bold text-gray-900">Wardha Mandi</p>
                                        <p className="text-xs text-gray-400 font-bold">75 km away</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-gray-900">₹2,410</p>
                                        <p className="text-xs font-bold text-green-500 flex items-center justify-end gap-0.5">
                                            <TrendingUp size={10} /> ~3.8%
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* AI Signal */}
                        <div className="bg-green-50 rounded-3xl p-6 border border-green-100 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                <Activity size={100} className="text-green-600" />
                            </div>

                            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2 relative z-10">
                                <Activity size={20} className="text-green-600" />
                                AI Market Signal
                            </h3>

                            <div className="flex flex-col items-center justify-center py-4 relative z-10">
                                {/* Gauge simulation */}
                                <div className="w-32 h-32 rounded-full border-[12px] border-green-200 border-t-green-500 border-r-green-500 flex items-center justify-center rotate-[-45deg] shadow-inner mb-4">
                                    <div className="rotate-[45deg] text-center">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase">Signal</p>
                                        <p className="text-2xl font-black text-gray-900 leading-none">HIGH</p>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase">Demand</p>
                                    </div>
                                </div>

                                <p className="text-sm font-medium text-center text-gray-700 italic">
                                    "Prices likely to rise this week due to low arrivals in neighboring districts."
                                </p>

                                <button className="mt-4 text-green-700 text-xs font-bold flex items-center gap-1 hover:underline">
                                    Learn More <ChevronRight size={12} />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Weekly Price Trend */}
                    <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">Weekly Price Trend</h3>
                                <p className="text-xs text-gray-400 font-bold">Wheat - Nagpur Mandi</p>
                            </div>
                            <button className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-green-600 text-xs font-bold hover:bg-green-50 transition-colors">
                                <Bell size={14} /> Set Price Alert
                            </button>
                        </div>

                        {/* Graph Placeholder */}
                        <div className="h-48 w-full flex items-end justify-between px-2 relative">
                            {/* SVG Line Graph */}
                            <svg className="absolute inset-x-0 bottom-0 h-40 w-full" preserveAspectRatio="none">
                                <path
                                    d="M0,100 C50,100 100,110 200,80 C300,50 400,90 500,60 C600,30 700,20 800,10"
                                    fill="none"
                                    stroke="#22c55e"
                                    strokeWidth="6"
                                    strokeLinecap="round"
                                />
                                <path
                                    d="M0,100 C50,100 100,110 200,80 C300,50 400,90 500,60 C600,30 700,20 800,10 L800,200 L0,200 Z"
                                    fill="url(#gradient)"
                                    fillOpacity="0.1"
                                />
                                <defs>
                                    <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                        <stop offset="0%" stopColor="#22c55e" />
                                        <stop offset="100%" stopColor="white" />
                                    </linearGradient>
                                </defs>
                            </svg>

                            {/* X-Axis Labels */}
                            {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map(d => (
                                <span key={d} className="text-[10px] font-bold text-green-800 z-10 bg-white/50 px-1 rounded">{d}</span>
                            ))}
                        </div>
                    </div>

                </div>

                {/* Right Sidebar (1/3) */}
                <div className="flex flex-col gap-8">

                    {/* Sellers Nearby */}
                    <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold text-gray-900">Sellers Nearby</h3>
                            <button className="text-green-600 text-xs font-bold hover:underline">See All</button>
                        </div>

                        <div className="space-y-6">
                            {/* Seller 1 */}
                            <div>
                                <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gray-100 overflow-hidden">
                                        <img src="https://images.unsplash.com/photo-1595661608226-e41c2c31c944?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80" alt="Ramesh" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between">
                                            <h4 className="font-bold text-sm text-gray-900">Ramesh Patil</h4>
                                            <span className="font-bold text-green-600 text-sm">₹2,380</span>
                                        </div>
                                        <div className="flex items-center gap-1 text-[10px] text-gray-500 font-bold uppercase mt-1">
                                            <div className="flex text-yellow-400"><Star size={10} fill="currentColor" /></div>
                                            (4.2)
                                        </div>
                                        <p className="text-[10px] text-gray-400 font-medium mt-0.5">Stock: 45 quintals</p>
                                    </div>
                                </div>
                            </div>

                            {/* Seller 2 */}
                            <div>
                                <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center text-white text-[10px] uppercase font-bold">
                                        AT
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between">
                                            <h4 className="font-bold text-sm text-gray-900">Agro Traders Ltd</h4>
                                            <span className="font-bold text-green-600 text-sm">₹2,365</span>
                                        </div>
                                        <div className="flex items-center gap-1 text-[10px] text-gray-500 font-bold uppercase mt-1">
                                            <div className="flex text-yellow-400"><Star size={10} fill="currentColor" /></div>
                                            (3.9)
                                        </div>
                                        <p className="text-[10px] text-gray-400 font-medium mt-0.5">Stock: 120 quintals</p>
                                    </div>
                                </div>
                            </div>

                            {/* Seller 3 */}
                            <div>
                                <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gray-100 overflow-hidden">
                                        <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80" alt="Sunil" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between">
                                            <h4 className="font-bold text-sm text-gray-900">Sunil Deshmukh</h4>
                                            <span className="font-bold text-green-600 text-sm">₹2,400</span>
                                        </div>
                                        <div className="flex items-center gap-1 text-[10px] text-gray-500 font-bold uppercase mt-1">
                                            <div className="flex text-yellow-400"><Star size={10} fill="currentColor" /></div>
                                            (4.9)
                                        </div>
                                        <p className="text-[10px] text-gray-400 font-medium mt-0.5">Stock: 15 quintals</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <button className="w-full mt-6 bg-green-50 hover:bg-green-100 text-green-700 font-bold py-3 rounded-xl transition-colors text-sm">
                            View All Nearby Sellers
                        </button>
                    </div>

                    {/* Live Activity */}
                    <div className="bg-[#132210] rounded-3xl p-6 shadow-lg text-white">
                        <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                            <Activity size={20} className="text-green-500 animate-pulse" />
                            Live Activity
                        </h3>

                        <div className="space-y-6 relative">
                            {/* Vertical Line */}
                            <div className="absolute left-1.5 top-2 bottom-2 w-0.5 bg-green-900/50"></div>

                            {/* Event 1 */}
                            <div className="relative pl-6">
                                <div className="absolute left-0 top-1.5 w-3 h-3 bg-green-500 rounded-full ring-4 ring-green-900/50"></div>
                                <p className="text-sm font-bold text-white">10 Tons Wheat sold in Nagpur</p>
                                <p className="text-[10px] font-bold text-green-400 mt-1 uppercase tracking-wider">Just now</p>
                            </div>

                            {/* Event 2 */}
                            <div className="relative pl-6">
                                <div className="absolute left-0 top-1.5 w-3 h-3 bg-green-500/50 rounded-full"></div>
                                <p className="text-sm font-medium text-gray-300">Soyabean price up by ₹50 in Wardha</p>
                                <p className="text-[10px] font-bold text-gray-500 mt-1 uppercase tracking-wider">2 mins ago</p>
                            </div>

                            {/* Event 3 */}
                            <div className="relative pl-6">
                                <div className="absolute left-0 top-1.5 w-3 h-3 bg-gray-700 rounded-full"></div>
                                <p className="text-sm font-medium text-gray-400">New seller registered in Akola</p>
                                <p className="text-[10px] font-bold text-gray-600 mt-1 uppercase tracking-wider">15 mins ago</p>
                            </div>
                        </div>
                    </div>

                </div>

            </div>
        </div>
    );
};
