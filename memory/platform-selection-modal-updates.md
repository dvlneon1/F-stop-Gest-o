# Platform Selection Modal Updates

**Updated**: 2026-11-11  
**Files Modified**: `src/components/NewShootModal.tsx`, `src/lib/constants.tsx`, `src/lib/i18n.ts`

## Summary

Completed the platform type selection feature for the New Shoot modal. All UI text is now fully in Portuguese.

## Changes Made

### 1. `src/components/NewShootModal.tsx`
- Added `platformType` state: `"photographer" | "client"` (defaults to `"photographer"`)
- Added platform type selector above the type field:
  - **[ photographer ] [ client ]** - toggles which platforms show
- The platform `Select` dynamically updates:
  - **Photographer**: Shows all 5 platforms + "Portfólio Web"
  - **Client**: Shows only: **fotop, banlek, fotto, foco radical**
- All text uses `t()` for i18n (Portuguese/English supported)
- Removed hardcoded English "Portfolio Web" → now `{t("form.platformPhotographer", lang)}`

### 2. `src/lib/constants.tsx`
- Changed `photographerPlatforms["portfolio-web"].label` from "Portfolio Web" to **"Portfólio Web"** (Portuguese)

### 3. `src/lib/i18n.ts`
- Added new keys (Portuguese):
  - `form.platformType` / `form.selectPlatformType`
  - `form.platformPhotographer` / `form.platformClient`
- Updated existing keys to Portuguese where needed

## Modal Flow

```
┌─────────────────────────────────────────────────────────┐
│ Novo Shoot                                              │
├─────────────────────────────────────────────────────────┤
│ Cliente: [select]                                      │
│ Tipo: [wedding | ... | event]                         │
│                                                       │
│ ⭓ TIPO DE PLATAFORMA ⭓           ← NEW                    │
│   [ photographer ] [ client ]                          │
│                                                       │
│ Plataforma: [fotop | banlek | ...]      ← MUDANÇA     │
│                                                       │
│ Data: [date] ...                                       │
│                                                       │
│  [Cancelar]  [Criar Shoot]                             │
└─────────────────────────────────────────────────────────┘
```

- When user selects **"Plataforma do Fotógrafo"**: vê todas as 5 plataformas do `photographerPlatforms` constante + portfolio-web
- Quando seleciona **"Plataforma do Cliente"**: vê apenas fotop, banlek, fotto, foco-radical

## Related

- `photographerPlatforms` em `src/lib/constants.tsx:135-141` agora tem labels em português
- O seletor foi adicionado como requested: usuário pode optar por cadastrar o shoot indicando se o evento está em uma plataforma ou como serviço para cliente