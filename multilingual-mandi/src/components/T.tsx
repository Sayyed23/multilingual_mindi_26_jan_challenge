import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

interface TProps {
    children: string;
    className?: string;
    as?: any; // Using any for simplicity with dynamic React elements
}

const T: React.FC<TProps> = ({ children, className = '', as: Component = 'span' }) => {
    const { translate, currentLanguage, speak, voiceMode } = useLanguage();
    const [translatedText, setTranslatedText] = useState(children);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        let isMounted = true;

        const performTranslation = async () => {
            if (currentLanguage === 'en') {
                setTranslatedText(children);
                return;
            }

            setLoading(true);
            const translated = await translate(children);
            if (isMounted) {
                setTranslatedText(translated);
                setLoading(false);
            }
        };

        performTranslation();

        return () => {
            isMounted = false;
        };
    }, [children, currentLanguage, translate]);

    const handleClick = () => {
        if (voiceMode) {
            speak(translatedText);
        }
    };

    return (
        <Component
            className={`${className} ${loading ? 'opacity-50 animate-pulse' : ''} ${voiceMode ? 'cursor-pointer hover:underline decoration-dotted' : ''}`}
            onClick={handleClick}
            title={voiceMode ? 'Click to hear' : undefined}
        >
            {translatedText}
        </Component>
    );
};

export default T;
