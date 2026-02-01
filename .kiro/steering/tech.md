# Technology Stack

## Core Technologies
- **Frontend**: React 19.2.0 with TypeScript
- **Build Tool**: Vite 7.2.4 with Hot Module Replacement (HMR)
- **Styling**: Tailwind CSS 3.4.17 with custom design system
- **Routing**: React Router DOM 7.13.0
- **Icons**: Lucide React 0.563.0
- **Testing**: Vitest 4.0.18 with jsdom environment
- **Property-Based Testing**: fast-check 4.5.3
- **Linting**: ESLint 9.39.1 with TypeScript support

## Development Environment
- **Node.js**: ES modules (`"type": "module"`)
- **TypeScript**: Version ~5.9.3 with strict configuration
- **PostCSS**: 8.5.6 with Autoprefixer for CSS processing

## Build System & Commands

### Development
```bash
npm run dev          # Start development server on port 3000
npm run preview      # Preview production build locally
```

### Testing
```bash
npm test            # Run tests in watch mode
npm run test:run    # Run tests once and exit
npm run test:ui     # Run tests with UI interface
```

### Build & Deploy
```bash
npm run build       # TypeScript compilation + Vite build
npm run lint        # Run ESLint checks
```

## PWA Configuration
- Service worker located at `public/sw.js`
- Manifest file at `public/manifest.json`
- Icons and screenshots in `public/icons/` and `public/screenshots/`
- Vite configured for PWA asset handling and HTTPS development

## Code Quality
- ESLint with React hooks and TypeScript rules
- Strict TypeScript configuration across multiple tsconfig files
- Property-based testing with fast-check for correctness validation
- Test setup file at `src/services/__tests__/setup.ts`

## Architecture Notes
- Component-based architecture with clear separation of concerns
- Custom hooks for state management (`src/hooks/`)
- Service layer for business logic (`src/services/`)
- Type-safe data models in `src/types/index.ts`
- Responsive mobile-first design with Tailwind utilities