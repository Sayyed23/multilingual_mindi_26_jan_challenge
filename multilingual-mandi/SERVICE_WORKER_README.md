# Service Worker Implementation

This document describes the service worker implementation for the Multilingual Mandi PWA.

## Overview

The service worker provides offline-first functionality with strategic caching to ensure the app works reliably even with poor network connectivity, which is common in rural areas where many mandi users operate.

## Architecture

### Caching Strategies

1. **Cache-First Strategy** (Static Assets)
   - App shell (HTML, CSS, JS)
   - Icons and images
   - Manifest file
   - Used for: Resources that rarely change

2. **Network-First Strategy** (Real-time Data)
   - Price data (`/api/prices/*`)
   - Live negotiations (`/api/negotiations/*`)
   - Messages (`/api/messages/*`)
   - Market data (`/api/market-data/*`)
   - Used for: Time-sensitive information

3. **Stale-While-Revalidate** (User Data)
   - User profiles (`/api/users/*`)
   - Transaction history (`/api/transactions/*`)
   - Historical data (`/api/history/*`)
   - Used for: Data that can be slightly stale but should update in background

### Background Sync

The service worker implements background sync for:
- **Messages**: Queued when offline, sent when connection restored
- **Transactions**: Deal confirmations and updates
- **User Actions**: Profile updates, preferences changes

## Files

### Core Service Worker
- `public/sw.js` - Main service worker implementation
- `src/services/serviceWorker.ts` - Service worker manager and utilities
- `src/hooks/useOfflineMessages.ts` - React hook for offline messaging
- `src/components/OfflineIndicator.tsx` - UI component showing connection status

### Demo and Testing
- `src/components/ServiceWorkerDemo.tsx` - Interactive demo component
- Route: `/service-worker-demo` - Test offline functionality

## Features Implemented

### ✅ Completed
1. **Service Worker Registration**
   - Automatic registration on app load
   - Update detection and handling
   - Skip waiting for immediate activation

2. **Strategic Caching**
   - Cache-first for static assets
   - Network-first for real-time data
   - Stale-while-revalidate for user data

3. **Offline Functionality**
   - Offline message queuing
   - Background sync when online
   - Graceful degradation

4. **User Interface**
   - Connection status indicator
   - Cache management tools
   - Update notifications

5. **Error Handling**
   - Network failure fallbacks
   - Cache corruption recovery
   - Sync conflict resolution

### 🚧 Partially Implemented
1. **IndexedDB Integration**
   - Currently using localStorage as fallback
   - Full IndexedDB implementation needed for production

2. **Push Notifications**
   - Basic structure in place
   - Needs backend integration

### ❌ Not Implemented
1. **SMS Fallback**
   - Planned for critical communications
   - Requires backend SMS service

2. **Advanced Sync Strategies**
   - Conflict resolution for concurrent edits
   - Optimistic updates

## Usage

### Basic Service Worker Features

The service worker is automatically registered when the app loads. Users will see:

1. **Connection Status**: Green (online) or orange (offline) indicator in the header
2. **Update Notifications**: Blue dot appears when app update is available
3. **Offline Messaging**: Messages are queued when offline and sent when online

### Testing Offline Functionality

1. Visit `/service-worker-demo` in the app
2. Send a test message while online
3. Disable network connection (browser dev tools or system)
4. Send another message - it will be queued
5. Re-enable network - queued messages will be sent automatically

### Cache Management

Users can:
- View cache size and entry count
- Clear all cached data
- See offline indicator with details

## Development

### Service Worker Updates

When updating the service worker:
1. Increment version numbers in cache names
2. Test with browser dev tools offline mode
3. Verify update notifications work correctly

### Adding New Caching Patterns

To add new API endpoints to caching:

1. **Network-First**: Add pattern to `NETWORK_FIRST_PATTERNS`
2. **Stale-While-Revalidate**: Add to `STALE_WHILE_REVALIDATE_PATTERNS`
3. **Cache-First**: Handled by default for static assets

### Background Sync

To add new sync operations:
1. Add event listener in service worker
2. Implement sync function
3. Queue data in IndexedDB/localStorage
4. Register sync tag when offline

## Browser Support

- **Chrome/Edge**: Full support including background sync
- **Firefox**: Basic service worker support (no background sync)
- **Safari**: Basic service worker support (limited background sync)
- **Mobile Browsers**: Good support on modern versions

## Performance Considerations

1. **Cache Size**: Monitor cache growth, implement cleanup strategies
2. **Sync Frequency**: Avoid excessive background sync requests
3. **Network Detection**: Use connection quality hints when available
4. **Battery Usage**: Minimize background processing on mobile

## Security

1. **HTTPS Required**: Service workers only work over HTTPS (or localhost)
2. **Same-Origin**: Service worker scope limited to same origin
3. **Content Security Policy**: Ensure CSP allows service worker registration

## Debugging

### Browser Dev Tools
1. **Application Tab**: View service worker status, cache contents
2. **Network Tab**: Monitor cache hits/misses
3. **Console**: Service worker logs prefixed with `[SW]`

### Common Issues
1. **Registration Fails**: Check HTTPS requirement, file path
2. **Cache Not Working**: Verify cache names, check network patterns
3. **Updates Not Showing**: Clear browser cache, check skip waiting logic

## Future Enhancements

1. **Intelligent Caching**: ML-based cache prediction
2. **Selective Sync**: Priority-based background sync
3. **Offline Analytics**: Track offline usage patterns
4. **Progressive Enhancement**: Adaptive features based on connection quality