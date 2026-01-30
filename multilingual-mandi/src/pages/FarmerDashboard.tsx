import {
    MapPin,
    Star,
    Wallet,
    Mic,
    Plus,
    TrendingUp,
    AlertCircle
} from 'lucide-react';

export const FarmerDashboard = () => {
    return (
        <div className="flex flex-col gap-8 w-full">

            {/* Welcome & Rating Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-2">
                        Namaste, Ramesh
                    </h1>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center text-gray-500 font-medium text-sm">
                            <MapPin size={16} className="text-green-600 mr-1" />
                            Nagpur Mandi
                        </div>
                        <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full font-bold cursor-pointer hover:bg-green-200">
                            Change
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-6 bg-white px-6 py-3 rounded-2xl shadow-sm border border-gray-100">
                    <div className="text-right">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Seller Rating</p>
                        <div className="flex items-center justify-end gap-1 font-bold text-lg text-gray-900">
                            4.8 <Star size={14} className="fill-yellow-400 text-yellow-400" />
                        </div>
                    </div>
                    <div className="w-px h-8 bg-gray-100"></div>
                    <div className="text-right">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Experience</p>
                        <div className="font-bold text-lg text-gray-900">
                            12 Deals
                        </div>
                    </div>
                </div>
            </div>

            {/* Alert Banner */}
            <div className="bg-green-50 border border-green-100 rounded-xl px-4 py-3 flex items-start gap-3">
                <div className="bg-green-100 p-1.5 rounded-full text-green-600 shrink-0 mt-0.5">
                    <AlertCircle size={18} />
                </div>
                <p className="text-sm font-medium text-green-900 leading-snug">
                    <span className="font-bold">Recent Alert:</span> Tomato prices up by 10% in nearby Amravati Mandi. Consider updating your listings.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Main Content Area (Left 2/3) */}
                <div className="lg:col-span-2 flex flex-col gap-8">

                    {/* Highlight Card (Spotlight) */}
                    <div className="relative h-64 w-full rounded-2xl overflow-hidden shadow-lg group">
                        {/* Background Image */}
                        <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                            style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1574943320219-553eb213f72d?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80")' }}>
                        </div>
                        {/* Dark Overlay Gradient */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>

                        <div className="absolute bottom-0 left-0 p-8 w-full flex items-end justify-between">
                            <div>
                                <span className="bg-primary text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider mb-3 inline-block">
                                    Today's Highlight
                                </span>
                                <h2 className="text-3xl font-bold text-white mb-1">Market Spotlight: Wheat</h2>
                                <div className="flex items-baseline gap-2 text-white">
                                    <span className="text-2xl font-bold">₹2,450</span>
                                    <span className="text-sm opacity-80">/quintal</span>
                                    <span className="ml-2 text-green-400 text-sm font-bold flex items-center bg-black/30 px-2 py-0.5 rounded backdrop-blur-sm">
                                        <TrendingUp size={14} className="mr-1" /> +2% since yesterday
                                    </span>
                                </div>
                            </div>

                            <button className="bg-primary hover:bg-green-500 text-white font-bold py-3 px-6 rounded-full shadow-lg shadow-green-900/20 transition-transform active:scale-95">
                                View Market Depth
                            </button>
                        </div>
                    </div>

                    {/* Quick Actions Grid */}
                    <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {/* Check Prices */}
                            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center text-center gap-4 hover:border-green-200 hover:shadow-md transition-all cursor-pointer group">
                                <div className="w-14 h-14 rounded-full bg-green-50 text-green-600 flex items-center justify-center group-hover:bg-green-100 transition-colors">
                                    <Wallet size={24} />
                                </div>
                                <span className="font-bold text-gray-900">Check All Prices</span>
                            </div>

                            {/* Post Sale */}
                            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center text-center gap-4 hover:border-green-200 hover:shadow-md transition-all cursor-pointer group">
                                <div className="w-14 h-14 rounded-full bg-green-50 text-green-600 flex items-center justify-center group-hover:bg-green-100 transition-colors">
                                    <Plus size={24} />
                                </div>
                                <span className="font-bold text-gray-900">Post a New Sale</span>
                            </div>

                            {/* Voice Note */}
                            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center text-center gap-4 hover:border-green-200 hover:shadow-md transition-all cursor-pointer group">
                                <div className="w-14 h-14 rounded-full bg-green-50 text-green-600 flex items-center justify-center group-hover:bg-green-100 transition-colors">
                                    <Mic size={24} />
                                </div>
                                <span className="font-bold text-gray-900">Record Voice Note</span>
                            </div>
                        </div>
                    </div>

                    {/* Other Crop Trends (Simulated Bottom Area) */}
                    <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-4">Other Crop Trends</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="bg-white p-4 rounded-xl border border-gray-100 flex items-center justify-between shadow-sm">
                                <div>
                                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Corn</p>
                                    <p className="text-xl font-bold text-gray-900">₹1,820</p>
                                </div>

                                {/* Mini Bar Chart CSS */}
                                <div className="h-8 flex items-end gap-1 mx-4 opacity-80">
                                    {[30, 40, 35, 50, 45, 60, 55].map((h, i) => (
                                        <div key={i} className="w-1.5 bg-green-400 rounded-sm" style={{ height: `${h}%` }}></div>
                                    ))}
                                </div>

                                <span className="text-green-600 text-xs font-bold">+1.4%</span>
                            </div>

                            <div className="bg-white p-4 rounded-xl border border-gray-100 flex items-center justify-between shadow-sm">
                                <div>
                                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Millet</p>
                                    <p className="text-xl font-bold text-gray-900">₹2,100</p>
                                </div>

                                {/* Mini Bar Chart CSS */}
                                <div className="h-8 flex items-end gap-1 mx-4 opacity-80">
                                    {[60, 55, 50, 45, 40, 35, 30].map((h, i) => (
                                        <div key={i} className="w-1.5 bg-red-300 rounded-sm" style={{ height: `${h}%` }}></div>
                                    ))}
                                </div>

                                <span className="text-red-500 text-xs font-bold">-0.8%</span>
                            </div>
                        </div>
                    </div>

                </div>

                {/* Right Sidebar (Active Deals) */}
                <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm h-fit">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold text-gray-900">Active Deals</h3>
                        <span className="bg-green-100 text-green-800 text-xs font-bold px-2 py-1 rounded-full">2</span>
                    </div>

                    <div className="space-y-6">
                        {/* Deal 1 */}
                        <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 hover:border-green-200 transition-colors">
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <h4 className="font-bold text-gray-900 text-lg">Soybean</h4>
                                    <p className="text-xs text-gray-500">with Raj Traders</p>
                                </div>
                                <span className="bg-orange-100 text-orange-700 text-[10px] font-bold px-2 py-1 rounded uppercase">Pending</span>
                            </div>

                            <div className="bg-white p-3 rounded-xl border border-gray-100 mb-3">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Status</p>
                                <p className="text-sm font-medium text-gray-800">
                                    Counter-offer received (₹4,200)
                                </p>
                            </div>

                            <div className="flex gap-2">
                                <button className="flex-1 bg-primary hover:bg-green-500 text-white text-xs font-bold py-2 rounded-full shadow-sm transition-colors">
                                    Accept
                                </button>
                                <button className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs font-bold py-2 rounded-full transition-colors">
                                    Details
                                </button>
                            </div>
                        </div>

                        {/* Deal 2 */}
                        <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 hover:border-green-200 transition-colors">
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <h4 className="font-bold text-gray-900 text-lg">Cotton</h4>
                                    <p className="text-xs text-gray-500">with BulkBuyers</p>
                                </div>
                                <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-1 rounded uppercase">Active</span>
                            </div>

                            <div className="bg-white p-3 rounded-xl border border-gray-100 mb-3">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Status</p>
                                <p className="text-sm font-medium text-gray-800">
                                    Awaiting buyer response
                                </p>
                            </div>

                            <button className="w-full bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 text-xs font-bold py-2 rounded-full transition-colors">
                                Send Reminder
                            </button>
                        </div>
                    </div>

                    <button className="w-full mt-6 text-green-600 font-bold text-sm hover:underline py-2">
                        View All Negotiations
                    </button>
                </div>

            </div>
        </div>
    );
};
