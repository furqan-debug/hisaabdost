
# Android Permissions Required for AdMob

To ensure native ads work properly on Android devices, you need to add the following permissions to your `android/app/src/main/AndroidManifest.xml` file:

## Required Permissions

Add these permissions inside the `<manifest>` tag, before the `<application>` tag:

```xml
<!-- Required for internet access to load ads -->
<uses-permission android:name="android.permission.INTERNET" />

<!-- Required to check network connectivity -->
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />

<!-- Required for personalized ads (Android 13+) -->
<uses-permission android:name="com.google.android.gms.permission.AD_ID" />
```

## Complete AndroidManifest.xml Example

Your AndroidManifest.xml should look like this:

```xml
<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
    
    <!-- AdMob Required Permissions -->
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <uses-permission android:name="com.google.android.gms.permission.AD_ID" />
    
    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:theme="@style/AppTheme">
        
        <!-- Your app configuration -->
        
    </application>
</manifest>
```

## Important Notes

1. **INTERNET**: Essential for downloading ad content
2. **ACCESS_NETWORK_STATE**: Allows the app to check network connectivity before loading ads
3. **AD_ID**: Required for Android 13+ devices to access advertising ID for personalized ads

## Next Steps

After adding these permissions:

1. Run `npx cap sync android` to sync changes
2. Rebuild your Android app
3. Test native ads on your device

## Troubleshooting

If ads still don't show after adding permissions:

1. Check AdMob account status (must be "Ready")
2. Verify ad unit IDs are correct
3. Ensure your app is published or in testing mode in Google Play Console
4. Check device logs for specific AdMob error messages
