# AgncyPay Web - Project Overview & Structure

## Project Description
**AgncyPay** is a fintech application designed specifically for the creative industry, acting as an invoice, settlement, and payout platform connecting **Brands**, **Agencies**, and **Talents** (models, creators, etc.). 

The platform facilitates:
- **Invoice Creation & Tracking**: Brands can receive and approve invoices, while agencies/talent can issue them.
- **Automated Payout Splits**: Routing payments between agencies and their talent (e.g., 85% to talent, 15% to agency).
- **Early Payouts & Liquidity**: Providing talents/agencies with "Net-0" liquidity and early withdrawals before the brand settles the invoice (e.g., Crystallised vs. Liquidity balances).
- **CRM Integration**: Fetching and auto-syncing data with tools like QuickBooks, HubSpot, Mainboard, and MediaSlide.
- **Wallet & Card Programs**: Virtual/physical card management and bank connection (via Plaid).

The frontend is built with **Next.js 14+ (App Router)**, **React 19**, **Tailwind CSS v4**, and **Framer Motion** for animations. The backend relies on **Firebase** (Firestore, Authentication) for real-time database capabilities and user management.

---

## Directory Structure

### Root directory (`/`)
- `src/` - The core application source code.
- `public/` - Static assets including images, icons (e.g., CRM icons, bank logos), and fonts.
- `package.json` - Defines project dependencies (Next.js, Firebase, Framer Motion, Tailwind, Lucide React).
- `tailwind.config.ts` / `postcss.config.mjs` - Tailwind configuration.
- `next.config.ts` - Next.js configuration.
- `eslint.config.mjs` - Linting rules.

### `src/` Directory Breakdown

#### `src/app/`
The Next.js App Router defining the application's page structure and routing.
- **`auth/`**: Authentication pages (login, signup for brands/agencies/talent).
- **`dashboard/`**: The main shared dashboard routing for users. 
- **`branddashboard/`**: The specialized dashboard for Brands (Invoice approval, settlement, analytics).
- **`agencydashboard/`**: The specialized dashboard for Agencies (Invoice creation, payouts, creative node network, CRM connections).
- **`pay/`, `payout/`, `receipt/`, `request/`**: Flow pages for handling specific financial transaction states.
- **`onboarding/` & `verification/`**: KYC and user onboarding flows.
- **`globals.css`**: Global stylesheet including Tailwind base directives and custom color variables (strict black/white/grayscale modern theme).
- **`layout.tsx` & `page.tsx`**: The root layout wrapping the app with the `AppContext` provider, and the landing page.

#### `src/components/`
Reusable UI components categorized by feature.
- **`dashboard/`**: Core dashboard widgets like `ModelAgencyDashboard.tsx`, `ModelTalentDashboard.tsx`, `RoleFeaturePage.tsx` and specific widget panels.
- **`payment/` & `verification/`**: Specialized components for checkout flows and identity verification.
- **`ui/`**: General reusable base components (buttons, modals, inputs).
- **`layout/`**: Structural components like sidebars and headers.

#### `src/lib/`
Utility functions and external service integrations.
- **`firebase.ts`**: Firebase app initialization.
- **`firebaseAuth.ts`**: Authentication functions and user profile management (`FirestoreUser` interface), including CRM connection state.
- **`firebaseInvoices.ts`**: Firestore queries for fetching, creating, and listening to invoices in real-time.
- **`pdfExport.ts`**: Utilities for generating PDF receipts/invoices.
- **`formatCurrency.ts` / `formatDate.ts` / `utils.ts`**: Formatting helpers (e.g., `cn` for Tailwind class merging).
- **`mainboard.ts`**: specific integration hooks for third-party platforms.

#### `src/context/`
- **`AppContext.tsx`**: Global React Context managing user session state (`state.user`), authentication status, and active workspace information.

#### `src/types/`
- TypeScript interfaces defining the core data models (e.g., Workspace, Invoice, AccountType).

#### `src/constants/`
- Static application data, configuration flags, or default styling values.

---

## Technical Stack & Themes
- **Framework**: Next.js (App Router)
- **Styling**: Tailwind CSS with a strict dark theme (`#050505` backgrounds, `#8f8f8f` text). Accent colors (green/blue) are used extremely sparingly for status indicators only.
- **Database/Auth**: Firebase (Firestore, Auth).
- **Icons**: `lucide-react`.
- **Animations**: `framer-motion` for page transitions and modal dropdowns.
