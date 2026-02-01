import { figma } from '@figma/code-connect';
import Typography from './Typography';

/**
 * Code Connect mapping for Typography component
 * Maps Figma text styles to React typography component with accessibility features
 */
figma.connect(Typography, 'https://www.figma.com/design/LuWxoSCaxmFX6xsXuathmK/flow-chart1', {
  props: {
    variant: figma.enum('Variant', {
      'Heading 1': 'h1',
      'Heading 2': 'h2',
      'Heading 3': 'h3',
      'Heading 4': 'h4',
      'Body': 'body',
      'Caption': 'caption',
      'Label': 'label'
    }),
    weight: figma.enum('Weight', {
      'Normal': 'normal',
      'Medium': 'medium',
      'Semibold': 'semibold',
      'Bold': 'bold'
    }),
    color: figma.enum('Color', {
      'Primary': 'primary',
      'Secondary': 'secondary',
      'Muted': 'muted',
      'Error': 'error',
      'Success': 'success',
      'Warning': 'warning',
      'Info': 'info'
    }),
    align: figma.enum('Align', {
      'Left': 'left',
      'Center': 'center',
      'Right': 'right'
    }),
    role: figma.enum('Role', {
      'Vendor': 'vendor',
      'Buyer': 'buyer',
      'Agent': 'agent'
    }),
    children: figma.string('Text'),
  },
  example: ({ variant, weight, color, align, role, children }) => (
    <Typography
      variant={variant}
      weight={weight}
      color={color}
      align={align}
      role={role}
    >
      {children}
    </Typography>
  ),
});

export default Typography;