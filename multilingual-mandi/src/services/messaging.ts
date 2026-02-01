// Messaging Service for Multilingual Mandi Platform
// Handles message sending, receiving, and conversation management

import {
  collection,
  doc,
  addDoc,
  updateDoc,
  getDocs,
  query,
  where,
  orderBy,
  onSnapshot,
  Timestamp,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { Message, MessagingService, Conversation, Unsubscribe } from '../types';
import { offlineSyncService } from './offlineSync';


class MessagingServiceImpl implements MessagingService {
  async sendMessage(conversationId: string, message: Omit<Message, 'id' | 'timestamp'>): Promise<void> {
    const fullMessage: Message = {
      ...message,
      id: this.generateMessageId(),
      metadata: {
        ...message.metadata,
        timestamp: new Date(),
        readStatus: false
      }
    };

    try {
      if (offlineSyncService.isOnline()) {
        await this.sendMessageOnline(conversationId, fullMessage);
      } else {
        await offlineSyncService.queueAction({
          id: this.generateActionId(),
          type: 'send_message',
          payload: { conversationId, message: fullMessage },
          timestamp: new Date(),
          retryCount: 0
        });
      }

      // Cache optimistically
      const cachedMessages = await offlineSyncService.getCachedMessages(conversationId) || [];
      cachedMessages.push(fullMessage);
      await offlineSyncService.cacheMessages(conversationId, cachedMessages);
    } catch (error) {
      console.error('Failed to send message:', error);
      throw new Error('Failed to send message');
    }
  }

  async getMessages(conversationId: string): Promise<Message[]> {
    try {
      if (offlineSyncService.isOnline()) {
        const messages = await this.getMessagesOnline(conversationId);
        await offlineSyncService.cacheMessages(conversationId, messages);
        return messages;
      }
      return await offlineSyncService.getCachedMessages(conversationId) || [];
    } catch (error) {
      console.error('Failed to get messages:', error);
      return await offlineSyncService.getCachedMessages(conversationId) || [];
    }
  }

  async createConversation(participants: string[]): Promise<Conversation> {
    const conversationData = {
      participants,
      type: 'direct' as const,
      lastActivity: serverTimestamp(),
      unreadCount: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    try {
      const docRef = await addDoc(collection(db, 'conversations'), conversationData);
      return {
        id: docRef.id,
        participants,
        type: 'direct',
        lastActivity: new Date(),
        unreadCount: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      };
    } catch (error) {
      console.error('Failed to create conversation:', error);
      throw new Error('Failed to create conversation');
    }
  }

  async getConversations(userId: string): Promise<Conversation[]> {
    try {
      const q = query(
        collection(db, 'conversations'),
        where('participants', 'array-contains', userId),
        orderBy('lastActivity', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const conversations: Conversation[] = [];
      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        conversations.push(this.mapDocToConversation(docSnap.id, data));
      });

      return conversations;
    } catch (error) {
      console.error('Failed to get conversations:', error);
      return [];
    }
  }

  subscribeToMessages(conversationId: string, callback: (messages: Message[]) => void): Unsubscribe {
    const messagesRef = collection(db, 'conversations', conversationId, 'messages');
    const q = query(messagesRef, orderBy('metadata.timestamp', 'asc'));

    return onSnapshot(q, (snapshot) => {
      const messages = snapshot.docs.map(docSnap => {
        const data = docSnap.data();
        return {
          ...data,
          id: docSnap.id,
          metadata: {
            ...data.metadata,
            timestamp: data.metadata.timestamp instanceof Timestamp ? data.metadata.timestamp.toDate() : new Date(data.metadata.timestamp)
          }
        } as Message;
      });
      callback(messages);
    });
  }

  subscribeToConversations(userId: string, callback: (conversations: Conversation[]) => void): Unsubscribe {
    const q = query(
      collection(db, 'conversations'),
      where('participants', 'array-contains', userId),
      orderBy('lastActivity', 'desc')
    );

    return onSnapshot(q, (snapshot) => {
      const conversations = snapshot.docs.map(docSnap => this.mapDocToConversation(docSnap.id, docSnap.data()));
      callback(conversations);
    });
  }

  private mapDocToConversation(id: string, data: any): Conversation {
    return {
      id,
      participants: data.participants,
      type: data.type || 'direct',
      lastMessage: data.lastMessage,
      lastActivity: data.lastActivity instanceof Timestamp ? data.lastActivity.toDate() : new Date(data.lastActivity),
      unreadCount: data.unreadCount || 0,
      createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(data.createdAt),
      updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : new Date(data.updatedAt)
    };
  }

  private async sendMessageOnline(conversationId: string, message: Message): Promise<void> {
    const messageData = {
      ...message,
      metadata: {
        ...message.metadata,
        timestamp: serverTimestamp()
      }
    };

    await addDoc(collection(db, 'conversations', conversationId, 'messages'), messageData);
    await updateDoc(doc(db, 'conversations', conversationId), {
      lastMessage: message,
      lastActivity: serverTimestamp()
    });
  }

  private async getMessagesOnline(conversationId: string): Promise<Message[]> {
    const q = query(
      collection(db, 'conversations', conversationId, 'messages'),
      orderBy('metadata.timestamp', 'asc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(docSnap => {
      const data = docSnap.data();
      return {
        ...data,
        id: docSnap.id,
        metadata: {
          ...data.metadata,
          timestamp: data.metadata.timestamp instanceof Timestamp ? data.metadata.timestamp.toDate() : new Date(data.metadata.timestamp)
        }
      } as Message;
    });
  }

  // Utility methods
  private generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateActionId(): string {
    return `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Export singleton instance
export const messagingService = new MessagingServiceImpl();

// Export types
export type { MessagingService };