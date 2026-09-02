import SyncMap from "../drivers/SyncMap.js";
import * as trailingSlash from "../trailingSlash.js";
import hash from "./hash.js";

/**
 * Like Tree.manifest(), but specifically for sync trees.
 *
 * @returns {Map<string, string>}
 */
export default function syncManifest(map) {
  /** @type {Map<any, any>} */
  const result = new SyncMap();
  for (const [key, value] of map.entries()) {
    const manifestKey = trailingSlash.remove(String(key));
    /** @type{string|Map<string, string>} */
    const manifestValue = value?.manifest
      ? value.manifest()
      : value instanceof Map
        ? syncManifest(value)
        : hash(value, key);
    result.set(manifestKey, manifestValue);
  }
  return result;
}
