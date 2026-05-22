const DB_NAME = "xintab_app";
const DB_VERSION = 1;
const STORE_NAME = "assets";

export const APPEARANCE_BG_KEY = "appearance_bg";

function openDb(dbName: string): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(dbName, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function withStore<T>(
  dbName: string,
  mode: IDBTransactionMode,
  fn: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  const db = await openDb(dbName);
  try {
    return await new Promise<T>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, mode);
      const store = tx.objectStore(STORE_NAME);
      const req = fn(store);
      let result!: T;

      req.onsuccess = () => {
        result = req.result;
      };
      req.onerror = () => reject(req.error);
      tx.oncomplete = () => resolve(result);
      tx.onerror = () => reject(tx.error ?? new Error("IndexedDB transaction failed"));
      tx.onabort = () => reject(tx.error ?? new Error("IndexedDB transaction aborted"));
    });
  } finally {
    db.close();
  }
}

async function getFromDb(key: string, dbName: string): Promise<string | null> {
  const value = await withStore<unknown>(dbName, "readonly", (store) => store.get(key));
  return typeof value === "string" ? value : null;
}

export async function getBackgroundImageDataUrl(key: string): Promise<string | null> {
  return getFromDb(key, DB_NAME);
}

export async function setBackgroundImageDataUrl(key: string, dataUrl: string): Promise<void> {
  await withStore<IDBValidKey>(DB_NAME, "readwrite", (store) => store.put(dataUrl, key));
}

export async function removeBackgroundImage(key: string): Promise<void> {
  await withStore<undefined>(DB_NAME, "readwrite", (store) => store.delete(key));
}
