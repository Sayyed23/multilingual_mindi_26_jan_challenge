import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, Building, Globe, Shield, Edit3, Save, X, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { profileManagementService } from '../services/profileManagement';
import T from '../components/T';
import type { UserProfile, Language } from '../types';

const ProfilePage: React.FC = () => {
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const userProfile = await profileManagementService.getUserProfile(user.uid);
      setProfile(userProfile);
    } catch (err) {
      setError('Failed to load profile');
      console.error('Profile load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (section: string) => {
    if (!profile) return;

    setEditingSection(section);
    setError(null);
    setSuccess(null);

    // Initialize form data based on section
    switch (section) {
      case 'personal':
        setFormData({
          name: profile.personalInfo.name || '',
          phone: profile.personalInfo.phone || '',
          language: profile.personalInfo.language || 'en',
          location: { ...profile.personalInfo.location }
        });
        break;
      case 'business':
        setFormData({
          businessName: profile.businessInfo.businessName || '',
          commodities: profile.businessInfo.commodities.join(', ') || ''
        });
        break;
      case 'notifications':
        setFormData({ ...profile.preferences.notifications });
        break;
      case 'privacy':
        setFormData({ ...profile.preferences.privacy });
        break;
    }
  };

  const handleSave = async (section: string) => {
    if (!user || !profile) return;

    try {
      setLoading(true);
      let updateData: any = {};

      switch (section) {
        case 'personal':
          updateData = {
            personalInfo: {
              name: formData.name,
              phone: formData.phone,
              language: formData.language,
              location: formData.location
            }
          };
          break;
        case 'business':
          updateData = {
            businessInfo: {
              businessName: formData.businessName,
              commodities: formData.commodities.split(',').map((c: string) => c.trim()).filter(Boolean)
            }
          };
          break;
        case 'notifications':
          updateData = {
            preferences: {
              notifications: formData
            }
          };
          break;
        case 'privacy':
          updateData = {
            preferences: {
              privacy: formData
            }
          };
          break;
      }

      await profileManagementService.updateUserProfile(user.uid, updateData);
      await loadProfile(); // Reload to get updated data
      setEditingSection(null);
      setSuccess('Profile updated successfully');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setEditingSection(null);
    setFormData({});
    setError(null);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (err) {
      setError('Failed to sign out');
    }
  };

  if (loading && !profile) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!user || !profile) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Please sign in to view your profile</p>
      </div>
    );
  }

  const languageNames: Record<Language, string> = {
    'en': 'English',
    'hi': 'हिंदी (Hindi)',
    'bn': 'বাংলা (Bengali)',
    'te': 'తెలుగు (Telugu)',
    'mr': 'मराठी (Marathi)',
    'ta': 'தமிழ் (Tamil)',
    'gu': 'ગુજરાતી (Gujarati)',
    'kn': 'ಕನ್ನಡ (Kannada)',
    'ml': 'മലയാളം (Malayalam)',
    'or': 'ଓଡ଼ିଆ (Odia)',
    'pa': 'ਪੰਜਾਬੀ (Punjabi)',
    'as': 'অসমীয়া (Assamese)',
    'ur': 'اردو (Urdu)',
    'sd': 'سنڌي (Sindhi)',
    'ne': 'नेपाली (Nepali)',
    'ks': 'कॉशुर (Kashmiri)',
    'kok': 'कोंकणी (Konkani)',
    'mni': 'মৈতৈলোন্ (Manipuri)',
    'sat': 'ᱥᱟᱱᱛᱟᱲᱤ (Santali)',
    'doi': 'डोगरी (Dogri)',
    'mai': 'मैथिली (Maithili)',
    'bho': 'भोजपुरी (Bhojpuri)'
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <User className="text-green-600" size={32} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {profile.personalInfo.name || <T>Your Profile</T>}
              </h1>
              <p className="text-gray-600 capitalize">
                <T>{profile.role}</T>
              </p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="secondary-button"
          >
            <T>Sign Out</T>
          </button>
        </div>
      </div>

      {/* Status Messages */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="text-red-500 mt-0.5" size={18} />
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
          <CheckCircle className="text-green-500 mt-0.5" size={18} />
          <p className="text-green-800 text-sm">{success}</p>
        </div>
      )}

      {/* Personal Information */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <User size={20} />
            <T>Personal Information</T>
          </h2>
          {editingSection !== 'personal' && (
            <button
              onClick={() => handleEdit('personal')}
              className="text-green-600 hover:text-green-700 flex items-center gap-1"
            >
              <Edit3 size={16} />
              <T>Edit</T>
            </button>
          )}
        </div>

        {editingSection === 'personal' ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
              <select
                value={formData.language}
                onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                {Object.entries(languageNames).map(([code, name]) => (
                  <option key={code} value={code}>{name}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                <input
                  type="text"
                  value={formData.location?.state || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    location: { ...formData.location, state: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <input
                  type="text"
                  value={formData.location?.city || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    location: { ...formData.location, city: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleSave('personal')}
                disabled={loading}
                className="primary-button flex items-center gap-1"
              >
                <Save size={16} />
                Save
              </button>
              <button
                onClick={handleCancel}
                className="secondary-button flex items-center gap-1"
              >
                <X size={16} />
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Mail size={16} className="text-gray-400" />
              <span>{profile.email}</span>
            </div>
            {profile.personalInfo.phone && (
              <div className="flex items-center gap-3">
                <Phone size={16} className="text-gray-400" />
                <span>{profile.personalInfo.phone}</span>
              </div>
            )}
            <div className="flex items-center gap-3">
              <Globe size={16} className="text-gray-400" />
              <span>{languageNames[profile.personalInfo.language]}</span>
            </div>
            {(profile.personalInfo.location.city || profile.personalInfo.location.state) && (
              <div className="flex items-center gap-3">
                <MapPin size={16} className="text-gray-400" />
                <span>
                  {[profile.personalInfo.location.city, profile.personalInfo.location.state]
                    .filter(Boolean)
                    .join(', ')}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Business Information */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Building size={20} />
            Business Information
          </h2>
          {editingSection !== 'business' && (
            <button
              onClick={() => handleEdit('business')}
              className="text-green-600 hover:text-green-700 flex items-center gap-1"
            >
              <Edit3 size={16} />
              <T>Edit</T>
            </button>
          )}
        </div>

        {editingSection === 'business' ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Business Name</label>
              <input
                type="text"
                value={formData.businessName}
                onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Commodities (comma-separated)
              </label>
              <input
                type="text"
                value={formData.commodities}
                onChange={(e) => setFormData({ ...formData, commodities: e.target.value })}
                placeholder="e.g., Rice, Wheat, Pulses"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleSave('business')}
                disabled={loading}
                className="primary-button flex items-center gap-1"
              >
                <Save size={16} />
                Save
              </button>
              <button
                onClick={handleCancel}
                className="secondary-button flex items-center gap-1"
              >
                <X size={16} />
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {profile.businessInfo.businessName && (
              <div>
                <span className="text-sm text-gray-500">Business Name:</span>
                <p className="font-medium">{profile.businessInfo.businessName}</p>
              </div>
            )}
            {profile.businessInfo.commodities.length > 0 && (
              <div>
                <span className="text-sm text-gray-500">Commodities:</span>
                <div className="flex flex-wrap gap-2 mt-1">
                  {profile.businessInfo.commodities.map((commodity, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-green-100 text-green-800 text-sm rounded-full"
                    >
                      {commodity}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Privacy Settings */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Shield size={20} />
            Privacy Settings
          </h2>
          {editingSection !== 'privacy' && (
            <button
              onClick={() => handleEdit('privacy')}
              className="text-green-600 hover:text-green-700 flex items-center gap-1"
            >
              <Edit3 size={16} />
              <T>Edit</T>
            </button>
          )}
        </div>

        {editingSection === 'privacy' ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Profile Visibility</label>
              <select
                value={formData.profileVisibility}
                onChange={(e) => setFormData({ ...formData, profileVisibility: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="public">Public - Anyone can see</option>
                <option value="verified_only">Verified Users Only</option>
                <option value="private">Private - Hidden from search</option>
              </select>
            </div>
            <div className="space-y-3">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={formData.showContactInfo}
                  onChange={(e) => setFormData({ ...formData, showContactInfo: e.target.checked })}
                  className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                />
                <span className="text-sm">Show contact information</span>
              </label>
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={formData.allowDirectMessages}
                  onChange={(e) => setFormData({ ...formData, allowDirectMessages: e.target.checked })}
                  className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                />
                <span className="text-sm">Allow direct messages</span>
              </label>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleSave('privacy')}
                disabled={loading}
                className="primary-button flex items-center gap-1"
              >
                <Save size={16} />
                Save
              </button>
              <button
                onClick={handleCancel}
                className="secondary-button flex items-center gap-1"
              >
                <X size={16} />
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div>
              <span className="text-sm text-gray-500">Profile Visibility:</span>
              <p className="font-medium capitalize">
                {profile.preferences.privacy.profileVisibility.replace('_', ' ')}
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${profile.preferences.privacy.showContactInfo ? 'bg-green-500' : 'bg-gray-300'}`} />
                <span className="text-sm">Contact information visible</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${profile.preferences.privacy.allowDirectMessages ? 'bg-green-500' : 'bg-gray-300'}`} />
                <span className="text-sm">Direct messages allowed</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;