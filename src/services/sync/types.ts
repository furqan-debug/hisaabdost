export interface ConnectionQuality {
  isSlowConnection: boolean;
  averageLatency: number;
}

export interface SupabaseResponse<T = any> {
  data: T | null;
  error: any;
}

export interface PendingData {
  expense?: any[];
  wallet?: any[];
  budget?: any[];
}

export interface SyncResult {
  success: boolean;
  syncCount: number;
}