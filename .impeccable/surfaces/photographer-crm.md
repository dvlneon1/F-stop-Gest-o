# Surface Brief: Photographer CRM (Mobile-First)

## Scope & Mode

**Target:** `index.html` (single-file HTML artifact)
**Mode:** Operate — the photographer completes tasks: checks today's shoot, reviews client, sends contract, marks paid, uploads gallery.
**Viewport:** Mobile-first (390×844 primary), desktop responsive (1440 wide)

## Audience & Job

Solo photographer, on location (thumb on phone), at home (desktop), in client meeting (tablet).
Job: Run business operations — calendar, clients, contracts, questionnaires, invoices, galleries, expenses — without friction.

## Chosen Direction

**Gallery Contact Sheet** (assigned, seed:380e121357e7e6a5)

## Direction Contract

### THESIS
The photographer's work *is* the interface. Full-bleed images in a masonry grid; metadata appears only on tap. CRM data (clients, invoices, contracts, galleries) lives behind each image, revealed like wall labels. The category default (sidebar + dashboard cards) is refused.

### OWN-WORLD
**Palette:** Pure white (#ffffff) / deep charcoal (#0f0f0f) ground. No UI color — only the photographs. Metadata text: 60% gray (#999 / #666). Accent: thin red rule (urgent), thin green rule (paid). 1px hairlines throughout.
**Type:** Editorial serif for display (Newsreader) — image titles, client names. Clean mono (JetBrains Mono) for dates, amounts, IDs. UI in neutral sans (DM Sans). Generous leading, wide measures.
**Materials:** Masonry grid (2-col mobile, 4-col desktop), aspect ratios preserved. Wall-label slide panel (right 40% on mobile). Hairline rules only. No shadows, no cards, no chrome.

### STORY
Photographer opens app → sees today's shoot cover image highlighted (amber top border). Taps → full-screen slide-up: left 60% image, right 40% metadata (client, timeline, contract status, invoice, gallery link). Swipes down to dismiss. Bottom tab bar: Today / Archive / Calendar / Insights. Pull-to-refresh shuffles images subtly.

### FIRST VIEWPORT (390×844)
- Status bar (system)
- Masonry grid: 2 columns, 2–3 shoot cover images visible, 3rd peeking
- Today's shoot: 2px amber top border on image
- Bottom tab bar (56px): Today (active) / Archive / Calendar / Insights
- Pull-to-refresh: subtle image shuffle animation

### FORM
Gallery Contact Sheet (assigned), seed:380e121357e7e6a5

### FINISH
unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Unresolved Decisions

- Placeholder images: use synthetic photography placeholders (marked clearly)
- Backend: localStorage only for this artifact (offline-first demo)
- Portuguese (PT-BR) primary, English secondary — copy in both