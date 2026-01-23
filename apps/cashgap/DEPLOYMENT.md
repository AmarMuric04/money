# Deployment Guide

## Vercel Deployment

### Environment Variables Configuration

You need to configure the following environment variables in your Vercel project settings:

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add the following variables:

#### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB connection string | `mongodb+srv://username:password@cluster.mongodb.net/cashgap` |
| `JWT_SECRET` | Secret for JWT tokens | Generate with `openssl rand -base64 32` |
| `JWT_REFRESH_SECRET` | Secret for refresh tokens | Generate with `openssl rand -base64 32` |
| `AUTH_SECRET` | NextAuth secret key | Generate with `openssl rand -base64 32` |
| `NEXT_PUBLIC_APP_URL` | Public URL of your app | `https://your-app.vercel.app` |
| `ALLOWED_ORIGIN` | CORS allowed origin | `https://your-app.vercel.app` |

#### Optional Variables (for additional features)

| Variable | Description | Required For |
|----------|-------------|--------------|
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | Google Sign-In |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | Google Sign-In |
| `SMTP_HOST` | SMTP server host | Email verification |
| `SMTP_PORT` | SMTP server port | Email verification |
| `SMTP_SECURE` | Use secure connection | Email verification |
| `SMTP_USER` | SMTP username | Email verification |
| `SMTP_PASSWORD` | SMTP password | Email verification |
| `SMTP_FROM` | Email sender address | Email verification |

### Setting up Google OAuth

1. Go to [Google Cloud Console](https://console.developers.google.com/apis/credentials)
2. Create a new OAuth 2.0 Client ID
3. Add authorized redirect URIs:
   - `https://your-app.vercel.app/api/auth/callback/google`
4. Copy the Client ID and Client Secret to Vercel

### Setting up SMTP (Gmail Example)

1. Enable 2-factor authentication on your Gmail account
2. Go to [App Passwords](https://myaccount.google.com/apppasswords)
3. Generate a new app password for "Mail"
4. Use these settings in Vercel:
   - `SMTP_HOST`: `smtp.gmail.com`
   - `SMTP_PORT`: `587`
   - `SMTP_SECURE`: `false`
   - `SMTP_USER`: Your Gmail address
   - `SMTP_PASSWORD`: The generated app password

### Deployment Checklist

- [ ] MongoDB database created and connection string configured
- [ ] All required environment variables added to Vercel
- [ ] Google OAuth credentials configured (if using Google Sign-In)
- [ ] SMTP credentials configured (if using email verification)
- [ ] `NEXT_PUBLIC_APP_URL` and `ALLOWED_ORIGIN` set to production URL
- [ ] Deploy and test authentication flow
- [ ] Verify email sending works (if configured)

### Troubleshooting

**Build fails with "Missing environment variable" warnings:**
- These warnings are expected if you're not using all features
- The app will still build if required variables (`MONGODB_URI`, `JWT_SECRET`, etc.) are configured

**Google Sign-In not working:**
- Verify redirect URI matches exactly: `https://your-domain.com/api/auth/callback/google`
- Check that Google OAuth credentials are correct

**Emails not sending:**
- Verify SMTP credentials are correct
- For Gmail, ensure you're using an App Password, not your regular password
- Check SMTP_PORT and SMTP_SECURE settings match your provider
