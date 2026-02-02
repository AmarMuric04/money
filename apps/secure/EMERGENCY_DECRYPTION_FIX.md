# EMERGENCY FIX: All Passwords Failed to Decrypt

## The Real Problem

Your browser has the **WRONG encryption key** cached. This happens when:
- You logged in before passwords were created
- Browser cached an old key
- SessionStorage has stale data

## THE FIX (2 STEPS)

### Step 1: Clear Your Browser Storage

Open browser console (F12) and run:

```javascript
sessionStorage.clear();
localStorage.clear();
console.log('✅ Storage cleared!');
```

### Step 2: Log Out and Log Back In

1. **Click your profile icon** → Log out
2. **Log back in** with your email and password
3. **Done!** Your passwords will decrypt correctly now

## Why This Works

When you log in, the app:
1. Fetches your salt from the database
2. Derives the encryption key from your password + salt
3. Uses that key to decrypt your passwords

If the cached key is wrong/old, clearing storage forces a fresh login with the correct key derivation.

## Quick One-Liner Fix

Open console and paste this:

```javascript
sessionStorage.clear();
localStorage.clear();
alert('Storage cleared! Now click OK, log out, and log back in.');
```

Then just log out and back in. That's it!

## Still Not Working?

If you still see decryption errors after logging back in, it means the passwords were encrypted with a **different salt/key** (different user account or database).

In that case, the passwords are truly undecryptable and you need to:

1. Delete them: 
```javascript
fetch('/api/dev/delete-all-passwords', { method: 'DELETE', credentials: 'include' })
  .then(r => r.json())
  .then(d => console.log('✅ Deleted:', d.data.deletedCount, 'passwords'));
```

2. Log out and back in

3. Create new passwords

## Prevention

- **Don't** switch between accounts in the same browser session
- **Do** use separate emails for dev/prod (`you@email.com` vs `you+dev@email.com`)
- **Do** clear storage when switching accounts

---

## TL;DR

```javascript
// 1. Clear storage
sessionStorage.clear(); localStorage.clear();

// 2. Log out → Log in

// 3. Done! ✅
```
