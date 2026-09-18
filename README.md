# WealthFlow — Personal Finance Mobile Application

> **Personal Finance Mobile Application** engineered to provide daily clarity over cash flow, budget allocations, and savings velocity with resilient data persistence and database-level security.
>
> Designed & Built by **[Youssef Manssouri](https://www.youssefmanssouri.site)**.

[![Live Landing Page](https://img.shields.io/badge/Landing%20Page-Vercel-3A171C?style=flat-square&logo=vercel)](https://wealthflow-landing.vercel.app)
[![Case Study](https://img.shields.io/badge/Portfolio-Case%20Study-A65F4B?style=flat-square)](https://www.youssefmanssouri.site/projects/wealthflow)
[![React Native](https://img.shields.io/badge/React%20Native-0.76-61DAFB?style=flat-square&logo=react)](https://reactnative.dev/)
[![Expo SDK 52](https://img.shields.io/badge/Expo-SDK%2052-black?style=flat-square&logo=expo)](https://expo.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL%20RLS-3ECF8E?style=flat-square&logo=supabase)](https://supabase.com/)
[![Tests](https://img.shields.io/badge/Tests-114%20Passed-success?style=flat-square&logo=jest)](https://jestjs.io/)

---

## 🔗 Live Access & Distribution

- **Official Product Landing Page**: [https://wealthflow-landing.vercel.app](https://wealthflow-landing.vercel.app)
- **Engineering Case Study**: [https://www.youssefmanssouri.site/projects/wealthflow](https://www.youssefmanssouri.site/projects/wealthflow)
- **Android Preview Build (APK)**: [Download Android APK (~65 MB)](https://expo.dev/artifacts/eas/_Rp-XG6-OjsS3Jp9xEGlo4Xy6W-lRFZx9-bykm-5faQ.apk) *(Generated via Expo Application Services / EAS Build)*

---

## 💡 Overview

Managing personal finances often becomes tedious when apps rely on overly complex multi-tier menus, lack instant transaction categorization, or fail to persist user sessions reliably across mobile app restarts.

**WealthFlow** is a personal finance mobile application built with React Native and Expo SDK 52, backed by Supabase and PostgreSQL. It delivers rapid transaction logging, category-based monthly budgets with threshold alerts, milestone-oriented savings goals, and cash flow analytics within a clean, type-safe mobile interface.

---

## ✨ Core Implemented Features

1. **Transaction Management & Filtering**:
   - Log income and expense transactions with date, category, amount, and merchant/notes metadata.
   - Real-time search and filter by category (Food, Housing, Utilities, Transportation, Entertainment, Health, Shopping, etc.) and flow type (All, Income, Expense).

2. **Monthly Category Budgets**:
   - Set monthly spending limits per category.
   - Dynamic spending calculations comparing total transactions against limits.
   - Visual status indicators (Normal, Warning at 80% utilization, and Exceeded at 100%+).

3. **Target-Driven Savings Goals**:
   - Create specific savings targets with milestone deadlines and goal amounts.
   - Contribution tracking that updates progress bars and logs historical allocations.

4. **Cash Flow Analytics**:
   - Visual summaries computing total income, total expenses, net savings, and overall savings rate.
   - Category distribution breakdown displaying proportional spending.

5. **Preferences, Multi-Currency & Theming**:
   - Multi-currency selection supporting 7 global currencies: USD (`$`), EUR (`€`), GBP (`£`), MAD (`DH`), JPY (`¥`), CAD (`$`), and AUD (`$`).
   - Appearance customization supporting Light and Dark modes.
   - Clean JSON personal data export for offline backups and financial record keeping.

6. **Persistent Authentication & Data Isolation**:
   - Email/password authentication managed via Supabase Auth.
   - Session tokens cached locally using `@react-native-async-storage/async-storage` for seamless session hydration across app launches.
   - Database-layer data isolation enforced through PostgreSQL Row Level Security (RLS).

---

## 📐 Architecture

```text
               Mobile Client (React Native 0.76 / Expo SDK 52)
                                       │
        ┌──────────────────────────────┴──────────────────────────────┐
        ▼                                                             ▼
UI & Navigation Layer                                         State & Context Layer
- React Navigation v7                                         - AuthContext (Session hydration)
  ├─ Native Stack (Guest / Auth screens)                      - FinancialContext (Transactions, Budgets)
  └─ Bottom Tabs (Home, Budgets, Goals, Analytics)            - ThemeContext (Appearance & Currency)
        │                                                             │
        └──────────────────────────────┬──────────────────────────────┘
                                       ▼
                             Service & Utility Layer
                             - transactionsService, budgetService
                             - savingsService, profileService
                             - exportService (JSON export)
                                       │
                                       ▼
                     Data Persistence & Storage Layer
        ┌──────────────────────────────┴──────────────────────────────┐
        ▼                                                             ▼
Local Device Cache                                           Cloud Backend Layer
- AsyncStorage                                               - Supabase Auth (JWT lifecycle)
  (Theme, currency, active session)                          - PostgreSQL Relational Schema
                                                             - Row Level Security (User-scoped RLS)
```

---

## 🛠️ Technology Stack & Purpose

| Technology | Purpose in Project |
|---|---|
| **React Native 0.76 & Expo SDK 52** | Cross-platform mobile foundation with modern Hermes JavaScript engine |
| **TypeScript 5.3** | End-to-end type safety for data models, API contracts, and navigation routes |
| **React Navigation v7** | Native stack and bottom-tab navigation with isolated authenticated flows |
| **Supabase Client (`@supabase/supabase-js`)** | User authentication, token management, and relational database communication |
| **PostgreSQL & Row Level Security (RLS)** | Relational database enforcing strict user-scoped data access at the engine layer |
| **AsyncStorage** | Local mobile persistence for session tokens, active currency, and theme mode |
| **Jest & jest-expo** | Automated unit testing for business logic, services, utilities, and context |

---

## 🧪 Automated Test Suite

WealthFlow includes a comprehensive suite of unit tests validating financial computations, currency formatting, date utilities, Supabase query adapters, and authentication state transitions:

- **Total Tests**: 114 passing tests across 11 test suites
- **Coverage**:
  - `chartAccessibility.test.ts`
  - `exportService.test.ts`
  - `financial.test.ts`
  - `date.test.ts`
  - `categories.test.ts`
  - `currency.test.ts`
  - `currencySync.test.ts`
  - `supabase.test.ts`
  - `savingsService.test.ts`
  - `profileService.test.ts`
  - `authContext.test.tsx`

Run the test suite locally:
```bash
npm test
```

---

## 🚀 Local Development Setup

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v18 or newer recommended)
- [npm](https://www.npmjs.com/)
- [Expo Go](https://expo.dev/go) app on physical mobile device, or Android Studio / Xcode simulator

### 2. Clone & Install
```bash
git clone https://github.com/youssefmanssouri/wealthflow.git
cd wealthflow
npm install
```

### 3. Environment Configuration
Copy `.env.example` to create your local environment file:
```bash
cp .env.example .env
```

Configure your Supabase project parameters in `.env`:
```env
EXPO_PUBLIC_SUPABASE_URL=https://your-supabase-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key-here
```
*(Note: Never commit your `.env` file or private credentials to source control. `.env` is ignored by `.gitignore`.)*

### 4. Database Setup
The schema and Row Level Security policies can be applied to your Supabase PostgreSQL instance using the migration scripts in `supabase/schema.sql`.

### 5. Start the Application
```bash
npm start
```
Scan the QR code with the Expo Go app (Android) or the Camera app (iOS), or press `a` to open in an Android Emulator.

---

## 📜 Available Scripts

| Command | Action |
|---|---|
| `npm start` | Start the Expo development server |
| `npm run android` | Launch app targeting Android device/emulator |
| `npm run ios` | Launch app targeting iOS simulator |
| `npm run web` | Start web preview using React Native for Web |
| `npm run typecheck` | Run static TypeScript compiler verification (`tsc --noEmit`) |
| `npm test` | Run Jest unit test suite |
| `npm run landing:dev` | Start the local development server for the landing page |
| `npm run landing:build` | Build production bundle for the landing page |

---

## 👨‍💻 Author

**Youssef Manssouri**
- Portfolio: [https://www.youssefmanssouri.site](https://www.youssefmanssouri.site)
- LinkedIn: [linkedin.com/in/youssef-manssouri-24b4662ba](https://www.linkedin.com/in/youssef-manssouri-24b4662ba/)
- Email: [manssouriyoussef33@gmail.com](mailto:manssouriyoussef33@gmail.com)
