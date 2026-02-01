
import React, { useState } from 'react';
import { Package, Plus, Edit2, Trash2, TrendingUp, AlertCircle } from 'lucide-react';

const InventoryPage: React.FC = () => {
    const [inventory] = useState([
        { id: 1, name: 'Basmati Rice', variety: 'Classic', quantity: 500, unit: 'qtl', price: 4500, status: 'In Stock' },
        { id: 2, name: 'Wheat', variety: 'Sharbati', quantity: 120, unit: 'qtl', price: 2800, status: 'Low Stock' },
        { id: 3, name: 'Potatoes', variety: 'Chandramukhi', quantity: 0, unit: 'qtl', price: 1500, status: 'Out of Stock' },
    ]);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">My Inventory</h1>
                    <p className="text-gray-500">Manage your stock and listings</p>
                </div>
                <button className="bg-green-600 text-white px-4 py-2 rounded-xl font-medium flex items-center gap-2 hover:bg-green-700 transition-colors shadow-lg shadow-green-200">
                    <Plus size={18} />
                    Add Item
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[{ label: 'Total Items', value: '15', icon: <Package />, color: 'blue' },
                { label: 'Low Stock', value: '3', icon: <AlertCircle />, color: 'orange' },
                { label: 'Est. Value', value: '₹4.2L', icon: <TrendingUp />, color: 'green' }
                ].map((stat, i) => (
                    <div key={i} className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
                        <div className={`p-3 rounded-lg bg-${stat.color}-50 text-${stat.color}-600`}>
                            {stat.icon}
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
                            <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-200">
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Item Name</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Price/Unit</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Stock</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {inventory.map((item) => (
                                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                                                <Package size={20} className="text-gray-400" />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-gray-900">{item.name}</p>
                                                <p className="text-xs text-gray-500">{item.variety}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 font-medium text-gray-700">₹{item.price} / {item.unit}</td>
                                    <td className="px-6 py-4 text-gray-600">{item.quantity} {item.unit}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${item.status === 'In Stock' ? 'bg-green-50 text-green-700 border-green-100' :
                                            item.status === 'Low Stock' ? 'bg-orange-50 text-orange-700 border-orange-100' :
                                                'bg-red-50 text-red-700 border-red-100'
                                            } `}>
                                            {item.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex justify-end gap-2">
                                            <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                                                <Edit2 size={16} />
                                            </button>
                                            <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default InventoryPage;
