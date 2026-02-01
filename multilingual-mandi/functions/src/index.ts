/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import {setGlobalOptions} from "firebase-functions";
import {onCall, onRequest} from "firebase-functions/v2/https";
import {onDocumentCreated, onDocumentUpdated} from "firebase-functions/v2/firestore";
import * as logger from "firebase-functions/logger";
import {GoogleGenerativeAI} from "@google/generative-ai";
import {defineString} from "firebase-functions/params";
import * as admin from "firebase-admin";

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp();
}

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

// For cost control, you can set the maximum number of containers that can be
// running at the same time. This helps mitigate the impact of unexpected
// traffic spikes by instead downgrading performance. This limit is a
// per-function limit. You can override the limit for each function using the
// `maxInstances` option in the function's options, e.g.
// `onRequest({ maxInstances: 5 }, (req, res) => { ... })`.
// NOTE: setGlobalOptions does not apply to functions using the v1 API. V1
// functions should each use functions.runWith({ maxInstances: 10 }) instead.
// In the v1 API, each function can only serve one request per container, so
// this will be the maximum concurrent request count.
setGlobalOptions({ maxInstances: 10 });

// Define environment parameters
const geminiApiKey = defineString("GEMINI_API_KEY");

// Initialize Gemini AI
let genAI: GoogleGenerativeAI;

const initializeGemini = () => {
  if (!genAI) {
    genAI = new GoogleGenerativeAI(geminiApiKey.value());
  }
  return genAI;
};

// Language code mapping for better Gemini API compatibility
const languageNames: Record<string, string> = {
  "hi": "Hindi",
  "en": "English",
  "bn": "Bengali",
  "te": "Telugu",
  "mr": "Marathi",
  "ta": "Tamil",
  "gu": "Gujarati",
  "kn": "Kannada",
  "ml": "Malayalam",
  "or": "Odia",
  "pa": "Punjabi",
  "as": "Assamese",
  "ur": "Urdu",
  "sd": "Sindhi",
  "ne": "Nepali",
  "ks": "Kashmiri",
  "kok": "Konkani",
  "mni": "Manipuri",
  "sat": "Santali",
  "doi": "Dogri",
  "mai": "Maithili",
  "bho": "Bhojpuri",
};

// Mandi-specific terminology for context
const mandiTerminology = `
Context: This is a translation for a mandi (wholesale market) platform in India. 
Please use appropriate agricultural and trading terminology. Common terms include:
- Mandi = wholesale market
- Kisan = farmer
- Vyapari = trader/merchant
- Fasal = crop/harvest
- Bhav = price/rate
- Quintal = unit of measurement (100kg)
- Adat = commission
- Tolai = weighing
- Bori = sack/bag
- Kharif/Rabi = crop seasons
`;

// Translation function
export const translateText = onCall(
  { maxInstances: 5, timeoutSeconds: 30 },
  async (request) => {
    try {
      const { text, fromLang, toLang } = request.data;

      // Input validation
      if (!text || typeof text !== 'string') {
        throw new Error("Invalid input: 'text' must be a non-empty string");
      }

      if (!fromLang || typeof fromLang !== 'string') {
        throw new Error("Invalid input: 'fromLang' must be a valid language code");
      }

      if (!toLang || typeof toLang !== 'string') {
        throw new Error("Invalid input: 'toLang' must be a valid language code");
      }

      if (text.trim().length === 0) {
        throw new Error("Text cannot be empty or only whitespace");
      }

      if (text.length > 5000) {
        throw new Error("Text too long (maximum 5000 characters allowed)");
      }

      // Same language check
      if (fromLang === toLang) {
        return {
          originalText: text,
          translatedText: text,
          confidence: 1.0,
          fromLanguage: fromLang,
          toLanguage: toLang,
          timestamp: new Date().toISOString(),
        };
      }

      // Validate supported languages
      const supportedLanguages = Object.keys(languageNames);
      if (!supportedLanguages.includes(fromLang)) {
        throw new Error(`Unsupported source language: ${fromLang}`);
      }
      if (!supportedLanguages.includes(toLang)) {
        throw new Error(`Unsupported target language: ${toLang}`);
      }

      let genAI: GoogleGenerativeAI;
      try {
        genAI = initializeGemini();
      } catch (initError) {
        logger.error("Failed to initialize Gemini AI:", initError);
        throw new Error("Translation service initialization failed");
      }

      const model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-flash",
        generationConfig: {
          temperature: 0.3, // Lower temperature for more consistent translations
          topP: 0.8,
          topK: 40,
          maxOutputTokens: 1000,
        },
      });

      const fromLanguageName = languageNames[fromLang] || fromLang;
      const toLanguageName = languageNames[toLang] || toLang;

      const prompt = `${mandiTerminology}

Translate the following text from ${fromLanguageName} to ${toLanguageName}.
Maintain the context and meaning, especially for agricultural and trading terms.
Only return the translated text, nothing else.

Text to translate: "${text}"`;

      let translatedText: string;
      let confidence: number;

      try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        translatedText = response.text().trim();

        // Validate translation result
        if (!translatedText || translatedText.length === 0) {
          throw new Error("Empty translation result received");
        }

        // Calculate confidence based on various factors
        confidence = calculateTranslationConfidence(text, translatedText, fromLang, toLang);

      } catch (aiError) {
        logger.error("Gemini AI translation error:", aiError);
        
        // Check for specific AI errors
        if (aiError instanceof Error) {
          if (aiError.message.includes('quota')) {
            throw new Error("Translation quota exceeded. Please try again later.");
          } else if (aiError.message.includes('safety')) {
            throw new Error("Content blocked by safety filters. Please rephrase your text.");
          } else if (aiError.message.includes('timeout')) {
            throw new Error("Translation request timed out. Please try again.");
          }
        }
        
        throw new Error("AI translation service error. Please try again.");
      }

      logger.info(`Translation completed: ${fromLang} -> ${toLang}`, {
        originalLength: text.length,
        translatedLength: translatedText.length,
        confidence,
        userId: request.auth?.uid || 'anonymous',
      });

      return {
        originalText: text,
        translatedText,
        confidence,
        fromLanguage: fromLang,
        toLanguage: toLang,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      logger.error("Translation error:", error);
      
      // Provide user-friendly error messages
      const errorMessage = error instanceof Error ? error.message : "Unknown translation error";
      throw new Error(`Translation failed: ${errorMessage}`);
    }
  }
);

// Helper function to calculate translation confidence
function calculateTranslationConfidence(
  originalText: string,
  translatedText: string,
  fromLang: string,
  toLang: string
): number {
  let confidence = 0.85; // Base confidence
  
  // Adjust confidence based on text characteristics
  if (originalText.length < 10) confidence += 0.1; // Short texts are usually more accurate
  if (originalText.length > 100) confidence -= 0.1; // Long texts might have more errors
  if (/[0-9]/.test(originalText)) confidence += 0.05; // Numbers are usually preserved well
  
  // Language pair confidence adjustments
  const highConfidencePairs = [
    ['en', 'hi'], ['hi', 'en'], // English-Hindi
    ['en', 'bn'], ['bn', 'en'], // English-Bengali
    ['hi', 'ur'], ['ur', 'hi'], // Hindi-Urdu
  ];
  
  const isHighConfidencePair = highConfidencePairs.some(
    ([from, to]) => (from === fromLang && to === toLang) || (from === toLang && to === fromLang)
  );
  
  if (isHighConfidencePair) confidence += 0.05;
  
  // Check for obvious translation issues
  if (translatedText === originalText && fromLang !== toLang) {
    confidence -= 0.3; // Likely failed translation
  }
  
  if (translatedText.length < originalText.length * 0.3) {
    confidence -= 0.2; // Suspiciously short translation
  }
  
  if (translatedText.length > originalText.length * 3) {
    confidence -= 0.1; // Suspiciously long translation
  }

  // Clamp confidence between reasonable bounds
  return Math.min(0.95, Math.max(0.3, confidence));
}

// Voice translation function with enhanced error handling
export const translateVoice = onCall(
  { maxInstances: 3, timeoutSeconds: 60 },
  async (request) => {
    try {
      const { audioData, fromLang, toLang } = request.data;

      // Input validation
      if (!audioData || typeof audioData !== 'string') {
        throw new Error("Invalid input: 'audioData' must be a base64 encoded string");
      }

      if (!fromLang || typeof fromLang !== 'string') {
        throw new Error("Invalid input: 'fromLang' must be a valid language code");
      }

      if (!toLang || typeof toLang !== 'string') {
        throw new Error("Invalid input: 'toLang' must be a valid language code");
      }

      // Validate audio data size (base64 encoded)
      const audioSizeBytes = (audioData.length * 3) / 4; // Approximate size after base64 decoding
      const maxSizeBytes = 25 * 1024 * 1024; // 25MB limit

      if (audioSizeBytes > maxSizeBytes) {
        throw new Error(`Audio file too large: ${Math.round(audioSizeBytes / 1024 / 1024)}MB (maximum 25MB allowed)`);
      }

      // Validate supported languages
      const supportedLanguages = Object.keys(languageNames);
      if (!supportedLanguages.includes(fromLang)) {
        throw new Error(`Unsupported source language: ${fromLang}`);
      }
      if (!supportedLanguages.includes(toLang)) {
        throw new Error(`Unsupported target language: ${toLang}`);
      }

      logger.info(`Voice translation request: ${fromLang} -> ${toLang}`, {
        audioSizeMB: Math.round(audioSizeBytes / 1024 / 1024 * 100) / 100,
        userId: request.auth?.uid || 'anonymous',
      });

      // For now, return a structured placeholder response
      // In a full implementation, this would:
      // 1. Convert audio to text using Speech-to-Text API (Google Cloud Speech-to-Text)
      // 2. Translate the text using the translateText function
      // 3. Optionally convert back to speech using Text-to-Speech API

      // Simulate speech-to-text processing time
      await new Promise(resolve => setTimeout(resolve, 1000));

      const placeholderTranscription = "[Voice transcription not yet implemented]";
      const placeholderTranslation = "[Voice translation not yet implemented]";

      // In a real implementation, you would:
      /*
      try {
        // 1. Initialize Speech-to-Text client
        const speechClient = new SpeechClient();
        
        // 2. Configure recognition request
        const request = {
          audio: { content: audioData },
          config: {
            encoding: 'WEBM_OPUS', // or appropriate encoding
            sampleRateHertz: 16000,
            languageCode: getGoogleLanguageCode(fromLang),
            enableAutomaticPunctuation: true,
            model: 'latest_long', // Use latest model for better accuracy
          },
        };

        // 3. Perform speech recognition
        const [response] = await speechClient.recognize(request);
        const transcription = response.results
          ?.map(result => result.alternatives?.[0]?.transcript)
          .join(' ') || '';

        if (!transcription) {
          throw new Error('No speech detected in audio');
        }

        // 4. Translate the transcribed text
        const translationResult = await translateTextFunction({
          text: transcription,
          fromLang,
          toLang,
        });

        return {
          originalText: transcription,
          translatedText: translationResult.translatedText,
          confidence: Math.min(
            response.results?.[0]?.alternatives?.[0]?.confidence || 0.5,
            translationResult.confidence
          ),
          fromLanguage: fromLang,
          toLanguage: toLang,
          timestamp: new Date().toISOString(),
        };
      } catch (speechError) {
        logger.error("Speech-to-text error:", speechError);
        throw new Error(`Voice recognition failed: ${speechError.message}`);
      }
      */

      logger.warn("Voice translation using placeholder implementation");
      
      return {
        originalText: placeholderTranscription,
        translatedText: placeholderTranslation,
        confidence: 0.0, // Low confidence for placeholder
        fromLanguage: fromLang,
        toLanguage: toLang,
        timestamp: new Date().toISOString(),
        isPlaceholder: true, // Flag to indicate this is not a real translation
      };

    } catch (error) {
      logger.error("Voice translation error:", error);
      
      // Provide user-friendly error messages
      let errorMessage = "Voice translation failed";
      
      if (error instanceof Error) {
        if (error.message.includes('too large')) {
          errorMessage = "Audio file is too large. Please record a shorter message.";
        } else if (error.message.includes('Unsupported')) {
          errorMessage = error.message;
        } else if (error.message.includes('Invalid input')) {
          errorMessage = "Invalid audio data. Please try recording again.";
        } else {
          errorMessage = `Voice translation failed: ${error.message}`;
        }
      }
      
      throw new Error(errorMessage);
    }
  }
);

// Helper function to map our language codes to Google Cloud language codes
// Currently unused but kept for future Speech-to-Text integration
// function getGoogleLanguageCode(languageCode: string): string {
//   const languageMapping: Record<string, string> = {
//     'hi': 'hi-IN', // Hindi (India)
//     'en': 'en-US', // English (US)
//     'bn': 'bn-IN', // Bengali (India)
//     'te': 'te-IN', // Telugu (India)
//     'mr': 'mr-IN', // Marathi (India)
//     'ta': 'ta-IN', // Tamil (India)
//     'gu': 'gu-IN', // Gujarati (India)
//     'kn': 'kn-IN', // Kannada (India)
//     'ml': 'ml-IN', // Malayalam (India)
//     'or': 'or-IN', // Odia (India)
//     'pa': 'pa-IN', // Punjabi (India)
//     'as': 'as-IN', // Assamese (India)
//     'ur': 'ur-IN', // Urdu (India)
//     'ne': 'ne-NP', // Nepali (Nepal)
//     // Add more mappings as needed
//   };

//   return languageMapping[languageCode] || 'en-US'; // Default to English
// }

// export const helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

// ============================================================================
// NOTIFICATION FUNCTIONS
// ============================================================================

// Send push notification to specific user
export const sendNotification = onCall(
  { maxInstances: 10, timeoutSeconds: 30 },
  async (request) => {
    try {
      const { userId, title, body, data, type } = request.data;

      // Input validation
      if (!userId || typeof userId !== 'string') {
        throw new Error("Invalid input: 'userId' must be a non-empty string");
      }

      if (!title || typeof title !== 'string') {
        throw new Error("Invalid input: 'title' must be a non-empty string");
      }

      if (!body || typeof body !== 'string') {
        throw new Error("Invalid input: 'body' must be a non-empty string");
      }

      // Get user's FCM token from Firestore
      const userDoc = await admin.firestore().collection('users').doc(userId).get();
      
      if (!userDoc.exists) {
        throw new Error(`User not found: ${userId}`);
      }

      const userData = userDoc.data();
      const fcmToken = userData?.fcmToken;

      if (!fcmToken) {
        logger.warn(`No FCM token found for user: ${userId}`);
        return { success: false, reason: 'No FCM token' };
      }

      // Check user notification preferences
      const preferences = userData?.preferences?.notifications;
      if (preferences && !shouldSendNotification(type, preferences)) {
        logger.info(`Notification blocked by user preferences: ${userId}, type: ${type}`);
        return { success: false, reason: 'Blocked by user preferences' };
      }

      // Prepare notification payload
      const message = {
        token: fcmToken,
        notification: {
          title,
          body,
        },
        data: {
          type: type || 'general',
          userId,
          timestamp: new Date().toISOString(),
          ...data,
        },
        android: {
          notification: {
            icon: 'ic_notification',
            color: '#37ec13',
            sound: 'default',
            channelId: getNotificationChannelId(type),
          },
        },
        apns: {
          payload: {
            aps: {
              sound: 'default',
              badge: 1,
            },
          },
        },
        webpush: {
          notification: {
            icon: '/icons/icon-192x192.png',
            badge: '/icons/badge-72x72.png',
            tag: type || 'general',
            requireInteraction: type === 'deal_update' || type === 'price_alert',
          },
        },
      };

      // Send notification
      const response = await admin.messaging().send(message);
      
      logger.info(`Notification sent successfully: ${response}`, {
        userId,
        type,
        messageId: response,
      });

      // Store notification in Firestore for history
      await admin.firestore().collection('notifications').add({
        userId,
        type: type || 'general',
        title,
        message: body,
        data: data || {},
        read: false,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        expiresAt: getNotificationExpiry(type),
      });

      return { success: true, messageId: response };

    } catch (error) {
      logger.error("Failed to send notification:", error);
      
      if (error instanceof Error) {
        if (error.message.includes('registration-token-not-registered')) {
          // Token is invalid, remove it from user document
          const { userId } = request.data;
          if (userId) {
            await admin.firestore().collection('users').doc(userId).update({
              fcmToken: admin.firestore.FieldValue.delete(),
            });
          }
          return { success: false, reason: 'Invalid token removed' };
        }
      }
      
      throw new Error(`Failed to send notification: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
);

// Send bulk notifications to multiple users
export const sendBulkNotifications = onCall(
  { maxInstances: 5, timeoutSeconds: 300 },
  async (request) => {
    try {
      const { userIds, title, body, data, type } = request.data;

      // Input validation
      if (!Array.isArray(userIds) || userIds.length === 0) {
        throw new Error("Invalid input: 'userIds' must be a non-empty array");
      }

      if (userIds.length > 1000) {
        throw new Error("Too many recipients: maximum 1000 users per batch");
      }

      if (!title || typeof title !== 'string') {
        throw new Error("Invalid input: 'title' must be a non-empty string");
      }

      if (!body || typeof body !== 'string') {
        throw new Error("Invalid input: 'body' must be a non-empty string");
      }

      // Get FCM tokens for all users
      const userDocs = await admin.firestore().collection('users')
        .where(admin.firestore.FieldPath.documentId(), 'in', userIds.slice(0, 10))
        .get();

      const tokens: string[] = [];
      const validUserIds: string[] = [];

      for (const doc of userDocs.docs) {
        const userData = doc.data();
        const fcmToken = userData?.fcmToken;
        const preferences = userData?.preferences?.notifications;

        if (fcmToken && shouldSendNotification(type, preferences)) {
          tokens.push(fcmToken);
          validUserIds.push(doc.id);
        }
      }

      if (tokens.length === 0) {
        return { success: false, reason: 'No valid tokens found' };
      }

      // Prepare multicast message
      const message = {
        tokens,
        notification: {
          title,
          body,
        },
        data: {
          type: type || 'general',
          timestamp: new Date().toISOString(),
          ...data,
        },
        android: {
          notification: {
            icon: 'ic_notification',
            color: '#37ec13',
            sound: 'default',
            channelId: getNotificationChannelId(type),
          },
        },
        webpush: {
          notification: {
            icon: '/icons/icon-192x192.png',
            badge: '/icons/badge-72x72.png',
            tag: type || 'general',
          },
        },
      };

      // Send multicast notification
      const response = await admin.messaging().sendEachForMulticast(message);

      logger.info(`Bulk notification sent: ${response.successCount}/${tokens.length} successful`, {
        type,
        successCount: response.successCount,
        failureCount: response.failureCount,
      });

      // Store notifications in Firestore for history
      const batch = admin.firestore().batch();
      const notificationsRef = admin.firestore().collection('notifications');

      validUserIds.forEach((userId) => {
        const notificationRef = notificationsRef.doc();
        batch.set(notificationRef, {
          userId,
          type: type || 'general',
          title,
          message: body,
          data: data || {},
          read: false,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          expiresAt: getNotificationExpiry(type),
        });
      });

      await batch.commit();

      return {
        success: true,
        successCount: response.successCount,
        failureCount: response.failureCount,
        responses: response.responses,
      };

    } catch (error) {
      logger.error("Failed to send bulk notifications:", error);
      throw new Error(`Failed to send bulk notifications: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
);

// Firestore trigger: Send notification when a new deal is created
export const onDealCreated = onDocumentCreated(
  { document: "deals/{dealId}", maxInstances: 10 },
  async (event) => {
    try {
      const dealData = event.data?.data();
      if (!dealData) return;

      const { buyerId, sellerId, commodity, agreedPrice } = dealData;

      // Send notification to both buyer and seller
      const notifications = [
        {
          userId: buyerId,
          title: "Deal Confirmed",
          body: `Your deal for ${commodity} at ₹${agreedPrice} has been confirmed`,
          type: "deal_update",
          data: {
            dealId: event.params.dealId,
            action: "confirmed",
          },
        },
        {
          userId: sellerId,
          title: "Deal Confirmed",
          body: `Your deal for ${commodity} at ₹${agreedPrice} has been confirmed`,
          type: "deal_update",
          data: {
            dealId: event.params.dealId,
            action: "confirmed",
          },
        },
      ];

      // Send notifications
      for (const notification of notifications) {
        try {
          await sendNotificationInternal(notification);
        } catch (error) {
          logger.error(`Failed to send deal notification to ${notification.userId}:`, error);
        }
      }

    } catch (error) {
      logger.error("Deal creation notification failed:", error);
    }
  }
);

// Firestore trigger: Send notification when deal status is updated
export const onDealUpdated = onDocumentUpdated(
  { document: "deals/{dealId}", maxInstances: 10 },
  async (event) => {
    try {
      const beforeData = event.data?.before.data();
      const afterData = event.data?.after.data();
      
      if (!beforeData || !afterData) return;

      // Check if status changed
      if (beforeData.status === afterData.status) return;

      const { buyerId, sellerId, commodity, status } = afterData;
      const statusMessages = {
        paid: "Payment confirmed",
        delivered: "Order delivered",
        completed: "Deal completed successfully",
        disputed: "Deal disputed - please review",
        cancelled: "Deal cancelled",
      };

      const message = statusMessages[status as keyof typeof statusMessages] || `Deal status updated to ${status}`;

      // Send notification to both parties
      const notifications = [
        {
          userId: buyerId,
          title: "Deal Update",
          body: `${commodity} deal: ${message}`,
          type: "deal_update",
          data: {
            dealId: event.params.dealId,
            status,
            action: "status_updated",
          },
        },
        {
          userId: sellerId,
          title: "Deal Update",
          body: `${commodity} deal: ${message}`,
          type: "deal_update",
          data: {
            dealId: event.params.dealId,
            status,
            action: "status_updated",
          },
        },
      ];

      for (const notification of notifications) {
        try {
          await sendNotificationInternal(notification);
        } catch (error) {
          logger.error(`Failed to send deal update notification to ${notification.userId}:`, error);
        }
      }

    } catch (error) {
      logger.error("Deal update notification failed:", error);
    }
  }
);

// Price alert monitoring function (called periodically)
export const checkPriceAlerts = onRequest(
  { maxInstances: 1, timeoutSeconds: 300 },
  async (req, res) => {
    try {
      // Get all active price alerts
      const alertsSnapshot = await admin.firestore()
        .collection('priceAlerts')
        .where('active', '==', true)
        .get();

      if (alertsSnapshot.empty) {
        res.json({ success: true, message: 'No active alerts found' });
        return;
      }

      let triggeredCount = 0;

      for (const alertDoc of alertsSnapshot.docs) {
        const alert = alertDoc.data();
        const { userId, commodity, condition, threshold, location } = alert;

        try {
          // Get current price for the commodity
          // This would typically query your price data source
          const currentPrice = await getCurrentCommodityPrice(commodity, location);
          
          if (currentPrice && shouldTriggerAlert(currentPrice, condition, threshold)) {
            // Send price alert notification
            await sendNotificationInternal({
              userId,
              title: `Price Alert: ${commodity}`,
              body: `Current price ₹${currentPrice} ${condition} your threshold of ₹${threshold}`,
              type: "price_alert",
              data: {
                alertId: alertDoc.id,
                commodity,
                currentPrice,
                threshold,
                condition,
              },
            });

            triggeredCount++;
            
            // Optionally deactivate one-time alerts
            if (alert.oneTime) {
              await alertDoc.ref.update({ active: false });
            }
          }
        } catch (error) {
          logger.error(`Failed to process alert ${alertDoc.id}:`, error);
        }
      }

      logger.info(`Price alerts check completed: ${triggeredCount} alerts triggered`);
      res.json({ success: true, triggeredCount });

    } catch (error) {
      logger.error("Price alerts check failed:", error);
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  }
);

// Helper functions

function shouldSendNotification(type: string, preferences: any): boolean {
  if (!preferences) return true; // Default to sending if no preferences set

  switch (type) {
    case 'price_alert':
      return preferences.priceAlerts !== false;
    case 'deal_update':
      return preferences.dealUpdates !== false;
    case 'new_opportunity':
      return preferences.newOpportunities !== false;
    case 'system_update':
      return preferences.systemUpdates !== false;
    case 'marketing':
      return preferences.marketingMessages !== false;
    default:
      return true;
  }
}

function getNotificationChannelId(type: string): string {
  switch (type) {
    case 'price_alert':
      return 'price_alerts';
    case 'deal_update':
      return 'deal_updates';
    case 'new_opportunity':
      return 'opportunities';
    case 'system_update':
      return 'system';
    default:
      return 'general';
  }
}

function getNotificationExpiry(type: string): admin.firestore.Timestamp {
  const now = new Date();
  let expiryDays = 30; // Default 30 days

  switch (type) {
    case 'price_alert':
      expiryDays = 7;
      break;
    case 'deal_update':
      expiryDays = 30;
      break;
    case 'new_opportunity':
      expiryDays = 7;
      break;
    case 'system_update':
      expiryDays = 90;
      break;
  }

  const expiryDate = new Date(now.getTime() + (expiryDays * 24 * 60 * 60 * 1000));
  return admin.firestore.Timestamp.fromDate(expiryDate);
}

async function sendNotificationInternal(notification: {
  userId: string;
  title: string;
  body: string;
  type: string;
  data?: any;
}): Promise<void> {
  // Get user's FCM token
  const userDoc = await admin.firestore().collection('users').doc(notification.userId).get();
  
  if (!userDoc.exists) {
    throw new Error(`User not found: ${notification.userId}`);
  }

  const userData = userDoc.data();
  const fcmToken = userData?.fcmToken;

  if (!fcmToken) {
    logger.warn(`No FCM token found for user: ${notification.userId}`);
    return;
  }

  // Check user preferences
  const preferences = userData?.preferences?.notifications;
  if (preferences && !shouldSendNotification(notification.type, preferences)) {
    logger.info(`Notification blocked by user preferences: ${notification.userId}, type: ${notification.type}`);
    return;
  }

  // Send notification
  const message = {
    token: fcmToken,
    notification: {
      title: notification.title,
      body: notification.body,
    },
    data: {
      type: notification.type,
      userId: notification.userId,
      timestamp: new Date().toISOString(),
      ...notification.data,
    },
    webpush: {
      notification: {
        icon: '/icons/icon-192x192.png',
        badge: '/icons/badge-72x72.png',
        tag: notification.type,
      },
    },
  };

  await admin.messaging().send(message);

  // Store in Firestore
  await admin.firestore().collection('notifications').add({
    userId: notification.userId,
    type: notification.type,
    title: notification.title,
    message: notification.body,
    data: notification.data || {},
    read: false,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    expiresAt: getNotificationExpiry(notification.type),
  });
}

async function getCurrentCommodityPrice(commodity: string, location?: any): Promise<number | null> {
  try {
    // This is a placeholder implementation
    // In a real app, this would query your price data source
    const pricesSnapshot = await admin.firestore()
      .collection('prices')
      .where('commodity', '==', commodity)
      .orderBy('timestamp', 'desc')
      .limit(1)
      .get();

    if (!pricesSnapshot.empty) {
      const priceData = pricesSnapshot.docs[0].data();
      return priceData.price || null;
    }

    return null;
  } catch (error) {
    logger.error(`Failed to get current price for ${commodity}:`, error);
    return null;
  }
}

function shouldTriggerAlert(currentPrice: number, condition: string, threshold: number): boolean {
  switch (condition) {
    case 'above':
      return currentPrice > threshold;
    case 'below':
      return currentPrice < threshold;
    case 'change':
      // For change alerts, you'd need to compare with previous price
      // This is a simplified implementation
      return Math.abs(currentPrice - threshold) > (threshold * 0.05); // 5% change
    default:
      return false;
  }
}
