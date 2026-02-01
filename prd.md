# Product Requirements Document (PRD)

## Product Name

**The Multilingual Mandi**

## Document Version

v1.0

## Owner

Product Team – The Multilingual Mandi

## Status

Draft (Build-ready)

---

## 1. Executive Summary

The Multilingual Mandi is an AI-powered Progressive Web App (PWA) that enables transparent, language-agnostic trade in India’s traditional mandi ecosystem. The product removes language barriers, improves price discovery, and supports fair negotiations between vendors, buyers, and agents using AI-driven translation and market intelligence.

The platform is built using **Gemini API** for multilingual intelligence and **Firebase** for authentication, real-time data, offline-first support, and notifications. The solution is optimized for tier 2–3 cities and rural markets with low bandwidth and varying digital literacy levels.

---

## 2. Problem Statement

India’s mandi system faces four core challenges:

1. **Language fragmentation**

   * Buyers and sellers often speak different regional languages
   * Miscommunication leads to lost deals and unfair pricing

2. **Price opacity**

   * Vendors lack real-time visibility into nearby mandi prices
   * Buyers cannot validate whether quoted prices are fair

3. **Inefficient negotiations**

   * Bargaining is unstructured and time-consuming
   * No data-backed guidance or negotiation memory

4. **Limited digital access**

   * Poor connectivity in rural areas
   * Low literacy and smartphone familiarity

---

## 3. Goals & Objectives

### Primary Goals

* Enable cross-language trade without friction
* Provide transparent, real-time mandi price discovery
* Improve negotiation outcomes without removing human agency
* Work reliably in low-connectivity environments

### Success Indicators

* Increased deal completion rate
* Higher vendor price realization
* Reduced dependence on intermediaries
* High repeat usage by vendors

---

## 4. Target Users

### Primary Users

* Small-scale vendors and farmers
* Wholesalers and retailers in tier 2–3 cities

### Secondary Users

* Urban bulk buyers and restaurants
* Market agents and commission traders

### Geographic Focus

* Phase 1: Maharashtra
* Phase 2: Hindi belt
* Phase 3: South India

---

## 5. User Personas

### Vendor

* Speaks regional language
* Needs fair price visibility
* Prefers voice interaction

### Buyer

* Needs market-wide price comparison
* Wants remote negotiation
* Comfortable with apps

### Agent

* Manages multiple deals
* Needs fast communication across languages

---

## 6. Key Product Features (MVP)

### 6.1 Multilingual Communication

* Text and voice translation across Indian languages
* Mandi-specific terminology support
* Translation confidence indicator

### 6.2 Price Discovery

* Live prices from nearby mandis
* Min / avg / max price bands
* Historical price trends
* AI-generated price insights

### 6.3 Negotiation Support

* Real-time multilingual chat
* AI-assisted counter-offer suggestions
* Market comparison during negotiation

### 6.4 Deals & Payments

* Deal confirmation flow
* Payment initiation
* Escrow-style protection (Phase 2)

### 6.5 Profiles & Trust

* User profiles
* Ratings and reviews
* Verification badges

### 6.6 Offline-first Experience

* Cached prices and chats
* Queued actions when offline
* Clear sync indicators

---

## 7. Page & UX Structure

The product includes the following core pages:

1. Entry & Access Layer
2. Authentication (Email + Password)
3. Onboarding & Setup
4. Core App Shell (Persistent Navigation)
5. Home (Role-aware)
6. Price Discovery
7. Negotiation & Deals
8. Deal Confirmation & Payments
9. Alerts & Notifications
10. Profiles & Trust Layer
11. Community & Support (Phase 2)
12. Admin & System Pages (Internal)

Each page follows a top-to-bottom, low-cognitive-load structure with voice assistance and progressive disclosure.

---

## 8. Functional Requirements

### Authentication

* Email + password login
* Password reset
* Role assignment

### Translation

* Gemini-powered translation via Cloud Functions
* Secure API key handling
* Rate limiting

### Data Management

* Firestore real-time sync
* Offline persistence enabled
* Role-based access rules

### Notifications

* Price alerts
* Deal updates
* System notifications

---

## 9. Non-Functional Requirements

### Performance

* Usable on 2G/3G networks
* Translation response < 2 seconds

### Reliability

* Offline mode for core flows
* Automatic sync on reconnect

### Security

* Firebase Authentication
* Encrypted data in transit
* Secure AI access via backend

### Scalability

* Support multi-state expansion
* Modular micro-feature design

---

## 10. Technology Stack

### Frontend

* React (PWA)

### Backend

* Firebase Authentication
* Firestore
* Cloud Functions
* Firebase Cloud Messaging

### AI Layer

* Gemini API (translation, negotiation hints, summaries)

---

## 11. Data Model (High Level)

Core collections:

* users
* mandis
* prices
* deals
* messages
* reviews
* notifications

---

## 12. Admin & Moderation

* User verification
* Price data moderation
* Dispute resolution
* Content moderation

---

## 13. Risks & Mitigation

| Risk                    | Mitigation                              |
| ----------------------- | --------------------------------------- |
| Translation errors      | Confidence display, user confirmation   |
| Low adoption            | Voice-first onboarding, offline support |
| Price data inaccuracies | Multiple sources, anomaly detection     |
| Cost overruns           | Rate limits, caching, quotas            |

---

## 14. Roadmap

### Phase 1 (Weeks 1–4)

* Auth, onboarding
* Price discovery
* Translation
* PWA offline support

### Phase 2 (Weeks 5–8)

* Negotiation system
* Alerts & profiles
* Payments

### Phase 3 (Weeks 9–12)

* Admin panel
* Community features
* Optimization & scale

---

## 15. Metrics & KPIs

* Monthly active users
* Deals completed
* Price checks per user
* Negotiation usage rate
* User retention

---

## 16. Out of Scope (v1)

* Blockchain provenance
* Credit scoring
* AR price scanning

---

## 17. Conclusion

The Multilingual Mandi is designed as a practical, inclusive, and scalable platform that respects the realities of India’s local trade while introducing transparency and AI-powered intelligence. This PRD serves as a build-ready blueprint for development, evaluation, and iteration.

---

**End of PRD**
