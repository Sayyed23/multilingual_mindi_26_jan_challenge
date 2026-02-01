import React, { useState } from 'react';
import { Search, Filter, MapPin, Star, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SearchPage: React.FC = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [activeFilter, setActiveFilter] = useState('All');

    const categories = ['All', 'Grains', 'Vegetables', 'Fruits', 'Spices'];

    // Mock data for commodities
    const commodities = [
        {
            id: 1,
            name: 'Basmati Rice',
            image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=200',
            price: '₹4,500/qtl',
            location: 'Punjab Mandi',
            rating: 4.8,
            verified: true,
            category: 'Grains',
            available: '500 qtl'
        },
        {
            id: 2,
            name: 'Fresh Red Onions',
            image: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?auto=format&fit=crop&q=80&w=200',
            price: '₹1,200/qtl',
            location: 'Nashik, Maharashtra',
            rating: 4.5,
            verified: true,
            category: 'Vegetables',
            available: '200 qtl'
        },
        {
            id: 3,
            name: 'Shimla Apples',
            image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&q=80&w=200',
            price: '₹8,000/qtl',
            location: 'Shimla, HP',
            rating: 4.9,
            verified: true,
            category: 'Fruits',
            available: '150 qtl'
        },
        {
            id: 4,
            name: 'Organic Wheat',
            image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&q=80&w=200',
            price: '₹2,200/qtl',
            location: 'MP Mandi',
            rating: 4.6,
            verified: false,
            category: 'Grains',
            available: '1000 qtl'
        },
        {
            id: 5,
            name: 'Kashmiri Saffron',
            image: 'https://images.unsplash.com/photo-1588611910626-440a331f4964?auto=format&fit=crop&q=80&w=200',
            price: '₹250/g',
            location: 'Pampore, Kashmir',
            rating: 5.0,
            verified: true,
            category: 'Spices',
            available: '2 kg'
        },
    ];

    const filteredCommodities = commodities.filter(item =>
        (activeFilter === 'All' || item.category === activeFilter) &&
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            {/* Search Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Find Commodities</h1>
                    <p className="text-gray-500">Discover fresh produce from verified sellers</p>
                </div>

                <div className="relative min-w-[300px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Search for rice, onions, wheat..."
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all font-medium text-gray-700 shadow-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Filters */}
            <div className="flex overflow-x-auto pb-2 gap-2 scrollbar-hide">
                {categories.map((cat) => (
                    <button
                        key={cat}
                        onClick={() => setActiveFilter(cat)}
                        className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${activeFilter === cat
                                ? 'bg-green-600 text-white shadow-md shadow-green-200'
                                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                            }`}
                    >
                        {cat}
                    </button>
                ))}
                <button className="px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap bg-white text-gray-600 hover:bg-gray-50 border border-gray-200 flex items-center gap-2">
                    <Filter size={14} />
                    More Filters
                </button>
            </div>

            {/* Results Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredCommodities.map((item) => (
                    <div key={item.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow group cursor-pointer">
                        <div className="relative h-48 overflow-hidden">
                            <img
                                src={item.image}
                                alt={item.name}
                                className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                            />
                            <div className="absolute top-3 right-3">
                                <span className="bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg text-xs font-bold text-gray-800 shadow-sm">
                                    {item.available}
                                </span>
                            </div>
                            {item.verified && (
                                <div className="absolute bottom-3 left-3 bg-green-500/90 backdrop-blur-sm px-2 py-1 rounded-lg text-white text-xs font-bold flex items-center gap-1">
                                    <Star size={10} fill="currentColor" />
                                    Verified
                                </div>
                            )}
                        </div>

                        <div className="p-5">
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="font-bold text-lg text-gray-900 line-clamp-1">{item.name}</h3>
                                <span className="text-green-600 font-bold bg-green-50 px-2 py-1 rounded-lg text-sm whitespace-nowrap">
                                    {item.price}
                                </span>
                            </div>

                            <div className="flex items-center text-gray-500 text-sm mb-4">
                                <MapPin size={14} className="mr-1" />
                                <span className="truncate">{item.location}</span>
                                <span className="mx-2">•</span>
                                <span className="flex items-center text-amber-500 font-medium">
                                    {item.rating} <Star size={10} fill="currentColor" className="ml-0.5" />
                                </span>
                            </div>

                            <button
                                onClick={() => navigate(`/negotiations?commodity=${encodeURIComponent(item.name)}`)}
                                className="w-full py-2.5 bg-gray-900 text-white rounded-xl font-medium text-sm flex items-center justify-center gap-2 group/btn hover:bg-green-600 transition-colors"
                            >
                                Negotiate
                                <ArrowRight size={16} className="transform group-hover/btn:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SearchPage;
