import { StateStorage } from "zustand/middleware";

const DB_NAME = "cardtalk-db";
const STORE_NAME = "kv";
const DB_VERSION = 1;
const MIGRATED_KEY = "__idb_migrated__";

let dbPromise: Promise<IDBDatabase> | null = null;

function migrateLocalStorageToIDB(db: IDBDatabase): Promise<void> {
  return new Promise((resolve) => {
    try {
      const checkTx = db.transaction(STORE_NAME, "readonly");
      const checkReq = checkTx.objectStore(STORE_NAME).get(MIGRATED_KEY);
      checkReq.onsuccess = () => {
        if (checkReq.result) {
          resolve();
          return;
        }
        if (!localStorage || localStorage.length === 0) {
          try {
            const markTx = db.transaction(STORE_NAME, "readwrite");
            markTx.objectStore(STORE_NAME).put("1", MIGRATED_KEY);
            markTx.oncomplete = () => resolve();
            markTx.onerror = () => resolve();
          } catch {
            resolve();
          }
          return;
        }

        let migrated = 0;
        try {
          const writeTx = db.transaction(STORE_NAME, "readwrite");
          const store = writeTx.objectStore(STORE_NAME);
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (!key) continue;
            if (!key.includes("cardtalk")) continue;
            try {
              const val = localStorage.getItem(key);
              if (val !== null) {
                store.put(val, key);
                migrated++;
              }
            } catch {}
          }
          store.put("1", MIGRATED_KEY);
          writeTx.oncomplete = () => {
            console.log(`[idbStorage] 迁移了 ${migrated} 条数据从 localStorage 到 IndexedDB`);
            resolve();
          };
          writeTx.onerror = () => resolve();
        } catch {
          resolve();
        }
      };
      checkReq.onerror = () => resolve();
    } catch {
      resolve();
    }
  });
}

function openDB(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    req.onsuccess = async () => {
      const db = req.result;
      try {
        await migrateLocalStorageToIDB(db);
      } catch {}
      resolve(db);
    };
    req.onerror = () => reject(req.error);
  });

  return dbPromise;
}

export const idbStorage: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    try {
      const db = await openDB();
      const result = await new Promise<string | null>((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, "readonly");
        const req = tx.objectStore(STORE_NAME).get(name);
        req.onsuccess = () => resolve((req.result as string) ?? null);
        req.onerror = () => reject(req.error);
      });
      if (result !== null) return result;
      const lsVal = localStorage.getItem(name);
      if (lsVal !== null) {
        try {
          const tx = db.transaction(STORE_NAME, "readwrite");
          tx.objectStore(STORE_NAME).put(lsVal, name);
        } catch {}
        return lsVal;
      }
      return null;
    } catch {
      return localStorage.getItem(name);
    }
  },
  setItem: async (name: string, value: string): Promise<void> => {
    try {
      const db = await openDB();
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, "readwrite");
        tx.objectStore(STORE_NAME).put(value, name);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    } catch {
      try {
        localStorage.setItem(name, value);
      } catch {}
    }
  },
  removeItem: async (name: string): Promise<void> => {
    try {
      const db = await openDB();
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, "readwrite");
        tx.objectStore(STORE_NAME).delete(name);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    } catch {
      localStorage.removeItem(name);
    }
  },
};
