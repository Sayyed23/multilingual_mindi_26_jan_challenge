// TranslationStatusIndicator Component Tests

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import TranslationStatusIndicator from '../TranslationStatusIndicator';

// Import setup
import './setup';

describe('TranslationStatusIndicator', () => {
  it('renders idle status correctly', () => {
    render(<TranslationStatusIndicator status="idle" />);

    expect(screen.getByText('Ready to translate')).toBeInTheDocument();
  });

  it('renders translating status with spinner', () => {
    render(<TranslationStatusIndicator status="translating" />);

    expect(screen.getByText('Translating...')).toBeInTheDocument();
  });

  it('renders translated status', () => {
    render(<TranslationStatusIndicator status="translated" />);

    expect(screen.getByText('Translated')).toBeInTheDocument();
  });

  it('renders failed status with retry button', () => {
    const onRetry = vi.fn();

    render(
      <TranslationStatusIndicator
        status="failed"
        onRetry={onRetry}
      />
    );

    expect(screen.getByText('Translation failed')).toBeInTheDocument();

    const retryButton = screen.getByTitle('Retry translation');
    fireEvent.click(retryButton);

    expect(onRetry).toHaveBeenCalled();
  });

  it('does not show retry button when onRetry is not provided', () => {
    render(<TranslationStatusIndicator status="failed" />);

    expect(screen.queryByTitle('Retry translation')).not.toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <TranslationStatusIndicator
        status="idle"
        className="custom-class"
      />
    );

    expect(container.firstChild).toHaveClass('custom-class');
  });
});