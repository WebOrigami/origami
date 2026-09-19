import FileMap from "../src/drivers/FileMap.js";
import { SyncMap } from "../src/internal.js";
import asyncToSync from "./asyncToSync.js";

/**
 * Convert async source code to its synchronous equivalent.
 *
 * This uses the SyncMap and FileMap drivers, and `npm run build` will copy the
 * files using the `apply` operation. Beyond that, this avoids using other
 * higher-level map operations or Origami in order to avoid self-hosting issues.
 */
const asyncFilesUrl = new URL("../src/async", import.meta.url);
const asyncFiles = new FileMap(asyncFilesUrl);

const syncFiles = new SyncMap();
for (const [key, value] of asyncFiles) {
  const syncKey = key.replace("Async", "Sync");
  const syncValue = asyncToSync(value);
  syncFiles.set(syncKey, syncValue);
}

export default syncFiles;
