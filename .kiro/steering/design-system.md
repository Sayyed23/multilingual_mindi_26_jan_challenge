---
inclusion: always
---

# Design System Rules for Multilingual Mandi

## Design System Structure

### 1. Token Definitions

**Color System:**
```javascript
// Primary colors defined in tailwind.config.js
colors: {
  primary: "#37ec13",           // Main brand green
  "background-light": "#f6f8f6", // Light theme background
  "background-dark": "#132210",  // Dark theme background
}

// Extended Tailwind colors used throughout:
- Green palette: green-50 to green-900 (primary brand)
- Blue palette: blue-50 to blue-900 (buyer role)
- Gray palette: gray-50 to gray-900 (neutral)
- Red palette: red-500 (alerts, errors)
- Purple palette: purple-600 (database features)
- Orange palette: orange-600 (Supabase features)
```

**Typography System:**
```css
/* Font family defined in tailwind.config.js */
fontFamily: {
  "display": ["Lexend", "sans-serif"],
  "sans": ["Lexend", "sans-serif"],
}

/* Typography scale follows Tailwind defaults:
- text-xs (12px)
- text-sm (14px) 
- text-base (16px)
- text-lg (18px)
- text-xl (20px)
- text-2xl (24px)
- text-3xl (30px)
- text-4xl (36px)
- text-5xl (48px)
- text-6xl (60px)
*/
```

**Spacing & Layout:**
- Uses Tailwind's default spacing scale (0.25rem increments)
- Container max-width: `max-w-7xl` (80rem)
- Standard padding: `px-4 sm:px-6 lg:px-8`
- Component padding: `p-4`, `p-6`, `p-8`

### 2. Component Library

**Location:** `src/components/`

**Architecture Pattern:**
- Functional components with TypeScript
- Props interfaces defined inline or in separate types
- Default exports for pages, named exports for reusable components
- Composition over inheritance

**Key Components:**
```typescript
// Layout Components
- AppShell.tsx          // Main app wrapper with navigation
- OfflineIndicator.tsx  // Network status indicator

// PWA Components  
- PWAInstallPrompt.tsx  // Installation prompt
- PWAStatusIndicator.tsx // PWA status display

// Feature Components
- ChromeMLKitDemo.tsx   // Translation demo
- DatabaseDemo.tsx      // Database functionality demo
- ServiceWorkerDemo.tsx // PWA features demo
- SupabaseDemo.tsx      // Backend integration demo

// Business Logic Components
- PriceAlertsManager.tsx
- RealTimePriceUpdates.tsx
- RealTimeTranslation.tsx
- RegionalPriceComparison.tsx
- VoiceMessageRecorder.tsx
```

### 3. Frameworks & Libraries

**Core Stack:**
- **Frontend:** React 19.2.0 with TypeScript ~5.9.3
- **Build:** Vite 7.2.4 with HMR
- **Styling:** Tailwind CSS 3.4.17
- **Routing:** React Router DOM 7.13.0
- **Icons:** Lucide React 0.563.0
- **Backend:** Supabase 2.93.3
- **Testing:** Vitest 4.0.18 with jsdom, fast-check 4.5.3

**Development Tools:**
- ESLint 9.39.1 with TypeScript support
- PostCSS 8.5.6 with Autoprefixer
- TypeScript strict configuration

### 4. Asset Management

**Static Assets:** `public/` directory
```
public/
├── icons/              # PWA icons (72x72 to 512x512)
├── screenshots/        # App store screenshots
├── manifest.json       # PWA manifest
├── sw.js              # Service worker
└── robots.txt         # SEO configuration
```

**Image Strategy:**
- External images via Unsplash URLs for demos
- Local icons in PNG format with multiple sizes
- SVG icons via Lucide React library
- No CDN configuration (uses default hosting)

### 5. Icon System

**Primary Icon Library:** Lucide React
```typescript
// Common icons used:
import { 
  Bell, Search, Leaf, HelpCircle, Settings, LogOut, 
  Hexagon, Languages, TrendingUp, Users, Shield,
  Download, X, Smartphone, Monitor, Database
} from 'lucide-react';
```

**Icon Usage Patterns:**
- Size prop: `size={18}`, `size={20}`, `size={22}` for UI elements
- Larger sizes: `size={24}`, `size={32}` for feature highlights
- Consistent sizing within component contexts
- Color via Tailwind classes: `text-gray-400`, `text-green-600`

### 6. Styling Approach

**CSS Methodology:** Utility-first with Tailwind CSS

**Global Styles:** `src/index.css`
```css
@layer base {
  body {
    @apply antialiased bg-gray-50 text-gray-900;
  }
}
```

**Component Styling Patterns:**
```typescript
// Role-based theming
const logoBg = isBuyer ? 'bg-blue-600' : 'bg-green-600';
const ringColor = isBuyer ? 'focus:ring-blue-500/50' : 'focus:ring-green-500/50';

// Responsive design
className="hidden md:flex items-center gap-8"
className="w-full pl-12 pr-4 py-2.5 rounded-full"

// State-based styling
className={`text-sm font-bold transition-colors ${
  isActive(item.path) ? 'text-gray-900' : 'text-gray-500 hover:text-gray-900'
}`}
```

**Responsive Breakpoints:**
- `sm:` 640px and up
- `md:` 768px and up  
- `lg:` 1024px and up
- `xl:` 1280px and up

### 7. Project Structure

```
src/
├── components/         # Reusable UI components
├── pages/             # Route-level components
├── hooks/             # Custom React hooks
├── services/          # Business logic and API calls
├── types/             # TypeScript type definitions
├── utils/             # Utility functions
├── lib/               # Third-party library configurations
└── assets/            # Static assets (minimal)
```

**File Naming Conventions:**
- Components: PascalCase (`AppShell.tsx`)
- Pages: PascalCase with "Page" suffix (`SettingsPage.tsx`)
- Services: camelCase (`realTimePrices.ts`)
- Hooks: camelCase with "use" prefix (`useAuth.ts`)
- Types: PascalCase interfaces in `types/index.ts`

## Figma Integration Guidelines

### Design-to-Code Mapping

**Component Mapping Strategy:**
1. **Reuse Existing Components:** Always check `src/components/` for existing implementations
2. **Design System Tokens:** Replace Figma colors with Tailwind equivalents:
   - Primary green: `bg-green-600`, `text-green-600`
   - Buyer blue: `bg-blue-600`, `text-blue-600`
   - Neutral grays: `bg-gray-50`, `text-gray-900`

**Tailwind Class Replacements:**
```typescript
// Replace generic Tailwind with design system tokens
'bg-emerald-600' → 'bg-green-600'  // Use brand green
'text-slate-900' → 'text-gray-900' // Use consistent gray
'font-inter'     → 'font-sans'     // Use Lexend font
```

**Layout Patterns:**
```typescript
// Standard container
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

// Card pattern
<div className="bg-white overflow-hidden shadow rounded-lg">

// Button patterns
<button className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors">

// Role-based theming
const buttonColor = isBuyer ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-600 hover:bg-green-700';
```

### Code Connect Integration

**Component Mapping Rules:**
- Map Figma components to existing React components in `src/components/`
- Use TypeScript interfaces from `src/types/index.ts`
- Follow existing prop patterns and naming conventions
- Maintain accessibility attributes (`aria-label`, `role`, `tabIndex`)

**File Path Conventions:**
```typescript
// Component locations for Code Connect
'src/components/AppShell.tsx'           // Main layout
'src/components/PWAInstallPrompt.tsx'   // PWA features
'src/pages/Home.tsx'                    // Landing page
'src/pages/Auth.tsx'                    // Authentication
'src/pages/*Dashboard.tsx'              // Role-specific dashboards
```

### Quality Standards

**Visual Parity Requirements:**
1. Exact color matching using design system tokens
2. Consistent spacing using Tailwind scale
3. Typography matching using Lexend font family
4. Icon consistency using Lucide React
5. Responsive behavior across breakpoints

**Code Quality Standards:**
1. TypeScript strict mode compliance
2. Accessibility attributes required
3. Responsive design implementation
4. Performance optimization (lazy loading, memoization)
5. Error boundary implementation for production components

**Testing Requirements:**
1. Unit tests for business logic components
2. Property-based tests for data transformations
3. Integration tests for user workflows
4. PWA functionality testing
5. Cross-browser compatibility validation