import {
    MapPin,
    TrendingUp,
    FileText,
    BarChart,
    Users,
    MessageSquare,
    Star,
    Sprout,
    Truck,
    ChevronRight
} from 'lucide-react';

export const BuyerDashboard = () => {
    return (
        <div className="flex flex-col gap-8 w-full">

            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-2">
                        Hello, Modern Grains Ltd
                    </h1>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center text-gray-500 font-medium text-sm">
                            <MapPin size={16} className="text-blue-600 mr-1" />
                            Regional Coverage: Western India
                        </div>
                        <span className="text-blue-600 text-xs font-bold px-2 cursor-pointer hover:underline uppercase tracking-wide">
                            Edit Reach
                        </span>
                    </div>
                </div>

                <div className="flex gap-4">
                    <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm w-40">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Buyer Score</p>
                        <div className="flex items-center gap-2 font-bold text-lg text-gray-900">
                            <Star size={16} className="fill-yellow-400 text-yellow-400" /> Gold Tier
                        </div>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm w-40">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Total Sourced</p>
                        <div className="flex items-center gap-2 font-bold text-lg text-gray-900">
                            <BarChart size={16} className="text-blue-600" /> 450 Tons
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left Column (Main Content) */}
                <div className="lg:col-span-2 flex flex-col gap-8">

                    {/* Sourcing Insights */}
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <TrendingUp size={20} className="text-blue-600" />
                            <h2 className="text-xl font-bold text-gray-900">Sourcing Insights</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Insight Card 1 */}
                            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start mb-2">
                                    <span className="text-sm font-medium text-gray-500">Rice: Gondia Mandi</span>
                                    <span className="bg-red-50 text-red-600 text-xs font-bold px-2 py-1 rounded">-2.5%</span>
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-1">₹3,200/quintal</h3>
                                <p className="text-xs text-gray-400">Lowest price in the last 30 days</p>
                            </div>

                            {/* Insight Card 2 */}
                            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start mb-2">
                                    <span className="text-sm font-medium text-gray-500">Soybeans Signal</span>
                                    <TrendingUp size={16} className="text-green-500" />
                                </div>
                                <h3 className="text-2xl font-bold text-green-600 mb-1">Best Time to Buy</h3>
                                <p className="text-xs text-gray-400">Inventory cycles suggest upcoming price hike</p>
                            </div>
                        </div>
                    </div>

                    {/* Main Action Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Search Sellers */}
                        <div className="bg-blue-600 text-white p-6 rounded-2xl shadow-lg shadow-blue-200 flex flex-col justify-between h-48 cursor-pointer hover:bg-blue-700 transition-colors group">
                            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                                <Users size={20} />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg mb-1">Search for Sellers</h3>
                                <p className="text-xs text-blue-100 opacity-90 leading-relaxed">Find verified suppliers in your region</p>
                            </div>
                        </div>

                        {/* Price Comparison */}
                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between h-48 cursor-pointer hover:border-blue-200 transition-colors group">
                            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
                                <BarChart size={20} />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-gray-900 mb-1">Price Comparison</h3>
                                <p className="text-xs text-gray-500 leading-relaxed">Analyze market trends & history</p>
                            </div>
                        </div>

                        {/* Bulk RFQ */}
                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between h-48 cursor-pointer hover:border-blue-200 transition-colors group">
                            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
                                <FileText size={20} />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-gray-900 mb-1">Bulk RFQ</h3>
                                <p className="text-xs text-gray-500 leading-relaxed">Request quotes from multiple sellers</p>
                            </div>
                        </div>
                    </div>

                    {/* My Offers & Negotiations */}
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <MessageSquare size={20} className="text-blue-600" />
                                <h2 className="text-xl font-bold text-gray-900">My Offers & Negotiations</h2>
                            </div>
                            <button className="text-blue-600 text-sm font-bold hover:underline">View All</button>
                        </div>

                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                            {/* Offer 1 */}
                            <div className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors cursor-pointer border-b border-gray-100">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center">
                                        <Truck size={20} className="text-gray-400" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900">Wheat (50 Tons)</h4>
                                        <p className="text-xs text-gray-500">Farmer Patil • Solapur, MH</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="bg-yellow-50 text-yellow-700 text-xs font-bold px-3 py-1 rounded-full border border-yellow-200">
                                        Waiting for Counter
                                    </span>
                                    <ChevronRight size={16} className="text-gray-400" />
                                </div>
                            </div>

                            {/* Offer 2 */}
                            <div className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors cursor-pointer">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center">
                                        <Sprout size={20} className="text-gray-400" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900">Corn (100 Tons)</h4>
                                        <p className="text-xs text-gray-500">Sahyadri FPO • Nashik, MH</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="bg-blue-50 text-blue-700 text-xs font-bold px-3 py-1 rounded-full border border-blue-200">
                                        Price Locked
                                    </span>
                                    <ChevronRight size={16} className="text-gray-400" />
                                </div>
                            </div>
                        </div>
                    </div>

                </div>

                {/* Right Column (Sidebar) */}
                <div className="space-y-8">

                    {/* Market Signals */}
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <div className="bg-blue-100 p-1.5 rounded-full">
                                <TrendingUp size={16} className="text-blue-600" />
                            </div>
                            <h2 className="text-lg font-bold text-gray-900">Market Signals</h2>
                        </div>

                        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-6">
                            {/* Signal 1 */}
                            <div className="flex gap-3">
                                <div className="mt-1.5 w-2 h-2 rounded-full bg-blue-500 shrink-0"></div>
                                <div>
                                    <h4 className="font-bold text-sm text-gray-900">New Onion harvest arriving in Nashik</h4>
                                    <p className="text-xs text-gray-500 mt-1 leading-relaxed">50+ new verified listings added in the last 4 hours.</p>
                                </div>
                            </div>

                            {/* Signal 2 */}
                            <div className="flex gap-3">
                                <div className="mt-1.5 w-2 h-2 rounded-full bg-gray-300 shrink-0"></div>
                                <div>
                                    <h4 className="font-bold text-sm text-gray-900">Logistics Delay: NH48</h4>
                                    <p className="text-xs text-gray-500 mt-1 leading-relaxed">Expect 12h delay for shipments from Gujarat due to weather.</p>
                                </div>
                            </div>

                            {/* Signal 3 */}
                            <div className="flex gap-3">
                                <div className="mt-1.5 w-2 h-2 rounded-full bg-green-500 shrink-0"></div>
                                <div>
                                    <h4 className="font-bold text-sm text-gray-900">MSP Announcement Pending</h4>
                                    <p className="text-xs text-gray-500 mt-1 leading-relaxed">Government to update pulses MSP by Friday. Watch for price volatility.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Saved Sellers */}
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <Users size={18} className="text-blue-600" />
                                <h2 className="text-lg font-bold text-gray-900">Saved Sellers</h2>
                            </div>
                            <button className="text-blue-600 text-xs font-bold hover:underline">Edit</button>
                        </div>

                        <div className="space-y-3">
                            {/* Seller 1 */}
                            <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gray-100 overflow-hidden">
                                        <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80" alt="K. Singh" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-sm text-gray-900">K. Singh</h4>
                                        <div className="flex items-center gap-1 text-[10px] text-gray-500 font-bold uppercase">
                                            <Star size={10} className="fill-yellow-400 text-yellow-400" /> 4.9 • 12 Listings
                                        </div>
                                    </div>
                                </div>
                                <MessageSquare size={18} className="text-blue-600 cursor-pointer" />
                            </div>

                            {/* Seller 2 */}
                            <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-green-800 text-white flex items-center justify-center text-xs font-bold">
                                        RG
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-sm text-gray-900">Royal Grains Agency</h4>
                                        <div className="flex items-center gap-1 text-[10px] text-gray-500 font-bold uppercase">
                                            <Star size={10} className="fill-yellow-400 text-yellow-400" /> 4.7 • 8 Active
                                        </div>
                                    </div>
                                </div>
                                <MessageSquare size={18} className="text-blue-600 cursor-pointer" />
                            </div>
                        </div>

                    </div>

                </div>

            </div>
        </div>
    );
};
