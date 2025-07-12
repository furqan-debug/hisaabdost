
# Android Build Fix for Duplicate Class Errors

## Steps to resolve duplicate class conflicts:

### 1. Clean the Android project
```bash
cd android
./gradlew clean
cd ..
```

### 2. Remove conflicting dependencies
If you have manually added any Google Play Services or AdMob dependencies to your Android project, remove them from:
- `android/app/build.gradle` (dependencies section)
- `android/variables.gradle`

### 3. Ensure only @capacitor-community/admob is handling AdMob
The @capacitor-community/admob plugin should be the ONLY source for AdMob functionality.

### 4. Sync and rebuild
```bash
npx cap sync android
npx cap run android
```

### 5. If issues persist, check these files:

#### android/app/build.gradle
Ensure no duplicate AdMob or Google Play Services dependencies:
```gradle
dependencies {
    // Remove any manual Google Play Services or AdMob dependencies like:
    // implementation 'com.google.android.gms:play-services-ads:...'
    // implementation 'com.google.firebase:firebase-ads:...'
}
```

#### android/variables.gradle
Should only contain Capacitor-managed versions:
```gradle
ext {
    minSdkVersion = 22
    compileSdkVersion = 33
    targetSdkVersion = 33
    androidxActivityVersion = '1.7.0'
    androidxAppCompatVersion = '1.6.1'
    androidxCoordinatorLayoutVersion = '1.2.0'
    androidxCoreVersion = '1.10.0'
    androidxFragmentVersion = '1.5.6'
    coreSplashScreenVersion = '1.0.0'
    androidxWebkitVersion = '1.6.1'
    junitVersion = '4.13.2'
    androidxJunitVersion = '1.1.5'
    androidxEspressoCoreVersion = '3.5.1'
    cordovaAndroidVersion = '10.1.1'
}
```

### 6. Force clean if needed
```bash
# Remove node_modules and reinstall
rm -rf node_modules
npm install

# Clean Android build completely
rm -rf android/app/build
rm -rf android/build
rm -rf android/.gradle

# Sync again
npx cap sync android
```

## Common Duplicate Class Sources:
- Multiple AdMob plugins installed
- Manual Google Play Services dependencies
- Conflicting Firebase/Google Services versions
- Old Cordova plugins mixed with Capacitor plugins

## Verification:
After following these steps, your build should succeed without duplicate class errors.
