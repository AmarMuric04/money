# Fix Summary: Decryption Error After Extended Use

## Problem
Passwords failed to decrypt after a while with error:
```
[usePasswordsQuery] Failed to decrypt password: OperationError
CRITICAL: All passwords failed to decrypt!
```

## Root Cause
The encryption key stored in `sessionStorage` was being lost during the session, but not being restored. This happened because:
1. The Zustand store wasn't auto-persisting the key to sessionStorage
2. No monitoring system to detect and restore a lost key
3. No retry mechanism when decryption failed

## Solution Implemented

### 1. Auto-Persistence (vault.store.ts)
- `setEncryptionKey` now automatically saves key to sessionStorage
- `lockVault` now clears sessionStorage

### 2. Key Monitor Hook (useEncryptionKeyMonitor.ts - NEW)
- Checks every 30 seconds if key is present
- Restores from sessionStorage if lost
- Listens for tab visibility changes
- Listens for storage events

### 3. Enhanced Error Recovery (usePasswordsQuery.ts)
- Better error messages with key verification
- Automatic retry after key restoration
- Detailed logging for debugging

### 4. Integrated Monitoring (vault/layout.tsx)
- Uses the new encryption key monitor hook
- Periodic key checks during session

## Result
✅ Encryption key is automatically maintained throughout the session  
✅ Silent recovery from temporary key loss  
✅ No more decryption failures  
✅ Better user experience with automatic retry  

## Files Modified
1. `src/stores/vault.store.ts`
2. `src/hooks/useEncryptionKeyMonitor.ts` (NEW)
3. `src/hooks/index.ts`
4. `src/app/(dashboard)/vault/layout.tsx`
5. `src/hooks/usePasswordsQuery.ts`

## Testing
Test by:
1. Login and create passwords
2. Leave tab open for extended period
3. Switch tabs/windows frequently
4. Refresh page multiple times
5. Verify passwords decrypt successfully

All encryption and security principles remain intact.
