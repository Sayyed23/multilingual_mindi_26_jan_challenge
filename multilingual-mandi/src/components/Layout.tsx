import React from 'react';
import { Outlet } from 'react-router-dom';
import RoleBasedNavigation from './RoleBasedNavigation';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../contexts/LanguageContext';
import T from './T';
import { Volume2, VolumeX } from 'lucide-react';
import LanguageSelector from './LanguageSelector';
import VoiceNavigation from './VoiceNavigation';

const Layout: React.FC = () => {
    const { user } = useAuth();
    const { voiceMode, setVoiceMode, currentLanguage, setLanguage } = useLanguage();

    return (
        <div className="min-h-screen bg-slate-50 pb-20 md:pb-0 md:pl-20">
            <VoiceNavigation />
            <header className="sticky top-0 z-50 glass-card mx-4 my-2 p-4 flex flex-col md:flex-row justify-between items-center md:hidden gap-4">
                <div className="flex justify-between items-center w-full">
                    <h1 className="text-xl font-bold vibrant-gradient bg-clip-text text-transparent">
                        <T>AgriMandi</T>
                    </h1>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setVoiceMode(!voiceMode)}
                            className={`p-2 rounded-lg transition-colors ${voiceMode ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}
                            title={voiceMode ? 'Disable Voice Mode' : 'Enable Voice Mode'}
                        >
                            {voiceMode ? <Volume2 size={20} /> : <VolumeX size={20} />}
                        </button>
                        {user && (
                            <div className="text-sm text-gray-600 capitalize bg-gray-100 px-2 py-1 rounded-md">
                                <T>{user.role}</T>
                            </div>
                        )}
                    </div>
                </div>

                <div className="w-full">
                    <LanguageSelector
                        selectedLanguage={currentLanguage}
                        onLanguageChange={setLanguage}
                        className="w-full"
                    />
                </div>
            </header>

            <RoleBasedNavigation />

            <main className="p-4 md:p-8 max-w-7xl mx-auto relative cursor-default">
                {/* Desktop Header */}
                <div className="hidden md:flex justify-between items-center mb-8 bg-white/80 backdrop-blur-md p-4 rounded-2xl border border-gray-100 shadow-sm sticky top-4 z-40 transition-all hover:shadow-md">
                    <div>
                        <h1 className="text-2xl font-black vibrant-gradient bg-clip-text text-transparent tracking-tight">
                            <T>AgriMandi</T>
                        </h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setVoiceMode(!voiceMode)}
                            className={`p-2.5 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 ${voiceMode
                                    ? 'bg-green-100 text-green-600 shadow-sm'
                                    : 'bg-white border border-gray-200 text-gray-400 hover:border-green-400 hover:text-green-500'
                                }`}
                            title={voiceMode ? 'Disable Voice Mode' : 'Enable Voice Mode'}
                        >
                            {voiceMode ? <Volume2 size={20} /> : <VolumeX size={20} />}
                        </button>

                        <div className="w-64">
                            <LanguageSelector
                                selectedLanguage={currentLanguage}
                                onLanguageChange={setLanguage}
                                className="w-full"
                            />
                        </div>

                        {user && (
                            <div className="flex items-center gap-3 px-4 py-2 bg-white border border-gray-200 rounded-xl shadow-sm hover:border-green-200 transition-colors cursor-pointer group">
                                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-white font-bold text-sm shadow-sm group-hover:scale-105 transition-transform">
                                    {user.name ? user.name.charAt(0).toUpperCase() : user.role.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm font-bold text-gray-800 leading-none group-hover:text-green-600 transition-colors">
                                        <T>{user.name || 'User'}</T>
                                    </span>
                                    <span className="text-xs text-gray-500 capitalize leading-none mt-1">
                                        <T>{user.role}</T>
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                <div className="mt-8">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default Layout;
