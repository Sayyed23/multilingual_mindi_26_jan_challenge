# The Multilingual Mandi

## Full Product, UX & Technical Implementation Document

---

## 1. Project Overview

### Vision

The Multilingual Mandi is an AI-powered Progressive Web App (PWA) designed to digitize India’s traditional mandi ecosystem by removing language barriers, improving price transparency, and enabling fair negotiations between vendors and buyers.

### Core Technology Stack

* Frontend: React (PWA enabled)
* AI Layer: Gemini API (via Cloud Functions)
* Backend: Firebase

  * Firebase Authentication (Email + Password)
  * Firestore (real-time database + offline)
  * Cloud Functions (business logic + Gemini)
  * Firebase Cloud Messaging (alerts)
* Hosting: Firebase Hosting

---

## 2. System Architecture (High Level)

User (Browser / Installed PWA)
→ React Frontend (PWA)
→ Firebase SDK
→ Cloud Functions (Gemini + business logic)
→ Firestore (online + offline sync)

---

## 3. Authentication & Identity Management

* Login & Sign-up using Email and Password
* Unified flow for login and registration
* Password reset via email
* On first signup, user profile document is created in Firestore

Firestore structure:

```
users/{userId}
  - email
  - role
  - language
  - location
  - onboardingCompleted
  - verificationStatus
```

---

## 4. Gemini API Integration Plan

### 4.1 Translation Service

* Used for multilingual chat, reviews, alerts, and UI explanations
* Implemented via Firebase Cloud Functions
* Domain-specific prompting for mandi terminology

Flow:
Frontend → Cloud Function → Gemini API → Response

### 4.2 Negotiation Assistant

* Gemini provides suggested counter-offers and explanations
* Inputs include commodity, market price, user role, region
* Output is advisory only

### 4.3 Price Insight & Summaries

* Gemini converts raw price data into natural-language insights
* No pricing decisions are made by Gemini

---

## 5. Offline-First Strategy

* Firestore offline persistence enabled
* IndexedDB used automatically by Firebase
* Cached data:

  * Prices
  * Deals
  * Messages
* Queued actions sync automatically when online

UX rules:

* Always show last updated timestamp
* Never block actions when offline

---

## 6. PWA Configuration

* Web App Manifest
* Installable app icon
* Service Worker
* Background sync
* Push notifications

---

## 7. Page Structures (UX Architecture)

### 7.1 Entry & Access Layer

Top to bottom:

* Status & utility strip
* Hero / value introduction
* Language selection
* Core action buttons
* Trust indicators
* Role clarification
* Login / signup entry
* Consent preview
* Help & assisted access
* Legal footer

---

### 7.2 Authentication (Email + Password)

Top to bottom:

* Context strip
* Page title & purpose
* Login / Sign-up toggle
* Email input
* Password input
* Confirm password (signup)
* Primary action button
* Forgot password link
* Role selection (first-time)
* Consent summary
* Help access
* Trust reassurance
* Legal links

---

### 7.3 Onboarding & Setup

Top to bottom:

* Context strip with progress
* Welcome block
* Role confirmation
* Language preferences
* Location & mandi setup
* Role-specific data collection
* Optional verification
* Feature introduction
* Notification preferences
* Permissions confirmation
* Review & confirm
* Completion & next step

---

### 7.4 Core App Shell (Persistent Navigation)

Top to bottom:

* System status bar
* App header / context bar
* Main content container
* Floating global action
* Bottom navigation
* Offline sync indicator
* Toast / system feedback area

---

### 7.5 Home Page (Role-aware)

Top to bottom:

* Context header
* Primary insight block
* Quick actions
* Active deals
* Price trends
* Alerts summary
* Suggested opportunities
* Trust snapshot
* Tips & learning
* Recent activity

---

### 7.6 Price Discovery Page

Top to bottom:

* Context header
* Commodity search & filters
* Price summary
* Mandi comparison
* Price trends
* AI price insight
* Action block
* Related vendors
* Historical prices
* Alerts & anomalies
* Help & explanation

---

### 7.7 Negotiation & Deals Page

Top to bottom:

* Context header
* Deal tabs
* Deal list
* Deal detail header
* Negotiation chat
* AI assistant panel
* Negotiation actions
* Deal analysis
* Deal conversion
* Payment & escrow status
* Dispute access
* Deal timeline

---

### 7.8 Deal Confirmation & Payments Page

Top to bottom:

* Context header
* Deal summary
* Price validation
* Delivery details
* Payment method selection
* Escrow explanation
* Confirmation block
* Payment status
* Post-payment summary
* Delivery tracking
* Rating prompt
* Help & dispute access

---

### 7.9 Alerts & Notifications Page

Top to bottom:

* Context header
* Alert category tabs
* Alert list
* Alert preview
* Quick actions
* Priority indicators
* Alert history
* Notification settings shortcut
* Empty state
* Help & explanation

---

### 7.10 Profiles & Trust Layer

Top to bottom:

* Profile header
* Basic information
* Trust summary
* Verification details
* Transaction snapshot
* Reviews & feedback
* Quality indicators
* Privacy controls
* Interaction actions
* Dispute & reporting
* Trust methodology
* Legal footer

---

### 7.11 Community & Support (Phase 2)

Top to bottom:

* Context header
* Community feed
* Local market updates
* Expert Q&A
* Ask question / post
* Cooperative tools
* Help center
* Contact support
* Feedback & suggestions
* Moderation & safety
* Language & accessibility tools
* Legal footer

---

### 7.12 Admin & System Pages (Internal)

Top to bottom:

* Admin context header
* Admin navigation
* Dashboard overview
* User management
* Verification management
* Price data control
* Deals & payments monitoring
* Dispute resolution
* Community moderation
* Reports & analytics
* System configuration
* Audit & logs
* Admin help
* Compliance footer

---

## 8. Firestore Core Data Model

Key collections:

```
users
mandis
prices
deals
messages
reviews
notifications
```

---

## 9. Security & Access Control

* Firebase Auth guards all access
* Role-based Firestore security rules
* Gemini API key secured in Cloud Functions
* Rate limiting and quotas

---

## 10. Development Roadmap

Phase 1 (Weeks 1–4):

* Auth, onboarding, price discovery, translation, PWA offline

Phase 2 (Weeks 5–8):

* Negotiation, deals, alerts, profiles

Phase 3 (Weeks 9–12):

* Admin panel, community, optimization

---

## 11. Outcome

This document serves as a complete blueprint covering:

* Product vision
* UX structure
* Technical architecture
* AI integration
* Offline-first implementation

It is suitable for:

* Hackathon submission
* Startup MVP build
* Grant or incubator review
* Engineering handoff

---

End of Document
