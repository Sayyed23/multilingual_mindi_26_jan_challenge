# Multilingual Mandi

A progressive web application (PWA) designed to modernize India's traditional mandi (wholesale market) ecosystem by breaking language barriers and improving price transparency between vendors and buyers.

## Features

- 🌐 Multilingual communication across 22+ Indian languages
- 💰 Real-time market price discovery and transparency
- 🤖 AI-powered negotiation assistance
- 📱 Offline-first PWA functionality
- 🔐 Role-based authentication (Vendors, Buyers, Commission Agents)
- 💬 Voice and text communication
- 📊 Transaction management and reputation system

## Tech Stack

- **Frontend**: React 19.2.0 with TypeScript
- **Build Tool**: Vite 7.2.4 with HMR
- **Styling**: Tailwind CSS 3.4.17
- **Backend**: Supabase 2.93.3
- **Icons**: Lucide React 0.563.0
- **Testing**: Vitest 4.0.18 with fast-check

## Getting Started

### Prerequisites

- Node.js (version 18 or higher)
- npm or yarn

### Environment Setup

1. Copy the environment template:
   ```bash
   cp .env.example .env
   ```

2. Fill in your credentials in `.env`:
   ```bash
   # Firebase Configuration (get from Firebase Console)
   VITE_FIREBASE_API_KEY=your_actual_firebase_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project_id.firebasestorage.app
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   VITE_FIREBASE_APP_ID=your_firebase_app_id
   VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id

   # PWA Push Notifications (generate VAPID keys)
   VITE_VAPID_PUBLIC_KEY=your_actual_vapid_public_key

   # Gemini AI API (get from Google AI Studio)
   VITE_GEMINI_API_KEY=your_actual_gemini_api_key
   ```

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:5173](http://localhost:5173) in your browser

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm test` - Run tests in watch mode
- `npm run test:run` - Run tests once
- `npm run lint` - Run ESLint

## Security Notes

⚠️ **Important**: Never commit your `.env` file to version control. It contains sensitive credentials.

- The `.env.example` file shows the required environment variables
- Rotate all API keys if they've been exposed
- Use secure environment variables in production deployments

## Project Structure

```
src/
├── components/         # Reusable UI components
├── pages/             # Route-level components
├── hooks/             # Custom React hooks
├── services/          # Business logic and API calls
├── types/             # TypeScript type definitions
├── utils/             # Utility functions
└── lib/               # Third-party library configurations
```
