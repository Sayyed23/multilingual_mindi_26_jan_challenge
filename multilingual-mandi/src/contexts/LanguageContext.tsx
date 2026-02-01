import React, { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { useAuth } from '../hooks/useAuth';
import { translationService } from '../services/translation';
import type { Language } from '../types';

interface LanguageContextType {
    currentLanguage: Language;
    voiceMode: boolean;
    setVoiceMode: (enabled: boolean) => void;
    setLanguage: (lang: Language) => void;
    translate: (text: string) => Promise<string>;
    speak: (text: string) => void;
    isTranslating: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const CACHE_PREFIX = 'agrimandi_i18n_';

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const [currentLanguage, setCurrentLanguage] = useState<Language>(user?.language || 'en');
    const [voiceMode, setVoiceMode] = useState<boolean>(() => {
        return localStorage.getItem('agrimandi_voice_mode') === 'true';
    });
    const [isTranslating, setIsTranslating] = useState(false);

    // Update language when user profile changes
    useEffect(() => {
        if (user?.language) {
            setCurrentLanguage(user.language);
        }
    }, [user?.language]);

    // Persist voice mode preference
    useEffect(() => {
        localStorage.setItem('agrimandi_voice_mode', String(voiceMode));
    }, [voiceMode]);

    const setLanguage = useCallback((lang: Language) => {
        setCurrentLanguage(lang);
    }, []);

    const translate = useCallback(async (text: string): Promise<string> => {
        if (!text || currentLanguage === 'en') return text;

        // Simple string hash for cache key
        let hash = 0;
        for (let i = 0; i < text.length; i++) {
            const char = text.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }

        const cacheKey = `${CACHE_PREFIX}${currentLanguage}_${hash.toString(16)}`;
        const cached = localStorage.getItem(cacheKey);
        if (cached) return cached;

        try {
            setIsTranslating(true);
            const result = await translationService.translateText(text, 'en', currentLanguage);
            localStorage.setItem(cacheKey, result.translatedText);

            // Also cache in service layer for offline support
            // This is already done inside translationService.translateText, but redundantly safe

            return result.translatedText;
        } catch (error) {
            console.error('Global translation failed:', error);
            return text;
        } finally {
            setIsTranslating(false);
        }
    }, [currentLanguage]);

    const speak = useCallback((text: string) => {
        if (!voiceMode || !text) return;

        // Use Web Speech API for low latency
        const utterance = new SpeechSynthesisUtterance(text);

        // Map our languages to BCP 47 tags (simple mapping for popular ones)
        const langMap: Record<string, string> = {
            'hi': 'hi-IN',
            'bn': 'bn-IN',
            'te': 'te-IN',
            'mr': 'mr-IN',
            'ta': 'ta-IN',
            'gu': 'gu-IN',
            'kn': 'kn-IN',
            'ml': 'ml-IN',
            'pa': 'pa-IN',
            'en': 'en-IN'
        };

        utterance.lang = langMap[currentLanguage] || 'en-IN';
        window.speechSynthesis.cancel(); // Abort previous speech
        window.speechSynthesis.speak(utterance);
    }, [voiceMode, currentLanguage]);

    return (
        <LanguageContext.Provider value={{
            currentLanguage,
            voiceMode,
            setVoiceMode,
            setLanguage,
            translate,
            speak,
            isTranslating
        }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};
