# FAB Visibility Bug - Round Button Appears Without Shoots

**Reported**: 2026-11-11  
**Status**: Investigated - condition appears correct in code, but behavior needs verification

## Summary

The rounded FAB (laranja) should only appear when `shoots.length > 0`, but users report it appears even when no shoots are registered.

## Code Analysis

The FAB visibility conditions are correctly implemented:

**Mobile** (`src/app/page.tsx:1193`):
```tsx
showFAB={isMobile && shoots.length > 0 && (currentTab === "today" || currentTab === "archive" || currentTab === "clients")}
```

**Desktop** (`src/app/page.tsx:1198`):
```tsx
{!isMobile && shoots.length > 0 && (
  <div className="fixed bottom-10 right-10 z-40">...
```

The `TabBar` component (`src/components/TabBar.tsx:38`) only renders the FAB when `showFAB` is `true`.

## Possible Causes

1. **Firestore has shoots for the user's UID** - If the user previously had shoots and they weren't deleted, they persist in `users/{uid}/shoots` collection. The Firestore subscription then returns them, making `shoots.length > 0` evaluate to `true`.

2. **State not updating correctly** - Potential race condition where `shoots` state hasn't synced from Firestore yet, or `pendingShootDeletes` filtering isn't working as expected.

3. **User sees empty UI but FAB shows** - The user may not notice shoots in the carousel/grid but the FAB condition still evaluates based on the `shoots` state array length.

## Investigation Notes

- `defaultShoots` constant in `src/lib/constants.tsx:165` is defined but **never imported or used** for seeding - it's just a type default.
- `WelcomeTour.tsx` does not create any Firestore data.
- The `pendingShootDeletes` filtering at `page.tsx:202-203` should prevent deleted shoots from appearing, but if the sync queue fails, shoots could reappear (related to known Bug 3: "clientes excluídos reaparecem").

## Recommended Next Steps

1. **Check Firebase Console**: Verify the `users/{uid}/shoots` collection for the logged-in user. If shoots exist, delete them and confirm the FAB disappears.

2. **Add debugging**: Temporarily log `shoots.length` to console to verify the actual state value when the FAB renders.

3. **Ensure clean state on login**: The `useEffect` at `page.tsx:176-259` correctly clears `shootsLocal` on logout (`setShootsLocal([])` at line 184), but on login it relies on the Firestore subscription to populate the state.

4. **This bug tracked** as a new item for the session's bug list. No code change needed yet - first verify the actual cause.

## Related Bugs in This Session

- Bug 3 (P0): Clientes excluídos reaparecem - same pattern of Firestore subscription + pending deletes
- Bug 1 (P1): Nova conta vem com dados preenchidos - related to initial state population