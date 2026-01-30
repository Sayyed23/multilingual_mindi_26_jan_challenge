import {
    CheckCircle,
    MapPin,
    ShieldCheck,
    Award,
    Package,
    MessageSquare,
    Download,
    User,
    FileText,
    Building2,
    Star,
    Info,
    Languages
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const UserProfile = () => {
    const navigate = useNavigate();

    const handleViewAllHistory = () => {
        console.log("Viewing all history for Patil Agrotech...");
        // TODO: Implement full history view navigation
        // navigate('/dashboard/history');
    };

    const handleOpenMap = () => {
        const address = "Kalmeshwar Road, Nagpur, MH 440001";
        const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
        window.open(mapUrl, '_blank', 'noopener,noreferrer');
    };

    return (
        <div className="flex flex-col lg:flex-row gap-8 w-full">

            {/* Main Content (Left) */}
            <div className="flex-1 flex flex-col gap-8">

                {/* Header Card */}
                <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col sm:flex-row items-center sm:items-start gap-6 relative overflow-hidden">
                    {/* Verified Badge decoration */}
                    <div className="hidden sm:block absolute top-0 right-0 p-4 opacity-5">
                        <ShieldCheck size={120} className="text-green-600" />
                    </div>

                    <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center shrink-0 border border-green-200 relative">
                        {/* Logo Placeholder */}
                        <span className="text-green-700 font-bold text-2xl">Patil</span>
                        <div className="absolute -bottom-2 -right-2 bg-green-500 text-white p-1 rounded-full border-2 border-white">
                            <ShieldCheck size={14} fill="currentColor" />
                        </div>
                    </div>

                    <div className="flex-1 text-center sm:text-left z-10">
                        <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 mb-2">
                            <h1 className="text-2xl font-extrabold text-gray-900">Patil Agrotech</h1>
                            <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                                Certified Vendor
                            </span>
                        </div>

                        <div className="flex flex-col sm:flex-row items-center gap-4 text-sm text-gray-500 font-medium mb-4">
                            <span className="flex items-center gap-1">
                                <MapPin size={16} /> Nagpur Mandi Association
                            </span>
                            <span className="hidden sm:inline">•</span>
                            <span>Member since 2018</span>
                        </div>

                        <div className="flex flex-wrap justify-center sm:justify-start gap-3">
                            <div className="flex items-center gap-1.5 text-xs font-bold text-green-700 bg-green-50 px-3 py-1.5 rounded-lg border border-green-100">
                                <CheckCircle size={14} /> Verified Identity
                            </div>
                            <div className="flex items-center gap-1.5 text-xs font-bold text-green-700 bg-green-50 px-3 py-1.5 rounded-lg border border-green-100">
                                <CheckCircle size={14} /> License Valid
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Trust Score */}
                    <div className="bg-blue-50/50 rounded-3xl p-6 border border-blue-100 relative overflow-hidden">
                        <div className="absolute top-4 right-4 text-yellow-500">
                            <Award size={24} />
                        </div>
                        <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest mb-2">Trust Score</p>
                        <div className="flex items-baseline gap-1 mb-1">
                            <span className="text-4xl font-extrabold text-gray-900">4.8</span>
                            <span className="text-sm font-bold text-gray-400">/ 5.0</span>
                        </div>
                        <p className="text-yellow-600 font-bold text-sm">Gold Level Professional</p>
                    </div>

                    {/* Completed Deals */}
                    <div className="bg-green-50/50 rounded-3xl p-6 border border-green-100 relative overflow-hidden">
                        <div className="absolute top-4 right-4 text-green-500">
                            <Package size={24} />
                        </div>
                        <p className="text-[10px] font-bold text-green-600 uppercase tracking-widest mb-2">Completed Deals</p>
                        <div className="flex items-baseline gap-1 mb-1">
                            <span className="text-4xl font-extrabold text-gray-900">142</span>
                        </div>
                        <p className="text-green-600 font-bold text-xs flex items-center gap-1">
                            <span className="bg-green-200 w-4 h-4 rounded-full flex items-center justify-center text-[10px]">↗</span>
                            +12 this month
                        </p>
                    </div>
                </div>

                {/* Reliability Metrics */}
                <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-900 mb-6">Reliability Metrics</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Gauge 1 */}
                        <div className="flex flex-col items-center">
                            <div className="w-24 h-24 rounded-full border-8 border-blue-100 border-t-blue-600 border-r-blue-600 flex items-center justify-center mb-3 rotate-45">
                                <span className="text-xl font-black text-gray-900 -rotate-45">98%</span>
                            </div>
                            <p className="text-xs font-bold text-gray-900">Payment Punctuality</p>
                        </div>
                        {/* Gauge 2 */}
                        <div className="flex flex-col items-center">
                            <div className="w-24 h-24 rounded-full border-8 border-green-100 border-t-green-500 border-r-green-500 border-b-green-500 flex items-center justify-center mb-3 rotate-[135deg]">
                                <span className="text-xl font-black text-gray-900 -rotate-[135deg]">4.7</span>
                            </div>
                            <p className="text-xs font-bold text-gray-900">Product Quality</p>
                        </div>
                        {/* Gauge 3 */}
                        <div className="flex flex-col items-center">
                            <div className="w-24 h-24 rounded-full border-8 border-blue-600 flex items-center justify-center mb-3">
                                <span className="text-xl font-black text-gray-900">100%</span>
                            </div>
                            <p className="text-xs font-bold text-gray-900">Fulfillment Rate</p>
                        </div>
                    </div>
                </div>

                {/* Recent Deal Volumes */}
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                        <h3 className="text-lg font-bold text-gray-900">Recent Deal Volumes</h3>
                        <button
                            onClick={handleViewAllHistory}
                            className="text-xs font-bold text-blue-600 hover:underline"
                        >
                            View All History
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 text-gray-500">
                                <tr>
                                    <th className="px-6 py-4 font-bold text-[10px] uppercase tracking-wider">Commodity</th>
                                    <th className="px-6 py-4 font-bold text-[10px] uppercase tracking-wider">Volume</th>
                                    <th className="px-6 py-4 font-bold text-[10px] uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 font-bold text-[10px] uppercase tracking-wider text-right">Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {/* Row 1 */}
                                <tr className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4 font-bold text-gray-900">Wheat (Premium)</td>
                                    <td className="px-6 py-4 text-gray-600 font-medium">200 Tons</td>
                                    <td className="px-6 py-4 font-bold text-green-600">Delivered</td>
                                    <td className="px-6 py-4 text-gray-500 font-medium text-right">Oct 12, 2023</td>
                                </tr>
                                {/* Row 2 */}
                                <tr className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4 font-bold text-gray-900">Soybeans</td>
                                    <td className="px-6 py-4 text-gray-600 font-medium">50 Tons</td>
                                    <td className="px-6 py-4 font-bold text-green-600">Delivered</td>
                                    <td className="px-6 py-4 text-gray-500 font-medium text-right">Oct 05, 2023</td>
                                </tr>
                                {/* Row 3 */}
                                <tr className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4 font-bold text-gray-900">Cotton (Long Staple)</td>
                                    <td className="px-6 py-4 text-gray-600 font-medium">120 Tons</td>
                                    <td className="px-6 py-4 font-bold text-yellow-600">In Transit</td>
                                    <td className="px-6 py-4 text-gray-500 font-medium text-right">Sep 28, 2023</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Feedback */}
                <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-900 mb-6">User Feedback</h3>

                    <div className="space-y-6">
                        {/* Feedback 1 */}
                        <div className="pb-6 border-b border-gray-50 last:border-0 last:pb-0">
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-gray-200"></div>
                                    <div>
                                        <h4 className="text-sm font-bold text-gray-900">Rajesh Kumar</h4>
                                        <div className="flex text-yellow-400 gap-0.5 mt-0.5">
                                            {[1, 2, 3, 4, 5].map(i => <Star key={i} size={10} fill="currentColor" />)}
                                        </div>
                                    </div>
                                </div>
                                <span className="text-[10px] text-gray-400 font-medium">2 weeks ago</span>
                            </div>
                            <p className="text-sm text-gray-600 italic mb-2">
                                "माल की गुणवत्ता बहुत अच्छी थी और डिलीवरी समय पर हुई।"
                            </p>
                            <button className="text-[10px] text-blue-600 font-bold flex items-center gap-1 hover:underline">
                                <Languages size={10} /> Translate to English: "Product quality was excellent and delivery was on time."
                            </button>
                        </div>

                        {/* Feedback 2 */}
                        <div className="pb-6 border-b border-gray-50 last:border-0 last:pb-0">
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-blue-100"></div>
                                    <div>
                                        <h4 className="text-sm font-bold text-gray-900">Mandi Logistics Corp</h4>
                                        <div className="flex text-yellow-400 gap-0.5 mt-0.5">
                                            {[1, 2, 3, 4].map(i => <Star key={i} size={10} fill="currentColor" />)}
                                            <Star size={10} className="text-gray-300" fill="currentColor" />
                                        </div>
                                    </div>
                                </div>
                                <span className="text-[10px] text-gray-400 font-medium">1 month ago</span>
                            </div>
                            <p className="text-sm text-gray-600">
                                Professional vendor. Clear documentation and easy communication for high-volume wheat shipment. Highly recommended for bulk buyers.
                            </p>
                        </div>
                    </div>
                </div>

            </div>

            {/* Sidebar (Right) */}
            <div className="w-full lg:w-96 flex flex-col gap-6 shrink-0">

                {/* Actions Card */}
                <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-900 mb-6">Actions</h3>
                    <div className="flex flex-col gap-3">
                        <button
                            onClick={() => navigate('/dashboard/deals')}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-200 transition-transform active:scale-[0.98] flex items-center justify-center gap-2"
                        >
                            <MessageSquare size={18} /> Start Negotiation
                        </button>
                        <button
                            onClick={() => { /* TODO: implement messaging */ }}
                            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-900 font-bold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2"
                        >
                            <MessageSquare size={18} /> Message Vendor
                        </button>
                        <button
                            onClick={() => { /* TODO: implement download */ }}
                            className="w-full bg-white border-2 border-blue-100 hover:border-blue-200 text-blue-600 font-bold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm mt-2"
                        >
                            <Download size={16} /> Download Trust Report
                        </button>                    </div>
                </div>

                {/* Verification Status */}
                <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">Verification Status</h3>
                    <div className="space-y-5">
                        {/* Item 1 */}
                        <div className="flex justify-between items-center group">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-100 transition-colors">
                                    <User size={16} />
                                </div>
                                <span className="text-sm font-bold text-gray-700">Identity Proof</span>
                            </div>
                            <CheckCircle size={18} className="text-white fill-green-500" />
                        </div>
                        {/* Item 2 */}
                        <div className="flex justify-between items-center group">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-100 transition-colors">
                                    <FileText size={16} />
                                </div>
                                <span className="text-sm font-bold text-gray-700">Mandi License</span>
                            </div>
                            <CheckCircle size={18} className="text-white fill-green-500" />
                        </div>
                        {/* Item 3 */}
                        <div className="flex justify-between items-center group">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-100 transition-colors">
                                    <Building2 size={16} />
                                </div>
                                <span className="text-sm font-bold text-gray-700">Business Reg.</span>
                            </div>
                            <CheckCircle size={18} className="text-white fill-green-500" />
                        </div>
                        {/* Item 4 */}
                        <div className="flex justify-between items-center group">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-100 transition-colors">
                                    <Award size={16} />
                                </div>
                                <span className="text-sm font-bold text-gray-700">Quality Cert.</span>
                            </div>
                            <CheckCircle size={18} className="text-white fill-green-500" />
                        </div>
                    </div>

                    <div className="mt-6 bg-blue-50 rounded-xl p-3 flex items-start gap-2">
                        <Info size={14} className="text-blue-600 shrink-0 mt-0.5" />
                        <p className="text-[10px] text-blue-800 leading-snug font-medium">
                            Data verified by Nagpur Mandi Authority on Oct 01, 2023.
                        </p>
                    </div>
                </div>

                {/* Warehouse Map */}
                <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Warehouse Location</h3>
                    <div
                        role="button"
                        tabIndex={0}
                        aria-label="Open warehouse location in Google Maps"
                        onClick={handleOpenMap}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                handleOpenMap();
                            }
                        }}
                        className="h-40 bg-blue-50 rounded-xl flex items-center justify-center relative overflow-hidden group cursor-pointer mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <div className="flex flex-col items-center text-blue-300 group-hover:scale-110 transition-transform">
                            <MapPin size={32} />
                        </div>
                    </div>
                    <p className="text-xs font-bold text-blue-600 text-center">Kalmeshwar Road, Nagpur, MH 440001</p>
                </div>

            </div>

        </div>
    );
};
