
import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mic, MicOff } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const VoiceNavigation: React.FC = () => {
    const navigate = useNavigate();
    const { voiceMode } = useLanguage();
    const [isListening, setIsListening] = useState(false);
    const recognitionRef = useRef<any>(null);

    useEffect(() => {
        if (!voiceMode) {
            stopListening();
            return;
        }

        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = true;
            recognitionRef.current.interimResults = false;
            recognitionRef.current.lang = 'en-US'; // Default to English for commands for now

            recognitionRef.current.onresult = (event: any) => {
                const transcript = event.results[event.results.length - 1][0].transcript.trim().toLowerCase();
                console.log('Voice Command:', transcript);
                handleCommand(transcript);
            };

            recognitionRef.current.onerror = (event: any) => {
                console.error('Speech recognition error', event.error);
                setIsListening(false);
            };

            recognitionRef.current.onend = () => {
                if (voiceMode && isListening) {
                    recognitionRef.current.start();
                } else {
                    setIsListening(false);
                }
            };

            startListening();

        } else {
            console.warn('Web Speech API not supported in this browser.');
        }

        return () => {
            stopListening();
        };
    }, [voiceMode]);


    const startListening = () => {
        if (recognitionRef.current && !isListening) {
            try {
                recognitionRef.current.start();
                setIsListening(true);
            } catch (error) {
                console.error("Error starting speech recognition:", error);
            }
        }
    };

    const stopListening = () => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
            setIsListening(false);
        }
    };

    const handleCommand = (command: string) => {
        if (command.includes('home')) {
            navigate('/');
        } else if (command.includes('market') || command.includes('price')) {
            navigate('/market');
        } else if (command.includes('search')) {
            navigate('/search');
        } else if (command.includes('inventory') || command.includes('stock')) {
            navigate('/inventory');
        } else if (command.includes('orders')) {
            navigate('/orders');
        } else if (command.includes('deals')) {
            navigate('/deals');
        } else if (command.includes('chat') || command.includes('message')) {
            navigate('/chats');
        } else if (command.includes('profile') || command.includes('account')) {
            navigate('/profile');
        } else if (command.includes('notification') || command.includes('alert')) {
            navigate('/notifications');
        }
    };

    // If not in voice mode, render nothing
    if (!voiceMode) return null;

    return (
        <div className={`fixed bottom-20 right-4 p-3 rounded-full shadow-lg z-50 transition-colors ${isListening ? 'bg-red-500 animate-pulse' : 'bg-green-600'}`}>
            {isListening ? <Mic className="text-white" size={24} /> : <MicOff className="text-white" size={24} />}
        </div>
    );
};

export default VoiceNavigation;
