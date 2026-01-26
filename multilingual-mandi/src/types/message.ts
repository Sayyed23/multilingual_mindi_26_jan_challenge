/**
 * Message and communication-related type definitions for the Multilingual Mandi platform
 * Supports Requirements: 1.1, 1.3, 1.4, 3.4, 8.2
 */

export type MessageType = 'text' | 'voice' | 'image' | 'offer' | 'system' | 'deal_update' | 'price_quote';
export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
export type ConversationStatus = 'active' | 'archived' | 'blocked' | 'deleted';

export interface MessageAttachment {
  id: string;
  type: 'image' | 'audio' | 'document' | 'location';
  url: string;
  filename?: string;
  size: number; // in bytes
  mimeType: string;
  metadata: {
    duration?: number; // for audio/video in seconds
    dimensions?: { width: number; height: number }; // for images
    transcription?: string; // for audio messages
  };
}

export interface TranslationData {
  originalText: string;
  originalLanguage: string;
  translatedText: string;
  targetLanguage: string;
  confidence: number; // 0-1 scale
  requiresReview: boolean;
  alternativeTranslations?: string[];
  translatedAt: Date;
  translationEngine: string;
}

export interface VoiceData {
  audioUrl: string;
  duration: number; // in seconds
  transcription?: string;
  language?: string;
  waveform?: number[]; // for audio visualization
}

export interface OfferData {
  commodityId: string;
  commodityName: string;
  quantity: number;
  unit: string;
  pricePerUnit: number;
  totalPrice: number;
  quality?: string;
  deliveryDate?: Date;
  location?: string;
  conditions?: string[];
  validUntil: Date;
  negotiable: boolean;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  messageType: MessageType;
  content: string; // main message content
  originalText?: string; // for translated messages
  originalLanguage?: string;
  translation?: TranslationData;
  voiceData?: VoiceData;
  offerData?: OfferData;
  attachments?: MessageAttachment[];
  timestamp: Date;
  status: MessageStatus;
  isRead: boolean;
  readAt?: Date;
  editedAt?: Date;
  replyToMessageId?: string;
  metadata: {
    deviceInfo?: string;
    location?: {
      latitude: number;
      longitude: number;
    };
    clientTimestamp: Date;
  };
}

export interface Conversation {
  id: string;
  participants: string[]; // user IDs
  participantDetails: {
    [userId: string]: {
      name: string;
      profilePicture?: string;
      preferredLanguage: string;
      isOnline: boolean;
      lastSeen?: Date;
    };
  };
  lastMessage?: Message;
  unreadCount: {
    [userId: string]: number;
  };
  status: ConversationStatus;
  createdAt: Date;
  updatedAt: Date;
  metadata: {
    dealId?: string; // if conversation is related to a deal
    commodityId?: string;
    isNegotiation?: boolean;
    tags?: string[];
  };
}

export interface MessageDraft {
  conversationId: string;
  content: string;
  messageType: MessageType;
  attachments?: File[];
  offerData?: Partial<OfferData>;
  replyToMessageId?: string;
  savedAt: Date;
}

export interface TypingIndicator {
  conversationId: string;
  userId: string;
  isTyping: boolean;
  timestamp: Date;
}

export interface MessageReaction {
  messageId: string;
  userId: string;
  reaction: string; // emoji or reaction type
  timestamp: Date;
}

export interface ConversationFilter {
  status?: ConversationStatus;
  hasUnread?: boolean;
  dealRelated?: boolean;
  participantId?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
  searchQuery?: string;
}

export interface MessageSearchResult {
  message: Message;
  conversation: Conversation;
  relevanceScore: number;
  highlightedContent: string;
  context: {
    previousMessage?: Message;
    nextMessage?: Message;
  };
}