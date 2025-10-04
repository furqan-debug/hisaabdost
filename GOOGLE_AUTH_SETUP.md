# Google Authentication Setup Guide

This guide will help you configure native Google Sign-In for your mobile app.

## ✅ What's Already Done

- ✅ Installed `@codetrix-studio/capacitor-google-auth` package
- ✅ Added Google Sign-In buttons to Login and Sign-Up forms
- ✅ Configured Capacitor plugin in `capacitor.config.ts`
- ✅ Integrated native Google auth into the auth provider

## 🔧 Configuration Steps

### 1. Google Cloud Console Setup

#### A. Create OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project or create a new one
3. Go to **APIs & Services > Credentials**
4. Click **Create Credentials > OAuth Client ID**

#### B. Configure OAuth Consent Screen

1. Go to **OAuth consent screen**
2. Choose **External** user type
3. Fill in the required information:
   - App name: `hisaabdost`
   - User support email: Your email
   - Developer contact email: Your email
4. Add scopes:
   - `userinfo.email`
   - `userinfo.profile`
   - `openid`
5. Save and continue

#### C. Create Web Client ID (Required for both platforms)

1. Click **Create Credentials > OAuth Client ID**
2. Application type: **Web application**
3. Name: `hisaabdost Web Client`
4. Add authorized JavaScript origins:
   - `https://bklfolfivjonzpprytkz.supabase.co`
5. Add authorized redirect URIs:
   - `https://bklfolfivjonzpprytkz.supabase.co/auth/v1/callback`
6. **Save the Client ID** - you'll need this!

#### D. Create Android Client ID

1. Click **Create Credentials > OAuth Client ID**
2. Application type: **Android**
3. Name: `hisaabdost Android`
4. Package name: `com.hisaabdost.app`
5. **Get your SHA-1 certificate fingerprint:**
   
   For Debug keystore:
   ```bash
   keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
   ```
   
   For Release keystore (when publishing):
   ```bash
   keytool -list -v -keystore /path/to/your/release.keystore -alias your-key-alias
   ```

6. Enter the SHA-1 fingerprint
7. Click **Create**

#### E. Create iOS Client ID

1. Click **Create Credentials > OAuth Client ID**
2. Application type: **iOS**
3. Name: `hisaabdost iOS`
4. Bundle ID: `com.hisaabdost.app`
5. Click **Create**

### 2. Update Capacitor Configuration

Open `capacitor.config.ts` and replace `YOUR_WEB_CLIENT_ID.apps.googleusercontent.com` with your actual Web Client ID from step 1C:

```typescript
plugins: {
  GoogleAuth: {
    scopes: ['profile', 'email'],
    serverClientId: 'YOUR_ACTUAL_WEB_CLIENT_ID.apps.googleusercontent.com', // ← Update this
    forceCodeForRefreshToken: true,
  },
  // ... rest of config
}
```

### 3. Update Auth Provider

Open `src/lib/auth.tsx` and update line ~140 with your Web Client ID:

```typescript
await GoogleAuth.initialize({
  clientId: 'YOUR_ACTUAL_WEB_CLIENT_ID.apps.googleusercontent.com', // ← Update this
  scopes: ['profile', 'email'],
  grantOfflineAccess: true,
});
```

### 4. Configure Supabase

1. Go to [Supabase Dashboard](https://supabase.com/dashboard/project/bklfolfivjonzpprytkz)
2. Navigate to **Authentication > Providers**
3. Find **Google** provider and enable it
4. Add your credentials:
   - **Client ID**: Your Web Client ID from step 1C
   - **Client Secret**: Your Web Client Secret from step 1C
5. Add authorized redirect URL:
   - `https://bklfolfivjonzpprytkz.supabase.co/auth/v1/callback`
6. **Save**

### 5. Build and Test

1. **Sync Capacitor:**
   ```bash
   npx cap sync
   ```

2. **Build your project:**
   ```bash
   npm run build
   ```

3. **Run on Android:**
   ```bash
   npx cap run android
   ```

4. **Run on iOS:**
   ```bash
   npx cap run ios
   ```

## 🎯 Testing the Flow

### On Android/iOS Device:
1. Tap "Continue with Google" button
2. Native Google account picker appears (system UI - no browser!)
3. Select your Google account
4. App receives authentication
5. Redirects to dashboard

### Expected Behavior:
- ✅ No browser window opens
- ✅ Uses native system account picker
- ✅ Seamless in-app experience
- ✅ Fast authentication

## 🐛 Troubleshooting

### Error: "developer_error" or "10"
- **Cause**: SHA-1 fingerprint mismatch or missing Android OAuth client
- **Fix**: Verify your SHA-1 fingerprint and ensure you created an Android OAuth client

### Error: "12500: Sign in failed"
- **Cause**: Package name or SHA-1 doesn't match
- **Fix**: Double-check package name is `com.hisaabdost.app` and SHA-1 is correct

### Error: "popup_closed_by_user"
- **Cause**: User cancelled the sign-in
- **Fix**: This is expected behavior, no action needed

### No Google account picker appears
- **Cause**: Plugin not initialized or missing credentials
- **Fix**: Ensure `npx cap sync` was run and Client ID is configured correctly

### iOS Build Error
- **Cause**: Missing URL schemes in Info.plist
- **Fix**: The plugin should auto-configure this, but verify in Xcode:
  - Open iOS project in Xcode
  - Check Info.plist for URL Types
  - Should contain reversed Client ID

## 📝 Important Notes

1. **Web Client ID is required** for both Android and iOS (not just Android-specific client ID)
2. **SHA-1 fingerprints differ** between debug and release builds - you need both for production
3. **Test on real devices** - emulators may have issues with Google Play Services
4. The Google Sign-In flow is **completely native** - no browser windows involved!

## 📚 Additional Resources

- [Capacitor Google Auth Plugin Docs](https://github.com/CodetrixStudio/CapacitorGoogleAuth)
- [Google OAuth Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Supabase Auth Docs](https://supabase.com/docs/guides/auth/social-login/auth-google)

## ✨ What Users Will Experience

- **Professional native feel** - same as Gmail, Google Photos, etc.
- **Fast authentication** - leverages device's Google account
- **No context switching** - stays fully in your app
- **Secure** - native SDKs handle all tokens
- **Offline capable** - can use cached account selection
