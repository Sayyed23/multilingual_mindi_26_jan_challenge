import React from 'react';
import { TrendingDown, Package, Info } from 'lucide-react';

const NotificationsPage: React.FC = () => {
    const notifications = [
        {
            id: 1,
            title: 'Price Drop Alert!',
            message: 'Basmati Rice prices have dropped by 5% in Punjab Mandi.',
            time: '2 hours ago',
            type: 'price_drop',
            read: false
        },
        {
            id: 2,
            title: 'Order Shipped',
            message: 'Your order #ORD-2024-002 has been shipped.',
            time: '5 hours ago',
            type: 'order',
            read: true
        },
        {
            id: 3,
            title: 'New Feature Available',
            message: 'Try our new Voice Negotiation feature now!',
            time: '1 day ago',
            type: 'system',
            read: true
        }
    ];

    const getIcon = (type: string) => {
        switch (type) {
            case 'price_drop': return <TrendingDown className="text-red-500" size={20} />;
            case 'order': return <Package className="text-blue-500" size={20} />;
            default: return <Info className="text-gray-500" size={20} />;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
                <button className="text-sm font-medium text-green-600 hover:text-green-700">Mark all as read</button>
            </div>

            <div className="space-y-4">
                {notifications.map((notif) => (
                    <div
                        key={notif.id}
                        className={`p-4 rounded-xl border flex gap-4 transition-all ${notif.read ? 'bg-white border-gray-100' : 'bg-blue-50/50 border-blue-100'
                            }`}
                    >
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${notif.read ? 'bg-gray-100' : 'bg-white shadow-sm'
                            }`}>
                            {getIcon(notif.type)}
                        </div>

                        <div className="flex-1">
                            <h3 className={`text-sm font-bold mb-1 ${notif.read ? 'text-gray-900' : 'text-blue-900'}`}>
                                {notif.title}
                            </h3>
                            <p className={`text-sm mb-2 ${notif.read ? 'text-gray-600' : 'text-blue-800'}`}>
                                {notif.message}
                            </p>
                            <span className="text-xs text-gray-400 font-medium">{notif.time}</span>
                        </div>

                        {!notif.read && (
                            <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default NotificationsPage;
