
import { figma } from '@figma/code-connect';
import Button from './Button';

/**
 * Code Connect mapping for Button component
 * Maps Figma design system button to React component implementation
 */
figma.connect(Button, 'https://www.figma.com/design/LuWxoSCaxmFX6xsXuathmK/flow-chart1', {
  props: {
    variant: figma.enum('Variant', {
      'Primary': 'primary',
      'Secondary': 'secondary',
      'Outline': 'outline',
      'Ghost': 'ghost',
      'Danger': 'danger'
    }),
    size: figma.enum('Size', {
      'Small': 'sm',
      'Medium': 'md',
      'Large': 'lg'
    }),
    role: figma.enum('Role', {
      'Vendor': 'vendor',
      'Buyer': 'buyer',
      'Agent': 'agent'
    }),
    disabled: figma.boolean('Disabled'),
    loading: figma.boolean('Loading'),
    fullWidth: figma.boolean('Full Width'),
    children: figma.string('Label'),
  },
  example: ({ variant, size, role, disabled, loading, fullWidth, children }) => (
    <Button
      variant={variant}
      size={size}
      role={role}
      disabled={disabled}
      loading={loading}
      fullWidth={fullWidth}
    >
      {children}
    </Button>
  ),
});

export default Button;