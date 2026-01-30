import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, Send, MessageSquare, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
import { useServiceWorker } from '../services/serviceWorker';
import useOfflineMessages from '../hooks/useOfflineMessages';

export const ServiceWorkerDemo: React.FC = () => {
  const { status, getCacheInfo } = useServiceWorker();
  const { messages, sendMessage, isOnline, queuedCount } = useOfflineMessages('demo-conversation');
  const [messageText, setMessageText] = useState('');
  const [cacheInfo, setCacheInfo] = useState({ size: 0, entries: 0 });

  useEffect(() => {
    loadCacheInfo();
  }, []);

  const loadCacheInfo = async () => {
    try {
      const info = await getCacheInfo();
      setCacheInfo(info);
    } catch (error) {
      console.error('Failed to load cache info:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!messageText.trim()) return;
    
    try {
      await sendMessage(messageText, 'demo-recipient');
      setMessageText('');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const getStatusColor = (messageStatus: string) => {
    switch (messageStatus) {
      case 'sent': return 'text-green-600';
      case 'sending': return 'text-blue-600';
      case 'queued': return 'text-orange-600';
      case 'failed': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (messageStatus: string) => {
    switch (messageStatus) {
      case 'sent': return <CheckCircle className="w-4 h-4" />;
      case 'sending': return <RefreshCw className="w-4 h-4 animate-spin" />;
      case 'queued': return <AlertCircle className="w-4 h-4" />;
      case 'failed': return <AlertCircle className="w-4 h-4" />;
      default: return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Service Worker Demo</h2>
        
        {/* Status Panel */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              {isOnline ? (
                <Wifi className="w-5 h-5 text-green-600" />
              ) : (
                <WifiOff className="w-5 h-5 text-orange-600" />
              )}
              <h3 className="font-semibold text-gray-900">Connection</h3>
            </div>
            <p className={`text-sm ${isOnline ? 'text-green-600' : 'text-orange-600'}`}>
              {isOnline ? 'Online' : 'Offline'}
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <MessageSquare className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold text-gray-900">Queued Messages</h3>
            </div>
            <p className="text-sm text-blue-600">{queuedCount} pending</p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <RefreshCw className="w-5 h-5 text-purple-600" />
              <h3 className="font-semibold text-gray-900">Cache</h3>
            </div>
            <p className="text-sm text-purple-600">{cacheInfo.entries} items</p>
          </div>
        </div>

        {/* Service Worker Status */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-blue-900 mb-2">PWA Status</h3>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span>Service Worker:</span>
              <span className={status.isRegistered ? 'text-green-600' : 'text-red-600'}>
                {status.isRegistered ? 'Active' : 'Not Registered'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Update Available:</span>
              <span className={status.hasUpdate ? 'text-orange-600' : 'text-gray-600'}>
                {status.hasUpdate ? 'Yes' : 'No'}
              </span>
            </div>
          </div>
        </div>

        {/* Message Testing */}
        <div className="border border-gray-200 rounded-lg p-4">
          <h3 className="font-semibold text-gray-900 mb-4">Test Offline Messaging</h3>
          
          {/* Message Input */}
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder="Type a test message..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            />
            <button
              onClick={handleSendMessage}
              disabled={!messageText.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              Send
            </button>
          </div>

          {/* Messages List */}
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {messages.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-4">
                No messages yet. Send a test message to see offline functionality.
              </p>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">{message.content}</p>
                    <p className="text-xs text-gray-500">
                      {message.timestamp.toLocaleTimeString()}
                      {message.isOffline && ' (sent offline)'}
                    </p>
                  </div>
                  <div className={`flex items-center gap-1 ${getStatusColor(message.status)}`}>
                    {getStatusIcon(message.status)}
                    <span className="text-xs font-medium capitalize">
                      {message.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h4 className="font-semibold text-yellow-800 mb-2">How to Test:</h4>
          <ol className="text-sm text-yellow-700 space-y-1 list-decimal list-inside">
            <li>Send a message while online to see normal behavior</li>
            <li>Turn off your internet connection (or use browser dev tools to simulate offline)</li>
            <li>Send another message - it will be queued for offline sync</li>
            <li>Turn your internet back on - queued messages will be sent automatically</li>
            <li>Check the browser's Application tab in dev tools to see cached resources</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default ServiceWorkerDemo;