import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
    Bell,
    Search,
    Leaf,
    HelpCircle,
    Settings,
    LogOut,
    Hexagon
} from 'lucide-react';

export const AppShell = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const isBuyer = location.pathname.startsWith('/buyer');

    const isActive = (path: string) => location.pathname === path;

    // Navigation Config
    const farmerNav = [
        { label: 'Market', path: '/dashboard' },
        { label: 'Price Discovery', path: '/price-discovery' },
        { label: 'My Deals', path: '/dashboard/deals' },
        { label: 'Community', path: '/community' },
        { label: 'Inventory', path: '/dashboard/inventory' },
        { label: 'Reports', path: '/dashboard/reports' },
    ];

    const buyerNav = [
        { label: 'Dashboard', path: '/buyer/dashboard' },
        { label: 'Marketplace', path: '/buyer/marketplace' },
        { label: 'My RFQs', path: '/buyer/rfqs' },
        { label: 'Suppliers', path: '/buyer/suppliers' },
    ];

    const currentNav = isBuyer ? buyerNav : farmerNav;
    const logoBg = isBuyer ? 'bg-blue-600' : 'bg-green-600';
    const ringColor = isBuyer ? 'focus:ring-blue-500/50' : 'focus:ring-green-500/50';

    return (
        <div className="min-h-screen bg-[#f8f9fa] font-sans flex flex-col">
            {/* Top Navigation Header */}
            <header className="bg-white px-6 py-4 shadow-sm border-b border-gray-100 flex items-center justify-between sticky top-0 z-50">
                <div className="flex items-center gap-10">
                    {/* Logo */}
                    <div className="flex items-center gap-2 text-gray-900 cursor-pointer" onClick={() => navigate(isBuyer ? '/buyer/dashboard' : '/dashboard')}>
                        <div className={`${logoBg} rounded-full p-1.5 text-white`}>
                            {isBuyer ? <Hexagon size={20} fill="currentColor" /> : <Leaf size={20} fill="currentColor" />}
                        </div>
                        <span className="font-bold text-xl tracking-tight">AgriMarket</span>
                    </div>

                    {/* Nav Links */}
                    <nav className="hidden md:flex items-center gap-8">
                        {currentNav.map((item) => (
                            <button
                                key={item.label}
                                onClick={() => navigate(item.path)}
                                className={`text-sm font-bold transition-colors ${isActive(item.path) || (item.path === '/buyer/dashboard' && location.pathname === '/buyer/dashboard')
                                    ? `text-gray-900 ${isBuyer ? 'text-blue-600' : ''}`
                                    : 'text-gray-500 hover:text-gray-900'
                                    }`}
                            >
                                {item.label}
                            </button>
                        ))}
                    </nav>
                </div>

                <div className="flex items-center gap-6">
                    {/* Search Bar */}
                    <div className="hidden md:block relative w-80">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder={isBuyer ? "Search commodities..." : "Search crops..."}
                            className={`w-full pl-12 pr-4 py-2.5 rounded-full bg-gray-100 border-none focus:ring-2 ${ringColor} text-sm font-medium placeholder:text-gray-500`}
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/alerts')}
                            className="p-2 text-gray-600 hover:bg-gray-100 rounded-full relative transition-colors"
                        >
                            <Bell size={22} />
                            <span className="absolute top-1.5 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
                        </button>
                        {isBuyer && (
                            <button
                                onClick={() => navigate('/settings')}
                                className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <Settings size={22} />
                            </button>
                        )}
                        <div className={`w-10 h-10 rounded-full overflow-hidden border-2 ${isBuyer ? 'border-blue-100 hover:border-blue-300' : 'border-green-100 hover:border-green-300'} cursor-pointer transition-colors`}>
                            <img
                                src="https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&q=80"
                                alt="User Profile"
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 max-w-7xl mx-auto w-full p-6 md:p-8">
                <Outlet />
            </main>

            {/* Footer */}
            <footer className="bg-white border-t border-gray-200 py-8 mt-auto">
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-gray-400 text-xs font-medium">
                        © 2024 AgriMarket Platform • Empowering 2M+ Farmers across India
                    </p>
                    <div className="flex items-center gap-6 text-gray-400">
                        <HelpCircle size={20} className="hover:text-gray-600 cursor-pointer" />
                        {!isBuyer && <Settings size={20} className="hover:text-gray-600 cursor-pointer" onClick={() => navigate('/settings')} />}
                        <LogOut
                            size={20}
                            className="hover:text-red-500 cursor-pointer transition-colors"
                            onClick={() => {
                                // Clear session logic here if needed
                                console.log("Logging out from Footer...");
                                navigate('/auth');
                            }}
                        />
                    </div>
                </div>
            </footer>
        </div>
    );
};
