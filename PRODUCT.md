# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Next.js 15 (App Router) + React 19 + TypeScript + Tailwind CSS v4 + shadcn/ui (Radix UI primitives) — mobile-first PWA, offline-first with IndexedDB, deploy to Vercel

## Users

**Primary:** Solo photographers (portrait, wedding, event, commercial, family) who run their entire business alone. They shoot, edit, sell, admin, and market — often on the go between sessions.

**Situation:** On-location (thumb on phone between poses), at home editing (desktop), in client meetings (tablet), traveling (phone only). No assistant, no studio manager, no dedicated admin time.

**Job:** Run the business operations — calendar/bookings, client records, contracts, questionnaires, invoices/payments, expenses, tax-ready reports, automated reminders — without the friction of generic CRMs built for teams.

## Product Purpose

A mobile-native, minimal CRM that lets solo photographers operate their business from their phone. It replaces the patchwork of calendar apps, Google Drive folders, PDF contracts, spreadsheet invoices, and email threads with one coherent tool where the photographer's mental model (shoot → deliver → paid → repeat) drives every screen.

Success = photographer opens the app on their phone at a shoot, sees today's schedule, pulls up the client's questionnaire, sends the contract, marks the invoice paid, and never thinks "where was that file?"

## Positioning

The only CRM designed for **thumb-first, on-location use** — not a desktop web app that happens to be responsive. Every flow starts from the mobile screen: large tap targets, bottom navigation, swipe gestures, offline-first sync, camera integration for receipts/contracts. Generic CRMs (HoneyBook, Dubsado, Pixifi, Studio Ninja) are feature-complete for studios; this is feature-complete for *one person with a camera*.

## Operating Context

**Workflows:**
- Inquiry → booked (calendar hold → contract → questionnaire → deposit)
- Shoot day → timeline/checklist → shot list → client info at fingertips
- Post-shoot → culling → gallery upload → proofing link → selections → final delivery
- Invoicing → deposit → balance → payment tracking → expense logging → tax export
- Client portal (gallery, contract, questionnaire, invoices) — branded, no login friction

**Environments:** iOS Safari, Android Chrome, mobile data / spotty Wi-Fi at venues, desktop for editing/admin batches

**Tools & Materials:** Camera roll (receipts, signed contracts), iCloud/Google Photos (gallery assets), Stripe/Square (payments), Calendly-style booking links, email/SMS/WhatsApp for client comms

**Rituals:** Morning "today view" check, between-set client lookup, end-of-shoot wrap, Sunday admin hour, quarterly tax prep

## Capabilities and Constraints

**Confirmed functionality:**
- Client CRM (contacts, shoot history, preferences, notes, tags)
- Calendar / booking (availability, conflicts, travel time buffers)
- Contracts (templates, e-sign, PDF export, signed storage)
- Questionnaires (conditional logic, pre-fill from CRM, client portal)
- Galleries / proofing (upload, organize, share link, client selects, download)
- Invoices (line items, deposit/balance, Stripe/Square, reminders, PDF)
- Expenses (categories, receipt photo, mileage, tax tags)
- Automation (triggers: booking → contract → questionnaire → reminders → delivery)
- Dashboard (pipeline, revenue, upcoming, overdue, conversion)
- Client portal (single link: gallery + contract + questionnaire + invoices)
- Offline-first (IndexedDB + background sync)
- Export (CSV for taxes, PDF reports)

**Constraints:**
- Single user (no team roles, permissions, multi-user)
- No built-in email/SMS sending — integrates via webhook/API
- No accounting — exports for accountant
- No website builder — gallery links only
- Portuguese (PT-BR) primary, English secondary

**Undecided:**
- Native app wrapper (Capacitor/Tauri) vs PWA only
- Backend (Supabase, PocketBase, custom) vs local-first only

## Brand Commitments

**Name:** Lente (confirmed)

**Voice:** Direct, respectful of craft, zero fluff. Photographer-to-photographer. "Your shoot is tomorrow. Here's what you need."

**Assets:** None yet. No logo, no brand colors imposed.

**Identity constraints:** Minimal, not sterile. Warmth without ornament. Trust the photographer's images to carry the visual weight — the UI recedes.

## Evidence on Hand

- No real content, data, testimonials, case studies, press, or assets exist.
- Future work must not fabricate photographers, shoots, revenue numbers, or client stories.
- Placeholder content must be clearly marked and replaceable.

## Product Principles

1. **Thumb-first, always.** Every primary action reachable one-handed. Bottom nav, swipe actions, large targets. Desktop is a stretched mobile layout, not the source of truth.
2. **The shoot is the center.** Calendar, client, gallery, contract, invoice — all orbit the shoot event. No orphaned modules.
3. **Zero admin theater.** No "set up your pipeline stages" onboarding. Sensible defaults, invisible configuration. Photographer opens app → works.
4. **Images lead, UI follows.** Galleries, proofing, delivery — the photographer's work is the hero. Chrome is minimal, neutral, dark-mode native.
5. **Offline is a feature, not a fallback.** Shoot days have bad signal. App works fully offline; sync is background, conflict-free.

## Accessibility & Inclusion

- WCAG 2.1 AA minimum (contrast, focus order, touch target ≥ 48×48dp, text resize to 200%)
- Dark mode native (not inverted light mode)
- Reduced motion respected
- Portuguese (PT-BR) + English; RTL-ready structure for future
- VoiceOver / TalkBack labels on all interactive elements
- High-contrast mode toggle for bright outdoor shoots