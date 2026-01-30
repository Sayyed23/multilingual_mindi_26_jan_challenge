import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Languages,
    Bell,
    Shield,
    User,
    ChevronRight,
    LogOut,
    Moon
} from 'lucide-react';

export const SettingsPage = () => {
    const navigate = useNavigate();

    // Mock State for toggles
    const [notifications, setNotifications] = useState({
        priceAlerts: true,
        dealUpdates: true,
        community: false
    });

    const handleLogout = () => {
        // Clear any auth tokens or user data here
        // localStorage.removeItem('authToken');
        console.log("Logging out...");
        navigate('/auth');
    };

    return (
        <div className="max-w-3xl mx-auto w-full pb-20">
            <h1 className="text-3xl font-extrabold text-gray-900 mb-8">Settings</h1>

            <div className="flex flex-col gap-6">

                {/* Account Section */}
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                    <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <User size={20} className="text-gray-400" /> Account
                    </h2>
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-16 h-16 rounded-full bg-green-100 border-2 border-green-200 overflow-hidden">
                            <img
                                src="https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80"
                                alt="User"
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900 text-lg">Ramesh Patil</h3>
                            <p className="text-gray-500 text-sm font-medium">+91 98765 43210</p>
                        </div>
                        <button className="ml-auto text-green-600 font-bold text-sm bg-green-50 px-4 py-2 rounded-lg hover:bg-green-100 transition-colors">
                            Edit
                        </button>
                    </div>
                </div>

                {/* App Preferences */}
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                    <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Languages size={20} className="text-gray-400" /> App Preferences
                    </h2>

                    <div className="space-y-1">
                        {/* Language */}
                        <div className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors px-2 -mx-2 rounded-lg cursor-pointer">
                            <div>
                                <p className="font-bold text-gray-900 text-sm">App Language</p>
                                <p className="text-xs text-gray-500">Select your preferred language</p>
                            </div>
                            <div className="flex items-center gap-2 text-gray-600">
                                <span className="text-sm font-bold">English</span>
                                <ChevronRight size={16} />
                            </div>
                        </div>

                        {/* Voice Output */}
                        <div className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0 px-2 -mx-2">
                            <div>
                                <p className="font-bold text-gray-900 text-sm">Voice Output (Text-to-Speech)</p>
                                <p className="text-xs text-green-600 font-medium">Read out incoming messages</p>
                            </div>
                            <div className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" checked className="sr-only peer" readOnly />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                            </div>
                        </div>

                        {/* Dark Mode */}
                        <div className="flex items-center justify-between py-3 px-2 -mx-2 opacity-50 cursor-not-allowed">
                            <div>
                                <p className="font-bold text-gray-900 text-sm">Dark Mode</p>
                                <p className="text-xs text-gray-400">Coming soon</p>
                            </div>
                            <Moon size={18} className="text-gray-300" />
                        </div>
                    </div>
                </div>

                {/* Notifications */}
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                    <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Bell size={20} className="text-gray-400" /> Notifications
                    </h2>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-700">Price Alerts</span>
                            <div className="relative inline-flex items-center cursor-pointer" onClick={() => setNotifications(p => ({ ...p, priceAlerts: !p.priceAlerts }))}>
                                <div className={`w-11 h-6 rounded-full transition-colors ${notifications.priceAlerts ? 'bg-green-600' : 'bg-gray-200'}`}>
                                    <div className={`absolute top-[2px] left-[2px] bg-white border border-gray-300 rounded-full h-5 w-5 transition-transform ${notifications.priceAlerts ? 'translate-x-full border-white' : ''}`}></div>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-700">Deal Updates</span>
                            <div className="relative inline-flex items-center cursor-pointer" onClick={() => setNotifications(p => ({ ...p, dealUpdates: !p.dealUpdates }))}>
                                <div className={`w-11 h-6 rounded-full transition-colors ${notifications.dealUpdates ? 'bg-green-600' : 'bg-gray-200'}`}>
                                    <div className={`absolute top-[2px] left-[2px] bg-white border border-gray-300 rounded-full h-5 w-5 transition-transform ${notifications.dealUpdates ? 'translate-x-full border-white' : ''}`}></div>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-700">Community Messages</span>
                            <div className="relative inline-flex items-center cursor-pointer" onClick={() => setNotifications(p => ({ ...p, community: !p.community }))}>
                                <div className={`w-11 h-6 rounded-full transition-colors ${notifications.community ? 'bg-green-600' : 'bg-gray-200'}`}>
                                    <div className={`absolute top-[2px] left-[2px] bg-white border border-gray-300 rounded-full h-5 w-5 transition-transform ${notifications.community ? 'translate-x-full border-white' : ''}`}></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Security */}
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                    <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Shield size={20} className="text-gray-400" /> Privacy & Security
                    </h2>
                    <div className="space-y-1">
                        <button className="w-full flex items-center justify-between py-3 text-left hover:bg-gray-50 px-2 -mx-2 rounded-lg transition-colors">
                            <span className="text-sm font-medium text-gray-700">Privacy Policy</span>
                            <ChevronRight size={16} className="text-gray-400" />
                        </button>
                        <button className="w-full flex items-center justify-between py-3 text-left hover:bg-gray-50 px-2 -mx-2 rounded-lg transition-colors">
                            <span className="text-sm font-medium text-gray-700">Terms of Service</span>
                            <ChevronRight size={16} className="text-gray-400" />
                        </button>
                    </div>
                </div>

                {/* Logout */}
                <button
                    onClick={handleLogout}
                    className="w-full bg-red-50 hover:bg-red-100 text-red-600 font-bold py-4 rounded-2xl border border-red-100 flex items-center justify-center gap-2 transition-colors mt-4"
                >
                    <LogOut size={20} /> Sign Out
                </button>

                <p className="text-center text-xs text-gray-400 font-medium">AgriMarket v1.0.2 • Build 2024.10.25</p>

            </div>
        </div>
    );
};
