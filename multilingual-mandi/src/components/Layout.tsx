import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { Home, Search, MessageSquare, User, TrendingUp } from 'lucide-react';

const Layout: React.FC = () => {
    return (
        <div className="min-h-screen bg-slate-50 pb-20 md:pb-0 md:pl-20">
            <header className="sticky top-0 z-50 glass-card mx-4 my-2 p-4 flex justify-between items-center md:hidden">
                <h1 className="text-xl font-bold vibrant-gradient bg-clip-text text-transparent">AgriMandi</h1>
                <div className="flex gap-2">
                    {/* Header Actions can go here */}
                </div>
            </header>

            <nav className="hidden md:flex flex-col fixed left-0 top-0 bottom-0 w-20 bg-white border-r border-slate-200 items-center py-8 gap-8 z-50">
                <div className="w-12 h-12 vibrant-gradient rounded-xl mb-4 flex items-center justify-center text-white font-bold">M</div>
                <NavLink to="/" end aria-label="Home" className={({ isActive }) => `p-3 rounded-xl transition-colors ${isActive ? 'bg-emerald-50 text-emerald-600' : 'text-slate-400 hover:text-slate-600'}`}>
                    <Home size={24} />
                </NavLink>
                <NavLink to="/market" aria-label="Market" className={({ isActive }) => `p-3 rounded-xl transition-colors ${isActive ? 'bg-emerald-50 text-emerald-600' : 'text-slate-400 hover:text-slate-600'}`}>
                    <TrendingUp size={24} />
                </NavLink>
                <NavLink to="/search" aria-label="Search" className={({ isActive }) => `p-3 rounded-xl transition-colors ${isActive ? 'bg-emerald-50 text-emerald-600' : 'text-slate-400 hover:text-slate-600'}`}>
                    <Search size={24} />
                </NavLink>
                <NavLink to="/chats" aria-label="Chats" className={({ isActive }) => `p-3 rounded-xl transition-colors ${isActive ? 'bg-emerald-50 text-emerald-600' : 'text-slate-400 hover:text-slate-600'}`}>
                    <MessageSquare size={24} />
                </NavLink>
                <NavLink to="/profile" aria-label="Profile" className={({ isActive }) => `p-3 rounded-xl transition-colors ${isActive ? 'bg-emerald-50 text-emerald-600' : 'text-slate-400 hover:text-slate-600'}`}>
                    <User size={24} />
                </NavLink>            </nav>

            <main className="p-4 md:p-8 max-w-7xl mx-auto">
                <Outlet />
            </main>

            <nav className="mobile-navigation md:hidden">
                <NavLink to="/" end className={({ isActive }) => `flex flex-col items-center gap-1 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`}>                    <Home size={22} />
                    <span className="text-[10px] font-medium">Home</span>
                </NavLink>
                <NavLink to="/market" className={({ isActive }) => `flex flex-col items-center gap-1 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`}>
                    <TrendingUp size={22} />
                    <span className="text-[10px] font-medium">Market</span>
                </NavLink>
                <NavLink to="/search" className={({ isActive }) => `flex flex-col items-center gap-1 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`}>
                    <Search size={22} />
                    <span className="text-[10px] font-medium">Search</span>
                </NavLink>
                <NavLink to="/chats" className={({ isActive }) => `flex flex-col items-center gap-1 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`}>
                    <MessageSquare size={22} />
                    <span className="text-[10px] font-medium">Chats</span>
                </NavLink>
                <NavLink to="/profile" className={({ isActive }) => `flex flex-col items-center gap-1 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`}>
                    <User size={22} />
                    <span className="text-[10px] font-medium">Profile</span>
                </NavLink>
            </nav>
        </div>
    );
};

export default Layout;
