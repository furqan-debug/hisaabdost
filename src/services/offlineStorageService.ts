
import { Expense } from "@/components/expenses/types";
import { WalletAddition } from "@/hooks/useWalletAdditions";
import { Budget } from "@/pages/Budget";

export interface OfflineData {
  expenses: Expense[];
  walletAdditions: WalletAddition[];
  budgets: Budget[];
  goals: any[];
  lastSync: string;
}

const STORAGE_KEY = 'hisaabdost_offline_data';
const PENDING_SYNC_KEY = 'hisaabdost_pending_sync';

export class OfflineStorageService {
  private static instance: OfflineStorageService;
  
  static getInstance(): OfflineStorageService {
    if (!this.instance) {
      this.instance = new OfflineStorageService();
    }
    return this.instance;
  }

  // Get offline data
  getOfflineData(): OfflineData {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : this.getEmptyData();
    } catch (error) {
      console.error('Error reading offline data:', error);
      return this.getEmptyData();
    }
  }

  // Save data to offline storage
  saveOfflineData(data: Partial<OfflineData>): void {
    try {
      const existingData = this.getOfflineData();
      const updatedData = {
        ...existingData,
        ...data,
        lastSync: new Date().toISOString()
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedData));
      console.log('Data saved to offline storage');
    } catch (error) {
      console.error('Error saving offline data:', error);
    }
  }

  // Add item to pending sync queue
  addToPendingSync(type: 'expense' | 'wallet' | 'budget' | 'goal', item: any): void {
    try {
      const pending = this.getPendingSync();
      if (!pending[type]) {
        pending[type] = [];
      }
      pending[type].push({
        ...item,
        _offline_id: `offline_${Date.now()}_${Math.random()}`,
        _created_offline: true,
        _timestamp: new Date().toISOString()
      });
      localStorage.setItem(PENDING_SYNC_KEY, JSON.stringify(pending));
      console.log(`Added ${type} to pending sync:`, item);
    } catch (error) {
      console.error('Error adding to pending sync:', error);
    }
  }

  // Get pending sync items
  getPendingSync(): any {
    try {
      const data = localStorage.getItem(PENDING_SYNC_KEY);
      return data ? JSON.parse(data) : {};
    } catch (error) {
      console.error('Error reading pending sync data:', error);
      return {};
    }
  }

  // Clear pending sync after successful sync
  clearPendingSync(): void {
    try {
      localStorage.removeItem(PENDING_SYNC_KEY);
      console.log('Cleared pending sync data');
    } catch (error) {
      console.error('Error clearing pending sync:', error);
    }
  }

  // Check if we have pending data to sync
  hasPendingSync(): boolean {
    const pending = this.getPendingSync();
    return Object.keys(pending).some(key => pending[key]?.length > 0);
  }

  private getEmptyData(): OfflineData {
    return {
      expenses: [],
      walletAdditions: [],
      budgets: [],
      goals: [],
      lastSync: new Date().toISOString()
    };
  }

  // Clear all offline data
  clearOfflineData(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(PENDING_SYNC_KEY);
      console.log('Cleared all offline data');
    } catch (error) {
      console.error('Error clearing offline data:', error);
    }
  }
}

export const offlineStorage = OfflineStorageService.getInstance();
