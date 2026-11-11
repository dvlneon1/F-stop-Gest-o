# Lente CRM - Bug Fix Plan

## Overview
This document outlines the fixes for all reported bugs in the current session.

---

## Bug 1: Nova conta vem com dados preenchidos (deve vir vazia)

**Severity:** High  
**File:** `src/app/page.tsx` (lines 207-222)

### Root Cause
When a new user logs in, `subscribeUserProfile` receives `null` (no Firestore document exists). The code then creates a default profile using `authFirebaseUser.displayName` and `authFirebaseUser.email` from Firebase Auth and immediately saves it to Firestore. This pre-fills the user's name/email from their Google/Firebase account.

### Fix
**Option A (Recommended):** Don't auto-create profile on first login. Let the user fill in their own data. Show empty profile initially.

**Option B:** Create profile but with empty fields (only photoURL from Firebase Auth if desired).

```typescript
// In page.tsx, replace lines 207-222 with:
const unsubProfile = subscribeUserProfile(userId, (data) => {
  if (data) {
    setUserProfileLocal(data);
  } else {
    // New user - start with EMPTY profile, let them fill it in
    const defaultProfile: UserProfileData = {
      name: "",
      email: authFirebaseUser.email || "", // Keep email for reference but don't show as editable?
      phone: "",
      cpf: "",
      address: "",
      photoURL: authFirebaseUser.photoURL || undefined,
    };
    setUserProfileLocal(defaultProfile);
    // DON'T auto-save to Firestore - wait for user to edit and save
  }
});
```

Also apply similar logic to settings (lines 224-233) - don't auto-save defaults, just use them locally until user changes something.

---

## Bug 2: Dados pessoais não editáveis

**Severity:** High  
**Files:** `src/components/ProfileEditModal.tsx`, `src/components/UserView.tsx`, `src/app/page.tsx`

### Root Cause
Multiple potential issues:
1. **Race condition**: `setUserProfile` wrapper uses `userProfile` from closure (stale due to `useCallback` deps), while Firestore subscription directly calls `setUserProfileLocal` bypassing the wrapper.
2. **Modal closes before async save completes**: `onClose()` called immediately after `onSubmit()`, but Firestore save is async. If save fails, user sees success toast but data not persisted.
3. **Subscription overwrites local changes**: If Firestore save fails, subscription may still fire with old data.

### Fix
1. **Fix the `setUserProfile` wrapper** to not depend on stale `userProfile` state:
```typescript
const setUserProfile = useCallback((value: UserProfileData | ((prev: UserProfileData) => UserProfileData)) => {
  setUserProfileLocal(prev => {
    const next = value instanceof Function ? value(prev) : value;
    // Save to Firestore using the NEW value
    if (authFirebaseUser) {
      if (isOnline) {
        saveUserProfile(authFirebaseUser.uid, next).catch(err => {
          console.error("[setUserProfile] Falha ao salvar perfil", err);
          showToast(tLang("toast.errorSaving"), "error");
          // Rollback on error
          setUserProfileLocal(prev); // Revert to previous
        });
      } else {
        enqueueOperation(authFirebaseUser.uid, {
          type: "update",
          collection: "profile",
          data: next,
          userId: authFirebaseUser.uid,
        });
        setPendingSyncCount(getPendingCount(authFirebaseUser.uid));
      }
    }
    return next;
  });
}, [authFirebaseUser, isOnline, showToast, tLang]);
```

2. **Change modal flow**: Only close modal AFTER successful save (or show error and keep open):
```typescript
// In ProfileEditModal handleSubmit:
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  const errors = validateProfileForm(formData);
  if (Object.keys(errors).length > 0) {
    setFormErrors(errors);
    return;
  }
  setFormErrors({});
  try {
    await onSubmit(formData); // Make onSubmit return a Promise
    onClose();
  } catch (err) {
    // Error already shown by setUserProfile
  }
};

// In page.tsx, make setUserProfile return a Promise:
const setUserProfile = useCallback(async (value: ...) => {
  // ... save logic with try/catch
  // Return Promise that resolves on success, rejects on error
}, [...]);
```

3. **Track pending profile changes** similar to `pendingShootChanges` to prevent subscription overwrites.

---

## Bug 3: Clientes excluídos reaparecem

**Severity:** High  
**Files:** `src/app/page.tsx` (confirmDelete function, subscribeClients), `src/lib/sync-queue.ts`

### Root Cause
When deleting a client:
1. Local state updated optimistically: `setClients(prev => prev.filter(...))`
2. Firestore delete initiated (or enqueued if offline)
3. **If Firestore delete fails** (network error), the offline queue enqueues it for retry
4. But the Firestore subscription is STILL active and returns the OLD data (client still exists in Firestore)
5. Subscription callback calls `setClientsLocal(data)` with old data → client reappears!

### Fix
**Track pending deletions** and ignore subscription updates for deleted items:

```typescript
// In page.tsx, add:
const [pendingClientDeletes, setPendingClientDeletes] = useState<Set<string>>(new Set());

// In confirmDelete for clients:
setPendingClientDeletes(prev => {
  const next = new Set(prev);
  next.add(pendingDelete.id);
  return next;
});

// In subscribeClients callback:
const unsubClients = subscribeClients(userId, (data) => {
  // Filter out any clients that we've optimistically deleted
  const filtered = data.filter(c => !pendingClientDeletes.has(c.id));
  setClientsLocal(filtered);
});

// In processSyncQueue, after successful delete:
removeOperation(userId, op.id);
setPendingClientDeletes(prev => {
  const next = new Set(prev);
  next.delete(op.data.id);
  return next;
});

// Also clear pending deletes on logout:
if (!justAuthenticated) {
  setPendingClientDeletes(new Set());
  // ... other cleanup
}
```

Apply same pattern for `shoots` and `expenses`.

---

## Bug 4: Botões com quebra de linha

**Severity:** Low  
**Files:** Multiple modal components (`DialogFooter`)

### Root Cause
Buttons in `DialogFooter` with `className="gap-2"` don't have `whitespace-nowrap` or `flex-shrink-0`, causing text to wrap on narrow screens.

### Fix
Add `whitespace-nowrap` to all Button components in DialogFooters, or add to DialogFooter className:

```tsx
<DialogFooter className="gap-2 flex-wrap">
  <Button type="button" variant="outline" onClick={onClose} className="whitespace-nowrap">
    {t("modal.cancel", lang)}
  </Button>
  <Button type="submit" form="formNewShoot" disabled={...} className="bg-amber-500 text-amber-950 hover:bg-amber-400 whitespace-nowrap">
    {editingShoot ? t("modal.save", lang) : t("modal.create", lang)}
  </Button>
</DialogFooter>
```

Or globally in CSS:
```css
.dialog-footer button { white-space: nowrap; }
```

---

## Bug 5: Formulários não salvam/fecha modal/dão toast

**Severity:** High  
**Files:** All modal components, `src/app/page.tsx` handlers

### Root Cause
Pattern across all modals:
1. Modal calls `onSubmit(data)` then immediately `onClose()`
2. `onSubmit` in page.tsx calls `setShoots`/`setClients`/`setExpenses` which fire async Firestore saves
3. Toast shown immediately ("success")
4. Modal closes
5. **If Firestore save fails**, user sees success toast but data not persisted. On refresh/re-sync, data is gone.

### Fix
**Make all saves async with proper error handling:**

1. **Change handler signatures to return Promises:**
```typescript
// In page.tsx
const handleNewShoot = async (data: Partial<Shoot>) => {
  const newShoot: Shoot = { ... };
  try {
    if (editingShoot) {
      await setShootsAsync(prev => prev.map(s => s.id === editingShoot.id ? { ...s, ...newShoot } : s));
      showToast("Shoot atualizado", "success");
    } else {
      await setShootsAsync(prev => [newShoot, ...prev]);
      showToast(tLang("toast.created"), "success");
    }
    setEditingShoot(null);
    return true; // Success
  } catch (err) {
    showToast(tLang("toast.errorSaving"), "error");
    return false; // Failure
  }
};

// Create async versions of setters:
const setShootsAsync = async (value: Shoot[] | ((prev: Shoot[]) => Shoot[])) => {
  const next = value instanceof Function ? value(shoots) : value;
  setShootsLocal(next);
  if (authFirebaseUser && isOnline) {
    // Save all changed items and wait for all
    await Promise.all(next.map(shoot => saveShootToFirestore(authFirebaseUser.uid, shoot, false)));
  }
  // If offline, queue handles it
};
```

2. **Update modals to wait for save before closing:**
```tsx
// In NewShootModal
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  const errors = validateShootForm(formData);
  if (Object.keys(errors).length > 0) {
    setShootFormErrors(errors);
    return;
  }
  setShootFormErrors({});
  const success = await onSubmit({ ...formData, id: editingShoot?.id || generateId() });
  if (success) onClose();
};
```

3. **Apply to all modals:** NewShootModal, ClientModal, NewExpenseModal, InvoiceModal, ProfileEditModal, ContractModal, QuestionnaireModal, GalleryModal.

---

## Bug 6: SettingsView Google Sheets usa localStorage em vez de Firestore

**Severity:** Medium  
**File:** `src/components/SettingsView.tsx` (lines 159-160)

### Root Cause
The Google Sheets export/import reads from localStorage (`lente_shoots_v1`, `lente_clients_v1`) but the app now uses Firestore as source of truth.

### Fix
Use the `shoots` and `clients` props passed to SettingsView:

```tsx
// Replace lines 159-160:
const [r1, r2] = await Promise.all([
  exportShootsToSheets({ apiKey: settings.sheetsApiKey, spreadsheetId: settings.sheetsSpreadsheetId }, shoots),
  exportClientsToSheets({ apiKey: settings.sheetsApiKey, spreadsheetId: settings.sheetsSpreadsheetId }, clients),
]);
```

And for import, after successful import, reload data from Firestore (or trigger a refresh).

---

## Bug 7: SettingsView clearAll usa window.location.reload()

**Severity:** Low  
**File:** `src/components/SettingsView.tsx` (line 37)

### Root Cause
`handleClearAllSettings` calls `window.location.reload()` which is a blunt reset. Doesn't clear Firestore data.

### Fix
Properly clear all user data from Firestore and reset local state:

```typescript
const handleClearAllSettings = async () => {
  setClearAllOpen(false);
  if (!userId) return;
  
  try {
    // Delete all subcollections
    // Note: This requires batch deletes or Cloud Function for subcollections
    // For now, show alert that this only clears local data
    alert("Use o painel do Firebase para limpar dados do servidor, ou implemente Cloud Function.");
  } catch (err) {
    console.error(err);
  }
};
```

Or implement proper clear using Firebase Admin SDK via Cloud Function.

---

## Additional Improvements

### 1. Add pending deletion tracking for all collections
- `pendingShootDeletes`, `pendingClientDeletes`, `pendingExpenseDeletes`
- Filter subscription updates
- Clear on successful sync

### 2. Make all Firestore setters return Promises
- `setShootsAsync`, `setClientsAsync`, `setExpensesAsync`, `setUserProfileAsync`, `setSettingsAsync`
- Proper error handling with rollback

### 3. Add loading states to modals
- Disable submit button while saving
- Show spinner

### 4. Fix i18n fallbacks
- Ensure all keys used in components exist in both `pt` and `en` objects

### 5. Add comprehensive error boundaries
- Catch render errors
- Show user-friendly error UI

---

## Implementation Priority

| Priority | Bug | Effort |
|----------|-----|--------|
| P0 | Bug 3: Deleted clients reappear | Medium |
| P0 | Bug 5: Forms don't save properly | Medium |
| P0 | Bug 2: Personal data not editable | Medium |
| P1 | Bug 1: New account pre-filled data | Low |
| P1 | Bug 6: SettingsView uses localStorage | Low |
| P2 | Bug 4: Button line breaks | Low |
| P2 | Bug 7: Clear all uses reload | Low |

---

## Testing Checklist

After implementing fixes:
- [ ] Create new account → profile should be empty (or only photo from Google)
- [ ] Edit profile → save → close modal → reopen → changes persisted
- [ ] Create client → delete client → refresh page → client stays deleted
- [ ] Create shoot → edit shoot → save → changes persisted
- [ ] Go offline → create/edit/delete → go online → sync works
- [ ] All modals show toast only after successful save
- [ ] Buttons don't wrap text on mobile
- [ ] SettingsView export/import uses Firestore data
- [ ] TypeScript compiles clean (`npx tsc --noEmit`)
- [ ] Impeccable detect passes (`npx impeccable detect`)
- [ ] Next build passes (`npm run build`)