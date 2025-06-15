
interface OfflineDataItem {
  id: string;
  data: any;
  timestamp: number;
  type: 'expense' | 'budget' | 'wallet-addition';
  action: 'create' | 'update' | 'delete';
}

class OfflineStorage {
  private dbName = 'hisaabdost-offline';
  private version = 1;
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Create offline data store
        if (!db.objectStoreNames.contains('offline-data')) {
          const store = db.createObjectStore('offline-data', { keyPath: 'key' });
          store.createIndex('timestamp', 'timestamp', { unique: false });
        }
        
        // Create cached data store
        if (!db.objectStoreNames.contains('cached-data')) {
          const cacheStore = db.createObjectStore('cached-data', { keyPath: 'key' });
          cacheStore.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };
    });
  }

  async storeOfflineAction(item: OfflineDataItem): Promise<void> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['offline-data'], 'readwrite');
      const store = transaction.objectStore('offline-data');
      
      // Get existing pending actions
      const getRequest = store.get(`pending-${item.type}s`);
      
      getRequest.onsuccess = () => {
        const existing = getRequest.result?.data || [];
        existing.push(item);
        
        const putRequest = store.put({
          key: `pending-${item.type}s`,
          data: existing,
          timestamp: Date.now()
        });
        
        putRequest.onsuccess = () => resolve();
        putRequest.onerror = () => reject(putRequest.error);
      };
      
      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  async getPendingActions(type: string): Promise<OfflineDataItem[]> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['offline-data'], 'readonly');
      const store = transaction.objectStore('offline-data');
      const request = store.get(`pending-${type}s`);
      
      request.onsuccess = () => {
        resolve(request.result?.data || []);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async clearPendingActions(type: string): Promise<void> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['offline-data'], 'readwrite');
      const store = transaction.objectStore('offline-data');
      const request = store.delete(`pending-${type}s`);
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async cacheData(key: string, data: any): Promise<void> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['cached-data'], 'readwrite');
      const store = transaction.objectStore('cached-data');
      const request = store.put({
        key,
        data,
        timestamp: Date.now()
      });
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getCachedData(key: string): Promise<any> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['cached-data'], 'readonly');
      const store = transaction.objectStore('cached-data');
      const request = store.get(key);
      
      request.onsuccess = () => {
        const result = request.result;
        // Return data if it exists and is less than 24 hours old
        if (result && (Date.now() - result.timestamp) < 24 * 60 * 60 * 1000) {
          resolve(result.data);
        } else {
          resolve(null);
        }
      };
      request.onerror = () => reject(request.error);
    });
  }
}

export const offlineStorage = new OfflineStorage();
