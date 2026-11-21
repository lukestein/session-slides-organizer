// Keeps the list in this browser's own storage (IndexedDB), so a refresh, a
// crash or a closed tab on the room computer does not lose the running order.
// Nothing leaves the computer: this is the same storage any web page has, and
// only this site can read it.
//
// Files are written once each, under an id that stays with their row, and the
// list itself is a small record of ids, links and titles. Typing a title or
// dragging a row only rewrites that record, never the decks.

const databaseName = "session-slides-organizer";
const sessionKey = "current";
let opening;
// Ids of files already in storage, so a save only writes the new ones.
const stored = new Set();

function request(operation) {
  return new Promise((resolve, reject) => {
    operation.onsuccess = () => resolve(operation.result);
    operation.onerror = () => reject(operation.error);
  });
}

function open() {
  opening ??= new Promise((resolve, reject) => {
    const operation = indexedDB.open(databaseName, 1);
    operation.onupgradeneeded = () => {
      operation.result.createObjectStore("session");
      operation.result.createObjectStore("files");
    };
    operation.onsuccess = () => resolve(operation.result);
    operation.onerror = () => reject(operation.error);
    operation.onblocked = () => reject(new Error("Storage is blocked by another tab."));
  });
  opening.catch(() => { opening = undefined; });
  return opening;
}

function finished(transaction) {
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
    transaction.onabort = () => reject(transaction.error ?? new Error("Storage transaction aborted."));
  });
}

/**
 * The list saved by an earlier visit, as { zipName, savedAt, rows }, where each
 * row is { id, file, link, title }; or null when there is none or storage is
 * unavailable. A row whose file has gone missing comes back as its link alone,
 * or is dropped if it had no link.
 */
export async function loadSession() {
  try {
    const database = await open();
    const transaction = database.transaction(["session", "files"], "readonly");
    const record = await request(transaction.objectStore("session").get(sessionKey));
    if (!record?.rows?.length) return null;
    const files = transaction.objectStore("files");
    const rows = [];
    for (const row of record.rows) {
      const file = row.fileId ? await request(files.get(row.fileId)) : null;
      if (file) stored.add(row.fileId);
      if (!file && !row.link) continue;
      rows.push({ id: row.fileId && file ? row.fileId : row.id, file: file ?? null, link: row.link, title: row.title });
    }
    return { zipName: record.zipName ?? "", savedAt: record.savedAt ?? 0, rows };
  } catch {
    return null;
  }
}

/**
 * Saves the list: { zipName, rows: [{ id, file, link, title }] }. Returns true
 * once it is safely written, false if storage refused (full, blocked, or a
 * private window that allows none).
 */
export async function saveSession({ zipName, rows }) {
  try {
    const database = await open();
    const transaction = database.transaction(["session", "files"], "readwrite");
    const done = finished(transaction);
    const files = transaction.objectStore("files");
    const wanted = new Set();
    for (const row of rows) {
      if (!row.file) continue;
      wanted.add(row.id);
      if (!stored.has(row.id)) files.put(row.file, row.id);
    }
    for (const id of await request(files.getAllKeys())) {
      if (!wanted.has(id)) files.delete(id);
    }
    transaction.objectStore("session").put({
      zipName,
      savedAt: Date.now(),
      rows: rows.map(row => ({ id: row.id, fileId: row.file ? row.id : "", link: row.link, title: row.title })),
    }, sessionKey);
    await done;
    stored.clear();
    wanted.forEach(id => stored.add(id));
    return true;
  } catch {
    return false;
  }
}

/** Forgets the saved list and every file in it. */
export async function clearSession() {
  try {
    const database = await open();
    const transaction = database.transaction(["session", "files"], "readwrite");
    const done = finished(transaction);
    transaction.objectStore("session").clear();
    transaction.objectStore("files").clear();
    await done;
    stored.clear();
    return true;
  } catch {
    return false;
  }
}
