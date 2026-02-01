// Notification Management Component
// Provides UI for notification history, preferences, and privacy controls

import React, { useState, useEffect } from 'react';
import {
  Bell,
  Settings,
  Trash2,
  Check,
  CheckCheck,
  X,
  Shield,
  Download,
  AlertCircle,
  Clock,

} from 'lucide-react';
import { notificationService } from '../services/notifications';
import type {
  Notification,
  NotificationPreferences
} from '../types';

interface NotificationManagerProps {
  userId: string;
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationManager: React.FC<NotificationManagerProps> = ({
  userId,
  isOpen,
  onClose
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'history' | 'preferences' | 'privacy'>('history');
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  useEffect(() => {
    if (isOpen && userId) {
      loadNotificationData();
    }
  }, [isOpen, userId]);

  const loadNotificationData = async () => {
    try {
      setLoading(true);
      const [notificationHistory, userPreferences, notificationStats] = await Promise.all([
        notificationService.getNotificationHistory(userId),
        notificationService.getNotificationPreferences(userId),
        notificationService.getNotificationStats(userId)
      ]);

      setNotifications(notificationHistory);
      setPreferences(userPreferences);
      setStats(notificationStats);
    } catch (error) {
      console.error('Failed to load notification data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await notificationService.markAsRead(notificationId);
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead(userId);
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  const handleDeleteNotification = async (notificationId: string) => {
    try {
      await notificationService.deleteNotification(notificationId);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  const handleDeleteAllNotifications = async () => {
    if (!confirm('Are you sure you want to delete all notifications? This action cannot be undone.')) {
      return;
    }

    try {
      await notificationService.deleteAllNotifications(userId);
      setNotifications([]);
    } catch (error) {
      console.error('Failed to delete all notifications:', error);
    }
  };

  const handleUpdatePreferences = async (newPreferences: NotificationPreferences) => {
    try {
      await notificationService.updateNotificationPreferences(userId, newPreferences);
      setPreferences(newPreferences);
    } catch (error) {
      console.error('Failed to update preferences:', error);
    }
  };

  const handleOptOutFromType = async (notificationType: string) => {
    try {
      await notificationService.optOutFromNotificationType(userId, notificationType);
      await loadNotificationData(); // Reload to get updated preferences
    } catch (error) {
      console.error('Failed to opt out from notification type:', error);
    }
  };

  const handleOptOutFromAll = async () => {
    if (!confirm('Are you sure you want to opt out from all notifications? You can re-enable them later in settings.')) {
      return;
    }

    try {
      await notificationService.optOutFromAllNotifications(userId);
      await loadNotificationData();
    } catch (error) {
      console.error('Failed to opt out from all notifications:', error);
    }
  };

  const handleExportData = async () => {
    try {
      const exportData = await notificationService.exportUserNotificationData(userId);
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `notification-data-${userId}-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export notification data:', error);
    }
  };

  const handleDeleteAllData = async () => {
    if (!confirm('Are you sure you want to delete ALL your notification data? This includes history, preferences, and settings. This action cannot be undone.')) {
      return;
    }

    try {
      await notificationService.deleteAllUserNotificationData(userId);
      setNotifications([]);
      setPreferences(null);
      setStats(null);
    } catch (error) {
      console.error('Failed to delete all notification data:', error);
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread' && notification.read) return false;
    if (filter === 'read' && !notification.read) return false;
    if (typeFilter !== 'all' && notification.type !== typeFilter) return false;
    return true;
  });

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'price_alert':
        return '💰';
      case 'deal_update':
        return '🤝';
      case 'new_opportunity':
        return '🌟';
      case 'system_update':
        return '⚙️';
      case 'marketing':
        return '📢';
      default:
        return '📱';
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <Bell className="w-6 h-6 text-green-600" />
            <h2 className="text-xl font-semibold">Notification Manager</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b">
          {[
            { id: 'history', label: 'History', icon: Clock },
            { id: 'preferences', label: 'Preferences', icon: Settings },
            { id: 'privacy', label: 'Privacy', icon: Shield }
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
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            </div>
          ) : (
            <>
              {/* History Tab */}
              {activeTab === 'history' && (
                <div className="space-y-4">
                  {/* Stats */}
                  {stats && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
                        <div className="text-sm text-gray-600">Total Notifications</div>
                      </div>
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">{stats.unread}</div>
                        <div className="text-sm text-gray-600">Unread</div>
                      </div>
                      <div className="bg-green-50 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">{stats.total - stats.unread}</div>
                        <div className="text-sm text-gray-600">Read</div>
                      </div>
                    </div>
                  )}

                  {/* Filters and Actions */}
                  <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                    <div className="flex items-center gap-4">
                      <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value as any)}
                        className="px-3 py-2 border rounded-md text-sm"
                      >
                        <option value="all">All</option>
                        <option value="unread">Unread</option>
                        <option value="read">Read</option>
                      </select>

                      <select
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value)}
                        className="px-3 py-2 border rounded-md text-sm"
                      >
                        <option value="all">All Types</option>
                        <option value="price_alert">Price Alerts</option>
                        <option value="deal_update">Deal Updates</option>
                        <option value="new_opportunity">Opportunities</option>
                        <option value="system_update">System Updates</option>
                        <option value="marketing">Marketing</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleMarkAllAsRead}
                        className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                      >
                        <CheckCheck className="w-4 h-4" />
                        Mark All Read
                      </button>
                      <button
                        onClick={handleDeleteAllNotifications}
                        className="flex items-center gap-2 px-3 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete All
                      </button>
                    </div>
                  </div>

                  {/* Notifications List */}
                  <div className="space-y-2">
                    {filteredNotifications.length === 0 ? (
                      <div className="text-center py-12 text-gray-500">
                        <Bell className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No notifications found</p>
                      </div>
                    ) : (
                      filteredNotifications.map(notification => (
                        <div
                          key={notification.id}
                          className={`p-4 border rounded-lg ${notification.read ? 'bg-gray-50' : 'bg-blue-50 border-blue-200'
                            }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3 flex-1">
                              <span className="text-2xl">{getNotificationIcon(notification.type)}</span>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="font-medium text-gray-900">{notification.title}</h4>
                                  {!notification.read && (
                                    <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                                  )}
                                </div>
                                <p className="text-gray-600 text-sm mb-2">{notification.message}</p>
                                <div className="text-xs text-gray-500">
                                  {formatDate(notification.createdAt)}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 ml-4">
                              {!notification.read && (
                                <button
                                  onClick={() => handleMarkAsRead(notification.id)}
                                  className="p-1 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                                  title="Mark as read"
                                >
                                  <Check className="w-4 h-4" />
                                </button>
                              )}
                              <button
                                onClick={() => handleDeleteNotification(notification.id)}
                                className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors"
                                title="Delete notification"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* Preferences Tab */}
              {activeTab === 'preferences' && preferences && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-4">Notification Types</h3>
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
                          <div className="flex items-center gap-4">
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={preferences[item.key as keyof NotificationPreferences] as boolean}
                                onChange={(e) => {
                                  const newPreferences = {
                                    ...preferences,
                                    [item.key]: e.target.checked
                                  };
                                  handleUpdatePreferences(newPreferences);
                                }}
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                            </label>
                            <button
                              onClick={() => handleOptOutFromType(item.key.replace(/([A-Z])/g, '_$1').toLowerCase().replace(/^_/, ''))}
                              className="text-sm text-red-600 hover:text-red-700"
                            >
                              Opt Out
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-4">Delivery Channels</h3>
                    <div className="space-y-4">
                      {[
                        { key: 'push', label: 'Push Notifications', description: 'Browser and mobile push notifications' },
                        { key: 'email', label: 'Email', description: 'Email notifications to your registered address' },
                        { key: 'sms', label: 'SMS', description: 'Text messages to your phone number' }
                      ].map(item => (
                        <div key={item.key} className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <div className="font-medium">{item.label}</div>
                            <div className="text-sm text-gray-600">{item.description}</div>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={preferences.channels[item.key as keyof typeof preferences.channels]}
                              onChange={(e) => {
                                const newPreferences = {
                                  ...preferences,
                                  channels: {
                                    ...preferences.channels,
                                    [item.key]: e.target.checked
                                  }
                                };
                                handleUpdatePreferences(newPreferences);
                              }}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <button
                      onClick={handleOptOutFromAll}
                      className="flex items-center gap-2 px-4 py-2 text-red-600 border border-red-600 rounded-md hover:bg-red-50 transition-colors"
                    >
                      <AlertCircle className="w-4 h-4" />
                      Opt Out From All Notifications
                    </button>
                  </div>
                </div>
              )}

              {/* Privacy Tab */}
              {activeTab === 'privacy' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-4">Data Management</h3>
                    <div className="space-y-4">
                      <div className="p-4 border rounded-lg">
                        <h4 className="font-medium mb-2">Export Your Data</h4>
                        <p className="text-sm text-gray-600 mb-4">
                          Download all your notification data including history, preferences, and statistics.
                        </p>
                        <button
                          onClick={handleExportData}
                          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                        >
                          <Download className="w-4 h-4" />
                          Export Data
                        </button>
                      </div>

                      <div className="p-4 border border-red-200 rounded-lg bg-red-50">
                        <h4 className="font-medium mb-2 text-red-800">Delete All Data</h4>
                        <p className="text-sm text-red-700 mb-4">
                          Permanently delete all your notification data. This action cannot be undone.
                        </p>
                        <button
                          onClick={handleDeleteAllData}
                          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete All Data
                        </button>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-4">Privacy Information</h3>
                    <div className="prose text-sm text-gray-600">
                      <p>
                        Your notification data is stored securely and used only to provide you with relevant updates about your mandi activities.
                      </p>
                      <ul className="list-disc list-inside space-y-1 mt-4">
                        <li>We never share your notification preferences with third parties</li>
                        <li>You can opt out from any notification type at any time</li>
                        <li>All data is encrypted in transit and at rest</li>
                        <li>You have full control over your notification data</li>
                        <li>Expired notifications are automatically cleaned up</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationManager;