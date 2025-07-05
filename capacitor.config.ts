
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.hisaabdost.app',
  appName: 'hisaabdost',
  webDir: 'dist',
  bundledWebRuntime: false,
  
  // Server configuration - only enable for development
  // Comment out or remove the server config for production builds
  // server: {
  //   url: "https://ccb1b398-4ebf-47e1-ac45-1522f307f140.lovableproject.com?forceHideBadge=true",
  //   cleartext: true
  // },
  
  // Android specific optimizations
  android: {
    allowMixedContent: true,
    captureInput: true,
    initialFocus: false,
    webContentsDebuggingEnabled: false,
    backgroundColor: "#ffffff",
    overscrollHistory: false,
    hardwareAcceleration: "all",
    navigationBarColor: "#ffffff",
    statusBarStyle: "dark",
    statusBarBackgroundColor: "#ffffff",
    statusBarOverlaysWebView: true,
    resizeOnFullScreen: true
  },
  
  // Enhanced plugin configuration
  plugins: {
    CapacitorHttp: {
      enabled: true
    },
    WebView: {
      allowFileAccess: true,
      androidScheme: "https",
    },
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"]
    },
    StatusBar: {
      style: "dark",
      backgroundColor: "#ffffff",
      overlaysWebView: true,
      animated: true
    },
    Keyboard: {
      resize: true,
      resizeOnFullScreen: true,
      style: "dark"
    },
    // Enhanced Filesystem plugin configuration for Android
    Filesystem: {
      androidRequestLegacyExternalStorage: true,
      androidScheme: "https"
    },
    // Enhanced Share plugin configuration
    Share: {
      enabled: true
    },
    // App plugin for deep link handling
    App: {
      enabled: true
    },
    // AdMob configuration
    AdMob: {
      appId: "ca-app-pub-8996865130200922~6761545939",
      testingDevices: ["YOUR_DEVICE_ID"], // Add your test device ID here
      tagForChildDirectedTreatment: false,
      tagForUnderAgeOfConsent: false,
      maxAdContentRating: "G"
    }
  },
  
  // Deep link configuration
  server: {
    androidScheme: "https"
  }
};

export default config;
