const DB_NAME = "LingoFlowOfflineDB";
const DB_VERSION = 1;

export function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains("vocabulary")) {
        db.createObjectStore("vocabulary", { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains("exercises")) {
        db.createObjectStore("exercises", { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains("pendingSync")) {
        db.createObjectStore("pendingSync", { keyPath: "id", autoIncrement: true });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveOfflineData(storeName, data) {
  try {
    const db = await openDB();
    const tx = db.transaction(storeName, "readwrite");
    const store = tx.objectStore(storeName);
    
    if (Array.isArray(data)) {
      data.forEach((item) => store.put(item));
    } else {
      store.put(data);
    }
    
    return true;
  } catch (err) {
    console.warn(`Failed to save to ${storeName}:`, err);
    return false;
  }
}

export async function getOfflineData(storeName) {
  try {
    const db = await openDB();
    const tx = db.transaction(storeName, "readonly");
    const store = tx.objectStore(storeName);
    
    return new Promise((resolve) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => resolve([]);
    });
  } catch (err) {
    console.warn(`Failed to read from ${storeName}:`, err);
    return [];
  }
}

export async function queuePendingSync(payload) {
  try {
    const db = await openDB();
    const tx = db.transaction("pendingSync", "readwrite");
    const store = tx.objectStore("pendingSync");
    store.add({ ...payload, timestamp: Date.now() });
    return true;
  } catch (err) {
    console.warn("Failed to queue pending sync:", err);
    return false;
  }
}
