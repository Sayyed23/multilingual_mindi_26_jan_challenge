import React from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import Layout from './components/Layout';

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="vibrant-gradient p-8 rounded-3xl text-white shadow-lg">
        <h2 className="text-3xl font-bold mb-2">Welcome to Multilingual Mandi</h2>
        <p className="opacity-90">AI-powered marketplace connecting farmers and buyers across India.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold mb-2">Market Prices</h3>
          <p className="text-slate-500 text-sm mb-4">Real-time price intelligence from 100+ mandis.</p>
          <button
            onClick={() => navigate('/market')}
            className="primary-button w-full"
          >
            View Market
          </button>
        </div>
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold mb-2">New Negotiation</h3>
          <p className="text-slate-500 text-sm mb-4">Start a deal with AI-powered translation.</p>
          <button
            onClick={() => navigate('/chats')}
            className="primary-button w-full"
          >
            Start Chat
          </button>
        </div>
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold mb-2">Price Scanner</h3>
          <p className="text-slate-500 text-sm mb-4">Scan and verify fair prices instantly.</p>
          <button
            onClick={() => navigate('/scanner')}
            className="primary-button w-full"
          >
            Open Scanner
          </button>
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="market" element={<div>Market Trends (Coming Soon)</div>} />
          <Route path="search" element={<div>Search Commodities (Coming Soon)</div>} />
          <Route path="chats" element={<div>Your Negotiations (Coming Soon)</div>} />
          <Route path="scanner" element={<div>Price Scanner (Coming Soon)</div>} />
          <Route path="profile" element={<div>User Profile (Coming Soon)</div>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
