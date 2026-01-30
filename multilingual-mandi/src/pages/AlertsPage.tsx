import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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

interface Alert {
    id: number;
    title: string;
    description: string;
    time: string;
    type: 'Price Alert' | 'Trade Update' | 'System';
    read: boolean;
    urgency: 'normal' | 'crucial' | 'active';
}

export const AlertsPage = () => {
    const navigate = useNavigate();
    const [alerts, setAlerts] = useState<Alert[]>([
        {
            id: 1,
            title: "Wheat price reached your target of ₹2,500 at Nagpur Mandi",
            description: "5 minutes ago • Market Alert",
            time: "5 minutes ago",
            type: 'Price Alert',
            read: false,
            urgency: 'active'
        },
        {
            id: 2,
            title: "New offer from Raj Traders for Soybeans",
            description: "42 minutes ago • Trade Update",
            time: "42 minutes ago",
            type: 'Trade Update',
            read: false,
            urgency: 'crucial'
        },
        {
            id: 3,
            title: "Profile Verification Successful",
            description: "2 hours ago • System",
            time: "2 hours ago",
            type: 'System',
            read: true,
            urgency: 'normal'
        }
    ]);

    const [selectedTab, setSelectedTab] = useState<'Price Alert' | 'Trade Update' | 'System'>('Price Alert');

    const markAllAsRead = () => {
        setAlerts(prev => prev.map(alert => ({ ...alert, read: true })));
    };

    const handleViewPrice = (id: number) => {
        console.log(`Viewing price for alert ${id}`);
        // For demonstration, navigate to the price discovery or dashboard
        navigate('/dashboard/price-discovery');
    };

    const handleMarkAsRead = (id: number) => {
        setAlerts(prev => prev.map(a => a.id === id ? { ...a, read: true } : a));
    };

    const handleKeyDown = (e: React.KeyboardEvent, id: number) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleMarkAsRead(id);
        }
    };

    const unreadCount = alerts.filter(a => !a.read).length;

    const counts = {
        price: alerts.filter(a => a.type === 'Price Alert').length,
        trade: alerts.filter(a => a.type === 'Trade Update').length,
        system: alerts.filter(a => a.type === 'System').length,
    };

    const filteredAlerts = alerts.filter(a => a.type === selectedTab);

    return (
        <div className="flex flex-col gap-6 w-full h-[calc(100vh-8rem)]">

            {/* Header */}
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Alerts & Notifications</h1>
                <button
                    onClick={markAllAsRead}
                    disabled={unreadCount === 0}
                    className={`text-sm font-bold bg-gray-100 px-4 py-2 rounded-lg transition-colors ${unreadCount === 0 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200'}`}
                >
                    Mark All as Read {unreadCount > 0 && `(${unreadCount})`}
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
                            aria-label="Search notifications"
                            className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                        />                    </div>

                    {/* Tabs */}
                    <div className="flex bg-gray-100 p-1 rounded-xl shrink-0" role="tablist">
                        <button
                            id="tab-price"
                            role="tab"
                            aria-selected={selectedTab === 'Price Alert'}
                            aria-controls="alert-panel"
                            onClick={() => setSelectedTab('Price Alert')}
                            className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${selectedTab === 'Price Alert' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:bg-gray-200/50'}`}
                        >
                            Price Alerts ({counts.price})
                        </button>
                        <button
                            id="tab-trade"
                            role="tab"
                            aria-selected={selectedTab === 'Trade Update'}
                            aria-controls="alert-panel"
                            onClick={() => setSelectedTab('Trade Update')}
                            className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${selectedTab === 'Trade Update' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:bg-gray-200/50'}`}
                        >
                            Deal Updates ({counts.trade})
                        </button>
                        <button
                            id="tab-system"
                            role="tab"
                            aria-selected={selectedTab === 'System'}
                            aria-controls="alert-panel"
                            onClick={() => setSelectedTab('System')}
                            className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${selectedTab === 'System' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:bg-gray-200/50'}`}
                        >
                            System ({counts.system})
                        </button>
                    </div>

                    {/* Scrollable List */}
                    <div
                        id="alert-panel"
                        role="tabpanel"
                        aria-labelledby={`tab-${selectedTab.split(' ')[0].toLowerCase()}`}
                        className="flex-1 overflow-y-auto space-y-4 pr-2"
                    >
                        {filteredAlerts.length > 0 ? (
                            filteredAlerts.map((alert) => (
                                <div
                                    key={alert.id}
                                    role="button"
                                    tabIndex={0}
                                    aria-label={`${alert.title} - ${alert.read ? 'Read' : 'Unread'}`}
                                    onClick={() => handleMarkAsRead(alert.id)}
                                    onKeyDown={(e) => handleKeyDown(e, alert.id)}
                                    className={`p-5 rounded-2xl border transition-all cursor-pointer relative group focus:outline-none focus:ring-2 focus:ring-blue-500 ${alert.urgency === 'active'
                                        ? `bg-white border-2 ${alert.read ? 'border-gray-200 shadow-sm' : 'border-blue-500 shadow-md'}`
                                        : alert.urgency === 'crucial'
                                            ? `${alert.read ? 'bg-white border-gray-100 shadow-sm' : 'bg-red-50 border-red-100 shadow-sm'}`
                                            : 'bg-white border-gray-100 shadow-sm hover:border-gray-200'
                                        }`}
                                >
                                    {!alert.read && (
                                        <div className={`absolute top-5 right-5 w-2 h-2 rounded-full ${alert.urgency === 'crucial' ? 'bg-red-400' : 'bg-blue-500'}`}></div>
                                    )}

                                    <div className="flex items-start gap-3">
                                        <div className="mt-0.5">
                                            {alert.urgency === 'active' && <TrendingUp size={18} className="text-green-600" />}
                                            {alert.urgency === 'crucial' && <AlertCircle size={20} className="text-red-500" />}
                                            {alert.urgency === 'normal' && <CheckCircle size={20} className="text-blue-500" />}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className={`font-bold ${alert.read ? 'text-gray-600' : 'text-gray-900'}`}>{alert.title}</h3>
                                            </div>
                                            <p className="text-xs text-gray-500 font-medium mb-3">{alert.description}</p>

                                            {alert.urgency === 'active' && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleViewPrice(alert.id);
                                                    }}
                                                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg text-xs flex items-center gap-1 transition-colors z-10 relative"
                                                >
                                                    View Price <ArrowRight size={14} />
                                                </button>
                                            )}
                                            {alert.urgency === 'crucial' && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        // Handle respond action
                                                    }}
                                                    className="bg-white border border-red-200 text-red-600 hover:bg-red-50 font-bold py-2 px-4 rounded-lg text-xs transition-colors"
                                                >
                                                    Respond Now
                                                </button>
                                            )}
                                            {alert.urgency === 'normal' && (
                                                <p className="text-sm text-gray-600 mt-2">{alert.description}</p>
                                            )}                                    </div>

                                        {alert.urgency === 'active' && (
                                            <div className="w-24 h-16 bg-blue-900/10 rounded-lg overflow-hidden shrink-0 border border-blue-100">
                                                <svg viewBox="0 0 100 60" className="w-full h-full">
                                                    <polyline points="0,50 20,45 40,30 60,40 80,15 100,5" fill="none" stroke="#2563eb" strokeWidth="2" />
                                                    <polygon points="0,50 20,45 40,30 60,40 80,15 100,5 100,60 0,60" fill="#2563eb" fillOpacity="0.1" />
                                                </svg>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-center p-8 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-100">
                                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                                    <Info className="text-gray-300" size={32} />
                                </div>
                                <h3 className="text-gray-900 font-bold mb-1">No {selectedTab}s</h3>
                                <p className="text-gray-500 text-sm max-w-xs">You're all caught up! New notifications will appear here as they arrive.</p>
                            </div>
                        )}
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
