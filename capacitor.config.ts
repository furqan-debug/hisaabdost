
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.ccb1b3984ebf47e1ac451522f307f140',
  appName: 'hisaabdost',
  webDir: 'dist',
  plugins: {
    CapacitorURLScheme: {
      schemes: ['hisaabdost']
    },
    CapacitorHttp: {
      enabled: true
    }
  },
  server: {
    androidScheme: 'https'
  }
};

export default config;
