// TranslationConfidenceIndicator Component Tests

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import TranslationConfidenceIndicator from '../TranslationConfidenceIndicator';
import type { TranslationResult } from '../../types';

// Import setup
import './setup';

describe('TranslationConfidenceIndicator', () => {
  const baseTranslation: TranslationResult = {
    originalText: 'Hello',
    translatedText: 'नमस्ते',
    fromLanguage: 'en',
    toLanguage: 'hi',
    timestamp: new Date(),
    confidence: 0.8
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders compact indicator correctly', () => {
    const translation = { ...baseTranslation, confidence: 0.85 };

    render(
      <TranslationConfidenceIndicator
        translation={translation}
        showDetails={false}
      />
    );

    expect(screen.getByText('85%')).toBeInTheDocument();
  });

  it('renders detailed indicator for high confidence', () => {
    const translation = { ...baseTranslation, confidence: 0.9 };

    render(
      <TranslationConfidenceIndicator
        translation={translation}
        showDetails={true}
      />
    );

    expect(screen.getByText('High confidence')).toBeInTheDocument();
    expect(screen.getByText('(90%)')).toBeInTheDocument();
    expect(screen.getByText('Translation is highly accurate and reliable.')).toBeInTheDocument();
  });

  it('renders detailed indicator for medium confidence', () => {
    const translation = { ...baseTranslation, confidence: 0.7 };

    render(
      <TranslationConfidenceIndicator
        translation={translation}
        showDetails={true}
      />
    );

    expect(screen.getByText('Medium confidence')).toBeInTheDocument();
    expect(screen.getByText('(70%)')).toBeInTheDocument();
    expect(screen.getByText(/generally accurate but may have minor issues/)).toBeInTheDocument();
  });

  it('renders detailed indicator for low confidence with retry button', () => {
    const translation = { ...baseTranslation, confidence: 0.4 };
    const onRetry = vi.fn();

    render(
      <TranslationConfidenceIndicator
        translation={translation}
        showDetails={true}
        onRetry={onRetry}
      />
    );

    expect(screen.getByText('Low confidence')).toBeInTheDocument();
    expect(screen.getByText('(40%)')).toBeInTheDocument();
    expect(screen.getByText(/quality is uncertain/)).toBeInTheDocument();

    const retryButton = screen.getByText('Retry');
    expect(retryButton).toBeInTheDocument();

    fireEvent.click(retryButton);
    expect(onRetry).toHaveBeenCalled();
  });

  it('shows language pair and timestamp', () => {
    const translation = { ...baseTranslation, confidence: 0.8 };

    render(
      <TranslationConfidenceIndicator
        translation={translation}
        showDetails={true}
      />
    );

    expect(screen.getByText('EN → HI')).toBeInTheDocument();
    expect(screen.getByText(translation.timestamp.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    }))).toBeInTheDocument();
  });

  it('does not show retry button for high confidence', () => {
    const translation = { ...baseTranslation, confidence: 0.9 };
    const onRetry = vi.fn();

    render(
      <TranslationConfidenceIndicator
        translation={translation}
        showDetails={true}
        onRetry={onRetry}
      />
    );

    expect(screen.queryByText('Retry')).not.toBeInTheDocument();
  });

  it('applies custom className', () => {
    const translation = { ...baseTranslation, confidence: 0.8 };

    const { container } = render(
      <TranslationConfidenceIndicator
        translation={translation}
        className="custom-class"
      />
    );

    expect(container.firstChild).toHaveClass('custom-class');
  });
});