import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import {
    ShoppingBag,
    TrendingUp,
    MessageSquare,
    Search,
    Package,
    Bell,
    Scan,
    ArrowRight
} from 'lucide-react';
import T from '../components/T';

const HomePage: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    // Define content based on user role
    const getRoleSpecificContent = () => {

        switch (user?.role) {
            case 'vendor':
                return {
                    title: `Welcome back, ${user.name || 'Vendor'}`,
                    subtitle: 'Manage your inventory and connect with buyers across India.',
                    theme: 'bg-gradient-to-r from-emerald-600 to-green-600',
                    cards: [
                        {
                            title: 'My Inventory',
                            description: 'Manage your commodity listings, prices, and stock levels.',
                            action: 'Manage Inventory',
                            path: '/inventory',
                            icon: <Package className="w-8 h-8 text-emerald-600" />,
                            badge: '3 Active'
                        },
                        {
                            title: 'Active Negotiations',
                            description: 'View and respond to inquiries from interested buyers.',
                            action: 'View Negotiations',
                            path: '/chats',
                            icon: <MessageSquare className="w-8 h-8 text-blue-600" />,
                            badge: '2 New'
                        },
                        {
                            title: 'Market Trends',
                            description: 'Check current market rates and price forecasts.',
                            action: 'View Prices',
                            path: '/market',
                            icon: <TrendingUp className="w-8 h-8 text-purple-600" />
                        }
                    ]
                };
            case 'buyer':
                return {
                    title: `Welcome back, ${user.name || 'Buyer'}`,
                    subtitle: 'Find the best deals and connect with trusted verified vendors.',
                    theme: 'bg-gradient-to-r from-blue-600 to-indigo-600',
                    cards: [
                        {
                            title: 'Find Commodities',
                            description: 'Search for products from verified farmers and vendors.',
                            action: 'Start Search',
                            path: '/search',
                            icon: <Search className="w-8 h-8 text-blue-600" />
                        },
                        {
                            title: 'My Orders',
                            description: 'Track your active purchases and delivery status.',
                            action: 'View Orders',
                            path: '/orders',
                            icon: <ShoppingBag className="w-8 h-8 text-orange-600" />,
                            badge: '1 Pending'
                        },
                        {
                            title: 'Price Alerts',
                            description: 'Manage your price watch list and notifications.',
                            action: 'View Alerts',
                            path: '/notifications',
                            icon: <Bell className="w-8 h-8 text-yellow-600" />
                        }
                    ]
                };
            case 'agent':
                return {
                    title: `Welcome back, ${user.name || 'Agent'}`,
                    subtitle: 'Facilitate deals and earn commissions on successful transactions.',
                    theme: 'bg-gradient-to-r from-purple-600 to-violet-600',
                    cards: [
                        {
                            title: 'Active Deals',
                            description: 'Manage ongoing negotiations and facilitate transactions.',
                            action: 'View Deals',
                            path: '/deals',
                            icon: <ShoppingBag className="w-8 h-8 text-purple-600" />
                        },
                        {
                            title: 'Find Opportunities',
                            description: 'Discover new buyers and sellers to connect.',
                            action: 'Explore Market',
                            path: '/search',
                            icon: <Search className="w-8 h-8 text-blue-600" />
                        },
                        {
                            title: 'My Earnings',
                            description: 'Track your commissions and payment history.',
                            action: 'View Profile',
                            path: '/profile',
                            icon: <TrendingUp className="w-8 h-8 text-green-600" />
                        }
                    ]
                };
            default:
                return {
                    title: 'Welcome to AgriMandi',
                    subtitle: 'AI-powered marketplace connecting farmers and buyers across India.',
                    theme: 'vibrant-gradient',
                    cards: [
                        {
                            title: 'Market Prices',
                            description: 'Real-time price intelligence from 100+ mandis.',
                            action: 'View Market',
                            path: '/market',
                            icon: <TrendingUp className="w-8 h-8 text-green-600" />
                        },
                        {
                            title: 'New Negotiation',
                            description: 'Start a deal with AI-powered translation.',
                            action: 'Start Chat',
                            path: '/chats',
                            icon: <MessageSquare className="w-8 h-8 text-blue-600" />
                        },
                        {
                            title: 'Price Scanner',
                            description: 'Scan and verify fair prices instantly.',
                            action: 'Open Scanner',
                            path: '/scanner',
                            icon: <Scan className="w-8 h-8 text-indigo-600" />
                        }
                    ]
                };
        }
    };

    const content = getRoleSpecificContent();

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Hero Section */}
            <div className={`p-8 md:p-10 rounded-3xl text-white shadow-xl ${content.theme} relative overflow-hidden`}>
                <div className="relative z-10">
                    <h2 className="text-3xl md:text-4xl font-bold mb-3">
                        <T>{content.title}</T>
                    </h2>
                    <div className="h-1 w-20 bg-white/30 mb-4 rounded-full"></div>
                    <p className="opacity-95 text-lg max-w-2xl font-light">
                        <T>{content.subtitle}</T>
                    </p>
                </div>

                {/* Decorative background elements */}
                <div className="absolute top-0 right-0 -mt-10 -mr-10 h-64 w-64 bg-white/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 -mb-10 -ml-10 h-40 w-40 bg-black/10 rounded-full blur-2xl"></div>
            </div>

            {/* Quick Actions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {content.cards.map((card, index) => (
                    <div
                        key={index}
                        className="glass-card p-6 group hover:border-green-500/30 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-gray-50 rounded-xl group-hover:bg-white transition-colors shadow-sm">
                                {card.icon}
                            </div>
                            {card.badge && (
                                <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-1 rounded-full border border-red-200">
                                    {card.badge}
                                </span>
                            )}
                        </div>

                        <h3 className="text-xl font-bold mb-2 text-gray-900 group-hover:text-green-700 transition-colors">
                            <T>{card.title}</T>
                        </h3>

                        <p className="text-slate-500 text-sm mb-6 leading-relaxed">
                            <T>{card.description}</T>
                        </p>

                        <button
                            onClick={() => navigate(card.path)}
                            className="w-full py-3 px-4 bg-gray-50 hover:bg-green-50 text-gray-700 hover:text-green-700 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2 group-hover:shadow-sm border border-transparent hover:border-green-200"
                        >
                            <T as="span">{card.action}</T>
                            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                        </button>
                    </div>
                ))}
            </div>

            {/* Activity Summary (for authenticated users) */}
            {user && (
                <div className="mt-8">
                    <h3 className="text-xl font-bold text-gray-800 mb-4 px-1">
                        <T>Recent Activity</T>
                    </h3>
                    <div className="bg-white/60 backdrop-blur-md rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="p-8 text-center text-gray-500">
                            <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                                <TrendingUp className="w-6 h-6 text-gray-400" />
                            </div>
                            <p>
                                <T>Your recent activity will appear here once you start using the platform.</T>
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HomePage;
