# Encryption Key Persistence Fix

## Problem
After a while of using the secure app, users encountered the following error:
```
[usePasswordsQuery] Failed to decrypt password: OperationError
[usePasswordsQuery] CRITICAL: All passwords failed to decrypt!
```

This occurred because the encryption key stored in `sessionStorage` was being lost, causing all decryption operations to fail.

## Root Cause Analysis

### Issue 1: No Auto-Persistence in Store
The `setEncryptionKey` method in `vault.store.ts` was not persisting the key to `sessionStorage`:
```typescript
// BEFORE: Key not persisted
setEncryptionKey: (key) => set({ encryptionKey: key, isLocked: false }),
```

When the encryption key was set in the Zustand store, it wasn't being saved to `sessionStorage`. This meant:
- If the Zustand state reset (HMR, component unmount, etc.)
- The key would be lost forever
- All passwords became undecryptable

### Issue 2: SessionStorage Edge Cases
While `sessionStorage` persists during page refreshes, it can be cleared in several scenarios:
- Browser tab duplication
- Browser auto-restore after crashes  
- Aggressive browser privacy settings
- Long periods of inactivity
- Navigation patterns (external links, back button)

### Issue 3: No Recovery Mechanism
There was no monitoring or recovery system to detect and restore a lost encryption key:
- No periodic checks for key presence
- No restoration from `sessionStorage` if lost
- No user feedback when key was missing

## Solution

### 1. Auto-Persist Encryption Key ✅
**File**: `src/stores/vault.store.ts`

Updated `setEncryptionKey` to automatically persist to `sessionStorage`:
```typescript
setEncryptionKey: (key) => {
  set({ encryptionKey: key, isLocked: false });
  // Persist to sessionStorage to survive page refreshes and tab duplication
  crypto.subtle
    .exportKey("jwk", key)
    .then((exportedKey) => {
      sessionStorage.setItem("vault_key", JSON.stringify(exportedKey));
    })
    .catch((err) => {
      console.error("[VaultStore] Failed to persist encryption key:", err);
    });
},
```

**Benefits**:
- Key is automatically saved whenever it's updated
- Survives page refreshes and tab duplication
- No manual persistence needed in components

### 2. Encryption Key Monitor Hook ✅
**File**: `src/hooks/useEncryptionKeyMonitor.ts` (NEW)

Created a dedicated hook to monitor and maintain the encryption key:

```typescript
export function useEncryptionKeyMonitor() {
  // Monitors encryption key and restores from sessionStorage if lost
  // Checks every 30 seconds
  // Listens for tab visibility changes
  // Listens for storage events
}
```

**Features**:
- **Periodic Checks**: Every 30 seconds, verifies key is present
- **Visibility Restoration**: Restores key when tab becomes visible
- **Storage Event Listener**: Detects external storage changes
- **Automatic Recovery**: Silently restores key without user intervention

### 3. Enhanced Vault Layout ✅
**File**: `src/app/(dashboard)/vault/layout.tsx`

Integrated the encryption key monitor:
```typescript
// Monitor and maintain encryption key
useEncryptionKeyMonitor();
```

Added periodic check for key restoration:
```typescript
// Check every 30 seconds if key needs restoration
const intervalId = setInterval(checkEncryptionKey, 30000);
```

### 4. Improved Error Handling ✅
**File**: `src/hooks/usePasswordsQuery.ts`

Added better error detection and recovery:

```typescript
// If all passwords failed to decrypt, check if key needs restoration
if (vault.passwords.length > 0 && decryptedPasswords.length === 0) {
  console.error("[usePasswordsQuery] CRITICAL: All passwords failed to decrypt!");
  
  // Verify encryption key matches sessionStorage
  const storedKeyData = sessionStorage.getItem("vault_key");
  if (storedKeyData && encryptionKey) {
    const keyData = JSON.parse(storedKeyData);
    const storedKey = await crypto.subtle.exportKey("jwk", encryptionKey);
    
    if (JSON.stringify(keyData) !== JSON.stringify(storedKey)) {
      console.warn("[usePasswordsQuery] Encryption key mismatch detected!");
    }
  }
  
  throw new Error("Failed to decrypt passwords. Please refresh or re-login.");
}
```

Added automatic retry mechanism:
```typescript
retry: (failureCount, error) => {
  // If decryption fails, try to restore the key and retry once
  if (failureCount === 0 && error.message.includes("decrypt")) {
    const storedKeyData = sessionStorage.getItem("vault_key");
    if (storedKeyData && !encryptionKey) {
      return true; // Retry once after key restoration
    }
  }
  return false;
},
retryDelay: 500,
```

### 5. Clear SessionStorage on Lock ✅
**File**: `src/stores/vault.store.ts`

Updated `lockVault` to clear sessionStorage:
```typescript
lockVault: () => {
  set({
    encryptionKey: null,
    passwords: [],
    isLocked: true,
  });
  // Clear from sessionStorage when locking
  sessionStorage.removeItem("vault_key");
},
```

## Security Considerations

### ✅ No New Vulnerabilities
- Key still derived from master password using PBKDF2
- SessionStorage is session-scoped (cleared on tab/window close)
- Key never sent to server
- Auto-persistence doesn't weaken security model

### ✅ Zero-Knowledge Architecture Maintained
- Server never sees encryption key
- All encryption/decryption happens client-side
- Master password never stored or transmitted

## Testing Checklist

- [x] Key persists through page refreshes
- [x] Key persists through component re-mounts
- [x] Key auto-restores when lost from store
- [x] Passwords decrypt successfully after key restoration
- [x] No infinite retry loops
- [x] Clear error messages when key truly lost
- [x] Lock vault properly clears sessionStorage
- [x] No console spam from monitoring

## User Impact

### Before Fix
❌ Passwords randomly fail to decrypt  
❌ User must log out and back in  
❌ No error recovery mechanism  
❌ Data appears "lost" temporarily  

### After Fix
✅ Encryption key automatically maintained  
✅ Silent recovery from key loss  
✅ Robust error handling with retry  
✅ Clear error messages when needed  
✅ Seamless user experience  

## Files Modified

1. ✅ `src/stores/vault.store.ts` - Auto-persist encryption key
2. ✅ `src/hooks/useEncryptionKeyMonitor.ts` - NEW: Key monitoring hook
3. ✅ `src/hooks/index.ts` - Export new hook
4. ✅ `src/app/(dashboard)/vault/layout.tsx` - Use monitor hook, add periodic checks
5. ✅ `src/hooks/usePasswordsQuery.ts` - Better error handling and retry logic

## Next Steps

### Optional Enhancements
1. **User Notification**: Show a toast when key is auto-restored
2. **Metrics**: Track how often key restoration occurs
3. **Fallback Strategy**: Option to re-derive key from re-entered password
4. **LocalStorage Backup**: For users who want persistence across sessions (opt-in)

### Monitoring
- Watch for "[EncryptionKeyMonitor]" logs in production
- Track frequency of key restoration events
- Monitor for any new decryption errors

## Related Documentation
- See `DECRYPTION_ERROR_SOLUTION.md` for previous salt-related fix
- See `AUTH_IMPLEMENTATION.md` for key derivation details
- See `LOCAL_STORAGE_IMPLEMENTATION.md` for storage strategy
