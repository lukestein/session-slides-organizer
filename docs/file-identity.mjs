// Tells whether two files are the same file, so dropping a session in twice —
// or dropping a ZIP over the loose decks it was built from — does not list
// every talk twice.
//
// Names are no use here: the export renames decks as it numbers them, and a
// title someone edited travels in the manifest. Content is the only honest
// answer, so this hashes the bytes. Size is checked first by the caller, which
// means the hash only runs when two files could actually be the same.

// Keyed on the File itself, so a file is read at most once however many times
// it is compared. The promise is cached, not the digest, so two comparisons
// racing on one file still only read it once.
const digests = new WeakMap();

function hex(buffer) {
  return Array.from(new Uint8Array(buffer), byte => byte.toString(16).padStart(2, "0")).join("");
}

/**
 * A string that is equal for two files exactly when their contents are.
 * Returns "" when the file cannot be read or hashed, which the caller should
 * read as "no opinion" rather than as a match.
 */
export function fingerprint(file) {
  let pending = digests.get(file);
  if (pending) return pending;
  pending = (async () => {
    // crypto.subtle is missing outside a secure context, which here means a
    // page opened straight off the disk. Nothing breaks; duplicates just stop
    // being noticed.
    if (!globalThis.crypto?.subtle) return "";
    try {
      return hex(await crypto.subtle.digest("SHA-256", await file.arrayBuffer()));
    } catch {
      // The file moved or was replaced since it was chosen.
      return "";
    }
  })();
  digests.set(file, pending);
  return pending;
}

/**
 * Finds the first of `candidates` holding the same bytes as `file`.
 * `candidates` are objects with a `file`; the size check in front keeps this
 * free for the ordinary case where nothing could match.
 */
export async function findDuplicate(file, candidates) {
  const rivals = candidates.filter(candidate => candidate.file?.size === file.size);
  if (!rivals.length) return null;
  const mark = await fingerprint(file);
  if (!mark) return null;
  for (const rival of rivals) {
    if (await fingerprint(rival.file) === mark) return rival;
  }
  return null;
}
