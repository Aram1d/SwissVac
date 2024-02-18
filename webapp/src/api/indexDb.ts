export function getIDB() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = window.indexedDB.open('swissVac', 1);
    request.readyState;
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains('VFRM')) db.createObjectStore('VFRM', { keyPath: 'rev' });
    };
  });
}

export async function listIDBManuals() {
  return new Promise<string[]>(async (resolve, reject) => {
    const db = await getIDB();
    const objectStore = db.transaction(['VFRM'], 'readonly').objectStore('VFRM');

    const request = objectStore.getAllKeys();
    request.onsuccess = () => resolve(request.result as string[]);
    request.onerror = () => reject(request.error);
  });
}

export async function getIDBManual(rev: string) {
  return new Promise<Blob | undefined>(async (resolve, reject) => {
    const db = await getIDB();
    const objectStore = db.transaction(['VFRM'], 'readonly').objectStore('VFRM');
    const request = objectStore.get(rev);

    request.onsuccess = () => resolve(request.result?.blob);
    request.onerror = () => reject(request.error);
  });
}

export async function storeIDBManual(manual: { rev: string; blob: Blob }) {
  return new Promise<IDBValidKey>(async (resolve, reject) => {
    const db = await getIDB();
    const objectStore = db.transaction(['VFRM'], 'readwrite').objectStore('VFRM');
    const request = objectStore.put(manual);

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export function deleteIDBManual(rev: string) {
  return new Promise<void>(async (resolve, reject) => {
    const db = await getIDB();
    const objectStore = db.transaction(['VFRM'], 'readwrite').objectStore('VFRM');
    const request = objectStore.delete(rev);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function dropDb() {
  return new Promise<IDBDatabase>(async (resolve, reject) => {
    const request = window.indexedDB.deleteDatabase('swissVac');
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}
