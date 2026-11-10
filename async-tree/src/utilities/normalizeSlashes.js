/**
 * Replace backslashes with forward slashes.
 *
 * To simplify handling file paths across different operating systems, and to
 * support the trailing slash convention consistently, this function normalizes
 * all backslashes to forward slashes.
 *
 * The resulting path can still be passed directly to the Node fs API even on
 * Windows, as the Windows file APIs generally treats forward slashes in paths
 * as backslashes.
 *
 * The result isn't a fully POSIX-compliant path, as it can still include drive
 * letters (`C:`) on Windows.
 */
export default function normalizeSlashes(filePath) {
  return filePath.replace(/\\/g, "/");
}
