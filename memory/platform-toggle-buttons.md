# Platform Toggle Buttons in Shoot Modal

**Updated**: 2026-11-11  
**File Modified**: `src/components/NewShootModal.tsx`

## Summary

Replaced the `platformType` `Select` dropdown with two toggle buttons that switch the platform form section. When clicked, the platform `Select` below dynamically shows either photographer platforms or client platforms.

## Changes

### 1. `src/components/NewShootModal.tsx` (lines 120-138)

**Before**: A `Select` dropdown with two options:
```
[ Plataforma do Fotógrafo ] [ Plataforma do Cliente ]
```

**After**: Two toggle buttons:
```
[Plataforma do Fotógrafo] [Plataforma do Cliente]
```

- Both buttons are `variant="outline"`, `size="sm"`, `className="whitespace-nowrap flex-1"`
- On click, sets `formData.platformType` to `"photographer"` or `"client"`
- The platform `Select` below re-renders based on this state

### 2. How it works

```
┌─────────────────────────────────────────────────────────┐
│ Novo Shoot                                              │
├─────────────────────────────────────────────────────────┤
│ Cliente: [select]                                      │
│                                                       │
│ [Plataforma do Fotógrafo] [Plataforma do Cliente]      │   ← Dois botões toggle
│                                                       │
│ Plataforma: [fotop | banlek | fotto | foco-radical]   │   ← Muda ao clicar │
│                                                       │
│ Data: [date] ...                                       │
│                                                       │
│  [Cancelar]  [Criar Shoot]                             │
└─────────────────────────────────────────────────────────┘
```

- **Clicar em "Plataforma do Fotógrafo"**: o `Select` de plataforma abaixo mostra todas as 5 plataformas do `photographerPlatforms` constante + portfolio-web
- **Clicar em "Plataforma do Cliente"**: o `Select` de plataforma abaixo mostra apenas: fotop, banlek, fotto, foco radical
- O estado `formData.platformType` persiste entre as mudanças

### 3. Related

- `photographerPlatforms` em `src/lib/constants.tsx:135-141` define as 5 plataformas
- O seletor de plataforma abaixo ainda usa `formData.platform` para salvar a escolha
- Traduções via `t()` i18n (pt/en)