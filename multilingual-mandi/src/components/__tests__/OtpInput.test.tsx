/**
 * Unit tests for OTP Input Component
 * Tests OTP input functionality and user interactions
 * Supports Requirements: 4.1 - Mobile number verification through OTP
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import OtpInput from '../OtpInput';

describe('OtpInput', () => {
  const defaultProps = {
    value: '',
    onChange: jest.fn(),
    onComplete: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correct number of input fields', () => {
    render(<OtpInput {...defaultProps} length={6} />);
    
    const inputs = screen.getAllByRole('textbox');
    expect(inputs).toHaveLength(6);
  });

  it('renders with custom length', () => {
    render(<OtpInput {...defaultProps} length={4} />);
    
    const inputs = screen.getAllByRole('textbox');
    expect(inputs).toHaveLength(4);
  });

  it('displays initial value correctly', () => {
    render(<OtpInput {...defaultProps} value="123" length={6} />);
    
    const inputs = screen.getAllByRole('textbox') as HTMLInputElement[];
    expect(inputs[0].value).toBe('1');
    expect(inputs[1].value).toBe('2');
    expect(inputs[2].value).toBe('3');
    expect(inputs[3].value).toBe('');
  });

  it('calls onChange when digit is entered', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    
    render(<OtpInput {...defaultProps} onChange={onChange} />);
    
    const firstInput = screen.getAllByRole('textbox')[0];
    await user.type(firstInput, '5');
    
    expect(onChange).toHaveBeenCalledWith('5');
  });

  it('moves focus to next input after entering digit', async () => {
    const user = userEvent.setup();
    
    render(<OtpInput {...defaultProps} />);
    
    const inputs = screen.getAllByRole('textbox');
    const firstInput = inputs[0];
    
    await user.type(firstInput, '5');
    
    // Check that the second input is now the active element
    expect(document.activeElement).toBe(inputs[1]);
  });

  it('calls onComplete when all digits are entered', async () => {
    const user = userEvent.setup();
    const onComplete = jest.fn();
    
    render(<OtpInput {...defaultProps} onComplete={onComplete} length={4} />);
    
    const inputs = screen.getAllByRole('textbox');
    
    for (let i = 0; i < 4; i++) {
      await user.type(inputs[i], (i + 1).toString());
    }
    
    expect(onComplete).toHaveBeenCalledWith('1234');
  });

  it('handles backspace correctly', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    
    render(<OtpInput {...defaultProps} value="12" onChange={onChange} />);
    
    const secondInput = screen.getAllByRole('textbox')[1];
    secondInput.focus();
    
    await user.keyboard('{Backspace}');
    
    expect(onChange).toHaveBeenCalledWith('1');
  });

  it('moves focus to previous input on backspace when current is empty', async () => {
    const user = userEvent.setup();
    
    render(<OtpInput {...defaultProps} value="1" />);
    
    const inputs = screen.getAllByRole('textbox');
    const secondInput = inputs[1];
    const firstInput = inputs[0];
    
    secondInput.focus();
    await user.keyboard('{Backspace}');
    
    expect(document.activeElement).toBe(firstInput);
  });

  it('handles arrow key navigation', async () => {
    const user = userEvent.setup();
    
    render(<OtpInput {...defaultProps} />);
    
    const inputs = screen.getAllByRole('textbox');
    const firstInput = inputs[0];
    const secondInput = inputs[1];
    
    firstInput.focus();
    await user.keyboard('{ArrowRight}');
    
    expect(document.activeElement).toBe(secondInput);
    
    await user.keyboard('{ArrowLeft}');
    
    expect(document.activeElement).toBe(firstInput);
  });

  it('handles paste operation', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    const onComplete = jest.fn();
    
    render(
      <OtpInput 
        {...defaultProps} 
        onChange={onChange} 
        onComplete={onComplete} 
        length={6} 
      />
    );
    
    const firstInput = screen.getAllByRole('textbox')[0];
    firstInput.focus();
    
    // Simulate paste event
    await user.paste('123456');
    
    expect(onChange).toHaveBeenCalledWith('123456');
    expect(onComplete).toHaveBeenCalledWith('123456');
  });

  it('handles partial paste operation', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    
    render(<OtpInput {...defaultProps} onChange={onChange} length={6} />);
    
    const firstInput = screen.getAllByRole('textbox')[0];
    firstInput.focus();
    
    await user.paste('123');
    
    expect(onChange).toHaveBeenCalledWith('123');
  });

  it('ignores non-numeric input', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    
    render(<OtpInput {...defaultProps} onChange={onChange} />);
    
    const firstInput = screen.getAllByRole('textbox')[0];
    await user.type(firstInput, 'a');
    
    expect(onChange).not.toHaveBeenCalled();
  });

  it('handles disabled state', () => {
    render(<OtpInput {...defaultProps} disabled={true} />);
    
    const inputs = screen.getAllByRole('textbox') as HTMLInputElement[];
    inputs.forEach(input => {
      expect(input).toBeDisabled();
    });
  });

  it('applies custom className', () => {
    render(<OtpInput {...defaultProps} className="custom-class" />);
    
    const container = document.querySelector('.otp-input-container');
    expect(container).toHaveClass('custom-class');
  });

  it('uses custom placeholder', () => {
    render(<OtpInput {...defaultProps} placeholder="X" />);
    
    const inputs = screen.getAllByRole('textbox') as HTMLInputElement[];
    inputs.forEach(input => {
      expect(input.placeholder).toBe('X');
    });
  });

  it('selects all text when input is focused', async () => {
    const user = userEvent.setup();
    
    render(<OtpInput {...defaultProps} value="123456" />);
    
    const firstInput = screen.getAllByRole('textbox')[0] as HTMLInputElement;
    
    await user.click(firstInput);
    
    // Check if text is selected (this is a simplified check)
    expect(firstInput.selectionStart).toBe(0);
    expect(firstInput.selectionEnd).toBe(1);
  });

  it('handles Enter key when OTP is complete', async () => {
    const user = userEvent.setup();
    const onComplete = jest.fn();
    
    render(<OtpInput {...defaultProps} value="123456" onComplete={onComplete} />);
    
    const firstInput = screen.getAllByRole('textbox')[0];
    firstInput.focus();
    
    await user.keyboard('{Enter}');
    
    expect(onComplete).toHaveBeenCalledWith('123456');
  });

  it('limits input to single character', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    
    render(<OtpInput {...defaultProps} onChange={onChange} />);
    
    const firstInput = screen.getAllByRole('textbox')[0];
    await user.type(firstInput, '123');
    
    // Should only accept the last character
    expect(onChange).toHaveBeenCalledWith('3');
  });
});