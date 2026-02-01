// VoiceMessageRecorder Component Tests

import { describe, it, expect, vi, beforeEach, beforeAll } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import VoiceMessageRecorder from '../VoiceMessageRecorder';
import { translationService } from '../../services/translation';
import type { TranslationResult } from '../../types';

// Import setup
import './setup';

// Mock MediaRecorder globally
const mockMediaRecorder = {
  start: vi.fn(),
  stop: vi.fn(),
  ondataavailable: null as any,
  onstop: null as any,
  stream: {
    getTracks: () => [{ stop: vi.fn() }]
  }
};

beforeAll(() => {
  if (!globalThis.MediaRecorder) {
    vi.stubGlobal('MediaRecorder', vi.fn(() => mockMediaRecorder));
  }
  
  // Mock getUserMedia
  if (!globalThis.navigator.mediaDevices) {
    vi.stubGlobal('navigator', {
      ...globalThis.navigator,
      mediaDevices: {
        getUserMedia: vi.fn().mockResolvedValue({
          getTracks: () => [{ stop: vi.fn() }]
        })
      }
    });
  }
});

describe('VoiceMessageRecorder', () => {
  const mockTranslationResult: TranslationResult = {
    originalText: 'Hello world',
    translatedText: 'नमस्ते दुनिया',
    confidence: 0.85,
    fromLanguage: 'en',
    toLanguage: 'hi',
    timestamp: new Date()
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(translationService.translateVoice).mockResolvedValue(mockTranslationResult);
    vi.mocked(translationService.getLanguageName).mockImplementation((lang) => {
      const names: Record<string, string> = {
        'en': 'English',
        'hi': 'Hindi'
      };
      return names[lang] || lang;
    });
  });

  it('renders voice recorder interface', () => {
    render(
      <VoiceMessageRecorder
        fromLanguage="en"
        toLanguage="hi"
      />
    );

    expect(screen.getByText('Voice Message')).toBeInTheDocument();
    // Check for language display more flexibly
    expect(screen.getByText(/English/)).toBeInTheDocument();
    expect(screen.getByText(/Hindi/)).toBeInTheDocument();
    expect(screen.getAllByRole('button')).toHaveLength(2); // Record button and close button
  });

  it('starts recording when record button is clicked', async () => {
    render(
      <VoiceMessageRecorder
        fromLanguage="en"
        toLanguage="hi"
      />
    );

    const buttons = screen.getAllByRole('button');
    const recordButton = buttons.find(button => button.querySelector('svg')); // Find button with mic icon
    if (recordButton) {
      fireEvent.click(recordButton);
    }

    await waitFor(() => {
      expect(screen.getByText(/Speak clearly/)).toBeInTheDocument();
    });
  });

  it('stops recording and processes audio', async () => {
    render(
      <VoiceMessageRecorder
        fromLanguage="en"
        toLanguage="hi"
      />
    );

    const buttons = screen.getAllByRole('button');
    const recordButton = buttons.find(button => button.querySelector('svg'));
    if (recordButton) {
      fireEvent.click(recordButton);
    }

    // Simulate recording stop
    if (mockMediaRecorder.onstop) {
      mockMediaRecorder.onstop();
    }

    await waitFor(() => {
      expect(translationService.translateVoice).toHaveBeenCalled();
    });
  });

  it('displays translation results', async () => {
    render(
      <VoiceMessageRecorder
        fromLanguage="en"
        toLanguage="hi"
      />
    );

    const buttons = screen.getAllByRole('button');
    const recordButton = buttons.find(button => button.querySelector('svg'));
    if (recordButton) {
      fireEvent.click(recordButton);
    }

    // Simulate successful recording and translation
    if (mockMediaRecorder.onstop) {
      mockMediaRecorder.onstop();
    }

    await waitFor(() => {
      expect(screen.getByText('Hello world')).toBeInTheDocument();
      expect(screen.getByText('नमस्ते दुनिया')).toBeInTheDocument();
      expect(screen.getByText('High confidence')).toBeInTheDocument();
    });
  });

  it('handles translation errors', async () => {
    vi.mocked(translationService.translateVoice).mockRejectedValue(new Error('Translation failed'));

    render(
      <VoiceMessageRecorder
        fromLanguage="en"
        toLanguage="hi"
      />
    );

    const buttons = screen.getAllByRole('button');
    const recordButton = buttons.find(button => button.querySelector('svg'));
    if (recordButton) {
      fireEvent.click(recordButton);
    }

    if (mockMediaRecorder.onstop) {
      mockMediaRecorder.onstop();
    }

    await waitFor(() => {
      expect(screen.getByText('Translation failed')).toBeInTheDocument();
      expect(screen.getByText('Try Again')).toBeInTheDocument();
    });
  });

  it('sends voice message when send button is clicked', async () => {
    const onSend = vi.fn();

    render(
      <VoiceMessageRecorder
        fromLanguage="en"
        toLanguage="hi"
        onSend={onSend}
      />
    );

    const buttons = screen.getAllByRole('button');
    const recordButton = buttons.find(button => button.querySelector('svg'));
    if (recordButton) {
      fireEvent.click(recordButton);
    }

    if (mockMediaRecorder.onstop) {
      mockMediaRecorder.onstop();
    }

    await waitFor(() => {
      const sendButton = screen.getByText('Send Voice Message');
      fireEvent.click(sendButton);
    });

    expect(onSend).toHaveBeenCalledWith(
      expect.any(Blob),
      expect.objectContaining({
        originalText: 'Hello world',
        translatedText: 'नमस्ते दुनिया'
      })
    );
  });

  it('cancels recording', () => {
    const onCancel = vi.fn();

    render(
      <VoiceMessageRecorder
        fromLanguage="en"
        toLanguage="hi"
        onCancel={onCancel}
      />
    );

    // Find the close button (X icon)
    const buttons = screen.getAllByRole('button');
    const closeButton = buttons.find(button => !button.querySelector('svg[class*="mic"]'));
    if (closeButton) {
      fireEvent.click(closeButton);
    }

    expect(onCancel).toHaveBeenCalled();
  });

  it('respects maximum duration', async () => {
    const maxDuration = 5;

    render(
      <VoiceMessageRecorder
        fromLanguage="en"
        toLanguage="hi"
        maxDuration={maxDuration}
      />
    );

    expect(screen.getByText(`/ 0:0${maxDuration}`)).toBeInTheDocument();
  });

  it('retries translation on low confidence', async () => {
    const lowConfidenceResult: TranslationResult = {
      ...mockTranslationResult,
      confidence: 0.4
    };

    vi.mocked(translationService.translateVoice)
      .mockResolvedValueOnce(lowConfidenceResult)
      .mockResolvedValueOnce(mockTranslationResult);

    render(
      <VoiceMessageRecorder
        fromLanguage="en"
        toLanguage="hi"
      />
    );

    const buttons = screen.getAllByRole('button');
    const recordButton = buttons.find(button => button.querySelector('svg'));
    if (recordButton) {
      fireEvent.click(recordButton);
    }

    if (mockMediaRecorder.onstop) {
      mockMediaRecorder.onstop();
    }

    await waitFor(() => {
      expect(screen.getByText('Low confidence')).toBeInTheDocument();
      const retryButton = screen.getByText('Retry');
      fireEvent.click(retryButton);
    });

    await waitFor(() => {
      expect(translationService.translateVoice).toHaveBeenCalledTimes(2);
    });
  });
});