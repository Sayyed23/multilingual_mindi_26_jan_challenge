# AgriMandi PWA

AI-powered marketplace for Indian agricultural commodities that breaks language barriers and ensures price transparency.

## Features

- 🌐 **Multilingual Support**: 22+ Indian languages with real-time translation
- 💰 **Price Intelligence**: AI-powered price discovery and market analysis
- 🤝 **Smart Negotiation**: Cultural context-aware negotiation assistance
- 📱 **Offline-First PWA**: Works on 2G/3G networks with offline capabilities
- 🔐 **Trust & Verification**: Reputation system and business verification
- 📊 **Market Analytics**: Real-time insights and trend analysis

## Tech Stack

- **Frontend**: React 18+ with TypeScript
- **Build Tool**: Vite with PWA plugin
- **Styling**: CSS Modules (to be added)
- **State Management**: Context API + useReducer (to be added)
- **Offline Storage**: IndexedDB
- **Testing**: Jest + React Testing Library + fast-check

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Development Scripts

```bash
# Type checking
npm run type-check

# Linting
npm run lint
npm run lint:fix

# Code formatting
npm run format
npm run format:check
```

## Project Structure

```
src/
├── components/     # Reusable UI components
├── pages/         # Page components
├── services/      # API and business logic
├── types/         # TypeScript type definitions
├── hooks/         # Custom React hooks
├── utils/         # Utility functions
├── store/         # State management
└── assets/        # Static assets
```

## Requirements

This project implements the requirements defined in `.kiro/specs/multilingual-mandi/requirements.md`:

1. **Multilingual Communication** - Real-time translation between 22+ Indian languages
2. **Real-Time Price Discovery** - Market intelligence from 100+ mandis
3. **AI-Powered Negotiation** - Smart negotiation assistance
4. **User Authentication** - OTP-based auth with reputation system
5. **Offline-First Architecture** - Works on poor connectivity
6. **Price Verification Scanner** - Fair price comparison
7. **Search and Discovery** - Multi-language commodity search
8. **Deal Management** - Complete transaction lifecycle
9. **Mobile-First UI** - Responsive design for all devices
10. **Analytics and Insights** - Market intelligence and trends

## License

Private - All rights reserved
