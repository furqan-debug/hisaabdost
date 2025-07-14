import { supabase } from "@/integrations/supabase/client";
import type { ConnectionQuality } from "./types";

export class ConnectionUtils {
  static async detectConnectionQuality(): Promise<ConnectionQuality> {
    const startTime = Date.now();
    try {
      // Simple ping to detect connection quality
      await supabase.from('expenses').select('id').limit(1);
      const latency = Date.now() - startTime;
      
      return {
        isSlowConnection: latency > 2000, // Consider slow if > 2 seconds
        averageLatency: latency
      };
    } catch (error) {
      return {
        isSlowConnection: true,
        averageLatency: 5000
      };
    }
  }

  static getTimeoutForOperation(baseTimeout: number, connectionQuality: ConnectionQuality): number {
    // Adjust timeout based on connection quality
    if (connectionQuality.isSlowConnection) {
      return baseTimeout * 2; // Double timeout for slow connections
    }
    return baseTimeout;
  }
}