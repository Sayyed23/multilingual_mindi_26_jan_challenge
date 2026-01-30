import { useState, useEffect, useCallback } from 'react';
import { serviceWorkerManager, isOnline } from '../services/serviceWorker';

export interface Message {
  id: string;
  content: string;
  senderId: string;
  recipientId: string;
  timestamp: Date;
  type: 'text' | 'voice' | 'negotiation_offer';
  status: 'sending' | 'sent' | 'delivered' | 'failed' | 'queued';
  isOffline?: boolean;
}

export interface UseOfflineMessagesReturn {
  messages: Message[];
  sendMessage: (content: string, recipientId: string, type?: Message['type']) => Promise<void>;
  isOnline: boolean;
  queuedCount: number;
  retryFailedMessages: () => Promise<void>;
}

export const useOfflineMessages = (conversationId: string): UseOfflineMessagesReturn => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [queuedCount, setQueuedCount] = useState(0);
  const [online, setOnline] = useState(isOnline());

  // Listen for online/offline status changes
  useEffect(() => {
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Load existing messages for the conversation
  useEffect(() => {
    loadMessages();
  }, [conversationId]);

  // Update queued count when messages change
  useEffect(() => {
    const queued = messages.filter(m => m.status === 'queued').length;
    setQueuedCount(queued);
  }, [messages]);

  const loadMessages = useCallback(async () => {
    try {
      // In a real app, this would load from IndexedDB or API
      // For now, we'll use localStorage as a fallback
      const stored = localStorage.getItem(`messages-${conversationId}`);
      if (stored) {
        const parsedMessages = JSON.parse(stored).map((m: any) => ({
          ...m,
          timestamp: new Date(m.timestamp)
        }));
        setMessages(parsedMessages);
      }
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  }, [conversationId]);

  const saveMessages = useCallback((updatedMessages: Message[]) => {
    try {
      localStorage.setItem(`messages-${conversationId}`, JSON.stringify(updatedMessages));
    } catch (error) {
      console.error('Failed to save messages:', error);
    }
  }, [conversationId]);

  const sendMessage = useCallback(async (
    content: string, 
    recipientId: string, 
    type: Message['type'] = 'text'
  ) => {
    const messageId = `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newMessage: Message = {
      id: messageId,
      content,
      senderId: 'current-user', // In real app, get from auth context
      recipientId,
      timestamp: new Date(),
      type,
      status: online ? 'sending' : 'queued',
      isOffline: !online
    };

    // Add message to local state immediately
    const updatedMessages = [...messages, newMessage];
    setMessages(updatedMessages);
    saveMessages(updatedMessages);

    try {
      if (online) {
        // Try to send immediately if online
        await sendMessageToServer(newMessage);
        
        // Update message status to sent
        const sentMessages = updatedMessages.map(m => 
          m.id === messageId ? { ...m, status: 'sent' as const } : m
        );
        setMessages(sentMessages);
        saveMessages(sentMessages);
      } else {
        // Queue for offline sync
        await serviceWorkerManager.queueOfflineMessage({
          id: messageId,
          content,
          recipientId,
          timestamp: new Date(),
          type
        });

        console.log('Message queued for offline sync:', messageId);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      
      // Mark message as failed
      const failedMessages = updatedMessages.map(m => 
        m.id === messageId ? { ...m, status: 'failed' as const } : m
      );
      setMessages(failedMessages);
      saveMessages(failedMessages);
    }
  }, [messages, online, saveMessages]);

  const retryFailedMessages = useCallback(async () => {
    const failedMessages = messages.filter(m => m.status === 'failed');
    
    for (const message of failedMessages) {
      try {
        // Update status to sending
        setMessages(prev => prev.map(m => 
          m.id === message.id ? { ...m, status: 'sending' } : m
        ));

        if (online) {
          await sendMessageToServer(message);
          
          // Update to sent
          setMessages(prev => prev.map(m => 
            m.id === message.id ? { ...m, status: 'sent' } : m
          ));
        } else {
          // Re-queue for offline sync
          await serviceWorkerManager.queueOfflineMessage({
            id: message.id,
            content: message.content,
            recipientId: message.recipientId,
            timestamp: message.timestamp,
            type: message.type
          });

          // Update to queued
          setMessages(prev => prev.map(m => 
            m.id === message.id ? { ...m, status: 'queued' } : m
          ));
        }
      } catch (error) {
        console.error('Failed to retry message:', message.id, error);
        
        // Keep as failed
        setMessages(prev => prev.map(m => 
          m.id === message.id ? { ...m, status: 'failed' } : m
        ));
      }
    }

    // Save updated messages
    const updatedMessages = messages.map(m => {
      const updated = messages.find(um => um.id === m.id);
      return updated || m;
    });
    saveMessages(updatedMessages);
  }, [messages, online, saveMessages]);

  // Auto-retry when coming back online
  useEffect(() => {
    if (online) {
      const queuedMessages = messages.filter(m => m.status === 'queued');
      if (queuedMessages.length > 0) {
        console.log('Back online, processing queued messages...');
        // Small delay to ensure service worker sync has time to process
        setTimeout(retryFailedMessages, 1000);
      }
    }
  }, [online, retryFailedMessages]);

  return {
    messages,
    sendMessage,
    isOnline: online,
    queuedCount,
    retryFailedMessages
  };
};

// Mock function to simulate sending message to server
async function sendMessageToServer(message: Message): Promise<void> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));
  
  // Simulate occasional failures (10% chance)
  if (Math.random() < 0.1) {
    throw new Error('Network error');
  }
  
  console.log('Message sent to server:', message.id);
}

export default useOfflineMessages;