import Dexie, { Table } from 'dexie';

// Define the offline data schemas
export interface OfflineExpense {
  id: string;
  user_id: string;
  amount: number;
  description: string;
  date: string;
  category: string;
  payment?: string;
  notes?: string;
  is_recurring?: boolean;
  receipt_url?: string;
  created_at: string;
  updated_at: string;
  sync_status: 'pending' | 'synced' | 'conflict';
  operation_type?: 'create' | 'update' | 'delete';
}

export interface OfflineBudget {
  id: string;
  user_id: string;
  amount: number;
  category: string;
  period: string;
  carry_forward?: boolean;
  monthly_income: number;
  created_at: string;
  updated_at: string;
  sync_status: 'pending' | 'synced' | 'conflict';
  operation_type?: 'create' | 'update' | 'delete';
}

export interface OfflineGoal {
  id: string;
  user_id: string;
  title: string;
  target_amount: number;
  current_amount: number;
  category: string;
  deadline: string;
  created_at: string;
  updated_at: string;
  sync_status: 'pending' | 'synced' | 'conflict';
  operation_type?: 'create' | 'update' | 'delete';
}

export interface OfflineWalletAddition {
  id: string;
  user_id: string;
  amount: number;
  description?: string;
  date: string;
  fund_type?: 'manual' | 'carryover';
  carryover_month?: string;
  is_deleted_by_user?: boolean;
  created_at: string;
  updated_at: string;
  sync_status: 'pending' | 'synced' | 'conflict';
  operation_type?: 'create' | 'update' | 'delete';
}

export interface SyncOperation {
  id: string;
  table_name: string;
  record_id: string;
  operation_type: 'create' | 'update' | 'delete';
  data: any;
  timestamp: string;
  retry_count: number;
  error_message?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
}

export interface AppMetadata {
  key: string;
  value: any;
  updated_at: string;
}

// Dexie database class
class OfflineDatabase extends Dexie {
  expenses!: Table<OfflineExpense>;
  budgets!: Table<OfflineBudget>;
  goals!: Table<OfflineGoal>;
  wallet_additions!: Table<OfflineWalletAddition>;
  sync_queue!: Table<SyncOperation>;
  metadata!: Table<AppMetadata>;

  constructor() {
    super('HisaabDostOfflineDB');
    
    this.version(1).stores({
      expenses: '++id, user_id, date, category, sync_status, created_at',
      budgets: '++id, user_id, category, sync_status, created_at',
      goals: '++id, user_id, category, sync_status, created_at',
      wallet_additions: '++id, user_id, date, sync_status, created_at',
      sync_queue: '++id, table_name, record_id, timestamp, status',
      metadata: '++key, updated_at'
    });
  }
}

export const offlineDB = new OfflineDatabase();

// Offline Storage Service
export class OfflineStorageService {
  private static instance: OfflineStorageService;

  static getInstance(): OfflineStorageService {
    if (!OfflineStorageService.instance) {
      OfflineStorageService.instance = new OfflineStorageService();
    }
    return OfflineStorageService.instance;
  }

  // Initialize the database
  async initialize(): Promise<void> {
    try {
      await offlineDB.open();
      console.log('Offline database initialized successfully');
    } catch (error) {
      console.error('Failed to initialize offline database:', error);
      throw error;
    }
  }

  // Generic CRUD operations
  async create<T>(table: string, data: T): Promise<string> {
    try {
      const timestamp = new Date().toISOString();
      const record = {
        ...data,
        created_at: timestamp,
        updated_at: timestamp,
        sync_status: 'pending' as const,
        operation_type: 'create' as const
      };

      const id = await (offlineDB as any)[table].add(record);
      
      // Add to sync queue
      await this.addToSyncQueue(table, id, 'create', record);
      
      return id;
    } catch (error) {
      console.error(`Failed to create record in ${table}:`, error);
      throw error;
    }
  }

  async read<T>(table: string, id: string): Promise<T | null> {
    try {
      const record = await (offlineDB as any)[table].get(id);
      return record || null;
    } catch (error) {
      console.error(`Failed to read record from ${table}:`, error);
      return null;
    }
  }

  async readAll<T>(table: string, userId?: string): Promise<T[]> {
    try {
      let collection = (offlineDB as any)[table];
      
      if (userId) {
        collection = collection.where('user_id').equals(userId);
      } else {
        collection = collection.toCollection();
      }
      
      return await collection.reverse().toArray();
    } catch (error) {
      console.error(`Failed to read records from ${table}:`, error);
      return [];
    }
  }

  async update<T>(table: string, id: string, data: Partial<T>): Promise<void> {
    try {
      const updateData = {
        ...data,
        updated_at: new Date().toISOString(),
        sync_status: 'pending' as const,
        operation_type: 'update' as const
      };

      await (offlineDB as any)[table].update(id, updateData);
      
      // Add to sync queue
      await this.addToSyncQueue(table, id, 'update', updateData);
    } catch (error) {
      console.error(`Failed to update record in ${table}:`, error);
      throw error;
    }
  }

  async delete(table: string, id: string): Promise<void> {
    try {
      await (offlineDB as any)[table].delete(id);
      
      // Add to sync queue
      await this.addToSyncQueue(table, id, 'delete', null);
    } catch (error) {
      console.error(`Failed to delete record from ${table}:`, error);
      throw error;
    }
  }

  // Query operations
  async query<T>(table: string, filter: (record: T) => boolean): Promise<T[]> {
    try {
      return await (offlineDB as any)[table].filter(filter).toArray();
    } catch (error) {
      console.error(`Failed to query records from ${table}:`, error);
      return [];
    }
  }

  // Sync queue operations
  async addToSyncQueue(table: string, recordId: string, operation: 'create' | 'update' | 'delete', data: any): Promise<void> {
    try {
      const syncOperation: SyncOperation = {
        id: crypto.randomUUID(),
        table_name: table,
        record_id: recordId,
        operation_type: operation,
        data,
        timestamp: new Date().toISOString(),
        retry_count: 0,
        status: 'pending'
      };

      await offlineDB.sync_queue.add(syncOperation);
    } catch (error) {
      console.error('Failed to add operation to sync queue:', error);
    }
  }

  async getPendingSyncOperations(): Promise<SyncOperation[]> {
    try {
      return await offlineDB.sync_queue
        .where('status')
        .anyOf(['pending', 'failed'])
        .toArray();
    } catch (error) {
      console.error('Failed to get pending sync operations:', error);
      return [];
    }
  }

  async updateSyncOperation(id: string, updates: Partial<SyncOperation>): Promise<void> {
    try {
      await offlineDB.sync_queue.update(id, updates);
    } catch (error) {
      console.error('Failed to update sync operation:', error);
    }
  }

  async deleteSyncOperation(id: string): Promise<void> {
    try {
      await offlineDB.sync_queue.delete(id);
    } catch (error) {
      console.error('Failed to delete sync operation:', error);
    }
  }

  // Metadata operations
  async setMetadata(key: string, value: any): Promise<void> {
    try {
      await offlineDB.metadata.put({
        key,
        value,
        updated_at: new Date().toISOString()
      });
    } catch (error) {
      console.error('Failed to set metadata:', error);
    }
  }

  async getMetadata(key: string): Promise<any> {
    try {
      const record = await offlineDB.metadata.get(key);
      return record?.value;
    } catch (error) {
      console.error('Failed to get metadata:', error);
      return null;
    }
  }

  // Utility methods
  async clearAll(): Promise<void> {
    try {
      await offlineDB.transaction('rw', offlineDB.tables, async () => {
        await Promise.all(offlineDB.tables.map(table => table.clear()));
      });
      console.log('All offline data cleared');
    } catch (error) {
      console.error('Failed to clear offline data:', error);
    }
  }

  async getStorageInfo(): Promise<{ totalRecords: number; pendingSync: number; storageSize: number }> {
    try {
      const tables = ['expenses', 'budgets', 'goals', 'wallet_additions'];
      const totalRecords = await Promise.all(
        tables.map(table => (offlineDB as any)[table].count())
      ).then(counts => counts.reduce((sum, count) => sum + count, 0));

      const pendingSync = await offlineDB.sync_queue
        .where('status')
        .equals('pending')
        .count();

      // Estimate storage size (rough calculation)
      const storageSize = totalRecords * 1024; // Rough estimate in bytes

      return { totalRecords, pendingSync, storageSize };
    } catch (error) {
      console.error('Failed to get storage info:', error);
      return { totalRecords: 0, pendingSync: 0, storageSize: 0 };
    }
  }
}
