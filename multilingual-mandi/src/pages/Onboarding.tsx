import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Volume2,
    Globe,
    Tractor,
    MapPin,
    Search,
    ChevronDown,
    ArrowRight,
    Check,
    Mic,
    MessageSquare,
    BarChart3
} from 'lucide-react';

export const Onboarding = () => {
    const navigate = useNavigate();
    const [radius, setRadius] = useState(50);
    const [commMode, setCommMode] = useState<'text' | 'voice'>('text');
    const [selectedCommodities, setSelectedCommodities] = useState<string[]>(['Wheat', 'Tomato']);
    const [isPlaying, setIsPlaying] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLocating, setIsLocating] = useState(false);
    const [secondaryLanguage, setSecondaryLanguage] = useState<string>('Hindi (हिंदी)');

    const handleUseCurrentLocation = () => {
        if (!navigator.geolocation) {
            alert("Geolocation is not supported by your browser.");
            return;
        }

        setIsLocating(true);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                console.log(`Current position: ${latitude}, ${longitude}`);
                // TODO: Implement reverse geocoding to convert coordinates to a Mandi name
                setTimeout(() => {
                    setSearchQuery("Indore, MP");
                    setIsLocating(false);
                }, 1000);
            },
            (error) => {
                setIsLocating(false);
                console.error("Error obtaining location:", error);
                alert("Unable to retrieve your location. Please check your browser permissions.");
            }
        );
    };

    const playAudioGuide = () => {
        setIsPlaying(!isPlaying);
        // In a real app, this would control an audio object
        console.log(isPlaying ? "Stopping audio guide..." : "Playing audio guide...");
    };

    const commodities = [
        { name: 'Wheat', icon: '🌾' },
        { name: 'Rice', icon: '🍚' },
        { name: 'Tomato', icon: '🍅' },
        { name: 'Cotton', icon: '☁️' },
        { name: 'Sugarcane', icon: '🎋' },
        { name: 'Onion', icon: '🧅' },
        { name: 'Maize', icon: '🌽' },
        { name: 'Potato', icon: '🥔' },
    ];

    const toggleCommodity = (name: string) => {
        if (selectedCommodities.includes(name)) {
            setSelectedCommodities(selectedCommodities.filter(c => c !== name));
        } else {
            if (selectedCommodities.length < 5) {
                setSelectedCommodities([...selectedCommodities, name]);
            }
        }
    };

    const handleCompleteOnboarding = () => {
        const profileData = {
            radius,
            commMode,
            selectedCommodities,
            searchQuery,
            secondaryLanguage
        };
        console.log("Onboarding Complete! Profile Data:", profileData);
        // TODO: Persist profileData to a backend or global state
        navigate('/dashboard');
    };

    return (
        <div className="min-h-screen bg-[#F8F9FA] font-sans text-gray-900 pb-24 md:pb-0">
            {/* Header */}
            <header className="bg-white px-6 py-4 flex justify-between items-center shadow-sm sticky top-0 z-50">
                <div className="flex items-center gap-2">
                    <Tractor className="h-6 w-6 text-green-600" />
                    <span className="font-bold text-xl tracking-tight">AgriMarket</span>
                </div>
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="text-sm font-semibold text-gray-500 hover:text-gray-900 hidden sm:block"
                    >
                        Skip for now
                    </button>
                    <button
                        onClick={() => console.log("Language selector clicked - TODO: show modal")}
                        className="flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-lg text-sm font-semibold hover:bg-gray-200 transition-colors"
                    >
                        <Globe className="h-4 w-4 text-gray-600" />
                        English
                    </button>
                    <button
                        onClick={() => console.log("Analytics clicked - TODO: show insights panel")}
                        className="bg-green-100 p-2 rounded-lg text-green-700 hover:bg-green-200 transition-colors"
                    >
                        <BarChart3 className="h-5 w-5" />
                    </button>
                </div>
            </header>

            <main className="max-w-3xl mx-auto px-4 py-8 space-y-8">

                {/* Progress Bar */}
                <div className="bg-white rounded-2xl p-6 shadow-sm">
                    <div className="flex justify-between items-end mb-2">
                        <div>
                            <span className="text-xs font-bold text-green-600 uppercase tracking-wider">Profile Setup</span>
                            <h2 className="text-xl font-bold">Step 2 of 4</h2>
                        </div>
                        <span className="text-sm font-bold text-gray-500">50% Complete</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-green-500 w-1/2 rounded-full"></div>
                    </div>
                </div>

                {/* Title */}
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-extrabold text-gray-900">Let's set up your profile</h1>
                    <div className="flex items-center justify-center gap-2 text-gray-500">
                        <p className="text-sm">Personalize your experience to get accurate price alerts.</p>
                        <button
                            onClick={playAudioGuide}
                            aria-label={isPlaying ? "Stop Audio" : "Play Audio Intro"}
                            className="flex items-center gap-1 text-green-600 font-bold text-sm hover:underline focus:outline-none focus:ring-1 focus:ring-green-500 rounded px-1"
                        >
                            <Volume2 className={`h-4 w-4 ${isPlaying ? 'animate-pulse' : ''}`} />
                            {isPlaying ? "Stop Audio" : "Play Audio"}
                        </button>
                    </div>
                </div>

                {/* Identity Card */}
                <section>
                    <h3 className="font-bold text-lg mb-4">Your Identity</h3>
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex justify-between items-center">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="bg-green-100 text-green-700 p-1 rounded">
                                    <Tractor className="h-4 w-4" />
                                </span>
                                <span className="text-xl font-bold">Role: Farmer</span>
                            </div>
                            <p className="text-xs text-green-600 mb-4 font-medium">You will receive updates for harvesting and market selling prices.</p>
                            <button
                                onClick={() => navigate('/auth')}
                                className="bg-green-50 text-green-700 px-4 py-2 rounded-lg text-sm font-bold hover:bg-green-100 transition-colors"
                            >
                                Change Role
                            </button>
                        </div>
                        <div className="w-24 h-24 rounded-xl overflow-hidden shadow-md bg-gray-100 flex items-center justify-center">
                            <img
                                src="https://images.unsplash.com/photo-1595661608226-e41c2c31c944?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80"
                                alt="Farmer"
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src = 'https://ui-avatars.com/api/?name=Farmer&background=E8F5E9&color=2E7D32&bold=true';
                                }}
                            />
                        </div>
                    </div>
                </section>

                {/* Communication Preferences */}
                <section>
                    <h3 className="font-bold text-lg mb-4">Communication Preferences</h3>
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 grid md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-bold text-gray-500 mb-2">Preferred Mode</label>
                            <div className="bg-gray-100 p-1 rounded-xl flex">
                                <button
                                    onClick={() => setCommMode('text')}
                                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold transition-all ${commMode === 'text' ? 'bg-white text-green-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                >
                                    <MessageSquare className="h-4 w-4" />
                                    Text
                                </button>
                                <button
                                    onClick={() => setCommMode('voice')}
                                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold transition-all ${commMode === 'voice' ? 'bg-white text-green-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                >
                                    <Mic className="h-4 w-4" />
                                    Voice
                                </button>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-500 mb-2">Secondary Language</label>
                            <div className="relative">
                                <select
                                    value={secondaryLanguage}
                                    onChange={(e) => setSecondaryLanguage(e.target.value)}
                                    className="w-full appearance-none bg-gray-100 border-none rounded-xl py-3 px-4 font-bold text-gray-900 focus:ring-2 focus:ring-green-500"
                                >
                                    <option value="Hindi (हिंदी)">Hindi (हिंदी)</option>
                                    <option value="Punjabi (ਪੰਜਾਬੀ)">Punjabi (ਪੰਜਾਬੀ)</option>
                                    <option value="Marathi (मराठी)">Marathi (मराठी)</option>
                                </select>
                                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 pointer-events-none" />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Location - Map Placeholder */}
                <section>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-lg">Nearby Mandis (Markets)</h3>
                        <button
                            onClick={handleUseCurrentLocation}
                            disabled={isLocating}
                            className={`text-green-600 text-xs font-bold flex items-center gap-1 hover:underline ${isLocating ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            <MapPin className={`h-3 w-3 ${isLocating ? 'animate-spin' : ''}`} />
                            {isLocating ? "Detecting..." : "Use Current Location"}
                            {/* TODO: Integrate with Google Maps API for real-time location picking */}
                        </button>
                    </div>

                    <div className="bg-white rounded-2xl p-2 shadow-sm border border-gray-100 space-y-4">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search by city or Mandi name"
                                className="w-full bg-gray-50 pl-11 pr-4 py-3 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-green-500"
                            />
                            {/* TODO: Implement Mandi search API with debounced autocomplete */}
                        </div>

                        <div className="relative h-48 rounded-xl overflow-hidden bg-gradient-to-br from-green-800 to-green-600 flex items-center justify-center">
                            {/* Texture overlay (simulated) */}
                            <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '20px 20px' }}></div>

                            <div className="bg-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 z-10 animate-bounce">
                                <MapPin className="h-5 w-5 text-green-600 fill-current" />
                                <span className="font-bold text-xs text-gray-900">Indore Grain Market</span>
                            </div>
                        </div>

                        <div className="px-4 pb-2">
                            <div className="flex justify-between text-xs font-bold text-gray-900 mb-2">
                                <span>Search Radius</span>
                                <span className="text-green-600">{radius} km</span>
                            </div>
                            <input
                                type="range"
                                min="5"
                                max="200"
                                value={radius}
                                onChange={(e) => setRadius(Number(e.target.value))}
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-500"
                            />
                            <div className="flex justify-between text-[10px] text-gray-400 font-bold mt-1">
                                <span>5 KM</span>
                                <span>200 KM</span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Commodities */}
                <section>
                    <h3 className="font-bold text-lg mb-1">What do you grow or trade?</h3>
                    <p className="text-xs text-slate-500 mb-4">Select up to 5 commodities for daily price tracking.</p>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {commodities.map((item) => {
                            const isSelected = selectedCommodities.includes(item.name);
                            return (
                                <button
                                    key={item.name}
                                    onClick={() => toggleCommodity(item.name)}
                                    className={`relative p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-3 ${isSelected
                                        ? 'bg-white border-green-500 shadow-md shadow-green-100'
                                        : 'bg-white border-gray-100 hover:border-green-200'
                                        }`}
                                >
                                    {isSelected && (
                                        <div className="absolute top-2 right-2 bg-green-500 rounded-full p-0.5">
                                            <Check className="h-3 w-3 text-white" />
                                        </div>
                                    )}
                                    <span className="text-4xl filter drop-shadow-sm">{item.icon}</span>
                                    <span className={`text-sm font-bold ${isSelected ? 'text-gray-900' : 'text-gray-600'}`}>
                                        {item.name}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </section>

                {/* Footer Action */}
                <div className="pt-4">
                    <button
                        onClick={handleCompleteOnboarding}
                        className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-green-200 transition-transform active:scale-[0.98]"
                    >
                        <span>Continue to Dashboard</span>
                        <ArrowRight className="h-5 w-5" />
                    </button>
                    <p className="text-center text-[10px] text-gray-400 mt-4">
                        By continuing, you agree to our <a href="/terms" className="underline hover:text-gray-600">Terms of Service</a>.
                    </p>                </div>

            </main>

            {/* Floating Audio Help */}
            <div className="fixed bottom-6 right-6 z-40">
                <button
                    onClick={playAudioGuide}
                    aria-label={isPlaying ? "Stop Audio Guide" : "Play Audio Guide"}
                    className="bg-white pl-4 pr-2 py-2 rounded-full shadow-xl border border-gray-100 flex items-center gap-3 hover:scale-105 transition-transform group focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                    <div className="bg-green-500 p-2 rounded-full">
                        <Volume2 className={`h-5 w-5 text-white ${isPlaying ? 'animate-none' : 'animate-pulse'}`} />
                    </div>
                    <div className="text-left mr-2">
                        <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Need Help?</span>
                        <span className="block text-sm font-bold text-gray-900">
                            {isPlaying ? "Stop Guide" : "Play Audio Guide"}
                        </span>
                    </div>
                </button>
            </div>
        </div>
    );
};
