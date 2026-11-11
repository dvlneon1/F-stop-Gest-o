# Platform Selection in Shoot Modal

**Implemented**: 2026-11-11  
**Files Modified**: `src/components/NewShootModal.tsx`, `src/lib/i18n.ts`

## Overview

Added a platform type selector at the top of the New Shoot modal, allowing the user to choose between:
1. **"Plataforma do Fotógrafo"** - for the photographer's own portfolio
2. **"Plataforma do Cliente"** - with options: fotop, banlek, fotto, foco radical

When the user selects a platform type, the platform dropdown dynamically updates to show only the relevant options.

## Changes

### 1. `src/components/NewShootModal.tsx`

- Added `platformType` state field: `"photographer" | "client"` (defaults to `"photographer"`)
- Added platform type selector (radio-like `Select`) above the type field
- The platform `Select` now conditionally renders different options:
  - **photographer**: Shows all `photographerPlatforms` + "Portfolio Web" (portfolio-web)
  - **client**: Shows only: fotop, banlek, fotto, foco radical (filtered from the same constant)

### 2. `src/lib/i18n.ts`

Added new translation keys for both pt and en:
- `form.platformType` - "Tipo de Plataforma" / "Platform Type"
- `form.selectPlatformType` - "Selecione o tipo de plataforma" / "Select platform type"
- `form.platformPhotographer` - "Plataforma do Fotógrafo" / "Photographer Platform"
- `form.platformClient` - "Plataforma do Cliente" / "Client Platform"

## Behavior

```
┌─────────────────────────────────────────────────────────────┐
│ Novo Shoot                                                  │
├─────────────────────────────────────────────────────────────┤
│ Cliente: [select]                                          │
│ Tipo: [wedding | portrait | commercial | family | event]   │
│                                                           │
│ ⭓ TIPO DE PLATAFORMA ⭓                                     │
│   [ photographer ] [ client ]                              │
│                                                           │
│ Plataforma: [fotop | banlek | fotto | foco-radical]       │
│           [portfolio-web]                                  │
│                                                           │
│ Data: [date]                                               │
│ Horário: [time]                                            │
│ Local: [location]                                          │
│ Notas: [notes]                                             │
│                                                           │
│  [Cancelar]  [Criar Shoot]                                │
└─────────────────────────────────────────────────────────────┘
```

- When `platformType = "photographer"`: shows all 5 platforms + portfolio-web
- When `platformType = "client"`: shows only fotop, banlek, fotto, foco radical
- The selected platform value is stored in `formData.platform` and persisted with the shoot

## Related

- `photographerPlatforms` constant defined in `src/lib/constants.tsx:135-141`:
  - portfolio-web, fotop, banlek, foco-radical, fotto
- Previously the platform field always showed all 5 options unconditionally