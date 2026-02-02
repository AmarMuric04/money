# Fix: Decryption Error Between Production and Development

## Problem
You created passwords in **production**, but when you try to access them in **development**, you get:
```
[usePasswordsQuery] CRITICAL: All passwords failed to decrypt!
OperationError
```

## Root Cause

**Different databases have different user salts**, even for the same email:

```
Production DB: user@email.com → salt: abc123 → encryption key: XYZ
Development DB: user@email.com → salt: def456 → encryption key: ABC
                                                    ^^^^^^^^^ DIFFERENT!
```

Production passwords encrypted with key `XYZ` **cannot** be decrypted with key `ABC`.

## Why This Happens

The encryption key is derived from:
```
encryptionKey = PBKDF2(masterPassword + userSalt)
```

- ✅ Same email
- ✅ Same password  
- ❌ **Different salt in different databases** = Different encryption key

## Solution Options

### Option 1: Browser Console (FASTEST) ⚡

1. **Navigate to** http://localhost:3000/vault (make sure you're logged in)
2. **Open browser console** (F12 or Cmd+Option+J)
3. **Paste and run:**

```javascript
fetch('/api/dev/delete-all-passwords', { 
  method: 'DELETE', 
  credentials: 'include' 
})
.then(r => r.json())
.then(data => {
  console.log('✅', data.data.message);
  console.log('📊 Deleted:', data.data.deletedCount, 'passwords');
  sessionStorage.clear();
  localStorage.clear();
  console.log('✅ Storage cleared!');
  console.log('📋 Now: Log out → Log in → Create new passwords');
})
.catch(err => console.error('❌', err));
```

4. **Log out and log back in**
5. **Create new passwords** - they'll work perfectly!

### Option 2: Use Separate Emails (RECOMMENDED FOR FUTURE)

Keep environments isolated:
- **Production**: `your.email@example.com`
- **Development**: `dev@example.com` or `your.email+dev@example.com`

This way passwords never conflict.

### Option 3: Clear Entire Dev Database

If you want a completely fresh start:

```bash
cd /Users/amarmuric/VSCode/money
npm run clear-db
```

⚠️ This deletes ALL dev data (users, passwords, categories, etc.)

## What NOT to Do

❌ **Don't** try to copy production passwords to dev  
❌ **Don't** try to sync encryption keys between environments  
❌ **Don't** delete production data to fix dev issues  

## Understanding the Security

This issue proves your encryption is working correctly! 

- ✅ **Zero-knowledge**: Different salts = different keys
- ✅ **User-specific**: Even same email can't decrypt others' data
- ✅ **Database-isolated**: Production/dev can't cross-decrypt

This is a **feature**, not a bug. It means your passwords are truly secure.

## Prevention

Going forward, use **different accounts** for different environments:

```bash
# Production
Email: john@company.com
Master Password: [your production password]

# Development  
Email: john+dev@company.com
Master Password: devpassword123

# Local Testing
Email: test@local.dev
Master Password: test123
```

## Technical Details

### Why can't we just "fix" the encryption?

1. **Salt is random** (stored in database with user)
2. **Encryption key is derived** from password + salt
3. **Different salt = different key** (by design)
4. **Can't decrypt without exact same key**

This is **PBKDF2** working as intended:
```
User Registration:
  1. Generate random salt (32 bytes)
  2. Derive key: PBKDF2(password, salt, 210000 iterations)
  3. Store salt in database
  4. Use key for encryption (never stored)

User Login:
  1. Fetch salt from database
  2. Derive key: PBKDF2(password, salt, 210000 iterations)
  3. Use key for decryption
  
If salt is different → key is different → decryption fails ✅
```

## Files Referenced

- `/api/dev/delete-all-passwords` - Dev-only endpoint to clear passwords
- `apps/secure/DELETE_PASSWORDS_INSTRUCTIONS.md` - Detailed instructions
- `scripts/fix-dev-decryption.sh` - Automated fix script

## Summary

**Quickest Fix**: Use Option 1 (browser console) - takes 30 seconds!

This isn't a bug, it's proof your zero-knowledge encryption is working. Production and development are properly isolated, which is exactly what you want for security.
