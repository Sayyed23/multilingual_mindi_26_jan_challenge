import React from 'react';
import { ShoppingBag, Truck, CheckCircle, Clock, ChevronRight } from 'lucide-react';

const OrdersPage: React.FC = () => {
    const orders = [
        {
            id: '#ORD-2024-001',
            date: 'Today, 2:30 PM',
            vendor: 'Punjab Agro Foods',
            items: 'Basmati Rice (25 qtl)',
            amount: '₹1,12,500',
            status: 'Processing',
            color: 'blue'
        },
        {
            id: '#ORD-2024-002',
            date: 'Jan 28, 2024',
            vendor: 'Nashik Onion Traders',
            items: 'Red Onions (10 qtl)',
            amount: '₹12,000',
            status: 'Shipped',
            color: 'orange'
        },
        {
            id: '#ORD-2024-003',
            date: 'Jan 25, 2024',
            vendor: 'Fresh Fruits Co.',
            items: 'Shimla Apples (5 boxes)',
            amount: '₹8,500',
            status: 'Delivered',
            color: 'green'
        }
    ];

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'Processing': return <Clock size={16} />;
            case 'Shipped': return <Truck size={16} />;
            case 'Delivered': return <CheckCircle size={16} />;
            default: return <ShoppingBag size={16} />;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
                    <p className="text-gray-500">Track and manage your purchases</p>
                </div>
                <div className="flex gap-2">
                    <select className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 outline-none focus:border-green-500">
                        <option>All Orders</option>
                        <option>Active</option>
                        <option>Completed</option>
                    </select>
                </div>
            </div>

            <div className="grid gap-4">
                {orders.map((order) => (
                    <div key={order.id} className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all p-5">
                        <div className="flex flex-wrap md:flex-nowrap justify-between items-start gap-4 mb-4">
                            <div>
                                <div className="flex items-center gap-3 mb-1">
                                    <h3 className="font-bold text-gray-900">{order.id}</h3>
                                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1.5 bg-${order.color}-50 text-${order.color}-700 border border-${order.color}-100`}>
                                        {getStatusIcon(order.status)}
                                        {order.status}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-500">{order.date} • from <span className="text-gray-900 font-medium">{order.vendor}</span></p>
                            </div>
                            <div className="text-right">
                                <p className="text-lg font-bold text-green-700">{order.amount}</p>
                                <p className="text-xs text-gray-500">Paid via UPI</p>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-gray-100 flex flex-wrap sm:flex-nowrap items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
                                    <ShoppingBag className="text-gray-400" size={20} />
                                </div>
                                <span className="font-medium text-gray-700">{order.items}</span>
                            </div>
                            <button className="flex items-center text-sm font-semibold text-green-600 hover:text-green-700 transition-colors">
                                View Details <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default OrdersPage;
