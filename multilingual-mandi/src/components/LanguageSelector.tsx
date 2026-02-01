import React, { useState, useRef, useEffect } from 'react';
import { Globe, ChevronDown, Check } from 'lucide-react';

import type { Language } from '../types';

interface LanguageSelectorProps {
  selectedLanguage: Language;
  onLanguageChange: (language: Language) => void;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  showNativeNames?: boolean;
  className?: string;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  selectedLanguage,
  onLanguageChange,
  label,
  placeholder = 'Select language',
  disabled = false,
  showNativeNames = true,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  const supportedLanguages: Array<{
    code: Language;
    name: string;
    nativeName: string;
    region: string;
  }> = [
      { code: 'en', name: 'English', nativeName: 'English', region: 'Global' },
      { code: 'hi', name: 'Hindi', nativeName: 'हिंदी', region: 'North India' },
      { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', region: 'East India' },
      { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', region: 'South India' },
      { code: 'mr', name: 'Marathi', nativeName: 'मराठी', region: 'West India' },
      { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', region: 'South India' },
      { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', region: 'West India' },
      { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', region: 'South India' },
      { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', region: 'South India' },
      { code: 'or', name: 'Odia', nativeName: 'ଓଡ଼ିଆ', region: 'East India' },
      { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', region: 'North India' },
      { code: 'as', name: 'Assamese', nativeName: 'অসমীয়া', region: 'Northeast India' },
      { code: 'ur', name: 'Urdu', nativeName: 'اردو', region: 'North India' },
      { code: 'sd', name: 'Sindhi', nativeName: 'سنڌي', region: 'West India' },
      { code: 'ne', name: 'Nepali', nativeName: 'नेपाली', region: 'North India' },
      { code: 'ks', name: 'Kashmiri', nativeName: 'کٲشُر', region: 'North India' },
      { code: 'kok', name: 'Konkani', nativeName: 'कोंकणी', region: 'West India' },
      { code: 'mni', name: 'Manipuri', nativeName: 'মৈতৈলোন্', region: 'Northeast India' },
      { code: 'sat', name: 'Santali', nativeName: 'ᱥᱟᱱᱛᱟᱲᱤ', region: 'East India' },
      { code: 'doi', name: 'Dogri', nativeName: 'डोगरी', region: 'North India' },
      { code: 'mai', name: 'Maithili', nativeName: 'मैथिली', region: 'East India' },
      { code: 'bho', name: 'Bhojpuri', nativeName: 'भोजपुरी', region: 'East India' }
    ];

  const filteredLanguages = supportedLanguages.filter(lang => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      lang.name.toLowerCase().includes(term) ||
      lang.nativeName.toLowerCase().includes(term) ||
      lang.region.toLowerCase().includes(term)
    );
  });

  const selectedLangData = supportedLanguages.find(lang => lang.code === selectedLanguage);

  const handleLanguageSelect = (language: Language) => {
    onLanguageChange(language);
    setIsOpen(false);
    setSearchTerm('');
  };

  const getDisplayName = (lang: typeof supportedLanguages[0]): string => {
    if (showNativeNames && lang.nativeName !== lang.name) {
      return `${lang.name} (${lang.nativeName})`;
    }
    return lang.name;
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}

      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`w-full flex items-center justify-between px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors ${disabled
            ? 'bg-gray-50 text-gray-400 cursor-not-allowed'
            : 'hover:bg-gray-50 text-gray-900'
          }`}
      >
        <div className="flex items-center space-x-3">
          <Globe size={18} className="text-gray-400" />
          <span className="text-sm">
            {selectedLangData ? getDisplayName(selectedLangData) : placeholder}
          </span>
        </div>
        <ChevronDown
          size={16}
          className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-80 overflow-hidden">
          {/* Search Input */}
          <div className="p-3 border-b border-gray-200">
            <input
              ref={searchInputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search languages..."
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          {/* Language List */}
          <div className="max-h-60 overflow-y-auto">
            {filteredLanguages.length === 0 ? (
              <div className="px-4 py-3 text-sm text-gray-500 text-center">
                No languages found
              </div>
            ) : (
              filteredLanguages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => handleLanguageSelect(lang.code)}
                  className={`w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 transition-colors ${selectedLanguage === lang.code ? 'bg-green-50 text-green-700' : 'text-gray-900'
                    }`}
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <span className="font-medium">{lang.name}</span>
                      {showNativeNames && lang.nativeName !== lang.name && (
                        <span className="text-gray-500">({lang.nativeName})</span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">{lang.region}</div>
                  </div>
                  {selectedLanguage === lang.code && (
                    <Check size={16} className="text-green-600" />
                  )}
                </button>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-2 bg-gray-50 border-t border-gray-200">
            <div className="text-xs text-gray-500 text-center">
              {filteredLanguages.length} of {supportedLanguages.length} languages
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;