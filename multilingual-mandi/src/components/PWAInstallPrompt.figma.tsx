
import { figma } from '@figma/code-connect';
import PWAInstallPrompt from './PWAInstallPrompt';

/**
 * Code Connect mapping for PWAInstallPrompt component
 * Maps Figma design to React component implementation
 */
figma.connect(PWAInstallPrompt, 'https://www.figma.com/design/LuWxoSCaxmFX6xsXuathmK/flow-chart1', {
  props: {},
  example: () => (
    <PWAInstallPrompt
      onInstall={() => { }}
      onDismiss={() => { }}
    />
  ),
});

export default PWAInstallPrompt;