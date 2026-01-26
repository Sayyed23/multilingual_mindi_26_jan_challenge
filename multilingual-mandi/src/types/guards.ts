/**
 * Type guards and validation utilities for the Multilingual Mandi platform
 * Provides runtime type checking and validation for all data types
 */

import { 
  User, UserType, Location, BusinessInfo, ReputationScore, UserSettings 
} from './user';
import { 
  Commodity, CommoditySeasonality, QualityGrade 
} from './commodity';
import { 
  PriceEntry, PriceSource, MarketTrend, DemandLevel, PriceRange 
} from './price';
import { 
  Message, MessageType, MessageStatus, Conversation, ConversationStatus 
} from './message';
import { 
  Deal, DealStatus, PaymentMethod, DeliveryMethod, NegotiationSession, Offer 
} from './deal';
import { 
  SupportedLanguage, TranslationContext, TranslationQuality 
} from './translation';

// Utility type guards
export function isString(value: unknown): value is string {
  return typeof value === 'string';
}

export function isNumber(value: unknown): value is number {
  return typeof value === 'number' && !isNaN(value);
}

export function isBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean';
}

export function isDate(value: unknown): value is Date {
  return value instanceof Date && !isNaN(value.getTime());
}

export function isArray<T>(value: unknown, itemGuard?: (item: unknown) => item is T): value is T[] {
  if (!Array.isArray(value)) return false;
  if (!itemGuard) return true;
  return value.every(itemGuard);
}

export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

// Enum type guards
export function isUserType(value: unknown): value is UserType {
  return isString(value) && ['vendor', 'buyer', 'both'].includes(value);
}

export function isMessageType(value: unknown): value is MessageType {
  return isString(value) && 
    ['text', 'voice', 'image', 'offer', 'system', 'deal_update', 'price_quote'].includes(value);
}

export function isMessageStatus(value: unknown): value is MessageStatus {
  return isString(value) && 
    ['sending', 'sent', 'delivered', 'read', 'failed'].includes(value);
}

export function isConversationStatus(value: unknown): value is ConversationStatus {
  return isString(value) && 
    ['active', 'archived', 'blocked', 'deleted'].includes(value);
}

export function isDealStatus(value: unknown): value is DealStatus {
  return isString(value) && [
    'negotiating', 'agreed', 'confirmed', 'payment_pending',
    'in_transit', 'delivered', 'completed', 'disputed', 'cancelled', 'expired'
  ].includes(value);
}

export function isPriceSource(value: unknown): value is PriceSource {
  return isString(value) && 
    ['agmarknet', 'vendor_submission', 'predicted', 'manual'].includes(value);
}

export function isMarketTrend(value: unknown): value is MarketTrend {
  return isString(value) && 
    ['rising', 'falling', 'stable', 'volatile'].includes(value);
}

export function isDemandLevel(value: unknown): value is DemandLevel {
  return isString(value) && 
    ['low', 'medium', 'high', 'very_high'].includes(value);
}

export function isPaymentMethod(value: unknown): value is PaymentMethod {
  return isString(value) && 
    ['cash', 'upi', 'bank_transfer', 'credit', 'escrow'].includes(value);
}

export function isDeliveryMethod(value: unknown): value is DeliveryMethod {
  return isString(value) && 
    ['pickup', 'delivery', 'shipping', 'self_transport'].includes(value);
}

export function isSupportedLanguage(value: unknown): value is SupportedLanguage {
  const supportedLanguages = [
    'hi', 'en', 'bn', 'te', 'mr', 'ta', 'gu', 'kn', 'ml', 'or',
    'pa', 'as', 'ur', 'sd', 'ne', 'si', 'my', 'dz', 'ks', 'kok',
    'mni', 'sat', 'doi', 'bho', 'mai', 'mag', 'sck'
  ];
  return isString(value) && supportedLanguages.includes(value as SupportedLanguage);
}

export function isTranslationContext(value: unknown): value is TranslationContext {
  return isString(value) && 
    ['general', 'mandi', 'negotiation', 'technical', 'legal'].includes(value);
}

export function isTranslationQuality(value: unknown): value is TranslationQuality {
  return isString(value) && 
    ['high', 'medium', 'low', 'failed'].includes(value);
}

// Complex type guards
export function isLocation(value: unknown): value is Location {
  if (!isObject(value)) return false;
  
  return isNumber(value.latitude) &&
    isNumber(value.longitude) &&
    isString(value.address) &&
    isString(value.pincode) &&
    isString(value.state) &&
    value.latitude >= -90 && value.latitude <= 90 &&
    value.longitude >= -180 && value.longitude <= 180;
}

export function isBusinessInfo(value: unknown): value is BusinessInfo {
  if (!isObject(value)) return false;
  
  return isString(value.businessName) &&
    isString(value.businessType) &&
    isArray(value.specializations, isString) &&
    isString(value.operatingHours) &&
    isArray(value.verificationDocuments, isString) &&
    (value.gstNumber === undefined || isString(value.gstNumber));
}

export function isReputationScore(value: unknown): value is ReputationScore {
  if (!isObject(value)) return false;
  
  return isNumber(value.overall) &&
    isNumber(value.punctuality) &&
    isNumber(value.communication) &&
    isNumber(value.productQuality) &&
    isNumber(value.totalTransactions) &&
    isNumber(value.reviewCount) &&
    isDate(value.lastUpdated) &&
    value.overall >= 1 && value.overall <= 5 &&
    value.punctuality >= 1 && value.punctuality <= 5 &&
    value.communication >= 1 && value.communication <= 5 &&
    value.productQuality >= 1 && value.productQuality <= 5 &&
    value.totalTransactions >= 0 &&
    value.reviewCount >= 0;
}

export function isUserSettings(value: unknown): value is UserSettings {
  if (!isObject(value)) return false;
  
  const notifications = value.notifications;
  const privacy = value.privacy;
  const language = value.language;
  
  return isObject(notifications) &&
    isBoolean(notifications.deals) &&
    isBoolean(notifications.messages) &&
    isBoolean(notifications.priceAlerts) &&
    isBoolean(notifications.marketUpdates) &&
    isObject(privacy) &&
    isBoolean(privacy.showPhoneNumber) &&
    isBoolean(privacy.showLocation) &&
    isBoolean(privacy.allowDirectMessages) &&
    isObject(language) &&
    isString(language.preferred) &&
    isString(language.fallback) &&
    isBoolean(language.autoTranslate);
}

export function isUser(value: unknown): value is User {
  if (!isObject(value)) return false;
  
  return isString(value.id) &&
    isString(value.phoneNumber) &&
    isString(value.name) &&
    isString(value.preferredLanguage) &&
    isUserType(value.userType) &&
    isLocation(value.location) &&
    isReputationScore(value.reputation) &&
    isBoolean(value.isVerified) &&
    isBoolean(value.isPhoneVerified) &&
    isBoolean(value.isBusinessVerified) &&
    isDate(value.createdAt) &&
    isDate(value.lastActiveAt) &&
    isUserSettings(value.settings) &&
    (value.email === undefined || isString(value.email)) &&
    (value.businessProfile === undefined || isBusinessInfo(value.businessProfile)) &&
    (value.profilePicture === undefined || isString(value.profilePicture));
}

export function isCommoditySeasonality(value: unknown): value is CommoditySeasonality {
  if (!isObject(value)) return false;
  
  return isArray(value.peakMonths, isNumber) &&
    isArray(value.offSeasonMonths, isNumber) &&
    value.peakMonths.every((month: number) => month >= 1 && month <= 12) &&
    value.offSeasonMonths.every((month: number) => month >= 1 && month <= 12) &&
    (value.harvestMonths === undefined || 
     (isArray(value.harvestMonths, isNumber) && 
      value.harvestMonths.every((month: number) => month >= 1 && month <= 12)));
}

export function isQualityGrade(value: unknown): value is QualityGrade {
  if (!isObject(value)) return false;
  
  return isString(value.grade) &&
    isString(value.description) &&
    isNumber(value.priceMultiplier) &&
    value.priceMultiplier > 0;
}

export function isCommodity(value: unknown): value is Commodity {
  if (!isObject(value)) return false;
  
  return isString(value.id) &&
    isString(value.name) &&
    isString(value.category) &&
    isString(value.subcategory) &&
    isString(value.standardUnit) &&
    isArray(value.alternativeUnits, isString) &&
    isCommoditySeasonality(value.seasonality) &&
    isArray(value.qualityGrades, isQualityGrade) &&
    isArray(value.storageRequirements, isString) &&
    isBoolean(value.perishable) &&
    isObject(value.translations) &&
    isObject(value.metadata) &&
    isDate(value.createdAt) &&
    isDate(value.updatedAt) &&
    (value.shelfLife === undefined || isNumber(value.shelfLife));
}

export function isPriceRange(value: unknown): value is PriceRange {
  if (!isObject(value)) return false;
  
  const fairPriceRange = value.fairPriceRange;
  
  return isNumber(value.min) &&
    isNumber(value.max) &&
    isNumber(value.average) &&
    isNumber(value.median) &&
    isNumber(value.standardDeviation) &&
    isObject(fairPriceRange) &&
    isNumber(fairPriceRange.lower) &&
    isNumber(fairPriceRange.upper) &&
    isNumber(fairPriceRange.confidence) &&
    isNumber(value.sampleSize) &&
    isDate(value.lastUpdated) &&
    value.min >= 0 &&
    value.max >= value.min &&
    value.sampleSize >= 0 &&
    fairPriceRange.confidence >= 0 && fairPriceRange.confidence <= 1;
}

export function isPriceEntry(value: unknown): value is PriceEntry {
  if (!isObject(value)) return false;
  
  return isString(value.id) &&
    isString(value.commodityId) &&
    isString(value.commodityName) &&
    isNumber(value.price) &&
    isString(value.unit) &&
    isObject(value.location) &&
    isPriceSource(value.source) &&
    isString(value.quality) &&
    isDate(value.timestamp) &&
    isNumber(value.confidence) &&
    isObject(value.metadata) &&
    value.price >= 0 &&
    value.confidence >= 0 && value.confidence <= 1;
}

export function isMessage(value: unknown): value is Message {
  if (!isObject(value)) return false;
  
  return isString(value.id) &&
    isString(value.conversationId) &&
    isString(value.senderId) &&
    isString(value.receiverId) &&
    isMessageType(value.messageType) &&
    isString(value.content) &&
    isDate(value.timestamp) &&
    isMessageStatus(value.status) &&
    isBoolean(value.isRead) &&
    isObject(value.metadata) &&
    isDate(value.metadata.clientTimestamp) &&
    (value.originalText === undefined || isString(value.originalText)) &&
    (value.originalLanguage === undefined || isString(value.originalLanguage)) &&
    (value.readAt === undefined || isDate(value.readAt)) &&
    (value.editedAt === undefined || isDate(value.editedAt)) &&
    (value.replyToMessageId === undefined || isString(value.replyToMessageId));
}

export function isConversation(value: unknown): value is Conversation {
  if (!isObject(value)) return false;
  
  return isString(value.id) &&
    isArray(value.participants, isString) &&
    isObject(value.participantDetails) &&
    isObject(value.unreadCount) &&
    isConversationStatus(value.status) &&
    isDate(value.createdAt) &&
    isDate(value.updatedAt) &&
    isObject(value.metadata) &&
    value.participants.length >= 2 &&
    (value.lastMessage === undefined || isMessage(value.lastMessage));
}

export function isOffer(value: unknown): value is Offer {
  if (!isObject(value)) return false;
  
  return isString(value.id) &&
    isString(value.sessionId) &&
    isString(value.offeredBy) &&
    isString(value.offerType) &&
    isNumber(value.price) &&
    isNumber(value.quantity) &&
    isArray(value.conditions, isString) &&
    isDate(value.validUntil) &&
    isDate(value.timestamp) &&
    value.price >= 0 &&
    value.quantity > 0 &&
    ['initial', 'counter', 'final', 'compromise'].includes(value.offerType);
}

export function isNegotiationSession(value: unknown): value is NegotiationSession {
  if (!isObject(value)) return false;
  
  return isString(value.id) &&
    isString(value.vendorId) &&
    isString(value.buyerId) &&
    isString(value.commodityId) &&
    isString(value.commodityName) &&
    isNumber(value.initialQuantity) &&
    isNumber(value.currentQuantity) &&
    isString(value.unit) &&
    isArray(value.offers, isOffer) &&
    isObject(value.marketContext) &&
    isString(value.status) &&
    isDate(value.startedAt) &&
    isDate(value.lastActivityAt) &&
    isDate(value.expiresAt) &&
    isObject(value.metadata) &&
    value.initialQuantity > 0 &&
    value.currentQuantity > 0 &&
    ['active', 'paused', 'completed', 'cancelled', 'expired'].includes(value.status);
}

export function isDeal(value: unknown): value is Deal {
  if (!isObject(value)) return false;
  
  return isString(value.id) &&
    isString(value.vendorId) &&
    isString(value.buyerId) &&
    isString(value.commodityId) &&
    isString(value.commodityName) &&
    isNumber(value.quantity) &&
    isString(value.unit) &&
    isNumber(value.agreedPrice) &&
    isNumber(value.totalAmount) &&
    isObject(value.qualitySpec) &&
    isDealStatus(value.status) &&
    isObject(value.paymentTerms) &&
    isObject(value.deliveryTerms) &&
    isString(value.conversationId) &&
    isDate(value.createdAt) &&
    isDate(value.updatedAt) &&
    isArray(value.auditTrail) &&
    isObject(value.metadata) &&
    value.quantity > 0 &&
    value.agreedPrice >= 0 &&
    value.totalAmount >= 0;
}

// Validation functions with detailed error messages
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export function validateUser(value: unknown): ValidationResult {
  const errors: string[] = [];
  
  if (!isObject(value)) {
    return { isValid: false, errors: ['Value must be an object'] };
  }
  
  if (!isString(value.id) || value.id.trim().length === 0) {
    errors.push('User ID must be a non-empty string');
  }
  
  if (!isString(value.phoneNumber) || !/^\+?[1-9]\d{1,14}$/.test(value.phoneNumber)) {
    errors.push('Phone number must be a valid international format');
  }
  
  if (!isString(value.name) || value.name.trim().length === 0) {
    errors.push('Name must be a non-empty string');
  }
  
  if (!isUserType(value.userType)) {
    errors.push('User type must be "vendor", "buyer", or "both"');
  }
  
  if (!isLocation(value.location)) {
    errors.push('Location must be a valid location object');
  }
  
  if (!isReputationScore(value.reputation)) {
    errors.push('Reputation must be a valid reputation score object');
  }
  
  if (!isBoolean(value.isVerified)) {
    errors.push('isVerified must be a boolean');
  }
  
  if (!isDate(value.createdAt)) {
    errors.push('createdAt must be a valid date');
  }
  
  if (!isDate(value.lastActiveAt)) {
    errors.push('lastActiveAt must be a valid date');
  }
  
  return { isValid: errors.length === 0, errors };
}

export function validatePriceEntry(value: unknown): ValidationResult {
  const errors: string[] = [];
  
  if (!isObject(value)) {
    return { isValid: false, errors: ['Value must be an object'] };
  }
  
  if (!isString(value.id) || value.id.trim().length === 0) {
    errors.push('Price entry ID must be a non-empty string');
  }
  
  if (!isString(value.commodityId) || value.commodityId.trim().length === 0) {
    errors.push('Commodity ID must be a non-empty string');
  }
  
  if (!isNumber(value.price) || value.price < 0) {
    errors.push('Price must be a non-negative number');
  }
  
  if (!isString(value.unit) || value.unit.trim().length === 0) {
    errors.push('Unit must be a non-empty string');
  }
  
  if (!isPriceSource(value.source)) {
    errors.push('Source must be a valid price source');
  }
  
  if (!isNumber(value.confidence) || value.confidence < 0 || value.confidence > 1) {
    errors.push('Confidence must be a number between 0 and 1');
  }
  
  if (!isDate(value.timestamp)) {
    errors.push('Timestamp must be a valid date');
  }
  
  return { isValid: errors.length === 0, errors };
}

export function validateMessage(value: unknown): ValidationResult {
  const errors: string[] = [];
  
  if (!isObject(value)) {
    return { isValid: false, errors: ['Value must be an object'] };
  }
  
  if (!isString(value.id) || value.id.trim().length === 0) {
    errors.push('Message ID must be a non-empty string');
  }
  
  if (!isString(value.conversationId) || value.conversationId.trim().length === 0) {
    errors.push('Conversation ID must be a non-empty string');
  }
  
  if (!isString(value.senderId) || value.senderId.trim().length === 0) {
    errors.push('Sender ID must be a non-empty string');
  }
  
  if (!isString(value.receiverId) || value.receiverId.trim().length === 0) {
    errors.push('Receiver ID must be a non-empty string');
  }
  
  if (!isMessageType(value.messageType)) {
    errors.push('Message type must be a valid message type');
  }
  
  if (!isString(value.content)) {
    errors.push('Content must be a string');
  }
  
  if (!isDate(value.timestamp)) {
    errors.push('Timestamp must be a valid date');
  }
  
  if (!isMessageStatus(value.status)) {
    errors.push('Status must be a valid message status');
  }
  
  if (!isBoolean(value.isRead)) {
    errors.push('isRead must be a boolean');
  }
  
  return { isValid: errors.length === 0, errors };
}

// Export all type guards and validators
export const TypeGuards = {
  // Primitive guards
  isString,
  isNumber,
  isBoolean,
  isDate,
  isArray,
  isObject,
  
  // Enum guards
  isUserType,
  isMessageType,
  isMessageStatus,
  isConversationStatus,
  isDealStatus,
  isPriceSource,
  isMarketTrend,
  isDemandLevel,
  isPaymentMethod,
  isDeliveryMethod,
  isSupportedLanguage,
  isTranslationContext,
  isTranslationQuality,
  
  // Complex type guards
  isLocation,
  isBusinessInfo,
  isReputationScore,
  isUserSettings,
  isUser,
  isCommoditySeasonality,
  isQualityGrade,
  isCommodity,
  isPriceRange,
  isPriceEntry,
  isMessage,
  isConversation,
  isOffer,
  isNegotiationSession,
  isDeal,
};

export const Validators = {
  validateUser,
  validatePriceEntry,
  validateMessage,
};