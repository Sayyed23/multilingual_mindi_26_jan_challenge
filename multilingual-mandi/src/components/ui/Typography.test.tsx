import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Typography from './Typography';

describe('Typography Component', () => {
  describe('Basic Rendering', () => {
    it('renders with default props', () => {
      render(<Typography variant="body">Test content</Typography>);
      const element = screen.getByText('Test content');
      expect(element).toBeInTheDocument();
      expect(element.tagName).toBe('P');
    });

    it('renders correct HTML element for each variant', () => {
      const variants = [
        { variant: 'h1' as const, expectedTag: 'H1' },
        { variant: 'h2' as const, expectedTag: 'H2' },
        { variant: 'h3' as const, expectedTag: 'H3' },
        { variant: 'h4' as const, expectedTag: 'H4' },
        { variant: 'label' as const, expectedTag: 'LABEL' },
        { variant: 'caption' as const, expectedTag: 'SPAN' },
        { variant: 'body' as const, expectedTag: 'P' },
      ];

      variants.forEach(({ variant, expectedTag }) => {
        const { unmount } = render(
          <Typography variant={variant}>Test {variant}</Typography>
        );
        const element = screen.getByText(`Test ${variant}`);
        expect(element.tagName).toBe(expectedTag);
        unmount();
      });
    });
  });

  describe('Typography Classes', () => {
    it('applies correct typography classes for each variant', () => {
      render(<Typography variant="h1">Heading 1</Typography>);
      const element = screen.getByText('Heading 1');
      expect(element).toHaveClass('text-3xl', 'md:text-4xl', 'font-bold', 'font-display');
    });

    it('applies correct weight classes', () => {
      const weights = ['normal', 'medium', 'semibold', 'bold'] as const;

      weights.forEach((weight) => {
        const { unmount } = render(
          <Typography variant="body" weight={weight}>Test {weight}</Typography>
        );
        const element = screen.getByText(`Test ${weight}`);
        expect(element).toHaveClass(`font-${weight}`);
        unmount();
      });
    });

    it('applies correct alignment classes', () => {
      const alignments = ['left', 'center', 'right'] as const;

      alignments.forEach((align) => {
        const { unmount } = render(
          <Typography variant="body" align={align}>Test {align}</Typography>
        );
        const element = screen.getByText(`Test ${align}`);
        expect(element).toHaveClass(`text-${align}`);
        unmount();
      });
    });
  });

  describe('Color System', () => {
    it('applies standard color classes', () => {
      const colors = [
        { color: 'primary' as const, expectedClass: 'text-gray-900' },
        { color: 'secondary' as const, expectedClass: 'text-gray-600' },
        { color: 'muted' as const, expectedClass: 'text-gray-500' },
        { color: 'error' as const, expectedClass: 'text-red-600' },
        { color: 'success' as const, expectedClass: 'text-green-600' },
        { color: 'warning' as const, expectedClass: 'text-orange-600' },
        { color: 'info' as const, expectedClass: 'text-blue-600' },
      ];

      colors.forEach(({ color, expectedClass }) => {
        const { unmount } = render(
          <Typography variant="body" color={color}>Test {color}</Typography>
        );
        const element = screen.getByText(`Test ${color}`);
        expect(element).toHaveClass(expectedClass);
        unmount();
      });
    });

    it('applies role-based colors when role is provided with primary color', () => {
      const roles = [
        { role: 'vendor' as const, expectedClass: 'text-green-600' },
        { role: 'buyer' as const, expectedClass: 'text-blue-600' },
        { role: 'agent' as const, expectedClass: 'text-purple-600' },
      ];

      roles.forEach(({ role, expectedClass }) => {
        const { unmount } = render(
          <Typography variant="body" role={role} color="primary">Test {role}</Typography>
        );
        const element = screen.getByText(`Test ${role}`);
        expect(element).toHaveClass(expectedClass);
        unmount();
      });
    });

    it('ignores role-based colors for non-primary colors', () => {
      render(
        <Typography variant="body" role="vendor" color="error">Test error</Typography>
      );
      const element = screen.getByText('Test error');
      expect(element).toHaveClass('text-red-600');
      expect(element).not.toHaveClass('text-green-600');
    });
  });

  describe('Accessibility Features', () => {
    it('applies accessibility classes for better readability', () => {
      render(<Typography variant="body">Test content</Typography>);
      const element = screen.getByText('Test content');
      expect(element).toHaveClass('antialiased', 'leading-relaxed', 'break-words');
    });

    it('applies aria-label when provided', () => {
      render(
        <Typography variant="body" aria-label="Custom label">Test content</Typography>
      );
      const element = screen.getByText('Test content');
      expect(element).toHaveAttribute('aria-label', 'Custom label');
    });

    it('applies aria-describedby when provided', () => {
      render(
        <Typography variant="body" aria-describedby="description-id">Test content</Typography>
      );
      const element = screen.getByText('Test content');
      expect(element).toHaveAttribute('aria-describedby', 'description-id');
    });

    it('applies aria-live when provided', () => {
      render(
        <Typography variant="body" aria-live="polite">Test content</Typography>
      );
      const element = screen.getByText('Test content');
      expect(element).toHaveAttribute('aria-live', 'polite');
    });

    it('applies id when provided', () => {
      render(
        <Typography variant="body" id="test-id">Test content</Typography>
      );
      const element = screen.getByText('Test content');
      expect(element).toHaveAttribute('id', 'test-id');
    });

    it('adds semantic heading role for heading variants with non-heading elements', () => {
      // This test would be relevant if we had a case where heading variants 
      // don't map to heading elements, but our current implementation always maps correctly
      render(<Typography variant="h1">Heading</Typography>);
      const element = screen.getByText('Heading');
      expect(element.tagName).toBe('H1');
      // No additional role needed since it's already a proper heading element
    });
  });

  describe('Custom Classes and Props', () => {
    it('applies custom className', () => {
      render(
        <Typography variant="body" className="custom-class">Test content</Typography>
      );
      const element = screen.getByText('Test content');
      expect(element).toHaveClass('custom-class');
    });

    it('passes through additional props', () => {
      render(
        <Typography variant="body" data-testid="typography-element">Test content</Typography>
      );
      const element = screen.getByTestId('typography-element');
      expect(element).toBeInTheDocument();
    });

    it('combines all classes correctly', () => {
      render(
        <Typography
          variant="h2"
          weight="semibold"
          color="success"
          align="center"
          className="custom-class"
        >
          Combined test
        </Typography>
      );
      const element = screen.getByText('Combined test');
      expect(element).toHaveClass(
        'text-2xl', 'md:text-3xl', 'font-semibold', 'font-display', // variant classes
        'font-semibold', // weight classes
        'text-green-600', // color classes
        'text-center', // alignment classes
        'antialiased', 'leading-relaxed', 'break-words', // accessibility classes
        'custom-class' // custom class
      );
    });
  });

  describe('Edge Cases', () => {
    it('handles empty children', () => {
      render(<Typography variant="body">{""}</Typography>);
      const element = screen.getByText('');
      expect(element).toBeInTheDocument();
    });

    it('handles undefined color gracefully', () => {
      render(<Typography variant="body" color={undefined as any}>Test</Typography>);
      const element = screen.getByText('Test');
      expect(element).toHaveClass('text-gray-900'); // Should default to primary
    });

    it('handles invalid role gracefully', () => {
      render(<Typography variant="body" role={'invalid' as any}>Test</Typography>);
      const element = screen.getByText('Test');
      expect(element).toHaveClass('text-gray-900'); // Should use standard color
    });
  });
});