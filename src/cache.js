export class BlackbirdCache {
  constructor(dbName = 'BlackbirdCacheDB', storeName = 'cachestore') {
    this.dbName = dbName;
    this.storeName = storeName;
    this.db = null;
  }

  _getDB() {
    // If db is present, resolve it immediately
    if (this.db) return Promise.resolve(this.db);

    const dbVersion = 1;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, dbVersion);
      let isUpgrading = false;

      request.onupgradeneeded = (event) => {
        isUpgrading = true;
        const db = event.target.result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName);
        }

        // Wait until the table is written to disk and completely unlocked
        request.transaction.oncomplete = () => {
          this.db = db;
          resolve(db);
        }
      };

      request.onsuccess = (event) => {
        const db = event.target.result;

        // Only resolve here if a schema upgrade isn't currently locking the DB
        if(!isUpgrading) {
          this.db = db;
          resolve(this.db);
        }
      };

      request.onerror = (event) => reject(event.target.error);
    });
  }

  async set(key, value, ttlInSeconds = null) {
    const db = await this._getDB();
    const expiresAt = ttlInSeconds ? Date.now() + (ttlInSeconds * 1000) : null;
    const payload = { value, expiresAt };

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.storeName, 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.put(payload, key);

      request.onsuccess = () => resolve(true);
      request.onerror = (event) => reject(event.target.error);

      transaction.onerror = (event) => reject(transaction.error || event.target.error);
      transaction.onabort = () => reject(new Error("Transaction aborted by database core layer."));
    });
  }

  async get(key) {
    const db = await this._getDB();

    const item = await new Promise((resolve, reject) => {
      const transaction = db.transaction(this.storeName, 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.get(key);

      request.onsuccess = () => resolve(request.result);
      request.onerror = (event) => reject(event.target.error);

      transaction.onerror = (event) => reject(transaction.error || event.target.error);
      transaction.onabort = () => reject(new Error("Transaction aborted by database core layer."));
    });

    if (!item) return null;

    if (item.expiresAt && Date.now() > item.expiresAt) {
      await this.del(key);
      return null;
    }

    return item.value;
  }

  async del(key) {
    const db = await this._getDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.storeName, 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.delete(key);

      request.onsuccess = () => resolve(true);
      request.onerror = (event) => reject(event.target.error);

      transaction.onerror = (event) => reject(transaction.error || event.target.error);
      transaction.onabort = () => reject(new Error("Transaction aborted by database core layer."));
    });
  }
}
