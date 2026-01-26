/**
 * Voice Service for speech-to-text and text-to-speech functionality
 * Integrates with Web Speech API for voice translation capabilities
 * Requirements: 1.3 - Voice translation pipeline
 */

import { SupportedLanguage, VoiceTranslationRequest, VoiceTranslationResponse } from '../types/translation';

export interface VoiceRecognitionOptions {
  language?: SupportedLanguage;
  continuous?: boolean;
  interimResults?: boolean;
  maxAlternatives?: number;
  timeout?: number;
}

export interface VoiceRecognitionResult {
  transcript: string;
  confidence: number;
  isFinal: boolean;
  alternatives?: string[];
}

export interface VoiceSynthesisOptions {
  language: SupportedLanguage;
  rate?: number;
  pitch?: number;
  volume?: number;
  voice?: SpeechSynthesisVoice;
}

export interface AudioRecordingOptions {
  maxDuration?: number; // in seconds
  sampleRate?: number;
  channels?: number;
  bitDepth?: number;
}

class VoiceService {
  private recognition: SpeechRecognition | null = null;
  private synthesis: SpeechSynthesis | null = null;
  private mediaRecorder: MediaRecorder | null = null;
  private audioStream: MediaStream | null = null;
  private recordedChunks: Blob[] = [];
  private isRecording = false;
  private isListening = false;

  constructor() {
    this.initializeAPIs();
  }

  /**
   * Initialize Web Speech APIs
   */
  private initializeAPIs(): void {
    // Initialize Speech Recognition
    if ('webkitSpeechRecognition' in window) {
      this.recognition = new (window as any).webkitSpeechRecognition();
    } else if ('SpeechRecognition' in window) {
      this.recognition = new (window as any).SpeechRecognition();
    }

    // Initialize Speech Synthesis
    if ('speechSynthesis' in window) {
      this.synthesis = window.speechSynthesis;
    }
  }

  /**
   * Check if voice recognition is supported
   */
  isVoiceRecognitionSupported(): boolean {
    return this.recognition !== null;
  }

  /**
   * Check if voice synthesis is supported
   */
  isVoiceSynthesisSupported(): boolean {
    return this.synthesis !== null;
  }

  /**
   * Check if audio recording is supported
   */
  isAudioRecordingSupported(): boolean {
    return 'MediaRecorder' in window && 'getUserMedia' in navigator.mediaDevices;
  }

  /**
   * Get available voices for synthesis
   */
  getAvailableVoices(): SpeechSynthesisVoice[] {
    if (!this.synthesis) return [];
    return this.synthesis.getVoices();
  }

  /**
   * Get voice for specific language
   */
  getVoiceForLanguage(language: SupportedLanguage): SpeechSynthesisVoice | null {
    const voices = this.getAvailableVoices();
    
    // Language code mapping for Web Speech API
    const languageMap: { [key in SupportedLanguage]: string[] } = {
      'hi': ['hi-IN', 'hi'],
      'en': ['en-US', 'en-GB', 'en-IN', 'en'],
      'bn': ['bn-IN', 'bn-BD', 'bn'],
      'te': ['te-IN', 'te'],
      'mr': ['mr-IN', 'mr'],
      'ta': ['ta-IN', 'ta-LK', 'ta'],
      'gu': ['gu-IN', 'gu'],
      'kn': ['kn-IN', 'kn'],
      'ml': ['ml-IN', 'ml'],
      'or': ['or-IN', 'or'],
      'pa': ['pa-IN', 'pa'],
      'as': ['as-IN', 'as'],
      'ur': ['ur-IN', 'ur-PK', 'ur'],
      'sd': ['sd-IN', 'sd'],
      'ne': ['ne-NP', 'ne'],
      'si': ['si-LK', 'si'],
      'my': ['my-MM', 'my'],
      'dz': ['dz-BT', 'dz'],
      'ks': ['ks-IN', 'ks'],
      'kok': ['kok-IN', 'kok'],
      'mni': ['mni-IN', 'mni'],
      'sat': ['sat-IN', 'sat'],
      'doi': ['doi-IN', 'doi'],
      'bho': ['bho-IN', 'bho'],
      'mai': ['mai-IN', 'mai'],
      'mag': ['mag-IN', 'mag'],
      'sck': ['sck-IN', 'sck']
    };

    const langCodes = languageMap[language] || [language];
    
    for (const langCode of langCodes) {
      const voice = voices.find(v => v.lang.startsWith(langCode));
      if (voice) return voice;
    }
    
    return null;
  }

  /**
   * Start voice recognition
   */
  async startVoiceRecognition(options: VoiceRecognitionOptions = {}): Promise<VoiceRecognitionResult> {
    if (!this.recognition) {
      throw new Error('Speech recognition not supported');
    }

    if (this.isListening) {
      throw new Error('Voice recognition already in progress');
    }

    return new Promise((resolve, reject) => {
      if (!this.recognition) {
        reject(new Error('Speech recognition not available'));
        return;
      }

      // Configure recognition
      this.recognition.continuous = options.continuous || false;
      this.recognition.interimResults = options.interimResults || false;
      this.recognition.maxAlternatives = options.maxAlternatives || 1;
      
      if (options.language) {
        const languageMap: { [key in SupportedLanguage]: string } = {
          'hi': 'hi-IN',
          'en': 'en-US',
          'bn': 'bn-IN',
          'te': 'te-IN',
          'mr': 'mr-IN',
          'ta': 'ta-IN',
          'gu': 'gu-IN',
          'kn': 'kn-IN',
          'ml': 'ml-IN',
          'or': 'or-IN',
          'pa': 'pa-IN',
          'as': 'as-IN',
          'ur': 'ur-IN',
          'sd': 'sd-IN',
          'ne': 'ne-NP',
          'si': 'si-LK',
          'my': 'my-MM',
          'dz': 'dz-BT',
          'ks': 'ks-IN',
          'kok': 'kok-IN',
          'mni': 'mni-IN',
          'sat': 'sat-IN',
          'doi': 'doi-IN',
          'bho': 'bho-IN',
          'mai': 'mai-IN',
          'mag': 'mag-IN',
          'sck': 'sck-IN'
        };
        this.recognition.lang = languageMap[options.language] || 'en-US';
      }

      let timeoutId: NodeJS.Timeout | null = null;
      if (options.timeout) {
        timeoutId = setTimeout(() => {
          this.stopVoiceRecognition();
          reject(new Error('Voice recognition timeout'));
        }, options.timeout);
      }

      this.recognition.onstart = () => {
        this.isListening = true;
      };

      this.recognition.onresult = (event: SpeechRecognitionEvent) => {
        if (timeoutId) clearTimeout(timeoutId);
        
        const result = event.results[event.results.length - 1];
        const transcript = result[0].transcript;
        const confidence = result[0].confidence;
        const isFinal = result.isFinal;
        
        const alternatives: string[] = [];
        for (let i = 1; i < result.length; i++) {
          alternatives.push(result[i].transcript);
        }

        const recognitionResult: VoiceRecognitionResult = {
          transcript,
          confidence,
          isFinal,
          alternatives: alternatives.length > 0 ? alternatives : undefined
        };

        if (isFinal || !options.continuous) {
          this.isListening = false;
          resolve(recognitionResult);
        }
      };

      this.recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        if (timeoutId) clearTimeout(timeoutId);
        this.isListening = false;
        reject(new Error(`Speech recognition error: ${event.error}`));
      };

      this.recognition.onend = () => {
        this.isListening = false;
      };

      this.recognition.start();
    });
  }

  /**
   * Stop voice recognition
   */
  stopVoiceRecognition(): void {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }
  }

  /**
   * Synthesize speech from text
   */
  async synthesizeSpeech(text: string, options: VoiceSynthesisOptions): Promise<string> {
    if (!this.synthesis) {
      throw new Error('Speech synthesis not supported');
    }

    return new Promise((resolve, reject) => {
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Set voice
      const voice = options.voice || this.getVoiceForLanguage(options.language);
      if (voice) {
        utterance.voice = voice;
      }
      
      // Set language
      const languageMap: { [key in SupportedLanguage]: string } = {
        'hi': 'hi-IN',
        'en': 'en-US',
        'bn': 'bn-IN',
        'te': 'te-IN',
        'mr': 'mr-IN',
        'ta': 'ta-IN',
        'gu': 'gu-IN',
        'kn': 'kn-IN',
        'ml': 'ml-IN',
        'or': 'or-IN',
        'pa': 'pa-IN',
        'as': 'as-IN',
        'ur': 'ur-IN',
        'sd': 'sd-IN',
        'ne': 'ne-NP',
        'si': 'si-LK',
        'my': 'my-MM',
        'dz': 'dz-BT',
        'ks': 'ks-IN',
        'kok': 'kok-IN',
        'mni': 'mni-IN',
        'sat': 'sat-IN',
        'doi': 'doi-IN',
        'bho': 'bho-IN',
        'mai': 'mai-IN',
        'mag': 'mag-IN',
        'sck': 'sck-IN'
      };
      utterance.lang = languageMap[options.language] || 'en-US';
      
      // Set speech parameters
      utterance.rate = options.rate || 1.0;
      utterance.pitch = options.pitch || 1.0;
      utterance.volume = options.volume || 1.0;

      utterance.onend = () => {
        resolve('Speech synthesis completed');
      };

      utterance.onerror = (event) => {
        reject(new Error(`Speech synthesis error: ${event.error}`));
      };

      this.synthesis!.speak(utterance);
    });
  }

  /**
   * Start audio recording
   */
  async startAudioRecording(options: AudioRecordingOptions = {}): Promise<void> {
    if (!this.isAudioRecordingSupported()) {
      throw new Error('Audio recording not supported');
    }

    if (this.isRecording) {
      throw new Error('Recording already in progress');
    }

    try {
      // Request microphone access
      this.audioStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: options.sampleRate || 44100,
          channelCount: options.channels || 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      // Create MediaRecorder
      const mimeType = this.getSupportedMimeType();
      this.mediaRecorder = new MediaRecorder(this.audioStream, {
        mimeType
      });

      this.recordedChunks = [];

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.recordedChunks.push(event.data);
        }
      };

      this.mediaRecorder.onstart = () => {
        this.isRecording = true;
      };

      this.mediaRecorder.onstop = () => {
        this.isRecording = false;
        if (this.audioStream) {
          this.audioStream.getTracks().forEach(track => track.stop());
          this.audioStream = null;
        }
      };

      // Start recording
      this.mediaRecorder.start(100); // Collect data every 100ms

      // Set maximum duration
      if (options.maxDuration) {
        setTimeout(() => {
          this.stopAudioRecording();
        }, options.maxDuration * 1000);
      }

    } catch (error) {
      throw new Error(`Failed to start audio recording: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Stop audio recording and return recorded audio
   */
  async stopAudioRecording(): Promise<Blob> {
    if (!this.mediaRecorder || !this.isRecording) {
      throw new Error('No recording in progress');
    }

    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        reject(new Error('MediaRecorder not available'));
        return;
      }

      this.mediaRecorder.onstop = () => {
        const mimeType = this.getSupportedMimeType();
        const audioBlob = new Blob(this.recordedChunks, { type: mimeType });
        this.recordedChunks = [];
        resolve(audioBlob);
      };

      this.mediaRecorder.stop();
    });
  }

  /**
   * Get audio duration from blob
   */
  async getAudioDuration(audioBlob: Blob): Promise<number> {
    return new Promise((resolve, reject) => {
      const audio = new Audio();
      const url = URL.createObjectURL(audioBlob);
      
      audio.onloadedmetadata = () => {
        URL.revokeObjectURL(url);
        resolve(audio.duration);
      };
      
      audio.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Failed to load audio metadata'));
      };
      
      audio.src = url;
    });
  }

  /**
   * Convert audio blob to base64
   */
  async audioToBase64(audioBlob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result.split(',')[1]); // Remove data:audio/...;base64, prefix
      };
      reader.onerror = () => reject(new Error('Failed to convert audio to base64'));
      reader.readAsDataURL(audioBlob);
    });
  }

  /**
   * Get supported MIME type for recording
   */
  private getSupportedMimeType(): string {
    const types = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/mp4',
      'audio/ogg;codecs=opus',
      'audio/ogg',
      'audio/wav'
    ];

    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) {
        return type;
      }
    }

    return 'audio/webm'; // Fallback
  }

  /**
   * Check microphone permission
   */
  async checkMicrophonePermission(): Promise<PermissionState> {
    try {
      const permission = await navigator.permissions.query({ name: 'microphone' as PermissionName });
      return permission.state;
    } catch (error) {
      // Fallback: try to access microphone to check permission
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(track => track.stop());
        return 'granted';
      } catch {
        return 'denied';
      }
    }
  }

  /**
   * Request microphone permission
   */
  async requestMicrophonePermission(): Promise<boolean> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      return true;
    } catch (error) {
      console.error('Microphone permission denied:', error);
      return false;
    }
  }

  /**
   * Cleanup resources
   */
  dispose(): void {
    this.stopVoiceRecognition();
    
    if (this.mediaRecorder && this.isRecording) {
      this.mediaRecorder.stop();
    }
    
    if (this.audioStream) {
      this.audioStream.getTracks().forEach(track => track.stop());
      this.audioStream = null;
    }
    
    if (this.synthesis) {
      this.synthesis.cancel();
    }
  }
}

// Export singleton instance
export const voiceService = new VoiceService();

// Export class for testing
export { VoiceService };