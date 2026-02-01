import React, { useState } from 'react';
import { Camera, RefreshCw, Upload, X, Search } from 'lucide-react';

const ScannerPage: React.FC = () => {
    const [scanning, setScanning] = useState(false);
    const [analyzing, setAnalyzing] = useState(false);
    const [result, setResult] = useState<null | {
        name: string;
        quality: string;
        confidence: number;
        marketPrice: string;
    }>(null);



    const startCamera = async () => {
        setScanning(true);
        setResult(null);
        // In a real app, we would request camera access here
        // navigator.mediaDevices.getUserMedia({ video: true })

        // Simulate finding something after a delay
        setTimeout(() => {
            setAnalyzing(true);
            setTimeout(() => {
                setAnalyzing(false);
                setScanning(false);
                setResult({
                    name: 'Fresh Tomato (Hybrid)',
                    quality: 'Premium - Grade A',
                    confidence: 98,
                    marketPrice: '₹25/kg'
                });
            }, 2000);
        }, 3000);
    };

    const stopCamera = () => {
        setScanning(false);
        setAnalyzing(false);
    };

    return (
        <div className="h-[calc(100vh-100px)] flex flex-col">
            <h1 className="text-2xl font-bold text-gray-900 mb-4 px-4">Price & Quality Scanner</h1>

            <div className="flex-1 bg-black rounded-3xl relative overflow-hidden shadow-2xl mx-4 mb-4">
                {/* Camera Viewfinder Mock */}
                <div className="absolute inset-0 flex items-center justify-center">
                    {scanning ? (
                        <div className="relative w-full h-full bg-gray-900">
                            <img
                                src="https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&q=80&w=400"
                                alt="Camera Feed"
                                className="w-full h-full object-cover opacity-60"
                            />

                            {/* Scanning Overlay */}
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-64 h-64 border-2 border-white/50 rounded-2xl relative">
                                    <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-green-500 -mt-1 -ml-1"></div>
                                    <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-green-500 -mt-1 -mr-1"></div>
                                    <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-green-500 -mb-1 -ml-1"></div>
                                    <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-green-500 -mb-1 -mr-1"></div>

                                    {/* Scanning Line Animation */}
                                    <div className="absolute top-0 left-0 right-0 h-0.5 bg-green-500 shadow-[0_0_10px_#22c55e] animate-scan"></div>
                                </div>
                            </div>

                            {analyzing && (
                                <div className="absolute bottom-10 left-0 right-0 text-center">
                                    <span className="inline-block bg-black/60 backdrop-blur-md text-white px-4 py-2 rounded-full text-sm font-medium animate-pulse">
                                        Analyzing Quality...
                                    </span>
                                </div>
                            )}
                        </div>
                    ) : result ? (
                        <div className="w-full h-full bg-gray-900 relative">
                            <img
                                src="https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&q=80&w=400"
                                alt="Captured"
                                className="w-full h-full object-cover opacity-40"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent"></div>
                        </div>
                    ) : (
                        <div className="text-center text-gray-500 p-8">
                            <Camera size={48} className="mx-auto mb-4 opacity-50" />
                            <p>Tap the camera button to scan commodities</p>
                        </div>
                    )}
                </div>

                {/* Start/Stop Controls */}
                {!result && (
                    <div className="absolute bottom-8 left-0 right-0 flex justify-center items-center gap-8">
                        <button className="p-4 rounded-full bg-white/10 backdrop-blur-md text-white hover:bg-white/20 transition-colors">
                            <Upload size={24} />
                        </button>

                        <button
                            onClick={scanning ? stopCamera : startCamera}
                            className={`w-20 h-20 rounded-full border-4 flex items-center justify-center transition-all ${scanning ? 'border-red-500 bg-red-500/20' : 'border-white bg-white/20'
                                }`}
                        >
                            <div className={`rounded-full transition-all ${scanning ? 'w-8 h-8 bg-red-500 rounded-md' : 'w-16 h-16 bg-white'
                                }`}></div>
                        </button>

                        <button className="p-4 rounded-full bg-white/10 backdrop-blur-md text-white hover:bg-white/20 transition-colors">
                            <RefreshCw size={24} />
                        </button>
                    </div>
                )}

                {/* Result Card */}
                {result && (
                    <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl p-6 animate-slide-up">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">{result.name}</h2>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-bold rounded-full border border-green-200">
                                        {result.quality}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                        Confidence: {result.confidence}%
                                    </span>
                                </div>
                            </div>
                            <button
                                onClick={() => setResult(null)}
                                className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                                <p className="text-xs text-gray-500 mb-1">Est. Market Price</p>
                                <p className="text-lg font-bold text-gray-900">{result.marketPrice}</p>
                            </div>
                            <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                                <p className="text-xs text-gray-500 mb-1">Shelf Life</p>
                                <p className="text-lg font-bold text-gray-900">~ 5-7 Days</p>
                            </div>
                        </div>

                        <button className="w-full py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-colors flex items-center justify-center gap-2">
                            <Search size={18} />
                            Check Prices Nearby
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ScannerPage;
