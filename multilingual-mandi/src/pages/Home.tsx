import { useNavigate } from 'react-router-dom';
import { Languages, TrendingUp, Users, Shield } from 'lucide-react';

export const Home = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-white">
            {/* Hero Section */}
            <div className="relative overflow-hidden bg-white">
                <div className="mx-auto max-w-7xl">
                    <div className="relative z-10 bg-white pb-8 sm:pb-16 md:pb-20 lg:w-full lg:max-w-2xl lg:pb-28 xl:pb-32">
                        <main className="mx-auto mt-10 max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
                            <div className="sm:text-center lg:text-left">
                                <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
                                    <span className="block xl:inline">India's First</span>{' '}
                                    <span className="block text-green-600 xl:inline">Multilingual Mandi</span>
                                </h1>
                                <p className="mt-3 text-base text-gray-500 sm:mx-auto sm:mt-5 sm:max-w-xl sm:text-lg md:mt-5 md:text-xl lg:mx-0">
                                    Connect directly with mandis across India in your own language.
                                    Fair prices, smart negotiations, and secure payments - all in one place.
                                </p>
                                <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                                    <div className="rounded-md shadow">
                                        <button
                                            onClick={() => navigate('/auth')}
                                            className="flex w-full items-center justify-center rounded-md border border-transparent bg-green-600 px-8 py-3 text-base font-medium text-white hover:bg-green-700 md:py-4 md:px-10 md:text-lg"
                                        >
                                            Get Started
                                        </button>
                                    </div>
                                    <div className="mt-3 sm:mt-0 sm:ml-3">
                                        <button
                                            onClick={() => navigate('/auth')}
                                            className="flex w-full items-center justify-center rounded-md border border-transparent bg-green-100 px-8 py-3 text-base font-medium text-green-700 hover:bg-green-200 md:py-4 md:px-10 md:text-lg"
                                        >
                                            View Prices
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </main>
                    </div>
                </div>
                <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2">
                    <img
                        className="h-56 w-full object-cover sm:h-72 md:h-96 lg:h-full lg:w-full"
                        src="https://images.unsplash.com/photo-1605000797499-95a51c5269ae?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1471&q=80"
                        alt="Indian Farmers in field"
                    />
                </div>
            </div>

            {/* Features Section */}
            <div className="py-12 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="lg:text-center">
                        <h2 className="text-base text-green-600 font-semibold tracking-wide uppercase">Features</h2>
                        <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                            Empowering Every Farmer
                        </p>
                    </div>

                    <div className="mt-10">
                        <dl className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10">
                            <div className="relative">
                                <dt>
                                    <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-green-500 text-white">
                                        <Languages className="h-6 w-6" />
                                    </div>
                                    <p className="ml-16 text-lg leading-6 font-medium text-gray-900">22+ Languages</p>
                                </dt>
                                <dd className="mt-2 ml-16 text-base text-gray-500">
                                    Chat, trade, and negotiate in your native language with real-time translation.
                                </dd>
                            </div>

                            <div className="relative">
                                <dt>
                                    <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-green-500 text-white">
                                        <TrendingUp className="h-6 w-6" />
                                    </div>
                                    <p className="ml-16 text-lg leading-6 font-medium text-gray-900">Fair Price Engine</p>
                                </dt>
                                <dd className="mt-2 ml-16 text-base text-gray-500">
                                    AI-powered price discovery ensures you get the best market rates.
                                </dd>
                            </div>

                            <div className="relative">
                                <dt>
                                    <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-green-500 text-white">
                                        <Users className="h-6 w-6" />
                                    </div>
                                    <p className="ml-16 text-lg leading-6 font-medium text-gray-900">Direct Connection</p>
                                </dt>
                                <dd className="mt-2 ml-16 text-base text-gray-500">
                                    Connect directly with buyers and sellers, cutting out unnecessary middlemen.
                                </dd>
                            </div>

                            <div className="relative">
                                <dt>
                                    <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-green-500 text-white">
                                        <Shield className="h-6 w-6" />
                                    </div>
                                    <p className="ml-16 text-lg leading-6 font-medium text-gray-900">Secure Payments</p>
                                </dt>
                                <dd className="mt-2 ml-16 text-base text-gray-500">
                                    Trusted transactions with our verified payment and escrow systems.
                                </dd>
                            </div>
                        </dl>
                    </div>
                </div>
            </div>
        </div>
    );
};


