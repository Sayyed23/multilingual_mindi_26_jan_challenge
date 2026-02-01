import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, ChevronLeft, User, Building, MapPin, Globe, CheckCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { profileManagementService } from '../services/profileManagement';
import type { Language, Location } from '../types';

interface OnboardingData {
  name: string;
  phone: string;
  language: Language;
  location: Location;
  businessName?: string;
  commodities: string[];
}

const OnboardingPage: React.FC = () => {
  const { user, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [data, setData] = useState<OnboardingData>({
    name: '',
    phone: '',
    language: 'en',
    location: {
      state: '',
      district: '',
      city: '',
      pincode: ''
    },
    businessName: '',
    commodities: []
  });

  const totalSteps = user?.role === 'vendor' || user?.role === 'agent' ? 4 : 3;

  const languageOptions: { code: Language; name: string }[] = [
    { code: 'en', name: 'English' },
    { code: 'hi', name: 'हिंदी (Hindi)' },
    { code: 'bn', name: 'বাংলা (Bengali)' },
    { code: 'te', name: 'తెలుగు (Telugu)' },
    { code: 'mr', name: 'मराठी (Marathi)' },
    { code: 'ta', name: 'தமிழ் (Tamil)' },
    { code: 'gu', name: 'ગુજરાતી (Gujarati)' },
    { code: 'kn', name: 'ಕನ್ನಡ (Kannada)' },
    { code: 'ml', name: 'മലയാളം (Malayalam)' },
    { code: 'pa', name: 'ਪੰਜਾਬੀ (Punjabi)' }
  ];

  const commonCommodities = [
    'Rice', 'Wheat', 'Pulses', 'Maize', 'Sugarcane', 'Cotton',
    'Soybean', 'Groundnut', 'Mustard', 'Barley', 'Gram', 'Tur',
    'Moong', 'Urad', 'Masoor', 'Onion', 'Potato', 'Tomato'
  ];

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleCommodityToggle = (commodity: string) => {
    setData(prev => ({
      ...prev,
      commodities: prev.commodities.includes(commodity)
        ? prev.commodities.filter(c => c !== commodity)
        : [...prev.commodities, commodity]
    }));
  };

  const handleComplete = async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      // Mark onboarding as completed and update profile
      await profileManagementService.completeOnboarding(user.uid, {
        personalInfo: {
          name: data.name,
          phone: data.phone,
          language: data.language,
          location: data.location
        },
        businessInfo: {
          businessName: data.businessName,
          commodities: data.commodities,
          operatingRegions: [data.location]
        }
      });

      await refreshProfile();
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to complete onboarding');
    } finally {
      setLoading(false);
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return data.name.trim().length > 0 && data.phone.trim().length > 0;
      case 2:
        return data.location.state.trim().length > 0 &&
          data.location.city.trim().length > 0 &&
          data.location.pincode.trim().length > 0;
      case 3:
        return true; // Language selection is optional
      case 4:
        return true; // Business info is optional
      default:
        return false;
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <p className="text-gray-500">Please sign in to continue</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="glass-card p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 vibrant-gradient rounded-2xl mx-auto mb-4 flex items-center justify-center">
              <span className="text-2xl font-bold text-white">M</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome to Mandi!</h1>
            <p className="text-gray-600">Let's set up your profile</p>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between text-xs text-gray-500 mb-2">
              <span>Step {currentStep} of {totalSteps}</span>
              <span>{Math.round((currentStep / totalSteps) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / totalSteps) * 100}%` }}
              />
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          {/* Step Content */}
          <div className="space-y-6">
            {/* Step 1: Personal Information */}
            {currentStep === 1 && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <User className="text-green-600" size={20} />
                  <h2 className="text-lg font-semibold">Personal Information</h2>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={data.name}
                      onChange={(e) => setData({ ...data, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      value={data.phone}
                      onChange={(e) => setData({ ...data, phone: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Enter your phone number"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Location */}
            {currentStep === 2 && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <MapPin className="text-green-600" size={20} />
                  <h2 className="text-lg font-semibold">Location</h2>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      State *
                    </label>
                    <input
                      type="text"
                      value={data.location.state}
                      onChange={(e) => setData({
                        ...data,
                        location: { ...data.location, state: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Enter your state"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      District
                    </label>
                    <input
                      type="text"
                      value={data.location.district}
                      onChange={(e) => setData({
                        ...data,
                        location: { ...data.location, district: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Enter your district"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        City *
                      </label>
                      <input
                        type="text"
                        value={data.location.city}
                        onChange={(e) => setData({
                          ...data,
                          location: { ...data.location, city: e.target.value }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="City"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        PIN Code *
                      </label>
                      <input
                        type="text"
                        value={data.location.pincode}
                        onChange={(e) => setData({
                          ...data,
                          location: { ...data.location, pincode: e.target.value }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="PIN"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Language Preference */}
            {currentStep === 3 && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Globe className="text-green-600" size={20} />
                  <h2 className="text-lg font-semibold">Language Preference</h2>
                </div>
                <p className="text-gray-600 text-sm mb-4">
                  Choose your preferred language for the app interface
                </p>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {languageOptions.map((lang) => (
                    <label
                      key={lang.code}
                      className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${data.language === lang.code
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-300 hover:border-gray-400'
                        }`}
                    >
                      <input
                        type="radio"
                        name="language"
                        value={lang.code}
                        checked={data.language === lang.code}
                        onChange={(e) => setData({ ...data, language: e.target.value as Language })}
                        className="sr-only"
                      />
                      <div className={`font-medium ${data.language === lang.code ? 'text-green-900' : 'text-gray-900'
                        }`}>
                        {lang.name}
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Step 4: Business Information (for vendors/agents) */}
            {currentStep === 4 && (user.role === 'vendor' || user.role === 'agent') && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Building className="text-green-600" size={20} />
                  <h2 className="text-lg font-semibold">Business Information</h2>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Business Name (Optional)
                    </label>
                    <input
                      type="text"
                      value={data.businessName}
                      onChange={(e) => setData({ ...data, businessName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Enter your business name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Commodities You Deal With
                    </label>
                    <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                      {commonCommodities.map((commodity) => (
                        <label
                          key={commodity}
                          className={`flex items-center p-2 border rounded cursor-pointer text-sm transition-colors ${data.commodities.includes(commodity)
                            ? 'border-green-500 bg-green-50 text-green-900'
                            : 'border-gray-300 hover:border-gray-400'
                            }`}
                        >
                          <input
                            type="checkbox"
                            checked={data.commodities.includes(commodity)}
                            onChange={() => handleCommodityToggle(commodity)}
                            className="sr-only"
                          />
                          {commodity}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            <button
              onClick={handlePrevious}
              disabled={currentStep === 1}
              className="flex items-center gap-1 px-4 py-2 text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={16} />
              Previous
            </button>

            {currentStep === totalSteps ? (
              <button
                onClick={handleComplete}
                disabled={loading || !isStepValid()}
                className="primary-button flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  'Completing...'
                ) : (
                  <>
                    <CheckCircle size={16} />
                    Complete Setup
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={handleNext}
                disabled={!isStepValid()}
                className="primary-button flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
                <ChevronRight size={16} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingPage;