
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.ccb1b3984ebf47e1ac451522f307f140',
  appName: 'hisaabdost',
  webDir: 'dist',
  bundledWebRuntime: false,
  // Server configuration for hot reload during development
  server: {
    url: "https://ccb1b398-4ebf-47e1-ac45-1522f307f140.lovableproject.com?forceHideBadge=true",
    cleartext: true
  },
  // Android specific optimizations
  android: {
    allowMixedContent: true,
    captureInput: true,
    // Improve initial loading performance
    initialFocus: false,
    // Optimize WebView
    webContentsDebuggingEnabled: false,
    // Optimize background behavior
    backgroundColor: "#ffffff",
    // Improve scroll performance
    overscrollHistory: false,
    // Optimize hardware acceleration
    hardwareAcceleration: "all",
    // Handle status bar properly
    navigationBarColor: "#ffffff",
    statusBarStyle: "dark",
    statusBarBackgroundColor: "#ffffff",
    statusBarOverlaysWebView: true,
    // Add keyboard resize mode for better input handling
    resizeOnFullScreen: true
  },
  // Enable persistent data caching and push notifications
  plugins: {
    CapacitorHttp: {
      enabled: true
    },
    // Improve caching for better offline capabilities
    WebView: {
      allowFileAccess: true,
      androidScheme: "https",
    },
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"]
    },
    // Add status bar configuration
    StatusBar: {
      style: "dark",
      backgroundColor: "#ffffff",
      overlaysWebView: true,
      animated: true
    },
    // Add keyboard configuration for better input visibility
    Keyboard: {
      resize: true,
      resizeOnFullScreen: true,
      style: "dark"
    },
    // Add Filesystem plugin configuration
    Filesystem: {
      androidRequestLegacyExternalStorage: true
    }
  }
};

export default config;
