# New Account starts Empty

**Updated**: 2026-11-11  
**Related**: Bug 1 from FIX_PLAN.md - "Nova conta vem com dados preenchidos (deve vir vazia)"

## Summary

All new user accounts now start completely empty - no pre-filled data, no default clients, no default shoots.

## Changes Made

### 1. `src/app/page.tsx` - Profile initialization (lines 216-232)

**Before**: When a new user logs in with no Firestore profile, a default profile was created with:
- `name: ""`
- `email: authFirebaseUser.email || ""` (kept from Firebase Auth)
- `phone: ""`
- `cpf: ""`
- `address: ""`
- `photoURL: authFirebaseUser.photoURL || undefined`

**After**: Profile is completely empty:
- `name: ""`
- `email: ""` (cleared - no reference to Firebase Auth email)
- `phone: ""`
- `cpf: ""`
- `address: ""`
- `photoURL: undefined`

**Rationale**: Fully empty profile lets the user fill in their own data from scratch, without any pre-populated information.

### 2. `src/app/page.tsx` - Settings initialization (lines 234-243)

**Before**: Default settings were auto-saved to Firestore immediately on new login:
```typescript
saveSettings(userId, defaultSettings);
```

**After**: Default settings are set in local state but **NOT auto-saved** to Firestore:
```typescript
setSettingsLocal(defaultSettings);
// Don't auto-save - wait for user to change something and save manually
```

**Rationale**: Users can use the app with local settings defaults until they decide to change something and save manually. This prevents accidental data persistence before the user is ready.

## State Initialization Summary

| Data Type | Initial State | Persists from Previous Session? |
|-----------|--------------|--------------------------------|
| Shoots | `[]` (empty array) | Yes, from Firestore `users/{uid}/shoots` |
| Clients | `[]` (empty array) | Yes, from Firestore `users/{uid}/clients` |
| Profile | Empty object (all fields `""` or `undefined`) | Yes, from Firestore `users/{uid}` |
| Settings | Defaults: `lang: "pt"`, `theme: "system"` | Yes, from Firestore `settings/{uid}` (but new accounts start with these locals only) |
| Hide Financial Values | `false` | Yes, from Firestore `settings/{uid}` |

## User Flow

1. **New user signs up/in** → All state initializes empty
2. **User fills profile** → Edits profile modal, data saved to Firestore when user clicks save
3. **User adds clients** → Clicks "Novo Cliente", data saved when user saves
4. **User creates shoots** → Clicks "+" in FAB or elsewhere, data saved when user submits form
5. **User changes settings** → Makes changes, can save manually via backup/restore or settings save

## Related Bug Fix

This implements the fix for **Bug 1** from FIX_PLAN.md: "Nova conta vem com dados preenchidos (deve vir vazia)".

Previously, new accounts could come with pre-filled name/email from Firebase Auth or default settings saved to Firestore. Now, all accounts start completely fresh.