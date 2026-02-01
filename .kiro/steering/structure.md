# Project Structure

## Root Directory
```
multilingual-mandi/
├── public/           # Static assets and PWA files
├── src/             # Source code
├── .kiro/           # Kiro configuration and specs
└── dist/            # Build output (generated)
```

## Source Code Organization (`src/`)

### Core Application
- `main.tsx` - Application entry point
- `App.tsx` - Main app component with routing
- `index.css` - Global styles and Tailwind imports

### Components (`src/components/`)
- **Layout**: `AppShell.tsx` - Main app layout wrapper
- **PWA**: `PWAInstallPrompt.tsx`, `PWAStatusIndicator.tsx`, `OfflineIndicator.tsx`
- **Features**: Component files for specific functionality
- **Demos**: `DatabaseDemo.tsx`, `ServiceWorkerDemo.tsx`, `ChromeMLKitDemo.tsx`

### Pages (`src/pages/`)
- `Home.tsx` - Landing page
- `Auth.tsx` - Authentication
- `Onboarding.tsx` - User onboarding flow
- `*Dashboard.tsx` - Role-specific dashboards (Farmer, Buyer)
- `*Page.tsx` - Feature pages (Negotiation, Alerts, Community, Settings, etc.)

### Business Logic (`src/services/`)
- `auth.ts` - Authentication service
- `database.ts` - Local database operations
- `translation.ts` - Translation engine
- `price.ts` - Price discovery logic
- `messaging.ts` - Chat and communication
- `realTimePrices.ts` - Live price updates
- `speechToText.ts` - Voice input handling
- `pwaInit.ts` - PWA initialization
- `serviceWorker.ts` - Service worker management
- `migrations.ts` - Database schema migrations
- `seedData.ts` - Sample data for development

### State Management (`src/hooks/`)
- Custom React hooks for feature-specific state
- `useAuth.ts`, `useDatabase.ts`, `useTranslation.ts`, etc.
- Follows React hooks patterns for reusable logic

### Type Definitions (`src/types/`)
- `index.ts` - Comprehensive TypeScript interfaces
- Covers all data models: User, Transaction, Message, Commodity, etc.
- Includes cache and sync interfaces for offline functionality

### Utilities (`src/utils/`)
- `pwa.ts` - PWA helper functions
- `serviceWorkerTest.ts` - Service worker testing utilities

### Testing (`src/services/__tests__/`)
- `setup.ts` - Test environment configuration
- `*.test.ts` - Unit tests for services
- `*.property.test.ts` - Property-based tests with fast-check

## PWA Assets (`public/`)
- `manifest.json` - PWA manifest
- `sw.js` - Service worker
- `icons/` - App icons in multiple sizes
- `screenshots/` - App store screenshots

## Configuration Files
- `vite.config.ts` - Vite build configuration with PWA settings
- `tailwind.config.js` - Tailwind CSS customization
- `tsconfig.*.json` - TypeScript configurations for different contexts
- `eslint.config.js` - ESLint rules and settings
- `postcss.config.js` - PostCSS configuration

## Naming Conventions
- **Components**: PascalCase (e.g., `AppShell.tsx`)
- **Pages**: PascalCase with "Page" suffix (e.g., `SettingsPage.tsx`)
- **Services**: camelCase (e.g., `realTimePrices.ts`)
- **Hooks**: camelCase with "use" prefix (e.g., `useAuth.ts`)
- **Types**: PascalCase interfaces in `types/index.ts`
- **Tests**: Same name as source file with `.test.ts` or `.property.test.ts`

## Import Patterns
- Relative imports for local files
- Absolute imports from `src/` root when needed
- React components use named exports
- Services and utilities use default exports where appropriate