
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import MultilingualChat from '../MultilingualChat';
import { translationService } from '../../services/translation';
import type { TranslationResult } from '../../types';

// Import setup
import './setup';

describe('MultilingualChat', () => {
  const mockTranslationResult: TranslationResult = {
    originalText: 'Hello',
    translatedText: 'नमस्ते',
    confidence: 0.9,
    fromLanguage: 'en',
    toLanguage: 'hi',
    timestamp: new Date()
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(translationService.translateText).mockResolvedValue(mockTranslationResult);
    vi.mocked(translationService.translateVoice).mockResolvedValue(mockTranslationResult);
  });

  it('renders chat interface correctly', () => {
    render(
      <MultilingualChat
        recipientName="Test User"
        recipientLanguage="hi"
      />
    );

    expect(screen.getByText('Test User')).toBeInTheDocument();
    expect(screen.getByText('Speaking Hindi')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Type a message in English/)).toBeInTheDocument();
  });

  it('displays empty state message', () => {
    render(<MultilingualChat />);

    expect(screen.getByText('Start a conversation')).toBeInTheDocument();
    expect(screen.getByText(/Messages will be automatically translated/)).toBeInTheDocument();
  });

  it('sends text message and translates it', async () => {
    const onSendMessage = vi.fn();

    render(
      <MultilingualChat
        recipientLanguage="hi"
        onSendMessage={onSendMessage}
      />
    );

    const input = screen.getByPlaceholderText(/Type a message in English/);
    const sendButton = screen.getByTitle('Send message');

    fireEvent.change(input, { target: { value: 'Hello' } });
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(translationService.translateText).toHaveBeenCalledWith('Hello', 'en', 'hi');
    });

    expect(onSendMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        content: expect.objectContaining({
          originalText: 'Hello',
          messageType: 'text'
        }),
        isOwn: true
      })
    );
  });

  it('handles translation errors gracefully', async () => {
    const onSendMessage = vi.fn();
    vi.mocked(translationService.translateText).mockRejectedValue(new Error('Translation failed'));

    render(
      <MultilingualChat
        recipientLanguage="hi"
        onSendMessage={onSendMessage}
      />
    );

    const input = screen.getByPlaceholderText(/Type a message in English/);
    const sendButton = screen.getByTitle('Send message');

    fireEvent.change(input, { target: { value: 'Hello' } });
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(screen.getByText(/Translation failed/)).toBeInTheDocument();
    });
  });

  it('starts and stops voice recording', async () => {
    render(<MultilingualChat recipientLanguage="hi" />);

    const voiceButton = screen.getByTitle('Start voice recording');
    fireEvent.click(voiceButton);

    await waitFor(() => {
      expect(screen.getByText('Recording...')).toBeInTheDocument();
    });

    const stopButton = screen.getByTitle('Stop recording');
    fireEvent.click(stopButton);

    await waitFor(() => {
      expect(screen.queryByText('Recording...')).not.toBeInTheDocument();
    });
  });

  it('changes language selection', () => {
    render(<MultilingualChat />);

    const languageButton = screen.getByText('English');
    fireEvent.click(languageButton);

    expect(screen.getByText('Your Language')).toBeInTheDocument();
    expect(screen.getByText('हिंदी')).toBeInTheDocument();
  });

  it('renders messages with translation status', () => {
    const messages = [
      {
        id: 'msg1',
        content: {
          originalText: 'Hello',
          originalLanguage: 'en' as const,
          translations: { hi: 'नमस्ते' },
          messageType: 'text' as const
        },
        metadata: {
          timestamp: new Date(),
          readStatus: false,
          translationConfidence: 0.9
        },
        isOwn: true,
        translationStatus: 'translated' as const
      }
    ];

    render(
      <MultilingualChat
        messages={messages}
        recipientLanguage="hi"
      />
    );

    expect(screen.getByText('Hello')).toBeInTheDocument();
    expect(screen.getByText('Translated')).toBeInTheDocument();
    expect(screen.getByText('90%')).toBeInTheDocument();
  });

  it('retries failed translations', async () => {
    const onSendMessage = vi.fn();
    const messages = [
      {
        id: 'msg1',
        content: {
          originalText: 'Hello',
          originalLanguage: 'en' as const,
          translations: {},
          messageType: 'text' as const
        },
        metadata: {
          timestamp: new Date(),
          readStatus: false
        },
        isOwn: true,
        translationStatus: 'failed' as const,
        translationError: 'Translation failed'
      }
    ];

    render(
      <MultilingualChat
        messages={messages}
        recipientLanguage="hi"
        onSendMessage={onSendMessage}
      />
    );

    const retryButton = screen.getByTitle('Retry translation');
    fireEvent.click(retryButton);

    await waitFor(() => {
      expect(translationService.translateText).toHaveBeenCalledWith('Hello', 'en', 'hi');
    });
  });

  it('handles voice message playback', () => {
    const messages = [
      {
        id: 'msg1',
        content: {
          originalText: 'Hello',
          originalLanguage: 'en' as const,
          translations: { hi: 'नमस्ते' },
          messageType: 'voice' as const
        },
        metadata: {
          timestamp: new Date(),
          readStatus: false,
          attachments: [{
            id: 'audio1',
            type: 'audio' as const,
            url: 'blob:mock-url',
            filename: 'voice.webm',
            size: 1024
          }]
        },
        isOwn: false,
        translationStatus: 'translated' as const
      }
    ];

    render(
      <MultilingualChat
        messages={messages}
        recipientLanguage="hi"
      />
    );

    const audioElement = screen.getByTestId('voice-message-player');
    expect(audioElement).toBeInTheDocument();
    expect(audioElement).toHaveAttribute('src', 'blob:mock-url');
  });
});