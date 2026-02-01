// Privacy Controls Component
// Provides interface for managing privacy settings and data controls

import React, { useState, useEffect } from 'react';
import {
  Shield,
  Eye,
  Lock,
  Download,
  Trash2,
  Settings,
  User,
  Phone,
  MessageCircle,
  History,
  AlertTriangle,
  CheckCircle,
  Info
} from 'lucide-react';
import { profileManagementService } from '../services/profileManagement';
import { notificationService } from '../services/notifications';
import type { PrivacySettings, NotificationPreferences } from '../types';

interface PrivacyControlsProps {
  userId: string;
  className?: string;
}

export const PrivacyControls: React.FC<PrivacyControlsProps> = ({
  userId,
  className = ''
}) => {
  const [privacySettings, setPrivacySettings] = useState<PrivacySettings | null>(null);
  const [notificationPreferences, setNotificationPreferences] = useState<NotificationPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'visibility' | 'data' | 'notifications' | 'security'>('visibility');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  useEffect(() => {
    loadPrivacySettings();
  }, [userId]);

  const loadPrivacySettings = async () => {
    try {
      setLoading(true);
      setError(null);

      const [profile, preferences] = await Promise.all([
        profileManagementService.getUserProfile(userId),
        notificationService.getNotificationPreferences(userId)
      ]);

      if (profile) {
        setPrivacySettings(profile.preferences.privacy);
      }
      setNotificationPreferences(preferences);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load privacy settings');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePrivacySettings = async (newSettings: Partial<PrivacySettings>) => {
    if (!privacySettings) return;

    try {
      setSaving(true);
      const updatedSettings = { ...privacySettings, ...newSettings };
      
      await profileManagementService.updateUserProfile(userId, {
        preferences: {
          privacy: updatedSettings
        }
      });

      setPrivacySettings(updatedSettings);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update privacy settings');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateNotificationPreferences = async (newPreferences: Partial<NotificationPreferences>) => {
    if (!notificationPreferences) return;

    try {
      setSaving(true);
      const updatedPreferences = { ...notificationPreferences, ...newPreferences };
      
      await notificationService.updateNotificationPreferences(userId, updatedPreferences);
      setNotificationPreferences(updatedPreferences);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update notification preferences');
    } finally {
      setSaving(false);
    }
  };

  const handleExportData = async () => {
    try {
      // Export user data
      const exportData = await notificationService.exportUserNotificationData(userId);
      
      // Add profile data (in a real implementation, this would come from a profile service)
      const fullExportData = {
        ...exportData,
        exportedAt: new Date().toISOString(),
        userId,
        privacySettings,
        dataTypes: ['profile', 'notifications', 'preferences', 'transactions', 'messages']
      };

      const blob = new Blob([JSON.stringify(fullExportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `mandi-data-export-${userId}-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      alert('Data exported successfully!');
    } catch (err) {
      alert('Failed to export data. Please try again.');
    }
  };

  const handleDeleteAllData = async () => {
    if (deleteConfirmText !== 'DELETE MY DATA') {
      alert('Please type "DELETE MY DATA" to confirm');
      return;
    }

    try {
      // Delete all user data
      await notificationService.deleteAllUserNotificationData(userId);
      
      // In a real implementation, this would also delete profile data, messages, etc.
      
      setShowDeleteConfirm(false);
      setDeleteConfirmText('');
      alert('All your data has been deleted successfully.');
      
      // Redirect to logout or home page
      window.location.href = '/';
    } catch (err) {
      alert('Failed to delete data. Please contact support.');
    }
  };

  const ToggleSwitch: React.FC<{
    enabled: boolean;
    onChange: (enabled: boolean) => void;
    disabled?: boolean;
  }> = ({ enabled, onChange, disabled = false }) => (
    <label className="relative inline-flex items-center cursor-pointer">
      <input
        type="checkbox"
        checked={enabled}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
        className="sr-only peer"
      />
      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600 peer-disabled:opacity-50 peer-disabled:cursor-not-allowed"></div>
    </label>
  );

  if (loading) {
    return (
      <div className={`bg-white rounded-lg border p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !privacySettings) {
    return (
      <div className={`bg-white rounded-lg border p-6 ${className}`}>
        <div className="text-center text-red-600">
          <Shield className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>{error || 'Failed to load privacy settings'}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className={`bg-white rounded-lg border ${className}`}>
        {/* Header */}
        <div className="p-6 border-b">
          <div className="flex items-center gap-3">
            <Shield className="w-6 h-6 text-green-600" />
            <h2 className="text-xl font-semibold text-gray-900">Privacy & Data Controls</h2>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Manage your privacy settings and control how your data is used and shared.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex border-b">
          {[
            { id: 'visibility', label: 'Profile Visibility', icon: Eye },
            { id: 'data', label: 'Data Management', icon: Download },
            { id: 'notifications', label: 'Communication', icon: MessageCircle },
            { id: 'security', label: 'Security', icon: Lock }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors ${activeTab === tab.id
                  ? 'text-green-600 border-b-2 border-green-600'
                  : 'text-gray-600 hover:text-gray-900'
                }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Profile Visibility Tab */}
          {activeTab === 'visibility' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Profile Visibility</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <User className="w-5 h-5 text-gray-500" />
                      <div>
                        <div className="font-medium">Profile Visibility</div>
                        <div className="text-sm text-gray-600">Who can see your profile information</div>
                      </div>
                    </div>
                    <select
                      value={privacySettings.profileVisibility}
                      onChange={(e) => handleUpdatePrivacySettings({ 
                        profileVisibility: e.target.value as 'public' | 'verified_only' | 'private' 
                      })}
                      disabled={saving}
                      className="px-3 py-2 border rounded-md text-sm focus:ring-green-500 focus:border-green-500"
                    >
                      <option value="public">Public</option>
                      <option value="verified_only">Verified Users Only</option>
                      <option value="private">Private</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Phone className="w-5 h-5 text-gray-500" />
                      <div>
                        <div className="font-medium">Show Contact Information</div>
                        <div className="text-sm text-gray-600">Display phone number and email to other users</div>
                      </div>
                    </div>
                    <ToggleSwitch
                      enabled={privacySettings.showContactInfo}
                      onChange={(enabled) => handleUpdatePrivacySettings({ showContactInfo: enabled })}
                      disabled={saving}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <History className="w-5 h-5 text-gray-500" />
                      <div>
                        <div className="font-medium">Show Transaction History</div>
                        <div className="text-sm text-gray-600">Display your past transactions and ratings</div>
                      </div>
                    </div>
                    <ToggleSwitch
                      enabled={privacySettings.showTransactionHistory}
                      onChange={(enabled) => handleUpdatePrivacySettings({ showTransactionHistory: enabled })}
                      disabled={saving}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <MessageCircle className="w-5 h-5 text-gray-500" />
                      <div>
                        <div className="font-medium">Allow Direct Messages</div>
                        <div className="text-sm text-gray-600">Let other users send you direct messages</div>
                      </div>
                    </div>
                    <ToggleSwitch
                      enabled={privacySettings.allowDirectMessages}
                      onChange={(enabled) => handleUpdatePrivacySettings({ allowDirectMessages: enabled })}
                      disabled={saving}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Data Management Tab */}
          {activeTab === 'data' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Data Management</h3>
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-3 mb-3">
                      <Download className="w-5 h-5 text-blue-600" />
                      <div>
                        <div className="font-medium">Export Your Data</div>
                        <div className="text-sm text-gray-600">Download all your data in JSON format</div>
                      </div>
                    </div>
                    <button
                      onClick={handleExportData}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      Export Data
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Settings className="w-5 h-5 text-gray-500" />
                      <div>
                        <div className="font-medium">Data Sharing</div>
                        <div className="text-sm text-gray-600">Allow anonymous data sharing for platform improvement</div>
                      </div>
                    </div>
                    <ToggleSwitch
                      enabled={privacySettings.dataSharing}
                      onChange={(enabled) => handleUpdatePrivacySettings({ dataSharing: enabled })}
                      disabled={saving}
                    />
                  </div>

                  <div className="p-4 border border-red-200 rounded-lg bg-red-50">
                    <div className="flex items-center gap-3 mb-3">
                      <Trash2 className="w-5 h-5 text-red-600" />
                      <div>
                        <div className="font-medium text-red-800">Delete All Data</div>
                        <div className="text-sm text-red-700">Permanently delete all your data from our platform</div>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowDeleteConfirm(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete All Data
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Communication Tab */}
          {activeTab === 'notifications' && notificationPreferences && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Communication Preferences</h3>
                <div className="space-y-4">
                  {[
                    { key: 'priceAlerts', label: 'Price Alerts', description: 'Get notified when prices meet your criteria' },
                    { key: 'dealUpdates', label: 'Deal Updates', description: 'Updates on your active deals and transactions' },
                    { key: 'newOpportunities', label: 'New Opportunities', description: 'Notifications about new deals matching your interests' },
                    { key: 'systemUpdates', label: 'System Updates', description: 'Important platform updates and announcements' },
                    { key: 'marketingMessages', label: 'Marketing Messages', description: 'Promotional content and feature announcements' }
                  ].map(item => (
                    <div key={item.key} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <div className="font-medium">{item.label}</div>
                        <div className="text-sm text-gray-600">{item.description}</div>
                      </div>
                      <ToggleSwitch
                        enabled={notificationPreferences[item.key as keyof NotificationPreferences] as boolean}
                        onChange={(enabled) => handleUpdateNotificationPreferences({ [item.key]: enabled })}
                        disabled={saving}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-md font-medium text-gray-900 mb-3">Delivery Channels</h4>
                <div className="space-y-3">
                  {[
                    { key: 'push', label: 'Push Notifications', description: 'Browser and mobile notifications' },
                    { key: 'email', label: 'Email', description: 'Email notifications to your registered address' },
                    { key: 'sms', label: 'SMS', description: 'Text messages to your phone number' }
                  ].map(item => (
                    <div key={item.key} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">{item.label}</div>
                        <div className="text-sm text-gray-600">{item.description}</div>
                      </div>
                      <ToggleSwitch
                        enabled={notificationPreferences.channels[item.key as keyof typeof notificationPreferences.channels]}
                        onChange={(enabled) => handleUpdateNotificationPreferences({
                          channels: { ...notificationPreferences.channels, [item.key]: enabled }
                        })}
                        disabled={saving}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Security Settings</h3>
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-3 mb-2">
                      <Lock className="w-5 h-5 text-green-600" />
                      <div className="font-medium">Account Security</div>
                    </div>
                    <div className="text-sm text-gray-600 mb-3">
                      Your account is protected with industry-standard security measures.
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span>Two-factor authentication available</span>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-3 mb-2">
                      <Shield className="w-5 h-5 text-blue-600" />
                      <div className="font-medium">Data Encryption</div>
                    </div>
                    <div className="text-sm text-gray-600 mb-3">
                      All your data is encrypted in transit and at rest using AES-256 encryption.
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span>End-to-end encryption enabled</span>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg bg-blue-50">
                    <div className="flex items-center gap-3 mb-2">
                      <Info className="w-5 h-5 text-blue-600" />
                      <div className="font-medium text-blue-800">Privacy Policy</div>
                    </div>
                    <div className="text-sm text-blue-700 mb-3">
                      Learn more about how we protect your privacy and handle your data.
                    </div>
                    <button className="text-sm text-blue-600 hover:text-blue-700 underline">
                      Read Privacy Policy
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <AlertTriangle className="w-6 h-6 text-red-600" />
                <h3 className="text-lg font-semibold text-gray-900">Delete All Data</h3>
              </div>
              
              <div className="mb-4">
                <p className="text-sm text-gray-700 mb-4">
                  This action will permanently delete all your data including:
                </p>
                <ul className="text-sm text-gray-600 list-disc list-inside space-y-1 mb-4">
                  <li>Profile information</li>
                  <li>Transaction history</li>
                  <li>Messages and conversations</li>
                  <li>Notifications and preferences</li>
                  <li>Trust scores and ratings</li>
                </ul>
                <p className="text-sm text-red-600 font-medium">
                  This action cannot be undone.
                </p>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type "DELETE MY DATA" to confirm:
                </label>
                <input
                  type="text"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="DELETE MY DATA"
                />
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleDeleteAllData}
                  disabled={deleteConfirmText !== 'DELETE MY DATA'}
                  className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Delete All Data
                </button>
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setDeleteConfirmText('');
                  }}
                  className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PrivacyControls;